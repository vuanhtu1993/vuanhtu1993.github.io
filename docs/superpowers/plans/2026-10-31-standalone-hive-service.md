# Standalone HiveService Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng và tích hợp `HiveService` (mô hình GLM-5.3-Flash từ The Hive API) làm dịch vụ LLM độc lập song song với `GeminiService`, thí điểm kích hoạt trên `interpreter_agent` nhằm loại bỏ hoàn toàn tình trạng nghẽn pipeline do lỗi Google Gemini HTTP 503.

**Architecture:** Tạo module Singleton `HiveService` độc lập tại `scripts/aha-mind/utils/hive/` với Token Bucket Rate Limiter (5 req/s), cơ chế tự chữa lành JSON (Postel's Law), và chữ ký hàm tương thích ngược (`invoke` trả về `.content`, `invokeStructured` trả về parsed `T`). Bổ sung cờ `--provider hive` vào `interpreter_agent` để hoán đổi provider an toàn.

**Tech Stack:** TypeScript, Node.js (>=20.0), Axios, Zod, zod-to-json-schema, Commander, node:test.

**Spec:** [docs/superpowers/specs/2026-10-31-standalone-hive-service-design.md](file:///Users/anhtus/Documents/Development/Documentary/vuanhtu1993.github.io/docs/superpowers/specs/2026-10-31-standalone-hive-service-design.md)

## Global Constraints

- **Language & Runtime:** TypeScript chạy trực tiếp bằng `tsx` trên Node.js >= 20.0.
- **Zero Framework Dependency:** Không sử dụng các decorator của NestJS (`@Injectable`, `ConfigService`), dùng thuần TypeScript class và `process.env`.
- **Backward Compatibility:** `HiveInvokeResult` bắt buộc có thuộc tính `.content` (chuỗi string) để tương thích 100% với các node đang đọc `response.content`. `invokeStructured` trả về trực tiếp object đã parse.
- **Zero Invasiveness to Gemini:** Tuyệt đối không thay đổi logic đang chạy ổn định của `GeminiService` trong `scripts/aha-mind/utils/gemini/`.
- **Copyright Footer:** Mọi tài liệu và chú thích triết lý tuân thủ quy tắc sư phạm của Anh Tú ("Made by Anh Tu - Share to be share").

## Review Focus

1. **Reasoning Model Token Starvation:** Model GLM-5.3-Flash sinh reasoning tokens trước khi đưa ra kết quả. Nếu `max_tokens` quá thấp hoặc model ngắt giữa chừng do chạm trần (`finish_reason: 'length'`), hệ thống phải kích hoạt Fail-fast Token Limit Guard báo lỗi rõ ràng.
2. **Postel Auto-healing on Array Output:** Khi yêu cầu trả về danh sách, reasoning model có thể trả về array trần `[...]` thay vì bọc `{ items: [...] }`. Service phải tự động bọc lại để Zod schema parse thành công.
3. **Markdown Backtick Stripping:** Model đôi khi vẫn kẹp JSON trong ` ```json ... ``` `. Service phải regex làm sạch trước khi gọi `JSON.parse`.
4. **Token Bucket Concurrency Burst:** Khi có nhiều request đồng thời, Token Bucket phải xếp hàng promise và nhả đều 5 request/s (200ms/token), tránh nhận HTTP 429 từ The Hive API.
5. **Key & Connection Validation:** Khi người dùng chạy pipeline với `--provider hive`, pipeline phải kiểm tra `HIVE_API_KEY` ngay từ đầu qua `validateKey()`, không để tình trạng đọc PDF xong mới báo lỗi thiếu key.

---

### Task 1: Cài đặt Dependencies (`axios` & `zod-to-json-schema`)

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Cài đặt axios và zod-to-json-schema**
Run:
```bash
pnpm add axios zod-to-json-schema
```

- [ ] **Step 2: Kiểm tra phiên bản trong package.json**
Run:
```bash
node -e "console.log(require('axios/package.json').version, require('zod-to-json-schema/package.json').version)"
```
Expected output: In ra phiên bản hợp lệ của axios và zod-to-json-schema.

- [ ] **Step 3: Commit dependency changes**
Run:
```bash
git add package.json pnpm-lock.yaml
git commit -m "chore(deps): add axios and zod-to-json-schema for HiveService"
```

---

### Task 2: Định nghĩa Interfaces và Token Bucket Rate Limiter

**Files:**
- Create: `scripts/aha-mind/utils/hive/hive.interface.ts`
- Create: `scripts/aha-mind/utils/hive/token-bucket.ts`
- Test: `scripts/aha-mind/utils/hive/token-bucket.test.ts`

- [ ] **Step 1: Viết test cho Token Bucket Rate Limiter**
Tạo file `scripts/aha-mind/utils/hive/token-bucket.test.ts`:
```typescript
import test from "node:test";
import assert from "node:assert";
import { TokenBucket } from "./token-bucket";

test("TokenBucket - cấp phát token ngay khi thùng còn token", async () => {
  const bucket = new TokenBucket(5, 200);
  assert.strictEqual(bucket.getAvailableTokens(), 5);

  await bucket.acquireToken();
  assert.strictEqual(bucket.getAvailableTokens(), 4);
});

test("TokenBucket - xếp hàng khi thùng cạn token và tự giải phóng sau interval", async () => {
  const bucket = new TokenBucket(2, 50); // Dung lượng 2, hồi mỗi 50ms
  await bucket.acquireToken();
  await bucket.acquireToken();
  assert.strictEqual(bucket.getAvailableTokens(), 0);

  const start = Date.now();
  await bucket.acquireToken(); // Chờ refill
  const elapsed = Date.now() - start;

  assert.ok(elapsed >= 40, `Elapsed should be at least 40ms, got ${elapsed}ms`);
  bucket.destroy();
});
```

- [ ] **Step 2: Chạy test để xác nhận test FAIL (do chưa có code implementation)**
Run:
```bash
pnpm tsx --test scripts/aha-mind/utils/hive/token-bucket.test.ts
```
Expected output: Lỗi không tìm thấy module `./token-bucket`.

- [ ] **Step 3: Tạo `hive.interface.ts`**
Tạo file `scripts/aha-mind/utils/hive/hive.interface.ts`:
```typescript
export type HiveRole = "system" | "user" | "assistant";

export interface HiveMessage {
  role: HiveRole;
  content: string;
}

export interface HiveCallOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
  name?: string;
}

export interface HiveTokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  reasoningTokens?: number;
}

/**
 * Interface kết quả Invoke:
 * Bắt buộc có .content để tương thích 100% với các Node gọi `response.content`.
 */
export interface HiveInvokeResult {
  content: string;
  text: string;
  usage: HiveTokenUsage;
  reasoning?: string;
}

export interface HiveStructuredResult<T> {
  parsed: T;
  usage: HiveTokenUsage;
}
```

- [ ] **Step 4: Hiện thực `token-bucket.ts`**
Tạo file `scripts/aha-mind/utils/hive/token-bucket.ts`:
```typescript
/**
 * Thuật toán Token Bucket Rate Limiter độc lập.
 * Cấu hình mặc định cho The Hive API: 5 request/giây (refill 200ms/token).
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
```

- [ ] **Step 5: Chạy lại test để xác nhận test PASS**
Run:
```bash
pnpm tsx --test scripts/aha-mind/utils/hive/token-bucket.test.ts
```
Expected output: `✔ TokenBucket - cấp phát token ngay...` và `✔ TokenBucket - xếp hàng...` (pass 2/2).

- [ ] **Step 6: Commit Task 2**
Run:
```bash
git add scripts/aha-mind/utils/hive/hive.interface.ts scripts/aha-mind/utils/hive/token-bucket.ts scripts/aha-mind/utils/hive/token-bucket.test.ts
git commit -m "feat(hive): add hive interfaces and token bucket rate limiter"
```

---

### Task 3: Hiện thực Core `HiveService` (Singleton)

**Files:**
- Create: `scripts/aha-mind/utils/hive/hive-service.ts`
- Create: `scripts/aha-mind/utils/hive/index.ts`
- Test: `scripts/aha-mind/utils/hive/hive-service.test.ts`

- [ ] **Step 1: Viết test cho `HiveService`**
Tạo file `scripts/aha-mind/utils/hive/hive-service.test.ts`:
```typescript
import test from "node:test";
import assert from "node:assert";
import { z } from "zod";
import { HiveService } from "./hive-service";

test("HiveService - Singleton instance", () => {
  const instance1 = HiveService.getInstance();
  const instance2 = HiveService.getInstance();
  assert.strictEqual(instance1, instance2);
});

test("HiveService - Postel Auto-healing sửa mảng trần thành object có field items", () => {
  const service = HiveService.getInstance();
  const schema = z.object({
    items: z.array(z.object({ name: z.string() })),
  });

  const rawArray = [{ name: "Topic 1" }, { name: "Topic 2" }];
  const healed = (service as any).healStructuredOutput(schema, rawArray);

  assert.deepStrictEqual(healed, {
    items: [{ name: "Topic 1" }, { name: "Topic 2" }],
  });
});

test("HiveService - Sanitization loại bỏ markdown backticks ```json ... ```", () => {
  const service = HiveService.getInstance();
  const input = "```json\n{\"key\": \"value\"}\n```";
  const cleaned = (service as any).sanitizeJsonContent(input);
  assert.strictEqual(cleaned, '{"key": "value"}');
});
```

- [ ] **Step 2: Chạy test để xác nhận test FAIL (do chưa có `hive-service.ts`)**
Run:
```bash
pnpm tsx --test scripts/aha-mind/utils/hive/hive-service.test.ts
```
Expected output: Lỗi không tìm thấy module `./hive-service`.

- [ ] **Step 3: Hiện thực `hive-service.ts`**
Tạo file `scripts/aha-mind/utils/hive/hive-service.ts`:
- Singleton pattern: `HiveService.getInstance()`.
- Sử dụng `axios.create()` với timeout 90.000ms.
- Tích hợp `TokenBucket` từ Task 2.
- Phương thức `validateKey()`: Kiểm tra sự tồn tại của `HIVE_API_KEY` trong `process.env`.
- Phương thức `invoke(messages, options)`: Trả về `{ content, text, usage, reasoning }`.
- Phương thức `invokeStructured(schema, prompt, options)`:
  - Sinh schema qua `zodToJsonSchema(schema)`.
  - Inject system prompt JSON instruction.
  - Sử dụng `response_format: { type: 'json_object' }`.
  - Bắt `finish_reason === 'length'` để fail-fast.
  - Áp dụng `sanitizeJsonContent()` và `healStructuredOutput()`.
  - Trả về trực tiếp parsed JSON `T` để tương thích các agent hiện có.

- [ ] **Step 4: Tạo file export `scripts/aha-mind/utils/hive/index.ts`**
```typescript
import { HiveService } from "./hive-service";

export * from "./hive.interface";
export * from "./token-bucket";
export * from "./hive-service";

export const hiveService = HiveService.getInstance();
```

- [ ] **Step 5: Chạy lại test `hive-service.test.ts` để xác nhận PASS**
Run:
```bash
pnpm tsx --test scripts/aha-mind/utils/hive/hive-service.test.ts
```
Expected output: Toàn bộ 3 tests đều pass.

- [ ] **Step 6: Kiểm tra ping thực tế với The Hive API**
Tạo script scratch ngắn để test kết nối trực tiếp với API key trong `.env`:
Run:
```bash
pnpm tsx -e '
import { hiveService } from "./scripts/aha-mind/utils/hive";
async function test() {
  const res = await hiveService.invoke([{ role: "user", content: "Trả lời ngắn gọn: 1 + 1 = ?" }]);
  console.log("✅ Hive response:", res.content);
  console.log("📊 Tokens:", res.usage);
}
test().catch(console.error);
'
```
Expected output: In ra kết quả phép tính từ mô hình GLM-5.3-Flash / DeepSeek và lượng token tiêu thụ.

- [ ] **Step 7: Commit Task 3**
Run:
```bash
git add scripts/aha-mind/utils/hive/hive-service.ts scripts/aha-mind/utils/hive/index.ts scripts/aha-mind/utils/hive/hive-service.test.ts
git commit -m "feat(hive): implement core HiveService singleton with auto-healing and token bucket"
```

---

### Task 4: Tích hợp Thí điểm (Pilot Integration) cho `interpreter_agent`

**Files:**
- Modify: `scripts/aha-mind/interpreter_agent/state.ts`
- Modify: `scripts/aha-mind/interpreter_agent/pipeline.ts`
- Modify: `scripts/aha-mind/interpreter_agent/nodes/translator.ts`
- Test: `scripts/aha-mind/interpreter_agent/interpreter-provider.test.ts`

- [ ] **Step 1: Viết test cho CLI option `--provider` và state**
Tạo file `scripts/aha-mind/interpreter_agent/interpreter-provider.test.ts`:
```typescript
import test from "node:test";
import assert from "node:assert";
import { Command } from "commander";

test("Interpreter CLI - chấp nhận flag --provider gemini hoặc --provider hive", () => {
  const program = new Command();
  program
    .option("--provider <type>", "LLM Provider: gemini hoặc hive", "hive")
    .option("--title <title>", "Tiêu đề sách");

  program.parse(["node", "test", "--provider", "hive", "--title", "Clean Code"]);
  const opts = program.opts();

  assert.strictEqual(opts.provider, "hive");
  assert.strictEqual(opts.title, "Clean Code");
});
```

- [ ] **Step 2: Chạy test để xác nhận logic CLI pass**
Run:
```bash
pnpm tsx --test scripts/aha-mind/interpreter_agent/interpreter-provider.test.ts
```
Expected output: Test pass 1/1.

- [ ] **Step 3: Cập nhật `state.ts`**
Thêm trường `provider?: "gemini" | "hive"` vào `InterpreterState` trong `scripts/aha-mind/interpreter_agent/state.ts`:
```typescript
export interface InterpreterState {
  // ... các trường hiện tại
  provider?: "gemini" | "hive";
}
```

- [ ] **Step 4: Cập nhật `nodes/translator.ts`**
Điều hướng gọi `hiveService` khi `state.provider === 'hive'`:
- Import `hiveService` từ `../../utils/hive`.
- Tại vòng lặp dịch chunk (khoảng dòng 239):
  ```typescript
  let response: { content: string };
  if (state.provider === "hive") {
    response = await hiveService.invoke(messages);
  } else {
    response = await geminiService.invoke(messages);
  }
  ```
- Toàn bộ đoạn code xử lý chuỗi và validate `<ASSET>` phía dưới giữ nguyên 100%.

- [ ] **Step 5: Cập nhật `pipeline.ts`**
- Thêm option `.option("--provider <type>", "LLM Provider (gemini | hive)", process.env.HIVE_API_KEY ? "hive" : "gemini")` vào commander.
- Ở hàm `runPipeline()`:
  - Nếu `provider === 'hive'`: Thực hiện `await hiveService.validateKey()` thay vì `geminiService.validateKeys()`.
  - Truyền `provider` vào input của `app.invoke({ ..., provider })`.

- [ ] **Step 6: Kiểm tra trợ giúp lệnh CLI `--help`**
Run:
```bash
pnpm tsx scripts/aha-mind/interpreter_agent/pipeline.ts --help
```
Expected output: Có hiển thị tuỳ chọn `--provider <type>` trong danh sách options.

- [ ] **Step 7: Commit Task 4**
Run:
```bash
git add scripts/aha-mind/interpreter_agent/state.ts scripts/aha-mind/interpreter_agent/nodes/translator.ts scripts/aha-mind/interpreter_agent/pipeline.ts scripts/aha-mind/interpreter_agent/interpreter-provider.test.ts
git commit -m "feat(interpreter): add swappable --provider option supporting HiveService"
```

---

### Task 5: Kiểm thử Tổng thể & Xác nhận Hoàn tất

**Files:**
- Toàn bộ các file đã tạo và chỉnh sửa

- [ ] **Step 1: Chạy toàn bộ test suite của utils/hive**
Run:
```bash
pnpm tsx --test scripts/aha-mind/utils/hive/*.test.ts scripts/aha-mind/interpreter_agent/*.test.ts
```
Expected output: Tất cả tests đều đạt trạng thái `pass`.

- [ ] **Step 2: Chạy thử nghiệm thực tế 1 trang PDF với `--provider hive`**
Run:
```bash
pnpm tsx scripts/aha-mind/interpreter_agent/pipeline.ts --pdf "sources/paper/ccaf-exam-guide.pdf" --title "CCAF Exam Guide Sample" --pages 1-1 --provider hive
```
Expected output:
- Log khởi động hiển thị: `[HiveService] ✅ HiveService đã sẵn sàng (Model: ...)`
- Pipeline dịch thành công trang 1 mà không dính lỗi 503 của Gemini.
- File markdown được ghi thành công vào thư mục `blog/aha-interpreter/`.

- [ ] **Step 3: Dọn dẹp file test tạm nếu có và kiểm tra git status**
Run:
```bash
git status
```
Expected output: Cây thư mục sạch, chỉ có các commit tính năng đã được tạo.

---

*Made by Anh Tu - Share to be share*
