---
title: "Give Claude custom tools - Claude Code Docs"
source_url: "https://code.claude.com/docs/en/agent-sdk/custom-tools"
crawled_at: "2026-11-01T16:45:37.743Z"
---

Custom tools extend the Agent SDK by letting you define your own functions that Claude can call during a conversation. Using the SDK’s in-process MCP server, you can give Claude access to databases, external APIs, domain-specific logic, or any other capability your application needs.

## Quick reference

| What you want to do | Do this |
| --- | --- |
| Define a tool | Use [`@tool`](https://code.claude.com/docs/en/agent-sdk/python#tool) (Python) or [`tool()`](https://code.claude.com/docs/en/agent-sdk/typescript#tool) (TypeScript) with a name, description, schema, and handler. See [Create a custom tool](#create-a-custom-tool). |
| Make a parameter optional | Declare it optional in the schema and apply the default in the handler. See [Make a parameter optional](#make-a-parameter-optional). |
| Register a tool with Claude | Wrap in `create_sdk_mcp_server` / `createSdkMcpServer` and pass to `mcpServers` in `query()`. See [Call a custom tool](#call-a-custom-tool). |
| Pre-approve a tool | Add to your allowed tools. See [Configure allowed tools](#configure-allowed-tools). |
| Require approval for calls to a tool, or block the tool | In the TypeScript SDK, add a `permission_policy` for the tool to the config object that `createSdkMcpServer()` returns. See [Require approval for specific tools](#require-approval-for-specific-tools). |
| Remove a built-in tool from Claude’s context | Pass a `tools` array listing only the built-ins you want. See [Configure allowed tools](#configure-allowed-tools). |
| Let Claude call tools in parallel | Set `readOnlyHint: true` on tools with no side effects. See [Add tool annotations](#add-tool-annotations). |
| Control the error message Claude reads | Return `isError: true` to compose the message instead of surfacing the raw exception. See [Handle errors](#handle-errors). |
| Return images or files | Use `image` or `resource` blocks in the content array. See [Return images and resources](#return-images-and-resources). |
| Return a machine-readable JSON result | Set `structuredContent` on the result. See [Return structured data](#return-structured-data). |
| Scale to many tools | Use [tool search](https://code.claude.com/docs/en/agent-sdk/tool-search) to load tools on demand. |

## Create a custom tool

A tool is defined by four parts, passed as arguments to the [`tool()`](https://code.claude.com/docs/en/agent-sdk/typescript#tool) helper in TypeScript or the [`@tool`](https://code.claude.com/docs/en/agent-sdk/python#tool) decorator in Python:

-   **Name:** a unique identifier Claude uses to call the tool.
-   **Description:** what the tool does. Claude reads this to decide when to call it.
-   **Input schema:** the arguments the tool accepts, declared per language:
    -   **TypeScript**: a [Zod schema](https://zod.dev/). The handler’s `args` take their types from it. Call `.describe()` on a field to give it a description Claude sees.
    -   **Python**: a dict mapping names to types, like `{"latitude": float}`, which the SDK converts to JSON Schema for you. Wrap a type in `Annotated`, like `{"latitude": Annotated[float, "Latitude coordinate"]}`, to give the field a description Claude sees. The decorator also accepts a full [JSON Schema](https://json-schema.org/understanding-json-schema/about) dict directly when you need enums, ranges, optional fields, or nested objects.
-   **Handler:** the async function that runs when Claude calls the tool. It receives the validated arguments and must return an object with:
    -   `content` (required): an array of result blocks, each with a `type` of `"text"`, `"image"`, `"audio"`, `"resource"`, or `"resource_link"`. See [Return images and resources](#return-images-and-resources) for non-text blocks.
    -   `structuredContent` (optional): a JSON object holding the result as machine-readable data, returned alongside `content`. See [Return structured data](#return-structured-data).
    -   `isError` (optional): set to `true` to signal a tool failure so Claude can react to it. See [Handle errors](#handle-errors).

After defining a tool, wrap it in a server with [`createSdkMcpServer`](https://code.claude.com/docs/en/agent-sdk/typescript#createsdkmcpserver) (TypeScript) or [`create_sdk_mcp_server`](https://code.claude.com/docs/en/agent-sdk/python#create_sdk_mcp_server) (Python). The server runs in-process inside your application, not as a separate process. Python examples on this page that make HTTP requests use [httpx](https://www.python-httpx.org/). Add it with the package manager your project uses:

-   Python (uv)
    
-   Python (pip)
    

### Weather tool example

This example defines a `get_temperature` tool and wraps it in an MCP server, without passing the server to `query`. To run the tool, see [Call a custom tool](#call-a-custom-tool) below.

See the [`tool()`](https://code.claude.com/docs/en/agent-sdk/typescript#tool) TypeScript reference or the [`@tool`](https://code.claude.com/docs/en/agent-sdk/python#tool) Python reference for full parameter details, including JSON Schema input formats and return value structure.

### Make a parameter optional

To make a parameter optional, declare it optional in the schema and apply the default in the handler:

-   **TypeScript**: add `.optional()` to the Zod field.
-   **Python**: the dict schema requires every key. Use the JSON Schema form, leave the parameter out of `required`, and read it with `args.get()`. For a typed schema with optional keys, see [TypedDict class](https://code.claude.com/docs/en/agent-sdk/python#input-schema-options).

The [`get_precipitation_chance` tool below](#add-more-tools) shows both patterns.

### Call a custom tool

Pass the MCP server you created to `query` via the `mcpServers` option, and list each tool’s [fully qualified name](https://code.claude.com/docs/en/agent-sdk/mcp#tool-naming-convention) in `allowedTools` so the tool runs without a permission prompt. That name is `mcp__{server_name}__{tool_name}`, where `{server_name}` is the key you give the server in `mcpServers`. If the key contains characters such as `.` or spaces, replace them with `_` when you write `{server_name}`. These snippets reuse the `weatherServer` from the [weather tool example](#weather-tool-example) to ask Claude what the weather is in a specific location.

Combine this snippet with the tool and server definitions from the [weather tool example](#weather-tool-example) in one file, `weather.py` or `weather.ts`, then run it from your terminal:

-   TypeScript
    
-   Python (uv)
    
-   Python (pip)
    

Activate the virtual environment where you installed the SDK, then run:

Claude calls `get_temperature` and the script prints a one-line answer with the current temperature in San Francisco.

### Add more tools

A server holds as many tools as you list in its `tools` array. With more than one tool on a server, you can list each one in `allowedTools` individually or use the wildcard `mcp__weather__*` to cover every tool the server exposes. The example below defines a second tool, `get_precipitation_chance`, and replaces the `weatherServer` definition from the [weather tool example](#weather-tool-example) with one that lists both tools in the array.

[Tool search](https://code.claude.com/docs/en/agent-sdk/tool-search) is on by default and defers SDK MCP tools: Claude sees each tool’s name in a compact list and loads its full schema on demand. With tool search disabled, every tool in this array consumes context window space on every turn. In TypeScript, pass `alwaysLoad: true` in the `extras` argument of [`tool()`](https://code.claude.com/docs/en/agent-sdk/typescript#tool) or in the options of [`createSdkMcpServer()`](https://code.claude.com/docs/en/agent-sdk/typescript#createsdkmcpserver) to keep a tool’s full schema in the initial prompt.

### Add tool annotations

[Tool annotations](https://modelcontextprotocol.io/docs/concepts/tools#tool-annotations) are optional metadata describing how a tool behaves. Pass them as the fifth argument to `tool()` helper in TypeScript or via the `annotations` keyword argument for the `@tool` decorator in Python. All hint fields are Booleans.

| Field | Default | Meaning |
| --- | --- | --- |
| `readOnlyHint` | `false` | Tool does not modify its environment. Controls whether the tool can be called in parallel with other read-only tools. |
| `destructiveHint` | `true` | Tool may perform destructive updates. Set it to `true` explicitly on any tool you [mark `always_ask`](#require-approval-for-specific-tools). |
| `idempotentHint` | `false` | Repeated calls with the same arguments have no additional effect. Informational only. |
| `openWorldHint` | `true` | Tool reaches systems outside your process. Informational only. |

Annotations are metadata, not enforcement. A tool marked `readOnlyHint: true` can still write to disk if that’s what the handler does. Keep the annotation accurate to the handler. This example adds `readOnlyHint` to the `get_temperature` tool from the [weather tool example](#weather-tool-example).

See `ToolAnnotations` in the [TypeScript](https://code.claude.com/docs/en/agent-sdk/typescript#toolannotations) or [Python](https://code.claude.com/docs/en/agent-sdk/python#toolannotations) reference.

## Control tool access

The [weather tool example](#weather-tool-example) registered a server and listed tools in `allowedTools`. This section covers how to scope access when you have multiple tools or want to restrict built-ins. For how tool names are constructed, see [Call a custom tool](#call-a-custom-tool).

### Configure allowed tools

The `tools` option and the allowed/disallowed lists affect two layers: availability, which controls whether a tool appears in Claude’s context, and permission, which controls whether a call is approved once Claude attempts it. `tools` and bare-name `disallowedTools` entries change availability. `allowedTools` and scoped `disallowedTools` rules change permission. If you name one of the [task-tracking tools](https://code.claude.com/docs/en/agent-sdk/todo-tracking#model-availability) in `allowedTools`, Claude Code also opts the session in.

| Option | Layer | Effect |
| --- | --- | --- |
| `tools: ["Read", "Grep"]` | Availability | Only the listed built-ins are in Claude’s context. Unlisted built-ins are removed. MCP tools are unaffected. |
| `tools: []` | Availability | All built-ins are removed. Claude can only use your MCP tools. |
| allowed tools | Permission | Listed tools run without a permission prompt. Other unlisted tools remain available; calls go through the [permission flow](https://code.claude.com/docs/en/agent-sdk/permissions). |
| disallowed tools | Both | A bare tool name such as `"Bash"` removes the tool from Claude’s context, the same as omitting it from `tools`. A scoped rule such as `"Bash(rm *)"` leaves the tool in context and denies only calls that match [as written](https://code.claude.com/docs/en/permissions#bash-rule-limits). |

To remove a built-in entirely, omit it from `tools` or list its bare name in `disallowedTools` (Python: `disallowed_tools`); both keep the tool out of context so Claude never attempts it. A scoped `disallowedTools` rule blocks matching calls but leaves the tool visible, so Claude may waste a turn trying it. See [Configure permissions](https://code.claude.com/docs/en/agent-sdk/permissions) for the full evaluation order.

### Require approval for specific tools

Set a tool’s `permission_policy` to `always_ask`, and `allowedTools` stops approving that tool’s calls, so they can reach your [`canUseTool`](https://code.claude.com/docs/en/agent-sdk/user-input) callback even though the tool is listed. Set `always_deny` instead, and [a call to the tool is denied](https://code.claude.com/docs/en/agent-sdk/permissions#how-permissions-are-evaluated), but a [mod](https://code.claude.com/docs/en/plugins/mods/overview) in a plugin you load [can still approve it](https://code.claude.com/docs/en/permissions#precedence-among-rules-hooks-and-mods). The field is TypeScript-only and requires Agent SDK v0.3.301 or later. Put the policy entry in a `tools` array on the config object `createSdkMcpServer()` returns, not in the `tools` option you pass into that function. This example spreads `weatherServer` from the [weather tool example](#weather-tool-example) and adds a `tools` array giving `get_temperature` the `always_ask` policy:

TypeScript

To try the policy, replace the `options` in the [Call a custom tool](#call-a-custom-tool) script with this example’s `options`, then run that script from your terminal. The script prints `Approval requested for mcp__weather__get_temperature`, followed by Claude’s answer about the temperature. For a complete script, see the [TypeScript reference](https://code.claude.com/docs/en/agent-sdk/typescript#mcpsdkserverconfigwithinstance). If you use `auto` or `plan` [permission mode](https://code.claude.com/docs/en/agent-sdk/permissions#permission-modes), set `destructiveHint: true` in the tool’s [annotations](#add-tool-annotations) so calls to the tool still reach your callback. Otherwise the [auto mode classifier](https://code.claude.com/docs/en/permission-modes#eliminate-prompts-with-auto-mode) can approve some `always_ask` calls, under [conditions listed in the TypeScript reference](https://code.claude.com/docs/en/agent-sdk/typescript#permission-modes-that-can-approve-an-always_ask-call), and a call it approves doesn’t reach your callback. Set the hint explicitly, because an unset `destructiveHint` counts as `false` for `always_ask` calls rather than defaulting to `true`.

## Handle errors

A handler error doesn’t stop the agent loop. The SDK’s in-process MCP server catches uncaught exceptions and returns them as error results, so how you report an error determines what Claude reads, not whether the query fails:

| What happens | Result |
| --- | --- |
| Handler throws an uncaught exception | The MCP server converts it to an error result carrying the raw exception message. Claude sees that message, and the agent loop continues. |
| Handler catches the error and returns `isError: true` (TS) / `"is_error": True` (Python) | Claude sees the message you compose. You can add context the raw exception lacks, such as which request failed or what to try instead. |

In both cases Claude can retry, try a different tool, or explain the failure. Catch errors yourself when the raw exception message isn’t enough for Claude to act on. The example below catches two kinds of failures inside the handler and composes the error message Claude reads. A non-200 HTTP status is caught from the response and returned as an error result. A network error or invalid JSON is caught by the surrounding `try/except` (Python) or `try/catch` (TypeScript) and also returned as an error result. In both cases Claude receives a message that describes the failure instead of a bare exception string.

## Return images and resources

The `content` array in a tool result accepts `text`, `image`, `audio`, `resource`, and `resource_link` blocks. You can mix them in the same response. In TypeScript, the SDK saves audio blocks to disk and Claude receives a text block with the saved file path; in Python, the SDK drops audio blocks from the tool result and logs a warning. Claude receives each resource link block as a text block containing the link’s name, URI, and description. In TypeScript, your application also receives the links themselves as [`resourceLinks`](https://code.claude.com/docs/en/agent-sdk/typescript#sdkmcpresourcelink) on the user message’s `tool_use_result`; in Python, the SDK flattens them to text before the CLI sees the result, so the Python [`resourceLinks` key](https://code.claude.com/docs/en/agent-sdk/python#usermessage) is never produced for in-process tools.

### Images

An image block carries the image bytes inline, encoded as base64. There is no URL field. To return an image that lives at a URL, fetch it in the handler, read the response bytes, and base64-encode them before returning. A PNG, JPEG, GIF, or WebP image reaches Claude as visual input; an image of any other type is saved to disk and Claude receives its file path as text instead.

| Field | Type | Notes |
| --- | --- | --- |
| `type` | `"image"` |  |
| `data` | `string` | Base64-encoded bytes. Raw base64 only, no `data:image/...;base64,` prefix |
| `mimeType` | `string` | Required. For example `image/png`, `image/jpeg`, `image/webp`, `image/gif` |

### Resources

A resource block embeds a piece of content identified by a URI. The actual content rides in the block’s `text` or `blob` field. Use this when your tool produces a generated file or a record from an external system.

| Field | Type | Notes |
| --- | --- | --- |
| `type` | `"resource"` |  |
| `resource.uri` | `string` | Identifier for the content. Any URI scheme |
| `resource.text` | `string` | The content, if it’s text. Provide this or `blob`, not both |
| `resource.blob` | `string` | The content base64-encoded, if it’s binary. TypeScript only: the Python SDK drops binary resources from the tool result and logs a warning |
| `resource.mimeType` | `string` | Optional |

This example shows a resource block returned from inside a tool handler. The SDK doesn’t read from the example’s URI, `file:///tmp/report.md`.

These block shapes come from the MCP `CallToolResult` type. See the [MCP specification](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#tool-result) for the full definition.

## Return structured data

`structuredContent` is an optional JSON object on the result, separate from the `content` array. Use it to return raw values that Claude can read as exact fields instead of parsing them out of a text string or image. When `structuredContent` is set, Claude receives the JSON plus any image or resource blocks from `content`. Text blocks in `content` are not forwarded, since they are assumed to duplicate the structured data. The example below renders a chart as an image block and returns the data points behind it in `structuredContent` from the same handler. In the snippet, `chartPngBuffer` is a `Buffer` holding the rendered PNG bytes.

TypeScript

## Example: unit converter

This tool converts values between units of length, temperature, and weight. A user can ask “convert 100 kilometers to miles” or “what is 72°F in Celsius,” and Claude picks the right unit type and units from the request. It demonstrates two patterns:

-   **Enum schemas:** `unit_type` is constrained to a fixed set of values. In TypeScript, use `z.enum()`. In Python, the dict schema doesn’t support enums, so the full JSON Schema dict is required.
-   **Unsupported input handling:** when a conversion pair isn’t found, the handler returns `isError: true` so Claude can tell the user what went wrong rather than treating a failure as a normal result.

Once the server is defined, pass it to `query` the same way as the weather example. This example sends three different prompts in a loop to show the same tool handling different unit types. For each response, it inspects `AssistantMessage` objects (which contain the tool calls Claude made during that turn) and prints each `ToolUseBlock` before printing the final `ResultMessage` text. This lets you see when Claude is using the tool versus answering from its own knowledge. Because [tool search](https://code.claude.com/docs/en/agent-sdk/tool-search) is on by default, the output may also include a `ToolSearch` call as Claude loads the deferred tool schema.

## Next steps

You can mix the patterns on this page in the same server: a single server can hold a database tool, an API gateway tool, and an image renderer alongside each other. From here:

-   If your server grows to dozens of tools, see [tool search](https://code.claude.com/docs/en/agent-sdk/tool-search) to defer loading them until Claude needs them.
-   To connect to external MCP servers (filesystem, GitHub, Slack) instead of building your own, see [Connect MCP servers](https://code.claude.com/docs/en/agent-sdk/mcp).
-   To control which tools run automatically versus requiring approval, see [Configure permissions](https://code.claude.com/docs/en/agent-sdk/permissions).
