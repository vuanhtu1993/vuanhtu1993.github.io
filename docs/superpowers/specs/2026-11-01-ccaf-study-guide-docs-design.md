# Design Document: Claude Certified Architect – Foundations (CCAR-F) Study Guide Series

- **Date:** 2026-11-01
- **Author:** Anh Tu & Assistant
- **Target Location:** `docs/claude-certified-architect/`
- **Audience:** Fresher, Junior Developers, Computer Science Students

---

## 1. Intent & Context

### 1.1 Context
Tài liệu gốc là cẩm nang hướng dẫn thi chứng chỉ chính thức của Anthropic: **Claude Certified Architect – Foundations (CCAR-F)** (Phiên bản 1.0, hiệu lực từ tháng 07/2026). Chứng chỉ này đánh giá năng lực kiến trúc thực chiến khi xây dựng ứng dụng với Claude Code, Claude Agent SDK, Claude API và Model Context Protocol (MCP).

Bản dịch tự động hiện tại (`blog/aha-interpreter/ccaf-exam-guide/pages-1-end.mdx`) gặp 2 vấn đề lớn:
1. **Thiếu hụt dữ liệu do lỗi translator**: Bị rớt Chunk 6 và Chunk 10, làm mất toàn bộ **Domain 5 (Context Management & Reliability - 15% trọng số)** và **6/12 câu hỏi mẫu** (câu 7, 8, 9, 10 hoàn chỉnh; câu 6 và câu 11 bị cắt cụt).
2. **Hình thức thô, thiếu tính sư phạm**: Toàn bộ là khối văn bản đặc chữ (text wall), không có sơ đồ minh họa luồng hoạt động (Mermaid), bảng so sánh trade-off, hay callout hướng dẫn. Người đọc là fresher/junior rất khó tiếp thu và định hình bức tranh toàn cảnh.

### 1.2 The Why
Xây dựng một bộ tài liệu học tập (Study Guide Series) chuyên nghiệp, trực quan và có tính sư phạm cao trên Docusaurus, giúp người mới bắt đầu (fresher/junior) chuyển hóa kiến thức trừu tượng thành tư duy kiến trúc cụ thể để vượt qua kỳ thi CCAR-F.

---

## 2. Goals, Non-Goals & Anti-Goals

### 2.1 Goals
- **Khôi phục 100% nội dung gốc**: Dịch thuật chính xác, ngữ nghĩa kỹ thuật chuẩn xác từ file gốc nguyên vẹn (`blog/aha-interpreter/ccaf-exam-guide-no-translate/pages-1-end.mdx`).
- **Cấu trúc Docs bài bản**: Tạo một chuyên mục mới tại `docs/claude-certified-architect/` với 7 tài liệu modular có đánh số và `_category_.json`.
- **Trực quan hóa bằng Mermaid**: Tối thiểu 1–2 sơ đồ Mermaid chuẩn cho mỗi Domain (Sequence Diagram, Flowchart, Architecture diagram).
- **Tuân thủ quy chuẩn sư phạm Anh Tú (USER_RULES)**:
  - *Definition Anatomy*: Mỗi concept cốt lõi bắt đầu bằng định nghĩa chuẩn kỹ thuật, sau đó giải phẫu các keyword cấu thành.
  - *Root Cause Analysis*: Giải thích lý do công nghệ/pattern ra đời (nó giải quyết bài toán gì trong quá khứ).
  - *Trade-off Matrix*: So sánh điểm mạnh/yếu, khi nào nên chọn phương án nào.
  - *Exam Traps & Tips*: Hộp callout `:::tip` (Mẹo làm bài), `:::caution` (Cạm bẫy trắc nghiệm), `:::info` (Ghi nhớ cốt lõi).
- **Phân tích chuyên sâu 12 câu hỏi mẫu**: Đầy đủ kịch bản, câu hỏi, 4 phương án, đáp án đúng, và mổ xẻ vì sao đáp án đúng và vì sao 3 phương án còn lại sai.
- **Copyright**: Mỗi trang kết thúc bằng câu `"Made by Anh Tu - Share to be share"`.

### 2.2 Non-Goals
- Không thay đổi hoặc bịa đặt các tiêu chuẩn kỳ thi nằm ngoài tài liệu chính thức của Anthropic.
- Không xóa hay ghi đè file blog gốc `blog/aha-interpreter/ccaf-exam-guide/pages-1-end.mdx` (giữ làm dữ liệu tham chiếu lịch sử).

