---
description: Quy trình tổng hợp (synthesis) 1-3 bài viết đã crawl từ aha-mind:blog thành bài viết học thuật chất lượng cao, theo chuẩn create-tech-lecture.
---

# Workflow: Summarize Blog

Quy trình **synthesis** — không phải dịch, không phải tóm tắt — mà là **tái cấu trúc học thuật** từ 1-3 bài viết`.

> **Khác biệt cốt lõi so với `create-blog`:**
> - `create-blog`: AI tự generate nội dung từ topic → Rủi ro hallucination cao
> - `summarize-aha-blog`: Nguồn nội dung là bài thật đã crawl → AI chỉ làm nhiệm vụ synthesis + reframe học thuật

---

## Bước 0: Tiếp nhận yêu cầu

Xác định thông tin đầu vào:

```
Source Files: [Đường dẫn 1-3 file .mdx]
Topic Angle:  [Góc độ muốn tổng hợp - ví dụ: "So sánh kiến trúc Transformer"]
Target:       [Beginner/Intermediate/Expert]
Category:     [Category cho blog output - ví dụ: "AI/ML", "System Design"]
Tags:         [Danh sách tags]
```

**Quy tắc chọn source files:**
- **1 file**: Khi muốn deep-dive một chủ đề cụ thể từ một bài dài (> 20KB)
- **2-3 files**: Khi nhiều bài cùng chủ đề → synthesis để tạo góc nhìn đa chiều

---

## Bước 1: Đọc và phân tích Source Content

// turbo
1. Dùng `view_file` đọc toàn bộ nội dung các file source
2. Xác định:
   - **Core Concept**: Khái niệm trung tâm của bài/các bài
   - **Key Claims**: 3-5 luận điểm quan trọng nhất
   - **Unique Insights**: Điểm độc đáo, dữ liệu, số liệu đáng trích dẫn
   - **Images available**: Liệt kê URL ảnh Cloudinary trong bài (sẽ tái sử dụng)
   - **Overlap & Gaps**: Nếu nhiều bài — phần nào overlap, phần nào mỗi bài bổ sung thêm gì

3. **KHÔNG** tự thêm thông tin ngoài source. Nếu cần bổ sung, đánh dấu `[Research needed]`.

---

## Bước 2: Xác định cấu trúc bài học thuật

Dựa vào nội dung đã phân tích, chọn template phù hợp từ `create-tech-lecture` skill:

**Template A — Concept Deep Dive** (cho 1 bài, concept phức tạp):
```
Agenda → Glossary → WHY (Problem) → WHAT (Theory + Mermaid) → HOW (Practice) → Trade-offs → Discussion Questions → References
```

**Template B — Comparative Analysis** (cho 2-3 bài, so sánh nhiều công nghệ/approach):
```
Agenda → Glossary → Context → [Tech A Analysis] → [Tech B Analysis] → Decision Matrix → Trade-offs → Discussion Questions → References
```

**Template C — Architecture Breakdown** (cho bài có nhiều component/layer):
```
Agenda → Glossary → Problem Statement → Architecture Overview (Mermaid) → Component Deep Dive → Data Flow → Trade-offs → Discussion Questions → References
```

---

## Bước 3: Tạo nội dung học thuật (Create-Tech-Lecture Skill)

// turbo
1. Đọc SKILL.md: `.agent/skills/create-tech-lecture/SKILL.md`
2. Áp dụng **đầy đủ** các quy tắc sau (bắt buộc):

### 3.1. Agenda & Learning Outcomes
- Viết 4-5 learning outcomes dùng động từ Bloom's Taxonomy
- Ước tính reading time

### 3.2. Glossary & Vocabulary
- Bảng **Technical Terms**: lấy thuật ngữ từ bài gốc + giải thích học thuật
- Bảng **Vocabulary Support (B1+)**: từ vựng tiếng Anh khó trong bài gốc
- **Nguồn**: Ưu tiên dùng phần CEFR terms đã có trong file `.mdx` nguồn (các `<Term>` components)

### 3.3. WHY — Problem Statement
- **Không dùng câu hỏi tu từ** ("Bạn đã bao giờ...")
- Liệt kê pain points kỹ thuật cụ thể (dạng số thứ tự)
- Trích dẫn trực tiếp từ bài gốc nếu có số liệu/data points

### 3.4. WHAT — Core Theory
- **Định nghĩa kỹ thuật** chính xác
- **Mermaid diagram bắt buộc** — vẽ lại/tổng hợp kiến trúc từ bài gốc
  - Nếu bài gốc đã có Mermaid: cải thiện hoặc tổng hợp
  - Nếu chưa có: tự thiết kế dựa trên nội dung text
- **Definition Anatomy**: giải phẫu từng từ khóa trong định nghĩa

### 3.5. HOW — Practice
- Lấy code examples từ bài gốc (không tự generate)
- Thêm comment WHY (tại sao viết thế này)
- Nêu expected output

---

## Bước 4: Kiểm tra chất lượng (Review Checklist)

Chạy checklist trước khi tạo file:

**Content:**
- [ ] Không có thông tin nào KHÔNG có trong source files (no hallucination)
- [ ] Các claims quan trọng có trích dẫn nguồn gốc
- [ ] Trade-offs được trình bày (không chỉ ưu điểm)
- [ ] Discussion Questions đủ sâu để kích thích critical thinking

**Format (theo chuẩn `create-tech-lecture`):**
- [ ] KHÔNG có Emoji trong bài (kể cả headings)
- [ ] Headings được đánh số thứ tự (1., 1.1., 1.2., ...)
- [ ] Không có cụm từ AI sáo rỗng ("Trong bài viết này...", "Chúc bạn học tốt")
- [ ] Mermaid diagram hợp lệ (test bằng mermaid-expert skill nếu cần)
- [ ] Code blocks có syntax highlighting và comment WHY
- [ ] Glossary & Vocabulary có đủ 2 bảng

**MDX Syntax:**
- [ ] `{` và `}` ngoài code blocks đã được escape (`\{`, `\}`)
- [ ] `<Term>` components dùng đúng syntax
- [ ] Không có ký tự đặc biệt phá vỡ MDX parser

---

## Bước 5: Tạo MDX file output

1. **Xác định output location:**
   - Bài đơn lẻ: `blog/YYYY-MM-DD/[slug].mdx`
   - Bài synthesis nhiều nguồn: `blog/YYYY-MM-DD/[unified-topic-slug].mdx`
   - **KHÔNG** lưu vào `blog/aha-mind/` — đó là thư mục của bài raw-crawled gốc

2. **Frontmatter chuẩn:**

```yaml
---
slug: [slug-bài-viết]
title: "[Tiêu đề học thuật — khác với tiêu đề bài gốc]"
date: YYYY-MM-DD
authors: [anhhtus]
tags: [tag1, tag2, synthesized]
description: "[Mô tả ngắn gọn cho SEO, tối đa 160 ký tự]"
---
```

3. **Import chuẩn (nếu dùng Term component):**
```mdx
import Term from '@site/src/components/Term';
```

4. **Truncate marker** đặt sau đoạn mở đầu (~150-200 từ):
```mdx
<!-- truncate -->
```

5. **Footer bắt buộc:**
```mdx
---
*Made by Anh Tu - Share to be share*
```

---

## Bước 6: Build và kiểm tra local

// turbo
1. Chạy build:
```bash
cd /Users/anhtus/Documents/Development/Documentary/vuanhtu1993.github.io
npm run build
```

2. Nếu lỗi MDX syntax → sửa và build lại
3. Preview:
```bash
npm run serve 
```
4. Kiểm tra tại `http://localhost:3000/blog`

---