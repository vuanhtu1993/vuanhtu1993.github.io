---
title: "Luyện tập & Ngân hàng 12 Câu hỏi Mẫu CCAR-F"
sidebar_label: "07. Thực hành & 12 Câu hỏi Mẫu"
sidebar_position: 7
description: "Bộ 4 bài Lab thực hành kiến trúc lớn và ngân hàng trọn vẹn 12 câu hỏi trắc nghiệm tình huống chính thức của kỳ thi CCAR-F kèm giải phẫu đáp án chi tiết."
---

# Luyện tập & Ngân hàng 12 Câu hỏi Mẫu CCAR-F

:::info 🎯 Mục tiêu Module 07 [Khôi phục Đầy đủ 100%]
Module này cung cấp:
1. **4 Bài tập Thực hành Lớn (Hands-on Labs)** giúp bạn tích lũy kinh nghiệm thực tế trên codebase.
2. **Ngân hàng 12 Câu hỏi Tình huống Chính thức (Full 100% Questions 1 – 12)** được trích xuất nguyên vẹn từ đề thi mẫu Anthropic, phân bổ theo 6 Scenarios production, kèm phần giải phẫu đáp án chi tiết 4 chiều (tại sao đúng, cạm bẫy trắc nghiệm, và vì sao các phương án khác sai).
:::

---

## PHẦN 1: 4 BÀI TẬP THỰC HÀNH LỚN (HANDS-ON LABS)

### Lab 1: Xây dựng Multi-Tool Agent với Escalation Logic
* **Mục tiêu:** Thực hành thiết kế Agentic Loop với xử lý lỗi có cấu trúc, kiểm tra `stop_reason` và can thiệp quy tắc bằng Programmatic Hooks.
* **Các bước triển khai:**
  1. Định nghĩa 3–4 MCP tools với Tool Description chi tiết, phân định rõ ranh giới input/output. Bao gồm ít nhất 2 tool có chức năng gần giống nhau để kiểm tra độ nhạy của Tool Selection.
  2. Xây dựng vòng lặp kiểm tra `stop_reason`: Điều hướng chính xác khi nhận `"tool_use"` (chạy tool và đóng gói `tool_result`) và khi nhận `"end_turn"` (kết thúc phiên).
  3. Triển khai cấu trúc phản hồi lỗi: Bật `is_error: true`, phân loại `errorCategory` (`transient`, `validation`, `permission`) và cờ `isRetryable: boolean`.
  4. Lập trình một Hook chặn tool call (`PreToolUse`): Chặn cứng các giao dịch vượt ngưỡng giá trị cho phép và tự động kích hoạt luồng leo thang (Escalation).
* **Domain củng cố:** Domain 1 (Agentic Architecture), Domain 2 (Tool Design & MCP).

---

### Lab 2: Cấu hình Claude Code cho Team Development Workflow
* **Mục tiêu:** Thiết lập môi trường làm việc nhóm chuyên nghiệp, phân tầng chỉ dẫn và tự động áp dụng quy ước theo đường dẫn file.
* **Các bước triển khai:**
  1. Xây dựng file `CLAUDE.md` chuẩn mực tại thư mục gốc (dưới 200 dòng, chỉ chứa các lệnh build/test và kiến trúc cốt lõi).
  2. Tạo thư mục `.claude/rules/` với các rule phân tách cho React Component và API Handlers sử dụng YAML frontmatter `paths`.
  3. Tạo Custom Slash Command tại `.claude/commands/review.md` phục vụ checklist code review cho team.
  4. Tạo một Agent Skill chuyên biệt tại `.claude/skills/deploy/SKILL.md` với frontmatter `allowed-tools` và `context: fork`.
* **Domain củng cố:** Domain 3 (Claude Code Configuration & Workflows).

---

