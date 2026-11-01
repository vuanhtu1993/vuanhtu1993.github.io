---
title: "Stop reasons and fallback"
source_url: "https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons"
crawled_at: "2026-11-01T16:15:43.271Z"
---

Learn what each stop\_reason value means and how to handle truncation, tool use, paused turns, and refusals in your application.

Every Messages API response includes a [`stop_reason`](https://platform.claude.com/docs/en/api/messages/create#message.stop_reason)Preview with links to the API reference available — press Tab until focus enters the card, Escape to return. field that tells you why Claude stopped generating. Check this field to decide whether to use the response as-is, continue the conversation, retry, or fall back to another model.

For the full response schema, see the [Messages API reference](https://platform.claude.com/docs/en/api/messages/create).

## Quick reference

| Value | When it occurs | What to do |
| --- | --- | --- |
| [`end_turn`](#end-turn) | Claude completed its response naturally. | Use the response. |
| [`max_tokens`](#max-tokens) | The response reached your `max_tokens` limit. | Raise `max_tokens` or [continue the response](#ensuring-complete-responses). |
| [`stop_sequence`](#stop-sequence) | Claude emitted one of your `stop_sequences`. | Read `stop_sequence` to see which one fired. |
| [`tool_use`](#tool-use) | Claude is calling a tool. | Run the tool and return the result. A server tool call still missing its result block completes in a later response. |
| [`pause_turn`](#pause-turn) | A server-tool loop reached its iteration limit. | Send the assistant content back to continue. |
| [`refusal`](#refusal) | Claude declined to respond. | Read `stop_details` and [retry on a fallback model](https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback). |
| [`model_context_window_exceeded`](#model-context-window-exceeded) | The response filled the model’s context window. | Treat the response as truncated. |

## The stop\_reason field

The `stop_reason` field is part of every successful Messages API response. Unlike errors, which indicate failures in processing your request, `stop_reason` tells you why Claude completed its response generation.

## Stop reason values

### end\_turn

The most common stop reason. Indicates Claude completed its response naturally.

### max\_tokens

Claude stopped because it reached the [`max_tokens`](https://platform.claude.com/docs/en/api/messages/create#create.max_tokens)Preview with links to the API reference available — press Tab until focus enters the card, Escape to return. limit specified in your request.

### stop\_sequence

Claude encountered one of your custom [stop sequences](https://platform.claude.com/docs/en/api/messages/create#create.stop_sequences)Preview with links to the API reference available — press Tab until focus enters the card, Escape to return..

### tool\_use

Claude is calling a tool that you need to run.

A `tool_use` response can also contain a `server_tool_use` block whose `id` has no matching result block. That server tool call is not complete, and this response does not carry its result. In the common case, Claude calls a [server tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/server-tools) and one of your client tools in the same group of parallel tool calls: the API returns without running the server tool so that you can run the client tools first. There is no other marker for the state; detect it by checking each `server_tool_use` or `mcp_tool_use` block’s `id` for a matching result block.

The continuation is a user message of `tool_result` blocks, one for every `tool_use` block in the response (see [Handle tool calls](https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls)), with two extra rules: that message must contain nothing except the `tool_result` blocks, and the request must keep the same `tools` array. A resume request that no longer defines the waiting server tool fails with a 400 whose message ends `but no `web_search` tool was provided`. The API attaches your results to the still-open assistant turn, runs the deferred server tool (for paused code execution, resumes it), and continues the turn. For a server tool Claude called directly, the next response’s `content` starts with the result block that answers the previous response’s `server_tool_use` `id`.

Adding anything after the `tool_result` blocks in that user message, such as text, ends the assistant turn; for a server tool Claude called directly, the request then fails with a 400 `invalid_request_error` that names the unresolved server tool:

Leaving out a `tool_result`, or putting one after other content, fails earlier with the standard `tool_use ids were found without tool_result blocks immediately after` error instead. To give Claude more input, send it as a separate user message after the turn completes.

### pause\_turn

Returned when the server-side sampling loop reaches its iteration limit while running [server tools](https://platform.claude.com/docs/en/agents-and-tools/tool-use/server-tools) such as web search. The default limit is 10 iterations for each request.

When this occurs, the response might contain a `server_tool_use` block without a corresponding result block. To let Claude finish processing, continue the conversation by sending the response back as-is. A response that leaves a client `tool_use` block waiting on you never has a `stop_reason` of `pause_turn`: when Claude stops to call your tools, `stop_reason` is [`tool_use`](#tool-use), and you continue it by sending the client `tool_result` blocks instead of the response itself.

### refusal

Claude declined to generate a response. Safety classifiers return this stop reason as a normal HTTP 200 response, not an error.

On a refusal, the [`stop_details`](https://platform.claude.com/docs/en/api/messages/create#message.stop_details)Preview with links to the API reference available — press Tab until focus enters the card, Escape to return. object identifies the policy category that triggered it. The categories and the full refusal response shape are covered in [What a refusal looks like](https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback#refusal-response). `stop_details` is `null` for all stop reasons other than `refusal`.

A refused request on Claude Fable 5.1, Claude Fable 5, Claude Opus 5.5, Claude Opus 5, Claude Sonnet 5.5, or Claude Haiku 5.5 can usually be served by retrying on another Claude model. [Refusals and fallback](https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback) shows how to set up that retry, server-side or in your client. Claude Haiku 5.5 has no server-side fallback, so set up its retry [in your client](https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback#client-side-fallback). If you build the retry yourself from Claude Fable 5.1, Claude Fable 5, Claude Opus 5.5, Claude Opus 5, or Claude Sonnet 5.5, [fallback credit](https://platform.claude.com/docs/en/build-with-claude/fallback-credit) covers how to avoid paying the prompt-cache cost twice.

### model\_context\_window\_exceeded

Claude stopped because it reached the model’s context window limit. This lets you request the maximum possible tokens without knowing the exact input size.

## Best practices for handling stop reasons

### Always check stop\_reason

Make it a habit to check the `stop_reason` in your response handling logic:

### Handle truncated responses gracefully

When a response is truncated because of token limits or the context window, append a notice so the reader knows the output is incomplete. To continue generating from where the response left off instead, see [Ensuring complete responses](#ensuring-complete-responses).

### Implement retry logic for pause\_turn

When you use [server tools](https://platform.claude.com/docs/en/agents-and-tools/tool-use/server-tools), the API might return `pause_turn` if the server-side sampling loop reaches its iteration limit (default 10). Handle this by adding the paused response to your messages unchanged and sending the request again. If the response includes a `container`, [send its ID back](https://platform.claude.com/docs/en/agents-and-tools/tool-use/code-execution-tool#container-reuse) as well. Without it, the next request starts a new container, and files from earlier in the turn are lost.

The function returns the last response, which holds only the final part of the turn. To show the whole turn or to continue the conversation, keep the paused responses as well.

## Stop reasons versus errors

It’s important to distinguish between `stop_reason` values and actual errors:

### Stop reasons (successful responses)

-   Part of the response body
-   Indicate why generation stopped normally
-   Response contains valid content

### Errors (failed requests)

-   HTTP status codes 4xx or 5xx
-   Indicate request processing failures
-   Response contains error details

## Streaming considerations

When using streaming, `stop_reason` is:

-   `null` in the initial `message_start` event
-   Provided in the `message_delta` event
-   Not provided in any other events

## Common patterns

### Handling tool use workflows

### Ensuring complete responses

### Getting maximum tokens without knowing input size

With the `model_context_window_exceeded` stop reason, you can request the maximum possible tokens without calculating input size:

## Next steps

Retry refused requests on a fallback model, server-side or in your client.

Let the SDK manage the `tool_use` loop, result formatting, and retries for you.

Read `stop_reason` from the `message_delta` event when streaming.

Handle 4xx and 5xx HTTP errors, which are distinct from stop reasons.
