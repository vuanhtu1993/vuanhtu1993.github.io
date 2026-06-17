---
title: "ChatMistralAI integration - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/integrations/chat/mistral"
crawled_at: "2026-06-17T14:50:41.434Z"
---

[Mistral AI](https://mistral.ai/) is a platform that offers hosting for their powerful [open source models](https://docs.mistral.ai/getting-started/models/). This will help you getting started with Mistral [chat models](https://docs.langchain.com/oss/javascript/langchain/models). For detailed documentation of all `ChatMistralAI` features and configurations head to the [API reference](https://reference.langchain.com/javascript/langchain-mistralai/ChatMistralAI).

## Overview

### Integration details

| Class | Package | Serializable | [PY support](https://python.langchain.com/docs/integrations/chat/mistralai) | Downloads | Version |
| --- | --- | --- | --- | --- | --- |
| [`ChatMistralAI`](https://reference.langchain.com/javascript/langchain-mistralai/ChatMistralAI) | [`@langchain/mistralai`](https://www.npmjs.com/package/@langchain/mistralai) | ❌ | ✅ | ![NPM - Downloads](https://res.cloudinary.com/dv3vzmogk/image/upload/v1781707842/aha-mind/docs-crawler/docs.langchain.com/mistralai_acwcyj.svg) | ![NPM - Version](https://res.cloudinary.com/dv3vzmogk/image/upload/v1781707842/aha-mind/docs-crawler/docs.langchain.com/mistralai_t32opi.svg) |

### Model features

See the links in the table headers below for guides on how to use specific features.

| [Tool calling](https://docs.langchain.com/oss/javascript/langchain/tools) | [Structured output](https://docs.langchain.com/oss/javascript/langchain/structured-output) | [Image input](https://docs.langchain.com/oss/javascript/langchain/messages#multimodal) | Audio input | Video input | [Token-level streaming](https://docs.langchain.com/oss/javascript/langchain/streaming) | [Token usage](https://docs.langchain.com/oss/javascript/langchain/models#token-usage) | [Logprobs](https://docs.langchain.com/oss/javascript/langchain/models#log-probabilities) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |

## Setup

To access Mistral AI models you’ll need to create a Mistral AI account, get an API key, and install the `@langchain/mistralai` integration package.

### Credentials

Visit the [Mistral console](https://console.mistral.ai/) to sign up and generate an API key. Once you’ve done this set the `MISTRAL_API_KEY` environment variable:

```
export MISTRAL_API_KEY="your-api-key"
```

If you want to get automated tracing of your model calls you can also set your [LangSmith](https://docs.langchain.com/langsmith/observability) API key by uncommenting below:

```
# export LANGSMITH_TRACING="true"
# export LANGSMITH_API_KEY="your-api-key"
```

### Installation

The LangChain ChatMistralAI integration lives in the `@langchain/mistralai` package:

## Instantiation

Now we can instantiate our model object and generate chat completions:

```
import { ChatMistralAI } from "@langchain/mistralai"

const llm = new ChatMistralAI({
    model: "mistral-large-latest",
    temperature: 0,
    maxRetries: 2,
    // other params...
})
```

## Invocation

When sending chat messages to mistral, there are a few requirements to follow:

-   The first message can **not** be an assistant (ai) message.
-   Messages **must** alternate between user and assistant (ai) messages.
-   Messages can **not** end with an assistant (ai) or system message.

```
const aiMsg = await llm.invoke([
    [
        "system",
        "You are a helpful assistant that translates English to French. Translate the user sentence.",
    ],
    ["human", "I love programming."],
])
aiMsg
```

```
AIMessage {
  "content": "J'adore la programmation.",
  "additional_kwargs": {},
  "response_metadata": {
    "tokenUsage": {
      "completionTokens": 9,
      "promptTokens": 27,
      "totalTokens": 36
    },
    "finish_reason": "stop"
  },
  "tool_calls": [],
  "invalid_tool_calls": [],
  "usage_metadata": {
    "input_tokens": 27,
    "output_tokens": 9,
    "total_tokens": 36
  }
}
```

```
console.log(aiMsg.content)
```

```
J'adore la programmation.
```

## Tool calling

Mistral’s API supports [tool calling](https://docs.langchain.com/oss/javascript/langchain/tools) for a subset of their models. You can see which models support tool calling [on this page](https://docs.mistral.ai/capabilities/function_calling/). The examples below demonstrates how to use it:

```
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import * as z from "zod";
import { tool } from "@langchain/core/tools";

const calculatorSchema = z.object({
  operation: z
    .enum(["add", "subtract", "multiply", "divide"])
    .describe("The type of operation to execute."),
  number1: z.number().describe("The first number to operate on."),
  number2: z.number().describe("The second number to operate on."),
});

const calculatorTool = tool((input) => {
  return JSON.stringify(input);
}, {
  name: "calculator",
  description: "A simple calculator tool",
  schema: calculatorSchema,
});

// Bind the tool to the model
const modelWithTool = new ChatMistralAI({
  model: "mistral-large-latest",
}).bindTools([calculatorTool]);

const calcToolPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are a helpful assistant who always needs to use a calculator.",
  ],
  ["human", "{input}"],
]);

// Chain your prompt, model, and output parser together
const chainWithCalcTool = calcToolPrompt.pipe(modelWithTool);

const calcToolRes = await chainWithCalcTool.invoke({
  input: "What is 2 + 2?",
});
console.log(calcToolRes.tool_calls);
```

```
[
  {
    name: 'calculator',
    args: { operation: 'add', number1: 2, number2: 2 },
    type: 'tool_call',
    id: 'DD9diCL1W'
  }
]
```

## Hooks

Mistral AI supports custom hooks for three events: beforeRequest, requestError, and response. Examples of the function signature for each hook type can be seen below:

```
const beforeRequestHook = (req: Request): Request | void | Promise<Request | void> => {
    // Code to run before a request is processed by Mistral
};

const requestErrorHook = (err: unknown, req: Request): void | Promise<void> => {
    // Code to run when an error occurs as Mistral is processing a request
};

const responseHook = (res: Response, req: Request): void | Promise<void> => {
    // Code to run before Mistral sends a successful response
};
```

To add these hooks to the chat model, either pass them as arguments and they are automatically added:

```
import { ChatMistralAI } from "@langchain/mistralai"

const modelWithHooks = new ChatMistralAI({
    model: "mistral-large-latest",
    temperature: 0,
    maxRetries: 2,
    beforeRequestHooks: [ beforeRequestHook ],
    requestErrorHooks: [ requestErrorHook ],
    responseHooks: [ responseHook ],
    // other params...
});
```

Or assign and add them manually after instantiation:

```
import { ChatMistralAI } from "@langchain/mistralai"

const model = new ChatMistralAI({
    model: "mistral-large-latest",
    temperature: 0,
    maxRetries: 2,
    // other params...
});

model.beforeRequestHooks = [ ...model.beforeRequestHooks, beforeRequestHook ];
model.requestErrorHooks = [ ...model.requestErrorHooks, requestErrorHook ];
model.responseHooks = [ ...model.responseHooks, responseHook ];

model.addAllHooksToHttpClient();
```

The method addAllHooksToHttpClient clears all currently added hooks before assigning the entire updated hook lists to avoid hook duplication. Hooks can be removed one at a time, or all hooks can be cleared from the model at once.

```
model.removeHookFromHttpClient(beforeRequestHook);

model.removeAllHooksFromHttpClient();
```

---

## API reference

For detailed documentation of all `ChatMistralAI` features and configurations head to the [API reference](https://reference.langchain.com/javascript/langchain-mistralai/ChatMistralAI).

---
