---
title: "Gemini CLI: Trợ lý AI Mạnh Mẽ Ngay Trên Terminal Của Bạn"
slug: gemini-cli-features-usage
authors: [anhhtus]
tags: [gemini-cli, ai-assistant, terminal, productivity, developer-tools]
description: "Khám phá Gemini CLI - công cụ AI mạnh mẽ giúp tăng tốc quy trình làm việc của lập trình viên ngay trên terminal. Tìm hiểu về tính năng, cách cài đặt và cấu hình chi tiết."
---

# Gemini CLI: Trợ lý AI Mạnh Mẽ Ngay Trên Terminal Của Bạn

Trong kỷ nguyên AI bùng nổ, việc tích hợp trí tuệ nhân tạo vào quy trình làm việc hàng ngày đã trở thành xu hướng tất yếu. Với các lập trình viên, terminal là "ngôi nhà thứ hai", và **Gemini CLI** chính là người quản gia đắc lực, mang sức mạnh của các mô hình ngôn ngữ lớn (LLM) trực tiếp vào dòng lệnh.

Bài viết này sẽ cung cấp cái nhìn tổng quan về Gemini CLI, các tính năng nổi bật, cách cài đặt và hướng dẫn sử dụng để bạn có thể tận dụng tối đa công cụ này.

<!--truncate-->

## 🚀 Gemini CLI Là Gì?

Gemini CLI (Command Line Interface) là một công cụ dòng lệnh cho phép bạn tương tác với các mô hình AI của Google (như Gemini Pro, Gemini Flash) ngay trên terminal. Nó không chỉ là một chatbot đơn thuần mà là một trợ lý ảo có khả năng:

- Hiểu và thao tác với file/thư mục trong dự án.
- Thực thi các lệnh shell.
- Quản lý session làm việc.
- Tự động hóa các tác vụ phức tạp thông qua Agent Skills.

## ✨ Tính Năng Nổi Bật

Gemini CLI sở hữu bộ tính năng phong phú, từ cơ bản đến nâng cao:

### Tính Năng Cơ Bản

- **Tương tác trực quan:** Chat trực tiếp, hỗ trợ các lệnh slash (`/`) để điều khiển và lệnh at (`@`) để tham chiếu file.
- **Quản lý Model:** Dễ dàng chuyển đổi giữa các phiên bản model như "Auto", "Pro" (cho tác vụ phức tạp) và "Flash" (cho tốc độ).
- **Custom Commands:** Tạo các phím tắt cho những prompt thường dùng.
- **Themes & Settings:** Tùy biến giao diện và hành vi của CLI qua file cấu hình JSON.

### Tính Năng Nâng Cao

#### Agent Skills (Experimental)

Agent Skills là tính năng mạnh mẽ cho phép bạn mở rộng khả năng của Gemini CLI với các kỹ năng chuyên biệt. Bạn có thể tạo skill bằng cách định nghĩa file `SKILL.md` trong thư mục `.gemini/skills/`:

```markdown
---
name: code-review
description: Review code và đưa ra suggestions
---

# Code Review Skill

Khi user yêu cầu review code, hãy:
1. Kiểm tra coding conventions
2. Tìm potential bugs và security issues
3. Đề xuất cải thiện performance
4. Đánh giá test coverage
```

**Ví dụ sử dụng thực tế:**

```bash
# Debug một bug phức tạp
@src/api/users.ts Tại sao API này return 500 khi gọi với id không tồn tại?

# Refactor code với context
@src/utils/ Refactor các utility functions để sử dụng TypeScript generics
```

#### Checkpointing

Gemini CLI tự động lưu checkpoint cho mỗi thay đổi file. Nếu AI thực hiện thay đổi không mong muốn:

```bash
# Xem danh sách checkpoints
/checkpoint list

# Restore về checkpoint cụ thể
/checkpoint restore <checkpoint-id>
```

#### Sandboxing

Các lệnh shell có thể được chạy trong môi trường sandbox cô lập, đảm bảo an toàn cho hệ thống. Gemini sẽ hỏi xác nhận trước khi thực thi các lệnh có thể ảnh hưởng đến hệ thống.

## 🔄 So Sánh Với Các Công Cụ Tương Tự

| Tính năng | Gemini CLI | GitHub Copilot CLI | Cursor |
|-----------|------------|-------------------|--------|
| **Miễn phí** | ✅ (với quota) | ❌ (cần subscription) | ❌ (freemium) |
| **Context awareness** | ✅ `@` syntax | ✅ | ✅ |
| **Terminal integration** | ✅ Native | ✅ Native | ❌ IDE only |
| **Agent Skills** | ✅ | ❌ | ✅ |
| **Session management** | ✅ | ❌ | ✅ |
| **Multi-model support** | ✅ Pro/Flash | ❌ GPT-4 only | ✅ |

