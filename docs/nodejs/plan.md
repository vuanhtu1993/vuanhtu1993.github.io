# 🎯 Kế Hoạch Khoá Học: Build Your Own JSON Server

> **Dự án xuyên suốt:** Clone lại `json-server` bằng Node.js + TypeScript + Express.js + PostgreSQL.
> **Tổng thời gian:** 13 buổi (khoảng 33 giờ học).
> **Đối tượng:** Intern / Junior đã biết JavaScript cơ bản (ES6+).

---

## CÔNG NGHỆ SỬ DỤNG

| Công nghệ | Phiên bản | Vai trò |
| :--- | :--- | :--- |
| Node.js | ≥ 20 LTS | Runtime |
| TypeScript | ≥ 5.x (Strict) | Ngôn ngữ |
| Express.js | ≥ 4.x | Web Framework |
| PostgreSQL | ≥ 15 | Database |
| knex.js | ≥ 3.x | Query Builder (Dynamic SQL) |
| Zod | ≥ 3.x | Input Validation |
| Vitest + Supertest | Latest | Unit & Integration Testing |
| Docker + docker-compose | Latest | Deployment |

> **Lưu ý Tech Stack:** Vì dự án tạo API **động** (không biết trước tên bảng/cột), chúng ta **không dùng ORM** (Prisma/TypeORM) vì chúng yêu cầu model cố định. `knex.js` là Query Builder — nó build câu SQL động dựa vào biến, và tự động parameterize để chống SQL Injection.

---

## 📅 LỊCH TRÌNH TỔNG QUAN

| Buổi | Chủ đề | Giai đoạn | Thời gian |
| :---: | :--- | :--- | :---: |
| **0** | WHY — Demo json-server & Mổ xẻ bài toán | Nền tảng | 2h |
| **1** | Setup Project & Nền tảng TypeScript | Nền tảng | 2.5h |
| **2** | Kết nối PostgreSQL & Migration đơn giản | Nền tảng | 2.5h |
| **3** | Dynamic GET (Danh sách & Chi tiết) | CRUD Cơ bản | 2.5h |
| **4** | Dynamic POST, PUT, PATCH, DELETE | CRUD Cơ bản | 2.5h |
| **5** | Pagination & Sorting | Advanced GET | 2.5h |
| **6** | Filtering & Full-text Search | Advanced GET | 2.5h |
| **7** | Relationship — Expand (lấy dữ liệu cha) | Nâng Cao | 3h |
| **8** | Relationship — Embed (lấy dữ liệu con) | Nâng Cao | 3h |
| **9** | Authentication & Authorization (JWT) | Bảo Mật | 3h |
| **10** | Error Handling, Validation & Testing | Production | 3h |
| **11** | Auto-Migration hoàn chỉnh & Tổng kết | Production | 3h |
| **12** | Docker hóa ứng dụng | Deployment | 2.5h |
| **13** | Deploy lên Cloud | Deployment | 2.5h |

---

## KẾ HOẠCH CHI TIẾT TỪNG BUỔI

---

### Buổi 0: [WHY] — Demo `json-server` & Mổ xẻ bài toán

**Thời gian:** ~2 giờ | **Hình thức:** Slide + Live Demo

#### 🎯 Mục tiêu học viên đạt được
- Hiểu được `json-server` là gì và tại sao nó tiện nhưng không dùng được cho production.
- Nhìn thấy kiến trúc tổng quan của ứng dụng chúng ta sẽ xây.
- Có động lực học vì thấy được OUTPUT cụ thể ngay từ đầu.

#### 📖 Nội dung
**Phần 1: Demo `json-server` gốc (30 phút)**
- Cài đặt `json-server`, tạo file `db.json`.
- Live demo các tính năng: GET, POST, PUT, DELETE, filter, sort, pagination, _expand.
- Câu hỏi dẫn dắt: *"Đây là 1 file .json. Nếu có 100,000 users đồng thời đọc/ghi, điều gì xảy ra?"*

**Phần 2: Phân tích hạn chế (30 phút)**
- Không có Transaction: 2 request ghi cùng lúc → dữ liệu bị ghi đè (Race Condition).
- Không có Index: Tìm kiếm phải scan toàn bộ file → chậm.
- Không có Type Safety: Không validate, ai muốn ghi gì cũng được.
- Không thể deploy thực tế (file .json sẽ bị xóa khi server restart trên cloud).

**Phần 3: Giới thiệu kiến trúc dự án (60 phút)**
- Sơ đồ: Request → Express → Dynamic Router → knex.js → PostgreSQL → Response.
- Giải thích khái niệm "Dynamic API": bảng nào trong DB → có route đó.
- Demo sản phẩm cuối khoá (chạy ứng dụng hoàn chỉnh để học viên thấy mục tiêu).

