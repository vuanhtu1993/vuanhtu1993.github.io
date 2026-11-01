---
title: "Get started with Claude Code in the cloud - Claude Code Docs"
source_url: "https://code.claude.com/docs/en/web-quickstart"
crawled_at: "2026-11-01T16:38:53.987Z"
---

A cloud session runs Claude Code on cloud infrastructure instead of your machine, Anthropic-managed by default. This quickstart starts one from [claude.ai/code](https://claude.ai/code) in your browser. You can also start one from the Claude mobile app, the Desktop app, or your terminal with `claude --cloud`. You’ll need a GitHub repository to [get started](#connect-github). Claude clones it into an isolated virtual machine, makes changes, and pushes a branch for you to review. Sessions persist across devices, so a task you start on your laptop is ready to review from your phone later. Each session counts toward your plan’s usage limits alongside the rest of your Claude and Claude Code usage, and there’s no separate charge for the cloud VM. Cloud sessions work well for:

-   **Parallel tasks**: run several independent tasks at once, each in its own session and branch, without managing multiple worktrees
-   **Repos you don’t have locally**: Claude clones the repo fresh every session, so you don’t need it checked out
-   **Tasks that don’t need frequent steering**: submit a well-defined task, do something else, and review the result when Claude is done
-   **Code questions and exploration**: understand a codebase or trace how a feature is implemented without a local checkout

For work that needs your local config, tools, or environment, running Claude Code locally or using [Remote Control](https://code.claude.com/docs/en/remote-control) is a better fit.

## How sessions run

The steps below describe Anthropic-hosted sessions. In a [self-hosted environment](https://code.claude.com/docs/en/self-hosted-environments), the clone and everything after it run on your organization’s own runners, where network boundaries, setup, and push behavior are operator-configured. When you submit a task:

1.  **Clone and prepare**: your repository is cloned to an Anthropic-managed VM, and your [setup script](https://code.claude.com/docs/en/cloud-environments#setup-scripts) runs if configured.
2.  **Configure network**: internet access is set based on your environment’s [access level](https://code.claude.com/docs/en/cloud-environments#access-levels).
3.  **Work**: Claude analyzes code, makes changes, runs tests, and checks its work. You can watch and steer throughout, or step away and come back when it’s done.
4.  **Push the branch**: when Claude reaches a stopping point, it pushes its branch to GitHub. You review the diff, leave inline comments, create a PR, or send another message to keep going.

The session doesn’t close when the branch is pushed. PR creation and further edits all happen within the same conversation.

## Compare ways to run Claude Code

Claude Code behaves the same everywhere. What changes is where the session runs and whether your local configuration is available:

|  | Cloud session | Local session | Local session with [Remote Control](https://code.claude.com/docs/en/remote-control) |
| --- | --- | --- | --- |
| **Code runs on** | Cloud VM, Anthropic-managed by default | Your machine | Your machine |
| **You start it from** | claude.ai/code, the Claude mobile app, the Desktop app with **Cloud** selected, or `claude --cloud` | Your terminal, your IDE, or the Desktop app with **Local** selected | Your terminal, the VS Code extension, or the Desktop app |
| **You chat from** | claude.ai, the mobile app, or the Desktop app | Where you started it | claude.ai or the mobile app, as well as where you started it |
| **Uses your local config** | No, repo only | Yes | Yes |
| **Requires GitHub** | Yes, or [bundle a local repo](https://code.claude.com/docs/en/claude-code-on-the-web#send-local-repositories-without-github) via `--cloud` | No | No |
| **Keeps running if you disconnect** | Yes | No | While the session stays open on your machine |
| **[Permission modes](https://code.claude.com/docs/en/permission-modes)** | Accept edits, Plan, Auto | All modes in the terminal; see [Switch permission modes](https://code.claude.com/docs/en/permission-modes#switch-permission-modes) for the IDE and Desktop app | Manual, Accept edits, Plan, or Auto from claude.ai and the mobile app |
| **Network access** | Configurable per environment | Your machine’s network | Your machine’s network |

See the [terminal quickstart](https://code.claude.com/docs/en/quickstart), [Desktop app](https://code.claude.com/docs/en/desktop), or [Remote Control](https://code.claude.com/docs/en/remote-control) docs to set up local sessions.

## Connect GitHub

Connecting GitHub is a one-time step. If you already use the GitHub CLI, you can [do this from your terminal](#connect-from-your-terminal) instead of the browser.

1

2

3

### Connect from your terminal

If you already use the GitHub CLI (`gh`), you can connect GitHub for cloud sessions from your terminal. This requires the [Claude Code CLI](https://code.claude.com/docs/en/quickstart). On Team and Enterprise plans, `/web-setup` is available only after an Owner turns on [Quick setup](https://code.claude.com/docs/en/claude-code-on-the-web#quick-setup-for-team-and-enterprise). When you run `/web-setup`, Claude Code reads the token that `gh auth token` prints, asks you to confirm, and sends the token to Anthropic. Anthropic stores it encrypted with your claude.ai account, and your cloud sessions use it for GitHub access until you [remove it](#remove-the-web-setup-token). A cloud session you start yourself can then access any repository that token can access, with no Claude GitHub App installation. Threads in a [project](https://code.claude.com/docs/en/claude-projects#set-up-github-access) still need the Claude GitHub App. If you already connected GitHub in the browser, `/web-setup` warns you that continuing replaces that connection for your cloud sessions.

1

2

3

#### Remove the `/web-setup` token

To remove the token from your Claude account, disconnect GitHub at [claude.ai/customize/connectors](https://claude.ai/customize/connectors). Disconnecting deletes the GitHub credentials your cloud sessions use, whether they came from the browser or from `/web-setup`, so cloud sessions lose GitHub access until you connect again. Your local `gh` stays signed in, and the token remains valid on GitHub. To invalidate the token itself, revoke it on GitHub. If you signed in to `gh` through the browser, the token belongs to the **GitHub CLI** entry under [**Settings > Applications > Authorized OAuth Apps**](https://github.com/settings/applications) on GitHub, and revoking that entry also signs the GitHub CLI out on your machines. Cloud sessions then lose GitHub access until you run `gh auth login` and `/web-setup` again.

## Start a task

With GitHub connected and an environment created, you’re ready to submit tasks.

1

2

3

## Pre-fill sessions

You can prefill the prompt, repositories, and environment for a new session by adding query parameters to the [claude.ai/code](https://claude.ai/code) URL. Use this to build integrations such as a button in your issue tracker that opens Claude Code with the issue description as the prompt.

| Parameter | Description |
| --- | --- |
| `prompt` | Prompt text to prefill in the input box. The alias `q` is also accepted. |
| `prompt_url` | URL to fetch the prompt text from, for prompts too long to embed in a query string. The URL must allow cross-origin requests. Ignored when `prompt` is also set. |
| `repositories` | Comma-separated list of `owner/repo` slugs to preselect. The alias `repo` is also accepted. |
| `environment` | Name or ID of the [environment](#connect-github) to preselect. |

URL-encode each value. The example below opens the form with a prompt and a repository already selected:

## Review and iterate

When Claude finishes, review the changes, leave feedback on specific lines, and keep going until the diff looks right.

1

2

3

4

## Troubleshoot setup

### No repositories appear after connecting GitHub

If you connected GitHub in the browser, sessions can clone any public repository, but a private repository appears only when the Claude GitHub App is installed on the account or organization that owns it and the installation’s repository access includes it. [Install the Claude GitHub App](https://github.com/apps/claude/installations/new) there, or ask an organization owner to install or approve it. If you connected with `/web-setup`, sessions reach every repository your `gh` token can access. Run `gh repo view OWNER/REPO` in your shell to check that your GitHub CLI login can see the repository, and run `/web-setup` again if you’ve switched `gh` accounts since connecting.

### The page only shows a GitHub login button

Cloud sessions require a connected GitHub account. Connect via the browser flow above, or run `/web-setup` from your terminal if you use the GitHub CLI. If you’d rather not connect GitHub at all, see [Remote Control](https://code.claude.com/docs/en/remote-control) to run Claude Code on your own machine and monitor it from your browser or phone.

### ”Claude Code isn’t available on your account”

Your seat in the selected organization doesn’t include Claude Code. If you belong to another organization, click **Switch organization** on that page. Otherwise, ask an Owner of the organization to assign you a [seat that includes Claude Code](https://support.claude.com/en/articles/11845131-use-claude-code-with-your-team-or-enterprise-plan).

### `/web-setup` says “Not signed in to Claude”

If `/web-setup` responds with “Not signed in to Claude. Run /login first.”, the CLI doesn’t have a valid claude.ai sign-in. This can also happen when a previous sign-in has expired. Run `/login`, sign in with your claude.ai account, then run `/web-setup` again.

### `/web-setup` warns that your token doesn’t have the `workflow` scope

If `/web-setup` says your GitHub CLI token doesn’t have the `workflow` scope, you can continue, but GitHub can reject some pushes made with that token, such as pushes that change GitHub Actions workflow files. To add the scope, run `gh auth refresh -s workflow` in your shell, then run `/web-setup` again.

### `/web-setup` shows “No commands match” or “Unknown command”

`/web-setup` runs inside the Claude Code CLI, not your shell. Launch `claude` first, then type `/web-setup` at the prompt. If you typed it inside Claude Code and the command menu shows `No commands match "/web-setup"`, or submitting it returns `Unknown command: /web-setup`, the command is hidden because a requirement isn’t met. The cause is usually that you’re authenticated with an API key or third-party provider instead of a claude.ai subscription. Run `/login` to sign in with your claude.ai account. On Team and Enterprise plans, the command is hidden by default: the [Quick setup toggle](https://code.claude.com/docs/en/claude-code-on-the-web#quick-setup-for-team-and-enterprise) is off until an Owner turns it on. While it’s off, [connect GitHub from the browser](#connect-github) instead. The command is also hidden in two other cases:

-   An administrator has disabled cloud sessions for your organization. In this case, submitting `/web-setup` returns [`Cloud sessions are disabled by your organization's policy`](https://code.claude.com/docs/en/errors#cloud-sessions-are-disabled-by-your-organizations-policy). Before v2.1.268, this case also returned `Unknown command: /web-setup`.
-   Your Enterprise organization has [Zero Data Retention](https://code.claude.com/docs/en/zero-data-retention) enabled, or has the [HIPAA configuration](https://code.claude.com/docs/en/hipaa-setup) applied. Either one makes cloud sessions unavailable.

### ”Could not create a cloud environment” or “No cloud environment available” when using `--cloud`

Cloud session features create a default cloud environment automatically if you don’t have one. If you see “Could not create a cloud environment”, automatic creation failed. If you see “No cloud environment available”, your CLI predates automatic creation. In either case, run `/web-setup` in the Claude Code CLI, or add an environment from the [environment selector](https://code.claude.com/docs/en/cloud-environments#configure-your-environment) at [claude.ai/code](https://claude.ai/code).

### Setup script failed

The setup script exited with a non-zero status, which blocks the session from starting. Common causes:

-   A package install failed because the registry isn’t in your [network access level](https://code.claude.com/docs/en/cloud-environments#access-levels). `Trusted` covers most package managers; `None` blocks them all.
-   The script references a file or path that doesn’t exist in a fresh clone.
-   A command that works locally needs a different invocation on Ubuntu.

To debug, add `set -x` at the top of the script to see which command failed. For non-critical commands, append `|| true` so they don’t block session start.

### New sessions hang or time out during setup

If new sessions stall on the setup script step or fail with a generic container error before the script finishes, the script is likely exceeding the roughly five-minute time budget for building the [environment cache](https://code.claude.com/docs/en/cloud-environments#environment-caching). Heavy steps such as pulling large Docker images, syncing full dependency trees, or downloading model weights often push the total over the limit, especially when they run one after another. To fix this, trim the script so it reliably finishes in under five minutes:

-   Run independent installs in parallel with `&` and a final `wait` instead of running them serially.
-   Move the largest downloads out of the setup script and into a [SessionStart hook](https://code.claude.com/docs/en/cloud-environments#setup-scripts-vs-sessionstart-hooks) that launches them in the background, so the session becomes usable while they finish.
-   Remove long retry sleeps from the setup script, since a stalled retry loop counts against the budget.

### Session keeps running after closing the tab

This is by design. Closing the tab or navigating away doesn’t stop the session. It continues running in the background until Claude finishes the current task, then idles. From the sidebar, you can [archive a session](https://code.claude.com/docs/en/claude-code-on-the-web#archive-sessions) to hide it from your list, or [delete it](https://code.claude.com/docs/en/claude-code-on-the-web#delete-sessions) to remove it permanently.

## Next steps

Now that you can submit and review tasks, these pages cover what comes next: starting cloud sessions from your terminal, scheduling recurring work, and giving Claude standing instructions.

-   [Use Claude Code in the cloud](https://code.claude.com/docs/en/claude-code-on-the-web): the full reference, including teleporting sessions to your terminal, session sharing, and auto-fixing pull requests
-   [Configure cloud environments](https://code.claude.com/docs/en/cloud-environments): network access levels, environment variables, and setup scripts for cloud sessions
-   [Cloud scheduled tasks](https://code.claude.com/docs/en/routines): automate work on a schedule, via API call, or in response to GitHub events
-   [CLAUDE.md](https://code.claude.com/docs/en/memory): give Claude persistent instructions and context that load at the start of every session
-   Install the Claude mobile app for [iOS](https://apps.apple.com/us/app/claude-by-anthropic/id6473753684) or [Android](https://play.google.com/store/apps/details?id=com.anthropic.claude) to monitor sessions from your phone. From the Claude Code CLI, `/mobile` shows a QR code for [claude.ai/mobile](https://claude.ai/mobile) that opens the right app store for your phone.
