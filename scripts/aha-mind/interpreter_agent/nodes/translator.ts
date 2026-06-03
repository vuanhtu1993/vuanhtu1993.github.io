/**
 * translator.ts — Node 4: LLM Translator
 * =========================================
 * Gọi Gemini Flash để dịch từng chunk sang tiếng Việt.
 *
 * Design decisions:
 * 1. Sequential calls (không parallel): Duy trì nhất quán thuật ngữ giữa các chunks.
 *    Trade-off: Chậm hơn parallel nhưng bản dịch nhất quán hơn.
 *
 * 2. Retry logic (max 3 lần): Xử lý rate limit và network errors.
 *
 * 3. Validation sau dịch: Kiểm tra LLM có giữ nguyên <ASSET_...> tags không.
 *    Nếu thiếu → log warning, không throw error (graceful degradation).
 */

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import * as fs from "fs";
import { InterpreterState } from "../state";
import { GLOSSARY_PATH, LLM_CONFIG } from "../config";

// ─── Prompt Engineering ───────────────────────────────────────────────────────

/**
 * System prompt được thiết kế theo nguyên tắc:
 * 1. Persona rõ ràng → LLM biết mình đang đóng vai gì
 * 2. Rules dạng list → dễ kiểm soát, dễ debug
 * 3. Glossary inject trực tiếp → tránh LLM "đoán"
 */
const SYSTEM_PROMPT_TEMPLATE = `Bạn là một chuyên gia kỹ thuật AI/Data Engineering với 10+ năm kinh nghiệm, đồng thời là một người dịch kỹ thuật chuyên nghiệp.

NHIỆM VỤ: Dịch đoạn văn kỹ thuật tiếng Anh sang tiếng Việt tự nhiên, phù hợp với kỹ sư Việt Nam trình độ trung cấp.

===QUYẾT ĐỊNH TUYỆT ĐỐI (HARD RULES — KHÔNG ĐƯỢC VI PHẠM)===

**RULE 1: GIỮ NGUYÊN PLACEHOLDER TAGS**
- Bất kỳ token nào có dạng <ASSET_CODE_001>, <ASSET_IMG_002>, <ASSET_URL_003> v.v. PHẢI ĐƯỢC GIỮ NGUYÊN 100%.
- Không thêm khoảng trắng, không dịch, không xóa, không di chuyển.
- Nếu placeholder nằm trong câu → giữ nguyên vị trí trong câu đó.

**RULE 2: GIỮ NGUYÊN THUẬT NGỮ GLOSSARY**
Các thuật ngữ sau KHÔNG được dịch:
{glossaryTerms}

**RULE 3: GIỮ NGUYÊN MARKDOWN SYNTAX**
- Heading (##, ###): giữ số dấu # và nội dung sau khi dịch
- Bold (**text**), Italic (*text*): giữ nguyên dấu
- List (-, 1., 2.): giữ nguyên format list
- Blockquote (>): giữ nguyên dấu >

===HƯỚNG DẪN DỊCH THUẬT (SOFT RULES)===

**Văn phong:**
- Ưu tiên nghĩa, không dịch word-by-word
- Dùng "chúng ta" thay vì "chúng tôi" khi xưng hô với người đọc
- Câu tiếng Anh dài → chia thành 2 câu tiếng Việt nếu cần
- Thuật ngữ kỹ thuật lần đầu xuất hiện → ghi "(tiếng Anh: term)" sau lần đầu

**Không thêm:**
- Không thêm lời giới thiệu như "Đây là bản dịch..."
- Không thêm giải thích ngoài nội dung gốc
- Không thêm chú thích trừ khi thực sự cần thiết`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadGlossary(): string {
  try {
    const raw = fs.readFileSync(GLOSSARY_PATH, "utf-8");
    const glossary = JSON.parse(raw);
    // Format thành dạng list cho prompt
    return (glossary.protected_terms as string[])
      .map(term => `  - ${term}`)
      .join("\n");
  } catch (e) {
    console.warn("[Translator] ⚠️ Không đọc được glossary.json:", e);
    return "  - (Không có glossary)";
  }
}

/**
 * Kiểm tra xem bản dịch có giữ nguyên tất cả ASSET tags không.
 * Log warning nếu thiếu — không throw error để pipeline tiếp tục.
 */
