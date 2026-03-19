---
title: "OOP trong NestJS (Phần 1): Từ Function đến Class - Nền Tảng Cho React/Node Developer"
date: "2026-02-02"
category: "NestJS"
authors: [anhhtus]
tags: [nestjs, oop, typescript, beginner, class, functional-programming]
description: "Hiểu sâu về Class và OOP từ góc nhìn của Functional Programming developer. So sánh Express (functional) với NestJS (OOP), giải thích this keyword, constructor patterns và cách chuyển đổi tư duy."
---

# 🚀 OOP trong NestJS (Phần 1): Từ Function đến Class

> 🎯 **Series này dành cho ai?** ReactJS/NodeJS developers quen với Functional Programming, muốn hiểu bản chất OOP trong NestJS thay vì chỉ copy-paste code.

<!--truncate-->

---

## 📌 Giới Thiệu Series

Nếu bạn từ React/Node (Functional Programming) chuyển sang NestJS, có lẽ bạn đang gặp khó khăn với:
- **Class và `this`** - Functional không có `this`!
- **Decorators** - `@Controller()`, `@Injectable()` là gì?
- **Interface vs Abstract Class** - Khi nào dùng cái nào?
- **DI, IoC, DIP** - Quá nhiều từ viết tắt!

Series 6 phần này sẽ giúp bạn **hiểu bản chất** từng concept, sử dụng **cùng một ví dụ UserService** xuyên suốt để thấy cách mỗi concept xây dựng lên nhau.

---

## 1. TẠI SAO NESTJS DÙNG OOP?

### 1.1 So sánh Express (Functional) vs NestJS (OOP)

**Express - Functional Style:**
```javascript
// userService.js - Pure functions
const users = [];

const createUser = (userData) => {
  const user = { id: Date.now(), ...userData };
  users.push(user);
  return user;
};

const findUserByEmail = (email) => {
  return users.find(u => u.email === email);
};

module.exports = { createUser, findUserByEmail };
```

```javascript
// userController.js
const { createUser } = require('./userService');
const express = require('express');
const router = express.Router();

router.post('/users', (req, res) => {
  const user = createUser(req.body);
  res.json(user);
});
```

**NestJS - OOP Style:**
```typescript
// user.service.ts
@Injectable()
export class UserService {
  private users: User[] = [];

  create(userData: CreateUserDto): User {
    const user = { id: Date.now(), ...userData };
    this.users.push(user);
    return user;
  }

  findByEmail(email: string): User | undefined {
    return this.users.find(u => u.email === email);
  }
}
```

```typescript
// user.controller.ts
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() userData: CreateUserDto) {
    return this.userService.create(userData);
  }
}
```

### 1.2 Tại sao chọn OOP?

| Tiêu chí | Functional (Express) | OOP (NestJS) |
|----------|---------------------|--------------|
| **Tổ chức code** | Functions rải rác | Nhóm theo class |
| **State management** | Closures, external store | `this` trong instance |
| **Dependencies** | `require()` trực tiếp | Dependency Injection |
| **Testing** | Mock module imports | Inject mock objects |
| **Scaling team** | Khó enforce patterns | Có structure rõ ràng |

> 💡 **Key insight**: OOP không "tốt hơn" FP - chúng là tools khác nhau. NestJS chọn OOP vì nó phù hợp cho enterprise applications với team lớn cần architecture nhất quán.

---

## 2. CLASS VS FUNCTION - CÓ GÌ KHÁC?

### 2.1 Function: Stateless by Default

```typescript
// Functional approach - State ở bên ngoài
let userCount = 0;

const createUser = (name: string) => {
  userCount++;
  return { id: userCount, name };
};

createUser('Alice'); // { id: 1, name: 'Alice' }
createUser('Bob');   // { id: 2, name: 'Bob' }
```

**Vấn đề**: `userCount` là global/module state → khó control, khó test.

### 2.2 Class: Encapsulated State

```typescript
// OOP approach - State trong instance
class UserService {
  private userCount = 0;           // State của instance
  private users: User[] = [];      // Data storage

  create(name: string): User {
    this.userCount++;
    const user = { id: this.userCount, name };
    this.users.push(user);
    return user;
  }

  getCount(): number {
    return this.userCount;
  }
}

// Mỗi instance có state riêng
const service1 = new UserService();
const service2 = new UserService();

service1.create('Alice');  // { id: 1, name: 'Alice' }
service2.create('Bob');    // { id: 1, name: 'Bob' } ← ID riêng biệt!

service1.getCount();  // 1
service2.getCount();  // 1
```

