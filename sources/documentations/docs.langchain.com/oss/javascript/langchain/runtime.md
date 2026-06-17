---
title: "Runtime - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/langchain/runtime"
crawled_at: "2026-06-17T14:48:11.232Z"
---

## Overview

LangChain’s `createAgent` runs on LangGraph’s runtime under the hood. LangGraph exposes a [`Runtime`](https://reference.langchain.com/javascript/langchain/index/Runtime) object with the following information:

1.  **Context**: static information like user id, db connections, or other dependencies for an agent invocation
2.  **Store**: a [BaseStore](https://reference.langchain.com/javascript/langchain-core/stores/BaseStore) instance used for [long-term memory](https://docs.langchain.com/oss/javascript/langchain/long-term-memory)
3.  **Stream writer**: an object used for streaming information via the `"custom"` stream mode
4.  **Execution info**: identity and retry information for the current execution (thread ID, run ID, attempt number)
5.  **Server info**: server-specific metadata when running on LangGraph Server (assistant ID, graph ID, authenticated user)

You can access the runtime information within [tools](#inside-tools) and [middleware](#inside-middleware).

## Access

When creating an agent with `createAgent`, you can specify a `contextSchema` to define the structure of the `context` stored in the agent [`Runtime`](https://reference.langchain.com/javascript/langchain/index/Runtime). When invoking the agent, pass the `context` argument with the relevant configuration for the run:

```
import * as z from "zod";
import { createAgent } from "langchain";

const contextSchema = z.object({
  userName: z.string(),
});

const agent = createAgent({
  model: "gpt-5.5",
  tools: [
    /* ... */
  ],
  contextSchema,
});

const result = await agent.invoke(
  { messages: [{ role: "user", content: "What's my name?" }] },
  { context: { userName: "John Smith" } }
);
```

### Inside tools

You can access the runtime information inside tools to:

-   Access the context
-   Read or write long-term memory
-   Write to the [custom stream](https://docs.langchain.com/oss/javascript/langchain/streaming#custom-updates) (ex, tool progress / updates)

Use the `runtime` parameter to access the [`Runtime`](https://reference.langchain.com/javascript/langchain/index/Runtime) object inside a tool.

```
import * as z from "zod";
import { tool } from "langchain";
import { type ToolRuntime } from "@langchain/core/tools";

const contextSchema = z.object({
  userName: z.string(),
});

const fetchUserEmailPreferences = tool(
  async (_, runtime: ToolRuntime<any, typeof contextSchema>) => {
    const userName = runtime.context?.userName;
    if (!userName) {
      throw new Error("userName is required");
    }

    let preferences = "The user prefers you to write a brief and polite email.";
    if (runtime.store) {
      const memory = await runtime.store?.get(["users"], userName);
      if (memory) {
        preferences = memory.value.preferences;
      }
    }
    return preferences;
  },
  {
    name: "fetch_user_email_preferences",
    description: "Fetch the user's email preferences.",
    schema: z.object({}),
  }
);
```

### Execution info and server info inside tools

Access execution identity (thread ID, run ID) via `runtime.executionInfo`, and server-specific metadata (assistant ID, authenticated user) via `runtime.serverInfo` when running on LangGraph Server:

```
import { tool } from "langchain";
import * as z from "zod";

const contextAwareTool = tool(
  async (_input, runtime) => {
    // Access thread and run IDs
    const info = runtime.executionInfo;
    console.log(`Thread: ${info.threadId}, Run: ${info.runId}`);

    // Access server info (only available on LangGraph Server)
    const server = runtime.serverInfo;
    if (server != null) {
      console.log(`Assistant: ${server.assistantId}`);
      if (server.user != null) {
        console.log(`User: ${server.user.identity}`);
      }
    }

    return "done";
  },
  {
    name: "context_aware_tool",
    description: "A tool that uses execution and server info.",
    schema: z.object({}),
  }
);
```

`serverInfo` is `null` when not running on LangGraph Server (e.g., during local development).

### Inside middleware

You can access runtime information in middleware to create dynamic prompts, modify messages, or control agent behavior based on user context. Use the `runtime` parameter to access the [`Runtime`](https://reference.langchain.com/javascript/langchain/index/Runtime) object inside middleware.

```
import * as z from "zod";
import { createAgent, createMiddleware, SystemMessage } from "langchain";

const contextSchema = z.object({
  userName: z.string(),
});

// Dynamic prompt middleware
const dynamicPromptMiddleware = createMiddleware({
  name: "DynamicPrompt",
  contextSchema,
  beforeModel: (state, runtime) => {
    const userName = runtime.context?.userName;
    if (!userName) {
      throw new Error("userName is required");
    }

    const systemMsg = `You are a helpful assistant. Address the user as ${userName}.`;
    return {
      messages: [new SystemMessage(systemMsg), ...state.messages],
    };
  },
});

// Logging middleware
const loggingMiddleware = createMiddleware({
  name: "Logging",
  contextSchema,
  beforeModel: (state, runtime) => {
    console.log(`Processing request for user: ${runtime.context?.userName}`);
    return;
  },
  afterModel: (state, runtime) => {
    console.log(`Completed request for user: ${runtime.context?.userName}`);
    return;
  },
});

const agent = createAgent({
  model: "gpt-5.5",
  tools: [
    /* ... */
  ],
  middleware: [dynamicPromptMiddleware, loggingMiddleware],
  contextSchema,
});

const result = await agent.invoke(
  { messages: [{ role: "user", content: "What's my name?" }] },
  { context: { userName: "John Smith" } }
);

```

### Execution info and server info inside middleware

Middleware hooks can also access `runtime.executionInfo` and `runtime.serverInfo`:

```
import { createMiddleware } from "langchain";

const authGate = createMiddleware({
  name: "AuthGate",
  beforeModel: (state, runtime) => {
    const server = runtime.serverInfo;
    if (server != null && server.user == null) {
      throw new Error("Authentication required");
    }
    console.log(`Thread: ${runtime.executionInfo.threadId}`);
    return;
  },
});
```

---
