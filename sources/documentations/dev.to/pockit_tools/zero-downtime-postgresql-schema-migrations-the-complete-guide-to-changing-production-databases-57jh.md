---
title: "Zero-Downtime PostgreSQL Schema Migrations: The Complete Guide to Changing Production Databases Without Breaking Anything"
source_url: "https://dev.to/pockit_tools/zero-downtime-postgresql-schema-migrations-the-complete-guide-to-changing-production-databases-57jh"
crawled_at: "2026-08-07T09:30:25.580Z"
---

It's 2 AM. Your team just deployed a migration that adds a NOT NULL column to a table with 50 million rows. The migration acquired an ACCESS EXCLUSIVE lock, blocking every query on that table. Your API response times spiked from 50ms to 30 seconds. Your on-call engineer's phone is exploding. Customers are tweeting screenshots of error pages.

You've just learned, the hard way, that `ALTER TABLE ... ADD COLUMN ... NOT NULL DEFAULT` in PostgreSQL can be a weapon of mass destruction in production.

This guide exists so you never have to learn that lesson the hard way. We'll cover every pattern, tool, and gotcha involved in changing PostgreSQL schemas without taking your application offline. Not theory. Production-tested strategies that work on tables with hundreds of millions of rows.

## [](#why-schema-migrations-are-dangerous)Why Schema Migrations Are Dangerous

Most developers treat database migrations as simple code deployments. Write an `ALTER TABLE`, run it during deploy, move on. This works fine in development, where your `users` table has 50 rows. In production, where it has 50 million rows, the same migration can bring down your entire application.

Here's why:

### [](#postgresqls-lock-system)PostgreSQL's Lock System

Every DDL statement in PostgreSQL acquires locks. The problem isn't that locks exist — it's the **lock queue**. When a DDL statement requests an ACCESS EXCLUSIVE lock and can't get it immediately (because active queries hold conflicting locks), it waits in the queue. While it waits, **every new query that needs any lock on that table also queues behind it**.  

```
Timeline of disaster:

00:00  Active SELECT queries running (hold ACCESS SHARE locks)
00:01  ALTER TABLE requests ACCESS EXCLUSIVE lock → waits in queue
00:02  New SELECT query arrives → queues behind ALTER TABLE
00:03  New SELECT query arrives → queues behind ALTER TABLE
00:04  New SELECT query arrives → queues behind ALTER Table
  ...  Every query is now queued. Application appears frozen.
00:30  Original SELECT finishes → ALTER TABLE acquires lock
00:31  ALTER TABLE runs (could take minutes on large tables)
02:00  ALTER TABLE completes → queued queries finally execute
```

 

That's a **2-minute outage** caused by a single `ALTER TABLE` statement. With a busy table, this can cascade into connection pool exhaustion, application crashes, and cascading failures across your entire system.

### [](#the-operations-that-kill-you)The Operations That Kill You

Not all schema changes are equally dangerous. Here's the risk matrix:

| Operation | Lock Type | Risk Level | Duration on 50M rows |
| --- | --- | --- | --- |
| `ADD COLUMN` (nullable, no default) | ACCESS EXCLUSIVE | 🟢 Low | Milliseconds |
| `ADD COLUMN ... DEFAULT` (PG 11+) | ACCESS EXCLUSIVE | 🟢 Low | Milliseconds |
| `ADD COLUMN ... NOT NULL DEFAULT` (PG 11+) | ACCESS EXCLUSIVE | 🟡 Medium | Milliseconds (but lock queue risk) |
| `DROP COLUMN` | ACCESS EXCLUSIVE | 🟢 Low | Milliseconds |
| `ALTER COLUMN TYPE` | ACCESS EXCLUSIVE | 🔴 Critical | Minutes to hours (full table rewrite) |
| `ADD INDEX` | SHARE lock | 🔴 Critical | Minutes (blocks writes) |
| `ADD INDEX CONCURRENTLY` | No lock | 🟢 Low | Minutes (but non-blocking) |
| `ADD NOT NULL CONSTRAINT` | ACCESS EXCLUSIVE | 🔴 Critical | Minutes (full table scan) |
| `ADD FOREIGN KEY` | SHARE ROW EXCLUSIVE | 🔴 Critical | Minutes (full table scan) |

