---
title: "Connect to MCP servers - Claude Code Docs"
source_url: "https://code.claude.com/docs/en/mcp-quickstart"
crawled_at: "2026-11-01T16:39:02.127Z"
---

The [Model Context Protocol (MCP)](https://modelcontextprotocol.io/introduction) lets Claude Code use tools beyond its built-in set, such as searching an issue tracker, querying a database, or controlling a web browser. These tools come from MCP servers, which run on your machine or as hosted services. This guide walks you through connecting one MCP server end to end with the Claude Code CLI. By the end, you’ll have a server connected and responding, know where its configuration lives on disk, and know how to fix the most common connection errors.

For every way to connect and configure MCP servers in Claude Code, see the [MCP reference](https://code.claude.com/docs/en/mcp).

## Before you begin

Make sure you have:

-   [Claude Code installed](https://code.claude.com/docs/en/quickstart) and authenticated
-   A terminal open in a project directory. Any directory works, including an empty one.

## Add and verify a server

The example below connects to the [Claude Code documentation MCP server](https://code.claude.com/docs/mcp), a hosted server with full-text search over the Claude Code docs. It doesn’t require authentication or any special configuration, so it works well as a first server to test the setup flow with. The steps are the same for any server: add it, check the connection status, then use it in a session, with an optional cleanup step at the end. Some servers add a step, like a browser sign-in, shown in [Additional MCP server examples](#additional-mcp-server-examples). For more servers to connect, browse the [Anthropic Directory](https://code.claude.com/docs/en/mcp#find-and-build-mcp-servers).

1

2

Check the connection status

Confirm the server appears in your server list and check its status:

The server appears with a status indicator:

| Status | Meaning |
| --- | --- |
| `✔ Connected` | Ready to use. This is what you should see for `claude-code-docs` |
| `! Connected · tools fetch failed` | The server connected but couldn’t list its tools. Run `claude mcp get <name>` for the error detail |
| `! Needs authentication` | The server is reachable but needs a browser sign-in, or a token passed with `--header`. See [Connect a server that requires sign-in](#connect-a-server-that-requires-sign-in) |
| `✘ Failed to connect` | Server didn’t respond. See [Troubleshooting](#troubleshooting) |
| `✘ Connection error` | The connection attempt threw an error. See [Troubleshooting](#troubleshooting) |
| `⏸ Pending approval (run `claude` to approve)` | A project-scoped server you haven’t approved yet. See [Edit .mcp.json directly](#edit-mcp-json-directly) |
| `⊘ Disabled for this project (re-enable via /mcp)` | A server turned off for this project by the project’s `disabledMcpServers` list. See [Disable a server without removing it](https://code.claude.com/docs/en/mcp#disable-a-server-without-removing-it) |
| `✘ Blocked by enterprise managed policy` | One of your organization’s policies blocks this server, so Claude Code won’t connect. Ask your administrator which policy. See [Server status](https://code.claude.com/docs/en/mcp#server-status) |

Some legacy Windows consoles, such as the default console on Windows 10, don’t support these Unicode glyphs and show `√` and `×` in place of `✔` and `✘`.

3

4

## Where servers are saved

The `claude mcp add` command writes the server’s details to a configuration file. By default it registers the server at `local` scope: private to you, active only in the current project. Pass `--scope user` to register it once for all your projects, or `--scope project` to share it with teammates. [Change server scope](#change-server-scope) walks through both.

There are other ways to add a server, each with its own section:

-   [Add a local server](#add-a-local-server): run a program on your machine instead of connecting to a URL.
-   [Edit `.mcp.json` directly](#edit-mcp-json-directly): write the JSON entry yourself instead of using the command.
-   [Connect a server that requires sign-in](#connect-a-server-that-requires-sign-in): add a hosted server that needs a browser sign-in before its tools work.

### Find your configuration on disk

The `claude mcp add` command writes the server to one of three scopes, stored across two files, depending on the `--scope` flag. You don’t need to edit these files directly, but knowing where they are helps with debugging and version control.

| Scope | File | Available to |
| --- | --- | --- |
| `local` | `~/.claude.json`, under the entry for this project | Only you, only this project. The default |
| `project` | `.mcp.json` in your project root | Everyone who clones the project |
| `user` | `~/.claude.json`, under the top-level `mcpServers` key | Only you, all projects |

On Windows, `~/.claude.json` resolves to `%USERPROFILE%\.claude.json`, typically `C:\Users\YourName\.claude.json`. If you’ve set [`CLAUDE_CONFIG_DIR`](https://code.claude.com/docs/en/env-vars), Claude Code reads `.claude.json` from inside that directory instead. Run `claude mcp get claude-code-docs` to see which scope holds a server’s definition. For how the scopes interact when the same server is defined in more than one, see [MCP installation scopes](https://code.claude.com/docs/en/mcp#mcp-installation-scopes).

## Change server scope

A server’s scope is fixed when you add it, so changing scope means removing the entry and re-adding it at the new one. Both cases below start by removing the local entry from the first walkthrough, so the server has only one definition. If you already removed it at the end of that walkthrough, skip this command:

### Use a server in all your projects

Re-add the server at `user` scope to make it active in every project you open, still private to you:

Re-add the server at `project` scope, which writes to `.mcp.json` in the project root:

Commit `.mcp.json` to version control. Teammates who clone the repository and start Claude Code see a prompt to approve the server, then it connects for them too.

## Additional MCP server examples

The first walkthrough used a hosted server that connects without any sign-in. The examples below cover the other two common shapes, with the same add, check, use flow.

### Add a local server

A local stdio server is a program Claude Code starts as a subprocess on your machine, rather than a service it reaches over a URL. Use one for tools that need access to local resources like a browser, your filesystem, or a database socket. The [Playwright MCP server](https://github.com/microsoft/playwright-mcp) is a good one to try: it gives Claude a browser it can navigate, click, and read, and it needs no account. It runs through `npx`, so it requires [Node.js](https://nodejs.org/en/download) 18 or later.

1

2

3

### Connect a server that requires sign-in

Hosted services like Sentry, Linear, and Notion run their MCP servers behind OAuth: you add the server’s URL, then sign in through your browser. The steps below use Sentry as the example. To connect a different service, substitute its URL, which you can find in the [Anthropic Directory](https://code.claude.com/docs/en/mcp#find-and-build-mcp-servers) or the service’s documentation.

1

2

3

Servers that authenticate with a static token instead of OAuth take the token at add time with `--header "Authorization: Bearer <token>"`. See the [GitHub example](https://code.claude.com/docs/en/mcp#example-connect-to-github-for-code-reviews) for a worked version.

## Edit .mcp.json directly

Every file in the [scope table](#find-your-configuration-on-disk) uses the same JSON format for server entries. This section edits `.mcp.json`, the project-scope file. It’s the one most worth writing by hand because it’s checked into the repository, where it doubles as configuration-as-code for your team. Create `.mcp.json` in your project root. The example below defines both servers from this guide, the hosted docs server reached over HTTP and the Playwright server as a local `stdio` process:

The fields differ by server type:

-   For HTTP servers, `url` is the endpoint Claude Code connects to.
-   For stdio servers, `command` and `args` are the program it runs.

After saving the file, start a new Claude Code session in the project. Claude Code reads `.mcp.json` at startup. The first time Claude Code sees a project-scoped server, it asks you to approve it. The prompt exists so a repository you clone can’t launch processes on your machine without your consent. Approve the prompt, or run `/mcp` to approve later if you missed it. Once you’ve approved, run `/mcp` and check that the servers show as connected. If one shows an error instead, see [Troubleshooting](#troubleshooting).

## Connect from other surfaces

This guide uses the `claude mcp` CLI commands, but every Claude Code surface can connect to MCP servers:

-   **Claude Code desktop app**: add servers through the [Connectors UI](https://code.claude.com/docs/en/desktop#connect-external-tools).
-   **Claude Desktop chat app**: a separate app from Claude Code. To copy servers from its `claude_desktop_config.json` into the CLI, run `claude mcp add-from-claude-desktop` on macOS or WSL.
-   **VS Code**: see [Connect to external tools with MCP](https://code.claude.com/docs/en/vs-code#connect-to-external-tools-with-mcp).
-   **Cloud sessions**: outside a [project](https://code.claude.com/docs/en/claude-projects#what-threads-pick-up-from-your-repositories)’s threads, commit a `.mcp.json` to your repository; a session with one repository loads it. Cloud threads in a project use your claude.ai connectors instead. See [Edit .mcp.json directly](#edit-mcp-json-directly) and [What carries over from your setup](https://code.claude.com/docs/en/cloud-environments#what-carries-over-from-your-setup).
-   **Claude.ai**: connectors you add at [claude.ai/customize/connectors](https://claude.ai/customize/connectors) load automatically in the CLI when you sign in with that account. See [Use MCP servers from Claude.ai](https://code.claude.com/docs/en/mcp#use-mcp-servers-from-claude-ai).

## Troubleshooting

If a server doesn’t connect, check its status with `/mcp` inside a session or `claude mcp list` from your shell, then match the symptom below. The `/mcp` panel also lets you reconnect or authenticate without leaving the session.

## Next steps

With one server connected, explore the rest of what MCP enables:

-   [Find more MCP servers](https://code.claude.com/docs/en/mcp#find-and-build-mcp-servers) in the Anthropic Directory
-   [Share servers with your team](https://code.claude.com/docs/en/mcp#mcp-installation-scopes) using installation scopes
-   [Manage MCP access for an organization](https://code.claude.com/docs/en/managed-mcp) with managed settings and policy controls
-   [Reference MCP resources](https://code.claude.com/docs/en/mcp#use-mcp-resources) in prompts with @ mentions
-   [Run MCP prompts as commands](https://code.claude.com/docs/en/mcp#use-mcp-prompts-as-commands) from the `/` menu
-   [Build your own server](https://modelcontextprotocol.io/quickstart/server) with the MCP SDK
