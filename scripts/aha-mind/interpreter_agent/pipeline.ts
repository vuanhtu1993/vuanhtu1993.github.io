/**
 * pipeline.ts — Orchestrator chính của Interpreter Agent
 * ========================================================
 * Sử dụng LangGraph để điều phối 6 nodes theo sơ đồ:
 *
 *   START → parse → loop_chapter:
 *     mask → chunk → translate → unmask → export → [next_chapter | END]
 *
 * Design: Chapter Loop Pattern
 * ─────────────────────────────
 * LangGraph không có built-in for-loop, nên dùng "conditional edge":
 * Sau mỗi lần export, kiểm tra currentChapterIndex:
 * - Nếu còn chapter → tăng index → quay về mask (next_chapter)
 * - Nếu hết → kết thúc (END)
 *
 * Cách dùng:
 *   npm run aha-mind:interpreter -- --pdf paper/my-book.pdf --title "Book Title" [--author "Author Name"] [--chapters 1,3,5]
 */

import * as dotenv from "dotenv";
dotenv.config();

import { StateGraph, MemorySaver, START, END } from "@langchain/langgraph";
import { StateAnnotation } from "./state";
import { parserNode, createSlug } from "./nodes/parser";
import { maskerNode } from "./nodes/masker";
import { chunkerNode } from "./nodes/chunker";
import { translatorNode } from "./nodes/translator";
import { unmaskerNode } from "./nodes/unmasker";
import { mdxExporterNode } from "./nodes/mdx_exporter";
import * as path from "path";

// ─── Chapter Loop Logic ───────────────────────────────────────────────────────

/**
 * Node chuyển tiếp: Tăng currentChapterIndex lên 1 để xử lý chapter tiếp theo.
 * Đây là "counter increment" node trong chapter loop.
 */
const advanceChapterNode = async (state: any): Promise<any> => {
  const nextIndex = state.currentChapterIndex + 1;
  console.log(`\n[Pipeline] ➡️  Chuyển sang chapter ${nextIndex + 1}/${state.chapters.length}`);
  // Reset per-chapter state
  return {
    currentChapterIndex: nextIndex,
    maskedContent: "",
    assetMap: {},
    chunks: [],
    translatedChunks: [],
    translatedContent: "",
    finalMdxContent: "",
  };
};

/**
 * Conditional edge: Kiểm tra còn chapter nào để xử lý không.
 * Returns: "mask" (tiếp tục loop) | "__end__" (kết thúc)
 */
const shouldContinue = (state: any): string => {
  if (state.currentChapterIndex < state.chapters.length) {
    return "mask";
  }
  return END;
};

/**
 * Conditional edge sau khi parse: Kiểm tra có chapters hay không.
 */
const hasChapters = (state: any): string => {
  if (state.chapters.length > 0) {
    return "mask";
  }
  console.error("[Pipeline] ❌ Không tìm được chapter nào trong PDF!");
  return END;
};

// ─── Build LangGraph Workflow ─────────────────────────────────────────────────

const workflow = new StateGraph(StateAnnotation)
  // Nodes
  .addNode("parse", parserNode)
  .addNode("mask", maskerNode)
  .addNode("chunk", chunkerNode)
  .addNode("translate", translatorNode)
  .addNode("unmask", unmaskerNode)
  .addNode("export", mdxExporterNode)
  .addNode("advance", advanceChapterNode)

  // Edges: Linear flow
  .addEdge(START, "parse")
  .addConditionalEdges("parse", hasChapters, { mask: "mask", [END]: END })

  // Per-chapter loop
  .addEdge("mask", "chunk")
  .addEdge("chunk", "translate")
  .addEdge("translate", "unmask")
  .addEdge("unmask", "export")
  .addEdge("export", "advance")
  .addConditionalEdges("advance", shouldContinue, { mask: "mask", [END]: END });

const app = workflow.compile({ checkpointer: new MemorySaver() });

// ─── CLI Argument Parser ──────────────────────────────────────────────────────

