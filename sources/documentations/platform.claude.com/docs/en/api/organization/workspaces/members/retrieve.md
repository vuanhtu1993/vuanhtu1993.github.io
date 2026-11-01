---
title: "Get Workspace Member - Claude API Reference"
source_url: "https://platform.claude.com/docs/en/api/organization/workspaces/members/retrieve"
crawled_at: "2026-11-01T16:30:03.156Z"
---

GET/v1/organizations/workspaces/{workspace\_id}/members/{user\_id}

Get Workspace Member

##### Path parameters

workspace\_id: string

ID of the Workspace.

user\_id: string

ID of the User.

##### Headers

"anthropic-version": optional string

The version of the Claude API you want to use.

Read more about versioning and our version history [here](https://platform.claude.com/docs/en/api/versioning).

##### Returns

WorkspaceMember object{ type: "workspace\_member", user\_id, workspace\_id, workspace\_role }

type: "workspace\_member"

Object type.

For Workspace Members, this is always `"workspace_member"`.

defaultworkspace\_member

user\_id: string

ID of the User.

workspace\_id: string

ID of the Workspace.

Role of the Workspace Member.

One of the following:

"workspace\_admin"

"workspace\_billing"

"workspace\_developer"

"workspace\_restricted\_developer"

"workspace\_user"
