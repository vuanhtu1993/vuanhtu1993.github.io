---
title: "Sessions - Claude API Reference"
source_url: "https://platform.claude.com/docs/en/api/beta/sessions"
crawled_at: "2026-11-01T16:22:25.571Z"
---

##### Models

BetaManagedAgentsAdvisorParams object{ type: "advisor", model }

Platform advisor roster entry: a model the session's primary thread may consult mid-turn. At most one per roster; the entry occupies the roster name `anthropic.advisor`.

type: "advisor"

model: string

A Claude model id. The model must be permitted as an advisor for this agent's model.

minLength1

maxLength256

BetaManagedAgentsAgentMessagePreview object{ type: "agent.message", id }

type: "agent.message"

id: string

The id the buffered agent.message will carry if it is emitted. Matches the event\_id on this preview's event\_delta events.

BetaManagedAgentsAgentParams object{ type: "agent", id, version }

Specification for an Agent. Provide a specific `version` or use the short-form `agent="agent_id"` for the most recent version

type: "agent"

id: string

The `agent` ID.

minLength1

maxLength128

version: optional number

The specific `agent` version to use. Omit to use the latest version. Must be at least 1 if specified.

formatint32

BetaManagedAgentsAgentThinkingPreview object{ type: "agent.thinking", id }

type: "agent.thinking"

id: string

The id the buffered agent.thinking will carry if it is emitted. Start-only — no event\_delta events follow.

BetaManagedAgentsAgentWithOverridesParams object{ type: "agent\_with\_overrides", id, mcp\_servers, 5 more }

Reference to an `agent` plus optional configuration overrides. Each provided field replaces the agent's value for the caller's use; the agent resource is unchanged.

BetaManagedAgentsBranchCheckout object{ type: "branch", name }

type: "branch"

name: string

Branch name to check out.

minLength1

maxLength255

BetaManagedAgentsBudgetLimit object{ type: "limit", max\_list\_cost }

A hard spend ceiling. The session stops issuing new model requests once the tracked list cost reaches `max_list_cost`.

type: "limit"

Maximum list cost the session may accrue. List price is used regardless of any negotiated discount, so the cap fires at or before the actual charge.

amount: string

Amount in minor units of the currency, as an integer decimal string with no leading zeros: "2500" is $25.00 and "50" is fifty cents. A string rather than a number so no float rounding is ever applied.

Uppercase ISO-4217 currency code. `USD` is the only currency currently supported; the accepted set is closed and grows only when a new currency is priced.

BetaManagedAgentsCacheCreationUsage object{ ephemeral\_1h\_input\_tokens, ephemeral\_5m\_input\_tokens }

Prompt-cache creation token usage broken down by cache lifetime.

ephemeral\_1h\_input\_tokens: optional number

Tokens used to create 1-hour ephemeral cache entries.

formatint32

ephemeral\_5m\_input\_tokens: optional number

Tokens used to create 5-minute ephemeral cache entries.

formatint32

BetaManagedAgentsCommitCheckout object{ type: "commit", sha }

type: "commit"

sha: string

Full commit SHA to check out.

minLength7

maxLength64

BetaManagedAgentsDeletedSession object{ type: "session\_deleted", id }

Confirmation that a `session` has been permanently deleted.

type: "session\_deleted"

id: string

BetaManagedAgentsDeltaContent object{ type: "content\_delta", content, index }

type: "content\_delta"

A partial element of the content array at index, typed like the element itself — the same shape the buffered agent.message carries in content.

type: "text"

text: string

The text content.

minLength1

index: optional number

Which entry in the previewed event's content array this fragment lands in. Insert content as that entry when the index is new; append to the existing entry otherwise.

BetaManagedAgentsDeltaEvent object{ type: "event\_delta", delta, event\_id }

An incremental update to an event that is still being streamed. Deltas are best-effort and may stop early; when the buffered event with id == event\_id is produced it carries the complete content. A model request that ends early (an error or interrupt) produces no buffered event — its terminal span.model\_request\_end closes the preview. Only sent on stream connections that opt in via event\_deltas; never appears in event history.

BetaManagedAgentsDeltaType = "agent.message" or "agent.thinking"

One of the following:

"agent.message"

"agent.thinking"

BetaManagedAgentsFileResourceParams object{ type: "file", file\_id, mount\_path }

Mount a file uploaded via the Files API into the session.

type: "file"

file\_id: string

ID of a previously uploaded file.

minLength1

