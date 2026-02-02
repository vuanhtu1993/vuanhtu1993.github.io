---
title: "NestJS: Kiến Thức Nền Tảng & Setup Môi Trường"
date: "2026-02-02"
category: "NestJS"
authors: [anhhtus]
tags: [nestjs, beginner]
description: "Tìm hiểu NestJS từ cơ bản đến nâng cao: khái niệm, thành phần chính, cách triển khai, use cases thực tế và best practices để tự động hóa quy trình phát triển phần mềm."
---

# 📚 TUẦN 1: NESTJS FUNDAMENTALS & PROJECT SETUP

> 🎯 **Mục tiêu tuần này**: Hiểu sâu kiến trúc NestJS core, setup môi trường phát triển hoàn chỉnh

<!--truncate-->

---

## 1. CHỨC NĂNG CẦN HOÀN THÀNH

| STT | Chức năng | Mô tả | Output |
|-----|-----------|-------|--------|
| 1.1 | Setup Project | Khởi tạo NestJS project với cấu trúc modules | Project chạy được trên port 3000 |
| 1.2 | Docker Environment | Setup Docker Compose cho PostgreSQL + Redis | Containers running |
| 1.3 | Hiểu NestJS Architecture | Module, Provider, Controller | Code demo đầy đủ |
| 1.4 | Tạo QuizModule (Skeleton) | Cấu trúc module cơ bản | CRUD endpoints skeleton |

---

## 2. KIẾN THỨC CẦN NẮM VỮNG

### 2.1 NestJS Core Concepts

#### 📖 Module
**Khái niệm:**
- Module là container đóng gói các thành phần liên quan (controllers, providers, imports)
- Mỗi NestJS app có ít nhất 1 root module (`AppModule`)
- Modules giúp tổ chức code theo domain/feature

**Core Component:**
```typescript
@Module({
  imports: [],      // Các module khác cần sử dụng
  controllers: [],  // Các controller trong module này
  providers: [],    // Các service, repository...
  exports: [],      // Providers được export cho module khác dùng
})
export class QuizModule {}
```

**Use Cases:**
- Feature module: `QuizModule`, `AuthModule`, `GameModule`
- Shared module: `DatabaseModule`, `LoggerModule`
- Dynamic module: Config module với forRoot/forFeature

**Best Practices:**
- ✅ Mỗi feature có module riêng
- ✅ Tránh circular dependencies giữa modules
- ✅ Export chỉ những gì cần thiết
- ❌ Không để tất cả trong AppModule (god module)

---

#### 📖 Controller
**Khái niệm:**
- Xử lý incoming HTTP requests
- Định nghĩa routes và HTTP methods
- Trả về response cho client

**Core Component:**
```typescript
@Controller('quizzes')  // Route prefix: /quizzes
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get()              // GET /quizzes
  findAll() {
    return this.quizService.findAll();
  }

  @Get(':id')         // GET /quizzes/:id
  findOne(@Param('id') id: string) {
    return this.quizService.findOne(id);
  }

  @Post()             // POST /quizzes
  create(@Body() createQuizDto: CreateQuizDto) {
    return this.quizService.create(createQuizDto);
  }
}
```

**Decorators quan trọng:**
| Decorator | Mục đích |
|-----------|----------|
| `@Controller('path')` | Định nghĩa route prefix |
| `@Get()`, `@Post()`, `@Put()`, `@Delete()` | HTTP methods |
| `@Param('id')` | Lấy URL parameter |
| `@Body()` | Lấy request body |
| `@Query()` | Lấy query string |

**Best Practices:**
- ✅ Controller chỉ xử lý HTTP layer, không chứa business logic
- ✅ Delegate logic cho Service
- ✅ Validate input bằng DTOs + Pipes

---

#### 📖 Provider & Dependency Injection (DI)
**Khái niệm:**
- Provider = class có thể inject vào những class khác
- DI = framework tự động tạo instance và inject dependencies
- Giảm coupling, dễ test, dễ maintain

