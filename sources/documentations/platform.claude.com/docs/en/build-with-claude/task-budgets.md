---
title: "Task budgets"
source_url: "https://platform.claude.com/docs/en/build-with-claude/task-budgets"
crawled_at: "2026-11-01T16:16:04.991Z"
---

Give Claude an advisory token budget for the full agentic loop to help the model self-regulate on long agentic tasks.

Task budgets let you tell Claude how many tokens it has for a full agentic loop, including thinking, tool calls, tool results, and output. The model receives a running countdown and uses it to prioritize work and finish gracefully as the budget is consumed.

## When to use task budgets

Task budgets work best for agentic workflows where Claude makes multiple tool calls and decisions before finalizing its output to await the next human response. Use them when:

-   You want Claude to self-regulate token spend on long-horizon tasks.
-   You have a predictable per-task cost or latency ceiling to enforce.
-   You want the model to finish gracefully (summarize findings, report progress) as it approaches the budget rather than cutting off mid-action.

Task budgets complement the [effort parameter](https://platform.claude.com/docs/en/build-with-claude/effort): effort controls how thoroughly Claude reasons about each step, whereas task budgets cap the total work Claude can do across an agentic loop.

## Setting a task budget

Add `task_budget` to `output_config` and include the beta header:

The `task_budget` object has three fields:

-   `type`: always `"tokens"`.
-   `total`: the number of tokens Claude can spend across the agentic loop, including thinking, tool calls, tool results, and output.
-   `remaining` (optional): the budget remainder carried over from a prior request. Defaults to `total` when omitted.

## How the budget countdown works

Claude receives a budget-countdown marker injected server-side throughout the conversation. The marker shows how many tokens remain in the current agentic loop and updates as the model generates thinking, tool calls, and output, and as it processes tool results. Claude uses this signal to pace itself and finish gracefully as the budget is consumed.

### What counts as a turn

The budget covers one agentic turn, also called an agentic loop: everything Claude does in response to one user message that carries no tool results. A turn can span several requests.

A user message that carries no tool results starts a new turn with a fresh budget. Today, the countdown still counts earlier turns’ history while it remains in the context. A common case is a follow-up after Claude has ended its turn, for example because the budget ran out:

A user message that contains `tool_result` blocks continues the current turn, because your client is resolving tool calls that are part of that turn:

That holds even when the message adds new content alongside the tool results:

Server-side [compaction](https://platform.claude.com/docs/en/build-with-claude/compaction-threshold) during a turn does not reset the budget: tokens the turn consumed before the compaction still count against it. Tokens from before the turn do not count, even when a compaction at the start of a turn summarizes them. Today, that exclusion applies only to the budget carried across a server-side compaction; earlier turns’ history still counts while it remains in the context.

### Worked example: budget counting across requests

The task budget counts what Claude **sees** (thinking, tool calls and results, and text), not what’s in your request payload. In an agentic loop your client resends the full conversation on every request, so the payload keeps growing, but the budget only decrements by what is new: the tokens Claude generates and the content it has not seen before. The following example is one [agentic turn](#what-counts-as-a-turn) made of three requests: the first carries the user message, and the next two each resend the history with a tool result appended.

Consider a loop with `task_budget: {type: "tokens", total: 100000}` and a single `bash` tool.

**Request 1.** You send the initial request:

Claude thinks, then emits a tool call and stops with `stop_reason: "tool_use"`:

Suppose this assistant message (thinking plus the tool call) totals 5,000 generated tokens. The countdown Claude received during generation ended near `remaining` ≈ 95,000.

**Request 2.** Your client runs the tool, then resends the full history with the tool result appended:

The resent messages from request 1 are not counted again, but the 2,800-token tool result is new content and counts against the budget. Claude spends another 4,000 tokens on thinking and a second tool call (`grep -rn "eval(" src/`). The countdown ends near `remaining` ≈ 88,200.

**Request 3.** Full history resent again with the second tool result (1,200 tokens of grep output) appended. Claude writes a 6,000-token final findings report and stops with `stop_reason: "end_turn"`. `remaining` ≈ 81,000.

Putting the three requests side by side makes the distinction between payload size and budget spend explicit:

| Request | Request payload (approx. input tokens you sent) | Tokens counted against budget this request | Budget `remaining` after |
| --- | --- | --- | --- |
| 1 | ~20 | 5,000 (thinking + `tool_use`) | ~95,000 |
| 2 | ~7,800 (messages from request 1 + tool result) | 6,800 (2,800 tool result + 4,000 thinking and `tool_use`) | ~88,200 |
| 3 | ~13,000 (full history + second tool result) | 7,200 (1,200 tool result + 6,000 `text`) | ~81,000 |
| **Total** | **~20,820 sent across requests** | **19,000 counted against budget** | N/A |

Your client sent the original user message three times and the first assistant message twice, but each was counted once. The budget spent 19,000 of 100,000 tokens, even though the cumulative payload your client transmitted was larger and the prompt-cached input on requests 2 and 3 was larger still.

### Carrying a budget across compaction with `remaining`

If your own code compacts or rewrites the message history between requests (for example, by summarizing earlier messages), the server has no memory of how much budget was spent before compaction. Pass `remaining` on the next request so the countdown continues from where you left off rather than resetting to `total`:

In this example, the tokens spent before compaction are the usage of all the messages you have removed from the history so far, measured as in [Measure your current usage](#measure-your-current-usage). Leave out anything still present in the messages you send, including any summary you added, because the server counts those tokens itself. Update this figure only when you replace the history this way; don’t decrement it on each request. Pass the resulting `remaining` on every request, not only the one that compacts.

For loops that resend the full uncompacted history on every request, omit `remaining` and let the server track the countdown.

## Changing the budget mid-conversation

`task_budget` is a request-level setting. To change the budget partway through a task, for example to extend it when the user broadens the request, set a new `task_budget` in `output_config` on the next request. Keep the caching consequence in mind: the budget value participates in the rendered prompt, so a changed value does not match cache entries created under the old one (see [Feature support](#feature-support)).

## Task budgets are advisory, not enforced

Task budgets are a **soft hint, not a hard cap**. Claude might occasionally exceed the budget if it is in the middle of an action that would be more disruptive to interrupt than to complete. The enforced limit on total output tokens is still `max_tokens`, which truncates the response with `stop_reason: "max_tokens"` when reached.

For a hard cap on cost or latency, combine task budgets with a reasonable `max_tokens` value:

-   Use `task_budget` to give Claude a target to pace against.
-   Use `max_tokens` as the absolute ceiling that prevents runaway generation.

Because `task_budget` spans the full agentic loop (potentially many requests) whereas `max_tokens` caps each individual request, the two values are independent; one is not required to be at or below the other.

## Choosing a budget

The right budget depends on how much work your agentic loop currently does. Rather than guessing, measure your existing token usage first and then tune from there.

### Measure your current usage

Run a representative sample of tasks **without** `task_budget` set and record the total tokens Claude spends for each task. For an agentic loop, sum `usage.output_tokens` across every request in the loop, plus the tokens of the tool results you append between requests:

Run this across a representative set of tasks and record the distribution. Start with the p99 of your per-task token spend to understand how providing the model with a task budget might modify the model’s behavior, then test up or down as needed.

The minimum accepted `task_budget.total` is **20,000 tokens** on every model that supports task budgets (see [Feature support](#feature-support)). Smaller values return a 400 error.

## Interaction with other parameters

-   **`max_tokens`:** Orthogonal to task budgets. `max_tokens` is a hard per-request cap on generated tokens, whereas `task_budget` is an advisory cap across the full agentic loop (potentially spanning many requests). At `xhigh` or `max` effort, set `max_tokens` to at least 64k to give Claude room to think and act on each request.
-   **[Effort](https://platform.claude.com/docs/en/build-with-claude/effort):** Effort controls how deeply Claude reasons about each step. Task budgets control how much total work Claude does across an agentic loop. The two are complementary: effort tunes depth, and task budgets tune breadth.
-   **[Adaptive thinking](https://platform.claude.com/docs/en/build-with-claude/thinking):** Task budgets include thinking tokens in the count, so adaptive thinking scales down as the budget depletes.
-   **[Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching):** The budget-countdown marker is injected server-side on each request, so it does not match across requests. If your client decrements `task_budget.remaining` on each follow-up request, the changed value invalidates any cache prefix that contains it. To preserve caching, set the budget once on the initial request and let the model self-regulate against the server-side countdown rather than mutating the budget client-side.

## Feature support

| Model | Support |
| --- | --- |
| Claude Fable 5.1 | Beta (set `task-budgets-2026-03-13` header) |
| Claude Mythos 5.1 | Beta (set `task-budgets-2026-03-13` header) |
| Claude Opus 5.5 | Beta (set `task-budgets-2026-03-13` header) |
| Claude Opus 5 | Beta (set `task-budgets-2026-03-13` header) |
| Claude Fable 5 | Beta (set `task-budgets-2026-03-13` header) |
| Claude Mythos 5 | Beta (set `task-budgets-2026-03-13` header) |
| Claude Sonnet 5.5 | Beta (set `task-budgets-2026-03-13` header) |
| Claude Sonnet 5 | Not supported |
| Claude Haiku 5.5 | Beta (set `task-budgets-2026-03-13` header) |
| Claude Opus 4.8 | Beta (set `task-budgets-2026-03-13` header) |
| Claude Opus 4.7 | Beta (set `task-budgets-2026-03-13` header) |
| Claude Opus 4.6 | Not supported |
| Claude Sonnet 4.6 | Not supported |
| Claude Haiku 4.5 | Not supported |

Task budgets are not supported on [Claude Code](https://code.claude.com/docs/en/overview) or Cowork surfaces. Use task budgets directly through the Messages API on a [supported model](#feature-support).

## Next steps

Control how thoroughly Claude reasons about each step of an agentic loop.

Let Claude determine when and how much to use extended thinking.

Manage context in long-running conversations with server-side compaction.

Reduce cost and latency on repeated prompts by caching prompt prefixes.

## Availability

Task budgets are in beta on select models.

### API support

Beta headers allow you to access experimental features and new model capabilities before they become part of the standard API.