**Ưu điểm nổi bật của Gemini CLI:**
- Miễn phí với quota cá nhân hào phóng
- Tích hợp sâu với Google ecosystem
- Context window lớn (lên đến 1M tokens với Gemini Pro)

## 🛠 Cài Đặt và Xác Thực

### Cài Đặt

Cách đơn giản nhất để cài đặt Gemini CLI là thông qua npm:

```bash
npm install -g @google/gemini-cli
```

Sau khi cài đặt xong, bạn có thể khởi động CLI bằng lệnh:

```bash
gemini
```

### Xác Thực

Trong lần chạy đầu tiên, Gemini CLI sẽ yêu cầu bạn đăng nhập. Bạn có thể chọn "Login with Google" để xác thực qua trình duyệt. Sau khi hoàn tất, CLI đã sẵn sàng để phục vụ bạn.

## 📖 Hướng Dẫn Sử Dụng

### Các Lệnh Cơ Bản

- **Chat:** Nhập câu hỏi hoặc yêu cầu và nhấn Enter.
- **Slash Commands (`/`):**
    - `/model`: Chọn model AI.
    - `/clear`: Xóa màn hình.
    - `/settings`: Mở giao diện cài đặt.
    - `/chat save <tag>`: Lưu session hiện tại với tag.
    - `/quit` hoặc `/exit`: Thoát chương trình.

### Làm Việc Với Context (`@`)

Để AI hiểu về code của bạn, hãy sử dụng ký tự `@` để đưa nội dung file hoặc thư mục vào prompt:

```bash
@src/index.js Giải thích đoạn code này giúp tôi.
@docs/ Tóm tắt các thay đổi trong tài liệu.
```

### Thực Thi Lệnh Shell (`!`)

Bạn có thể chạy lệnh shell trực tiếp từ Gemini CLI bằng cách thêm `!` ở đầu:

```bash
!ls -la
!npm test
```

### Quản Lý Session

Gemini CLI tự động lưu các session theo dự án. Bạn có thể resume session cũ bằng lệnh:

```bash
gemini --resume
```
Hoặc dùng lệnh `/resume` trong giao diện interactive để duyệt và chọn session.

## ⚙️ Cấu Hình Nâng Cao

### Settings File

Mọi cấu hình được lưu trong `settings.json`. Bạn có thể có cấu hình global (`~/.gemini/settings.json`) và cấu hình riêng cho từng dự án (`.gemini/settings.json` trong thư mục dự án).

Sử dụng lệnh `/settings` để mở trình editor cấu hình trực quan.

### GEMINI.md - Bộ Não Của Dự Án

Tạo một file `GEMINI.md` trong thư mục gốc của dự án để định nghĩa "persona" cho AI và cung cấp các quy tắc chung. Ví dụ:

```markdown
# Project Context
Dự án này là một web app sử dụng Next.js và Tailwind CSS.

# Coding Guidelines
- Sử dụng TypeScript cho toàn bộ code mới.
- Ưu tiên functional components.
- Luôn viết unit test cho các utility functions.
```

Khi có file này, Gemini sẽ luôn tuân thủ các quy tắc bạn đã đề ra trong mọi cuộc hội thoại.

## 🔧 Xử Lý Lỗi Thường Gặp

### Lỗi xác thực

```bash
# Lỗi: "Authentication failed"
# Fix: Đăng nhập lại
gemini --login

# Lỗi: "Token expired"
# Fix: Xóa cache và đăng nhập lại
rm -rf ~/.gemini/auth
gemini
```

### Lỗi rate limit

```bash
# Lỗi: "Rate limit exceeded"
# Nguyên nhân: Vượt quá quota miễn phí
# Fix:
# 1. Đợi reset quota (thường 1 phút)
# 2. Chuyển sang model Flash để giảm token usage
/model flash
```

### Lỗi context quá lớn

```bash
# Lỗi: "Context too large"
# Fix: Sử dụng .geminiignore để loại trừ file không cần thiết
echo "node_modules/\ndist/\n*.log" > .geminiignore
```

## 🎯 Kết Luận

Gemini CLI không chỉ giúp bạn tiết kiệm thời gian chuyển đổi giữa các cửa sổ mà còn mang lại sức mạnh của AI vào từng dòng code. Với khả năng tùy biến cao và tích hợp sâu vào quy trình phát triển, đây là công cụ không thể thiếu cho lập trình viên hiện đại.

Hãy cài đặt và trải nghiệm ngay hôm nay để cảm nhận sự khác biệt!

## 📚 Tham Khảo

- [Gemini CLI GitHub Repository](https://github.com/google-gemini/gemini-cli)
- [Gemini CLI Documentation](https://googlegemini.github.io/gemini-cli/)
- [Google AI Studio](https://aistudio.google.com/) - Để lấy API key và quản lý quota
- [Gemini API Documentation](https://ai.google.dev/docs)
