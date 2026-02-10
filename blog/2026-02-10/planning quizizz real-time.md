---
title: "Kế hoạch phát triển dự án: Hệ thống Quizizz Real-time (NestJS)"
description: "Hướng dẫn chi tiết kế hoạch phát triển hệ thống Quiz Real-time theo mô hình Waterfall, từ phân tích yêu cầu đến triển khai với NestJS, WebSocket, Redis và PostgreSQL."
authors: [anhhtus]
tags: [nestjs, websocket, redis, real-time, project-planning, waterfall]
---

# 📋 KẾ HOẠCH PHÁT TRIỂN DỰ ÁN: HỆ THỐNG QUIZIZZ REAL-TIME (NESTJS)

> **Mô hình phát triển:** Waterfall (Thác nước)
> **Đối tượng:** Sinh viên năm cuối ngành CNTT
> **Timeline dự kiến:** 6-8 tuần

Xây dựng một hệ thống Quiz Real-time tương tự Kahoot, cho phép giáo viên tạo bộ câu hỏi và tổ chức phiên chơi trực tuyến. Bài viết trình bày kế hoạch phát triển chi tiết theo mô hình Waterfall, từ phân tích yêu cầu, thiết kế kiến trúc, triển khai code, kiểm thử, đến deployment.

<!--truncate-->

---

## Description of the project

### Bối cảnh dự án

Xây dựng một hệ thống Quiz Real-time tương tự Kahoot, cho phép giáo viên (Host) tạo bộ câu hỏi và tổ chức các phiên chơi trực tuyến. Học sinh (Player) tham gia phòng chơi bằng mã PIN, trả lời câu hỏi theo thời gian thực, và theo dõi bảng xếp hạng ngay lập tức.

**🎯 Mục tiêu chính:** Hiểu sâu kiến trúc NestJS, WebSocket, Redis thông qua xây dựng dự án thực tế.

### Yêu cầu chức năng (Functional Requirements)

| ID | Chức năng | Mô tả | Độ ưu tiên |
|----|-----------|-------|-------------|
| FR-01 | Đăng ký / Đăng nhập | Hệ thống xác thực bằng JWT (email + password) | ⭐⭐⭐ |
| FR-02 | CRUD Quiz | Host tạo, sửa, xóa bộ câu hỏi (text-only, không multimedia) | ⭐⭐⭐ |
| FR-03 | Tạo phòng chơi | Host tạo phòng game, hệ thống sinh mã PIN 6 số | ⭐⭐⭐ |
| FR-04 | Tham gia phòng | Player nhập PIN + nickname để vào phòng chờ | ⭐⭐⭐ |
| FR-05 | Chơi game real-time | Host điều khiển luồng game, Player trả lời câu hỏi theo thời gian | ⭐⭐⭐ |
| FR-06 | Tính điểm | Điểm = đúng + tốc độ trả lời (Kahoot-style) | ⭐⭐ |
| FR-07 | Leaderboard | Bảng xếp hạng real-time sau mỗi câu hỏi | ⭐⭐ |
| FR-08 | Swagger Docs | API documentation tự động | ⭐ |

### Yêu cầu phi chức năng (Non-functional Requirements)

| ID | Yêu cầu | Mô tả | Chỉ tiêu |
|----|----------|-------|-----------|
| NFR-01 | Hiệu năng | Hỗ trợ đồng thời nhiều người chơi | ~50-100 CCU |
| NFR-02 | Độ trễ | Thời gian phản hồi real-time chấp nhận được | `< 500ms` |
| NFR-03 | Bảo mật | Xác thực JWT, validate input | OWASP cơ bản |
| NFR-04 | Khả năng mở rộng | Kiến trúc module hóa, dễ thêm tính năng | NestJS Modular |

### Phạm vi MVP (Minimum Viable Product)

**✅ Bao gồm:**
- CRUD Quiz cơ bản (không multimedia)
- Tạo phòng, join phòng bằng PIN
- Chơi game real-time (Host điều khiển, Player trả lời)
- Leaderboard đơn giản
- Swagger API docs

**❌ Loại bỏ (để tập trung vào kiến trúc cốt lõi):**
- Upload ảnh/audio cho câu hỏi
- Xuất báo cáo Excel/PDF
- Load testing 5000 CCU
- Kubernetes deployment

