---
title: "Streaming - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/langchain/streaming"
crawled_at: "2026-06-17T14:47:36.875Z"
---

LangChain implements a streaming system to surface real-time updates. Streaming is crucial for enhancing the responsiveness of applications built on LLMs. By displaying output progressively, even before a complete response is ready, streaming significantly improves user experience (UX), particularly when dealing with the latency of LLMs.

## Overview

LangChain’s streaming system lets you surface live feedback from agent runs to your application. What’s possible with LangChain streaming:

-   [**Stream agent progress**](#agent-progress)—get state updates after each agent step.
-   [**Stream LLM tokens**](#llm-tokens)—stream language model tokens as they’re generated.
-   [**Stream thinking / reasoning tokens**](#streaming-thinking-/-reasoning-tokens)—surface model reasoning as it’s generated.
-   [**Stream custom updates**](#custom-updates)—emit user-defined signals (e.g., `"Fetched 10/100 records"`).
-   [**Stream multiple modes**](#stream-multiple-modes)—choose from `updates` (agent progress), `messages` (LLM tokens + metadata), or `custom` (arbitrary user data).

See the [common patterns](#common-patterns) section below for additional end-to-end examples.

## Supported stream modes

Pass one or more of the following stream modes as a list to the [`stream`](https://reference.langchain.com/javascript/classes/_langchain_langgraph.index.CompiledStateGraph.html#stream) method:

| Mode | Description |
| --- | --- |
| `updates` | Streams state updates after each agent step. If multiple updates are made in the same step (e.g., multiple nodes are run), those updates are streamed separately. |
| `messages` | Streams tuples of `(token, metadata)` from any graph nodes where an LLM is invoked. |
| `custom` | Streams custom data from inside your graph nodes using the stream writer. |

## Agent progress

To stream agent progress, use the [`stream`](https://reference.langchain.com/javascript/classes/_langchain_langgraph.index.CompiledStateGraph.html#stream) method with `streamMode: "updates"`. This emits an event after every agent step. For example, if you have an agent that calls a tool once, you should see the following updates:

-   **LLM node**: [`AIMessage`](https://reference.langchain.com/javascript/langchain-core/messages/AIMessage) with tool call requests
-   **Tool node**: [`ToolMessage`](https://reference.langchain.com/javascript/langchain-core/messages/ToolMessage) with execution result
-   **LLM node**: Final AI response

Pass a `thread_id` via `configurable` so the conversation is checkpointed and follow-up turns can resume the same history. `thread_id` is independent of `streamMode`; you can also pass `context` alongside it for per-run data your tools read from `runtime.context`.

## LLM tokens

To stream tokens as they are produced by the LLM, use `streamMode: "messages"`:

```
import z from "zod";
import { createAgent, tool } from "langchain";

const getWeather = tool(
    async ({ city }) => {
        return `The weather in ${city} is always sunny!`;
    },
    {
        name: "get_weather",
        description: "Get weather for a given city.",
        schema: z.object({
        city: z.string(),
        }),
    }
);

const agent = createAgent({
    model: "gpt-5.4-mini",
    tools: [getWeather],
});

for await (const [token, metadata] of await agent.stream(
    { messages: [{ role: "user", content: "what is the weather in sf" }] },
    { streamMode: "messages" }
)) {
    console.log(`node: ${metadata.langgraph_node}`);
    console.log(`content: ${JSON.stringify(token.contentBlocks, null, 2)}`);
}
```

## Custom updates

To stream updates from tools as they are executed, you can use the `writer` parameter from the configuration.

```
import z from "zod";
import { tool, createAgent } from "langchain";
import { LangGraphRunnableConfig } from "@langchain/langgraph";

const getWeather = tool(
    async (input, config: LangGraphRunnableConfig) => {
        // Stream any arbitrary data
        config.writer?.(`Looking up data for city: ${input.city}`);
        // ... fetch city data
        config.writer?.(`Acquired data for city: ${input.city}`);
        return `It's always sunny in ${input.city}!`;
    },
    {
        name: "get_weather",
        description: "Get weather for a given city.",
        schema: z.object({
        city: z.string().describe("The city to get weather for."),
        }),
    }
);

const agent = createAgent({
    model: "gpt-5.4-mini",
    tools: [getWeather],
});

for await (const chunk of await agent.stream(
    { messages: [{ role: "user", content: "what is the weather in sf" }] },
    { streamMode: "custom" }
)) {
    console.log(chunk);
}
```

Output

```
Looking up data for city: San Francisco
Acquired data for city: San Francisco
```

## Stream multiple modes

You can specify multiple streaming modes by passing streamMode as an array: `streamMode: ["updates", "messages", "custom"]`. The streamed outputs will be tuples of `[mode, chunk]` where `mode` is the name of the stream mode and `chunk` is the data streamed by that mode.

```
import z from "zod";
import { tool, createAgent } from "langchain";
import { LangGraphRunnableConfig } from "@langchain/langgraph";

const getWeather = tool(
    async (input, config: LangGraphRunnableConfig) => {
        // Stream any arbitrary data
        config.writer?.(`Looking up data for city: ${input.city}`);
        // ... fetch city data
        config.writer?.(`Acquired data for city: ${input.city}`);
        return `It's always sunny in ${input.city}!`;
    },
    {
        name: "get_weather",
        description: "Get weather for a given city.",
        schema: z.object({
        city: z.string().describe("The city to get weather for."),
        }),
    }
);

const agent = createAgent({
    model: "gpt-5.4-mini",
    tools: [getWeather],
});

for await (const [streamMode, chunk] of await agent.stream(
    { messages: [{ role: "user", content: "what is the weather in sf" }] },
    { streamMode: ["updates", "messages", "custom"] }
)) {
    console.log(`${streamMode}: ${JSON.stringify(chunk, null, 2)}`);
}
```

## Common patterns

Below are examples showing common use cases for streaming.

### Streaming thinking / reasoning tokens

Some models perform internal reasoning before producing a final answer. You can stream these thinking / reasoning tokens as they’re generated by filtering [standard content blocks](https://docs.langchain.com/oss/javascript/langchain/messages#standard-content-blocks) for the `type` `"reasoning"`.

To stream thinking tokens from an agent, use `streamMode: "messages"` and filter for reasoning content blocks. Use a model instance (e.g. `ChatAnthropic`) with extended thinking enabled when the model supports it:

```
import z from "zod";
import { createAgent, tool } from "langchain";
import { ChatAnthropic } from "@langchain/anthropic";

const getWeather = tool(
  async ({ city }) => {
    return `It's always sunny in ${city}!`;
  },
  {
    name: "get_weather",
    description: "Get weather for a given city.",
    schema: z.object({ city: z.string() }),
  },
);

const agent = createAgent({
  model: new ChatAnthropic({
    model: "claude-sonnet-4-6",
    thinking: { type: "enabled", budget_tokens: 5000 },
  }),
  tools: [getWeather],
});

for await (const [token, metadata] of await agent.stream(
  { messages: [{ role: "user", content: "What is the weather in SF?" }] },
  { streamMode: "messages" },
)) {
  if (!token.contentBlocks) continue;
  const reasoning = token.contentBlocks.filter((b) => b.type === "reasoning");
  const text = token.contentBlocks.filter((b) => b.type === "text");
  if (reasoning.length) {
    process.stdout.write(`[thinking] ${reasoning[0].reasoning}`);
  }
  if (text.length) {
    process.stdout.write(text[0].text);
  }
}
```

Output

```
[thinking] The user is asking about the weather in San Francisco. I have a tool
[thinking]  available to get this information. Let me call the get_weather tool
[thinking]  with "San Francisco" as the city parameter.
The weather in San Francisco is: It's always sunny in San Francisco!
```

This works the same way regardless of the model provider—LangChain normalizes provider-specific formats (Anthropic `thinking` blocks, OpenAI `reasoning` summaries, etc.) into a standard `"reasoning"` content block type via the [`content_blocks`](https://docs.langchain.com/oss/javascript/langchain/messages#standard-content-blocks) property. To stream reasoning tokens directly from a chat model (without an agent), see [streaming with chat models](https://docs.langchain.com/oss/javascript/langchain/models#reasoning).

## Disable streaming

In some applications you might need to disable streaming of individual tokens for a given model. This is useful when:

-   Working with [multi-agent](https://docs.langchain.com/oss/javascript/langchain/multi-agent) systems to control which agents stream their output
-   Mixing models that support streaming with those that do not
-   Deploying to [LangSmith](https://docs.langchain.com/langsmith/observability) and wanting to prevent certain model outputs from being streamed to the client

Set `streaming: false` when initializing the model.

```
import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({
  model: "gpt-5.5",
  streaming: false,
});
```

See the [LangGraph streaming guide](https://docs.langchain.com/oss/javascript/langgraph/streaming#disable-streaming-for-specific-chat-models) for more details.

-   [Frontend streaming](https://docs.langchain.com/oss/javascript/langchain/frontend/overview)—Build React UIs with [`useStream`](https://reference.langchain.com/javascript/langchain-react/index/useStream) for real-time agent interactions
-   [Streaming with chat models](https://docs.langchain.com/oss/javascript/langchain/models#stream)—Stream tokens directly from a chat model without using an agent or graph
-   [Reasoning with chat models](https://docs.langchain.com/oss/javascript/langchain/models#reasoning)—Configure and access reasoning output from chat models
-   [Standard content blocks](https://docs.langchain.com/oss/javascript/langchain/messages#standard-content-blocks)—Understand the normalized content block format used for reasoning, text, and other content types
-   [Streaming with human-in-the-loop](https://docs.langchain.com/oss/javascript/langchain/human-in-the-loop#streaming-with-human-in-the-loop)—Stream agent progress while handling interrupts for human review
-   [LangGraph streaming](https://docs.langchain.com/oss/javascript/langgraph/streaming)—Advanced streaming options including `values`, `debug` modes, and subgraph streaming

---
