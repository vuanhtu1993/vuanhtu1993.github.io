---
title: "Set up private networking for Foundry Agent Service - Microsoft Foundry"
source_url: "https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/virtual-networks?tabs=portal&pivots=templates"
crawled_at: "2026-06-27T11:30:28.766Z"
---

For background on the network architecture, subnet sizing, and IP allocation model behind these steps, see [Deep dive into Foundry Agent Service networking](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/agents-networking-deep-dive).

This article describes two approaches. Use the **Portal or templates** path to provision a network-secured Foundry environment with Bicep or Terraform. Use the **Azure Developer CLI** path to place the dependencies of an `azd` hosted agent project behind private endpoints. Choose a method with the selector.

Foundry Agent Service offers a **Standard Setup with private networking** environment. This setup creates an isolated network environment that enables secure access to data while maintaining full control over your network infrastructure.

By default, the Standard Setup with private networking ensures:

-   **No public egress**: Foundational infrastructure provides the right authentication and security for your agents and tools, without requiring trusted service bypass.
-   **Subnet integration**: You provide a delegated subnet from your virtual network. The platform connects agent compute to this subnet, enabling local communication with your Azure resources within the same virtual network.
-   **Private resource access**: If your resources are marked as private and nondiscoverable from the internet, the platform network can still access them when the necessary credentials and authorization are in place.

If you don't have an existing virtual network, the Standard Setup with private networking flow can provision the necessary network infrastructure for you.

