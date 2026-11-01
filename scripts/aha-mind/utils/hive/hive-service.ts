import * as dotenv from "dotenv";
dotenv.config();

import axios, { AxiosInstance } from "axios";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import {
  HiveCallOptions,
  HiveInvokeResult,
  HiveMessage,
  HiveRole,
  HiveStreamChunk,
} from "./hive.interface";
import { TokenBucket } from "./token-bucket";

/**
 * Service tích hợp The Hive AI (GLM-5.3-Flash / DeepSeek / Reasoning Models).
 *
 * Triết lý thiết kế (Design Philosophy):
 * - Độc lập (Decoupled): Không phụ thuộc vào NestJS, chạy độc lập trên TypeScript runtime.
 * - Singleton Pattern: Tương thích kiến trúc với GeminiService (`HiveService.getInstance()`).
 * - Tương thích ngược (Backward Compatibility): `invoke` trả về `{ content, text, usage }` để
 *   các Node đọc `response.content` (như translator.ts) hoạt động trơn tru.
 * - Structured Output: `invokeStructured` trả về trực tiếp object đã parse `T`, trang bị
 *   Định luật Postel (Postel's Law - Auto-healing) và Fail-fast guard khi cạn token reasoning.
 * - Kiểm soát lưu lượng: Token Bucket (5 req/s) và Exponential Backoff khi gặp 429/5xx.
 *
 * Made by Anh Tu - Share to be share
 */
export class HiveService {
  private static instance: HiveService;
  private client!: AxiosInstance;
  private apiKey: string = "";
  private defaultModel: string = "zai-org/glm-5.3-flash";
  private baseUrl: string = "https://api.thehive.ai/api/v3";
  private tokenBucket: TokenBucket;

  private constructor() {
    this.tokenBucket = new TokenBucket(5, 200);
    this.init();
  }

  public static getInstance(): HiveService {
    if (!HiveService.instance) {
      HiveService.instance = new HiveService();
    }
    return HiveService.instance;
  }

