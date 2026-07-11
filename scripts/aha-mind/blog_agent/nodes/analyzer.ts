import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { AhaMindState, ExtractedTerm } from "../state";
import { geminiService } from "../../utils/gemini";

/**
 * Zod Schema defines the structured output format for the LLM.
 * We ensure it matches the ExtractedTerm interface from the state.
 */
const terminologySchema = z.object({
  terms: z.array(
    z.object({
      word: z.string().describe("Từ vựng tiếng Anh gốc trong văn bản"),
      explanation: z.string().describe("Giải thích nghĩa tiếng Việt ngắn gọn, súc tích"),
      cefrLevel: z.string().describe("Cấp độ CEFR ước tính (B1, B2, C1, C2, Jargon)"),
      etymology: z.string().describe("Nguồn gốc từ hoặc bóc tách tiền tố/hậu tố (nếu có, nếu không để chuỗi rỗng)"),
      analogy: z.string().describe("Phép ẩn dụ hoặc so sánh dễ hiểu (nếu có, nếu không để chuỗi rỗng)"),
    })
  ).describe("Danh sách các từ khó, từ vựng chuyên ngành trong bài viết"),
});

const SYSTEM_PROMPT = `Bạn là một chuyên gia ngôn ngữ, giảng viên CNTT sư phạm (Aha! Mind Educator).
Nhiệm vụ của bạn là đọc một bài báo kĩ thuật tiếng Anh, và tìm ra TẤT CẢ các từ khó (trình độ CEFR B1+, phrasal verbs, idioms) HOẶC các thuật ngữ chuyên ngành Jargon cần được giải thích cho kĩ sư người Việt (khuyến khích tìm ít nhất 20 từ nếu bài viết dài).
QUY TẮC "GIẢI PHẪU ĐỊNH NGHĨA":
1. Không dịch Word-to-Word. Phải bóc tách ý nghĩa cốt lõi.
2. Dùng phép ẩn dụ nếu đó là một thuật ngữ trừu tượng.
3. Giải thích ngắn gọn (tối đa 2-3 câu).`;

const promptTemplate = ChatPromptTemplate.fromMessages([
  ["system", SYSTEM_PROMPT],
  ["human", "Vui lòng phân tích bài viết sau và trích xuất các từ khó:\n\nTiêu đề: {title}\n\nNội dung:\n{content}"]
]);

export const cefrAnalyzerNode = async (state: AhaMindState): Promise<Partial<AhaMindState>> => {
  if (!state.articleToProcess) {
    console.log("[Analyzer] No article to process. Skipping.");
    return { extractedTerms: [] };
  }

  console.log(`[Analyzer] Analyzing text for: ${state.articleToProcess.title}`);

  try {
    // Tăng giới hạn content để tận dụng context window lớn của Gemini 1.5 Flash (1M tokens)
    // 50,000 chars ~ 12k-15k tokens, thoải mái cho hầu hết bài blog kỹ thuật.
    const truncatedContent = state.articleToProcess.content.substring(0, 50000);

    // Format prompt messages
    const messages = await promptTemplate.formatMessages({
      title: state.articleToProcess!.title,
      content: truncatedContent,
    });

    // Gọi LLM thông qua geminiService.invokeStructured (hỗ trợ tự động xoay key khi hết RPD)
    const response = await geminiService.invokeStructured(terminologySchema, messages);

    // Ép kiểu response.terms thành ExtractedTerm[] để đảm bảo type safety
    const extractedTerms = response.terms as ExtractedTerm[];

    console.log(`[Analyzer] Successfully extracted ${extractedTerms.length} terms.`);
    return { extractedTerms };
  } catch (error) {
    console.error("[Analyzer] Error during LLM analysis:", error);
    return { extractedTerms: [] };
  }
};
