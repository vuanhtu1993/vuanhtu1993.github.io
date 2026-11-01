---
title: "Subscribe to webhooks"
source_url: "https://platform.claude.com/docs/en/managed-agents/webhooks"
crawled_at: "2026-11-01T16:25:17.453Z"
---

Get notified when major events occur without polling.

Sessions are long-running interactions. Although most real-time interactions occur through the [SSE event stream](https://platform.claude.com/docs/en/managed-agents/events-and-streaming), webhooks notify you of major state changes.

Webhook events return the event `type` and `id`, not the full object. When you receive a webhook event, you need to fetch the object directly with a `GET` call. This avoids delivering stale data on retries and keeps every delivery small.

## Supported event types

Some of these events are named differently from the matching events on the session’s [event stream](https://platform.claude.com/docs/en/managed-agents/events-and-streaming). For example, the stream’s `session.status_idle` and `session.status_running` correspond to the `session.status_idled` and `session.status_run_started` webhook events.

| Event | Trigger |
| --- | --- |
| `session.status_run_started` | The agent started running. This triggers at every session status transition to `running`. |
| `session.status_idled` | Agent awaiting input, for example, a tool permission approval or a new user message. |
| `session.budget_reached` | The session reached its [budget](https://platform.claude.com/docs/en/managed-agents/budgets) and paused. Fires at most once for each budget value you set; changing the budget arms it again. |
| `session.status_rescheduled` | A transient error occurred and the session is retrying automatically. |
| `session.status_terminated` | The session terminated, either because of an unrecoverable error or because it was archived. |
| `session.thread_created` | New [multiagent thread](https://platform.claude.com/docs/en/managed-agents/session-threads) opened: an additional agent called by the agent that the session runs is starting work, or the session’s [advisor](https://platform.claude.com/docs/en/managed-agents/multiagent-orchestration#give-the-session-an-advisor) is being consulted. It also fires for each thread of a [workflow run](https://platform.claude.com/docs/en/managed-agents/workflow-runs#a-runs-threads), and so do the other two thread events in this table. |
| `session.thread_idled` | An agent in a [multiagent interaction](https://platform.claude.com/docs/en/managed-agents/session-threads) is waiting for input. |
| `session.thread_terminated` | A [multiagent thread](https://platform.claude.com/docs/en/managed-agents/session-threads) terminated, either because the thread was archived or because it exhausted its retries. A subagent that finishes its work goes `idle`, not `terminated` (an advisor thread terminates once its consultation completes, and a workflow run’s threads terminate when the server archives them, by the end of the run). Fires for child threads only; the primary thread’s end, including archiving the whole session, surfaces only as `session.status_terminated`. |
| `session.outcome_evaluation_ended` | [Outcome evaluation](https://platform.claude.com/docs/en/managed-agents/define-outcomes) for a single iteration completed. |
| `session.updated` | Session properties changed (for example, its name or configuration was updated). |
| `session.deleted` | Session permanently deleted. There is no object left to fetch, so treat the event itself as final. |

## Register an endpoint

In the Claude Console, go to the [Webhooks](https://platform.claude.com/settings/workspaces/default/webhooks) page (`platform.claude.com/settings/workspaces/default/webhooks`). Each endpoint belongs to one workspace. Select the workspace you want in the workspace picker in the sidebar.

A webhook endpoint consists of:

-   **URL:** Must be HTTPS on port 443 with a publicly resolvable hostname.
-   **Event types:** The list of `data.type` values this endpoint receives. An endpoint only receives events it’s subscribed to.
-   **Signing secret:** A 32-byte `whsec_`\-prefixed secret generated at creation. It’s shown only once, so store it securely to verify webhook deliveries.

## Verify the signature

Every delivery carries the `webhook-id`, `webhook-timestamp`, and `webhook-signature` headers. Use the SDK’s `unwrap()` helper to verify the signature and parse the event in one step. It throws if the signature is invalid or the payload is more than 5 minutes old.

Set `ANTHROPIC_WEBHOOK_SIGNING_KEY` to the `whsec_`\-prefixed secret shown at endpoint creation.

## Handle an event

Parse the body, switch on `data.type`, and fetch the resource by ID. Return any `2xx` to acknowledge. Any other response counts against the endpoint: a `3xx` disables it immediately (redirects are never followed), whereas other failures are retried; see [Delivery behavior](#delivery-behavior) for the retry and auto-disable rules.

Every event payload has the same structure, including the event type, the identifier, and the timestamp of when the event occurred.

The top-level `event.id` is unique for each event, not for each delivery. If you receive the same `event.id` twice, it’s a retry and you can discard it.

## Delivery behavior

-   **Duplicates:** An endpoint can receive the same event more than once, and every attempt delivers the same top-level `event.id` (the same value as the `webhook-id` header). Deduplicate on it.
    
-   **Subscription scope:** An event is delivered only to endpoints subscribed to its type at the moment it’s emitted. An event emitted while no endpoint is subscribed to its type is never delivered, and subscribing later doesn’t backfill it, so subscribe to an event type before you need it.
    
-   **Ordering:** Events aren’t guaranteed to be delivered in the order they occurred: `session.status_idled` might arrive before `session.outcome_evaluation_ended` even if the outcome was produced first, and a `.deleted` event can arrive before the `.archived` event for the same resource. Drive your state from the resource you fetch, not from the order events arrive in.
    
-   **Retries:** For each endpoint and event, Anthropic makes up to three delivery attempts (a response that triggers auto-disable, described later in this section, is never retried) with jittered exponential backoff between 5 and 120 seconds. Every attempt delivers the same `event.id`. After the last attempt fails, the event is dropped: it isn’t queued for later delivery and there’s no signal that it was lost. Webhooks aren’t a durable log, so if you need to observe every transition, reconcile by listing or fetching the resource through the API.
    
-   **Timestamps:** The `webhook-timestamp` header is stamped when a delivery attempt is signed and is regenerated on every retry, so retries aren’t rejected by the SDK’s freshness check. It’s the clock for the delivery attempt, not for the event: use the event payload’s `created_at` for when the event occurred.
    
-   **Auto-disable:** An endpoint is automatically set to `disabled` with a machine-readable `disabled_reason` in three cases:
    
    -   The endpoint returns a `3xx` response. Redirects are never followed; this disables the endpoint immediately, on the first attempt, with the reason `auto-disabled: endpoint URL returned a redirect (3xx)`. If your endpoint moves, update the URL in Console and re-enable the endpoint.
    -   The endpoint’s URL resolves to a non-public IP address when Anthropic connects. This disables the endpoint immediately, with the reason `auto-disabled: endpoint URL resolved to an invalid address`.
    -   Deliveries to the endpoint fail continuously for a sustained period, with the reason `auto-disabled after sustained delivery failures`. The trigger is how long the endpoint has been failing without interruption, not a delivery count. A single `2xx` resets the window, so one event that fails intermittently can’t disable the endpoint.
    
    All three are reversible: re-enable the endpoint in Console after you resolve the issue. Events emitted while the endpoint was disabled aren’t replayed.
    

## Availability

Webhooks are in beta on every model.

### API support

Beta headers allow you to access experimental features and new model capabilities before they become part of the standard API.
