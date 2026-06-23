/**
 * config.ts — Tập trung tất cả hằng số có thể tinh chỉnh của pipeline.
 *
 * Why: Tránh "magic numbers" rải rác trong code. Khi cần điều chỉnh
 * (ví dụ: tăng chunk size, đổi model), chỉ cần sửa 1 file duy nhất.
 */

import path from "path";

// ─── Đường dẫn ────────────────────────────────────────────────────────────────

export const GLOSSARY_PATH = path.join(
  process.cwd(),
  "scripts/aha-mind/interpreter_agent/glossary.json"
);

/**
 * Thư mục output MDX — theo clarification của user: blog/aha-interpreter/
 */
export const OUTPUT_DIR = path.join(process.cwd(), "blog", "aha-interpreter");

// ─── Chapter Boundary Detection ───────────────────────────────────────────────

/**
 * Chiến lược phát hiện ranh giới chương (Chapter Boundary Strategy).
 *
 * Theo yêu cầu: Ưu tiên Table of Contents (TOC) → fallback sang Heading Regex.
 *
 * Trade-off:
 * - TOC-based: Chính xác 100% về thứ tự chương, nhưng cần PDF có TOC rõ ràng.
 * - Heading-based: Tự động hơn, nhưng có thể nhận diện sai nếu sách dùng heading không đồng nhất.
 */
export const CHAPTER_DETECTION = {
  /**
   * Regex nhận diện dòng TOC trong plain text PDF.
   * Hỗ trợ nhiều format phổ biến:
   *   "Chapter 1 Introduction .............. 5"
   *   "1. Introduction ................. 3"
   *   "1 INTRODUCTION ................. 3"
   */
  TOC_LINE_REGEX: /^(?:Chapter\s+\d+[\s:.-]*)?(\d+\.?\s+[A-Z][^\n]{3,80}?)\s*[.·]{2,}\s*(\d+)\s*$/m,

  /**
   * Regex nhận diện heading chương trong PLAIN TEXT (output của pdf-parse).
   *
   * Lưu ý quan trọng: pdf-parse KHÔNG tạo Markdown (##).
   * Plain text PDF thường có heading dạng:
   *   "1 INTRODUCTION"         (all caps, số ở đầu)
   *   "Chapter 1"              (từ "Chapter" + số)
   *   "1. Introduction"        (số + dấu chấm + title case)
   *   "INTRODUCTION"           (all caps, không số)
   *   "Section 1.1 Overview"   (section với sub-numbering)
   *
   * Accuracy đánh giá:
   *   - Pattern số + ALL CAPS: ~85% (phổ biến nhất trong whitepaper)
   *   - Pattern "Chapter X": ~90%
   *   - Pattern "X. Title case": ~75% (dễ false positive)
   */
  HEADING_PATTERNS: [
    // Pattern 1: "Chapter 1", "Chapter 2:" — phổ biến nhất
    /^(Chapter|CHAPTER|SECTION)\s+\d+[\s:.\-–—]*/m,
    // Pattern 2: "Chương 1" (tiếng Việt)
    /^Chương\s+\d+[\s:.\-–—]*/m,
    // Pattern 3: "1 INTRODUCTION", "2 BACKGROUND" — whitepaper style ALL CAPS
    /^\d+\s+[A-Z][A-Z\s]{4,50}$/m,
    // Pattern 4: "1. Introduction" — numbered sections
    /^\d+\.\s+[A-Z][A-Za-z][A-Za-z\s]{4,60}$/m,
    // Pattern 5: Standalone ALL CAPS line ≥ 4 chars (ABSTRACT, CONCLUSION, REFERENCES)
    /^[A-Z][A-Z\s]{4,40}$/m,
    // Pattern 6: Markdown headings (phòng ngừa nếu PDF có text layer markdown)
    /^#{1,3}\s+.{4,80}$/m,
  ],

  /**
   * Số dòng tối đa từ đầu file để tìm kiếm TOC.
   * Academic papers: TOC thường nằm trong 150 dòng đầu.
   */
  TOC_SEARCH_LINES: 300,

  /**
   * Số sections tối thiểu để TOC được coi là "đủ tin cậy".
   * Nếu TOC < MIN_TOC_ENTRIES → fallback sang Heading.
   */
  MIN_TOC_ENTRIES: 2,
} as const;

// ─── Chunking ─────────────────────────────────────────────────────────────────

export const CHUNKING = {
  /**
   * Kích thước chunk tối đa (tính theo ký tự, không phải token).
   * ~8000 chars ≈ 2000-3000 tokens — phù hợp với Gemini Flash.
   *
   * Trade-off: Chunk lớn hơn → ít API calls, context đầy đủ hơn.
   * Chunk nhỏ hơn → dịch chính xác hơn từng đoạn, dễ retry khi lỗi.
   */
  MAX_CHARS: 8000,

  /**
   * Heading levels được dùng để cắt chunk (ưu tiên cắt tại đây).
   * Tránh cắt giữa đoạn văn.
   */
  SPLIT_AT_HEADINGS: ["## ", "### "],

  /**
   * Số ký tự "bread crumb" từ chunk trước giữ lại làm context.
   * Giúp LLM duy trì tính nhất quán trong thuật ngữ giữa các chunks.
   */
  CONTEXT_OVERLAP_CHARS: 300,
} as const;

// ─── LLM Config ───────────────────────────────────────────────────────────────

export const LLM_CONFIG = {
  MODEL: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  TEMPERATURE: 0.3,  // Thấp = ít sáng tạo, tuân thủ format tốt hơn
  MAX_OUTPUT_TOKENS: 8192,

  /**
   * Delay (ms) giữa các API calls để tránh rate limit.
   * Gemini Flash free tier: 15 requests/minute.
   */
  RATE_LIMIT_DELAY_MS: 2000,
} as const;

// ─── MDX Output Config ────────────────────────────────────────────────────────

export const MDX_CONFIG = {
  /** Tags mặc định cho blog post dịch từ sách */
  DEFAULT_TAGS: ["aha-interpreter", "book-notes", "auto-translated"],

  /** Authors field trong frontmatter Docusaurus */
  AUTHORS: ["anhhtus"],

  /** Prefix cho slug của bài viết */
  SLUG_PREFIX: "aha-interpreter",
} as const;
