---
title: "Building Custom MCP Servers in TypeScript: The Complete 2026 Guide"
source_url: "https://dev.to/pockit_tools/building-custom-mcp-servers-in-typescript-the-complete-2026-guide-578k"
crawled_at: "2026-08-07T09:31:30.845Z"
---

Every AI IDE worth using in 2026 — Claude Desktop, Cursor, Windsurf, VS Code with Copilot — speaks MCP. The Model Context Protocol has become the universal standard for connecting AI assistants to external tools, databases, and APIs. But here's the thing: **most developers are still only consuming MCP servers, not building them.**

That's a missed opportunity. Building your own MCP server means you can give your AI coding assistant access to _anything_ — your company's internal APIs, your deployment pipeline, your database, your monitoring dashboards, your CMS. The moment you build your first MCP server, AI assistants stop being generic chatbots and start becoming genuine extensions of your development environment.

This guide walks you through **everything** you need to build production-quality MCP servers in TypeScript. We'll start from zero and get to production-ready, covering the protocol internals, the official SDK, real-world patterns, security considerations, and deployment strategies.

## [](#what-mcp-actually-is-30second-version)What MCP Actually Is (30-Second Version)

If you've used MCP servers but never built one, here's the mental model:

**MCP is a JSON-RPC 2.0 protocol** that standardizes how AI clients (Claude, Cursor, etc.) communicate with external capability providers (your server). Think of it like LSP (Language Server Protocol) but for AI assistants instead of code editors.

Your MCP server can expose three types of capabilities:

1.  **Tools** — Functions the AI can call (e.g., "query the database", "deploy to staging", "create a Jira ticket")
2.  **Resources** — Data the AI can read (e.g., "the current schema", "today's error logs", "the deployment status")
3.  **Prompts** — Pre-built prompt templates the AI can use (e.g., "analyze this PR", "generate a migration plan")

The client (Claude, Cursor) discovers what your server offers, and the AI model decides when and how to use those capabilities based on the conversation context.  

```
┌─────────────────┐         JSON-RPC 2.0         ┌─────────────────┐
│   AI Client     │ ◄──────────────────────────► │   MCP Server    │
│  (Claude, etc.) │    stdio / SSE / HTTP        │   (Your code)   │
│                 │                               │                 │
│  - Discovers    │                               │  - Tools        │
│    capabilities │                               │  - Resources    │
│  - Calls tools  │                               │  - Prompts      │
│  - Reads data   │                               │  - Auth/Security│
└─────────────────┘                               └─────────────────┘
```

 

## [](#setting-up-your-project)Setting Up Your Project

Let's build a real MCP server. We'll create a server that gives AI assistants access to a PostgreSQL database — a practical use case that demonstrates all the core patterns.

### [](#prerequisites)Prerequisites

```
node --version  # v20+ recommended
npm --version   # v10+
```

 

### [](#project-initialization)Project Initialization

```
mkdir mcp-database-server
cd mcp-database-server
npm init -y
npm install @modelcontextprotocol/sdk@latest zod  # v1.27+ as of March 2026
npm install -D typescript @types/node tsx
```

 

Set up TypeScript:  

```
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true
  },
  "include": ["src/**/*"]
}
```

 

Update your `package.json`:  

```
{
  "type": "module",
  "bin": {
    "mcp-database-server": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts",
    "start": "node dist/index.js"
  }
}
```

 

## [](#building-your-first-mcp-server)Building Your First MCP Server

Here's the skeleton. Every MCP server starts the same way:  

```
// src/index.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new McpServer({
  name: 'mcp-database-server',
  version: '1.0.0',
  capabilities: {
    tools: {},
    resources: {},
    prompts: {},
  },
});

// We'll add tools, resources, and prompts here

// Connect via stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
console.error('MCP Database Server running on stdio');
```

 

Note that we log to `stderr`, not `stdout`. The `stdout` channel is reserved for JSON-RPC communication with the client. Anything you write to `stdout` that isn't valid JSON-RPC will break the protocol. This is a common gotcha that trips up first-time MCP server builders.

## [](#adding-tools)Adding Tools

Tools are the most powerful MCP primitive. They let the AI execute actions on your behalf.

