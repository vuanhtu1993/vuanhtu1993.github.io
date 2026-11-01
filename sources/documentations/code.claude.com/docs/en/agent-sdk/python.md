---
title: "Agent SDK reference - Python - Claude Code Docs"
source_url: "https://code.claude.com/docs/en/agent-sdk/python"
crawled_at: "2026-11-01T16:44:40.283Z"
---

## Installation

Install the package into a virtual environment. On recent Debian, Ubuntu, and Homebrew Python installs, running `pip install` against system Python fails with `error: externally-managed-environment`.

For uv, Windows PowerShell, and API key setup, see [Setup in the Agent SDK quickstart](https://code.claude.com/docs/en/agent-sdk/quickstart#setup).

## Choosing between `query()` and `ClaudeSDKClient`

The Python SDK provides two ways to interact with Claude Code:

| Feature | `query()` | `ClaudeSDKClient` |
| --- | --- | --- |
| **Session** | Creates a new session by default | Reuses same session |
| **Conversation** | Single exchange | Multiple exchanges in same context |
| **Connection** | Managed automatically | Manual control |
| **Streaming Input** | ✅ Supported | ✅ Supported |
| **Interrupts** | ❌ Not supported | ✅ Supported |
| **Hooks** | ✅ Supported | ✅ Supported |
| **Custom Tools** | ✅ Supported | ✅ Supported |
| **Continue Chat** | Manual via `continue_conversation` or `resume` | ✅ Automatic |
| **Use Case** | One-off tasks | Continuous conversations |

Use `ClaudeSDKClient` for interactive applications such as chat interfaces, or when the next action depends on Claude’s response.

## Functions

### `query()`

Creates a new session for each interaction with Claude Code by default. Returns an async iterator that yields messages as they arrive. Each call to `query()` starts fresh with no memory of previous interactions unless you pass `continue_conversation=True` or `resume` in [`ClaudeAgentOptions`](#claudeagentoptions). See [Sessions](https://code.claude.com/docs/en/agent-sdk/sessions).

#### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `prompt` | `str | AsyncIterable[dict]` | The input prompt as a string or async iterable for streaming mode |
| `options` | `ClaudeAgentOptions | None` | Optional configuration object (defaults to `ClaudeAgentOptions()` if None) |
| `transport` | `Transport | None` | Optional custom transport for communicating with the CLI process |

#### Returns

Returns an `AsyncIterator[Message]` that yields messages from the conversation.

#### Example - With options

### `tool()`

Decorator for defining MCP tools with type safety.

#### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `name` | `str` | Unique identifier for the tool |
| `description` | `str` | Human-readable description of what the tool does |
| `input_schema` | `type | dict[str, Any]` | Schema defining the tool’s input parameters. See [Input schema options](#input-schema-options) |
| `annotations` | [`ToolAnnotations`](#toolannotations) `| None` | Optional MCP tool annotations providing behavioral hints to clients |

#### Input schema options

1.  **Simple type mapping** (recommended):
2.  **JSON Schema format** (for complex validation):
3.  **TypedDict class**: a typed schema whose `NotRequired` keys are left out of `required`.
    -   **Python 3.11 and later**: import `TypedDict` and `NotRequired` from `typing`.
    -   **Python 3.10**: `typing` has no `NotRequired`. Import `TypedDict` and `NotRequired` from `typing_extensions`, which the SDK installs on Python 3.10.

In the simple mapping and TypedDict forms, wrap a type in `Annotated[type, "description"]` to set the field’s description.

#### Returns

A decorator function that wraps the tool implementation and returns an `SdkMcpTool` instance.

#### Example

#### `ToolAnnotations`

Behavioral hints for a tool, passed as the `annotations` argument of [`tool()`](#tool). `ToolAnnotations` extends the MCP SDK’s `mcp.types.ToolAnnotations` with a `maxResultSizeChars` field, and you can write each hint in camelCase or snake\_case: `ToolAnnotations(readOnlyHint=True)` and `ToolAnnotations(read_only_hint=True)` are equivalent. To read a hint back from the object, use the spelling your installed `mcp` package declares: `.readOnlyHint` on `mcp` 1.x and `.read_only_hint` on 2.x, while `.maxResultSizeChars` works on both. You can also pass a plain `mcp.types.ToolAnnotations` wherever the SDK accepts annotations. The snake\_case names and the typed `maxResultSizeChars` field require Python Agent SDK 0.2.140 or later. Versions 0.1.31 through 0.2.139 re-export `mcp.types.ToolAnnotations` unchanged. On versions 0.1.55 through 0.2.139 you can still pass `maxResultSizeChars` as a keyword argument: the MCP class accepts extra fields, and the SDK forwards the value to Claude Code. All fields are optional. Clients shouldn’t rely on the hints for security decisions.

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `str | None` | `None` | Human-readable title for the tool |
| `readOnlyHint` | `bool | None` | `False` | If `True`, the tool does not modify its environment |
| `destructiveHint` | `bool | None` | `True` | If `True`, the tool may perform destructive updates (only meaningful when `readOnlyHint` is `False`) |
| `idempotentHint` | `bool | None` | `False` | If `True`, repeated calls with the same arguments have no additional effect (only meaningful when `readOnlyHint` is `False`) |
| `openWorldHint` | `bool | None` | `True` | If `True`, the tool interacts with external entities (for example, web search). If `False`, the tool’s domain is closed (for example, a memory tool) |
| `maxResultSizeChars` | `int | None` | `None` | Number of characters up to which Claude Code keeps this tool’s text result inline in the conversation instead of saving it to a file, up to 500,000. Results that contain images aren’t affected. A Claude Code setting rather than an MCP hint: the SDK sends it in the tool’s `_meta` as `anthropic/maxResultSizeChars`. See [Raise the limit for a specific tool](https://code.claude.com/docs/en/mcp#raise-the-limit-for-a-specific-tool) |

### `create_sdk_mcp_server()`

Create an in-process MCP server that runs within your Python application.

#### Parameters

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | `str` | \- | Unique identifier for the server |
| `version` | `str` | `"1.0.0"` | Server version string |
| `tools` | `list[SdkMcpTool[Any]] | None` | `None` | List of tool functions created with `@tool` decorator |

#### Returns

Returns an `McpSdkServerConfig` object that can be passed to `ClaudeAgentOptions.mcp_servers`.

#### Example

### `list_sessions()`

Lists past sessions with metadata. Filter by project directory or list sessions across all projects. Synchronous; returns immediately.

#### Parameters

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `directory` | `str | None` | `None` | Directory to list sessions for. When omitted, returns sessions across all projects |
| `limit` | `int | None` | `None` | Maximum number of sessions to return |
| `offset` | `int` | `0` | Number of sessions to skip from the start of the sorted results. Use with `limit` for pagination |
| `include_worktrees` | `bool` | `True` | When `directory` is inside a git repository, include sessions from all worktree paths |

#### Return type: `SDKSessionInfo`

| Property | Type | Description |
| --- | --- | --- |
| `session_id` | `str` | Unique session identifier |
| `summary` | `str` | Display title: custom title, most recent prompt, auto-generated summary, or first prompt |
| `last_modified` | `int` | Last modified time in milliseconds since epoch |
| `file_size` | `int | None` | Session file size in bytes (`None` for remote storage backends) |
| `custom_title` | `str | None` | Session title: the user-set title, or the auto-generated title when none is set |
| `first_prompt` | `str | None` | First meaningful user prompt in the session |
| `git_branch` | `str | None` | Git branch at the end of the session |
| `cwd` | `str | None` | Working directory for the session |
| `tag` | `str | None` | User-set session tag (see [`tag_session()`](#tag_session)) |
| `created_at` | `int | None` | Session creation time in milliseconds since epoch |

#### Example

Print the 10 most recent sessions for a project. Results are sorted by `last_modified` descending, so the first item is the newest. Omit `directory` to search across all projects.

### `get_session_messages()`

Retrieves messages from a past session. Synchronous; returns immediately.

#### Parameters

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `session_id` | `str` | required | The session ID to retrieve messages for |
| `directory` | `str | None` | `None` | Project directory to look in. When omitted, searches all projects |
| `limit` | `int | None` | `None` | Maximum number of messages to return |
| `offset` | `int` | `0` | Number of messages to skip from the start |

#### Return type: `SessionMessage`

| Property | Type | Description |
| --- | --- | --- |
| `type` | `Literal["user", "assistant"]` | Message role |
| `uuid` | `str` | Unique message identifier |
| `session_id` | `str` | Session identifier |
| `message` | `Any` | Raw message content |
| `parent_tool_use_id` | `str | None` | For subagent messages, the id of the spawning `Agent` tool-use block. `None` for main-session messages and older sessions |
| `parent_agent_id` | `str | None` | For messages from a [nested subagent](https://code.claude.com/docs/en/sub-agents#let-subagents-spawn-their-own-subagents), the agent id of the parent subagent. `None` for main-session messages, top-level subagent messages, and older sessions. Requires Python Agent SDK 0.2.140 or later |

#### Example

### `get_session_info()`

Reads metadata for a single session by ID without scanning the full project directory. Synchronous; returns immediately.

#### Parameters

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `session_id` | `str` | required | UUID of the session to look up |
| `directory` | `str | None` | `None` | Project directory path. When omitted, searches all project directories |

Returns [`SDKSessionInfo`](#return-type-sdksessioninfo), or `None` if the session is not found.

#### Example

Look up a single session’s metadata without scanning the project directory. Useful when you already have a session ID from a previous run.

### `rename_session()`

Renames a session by appending a custom-title entry. Repeated calls are safe; the most recent title wins. Synchronous.

#### Parameters

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `session_id` | `str` | required | UUID of the session to rename |
| `title` | `str` | required | New title. Must be non-empty after stripping whitespace |
| `directory` | `str | None` | `None` | Project directory path. When omitted, searches all project directories |

Raises `ValueError` if `session_id` is not a valid UUID or `title` is empty; `FileNotFoundError` if the session cannot be found.

#### Example

Rename the most recent session so it’s easier to find later. The new title appears in [`SDKSessionInfo.custom_title`](#return-type-sdksessioninfo) on subsequent reads.

### `tag_session()`

Tags a session. Pass `None` to clear the tag. Repeated calls are safe; the most recent tag wins. Synchronous.

#### Parameters

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `session_id` | `str` | required | UUID of the session to tag |
| `tag` | `str | None` | required | Tag string, or `None` to clear. Unicode-sanitized before storing |
| `directory` | `str | None` | `None` | Project directory path. When omitted, searches all project directories |

Raises `ValueError` if `session_id` is not a valid UUID or `tag` is empty after sanitization; `FileNotFoundError` if the session cannot be found.

#### Example

Tag a session, then filter by that tag on a later read. Pass `None` to clear an existing tag.

### `fork_session()`

Copies a session’s transcript into a new session so you can take the conversation in another direction while the original stays unchanged. To branch from an earlier point in the conversation, pass `up_to_message_id`. Synchronous.

#### Parameters

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `session_id` | `str` | required | UUID of the session to fork |
| `directory` | `str | None` | `None` | Project directory path. When omitted, searches all project directories |
| `up_to_message_id` | `str | None` | `None` | Copy the transcript up to and including the message with this UUID, such as a `uuid` from [`get_session_messages()`](#get_session_messages). When omitted, copies the whole transcript |
| `title` | `str | None` | `None` | Title for the fork. When omitted, the SDK derives one from the original session, followed by `(fork)` |

Returns a `ForkSessionResult` whose `session_id` is the new session’s UUID. Pass it as [`resume`](#claudeagentoptions) to continue the fork. The fork doesn’t include the original session’s [file checkpoints](https://code.claude.com/docs/en/agent-sdk/file-checkpointing), so you can’t rewind it to a checkpoint captured before the fork. `fork_session()` raises:

-   `ValueError`: `session_id` or `up_to_message_id` is not a valid UUID
-   `ValueError`: the session has no messages, or `up_to_message_id` matches no message in the transcript
-   `FileNotFoundError`: the session cannot be found

#### Example

Fork the most recent session under a new title, then resume the fork. The original session keeps its own history.

## Classes

### `ClaudeSDKClient`

**Maintains a conversation session across multiple exchanges.** This is the Python equivalent of how the TypeScript SDK’s `query()` function works internally - it creates a client object that can continue conversations. See the [comparison with `query()`](#choosing-between-query-and-claudesdkclient).

#### Methods

| Method | Description |
| --- | --- |
| `__init__(options)` | Initialize the client with optional configuration |
| `connect(prompt)` | Connect to Claude with an optional initial prompt or message stream |
| `query(prompt, session_id)` | Send a new request in streaming mode |
| `receive_messages()` | Receive all messages from Claude as an async iterator |
| `receive_response()` | Receive messages until and including a ResultMessage |
| `interrupt()` | Send interrupt signal (only works in streaming mode) |
| `set_permission_mode(mode)` | Change the permission mode for the current session |
| `set_model(model)` | Change the model for the current session. Pass `None` to reset to [Claude Code’s default model](https://code.claude.com/docs/en/model-config). A session in `auto` mode [changes to `default` mode](https://code.claude.com/docs/en/agent-sdk/permissions#auto-mode-auto) if the new model doesn’t support auto mode |
| `rewind_files(user_message_id)` | Restore files to their state at the specified user message. Requires `enable_file_checkpointing=True`. See [File checkpointing](https://code.claude.com/docs/en/agent-sdk/file-checkpointing) |
| `get_mcp_status()` | Get the status of all configured MCP servers. Returns [`McpStatusResponse`](#mcpstatusresponse) |
| `get_context_usage()` | Get a breakdown of context window usage by category, skill, and tool. Includes the data `/context` shows in an interactive session. Returns [`ContextUsageResponse`](#contextusageresponse). To compute the breakdown, Claude Code makes several token-counting API requests that don’t appear in the message stream; see [how these requests are handled](#contextusageresponse) |
| `reconnect_mcp_server(server_name)` | Retry connecting to an MCP server that failed or was disconnected |
| `toggle_mcp_server(server_name, enabled)` | Enable or disable an MCP server mid-session. Disabling a stdio, SSE, or HTTP server removes its tools |
| `stop_task(task_id)` | Stop a running background task. A [`TaskNotificationMessage`](#tasknotificationmessage) with status `"stopped"` follows in the message stream |
| `get_server_info()` | Get the server’s initialization info, including available commands and output styles |
| `disconnect()` | Disconnect from Claude |

#### Context Manager Support

The client can be used as an async context manager for automatic connection management:

> **Important:** When iterating over messages, avoid using `break` to exit early as this can cause asyncio cleanup issues. Instead, let the iteration complete naturally or use flags to track when you’ve found what you need.

#### Example - Continuing a conversation

#### Example - Streaming input with ClaudeSDKClient

`query()` also accepts an async iterable of user message dicts, so you can assemble the prompt at send time or include content blocks such as images. Claude Code starts responding to the first yielded message as soon as it arrives, without waiting for the iterable to finish, and `receive_response()` stops at the `ResultMessage` that ends that response. Put everything Claude should read before answering into one message, as this generator does, and pair each `query()` call with its own `receive_response()` loop.

#### Example - Using interrupts

#### Example - Advanced permission control

## Types

### `SdkMcpTool`

Definition for an SDK MCP tool created with the `@tool` decorator.

| Property | Type | Description |
| --- | --- | --- |
| `name` | `str` | Unique identifier for the tool |
| `description` | `str` | Human-readable description |
| `input_schema` | `type[T] | dict[str, Any]` | Schema for input validation |
| `handler` | `Callable[[T], Awaitable[dict[str, Any]]]` | Async function that handles tool execution |
| `annotations` | [`ToolAnnotations`](#toolannotations) `| None` | Optional tool annotations (for example `readOnlyHint`, `destructiveHint`, `openWorldHint`, `maxResultSizeChars`) |

### `Transport`

Abstract base class for custom transport implementations. Use this to communicate with the Claude process over a custom channel (for example, a remote connection instead of a local subprocess).

| Method | Description |
| --- | --- |
| `connect()` | Connect the transport and prepare for communication |
| `write(data)` | Write raw data (JSON + newline) to the transport |
| `read_messages()` | Async iterator that yields parsed JSON messages |
| `close()` | Close the connection and clean up resources |
| `is_ready()` | Returns `True` if the transport can send and receive |
| `end_input()` | Close the input stream (for example, close stdin for subprocess transports) |

Import: `from claude_agent_sdk import Transport`

### `ClaudeAgentOptions`

Configuration dataclass for Claude Code queries.

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `tools` | `list[str] | ToolsPreset | None` | `None` | Tools configuration. Use `{"type": "preset", "preset": "claude_code"}` for Claude Code’s default tools |
| `allowed_tools` | `list[str]` | `[]` | Tools to auto-approve without prompting, apart from reads from [network paths](https://code.claude.com/docs/en/permissions#network-paths). This does not restrict Claude to only these tools. If you name one of the [task-tracking tools](https://code.claude.com/docs/en/agent-sdk/todo-tracking#model-availability) here, Claude Code also opts the session in. Other unlisted tools fall through to `permission_mode` and `can_use_tool`. Use `disallowed_tools` to block tools. See [Permissions](https://code.claude.com/docs/en/agent-sdk/permissions#allow-and-deny-rules) |
| `system_prompt` | `str | SystemPromptPreset | SystemPromptCustom | SystemPromptFile | None` | `None` | System prompt configuration. Pass a string for a custom prompt, `{"type": "preset", "preset": "claude_code"}` for Claude Code’s system prompt with optional `"append"`, `{"type": "custom", "prompt": "..."}` for a custom prompt that can also set `"snapshot"`, or `{"type": "file", "path": "..."}` to load a large prompt from disk. See [`SystemPromptPreset`](#systempromptpreset), [`SystemPromptCustom`](#systempromptcustom), and [`SystemPromptFile`](#systempromptfile) |
| `mcp_servers` | `dict[str, McpServerConfig] | str | Path` | `{}` | MCP server configurations or path to config file |
| `strict_mcp_config` | `bool` | `False` | When `True`, use only the servers passed in `mcp_servers` and ignore project `.mcp.json`, user settings, plugin-provided MCP servers, and [claude.ai connectors](https://code.claude.com/docs/en/mcp#use-mcp-servers-from-claude-ai). Maps to the CLI `--strict-mcp-config` flag |
| `permission_mode` | `PermissionMode | None` | `None` | Permission mode for tool usage |
| `continue_conversation` | `bool` | `False` | Continue the most recent conversation |
| `resume` | `str | None` | `None` | Session ID to resume |
| `session_id` | `str | None` | `None` | Use a specific session ID instead of an auto-generated one. Must be a valid UUID. Can’t be combined with `continue_conversation` or `resume` unless `fork_session` is also set |
| `max_turns` | `int | None` | `None` | Maximum agentic [turns](https://code.claude.com/docs/en/agent-sdk/agent-loop#turns-and-messages) |
| `max_budget_usd` | `float | None` | `None` | Stop the query when the client-side cost estimate reaches this USD value. The estimate can pass this value, so [leave headroom](https://code.claude.com/docs/en/agent-sdk/agent-loop#budget-headroom). Counts only the call’s own spend; totals restored from a resumed session don’t count. For accuracy caveats and reset behavior, see [Track cost and usage](https://code.claude.com/docs/en/agent-sdk/cost-tracking) |
| `disallowed_tools` | `list[str]` | `[]` | Tools to deny. A bare name such as `"Bash"` removes the tool from Claude’s context. A scoped rule such as `"Bash(rm *)"` leaves the tool available and denies matching calls in every permission mode, including `bypassPermissions`, for the command [as written](https://code.claude.com/docs/en/permissions#bash-rule-limits). See [Permissions](https://code.claude.com/docs/en/agent-sdk/permissions#allow-and-deny-rules) |
| `enable_file_checkpointing` | `bool` | `False` | Enable file change tracking for rewinding. See [File checkpointing](https://code.claude.com/docs/en/agent-sdk/file-checkpointing) |
| `model` | `str | None` | `None` | Claude model alias or full model name. See [accepted values and provider-specific IDs](https://code.claude.com/docs/en/model-config#available-models) |
| `fallback_model` | `str | None` | `None` | Fallback model to use if the primary model fails. Accepts a comma-separated list. For guidance, see [Choose a model](https://code.claude.com/docs/en/agent-sdk/configuration#choose-a-model) |
| `betas` | `list[SdkBeta]` | `[]` | Beta features to enable. See [`SdkBeta`](#sdkbeta) for available options |
| `output_format` | `dict[str, Any] | None` | `None` | Output format for structured responses (e.g., `{"type": "json_schema", "schema": {...}}`). See [Structured outputs](https://code.claude.com/docs/en/agent-sdk/structured-outputs) for details |
| `permission_prompt_tool_name` | `str | None` | `None` | MCP tool name for permission prompts |
| `cwd` | `str | Path | None` | `None` | Current working directory |
| `cli_path` | `str | Path | None` | `None` | Custom path to the Claude Code CLI executable |
| `settings` | `str | None` | `None` | Path to a settings file or an inline JSON string |
| `add_dirs` | `list[str | Path]` | `[]` | Additional directories Claude can access. The SDK passes each entry to Claude Code as `--add-dir`, so with the `project` setting source Claude Code also [loads the directory’s skills, commands, and subagents](https://code.claude.com/docs/en/permissions#additional-directories-grant-file-access-not-configuration) |
| `env` | `dict[str, str]` | `{}` | Environment variables merged on top of the inherited process environment. See [Environment variables](https://code.claude.com/docs/en/env-vars) for variables the underlying CLI reads, and [Handle slow or stalled API responses](#handle-slow-or-stalled-api-responses) for timeout-related variables. Set `CLAUDE_AGENT_SDK_CLIENT_APP` to identify your app in the User-Agent header |
| `extra_args` | `dict[str, str | None]` | `{}` | Additional CLI arguments to pass directly to the CLI |
| `max_buffer_size` | `int | None` | `None` | Maximum bytes when buffering CLI stdout |
| `debug_stderr` | `Any` | `sys.stderr` | _Deprecated_ - The SDK ignores this value. Use the `stderr` callback for CLI stderr output |
| `stderr` | `Callable[[str], None] | None` | `None` | Callback function for stderr output from CLI |
| `can_use_tool` | [`CanUseTool`](#canusetool) `| None` | `None` | Tool permission callback, invoked only when the [permission flow](https://code.claude.com/docs/en/agent-sdk/permissions#how-permissions-are-evaluated) falls through to a prompt. Not invoked for calls auto-approved by `allowed_tools`, allow rules, or `permission_mode`. An allow rule doesn’t pre-approve the [actions no mode auto-approves](https://code.claude.com/docs/en/permission-modes#actions-no-mode-auto-approves). See [`CanUseTool`](#canusetool) for details |
| `hooks` | `dict[HookEvent, list[HookMatcher]] | None` | `None` | Hook configurations for intercepting events |
| `user` | `str | None` | `None` | On POSIX platforms, the OS user account the Claude Code subprocess runs as. Claude Code keeps the parent process’s environment, including `HOME`, and runs in `cwd` |
| `include_partial_messages` | `bool` | `False` | Include partial message streaming events. When enabled, [`StreamEvent`](#streamevent) messages are yielded |
| `include_hook_events` | `bool` | `False` | Include hook lifecycle events in the message stream as `HookEventMessage` objects |
| `forward_subagent_text` | `bool` | `False` | Forward subagent text and thinking blocks in the message stream. Without this option, Claude Code omits the text and thinking blocks of a subagent that runs in the [foreground](https://code.claude.com/docs/en/sub-agents#run-subagents-in-foreground-or-background). For nested subagents, skills with `context: fork`, and the Claude Code version each needs, see [Follow subagent messages](https://code.claude.com/docs/en/headless#follow-subagent-messages). Requires Python Agent SDK 0.2.140 or later |
| `verbatim_prompts` | `bool` | `False` | Deliver every prompt as written. The SDK sends each user message with `client_composed` set to `True`. See [`client_composed`](https://code.claude.com/docs/en/agent-sdk/typescript#sdkusermessage) for what Claude Code skips on those messages. Use this option when your prompt text includes content the end user didn’t type. For per-turn control, leave it off and set `"client_composed": True` on individual streamed messages instead. While the option is on, the SDK overwrites any `client_composed` value you set. Requires Python Agent SDK 0.2.158 or later and Claude Code v2.1.248 or later; the CLI bundled with those SDK versions satisfies the Claude Code requirement |
| `fork_session` | `bool` | `False` | When resuming with `resume`, fork to a new session ID instead of continuing the original session |
| `resume_session_at` | `str | None` | `None` | When resuming, load the conversation only up to and including the message with this UUID. Use with `resume`, and usually `fork_session`, to branch from an earlier point. Requires Python Agent SDK 0.2.137 or later |
| `resume_drops_turn` | `str | None` | `None` | UUID of the user prompt whose turn a `resume_session_at` truncation discards. When set, the CLI refuses the resume if the discarded range holds entries not attributable to that turn. Requires Python Agent SDK 0.2.137 or later and Claude Code v2.1.223 or later; the CLI bundled with those SDK versions satisfies the Claude Code requirement |
| `agents` | `dict[str, AgentDefinition] | None` | `None` | Programmatically defined subagents |
| `plugins` | `list[SdkPluginConfig]` | `[]` | Load custom plugins from local paths. See [Plugins](https://code.claude.com/docs/en/agent-sdk/plugins) for details |
| `sandbox` | [`SandboxSettings`](#sandboxsettings) `| None` | `None` | Configure sandbox behavior programmatically. See [Sandbox settings](#sandboxsettings) for details |
| `setting_sources` | `list[SettingSource] | None` | `None` (CLI defaults: all sources) | Control which filesystem settings to load. Pass `[]` to disable user, project, and local settings. With `skills` set and this field unset, only user and project sources load. Set `setting_sources` explicitly to keep local settings. Endpoint-managed policy loads regardless; server-managed settings are fetched when the session authenticates with an organization credential on an [eligible configuration](https://code.claude.com/docs/en/server-managed-settings#platform-availability). For inputs read regardless of this option, see [What settingSources does not control](https://code.claude.com/docs/en/agent-sdk/claude-code-features#what-settingsources-does-not-control) |
| `skills` | `list[str] | Literal["all"] | None` | `None` | Skills available to the session. Pass `"all"` to enable every discovered skill, or a list of skill names. Pass exact names only. The SDK rejects malformed and wildcard-form names with a `ValueError` before starting the Claude Code process; this check requires Python Agent SDK 0.2.129 or later. When set, the SDK adds the Skill tool to `allowed_tools` automatically. If you also pass `tools`, include `"Skill"` in that list. See [Skills](https://code.claude.com/docs/en/agent-sdk/skills) |
| `max_thinking_tokens` | `int | None` | `None` | _Deprecated_ - Maximum tokens for thinking blocks. Use `thinking` instead |
| `thinking` | [`ThinkingConfig`](#thinkingconfig) `| None` | `None` | Controls extended thinking behavior. Takes precedence over `max_thinking_tokens` |
| `effort` | [`EffortLevel`](#effortlevel) `| None` | `None` | Effort level for thinking depth. See [adjust the effort level](https://code.claude.com/docs/en/model-config#adjust-effort-level) |
| `session_store` | [`SessionStore`](https://code.claude.com/docs/en/agent-sdk/session-storage#the-sessionstore-interface) `| None` | `None` | Mirror session transcripts to an external backend so another host can resume them. See [Persist sessions to external storage](https://code.claude.com/docs/en/agent-sdk/session-storage) |
| `session_store_flush` | `Literal["batched", "eager"]` | `"batched"` | When to flush mirrored transcript entries to `session_store`. `"batched"` flushes once per turn or when the buffer fills; `"eager"` triggers a background flush after every frame. Ignored when `session_store` is `None` |
| `load_timeout_ms` | `int` | `60000` | Per-call timeout for `session_store.load()` and `list_subkeys()` during resume materialization, in milliseconds |
| `task_budget` | `TaskBudget | None` | `None` | API-side token budget. Sent as `output_config.task_budget` with the `task-budgets-2026-03-13` beta header. Pass `{"total": <int>}`. |

#### Handle slow or stalled API responses

The CLI subprocess reads several environment variables that control API timeouts and stall detection. Pass them through `ClaudeAgentOptions.env`:

-   [`API_TIMEOUT_MS`](https://code.claude.com/docs/en/env-vars): how long each request attempt can wait for response headers, in milliseconds. It doesn’t limit how long a streaming response runs after the headers arrive. Default `600000`. Applies to the main loop and all subagents.
-   `CLAUDE_CODE_MAX_RETRIES`: maximum API retries. Default `10`, capped at `15`. Each retry gets its own `API_TIMEOUT_MS` window. For unattended runs that need to wait through longer outages, set [`CLAUDE_CODE_RETRY_WATCHDOG=1`](https://code.claude.com/docs/en/errors#tune-retry-behavior): it retries transient capacity errors indefinitely and, on Claude Code v2.1.199 or later, raises the default for other transient errors to `300` and removes the cap on this variable.
-   `CLAUDE_ASYNC_AGENT_STALL_TIMEOUT_MS`: stall watchdog for subagents. While the stream watchdog is on, the default is `CLAUDE_STREAM_IDLE_TIMEOUT_MS` plus 5 minutes, which comes to `600000` unless you raise that variable. With the stream watchdog off, the default is `600000`. Before v2.1.257, the default was always `600000`. The timer resets on each stream event. On a stall, Claude Code aborts the subagent and reports the stall to the parent. For a background subagent, it also marks the task failed and attaches any partial result.
-   `CLAUDE_ENABLE_STREAM_WATCHDOG` with `CLAUDE_STREAM_IDLE_TIMEOUT_MS`: stream watchdog that aborts the request when headers have arrived but the response body stops streaming. The watchdog is on by default for all providers; set `CLAUDE_ENABLE_STREAM_WATCHDOG=0` to disable it. `CLAUDE_STREAM_IDLE_TIMEOUT_MS` defaults to `300000` and is clamped to that minimum. After the abort, [Automatic retries](https://code.claude.com/docs/en/errors#automatic-retries) covers what Claude Code does, based on how far the response had progressed. While the watchdog waits out a response that a gateway behind `ANTHROPIC_BASE_URL` holds open with keep-alive pings, a host that sets `include_partial_messages` keeps receiving `ping` [`StreamEvent`](#streamevent) messages. Read those frames as liveness rather than timing the session out on silence. Before v2.1.257, the frames stopped 5 minutes after the last real stream event.

### `OutputFormat`

Configuration for structured output validation. Pass this as a `dict` to the `output_format` field on `ClaudeAgentOptions`:

| Field | Required | Description |
| --- | --- | --- |
| `type` | Yes | Must be `"json_schema"` for JSON Schema validation |
| `schema` | Yes | JSON Schema definition for output validation |

### `SystemPromptPreset`

Configuration for using Claude Code’s preset system prompt with optional additions.

| Field | Required | Description |
| --- | --- | --- |
| `type` | Yes | Must be `"preset"` to use a preset system prompt |
| `preset` | Yes | Must be `"claude_code"` to use Claude Code’s system prompt |
| `append` | No | Additional instructions to append to the preset system prompt |
| `exclude_dynamic_sections` | No | Move per-user context, such as the auto memory location, from the system prompt into the first user message. Improves prompt-cache reuse across users and machines. See [Modify system prompts](https://code.claude.com/docs/en/agent-sdk/modifying-system-prompts#improve-prompt-caching-across-users-and-machines) |
| `snapshot` | No | Set to `False` to rebuild the system prompt on every request instead of [reusing the prompt the session recorded on its first request](https://code.claude.com/docs/en/agent-sdk/modifying-system-prompts#change-the-prompt-of-an-existing-session). Requires `claude-agent-sdk` v0.2.153 or later |

### `SystemPromptCustom`

A custom system prompt in object form, equivalent to passing a string as `system_prompt`, that can also set `snapshot`. Requires `claude-agent-sdk` v0.2.153 or later.

| Field | Required | Description |
| --- | --- | --- |
| `type` | Yes | Must be `"custom"` |
| `prompt` | Yes | The system prompt text. Passed to the CLI as a command-line argument, so the [command-line length limits](#systempromptfile) apply |
| `snapshot` | No | Same as [`SystemPromptPreset.snapshot`](#systempromptpreset), applied to `prompt` |

### `SystemPromptFile`

Configuration for loading a custom system prompt from a file instead of passing it as a string. The SDK maps this to the CLI [`--system-prompt-file`](https://code.claude.com/docs/en/cli-reference#system-prompt-flags) flag. Use the file form when the prompt is large: the SDK passes a string `system_prompt` on the CLI subprocess argv, which is subject to OS command-line length limits before the SDK sends any API request. On Linux a single argument longer than roughly 128 KB fails at process spawn with `Argument list too long`. On Windows the whole command line is capped at roughly 32 KB, so the string form fails at a lower threshold.

| Field | Required | Description |
| --- | --- | --- |
| `type` | Yes | Must be `"file"` to load the prompt from disk |
| `path` | Yes | Path to a file containing the system prompt |

### `SettingSource`

Controls which filesystem-based configuration sources the SDK loads settings from.

| Value | Description | Location |
| --- | --- | --- |
| `"user"` | Global user settings | `~/.claude/settings.json` |
| `"project"` | Shared project settings (version controlled) | `.claude/settings.json` |
| `"local"` | Local project settings, gitignored when Claude Code saves a setting to it | `.claude/settings.local.json` |

#### Default behavior

When `setting_sources` is omitted or `None` and `skills` is not set, `query()` loads the same filesystem settings as the Claude Code CLI: user, project, and local. With `skills` set, the [`setting_sources`](#claudeagentoptions) row describes the current default. Endpoint-managed policy is loaded in all cases; server-managed settings are fetched when the session authenticates with an organization credential on an [eligible configuration](https://code.claude.com/docs/en/server-managed-settings#platform-availability). For more information, see [What settingSources does not control](https://code.claude.com/docs/en/agent-sdk/claude-code-features#what-settingsources-does-not-control).

#### Why use setting\_sources

**Disable filesystem settings:**

**Load only specific setting sources:**

**SDK-only applications:**

To load CLAUDE.md project instructions, include `"project"` in `setting_sources`. See [Modify system prompts](https://code.claude.com/docs/en/agent-sdk/modifying-system-prompts#claude-md-files-for-project-level-instructions) for how CLAUDE.md loading interacts with the system prompt options.

#### Settings precedence

When multiple sources are loaded, settings are merged with this precedence (highest to lowest):

1.  Local settings (`.claude/settings.local.json`)
2.  Project settings (`.claude/settings.json`)
3.  User settings (`~/.claude/settings.json`)

Programmatic options such as `agents`, `allowed_tools`, and `settings` override user, project, and local filesystem settings. Managed policy settings take precedence over programmatic options.

### `AgentDefinition`

Configuration for a subagent defined programmatically.

| Field | Required | Description |
| --- | --- | --- |
| `description` | Yes | Natural language description of when to use this agent |
| `prompt` | Yes | The agent’s system prompt |
| `tools` | No | Array of allowed tool names. If omitted, inherits every [tool available to subagents](https://code.claude.com/docs/en/sub-agents#available-tools) |
| `disallowedTools` | No | Array of tool names to remove from the agent’s tool set. MCP server-level patterns are also accepted: `mcp__server` or `mcp__server__*` removes every tool from that server, and `mcp__*` removes every MCP tool from any server |
| `model` | No | Model override for this agent. Accepts an alias such as `"sonnet"`, `"opus"`, `"haiku"`, or `"inherit"`, or a full model ID. When you omit it, Claude Code picks the model in the [subagent model order](https://code.claude.com/docs/en/sub-agents#choose-a-model) |
| `skills` | No | List of skill names to preload into the agent’s context at startup. Unlisted skills remain invocable through the Skill tool |
| `memory` | No | Memory source for this agent: `"user"`, `"project"`, or `"local"` |
| `mcpServers` | No | MCP servers available to this agent. Each entry is a server name or an inline `{name: config}` dict |
| `initialPrompt` | No | Auto-submitted as the first user turn when this agent runs as the main thread agent |
| `maxTurns` | No | Maximum number of agentic turns before the agent stops |
| `background` | No | Run this agent as a non-blocking background task when invoked |
| `effort` | No | Reasoning effort level for this agent. Accepts a named level or an integer. See [`EffortLevel`](#effortlevel) |
| `permissionMode` | No | Permission mode for tool execution within this agent. The [subagent inheritance rules](https://code.claude.com/docs/en/agent-sdk/permissions#available-modes) decide when it applies. See [`PermissionMode`](#permissionmode) |

### `PermissionMode`

Permission modes for controlling tool execution.

### `EffortLevel`

Effort levels for guiding thinking depth.

### `CanUseTool`

Type alias for tool permission callback functions.

The callback receives:

-   `tool_name`: Name of the tool being called
-   `input_data`: The tool’s input parameters
-   `context`: A `ToolPermissionContext` with additional information

Returns a `PermissionResult` (either `PermissionResultAllow` or `PermissionResultDeny`). The callback is the SDK replacement for the interactive permission prompt: it’s invoked only when the [permission evaluation flow](https://code.claude.com/docs/en/agent-sdk/permissions#how-permissions-are-evaluated) resolves to a prompt. Tool calls already approved by an `allowed_tools` entry, a settings allow rule, or the permission mode, such as `acceptEdits` or `bypassPermissions`, never invoke it. To gate every tool call, use a [`PreToolUse` hook](https://code.claude.com/docs/en/agent-sdk/hooks) instead. An allow rule doesn’t pre-approve the [actions no mode auto-approves](https://code.claude.com/docs/en/permission-modes#actions-no-mode-auto-approves); see [How permissions are evaluated](https://code.claude.com/docs/en/agent-sdk/permissions#how-permissions-are-evaluated) for which of them reach the callback and what happens in `dontAsk` and `auto` mode.

### `ToolPermissionContext`

Context information passed to tool permission callbacks.

| Field | Type | Description |
| --- | --- | --- |
| `signal` | `Any | None` | Reserved for future abort signal support |
| `suggestions` | `list[PermissionUpdate]` | Permission update suggestions from the CLI. Bash prompts include a suggestion with the `localSettings` destination, so returning it in `updated_permissions` writes the rule to `.claude/settings.local.json` and persists across sessions. |
| `tool_use_id` | `str | None` | Identifier of the specific tool call this prompt is for. Always populated when delivered to `can_use_tool` |
| `agent_id` | `str | None` | Sub-agent ID when the call originates from a subagent; `None` for the main agent |
| `blocked_path` | `str | None` | File path that triggered the permission request, when applicable. For example, when a Bash command tries to access a path outside allowed directories |
| `decision_reason` | `str | None` | Reason this permission request was triggered. Forwarded from a PreToolUse hook’s `permissionDecisionReason` when the hook returned `"ask"` |
| `title` | `str | None` | Full permission prompt sentence, such as `Claude wants to read foo.txt`. Use as the primary prompt text when present |
| `display_name` | `str | None` | Short noun phrase for the tool action, such as `Read file`, suitable for button labels |
| `description` | `str | None` | Human-readable subtitle for the permission UI |

### `PermissionResult`

Union type for permission callback results.

### `PermissionResultAllow`

Result indicating the tool call should be allowed.

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `behavior` | `Literal["allow"]` | `"allow"` | Must be “allow” |
| `updated_input` | `dict[str, Any] | None` | `None` | Modified input to use instead of original |
| `updated_permissions` | `list[PermissionUpdate] | None` | `None` | Permission updates to apply |

If you return `PermissionResultAllow` with more than 4,096 items in `updated_permissions`, Claude Code treats the result as invalid and denies the tool call. Each [`PermissionUpdate`](#permissionupdate) counts as one item, and so does each entry in its `rules` or `directories` list. The denial message ends with `updatedPermissions may hold at most 4096 updates, rules and directories in all.` To avoid the denial, return 4,096 items or fewer.

### `PermissionResultDeny`

Result indicating the tool call should be denied.

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `behavior` | `Literal["deny"]` | `"deny"` | Must be “deny” |
| `message` | `str` | `""` | Message explaining why the tool was denied |
| `interrupt` | `bool` | `False` | Whether to interrupt the current execution |

### `PermissionUpdate`

Configuration for updating permissions programmatically.

| Field | Type | Description |
| --- | --- | --- |
| `type` | `Literal[...]` | The type of permission update operation |
| `rules` | `list[PermissionRuleValue] | None` | Rules for add/replace/remove operations |
| `behavior` | `Literal["allow", "deny", "ask"] | None` | Behavior for rule-based operations |
| `mode` | `PermissionMode | None` | Mode for setMode operation |
| `directories` | `list[str] | None` | Directories for add/remove directory operations |
| `destination` | `Literal[...] | None` | Where to apply the permission update |

### `PermissionRuleValue`

A rule to add, replace, or remove in a permission update.

### `ToolsPreset`

Preset tools configuration for using Claude Code’s default tool set.

### `ThinkingConfig`

Controls extended thinking behavior. A union of three configurations:

| Variant | Fields | Description |
| --- | --- | --- |
| `adaptive` | `type`, `display` | Claude adaptively decides when to think |
| `enabled` | `type`, `budget_tokens`, `display` | Enable thinking with a specific token budget |
| `disabled` | `type` | Disable thinking |

The optional `display` field controls whether thinking text is returned `"summarized"` or `"omitted"`. On Claude Opus 4.7 and later, the API default is `"omitted"`, so set `"summarized"` to receive thinking content in [`ThinkingBlock`](#thinkingblock) outputs. Claude Code doesn’t pass your `display` value to some providers, such as Amazon Bedrock and Google Cloud’s Agent Platform. On those providers, Opus 4.7 and later return empty `ThinkingBlock` outputs even when you set `display` to `"summarized"`. Because these are `TypedDict` classes, they’re plain dicts at runtime. Either construct them as dict literals or call the class like a constructor; both produce a `dict`. Access fields with `config["budget_tokens"]`, not `config.budget_tokens`:

### `TaskBudget`

API-side task budget in tokens, used with the `task_budget` field in `ClaudeAgentOptions`.

| Field | Type | Description |
| --- | --- | --- |
| `total` | `int` | Total token budget for the task |

Because this is a `TypedDict`, pass it as a plain dict, such as `ClaudeAgentOptions(task_budget={"total": 50000})`.

### `SdkBeta`

Literal type for SDK beta features.

Use with the `betas` field in `ClaudeAgentOptions` to enable beta features.

### `McpSdkServerConfig`

Configuration for SDK MCP servers created with `create_sdk_mcp_server()`.

### `McpServerConfig`

Union type for MCP server configurations.

#### `McpStdioServerConfig`

#### `McpSSEServerConfig`

#### `McpHttpServerConfig`

### `McpServerStatusConfig`

The configuration of an MCP server as reported by [`get_mcp_status()`](#methods). This is the union of all [`McpServerConfig`](#mcpserverconfig) transport variants plus an output-only `claudeai-proxy` variant for servers proxied through claude.ai.

`McpSdkServerConfigStatus` is the serializable form of [`McpSdkServerConfig`](#mcpsdkserverconfig) with only `type` (`"sdk"`) and `name` (`str`) fields; the in-process `instance` is omitted. `McpClaudeAIProxyServerConfig` has `type` (`"claudeai-proxy"`), `url` (`str`), and `id` (`str`) fields.

### `McpStatusResponse`

Response from [`ClaudeSDKClient.get_mcp_status()`](#methods). Wraps the list of server statuses under the `mcpServers` key.

### `McpServerStatus`

Status of a connected MCP server, contained in [`McpStatusResponse`](#mcpstatusresponse).

| Field | Type | Description |
| --- | --- | --- |
| `name` | `str` | Server name |
| `status` | `str` | One of `"connected"`, `"failed"`, `"needs-auth"`, `"pending"`, or `"disabled"` |
| `serverInfo` | `dict` (optional) | Server name and version (`{"name": str, "version": str}`) |
| `error` | `str` (optional) | Error message if the server failed to connect |
| `config` | [`McpServerStatusConfig`](#mcpserverstatusconfig) (optional) | Server configuration. Same shape as [`McpServerConfig`](#mcpserverconfig) (stdio, SSE, HTTP, or SDK), plus a `claudeai-proxy` variant for servers connected through claude.ai |
| `scope` | `str` (optional) | Configuration scope |
| `tools` | `list` (optional) | Tools provided by this server, each with `name`, `description`, and `annotations` fields |

### `ContextUsageResponse`

Response from [`ClaudeSDKClient.get_context_usage()`](#methods). The response includes the payload Claude Code renders for the `/context` command in an interactive session. Alongside the token counts, that payload carries display fields such as `color` and `gridRows` that Claude Code uses to draw the `/context` usage grid. Claude Code builds this payload by sending several requests to the [token-counting](https://platform.claude.com/docs/en/build-with-claude/token-counting) API. These requests don’t appear in the message stream, so cost tracking that reads the stream won’t see them. On the Anthropic API, token counting isn’t billed.

Each `ContextUsageCategory` entry carries `name`, `tokens`, `color`, and an optional `isDeferred` flag. `totalTokens` is the session’s current context usage, and `maxTokens` is the window that usage is measured against. That window is the model’s context window, or the lower auto-compaction window when one applies, and `rawMaxTokens` carries the same value as `maxTokens`. `apiUsage` holds the usage from the latest API response, not a running total for the session. Claude Code leaves the optional `deferredBuiltinTools`, `systemTools`, and `systemPromptSections` keys unset, so expect them to be absent even though the type declares them.

### `SdkPluginConfig`

Configuration for loading plugins in the SDK.

| Field | Type | Description |
| --- | --- | --- |
| `type` | `Literal["local"]` | Must be `"local"` (only local plugins currently supported) |
| `path` | `str` | Absolute or relative path to the plugin directory |

**Example:**

For complete information on creating and using plugins, see [Plugins](https://code.claude.com/docs/en/agent-sdk/plugins).

## Message Types

### `Message`

Union type of all possible messages.

### `UserMessage`

User input message.

| Field | Type | Description |
| --- | --- | --- |
| `content` | `str | list[ContentBlock]` | Message content as text or content blocks |
| `uuid` | `str | None` | Unique message identifier |
| `parent_tool_use_id` | `str | None` | Tool use ID if this message is a tool result response |
| `tool_use_result` | `dict[str, Any] | None` | Tool result data if applicable |
| `origin` | `MessageOrigin | None` | Provenance of this message, populated on injected turns such as task notifications and peer messages. `None` when the CLI didn’t attribute it. Requires Python Agent SDK 0.2.137 or later |

The SDK passes `tool_use_result` through from the CLI unmodified. For a tool on an external MCP server whose result contains `resource_link` blocks, the dict has a `resourceLinks` key holding a list of dicts with the keys of the TypeScript [`SDKMcpResourceLink`](https://code.claude.com/docs/en/agent-sdk/typescript#sdkmcpresourcelink) type. Claude receives each link as a line of text in the tool result. To render the files the server returned, read `resourceLinks` instead of parsing that text. The `resourceLinks` key requires Python Agent SDK 0.2.150 or later and Claude Code v2.1.257 or later; the CLI bundled with that SDK version satisfies the Claude Code requirement. The CLI omits the key when the result has no links and on results from subagents. The CLI keeps at most 50 links per result and stops adding links once the list reaches 64 KiB of serialized JSON. A tool you define in-process with [`tool()`](#tool) never produces the key, because the SDK flattens its `resource_link` blocks to text before the CLI sees the result.

### `AssistantMessage`

Assistant response message with content blocks.

| Field | Type | Description |
| --- | --- | --- |
| `content` | `list[ContentBlock]` | List of content blocks in the response |
| `model` | `str` | Model that generated the response |
| `parent_tool_use_id` | `str | None` | Tool use ID if this is a nested response |
| `error` | [`AssistantMessageError`](#assistantmessageerror) `| None` | Error type if the response encountered an error |
| `usage` | `dict[str, Any] | None` | Per-message token usage (same keys as [`ResultMessage.usage`](#resultmessage)) |
| `message_id` | `str | None` | API message ID. Multiple messages from one turn share the same ID |
| `stop_reason` | `str | None` | Stop reason from the API (for example, `end_turn`, `tool_use`) |
| `session_id` | `str | None` | ID of the session this message belongs to |
| `uuid` | `str | None` | Unique message identifier within the session transcript |

### `AssistantMessageError`

Possible error types for assistant messages.

The underlying CLI process can emit error types this Literal doesn’t list, such as `max_output_tokens`. The SDK passes the value through unmodified, so treat strings outside this list the way you treat `unknown`. The TypeScript [`SDKAssistantMessageError`](https://code.claude.com/docs/en/agent-sdk/typescript#sdkassistantmessage) type lists the full set of values the CLI can emit.

### `SystemMessage`

System message with metadata.

Subtypes that have no dataclass of their own arrive as `SystemMessage`. To follow the session between turns, set [`CLAUDE_CODE_EMIT_SESSION_STATE_EVENTS=1`](https://code.claude.com/docs/en/env-vars#variables) and read `message.data["state"]` on each message whose `subtype` is `session_state_changed`. [`SDKSessionStateChangedMessage`](https://code.claude.com/docs/en/agent-sdk/typescript#sdksessionstatechangedmessage) lists the states it can carry. Iterate with `receive_messages()` to read them: `receive_response()` stops at the `ResultMessage`, and a `session_state_changed` message can follow that result.

### `ResultMessage`

Final result message with cost and usage information.

The `subtype` field determines which other fields are populated. It is one of `"success"`, `"error_during_execution"`, `"error_max_turns"`, `"error_max_budget_usd"`, or `"error_max_structured_output_retries"`. The Python dataclass flattens all variants into one shape, so fields that don’t apply to the returned subtype are `None`. Several fields carry diagnostic detail about how the conversation ended:

-   `is_error`: `True` when the conversation ended in an error state. Always `True` on the `error_*` subtypes. On `subtype="success"` it is `True` in three cases. Check `stop_reason` to tell them apart:
    -   `"refusal"`: the model declined to respond. Read the refusal text in `result`, or in the preceding `AssistantMessage` when `result` is empty.
    -   `"tool_deferred_unavailable"`: the [deferred tool](https://code.claude.com/docs/en/hooks#defer-a-tool-call-for-later) was no longer available when you resumed the session, for example because its MCP server wasn’t connected. In the two cases below, a prompt you send after resuming counts the same as one passed with the resume:
        -   No prompt: the call is still pending. Make the tool available and resume again without a prompt, and the call runs first.
        -   A prompt: Claude Code answers it without the tool’s result, and the deferred call is gone. Send a new prompt if you still need the tool called.
    -   Any other value: the turn ended on an error that Claude Code reported in place of a model response, such as an API error. Read `terminal_reason` for the cause, `result` for the message, and `api_error_status` for the HTTP status when the API returned one.
-   `api_error_status`: the HTTP status code of the terminating API error. `None` when the turn ended without one. Populated only on `subtype="success"`.
-   `result`: text of the final assistant message on `subtype="success"`, or `None` on the `error_*` subtypes. When `subtype="success"` and `is_error=True`, this holds the API error string if one is available but can be empty, so check `api_error_status` and the preceding `AssistantMessage` content for detail.
-   `errors`: loop-level error strings such as the max-turns message. Populated only on the `error_*` subtypes.
-   `terminal_reason`: why the query loop ended, such as `"completed"`, `"max_turns"`, `"api_error"`, `"aborted_streaming"`, or `"aborted_tools"`. A value of `"aborted_streaming"` or `"aborted_tools"` means the turn was aborted before completing. Common causes are [`interrupt()`](#claudesdkclient) and a permission callback returning [`PermissionResultDeny`](#permissionresultdeny) with `interrupt=True`. `None` on CLI versions that predate the field, on results from local commands such as `/voice` or `/usage`, which bypass the query loop, or on synthesized error results emitted when the session fails fatally. Mirrors the TypeScript SDK’s [`SDKResultMessage.terminal_reason`](https://code.claude.com/docs/en/agent-sdk/typescript#sdkresultmessage), which lists the full set of values.
-   `origin`: origin of the user message that triggered this turn. In [streaming input mode](https://code.claude.com/docs/en/agent-sdk/streaming-vs-single-mode), check this to tell the result of your own prompt, where `origin` is `None` or `{"kind": "human"}`, from the result of an injected turn such as a background-task notification. Requires Python Agent SDK 0.2.137 or later.

When several background tasks finish close together, Claude Code can answer their notifications in one turn rather than one turn each. You still receive one `ResultMessage` per notification, in order, each with an `origin` whose `kind` is `"task-notification"`. All but the last have `num_turns` set to `0` and an empty `result`, and the last one carries the turn that answers them all. The `usage` dict covers the main agent loop only and excludes subagent and other nested or auxiliary model calls. In [streaming input mode](https://code.claude.com/docs/en/agent-sdk/streaming-vs-single-mode), the values are per-turn. Prefer `model_usage` for token and cost accounting. The `usage` dict contains the following keys when present:

| Key | Type | Description |
| --- | --- | --- |
| `input_tokens` | `int` | Input tokens consumed by the top-level agent loop. [Subagent tokens aren’t included](https://code.claude.com/docs/en/agent-sdk/cost-tracking#get-the-total-cost-of-a-query); use `model_usage` for whole-tree accounting. |
| `output_tokens` | `int` | Output tokens generated by the top-level agent loop. Subagent tokens aren’t included. |
| `cache_creation_input_tokens` | `int` | Tokens used to create new cache entries. |
| `cache_read_input_tokens` | `int` | Tokens read from existing cache entries. |

The `model_usage` dict maps model names to per-model usage. It covers every model call made through the query pipeline: the main loop, subagents, and internal calls such as compaction and Workflow agents. Helper calls outside that pipeline, such as the permission classifier and token-counting requests, are excluded from `model_usage`. Treat `model_usage` as an estimate, not a billing statement. In [streaming input mode](https://code.claude.com/docs/en/agent-sdk/streaming-vs-single-mode), `model_usage` and `total_cost_usd` are cumulative across turns, so read the latest result rather than summing across results. A call that resumes a session also counts the [totals restored from the session’s earlier calls](https://code.claude.com/docs/en/agent-sdk/cost-tracking#accumulate-costs-across-multiple-calls). See [Track costs in streaming input mode](https://code.claude.com/docs/en/agent-sdk/cost-tracking#track-costs-in-streaming-input-mode) for resets and [Recover totals after a session crash](https://code.claude.com/docs/en/agent-sdk/cost-tracking#recover-totals-after-a-session-crash) for zeroed results. Each value in `model_usage` is a `ModelUsage` TypedDict, imported via `from claude_agent_sdk.types import ModelUsage`. Its keys use camelCase because the SDK passes the value through unmodified from the underlying CLI process, matching the TypeScript [`ModelUsage`](https://code.claude.com/docs/en/agent-sdk/typescript#modelusage) type:

| Key | Type | Description |
| --- | --- | --- |
| `inputTokens` | `int` | Input tokens for this model. |
| `outputTokens` | `int` | Output tokens for this model. |
| `cacheReadInputTokens` | `int` | Cache read tokens for this model. |
| `cacheCreationInputTokens` | `int` | Cache creation tokens for this model. |
| `webSearchRequests` | `int` | Web search requests made by this model. |
| `thinkingTokens` | `int` | Thinking tokens generated by this model, already counted in `outputTokens`. Absent until a turn runs on a Claude Code version that records it, and not declared on the TypedDict, so read it with `.get()`. Requires Python Agent SDK 0.2.150 or later, whose bundled CLI records it. |
| `costUSD` | `float` | Estimated cost in USD for this model, computed client-side. See [Track cost and usage](https://code.claude.com/docs/en/agent-sdk/cost-tracking) for billing caveats. |
| `contextWindow` | `int` | Context window size for this model. |
| `maxOutputTokens` | `int` | Maximum output token limit for this model. |
| `canonicalModel` | `str` | Canonical model ID used for the pricing lookup. May differ from the raw model string the entry is keyed by, such as a provider-specific ID or alias. Not always present. |
| `provider` | `str` | API provider that served this model, such as `firstParty`, `bedrock`, `vertex`, `foundry`, `anthropicAws`, `mantle`, or `gateway`. Not always present. |
| `costBasis` | `str` | Price table that priced this model’s latest request: `list` for list price, `managed` for a [`modelPricing`](https://code.claude.com/docs/en/settings-reference#modelpricing) table, or `unknown` when neither matched the model ID. Not always present, and not declared on the TypedDict, so read it with `.get()`. Requires Claude Code v2.1.246 or later. |

### `StreamEvent`

Stream event for partial message updates during streaming. Only received when `include_partial_messages=True` in `ClaudeAgentOptions`. Import via `from claude_agent_sdk.types import StreamEvent`.

| Field | Type | Description |
| --- | --- | --- |
| `uuid` | `str` | Unique identifier for this event |
| `session_id` | `str` | Session identifier |
| `event` | `dict[str, Any]` | The raw Claude API stream event data |
| `parent_tool_use_id` | `str | None` | Always `None`. Stream events are emitted for the main session only. For subagent attribution, use complete messages such as [`AssistantMessage`](#assistantmessage) |

### `RateLimitEvent`

Emitted when rate limit status changes (for example, from `"allowed"` to `"allowed_warning"`). Use this to warn users before they hit a hard limit, or to back off when status is `"rejected"`.

| Field | Type | Description |
| --- | --- | --- |
| `rate_limit_info` | [`RateLimitInfo`](#ratelimitinfo) | Current rate limit state |
| `uuid` | `str` | Unique event identifier |
| `session_id` | `str` | Session identifier |

### `RateLimitInfo`

Rate limit state carried by [`RateLimitEvent`](#ratelimitevent).

| Field | Type | Description |
| --- | --- | --- |
| `status` | `RateLimitStatus` | Current status, one of `"allowed"`, `"allowed_warning"`, or `"rejected"`. `"allowed_warning"` means approaching the limit; `"rejected"` means the limit was hit |
| `resets_at` | `int | None` | Unix timestamp when the rate limit window resets |
| `rate_limit_type` | `RateLimitType | None` | Which rate limit window applies |
| `utilization` | `float | None` | Fraction of the rate limit consumed (0.0 to 1.0) |
| `overage_status` | `RateLimitStatus | None` | Status of pay-as-you-go overage usage, if applicable |
| `overage_resets_at` | `int | None` | Unix timestamp when the overage window resets |
| `overage_disabled_reason` | `str | None` | Why overage is unavailable, if status is `"rejected"` |
| `raw` | `dict[str, Any]` | Full raw dict from the CLI, including fields not modeled above |

### `ConversationResetMessage`

Emitted when the conversation is replaced without ending the connection, such as after `/clear`. See [Track costs in streaming input mode](https://code.claude.com/docs/en/agent-sdk/cost-tracking#track-costs-in-streaming-input-mode) for how a reset affects the running totals on later `ResultMessage` objects. Requires Python Agent SDK 0.2.137 or later.

| Field | Type | Description |
| --- | --- | --- |
| `new_conversation_id` | `str` | Opaque identifier for the fresh conversation. Not the `session_id` of subsequent messages; read that from the next message |
| `uuid` | `str` | Unique message identifier |
| `session_id` | `str` | ID of the session that was reset. Messages after the reset carry a new `session_id` |

### `TaskStartedMessage`

Emitted when a background task starts. A background task is anything tracked outside the main turn: a backgrounded Bash command, a [Monitor](#monitor) watch, a subagent spawned via the Agent tool, or a remote agent. The `task_type` field tells you which. This naming is unrelated to the `Task`\-to-`Agent` tool rename.

| Field | Type | Description |
| --- | --- | --- |
| `task_id` | `str` | Unique identifier for the task |
| `description` | `str` | Description of the task |
| `uuid` | `str` | Unique message identifier |
| `session_id` | `str` | Session identifier |
| `tool_use_id` | `str | None` | Associated tool use ID |
| `task_type` | `str | None` | Which kind of background task: `"local_bash"` for background Bash and Monitor watches, `"local_agent"`, or `"remote_agent"` |

### `TaskUsage`

Token and timing data for a background task.

### `TaskProgressMessage`

Emitted periodically with progress updates for a running background task.

| Field | Type | Description |
| --- | --- | --- |
| `task_id` | `str` | Unique identifier for the task |
| `description` | `str` | Current status description |
| `usage` | `TaskUsage` | Token usage for this task so far |
| `uuid` | `str` | Unique message identifier |
| `session_id` | `str` | Session identifier |
| `tool_use_id` | `str | None` | Associated tool use ID |
| `last_tool_name` | `str | None` | Name of the last tool the task used |

### `TaskNotificationMessage`

Emitted when a background task completes, fails, or is stopped. Background tasks include `run_in_background` Bash commands, Monitor watches, and background subagents.

| Field | Type | Description |
| --- | --- | --- |
| `task_id` | `str` | Unique identifier for the task |
| `status` | `TaskNotificationStatus` | One of `"completed"`, `"failed"`, or `"stopped"` |
| `output_file` | `str` | Path to the task output file |
| `summary` | `str` | Summary of the task result |
| `uuid` | `str` | Unique message identifier |
| `session_id` | `str` | Session identifier |
| `tool_use_id` | `str | None` | Associated tool use ID |
| `usage` | `TaskUsage | None` | Final token usage for the task |

When the CLI [moves a long MCP tool call to the background](https://code.claude.com/docs/en/mcp#automatic-backgrounding-of-long-tool-calls), the tool result for that call holds only a placeholder and the call’s real result arrives in this message. On a `"completed"` notification for such a call, the CLI adds a `resource_links` key listing the files the tool returned by reference, with the same entries and limits as the `resourceLinks` key on [`UserMessage.tool_use_result`](#usermessage). The `resource_links` key requires Python Agent SDK 0.2.150 or later and Claude Code v2.1.257 or later; the CLI bundled with that SDK version satisfies the Claude Code requirement. The dataclass has no field for `resource_links`. Read it from the `data` dict the message inherits from [`SystemMessage`](#systemmessage): `message.data.get("resource_links")`. Match the notification to the call with `tool_use_id`. The CLI omits the key when the result had no links and on notifications for tasks that aren’t MCP tool calls.

## Content Block Types

### `ContentBlock`

Union type of all content blocks.

### `TextBlock`

Text content block.

### `ThinkingBlock`

Thinking content block (for models with thinking capability).

### `ToolUseBlock`

Tool use request block.

### `ToolResultBlock`

Tool execution result block.

## Error Types

The types below define what your code catches. For entries keyed to the error messages these types raise, with the cause and fix for each, see [Troubleshooting](https://code.claude.com/docs/en/agent-sdk/troubleshooting).

### `ClaudeSDKError`

Base exception class for all SDK errors.

When a single-shot `query()` ends with an error result, for example a turn-limit error, the SDK raises a [`ResultError`](#resulterror).

### `CLINotFoundError`

Raised when Claude Code CLI is not installed or not found.

### `CLIConnectionError`

Raised when connection to Claude Code fails.

### `ProcessError`

Raised when the Claude Code process fails.

### `ResultError`

Raised when the Claude Code process exits because the run ended with an error [result message](#resultmessage), such as a turn-limit error or an API error. `ResultError` subclasses `ProcessError`, so an existing `except ProcessError` handler also catches it. Its attributes carry the fields of that result message, so you can branch on why the run failed without parsing the message text. Requires Python Agent SDK 0.2.140 or later.

To tell failures apart, check `data["stop_reason"]` first, then `terminal_reason`, then `subtype`. A declined response has `stop_reason` `"refusal"`, usually with `subtype` `"success"`; its `terminal_reason` doesn’t single it out and can read `"completed"` or `"api_error"`. A failed final request has `subtype` `"success"` and its cause in `terminal_reason`, such as `"api_error"` for an API error. When the run hits a limit you set, such as `max_turns` or `max_budget_usd`, you get an `error_*` subtype.

### `CLIJSONDecodeError`

Raised when JSON parsing fails.

## Hook Types

For a comprehensive guide on using hooks with examples and common patterns, see the [Hooks guide](https://code.claude.com/docs/en/agent-sdk/hooks).

### `HookEvent`

Supported hook event types.

### `HookCallback`

Type definition for hook callback functions.

Parameters:

-   `input`: Strongly typed hook input with discriminated unions based on `hook_event_name` (see [`HookInput`](#hookinput))
-   `tool_use_id`: Optional tool use identifier (for tool-related hooks)
-   `context`: Hook context with additional information

Returns a [`HookJSONOutput`](#hookjsonoutput).

### `HookContext`

Context information passed to hook callbacks.

### `HookMatcher`

Configuration for matching hooks to specific events or tools.

### `HookInput`

Union type of all hook input types. The actual type depends on the `hook_event_name` field.

### `BaseHookInput`

Base fields present in all hook input types.

| Field | Type | Description |
| --- | --- | --- |
| `session_id` | `str` | Current session identifier |
| `transcript_path` | `str` | Path to the session transcript file |
| `cwd` | `str` | Current working directory |
| `permission_mode` | `str` (optional) | Current permission mode |

### `PreToolUseHookInput`

Input data for `PreToolUse` hook events.

| Field | Type | Description |
| --- | --- | --- |
| `hook_event_name` | `Literal["PreToolUse"]` | Always “PreToolUse” |
| `tool_name` | `str` | Name of the tool about to be executed |
| `tool_input` | `dict[str, Any]` | Input parameters for the tool |
| `tool_use_id` | `str` | Unique identifier for this tool use |
| `agent_id` | `str` (optional) | Subagent identifier, present when the hook fires inside a subagent |
| `agent_type` | `str` (optional) | Subagent type, present when the hook fires inside a subagent |

### `PostToolUseHookInput`

Input data for `PostToolUse` hook events.

| Field | Type | Description |
| --- | --- | --- |
| `hook_event_name` | `Literal["PostToolUse"]` | Always “PostToolUse” |
| `tool_name` | `str` | Name of the tool that was executed |
| `tool_input` | `dict[str, Any]` | Input parameters that were used |
| `tool_response` | `Any` | Response from the tool execution |
| `tool_use_id` | `str` | Unique identifier for this tool use |
| `agent_id` | `str` (optional) | Subagent identifier, present when the hook fires inside a subagent |
| `agent_type` | `str` (optional) | Subagent type, present when the hook fires inside a subagent |

### `PostToolUseFailureHookInput`

Input data for `PostToolUseFailure` hook events. Called when a tool execution fails.

| Field | Type | Description |
| --- | --- | --- |
| `hook_event_name` | `Literal["PostToolUseFailure"]` | Always “PostToolUseFailure” |
| `tool_name` | `str` | Name of the tool that failed |
| `tool_input` | `dict[str, Any]` | Input parameters that were used |
| `tool_use_id` | `str` | Unique identifier for this tool use |
| `error` | `str` | Error message from the failed execution |
| `is_interrupt` | `bool` (optional) | True when the failure reached Claude Code as an abort rather than as an error the tool reported. Cancelling a running tool with `interrupt()` does not fire this hook; the tool result carries the interruption message instead |
| `agent_id` | `str` (optional) | Subagent identifier, present when the hook fires inside a subagent |
| `agent_type` | `str` (optional) | Subagent type, present when the hook fires inside a subagent |

### `UserPromptSubmitHookInput`

Input data for `UserPromptSubmit` hook events.

| Field | Type | Description |
| --- | --- | --- |
| `hook_event_name` | `Literal["UserPromptSubmit"]` | Always “UserPromptSubmit” |
| `prompt` | `str` | The submitted prompt |

### `StopHookInput`

Input data for `Stop` hook events.

| Field | Type | Description |
| --- | --- | --- |
| `hook_event_name` | `Literal["Stop"]` | Always “Stop” |
| `stop_hook_active` | `bool` | Whether the stop hook is active |

### `SubagentStopHookInput`

Input data for `SubagentStop` hook events.

| Field | Type | Description |
| --- | --- | --- |
| `hook_event_name` | `Literal["SubagentStop"]` | Always “SubagentStop” |
| `stop_hook_active` | `bool` | Whether the stop hook is active |
| `agent_id` | `str` | Unique identifier for the subagent |
| `agent_transcript_path` | `str` | Path to the subagent’s transcript file |
| `agent_type` | `str` | Type of the subagent |

### `PreCompactHookInput`

Input data for `PreCompact` hook events.

| Field | Type | Description |
| --- | --- | --- |
| `hook_event_name` | `Literal["PreCompact"]` | Always “PreCompact” |
| `trigger` | `Literal["manual", "auto"]` | What triggered the compaction |
| `custom_instructions` | `str | None` | Custom instructions for compaction |

### `NotificationHookInput`

Input data for `Notification` hook events.

| Field | Type | Description |
| --- | --- | --- |
| `hook_event_name` | `Literal["Notification"]` | Always “Notification” |
| `message` | `str` | Notification message content |
| `title` | `str` (optional) | Notification title |
| `notification_type` | `str` | Type of notification |

### `SubagentStartHookInput`

Input data for `SubagentStart` hook events.

| Field | Type | Description |
| --- | --- | --- |
| `hook_event_name` | `Literal["SubagentStart"]` | Always “SubagentStart” |
| `agent_id` | `str` | Unique identifier for the subagent |
| `agent_type` | `str` | Type of the subagent |

### `PermissionRequestHookInput`

Input data for `PermissionRequest` hook events. Allows hooks to handle permission decisions programmatically.

| Field | Type | Description |
| --- | --- | --- |
| `hook_event_name` | `Literal["PermissionRequest"]` | Always “PermissionRequest” |
| `tool_name` | `str` | Name of the tool requesting permission |
| `tool_input` | `dict[str, Any]` | Input parameters for the tool |
| `permission_suggestions` | `list[Any]` (optional) | Suggested permission updates from the CLI |
| `agent_id` | `str` (optional) | Subagent identifier, present when the hook fires inside a subagent |
| `agent_type` | `str` (optional) | Subagent type, present when the hook fires inside a subagent |

### `HookJSONOutput`

Union type for hook callback return values.

#### `SyncHookJSONOutput`

Synchronous hook output with control and decision fields.

#### `HookSpecificOutput`

A discriminated union of event-specific `TypedDict` output types. The `hookEventName` field determines which fields are valid. For full details on available fields per hook event, see [Control execution with hooks](https://code.claude.com/docs/en/agent-sdk/hooks#outputs).

#### `AsyncHookJSONOutput`

Async hook output that defers hook execution.

### Hook Usage Example

This example registers two hooks: one that blocks dangerous Bash commands like `rm -rf /`, and another that logs all tool usage for auditing. The security hook only runs on Bash commands (via the `matcher`), while the logging hook runs on all tools.

## Tool Input/Output Types

Documentation of input/output schemas for built-in Claude Code tools. While the Python SDK doesn’t export these as types, they represent the structure of tool inputs and outputs in messages. Each output shown is the value you read from [`UserMessage.tool_use_result`](#usermessage) for that tool. Key names appear exactly as Claude Code emits them. A key annotated `| None` with a “present when” or “optional” comment is omitted when it doesn’t apply.

### Agent

**Tool name:** `Agent`. The previous name `Task` is still accepted as an alias when this tool is available to the session. The `tools` list in the init [`SystemMessage`](#systemmessage) reports this tool as `Task` for backward compatibility. **Input:**

Launches a new agent to handle complex, multi-step tasks autonomously. When Claude leaves `run_in_background` out of an `Agent` call, by default your main agent doesn’t wait for the new agent and a subagent waits:

-   **From your main agent**: the new agent runs in the background, and the result has `status: "async_launched"`. To make your main agent wait for the new agent instead, see [Choose whether Claude waits for subagents](https://code.claude.com/docs/en/agent-sdk/subagents#choose-whether-claude-waits-for-subagents).
-   **From one of your subagents**: the calling subagent [waits for the new agent](https://code.claude.com/docs/en/sub-agents#let-subagents-spawn-their-own-subagents). The new agent runs in the background instead when its definition sets [`background`](#agentdefinition) to `True`, or when you [turn fork mode off](https://code.claude.com/docs/en/sub-agents#turn-fork-mode-on-or-off) by setting `CLAUDE_CODE_FORK_SUBAGENT` to `0`.

Before Python SDK v0.2.169, agents that your subagents started also ran in the background by default. That release is the first to bundle Claude Code v2.1.302 or later. **Output (status: `"completed"`):**

**Output (status: `"async_launched"`):**

**Output (status: `"remote_launched"`):**

Returns the result from the subagent. The output is discriminated on the `status` field: `"completed"` for finished tasks, `"async_launched"` for background tasks, and `"remote_launched"` for tasks Claude Code dispatched to a cloud session, where `sessionUrl` links to that session and `taskId` identifies it. If Claude Code [kept the subagent’s isolated worktree](https://code.claude.com/docs/en/worktrees#isolate-subagents-with-worktrees), `worktreePath` on the `completed` variant is where to find it, and `worktreeBranch` is its branch when Claude Code created the worktree with git. On the `completed` variant, `resolvedModel` names the model the subagent started on, which can differ from the requested `model` input when [`availableModels`](https://code.claude.com/docs/en/model-config#restrict-model-selection) or another override applies. This field requires Claude Code v2.1.174 or later. On the `async_launched` variant, `resolvedModel` names the model in use when the agent moved to the background, so a swap that happened before backgrounding is reflected there. The `modelsUsed` field on both variants lists the models used in order, with consecutive repeats collapsed; it’s set only when the model was swapped mid-run. `modelsUsed` and the backgrounding-time `resolvedModel` behavior require Claude Code v2.1.212 or later. Claude Code fills `usage` and `totalTokens` from the subagent’s final API request, not from the whole run. When present, `thinking_tokens` under `output_tokens_details` in `usage` is the number of that request’s output tokens that were thinking tokens. The `output_tokens_details` key requires Python SDK v0.2.136 or later, which bundles Claude Code v2.1.228. The `fallback_credit` key requires Python SDK v0.2.162 or later, which bundles Claude Code v2.1.285.

### AskUserQuestion

**Tool name:** `AskUserQuestion` Asks the user clarifying questions during execution. See [Handle approvals and user input](https://code.claude.com/docs/en/agent-sdk/user-input#handle-clarifying-questions) for usage details. **Input:**

**Output:**

### Bash

**Tool name:** `Bash` For what sets the foreground ceiling, see [Timeout and output limits](https://code.claude.com/docs/en/tools-reference#timeout-and-output-limits). For the background time limit, see [Time limit for background commands](https://code.claude.com/docs/en/tools-reference#time-limit-for-background-commands). **Input:**

**Output:**

### Monitor

**Tool name:** `Monitor` Runs a background source and delivers each event to Claude so it can react without polling: `command` runs a script and emits one event per stdout line, and `ws` opens a WebSocket and emits one event per text frame. Provide exactly one of `command` or `ws`. When Monitor runs a command, it follows the same permission rules as Bash; a WebSocket watch prompts for approval separately. The `ws` source requires Claude Code v2.1.195 or later. See the [Monitor tool reference](https://code.claude.com/docs/en/tools-reference#monitor-tool) for behavior and provider availability. **Input:**

**Output:**

### Edit

**Tool name:** `Edit` **Input:**

**Output:**

### Read

**Tool name:** `Read` **Input:**

The output takes one of the following shapes depending on what Claude read. Check the `type` key to tell them apart. **Output (type: `"text"`):**

**Output (type: `"image"`):**

**Output (type: `"notebook"`):**

**Output (type: `"pdf"`):**

**Output (type: `"parts"`):**

**Output (type: `"file_unchanged"`):**

### Write

**Tool name:** `Write` **Input:**

**Output:**

### Glob

**Tool name:** `Glob` **Input:**

**Output:**

`totalMatches` and `countIsComplete` require Claude Code v2.1.191 or later.

### Grep

**Tool name:** `Grep` **Input:**

**Output:**

Grep returns this dict shape in each output mode. Which optional keys are present depends on `output_mode`. `totalFiles` requires Claude Code v2.1.208 or later. `totalLines` requires Claude Code v2.1.210 or later.

### NotebookEdit

**Tool name:** `NotebookEdit` **Input:**

**Output:**

### WebFetch

**Tool name:** `WebFetch` **Input:**

**Output:**

### WebSearch

**Tool name:** `WebSearch` **Input:**

**Output:**

### TodoWrite

**Tool name:** `TodoWrite`

**Input:**

**Output:**

### TaskCreate

**Tool name:** `TaskCreate` **Input:**

**Output:**

### TaskUpdate

**Tool name:** `TaskUpdate` **Input:**

**Output:**

### TaskGet

**Tool name:** `TaskGet` **Input:**

**Output:**

### TaskList

**Tool name:** `TaskList` **Input:**

**Output:**

### TaskOutput

Removed in Claude Code v2.1.277. Previously retrieved output from a running or completed background task, with `BashOutput` accepted as an alias; Claude reads a background task’s output file with `Read` instead. A `disallowed_tools` entry or a deny rule that still names either name is ignored without a warning.

### TaskStop

**Tool name:** `TaskStop`. You can still use the previous names `KillShell` and `KillBash` in permission rules, in hook matchers, and in the `tools`, `allowed_tools`, and `disallowed_tools` options. **Input:**

**Output:**

### ExitPlanMode

**Tool name:** `ExitPlanMode` **Input:**

**Output:**

### ListMcpResources

**Tool name:** `ListMcpResourcesTool` **Input:**

The result is a list rather than a dict, so `tool_use_result` holds a `list` for this tool. **Output:**

### ReadMcpResource

**Tool name:** `ReadMcpResourceTool` **Input:**

**Output:**

## Build a continuous conversation interface

The following example keeps one `ClaudeSDKClient` connected across turns, so Claude remembers earlier messages. Type `new` to disconnect and reconnect for a fresh session, or `exit` to end the conversation.

## Error handling

The following example wraps a `query()` call in handlers for four of the [error types](#error-types) the SDK raises. This example catches [`ResultError`](#resulterror), which requires Python Agent SDK 0.2.140 or later.

## Sandbox Configuration

### `SandboxSettings`

Configuration for sandbox behavior. Use this to enable command sandboxing and configure network restrictions programmatically.

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `enabled` | `bool` | `False` | Enable sandbox mode for command execution |
| `autoAllowBashIfSandboxed` | `bool` | `True` | Auto-approve bash commands when sandbox is enabled |
| `excludedCommands` | `list[str]` | `[]` | Commands that bypass sandbox restrictions, such as `["docker *"]`. These run unsandboxed automatically without model involvement; [`sandbox.excludedCommands`](https://code.claude.com/docs/en/settings-reference#sandbox-excludedcommands) covers when an entry applies |
| `allowUnsandboxedCommands` | `bool` | `True` | Allow the model to request running commands outside the sandbox. When `True`, the model can set `dangerouslyDisableSandbox` in tool input, which falls back to the [permissions system](#permissions-fallback-for-unsandboxed-commands) |
| `network` | [`SandboxNetworkConfig`](#sandboxnetworkconfig) | `None` | Network-specific sandbox configuration |
| `ignoreViolations` | [`SandboxIgnoreViolations`](#sandboxignoreviolations) | `None` | Configure which sandbox violations to ignore |
| `enableWeakerNestedSandbox` | `bool` | `False` | Enable a weaker nested sandbox for compatibility |

To keep sandboxed commands from writing to a file, list its absolute path under [`denyWrite`](https://code.claude.com/docs/en/settings-reference#sandbox-filesystem-denywrite) in your sandbox settings, such as `"filesystem": {"denyWrite": ["/home/user/project/.env"]}`. The SDK forwards `filesystem` to Claude Code along with the declared `SandboxSettings` fields. Once the sandbox starts, it blocks writes to each absolute path you listed.

#### Example usage

### `SandboxNetworkConfig`

Network-specific configuration for sandbox mode. These settings apply to sandboxed Bash commands when `enabled` is `True` in the parent [`SandboxSettings`](#sandboxsettings). They do not restrict the WebFetch tool, which uses [permission rules](https://code.claude.com/docs/en/permissions#webfetch) instead.

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `allowedDomains` | `list[str]` | `[]` | Domain names that sandboxed processes can access |
| `deniedDomains` | `list[str]` | `[]` | Domain names that sandboxed processes cannot access. Takes precedence over `allowedDomains` |
| `allowManagedDomainsOnly` | `bool` | `False` | Managed-settings only: when set in managed settings, ignore `allowedDomains` and `WebFetch(domain:...)` allow rules from non-managed settings sources. Has no effect when set via SDK options |
| `allowUnixSockets` | `list[str]` | `[]` | macOS only: Unix socket paths that processes can access, such as the Docker socket. Ignored on Linux |
| `allowAllUnixSockets` | `bool` | `False` | Allow access to all Unix sockets, and on Linux to VM sockets (`AF_VSOCK`) |
| `allowLocalBinding` | `bool` | `False` | Allow processes to bind to local ports (for example, for dev servers) |
| `allowMachLookup` | `list[str]` | `[]` | macOS only: XPC/Mach service names to allow. Supports a trailing wildcard |
| `httpProxyPort` | `int` | `None` | HTTP proxy port for network requests |
| `socksProxyPort` | `int` | `None` | SOCKS proxy port for network requests |

### `SandboxIgnoreViolations`

Configuration for ignoring specific sandbox violations.

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `file` | `list[str]` | `[]` | File path patterns to ignore violations for |
| `network` | `list[str]` | `[]` | Network patterns to ignore violations for |

### Permissions Fallback for Unsandboxed Commands

When `allowUnsandboxedCommands` is enabled, the model can request to run commands outside the sandbox by setting `dangerouslyDisableSandbox: True` in the tool input. These requests fall back to the existing permissions system, meaning your `can_use_tool` handler is invoked, allowing you to implement custom authorization logic. Your `excludedCommands` entries instead take a call out of the sandbox with no model involvement; [`sandbox.excludedCommands`](https://code.claude.com/docs/en/settings-reference#sandbox-excludedcommands) covers when an entry applies. The following example logs each unsandboxed request and denies it unless your own authorization logic allows it:

## See also

-   [SDK overview](https://code.claude.com/docs/en/agent-sdk/overview) - General SDK concepts
-   [TypeScript SDK reference](https://code.claude.com/docs/en/agent-sdk/typescript) - TypeScript SDK documentation
-   [Custom tools](https://code.claude.com/docs/en/agent-sdk/custom-tools) - Define in-process MCP tools for Claude to call
-   [CLI reference](https://code.claude.com/docs/en/cli-reference) - Command-line interface
-   [Common workflows](https://code.claude.com/docs/en/common-workflows) - Step-by-step guides
