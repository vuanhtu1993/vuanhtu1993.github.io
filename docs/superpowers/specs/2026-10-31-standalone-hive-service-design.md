# Design Document: Standalone HiveService Integration

**Ngày tạo:** 2026-10-31  
**Tác giả:** Anh Tú & Antigravity  
**Trạng thái:** Chờ phê duyệt (Pending Approval)  
**Tài liệu tham chiếu:** `aha-mind-agents/docs/superpowers/specs/2026-10-08-hive-service-design.md`

---

## 1. Bối cảnh & Lý do ra đời (Context & Problem Statement)

### 1.1. Vấn đề thực tế (Pain Points)
Dự án `vuanhtu1993.github.io` sở hữu hệ thống đa tác nhân (`scripts/aha-mind/`) phục vụ tự động hóa nội dung blog, crawl tài liệu, dịch thuật sách chuyên ngành (`interpreter_agent`), phân loại câu hỏi ôn thi (`dump_agent`), và trích xuất ontology (`ontology_agent`).

Toàn bộ các pipeline trên hiện phụ thuộc vào `GeminiService` (sử dụng `@langchain/google-genai`). Tuy nhiên:
1. **Lỗi HTTP 503 liên tục:** Hạ tầng máy chủ Google Gemini khu vực thường xuyên bị quá tải (Regional Server Overload). Cơ chế xoay vòng Key (`Key Rotation`) dù có tới 20+ keys vẫn vô hiệu vì lỗi 503 xuất phát từ cụm máy chủ của Google, không phải lỗi hạn ngạch (429) của riêng từng Key.
2. **Nghẽn tác vụ dài hơi:** Điển hình là pipeline dịch sách `aha-mind:interpreter` thường bị gián đoạn giữa chừng, mất nhiều giờ chờ đợi mà không thể hoàn tất các chương lớn.

### 1.2. Mục tiêu kỹ thuật (Objectives)
Tích hợp **`HiveService`** từ dự án `aha-mind-agents` sang `vuanhtu1993.github.io` theo **Phương án Standalone Service (Dịch vụ độc lập song song)**:
* Chạy mô hình suy luận (Reasoning Model) **`zai-org/glm-5.3-flash`** qua The Hive API (`https://api.thehive.ai/api/v3`).
* Hoạt động độc lập, không xâm lấn hoặc làm hỏng mã nguồn hiện có của `GeminiService`.
* Cung cấp chữ ký hàm tương thích ngược (Signature Compatibility):
  * `invoke()` trả về đối tượng có thuộc tính `.content` (chuỗi văn bản) để các node đang gọi `response.content` không bị lỗi.
  * `invokeStructured()` trả về trực tiếp dữ liệu dạng JSON đã parse tuân theo Zod schema (`T`).
* Tích hợp cơ chế kiểm soát lưu lượng Token Bucket (5 req/s) và khả năng tự chữa lành cấu trúc JSON (Postel Auto-healing).
* Áp dụng thí điểm (Pilot Integration) trước mắt cho `interpreter_agent` với cờ CLI `--provider hive` hoặc biến môi trường `INTERPRETER_PROVIDER=hive`.

---

## 2. Phân tích các Phương án Kiến trúc (Approaches Considered)

| Tiêu chí | Phương án 1: Unified Provider Facade | Phương án 2: Standalone HiveService (Đã chọn) | Phương án 3: Drop-in Wrapper tại GeminiService |
| :--- | :--- | :--- | :--- |
| **Kiến trúc** | Strategy Pattern + Abstract Factory | Standalone Parallel Service (Singleton) | Monolithic Adapter bên trong `gemini-service.ts` |
| **Mức độ ảnh hưởng** | Thay đổi nhẹ cấu trúc folder `utils/`, tạo alias `geminiService` | **Zero Risk:** Giữ nguyên 100% `GeminiService`, tạo module `utils/hive/` hoàn toàn mới | Gộp code Hive vào Gemini file |
| **Tác động đến Agent** | Không sửa code agent, chuyển provider qua `.env` | Import `hiveService` tại agent cần dùng (thí điểm `interpreter_agent`) | Không sửa code agent |
| **Độ rõ ràng ngữ nghĩa** | Rất cao (Tách rõ Provider) | **Rất cao** (Tách bạch `GeminiService` và `HiveService`) | Kém (File tên Gemini nhưng lại chạy Hive) |
| **Lý do lựa chọn** | Phù hợp cho giai đoạn dài hạn sau khi Hive đã chứng minh độ ổn định | **Được chọn:** An toàn nhất, triển khai nhanh, giải quyết ngay nhu cầu dịch sách cấp bách mà không làm ảnh hưởng các agent khác | Bị loại bỏ vì vi phạm SRP |

