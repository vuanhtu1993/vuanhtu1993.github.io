---
title: "Work with sessions - Claude Code Docs"
source_url: "https://code.claude.com/docs/en/agent-sdk/sessions"
crawled_at: "2026-11-01T16:45:55.434Z"
---

A session is the conversation history the SDK accumulates while your agent works. It contains your prompt, every tool call the agent made, every tool result, and every response. The SDK writes it to disk automatically so you can return to it later. Returning to a session means the agent has full context from before: files it already read, analysis it already performed, decisions it already made. You can ask a follow-up question, recover from an interruption, or branch off to try a different approach.

This guide covers how to pick the right approach for your app, the SDK interfaces that track sessions automatically, how to capture session IDs and use `resume` and `fork` manually, and what to know about resuming sessions across hosts.

## Choose an approach

How much session handling you need depends on your application’s shape. Session management comes into play when you send multiple prompts that should share context. Within a single `query()` call, the agent already takes as many turns as it needs, and permission prompts and `AskUserQuestion` are [handled in-loop](https://code.claude.com/docs/en/agent-sdk/user-input) (they don’t end the call).

| What you’re building | What to use |
| --- | --- |
| One-shot task: single prompt, no follow-up | Nothing extra. One `query()` call handles it. |
| Multi-turn chat in one process | [`ClaudeSDKClient` (Python) or `continue: true` (TypeScript)](#automatic-session-management). The SDK tracks the session for you with no ID handling. |
| Pick up where you left off after a process restart | `continue_conversation=True` (Python) / `continue: true` (TypeScript). Resumes the most recent session in the directory, no ID needed. |
| Resume a specific past session (not the most recent) | Capture the session ID and pass it to `resume`. |
| Try an alternative approach without losing the original | Fork the session. |
| Stateless task, don’t want anything written to disk | Set [`persistSession: false`](https://code.claude.com/docs/en/agent-sdk/typescript#options) (TypeScript only). The session exists only in memory for the duration of the call. In Python, set [`CLAUDE_CODE_SKIP_PROMPT_HISTORY`](https://code.claude.com/docs/en/env-vars) in the `env` option to suppress transcript writes instead. |

### Continue, resume, and fork

Continue, resume, and fork are option fields you set on `query()` ([`ClaudeAgentOptions`](https://code.claude.com/docs/en/agent-sdk/python#claudeagentoptions) in Python, [`Options`](https://code.claude.com/docs/en/agent-sdk/typescript#options) in TypeScript). **Continue** and **resume** both pick up an existing session and add to it. The difference is how they find that session:

-   **Continue** finds the most recent session in the current directory. You don’t track anything. Works well when your app runs one conversation at a time.
-   **Resume** takes a specific session ID. You track the ID. Required when you have multiple sessions (for example, one per user in a multi-user app) or want to return to one that isn’t the most recent.

**Fork** is different: it creates a new session that starts with a copy of the original’s history. The original stays unchanged. Use fork to try a different direction while keeping the option to go back.

## Automatic session management

Both SDKs offer an interface that tracks session state for you across calls, so you don’t pass IDs around manually. Use these for multi-turn conversations within a single process.

### Python: `ClaudeSDKClient`

[`ClaudeSDKClient`](https://code.claude.com/docs/en/agent-sdk/python#claudesdkclient) handles session IDs internally. Each call to `client.query()` automatically continues the same session. Call [`client.receive_response()`](https://code.claude.com/docs/en/agent-sdk/python#claudesdkclient) to iterate over the messages for the current query. Use the client as an async context manager so connection setup and teardown are handled for you, or call `connect()` and `disconnect()` manually. This example runs two queries against the same `client`. The first asks the agent to analyze a module; the second asks it to refactor that module. Because both calls go through the same client instance, the second query has full context from the first without any explicit `resume` or session ID:

Python

Each query prints the agent’s text response followed by a status line from the result message, such as `[done: success, cost: $0.0042]`. See the [Python SDK reference](https://code.claude.com/docs/en/agent-sdk/python#choosing-between-query-and-claudesdkclient) for details on when to use `ClaudeSDKClient` vs the standalone `query()` function.

### TypeScript: `continue: true`

The TypeScript SDK doesn’t have a session-holding client object like Python’s `ClaudeSDKClient`. Instead, pass `continue: true` on each subsequent `query()` call and the SDK picks up the most recent session in the current directory. No ID tracking required. This example makes two separate `query()` calls. The first creates a fresh session; the second sets `continue: true`, which tells the SDK to find and resume the most recent session on disk. The agent has full context from the first call:

TypeScript

## Use session options with `query()`

### Capture the session ID

Resume and fork require a session ID. Read it from the `session_id` field on the result message ([`ResultMessage`](https://code.claude.com/docs/en/agent-sdk/python#resultmessage) in Python, [`SDKResultMessage`](https://code.claude.com/docs/en/agent-sdk/typescript#sdkresultmessage) in TypeScript), which is present on every result regardless of success or error. In TypeScript the ID is also available earlier as a direct field on the init `SystemMessage`; in Python it’s nested inside `SystemMessage.data`.

When the query completes, the script prints the agent’s response followed by a line such as `Session ID: 5b3f2c1a-8d4e-4f6b-9a7c-2e1d0f9b8a6c`. In the next sections, you pass this ID to `resume`.

### Resume by ID

Pass a session ID to `resume` to return to that specific session. The agent picks up with full context from wherever the session left off. Common reasons to resume:

-   **Follow up on a completed task.** The agent already analyzed something; now you want it to act on that analysis without re-reading files.
-   **Recover from a limit.** The first run ended with `error_max_turns` or `error_max_budget_usd` (see [Handle the result](https://code.claude.com/docs/en/agent-sdk/agent-loop#handle-the-result)); resume with a higher limit. In a single-shot `query()` call the SDK raises after yielding that error result, so catch the error before resuming.
-   **Restart your process.** You captured the ID before shutdown and want to restore the conversation.

This example resumes the session from [Capture the session ID](#capture-the-session-id) with a follow-up prompt. Because you’re resuming, the agent already has the prior analysis in context:

You should see a response that builds on the earlier analysis instead of starting fresh. That confirms the agent resumed the session with its prior context intact.

To resume sessions across machines or in serverless environments, mirror transcripts to shared storage with a [`SessionStore` adapter](https://code.claude.com/docs/en/agent-sdk/session-storage).

### Fork to explore alternatives

Forking creates a new session that starts with a copy of the original’s history but diverges from that point. The fork gets its own session ID; the original’s ID and history stay unchanged. You end up with two independent sessions you can resume separately.

This example builds on [Capture the session ID](#capture-the-session-id): you’ve already analyzed an auth module in `session_id` and want to explore OAuth2 without losing the JWT-focused thread. The first block forks the session and captures the fork’s ID (`forked_id`); the second block resumes the original `session_id` to continue down the JWT path. You now have two session IDs pointing at two separate histories:

You should see that `forkedId` differs from the original session ID. Resuming the original session still continues the JWT thread, which confirms the fork did not modify the original history.

## Resume across hosts

Session files are local to the machine that created them. To resume a session on a different host (CI workers, ephemeral containers, serverless), pick the approach that fits:

-   **Pass a session store.** Attach a [`sessionStore` / `session_store` adapter](https://code.claude.com/docs/en/agent-sdk/session-storage) so the SDK mirrors transcripts to your own backend and another host can resume them. The store lookup key derives from the working directory, so resume from a `cwd` matching the original run’s.
-   **Move the session file.** Persist `~/.claude/projects/<encoded-cwd>/<session-id>.jsonl` from the first run and restore it inside any directory under `~/.claude/projects/` on the new host before calling `resume`. Claude Code searches beyond the current project directory to find the ID; see [Resume a session](https://code.claude.com/docs/en/sessions#where-the-session-picker-looks) for the exact lookup order and how duplicate copies are handled. Before v2.1.223, the lookup was scoped to the current project directory and its git worktrees; SDK versions that bundle an older CLI still behave this way.
-   **Don’t rely on session resume.** Capture the results you need (analysis output, decisions, file diffs) as application state and pass them into a fresh session’s prompt. This is often more robust than shipping transcript files around.

Both SDKs expose functions for enumerating sessions on disk and reading their messages: [`listSessions()`](https://code.claude.com/docs/en/agent-sdk/typescript#listsessions) and [`getSessionMessages()`](https://code.claude.com/docs/en/agent-sdk/typescript#getsessionmessages) in TypeScript, [`list_sessions()`](https://code.claude.com/docs/en/agent-sdk/python#list_sessions) and [`get_session_messages()`](https://code.claude.com/docs/en/agent-sdk/python#get_session_messages) in Python. Use them to build custom session pickers, cleanup logic, or transcript viewers. Both SDKs also expose functions for looking up and mutating individual sessions: [`get_session_info()`](https://code.claude.com/docs/en/agent-sdk/python#get_session_info), [`rename_session()`](https://code.claude.com/docs/en/agent-sdk/python#rename_session), and [`tag_session()`](https://code.claude.com/docs/en/agent-sdk/python#tag_session) in Python, and [`getSessionInfo()`](https://code.claude.com/docs/en/agent-sdk/typescript#getsessioninfo), [`renameSession()`](https://code.claude.com/docs/en/agent-sdk/typescript#renamesession), and [`tagSession()`](https://code.claude.com/docs/en/agent-sdk/typescript#tagsession) in TypeScript. Use them to organize sessions by tag or give them human-readable titles.

-   [How the agent loop works](https://code.claude.com/docs/en/agent-sdk/agent-loop): Understand turns, messages, and context accumulation within a session
-   [File checkpointing](https://code.claude.com/docs/en/agent-sdk/file-checkpointing): Snapshot and revert file changes the agent made within a session
-   [Python `ClaudeAgentOptions`](https://code.claude.com/docs/en/agent-sdk/python#claudeagentoptions): Full session option reference for Python
-   [TypeScript `Options`](https://code.claude.com/docs/en/agent-sdk/typescript#options): Full session option reference for TypeScript