> 💡 **Key insight**: Class = **Blueprint** + **State Container**. Mỗi `new` tạo ra một instance với state riêng biệt.

### 2.3 Bảng So Sánh

| Đặc điểm | Pure Function | Class |
|----------|--------------|-------|
| **State** | Không có (hoặc external) | Trong instance (`this`) |
| **Tạo instance** | Không cần | `new ClassName()` |
| **Shared state** | Qua closures/modules | Qua `this` |
| **Testability** | Dễ nếu pure | Cần mock dependencies |

---

## 3. `this` KEYWORD - HIỂU RÕ MỘT LẦN

### 3.1 Tại sao FP Developer ghét `this`?

```typescript
// Vấn đề thường gặp
class UserService {
  private prefix = 'USER';

  formatId(id: number) {
    return `${this.prefix}-${id}`;
  }
}

const service = new UserService();
const formatter = service.formatId;

console.log(service.formatId(1));  // "USER-1" ✅
console.log(formatter(1));         // Error! this is undefined ❌
```

### 3.2 Giải thích `this` cho FP Developer

Hãy nghĩ `this` như một **implicity first argument**:

```typescript
// Tương đương về logic
class UserService {
  formatId(id: number) {
    return `${this.prefix}-${id}`;
  }
}

// Như thể function nhận thêm `self` argument
function formatId(self: UserService, id: number) {
  return `${self.prefix}-${id}`;
}
```

**Rule đơn giản**: `this` = object **đứng trước dấu chấm** khi gọi method.

```typescript
service.formatId(1);     // this = service
otherObj.formatId(1);    // this = otherObj
formatId(1);             // this = undefined (strict mode)
```

### 3.3 Cách Fix - Arrow Functions

```typescript
class UserService {
  private prefix = 'USER';

  // Arrow function giữ `this` của class
  formatId = (id: number) => {
    return `${this.prefix}-${id}`;
  }
}

const service = new UserService();
const formatter = service.formatId;

console.log(formatter(1));  // "USER-1" ✅ Works!
```

> 💡 **Tại sao arrow function works?** Arrow function không có `this` riêng, nó "bắt" `this` từ scope bao ngoài - trong case này là class instance.

---

## 4. CONSTRUCTOR - KHỞI TẠO DEPENDENCIES

### 4.1 Trong FP: Bạn import trực tiếp

```javascript
// Functional style
const db = require('./database');
const logger = require('./logger');

const createUser = (userData) => {
  logger.log('Creating user...');
  return db.insert('users', userData);
};
```

**Vấn đề**:
- Hard-coded dependencies
- Khó mock khi test
- Tight coupling

### 4.2 Trong OOP: Constructor Injection

```typescript
// OOP style - Dependencies được truyền vào
class UserService {
  constructor(
    private db: Database,
    private logger: Logger
  ) {}

  create(userData: CreateUserDto): User {
    this.logger.log('Creating user...');
    return this.db.insert('users', userData);
  }
}

// Khi sử dụng
const realDb = new PostgresDatabase();
const realLogger = new ConsoleLogger();
const userService = new UserService(realDb, realLogger);

// Khi test
const mockDb = new MockDatabase();
const mockLogger = new MockLogger();
const testService = new UserService(mockDb, mockLogger);
```

### 4.3 TypeScript Shorthand

```typescript
// Verbose way
class UserService {
  private db: Database;
  private logger: Logger;

  constructor(db: Database, logger: Logger) {
    this.db = db;
    this.logger = logger;
  }
}

// Shorthand - TypeScript tự tạo và assign
class UserService {
  constructor(
    private db: Database,
    private logger: Logger
  ) {}
  // Equivalent! TypeScript generates the same code
}
```

---

## 5. XÂY DỰNG USERSERVICE - TỪ FP SANG OOP

### 5.1 Bước 1: Express Version (Functional)