### Lab 3: Xây dựng Structured Data Extraction Pipeline
* **Mục tiêu:** Trích xuất dữ liệu tài chính phức tạp từ tài liệu văn bản bằng JSON Schema và xử lý hàng loạt qua Message Batches API.
* **Các bước triển khai:**
  1. Xây dựng schema Pydantic/Zod chặt chẽ: Định nghĩa các trường bắt buộc, trường enum có fallback `"OTHER"`, và `additionalProperties: false`.
  2. Ép buộc structured output thông qua `tool_use` kết hợp `tool_choice: {"type": "tool", "name": "extract_data"}`.
  3. Thiết kế vòng lặp Validation-Retry: Bắt lỗi Pydantic ValidationError và inject thông điệp lỗi chi tiết vào prompt lượt tiếp theo để model tự sửa.
  4. Đóng gói các yêu cầu trích xuất vào Message Batches API để chạy thử nghiệm và đối soát kết quả bằng trường `custom_id`.
* **Domain củng cố:** Domain 4 (Prompt Engineering & Structured Output), Domain 5 (Context Management).

---

### Lab 4: Thiết kế & Debug Multi-Agent Research Pipeline
* **Mục tiêu:** Điều phối song song các subagents, quản lý truyền ngữ cảnh trực tiếp và xử lý đứt gãy mạng/timeout.
* **Các bước triển khai:**
  1. Xây dựng Coordinator Agent điều phối 2 subagents (Web Search và Document Analysis) thông qua `Task` tool.
  2. Cho Coordinator phát ra nhiều `Task` tool calls trong cùng 1 lượt phản hồi để thực thi song song (Parallel Execution) và đo mức giảm độ trễ (latency).
  3. Thiết kế cấu trúc dữ liệu cho Subagent tách biệt nội dung khỏi siêu dữ liệu: mỗi phát hiện bắt buộc gồm `claim`, `evidence_excerpt`, `source_url`, và `publication_date`.
  4. Giả lập tình huống Subagent bị timeout: Kiểm tra xem Coordinator có nhận được `structured error context` (loại lỗi, query đã thử, partial results) và tiếp tục tạo báo cáo với chú thích vùng khuyết (coverage gap) hay không.
* **Domain củng cố:** Domain 1 (Agentic Architecture), Domain 5 (Context Management & Reliability).

---

## PHẦN 2: NGÂN HÀNG 12 CÂU HỎI TÌNH HUỐNG CHÍNH THỨC (FULL QUESTIONS 1 – 12)

:::tip 📝 Hướng dẫn Ôn luyện
Hãy đọc kỹ tình huống, tự chọn đáp án cho bản thân trước khi bấm mở hộp `<details>` bên dưới để xem đáp án chính thức và phần mổ xẻ phân tích kiến trúc!
:::

---

### Scenario: Customer Support Resolution Agent

#### Câu hỏi 1: Bảo vệ Luồng Nghiệp vụ Sống còn
Dữ liệu production cho thấy trong $12\%$ trường hợp, Support Agent của bạn bỏ qua hoàn toàn tool `get_customer` và gọi trực tiếp `lookup_order` chỉ dựa trên tên mà khách hàng tự khai báo, đôi khi dẫn đến việc nhận diện sai tài khoản và hoàn tiền nhầm. Thay đổi nào sẽ giải quyết triệt để nhất vấn đề độ tin cậy này?

- **A.** Thêm một điều kiện tiên quyết ở mức lập trình (Programmatic Prerequisite) để chặn cứng các lệnh gọi `lookup_order` và `process_refund` cho đến khi `get_customer` đã xác thực thành công customer ID.
- **B.** Cải thiện System Prompt để nhấn mạnh rõ rằng việc xác minh khách hàng thông qua `get_customer` là bước bắt buộc trước mọi thao tác với đơn hàng.
- **C.** Thêm các ví dụ Few-shot vào prompt cho thấy Agent luôn gọi `get_customer` trước, ngay cả khi khách hàng đã tự khai báo thông tin đơn hàng.
- **D.** Triển khai một bộ phân loại định tuyến (Routing Classifier) phân tích từng yêu cầu và chỉ bật tập con các tool phù hợp cho từng giai đoạn.

<details>
<summary>👉 Bấm để xem Đáp án & Phân tích Chi tiết</summary>