---

## SDLC - Software Development Life Cycle

### Waterfall Model (Mô hình Thác nước)

> **Ẩn dụ đời sống:** Hãy tưởng tượng việc xây một ngôi nhà — bạn phải hoàn thành móng trước khi xây tường, xây tường xong mới lợp mái. Mỗi giai đoạn phải **hoàn tất** trước khi sang giai đoạn kế tiếp. Đó chính là Waterfall.

```
┌─────────────────────────────────────────────┐
│  1. Requirement Analysis    (Tuần 0-1)      │
│     ↓ Output: SRS Document                  │
├─────────────────────────────────────────────┤
│  2. System Design           (Tuần 1-2)      │
│     ↓ Output: Architecture & DB Schema      │
├─────────────────────────────────────────────┤
│  3. Implementation          (Tuần 2-5)      │
│     ↓ Output: Source Code                   │
├─────────────────────────────────────────────┤
│  4. Testing                 (Tuần 5-6)      │
│     ↓ Output: Test Reports                  │
├─────────────────────────────────────────────┤
│  5. Deployment              (Tuần 6-7)      │
│     ↓ Output: Live System                   │
├─────────────────────────────────────────────┤
│  6. Maintenance             (Tuần 7-8+)     │
│     ↓ Output: Bug fixes, Improvements       │
└─────────────────────────────────────────────┘
```

**📌 Trade-off của Waterfall:**

| Ưu điểm | Nhược điểm |
|----------|------------|
| Rõ ràng, dễ quản lý tiến độ | Khó quay lại giai đoạn trước |
| Tài liệu đầy đủ ở mỗi bước | Phát hiện lỗi muộn thì sửa tốn kém |
| Phù hợp đồ án tốt nghiệp (scope cố định) | Không linh hoạt với thay đổi yêu cầu |

---

## 1. Requirement Analysis (Phân tích yêu cầu) — Tuần 0-1

> **Mục tiêu:** Thu thập, phân tích và tài liệu hóa TẤT CẢ yêu cầu trước khi thiết kế.

### 1.1. Stakeholders (Các bên liên quan)

| Stakeholder | Vai trò | Kỳ vọng |
|-------------|---------|---------|
| Giáo viên (Host) | Người tạo quiz, điều khiển game | Giao diện dễ dùng, tạo quiz nhanh |
| Học sinh (Player) | Người chơi game | Tham gia mượt mà, xem điểm real-time |
| Giảng viên hướng dẫn | Đánh giá đồ án | Code sạch, kiến trúc rõ ràng, tài liệu đầy đủ |

### 1.2. Use Cases chính

```
                    ┌─────────────┐
                    │   System    │
                    │  Quiz App   │
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
   │   Auth      │  │   Quiz      │  │   Game      │
   │  Module     │  │  Module     │  │  Module     │
   ├─────────────┤  ├─────────────┤  ├─────────────┤
   │ UC-01:      │  │ UC-03:      │  │ UC-05:      │
   │ Register    │  │ Create Quiz │  │ Create Room │
   │ UC-02:      │  │ UC-04:      │  │ UC-06:      │
   │ Login       │  │ Edit/Delete │  │ Join Room   │
   └─────────────┘  │ Quiz        │  │ UC-07:      │
                     └─────────────┘  │ Play Game   │
                                      │ UC-08:      │
                                      │ View Score  │
                                      └─────────────┘
```

### 1.3. Kiến thức cốt lõi cần nắm vững

| Lĩnh vực | Kiến thức cần học | Mức độ |
|----------|-------------------|--------|
| **NestJS Core** | Module, Provider, DI, Decorator, Pipes, Guards | ⭐⭐⭐ |
| **WebSocket** | Socket.io, Gateway, Room concept, Event-driven | ⭐⭐⭐ |
| **Redis** | Data structures (String, Set, ZSET), Pub/Sub | ⭐⭐⭐ |
| **Database** | TypeORM, Migrations, Relations | ⭐⭐ |
| **Auth** | JWT, Passport strategies | ⭐⭐ |

### 1.4. Deliverables (Tài liệu đầu ra)

- [ ] Tài liệu đặc tả yêu cầu (SRS - Software Requirements Specification)
- [ ] Danh sách Use Cases
- [ ] Bảng yêu cầu chức năng & phi chức năng
- [ ] Phạm vi MVP được duyệt

