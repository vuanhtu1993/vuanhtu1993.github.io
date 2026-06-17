---
title: "What's new in LangChain v1 - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/releases/langchain-v1"
crawled_at: "2026-06-17T14:55:49.218Z"
---

**LangChain v1 is a focused, production-ready foundation for building agents.** We’ve streamlined the framework around three core improvements:

To upgrade,

For a complete list of changes, see the [migration guide](https://docs.langchain.com/oss/javascript/migrate/langchain-v1).

## `createAgent`

`createAgent` is the standard way to build agents in LangChain 1.0. It provides a simpler interface than the prebuilt `createReactAgent` exported from LangGraph while offering greater customization potential by using middleware.

```
import { createAgent } from "langchain";

const agent = createAgent({
  model: "claude-sonnet-4-6",
  tools: [getWeather],
  systemPrompt: "You are a helpful assistant.",
});

const result = await agent.invoke({
  messages: [
    { role: "user", content: "What is the weather in Tokyo?" },
  ],
});

console.log(result.content);
```

Under the hood, `createAgent` is built on the basic agent loop — calling a model, letting it choose tools to execute, and then finishing when it calls no more tools:

![Core agent loop diagram](https://res.cloudinary.com/dv3vzmogk/image/upload/v1781708151/aha-mind/docs-crawler/docs.langchain.com/core_agent_loop_u0mady.png)

For more information, see [Agents](https://docs.langchain.com/oss/javascript/langchain/agents).

### Middleware

Middleware is the defining feature of `createAgent`. It makes `createAgent` highly customizable, raising the ceiling for what you can build. Great agents require [context engineering](https://docs.langchain.com/oss/javascript/langchain/context-engineering): getting the right information to the model at the right time. Middleware helps you control dynamic prompts, conversation summarization, selective tool access, state management, and guardrails through a composable abstraction.

#### Prebuilt middleware

LangChain provides a few [prebuilt middlewares](https://docs.langchain.com/oss/javascript/langchain/middleware#built-in-middleware) for common patterns, including:

-   `summarizationMiddleware`: Condense conversation history when it gets too long
-   `humanInTheLoopMiddleware`: Require approval for sensitive tool calls
-   `piiRedactionMiddleware`: Redact sensitive information before sending to the model

```
import {
  createAgent,
  summarizationMiddleware,
  humanInTheLoopMiddleware,
  piiRedactionMiddleware,
} from "langchain";

const agent = createAgent({
  model: "claude-sonnet-4-6",
  tools: [readEmail, sendEmail],
  middleware: [
    piiRedactionMiddleware({ patterns: ["email", "phone", "ssn"] }),
    summarizationMiddleware({
      model: "claude-sonnet-4-6",
      trigger: { tokens: 500 },
    }),
    humanInTheLoopMiddleware({
      interruptOn: {
        sendEmail: {
          allowedDecisions: ["approve", "edit", "reject"],
        },
      },
    }),
  ],
});
```

#### Custom middleware

You can also build custom middleware to fit your specific needs. Build custom middleware by implementing any of these hooks using the `createMiddleware` function:

| Hook | When it runs | Use cases |
| --- | --- | --- |
| `beforeAgent` | Before calling the agent | Load memory, validate input |
| `beforeModel` | Before each LLM call | Update prompts, trim messages |
| `wrapModelCall` | Around each LLM call | Intercept and modify requests/responses |
| `wrapToolCall` | Around each tool call | Intercept and modify tool execution |
| `afterModel` | After each LLM response | Validate output, apply guardrails |
| `afterAgent` | After agent completes | Save results, cleanup |

![Middleware flow diagram](https://res.cloudinary.com/dv3vzmogk/image/upload/v1781708151/aha-mind/docs-crawler/docs.langchain.com/middleware_final_najrfh.png)

Example custom middleware:

```
import { createMiddleware } from "langchain";

const contextSchema = z.object({
  userExpertise: z.enum(["beginner", "expert"]).default("beginner"),
})

const expertiseBasedToolMiddleware = createMiddleware({
  wrapModelCall: async (request, handler) => {
    const userLevel = request.runtime.context.userExpertise;
    if (userLevel === "expert") {
      const tools = [advancedSearch, dataAnalysis];
      return handler(
        request.replace("openai:gpt-5.5", tools)
      );
    }
    const tools = [simpleSearch, basicCalculator];
    return handler(
      request.replace("openai:gpt-5-nano", tools)
    );
  },
});

const agent = createAgent({
  model: "claude-sonnet-4-6",
  tools: [simpleSearch, advancedSearch, basicCalculator, dataAnalysis],
  middleware: [expertiseBasedToolMiddleware],
  contextSchema,
});
```

For more information, see [the complete middleware guide](https://docs.langchain.com/oss/javascript/langchain/middleware).

### Built on LangGraph

Because `createAgent` is built on LangGraph, you automatically get built in support for long running and reliable agents via:

You don’t need to learn LangGraph to use these features—they work out of the box.

### Structured output

`createAgent` has improved structured output generation:

-   **Main loop integration**: Structured output is now generated in the main loop instead of requiring an additional LLM call
-   **Structured output strategy**: Models can choose between calling tools or using provider-side structured output generation
-   **Cost reduction**: Eliminates extra expense from additional LLM calls

```
import { createAgent } from "langchain";
import * as z from "zod";

const weatherSchema = z.object({
  temperature: z.number(),
  condition: z.string(),
});

const agent = createAgent({
  model: "gpt-5.4-mini",
  tools: [getWeather],
  responseFormat: weatherSchema,
});

const result = await agent.invoke({
  messages: [
    { role: "user", content: "What is the weather in Tokyo?" },
  ],
});

console.log(result.structuredResponse);
```

**Error handling**: Control error handling via the `handleErrors` parameter to `ToolStrategy`:

-   **Parsing errors**: Model generates data that doesn’t match desired structure
-   **Multiple tool calls**: Model generates 2+ tool calls for structured output schemas

---

## Standard content blocks

### Benefits

-   **Provider agnostic**: Access reasoning traces, citations, built-in tools (web search, code interpreters, etc.), and other features using the same API regardless of provider
-   **Type safe**: Full type hints for all content block types
-   **Backward compatible**: Standard content can be [loaded lazily](https://docs.langchain.com/oss/javascript/langchain/messages#standard-content-blocks), so there are no associated breaking changes

For more information, see our guide on [content blocks](https://docs.langchain.com/oss/javascript/langchain/messages#message-content)

---

## Simplified package

LangChain v1 streamlines the `langchain` package namespace to focus on essential building blocks for agents. The package exposes only the most useful and relevant functionality: Most of these are re-exported from `@langchain/core` for convenience, which gives you a focused API surface for building agents.

### `@langchain/classic`

Legacy functionality has moved to [`@langchain/classic`](https://www.npmjs.com/package/@langchain/classic) to keep the core package lean and focused.

#### What’s in `@langchain/classic`

-   Legacy chains and chain implementations
-   Retrievers
-   The indexing API
-   [`@langchain/community`](https://www.npmjs.com/package/@langchain/community) exports
-   Other deprecated functionality

If you use any of this functionality, install [`@langchain/classic`](https://www.npmjs.com/package/@langchain/classic):

Then update your imports:

```
import { ... } from "langchain";
import { ... } from "@langchain/classic";

import { ... } from "langchain/chains";
import { ... } from "@langchain/classic/chains";
```

## Reporting issues

Please report any issues discovered with 1.0 on [GitHub](https://github.com/langchain-ai/langchainjs/issues) using the [`'v1'` label](https://github.com/langchain-ai/langchainjs/issues?q=state%3Aopen%20label%3Av1).

## Additional resources

## See also

-   [Versioning](https://docs.langchain.com/oss/javascript/versioning) – Understanding version numbers
-   [Release policy](https://docs.langchain.com/oss/javascript/release-policy) – Detailed release policies

---
