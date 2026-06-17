---
title: "Anthropic integrations - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/integrations/providers/anthropic"
crawled_at: "2026-06-17T14:50:00.318Z"
---

All functionality related to Anthropic models. [Anthropic](https://www.anthropic.com/) is an AI safety and research company, and is the creator of Claude. This page covers all integrations between Anthropic models and LangChain.

## Prompting best practices

Anthropic models have several prompting best practices compared to OpenAI models. **System Messages may only be the first message** Anthropic models require any system messages to be the first one in your prompts.

## `ChatAnthropic`

`ChatAnthropic` is a subclass of LangChain’s `ChatModel`, meaning it works best with `ChatPromptTemplate`. You can import this wrapper with the following code:

npm

```
npm install @langchain/anthropic @langchain/core
```

```
import { ChatAnthropic } from "@langchain/anthropic";
const model = new ChatAnthropic({});
```

When working with ChatModels, it is preferred that you design your prompts as `ChatPromptTemplate`s. Here is an example below of doing that:

```
import { ChatPromptTemplate } from "@langchain/classic/prompts";

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful chatbot"],
  ["human", "Tell me a joke about {topic}"],
]);
```

You can then use this in a chain as follows:

```
const chain = prompt.pipe(model);
await chain.invoke({ topic: "bears" });
```

See the [chat model integration page](https://docs.langchain.com/oss/javascript/integrations/chat/anthropic) for more examples, including multimodal inputs.

---
