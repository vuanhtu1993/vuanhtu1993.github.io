import fs from "fs";
import path from "path";
import * as xlsx from "xlsx";
import { SyllabusState } from "../state";

export async function dataIngestor(state: SyllabusState): Promise<Partial<SyllabusState>> {
  console.log("--- 1. DATA INGESTOR ---");
  const { rawExcelPath } = state;

  if (!fs.existsSync(rawExcelPath)) {
    throw new Error(`[dataIngestor] Không tìm thấy file Excel tại: ${rawExcelPath}`);
  }

  console.log(`Reading Excel file: ${rawExcelPath}`);
  const workbook = xlsx.readFile(rawExcelPath);
  
  // Tìm sheet theo tên gần đúng
  const syllabusSheetName = workbook.SheetNames.find(n => n.toLowerCase().includes("syllabus")) || workbook.SheetNames[0];
  const scheduleSheetName = workbook.SheetNames.find(n => n.toLowerCase().includes("schedule")) || workbook.SheetNames[1];

  if (!syllabusSheetName || !scheduleSheetName) {
    throw new Error("[dataIngestor] Không tìm thấy đủ tab Syllabus và ScheduleDetail trong file Excel.");
  }

  // Convert sang CSV
  const syllabusCsv = xlsx.utils.sheet_to_csv(workbook.Sheets[syllabusSheetName]);
  const scheduleCsv = xlsx.utils.sheet_to_csv(workbook.Sheets[scheduleSheetName]);

  // Thư mục đích
  const processedDir = path.join(process.cwd(), "data", "syllabus", "processed");
  if (!fs.existsSync(processedDir)) fs.mkdirSync(processedDir, { recursive: true });

  const syllabusMetaCsvPath = path.join(processedDir, "syllabus_meta.csv");
  const scheduleDetailCsvPath = path.join(processedDir, "schedule_detail.csv");

  fs.writeFileSync(syllabusMetaCsvPath, syllabusCsv, "utf8");
  fs.writeFileSync(scheduleDetailCsvPath, scheduleCsv, "utf8");

  console.log("-> Đã xuất syllabus_meta.csv");
  console.log("-> Đã xuất schedule_detail.csv");

  return {
    syllabusMetaCsvPath,
    scheduleDetailCsvPath,
  };
}
