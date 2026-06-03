/**
 * InterpreterState — Trạng thái trung tâm của toàn bộ pipeline.
 * Mỗi node nhận state → xử lý → trả về Partial<InterpreterState>.
 *
 * Design decision: Tách biệt rõ input config, dữ liệu trung gian, và output
 * để dễ debug từng giai đoạn khi pipeline gặp lỗi.
 */

import { Annotation } from "@langchain/langgraph";

// ─── Interfaces ──────────────────────────────────────────────────────────────

/**
 * Đại diện cho một chương (chapter) trong sách sau khi được parse.
 */
export interface Chapter {
  /** Số thứ tự chương, bắt đầu từ 1 */
  index: number;
  /** Tiêu đề chương (từ Table of Contents hoặc heading) */
  title: string;
  /** Nội dung raw tiếng Anh của chương */
  rawContent: string;
  /** Số trang bắt đầu (nếu PDF cung cấp thông tin này) */
  startPage?: number;
}

/**
 * Metadata của sách — được parse từ trang đầu hoặc truyền vào qua CLI args.
 */
export interface BookMetadata {
  title: string;
  slug: string;
  /** Tác giả sách gốc (ví dụ: "Google DeepMind Team") */
  originalAuthor: string;
  /** Ngày dịch — tự động set là ngày chạy pipeline */
  translatedDate: string;
}

/**
 * State toàn phần của interpreter pipeline.
 */
export interface InterpreterState {
  // ── Input ──
  /** Đường dẫn tuyệt đối tới file PDF */
  pdfPath: string;
  /** Metadata sách (title, slug, author) */
  bookMetadata: BookMetadata;
  /** Phạm vi trang cần dịch (vd: start 10, end 20). Nếu end = Infinity -> đến hết. */
  pageRange: { start: number; end: number };

  // ── Phase 1: Parse ──
  /** Toàn bộ raw text của PDF (trước khi tách chapter) */
  rawPdfText: string;
  /** Danh sách chapters đã được tách từ PDF */
  chapters: Chapter[];

  // ── Phase 2-5: Per-Chapter Processing ──
  /** Index của chapter đang được xử lý (0-based) */
  currentChapterIndex: number;

  /**
   * Masked content — nội dung đã thay code blocks và images bằng placeholder.
   * Ví dụ: ```python...``` → <ASSET_CODE_001>
   */
  maskedContent: string;

  /**
   * Asset map — dictionary mapping placeholder → original content.
   * Key: "ASSET_CODE_001", Value: "```python\nprint('hello')\n```"
   */
  assetMap: Record<string, string>;

  /** Chunks đã chia từ maskedContent để gửi LLM */
  chunks: string[];

  /** Bản dịch từng chunk sau khi LLM xử lý */
  translatedChunks: string[];

  /** Bản dịch đầy đủ của 1 chapter (sau khi join translatedChunks) */
  translatedContent: string;

  // ── Phase 6: Output ──
  /** Nội dung MDX hoàn chỉnh của chapter hiện tại */
  finalMdxContent: string;

  /** Danh sách đường dẫn các file MDX đã được ghi thành công */
  processedChapters: string[];
}

// ─── LangGraph State Annotation ───────────────────────────────────────────────

export const StateAnnotation = Annotation.Root({
  pdfPath: Annotation<string>({
    reducer: (x, y) => y ?? x ?? "",
    default: () => "",
  }),
  bookMetadata: Annotation<BookMetadata>({
    reducer: (x, y) => y ?? x ?? { title: "", slug: "", originalAuthor: "", translatedDate: "" },
    default: () => ({ title: "", slug: "", originalAuthor: "", translatedDate: "" }),
  }),
  pageRange: Annotation<{ start: number; end: number }>({
    reducer: (x, y) => y ?? x ?? { start: 1, end: Infinity },
    default: () => ({ start: 1, end: Infinity }),
  }),
  rawPdfText: Annotation<string>({
    reducer: (x, y) => y ?? x ?? "",
    default: () => "",
  }),
  chapters: Annotation<Chapter[]>({
    reducer: (x, y) => y ?? x ?? [],
    default: () => [],
  }),
  currentChapterIndex: Annotation<number>({
    reducer: (x, y) => y ?? x ?? 0,
    default: () => 0,
  }),
  maskedContent: Annotation<string>({
    reducer: (x, y) => y ?? x ?? "",
    default: () => "",
  }),
  assetMap: Annotation<Record<string, string>>({
    // Merge maps — nội dung từ chapter sau không overwrite chapter trước
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({}),
  }),
  chunks: Annotation<string[]>({
    reducer: (x, y) => y ?? x ?? [],
    default: () => [],
  }),
  translatedChunks: Annotation<string[]>({
    reducer: (x, y) => y ?? x ?? [],
    default: () => [],
  }),
  translatedContent: Annotation<string>({
    reducer: (x, y) => y ?? x ?? "",
    default: () => "",
  }),
  finalMdxContent: Annotation<string>({
    reducer: (x, y) => y ?? x ?? "",
    default: () => "",
  }),
  processedChapters: Annotation<string[]>({
    // Append — giữ lại tất cả file đã ghi
    reducer: (x, y) => [...(x ?? []), ...(y ?? [])],
    default: () => [],
  }),
});
