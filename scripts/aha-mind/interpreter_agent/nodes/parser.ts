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
import { uploadImageToCloudinary } from "../utils/cloudinary";

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

  // ── Bước 2: Upload ảnh lên Cloudinary & thay thế đường dẫn ──
  const imageDirForward = imageDir.replace(/\\/g, "/");
  const cloudinaryFolder = `aha-interpreter/${slug}`;

  if (fs.existsSync(imageDir)) {
    const files = fs.readdirSync(imageDir);
    const imageFiles = files.filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'));

    if (imageFiles.length > 0) {
      console.log(`[Parser] ☁️ Bắt đầu upload ${imageFiles.length} ảnh lên Cloudinary...`);
      for (const file of imageFiles) {
        const localPath = path.join(imageDir, file);
        try {
          const cloudinaryUrl = await uploadImageToCloudinary(localPath, cloudinaryFolder);
          // Thay thế đường dẫn local bằng Cloudinary URL
          rawContent = rawContent.split(imageDirForward + "/" + file).join(cloudinaryUrl);

          // Đề phòng trường hợp pymupdf4llm trả về đường dẫn dùng backslash trên Windows
          const backslashPath = path.join(imageDir, file).replace(/\\/g, "\\\\");
          rawContent = rawContent.split(backslashPath).join(cloudinaryUrl);
          rawContent = rawContent.split(path.join(imageDir, file)).join(cloudinaryUrl);

          // Xoá file ảnh tạm sau khi upload thành công
          fs.unlinkSync(localPath);
        } catch (uploadError) {
          console.error(`[Parser] ❌ Lỗi khi upload ${file}, giữ nguyên đường dẫn local.`);
          // Nếu lỗi, đổi sang đường dẫn tương đối (fallback)
          rawContent = rawContent.split(imageDirForward + "/" + file).join("./images/" + file);
        }
      }
      console.log(`[Parser] ✅ Hoàn tất upload ảnh lên Cloudinary.`);
    }
  }

  // Fallback: Đổi các đường dẫn còn sót lại thành relative path `./images/...`
  rawContent = rawContent.split(imageDirForward + "/").join("./images/");
  rawContent = rawContent.split(imageDirForward).join("./images");

  // ── Bước 3: Lọc nhiễu (Noise Filtering) ──
  // Lọc các header/footer hoặc pattern đặc thù của sách được định nghĩa trong bookMetadata
  if (state.bookMetadata.noisePatterns && state.bookMetadata.noisePatterns.length > 0) {
    for (const patternStr of state.bookMetadata.noisePatterns) {
      try {
        const regex = new RegExp(patternStr, 'gmi');
        rawContent = rawContent.replace(regex, '');
      } catch (e) {
        console.warn(`[Parser] ⚠️ Bỏ qua regex không hợp lệ: ${patternStr}`);
      }
    }
  }
  // Dọn dẹp khoảng trắng thừa (giảm token thừa)
  rawContent = rawContent.replace(/\n{3,}/g, '\n\n');

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
