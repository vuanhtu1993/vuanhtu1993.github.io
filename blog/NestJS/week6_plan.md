---
title: "NestJS: Polishing and testing"
date: "2026-02-03"
category: "NestJS"
authors: [anhhtus]
tags: [nestjs, beginner, testing, gateway]
description: "Tìm hiểu NestJS từ cơ bản đến nâng cao: khái niệm, thành phần chính, cách triển khai, use cases thực tế và best practices để tự động hóa quy trình phát triển phần mềm."
---

# 📚 TUẦN 6: POLISH, TESTING & DOCUMENTATION

> 🎯 **Mục tiêu tuần cuối**: Hoàn thiện ứng dụng, viết tests, documentation, và có thể demo/giải thích toàn bộ

---

## 1. CHỨC NĂNG CẦN HOÀN THÀNH

| STT | Chức năng | Mô tả | Output |
|-----|-----------|-------|--------|
| 6.1 | Error Handling | Global exception filters | Errors được handle gracefully |
| 6.2 | Unit Tests | Test services, scoring | Coverage > 80% |
| 6.3 | Integration Tests | Test API endpoints | All endpoints tested |
| 6.4 | E2E Tests | Test WebSocket flow | Full game flow tested |
| 6.5 | Swagger Docs | API documentation | /api-docs accessible |
| 6.6 | Graceful Shutdown | Handle SIGTERM | Clean disconnect |

---

## 2. KIẾN THỨC CẦN NẮM VỮNG

### 2.1 Error Handling Patterns

#### 📖 HTTP Exception Filters
```typescript
// Global exception filter
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    this.logger.error(
      `${request.method} ${request.url} - ${status}: ${message}`,
      exception instanceof Error ? exception.stack : '',
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}

// main.ts
app.useGlobalFilters(new AllExceptionsFilter());
```

#### 📖 WebSocket Exception Handling
```typescript
import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';

@Catch(WsException)
export class WsExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: WsException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();
    const error = exception.getError();
    
    client.emit('exception', {
      status: 'error',
      message: typeof error === 'string' ? error : error['message'],
    });
  }
}

// Throwing WsException
@SubscribeMessage('joinRoom')
handleJoinRoom(@MessageBody() data: any) {
  if (!data.pin) {
    throw new WsException('PIN is required');
  }
}
```

---

### 2.2 Testing in NestJS

#### 📖 Test Pyramid
```
         ╱╲
        ╱  ╲
       ╱ E2E╲         ← Ít nhất, chậm nhất, UI tests
      ╱──────╲
     ╱Integration╲    ← API endpoints, database
    ╱──────────────╲
   ╱   Unit Tests   ╲  ← Nhiều nhất, nhanh nhất
  ╱──────────────────╲
```

#### 📖 Unit Tests
**Test isolated logic, mock dependencies**

```typescript
// scoring.service.spec.ts
describe('ScoringService', () => {
  let service: ScoringService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ScoringService],
    }).compile();

    service = module.get<ScoringService>(ScoringService);
  });

  describe('calculate', () => {
    it('should return 0 for incorrect answer', () => {
      expect(service.calculate(false, 0)).toBe(0);
    });

    it('should return max score for instant correct answer', () => {
      expect(service.calculate(true, 0)).toBe(1000);
    });

    it('should return proportional score based on time', () => {
      expect(service.calculate(true, 10000)).toBe(500);
    });
  });
});
```

#### 📖 Integration Tests
**Test with real database, mock external services**

```typescript
// quiz.controller.spec.ts
describe('QuizController (Integration)', () => {
  let app: INestApplication;
  let quizService: QuizService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    quizService = module.get<QuizService>(QuizService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /quizzes - should create quiz', async () => {
    const response = await request(app.getHttpServer())
      .post('/quizzes')
      .set('Authorization', 'Bearer valid-token')
      .send({ title: 'Test Quiz', timePerQuestion: 30 })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe('Test Quiz');
  });

  it('GET /quizzes - should return all quizzes', async () => {
    const response = await request(app.getHttpServer())
      .get('/quizzes')
      .set('Authorization', 'Bearer valid-token')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });
});
```