#### 📝 Bài tập về nhà
- Đọc tài liệu Express.js: [https://expressjs.com/en/guide/routing.html](https://expressjs.com/en/guide/routing.html)
- Cài sẵn: Node.js ≥ 20, VS Code, PostgreSQL, Postico/DBeaver (GUI cho DB).

---

### Buổi 1: [WHAT/HOW] — Setup Project & Nền tảng TypeScript

**Thời gian:** ~2.5 giờ | **Hình thức:** Coding Together

#### 🎯 Mục tiêu học viên đạt được
- Hiểu tại sao TypeScript tốt hơn JavaScript thuần cho dự án backend.
- Tự tạo được project Node.js + TypeScript từ đầu.
- Chạy được server "Hello World" với Express.

#### 📖 Nội dung lý thuyết (30 phút)
**TypeScript là gì? Tại sao dùng?**
```
Ẩn dụ: TypeScript như BẢN VẼ KỸ THUẬT so với bản vẽ tay.
- JavaScript: "cứ build thôi, sai đâu sửa đó" → lỗi xuất hiện lúc RUNTIME.
- TypeScript: "khai báo kiểu dữ liệu từ đầu" → lỗi bị bắt lúc COMPILE TIME, trước khi chạy.
```

Các khái niệm TypeScript cần biết cho dự án:
- `interface` và `type`: định nghĩa hình dạng của object.
- `generics` cơ bản: `function identity<T>(arg: T): T`.
- Strict mode: `noImplicitAny`, `strictNullChecks`.

#### 💻 Coding (90 phút)

**Bước 1: Khởi tạo project**
```bash
mkdir pg-json-server && cd pg-json-server
npm init -y
npm install express
npm install -D typescript ts-node @types/node @types/express nodemon
npx tsc --init
```

**Bước 2: Cấu hình `tsconfig.json`**
```json
// Các cờ quan trọng cần bật:
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true,        // ← Bắt buộc dùng type mọi nơi
    "esModuleInterop": true
  }
}
```

**Bước 3: Cấu hình `nodemon.json`**
```json
{
  "watch": ["src"],
  "ext": "ts",
  "exec": "ts-node src/index.ts"
}
```

**Bước 4: Cấu trúc thư mục**
```
src/
├── index.ts          ← Entry point (khởi động Express)
├── routes/
│   └── resource.route.ts  ← Route động /:resource
├── controllers/
│   └── resource.controller.ts
├── db/
│   └── knex.ts       ← Kết nối database
└── utils/
    └── validate.ts   ← Helper functions
```

**Bước 5: Server Hello World**
```typescript
// src/index.ts
import express from 'express';

const app = express();
app.use(express.json()); // Parse JSON body từ request

app.get('/', (req, res) => {
  res.json({ message: 'pg-json-server đang chạy! 🚀' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
```

#### 📝 Bài tập cuối buổi (30 phút)
1. Tự setup lại project từ đầu không nhìn tài liệu.
2. Thêm route `GET /health` trả về `{ status: 'ok', uptime: process.uptime() }`.
3. Tạo một `interface Request` tùy chỉnh có thêm field `tableName: string`.

#### 💡 Lưu ý giảng viên
- Dùng **Starter Template** đã config sẵn ESLint/Prettier để học viên không mất thời gian vào config tool.
- Giải thích rõ: `ts-node` chạy TypeScript trực tiếp (không cần build), `nodemon` tự reload khi đổi code.

---

### Buổi 2: [HOW] — Kết nối PostgreSQL & Schema đơn giản

**Thời gian:** ~2.5 giờ | **Hình thức:** Coding Together

#### 🎯 Mục tiêu học viên đạt được
- Kết nối được Node.js với PostgreSQL qua knex.js.
- Hiểu tại sao phải whitelist tên bảng (bảo mật SQL Injection).
- Đọc được file `db.json` và tự động tạo bảng trong database.

#### 📖 Nội dung lý thuyết (30 phút)
**knex.js là gì?**
```
Ẩn dụ: knex.js như NGƯỜI PHIÊN DỊCH giữa JavaScript và SQL.
- Thay vì viết: "SELECT * FROM posts WHERE id = 1"
- Bạn viết: knex('posts').where({ id: 1 }).select('*')
- Lợi ích: Tự động parameterize → KHÔNG bị SQL Injection.
```

**Tại sao phải kiểm tra tên bảng?**
- Parameterized query bảo vệ được VALUES nhưng KHÔNG bảo vệ được table name hay column name.
- Nếu dùng `SELECT * FROM ${req.params.resource}` → hacker có thể inject `; DROP TABLE users --`.
- Giải pháp: Query `information_schema.tables` để whitelist tên bảng hợp lệ.

#### 💻 Coding (90 phút)

**Bước 1: Cài đặt và cấu hình knex**
```bash
npm install knex pg dotenv
```
```typescript
// src/db/knex.ts
import knex from 'knex';

// Đọc config từ biến môi trường → không hardcode mật khẩu vào code!
export const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'pg_json_server',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  },
});
```

**Bước 2: Middleware kiểm tra tên bảng**
```typescript
// src/utils/tableValidator.ts
import { db } from '../db/knex';

// Hàm này query information_schema (bảng metadata của Postgres)
// để kiểm tra xem tên bảng có tồn tại không → whitelist an toàn
export async function tableExists(tableName: string): Promise<boolean> {
  const result = await db('information_schema.tables')
    .where({
      table_schema: 'public',
      table_name: tableName,
    })
    .count('table_name as count')
    .first();
  return Number(result?.count) > 0;
}
```

**Bước 3: Mini Auto-Migration từ `db.json`**
```typescript
// src/db/migrate.ts
import fs from 'fs';
import { db } from './knex';

// Đọc db.json, với mỗi key (tên bảng), tạo bảng nếu chưa tồn tại
export async function runMigration() {
  const raw = fs.readFileSync('./db.json', 'utf-8');
  const schema = JSON.parse(raw);

  for (const tableName of Object.keys(schema)) {
    const exists = await db.schema.hasTable(tableName);
    if (!exists) {
      // Lấy bản record đầu tiên để suy ra các cột
      const sample = schema[tableName][0];
      await db.schema.createTable(tableName, (table) => {
        table.increments('id'); // Tự động tạo cột id auto-increment
        Object.entries(sample).forEach(([col, val]) => {
          if (col === 'id') return;
          // Suy đoán kiểu dữ liệu từ giá trị mẫu
          if (typeof val === 'number') table.integer(col);
          else if (typeof val === 'boolean') table.boolean(col);
          else table.text(col); // Mặc định là text
        });
      });
      console.log(`✅ Đã tạo bảng "${tableName}"`);
    }
  }
}
```

#### 📝 Bài tập cuối buổi
1. Thêm xử lý `INSERT` dữ liệu từ `db.json` vào bảng sau khi tạo xong.
2. Thêm cột `created_at` và `updated_at` tự động cho mỗi bảng.
3. Viết test thủ công: Gọi API với tên bảng không tồn tại, xem server trả về lỗi gì?

#### 💡 Lưu ý giảng viên
- Đây là bản **beta** của Auto-Migration — chỉ tạo bảng đơn giản. Buổi 10 sẽ hoàn thiện toàn bộ logic inference kiểu dữ liệu.
- Nhấn mạnh: `tableExists()` là **LỚP BẢO VỆ đầu tiên** — chạy trước mọi query.

---

### Buổi 3: [HOW] — Dynamic GET (Danh sách & Chi tiết)

**Thời gian:** ~2.5 giờ | **Hình thức:** Coding Together

#### 🎯 Mục tiêu học viên đạt được
- Xây dựng được route động `GET /:resource` và `GET /:resource/:id`.
- Hiểu được cơ chế Dynamic Routing trong Express.
- Trả về đúng HTTP Status Code (200, 404) theo chuẩn REST.

#### 📖 Nội dung lý thuyết (30 phút)
**RESTful API là gì?**
```
Ẩn dụ: REST là BỘ QUY TẮC GIAO THÔNG cho API.
- Ai cũng tuân theo cùng một quy tắc → dễ đọc, dễ tích hợp.
- Một URL mô tả một TÀI NGUYÊN (resource).
- HTTP Method mô tả HÀNH ĐỘNG trên tài nguyên đó.
```

| HTTP Method | URL | Ý nghĩa |
| :--- | :--- | :--- |
| GET | `/posts` | Lấy tất cả posts |
| GET | `/posts/1` | Lấy post có id = 1 |
| POST | `/posts` | Tạo mới |
| PUT | `/posts/1` | Cập nhật toàn bộ |
| PATCH | `/posts/1` | Cập nhật 1 phần |
| DELETE | `/posts/1` | Xóa |

**HTTP Status Codes quan trọng:**
| Status | Ý nghĩa |
| :---: | :--- |
| `200` | Thành công (GET, PUT, PATCH) |
| `201` | Tạo mới thành công (POST) |
| `204` | Thành công, không có nội dung (DELETE) |
| `400` | Request sai (dữ liệu đầu vào lỗi) |
| `404` | Không tìm thấy (resource/ID không tồn tại) |
| `500` | Lỗi server nội bộ |

#### 💻 Coding (90 phút)

**Route định nghĩa**
```typescript
// src/routes/resource.route.ts
import { Router } from 'express';
import { getAll, getById } from '../controllers/resource.controller';

const router = Router();

// Một route pattern /:resource bắt tất cả paths
// VD: /posts → resource = "posts", /users → resource = "users"
router.get('/:resource', getAll);
router.get('/:resource/:id', getById);

export default router;
```

**Controller: GET all**
```typescript
// src/controllers/resource.controller.ts
import { Request, Response, NextFunction } from 'express';
import { db } from '../db/knex';
import { tableExists } from '../utils/tableValidator';

export async function getAll(req: Request, res: Response, next: NextFunction) {
  const { resource } = req.params; // VD: "posts"

  // Bước 1: Kiểm tra bảng có tồn tại không → bảo mật SQL Injection
  if (!(await tableExists(resource))) {
    return res.status(404).json({ error: `Resource '${resource}' not found` });
  }

  // Bước 2: Query toàn bộ bảng — knex tự parameterize tableName an toàn
  const data = await db(resource).select('*');
  return res.status(200).json(data);
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  const { resource, id } = req.params;

  // Validate: id phải là số nguyên dương (không để Postgres crash với "abc")
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'ID phải là số nguyên hợp lệ' });
  }

  if (!(await tableExists(resource))) {
    return res.status(404).json({ error: `Resource '${resource}' not found` });
  }

  const item = await db(resource).where({ id: Number(id) }).first();

  if (!item) {
    return res.status(404).json({ error: `${resource} với id=${id} không tồn tại` });
  }

  return res.status(200).json(item);
}
```

**Đăng ký route trong Express**
```typescript
// src/index.ts (cập nhật)
import resourceRouter from './routes/resource.route';
app.use('/', resourceRouter);
```

#### 🧪 Test với curl hoặc Postman
```bash
# Lấy tất cả posts
curl http://localhost:3000/posts

# Lấy post có id = 1
curl http://localhost:3000/posts/1

# Kiểm tra 404 khi bảng không tồn tại
curl http://localhost:3000/nonexistent_table

# Kiểm tra 400 khi ID không hợp lệ
curl http://localhost:3000/posts/abc
```

#### 📝 Bài tập cuối buổi
1. Import Postman collection mẫu (giảng viên cung cấp) và chạy thử tất cả các case.
2. Thêm query `SELECT` chỉ lấy các cột nhất định: `GET /posts?_fields=id,title`.
3. Thêm validation: nếu `id` là số âm → trả về 400 Bad Request.

---

### Buổi 4: [HOW] — Dynamic POST, PUT, PATCH, DELETE

**Thời gian:** ~2.5 giờ | **Hình thức:** Coding Together

#### 🎯 Mục tiêu học viên đạt được
- Hoàn thiện bộ CRUD đầy đủ cho mọi resource.
- Phân biệt rõ PUT (thay toàn bộ) vs PATCH (cập nhật một phần).
- Xử lý Body Request an toàn.

#### 📖 Nội dung lý thuyết (20 phút)
**PUT vs PATCH:**
```
Ẩn dụ: Sửa hồ sơ nhân viên
- PUT: Xé tờ hồ sơ cũ → điền lại TOÀN BỘ từ đầu.
- PATCH: Lấy bút → gạch chỉ chỗ cần sửa, giữ nguyên phần còn lại.
```

#### 💻 Coding (90 phút)

**POST — Tạo mới**
```typescript
export async function create(req: Request, res: Response) {
  const { resource } = req.params;
  const body = req.body; // Dữ liệu từ client (đã parse nhờ express.json())

  if (!(await tableExists(resource))) {
    return res.status(404).json({ error: `Resource '${resource}' not found` });
  }

  // knex tự build câu INSERT INTO và trả về bản ghi vừa tạo
  const [newItem] = await db(resource).insert(body).returning('*');
  return res.status(201).json(newItem);
}
```

**PUT — Thay thế toàn bộ**
```typescript
export async function replace(req: Request, res: Response) {
  const { resource, id } = req.params;
  const body = req.body;

  if (!(await tableExists(resource))) {
    return res.status(404).json({ error: `Resource '${resource}' not found` });
  }

  // Lấy danh sách cột của bảng từ information_schema
  const columns = await db('information_schema.columns')
    .where({ table_name: resource, table_schema: 'public' })
    .pluck('column_name');

  // Xây object với TẤT CẢ cột: cột không có trong body → null (ghi đè)
  const fullUpdate: Record<string, unknown> = {};
  columns.forEach((col) => {
    if (col !== 'id') fullUpdate[col] = body[col] ?? null;
  });

  const [updated] = await db(resource)
    .where({ id: Number(id) })
    .update(fullUpdate)
    .returning('*');

  if (!updated) return res.status(404).json({ error: 'Không tìm thấy record' });
  return res.status(200).json(updated);
}
```

**PATCH — Cập nhật một phần**
```typescript
export async function update(req: Request, res: Response) {
  const { resource, id } = req.params;
  const body = req.body; // Chỉ chứa các field muốn cập nhật → merge với data cũ

  if (!(await tableExists(resource))) {
    return res.status(404).json({ error: `Resource '${resource}' not found` });
  }

  const [updated] = await db(resource)
    .where({ id: Number(id) })
    .update(body) // knex chỉ update đúng các field trong body
    .returning('*');

  if (!updated) return res.status(404).json({ error: 'Không tìm thấy record' });
  return res.status(200).json(updated);
}
```

**DELETE — Xóa**
```typescript
export async function remove(req: Request, res: Response) {
  const { resource, id } = req.params;

  if (!(await tableExists(resource))) {
    return res.status(404).json({ error: `Resource '${resource}' not found` });
  }

  const deleted = await db(resource).where({ id: Number(id) }).delete();

  if (!deleted) return res.status(404).json({ error: 'Không tìm thấy record' });
  return res.status(204).send(); // 204 = OK, không có body
}
```

#### 📝 Bài tập cuối buổi
1. Thêm `updated_at = new Date()` vào PATCH và PUT request.
2. Không cho phép client cập nhật field `id` (loại bỏ khỏi body trước khi update).
3. Test lần lượt: POST → GET (xem có không?) → PATCH → PUT → GET (so sánh?) → DELETE.

---

### Buổi 5: [WHAT IF] — Advanced GET: Pagination & Sorting

**Thời gian:** ~2.5 giờ | **Hình thức:** Coding Together

#### 🎯 Mục tiêu học viên đạt được
- Hiểu tại sao cần Pagination (trả về 1 triệu record là sai).
- Implement đúng chuẩn `_page`, `_limit`, `_sort`, `_order`.
- Trả về header `X-Total-Count` để frontend biết tổng số bản ghi.

#### 📖 Nội dung lý thuyết (30 phút)
**Tại sao cần Pagination?**
```
Ẩn dụ: Thư viện có 100,000 cuốn sách. Khách hỏi "cho tôi xem hết đi".
Bạn không thể vác ra 100,000 cuốn một lúc — phải chia theo trang!
→ Pagination = Chia nhỏ dữ liệu → Server nhẹ, Client nhanh.
```

**SQL LIMIT & OFFSET:**
```sql
-- Trang 1, mỗi trang 10 bản ghi
SELECT * FROM posts LIMIT 10 OFFSET 0;

-- Trang 2
SELECT * FROM posts LIMIT 10 OFFSET 10;

-- Công thức: OFFSET = (page - 1) * limit
```

#### 💻 Coding (90 phút)

```typescript
// src/utils/queryBuilder.ts

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface SortOptions {
  sort: string;
  order: 'asc' | 'desc';
}

// Hàm parse query string và trả về options đã validate
export function parsePagination(query: Record<string, string>): PaginationOptions {
  const page = Math.max(1, parseInt(query._page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(query._limit || '10', 10)));
  // Giới hạn max 100 bản ghi/trang → tránh DDoS
  return { page, limit };
}

export function parseSorting(query: Record<string, string>): SortOptions {
  return {
    sort: query._sort || 'id',
    order: query._order === 'desc' ? 'desc' : 'asc', // Mặc định asc
  };
}
```

```typescript
// Cập nhật hàm getAll trong controller
export async function getAll(req: Request, res: Response) {
  const { resource } = req.params;
  const { page, limit } = parsePagination(req.query as Record<string, string>);
  const { sort, order } = parseSorting(req.query as Record<string, string>);
  const offset = (page - 1) * limit;

  if (!(await tableExists(resource))) {
    return res.status(404).json({ error: `Resource '${resource}' not found` });
  }

  // Chạy 2 query song song: lấy data + đếm tổng số
  const [data, [{ count }]] = await Promise.all([
    db(resource).select('*').orderBy(sort, order).limit(limit).offset(offset),
    db(resource).count('id as count'),
  ]);

  // Trả về total trong header (giống json-server gốc)
  res.setHeader('X-Total-Count', count);
  res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count');
  return res.status(200).json(data);
}
```

#### 🧪 Test
```bash
# Phân trang: trang 2, mỗi trang 5 bản ghi
GET /posts?_page=2&_limit=5

# Sắp xếp theo views, mới nhất lên đầu
GET /posts?_sort=views&_order=desc

# Kết hợp cả hai
GET /posts?_page=1&_limit=10&_sort=created_at&_order=desc
```

---

### Buổi 7: [WHAT IF] — Advanced GET: Filtering & Full-text Search

**Thời gian:** ~2.5 giờ | **Hình thức:** Coding Together

#### 🎯 Mục tiêu học viên đạt được
- Build Dynamic WHERE clause từ query string.
- Implement các toán tử lọc: `_gte`, `_lte`, `_ne`, `_like`.
- Tìm kiếm toàn văn (`q=`) trên tất cả cột text.

#### 💻 Coding (90 phút)

```typescript
// src/utils/queryBuilder.ts (bổ sung)

const RESERVED_KEYS = ['_page', '_limit', '_sort', '_order', '_expand', '_embed', 'q'];
const OPERATORS: Record<string, string> = {
  _gte: '>=',
  _lte: '<=',
  _ne: '!=',
  _like: 'like',
};

// Parse query string → build WHERE clause động
export function buildWhereClause(
  query: Record<string, string>,
  knexQuery: ReturnType<typeof db>
) {
  for (const [key, value] of Object.entries(query)) {
    if (RESERVED_KEYS.includes(key)) continue; // Bỏ qua các key đặc biệt

    // Kiểm tra key có toán tử cuối không (VD: "views_gte")
    const operatorEntry = Object.entries(OPERATORS).find(([op]) => key.endsWith(op));

    if (operatorEntry) {
      const [suffix, sqlOp] = operatorEntry;
      const column = key.slice(0, -suffix.length); // "views_gte" → "views"
      knexQuery.where(column, sqlOp, value);
    } else {
      knexQuery.where(key, value); // Lọc chính xác: WHERE key = value
    }
  }
}

// Full-text search trên tất cả cột text của bảng
export async function buildSearchClause(
  resource: string,
  keyword: string,
  knexQuery: ReturnType<typeof db>
) {
  // Lấy danh sách cột có kiểu text/varchar từ information_schema
  const textColumns = await db('information_schema.columns')
    .where({ table_name: resource, table_schema: 'public' })
    .whereIn('data_type', ['text', 'character varying', 'character'])
    .pluck('column_name');

  // Với mỗi cột text, thêm điều kiện ILIKE (case-insensitive LIKE)
  knexQuery.where((builder) => {
    textColumns.forEach((col) => {
      builder.orWhere(col, 'ilike', `%${keyword}%`);
    });
  });
}
```

#### 🧪 Test
```bash
# Lọc chính xác
GET /posts?status=published

# Lọc theo khoảng
GET /products?price_gte=100&price_lte=500

# Lọc khác
GET /users?age_ne=18

# Full-text search
GET /posts?q=nodejs   # Tìm "nodejs" trong TẤT CẢ cột text của bảng posts
```

---

### Buổi 7: [HOW] — Relationship: Expand (Lấy dữ liệu cha)

**Thời gian:** ~3 giờ | **Hình thức:** Coding Together

#### 🎯 Mục tiêu học viên đạt được
- Hiểu khái niệm Foreign Key và quan hệ 1-N.
- Implement tính năng `_expand` giống json-server.
- Thực hiện sub-query để join dữ liệu bảng cha vào kết quả.

#### 📖 Nội dung lý thuyết (40 phút)
**Quan hệ giữa các bảng:**
```
Ví dụ: Bảng posts có cột user_id → có nghĩa mỗi post thuộc về 1 user.
Convention: <tên_bảng_cha>_id → post.user_id references users.id.

_expand hoạt động thế nào:
- Client: GET /posts?_expand=user
- Server: Lấy danh sách posts, phát hiện có cột user_id,
          query bảng users với id tương ứng,
          đính kèm object user vào mỗi post.
```

#### 💻 Coding (100 phút)

```typescript
// src/utils/relations.ts
import { db } from '../db/knex';

// _expand=user → tìm cột user_id trong bảng resource
// → query bảng users → đính kèm object user vào từng record
export async function applyExpand(
  resource: string,
  expandParam: string, // VD: "user"
  data: Record<string, unknown>[]
): Promise<Record<string, unknown>[]> {
  const foreignKey = `${expandParam}_id`; // "user" → "user_id"
  const foreignTable = `${expandParam}s`; // "user" → "users" (convention số nhiều)

  // Lấy danh sách IDs cần query (tránh N+1 query problem)
  const ids = [...new Set(data.map((row) => row[foreignKey]))].filter(Boolean);
  if (ids.length === 0) return data;

  // 1 query lấy toàn bộ parents → không bị N+1
  const parents = await db(foreignTable).whereIn('id', ids as number[]);
  const parentMap = new Map(parents.map((p) => [p.id, p]));

  // Đính kèm parent vào từng record con
  return data.map((row) => ({
    ...row,
    [expandParam]: parentMap.get(row[foreignKey] as number) ?? null,
  }));
}
```

---

### Buổi 8: [HOW] — Relationship: Embed (Lấy dữ liệu con)

**Thời gian:** ~3 giờ | **Hình thức:** Coding Together

#### 🎯 Mục tiêu học viên đạt được
- Implement tính năng `_embed` để lấy danh sách bản ghi con.
- Tối ưu N+1 Query Problem bằng cách batch query.

#### 📖 Nội dung lý thuyết (40 phút)
```
_embed hoạt động thế nào:
- Client: GET /users?_embed=posts
- Server: Lấy danh sách users,
          với mỗi user lấy các posts có user_id = user.id,
          đính kèm mảng posts vào mỗi user object.

⚠️ N+1 Query Problem:
Nếu có 100 users, làm 100 query riêng lẻ để lấy posts → rất chậm!
Giải pháp: 1 query lấy tất cả posts có user_id IN (1,2,...,100).
```

#### 💻 Coding (100 phút)

```typescript
export async function applyEmbed(
  resource: string,
  embedParam: string, // VD: "posts"
  data: Record<string, unknown>[]
): Promise<Record<string, unknown>[]> {
  // Convention: bảng con có cột <resource singular>_id
  // "users" → "user_id"
  const resourceSingular = resource.endsWith('s')
    ? resource.slice(0, -1)
    : resource;
  const foreignKey = `${resourceSingular}_id`; // user_id

  const parentIds = data.map((row) => row['id']) as number[];
  if (parentIds.length === 0) return data;

  // 1 query lấy TẤT CẢ children của tất cả parents
  const children = await db(embedParam).whereIn(foreignKey, parentIds);

  // Group children theo foreignKey để đính kèm vào đúng parent
  const childrenByParentId = children.reduce(
    (acc, child) => {
      const pId = child[foreignKey] as number;
      if (!acc[pId]) acc[pId] = [];
      acc[pId].push(child);
      return acc;
    },
    {} as Record<number, unknown[]>
  );

  return data.map((row) => ({
    ...row,
    [embedParam]: childrenByParentId[row['id'] as number] ?? [],
  }));
}
```

---

### Buổi 9: [HOW] — Authentication & Authorization (JWT & Role-based)

**Thời gian:** ~3 giờ | **Hình thức:** Coding Together

#### 🎯 Mục tiêu học viên đạt được
- Phân biệt rõ AuthN (Xác thực) và AuthZ (Phân quyền).
- Tự tay implement luồng Đăng nhập, cấp phát token JWT.
- Xây dựng Middleware để bảo vệ Route và phân quyền Role-based (VD: Chỉ Admin mới được xóa bài).

#### 📖 Nội dung lý thuyết (40 phút)
**Authentication vs Authorization:**
```text
Ẩn dụ: Vé vào cửa công viên nước.
- AuthN: Bạn đưa tiền (Email/Password) ở quầy bán vé. Nhân viên kiểm tra và đeo cho bạn Vòng Tay (JWT).
- AuthZ: Bạn muốn chơi cầu trượt cảm giác mạnh (DELETE /posts), người soát vé chỉ cần nhìn Vòng Tay của bạn xem có đúng màu (Role Admin) hay không, không bắt bạn phải ra quầy mua vé lại.
```

**Cấu trúc JWT:** Header, Payload, Signature. (Giải thích tại sao client và hacker đọc được payload nhưng không thể tự chế tạo/giả mạo được do không có Secret Key).

#### 💻 Coding (110 phút)

**Cài đặt thư viện**
```bash
npm install jsonwebtoken bcrypt
npm install -D @types/jsonwebtoken @types/bcrypt
```

**1. Hàm Hash Password và Generate Token (`src/utils/auth.ts`)**
```typescript
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export const hashPassword = (password: string) => bcrypt.hash(password, 10);
export const comparePassword = (password: string, hash: string) => bcrypt.compare(password, hash);
export const generateToken = (payload: object) => jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
```

**2. Route Login**
```typescript
// src/routes/auth.route.ts
import { Router } from 'express';
import { db } from '../db/knex';
import { comparePassword, generateToken } from '../utils/auth';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await db('users').where({ email }).first();
  
  if (!user || !(await comparePassword(password, user.password))) {
    return res.status(401).json({ error: 'Sai email hoặc mật khẩu' });
  }

  // Payload không lọt thông tin nhạy cảm (không để password vào đây)
  const token = generateToken({ id: user.id, role: user.role });
  return res.json({ token, role: user.role });
});

export default router;
```

**3. Authentication Middleware (`src/middlewares/auth.middleware.ts`)**
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

declare global {
  namespace Express {
    interface Request {
      user?: any; // Mở rộng Request để chứa payload user
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Thiếu hoặc sai định dạng Token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET); // Xác thực chữ ký và lấy payload
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
  }
}
```

**4. Authorization Middleware**
```typescript
export function authorize(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Chỉ cho phép đi qua nếu user có role nằm trong danh sách roles truyền vào
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Bạn không có quyền truy cập' });
    }
    next();
  };
}
```

#### 📝 Bài tập cuối buổi
1. Tự thêm data mẫu vào bảng `users` với cột `email`, `password` (đã hash), `role` (`admin` hoặc `user`).
2. Thêm middleware `authenticate` vào các route tạo/sửa/xóa (POST, PUT, PATCH, DELETE).
3. Thêm middleware `authorize(['admin'])` vào route DELETE.
4. Dùng Postman test: Xóa bài viết mà không có token -> Lỗi 401. Có token nhưng role "user" -> Lỗi 403.

---

### Buổi 10: [WHAT IF] — Error Handling, Validation & Testing

**Thời gian:** ~3 giờ | **Hình thức:** Coding Together

#### 🎯 Mục tiêu học viên đạt được
- Xây dựng Global Error Handler — server không bao giờ crash.
- Validate dữ liệu đầu vào bằng Zod.
- Viết Integration Test với Vitest + Supertest.

#### 📖 Nội dung lý thuyết (30 phút)
**Tại sao cần Global Error Handler?**
```
Nếu không có Error Handler:
- Một async function throw error mà không catch
  → Express không biết xử lý → Server crash hoàn toàn!