The operations marked 🔴 are the ones that cause outages. Let's learn how to make each of them safe.

## [](#the-expandcontract-pattern)The Expand-Contract Pattern

The expand-contract pattern (also called "parallel change") is the foundational strategy for zero-downtime migrations. The idea is simple: never make a breaking change in a single step. Instead, break it into multiple, non-breaking steps.  

```
┌─────────────────────────────────────────────────────────────┐
│              EXPAND-CONTRACT PATTERN                         │
│                                                              │
│  Phase 1: EXPAND                                            │
│  ┌──────────────────────────────────────────────────┐       │
│  │ Add new column/table alongside old one            │       │
│  │ Deploy code that writes to BOTH old and new       │       │
│  │ Old readers continue to work unchanged             │       │
│  └──────────────────────────────────────────────────┘       │
│                         │                                    │
│                         ▼                                    │
│  Phase 2: MIGRATE                                           │
│  ┌──────────────────────────────────────────────────┐       │
│  │ Backfill existing data to new column/table         │       │
│  │ Verify data consistency                            │       │
│  │ Switch readers to new column/table                 │       │
│  └──────────────────────────────────────────────────┘       │
│                         │                                    │
│                         ▼                                    │
│  Phase 3: CONTRACT                                          │
│  ┌──────────────────────────────────────────────────┐       │
│  │ Remove old column/table                            │       │
│  │ Remove compatibility code                          │       │
│  │ Clean up                                           │       │
│  └──────────────────────────────────────────────────┘       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

 

Let's see this applied to the most common and dangerous migrations.

### [](#example-renaming-a-column)Example: Renaming a Column

You want to rename `users.full_name` to `users.display_name`. A naive `ALTER TABLE users RENAME COLUMN full_name TO display_name` will break every query referencing `full_name` the instant it runs.

**Step 1: Expand** — Add the new column  

```
-- Deploy 1: Add new column (instant, no rewrite)
ALTER TABLE users ADD COLUMN display_name TEXT;

-- Create a trigger to keep both columns in sync
CREATE OR REPLACE FUNCTION sync_display_name()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.display_name IS NULL AND NEW.full_name IS NOT NULL THEN
      NEW.display_name := NEW.full_name;
    ELSIF NEW.full_name IS NULL AND NEW.display_name IS NOT NULL THEN
      NEW.full_name := NEW.display_name;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_display_name
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION sync_display_name();
```

 

**Step 2: Backfill** — Copy existing data  

```
-- Backfill in batches to avoid long-running transactions
DO $$
DECLARE
  batch_size INT := 10000;
  rows_updated INT;
BEGIN
  LOOP
    UPDATE users
    SET display_name = full_name
    WHERE id IN (
      SELECT id FROM users
      WHERE display_name IS NULL AND full_name IS NOT NULL
      LIMIT batch_size
      FOR UPDATE SKIP LOCKED
    );

    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    EXIT WHEN rows_updated = 0;

    RAISE NOTICE 'Updated % rows', rows_updated;
    PERFORM pg_sleep(0.1); -- Brief pause to reduce load
    COMMIT;
  END LOOP;
END $$;
```

 

**Step 3: Switch readers** — Update application code to read from `display_name`

**Step 4: Contract** — Remove old column and trigger  

```
-- Deploy 3: After all code reads from display_name
DROP TRIGGER trigger_sync_display_name ON users;
DROP FUNCTION sync_display_name();
ALTER TABLE users DROP COLUMN full_name;
```

 

Four deployments instead of one. But zero downtime.

## [](#safe-index-creation)Safe Index Creation

Creating indexes on large tables is one of the most common causes of production outages. A standard `CREATE INDEX` acquires a SHARE lock, blocking all writes (INSERT, UPDATE, DELETE) for the entire duration of the index build.

### [](#always-use-concurrently)Always Use CONCURRENTLY

```
-- ❌ DANGEROUS: Blocks all writes
CREATE INDEX idx_users_email ON users(email);