function parseArgs(): {
  pdfPath: string;
  title: string;
  author: string;
  pageRange: { start: number; end: number };
} {
  const args = process.argv.slice(2);

  /**
   * Lấy toàn bộ giá trị sau một flag, cho đến khi gặp flag tiếp theo (--xxx).
   * Fix: Xử lý đúng multi-word values như --title "My Book Title"
   * khi npm truyền qua (shell có thể split hoặc không split quotes).
   */
  const getMultiWord = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    if (idx === -1) return undefined;

    const parts: string[] = [];
    for (let i = idx + 1; i < args.length; i++) {
      if (args[i].startsWith("--")) break; // Gặp flag mới → dừng
      parts.push(args[i]);
    }
    return parts.length > 0 ? parts.join(" ") : undefined;
  };

  const pdfArg = getMultiWord("--pdf");
  const titleArg = getMultiWord("--title");
  const authorArg = getMultiWord("--author") ?? "Unknown Author";
  const pagesArg = getMultiWord("--pages");

  let startPage = 1;
  let endPage = Infinity;
  if (pagesArg) {
    const parts = pagesArg.split("-");
    startPage = parseInt(parts[0].trim(), 10) || 1;
    if (parts.length > 1) {
      endPage = parseInt(parts[1].trim(), 10) || startPage;
    } else {
      endPage = startPage; // Nếu chỉ truyền `--pages 5` -> dịch mỗi trang 5
    }
  }

  if (!pdfArg) {
    console.error("❌ Thiếu tham số --pdf");
    console.log("👉 Cách dùng: npm run aha-mind:interpreter -- --pdf paper/book.pdf --title \"Book Title\" --pages 10-20");
    process.exit(1);
  }
  if (!titleArg) {
    console.error("❌ Thiếu tham số --title");
    console.log("👉 Cách dùng: npm run aha-mind:interpreter -- --pdf paper/book.pdf --title \"Book Title\" --pages 10-20");
    process.exit(1);
  }

  const pdfPath = path.resolve(process.cwd(), pdfArg);

  return { pdfPath, title: titleArg, author: authorArg, pageRange: { start: startPage, end: endPage } };
}

// ─── Main Runner ──────────────────────────────────────────────────────────────

async function runPipeline() {
  const { pdfPath, title, author, pageRange } = parseArgs();

  const pagesDisplay = pageRange.end === Infinity 
    ? `Từ trang ${pageRange.start} đến hết` 
    : `Từ trang ${pageRange.start} đến ${pageRange.end}`;

  console.log(`
${"=".repeat(60)}
  🤖 Aha! Mind Interpreter Agent
  📖 PDF: ${pdfPath}
  📚 Tiêu đề: ${title}
  ✍️  Tác giả: ${author}
  📄 Pages: ${pagesDisplay}
${"=".repeat(60)}
`);

  if (!process.env.GOOGLE_API_KEY) {
    console.error("❌ GOOGLE_API_KEY chưa được cấu hình trong .env");
    process.exit(1);
  }

  const today = new Date().toISOString().split("T")[0];
  const bookSlug = createSlug(title);

  // Invoke pipeline
  const finalState = await app.invoke(
    {
      pdfPath,
      bookMetadata: {
        title,
        slug: bookSlug,
        originalAuthor: author,
        translatedDate: today,
      },
      pageRange,
    },
    { configurable: { thread_id: `interpreter-${bookSlug}-${Date.now()}` } }
  );

  // ── Summary Report ──
  const processed = (finalState as any).processedChapters ?? [];
  console.log(`
${"=".repeat(60)}
  ✅ Pipeline hoàn tất!
  📊 Đã xử lý: ${processed.length} chapters
  📁 Output dir: blog/aha-interpreter/${bookSlug}/
${"=".repeat(60)}
`);

  if (processed.length > 0) {
    console.log("📄 Các file đã tạo:");
    processed.forEach((f: string) => console.log(`   ✓ ${f}`));
  }

  console.log("\n💡 Tiếp theo:");
  console.log("   1. Chạy: npm run start");
  console.log(`   2. Truy cập: http://localhost:3000/blog/tags/book-notes`);
  console.log("   3. Review bản dịch và chỉnh sửa nếu cần\n");
}

runPipeline().catch((err) => {
  console.error("❌ Pipeline thất bại:", err);
  process.exit(1);
});
