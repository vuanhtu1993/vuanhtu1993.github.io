---
title: "Example settings files - Claude Code Docs"
source_url: "https://code.claude.com/docs/en/settings-example"
crawled_at: "2026-11-01T16:44:56.534Z"
---

Settings

Realistic settings.json files for a developer, a team, and an organization: copy one, keep the keys you want, and change the values.

This page holds three example `settings.json` files, one for each place you save a setting:

-   A developer’s `~/.claude/settings.json`
-   A team’s `.claude/settings.json`, committed to the repository
-   An organization’s `managed-settings.json`

Each one is a plausible file for that reader, so you can see the shape and copy the parts you want. None of them is a recommended baseline. Every value comes from the key’s entry on the [settings reference](https://code.claude.com/docs/en/settings-reference), which has its type, default, and where it can be set. Each example has two tabs. **Copyable settings file** is the file as you’d save it. **What each key does** is the same file with a comment above each key; Claude Code doesn’t accept comments in a settings file, so copy from the first tab.

## Your own settings

One developer’s personal settings. It picks a model and effort, adjusts the terminal, and pre-approves a read-only command and one file read. Everything not listed keeps its default. A file like this goes in `~/.claude/settings.json`, where it applies to every project you open.

-   Copyable settings file
    
-   What each key does
    

Save this as `~/.claude/settings.json`. It’s valid JSON with no comments, so you can paste it as is and delete the keys you don’t want.

~/.claude/settings.json

The same file with a comment above each key. Read it here; copy from the other tab, because Claude Code doesn’t accept comments in a settings file.

~/.claude/settings.json

One team’s shared settings, committed to the repository so everyone who clones it gets the same permissions, hooks, and plugin marketplace. Save a file like this at `.claude/settings.json` at the top of the repository. What to know before you commit one:

-   **Cloud sessions outside a [project](https://code.claude.com/docs/en/claude-projects#what-threads-pick-up-from-your-repositories)’s threads read it too.** A [cloud session](https://code.claude.com/docs/en/settings#settings-in-cloud-sessions) with one repository starts inside the clone, so the committed file applies there as well.
-   **Telemetry goes in managed or personal settings.** Claude Code ignores the [OpenTelemetry exporter variables](https://code.claude.com/docs/en/settings-reference#variables-claude-code-ignores-in-env) in a repository’s settings files, apart from some values that turn telemetry off. Set them in [managed settings](https://code.claude.com/docs/en/monitoring-usage#administrator-configuration) for your organization, or in each person’s `~/.claude/settings.json`.
-   **Allow rules wait for trust.** Allow rules and `extraKnownMarketplaces` entries take effect after each person [trusts this folder itself](https://code.claude.com/docs/en/permissions#project-allow-rules-and-workspace-trust), not only a parent folder; deny and ask rules apply in every session, trusted or not.
-   **The hook is a script in the repo.** This file’s hook runs `.claude/hooks/block-rm.sh`; [How a hook resolves](https://code.claude.com/docs/en/hooks#how-a-hook-resolves) walks through writing it.
-   **Rules match the command and path as written.** `Bash(git push *)` doesn’t match [`git -C . push`](https://code.claude.com/docs/en/permissions#bash-rule-limits). `Read(./.env)` on its own stops the file tools and commands that name the file, such as `cat .env`, but not [`grep -r` run over the directory](https://code.claude.com/docs/en/permissions#read-and-edit); the `sandbox` block in this file closes that gap, because the sandbox [adds your `Read` deny paths](https://code.claude.com/docs/en/settings-reference#sandbox-filesystem-denyread) to what every sandboxed command can’t read.

-   Copyable settings file
    
-   What each key does
    

Save this as `.claude/settings.json` at the top of the repository and commit it. It’s valid JSON with no comments, so you can paste it as is and delete the keys you don’t want.

.claude/settings.json

The same file with a comment above each key. Read it here; copy from the other tab, because Claude Code doesn’t accept comments in a settings file.

.claude/settings.json

## An organization’s managed settings

A `managed-settings.json` file that shows the shape of the managed keys, with one plausible value for each. It isn’t a recommended policy: pick the keys that match your own requirements and set your own values. The example sets these keys:

-   `forceLoginMethod` and `forceLoginOrgUUID` pin the login method and organization
-   `availableModels` and `enforceAvailableModels` restrict which models sessions can use
-   `permissions.deny` denies two file reads and `curl` commands [as Claude writes them](https://code.claude.com/docs/en/permissions#bash-rule-limits), and `disableBypassPermissionsMode` removes the bypass permission mode
-   [`allowManagedPermissionRulesOnly`](https://code.claude.com/docs/en/settings-reference#allowmanagedpermissionrulesonly) and [`allowManagedMcpServersOnly`](https://code.claude.com/docs/en/settings-reference#allowmanagedmcpserversonly) make the managed permission and MCP allowlists the only ones that apply
-   `allowedMcpServers` pins the MCP server by URL
-   `strictKnownMarketplaces` allows one plugin marketplace
-   `sandbox` sandboxes commands with a fixed network allowlist and no unsandboxed retry. Its `failIfUnavailable` key [stops Claude Code from starting where the sandbox can’t run](https://code.claude.com/docs/en/sandboxing#enforce-sandboxing-with-managed-settings)
-   `requiredMinimumVersion` sets a minimum Claude Code version
-   `cleanupPeriodDays` shortens retention of session transcripts and other local data to seven days
-   `companyAnnouncements` shows a message at startup

Administrators deploy a file like this as `managed-settings.json`, or the same JSON through MDM or [server-managed settings](https://code.claude.com/docs/en/server-managed-settings). One deployed file applies to every machine or account it reaches. To give a group different values, deploy a different file or profile to that group, since [server-managed settings don’t support per-group policy yet](https://code.claude.com/docs/en/server-managed-settings#current-limitations).

-   Copyable settings file
    
-   What each key does
    

Deploy this as `managed-settings.json`, or the same JSON through MDM or the claude.ai console. It’s valid JSON with no comments; replace the example organization UUID, server URL, and marketplace with your own and delete the keys you don’t want.

managed-settings.json

The same file with a comment above each key. Read it here; copy from the other tab, because Claude Code doesn’t accept comments in a settings file.

managed-settings.json

Was this page helpful?

[

All settings

](https://code.claude.com/docs/en/settings-reference)[

Permissions

](https://code.claude.com/docs/en/permissions)
