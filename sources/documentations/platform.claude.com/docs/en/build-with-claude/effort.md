---
title: "Effort"
source_url: "https://platform.claude.com/docs/en/build-with-claude/effort"
crawled_at: "2026-11-01T16:15:59.448Z"
---

Control how many tokens Claude uses when responding with the effort parameter, trading off between response thoroughness and token efficiency.

The effort parameter lets you control how many tokens Claude spends when responding to requests. You can trade off between response thoroughness and token efficiency with a single model. The top-level effort parameter is available on all supported models with no beta header required. [Per-message effort](#change-effort-mid-conversation-beta) is in beta.

## Set the effort level

Set `output_config.effort` on the request. The following example runs one request at `medium` effort.

## How effort works

Most Claude models default to high effort, spending as many tokens as needed for excellent results; Claude Opus 5.5 and Claude Haiku 5.5 default to medium. You can raise the effort level to `max` for the absolute highest capability, or lower it to be more conservative with token usage, optimizing for speed and cost while accepting some reduction in capability.

The effort parameter affects **all tokens** in the response, including:

-   Text responses and explanations
-   Tool calls and function arguments
-   Thinking (when active)

Because effort applies to every output token, it works with or without thinking. Lower effort also means fewer and terser tool calls.

### Effort levels

| Level | Description | Typical use case |
| --- | --- | --- |
| `max` | Absolute maximum capability with no constraints on token spending. Available on Claude Fable 5.1, Claude Mythos 5.1, Claude Fable 5, Claude Mythos 5, Claude Mythos Preview, Claude Opus 5.5, Claude Opus 5, Claude Opus 4.8, Claude Opus 4.7, Claude Opus 4.6, Claude Sonnet 5.5, Claude Sonnet 5, Claude Sonnet 4.6, and Claude Haiku 5.5. | Tasks requiring the deepest possible reasoning and most thorough analysis |
| `xhigh` | Extended capability for long-horizon work. Available on Claude Fable 5.1, Claude Mythos 5.1, Claude Fable 5, Claude Mythos 5, Claude Opus 5.5, Claude Opus 5, Claude Opus 4.8, Claude Opus 4.7, Claude Sonnet 5.5, Claude Sonnet 5, and Claude Haiku 5.5. | Long-running agentic and coding tasks (over 30 minutes) with token budgets in the millions |
| `high` | Spends as many tokens as the task needs for excellent results. The default on every model that supports effort except Claude Opus 5.5 and Claude Haiku 5.5. | Complex reasoning, difficult coding problems, agentic tasks |
| `medium` | Balanced approach with moderate token savings. The default on Claude Opus 5.5 and Claude Haiku 5.5. | Agentic tasks that require a balance of speed, cost, and performance |
| `low` | Most efficient. Significant token savings with some capability reduction. | Simpler tasks that need the best speed and lowest costs, such as subagents |

Not every model that supports `max` supports `xhigh`.

The per-model recommendations that follow override this table where they differ.

## Recommended effort levels

## Effort with tool use

When using tools, the effort parameter affects both the explanations around tool calls and the tool calls themselves. Lower effort levels tend to:

-   Combine multiple operations into fewer tool calls
-   Make fewer tool calls
-   Proceed directly to action without preamble
-   Use terse confirmation messages after completion

Higher effort levels might:

-   Make more tool calls
-   Explain the plan before taking action
-   Provide detailed summaries of changes
-   Include more comprehensive code comments

## Effort with thinking

The `thinking` parameter controls whether Claude thinks in [thinking blocks](https://platform.claude.com/docs/en/build-with-claude/thinking) before answering; the `effort` parameter controls how much work Claude puts into the whole response, which in adaptive mode includes how often and how deeply it thinks. Don’t pass `adaptive` as an `effort` value: `adaptive` is a thinking mode, not an effort level.

At higher effort levels, Claude thinks more readily and at greater length. In a tool-use loop, follow-up requests that only process tool results can still skip thinking at any level. At lower levels, Claude can skip thinking entirely for simpler problems. See [Thinking and effort](https://platform.claude.com/docs/en/build-with-claude/thinking#thinking-and-effort) for full guidance on how the two controls work together.

On Claude Opus 4.5, the only extended-thinking-only model that supports effort, it works alongside [`budget_tokens`](https://platform.claude.com/docs/en/build-with-claude/extended-thinking): set the effort level for your task, then set the thinking token budget based on how much reasoning depth the task needs.

For per-model thinking availability, see the [per-model configuration table](https://platform.claude.com/docs/en/build-with-claude/thinking-troubleshooting#supported-models). Effort works with or without thinking. See [How effort works](#how-effort-works).

## Change effort mid-conversation

You can run later turns of a conversation at a different effort level in two ways. On Claude Fable 5.1, Claude Mythos 5.1, Claude Opus 5.5, Claude Opus 5, Claude Sonnet 5.5, and Claude Haiku 5.5, use a per-message effort change, which keeps the prompt cache. On other models, set a new top-level value on the next request, which starts the cache over.

### Per-message effort (beta)

Per-message effort is in beta. On the Claude API and [Claude Models on Google Cloud (Google managed)](https://platform.claude.com/docs/en/build-with-claude/claude-models-on-google-cloud/google-managed), it’s available on Claude Fable 5.1, Claude Mythos 5.1, Claude Opus 5.5, Claude Opus 5, Claude Sonnet 5.5, and Claude Haiku 5.5. On [Amazon Bedrock](https://platform.claude.com/docs/en/build-with-claude/claude-in-amazon-bedrock), it’s available on Claude Fable 5.1, Claude Mythos 5.1, and Claude Opus 5.5. It requires the [beta header](https://platform.claude.com/docs/en/api/beta-headers) `mid-conversation-output-config-2026-07-01`. With the Amazon Bedrock [InvokeModel API](https://platform.claude.com/docs/en/build-with-claude/claude-on-amazon-bedrock-legacy), it’s available on Claude Fable 5.1 and Claude Opus 5.5, and you send that value in the `anthropic_beta` array of the request body instead.

Without the beta value, a per-message `output_config` returns a 400 error: `messages.N.output_config: Extra inputs are not permitted`, where `N` is the index of the `system` message in `messages`. With the beta value, models without per-message effort, including Claude Fable 5, return a 400 error: `output_config.effort requires a model that supports per-turn effort; this model does not`. On Amazon Bedrock, those models and Claude Opus 5 return the `Extra inputs are not permitted` error instead. On Claude Sonnet 5.5 with `thinking: {"type": "between_tools"}` and on Claude Haiku 5.5 with `thinking: {"type": "disabled"}`, effort can’t change mid-conversation: a per-message `output_config.effort` that differs from the level in effect returns a 400 error. To vary effort for each turn, use adaptive thinking.

Add a `role: "system"` message with empty `content` and the new level in `output_config.effort`. Placed directly after a `user` turn with new input, it sets the level for Claude’s reply to that turn. Placed anywhere else, such as between an `assistant` turn and the next `user` turn as in the following example, it takes effect from the next `user` turn with new input. A `user` turn that holds only `tool_result` blocks doesn’t count as new input, so a change placed after one in a tool-use loop waits for the next `user` turn with new input. The new level then holds until a later message changes it. Everything before that message is unchanged, so the cached prefix still matches.

The following example starts at `high`, then drops to `low` for a routine follow-up:

An effort-only system message carries no text, so the [placement rules for mid-conversation system messages](https://platform.claude.com/docs/en/build-with-claude/mid-conversation-system-messages#limitations) don’t apply. It can appear anywhere in `messages`, including as the first entry or between an `assistant` turn and the next `user` turn. Values are the level names (`low`, `medium`, `high`, `xhigh`, and `max`).

Prefer this form over changing the top-level value between requests. A top-level change restarts the cache and, on Claude Fable 5.1, also steers the model less reliably: its earlier replies were written at the previous level, and it tends to stay consistent with them.

### Top-level effort on the next request

The top-level `output_config.effort` applies to the whole request. To run a later part of a conversation at a different level, set the new value on the next request. Because top-level effort shapes the rendered prompt, changing it between requests doesn’t preserve cached prefixes from earlier turns. If you rely on [prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) across a long session and your model doesn’t support per-message effort, pick an effort level at the start and keep it constant.

## Best practices

1.  **Set effort explicitly:** The API defaults to `high` (`medium` on Claude Opus 5.5 and Claude Haiku 5.5), but the right starting point depends on your model and workload.
2.  **Use low for speed-sensitive or simple tasks:** When latency matters or tasks are straightforward, low effort can significantly reduce response times and costs.
3.  **Test your use case:** The impact of effort levels varies by task type. Evaluate performance on your specific use cases before deploying.
4.  **Consider dynamic effort:** Adjust effort based on task complexity. Simple queries might warrant low effort, whereas agentic coding and complex reasoning benefit from high effort. See the next item before varying it within one conversation.
5.  **Hold top-level effort constant within cached conversations:** Changing the top-level effort value between requests invalidates [prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching), so vary it across workloads rather than within a conversation that relies on cache hits. On models that support it, use a [per-message effort change](#change-effort-mid-conversation-beta) instead, which preserves the cache. See [Thinking and prompt caching](https://platform.claude.com/docs/en/build-with-claude/thinking#thinking-and-prompt-caching).

## Next steps

Give Claude an advisory token budget for the full agentic loop to help the model self-regulate on long agentic tasks.

Understand adaptive thinking, where Claude determines when and how much to think, and steer it with effort and prompting.

Understand how thinking works, when Claude thinks by default, and how thinking interacts with effort.

## Availability

Effort is available on select models and eligible for zero data retention and HIPAA readiness.

### API support
