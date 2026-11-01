---
title: "Get Invite - Claude API Reference"
source_url: "https://platform.claude.com/docs/en/api/organization/invites/retrieve"
crawled_at: "2026-11-01T16:29:56.101Z"
---

Retrieve an invite by ID.

##### Path parameters

invite\_id: string

ID of the Invite.

##### Headers

"anthropic-version": optional string

The version of the Claude API you want to use.

Read more about versioning and our version history [here](https://platform.claude.com/docs/en/api/versioning).

##### Returns

OrganizationInvite object{ type: "invite", id, accepted\_at, 6 more }

Get Invite

```
curl https://api.anthropic.com/v1/organizations/invites/$INVITE_ID \
    -H 'anthropic-version: 2026-10-21' \
    -H "Authorization: Bearer $ANTHROPIC_API_KEY"
```

Response 200

```
{
  "id": "invite_015gWxCN9Hfg2QhZwTK7Mdeu",
  "accepted_at": "2019-12-27T18:11:19.117Z",
  "email": "user@emaildomain.com",
  "expires_at": "2024-11-20T23:58:27.427722Z",
  "invited_at": "2024-10-30T23:58:27.427722Z",
  "rbac_group_ids": [
    "string"
  ],
  "role": "admin",
  "status": "pending",
  "type": "invite"
}
```

##### Returns Examples

Response 200

```
{
  "id": "invite_015gWxCN9Hfg2QhZwTK7Mdeu",
  "accepted_at": "2019-12-27T18:11:19.117Z",
  "email": "user@emaildomain.com",
  "expires_at": "2024-11-20T23:58:27.427722Z",
  "invited_at": "2024-10-30T23:58:27.427722Z",
  "rbac_group_ids": [
    "string"
  ],
  "role": "admin",
  "status": "pending",
  "type": "invite"
}
```
