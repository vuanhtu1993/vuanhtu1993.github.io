---
title: "ChatCerebras integration - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/integrations/chat/cerebras"
crawled_at: "2026-06-17T14:50:12.580Z"
---

[Cerebras](https://cerebras.ai/) is a model provider that serves open source models with an emphasis on speed. The Cerebras CS-3 system, powered by the Wafer-Scale Engine-3 (WSE-3), represents a new class of AI supercomputer that sets the standard for generative AI training and inference with unparalleled performance and scalability. With Cerebras as your inference provider, you can:

-   Achieve unprecedented speed for AI inference workloads
-   Build commercially with high throughput
-   Effortlessly scale your AI workloads with our seamless clustering technology

Our CS-3 systems can be quickly and easily clustered to create the largest AI supercomputers in the world, making it simple to place and run the largest models. Leading corporations, research institutions, and governments are already using Cerebras solutions to develop proprietary models and train popular open-source models. This will help you getting started with `ChatCerebras` [chat models](https://docs.langchain.com/oss/javascript/langchain/models). For detailed documentation of all `ChatCerebras` features and configurations head to the [API reference](https://reference.langchain.com/javascript/langchain-cerebras/ChatCerebras).

## Overview

### Integration details

| Class | Package | Serializable | [PY support](https://python.langchain.com/docs/integrations/chat/cerebras) | Downloads | Version |
| --- | --- | --- | --- | --- | --- |
| [`ChatCerebras`](https://reference.langchain.com/javascript/langchain-cerebras/ChatCerebras) | [`@langchain/cerebras`](https://www.npmjs.com/package/@langchain/cerebras) | ❌ | ✅ | ![NPM - Downloads](https://res.cloudinary.com/dv3vzmogk/image/upload/v1781707813/aha-mind/docs-crawler/docs.langchain.com/cerebras_e3qtzy.svg) | ![NPM - Version](https://res.cloudinary.com/dv3vzmogk/image/upload/v1781707813/aha-mind/docs-crawler/docs.langchain.com/cerebras_ycsolq.svg) |

### Model features

See the links in the table headers below for guides on how to use specific features.

| [Tool calling](https://docs.langchain.com/oss/javascript/langchain/tools) | [Structured output](https://docs.langchain.com/oss/javascript/langchain/structured-output) | [Image input](https://docs.langchain.com/oss/javascript/langchain/messages#multimodal) | Audio input | Video input | [Token-level streaming](https://docs.langchain.com/oss/javascript/langchain/streaming) | [Token usage](https://docs.langchain.com/oss/javascript/langchain/models#token-usage) | [Logprobs](https://docs.langchain.com/oss/javascript/langchain/models#log-probabilities) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |

## Setup

To access ChatCerebras models you’ll need to create a Cerebras account, get an API key, and install the `@langchain/cerebras` integration package.

### Credentials

Get an API Key from [cloud.cerebras.ai](https://cloud.cerebras.ai/) and add it to your environment variables:

```
export CEREBRAS_API_KEY="your-api-key"
```

If you want to get automated tracing of your model calls you can also set your [LangSmith](https://docs.langchain.com/langsmith/observability) API key by uncommenting below:

```
# export LANGSMITH_TRACING="true"
# export LANGSMITH_API_KEY="your-api-key"
```

### Installation

The LangChain ChatCerebras integration lives in the `@langchain/cerebras` package:

## Instantiation

Now we can instantiate our model object and generate chat completions:

```
import { ChatCerebras } from "@langchain/cerebras"

const llm = new ChatCerebras({
    model: "llama-3.3-70b",
    temperature: 0,
    maxTokens: undefined,
    maxRetries: 2,
    // other params...
})
```

## Invocation

```
const aiMsg = await llm.invoke([
    {
      role: "system",
      content: "You are a helpful assistant that translates English to French. Translate the user sentence.",
    },
    { role: "user", content: "I love programming." },
])
aiMsg
```

```
AIMessage {
  "id": "run-17c7d62d-67ac-4677-b33a-18298fc85e35",
  "content": "J'adore la programmation.",
  "additional_kwargs": {},
  "response_metadata": {
    "id": "chatcmpl-2d1e2de5-4239-46fb-af2a-6200d89d7dde",
    "created": 1735785598,
    "model": "llama-3.3-70b",
    "system_fingerprint": "fp_2e2a2a083c",
    "object": "chat.completion",
    "time_info": {
      "queue_time": 0.00009063,
      "prompt_time": 0.002163031,
      "completion_time": 0.012339628,
      "total_time": 0.01640915870666504,
      "created": 1735785598
    }
  },
  "tool_calls": [],
  "invalid_tool_calls": [],
  "usage_metadata": {
    "input_tokens": 55,
    "output_tokens": 9,
    "total_tokens": 64
  }
}
```

```
console.log(aiMsg.content)
```

```
J'adore la programmation.
```

## Json invocation

```
const messages = [
  {
    role: "system",
    content: "You are a math tutor that handles math exercises and makes output in json in format { result: number }.",
  },
  { role: "user",  content: "2 + 2" },
];

const aiInvokeMsg = await llm.invoke(messages, { response_format: { type: "json_object" } });

// if you want not to pass response_format in every invoke, you can bind it to the instance
const llmWithResponseFormat = llm.bind({ response_format: { type: "json_object" } });
const aiBindMsg = await llmWithResponseFormat.invoke(messages);

// they are the same
console.log({ aiInvokeMsgContent: aiInvokeMsg.content, aiBindMsg: aiBindMsg.content });
```

```
{ aiInvokeMsgContent: '{"result":4}', aiBindMsg: '{"result":4}' }
```

---

## API reference

For detailed documentation of all `ChatCerebras` features and configurations head to the [API reference](https://reference.langchain.com/javascript/langchain-cerebras/ChatCerebras).

---
