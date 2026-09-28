import * as dotenv from "dotenv";
dotenv.config();

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { geminiRateLimiter } from "./rate-limiter";

/**
 * Phân loại lỗi API — quyết định hành vi của Key Rotation.
 *
 * Tại sao cần phân loại?
 * Hệ thống cũ chỉ có 2 nhánh: "rate-limit → rotate" và "lỗi khác → crash".
 * Nhưng thực tế có 3 loại lỗi với hành vi hoàn toàn khác nhau:
 *
 * 1. RETRYABLE (429, 503, quota): Key vẫn sống, chỉ cần cooldown tạm thời.
 *    → Rotate sang key khác, quay lại sau.
 *
 * 2. FATAL_KEY (401, 403): Key chết vĩnh viễn (bị revoke, sai format, restricted domain).
 *    → Loại bỏ key khỏi pool VĨNH VIỄN, không bao giờ dùng lại.
 *
 * 3. UNKNOWN: Lỗi không xác định (network timeout, parse error, v.v.)
 *    → Throw ngay, không retry (để caller quyết định).
 */
type ErrorCategory = "RETRYABLE" | "FATAL_KEY" | "UNKNOWN";

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

  /**
   * Permanent Key Disabling — Loại bỏ key hỏng vĩnh viễn
   *
   * Tại sao tách riêng với cooldown?
   * - Cooldown = tạm thời (429/503), key sẽ hồi phục sau thời gian chờ.
   * - Disabled = vĩnh viễn (401/403), key đã chết, không bao giờ hồi phục.
   *
   * Nếu dùng chung cooldown cho cả 2 → key chết sẽ được "thử lại" sau 60s,
   * gây ra vòng lặp vô tận: dùng → 401 → cooldown → hết cooldown → dùng → 401...
   */
  private disabledKeys: Set<number> = new Set(); // keyIndex → permanently disabled
  private disabledReasons: Map<number, string> = new Map(); // keyIndex → reason for disabling

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
  // Startup Key Validation
  // ============================================================

  /**
   * Kiểm tra tất cả API keys bằng cách gọi API thật (ListModels endpoint).
   *
   * Tại sao cần?
   * Trước đây, pipeline chạy → gặp key hỏng → crash giữa chừng → mất dữ liệu đã xử lý.
   * Bằng cách validate tất cả keys TRƯỚC khi pipeline bắt đầu:
   * - Key hỏng bị loại ngay, pipeline không bao giờ chạm vào.
   * - User biết ngay key nào có vấn đề, không phải debug giữa chừng.
   * - Pipeline chỉ chạy khi có ít nhất 1 key healthy.
   *
   * Trade-off: Tốn thêm N HTTP requests khi khởi tạo (N = số keys).
   * Chấp nhận được vì chỉ chạy 1 lần duy nhất lúc startup.
   */
  public async validateKeys(): Promise<void> {
    console.log(`\n[GeminiService] 🔍 Validating ${this.apiKeys.length} API key(s)...`);

    const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";

    for (let i = 0; i < this.apiKeys.length; i++) {
      const key = this.apiKeys[i];
      const keyPrefix = key.substring(0, 8) + "...";

      try {
        // Gọi endpoint nhẹ nhất: ListModels (không tốn quota generateContent)
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}?key=${key}`
        );

        if (response.ok) {
          console.log(`  ✅ Key #${i + 1} (${keyPrefix}) — OK`);
        } else {
          const errorData = await response.json().catch(() => ({}));
          const errorCode = response.status;
          const errorMessage = (errorData as any)?.error?.message || response.statusText;

          if (errorCode === 400 || errorCode === 401 || errorCode === 403) {
            // Key chết vĩnh viễn (400 = invalid key, 401 = unauthorized, 403 = forbidden) — loại ngay
            this.disableKey(i, `Startup validation failed: ${errorCode} ${errorMessage}`);
            console.error(`  ❌ Key #${i + 1} (${keyPrefix}) — ${errorCode}: ${errorMessage}`);
          } else if (errorCode === 503) {
            // Server bận — key vẫn sống, chỉ service overloaded
            console.warn(`  ⚠️ Key #${i + 1} (${keyPrefix}) — 503 (Server busy, key vẫn hợp lệ)`);
          } else if (errorCode === 429) {
            // Rate-limited — key vẫn sống, chỉ hết quota tạm thời
            console.warn(`  ⚠️ Key #${i + 1} (${keyPrefix}) — 429 (Rate-limited, key vẫn hợp lệ)`);
          } else {
            console.warn(`  ⚠️ Key #${i + 1} (${keyPrefix}) — ${errorCode}: ${errorMessage} (giữ lại, sẽ retry runtime)`);
          }
        }
      } catch (error: any) {
        // Network error — key có thể vẫn sống, chỉ mạng có vấn đề
        console.warn(`  ⚠️ Key #${i + 1} (${keyPrefix}) — Network error: ${error.message} (giữ lại)`);
      }
    }

    // Kiểm tra còn bao nhiêu key healthy
    const healthyCount = this.getHealthyKeyCount();
    const totalCount = this.apiKeys.length;
    const disabledCount = this.disabledKeys.size;

    console.log(`\n[GeminiService] 📊 Validation Summary: ${healthyCount}/${totalCount} keys healthy, ${disabledCount} disabled`);

    if (healthyCount === 0) {
      console.error("\n[GeminiService] ❌ FATAL: Không còn API key nào hoạt động!");
      this.printKeyStatusTable();
      process.exit(1);
    }

    // Đảm bảo currentKeyIndex trỏ tới key healthy đầu tiên
    if (this.disabledKeys.has(this.currentKeyIndex)) {
      this.advanceToNextHealthyKey();
    }
  }

  // ============================================================
  // Error Classification
  // ============================================================

  /**
   * Phân loại lỗi từ API response.
   *
   * Tại sao pattern matching thay vì check HTTP status code?
   * Vì LangChain wrap lỗi gốc trong Error.message, ta không có access trực tiếp
   * tới HTTP status code. Phải parse message string.
   */
  private classifyError(error: any): ErrorCategory {
    const errMsg = error?.message?.toLowerCase() || "";

    // FATAL_KEY: Key chết vĩnh viễn — không bao giờ retry
    if (
      errMsg.includes("400") ||
      errMsg.includes("401") ||
      errMsg.includes("403") ||
      errMsg.includes("unauthorized") ||
      errMsg.includes("forbidden") ||
      errMsg.includes("access_token_type_unsupported") ||
      errMsg.includes("invalid authentication") ||
      errMsg.includes("api key not valid") ||
      errMsg.includes("api_key_invalid")
    ) {
      return "FATAL_KEY";
    }

    // RETRYABLE: Key vẫn sống, chỉ cần cooldown hoặc chờ server
    if (
      errMsg.includes("429") ||
      errMsg.includes("quota") ||
      errMsg.includes("exhausted") ||
      errMsg.includes("503") ||
      errMsg.includes("resource_exhausted") ||
      errMsg.includes("overloaded") ||
      errMsg.includes("high demand") ||
      errMsg.includes("unavailable")
    ) {
      return "RETRYABLE";
    }

    return "UNKNOWN";
  }

  // ============================================================
  // Key Management
  // ============================================================

  /**
   * Loại bỏ key vĩnh viễn khỏi rotation pool.
   * Key bị disabled sẽ KHÔNG BAO GIỜ được dùng lại trong session này.
   */
  private disableKey(keyIndex: number, reason: string): void {
    this.disabledKeys.add(keyIndex);
    this.disabledReasons.set(keyIndex, reason);
    // Xóa khỏi cooldown nếu đang có (không cần cooldown cho key đã chết)
    this.keyCooldowns.delete(keyIndex);
  }

  /**
   * Đếm số key còn hoạt động (không bị disabled)
   */
  private getHealthyKeyCount(): number {
    return this.apiKeys.length - this.disabledKeys.size;
  }

  /**
   * In bảng trạng thái tất cả keys — dùng khi cần debug hoặc khi hết key.
   */
  private printKeyStatusTable(): void {
    console.log("\n[GeminiService] 📋 Key Status Table:");
    console.log("─".repeat(80));
    console.log(
      "  #  │ Prefix       │ Status     │ Reason"
    );
    console.log("─".repeat(80));

    for (let i = 0; i < this.apiKeys.length; i++) {
      const prefix = this.apiKeys[i].substring(0, 12) + "...";
      const isDisabled = this.disabledKeys.has(i);
      const isCurrent = i === this.currentKeyIndex;
      const status = isDisabled ? "❌ DISABLED" : isCurrent ? "🟢 ACTIVE " : "⚪ STANDBY ";
      const reason = this.disabledReasons.get(i) || "";

      console.log(`  ${String(i + 1).padStart(2)} │ ${prefix.padEnd(12)} │ ${status} │ ${reason}`);
    }

    console.log("─".repeat(80));
    console.log(
      `  Total: ${this.apiKeys.length} | Healthy: ${this.getHealthyKeyCount()} | Disabled: ${this.disabledKeys.size}`
    );
  }

  /**
   * Tìm key healthy tiếp theo (bỏ qua key disabled).
   * Nếu không còn key nào → throw error rõ ràng.
   */
  private advanceToNextHealthyKey(): void {
    const totalKeys = this.apiKeys.length;

    for (let i = 1; i <= totalKeys; i++) {
      const candidateIndex = (this.currentKeyIndex + i) % totalKeys;
      if (!this.disabledKeys.has(candidateIndex)) {
        this.currentKeyIndex = candidateIndex;
        this.initLlm();
        return;
      }
    }

    // Không còn key nào healthy
    this.printKeyStatusTable();
    throw new Error(
      `[GeminiService] ❌ FATAL: Tất cả ${totalKeys} API key(s) đều đã bị disabled. ` +
      `Không thể tiếp tục. Vui lòng kiểm tra API keys trong .env.`
    );
  }

  // ============================================================
  // Circular Key Rotation (upgraded)
  // ============================================================

  /**
   * Đánh dấu key hiện tại là "exhausted" (rate-limited) và tìm key tiếp theo khả dụng.
   * Quay vòng circular: 0 → 1 → 2 → 0 → 1 → ...
   * BỎ QUA key đã bị disabled (401/403).
   * Nếu tất cả healthy keys đều trong cooldown → chờ key sớm nhất hết cooldown.
   *
   * @returns luôn trả về true nếu còn key healthy, throw nếu hết key.
   */
  private async rotateKey(): Promise<boolean> {
    // Đánh dấu key hiện tại vào cooldown
    this.keyCooldowns.set(
      this.currentKeyIndex,
      Date.now() + this.KEY_COOLDOWN_MS
    );

    const totalKeys = this.apiKeys.length;

    // Thử từng key theo thứ tự circular, BỎ QUA key disabled
    for (let i = 1; i <= totalKeys; i++) {
      const candidateIndex = (this.currentKeyIndex + i) % totalKeys;

      // Skip key đã bị disabled vĩnh viễn
      if (this.disabledKeys.has(candidateIndex)) continue;

      const cooldownUntil = this.keyCooldowns.get(candidateIndex);

      if (!cooldownUntil || Date.now() >= cooldownUntil) {
        // Key này khả dụng — sử dụng ngay
        this.keyCooldowns.delete(candidateIndex);
        this.currentKeyIndex = candidateIndex;
        console.log(
          `\n[GeminiService] 🔄 Rotate → Key #${candidateIndex + 1}/${totalKeys} ` +
          `(${this.getHealthyKeyCount()} healthy keys remaining)`
        );
        this.initLlm();
        return true;
      }
    }

    // Tất cả healthy keys đều trong cooldown → tìm key sớm nhất hết cooldown và chờ
    let shortestWait = Infinity;
    let bestKeyIndex = -1;

    for (const [keyIndex, cooldownUntil] of this.keyCooldowns.entries()) {
      // Bỏ qua key disabled
      if (this.disabledKeys.has(keyIndex)) continue;

      const remaining = cooldownUntil - Date.now();
      if (remaining < shortestWait) {
        shortestWait = remaining;
        bestKeyIndex = keyIndex;
      }
    }

    // Nếu không tìm được key nào healthy (tất cả đã disabled)
    if (bestKeyIndex === -1) {
      this.printKeyStatusTable();
      throw new Error(
        `[GeminiService] ❌ FATAL: Tất cả API key(s) đều đã bị disabled. ` +
        `Không thể tiếp tục. Vui lòng kiểm tra API keys trong .env.`
      );
    }

    // Chờ + buffer 500ms
    const waitMs = Math.max(0, shortestWait) + 500;
    console.log(
      `\n[GeminiService] ⏳ Tất cả ${this.getHealthyKeyCount()} healthy key(s) đều trong cooldown. ` +
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
  // Execute with Rate Limiting + Key Rotation (upgraded)
  // ============================================================

  /**
   * Bọc operation trong Rate Limiter + Key Rotation.
   *
   * Flow nâng cấp:
   *   Rate Limiter (Token Bucket) → Execute
   *     → Nếu 429/503 (RETRYABLE) → Rotate Key → Retry
   *     → Nếu 401/403 (FATAL_KEY) → Disable Key vĩnh viễn → Rotate → Retry
   *     → Nếu lỗi khác (UNKNOWN) → Throw ngay (để caller xử lý)
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
          const category = this.classifyError(error);

          if (category === "FATAL_KEY") {
            // Key chết vĩnh viễn — disable và rotate
            const keyPrefix = this.apiKeys[this.currentKeyIndex]?.substring(0, 8) + "...";
            const reason = `Runtime error: ${error.message?.substring(0, 100)}`;
            this.disableKey(this.currentKeyIndex, reason);

            console.error(
              `\n[GeminiService] ❌ Key #${this.currentKeyIndex + 1} (${keyPrefix}) bị lỗi xác thực (401/403). ` +
              `Key đã bị LOẠI BỎ VĨNH VIỄN khỏi rotation pool.`
            );
            console.warn(
              `[GeminiService] 📊 Còn lại: ${this.getHealthyKeyCount()}/${this.apiKeys.length} healthy key(s)`
            );

            // Tìm key healthy tiếp theo (throw nếu hết key)
            this.advanceToNextHealthyKey();
            continue; // Retry với key mới
          }

          if (category === "RETRYABLE") {
            console.warn(
              `[GeminiService] ⚠️ Rate-limit/503 ở Key #${this.currentKeyIndex + 1}. Rotating...`
            );
            await this.rotateKey(); // async, có thể chờ nếu tất cả healthy keys cooldown
            continue; // Retry với key mới
          }
        }

        // UNKNOWN error — throw ngay, kèm context cho dễ debug
        throw error;
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
