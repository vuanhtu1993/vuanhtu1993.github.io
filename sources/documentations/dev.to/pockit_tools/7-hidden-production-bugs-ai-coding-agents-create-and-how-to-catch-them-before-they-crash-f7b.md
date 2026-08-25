---
title: "7 Hidden Production Bugs AI Coding Agents Create (And How to Catch Them Before They Crash)"
source_url: "https://dev.to/pockit_tools/7-hidden-production-bugs-ai-coding-agents-create-and-how-to-catch-them-before-they-crash-f7b"
crawled_at: "2026-08-07T09:30:42.767Z"
---

Your AI coding agent just built a feature in 45 seconds. The code compiles. The tests pass. The PR looks clean. You ship it to production on a Friday evening feeling confident.

By Saturday morning, your database is at 100% CPU, your Redis cluster is unresponsive, and three customers have reported seeing each other's data. The on-call engineer is staring at AI-generated code they've never seen before, and nothing in the error logs makes sense because the AI didn't add proper error logging.

This is not a hypothetical scenario. It's happening daily across the industry. A 2025 Endor Labs study found that 62% of AI-generated code contains security weaknesses or design flaws. But the more insidious problem isn't the obvious bugs — it's the hidden ones. The code that looks correct, passes unit tests, survives code review, and then detonates under real-world conditions that no one thought to test.

This guide dissects the 7 most dangerous hidden bug patterns that AI coding agents consistently produce. For each pattern, we'll cover why AI generates it, how to detect it before production, and the battle-tested fix. These aren't theoretical risks — they're patterns extracted from hundreds of production incidents at companies running AI-assisted development workflows in 2025-2026.

---

## [](#pattern-1-the-cache-stampede)Pattern 1: The Cache Stampede

### [](#what-ai-generates)What AI Generates

When you ask an AI agent to add caching, it produces textbook cache-aside logic:  

```
async function getProduct(id: string): Promise<Product> {
  const cached = await redis.get(`product:${id}`);
  if (cached) {
    return JSON.parse(cached);
  }

  const product = await db.query('SELECT * FROM products WHERE id = $1', [id]);
  await redis.set(`product:${id}`, JSON.stringify(product), 'EX', 3600);
  return product;
}
```

 

This code is correct in isolation. Every test passes. The code review looks clean.

### [](#why-it-detonates)Why It Detonates

Under production load, when a popular cache key expires, hundreds of concurrent requests all miss the cache simultaneously. Every single one hits the database with the same query. Your database CPU spikes to 100%, queries start timing out, and the cascade of failures brings down unrelated services.

This is a **cache stampede** (also called thundering herd). AI agents produce it because their training data is dominated by tutorial-style caching examples that assume single-threaded, low-traffic environments.

### [](#the-detection-strategy)The Detection Strategy

```
// Add this to your load test suite
it('should handle concurrent cache misses without stampede', async () => {
  await redis.del('product:popular-item');

  // Simulate 100 concurrent requests for the same key
  const requests = Array.from({ length: 100 }, () =>
    getProduct('popular-item')
  );

  const dbQuerySpy = vi.spyOn(db, 'query');
  await Promise.all(requests);

  // If more than 1 query hits the DB, you have a stampede
  expect(dbQuerySpy).toHaveBeenCalledTimes(1);
});
```

 

### [](#the-production-fix)The Production Fix

