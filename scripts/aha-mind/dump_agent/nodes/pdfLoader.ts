import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import { DumpState } from "../state";

export async function pdfLoaderNode(state: DumpState): Promise<Partial<DumpState>> {
  console.log("--- 1. PDF LOADER ---");
  const { pdfDirectory } = state;

  if (!fs.existsSync(pdfDirectory)) {
    throw new Error(`[pdfLoader] Thư mục không tồn tại: ${pdfDirectory}`);
  }

  const files = fs.readdirSync(pdfDirectory)
    .filter(file => file.toLowerCase().endsWith(".pdf"))
    .map(file => path.join(pdfDirectory, file));

  console.log(`Tìm thấy ${files.length} PDF files trong ${pdfDirectory}`);

  const rawTexts: { file: string, text: string }[] = [];

  for (const filePath of files) {
    try {
      console.log(`Đang đọc file: ${path.basename(filePath)}`);
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      
      const text = data.text;
      
      if (text.length < 100) {
        console.warn(`⚠️ Cảnh báo: File ${path.basename(filePath)} có vẻ là scanned PDF (độ dài text quá ngắn). Bỏ qua.`);
        continue;
      }
      
      rawTexts.push({
        file: path.basename(filePath),
        text: text
      });
      console.log(`✅ Đã đọc thành công: ${path.basename(filePath)} (${text.length} chars)`);
    } catch (err) {
      console.error(`❌ Lỗi khi đọc file ${path.basename(filePath)}:`, err);
    }
  }

  return {
    pdfFiles: files,
    rawTexts
  };
}
