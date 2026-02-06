---
name: create-report
description: "Skill tạo báo cáo chuyên nghiệp từ dữ liệu nghiên cứu. Sử dụng khi cần tổng hợp thông tin thành báo cáo có cấu trúc, bao gồm Executive Summary, Phân tích chi tiết, So sánh đánh giá, Trực quan hóa (Mermaid diagrams), và Kết luận với Action Items. Hỗ trợ 3 template Quick, Standard, Deep Dive."
---

# Create Report Skill

Skill hướng dẫn tạo báo cáo chuyên nghiệp từ dữ liệu nghiên cứu.

## Quy trình tạo báo cáo

### Bước 1: Xác định loại báo cáo

| Loại | Độ dài | Khi nào dùng |
|------|--------|--------------|
| Quick | 500-1000 từ | Giải thích khái niệm, tóm tắt nhanh |
| Standard | 1500-2500 từ | Phân tích chủ đề thông thường |
| Deep Dive | 3000+ từ | Nghiên cứu chuyên sâu, so sánh nhiều giải pháp |

### Bước 2: Tổng hợp & Cấu trúc hóa

1. **Gom nhóm thông tin** theo luồng logic (cơ bản → nâng cao)
2. **Tách biệt rõ:** Fact (Sự thật) vs Opinion (Ý kiến)
3. **Chuẩn bị minh họa:**
   - Code snippets (nếu kỹ thuật)
   - Ví dụ thực tế
   - Bảng so sánh

### Bước 3: Thiết kế trực quan

Sử dụng Mermaid cho các loại sơ đồ:

| Loại nội dung | Mermaid Type |
|---------------|--------------|
| Quy trình | `flowchart` |
| Cấu trúc hệ thống | `classDiagram` hoặc `erDiagram` |
| Timeline/Roadmap | `gantt` |
| Quan hệ | `graph` |

**Quy tắc code snippets:**
- ✅ Code ngắn gọn, minh họa concept
- ✅ Pseudo-code khi cần giải thích logic
- ✅ Sử dụng highlight and bold với các khái niệm hoặc lưu ý quan trọng
- ❌ Full source code, boilerplate dài

### Bước 4: Viết báo cáo

Sử dụng template phù hợp:
- [templates/report_quick.md](templates/report_quick.md) - Báo cáo ngắn
- [templates/report_standard.md](templates/report_standard.md) - Báo cáo chuẩn
- [templates/report_deep.md](templates/report_deep.md) - Báo cáo chuyên sâu

## Cấu trúc báo cáo chuẩn

```markdown
# [Tiêu đề: Rõ ràng & Thu hút]

> **Loại:** [Quick/Standard/Deep Dive]
> **Đối tượng:** [Beginner/Intermediate/Expert]
> **Cập nhật:** [Ngày]

## 1. Tóm tắt điều hành
[3-5 điểm chính + Kết luận sơ bộ]

## 2. Phân tích chi tiết
### 2.1. [Khía cạnh 1]
[Giải thích + Minh họa]

## 3. So sánh & Đánh giá
[Bảng so sánh ưu/nhược điểm]

## 4. Trực quan hóa
[Mermaid diagrams]

## 5. Kết luận & Hành động
[Tóm tắt + Checklist action items]

## Nguồn tham khảo
[Links với mô tả ngắn]
```

## Văn phong

- **Gần gũi, giản dị** - phù hợp sinh viên/người mới
- **Giải thích thuật ngữ** ngay lần đầu xuất hiện
- **Paragraph ngắn** - tối đa 4-5 dòng/đoạn
- **Sử dụng bullet points** thay vì văn xuôi dài
