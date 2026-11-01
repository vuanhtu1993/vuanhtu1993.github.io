---
title: "Session event stream"
source_url: "https://platform.claude.com/docs/en/managed-agents/events-and-streaming"
crawled_at: "2026-11-01T16:24:57.314Z"
---

Send events, stream responses, and interrupt or redirect your session while it runs.

Communication with Claude Managed Agents is event-based. You open a stream to follow a session, send events to direct it, and answer it when it pauses for input.

## Event types

Events flow in two directions: you send events to the agent, and the session sends events back to you.

-   **Events you send:** `user.*` events start a session and steer it as it progresses. [`system.message`](#send-system-messages) events append system-level context.
-   **Events you receive:** Session events, span events, and agent events report the session’s state and the agent’s progress.

These event type strings follow a `{domain}.{action}` naming convention. See [Event types](https://platform.claude.com/docs/en/managed-agents/reference#event-types) in the reference for the full catalog.

[Webhook event types](https://platform.claude.com/docs/en/managed-agents/webhooks#supported-event-types) are separate, and some of their names differ from the stream’s. For example, webhooks use `session.status_idled` rather than `session.status_idle`.

## Stream events

Stream events from the session to receive real-time updates as the agent works. A stream delivers only the events emitted after it opens, so open the stream before you send events to avoid a race condition.

The session reports errors through the `session.error` event. See [Event types](https://platform.claude.com/docs/en/managed-agents/reference#event-types) for its fields.

The agent’s response text arrives as buffered `agent.message` events, each emitted only after the model request that produced it completes. To render the text while the model is still generating it, see [Preview responses with event deltas](https://platform.claude.com/docs/en/managed-agents/event-deltas).

### Reconnect without missing events

To reconnect to an existing session without missing events, combine a new stream with the event history:

1.  Open a new stream.
2.  [List the full event history](#list-past-events) to seed a set of seen event IDs.
3.  Tail the live stream, skipping any events already returned by the history list.

## Send events

Send a `user.message` event to start or continue the agent’s work:

Every event in the session’s history includes a `processed_at` timestamp, set when the event finishes processing. On events you send, `processed_at` is `None` while the event is still queued behind earlier events. The exceptions are `user.define_outcome`, `user.custom_tool_result`, and `user.tool_result`, which are processed on receipt and echoed back with `processed_at` already populated.

## Respond when the session goes idle

A `session.status_idle` event means the agent has stopped and is waiting for input. Its `stop_reason.type` says why:

| `stop_reason.type` | Why the session stopped | What to do |
| --- | --- | --- |
| `end_turn` | The agent finished its turn, or [you interrupted it](#interrupt-the-agent). | [Send a `user.message`](#resume-an-idle-session) when you have more work for the agent. |
| `requires_action` | One or more tool calls need an answer from you, such as a custom tool call or a confirmation request. | [Answer each blocking tool call](#answer-tool-calls-that-pause-the-session). |
| `budget_reached` | The session’s tracked list cost reached its [budget](https://platform.claude.com/docs/en/managed-agents/budgets). | [Change or remove the budget](https://platform.claude.com/docs/en/managed-agents/budgets#resume-a-session-at-its-budget). |

No event you send resumes a session paused at its budget. The work that the budget paused resumes automatically when you change the budget to a value above the consumed list cost, or remove it. When the work resumes, the session emits a `workflow_run.status_running` event for each [workflow run that the budget paused](https://platform.claude.com/docs/en/managed-agents/workflow-runs#budgets-and-limits). A run that an interrupt paused stays paused; see [Resume a session at its budget](https://platform.claude.com/docs/en/managed-agents/budgets#resume-a-session-at-its-budget). See [When a session reaches its budget](https://platform.claude.com/docs/en/managed-agents/budgets#when-a-session-reaches-its-budget) for the events that mark the pause and the events the session still accepts.

## Answer tool calls that pause the session

A session pauses when the agent calls a [custom tool](https://platform.claude.com/docs/en/managed-agents/tools#custom-tools), and when a tool call needs your confirmation under a [permission policy](https://platform.claude.com/docs/en/managed-agents/permission-policies). Both pauses follow the same sequence:

1.  The session emits the tool call as an `agent.custom_tool_use`, `agent.tool_use`, or `agent.mcp_tool_use` event.
2.  The session pauses with a `session.status_idle` event whose `stop_reason.type` is `requires_action`. The blocking event IDs are in the `stop_reason.event_ids` array.
3.  For each blocking event ID, send a [`user.custom_tool_result`](#return-a-custom-tool-result) or a [`user.tool_confirmation`](#confirm-a-tool-call) event. A custom tool result doesn’t have to wait for step 2.
4.  Once all blocking events are resolved, the session transitions back to `running`.

In a multiagent session, a subagent’s blocking events are cross-posted to the primary thread. See [Tool permissions and custom tools](https://platform.claude.com/docs/en/managed-agents/session-threads#tool-permissions-and-custom-tools).

### Return a custom tool result

The `agent.custom_tool_use` event contains the tool name and input. Run the tool in your system. Then send a `user.custom_tool_result` event, passing the event ID in the `custom_tool_use_id` parameter along with the result content.

You can send the result as soon as the `agent.custom_tool_use` event arrives, without waiting for `session.status_idle`. The session still emits `session.status_idle` with a `requires_action` stop reason for the call, and your client can ignore it. A second result for the same call is accepted and has no effect.

When you [reconnect](#reconnect-without-missing-events) to a paused session, `stop_reason.event_ids` on the latest `session.status_idle` event lists the calls to answer.

The following example answers each call as it arrives:

If the agent has [workflow runs](https://platform.claude.com/docs/en/managed-agents/workflow-runs) open, a custom tool call can arrive while the session stays `running`. The `requires_action` idle event arrives only when none of the [session’s threads](https://platform.claude.com/docs/en/managed-agents/session-threads) is working. Don’t wait for it: answer each call when its `agent.custom_tool_use` event arrives. The sample in [Follow a run](https://platform.claude.com/docs/en/managed-agents/workflow-runs#follow-a-run) shows how.

### Confirm a tool call

Send a `user.tool_confirmation` event, passing the event ID in the `tool_use_id` parameter. Set `result` to `"allow"` or `"deny"`. See [Respond to confirmation requests](https://platform.claude.com/docs/en/managed-agents/permission-policies#respond-to-confirmation-requests) for which calls wait for a confirmation and how to explain a denial.

The following example approves every pending call:

The previous example approves each call after the session goes idle. If the agent has [workflow runs](https://platform.claude.com/docs/en/managed-agents/workflow-runs) open, a tool call can wait for your confirmation while the session stays `running`. Don’t wait for the idle event: when an `agent.tool_use` or `agent.mcp_tool_use` event arrives whose [`evaluated_permission`](https://platform.claude.com/docs/en/managed-agents/permission-policies#see-how-each-call-was-evaluated) is `ask`, answer it. The sample in [Follow a run](https://platform.claude.com/docs/en/managed-agents/workflow-runs#follow-a-run) answers custom tool calls this way, and its introduction says how to add confirmations.

## Resume an idle session

Sessions persist between interactions. To resume a session, send a `user.message` event to it as usual:

Conversation history is preserved unless the session is explicitly deleted. When a session goes idle, its sandbox is checkpointed. The checkpoint preserves the full sandbox state, including the filesystem, installed packages, and any files the agent created.

## Interrupt the agent

Send a `user.interrupt` event to stop the agent while it runs, then follow up with a `user.message` event to redirect it:

The call returns as soon as the events are queued. The interrupt then takes effect in this order:

1.  The agent applies the interrupt. Until then, the interrupt’s `processed_at` stays `None` and the session stays `running`. A model response in progress stops immediately, but the interrupt can take longer to apply while tool calls are running.
2.  The `user.interrupt` event appears on the stream, and the interrupted turn ends with a `session.status_idle` event.
3.  The agent starts its next turn with the `user.message` you sent after the interrupt.

The idle event’s `stop_reason.type` is `end_turn`, the same value as a turn that completes on its own. If workflow runs are open, the interrupt ends none of them. A run that’s running can keep the session `running`, so the `session.status_idle` event in step 2 might not arrive. See [Interrupt a session with runs open](https://platform.claude.com/docs/en/managed-agents/workflow-runs#interrupt-a-session-with-runs-open).

## List past events

Retrieve the full event history for a session:

Pass a `types` filter to return only specific event types:

## Send system messages

On a [supported model](#supported-models), send a `system.message` event to give the agent privileged system-level context. The context applies to the accompanying turn and all subsequent turns. Use it when the agent needs updated system-level guidance mid-session, for example a different persona, revised constraints, or context fetched at runtime.

The event’s `content` accepts 1–1,000 text items. The content is appended to the session’s system context as a `role: "system"` turn. It doesn’t replace the top-level system prompt, which the `system` field on the agent definition sets.

### Supported models

`system.message` is supported by these models:

-   Claude Fable 5.1
-   Claude Mythos 5.1
-   Claude Fable 5
-   Claude Mythos 5
-   Claude Opus 5.5
-   Claude Opus 5
-   Claude Opus 4.8
-   Claude Sonnet 5.5
-   Claude Haiku 5.5

If the agent’s primary model does not support mid-conversation system injection, the event is rejected with a `model_does_not_support_mid_conversation_system` validation error. Subagent models are not checked, because `system.message` lands on the primary thread only.

### System messages while a tool call is pending

While the session is idle with a `requires_action` stop reason, a `system.message` must trail a tool result event in the same request. Sent on its own or with a `user.message`, it is rejected until the pending tool events are resolved.

## Next steps

Render the agent’s response text while the model is still generating it.

Inspect a session in the Claude Console and read its token usage and list cost.

Get notified when major events occur without polling.

Look up every event type a session can send or receive.
