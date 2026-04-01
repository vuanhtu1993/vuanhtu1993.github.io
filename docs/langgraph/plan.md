**Mục tiêu:** Nắm bắt **overview LangGraph** một cách nhanh chóng, hiểu rõ bức tranh tổng thể và có thể **code ứng dụng ngay lập tức**. LangGraph có concept khá trừu tượng vì dựa trên lý thuyết Đồ thị (Graph) nên xây dựng theo hướng: *Học 1 concept lõi → Code 1 ứng dụng thực tế ngay lập tức.*

**Công cụ:** Google Colab (miễn phí), LangSmith, Tavily, OpenAI/Anthropic.

> ⚠️ **Lưu ý Colab:** Ở Giai đoạn 3, dùng `SqliteSaver` thay vì `MemorySaver` và mount Google Drive để tránh mất dữ liệu khi session timeout.

---

### GIAI ĐOẠN 1: Hiểu bản chất & Bắt đầu nhanh (Ngày 1 - 2)
**Mục tiêu:** Hiểu tại sao LangGraph lại dùng "Đồ thị" và cách luồng dữ liệu di chuyển mà chưa cần ghép AI phức tạp vào.

**1. Các Concept cốt lõi bắt buộc phải nắm:**
Chỉ cần nhớ 3 thành phần tạo nên LangGraph:
*   **State (Trạng thái):** Là một cục dữ liệu (thường là Dictionary/Pydantic model) được truyền từ bước này sang bước khác. Mỗi bước có thể đọc hoặc ghi đè lên State này.
*   **Nodes (Các nút):** Là các hàm Python (Functions) thực hiện một công việc cụ thể (Ví dụ: Node gọi LLM, Node chạy công cụ Search Web).
*   **Edges (Các cạnh):** Quyết định luồng đi. Từ Node A đi sang Node B (Normal Edge), hoặc dùng logic IF/ELSE để quyết định đi sang Node B hay C (Conditional Edge).

**2. Ứng dụng thực hành số 1: "Hello World" Graph (Không dùng LLM)**
*   **Việc cần làm:** Đừng vội gọi API OpenAI. Hãy viết một Graph đơn giản bằng Python tĩnh:
    *   *State:* Biến `text` (string).
    *   *Node 1:* Nhận text, thêm chữ "Xin chào ".
    *   *Node 2:* Thêm chữ "LangGraph!".
    *   *Thực thi:* Chạy Graph và xem State thay đổi thế nào.
*   *Mục đích:* Giúp bạn không bị "ảo giác" của LLM làm rối trí. Bạn sẽ hiểu luồng dữ liệu truyền đi cực kỳ rõ ràng.

---

### GIAI ĐOẠN 2: Xây dựng ReAct Agent cơ bản (Ngày 3 - 5)
**Mục tiêu:** Tạo ra một AI Agent hoàn chỉnh có thể tự suy nghĩ, tự xài Tool và tự trả lời (ứng dụng có thể khoe được ngay).

**1. Các Concept cốt lõi cần học:**
*   **Tool Calling:** Cách bind (gắn) các công cụ (như Web Search, Máy tính) vào LLM.
*   `ToolNode` và `tools_condition` (Các hàm dựng sẵn của LangGraph giúp tiết kiệm 80% thời gian code).

**2. Ứng dụng thực hành số 2: "Trợ lý nghiên cứu sự kiện thời sự"**
*   **Việc cần làm:** Dùng API của Tavily (chuyên dụng cho AI Search) hoặc DuckDuckGo kết hợp với OpenAI/Anthropic.
*   **Luồng (Graph):**
    *   User hỏi: "Giá vàng hôm nay bao nhiêu?" -> Đưa vào Node LLM.
    *   LLM quyết định cần dùng Tool tìm kiếm -> Chuyển sang Conditional Edge.
    *   Cạnh này hướng đến `ToolNode` (Thực hiện search web).
    *   Search xong, trả kết quả về `State` -> Vòng ngược lại Node LLM.
    *   LLM thấy đủ thông tin -> Trả lời User -> End.
*   *Kết quả:* Bạn có ngay một con bot thông minh hơn ChatGPT bản miễn phí vì nó lấy data realtime.

