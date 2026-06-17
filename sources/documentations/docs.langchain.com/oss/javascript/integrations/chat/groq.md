---
title: "ChatGroq integration - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/integrations/chat/groq"
crawled_at: "2026-06-17T14:50:34.851Z"
---

[Groq](https://groq.com/) offers fast AI inference powered by LPU™ AI inference technology. For a list of available models, see the [Groq model documentation](https://console.groq.com/docs/models). This page helps you get started with Groq [chat models](https://docs.langchain.com/oss/javascript/langchain/models). For detailed documentation of all `ChatGroq` features and configurations, see the [API reference](https://reference.langchain.com/javascript/langchain-groq/ChatGroq).

## Overview

### Integration details

| Class | Package | Serializable | [PY support](https://python.langchain.com/docs/integrations/chat/groq) | Downloads | Version |
| --- | --- | --- | --- | --- | --- |
| [`ChatGroq`](https://reference.langchain.com/javascript/langchain-groq/ChatGroq) | [`@langchain/groq`](https://www.npmjs.com/package/@langchain/groq) | ❌ | ✅ | ![NPM - Downloads](https://res.cloudinary.com/dv3vzmogk/image/upload/v1781707835/aha-mind/docs-crawler/docs.langchain.com/groq_g1lo8s.svg) | ![NPM - Version](https://res.cloudinary.com/dv3vzmogk/image/upload/v1781707835/aha-mind/docs-crawler/docs.langchain.com/groq_wdlyqb.svg) |

### Model features

See the links in the table headers below for guides on how to use specific features.

| [Tool calling](https://docs.langchain.com/oss/javascript/langchain/tools) | [Structured output](https://docs.langchain.com/oss/javascript/langchain/structured-output) | [Image input](https://docs.langchain.com/oss/javascript/langchain/messages#multimodal) | Audio input | Video input | [Token-level streaming](https://docs.langchain.com/oss/javascript/langchain/streaming) | [Token usage](https://docs.langchain.com/oss/javascript/langchain/models#token-usage) | [Logprobs](https://docs.langchain.com/oss/javascript/langchain/models#log-probabilities) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |

## Setup

To access ChatGroq models you’ll need to create a Groq account, get an API key, and install the `@langchain/groq` integration package.

### Credentials

To use the Groq API, create an API key in the [Groq console](https://console.groq.com/keys). Then, you can set the API key as an environment variable in your terminal:

```
export GROQ_API_KEY="your-api-key"
```

If you want to get automated tracing of your model calls you can also set your [LangSmith](https://docs.langchain.com/langsmith/observability) API key by uncommenting below:

```
# export LANGSMITH_TRACING="true"
# export LANGSMITH_API_KEY="your-api-key"
```

### Installation

The LangChain ChatGroq integration lives in the `@langchain/groq` package:

## Instantiation

Now we can instantiate our model object and generate chat completions:

```
import { ChatGroq } from "@langchain/groq"

const llm = new ChatGroq({
    model: "llama-3.3-70b-versatile",
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
  "content": "I enjoy programming. (The French translation is: \"J'aime programmer.\")\n\nNote: I chose to translate \"I love programming\" as \"J'aime programmer\" instead of \"Je suis amoureux de programmer\" because the latter has a romantic connotation that is not present in the original English sentence.",
  "additional_kwargs": {},
  "response_metadata": {
    "tokenUsage": {
      "completionTokens": 73,
      "promptTokens": 31,
      "totalTokens": 104
    },
    "finish_reason": "stop"
  },
  "tool_calls": [],
  "invalid_tool_calls": []
}
```

```
console.log(aiMsg.content)
```

```
I enjoy programming. (The French translation is: "J'aime programmer.")

Note: I chose to translate "I love programming" as "J'aime programmer" instead of "Je suis amoureux de programmer" because the latter has a romantic connotation that is not present in the original English sentence.
```

## Invoke with JSON output

```
const messages = [
  {
    role: "system",
    content: "You are a math tutor that handles math exercises and makes output in json in format { result: number }.",
  },
  { role: "user",  content: "2 + 2 * 2" },
];

const aiInvokeMsg = await llm.invoke(messages, { response_format: { type: "json_object" } });

// if you want not to pass response_format in every invoke, you can bind it to the instance
const llmWithResponseFormat = llm.bind({ response_format: { type: "json_object" } });
const aiBindMsg = await llmWithResponseFormat.invoke(messages);

// they are the same
console.log({ aiInvokeMsgContent: aiInvokeMsg.content, aiBindMsg: aiBindMsg.content });
```

```
{
  aiInvokeMsgContent: '{\n"result": 6\n}',
  aiBindMsg: '{\n"result": 6\n}'
}
```

---

## API reference

For detailed documentation of all `ChatGroq` features and configurations head to the [API reference](https://reference.langchain.com/javascript/langchain-groq/ChatGroq).

---
