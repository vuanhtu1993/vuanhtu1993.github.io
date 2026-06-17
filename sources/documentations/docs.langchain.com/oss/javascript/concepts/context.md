---
title: "Context overview - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/concepts/context"
crawled_at: "2026-06-17T14:54:19.342Z"
---

**Context engineering** is the practice of building dynamic systems that provide the right information and tools, in the right format, so that an AI application can accomplish a task. Context can be characterized along two key dimensions:

1.  By **mutability**:
    -   **Static context**: Immutable data that doesn’t change during execution (e.g., user metadata, database connections, tools)
    -   **Dynamic context**: Mutable data that evolves as the application runs (e.g., conversation history, intermediate results, tool call observations)
2.  By **lifetime**:
    -   **Runtime context**: Data scoped to a single run or invocation
    -   **Cross-conversation context**: Data that persists across multiple conversations or sessions

LangGraph provides three ways to manage context, which combines the mutability and lifetime dimensions:

| Context type | Description | Mutability | Lifetime |
| --- | --- | --- | --- |
| [**Config**](#config) | data passed at the start of a run | Static | Single run |
| [**Dynamic runtime context (state)**](#dynamic-runtime-context) | Mutable data that evolves during a single run | Dynamic | Single run |
| [**Dynamic cross-conversation context (store)**](#dynamic-cross-conversation-context) | Persistent data shared across conversations | Dynamic | Cross-conversation |

## Config

Config is for immutable data like user metadata or API keys. Use this when you have values that don’t change mid-run. Specify configuration using a key called **“configurable”** which is reserved for this purpose.

```
await graph.invoke(
  { messages: [{ role: "user", content: "hi!" }] },
  { configurable: { user_id: "user_123" } }
);
```

## Dynamic runtime context

**Dynamic runtime context** represents mutable data that can evolve during a single run and is managed through the LangGraph state object. This includes conversation history, intermediate results, and values derived from tools or LLM outputs. In LangGraph, the state object acts as [short-term memory](https://docs.langchain.com/oss/javascript/concepts/memory) during a run.

-   In an agent
    
-   In a workflow
    

Example shows how to incorporate state into an agent **prompt**.State can also be accessed by the agent’s **tools**, which can read or update the state as needed. See [tool calling guide](https://docs.langchain.com/oss/javascript/langchain/tools#access-context) for details.

```
import { createAgent, createMiddleware } from "langchain";
import type { AgentState } from "langchain";
import * as z from "zod";

const CustomState = z.object({
  userName: z.string(),
});

const personalizedPrompt = createMiddleware({
  name: "PersonalizedPrompt",
  stateSchema: CustomState,
  wrapModelCall: (request, handler) => {
    const userName = request.state.userName || "User";
    const systemPrompt = `You are a helpful assistant. User's name is ${userName}`;
    return handler({ ...request, systemPrompt });
  },
});

const agent = createAgent({
  model: "claude-sonnet-4-6",
  tools: [/* your tools here */],
  middleware: [personalizedPrompt] as const,
});

await agent.invoke({
  messages: [{ role: "user", content: "hi!" }],
  userName: "John Smith",
});
```

```
import { z } from "zod/v4";
import { StateGraph, StateSchema, MessagesValue, START } from "@langchain/langgraph";

const CustomState = new StateSchema({
  messages: MessagesValue,
  extraField: z.number(),
});

const builder = new StateGraph(CustomState)
  .addNode("node", async (state) => {
    const messages = state.messages;
    // ...
    return {
      extraField: state.extraField + 1,
    };
  })
  .addEdge(START, "node");

const graph = builder.compile();
```

## Dynamic cross-conversation context

**Dynamic cross-conversation context** represents persistent, mutable data that spans across multiple conversations or sessions and is managed through the LangGraph store. This includes user profiles, preferences, and historical interactions. The LangGraph store acts as [long-term memory](https://docs.langchain.com/oss/javascript/concepts/memory#long-term-memory) across multiple runs. This can be used to read or update persistent facts (e.g., user profiles, preferences, prior interactions).

## Learn more

-   [Memory conceptual overview](https://docs.langchain.com/oss/javascript/concepts/memory)
-   [Short-term memory in LangChain](https://docs.langchain.com/oss/javascript/langchain/short-term-memory)
-   [Memory in LangGraph](https://docs.langchain.com/oss/javascript/langgraph/add-memory)

---