### [](#basic-tool-definition)Basic Tool Definition

```
import { z } from 'zod';

server.tool(
  'query',
  'Execute a read-only SQL query against the database',
  {
    sql: z.string().describe('The SQL query to execute (SELECT only)'),
    params: z.array(z.union([z.string(), z.number(), z.boolean(), z.null()]))
      .optional()
      .describe('Parameterized query values'),
  },
  async ({ sql, params }) => {
    // Validate it's a read-only query
    const normalized = sql.trim().toUpperCase();
    if (!normalized.startsWith('SELECT') && !normalized.startsWith('WITH') && !normalized.startsWith('EXPLAIN')) {
      return {
        content: [{
          type: 'text',
          text: 'Error: Only SELECT, WITH, and EXPLAIN queries are allowed.',
        }],
        isError: true,
      };
    }

    try {
      const result = await pool.query(sql, params);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result.rows, null, 2),
        }],
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Query error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        }],
        isError: true,
      };
    }
  }
);
```

 

Let's break down the anatomy:

1.  **Name** (`'query'`) — Unique identifier for the tool
2.  **Description** — Critical. The AI reads this to decide _when_ to use the tool. Write it like you're explaining the tool to a smart junior developer.
3.  **Schema** — Zod schema defining the input parameters. The AI uses this to construct valid calls.
4.  **Handler** — The async function that executes when the tool is called.

### [](#tool-description-best-practices)Tool Description Best Practices

Your tool descriptions are **prompt engineering**. The AI model reads them to decide which tool to use and how. Bad descriptions = the AI calls the wrong tool or passes wrong parameters.  

```
// ❌ Bad: Too vague
server.tool('query', 'Run a query', { sql: z.string() }, handler);

// ❌ Bad: Too short, no constraints
server.tool('query', 'SQL query', { sql: z.string() }, handler);

// ✅ Good: Specific, with constraints and examples
server.tool(
  'query',
  'Execute a read-only SQL query against the PostgreSQL database. ' +
  'Only SELECT, WITH (CTE), and EXPLAIN queries are allowed. ' +
  'Use parameterized queries ($1, $2, ...) for user-provided values. ' +
  'Returns results as JSON array of objects. ' +
  'Example: SELECT id, name FROM users WHERE active = $1',
  {
    sql: z.string().describe('PostgreSQL query (SELECT/WITH/EXPLAIN only)'),
    params: z.array(z.union([z.string(), z.number(), z.boolean(), z.null()]))
      .optional()
      .describe('Values for parameterized query placeholders ($1, $2, ...)'),
  },
  handler
);
```

 

### [](#multitool-pattern)Multi-Tool Pattern

Real servers expose multiple related tools. Here's a pattern for CRUD operations with appropriate safety guardrails:  

