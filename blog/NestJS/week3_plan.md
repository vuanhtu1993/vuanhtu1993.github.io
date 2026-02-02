---
title: "NestJS: websocket and gateway basics"
date: "2026-02-03"
category: "NestJS"
authors: [anhhtus]
tags: [nestjs, beginner, websocket, gateway]
description: "Tìm hiểu NestJS từ cơ bản đến nâng cao: khái niệm, thành phần chính, cách triển khai, use cases thực tế và best practices để tự động hóa quy trình phát triển phần mềm."
---

# 📚 TUẦN 3: WEBSOCKET & GATEWAY BASICS

> 🎯 **Mục tiêu tuần này**: Hiểu sâu WebSocket protocol, Socket.io, và NestJS Gateway pattern

<!--truncate-->

---

## 1. CHỨC NĂNG CẦN HOÀN THÀNH

| STT | Chức năng | Mô tả | Output |
|-----|-----------|-------|--------|
| 3.1 | Setup Socket.io | Cài đặt và config WebSocket Gateway | Connection works |
| 3.2 | GameGateway | Tạo gateway cho game module | Events có thể emit/receive |
| 3.3 | Room Concept | Join/Leave room logic | Client vào được room |
| 3.4 | Event Broadcasting | Gửi message cho room members | Real-time message delivery |
| 3.5 | Simple Chat Demo | Chat room để verify concepts | 2 clients chat được |

---

## 2. KIẾN THỨC CẦN NẮM VỮNG

### 2.1 HTTP vs WebSocket

#### 📖 So sánh Protocol

| Đặc điểm | HTTP | WebSocket |
|----------|------|-----------|
| Connection | Request → Response → Close | Persistent (giữ mở) |
| Communication | Half-duplex (1 chiều tại 1 thời điểm) | Full-duplex (2 chiều đồng thời) |
| Initiation | Client luôn là bên bắt đầu | Cả 2 bên có thể gửi bất kỳ lúc nào |
| Overhead | Header lớn mỗi request | Handshake 1 lần, sau đó minimal |
| Use case | REST APIs, web pages | Real-time: chat, games, notifications |

**Flow comparison:**
```
HTTP:
Client ──Request──> Server
Client <──Response── Server
(Connection closed)

WebSocket:
Client ══════════════════════════ Server
        ←── Message ───→
        ←── Message ───→
        (Connection stays open)
```

**Tại sao Quiz App cần WebSocket?**
- Host gửi câu hỏi → Tất cả Players nhận ngay lập tức
- Players trả lời → Host thấy real-time
- Leaderboard update → Mọi người thấy đồng thời
- HTTP polling = lag + waste resources

---

### 2.2 Socket.io Concepts

#### 📖 Core Terms

| Term | Mô tả | Ví dụ |
|------|-------|-------|
| **Socket** | 1 connection từ client | Mỗi browser tab = 1 socket |
| **Server** | Socket.io server instance | NestJS Gateway |
| **Room** | Nhóm sockets | 1 phòng quiz |
| **Namespace** | Isolated channel | `/admin`, `/game` |
| **Event** | Message type | `'joinRoom'`, `'newQuestion'` |

#### 📖 Room Concept
**Khái niệm:**
- Room = logical grouping của sockets
- 1 socket có thể join nhiều rooms
- Gửi message cho cả room: `server.to('room').emit()`

```typescript
// Join room
socket.join('room:123456');  // PIN = 123456

// Leave room
socket.leave('room:123456');

// Rooms của 1 socket
console.log(socket.rooms);  // Set { socket.id, 'room:123456' }
```

#### 📖 Namespace vs Room
```
Namespace (/game)
├── Room A (quiz:123)
│   ├── Socket 1
│   ├── Socket 2
│   └── Socket 3
└── Room B (quiz:456)
    ├── Socket 4
    └── Socket 5
```

**Khi nào dùng?**
- **Namespace**: Tách biệt logic hoàn toàn (admin panel vs game)
- **Room**: Group sockets trong cùng namespace (players trong 1 quiz)

---

### 2.3 NestJS Gateway Pattern

#### 📖 Gateway
**Khái niệm:**
- Gateway = WebSocket equivalent của Controller
- Handle WebSocket connections và events
- Decorate với `@WebSocketGateway()`

**Core Component:**
```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },  // CORS config
  namespace: '/game',     // Optional namespace
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer()
  server: Server;  // Socket.io server instance

  // Called when client connects
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  // Called when client disconnects
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Handle custom event
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { pin: string; nickname: string },
  ) {
    const roomId = `room:${data.pin}`;
    client.join(roomId);
    
    // Notify others in room
    client.to(roomId).emit('playerJoined', {
      nickname: data.nickname,
    });
    
    return { success: true, roomId };
  }
}
```

---

### 2.4 Event Patterns

#### 📖 Emit Types

