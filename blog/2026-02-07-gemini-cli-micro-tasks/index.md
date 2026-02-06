---
title: "Tối Ưu Hóa Workflow: Biến Gemini CLI Thành Trợ Lý 'Micro' Đắc Lực"
slug: gemini-cli-micro-tasks
authors: [anhhtus]
tags: [gemini-cli, productivity, terminal, git, refactoring, automation]
description: "Hướng dẫn chi tiết cách sử dụng Gemini CLI như một công cụ trong Unix pipe - tự động hóa commit message, giải thích lỗi, refactor code và tạo file cấu hình nhanh chóng."
---

# Tối Ưu Hóa Workflow: Biến Gemini CLI Thành Trợ Lý 'Micro' Đắc Lực

## 🎯 Mục Tiêu Bài Học

Sau khi đọc xong bài viết này, bạn sẽ:

1. Hiểu được khái niệm **"Gemini in the Pipe"** - tư duy sử dụng Gemini CLI như công cụ xử lý dữ liệu.
2. Biết cách áp dụng Gemini CLI cho **4 tác vụ micro** thường gặp hàng ngày.
3. Nắm được các **best practices** để tối ưu hiệu quả sử dụng.

:::info Yêu Cầu Trước Khi Bắt Đầu
- Đã cài đặt Gemini CLI ([Xem hướng dẫn cài đặt](/blog/gemini-cli-features-usage))
- Có kiến thức cơ bản về Terminal/Command Line
- Hiểu về Unix pipes (`|`) là một lợi thế
:::

<!--truncate-->

## 📚 Phần 1: Nền Tảng Lý Thuyết

### 1.1 Vấn Đề Thực Tế

Nhiều lập trình viên sử dụng AI Coding Assistant theo cách "hạng nặng":
- Mở trình duyệt → Vào chatbot → Copy code → Paste → Viết prompt → Đợi → Copy kết quả → Paste lại vào IDE

**Vấn đề:**
- Mất thời gian chuyển đổi ngữ cảnh (context switching)
- Làm gián đoạn flow làm việc
- Không hiệu quả cho các tác vụ nhỏ, lặp đi lặp lại

### 1.2 Giải Pháp: Tư Duy "Gemini in the Pipe"

Trong triết lý Unix, các lệnh được nối với nhau bằng ký tự `|` (pipe):

```
Output của lệnh A → Input của lệnh B → Output của lệnh B → ...
```

**Ví dụ Unix truyền thống:**

```bash
# Đếm số dòng có lỗi 404 trong file log
cat access.log | grep "404" | wc -l
```

**Áp dụng với Gemini:**

```bash
# Gemini nhận input từ pipe và xử lý
cat error.log | gemini "giải thích lỗi này"
```

:::tip Nguyên Tắc Vàng
Hãy nghĩ Gemini CLI như một **bộ lọc thông minh** trong chuỗi xử lý dữ liệu - nhận input, xử lý bằng AI, trả về output.
:::

## 🛠️ Phần 2: Thực Hành - 4 Use Cases Micro

### Use Case 1: Tự Động Viết Git Commit Message 📝

#### Bối Cảnh
Bạn vừa hoàn thành sửa code nhưng đang "bí" ý tưởng viết commit message chuẩn Conventional Commits.

#### Cách Thực Hiện

**Bước 1:** Stage các thay đổi
```bash
git add .
```

**Bước 2:** Sử dụng Gemini để generate commit message
```bash
git diff --staged | gemini "viết commit message chuẩn conventional commits"
```

**Ví dụ Output:**
```
feat(auth): add JWT token refresh mechanism

- Implement automatic token refresh before expiry
- Add refresh token storage in secure cookie
- Handle token refresh failure with logout redirect
```

#### Nâng Cao: Tạo Alias

Thêm vào file `~/.zshrc` hoặc `~/.bashrc`:

```bash
# Alias cho git commit với AI
alias gcommit='git diff --staged | gemini "viết git commit message chuẩn conventional commits, chỉ output message" | git commit -F -'
```

Sau đó reload shell:
```bash
source ~/.zshrc
```

**Sử dụng:**
```bash
git add .
gcommit  # Tự động commit với message do AI viết
```

:::warning Lưu Ý
Luôn review commit message trước khi push lên remote. AI có thể hiểu sai context của thay đổi.
:::

---

### Use Case 2: Giải Thích Lỗi Nhanh 🐛

#### Bối Cảnh
Bạn chạy test và nhận được stack trace dài dằng dặc màu đỏ. Thay vì đọc từng dòng, hãy để AI phân tích.

#### Cách Thực Hiện

**Cách 1:** Từ file log
```bash
cat error.log | gemini "giải thích lỗi này và đề xuất cách fix"
```

**Cách 2:** Trực tiếp từ output lệnh (bắt cả stdout và stderr)
```bash
npm test 2>&1 | gemini "tại sao test case này fail?"
```

**Cách 3:** Chỉ lấy phần lỗi cuối cùng
```bash
npm run build 2>&1 | tail -50 | gemini "explain this error"
```