* **Đáp án đúng: A**
* **Bản chất kiến trúc:** Khi một chuỗi thứ tự gọi tool là bắt buộc đối với logic nghiệp vụ quan trọng (như bảo mật hoặc tài chính), việc áp dụng **rào chắn tất định ở mức code (Programmatic Enforcement)** mang lại sự đảm bảo $100\%$ mà các phương pháp dựa trên prompt không thể có được.
* **Tại sao các phương án khác sai?**
  * **B & C sai:** System Prompt và Few-shot examples chỉ mang tính xác suất (Probabilistic). Trong môi trường sản xuất, sai sót $12\%$ gây hậu quả tài chính là không thể chấp nhận.
  * **D sai:** Routing classifier giải quyết bài toán tính sẵn có của tool chứ không giải quyết được thứ tự thực thi bắt buộc giữa các tool.
</details>

---

#### Câu hỏi 2: Khắc phục Hiện tượng Chọn nhầm Công cụ (Tool Misrouting)
Production log cho thấy Agent thường xuyên gọi `get_customer` khi người dùng hỏi về đơn hàng (ví dụ: *"check my order #12345"*), thay vì gọi `lookup_order`. Cả hai tool đều có mô tả tối giản (*"Retrieves customer information"* / *"Retrieves order details"*) và chấp nhận định dạng identifier tương tự nhau. Bước đầu tiên hiệu quả nhất để cải thiện độ tin cậy của việc chọn tool là gì?

- **A.** Thêm 5–8 ví dụ Few-shot vào System Prompt minh họa các query về order được định tuyến đến `lookup_order`.
- **B.** Mở rộng mô tả (Tool Description) của mỗi tool để bao gồm các định dạng input xử lý, các query ví dụ mẫu, các edge cases, và ranh giới giải thích khi nào nên dùng nó so với tool còn lại.
- **C.** Triển khai một routing layer phân tích input của người dùng trước mỗi lượt và chọn trước tool phù hợp dựa trên keyword phát hiện được.
- **D.** Gộp cả hai tool thành một tool `lookup_entity` duy nhất chấp nhận bất kỳ identifier nào và tự xác định bên trong nên query backend nào.

<details>
<summary>👉 Bấm để xem Đáp án & Phân tích Chi tiết</summary>

* **Đáp án đúng: B**
* **Bản chất kiến trúc:** Tool Description là cơ chế định tuyến chính mà LLM sử dụng. Mở rộng mô tả với ranh giới rõ ràng (Boundaries & Edge Cases) là giải pháp tự nhiên, tinh gọn và hiệu quả nhất để loại bỏ sự chồng chéo chức năng.
* **Tại sao các phương án khác sai?**
  * **A sai:** Few-shot tốn thêm token trong mọi request và khó bao quát hết mọi biến thể câu hỏi của người dùng.
  * **C sai:** Thêm routing layer làm tăng độ trễ và độ phức tạp kiến trúc không cần thiết khi vấn đề gốc rễ nằm ở mô tả tool.
  * **D sai:** Gộp tool vi phạm nguyên tắc Đơn nhiệm (Single Responsibility), làm phức tạp hóa mã nguồn backend và gây khó khăn cho việc xử lý lỗi.
</details>

---

#### Câu hỏi 3: Hiệu chuẩn Tỷ lệ Tự giải quyết (Escalation Calibration)
Support Agent của bạn chỉ đạt tỷ lệ tự giải quyết lần đầu (First-Contact Resolution - FCR) là $55\%$, thấp hơn nhiều so với mục tiêu $80\%$. Log cho thấy nó vội vàng leo thang (escalate) cả những ca đơn giản (như đổi hàng hỏng tiêu chuẩn có ảnh bằng chứng) trong khi lại cố gắng tự xử lý những ca phức tạp cần ngoại lệ về chính sách. Cách hiệu quả nhất để cải thiện việc hiệu chỉnh leo thang là gì?

- **A.** Hạ thấp ngưỡng độ tin cậy chung của Agent để nó tự xử lý nhiều trường hợp hơn trước khi chuyển sang con người.
- **B.** Bổ sung các tiêu chí leo thang rõ ràng (Explicit Escalation Criteria) phân định rạch ròi giữa các quy trình chuẩn được tự động xử lý và các tình huống ngoại lệ về chính sách bắt buộc phải chuyển con người.
- **C.** Yêu cầu Agent luôn thử giải quyết yêu cầu ít nhất 3 lần trước khi được phép kích hoạt công cụ leo thang.
- **D.** Chuyển tất cả các yêu cầu đổi trả sang cho nhân viên con người và chỉ để Agent xử lý các câu hỏi tra cứu thông tin tĩnh.

