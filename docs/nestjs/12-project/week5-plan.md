---
title: "NestJS: Create Quiz game engine"
date: "2026-02-03"
category: "NestJS"
authors: [anhhtus]
tags: [nestjs, beginner, websocket, gateway]
description: "Tìm hiểu NestJS từ cơ bản đến nâng cao: khái niệm, thành phần chính, cách triển khai, use cases thực tế và best practices để tự động hóa quy trình phát triển phần mềm."
---

# 📚 TUẦN 5: GAME ENGINE & SCORING SYSTEM

> 🎯 **Mục tiêu tuần này**: Hoàn thiện game logic, scoring algorithm, và chơi được 1 game hoàn chỉnh

<!--truncate-->

---

## 1. CHỨC NĂNG CẦN HOÀN THÀNH

| STT | Chức năng | Mô tả | Output |
|-----|-----------|-------|--------|
| 5.1 | Game State Machine | States: waiting → playing → finished | State transitions work |
| 5.2 | Question Broadcast | Host gửi câu hỏi → Players nhận | Đồng bộ câu hỏi |
| 5.3 | Answer Handler | Players submit answer | Validate + record |
| 5.4 | Scoring Algorithm | Điểm = đúng + nhanh | Time-based scoring |
| 5.5 | Live Leaderboard | Update sau mỗi câu | Real-time rankings |
| 5.6 | Game End Flow | Show final results | Complete game cycle |

---

## 2. KIẾN THỨC CẦN NẮM VỮNG

### 2.1 Game State Machine

#### 📖 States và Transitions

```
┌─────────────┐      startGame      ┌─────────────┐
│   WAITING   │ ──────────────────→ │   PLAYING   │
│             │                      │             │
│ Host tạo    │                      │ Questions   │
│ Players join│                      │ in progress │
└─────────────┘                      └──────┬──────┘
                                            │
                                            │ lastQuestion
                                            │ or hostEnds
                                            ▼
                                     ┌─────────────┐
                                     │  FINISHED   │
                                     │             │
                                     │ Show results│
                                     │ Cleanup     │
                                     └─────────────┘
```

#### 📖 PLAYING Sub-states

```
PLAYING
├── SHOW_QUESTION    (5-10s: Hiển thị câu hỏi)
├── ANSWERING        (N seconds: Players trả lời)
├── SHOW_RESULT      (3-5s: Hiển thị đáp án đúng)
└── SHOW_LEADERBOARD (3-5s: Hiển thị xếp hạng)
    └── Loop hoặc → FINISHED
```

**Code Implementation:**
```typescript
enum GameState {
  WAITING = 'waiting',
  PLAYING = 'playing',
  FINISHED = 'finished',
}

enum QuestionPhase {
  SHOW_QUESTION = 'show_question',
  ANSWERING = 'answering',
  SHOW_RESULT = 'show_result',
  SHOW_LEADERBOARD = 'show_leaderboard',
}

interface RoomState {
  gameState: GameState;
  phase?: QuestionPhase;
  currentQuestionIndex: number;
  questionStartTime?: number;
}
```

---

### 2.2 Game Flow (Full Sequence)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. HOST: startGame                                               │
│    → Load questions từ PostgreSQL                                │
│    → Cache trong Redis hoặc memory                               │
│    → Set state = PLAYING                                         │
│    → Emit 'gameStarted' to room                                  │
└────────────────────────────────────────┬────────────────────────┘
                                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. SERVER: sendQuestion(n)                                       │
│    → Get question[n] (ẩn correctAnswer!)                         │
│    → Set questionStartTime = now()                               │
│    → Emit 'newQuestion' { question, timeLimit, questionNumber }  │
└────────────────────────────────────────┬────────────────────────┘
                                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. PLAYERS: submitAnswer                                         │
│    → Validate: còn thời gian? chưa trả lời?                      │
│    → Calculate responseTime = now() - questionStartTime          │
│    → Check isCorrect                                             │
│    → Calculate score                                             │
│    → ZINCRBY leaderboard                                         │
│    → Emit 'answerReceived' to player                             │
└────────────────────────────────────────┬────────────────────────┘
                                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. TIMEOUT hoặc ALL_ANSWERED                                     │
│    → Emit 'showResult' { correctAnswer, stats }                  │
│    → Wait 3s                                                     │
│    → Emit 'leaderboardUpdate' { top10 }                          │
│    → Wait 3s                                                     │
│    → If more questions → Step 2                                  │
│    → Else → Step 5                                               │
└────────────────────────────────────────┬────────────────────────┘
                                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. GAME OVER                                                     │
