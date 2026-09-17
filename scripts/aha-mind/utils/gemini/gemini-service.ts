import * as dotenv from "dotenv";
dotenv.config();

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { geminiRateLimiter } from "./rate-limiter";

export class GeminiService {
  private static instance: GeminiService;
  private llm!: ChatGoogleGenerativeAI;

  private apiKeys: string[] = [];
  private currentKeyIndex: number = 0;

  /**
   * Circular Key Rotation — Cooldown tracking
   *
   * Tại sao cần? Hệ thống cũ chỉ rotate một chiều (0 → 1 → 2 → crash).
   * Nếu key #0 bị rate-limit tạm thời (60s), hệ thống chuyển sang key #1,
   * nhưng KHÔNG BAO GIỜ quay lại key #0 dù nó đã hết cooldown.
   *
   * Giải pháp: Track cooldown timestamp cho mỗi key, quay vòng circular,
   * chờ nếu tất cả keys đều trong cooldown (thay vì crash).
   */
  private keyCooldowns: Map<number, number> = new Map(); // keyIndex → cooldownEndTimestamp
  private readonly KEY_COOLDOWN_MS = 60_000; // 1 phút cooldown cho mỗi key bị 429

  // Expose llm for cases where custom temp/maxTokens is needed, though prefer using methods below.
  public get baseLlm(): ChatGoogleGenerativeAI {
    return this.llm;
  }

  private constructor() {
    this.initKeys();
    this.initLlm();
  }

  private initKeys() {
    const keys: string[] = [];

    // Quét toàn bộ biến môi trường, lấy những biến bắt đầu bằng GOOGLE_API_KEY
    for (const [key, value] of Object.entries(process.env)) {
      if (key.startsWith("GOOGLE_API_KEY") && value) {
        // Cắt bằng dấu phẩy đề phòng user khai báo 1 biến có nhiều key, và dọn dẹp khoảng trắng
        const extractedKeys = value.split(",").map(k => k.trim()).filter(k => k.length > 0);
        keys.push(...extractedKeys);
      }
    }

    // Xóa các key trùng lặp
    this.apiKeys = Array.from(new Set(keys));

    if (this.apiKeys.length === 0) {
      console.error("[GeminiService] ❌ Không tìm thấy API Key nào trong .env (các biến bắt đầu bằng GOOGLE_API_KEY)");
      process.exit(1);
    }

    console.log(`[GeminiService] 🔑 Loaded ${this.apiKeys.length} API key(s) — Circular Rotation enabled`);
  }

  private initLlm() {
    const currentKey = this.apiKeys[this.currentKeyIndex] || "";
    this.llm = new ChatGoogleGenerativeAI({
      apiKey: currentKey,
      model: process.env.GEMINI_MODEL || "gemini-3.5-flash",
      maxRetries: 0,
    });
  }

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  // ============================================================
  // Circular Key Rotation
  // ============================================================