```
// Read-only: No confirmation needed
server.tool(
  'list_tables',
  'List all tables in the database with their column count and row count estimates',
  {},
  async () => {
    const result = await pool.query(`
      SELECT
        schemaname,
        tablename,
        (SELECT count(*) FROM information_schema.columns c
         WHERE c.table_schema = t.schemaname AND c.table_name = t.tablename) as column_count,
        n_live_tup as estimated_rows
      FROM pg_stat_user_tables t
      ORDER BY schemaname, tablename
    `);
    return {
      content: [{ type: 'text', text: JSON.stringify(result.rows, null, 2) }],
    };
  }
);

// Read-only with parameters
server.tool(
  'describe_table',
  'Get detailed schema information for a specific table including columns, types, constraints, and indexes',
  {
    table: z.string().describe('Table name (can include schema prefix like "public.users")'),
  },
  async ({ table }) => {
    const [schema, tableName] = table.includes('.')
      ? table.split('.')
      : ['public', table];

    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default,
             character_maximum_length
      FROM information_schema.columns
      WHERE table_schema = $1 AND table_name = $2
      ORDER BY ordinal_position
    `, [schema, tableName]);

    const indexes = await pool.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE schemaname = $1 AND tablename = $2
    `, [schema, tableName]);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ columns: columns.rows, indexes: indexes.rows }, null, 2),
      }],
    };
  }
);

// Write operation: Return clear results so the AI can confirm to the user
server.tool(
  'execute_migration',
  'Execute a SQL migration statement (CREATE, ALTER, DROP). ' +
  'WARNING: This modifies the database schema. Use with caution. ' +
  'The AI should always confirm with the user before calling this tool.',
  {
    sql: z.string().describe('The DDL statement to execute'),
    description: z.string().describe('Human-readable description of what this migration does'),
  },
  async ({ sql, description }) => {
    try {
      await pool.query('BEGIN');
      await pool.query(sql);
      await pool.query('COMMIT');
      return {
        content: [{
          type: 'text',
          text: `Migration successful: ${description}\n\nExecuted:\n${sql}`,
        }],
      };
    } catch (error) {
      await pool.query('ROLLBACK');
      return {
        content: [{
          type: 'text',
          text: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nRolled back.`,
        }],
        isError: true,
      };
    }
  }
);
```

 

## [](#adding-resources)Adding Resources

Resources let the AI read data without executing an action. They're great for context — giving the AI background information it needs to make better decisions.

### [](#static-resources)Static Resources

```
server.resource(
  'schema',
  'db://schema',
  {
    description: 'Current database schema including all tables, columns, and relationships',
    mimeType: 'application/json',
  },
  async () => {
    const result = await pool.query(`
      SELECT
        t.table_schema,
        t.table_name,
        json_agg(json_build_object(
          'column', c.column_name,
          'type', c.data_type,
          'nullable', c.is_nullable = 'YES',
          'default', c.column_default
        ) ORDER BY c.ordinal_position) as columns
      FROM information_schema.tables t
      JOIN information_schema.columns c
        ON c.table_schema = t.table_schema AND c.table_name = t.table_name
      WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
      GROUP BY t.table_schema, t.table_name
      ORDER BY t.table_name
    `);

    return {
      contents: [{
        uri: 'db://schema',
        mimeType: 'application/json',
        text: JSON.stringify(result.rows, null, 2),
      }],
    };
  }
);
```

 

### [](#resource-templates-dynamic-resources)Resource Templates (Dynamic Resources)

Resource templates let you expose parameterized data:  

```
server.resource(
  'table-data',
  'db://tables/{tableName}/sample',
  {
    description: 'Sample data (first 10 rows) from a specific table',
    mimeType: 'application/json',
  },
  async (uri) => {
    const tableName = uri.pathname.split('/')[2];

    // Validate table name (prevent SQL injection)
    const validTable = await pool.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = $1`,
      [tableName]
    );

    if (validTable.rows.length === 0) {
      throw new Error(`Table '${tableName}' not found`);
    }

    const result = await pool.query(
      `SELECT * FROM "${tableName}" LIMIT 10`
    );

    return {
      contents: [{
        uri: uri.href,
        mimeType: 'application/json',
        text: JSON.stringify(result.rows, null, 2),
      }],
    };
  }
);
```

 

## [](#adding-prompts)Adding Prompts

Prompts are pre-built templates that help the AI tackle specific tasks. They're underutilized but extremely powerful for encoding domain expertise.  

````
server.prompt(
  'analyze-query-performance',
  'Analyze a slow SQL query and suggest optimizations',
  {
    query: z.string().describe('The SQL query to analyze'),
  },
  async ({ query }) => {
    // Get the execution plan
    const explainResult = await pool.query(`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query}`);
    const plan = JSON.stringify(explainResult.rows[0], null, 2);

    // Get relevant table statistics
    const tables = extractTableNames(query); // helper function
    const stats = await Promise.all(
      tables.map(async (table) => {
        const result = await pool.query(`
          SELECT relname, reltuples::bigint as estimated_rows,
                 pg_size_pretty(pg_total_relation_size(oid)) as total_size
          FROM pg_class WHERE relname = $1
        `, [table]);
        return result.rows[0];
      })
    );

    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: [
              `Analyze the following PostgreSQL query for performance issues:`,
              '',
              '```

sql',
              query,
              '

```',
              '',
              'Execution Plan (EXPLAIN ANALYZE):',
              '```

json',
              plan,
              '

```',
              '',
              'Table Statistics:',
              '```

json',
              JSON.stringify(stats, null, 2),
              '

```',
              '',
              'Please provide:',
              '1. What the current execution plan tells us',
              '2. Identified bottlenecks (sequential scans, high-cost nodes)',
              '3. Specific index recommendations with CREATE INDEX statements',
              '4. Query rewrite suggestions if applicable',
              '5. Estimated improvement after optimization',
            ].join('\n'),
          },
        },
      ],
    };
  }
);
````

 

## [](#transport-layers-stdio-sse-and-streamable-http)Transport Layers: stdio, SSE, and Streamable HTTP

MCP supports multiple transport mechanisms. Choosing the right one matters for your deployment model.

### [](#stdio-standard-io)stdio (Standard I/O)

The default for local MCP servers. The client spawns your server as a child process and communicates via stdin/stdout.  

```
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const transport = new StdioServerTransport();
await server.connect(transport);
```

 

**When to use:** Local development tools, CLI integrations, servers that run alongside the AI client on the same machine.

**Pros:** Simple, no network setup, automatic lifecycle management.  
**Cons:** Only works locally, one client per server instance.

### [](#sse-serversent-events-deprecated)SSE (Server-Sent Events) — Deprecated

> ⚠️ **Note:** SSE transport is **deprecated** as of the 2025-11-25 MCP specification. New projects should use **Streamable HTTP** instead. SSE is shown here because many existing servers still use it and you may encounter it in the wild.

For remote servers that need to be accessible over HTTP:  

```
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import express from 'express';

const app = express();
const transports = new Map<string, SSEServerTransport>();

app.get('/sse', (req, res) => {
  const transport = new SSEServerTransport('/messages', res);
  const sessionId = transport.sessionId;
  transports.set(sessionId, transport);

  res.on('close', () => {
    transports.delete(sessionId);
  });

  server.connect(transport);
});

app.post('/messages', (req, res) => {
  const sessionId = req.query.sessionId as string;
  const transport = transports.get(sessionId);
  if (transport) {
    transport.handlePostMessage(req, res);
  } else {
    res.status(404).send('Session not found');
  }
});

app.listen(3001, () => {
  console.error('MCP SSE server listening on port 3001');
});
```

 

**When to use:** Legacy servers, backward compatibility with older clients. For new projects, use Streamable HTTP.

### [](#streamable-http-recommended)Streamable HTTP (Recommended)

The **recommended transport for all new remote MCP servers** as of 2026. Streamable HTTP replaced SSE as the standard web transport, offering a single endpoint, support for both batch and streaming responses, session management, and horizontal scalability:  

```
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';

const app = express();
app.use(express.json());

app.post('/mcp', async (req, res) => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless mode
  });

  res.on('close', () => {
    transport.close();
  });

  await server.connect(transport);
  await transport.handleRequest(req, res);
});

app.listen(3001);
```

 

**When to use:** Serverless deployments (AWS Lambda, Vercel Edge), stateless APIs, environments where long-lived connections are problematic.

## [](#security-dont-ship-an-rce-server)Security: Don't Ship an RCE Server

This is where most MCP tutorials stop, and it's exactly where the real work begins. An insecure MCP server is essentially a **remote code execution endpoint** that an AI model can trigger. Let's fix that.

### [](#input-validation)Input Validation

Never trust the AI model's inputs. Validate everything:  

```
server.tool(
  'query',
  'Execute a read-only SQL query',
  {
    sql: z.string()
      .max(10000)  // Limit query length
      .refine(
        (sql) => {
          const upper = sql.trim().toUpperCase();
          // Whitelist allowed statement types
          return upper.startsWith('SELECT') ||
                 upper.startsWith('WITH') ||
                 upper.startsWith('EXPLAIN');
        },
        { message: 'Only SELECT, WITH, and EXPLAIN queries are allowed' }
      )
      .refine(
        (sql) => {
          const upper = sql.toUpperCase();
          // Block dangerous patterns even in subqueries
          const dangerous = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER',
                           'TRUNCATE', 'GRANT', 'REVOKE', 'CREATE'];
          return !dangerous.some(keyword =>
            new RegExp(`\\b${keyword}\\b`).test(upper)
          );
        },
        { message: 'Query contains disallowed DDL/DML keywords' }
      ),
  },
  handler
);
```

 

### [](#database-connection-security)Database Connection Security

Use a read-only connection for query tools:  

```
import pg from 'pg';

// Read-only connection pool
const readPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  // Set session-level read-only
  options: '-c default_transaction_read_only=on',
});

