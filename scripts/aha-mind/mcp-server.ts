import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import { stringify } from "csv-stringify/sync";
import { crawl } from "./docs_crawler_agent/crawler.js";
import { listCrawledFiles } from "./docs_crawler_agent/file-writer.js";
import { buildGraph as buildRoadmapGraph } from "./roadmap_crawler_agent/graph.js";

// Khởi tạo MCP Server
const server = new Server(
  {
    name: "aha-mind-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Khai báo các Tools cho Gemini/Claude
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "read_pdf_directory",
        description: "Đọc tất cả các file PDF trong một thư mục và trả về nội dung text.",
        inputSchema: {
          type: "object",
          properties: {
            directoryPath: {
              type: "string",
              description: "Đường dẫn tuyệt đối hoặc tương đối tới thư mục chứa PDF",
            },
          },
          required: ["directoryPath"],
        },
      },
      {
        name: "crawl_docs",
        description:
          "Crawl một website documentation và lưu toàn bộ trang con thành Markdown files. Chỉ crawl các link cùng domain và cùng path prefix với URL đầu vào.",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description:
                "URL bắt đầu crawl (ví dụ: https://docs.example.com/guide)",
            },
            outputDir: {
              type: "string",
              description:
                "Đường dẫn thư mục để lưu markdown files (ví dụ: ./data/docs/example)",
            },
            maxPages: {
              type: "number",
              description: "Số trang tối đa cần crawl (default: 200)",
            },
            delayMs: {
              type: "number",
              description:
                "Delay giữa các request (milliseconds, default: 800)",
            },
          },
          required: ["url", "outputDir"],
        },
      },
      {
        name: "list_crawled_docs",
        description:
          "Liệt kê tất cả file markdown đã crawl trong một thư mục output.",
        inputSchema: {
          type: "object",
          properties: {
            outputDir: {
              type: "string",
              description: "Đường dẫn thư mục output cần kiểm tra",
            },
          },
          required: ["outputDir"],
        },
      },
      {
        name: "save_questions_csv",
        description: "Lưu một mảng các câu hỏi (JSON) vào file CSV.",
        inputSchema: {
          type: "object",
          properties: {
            outputPath: {
              type: "string",
              description: "Đường dẫn file CSV sẽ lưu (ví dụ data/dump/output/questions.csv)",
            },
            questions: {
              type: "array",
              description: "Mảng chứa các object câu hỏi (question_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, domain, difficulty, source_file)",
              items: {
                type: "object",
                additionalProperties: true
              }
            }
          },
          required: ["outputPath", "questions"],
        },
      },
      {
        name: "crawl_roadmaps",
        description:
          "Crawl dữ liệu lộ trình kỹ thuật từ roadmap.sh (qua GitHub repo nilbuild/developer-roadmap), phân loại vào 4 nhóm và lưu thành các file JSON.",
        inputSchema: {
          type: "object",
          properties: {
            slugs: {
              type: "array",
              items: { type: "string" },
              description:
                "Danh sách các slug roadmap cần crawl (vd: ['frontend', 'backend', 'nextjs']). Để trống để crawl tất cả.",
            },
            outputDir: {
              type: "string",
              description:
                "Thư mục lưu trữ dữ liệu (mặc định: ./sources/roadmap-data)",
            },
            dryRun: {
              type: "boolean",
              description:
                "Chỉ kiểm tra và log thông tin, không ghi file ra đĩa (mặc định: false)",
            },
          },
        },
      },
      {
        name: "list_roadmap_data",
        description:
          "Đọc danh sách tổng hợp và thông tin chi tiết các roadmaps đã crawl trong thư mục output (từ index.json).",
        inputSchema: {
          type: "object",
          properties: {
            outputDir: {
              type: "string",
              description:
                "Đường dẫn thư mục lưu trữ (mặc định: ./sources/roadmap-data)",
            },
          },
        },
      }
    ],
  };
});

