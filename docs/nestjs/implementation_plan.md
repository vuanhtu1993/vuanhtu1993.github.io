# Kế Hoạch Tái Cấu Trúc Học Liệu NestJS

## Bối Cảnh & Vấn Đề

Khoá học NestJS hiện tại trong `docs/nestjs/` có **4 phần** với tổng cộng **22 files** được tạo bởi AI, chưa được kiểm chứng bởi bất kỳ nguồn uy tín nào. Nguồn tham chiếu chính thức `sources/documentations/docs.nestjs.com/` đã được crawl đầy đủ và chứa **90+ files** gốc từ docs.nestjs.com.

**Mục tiêu**: Rebuild toàn bộ học liệu theo **scope đầy đủ** — cover từ Fundamentals → Techniques → GraphQL → Microservices → WebSocket → OpenAPI. Lấy nguồn chính thức làm nền, giữ lại văn phong sư phạm của Anh Tú.

---

## Quyết Định Đã Xác Nhận

| # | Câu hỏi | Quyết định |
|---|---------|------------|
| 1 | Xử lý files AI-gen cũ | **Option B** — Verify & Keep cẩn thận. Giữ file chất lượng cao, cross-check từng claim với nguồn |
| 2 | Scope khoá học | **Full coverage** — REST API + GraphQL + Microservices + WebSocket + OpenAPI |
| 3 | Thứ tự thực thi | Verify existing trước → Build new content theo module |

---

## Nguyên Tắc Tái Cấu Trúc

> [!IMPORTANT]
> **Source-First**: Mọi nội dung phải có nguồn trực tiếp từ `sources/documentations/docs.nestjs.com/`. Ghi rõ `source_file` trong frontmatter của từng bài.

> [!NOTE]
> **Preserve Style**: Giữ nguyên văn phong sư phạm: Hook → Analogy → Deep Dive → Code Example → Pitfalls → Tổng kết. Các file chất lượng cao (như `04-aop.mdx`) → verify + giữ lại.

> [!WARNING]
> **Verify Rule**: Khi giữ lại file AI-gen, mỗi code example và mỗi claim kỹ thuật phải được đánh dấu trạng thái: `✅ verified`, `⚠️ needs-update`, hoặc `❌ incorrect`.

---

## Bảng Tham Chiếu Nội Dung & Nguồn

### 📦 Group 1: Getting Started

| # | Bài học (docs/nestjs) | File nguồn (sources/…) | Size | Trạng thái hiện tại |
|---|----------------------|------------------------|------|---------------------|
| 00.1 | Tại Sao Chọn NestJS? | `index.md` | 4KB | ❌ Chưa có |
| 00.2 | Cài Đặt & First Steps | `first-steps.md` | 8KB | ❌ Chưa có |
| 00.3 | Làm Chủ NestJS CLI | `cli/overview.md` + `cli/usages.md` + `cli/scripts.md` | 23KB | ❌ Chưa có |
| 00.4 | Standalone App & Deploy | `standalone-applications.md` + `deployment.md` | 24KB | ❌ Chưa có |

---

### 📦 Group 2: OOP Foundation *(Verify & Keep)*

| # | Bài học (docs/nestjs) | File nguồn (sources/…) | Size | Trạng thái hiện tại |
|---|----------------------|------------------------|------|---------------------|
| 01.1 | OOP Foundation | `01-oop/01-foundation.md` | ~15KB | ✅ Rebuilt & Verified (Chuẩn create-tech-lecture) |
| 01.2 | Encapsulation & Decorators | `01-oop/02-encapsulation-decorators.md` | ~16KB | ✅ Rebuilt & Verified (Chuẩn create-tech-lecture) |
| 01.3 | Interface & Abstract | `01-oop/03-interface-abstract.md` | ~16KB | ✅ Rebuilt & Verified (Chuẩn create-tech-lecture) |
| 01.4 | Dependency Injection | `01-oop/04-dependency-injection.md` | ~18KB | ✅ Rebuilt & Verified (Chuẩn create-tech-lecture) |
| 01.5 | SOLID Principles | `01-oop/05-solid.md` | ~18KB | ✅ Rebuilt & Verified (Chuẩn create-tech-lecture) |
| 01.6 | Design Patterns | `01-oop/06-design-patterns.md` | ~18KB | ✅ Rebuilt & Verified (Chuẩn create-tech-lecture) |

---

### 📦 Group 3: Building Blocks — HTTP Layer *(Rebuild)*