---

## 2. Design (Thiết kế hệ thống) — Tuần 1-2

> **Mục tiêu:** Chuyển yêu cầu thành thiết kế kỹ thuật chi tiết, bao gồm kiến trúc hệ thống, database schema, và API design.

### 2.1. Kiến trúc hệ thống (System Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│                    🖥️ CLIENT (Browser)                      │
│           Host (Giáo viên) + Players (Học sinh)             │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          │ HTTP (REST)             │ WebSocket (Real-time)
          ▼                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   🚀 NESTJS SERVER                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ AuthModule  │  │ QuizModule  │  │ GameModule          │ │
│  │ (JWT,       │  │ (CRUD API)  │  │ (WebSocket Gateway) │ │
│  │  Passport)  │  │             │  │                     │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
   ┌─────────────┐          ┌─────────────┐
   │ PostgreSQL  │          │    Redis    │
   │ (Dữ liệu   │          │ (Trạng thái │
   │  lâu dài)   │          │  tức thời)  │
   └─────────────┘          └─────────────┘
```

**🎓 Tại sao chọn kiến trúc này?**

| Thành phần | Vai trò | Tại sao cần? |
|------------|---------|----|
| **NestJS** | Backend framework | Modular, type-safe, DI built-in, dễ mở rộng |
| **PostgreSQL** | Lưu Users, Quizzes, Questions | Dữ liệu quan trọng, cần persist lâu dài |
| **Redis** | Lưu Room state, Leaderboard | Tốc độ cao, dữ liệu tạm thời (in-memory) |
| **WebSocket** | Giao tiếp 2 chiều real-time | HTTP request-response không đủ cho game real-time |
| **JWT** | Xác thực người dùng | Stateless auth, không cần session trên server |

### 2.2. Tech Stack

| Layer | Công nghệ | Lý do chọn |
|-------|-----------|----|
| **Framework** | NestJS (Express adapter) | Express dễ debug hơn Fastify cho người học |
| **Real-time** | Socket.io | Phổ biến, documentation tốt, auto-fallback |
| **Database** | PostgreSQL | Tiêu chuẩn ngành, type-safe, JSON support |
| **Cache** | Redis | Cần thiết cho real-time state management |
| **ORM** | TypeORM | Type-safe, NestJS integration tốt |
| **Container** | Docker Compose | Setup local nhanh, môi trường nhất quán |

### 2.3. Database Schema

```sql
-- 4 bảng chính cho MVP

-- Bảng người dùng
CREATE TABLE Users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name        VARCHAR(100) NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Bảng bộ câu hỏi
CREATE TABLE Quizzes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             VARCHAR(255) NOT NULL,
  host_id           UUID REFERENCES Users(id),
  time_per_question INTEGER DEFAULT 20,  -- seconds
  created_at        TIMESTAMP DEFAULT NOW()
);

-- Bảng câu hỏi (JSON column cho options - đơn giản, đủ cho MVP)
CREATE TABLE Questions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id              UUID REFERENCES Quizzes(id) ON DELETE CASCADE,
  content              TEXT NOT NULL,
  correct_option_index INTEGER NOT NULL,
  options              JSONB NOT NULL     -- ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"]
);

-- Bảng kết quả game
CREATE TABLE GameResults (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id         UUID REFERENCES Quizzes(id),
  player_nickname VARCHAR(50) NOT NULL,
  score           INTEGER DEFAULT 0,
  created_at      TIMESTAMP DEFAULT NOW()
);
```

### 2.4. Redis Data Structures Design

```
📦 Redis Keys Design:

room:{pin}:state         → STRING: "waiting" | "playing" | "finished"
room:{pin}:players       → SET: {"player1", "player2", "player3"}
room:{pin}:leaderboard   → ZSET: {player1: 100, player2: 85}
                                ↑ Sorted Set - Tự động sắp xếp theo điểm!
