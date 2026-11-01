---
title: "Using the Messages API"
source_url: "https://platform.claude.com/docs/en/build-with-claude/working-with-messages"
crawled_at: "2026-11-01T16:15:36.501Z"
---

Practical patterns and examples for using the Messages API effectively

Anthropic offers two ways to build with Claude, each suited to different use cases:

|  | Messages API | Claude Managed Agents |
| --- | --- | --- |
| **What it is** | Direct model prompting access | Pre-built, configurable agent harness that runs in managed infrastructure |
| **Best for** | Custom agent loops and fine-grained control | Long-running tasks and asynchronous work |

This guide covers common patterns for working with the Messages API, including basic requests, multi-turn conversations, prefill techniques, and vision capabilities. For complete API specifications, see the [Messages API reference](https://platform.claude.com/docs/en/api/messages/create). For the managed agent harness instead, see the [Claude Managed Agents overview](https://platform.claude.com/docs/en/managed-agents/overview).

## Basic request and response

Refusal responses (`stop_reason: "refusal"`) also include a `stop_details` object identifying the policy category that triggered the refusal, on every model. See [Handling stop reasons](https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback#refusal-response) for the field reference and example handling code.

## Multiple conversational turns

The Messages API is stateless, which means that you always send the full conversational history to the API. You can use this pattern to build up a conversation over time. Earlier conversational turns don’t necessarily need to actually originate from Claude. You can use synthetic `assistant` messages.

### System role in messages

On Claude Fable 5.1, [Claude Mythos 5.1](https://platform.claude.com/docs/en/models/mythos-5-1/overview), Claude Fable 5, [Claude Mythos 5](https://platform.claude.com/docs/en/models/mythos-5/overview), Claude Opus 5.5, Claude Opus 4.8, Claude Opus 5, Claude Sonnet 5.5, and Claude Haiku 5.5, you can include messages with `"role": "system"` after a user turn (subject to [placement rules](https://platform.claude.com/docs/en/build-with-claude/mid-conversation-system-messages#limitations)) to add a new system instruction partway through a conversation. A `system` message that carries content cannot be the first entry in `messages`. Use the top-level `system` field for instructions that apply from the start.

A mid-conversation system message has the same authority as the top-level `system` field, but because it is appended to the end of the message history, it does not invalidate any cached prefix that came before it. Use the top-level `system` field for instructions that should apply from the very first turn, and a mid-conversation system message for instructions that only become relevant later.

See [Mid-conversation system messages](https://platform.claude.com/docs/en/build-with-claude/mid-conversation-system-messages) for the complete guide, including how to combine it with [prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching).

## Prefilling Claude’s response

You can prefill part of Claude’s response in the last position of the input messages list. Use this technique to shape Claude’s response. The following example uses `"max_tokens": 1` to get a single multiple choice answer from Claude.

## Vision

Claude can read both text and images in requests. You can supply images using the `base64`, `url`, or `file` source types. The `file` source type references an image uploaded through the [Files API](https://platform.claude.com/docs/en/build-with-claude/files). Supported media types are `image/jpeg`, `image/png`, `image/gif`, and `image/webp`. See the [Vision](https://platform.claude.com/docs/en/build-with-claude/vision) guide for more details.

## Next steps

Handle each `stop_reason` value and decide what to do when a response ends.

Give Claude tools to call external services and APIs from within the Messages API.

Control desktop computer environments with the Messages API.

Let Claude navigate, read, and interact with webpages in a browser you run.

Get guaranteed, schema-validated JSON output from Claude.

Set an advisory token budget across a full agentic loop with `output_config.task_budget`.

## Availability

The Messages API is available on every model and eligible for zero data retention and HIPAA readiness.

### API support
