---
title: "OpenAI integrations - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/integrations/providers/openai"
crawled_at: "2026-06-17T14:51:17.421Z"
---

-   [Installation and setup](#installation-and-setup)
-   [Chat model](#chat-model)
-   [LLM](#llm)
-   [Text embedding model](#text-embedding-model)
-   [Chain](#chain)
-   [Middleware](#middleware)
    -   [Content moderation](#content-moderation)

LangChain integrates with OpenAI and Azure OpenAI through the `@langchain/openai` package.

> [OpenAI](https://en.wikipedia.org/wiki/OpenAI) is American artificial intelligence (AI) research laboratory consisting of the non-profit `OpenAI Incorporated` and its for-profit subsidiary corporation `OpenAI Limited Partnership`. OpenAI conducts AI research with the declared intention of promoting and developing a friendly AI. OpenAI systems run on an `Azure`\-based supercomputing platform from `Microsoft`.

> The [OpenAI API](https://platform.openai.com/docs/models) is powered by a diverse set of models with different capabilities and price points. [ChatGPT](https://chat.openai.com/) is the Artificial Intelligence (AI) chatbot developed by `OpenAI`.

## Installation and setup

-   Get an OpenAI api key and set it as an environment variable (`OPENAI_API_KEY`)

## Chat model

See a [usage example](https://docs.langchain.com/oss/javascript/integrations/chat/openai).

```
import { ChatOpenAI } from "@langchain/openai";
```

## LLM

See a [usage example](https://docs.langchain.com/oss/javascript/integrations/llms/openai).

npm

```
npm install @langchain/openai @langchain/core
```

```
import { OpenAI } from "@langchain/openai";
```

## Text embedding model

See a [usage example](https://docs.langchain.com/oss/javascript/integrations/embeddings/openai)

```
import { OpenAIEmbeddings } from "@langchain/openai";
```

## Chain

```
import { OpenAIModerationChain } from "@langchain/classic/chains";
```

## Middleware

Middleware specifically designed for OpenAI models. Learn more about [middleware](https://docs.langchain.com/oss/javascript/langchain/middleware/overview).

| Middleware | Description |
| --- | --- |
| [Content moderation](#content-moderation) | Moderate agent traffic using OpenAI’s moderation endpoint |

### Content moderation

Moderate agent traffic (user input, model output, and tool results) using OpenAI’s moderation endpoint to detect and handle unsafe content. Content moderation is useful for the following:

-   Applications requiring content safety and compliance
-   Filtering harmful, hateful, or inappropriate content
-   Customer-facing agents that need safety guardrails
-   Meeting platform moderation requirements

**API reference:** [`openAIModerationMiddleware`](https://reference.langchain.com/javascript/langchain/index/openAIModerationMiddleware)

```
import { createAgent, openAIModerationMiddleware } from "langchain";

const agent = createAgent({
  model: "openai:gpt-5.5",
  tools: [searchTool, databaseTool],
  middleware: [
    openAIModerationMiddleware({
      model: "openai:gpt-5.5",
      moderationModel: "omni-moderation-latest",
      checkInput: true,
      checkOutput: true,
      exitBehavior: "end",
    }),
  ],
});
```

Configuration options

model

string | BaseChatModel

required

OpenAI model to use for moderation. Can be either a model name string (e.g., `"openai:gpt-5.5"`) or a `BaseChatModel` instance. The middleware will use this model’s client to access the moderation endpoint.

moderationModel

ModerationModel

default:"omni-moderation-latest"

OpenAI moderation model to use. Options: `'omni-moderation-latest'`, `'omni-moderation-2024-09-26'`, `'text-moderation-latest'`, `'text-moderation-stable'`

checkInput

boolean

default:"true"

Whether to check user input messages before the model is called

checkOutput

boolean

default:"true"

Whether to check model output messages after the model is called

checkToolResults

boolean

default:"false"

Whether to check tool result messages before the model is called

exitBehavior

'error' | 'end' | 'replace'

default:"'end'"

How to handle violations when content is flagged. Options:

-   `'end'` - End agent execution immediately with a violation message
-   `'error'` - Throw `OpenAIModerationError` exception
-   `'replace'` - Replace the flagged content with the violation message and continue

violationMessage

string | undefined

Custom template for violation messages. Supports template variables:

-   `{categories}` - Comma-separated list of flagged categories
-   `{category_scores}` - JSON string of category scores
-   `{original_content}` - The original flagged content

Default: `"I'm sorry, but I can't comply with that request. It was flagged for {categories}."`

Full example

The middleware integrates OpenAI’s moderation endpoint to check content at different stages:**Moderation stages:**

-   `checkInput` - User messages before model call
-   `checkOutput` - AI messages after model call
-   `checkToolResults` - Tool outputs before model call

**Exit behaviors:**

-   `'end'` (default) - Stop execution with violation message
-   `'error'` - Throw exception for application handling
-   `'replace'` - Replace flagged content and continue

```
import { createAgent, openAIModerationMiddleware } from "langchain";

// Basic moderation
const agent = createAgent({
  model: "openai:gpt-5.5",
  tools: [searchTool, customerDataTool],
  middleware: [
    openAIModerationMiddleware({
      model: "openai:gpt-5.5",
      moderationModel: "omni-moderation-latest",
      checkInput: true,
      checkOutput: true,
    }),
  ],
});

// Strict moderation with custom message
const agentStrict = createAgent({
  model: "openai:gpt-5.5",
  tools: [searchTool, customerDataTool],
  middleware: [
    openAIModerationMiddleware({
      model: "openai:gpt-5.5",
      moderationModel: "omni-moderation-latest",
      checkInput: true,
      checkOutput: true,
      checkToolResults: true,
      exitBehavior: "error",
      violationMessage:
        "Content policy violation detected: {categories}. " +
        "Please rephrase your request.",
    }),
  ],
});

// Moderation with replacement behavior
const agentReplace = createAgent({
  model: "openai:gpt-5.5",
  tools: [searchTool],
  middleware: [
    openAIModerationMiddleware({
      model: "openai:gpt-5.5",
      checkInput: true,
      exitBehavior: "replace",
      violationMessage: "[Content removed due to safety policies]",
    }),
  ],
});
```

---

Was this page helpful?
