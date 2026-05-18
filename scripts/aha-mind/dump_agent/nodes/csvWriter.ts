import { DumpState } from "../state";
import { stringify } from "csv-stringify/sync";
import fs from "fs";
import path from "path";

export async function csvWriterNode(state: DumpState): Promise<Partial<DumpState>> {
  console.log("--- 7. CSV WRITER ---");
  const { explainedQuestions } = state;

  const outputDir = path.join(process.cwd(), "data", "dump", "output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Sử dụng timestamp để tránh ghi đè dữ liệu của hôm trước (Resume capability)
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const csvPath = path.join(outputDir, `questions_bank_${timestamp}.csv`);

  const records = explainedQuestions.map(q => ({
    question_id: q.question_id,
    question_text: q.question_text,
    option_a: q.option_a,
    option_b: q.option_b,
    option_c: q.option_c,
    option_d: q.option_d,
    correct_answer: q.correct_answer,
    explanation: q.explanation,
    domain: q.domain,
    difficulty: q.difficulty,
    source_file: q.source_file
  }));

  const csvString = stringify(records, { header: true });
  fs.writeFileSync(csvPath, csvString, "utf8");

  console.log(`✅ Đã xuất ${records.length} câu hỏi ra file: ${csvPath}`);

  return { csvOutputPath: csvPath };
}
