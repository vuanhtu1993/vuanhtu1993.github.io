---
title: "Deep Agents overview - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/deepagents/harness"
crawled_at: "2026-06-17T14:57:49.995Z"
---

Deep Agents is the easiest way to start building agents and applications that are powered by LLMs—with built-in capabilities for task planning, file systems for context management, subagent-spawning, and long-term memory. You can use deep agents for any task, including complex, multi-step tasks. Deep Agents comes with the following built-in capabilities:

-   **Take actions in an environment**: Take actions via tools, read and write files, execute code
-   **Connect to your data**: Load memories, skills, and domain knowledge at the right moment
-   **Manage growing context**: Summarize history and offload large results across long runs
-   **Parallelize tasks**: Delegate to general or specialized subagents running in isolated context windows
-   **Stay in the loop**: Pause for human approval at critical decision points
-   **Improve over time**: Update memory, skills, and prompts based on real usage

See [Core capabilities](#core-capabilities) for a full breakdown of each component.

## Quickstart

```
import * as z from "zod";
// npm install deepagents langchain @langchain/core
import { createDeepAgent } from "deepagents";
import { tool } from "langchain";

const getWeather = tool(
  ({ city }) => `It's always sunny in ${city}!`,
  {
    name: "get_weather",
    description: "Get the weather for a given city",
    schema: z.object({
      city: z.string(),
    }),
  },
);

const agent = createDeepAgent({
  tools: [getWeather],
  systemPrompt: "You are a helpful assistant",
});

console.log(
  await agent.invoke({
    messages: [{ role: "user", content: "What's the weather in Tokyo?" }],
  })
);
```

See the [Quickstart](https://docs.langchain.com/oss/javascript/deepagents/quickstart) and [Customization guide](https://docs.langchain.com/oss/javascript/deepagents/customization) to get started building your own agents and applications with Deep Agents.

## Core capabilities

![Agent harness capabilities by category](https://res.cloudinary.com/dv3vzmogk/image/upload/v1781708270/aha-mind/docs-crawler/docs.langchain.com/agent_harness_capabilities_ftcmok.svg) Deep Agents is an [“agent harness”](https://docs.langchain.com/oss/javascript/concepts/products#agent-harnesses-like-the-deep-agents-sdk). It is the same core tool calling loop as other agent frameworks, but with built-in capabilities that make agents reliable for real tasks:

[`deepagents`](https://www.npmjs.com/package/deepagents) is a standalone library built on top of [LangChain](https://docs.langchain.com/oss/javascript/langchain)’s core building blocks for agents and using [LangGraph](https://docs.langchain.com/oss/javascript/langgraph)’s tooling for running agents in production. [LangChain](https://docs.langchain.com/oss/javascript/langchain) is the framework that provides the core building blocks for your agents. To learn more about the differences between LangChain, LangGraph, and Deep Agents, see [Frameworks, runtimes, and harnesses](https://docs.langchain.com/oss/javascript/concepts/products). For a side-by-side comparison with Anthropic’s harness, see [Deep Agents vs. Claude Agent SDK](https://docs.langchain.com/oss/javascript/deepagents/comparison). For building custom agents without these built-in capabilities, consider using LangChain’s [`createAgent`](https://docs.langchain.com/oss/javascript/langchain/agents) or building a custom [LangGraph](https://docs.langchain.com/oss/javascript/langgraph/overview) workflow.

## Execution environment

The execution environment is where an agent acts. It has four layers:

-   **[Tools](#tools-and-mcp)**: custom functions, APIs, and databases the agent can call
-   **[Virtual filesystem](#virtual-filesystem-access)**: file tools backed by pluggable backends
-   **[Filesystem permissions](#filesystem-permissions)**: declarative access control over which paths agents can read or write
-   **[Code execution](#code-execution)**: sandboxed shell execution and an in-process JavaScript interpreter

**[Streaming](#streaming)** allows you to keep up with everything happening using typed event streams for messages, tools, values, and delegated tasks.

### Tools and MCP

Pass custom functions, LangChain tools, or tools from any [MCP server](https://docs.langchain.com/oss/javascript/deepagents/tools#mcp-tools) with the `tools=` parameter. Deep Agents fully support the [Model Context Protocol (MCP)](https://docs.langchain.com/oss/javascript/langchain/mcp), letting you connect to databases, APIs, file systems, and more through a standard interface.

```
from deepagents import create_deep_agent

