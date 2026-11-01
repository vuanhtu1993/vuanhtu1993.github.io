---
title: "Workspaces"
source_url: "https://platform.claude.com/docs/en/manage-claude/workspaces"
crawled_at: "2026-11-01T16:23:02.178Z"
---

Organize API keys, manage team access, and control costs with workspaces.

Workspaces provide a way to organize your API usage within an organization. Use workspaces to separate different projects, environments, or teams while maintaining centralized billing and administration.

## How workspaces work

Every organization has a **Default Workspace** that cannot be renamed, archived, or deleted. When you create additional workspaces, you can assign members, service accounts, API keys, and resource limits to each one.

Key characteristics:

-   **Workspace identifiers** use the `wrkspc_` prefix (for example, `wrkspc_01JwQvzr7rXLA5AGx3HKfFUJ`).
-   **Maximum 100 workspaces** for each organization by default (archived workspaces don’t count). Contact your account team if you need more.
-   **Default Workspace** has a `wrkspc_` ID like any other workspace (returned in the [`anthropic-workspace-id` response header](#identify-the-workspace-behind-an-api-response) and accepted by [Get Workspace](https://platform.claude.com/docs/en/api/organization/workspaces/retrieve)), but it appears in [List Workspaces](https://platform.claude.com/docs/en/api/organization/workspaces/list) results only when you pass `include_default=true`. The [Usage and Cost Analytics API](https://platform.claude.com/docs/en/manage-claude/usage-cost-analytics-api) reports its usage and cost under that ID, whereas the legacy [Usage and Cost API](https://platform.claude.com/docs/en/manage-claude/usage-cost-api) reports show `null` for its `workspace_id` (an API key’s `scope` field carries the real ID for a key bound to the Default Workspace).
-   **API keys** can be scoped to a single workspace. In this case, they can only access resources within that workspace. Other API keys aren’t scoped to a workspace. With one of these keys, send a [workspace ID header](https://platform.claude.com/docs/en/manage-claude/authentication#select-a-workspace) on each request to choose the workspace. The key’s user or service account must have access to that workspace.

### Claude Code workspace

When a member of your organization first signs in to [Claude Code](https://code.claude.com/docs/en/overview) with their Claude Console account, Anthropic automatically creates a **Claude Code** workspace in the organization and adds that member to it. Every subsequent member who signs in to Claude Code is added the same way.

The Claude Code workspace keeps Claude Code traffic separate from your other API workloads:

-   Claude Code mints a per-user API key in this workspace at sign-in. You cannot create keys in it manually from the Console.
-   A Claude Code key stops working if its owner is removed from the workspace or organization, unlike a workspace key.
-   Claude Code usage is rate-limited separately, and admins can cap its share of the organization’s limits under [Rate limits in the Claude Console](https://platform.claude.com/usage/limits).
-   It is the only workspace that supports per-user monthly spend limits.

## Workspace roles and permissions

Members can have different roles in each workspace, allowing fine-grained access control.

| Role | Permissions |
| --- | --- |
| Workspace User | Use playground only |
| Workspace Limited Developer | Create and manage API keys, use the API  
For [Claude Managed Agents](https://platform.claude.com/docs/en/managed-agents/overview) in the Claude Console, members with this role cannot open or start sessions, open memory stores, or manage deployments. They also cannot download or delete files on the Console’s [Files](https://platform.claude.com/files) page. These limits apply only to the Console’s interface, not to the API. |
| Workspace Developer | Create and manage API keys, use the API |
| Workspace Admin | Full control over workspace settings and members |
| Workspace Billing | View workspace billing information (inherited from organization billing role) |

### Role inheritance

-   **Organization admins** automatically receive Workspace Admin access to all workspaces.
-   **Organization billing members** automatically receive Workspace Billing access to all workspaces.
-   **Organization users and developers** must be explicitly added to each workspace.
-   **Service accounts** are added to workspaces on the [Service accounts](https://platform.claude.com/settings/service-accounts) page (`platform.claude.com/settings/service-accounts`) in the Claude Console: select **Add to workspace** in the account’s menu or on its own page. To see the accounts in one workspace, filter the list by workspace.

## Managing workspaces

### Using the Console

Create and manage workspaces on the [Workspaces](https://platform.claude.com/settings/workspaces) page in the Claude Console.

#### Create a workspace

1.  ### Open workspace settings
    
    In the Claude Console, go to the [Workspaces](https://platform.claude.com/settings/workspaces) page (`platform.claude.com/settings/workspaces`).
    
2.  ### Open the Create workspace page
    
    Click **Create workspace** to open the [Create workspace](https://platform.claude.com/settings/workspaces/new) page (`platform.claude.com/settings/workspaces/new`) in the Console.
    
3.  ### Configure the workspace
    
    Enter a workspace name and select a color for visual identification.
    
4.  ### Create the workspace
    
    Click **Create workspace** to finalize.
    

#### Edit workspace details

To modify a workspace’s name or color:

1.  Select the workspace from the list.
2.  Open the **More actions** menu (three dots) and select **Edit details**.
3.  Update the name or color and save your changes.

#### Add members to a workspace

1.  In the Claude Console, go to the [Members](https://platform.claude.com/settings/members) page (`platform.claude.com/settings/members`).
2.  Click **Add to workspace**.
3.  Select the workspace, the organization member to add, and their [workspace role](#workspace-roles-and-permissions).
4.  Click **Add to workspace** to confirm.

#### Remove members from a workspace

1.  On the [Members](https://platform.claude.com/settings/members) page in the Claude Console, select the workspace from the **Workspace** dropdown menu. If it shows **All**, **Remove member** removes the member from your organization instead.
2.  At the end of the member’s row, open the **More actions** menu (three dots) and select **Remove member**.
3.  Click **Remove** to confirm.

#### Set workspace limits

You set a workspace’s rate limits and spend limits in different places:

-   **Rate limits:** Under [Rate limits in the Claude Console](https://platform.claude.com/usage/limits), select the workspace from the **Workspace** dropdown menu and click **Edit** next to a model to set limits for requests per minute, input tokens, or output tokens.
-   **Spend limits:** On the [Workspaces](https://platform.claude.com/settings/workspaces) page in the Claude Console, select the workspace. In the panel that opens, click **Spend limits** to cap monthly spending and configure alerts when spending reaches certain thresholds.

#### Archive a workspace

To archive a workspace, open its **More actions** menu (three dots) and select **Archive workspace**. Archiving:

-   Preserves historical data for reporting
-   Deactivates the workspace and archives every API key created for it
-   Cannot be undone

### Using the Admin API

Programmatically manage workspaces using the [Admin API](https://platform.claude.com/docs/en/manage-claude/admin-api).

The following SDK and CLI examples construct the default client, which reads the Admin API key from the `ANTHROPIC_API_KEY` environment variable; the SDK exposes these endpoints under `client.organization.workspaces`. SDK list methods fetch further pages on demand, so `limit` sets the page size; the PHP, Ruby, and curl examples return one page.

Create a workspace:

List workspaces:

Archive a workspace:

For complete parameter details and response schemas, see the [Workspaces API reference](https://platform.claude.com/docs/en/api/organization/workspaces/retrieve).

### Managing workspace members

Add a member to a workspace:

Update a member’s role:

Remove a member from a workspace:

For complete parameter details, see the [Workspace Members API reference](https://platform.claude.com/docs/en/api/organization/workspaces/members/retrieve).

## API keys and resource scoping

Every request runs in exactly one workspace and can only access resources within that workspace. Which workspace depends on the [key type](https://platform.claude.com/docs/en/manage-claude/authentication#key-types):

-   A **workspace key** (a legacy key without an owner) belongs to the workspace it was created in and always runs there.
-   A **personal key** or **service account key** acts as its user or service account. A single-workspace key always runs in the workspace chosen when it was created. A key that isn’t scoped to a workspace runs in the workspace named by each request’s `anthropic-workspace-id` header. Accounts must have access to the workspace to use it.

Resources scoped to workspaces include:

-   **Files** created through the [Files API](https://platform.claude.com/docs/en/build-with-claude/files)
-   **Message Batches** created through the [Batch API](https://platform.claude.com/docs/en/build-with-claude/batch-processing)
-   **Skills** created through the [Skills API](https://platform.claude.com/docs/en/build-with-claude/skills-guide)

Some resources are managed differently:

-   **[MCP tunnels](https://platform.claude.com/docs/en/agents-and-tools/mcp-tunnels/overview)** are managed with a `workspace:manage_tunnels` OAuth token obtained through [Workload Identity Federation](https://platform.claude.com/docs/en/manage-claude/workload-identity-federation), not an API key. Tunnels are created in a workspace, and the Console **MCP tunnels** list and the Managed Agent server picker show tunnels in the current workspace only; the cap of 10 active tunnels applies organization-wide. Tunnel management requires a role with tunnel management permissions; organization developers can view but not change them.
-   **Workspaces** themselves and **organization members** are managed at the organization level through the [Admin API](https://platform.claude.com/docs/en/manage-claude/admin-api), using an Admin API key, an `org:admin` OAuth token, or a personal or service account key that isn’t scoped to a specific workspace.

To look up your organization’s workspace IDs, call the [List Workspaces](https://platform.claude.com/docs/en/api/organization/workspaces/list) endpoint (pass `include_default=true` to include the Default Workspace) or find them on the [Workspaces](https://platform.claude.com/settings/workspaces) page in the Claude Console.

## Identify the workspace behind an API response

Claude API responses include an `anthropic-workspace-id` header alongside the `request-id` and `anthropic-organization-id` [response headers](https://platform.claude.com/docs/en/api/overview#response-headers). Its value is the `wrkspc_`\-prefixed ID of the workspace that the request’s API key or access token resolved to, including when that workspace is the Default Workspace. For example, a successful response includes headers like these:

The header is absent when the credential doesn’t resolve to a workspace (for example, on Admin API requests) or when the request fails before authentication completes, such as a 401 error.

The following examples send a Messages API request and read the workspace ID from the response headers:

The same accessors read the header from other Claude API endpoints too, including the [Claude Managed Agents](https://platform.claude.com/docs/en/managed-agents/overview) APIs. For example, read `anthropic-workspace-id` from the response that [creates a session](https://platform.claude.com/docs/en/managed-agents/sessions) to record which workspace the session belongs to.

With the workspace ID from a response, you can:

-   Confirm which workspace’s usage, cost, and [rate limits](https://platform.claude.com/docs/en/api/rate-limits) the request counted toward
-   Match it against the `workspace_id` field in [Usage and Cost Analytics API](https://platform.claude.com/docs/en/manage-claude/usage-cost-analytics-api) rows, which carry this same ID for the Default Workspace, and against the `scope` field of API keys in the [Admin API](https://platform.claude.com/docs/en/manage-claude/admin-api), which carries the real ID of the workspace a key is bound to, including the Default Workspace
-   Check whether it’s your Default Workspace’s ID by passing it to [Get Workspace](https://platform.claude.com/docs/en/api/organization/workspaces/retrieve) with an [Admin API key](https://platform.claude.com/docs/en/manage-claude/admin-api-keys): the Default Workspace comes back with `"name": "Default"`, even though [List Workspaces](https://platform.claude.com/docs/en/api/organization/workspaces/list) omits it unless you pass `include_default=true`
-   Open that workspace in the [Console](https://platform.claude.com/settings/workspaces) to find the request’s resources, such as sessions, files, message batches, and skills

## Workspace limits

You can set custom spend and rate limits for each workspace to protect against overuse and ensure fair resource distribution.

### Setting workspace limits

You can set workspace limits lower than (but not higher than) your organization’s limits:

-   **Spend limits:** Cap monthly spending for a workspace. To set these, go to the [Workspaces](https://platform.claude.com/settings/workspaces) page (`platform.claude.com/settings/workspaces`) in the Claude Console and select the workspace. In the panel that opens, click **Spend limits**.
-   **Rate limits:** Limit requests per minute, input tokens per minute, or output tokens per minute. To set these, go to [Rate limits in the Claude Console](https://platform.claude.com/usage/limits), select the workspace from the **Workspace** dropdown menu, and click **Edit** next to a model.

For detailed information on rate limits and how they work, see [Rate limits](https://platform.claude.com/docs/en/api/rate-limits). You can also read your current organization and workspace rate limits and set workspace rate limits programmatically with the [Rate Limits API](https://platform.claude.com/docs/en/manage-claude/rate-limits-api), which stores a value above the organization’s limit but still enforces the lower of the two.

## Usage and cost tracking

Track usage and costs by workspace using the [Usage and Cost Analytics API](https://platform.claude.com/docs/en/manage-claude/usage-cost-analytics-api):

Usage and costs in the Default Workspace are reported under the Default Workspace’s own ID.

## Common use cases

### Environment separation

Create separate workspaces for development, staging, and production:

| Workspace | Purpose |
| --- | --- |
| Development | Testing and experimentation with lower rate limits |
| Staging | Pre-production testing with production-like limits |
| Production | Live traffic with full rate limits and monitoring |

### Team or department isolation

Assign workspaces to different teams for cost allocation and access control:

-   **Engineering team** with developer access
-   **Data science team** with their own API keys
-   **Support team** with limited access for customer tools

### Project-based organization

Create workspaces for specific projects or products to track usage and costs separately.

## Best practices

1.  ### Plan your workspace structure
    
    Consider how you’ll organize workspaces before creating them. Think about billing, access control, and usage tracking needs.
    
2.  ### Use meaningful names
    
    Name workspaces clearly to indicate their purpose (for example, “Production - Customer Chatbot” or “Dev - Internal Tools”).
    
3.  ### Set appropriate limits
    
    Configure spend and rate limits to prevent unexpected costs and ensure fair resource distribution.
    
4.  ### Audit access regularly
    
    Review workspace membership periodically to ensure only appropriate users have access.
    

## FAQ

## See also

-   [Admin API](https://platform.claude.com/docs/en/manage-claude/admin-api)
-   [Admin API reference](https://platform.claude.com/docs/en/api/organization)
-   [Rate limits](https://platform.claude.com/docs/en/api/rate-limits)
-   [Usage and Cost Analytics API](https://platform.claude.com/docs/en/manage-claude/usage-cost-analytics-api) and the legacy [Usage and Cost API](https://platform.claude.com/docs/en/manage-claude/usage-cost-api)
