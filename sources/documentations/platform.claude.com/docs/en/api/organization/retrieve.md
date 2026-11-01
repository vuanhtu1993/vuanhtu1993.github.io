---
title: "Get Current Organization - Claude API Reference"
source_url: "https://platform.claude.com/docs/en/api/organization/retrieve"
crawled_at: "2026-11-01T16:30:22.786Z"
---

1.  [API reference](https://platform.claude.com/docs/en/api/http)
2.  [Organization](https://platform.claude.com/docs/en/api/http/organization)

GET/v1/organizations/me

Retrieve information about the organization associated with the authenticated API key.

##### Headers

"anthropic-version": optional string

The version of the Claude API you want to use.

Read more about versioning and our version history [here](https://platform.claude.com/docs/en/api/versioning).

##### Returns

OrganizationInfo object{ type: "organization", id, name }

type: "organization"

Object type.

For Organizations, this is always `"organization"`.

defaultorganization

id: string

ID of the Organization.

formatuuid

name: string

Name of the Organization.
