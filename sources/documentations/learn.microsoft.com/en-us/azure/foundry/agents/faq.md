---
title: "Foundry Agent Service frequently asked questions - Microsoft Foundry"
source_url: "https://learn.microsoft.com/en-us/azure/foundry/agents/faq"
crawled_at: "2026-06-27T11:25:49.106Z"
---

Find answers to common questions about Foundry Agent Service.

If you can't find answers to your questions in this article and you still need help, see [Foundry Tools support and help options](https://learn.microsoft.com/en-us/azure/ai-services/cognitive-services-support-options). Foundry Agent Service is part of Foundry Tools.

For getting started, see:

-   [What is Foundry Agent Service?](https://learn.microsoft.com/en-us/azure/foundry/agents/overview)
-   [Set up your environment](https://learn.microsoft.com/en-us/azure/foundry/agents/environment-setup)
-   [Quotas and limits](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/limits-quotas-regions)

**Basic setup** stores agent state in Microsoft-managed resources.

**Standard setup** stores agent data (threads, files, and vector stores) in your Azure resources that you connect through capability hosts.

To compare setup options and choose the right one, see [Set up your environment](https://learn.microsoft.com/en-us/azure/foundry/agents/environment-setup#choose-your-setup) and [Capability hosts](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/capability-hosts).

Role requirements depend on what you're doing. Common roles include:

-   **Foundry Account Owner**: Create accounts and projects
-   **Foundry User**: Create and edit agents
-   **Role Based Access Control Administrator** (or **Owner**): Required for standard setup to assign roles to connected resources

For standard setup, you also need the `Microsoft.Authorization/roleAssignments/write` permission.

For complete role requirements, see [Required permissions](https://learn.microsoft.com/en-us/azure/foundry/agents/environment-setup#required-permissions) and [Role-based access control (RBAC) in Microsoft Foundry](https://learn.microsoft.com/en-us/azure/foundry/concepts/rbac-foundry).

Yes. Foundry Agent Service is a stateful API, which means that it retains data. Two types of data are stored in the Foundry Agent Service API:

-   **Stateful entities**: Conversations and responses created during usage.
-   **Files and vector stores**: Data uploaded during Foundry Agent Service setup or as part of a response generation.

To learn how conversations and responses work, see [Agent runtime components](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/runtime-components).

-   **Basic setup**: Data is stored in a secure, Microsoft-managed storage account that's logically separated.
-   **Standard setup**: Data is stored in your own Azure resources, so you have full ownership and control:
    -   **Azure Storage**: Files and attachments
    -   **Azure Cosmos DB**: Threads and conversation history
    -   **Azure AI Search**: Vector stores

To learn about setup options that control where data is stored, see [Set up your environment](https://learn.microsoft.com/en-us/azure/foundry/agents/environment-setup#choose-your-setup).

Data persists unless you explicitly delete it. To delete agent data, use the API or SDK to delete threads, files, or vector stores.

For concepts and terminology (for example, conversation and response), see [Agent runtime components](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/runtime-components).

-   Basic setup supports Microsoft-managed keys only.
-   Standard setup supports customer-managed keys (CMKs).

No, Microsoft doesn't use your data for training models. For more information, see the [Responsible AI documentation](https://learn.microsoft.com/en-us/azure/ai-foundry/responsible-ai/openai/data-privacy).

Foundry Agent Service endpoints are regional, and data is stored in the same region as the endpoint. For more information, see the [Azure data residency documentation](https://azure.microsoft.com/explore/global-infrastructure/data-residency/#overview).

-   You're charged for inference cost (input and output) of the base model that you're using for each agent (for example, gpt-4-0125). If you created multiple agents, you're charged for the base model attached to each agent.
    
-   If you enabled the Code Interpreter tool, you're charged for its use per session. For example, if your agent calls Code Interpreter simultaneously in two threads, this activity creates two Code Interpreter sessions. Each of those sessions is charged.
    
    By default, each session is active for one hour. If your user keeps giving instructions to Code Interpreter in the same thread for up to one hour, you pay this fee only once.
    
-   File search is billed based on the vector storage that you use.
    

For more information, see the [pricing page](https://azure.microsoft.com/pricing/details/ai-foundry/).

No. All [quotas](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/limits-quotas-regions) apply to using models with Foundry Agent Service.

Start with [Tools overview](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/tool-catalog), then see the tool-specific guidance:

Use capability hosts and connect your own resources.

-   Concepts: [Capability hosts](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/capability-hosts)
-   How-to: [Use your own resources](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/use-your-own-resources)

To understand usage and monitoring options, see [Metrics](https://learn.microsoft.com/en-us/azure/foundry/observability/how-to/how-to-monitor-agents-dashboard) and [Monitor the service](https://learn.microsoft.com/en-us/azure/foundry/observability/how-to/how-to-monitor-agents-dashboard).

Agent Service BCDR guidance depends on your setup and the resources you provision. For the current guidance, see [Foundry Agent Service disaster recovery](https://learn.microsoft.com/en-us/azure/foundry/how-to/agent-service-disaster-recovery).

Virtual networks help secure inbound and outbound access to your Azure resources. You achieve network isolation through virtual network integrations in Azure.

For Agent Service private networking requirements and limitations, see [How to use a virtual network with Foundry Agent Service](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/virtual-networks).

Agent Service networking uses Azure Container Apps. When you deploy into your virtual network, you must use a dedicated subnet delegated to `Microsoft.App/environments`.

For details, see [How to use a virtual network with Foundry Agent Service](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/virtual-networks) and [Virtual network configuration](https://learn.microsoft.com/en-us/azure/container-apps/custom-virtual-networks?tabs=workload-profiles-env#subnet).

Region availability for virtual network isolation can change. For the current supported regions and limitations, see [How to use a virtual network with Foundry Agent Service](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/virtual-networks).

Only private IP ranges are supported:

-   **Class A**: 10.0.0.0/8
-   **Class B**: 172.16.0.0/12
-   **Class C**: 192.168.0.0/16

Public IP ranges aren't supported for agent subnets.

The recommended delegated agent subnet size is /24. The minimum is /27.

For sizing guidance and how IPs are consumed, see [How to use a virtual network with Foundry Agent Service](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/virtual-networks) and [Virtual network configuration](https://learn.microsoft.com/en-us/azure/container-apps/custom-virtual-networks?tabs=workload-profiles-env#subnet).

As long as the agent subnet and private endpoints have address space, the address range for virtual networks can be anything.

Yes. The virtual network is in your subscription, and you should be able to peer with any virtual network. But data transfer is costly, so we don't recommend it. The requirement is that all resources must be in the same region as the Microsoft Foundry resource.

Yes. Allow the required fully qualified domain names (FQDNs) for managed identity as described in [Use Azure Firewall with Azure Container Apps](https://learn.microsoft.com/en-us/azure/container-apps/use-azure-firewall), or allow the `AzureActiveDirectory` service tag.

For Agent Service private networking guidance, see [How to use a virtual network with Foundry Agent Service](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/virtual-networks).

Yes, multiple Microsoft Foundry resources can reuse the same virtual network. However, each Foundry resource requires its own dedicated agent runtime subnet—the agent subnet can't be shared across multiple Foundry resources.

They don't need to be in the same resource group, but they do need to be in the same region.

If you're using a network-secured setup, some tools require additional configuration, such as private endpoints and resource connections.

For the current guidance and limitations, see [How to use a virtual network with Foundry Agent Service](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/virtual-networks).
