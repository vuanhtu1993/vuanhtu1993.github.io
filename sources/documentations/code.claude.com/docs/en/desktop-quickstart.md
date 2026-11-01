---
title: "Get started with the desktop app - Claude Code Docs"
source_url: "https://code.claude.com/docs/en/desktop-quickstart"
crawled_at: "2026-11-01T16:38:51.318Z"
---

Claude Code on desktop

Install the Claude desktop app, open the Code tab, and start your first Claude Code session on a project folder on your computer.

The desktop app gives you Claude Code with a graphical interface. You can ask Claude to work on the code in a folder on your computer, then review the changes yourself, without using a terminal. Claude Code is in the **Code** tab at the top of the app’s sidebar. This page walks through installing the app and starting your first session there. Claude Code requires a [Pro, Max, Ultra, Team, or Enterprise subscription](https://claude.com/pricing?utm_source=claude_code&utm_medium=docs&utm_content=desktop_quickstart_pricing).

For Windows ARM64, download the [ARM64 installer](https://claude.ai/api/desktop/win32/arm64/setup/latest/redirect?utm_source=claude_code&utm_medium=docs). On Linux, install with apt; see [Claude Desktop on Linux](https://code.claude.com/docs/en/desktop-linux).

## Install

1

2

The desktop app includes Claude Code, so you don’t need to install Node.js or the CLI to use the Code tab.

## Start your first session

With the Code tab open, choose a project and give Claude something to do.

1

2

3

4

## Now what?

You’ve made your first edit. For the full reference on everything Desktop can do, see [Use Claude Code Desktop](https://code.claude.com/docs/en/desktop). Here are some things to try next. **Interrupt and steer.** You can redirect Claude at any point. Click the stop button to interrupt immediately, or type a correction and press **Enter** to send it without stopping the running action. Either way, you don’t have to wait for it to finish or start over. **Give Claude more context.** Type `@filename` in the prompt box to pull a specific file into the conversation. The more context Claude has, the better the results. See [Add files and context](https://code.claude.com/docs/en/desktop#add-files-and-context-to-prompts). **Use skills for repeatable tasks.** Type `/` or click **+** → **Slash commands** to browse [built-in commands](https://code.claude.com/docs/en/commands), [custom skills](https://code.claude.com/docs/en/skills), and plugin skills. Skills are reusable prompts you can invoke whenever you need them, like code review checklists or deployment steps. **Review changes before committing.** After Claude edits files, a `+12 -1` indicator appears. Click it to open the [diff view](https://code.claude.com/docs/en/desktop#review-changes-with-diff-view), review modifications file by file, and comment on specific lines. Claude reads your comments and revises. To have Claude review the changes itself, enter [`/code-review`](https://code.claude.com/docs/en/desktop#review-your-code) in the prompt box. **Adjust how much control you have.** Your [permission mode](https://code.claude.com/docs/en/desktop#choose-a-permission-mode) sets how much Claude can do without asking for approval:

-   **Auto**: a classifier reviews actions in the background and blocks the risky ones instead of asking you.
-   **Manual**: Claude asks before editing files or running commands.
-   **Accept edits**: Claude auto-accepts file edits for faster iteration.
-   **Plan**: Claude proposes an approach without editing any files, which is useful before a large refactor.

**Add plugins for more capabilities.** Install [plugins](https://code.claude.com/docs/en/desktop#install-plugins) that add skills, agents, MCP servers, and more. **Arrange your workspace.** Drag the chat, diff, terminal, file, and browser panes into whatever layout you want. Open the terminal with **Ctrl+\`** to run commands alongside your session, or click a file path to open it. See [Arrange your workspace](https://code.claude.com/docs/en/desktop#arrange-your-workspace). **Preview your app.** When you run your dev server in the desktop, your app opens in the Browser pane, which can also [open external sites](https://code.claude.com/docs/en/desktop#browse-external-sites). Claude can view the running app, test endpoints, inspect logs, and iterate on what it sees. See [Preview your app](https://code.claude.com/docs/en/desktop#preview-your-app). **Track your pull request.** After opening a PR, Claude Code monitors CI check results and can automatically fix failures. See [Monitor pull request status](https://code.claude.com/docs/en/desktop#monitor-pull-request-status). **Put Claude on a schedule.** Set up [scheduled tasks](https://code.claude.com/docs/en/desktop-scheduled-tasks) to run Claude automatically on a recurring basis: a daily code review every morning, a weekly dependency audit, or a briefing that pulls from your connected tools. **Scale up when you’re ready.** Open [parallel sessions](https://code.claude.com/docs/en/desktop#work-in-parallel-with-sessions) from the sidebar to work on multiple tasks at once, optionally each in its own Git worktree, and open the [tasks pane](https://code.claude.com/docs/en/desktop#watch-background-tasks) to watch the subagents and background commands a session has running. Open a [side chat](https://code.claude.com/docs/en/desktop#ask-a-side-question-without-derailing-the-session) to ask a question without derailing the main thread. Send [long-running work to the cloud](https://code.claude.com/docs/en/desktop#run-long-running-tasks-in-the-cloud) so it continues even if you close the app, or [move a session you already started to the cloud](https://code.claude.com/docs/en/desktop#continue-in-another-surface) if a task takes longer than expected. [Connect external tools](https://code.claude.com/docs/en/desktop#extend-claude-code) like GitHub, Slack, and Linear to bring your workflow together.

## What’s next

-   [Use Claude Code Desktop](https://code.claude.com/docs/en/desktop): permission modes, parallel sessions, diff view, connectors, and enterprise configuration
-   [Coming from the CLI?](https://code.claude.com/docs/en/desktop#coming-from-the-cli): run Desktop and the CLI on the same project, and compare features, flag equivalents, and what’s not available in Desktop
-   [Troubleshooting](https://code.claude.com/docs/en/desktop#troubleshooting): solutions to common errors and setup issues
-   [Best practices](https://code.claude.com/docs/en/best-practices): tips for writing effective prompts and getting the most out of Claude Code
-   [Common workflows](https://code.claude.com/docs/en/common-workflows): tutorials for debugging, refactoring, testing, and more