### 2.3 Anti-Goals
- **Không tóm tắt hời hợt**: Không bỏ qua bất kỳ Task Statement nào trong số 30 Task Statements của 5 Domain.
- **Không dùng Mermaid dễ lỗi**: Tuyệt đối tuân thủ skill `mermaid-expert` (quote node label, không dùng ký tự đặc biệt thô, không nhúng thẻ HTML trong label).
- **Không làm vỡ build Docusaurus**: Đảm bảo tất cả cú pháp MDX hợp lệ, escape dấu `{`, `}` hoặc `<` nếu nằm trong text thông thường.

---

## 3. Approaches Considered & Selected

- **Approach 1: All-in-One Master Blog Post with Tabs/Accordion**
  - Giữ 1 file blog duy nhất, dùng MDX Tabs và `<details>`.
  - *Đánh đổi:* Trang quá dài (>1.800 dòng), tải nặng, trải nghiệm đọc trên mobile kém, khó lưu dấu trang từng phần học.
- **Approach 2: Structured Docs Series (CHỌN)**
  - Tách thành 7 chương tài liệu modular trong `docs/claude-certified-architect/`, tích hợp tự động vào sidebar Docusaurus.
  - *Lý do chọn:* Đáp ứng tối ưu mục tiêu giảng dạy cho sinh viên/junior theo lộ trình từng bước (step-by-step), dễ bảo trì và tra cứu.

---

## 4. Structure & Detailed Specifications

Thư mục: `docs/claude-certified-architect/`

```
docs/claude-certified-architect/
├── _category_.json
├── 01-tong-quan-va-blueprint.md
├── 02-domain-1-agentic-architecture.md
├── 03-domain-2-tool-design-mcp.md
├── 04-domain-3-claude-code-workflows.md
├── 05-domain-4-prompt-structured-output.md
├── 06-domain-5-context-reliability.md
└── 07-thuc-hanh-va-ngan-hang-cau-hoi.md
```

### 4.1 `_category_.json`
- Label: `"Claude Certified Architect – Foundations (CCAR-F)"`
- Position: 1 (hoặc vị trí phù hợp trong `docs/`)
- Collapsible: `true`, collapsed: `false`
- Generated index: Tóm tắt tổng quan khóa cẩm nang.

### 4.2 Module 01: Tổng quan Kỳ thi & 6 Kịch bản Thực chiến (`01-tong-quan-va-blueprint.md`)
- **Nội dung:**
  - Giới thiệu chứng nhận, đối tượng dự thi, format (60 câu / 120 phút / điểm đạt 720/1.000).
  - Bảng tỷ trọng Blueprint 5 Domain.
  - 6 Scenarios thực tế của bài thi:
    1. Customer Support Resolution Agent
    2. Code Generation với Claude Code
    3. Multi-Agent Research System
    4. Developer Productivity với Claude
    5. Claude Code for CI/CD
    6. Structured Data Extraction
- **Trực quan:** Sơ đồ Mindmap hoặc Diagram tổng thể ánh xạ giữa 6 Scenarios và 5 Content Domains.

### 4.3 Module 02: Domain 1 – Agentic Architecture & Orchestration (27%) (`02-domain-1-agentic-architecture.md`)
- **Nội dung:** 7 Task Statements (1.1 -> 1.7).
- **Trọng tâm kiến thức:**
  - Agentic loop lifecycle (`stop_reason`: `tool_use` vs `end_turn`).
  - Coordinator–Subagent pattern: Khi nào dùng parallel dispatch, khi nào sequential pipeline.
  - Quản lý session state: `--resume`, `fork_session`, so sánh resume session cũ vs khởi tạo session mới với injected summary.
- **Trực quan (Mermaid):**
  - Sequence diagram: Vòng lặp Agentic Loop hoàn chỉnh (Claude API -> Tool Call -> Hook -> Tool Execution -> Tool Result -> Claude API).
  - Flowchart: Quyết định kiến trúc giữa Session Resumption vs Fresh Session with Summary.
- **Phân tích Sư phạm:** Definition Anatomy về "Agentic Loop", bảng phân tích Trade-off Coordinator vs Peer-to-Peer.