```
import { Mutex } from 'async-mutex';

const locks = new Map<string, Mutex>();

async function getProduct(id: string): Promise<Product> {
  const cacheKey = `product:${id}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Acquire a per-key lock to prevent stampede
  if (!locks.has(cacheKey)) {
    locks.set(cacheKey, new Mutex());
  }
  const mutex = locks.get(cacheKey)!;

  return mutex.runExclusive(async () => {
    // Double-check after acquiring lock
    const rechecked = await redis.get(cacheKey);
    if (rechecked) {
      return JSON.parse(rechecked);
    }

    const product = await db.query(
      'SELECT * FROM products WHERE id = $1', [id]
    );
    await redis.set(cacheKey, JSON.stringify(product), 'EX', 3600);
    return product;
  });
}
```

 

The key insight: **double-checked locking**. The first request acquires the lock, fetches from DB, and populates the cache. Every other concurrent request waits on the lock, then finds the cache populated, and returns immediately without hitting the database.

---

## [](#pattern-2-connection-pool-exhaustion)Pattern 2: Connection Pool Exhaustion

### [](#what-ai-generates)What AI Generates

AI agents love async/await but consistently produce code that leaks database connections:  

```
async function processOrder(orderId: string) {
  const client = await pool.connect();

  const order = await client.query(
    'SELECT * FROM orders WHERE id = $1', [orderId]
  );

  // AI generates business logic here...
  const inventory = await client.query(
    'SELECT * FROM inventory WHERE product_id = $1',
    [order.rows[0].product_id]
  );

  await client.query(
    'UPDATE inventory SET quantity = quantity - $1 WHERE product_id = $2',
    [order.rows[0].quantity, order.rows[0].product_id]
  );

  client.release();
  return { success: true };
}
```

 

### [](#why-it-detonates)Why It Detonates

If any query throws an error — a constraint violation, a timeout, a deadlock — `client.release()` never executes. The connection is leaked. After enough leaked connections, `pool.connect()` blocks indefinitely because all connections are occupied by abandoned handlers. Your entire application freezes with zero error logs because the hang happens at the connection acquisition level, not the query level.

AI generates this because its training data overwhelmingly shows the "happy path." Error handling in connection management is rarely demonstrated in tutorials.

### [](#the-detection-strategy)The Detection Strategy

```
// Monitor pool metrics in production
setInterval(() => {
  const { totalCount, idleCount, waitingCount } = pool;
  logger.info('pool_metrics', {
    total: totalCount,
    idle: idleCount,
    waiting: waitingCount,
    active: totalCount - idleCount,
  });

  if (waitingCount > 5) {
    logger.warn('pool_pressure', {
      message: 'Connection pool under pressure',
      waiting: waitingCount,
    });
  }
}, 10_000);
```

 

### [](#the-production-fix)The Production Fix

```
async function processOrder(orderId: string) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const order = await client.query(
      'SELECT * FROM orders WHERE id = $1', [orderId]
    );

    const inventory = await client.query(
      'SELECT * FROM inventory WHERE product_id = $1',
      [order.rows[0].product_id]
    );

    await client.query(
      'UPDATE inventory SET quantity = quantity - $1 WHERE product_id = $2',
      [order.rows[0].quantity, order.rows[0].product_id]
    );

    await client.query('COMMIT');
    return { success: true };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release(); // ALWAYS releases, even on error
  }
}
```

 

The `try/catch/finally` pattern guarantees connection release regardless of what happens. This is the single most important pattern that AI agents consistently omit.

---

## [](#pattern-3-silent-data-corruption)Pattern 3: Silent Data Corruption

### [](#what-ai-generates)What AI Generates

When asked to handle API data, AI agents trust external input implicitly:  

```
app.post('/api/users/:id/profile', async (req, res) => {
  const { name, email, role } = req.body;

  await db.query(
    'UPDATE users SET name = $1, email = $2, role = $3 WHERE id = $4',
    [name, email, role, req.params.id]
  );

  res.json({ success: true });
});
```

 

### [](#why-it-detonates)Why It Detonates

This endpoint allows any authenticated user to set their own `role` field to `admin`. The AI destructured `role` from the request body because the database schema has a `role` column, and the AI's pattern matching connected the two without considering authorization implications.

More subtly, the `name` and `email` fields accept any string. A user can set their name to a 10MB string, or their email to `not-an-email`. The data is "saved successfully" but corrupts downstream systems: email sending breaks, CSV exports crash, search indices bloat.

This is **silent data corruption** — the write succeeds, but invalid data spreads through your system like a slow poison.

### [](#the-detection-strategy)The Detection Strategy

```
// Schema validation at the boundary — BEFORE business logic
import { z } from 'zod';

const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  email: z.string().email().max(254).toLowerCase(),
  // Notice: 'role' is NOT in this schema
});