```

> **🎓 Học được gì?**
> - **STRING**: Đơn giản nhất, lưu trạng thái phòng
> - **SET**: Danh sách unique, check member O(1)
> - **ZSET**: Sorted Set — Perfect cho leaderboard, lấy top N trong O(log N)

### 2.5. API Design (RESTful Endpoints)

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/auth/register` | Đăng ký tài khoản mới | ❌ |
| POST | `/auth/login` | Đăng nhập, trả về JWT | ❌ |
| GET | `/quizzes` | Lấy danh sách quiz của user | ✅ |
| POST | `/quizzes` | Tạo quiz mới | ✅ |
| GET | `/quizzes/:id` | Lấy chi tiết quiz + questions | ✅ |
| PUT | `/quizzes/:id` | Cập nhật quiz | ✅ |
| DELETE | `/quizzes/:id` | Xóa quiz | ✅ |

### 2.6. WebSocket Events Design

| Event | Direction | Payload | Mô tả |
|-------|-----------|---------|-------|
| `createRoom` | Client → Server | `{ quizId }` | Host tạo phòng |
| `roomCreated` | Server → Client | `{ pin, roomId }` | Trả PIN cho Host |
| `joinRoom` | Client → Server | `{ pin, nickname }` | Player tham gia |
| `playerJoined` | Server → Room | `{ nickname, playerCount }` | Thông báo có player mới |
| `startGame` | Client → Server | `{ pin }` | Host bắt đầu game |
| `newQuestion` | Server → Room | `{ question, timeLimit }` | Gửi câu hỏi (ẩn đáp án đúng) |
| `submitAnswer` | Client → Server | `{ questionId, optionIndex }` | Player trả lời |
| `answerReceived` | Server → Client | `{ correct, score }` | Phản hồi cho player |
| `leaderboardUpdate` | Server → Room | `{ rankings[] }` | Cập nhật bảng xếp hạng |
| `gameOver` | Server → Room | `{ finalRankings[] }` | Kết thúc game |

### 2.7. Deliverables (Tài liệu đầu ra)

- [ ] System Architecture Diagram
- [ ] Database Schema (ERD)
- [ ] API Specification (Swagger)
- [ ] WebSocket Event Flow Diagram
- [ ] Redis Key Design Document

---

## 3. Implementation (Triển khai) — Tuần 2-5

> **Mục tiêu:** Viết code theo thiết kế đã được duyệt. Chia thành 3 sprint nhỏ để dễ quản lý.

### 3.1. Sprint 1 — Foundation & Auth (Tuần 2-3)

| Task | Chi tiết | Kiến thức học được |
|------|----------|----|
| Setup project | NestJS CLI, Docker Compose (PostgreSQL + Redis) | Project structure, containerization |
| TypeORM setup | Entities, Migrations, Database connection | ORM concepts, database design |
| AuthModule | JWT + Passport Local strategy | Guards, Strategies, Token flow |
| QuizModule | CRUD endpoints + Validation | Controllers, Services, DTOs, Pipes |

**📝 Checkpoint:** Có thể tạo quiz qua Swagger, đăng nhập lấy JWT token.

**Cấu trúc thư mục:**
```
src/
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/
│   │   ├── jwt.strategy.ts
│   │   └── local.strategy.ts
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   └── dto/
│       ├── register.dto.ts
│       └── login.dto.ts
├── quiz/
│   ├── quiz.module.ts
│   ├── quiz.controller.ts
│   ├── quiz.service.ts
│   ├── entities/
│   │   ├── quiz.entity.ts
│   │   └── question.entity.ts
│   └── dto/
│       ├── create-quiz.dto.ts
│       └── update-quiz.dto.ts
├── app.module.ts
└── main.ts
```

### 3.2. Sprint 2 — WebSocket & Room Management (Tuần 3-4)

| Task | Chi tiết | Kiến thức học được |
|------|----------|----|
| GameGateway | `@WebSocketGateway`, `@SubscribeMessage` | Gateway pattern, decorators |
| Room management | Create/Join room logic, PIN generation | Socket rooms, namespace |
| Redis integration | Store room state (STRING, SET) | Redis commands, data structures |
| Event flow | Host → Server → Players communication | Pub/Sub mental model |

**📝 Checkpoint:** Host tạo phòng, Players join được, thấy list real-time.

**Cấu trúc thư mục bổ sung:**
```
src/
├── game/
│   ├── game.module.ts
│   ├── game.gateway.ts          # WebSocket Gateway
│   ├── game.service.ts          # Game logic
│   ├── room.service.ts          # Room management
│   └── redis/
│       └── redis.service.ts     # Redis operations
```

### 3.3. Sprint 3 — Game Engine & Scoring (Tuần 4-5)