#### Ví dụ Thực Tế

**Input:**
```bash
cat << 'EOF' | gemini "giải thích lỗi này"
TypeError: Cannot read properties of undefined (reading 'map')
    at UserList (/app/src/components/UserList.jsx:15:23)
    at renderWithHooks (/app/node_modules/react-dom/...)
EOF
```

**Output:**
```
Lỗi xảy ra vì biến mà bạn đang gọi .map() có giá trị undefined.

Nguyên nhân có thể:
1. Data chưa được fetch xong (async)
2. API trả về null/undefined thay vì array

Cách fix:
- Thêm optional chaining: data?.map(...)
- Hoặc default value: (data || []).map(...)
```

---

### Use Case 3: Refactor Code Tại Chỗ 🔄

#### Bối Cảnh
Bạn có file code legacy cần chuyển đổi style hoặc cập nhật syntax.

#### Cách Thực Hiện

**Chuyển CommonJS sang ES Modules:**
```bash
cat utils.js | gemini "chuyển đổi sang ES Modules syntax" > utils.mjs
```

**Refactor sang functional style:**
```bash
cat component.js | gemini "refactor sang functional component với hooks" > component.new.js
```

**Thêm TypeScript types:**
```bash
cat api.js | gemini "thêm TypeScript type annotations" > api.ts
```

#### So Sánh Thời Gian

| Phương pháp | Các bước | Thời gian ước tính |
|-------------|----------|-------------------|
| Web chatbot | 7 bước (mở browser, paste, copy...) | 2-3 phút |
| Gemini pipe | 1 lệnh | 10-15 giây |

---

### Use Case 4: Instant Scaffolding 🏗️

#### Bối Cảnh
Bạn cần tạo file cấu hình (Dockerfile, nginx.conf, GitHub Actions) nhưng không muốn search template.

#### Cách Thực Hiện

**Tạo Dockerfile:**
```bash
gemini "tạo Dockerfile cho Node.js app production với multi-stage build, alpine base" > Dockerfile
```

**Tạo docker-compose:**
```bash
gemini "tạo docker-compose.yml cho app Node.js + PostgreSQL + Redis" > docker-compose.yml
```

**Tạo GitHub Actions:**
```bash
gemini "tạo GitHub Actions workflow để chạy test và deploy lên AWS ECS khi push main" > .github/workflows/deploy.yml
```

**Tạo nginx config:**
```bash
gemini "tạo nginx.conf cho reverse proxy đến Node.js app port 3000 với SSL" > nginx.conf
```

:::note Gợi Ý
Prompt càng chi tiết, output càng chính xác. Hãy mô tả rõ tech stack, môi trường, và yêu cầu cụ thể.
:::

## ✅ Phần 3: Best Practices

### 3.1 Prompt Ngắn Gọn

Với context đã có từ pipe, bạn **không cần** giải thích dài dòng:

```bash
# ✅ Good - Ngắn gọn
cat error.log | gemini "explain"

# ❌ Bad - Dư thừa
cat error.log | gemini "Đây là file log lỗi của tôi, hãy đọc và giải thích cho tôi hiểu tại sao..."
```

### 3.2 Sử Dụng Context Bổ Sung

Khi pipe không đủ thông tin, đính kèm file liên quan:

```bash
cat error.log | gemini "fix lỗi này dựa trên @src/app.js"
```

### 3.3 Tiền Xử Lý Dữ Liệu

Lọc bớt dữ liệu rác trước khi gửi cho Gemini:

```bash
# Chỉ lấy 100 dòng cuối
tail -100 large.log | gemini "summarize errors"

# Lọc theo pattern
cat log.txt | grep -i "error" | gemini "categorize these errors"

# Với JSON, lọc fields cần thiết
cat data.json | jq '.users[] | {name, email}' | gemini "validate emails"
```

### 3.4 Luôn Review Output

Đặc biệt với các lệnh ghi file (`>`):

```bash
# ✅ Recommended: Xem trước
gemini "create Dockerfile..." | less

# Nếu OK, mới redirect
gemini "create Dockerfile..." > Dockerfile
```

## 📋 Tổng Kết

| Use Case | Lệnh Mẫu | Thời Gian Tiết Kiệm |
|----------|----------|---------------------|
| Git Commit | `git diff \| gemini "commit msg"` | ~2 phút |
| Debug Lỗi | `cat error.log \| gemini explain` | ~3 phút |
| Refactor | `cat file.js \| gemini "refactor"` | ~5 phút |
| Scaffolding | `gemini "create Dockerfile" > Dockerfile` | ~3 phút |

## 🔗 Bài Đọc Liên Quan

- [Gemini CLI: Hướng Dẫn Cơ Bản](/blog/gemini-cli-features-usage)
- [Sub-Agents: Xây Dựng Đội Ngũ AI Chuyên Gia](/blog/gemini-cli-sub-agents)

## 📚 Tham Khảo

- [Gemini CLI Documentation](https://geminicli.com/)
- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Unix Pipes - Wikipedia](https://en.wikipedia.org/wiki/Pipeline_(Unix))