// Integration test: verify forbidden fields are rejected
it('should not allow role escalation via profile update', async () => {
  const res = await request(app)
    .post('/api/users/user-1/profile')
    .send({ name: 'Hacker', email: 'hacker@test.com', role: 'admin' })
    .set('Authorization', `Bearer ${userToken}`);

  const user = await db.query('SELECT role FROM users WHERE id = $1', ['user-1']);
  expect(user.rows[0].role).toBe('member'); // NOT 'admin'
});
```

 

### [](#the-production-fix)The Production Fix

```
app.post('/api/users/:id/profile', async (req, res) => {
  // 1. Validate input — strip unknown fields
  const parsed = UpdateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Validation failed',
      issues: parsed.error.issues,
    });
  }

  // 2. Only use validated data (role is impossible to inject)
  const { name, email } = parsed.data;

  // 3. Verify the user can only update their own profile
  if (req.params.id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  await db.query(
    'UPDATE users SET name = $1, email = $2 WHERE id = $3',
    [name, email, req.params.id]
  );

  res.json({ success: true });
});
```

 

The fix has three layers: schema validation (strips `role`), authorization check (own profile only), and constrained data types (email format, name length). AI-generated code almost never implements all three.

---

## [](#pattern-4-the-unhandled-race-condition)Pattern 4: The Unhandled Race Condition

### [](#what-ai-generates)What AI Generates

When implementing "like" or "upvote" functionality:  

```
async function toggleLike(userId: string, postId: string) {
  const existing = await db.query(
    'SELECT id FROM likes WHERE user_id = $1 AND post_id = $2',
    [userId, postId]
  );

  if (existing.rows.length > 0) {
    await db.query('DELETE FROM likes WHERE id = $1', [existing.rows[0].id]);
    await db.query(
      'UPDATE posts SET like_count = like_count - 1 WHERE id = $1', [postId]
    );
    return { liked: false };
  } else {
    await db.query(
      'INSERT INTO likes (user_id, post_id) VALUES ($1, $2)',
      [userId, postId]
    );
    await db.query(
      'UPDATE posts SET like_count = like_count + 1 WHERE id = $1', [postId]
    );
    return { liked: true };
  }
}
```

 

### [](#why-it-detonates)Why It Detonates

Double-tap a like button on a phone with poor connectivity. The first request checks and finds no existing like. The second request, arriving milliseconds later, also checks and finds no existing like (because the first INSERT hasn't committed yet). Both requests insert a like. `like_count` increments by 2. The user now has two like records, and the count is permanently desynchronized.

This race condition is invisible in testing because tests run sequentially. It only manifests under concurrent production traffic.

### [](#the-detection-strategy)The Detection Strategy

```
it('should handle concurrent like toggles correctly', async () => {
  // Simulate double-tap race condition
  const results = await Promise.all([
    toggleLike('user-1', 'post-1'),
    toggleLike('user-1', 'post-1'),
  ]);

  const likes = await db.query(
    'SELECT COUNT(*) FROM likes WHERE user_id = $1 AND post_id = $2',
    ['user-1', 'post-1']
  );

  // Should be exactly 0 or 1, never 2
  expect(Number(likes.rows[0].count)).toBeLessThanOrEqual(1);
});
```

 

### [](#the-production-fix)The Production Fix

```
async function toggleLike(userId: string, postId: string) {
  return await db.transaction(async (tx) => {
    // Lock the row to prevent concurrent modifications
    const existing = await tx.query(
      `SELECT id FROM likes 
       WHERE user_id = $1 AND post_id = $2 
       FOR UPDATE`,                     // ← Row-level lock
      [userId, postId]
    );

    if (existing.rows.length > 0) {
      await tx.query('DELETE FROM likes WHERE id = $1', [existing.rows[0].id]);
      await tx.query(
        'UPDATE posts SET like_count = like_count - 1 WHERE id = $1',
        [postId]
      );
      return { liked: false };
    } else {
      await tx.query(
        `INSERT INTO likes (user_id, post_id) VALUES ($1, $2)
         ON CONFLICT (user_id, post_id) DO NOTHING`, // ← Idempotent
        [userId, postId]
      );
      await tx.query(
        'UPDATE posts SET like_count = like_count + 1 WHERE id = $1',
        [postId]
      );
      return { liked: true };
    }
  });
}
```

 

Two critical additions: `FOR UPDATE` creates a row-level lock that serializes concurrent operations, and `ON CONFLICT DO NOTHING` provides a safety net if the lock timing allows a duplicate. AI agents almost never generate `FOR UPDATE` because it barely exists in tutorial code.

---

## [](#pattern-5-the-retry-storm)Pattern 5: The Retry Storm

### [](#what-ai-generates)What AI Generates

When asked to "make this API call more resilient":  

```
async function callPaymentAPI(data: PaymentRequest): Promise<PaymentResult> {
  const MAX_RETRIES = 3;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch('https://api.payment.com/charge', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Payment API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (attempt === MAX_RETRIES - 1) throw error;
      // Retry immediately
    }
  }

  throw new Error('Unreachable');
}
```

 

### [](#why-it-detonates)Why It Detonates

When the payment API is experiencing degraded performance (responding in 5 seconds instead of 200ms), every incoming request spawns up to 3 rapid-fire calls to the already-struggling service. If you have 1,000 concurrent users, the struggling API receives 3,000 requests instead of 1,000. This amplifies the failure, creates a feedback loop, and can cascade into a full outage of both your service and the downstream API.

Worse: the AI retried on a `POST /charge` endpoint. If the first request actually succeeded but the response was slow, the retry creates a **duplicate charge**. The customer gets billed twice.

### [](#the-detection-strategy)The Detection Strategy

```
it('should implement exponential backoff, not immediate retry', async () => {
  let callTimestamps: number[] = [];
  vi.spyOn(global, 'fetch').mockImplementation(async () => {
    callTimestamps.push(Date.now());
    throw new Error('Service unavailable');
  });

  await expect(callPaymentAPI(mockData)).rejects.toThrow();

  // Verify exponential delays between retries
  for (let i = 1; i < callTimestamps.length; i++) {
    const delay = callTimestamps[i] - callTimestamps[i - 1];
    expect(delay).toBeGreaterThan(500 * Math.pow(2, i - 1));
  }
});

