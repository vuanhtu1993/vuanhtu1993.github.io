---
title: "List API Keys - Claude API Reference"
source_url: "https://platform.claude.com/docs/en/api/organization/api_keys/list"
crawled_at: "2026-11-01T16:30:17.587Z"
---

1.  [API reference](https://platform.claude.com/docs/en/api/http)
2.  [Organization](https://platform.claude.com/docs/en/api/http/organization)
3.  [API Keys](https://platform.claude.com/docs/en/api/http/organization/api_keys)

GET/v1/organizations/api\_keys

List API Keys

##### Query parameters

after\_id: optional string

ID of the object to use as a cursor for pagination. When provided, returns the page of results immediately after this object.

before\_id: optional string

ID of the object to use as a cursor for pagination. When provided, returns the page of results immediately before this object.

created\_by\_user\_id: optional string

Filter by the ID of the User who created the object.

limit: optional number

Number of items to return per page.

Defaults to `20`. Ranges from `1` to `1000`.

default20

minimum1

maximum1000

status: optional "active" or "archived" or "expired" or "inactive"

Filter by API key status.

One of the following:

"active"

"archived"

"expired"

"inactive"

workspace\_id: optional string

Filter by Workspace ID.

##### Headers

"anthropic-version": optional string

The version of the Claude API you want to use.

Read more about versioning and our version history [here](https://platform.claude.com/docs/en/api/versioning).

##### Returns

data: array of [APIKey](https://platform.claude.com/docs/en/api/http/organization/api_keys#api_key) { type: "api\_key", id, created\_at, 7 more }

type: "api\_key"

Object type.

For API Keys, this is always `"api_key"`.

defaultapi\_key

id: string

ID of the API key.

created\_at: string

RFC 3339 datetime string indicating when the API Key was created.

formatdate-time

The ID and type of the actor that created the API key, or `null` when the creator is not recorded (legacy, workload-identity-federated, or system-created keys).

type: "service\_account" or "user"

Type of the actor that created the object.

One of the following:

"service\_account"

"user"

id: string

ID of the actor that created the object.

expires\_at: string or null

RFC 3339 datetime string indicating when the API Key expires, or `null` if it never expires.

formatdate-time

name: string

Name of the API key.

partial\_key\_hint: string or null

Partially redacted hint for the API key.

The principal the API key acts as (a User or a Service Account), or `null` if the API key is not bound to a principal.

One of the following:

APIKeyUserActor object{ type: "user\_actor", user\_id }

type: "user\_actor"

Principal type. Always `"user_actor"` for a User.

defaultuser\_actor

user\_id: string

ID of the User the API key acts as.

APIKeyServiceAccountActor object{ type: "service\_account\_actor", service\_account\_id }

type: "service\_account\_actor"

Principal type. Always `"service_account_actor"` for a Service Account.

defaultservice\_account\_actor

service\_account\_id: string

ID of the Service Account the API key acts as.

Where the API key belongs: its Workspace (`{"type": "workspace", "workspace_id": "wrkspc_..."}`, with the Workspace's real ID even when it is the organization's default Workspace), or the organization (`{"type": "organization"}`) for a principal-bound API key that has no Workspace.

One of the following:

APIKeyOrganizationScope object{ type: "organization" }

type: "organization"

Scope type. Always `"organization"`: the API key has no Workspace. Only a principal-bound API key can have this scope.

defaultorganization

APIKeyWorkspaceScope object{ type: "workspace", workspace\_id }

type: "workspace"

Scope type. Always `"workspace"`: the API key belongs to one Workspace.

defaultworkspace

workspace\_id: string

ID of the Workspace the API key belongs to, including when it is the organization's default Workspace.

status: "active" or "archived" or "expired" or "inactive"

Status of the API key.

One of the following:

"active"

"archived"

"expired"

"inactive"

first\_id: string or null

First ID in the `data` list. Can be used as the `before_id` for the previous page.

has\_more: boolean

Indicates if there are more results in the requested page direction.

last\_id: string or null

Last ID in the `data` list. Can be used as the `after_id` for the next page.
