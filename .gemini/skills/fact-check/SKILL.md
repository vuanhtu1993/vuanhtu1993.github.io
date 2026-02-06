---
name: fact-check
description: "Skill xác minh tính chính xác của thông tin và đánh giá độ tin cậy nguồn tin. Sử dụng khi cần kiểm tra một claim/statement cụ thể, cross-check dữ liệu giữa nhiều nguồn, phát hiện thông tin sai lệch, hoặc đánh giá credibility của nguồn. Bao gồm Source Credibility Assessment và Claim Verification workflow."
---

# Fact-Check Skill

Skill hướng dẫn xác minh thông tin và đánh giá độ tin cậy nguồn.

## Quy trình Fact-Check

### Bước 1: Xác định loại kiểm tra

| Loại | Mục đích |
|------|----------|
| **Claim Verification** | Xác minh 1 statement/claim cụ thể |
| **Source Assessment** | Đánh giá độ tin cậy của 1 nguồn |
| **Cross-Reference** | So sánh thông tin giữa nhiều nguồn |

### Bước 2: Claim Verification Workflow

1. **Trích xuất claim:** Xác định rõ statement cần verify
2. **Tìm nguồn gốc:** Claim này đến từ đâu?
3. **Cross-check:** Tìm 2-3 nguồn độc lập để xác minh
4. **Đánh giá:** True / False / Partially True / Unverifiable

**Output format:**
```markdown
## Claim Verification Result

**Claim:** [Statement được kiểm tra]
**Source:** [Nguồn gốc của claim]
**Verdict:** ✅ True / ❌ False / ⚠️ Partially True / ❓ Unverifiable

**Evidence:**
- [Source 1]: [Findings]
- [Source 2]: [Findings]

**Conclusion:** [Giải thích ngắn gọn]
```

### Bước 3: Source Credibility Assessment

Sử dụng [references/source_credibility.md](references/source_credibility.md) để đánh giá nguồn.

**Credibility Tiers:**

| Tier | Loại nguồn | Trust Level |
|------|------------|-------------|
| **Tier 1** | Official Docs, Academic Papers, RFC | 🟢 Cao |
| **Tier 2** | Verified Tech Blogs, Known Experts | 🟡 Trung bình-Cao |
| **Tier 3** | Community forums, Medium, Stack Overflow | 🟠 Trung bình |
| **Red Flag** | Anonymous, No sources, Clickbait | 🔴 Thấp |

### Bước 4: Cross-Reference Checklist

Khi có nhiều nguồn nói về cùng 1 topic:

- [ ] Các nguồn có **độc lập** với nhau không? (không copy từ nhau)
- [ ] Các nguồn có **đồng thuận** không?
- [ ] Nếu có **mâu thuẫn**, nguồn nào có credibility cao hơn?
- [ ] Thông tin có **up-to-date** không?

## Red Flags - Dấu hiệu cảnh báo

Cảnh giác khi nguồn có các dấu hiệu:

- ❌ Không có author/tác giả rõ ràng
- ❌ Không có ngày xuất bản
- ❌ Không trích dẫn nguồn gốc
- ❌ Tiêu đề clickbait, sensational
- ❌ Quá nhiều quảng cáo
- ❌ Domain lạ, không uy tín
- ❌ Thông tin quá cũ (>3 năm cho tech topics)

## Output Format

```markdown
## Fact-Check Report

### Summary
- **Items checked:** [Số lượng]
- **Verified:** [Số] ✅
- **Issues found:** [Số] ⚠️

### Details

#### Item 1: [Claim/Source]
- **Type:** Claim Verification / Source Assessment
- **Result:** ✅/❌/⚠️/❓
- **Evidence:** [Mô tả ngắn]
- **Action:** [Nếu cần chỉnh sửa]

### Recommendations
[Đề xuất hành động]
```
