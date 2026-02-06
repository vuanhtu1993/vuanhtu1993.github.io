---
description: Quy trình tạo bài blog Docusaurus từ kiến thức đầu vào, sử dụng research, fact-check, create-tech-lecture, review-report skills
---

# Workflow: Create Blog for Docusaurus

Quy trình tạo bài blog chất lượng cao cho Docusaurus v3.x, kết hợp 4 skills nghiên cứu và tạo nội dung.

---

## Bước 0: Tiếp nhận yêu cầu

Xác định thông tin đầu vào:

```
Topic: [Chủ đề bài viết]
Target Audience: [Beginner/Intermediate/Expert]
Category: [Category cho blog]
Tags: [Danh sách tags]
```

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

## Bước 3: Tạo nội dung (Create-Tech-Lecture Skill)

// turbo
1. Sử dụng `create-tech-lecture` skill:
   - Đọc SKILL.md: `.agent/skills/create-tech-lecture/SKILL.md`
   - Chọn template theo mục tiêu:
     - **Concept**: Giải thích khái niệm → `templates/concept.md`
     - **Tutorial**: Hướng dẫn thực hành → `templates/tutorial.md`
     - **Architecture**: So sánh/Phân tích → `templates/architecture.md`
   - Áp dụng quy trình sư phạm: Hook → Analogy → Deep Dive → Visual → Practice → Pitfalls

2. Output: Bản nháp bài giảng với ẩn dụ, code mẫu, và common pitfalls

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

## Bước 5: Tạo MDX file cho Docusaurus

1. Tạo folder theo format: `blog/YYYY-MM-DD/`

2. Tạo file `.md` hoặc `.mdx` với frontmatter:

```yaml
---
title: "[Tiêu đề bài viết]"
date: "YYYY-MM-DD"
category: "[Category]"
authors: [anhhtus]
tags: [tag1, tag2]
description: "[Mô tả ngắn gọn cho SEO]"
---
```

3. Copy nội dung từ bản báo cáo đã review vào file

4. Đảm bảo:
   - Heading hierarchy đúng (bắt đầu từ H1 hoặc H2)
   - Code blocks có syntax highlighting
   - Mermaid diagrams có cú pháp đúng
   - Images được đặt trong cùng folder

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

4. Kiểm tra bài blog trong browser tại `http://localhost:3000/blog`

---

## Bước 7: Xác nhận và Push to Main (Sử dụng GitHub MCP)

1. **QUAN TRỌNG: Hỏi người dùng xác nhận**:
   - "Bạn đã kiểm tra preview chưa? Nội dung ok chưa?"
   - "Xác nhận để tôi commit và push lên branch `main`."

2. Nếu người dùng **CONFIRM**:

   // turbo
   a. Sử dụng **GitHub MCP** để push code:
   - Sử dụng tool `github_push` (hoặc tương đương trong MCP).
   - Message: "blog: [Tiêu đề bài viết]"
   - Branch: `main`
   - Files: `blog/`

   *Lưu ý: Không dùng lệnh git shell command trực tiếp nếu có thể dùng MCP.*

3. Nếu người dùng **TỪ CHỐI** hoặc cần sửa:
   - Thực hiện sửa đổi
   - Quay lại bước Build/Check

---

## Bước 8: Verify trên Production

1. Chờ deploy hoàn tất (GitHub Actions)

2. Kiểm tra bài blog trên production:
   - URL: `https://vuanhtu1993.github.io/blog/[slug]`

3. Verify:
   - [ ] Bài blog hiển thị đúng
   - [ ] Mermaid diagrams render OK
   - [ ] Code blocks có syntax highlighting
   - [ ] SEO metadata đúng

---

## Quick Reference

| Bước | Skill/Action | Output |
|------|--------------|--------|
| 1 | research | Research notes |
| 2 | fact-check | Verified claims |
| 3 | create-tech-lecture | Draft content (Concept/Tutorial/Architecture) |
| 4 | review-report | QA report |
| 5 | Manual | MDX file |
| 6 | npm run build | Build check |
| 7 | Confirm & Push | Code on Main (via MCP) |
| 8 | Browser check | Live blog |
