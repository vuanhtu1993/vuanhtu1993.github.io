---
sidebar_position: 5
description: "Cheat Sheet Prisma: CLI reference, Connection URLs, Error Codes P2002/P2025, và hướng dẫn xử lý lỗi với PrismaClientKnownRequestError."
---

# Lesson 5: Reference & Error Handling

## 📋 Agenda

**Thời gian đọc ước tính:** ~12 phút

### Sau bài này, bạn sẽ:
- ✅ **Tra cứu** nhanh các lệnh CLI Prisma hay dùng nhất
- ✅ **Cấu hình** đúng Connection URL cho PostgreSQL, MySQL, MongoDB
- ✅ **Bắt lỗi** Prisma đúng cách với `PrismaClientKnownRequestError`
- ✅ **Xử lý** các mã lỗi phổ biến: P2002 (unique conflict) và P2025 (not found)

### Yêu cầu đầu vào (Prerequisites):
- 🔹 Đã đọc qua Lesson 1-4 hoặc có kinh nghiệm với Prisma cơ bản
- 🔹 Hiểu try-catch và error handling trong TypeScript

---

## 🔨 Prisma CLI Reference — Cheat Sheet

### Các lệnh hay dùng nhất

| Lệnh | Mô tả |
|---|---|
| `prisma init` | Khởi tạo Prisma trong project |
| `prisma generate` | Sinh/cập nhật Prisma Client từ schema |
| `prisma db pull` | Introspect DB → ghi vào schema.prisma |
| `prisma db push` | Push schema lên DB (không tạo migration file) |
| `prisma migrate dev` | Tạo & apply migration cho development |
| `prisma migrate deploy` | Apply migration pending cho production |
| `prisma migrate reset` | Xóa DB và apply lại toàn bộ migration (dev only) |
| `prisma migrate status` | Kiểm tra trạng thái migration |
| `prisma migrate diff` | Xem diff SQL giữa schema và DB |
| `prisma studio` | Mở GUI quản lý data tại http://localhost:5555 |
| `prisma format` | Format file schema.prisma đẹp |
| `prisma validate` | Kiểm tra cú pháp schema.prisma |

### Lệnh với options quan trọng

```bash
# migrate dev — tạo migration với tên mô tả rõ ràng
npx prisma migrate dev --name "add_user_profile_table"

# migrate dev — skip generate (nếu muốn manual)
npx prisma migrate dev --skip-generate

# migrate deploy — dùng trong CI, không prompt
npx prisma migrate deploy

# db push — nhanh trong prototyping, KHÔNG dùng production
npx prisma db push --force-reset  # Xóa sạch DB và push lại

# generate — chỉ định schema khác nếu không dùng default
npx prisma generate --schema=./custom/schema.prisma

# migrate diff — preview SQL changes
npx prisma migrate diff \
  --from-schema-datasource prisma/schema.prisma \
  --to-schema-datamodel prisma/schema.prisma \
  --script

# studio — đổi port nếu 5555 đang dùng
npx prisma studio --port 5556
```

---

## 🔨 Connection URLs & Environment Variables

### Cấu trúc Connection URL

```
protocol://USER:PASSWORD@HOST:PORT/DATABASE?param1=value&param2=value
```

### PostgreSQL

```env
# filename: .env

# Local development
DATABASE_URL="postgresql://postgres:secret@localhost:5432/mydb"

# Với SSL (Production)
DATABASE_URL="postgresql://user:pass@prod-host:5432/mydb?sslmode=require"

# Connection pooling với PgBouncer
DATABASE_URL="postgresql://user:pass@pgbouncer:6432/mydb?pgbouncer=true&connection_limit=1"

# Prisma Accelerate
DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"
```

### MySQL / MariaDB

```env
# MySQL
DATABASE_URL="mysql://user:pass@localhost:3306/mydb"

# Với SSL
DATABASE_URL="mysql://user:pass@prod-host:3306/mydb?sslaccept=strict"

# PlanetScale (serverless MySQL)
DATABASE_URL="mysql://user:pass@host.psdb.cloud/mydb?sslaccept=strict"
```

