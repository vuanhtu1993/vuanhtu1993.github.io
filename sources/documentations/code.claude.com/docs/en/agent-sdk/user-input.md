---
title: "Handle approvals and user input - Claude Code Docs"
source_url: "https://code.claude.com/docs/en/agent-sdk/user-input"
crawled_at: "2026-11-01T16:45:31.164Z"
---

While working on a task, Claude sometimes needs to check in with users. It might need permission before deleting files, or need to ask which database to use for a new project. Your application needs to surface these requests to users so Claude can continue with their input. Claude requests user input in two situations: when it needs **permission to use a tool** (like deleting files or running commands), and when it has **clarifying questions** (via the `AskUserQuestion` tool). Both trigger your `canUseTool` callback, which pauses execution until you return a response. This is different from normal conversation turns where Claude finishes and waits for your next message. For clarifying questions, Claude generates the questions and options. Your role is to present them to users and return their selections. You can’t add your own questions to this flow; if you need to ask users something yourself, do that separately in your application logic. The callback can stay pending indefinitely. Execution remains paused until your callback returns. If a user might take longer to respond than your process can reasonably stay running, register a [`PreToolUse` hook](https://code.claude.com/docs/en/agent-sdk/hooks) that returns the [`defer` decision](https://code.claude.com/docs/en/hooks#defer-a-tool-call-for-later) instead of waiting in the callback, so the process can exit and resume later from the persisted session. This guide shows you how to detect each type of request and respond appropriately.

## Detect when Claude needs input

Pass a `canUseTool` callback in your query options. The callback fires whenever Claude needs user input, receiving the tool name and input as arguments:

The callback fires in two cases:

1.  **Tool needs approval**: Claude wants to use a tool that isn’t auto-approved by a [permission rule](https://code.claude.com/docs/en/agent-sdk/permissions) or permission mode. Check `tool_name` for the tool (e.g., `"Bash"`, `"Write"`).
2.  **Claude asks a question**: Claude calls the `AskUserQuestion` tool. Check if `tool_name == "AskUserQuestion"` to handle it differently. If you specify a `tools` array, include `AskUserQuestion` for this to work. See [Handle clarifying questions](#handle-clarifying-questions) for details.

You can also use the [`PermissionRequest` hook](https://code.claude.com/docs/en/agent-sdk/hooks#available-hooks) to send external notifications (Slack, email, push) when Claude is waiting for approval.

## Handle tool approval requests

Once you’ve passed a `canUseTool` callback in your query options, it fires when Claude wants to use a tool that nothing earlier in the permission flow has approved. In some configurations, such as `dontAsk` mode, Claude Code doesn’t call it; the last step of [How permissions are evaluated](https://code.claude.com/docs/en/agent-sdk/permissions#how-permissions-are-evaluated) lists them and says what happens to the call instead. Your callback receives three arguments:

| Argument | Description |
| --- | --- |
| `toolName` | The name of the tool Claude wants to use (for example, `"Bash"`, `"Write"`, `"Edit"`) |
| `input` | The parameters Claude is passing to the tool. Contents vary by tool. |
| `options` (TS) / `context` (Python) | Additional context including optional `suggestions` (proposed `PermissionUpdate` entries to avoid re-prompting) and a cancellation signal. In TypeScript, `signal` is an `AbortSignal`; in Python, the signal field is reserved for future use. See [`ToolPermissionContext`](https://code.claude.com/docs/en/agent-sdk/python#toolpermissioncontext) for Python. |

The `input` object contains tool-specific parameters. Common examples:

| Tool | Input fields |
| --- | --- |
| `Bash` | `command`, `description`, `timeout` |
| `Write` | `file_path`, `content` |
| `Edit` | `file_path`, `old_string`, `new_string` |
| `Read` | `file_path`, `offset`, `limit` |

See the SDK reference for complete input schemas: [Python](https://code.claude.com/docs/en/agent-sdk/python#tool-input%2Foutput-types) | [TypeScript](https://code.claude.com/docs/en/agent-sdk/typescript#tool-input-types). You can display this information to the user so they can decide whether to allow or reject the action, then return the appropriate response. The following example asks Claude to create and delete a test file. When Claude attempts each operation, the callback prints the tool request to the terminal and prompts for y/n approval.

This example uses a `y/n` flow where any input other than `y` is treated as a denial. In practice, you might build a richer UI that lets users modify the request, provide feedback, or redirect Claude entirely. See [Respond to tool requests](#respond-to-tool-requests) for all the ways you can respond.

### Respond to tool requests

Your callback returns one of two response types:

| Response | Python | TypeScript |
| --- | --- | --- |
| **Allow** | `PermissionResultAllow(updated_input=...)` | `{ behavior: "allow", updatedInput }` |
| **Deny** | `PermissionResultDeny(message=...)` | `{ behavior: "deny", message }` |

When allowing, the tool runs with the input Claude requested unless you return a modified input, `updatedInput` in TypeScript or `updated_input` in Python. Before v2.1.207, Claude Code rejected an allow result that omitted `updatedInput` and denied the tool call with a validation error. When denying, provide a message explaining why. Claude sees this message and may adjust its approach. Beyond allowing or denying, you can modify the tool’s input or provide context that helps Claude adjust its approach:

-   **Approve**: let the tool execute as Claude requested
-   **Approve with changes**: modify the input before execution (for example, sanitize paths, add constraints)
-   **Approve and remember**: echo a suggested permission rule back so matching calls skip the prompt next time
-   **Reject**: block the tool and tell Claude why
-   **Suggest alternative**: block but guide Claude toward what the user wants instead
-   **Redirect entirely**: use [streaming input](https://code.claude.com/docs/en/agent-sdk/streaming-vs-single-mode) to send Claude a completely new instruction

The `ask_user` and `askUser` helpers in the following snippets stand in for your application’s own prompt UI.

-   Approve
    
-   Approve with changes
    
-   Approve and remember
    
-   Reject
    
-   Suggest alternative
    
-   Redirect entirely
    

The user approves the action as-is. Pass through the `input` from your callback unchanged and the tool executes exactly as Claude requested.

The user approves but wants to modify the request first. You can change the input before the tool executes. Claude sees the result but isn’t told you changed anything. Useful for sanitizing parameters, adding constraints, or scoping access.

The user approves and doesn’t want to be asked again for this kind of call. The third callback argument carries `suggestions`, an array of ready-made [`PermissionUpdate`](https://code.claude.com/docs/en/agent-sdk/typescript#permissionupdate) entries. Echo one back in `updatedPermissions` to apply it. A suggestion with the `localSettings` destination writes the rule to `.claude/settings.local.json` so future sessions skip the prompt for matching calls.In TypeScript, skip the always-allow choice for a request whose options carry [`suppressAlwaysAllowRule: true`](https://code.claude.com/docs/en/agent-sdk/typescript#canusetool). The hint requires Agent SDK v0.3.268 or later, and the Python `context` doesn’t carry it.The Python example requires `claude-agent-sdk` 0.1.80 or later.

The user doesn’t want this action to happen. Block the tool and provide a message explaining why. Claude sees this message and may try a different approach.

The user doesn’t want this specific action, but has a different idea. Block the tool and include guidance in your message. Claude will read this and decide how to proceed based on your feedback.

For a complete change of direction (not just a nudge), use [streaming input](https://code.claude.com/docs/en/agent-sdk/streaming-vs-single-mode) to send Claude a new instruction directly. This bypasses the current tool request and gives Claude entirely new instructions to follow.

## Handle clarifying questions

When Claude needs more direction on a task with multiple valid approaches, it calls the `AskUserQuestion` tool. This triggers your `canUseTool` callback with `toolName` set to `AskUserQuestion`. The input contains Claude’s questions as multiple-choice options, which you display to the user and return their selections.

The following steps show how to handle clarifying questions:

1

2

3

4

5

Return answers to Claude

Build the `answers` object as a record where each key is the `question` text and each value is the selected option’s `label`:

| From the question object | Use as |
| --- | --- |
| `question` field (for example, `"How should I format the output?"`) | Key |
| Selected option’s `label` field (for example, `"Summary"`) | Value |

For multi-select questions, pass an array of labels or join them with `", "`. If you [support free-text input](#support-free-text-input), use the user’s custom text as the value.

### Question format

The input contains Claude’s generated questions in a `questions` array. Each question has these fields:

| Field | Description |
| --- | --- |
| `question` | The full question text to display |
| `header` | Short label for the question (max 12 characters) |
| `options` | Array of 2-4 choices, each with `label` and `description`. TypeScript: optionally `preview`. See [Option previews](#option-previews-typescript). |
| `multiSelect` | If `true`, users can select multiple options |

The structure your callback receives:

#### Option previews (TypeScript)

`toolConfig.askUserQuestion.previewFormat` adds a `preview` field to each option so your app can show a visual mockup alongside the label. Without this setting, Claude does not generate previews and the field is absent.

| `previewFormat` | `preview` contains |
| --- | --- |
| unset (default) | Field is absent. Claude does not generate previews. |
| `"markdown"` | ASCII art and fenced code blocks |
| `"html"` | A styled `<div>` fragment (the SDK rejects `<script>`, `<style>`, and `<!DOCTYPE>` before your callback runs) |

The format applies to all questions in the session. Claude includes `preview` on options where a visual comparison helps (layout choices, color schemes) and omits it where one wouldn’t (yes/no confirmations, text-only choices). Check for `undefined` before rendering.

An option with an HTML preview:

### Response format

Return an `answers` object mapping each question’s `question` field to the selected option’s `label`:

| Field | Description |
| --- | --- |
| `questions` | Pass through the original questions array (required for tool processing) |
| `answers` | Object where keys are question text and values are selected labels |
| `response` | Optional freeform reply the user typed instead of answering the structured questions |

For multi-select questions, pass an array of labels or join them with `", "`. For per-question free text such as an “Other” option, put the user’s text in `answers[question]` as shown in [Support free-text input](#support-free-text-input). Set `response` only when your UI lets the user dismiss the question card and type a general reply that isn’t an answer to any specific question. When `response` is set, Claude receives “The user responded: …” instead of the per-question answer list.

#### Support free-text input

Claude’s predefined options won’t always cover what users want. To let users type their own answer:

-   Display an additional “Other” choice after Claude’s options that accepts text input
-   Use the user’s custom text as the answer value (not the word “Other”)

See the [complete example](#complete-example) below for a full implementation.

### Complete example

Claude asks clarifying questions when it needs user input to proceed. For example, when asked to help decide on a tech stack for a mobile app, Claude might ask about cross-platform vs native, backend preferences, or target platforms. These questions help Claude make decisions that match the user’s preferences rather than guessing. This example handles those questions in a terminal application. Here’s what happens at each step:

1.  **Route the request**: The `canUseTool` callback checks if the tool name is `"AskUserQuestion"` and routes to a dedicated handler
2.  **Display questions**: The handler loops through the `questions` array and prints each question with numbered options
3.  **Collect input**: The user can enter a number to select an option, or type free text directly (for example, “jquery”, “i don’t know”)
4.  **Map answers**: The code checks if input is numeric (uses the option’s label) or free text (uses the text directly)
5.  **Return to Claude**: The response includes both the original `questions` array and the `answers` mapping

Save the TypeScript version as `ask.ts` and run it with `npx tsx ask.ts`, or save the Python version as `ask.py` and run it with `python ask.py`.

## Limitations

-   **Subagents**: `AskUserQuestion` is not currently available in subagents spawned via the Agent tool
-   **Question limits**: each `AskUserQuestion` call supports 1-4 questions with 2-4 options each

## Other ways to get user input

The `canUseTool` callback and `AskUserQuestion` tool cover most approval and clarification scenarios, but the SDK offers other ways to get input from users:

### Streaming input

Use [streaming input](https://code.claude.com/docs/en/agent-sdk/streaming-vs-single-mode) when you need to:

-   **Interrupt the agent mid-task**: send a cancel signal or change direction while Claude is working
-   **Provide additional context**: add information Claude needs without waiting for it to ask
-   **Build chat interfaces**: let users send follow-up messages during long-running operations

Streaming input is ideal for conversational UIs where users interact with the agent throughout execution, not just at approval checkpoints.

### Custom tools

Use [custom tools](https://code.claude.com/docs/en/agent-sdk/custom-tools) when you need to:

-   **Collect structured input**: build forms, wizards, or multi-step workflows that go beyond `AskUserQuestion`’s multiple-choice format
-   **Integrate external approval systems**: connect to existing ticketing, workflow, or approval platforms
-   **Implement domain-specific interactions**: create tools tailored to your application’s needs, like code review interfaces or deployment checklists

Custom tools give you full control over the interaction, but require more implementation work than using the built-in `canUseTool` callback.

-   [Configure permissions](https://code.claude.com/docs/en/agent-sdk/permissions): set up permission modes and rules
-   [Control execution with hooks](https://code.claude.com/docs/en/agent-sdk/hooks): run custom code at key points in the agent lifecycle
-   [TypeScript SDK reference](https://code.claude.com/docs/en/agent-sdk/typescript#canusetool): full canUseTool API documentation
