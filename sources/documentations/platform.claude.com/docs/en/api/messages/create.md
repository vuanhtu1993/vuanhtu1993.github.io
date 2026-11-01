---
title: "Create a Message - Claude API Reference"
source_url: "https://platform.claude.com/docs/en/api/messages/create"
crawled_at: "2026-11-01T16:15:15.920Z"
---

Our models are trained to operate on alternating `user` and `assistant` conversational turns. When creating a new `Message`, you specify the prior conversational turns with the `messages` parameter, and the model then generates the next `Message` in the conversation. Consecutive `user` or `assistant` turns in your request will be combined into a single turn.

Each input message must be an object with a `role` and `content`. You can specify a single `user`\-role message, or you can include multiple `user` and `assistant` messages.

If the final message uses the `assistant` role, the response content will continue immediately from the content in that message. This can be used to constrain part of the model's response. This is called prefill. On models that don't support prefill, creating a message that ends with a partial `assistant` response returns a 400 error. See [Prefill not supported](https://platform.claude.com/docs/en/api/errors#prefill-not-supported).

Example with a single `user` message:

Example with multiple conversational turns:

Example with a partially-filled response from Claude, for models that support prefill:

Each input message `content` may be either a single `string` or an array of content blocks, where each block has a specific `type`. Using a `string` for `content` is shorthand for an array of one content block of type `"text"`. The following input messages are equivalent:

See [input examples](https://platform.claude.com/docs/en/build-with-claude/working-with-messages).

Note that if you want to include a [system prompt](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#give-claude-a-role), you can use the top-level `system` parameter.

There is a limit of 100,000 messages in a single request.

One of the following:

UserMessageParam object{ content, role }

One of the following:

role: "user"

AssistantMessageParam object{ content, role }

One of the following:

role: "assistant"

SystemMessageParam object{ content, role }
