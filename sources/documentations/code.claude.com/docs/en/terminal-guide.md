---
title: "Terminal guide for new users - Claude Code Docs"
source_url: "https://code.claude.com/docs/en/terminal-guide"
crawled_at: "2026-11-01T16:38:39.529Z"
---

A step-by-step guide to installing Claude Code for first-time terminal users on macOS, Linux, and Windows.

You can use Claude Code even if you’ve never used a terminal before. This guide walks you through opening a terminal, installing Claude Code, and your first interactions.

-   [macOS and Linux](#macos-and-linux)
-   [Windows](#windows)

## Install Claude Code on macOS or Linux

Follow these steps to install and start Claude Code from a macOS or Linux terminal. Claude Code requires macOS 13.0 or later. See the [system requirements](https://code.claude.com/docs/en/setup#system-requirements) for supported Linux distributions.

1

2

3

4

---

## Install Claude Code on Windows

Follow these steps to optionally install Git for Windows, set up PowerShell, and start Claude Code on Windows. Claude Code requires Windows 10 version 1809 or later. See the [system requirements](https://code.claude.com/docs/en/setup#system-requirements) for full details.

1

2

3

4

5

---

## What’s next?

Once you see the Claude Code welcome screen, you’re ready to go. You don’t need to know how to code. Describe what you want in plain English, and Claude writes the code for you.

### Build something

Claude can create projects from a description:

If Claude asks for your permission before creating or changing files, press `Enter` to choose **Yes** and approve. Once Claude creates the files, double-click the HTML file to open it in your browser.

### Work with files on your computer

Claude can read and organize files you already have:

### Ask questions

Claude can explain things, help you learn, or plan out a project:

If you don’t have a project yet, that’s fine. Claude can help you start a new one.

### Other ways to use Claude Code

You don’t have to use the terminal. Claude Code is also available in:

-   [VS Code](https://code.claude.com/docs/en/vs-code) and [JetBrains IDEs](https://code.claude.com/docs/en/jetbrains) as editor extensions
-   The [desktop app](https://code.claude.com/docs/en/desktop-quickstart), with no terminal required
-   The [web](https://code.claude.com/docs/en/claude-code-on-the-web) at claude.ai/code for cloud sessions
-   [GitHub Actions](https://code.claude.com/docs/en/github-actions) and [GitLab CI/CD](https://code.claude.com/docs/en/gitlab-ci-cd) for automation

### Learn more

-   [Quickstart](https://code.claude.com/docs/en/quickstart): a guided walkthrough of your first project with Claude Code
-   [How Claude Code works](https://code.claude.com/docs/en/how-claude-code-works): understand how Claude reads your files, runs commands, and makes edits
-   [Best practices](https://code.claude.com/docs/en/best-practices): get better results with effective prompting and project setup
-   [Common workflows](https://code.claude.com/docs/en/common-workflows): step-by-step guides for debugging, testing, refactoring, and more
-   [Terminal configuration](https://code.claude.com/docs/en/terminal-config): customize your terminal for the best Claude Code experience

---

## Troubleshooting

### macOS and Linux troubleshooting

If you run into problems installing on macOS or Linux, check these common issues:

'command not found: claude'

If you see `command not found: claude` after installing, the folder where the installer put `claude` isn’t in your PATH. The installer prints the exact fix under `Setup notes` at the end of the install, so run that command, or use the one for your shell below.For Zsh, the macOS default shell:

For Bash on Linux:

For Bash on macOS, follow the macOS Bash step in [fix your PATH](https://code.claude.com/docs/en/troubleshoot-install#verify-your-path) instead.Then open a new terminal and try `claude` again. If it still isn’t found, check that the file `~/.local/bin/claude` exists. If it doesn’t, the install didn’t finish. For more details, see [fix your PATH](https://code.claude.com/docs/en/troubleshoot-install#verify-your-path).

Error with HTML code or 'syntax error near unexpected token'

If you see `bash: line 1: syntax error near unexpected token '<'` or HTML code like `<!DOCTYPE html>` in your terminal, the install URL returned a web page instead of the installer script.If the page says “App unavailable in region,” Claude Code is not available in your country. See [supported countries](https://www.anthropic.com/supported-countries).Otherwise, try running the command again. If it keeps happening, install with [Homebrew](https://brew.sh/) instead:

When it finishes, open a new terminal window, type `claude --version`, and press Enter: the command prints a version number such as `2.1.211 (Claude Code)` when the install worked.

'dyld' error or 'built for Mac OS X 13.0'

If you see `dyld: cannot load`, `dyld: Symbol not found`, or `built for Mac OS X 13.0`, your macOS version is likely older than Claude Code supports.Open the Apple menu and select About This Mac to check your version. If it’s older than 13.0, update macOS through Software Update. See the [macOS troubleshooting guide](https://code.claude.com/docs/en/troubleshoot-install#dyld-cannot-load-on-macos) for more details.

For other errors, see the full [installation troubleshooting guide](https://code.claude.com/docs/en/troubleshoot-install).

### Windows troubleshooting

If you run into problems installing on Windows, check these common issues:

'irm is not recognized'

You’re in CMD, not PowerShell. Close this window and open PowerShell instead (`Win + X` then select Windows PowerShell).Alternatively, use the CMD install command:

SSL/TLS error or 'Could not create SSL/TLS secure channel'

This usually happens on older Windows 10 systems. Run this line first, then retry the install:

'Claude Code on Windows requires either Git for Windows (for bash) or PowerShell'

Neither PowerShell nor Git Bash was found. Claude Code needs at least one shell.

1.  Ensure `powershell.exe` is on your `PATH`. Its default location is `C:\Windows\System32\WindowsPowerShell\v1.0\`. Alternatively, install [PowerShell 7](https://aka.ms/powershell), which provides `pwsh`.
2.  If you’d rather use Git Bash, install [Git for Windows](https://git-scm.com/downloads/win) per the [first step in the Windows section](#windows).
3.  If Git is installed but Claude Code can’t find it, tell it where to look: Then run `claude` again. If your Git is installed somewhere else, find the path by running: Look for the `Git\bin` folder in that path and use it instead.

To make this permanent so you don’t have to set it every time, see [configure Git Bash path](https://code.claude.com/docs/en/troubleshoot-install#claude-code-on-windows-requires-either-git-for-windows-for-bash-or-powershell).

'claude is not recognized'

If the error started right after Claude Code updated, see [restore `claude.exe` from its backup](https://code.claude.com/docs/en/troubleshoot-install#claude-exe-missing-after-an-update-on-windows) first.If the install directory isn’t in your PATH, add it by running these commands in PowerShell:

Close PowerShell, open a new window, and try `claude` again. You should see the Claude Code welcome screen. See [verify your PATH](https://code.claude.com/docs/en/troubleshoot-install#verify-your-path) for more details.

'Claude Code does not support 32-bit Windows'

On a 64-bit machine, this error means you opened `Windows PowerShell (x86)` instead of `Windows PowerShell`. The x86 entry runs as a 32-bit process. Close it, open the Start menu entry without `(x86)` in its name, and run the install command again. If you’re not sure your machine is 64-bit, or the error persists, see [the full explanation](https://code.claude.com/docs/en/troubleshoot-install#claude-code-does-not-support-32-bit-windows).

For other errors, see the full [installation troubleshooting guide](https://code.claude.com/docs/en/troubleshoot-install).