maxLength128

mount\_path: optional string or null

Mount path in the container. Defaults to `/mnt/session/uploads/<file_id>`.

minLength1

maxLength4096

BetaManagedAgentsGitHubRepositoryResourceParams object{ type: "github\_repository", url, authorization\_token, 2 more }

Mount a GitHub repository into the session's container.

BetaManagedAgentsMemoryStoreResourceParam object{ type: "memory\_store", memory\_store\_id, access, instructions }

Parameters for attaching a memory store to an agent session.

type: "memory\_store"

memory\_store\_id: string

The memory store ID (memstore\_...). Must belong to the caller's organization and workspace.

access: optional "read\_write" or "read\_only" or null

Access mode for the mounted store. Defaults to read\_write. read\_only mounts the store as a read-only filesystem.

One of the following:

"read\_write"

"read\_only"

instructions: optional string or null

Per-attachment guidance for the agent on how to use this store. Rendered into the memory section of the system prompt. Max 4096 chars.

maxLength4096

Resolved multiagent orchestration configuration as returned in API responses.

One of the following:

BetaManagedAgentsMultiagentCoordinator object{ type: "coordinator", agents }

Resolved coordinator topology with a concrete agent roster.

BetaManagedAgentsMultiagent20261001 object{ type: "multiagent\_20261001", advisor, subagents, workflows }

Resolved multiagent configuration with three members, each enabled or disabled on its own.

Multiagent orchestration configuration.

One of the following:

BetaManagedAgentsMultiagentCoordinatorParams object{ type: "coordinator", agents }

A coordinator topology: the session's primary thread orchestrates work by spawning session threads, each running an agent drawn from the `agents` roster.

BetaManagedAgentsMultiagent20261001Params object{ type: "multiagent\_20261001", advisor, subagents, workflows }

Multiagent configuration with three members, each enabled or disabled on its own. On an update, if the agent's stored `multiagent` also has type `multiagent_20261001`, this configuration is merged into the stored one, level by level, instead of replacing it. A key that the update omits keeps its stored value. A key sent as null takes its default, on create as well, so `"workflows": null` enables workflows. An object sent with a `type` other than the stored one replaces the stored object, and the keys that it omits take their defaults. A `predefined_agents` list that is sent replaces the stored list. Every object that is sent needs its `type`, and an enabled `advisor` needs its `model`. Other validation applies to the merged result.

An entry in a multiagent roster: an agent ID string, a versioned agent reference, or `self`.

One of the following:

BetaManagedAgentsOutcomeEvaluationResource object{ type: "outcome\_evaluation", completed\_at, description, 4 more }

Evaluation state for a single outcome defined via a `define_outcome` event.

type: "outcome\_evaluation"

completed\_at: string or null

When the outcome reached a terminal result. Null while `pending`/`running`/`evaluating`.

formatdate-time

description: string

What the agent should produce.

explanation: string or null

Grader's verdict text from the most recent evaluation. For `satisfied`, explains why criteria are met; for `needs_revision` (intermediate), what's missing; for `failed`, why unrecoverable.

iteration: number

0-indexed revision cycle the outcome is currently on.

formatint32

outcome\_id: string

Server-generated outc\_ ID for this outcome.

result: string

Current evaluation state. `pending` before the agent begins work; `running` while producing or revising; `evaluating` while the grader scores; `satisfied`/`max_iterations_reached`/`failed`/`interrupted` are terminal.

BetaManagedAgentsServerToolUsage object{ web\_fetch\_requests, web\_search\_requests }

Cumulative count of server-executed tool invocations, broken down by tool.

web\_fetch\_requests: optional number

Number of server-executed web fetch requests.

formatint32

web\_search\_requests: optional number

Number of server-executed web search requests.

formatint32

BetaManagedAgentsSession object{ type: "session", id, agent, 14 more }

A Managed Agents `session`.

BetaManagedAgentsSessionAgent object{ type: "agent", id, description, 9 more }

Resolved `agent` definition for a `session`. Snapshot of the `agent` at `session` creation time.

BetaManagedAgentsSessionAgentUpdate object{ mcp\_servers, tools }

Mid-session agent configuration update. Only `tools` and `mcp_servers` are updatable. Full replacement: the provided array becomes the new value. To preserve existing entries, GET the session, modify the array, and POST it back.

Resolved multiagent orchestration configuration as returned on a `session`.

One of the following:

BetaManagedAgentsSessionMultiagentCoordinator object{ type: "coordinator", agents }