<details>
<summary>👉 Bấm để xem Đáp án & Phân tích Chi tiết</summary>

* **Đáp án đúng: B**
* **Bản chất kiến trúc:** Vấn đề không nằm ở ngưỡng tin cậy số học chung chung (A) hay số lần thử (C), mà nằm ở việc thiếu **tiêu chí phân định nghiệp vụ rõ ràng**. Phân định rõ các trường hợp chuẩn mực có bằng chứng (ảnh hỏng) được tự động giải quyết giúp tăng FCR, đồng thời giữ an toàn cho các ca vi phạm chính sách.
</details>

---

### Scenario: Code Generation với Claude Code

#### Câu hỏi 4: Chia sẻ Custom Slash Command cho Toàn Team
Bạn muốn tạo một custom slash command `/review` để chạy checklist code review tiêu chuẩn của team. Lệnh này phải sẵn có cho mọi developer trong nhóm ngay khi họ clone hoặc pull repository về máy. Bạn nên tạo file command này ở vị trí nào?

- **A.** Lưu tại file `~/.claude/commands/review.md` trên máy cá nhân.
- **B.** Lưu tại file `.claude/commands/review.md` ở thư mục gốc của repository và commit vào Git.
- **C.** Thêm một section `## Commands` bên trong file `CLAUDE.md` ở thư mục gốc của dự án.
- **D.** Tạo một file rule tại `.claude/rules/review.md` với frontmatter `paths: ["**/*"]`.

<details>
<summary>👉 Bấm để xem Đáp án & Phân tích Chi tiết</summary>

* **Đáp án đúng: B**
* **Bản chất kiến trúc:** Theo quy chuẩn cấu trúc thư mục của Claude Code, các Custom Slash Commands cấp dự án được lưu trữ tại thư mục `.claude/commands/<tên-lệnh>.md`. Khi được commit vào Git, mọi thành viên trong team khi pull repo về sẽ tự động có lệnh `/<tên-lệnh>`.
* **Tại sao các phương án khác sai?**
  * **A sai:** Đường dẫn `~/.claude/` là phạm vi cá nhân (User Scope), không chia sẻ cho đồng đội qua git được.
  * **C sai:** `CLAUDE.md` chỉ chứa hướng dẫn ngữ cảnh, không tạo ra slash command tương tác được.
  * **D sai:** Thư mục `.claude/rules/` dùng để nạp quy ước code theo đường dẫn, không phải slash command.
</details>

---

#### Câu hỏi 5: Khám phá Codebase trước khi Tái cấu trúc (Plan Mode)
Bạn được giao nhiệm vụ tái cấu trúc (refactoring) một ứng dụng monolithic lớn của team sang kiến trúc microservices. Việc này liên quan đến thay đổi trên hàng chục file và đòi hỏi các quyết định phức tạp về ranh giới service và phụ thuộc module. Bạn nên bắt đầu bằng cách tiếp cận nào trong Claude Code?

- **A.** Chạy lệnh Claude Code ở chế độ Plan Mode (`claude --permission-mode plan`) để khảo sát mã nguồn, lập bản đồ phụ thuộc và xây dựng kế hoạch chi tiết trước khi chỉnh sửa file.
- **B.** Chạy lệnh Claude Code trực tiếp và yêu cầu nó bắt đầu tách service đầu tiên ngay lập tức để tiết kiệm thời gian.
- **C.** Chạy Claude Code với cờ `--dangerously-skip-permissions` để nó tự động thực hiện toàn bộ quá trình tái cấu trúc mà không cần dừng lại hỏi.
- **D.** Tự tay sửa đổi mã nguồn thủ công và chỉ dùng Claude Code để viết unit test sau khi đã tách xong.

<details>
<summary>👉 Bấm để xem Đáp án & Phân tích Chi tiết</summary>

* **Đáp án đúng: A**
* **Bản chất kiến trúc:** **Plan Mode** là chế độ được thiết kế chuyên biệt cho việc khảo sát an toàn các codebase lớn. Ở chế độ này, Claude Code bị chặn toàn bộ các quyền ghi/sửa file, cho phép nó thoải mái đọc code, phân tích dependency graph và trình bày kế hoạch hoàn chỉnh cho kiến trúc sư phê duyệt trước khi commit thay đổi.
</details>

