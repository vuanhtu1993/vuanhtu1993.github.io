---
title: "List organizations, users, roles, groups, and settings"
source_url: "https://platform.claude.com/docs/en/manage-claude/compliance-org-data"
crawled_at: "2026-11-01T16:29:09.966Z"
---

Enumerate organizations under your parent organization (their users, roles, and groups) and read each organization’s effective settings through the Compliance API.

The endpoints on this page expose the directory side of a Claude Enterprise organization: its linked organizations, the users in each one, the roles defined on each, and its role-based access control (RBAC) or SCIM (System for Cross-domain Identity Management)-provisioned groups and their members. Use them to seed eDiscovery user lists, build reporting dashboards, and reconcile group membership against an external system of record. A Compliance Access Key that covers the parent organization returns data from every linked organization underneath, so a single key reaches the entire tree. The [effective-settings endpoint](#get-effective-organization-settings) complements the directory: it returns the data-privacy, security, and capability settings actually in force for one organization.

## List organizations

The [List organizations](https://platform.claude.com/docs/en/api/compliance/organizations/list) endpoint returns every organization under the parent the key is bound to.

The following call lists every organization under your parent. The response is a `data` array of organization records sorted by `created_at` ascending, plus `has_more` and `next_page` for pagination. When `has_more` is `true`, pass the returned `next_page` token back unchanged as the `page` query parameter on your next request. See [List organizations](https://platform.claude.com/docs/en/api/compliance/organizations/list) in the API reference for the `limit` and `page` parameter defaults and ranges.

The `uuid` field is the canonical identifier for downstream lookups. The following table maps it to the other organization identifiers across the Compliance API:

| Field | Where | Relationship to `uuid` |
| --- | --- | --- |
| `{org_uuid}` | Path parameter on per-organization endpoints on this page | Same value |
| `organization_uuid` | Activity Feed, chat, project, and session records | Same value; join on these two fields directly |
| `organization_id` | Activity Feed, chat, and project records | Same organization, `org_`\-prefixed. Deprecated on chat and project records; use `organization_uuid` instead. |
| `organization_ids[]` | Filter on [Query the Activity Feed](https://platform.claude.com/docs/en/manage-claude/compliance-activity-feed), [Retrieve chats and messages](https://platform.claude.com/docs/en/manage-claude/compliance-content-data#retrieve-chats-and-messages), and the [remote session list](https://platform.claude.com/docs/en/manage-claude/compliance-sessions#retrieve-remote-sessions) (the local session list has no organization filter) | Accepts `uuid` or the `org_`\-prefixed form |
| `organization_id` | [Effective organization settings](#get-effective-organization-settings) response | Same value, bare UUID; this response does **not** use the `org_`\-prefixed form that `organization_id` carries on Activity Feed, chat, and project records |

Most other Anthropic APIs use the `org_`\-prefixed form.

To track organization-membership changes over time, relist this endpoint periodically, following the `next_page` token through every page on each pass. The Activity Feed also surfaces membership events through the `org_deletion_requested`, `org_deleted_via_bulk`, `org_parent_join_proposal_created`, and `org_join_proposal_decided` activity types; see [Query the Activity Feed](https://platform.claude.com/docs/en/manage-claude/compliance-activity-feed).

## List organization users

The [List organization users](https://platform.claude.com/docs/en/api/compliance/organizations/users/list) endpoint returns a paginated list of user records for one organization.

This endpoint requires `read:compliance_user_data`, not `read:compliance_org_data`. Create the Compliance Access Key with both scopes when you intend to use it for directory enumeration; otherwise the call returns [403 Forbidden](https://platform.claude.com/docs/en/manage-claude/compliance-errors#403-forbidden).

See [List organization users](https://platform.claude.com/docs/en/api/compliance/organizations/users/list) in the API reference for the `limit` and `page` query parameter defaults and ranges.

Results are sorted by organization join date ascending. Unlike the Activity Feed’s `before_id`/`after_id` cursors (see [Paginate results](https://platform.claude.com/docs/en/manage-claude/compliance-activity-feed#paginate-results)), the directory endpoints paginate with a `next_page` token: when `has_more` is `true`, pass `next_page` back unchanged as the `page` query parameter on the next request.

The user IDs returned here are the same `user_...` identifiers accepted by the [Query the Activity Feed](https://platform.claude.com/docs/en/manage-claude/compliance-activity-feed) `actor_ids[]` filter. The `user_ids[]` filters on [Retrieve chats and messages](https://platform.claude.com/docs/en/manage-claude/compliance-content-data#retrieve-chats-and-messages) and the [remote session list](https://platform.claude.com/docs/en/manage-claude/compliance-sessions#retrieve-remote-sessions) accept the same identifiers. The [local session list](https://platform.claude.com/docs/en/manage-claude/compliance-sessions#retrieve-local-sessions) has no user filter, so attribute local sessions by the `user.id` on each session object. The `organization_role` field carries the user’s built-in membership level within the listed organization (one of `admin`, `billing`, `claude_code_user`, `developer`, `managed`, `membership_admin`, `owner`, `primary_owner`, or `user`), an axis independent of any custom RBAC role assignments returned by [List roles](#list-roles). A typical eDiscovery flow lists users for one or more organizations, filters against your own external records, and feeds the resulting IDs into chat and project queries.

A user only appears here while they are an active member of the organization. Removed users are dropped from the list immediately. Their historical activity remains queryable through the Activity Feed for the full retention window, indexed by the same `user_...` ID.

## List user preferences

The `GET /v1/compliance/organizations/{org_uuid}/user_preferences` endpoint returns the text that current members of one organization saved as **Instructions for Claude** in claude.ai (`conversation_preferences`) and as **Global instructions** in Cowork (`cowork_global_instructions`). Both are account-level settings, so the same text is returned under every organization a member belongs to. This endpoint is in beta.

This endpoint requires `read:compliance_user_data`, not `read:compliance_org_data`; a call with a key that lacks `read:compliance_user_data` returns [403 Forbidden](https://platform.claude.com/docs/en/manage-claude/compliance-errors#403-forbidden).

By default, the response lists only members who have set at least one of the two values. Pass `include_unset=true` to list every current member, with `null` for each value that is not set. To return specific members only, pass up to 10 user IDs in `user_ids[]`. Results paginate with `limit` (default 20, maximum 100) and `page`. As on the [organization users endpoint](#list-organization-users), pass `next_page` back unchanged as `page`; also send the same `include_unset` and `user_ids[]` values with every page, or the call returns [400 Bad Request](https://platform.claude.com/docs/en/manage-claude/compliance-errors#invalid-pagination-cursor). A page can hold fewer results than `limit`, or none, and still not be the last, so keep requesting pages until `next_page` is `null`.

## List roles

The [List Compliance Roles](https://platform.claude.com/docs/en/api/compliance/organizations/roles/list) endpoint returns a paginated list of role records defined on one organization, and [Get Compliance Role](https://platform.claude.com/docs/en/api/compliance/organizations/roles/retrieve) returns one role by ID.

Both role endpoints require `read:compliance_org_data`. The list endpoint accepts the same `limit` and `page` parameters as the [organization users endpoint](#list-organization-users).

See the [List Compliance Roles](https://platform.claude.com/docs/en/api/compliance/organizations/roles/list) response schema for the full role record shape. To list the permissions currently granted to a role, use [List Compliance Role Permissions](https://platform.claude.com/docs/en/api/compliance/organizations/roles/permissions/list). To audit historical role assignments and permission changes, query the RBAC activity types (for example, `rbac_role_assigned` and `rbac_role_permission_added`) through the Activity Feed; see [Filter activities](https://platform.claude.com/docs/en/manage-claude/compliance-activity-feed#filter-activities).

## List groups and members

The [List Compliance Groups](https://platform.claude.com/docs/en/api/compliance/groups/list) endpoint returns a paginated list of RBAC and SCIM-provisioned groups, and [Get Compliance Group](https://platform.claude.com/docs/en/api/compliance/groups/retrieve) returns one group by ID. The [List Compliance Group Members](https://platform.claude.com/docs/en/api/compliance/groups/members/list) endpoint returns the members of one group.

The group list and retrieval endpoints require `read:compliance_org_data`. The members endpoint requires `read:compliance_user_data`. Create the key with both scopes to walk groups end to end. Both list endpoints accept the same `limit` and `page` parameters as the [organization users endpoint](#list-organization-users).

See the [List Compliance Groups](https://platform.claude.com/docs/en/api/compliance/groups/list) response schema for the full group record shape. The `roles` array lists role IDs assigned to the group, matching IDs from [List roles](#list-roles). `source_type` is the discriminator between groups created manually through claude.ai (`direct`) and groups synced from an external identity provider through SCIM (`scim`).

List groups, then for each group list its members:

For each group ID, list its members:

See the [List Compliance Group Members](https://platform.claude.com/docs/en/api/compliance/groups/members/list) response schema for the full member record shape. The `user_id` field is the same `user_...` identifier that the Activity Feed, chat list, and remote session list accept; it also matches `user.id` on local session objects and on user-owned remote session objects (agent-owned remote sessions carry the human’s ID in `started_by_user.id` instead). To get a member’s full name, look it up through the organization users list.

## Get effective organization settings

The [Get effective organization settings](https://platform.claude.com/docs/en/api/compliance/organizations/settings/retrieve) endpoint returns the settings in force for one organization under your parent: the enforced state after regulatory restrictions (such as HIPAA), feature-availability rules, organization-type defaults, and inter-feature dependencies are applied, which can differ from what an administrator configured. Use it to attest that retention windows, content redaction, single sign-on enforcement, the IP allowlist, and session-duration controls match your documented baseline, without administrator Console access.

This endpoint requires `read:compliance_org_data`; a key without that scope returns [403 Forbidden](https://platform.claude.com/docs/en/manage-claude/compliance-errors#403-forbidden). The target must be one of the parent’s linked organizations: the parent organization itself is not a valid target. All of the following return the same [404 Not Found](https://platform.claude.com/docs/en/manage-claude/compliance-errors#404-not-found):

-   An unknown organization
-   An organization ID that is not a valid UUID
-   An organization outside your parent’s tree
-   A parent organization that does not yet have access to this endpoint

A 404 therefore does not reveal whether an organization exists. The settings endpoint is enabled per parent organization separately from the rest of the Compliance API; if every request returns 404, contact your Anthropic representative.

The response is a list of typed setting rows, and which rows appear varies by organization: a setting the organization’s administrators cannot change, because it is controlled by Anthropic policy or not available to the organization, is omitted from the list. Treat a missing row as “not controllable by this organization’s administrators”, not as “off”. The following abridged example shows three of the rows a response can contain:

Each row carries `name`, `type`, and `value`; the `type` field (`boolean`, `integer`, `string_list`, `provisioning_mode`, or `data_retention`) tells you the shape of `value`. The full list of setting names, and the `value` schema for each type, is in [Get effective organization settings](https://platform.claude.com/docs/en/api/compliance/organizations/settings/retrieve) in the API reference.

The `api_keys` array lists every Compliance Access Key configured for your parent organization, so the same list is returned regardless of which linked organization you query. Each entry carries the key’s `type` (`compliance_api_key`), `id`, `name`, `scopes`, `is_active` flag, `created_at` and `expires_at` timestamps, and `created_by_id` (the ID of the user who created the key, or `null`). The key’s secret value is never returned. Deactivated keys are included with `is_active: false` so you can review keys that previously had access, and keys that carry only the retired `read:compliance_org_settings` scope remain in the list for audit and cleanup visibility even though that scope no longer grants access.

The top-level `organization_id` is the organization’s bare UUID: the same value as `uuid` in the organizations list, not the `org_`\-prefixed form that `organization_id` carries on Activity Feed, chat, and project records (see the [organization identifier table](#list-organizations)).

Rows reflect the enforced state rather than the last-stored configuration, as in these examples:

-   `sso_provisioning_mode` reports a configured SCIM mode only while directory sync is enabled.
-   `ip_allowlist_enabled` is `true` only while the allowlist is on and has at least one active range.
-   `code_execution_network_egress_enabled` is `false` whenever code execution is off.

The response reflects the state at read time; nothing is snapshotted. Changes to most of these settings surface as events in the [Activity Feed](https://platform.claude.com/docs/en/manage-claude/compliance-activity-feed); use this endpoint for the current resolved state and the feed to audit who changed what, and when.

## Read plugins and plugin marketplaces

Your organization’s plugins and plugin marketplaces are part of the [Admin API](https://platform.claude.com/docs/en/manage-claude/plugins-api) rather than the Compliance API, but a Compliance Access Key with `read:compliance_org_data` can call the Plugins API’s read endpoints directly:

-   List plugins and retrieve a plugin
-   List a plugin’s versions, retrieve a version, and download a version’s files
-   List a plugin’s installation settings and its shares
-   List plugin marketplaces and retrieve a marketplace

Send the `anthropic-beta: ce-plugins-2026-09-01` header on every request; without it these endpoints return [404 Not Found](https://platform.claude.com/docs/en/manage-claude/plugins-api#error-responses). Each call reads one organization: a key that covers the parent organization reads the linked organization it was created in unless you pass the `organization_id` query parameter (a linked organization’s UUID or its `org_`\-prefixed ID) to [read a different one](https://platform.claude.com/docs/en/manage-claude/plugins-api#reading-another-organization-under-the-same-parent), and a key restricted to one organization reads only that organization. These calls count against the Admin API’s [rate limits](https://platform.claude.com/docs/en/manage-claude/plugins-api#rate-limiting), not the Compliance API’s.

Creating or changing plugins, their installation settings, or a marketplace’s settings requires an Admin API key with `write:plugins`. Of the read calls, only downloading the files of a plugin in a member’s personal marketplace records an [Activity Feed](https://platform.claude.com/docs/en/manage-claude/compliance-activity-feed) event (`claude_plugin_archive_accessed`). See the [Plugins API guide](https://platform.claude.com/docs/en/manage-claude/plugins-api) for each endpoint, request examples, and the [events the API records](https://platform.claude.com/docs/en/manage-claude/plugins-api#activity-feed-events).

## Next steps

The full request and response schema for every organization, user, role, group, and settings endpoint.

Verbatim error payloads and the fix for each.
