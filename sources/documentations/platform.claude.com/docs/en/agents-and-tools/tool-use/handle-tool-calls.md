---
title: "Handle tool calls"
source_url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls"
crawled_at: "2026-11-01T16:17:28.238Z"
---

Parse tool\_use blocks, format tool\_result responses, and handle errors with is\_error.

This page covers the tool-call lifecycle: reading `tool_use` blocks from Claude’s response, formatting `tool_result` blocks in your reply, and signaling errors. For the SDK abstraction that handles this automatically, see [Tool Runner](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-runner).

Claude’s response differs based on whether it uses a [client or server tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview#how-tool-use-works).

## Handling results from client tools

The response has a `stop_reason` of `tool_use` and one or more `tool_use` content blocks that include:

-   `id`: A unique identifier for this particular tool use block. This is used to match up the tool results later.
-   `name`: The name of the tool being used.
-   `input`: An object containing the input being passed to the tool, conforming to the tool’s `input_schema`.

A `tool_use` block for a member of the [computer use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool) or [browser use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/browser-use-tool) toolset also carries a `toolset_name` field (`"computer"` or `"browser"`). Its `name` is the member tool Claude is calling, such as `screenshot` or `navigate`, so dispatch those blocks on both fields.

When you receive a tool use response for a client tool, you should:

1.  Extract the `name`, `id`, and `input` from the `tool_use` block.
2.  Run the actual tool in your code base corresponding to that tool name, passing in the tool `input`.
3.  Continue the conversation by sending a new message with the `role` of `user`, and a `content` block containing the `tool_result` type and the following information:
    -   `tool_use_id`: The `id` of the tool use request this is a result for.
    -   `content` (optional): The result of the tool, as a string (for example, `"content": "15 degrees"`), a list of nested content blocks (for example, `"content": [{"type": "text", "text": "15 degrees"}]`), or a list of document blocks (for example, `"content": [{"type": "document", "source": {"type": "text", "media_type": "text/plain", "data": "15 degrees"}}]`). These content blocks can use the `text`, `image`, `document`, or [`search_result`](https://platform.claude.com/docs/en/build-with-claude/search-results) types.
    -   `is_error` (optional): Set to `true` if the tool execution resulted in an error.

A `tool_result` that answers a computer use or browser use member block must also echo the same `toolset_name` value as the `tool_use` block; a member result that omits it is rejected. Its `content` is also narrower: a member result may contain only `text` and `image` blocks, and a browser use result may add one [`browser_state`](https://platform.claude.com/docs/en/agents-and-tools/tool-use/browser-use-tool#track-tabs-and-page-state) block (the [tab-management members](https://platform.claude.com/docs/en/agents-and-tools/tool-use/browser-use-tool#tab-management-results) return only that block).

After receiving the tool result, Claude will use that information to continue generating a response to the original user prompt.

## Handling results from server tools

Claude runs the tool internally and incorporates the results directly into its response without requiring additional user interaction.

## Handling errors with is\_error

There are a few different types of errors that can occur when using tools with Claude:

## Next steps

Handle responses where Claude calls several tools in a single turn.

Let the SDK manage the `tool_use` loop, result formatting, and retries for you.

Write schemas and descriptions that steer Claude toward the right tool.
