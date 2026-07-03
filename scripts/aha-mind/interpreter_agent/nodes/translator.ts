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
 *
 * 4. [Fix #0] Technical terms → HARD RULE giữ nguyên tiếng Anh, không dịch.
 *
 * 5. [Fix #1] Book metadata (title, author, domain) inject vào system prompt.
 *    → LLM biết context sách, dùng đúng domain-specific terminology.
 *
 * 6. [Fix #2] Context overlap dùng BẢN DỊCH tiếng Việt (không phải bản gốc).
 *    → LLM anchor vào lựa chọn thuật ngữ đã xác lập, không re-derive từ tiếng Anh.
 */

import { ChatPromptTemplate } from "@langchain/core/prompts";
import * as fs from "fs";
import { InterpreterState } from "../state";
import { GLOSSARY_PATH, LLM_CONFIG, CHUNKING } from "../config";
import { geminiService } from "../../utils/gemini-service";

// ─── Prompt Engineering ───────────────────────────────────────────────────────

/**
 * System prompt được thiết kế theo nguyên tắc:
 * 1. Persona rõ ràng với domain cụ thể của sách → LLM biết mình đang đóng vai gì
 * 2. Rules dạng list → dễ kiểm soát, dễ debug
 * 3. Glossary inject trực tiếp → tránh LLM "đoán"
 * 4. [Fix #0] HARD RULE về technical terms — không cho phép dịch jargon
 * 5. [Fix #1] Placeholders cho book metadata: {bookTitle}, {bookAuthor}, {bookDomain}
 */
const SYSTEM_PROMPT_TEMPLATE = `Bạn là một chuyên gia kỹ thuật với 10+ năm kinh nghiệm trong lĩnh vực {bookDomain}, đồng thời là một người dịch kỹ thuật chuyên nghiệp.

THÔNG TIN SÁCH ĐANG ĐƯỢC DỊCH:
- Tên sách: {bookTitle}
- Tác giả: {bookAuthor}
- Domain: {bookDomain}

NHIỆM VỤ: Dịch đoạn văn kỹ thuật tiếng Anh sang tiếng Việt tự nhiên, phù hợp với kỹ sư Việt Nam trình độ trung cấp. Đảm bảo bản dịch trung thành với văn phong và thuật ngữ đặc thù của tác giả.

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

**RULE 4: GIỮ NGUYÊN TECHNICAL TERMS — KHÔNG DỊCH JARGON KỸ THUẬT**
- Tất cả thuật ngữ kỹ thuật, jargon, proper nouns trong lĩnh vực công nghệ → GIỮ NGUYÊN tiếng Anh.
- Ví dụ PHẢI GIỮ NGUYÊN: pipeline, cache, load balancer, database, server, client, queue, thread, process, instance, cluster, node, endpoint, payload, middleware, framework, runtime, deployment, container, replica, shard, index, schema, query, transaction, latency, throughput, bandwidth, bottleneck, scalability, availability, consistency, partition, fault tolerance, idempotent, stateless, stateful...
- Ví dụ ĐƯỢC DỊCH: câu hoàn chỉnh giải thích khái niệm, từ thông thường (ví dụ: "the system", "this approach", "in this chapter"...).
- TUYỆT ĐỐI KHÔNG dịch technical term rồi ghi chú "(tiếng Anh: ...)" — điều này ngớ ngẩn và không cần thiết.

===HƯỚNG DẪN DỊCH THUẬT (SOFT RULES)===

**Văn phong:**
- Ưu tiên nghĩa, không dịch word-by-word
- Dùng "chúng ta" thay vì "chúng tôi" khi xưng hô với người đọc
- Câu tiếng Anh dài → chia thành 2 câu tiếng Việt nếu cần

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
 * [Fix #1] Tự động suy ra domain của sách từ title bằng keyword matching.
 * Tại sao: Tránh thêm CLI flag --domain, giảm friction cho user.
 * Trade-off: Có thể suy sai với sách nằm ở giao điểm nhiều domain.
 */
function inferDomain(title: string): string {
  const t = title.toLowerCase();

  if (/machine learning|deep learning|neural|natural language|llm|transformer|generative|artificial intelligence/.test(t))
    return "AI & Machine Learning";

  if (/system design|distributed system|architecture|scalab|microservice|high availab/.test(t))
    return "System Design & Software Architecture";

  if (/data engineer|data pipeline|etl|elt|warehouse|lakehouse|apache spark|kafka|airflow/.test(t))
    return "Data Engineering";

  if (/devops|kubernetes|docker|ci\/cd|infrastructure|cloud|terraform|ansible/.test(t))
    return "DevOps & Cloud Infrastructure";

  if (/javascript|typescript|react|vue|angular|node|frontend|backend|web development/.test(t))
    return "Web Development";

  if (/database|sql|postgres|mysql|mongodb|redis|nosql/.test(t))
    return "Database Systems";

  if (/security|cryptograph|authentication|authorization|penetration/.test(t))
    return "Cybersecurity";

  if (/algorithm|data structure|competitive|leetcode/.test(t))
    return "Algorithms & Data Structures";

  // Fallback mặc định
  return "Software Engineering & Technology";
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

/**
 * [Fix #2] Tạo human prompt với context tiếng Việt từ chunk đã dịch trước.
 *
 * Tại sao inject BẢN DỊCH thay vì bản gốc:
 * - Bản gốc (tiếng Anh) → LLM phải re-derive lại cách dịch → có thể chọn khác nhau
 * - Bản dịch (tiếng Việt) → LLM anchor vào lựa chọn đã xác lập → nhất quán
 *
 * @param resolvedSystemPrompt - System prompt đã được replace tất cả placeholders (bookTitle, bookAuthor, bookDomain, glossaryTerms)
 * @param prevTranslated - 300 chars cuối của bản dịch chunk trước (hoặc null nếu chunk đầu tiên)
 *
 * BUG FIX: Phải nhận resolvedSystemPrompt làm tham số thay vì dùng SYSTEM_PROMPT_TEMPLATE trực tiếp.
 * Lý do: SYSTEM_PROMPT_TEMPLATE còn chứa {bookDomain}, {bookTitle}... → LangChain hiểu là
 * input variables → throw "Missing value for input variable 'bookDomain'" error.
 */
function buildHumanPrompt(resolvedSystemPrompt: string, prevTranslated: string | null): ChatPromptTemplate {
  const contextBlock = prevTranslated
    ? `[BẢN DỊCH đoạn trước — CHỈ ĐỂ THAM KHẢO, KHÔNG CẦN DỊCH LẠI — dùng để duy trì nhất quán thuật ngữ]:\n...${prevTranslated}\n\n---\n\n`
    : "";

  return ChatPromptTemplate.fromMessages([
    ["system", resolvedSystemPrompt],
    [
      "human",
      `${contextBlock}Đây là nội dung cần dịch (chunk {chunkNum}/{totalChunks}):\n\n---\n{content}\n---\n\nHãy dịch toàn bộ nội dung trong phần "---" cuối cùng sang tiếng Việt, tuân thủ tuyệt đối các HARD RULES đã nêu.`,
    ],
  ]);
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
  const model = geminiService.baseLlm;

  // [Fix #1] Suy ra domain và build system prompt với book metadata
  const bookDomain = inferDomain(state.bookMetadata.title);
  console.log(`[Translator] 📚 Book: "${state.bookMetadata.title}" | Domain: ${bookDomain}`);

  const systemPrompt = SYSTEM_PROMPT_TEMPLATE
    .replace("{glossaryTerms}", glossaryTerms)
    .replace(/\{bookTitle\}/g, state.bookMetadata.title)
    .replace(/\{bookAuthor\}/g, state.bookMetadata.originalAuthor)
    .replace(/\{bookDomain\}/g, bookDomain);

  const translatedChunks: string[] = [];

  // [Fix #2] Track 300 chars cuối của bản dịch chunk trước để làm context
  let lastTranslatedContext: string | null = null;

  // Sequential processing — giữ nhất quán thuật ngữ
  for (let i = 0; i < state.chunks.length; i++) {
    const chunk = state.chunks[i];
    console.log(`\n[Translator] ⏳ Chunk ${i + 1}/${state.chunks.length} (${chunk.length} chars)...`);

    let attempt = 0;
    let translated = "";

    while (attempt < 3) {
      try {
        // [Fix #2] Tạo prompt động với translated context từ chunk trước
        // Truyền systemPrompt (đã resolve tất cả placeholders) vào buildHumanPrompt
        const promptTemplate = buildHumanPrompt(systemPrompt, lastTranslatedContext);
        const messages = await promptTemplate.formatMessages({
          chunkNum: String(i + 1),
          totalChunks: String(state.chunks.length),
          content: chunk,
        });

        // geminiService.invoke sẽ tự động handle key rotation nếu gặp 429
        const response = await geminiService.invoke(messages);

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

    // [Fix #2] Cập nhật context: lấy 300 chars cuối của BẢN DỊCH tiếng Việt
    const overlapStart = Math.max(0, translated.length - CHUNKING.CONTEXT_OVERLAP_CHARS);
    lastTranslatedContext = translated.slice(overlapStart).trim();

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
