---
sidebar_position: 6
description: "Best Practices Prisma: 5 nguyên tắc vàng, Dev environment với Docker, so sánh Prisma vs TypeORM vs Drizzle, Preview Features, và lời khuyên troubleshooting thực tế."
---

# Lesson 6: Best Practices, So sánh & Tổng kết

## 📋 Agenda

**Thời gian đọc ước tính:** ~15 phút

### Sau bài này, bạn sẽ:
- ✅ **Nắm vững** 5 Best Practices quan trọng nhất khi dùng Prisma trong dự án thực
- ✅ **Thiết lập** môi trường Dev hoàn chỉnh với `.env` và Docker Compose
- ✅ **Phân biệt** và chọn đúng ORM giữa Prisma, TypeORM, và Drizzle
- ✅ **Debug** các lỗi Prisma không rõ ràng một cách hệ thống

### Yêu cầu đầu vào (Prerequisites):
- 🔹 Đã đọc toàn bộ Lesson 1-5 của series này

---

## ❓ Vấn đề & Giải pháp

**Vấn đề (Problem Statement):**
- Developer mới dùng Prisma thường mắc các anti-pattern: expose DB schema, không optimize query, không quản lý connection...
- Khó chọn ORM phù hợp giữa nhiều lựa chọn (Prisma, TypeORM, Drizzle)
- Lỗi Prisma đôi khi khó hiểu, không biết bắt đầu debug từ đâu

**Giải pháp (Solution):**
Tổng hợp best practices từ thực tế production, framework so sánh rõ ràng, và checklist troubleshooting có hệ thống.

---

## 🔨 5 Best Practices Quan trọng nhất

### 1. ❌ Đừng Expose toàn bộ DB Model ra API

```typescript
// filename: src/controllers/user.controller.ts

// ❌ Anti-pattern: Trả về toàn bộ User object
async getUser(id: number) {
  return prisma.user.findUnique({ where: { id } });
  // → Trả về: { id, email, passwordHash, internalNotes, deletedAt, ... }
  // → LỘ thông tin nhạy cảm!
}

// ✅ Tốt: Dùng select để chỉ trả về field cần thiết
async getUser(id: number) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      // Không bao gồm: passwordHash, internalNotes, deletedAt
    },
  });
}

// ✅ Hoặc dùng DTO transformation
import { plainToClass, Exclude } from 'class-transformer';

class UserResponseDto {
  id: number;
  name: string;
  email: string;

  @Exclude()
  passwordHash: string; // Tự động bị loại bỏ khi serialize
}
```

### 2. ✅ Luôn dùng `select` để tối ưu Performance

```typescript
// ❌ Lấy toàn bộ data kể cả không dùng
const users = await prisma.user.findMany(); // SELECT *

// ✅ Chỉ lấy những gì cần
const userList = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    _count: { select: { posts: true } }, // Đếm thay vì JOIN
  },
  where: { isActive: true },
  take: 20, // Luôn giới hạn page size
});

// ✅ Dùng Prisma.validator để định nghĩa select reusable
const userSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  name: true,
  email: true,
});

// Tái sử dụng ở nhiều nơi
const user = await prisma.user.findUnique({ where: { id }, select: userSelect });
const users = await prisma.user.findMany({ select: userSelect });
```

### 3. ✅ Quản lý Connection đúng cách

```typescript
// filename: src/lib/prisma.ts

// ✅ Singleton Pattern — xem Lesson 3
export const prisma = globalForPrisma.prisma || new PrismaClient();

// ✅ Graceful shutdown — đặt trong main.ts hoặc signal handler
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
```

### 4. ✅ Tách biệt business logic và database logic

```typescript
// filename: src/repositories/user.repository.ts — Data access layer

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: userSelect,
    });
  }

  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data, select: userSelect });
  }
}

// filename: src/services/user.service.ts — Business logic layer
export class UserService {
  constructor(private userRepo: UserRepository) {}

  async register(email: string, password: string) {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) throw new ConflictException('Email đã tồn tại');

    const hashedPassword = await bcrypt.hash(password, 10);
    return this.userRepo.create({ email, password: hashedPassword });
  }
}
```

### 5. ✅ Luôn dùng Migrations, không dùng `synchronize`

```typescript
// ❌ Không bao giờ làm điều này (chỉ có trong TypeORM, nhưng cần biết để tránh tương tự)
// synchronize: true  → Tự ý DROP COLUMN

// ✅ Prisma: luôn dùng migrate workflow
// Development:
// npx prisma migrate dev --name "add_feature_x"
// Production:
// npx prisma migrate deploy

// ✅ Kiểm tra migration status trước khi deploy
// npx prisma migrate status
```

---

