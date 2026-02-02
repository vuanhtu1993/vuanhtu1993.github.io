---
title: "OOP trong NestJS (Phần 2): Encapsulation & Decorators - Giải Mã Magic"
date: "2026-02-02"
category: "NestJS"
authors: [anhhtus]
tags: [nestjs, oop, typescript, decorators, encapsulation, metadata]
description: "Hiểu sâu Encapsulation (đóng gói) và Decorators trong NestJS. Giải thích @Controller, @Injectable, @Module hoạt động thế nào, và cách tự tạo custom decorators."
---

# 🎭 OOP trong NestJS (Phần 2): Encapsulation & Decorators

> 🎯 **Mục tiêu**: Hiểu Encapsulation và "de-magic" các decorators của NestJS. Tiếp tục phát triển `UserService` từ Phần 1.

<!--truncate-->

---

## 📌 Recap từ Phần 1

Trong [Phần 1](./part1_oop_foundation), chúng ta đã:
- Chuyển từ functional sang class-based `UserService`
- Hiểu `this` keyword và constructor injection
- Thấy decorator `@Injectable()` nhưng chưa giải thích

Bây giờ, hãy hiểu **tại sao** decorator đó quan trọng và cách NestJS sử dụng chúng.

---

## 1. ENCAPSULATION - ĐÓNG GÓI DỮ LIỆU

### 1.1 Vấn đề khi không có Encapsulation

```typescript
// ❌ Không có encapsulation
class UserService {
  users = new Map();  // Public by default
  passwordSalt = 10;  // Ai cũng thấy được
}

const service = new UserService();

// Ai cũng có thể làm điều này:
service.users.clear();  // Xóa hết users!
service.passwordSalt = 1;  // Làm yếu security!
```

### 1.2 Access Modifiers trong TypeScript

```typescript
class UserService {
  private users = new Map<string, User>();  // Chỉ class này access được
  private readonly SALT_ROUNDS = 10;        // Private + không thể thay đổi
  
  protected logger: Logger;  // Class này + subclasses access được
  
  public userCount = 0;      // Ai cũng access được (default)
}
```

| Modifier | Class | Subclass | Bên ngoài |
|----------|-------|----------|-----------|
| `private` | ✅ | ❌ | ❌ |
| `protected` | ✅ | ✅ | ❌ |
| `public` | ✅ | ✅ | ✅ |
| `readonly` | ✅ (ghi 1 lần) | ✅ | ✅ |

### 1.3 Áp dụng vào UserService

```typescript
// user.service.ts - Encapsulated version
@Injectable()
export class UserService {
  // Private state - không ai thấy từ bên ngoài
  private readonly users = new Map<string, User>();
  private readonly SALT_ROUNDS = 10;

  // Public interface - API cho bên ngoài
  async create(dto: CreateUserDto): Promise<UserResponse> {
    // Sử dụng private state an toàn
    if (this.users.has(dto.email)) {
      throw new ConflictException('Email already exists');
    }

    const user = await this.hashAndSaveUser(dto);
    return this.toPublicUser(user);
  }

  // Private helper methods
  private async hashAndSaveUser(dto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(dto.password, this.SALT_ROUNDS);
    const user: User = {
      id: this.generateId(),
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
      createdAt: new Date()
    };
    this.users.set(dto.email, user);
    return user;
  }

  private toPublicUser(user: User): UserResponse {
    // Không expose password!
    return { id: user.id, email: user.email, name: user.name };
  }

  private generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

> 💡 **Key insight**: Encapsulation = **Hide implementation, expose interface**. Bên ngoài không cần biết users được lưu trong Map hay Database.

---

## 2. DECORATORS - CHÚNG LÀ GÌ?

### 2.1 Decorator = Just a Function!

```typescript
// Decorator đơn giản nhất
function SimpleLog(target: any) {
  console.log('Class được decorated:', target.name);
}

@SimpleLog
class UserService {}

// Console output: "Class được decorated: UserService"
```

### 2.2 Các loại Decorators

```typescript
// 1. CLASS DECORATOR
function ClassDecorator(constructor: Function) {
  console.log('Decorating class:', constructor.name);
}

// 2. METHOD DECORATOR  
function MethodDecorator(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  console.log('Decorating method:', propertyKey);
}

// 3. PROPERTY DECORATOR
function PropertyDecorator(target: any, propertyKey: string) {
  console.log('Decorating property:', propertyKey);
}

// 4. PARAMETER DECORATOR
function ParamDecorator(
  target: any, 
  propertyKey: string, 
  parameterIndex: number
) {
  console.log('Decorating param at index:', parameterIndex);
}

@ClassDecorator
class Example {
  @PropertyDecorator
  name: string;

