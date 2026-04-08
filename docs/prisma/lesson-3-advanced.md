---
sidebar_position: 3
description: "Prisma Client Extensions (computed fields), Logging & Debugging, Testing với mock, và Connection Pooling trong môi trường Serverless (Prisma Accelerate, PgBouncer)."
---

# Lesson 3: Nâng cao & Vận hành

## 📋 Agenda

**Thời gian đọc ước tính:** ~18 phút

### Sau bài này, bạn sẽ:
- ✅ **Mở rộng** Prisma Client với Extensions để thêm computed fields và custom logic
- ✅ **Cấu hình** Logging để debug query hiệu quả trong từng môi trường
- ✅ **Mock** Prisma Client đúng cách để viết Unit Test không phụ thuộc DB
- ✅ **Hiểu** vấn đề Connection Pooling trong Serverless và cách giải quyết

### Yêu cầu đầu vào (Prerequisites):
- 🔹 Đã hoàn thành Lesson 2 (hiểu Prisma Client API)
- 🔹 Biết cơ bản về Unit Testing (Jest hoặc Vitest)

---

## ❓ Vấn đề & Giải pháp

**Vấn đề (Problem Statement):**
- Cần thêm business logic (computed fields, soft-delete logic) vào tất cả query mà không muốn lặp code
- Khó debug khi query chậm — không biết Prisma đang sinh ra SQL gì
- Unit test phụ thuộc database thật → test chậm và không ổn định
- Serverless (Lambda, Vercel) tạo connection mới mỗi request → database bị quá tải connection

**Giải pháp (Solution):**
- **Client Extensions** — Middleware cho Prisma Client, thêm logic tập trung
- **Logging config** — Prisma logs query/error ra console hoặc custom logger
- **Jest/Vitest mock** — Mock toàn bộ Prisma Client mà không cần DB
- **Prisma Accelerate / PgBouncer** — Connection pooler xử lý bài toán serverless

---

## 📖 Prisma Client Extensions

**Định nghĩa:** Extensions là một cơ chế cho phép **mở rộng hoặc thay đổi behavior** của Prisma Client, bao gồm: thêm computed fields, custom methods, hoặc intercept query.

```mermaid
graph LR
    Base["⚙️ Prisma Client<br>(Base)"] -->|"$extends()"| Extended["🔧 Extended Client<br>(Custom Logic)"]
    Extended -->|"Query"| DB[("🗄️ Database")]

    style Base fill:#4ecdc4,color:#fff
    style Extended fill:#5a67d8,color:#fff
    style DB fill:#2d3748,color:#fff
```

### Thêm Computed Fields

Computed fields là các field **được tính toán tại runtime**, không lưu trong DB.

```typescript
// filename: src/lib/prisma.extended.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// $extends() tạo ra một Extended Client mới
// Không mutate prisma gốc — đảm bảo immutability
export const extendedPrisma = prisma.$extends({
  result: {
    // Mở rộng model 'user'
    user: {
      // Computed field: fullName tự động ghép từ firstName và lastName
      fullName: {
        // Khai báo field cần thiết để tính toán
        needs: { firstName: true, lastName: true },
        compute(user) {
          return `${user.firstName} ${user.lastName}`;
        },
      },
      // Computed field: kiểm tra xem user có phải admin không
      isAdmin: {
        needs: { role: true },
        compute(user) {
          return user.role === 'ADMIN';
        },
      },
    },
  },
});

// Sử dụng:
const user = await extendedPrisma.user.findUnique({ where: { id: 1 } });
console.log(user?.fullName); // "Nguyen Van A" — TypeScript biết field này tồn tại
console.log(user?.isAdmin);  // true/false
```

### Custom Model Methods

```typescript
// filename: src/lib/prisma.extended.ts (tiếp theo)

export const extendedPrisma = prisma.$extends({
  model: {
    // Thêm custom method cho tất cả model
    $allModels: {
      // findOrCreate: Tìm hoặc tạo mới — pattern hay dùng
      async findOrCreate<T>(
        this: T,
        args: { where: Record<string, unknown>; create: Record<string, unknown> }
      ) {
        const ctx = Prisma.getExtensionContext(this) as any;
        return (
          (await ctx.findFirst({ where: args.where })) ??
          (await ctx.create({ data: args.create }))
        );
      },
    },
    // Hoặc chỉ áp dụng cho model cụ thể
    post: {
      async publishAll(authorId: number) {
        return prisma.post.updateMany({
          where: { authorId, published: false },
          data: { published: true },
        });
      },
    },
  },
});

// Sử dụng:
await extendedPrisma.post.publishAll(1);
```

