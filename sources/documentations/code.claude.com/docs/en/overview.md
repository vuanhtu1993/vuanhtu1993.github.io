---
title: "Overview - Claude Code Docs"
source_url: "https://code.claude.com/docs/en/overview"
crawled_at: "2026-11-01T16:35:05.887Z"
---

Getting started

Claude Code is an agentic coding tool that reads your codebase, edits files, runs commands, and integrates with your development tools. Available in your terminal, IDE, desktop app, and browser.

Claude Code is an AI-powered coding assistant that helps you build features, fix bugs, and automate development tasks. It understands your entire codebase and can work across multiple files and tools to get things done.

## Get started

Claude Code runs on several surfaces: the terminal, IDE extensions, a desktop app, and the web. Choose one from the tabs below to get started. Most surfaces require a [Claude subscription](https://claude.com/pricing?utm_source=claude_code&utm_medium=docs&utm_content=overview_pricing) or [Anthropic Console](https://platform.claude.com/) account. The Terminal CLI, VS Code, and JetBrains also support [third-party providers](https://code.claude.com/docs/en/third-party-integrations).

-   Terminal
    
-   VS Code
    
-   Desktop app
    
-   Web
    
-   JetBrains
    

The full-featured CLI for working with Claude Code directly in your terminal. Edit files, run commands, and manage your entire project from the command line.To install Claude Code, open a terminal and run the command for your system. If you haven’t used a terminal before, the [terminal guide](https://code.claude.com/docs/en/terminal-guide) shows how to open one and paste the command.

-   Native Install (Recommended)
    
-   Homebrew
    
-   WinGet
    

**macOS, Linux, WSL:**

On Windows, your prompt shows `PS C:\` when you’re in PowerShell and `C:\` without the `PS` when you’re in CMD.**Windows PowerShell:**

**Windows CMD:**

The install command shows no progress while it downloads Claude Code. When the installer finishes, open a new terminal window and run `claude --version`. A working installation prints a version number. If your shell says `claude` isn’t found or isn’t recognized, the install directory isn’t on your PATH yet: see [Fix your PATH](https://code.claude.com/docs/en/troubleshoot-install#command-not-found-claude-after-installation).If you see `The token '&&' is not a valid statement separator`, you’re in PowerShell, not CMD. If you see `'irm' is not recognized as an internal or external command`, you’re in CMD, not PowerShell.If the install command fails with `syntax error near unexpected token '<'`, a `403`, or any other error, see [Troubleshoot installation](https://code.claude.com/docs/en/troubleshoot-install#find-your-error) to match the error to a fix and for alternative install methods.[Git for Windows](https://git-scm.com/downloads/win) is recommended on native Windows so Claude Code can use the Bash tool. If Git for Windows is not installed, Claude Code uses PowerShell as the shell tool instead. WSL setups do not need Git for Windows.

Homebrew offers two casks. `claude-code` tracks the stable release channel, which is typically about a week behind and skips releases with major regressions. `claude-code@latest` tracks the latest channel and receives new versions as soon as they ship.

You can also install with [apt, dnf, or apk](https://code.claude.com/docs/en/setup#install-with-linux-package-managers) on Debian, Fedora, RHEL, and Alpine.Then start Claude Code in any project. Replace `your-project` with the path to a project directory on your machine:

Claude Code prompts you to log in on first use. If you’ve set the `ANTHROPIC_API_KEY` environment variable and you approve the key when Claude Code asks whether to use it, Claude Code skips the login prompt. [Continue with the Quickstart →](https://code.claude.com/docs/en/quickstart)

The VS Code extension provides inline diffs, @-mentions, plan review, and conversation history directly in your editor.

-   [Install for VS Code](vscode:extension/anthropic.claude-code)
-   [Install for Cursor](cursor:extension/anthropic.claude-code)

Or search for “Claude Code” in the Extensions view (`Cmd+Shift+X` on Mac, `Ctrl+Shift+X` on Windows/Linux). After installing, open the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`), type “Claude Code”, and select **Open in New Tab**.[Get started with VS Code →](https://code.claude.com/docs/en/vs-code#get-started)

A standalone app for running Claude Code outside your IDE or terminal. Review diffs visually, run multiple sessions side by side, schedule recurring tasks, and start cloud sessions.Download and install:

-   [macOS](https://claude.ai/api/desktop/darwin/universal/dmg/latest/redirect?utm_source=claude_code&utm_medium=docs) (Intel and Apple Silicon)
-   [Windows](https://claude.ai/api/desktop/win32/x64/setup/latest/redirect?utm_source=claude_code&utm_medium=docs) (x64)
-   [Windows ARM64](https://claude.ai/api/desktop/win32/arm64/setup/latest/redirect?utm_source=claude_code&utm_medium=docs)
-   On Ubuntu or Debian, where the app is in beta, install it with apt by following the [Linux install instructions](https://code.claude.com/docs/en/desktop-linux)

After installing, launch Claude, sign in, and click the **Code** tab to start coding. The app includes Claude Code, so you don’t need to install the CLI separately. A [paid subscription](https://claude.com/pricing?utm_source=claude_code&utm_medium=docs&utm_content=overview_desktop_pricing) is required.[Learn more about the desktop app →](https://code.claude.com/docs/en/desktop-quickstart)

Run Claude Code in your browser with no local setup. Kick off long-running tasks and check back when they’re done, work on repos you don’t have locally, or run multiple tasks in parallel. For a longer body of work, create a [project](https://code.claude.com/docs/en/claude-projects) and let Claude coordinate the parallel sessions for you. Available on desktop browsers and [the Claude app for iOS and Android](https://code.claude.com/docs/en/mobile).Start coding at [claude.ai/code](https://claude.ai/code).[Get started →](https://code.claude.com/docs/en/web-quickstart)

A plugin for IntelliJ IDEA, PyCharm, WebStorm, and other JetBrains IDEs with interactive diff viewing and selection context sharing.Install the [Claude Code plugin](https://plugins.jetbrains.com/plugin/27310-claude-code-beta-) from the JetBrains Marketplace and restart your IDE. The plugin requires the Claude Code CLI, installed separately; see the [JetBrains setup steps](https://code.claude.com/docs/en/jetbrains#installation).[Get started with JetBrains →](https://code.claude.com/docs/en/jetbrains)

## What you can do

Here are some of the ways you can use Claude Code:

## Use Claude Code everywhere

Each [surface](https://code.claude.com/docs/en/glossary#surface) connects to the same underlying Claude Code engine, so your repo’s CLAUDE.md files, settings, and MCP servers work across all of them. Beyond the [Terminal](https://code.claude.com/docs/en/quickstart), [VS Code](https://code.claude.com/docs/en/vs-code), [JetBrains](https://code.claude.com/docs/en/jetbrains), [Desktop](https://code.claude.com/docs/en/desktop), and [Web](https://code.claude.com/docs/en/claude-code-on-the-web) surfaces above, Claude Code integrates with CI/CD, chat, and browser workflows:

| What I want to do | Best option |
| --- | --- |
| Continue a local session from my phone or another device | [Remote Control](https://code.claude.com/docs/en/remote-control) |
| Push events from Telegram, Discord, iMessage, or my own webhooks into a session | [Channels](https://code.claude.com/docs/en/channels) |
| Start a task locally, continue on mobile | [`claude --cloud`](https://code.claude.com/docs/en/claude-code-on-the-web#from-terminal-to-cloud), then the [Claude mobile app](https://code.claude.com/docs/en/mobile) |
| Run Claude on a recurring schedule | [Cloud scheduled tasks](https://code.claude.com/docs/en/routines) or [Desktop scheduled tasks](https://code.claude.com/docs/en/desktop-scheduled-tasks) |
| Automate PR reviews and issue triage | [GitHub Actions](https://code.claude.com/docs/en/github-actions) or [GitLab CI/CD](https://code.claude.com/docs/en/gitlab-ci-cd) |
| Get automatic code review on every PR | [GitHub Code Review](https://code.claude.com/docs/en/code-review) |
| Route bug reports from Slack to pull requests | [Slack](https://code.claude.com/docs/en/slack) |
| Debug live web applications | [Chrome](https://code.claude.com/docs/en/chrome) |
| Build custom agents for your own workflows | [Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview) |

## Next steps

Once you’ve installed Claude Code, these guides help you go deeper.

-   [Quickstart](https://code.claude.com/docs/en/quickstart): walk through your first real task, from exploring a codebase to committing a fix
-   [Store instructions and memories](https://code.claude.com/docs/en/memory): give Claude persistent instructions with CLAUDE.md files and auto memory
-   [Common workflows](https://code.claude.com/docs/en/common-workflows) and [best practices](https://code.claude.com/docs/en/best-practices): patterns for getting the most out of Claude Code
-   [Claude Academy](https://academy.claude.com/): free self-paced courses, including [Claude Code 101](https://academy.claude.com/courses/claude-code-101) and [Claude Code in Action](https://academy.claude.com/courses/claude-code-in-action)
-   [A harness for every task](https://claude.com/blog/a-harness-for-every-task-dynamic-workflows-in-claude-code): how the Claude Code team uses [dynamic workflows](https://code.claude.com/docs/en/workflows) to orchestrate many subagents at once
-   [Settings](https://code.claude.com/docs/en/settings): customize Claude Code for your workflow
-   [Troubleshooting](https://code.claude.com/docs/en/troubleshooting): solutions for common issues
-   [code.claude.com](https://code.claude.com/): demos, pricing, and product details

Was this page helpful?

[

Quickstart

](https://code.claude.com/docs/en/quickstart)