### 4.4 Module 03: Domain 2 – Tool Design & MCP Integration (18%) (`03-domain-2-tool-design-mcp.md`)
- **Nội dung:** 5 Task Statements (2.1 -> 2.5).
- **Trọng tâm kiến thức:**
  - Thiết kế Tool Interface & Description: Nguyên tắc phân định ranh giới (boundary definition) để tránh misrouting giữa các tool tương tự (`analyze_content` vs `analyze_document`).
  - Phản hồi lỗi có cấu trúc (Structured MCP Error Response): `isError: true`, phân loại lỗi (`transient`, `validation`, `permission`), cờ `isRetryable`.
  - Phân bổ tool giữa các agent & cấu hình `tool_choice` (`auto`, `any`, `exact`).
  - Built-in tools vs Custom MCP tools.
- **Trực quan (Mermaid):**
  - Flowchart: Cây quyết định xử lý lỗi MCP (Retryable Transient Error vs Escalating Business Error).
  - Ma trận so sánh: Good Tool Description vs Bad Tool Description.

### 4.5 Module 04: Domain 3 – Cấu hình & Workflow Claude Code (20%) (`04-domain-3-claude-code-workflows.md`)
- **Nội dung:** 6 Task Statements (3.1 -> 3.6).
- **Trọng tâm kiến thức:**
  - Thứ bậc cấu hình `CLAUDE.md`: Managed (`~/.claude.json`) -> Project Root (`./CLAUDE.md`) -> Directory Scoped (`./src/CLAUDE.md`) -> Modular Rules (`.claude/rules/*.md`).
  - Custom Slash Commands (`.claude/commands/`) vs Agent Skills (`.claude/skills/`).
  - Plan Mode vs Direct Execution: Khi nào nên lập plan (thay đổi nhiều file, refactoring kiến trúc) vs khi nào thực thi trực tiếp.
  - Tích hợp CI/CD headless: Flag non-interactive `-p` / `--print`, `--output-format json`, `--json-schema`.
- **Trực quan (Mermaid):**
  - Hierarchy Diagram: Phân tầng ưu tiên nạp quy tắc trong Claude Code.
  - Bảng so sánh chi tiết: Plan Mode vs Direct Execution.

### 4.6 Module 05: Domain 4 – Prompt Engineering & Structured Output (20%) (`05-domain-4-prompt-structured-output.md`)
- **Nội dung:** 6 Task Statements (4.1 -> 4.6).
- **Trọng tâm kiến thức:**
  - Prompt Precision & False Positive reduction.
  - Few-shot prompting mẫu mực: Xử lý trường hợp biên và dữ liệu mơ hồ.
  - Ép buộc Structured Output: `tool_use` + JSON Schema (Strict mode, Nullable, Enum fallback).
  - Validation, Retry & Self-correction loop.
  - Multi-instance & Multi-pass Review Architecture: Tại sao self-review bị hạn chế do reasoning anchor, và giải pháp dùng instance độc lập kết hợp tách pass per-file và cross-file.
- **Trực quan (Mermaid):**
  - Flowchart: Multi-pass code review architecture (Generator -> File-by-file Reviewer -> Integration Cross-file Reviewer).
  - State Diagram: Vòng lặp Schema Validation & Auto-retry.

### 4.7 Module 06: Domain 5 – Quản lý Context & Độ tin cậy (15%) (`06-domain-5-context-reliability.md`) - [KHÔI PHỤC MỚI]
- **Nội dung:** 6 Task Statements hoàn chỉnh (5.1 -> 5.6) dịch mới chuẩn xác từ bản gốc.
- **Trọng tâm kiến thức:**
  - Quản lý Context đa lượt: Tóm tắt thông tin nén, loại bỏ rác từ output tool dài, dùng scratchpad file.
  - Escalation patterns: Điều kiện leo thang (policy gap, explicit user ask, deadlock) vs tự giải quyết.
  - Lan truyền lỗi (Error Propagation) trong hệ thống multi-agent: Subagent timeout, chuyển giao partial context.
  - Codebase exploration ở repo lớn: Dùng Glob/Grep có định hướng thay vì quét toàn bộ, context handoff tinh gọn.
  - Human-in-the-loop review & hiệu chuẩn độ tự tin (confidence calibration).
  - Bảo toàn nguồn gốc (Information Provenance) & xử lý mâu thuẫn số liệu trong tổng hợp đa nguồn.
  - So sánh Message Batches API vs Real-time API.
