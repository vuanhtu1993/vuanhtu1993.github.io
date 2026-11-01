---
title: "Admin API"
source_url: "https://platform.claude.com/docs/en/manage-claude/admin-api"
crawled_at: "2026-11-01T16:14:41.381Z"
---

AdminOrganization

Manage organization members, workspaces, invites, and API keys programmatically with the Admin API, using an Admin API key, an `org:admin` OAuth token, or a personal or service account key.

The [Admin API](https://platform.claude.com/docs/en/api/organization) lets you manage your organization’s members, workspaces, invites, and API keys programmatically instead of by hand in the [Claude Console](https://platform.claude.com/).

## Availability

The Admin API is unavailable for individual accounts. To collaborate with teammates and add members, set up your organization on the [Organization](https://platform.claude.com/settings/organization) page (`platform.claude.com/settings/organization`) in the Claude Console.

Claude Enterprise (claude.ai) organizations call the Admin API with a scoped API key created in claude.ai. From this page, only the members and invites endpoints apply to them. They can also call the [Usage and Cost Analytics API](https://platform.claude.com/docs/en/manage-claude/usage-cost-analytics-api), which is in beta and takes a key with the `read:analytics` scope. They also get Enterprise-only endpoints: group and custom-role reads, and [spend limits](https://platform.claude.com/docs/en/manage-claude/spend-limits-api). The [Plugins API](https://platform.claude.com/docs/en/manage-claude/plugins-api), also Enterprise-only, is in beta. So is the [Claude Tag API](https://platform.claude.com/docs/en/manage-claude/claude-tag-api). See [User management](https://platform.claude.com/docs/en/manage-claude/user-management).

On [Claude Platform on AWS](https://platform.claude.com/docs/en/build-with-claude/claude-platform-on-aws), only these Admin API endpoints are available:

-   The workspace endpoints: create, get, list, update, and archive on `/v1/organizations/workspaces`.
-   The external key endpoints, for [CMEK](https://platform.claude.com/docs/en/manage-claude/cmek-claude-platform-on-aws): register, get, list, update, and delete on `/v1/organizations/external_keys`. There is no validate endpoint, because keys are validated when attached to a workspace.
-   The [telemetry destination endpoints](https://platform.claude.com/docs/en/api/claude-platform-on-aws-iam-actions#telemetry-destinations).
-   The [Usage and Cost Analytics API](https://platform.claude.com/docs/en/manage-claude/usage-cost-analytics-api) endpoints: `/v1/organizations/analytics/usage` and `/v1/organizations/analytics/cost`.

Organization members, workspace members, invites, API keys, the legacy [Usage and Cost API](https://platform.claude.com/docs/en/manage-claude/usage-cost-api), and the rate limit reports aren’t available on Claude Platform on AWS.

## Authentication

The Admin API accepts any of these three credentials:

-   An **Admin API key** (starting with `sk-ant-admin...`) sent in the `x-api-key` header. Only organization members with the admin role can provision one. See [Create an Admin API key](https://platform.claude.com/docs/en/manage-claude/admin-api-keys).
-   An **OAuth bearer token** with the `org:admin` scope sent in the `authorization: Bearer` header. Only members with the admin, owner, or primary owner role can obtain one. See [Obtain an OAuth bearer token](#oauth-bearer-token).
-   A **personal key** or **service account key** that isn’t scoped to a specific workspace, sent in the `x-api-key` header. The key has the same permissions as the linked account. See [Key types](https://platform.claude.com/docs/en/manage-claude/authentication#key-types).

An Admin API key covers most endpoints. The service-account, federation-issuer, and federation-rule endpoints accept only an `org:admin` OAuth token. Send a personal key or service account key in the `x-api-key` header, as you would an Admin API key. The following examples call the [organization info endpoint](#accessing-organization-info) with an OAuth token and with an Admin API key.

In Python, TypeScript, C#, Go, Java, PHP, and Ruby, the SDK exposes the endpoints on this page under `client.organization`, and the `ant` CLI under `ant organization`. The examples on this page use the default client, which reads an Admin API key from `ANTHROPIC_API_KEY` or an OAuth bearer token from `ANTHROPIC_AUTH_TOKEN`. SDK list methods in Python, TypeScript, C#, Go, and Java return an iterator that fetches more pages on demand, so `limit` sets the page size, not the total. The PHP, Ruby, and curl examples return one page. In the CLI, `--limit` caps the results on the member, invite, workspace, workspace-member, and API-key lists. For each endpoint’s parameters and responses, see the [Admin API reference](https://platform.claude.com/docs/en/api/organization).

### OAuth bearer token

Log in with the [`ant` CLI](https://platform.claude.com/docs/en/cli-sdks-libraries/cli/quickstart) under a dedicated profile with the `org:admin` scope (see [Admin access](https://platform.claude.com/docs/en/cli-sdks-libraries/cli/authentication#admin-access)), then export the bearer token. `--profile admin` stores the `org:admin` credential under its own profile and makes it the CLI’s active profile. The exported variable applies to every SDK and CLI call in that shell. Use a shell you reserve for administration, unset the variable when you’re done, and switch the CLI back with `ant profile activate default`:

Interactive tokens are short-lived. If requests start returning 401, re-run the `export` command to refresh the token.

The SDK and the `ant` CLI read `ANTHROPIC_AUTH_TOKEN` automatically. Leave `ANTHROPIC_API_KEY` unset in the same shell so they send the bearer token. Automated workloads skip the login: they authenticate through workload identity federation, and the SDK and CLI perform the token exchange from the federation environment variables. See [Bootstrap a workload to manage WIF](https://platform.claude.com/docs/en/manage-claude/wif-admin-api#bootstrap-a-workload-to-manage-wif).

Call the Admin API with the exported token:

An `org:admin` token grants access to the whole organization, regardless of the workspace the underlying profile or [federation rule](#federation-rules) is bound to.

For CI and other non-interactive workloads, mint the token with Workload Identity Federation instead of logging in interactively. See [Manage WIF with the Admin API](https://platform.claude.com/docs/en/manage-claude/wif-admin-api#workload-ci-and-automation).

### Admin API key

To create an Admin API key for your organization type, see [Create an Admin API key](https://platform.claude.com/docs/en/manage-claude/admin-api-keys).

## How the Admin API works

Authenticate with any credential from [Authentication](#authentication), then manage the following resources:

-   Organization members and their roles
-   Organization invites
-   Workspaces and their members
-   API keys
-   Service accounts, federation issuers, and federation rules (`org:admin` OAuth token only)

Common uses include automating onboarding and offboarding, managing workspace access, and auditing API keys.

## Organization roles and permissions

There are five organization-level roles. For details, see [API Console roles and permissions](https://support.claude.com/en/articles/10186004-api-console-roles-and-permissions).

| Role | Permissions |
| --- | --- |
| user | Can use playground |
| claude\_code\_user | Can use playground and [Claude Code](https://code.claude.com/docs/en/overview) |
| developer | Can use playground and manage API keys |
| billing | Can use playground and manage billing details |
| admin | Can do all of the preceding, plus manage users |

Organization owners and primary owners have all admin permissions and can also manage admins. All references to the admin role on this page also apply to owners and primary owners.

## Key concepts

### Organization members

List [organization members](https://platform.claude.com/docs/en/api/organization/users/retrieve), update their roles, and remove them.

List the members of your organization:

Update a member’s role:

Remove a member from the organization:

### Organization invites

Invite users to your organization and manage pending [invites](https://platform.claude.com/docs/en/api/organization/invites/retrieve).

Invite a user to your organization:

List pending invites:

Delete an invite:

### Workspaces

See [Workspaces](https://platform.claude.com/docs/en/manage-claude/workspaces) for Console and API examples.

### Workspace members

Manage [user access to specific workspaces](https://platform.claude.com/docs/en/api/organization/workspaces/members/retrieve):

Add a member to a workspace:

List the members of a workspace:

Update a workspace member’s role:

Remove a member from a workspace:

### API keys

Monitor and manage [API keys](https://platform.claude.com/docs/en/api/organization/api_keys/list). Each key in the response includes its `expires_at` timestamp (`null` for keys without an [expiration](https://platform.claude.com/docs/en/manage-claude/authentication#key-expiration)) and `principal`, the identity it acts as (see [Key types](https://platform.claude.com/docs/en/manage-claude/authentication#key-types)). For a personal key, `principal` is `{"type": "user_actor", "user_id": "user_..."}`. For a service account key, it is `{"type": "service_account_actor", "service_account_id": "svac_..."}`. For a workspace key, it is `null`. Each key also has a `scope` object: `{"type": "workspace", "workspace_id": "wrkspc_..."}` for a key bound to one workspace, or `{"type": "organization"}` for a key that can work across any workspace the account has access to. Filtering the list by `workspace_id` with the Default Workspace’s ID returns only keys bound to the Default Workspace; keys without a workspace scope aren’t returned under any `workspace_id` filter.

List the active API keys in a workspace:

Rename or deactivate an API key:

### Service accounts

Create and manage service accounts (`svac_...`), the non-human identities that [service account keys](https://platform.claude.com/docs/en/manage-claude/authentication#key-types) and [Workload Identity Federation](https://platform.claude.com/docs/en/manage-claude/workload-identity-federation) tokens act as. These endpoints, like the federation-issuer and federation-rule endpoints, require an `org:admin` OAuth token. See [Service accounts in Manage WIF with the Admin API](https://platform.claude.com/docs/en/manage-claude/wif-admin-api#service-accounts).

### Federation issuers

Register the OIDC identity providers (`fdis_...`) whose tokens may assert workload identity for your organization. See [Federation issuers in Manage WIF with the Admin API](https://platform.claude.com/docs/en/manage-claude/wif-admin-api#federation-issuers).

### Federation rules

Manage the rules (`fdrl_...`) that map issuer tokens to service accounts and scopes. See [Federation rules in Manage WIF with the Admin API](https://platform.claude.com/docs/en/manage-claude/wif-admin-api#federation-rules).

## Accessing organization info

The `/v1/organizations/me` endpoint returns the organization that your credential belongs to:

For parameter details and response schemas, see the [Organization Info API reference](https://platform.claude.com/docs/en/api/organization/retrieve).

## Usage and cost reports

Track your organization’s usage and costs with the [Usage and Cost Analytics API](https://platform.claude.com/docs/en/manage-claude/usage-cost-analytics-api). The [Usage and Cost API](https://platform.claude.com/docs/en/manage-claude/usage-cost-api) is the legacy API for this data.

## Claude Code analytics

Monitor developer productivity and Claude Code adoption with the [Claude Code Analytics API](https://platform.claude.com/docs/en/manage-claude/claude-code-analytics-api).

## Rate limits

Read the rate limits configured for your organization and its workspaces, and set workspace rate limits, with the [Rate Limits API](https://platform.claude.com/docs/en/manage-claude/rate-limits-api).

## Compliance API

Retrieve audit and activity data for your organization with the [Compliance API](https://platform.claude.com/docs/en/manage-claude/compliance-api). Admin API keys can read only the Activity Feed. For full access, see [Set up the Compliance API](https://platform.claude.com/docs/en/manage-claude/compliance-api-access).

## Organization webhooks

Register webhook endpoints for events about enforcement actions on your organization’s user profiles with [organization webhooks](https://platform.claude.com/docs/en/manage-claude/organization-webhooks).

## Best practices

-   Use meaningful names and descriptions for workspaces and API keys
-   Handle errors from failed operations
-   Regularly audit member roles and permissions
-   Clean up unused workspaces and expired invites
-   Monitor API key usage, audit each key’s [`expires_at`](https://platform.claude.com/docs/en/manage-claude/authentication#key-expiration), and rotate keys periodically

## FAQ

For workspace-specific questions, see the [Workspaces FAQ](https://platform.claude.com/docs/en/manage-claude/workspaces#faq).
