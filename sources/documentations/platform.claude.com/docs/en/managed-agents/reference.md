---
title: "Reference"
source_url: "https://platform.claude.com/docs/en/managed-agents/reference"
crawled_at: "2026-11-01T16:26:19.510Z"
---

Event types, self-hosted worker CLI flags, supported MCP server types, rate limits, and branding guidelines for Claude Managed Agents.

This page collects reference material for Claude Managed Agents. For task-oriented guides, follow the links in each section. For the operations on the session resource, see [Session operations](https://platform.claude.com/docs/en/managed-agents/session-operations).

## Event types

Persisted event type strings follow a `{domain}.{action}` naming convention; the stream-only event deltas (see the **Event deltas** tab) are the exception. See [Session event stream](https://platform.claude.com/docs/en/managed-agents/events-and-streaming) for sending, streaming, and listing events. Webhook event types are listed separately in [Subscribe to webhooks](https://platform.claude.com/docs/en/managed-agents/webhooks#supported-event-types), and some of their names differ from the stream’s (for example, `session.status_idled` rather than `session.status_idle`).

| Type | Description |
| --- | --- |
| `user.message` | A user message with text, image, or document content. |
| `user.interrupt` | Stop the agent while it runs. It ends no [workflow run](https://platform.claude.com/docs/en/managed-agents/workflow-runs#interrupt-a-session-with-runs-open). |
| `user.custom_tool_result` | Response to a custom tool call from the agent. |
| `user.tool_confirmation` | Approve or deny an agent or MCP tool call when a permission policy requires confirmation. |
| `user.define_outcome` | Define an [outcome](https://platform.claude.com/docs/en/managed-agents/define-outcomes) for the agent to work toward. |
| `user.tool_result` | For sessions with `self_hosted` [environments](https://platform.claude.com/docs/en/managed-agents/self-hosted-sandboxes) only, your integration is responsible for providing `agent_toolset` results. The SDK helpers and CLI do this automatically. |

## Self-hosted worker

See [Self-hosted worker reference](https://platform.claude.com/docs/en/managed-agents/self-hosted-sandboxes-reference) for the `ant beta:worker` CLI flags, environment variables, filesystem paths, and SDK helper options of the pre-built workers that drive a `self_hosted` environment.

## Supported MCP server types

Claude Managed Agents connects to [remote MCP servers](https://platform.claude.com/docs/en/agents-and-tools/remote-mcp-servers) that expose an HTTP endpoint, or to private MCP servers through [MCP tunnels](https://platform.claude.com/docs/en/agents-and-tools/mcp-tunnels/overview). The server should support the MCP protocol’s streamable HTTP transport; servers that only support the deprecated SSE transport still work through an automatic fallback. See [MCP connector](https://platform.claude.com/docs/en/managed-agents/mcp-connector) for declaring servers on an agent.

For more information on MCP and building MCP servers, see the [MCP documentation](https://modelcontextprotocol.io/).

## Rate limits

Managed Agents endpoints are rate-limited for each organization:

| Operation | Limit |
| --- | --- |
| Create endpoints (such as agents, sessions, and environments) | 300 requests per minute |
| Read endpoints (such as retrieve, list, and stream) | 1,200 requests per minute |

Organization-level [spend limits and usage-tier rate limits](https://platform.claude.com/docs/en/api/rate-limits) also apply.

## Branding guidelines

For partners integrating Claude Managed Agents, use of Claude branding is optional. When referencing Claude in your product:

**Allowed:**

-   “Claude Agent” (preferred for dropdown menus)
-   “Claude” (when within a menu already labeled “Agents”)
-   “{YourAgentName} Powered by Claude” (if you have an existing agent name)

**Not permitted:**

-   “Claude Code” or “Claude Code Agent”
-   “Claude Cowork” or “Claude Cowork Agent”
-   Claude Code-branded ASCII art or visual elements that mimic Claude Code

Your product should maintain its own branding and not appear to be Claude Code, Claude Cowork, or any other Anthropic product. For questions about branding compliance, contact the Anthropic [sales team](https://www.anthropic.com/contact-sales).
