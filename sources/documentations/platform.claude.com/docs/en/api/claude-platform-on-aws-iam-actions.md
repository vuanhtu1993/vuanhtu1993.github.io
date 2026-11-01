---
title: "IAM actions for Claude Platform on AWS"
source_url: "https://platform.claude.com/docs/en/api/claude-platform-on-aws-iam-actions"
crawled_at: "2026-11-01T16:29:36.149Z"
---

IAM action reference for controlling access to Claude Platform on AWS through AWS policies.

Claude Platform on AWS uses AWS IAM for access control. Every API route maps to an IAM action in the `aws-external-anthropic` namespace. This page lists all actions, the routes each action authorizes, and the managed policies available for common access patterns. For platform setup and authentication, see [Claude Platform on AWS](https://platform.claude.com/docs/en/build-with-claude/claude-platform-on-aws).

## Service details

| Attribute | Value |
| --- | --- |
| **IAM service prefix** | `aws-external-anthropic` |
| **Resource types** | `workspace` |

Workspace ARN format:

The ARN region is always populated and matches the region the workspace is bound to. The resource segment is the tagged workspace ID (`wrkspc_...`), the same value you pass in the `anthropic-workspace-id` header.

## Actions

Actions follow the AWS `VerbNoun` convention and use verb discipline so that `Get*` and `List*` wildcards produce a clean read-only boundary.

### Inference

| Action | Routes authorized |
| --- | --- |
| `CreateInference` | `POST /v1/messages` |
| `CountTokens` | `POST /v1/messages/count_tokens` |

### Batch processing

| Action | Routes authorized |
| --- | --- |
| `CreateBatchInference` | `POST /v1/messages/batches` |
| `GetBatchInference` | `GET /v1/messages/batches/{id}`  
`GET /v1/messages/batches/{id}/results` |
| `ListBatchInferences` | `GET /v1/messages/batches` |
| `CancelBatchInference` | `POST /v1/messages/batches/{id}/cancel` |
| `DeleteBatchInference` | `DELETE /v1/messages/batches/{id}` |

### Models

| Action | Routes authorized |
| --- | --- |
| `GetModel` | `GET /v1/models/{id}` |
| `ListModels` | `GET /v1/models` |

### Files

| Action | Routes authorized |
| --- | --- |
| `CreateFile` | `POST /v1/files` |
| `GetFile` | `GET /v1/files/{id}`  
`GET /v1/files/{id}/content` |
| `ListFiles` | `GET /v1/files` |
| `DeleteFile` | `DELETE /v1/files/{id}` |

### Skills

| Action | Routes authorized |
| --- | --- |
| `CreateSkill` | `POST /v1/skills` |
| `GetSkill` | `GET /v1/skills/{id}`  
`GET /v1/skills/{id}/versions`  
`GET /v1/skills/{id}/versions/{version}`  
`GET /v1/skills/{id}/versions/{version}/content` |
| `ListSkills` | `GET /v1/skills` |
| `UpdateSkill` | `POST /v1/skills/{id}/versions`  
`DELETE /v1/skills/{id}/versions/{version}` |
| `DeleteSkill` | `DELETE /v1/skills/{id}` |

### Agents

| Action | Routes authorized |
| --- | --- |
| `CreateAgent` | `POST /v1/agents` |
| `GetAgent` | `GET /v1/agents/{id}`  
`GET /v1/agents/{id}/versions` |
| `ListAgents` | `GET /v1/agents` |
| `UpdateAgent` | `POST /v1/agents/{id}` |
| `ArchiveAgent` | `POST /v1/agents/{id}/archive` |

### Sessions

| Action | Routes authorized |
| --- | --- |
| `CreateSession` | `POST /v1/sessions` |
| `GetSession` | `GET /v1/sessions/{id}`  
`GET /v1/sessions/{id}/events`  
`GET /v1/sessions/{id}/events/stream`  
`GET /v1/sessions/{id}/resources`  
`GET /v1/sessions/{id}/resources/{id}` |
| `ListSessions` | `GET /v1/sessions` |
| `UpdateSession` | `POST /v1/sessions/{id}`  
`POST /v1/sessions/{id}/events`  
`POST /v1/sessions/{id}/resources`  
`POST /v1/sessions/{id}/resources/{id}`  
`DELETE /v1/sessions/{id}/resources/{id}` |
| `ArchiveSession` | `POST /v1/sessions/{id}/archive` |
| `DeleteSession` | `DELETE /v1/sessions/{id}` |

### Environments

| Action | Routes authorized |
| --- | --- |
| `CreateEnvironment` | `POST /v1/environments` |
| `GetEnvironment` | `GET /v1/environments/{id}`  
`GET /v1/environments/{id}/work`  
`GET /v1/environments/{id}/work/{work_id}`  
`GET /v1/environments/{id}/work/stats` |
| `ListEnvironments` | `GET /v1/environments` |
| `UpdateEnvironment` | `POST /v1/environments/{id}` |
| `ArchiveEnvironment` | `POST /v1/environments/{id}/archive` |
| `DeleteEnvironment` | `DELETE /v1/environments/{id}` |
| `ProcessEnvironmentWork` | `GET /v1/environments/{id}/work/poll`  
`POST /v1/environments/{id}/work/{work_id}`  
`POST /v1/environments/{id}/work/{work_id}/ack`  
`POST /v1/environments/{id}/work/{work_id}/heartbeat`  
`POST /v1/environments/{id}/work/{work_id}/stop` |

### Vaults

| Action | Routes authorized |
| --- | --- |
| `CreateVault` | `POST /v1/vaults` |
| `GetVault` | `GET /v1/vaults/{id}`  
`GET /v1/vaults/{id}/credentials`  
`GET /v1/vaults/{id}/credentials/{id}` |
| `ListVaults` | `GET /v1/vaults` |
| `UpdateVault` | `POST /v1/vaults/{id}`  
`POST /v1/vaults/{id}/credentials`  
`POST /v1/vaults/{id}/credentials/{id}`  
`POST /v1/vaults/{id}/credentials/{id}/archive`  
`DELETE /v1/vaults/{id}/credentials/{id}` |
| `ArchiveVault` | `POST /v1/vaults/{id}/archive` |
| `DeleteVault` | `DELETE /v1/vaults/{id}` |

### Memory stores

| Action | Routes authorized |
| --- | --- |
| `CreateMemoryStore` | `POST /v1/memory_stores` |
| `GetMemoryStore` | `GET /v1/memory_stores/{id}`  
`GET /v1/memory_stores/{id}/memories`  
`GET /v1/memory_stores/{id}/memories/{id}`  
`GET /v1/memory_stores/{id}/memory_versions`  
`GET /v1/memory_stores/{id}/memory_versions/{id}` |
| `ListMemoryStores` | `GET /v1/memory_stores` |
| `UpdateMemoryStore` | `POST /v1/memory_stores/{id}`  
`POST /v1/memory_stores/{id}/memories`  
`POST /v1/memory_stores/{id}/memories/{id}`  
`DELETE /v1/memory_stores/{id}/memories/{id}`  
`POST /v1/memory_stores/{id}/memory_versions/{id}/redact` |
| `ArchiveMemoryStore` | `POST /v1/memory_stores/{id}/archive` |
| `DeleteMemoryStore` | `DELETE /v1/memory_stores/{id}` |

### Webhooks

| Action | Routes authorized |
| --- | --- |
| `CreateWebhook` | `POST /v1/webhooks` |
| `GetWebhook` | `GET /v1/webhooks/{id}` |
| `ListWebhooks` | `GET /v1/webhooks` |
| `UpdateWebhook` | `POST /v1/webhooks/{id}` |
| `DeleteWebhook` | `DELETE /v1/webhooks/{id}` |
| `RotateWebhookSecret` | `POST /v1/webhooks/{id}/regenerate_signing_secret` |

### User profiles

| Action | Routes authorized |
| --- | --- |
| `CreateUserProfile` | `POST /v1/user_profiles` |
| `GetUserProfile` | `GET /v1/user_profiles/{id}` |
| `ListUserProfiles` | `GET /v1/user_profiles` |
| `UpdateUserProfile` | `POST /v1/user_profiles/{id}` |
| `DeleteUserProfile` | `DELETE /v1/user_profiles/{id}` |
| `CreateUserProfileEnrollmentUrl` | `POST /v1/user_profiles/{id}/enrollment_url` |

### Workspaces

| Action | Routes authorized |
| --- | --- |
| `CreateWorkspace` | `POST /v1/organizations/workspaces` |
| `GetWorkspace` | `GET /v1/organizations/workspaces/{id}` |
| `ListWorkspaces` | `GET /v1/organizations/workspaces` |
| `UpdateWorkspace` | `POST /v1/organizations/workspaces/{id}` |
| `ArchiveWorkspace` | `POST /v1/organizations/workspaces/{id}/archive` |

### Encryption keys

| Action | Routes authorized |
| --- | --- |
| `RegisterKey` | `POST /v1/organizations/external_keys` |
| `GetKey` | `GET /v1/organizations/external_keys/{id}` |
| `ListKeys` | `GET /v1/organizations/external_keys` |
| `UpdateKey` | `POST /v1/organizations/external_keys/{id}` |
| `DisableKey` | `DELETE /v1/organizations/external_keys/{id}` |

### Compliance

| Action | Routes authorized |
| --- | --- |
| `ListComplianceActivities` | `GET /v1/compliance/activities` |

### Telemetry destinations

| Action | Routes authorized |
| --- | --- |
| `CreateAccountTelemetryDestination` | `POST /v1/organizations/telemetry_destinations` |
| `GetAccountTelemetryDestination` | `GET /v1/organizations/telemetry_destinations/{id}` |
| `ListAccountTelemetryDestinations` | `GET /v1/organizations/telemetry_destinations` |
| `UpdateAccountTelemetryDestination` | `POST /v1/organizations/telemetry_destinations/{id}` |
| `DeleteAccountTelemetryDestination` | `DELETE /v1/organizations/telemetry_destinations/{id}` |
| `TestAccountTelemetryDestination` | `POST /v1/organizations/telemetry_destinations/{id}/test` |
| `ListAccountTelemetryDestinationWorkspaces` | `GET /v1/organizations/telemetry_destinations/{id}/workspaces` |
| `AddTelemetryDestinationWorkspace` | `POST /v1/organizations/telemetry_destinations/{id}/workspaces/{workspace_id}` |
| `RemoveTelemetryDestinationWorkspace` | `DELETE /v1/organizations/telemetry_destinations/{id}/workspaces/{workspace_id}` |

### Usage and cost

| Action | Routes authorized |
| --- | --- |
| `ListAccountUsage` | `GET /v1/organizations/analytics/usage` |
| `ListAccountCost` | `GET /v1/organizations/analytics/cost` |

### Authentication

| Action | Routes authorized |
| --- | --- |
| `CallWithBearerToken` | (none) |

`CallWithBearerToken` is an authentication-layer permission that authorizes a principal to authenticate through an API key (bearer token) rather than AWS SigV4. It does not map to a route. Grant it alongside the route-mapped actions you want the API key holder to perform.

### Console access

| Action | Routes authorized |
| --- | --- |
| `AssumeConsole` | (none) |

`AssumeConsole` authorizes a principal to open the Claude Console for a Claude Platform on AWS workspace through the AWS Console federation flow. It does not map to a route. Grant it to principals who should be able to click **Open Claude Console** on the Claude Platform on AWS service page in the AWS Console. The Claude Console role (Admin or Developer) is assigned separately by your Anthropic account representative; it is not derived from the principal’s IAM permissions. See [Using the Claude Console](https://platform.claude.com/docs/en/build-with-claude/claude-platform-on-aws#using-the-claude-console) for the sign-in flow and role descriptions.

## Route-to-action mapping

The following tables list every route on Claude Platform on AWS and the IAM action required to call it. Each IAM action also authorizes requests that use the `anthropic-beta` header; beta variants of a route do not require a separate IAM action. CloudTrail classifies each action as either a Data event (high-volume, data-plane operations) or a Management event (control-plane operations). Vault and webhook actions are classified as Management events because they hold secrets (vault credentials and webhook signing secrets) and benefit from default-on audit logging. Workspace, external key, telemetry destination, and compliance actions are also classified as Management events because they are organization-scoped control-plane operations. All other actions, including inference, batch, model, file, skill, user profile, usage and cost, and the remaining Claude Managed Agents actions, are classified as Data events.

| Method | Route | IAM action | CloudTrail event type |
| --- | --- | --- | --- |
| `POST` | `/v1/messages` | `CreateInference` | Data |
| `POST` | `/v1/messages/count_tokens` | `CountTokens` | Data |
| `POST` | `/v1/messages/batches` | `CreateBatchInference` | Data |
| `GET` | `/v1/messages/batches` | `ListBatchInferences` | Data |
| `GET` | `/v1/messages/batches/{id}` | `GetBatchInference` | Data |
| `GET` | `/v1/messages/batches/{id}/results` | `GetBatchInference` | Data |
| `POST` | `/v1/messages/batches/{id}/cancel` | `CancelBatchInference` | Data |
| `DELETE` | `/v1/messages/batches/{id}` | `DeleteBatchInference` | Data |
| `GET` | `/v1/models` | `ListModels` | Data |
| `GET` | `/v1/models/{id}` | `GetModel` | Data |
| `POST` | `/v1/files` | `CreateFile` | Data |
| `GET` | `/v1/files` | `ListFiles` | Data |
| `GET` | `/v1/files/{id}` | `GetFile` | Data |
| `GET` | `/v1/files/{id}/content` | `GetFile` | Data |
| `DELETE` | `/v1/files/{id}` | `DeleteFile` | Data |
| `POST` | `/v1/skills` | `CreateSkill` | Data |
| `GET` | `/v1/skills` | `ListSkills` | Data |
| `GET` | `/v1/skills/{id}` | `GetSkill` | Data |
| `DELETE` | `/v1/skills/{id}` | `DeleteSkill` | Data |
| `POST` | `/v1/skills/{id}/versions` | `UpdateSkill` | Data |
| `GET` | `/v1/skills/{id}/versions` | `GetSkill` | Data |
| `GET` | `/v1/skills/{id}/versions/{version}` | `GetSkill` | Data |
| `GET` | `/v1/skills/{id}/versions/{version}/content` | `GetSkill` | Data |
| `DELETE` | `/v1/skills/{id}/versions/{version}` | `UpdateSkill` | Data |
| `POST` | `/v1/user_profiles` | `CreateUserProfile` | Data |
| `GET` | `/v1/user_profiles` | `ListUserProfiles` | Data |
| `GET` | `/v1/user_profiles/{id}` | `GetUserProfile` | Data |
| `POST` | `/v1/user_profiles/{id}` | `UpdateUserProfile` | Data |
| `DELETE` | `/v1/user_profiles/{id}` | `DeleteUserProfile` | Data |
| `POST` | `/v1/user_profiles/{id}/enrollment_url` | `CreateUserProfileEnrollmentUrl` | Data |
| `POST` | `/v1/organizations/workspaces` | `CreateWorkspace` | Management |
| `GET` | `/v1/organizations/workspaces` | `ListWorkspaces` | Management |
| `GET` | `/v1/organizations/workspaces/{id}` | `GetWorkspace` | Management |
| `POST` | `/v1/organizations/workspaces/{id}` | `UpdateWorkspace` | Management |
| `POST` | `/v1/organizations/workspaces/{id}/archive` | `ArchiveWorkspace` | Management |
| `POST` | `/v1/organizations/external_keys` | `RegisterKey` | Management |
| `GET` | `/v1/organizations/external_keys` | `ListKeys` | Management |
| `GET` | `/v1/organizations/external_keys/{id}` | `GetKey` | Management |
| `POST` | `/v1/organizations/external_keys/{id}` | `UpdateKey` | Management |
| `DELETE` | `/v1/organizations/external_keys/{id}` | `DisableKey` | Management |
| `POST` | `/v1/organizations/telemetry_destinations` | `CreateAccountTelemetryDestination` | Management |
| `GET` | `/v1/organizations/telemetry_destinations` | `ListAccountTelemetryDestinations` | Management |
| `GET` | `/v1/organizations/telemetry_destinations/{id}` | `GetAccountTelemetryDestination` | Management |
| `POST` | `/v1/organizations/telemetry_destinations/{id}` | `UpdateAccountTelemetryDestination` | Management |
| `DELETE` | `/v1/organizations/telemetry_destinations/{id}` | `DeleteAccountTelemetryDestination` | Management |
| `POST` | `/v1/organizations/telemetry_destinations/{id}/test` | `TestAccountTelemetryDestination` | Management |
| `GET` | `/v1/organizations/telemetry_destinations/{id}/workspaces` | `ListAccountTelemetryDestinationWorkspaces` | Management |
| `POST` | `/v1/organizations/telemetry_destinations/{id}/workspaces/{workspace_id}` | `AddTelemetryDestinationWorkspace` | Management |
| `DELETE` | `/v1/organizations/telemetry_destinations/{id}/workspaces/{workspace_id}` | `RemoveTelemetryDestinationWorkspace` | Management |
| `GET` | `/v1/compliance/activities` | `ListComplianceActivities` | Management |
| `POST` | `/v1/agents` | `CreateAgent` | Data |
| `GET` | `/v1/agents` | `ListAgents` | Data |
| `GET` | `/v1/agents/{id}` | `GetAgent` | Data |
| `POST` | `/v1/agents/{id}` | `UpdateAgent` | Data |
| `POST` | `/v1/agents/{id}/archive` | `ArchiveAgent` | Data |
| `GET` | `/v1/agents/{id}/versions` | `GetAgent` | Data |
| `POST` | `/v1/sessions` | `CreateSession` | Data |
| `GET` | `/v1/sessions` | `ListSessions` | Data |
| `GET` | `/v1/sessions/{id}` | `GetSession` | Data |
| `POST` | `/v1/sessions/{id}` | `UpdateSession` | Data |
| `POST` | `/v1/sessions/{id}/archive` | `ArchiveSession` | Data |
| `DELETE` | `/v1/sessions/{id}` | `DeleteSession` | Data |
| `GET` | `/v1/sessions/{id}/events` | `GetSession` | Data |
| `POST` | `/v1/sessions/{id}/events` | `UpdateSession` | Data |
| `GET` | `/v1/sessions/{id}/events/stream` | `GetSession` | Data |
| `GET` | `/v1/sessions/{id}/resources` | `GetSession` | Data |
| `GET` | `/v1/sessions/{id}/resources/{id}` | `GetSession` | Data |
| `POST` | `/v1/sessions/{id}/resources` | `UpdateSession` | Data |
| `POST` | `/v1/sessions/{id}/resources/{id}` | `UpdateSession` | Data |
| `DELETE` | `/v1/sessions/{id}/resources/{id}` | `UpdateSession` | Data |
| `POST` | `/v1/environments` | `CreateEnvironment` | Data |
| `GET` | `/v1/environments` | `ListEnvironments` | Data |
| `GET` | `/v1/environments/{id}` | `GetEnvironment` | Data |
| `POST` | `/v1/environments/{id}` | `UpdateEnvironment` | Data |
| `POST` | `/v1/environments/{id}/archive` | `ArchiveEnvironment` | Data |
| `DELETE` | `/v1/environments/{id}` | `DeleteEnvironment` | Data |
| `GET` | `/v1/environments/{id}/work` | `GetEnvironment` | Data |
| `GET` | `/v1/environments/{id}/work/poll` | `ProcessEnvironmentWork` | Data |
| `GET` | `/v1/environments/{id}/work/{work_id}` | `GetEnvironment` | Data |
| `GET` | `/v1/environments/{id}/work/stats` | `GetEnvironment` | Data |
| `POST` | `/v1/environments/{id}/work/{work_id}` | `ProcessEnvironmentWork` | Data |
| `POST` | `/v1/environments/{id}/work/{work_id}/ack` | `ProcessEnvironmentWork` | Data |
| `POST` | `/v1/environments/{id}/work/{work_id}/heartbeat` | `ProcessEnvironmentWork` | Data |
| `POST` | `/v1/environments/{id}/work/{work_id}/stop` | `ProcessEnvironmentWork` | Data |
| `POST` | `/v1/vaults` | `CreateVault` | Management |
| `GET` | `/v1/vaults` | `ListVaults` | Management |
| `GET` | `/v1/vaults/{id}` | `GetVault` | Management |
| `POST` | `/v1/vaults/{id}` | `UpdateVault` | Management |
| `POST` | `/v1/vaults/{id}/archive` | `ArchiveVault` | Management |
| `DELETE` | `/v1/vaults/{id}` | `DeleteVault` | Management |
| `GET` | `/v1/vaults/{id}/credentials` | `GetVault` | Management |
| `POST` | `/v1/vaults/{id}/credentials` | `UpdateVault` | Management |
| `GET` | `/v1/vaults/{id}/credentials/{id}` | `GetVault` | Management |
| `POST` | `/v1/vaults/{id}/credentials/{id}` | `UpdateVault` | Management |
| `POST` | `/v1/vaults/{id}/credentials/{id}/archive` | `UpdateVault` | Management |
| `DELETE` | `/v1/vaults/{id}/credentials/{id}` | `UpdateVault` | Management |
| `POST` | `/v1/memory_stores` | `CreateMemoryStore` | Data |
| `GET` | `/v1/memory_stores` | `ListMemoryStores` | Data |
| `GET` | `/v1/memory_stores/{id}` | `GetMemoryStore` | Data |
| `POST` | `/v1/memory_stores/{id}` | `UpdateMemoryStore` | Data |
| `POST` | `/v1/memory_stores/{id}/archive` | `ArchiveMemoryStore` | Data |
| `DELETE` | `/v1/memory_stores/{id}` | `DeleteMemoryStore` | Data |
| `POST` | `/v1/memory_stores/{id}/memories` | `UpdateMemoryStore` | Data |
| `GET` | `/v1/memory_stores/{id}/memories` | `GetMemoryStore` | Data |
| `GET` | `/v1/memory_stores/{id}/memories/{id}` | `GetMemoryStore` | Data |
| `POST` | `/v1/memory_stores/{id}/memories/{id}` | `UpdateMemoryStore` | Data |
| `DELETE` | `/v1/memory_stores/{id}/memories/{id}` | `UpdateMemoryStore` | Data |
| `GET` | `/v1/memory_stores/{id}/memory_versions` | `GetMemoryStore` | Data |
| `GET` | `/v1/memory_stores/{id}/memory_versions/{id}` | `GetMemoryStore` | Data |
| `POST` | `/v1/memory_stores/{id}/memory_versions/{id}/redact` | `UpdateMemoryStore` | Data |
| `GET` | `/v1/webhooks` | `ListWebhooks` | Management |
| `GET` | `/v1/webhooks/{id}` | `GetWebhook` | Management |
| `POST` | `/v1/webhooks` | `CreateWebhook` | Management |
| `POST` | `/v1/webhooks/{id}` | `UpdateWebhook` | Management |
| `DELETE` | `/v1/webhooks/{id}` | `DeleteWebhook` | Management |
| `POST` | `/v1/webhooks/{id}/regenerate_signing_secret` | `RotateWebhookSecret` | Management |

| Method | Route | IAM action | CloudTrail event type |
| --- | --- | --- | --- |
| `GET` | `/v1/organizations/analytics/usage` | `ListAccountUsage` | Data |
| `GET` | `/v1/organizations/analytics/cost` | `ListAccountCost` | Data |

Routes not in these tables are not available on Claude Platform on AWS. The gateway denies any route not listed here by default.

## Managed policies

AWS provides five managed policies for Claude Platform on AWS. All managed policies apply to `Resource: "*"`.

| Policy | Grants |
| --- | --- |
| `AnthropicFullAccess` | `aws-external-anthropic:*` |
| `AnthropicReadOnlyAccess` | `Get*`, `List*`, `CallWithBearerToken` |
| `AnthropicInferenceAccess` | `Get*`, `List*`, `CreateInference`, `CreateBatchInference`, `CancelBatchInference`, `DeleteBatchInference`, `CountTokens`, `CallWithBearerToken` |
| `AnthropicLimitedAccess` | All `AnthropicInferenceAccess` actions, plus all Claude Managed Agents actions (agents, sessions, environments, vaults, memory stores, webhooks, and self-hosted environment work) |
| `AnthropicSelfHostedEnvironmentAccess` | `GetEnvironment`, `ProcessEnvironmentWork`, `GetSession`, `UpdateSession`, `GetSkill`, `CallWithBearerToken` |

`AnthropicInferenceAccess` is the narrowest managed policy sufficient to run inference. It covers both synchronous and batch inference and, through the `Get*` and `List*` wildcards, grants read access to every API resource in the namespace, including Claude Managed Agents (CMA) resources (agents, sessions, environments, vaults, memory stores, and webhooks). This includes file content download through `GetFile` (see the [Files](#files) note), skill content download through `GetSkill` (see the [Skills](#skills) note), and memory contents through `GetMemoryStore`. Vault credential secrets and webhook signing secrets are not exposed: those fields are write-only and are never returned by `GetVault` or `GetWebhook` (see [Authenticate with vaults](https://platform.claude.com/docs/en/managed-agents/vaults)). `AnthropicInferenceAccess` does not grant file creation or deletion, skill management, user profile management, workspace mutation, encryption key management, telemetry destination management, or any Claude Managed Agents write action (create, update, archive, delete, process, or rotate). To exclude CMA reads, replace `AnthropicInferenceAccess` with a custom policy that enumerates only the specific non-CMA actions you need.

`AnthropicLimitedAccess` includes all Claude Managed Agents actions in addition to inference actions.

`AnthropicSelfHostedEnvironmentAccess` is the narrowest managed policy sufficient to run a [self-hosted sandbox](https://platform.claude.com/docs/en/managed-agents/self-hosted-sandboxes) worker. Attach it to the principal your environment worker authenticates as.

`AssumeConsole` is not included in `AnthropicReadOnlyAccess`, `AnthropicInferenceAccess`, `AnthropicLimitedAccess`, or `AnthropicSelfHostedEnvironmentAccess`. Principals who need Claude Console access require either `AnthropicFullAccess` or a custom policy that grants `aws-external-anthropic:AssumeConsole`. See [Console access](#console-access).

## Example policies

### Synchronous inference on a single workspace

Grants the minimal permissions for an IAM principal that runs inference against one production workspace:

### Per-customer workspace isolation

Restricts a role to a single workspace:

### Feature lockdown for a ZDR-sensitive workspace

Blocks batch processing and file upload on a specific workspace while leaving synchronous inference available. Useful when a workspace handles [Zero Data Retention (ZDR)](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention) data that must not persist server-side. Attach this policy alongside an Allow policy such as `AnthropicInferenceAccess` or the [single-workspace example](#synchronous-inference-on-a-single-workspace); on its own, a Deny-only policy grants no permissions:

### Provisioning automation

Grants a CI/CD role the actions needed to create and manage workspaces, without any inference permissions:

`CreateWorkspace` and `ListWorkspaces` are account-scoped operations. Specifying a workspace ARN on these actions has no effect; use `Resource: "*"`.

## See also

-   [Claude Platform on AWS](https://platform.claude.com/docs/en/build-with-claude/claude-platform-on-aws) for setup, authentication, and platform overview
-   [AWS IAM User Guide](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html) for IAM policy syntax and evaluation logic
-   [AWS CloudTrail User Guide](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/) for audit logging configuration
