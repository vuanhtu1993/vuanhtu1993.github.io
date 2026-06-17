---
title: "ChatOpenRouter integration - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/integrations/chat/openrouter"
crawled_at: "2026-06-17T14:51:25.541Z"
---

This will help you get started with OpenRouter [chat models](https://docs.langchain.com/oss/javascript/langchain/models). OpenRouter is a unified API that provides access to models from multiple providers (OpenAI, Anthropic, Google, Meta, and more) through a single endpoint.

For a full list of available models, visit the [OpenRouter models page](https://openrouter.ai/models).

## Overview

### Integration details

| Class | Package | Serializable | [PY support](https://python.langchain.com/docs/integrations/chat/openrouter) | Downloads | Version |
| --- | --- | --- | --- | --- | --- |
| [`ChatOpenRouter`](https://reference.langchain.com/javascript/langchain-openrouter/ChatOpenRouter) | [`@langchain/openrouter`](https://www.npmjs.com/package/@langchain/openrouter) | ✅ | ✅ | ![NPM - Downloads](https://res.cloudinary.com/dv3vzmogk/image/upload/v1781707886/aha-mind/docs-crawler/docs.langchain.com/openrouter_rdphqw.svg) | ![NPM - Version](https://res.cloudinary.com/dv3vzmogk/image/upload/v1781707886/aha-mind/docs-crawler/docs.langchain.com/openrouter_site7k.svg) |

### Model features

| [Tool calling](https://docs.langchain.com/oss/javascript/langchain/tools) | [Structured output](https://docs.langchain.com/oss/javascript/langchain/structured-output) | [Image input](https://docs.langchain.com/oss/javascript/langchain/messages#multimodal) | Audio input | Video input | [Token-level streaming](https://docs.langchain.com/oss/javascript/langchain/streaming) | [Token usage](https://docs.langchain.com/oss/javascript/langchain/models#token-usage) | [Logprobs](https://docs.langchain.com/oss/javascript/langchain/models#log-probabilities) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## Setup

To access models via OpenRouter you’ll need to create an [OpenRouter account](https://openrouter.ai/), get an API key, and install the `@langchain/openrouter` integration package.

### Credentials

Head to the [OpenRouter keys page](https://openrouter.ai/settings/keys) to sign up and generate an API key. Once you’ve done this set the `OPENROUTER_API_KEY` environment variable:

```
export OPENROUTER_API_KEY="your-api-key"
```

To enable automated tracing of your model calls, set your [LangSmith](https://docs.langchain.com/langsmith/observability) API key:

```
# export LANGSMITH_TRACING="true"
# export LANGSMITH_API_KEY="your-api-key"
```

### Installation

The LangChain OpenRouter integration lives in the `@langchain/openrouter` package:

## Instantiation

Now you can instantiate the model:

```
import { ChatOpenRouter } from "@langchain/openrouter";

const model = new ChatOpenRouter({
  model: "anthropic/claude-sonnet-4.5",
  temperature: 0,
  maxTokens: 1024,
  // other params...
});
```

---

## Invocation

```
const aiMsg = await model.invoke([
  {
    role: "system",
    content:
      "You are a helpful assistant that translates English to French. Translate the user sentence.",
  },
  {
    role: "user",
    content: "I love programming.",
  },
]);
console.log(aiMsg.content);
```

```
J'adore la programmation.
```

---

## Streaming

```
const stream = await model.stream("Write a short poem about the sea.");
for await (const chunk of stream) {
  process.stdout.write(typeof chunk.content === "string" ? chunk.content : "");
}
```

---

## Tool calling

OpenRouter uses the OpenAI-compatible tool calling format. You can describe tools and their arguments, and have the model return a JSON object with a tool to invoke and the inputs to that tool.

### Bind tools

With `ChatOpenRouter.bindTools`, you can pass in Zod schemas, LangChain tools, or raw function definitions as tools to the model. Under the hood these are converted to OpenAI tool schemas and passed in every model invocation.

```
import { ChatOpenRouter } from "@langchain/openrouter";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const getWeather = tool(async ({ location }) => `Sunny in ${location}`, {
  name: "get_weather",
  description: "Get the current weather in a given location",
  schema: z.object({
    location: z
      .string()
      .describe("The city and state, e.g. San Francisco, CA"),
  }),
});

const modelWithTools = new ChatOpenRouter({
  model: "openai/gpt-4o",
}).bindTools([getWeather]);

const aiMsg = await modelWithTools.invoke(
  "What is the weather like in San Francisco?"
);
console.log(aiMsg.tool_calls);
```

```
[
  {
    name: 'get_weather',
    args: { location: 'San Francisco, CA' },
    id: 'call_abc123',
    type: 'tool_call'
  }
]
```

### Strict mode

Pass `strict: true` to guarantee that model output exactly matches the JSON Schema provided in the tool definition:

```
const modelWithStrictTools = new ChatOpenRouter({
  model: "openai/gpt-4o",
}).bindTools([getWeather], { strict: true });
```

For more on binding tools and tool call outputs, head to the [tool calling](https://docs.langchain.com/oss/javascript/langchain/tools) docs.

---

## Structured output

`ChatOpenRouter` supports structured output via the `.withStructuredOutput()` method. The extraction strategy is chosen automatically based on model capabilities:

-   **`jsonSchema`**—native JSON Schema response format (used when the model supports it)
-   **`functionCalling`**—wraps the schema as a tool call (default fallback)
-   **`jsonMode`**—asks the model to respond in JSON without strict schema constraints

```
import { ChatOpenRouter } from "@langchain/openrouter";
import { z } from "zod";

const model = new ChatOpenRouter({ model: "openai/gpt-5.5" });

const movieSchema = z.object({
  title: z.string().describe("The title of the movie"),
  year: z.number().describe("The year the movie was released"),
  director: z.string().describe("The director of the movie"),
  rating: z.number().describe("The movie's rating out of 10"),
});

const structuredModel = model.withStructuredOutput(movieSchema, {
  name: "movie",
  method: "jsonSchema",
});
const response = await structuredModel.invoke(
  "Provide details about the movie Inception"
);
console.log(response);
```

```
{
  title: 'Inception',
  year: 2010,
  director: 'Christopher Nolan',
  rating: 8.8
}
```

You can pass `strict: true` with the `jsonSchema` and `functionCalling` methods to enforce exact schema adherence:

```
const strictModel = model.withStructuredOutput(movieSchema, {
  name: "movie",
  method: "jsonSchema",
  strict: true,
});
```

---

## Multimodal inputs

OpenRouter supports [multimodal inputs](https://docs.langchain.com/oss/javascript/langchain/messages#multimodal) for models that accept them. The available modalities depend on the model you select—check the [OpenRouter models page](https://openrouter.ai/models) for details.

### Image input

Provide image inputs along with text using a list content format.

---

After an invocation, token usage information is available on the `usage_metadata` attribute of the response:

```
const aiMsg = await model.invoke("Tell me a joke.");
console.log(aiMsg.usage_metadata);
```

```
{
  input_tokens: 12,
  output_tokens: 25,
  total_tokens: 37
}
```

When the underlying provider includes detailed token breakdowns in its response, they are surfaced automatically:

-   `output_token_details.reasoning`—tokens used for internal chain-of-thought reasoning
-   `input_token_details.cache_read`—input tokens served from prompt cache

When streaming, aggregate token usage from the final chunk:

```
import { AIMessageChunk } from "@langchain/core/messages";
import { concat } from "@langchain/core/utils/stream";

const stream = await model.stream("Tell me a joke.");
let finalMsg: AIMessageChunk | undefined;
for await (const chunk of stream) {
  finalMsg = finalMsg ? concat(finalMsg, chunk) : chunk;
}
console.log(finalMsg?.usage_metadata);
```

---

## Provider routing

Many models on OpenRouter are served by multiple providers. The `provider` parameter gives you control over which providers handle your requests and how they’re selected.

### Order and filter providers

Use `order` to set a preferred provider sequence. OpenRouter tries each provider in order and falls back to the next if one is unavailable:

```
const model = new ChatOpenRouter({
  model: "anthropic/claude-sonnet-4.5",
  provider: {
    order: ["Anthropic", "Google"],
    allow_fallbacks: true,
  },
});
```

To restrict requests to specific providers only, use `only`. To exclude certain providers, use `ignore`:

```
const onlyModel = new ChatOpenRouter({
  model: "openai/gpt-4o",
  provider: { only: ["OpenAI", "Azure"] },
});

const ignoreModel = new ChatOpenRouter({
  model: "meta-llama/llama-4-maverick",
  provider: { ignore: ["DeepInfra"] },
});
```

### Sort by cost, speed, or latency

By default, OpenRouter load-balances across providers with a preference for lower cost. Use `sort` to change the priority:

```
const fastModel = new ChatOpenRouter({
  model: "openai/gpt-4o",
  provider: { sort: "throughput" },
});

const lowLatencyModel = new ChatOpenRouter({
  model: "openai/gpt-4o",
  provider: { sort: "latency" },
});
```

### Data collection policy

If your use case requires that providers do not store or train on your data, set `data_collection` to `"deny"`:

```
const model = new ChatOpenRouter({
  model: "anthropic/claude-sonnet-4.5",
  provider: { data_collection: "deny" },
});
```

### Filter by quantization

For open-weight models, you can restrict routing to specific precision levels:

```
const model = new ChatOpenRouter({
  model: "meta-llama/llama-4-maverick",
  provider: { quantizations: ["fp16", "bf16"] },
});
```

### Combine options

Provider options can be composed together:

```
const model = new ChatOpenRouter({
  model: "openai/gpt-4o",
  provider: {
    order: ["OpenAI", "Azure"],
    allow_fallbacks: false,
    require_parameters: true,
    data_collection: "deny",
  },
});
```

See the [OpenRouter provider routing docs](https://openrouter.ai/docs/guides/routing/provider-selection) for the full list of options.

---

## Multi-model routing

OpenRouter supports routing requests across multiple models. Pass a `models` array and an optional `route` strategy:

```
const model = new ChatOpenRouter({
  model: "openai/gpt-4o",
  models: ["openai/gpt-4o", "anthropic/claude-sonnet-4.5"],
  route: "fallback",
});
```

---

## Plugins

OpenRouter supports [plugins](https://openrouter.ai/docs/features/plugins) that extend model capabilities. Pass plugin configurations via the `plugins` parameter:

```
const model = new ChatOpenRouter({
  model: "openai/gpt-4o",
  plugins: [
    { id: "web", max_results: 5 },
  ],
});
```

Available plugins include `web` (web search), `file-parser` (PDF parsing), `moderation`, `auto-router`, and `response-healing`.

---

## App attribution

OpenRouter supports app attribution via HTTP headers. Set these through constructor params:

```
const model = new ChatOpenRouter({
  model: "anthropic/claude-sonnet-4.5",
  siteUrl: "https://myapp.com",
  siteName: "My App",
});
```

---

## API reference

For detailed documentation of all `ChatOpenRouter` features and configurations, head to the [ChatOpenRouter API reference](https://reference.langchain.com/javascript/langchain-openrouter/ChatOpenRouter). For more information about OpenRouter’s platform, models, and features, see the [OpenRouter documentation](https://openrouter.ai/docs).

---