---

#### Câu hỏi 6: Quản lý Quy ước Code theo Thư mục bằng Rules Scoping
Codebase của bạn có các quy ước coding khác biệt rõ rệt: React components dùng functional style với hooks, API handlers dùng async/await với cách bắt lỗi riêng, và Database models theo repository pattern. Các file test (`*.test.tsx`) nằm rải rác khắp nơi bên cạnh file code chính. Cách nào dễ bảo trì nhất để đảm bảo Claude tự động áp dụng đúng convention khi sinh code?

- **A.** Tạo các file rule trong thư mục `.claude/rules/` với YAML frontmatter chỉ định glob patterns (`paths`) để áp dụng quy ước có điều kiện dựa trên đường dẫn file.
- **B.** Gộp tất cả quy ước vào một file `CLAUDE.md` duy nhất ở thư mục gốc dưới các tiêu đề riêng biệt và dựa vào việc Claude tự suy luận.
- **C.** Tạo các skill trong `.claude/skills/` cho từng loại code và yêu cầu developer phải tự nhớ gọi skill tương ứng.
- **D.** Đặt một file `CLAUDE.md` riêng biệt vào mọi thư mục con trong dự án.

<details>
<summary>👉 Bấm để xem Đáp án & Phân tích Chi tiết</summary>

* **Đáp án đúng: A**
* **Bản chất kiến trúc:** Thư mục `.claude/rules/*.md` kết hợp trường YAML frontmatter `paths: ["**/*.test.tsx"]` cho phép nạp quy ước **tự động và có điều kiện** khi làm việc với file khớp pattern. Đây là giải pháp hoàn hảo cho các file test nằm rải rác.
* **Tại sao các phương án khác sai?**
  * **B sai:** Dồn vào một file gốc gây ô nhiễm ngữ cảnh và làm giảm độ tuân thủ quy tắc.
  * **C sai:** Dựa vào trí nhớ của con người để gõ lệnh kích hoạt skill vi phạm yêu cầu "tự động áp dụng".
  * **D sai:** Không xử lý được các file test phân tán nếu không muốn nhân bản vô số file `CLAUDE.md`.
</details>

---

### Scenario: Multi-Agent Research System

#### Câu hỏi 7: Phân rã Tác vụ Hẹp của Coordinator (Task Decomposition Root Cause)
Sau khi chạy hệ thống nghiên cứu đề tài *"Tác động của AI đối với các ngành công nghiệp sáng tạo"*, bạn nhận thấy các subagent đều chạy thành công: web search tìm được bài báo, document analysis tóm tắt đúng, và synthesis agent xuất báo cáo mạch lạc. Tuy nhiên, bản báo cáo cuối cùng **chỉ nói về nghệ thuật thị giác (visual arts)** mà bỏ sót hoàn toàn âm nhạc, văn học và điện ảnh. Khi kiểm tra log của Coordinator, bạn thấy nó đã phân rã đề tài thành 3 subtasks: *"AI trong hội họa số"*, *"AI trong thiết kế đồ họa"*, và *"AI trong nhiếp ảnh"*. Nguyên nhân gốc rễ ở đây là gì?

- **A.** Synthesis Subagent thiếu chỉ dẫn về việc phát hiện khoảng trống dữ liệu từ các subagent khác gửi về.
- **B.** Coordinator Agent đã phân rã tác vụ (Task Decomposition) quá hẹp, dẫn đến việc giao việc cho các subagent không bao quát hết các lĩnh vực liên quan của đề tài.
- **C.** Web Search Subagent sinh query tìm kiếm không đủ rộng và cần được mở rộng thêm từ khóa.
- **D.** Document Analysis Subagent đã vô tình lọc bỏ các tài liệu phi thị giác do tiêu chí sàng lọc quá khắt khe.

<details>
<summary>👉 Bấm để xem Đáp án & Phân tích Chi tiết</summary>

