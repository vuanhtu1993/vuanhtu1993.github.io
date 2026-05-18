import { StateGraph, MemorySaver, START, END } from "@langchain/langgraph";
import { DumpStateAnnotation, DumpState } from "./state";
import { pdfLoaderNode } from "./nodes/pdfLoader";
import { questionParserNode } from "./nodes/questionParser";
import { deduplicatorNode } from "./nodes/deduplicator";
import { classifierNode } from "./nodes/classifier";
import { explainerNode } from "./nodes/explainer";
import { validatorNode } from "./nodes/validator";
import { csvWriterNode } from "./nodes/csvWriter";
import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const workflow = new StateGraph(DumpStateAnnotation)
  .addNode("pdfLoader", pdfLoaderNode)
  .addNode("questionParser", questionParserNode)
  .addNode("deduplicator", deduplicatorNode)
  .addNode("classifier", classifierNode)
  .addNode("explainer", explainerNode)
  .addNode("validator", validatorNode)
  .addNode("csvWriter", csvWriterNode)
  
  .addEdge(START, "pdfLoader")
  .addEdge("pdfLoader", "questionParser")
  .addEdge("questionParser", "deduplicator")
  .addEdge("deduplicator", "classifier")
  .addEdge("classifier", "explainer")
  .addEdge("explainer", "validator");

const decideNextStep = (state: DumpState) => {
  if (state.validationError) {
    console.warn("⚠️ Bỏ qua lỗi validation, vẫn xuất ra file CSV...");
  }
  return "csvWriter";
};

workflow.addConditionalEdges("validator", decideNextStep);
workflow.addEdge("csvWriter", END);

const app = workflow.compile({ checkpointer: new MemorySaver() });

async function runPipeline() {
  console.log("🚀 Bắt đầu Dump Extractor Agent Pipeline...");

  if (!process.env.GOOGLE_API_KEY) {
    console.warn("⚠️ Cảnh báo: GOOGLE_API_KEY chưa được cấu hình. Các Node AI sẽ bị lỗi.");
  }

  const pdfDirArg = process.argv[2];

  if (!pdfDirArg || !fs.existsSync(pdfDirArg)) {
    console.error("❌ Lỗi: Vui lòng cung cấp đường dẫn thư mục chứa PDF hợp lệ!");
    console.log("👉 Ví dụ chạy: pnpm aha-mind:dump dump/ai-900");
    process.exit(1);
  }

  const finalState = await app.invoke(
    { pdfDirectory: path.resolve(pdfDirArg) },
    { configurable: { thread_id: `dump-run-${Date.now()}` }, streamMode: "values" }
  );

  console.log(`✅ Pipeline hoàn tất! Đã xử lý xong.`);
}

runPipeline().catch(console.error);
