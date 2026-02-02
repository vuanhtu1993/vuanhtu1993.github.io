---
title: "NestJS: Redis integration"
date: "2026-02-03"
category: "NestJS"
authors: [anhhtus]
tags: [nestjs, beginner, redis, room, gateway]
description: "Tìm hiểu NestJS từ cơ bản đến nâng cao: khái niệm, thành phần chính, cách triển khai, use cases thực tế và best practices để tự động hóa quy trình phát triển phần mềm."
---

# 📚 TUẦN 4: REDIS INTEGRATION & ROOM MANAGEMENT

> 🎯 **Mục tiêu tuần này**: Hiểu Redis data structures, tích hợp Redis vào NestJS cho real-time state management

<!--truncate-->

---

## 1. CHỨC NĂNG CẦN HOÀN THÀNH

| STT | Chức năng | Mô tả | Output |
|-----|-----------|-------|--------|
| 4.1 | Redis Setup | Connect Redis, tạo RedisModule | Redis connected |
| 4.2 | Room State | Lưu room state trong Redis | Room data persisted |
| 4.3 | Player Management | Track players trong room | Players list real-time |
| 4.4 | Redis Adapter | Socket.io multi-instance support | Events sync across instances |
| 4.5 | Room Lifecycle | Create, Join, Leave, Cleanup | Complete room flow |

---

## 2. KIẾN THỨC CẦN NẮM VỮNG

### 2.1 Redis Fundamentals

#### 📖 Tại sao cần Redis?
```
PostgreSQL                Redis
├── Dữ liệu lâu dài      ├── Dữ liệu tạm thời
├── Complex queries      ├── Simple key-value
├── ACID transactions    ├── Tốc độ cực cao
└── Milliseconds         └── Microseconds

Quiz App cần cả 2:
- PostgreSQL: Users, Quizzes, Questions, Results
- Redis: Room state, Player list, Live leaderboard
```

---

### 2.2 Redis Data Structures

#### 📖 STRING
**Khái niệm:** Giá trị đơn giản, key-value cơ bản

```bash
# Commands
SET room:123456:state "waiting"
GET room:123456:state           # → "waiting"
SETEX room:123456:state 3600 "waiting"  # Expire sau 1 giờ
```

**Use case trong Quiz App:**
- Room state: `waiting`, `playing`, `finished`
- Current question index
- Timer countdown

```typescript
// NestJS
await redis.set(`room:${pin}:state`, 'waiting');
await redis.setex(`room:${pin}:state`, 3600, 'waiting');  // TTL 1h
const state = await redis.get(`room:${pin}:state`);
```

---

#### 📖 SET
**Khái niệm:** Tập hợp các giá trị unique, không thứ tự

```bash
# Commands
SADD room:123456:players "player1" "player2"
SMEMBERS room:123456:players    # → ["player1", "player2"]
SISMEMBER room:123456:players "player1"  # → 1 (true)
SREM room:123456:players "player1"       # Remove
SCARD room:123456:players       # Count members
```

**Use case trong Quiz App:**
- Danh sách players trong room
- Check player đã join chưa
- Count số players

```typescript
await redis.sadd(`room:${pin}:players`, playerId);
const players = await redis.smembers(`room:${pin}:players`);
const isPlayer = await redis.sismember(`room:${pin}:players`, playerId);
await redis.srem(`room:${pin}:players`, playerId);
```

---

#### 📖 HASH
**Khái niệm:** Object-like structure, field-value pairs

```bash
# Commands
HSET room:123456:config quizId "abc" timeLimit "30"
HGET room:123456:config quizId          # → "abc"
HGETALL room:123456:config              # → {quizId: "abc", timeLimit: "30"}
HINCRBY room:123456:stats answeredCount 1  # Increment
```

**Use case trong Quiz App:**
- Room config (quizId, timeLimit, hostId)
- Player info (nickname, socketId, score)
- Question stats (correct count, avg time)

```typescript
await redis.hset(`room:${pin}:config`, {
  quizId: quiz.id,
  hostId: host.id,
  timeLimit: 30,
});
const config = await redis.hgetall(`room:${pin}:config`);
```

---

#### 📖 ZSET (Sorted Set) ⭐ Quan trọng cho Leaderboard
**Khái niệm:** Set với score, tự động sort theo score

```bash
# Commands
ZADD room:123456:leaderboard 100 "player1" 85 "player2"
ZREVRANGE room:123456:leaderboard 0 9 WITHSCORES  # Top 10 (cao → thấp)
ZINCRBY room:123456:leaderboard 50 "player1"      # +50 điểm
ZRANK room:123456:leaderboard "player1"           # Xếp hạng (0-indexed)
ZREVRANK room:123456:leaderboard "player1"        # Xếp hạng ngược
ZSCORE room:123456:leaderboard "player1"          # Điểm hiện tại
```