| # | Bài học (docs/nestjs) | File nguồn (sources/…) | Size | Trạng thái hiện tại |
|---|----------------------|------------------------|------|---------------------|
| 02.1 | Modules | `modules.md` | 13KB | ❌ Rebuild (hiện có `01-ioc.md` thiếu nhiều) |
| 02.2 | Controllers | `controllers.md` | 27KB | ❌ Chưa có bài riêng |
| 02.3 | Providers | `providers.md` | 10KB | ❌ Rebuild (hiện có `02-providers-deep-dive.mdx`) |
| 02.4 | Middleware | `middleware.md` | 12KB | ❌ Chưa có bài riêng |

---

### 📦 Group 4: Core Fundamentals — IoC & DI *(Rebuild)*

| # | Bài học (docs/nestjs) | File nguồn (sources/…) | Size | Trạng thái hiện tại |
|---|----------------------|------------------------|------|---------------------|
| 03.1 | Custom Providers | `fundamentals/custom-providers.md` | 17KB | ❌ Rebuild (hiện có `03-dynamic-module.mdx` sai scope) |
| 03.2 | Dynamic Modules | `fundamentals/dynamic-modules.md` | 29KB | ❌ Rebuild |
| 03.3 | Injection Scopes | `fundamentals/injection-scopes.md` | 14KB | ❌ Chưa có |
| 03.4 | Circular Dependency | `fundamentals/circular-dependency.md` | 4KB | ❌ Chưa có |
| 03.5 | Module Reference | `fundamentals/module-ref.md` | 9KB | ❌ Chưa có |
| 03.6 | Lazy Loading Modules | `fundamentals/lazy-loading-modules.md` | 7KB | ❌ Chưa có |
| 03.7 | Execution Context | `fundamentals/execution-context.md` | 15KB | ❌ Chưa có |
| 03.8 | Lifecycle Events | `fundamentals/lifecycle-events.md` | 8KB | ❌ Chưa có |
| 03.9 | Async Providers | `fundamentals/async-providers.md` | 2KB | ❌ Chưa có |
| 03.10 | Discovery Service | `fundamentals/discovery-service.md` | 5KB | ❌ Chưa có |

---

### 📦 Group 5: AOP Pipeline *(Verify & Keep + Bổ Sung)*

| # | Bài học (docs/nestjs) | File nguồn (sources/…) | Size | Trạng thái hiện tại |
|---|----------------------|------------------------|------|---------------------|
| 04.0 | AOP Overview & Request Lifecycle | `02-core-concepts/04-aop.mdx` *(AI-gen)* | 29KB | ✅ Chất lượng cao → Verify cẩn thận |
| 04.1 | Guards | `guards.md` + `microservices/guards.md` + `websockets/guards.md` | 14KB | ❌ Chưa có bài riêng |
| 04.2 | Interceptors | `interceptors.md` + `microservices/interceptors.md` | 16KB | ❌ Chưa có bài riêng |
| 04.3 | Pipes | `pipes.md` + `microservices/pipes.md` | 25KB | ❌ Chưa có bài riêng |
| 04.4 | Exception Filters | `exception-filters.md` + `microservices/exception-filters.md` | 19KB | ❌ Rebuild (hiện có `05-exception-filter.mdx` sơ sài) |
| 04.5 | Custom Decorators | `custom-decorators.md` | 8KB | ❌ Chưa có bài riêng |

---

### 📦 Group 6: Techniques — Kỹ Thuật Thực Chiến *(Mới hoàn toàn)*

