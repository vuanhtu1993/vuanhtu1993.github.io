---
title: "Microsoft Agent 365 integration with Foundry - Microsoft Foundry"
source_url: "https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/agent-365-integration"
crawled_at: "2026-06-27T11:30:46.518Z"
---

[Microsoft Agent 365](https://learn.microsoft.com/en-us/microsoft-agent-365/overview) is Microsoft's enterprise control plane for AI agents. It treats agents as first-class Microsoft Entra identities through Entra Agent ID. This identity model lets organizations apply authentication, authorization, and lifecycle governance directly to agent identity objects. Agent 365 gives IT teams a single place to observe, govern, and secure every agent across an organization, regardless of where that agent was built or acquired. Microsoft Foundry agents integrate with Agent 365 so organizations can apply consistent identity, security, and lifecycle management policies to agents built in Foundry.

This article explains what Agent 365 provides, how it connects to Foundry, and how data flows between the two platforms. It also explains when you need additional setup for hosted agent telemetry.

Agent 365 is built on five pillars:

| Capability | Description |
| --- | --- |
| **Registry** | Provides a complete inventory of all agents in the organization, including agents built in Foundry and Copilot Studio, agents registered by administrators, and shadow agents discovered in the tenant. The registry also tracks ownership details that support governance and attestation workflows. |
| **Access control** | Brings agents under management and limits access to only required resources by using Microsoft Entra identity-based authorization. Supports role-based and attribute-based access control (RBAC and ABAC), plus risk-based Conditional Access policies. |
| **Visualization** | Enables organizations to explore connections between agents, people, and data, and to monitor agent behavior and performance in real time. |
| **Interoperability** | Equips agents with access to Microsoft 365 apps and organizational data so they can participate in real workflows. Agents can also connect to Work IQ for organizational context. |
| **Security** | Protects agents from threats and vulnerabilities through Microsoft Defender for threat detection and behavior monitoring, and Microsoft Purview for data protection and compliance controls on agent activity and data. |

For the full list of Agent 365 capabilities and prerequisites, see the [Agent 365 overview](https://learn.microsoft.com/en-us/microsoft-agent-365/overview).

With the Entra Agent ID model, organizations can apply governance workflows such as periodic access reviews, lifecycle policies for provisioning and deprovisioning, and owner attestation for high-impact agents.

Foundry and Agent 365 connect in two ways:

-   **Automatic registry sync** — Published Foundry agents automatically appear in the Agent 365 registry when subscribed. This gives IT administrators a single pane of glass for agent inventory without manual registration.
    
-   **Autopilot publishing** — Foundry Hosted agents can be published as _autopilots_ to Agent 365. An autopilot is an agent that acts autonomously on behalf of a user and receives its own Microsoft Entra Agent ID. After publishing and admin approval, the autopilot appears in the Agent 365 registry and can be connected to Microsoft Teams and other Microsoft 365 surfaces.
    

For step-by-step instructions on publishing a Foundry agent to Agent 365, see [Publish an agent as an autopilot in Agent 365](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/agent-365).

Not all Foundry agent types support the full set of Agent 365 integration features. The following table summarizes current support:

| Agent type | Registry sync | Autopilot publishing | Activity data collection |
| --- | --- | --- | --- |
| **[Prompt agent](https://learn.microsoft.com/en-us/azure/foundry/agents/quickstarts/prompt-agent)** | ✅ | ✅ | ✅ |
| **[Hosted agent](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/hosted-agents)** | ✅ | ✅ | Supported using A365 SDK |
| **[Workflow agent](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/workflow)** | ✅ | ❌ | ❌ |

Hosted agent telemetry export requires explicit configuration in your hosted agent and Microsoft Entra permissions for the Agent 365 observability service. For the procedure, see [Grant Agent 365 observability permissions](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/grant-agent-365-permissions).

Before Foundry can send agent activity data to Agent 365, your organization must complete two steps:

1.  **Obtain a license** — Your tenant needs at least one Microsoft 365 Copilot license and enrollment in the [Frontier preview program](https://adoption.microsoft.com/copilot/frontier-program/). For licensing details and enrollment FAQs, see [Agent 365 prerequisites](https://learn.microsoft.com/en-us/microsoft-agent-365/overview#prerequisites).
    
2.  **Enable Agent 365 and accept terms** — A global administrator signs into the [Microsoft 365 admin center](https://admin.microsoft.com/), and selects which users or groups get access. The administrator is prompted to agree to the terms of service before Agent 365 is activated. For the full walkthrough, see [Enable Agent 365](https://learn.microsoft.com/en-us/microsoft-agent-365/overview#enable-agent-365).
    

Both steps are required before any data flows from Foundry to Agent 365, even if the Azure Resource Manager properties on a Foundry resource are set to enabled for A365.

After these steps are complete, agent activity data from Foundry is ingested into the Agent 365 control plane, powering the registry, analytics dashboards, and security features. Logging options are controlled per Foundry resource through the `agent365Config` resource provider configuration. For details on how logging works and how to opt out, see [Configure Agent 365 data collection for Microsoft Foundry](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/configure-agent-365-data-collection).

Note

Even if the logging property is set to enabled on a Foundry resource, no data is ingested unless your tenant has a valid Agent 365 license and the administrator has accepted the Agent 365 terms of service.

Microsoft Foundry and Agent 365 follow different data residency models, hence data processing and storage may happen across geographical regions.

| Platform | Data residency model |
| --- | --- |
| **Microsoft Foundry** | Data residency follows the **Azure region** you select when creating the Foundry resource. All agent data, model deployments, and logs are stored in the resource region. |
| **Microsoft Agent 365** | Data residency follows the **storage location of the Microsoft Entra tenant**. Agent inventory, analytics, and governance data are stored in the geography associated with the tenant. |

When agent activity data flows from Foundry into Agent 365, it moves from the Azure region-based residency model to the Entra tenant residency model. For workloads with specific data residency requirements, you can opt out individual Foundry resources from Agent 365 data collection while keeping other resources enabled.

This lets you restrict data flows where compliance regulations may require it. For details, see [Configure Agent 365 data collection for Microsoft Foundry](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/configure-agent-365-data-collection).

-   [Configure Agent 365 data collection for Microsoft Foundry](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/configure-agent-365-data-collection)
-   [Publish an agent as an autopilot in Agent 365](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/agent-365)
-   [Grant Agent 365 observability permissions](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/grant-agent-365-permissions)