### Query Extensions — Middleware-style

```typescript
// Tự động thêm soft-delete filter cho mọi query
export const softDeletePrisma = prisma.$extends({
  query: {
    $allModels: {
      async findMany({ model, operation, args, query }) {
        // Tự động thêm deletedAt: null vào WHERE nếu không có
        if (!args.where?.deletedAt) {
          args.where = { ...args.where, deletedAt: null };
        }
        return query(args);
      },
    },
  },
});
```

> ⚠️ **Lưu ý thực tế:** Extensions thêm overhead nhỏ. Với hệ thống cực kỳ cao tải, hãy benchmark trước. Đối với hầu hết dự án, overhead này không đáng kể.

---

## 🔨 Observability — Logging & Debugging

### Cấu hình Logging

```typescript
// filename: src/lib/prisma.ts

import { PrismaClient } from '@prisma/client';

// Cấu hình log level theo môi trường
const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === 'development'
      ? [
          { level: 'query', emit: 'event' }, // Emit event thay vì console.log
          { level: 'error', emit: 'stdout' },
          { level: 'warn', emit: 'stdout' },
        ]
      : [{ level: 'error', emit: 'stdout' }], // Production: chỉ log lỗi
});

// Bắt event và xử lý tùy chỉnh — tích hợp với logger (Winston, Pino...)
prisma.$on('query', (event) => {
  console.log({
    query: event.query,      // Câu SQL đã generate
    params: event.params,    // Các parameter được bind
    duration: event.duration, // Thời gian thực thi (ms)
    timestamp: event.timestamp,
  });

  // Cảnh báo nếu query chậm (> 1s)
  if (event.duration > 1000) {
    console.warn(`⚠️ Slow query detected: ${event.duration}ms`);
  }
});
```

### Debug Query nhanh

```typescript
// Xem SQL Prisma tạo ra KHÔNG cần chạy thực sự
const sql = await prisma.user.findMany({
  where: { isActive: true },
})
// Hoặc dùng --log=query Environment variable:
// DATABASE_URL=... LOG_LEVEL=query ts-node src/main.ts

// Sử dụng explain() (PostgreSQL) để xem query plan
const queryPlan = await prisma.$queryRaw`
  EXPLAIN ANALYZE
  SELECT * FROM "User" WHERE "isActive" = true
`;
console.log(queryPlan);
```

---

## 🔨 Testing — Mock Prisma Client

### Chiến lược Mock

```mermaid
graph LR
    Test["🧪 Unit Test"] -->|"inject mock"| MockPrisma["🎭 Mock Prisma Client<br>(No DB connection)"]
    Service["📦 Service Layer"] -->|"uses"| MockPrisma

    style Test fill:#f6ad55,color:#fff
    style MockPrisma fill:#68d391,color:#fff
    style Service fill:#4ecdc4,color:#fff
```

### Cài đặt với Vitest / Jest

```bash
npm install -D vitest @vitest/coverage-v8
# Hoặc: npm install -D jest @types/jest ts-jest
```

### Manual Mock với DeepMock pattern

```typescript
// filename: src/__mocks__/prisma.ts

import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended';
// npm install -D vitest-mock-extended

// Tạo deep mock của toàn bộ PrismaClient
export const prismaMock = mockDeep<PrismaClient>();
```

```typescript
// filename: src/__tests__/user.service.test.ts

import { vi, it, expect, beforeEach, describe } from 'vitest';
import { prismaMock } from '../__mocks__/prisma';
import { UserService } from '../services/user.service';

// Mock module để UserService nhận prismaMock thay vì real client
vi.mock('../lib/prisma', () => ({ prisma: prismaMock }));

describe('UserService', () => {
  beforeEach(() => {
    // Reset giữa các test để tránh state leak
    mockReset(prismaMock);
  });

  it('should return user by id', async () => {
    // arrange: Định nghĩa mock return value
    const mockUser = { id: 1, email: 'test@example.com', name: 'Test User' };
    prismaMock.user.findUnique.mockResolvedValue(mockUser as any);

    // act
    const service = new UserService();
    const user = await service.findById(1);

    // assert
    expect(user).toEqual(mockUser);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it('should return null when user not found', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const service = new UserService();
    const user = await service.findById(999);

    expect(user).toBeNull();
  });
});
```

> 💡 **Pro-tip:** Nếu không muốn thêm dependency `vitest-mock-extended`, có thể tạo manual mock đơn giản hơn bằng `vi.fn()` cho từng method cần mock. Tuy nhiên `vitest-mock-extended` tự động type-safe toàn bộ.

---

