---
title: "Build an orchestration mode"
source_url: "https://platform.claude.com/docs/en/build-with-claude/mid-conversation-effort-example"
crawled_at: "2026-11-01T16:20:03.025Z"
---

Build a session-level mode that grants standing consent for multiagent fan-out, switched on and off with mid-conversation system messages.

An orchestration mode is a session-level switch: when it is on, the model puts maximum thoroughness behind every substantive request, scouting the task itself and then fanning work out to parallel subagents by default. When it is off, the same orchestration tool goes back to per-request opt-in.

The mode is not an API parameter. It is built entirely from documented pieces:

1.  **An effort level:** requests run at a documented [Effort](https://platform.claude.com/docs/en/build-with-claude/effort) value such as `xhigh`. There is no hidden level above the ones on that page. This example sets effort at the top level of each request, which needs no beta header.
2.  **A mode reminder:** a [mid-conversation system message](https://platform.claude.com/docs/en/build-with-claude/mid-conversation-system-messages) tells the model the mode is active, with a one-line refresher every several turns and an exit notice when the mode is turned off. The top-level `system` field never changes, so the cached prefix stays intact.
3.  **Standing consent in the tool description:** the orchestration tool’s description states that while the mode is on, the model should author and run a workflow for every substantive task without asking first.

## Set up the loop

The example is a single file. The constants control the effort level, the fan-out shape, and how often the mode refresher is re-sent. `MAX_CONCURRENT` caps how many subagents run at the same time (the PHP port is sequential and ignores it); `MAX_TOTAL_SUBTASKS` caps how many the model may queue in a single Workflow call. Splitting the two lets the model plan a large backlog without launching it all at once. The `DOC_TEST_MODE` check caps the loops to a single turn when that environment variable is set, so the automated docs harness can validate that the file compiles and completes quickly without running the full orchestration; leave it unset when running the example yourself.

## Define the mode reminders

The reminders are short on purpose. They flip the mode and point at the tool description, where the heavyweight instructions live. The full text is sent once when the mode turns on, the refresher is re-sent only after several user turns, and the exit notice is sent once when the mode turns off.

## Grant standing consent in the tool description

The Workflow tool carries the real behavioral contract: the opt-in rule, the standing consent that applies while the mode is on, granularity guidance for sizing the fan-out, and the quality patterns the model can reach for (a verification wave, a completeness critic, multiphase sequencing). Subagents also get a `report_findings` tool so their results come back as structured JSON instead of prose, and the bash tool is the Anthropic-defined `bash_20250124` tool run locally.

## Run the bash tool locally

The bash handler runs the requested command with a timeout, captures combined stdout and stderr, and truncates the result so a runaway command can’t flood the context window. Commands run in the directory you launch the example from, so pointing it at a project means starting it there; when `DOC_TEST_MODE` is set, the harness instead gives bash a small throwaway fixture directory that is removed on exit. There is no sandbox here: the command runs with the permissions of the process that launched the example. For clarity this example runs each call in a fresh subshell rather than maintaining the persistent session the `bash_20250124` contract describes; a production agent should back the tool with a long-lived shell so that working directory, environment, and the `restart` action behave as documented.

## Run one subagent

Each workflow subtask becomes its own small agent loop with the bash tool, running at the same effort as the main loop. A per-request timeout bounds each API call so a dropped connection degrades one subagent instead of stalling the whole run.

## Journal results so reruns resume

A fan-out that spawns dozens of subagents is expensive to restart from the beginning. A small content-addressed journal makes it idempotent: before dispatching a subagent, look up the SHA-256 of its prompt in a local JSON file, and return the recorded result if one exists. Interrupt the run, rerun it, and only the subtasks that never completed are recomputed. The journal deduplicates across runs, not within a single fan-out wave; delete the journal file to start fresh.

## Fan out, then verify

The fan-out accepts up to `MAX_TOTAL_SUBTASKS` prompts, runs them through the journal with at most `MAX_CONCURRENT` in flight (sequential in the PHP port), and isolates failures so one broken subagent degrades to an error string instead of ending the run. Once the first wave completes, a second wave reuses the same subagent path to attempt to refute each result: every verifier re-derives the claims from the source, defaulting to refuted when uncertain. Both the original result and its verdict are returned to the orchestrator so it can weigh them together.

## Toggle the mode with mid-conversation system messages

The agent appends the user’s message first, then any system messages that are due: the exit notice, the full mode text on entry, or the periodic refresher. Placing the system message after the user turn keeps every cached byte ahead of it untouched, and satisfies the placement rule that a system message follows a user turn.

## Run it

Start the example from the directory you want the agents to work in, for example the root of a repository to review:

With the mode on, expect the model to scout with a few bash commands, dispatch the Workflow tool unprompted, and synthesize the subagent reports into a final answer. Trivial or conversational requests stay solo, as the reminder instructs.

## Toward a production harness

This example is deliberately small. A harness meant for real workloads would typically add:

-   **Sandboxed orchestration scripts:** let the model emit a short orchestration program (branching, loops, and reduce steps) and run it inside an isolated interpreter, rather than accepting only a flat list of subtask strings.
-   **Durable journaling:** replace the local JSON file with a store that survives process restarts and is safe under concurrent writers across machines.
-   **Budget enforcement:** track total subagents launched across the whole session, not just for each Workflow call, and refuse to exceed a hard cap so a runaway plan cannot exhaust your quota.

The patterns in this example (the mode reminders, standing consent in the tool description, journaling, and a verification wave) carry over unchanged; only the execution substrate around them gets more robust.

The mechanism the mode reminders use, and how it interacts with prompt caching.

The effort levels the API accepts and how to choose one.

Defining tools, handling tool calls, and tool results.

The Anthropic-defined bash tool this example runs locally.
