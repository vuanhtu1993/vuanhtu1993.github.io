---
title: "ChatTogetherAI integration - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/integrations/chat/togetherai"
crawled_at: "2026-06-17T14:52:25.422Z"
---

[Together AI](https://www.together.ai/) offers an API to query [50+ leading open-source models](https://docs.together.ai/docs/inference-models) in a couple lines of code. This guide will help you getting started with `ChatTogetherAI` [chat models](https://docs.langchain.com/oss/javascript/langchain/models). For detailed documentation of all `ChatTogetherAI` features and configurations head to the [API reference](https://reference.langchain.com/javascript/langchain-together-ai/ChatTogetherAI).

## Overview

### Integration details

| Class | Package | Serializable | [PY support](https://python.langchain.com/docs/integrations/chat/togetherai) | Downloads | Version |
| --- | --- | --- | --- | --- | --- |
| [`ChatTogetherAI`](https://reference.langchain.com/javascript/langchain-together-ai/ChatTogetherAI) | [`@langchain/together-ai`](https://www.npmjs.com/package/@langchain/together-ai) | ✅ | ✅ | ![NPM - Downloads](https://res.cloudinary.com/dv3vzmogk/image/upload/v1781707946/aha-mind/docs-crawler/docs.langchain.com/together-ai_ttlqvd.svg) | ![NPM - Version](https://res.cloudinary.com/dv3vzmogk/image/upload/v1781707946/aha-mind/docs-crawler/docs.langchain.com/together-ai_npg5rk.svg) |

### Model features

See the links in the table headers below for guides on how to use specific features.

| [Tool calling](https://docs.langchain.com/oss/javascript/langchain/tools) | [Structured output](https://docs.langchain.com/oss/javascript/langchain/structured-output) | [Image input](https://docs.langchain.com/oss/javascript/langchain/messages#multimodal) | Audio input | Video input | [Token-level streaming](https://docs.langchain.com/oss/javascript/langchain/streaming) | [Token usage](https://docs.langchain.com/oss/javascript/langchain/models#token-usage) | [Logprobs](https://docs.langchain.com/oss/javascript/langchain/models#log-probabilities) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## Setup

To access `ChatTogetherAI` models, create a Together account, [get an API key](https://api.together.xyz/), and install the `@langchain/together-ai` integration package.

### Credentials

Head to [api.together.ai](https://api.together.ai/) to sign up to Together AI and generate an API key. Set the `TOGETHER_AI_API_KEY` environment variable:

```
export TOGETHER_AI_API_KEY="your-api-key"
```

If you want to get automated tracing of your model calls you can also set your [LangSmith](https://docs.langchain.com/langsmith/observability) API key by uncommenting below:

```
# export LANGSMITH_TRACING="true"
# export LANGSMITH_API_KEY="your-api-key"
```

### Installation

The LangChain ChatTogetherAI integration lives in the `@langchain/together-ai` package:

## Instantiation

Now we can instantiate our model object and generate chat completions:

```
import { ChatTogetherAI } from "@langchain/together-ai";

const llm = new ChatTogetherAI({
    model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
    temperature: 0,
    // other params...
})
```

## Invocation

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
  "id": "chatcmpl-9rT9qEDPZ6iLCk6jt3XTzVDDH6pcI",
  "content": "J'adore la programmation.",
  "additional_kwargs": {},
  "response_metadata": {
    "tokenUsage": {
      "completionTokens": 8,
      "promptTokens": 31,
      "totalTokens": 39
    },
    "finish_reason": "stop"
  },
  "tool_calls": [],
  "invalid_tool_calls": [],
  "usage_metadata": {
    "input_tokens": 31,
    "output_tokens": 8,
    "total_tokens": 39
  }
}
```

```
console.log(aiMsg.content)
```

```
J'adore la programmation.
```

---

## API reference

For detailed documentation of all `ChatTogetherAI` features and configurations head to the [API reference](https://reference.langchain.com/javascript/langchain-together-ai/ChatTogetherAI).

---