---

### GIAI ĐOẠN 3: Thêm Memory & Human-in-the-Loop (Tuần 2)
**Mục tiêu:** Hiểu 2 concept quan trọng nhất giúp LangGraph nổi bật so với các framework khác: trí nhớ và khả năng kiểm soát luồng.

**1. Các Concept cốt lõi cần học:**
*   **Checkpointers (SqliteSaver):** Cách LangGraph lưu trữ lịch sử các Node đã chạy để tạo "Memory" (Trí nhớ) cho Agent. Dùng `SqliteSaver` + mount Google Drive để tránh mất dữ liệu khi Colab timeout.
*   **Human-in-the-Loop (HITL):** Lệnh `interrupt_before` — dừng Graph lại tại một Node để chờ con người xác nhận.

**2. Ứng dụng thực hành số 3: "Trợ lý hành động có kiểm duyệt"**
*   **Việc cần làm:** Nâng cấp bot ở Giai đoạn 2.
*   **Luồng (Graph):**
    *   Thêm tính năng ghi nhớ: Hỏi câu 1, câu 2 bot vẫn nhớ ngữ cảnh câu 1 (nhờ Thread ID và Checkpointer).
    *   Thêm **Mock Tool** `execute_action` để mô phỏng hành động nhạy cảm (thay vì SMTP thật — không cần thiết cho mục tiêu học).
    *   **Áp dụng HITL:** Cài đặt Graph tự động DỪNG (Pause) trước khi chạy Node `execute_action`. In ra màn hình: *"Bạn có muốn thực hiện hành động này không (Y/N)?"*. Nếu gõ Y, Graph tiếp tục chạy (Resume). Nếu gõ N, Graph quay lại bắt LLM làm lại.
*   *Mục đích:* Dùng mock tool giúp tập trung vào HITL pattern mà không mất thời gian cấu hình SMTP.

---

### GIAI ĐOẠN 4: Overview Multi-Agent (Tuần 3)
**Mục tiêu:** Hiểu kiến trúc Multi-Agent — cách LangGraph quản lý nhiều Agent phối hợp với nhau. Scope nhỏ, đủ để nắm pattern.

**1. Khái niệm cốt lõi cần học:**
*   **Supervisor Pattern (Mô hình quản lý):** Một LLM đóng vai trò điều phối luồng, quyết định giao việc cho Agent nào.
*   **Sub-graphs:** Graph lồng trong Graph (Mỗi Agent con thực chất là một Graph nhỏ).

**2. Ứng dụng thực hành số 4: Multi-Agent đơn giản (2 Agent)**
*   **Việc cần làm:** Tạo 2 Agent (đủ để hiểu pattern, không cần build team phức tạp).
    *   *Agent Supervisor:* Nhận yêu cầu, quyết định giao cho Worker Agent.
    *   *Agent Worker:* Thực hiện công việc cụ thể (tìm kiếm hoặc tóm tắt thông tin).
*   **Luồng:** Supervisor nhận input → Gọi Worker → Nhận kết quả → Trả về output cuối.
*   *Mục đích:* Hiểu Sub-graph và cách state được truyền qua lại giữa các Agent.

---

### GIAI ĐOẠN 5: Reflection — Điểm Mạnh & Yếu của LangGraph (1 - 2 ngày)
**Mục tiêu:** Đây là output quan trọng nhất của cả lộ trình. Sau khi đã qua thực chiến 4 giai đoạn, viết ra nhận định cá nhân có căn cứ.

**Các câu hỏi cần trả lời:**
*   **Điểm mạnh:** LangGraph giải quyết vấn đề gì tốt hơn LangChain thuần (LCEL)? Khi nào nên dùng?
*   **Điểm yếu:** Khi nào LangGraph là overkill? Khó debug ở đâu? Overhead lớn nhất là gì?
*   **Trade-off:** So với CrewAI hoặc AutoGen, LangGraph có gì khác biệt về triết lý thiết kế?

**Output kỳ vọng:** Một bài blog phân tích đăng lên site — vừa củng cố kiến thức, vừa tạo giá trị chia sẻ cho cộng đồng.