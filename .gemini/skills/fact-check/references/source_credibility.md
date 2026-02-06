# Source Credibility Assessment Guide

## Credibility Tier System

### Tier 1: Highly Trusted (🟢)

**Loại nguồn:**
- Official Documentation (docs.*, developer.*)
- Academic Papers (peer-reviewed)
- RFC Documents
- Official specs (W3C, IETF, etc.)
- Government/Institutional sources

**Đặc điểm:**
- Có quy trình review nghiêm ngặt
- Author có credentials rõ ràng
- Cập nhật thường xuyên
- Có version control

**Ví dụ:**
- docs.python.org
- developer.mozilla.org
- arxiv.org (preprints - cần thận trọng hơn)
- ietf.org

---

### Tier 2: Generally Trusted (🟡)

**Loại nguồn:**
- Verified Tech Blogs (engineering blogs của công ty lớn)
- Known Experts (có track record)
- Major Tech Publications
- Well-maintained Open Source docs

**Đặc điểm:**
- Author có danh tiếng trong ngành
- Có community review/feedback
- Thường xuyên được cập nhật
- Có trích dẫn nguồn

**Ví dụ:**
- Engineering blogs: Netflix, Uber, Airbnb, Stripe
- martinfowler.com
- kentcdodds.com
- css-tricks.com
- smashingmagazine.com

---

### Tier 3: Verify Before Use (🟠)

**Loại nguồn:**
- Medium articles
- Dev.to posts
- Stack Overflow answers
- Reddit discussions
- Personal blogs (unknown authors)
- Tutorial sites

**Đặc điểm:**
- Không có peer review
- Chất lượng không đồng đều
- Có thể outdated
- Cần cross-check

**Cách sử dụng:**
- Cross-reference với Tier 1/2 sources
- Check date - có còn relevant không?
- Check upvotes/comments - community đánh giá thế nào?
- Verify code snippets trước khi dùng

---

### Red Flag Sources (🔴)

**Dấu hiệu cảnh báo:**

| Red Flag | Mô tả |
|----------|-------|
| No author | Không ghi tên tác giả |
| No date | Không có ngày xuất bản |
| No sources | Không trích dẫn nguồn gốc |
| Clickbait title | "You won't believe..." |
| Excessive ads | Quá nhiều quảng cáo |
| Unknown domain | Domain lạ, không uy tín |
| Too old | >3 năm cho tech topics |
| Copied content | Sao chép từ nguồn khác |
| AI-generated | Nội dung rõ ràng do AI tạo |

---

## Quick Assessment Checklist

Đánh giá nhanh nguồn tin:

```markdown
## Source: [URL]

### Basic Info
- [ ] Author identified: [Tên]
- [ ] Date published: [Ngày]
- [ ] Last updated: [Ngày]

### Credibility Indicators
- [ ] Author credentials verified
- [ ] Sources/references cited
- [ ] No clickbait elements
- [ ] Professional presentation
- [ ] Active community feedback

### Red Flags Check
- [ ] No anonymous author
- [ ] No missing dates
- [ ] No excessive ads
- [ ] No copied content

### Tier Assessment
**Tier:** [1/2/3/Red Flag]
**Confidence:** [High/Medium/Low]
**Notes:** [Ghi chú]
```

---

## Cross-Reference Guidelines

Khi cross-check thông tin:

1. **Minimum 2 nguồn độc lập** - không copy từ nhau
2. **Ưu tiên Tier 1 > Tier 2 > Tier 3**
3. **Check consensus** - đa số nói gì?
4. **Note disagreements** - ghi lại mâu thuẫn

**Template:**
```markdown
## Cross-Reference: [Topic]

| Source | Tier | Says | Date |
|--------|------|------|------|
| [URL 1] | 1 | [Claim] | [Date] |
| [URL 2] | 2 | [Claim] | [Date] |

**Consensus:** [Yes/No/Partial]
**Conflicts:** [Mô tả nếu có]
**Conclusion:** [Kết luận]
```