**Tại sao ZSET tuyệt vời cho Leaderboard?**
```
Thao tác              | Array     | ZSET
----------------------|-----------|---------------
Insert + Sort         | O(N log N)| O(log N)
Get Top 10            | O(N)      | O(log N + 10)
Update score + Resort | O(N log N)| O(log N)
Get player rank       | O(N)      | O(log N)
```

```typescript
// Thêm/cập nhật điểm
await redis.zadd(`room:${pin}:leaderboard`, score, playerId);

// Tăng điểm
await redis.zincrby(`room:${pin}:leaderboard`, 50, playerId);

// Top 10 (điểm cao nhất)
const top10 = await redis.zrevrange(
  `room:${pin}:leaderboard`, 0, 9, 'WITHSCORES'
);
// → ['player1', '150', 'player2', '100', ...]

// Xếp hạng của player
const rank = await redis.zrevrank(`room:${pin}:leaderboard`, playerId);
```

---

### 2.3 Redis Key Design cho Quiz App

```
📦 Redis Keys Schema:

┌─────────────────────────────────────────────────────────────┐
│ Room State                                                  │
├─────────────────────────────────────────────────────────────┤
│ room:{pin}:state           → STRING: "waiting|playing|done" │
│ room:{pin}:config          → HASH: {quizId, hostId, ...}    │
│ room:{pin}:players         → SET: {playerId1, playerId2}    │
│ room:{pin}:leaderboard     → ZSET: {player: score}          │
│ room:{pin}:current_question → STRING: "0"                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Player Data                                                 │
├─────────────────────────────────────────────────────────────┤
│ player:{id}:room           → STRING: "123456" (current PIN) │
│ player:{id}:info           → HASH: {nickname, socketId}     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Question State (per question)                               │
├─────────────────────────────────────────────────────────────┤
│ room:{pin}:q{n}:answered   → SET: {playerId1, playerId2}    │
│ room:{pin}:q{n}:startTime  → STRING: timestamp              │
└─────────────────────────────────────────────────────────────┘
```

**Naming Convention:**
- Use `:` as separator (standard)
- Hierarchy: `domain:id:property`
- Use `{}` to indicate variable parts

---

### 2.4 Redis + Socket.io Adapter

#### 📖 Vấn đề Multi-instance
```
Scenario: 2 NestJS instances (load balanced)

User A ──→ Instance 1 ────┐
                          │ Không thấy nhau!
User B ──→ Instance 2 ────┘

User A emit 'message' → Instance 1 broadcast
→ Chỉ users trên Instance 1 nhận được
→ User B KHÔNG nhận được (khác instance)
```

#### 📖 Giải pháp: Redis Adapter
```
User A ──→ Instance 1 ──┐
                        ├──→ Redis Pub/Sub ──→ All Instances
User B ──→ Instance 2 ──┘

User A emit 'message'
→ Instance 1 publish to Redis
→ Redis broadcast to all instances
→ Instance 2 nhận và emit cho User B
```

```typescript
// Setup Redis Adapter
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(): Promise<void> {
    const pubClient = createClient({ url: 'redis://localhost:6379' });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: any) {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}

// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const redisAdapter = new RedisIoAdapter(app);
  await redisAdapter.connectToRedis();
  app.useWebSocketAdapter(redisAdapter);
  
  await app.listen(3000);
}
```

---

## 3. STEP BY STEP TRIỂN KHAI

### Bước 1: Cài đặt Dependencies

```bash
npm install ioredis @socket.io/redis-adapter
```

### Bước 2: Tạo RedisModule

```typescript
// src/redis/redis.module.ts
import { Global, Module } from '@nestjs/common';
import { Redis } from 'ioredis';

const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        return new Redis({
          host: 'localhost',
          port: 6379,
        });
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}

// Export token để inject
export { REDIS_CLIENT };
```

### Bước 3: Tạo RoomService