| Task | Chi tiết | Kiến thức học được |
|------|----------|----|
| Question broadcast | Gửi câu hỏi đồng bộ tới tất cả players | Room broadcast, timing |
| Answer handler | Nhận, validate đáp án, tính thời gian | Event handling, server-side validation |
| Scoring algorithm | Điểm = đúng + nhanh (Kahoot-style) | Business logic in services |
| Leaderboard | Redis ZSET: ZADD, ZREVRANGE, ZINCRBY | Sorted Set operations |

**📝 Checkpoint:** Chơi được 1 game hoàn chỉnh từ đầu đến cuối.

**Công thức tính điểm:**
```typescript
const BASE_POINTS = 1000;
const timeLimit = 20; // seconds

function calculateScore(isCorrect: boolean, responseTimeMs: number): number {
  if (!isCorrect) return 0;
  const responseTimeSec = responseTimeMs / 1000;
  const timeRatio = 1 - (responseTimeSec / timeLimit);
  return Math.round(BASE_POINTS * Math.max(0, timeRatio));
}
// Ví dụ: Trả lời đúng sau 5s/20s → 1000 * 0.75 = 750 điểm
```

### 3.4. Deliverables (Tài liệu đầu ra)

- [ ] Source code hoàn chỉnh trên GitHub
- [ ] Docker Compose file chạy được local
- [ ] Swagger API documentation
- [ ] README hướng dẫn setup project

---

## 4. Testing (Kiểm thử) — Tuần 5-6

> **Mục tiêu:** Đảm bảo hệ thống hoạt động đúng, xử lý edge cases, và đáp ứng yêu cầu.

### 4.1. Unit Testing

| Module | Test Cases | Công cụ |
|--------|-----------|---------|
| AuthService | Đăng ký (email trùng, password yếu), Đăng nhập (sai password, user không tồn tại) | Jest |
| QuizService | CRUD quiz (tạo, sửa, xóa, lấy danh sách), Validation (thiếu field, dữ liệu sai) | Jest |
| GameService | Tính điểm (đúng/sai, edge cases thời gian), Room state transitions | Jest |
| ScoringService | Công thức tính điểm, boundary values | Jest |

### 4.2. Integration Testing

| Test Scenario | Mô tả | Tiêu chí Pass |
|---------------|-------|----------------|
| Auth Flow | Register → Login → Access protected route | JWT token hoạt động |
| Quiz CRUD | Create → Read → Update → Delete quiz | Data consistency |
| Room Lifecycle | Create Room → Join → Start → End | State transitions đúng |

### 4.3. WebSocket Testing (E2E)

```typescript
// Test flow: Create Room → Join → Play → Game Over
describe('Game E2E', () => {
  it('should complete a full game flow', (done) => {
    const hostSocket = io('http://localhost:3000');
    const playerSocket = io('http://localhost:3000');

    // 1. Host creates room
    hostSocket.emit('createRoom', { quizId: 'test-quiz-id' });

    hostSocket.on('roomCreated', ({ pin }) => {
      // 2. Player joins
      playerSocket.emit('joinRoom', { pin, nickname: 'TestPlayer' });
    });

    playerSocket.on('playerJoined', () => {
      // 3. Host starts game
      hostSocket.emit('startGame', { pin });
    });

    // ... continue assertions
  });
});
```

### 4.4. Edge Cases cần kiểm tra

| Case | Mô tả | Kỳ vọng |
|------|-------|---------|
| Double submit | Player gửi đáp án 2 lần cho 1 câu hỏi | Chỉ tính lần đầu |
| Timeout | Player không trả lời trong thời gian cho phép | Điểm = 0, chuyển câu tiếp |
| Disconnect | Player mất kết nối giữa game | Kick sau timeout, cho phép rejoin |
| Invalid PIN | Player nhập PIN không tồn tại | Trả lỗi rõ ràng |
| Empty room | Host start game khi chưa có player nào | Chặn start, thông báo lỗi |

### 4.5. Deliverables (Tài liệu đầu ra)

- [ ] Test reports (coverage ≥ 70% cho services)
- [ ] Bug list + status (fixed/known)
- [ ] Edge case documentation

---

## 5. Deployment (Triển khai) — Tuần 6-7

