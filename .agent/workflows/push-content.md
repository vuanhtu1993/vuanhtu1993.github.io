---
description: Push bài viết docs/blog lên main sau khi kiểm tra và fix syntax MDX
---

# Push Content Workflow

Workflow này dùng để push các bài viết docs hoặc blog lên nhánh main, đảm bảo syntax MDX hợp lệ.

## Các bước thực hiện

### 1. Kiểm tra các file đã thay đổi

```bash
git status --short
```

Xác định các file `.md` cần kiểm tra trong thư mục `docs/` và `blog/`.

### 2. Kiểm tra syntax MDX cho từng file

Với mỗi file markdown đã thay đổi, kiểm tra và fix các vấn đề sau:

#### 2.1 Curly braces `{}`
- **Vấn đề**: MDX hiểu `{}` là JSX expression
- **Fix**: Wrap trong backticks `` `{ ... }` `` hoặc escape `\{ ... \}`

#### 2.2 Angle brackets `<>`
- **Vấn đề**: MDX hiểu `<>` là JSX tags
- **Fix**: Wrap trong backticks hoặc dùng `&lt;` `&gt;`

#### 2.3 Ký tự `|` trong table
- **Vấn đề**: Nếu dùng trong code bên trong table sẽ bị lỗi
- **Fix**: Wrap nội dung trong backticks

#### 2.4 Links và images
- Đảm bảo paths đúng format
- Images phải có alt text

#### 2.5 Frontmatter description (bắt buộc)
- **Kiểm tra**: File phải có `description` trong frontmatter
- **Format**:
  ```yaml
  ---
  title: "Tiêu đề bài viết"
  description: "Mô tả ngắn gọn về nội dung bài viết (1-2 câu, tối đa 160 ký tự)"
  ---
  ```
- Nếu thiếu `description`, thêm dựa trên nội dung chính của bài viết

#### 2.6 Truncate marker cho Blog (bắt buộc với blog posts)
- **Mục đích**: Xác định phần hiển thị trong danh sách blog (summary)
- **Format**: Thêm `<!--truncate-->` sau phần giới thiệu đầu bài
- **Ví dụ**:
  ```markdown
  ---
  title: "Tiêu đề"
  description: "Mô tả ngắn"
  ---

  # Tiêu đề bài viết

  Đây là phần giới thiệu ngắn sẽ hiển thị trong blog list.

  <!--truncate-->

  ## Nội dung chi tiết
  Phần này chỉ hiển thị khi click vào bài viết.
  ```
- **Vị trí đặt**: Sau 2-3 đoạn đầu tiên hoặc sau phần mục tiêu/overview

> **Lưu ý**: Chỉ sửa syntax và metadata, KHÔNG thay đổi nội dung chính của bài viết.

### 3. Build test local

// turbo
```bash
npm run build
```

Nếu build thất bại, quay lại bước 2 để fix lỗi.

### 4. Commit changes

```bash
git add docs/ blog/
git commit -m "content: update docs/blog with MDX syntax fixes"
```

### 5. Push lên main via github MCP

```bash
git push origin main
```

### 6. Verify deployment

Kiểm tra GitHub Actions đã chạy thành công:
- Truy cập: https://github.com/vuanhtu1993/vuanhtu1993.github.io/actions
- Đợi workflow "Deploy to GitHub Pages" hoàn thành
- Kiểm tra website: https://vuanhtu1993.github.io

---

## Common MDX Errors & Fixes

| Error | Nguyên nhân | Fix |
|-------|-------------|-----|
| `Could not parse expression with acorn` | Curly braces `{}` không escape | Wrap trong backticks |
| `Expected closing tag` | Angle brackets `<>` không escape | Dùng `&lt;` `&gt;` hoặc backticks |
| `Unexpected token` | Ký tự đặc biệt trong JSX context | Escape hoặc wrap trong code block |