// Separate pool for write operations (if needed)
const writePool = new pg.Pool({
  connectionString: process.env.DATABASE_WRITE_URL,
  max: 2,
});
```

 

### [](#rate-limiting)Rate Limiting

Prevent runaway AI loops from hammering your server:  

```
class RateLimiter {
  private calls: Map<string, number[]> = new Map();

  check(toolName: string, maxCalls: number, windowMs: number): boolean {
    const now = Date.now();
    const key = toolName;
    const timestamps = this.calls.get(key) || [];
    const recent = timestamps.filter(t => now - t < windowMs);

    if (recent.length >= maxCalls) {
      return false;
    }

    recent.push(now);
    this.calls.set(key, recent);
    return true;
  }
}

const limiter = new RateLimiter();

// Wrap your tool handler
const rateLimitedHandler = (toolName: string, maxCalls: number, handler: Function) => {
  return async (args: any) => {
    if (!limiter.check(toolName, maxCalls, 60_000)) {
      return {
        content: [{
          type: 'text' as const,
          text: `Rate limit exceeded for ${toolName}. Max ${maxCalls} calls per minute.`,
        }],
        isError: true,
      };
    }
    return handler(args);
  };
};
```

 

### [](#timeout-protection)Timeout Protection

```
function withTimeout<T>(promise: Promise<T>, ms: number, operation: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${operation} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

// In your tool handler:
const result = await withTimeout(
  pool.query(sql, params),
  30_000,
  'Database query'
);
```

 

## [](#error-handling-patterns)Error Handling Patterns

Robust error handling is what separates toy servers from production ones.  

```
// Centralized error handler
function handleToolError(error: unknown, context: string): ToolResult {
  console.error(`[${context}]`, error);

  if (error instanceof z.ZodError) {
    return {
      content: [{
        type: 'text',
        text: `Validation error: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
      }],
      isError: true,
    };
  }

  if (error instanceof pg.DatabaseError) {
    return {
      content: [{
        type: 'text',
        text: `Database error (${error.code}): ${error.message}` +
              (error.detail ? `\nDetail: ${error.detail}` : '') +
              (error.hint ? `\nHint: ${error.hint}` : ''),
      }],
      isError: true,
    };
  }

  if (error instanceof Error && error.message.includes('timed out')) {
    return {
      content: [{
        type: 'text',
        text: `Operation timed out. The query may be too complex or the database may be under heavy load.`,
      }],
      isError: true,
    };
  }

  return {
    content: [{
      type: 'text',
      text: `Unexpected error in ${context}: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }],
    isError: true,
  };
}
```

 

The key insight: **error messages are prompts**. The AI reads your error messages and uses them to adjust its approach. Include actionable information:

-   ❌ `"Error: 42P01"` — Useless to the AI
-   ✅ `"Table 'userz' not found. Did you mean 'users'? Available tables: users, posts, comments"` — The AI can self-correct

## [](#testing-your-mcp-server)Testing Your MCP Server

### [](#manual-testing-with-mcp-inspector)Manual Testing with MCP Inspector

The official MCP Inspector is invaluable during development:  

```
npx @modelcontextprotocol/inspector tsx src/index.ts
```

 

This opens a browser UI where you can:

-   See all registered tools, resources, and prompts
-   Call tools with test inputs
-   Inspect the JSON-RPC messages
-   Debug transport issues

### [](#integration-with-claude-desktop)Integration with Claude Desktop

Add your server to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):  

```
{
  "mcpServers": {
    "database": {
      "command": "tsx",
      "args": ["/absolute/path/to/src/index.ts"],
      "env": {
        "DATABASE_URL": "postgresql://user:pass@localhost:5432/mydb"
      }
    }
  }
}
```

 

Then restart Claude Desktop. Your tools will appear in the toolbox icon.

### [](#automated-testing)Automated Testing

```
// test/server.test.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

describe('MCP Database Server', () => {
  let server: McpServer;
  let client: Client;

  beforeEach(async () => {
    server = createServer(); // your server factory
    client = new Client({ name: 'test-client', version: '1.0.0' });

    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    await client.connect(clientTransport);
  });

  test('list_tables returns table information', async () => {
    const result = await client.callTool({
      name: 'list_tables',
      arguments: {},
    });

    expect(result.isError).toBeFalsy();
    const tables = JSON.parse(result.content[0].text);
    expect(tables).toBeInstanceOf(Array);
    expect(tables.length).toBeGreaterThan(0);
  });

  test('query rejects INSERT statements', async () => {
    const result = await client.callTool({
      name: 'query',
      arguments: { sql: "INSERT INTO users (name) VALUES ('hack')" },
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Only SELECT');
  });

  test('query handles parameterized queries', async () => {
    const result = await client.callTool({
      name: 'query',
      arguments: {
        sql: 'SELECT * FROM users WHERE id = $1',
        params: [1],
      },
    });

    expect(result.isError).toBeFalsy();
  });
});
```

 

## [](#the-complete-server)The Complete Server

Let's put it all together into a production-ready server:  

```
// src/index.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import pg from 'pg';

// ── Configuration ──────────────────────────────────────────
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  max: 5,
  options: '-c default_transaction_read_only=on -c statement_timeout=30000',
});

// Verify connection on startup
pool.query('SELECT 1').catch((err) => {
  console.error('Failed to connect to database:', err.message);
  process.exit(1);
});

// ── Server Setup ───────────────────────────────────────────
const server = new McpServer({
  name: 'mcp-database-server',
  version: '1.0.0',
  capabilities: {
    tools: {},
    resources: {},
    prompts: {},
  },
});

// ── Tools ──────────────────────────────────────────────────
server.tool(
  'list_tables',
  'List all tables in the public schema with column count and estimated row count',
  {},
  async () => {
    const result = await pool.query(`
      SELECT tablename,
             (SELECT count(*) FROM information_schema.columns c
              WHERE c.table_schema = 'public' AND c.table_name = t.tablename) as columns,
             n_live_tup as estimated_rows
      FROM pg_stat_user_tables t
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    return { content: [{ type: 'text', text: JSON.stringify(result.rows, null, 2) }] };
  }
);

server.tool(
  'describe_table',
  'Get detailed column information, types, constraints, and indexes for a table',
  { table: z.string().describe('Table name in the public schema') },
  async ({ table }) => {
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
    `, [table]);

    if (columns.rows.length === 0) {
      return {
        content: [{ type: 'text', text: `Table '${table}' not found in public schema.` }],
        isError: true,
      };
    }

    const indexes = await pool.query(`
      SELECT indexname, indexdef FROM pg_indexes
      WHERE schemaname = 'public' AND tablename = $1
    `, [table]);

    const foreignKeys = await pool.query(`
      SELECT
        kcu.column_name,
        ccu.table_name AS foreign_table,
        ccu.column_name AS foreign_column
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = $1
    `, [table]);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          table,
          columns: columns.rows,
          indexes: indexes.rows,
          foreignKeys: foreignKeys.rows,
        }, null, 2),
      }],
    };
  }
);