#### 📖 E2E WebSocket Tests
```typescript
// game.e2e-spec.ts
import { io, Socket } from 'socket.io-client';

describe('Game Flow (E2E)', () => {
  let hostSocket: Socket;
  let playerSocket: Socket;
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    await app.listen(3001);
  });

  beforeEach(() => {
    hostSocket = io('http://localhost:3001', { autoConnect: false });
    playerSocket = io('http://localhost:3001', { autoConnect: false });
  });

  afterEach(() => {
    hostSocket.disconnect();
    playerSocket.disconnect();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should complete full game flow', (done) => {
    let pin: string;

    hostSocket.connect();
    
    // 1. Host creates room
    hostSocket.emit('createRoom', { quizId: 'test-quiz' }, (response) => {
      expect(response.success).toBe(true);
      pin = response.pin;

      // 2. Player joins
      playerSocket.connect();
      playerSocket.emit('joinRoom', { pin, nickname: 'TestPlayer' }, (res) => {
        expect(res.success).toBe(true);
      });
    });

    // 3. Player joined event
    hostSocket.on('playerJoined', (data) => {
      expect(data.newPlayer).toBe('TestPlayer');
      
      // 4. Host starts game
      hostSocket.emit('startGame', { quizId: 'test-quiz' });
    });

    // 5. Questions flow
    playerSocket.on('newQuestion', (data) => {
      expect(data.question).toBeDefined();
      
      // 6. Player answers
      playerSocket.emit('submitAnswer', { optionIndex: 0 });
    });

    // 7. Game over
    playerSocket.on('gameOver', (data) => {
      expect(data.leaderboard).toBeDefined();
      done();
    });
  });
});
```

---

### 2.3 Swagger Documentation

#### 📖 Setup
```typescript
// main.ts
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Quiz Realtime API')
    .setDescription('API documentation for Quiz Realtime application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(3000);
}
```

#### 📖 Decorating Controllers
```typescript
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('quizzes')
@Controller('quizzes')
export class QuizController {
  
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new quiz' })
  @ApiResponse({ status: 201, description: 'Quiz created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() dto: CreateQuizDto) {
    return this.quizService.create(dto);
  }
}
```

#### 📖 Decorating DTOs
```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuizDto {
  @ApiProperty({
    example: 'JavaScript Basics',
    description: 'Title of the quiz',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 30,
    description: 'Time limit per question in seconds',
    default: 30,
  })
  @IsNumber()
  timePerQuestion: number;
}
```

---

### 2.4 Graceful Shutdown

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable shutdown hooks
  app.enableShutdownHooks();

  await app.listen(3000);
}

// In Gateway
@WebSocketGateway()
export class GameGateway implements OnModuleDestroy {
  @WebSocketServer()
  server: Server;

  async onModuleDestroy() {
    // Notify all clients
    this.server.emit('serverShutdown', {
      message: 'Server is shutting down',
    });

    // Close all connections gracefully
    this.server.disconnectSockets(true);
    
    // Cleanup Redis
    // Save game states if needed
  }
}
```

---

### 2.5 Production Checklist

```typescript
// Environment configuration
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
  ],
})
export class AppModule {}

// Docker production
// Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/main"]
```

---

## 3. STEP BY STEP TRIỂN KHAI

### Bước 1: Setup Global Exception Filters

```typescript
// src/common/filters/all-exceptions.filter.ts
// (Code như trên)

// src/common/filters/ws-exception.filter.ts
// (Code như trên)

// main.ts
app.useGlobalFilters(new AllExceptionsFilter());
```

### Bước 2: Viết Unit Tests

```bash
# Run tests
npm run test

# Run with coverage
npm run test:cov

