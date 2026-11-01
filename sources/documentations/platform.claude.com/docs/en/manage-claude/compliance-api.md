---
title: "Compliance API"
source_url: "https://platform.claude.com/docs/en/manage-claude/compliance-api"
crawled_at: "2026-11-01T16:28:43.119Z"
---

Programmatic access to your organization’s Claude activity, chats, files, projects, sessions in Claude apps, and users for compliance, audit, and governance.

The Compliance API gives Claude Enterprise and Claude Console customers programmatic access to their organization’s Activity Feed. For Claude Enterprise organizations, it also covers the directory of users, roles, and groups across every linked organization; the effective settings in force for each organization; the underlying chats, files, and projects in claude.ai organizations; and sessions in Cowork, Claude Code, Claude Science, Claude for Microsoft 365, the Claude add-ins for Google Docs, Google Sheets, and Google Slides, and Claude in Chrome. Security, legal, and compliance teams use it to audit activity, retrieve or delete content, and feed events into downstream tooling.

The following call returns the most recent activity event in your organization. Any key with the `read:compliance_activities` scope can make it. To create a key and grant it that scope, see [Set up the Compliance API](https://platform.claude.com/docs/en/manage-claude/compliance-api-access).

A successful response returns a JSON object containing `data` (an array of `Activity` records), `has_more`, `first_id`, and `last_id`:

---

## How the Compliance API works

Every endpoint lives under `/v1/compliance/*` on `https://api.anthropic.com`, authenticates through the `x-api-key` header, and takes the [`anthropic-version`](https://platform.claude.com/docs/en/api/versioning) header on every request. To provision a key, see [Set up the Compliance API](https://platform.claude.com/docs/en/manage-claude/compliance-api-access).

The Activity Feed (`GET /v1/compliance/activities`) is available to any key that carries the `read:compliance_activities` scope; see [Query the Activity Feed](https://platform.claude.com/docs/en/manage-claude/compliance-activity-feed) for filters, pagination, and the full `Activity` object. The remaining endpoints require a Compliance Access Key carrying the relevant scope.

A Claude Enterprise tenant has one parent organization (the top-level container that centralizes identity) with linked organizations of two kinds: claude.ai organizations, where users chat and store content, and Claude Console organizations, where users manage Claude API workloads. For a key that covers the parent organization, the directory endpoints (organizations, users, roles, and groups) return data from every linked organization of either kind. The content endpoints (chats, files, projects, project attachments, and sessions) serve Claude Enterprise data only. The chat, file, and project endpoints return claude.ai chats, files, and projects. The session endpoints return transcripts of sessions on users’ machines (local sessions), captured while users are signed in with their Claude Enterprise account: sessions in Cowork, Claude Code, Claude Science, Claude for Microsoft 365, the Claude add-ins for Google Docs, Google Sheets, and Google Slides, and Claude in Chrome. They also return transcripts of Cowork sessions started on claude.ai web or mobile, which run in the cloud in Anthropic-managed environments (remote sessions). A standalone Claude Console organization (one with no parent organization) is not part of a Claude Enterprise tenant; it uses Admin API keys and can query the Activity Feed only.

All `/v1/compliance/*` endpoints share a rate limit of 600 requests per minute for each parent organization (for a standalone Claude Console organization, for each organization). The local session endpoints count only against that shared limit, and the remote session endpoints carry a second request budget on top. See [429 Too Many Requests](https://platform.claude.com/docs/en/manage-claude/compliance-errors#429-too-many-requests) for the response headers and retry contract.

---

## Versioning

Send the `anthropic-version` header on every request; see [API versions](https://platform.claude.com/docs/en/api/versioning) for the available versions.

---

A few adjacent features overlap with the Compliance API; here is how to choose.

### Export audit logs

The audit log export is a separate feature in [claude.ai > Organization settings > Data and privacy](https://claude.ai/admin-settings/data-privacy-controls) that lets owners and primary owners download a CSV of organization events. It’s significantly narrower than the Compliance API: a capped lookback window, CSV download only, and no access to chat, file, or project content. Standardize on the Compliance API for ongoing programmatic use.

### Analytics API

Anthropic provides two analytics APIs: the Claude Enterprise Analytics API and the [Claude Code Analytics API](https://platform.claude.com/docs/en/manage-claude/claude-code-analytics-api). Both return aggregated usage and cost figures for IT, FinOps, and platform teams, whereas the Compliance API returns per-event records for security, legal, and compliance teams. The two API families answer different questions, use different keys, and are provisioned separately.

### OpenTelemetry logging

[Cowork’s OpenTelemetry logging](https://support.claude.com/en/articles/14477985-monitor-claude-cowork-activity-with-opentelemetry) and [Claude Code monitoring](https://code.claude.com/docs/en/monitoring-usage) stream per-event telemetry, including token, cost, and host metadata, to a collector you run as activity occurs, whereas the Compliance API returns retained per-session transcripts from Anthropic on request and works with your existing Compliance Access Key. OpenTelemetry logging can also capture prompts and responses, but Anthropic recommends the Compliance API for retrieving the content of Cowork and Claude Code sessions. For a table comparing local sessions, remote sessions, and OpenTelemetry logging, see the introduction to [Retrieve session transcripts](https://platform.claude.com/docs/en/manage-claude/compliance-sessions).

### Inference hooks

[Inference hooks](https://platform.claude.com/docs/en/manage-claude/inference-hooks) act inline: your organization’s AI security server receives each governed prompt before inference and can deny it in real time, whereas the Compliance API retrieves records after the fact and returns richer data, such as organization settings and full non-text files.

---

## In this section

Enable the Compliance API for your organization, then create a Compliance Access Key (with scoped permissions) or an Admin API key, and learn which to use.

Retrieve, filter, and paginate the shared Activity Feed. Supported by both key types.

Read chat content, files, and project attachments; delete chats, files, and projects on demand. Compliance Access Key required.

List the sessions your users run in Claude apps and agents, such as Cowork and Claude Code, and retrieve their transcripts. Compliance Access Key required.

Enumerate linked organizations, members, roles, and directory groups, and read each organization’s effective settings.

Choose a feed-consumption pattern, plan SIEM correlation, and decide your retention approach.

Common 400, 401, 403, 404, 409, 429, and 5xx responses from the Compliance API, with the cause and fix for each.

Endpoint paths, parameters, and response schemas for every Compliance API call.

Answers to common key, scope, availability, and integration questions.
