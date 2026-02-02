---
title: "NestJS: TypeORM & Authentication"
date: "2026-02-03"
category: "NestJS"
authors: [anhhtus]
tags: [nestjs, beginner, authentication, typeorm]
description: "Tìm hiểu NestJS từ cơ bản đến nâng cao: khái niệm, thành phần chính, cách triển khai, use cases thực tế và best practices để tự động hóa quy trình phát triển phần mềm."
---
# 📚 TUẦN 2: TYPEORM & AUTHENTICATION

> 🎯 **Mục tiêu tuần này**: Thiết lập database layer với TypeORM, hiểu sâu JWT authentication trong NestJS

---

## 1. CHỨC NĂNG CẦN HOÀN THÀNH

| STT | Chức năng | Mô tả | Output |
|-----|-----------|-------|--------|
| 2.1 | TypeORM Setup | Kết nối PostgreSQL, config entities | Database connected |
| 2.2 | User Entity | Tạo User entity + migration | Table users trong DB |
| 2.3 | Quiz Entity với Relations | Quiz + Questions entities | Foreign key relationships |
| 2.4 | AuthModule | JWT + Passport Local | Login endpoint, protected routes |
| 2.5 | DTOs + Validation | class-validator integration | Input validation hoạt động |

---

## 2. KIẾN THỨC CẦN NẮM VỮNG

### 2.1 TypeORM Concepts

#### 📖 Entity
**Khái niệm:**
- Entity = class đại diện cho 1 bảng trong database
- Mỗi instance = 1 row trong bảng
- Sử dụng decorators để define columns, relations

**Core Component:**
```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')  // Tên bảng trong DB
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true })
  name: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

**Column Types phổ biến:**
| Decorator | Mô tả |
|-----------|-------|
| `@PrimaryGeneratedColumn()` | Auto-increment primary key |
| `@PrimaryGeneratedColumn('uuid')` | UUID primary key |
| `@Column()` | Column thông thường |
| `@Column({ type: 'json' })` | JSON column |
| `@CreateDateColumn()` | Auto-set khi insert |
| `@UpdateDateColumn()` | Auto-update khi update |

---

#### 📖 Relations
**Khái niệm:**
- Định nghĩa quan hệ giữa các entities
- OneToMany, ManyToOne, OneToOne, ManyToMany

**Core Component:**
```typescript
// User có nhiều Quizzes
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => Quiz, (quiz) => quiz.host)
  quizzes: Quiz[];
}

// Quiz thuộc về 1 User (host)
@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ default: 30 })
  timePerQuestion: number;

  @ManyToOne(() => User, (user) => user.quizzes)
  @JoinColumn({ name: 'host_id' })
  host: User;

  @Column()
  hostId: string;

  @OneToMany(() => Question, (question) => question.quiz)
  questions: Question[];
}

// Question thuộc về 1 Quiz
@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column('simple-json')  // Lưu array: ["Option A", "Option B", ...]
  options: string[];

  @Column()
  correctOptionIndex: number;

  @ManyToOne(() => Quiz, (quiz) => quiz.questions)
  @JoinColumn({ name: 'quiz_id' })
  quiz: Quiz;
}
```

---

#### 📖 Migration
**Khái niệm:**
- File ghi lại sự thay đổi schema database
- Có thể rollback (up/down)
- **BẮT BUỘC** dùng cho production

**Tại sao không dùng `synchronize: true`?**
```
❌ synchronize: true (Development only)
   - Tự động sync schema
   - NGUY HIỂM: Có thể DROP column → MẤT DATA

✅ Migration (Production)
   - Kiểm soát được thay đổi
   - Có thể rollback
   - Version control được
```

**Commands:**
```bash
# Tạo migration từ entity changes
npx typeorm migration:generate -d src/data-source.ts src/migrations/CreateUsers

# Chạy migration
npx typeorm migration:run -d src/data-source.ts

# Rollback migration gần nhất
npx typeorm migration:revert -d src/data-source.ts
```

---

### 2.2 Authentication Concepts

#### 📖 JWT (JSON Web Token)
**Khái niệm:**
- Token dạng `header.payload.signature`
- Stateless: Server không lưu session
- Self-contained: Chứa thông tin user

**Structure:**
```
eyJhbGciOiJIUzI1NiJ9.        ← Header (algorithm)
eyJ1c2VySWQiOiIxMjMifQ.     ← Payload (data)
SflKxwRJSMeKKF2QT4fwpM...   ← Signature (verify)
```

**Flow:**
```
1. User login (email + password)
2. Server verify → Tạo JWT
3. Client lưu JWT (localStorage/cookie)
4. Mỗi request: Authorization: Bearer <token>
5. Server verify token → Cho phép access
```

---

#### 📖 Passport & Strategies
**Khái niệm:**
- Passport = Authentication middleware
- Strategy = Cách authenticate cụ thể (local, jwt, google, ...)

**Core Component:**
```typescript
// 1. Local Strategy - Verify email/password
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;  // Attach to request.user
  }
}

// 2. JWT Strategy - Verify token
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'your-secret-key',
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}
```

---

#### 📖 Guards
**Khái niệm:**
- Kiểm tra điều kiện trước khi cho vào Controller
- Return true = cho phép, false/exception = block

**Core Component:**
```typescript
// Sử dụng Guards
@Controller('quizzes')
export class QuizController {
  @Post()
  @UseGuards(JwtAuthGuard)  // Bảo vệ route này
  create(@Body() dto: CreateQuizDto, @Request() req) {
    // req.user chứa thông tin từ JWT
    return this.quizService.create(dto, req.user.userId);
  }
}