```typescript
// 1. Emit to sender only
client.emit('event', data);

// 2. Broadcast to everyone EXCEPT sender
client.broadcast.emit('event', data);

// 3. Emit to everyone in a room
this.server.to('room:123').emit('event', data);

// 4. Emit to everyone (including sender)
this.server.emit('event', data);

// 5. Emit to specific socket
this.server.to(socketId).emit('event', data);
```

**Visual:**
```
Room: quiz:123
┌─────────────────────────────────────────┐
│  Socket A (sender)    Socket B    Socket C │
└─────────────────────────────────────────┘

client.emit()           → A only
client.broadcast        → B, C
server.to('quiz:123')   → A, B, C
client.to('quiz:123')   → B, C (not A)
```

#### 📖 Acknowledgement
```typescript
// Server side
@SubscribeMessage('checkAnswer')
handleCheckAnswer(@MessageBody() data: any) {
  const isCorrect = this.checkAnswer(data);
  return { correct: isCorrect, score: 100 };  // Automatically acknowledged
}

// Client side (JS)
socket.emit('checkAnswer', { questionId: 1, answer: 2 }, (response) => {
  console.log(response);  // { correct: true, score: 100 }
});
```

---

### 2.5 Gateway Lifecycle Hooks

```typescript
@WebSocketGateway()
export class GameGateway 
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  
  // After gateway is initialized
  afterInit(server: Server) {
    console.log('Gateway initialized');
  }

  // When new client connects
  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Connected: ${client.id}`);
    console.log(`Total connections: ${this.server.engine.clientsCount}`);
  }

  // When client disconnects
  handleDisconnect(client: Socket) {
    console.log(`Disconnected: ${client.id}`);
    // Cleanup: remove from rooms, notify others
  }
}
```

---

## 3. STEP BY STEP TRIỂN KHAI

### Bước 1: Cài đặt Dependencies

```bash
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
```

### Bước 2: Tạo GameModule và Gateway

```bash
nest generate module game
nest generate gateway game/game
```

### Bước 3: Setup Basic Gateway

```typescript
// src/game/game.gateway.ts
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('GameGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    return { event: 'pong', data: { timestamp: Date.now() } };
  }
}
```

### Bước 4: Implement Room Logic

```typescript
// src/game/game.gateway.ts
@SubscribeMessage('createRoom')
handleCreateRoom(
  @ConnectedSocket() client: Socket,
  @MessageBody() data: { quizId: string },
) {
  // Generate random PIN
  const pin = Math.random().toString().substring(2, 8);
  const roomId = `room:${pin}`;
  
  client.join(roomId);
  client.data.isHost = true;
  client.data.roomId = roomId;
  
  this.logger.log(`Room created: ${pin}`);
  
  return { success: true, pin };
}

@SubscribeMessage('joinRoom')
handleJoinRoom(
  @ConnectedSocket() client: Socket,
  @MessageBody() data: { pin: string; nickname: string },
) {
  const roomId = `room:${data.pin}`;
  
  // Check if room exists
  const room = this.server.sockets.adapter.rooms.get(roomId);
  if (!room) {
    return { success: false, error: 'Room not found' };
  }
  
  client.join(roomId);
  client.data.nickname = data.nickname;
  client.data.roomId = roomId;
  
  // Notify host and other players
  client.to(roomId).emit('playerJoined', {
    nickname: data.nickname,
    playersCount: room.size,
  });
  
  return { success: true };
}

@SubscribeMessage('sendMessage')
handleMessage(
  @ConnectedSocket() client: Socket,
  @MessageBody() data: { message: string },
) {
  const roomId = client.data.roomId;
  if (!roomId) {
    return { success: false, error: 'Not in a room' };
  }
  
  // Broadcast to room (including sender)
  this.server.to(roomId).emit('newMessage', {
    from: client.data.nickname || client.id,
    message: data.message,
    timestamp: Date.now(),
  });
  
  return { success: true };
}
```

### Bước 5: Tạo Simple Test Client

```html
<!-- test-client.html (để test trong browser) -->
<!DOCTYPE html>
<html>
<head>
  <title>Socket.io Test</title>
  <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
</head>
<body>
  <h1>WebSocket Test Client</h1>
  
  <div>
    <input id="nickname" placeholder="Nickname">
    <input id="pin" placeholder="Room PIN">
    <button onclick="joinRoom()">Join Room</button>
    <button onclick="createRoom()">Create Room</button>
  </div>
  
  <div>
    <input id="message" placeholder="Message">
    <button onclick="sendMessage()">Send</button>
  </div>
  
  <div id="log"></div>

  <script>
    const socket = io('http://localhost:3000');
    
    socket.on('connect', () => {
      log('Connected: ' + socket.id);
    });
    
    socket.on('playerJoined', (data) => {
      log('Player joined: ' + data.nickname);
    });
    
    socket.on('newMessage', (data) => {
      log(`${data.from}: ${data.message}`);
    });
    
    function createRoom() {
      socket.emit('createRoom', { quizId: '123' }, (res) => {
        log('Room created: PIN = ' + res.pin);
        document.getElementById('pin').value = res.pin;
      });
    }
    
    function joinRoom() {
      const pin = document.getElementById('pin').value;
      const nickname = document.getElementById('nickname').value;
      socket.emit('joinRoom', { pin, nickname }, (res) => {
        log('Joined: ' + JSON.stringify(res));
      });
    }
    
    function sendMessage() {
      const message = document.getElementById('message').value;
      socket.emit('sendMessage', { message });
    }
    
    function log(msg) {
      document.getElementById('log').innerHTML += msg + '<br>';
    }
  </script>
