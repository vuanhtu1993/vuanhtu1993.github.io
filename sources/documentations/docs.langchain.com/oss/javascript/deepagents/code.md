---
title: "Deep Agents Code - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/deepagents/code"
crawled_at: "2026-06-17T14:57:08.891Z"
---

Deep Agents Code (`dcode`) is an open source coding agent built on the [Deep Agents SDK](https://docs.langchain.com/oss/javascript/deepagents/quickstart). It works with any large language model and supports switching between providers or models mid-session. Persistent memory carries context across conversations, customizable skills shape its behavior, and approval controls gate code execution.

## Quickstart

## Capabilities

Deep Agents Code has the following built-in capabilities:

-   **File operations** - read, write, and edit files on disk.
-   **Shell execution** - execute commands to run tests, build projects, manage dependencies, and interact with version control.
-   **[Remote sandboxes](https://docs.langchain.com/oss/javascript/deepagents/code/remote-sandboxes)** - run agent tools remotely instead of on your local machine.
-   **Web search** - search the web for up-to-date information and documentation. Requires a [Tavily API key](https://docs.langchain.com/oss/javascript/deepagents/code/configuration#enable-web-search-with-tavily).
-   **Task planning and tracking** - break down complex tasks into discrete steps and track progress.
-   **[Subagents](https://docs.langchain.com/oss/javascript/deepagents/code/subagents)** - delegate work to task-specific subagents.
-   **[Memory storage and retrieval](https://docs.langchain.com/oss/javascript/deepagents/code/memory-and-skills#memory)** - store and retrieve information across sessions, enabling agents to remember project conventions and learned patterns.
-   **Context compaction & offloading** - summarize older conversation messages and offload originals to storage.
-   **Human-in-the-loop** - require human approval for sensitive tool operations.
-   **[Skills](https://docs.langchain.com/oss/javascript/deepagents/code/memory-and-skills#skills)** - extend agent capabilities with custom expertise and instructions.
-   **[MCP tools](https://docs.langchain.com/oss/javascript/deepagents/code/mcp-tools)** - load external tools from [Model Context Protocol](https://modelcontextprotocol.io/) servers.
-   **[Tracing](https://docs.langchain.com/oss/javascript/deepagents/code/overview#trace-with-langsmith)** - trace agent operations in LangSmith for observability and debugging.

Full list of built-in tools

## Built-in tools

The agent comes with the following built-in tools which are available without configuration:

| Tool | Description | Human-in-the-Loop |
| --- | --- | --- |
| `ls` | List files and directories | \- |
| `read_file` | Read contents of a file; returns multimodal blocks for images, audio, video, and PDFs | \- |
| `write_file` | Create or overwrite a file | Required1 |
| `edit_file` | Make targeted edits to existing files | Required1 |
| `glob` | Find files matching a pattern | \- |
| `grep` | Search for text patterns across files | \- |
| `execute` | Execute shell commands locally or in a [remote sandbox](https://docs.langchain.com/oss/javascript/deepagents/code/remote-sandboxes) | Required1 |
| `web_search` | Search the web using Tavily (see [Enable web search](https://docs.langchain.com/oss/javascript/deepagents/code/configuration#enable-web-search-with-tavily)) | Required1 |
| `fetch_url` | Fetch and convert web pages to markdown | Required1 |
| `task` | Delegate work to [subagents](https://docs.langchain.com/oss/javascript/deepagents/code/subagents) for parallel execution3 | Required1 |
| `ask_user` | Ask the user free-form or multiple-choice questions | \- |
| `compact_conversation` | Summarize older messages, offload originals to backend storage, and replace them in context with the summary | Mixed2 |
| `write_todos` | Create and manage task lists for complex work | \- |
| `get_current_thread_id` | Return the current thread ID for LangSmith or MCP tooling | \- |

1: Potentially destructive operations require user approval before execution. To bypass human approval, you can toggle auto-approve (shift+tab) or start with the option:

```
dcode --auto-approve
# shorter alias:
dcode -y
```

2: Deep Agents Code automatically offloads the conversation in the background when token usage exceeds a model-aware threshold. Offloading summarizes older messages via the LLM, and ejects originals to storage (`/conversation_history/{thread_id}.md`), replacing them in context with the summary. The agent can still retrieve the full history from the offloaded file if needed. The `compact_conversation` tool lets the agent (or you) trigger offloading on demand. When called as a tool, it requires user approval by default.3: When async subagents are configured via the `[async_subagents]` section in `config.toml` (see [Async subagents](https://docs.langchain.com/oss/javascript/deepagents/async-subagents)), additional tools become available: `start_async_task`, `update_async_task`, and `cancel_async_task` (all approval-gated), plus `check_async_task` and `list_async_tasks`.

## Command reference

```
# Use a specific agent configuration
dcode --agent mybot

# Use a specific model (provider:model format or auto-detect)
dcode --model anthropic:claude-opus-4-8
dcode --model gpt-5.5

# Auto-approve tool usage (skip human-in-the-loop prompts)
dcode -y

# list directory contents, then summarize directory as first prompt—the command runs first, then the prompt is submitted
# the prompt does NOT have access to the command output
dcode --startup-cmd "ls -la" -m "Summarize what's in this directory"

# Non-interactive with startup command: show git status before the task runs
# the task does NOT have access to the command output
dcode --startup-cmd "git diff --stat" -n "Review these changes"
```

Command-line options

| Option | Description |
| --- | --- |
| `-a`, `--agent NAME` | Use named agent with separate memory. Overrides `[agents].recent` in `config.toml`. Default: `agent` (or the most recently used agent if `[agents].recent` is set) |
| `-M`, `--model MODEL` | Use a specific model (`provider:model`) |
| `--model-params JSON` | Extra kwargs to pass to the model as a JSON string (e.g., `'{"temperature": 0.7}'`) |
| `--max-retries N` | Override the max retries for transient model errors |
| `--default-model [MODEL]` | Set the [default model](https://docs.langchain.com/oss/javascript/deepagents/code/providers#set-a-default-model) (omit `MODEL` to view the current default) |
| `--clear-default-model` | Clear the [default model](https://docs.langchain.com/oss/javascript/deepagents/code/providers#set-a-default-model) |
| `-r`, `--resume [ID]` | Resume a session: `-r` for most recent, `-r <ID>` for a specific thread |
| `-m`, `--message TEXT` | Initial prompt to auto-submit when the session starts (interactive mode) |
| `--skill NAME` | Invoke a skill at startup |
| `--startup-cmd CMD` | Shell command to run at startup, before the first prompt. Output is rendered in the transcript for your reference but is **not** added to the agent’s message history. To hand command output to the agent, pipe it in via stdin instead (e.g., `git diff | dcode -n "Review these changes"`). Non-zero exits and timeouts warn but do not abort; non-interactive mode applies a 60s timeout. |
| `-n`, `--non-interactive TEXT` | Run a single task non-interactively and exit. Shell is disabled unless `--shell-allow-list` is set |
| `--max-turns N` | Cap agentic turns in non-interactive mode. Exits with code 124 when exceeded. Requires `-n` or piped stdin. See [Cap turn count with `--max-turns`](#non-interactive-mode-and-piping) |
| `--timeout SECONDS` | Hard wall-clock timeout for non-interactive mode. Exits with code 124 when exceeded. Requires `-n` or piped stdin. See [Cap wall-clock time with `--timeout`](#non-interactive-mode-and-piping) |
| `-q`, `--quiet` | Clean output for piping—only the agent’s response goes to stdout. Requires `-n` or piped stdin |
| `--no-stream` | Buffer the full response and write to stdout at once instead of streaming. Requires `-n` or piped stdin |
| `--stdin` | Read input from stdin explicitly instead of auto-detection. Errors clearly when stdin is unavailable or is a TTY |
| `-y`, `--auto-approve` | Auto-approve all tool calls without prompting (disables human-in-the-loop). Toggle with `Shift+Tab` during an interactive session |
| `-S`, `--shell-allow-list LIST` | Comma-separated shell commands to auto-approve, `'recommended'` for safe defaults, or `'all'` to allow any command. Applies to both `-n` and interactive modes |
| `--json` | Emit machine-readable JSON from management subcommands (`agents`, `threads`, `skills`, `update`). Output envelope: `{"schema_version": 1, "command": "...", "data": ...}` |
| `--sandbox TYPE` | Remote sandbox for code execution: `none` (default), `langsmith`, `agentcore`, `modal`, `daytona`, `runloop`. LangSmith is included; AgentCore/Modal/Daytona/Runloop require extras |
| `--sandbox-id ID` | Reuse an existing sandbox (skips creation and cleanup) |
| `--sandbox-snapshot-name NAME` | Sandbox snapshot name to use or create (LangSmith only) |
| `--sandbox-setup PATH` | Path to setup script to run in sandbox after creation |
| `--mcp-config PATH` | Add an explicit MCP config as the highest-precedence source (merged with auto-discovered configs) |
| `--no-mcp` | Disable all MCP tool loading |
| `--trust-project-mcp` | Trust project-level MCP configs with stdio servers (skip approval prompt) |
| `--interpreter` | Enable the JS interpreter (`js_eval`) middleware on the main agent. Local mode only; requires the `quickjs` optional extra |
| `--interpreter-tools VALUE` | PTC allowlist for `js_eval`: `safe`, `all`, or a comma-separated list of tool names. Default: no PTC (pure REPL) |
| `--profile-override JSON` | Override model profile fields as a JSON string (e.g., `'{"max_input_tokens": 4096}'`). Merged on top of config file profile overrides |
| `--acp` | Run as an ACP server over stdio instead of launching the interactive UI |
| `--update` | Check for and install updates, then exit |
| `--auto-update` | Toggle automatic updates on or off, then exit |
| `--install NAME` | Install an optional extra (e.g., `quickjs`, `daytona`, `fireworks`), then exit. Add `--package` to treat `NAME` as a custom provider package installed via `uv --with` rather than an extra (see [arbitrary providers](https://docs.langchain.com/oss/javascript/deepagents/code/configuration#arbitrary-providers)), and `--yes` to skip confirmation prompts |
| `-v`, `--version` | Display version |
| `-h`, `--help` | Show help |

CLI commands

| Command | Description |
| --- | --- |
| `dcode help` | Show help |
| `dcode agents list` | List all agents (alias: `ls`) |
| `dcode agents reset --agent NAME` | Clear agent memory and reset to default. Supports `--dry-run` |
| `dcode agents reset --agent NAME --target SOURCE` | Copy memory from another agent |
| `dcode update` | Check for and install Deep Agents Code updates |
| `dcode skills list [--project]` | List all skills (alias: `ls`) |
| `dcode skills create NAME [--project]` | Create a new skill with template `SKILL.md`. Idempotent—re-creating an existing skill prints an informational message instead of an error |
| `dcode skills info NAME [--project]` | Show detailed information about a skill |
| `dcode skills delete NAME [--project] [-f]` | Delete a skill and its contents. Supports `--dry-run` |
| `dcode threads list [--agent NAME] [--limit N]` | List sessions (alias: `ls`). Default limit: 20. `-n` is a short flag for `--limit`. Additional flags: `--sort {created,updated}`, `--branch TEXT` (filter by git branch), `--cwd [PATH]` (filter by working directory; bare flag uses current directory), `-v`/`--verbose` (show all columns including branch, created time, and initial prompt), `-r`/`--relative` (relative timestamps) |
| `dcode threads delete ID` | Delete a session. Supports `--dry-run` |
| `dcode mcp login NAME [--mcp-config PATH]` | Run the OAuth login flow for an MCP server marked `auth: "oauth"`. See [MCP tools](https://docs.langchain.com/oss/javascript/deepagents/code/mcp-tools#oauth-login) |
| `dcode mcp config` | Show MCP config discovery paths |
| `dcode config show` | Show every config option’s effective value and the source it resolves from. See [Inspect configuration](https://docs.langchain.com/oss/javascript/deepagents/code/configuration#inspect-configuration) |
| `dcode config list` | List all available config options with their type, default, and where each can be set (alias: `ls`) |
| `dcode config get KEY` | Show the effective value and source for one option (e.g. `interpreter.memory_limit_mb`) |
| `dcode config path` | Show config file locations and whether each exists |

All management subcommands support `--json` for machine-readable output. See [command-line options](#command-line-options) for details.Destructive commands (`agents reset`, `skills delete`, `threads delete`) support `--dry-run` to preview what would happen without making changes. In JSON mode, `--dry-run` returns the same envelope with a `dry_run: true` field.

## Configuration

For the full reference—including `config.toml` schema, provider parameters, profile overrides, and hook configuration—see [Configuration](https://docs.langchain.com/oss/javascript/deepagents/code/configuration). Deep Agents Code stores all configuration under `~/.deepagents/`. Within that directory, each agent gets its own subdirectory (default: `agent`):

| Path | Purpose |
| --- | --- |
| `~/.deepagents/config.toml` | Model and agent defaults, provider settings, constructor params, profile overrides, themes, update settings |
| `~/.deepagents/.env` | Global API keys and secrets. See [configuration](https://docs.langchain.com/oss/javascript/deepagents/code/configuration#environment-variables) |
| `~/.deepagents/hooks.json` | [Lifecycle event hooks](https://docs.langchain.com/oss/javascript/deepagents/code/configuration#hooks) (session start/end, task complete, etc.) |
| `~/.deepagents/<agent_name>/` | Per-agent memory, skills, and conversation threads |
| `.deepagents/` (project root) | Project-specific memory and skills, loaded when running inside a git repo |

## Interactive mode

Type naturally as you would in a chat interface. The agent uses its built-in tools, skills, and memory to help you with tasks.

Slash commands

Use these commands within a Deep Agents Code session:

-   `/model` - Switch models or open the interactive model selector.
-   `/agents` - Hot-swap between pre-configured agents without relaunching. See [Command reference](https://docs.langchain.com/oss/javascript/deepagents/code/overview#command-reference) for details
-   `/auth` - Manage stored API keys for model providers. See [Provider credentials](https://docs.langchain.com/oss/javascript/deepagents/code/configuration#provider-credentials) for details
-   `/remember [context]` - Review conversation and update memory and skills. Optionally pass additional context
-   `/skill:<name> [args]` - Directly invoke a skill by name. The skill’s `SKILL.md` instructions are injected into the prompt along with any arguments you provide
-   `/skill-creator [task]` - Guide for creating effective agent skills
-   `/offload` (alias `/compact`) - Free up context window space by offloading messages to storage with a summary placeholder. The agent can retrieve the full history from the offloaded file if needed
-   `/tokens` - Display current context window token usage breakdown
-   `/clear` - Clear conversation history and start a new thread
-   `/copy` - Copy the latest assistant message to the clipboard
-   `/threads` - Browse and resume previous conversation threads
-   `/mcp [login <server> | reconnect]` - Show active MCP servers and tools. `login <server>` runs the OAuth flow for a server; `reconnect` loads deferred logins
-   `/notifications` - Configure startup warning preferences
-   `/reload` - Re-read `.env` files, refresh configuration, and re-discover skills without restarting. Conversation state is preserved. See [`DEEPAGENTS_CODE_` prefix](https://docs.langchain.com/oss/javascript/deepagents/code/configuration#deepagents_code_-prefix) for override behavior
-   `/theme` - Open the interactive theme selector to switch color themes. Built-in themes are available plus any [user-defined themes](https://docs.langchain.com/oss/javascript/deepagents/code/configuration#themes)
-   `/update` - Check for and install Deep Agents Code updates inline. Detects your install method (uv, Homebrew, pip) and runs the appropriate upgrade command
-   `/auto-update` - Toggle automatic updates on or off
-   `/install` - Install an optional extra (e.g., `quickjs`, `daytona`, `fireworks`)
-   `/trace` - Open the current thread in LangSmith (requires `LANGSMITH_API_KEY`)
-   `/editor` - Open the current prompt in your external editor (`$VISUAL` / `$EDITOR`). See [External editor](https://docs.langchain.com/oss/javascript/deepagents/code/configuration#external-editor)
-   `/timestamps` - Toggle message timestamp footers
-   `/changelog` - Open Deep Agents Code changelog in your browser
-   `/docs` - Open the documentation in your browser
-   `/feedback` - Open the GitHub issues page to file a bug report or feature request
-   `/version` - Show installed `deepagents-code` and SDK versions
-   `/help` - Show help and available commands
-   `/quit` - Exit application

Shell commands

Type `!` to enter shell mode, then type your command.

```
git status
npm test
ls -la
```

Keyboard shortcuts

**General**

| Shortcut | Action |
| --- | --- |
| `Enter` | Submit prompt |
| `Shift+Enter`, `Ctrl+J`, `Alt+Enter`, or `Ctrl+Enter` | Insert newline |
| `@filename` | Auto-complete files and inject content |
| `Shift+Tab` or `Ctrl+T` | Toggle auto-approve |
| `Ctrl+X` | Open prompt in external editor |
| `Ctrl+N` | Review pending notifications |
| `Ctrl+O` | Expand/collapse the most recent tool output |
| `Escape` | Interrupt current operation |
| `Ctrl+C` | Interrupt or quit |
| `Ctrl+D` | Exit |

**Text editing in the prompt**The chat input uses standard readline-style bindings:

| Shortcut | Action |
| --- | --- |
| `Ctrl+A` or `Home` | Move cursor to start of line |
| `Ctrl+E` or `End` | Move cursor to end of line |
| `Ctrl+U` | Delete from cursor to start of line |
| `Ctrl+K` | Delete from cursor to end of line |
| `Ctrl+W` or `Ctrl+Backspace` | Delete word to the left |
| `Ctrl+Left` / `Ctrl+Right` | Move cursor one word left/right |

## Non-interactive mode and piping

Use `-n` to run a single task without launching the interactive UI:

```
dcode -n "Write a Python script that prints hello world"
```

Each non-interactive run starts a fresh thread—conversation history does not carry between invocations. File-based state (memory, skills, configuration) persists. You can also pipe input via stdin. When input is piped, Deep Agents Code automatically runs non-interactively:

```
echo "Explain this code" | dcode
cat error.log | dcode -n "What's causing this error?"
git diff | dcode -n "Review these changes"
git diff | dcode --skill code-review -n 'summarize changes'
```

When you combine piped input with `-n` or `-m`, the piped content appears first, followed by the text you pass to the flag.

Shell execution is disabled by default in non-interactive mode. Use `-S`/`--shell-allow-list` to enable specific commands (e.g., `-S "pytest,git,make"`), `recommended` for safe defaults, or `all` to permit any command.

## Trace with LangSmith

Enable [LangSmith](https://smith.langchain.com/?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=oss-deepagents-code-overview) tracing to see agent operations, tool calls, and decisions in a LangSmith project. Add your tracing keys to `~/.deepagents/.env` so tracing is enabled in every session without per-shell exports:

~/.deepagents/.env

```
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=lsv2_...
LANGSMITH_PROJECT=optional-project-name  # Specify a project name or default to "deepagents-code"
```

To override for a specific project, add the same keys to a `.env` in the project directory. See [environment variables](https://docs.langchain.com/oss/javascript/deepagents/code/configuration#environment-variables) for the full loading order. You can also set these as shell environment variables if you prefer. Shell exports always take precedence over `.env` values, so this is a good option for temporary overrides or testing:

```
export LANGSMITH_TRACING=false
```

Separate agent traces from app traces

Deep Agents Code can produce two kinds of LangSmith traces:

-   `Agent traces` are Deep Agents Code’s own model calls, tool calls, orchestration, and middleware.
-   `Shell-command traces` are traces emitted by code that Deep Agents Code runs for you in a shell, such as tests, scripts, or a local LangGraph app.

To send Deep Agents Code’s own traces to a dedicated project, set `DEEPAGENTS_CODE_LANGSMITH_PROJECT`:

~/.deepagents/.env

```
# Example value; use any LangSmith project name you want.
DEEPAGENTS_CODE_LANGSMITH_PROJECT=deepagents-code
```

Then configure `LANGSMITH_PROJECT` for your application traces:

.env

```
LANGSMITH_PROJECT=customer-support-agent
```

For example, suppose you ask Deep Agents Code to debug a failing LangGraph test:

```
uv run pytest tests/test_escalation_flow.py
```

If that test runs your app with LangSmith tracing enabled, those app traces are created by the shell process and go to `customer-support-agent`. Deep Agents Code’s own reasoning and tool-use traces go to `deepagents-code`.You can also scope LangSmith credentials to Deep Agents Code using the [`DEEPAGENTS_CODE_` prefix](https://docs.langchain.com/oss/javascript/deepagents/code/configuration#deepagents_code_-prefix) (e.g., `DEEPAGENTS_CODE_LANGSMITH_API_KEY`).

Dual-write traces to a second project

To mirror agent traces to a second LangSmith project, set `DEEPAGENTS_CODE_LANGSMITH_REPLICA_PROJECTS`. This is useful for sending the same traces to both a personal project and a shared team project.

~/.deepagents/.env

```
DEEPAGENTS_CODE_LANGSMITH_REPLICA_PROJECTS=team-shared
```

When set and tracing is active, each agent run is written to both the primary project (`DEEPAGENTS_CODE_LANGSMITH_PROJECT`, or `deepagents-code` by default) and the project you name here. Leave the variable unset to write to a single project as usual.

When configured, Deep Agents Code displays a status line with a link to the LangSmith project. In supported terminals, click the link to open it directly. You can also use `/trace` to print the URL and open it in your browser.

```
✓ LangSmith tracing: 'my-project'
```

---