### MongoDB

```env
# MongoDB Atlas
DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/mydb?retryWrites=true"

# Local MongoDB
DATABASE_URL="mongodb://localhost:27017/mydb"
```

### SQLite (cho development/testing)

```env
# File-based — tiện cho unit test local
DATABASE_URL="file:./dev.db"

# In-memory (xóa khi app tắt)
DATABASE_URL="file::memory:?cache=shared"
```

### Quản lý Environment Variables

```env
# filename: .env (Development — KHÔNG commit lên Git)
DATABASE_URL="postgresql://postgres:dev-secret@localhost:5432/myapp_dev"
SHADOW_DATABASE_URL="postgresql://postgres:dev-secret@localhost:5432/myapp_shadow"

# filename: .env.example (Template — ĐượC commit, không chứa secret)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

```typescript
// Validate env vars khi startup — phát hiện lỗi config sớm
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required but not set in environment');
}
```

---

## 🔨 Prisma API Reference — Tóm tắt cú pháp

### Schema API — Các attribute cần nhớ

```prisma
model User {
  // --- ID & Default ---
  id        Int      @id @default(autoincrement())
  uuid      String   @id @default(uuid())
  cuid      String   @id @default(cuid())

  // --- Type modifiers ---
  name      String   // NOT NULL
  bio       String?  // NULL (optional)

  // --- Constraints ---
  email     String   @unique
  slug      String   @db.VarChar(100)   // DB-level type

  // --- Timestamps ---
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // --- Table-level ---
  @@unique([firstName, lastName])      // Composite unique
  @@index([email, createdAt])          // Composite index
  @@map("users")                       // Custom table name
}
```

### Prisma Client API — Quick Reference

```typescript
// --- READ ---
prisma.model.findUnique({ where: { id } })
prisma.model.findFirst({ where, orderBy, include })
prisma.model.findMany({ where, orderBy, take, skip, cursor, include, select })
prisma.model.count({ where })
prisma.model.aggregate({ where, _avg, _sum, _min, _max, _count })
prisma.model.groupBy({ by, where, _count, orderBy, having })

// --- WRITE ---
prisma.model.create({ data, select, include })
prisma.model.createMany({ data: [{}], skipDuplicates })
prisma.model.update({ where, data, select })
prisma.model.updateMany({ where, data })
prisma.model.upsert({ where, create, update })
prisma.model.delete({ where })
prisma.model.deleteMany({ where })

// --- TRANSACTION ---
await prisma.$transaction([
  prisma.model.create({ data: {} }),
  prisma.model.update({ where: {}, data: {} }),
]);

// Interactive transaction
await prisma.$transaction(async (tx) => {
  const a = await tx.account.update({ where: { id: 1 }, data: { balance: { decrement: 100 } } });
  const b = await tx.account.update({ where: { id: 2 }, data: { balance: { increment: 100 } } });
  if (a.balance < 0) throw new Error('Insufficient funds'); // Rollback cả transaction
  return [a, b];
});
```

---

## 🔨 Error Handling — Bắt lỗi đúng cách

### PrismaClientKnownRequestError

```typescript
// filename: src/utils/prisma-error.handler.ts

import { Prisma } from '@prisma/client';

// Template xử lý lỗi Prisma chuẩn
export function handlePrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Lỗi từ database với mã cụ thể (P2xxx)
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        const field = (error.meta?.target as string[])?.join(', ');
        throw new ConflictException(`Trường ${field} đã tồn tại trong hệ thống`);

      case 'P2025':
        // Record không tồn tại
        throw new NotFoundException(`Không tìm thấy dữ liệu yêu cầu`);

      case 'P2003':
        // Foreign key constraint failed
        throw new BadRequestException(
          `Dữ liệu liên kết không hợp lệ: ${error.meta?.field_name}`
        );

      case 'P2014':
        // Required relation violation
        throw new BadRequestException('Vi phạm ràng buộc quan hệ bắt buộc');

      default:
        // Log lỗi chưa biết để debug
        console.error(`Unhandled Prisma error code: ${error.code}`, error);
        throw new InternalServerErrorException('Lỗi cơ sở dữ liệu');
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    // Lỗi validation: query sai cú pháp, thiếu field required
    throw new BadRequestException(`Dữ liệu query không hợp lệ: ${error.message}`);
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    // Không kết nối được database
    throw new ServiceUnavailableException('Không thể kết nối database');
  }

  throw error; // Re-throw nếu không phải Prisma error
}
```

### Sử dụng trong Service

```typescript
// filename: src/services/user.service.ts

