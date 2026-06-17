---
title: "Tools - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/deepagents/tools"
crawled_at: "2026-06-17T14:44:42.030Z"
---

Deep Agents can call any tool you define, any [LangChain tool](https://python.langchain.com/docs/concepts/tools/), and tools from any [MCP server](#mcp-tools). Pass them to `create_deep_agent` via the `tools=` parameter alongside the [built-in harness tools](https://docs.langchain.com/oss/javascript/deepagents/harness#execution-environment) for planning, file management, and subagent spawning.

```
import { createDeepAgent } from "deepagents";

const agent = await createDeepAgent({
  model: "anthropic:claude-sonnet-4-6",
  tools: [search, fetchUrl, runQuery],
});
```

## Custom tools

Pass any callable — plain functions, LangChain `@tool`\-decorated functions, or tool dicts — directly to `tools=`. Deep Agents infers the tool schema from the function signature and docstring, so you don’t need to define a separate schema in most cases.

For full details on defining and using LangChain tools (tool dicts, `StructuredTool`, return types, error handling, and more), see [Tools](https://docs.langchain.com/oss/javascript/langchain/tools).

## MCP tools

MCP is an open protocol that lets agents connect to a growing ecosystem of servers — databases, APIs, file systems, browsers, and more — through a standard interface. Instead of writing custom integration code for each service, you point Deep Agents at an MCP server and it gets all the tools that server exposes. Install `@langchain/mcp-adapters` to connect to MCP servers:

```
npm install @langchain/mcp-adapters
```

```
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { createDeepAgent } from "deepagents";

const client = new MultiServerMCPClient({
  my_server: {
    transport: "http",
    url: "http://localhost:8000/mcp",
  },
});

const tools = await client.getTools();

const agent = await createDeepAgent({
  model: "openai:gpt-5.5",
  tools,
});

const result = await agent.invoke({
  messages: [{ role: "user", content: "Use the MCP server to help me." }],
});
```

For detailed configuration options — including stdio servers, OAuth authentication, tool filtering, and stateful sessions — see the full [MCP guide](https://docs.langchain.com/oss/javascript/langchain/mcp).

## Built-in harness tools

In addition to the tools you provide, every Deep Agent comes with a built-in set of tools from the harness:

| Tool | Description |
| --- | --- |
| `ls` | List files in a directory |
| `read_file` | Read file contents (with pagination and multimodal support) |
| `write_file` | Create new files |
| `edit_file` | Perform exact string replacements in files |
| `glob` | Find files matching a glob pattern |
| `grep` | Search file contents |
| `execute` | Run shell commands (sandbox backends only) |
| `task` | Spawn a subagent to handle a delegated task |
| `write_todos` | Manage a structured todo list |

For a full breakdown of what each built-in tool does, see [Harness capabilities](https://docs.langchain.com/oss/javascript/deepagents/harness#execution-environment).

---
