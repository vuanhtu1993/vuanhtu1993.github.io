---
title: "Claude Code Desktop in WSL - Claude Code Docs"
source_url: "https://code.claude.com/docs/en/desktop-wsl"
crawled_at: "2026-11-01T16:45:52.418Z"
---

Claude Code on desktop

Run Code sessions inside a WSL 2 distribution on Windows

On Windows, the Code tab can run a session inside a WSL 2 distribution instead of on Windows itself. The session’s Claude Code process, its tools, and git all execute inside the distribution, using its Linux toolchain and native Linux paths, the same environment your project targets. Use a WSL session when your repository lives inside the distribution’s filesystem. Working on those files from Windows goes through a network filesystem, which is slow and breaks file watching; running the session inside the distribution avoids both.

## Requirements

-   Windows 10 or 11 with [WSL 2](https://learn.microsoft.com/windows/wsl/install). WSL 1 isn’t supported.
-   At least one installed distribution (for example, Ubuntu).
-   `git` installed inside the distribution.

## Start a WSL session

1

2

3

The first session in a distribution takes a little longer while Claude sets up inside it. You can also open a `\\wsl.localhost\...` folder from the normal folder picker, and it reopens inside that distribution.

## What works in a WSL session

Parallel sessions, side chats, visual diff review, branch and pull request status, and worktrees all work, backed by the git and toolchain inside the distribution. “Open in editor” opens VS Code connected to the distribution through [Remote - WSL](https://code.visualstudio.com/docs/remote/wsl). If a Desktop feature is unavailable or limited in a WSL session, check whether it’s one of these:

-   **Terminal and connectors**: your session may lack the [integrated terminal](https://code.claude.com/docs/en/desktop#run-commands-in-the-terminal), [connectors](https://code.claude.com/docs/en/desktop#connect-external-tools), or both. See [If the terminal or connectors are unavailable](#check-for-the-terminal-and-connectors).
-   **[Plugins](https://code.claude.com/docs/en/desktop#install-plugins)**: not available in WSL sessions
-   **File editing**: you can view files in the [file pane](https://code.claude.com/docs/en/desktop#open-and-edit-files) but can’t edit them there, so ask Claude to make the changes
-   **Attachments**: if the **+** menu shows **Add image** in place of **Add files or photos**, you can attach only images. See [Add files and context to prompts](https://code.claude.com/docs/en/desktop#add-files-and-context-to-prompts).

### If the terminal or connectors are unavailable

You can’t turn on the integrated terminal or connectors for a WSL session yourself:

-   **Claude account**: the two features are rolling out separately. Select **Help > Check for Updates…**, and if a feature is still missing after you update, there’s nothing to do.
-   **[Third-party provider](https://code.claude.com/docs/en/third-party-integrations)**: WSL sessions don’t get the terminal or connectors, and updating Desktop doesn’t change that

## Managed devices

On devices managed by an organization, WSL sessions may be unavailable. If session start fails with a message that the device is managed, that’s controlled by your administrator. Administrators: see [how settings reach devices](https://code.claude.com/docs/en/admin-setup#decide-how-settings-reach-devices) in the deployment guide.

Was this page helpful?

[

Linux (beta)

](https://code.claude.com/docs/en/desktop-linux)[

Scheduled tasks

](https://code.claude.com/docs/en/desktop-scheduled-tasks)