---

## 3. Thiết kế Kiến trúc Chi tiết (Architecture Design)

### 3.1. Sơ đồ khối (Component Diagram)

```mermaid
graph TD
    subgraph "Tầng Agents (scripts/aha-mind/)"
        Interpreter["interpreter_agent<br/>(Dịch thuật sách PDF)"]
        Blog["blog_agent<br/>(Phân tích thuật ngữ)"]
        OtherAgents["dump_agent / syllabus_agent / ontology_agent"]
    end

    subgraph "Tầng Utils AI Services (scripts/aha-mind/utils/)"
        GS["GeminiService (Singleton)<br/>utils/gemini/gemini-service.ts<br/>- Google GenAI SDK<br/>- Circular Key Rotation<br/>- Cooldown tracking"]
        HS["HiveService (Singleton)<br/>utils/hive/hive-service.ts<br/>- Axios client<br/>- Token Bucket (5 req/s)<br/>- Postel Auto-healing JSON<br/>- Fail-fast Token Limit"]
    end

    subgraph "External AI Providers"
        GAPI["Google Gemini API<br/>(Regional Server Overload / 503)"]
        HAPI["The Hive AI API<br/>(https://api.thehive.ai/api/v3)<br/>Model: zai-org/glm-5.3-flash"]
    end

    Interpreter -.->|--provider gemini| GS
    Interpreter ==>|--provider hive (Mặc định mới)| HS
    Blog --> GS
    OtherAgents --> GS

    GS --> GAPI
    HS --> HAPI
```

### 3.2. Cấu trúc Thư mục Mới

```text
scripts/aha-mind/
├── utils/
│   ├── gemini/                        <-- Giữ nguyên 100%
│   │   ├── gemini-service.ts
│   │   ├── rate-limiter.ts
│   │   └── index.ts
│   └── hive/                          <-- THƯ MỤC MỚI
│       ├── hive-service.ts            <-- Core Singleton class HiveService
│       ├── hive.interface.ts          <-- Type definitions (CallOptions, Usage, Result)
│       ├── token-bucket.ts            <-- Bộ điều tiết 5 requests/s
│       └── index.ts                   <-- Export singleton hiveService
└── interpreter_agent/
    ├── pipeline.ts                    <-- Bổ sung CLI option --provider (gemini | hive)
    └── nodes/
        └── translator.ts              <-- Hỗ trợ điều hướng gọi HiveService khi provider = 'hive'
```

---

## 4. Đặc tả Hợp đồng & Chữ ký Hàm (Interface Specification)

### 4.1. `hive.interface.ts`
```typescript
export type HiveRole = 'system' | 'user' | 'assistant';

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
 * Đảm bảo tương thích với cả LangChain AIMessage (đọc .content)
 * lẫn format text thông thường.
 */
export interface HiveInvokeResult {
  content: string; // Tương thích với `response.content` trong translator.ts, questionParser.ts
  text: string;    // Chuỗi text kết quả
  usage: HiveTokenUsage;
  reasoning?: string;
}
```

### 4.2. Các Phương thức của `HiveService`

#### 1. `invoke(messages: HiveMessage[] | any[], options?: HiveCallOptions): Promise<HiveInvokeResult>`
* **Mục đích:** Gọi LLM sinh văn bản dạng chuỗi (dùng cho dịch thuật chương sách, viết bài).
* **Đầu vào:** Mảng messages (hỗ trợ cả format `{ role, content }` lẫn LangChain HumanMessage/SystemMessage).
* **Đặc thù Reasoning Model:** 
  * Cấu hình mặc định `max_tokens: 4096` để tránh bị cạn token khi model sinh reasoning tokens.
  * Trả về cả `content` lẫn `text` tương đương, bọc metadata usage.