server.tool(
  'query',
  'Execute a read-only SQL query. Only SELECT, WITH (CTE), and EXPLAIN are allowed. ' +
  'Use $1, $2, ... for parameterized values. Returns JSON array.',
  {
    sql: z.string().max(10000).describe('PostgreSQL SELECT query'),
    params: z.array(z.union([z.string(), z.number(), z.boolean(), z.null()]))
      .optional()
      .describe('Parameter values for $1, $2, ... placeholders'),
  },
  async ({ sql, params }) => {
    const upper = sql.trim().toUpperCase();
    const disallowed = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER',
                        'TRUNCATE', 'CREATE', 'GRANT', 'REVOKE'];
    for (const keyword of disallowed) {
      if (new RegExp(`\\b${keyword}\\b`).test(upper)) {
        return {
          content: [{ type: 'text', text: `Blocked: '${keyword}' statements are not allowed.` }],
          isError: true,
        };
      }
    }

    try {
      const result = await pool.query(sql, params || []);
      const truncated = result.rows.length > 100
        ? { rows: result.rows.slice(0, 100), note: `Showing 100 of ${result.rows.length} rows` }
        : { rows: result.rows, total: result.rows.length };
      return { content: [{ type: 'text', text: JSON.stringify(truncated, null, 2) }] };
    } catch (err) {
      const pgErr = err as pg.DatabaseError;
      return {
        content: [{ type: 'text', text: `Query failed: ${pgErr.message}${pgErr.hint ? `\nHint: ${pgErr.hint}` : ''}` }],
        isError: true,
      };
    }
  }
);

