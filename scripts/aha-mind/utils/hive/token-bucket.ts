/**
 * Thuật toán Token Bucket Rate Limiter độc lập.
 *
 * Triết lý thiết kế (Design Philosophy):
 * - Không phụ thuộc NestJS hay framework bên ngoài.
 * - Cấu hình chuẩn xác cho The Hive API: 5 request/giây.
 * - Dung lượng thùng (Capacity): 5 tokens.
 * - Chu kỳ nạp (Refill interval): 200ms hồi 1 token (1000ms / 5 = 200ms).
 * - Drainer: Xả hàng đợi định kỳ (40ms) ngay khi token sẵn sàng.
 */
export class TokenBucket {
  private readonly capacity: number;
  private readonly refillIntervalMs: number;
  private availableTokens: number;
  private lastRefillTimestamp: number;
  private readonly queue: (() => void)[] = [];
  private drainTimer: NodeJS.Timeout | null = null;

  constructor(capacity = 5, refillIntervalMs = 200) {
    this.capacity = capacity;
    this.refillIntervalMs = refillIntervalMs;
    this.availableTokens = capacity;
    this.lastRefillTimestamp = Date.now();
  }

  public getAvailableTokens(): number {
    this.refillTokens();
    return this.availableTokens;
  }

  private refillTokens(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefillTimestamp;
    const tokensToAdd = Math.floor(elapsed / this.refillIntervalMs);

    if (tokensToAdd > 0) {
      this.availableTokens = Math.min(this.capacity, this.availableTokens + tokensToAdd);
      this.lastRefillTimestamp = this.lastRefillTimestamp + tokensToAdd * this.refillIntervalMs;
    }
  }

  public async acquireToken(): Promise<void> {
    this.refillTokens();

    if (this.availableTokens > 0) {
      this.availableTokens--;
      return;
    }

    return new Promise<void>((resolve) => {
      this.queue.push(resolve);
      this.startDrainer();
    });
  }

  private startDrainer(): void {
    if (this.drainTimer) return;

    this.drainTimer = setInterval(() => {
      this.refillTokens();

      while (this.availableTokens > 0 && this.queue.length > 0) {
        this.availableTokens--;
        const next = this.queue.shift();
        if (next) next();
      }

      if (this.queue.length === 0 && this.drainTimer) {
        clearInterval(this.drainTimer);
        this.drainTimer = null;
      }
    }, 40);
  }

  public destroy(): void {
    if (this.drainTimer) {
      clearInterval(this.drainTimer);
      this.drainTimer = null;
    }
  }
}