it('should not retry non-idempotent requests on ambiguous failures', async () => {
  vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('timeout'));

  // For POST (non-idempotent), should NOT retry on timeout
  // because the request may have already been processed
  await expect(callPaymentAPI(mockData)).rejects.toThrow();
  expect(fetch).toHaveBeenCalledTimes(1);
});
```

 

### [](#the-production-fix)The Production Fix

```
async function callPaymentAPI(data: PaymentRequest): Promise<PaymentResult> {
  // 1. Add idempotency key to prevent duplicate charges
  const idempotencyKey = crypto.randomUUID();

  // 2. Use exponential backoff with jitter
  const MAX_RETRIES = 3;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);

      const response = await fetch('https://api.payment.com/charge', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey, // ← Prevents duplicate charges
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      // 3. Only retry on retryable status codes
      if (response.status === 429 || response.status >= 500) {
        throw new RetryableError(response.status);
      }

      if (!response.ok) {
        // 4xx errors are NOT retryable (bad input, auth failure)
        throw new NonRetryableError(response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof NonRetryableError) throw error;
      if (attempt === MAX_RETRIES - 1) throw error;

      // 4. Exponential backoff with jitter
      const baseDelay = 1000 * Math.pow(2, attempt);
      const jitter = Math.random() * 500;
      await new Promise(resolve =>
        setTimeout(resolve, baseDelay + jitter)
      );
    }
  }

  throw new Error('Unreachable');
}
```

 

Four critical additions: **idempotency keys** (prevent duplicate charges), **exponential backoff with jitter** (prevent synchronized retry storms), **retryable vs. non-retryable error classification** (don't retry 400 errors), and **explicit timeouts** (prevent hanging connections). AI agents typically implement none of these.

---

## [](#pattern-6-the-slow-memory-leak)Pattern 6: The Slow Memory Leak

### [](#what-ai-generates)What AI Generates

When building event processing or WebSocket handlers:  

```
class NotificationService {
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  subscribe(userId: string, callback: (data: any) => void) {
    if (!this.listeners.has(userId)) {
      this.listeners.set(userId, new Set());
    }
    this.listeners.get(userId)!.add(callback);
  }

  notify(userId: string, data: any) {
    this.listeners.get(userId)?.forEach(cb => cb(data));
  }
}

// In the WebSocket handler
wss.on('connection', (ws, req) => {
  const userId = extractUserId(req);

  const callback = (data: any) => {
    ws.send(JSON.stringify(data));
  };

  notificationService.subscribe(userId, callback);

  ws.on('message', (msg) => { /* handle messages */ });
});
```

 

### [](#why-it-detonates)Why It Detonates

There's no `unsubscribe` call when the WebSocket disconnects. Every connection adds a callback to the Set, but no connection ever removes one. After a week of production traffic, the `listeners` Map holds millions of dead callbacks pointing to closed WebSocket connections. Memory usage grows linearly until the Node.js process crashes with an OOM error.

The leak is invisible in development because the process restarts frequently. In production, it takes days or weeks to manifest, making it extremely difficult to correlate with the original code change.

### [](#the-detection-strategy)The Detection Strategy

```
it('should clean up listeners on disconnect', async () => {
  const ws = new MockWebSocket();
  simulateConnection(ws, 'user-1');

  const listenersBefore = notificationService.getListenerCount('user-1');
  expect(listenersBefore).toBe(1);

  // Simulate disconnect
  ws.emit('close');

  const listenersAfter = notificationService.getListenerCount('user-1');
  expect(listenersAfter).toBe(0);
});