// ── Resources ──────────────────────────────────────────────
server.resource(
  'schema-overview',
  'db://schema',
  { description: 'Complete database schema overview', mimeType: 'application/json' },
  async () => {
    const result = await pool.query(`
      SELECT t.tablename,
             json_agg(json_build_object(
               'column', c.column_name,
               'type', c.data_type,
               'nullable', c.is_nullable = 'YES'
             ) ORDER BY c.ordinal_position) as columns
      FROM pg_stat_user_tables t
      JOIN information_schema.columns c
        ON c.table_schema = 'public' AND c.table_name = t.tablename
      WHERE t.schemaname = 'public'
      GROUP BY t.tablename ORDER BY t.tablename
    `);
    return {
      contents: [{ uri: 'db://schema', mimeType: 'application/json', text: JSON.stringify(result.rows, null, 2) }],
    };
  }
);

// ── Prompts ────────────────────────────────────────────────
server.prompt(
  'optimize-query',
  'Analyze a SQL query and suggest performance optimizations',
  { query: z.string().describe('The SQL query to optimize') },
  async ({ query }) => ({
    messages: [{
      role: 'user',
      content: {
        type: 'text',
        text: `Analyze this PostgreSQL query for performance:\n\n\`\`\`sql\n${query}\n\`\`\`\n\nPlease suggest index optimizations, query rewrites, and explain the reasoning.`,
      },
    }],
  })
);