Global Error Handler = Lớp BẢO HIỂM CUỐI CÙNG:
app.use((err, req, res, next) => { ... })
```

#### 💻 Coding (100 phút)

**Global Error Handler**
```typescript
// src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Middleware lỗi phải có đúng 4 tham số (err, req, res, next)
export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  // Mọi lỗi không xác định trả về 500
  console.error(err); // Log lại để debug
  return res.status(500).json({ error: 'Internal Server Error' });
}
```

**Integration Test với Supertest**
```typescript
// src/__tests__/resource.test.ts
import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../index';

describe('GET /:resource', () => {
  it('trả về 200 và mảng data khi bảng tồn tại', async () => {
    const res = await request(app).get('/posts');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('trả về 404 khi bảng không tồn tại', async () => {
    const res = await request(app).get('/nonexistent_table');
    expect(res.status).toBe(404);
  });

  it('trả về 400 khi ID không phải số', async () => {
    const res = await request(app).get('/posts/abc');
    expect(res.status).toBe(400);
  });
});
```

---

### Buổi 11: [WHAT/HOW] — Auto-Migration hoàn chỉnh & Tổng kết

**Thời gian:** ~3 giờ | **Hình thức:** Coding Together

#### 🎯 Mục tiêu học viên đạt được
- Hoàn thiện logic tự động tạo bảng từ file `db.json` với đầy đủ kiểu dữ liệu.
- Ứng dụng hoạt động hoàn chỉnh như json-server gốc nhưng dùng PostgreSQL.

#### 💻 Coding (120 phút)

**Inference kiểu dữ liệu tự động**
```typescript
// src/db/migrate.ts (hoàn chỉnh)
function inferColumnType(value: unknown): string {
  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'integer' : 'float';
  }
  if (typeof value === 'boolean') return 'boolean';
  if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))) {
    return 'datetime';
  }
  return 'text'; // Mặc định
}