#### 2. `invokeStructured<T>(schema: z.ZodSchema<T> | any, prompt: string | any[], options?: HiveCallOptions): Promise<T>`
* **Mục đích:** Gọi LLM trả về cấu trúc JSON đã được xác thực qua Zod.
* **Đặc tả trả về:** Trả về **trực tiếp đối tượng `T`** (ví dụ `{ terms: [...] }`), không bọc ngoài `{ parsed: T }`, nhằm tương thích 100% với cách `blog_agent` hay `roadmap_crawler_agent` tiêu thụ.
* **Cơ chế:**
  1. Sử dụng `zod-to-json-schema` trích xuất Target JSON Schema và inject vào System Message.
  2. Bật cờ `response_format: { type: 'json_object' }`.
  3. Lọc bỏ backticks markdown (\`\`\`json ... \`\`\`).
  4. Áp dụng **Định luật Postel (Robustness Principle)** tự động chữa lành:
     - Biến thể A: Model trả về raw array `[...]` thay vì `{ items: [...] }`.
     - Biến thể B: Model trả về `{ data: [...] }` hoặc `{ results: [...] }`.
     - Biến thể C: Model trả về 1 object đơn thay vì mảng 1 phần tử.
  5. **Fail-fast Token Limit Guard:** Nếu `finish_reason === 'length'`, ngắt ngay và quăng thông báo lỗi rõ ràng thay vì cố parse JSON bị cắt cụt.

---

## 5. Thí điểm Tích hợp (Pilot Integration: `interpreter_agent`)

Tại sao chọn `interpreter_agent` làm pilot?
* Đây là agent đang chịu tải lớn nhất với các tài liệu PDF dài hàng trăm trang.
* Cần độ chính xác cao của GLM-5.3-Flash reasoning model trong việc dịch thuật thuật ngữ kỹ thuật CNTT mà không làm mất cấu trúc HTML/Markdown và thẻ `<ASSET>`.

### Thay đổi tại `pipeline.ts`:
* Thêm tham số CLI: `--provider <gemini|hive>` (Mặc định: ưu tiên `hive` nếu có `HIVE_API_KEY` trong `.env`, fallback `gemini`).
* Khi `provider === 'hive'`: Bỏ qua kiểm tra `geminiService.validateKeys()`, thực hiện gọi `hiveService.validateKey()` (kiểm tra key và ping nhẹ kiểm tra kết nối).
* Khi `provider === 'gemini'`: Vẫn chạy kiểm tra keys của Gemini như cũ.

### Thay đổi tại `state.ts` & `nodes/translator.ts`:
* Bổ sung trường `provider?: 'gemini' | 'hive'` vào `InterpreterState`.
* Trong `translator.ts`: Đọc `state.provider`. Nếu là `hive`, gọi trực tiếp qua `hiveService.invoke(messages)`. Kết quả trả về giữ nguyên cấu trúc `response.content` để toàn bộ logic validate `<ASSET>` và format chapter hoạt động mượt mà.

---

## 6. Quyết định kỹ thuật từ Builder Check (Builder Calls)

1. **Biến môi trường:** Đã kiểm tra `.env`, hệ thống đã có sẵn `HIVE_API_KEY` và `HIVE_BASE_URL`. Giá trị mặc định của model sẽ lấy `process.env.HIVE_MODEL || 'zai-org/glm-5.3-flash'`.
2. **Cài đặt thư viện:** Cần cài bổ sung `axios` và `zod-to-json-schema` bằng `pnpm add axios zod-to-json-schema`.
3. **Health-check:** Bổ sung phương thức `validateKey()` cho `HiveService` tương tự `GeminiService` để phát hiện lỗi xác thực ngay khi khởi động pipeline, tránh việc chạy dở chừng mới báo lỗi.

---

## 7. Đánh đổi & Rủi ro Kỹ thuật (Trade-offs & Mitigations)

1. **Phụ thuộc thư viện bên ngoài:**
   * Cần thêm `axios` và `zod-to-json-schema` vào `package.json`.
   * *Giải pháp:* Cài đặt qua `pnpm add axios zod-to-json-schema`. Đây là 2 thư viện rất nhẹ và chuẩn công nghiệp.
2. **Độ trễ First Token (Time to First Token - TTFT):**
   * Do `zai-org/glm-5.3-flash` là reasoning model, nó mất từ 1 - 3 giây suy luận nội bộ trước khi bắt đầu nhả token văn bản.
   * *Giải pháp:* Đặt timeout cho Axios lên 90 giây (`timeout: 90000`). Bù lại, chất lượng bản dịch và sự tuân thủ format schema cao hơn đáng kể so với Gemini Flash thông thường.
3. **Giới hạn tốc độ của The Hive (Rate Limits):**
   * API của The Hive kiểm soát nghiêm ngặt khoảng 5 requests/giây.
   * *Giải pháp:* Token Bucket tích hợp sẵn với capacity = 5, refill interval = 200ms và Exponential Backoff tự động retry khi gặp HTTP 429 hoặc 5xx.

---

*Made by Anh Tu - Share to be share*