│    → Set state = FINISHED                                        │
│    → Get final leaderboard                                       │
│    → Emit 'gameOver' { leaderboard, stats }                      │
│    → Save results to PostgreSQL (async)                          │
│    → Schedule room cleanup (TTL)                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 2.3 Scoring Algorithm

#### 📖 Kahoot-style Formula
```
Điểm = đúng × (1 - responseTime/timeLimit) × BASE_POINTS

Ví dụ:
- BASE_POINTS = 1000
- timeLimit = 20s
- Player trả lời đúng sau 5s
- Score = 1 × (1 - 5/20) × 1000 = 750 điểm
```

**Implementation:**
```typescript
interface ScoringConfig {
  basePoints: number;      // 1000
  timeLimit: number;       // seconds
  minPoints: number;       // 100 (điểm tối thiểu nếu đúng)
  streakBonus: number;     // 50 điểm/streak (optional)
}

function calculateScore(
  isCorrect: boolean,
  responseTimeMs: number,
  config: ScoringConfig,
): number {
  if (!isCorrect) return 0;
  
  const responseTimeSec = responseTimeMs / 1000;
  const timeRatio = Math.max(0, 1 - responseTimeSec / config.timeLimit);
  
  // Đảm bảo điểm tối thiểu nếu đúng
  const score = Math.max(
    config.minPoints,
    Math.round(config.basePoints * timeRatio)
  );
  
  return score;
}

// Examples:
// Đúng + 0s   → 1000 điểm (max)
// Đúng + 5s   → 750 điểm
// Đúng + 10s  → 500 điểm
// Đúng + 20s  → 100 điểm (min)
// Sai         → 0 điểm
```

#### 📖 Streak Bonus (Advanced)
```typescript
// Thưởng cho chuỗi trả lời đúng
function calculateStreakBonus(currentStreak: number): number {
  if (currentStreak < 2) return 0;
  return Math.min(currentStreak * 50, 250); // Max 250 bonus
}

// Player đúng liên tục 5 câu:
// Câu 1: 750 + 0 = 750
// Câu 2: 800 + 100 = 900
// Câu 3: 650 + 150 = 800
// ...
```

---

### 2.4 Answer Validation & Race Conditions

#### 📖 Các điều kiện cần validate
```typescript
interface SubmitAnswerDto {
  questionIndex: number;
  optionIndex: number;
}

async validateAnswer(
  pin: string,
  playerId: string,
  dto: SubmitAnswerDto,
): ValidationResult {
  // 1. Room tồn tại và đang PLAYING?
  const state = await redis.get(`room:${pin}:state`);
  if (state !== 'playing') {
    return { valid: false, error: 'Game not in progress' };
  }
  
  // 2. Đúng câu hỏi hiện tại?
  const currentQ = await redis.get(`room:${pin}:currentQuestion`);
  if (parseInt(currentQ) !== dto.questionIndex) {
    return { valid: false, error: 'Wrong question' };
  }
  
  // 3. Chưa trả lời câu này?
  const answered = await redis.sismember(
    `room:${pin}:q${dto.questionIndex}:answered`,
    playerId
  );
  if (answered) {
    return { valid: false, error: 'Already answered' };
  }
  
  // 4. Còn thời gian?
  const startTime = await redis.get(`room:${pin}:questionStartTime`);
  const elapsed = Date.now() - parseInt(startTime);
  const timeLimit = 20000; // 20s
  if (elapsed > timeLimit) {
    return { valid: false, error: 'Time expired' };
  }
  
  return { valid: true, responseTime: elapsed };
}
```

#### 📖 Atomic Answer Processing (Lua Script)
```typescript
// Tránh race condition: 2 players submit cùng lúc
const SUBMIT_ANSWER_SCRIPT = `
  local roomKey = KEYS[1]
  local playerId = ARGV[1]
  local questionIndex = ARGV[2]
  local optionIndex = ARGV[3]
  local score = tonumber(ARGV[4])
  local timestamp = tonumber(ARGV[5])
  
  -- Check if already answered
  local answeredKey = roomKey .. ':q' .. questionIndex .. ':answered'
  if redis.call('SISMEMBER', answeredKey, playerId) == 1 then
    return {-1, 'Already answered'}
  end
  
  -- Mark as answered
  redis.call('SADD', answeredKey, playerId)
  
  -- Record answer details
  redis.call('HSET', roomKey .. ':q' .. questionIndex .. ':answers',
    playerId, cjson.encode({option = optionIndex, time = timestamp, score = score})
  )
  
  -- Update leaderboard
  local newScore = redis.call('ZINCRBY', roomKey .. ':leaderboard', score, playerId)
  
  -- Get answered count
  local answeredCount = redis.call('SCARD', answeredKey)
  
  return {newScore, answeredCount}
