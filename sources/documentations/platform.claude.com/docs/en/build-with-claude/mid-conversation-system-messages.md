---
title: "Mid-conversation system messages and tool changes"
source_url: "https://platform.claude.com/docs/en/build-with-claude/mid-conversation-system-messages"
crawled_at: "2026-11-01T16:19:56.329Z"
---

Change system instructions or tool availability partway through a conversation without invalidating the cached prefix that came before them.

System instructions normally live in the top-level `system` field, ahead of every message in the conversation. That position is great for [prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching): the system prompt is part of the stable prefix, so subsequent turns hit the cache. It is a poor position for instructions you only discover you need partway through a session, because editing the top-level `system` field changes the very beginning of the prompt and invalidates the cache for everything that follows.

Mid-conversation system messages close that gap. You append a `{"role": "system"}` message at the point in the conversation where the new instruction becomes relevant, instead of editing the top-level `system` field. The cached prefix stays the same, so the next request still reads it from cache, and the new instruction is still applied as a system instruction rather than as ordinary user text.

## Mid-conversation tool changes

The `tools` array sits even earlier in the hashed request prefix than the top-level `system` field, so editing it invalidates the [prompt cache](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) for the entire conversation. Mid-conversation tool changes are the tools counterpart to mid-conversation system messages. Instead of fixing the tool list for the lifetime of the conversation, you change which tools are offered to the model between turns: declare the full tool set in `tools` up front, then use `tool_addition` and `tool_removal` blocks to offer a tool to the model, or withdraw it, from a specific point in the conversation onward. The `tools` array itself never changes, so the cached prefix stays intact. Mid-conversation tool changes are in beta and use the `inline-tools-2026-09-15` beta header on the Claude API.