# Watch mode
npm run test:watch
```

```typescript
// Tạo tests cho các services
// src/game/scoring.service.spec.ts
// src/game/room.service.spec.ts
// src/auth/auth.service.spec.ts
```

### Bước 3: Setup Swagger

```bash
npm install @nestjs/swagger swagger-ui-express
```

Truy cập: http://localhost:3000/api-docs

### Bước 4: Viết E2E Tests

```bash
npm run test:e2e
```

### Bước 5: Docker Production Build

```bash
docker build -t quiz-realtime .
docker run -p 3000:3000 quiz-realtime
```

---

## 4. VERIFY CHECKLIST

### 📋 Câu hỏi LÝ THUYẾT

| # | Câu hỏi | Đáp án mong đợi |
|---|---------|-----------------|
| 1 | Unit test khác Integration test như thế nào? | Unit = isolated, mock deps; Integration = real deps |
| 2 | ExceptionFilter dùng để làm gì? | Catch và transform exceptions thành responses |
| 3 | WsException khác HttpException thế nào? | WsException cho WebSocket, emit event thay vì HTTP response |
| 4 | Swagger giúp gì trong development? | API documentation, testing interface |
| 5 | Graceful shutdown quan trọng vì sao? | Không mất data, cleanup resources |
| 6 | Test coverage nên đạt bao nhiêu %? | 80%+ cho critical services |

### 📋 Câu hỏi THỰC HÀNH

| # | Kiểm tra | Cách verify |
|---|----------|-------------|
| 1 | Unit tests pass? | `npm run test` → All green |
| 2 | Test coverage đủ? | `npm run test:cov` → >80% |
| 3 | Swagger hoạt động? | http://localhost:3000/api-docs |
| 4 | Error handling đúng? | Throw error → Client nhận formatted response |
| 5 | E2E test pass? | `npm run test:e2e` → Full flow works |
| 6 | Docker build thành công? | `docker build` → Image created |

---

## 5. 🏆 FINAL ASSESSMENT

### 5.1 Knowledge Verification

**Bạn có thể giải thích được:**

| Topic | Câu hỏi kiểm tra |
|-------|------------------|
| NestJS Core | Module, Provider, DI hoạt động ra sao? |
| TypeORM | Entity, Relations, Migration là gì? |
| Authentication | JWT flow, Guards, Strategies? |
| WebSocket | Gateway, Rooms, Event broadcasting? |
| Redis | Data structures, Pub/Sub, Adapter? |
| Game Engine | State machine, Scoring, Race condition? |
| Testing | Unit vs Integration vs E2E? |

### 5.2 Skills Verification

| Skill | Cách demonstrate |
|-------|------------------|
| Setup project | `nest new` → Docker Compose → Running |
| CRUD API | Swagger shows all endpoints |
| Authentication | Login → JWT → Protected routes |
| Real-time | Create room → Join → Chat works |
| Game logic | Play full game from start to end |
| Testing | `npm test` → All pass |

### 5.3 Presentation Checklist

**Có thể demo cho người khác:**

- [ ] Tạo quiz mới qua Swagger
- [ ] Host tạo phòng, lấy PIN
- [ ] Players join bằng PIN
- [ ] Chơi 1 game hoàn chỉnh
- [ ] Xem leaderboard real-time
- [ ] Giải thích architecture diagram
- [ ] Giải thích data flow

---

## 6. MỞ RỘNG - NEXT STEPS

### 6.1 Features có thể thêm

| Feature | Độ phức tạp |
|---------|-------------|
| Upload ảnh cho questions | ⭐⭐ |
| Multiple game modes | ⭐⭐⭐ |
| Analytics dashboard | ⭐⭐⭐ |
| Mobile app (React Native) | ⭐⭐⭐⭐ |

### 6.2 Infrastructure upgrades

| Upgrade | Khi nào cần |
|---------|-------------|
| Redis Cluster | > 1000 concurrent rooms |
| Kubernetes | Need auto-scaling |
| Message Queue (BullMQ) | Heavy background jobs |
| CDN | Serve static assets |

### 6.3 Learning continuation

| Topic | Resources |
|-------|-----------|
| Microservices | NestJS microservices docs |
| GraphQL | NestJS GraphQL module |
| gRPC | High-performance inter-service |
| Event Sourcing | Complex game state |

---

## 📅 Timeline Tuần 6

| Ngày | Hoạt động | Thời gian |
|------|-----------|-----------|
| Ngày 1-2 | Exception filters + Unit tests | 3-4 giờ |
| Ngày 3-4 | Integration + E2E tests | 3-4 giờ |
| Ngày 5 | Swagger + Documentation | 2-3 giờ |
| Ngày 6 | Docker + Deployment prep | 2-3 giờ |
| Ngày 7 | 🎉 Final demo + Review | 2 giờ |

---

## 🎓 TỔNG KẾT KHÓA HỌC

```
Tuần 1: NestJS Fundamentals    → Hiểu Module, DI, Controllers
Tuần 2: TypeORM + Auth         → Database, JWT, Guards
Tuần 3: WebSocket Basics       → Gateway, Rooms, Events
Tuần 4: Redis Integration      → Data structures, Pub/Sub
Tuần 5: Game Engine            → State machine, Scoring
Tuần 6: Polish + Testing       → Production-ready app
```

> 💡 **Lời kết**: Bạn đã xây dựng được một ứng dụng real-time hoàn chỉnh với NestJS. Kiến thức này có thể áp dụng cho: chat apps, live dashboards, collaborative tools, gaming platforms, và nhiều hơn nữa!

**Chúc mừng bạn đã hoàn thành khóa học! 🎉**