`;
```

---

### 2.5 Timing & Synchronization

#### 📖 Server là nguồn thời gian duy nhất
```
❌ Vấn đề: Client control timer
   - Client có thể cheat (sửa code)
   - Network delay khác nhau giữa clients
   - Không fair

✅ Giải pháp: Server-authoritative timing
   - Server lưu questionStartTime
   - Server tính responseTime = receiveTime - startTime
   - Server quyết định timeout
```

**Implementation:**
```typescript
// Gửi câu hỏi
async sendQuestion(pin: string, questionIndex: number) {
  const startTime = Date.now();
  
  // Lưu start time
  await this.redis.set(
    `room:${pin}:questionStartTime`,
    startTime.toString()
  );
  await this.redis.set(
    `room:${pin}:currentQuestion`,
    questionIndex.toString()
  );
  
  // Emit cho clients (kèm serverTime để sync UI)
  this.server.to(`room:${pin}`).emit('newQuestion', {
    question: this.questions[questionIndex],
    questionNumber: questionIndex + 1,
    totalQuestions: this.questions.length,
    timeLimit: 20,
    serverTime: startTime,
  });
  
  // Schedule timeout
  setTimeout(
    () => this.handleQuestionTimeout(pin, questionIndex),
    20000 + 1000  // +1s buffer cho network
  );
}
```

---

## 3. STEP BY STEP TRIỂN KHAI

### Bước 1: GameService - Core Logic

```typescript
// src/game/game.service.ts
@Injectable()
export class GameService {
  private questionCache = new Map<string, Question[]>();

  constructor(
    @Inject(REDIS_CLIENT) private redis: Redis,
    @InjectRepository(Quiz) private quizRepo: Repository<Quiz>,
  ) {}

  async startGame(pin: string, quizId: string): Promise<void> {
    // Load questions
    const quiz = await this.quizRepo.findOne({
      where: { id: quizId },
      relations: ['questions'],
    });
    
    // Cache questions
    this.questionCache.set(pin, quiz.questions);
    
    // Update state
    await this.redis.set(`room:${pin}:state`, 'playing');
    await this.redis.set(`room:${pin}:currentQuestion`, '0');
    await this.redis.set(`room:${pin}:totalQuestions`, quiz.questions.length.toString());
  }

  async getCurrentQuestion(pin: string, hideAnswer = true) {
    const index = parseInt(await this.redis.get(`room:${pin}:currentQuestion`));
    const questions = this.questionCache.get(pin);
    const question = questions[index];
    
    if (hideAnswer) {
      const { correctOptionIndex, ...safeQuestion } = question;
      return safeQuestion;
    }
    return question;
  }

  async submitAnswer(
    pin: string,
    playerId: string,
    optionIndex: number,
  ): Promise<SubmitResult> {
    const startTime = parseInt(
      await this.redis.get(`room:${pin}:questionStartTime`)
    );
    const responseTime = Date.now() - startTime;
    
    // Get current question
    const question = await this.getCurrentQuestion(pin, false);
    const isCorrect = question.correctOptionIndex === optionIndex;
    
    // Calculate score
    const score = this.calculateScore(isCorrect, responseTime);
    
    // Update Redis atomically
    const questionIndex = await this.redis.get(`room:${pin}:currentQuestion`);
    await this.redis.sadd(`room:${pin}:q${questionIndex}:answered`, playerId);
    
    if (score > 0) {
      await this.redis.zincrby(`room:${pin}:leaderboard`, score, playerId);
    }
    
    return { isCorrect, score, responseTime };
  }

  calculateScore(isCorrect: boolean, responseTimeMs: number): number {
    if (!isCorrect) return 0;
    
    const BASE = 1000;
    const TIME_LIMIT = 20000;
    const MIN_SCORE = 100;
    
    const timeRatio = Math.max(0, 1 - responseTimeMs / TIME_LIMIT);
    return Math.max(MIN_SCORE, Math.round(BASE * timeRatio));
  }

  async getLeaderboard(pin: string, limit = 10) {
    const results = await this.redis.zrevrange(
      `room:${pin}:leaderboard`, 0, limit - 1, 'WITHSCORES'
    );
    
    const leaderboard = [];
    for (let i = 0; i < results.length; i += 2) {
      const playerId = results[i];
      const info = await this.redis.hgetall(`player:${playerId}:info`);
      leaderboard.push({
        rank: Math.floor(i / 2) + 1,
        playerId,
        nickname: info.nickname,
        score: parseInt(results[i + 1]),
      });
    }
    return leaderboard;
  }
}
```