agent = create_deep_agent(
    model="anthropic:claude-sonnet-4-6",
    tools=[search, fetch_page, run_query],
)
```

For more information on defining custom tools, using MCP servers, and the full list of built-in harness tools, see [Tools](https://docs.langchain.com/oss/javascript/deepagents/tools).

### Virtual filesystem access

The harness provides a configurable virtual filesystem which can be backed by different [pluggable backends](https://docs.langchain.com/oss/javascript/deepagents/backends): in-memory state, local disk, LangGraph store, composite routing, or a custom backend with [permission rules](https://docs.langchain.com/oss/javascript/deepagents/permissions) for read and write access. The backends support the following file system operations:

| Tool | Description |
| --- | --- |
| `ls` | List files in a directory with metadata (size, modified time) |
| `read_file` | Read file contents with line numbers, supports offset/limit for large files. Also supports returning multimodal content blocks for non-text files (images, video, audio, and documents). See supported extensions below. |
| `write_file` | Create new files |
| `edit_file` | Perform exact string replacements in files (with global replace mode) |
| `glob` | Find files matching patterns (e.g., `**/*.py`) |
| `grep` | Search file contents with multiple output modes (files only, content with context, or counts) |
| `execute` | Run shell commands in the environment (available with [sandbox backends](https://docs.langchain.com/oss/javascript/deepagents/sandboxes) only) |

Supported multimodal file extensions

| Type | Extensions |
| --- | --- |
| [Image](https://docs.langchain.com/oss/javascript/langchain/messages#multimodal) | `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.heic`, `.heif` |
| [Video](https://docs.langchain.com/oss/javascript/langchain/messages#multimodal) | `.mp4`, `.mpeg`, `.mov`, `.avi`, `.flv`, `.mpg`, `.webm`, `.wmv`, `.3gpp` |
| [Audio](https://docs.langchain.com/oss/javascript/langchain/messages#multimodal) | `.wav`, `.mp3`, `.aiff`, `.aac`, `.ogg`, `.flac` |
| [File](https://docs.langchain.com/oss/javascript/langchain/messages#multimodal) | `.pdf`, `.ppt`, `.pptx` |

Running without the default filesystem tools

To hide the filesystem tools listed above from the model, register a [harness profile](https://docs.langchain.com/oss/javascript/deepagents/profiles#harness-profiles) with `excluded_tools`:

```
from deepagents import HarnessProfile, register_harness_profile

register_harness_profile(
    "anthropic:claude-sonnet-4-6",
    HarnessProfile(
        excluded_tools=frozenset(
            {"ls", "read_file", "write_file", "edit_file", "glob", "grep"}
        ),
    ),
)
```

Removing [`FilesystemMiddleware`](https://reference.langchain.com/javascript/deepagents/middleware/createFilesystemMiddleware) itself via `excluded_middleware` is intentionally rejected—it is required scaffolding in the [default middleware stack](https://docs.langchain.com/oss/javascript/deepagents/customization#default-stack-main-agent). Use `excluded_tools` to hide only the model-visible tool surface and leave the middleware in place. To remove the `task` tool, see [Running without subagents](https://docs.langchain.com/oss/javascript/deepagents/subagents#running-without-subagents).

The virtual filesystem is used by several other harness capabilities such as skills, memory, code execution, and context management. You can also use the file system when building custom tools and middleware for Deep Agents. For more information, see [backends](https://docs.langchain.com/oss/javascript/deepagents/backends).

### Filesystem permissions

The harness supports declarative permission rules that control which files and directories the agent can read or write. Permissions apply to the built-in filesystem tools listed above and are evaluated in declaration order with first-match-wins semantics. Define permissions by passing a list of rules to `permissions=` when creating the agent. Each rule includes:

-   `operations`: `"read"` and/or `"write"`
-   `paths`: Glob patterns for files or directories
-   `mode`: `"allow"` or `"deny"`

Rules are evaluated top to bottom, and the first matching rule wins. If no rule matches, the operation is allowed. This model lets you restrict agents to specific directories (for example, `/workspace/`), protect sensitive files such as `.env` or credentials, and give subagents narrower access than the parent agent. Permissions do not apply to [sandbox backends](https://docs.langchain.com/oss/javascript/deepagents/sandboxes), which support arbitrary command execution via the `execute` tool. For custom validation logic, use [backend policy hooks](https://docs.langchain.com/oss/javascript/deepagents/backends#add-policy-hooks). For the full rule structure, examples, and subagent inheritance, see [Permissions](https://docs.langchain.com/oss/javascript/deepagents/permissions).

### Code execution

Deep Agents supports code execution in two ways:

-   [Sandbox backends](https://docs.langchain.com/oss/javascript/deepagents/sandboxes) expose an `execute` tool for shell commands in an isolated environment.
-   [Interpreters](https://docs.langchain.com/oss/javascript/deepagents/interpreters) add an `eval` tool that runs JavaScript in a scoped QuickJS runtime.

Use sandbox backends when the agent needs to install dependencies, run tests, call CLIs, or work with an operating-system filesystem. Sandbox backends implement the `SandboxBackendProtocolV2`; when detected, the harness adds the `execute` tool to the agent’s available tools. Use interpreters when the agent needs a lightweight programmable layer for loops, batching, deterministic data transformations, or programmatic tool calling. Interpreters do not provide shell access, package installs, or filesystem and network access. For sandbox setup, providers, and file transfer APIs, see [Sandboxes](https://docs.langchain.com/oss/javascript/deepagents/sandboxes). For the QuickJS runtime and programmatic tool calling, see [Interpreters](https://docs.langchain.com/oss/javascript/deepagents/interpreters).

### Streaming

[Event streaming](https://docs.langchain.com/oss/javascript/deepagents/event-streaming) exposes agent runs as typed projections for messages, tool calls, values, and output. Deep Agents add `stream.subagents` so each delegated task gets its own handle with independent message, tool-call, and nested subagent streams.

## Context management

The context management component controls what the agent knows, how long it can operate within token limits, and what it retains across sessions. It has four layers:

-   **[Skills](#skills)**—on-demand domain knowledge loaded progressively from skill files
-   **[Memory](#memory)**—persistent instructions and preferences loaded at startup from `AGENTS.md` files
-   **[Summarization and context offloading](#summarization-and-context-offloading)**—automatic compression of conversation history and large tool results
-   **[Prompt caching](#prompt-caching)**—static prompt sections are cache-eligible to speed up inference and reduce cost on supported models

### Skills

Skills package specialized workflows, domain knowledge, and custom instructions for your deep agent. Each skill follows the [Agent Skills standard](https://agentskills.io/) and lives in a directory with a `SKILL.md` file. Skills can also include scripts, templates, reference docs, and other supporting resources. Deep Agents load skills with progressive disclosure: the agent reads `SKILL.md` frontmatter at startup, then reads full skill content only when a task needs it. This keeps startup context compact while still making rich capabilities available on demand. For more information, see [Skills](https://docs.langchain.com/oss/javascript/deepagents/skills).

### Memory

Memory gives your deep agent persistent context across conversations, such as coding style, preferences, conventions, and project guidelines. Memory uses [`AGENTS.md` files](https://agents.md/) that you pass through the `memory` parameter when creating the agent. Unlike skills, memory files are always loaded, and the content is stored in the configured backend (`StateBackend`, `StoreBackend`, or `FilesystemBackend`). The agent can also update memory based on interactions and feedback, so preferences and patterns can carry forward without needing to restate them in each thread. For configuration details and examples, see [Memory](https://docs.langchain.com/oss/javascript/deepagents/customization#memory).

### Summarization and context offloading

The harness manages context so deep agents can handle long-running work within token limits while keeping the most relevant information in scope. This context flow has four parts:

-   **Input context**: System prompt, memory, skills, and tool prompts define what the agent starts with.
-   **Compression**: Built-in offloading and summarization compress conversation history and large intermediate results.
-   **Isolation**: Subagents quarantine heavy subtasks and return only final results (see [Delegation](#delegation)).
-   **Long-term memory**: Persistent storage in the virtual filesystem carries information across threads.

Together, these mechanisms support multi-step tasks that exceed a single context window while reducing manual context trimming and token usage. For configuration details, see [Context engineering](https://docs.langchain.com/oss/javascript/deepagents/context-engineering).

### Prompt caching

For Anthropic models, `create_deep_agent` automatically applies prompt caching to static sections of the system prompt—the base agent instructions, memory, and skill content that repeat on every turn. This avoids reprocessing the same tokens across calls, reducing both latency and cost on long-running agents. Prompt caching is enabled by default when using an Anthropic model. No configuration is required. For other providers, see [Middleware integrations](https://docs.langchain.com/oss/javascript/integrations/middleware#official-integrations) for available provider-specific caching middleware.

## Delegation

The delegation component enables agents to break large problems into smaller, parallelizable units of work. It has two layers:

-   **[Task planning](#task-planning)**: a built-in `write_todos` tool for structured task tracking
-   **[Subagents](#subagents)**: ephemeral child agents that handle isolated subtasks

### Task planning

The harness provides a `write_todos` tool that lets agents maintain a structured task list during execution. Tasks support status tracking (`'pending'`, `'in_progress'`, `'completed'`) and are persisted in agent state. This gives agents a lightweight planning layer for organizing long-running and multi-step work.

### Subagents

The harness includes a built-in `task` tool that lets the main agent create ephemeral subagents for isolated, long-running, multi-step, or parallel tasks. Subagent execution provides:

-   **Fresh context**: Each invocation creates a new agent instance with its own context.
-   **Autonomous execution**: The subagent runs independently until completion.
-   **Single handoff**: It returns one final report to the main agent.
-   **Configurable strategy**: Use the [default `general-purpose` subagent](https://docs.langchain.com/oss/javascript/deepagents/subagents#default-subagent) (enabled by default) or define [custom subagents](https://docs.langchain.com/oss/javascript/deepagents/subagents#custom-subagents).
-   **Stateless messaging**: Subagents are stateless and cannot send multiple messages back.
-   **Context and token efficiency**: Heavy subtask work stays isolated and is compressed into a compact result.

Running without subagents (no \`task\` tool)

To run an agent without the `task` tool, see [Running without subagents](https://docs.langchain.com/oss/javascript/deepagents/subagents#running-without-subagents). Do not try removing [`SubAgentMiddleware`](https://reference.langchain.com/javascript/deepagents/middleware/createSubAgentMiddleware) via `excluded_middleware`—that is intentionally rejected. Instead, disable the auto-added subagent via the [harness profile](https://docs.langchain.com/oss/javascript/deepagents/profiles#harness-profiles) and pass no synchronous subagents via `subagents=`. Async subagents are unaffected. See the [default middleware stack](https://docs.langchain.com/oss/javascript/deepagents/customization#default-stack-main-agent) for the full ordering.

For more information, see [Subagents](https://docs.langchain.com/oss/javascript/deepagents/subagents).

## Steering

The steering component gives humans control over agent behavior at runtime and sets filesystem permissions for agent work.

### Human-in-the-loop

Deep Agents integrate with LangGraph interrupts so you can pause for approval on sensitive tool calls. Enable this behavior with the `interrupt_on` parameter in `create_deep_agent`. `interrupt_on` accepts a mapping of tool names to interrupt configurations. For example, `interrupt_on={"edit_file": True}` pauses before every edit, letting you approve the call, add guidance, or modify tool inputs before execution. This gives you a runtime safety and control layer for destructive operations, expensive API calls, and interactive debugging. For more information, see [Human-in-the-loop](https://docs.langchain.com/oss/javascript/deepagents/human-in-the-loop).

## Get started

---
