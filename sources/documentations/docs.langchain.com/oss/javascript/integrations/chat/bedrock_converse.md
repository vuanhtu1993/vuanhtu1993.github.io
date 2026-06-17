---
title: "ChatBedrockConverse integration - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/integrations/chat/bedrock_converse"
crawled_at: "2026-06-17T14:57:03.913Z"
---

[Amazon Bedrock Converse](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_Converse.html) is a fully managed service that makes Foundation Models (FMs) from leading AI startups and Amazon available via an API. You can choose from a wide range of FMs to find the model that is best suited for your use case. It provides a unified conversational interface for Bedrock models. This will help you getting started with `ChatBedrockConverse` [chat models](https://docs.langchain.com/oss/javascript/langchain/models). For detailed documentation of all `ChatBedrockConverse` features and configurations head to the [API reference](https://reference.langchain.com/javascript/langchain-aws/ChatBedrockConverse).

## Overview

### Integration details

| Class | Package | Serializable | [PY support](https://python.langchain.com/docs/integrations/chat/bedrock/#beta-bedrock-converse-api) | Downloads | Version |
| --- | --- | --- | --- | --- | --- |
| [`ChatBedrockConverse`](https://reference.langchain.com/javascript/langchain-aws/ChatBedrockConverse) | [`@langchain/aws`](https://npmjs.com/@langchain/aws) | ✅ | ✅ | ![NPM - Downloads](https://res.cloudinary.com/dv3vzmogk/image/upload/v1781708225/aha-mind/docs-crawler/docs.langchain.com/aws_zn7cfm.svg) | ![NPM - Version](https://res.cloudinary.com/dv3vzmogk/image/upload/v1781708225/aha-mind/docs-crawler/docs.langchain.com/aws_b0yamt.svg) |

### Model features

See the links in the table headers below for guides on how to use specific features.

| [Tool calling](https://docs.langchain.com/oss/javascript/langchain/tools) | [Structured output](https://docs.langchain.com/oss/javascript/langchain/structured-output) | [Image input](https://docs.langchain.com/oss/javascript/langchain/messages#multimodal) | Audio input | Video input | [Token-level streaming](https://docs.langchain.com/oss/javascript/langchain/streaming) | [Token usage](https://docs.langchain.com/oss/javascript/langchain/models#token-usage) | [Logprobs](https://docs.langchain.com/oss/javascript/langchain/models#log-probabilities) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |

## Setup

To access Bedrock models you’ll need to create an AWS account, set up the Bedrock API service, get an access key ID and secret key, and install the `@langchain/aws` integration package.

### Credentials

Head to the [AWS docs](https://docs.aws.amazon.com/bedrock/latest/userguide/getting-started.html) to sign up for AWS and setup your credentials. You’ll also need to turn on model access for your account, which you can do by [following these instructions](https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html). Set your Bedrock credentials in the environment:

```
export BEDROCK_AWS_REGION="us-east-1"
export BEDROCK_AWS_ACCESS_KEY_ID="your-access-key-id"
export BEDROCK_AWS_SECRET_ACCESS_KEY="your-secret-access-key"
```

Alternatively, set `AWS_BEARER_TOKEN_BEDROCK` for API key authentication. See the [AWS Bedrock API key docs](https://docs.aws.amazon.com/bedrock/latest/userguide/api-keys.html). If you want to get automated tracing of your model calls you can also set your [LangSmith](https://docs.langchain.com/langsmith/observability) API key by uncommenting below:

```
# export LANGSMITH_TRACING="true"
# export LANGSMITH_API_KEY="your-api-key"
```

### Installation

The LangChain `ChatBedrockConverse` integration lives in the `@langchain/aws` package:

## Instantiation

Now we can instantiate our model object and generate chat completions. There are a few different ways to authenticate with AWS - the below examples rely on an access key, secret access key and region set in your environment variables:

```
import { ChatBedrockConverse } from "@langchain/aws";

const llm = new ChatBedrockConverse({
  model: "anthropic.claude-3-5-sonnet-20240620-v1:0",
  region: process.env.BEDROCK_AWS_REGION,
  credentials: {
    accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.BEDROCK_AWS_SECRET_ACCESS_KEY!,
  },
});
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
  "id": "f5dc5791-224e-4fe5-ba2e-4cc51d9e7795",
  "content": "J'adore la programmation.",
  "additional_kwargs": {},
  "response_metadata": {
    "$metadata": {
      "httpStatusCode": 200,
      "requestId": "f5dc5791-224e-4fe5-ba2e-4cc51d9e7795",
      "attempts": 1,
      "totalRetryDelay": 0
    },
    "metrics": {
      "latencyMs": 584
    },
    "stopReason": "end_turn",
    "usage": {
      "inputTokens": 29,
      "outputTokens": 11,
      "totalTokens": 40
    }
  },
  "tool_calls": [],
  "invalid_tool_calls": [],
  "usage_metadata": {
    "input_tokens": 29,
    "output_tokens": 11,
    "total_tokens": 40
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

Tool calling with Bedrock models works in a similar way to [other models](https://docs.langchain.com/oss/javascript/langchain/tools), but note that not all Bedrock models support tool calling. Please refer to the [AWS model documentation](https://docs.aws.amazon.com/bedrock/latest/APIReference/welcome.html) for more information.

---

## API reference

For detailed documentation of all `ChatBedrockConverse` features and configurations head to the [API reference](https://reference.langchain.com/javascript/langchain-aws/ChatBedrockConverse).

---
