import * as dotenv from "dotenv";
// Load biến môi trường từ .env ngay lập tức
dotenv.config();

import { StateGraph, MemorySaver, START, END } from "@langchain/langgraph";
import { StateAnnotation } from "./state";
import { fetchRssNode } from "./nodes/fetcher";
import { cefrAnalyzerNode } from "./nodes/analyzer";
import { mdxFormatterNode } from "./nodes/formatter";
import { fileWriterNode } from "./nodes/writer";

// Cấu phần đồ thị tuần tự
const workflow = new StateGraph(StateAnnotation)
  .addNode("fetch", fetchRssNode)
  .addNode("analyze", cefrAnalyzerNode)
  .addNode("format", mdxFormatterNode)
  .addNode("write", fileWriterNode)
  .addEdge(START, "fetch")
  .addEdge("fetch", "analyze")
  .addEdge("analyze", "format")
  .addEdge("format", "write")
  .addEdge("write", END);

// Compile workflow
const app = workflow.compile({ checkpointer: new MemorySaver() });

async function runPipeline() {
  console.log("🚀 Bắt đầu Aha! Mind Pipeline...");

  const urlArg = process.argv[2];

  if (!urlArg || !urlArg.startsWith("http")) {
    console.error("❌ Lỗi: Vui lòng cung cấp link bài viết hợp lệ!");
    console.log("👉 Hướng dẫn chạy: npx tsx scripts/aha-mind/pipeline.ts <URL>");
    process.exit(1);
  }

  // Khởi chạy đồ thị với URL từ tham số dòng lệnh
  const finalState = await app.invoke(
    {
      articleUrl: urlArg
    },
    { configurable: { thread_id: `aha-mind-run-${Date.now()}` } } // Generate a dynamic thread ID
  );

  console.log("✅ Pipeline hoàn tất!");
}

// Chạy script
runPipeline().catch(console.error);
