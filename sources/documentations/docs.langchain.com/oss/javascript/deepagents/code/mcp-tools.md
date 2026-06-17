---
title: "MCP tools - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/deepagents/code/mcp-tools"
crawled_at: "2026-06-17T14:46:38.376Z"
---

[MCP (Model Context Protocol)](https://modelcontextprotocol.io/) lets you extend Deep Agents Code with tools from external servers—file systems, APIs, databases, and more—without modifying the agent itself. Deep Agents Code connects to MCP servers at startup, discovers their tools, and makes them available to the agent alongside the built-in tools. Add MCP servers by adding a `.mcp.json` config file to your project for project-level scope, or at user-level to apply to all projects.

## Quickstart

This quickstart adds the [LangChain documentation MCP server](https://docs.langchain.com/mcp) to every Deep Agents Code session on your machine. Swap in any other MCP server’s URL or stdio command in the same shape.

## Auto-discovery

Deep Agents Code automatically searches for `.mcp.json` files in standard locations. No flags are needed—just place a config file and it gets picked up.

### Discovery locations

Configs are checked in this order (lowest to highest precedence):

| Priority | Location | Scope |
| --- | --- | --- |
| 1 (lowest) | `~/.deepagents/.mcp.json` | User-level—applies to all projects |
| 2 | `<project>/.deepagents/.mcp.json` | Project-level—`.deepagents` subdirectory |
| 3 (highest) | `<project>/.mcp.json` | Project-level—root (Claude Code compatible) |

The project root is the nearest parent directory containing a `.git` folder, falling back to the current working directory. When multiple config files exist, their `mcpServers` entries are merged. If the same server name appears in more than one file, the higher-precedence config wins. This lets a project-level config override a user-level entry (for example, pinning a different version of the same server) without disturbing your other projects.

### Flags

| Flag | Behavior |
| --- | --- |
| `--mcp-config PATH` | Add an explicit config as the highest-precedence source (merged on top of auto-discovered configs) |
| `--no-mcp` | Disable MCP entirely—no servers are loaded |

### Claude Code compatibility

If you already have a `.mcp.json` at your project root for Claude Code, Deep Agents Code picks it up automatically—no extra setup needed.

## Configuration format

Each key under `mcpServers` is a server name. The server’s fields determine how Deep Agents Code connects to it.

### stdio servers (default)

stdio servers are spawned as child processes. Deep Agents Code communicates with them over stdin/stdout.

mcp-config.json

```
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"],
      "env": {}
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "your-token" }
    }
  }
}
```

### SSE and HTTP servers

For remote MCP servers, set `type` to `"sse"` or `"http"` and provide a `url`:

mcp-config.json

```
{
  "mcpServers": {
    "remote-api": {
      "type": "sse",
      "url": "https://api.example.com/mcp",
      "headers": { "Authorization": "Bearer your-token" }
    }
  }
}
```

### Field reference

Header values support `${VAR}` substitution from the parent shell, resolved at server activation rather than at config load. One unset variable only fails the server that needs it; the rest still come up.

.mcp.json

```
{
    "mcpServers": {
        "internal-api": {
            "type": "http",
            "url": "https://api.example.com/mcp",
            "headers": { "Authorization": "Bearer ${INTERNAL_API_TOKEN}" }
        }
    }
}
```

## Multiple servers

You can configure as many servers as you need. Tools from all servers are merged and available to the agent:

mcp-config.json

```
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/home/user/projects"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "ghp_..." }
    },
    "database": {
      "type": "sse",
      "url": "https://db-mcp.internal:8080/mcp",
      "headers": { "Authorization": "Bearer ..." }
    }
  }
}
```

## Tool filtering

Each server may narrow the tools it exposes to the agent with one of two optional fields:

-   `allowedTools`: keep only the listed tools; drop everything else.
-   `disabledTools`: drop the listed tools; keep everything else.

Filtering applies to stdio, HTTP, and SSE servers alike. Both of the following are rejected at config load:

-   Setting `allowedTools` and `disabledTools` on the same server.
-   Setting either field to an empty list (would silently strip every tool, or be a no-op). Omit the field instead.

.mcp.json

```
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"],
      "allowedTools": ["read_file", "list_directory"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "disabledTools": ["delete_repository", "delete_*_branch"]
    }
  }
}
```

### Match rules

Each entry is a literal tool name or an [`fnmatch`](https://docs.python.org/3/library/fnmatch.html)\-style glob (any entry containing `*`, `?`, or `[` is treated as a pattern). Entries are matched against both the bare MCP tool name and the server-prefixed form (`{server}_{tool}`), so either form works:

```
{
  "allowedTools": ["read_file", "fs_list_*"]
}
```

allowedTools

string\[\]

Tool names or `fnmatch` glob patterns to keep. All other tools from this server are dropped. Mutually exclusive with `disabledTools`.

disabledTools

string\[\]

Tool names or `fnmatch` glob patterns to drop. All other tools from this server are kept. Mutually exclusive with `allowedTools`.

## OAuth login

For remote MCP servers that require OAuth (Slack, GitHub, Notion, Linear, and other hosted MCP endpoints), set `"auth": "oauth"` on the server entry and run the login subcommand once. Tokens are persisted to disk and refreshed automatically.

### Configure the server

.mcp.json

```
{
    "mcpServers": {
        "linear": {
            "type": "http",
            "url": "https://mcp.linear.app/mcp",
            "auth": "oauth"
        }
    }
}
```

`auth: "oauth"` is mutually exclusive with an `Authorization` header on the same entry, and cannot be set on a stdio server. To connect Deep Agents Code to LangSmith, use the [LangSmith Remote MCP](https://docs.langchain.com/langsmith/langsmith-remote-mcp):

.mcp.json

```
{
    "mcpServers": {
        "langsmith": {
            "url": "https://api.smith.langchain.com/mcp",
            "transport": "http",
            "auth": "oauth"
        }
    }
}
```

### Run the login flow

```
dcode mcp login linear
```

What happens depends on the server’s host:

-   **Spec-compliant servers** (the default): Deep Agents Code performs Dynamic Client Registration, opens an Authorization Code + PKCE flow in your browser, and asks you to paste the redirected URL back into the terminal.
-   **Slack** (`slack.com`, `*.slack.com`): same paste-back flow, but with Slack’s public client preseeded. You’re prompted for an optional team ID (e.g., `T01234567`) so the app installs into the right workspace.
-   **GitHub** (`api.githubcopilot.com`): RFC 8628 Device Authorization Grant. Deep Agents Code prints a verification URL and a user code; you enter the code in your browser and Deep Agents Code polls for completion.

By default, `dcode mcp login` reads the same auto-discovered configs Deep Agents Code uses at runtime (subject to project-level trust gating). Pass `--config <path>` to use a specific file:

```
dcode mcp login linear --config ./mcp-config.json
```

### Token storage

Tokens are written to:

```
~/.deepagents/.state/mcp-tokens/<server>-<sha256-16(url)>.json
```

The `<sha256-16(url)>` segment is the first 16 hex characters of the SHA-256 of the server URL. The directory is locked to mode `0700` and each token file is mode `0600`. Files include the OAuth access token, refresh token, and the dynamically registered client info, all in a schema-versioned payload that’s written atomically (write-to-temp + `rename`).

### Re-authentication

When refresh fails at runtime (the refresh token expired or was revoked), Deep Agents Code marks the server as `unauthenticated` instead of crashing the agent. The welcome banner shows the count of unauthenticated servers, and `/mcp` reports the reason per server. Re-run `dcode mcp login <server>` to refresh credentials — your conversation continues without restarting.

## Server status

Each configured server lands in one of three states after startup:

| Status | Meaning |
| --- | --- |
| `ok` | Connected; tools are loaded and available to the agent |
| `unauthenticated` | OAuth login required or refresh failed — run `dcode mcp login <server>` |
| `error` | Pre-flight, discovery, or transport setup failed; an error message is attached |

A single failing server no longer aborts startup. The agent runs with whichever servers came up cleanly, and the welcome banner surfaces counts of unauthenticated and errored servers next to the tool count. Open `/mcp` in an interactive session to see per-server status, transport, tool list, and the failure reason for non-`ok` entries. The viewer live-updates as servers connect and supports `tab`/`shift+tab` navigation.

## Project-level trust

Project-level configs can contain stdio servers that execute local commands and remote servers whose `headers` may interpolate `${VAR}` from your environment. To prevent untrusted repositories from running arbitrary code or exfiltrating local secrets on CLI startup, Deep Agents Code enforces a **default-deny** policy for project-level entries.

### How it works

-   **Interactive mode:** Deep Agents Code prompts for approval before activating project servers, showing each stdio command and remote URL. Approval is persisted using a SHA-256 content fingerprint—if the config changes, you are prompted again.
-   **Non-interactive mode (`-n`):** Project servers are silently skipped unless `--trust-project-mcp` is passed.
-   **Trust covers stdio and remote entries alike** — remote servers can SSRF into localhost or cloud-metadata endpoints during the pre-flight probe and exfiltrate `${VAR}` values via headers, so they’re gated the same way as stdio.
-   **User-level configs** (`~/.deepagents/.mcp.json`) are always trusted—the same trust model as `config.toml` and `hooks.json`.
-   **`dcode mcp login`** also honors project trust: an untrusted project-level config is skipped during login discovery so an attacker-controlled remote entry cannot pull secrets into the OAuth handshake.

### Flags

| Flag | Behavior |
| --- | --- |
| `--trust-project-mcp` | Trust all project-level stdio servers without prompting (for CI and automation) |

```
# Skip the approval prompt
dcode --trust-project-mcp

# Non-interactive: explicitly trust project servers
dcode -n "run tests" --trust-project-mcp
```

### Trust store

Trust decisions are stored in `~/.deepagents/.state/mcp_trust.json`:

```
{
  "version": 1,
  "projects": {
    "/Users/you/myproject": "sha256:abc123..."
  }
}
```

Each key under `projects` is an absolute project root path. The value is a SHA-256 digest of the concatenated project-level config contents. To revoke trust, delete the entry or modify the project’s `.mcp.json` (which invalidates the fingerprint automatically).

## System prompt awareness

Connected MCP servers and their tools are automatically listed in the agent’s system prompt, grouped by server name and transport type. This helps the model reason about tool provenance and failure domains without requiring manual context.

## Troubleshooting

## Further reading

-   [LangSmith Remote MCP](https://docs.langchain.com/langsmith/langsmith-remote-mcp): connect Deep Agents Code to LangSmith tools over OAuth
-   [LangChain MCP guide](https://docs.langchain.com/oss/javascript/langchain/mcp): protocol details, building custom servers, and using `langchain-mcp-adapters` programmatically
-   [MCP specification](https://modelcontextprotocol.io/): the official protocol spec and server registry

---