| # | Bài học (docs/nestjs) | File nguồn (sources/…) | Size | Trạng thái hiện tại |
|---|----------------------|------------------------|------|---------------------|
| 05.1 | Configuration | `techniques/configuration.md` | 30KB | ❌ Chưa có |
| 05.2 | Validation | `techniques/validation.md` | 17KB | ❌ Chưa có |
| 05.3 | Database (TypeORM) | `techniques/database.md` + `recipes/sql-typeorm.md` | 45KB+5KB | ❌ Chưa có |
| 05.4 | Database (MongoDB) | `techniques/mongodb.md` | 26KB | ❌ Chưa có |
| 05.5 | Database (MikroORM) | `recipes/mikroorm.md` | 10KB | ❌ Chưa có |
| 05.6 | Caching | `techniques/caching.md` | 13KB | ❌ Chưa có |
| 05.7 | Serialization | `techniques/serialization.md` | 8KB | ❌ Chưa có |
| 05.8 | Versioning | `techniques/versioning.md` | 12KB | ❌ Chưa có |
| 05.9 | Task Scheduling | `techniques/task-scheduling.md` | 16KB | ❌ Chưa có |
| 05.10 | Queues (Bull/BullMQ) | `techniques/queues.md` | 45KB | ❌ Chưa có |
| 05.11 | Logger | `techniques/logger.md` + `03-tooling/02-logger.md` *(AI-gen)* | 21KB | ⚠️ Có bài AI-gen → Verify + Rebuild từ nguồn |
| 05.12 | File Upload | `techniques/file-upload.md` | 13KB | ❌ Chưa có |
| 05.13 | HTTP Module | `techniques/http-module.md` | 7KB | ❌ Chưa có |
| 05.14 | MVC | `techniques/mvc.md` | 7KB | ❌ Chưa có |
| 05.15 | Server-Sent Events | `techniques/server-sent-events.md` | 4KB | ❌ Chưa có |
| 05.16 | Streaming Files | `techniques/streaming-files.md` | 4KB | ❌ Chưa có |
| 05.17 | Events | `techniques/events.md` | 7KB | ❌ Chưa có |
| 05.18 | Compression | `techniques/compression.md` | 3KB | ❌ Chưa có |
| 05.19 | Performance (Fastify) | `techniques/performance.md` | 6KB | ❌ Chưa có |
| 05.20 | Cookies & Session | `techniques/cookies.md` + `techniques/session.md` | 11KB | ❌ Chưa có |
| 05.21 | Hot Reload (SWC) | `recipes/hot-reload.md` + `recipes/swc.md` | 20KB | ❌ Chưa có |
| 05.22 | Debug với VSCode | `03-tooling/01-debug-vscode.mdx` *(AI-gen)* | 8KB | ⚠️ Có bài AI-gen → Verify |
| 05.23 | CRUD Generator | `recipes/crud-generator.md` | 6KB | ❌ Chưa có |
| 05.24 | REPL Mode | `recipes/repl.md` | 5KB | ❌ Chưa có |

---

### 📦 Group 7: Security *(Mới hoàn toàn)*

| # | Bài học (docs/nestjs) | File nguồn (sources/…) | Size | Trạng thái hiện tại |
|---|----------------------|------------------------|------|---------------------|
| 06.1 | Authentication (Passport) | `security/authentication.md` + `recipes/passport.md` | 21KB+46KB | ❌ Chưa có |
| 06.2 | Authorization (RBAC/ABAC) | `security/authorization.md` | 19KB | ❌ Chưa có |
| 06.3 | Encryption & Hashing | `security/encryption-and-hashing.md` | 3KB | ❌ Chưa có |
| 06.4 | CORS | `security/cors.md` | 2KB | ❌ Chưa có |
| 06.5 | CSRF Protection | `security/csrf.md` | 2KB | ❌ Chưa có |
| 06.6 | Helmet | `security/helmet.md` | 4KB | ❌ Chưa có |
| 06.7 | Rate Limiting | `security/rate-limiting.md` | 15KB | ❌ Chưa có |

---

### 📦 Group 8: GraphQL *(Mới hoàn toàn)*

| # | Bài học (docs/nestjs) | File nguồn (sources/…) | Size | Trạng thái hiện tại |
|---|----------------------|------------------------|------|---------------------|
| 07.1 | Quick Start (Code-first vs Schema-first) | `graphql/quick-start.md` | 18KB | ❌ Chưa có |
| 07.2 | Resolvers | `graphql/resolvers.md` | 30KB | ❌ Chưa có |
| 07.3 | Mutations | `graphql/mutations.md` | 4KB | ❌ Chưa có |
| 07.4 | Subscriptions | `graphql/subscriptions.md` | 22KB | ❌ Chưa có |
| 07.5 | Scalars & Enums | `graphql/scalars.md` + `graphql/unions-and-enums.md` | 16KB | ❌ Chưa có |
| 07.6 | Directives | `graphql/directives.md` | 4KB | ❌ Chưa có |
| 07.7 | Interfaces | `graphql/interfaces.md` | 4KB | ❌ Chưa có |
| 07.8 | Mapped Types | `graphql/mapped-types.md` | 6KB | ❌ Chưa có |
| 07.9 | Field Middleware | `graphql/field-middleware.md` | 5KB | ❌ Chưa có |
| 07.10 | Complexity | `graphql/complexity.md` | 4KB | ❌ Chưa có |
| 07.11 | Extensions & Plugins | `graphql/extensions.md` + `graphql/plugins.md` | 6KB | ❌ Chưa có |
| 07.12 | CLI Plugin | `graphql/cli-plugin.md` | 7KB | ❌ Chưa có |
| 07.13 | Federation | `graphql/federation.md` | 27KB | ❌ Chưa có |
| 07.14 | Other Features | `graphql/other-features.md` | 7KB | ❌ Chưa có |