### Bước 2: Update GameGateway

```typescript
// src/game/game.gateway.ts
@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private gameService: GameService,
    private roomService: RoomService,
  ) {}

  @SubscribeMessage('startGame')
  async handleStartGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { quizId: string },
  ) {
    const pin = client.data.pin;
    
    if (!client.data.isHost) {
      return { success: false, error: 'Only host can start' };
    }
    
    await this.gameService.startGame(pin, data.quizId);
    
    this.server.to(`room:${pin}`).emit('gameStarted', {
      message: 'Game is starting!',
    });
    
    // Delay 3s rồi gửi câu hỏi đầu tiên
    setTimeout(() => this.sendQuestion(pin, 0), 3000);
    
    return { success: true };
  }

  private async sendQuestion(pin: string, index: number) {
    const question = await this.gameService.getCurrentQuestion(pin);
    const startTime = Date.now();
    
    await this.redis.set(`room:${pin}:questionStartTime`, startTime.toString());
    
    this.server.to(`room:${pin}`).emit('newQuestion', {
      question,
      questionNumber: index + 1,
      timeLimit: 20,
    });
    
    // Schedule timeout
    setTimeout(() => this.handleTimeout(pin, index), 21000);
  }

  @SubscribeMessage('submitAnswer')
  async handleSubmitAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { optionIndex: number },
  ) {
    const pin = client.data.pin;
    const playerId = client.id;
    
    try {
      const result = await this.gameService.submitAnswer(
        pin,
        playerId,
        data.optionIndex
      );
      
      // Notify player
      client.emit('answerResult', result);
      
      // Check if all answered
      await this.checkAllAnswered(pin);
      
      return { success: true, ...result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async handleTimeout(pin: string, questionIndex: number) {
    // Show correct answer
    const question = await this.gameService.getCurrentQuestion(pin, false);
    
    this.server.to(`room:${pin}`).emit('showResult', {
      correctAnswer: question.correctOptionIndex,
      // Add stats: how many chose each option
    });
    
    // Wait 3s, then show leaderboard
    setTimeout(async () => {
      const leaderboard = await this.gameService.getLeaderboard(pin);
      this.server.to(`room:${pin}`).emit('leaderboardUpdate', { leaderboard });
      
      // Next question or end game
      setTimeout(() => this.nextOrEnd(pin, questionIndex), 3000);
    }, 3000);
  }

  private async nextOrEnd(pin: string, currentIndex: number) {
    const total = parseInt(await this.redis.get(`room:${pin}:totalQuestions`));
    
    if (currentIndex + 1 < total) {
      await this.redis.incr(`room:${pin}:currentQuestion`);
      this.sendQuestion(pin, currentIndex + 1);
    } else {
      await this.endGame(pin);
    }
  }

  private async endGame(pin: string) {
    await this.redis.set(`room:${pin}:state`, 'finished');
    
    const leaderboard = await this.gameService.getLeaderboard(pin, 100);
    
    this.server.to(`room:${pin}`).emit('gameOver', {
      leaderboard,
      message: 'Game finished!',
    });
  }
}
```

### Bước 3: Scoring Service (Testable)