export async function runMigration(dbJsonPath = './db.json') {
  if (!fs.existsSync(dbJsonPath)) {
    console.log('Không tìm thấy db.json, bỏ qua migration.');
    return;
  }
  const schema = JSON.parse(fs.readFileSync(dbJsonPath, 'utf-8'));

  for (const [tableName, rows] of Object.entries(schema)) {
    const data = rows as Record<string, unknown>[];
    const exists = await db.schema.hasTable(tableName);

    if (!exists) {
      const sample = data[0] || {};
      await db.schema.createTable(tableName, (table) => {
        table.increments('id').primary();
        for (const [col, val] of Object.entries(sample)) {
          if (col === 'id') continue;
          const colType = inferColumnType(val);
          if (colType === 'integer') table.integer(col).nullable();
          else if (colType === 'float') table.float(col).nullable();
          else if (colType === 'boolean') table.boolean(col).nullable();
          else if (colType === 'datetime') table.timestamp(col).nullable();
          else table.text(col).nullable();
        }
        table.timestamps(true, true); // created_at, updated_at tự động
      });
      console.log(`✅ Tạo bảng "${tableName}" thành công`);

      // Insert dữ liệu mẫu
      if (data.length > 0) {
        const cleanData = data.map(({ id, ...rest }) => rest); // Bỏ id thủ công
        await db(tableName).insert(cleanData);
        console.log(`📥 Đã insert ${cleanData.length} bản ghi vào "${tableName}"`);
      }
    }
  }
}
```

---

### Buổi 12: [HOW] — Docker hóa ứng dụng

**Thời gian:** ~2.5 giờ | **Hình thức:** Coding Together

#### 🎯 Mục tiêu học viên đạt được
- Hiểu khái niệm Docker Image vs Container.
- Viết được `Dockerfile` cho Node.js app.
- Dùng `docker-compose` để chạy App + PostgreSQL cùng nhau.

#### 📖 Nội dung lý thuyết (30 phút)
```
Ẩn dụ: Docker như QUY TRÌNH ĐÓNG GÓI của nhà máy sản xuất.
- Image: Bản thiết kế/công thức (như file ISO).
- Container: Sản phẩm được chạy từ bản thiết kế đó.
- docker-compose: Quản lý nhiều containers chạy cùng nhau.
```

#### 💻 Coding (90 phút)

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package.json TRƯỚC để tận dụng Docker layer cache
# → Khi chỉ đổi code (không đổi dependencies), bước npm ci được cache
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build  # Compile TypeScript → JavaScript

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

```yaml
# docker-compose.yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=db        # Tên service PostgreSQL
      - DB_PORT=5432
      - DB_NAME=pg_json_server
      - DB_USER=postgres
      - DB_PASSWORD=postgres
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=pg_json_server
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data  # Giữ data khi restart