  @MethodDecorator
  greet(@ParamDecorator message: string) {
    return message;
  }
}
```

### 2.3 Decorator Factory - Decorator có Parameters

```typescript
// Decorator Factory = function trả về decorator
function Log(prefix: string) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function(...args: any[]) {
      console.log(`${prefix} Calling ${propertyKey} with:`, args);
      const result = originalMethod.apply(this, args);
      console.log(`${prefix} Result:`, result);
      return result;
    };
  };
}

class UserService {
  @Log('[UserService]')
  create(name: string) {
    return { id: 1, name };
  }
}

const service = new UserService();
service.create('Alice');
// Output:
// [UserService] Calling create with: ['Alice']
// [UserService] Result: { id: 1, name: 'Alice' }
```

---

## 3. NESTJS DECORATORS GIẢI MÃ

### 3.1 @Injectable() - Đăng ký với IoC Container

```typescript
// Simplified version của @Injectable
function Injectable(): ClassDecorator {
  return (target: Function) => {
    // Đánh dấu class này có thể được inject
    Reflect.defineMetadata('injectable', true, target);
  };
}
```

**Thực tế @Injectable() làm gì:**
1. Ghi metadata vào class
2. NestJS IoC Container đọc metadata này
3. Tự động tạo instance và inject khi cần

```typescript
// Khi bạn viết
@Injectable()
export class UserService {
  constructor(private logger: Logger) {}
}

// NestJS hiểu: "UserService cần Logger, tôi sẽ inject cho nó"
```

### 3.2 @Controller() - Route Handler

```typescript
// Simplified version
function Controller(prefix: string): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata('path', prefix, target);
    Reflect.defineMetadata('controller', true, target);
  };
}

function Get(path: string = ''): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    Reflect.defineMetadata('method', 'GET', descriptor.value);
    Reflect.defineMetadata('path', path, descriptor.value);
  };
}

@Controller('users')  // prefix = '/users'
export class UserController {
  
  @Get()              // GET /users
  findAll() {}

  @Get(':id')         // GET /users/:id
  findOne() {}
}
```

### 3.3 @Module() - Grouping Components

```typescript
// Simplified version
function Module(metadata: ModuleMetadata): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata('imports', metadata.imports, target);
    Reflect.defineMetadata('controllers', metadata.controllers, target);
    Reflect.defineMetadata('providers', metadata.providers, target);
    Reflect.defineMetadata('exports', metadata.exports, target);
  };
}

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
```

---

## 4. TẠO CUSTOM DECORATORS

### 4.1 Method Decorator: @LogExecution

```typescript
// decorators/log-execution.decorator.ts
export function LogExecution(): MethodDecorator {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    const originalMethod = descriptor.value;
    const className = target.constructor.name;

    descriptor.value = async function (...args: any[]) {
      const start = Date.now();
      console.log(`[${className}] ${String(propertyKey)} started`);
      
      try {
        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - start;
        console.log(`[${className}] ${String(propertyKey)} completed in ${duration}ms`);
        return result;
      } catch (error) {
        const duration = Date.now() - start;
        console.error(`[${className}] ${String(propertyKey)} failed after ${duration}ms:`, error.message);
        throw error;
      }
    };

    return descriptor;
  };
}
```

**Áp dụng vào UserService:**

```typescript
@Injectable()
export class UserService {
  private readonly users = new Map<string, User>();

  @LogExecution()  // ← Custom decorator
  async create(dto: CreateUserDto): Promise<UserResponse> {
    // ... implementation
  }

  @LogExecution()
  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.get(email);
  }
}

// Console output khi gọi create:
// [UserService] create started
// [UserService] create completed in 45ms
```

### 4.2 Parameter Decorator: @CurrentUser

```typescript
// decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;  // Set by AuthGuard

    // Nếu có data (field name), trả về field đó
    return data ? user?.[data] : user;
  }
);
```

**Sử dụng:**

```typescript
@Controller('users')
export class UserController {
  
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: User) {
    return user;
  }

  @Get('my-email')
  @UseGuards(JwtAuthGuard)
  getEmail(@CurrentUser('email') email: string) {
    return { email };
  }
}
```

### 4.3 Class Decorator: @ApiVersion

```typescript
// decorators/api-version.decorator.ts
export function ApiVersion(version: string): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata('api-version', version, target);
  };
}

// Helper để lấy version
export function getApiVersion(target: Function): string {
  return Reflect.getMetadata('api-version', target) || 'v1';
}

// Sử dụng
@ApiVersion('v2')
@Controller('users')
export class UserController {
  // ...
}

// Middleware có thể đọc version
const version = getApiVersion(UserController);
console.log(version);  // 'v2'
```

---

## 5. METADATA REFLECTION

### 5.1 Reflect Metadata là gì?

```typescript
// NestJS sử dụng reflect-metadata để lưu thông tin
import 'reflect-metadata';

class UserService {
  greet(name: string): string {
    return `Hello, ${name}`;
  }
}

// Lấy type information
const paramTypes = Reflect.getMetadata('design:paramtypes', UserService.prototype, 'greet');
console.log(paramTypes);  // [String]