```typescript
// src/game/room.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.module';

@Injectable()
export class RoomService {
  constructor(@Inject(REDIS_CLIENT) private redis: Redis) {}

  // Tạo room mới
  async createRoom(pin: string, hostId: string, quizId: string) {
    const roomKey = `room:${pin}`;
    
    await this.redis.hset(`${roomKey}:config`, {
      hostId,
      quizId,
      createdAt: Date.now().toString(),
    });
    await this.redis.set(`${roomKey}:state`, 'waiting');
    await this.redis.expire(`${roomKey}:config`, 3600); // 1 hour TTL
    await this.redis.expire(`${roomKey}:state`, 3600);
    
    return { pin, hostId, quizId };
  }

  // Player join room
  async joinRoom(pin: string, playerId: string, nickname: string) {
    const roomKey = `room:${pin}`;
    
    // Check room exists
    const state = await this.redis.get(`${roomKey}:state`);
    if (!state) {
      throw new Error('Room not found');
    }
    if (state !== 'waiting') {
      throw new Error('Game already started');
    }
    
    // Add player
    await this.redis.sadd(`${roomKey}:players`, playerId);
    await this.redis.hset(`player:${playerId}:info`, { nickname, pin });
    
    return this.getPlayers(pin);
  }

  // Lấy danh sách players
  async getPlayers(pin: string) {
    const playerIds = await this.redis.smembers(`room:${pin}:players`);
    const players = [];
    
    for (const id of playerIds) {
      const info = await this.redis.hgetall(`player:${id}:info`);
      players.push({ id, ...info });
    }
    
    return players;
  }

  // Player leave room
  async leaveRoom(pin: string, playerId: string) {
    await this.redis.srem(`room:${pin}:players`, playerId);
    await this.redis.del(`player:${playerId}:info`);
  }

  // Get room state
  async getRoomState(pin: string) {
    const roomKey = `room:${pin}`;
    const [state, config, players] = await Promise.all([
      this.redis.get(`${roomKey}:state`),
      this.redis.hgetall(`${roomKey}:config`),
      this.getPlayers(pin),
    ]);
    
    return { state, config, players };
  }

  // Update leaderboard
  async updateScore(pin: string, playerId: string, score: number) {
    await this.redis.zincrby(`room:${pin}:leaderboard`, score, playerId);
  }

  // Get leaderboard
  async getLeaderboard(pin: string, limit = 10) {
    const results = await this.redis.zrevrange(
      `room:${pin}:leaderboard`,
      0,
      limit - 1,
      'WITHSCORES'
    );
    
    // Convert to array of {playerId, score}
    const leaderboard = [];
    for (let i = 0; i < results.length; i += 2) {
      leaderboard.push({
        playerId: results[i],
        score: parseInt(results[i + 1]),
      });
    }
    return leaderboard;
  }

  // Cleanup room
  async cleanupRoom(pin: string) {
    const roomKey = `room:${pin}`;
    const playerIds = await this.redis.smembers(`${roomKey}:players`);
    
    // Delete all room keys
    const keys = await this.redis.keys(`${roomKey}:*`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
    
    // Delete player keys
    for (const id of playerIds) {
      await this.redis.del(`player:${id}:info`);
    }
  }
}
```

### Bước 4: Update GameGateway

```typescript
// src/game/game.gateway.ts
@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private roomService: RoomService) {}

  @SubscribeMessage('createRoom')
  async handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { quizId: string },
  ) {
    const pin = this.generatePin();
    const hostId = client.id;
    
    await this.roomService.createRoom(pin, hostId, data.quizId);
    
    client.join(`room:${pin}`);
    client.data.pin = pin;
    client.data.isHost = true;
    
    return { success: true, pin };
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { pin: string; nickname: string },
  ) {
    try {
      const players = await this.roomService.joinRoom(
        data.pin,
        client.id,
        data.nickname,
      );
      
      client.join(`room:${data.pin}`);
      client.data.pin = data.pin;
      client.data.nickname = data.nickname;
      
      // Notify room
      this.server.to(`room:${data.pin}`).emit('playerJoined', {
        players,
        newPlayer: data.nickname,
      });
      
      return { success: true, players };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async handleDisconnect(client: Socket) {
    const { pin, nickname, isHost } = client.data;
    
    if (pin) {
      if (isHost) {
        // Host disconnect - end game
        this.server.to(`room:${pin}`).emit('gameEnded', {
          reason: 'Host disconnected',
        });
        await this.roomService.cleanupRoom(pin);
      } else {
        // Player disconnect
        await this.roomService.leaveRoom(pin, client.id);
        const players = await this.roomService.getPlayers(pin);
        this.server.to(`room:${pin}`).emit('playerLeft', {
          nickname,
          players,
        });
      }
    }
  }

  private generatePin(): string {
    return Math.random().toString().substring(2, 8);
  }
}
```

### Bước 5: TTL và Cleanup Strategy