**Core Component:**
```typescript
// 1. Định nghĩa Provider
@Injectable()  // Decorator đánh dấu là Provider
export class QuizService {
  private quizzes = [];

  findAll() {
    return this.quizzes;
  }

  create(quiz: CreateQuizDto) {
    this.quizzes.push(quiz);
    return quiz;
  }
}

// 2. Đăng ký trong Module
@Module({
  providers: [QuizService],  // Đăng ký Provider
  controllers: [QuizController],
})
export class QuizModule {}

// 3. Inject vào Controller
@Controller('quizzes')
export class QuizController {
  // NestJS tự động inject QuizService instance
  constructor(private readonly quizService: QuizService) {}
}
```

**Cách DI hoạt động:**
```
1. App start → NestJS scan tất cả modules
2. Tìm các class có @Injectable()
3. Tạo container chứa các instances (singleton by default)
4. Khi có class cần dependency → Inject instance từ container
```

**Use Cases:**
- Services: Business logic (`QuizService`, `AuthService`)
- Repositories: Data access layer
- Factories: Tạo objects phức tạp
- Helpers: Utility functions

**Best Practices:**
- ✅ Một service = một responsibility
- ✅ Inject qua constructor (không inject qua property)
- ✅ Sử dụng interfaces + custom providers khi cần linh hoạt

---

### 2.2 NestJS Request Lifecycle

```
Incoming Request
       ↓
    Middleware    → Xử lý trước controller (logging, cors...)
       ↓
     Guards       → Kiểm tra authorization (JWT valid?)
       ↓
   Interceptors   → Transform request (before)
       ↓
     Pipes        → Validate & transform data
       ↓
    Controller    → Handle request
       ↓
    Service       → Business logic
       ↓
   Interceptors   → Transform response (after)
       ↓
  Response sent
```

---

## 3. STEP BY STEP TRIỂN KHAI

### Bước 1: Setup NestJS Project

```bash
# Cài đặt NestJS CLI
npm install -g @nestjs/cli

# Tạo project mới
nest new quiz-realtime
# Chọn npm hoặc yarn

# Cấu trúc project sau khi tạo:
quiz-realtime/
├── src/
│   ├── app.controller.ts    # Root controller (demo)
│   ├── app.module.ts        # Root module
│   ├── app.service.ts       # Root service (demo)
│   └── main.ts              # Entry point
├── test/
├── package.json
└── tsconfig.json
```

### Bước 2: Tạo Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: quiz_postgres
    environment:
      POSTGRES_USER: quiz_user
      POSTGRES_PASSWORD: quiz_password
      POSTGRES_DB: quiz_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: quiz_redis
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

```bash
# Chạy containers
docker-compose up -d

# Kiểm tra
docker ps
```

### Bước 3: Tạo QuizModule

```bash
# Tạo module
nest generate module quiz

# Tạo controller
nest generate controller quiz

# Tạo service
nest generate service quiz
```

**Kết quả:**
```
src/
├── quiz/
│   ├── quiz.module.ts
│   ├── quiz.controller.ts
│   ├── quiz.service.ts
│   └── quiz.controller.spec.ts  # Unit test
└── app.module.ts  # Tự động import QuizModule
```

### Bước 4: Implement Quiz CRUD (Skeleton)

```typescript
// src/quiz/dto/create-quiz.dto.ts
export class CreateQuizDto {
  title: string;
  timePerQuestion: number;  // seconds
}

// src/quiz/quiz.service.ts
@Injectable()
export class QuizService {
  private quizzes = [];
  private idCounter = 1;

  findAll() {
    return this.quizzes;
  }

  findOne(id: number) {
    return this.quizzes.find(q => q.id === id);
  }

  create(createQuizDto: CreateQuizDto) {
    const quiz = {
      id: this.idCounter++,
      ...createQuizDto,
      createdAt: new Date(),
    };
    this.quizzes.push(quiz);
    return quiz;
  }
}

// src/quiz/quiz.controller.ts
@Controller('quizzes')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get()
  findAll() {
    return this.quizService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizService.findOne(+id);
  }

  @Post()
  create(@Body() createQuizDto: CreateQuizDto) {
    return this.quizService.create(createQuizDto);
  }
}
```

### Bước 5: Chạy và Test

```bash
# Chạy app
npm run start:dev

# Test với curl
# Tạo quiz
curl -X POST http://localhost:3000/quizzes \
  -H "Content-Type: application/json" \
  -d '{"title": "JavaScript Basics", "timePerQuestion": 30}'

# Lấy tất cả quizzes
curl http://localhost:3000/quizzes
```