> **Mục tiêu:** Đưa hệ thống lên môi trường chạy thực, đảm bảo hoạt động ổn định.

### 5.1. Môi trường triển khai

| Thành phần | Công cụ/Nền tảng | Ghi chú |
|------------|-------------------|---------|
| Server | Docker Compose (local) hoặc VPS (production) | Railway, Render, hoặc DigitalOcean |
| Database | PostgreSQL (Docker hoặc managed service) | Neon, Supabase (miễn phí) |
| Redis | Redis (Docker hoặc managed service) | Upstash (miễn phí) |
| CI/CD | GitHub Actions | Auto test + deploy |

### 5.2. Docker Compose Setup

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/quizdb
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=your-secret-key

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: quizdb
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

### 5.3. Checklist triển khai

- [ ] Dockerfile hoạt động, build thành công
- [ ] Docker Compose khởi động đầy đủ services
- [ ] Database migration chạy thành công
- [ ] Swagger UI truy cập được trên production
- [ ] WebSocket connection hoạt động qua internet
- [ ] Environment variables được cấu hình bảo mật (không hardcode)

### 5.4. Deliverables (Tài liệu đầu ra)

- [ ] Dockerfile + docker-compose.yml
- [ ] Deployment guide (README)
- [ ] URL production (nếu deploy lên cloud)

---

## 6. Maintenance (Bảo trì) — Tuần 7-8+

> **Mục tiêu:** Xử lý bug, tối ưu, và ghi nhận bài học.

### 6.1. Bug Tracking & Fix

| Ưu tiên | Loại | Ví dụ |
|---------|------|-------|
| 🔴 Critical | Game crash, data loss | WebSocket server crash khi 50+ connections |
| 🟡 High | Tính năng sai logic | Điểm tính không đúng với edge case |
| 🟢 Medium | UX issues | Leaderboard không cập nhật kịp |
| ⚪ Low | Cosmetic | Swagger docs thiếu description |

### 6.2. Tối ưu hóa (nếu còn thời gian)

| Hạng mục | Nội dung | Kiến thức mở rộng |
|----------|----------|-------------------|
| Error handling | Global exception filters, WS exception filter | Exception patterns |
| Reconnection | Handle socket disconnect/reconnect | Connection lifecycle |
| Performance | Connection pooling, Redis pipelining | Optimization techniques |
| Security | Rate limiting, input sanitization | Security best practices |

### 6.3. Tài liệu đồ án

- [ ] Báo cáo đồ án tốt nghiệp (theo mẫu trường)
- [ ] Slide thuyết trình
- [ ] Demo video
- [ ] Source code + README trên GitHub

### 6.4. Bài học rút ra (Retrospective)

> **Gợi ý các câu hỏi tự đánh giá:**
> 1. Kiến trúc nào hoạt động tốt? Kiến trúc nào cần cải thiện?
> 2. Nếu làm lại từ đầu, bạn sẽ thay đổi gì?
> 3. Kỹ năng nào bạn học được nhiều nhất?
> 4. Bạn có thể giải thích toàn bộ system cho người khác trong 15 phút không?

---

## 📅 Timeline tổng hợp

```
Tuần 0-1  ████████░░░░░░░░░░░░░░░░  Requirement Analysis
Tuần 1-2  ░░░░████████░░░░░░░░░░░░  Design
Tuần 2-3  ░░░░░░░░████████░░░░░░░░  Sprint 1: Foundation & Auth
Tuần 3-4  ░░░░░░░░░░░░████████░░░░  Sprint 2: WebSocket & Room
Tuần 4-5  ░░░░░░░░░░░░░░░░████████  Sprint 3: Game Engine
Tuần 5-6  ░░░░░░░░░░░░░░░░░░██████  Testing
Tuần 6-7  ░░░░░░░░░░░░░░░░░░░░████  Deployment
Tuần 7-8  ░░░░░░░░░░░░░░░░░░░░░░██  Maintenance
```

---

> 💡 **Lời khuyên cho sinh viên:**
>
> _"Đừng cố làm hết mọi thứ cùng lúc. Hoàn thành từng phase, hiểu thật kỹ, rồi mới sang phase tiếp theo. Waterfall dạy bạn kỷ luật — và kỷ luật là thứ phân biệt developer giỏi với developer bình thường."_

---

*Made by Anh Tu - Share to be shared*