## 🔨 Dev Environment Setup

### .env Configuration

```env
# filename: .env (Development)
# ─── Database ───
DATABASE_URL="postgresql://postgres:devpassword@localhost:5432/myapp_dev"
SHADOW_DATABASE_URL="postgresql://postgres:devpassword@localhost:5432/myapp_shadow"

# ─── App ───
NODE_ENV="development"
PORT=3000

# ─── Auth (Example) ───
JWT_SECRET="dev-jwt-secret-change-in-prod"
```

```env
# filename: .env.example (Commit vào Git — không chứa secret)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
SHADOW_DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/SHADOW_DATABASE"
NODE_ENV="development"
PORT=3000
JWT_SECRET="your-secret-here"
```

### Docker Compose cho Development

```yaml
# filename: docker-compose.dev.yml

version: '3.8'

services:
  # PostgreSQL chính
  postgres:
    image: postgres:16-alpine
    container_name: myapp_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: devpassword
      POSTGRES_DB: myapp_dev
    ports:
      - "5432:5432"
    volumes:
      # Persist data kể cả khi container restart
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Shadow Database cho Prisma Migrate
  postgres_shadow:
    image: postgres:16-alpine
    container_name: myapp_shadow
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: devpassword
      POSTGRES_DB: myapp_shadow
    ports:
      - "5433:5432"  # Port khác để tránh conflict

  # Adminer: GUI quản lý DB nhẹ (thay thế pgAdmin)
  adminer:
    image: adminer:latest
    container_name: myapp_adminer
    restart: unless-stopped
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  postgres_data:
```

```bash
# Khởi động môi trường dev
docker compose -f docker-compose.dev.yml up -d

# Chạy migration lần đầu
npx prisma migrate dev --name init

# Seed data nếu có
npx prisma db seed

# Mở Prisma Studio
npx prisma studio
```

---

## 🔨 So sánh: Prisma vs TypeORM vs Drizzle ORM

```mermaid
graph TB
    subgraph Prisma["⚙️ Prisma ORM"]
        P1["✅ Type-safe 100%<br>✅ Schema-first (.prisma)<br>✅ Prisma Studio GUI<br>❌ Verbose với complex query<br>❌ Schema file riêng biệt"]
    end

    subgraph TypeORM["🔷 TypeORM"]
        T1["✅ Decorator-based (quen với NestJS)<br>✅ Mature ecosystem<br>✅ QueryBuilder mạnh<br>❌ Decorator dễ misconfigure<br>❌ Type safety partial"]
    end

    subgraph Drizzle["💧 Drizzle ORM"]
        D1["✅ SQL-first, gần gũi với SQL<br>✅ Bundle size nhỏ nhất<br>✅ Serverless-friendly<br>❌ Ecosystem còn non trẻ<br>❌ Ít tính năng auto-magic"]
    end

    style Prisma fill:#5a67d8,color:#fff
    style TypeORM fill:#e53e3e,color:#fff
    style Drizzle fill:#38a169,color:#fff
```

| Tiêu chí | **Prisma** | **TypeORM** | **Drizzle** |
|---|---|---|---|
| **Type Safety** | ✅ 100% auto-generated | ⚠️ Partial (decorator) | ✅ 100% (schema as types) |
| **Learning Curve** | Thấp (schema DSL) | Trung bình | Trung bình (SQL knowledge) |
| **NestJS Integration** | ✅ Tốt | ✅ Native support | ⚠️ Manual |
| **Raw SQL** | `$queryRaw` (tagged) | `query()` | `sql` template |
| **Bundle Size** | ~2MB | ~4MB | ~1MB |
| **Serverless** | ✅ Accelerate | ⚠️ Cần config | ✅ Native |
| **Migrations** | ✅ Tự động + reviewable | ✅ Tự động | ✅ Manual/Auto |
| **Community** | Lớn, phát triển nhanh | Lớn, stable | Đang phát triển |

### Khi nào nên dùng Prisma?

```
✅ DÙNG Prisma khi:
  - Greenfield project, ưu tiên developer experience
  - Team muốn type-safety tối đa và autocomplete
  - Cần Prisma Studio để non-technical member xem data
  - Serverless deployment (Vercel, AWS Lambda)
  - Database schema thay đổi thường xuyên

❌ KHÔNG dùng Prisma khi:
  - Cần truy vấn SQL phức tạp hàng ngày (Window functions, CTE)
  - Project đang dùng TypeORM và hoạt động ổn
  - Database exotics không được support (Oracle, Microsoft Access)
  - Team quen với Active Record pattern hơn Data Mapper
```

---

## 🔨 Preview Features & Troubleshooting

### Preview Features

Prisma có một số tính năng đang ở giai đoạn thử nghiệm (Preview), cần bật thủ công:

```prisma
// filename: prisma/schema.prisma

generator client {
  provider        = "prisma-client-js"
  // Bật preview features — kiểm tra docs để biết tính năng mới nhất
  previewFeatures = ["postgresqlExtensions", "metrics", "tracing"]
}
```

> ⚠️ **Lưu ý:** Preview features có thể thay đổi API hoặc bị xóa trong future releases. Không phụ thuộc preview features cho production-critical logic.

### Checklist Troubleshooting

Khi gặp lỗi Prisma không rõ nguyên nhân, thực hiện theo thứ tự này:

```bash
# Bước 1: Xóa Prisma client đã generate và generate lại
# (Giải quyết 60% lỗi "lạ" sau khi update schema)
rm -rf node_modules/.prisma
npx prisma generate

# Bước 2: Xóa toàn bộ node_modules và cài lại
rm -rf node_modules
npm install
npx prisma generate

# Bước 3: Kiểm tra schema có lỗi cú pháp không
npx prisma validate
npx prisma format

# Bước 4: Kiểm tra migration status
npx prisma migrate status

# Bước 5: Bật debug mode để xem query + error detail
DEBUG="prisma:*" npx ts-node src/main.ts
# Hoặc set env:
# DATABASE_URL=... LOG_LEVEL=query ...

# Bước 6: Kiểm tra xem DB có đang chạy không
npx prisma db pull  # Nếu lỗi kết nối sẽ fail rõ ràng hơn
```

### Các lỗi thường gặp và fix nhanh

| Lỗi | Nguyên nhân | Fix |
|---|---|---|
| `"PrismaClientKnownRequestError P2002"` | Unique constraint | Kiểm tra field trùng lặp |
| `"PrismaClientInitializationError"` | Không kết nối được DB | Kiểm tra DATABASE_URL và DB đang chạy |
| `"Cannot find module @prisma/client"` | Chưa generate | `npx prisma generate` |
| `"Schema engine error"` | Schema có lỗi cú pháp | `npx prisma validate` |
| `"The table _prisma_migrations does not exist"` | DB chưa khởi tạo | `npx prisma migrate dev` |
| Type không cập nhật sau khi sửa schema | Chưa regenerate | `rm -rf node_modules/.prisma && npx prisma generate` |

---

## 🚀 Lời nhắn nhủ Developer

Nếu bạn đang bắt đầu hành trình với Prisma, đây là điều tôi muốn chia sẻ:

**Prisma sẽ làm bạn nghi ngờ bản thân trong những ngày đầu.** File `.prisma` trông lạ, lệnh `generate` có vẻ "magic", và đôi khi lỗi migration hiển thị những thông báo khó hiểu. Đó là cảm giác hoàn toàn bình thường.

Nhưng khi bạn vượt qua giai đoạn đó — khi IDE autocomplete tên field chính xác, khi TypeScript report lỗi trước cả khi app chạy, khi migration được review như code review — bạn sẽ nhận ra tại sao Prisma là một trong những công cụ được yêu thích nhất trong hệ sinh thái Node.js hiện đại.

**Hãy nhớ:**
- Schema là nguồn sự thật — luôn sửa từ đó
- `migrate dev` cho dev, `migrate deploy` cho production
- `select` để tối ưu, không lấy những gì không cần
- Đừng ngại đọc SQL được generate ra — đó là cách học nhanh nhất

Chúc mừng bạn đã hoàn thành bộ tài liệu Prisma ORM. **Happy coding!** 🚀

---

## 🗺️ MECE Mindmap Tổng kết

```mermaid
mindmap
  root((Prisma ORM<br>Toàn tập))
    SCHEMA["📄 Schema"]
      datasource["Datasource config"]
      generator["Generator + Preview"]
      model["Model + Relations"]
      introspect["Introspection - db pull"]
    CLIENT["⚙️ Client"]
      crud["CRUD operations"]
      filter["Filtering + Sorting"]
      relation["include/select/nested"]
      raw["$queryRaw - Raw SQL"]
    ADVANCED["🔧 Advanced"]
      ext["$extends - Extensions"]
      log["Logging + Debug"]
      test["Unit Test Mock"]
      pool["Connection Pooling"]
    MIGRATE["🔄 Migrate"]
      dev["migrate dev"]
      deploy["migrate deploy"]
      shadow["Shadow Database"]
      history["_prisma_migrations"]
    BESTPRACTICE["✅ Best Practice"]
      expose["Không expose full model"]
      select["Luôn dùng select"]
      conn["Quản lý connection"]
      layer["Tách Repository/Service"]
      migrate["Dùng Migrations"]
```

---

*Made by Anh Tu - Share to be share*