// ── Lifecycle ──────────────────────────────────────────────
process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});

// ── Start ──────────────────────────────────────────────────
const transport = new StdioServerTransport();
await server.connect(transport);
console.error('MCP Database Server running');
```

 

## [](#deployment-patterns)Deployment Patterns

### [](#pattern-1-npm-package-local-distribution)Pattern 1: npm Package (Local Distribution)

```
npm run build
npm pack
# Distribute the .tgz or publish to npm

# Users install and configure:
npm install -g mcp-database-server
```

 

Configuration in Claude Desktop:  

```
{
  "mcpServers": {
    "database": {
      "command": "mcp-database-server",
      "env": { "DATABASE_URL": "postgresql://..." }
    }
  }
}
```

 

### [](#pattern-2-docker-teamremote)Pattern 2: Docker (Team/Remote)

```
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY dist/ ./dist/
EXPOSE 3001
CMD ["node", "dist/sse-server.js"]
```

 

### [](#pattern-3-serverless-streamable-http)Pattern 3: Serverless (Streamable HTTP)

For Vercel, AWS Lambda, or Cloudflare Workers:  

```
// api/mcp.ts (Vercel serverless function)
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

export default async function handler(req: Request): Promise<Response> {
  const server = createServer(); // Your server factory
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  await server.connect(transport);

  // Convert Vercel request format to transport
  return transport.handleRequest(req);
}
```

 

## [](#common-pitfalls-and-how-to-avoid-them)Common Pitfalls and How to Avoid Them

### [](#1-logging-to-stdout)1\. Logging to stdout

```
// ❌ This breaks the JSON-RPC protocol
console.log('Server started');

// ✅ Use stderr for logging
console.error('Server started');
```

 

### [](#2-not-handling-connection-lifecycle)2\. Not Handling Connection Lifecycle

```
// ❌ Resources leak on disconnect
const server = new McpServer(config);