import { prisma } from '../lib/prisma';
import { handlePrismaError } from '../utils/prisma-error.handler';

export class UserService {
  async createUser(email: string, name: string) {
    try {
      return await prisma.user.create({
        data: { email, name },
      });
    } catch (error) {
      handlePrismaError(error); // Chuyển đổi Prisma error → HTTP error
    }
  }

  async getUserById(id: number) {
    // Cách 1: Dùng findUniqueOrThrow — tự throw P2025 nếu không tìm thấy
    return prisma.user.findUniqueOrThrow({
      where: { id },
    });

    // Cách 2: Manual check
    // const user = await prisma.user.findUnique({ where: { id } });
    // if (!user) throw new NotFoundException(`User #${id} not found`);
    // return user;
  }
}
```

### Bảng mã lỗi phổ biến

| Mã lỗi | Tên | Khi nào xảy ra | Cách xử lý |
|---|---|---|---|
| **P2002** | `UniqueConstraintViolation` | Insert/Update vi phạm `@unique` | Trả 409 Conflict, thông báo field trùng |
| **P2003** | `ForeignKeyConstraintViolation` | FK không tồn tại trong bảng cha | Trả 400 Bad Request |
| **P2014** | `RequiredRelationViolation` | Vi phạm required relation | Trả 400 Bad Request |
| **P2015** | `RelatedRecordNotFound` | Record liên kết không tồn tại | Trả 404 Not Found |
| **P2025** | `RecordNotFound` | `findUniqueOrThrow/findFirstOrThrow` không có record | Trả 404 Not Found |
| **P2034** | `TransactionConflict` | Deadlock hoặc write conflict | Retry transaction |

---

## 🔨 Database Features & System Requirements

### Tính năng theo Database

| Feature | PostgreSQL | MySQL | SQLite | MongoDB |
|---|---|---|---|---|
| **Migrations** | ✅ | ✅ | ✅ | ❌ |
| **Transactions** | ✅ | ✅ | ✅ | ✅ (4.0+) |
| **Full-text Search** | ✅ | ✅ | ❌ | ✅ |
| **JSON fields** | ✅ | ✅ (8.0+) | ✅ | ✅ (Native) |
| **Extensions** | ✅ (pgcrypto...) | ❌ | ❌ | ❌ |
| **Array types** | ✅ | ❌ | ❌ | ✅ |

### System Requirements

```
Node.js: >= 16.13 (LTS khuyến nghị >= 18)
TypeScript: >= 4.7
Prisma: >= 5.0 (latest stable)
```

---

## 🗺️ MECE Mindmap

```mermaid
mindmap
  root((Prisma Reference<br>Lesson 5))
    WHY["❓ WHY"]
      speed["Tra cứu nhanh - không mất thời gian"]
      error["Bắt lỗi đúng cách - UX tốt hơn"]
    WHAT["📖 WHAT"]
      cli["CLI Commands"]
      url["Connection URL patterns"]
      api["Client API quick ref"]
      codes["Error codes P2xxx"]
    HOW["🔨 HOW"]
      handler["PrismaClientKnownRequestError"]
      p2002["P2002 - Unique conflict"]
      p2025["P2025 - Not found"]
      throw["findUniqueOrThrow"]
    WHATIF["🚀 WHAT IF"]
      unhandled["Unhandled Prisma error"]
      leak["Expose DB schema qua error msg"]
      retry["P2034 - Transaction retry"]
```

---

*Made by Anh Tu - Share to be share*