* **Đáp án đúng: B**
* **Bản chất kiến trúc:** Log của Coordinator đã chỉ ra trực tiếp nguyên nhân gốc rễ: Nó đã tự ý thu hẹp khái niệm "ngành công nghiệp sáng tạo" thành chỉ 3 nhánh thị giác. Các subagents cấp dưới đã hoàn thành xuất sắc nhiệm vụ được giao—vấn đề nằm ở việc **chúng được giao nhiệm vụ sai lệch ngay từ đầu**.
* **Bài học:** Lỗi của hệ thống Multi-Agent thường xuất phát từ bước phân rã tác vụ ban đầu của Coordinator.
</details>

---

#### Câu hỏi 8: Xử lý Đứt gãy Mạng khi Subagent Bị Timeout
Web Search Subagent bị timeout trong khi nghiên cứu một chủ đề phức tạp. Bạn cần thiết kế cách thức thông tin lỗi này được chuyển giao ngược lại cho Coordinator Agent. Cách tiếp cận lan truyền lỗi (Error Propagation) nào hỗ trợ phục hồi thông minh nhất?

- **A.** Trả về cho Coordinator một ngữ cảnh lỗi có cấu trúc (Structured Error Context) bao gồm loại lỗi (`failure_type`), câu truy vấn đã thử (`attempted_query`), bất kỳ kết quả một phần nào đã thu thập được (`partial_results`), và gợi ý hướng xử lý thay thế.
- **B.** Triển khai logic tự động thử lại vô hạn với exponential backoff bên trong subagent, và chỉ trả về trạng thái chung chung *"search unavailable"* khi thất bại hoàn toàn.
- **C.** Bắt lỗi timeout bên trong subagent và âm thầm trả về một tập kết quả rỗng được đánh dấu là thành công.
- **D.** Ném ngoại lệ timeout thẳng lên handler cấp cao nhất để chấm dứt ngay lập tức toàn bộ pipeline nghiên cứu.

<details>
<summary>👉 Bấm để xem Đáp án & Phân tích Chi tiết</summary>

* **Đáp án đúng: A**
* **Bản chất kiến trúc:** Cung cấp thông tin lỗi có cấu trúc giúp Coordinator đưa ra quyết định phục hồi thông minh: thử lại với câu query khác, đổi hướng tiếp cận, hoặc sử dụng kết quả từng phần (Partial Results) và chú thích khoảng trống dữ liệu trong báo cáo cuối cùng.
* **Tại sao các phương án khác sai?**
  * **B sai:** Ẩn giấu thông tin chi tiết bằng thông báo chung chung khiến Coordinator không biết đường khắc phục.
  * **C sai:** Giả mạo thành công làm mất dữ liệu và tạo ra báo cáo sai lệch.
  * **D sai:** Sập toàn bộ hệ thống một cách không cần thiết khi hoàn toàn có thể phục hồi từng phần.
</details>

---

#### Câu hỏi 9: Tối ưu Độ trễ khi Xác minh Dữ liệu (Least Privilege in Verification)
Trong quá trình thử nghiệm, Synthesis Agent thường xuyên cần xác minh lại các dữ kiện cụ thể khi gộp kết quả. Hiện tại, mỗi khi cần kiểm tra, Synthesis Agent phải trả quyền điều khiển về Coordinator, Coordinator gọi Web Search Agent, rồi chuyển kết quả lại cho Synthesis. Việc này làm tăng $2-3$ round-trips và tăng độ trễ lên $40\%$. Thống kê cho thấy $85\%$ các ca xác minh chỉ là kiểm tra sự thật đơn giản (ngày tháng, tên riêng, số liệu), trong khi chỉ có $15\%$ cần nghiên cứu sâu. Giải pháp nào tối ưu nhất vừa giảm chi phí vừa giữ vững độ tin cậy?

- **A.** Cấp cho Synthesis Agent một công cụ giới hạn phạm vi `verify_fact` để tự tra cứu các sự thật đơn giản ($85\%$), trong khi các ca phức tạp ($15\%$) vẫn ủy quyền cho Web Search Agent thông qua Coordinator.
- **B.** Cho Synthesis Agent tích lũy tất cả các dữ kiện cần xác minh và gửi thành một mảng batch duy nhất về cho Coordinator ở cuối lượt chạy.
- **C.** Cấp toàn bộ các công cụ tìm kiếm web của Web Search Agent cho Synthesis Agent để nó tự xử lý mọi thứ.
- **D.** Yêu cầu Web Search Agent chủ động lưu cache dự phòng ngữ cảnh xung quanh mọi nguồn tin ngay từ đầu.