## 🔨 Deployment — Connection Pooling trong Serverless

### Vấn đề Connection Pool

```mermaid
graph TD
    subgraph Serverless["☁️ Serverless Environment"]
        Fn1["Function Instance 1<br>new PrismaClient()"]
        Fn2["Function Instance 2<br>new PrismaClient()"]
        Fn3["Function Instance N<br>new PrismaClient()"]
    end

    DB[("🗄️ PostgreSQL<br>max_connections: 100")]

    Fn1 -->|"10 connections"| DB
    Fn2 -->|"10 connections"| DB
    Fn3 -->|"10 connections"| DB

    style DB fill:#e53e3e,color:#fff
    style Serverless fill:#f7fafc
```

**Hậu quả:** Với 10+ function instances, mỗi instance mở 10 connections → **100+ connections** → PostgreSQL bị quá tải → Lỗi `"Too many connections"`.

### Giải pháp 1: PgBouncer (Self-managed)

```env
# filename: .env — Thêm ?pgbouncer=true vào connection string
DATABASE_URL="postgresql://user:pass@pgbouncer-host:6432/mydb?pgbouncer=true&connection_limit=1"
```

```typescript
// Với PgBouncer, mỗi Prisma Client chỉ cần 1 connection
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL, // URL đã cấu hình PgBouncer
    },
  },
});
```

### Giải pháp 2: Prisma Accelerate (Managed, Recommended)

**Prisma Accelerate** là connection pooler managed của Prisma — không cần cấu hình server, tích hợp qua API key.

```bash
npm install @prisma/extension-accelerate
```

```typescript
// filename: src/lib/prisma.ts

import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient().$extends(withAccelerate());

// Sử dụng cache tại query level (feature bổ sung của Accelerate)
const users = await prisma.user.findMany({
  cacheStrategy: {
    ttl: 60, // Cache 60 giây — giảm số query đến DB
    swr: 10, // Stale-while-revalidate: trả cache cũ, background refresh
  },
});
```

```env
# filename: .env
# Thay DATABASE_URL thường bằng Accelerate connection string
DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=YOUR_KEY"
```

| Giải pháp | Chi phí | Độ phức tạp | Phù hợp |
|---|---|---|---|
| **Singleton Pattern** | Miễn phí | Thấp | Long-running server (Express/NestJS) |
| **PgBouncer** | Server cost | Trung bình | Self-hosted production |
| **Prisma Accelerate** | Pay-per-request | Thấp | Serverless (Vercel, Lambda) |

---

## 🚀 Trade-off & Pitfalls

| ✅ NÊN | ❌ KHÔNG nên |
|---|---|
| Mock Prisma Client trong Unit Test | Kết nối DB thật trong Unit Test |
| Log `query` event để tìm slow query | `console.log` từng câu SQL thủ công |
| Dùng Accelerate/PgBouncer ở Serverless | `new PrismaClient()` không kiểm soát trong Lambda |
| `mockReset()` giữa các test case | Để state mock leak giữa các test |

### ⚠️ Pitfalls hay gặp

**1. Extensions không chain được tùy tiện**
Khi dùng nhiều `$extends()`, kết quả cần được assign lại vào một biến mới. Đừng gán vào `prisma` gốc.

**2. Slow query không phải lúc nào cũng do Prisma**
Trước khi tối ưu Prisma query, hãy kiểm tra index trong database. Một query đơn giản thiếu index có thể chậm hơn query phức tạp có index.

**3. Testing với Transaction**
Nếu service dùng `prisma.$transaction()`, mock cần xử lý callback transaction. Cân nhắc dùng integration test với database test riêng thay vì mock phức tạp.

---

## 🗺️ MECE Mindmap

```mermaid
mindmap
  root((Prisma<br>Lesson 3))
    WHY["❓ WHY"]
      reuse["Tái dụng logic - tránh lặp code"]
      debug["Debug slow query"]
      testable["Unit test không cần DB"]
      pool["Serverless connection limit"]
    WHAT["📖 WHAT"]
      ext["$extends - Extensions"]
      log["Logging events"]
      mock["DeepMock pattern"]
      accelerate["Prisma Accelerate"]
    HOW["🔨 HOW"]
      computed["Computed fields"]
      methods["Custom model methods"]
      querylog["$on query event"]
      vitest["vitest-mock-extended"]
      pgbouncer["PgBouncer config"]
    WHATIF["🚀 WHAT IF"]
      chain["Extensions chain sai"]
      slowindex["Slow query - thiếu Index"]
      txmock["Transaction mock phức tạp"]
```

---

*Made by Anh Tu - Share to be share*
