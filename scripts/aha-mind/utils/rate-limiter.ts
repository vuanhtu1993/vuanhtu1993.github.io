import fs from 'fs';
import path from 'path';

interface QuotaData {
  date: string;
  requests: number;
}

export class GeminiRateLimiter {
  private static instance: GeminiRateLimiter;

  // Giới hạn theo Gemini Free Tier
  private readonly RPM_LIMIT = 5;
  private readonly TPM_LIMIT = 250000;
  private readonly RPD_LIMIT = 20;

  // Trạng thái cục bộ (per minute)
  private requestsThisMinute = 0;
  private tokensThisMinute = 0;
  private lastMinuteResetTime = Date.now();

  // Nơi lưu trữ trạng thái ngày (để track RPD cross-session)
  private quotaFilePath: string;

  // Hàng đợi các request đang chờ
  private queue: Array<() => void> = [];
  private isProcessing = false;

  private constructor() {
    this.quotaFilePath = path.join(process.cwd(), '.gemini_quota.json');
    this.ensureQuotaFileExists();
  }

  public static getInstance(): GeminiRateLimiter {
    if (!GeminiRateLimiter.instance) {
      GeminiRateLimiter.instance = new GeminiRateLimiter();
    }
    return GeminiRateLimiter.instance;
  }

  /**
   * Khởi tạo file quota nếu chưa có
   */
  private ensureQuotaFileExists() {
    if (!fs.existsSync(this.quotaFilePath)) {
      this.writeQuota({ date: this.getTodayString(), requests: 0 });
    }
  }

  /**
   * Lấy chuỗi định dạng ngày hiện tại (YYYY-MM-DD) theo giờ local
   */
  private getTodayString(): string {
    const today = new Date();
    // Chỉnh sửa để lấy theo UTC-8 / local time tuỳ ý, ở đây lấy local time.
    return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
  }

  /**
   * Đọc file quota hiện tại
   */
  private readQuota(): QuotaData {
    try {
      const data = fs.readFileSync(this.quotaFilePath, 'utf8');
      const parsed = JSON.parse(data) as QuotaData;

      // Nếu ngày trong file khác ngày hiện tại, reset về 0
      if (parsed.date !== this.getTodayString()) {
        const resetData = { date: this.getTodayString(), requests: 0 };
        this.writeQuota(resetData);
        return resetData;
      }
      return parsed;
    } catch (error) {
      console.warn('[GeminiRateLimiter] Error reading quota file, resetting.', error);
      const resetData = { date: this.getTodayString(), requests: 0 };
      this.writeQuota(resetData);
      return resetData;
    }
  }

  /**
   * Ghi file quota (Sử dụng Atomic Write để chống crash corruption)
   */
  private writeQuota(data: QuotaData) {
    const tmpPath = `${this.quotaFilePath}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmpPath, this.quotaFilePath);
  }

  /**
   * Hàm sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Reset bộ đếm phút nếu đã trôi qua 60 giây
   */
  private checkAndResetMinuteInterval() {
    const now = Date.now();
    if (now - this.lastMinuteResetTime >= 60000) {
      this.requestsThisMinute = 0;
      this.tokensThisMinute = 0;
      this.lastMinuteResetTime = now;
      console.log('[GeminiRateLimiter] 🔄 Đã reset quota của phút hiện tại.');
    }
  }

  /**
   * Hàm gọi chính để bọc các request LLM
   * @param estimatedTokens Số token ước tính của request (nếu khó tính có thể truyền 0, hoặc = số ký tự / 4)
   * @param operation Khối lệnh gọi LLM (VD: `chain.invoke()`)
   */
  public async execute<T>(estimatedTokens: number, operation: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      // Đưa request vào hàng đợi
      this.queue.push(async () => {
        try {
          const result = await this.processRequest(estimatedTokens, operation);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      // Nếu hàng đợi chưa chạy, kích hoạt
      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }

  /**
   * Logic xử lý hàng đợi
   */
  private async processQueue() {
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
   * Chạy request và quản lý delay
   */
  private async processRequest<T>(estimatedTokens: number, operation: () => Promise<T>): Promise<T> {
    // 1. Kiểm tra RPD (Requests Per Day)
    const currentQuota = this.readQuota();
    if (currentQuota.requests >= this.RPD_LIMIT) {
      const msg = `[GeminiRateLimiter] ❌ Đã vượt quá giới hạn RPD (${this.RPD_LIMIT} requests/ngày). Dừng chương trình để đổi API Key.`;
      console.error(msg);
      throw new Error(msg); // Quăng lỗi để dừng hệ thống ngay lập tức
    }

    // 2. Kiểm tra RPM & TPM
    this.checkAndResetMinuteInterval();

    const willExceedRPM = this.requestsThisMinute + 1 > this.RPM_LIMIT;
    const willExceedTPM = this.tokensThisMinute + estimatedTokens > this.TPM_LIMIT;

    if (willExceedRPM || willExceedTPM) {
      const waitTimeMs = 60000 - (Date.now() - this.lastMinuteResetTime);
      console.log(`[GeminiRateLimiter] ⏳ Đạt giới hạn phút (RPM: ${this.requestsThisMinute}/${this.RPM_LIMIT}, TPM: ${this.tokensThisMinute}/${this.TPM_LIMIT}). Đang sleep ${Math.ceil(waitTimeMs / 1000)} giây...`);

      await this.sleep(waitTimeMs);

      // Sau khi sleep xong, reset lại bộ đếm phút ngay
      this.requestsThisMinute = 0;
      this.tokensThisMinute = 0;
      this.lastMinuteResetTime = Date.now();
    }

    // 3. Đánh dấu đã dùng request và token
    this.requestsThisMinute += 1;
    this.tokensThisMinute += estimatedTokens;

    // 4. Lưu lại RPD
    this.writeQuota({
      date: this.getTodayString(),
      requests: currentQuota.requests + 1,
    });

    console.log(`[GeminiRateLimiter] 🚀 Thực thi request (RPM: ${this.requestsThisMinute}/${this.RPM_LIMIT}, RPD: ${currentQuota.requests + 1}/${this.RPD_LIMIT}, Tokens ~ ${estimatedTokens})`);

    // 5. Thực thi operation
    return await operation();
  }
}

// Export một instance dùng chung cho toàn bộ agent
export const geminiRateLimiter = GeminiRateLimiter.getInstance();
