Để xây dựng một bộ tài liệu **"Prisma ORM Mega-Guide"** chuẩn mực, chi tiết và có thể dùng làm Reference/Cheat-sheet cho Developer, chúng ta sẽ tiếp tục áp dụng chiến lược **Chain-Prompting (Chuỗi Prompt)**. 

Prisma có kiến trúc rất khác biệt so với TypeORM (sử dụng `.prisma` schema file và auto-generated Client), do đó các prompt cần nhấn mạnh vào code mẫu và quy trình làm việc (workflow).
---

### ⚙️ Prompt 0: Cài đặt bối cảnh (Gửi đầu tiên)

> **Prompt:**
> Đóng vai là một Senior Backend Developer và Technical Writer chuyên nghiệp. Nhiệm vụ của bạn là giúp tôi viết một cẩm nang toàn tập (Mega-Guide) và Kế hoạch học tập về Prisma ORM dành cho Developer.
> Yêu cầu chung:
> - Sử dụng ngôn ngữ tiếng Việt tự nhiên, giữ nguyên các thuật ngữ chuyên ngành (Introspection, Schema, Prisma Client, Migrate, Shadow Database...).
> - Viết dưới dạng tài liệu tra cứu (Reference/Cheat-sheet), trình bày bằng Markdown gọn gàng.
> - **Bắt buộc** phải có code snippets (TypeScript, `.prisma` file) minh họa rõ ràng cho mọi tính năng.
> - Bổ sung các "Pro-tips" hoặc "Lưu ý thực tế" ở mỗi phần.
> Nếu bạn đã hiểu, hãy trả lời: "Tôi đã sẵn sàng nhận Prompt 1".

---

### 📝 Prompt 1: Tổng quan & Prisma Schema (Khởi tạo)
*Sau khi AI sẵn sàng, gửi prompt này.*

> **Prompt:**
> Hãy viết Phần 1: Giới thiệu & Prisma Schema.
> 
> **1. Introduction (Tổng quan về Prisma ORM)**
> - Core Concepts: Prisma là gì? Kiến trúc 3 phần của Prisma (Prisma Client, Prisma Migrate, Prisma Studio) khác biệt thế nào so với ORM truyền thống?
> - Data modeling & Supported databases: Các database được hỗ trợ.
> - API patterns: Cách Prisma tiếp cận việc query dữ liệu (Type-safe).
> 
> **2. Prisma Schema**
> - Overview & Data Model: Giải thích file `schema.prisma`. Cách định nghĩa `datasource`, `generator` và các `model` (kèm code mẫu file .prisma gồm các bảng User, Post có quan hệ 1-N).
> - What is introspection?: Khái niệm `prisma db pull`. Lợi ích của nó khi làm việc với database có sẵn (Brownfield project).
> - PostgreSQL extensions: Cách khai báo và sử dụng các extension của Postgres trong Prisma schema (vd: pgcrypto, uuid-ossp).

---

### 📝 Prompt 2: Prisma Client - Truy vấn & Type Safety (Phần cốt lõi)
*Chờ AI viết xong phần 1, gửi tiếp prompt này.*

> **Prompt:**
> Tuyệt vời. Hãy viết tiếp Phần 2: Prisma Client (Phần quan trọng nhất để tra cứu).
> 
> **1. Setup and Configuration**
> - Cách `prisma generate` tạo ra thư viện type-safe trong `node_modules`. Khởi tạo PrismaClient instance.
> 
> **2. Queries (Thao tác dữ liệu cơ bản & nâng cao)**
> Cung cấp API Reference và code TypeScript mẫu cho:
> - CRUD cơ bản: `findUnique`, `findFirst`, `findMany`, `create`, `update`, `delete`.
> - Quan hệ (Relations): Cách dùng `include` để lấy dữ liệu bảng liên quan, và thao tác Nested Writes (tạo User và tạo luôn Post của User đó).
> - Filtering & Sorting: Cách dùng `where`, `orderBy`, pagination (`skip`, `take`, `cursor`).
> 
> **3. Type Safety & Special Fields**
> - Khẳng định sức mạnh Type Safety của Prisma so với ORM khác (Gợi ý code 100%).
> - Special Fields and Types: Xử lý kiểu `JSON`, `Enums`, và `DateTime`.
> 
> **4. Using Raw SQL**
> - Cách dùng `$queryRaw` và `$executeRaw` khi cần viết SQL thuần. Hỗ trợ chống SQL Injection ra sao?

---

