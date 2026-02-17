---
name: mermaid-expert
description: "Chuyên gia về Mermaid Diagram. Cung cấp các quy tắc 'bất di bất dịch' để tránh lỗi syntax, templates an toàn (robust), và hướng dẫn sửa lỗi (troubleshooting). Sử dụng skill này khi cần vẽ biểu đồ phức tạp hoặc khi gặp lỗi 'Parse error'."
---

# Mermaid Expert Skill

Skill này tập hợp các Best Practices để đảm bảo Mermaid diagrams luôn render thành công trên Docusaurus và các nền tảng khác.

## 🛡️ The "Anti-Break" Golden Rules (Quy tắc Vàng)

Để tránh 99% lỗi "Parse error", hãy tuân thủ 3 quy tắc sau:

### Rule #1: ALWAYS Quote Labels (Luôn dùng ngoặc kép)
Không bao giờ viết text trần. Luôn bao quanh label bằng dấu ngoặc kép `""`.
*   ❌ Sai: `A[Hello World]`
*   ✅ Đúng: `A["Hello World"]`

### Rule #2: ALWAYS Use Explicit IDs (Luôn có ID rõ ràng)
Đừng để Mermaid tự sinh ID hoặc dùng text làm ID. Hãy đặt ID ngắn gọn, không dấu, alphanumeric.
*   ❌ Sai: `(Khái niệm)`
*   ✅ Đúng: `concept["(Khái niệm)"]`

### Rule #3: Escape Special Characters (Xử lý ký tự đặc biệt)
Các ký tự `()`, `[]`, `{}`, `"`, `#` rất dễ gây lỗi parser nếu không được xử lý.
*   **Trong Label:** Dùng ngoặc kép bao quanh là đủ an toàn cho `()`, `[]`.
*   **Dấu ngoặc kép trong label:** Dùng HTML entity `#quot;`. Ví dụ: `id["Nói: #quot;Hello#quot;"]`
*   **Icon/Emoji:** Hỗ trợ tốt trong ngoặc kép. `id["🚀 Keep moving"]`

---

## 🏗️ Robust Templates (Mẫu An Toàn)

Copy và điền vào các mẫu này để đảm bảo không lỗi.

### 1. Mindmap (Sơ đồ tư duy)
**Lưu ý:** Mindmap rất nhạy cảm với dấu ngoặc đơn `()`. Bắt buộc dùng `id["Label"]`.

```mermaid
mindmap
  root((Root Topic))
    Branch1["Main Branch 1"]
      Sub1["Sub-item (với ngoặc)"]
      Sub2["Sub-item #2"]
    Branch2["Main Branch 2"]
      Sub3["Sub-item với icon 🚀"]
      Sub4["Sub-item dài dòng..."]
```

### 2. Flowchart (Lưu đồ)
Dùng `graph TD` (trên xuống) hoặc `graph LR` (trái sang).

```mermaid
graph TD
    Start["Bắt đầu (Start)"] --> Step1["Bước 1: Làm gì đó?"]
    Step1 --> Decision{"Có lỗi không?"}
    Decision -- "Có" --> Fix["Sửa lỗi (Fix)"]
    Fix --> Step1
    Decision -- "Không" --> End["Kết thúc (End)"]
    
    %% Styling (Optional)
    style Start fill:#f9f,stroke:#333
    style End fill:#9f9,stroke:#333
```

### 3. Sequence Diagram (Biểu đồ tuần tự)
Sử dụng `participant as` để tách biệt ID và Label.

```mermaid
sequenceDiagram
    autonumber
    actor User as "Người dùng (User)"
    participant FE as "Frontend (React)"
    participant BE as "Backend (NestJS)"
    participant DB as "Database (Postgres)"

    User->>FE: Click "Login"
    FE->>BE: POST /auth/login
    BE->>DB: SELECT * FROM users
    DB-->>BE: Return User Data
    BE-->>FE: Return JWT Token
    FE-->>User: Redirect to Dashboard
```

### 4. Quadrant Chart (Biểu đồ 4 góc)
**Cảnh báo:** Quadrant Chart hiện tại **KHÔNG** hỗ trợ tốt dấu ngoặc kép trong text trục (axis labels). Hãy dùng từ đơn giản cho trục.

```mermaid
quadrantChart
    title "Risk vs Reward Matrix"
    x-axis Low Risk --> High Risk
    y-axis Low Reward --> High Reward
    
    quadrant-1 "Ngôi sao (Star)"
    quadrant-2 "Bò sữa (Cash Cow)"
    quadrant-3 "Chó mực (Dog)"
    quadrant-4 "Dấu hỏi (Question)"
    
    "Dự án A": [0.3, 0.6]
    "Dự án B": [0.45, 0.23]
    "Dự án C": [0.57, 0.69]
    "Dự án D": [0.78, 0.34]
```

### 5. ER Diagram (Sơ đồ thực thể)
Dùng `||--o{` cho quan hệ. Text mô tả quan hệ phải có dấu ngoặc kép.

```mermaid
erDiagram
    USER ||--o{ ORDER : "đặt (places)"
    USER {
        string username "Tên đăng nhập"
        string email
    }
    ORDER ||--|{ LINE_ITEM : "chứa (contains)"
    ORDER {
        int order_id
        string delivery_address
    }
```

---

## 🔧 Troubleshooting Guide (Sửa Lỗi)

### Lỗi 1: `Expecting 'SQE', 'DOUBLECIRCLEEND'... got 'PS'`
*   **Nguyên nhân:** Thường do Mindmap hoặc Graph có chứa dấu `(` `)` `[` `]` mà không được bao trong ngoặc kép.
*   **Cách sửa:** Tìm chỗ text bị trần, bọc lại bằng `id["Text"]`.
    *   Sai: `(Khái niệm)`
    *   Đúng: `def["(Khái niệm)"]`

### Lỗi 2: `Parse error on line X` (Chung chung)
*   **Nguyên nhân:**
    1.  Dùng từ khóa trùng (ví dụ `end`, `subgraph` làm ID).
    2.  Thiếu dấu ngoặc đóng/mở.
    3.  Syntax sai (ví dụ `-->` trong Mindmap).
*   **Cách sửa:**
    1.  Kiểm tra dòng X.
    2.  Đổi ID sang tên khác (ví dụ `endNode` thay vì `end`).
    3.  Đảm bảo cú pháp đúng loại diagram (Mindmap không dùng mũi tên).

### Lỗi 3: Text bị cắt hoặc hiển thị sai
*   **Nguyên nhân:** Dùng ký tự lạ hoặc conflict HTML.
*   **Cách sửa:** Dùng HTML Entity hoặc bỏ bớt ký tự đặc biệt.
