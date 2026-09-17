/**
 * Token Bucket Algorithm — Rate Limiter cho Gemini API
 *
 * ## Tại sao Token Bucket thay vì Fixed Window?
 *
 * Fixed Window có "boundary burst" problem:
 *   - Giây thứ 59: gửi 5 requests → OK (window 1)
 *   - Giây thứ 61: gửi 5 requests → OK (window 2)
 *   → 10 requests trong 2 giây! Gemini dùng sliding window → 429.
 *
 * Token Bucket giải quyết bằng cách:
 *   - "Xô" chứa tối đa N tokens (capacity)
 *   - Token được "rót" liên tục theo thời gian (refill rate)
 *   - Mỗi request "múc" token ra khỏi xô
 *   - Hết token → chờ xô được rót đầy lại
 *   → Traffic tự nhiên được smooth, không có burst ở ranh giới
 */

// ============================================================
// Token Bucket — Cấu trúc dữ liệu cốt lõi
// ============================================================

class TokenBucket {
  private tokens: number;
  private lastRefillTime: number;

  constructor(
    private readonly capacity: number,
    // Tốc độ rót token (tokens/giây). VD: RPM=10 → refillRate = 10/60 ≈ 0.167 tokens/s
    private readonly refillRatePerSecond: number,
  ) {
    this.tokens = capacity;
    this.lastRefillTime = Date.now();
  }

  /**
   * Nạp lại token dựa trên thời gian đã trôi qua kể từ lần refill trước.
   * Gọi nội bộ trước mỗi lần tryConsume.
   */
  private refill(): void {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastRefillTime) / 1000;
    // Cộng token đã refill, nhưng không vượt quá capacity
    this.tokens = Math.min(
      this.capacity,
      this.tokens + elapsedSeconds * this.refillRatePerSecond
    );
    this.lastRefillTime = now;
  }

  /**
   * Thử tiêu thụ `count` tokens.
   * @returns `allowed: true` nếu đủ token, `waitMs` là thời gian cần chờ nếu không đủ
   */
  public tryConsume(count: number): { allowed: boolean; waitMs: number } {
    this.refill();

    if (this.tokens >= count) {
      this.tokens -= count;
      return { allowed: true, waitMs: 0 };
    }

    // Tính thời gian chờ: (số token thiếu) / (tốc độ refill) = giây cần chờ
    const deficit = count - this.tokens;
    const waitMs = Math.ceil((deficit / this.refillRatePerSecond) * 1000);
    return { allowed: false, waitMs };
  }

  /**
   * Xem trạng thái hiện tại (dùng cho logging)
   */
  public getStatus(): { tokens: number; capacity: number } {
    this.refill();
    return {
      tokens: Math.floor(this.tokens * 100) / 100,
      capacity: this.capacity,
    };
  }
}

// ============================================================
// GeminiRateLimiter — Orchestrator
// ============================================================

export class GeminiRateLimiter {
  private static instance: GeminiRateLimiter;

  // Giới hạn — đọc từ env hoặc dùng Gemini Free Tier default
  private readonly RPM_LIMIT: number;
  private readonly TPM_LIMIT: number;

  /**
   * Hệ số nhân ước tính output tokens.
   *
   * Tại sao cần? Rate Limiter trước đây chỉ đếm INPUT tokens,
   * nhưng Gemini tính quota theo TỔNG (input + output).
   * Response thường dài gấp 2-5 lần input → dùng hệ số 3x là an toàn.
   */
  private readonly OUTPUT_TOKEN_MULTIPLIER = 3;

  /**
   * Jitter: delay ngẫu nhiên (200-500ms) giữa các requests.
   *
   * Tại sao cần? Dù Token Bucket đã smooth traffic,
   * nhưng requests liên tiếp quá nhanh vẫn có thể trigger
   * Gemini server-side burst detection. Jitter phân tán requests.
   */
  private readonly MIN_JITTER_MS = 200;
  private readonly MAX_JITTER_MS = 500;

  // Token Buckets
  private rpmBucket: TokenBucket;
  private tpmBucket: TokenBucket;

  // Hàng đợi tuần tự — đảm bảo requests được xử lý từng cái một
  private queue: Array<() => void> = [];
  private isProcessing = false;