```typescript
// Room tự động expire sau 1 giờ không active
async createRoom(pin: string, ...) {
  // Set TTL cho tất cả keys
  const multi = this.redis.multi();
  multi.hset(`room:${pin}:config`, { ... });
  multi.expire(`room:${pin}:config`, 3600);
  multi.set(`room:${pin}:state`, 'waiting');
  multi.expire(`room:${pin}:state`, 3600);
  await multi.exec();
}

// Extend TTL khi có activity
async touchRoom(pin: string) {
  const keys = await this.redis.keys(`room:${pin}:*`);
  const multi = this.redis.multi();
  for (const key of keys) {
    multi.expire(key, 3600);
  }
  await multi.exec();
}
```

---

## 4. VERIFY CHECKLIST

### 📋 Câu hỏi LÝ THUYẾT

| # | Câu hỏi | Đáp án mong đợi |
|---|---------|-----------------|
| 1 | Redis data structures nào phù hợp cho leaderboard? | ZSET - tự động sort theo score |
| 2 | SET khác ZSET ở điểm nào? | SET không có score, ZSET có score và sorted |
| 3 | Tại sao cần Redis Adapter cho Socket.io? | Để sync events giữa multiple instances |
| 4 | HSET và HGETALL dùng khi nào? | Lưu object-like data, lấy tất cả fields |
| 5 | TTL (Time To Live) quan trọng vì sao? | Auto cleanup, tránh memory leak |
| 6 | Key naming convention như thế nào? | `domain:id:property` với `:` separator |

### 📋 Câu hỏi THỰC HÀNH

| # | Kiểm tra | Cách verify |
|---|----------|-------------|
| 1 | Redis connected? | redis-cli PING → PONG |
| 2 | Room được lưu trong Redis? | redis-cli KEYS "room:*" |
| 3 | Players list đúng? | redis-cli SMEMBERS room:123456:players |
| 4 | Leaderboard sort đúng? | redis-cli ZREVRANGE room:123456:leaderboard 0 -1 WITHSCORES |
| 5 | Room cleanup hoạt động? | Disconnect → KEYS "room:*" = empty |

---

## 5. MỞ RỘNG - BEST PRACTICES

### 5.1 Redis Transactions

```typescript
// Atomic operations với MULTI/EXEC
async atomicScoreUpdate(pin: string, playerId: string, score: number) {
  const multi = this.redis.multi();
  multi.sadd(`room:${pin}:q1:answered`, playerId);
  multi.zincrby(`room:${pin}:leaderboard`, score, playerId);
  const results = await multi.exec();
  return results;
}
```

### 5.2 Lua Scripts (Advanced)

```typescript
// Atomic: Check + Update trong 1 operation
const SUBMIT_ANSWER_SCRIPT = `
  local answerKey = KEYS[1]
  local leaderboardKey = KEYS[2]
  local playerId = ARGV[1]
  local score = tonumber(ARGV[2])
  
  -- Check if already answered
  if redis.call('SISMEMBER', answerKey, playerId) == 1 then
    return -1  -- Already answered
  end
  
  -- Add to answered set
  redis.call('SADD', answerKey, playerId)
  
  -- Update leaderboard
  return redis.call('ZINCRBY', leaderboardKey, score, playerId)
`;

await redis.eval(
  SUBMIT_ANSWER_SCRIPT,
  2,  // Number of keys
  `room:${pin}:q1:answered`,
  `room:${pin}:leaderboard`,
  playerId,
  score.toString()
);
```

### 5.3 Connection Pooling

```typescript
// ioredis tự động pool connections
const redis = new Redis({
  host: 'localhost',
  port: 6379,
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  lazyConnect: true,  // Connect on first command
});
```

### 5.4 Common Mistakes

| ❌ Mistake | ✅ Solution |
|-----------|------------|
| Không set TTL | Luôn set expire cho temporary data |
| Keys quá dài | Dùng short prefixes, vẫn đọc được |
| Blocking operations | Dùng SCAN thay vì KEYS trong prod |
| Không handle connection errors | Implement retry logic |

---

## 📅 Timeline Tuần 4

| Ngày | Hoạt động | Thời gian |
|------|-----------|-----------|
| Ngày 1-2 | Đọc Redis docs, practice commands | 2-3 giờ |
| Ngày 3-4 | Implement RedisModule + RoomService | 3-4 giờ |
| Ngày 5-6 | Integrate với Gateway, test flow | 3-4 giờ |
| Ngày 7 | Redis Adapter + Review | 1-2 giờ |

---

> 💡 **Tip**: Dùng Redis CLI (`redis-cli`) để debug và xem data realtime. Chạy `MONITOR` để xem tất cả commands.