### 📝 Prompt 3: Nâng cao & Vận hành (Advanced Prisma Client)
*Chờ AI viết xong phần 2, gửi tiếp prompt này.*

> **Prompt:**
> Viết tiếp Phần 3: Các tính năng nâng cao và Vận hành thực tế với Prisma Client.
> 
> **1. Client Extensions**
> - Giới thiệu Prisma Client Extensions. Cách mở rộng query, thêm computed fields (vd: tự động tính `fullName` từ `firstName` và `lastName`).
> 
> **2. Observability, Logging & Debugging**
> - Cách cấu hình Logging (query, info, warn, error).
> - Bắt lỗi và Debugging cơ bản.
> 
> **3. Testing & Deployment**
> - Testing: Đề xuất cách mock Prisma Client trong Unit Test (nhắc đến `prisma-mock` hoặc `vitest/jest mock`).
> - Deployment: Lưu ý cực kỳ quan trọng về **Connection Pooling** trong môi trường Serverless (Cách dùng Prisma Accelerate hoặc PgBouncer).

---

### 📝 Prompt 4: Quản lý Schema (Prisma Migrate)
*Chờ AI viết xong phần 3, gửi tiếp prompt này.*

> **Prompt:**
> Hãy viết Phần 4: Prisma Migrate - Quản lý sự thay đổi của Database.
> 
> **Prisma Migrate**
> - Overview: Prisma Migrate hoạt động như thế nào? (So sánh file SQL sinh ra tự động).
> - Getting started & Workflows: Sự khác biệt cốt lõi giữa `prisma migrate dev` (môi trường dev) và `prisma migrate deploy` (môi trường production/CI).
> - About the shadow database: "Shadow database" là gì? Tại sao Prisma lại cần nó và nó chạy ngầm như thế nào khi migrate dev?
> - Migration histories: Bảng `_prisma_migrations` hoạt động ra sao.
> - Limitations and known issues: Một vài hạn chế của Prisma Migrate khi làm việc với các hệ thống quá phức tạp.

---

### 📝 Prompt 5: Từ điển tra cứu & Xử lý lỗi (Reference & Error)
*Chờ AI viết xong phần 4, gửi tiếp prompt này.*

> **Prompt:**
> Viết Phần 5: Reference & Error Handling (Tài liệu tra cứu nhanh). Trình bày ngắn gọn, dễ nhìn.
> 
> **1. Reference (Cheat Sheet)**
> - Prisma CLI reference: Liệt kê các lệnh CLI hay dùng nhất (`generate`, `db push`, `migrate dev`, `studio`, `format`).
> - Prisma Client API / Schema API / Config API: Tóm tắt cú pháp.
> - Connection URLs & Environment Variables: Cấu trúc chuỗi kết nối (Postgres, MySQL, MongoDB) trong file `.env`.
> - Database Features & System requirements: Lưu ý về nền tảng hỗ trợ.
> 
> **2. Error Reference (Xử lý lỗi kinh điển)**
> - Hướng dẫn cách dùng `PrismaClientKnownRequestError` để bắt lỗi trong try-catch.
> - Giải thích và cách xử lý các mã lỗi phổ biến:
>   + **P2002**: Unique constraint failed (Trùng lặp dữ liệu).
>   + **P2025**: Record to update/delete not found (Không tìm thấy bản ghi).

---

### 📝 Prompt 6: Best Practices & Tổng kết
*Gửi prompt cuối cùng.*

> **Prompt:**
> Viết Phần 6: More & Kết luận.
> 
> **1. Best practices & Dev environment**
> - Tổng hợp 5 Best Practices quan trọng nhất khi dự án sử dụng Prisma (vd: Đừng expose toàn bộ DB model ra API, luôn dùng `select` để tối ưu performance, quản lý connection...).
> - Môi trường Dev: Gợi ý setup `.env` và Docker compose cơ bản.
> 
> **2. Comparisons (So sánh)**
> - So sánh ngắn gọn Prisma vs TypeORM vs Drizzle ORM. Khi nào nên dùng Prisma?
> 
> **3. ORM releases, maturity levels & Troubleshooting**
> - Khái niệm Preview features của Prisma là gì (Cách bật qua generator).
> - Lời khuyên khi troubleshooting các lỗi không rõ ràng (xóa thư mục `node_modules/.prisma` và generate lại).
> 
> Cuối cùng, hãy viết một lời nhắn nhủ động viên các developer khi bắt đầu học và sử dụng Prisma.

---