---
title: "Token counting"
source_url: "https://platform.claude.com/docs/en/build-with-claude/token-counting"
crawled_at: "2026-11-01T16:20:13.972Z"
---

Count the tokens in a message before you send it to Claude. Use token counts to manage rate limits and costs, make model routing decisions, and fit prompts to a target length.

Token counting lets you determine the number of tokens in a message before you send it to Claude. This helps you make informed decisions about your prompts and usage. With token counting, you can:

-   Proactively manage rate limits and costs
-   Make smart model routing decisions
-   Optimize prompts to a specific length

---

## How to count message tokens

The [token counting](https://platform.claude.com/docs/en/api/messages/count_tokens)Preview with links to the API reference available — press Tab until focus enters the card, Escape to return. endpoint accepts the same structured list of inputs for creating a message, including support for system prompts, [tools](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview), [images](https://platform.claude.com/docs/en/build-with-claude/vision), and [PDFs](https://platform.claude.com/docs/en/build-with-claude/pdf-support). The response contains the total number of [input tokens](https://platform.claude.com/docs/en/api/messages/count_tokens#message_tokens_count.input_tokens)Preview with links to the API reference available — press Tab until focus enters the card, Escape to return..

This endpoint returns an `invalid_request_error` for a few inputs that the Messages API accepts:

-   [Server tools](https://platform.claude.com/docs/en/agents-and-tools/tool-use/server-tools) such as web search, web fetch, code execution, and tool search (every server tool except the [advisor tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/advisor-tool))
-   The [MCP connector](https://platform.claude.com/docs/en/agents-and-tools/mcp-connector)
-   `image` or `document` blocks with a `url` or `file` source

Send images and PDFs as base64 to count them. For requests that use server tools or MCP servers, the Messages API response reports the tokens used in its [`usage`](https://platform.claude.com/docs/en/api/messages/create#message.usage)Preview with links to the API reference available — press Tab until focus enters the card, Escape to return. object.

### Supported models

All [active models](https://platform.claude.com/docs/en/models/overview) support token counting.

### Count tokens in basic messages

### Count tokens in messages with tools

### Count tokens in messages with images

An embedded image block that sets [`"oversized_image": "error"`](https://platform.claude.com/docs/en/build-with-claude/vision-coordinates#oversized-image-error) is rejected at count time exactly as the Messages API would reject it.

### Count tokens in messages with thinking

### Count tokens in messages with PDFs

---

## Token counts on Claude Fable and Claude Mythos models

Claude Fable 5.1, Claude Mythos 5.1, Claude Fable 5, and Claude Mythos 5 share the tokenizer introduced with Claude Opus 4.7. A prompt counts the same on all four, and roughly 30 percent higher than on models before Claude Opus 4.7 (the exact increase depends on the content). The token counting endpoint counts under the tokenizer of the `model` you pass. To measure the difference for your workload, count the same request twice, once with your current model and once with the model you plan to move to, and compare the two `input_tokens` values.

---

## Pricing and rate limits

Token counting is **free to use** but subject to requests per minute rate limits based on your [usage tier](https://platform.claude.com/docs/en/api/rate-limits#rate-limits). If you need higher limits, use **Request tier increase** on the [Rate limits](https://platform.claude.com/usage/limits) page in the Claude Console.

| Usage tier | Requests per minute (RPM) |
| --- | --- |
| Start | 5,000 |
| Build | 10,000 |
| Scale | 20,000 |

---

## FAQ

---

## Next steps

Read the full API reference for the token counting endpoint.

Use token counts to keep prompts within a model’s context window.

Check token counts before you send a request to stay within your usage tier.

Reduce cost and latency on repeated prompts by caching prompt prefixes.

## Availability

Token counting is available on select models and eligible for zero data retention and HIPAA readiness.

### API support
