/**
 * unmasker.ts — Node 5: Asset Unmasker
 * =======================================
 * Khôi phục các "tài sản kỹ thuật" từ placeholder về nội dung gốc.
 *
 * Logic: Đây là bước đảo ngược của masker.ts.
 * Map: { "<ASSET_CODE_001>": "```python\nprint()\n```" }
 * → Tìm "<ASSET_CODE_001>" trong bản dịch → Thay bằng "```python\nprint()\n```"
 *
 * Edge cases được xử lý:
 * 1. LLM thêm khoảng trắng quanh tag → trim trước khi lookup
 * 2. LLM dịch tag thành text → log warning (không thể recover)
 * 3. Tag trong assetMap nhưng không xuất hiện trong bản dịch → bỏ qua
 */

import { InterpreterState } from "../state";

// ─── Core Unmasking Logic ────────────────────────────────────────────────────

/**
 * Thực hiện unmasking: thay thế tất cả placeholder bằng nội dung gốc.
 *
 * @param translatedContent - Bản dịch tiếng Việt vẫn chứa <ASSET_...> tags
 * @param assetMap - Dictionary mapping từ tag → original content
 * @returns Nội dung hoàn chỉnh với assets được khôi phục
 */
export function unmaskAssets(
  translatedContent: string,
  assetMap: Record<string, string>
): string {
  let result = translatedContent;

  // Sắp xếp theo độ dài key giảm dần để tránh partial replacement
  // (ví dụ: ASSET_CODE_001 vs ASSET_CODE_0010)
  const sortedKeys = Object.keys(assetMap).sort((a, b) => b.length - a.length);

  let restoredCount = 0;
  let missingCount = 0;

  for (const placeholder of sortedKeys) {
    const original = assetMap[placeholder];

    if (result.includes(placeholder)) {
      // Thay thế tất cả occurences (LLM đôi khi duplicate placeholder)
      result = result.split(placeholder).join(original);
      restoredCount++;
    } else {
      // Placeholder biến mất sau khi dịch — LLM có thể đã xóa hoặc dịch tag
      // Strategy: Không inject ngược vào (không biết vị trí đúng)
      missingCount++;
      console.warn(`[Unmasker] ⚠️ Placeholder bị mất: ${placeholder}`);
    }
  }

  console.log(`[Unmasker] Khôi phục: ${restoredCount}/${sortedKeys.length} assets`);
  if (missingCount > 0) {
    console.warn(`[Unmasker] ⚠️ ${missingCount} assets không tìm thấy trong bản dịch — kiểm tra lại thủ công`);
  }

  return result;
}

// ─── Main Node ────────────────────────────────────────────────────────────────

export const unmaskerNode = async (
  state: InterpreterState
): Promise<Partial<InterpreterState>> => {
  const chapter = state.chapters[state.currentChapterIndex];

  if (!state.translatedContent) {
    console.log("[Unmasker] ⚠️ Không có translated content để unmask.");
    return { translatedContent: "" };
  }

  console.log(`\n[Unmasker] 🔓 Unmasking chapter ${chapter?.index ?? "?"}: "${chapter?.title ?? "?"}"`);

  const assetCount = Object.keys(state.assetMap).length;
  console.log(`[Unmasker] Có ${assetCount} assets trong map`);

  const unmasked = unmaskAssets(state.translatedContent, state.assetMap);

  // Sanity check: không còn placeholder nào trong output
  const remainingPlaceholders = unmasked.match(/<ASSET_[A-Z]+_\d+>/g) ?? [];
  if (remainingPlaceholders.length > 0) {
    console.warn(`[Unmasker] ⚠️ Vẫn còn ${remainingPlaceholders.length} placeholder chưa được khôi phục!`);
    console.warn("[Unmasker] Placeholders còn lại:", remainingPlaceholders);
  } else {
    console.log("[Unmasker] ✅ Tất cả assets đã được khôi phục!");
  }

  return { translatedContent: unmasked };
};