const returnType = Reflect.getMetadata('design:returntype', UserService.prototype, 'greet');
console.log(returnType);  // String
```

### 5.2 Tại sao cần Metadata?

```typescript
@Injectable()
export class UserService {
  constructor(
    private userRepo: UserRepository,
    private logger: Logger
  ) {}
}

// NestJS đọc param types từ metadata:
const params = Reflect.getMetadata('design:paramtypes', UserService);
// [UserRepository, Logger]

// → NestJS biết cần inject những dependencies nào
```

> 💡 **Key insight**: Decorators + Metadata = NestJS có thể "đọc" code của bạn và tự động wire dependencies.

---

## 6. USERSERVICE EVOLUTION

### Từ Phần 1 → Phần 2

```typescript
// user.service.ts - Version với Decorators và Encapsulation
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Custom decorator từ section trên
function LogExecution(): MethodDecorator {
  return (target, key, descriptor: PropertyDescriptor) => {
    const original = descriptor.value;
    descriptor.value = async function(...args: any[]) {
      console.log(`[${target.constructor.name}] ${String(key)} called`);
      const start = Date.now();
      const result = await original.apply(this, args);
      console.log(`[${target.constructor.name}] ${String(key)} took ${Date.now() - start}ms`);
      return result;
    };
  };
}

@Injectable()
export class UserService {
  // ENCAPSULATION: Private state
  private readonly users = new Map<string, User>();
  private readonly SALT_ROUNDS = 10;

  // PUBLIC INTERFACE với DECORATORS
  @LogExecution()
  async create(dto: CreateUserDto): Promise<UserResponse> {
    await this.ensureEmailNotExists(dto.email);
    const user = await this.hashAndSaveUser(dto);
    return this.toPublicUser(user);
  }

  @LogExecution()
  async findByEmail(email: string): Promise<User> {
    const user = this.users.get(email);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  @LogExecution()
  async validatePassword(email: string, password: string): Promise<boolean> {
    try {
      const user = await this.findByEmail(email);
      return bcrypt.compare(password, user.password);
    } catch {
      return false;
    }
  }

  // PRIVATE HELPERS - Hidden implementation
  private async ensureEmailNotExists(email: string): Promise<void> {
    if (this.users.has(email)) {
      throw new ConflictException('Email already exists');
    }
  }

  private async hashAndSaveUser(dto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(dto.password, this.SALT_ROUNDS);
    const user: User = {
      id: this.generateId(),
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
      createdAt: new Date()
    };
    this.users.set(dto.email, user);
    return user;
  }

  private toPublicUser(user: User): UserResponse {
    const { password, ...publicUser } = user;
    return publicUser;
  }

  private generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

---

## 7. BÀI TẬP THỰC HÀNH

### 📝 Câu hỏi Lý thuyết

| # | Câu hỏi | Gợi ý đáp án |
|---|---------|--------------|
| 1 | Decorator là gì? | Function nhận target và modify/annotate nó |
| 2 | `private` khác `protected` thế nào? | private chỉ class, protected thêm subclass |
| 3 | Tại sao @Injectable() cần thiết? | Để NestJS biết class có thể inject |
| 4 | Metadata dùng để làm gì trong NestJS? | Lưu thông tin type để DI container đọc |

### 💻 Bài tập Code

**Tạo custom decorator `@CatchError`:**

```typescript
// Yêu cầu: Decorator bắt error và log, không crash app
// Trước:
@CatchError()
async riskyMethod() {
  throw new Error('Something went wrong');
}
// Kết quả: Log error, return null thay vì crash
```

**Gợi ý:**
```typescript
function CatchError(): MethodDecorator {
  return (target, key, descriptor: PropertyDescriptor) => {
    const original = descriptor.value;
    descriptor.value = async function(...args: any[]) {
      try {
        return await original.apply(this, args);
      } catch (error) {
        // TODO: implement logging và return fallback
      }
    };
  };
}
```

---

## 🔗 Tiếp theo

**[Phần 3: Interface & Abstract Class →](./part3_interface_abstract)**

Trong phần tiếp theo, chúng ta sẽ:
- Hiểu Interface vs Abstract Class
- Tạo `IUserRepository` interface
- Tạo `BaseRepository<T>` abstract class
- Refactor UserService để dùng Repository pattern

---

## 📚 Tóm tắt Phần 2

| Concept | Giải thích |
|---------|------------|
| **Encapsulation** | Ẩn implementation, chỉ expose public API |
| **Access Modifiers** | private/protected/public/readonly |
| **Decorator** | Function modify/annotate class/method/property |
| **Decorator Factory** | Function trả về decorator, cho phép params |
| **Metadata** | Thông tin về types, lưu qua reflect-metadata |

> 💡 **Takeaway**: Decorators là "sugar syntax" cho metadata. NestJS đọc metadata này để tự động configure ứng dụng.
