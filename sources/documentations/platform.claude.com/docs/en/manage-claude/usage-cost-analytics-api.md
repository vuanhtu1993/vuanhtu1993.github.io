---
title: "Usage and Cost Analytics API"
source_url: "https://platform.claude.com/docs/en/manage-claude/usage-cost-analytics-api"
crawled_at: "2026-11-01T16:23:08.149Z"
---

Query token usage and cost for your Claude Console or Claude Enterprise organization by model, workspace, API key, actor, and more.

The Usage and Cost Analytics API reports historical token usage and cost for your organization, broken down by the dimensions you choose, such as model, workspace, API key, or the user or service account behind each request. For Claude Console organizations, this data is similar to what the [Usage](https://platform.claude.com/usage) and [Cost](https://platform.claude.com/cost) pages of the Claude Console show.

The API has two endpoints:

-   `GET /v1/organizations/analytics/usage` reports token counts and request counts.
-   `GET /v1/organizations/analytics/cost` reports cost in USD.

The Usage and Cost Analytics API is in beta. Send the `anthropic-beta: analytics-usage-cost-2026-08-24` header and an [`anthropic-version`](https://platform.claude.com/docs/en/api/versioning) header on every request. The SDK and the `ant` CLI send both headers for you and fetch the remaining pages as you read the results, so `limit` sets only the page size.

Use this API to:

-   **Attribute spend:** Break down cost and token usage by workspace, API key, model, service tier, or the identity that made each request.
-   **Find top consumers:** Rank results by tokens, requests, or cost to answer questions such as “which API keys spend the most this month?”
-   **Build time series:** Split results into daily, hourly, or per-minute buckets for dashboards and finance reports.
-   **Integrate once:** The same endpoints, parameters, and response fields serve Claude Console and Claude Enterprise organizations.

## Quick start

Get daily token usage for the first week of September, one row for each model and day:

The response has one row for each model and day that has usage, largest `total_tokens` first. This example shows a single row:

## How results are shaped

-   **Every row has three parts:** `starting_at` and `ending_at` give the period the row covers, `group` holds every dimension, and `usage` (or `cost` on the cost endpoint) holds the metrics.
-   **Dimensions are null unless grouped:** A dimension in `group` is `null` unless you list it in `group_by[]`. A grouped dimension is also `null` on rows that have no value for it, such as `model` on code execution usage. `group_by[]` takes up to five dimensions.
-   **One row for each combination:** Each row is one combination of the grouped dimensions, and every combination that has usage or cost appears exactly once across the pages of a query. With no `group_by[]` and no `time_bucket_width`, the response is a single row that totals the whole range.
-   **Time buckets are optional:** Set `time_bucket_width` to `1m`, `1h`, or `1d` to split each combination by UTC bucket; each row’s `starting_at` and `ending_at` are then its bucket’s bounds. Buckets with no usage or cost produce no rows.
-   **Ranked by default:** Rows are ordered by the `order_by` metric across the whole range, largest first by default (`order=asc` reverses it). To build a time series, set `time_bucket_width` and `order_by=time`. Rows then come back one time bucket after another, newest bucket first by default (`order=asc` puts the oldest first), with the largest rows first within each bucket. Fill empty buckets with zeros.
-   **Filters work alongside grouping:** Most dimensions you can group by have a matching list filter in bracket notation, such as `models[]=claude-opus-5-5`. Repeat the parameter to pass several values, up to 100. Multiple values for the same filter are combined with OR, and different filters are combined with AND. Filters and `group_by[]` are independent; you can filter by any dimension with or without grouping by it, or the reverse.

Dimensions such as `model` and `actor` apply to every organization. Some, such as `api_key_id`, apply only to Claude Console organizations, and others, such as `slack_channel_id`, apply only to Claude Enterprise organizations. A dimension that doesn’t apply to your organization is `null` on every row and its filter matches nothing; the exception is `rbac_group_id`, which returns an error instead when teams aren’t available to your organization. The [usage](https://platform.claude.com/docs/en/api/beta/organization/analytics/usage/list) and [cost](https://platform.claude.com/docs/en/api/beta/organization/analytics/cost/list) API reference lists every dimension, filter, and value.

### Actors

The `actor` dimension is who a request is attributed to: a user, a service account, a federated cloud identity (an AWS or Google Cloud principal, for organizations that access Claude through their cloud platform), or, when none of those is behind the request, the API key itself. When you group by `actor`, each row’s `actor` is an object whose `type` says which kind it is. Usage that can’t be attributed to any identity has `actor: null`.

[Personal keys and service account keys](https://platform.claude.com/docs/en/manage-claude/authentication#key-types) act as the user or service account they’re linked to, so their requests show that identity as the `actor` and the key in `api_key_id`. Legacy workspace keys aren’t linked to an identity, so the key appears as both the `actor` and the `api_key_id`. The exception is a key that Claude Code creates for a member at sign-in: it lives in the [Claude Code workspace](https://platform.claude.com/docs/en/manage-claude/workspaces#claude-code-workspace), and its usage is attributed to that member. Requests made without an API key, such as from the Claude Console, from Claude Code after a [sign-in without an API key](https://code.claude.com/docs/en/authentication#sign-in-without-an-api-key), or with a [Workload Identity Federation](https://platform.claude.com/docs/en/manage-claude/workload-identity-federation) token, have `api_key_id: null`. After a sign-in without an API key, the `actor` is the member who signed in; a federated workload’s `actor` is its service account. To include usage with no API key in an `api_key_ids[]` filter, add an empty entry: `api_key_ids[]=`.

The `api_key_ids[]` and `actor_ids[]` filters answer different questions. `api_key_ids[]=apikey_...` matches every request the key authenticated, whoever it is attributed to. `actor_ids[]=apikey_...` matches only requests attributed to the key itself.

## Usage endpoint

`GET /v1/organizations/analytics/usage` returns token counts by type. `order_by` accepts `total_tokens` (the default), `output_tokens`, `uncached_input_tokens`, `requests`, or `time`.

For example, to see a week of usage for one workspace and one API key, broken down by service tier (one row for each tier, covering the whole week):

To look up API key and workspace IDs, use the [List API Keys](https://platform.claude.com/docs/en/api/organization/api_keys/list) and [List Workspaces](https://platform.claude.com/docs/en/api/organization/workspaces/list) endpoints or the Claude Console.

To find which users, service accounts, and API keys made the most requests in a month:

## Cost endpoint

`GET /v1/organizations/analytics/cost` accepts the same filters, dimensions, and time buckets as the `/usage` endpoint. Each row’s `cost` object holds `amount` (the cost after discounts and before any credits are applied), `list_amount` (the cost at list prices), `currency` (always `"USD"`), and `requests`. Amounts are decimal strings in cents with six decimal places: `"41280.000000"` is $412.80 USD. `order_by` accepts `amount` (the default), `list_amount`, or `time`.

Two extra dimensions exist only on this endpoint and don’t count toward the five-dimension limit: `group_by[]=cost_type` splits each row into one row for every cost type, and `group_by[]=token_type` splits token cost into one row for every token type. `limit` doesn’t apply to these two dimensions either, so a page can hold more than `limit` rows. For example, cost by model, cost type, and token type for a month:

For each model, the response has five `tokens` rows (one for every token type) plus one row each for `web_search`, `code_execution`, and `session_usage`. One of those rows:

The `group` object carries every dimension and is abbreviated here. With `group_by[]=cost_type` or `token_type` specified, `requests` is `null` on every row.

## Date ranges and time buckets

-   Timestamps are RFC 3339 with a UTC offset, for example `2026-09-01T00:00:00Z`. `starting_at` is inclusive and `ending_at` is exclusive.
-   `starting_at` must be on or after January 1, 2026, and within the last 365 days. A request can span at most 31 days; `ending_at` defaults to 31 days after `starting_at` or the current time, whichever is earlier.
-   `ending_at` is required whenever `time_bucket_width` is set, and with `time_bucket_width=1m` a request can span at most 24 hours.
-   Both ends of the range are rounded down to a UTC bucket boundary, or to the hour when `time_bucket_width` isn’t set. For example, with `time_bucket_width=1h`, a `starting_at` of `2026-09-01T10:43:00Z` is treated as `2026-09-01T10:00:00Z` and an `ending_at` of `2026-09-01T15:43:00Z` as `2026-09-01T15:00:00Z`, so the response covers 10:00 to 15:00 UTC.

## Data freshness

Every response includes a `data_refreshed_at` timestamp, and usage after that time is missing or partial. When no data is available yet for any part of the requested range, `data_refreshed_at` is `null` and `data` is empty. Data typically refreshes within 4 hours of the underlying usage and can take up to 24 hours. Values can be revised as late events arrive and reconciliation runs, until about 7 days after the end of the calendar month. For example, values for October 1 can change until about November 7. For stable results across repeated calls, set `ending_at` at or before a `data_refreshed_at` you have already seen; for final totals, query only months that ended at least 7 days ago. Every page of a paginated query reads the same data snapshot, so `data_refreshed_at` is identical across pages.

## Migrate from the Usage and Cost API

This section is for Claude Console organizations that call the legacy [Usage and Cost API](https://platform.claude.com/docs/en/manage-claude/usage-cost-api) (`/v1/organizations/usage_report/messages` and `/v1/organizations/cost_report`). Your Admin API key, the `anthropic-version` header, `starting_at` and `ending_at`, the bucket width values (`1m`, `1h`, `1d`), bracket notation, the pagination field names, and the token and cost field names carry over. What changes:

| Usage and Cost API | Usage and Cost Analytics API |
| --- | --- |
| No beta header | `anthropic-beta: analytics-usage-cost-2026-08-24` on every request |
| Data typically appears within 5 minutes | Data typically refreshes within 4 hours and can take up to 24 hours (see [Data freshness](#data-freshness)) |
| `data` is a list of time buckets, oldest first, including empty ones, each with a `results` list whose entries hold dimensions and metrics side by side | `data` is a list of rows ranked by `order_by`, each with its own `starting_at` and `ending_at`, dimensions in `group`, and metrics in `usage` or `cost`. Combinations with no usage or cost have no row. |
| `bucket_width`, default `1d` | `time_bucket_width`, no default. Pass `time_bucket_width=1d` to keep daily rows; omit it for whole-range totals. The cost endpoint also accepts every filter and `1m` and `1h` buckets. |
| `limit` counts time buckets per page | `limit` counts rows per page (1 to 1,000, default 20), so the number of pages depends on how many combinations have data |
| Any date range, paged forward by bucket | `starting_at` on or after January 1, 2026, and within the last 365 days, at most 31 days per request, `ending_at` required with `time_bucket_width`, and at most 24 hours with `1m` buckets (see [Date ranges and time buckets](#date-ranges-and-time-buckets)). Split longer ranges into several requests. |
| `account_ids[]`, `service_account_ids[]`, `group_by[]=account_id`, `group_by[]=service_account_id` | `actor_ids[]` with the same tagged IDs, and `group_by[]=actor` or `actor_type`; read `actor.user_id` or `actor.service_account_id`. See [Actors](#actors). |
| `context_window[]` | `context_windows[]` |
| `group_by[]=description` on the cost report, with a `description` string | No `description`. Group by the structured dimensions instead: any of `model`, `cost_type`, `token_type`, `context_window`, `service_tier`, `inference_geo`, and `speed`, all of which fit in one request. |
| An unknown API key or workspace ID returns an error | It matches nothing, including a misspelled `models[]` name. Each list takes up to 100 values. |
| `workspace_id: null` for the default workspace | The default workspace’s real `workspace_id` (see [How is the default workspace represented?](#how-is-the-default-workspace-represented)) |
| `inference_geo: "not_available"` and `service_tier: "standard"` on usage with no geo or tier | `null` for both. `inference_geos[]=not_available` still matches the rows with no inference geo. |
| Cost `service_tier` is `standard` or `batch`; `amount` such as `"123.45"` | The actual tier; `amount` with six decimal places, such as `"123.450000"`, plus `list_amount`. |
| Code execution not in the usage report; no request counts | Code execution appears as usage rows with `model: null`; adds `requests` on both endpoints and `total_tokens` on usage rows |

To reproduce the legacy daily report, request `time_bucket_width=1d` with the same `group_by[]`, page through with `limit=1000`, then group rows by `starting_at` and fill missing days with zeros. Add `order_by=time&order=asc` to get the days in order. Daily usage by model for 1 week, before:

and after:

Daily cost by workspace, model, service tier, context window, and inference geo, split by cost type and token type:

## Migrate from the Claude Enterprise usage and cost reports

This section is for Claude Enterprise organizations that call the [Claude Enterprise Analytics API](https://platform.claude.com/docs/en/manage-claude/analytics-api) report endpoints `usage_report`, `cost_report`, `user_usage_report`, and `user_cost_report` under `/v1/organizations/analytics/`. Those endpoints are legacy and remain supported. Move to `/analytics/usage` and `/analytics/cost` when you want any of the following:

-   Every group in every time bucket, rather than the top 100 groups in each bucket
-   Grouping by `actor` or `actor_type` together with other dimensions, on both usage and cost
-   Rows ranked by a metric of your choice across the whole range, or ordered by time bucket
-   One integration that also serves Claude Console organizations

Your key, the earliest date, the 365-day lookback and 31-day span, the filter and dimension names and values (except `user_ids[]` and the Claude Tag product value), the user `actor` fields, the metric and amount fields, `data_refreshed_at`, the cursor rules, and the [organization-level rate limit](https://platform.claude.com/docs/en/manage-claude/analytics-api#working-with-the-api) carry over. The only new header is the `analytics-usage-cost-2026-08-24` beta header. What changes:

| Claude Enterprise reports | Usage and Cost Analytics API |
| --- | --- |
| `usage_report` and `cost_report` return time buckets, oldest first, including empty ones, each holding at most its top 100 groups; `bucket_width` defaults to `1d` and `limit` counts buckets | Rows covering every combination with data, ranked by `order_by`, each with its own `starting_at` and `ending_at`, dimensions in `group`, and metrics in `usage` or `cost`. `time_bucket_width` is optional and `limit` counts rows. |
| The time-bucket parameter is `bucket_width` | It is `time_bucket_width`, with the same values |
| On `usage_report` and `cost_report`, `ending_at` is optional with `bucket_width` and `1m` buckets can span up to 31 days | `ending_at` required with `time_bucket_width`; `1m` buckets span at most 24 hours per request |
| `user_usage_report` and `user_cost_report` return one row per user | `group_by[]=actor&actor_types[]=user_actor`. Without the filter you also get rows for non-user identities and an `actor: null` row for unattributed usage. |
| Claude Tag usage has `product: "claude-tag"` | `product: "claude_tag"`; `products[]` accepts either spelling |
| An unrecognized `models[]` name returns a 400 error | It matches nothing |
| `user_ids[]` | `actor_ids[]` with the same tagged `user_...` IDs |
| `exclude_deleted_users` on the per-user reports | Requires `group_by[]=actor`; without it, the request returns a 400 error. It drops only rows whose `actor` is a user with `deleted: true`; rows for other identities and rows with `actor: null` stay. |

Per-user cost for a month, before:

and after, adding a breakdown by product:

## Frequently asked questions

### How is the default workspace represented?

A Claude Console organization’s default workspace has its own `wrkspc_` ID, like every other workspace. Rows for the default workspace have that ID in `workspace_id`, and you can filter on it with `workspace_ids[]`. [List Workspaces](https://platform.claude.com/docs/en/api/organization/workspaces/list) leaves out the default workspace unless you pass `include_default=true`. To check whether an unfamiliar `workspace_id` is the default workspace, pass it to [Get Workspace](https://platform.claude.com/docs/en/api/organization/workspaces/retrieve): the default workspace returns `"name": "Default"`.

### How do I get per-user cost for Claude Code?

Call the cost endpoint with `products[]=claude_code&group_by[]=actor`. Claude Console organizations can also use the [Claude Code Analytics API](https://platform.claude.com/docs/en/manage-claude/claude-code-analytics-api), which reports per-user Claude Code activity and estimated cost.

## See also

-   [Usage and Cost API](https://platform.claude.com/docs/en/manage-claude/usage-cost-api) (legacy)
-   [Analytics APIs](https://platform.claude.com/docs/en/manage-claude/analytics-api): which analytics API and key type your organization needs
-   [Claude Code Analytics API](https://platform.claude.com/docs/en/manage-claude/claude-code-analytics-api)
-   [Admin API reference](https://platform.claude.com/docs/en/api/beta/organization)
-   [Pricing](https://platform.claude.com/docs/en/about-claude/pricing)
