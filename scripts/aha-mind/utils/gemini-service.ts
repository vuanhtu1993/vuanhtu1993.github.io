import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { geminiRateLimiter } from "./rate-limiter";

export class GeminiService {
  private static instance: GeminiService;
  private llm: ChatGoogleGenerativeAI;
  
  // Expose llm for cases where custom temp/maxTokens is needed, though prefer using methods below.
  public readonly baseLlm: ChatGoogleGenerativeAI;

  private constructor() {
    this.baseLlm = new ChatGoogleGenerativeAI({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      temperature: 0.1, // Default temperature, can be customized locally if needed
      maxRetries: 2,
    });
    this.llm = this.baseLlm;
  }

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  /**
   * Gọi LLM thông thường (trả về nội dung dạng text).
   * Tự động ước tính số lượng tokens để truyền cho Rate Limiter.
   * 
   * @param messages Mảng các messages (SystemMessage, HumanMessage,...)
   * @param customLlm Có thể truyền LLM tùy chỉnh (vd: set temperature = 0) nếu không dùng mặc định
   */
  public async invoke(messages: any[], customLlm?: ChatGoogleGenerativeAI): Promise<any> {
    const textContent = messages.map(m => m.content?.toString() || "").join("\\n");
    const estimatedTokens = Math.ceil(textContent.length / 4);

    return await geminiRateLimiter.execute(estimatedTokens, async () => {
      const modelToUse = customLlm || this.llm;
      return await modelToUse.invoke(messages);
    });
  }

  /**
   * Gọi LLM trả về Structured Output (JSON).
   * 
   * @param schema Schema Zod để ép kiểu output
   * @param prompt Chuỗi prompt hoặc mảng messages
   * @param customLlm Tùy chọn truyền LLM nếu cần override params
   */
  public async invokeStructured(schema: any, prompt: string | any[], customLlm?: ChatGoogleGenerativeAI): Promise<any> {
    const promptText = typeof prompt === "string" 
      ? prompt 
      : prompt.map(m => m.content?.toString() || "").join("\\n");
      
    const estimatedTokens = Math.ceil(promptText.length / 4);

    return await geminiRateLimiter.execute(estimatedTokens, async () => {
      const modelToUse = customLlm || this.llm;
      const structuredLlm = modelToUse.withStructuredOutput(schema);
      return await structuredLlm.invoke(prompt);
    });
  }
  /**
   * Gọi LLM thông qua Langchain Chain.
   */
  public async invokeChain(chain: any, input: any, estimatedTokens: number): Promise<any> {
    return await geminiRateLimiter.execute(estimatedTokens, async () => {
      return await chain.invoke(input);
    });
  }
}

export const geminiService = GeminiService.getInstance();
