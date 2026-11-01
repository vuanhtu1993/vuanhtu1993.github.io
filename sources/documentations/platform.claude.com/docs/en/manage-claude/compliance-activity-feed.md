---
title: "Query the Activity Feed"
source_url: "https://platform.claude.com/docs/en/manage-claude/compliance-activity-feed"
crawled_at: "2026-11-01T16:28:52.984Z"
---

Retrieve, filter, and paginate your organization’s Compliance API Activity Feed.

The Activity Feed records authentication, chat, file, project, administrative, and platform activity across your organization and returns it in reverse chronological order. Activities are queryable within 1 minute of occurring and are retained for 6 years. Recording is not retroactive: it begins when the Compliance API is first enabled for your organization, and activity from before enablement is not backfilled. Access Transparency events are an exception. If your organization is enrolled in [Access Transparency](https://platform.claude.com/docs/en/manage-claude/access-transparency), these events are recorded even while the Compliance API is off. The feed can therefore include some from before the Compliance API was first enabled.

## Filter activities

Filter by organization, actor, activity type, or a `created_at` time window using the dotted sub-parameters `created_at.gte`, `.gt`, `.lte`, and `.lt`. See the [API reference](https://platform.claude.com/docs/en/api/compliance/activities/list) for each parameter’s type and accepted values.

Repeatable parameters use array-bracket query syntax: pass `activity_types[]=...`, `actor_ids[]=...`, or `organization_ids[]=...` once for each value.

The Activity Feed produces hundreds of distinct activity types. See [Query compliance activities](https://platform.claude.com/docs/en/api/compliance/activities/list) in the API reference for the full list of values that `activity_types[]` accepts.

## Paginate results

Activities are returned newest first, with ties in `created_at` broken by activity ID, and capped at `limit` results in each response (default 100, max 5,000). See the [API reference](https://platform.claude.com/docs/en/api/compliance/activities/list) for the full response schema.

The Compliance API uses two pagination schemes depending on the endpoint family:

| Endpoint family | Sort order | Scheme | Parameters |
| --- | --- | --- | --- |
| Activities | Newest first | Cursor | `after_id`, `before_id` (returned as `first_id`, `last_id`) |
| Chats and chat messages | Oldest first | Cursor | `after_id`, `before_id` (returned as `first_id`, `last_id`) |
| Organizations, projects, project attachments, users, roles, role permissions, groups, group members | Endpoint-specific | Page token | `page` (returned as `next_page`) |
| Local and remote sessions and session messages | Sessions newest first; messages oldest first by default | Page token | `page` (returned as `next_page`) |

Files do not paginate: they are retrieved individually by ID.

Pagination cursors and page tokens are opaque strings: pass them back unchanged. Their internal format is not stable, and parsing them will break without notice. Only one of `after_id` or `before_id` may be set in each request, and both schemes return `has_more` so you know when to stop. The session endpoints (local and remote) are the exception: they return `next_page` without `has_more`, so stop when `next_page` is `null`.

To page through activities:

-   Pass the response’s `last_id` as `after_id` to advance to the next page in result order. With activities sorted newest first, the next page contains older entries.
-   Pass `first_id` as `before_id` to return to the previous page.
-   Stop when `has_more` is `false`.

The cursor parameter sets the page direction; the endpoint’s sort order sets the time direction. The same `after_id` parameter reaches older activities here. Chats sort oldest first; see [Retrieve and delete chats, files, and projects](https://platform.claude.com/docs/en/manage-claude/compliance-content-data) for the cursor semantics there.

A production **backfill** loop pages through older activities by driving iteration off `has_more` and `last_id`:

1.  Start from your stored cursor (or omit `after_id` to start from the beginning).
2.  Page through with `after_id=<last_id>` until `has_more` is `false`.
3.  Persist the final `last_id` only after you’ve stored every page it covers.

## Understand the Activity object

Every entry in `data` is an Activity with this top-level shape:

| Field | Type | Description |
| --- | --- | --- |
| `id` | string | Unique identifier for the activity. |
| `created_at` | RFC 3339 string | When the activity occurred. |
| `organization_id` | string or null | Organization where the activity occurred, or `null` for events not tied to an organization. |
| `organization_uuid` | string or null | Same scoping as `organization_id`, expressed as a UUID. |
| `actor` | Actor union | Who or what performed the activity. See the following actor table. |
| `type` | string | The activity type, for example `claude_chat_created`. |
| _additional fields_ | varies | Type-specific fields, for example `claude_chat_id` on chat events or `claude_file_id` on file events. See [Query compliance activities](https://platform.claude.com/docs/en/api/compliance/activities/list) in the API reference for the per-type field list. |

The `actor` field is a discriminated union. The `type` discriminator tells you which other fields are present:

| `actor.type` | When it appears | Key fields |
| --- | --- | --- |
| `user_actor` | A signed-in claude.ai or Claude Console user took the action. Processes Anthropic runs on the user’s behalf can also appear as this type; see the paragraph after this table. | `email_address`, `user_id`, `ip_address`, `user_agent` |
| `api_actor` | A request called the Claude API or the Compliance API with a customer-issued API key. Compliance API calls produce this actor type for both Compliance Access Keys and Admin API keys. | `api_key_id`, `ip_address`, `user_agent` |
| `admin_api_key_actor` | An organization admin used an Admin API key to manage users, invites, workspaces, or API keys. | `admin_api_key_id`, `ip_address`, `user_agent` |
| `unauthenticated_user_actor` | An action occurred before sign-in completed, for example `sso_login_initiated`. | `unauthenticated_email_address`, `ip_address`, `user_agent` |
| `anthropic_actor` | Anthropic acted on the organization, for example through internal tooling. | `email_address` (always `null`; present for shape consistency with `user_actor`, because Anthropic operators are not represented by individual email) |
| `system_actor` | Automated background processing performed by Anthropic systems, acting without a user or customer credential. | `service` (nullable; the name of the automated process that performed the action, when known) |
| `scim_directory_sync_actor` | An identity provider (such as Okta, Microsoft Entra ID, or JumpCloud) pushed a change through SCIM directory sync. | `workos_event_id`, `directory_id`, `idp_connection_type` (nullable; for example `OktaSCIMV2`, `AzureSCIMV2`) |

A `user_actor` activity does not always mean the user took the action. Processes that Anthropic runs on a user’s behalf can currently appear as `user_actor` for the affected user rather than as `system_actor`, and this attribution may change. For example, memory activities from a migration, such as `platform_memory_store_created`, `platform_memory_created`, and `platform_memory_deleted`, are attributed this way. The memory activities `platform_memory_store_created`, `platform_memory_created`, `platform_memory_updated`, and `platform_memory_deleted` currently show an `ip_address` of `0.0.0.0` whoever performed them. As a result, this value does not on its own identify a process that Anthropic runs on the user’s behalf.

A `claude_*_viewed` activity means a Claude app loaded content, not that a person viewed it. Types such as `claude_chat_viewed`, `claude_file_viewed`, and `claude_project_viewed` are recorded each time a Claude app loads the chat, file, or project from Anthropic’s servers. Repeated loads are not deduplicated. The web, desktop, and mobile apps load content at different moments, sometimes in the background, and can display a cached copy without loading it. Counts of these activities vary by platform as a result, and they do not correspond to messages sent or screens viewed.

A missing `*_deleted` activity does not mean the content still exists. When your organization’s retention policy deletes a chat, project, or published artifact, the Activity Feed records no `claude_chat_deleted`, `claude_project_deleted`, or `claude_published_artifact_deleted` activity. An admin’s change to the policy is recorded as a `data_retention_periods` update in `claude_organization_settings_updated`.

Activities about a file, project document, or artifact do not include its name or title. As of September 24, 2026, the `filename` and `title` fields on these activities are always `null`, an empty string, or omitted, including on activities recorded before that date. To look up a name or title, pass the activity’s `claude_file_*`, `claude_proj_doc_*`, or `claude_artifact_version_*` ID to the matching metadata endpoint in [Retrieve files and artifacts](https://platform.claude.com/docs/en/manage-claude/compliance-content-data#retrieve-files-and-artifacts), using a Compliance Access Key with the `read:compliance_user_data` scope. You cannot look up a name or title after the file, document, or artifact is deleted, or when the activity has no such ID.

## Next steps

The full request and response schema for `GET /v1/compliance/activities`, including every supported `activity_types[]` value.

Query and delete the underlying content for activities you find in the feed (Compliance Access Key required).

Choose a polling or batch consumption pattern and plan SIEM correlation.

The full error catalog.
