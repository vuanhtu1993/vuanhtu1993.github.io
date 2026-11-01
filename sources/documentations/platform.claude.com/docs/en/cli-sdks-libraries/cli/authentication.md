---
title: "CLI authentication options"
source_url: "https://platform.claude.com/docs/en/cli-sdks-libraries/cli/authentication"
crawled_at: "2026-11-01T16:29:45.904Z"
---

Authenticate the ant CLI with interactive login, API keys, named profiles, and Workload Identity Federation.

The `ant` CLI supports several credential sources. The [Quickstart](https://platform.claude.com/docs/en/cli-sdks-libraries/cli/quickstart#authentication) covers the one-command login (`ant auth login`). This page covers every option in full.

## Interactive login

`ant auth login` lets you call the API without creating or managing an API key. It opens a browser-based OAuth flow against the Claude Console and stores the resulting credentials under `$ANTHROPIC_CONFIG_DIR` (see [Configuration directory](https://platform.claude.com/docs/en/manage-claude/wif-reference#configuration-directory) for the OS-specific default). On a remote host or in any environment without a local browser, pass `--no-browser` to print the authorize URL and paste the returned code back into the terminal.

During the browser flow, you select an organization and then a [workspace](https://platform.claude.com/docs/en/manage-claude/workspaces). The issued token is [scoped to that workspace](https://platform.claude.com/docs/en/manage-claude/workspaces#api-keys-and-resource-scoping), so the CLI can only see resources that belong to it. Pass `--workspace-id` to bind directly and skip the picker. To work in more than one workspace, see [Switch between workspaces](#switch-between-workspaces).

Interactive login is intended for local development and scripting on your own machine. For non-interactive workloads such as CI, servers, and containers, use [Workload Identity Federation](https://platform.claude.com/docs/en/manage-claude/workload-identity-federation) instead.

Login writes credentials to `credentials/<profile>.json`. The first login for a profile also creates `configs/<profile>.json` and sets it as the active profile. To remove stored credentials, run `ant auth logout`, or `ant auth logout --all` to clear every profile.

## Admin access

By default, `ant auth login` requests a workspace-scoped token. To manage the resources documented on the [Admin API](https://platform.claude.com/docs/en/manage-claude/admin-api) page, request the `org:admin` scope under a dedicated profile:

The `org:admin` scope is granted only to organization members with the admin, owner, or primary owner role. The issued token has organization-wide access, and any workspace binding on the profile does not constrain it. Keep the admin profile separate from your day-to-day profile so routine commands never run with elevated access.

## API key

The CLI also reads your API key from the `ANTHROPIC_API_KEY` environment variable. Get a key from the [Claude Console](https://platform.claude.com/settings/keys).

To override the key for a single run, pass [`--api-key-stdin`](https://platform.claude.com/docs/en/cli-sdks-libraries/cli/using#global-flags) and pipe the key to the command. To point at a different API host, set `ANTHROPIC_BASE_URL` or pass `--base-url`.

If you are using a [personal or service account key](https://platform.claude.com/docs/en/manage-claude/authentication#key-types) that isn’t scoped to a workspace, you must [specify the workspace](https://platform.claude.com/docs/en/manage-claude/authentication#select-a-workspace) to run your command in. Do this by setting an `ANTHROPIC_WORKSPACE_ID` environment variable, which the CLI reads automatically, or by using the [`--workspace-id` flag](https://platform.claude.com/docs/en/cli-sdks-libraries/cli/using#global-flags). The value must be a `wrkspc_...` ID.

## Check authentication status

`ant auth status` prints the credential source the CLI selected (API key environment variable, OAuth login, federation, Google Cloud, or profile), the active profile, the workspace the active token is bound to, and the configuration directory paths. Use it to diagnose why a workload picked the wrong credential or workspace.

Read the `(active)` rows to see which credential source and workspace won. The command reports status rather than performing a health check, so don’t script against the exit status. For the full ordering of credential sources, see [Credential precedence](https://platform.claude.com/docs/en/manage-claude/wif-reference#credential-precedence).

## Switch between workspaces

An interactive-login token is bound to a single workspace. To use the CLI against more than one workspace, log in to each under its own named profile, then switch between them:

Run [`ant auth status`](#check-authentication-status) to confirm which profile and workspace are active.

## Manage profiles

The `ant profile` subcommands inspect and edit profile state directly:

The writable keys for `ant profile set` are `workspace_id`, `base_url`, `organization_id`, `scope`, `client_id`, and `console_url`. Setting `workspace_id` records the target workspace in the profile config but does not rebind credentials that were already issued; run `ant auth login` again under that profile to mint a token for the new workspace.

For the profile file schema and the federation block, see [Profile configuration file](https://platform.claude.com/docs/en/manage-claude/wif-reference#profile-configuration-file). For Workload Identity Federation, see the [Authentication overview](https://platform.claude.com/docs/en/manage-claude/authentication) and the [WIF reference](https://platform.claude.com/docs/en/manage-claude/wif-reference).

## Next steps

Command structure, output formats, GJSON transforms, and request bodies

Version control for API resources, scripting patterns, and use from Claude Code

Non-interactive authentication for CI, servers, and containers