```javascript
// services/userService.js
const bcrypt = require('bcrypt');

const users = new Map();

const createUser = async ({ email, password, name }) => {
  if (users.has(email)) {
    throw new Error('Email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    id: Date.now().toString(),
    email,
    password: hashedPassword,
    name,
    createdAt: new Date()
  };

  users.set(email, user);
  return { id: user.id, email: user.email, name: user.name };
};

const findByEmail = (email) => users.get(email);

const validatePassword = async (email, password) => {
  const user = users.get(email);
  if (!user) return false;
  return bcrypt.compare(password, user.password);
};

module.exports = { createUser, findByEmail, validatePassword };
```

### 5.2 Bước 2: Chuyển sang Class (Chưa có DI)

```typescript
// user.service.ts
import * as bcrypt from 'bcrypt';

interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
}

interface CreateUserDto {
  email: string;
  password: string;
  name: string;
}

interface UserResponse {
  id: string;
  email: string;
  name: string;
}

export class UserService {
  private users: Map<string, User> = new Map();

  async create(dto: CreateUserDto): Promise<UserResponse> {
    if (this.users.has(dto.email)) {
      throw new Error('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user: User = {
      id: Date.now().toString(),
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
      createdAt: new Date()
    };

    this.users.set(dto.email, user);
    return { id: user.id, email: user.email, name: user.name };
  }

  findByEmail(email: string): User | undefined {
    return this.users.get(email);
  }

  async validatePassword(email: string, password: string): Promise<boolean> {
    const user = this.users.get(email);
    if (!user) return false;
    return bcrypt.compare(password, user.password);
  }
}
```

### 5.3 Bước 3: NestJS Version (Với Decorator)

```typescript
// user.service.ts
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()  // ← Decorator này cho phép NestJS quản lý class
export class UserService {
  private users: Map<string, User> = new Map();

  async create(dto: CreateUserDto): Promise<UserResponse> {
    // ... same logic as above
  }

  findByEmail(email: string): User | undefined {
    return this.users.get(email);
  }

  async validatePassword(email: string, password: string): Promise<boolean> {
    // ... same logic as above
  }
}
```

> 📝 **Các bài tiếp theo sẽ giải thích:**
> - Phần 2: `@Injectable()` làm gì?
> - Phần 3: Interface và Abstract Class
> - Phần 4: Dependency Injection đầy đủ

---

## 6. BÀI TẬP THỰC HÀNH

### 📝 Câu hỏi Lý thuyết

| # | Câu hỏi | Gợi ý đáp án |
|---|---------|--------------|
| 1 | Class khác function ở điểm nào cơ bản nhất? | Class có state (this), function thường stateless |
| 2 | `this` trong method trỏ đến đâu? | Object đứng trước dấu chấm khi gọi |
| 3 | Tại sao dùng constructor injection? | Loose coupling, dễ test, dễ thay đổi implementation |
| 4 | Arrow function khác regular function thế nào về `this`? | Arrow không có this riêng, bắt từ scope ngoài |

### 💻 Bài tập Code

```typescript
// TODO: Chuyển function này sang class
const products = [];

const addProduct = (name, price) => {
  products.push({ id: products.length + 1, name, price });
};

const findByName = (name) => {
  return products.find(p => p.name === name);
};

const getTotalValue = () => {
  return products.reduce((sum, p) => sum + p.price, 0);
};
```

**Yêu cầu**:
1. Tạo `ProductService` class
2. Sử dụng TypeScript với types
3. State (`products`) phải là private
4. Thêm method `getAllProducts()`

---

## 🔗 Tiếp theo

**[Phần 2: Encapsulation & Decorators Magic →](./part2_encapsulation_decorators)**

Trong phần tiếp theo, chúng ta sẽ:
- Hiểu encapsulation trong TypeScript
- Giải mã các decorators của NestJS
- Tự tạo custom decorator đầu tiên
- Thêm logging decorator cho UserService

---

## 📚 Tóm tắt

| Concept | FP Approach | OOP Approach |
|---------|-------------|--------------|
| **State** | External/Closures | `this` trong class |
| **Dependencies** | `require()`/`import` | Constructor injection |
| **Organization** | Modules của functions | Classes với methods |
| **Context (`this`)** | Không có | Object gọi method |

> 💡 **Takeaway**: OOP trong NestJS không phải là "thay function bằng class" - mà là cách **tổ chức code** để dễ maintain, test, và scale với team lớn.