Resolved coordinator topology with full agent definitions for each roster member.

BetaManagedAgentsSessionMultiagent20261001 object{ type: "multiagent\_20261001", advisor, subagents, workflows }

Resolved multiagent configuration with three members, as copied to the `session` at creation.

BetaManagedAgentsSessionMultiagentCoordinator object{ type: "coordinator", agents }

Resolved coordinator topology with full agent definitions for each roster member.

Whether the agent can spawn session threads.

One of the following:

BetaManagedAgentsSessionMultiagentSubagentsEnabled object{ type: "enabled", inline\_agents, predefined\_agents }

The agent can spawn session threads.

BetaManagedAgentsMultiagentSubagentsDisabled object{ type: "disabled" }

The agent cannot spawn session threads.

type: "disabled"

BetaManagedAgentsSessionMultiagentSubagentsEnabled object{ type: "enabled", inline\_agents, predefined\_agents }

The agent can spawn session threads.

Whether the agent can start workflow runs.

One of the following:

BetaManagedAgentsSessionMultiagentWorkflowsEnabled object{ type: "enabled", inline\_agents, predefined\_agents }

The agent can start workflow runs.

BetaManagedAgentsMultiagentWorkflowsDisabled object{ type: "disabled" }

The agent cannot start workflow runs.

type: "disabled"

BetaManagedAgentsSessionMultiagentWorkflowsEnabled object{ type: "enabled", inline\_agents, predefined\_agents }

The agent can start workflow runs.

BetaManagedAgentsSessionMultiagent20261001 object{ type: "multiagent\_20261001", advisor, subagents, workflows }

Resolved multiagent configuration with three members, as copied to the `session` at creation.

BetaManagedAgentsSessionStats object{ active\_seconds, duration\_seconds }

Timing statistics for a session.

active\_seconds: optional number

Cumulative time in seconds the session spent in `running` status. Excludes idle time.

formatdouble

duration\_seconds: optional number

Elapsed time since session creation in seconds. For terminated sessions, frozen at the final update.

formatdouble

BetaManagedAgentsSessionUpdatedEvent object{ type: "session.updated", id, processed\_at, 4 more }

Emitted when an UpdateSession request changed at least one field. Carries only the fields that changed; absent fields were not part of the update. The new configuration applies from the next turn.

BetaManagedAgentsSessionUsage object{ active\_seconds, cache\_creation, cache\_read\_input\_tokens, 4 more }

Cumulative token usage for a session across all turns.

BetaManagedAgentsSessionUsageEvent object{ type: "session.usage", id, processed\_at, 2 more }

Periodic snapshot of the session's cumulative usage and tracked list cost.

BetaManagedAgentsStartEvent object{ type: "event\_start", event }

Opens a preview of a buffered event. Carries the previewed event's type and id only. Followed by zero or more event\_delta events with the same event id, normally concluded by the buffered event carrying that id. If the producing model request ends without that event (an error or interrupt mid-stream), its terminal span.model\_request\_end closes the preview. Only sent on stream connections that opt in via event\_deltas; never appears in event history.

One of the following:

BetaManagedAgentsAgentMessagePreview object{ type: "agent.message", id }

type: "agent.message"

id: string

The id the buffered agent.message will carry if it is emitted. Matches the event\_id on this preview's event\_delta events.

BetaManagedAgentsAgentThinkingPreview object{ type: "agent.thinking", id }

type: "agent.thinking"

id: string

The id the buffered agent.thinking will carry if it is emitted. Start-only — no event\_delta events follow.

BetaManagedAgentsSystemContentBlock object{ type: "text", text }

Content block in a mid-conversation system message. Text-only.

type: "text"

text: string

The text content.

minLength1

BetaManagedAgentsSystemMessageEvent object{ type: "system.message", id, content, processed\_at }

A mid-conversation system message event. Carries system-role content that is appended to the session as a `role: "system"` turn.

type: "system.message"

id: string

Unique identifier for this event.

System content blocks. Text-only.

type: "text"

text: string

The text content.

minLength1

processed\_at: optional string or null

Timestamp when this system message was processed.

formatdate-time

BetaManagedAgentsUserToolResultEvent object{ type: "user.tool\_result", id, tool\_use\_id, 4 more }

Event sent by the client providing the result of an agent-toolset tool execution. Only valid on `self_hosted` environments, where sandbox-routed tools are executed by the client rather than the server.