- **Trực quan (Mermaid):**
  - Sequence Diagram: Lan truyền lỗi và xử lý Timeout trong Subagent delegation.
  - Bảng ma trận so sánh Trade-off: Message Batches API vs Real-time Claude API (Chi phí, Latency, Khả năng Tool Call).

### 4.8 Module 07: Luyện tập & Ngân hàng 12 Câu hỏi mẫu (`07-thuc-hanh-va-ngan-hang-cau-hoi.md`) - [KHÔI PHỤC MỌI CÂU HỎI]
- **Nội dung:**
  - **4 Bài tập thực hành lớn (Hands-on Labs):**
    1. Xây dựng Multi-Tool Agent với Escalation Logic.
    2. Cấu hình Claude Code cho Team Development Workflow.
    3. Xây dựng Structured Data Extraction Pipeline.
    4. Thiết kế & Debug Multi-Agent Research Pipeline.
  - **Ngân hàng 12 câu hỏi trắc nghiệm mẫu (Full 100%):**
    - Câu 1: Programmatic enforcement vs Prompt enforcement cho business critical (Customer ID & Refund).
    - Câu 2: Tool Description refinement để tránh nhầm lẫn `get_customer` vs `lookup_order`.
    - Câu 3: Escalation calibration với first-contact resolution.
    - Câu 4: Vị trí đặt file custom slash command `/review` dùng chung cho team.
    - Câu 5: Khi nào dùng Plan Mode cho việc tách microservices.
    - Câu 6: Cấu hình `.claude/rules/` với YAML frontmatter glob patterns cho test convention [Bổ sung phần khuyết].
    - Câu 7: Synthesis agent bảo toàn nguồn gốc và phân biệt finding chắc chắn vs tranh cãi [Dịch mới].
    - Câu 8: Xử lý Subagent timeout và error context propagation [Dịch mới].
    - Câu 9: Tránh automatic context inheritance, truyền trực tiếp claim vào subagent prompt [Dịch mới].
    - Câu 10: Chạy Claude Code trong CI/CD pipeline với cờ `-p` / `--print` [Dịch mới].
    - Câu 11: So sánh Message Batches API (tiết kiệm 50% chi phí, non-blocking) vs Real-time API [Dịch mới].
    - Câu 12: Kiến trúc Multi-pass review cho PR lớn 14 file tránh attention dilution.
- **Trực quan & Tương tác:**
  - Dùng component `<details><summary>` hoặc callout để người học tự suy nghĩ đáp án trước khi mở xem phân tích.
  - Phân tích cặn kẽ 4 góc độ: *Tại sao đáp án này đúng?*, *Cạm bẫy nằm ở đâu?*, *Vì sao các phương án khác sai?*.

---

## 5. Constraints & Implementation Rules

1. **Tuân thủ quy tắc Docusaurus / MDX:**
   - Không để ký tự `<` trơ trọi (ví dụ `<string>` phải viết là `` `<string>` `` hoặc `&lt;string&gt;`).
   - Frontmatter rõ ràng (`title`, `description`, `sidebar_position`, `keywords`).
2. **Quy chuẩn Mermaid (theo skill `mermaid-expert`):**
   - Luôn bao bọc text nhãn bằng dấu nháy kép `["..."]`.
   - Không chứa ngoặc đơn, ngoặc vuông hoặc ký tự đặc biệt trong nhãn không được quote.
   - Thử nghiệm cú pháp chuẩn mực, không dùng cú pháp thử nghiệm chưa ổn định.
3. **Thẩm định chất lượng dịch thuật:**
   - Thuật ngữ chuyên ngành giữ nguyên tiếng Anh hoặc mở ngoặc đối chiếu (ví dụ: *Orchestration*, *Escalation*, *Context Window*, *Provenance*, *Subagent*).
4. **Footer bản quyền:**
   - Thêm `> *Made by Anh Tu - Share to be share*` ở cuối mỗi tài liệu.

---

## 6. What's Left to the Builder (Execution Tasks)

1. Dịch chuẩn xác các đoạn tiếng Anh còn thiếu từ `ccaf-exam-guide-no-translate/pages-1-end.mdx` (Chunk 6 và Chunk 10).
2. Tạo thư mục `docs/claude-certified-architect/` và file `_category_.json`.
3. Biên soạn tuần tự từ Module 01 đến Module 07 theo đúng đề cương chi tiết trên.
4. Kiểm tra render cục bộ bằng lệnh Docusaurus để đảm bảo không có lỗi MDX hoặc Mermaid syntax error.
