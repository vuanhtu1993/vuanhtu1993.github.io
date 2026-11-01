---
title: "Custom tools in self-hosted sandboxes"
source_url: "https://platform.claude.com/docs/en/managed-agents/self-hosted-sandboxes-custom-tools"
crawled_at: "2026-11-01T16:11:09.097Z"
---

Serve custom tools from a self-hosted sandbox worker, and wrap an MCP server inside your network as custom tools without running a tunnel.

[Custom tools](https://platform.claude.com/docs/en/managed-agents/tools#custom-tools) are tools your own code runs: the agent emits an `agent.custom_tool_use` event and waits for a matching `user.custom_tool_result`. Your worker can be that code. Because it runs inside your sandbox, the tool reaches the internal services, credentials, and network egress you configured for the sandbox, and nothing more.

The environment key authorizes posting custom tool results, so your Claude API key stays off the worker host.

## Serve a custom tool

1.  ### Declare the tool on the agent
    
    Add a `custom` entry to the agent’s `tools` whose `name` matches the tool your worker registers. See [Custom tools](https://platform.claude.com/docs/en/managed-agents/tools#custom-tools) for the full declaration shape.
    
2.  ### Register the implementation with the worker
    
    Pass the tool through the worker’s `tools` factory (see [`EnvironmentWorker`](https://platform.claude.com/docs/en/managed-agents/self-hosted-sandboxes-reference#environment-worker)), alongside the built-in toolset:
    

The worker answers only the tools registered with it. If a tool is declared on the agent but no worker or client serves it, the session pauses with a `requires_action` stop reason. It stays paused until something posts the result. See [Answer tool calls that pause the session](https://platform.claude.com/docs/en/managed-agents/events-and-streaming#answer-tool-calls-that-pause-the-session) for the event flow.

## Wrap an MCP server as custom tools

The [MCP connector](https://platform.claude.com/docs/en/managed-agents/mcp-connector) connects to MCP servers from Anthropic’s side. A server must therefore expose an HTTP endpoint that Anthropic can reach, directly or through an [MCP tunnel](https://platform.claude.com/docs/en/agents-and-tools/mcp-tunnels/overview).

To use a server that only your network can reach, make the worker the MCP client instead and declare the server’s tools as custom tools. The MCP server needs no inbound connectivity from outside your network. Anthropic receives the tool definitions you declare on the agent, each call’s input, and the result your worker posts back.

At runtime the model calls a wrapped tool like any other custom tool:

1.  The agent emits an `agent.custom_tool_use` event.
2.  The worker, inside your sandbox, forwards the call over its open MCP session to the server on your network.
3.  The worker posts the server’s response as the `user.custom_tool_result`.

### Install an MCP SDK

The SDK’s [Client-side MCP helpers](https://platform.claude.com/docs/en/agents-and-tools/mcp-connector#client-side-mcp-helpers) convert the server’s tools into the runnable tools the worker accepts. Install an MCP SDK alongside the Anthropic SDK: `pip install "anthropic[mcp]" "mcp>=1.24"`.

The examples connect without authentication. To send credentials, configure the `http_client` you hand to the MCP transport.

### Declare and serve the tools

1.  ### Declare the server’s tools on the agent
    
    List the MCP server’s tools and declare each one as a `custom` tool. The MCP `name`, `description`, and `inputSchema` map one to one onto the custom tool’s fields. If the server paginates its tool list, declare every page; the worker must list the same pages.
    
2.  ### Serve the tools from the worker
    
    Connect to the same MCP server at startup, convert its tools with `async_mcp_tool()`, and register them alongside `beta_agent_toolset_20260401()`. Keep one MCP session open for the life of the worker.
    

## Limits and behavior

### Tools are declared, not discovered at runtime

The worker lists the MCP server’s tools once at startup and cannot add tools to a running session. When the server’s tools change:

1.  Declare them again, on the agent or on an idle session through [Updating the agent configuration](https://platform.claude.com/docs/en/managed-agents/session-operations#updating-the-agent-configuration).
2.  Restart the worker.

### Declarations must fit the Managed Agents API

The MCP helpers keep the server’s names and descriptions, and most schemas pass through unchanged. Rename, trim, or inline where a declaration breaks one of these rules:

| Field | Rule |
| --- | --- |
| `name` | Unique per agent. Letters, digits, underscores, and hyphens, 1–128 characters. Cannot match a built-in agent tool such as `bash` or `read`, or use the reserved `mcp__` prefix or `ant__` prefix. |
| `description` | Required and non-empty. |
| `input_schema` | Accepts the JSON Schema keywords MCP servers commonly emit, such as `additionalProperties` and `title`. Rejects reference keywords such as `$ref` anywhere, and top-level `oneOf`, `anyOf`, and `allOf`. Property names use letters, digits, underscores, dots, and hyphens, 1–64 characters. |
| The agent’s `tools` array | At most 256 entries. Each wrapped tool is one entry, and the built-in toolset is one more. |

Two cases need extra work:

-   **Two servers expose the same tool name:** Define the wrapper yourself under a prefixed name and have it call the server’s original tool name.
-   **A generator such as Pydantic factors schemas into `$defs`:** Inline those schemas before you declare the tool.

### Tool failures surface as error tool results

When the MCP server reports a tool error, the worker posts an error tool result the model can react to. MCP content with no tool result equivalent, such as audio blocks and resource links, also surfaces as an error.

Set a timeout on the MCP client for a faster and clearer failure, as the Python worker example does with `read_timeout_seconds`. See [A wrapped MCP tool call hangs](https://platform.claude.com/docs/en/managed-agents/self-hosted-sandboxes-operations#a-wrapped-mcp-tool-call-hangs) for what occurs without one.

### Wrap only servers you operate or trust

A wrapped tool’s name, description, and results enter the model’s context like any other tool’s. They are untrusted input that can influence what the agent does with its other tools, including `bash` on the worker host. Declare only the tools you intend the agent to use.

### Permission policies do not apply

[Permission policies](https://platform.claude.com/docs/en/managed-agents/permission-policies#custom-tools) govern the built-in and MCP toolsets. The worker runs every wrapped tool call the model makes, so put any approval step in your own tool code.
