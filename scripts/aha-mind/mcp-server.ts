import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import { stringify } from "csv-stringify/sync";

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
      }
    ],
  };
});

// Xử lý logic khi Gemini/Claude gọi Tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
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
