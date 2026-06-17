---
title: "LangChain v1 migration guide - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/migrate/langchain-v1"
crawled_at: "2026-06-17T14:55:56.539Z"
---

This migration guide outlines the major changes in LangChain v1. To learn more about the new features of v1, see the [introductory post](https://docs.langchain.com/oss/javascript/releases/langchain-v1). To upgrade,

## `createAgent`

In v1, the react agent prebuilt is now in the langchain package. The table below outlines what functionality has changed:

| Section | What changed |
| --- | --- |
| [Import path](#import-path) | Package moved from `@langchain/langgraph/prebuilts` to `langchain` |
| [Prompts](#prompts) | Parameter renamed to `systemPrompt`, dynamic prompts use middleware |
| [Pre-model hook](#pre-model-hook) | Replaced by middleware with `beforeModel` method |
| [Post-model hook](#post-model-hook) | Replaced by middleware with `afterModel` method |
| [Custom state](#custom-state) | Defined in middleware, zod objects only |
| [Model](#model) | Dynamic selection via middleware, pre-bound models not supported |
| [Tools](#tools) | Tool error handling moved to middleware with `wrapToolCall` |
| [Structured output](#structured-output) | prompted output removed, use `toolStrategy`/`providerStrategy` |
| [Streaming node name](#streaming-node-name-rename) | Node name changed from `"agent"` to `"model"` |
| [Runtime context](#runtime-context) | `context` property instead of `config.configurable` |
| [Namespace](#simplified-package) | Streamlined to focus on agent building blocks, legacy code moved to `@langchain/classic` |

### Import path

The import path for the react agent prebuilt has changed from `@langchain/langgraph/prebuilts` to `langchain`. The name of the function has changed from `createReactAgent` to `createAgent`:

```
import { createReactAgent } from "@langchain/langgraph/prebuilts";
import { createAgent } from "langchain";
```

### Prompts

#### Static prompt rename

The `prompt` parameter has been renamed to `systemPrompt`:

#### `SystemMessage`

If using `SystemMessage` objects in the system prompt, the string content is now used directly:

#### Dynamic prompts

Dynamic prompts are a core context engineering pattern—they adapt what you tell the model based on the current conversation state. To do this, use `dynamicSystemPromptMiddleware`:

### Pre-model hook

Pre-model hooks are now implemented as middleware with the `beforeModel` method. This pattern is more extensible—you can define multiple middlewares to run before the model is called and reuse them across agents. Common use cases include:

-   Summarizing conversation history
-   Trimming messages
-   Input guardrails, like PII redaction

v1 includes built-in summarization middleware:

### Post-model hook

Post-model hooks are now implemented as middleware with the `afterModel` method. This lets you compose multiple handlers after the model responds. Common use cases include:

-   Human-in-the-loop approval
-   Output guardrails

v1 includes a built-in human-in-the-loop middleware:

### Custom state

Custom state is now defined in middleware using the `stateSchema` property. Use Zod to declare additional state fields that are carried through the agent run.

### Model

Dynamic model selection now happens via middleware. Use `wrapModelCall` to swap models (and tools) based on state or runtime context. In `createReactAgent`, this was done via a function passed to the `model` parameter. This functionality has been ported to the middleware interface in v1.

#### Dynamic model selection

#### Pre-bound models

To better support structured output, `createAgent` should receive a plain model (string or instance) and a separate `tools` list. Avoid passing models pre-bound with tools when using structured output.

```
// No longer supported
// const modelWithTools = new ChatOpenAI({ model: "gpt-5.4-mini" }).bindTools([someTool]);
// const agent = createAgent({ model: modelWithTools, tools: [] });

// Use instead
const agent = createAgent({ model: "gpt-5.4-mini", tools: [someTool] });
```

### Tools

The `tools` argument to `createAgent` accepts:

-   Functions created with `tool`
-   LangChain tool instances
-   Objects that represent built-in provider tools

#### Handling tool errors

You can now configure the handling of tool errors with middleware implementing the `wrapToolCall` method.

### Structured output

#### Node changes

Structured output used to be generated in a separate node from the main agent. This is no longer the case. Structured output is generated in the main loop (no extra LLM call), reducing cost and latency.

#### Tool and provider strategies

In v1, there are two strategies:

-   `toolStrategy` uses artificial tool calling to generate structured output
-   `providerStrategy` uses provider-native structured output generation

#### Prompted output removed

Prompted output via custom instructions in `responseFormat` is removed in favor of the above strategies.

### Streaming node name rename

When streaming events from agents, the node name was changed from `"agent"` to `"model"` to better reflect the node’s purpose.

### Runtime context

When invoking an agent, pass static, read-only configuration via the `context` config argument. This replaces patterns that used `config.configurable`.

---

## Standard content

In v1, messages gain provider-agnostic standard content blocks. Access them via `message.contentBlocks` for a consistent, typed view across providers. The existing `message.content` field remains unchanged for strings or provider-native structures.

### What changed

-   New `contentBlocks` property on messages for normalized content.
-   New TypeScript types under `ContentBlock` for strong typing.
-   Optional serialization of standard blocks into `content` via `LC_OUTPUT_VERSION=v1` or `outputVersion: "v1"`.

### Read standardized content

### Create multimodal messages

### Example block types

```
import { ContentBlock } from "langchain";

const textBlock: ContentBlock.Text = {
  type: "text",
  text: "Hello world",
};

const imageBlock: ContentBlock.Multimodal.Image = {
  type: "image",
  url: "https://example.com/image.png",
  mimeType: "image/png",
};
```

See the content blocks [reference](https://docs.langchain.com/oss/javascript/langchain/messages#content-block-reference) for more details.

### Serialize standard content

Standard content blocks are **not serialized** into the `content` attribute by default. If you need to access standard content blocks in the `content` attribute (e.g., when sending messages to a client), you can opt-in to serializing them into `content`.

---

## Simplified package

The `langchain` package namespace is streamlined to focus on agent building blocks. Legacy functionality has moved to `@langchain/classic`. The new package exposes only the most useful and relevant functionality.

### Exports

The v1 package includes:

| Module | What’s available | Notes |
| --- | --- | --- |
| Agents | `createAgent`, `AgentState` | Core agent creation functionality |
| Messages | Message types, content blocks, `trimMessages` | Re-exported from `@langchain/core` |
| Tools | `tool`, tool classes | Re-exported from `@langchain/core` |
| Chat models | `initChatModel`, `BaseChatModel` | Unified model initialization |

### `@langchain/classic`

If you use legacy chains, the indexing API, or functionality previously re-exported from `@langchain/community`, install `@langchain/classic` and update imports:

```
// v1 (new)
import { ... } from "@langchain/classic";
import { ... } from "@langchain/classic/chains";

// v0 (old)
import { ... } from "langchain";
import { ... } from "langchain/chains";
```

---

## Breaking changes

### Dropped Node 18 support

All LangChain packages now require **Node.js 20 or higher**. Node.js 18 reached [end of life](https://nodejs.org/en/about/releases/) in March 2025.

### New build outputs

Builds for all langchain packages now use a bundler based approach instead of using raw typescript outputs. If you were importing files from the `dist/` directory (which is not recommended), you will need to update your imports to use the new module system.

### Legacy code moved to `@langchain/classic`

Legacy functionality outside the focus of standard interfaces and agents has been moved to the [`@langchain/classic`](https://www.npmjs.com/package/@langchain/classic) package. See the [Simplified package](#simplified-package) section for details on what’s available in the core `langchain` package and what moved to `@langchain/classic`.

### Removal of deprecated APIs

Methods, functions, and other objects that were already deprecated and slated for removal in 1.0 have been deleted.

View removed deprecated APIs

The following deprecated APIs have been removed in v1:

#### Core functionality

-   `TraceGroup` - Use LangSmith tracing instead
-   `BaseDocumentLoader.loadAndSplit` - Use `.load()` followed by a text splitter
-   `RemoteRunnable` - No longer supported

#### Prompts

-   `BasePromptTemplate.serialize` and `.deserialize` - Use JSON serialization directly
-   `ChatPromptTemplate.fromPromptMessages` - Use `ChatPromptTemplate.fromMessages`

#### Retrievers

-   `BaseRetrieverInterface.getRelevantDocuments` - Use `.invoke()` instead

#### Runnables

-   `Runnable.bind` - Use `.bindTools()` or other specific binding methods
-   `Runnable.map` - Use `.batch()` instead
-   `RunnableBatchOptions.maxConcurrency` - Use `maxConcurrency` in the config object

#### Chat models

-   `BaseChatModel.predictMessages` - Use `.invoke()` instead
-   `BaseChatModel.predict` - Use `.invoke()` instead
-   `BaseChatModel.serialize` - Use JSON serialization directly
-   `BaseChatModel.callPrompt` - Use `.invoke()` instead
-   `BaseChatModel.call` - Use `.invoke()` instead

#### LLMs

-   `BaseLLMParams.concurrency` - Use `maxConcurrency` in the config object
-   `BaseLLM.call` - Use `.invoke()` instead
-   `BaseLLM.predict` - Use `.invoke()` instead
-   `BaseLLM.predictMessages` - Use `.invoke()` instead
-   `BaseLLM.serialize` - Use JSON serialization directly

#### Streaming

-   `createChatMessageChunkEncoderStream` - Use `.stream()` method directly

#### Tracing

-   `BaseTracer.runMap` - Use LangSmith tracing APIs
-   `getTracingCallbackHandler` - Use LangSmith tracing
-   `getTracingV2CallbackHandler` - Use LangSmith tracing
-   `LangChainTracerV1` - Use LangSmith tracing

#### Memory and storage

-   `BaseListChatMessageHistory.addAIChatMessage` - Use `.addMessage()` with `AIMessage`
-   `BaseStoreInterface` - Use specific store implementations

#### Utilities

-   `getRuntimeEnvironmentSync` - Use async `getRuntimeEnvironment()`

---