// Xử lý logic khi Gemini/Claude gọi Tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // --- Tool: crawl_docs ---
  if (request.params.name === "crawl_docs") {
    const { url, outputDir, maxPages = 200, delayMs = 800 } =
      request.params.arguments as {
        url: string;
        outputDir: string;
        maxPages?: number;
        delayMs?: number;
      };

    const absOutputDir = path.resolve(process.cwd(), outputDir);

    try {
      const progressLog: string[] = [];

      const result = await crawl(
        { startUrl: url, outputDir: absOutputDir, maxPages, delayMs },
        (progress) => {
          if (progress.savedPath) {
            progressLog.push(
              `✅ [${progress.current}] ${progress.currentUrl} → ${path.basename(progress.savedPath)}`
            );
          } else if (progress.skipped) {
            progressLog.push(`⚠️  [${progress.current}] SKIP: ${progress.currentUrl}`);
          }
        }
      );

      const summary = [
        `✅ Crawl hoàn thành!`,
        `📄 Đã crawl: ${result.totalCrawled} trang`,
        `⚠️  Đã skip: ${result.totalSkipped} trang`,
        `📁 Output: ${absOutputDir}`,
        `⏱️  Thời gian: ${(result.duration / 1000).toFixed(1)}s`,
        ``,
        `--- Chi tiết (${progressLog.length} entries) ---`,
        ...progressLog.slice(0, 50), // Giới hạn log để tránh overflow
      ];

      if (result.errors.length > 0) {
        summary.push(``, `❌ Lỗi:`);
        for (const err of result.errors.slice(0, 10)) {
          summary.push(`  - ${err.url}: ${err.error}`);
        }
      }

      return { content: [{ type: "text", text: summary.join("\n") }] };
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Lỗi crawl: ${err instanceof Error ? err.message : String(err)}`,
          },
        ],
      };
    }
  }

  // --- Tool: list_crawled_docs ---
  if (request.params.name === "list_crawled_docs") {
    const { outputDir } = request.params.arguments as { outputDir: string };
    const absDir = path.resolve(process.cwd(), outputDir);
    const files = listCrawledFiles(absDir);

    if (files.length === 0) {
      return {
        content: [
          { type: "text", text: `📭 Chưa có file nào trong ${absDir}` },
        ],
      };
    }

    const text = [
      `📚 Danh sách ${files.length} files trong ${absDir}:`,
      ``,
      ...files.map((f) => `  📄 ${f}`),
    ].join("\n");

    return { content: [{ type: "text", text }] };
  }

  if (request.params.name === "read_pdf_directory") {
    const dirPath = request.params.arguments?.directoryPath as string;
    
    const absPath = path.resolve(process.cwd(), dirPath);
    if (!fs.existsSync(absPath)) {
      return { content: [{ type: "text", text: `Lỗi: Thư mục ${absPath} không tồn tại.` }] };
    }

    const files = fs.readdirSync(absPath).filter(f => f.toLowerCase().endsWith(".pdf"));
    let results = [];
    
    for (const file of files) {
      try {
        const dataBuffer = fs.readFileSync(path.join(absPath, file));
        const data = await pdfParse(dataBuffer);
        // Trả về tối đa 30,000 ký tự mỗi file để tránh quá tải context window của Agent
        results.push(`--- TÊN FILE: ${file} ---\n${data.text.slice(0, 30000)}\n`); 
      } catch (e) {
        results.push(`Lỗi khi đọc file ${file}: ${e}`);
      }
    }

    return {
      content: [{ type: "text", text: results.join("\n") }],
    };
  }

  if (request.params.name === "save_questions_csv") {
    const { outputPath, questions } = request.params.arguments as any;
    
    try {
      const absPath = path.resolve(process.cwd(), outputPath);
      const outDir = path.dirname(absPath);
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }

      const csvString = stringify(questions, { header: true });
      fs.writeFileSync(absPath, csvString, "utf8");

      return {
        content: [{ type: "text", text: `Đã lưu thành công ${questions.length} câu hỏi vào ${absPath}` }],
      };
    } catch (e) {
      return {
        content: [{ type: "text", text: `Lỗi khi lưu CSV: ${e}` }],
      };
    }
  }

  // --- Tool: crawl_roadmaps ---
  if (request.params.name === "crawl_roadmaps") {
    const { slugs = [], outputDir = "./sources/roadmap-data", dryRun = false } =
      (request.params.arguments || {}) as {
        slugs?: string[];
        outputDir?: string;
        dryRun?: boolean;
      };

    try {
      const app = buildRoadmapGraph();
      const finalState = await app.invoke(
        {
          targetSlugs: slugs,
          outputDir,
          dryRun,
        },
        {
          configurable: {
            thread_id: `mcp-roadmap-crawl-${Date.now()}`,
          },
        }
      );

      const summary = [
        `🗺️ Crawl Roadmaps hoàn tất:`,
        `- Số roadmaps đã xử lý: ${finalState.parsedRoadmaps?.length || 0}`,
        `- Số file đã tạo: ${finalState.outputPaths?.length || 0}`,
        `- Thư mục output: ${path.resolve(process.cwd(), outputDir)}`,
      ];

      if (finalState.errors && finalState.errors.length > 0) {
        summary.push(``, `⚠️ Cảnh báo/Lỗi:`);
        for (const err of finalState.errors) {
          summary.push(`  - ${err}`);
        }
      }

      return { content: [{ type: "text", text: summary.join("\n") }] };
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Lỗi khi crawl roadmaps: ${err instanceof Error ? err.message : String(err)}`,
          },
        ],
      };
    }
  }

  // --- Tool: list_roadmap_data ---
  if (request.params.name === "list_roadmap_data") {
    const { outputDir = "./sources/roadmap-data" } =
      (request.params.arguments || {}) as { outputDir?: string };

    const absDir = path.resolve(process.cwd(), outputDir);
    const indexPath = path.join(absDir, "index.json");

    if (!fs.existsSync(indexPath)) {
      return {
        content: [
          {
            type: "text",
            text: `📭 Chưa tìm thấy dữ liệu index tại ${indexPath}. Hãy gọi tool crawl_roadmaps trước.`,
          },
        ],
      };
    }

    try {
      const raw = fs.readFileSync(indexPath, "utf-8");
      const data = JSON.parse(raw);

      const lines = [
        `📚 Tổng hợp dữ liệu Roadmaps tại: ${absDir}`,
        `⏰ Cập nhật lúc: ${data.generatedAt}`,
        `📊 Tổng cộng: ${data.totalRoadmaps} roadmaps | ${data.totalTopics} topics`,
        ``,
      ];

      for (const cat of data.categories || []) {
        lines.push(`📂 [${cat.nameVi}] (${cat.count} roadmaps):`);
        for (const rm of cat.roadmaps || []) {
          lines.push(`  - 🗺️ ${rm.title} (${rm.slug}) - ${rm.topicCount} topics`);
        }
        lines.push(``);
      }

      return { content: [{ type: "text", text: lines.join("\n") }] };
    } catch (e) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Lỗi khi đọc dữ liệu roadmaps: ${e instanceof Error ? e.message : String(e)}`,
          },
        ],
      };
    }
  }

  return {
    content: [{ type: "text", text: `Tool không tồn tại: ${request.params.name}` }],
  };
});

// Chạy server qua stdio (chuẩn chung của MCP CLI)
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🚀 Aha-Mind MCP Server đang chạy qua stdio...");
}

run().catch(console.error);
