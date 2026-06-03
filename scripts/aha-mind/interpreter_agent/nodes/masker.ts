/**
 * masker.ts — Node 2: Asset Masker
 * ==================================
 * "Che chắn" các tài sản kỹ thuật trước khi đưa vào LLM dịch thuật.
 *
 * Tại sao cần Masking?
 * LLM đôi khi "dịch" cả nội dung bên trong code block (ví dụ: đổi tên biến thành
 * tiếng Việt) hoặc thay đổi đường dẫn ảnh. Kỹ thuật Masking đảm bảo các "tài sản
 * kỹ thuật" được bảo toàn 100% qua quá trình dịch thuật.
 *
 * Assets được mask:
 * 1. Fenced code blocks: ```lang ... ```
 * 2. Inline code: `code`
 * 3. Images: ![alt](path)
 * 4. Links: [text](url) — chỉ mask phần URL, giữ nguyên text
 * 5. HTML blocks: <tag>...</tag>
 */

import { InterpreterState } from "../state";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MaskResult {
  maskedContent: string;
  assetMap: Record<string, string>;
}

// ─── Core Masking Logic ───────────────────────────────────────────────────────

/**
 * Thực hiện masking trên một đoạn text markdown.
 *
 * Pattern priority (order matters):
 * 1. Fenced code blocks ``` ``` trước (dài nhất, tránh bị match nhầm bởi inline)
 * 2. Inline code `...`
 * 3. Images ![alt](url)
 * 4. URLs trong links [text](url)
 * 5. HTML blocks
 */
export function maskAssets(content: string): MaskResult {
  const assetMap: Record<string, string> = {};
  let counter = 1;
  let result = content;

  function nextId(type: "CODE" | "INLINE" | "IMG" | "URL" | "HTML"): string {
    return `<ASSET_${type}_${String(counter++).padStart(3, "0")}>`;
  }

  // ── 1. Fenced Code Blocks: ```lang\n...\n``` ──
  // Why: Tuyệt đối không để LLM thấy code — dù comment tiếng Anh cũng không dịch
  result = result.replace(/```[\s\S]*?```/g, (match) => {
    const id = nextId("CODE");
    assetMap[id] = match;
    return id;
  });

  // ── 2. Inline Code: `code` ──
  result = result.replace(/`[^`\n]+`/g, (match) => {
    const id = nextId("INLINE");
    assetMap[id] = match;
    return id;
  });

  // ── 3. Images: ![alt text](path/to/image.png) ──
  // Mask cả block vì alt text thường là metadata kỹ thuật
  result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match) => {
    const id = nextId("IMG");
    assetMap[id] = match;
    return id;
  });

  // ── 4. Hyperlinks: [text](url) — chỉ mask URL, giữ nguyên text ──
  // Trade-off: Không mask text vì LLM có thể cần dịch anchor text
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    const urlId = nextId("URL");
    assetMap[urlId] = url;
    return `[${text}](${urlId})`;
  });

  // ── 5. HTML Tags (thẻ self-closing và block-level) ──
  // Ví dụ: <br/>, <Image src="..." />, <CodeBlock>
  result = result.replace(/<[A-Za-z][^>]*\/?>(?:[\s\S]*?<\/[A-Za-z]+>)?/g, (match) => {
    // Chỉ mask nếu không phải text thuần (có attributes hoặc closing tag)
    if (match.includes("=") || match.includes("</")) {
      const id = nextId("HTML");
      assetMap[id] = match;
      return id;
    }
    return match;
  });

  return { maskedContent: result, assetMap };
}

// ─── Main Node ────────────────────────────────────────────────────────────────

export const maskerNode = async (
  state: InterpreterState
): Promise<Partial<InterpreterState>> => {
  const chapter = state.chapters[state.currentChapterIndex];

  if (!chapter) {
    console.log("[Masker] ⚠️ Không có chapter để xử lý.");
    return { maskedContent: "", assetMap: {} };
  }

  console.log(`\n[Masker] 🔒 Masking chapter ${chapter.index}: "${chapter.title}"`);

  const { maskedContent, assetMap } = maskAssets(chapter.rawContent);

  const assetCount = Object.keys(assetMap).length;
  const codeCount = Object.keys(assetMap).filter(k => k.includes("CODE")).length;
  const imgCount = Object.keys(assetMap).filter(k => k.includes("IMG")).length;

  console.log(`[Masker] ✅ Đã mask ${assetCount} assets:`);
  console.log(`   - Code blocks: ${codeCount}`);
  console.log(`   - Images: ${imgCount}`);
  console.log(`   - Others: ${assetCount - codeCount - imgCount}`);
  console.log(`[Masker] Kích thước sau mask: ${maskedContent.length.toLocaleString()} chars`);

  return {
    maskedContent,
    // assetMap được merge (không overwrite) nhờ reducer trong state.ts
    assetMap,
  };
};