// Production monitoring
setInterval(() => {
  let total = 0;
  notificationService.listeners.forEach((set) => { total += set.size; });
  logger.info('listener_count', { total });
  // Alert if total > expected active connections * 1.5
}, 60_000);
```

 

### [](#the-production-fix)The Production Fix

```
wss.on('connection', (ws, req) => {
  const userId = extractUserId(req);

  const callback = (data: any) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  };

  notificationService.subscribe(userId, callback);

  // Clean up on disconnect — the critical missing piece
  ws.on('close', () => {
    notificationService.unsubscribe(userId, callback);
  });

  ws.on('error', () => {
    notificationService.unsubscribe(userId, callback);
  });

  ws.on('message', (msg) => { /* handle messages */ });
});

// Add the missing unsubscribe method
class NotificationService {
  // ... existing code ...

  unsubscribe(userId: string, callback: (data: any) => void) {
    const userListeners = this.listeners.get(userId);
    if (userListeners) {
      userListeners.delete(callback);
      if (userListeners.size === 0) {
        this.listeners.delete(userId); // Clean up empty Sets too
      }
    }
  }

  getListenerCount(userId: string): number {
    return this.listeners.get(userId)?.size ?? 0;
  }
}
```

 

The fix adds cleanup handlers for both `close` and `error` events, a `readyState` check before sending (prevents "write after end" errors), and cleanup of empty Sets in the Map. AI agents consistently implement `subscribe` but forget `unsubscribe` because the training data rarely shows cleanup code.

---

## [](#pattern-7-the-auth-context-leak)Pattern 7: The Auth Context Leak

### [](#what-ai-generates)What AI Generates

When building middleware or service layers with authentication:  

```
// Auth middleware
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token!, process.env.JWT_SECRET!);
  req.user = decoded as AuthUser;
  next();
}

// Service using the auth context
class OrderService {
  async getOrders(userId: string) {
    return db.query('SELECT * FROM orders WHERE user_id = $1', [userId]);
  }
}

// Controller
app.get('/api/orders', authMiddleware, async (req, res) => {
  const orders = await orderService.getOrders(req.query.userId as string);
  res.json(orders);
});
```

 

### [](#why-it-detonates)Why It Detonates

The auth middleware correctly validates the JWT and sets `req.user`. But the controller passes `req.query.userId` (from the URL query string) to the service instead of `req.user.id` (from the verified token). Any authenticated user can access any other user's orders by simply changing the `userId` query parameter.

This is an **IDOR vulnerability** (Insecure Direct Object Reference). The AI generated all three components correctly in isolation, but the wiring between them created a security hole. The AI's pattern-matching connected the `userId` parameter to the query string because the variable name appeared there, not because it was the secure choice.

### [](#the-detection-strategy)The Detection Strategy

```
it('should not allow accessing other users orders', async () => {
  // User A's token
  const tokenA = generateToken({ id: 'user-a', role: 'member' });

  // Try to access User B's orders
  const res = await request(app)
    .get('/api/orders?userId=user-b')
    .set('Authorization', `Bearer ${tokenA}`);

  // Should either return 403 or only return User A's orders
  const orders = res.body;
  orders.forEach((order: any) => {
    expect(order.user_id).toBe('user-a');
  });
});
```

 

### [](#the-production-fix)The Production Fix

```
// The controller MUST use the verified auth context, not query params
app.get('/api/orders', authMiddleware, async (req, res) => {
  // ✅ Uses verified identity from JWT, ignores query params
  const orders = await orderService.getOrders(req.user.id);
  res.json(orders);
});

// For admin endpoints that need cross-user access:
app.get('/api/admin/orders/:userId', authMiddleware, requireRole('admin'),
  async (req, res) => {
    const orders = await orderService.getOrders(req.params.userId);
    res.json(orders);
  }
);
```

 

The rule is simple: **never use user-supplied identity when you have a verified identity**. If the user is authenticated, their identity comes from the JWT. The query string is for filtering and pagination, never for identification.

---

## [](#the-metapattern-why-ai-agents-produce-these-bugs)The Meta-Pattern: Why AI Agents Produce These Bugs

All seven patterns share a common root cause: **AI agents optimize for the happy path**.

Their training data is overwhelmingly composed of tutorials, documentation examples, and Stack Overflow answers that demonstrate how things work when everything goes right. Real production code spends 80% of its complexity budget on handling what happens when things go wrong.  

```
Training Data Distribution vs. Production Code Reality:

  AI Training Data:           Production Code:
  ─────────────────           ─────────────────
  Happy path:     85%         Happy path:     20%
  Error handling: 10%         Error handling: 35%
  Edge cases:      3%         Edge cases:     25%
  Concurrency:     1%         Concurrency:    10%
  Cleanup:         1%         Cleanup:        10%