-- ✅ SAFE: Non-blocking
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
```

 

`CREATE INDEX CONCURRENTLY` builds the index without holding a lock that blocks writes. It does this by scanning the table twice — once to build the initial index, and once to capture any changes that happened during the first scan.

### [](#the-concurrently-gotchas)The CONCURRENTLY Gotchas

There are important caveats you must know:

**1\. It can fail silently.** If `CREATE INDEX CONCURRENTLY` encounters an error (e.g., a unique constraint violation), it leaves behind an INVALID index. Always verify:  

```
-- Check for invalid indexes after creation
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname = 'idx_users_email';

-- Check validity
SELECT pg_index.indisvalid
FROM pg_index
JOIN pg_class ON pg_index.indexrelid = pg_class.oid
WHERE pg_class.relname = 'idx_users_email';
```

 

If the index is invalid, drop it and try again:  

```
DROP INDEX CONCURRENTLY IF EXISTS idx_users_email;
-- Then retry CREATE INDEX CONCURRENTLY
```

 

**2\. It cannot run inside a transaction.** You cannot wrap `CREATE INDEX CONCURRENTLY` in a `BEGIN...COMMIT` block. Most migration tools run each migration in a transaction by default — you need to disable this for concurrent index creation.

**3\. It takes longer.** Because it scans the table twice and doesn't hold an exclusive lock, concurrent index creation takes 2-3x longer than a regular `CREATE INDEX`. On a 100 million row table, this could mean 30+ minutes. Plan accordingly.

## [](#adding-not-null-constraints-safely)Adding NOT NULL Constraints Safely

Adding a NOT NULL constraint to an existing column is deceptively dangerous. PostgreSQL must scan the entire table to verify no NULL values exist, and it holds an ACCESS EXCLUSIVE lock while doing so.

### [](#the-safe-pattern)The Safe Pattern

```
-- Step 1: Add a CHECK constraint with NOT VALID (instant, no scan)
ALTER TABLE users
ADD CONSTRAINT users_email_not_null
CHECK (email IS NOT NULL) NOT VALID;

-- Step 2: Validate the constraint in a separate transaction
-- This scans the table but only acquires a
-- SHARE UPDATE EXCLUSIVE lock (allows reads AND writes)
ALTER TABLE users VALIDATE CONSTRAINT users_email_not_null;

-- Step 3 (optional): Convert to a proper NOT NULL constraint
-- In PostgreSQL 12+, if a valid CHECK constraint exists,
-- adding NOT NULL is instant (no table scan needed)
ALTER TABLE users ALTER COLUMN email SET NOT NULL;

-- Step 4: Drop the now-redundant CHECK constraint
ALTER TABLE users DROP CONSTRAINT users_email_not_null;
```

 

Why this works: `NOT VALID` tells PostgreSQL "I promise this constraint holds for new rows, but don't check existing rows yet." The `VALIDATE CONSTRAINT` step then checks existing rows with a weaker lock that doesn't block reads or writes.

## [](#adding-foreign-keys-safely)Adding Foreign Keys Safely

Foreign key creation is another silent killer. By default, `ALTER TABLE ... ADD CONSTRAINT ... FOREIGN KEY` scans both the referencing and referenced tables while holding locks.  

```
-- ❌ DANGEROUS: Locks both tables during validation
ALTER TABLE orders
ADD CONSTRAINT fk_orders_user_id
FOREIGN KEY (user_id) REFERENCES users(id);

-- ✅ SAFE: Two-step approach
-- Step 1: Add constraint without validating (instant)
ALTER TABLE orders
ADD CONSTRAINT fk_orders_user_id
FOREIGN KEY (user_id) REFERENCES users(id)
NOT VALID;

-- Step 2: Validate separately (weaker lock)
ALTER TABLE orders VALIDATE CONSTRAINT fk_orders_user_id;
```

 

The `NOT VALID` trick works the same way as with CHECK constraints. New rows are validated immediately, and existing rows are validated in a separate step with a less restrictive lock.

## [](#changing-column-types)Changing Column Types

Changing a column type (e.g., `INT` to `BIGINT`, or `VARCHAR(50)` to `VARCHAR(255)`) typically requires a full table rewrite. On a table with millions of rows, this means minutes of downtime.

### [](#the-expandcontract-approach)The Expand-Contract Approach

```
-- Step 1: Add new column with desired type
ALTER TABLE orders ADD COLUMN amount_v2 BIGINT;

