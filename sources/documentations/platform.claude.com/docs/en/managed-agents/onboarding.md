---
title: "Build in Console"
source_url: "https://platform.claude.com/docs/en/managed-agents/onboarding"
crawled_at: "2026-11-01T16:23:45.413Z"
---

Create, test, and iterate on agents visually in the Claude Console, then run them from your code with the API.

The [Claude Console](https://platform.claude.com/workspaces/default/agent-quickstart) provides a visual interface for creating and configuring agents. It lets you iterate on configuration interactively before writing code.

## How to build an agent

The [visual interface](https://platform.claude.com/workspaces/default/agent-quickstart) in the Claude Console walks you through each field of an agent definition:

-   **Model and system prompt:** Pick a model and write the system prompt in a full-width editor.
-   **MCP servers:** Add remote MCP servers by URL and authenticate your agent to take action on your behalf.
-   **Tools:** Extend your agent’s capabilities using a pre-built agent toolset and MCP tools.
-   **Skills:** Attach Anthropic or custom skills from your organization’s library.

As you configure, Console shows the equivalent API request so you can copy it into your code once you’re satisfied.

## Testing an agent

Console includes an inline session runner. After configuring your agent, you can start a test session directly, send messages, and watch the event stream without leaving the page. This is the fastest way to check that your system prompt and tool selection produce the behavior you expect.

## From Console to your code base

Once your agent works as expected:

1.  Copy the agent ID and [environment ID](https://platform.claude.com/docs/en/managed-agents/environments) from Console.
2.  Reference them in your code when [creating sessions](https://platform.claude.com/docs/en/managed-agents/sessions):

## Availability

Console agent builder is in beta on every model.

### API support

Beta headers allow you to access experimental features and new model capabilities before they become part of the standard API.
