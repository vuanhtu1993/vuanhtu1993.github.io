
> **Prompt:**
> Đóng vai là một Senior Backend Developer và một Technical Writer chuyên nghiệp. Nhiệm vụ của bạn là giúp tôi viết một kế hoạch học tập toàn tập về TypeORM dành cho Node.js/Nest.js/Typescript Developer trong docs/typeORM
> Yêu cầu chung cho các bài viết:
> - **Bắt buộc** phải có các đoạn code TypeScript minh họa (code snippet) ngắn gọn, chuẩn xác cho mỗi tính năng.
> - Kèm theo các "Best Practice" hoặc "Lưu ý" từ kinh nghiệm thực tế.
> Nếu bạn đã hiểu, hãy trả lời "Tôi đã sẵn sàng nhận phần 1".

---

### 📝 Lesson 1: Mở đầu & Data Source
*Sau khi AI trả lời sẵn sàng, hãy gửi prompt này.*

> **Prompt:**
> Hãy viết Phần 1 của Series Cẩm nang TypeORM với cấu trúc sau:
> **1. Giới thiệu chung về TypeORM**
> - TypeORM là gì? Hỗ trợ những gì?
> - So sánh: Trước khi có TypeORM (dùng raw SQL/Query builder cũ) thì dev gặp khó khăn gì? Sau khi có TypeORM mang lại lợi ích gì (Type-safety, code ngắn gọn, đổi DB dễ dàng)? Cho ví dụ code minh họa trước và sau.
> 
> **2. Data Source (Nguồn dữ liệu)**
> Chi tiết hóa các mục sau (có code mẫu minh họa):
> - DataSource là gì? Data Source Options gồm những gì?
> - Cách setup Multiple data sources và Replication setup (Master-Slave).
> - DataSource API (cách khởi tạo và đóng kết nối).
> - Xử lý giá trị null và undefined trong điều kiện WHERE (giải thích sự khác biệt và cách dùng IsNull).

---

### 📝 Lesson 2: Entity & Relations
*Chờ AI viết xong phần 1, gửi tiếp prompt này.*

> **Prompt:**
> Rất tốt. Bây giờ hãy viết tiếp Phần 2 tập trung vào Entity và Relations. Đây là phần dùng để tra cứu nên cần giải thích hàm API và có code minh họa rõ ràng.
> 
> **1. Entity**
> - Entities cơ bản (Cách dùng @Entity, @PrimaryGeneratedColumn, @Column).
> - Embedded Entities (Cách dùng @Column(() => Class) để gom nhóm column).
> - Entity Inheritance (Mô hình Single Table Inheritance).
> - Tree Entities (Cách setup cấu trúc phân cấp/category).
> - View Entities (Cách map vào View của SQL).
> - Separating Entity Definition (Tạo entity bằng EntitySchema không cần decorator).
> 
> **2. Relations (Quan hệ)**
> Trình bày cách thiết lập, lưu ý khóa ngoại và code mẫu cho:
> - One-to-one relations (@OneToOne và @JoinColumn).
> - Many-to-one / one-to-many relations.
> - Many-to-many relations (Cách dùng @JoinTable).
> - Sự khác biệt giữa Eager và Lazy Relations (cách dùng promise trong lazy).
> - Relations FAQ (Cách dùng cascade: true để lưu các bảng liên quan).

---

### 📝 Lesson 3: Migrations
*Chờ AI viết xong phần 2, gửi tiếp prompt này.*

> **Prompt:**
> Tuyệt vời. Hãy viết tiếp Phần 3: Quản lý Migrations trong TypeORM.
> Trình bày chi tiết như một tài liệu tra cứu:
> 
> **Migrations**
> - How migrations work? (Lý thuyết cơ bản về UP và DOWN).
> - Setup & Vite integration (Khai báo đường dẫn file migration trong DataSource).
> - Giải thích chi tiết và cách dùng các CLI Commands:
>   + Creating manually (Tạo file trống)
>   + Generating (Auto generate từ Entity - cực kỳ quan trọng)
>   + Executing (run) và Reverting.
>   + Lệnh xem Status.
> - Faking Migrations and Rollbacks (Là gì và khi nào cần dùng?)
> - Query Runner API trong Migration (Cách viết SQL trực tiếp trong hàm up/down để sửa table, add column...).

---

### 📝 Lesson 4: Thao tác dữ liệu (EntityManager, Repository, Query Builder)
*Gửi prompt cuối cùng này để hoàn thiện series.*

> **Prompt:**
> Hãy viết Phần 4 (Phần cuối) về cách thao tác với dữ liệu. Phần này dev sẽ tra cứu rất nhiều, hãy viết thật sâu và nhiều code mẫu:
> 
> **1. Working with Entity Manager & Repository**
> - Sự khác biệt giữa EntityManager và Repository.
> - Find Options (Trình bày chi tiết cách dùng select, relations, where, order, skip, take).
> - Repository APIs (Các hàm cơ bản: save, insert, update, delete, softDelete).
> - Custom repositories (Cách mở rộng hàm cho repository mặc định).
> 
> **2. Query Builder & Query Runner**
> - Query Builder: Cú pháp tạo raw SQL an toàn (Cách dùng leftJoinAndSelect, where, andWhere, getMany, getOne).
> - Query Runner: Cách sử dụng Query Runner độc lập. Đặc biệt nhấn mạnh vào **Cách viết Database Transactions** bằng Query Runner (startTransaction, commit, rollback, release) kèm code minh họa chuẩn xác sử dụng try-catch-finally.
> 
> Cuối cùng, hãy viết một đoạn "Tổng kết" ngắn gọn chốt lại giá trị của TypeORM.

---