# Blog: Event-Driven Architecture & Event Loop trong Node.js

## Bối cảnh

Xây dựng bài blog kỹ thuật chuyên sâu cho Docusaurus, lấy cảm hứng từ [bài viết gốc trên Medium](file:///Users/anhtus/Documents/Development/Documentary/vuanhtu1993.github.io/sources/documentations/medium.com/preezma/node-js-event-loop-architecture-go-deeper-node-core-c96b4cec7aa4.md) của Andranik Keshishyan. Bài viết KHÔNG đơn thuần là dịch lại source, mà sẽ **tổng hợp và mở rộng** từ 7+ nguồn nghiên cứu, bổ sung góc nhìn sư phạm theo chuẩn `create-tech-lecture` skill.

---

## Phân tích Source Article

### Điểm mạnh cần giữ
- Giải thích bottom-up: Process → Thread → Thread Pool → Epoll → Event Loop
- Câu hỏi "Is Node.js single-threaded?" với câu trả lời "Yes AND No" rất hay
- Ví dụ CRYPTO pbkdf2() minh họa thread pool hiệu quả
- Phân biệt rõ Epoll/Kqueue (network I/O) vs Thread Pool (fs, dns.lookup)

### Điểm yếu cần bổ sung/sửa
- Bài gốc viết 2019, thiếu cập nhật về `worker_threads` (stable từ Node.js v12+)
- Không đề cập Microtask Queue (`process.nextTick`, Promises) — thiếu sót lớn
- Thiếu mối liên hệ với Event-Driven Architecture (EDA) ở tầm macro
- Không có Mermaid diagram hoặc visual rõ ràng cho Event Loop Phases
- Thiếu phần trade-offs và limitations
- Một số thuật ngữ chưa chính xác (VD: "EPOOL" thay vì "EPOLL")

---

## Research Findings (7+ nguồn)

### Nguồn Tier 1 (Official Docs)
| Nguồn | Nội dung chính |
|--------|---------------|
| [Node.js Official - Event Loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick) | 6 phases chính thức, Microtask queue, nextTick priority |
| [libuv.org](http://docs.libuv.org/) | epoll/kqueue/IOCP abstraction, thread pool API |

### Nguồn Tier 2 (Verified Experts)
| Nguồn | Nội dung chính |
|--------|---------------|
| Medium - Preezma (source article) | Bottom-up architecture: Process → Thread → Epoll → Event Loop |
| nodesource.com | V8 + libuv integration, threading model |
| thenodebook.com | Event loop phases chi tiết, Microtask scheduling rules |
| Wikipedia - Reactor Pattern | POSA Vol.2, Douglas Schmidt, C10k problem origin |

### Nguồn Tier 3 (Community)
| Nguồn | Nội dung chính |
|--------|---------------|
| Các bài Medium/dev.to | EDA patterns, EventEmitter, trade-offs |
| StackOverflow discussions | epoll vs kqueue vs IOCP thực tế |

### Key Findings đã verify cross-source

1. **Event Loop = Reactor Pattern implementation** — libuv triển khai Reactor Pattern (POSA Vol.2) với Event Demultiplexer tùy OS
2. **"Single-threaded" chỉ đúng với JavaScript execution** — libuv thread pool mặc định 4 threads cho fs/crypto/dns.lookup
3. **Microtask Queue > Event Loop Phases** — `process.nextTick()` và Promises chạy GIỮA các phases, TRƯỚC khi chuyển phase
4. **Network I/O KHÔNG dùng thread pool** — OS kernel xử lý qua epoll/kqueue/IOCP
5. **Ryan Dahl tạo libuv** để abstract hóa sự khác biệt giữa libev (Unix) và IOCP (Windows)

### Conflicts phát hiện
- Source article nói "4 threads" mà không phân biệt rõ: network I/O hoàn toàn không dùng thread pool → Cần làm rõ trong bài
- Source article thiếu hoàn toàn phần Microtask → Bài viết mới PHẢI bổ sung

---

## User Review & Directives
- **Language:** 100% English (simple, clear, concise).
- **Tone & Style:** Concise, direct, clear, and complete without unnecessary filler.
- **Visuals:** Retain 100% of images from the source article ("one image is worth a thousand words").
- **Structure:** Macro (EDA pattern & Reactor Pattern) → Micro (Node.js Event Loop implementation).

---

## Proposed Structure (100% English)

### `blog/2026-08-28-event-driven-architecture-event-loop/index.md`

1. **Agenda & Outcomes** (Clear bullet points)
2. **Glossary** (Key Technical Terms)
3. **WHY: The Evolution to Event-Driven** (C10k problem, Thread-per-connection bottlenecks, Reactor pattern origin)
4. **WHAT: Event-Driven Architecture (EDA)** (Producers, Event Channels, Consumers, Loose Coupling)
5. **WHAT: Node.js Core & Event Loop Deep Dive**
   - Single-threaded JS vs Multi-threaded libuv
   - Libuv Thread Pool (crypto, fs, dns.lookup) vs OS Kernel Event Demultiplexer (epoll/kqueue/IOCP for Network I/O)
   - The 6 Event Loop Phases & Microtask Priority (`process.nextTick`, Promises)
   - *All original source images + Mermaid diagrams included*
6. **HOW: Code Evidence** (Concise examples: `pbkdf2` sync vs async, microtask execution order)
7. **WHAT IF: Trade-offs & Limitations** (When NOT to use EDA, Eventual consistency, CPU blocking)
8. **Discussion Questions & Best Practices**


---

## Proposed Changes

### Cấu trúc bài viết (theo 4MAT System + create-tech-lecture)

#### [NEW] `blog/2026-08-28/event-driven-architecture-event-loop.md`

**Cấu trúc chi tiết:**

```
## Agenda & Learning Outcomes
- Hiểu được Event-Driven Architecture là gì và tại sao nó ra đời
- Giải thích được Node.js Event Loop hoạt động như thế nào cho người khác
- Phân biệt được khi nào code chạy trên main thread vs thread pool
- Áp dụng được kiến thức để tránh block Event Loop

## Glossary & Vocabulary
- Technical Terms: Event Loop, libuv, Reactor Pattern, Event Demultiplexer,
  Epoll/Kqueue/IOCP, Thread Pool, Microtask Queue, Callback Queue
- Vocabulary Support: B1+ words (offload, demultiplex, concurrent, ...)

## 1. WHY — Vấn đề kỹ thuật
  1.1. Bài toán C10k: 10,000 concurrent connections
  1.2. Thread-per-connection model và pain points
  1.3. Từ Request-Response → Event-Driven: sự chuyển đổi paradigm
  1.4. Ryan Dahl và vision tạo Node.js (2009)
  → Mermaid: So sánh Thread-per-connection vs Event-Driven

## 2. WHAT — Event-Driven Architecture là gì?
  2.1. Định nghĩa EDA (Definition Anatomy)
  2.2. 3 thành phần core: Producer → Event Channel → Consumer
  2.3. Reactor Pattern — nền tảng lý thuyết
  → Mermaid: Reactor Pattern architecture

## 3. WHAT — Node.js Event Loop Deep Dive
  3.1. Kiến trúc tổng thể Node.js (V8 + libuv + C++ APIs)
  3.2. "Is Node.js single-threaded?" → Yes AND No
  3.3. Event Loop 6 Phases chi tiết:
    - Timers → Pending → Idle/Prepare → Poll → Check → Close
  3.4. Microtask Queue (process.nextTick + Promises)
  3.5. Thread Pool (fs, crypto, dns.lookup)
  3.6. OS Kernel delegation (network I/O qua epoll/kqueue)
  → Mermaid: Event Loop Phases cycle
  → Mermaid: Request flow (JS → libuv → OS/Thread Pool → callback)
  → Tái sử dụng ảnh gốc từ source article

## 4. HOW — Chứng minh bằng Code
  4.1. Demo: setTimeout vs setImmediate vs process.nextTick
  4.2. Demo: pbkdf2() sync vs async (thread pool proof)
  4.3. Demo: EventEmitter pattern
  4.4. Anti-pattern: Blocking the Event Loop
  → Code có chú thích WHY, output mong đợi

## 5. WHAT IF — Trade-offs & Limitations
  5.1. Khi nào KHÔNG nên dùng Event-Driven
  5.2. CPU-intensive work → starve Event Loop
  5.3. Eventual Consistency challenges
  5.4. Debugging difficulty trong async flows
  5.5. So sánh: EDA vs Request-Response (bảng)

## 6. Discussion Questions
  - Câu hỏi thảo luận mở về pitfalls và best practices
  - Dẫn chứng use case thực tế

## References
  - Node.js Official Docs, libuv docs, POSA Vol.2, source article
```

**Ảnh từ source article cần tái sử dụng:**
- `1_xm_WajiPlaOeJWcqgJb1xQ_m7ahi8.png` — Overview banner
- `1_rXX6zUdGTZZOkPD_myX7sg_rppdpq.jpg` — Socket/Process diagram
- `1_nswJ6AtBmNJEF1TPmNvJ5w_meiohn.gif` — Thread illustration
- `1_fBEbMgk6--QtIUUed3KcMQ_tially.png` — Sync vs Async execution
- `1_RKOgMIOQ1amPPUU1e261uw_os1ihl.png` — Thread per connection
- `1_ZbK1ee_TxGn21g1P0fy9Vg_ofu6qy.png` — Epoll loop
- `1_RP2rj6fKRFk3VvHQvt2tOw_j76fmj.png` — Event Loop phases

**Mermaid diagrams tự vẽ (tối thiểu 3):**
1. Thread-per-connection vs Event-Driven comparison
2. Node.js Architecture (V8 + libuv + C++ APIs)
3. Event Loop 6 Phases cycle with Microtask Queue
4. Request lifecycle flow

---

## Verification Plan

### Automated Tests
```bash
cd /Users/anhtus/Documents/Development/Documentary/vuanhtu1993.github.io
npm run build
```

### Manual Verification
- [ ] Build thành công không lỗi MDX
- [ ] Mermaid diagrams render đúng
- [ ] Ảnh từ source hiển thị OK
- [ ] Code blocks có syntax highlighting
- [ ] Bài > 1500 từ (chống Summarization Bias)
- [ ] Không có emoji
- [ ] Inline Translation đầy đủ
- [ ] Preview local tại `http://localhost:3000/blog`

---

## Quy trình thực thi

| Bước | Skill/Action | Trạng thái |
|------|--------------|------------|
| 1 | Research (Standard - 7+ nguồn) | Done |
| 2 | Fact-check verified claims | Pending |
| 3 | Create content (Architecture template) | Pending |
| 4 | Review-report QA | Pending |
| 5 | Tạo MDX file cho Docusaurus | Pending |
| 6 | Build & kiểm tra local | Pending |
| 7 | User confirm & Push | Pending |

---

*Made by Anh Tu - Share to be share*