// ✅ Clean up properly
server.onclose = async () => {
  await pool.end();
  console.error('Connection closed, resources cleaned up');
};
```

 

### [](#3-returning-too-much-data)3\. Returning Too Much Data

```
// ❌ Dumps entire table into context window
return { content: [{ type: 'text', text: JSON.stringify(allRows) }] };

// ✅ Paginate and summarize
const rows = result.rows.slice(0, 50);
return {
  content: [{
    type: 'text',
    text: JSON.stringify({
      rows,
      total: result.rowCount,
      note: result.rowCount > 50
        ? `Showing 50 of ${result.rowCount} rows. Use LIMIT/OFFSET for pagination.`
        : undefined,
    }, null, 2),
  }],
};
```

 

### [](#4-missing-error-context)4\. Missing Error Context

```
// ❌ AI can't self-correct
return { content: [{ type: 'text', text: 'Error' }], isError: true };

// ✅ AI can adjust its approach
return {
  content: [{
    type: 'text',
    text: `Column "user_name" not found in table "users". Available columns: id, email, full_name, created_at. Did you mean "full_name"?`,
  }],
  isError: true,
};
```

 

### [](#5-no-timeout-on-database-queries)5\. No Timeout on Database Queries

```
// ❌ A complex query locks the connection forever
await pool.query(complexSql);

// ✅ Set statement_timeout at pool level
const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  options: '-c statement_timeout=30000', // 30 seconds
});
```

 

## [](#whats-next-for-mcp)What's Next for MCP

The protocol is evolving fast. Here's what has shipped and what's coming:

**Already in the spec (2025-11-25):**

-   **OAuth 2.1 authorization** — MCP servers are now classified as OAuth Resource Servers with standardized Protected Resource Metadata discovery. No more ad-hoc auth patterns.
-   **Structured tool output** — Tools can return structured data alongside text, making it easier for clients to process results programmatically.
-   **Elicitation** — Servers can request additional input from users during interactions (e.g., "enter your API key" or "authorize this OAuth flow").
-   **Icon metadata** — Tools, resources, and prompts can include icon URLs, returned in `list` responses for richer client UIs.
-   **`title` field** — A new `title` field provides human-friendly display names, while `name` stays as a programmatic identifier.

**Coming soon (SDK v2 and beyond):**

-   **Agent-to-agent MCP** — MCP servers that act as clients to other MCP servers, enabling composable AI tool chains.
-   **Tasks (experimental)** — A new primitive for durable state tracking and deferred retrieval of results, useful for long-running operations.
-   **Sandbox execution** — Standardized container-based isolation for MCP servers with manifest-based permission systems.

The ecosystem is growing rapidly. The community MCP server registry now has hundreds of servers for everything from GitHub, Slack, and Jira to Kubernetes, AWS, and Terraform. Building your own is the best way to understand the protocol — and to give your AI assistant superpowers that no pre-built server provides.

## [](#conclusion)Conclusion

Building an MCP server isn't hard. The SDK handles the protocol complexity, and you focus on what matters: defining the right tools, resources, and prompts for your use case.

The key takeaways:

1.  **Start with tools.** They're the most impactful primitive. Get one working tool in Claude Desktop and iterate from there.
2.  **Write descriptions like you're prompt engineering.** Because you are. The AI uses your descriptions to decide when and how to use your tools.
3.  **Security is not optional.** Validate all inputs, use read-only connections, implement rate limiting, and set timeouts.
4.  **Error messages are prompts.** Return actionable error contexts so the AI can self-correct.
5.  **Choose your transport wisely.** stdio for local, Streamable HTTP for remote (SSE is deprecated).

The gap between "AI that can chat about code" and "AI that can actually operate your infrastructure" is exactly one MCP server wide. Time to bridge it.

---

> 🔒 **Privacy First:** This article was originally published on the [Pockit Blog](https://pockit.tools/blog/building-custom-mcp-servers-typescript-complete-guide/).
> 
> Stop sending your data to random servers. Use [Pockit.tools](https://pockit.tools/json-formatter/) for secure utilities, or **[install the Chrome Extension](https://chromewebstore.google.com/detail/pockit-developer-tools-pd/lojcamfhllebjmcjmipecgecbeopookg)** to keep your files 100% private and offline.