---

### 📦 Group 9: WebSocket & Real-time *(Mới hoàn toàn)*

| # | Bài học (docs/nestjs) | File nguồn (sources/…) | Size | Trạng thái hiện tại |
|---|----------------------|------------------------|------|---------------------|
| 08.1 | Gateways | `websockets/gateways.md` | 11KB | ❌ Chưa có |
| 08.2 | Exception Filters, Guards, Pipes | `websockets/exception-filters.md` + `websockets/guards.md` + `websockets/pipes.md` + `websockets/interceptors.md` | 5KB | ❌ Chưa có |
| 08.3 | Custom Adapter | `websockets/adapter.md` | 8KB | ❌ Chưa có |

---

### 📦 Group 10: Microservices *(Mới hoàn toàn)*

| # | Bài học (docs/nestjs) | File nguồn (sources/…) | Size | Trạng thái hiện tại |
|---|----------------------|------------------------|------|---------------------|
| 09.1 | Basics & Transporters | `microservices/basics.md` | 26KB | ❌ Chưa có |
| 09.2 | Redis Transport | `microservices/redis.md` | 8KB | ❌ Chưa có |
| 09.3 | MQTT Transport | `microservices/mqtt.md` | 10KB | ❌ Chưa có |
| 09.4 | NATS Transport | `microservices/nats.md` | 11KB | ❌ Chưa có |
| 09.5 | RabbitMQ Transport | `microservices/rabbitmq.md` | 14KB | ❌ Chưa có |
| 09.6 | Kafka Transport | `microservices/kafka.md` | 26KB | ❌ Chưa có |
| 09.7 | gRPC Transport | `microservices/grpc.md` | 24KB | ❌ Chưa có |
| 09.8 | Custom Transport | `microservices/custom-transport.md` | 13KB | ❌ Chưa có |
| 09.9 | Exception Filters, Guards, Pipes | `microservices/exception-filters.md` + `microservices/guards.md` + `microservices/pipes.md` | 6KB | ❌ Chưa có |

---

### 📦 Group 11: OpenAPI / Swagger *(Mới hoàn toàn)*

| # | Bài học (docs/nestjs) | File nguồn (sources/…) | Size | Trạng thái hiện tại |
|---|----------------------|------------------------|------|---------------------|
| 10.1 | Introduction & Setup | `openapi/introduction.md` | 11KB | ❌ Chưa có |
| 10.2 | Types, Parameters, Operations | `openapi/types-and-parameters.md` + `openapi/operations.md` | 21KB | ❌ Chưa có |
| 10.3 | Mapped Types | `openapi/mapped-types.md` | 4KB | ❌ Chưa có |
| 10.4 | Decorators & Security | `openapi/decorators.md` + `openapi/security.md` | 4KB | ❌ Chưa có |
| 10.5 | CLI Plugin | `openapi/cli-plugin.md` | 12KB | ❌ Chưa có |
| 10.6 | Other Features | `openapi/other-features.md` | 7KB | ❌ Chưa có |

---

### 📦 Group 12: Testing *(Tách riêng — quan trọng)*

| # | Bài học (docs/nestjs) | File nguồn (sources/…) | Size | Trạng thái hiện tại |
|---|----------------------|------------------------|------|---------------------|
| 11.1 | Unit Test & E2E Test | `fundamentals/testing.md` | 22KB | ❌ Chưa có |

---

### 📦 Group 13: Mock Project *(Tái cấu trúc)*

| # | Bài học (docs/nestjs) | Nguồn | Trạng thái hiện tại |
|---|----------------------|-------|---------------------|
| 12.0 | Project Overview & Architecture | Tổng hợp từ khoá học | ⚠️ Có `99-plans/` → cần restructure |
| 12.1 | Setup (Docker + DB) | `techniques/database.md` + `deployment.md` | ⚠️ Tham khảo từ `week1-plan.md` |
| 12.2 | Auth Module | `security/authentication.md` + `recipes/passport.md` | ⚠️ Tham khảo từ `week2-plan.md` |
| 12.3 | Feature Module (CRUD) | `techniques/database.md` + `recipes/crud-generator.md` | ⚠️ Tham khảo từ `week3-plan.md` |
| 12.4 | Real-time (WebSocket) | `websockets/gateways.md` | ⚠️ Tham khảo từ `week4-plan.md` |
| 12.5 | Queue & Background Jobs | `techniques/queues.md` | ⚠️ Tham khảo từ `week5-plan.md` |

