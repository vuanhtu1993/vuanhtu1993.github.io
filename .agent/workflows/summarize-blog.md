---
description: Quy trình tổng hợp (synthesis) 1-3 bài viết đã crawl từ aha-mind:blog thành bài viết học thuật chất lượng cao, theo chuẩn create-tech-lecture.
---

# Workflow: Summarize Blog

Quy trình **synthesis** — không phải dịch, không phải tóm tắt — mà là **tái cấu trúc học thuật** từ 1-3 bài viết.

> **Khác biệt cốt lõi so với `create-blog`:**
> - `create-blog`: AI tự generate nội dung từ topic → Rủi ro hallucination cao
> - `summarize-aha-blog`: Nguồn nội dung là bài thật đã crawl → AI chỉ làm nhiệm vụ synthesis + reframe học thuật

> **Nguyên tắc vàng (KHÔNG được vi phạm):**
> - **Giữ nguyên 100% hình ảnh** (Cloudinary URLs) theo đúng vị trí trong bài gốc
> - **Giữ nguyên 100% code blocks** từ bài gốc, chỉ thêm comment WHY nếu cần
> - **Giữ nguyên thứ tự nội dung** — synthesis là thêm lớp học thuật lên trên, KHÔNG phải tái cấu trúc lại hoàn toàn
> - **Giữ nguyên toàn bộ `<Term>` components** từ bài gốc

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
2. Xác định và **liệt kê đầy đủ vào checklist**:
   - **Core Concept**: Khái niệm trung tâm của bài/các bài
   - **Key Claims**: 3-5 luận điểm quan trọng nhất
   - **Unique Insights**: Điểm độc đáo, dữ liệu, số liệu đáng trích dẫn
   - **Images inventory** *(bắt buộc)*: Liệt kê TẤT CẢ URL ảnh Cloudinary theo thứ tự xuất hiện và vị trí ngữ cảnh của chúng — sẽ tái sử dụng **nguyên vẹn**
   - **Code blocks inventory** *(bắt buộc)*: Liệt kê tất cả code blocks và ngữ cảnh — giữ nguyên, chỉ thêm comment WHY
   - **Term components**: Copy toàn bộ `<Term definition="...">text</Term>` — giữ nguyên không chỉnh sửa
   - **Overlap & Gaps**: Nếu nhiều bài — phần nào overlap, phần nào mỗi bài bổ sung thêm gì

3. **KHÔNG** tự thêm thông tin ngoài source. Nếu cần bổ sung, đánh dấu `[Research needed]`.

---

## Bước 2: Xác định cấu trúc bài học thuật

Dựa vào nội dung đã phân tích, chọn template phù hợp từ `create-tech-lecture` skill:

**Template A — Concept Deep Dive** (cho 1 bài, concept phức tạp):
```
Agenda → Glossary → WHY (Problem) → WHAT (Theory + Mermaid) → HOW (Practice + images gốc) → Trade-offs → Discussion Questions → References
```

**Template B — Comparative Analysis** (cho 2-3 bài, so sánh nhiều công nghệ/approach):
```
Agenda → Glossary → Context → [Tech A Analysis] → [Tech B Analysis] → Decision Matrix → Trade-offs → Discussion Questions → References
```

**Template C — Architecture Breakdown** (cho bài có nhiều component/layer):
```
Agenda → Glossary → Problem Statement → Architecture Overview (Mermaid) → Component Deep Dive → Data Flow → Trade-offs → Discussion Questions → References
```

### Quy tắc khi áp dụng template lên nội dung gốc:

- **Thêm vào đầu bài**: Agenda + Glossary (mới hoàn toàn — không có trong bài gốc)
- **Giữ nguyên phần HOW/Tutorial**: Toàn bộ hình ảnh, code, các bước hướng dẫn → chỉ thêm heading số thứ tự và comment WHY vào code
- **Thêm vào cuối bài**: Trade-offs, Discussion Questions, References (mới hoàn toàn)
- **Thêm Mermaid diagram** ở phần WHAT nếu bài gốc chưa có

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

### 3.5. HOW — Practice *(Phần quan trọng nhất — KHÔNG được thay đổi)*
- **Giữ nguyên toàn bộ hình ảnh** theo đúng vị trí trong bài gốc
- **Giữ nguyên toàn bộ code blocks** từ bài gốc
- Có thể thêm comment WHY vào code — nhưng KHÔNG xóa code gốc
- Giữ nguyên thứ tự các bước, chỉ thêm đánh số heading
- Giữ nguyên toàn bộ `<Term>` components

---

## Bước 4: Kiểm tra chất lượng (Review Checklist)

Chạy checklist trước khi tạo file:

**Nội dung gốc được bảo toàn:**
- [ ] Tất cả Cloudinary image URLs có trong bài gốc đều xuất hiện trong bài output
- [ ] Tất cả code blocks từ bài gốc được giữ nguyên (chỉ thêm comment, không xóa)
- [ ] Thứ tự các bước tutorial giữ nguyên như bài gốc
- [ ] Toàn bộ `<Term>` components từ bài gốc được giữ nguyên

**Nội dung học thuật thêm vào:**
- [ ] Không có thông tin nào KHÔNG có trong source files (no hallucination)
- [ ] Trade-offs được trình bày (không chỉ ưu điểm)
- [ ] Discussion Questions đủ sâu để kích thích critical thinking
- [ ] Mermaid diagram mới thêm phản ánh đúng kiến trúc trong bài gốc

**Format (theo chuẩn `create-tech-lecture`):**
- [ ] KHÔNG có Emoji trong bài (kể cả trong headings) — ngoại lệ: giữ emoji nếu có trong **text gốc** của bài, chỉ bỏ khi bạn tự thêm mới
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