```

 

This creates a systematic blind spot. The AI generates the 20% of code that handles normal operations beautifully, then either ignores or superficially handles the 80% that makes code production-ready.

---

## [](#the-detection-checklist)The Detection Checklist

Before merging any AI-generated code, run through this checklist:

| Category | Question | If "No" → |
| --- | --- | --- |
| **Concurrency** | Does this code work with 1000 simultaneous requests? | Add locking / `FOR UPDATE` / idempotency |
| **Connection Management** | Are all connections released in a `finally` block? | Add try/finally or use connection helpers |
| **Input Validation** | Is every external input validated and constrained? | Add Zod schemas at API boundaries |
| **Auth Context** | Does the code use verified identity, not user-supplied? | Replace `req.query` / `req.params` with `req.user` |
| **Retry Logic** | Do retries use exponential backoff + idempotency keys? | Replace naive retry loops |
| **Resource Cleanup** | Are event listeners, timers, and subscriptions cleaned up? | Add close/error/unsubscribe handlers |
| **Error Propagation** | Do errors include enough context for debugging? | Add structured logging with correlation IDs |
| **State Consistency** | Can a crash between two writes leave data inconsistent? | Wrap in a database transaction |

---

## [](#building-your-defensive-layer)Building Your Defensive Layer

The most effective defense isn't reviewing every line of AI-generated code. It's building infrastructure that catches these patterns automatically.

### [](#1-mandatory-integration-tests-for-concurrency)1\. Mandatory Integration Tests for Concurrency

Don't just test that the code works. Test that it works under concurrent load. Every write operation should have a `Promise.all()` test that verifies correctness under race conditions.

### [](#2-connection-pool-monitoring)2\. Connection Pool Monitoring

Add real-time pool metrics (active connections, waiting connections, idle connections) to your observability stack. Alert when `waiting > 5`. This catches connection leaks before they become outages.

### [](#3-schema-validation-at-every-boundary)3\. Schema Validation at Every Boundary

Use a validation library (Zod, Valibot, ArkType) at every point where data crosses a trust boundary: API endpoints, queue consumers, webhook handlers, third-party API responses. Never trust that the shape of the data matches what you expect.

### [](#4-authbydefault-architecture)4\. Auth-by-Default Architecture

Structure your codebase so that authentication and authorization are impossible to accidentally bypass. Services should receive a verified `AuthContext` parameter, not raw user IDs. If a service method doesn't receive an `AuthContext`, it should be a compile-time error.

### [](#5-static-analysis-rules)5\. Static Analysis Rules

Create custom ESLint or Biome rules that flag known anti-patterns:

-   `pool.connect()` without a corresponding `release()` in a `finally` block
-   `fetch()` retry loops without delay
-   `addEventListener()` / `subscribe()` without corresponding cleanup
-   Database queries that use `req.query` or `req.params` for identity

---

## [](#the-bottom-line)The Bottom Line

AI coding agents are productivity multipliers when used with discipline. They are liability multipliers when used without it.

The 7 patterns in this guide aren't edge cases. They are the most common, most damaging, and most predictable failure modes of AI-generated code. Every one of them is preventable with infrastructure: concurrency tests, connection monitoring, schema validation, auth-by-default architecture, and static analysis.

Your AI agent writes the first draft. Your engineering discipline writes the final one. The companies that master this distinction will ship faster and crash less. The ones that don't will keep debugging Saturday morning incidents caused by Friday evening deployments of AI code that "looked fine in the PR."

The code that looks correct is the most dangerous code of all.

---

> ⚡ **Speed Tip:** Read the original post on the [Pockit Blog](https://pockit.tools/blog/debugging-ai-generated-code-hidden-production-bugs-patterns-guide/).
> 
> Tired of slow cloud tools? [Pockit.tools](https://pockit.tools/json-formatter/) runs entirely in your browser. **[Get the Extension](https://chromewebstore.google.com/detail/pockit-developer-tools-pd/lojcamfhllebjmcjmipecgecbeopookg)** now for instant, zero-latency access to essential dev tools.