-- Step 2: Create sync trigger
CREATE OR REPLACE FUNCTION sync_amount_v2()
RETURNS TRIGGER AS $$
BEGIN
  NEW.amount_v2 := NEW.amount;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_amount_v2
  BEFORE INSERT OR UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION sync_amount_v2();

-- Step 3: Backfill (batched)
UPDATE orders SET amount_v2 = amount
WHERE id BETWEEN 1 AND 1000000;
-- ... repeat for all ranges

-- Step 4: Switch application code to use amount_v2

-- Step 5: Clean up
DROP TRIGGER trigger_sync_amount_v2 ON orders;
DROP FUNCTION sync_amount_v2();
ALTER TABLE orders DROP COLUMN amount;
ALTER TABLE orders RENAME COLUMN amount_v2 TO amount;
```

 

### [](#the-exception-varchar-length-increase)The Exception: Varchar Length Increase

Some column type changes are actually safe because they don't require a table rewrite:  

```
-- ✅ SAFE: Increasing VARCHAR length (no rewrite needed)
ALTER TABLE users ALTER COLUMN name TYPE VARCHAR(255);
-- Only safe when increasing, not decreasing!

-- ✅ SAFE: Removing VARCHAR limit entirely
ALTER TABLE users ALTER COLUMN name TYPE TEXT;

-- ✅ SAFE: Changing VARCHAR to TEXT
-- TEXT and VARCHAR are stored identically in PostgreSQL
```

 

## [](#lock-timeout-your-safety-net)Lock Timeout: Your Safety Net

Every migration should set a lock timeout. Without it, a migration will wait indefinitely for a lock, queueing all other queries behind it.  

```
-- Set a 5-second lock timeout for this session
SET lock_timeout = '5s';

-- Now try the migration
ALTER TABLE users ADD COLUMN bio TEXT;

-- If the lock can't be acquired within 5 seconds,
-- PostgreSQL raises an error instead of waiting forever
```

 

In your migration scripts, always set a lock timeout:  

```
-- At the top of every migration file
SET lock_timeout = '5s';
SET statement_timeout = '30s';

-- Your migration DDL here
ALTER TABLE users ADD COLUMN bio TEXT;

-- Reset for safety
RESET lock_timeout;
RESET statement_timeout;
```

 

### [](#retry-logic)Retry Logic

When using lock timeouts, you need retry logic. The migration might fail because a long-running query held a conflicting lock. That's okay — retry after a brief pause:  

```
async function safeMigrate(sql: string, maxRetries = 5): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await db.query('SET lock_timeout = \'5s\'');
      await db.query(sql);
      console.log(`Migration succeeded on attempt ${attempt}`);
      return;
    } catch (error) {
      if (error.code === '55P03' && attempt < maxRetries) {
        // Lock timeout - wait and retry
        console.log(
          `Lock timeout on attempt ${attempt}, ` +
          `retrying in ${attempt * 2}s...`
        );
        await sleep(attempt * 2000);
      } else {
        throw error;
      }
    }
  }
}
```

 

## [](#batched-backfills-the-art-of-moving-data)Batched Backfills: The Art of Moving Data

When you need to update millions of existing rows (e.g., backfilling a new column), doing it in a single `UPDATE` is dangerous. It creates one massive transaction that:

1.  Holds row-level locks on all affected rows
2.  Generates massive WAL (Write-Ahead Log) volume
3.  Can cause replication lag
4.  Bloats the table (dead tuples that need vacuuming)

### [](#the-batch-pattern)The Batch Pattern

```
-- Backfill in chunks of 10,000 rows
DO $$
DECLARE
  batch_size INT := 10000;
  last_id BIGINT := 0;
  max_id BIGINT;
  rows_updated INT;
