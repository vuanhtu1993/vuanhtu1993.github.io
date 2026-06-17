---
title: "Chat model integrations - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/integrations/chat"
crawled_at: "2026-06-17T14:48:55.931Z"
---

[Chat models](https://docs.langchain.com/oss/javascript/langchain/models) are language models that use a sequence of [messages](https://docs.langchain.com/oss/javascript/langchain/messages) as inputs and return messages as outputs .

## Install and use

## Featured models

| Model | Stream | [Tool Calling](https://docs.langchain.com/oss/javascript/langchain/tools) | [`withStructuredOutput()`](https://docs.langchain.com/oss/javascript/langchain/models#structured-output) | [`Multimodal`](https://docs.langchain.com/oss/javascript/langchain/messages#multimodal) |
| --- | --- | --- | --- | --- |
| [`ChatOpenAI`](https://docs.langchain.com/oss/javascript/integrations/chat/openai) | ✅ | ✅ | ✅ | ✅ |
| [`ChatAnthropic`](https://docs.langchain.com/oss/javascript/integrations/chat/anthropic) | ✅ | ✅ | ✅ | ✅ |
| [`ChatGoogle`](https://docs.langchain.com/oss/javascript/integrations/chat/google) | ✅ | ✅ | ✅ | ✅ |
| [`ChatBedrockConverse`](https://docs.langchain.com/oss/javascript/integrations/chat/bedrock_converse) | ✅ | ✅ | ✅ | ✅ |
| [`ChatCloudflareWorkersAI`](https://docs.langchain.com/oss/javascript/integrations/chat/cloudflare_workersai) | ✅ | ❌ | ❌ | ❌ |
| [`ChatCohere`](https://docs.langchain.com/oss/javascript/integrations/chat/cohere) | ✅ | ✅ | ✅ | ✅ |
| [`ChatFireworks`](https://docs.langchain.com/oss/javascript/integrations/chat/fireworks) | ✅ | ✅ | ✅ | ✅ |
| [`ChatGroq`](https://docs.langchain.com/oss/javascript/integrations/chat/groq) | ✅ | ✅ | ✅ | ✅ |
| [`ChatMistralAI`](https://docs.langchain.com/oss/javascript/integrations/chat/mistral) | ✅ | ✅ | ✅ | ✅ |
| [`ChatOllama`](https://docs.langchain.com/oss/javascript/integrations/chat/ollama) | ✅ | ✅ | ✅ | ✅ |
| [`ChatPerplexity`](https://docs.langchain.com/oss/javascript/integrations/chat/perplexity) | ✅ | ❌ | ✅ | ❌ |
| [`ChatTogetherAI`](https://docs.langchain.com/oss/javascript/integrations/chat/togetherai) | ✅ | ✅ | ✅ | ✅ |
| [`ChatXAI`](https://docs.langchain.com/oss/javascript/integrations/chat/xai) | ✅ | ✅ | ✅ | ❌ |

See the [full list of chat model integrations](#all-chat-models) below for more options.

## Routers & proxies

Routers and proxies give you access to models from multiple providers through a single API and credential. They can simplify billing, let you switch between models without changing integrations, and offer features like automatic fallbacks.

| Provider | Integration | Description |
| --- | --- | --- |
| [OpenRouter](https://openrouter.ai/) | [`ChatOpenRouter`](https://docs.langchain.com/oss/javascript/integrations/chat/openrouter) | Unified access to models from OpenAI, Anthropic, Google, Meta, and more |

## Chat Completions API

Certain model providers offer endpoints that are compatible with OpenAI’s (legacy) [Chat Completions API](https://platform.openai.com/docs/guides/completions). In such case, you can use [`ChatOpenAI`](https://docs.langchain.com/oss/javascript/integrations/chat/openai) with a custom `base_url` to connect to these endpoints. Note that features built on top of the Chat Completions API may not be fully supported by `ChatOpenAI`; in such cases, consider using a provider-specific class if available.

## All chat models

---
