---
title: "Get User - Claude API Reference"
source_url: "https://platform.claude.com/docs/en/api/organization/users/retrieve"
crawled_at: "2026-11-01T16:29:50.787Z"
---

GET/v1/organizations/users/{user\_id}

Retrieve a member of the organization by user ID.

##### Path parameters

user\_id: string

ID of the User.

##### Headers

"anthropic-version": optional string

The version of the Claude API you want to use.

Read more about versioning and our version history [here](https://platform.claude.com/docs/en/api/versioning).

##### Returns

OrganizationUser object{ type: "user", id, added\_at, 3 more }

type: "user"

Object type.

For Users, this is always `"user"`.

defaultuser

id: string

ID of the User.

added\_at: string

RFC 3339 datetime string indicating when the User joined the Organization.

formatdate-time

email: string

Email of the User.

name: string

Name of the User.

Organization role of the User.

One of the following:

"admin"

"billing"

"claude\_code\_user"

"developer"

"managed"

"membership\_admin"

"owner"

"primary\_owner"

"user"