BEGIN
  SELECT MAX(id) INTO max_id FROM orders;

  WHILE last_id < max_id LOOP
    UPDATE orders
    SET amount_cents = amount * 100
    WHERE id > last_id
      AND id <= last_id + batch_size
      AND amount_cents IS NULL;

    GET DIAGNOSTICS rows_updated = ROW_COUNT;

    last_id := last_id + batch_size;

    RAISE NOTICE 'Processed up to id %, updated % rows',
      last_id, rows_updated;

    -- Pause briefly to let replicas catch up
    -- and allow autovacuum to process dead tuples
    PERFORM pg_sleep(0.05);

    -- Commit each batch separately
    COMMIT;
  END LOOP;
END $$;
```

 

### [](#monitoring-your-backfill)Monitoring Your Backfill

While a backfill is running, monitor these metrics:  

```
-- Check replication lag (crucial for read replicas)
SELECT
  client_addr,
  state,
  sent_lsn,
  write_lsn,
  flush_lsn,
  replay_lsn,
  pg_wal_lsn_diff(sent_lsn, replay_lsn) AS replay_lag_bytes
FROM pg_stat_replication;

-- Check table bloat (dead tuples accumulating)
SELECT
  relname,
  n_live_tup,
  n_dead_tup,
  round(n_dead_tup::numeric / GREATEST(n_live_tup, 1) * 100, 2)
    AS dead_pct,
  last_autovacuum
FROM pg_stat_user_tables
WHERE relname = 'orders';

-- Check for long-running queries that might conflict
SELECT
  pid,
  now() - query_start AS duration,
  state,
  left(query, 100) AS query_preview
FROM pg_stat_activity
WHERE state != 'idle'
  AND query_start < now() - interval '30 seconds'
ORDER BY duration DESC;
```

 

## [](#migration-tooling-for-production)Migration Tooling for Production

### [](#pgroll-zerodowntime-migration-tool)pgroll: Zero-Downtime Migration Tool

[pgroll](https://github.com/xataio/pgroll) is a schema migration tool specifically designed for zero-downtime changes. It automatically implements the expand-contract pattern:  

```
{
  "name": "add_display_name",
  "operations": [
    {
      "rename_column": {
        "table": "users",
        "from": "full_name",
        "to": "display_name"
      }
    }
  ]
}
```

 

pgroll handles the expand phase (creating views, triggers, and temporary columns), the migration phase, and the contract phase automatically. It creates versioned schema views so old and new application versions can coexist.

### [](#reshape)Reshape

[Reshape](https://github.com/fabianlindfors/reshape) follows a similar philosophy — declarative, zero-downtime migrations with automatic expand-contract:  

```
[[actions]]
type = "alter_column"
table = "users"
column = "full_name"
[actions.changes]
name = "display_name"
```

 

### [](#sqitch-custom-scripts)sqitch + Custom Scripts

For teams preferring more control, [sqitch](https://sqitch.org/) combined with custom scripts provides a lightweight alternative:  

```
# sqitch workflow
sqitch add rename-user-column \
  -n "Rename full_name to display_name (phase 1: expand)"

sqitch deploy
sqitch verify
```

 

### [](#frameworkspecific-tools)Framework-Specific Tools

| Framework | Tool | Zero-Downtime Support |
| --- | --- | --- |
| Rails | strong\_migrations gem | Blocks dangerous operations, suggests safe alternatives |
| Django | django-pg-zero-downtime-migrations | Adds lock timeouts and safe patterns |
| Laravel | No built-in | Manual patterns required |
| Node.js/TypeScript | graphile-migrate, node-pg-migrate | Good control, manual patterns |
| Go | goose, atlas | Atlas has declarative migrations with safety checks |

## [](#the-premigration-checklist)The Pre-Migration Checklist

Before running any migration in production:

### [](#1-check-active-locks-and-longrunning-queries)1\. Check Active Locks and Long-Running Queries

```
-- Kill any query running longer than 5 minutes on target table
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE query ILIKE '%your_table%'
  AND state != 'idle'
  AND query_start < now() - interval '5 minutes';
```

 

### [](#2-test-on-a-productionsized-dataset)2\. Test on a Production-Sized Dataset

Never test migrations only on your development database. Create a staging environment with production-scale data:  

```
# Dump production table structure and row count
pg_dump --schema-only production_db > schema.sql