function validateTranslation(original: string, translated: string): void {
  const originalTags = original.match(/<ASSET_[A-Z]+_\d+>/g) ?? [];
  const translatedTags = translated.match(/<ASSET_[A-Z]+_\d+>/g) ?? [];

  const missingTags = originalTags.filter(tag => !translatedTags.includes(tag));
  if (missingTags.length > 0) {
    console.warn(`[Translator] ⚠️ ASSET tags bị mất trong bản dịch: ${missingTags.join(", ")}`);
    console.warn("[Translator] → Unmasker sẽ dùng bản gốc cho các tags này.");
  }
}

/**
 * Delay helper để tránh rate limit.
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Main Node ────────────────────────────────────────────────────────────────

export const translatorNode = async (
  state: InterpreterState
): Promise<Partial<InterpreterState>> => {
  const chapter = state.chapters[state.currentChapterIndex];

  if (!state.chunks || state.chunks.length === 0) {
    console.log("[Translator] ⚠️ Không có chunks để dịch.");
    return { translatedChunks: [], translatedContent: "" };
  }

  console.log(`\n[Translator] 🌐 Dịch chapter ${chapter?.index ?? "?"}: "${chapter?.title ?? "?"}"`);
  console.log(`[Translator] Tổng: ${state.chunks.length} chunks`);

  // Load glossary và khởi tạo model (lazy — sau khi dotenv đã load)
  const glossaryTerms = loadGlossary();
  const model = new ChatGoogleGenerativeAI({
    model: LLM_CONFIG.MODEL,
    temperature: LLM_CONFIG.TEMPERATURE,
    maxOutputTokens: LLM_CONFIG.MAX_OUTPUT_TOKENS,
    apiKey: process.env.GOOGLE_API_KEY?.trim(),
  });

  const systemPrompt = SYSTEM_PROMPT_TEMPLATE.replace("{glossaryTerms}", glossaryTerms);
  const promptTemplate = ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
    ["human", "Đây là nội dung cần dịch (chunk {chunkNum}/{totalChunks}):\n\n---\n{content}\n---\n\nHãy dịch toàn bộ nội dung trên sang tiếng Việt, tuân thủ tuyệt đối các HARD RULES đã nêu."]
  ]);

  const translatedChunks: string[] = [];

  // Sequential processing — giữ nhất quán thuật ngữ
  for (let i = 0; i < state.chunks.length; i++) {
    const chunk = state.chunks[i];
    console.log(`\n[Translator] ⏳ Chunk ${i + 1}/${state.chunks.length} (${chunk.length} chars)...`);

    let attempt = 0;
    let translated = "";

    while (attempt < 3) {
      try {
        const chain = promptTemplate.pipe(model);
        const response = await chain.invoke({
          chunkNum: String(i + 1),
          totalChunks: String(state.chunks.length),
          content: chunk,
        });

        translated = typeof response.content === "string"
          ? response.content
          : (response.content as any[]).map(c => c.text ?? "").join("");

        // Validate ASSET tags
        validateTranslation(chunk, translated);
        console.log(`[Translator] ✅ Chunk ${i + 1} xong (${translated.length} chars)`);
        break;

      } catch (error: any) {
        attempt++;
        if (attempt >= 3) {
          console.error(`[Translator] ❌ Chunk ${i + 1} thất bại sau 3 lần thử:`, error.message);
          // Graceful degradation: giữ nguyên chunk gốc
          translated = chunk;
        } else {
          const delay = LLM_CONFIG.RATE_LIMIT_DELAY_MS * attempt;
          console.warn(`[Translator] ⚠️ Lần ${attempt} thất bại. Error: ${error.message}. Thử lại sau ${delay}ms...`);
          await sleep(delay);
        }
      }
    }

    translatedChunks.push(translated);

    // Rate limit delay giữa các calls
    if (i < state.chunks.length - 1) {
      await sleep(LLM_CONFIG.RATE_LIMIT_DELAY_MS);
    }
  }

  // Ghép các chunks thành nội dung hoàn chỉnh
  const translatedContent = translatedChunks.join("\n\n");

  console.log(`\n[Translator] ✅ Hoàn tất: ${translatedChunks.length} chunks → ${translatedContent.length.toLocaleString()} chars`);

  return {
    translatedChunks,
    translatedContent,
  };
};