  private constructor() {
    this.RPM_LIMIT = parseInt(process.env.GEMINI_RPM_LIMIT || '5', 10);
    this.TPM_LIMIT = parseInt(process.env.GEMINI_TPM_LIMIT || '250000', 10);

    // RPM bucket: capacity = RPM_LIMIT, refill = RPM_LIMIT/60 per second
    this.rpmBucket = new TokenBucket(this.RPM_LIMIT, this.RPM_LIMIT / 60);

    // TPM bucket: capacity = TPM_LIMIT, refill = TPM_LIMIT/60 per second
    this.tpmBucket = new TokenBucket(this.TPM_LIMIT, this.TPM_LIMIT / 60);

    console.log(
      `[GeminiRateLimiter] ⚙️ Token Bucket initialized — RPM: ${this.RPM_LIMIT}, TPM: ${this.TPM_LIMIT}, Output Multiplier: ${this.OUTPUT_TOKEN_MULTIPLIER}x`
    );
  }

  public static getInstance(): GeminiRateLimiter {
    if (!GeminiRateLimiter.instance) {
      GeminiRateLimiter.instance = new GeminiRateLimiter();
    }
    return GeminiRateLimiter.instance;
  }

  // ---- Helpers ----

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getJitterMs(): number {
    return Math.floor(
      Math.random() * (this.MAX_JITTER_MS - this.MIN_JITTER_MS + 1)
    ) + this.MIN_JITTER_MS;
  }

  /**
   * Ước tính tổng tokens (input + output dự kiến)
   */
  public estimateTotalTokens(inputTokens: number): number {
    return inputTokens + inputTokens * this.OUTPUT_TOKEN_MULTIPLIER;
  }

  // ---- Public API ----

  /**
   * Bọc một operation trong rate limiting.
   * Request sẽ được xếp vào queue tuần tự, chờ đủ quota rồi mới thực thi.
   *
   * @param estimatedInputTokens Số input tokens ước tính (chars / 4)
   * @param operation Hàm async thực hiện LLM call
   */
  public async execute<T>(
    estimatedInputTokens: number,
    operation: () => Promise<T>
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      // Đưa request vào hàng đợi tuần tự
      this.queue.push(async () => {
        try {
          const result = await this.processRequest(estimatedInputTokens, operation);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      // Kích hoạt queue nếu chưa chạy
      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }

  // ---- Internal ----

  private async processQueue(): Promise<void> {
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        await task();
      }
    }

    this.isProcessing = false;
  }

  /**
   * Xử lý một request: chờ bucket → jitter → execute
   */
  private async processRequest<T>(
    estimatedInputTokens: number,
    operation: () => Promise<T>
  ): Promise<T> {
    const totalTokens = this.estimateTotalTokens(estimatedInputTokens);

    // 1. Chờ RPM bucket có đủ token (1 request = 1 RPM token)
    await this.waitForBucket('RPM', this.rpmBucket, 1);

    // 2. Chờ TPM bucket có đủ token
    await this.waitForBucket('TPM', this.tpmBucket, totalTokens);

    // 3. Thêm jitter delay ngẫu nhiên
    const jitter = this.getJitterMs();
    await this.sleep(jitter);

    // 4. Log và thực thi
    const rpmStatus = this.rpmBucket.getStatus();
    console.log(
      `[GeminiRateLimiter] 🚀 Request sent ` +
      `(RPM remaining: ~${rpmStatus.tokens}/${rpmStatus.capacity}, ` +
      `Est. tokens: ~${totalTokens} [in: ${estimatedInputTokens}, out: ~${estimatedInputTokens * this.OUTPUT_TOKEN_MULTIPLIER}])`
    );

    return await operation();
  }

  /**
   * Chờ cho đến khi bucket có đủ token.
   * Dùng while loop để xử lý edge case timing imprecision.
   */
  private async waitForBucket(
    bucketName: string,
    bucket: TokenBucket,
    count: number
  ): Promise<void> {
    let result = bucket.tryConsume(count);

    while (!result.allowed) {
      const waitSeconds = Math.ceil(result.waitMs / 1000);
      console.log(
        `[GeminiRateLimiter] ⏳ ${bucketName} bucket — chờ ~${waitSeconds}s để refill ${count} tokens...`
      );
      // +100ms buffer cho timing imprecision
      await this.sleep(result.waitMs + 100);
      result = bucket.tryConsume(count);
    }
  }
}

// Export singleton instance dùng chung cho toàn bộ agent
export const geminiRateLimiter = GeminiRateLimiter.getInstance();