  private init() {
    this.apiKey = process.env.HIVE_API_KEY || "";
    this.defaultModel = process.env.HIVE_MODEL || "zai-org/glm-5.3-flash";
    this.baseUrl = process.env.HIVE_BASE_URL || "https://api.thehive.ai/api/v3";

    if (!this.apiKey) {
      console.warn("[HiveService] ⚠️ HIVE_API_KEY chưa được cấu hình trong .env. Các lệnh gọi Hive API sẽ bị từ chối.");
    } else {
      console.log(`[HiveService] 🔑 HiveService đã sẵn sàng (Model mặc định: ${this.defaultModel}).`);
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      // Timeout 90 giây vì mô hình reasoning có thể mất vài giây suy luận trước khi nhả token
      timeout: 90000,
    });
  }

  private ensureApiKey(): void {
    if (!this.apiKey) {
      throw new Error(
        "[HiveService] ❌ HIVE_API_KEY không tồn tại trong .env. Vui lòng cấu hình HIVE_API_KEY."
      );
    }
  }

  /**
   * Kiểm tra tính hợp lệ của API Key và khả năng kết nối tới The Hive API.
   */
  public async validateKey(): Promise<boolean> {
    this.ensureApiKey();
    console.log(`[HiveService] 🔍 Đang kiểm tra kết nối tới The Hive API (${this.baseUrl})...`);

    try {
      const response = await this.client.post(
        "/chat/completions",
        {
          model: this.defaultModel,
          max_tokens: 5,
          messages: [{ role: "user", content: "ping" }],
        },
        {
          headers: {
            authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      if (response.status === 200) {
        console.log(`[HiveService] ✅ Kết nối The Hive API thành công! Model: ${this.defaultModel}`);
        return true;
      }
      return false;
    } catch (error: any) {
      const errMsg = error?.response?.data ? JSON.stringify(error.response.data) : error.message;
      console.error(`[HiveService] ❌ Kiểm tra Hive API Key thất bại: ${errMsg}`);
      throw new Error(`[HiveService] Xác thực API Key không thành công: ${errMsg}`);
    }
  }

  /**
   * Chuẩn hoá messages từ nhiều nguồn (LangChain BaseMessage, format { role, content }, v.v.)
   */
  private normalizeMessages(messages: any[]): HiveMessage[] {
    return messages.map((m) => {
      if (typeof m === "string") {
        return { role: "user" as HiveRole, content: m };
      }

      let role: HiveRole = "user";
      const rawRole = m.role || (typeof m.getType === "function" ? m.getType() : m._getType ? m._getType() : "");

      if (rawRole === "system") role = "system";
      else if (rawRole === "assistant" || rawRole === "ai") role = "assistant";
      else role = "user";

      const content = typeof m.content === "string" ? m.content : JSON.stringify(m.content || "");
      return { role, content };
    });
  }

  /**
   * Thực thi request có kiểm soát Token Bucket và cơ chế Exponential Backoff khi gặp 429 hoặc 5xx.
   */
  private async executeWithThrottling<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
    let attempt = 0;
    while (attempt <= maxRetries) {
      await this.tokenBucket.acquireToken();
      try {
        return await fn();
      } catch (error: any) {
        attempt++;
        const status = error?.response?.status;
        if ((status === 429 || (status && status >= 500)) && attempt <= maxRetries) {
          const backoff = Math.pow(2, attempt) * 1000 + Math.random() * 500;
          console.warn(
            `[HiveService] ⚠️ Hive API trả về HTTP ${status}. Tự động chờ ${Math.round(backoff)}ms để retry (Lần ${attempt}/${maxRetries})...`
          );
          await new Promise((r) => setTimeout(r, backoff));
          continue;
        }
        throw error;
      }
    }
    throw new Error("[HiveService] Đã vượt quá số lần retry cho phép.");
  }

  /**
   * Làm sạch chuỗi JSON nếu model sơ suất kẹp backticks ```json ... ```
   */
  public sanitizeJsonContent(content: string): string {
    return (content || "{}")
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
  }

  /**
   * Định luật Postel (Robustness Principle): tự động chữa lành các biến thể JSON do LLM sinh ra.
   */
  public healStructuredOutput<T>(schema: z.ZodSchema<T> | any, parsedJson: any): any {
    if (!schema || typeof schema.parse !== "function") {
      return parsedJson;
    }

    try {
      return schema.parse(parsedJson);
    } catch (firstErr: any) {
      let healed = false;
      let validatedData: any;

      // Biến thể A: LLM trả về array [...] thay vì { items: [...] }
      if (Array.isArray(parsedJson)) {
        try {
          validatedData = schema.parse({ items: parsedJson });
          healed = true;
        } catch {}
      }

      // Biến thể B: LLM trả về { data: [...] } hoặc { keywords: [...] } thay vì { items: [...] }
      if (!healed && parsedJson && typeof parsedJson === "object") {
        const arrayKey = Object.keys(parsedJson).find((k) => Array.isArray(parsedJson[k]));
        if (arrayKey && arrayKey !== "items") {
          try {
            validatedData = schema.parse({ items: parsedJson[arrayKey] });
            healed = true;
          } catch {}
        }
      }

      // Biến thể C: LLM chỉ trả về 1 object đơn lẻ { word: "...", explanation: "..." } thay vì { items: [{...}] }
      if (!healed && parsedJson && typeof parsedJson === "object" && (parsedJson.word || parsedJson.name)) {
        try {
          validatedData = schema.parse({ items: [parsedJson] });
          healed = true;
        } catch {}
      }

      if (healed) {
        return validatedData;
      }

      throw firstErr;
    }
  }

  /**
   * Gọi LLM trả về văn bản thông thường và token usage.
   *
   * @param messages Danh sách tin nhắn dạng mảng { role, content } hoặc LangChain messages
   * @param options Tuỳ chọn tham số (temperature, maxTokens, model)
   */
  public async invoke(
    messages: HiveMessage[] | any[],
    options?: HiveCallOptions
  ): Promise<HiveInvokeResult> {
    this.ensureApiKey();

    const model = options?.model || this.defaultModel;
    const temperature = options?.temperature ?? 0.1;
    const maxTokens = options?.maxTokens ?? 4096;

    const payload = {
      model,
      temperature,
      max_tokens: maxTokens,
      stream: false,
      messages: this.normalizeMessages(messages),
    };

    try {
      const response = await this.executeWithThrottling(() =>
        this.client.post("/chat/completions", payload, {
          headers: {
            authorization: `Bearer ${this.apiKey}`,
          },
        })
      );

      const choice = response.data?.choices?.[0];
      const message = choice?.message;
      const usage = response.data?.usage || {};
      const outputText = message?.content || "";

      return {
        content: outputText,
        text: outputText,
        reasoning: message?.reasoning || undefined,
        usage: {
          promptTokens: usage.prompt_tokens || 0,
          completionTokens: usage.completion_tokens || 0,
          totalTokens: usage.total_tokens || 0,
          reasoningTokens: usage.completion_tokens_details?.reasoning_tokens || 0,
        },
      };
    } catch (error: any) {
      const errMsg = error?.response?.data ? JSON.stringify(error.response.data) : error.message;
      console.error(`[HiveService] ❌ Lỗi Hive API Completion: ${errMsg}`);
      throw error;
    }
  }

  /**
   * Gọi LLM trả về JSON Structured Output tuân theo Zod Schema.
   * Trả về trực tiếp đối tượng T để tương thích 100% với các agent hiện có.
   *
   * @param schema Zod Schema định nghĩa cấu trúc dữ liệu mong đợi
   * @param prompt Câu lệnh hoặc mảng tin nhắn đầu vào
   * @param options Tuỳ chọn tham số (temperature, model, maxTokens)
   */
  public async invokeStructured<T = any>(
    schema: z.ZodSchema<T> | any,
    prompt: string | HiveMessage[] | any[],
    options?: HiveCallOptions
  ): Promise<T> {
    this.ensureApiKey();

    const model = options?.model || this.defaultModel;
    const temperature = options?.temperature ?? 0.1;
    const maxTokens = options?.maxTokens ?? 8192;

    const rawMessages =
      typeof prompt === "string"
        ? [{ role: "user" as HiveRole, content: prompt }]
        : this.normalizeMessages(prompt);

    // Trích xuất JSON Schema từ Zod để hướng dẫn model sinh đúng cấu trúc và tên trường
    let schemaInstruction = "";
    if (schema && typeof schema.parse === "function") {
      try {
        const jsonSchema = zodToJsonSchema(schema, "ResponseSchema");
        const schemaDef = (jsonSchema as any).definitions?.ResponseSchema || jsonSchema;
        schemaInstruction = `\nTarget JSON Schema:\n${JSON.stringify(schemaDef, null, 2)}`;
      } catch {
        // Fallback nếu không convert được
      }
    }

    const callerSystemMsg = rawMessages.find((m) => m.role === "system");
    const nonSystemMessages = rawMessages.filter((m) => m.role !== "system");

    const combinedSystemContent = [
      callerSystemMsg ? callerSystemMsg.content : "",
      `You are an AI assistant that MUST respond ONLY with a valid JSON object matching the requested schema.${schemaInstruction}`,
      `Do not include markdown code block backticks (\`\`\`json) or introductory explanations.`,
      `CRITICAL FOR REASONING MODELS: Keep internal reasoning brief and concise. Focus directly on the JSON output.`,
    ]
      .filter(Boolean)
      .join("\n\n");

    const enhancedMessages = [
      { role: "system" as HiveRole, content: combinedSystemContent },
      ...nonSystemMessages,
    ];

    const payload = {
      model,
      temperature,
      max_tokens: maxTokens,
      stream: false,
      response_format: { type: "json_object" },
      messages: enhancedMessages,
    };

    try {
      const response = await this.executeWithThrottling(() =>
        this.client.post("/chat/completions", payload, {
          headers: {
            authorization: `Bearer ${this.apiKey}`,
          },
        })
      );

      const choice = response.data?.choices?.[0];
      const finishReason = choice?.finish_reason;
      const content = choice?.message?.content;
      const usage = response.data?.usage || {};

      // Fail-Fast Token Limit Guard: Khi model chạm trần token do reasoning quá dài
      if (finishReason === "length") {
        const reasoningTokens = usage.completion_tokens_details?.reasoning_tokens ?? "N/A";
        console.error(
          `[HiveService] ❌ Mô hình Hive cạn kiệt tokens (finish_reason: length). Prompt: ${usage.prompt_tokens}, Completion: ${usage.completion_tokens}, Reasoning: ${reasoningTokens}, MaxTokens: ${maxTokens}.`
        );
        throw new Error(
          `Hive reasoning model token limit exceeded (finish_reason: length). Prompt: ${usage.prompt_tokens}, Reasoning: ${reasoningTokens}, Max: ${maxTokens}. Please reduce prompt length, chunk size, or increase maxTokens.`
        );
      }

      let parsedJson: any;
      try {
        const sanitizedContent = this.sanitizeJsonContent(content);
        parsedJson = JSON.parse(sanitizedContent);
      } catch (jsonErr: any) {
        console.error(`[HiveService] ❌ Hive trả về chuỗi JSON không hợp lệ: ${content}`);
        throw new Error(`Hive API returned invalid JSON: ${jsonErr.message}`);
      }

      // Tự động chữa lành qua Postel's Law
      const validatedData = this.healStructuredOutput<T>(schema, parsedJson);
      return validatedData as T;
    } catch (error: any) {
      const errMsg = error?.response?.data ? JSON.stringify(error.response.data) : error.message;
      console.error(`[HiveService] ❌ Lỗi Hive API Structured: ${errMsg}`);
      throw error;
    }
  }

  /**
   * Gọi LLM ở chế độ Streaming SSE thời gian thực.
   */
  public async *invokeStream(
    messages: HiveMessage[] | any[],
    options?: HiveCallOptions
  ): AsyncGenerator<HiveStreamChunk> {
    this.ensureApiKey();

    const model = options?.model || this.defaultModel;
    const temperature = options?.temperature ?? 0.1;
    const maxTokens = options?.maxTokens ?? 4096;

    const payload = {
      model,
      temperature,
      max_tokens: maxTokens,
      stream: true,
      messages: this.normalizeMessages(messages),
    };

    const response = await this.executeWithThrottling(() =>
      this.client.post("/chat/completions", payload, {
        headers: {
          authorization: `Bearer ${this.apiKey}`,
        },
        responseType: "stream",
      })
    );

    const stream = response.data;
    let buffer = "";

    for await (const chunk of stream) {
      buffer += chunk.toString("utf8");
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;

        const dataStr = trimmed.replace(/^data: /, "");
        if (dataStr === "[DONE]") {
          yield { isDone: true };
          return;
        }

        try {
          const parsed = JSON.parse(dataStr);
          const delta = parsed.choices?.[0]?.delta;
          yield {
            content: delta?.content || undefined,
            reasoning: delta?.reasoning || undefined,
            isDone: false,
            usage: parsed.usage ? {
              promptTokens: parsed.usage.prompt_tokens || 0,
              completionTokens: parsed.usage.completion_tokens || 0,
              totalTokens: parsed.usage.total_tokens || 0,
            } : undefined,
          };
        } catch {
          // Bỏ qua dòng json không hợp lệ trong SSE stream
        }
      }
    }
  }
}