// Custom Auth Guard
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

---

### 2.3 DTO & Validation

**Core Component:**
```typescript
import { IsEmail, IsString, MinLength, IsNumber, IsArray } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  name: string;
}

export class CreateQuizDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsNumber()
  timePerQuestion: number;

  @IsArray()
  questions: CreateQuestionDto[];
}
```

**Setup ValidationPipe:**
```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,      // Strip properties không có trong DTO
    forbidNonWhitelisted: true,  // Throw error nếu có property lạ
    transform: true,      // Auto-transform types
  }));
  
  await app.listen(3000);
}
```

---

## 3. STEP BY STEP TRIỂN KHAI

### Bước 1: Cài đặt Dependencies

```bash
npm install @nestjs/typeorm typeorm pg
npm install @nestjs/passport passport passport-local passport-jwt
npm install @nestjs/jwt bcrypt class-validator class-transformer
npm install -D @types/passport-local @types/passport-jwt @types/bcrypt
```

### Bước 2: TypeORM Configuration

```typescript
// src/app.module.ts
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'quiz_user',
      password: 'quiz_password',
      database: 'quiz_db',
      entities: [User, Quiz, Question],
      synchronize: true,  // DEV ONLY!
    }),
    AuthModule,
    QuizModule,
  ],
})
export class AppModule {}
```

### Bước 3: Tạo Entities

```typescript
// src/users/entities/user.entity.ts
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true })
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Quiz, (quiz) => quiz.host)
  quizzes: Quiz[];
}
```

### Bước 4: AuthService

```typescript
// src/auth/auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (user && await bcrypt.compare(password, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(dto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      email: dto.email,
      passwordHash: hashedPassword,
      name: dto.name,
    });
    return this.userRepo.save(user);
  }
}
```

### Bước 5: AuthController

```typescript
// src/auth/auth.controller.ts
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
```

---

## 4. VERIFY CHECKLIST

### 📋 Câu hỏi LÝ THUYẾT

| # | Câu hỏi | Đáp án mong đợi |
|---|---------|-----------------|
| 1 | Entity trong TypeORM đại diện cho gì? | Class đại diện cho 1 bảng trong database |
| 2 | Tại sao không dùng `synchronize: true` cho production? | Có thể mất data khi thay đổi entity |
| 3 | JWT gồm những phần nào? Mỗi phần có vai trò gì? | Header (algorithm), Payload (data), Signature (verify) |
| 4 | Strategy trong Passport dùng để làm gì? | Định nghĩa cách authenticate cụ thể |
| 5 | Guard khác Middleware như thế nào? | Guard có access ExecutionContext, chạy sau Middleware |
| 6 | `@OneToMany` vs `@ManyToOne` khác nhau thế nào? | One side có array, Many side có single reference |

### 📋 Câu hỏi THỰC HÀNH

| # | Câu hỏi | Cách verify |
|---|---------|-------------|
| 1 | Database có bảng users? | Kiểm tra PostgreSQL với psql hoặc pgAdmin |
| 2 | Register user mới được không? | POST /auth/register → 201 Created |
| 3 | Login nhận được JWT? | POST /auth/login → { access_token: "..." } |
| 4 | Protected route hoạt động? | GET /auth/profile với Bearer token |
| 5 | Validation có bắt lỗi? | POST với email invalid → 400 Bad Request |

---

## 5. MỞ RỘNG - BEST PRACTICES

### 5.1 Password Security

```typescript
// ❌ KHÔNG BAO GIỜ lưu plain password
user.password = password;

// ✅ Hash với bcrypt, salt rounds = 10-12
const hash = await bcrypt.hash(password, 10);
```

### 5.2 JWT Best Practices

| Practice | Lý do |
|----------|-------|
| Short expiration (15-60 min) | Giảm damage nếu token bị leak |
| Refresh token | Không cần re-login thường xuyên |
| Secret key từ env | Không hardcode trong code |
| HTTPS only | Token có thể bị intercept qua HTTP |

### 5.3 TypeORM Performance

```typescript
// ❌ N+1 problem
const quizzes = await quizRepo.find();
for (const quiz of quizzes) {
  console.log(quiz.questions);  // Mỗi lần là 1 query!
}

// ✅ Eager loading
const quizzes = await quizRepo.find({
  relations: ['questions'],  // 1 query với JOIN
});
```

### 5.4 Real-world Use Cases

| Pattern | Use Case trong Quiz App |
|---------|------------------------|
| JWT Auth | Host login để tạo/quản lý quiz |
| Refresh Token | User không cần re-login mỗi 15 phút |
| Password Reset | Forgot password flow |
| Role-based | HOST vs PLAYER permissions |

---

## 📅 Timeline Tuần 2

| Ngày | Hoạt động | Thời gian |
|------|-----------|-----------|
| Ngày 1-2 | Setup TypeORM + Entities | 3-4 giờ |
| Ngày 3-4 | AuthModule (JWT + Passport) | 4-5 giờ |
| Ngày 5-6 | DTOs, Validation, Testing | 2-3 giờ |
| Ngày 7 | Review + Verify questions | 1-2 giờ |

---

> 💡 **Tip**: Sau tuần 2, bạn nên có thể giải thích JWT flow và tại sao lại cần Passport strategies.
