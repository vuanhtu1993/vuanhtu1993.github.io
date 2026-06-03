/**
 * parser.ts — Node 1: PDF Parser
 * ================================
 * Gọi script Python (`extract.py` - dùng pymupdf4llm) để bóc tách 
 * Text (Markdown chuẩn) và Hình ảnh từ file PDF gốc theo số trang chỉ định.
 * 
 * Lợi ích: Nhận được cấu trúc Markdown đẹp + lấy được hình ảnh chèn đúng chỗ.
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { Chapter, InterpreterState } from "../state";

// ─── Utility Functions ────────────────────────────────────────────────────────

export function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Main Node ────────────────────────────────────────────────────────────────

export const parserNode = async (
  state: InterpreterState
): Promise<Partial<InterpreterState>> => {
  console.log(`\n[Parser] 📖 Đang đọc PDF: ${state.pdfPath}`);

  if (!fs.existsSync(state.pdfPath)) {
    throw new Error(`[Parser] ❌ File PDF không tồn tại: ${state.pdfPath}`);
  }

  const { start, end } = state.pageRange;
  console.log(`[Parser] 🎯 Yêu cầu bóc tách từ trang ${start} đến ${end === Infinity ? "hết" : end}`);

  // ── Bước 1: Gọi Python script để extract Markdown + Images ──
  const slug = state.bookMetadata.slug;
  const imageDir = path.resolve(process.cwd(), `blog/aha-interpreter/${slug}/images`);
  const outFile = path.resolve(process.cwd(), `blog/aha-interpreter/${slug}/temp_extract.md`);
  
  if (!fs.existsSync(path.dirname(outFile))) {
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
  }

  const pythonBin = path.resolve(process.cwd(), "scripts/aha-mind/interpreter_agent/python/.venv/bin/python");
  const pythonScript = path.resolve(process.cwd(), "scripts/aha-mind/interpreter_agent/python/extract.py");
  let endArg = end === Infinity ? "" : `--end ${end}`;
  const cmd = `"${pythonBin}" "${pythonScript}" --pdf "${state.pdfPath}" --start ${start} ${endArg} --img_dir "${imageDir}" --out "${outFile}"`;

  try {
    console.log(`[Parser] ⏳ Chạy script Python (pymupdf4llm)...`);
    execSync(cmd, { stdio: "inherit" }); 
  } catch (err: any) {
    throw new Error(`[Parser] ❌ Lỗi khi gọi extract.py: ${err.message}`);
  }

  if (!fs.existsSync(outFile)) {
    throw new Error(`[Parser] ❌ Không tìm thấy file output Markdown: ${outFile}`);
  }

  let rawContent = fs.readFileSync(outFile, "utf-8");

  // ── Bước 2: Chuẩn hóa đường dẫn ảnh ──
  // Đổi đường dẫn tuyệt đối của ảnh thành relative path `./images/...` 
  // Docusaurus MDX cần ảnh ở cùng thư mục hoặc thư mục con.
  const imageDirForward = imageDir.replace(/\\/g, "/"); 
  rawContent = rawContent.split(imageDirForward + "/").join("./images/");
  // Đề phòng trường hợp script trả về path không có slash cuối
  rawContent = rawContent.split(imageDirForward).join("./images");
  
  // Dọn dẹp file tạm
  fs.unlinkSync(outFile);

  // ── Bước 3: Tạo Chapter Payload ──
  const actualEnd = end === Infinity ? "cuối" : end;
  const title = `Từ trang ${start} đến ${actualEnd}`;

  const chapter: Chapter = {
    index: 1,
    title,
    rawContent,
    startPage: start,
  };

  console.log(`[Parser] ✅ Hoàn tất trích xuất Markdown và Hình ảnh.`);
  console.log(`[Parser] 📊 Kích thước raw content: ${rawContent.length.toLocaleString()} ký tự`);

  return {
    rawPdfText: rawContent,
    chapters: [chapter],
    currentChapterIndex: 0,
  };
};