<details>
<summary>👉 Bấm để xem Đáp án & Phân tích Chi tiết</summary>

* **Đáp án đúng: A**
* **Bản chất kiến trúc:** Áp dụng nguyên tắc **Đặc quyền Tối thiểu (Principle of Least Privilege)**: Cấp cho Synthesis Agent một công cụ tra cứu nhẹ để giải quyết trường hợp phổ biến ($85\%$), loại bỏ các round-trips không cần thiết, đồng thời duy trì mô hình điều phối tách biệt cho các ca nghiên cứu sâu ($15\%$).
* **Tại sao các phương án khác sai?**
  * **B sai:** Tạo ra sự bế tắc (blocking dependency) vì các bước tổng hợp sau có thể phụ thuộc vào dữ kiện cần xác minh trước đó.
  * **C sai:** Vi phạm nguyên tắc phân tách trách nhiệm (Separation of Concerns), làm phình to context của Synthesis Agent.
  * **D sai:** Dự đoán ngữ cảnh tương lai không thể chính xác và làm lãng phí tài nguyên lưu trữ.
</details>

---

### Scenario: Claude Code cho Continuous Integration (CI/CD)

#### Câu hỏi 10: Chạy Claude Code Tự động trong Pipeline Không Tương tác
Script trong pipeline CI/CD của bạn chạy lệnh `claude "Analyze this pull request for security issues"` nhưng job bị treo vô thời hạn (hang indefinitely). Log hiển thị Claude Code đang dừng chờ người dùng nhập dữ liệu tương tác từ bàn phím. Cách tiếp cận đúng đắn để chạy Claude Code trong pipeline tự động là gì?

- **A.** Thêm cờ `-p` (hoặc `--print`): `claude -p "Analyze this pull request for security issues"`
- **B.** Thiết lập biến môi trường `CLAUDE_HEADLESS=true` trước khi chạy lệnh.
- **C.** Redirect stdin từ `/dev/null`: `claude "Analyze this pull request for security issues" < /dev/null`
- **D.** Thêm cờ `--batch`: `claude --batch "Analyze this pull request for security issues"`

<details>
<summary>👉 Bấm để xem Đáp án & Phân tích Chi tiết</summary>

* **Đáp án đúng: A**
* **Bản chất kiến trúc:** Cờ **`-p` (hoặc `--print`)** là cờ chính thức được tài liệu của Anthropic quy định để kích hoạt **Non-interactive / Headless mode** trong Claude Code. Ở chế độ này, Claude Code xử lý prompt, in kết quả ra stdout và thoát ngay lập tức với mã exit code phù hợp mà không chờ bất kỳ tương tác nào từ bàn phím.
* **Tại sao các phương án khác sai?** Các cờ `CLAUDE_HEADLESS` hay `--batch` là các tham số không tồn tại trong tài liệu chính thức của Claude Code.
</details>

---

#### Câu hỏi 11: Đánh giá Đánh đổi giữa Real-Time API và Message Batches API
Nhóm của bạn muốn giảm chi phí API cho việc phân tích tự động. Hiện tại, các lệnh gọi Claude thời gian thực đang chạy cho hai quy trình: (1) kiểm tra pre-merge bắt buộc lập trình viên phải chờ kết quả trước khi bấm merge code, và (2) báo cáo technical debt chạy ngầm qua đêm để gửi vào sáng hôm sau. Quản lý của bạn đề xuất chuyển cả hai quy trình sang dùng **Message Batches API** để tiết kiệm $50\%$ chi phí. Bạn nên đánh giá đề xuất này như thế nào?

- **A.** Chỉ sử dụng Message Batches API cho báo cáo technical debt qua đêm; giữ nguyên lệnh gọi thời gian thực (Real-time) cho việc kiểm tra pre-merge.
- **B.** Chuyển cả hai quy trình sang Message Batches API và dùng cơ chế polling kiểm tra khi nào xong.
- **C.** Giữ nguyên lệnh gọi thời gian thực cho cả hai quy trình để tránh các vấn đề về thứ tự kết quả trong batch.
- **D.** Chuyển cả hai sang batch và đặt timeout fallback quay lại gọi thời gian thực nếu batch chạy quá lâu.