---

## Tổng Hợp Số Liệu

| Group | Module | Files hoạch định | Trạng thái |
|-------|--------|-----------------|------------|
| Getting Started | 00-setup | 4 | ❌ 4 mới |
| OOP Foundation | 01-oop | 6 | ⚠️ 6 verify |
| Building Blocks | 02-building-blocks | 4 | ❌ 4 rebuild |
| Core Fundamentals | 03-core-fundamentals | 10 | ❌ 10 mới |
| AOP Pipeline | 04-aop-layer | 6 | ✅1 verify + ❌5 mới |
| Techniques | 05-techniques | 24 | ⚠️2 verify + ❌22 mới |
| Security | 06-security | 7 | ❌ 7 mới |
| GraphQL | 07-graphql | 14 | ❌ 14 mới |
| WebSocket | 08-websockets | 3 | ❌ 3 mới |
| Microservices | 09-microservices | 9 | ❌ 9 mới |
| OpenAPI | 10-openapi | 6 | ❌ 6 mới |
| Testing | 11-testing | 1 | ❌ 1 mới |
| Mock Project | 12-project | 6 | ⚠️ 6 restructure |
| **Tổng** | **13 modules** | **~100 files** | **✅1 / ⚠️16 / ❌83** |

---

## Cấu Trúc Thư Mục Mới

```
docs/nestjs/
├── _category_.json
├── 00-setup/
│   ├── _category_.json
│   ├── 01-why-nestjs.md
│   ├── 02-installation.md
│   └── 03-cli.md
├── 01-oop/                    # ← Verify & Keep
├── 02-building-blocks/
├── 03-core-fundamentals/
├── 04-aop-layer/
├── 05-techniques/
├── 06-security/
├── 07-graphql/
├── 08-websockets/
├── 09-microservices/
├── 10-openapi/
├── 11-testing/
└── 12-project/
```

---

## Kế Hoạch Thực Thi

### Phase 1 — Cleanup (1-2h)
- [x] Archive `99-plans/` → rename thành `12-project/`  
- [x] Rename `02-core-concepts/` → `04-aop-layer/` (giữ `04-aop.mdx`)  
- [x] Tạo các thư mục mới: `00-setup/`, `02-building-blocks/`, `03-core-fundamentals/`, `05-techniques/`, `06-security/`, `07-graphql/`, `08-websockets/`, `09-microservices/`, `10-openapi/`, `11-testing/`  
- [x] Cập nhật tất cả `_category_.json`

### Phase 2 — Verify Existing Files (3-4h)
- [x] Verify & Rebuild `01-oop/` (6 files) → **Kết quả**: ✅ Đã viết lại toàn bộ 6 bài theo đúng chuẩn 4MAT và B1+ Vocabulary. Tẩy sạch emoji.
- [x] Verify & Rebuild `03-tooling/` (2 files: Debugger & Logger) → **Kết quả**: ✅ Đã viết lại toàn bộ 2 bài theo chuẩn 4MAT, xoá sạch emoji, bổ sung Glossary và kiến trúc chuyên sâu.
- [ ] Verify `04-aop.mdx` — cross-check với `guards.md`, `interceptors.md`, `pipes.md`, `exception-filters.md`

### Phase 3 — Build New Content (Ưu tiên theo dependency)
Thứ tự build theo dependency học tập:
1. **00-setup** → 4 files
2. **02-building-blocks** → 4 files  
3. **03-core-fundamentals** → 10 files
4. **04-aop-layer** (new files) → 5 files
5. **11-testing** → 1 file *(cần thiết để test mock project)*
6. **05-techniques** → 24 files *(chia nhỏ, build dần)*
7. **06-security** → 7 files
8. **10-openapi** → 6 files *(swagger docs cho REST API)*
9. **07-graphql** → 14 files
10. **08-websockets** → 3 files
11. **09-microservices** → 9 files *(advanced, build sau cùng)*
12. **12-project** → 6 files *(tổng hợp từ toàn bộ khoá học)*

### Phase 4 — Review & Publish
- Sau mỗi module hoàn thành → chạy `/push-content` workflow

---

*Made by Anh Tu - Share to be share*
