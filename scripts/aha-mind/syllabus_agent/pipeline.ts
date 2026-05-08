import { StateGraph, MemorySaver, START, END } from "@langchain/langgraph";
import { SyllabusStateAnnotation, SyllabusState } from "./state";
import { dataIngestor } from "./nodes/dataIngestor";
import { generatorNode } from "./nodes/generator";
import { validatorNode } from "./nodes/validator";
import { fixerNode } from "./nodes/fixer";
import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Load biến môi trường từ .env
dotenv.config();

// Khởi tạo đồ thị
const workflow = new StateGraph(SyllabusStateAnnotation)
  .addNode("ingest", dataIngestor)
  .addNode("generate", generatorNode)
  .addNode("validate", validatorNode)
  .addNode("fix", fixerNode)
  
  .addEdge(START, "ingest")
  .addEdge("ingest", "generate")
  .addEdge("generate", "validate");

// Điều hướng Logic: Nếu Validate có lỗi thì chuyển sang Fixer, nếu không thì End.
const decideNextStep = (state: SyllabusState) => {
  if (state.validationError) {
    if (state.retryCount >= 3) {
      console.log("❌ Đã quá 3 lần thử sửa lỗi. Dừng chương trình.");
      return END;
    }
    return "fix";
  }
  return END;
};

workflow.addConditionalEdges("validate", decideNextStep);
workflow.addEdge("fix", "validate"); // Sau khi fix, quay lại validate

const app = workflow.compile({ checkpointer: new MemorySaver() });

async function runPipeline() {
  console.log("🚀 Bắt đầu Syllabus Agent Pipeline...");

  if (!process.env.GOOGLE_API_KEY) {
    console.warn("⚠️ Cảnh báo: GOOGLE_API_KEY chưa được cấu hình. Các Node AI sẽ bị lỗi.");
  }

  const excelPathArg = process.argv[2];

  if (!excelPathArg || !fs.existsSync(excelPathArg)) {
    console.error("❌ Lỗi: Vui lòng cung cấp đường dẫn file Excel hợp lệ!");
    console.log("👉 Ví dụ chạy: pnpm aha-mind:syllabus data/syllabus/raw/AI-900_Syllabus.xlsx");
    process.exit(1);
  }

  // Khởi chạy đồ thị
  const finalState = await app.invoke(
    { rawExcelPath: path.resolve(excelPathArg) },
    { configurable: { thread_id: `syllabus-run-${Date.now()}` } }
  );

  if (finalState.tsvOutput && !finalState.validationError) {
    const outputDir = path.join(process.cwd(), "data", "syllabus", "output");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    
    // Lưu kết quả dưới dạng CSV (mặc dù cấu trúc là TSV để dễ copy-paste / import)
    const fileName = path.basename(excelPathArg, path.extname(excelPathArg)) + "_Mindmap.csv";
    const finalPath = path.join(outputDir, fileName);
    fs.writeFileSync(finalPath, finalState.tsvOutput, "utf8");
    console.log(`✅ Pipeline hoàn tất! Đã lưu file kết quả tại: ${finalPath}`);
  } else {
    console.log("⚠️ Pipeline hoàn tất nhưng gặp lỗi sinh dữ liệu hoặc định dạng không hợp lệ.");
  }
}

// Chạy script
runPipeline().catch(console.error);