-   An Azure subscription - [Create one for free](https://azure.microsoft.com/pricing/purchase-options/azure-account?cid=msft_learn_568f7129-6157-7913-2d05-dba1eeadd6fe).
    
-   Ensure that the individual creating the account and project has the **Foundry Account Owner** role at the subscription scope.
    
    Important
    
    The Foundry RBAC roles were recently renamed. **Foundry User**, **Foundry Owner**, **Foundry Account Owner**, and **Foundry Project Manager** were previously named Azure AI User, Azure AI Owner, Azure AI Account Owner, and Azure AI Project Manager. You might still see the previous names in some places while the rename rolls out. The role IDs and core permissions are unchanged by the rename.
    
-   The user creating this setup must also have permissions to assign roles to required resources (Azure Cosmos DB, Azure AI Search, Azure Storage).
    
    -   The built-in role needed is **Role Based Access Administrator**.
    -   Alternatively, having the **Owner** role at the subscription level also satisfies this requirement.
    -   The key permission needed is: `Microsoft.Authorization/roleAssignments/write`
-   [Python 3.9 or later](https://www.python.org/)
    
-   Once the agent environment is configured, ensure that each team member who wants to use the Agent Playground or SDK to create or edit agents has been assigned the built-in **Foundry User** [RBAC role](https://learn.microsoft.com/en-us/azure/foundry/concepts/rbac-foundry) for the project.
    
    -   The minimum set of permissions required is: **agents/\*/read**, **agents/\*/action**, **agents/\*/delete**
-   Register providers. The following providers must be registered:
    
    -   `Microsoft.KeyVault`
    -   `Microsoft.CognitiveServices`
    -   `Microsoft.Storage`
    -   `Microsoft.MachineLearningServices`
    -   `Microsoft.Search`
    -   `Microsoft.Network`
    -   `Microsoft.App`
    -   `Microsoft.ContainerService`
    -   To use Bing Search tool: `Microsoft.Bing`
    
    ```
       az provider register --namespace 'Microsoft.KeyVault'
       az provider register --namespace 'Microsoft.CognitiveServices'
       az provider register --namespace 'Microsoft.Storage'
       az provider register --namespace 'Microsoft.MachineLearningServices'
       az provider register --namespace 'Microsoft.Search'
       az provider register --namespace 'Microsoft.Network'
       az provider register --namespace 'Microsoft.App'
       az provider register --namespace 'Microsoft.ContainerService'
       # only to use Grounding with Bing Search tool
       az provider register --namespace 'Microsoft.Bing'
    ```
    

Important

**Standard setups require you to Bring Your Own (BYO) resources so that all agent data stays in your Azure tenant.**

BYO resources include: Azure Storage, Azure AI Search, and Azure Cosmos DB.

All data processed by Foundry Agent Service is automatically stored at rest in these resources, helping you meet compliance requirements and enterprise security standards.

You can create this setup in the Azure portal or deploy it by using Bicep or Terraform.

At a high level, the deployment involves these steps:

1.  Choose the target Azure region for your Foundry resources.
2.  Decide whether to bring your own VNet and subnet, or use auto-provisioned networking.
3.  If you bring your own VNet, gather your VNet and subnet resource IDs.
4.  Create the setup in the Azure portal, or deploy it by using Bicep or Terraform.
5.  Verify the deployment (see [Verify the deployment](#verify-the-deployment)).

The setup provisions the following resources (unless you bring your own):

-   A Foundry account and Foundry project.
-   A gpt-4o model deployment.
-   Azure Storage, Azure Cosmos DB, and Azure AI Search for storing files, threads, and vector data.
-   These resources are connected to your project.
-   Microsoft-managed encryption keys for Storage Account and Cognitive Account (Foundry) are used by default.

Select your preferred deployment method by using the following tabs:

-   [Azure portal](#tabpanel_1_portal)
-   [Templates](#tabpanel_1_templates)

1.  From the [Azure portal](https://portal.azure.com/), search for **Foundry** and select **Create a resource**.
2.  After configuring the **Basics** tab, select the **Storage** tab and then select **Select resources** under **Agent service**.
    -   Select or create a Storage account, Azure AI Search resource, and Azure Cosmos DB resource. If you're using virtual network injection, you must bring your own Storage, Azure AI Search, and Azure Cosmos DB resources to create a Standard Agent with end-to-end virtual network isolation.
3.  After configuring the **Storage** tab, select the **Network** tab and then select the **Disabled** option for public access.
4.  In the **Private endpoint** section, select **\+ Add private endpoint**.
5.  When you go through the forms to create a private endpoint, be sure to:
    
    -   From **Basics**, select the same **Region** as your virtual network.
    -   From the **Virtual Network** form, select the virtual network and subnet that you want to connect to.
    
    Note
    
    In the portal UI, the target to which you create the private endpoint should be labeled as an "account". Select your Foundry resource when prompted.
    
6.  After setting your inbound private endpoint, a new dropdown appears for setting **Virtual network injection**. Select your **virtual network** in the first dropdown, then select your **subnet** that is delegated to **Microsoft.App/environments** with a subnet size of /27 or larger. This delegation and subnet size are required for the injection.
7.  Continue through the forms to create the project. When you reach the **Review + create** tab, review your settings and select **Create** to create the project.
8.  Continue with the checks in [Verify the deployment](#verify-the-deployment).

Note

Private endpoints to Azure AI Search, Azure Storage, and Azure Cosmos DB are NOT auto-created when you deploy your Foundry resource. Please ensure to create private endpoints to these resources separately in their resource pages in the Azure portal.

After deployment finishes, verify that all resources are configured correctly:

1.  **Confirm subnet delegation**: In the Azure portal, navigate to your VNet > **Subnets** and verify the agent subnet shows delegation to `Microsoft.App/environments`.
2.  **Check public network access**: Open each resource (Foundry, Azure AI Search, Azure Storage, Azure Cosmos DB) and confirm **Public network access** is set to **Disabled**.
3.  **Validate private endpoint DNS resolution**: From a machine connected to the VNet, run `nslookup` against each endpoint listed in the [DNS zone configurations summary](#dns-zone-configurations-summary). Verify that each name resolves to a private IP address (10.x, 172.16-31.x, or 192.168.x).
4.  **Test agent connectivity**: Access your Foundry project from within the VNet (see [Access your secured agents](#access-your-secured-agents)) and confirm you can create and run an agent.
5.  **Configure Role assignments**: Run the following commands to assign the required roles. The first grants Managed Identity Operator on the user-assigned managed identity, and the second grants Network Contributor on the remote VNet for cross-tenant access.

```
az role assignment create \
   --assignee <your-principal-id> \
   --role "Managed Identity Operator" \
   --scope "/subscriptions/<subscription-id>/resourceGroups/<resource-group>/providers/Microsoft.ManagedIdentity/userAssignedIdentities/<id>"
```

```
 az role assignment create \
   --assignee <service-principal-object-id-in-remote-tenant> \
   --role "Network Contributor" \
   --scope "/subscriptions/<remote-subscription-id>/resourceGroups/<resource-group>/providers/Microsoft.Network/virtualNetworks/<vnet-name>"
```

-   **Subnet IP address limitation**: Both subnets must have IP ranges within valid RFC1918 private IPv4 ranges: `10.0.0.0/8`, `172.16-31.0.0/12`, or `192.168.0.0/16`. Public IP and CGNAT address ranges `100.64.0.0`–`100.127.255.255` are not supported.
-   **Agent subnet exclusivity**: The agent subnet can't be shared by multiple Foundry resources. Each Foundry resource must use a dedicated agent subnet.
-   **Agent subnet size**: The recommended size of the delegated Agent subnet is /24 (256 addresses) due to the delegation of the subnet to `Microsoft.App/environments`. For more on subnet sizing, see [Configuring virtual networks for Azure Container Apps](https://learn.microsoft.com/en-us/azure/container-apps/custom-virtual-networks?tabs=workload-profiles-env#subnet).
-   **Agent subnet egress firewall allowlisting**: If you're integrating an Azure Firewall with your private network secured standard agent, allow list the Fully Qualified Domain Names (FQDNs) listed under **Managed Identity** in the [Integrate with Azure Firewall](https://learn.microsoft.com/en-us/azure/container-apps/use-azure-firewall#application-rules) article or add the Service Tag **AzureActiveDirectory**.
    -   Verify that no TLS inspection happens in the Firewall that could add a self-signed certificate. During failures, inspect whether there's any traffic landing on the Firewall and what traffic is being blocked.
-   **The Foundry resource must be deployed in the same region as the virtual network (VNet)**. Other Azure resources, such as Azure Cosmos DB, Azure AI Search, and Azure Storage, can be deployed in different regions. Consider the cost implications of cross-region deployments.
-   **Region availability**:
    -   For supported regions for model deployments, see: [Azure OpenAI model region support](https://learn.microsoft.com/en-us/azure/foundry/foundry-models/concepts/models-sold-directly-by-azure).
    -   For the virtual network IP range, you may use any Private Class A, B or C IP range. Private Class A IP address ranges (10.x.x.x) are only supported in the following regions: Australia East, Brazil South, Canada East, East US, East US 2, France Central, Germany West Central, Italy North, Japan East, South Africa North, South Central US, South India, Spain Central, Sweden Central, UAE North, UK South, West US, West US 3. Use Class B (172.16.x.x) or C (192.168.x.x) ranges for other regions. You may not use any other IP range that overlaps to the list above or uses public IP ranges.
-   **Azure Blob Storage**: Using Azure Blob Storage files with the File Search tool isn't supported.
-   **Code Interpreter file limitations**: In a private network (BYO) configuration, Code Interpreter only works in scenarios that don't involve file uploads or downloads. The tool can't retrieve files from the storage account in this setup. If you need to use files with Code Interpreter, you must use the SDK to create a container explicitly with the required files and then pass the `container_id` to Code Interpreter. This workaround is only available through the SDK; the Foundry portal UI doesn't support it.
-   **Grounding with Bing Search**: Only the following regions are supported: West Europe, Canada East, Switzerland North, Spain Central, UAE North, Korea Central, Poland Central, Southeast Asia, West US, West US 2, West US 3, East US, East US 2, Central US, South India, Japan East, UK South, France Central, Norway East, Australia East, Canada Central, Sweden Central, South Africa North, Italy North, Brazil South
-   **Delete network injection**: If you want to delete your Foundry resource and Standard Agent with secured network setup, delete your Foundry resource and virtual network last. Before deleting the virtual network, delete and [purge](https://learn.microsoft.com/en-us/azure/ai-services/recover-purge-resources#purge-a-deleted-resource) your Foundry resource.
-   **Hosted agent virtual network injection**: For Hosted agents, the virtual network configuration (network injection) must be included when you first create the Foundry account. Adding network injection to an existing Foundry account after creation isn't supported for Hosted agents.
-   **Hosted agent container registry behind a private network**: For Hosted agents, support for an Azure Container Registry (ACR) behind a private network (private endpoint with public network access disabled) depends on when the Foundry project was created. Projects created after June 25, 2026 support a private ACR. Projects created before that date require the ACR to be reachable over its public endpoint so the platform can pull the image. Existing projects aren't affected and continue to use public network access.
-   **IP Overlap**: Ensure that the address spaces for the used VNET does not overlap with any existing networks in your Azure environment or reserved IP ranges like the following: `169.254.0.0/16`, `172.30.0.0/16`, `172.31.0.0/16`, `192.0.2.0/24`, `0.0.0.0/8`, `127.0.0.0/8`, `100.100.0.0/17`, `100.100.192.0/19`, `100.100.224.0/19`, `100.64.0.0/11`. This includes all address space(s) you have in your VNET, if you have more than one, and peered VNETs.

![Diagram showing the virtual network architecture for Foundry Agent Service private networking, including the agent subnet, private endpoint subnet, and private DNS zones.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782559828/aha-mind/docs-crawler/learn.microsoft.com/private-network-isolation_ozwvy0.png)

The following resources are automatically provisioned when you use Standard Setup with private networking, unless you bring your own:

**Network infrastructure**

-   A virtual network (192.168.0.0/16)
-   Agent Subnet (192.168.0.0/24): Hosts Agent client
-   Private endpoint Subnet (192.168.1.0/24): Hosts private endpoints

Your virtual network controls which endpoints can make API calls to your resources. The Azure service automatically rejects API calls from devices outside your defined network.

All accounts and their corresponding projects are protected by default with the **Public network access Disabled** flag, requiring explicit configuration to allow access through private endpoints. These rules apply to all protocols, including REST and WebSocket.

| Private Link Resource Type | Sub Resource | Private DNS Zone Name | Public DNS Zone Forwarders |
| --- | --- | --- | --- |
| **Foundry** | account | `privatelink.cognitiveservices.azure.com`  
`privatelink.openai.azure.com`  
`privatelink.services.ai.azure.com` | `cognitiveservices.azure.com`  
`openai.azure.com`  
`services.ai.azure.com` |
| **Azure AI Search** | searchService | `privatelink.search.windows.net` | `search.windows.net` |
| **Azure Cosmos DB** | Sql | `privatelink.documents.azure.com` | `documents.azure.com` |
| **Azure Storage** | blob | `privatelink.blob.core.windows.net` | `blob.core.windows.net` |

To create a conditional forwarder in the DNS Server to the Azure DNS Virtual Server, use the list of zones mentioned in the above table. The Azure DNS Virtual Server IP address is 168.63.129.16.

Once deployment is complete, you can access your Foundry project behind a virtual network using one of the following methods:

-   **Azure VPN Gateway**: Connects on-premises networks to the virtual network over a private connection. Connection is made over the public internet. There are two types of VPN gateways that you might use:
    -   **Point-to-site**: Each client computer uses a VPN client to connect to the virtual network.
    -   **Site-to-site**: A VPN device connects the virtual network to your on-premises network.
-   **ExpressRoute**: Connects on-premises networks into the cloud over a private connection. Connection is made using a connectivity provider.
-   **Azure Bastion**: In this scenario, you create an Azure Virtual Machine (sometimes called a jump box) inside the virtual network. You then connect to the VM using Azure Bastion. Bastion allows you to connect to the VM using either an RDP or SSH session from your local web browser. You then use the jump box as your development environment. Since it's inside the virtual network, it can directly access the workspace.

The virtual network address range can be any private IP range that leaves enough address space for both the delegated agent subnet and the private endpoint subnet.

Peered virtual networks are supported, but data transfer costs can increase.

Yes, the same VNET, but not the same subnet. Multiple Foundry resources can reuse the same virtual network. However, each Foundry resource requires its own dedicated agent runtime subnet. The agent subnet can't be shared across multiple Foundry resources.

No. The virtual network and Foundry resource don't need to be in the same resource group, but they must be in the same region.

Refer to this guide to resolve errors during or after a Standard Agent deployment, whether you used the Azure portal, Bicep, or Terraform.

`"CreateCapabilityHostRequestDto is invalid: Agents CapabilityHost supports a single, non empty value for vectorStoreConnections property."`

`"Agents CapabilityHost supports a single, non empty value for storageConnections property."`

`"Agents CapabilityHost supports a single, non empty value for threadStorageConnections property."`

**Solution**: Providing all connections to all Bring-your-Own (BYO) resources, requires connections to all BYO resources. You can't create a secured standard agent in Foundry without all three resources provided.

`"Provided subnet must be of the proper address space. Please provide a subnet which has address space in the range of 172 or 192."`

**Solution**: You aren't using a proper IP range for your delegated agent subnet. Verify that you're using a valid private IP address space. Valid RFC1918 ranges include `10.0.0.0/8`, `172.16-31.0.0/12`, and `192.168.0.0/16`. The error message text might not list all valid ranges.

`"Subscripton is not registered with the required resource providers, please register with the resource providers Microsoft.App and Microsoft.ContainerService."`

**Solution**: You're missing the correct resource registration. Ensure the required resources are registered in your tenant.

`"Failed to create Aml RP virtual workspace due to System.Exception: Failed async operation."` or `"The resource operation completed with terminal provisioning state 'Failed'. Capability host operation failed."`

**Solution**: This is a catch-all error. Create a support ticket request to investigate your setup. Check the capability host for the error.

`"Subnet requires any of the following delegation(s) [Microsoft.App/environments] to reference service association link /subscriptions/11111-aaaaa-2222-bbbb-333333333/resourceGroups/agentRANGEChange/providers/Microsoft.Network/virtualNetworks/my-agent-vnet/subnets/agent-subnet/serviceAssociationLinks/legionservicelink."`

**Solution**: This error appears when you try to delete your secured standard template setup in Azure and didn't correctly delete all resources. One solution is to navigate to your Foundry resource page in the Azure portal and select **Manage deleted resources**. From there, purge the resource that the agent was associated with for this virtual network. The other option is to run the `deleteCaphost.sh` script in the secured standard template.

`"Timeout of 60000ms exceeded" error when loading the Agent pages in the Foundry project`

**Solution**: The Foundry project has issues communicating with Azure Cosmos DB to create Agents. Verify connectivity to Azure Cosmos DB (Private Endpoint and DNS).

**Solution**: If resources aren't reachable through private endpoints, verify that each private DNS zone is linked to your virtual network. Confirm conditional forwarders point to the Azure DNS virtual server IP address `168.63.129.16`. From a machine connected to the VNet, run `nslookup <resource-fqdn>` and verify that each name resolves to a private IP address.

You've now successfully configured a network-secure account and project. Use the [quickstart](https://learn.microsoft.com/en-us/azure/foundry/agents/quickstarts/quickstart-hosted-agent) to create your first agent.

For more on network isolation configuration and options, see [Configure network isolation](https://learn.microsoft.com/en-us/azure/foundry/how-to/configure-private-link).

Many enterprise environments require that Foundry, the container registry, and dependent services such as Application Insights and Storage be reachable only from a private network. This section explains how to provision and deploy `azd` hosted agents whose dependencies sit behind private endpoints in a virtual network (VNet).

You achieve VNet integration by customizing the scaffolded `infra/` Bicep templates and by running `azd` from inside (or with access to) the VNet.

-   An initialized hosted agent project. To create one, see [Initialize a hosted agent project with the Azure Developer CLI](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/init-agent-project).
-   The [Azure Developer CLI Foundry extensions](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/install-cli-foundry-extensions) installed.
-   A virtual network (new or existing) and permission to create private endpoints and private DNS zones.
-   Familiarity with the scaffolded Bicep. See [Hosted agent infrastructure with the Azure Developer CLI](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/cli-infrastructure).

A hosted agent project provisions several Azure resources. You can disable public network access on each one and place a private endpoint in your VNet.

| Resource | Can be VNet-protected? | What private mode means |
| --- | --- | --- |
| AI Services account | Yes | The Foundry account is reachable only through a private endpoint, for both data-plane and ARM calls. |
| Foundry project | Yes, with the account | Inherits the account's network posture. |
| Azure Container Registry | Yes | `publicNetworkAccess: Disabled`. Build, push, and pull happen over the private endpoint. |
| Application Insights | Yes, through an Azure Monitor Private Link Scope | Telemetry ingestion routes through the private link scope. |
| Azure Storage | Yes | Blob, Files, and Queue services sit behind private endpoints. |
| Agent endpoint itself | No, in this preview | The deployed agent endpoint URL stays publicly addressable. Isolation is done with Foundry isolation keys. See [Pass isolation keys](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/pass-isolation-keys). |

If you need the agent endpoint itself to be private, that's a platform-side feature outside the scope of this extension today.

| Capability | Status |
| --- | --- |
| CLI flag to enable VNet integration | Not supported. No `--vnet` or `--private-endpoint` flag ships by default. |
| Reuse of an existing private ACR | Supported through `AZURE_CONTAINER_REGISTRY_RESOURCE_ID` and `AZURE_CONTAINER_REGISTRY_ENDPOINT`. See [Deploy a hosted agent with a private Azure Container Registry](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/deploy-hosted-agent-private-azure-container-registry). |
| Reuse of an existing Foundry account | Supported through `AZURE_AI_ACCOUNT_NAME` and `USE_EXISTING_AI_PROJECT=true`. |
| Custom Bicep modules in `infra/` | Fully supported. The `infra/` directory is standard `azd` Bicep that you own. |
| `azd ai agent doctor` from inside the VNet | Works. Remote checks require DNS resolution of the Foundry data-plane endpoint. Use `--local-only` to skip them. |
| Self-hosted GitHub runners or Azure DevOps agents in the VNet | Recommended pattern. CI provisions and deploys from inside the network. |

Most VNet-protected deployments fall into one of these shapes. Pick one before you edit Bicep:

-   **Greenfield, everything inside a new VNet.** Run `azd ai agent init`, then add private endpoint modules to the scaffolded `infra/`. You provision both the VNet and the resources from one Bicep run.
-   **Brownfield, attach to an existing VNet.** Same as the greenfield approach, but you reference the existing VNet through parameters instead of creating one. This is useful when a different team owns networking.
-   **Reuse all existing resources.** A platform team preprovisioned the Foundry account, ACR, and Application Insights on private endpoints. You bring just the agent definition and point the environment variables at the existing resources. `main.bicep` creates only what's missing.

Topologies 2 and 3 are the most common in regulated enterprises. Topology 1 fits self-contained pilots.

The `infra/` directory generated by `azd ai agent init` is standard `azd` Bicep. You own it, and changes persist across deployments. The default templates create public resources, so you replace or augment them to add private endpoints.

Add parameters to `infra/main.bicep` and bind them in `infra/main.parameters.json`:

```
// infra/main.bicep (excerpt)

@description('Resource ID of the existing virtual network. If empty, a new VNet is created.')
param vnetResourceId string = ''

@description('Name of the subnet hosting private endpoints.')
param privateEndpointSubnetName string = 'snet-pe'

@description('Disable public network access on data-plane resources.')
param disablePublicNetworkAccess bool = true
```

```
// infra/main.parameters.json (excerpt)
{
  "vnetResourceId":              { "value": "${AZURE_VNET_RESOURCE_ID=}" },
  "privateEndpointSubnetName":   { "value": "${AZURE_PE_SUBNET_NAME=snet-pe}" },
  "disablePublicNetworkAccess":  { "value": "${DISABLE_PUBLIC_NETWORK=true}" }
}
```

Set the environment variables before `azd provision`:

```
azd env set AZURE_VNET_RESOURCE_ID \
  /subscriptions/<sub>/resourceGroups/<rg>/providers/Microsoft.Network/virtualNetworks/<vnet>
azd env set AZURE_PE_SUBNET_NAME snet-pe
azd env set DISABLE_PUBLIC_NETWORK true
```

For every resource the templates create, set `publicNetworkAccess: 'Disabled'` and add a private endpoint module. The following pattern is illustrative. Adapt the resource types and DNS zones to your environment.

```
// infra/core/ai/account.bicep (excerpt)
resource aiAccount 'Microsoft.CognitiveServices/accounts@2024-10-01' = {
  // ...existing properties...
  properties: {
    // ...existing properties...
    publicNetworkAccess: disablePublicNetworkAccess ? 'Disabled' : 'Enabled'
    networkAcls: {
      defaultAction: disablePublicNetworkAccess ? 'Deny' : 'Allow'
    }
  }
}
```

Add a private endpoint module that wires the account into the VNet:

```
module aiAccountPrivateEndpoint '../network/private-endpoint.bicep' = if (disablePublicNetworkAccess) {
  name: 'pe-ai-account'
  params: {
    name: 'pe-${aiAccount.name}'
    location: location
    subnetId: '${vnetResourceId}/subnets/${privateEndpointSubnetName}'
    privateLinkServiceId: aiAccount.id
    groupId: 'account'
    privateDnsZoneId: privateDnsZones.cognitiveServices
  }
}
```

Repeat this pattern for the resources you want to make private:

-   AI Services account: group ID `account`. DNS zones include `privatelink.cognitiveservices.azure.com`, `privatelink.openai.azure.com`, and `privatelink.services.ai.azure.com`, depending on the data plane.
-   Container Registry: group ID `registry`. DNS zone `privatelink.azurecr.io`. Adds a data endpoint per region.
-   Application Insights: through an Azure Monitor Private Link Scope. DNS zones include `privatelink.monitor.azure.com`, `privatelink.ods.opinsights.azure.com`, `privatelink.oms.opinsights.azure.com`, and `privatelink.agentsvc.azure-automation.net`.
-   Storage account: group IDs `blob`, `file`, `queue`, and `table` as needed. DNS zones per service, for example `privatelink.blob.core.windows.net`.

The [azd-ai-starter-basic](https://github.com/Azure-Samples/azd-ai-starter-basic) repository that the agent extension scaffolds from is a useful reference for what's created by default. Augment those modules rather than replace them.

```
azd provision
```

After provisioning, every dependency on your list is reachable only through its private endpoint. Public DNS resolution still returns the public hostname, but the private DNS zones override it inside the VNet.

After you disable public network access, you can't run `azd up` or `azd deploy` from a public-internet workstation. The ARM control plane is reachable, but data-plane calls to Foundry and ACR push fail with `403` or connection-refused errors. Use one of the following patterns.

Provision a runner VM, or an AKS-hosted runner, in a subnet of the same VNet. Point your workflow at that runner with `runs-on: [self-hosted, agent-vnet]`. Every `azd ai` step then resolves the private DNS names correctly and pushes through the private endpoint.

```
jobs:
  deploy:
    runs-on: [self-hosted, agent-vnet]
    steps:
      - uses: actions/checkout@v4
      - uses: Azure/setup-azd@v2
      - run: azd ext install microsoft.foundry
      - run: azd auth login --client-id ${{ secrets.AZURE_CLIENT_ID }} \
          --federated-credential-provider github \
          --tenant-id ${{ secrets.AZURE_TENANT_ID }}
      - run: azd up --no-prompt
```

Use the same pattern for Azure DevOps. Install the agent in a VNet subnet and target it with the `pool: name: agent-vnet` directive. The `azd` CLI and the Foundry extension run unchanged.

For ad hoc runs, such as manual incident response or an out-of-cycle deploy, connect through Azure Bastion to a jump host inside the VNet, install `azd` and the extensions there, and run `azd` from that host. Keep the jump host minimal. The long-term answer is CI.

Local development (`azd ai agent run` and `azd ai agent invoke`) talks to your local agent process over loopback and to the Foundry data plane for tools, models, and sessions during `invoke`. When the Foundry endpoint is VNet-only, you need network reachability from your development machine. Options include:

-   A point-to-site or always-on VPN that drops you into the VNet DNS scope.
-   Azure Bastion to a development VM inside the VNet. Run `azd ai agent run` on that VM and forward port 8088, and 8087 for the inspector, through the Bastion tunnel.
-   A workstation in the corporate network with an ExpressRoute or hub-VNet path to the spoke that hosts the private endpoints.

The `FOUNDRY_PROJECT_ENDPOINT` resolution doesn't change. The value still comes from the active `azd` environment or the global config. What matters is that DNS resolves the endpoint to the private IP rather than the public one.

If both the Foundry endpoint and the ACR are on private endpoints in the same VNet, do the following:

1.  Run `azd up` from inside the VNet.
2.  Set `AZURE_CONTAINER_REGISTRY_ENDPOINT` and `AZURE_CONTAINER_REGISTRY_RESOURCE_ID` to point at the existing private ACR, so the Bicep skips creating a new public one.
3.  Make sure the agent identity has the **AcrPull** role on the registry. `azd deploy` handles this automatically after it creates the agent identity.

For registry-specific details, see [Deploy a hosted agent with a private Azure Container Registry](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/deploy-hosted-agent-private-azure-container-registry).

-   `azd ai agent doctor` runs network reachability checks against the Foundry data plane. From inside the VNet, the checks pass. From outside, they fail clearly. Use `--local-only` to skip remote checks when you debug non-network issues.
-   `azd ai agent invoke --output raw "ping"` dumps the full HTTP response. A connection-refused or no-such-host error here is a DNS or routing problem, not an authentication problem.
-   For ACR push failures, the CLI emits a paste-ready `az role assignment create` command when the cause is a missing role rather than a network issue.

-   No first-class CLI flag. All VNet wiring is manual Bicep customization plus operational discipline for runner placement, DNS, and RBAC.
-   The agent endpoint stays public in this preview. Tenant isolation on a public endpoint is done with [isolation keys](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/pass-isolation-keys), not network privacy.
-   Region constraints apply. Hosted agents are available in a fixed set of regions. The VNet, ACR, and Foundry account should all live in, or peer to, one of those regions. Run `azd ai agent doctor` to validate.
-   DNS is the most common failure mode. Confirm private DNS resolution end to end, for example with `nslookup <endpoint>` from the runner or development VM, before you assume the issue is RBAC.

-   [Deploy a hosted agent with a private Azure Container Registry](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/deploy-hosted-agent-private-azure-container-registry)
-   [Pass isolation keys to a hosted agent](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/pass-isolation-keys)
-   [Hosted agent infrastructure with the Azure Developer CLI](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/cli-infrastructure)
-   [Diagnose a project with agent doctor](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/agent-doctor)
