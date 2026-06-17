---
title: "Headless tools - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/langchain/frontend/headless-tools"
crawled_at: "2026-06-17T14:57:19.773Z"
---

Headless tools let your agent call tools whose real execution must happen in the user’s app instead of on the server. The agent still sees a normal tool schema, but the implementation lives in the frontend, where it can access browser APIs like IndexedDB, geolocation, clipboard, canvas, or file pickers. This pattern is especially useful when data should stay local to the device. The playground example on this page uses a small browser-memory toolkit backed by IndexedDB plus a geolocation tool that runs entirely on the client.

## How headless tools work

At a high level, headless tools split the tool schema from the browser-only implementation.

1.  Register a schema-only tool definition on the agent.
2.  Implement the matching tool in the frontend with `.implement(...)`.
3.  Pass those implementations to `useStream({ tools: [...] })`.
4.  When the agent emits a matching tool call, the client runs it and resumes the interrupted run with the tool result.

## Register the tool on the agent

The playground defines a small set of client-side tools that follow the same pattern: the agent exposes a tool schema, and the frontend handles the actual execution. Define the tools once in a shared `tools.ts` file and use that file from both the agent and the frontend.

## Implement the browser behavior

Put the client-only behavior in a separate module and attach it with `.implement(...)`. The real playground includes a fuller IndexedDB store with search, listing, expiration, and delete operations. The following example shows the same shape at a higher level:

impl.ts

```
import {
  geolocationGet as geolocationGetDefinition,
  memoryGet as memoryGetDefinition,
  memoryPut as memoryPutDefinition,
} from "./tools";

async function saveMemory(key: string, value: unknown) {
  localStorage.setItem(`agent-memory:${key}`, JSON.stringify(value));
}

async function getMemory(key: string) {
  const value = localStorage.getItem(`agent-memory:${key}`);
  return value ? JSON.parse(value) : null;
}

export const memoryPut = memoryPutDefinition.implement(async ({ key, value }) => {
  await saveMemory(key, value);
  return { success: true, key };
});

export const memoryGet = memoryGetDefinition.implement(async ({ key }) => {
  const value = await getMemory(key);
  return value === null ? { found: false, key } : { found: true, key, value };
});

export const geolocationGet = geolocationGetDefinition.implement(
  async ({ save = true }) => {
    const position = await new Promise<GeolocationPosition>((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject),
    );

    const location = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
    };

    if (save) {
      await saveMemory("user_location", location);
    }

    return location;
  },
);
```

## Wire the implementations into `useStream`

Pass the implemented tools to `useStream`. When the agent emits a matching tool call, the hook runs the client implementation and resumes the run for you. The agent state can be inferred from the agent definition:

```
import type { myAgent } from "./agent";

export type AgentState = typeof myAgent;
```

## Render tool activity inline

The playground renders each memory or geolocation operation as its own card and keeps a small memory stats panel near the input. The key step is matching each entry in `stream.toolCalls` back to the AI message that triggered it:

```
import type { ToolCallWithResult, DefaultToolCall } from "@langchain/react";

function Message({ message, toolCalls }: {
  message: AIMessage,
  toolCalls: ToolCallWithResult[]
}) {
  const messageToolCalls = toolCalls.filter((tc) =>
    message.tool_calls?.some((call) => call.id === tc.call.id),
  );

  return (
    <div>
      {message.text && <p>{message.text}</p>}
      {messageToolCalls.map((tc) => (
        <HeadlessToolCard key={tc.call.id} toolCall={tc} />
      ))}
    </div>
  );
}
```

This works especially well with the richer UI patterns from [Tool calling](https://docs.langchain.com/oss/javascript/langchain/frontend/tool-calling), where each tool result can render as a specialized card instead of raw JSON.

## Use cases

Use headless tools when the work depends on APIs or data that only exist in the client:

-   Local memory in IndexedDB or `localStorage`
-   Device APIs like geolocation, clipboard, camera, or file pickers
-   Canvas, audio, or other browser-only rendering primitives
-   Privacy-sensitive data that should stay on the user’s device
-   UI actions that need direct access to in-memory frontend state

## Best practices

-   Keep tools small and typed. Prefer many narrow tools over one generic “run arbitrary browser code” tool.
-   Return JSON-serializable results. Do not try to return DOM nodes, file handles, or other non-serializable browser objects.
-   Share definitions, separate implementations. The agent and client should agree on tool names and schemas, but only the client should load browser APIs.
-   Surface tool state in the UI. Use `stream.toolCalls` and `onTool` to show pending, success, and error states.
-   Add review when needed. For sensitive client-side actions, pair this pattern with [Human-in-the-loop](https://docs.langchain.com/oss/javascript/langchain/frontend/human-in-the-loop).

---
