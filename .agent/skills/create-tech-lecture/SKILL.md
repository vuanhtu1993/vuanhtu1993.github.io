---
name: create-tech-lecture
description: "Skill chuyên tạo bài giảng/báo cáo kỹ thuật IT chuyên sâu với văn phong sư phạm, gần gũi. Sử dụng khi cần giải thích concept khó (Docker, Kubernetes, Design Patterns...), so sánh công nghệ (React vs Vue, SQL vs NoSQL...), hoặc hướng dẫn thực hành (Tutorial). Tối ưu cho đối tượng Intern/Junior bằng phương pháp Analogy First."
---

# Create Tech Lecture Skill

Skill hỗ trợ giảng viên CNTT tạo bài viết kỹ thuật chuyên sâu nhưng dễ hiểu.

## Quy trình tư duy sư phạm (Pedagogical Flow)

```mermaid
flowchart LR
    A[🎣 Hook] --> B[🔄 Analogy]
    B --> C[🔬 Deep Dive]
    C --> D[📊 Visual]
    D --> E[💻 Practice]
    E --> F[⚠️ Pitfalls]
```

1. **Hook (Thu hút):** Bắt đầu bằng vấn đề thực tế hoặc câu hỏi gợi mở
2. **Analogy (Ẩn dụ):** Giải thích concept bằng hình ảnh đời thường TRƯỚC KHI đi vào kỹ thuật
3. **Technical Deep Dive:** Phân tích kiến trúc, code, luồng dữ liệu
4. **Visual (Trực quan):** Sơ đồ hóa bằng Mermaid
5. **Practice (Thực hành):** Code mẫu với chú thích
6. **Pitfalls (Cảnh báo):** Lỗi thường gặp + Best Practices

## Phân loại bài viết

| Loại | Mục tiêu | Template | Khi nào dùng |
|------|----------|----------|--------------|
| **Concept Explained** | Giải thích khái niệm | [concept.md](templates/concept.md) | "Docker là gì?", "OAuth hoạt động thế nào?" |
| **Tutorial / Guide** | Hướng dẫn làm | [tutorial.md](templates/tutorial.md) | "Build API với Go", "Setup CI/CD" |
| **Architecture Review** | So sánh/Phân tích | [architecture.md](templates/architecture.md) | "Microservices vs Monolith", "Chọn database" |

## Quy tắc trình bày Code

### File Naming
```javascript
// ✅ filename: src/services/auth.service.ts
export class AuthService { ... }
```

### Comment WHY, not WHAT
```python
# ❌ Sai: Khai báo biến x
x = 10

# ✅ Đúng: Giới hạn retry để tránh vòng lặp vô tận khi API không phản hồi
MAX_RETRIES = 10
```

### Snippet thay vì Full Code
```go
// ... (các import statements)

func main() {
    // 👇 Đây là phần quan trọng cần giải thích
    router := gin.Default()
    router.GET("/ping", pingHandler)
    
    // ... (phần còn lại)
}
```

## Văn phong bắt buộc

- **Analogy First:** Mọi concept mới PHẢI có ẩn dụ đời sống
- **Giải thích thuật ngữ** ngay lần đầu xuất hiện
- **Paragraph ngắn:** Tối đa 4-5 dòng/đoạn
- **Sử dụng emoji** để đánh dấu mục quan trọng (⚠️, ✅, ❌, 💡)
- **Trade-off rõ ràng:** Luôn chỉ ra đánh đổi của giải pháp

## Mermaid Diagram Types

| Loại nội dung | Mermaid Type |
|---------------|--------------|
| Quy trình, luồng | `flowchart` |
| Tương tác runtime | `sequenceDiagram` |
| Cấu trúc class/module | `classDiagram` |
| Entity relationships | `erDiagram` |
| Timeline/Roadmap | `gantt` |
