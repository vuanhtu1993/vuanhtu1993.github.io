---
description: Quy trình tạo documentation cho Docusaurus từ kiến thức đầu vào, sử dụng research, fact-check, create-finance-lecture, review-report skills
---

# Workflow: Create Docs for Docusaurus

Quy trình tạo documentation chất lượng cao cho Docusaurus v3.x, kết hợp 4 skills nghiên cứu và tạo nội dung.

---

## Bước 0: Tiếp nhận yêu cầu

Xác định thông tin đầu vào:

```
Topic: [Chủ đề bài viết]
Target Audience: [Beginner/Intermediate/Expert]
Category: [Thư mục trong docs - mới hoặc có sẵn]
Sidebar Position: [Vị trí trong sidebar, số nguyên]
```

**Lưu ý về Category:**
- Nếu category đã tồn tại: đặt file trong thư mục đó
- Nếu category mới: tạo thư mục và file `_category_.json`

---

## Bước 1: Nghiên cứu (Research Skill)

// turbo
1. Sử dụng `research` skill để thu thập thông tin:
   - Đọc SKILL.md: `.agent/skills/research/SKILL.md`
   - Xác định loại nghiên cứu: Quick/Standard/Deep Dive
   - Thu thập từ 5-7 nguồn (Standard)

2. Output: Research notes theo template

---

## Bước 2: Kiểm tra thông tin (Fact-Check Skill)

// turbo
1. Sử dụng `fact-check` skill để verify:
   - Đọc SKILL.md: `.agent/skills/fact-check/SKILL.md`
   - Kiểm tra các claims quan trọng
   - Đánh giá credibility các nguồn (Tier 1/2/3)

2. Output: Fact-check report với verified claims

---

## Bước 3: Tạo nội dung (Create-Finance-Lecture Skill)

// turbo
1. Sử dụng `create-finance-lecture` skill:
   - Đọc SKILL.md: `.agent/skills/create-finance-lecture/SKILL.md`
   - Chọn template theo mục tiêu:
     - **Concept 101**: Giải mã khái niệm → `templates/concept.md`
     - **Strategy/How-to**: Hướng dẫn chiến lược → `templates/strategy.md`
     - **Comparative**: So sánh & Lựa chọn → `templates/comparative.md`
     - **Market Analysis**: Đọc vị thị trường → `templates/market-analysis.md`
   - Áp dụng quy trình sư phạm: Hook → Analogy → Deep Dive → Practice → Risk & Pitfalls → MECE Mindmap

2. Output: Bản nháp bài giảng với ẩn dụ đời sống, cảnh báo rủi ro, và MECE Mindmap

---

## Bước 4: Review nội dung (Review-Report Skill)

// turbo
1. Sử dụng `review-report` skill:
   - Đọc SKILL.md: `.agent/skills/review-report/SKILL.md`
   - Chạy Content Checklist
   - Chạy Format Checklist
   - Đánh giá Readability

2. Output: Báo cáo QA với các điểm cần sửa

---

## Bước 5: Tạo file Markdown cho Docusaurus Docs

1. **Xác định category (folder) đích:**
   - Kiểm tra `docs/` để xem category đã tồn tại chưa
   - Nếu chưa, tạo folder mới

2. **Tạo `_category_.json` (nếu category mới):**

```json
{
  "label": "[Tên Category hiển thị]",
  "position": [số thứ tự trong sidebar],
  "link": {
    "type": "generated-index",
    "description": "[Mô tả ngắn về category]"
  }
}
```

3. **Tạo file `.md` với frontmatter:**

```yaml
---
sidebar_position: [số thứ tự trong category]
description: "[Mô tả ngắn gọn cho SEO]"
---

# [Tiêu đề bài viết]
```

4. **Copy nội dung từ bản báo cáo đã review vào file**

5. **Đảm bảo:**
   - Heading hierarchy đúng (bắt đầu từ H1)
   - Code blocks có syntax highlighting
   - Mermaid diagrams có cú pháp đúng
   - Links internal/external hợp lệ
   - Images được đặt trong cùng folder hoặc `/static/img/`

---

## Bước 6: Build và kiểm tra local

// turbo
1. Chạy build để kiểm tra:
```bash
cd /Users/anhtus/Documents/Development/Documentary/vuanhtu1993.github.io
npm run build
```

2. Nếu có lỗi, sửa và build lại

// turbo
3. Chạy local để preview:
```bash
npm run serve
```

4. Kiểm tra trong browser:
   - URL: `http://localhost:3000/docs/[category]/[slug]`
   - Verify sidebar hiển thị đúng vị trí
   - Verify navigation links hoạt động

---

## Bước 7: Push code lên GitHub

// turbo
1. Tạo branch mới (nếu cần):
```bash
git checkout -b docs/[tên-bài-viết]
```

// turbo
2. Add và commit:
```bash
git add docs/
git commit -m "docs: [Tiêu đề bài viết]"
```

// turbo
3. Push lên remote:
```bash
git push origin [branch-name]
```

4. Tạo PR hoặc merge vào main (tùy workflow)

---

## Bước 8: Verify trên Production

1. Chờ deploy hoàn tất (GitHub Actions)

2. Kiểm tra doc trên production:
   - URL: `https://vuanhtu1993.github.io/docs/[category]/[slug]`

3. Verify:
   - [ ] Doc hiển thị đúng trong sidebar
   - [ ] Sidebar position đúng thứ tự
   - [ ] Mermaid diagrams render OK
   - [ ] Code blocks có syntax highlighting
   - [ ] SEO metadata đúng (title, description)
   - [ ] Links hoạt động bình thường

---

## Quick Reference

| Bước | Skill/Action | Output |
|------|--------------|--------|
| 0 | Input | Topic, Category, Position |
| 1 | research | Research notes |
| 2 | fact-check | Verified claims |
| 3 | create-finance-lecture | Draft content (Concept/Strategy/Comparative/Market) |
| 4 | review-report | QA report |
| 5 | Manual | MD file + _category_.json |
| 6 | npm run build | Build check |
| 7 | git push | Code on GitHub |
| 8 | Browser check | Live docs |

---

## So sánh với Create-Blog

| Thuộc tính | create-blog | create-docs |
|------------|-------------|-------------|
| Folder | `blog/YYYY-MM-DD/` | `docs/[category]/` |
| Frontmatter | `title`, `date`, `authors`, `tags` | `sidebar_position`, `description` |
| Navigation | Timeline | Sidebar hierarchy |
| URL | `/blog/YYYY/MM/DD/slug` | `/docs/category/slug` |
| Category file | Không cần | `_category_.json` |
