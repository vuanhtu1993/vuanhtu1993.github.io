# QA Checklists for Report Review

## Content Checklist

### Executive Summary
- [ ] Tóm tắt đầy đủ 3-5 điểm chính
- [ ] Có kết luận sơ bộ
- [ ] Có thể đọc độc lập mà vẫn hiểu nội dung chính
- [ ] Không chứa thông tin mới (chỉ tóm tắt)

### Terminology & Definitions
- [ ] Thuật ngữ chuyên ngành được định nghĩa lần đầu xuất hiện
- [ ] Có bảng thuật ngữ (nếu >5 terms)
- [ ] Không lạm dụng jargon
- [ ] Acronyms được giải thích

### Examples & Illustrations
- [ ] Mỗi concept chính có ít nhất 1 ví dụ
- [ ] Code snippets có comments giải thích
- [ ] Diagrams phù hợp với nội dung
- [ ] Ví dụ thực tế, không quá abstract

### Conclusions & Actions
- [ ] Có tóm tắt kết quả nghiên cứu
- [ ] Ít nhất 1 action item cụ thể
- [ ] Khuyến nghị rõ ràng, actionable
- [ ] Next steps phù hợp với đối tượng độc giả

### Sources & References
- [ ] Tất cả claims có trích nguồn
- [ ] Links hoạt động
- [ ] Nguồn có credibility (xem fact-check skill)
- [ ] Format nhất quán

---

## Format Checklist

### Markdown Structure
- [ ] Một và chỉ một H1 (tiêu đề chính)
- [ ] Heading hierarchy đúng (H1 > H2 > H3), không skip level
- [ ] Metadata block ở đầu (loại, đối tượng, ngày)
- [ ] Horizontal rules phân cách sections

### Code Blocks
```markdown
✅ Correct:
```python
def example():
    pass
```

❌ Incorrect:
```
def example():
    pass
```
```

- [ ] Language identifier sau backticks
- [ ] Code không quá dài (max 30 lines)
- [ ] Comments giải thích khi cần

### Tables
- [ ] Headers rõ ràng
- [ ] Alignment phù hợp
- [ ] Không quá 5-6 columns
- [ ] Render đúng

### Links
- [ ] Format: [text](url) không có space
- [ ] Không có bare URLs (trừ References)
- [ ] Internal links tới đúng section

### Mermaid Diagrams
- [ ] Syntax đúng - không lỗi render
- [ ] Diagram type phù hợp (flowchart, sequence, etc.)
- [ ] Labels ngắn gọn, đọc được
- [ ] Không quá phức tạp (max 15-20 nodes)

---

## Readability Checklist

### Word Count by Report Type
| Type | Target | Min | Max |
|------|--------|-----|-----|
| Quick | 750 | 400 | 1200 |
| Standard | 2000 | 1200 | 3000 |
| Deep Dive | 4000 | 2500 | 6000 |

### Paragraph Length
- [ ] Max 4-5 lines per paragraph
- [ ] Không có wall of text
- [ ] Visual breaks giữa các sections

### Formatting for Scannability
- [ ] Headers mô tả nội dung section
- [ ] Bullet points cho lists (>2 items)
- [ ] Bold cho key terms
- [ ] Tables cho comparisons

### Tone & Style
- [ ] Nhất quán từ đầu đến cuối
- [ ] Phù hợp target audience
- [ ] Không quá formal hoặc quá casual
- [ ] Active voice ưu tiên

---

## Quick Review Checklist (5-minute version)

Khi cần review nhanh:

1. [ ] Executive Summary đầy đủ?
2. [ ] Có action items trong Conclusion?
3. [ ] Mermaid diagrams render OK?
4. [ ] Links hoạt động?
5. [ ] Độ dài phù hợp?

---

## Review Severity Guide

| Severity | Criteria | Action |
|----------|----------|--------|
| 🔴 **High** | Sai thông tin, broken diagrams, missing major sections | Must fix before submit |
| 🟡 **Medium** | Format issues, unclear explanations | Should fix |
| 🟢 **Low** | Typos, minor style issues | Nice to fix |