---

## 4. VERIFY CHECKLIST - CÂU HỎI KIỂM TRA

### 📋 Câu hỏi LÝ THUYẾT

| # | Câu hỏi | Đáp án mong đợi |
|---|---------|-----------------|
| 1 | Module trong NestJS dùng để làm gì? | Container tổ chức code, nhóm các thành phần liên quan |
| 2 | Sự khác nhau giữa Controller và Service? | Controller xử lý HTTP, Service chứa business logic |
| 3 | Dependency Injection giải quyết vấn đề gì? | Loose coupling, dễ test, NestJS tự quản lý instance |
| 4 | `@Injectable()` decorator có tác dụng gì? | Đánh dấu class là Provider, có thể inject được |
| 5 | Tại sao cần tách DTO riêng? | Validate input, tách biệt API contract vs Entity |
| 6 | Thứ tự request lifecycle trong NestJS? | Middleware → Guard → Interceptor → Pipe → Controller |

### 📋 Câu hỏi THỰC HÀNH

| # | Câu hỏi | Cách verify |
|---|---------|-------------|
| 1 | Tạo được NestJS project chạy được không? | `npm run start:dev` → http://localhost:3000 |
| 2 | Docker Compose có PostgreSQL và Redis chạy không? | `docker ps` hiển thị 2 containers |
| 3 | Có thể tạo quiz mới qua API? | POST /quizzes trả về quiz với id |
| 4 | Có thể lấy danh sách quizzes? | GET /quizzes trả về array |

---

## 5. MỞ RỘNG - BEST PRACTICES & USE CASES THỰC TẾ

### 5.1 Module Organization Patterns

**Feature-based structure (Recommended):**
```
src/
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   └── auth.service.ts
├── quiz/
│   ├── quiz.module.ts
│   ├── dto/
│   ├── entities/
│   └── ...
├── game/
│   └── ...
└── shared/
    ├── database/
    ├── logging/
    └── config/
```

### 5.2 Custom Provider Patterns

```typescript
// 1. Value Provider - Inject giá trị cố định
@Module({
  providers: [
    {
      provide: 'CONFIG',
      useValue: { apiKey: 'xxx' },
    },
  ],
})

// 2. Factory Provider - Custom logic khi tạo instance
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async () => {
        const client = createClient();
        await client.connect();
        return client;
      },
    },
  ],
})

// 3. Class Provider - Swap implementation
@Module({
  providers: [
    {
      provide: QuizService,
      useClass: MockQuizService,  // Dùng cho testing
    },
  ],
})
```

### 5.3 Real-world Use Cases

| Pattern | Use Case trong Quiz App |
|---------|------------------------|
| Feature Module | `QuizModule`, `GameModule`, `AuthModule` |
| Shared Module | `DatabaseModule` (TypeORM), `RedisModule` |
| Dynamic Module | `ConfigModule.forRoot()` với env variables |
| Custom Provider | Inject Redis client, External APIs |

### 5.4 Common Mistakes to Avoid

| ❌ Mistake | ✅ Solution |
|-----------|------------|
| Business logic trong Controller | Chuyển vào Service |
| Không validate input | Sử dụng DTOs + ValidationPipe |
| Hard-code config | Sử dụng ConfigModule + .env |
| Circular dependency | Refactor module structure, sử dụng forwardRef() |
| Quá nhiều dependencies trong 1 service | Single Responsibility - tách nhỏ services |

---

## 📅 Timeline Tuần 1

| Ngày | Hoạt động | Thời gian |
|------|-----------|-----------|
| Ngày 1-2 | Setup project + Docker | 2-3 giờ |
| Ngày 3-4 | Đọc docs, hiểu Module/Controller/Provider | 3-4 giờ |
| Ngày 5-6 | Implement QuizModule skeleton | 2-3 giờ |
| Ngày 7 | Trả lời verify questions + Review | 1-2 giờ |

---

> 💡 **Tip**: Sau khi hoàn thành tuần 1, bạn nên có thể giải thích cho người khác về cách NestJS tổ chức code bằng Module pattern và tại sao DI quan trọng.