<details>
<summary>👉 Bấm để xem Đáp án & Phân tích Chi tiết</summary>

* **Đáp án đúng: A**
* **Bản chất kiến trúc:** **Message Batches API** giảm $50\%$ chi phí nhưng có thời gian xử lý lên tới 24 giờ và không có cam kết SLA về độ trễ thời gian thực. Do đó, nó hoàn toàn không phù hợp cho quy trình kiểm tra pre-merge (nơi developer đang bị block chờ kết quả), nhưng lại là giải pháp hoàn hảo cho các tác vụ chạy ngầm qua đêm.
</details>

---

#### Câu hỏi 12: Khắc phục Hiện tượng Pha loãng Chú ý trên PR Lớn (Multi-Pass Review)
Một Pull Request sửa đổi 14 file trên toàn bộ module theo dõi kho hàng. Lượt review một pass duy nhất của bạn, phân tích tất cả các file cùng lúc, tạo ra kết quả không nhất quán: nhận xét rất chi tiết ở một vài file đầu nhưng hời hợt ở các file sau, bỏ sót bug rõ ràng, và thậm chí mâu thuẫn (bắt bẻ một đoạn code ở file A trong khi lại chấp thuận đoạn code y hệt ở file B). Bạn nên tái cấu trúc quy trình review như thế nào?

- **A.** Chia thành các lượt tập trung (Focused Passes): phân tích từng file riêng lẻ để tìm các vấn đề cục bộ, sau đó chạy một lượt tích hợp riêng (Integration Pass) để kiểm tra luồng dữ liệu liên file.
- **B.** Bắt buộc lập trình viên phải tự chia nhỏ PR thành các phần nhỏ 3–4 file trước khi automated review chạy.
- **C.** Chuyển sang model có context window lớn hơn để cung cấp đủ độ chú ý cho cả 14 file trong một lượt duy nhất.
- **D.** Chạy ba lượt review độc lập trên toàn bộ PR và chỉ giữ lại các vấn đề xuất hiện ở ít nhất 2 trên 3 lượt chạy.

<details>
<summary>👉 Bấm để xem Đáp án & Phân tích Chi tiết</summary>

* **Đáp án đúng: A**
* **Bản chất kiến trúc:** Chia review thành **các lượt tập trung (Multi-pass Review)** giải quyết trực tiếp nguyên nhân gốc rễ: **Sự pha loãng độ chú ý (Attention Dilution)** khi xử lý quá nhiều file cùng lúc. Pass theo từng file đảm bảo độ sâu nhất quán, trong khi Integration pass bắt được lỗi luồng dữ liệu xuyên file.
* **Tại sao các phương án khác sai?**
  * **B sai:** Đẩy gánh nặng tổ chức sang developer mà không cải thiện năng lực tự động hóa của hệ thống.
  * **C sai:** Nhầm lẫn tai hại giữa *kích thước context window* và *chất lượng chú ý (attention capacity)*.
  * **D sai:** Làm tăng chi phí gấp 3 lần mà không giải quyết được vấn đề chú ý phân tán.
</details>

---

## 3. 📚 Tài liệu Tham chiếu Chính thức từ Anthropic

- [Hướng dẫn Chuẩn bị Thi CCAR-F](file:///Users/anhtus/Documents/Development/Documentary/vuanhtu1993.github.io/blog/aha-interpreter/ccaf-exam-guide-no-translate/pages-1-end.mdx) — Toàn bộ đề bài và đáp án gốc tiếng Anh.
- [Chạy Claude Code trong Headless CI/CD](file:///Users/anhtus/Documents/Development/Documentary/vuanhtu1993.github.io/sources/documentations/code.claude.com/docs/en/headless.md) — Chi tiết cờ `-p` và `--output-format`.
- [Xử lý Message Batches API](file:///Users/anhtus/Documents/Development/Documentary/vuanhtu1993.github.io/sources/documentations/platform.claude.com/docs/en/build-with-claude/batch-processing.md) — Chiết khấu 50% chi phí và xử lý bất đồng bộ.

---

> *Made by Anh Tu - Share to be share*