volumes:
  postgres_data:
```

---

### Buổi 13: [WHAT IF] — Deploy lên Cloud

**Thời gian:** ~2.5 giờ | **Hình thức:** Live Demo + Thực hành

#### 🎯 Mục tiêu học viên đạt được
- Deploy PostgreSQL lên Supabase (miễn phí).
- Deploy Node.js app lên Render/Railway (miễn phí).
- Cấu hình Environment Variables trên production.

#### 📖 Nội dung (60 phút)
1. Tạo PostgreSQL database trên **Supabase** → lấy connection string.
2. Push code lên **GitHub** → kết nối với **Render**.
3. Cấu hình biến môi trường production trên Render Dashboard.
4. Trigger deploy và test live URL.

#### 🧪 Kiểm tra production
```bash
# Thay <your-app>.onrender.com bằng URL thực
curl https://<your-app>.onrender.com/health
curl https://<your-app>.onrender.com/posts
```

#### 📝 Bài tập cuối khoá
- Thêm một tính năng tùy chọn vào ứng dụng (gợi ý: caching bằng Redis, authentication JWT cơ bản, rate limiting).
- Viết README.md đầy đủ: hướng dẫn cài đặt, chạy local, deploy.

---

## 📌 MỘT SỐ LƯU Ý QUAN TRỌNG CHO GIẢNG VIÊN

### 1. Principle: Analogy First
- **Dynamic Routing:** Ví như "chú lễ tân khách sạn" — khách hỏi phòng nào, chú ấy tự tìm chìa khóa đúng phòng đó.
- **Query Builder:** Ví như "người phiên dịch" — bạn ra lệnh bằng JavaScript, nó dịch sang SQL đúng cú pháp và an toàn.
- **Middleware:** Ví như "trạm kiểm soát" — mọi request phải qua trước khi đến đích.

### 2. Trade-offs cần nhấn mạnh
- Dynamic API linh hoạt nhưng mất đi type-safety ở tầng model.
- Query Builder an toàn hơn string concat nhưng phức tạp hơn ORM.
- Docker giải quyết "works on my machine" nhưng thêm overhead học tập.

### 3. Học liệu chuẩn bị
- File `db.json` mẫu đa dạng: `users`, `posts`, `comments` có quan hệ với nhau.
- Postman Collection đầy đủ các test case (GET, POST, filter, pagination, expand, embed).
- Starter Template đã config sẵn ESLint + Prettier.

### 4. Bảo mật — Điều không được bỏ qua
- **Luôn** whitelist tên bảng bằng `information_schema` trước khi query.
- **Không bao giờ** nối chuỗi trực tiếp (string concatenation) để build SQL.
- Validation ID: kiểm tra `isInteger` trước khi truyền vào query.

---

*Made by Anh Tu - Share to be share*