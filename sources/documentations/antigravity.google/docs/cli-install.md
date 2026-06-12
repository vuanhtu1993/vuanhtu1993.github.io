---
title: "Google Antigravity Documentation"
source_url: "https://antigravity.google/docs/cli-install"
crawled_at: "2026-06-12T03:41:39.501Z"
---

-   side\_navigation
-   Antigravity CLI
\>-   Installation & Auth

## Installation & auth

Install Antigravity CLI, configure enterprise requirements, and establish secure authenticated sessions.

## Installation

Antigravity CLI runs natively on macOS, Linux, and Windows. Use the platform-specific scripts below to install or upgrade the binary on your system.

### macOS and Linux

Execute the native installer script to download and install the executable to `~/.local/bin/agy`:

            `curl -fsSL https://antigravity.google/cli/install.sh | bash`
        

### Windows

The installation script registers the `agy` binary to your local user directory: `C:\Users\<Username>\AppData\Local\agy\bin` (where `<Username>` represents your active Windows user profile).

**PowerShell**: Open PowerShell and execute the following installation script:

            `irm https://antigravity.google/cli/install.ps1 | iex`
        

**CMD**: Open a standard Command Prompt and execute:

            `curl -fsSL https://antigravity.google/cli/install.cmd -o install.cmd && install.cmd && del install.cmd`
        

### Installation flags

When executing the installation scripts, you can append the following customization flags:

-   `--skip-aliases`: Bypasses shell profile alias purging (prevents the script from purging or updating legacy `agy` or `antigravity` shell aliases).
-   `--skip-path`: Bypasses shell profile `PATH` appending (prevents the script from modifying your shell profile's dynamic environment variables).

## Authentication workflows

Antigravity CLI uses secure credentials and token profiles to communicate with the shared agent harness.

### Local silent keyring sign-in

When launching `agy` on your local machine, the CLI attempts to access your operating system's native secure keyring (such as Apple Keychain, Linux Secret Service/dbus, or Windows Credential Manager). If a valid token profile is found, the CLI authenticates your session silently without opening a browser.

If no saved session is found:

1.  The CLI automatically launches your local default web browser.
2.  Sign in using your approved account credentials.

### Remote SSH OAuth flow

When running over SSH, the CLI detects the remote connection environment. Because it cannot launch a local web browser, the CLI initiates a manual URL loop:

1.  Launch `agy` in your remote terminal session.
2.  The CLI detects the SSH environment and prints a unique, secure authorization URL.
3.  Copy this URL and paste it into a web browser on your local machine.
4.  Sign in with your approved credentials and complete the authentication.
5.  The browser displays a unique alphanumeric authorization code.
6.  Copy this code, return to your remote SSH terminal, and paste it into the prompt.

## Managing your session

Terminating your session clears active credentials and local cache directories.

### Logging out

To disconnect your account and purge saved authentication profiles from your operating system's keyring, run the following command in the CLI prompt box:

            `/logout`
        

## Next steps

Once you complete installation and authentication, start interacting with your local agent:

-   **[Tutorial](https://antigravity.google/docs/cli-tutorial)**: Create and run a basic Python project with an agent.
-   **[Prompting & Interaction](https://antigravity.google/docs/cli-prompting)**: Explore multiline text editing, interrupt commands, and terminal media pasting.
-   **[Permissions & Sandbox](https://antigravity.google/docs/cli-sandbox)**: Configure secure filesystem directories and command limits.