# Generate realistic test data at production scale
pgbench -i -s 1000 staging_db
```

 

### [](#3-set-timeouts)3\. Set Timeouts

```
SET lock_timeout = '5s';
SET statement_timeout = '30m'; -- for long backfills
```

 

### [](#4-have-a-rollback-plan)4\. Have a Rollback Plan

Every migration should have a tested rollback:  

```
-- migration.sql
ALTER TABLE users ADD COLUMN bio TEXT;

-- rollback.sql
ALTER TABLE users DROP COLUMN IF EXISTS bio;
```

 

### [](#5-monitor-during-deployment)5\. Monitor During Deployment

```
-- Watch for lock contention in real-time
SELECT
  blocked.pid AS blocked_pid,
  blocked.query AS blocked_query,
  blocking.pid AS blocking_pid,
  blocking.query AS blocking_query,
  now() - blocked.query_start AS blocked_duration
FROM pg_stat_activity blocked
JOIN pg_locks blocked_locks
  ON blocked.pid = blocked_locks.pid
JOIN pg_locks blocking_locks
  ON blocked_locks.locktype = blocking_locks.locktype
  AND blocked_locks.database = blocking_locks.database
  AND blocked_locks.relation = blocking_locks.relation
  AND blocked_locks.pid != blocking_locks.pid
JOIN pg_stat_activity blocking
  ON blocking_locks.pid = blocking.pid
WHERE NOT blocked_locks.granted;
```

 

## [](#realworld-migration-playbook)Real-World Migration Playbook

Here's a complete, copy-paste playbook for the most common production migrations:

### [](#playbook-1-add-a-new-required-column-with-default)Playbook 1: Add a New Required Column with Default

```
-- Step 1: Add nullable column (instant)
SET lock_timeout = '5s';
ALTER TABLE users ADD COLUMN subscription_tier TEXT;

-- Step 2: Backfill existing rows
DO $$
DECLARE
  batch_size INT := 5000;
  rows_updated INT;
BEGIN
  LOOP
    UPDATE users
    SET subscription_tier = 'free'
    WHERE subscription_tier IS NULL
      AND id IN (
        SELECT id FROM users
        WHERE subscription_tier IS NULL
        LIMIT batch_size
        FOR UPDATE SKIP LOCKED
      );
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    EXIT WHEN rows_updated = 0;
    COMMIT;
    PERFORM pg_sleep(0.05);
  END LOOP;
END $$;

-- Step 3: Add NOT NULL constraint safely
ALTER TABLE users
ADD CONSTRAINT users_subscription_tier_not_null
CHECK (subscription_tier IS NOT NULL) NOT VALID;

ALTER TABLE users
VALIDATE CONSTRAINT users_subscription_tier_not_null;

-- Step 4: Set NOT NULL (instant with valid CHECK constraint)
ALTER TABLE users ALTER COLUMN subscription_tier SET NOT NULL;

-- Step 5: Set default for future rows
ALTER TABLE users
ALTER COLUMN subscription_tier SET DEFAULT 'free';

-- Step 6: Clean up CHECK constraint
ALTER TABLE users
DROP CONSTRAINT users_subscription_tier_not_null;
```

 

### [](#playbook-2-create-index-on-large-table)Playbook 2: Create Index on Large Table

```
-- Step 1: Create index concurrently
SET statement_timeout = '0'; -- Disable for long-running index build
CREATE INDEX CONCURRENTLY idx_orders_customer_created
ON orders(customer_id, created_at DESC);

-- Step 2: Verify index is valid
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_index i
    JOIN pg_class c ON i.indexrelid = c.oid
    WHERE c.relname = 'idx_orders_customer_created'
      AND i.indisvalid = true
  ) THEN
    RAISE EXCEPTION 'Index is invalid! Drop and retry.';
  END IF;
END $$;
```

 

### [](#playbook-3-replace-a-table-full-schema-change)Playbook 3: Replace a Table (Full Schema Change)

```
-- When the changes are so extensive that expand-contract
-- on individual columns doesn't make sense

