---
title: "Organization - Claude API Reference"
source_url: "https://platform.claude.com/docs/en/api/organization"
crawled_at: "2026-11-01T16:26:48.071Z"
---

1.  [API reference](https://platform.claude.com/docs/en/api/http)

##### [Get Current Organization](https://platform.claude.com/docs/en/api/http/organization/retrieve)

GET/v1/organizations/me

Retrieve information about the organization associated with the authenticated API key.

##### Models

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

OrganizationRole = "admin" or "billing" or "claude\_code\_user" or 6 more

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

#### Organization[API Keys](https://platform.claude.com/docs/en/api/http/organization/api_keys)

##### [Retrieve API Key (Admin API)](https://platform.claude.com/docs/en/api/http/organization/api_keys/retrieve)

GET/v1/organizations/api\_keys/{api\_key\_id}

Retrieve information about a single API key in your organization, looked up by its ID. This Admin API endpoint requires an Admin API key, is intended for programmatic key management, and never returns the key's secret value. To view or create your own API keys, go to [API keys](https://platform.claude.com/settings/keys) in the Claude Console.

#### Organization[External Keys](https://platform.claude.com/docs/en/api/http/organization/external_keys)

##### [Create External Key](https://platform.claude.com/docs/en/api/http/organization/external_keys/create)

POST/v1/organizations/external\_keys

Create an external key config owned by the caller's organization.

##### [List External Keys](https://platform.claude.com/docs/en/api/http/organization/external_keys/list)

GET/v1/organizations/external\_keys

List external key configs in the caller's organization.

##### [Get External Key](https://platform.claude.com/docs/en/api/http/organization/external_keys/retrieve)

GET/v1/organizations/external\_keys/{external\_key\_id}

Retrieve a single external key config in the caller's organization by ID.

##### [Update External Key](https://platform.claude.com/docs/en/api/http/organization/external_keys/update)

POST/v1/organizations/external\_keys/{external\_key\_id}

Partially update an external key config. Omitted fields are left unchanged.

##### [Delete External Key](https://platform.claude.com/docs/en/api/http/organization/external_keys/delete)

DELETE/v1/organizations/external\_keys/{external\_key\_id}

Delete an external key config.

##### [Validate External Key](https://platform.claude.com/docs/en/api/http/organization/external_keys/validate)

POST/v1/organizations/external\_keys/{external\_key\_id}/validate

Validate an external key config against the customer's KMS.

#### OrganizationFederation[Issuers](https://platform.claude.com/docs/en/api/http/organization/federation/issuers)

##### [Create Federation Issuer](https://platform.claude.com/docs/en/api/http/organization/federation/issuers/create)

POST/v1/organizations/federation\_issuers

**Requires an OAuth access token with the `org:admin` scope**, from `ant auth login --scope org:admin` or a workload identity federation rule; Admin API keys are not accepted. See [Manage WIF with the Admin API](https://platform.claude.com/docs/en/manage-claude/wif-admin-api).

##### [List Federation Issuers](https://platform.claude.com/docs/en/api/http/organization/federation/issuers/list)

GET/v1/organizations/federation\_issuers

**Requires an OAuth access token with the `org:admin` scope**, from `ant auth login --scope org:admin` or a workload identity federation rule; Admin API keys are not accepted. See [Manage WIF with the Admin API](https://platform.claude.com/docs/en/manage-claude/wif-admin-api).

##### [Get Federation Issuer](https://platform.claude.com/docs/en/api/http/organization/federation/issuers/retrieve)

GET/v1/organizations/federation\_issuers/{federation\_issuer\_id}

**Requires an OAuth access token with the `org:admin` scope**, from `ant auth login --scope org:admin` or a workload identity federation rule; Admin API keys are not accepted. See [Manage WIF with the Admin API](https://platform.claude.com/docs/en/manage-claude/wif-admin-api).

##### [Update Federation Issuer](https://platform.claude.com/docs/en/api/http/organization/federation/issuers/update)

POST/v1/organizations/federation\_issuers/{federation\_issuer\_id}

**Requires an OAuth access token with the `org:admin` scope**, from `ant auth login --scope org:admin` or a workload identity federation rule; Admin API keys are not accepted. See [Manage WIF with the Admin API](https://platform.claude.com/docs/en/manage-claude/wif-admin-api).

##### [Archive Federation Issuer](https://platform.claude.com/docs/en/api/http/organization/federation/issuers/archive)

POST/v1/organizations/federation\_issuers/{federation\_issuer\_id}/archive

**Requires an OAuth access token with the `org:admin` scope**, from `ant auth login --scope org:admin` or a workload identity federation rule; Admin API keys are not accepted. See [Manage WIF with the Admin API](https://platform.claude.com/docs/en/manage-claude/wif-admin-api).

#### OrganizationFederation[Rules](https://platform.claude.com/docs/en/api/http/organization/federation/rules)

##### [Create Federation Rule](https://platform.claude.com/docs/en/api/http/organization/federation/rules/create)

POST/v1/organizations/federation\_rules

**Requires an OAuth access token with the `org:admin` scope**, from `ant auth login --scope org:admin` or a workload identity federation rule; Admin API keys are not accepted. See [Manage WIF with the Admin API](https://platform.claude.com/docs/en/manage-claude/wif-admin-api).

##### [List Federation Rules](https://platform.claude.com/docs/en/api/http/organization/federation/rules/list)

GET/v1/organizations/federation\_rules

**Requires an OAuth access token with the `org:admin` scope**, from `ant auth login --scope org:admin` or a workload identity federation rule; Admin API keys are not accepted. See [Manage WIF with the Admin API](https://platform.claude.com/docs/en/manage-claude/wif-admin-api).

##### [Get Federation Rule](https://platform.claude.com/docs/en/api/http/organization/federation/rules/retrieve)

GET/v1/organizations/federation\_rules/{federation\_rule\_id}

**Requires an OAuth access token with the `org:admin` scope**, from `ant auth login --scope org:admin` or a workload identity federation rule; Admin API keys are not accepted. See [Manage WIF with the Admin API](https://platform.claude.com/docs/en/manage-claude/wif-admin-api).

##### [Update Federation Rule](https://platform.claude.com/docs/en/api/http/organization/federation/rules/update)

POST/v1/organizations/federation\_rules/{federation\_rule\_id}

**Requires an OAuth access token with the `org:admin` scope**, from `ant auth login --scope org:admin` or a workload identity federation rule; Admin API keys are not accepted. See [Manage WIF with the Admin API](https://platform.claude.com/docs/en/manage-claude/wif-admin-api).

##### [Archive Federation Rule](https://platform.claude.com/docs/en/api/http/organization/federation/rules/archive)

POST/v1/organizations/federation\_rules/{federation\_rule\_id}/archive

**Requires an OAuth access token with the `org:admin` scope**, from `ant auth login --scope org:admin` or a workload identity federation rule; Admin API keys are not accepted. See [Manage WIF with the Admin API](https://platform.claude.com/docs/en/manage-claude/wif-admin-api).

#### OrganizationFederationRules[Workspaces](https://platform.claude.com/docs/en/api/http/organization/federation/rules/workspaces)

##### [Add Federation Rule Workspace](https://platform.claude.com/docs/en/api/http/organization/federation/rules/workspaces/add)

POST/v1/organizations/federation\_rules/{federation\_rule\_id}/workspaces

**Requires an OAuth access token with the `org:admin` scope**, from `ant auth login --scope org:admin` or a workload identity federation rule; Admin API keys are not accepted. See [Manage WIF with the Admin API](https://platform.claude.com/docs/en/manage-claude/wif-admin-api).

##### [List Federation Rule Workspaces](https://platform.claude.com/docs/en/api/http/organization/federation/rules/workspaces/list)

GET/v1/organizations/federation\_rules/{federation\_rule\_id}/workspaces

**Requires an OAuth access token with the `org:admin` scope**, from `ant auth login --scope org:admin` or a workload identity federation rule; Admin API keys are not accepted. See [Manage WIF with the Admin API](https://platform.claude.com/docs/en/manage-claude/wif-admin-api).

##### [Remove Federation Rule Workspace](https://platform.claude.com/docs/en/api/http/organization/federation/rules/workspaces/remove)

DELETE/v1/organizations/federation\_rules/{federation\_rule\_id}/workspaces/{workspace\_id}

**Requires an OAuth access token with the `org:admin` scope**, from `ant auth login --scope org:admin` or a workload identity federation rule; Admin API keys are not accepted. See [Manage WIF with the Admin API](https://platform.claude.com/docs/en/manage-claude/wif-admin-api).

#### Organization[Invites](https://platform.claude.com/docs/en/api/http/organization/invites)

##### [Create Invite](https://platform.claude.com/docs/en/api/http/organization/invites/create)

POST/v1/organizations/invites

Invite a user to join the organization by email.

##### [List Invites](https://platform.claude.com/docs/en/api/http/organization/invites/list)

GET/v1/organizations/invites

List the organization's invites.

##### [Get Invite](https://platform.claude.com/docs/en/api/http/organization/invites/retrieve)

GET/v1/organizations/invites/{invite\_id}

Retrieve an invite by ID.

##### [Delete Invite](https://platform.claude.com/docs/en/api/http/organization/invites/delete)

DELETE/v1/organizations/invites/{invite\_id}

Delete a pending invite.

#### Organization[Service Accounts](https://platform.claude.com/docs/en/api/http/organization/service_accounts)

##### [Create Service Account](https://platform.claude.com/docs/en/api/http/organization/service_accounts/create)

POST/v1/organizations/service\_accounts

**Requires an OAuth access token with the `org:admin` scope**, from `ant auth login --scope org:admin` or a workload identity federation rule; Admin API keys are not accepted. See [Manage WIF with the Admin API](https://platform.claude.com/docs/en/manage-claude/wif-admin-api).

##### [List Service Accounts](https://platform.claude.com/docs/en/api/http/organization/service_accounts/list)

GET/v1/organizations/service\_accounts

**Requires an OAuth access token with the `org:admin` scope**, from `ant auth login --scope org:admin` or a workload identity federation rule; Admin API keys are not accepted. See [Manage WIF with the Admin API](https://platform.claude.com/docs/en/manage-claude/wif-admin-api).

##### [Get Service Account](https://platform.claude.com/docs/en/api/http/organization/service_accounts/retrieve)

GET/v1/organizations/service\_accounts/{service\_account\_id}

**Requires an OAuth access token with the `org:admin` scope**, from `ant auth login --scope org:admin` or a workload identity federation rule; Admin API keys are not accepted. See [Manage WIF with the Admin API](https://platform.claude.com/docs/en/manage-claude/wif-admin-api).

##### [Update Service Account](https://platform.claude.com/docs/en/api/http/organization/service_accounts/update)

POST/v1/organizations/service\_accounts/{service\_account\_id}

**Requires an OAuth access token with the `org:admin` scope**, from `ant auth login --scope org:admin` or a workload identity federation rule; Admin API keys are not accepted. See [Manage WIF with the Admin API](https://platform.claude.com/docs/en/manage-claude/wif-admin-api).

##### [Archive Service Account](https://platform.claude.com/docs/en/api/http/organization/service_accounts/archive)

POST/v1/organizations/service\_accounts/{service\_account\_id}/archive

**Requires an OAuth access token with the `org:admin` scope**, from `ant auth login --scope org:admin` or a workload identity federation rule; Admin API keys are not accepted. See [Manage WIF with the Admin API](https://platform.claude.com/docs/en/manage-claude/wif-admin-api).

#### Organization[Users](https://platform.claude.com/docs/en/api/http/organization/users)

##### [List Users](https://platform.claude.com/docs/en/api/http/organization/users/list)

GET/v1/organizations/users

List the organization's members.

##### [Get User](https://platform.claude.com/docs/en/api/http/organization/users/retrieve)

GET/v1/organizations/users/{user\_id}

Retrieve a member of the organization by user ID.

##### [Update User](https://platform.claude.com/docs/en/api/http/organization/users/update)

POST/v1/organizations/users/{user\_id}

Update a member's organization role.

##### [Remove User](https://platform.claude.com/docs/en/api/http/organization/users/remove)

DELETE/v1/organizations/users/{user\_id}

Remove a member from the organization.

#### OrganizationWorkspaces[Rate Limits](https://platform.claude.com/docs/en/api/http/organization/workspaces/rate_limits)

##### [Set Workspace Rate Limits](https://platform.claude.com/docs/en/api/http/organization/workspaces/rate_limits/update)

POST/v1/organizations/workspaces/{workspace\_id}/rate\_limits/{rate\_limit\_id}

Set or clear rate-limit overrides for one rate-limit group in a workspace.