  /**
   * Đánh dấu key hiện tại là "exhausted" và tìm key tiếp theo khả dụng.
   * Quay vòng circular: 0 → 1 → 2 → 0 → 1 → ...
   * Nếu tất cả keys đều trong cooldown → chờ key sớm nhất hết cooldown.
   *
   * @returns luôn trả về true (không bao giờ crash, chỉ chờ)
   */
  private async rotateKey(): Promise<boolean> {
    // Đánh dấu key hiện tại vào cooldown
    this.keyCooldowns.set(
      this.currentKeyIndex,
      Date.now() + this.KEY_COOLDOWN_MS
    );

    const totalKeys = this.apiKeys.length;

    // Thử từng key theo thứ tự circular
    for (let i = 1; i <= totalKeys; i++) {
      const candidateIndex = (this.currentKeyIndex + i) % totalKeys;
      const cooldownUntil = this.keyCooldowns.get(candidateIndex);

      if (!cooldownUntil || Date.now() >= cooldownUntil) {
        // Key này khả dụng — sử dụng ngay
        this.keyCooldowns.delete(candidateIndex);
        this.currentKeyIndex = candidateIndex;
        console.log(
          `\n[GeminiService] 🔄 Rotate → Key #${candidateIndex + 1}/${totalKeys}`
        );
        this.initLlm();
        return true;
      }
    }

    // Tất cả keys đều trong cooldown → tìm key sớm nhất hết cooldown và chờ
    let shortestWait = Infinity;
    let bestKeyIndex = 0;

    for (const [keyIndex, cooldownUntil] of this.keyCooldowns.entries()) {
      const remaining = cooldownUntil - Date.now();
      if (remaining < shortestWait) {
        shortestWait = remaining;
        bestKeyIndex = keyIndex;
      }
    }

    // Chờ + buffer 500ms
    const waitMs = Math.max(0, shortestWait) + 500;
    console.log(
      `\n[GeminiService] ⏳ Tất cả ${totalKeys} key(s) đều trong cooldown. ` +
      `Chờ ${Math.ceil(waitMs / 1000)}s cho Key #${bestKeyIndex + 1}...`
    );
    await new Promise(resolve => setTimeout(resolve, waitMs));

    // Sau khi chờ, clear cooldown và sử dụng key này
    this.keyCooldowns.delete(bestKeyIndex);
    this.currentKeyIndex = bestKeyIndex;
    console.log(
      `[GeminiService] ✅ Key #${bestKeyIndex + 1}/${totalKeys} đã hết cooldown, sử dụng lại.`
    );
    this.initLlm();
    return true;
  }

  // ============================================================
  // Execute with Rate Limiting + Key Rotation
  // ============================================================

  /**
   * Bọc operation trong Rate Limiter + Key Rotation.
   * Flow: Rate Limiter (Token Bucket) → Execute → Nếu 429 → Rotate Key → Retry
   */
  private async executeWithRotation<T>(
    estimatedTokens: number,
    operation: (model: ChatGoogleGenerativeAI) => Promise<T>,
    customLlm?: ChatGoogleGenerativeAI
  ): Promise<T> {
    while (true) {
      try {
        return await geminiRateLimiter.execute(estimatedTokens, async () => {
          const modelToUse = customLlm || this.llm;
          return await operation(modelToUse);
        });
      } catch (error: any) {
        // Chỉ rotate nếu sử dụng default LLM (customLlm bypass rotation)
        if (!customLlm) {
          const errMsg = error?.message?.toLowerCase() || '';
          if (
            errMsg.includes('429') ||
            errMsg.includes('quota') ||
            errMsg.includes('exhausted') ||
            errMsg.includes('503') ||
            errMsg.includes('resource_exhausted')
          ) {
            console.warn(
              `[GeminiService] ⚠️ Rate-limit hit ở Key #${this.currentKeyIndex + 1}. Rotating...`
            );
            await this.rotateKey(); // async, có thể chờ nếu tất cả keys cooldown
            continue; // Retry với key mới
          }
        }
        throw error; // Lỗi khác (không phải rate-limit) → throw
      }
    }
  }

  // ============================================================
  // Public API
  // ============================================================

  /**
   * Gọi LLM thông thường (trả về nội dung dạng text).
   * Tự động ước tính số lượng tokens để truyền cho Rate Limiter.
   */
  public async invoke(messages: any[], customLlm?: ChatGoogleGenerativeAI): Promise<any> {
    const textContent = messages.map(m => m.content?.toString() || "").join("\\n");
    const estimatedTokens = Math.ceil(textContent.length / 4);

    return await this.executeWithRotation(estimatedTokens, async (model) => {
      return await model.invoke(messages);
    }, customLlm);
  }

  /**
   * Gọi LLM trả về Structured Output (JSON).
   */
  public async invokeStructured(schema: any, prompt: string | any[], customLlm?: ChatGoogleGenerativeAI): Promise<any> {
    const promptText = typeof prompt === "string"
      ? prompt
      : prompt.map(m => m.content?.toString() || "").join("\\n");

    const estimatedTokens = Math.ceil(promptText.length / 4);

    return await this.executeWithRotation(estimatedTokens, async (model) => {
      const structuredLlm = model.withStructuredOutput(schema);
      return await structuredLlm.invoke(prompt);
    }, customLlm);
  }
}

export const geminiService = GeminiService.getInstance();