-- Step 1: Create new table with desired schema
CREATE TABLE users_v2 (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  subscription_tier TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Step 2: Create indexes on new table
CREATE INDEX idx_users_v2_email ON users_v2(email);
CREATE INDEX idx_users_v2_created ON users_v2(created_at);

-- Step 3: Copy data in batches (similar to backfill pattern)

-- Step 4: Create a trigger on old table to sync new rows
-- to users_v2

-- Step 5: Swap tables atomically
BEGIN;
ALTER TABLE users RENAME TO users_old;
ALTER TABLE users_v2 RENAME TO users;
COMMIT;

-- Step 6: Update sequences, foreign keys, etc.
-- Step 7: Drop old table after verification period
```

 

## [](#common-mistakes-and-how-to-avoid-them)Common Mistakes and How to Avoid Them

### [](#mistake-1-running-migrations-during-peak-traffic)Mistake 1: Running Migrations During Peak Traffic

Schedule schema migrations during your lowest-traffic window. Even "safe" migrations benefit from lower concurrency.

### [](#mistake-2-not-testing-the-rollback)Mistake 2: Not Testing the Rollback

Every migration rollback should be tested. "Just drop the column" is a rollback plan that destroys data. Consider whether you need to preserve data during rollback.

### [](#mistake-3-forgetting-about-orms)Mistake 3: Forgetting About ORMs

Your ORM might generate SQL that references columns by name. When using expand-contract, ensure your ORM version can handle the transitional state (both old and new columns existing).

### [](#mistake-4-ignoring-replication-lag)Mistake 4: Ignoring Replication Lag

If you use read replicas, schema changes propagate via replication. A backfill that writes 10 million rows can cause significant replication lag, making your read replicas return stale data.

**Solution**: Monitor `pg_stat_replication` during backfills and throttle if lag exceeds your threshold:  

```
async function throttledBackfill(batchSize: number) {
  while (true) {
    const lag = await getReplicationLag();
    if (lag > MAX_LAG_BYTES) {
      console.log(`Replication lag ${lag} bytes, pausing...`);
      await sleep(5000);
      continue;
    }

    const updated = await updateBatch(batchSize);
    if (updated === 0) break;

    await sleep(50); // baseline throttle
  }
}
```

 

### [](#mistake-5-deploying-application-code-and-migration-simultaneously)Mistake 5: Deploying Application Code and Migration Simultaneously

The application code and the migration should be deployed in separate steps. Deploy the migration first. Verify it succeeded. Then deploy the code that uses the new schema. This decoupling is essential for safe rollbacks.

## [](#the-migration-safety-checklist)The Migration Safety Checklist

Before every production migration:

-   \[ \] Lock timeout is set (`SET lock_timeout = '5s'`)
-   \[ \] Statement timeout is set for long operations
-   \[ \] Migration tested on production-scale dataset
-   \[ \] Rollback script written and tested
-   \[ \] No concurrent deployments or maintenance windows
-   \[ \] Replication lag monitoring is active
-   \[ \] Backfill uses batched updates (not single UPDATE)
-   \[ \] Indexes created with CONCURRENTLY
-   \[ \] NOT NULL constraints added via CHECK + VALIDATE pattern
-   \[ \] Foreign keys added with NOT VALID + VALIDATE
-   \[ \] Application code is backward-compatible with old schema
-   \[ \] On-call engineer is aware of the migration
-   \[ \] Traffic is at its lowest point (if possible)

Schema migrations don't have to be scary. The patterns in this guide have been battle-tested on databases serving millions of requests per day. The key insight is simple: never make a breaking change in a single step. Expand first, contract later. Set timeouts. Backfill in batches. Monitor everything.

Your database is the foundation of your application. Treat its schema changes with the same care you'd give to open-heart surgery — careful planning, precise execution, and constant monitoring.

---

> 🛠️ **Developer Toolkit:** This post first appeared on the [Pockit Blog](https://pockit.tools/blog/zero-downtime-postgresql-schema-migrations-production-guide/).
> 
> Need a **Regex Tester**, **JWT Decoder**, or **Image Converter**? Use them on [Pockit.tools](https://pockit.tools/json-formatter/) or **[install the Extension](https://chromewebstore.google.com/detail/pockit-developer-tools-pd/lojcamfhllebjmcjmipecgecbeopookg)** to avoid switching tabs. No signup required.