</body>
</html>
```

---

## 4. VERIFY CHECKLIST

### 📋 Câu hỏi LÝ THUYẾT

| # | Câu hỏi | Đáp án mong đợi |
|---|---------|-----------------|
| 1 | WebSocket khác HTTP ở điểm nào quan trọng nhất? | Persistent connection, full-duplex, server có thể push |
| 2 | Room trong Socket.io dùng để làm gì? | Group sockets, gửi message cho nhóm cụ thể |
| 3 | `client.emit()` vs `client.broadcast.emit()` khác gì? | emit → sender only, broadcast → tất cả trừ sender |
| 4 | Namespace khác Room như thế nào? | Namespace tách biệt hoàn toàn, Room group trong namespace |
| 5 | `@SubscribeMessage()` decorator làm gì? | Đăng ký handler cho event cụ thể |
| 6 | Lifecycle hooks nào có trong Gateway? | OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect |

### 📋 Câu hỏi THỰC HÀNH

| # | Kiểm tra | Cách verify |
|---|----------|-------------|
| 1 | Gateway hoạt động? | Connect socket client, thấy log "Connected" |
| 2 | Create room được? | Nhận được PIN, client join room thành công |
| 3 | Join room được? | Client khác nhận event 'playerJoined' |
| 4 | Broadcast hoạt động? | Send message, tất cả trong room nhận được |
| 5 | Disconnect hoạt động? | Close tab, server log "Disconnected" |

---

## 5. MỞ RỘNG - BEST PRACTICES

### 5.1 Error Handling trong WebSocket

```typescript
import { WsException } from '@nestjs/websockets';

@SubscribeMessage('joinRoom')
handleJoinRoom(@MessageBody() data: any) {
  if (!data.pin) {
    throw new WsException('PIN is required');
  }
  // ...
}
```

### 5.2 Authentication cho WebSocket

```typescript
@WebSocketGateway()
export class GameGateway {
  
  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      const user = await this.authService.verifyToken(token);
      client.data.user = user;
    } catch (e) {
      client.emit('error', { message: 'Unauthorized' });
      client.disconnect();
    }
  }
}

// Client side
const socket = io('http://localhost:3000', {
  auth: { token: 'jwt-token-here' }
});
```

### 5.3 Typing với DTOs

```typescript
// dto/join-room.dto.ts
export class JoinRoomDto {
  @IsString()
  pin: string;

  @IsString()
  @MinLength(2)
  nickname: string;
}

// Gateway
@SubscribeMessage('joinRoom')
@UsePipes(new ValidationPipe())
handleJoinRoom(@MessageBody() dto: JoinRoomDto) {
  // dto is validated
}
```

### 5.4 Testing Gateway

```typescript
// game.gateway.spec.ts
describe('GameGateway', () => {
  let gateway: GameGateway;
  let mockSocket: Partial<Socket>;

  beforeEach(() => {
    mockSocket = {
      id: 'test-socket-id',
      join: jest.fn(),
      data: {},
    };
  });

  it('should create room with PIN', () => {
    const result = gateway.handleCreateRoom(
      mockSocket as Socket,
      { quizId: '123' }
    );
    expect(result.success).toBe(true);
    expect(result.pin).toMatch(/^\d{6}$/);
  });
});
```

### 5.5 Common Mistakes

| ❌ Mistake | ✅ Solution |
|-----------|------------|
| Không cleanup khi disconnect | Implement handleDisconnect properly |
| Gửi sensitive data qua socket | Validate và sanitize tất cả data |
| Memory leak (event listeners) | Remove listeners khi socket disconnect |
| Không handle reconnection | Lưu state, cho phép rejoin |

---

## 📅 Timeline Tuần 3

| Ngày | Hoạt động | Thời gian |
|------|-----------|-----------|
| Ngày 1-2 | Đọc docs WebSocket, Socket.io | 2-3 giờ |
| Ngày 3-4 | Setup Gateway + Room logic | 3-4 giờ |
| Ngày 5-6 | Test với browser client | 2-3 giờ |
| Ngày 7 | Review + Practice | 1-2 giờ |

---

> 💡 **Tip**: Mở 2 browser tabs để test room joining và message broadcasting. Console log là cách tốt nhất để hiểu event flow.
