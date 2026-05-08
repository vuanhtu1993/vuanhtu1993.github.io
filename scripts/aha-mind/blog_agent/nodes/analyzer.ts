import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { AhaMindState, ExtractedTerm } from "../state";

// Khởi tạo model - mặc định GPT-4o-mini hoặc GPT-4o cho tác vụ này
const model = new ChatOpenAI({
  modelName: "gpt-4o-mini", // Dùng bản mini cho MVP tốc độ cao và chi phí rẻ
  temperature: 0.2, // Temperature thấp để output ổn định, ít ảo giác
});

// Zod Schema ép Output phải là JSON chuẩn
const terminologySchema = z.object({
  terms: z.array(
    z.object({
      word: z.string().describe("Từ vựng tiếng Anh gốc trong văn bản"),
      explanation: z.string().describe("Giải thích nghĩa tiếng Việt ngắn gọn, súc tích"),
      cefrLevel: z.string().describe("Cấp độ CEFR ước tính (B2, C1, C2, Jargon)"),
      etymology: z.string().describe("Nguồn gốc từ hoặc bóc tách tiền tố/hậu tố (nếu có, nếu không để chuỗi rỗng)"),
      analogy: z.string().describe("Phép ẩn dụ hoặc so sánh dễ hiểu (nếu có, nếu không để chuỗi rỗng)"),
    })
  ).describe("Danh sách các từ khó, từ vựng chuyên ngành trong bài viết"),
});

// Ép model trả về schema
const structuredModel = model.withStructuredOutput(terminologySchema);

const SYSTEM_PROMPT = `Bạn là một chuyên gia ngôn ngữ, giảng viên CNTT sư phạm (Aha! Mind Educator).
Nhiệm vụ của bạn là đọc một bài báo kĩ thuật tiếng Anh, và tìm ra TẤT CẢ các từ khó (trình độ CEFR B2+, phrasal verbs, idioms) HOẶC các thuật ngữ chuyên ngành Jargon cần được giải thích cho kĩ sư người Việt (khuyến khích tìm ít nhất 30 từ nếu bài viết dài).
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
    const chain = promptTemplate.pipe(structuredModel);

    // Giới hạn content nếu quá dài để tiết kiệm token
    const truncatedContent = state.articleToProcess.content.substring(0, 15000);

    const response = await chain.invoke({
      title: state.articleToProcess.title,
      content: truncatedContent,
    });

    console.log(`[Analyzer] Successfully extracted ${response.terms.length} terms.`);
    return { extractedTerms: response.terms };
  } catch (error) {
    console.error("[Analyzer] Error during LLM analysis:", error);
    return { extractedTerms: [] };
  }
};
