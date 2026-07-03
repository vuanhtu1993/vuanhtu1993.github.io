/**
 * chunker.ts — Node 3: Smart Chunker
 * =====================================
 * Chia masked content thành các chunks nhỏ để gửi cho LLM.
 *
 * Tại sao cần Chunking?
 * Dù Gemini Flash có context window 1M tokens, việc gửi cả chương (~50,000 chars)
 * trong 1 lần call dẫn đến:
 * 1. Chất lượng dịch giảm ở cuối prompt (LLM "quên" đầu)
 * 2. Khó retry khi lỗi (phải gửi lại toàn bộ)
 * 3. Tiêu tốn quota không cần thiết
 *
 * Strategy: Cắt ở Heading (ưu tiên) → Paragraph (fallback)
 */

import { InterpreterState } from "../state";
import { CHUNKING } from "../config";

// ─── Core Chunking Logic ──────────────────────────────────────────────────────

/**
 * Chia text thành chunks, ưu tiên cắt tại heading.
 *
 * Algorithm:
 * 1. Tìm tất cả vị trí heading trong text
 * 2. Nhóm các sections liên tiếp cho đến khi tổng vượt MAX_CHARS
 * 3. Tại mỗi điểm cắt, thêm CONTEXT_OVERLAP từ chunk trước
 *
 * @param text - Masked content cần chia
 * @returns Mảng chunks, mỗi chunk ~MAX_CHARS ký tự
 */
export function createChunks(text: string): string[] {
  if (text.length <= CHUNKING.MAX_CHARS) {
    return [text];
  }

  // ── Bước 1: Tìm tất cả vị trí heading ──
  const headingPositions: number[] = [];

  for (const headingPrefix of CHUNKING.SPLIT_AT_HEADINGS) {
    const regex = new RegExp(`^${escapeRegex(headingPrefix)}`, "gm");
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (!headingPositions.includes(match.index)) {
        headingPositions.push(match.index);
      }
    }
  }

  headingPositions.sort((a, b) => a - b);
  
  // Đảm bảo có điểm bắt đầu và kết thúc
  if (headingPositions[0] !== 0) headingPositions.unshift(0);
  if (headingPositions[headingPositions.length - 1] !== text.length) {
    headingPositions.push(text.length);
  }

  // ── Bước 2: Gom các sections vào raw chunks ──
  const rawChunks: string[] = [];
  let currentChunk = "";

  for (let i = 0; i < headingPositions.length - 1; i++) {
    const section = text.slice(headingPositions[i], headingPositions[i + 1]);

    if ((currentChunk.length + section.length) <= CHUNKING.MAX_CHARS) {
      currentChunk += (currentChunk ? "\n\n" : "") + section.trim();
    } else {
      // Chunk hiện tại đã đầy, đẩy vào mảng
      if (currentChunk.trim().length > 0) {
        rawChunks.push(currentChunk.trim());
        currentChunk = "";
      }

      // Xử lý section hiện tại
      if (section.length <= CHUNKING.MAX_CHARS) {
        currentChunk = section.trim();
      } else {
        // Fallback: Section này nằm giữa 2 heading nhưng lại vượt quá MAX_CHARS 
        // -> Cần chia nhỏ section theo đoạn văn (paragraph)
        const subChunks = splitByParagraph(section);
        for (const sub of subChunks) {
          if ((currentChunk.length + sub.length) <= CHUNKING.MAX_CHARS) {
            currentChunk += (currentChunk ? "\n\n" : "") + sub;
          } else {
            if (currentChunk.trim().length > 0) {
              rawChunks.push(currentChunk.trim());
            }
            currentChunk = sub;
          }
        }
      }
    }
  }

  if (currentChunk.trim().length > 0) {
    rawChunks.push(currentChunk.trim());
  }

  // [Fix #2] Context overlap KHÔNG inject ở đây nữa.
  // translator.ts sẽ inject 300 chars cuối của BẢN DỊCH tiếng Việt vào human prompt
  // của chunk tiếp theo, thay vì inject bản gốc tiếng Anh vào chunk data.
  // Lý do: LLM anchor vào lựa chọn tiếng Việt đã xác lập → nhất quán thuật ngữ.
  return rawChunks;
}

/**
 * Fallback: Chia theo paragraph khi không có heading hoặc section quá dài.
 * Gom các paragraphs cho đến khi tổng vượt MAX_CHARS.
 * Nếu 1 paragraph dài hơn MAX_CHARS, chia cắt cưỡng chế theo khoảng trắng.
 */
function splitByParagraph(text: string): string[] {
  const paragraphs = text.split(/\n{2,}/);
  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    // Nếu một paragraph đơn lẻ quá dài (cực kỳ hiếm, VD code block lớn)
    if (para.length > CHUNKING.MAX_CHARS) {
      if (current.trim().length > 0) {
        chunks.push(current.trim());
        current = "";
      }
      
      // Chia nhỏ paragraph cưỡng chế theo ký tự
      let remaining = para;
      while (remaining.length > 0) {
        chunks.push(remaining.slice(0, CHUNKING.MAX_CHARS));
        remaining = remaining.slice(CHUNKING.MAX_CHARS);
      }
      continue;
    }

    if ((current + "\n\n" + para).length > CHUNKING.MAX_CHARS && current) {
      chunks.push(current.trim());
      current = para;
    } else {
      current = current ? current + "\n\n" + para : para;
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ─── Main Node ────────────────────────────────────────────────────────────────

export const chunkerNode = async (
  state: InterpreterState
): Promise<Partial<InterpreterState>> => {
  const chapter = state.chapters[state.currentChapterIndex];

  if (!state.maskedContent) {
    console.log("[Chunker] ⚠️ Không có masked content.");
    return { chunks: [] };
  }

  console.log(`\n[Chunker] ✂️  Đang chia chapter ${chapter?.index ?? "?"}: "${chapter?.title ?? "?"}"`);
  console.log(`[Chunker] Input size: ${state.maskedContent.length.toLocaleString()} chars`);

  const chunks = createChunks(state.maskedContent);

  console.log(`[Chunker] ✅ Chia thành ${chunks.length} chunks:`);
  chunks.forEach((chunk, i) => {
    console.log(`   Chunk ${i + 1}: ${chunk.length.toLocaleString()} chars`);
  });

  return {
    chunks,
    translatedChunks: [], // Reset cho chapter mới
  };
};