`tool_addition` and `tool_removal` are content blocks in the `content` array of a `role: "system"` message, and they can be mixed with `text` blocks in the same message. The message follows the placement rules for any mid-conversation system message, with one extra restriction after a paused turn (see [Limitations](#limitations)), and the change applies from that point in the conversation onward. Each block’s `tool` field references a tool rather than defining one: `{"type": "tool_reference", "name": "..."}` names a tool declared in the request’s `tools` array, and [MCP connector](https://platform.claude.com/docs/en/agents-and-tools/mcp-connector) tools can be referenced individually with `mcp_tool_reference` (`server_name` and `name`) or as a whole toolset with `mcp_toolset_reference` (`server_name`). Referencing a name that is not declared in `tools` returns a 400 error (on the Claude API, with `error.details.error_code` set to `tool_reference_unresolved`). A `tool_addition` block can instead [carry the tool’s full definition](#define-tools-in-a-message-beta), which the `mid-conversation-tool-changes-2026-07-01` header doesn’t support.

Every tool declared in `tools` is offered to the model from the start of the conversation unless it is declared with `defer_loading: true`, which keeps it withheld until a `tool_addition` block surfaces it. `tool_addition` also re-offers a tool that an earlier `tool_removal` withdrew.

The following request declares `get_weather` in `tools`, then withdraws it after the first user turn with a `tool_removal` block. The request sends the `inline-tools-2026-09-15` beta header.

### Define tools in a message (beta)

With the `inline-tools-2026-09-15` beta header, a `tool_addition` block can define a tool by value, carrying its full definition, instead of naming it by reference. This lets you introduce a tool that is unknown at the start of the conversation, or whose schema changes later, by appending a `role: "system"` message. The `tools` array and every earlier message stay exactly as sent, so the prompt cache still hits and only the appended message is processed as new input. The one exception, a `tools` array with no non-deferred tool, is covered in the rules that follow. The header also covers adding and removing tools by reference, so you don’t need to send `mid-conversation-tool-changes-2026-07-01` as well.

Wrap the definition in a `tool` object of type `tool_definition`. The `definition` is a `tools` entry, such as a custom tool or an Anthropic-defined client or server tool, with its usual configuration, including `cache_control` and `defer_loading`. During the beta, some tool types (the computer use tool among them) can’t be defined in a message yet and return a 400 error that says so; declare those in `tools` and add them by reference. For example, to define a custom tool mid-conversation:

From that position onward, the model can call the tool the same way it calls a tool declared in `tools`. Sending an identical definition again changes nothing, so a client can safely resend it, for example on a retry.

The following request keeps `get_weather` in `tools` and defines `db_query` after the first user turn:

The response’s `content` includes a `tool_use` block for the new tool, for example:

To change a tool’s schema, or to move a server tool to a newer version, send a different definition under the same name. The new definition replaces the earlier one from that position onward. A definition that reuses the name of a different type of tool returns a 400 error with `error.details.error_code` set to `tool_name_conflict`. A newer version of the same tool doesn’t count as a different type. `tool_removal` still takes a reference, and a removed tool can be defined or re-offered again later.

A few rules follow from where the definition renders:

-   **Declare what you know up front.** A tool you know about at the first request belongs in `tools`, with `defer_loading: true` and a later `tool_addition` reference if you don’t want to offer it to the model yet. Define by value only what is unknown at the first request or changes later.
-   **Keep at least one non-deferred tool in `tools`.** A conversation whose `tools` array has no non-deferred tool is accepted, but the first tool it defines by value changes the start of the rendered prompt, which costs one full cache miss on that request. A [tool search tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool) counts as non-deferred.
-   **Dated tool types keep their own beta headers.** If a server tool you define by value requires its own beta header, send that header on every later request in the conversation.
-   **`cache_control` goes on the block or in the definition, not both,** and counts toward the request’s breakpoint limit. A deferred definition can’t carry `cache_control`.

A request returns a 400 error with `error.details.error_code` set to `available_tools_limit_exceeded` when any of these limits is exceeded:

-   More than 10,000 deferred tools are available after any message.
-   More than 10,000 tools defined after the first user message are available after any message.
-   The tool definitions sent after the first user message that are still available after any message total more than 4 MB (4,194,304 bytes).
-   The rendered tool text is larger than 4 MB (4,194,304 bytes).

### Add an MCP server mid-conversation (beta)

To add an [MCP connector](https://platform.claude.com/docs/en/agents-and-tools/mcp-connector) server partway through a conversation, send the `mcp-client-2026-09-15` beta header along with `inline-tools-2026-09-15`. The `definition` in a `tool_addition` block can then be an `mcp_toolset`, so the server’s tools become available without editing `tools`. List the server’s connection details in `mcp_servers` as usual, then append the toolset where the server became available:

The `mcp_toolset` object is the same one you would put in `tools`, including `default_config` and `configs`. A `tool_addition` block never holds a server URL or token. Those stay in `mcp_servers`.

The following request keeps `get_weather` in `tools`, lists the calendar server in `mcp_servers`, and adds the server’s toolset after the first user turn:

With `mcp-client-2026-09-15`, a response for which the API fetched a server’s tool list starts with an `mcp_tool_listing` block, one for each server it fetched. If your code reads `content[0]`, skip these blocks. Send the assistant message back unchanged, this block included, and keep sending `mcp-client-2026-09-15` on every request that carries it. Later requests then use the recorded list instead of asking the server again. To pin a toolset yourself, copy that list into the `mcp_toolset`’s `tools` field, as described in [Pin an MCP server’s tool list](https://platform.claude.com/docs/en/agents-and-tools/mcp-connector#pin-mcp-tool-list).

`mcp-client-2026-09-15` includes everything `mcp-client-2025-11-20` does, so you don’t need to send both. These features are available on the Claude API. Requests that use the MCP connector keep its [data retention](https://platform.claude.com/docs/en/agents-and-tools/mcp-connector#data-retention) terms.

## When to use a mid-conversation system message

[Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) hashes the request prefix in order: `tools`, then `system`, then `messages`. A cache hit requires the prefix to match a recent request exactly, byte for byte, up to the cache breakpoint.

That ordering means the top-level `system` field sits near the very start of the hashed prefix. Any change to it, even appending a sentence, produces a different hash, and the request misses the cache for the system prompt and every cached message after it.

Mid-conversation system messages let you add the instruction at the **end** of the message history instead. Everything before the new instruction is unchanged, so the existing cache entry still matches, and only the new message is processed as fresh input.

A few situations where this matters:

-   **Mid-session policy or persona changes.** A long agentic session needs a new constraint (“from now on, write all SQL as parameterized queries”) after dozens of cached turns. Adding it to the top-level `system` field would re-process the entire history.
-   **Per-turn context that must be authoritative.** You want to inject a freshness note, a session deadline, or a tool-availability change with system-level weight, and it changes too often to live in the cached prefix.
-   **Per-turn reminders that shouldn’t pile up.** A harness nudges the model after each batch of tool results (“request independent reads together,” “the user hasn’t heard from you in a while”) and needs the model to receive only the newest copy. A [turn-scoped system message](#turn-scoped-system-messages) renders for one turn and then costs nothing, without deleting anything from the history.
-   **State changes your application observes.** Your application detects something Claude should treat as an operator-level fact: files changed on disk, the user toggled an auto-approve setting, available tools changed, or the remaining token budget dropped below a threshold.
-   **User input that should not interrupt an agentic loop.** A user types a follow-up while Claude is still running tools for the previous request. Relaying it as a system message after the next tool result lets Claude fold the new input into the work it is already doing, instead of treating it as a fresh request to switch to. On Claude Sonnet 5.5 and Claude Haiku 5.5, append the user’s words as a `text` block after the last `tool_result` in the same `user` message instead. See [Placement after tool results](#placement-after-tool-results).
-   **Mode switches that grant standing permissions.** A session-level mode can use a mid-conversation system message to grant standing consent to an expensive capability, such as automatically launching multiagent workflows, with a short refresher every several turns and an exit notice when the mode is turned off. For a worked example, see [Build an orchestration mode](https://platform.claude.com/docs/en/build-with-claude/mid-conversation-effort-example).

In all of these cases you could put the instruction in a regular `user` message, and Claude does follow instructions that arrive in user turns. The difference is priority: a `user` message is treated as coming from the end user, whereas a `system` message is treated as coming from you, the application operator. When the two conflict, system instructions take precedence, so use the `system` role for operator-level facts and constraints that should hold even if the end user asks for something different. A mid-conversation system message keeps that operator-level priority without paying the cache-miss cost of editing the top-level `system` field.

## How it works

Add a message with `"role": "system"` to the `messages` array. Use a plain string or content blocks for `content`, the same as a `user` or `assistant` turn. The instruction applies from that point in the conversation onward. When instructions conflict, later system messages take precedence over earlier ones, and mid-conversation system messages take precedence over the top-level `system` field for the turns that follow them.

You can still set the top-level `system` field for instructions that should apply to the entire conversation. Reserve mid-conversation system messages for instructions that only become relevant later, or that you want to add without invalidating the cached prefix.

A `role: "system"` message can also carry `output_config.effort` to change the [effort](https://platform.claude.com/docs/en/build-with-claude/effort) level partway through a conversation. This is in beta on Claude Fable 5.1, Claude Mythos 5.1, Claude Opus 5.5, Claude Opus 5, Claude Sonnet 5.5, and Claude Haiku 5.5 on the Claude API and Claude Models on Google Cloud (Google managed), and requires the `mid-conversation-output-config-2026-07-01` beta header. On Amazon Bedrock, it’s in beta on Claude Fable 5.1, Claude Mythos 5.1, and Claude Opus 5.5, with the same beta value. Claude Opus 5 doesn’t support it on Amazon Bedrock. See [Per-message effort](https://platform.claude.com/docs/en/build-with-claude/effort#change-effort-mid-conversation-beta).

This example enables [automatic caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching#automatic-caching) with the top-level `cache_control` field. Prompt caching is opt-in: if a request has no `cache_control` field (automatic or an [explicit breakpoint](https://platform.claude.com/docs/en/build-with-claude/prompt-caching#explicit-cache-breakpoints)), nothing is cached and every request pays the regular input token price for the full conversation. With caching enabled, appending the system message leaves the already-cached turns unchanged, so the request that carries the new instruction still reads them from cache instead of processing them again. Caching also requires the conversation to meet the [minimum cacheable prompt length](https://platform.claude.com/docs/en/build-with-claude/prompt-caching#cache-limitations); an example as short as this one falls below it, so `cache_creation_input_tokens` and `cache_read_input_tokens` stay at 0 until the conversation grows.

A mid-conversation system message that carries content (`text`, `tool_addition`, or `tool_removal` blocks) must immediately follow a `user` turn (or an `assistant` turn ending in a server tool result), and must either be the last entry in `messages` or be immediately followed by an `assistant` turn. A `user` message that carries `tool_result` blocks counts: in an agentic loop you can place the system message right after the tool results, before Claude’s next turn. Any other position for a message that carries content, including between an `assistant` `tool_use` block and the `tool_result` that answers it, returns a 400 error. A message with empty `content` that only sets [`output_config.effort`](https://platform.claude.com/docs/en/build-with-claude/effort#change-effort-mid-conversation-beta) is accepted anywhere in `messages`. Consecutive `system` messages are judged together, so an effort-only message next to one that carries content follows the rule for content.

### Placement after tool results

In an [agentic loop](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview), the system message goes after the `user` message that delivers the tool results. On most models, this is also where your application can relay input that the user typed while Claude was working, so the new context is absorbed without restarting the turn (for Claude Sonnet 5.5 and Claude Haiku 5.5, see the end of this section):

Phrase the system content as context rather than as a command that overrides the user. State the fact (“new input arrived from the user: X,” “the remaining token budget is now Y”) and let Claude act on it. Claude is trained to resist instructions that appear to work against the user, and that protection still applies to the system role, so language such as “ignore what the user said” is less effective than stating what changed.

This pattern is for relaying input from the conversation’s own end user. Do not use it to pass tool output, retrieved documents, or other third-party content; keep that content in `tool_result` blocks (see [Limitations](#limitations)).

On Claude Sonnet 5.5 and Claude Haiku 5.5, deliver the user’s words in the user turn instead. These models are trained to resist prompt injection through tool results, so they can treat a system message placed right after a tool result as untrusted text and ignore it. Append the user’s words as a `text` block after the last `tool_result` in the same `user` message. Keep harness notices, such as reminders, in a separate mid-conversation system message after that `user` message, and never put a notice and the user’s words in the same block:

For more on this behavior, see [Prompting Claude Sonnet 5.5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#mid-turn-user-messages-and-task-budgets) and [Prompting Claude Haiku 5.5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-haiku-5-5#mid-turn-user-messages).

### Turn-scoped system messages

To scope a `role: "system"` message to the current turn, set its `clear_at` field. It takes one of two values:

-   `"never"` (the default): the message renders at its position on every request that includes it. Omitting the field is identical.
-   `"next_user_message"`: the message is **turn-scoped**. Its text renders only while no `role: "user"` message comes after it in `messages`. A user message that carries only `tool_result` blocks counts as a user message here. Once a later user message exists, the message is **cleared**: it stays in the array but renders nothing and costs no input tokens, on that request and every later one.

Turn-scoped system messages are in beta. Include the [beta header](https://platform.claude.com/docs/en/api/beta-headers) `mid-conversation-system-clear-at-2026-08-21`. Without it, `clear_at` is rejected as an unknown field.

The main use is a per-turn reminder in a tool loop. Each time you want the model to see the reminder, append it after the `tool_result` message. Leave every earlier copy where it is. The model sees only the copies that come after the last user message, so the reminder never piles up. Nothing earlier in `messages` changes, so the [prompt cache](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) keeps matching. On Claude 5.1 and later models, this also keeps later [thinking blocks valid](https://platform.claude.com/docs/en/build-with-claude/thinking#preserved-in-conversation). Deleting an earlier reminder would change the conversation before those blocks, so they would fail the prefix check. A cleared message stays in the array and leaves the conversation before those blocks unchanged.

The following request is a later step of an agent loop. `messages[3]` rendered on the earlier request, when it was the last message in the array. Once `messages[5]` (a later user message) exists, `messages[3]` is cleared: the cleared message stays in the array, so the conversation before the thinking block in `messages[4]` is unchanged, but the model no longer receives its text. `messages[6]` and `messages[7]` both render, in order.

Rules for turn-scoped messages:

-   **Resend cleared messages verbatim.** A cleared message is still part of the conversation history. Rebuilding it from current state (a fresh token count, a timestamp), dropping it as redundant, or changing its `clear_at` value is an edit to an earlier message. On Claude 5.1 and later models, every thinking block produced after it fails the [prefix check](https://platform.claude.com/docs/en/build-with-claude/thinking#preserved-in-conversation).
-   **Text only.** `content` is one or more `text` blocks (or a string). `tool_addition` and `tool_removal` blocks return a 400 error on a turn-scoped message, and so does `output_config`. Use a separate `role: "system"` message without `clear_at` for those.
-   **No `cache_control` on its blocks.** A cleared message is never part of a cache key, so a breakpoint on it could never match. Put the breakpoint on the last block of the preceding user turn instead, as the example does. The top-level [automatic caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching#automatic-caching) field skips turn-scoped messages when it picks a breakpoint. On the request that clears a message, the reusable cached prefix ends at the user turn before it, so only the one assistant turn between that message and the new user message is reprocessed.
-   **Placement rules still apply**, cleared or not. A turn-scoped message must follow a `user` turn (or an `assistant` turn ending in a server tool result) and precede an `assistant` turn or end the array, like any mid-conversation system message. One that ends the array always renders. One followed directly by another `user` message is a 400 error, not a cleared message: put all of a tool round’s results in one user message and the reminders after it.
-   **Assistant turns don’t clear it.** A prefilled or [paused](https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons#pause-turn) assistant turn after the message, or a server-side tool loop, adds no user message, so the message still renders on that continuation. To keep a reminder in view through a client-side tool loop, append it again after each `tool_result` message.
-   **Token counting follows what renders.** A cleared message adds nothing to `usage.input_tokens` or to a [token count](https://platform.claude.com/docs/en/build-with-claude/token-counting).
-   **Imported history.** In a transcript you construct in one step (few-shot examples, a migrated conversation), a turn-scoped message that already has an assistant turn and a user message after it is cleared from the first request and never renders. That is the right state for a per-turn reminder you are carrying over. Leave `clear_at` unset only on a message that should render on every request.

The validation errors are:

The first is the error returned without the beta header. On Claude Models on Google Cloud (Google managed) and [Claude in Amazon Bedrock](https://platform.claude.com/docs/en/build-with-claude/claude-in-amazon-bedrock), send the beta value in the `anthropic-beta` header, as on the Claude API (see [Beta headers](https://platform.claude.com/docs/en/api/beta-headers)). With the Amazon Bedrock [InvokeModel API](https://platform.claude.com/docs/en/build-with-claude/claude-on-amazon-bedrock-legacy), put it in the `anthropic_beta` array of the request body instead.

Through the SDK, set `clear_at` on the `role: "system"` entry in `messages` and send the beta header. The following example appends a turn-scoped reminder after the user turn; on the next request, once a later user message exists, the reminder stays in the array but no longer renders:

## Combining with prompt caching

Mid-conversation system messages and [prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) are designed to be used together:

-   **Enable caching explicitly.** Caching only occurs when the request includes `cache_control`, either the top-level [automatic caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching#automatic-caching) field or an [explicit breakpoint](https://platform.claude.com/docs/en/build-with-claude/prompt-caching#explicit-cache-breakpoints) on a content block. A mid-conversation system message does not create a cache entry on its own, and without caching enabled there are no savings to preserve.
-   **Cache the stable prefix as usual.** Place `cache_control` on the last block that stays the same across requests, whether that is the end of the top-level `system` field, the end of your tool definitions, or a stable point in the message history.
-   **Append the system message after the breakpoint.** Because it comes after the cached prefix, it does not change the prefix hash and the cache still hits.
-   **A mid-conversation system message is itself cacheable.** Once it is in the conversation, it becomes part of the stable history. On the next turn you can move your cache breakpoint past it (or rely on [automatic caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching#automatic-caching) to do so) and the system message is read from cache like any other turn.

Avoid editing or removing a mid-conversation system message that has already been sent. Like any other change to earlier messages, editing or removing it invalidates the cache from that point forward. On Claude 5.1 and later models, it also invalidates the [thinking blocks](https://platform.claude.com/docs/en/build-with-claude/thinking#preserved-in-conversation) in every later assistant turn. For guidance that should apply to one turn only, use a [turn-scoped system message](#turn-scoped-system-messages) and leave it in place. If the instruction needs to evolve, append a new system message rather than rewriting the old one. Consecutive system messages are accepted and treated as a single system section, which follows the same placement rule as a whole.

## Limitations

-   **Not for the first message.** A `system` message that carries content cannot be the first entry in `messages`. Use the top-level `system` field for instructions that apply from the very start.
-   **Placement is constrained.** A `system` message that carries content (`text`, `tool_addition`, or `tool_removal` blocks) must immediately follow a `user` turn (including a `user` turn that carries `tool_result` blocks) or an `assistant` turn ending in a server tool result, and must precede an `assistant` turn or end the array. It cannot sit between a `tool_use` block and its `tool_result`. Placing it elsewhere returns a 400 error. One exception: `tool_addition` and `tool_removal` blocks are not accepted immediately after a [paused](https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons#pause-turn) `assistant` turn (one ending in a server tool result), though `text` blocks are; resume the paused turn first, then send the tool change in the next `system` message. A message with empty `content` that only sets [`output_config.effort`](https://platform.claude.com/docs/en/build-with-claude/effort#change-effort-mid-conversation-beta) renders nothing at its position and is accepted anywhere in `messages`, including first or between an `assistant` turn and a `user` turn. Consecutive `system` messages are judged together, so adding a text-carrying message next to an effort-only one makes the whole group follow the content rule.
-   **Turn-scoped messages are text-only and re-sent verbatim.** A `clear_at: "next_user_message"` message carries no `tool_addition`, `tool_removal`, `output_config`, or `cache_control`, and once cleared it must stay in `messages` byte-for-byte on later requests. See [Turn-scoped system messages](#turn-scoped-system-messages).
-   **Not a place for untrusted content.** Claude treats system content as operator instructions and follows it. Do not place text from outside the conversation, such as raw tool output, retrieved documents, or web content, directly in a system message; doing so gives that text operator-level authority. Keep that data in `tool_result` blocks and continue to follow [Mitigate jailbreaks and prompt injections](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks).

How caching works, where to place breakpoints, and how to read cache usage fields.

Find out exactly where two requests diverged when a cache hit you expected does not occur.

Message structure, multi-turn conversations, and the `system` field.

Writing effective prompts and system instructions.

How `tool_use` and `tool_result` blocks are structured in the `messages` array.

## Availability

Mid-conversation system messages are available on select models and eligible for zero data retention and HIPAA readiness.

### API support