```typescript
// src/game/scoring.service.ts
@Injectable()
export class ScoringService {
  private readonly config = {
    basePoints: 1000,
    minPoints: 100,
    timeLimit: 20000, // ms
  };

  calculate(isCorrect: boolean, responseTimeMs: number): number {
    if (!isCorrect) return 0;
    if (responseTimeMs >= this.config.timeLimit) return this.config.minPoints;
    
    const ratio = 1 - responseTimeMs / this.config.timeLimit;
    return Math.max(
      this.config.minPoints,
      Math.round(this.config.basePoints * ratio)
    );
  }
}

// Unit tests
describe('ScoringService', () => {
  let service: ScoringService;

  beforeEach(() => { service = new ScoringService(); });

  it('returns 0 for wrong answer', () => {
    expect(service.calculate(false, 0)).toBe(0);
    expect(service.calculate(false, 10000)).toBe(0);
  });

  it('returns max score for instant correct', () => {
    expect(service.calculate(true, 0)).toBe(1000);
  });

  it('returns proportional score', () => {
    expect(service.calculate(true, 5000)).toBe(750);  // 1 - 5/20 = 0.75
    expect(service.calculate(true, 10000)).toBe(500); // 1 - 10/20 = 0.5
  });

  it('returns min score at timeout', () => {
    expect(service.calculate(true, 20000)).toBe(100);
    expect(service.calculate(true, 25000)).toBe(100);
  });
});
```

---

## 4. VERIFY CHECKLIST

### 📋 Câu hỏi LÝ THUYẾT

| # | Câu hỏi | Đáp án mong đợi |
|---|---------|-----------------|
| 1 | Game state machine có những states nào? | WAITING, PLAYING (+ sub-phases), FINISHED |
| 2 | Scoring formula tính như thế nào? | score = (1 - time/limit) × base nếu đúng, 0 nếu sai |
| 3 | Tại sao server phải control timing? | Tránh cheat, đảm bảo fair play |
| 4 | Race condition khi submit answer là gì? | 2 players submit cùng lúc, cần atomic operation |
| 5 | ZINCRBY dùng để làm gì? | Tăng score atomically trong ZSET |
| 6 | Tại sao ẩn correctAnswer khi gửi question? | Tránh cheat - client có thể inspect network |

### 📋 Câu hỏi THỰC HÀNH

| # | Kiểm tra | Cách verify |
|---|----------|-------------|
| 1 | Game start hoạt động? | Host click start → Tất cả nhận 'gameStarted' |
| 2 | Questions được gửi đúng? | Nhận question không có correctAnswer |
| 3 | Submit answer hoạt động? | Nhận 'answerResult' với isCorrect và score |
| 4 | Scoring đúng? | 0s → 1000 điểm, 10s → 500 điểm |
| 5 | Leaderboard update? | Sau mỗi câu, thấy ranking thay đổi |
| 6 | Game kết thúc đúng? | Sau câu cuối → 'gameOver' với final leaderboard |

---

## 5. MỞ RỘNG - BEST PRACTICES

### 5.1 Anti-Cheat Measures

| Cheat | Prevention |
|-------|------------|
| Submit nhiều lần | Redis SET track answered |
| Sửa thời gian | Server-side timing |
| Xem đáp án trong network | Không gửi correctAnswer |
| Bot spam | Rate limiting per socket |

### 5.2 Performance Optimization

```typescript
// Batch leaderboard update
// Thay vì update sau mỗi answer, update sau khi question kết thúc
const answers = await this.redis.hgetall(`room:${pin}:q${n}:answers`);
const multi = this.redis.multi();
for (const [playerId, data] of Object.entries(answers)) {
  multi.zincrby(`room:${pin}:leaderboard`, JSON.parse(data).score, playerId);
}
await multi.exec();
```

### 5.3 Error Recovery

```typescript
// Reconnection: Player rejoins mid-game
@SubscribeMessage('rejoinGame')
async handleRejoin(client: Socket, data: { pin: string }) {
  const state = await this.roomService.getRoomState(data.pin);
  
  if (state.gameState === 'playing') {
    // Sync current state
    client.emit('gameSync', {
      currentQuestion: await this.gameService.getCurrentQuestion(data.pin),
      leaderboard: await this.gameService.getLeaderboard(data.pin),
      timeRemaining: this.calculateTimeRemaining(data.pin),
    });
  }
}
```

---

## 📅 Timeline Tuần 5

| Ngày | Hoạt động | Thời gian |
|------|-----------|-----------|
| Ngày 1-2 | Game state machine + Flow | 3-4 giờ |
| Ngày 3-4 | Scoring + Answer handling | 3-4 giờ |
| Ngày 5-6 | Full integration + Testing | 3-4 giờ |
| Ngày 7 | Play test + Bug fixes | 2-3 giờ |

---

> 💡 **Tip**: Mở 3 browser tabs (1 Host + 2 Players) để test full game flow. Console.log các events để debug timing issues.
