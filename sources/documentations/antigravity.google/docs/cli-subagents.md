---
title: "Google Antigravity Documentation"
source_url: "https://antigravity.google/docs/cli-subagents"
crawled_at: "2026-06-12T03:43:15.851Z"
---

-   side\_navigation
-   Antigravity CLI
\>-   Agent Capabilities
\>-   Subagents

## Background tasks & subagents

Delegate slow builds, multi-file code generation, and research sweeps to parallel background agents while maintaining your active programming flow.

## Asynchronous execution model

To maximize developer velocity, Antigravity CLI leverages a multi-threaded asynchronous execution architecture. Instead of locking your terminal session during long-running builds, massive codebase search sweeps, or complex multi-file edits, the primary agent delegates these operations to parallel **Subagents** or background **Tasks**.

This delegation model ensures you never have to wait on high-latency AI processes. You can continue drafting code, submitting prompts, or inspecting files while multiple autonomous background threads execute validation tasks in parallel.

## Managing agents: The \`/agents\` panel

The active agent-hierarchy is fully transparent and manageable through an interactive terminal interface.

### Opening the panel

Type `/agents` in the prompt and press `Enter` to open the interactive **Agent Manager Panel**.

### Panel overview

The panel displays a live checklist of all active, completed, killed, or failed background agents:

-   **Identifier**: The unique target subagent ID.
-   **Role**: The specialized role of the agent (such as "Codebase Researcher" or "Database Debugger").
-   **State**: Live status indicators (running, done, killed, or error).
-   **Step**: A real-time summary of the tool or reasoning step currently being executed.

## Deep-dive monitoring

To inspect the inner reasoning, thoughts, and logs of a specific background agent:

1.  Open the `/agents` panel and highlight the target agent using `↑`/`↓`.
2.  Press `Enter` to open the **Subagent Detail View**.
3.  This full-screen view reveals the subagent's entire reasoning log, including its private internal thoughts, tool calls, and execution outputs.
4.  Press `Esc` to exit and return to the main Agent Manager list.

## Monitoring background tasks with \`/tasks\`

For non-agentic background operations, such as direct shell commands, testing suites, or simple background queries initiated via `/btw`, use the `/tasks` command.

            `/tasks`
        

The tasks tracking list lets you:

-   Track standard non-interactive background processes.
-   Select a task using `↑`/`↓` and press `Enter` to view stdout logs.
-   Terminate runaway terminal processes safely.

## Keyboard ergonomics

To reduce context-switching friction when subagents require manual interaction or tool authorizations, Antigravity CLI integrates high-efficiency shortcut paths.

### Detailed "Teleport" navigation (\`Ctrl+J\`)

When a subagent encounters a tool requiring approval (e.g. writing a file or running a database migration), a status bar notification blinks.

-   Press `Alt+J` inside the main prompt panel to instantly "teleport" from your current conversation directly into the Detail View of the next subagent awaiting your approval.
-   Confirm or reject the action, and press `Esc` to teleport back to your primary thread.

### "Fast-Path" confirmations (\`Ctrl+K\`)

To authorize an agent action instantly without leaving your active workspace:

1.  Look at the inline status notification displayed right above your active prompt box. It summarizes the pending action (e.g., `Subagent 12 asks to run "npm test"`).
2.  Press `Ctrl+K` to instantly approve the pending fast-path action without switching panels or opening overlays.

## Next steps

Configure the visual shell behavior and customize your configuration profiles:

-   **[Settings, Rendering & Keybindings](https://antigravity.google/docs/cli-settings)**: Customize key maps, buffering, and JSON rules.
-   **[Permissions & Sandbox](https://antigravity.google/docs/cli-sandbox)**: Enforce security containment rings on background processes.
-   **[Plugins & Skills](https://antigravity.google/docs/cli-plugins)**: Create your own custom skills and slash commands.
