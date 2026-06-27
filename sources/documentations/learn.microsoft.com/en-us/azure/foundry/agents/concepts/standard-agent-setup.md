---
title: "Set up standard agent resources for Foundry Agent Service - Microsoft Foundry"
source_url: "https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/standard-agent-setup"
crawled_at: "2026-06-27T11:30:13.257Z"
---

Standard agent setup uses customer-managed, single-tenant Azure resources to store agent state and keep all agent data under your control. Use standard setup when you need full data sovereignty, compliance with enterprise security policies, or project-level isolation.

In this setup:

-   Agent states (conversations, responses) are stored in your own Azure resources.
-   You maintain complete control over data residency and access.

Tip

For a simpler setup that uses Microsoft-managed resources, see [Environment setup](https://learn.microsoft.com/en-us/azure/foundry/agents/environment-setup) and choose the basic agent setup option.

-   An Azure subscription. [Create one for free](https://azure.microsoft.com/pricing/purchase-options/azure-account?cid=msft_learn_c1076bd4-e8c7-a630-53dc-6e0284f45ed9).
-   An [Azure Cosmos DB for NoSQL](https://learn.microsoft.com/en-us/azure/cosmos-db/nosql/) account. For throughput requirements, see [Cosmos DB throughput requirements](#cosmos-db-throughput-requirements).
-   An [Azure Storage](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-overview) account.
-   An [Azure AI Search](https://learn.microsoft.com/en-us/azure/search/search-what-is-azure-search) resource.
-   An [Azure Key Vault](https://learn.microsoft.com/en-us/azure/key-vault/general/overview) resource for secrets management.
-   Azure CLI version 2.50 or later. Run `az --version` to verify.
-   Sufficient permissions to assign roles. You need the **Owner** or **User Access Administrator** role on the resource group.
-   A deployed agent-compatible model (for example, gpt-4o).

Important

**Standard setups require you to Bring Your Own (BYO) resources so that all agent data stays in your Azure tenant:**

| Resource | What it stores |
| --- | --- |
| **Azure Storage** (BYO File Storage) | Files uploaded by developers and end-users |
| **Azure AI Search** (BYO Search) | Vector stores created by the agent |
| **Azure Cosmos DB** (BYO Thread Storage) | Messages, conversation history, and agent metadata |

All data processed by Foundry Agent Service is automatically stored at rest in these resources, helping you meet compliance requirements and enterprise security standards.

Your Azure Cosmos DB for NoSQL account must have a total throughput limit of at least **3000 RU/s**. Both **Provisioned Throughput** and **Serverless** modes are supported.

The **Standard setup** provisions **five containers**, each requiring **1000 RU/s**:

| Container | Purpose |
| --- | --- |
| `thread-message-store` | End-user conversations |
| `system-thread-message-store` | Internal system messages |
| `agent-entity-store` | Agent metadata (instructions, tools, name) |
| `agent-definitions-v1` | Agent metadata (instructions, tools, name, versions) |
| `run-state-v1` | Internal messages and end-user conversations |

`thread-message-store`, `system-thread-message-store`, and `agent-entity-store` are part of the **Foundry Agent Service (Classic)** Standard Setup.

**Foundry Agent Service (New)** uses **`agent-definitions-v1`** and **`run-state-v1`**.

The older containers belong to the **Classic** experience and are not used by the new runtime.

Warning

The **Classic** and **New** Foundry Agent Service runtimes use **different Cosmos DB containers**.

Standard setup enforces project-level data isolation by default. Two blob storage containers are automatically provisioned in your storage account: one for files and one for intermediate system data (chunks, embeddings). Three containers are provisioned in your Cosmos DB account: one for user threads, one for system messages, and one for agent configuration data such as instructions, tools, and names. This default behavior reduces setup complexity while still enforcing strict data boundaries between projects.

[Capability hosts](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/capability-hosts) are sub-resources on both the account and the project that enable interaction with Agent Service.

-   **Account capability host**: Has an empty request body except for the parameter `capabilityHostKind="Agents"`.
-   **Project capability host**: Specifies resources for storing agent state, either Microsoft-managed multitenant (basic setup) or customer-owned (standard setup) single-tenant resources. The project capability host functions as the project settings.

-   You can't update the capability host after it's set for a project or account.

Follow these steps to manually provision all resources needed for standard agent setup. Allow approximately 30-45 minutes for the full provisioning process.

1.  Create or reuse the following resources. You can create new resources or pass in the resource ID of existing ones:
    -   Azure Cosmos DB for NoSQL account
    -   Azure Storage account
    -   Azure AI Search resource
    -   Azure Key Vault resource (used for managing secrets and connection strings for the agent infrastructure)
    -   \[Optional\] Azure Application Insights resource
    -   \[Optional\] Existing Foundry resource

2.  Create a Microsoft Foundry resource.
3.  Create account-level connections:
    -   Create an account connection to the Application Insights resource.
4.  Deploy gpt-4o or another agent-compatible model.
5.  Create a project.
6.  Create project connections:
    -   \[If provided\] Project connection to the Foundry resource.
    -   Project connection to the Azure Storage account.
    -   Project connection to the Azure AI Search resource.
    -   Project connection to the Cosmos DB account.

The project managed identity includes both System-assigned Managed Identity (SMI) and User-assigned Managed Identity (UMI).

7.  Assign the project managed identity (for SMI) the following roles:
    -   **Cosmos DB Operator** at the account level for the Cosmos DB resource.
    -   **Storage Account Contributor** at the account level for the Storage Account resource.

8.  Set the account capability host with an empty properties section.
9.  Set the project capability host with Cosmos DB, Azure Storage, and AI Search connections.

10.  Assign the project managed identity (both SMI and UMI) the following roles on the specified resource scopes:
     -   **Azure AI Search** (assign either before or after capability host creation):
         -   Search Index Data Contributor
         -   Search Service Contributor
     -   **Azure Blob Storage Container**: `<workspaceId>-azureml-blobstore`
         -   Storage Blob Data Contributor
     -   **Azure Blob Storage Container**: `<workspaceId>-agents-blobstore`
         -   Storage Blob Data Owner
     -   **Cosmos DB for NoSQL Database**: `enterprise_memory`
         -   Cosmos DB Built-in Data Contributor
         -   Scope: Database level to cover all containers (no individual container-specific role assignment is needed).

11.  Assign all developers who need to create or edit agents in the project the **Foundry User** role on the project scope.

Important

The Foundry RBAC roles were recently renamed. **Foundry User**, **Foundry Owner**, **Foundry Account Owner**, and **Foundry Project Manager** were previously named Azure AI User, Azure AI Owner, Azure AI Account Owner, and Azure AI Project Manager. You might still see the previous names in some places while the rename rolls out. The role IDs and core permissions are unchanged by the rename.

Use an existing Azure OpenAI, Azure Storage account, Azure Cosmos DB for NoSQL account, or Azure AI Search resource by providing the full Azure Resource Manager (ARM) resource ID in the [standard agent template file](https://github.com/microsoft-foundry/foundry-samples/blob/main/infrastructure/infrastructure-setup-bicep/43-standard-agent-setup-with-customization/main.bicep).

1.  Follow the steps in [Environment setup](https://learn.microsoft.com/en-us/azure/foundry/agents/environment-setup) to get the Foundry Tools account resource ID.
    
2.  In the standard agent template file, replace the following placeholder:
    
    ```
    existingAoaiResourceId:/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.CognitiveServices/accounts/{serviceName}
    ```
    

1.  Sign in to the Azure CLI and select the subscription with your storage account:
    
    ```
    az login
    ```
    
2.  Run the following command to get your storage account resource ID:
    
    ```
    az storage account show --resource-group <your-resource-group> --name <your-storage-account> --query "id" --output tsv
    ```
    
    The output is the `aiStorageAccountResourceID` value you need in the template.
    
3.  In the standard agent template file, replace the following placeholder:
    
    ```
    aiStorageAccountResourceId:/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Storage/storageAccounts/{storageAccountName}
    ```
    

An Azure Cosmos DB for NoSQL account is created for each Foundry account. For throughput requirements and multi-project scaling, see [Cosmos DB throughput requirements](#cosmos-db-throughput-requirements).

Note

Insufficient RU/s capacity in the Cosmos DB account results in capability host provisioning failures during deployment.

1.  Sign in to the Azure CLI and select the subscription with your Cosmos DB account:
    
    ```
    az login
    ```
    
2.  Run the following command to get your Azure Cosmos DB account resource ID:
    
    ```
    az cosmosdb show --resource-group <your-resource-group> --name <your-cosmosdb-account> --query "id" --output tsv
    ```
    
    The output is the `cosmosDBResourceId` value you need in the template.
    
3.  In the standard agent template file, replace the following placeholder:
    
    ```
    cosmosDBResourceId:/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.DocumentDB/databaseAccounts/{cosmosDbAccountName}
    ```
    

1.  Sign in to the Azure CLI and select the subscription with your search resource:
    
    ```
    az login
    ```
    
2.  Run the following command to get your Azure AI Search resource ID:
    
    ```
    az search service show --resource-group <your-resource-group> --name <your-search-service> --query "id" --output tsv
    ```
    
3.  In the standard agent template file, replace the following placeholder:
    
    ```
    aiSearchServiceResourceId:/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Search/searchServices/{searchServiceName}
    ```
    

After you complete provisioning, verify the setup is working correctly:

1.  In the Azure portal, navigate to your Foundry project and confirm that all connections (Storage, Cosmos DB, AI Search) appear under the project settings.
2.  Check that the capability host status shows as **Succeeded** for both the account and project.
3.  Verify role assignments by navigating to each resource's **Access control (IAM)** page and confirming the project managed identity has the expected roles.
4.  Create a test agent to confirm end-to-end functionality.

| Symptom | Cause | Resolution |
| --- | --- | --- |
| `CapabilityHostProvisioningFailed` or capability host status shows **Failed** | Insufficient Cosmos DB throughput | Ensure your Cosmos DB account has at least 3000 RU/s (1000 RU/s per container × 3 containers). For multiple projects, multiply by the number of projects. |
| `403 Forbidden` when the agent reads or writes files | Missing storage role assignments | Verify the project managed identity has **Storage Blob Data Contributor** on the `<workspaceId>-azureml-blobstore` container and **Storage Blob Data Owner** on the `<workspaceId>-agents-blobstore` container. |
| `SearchIndexNotFound` or `403` on search operations | Missing search roles | Confirm that the project managed identity has both **Search Index Data Contributor** and **Search Service Contributor** on your Azure AI Search resource. |
| `AuthorizationFailed` when creating or editing agents | Missing user role | Assign the **Foundry User** role to the developer on the project scope. |
| Update request to capability host returns `400 BadRequest` | Update not supported | Capability hosts can't be updated after creation. Delete and recreate the project if configuration changes are needed. |

-   [Set up your environment for Foundry Agent Service](https://learn.microsoft.com/en-us/azure/foundry/agents/environment-setup)
-   [Capability hosts](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/capability-hosts)
-   [Standard agent setup Bicep template](https://github.com/microsoft-foundry/foundry-samples/blob/main/infrastructure/infrastructure-setup-bicep/43-standard-agent-setup-with-customization/main.bicep)
