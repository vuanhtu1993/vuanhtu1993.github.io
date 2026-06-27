---
title: "Connect agents to Microsoft Fabric with Fabric IQ (preview) - Microsoft Foundry"
source_url: "https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/fabric-iq?pivots=python"
crawled_at: "2026-06-27T11:35:24.953Z"
---

Important

Items marked (preview) in this article are currently in public preview. This preview is provided without a service-level agreement, and we don't recommend it for production workloads. Certain features might not be supported or might have constrained capabilities. For more information, see [Supplemental Terms of Use for Microsoft Azure Previews](https://azure.microsoft.com/support/legal/preview-supplemental-terms/).

Warning

When you connect to Fabric IQ, you may incur costs and data may be sent outside the Azure compliance boundary and processed according to the applicable service terms and data handling policies. It is your responsibility to manage whether your data will flow outside of your organization's compliance and geographic boundaries and any related implications, and that appropriate permissions, boundaries, and approvals are provisioned.

You're responsible for carefully reviewing and testing applications you build in the context of your specific use cases and making all appropriate decisions and customizations. This includes implementing your own responsible AI mitigations, such as metaprompts, content filters, or other safety systems, and ensuring your applications meet appropriate quality, reliability, security, and trustworthiness standards. See the [Foundry Agent Service transparency note](https://learn.microsoft.com/en-us/azure/foundry/responsible-ai/agents/transparency-note).

[Fabric IQ (preview)](https://learn.microsoft.com/en-us/fabric/iq/overview) is a Microsoft Fabric workload that unifies data across OneLake and organizes it according to the language of your business. It exposes that data to analytics, AI agents, and applications with consistent semantic meaning through its core items: the [ontology (preview)](https://learn.microsoft.com/en-us/fabric/iq/ontology/overview), which defines your enterprise vocabulary as entity types (such as Customer, Order, and Product), their properties, relationships, and data bindings to OneLake sources (lakehouses, eventhouses, and Power BI semantic models); the [Fabric data agent](https://learn.microsoft.com/en-us/fabric/data-science/concept-data-agent), which enables conversational Q&A over ontology-grounded data; [Power BI semantic models](https://learn.microsoft.com/en-us/fabric/data-warehouse/semantic-models), which provide curated analytics with measures and hierarchies. The ontology includes a Natural Language to Ontology (NL2Ontology) layer that converts natural-language questions into structured queries, so agents can ask questions using business terms instead of table names or query syntax.

When you connect your Foundry agent to Fabric IQ by registering it as a server-side tool, your agent can delegate natural-language tasks to the Fabric IQ workload—for example, "Which customers placed orders above $10,000 last quarter?" Fabric IQ handles data retrieval, ontology-grounded reasoning, and response synthesis, then returns the result to your agent. All requests run in the context of the signed-in user, honor Fabric permissions and governance policies, and remain within the Microsoft Fabric trust boundary.

| Microsoft Foundry support | Python SDK | C# SDK | JavaScript SDK | Java SDK | REST API | Basic agent setup | Standard agent setup |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Fabric IQ | ✔️ | ✔️ | ✔️ | — | ✔️ | ✔️ | ✔️ |

Note

Virtual network (VNet) integration is not supported. Your Foundry project must not use a VNet-restricted endpoint.

Important

Fabric IQ isn't available in regions where Power BI is the only Fabric workload. Confirm your Fabric workspace is in a region that supports the full Fabric stack — see [Microsoft Fabric region availability](https://learn.microsoft.com/en-us/fabric/admin/region-availability#power-bi).

Before you begin, make sure you have:

-   A [Microsoft Fabric license](https://www.microsoft.com/microsoft-fabric) that grants access to the Fabric items your agent queries. Users who invoke Fabric IQ through your agent must also have this license.
-   An active [Microsoft Foundry project](https://learn.microsoft.com/en-us/azure/foundry/how-to/create-projects) with a deployed model.
-   **Azure RBAC roles**:
    -   **Foundry User** role on the Foundry project for the developer identity, the agent's runtime identity, and any user identity involved in OAuth flows.
    -   **Foundry Project Manager** role on the Foundry project for creating a Foundry connection to the Fabric IQ endpoint.
-   **Foundry Toolkit**: Install [Visual Studio Code](https://code.visualstudio.com/) and [Foundry Toolkit for Visual Studio Code](https://code.visualstudio.com/docs/intelligentapps/overview#_install-and-setup).

1.  **Your agent dispatches a tool call** — When the agent model identifies a task that requires Fabric data, it emits a tool call to the `fabric_iq_preview` tool.
2.  **Fabric IQ processes the request** — Fabric IQ receives the natural-language query and routes it based on the target item type:
    -   **Ontology** — The Natural Language to Ontology (NL2Ontology) layer converts the query into a structured ontology query against your enterprise entities, relationships, and data bindings.
    -   **Fabric data agent** — The query goes directly to the data agent for conversational Q&A over ontology-grounded data.
    -   **Power BI semantic models** — Fabric IQ queries the semantic model's measures and hierarchies to return analytics results.
3.  **The result is returned to your agent** — Fabric IQ returns the synthesized response. Your agent incorporates it into its reply to the user. All requests run in the context of the signed-in user and honor Fabric permissions and governance policies.

Fabric IQ exposes different MCP endpoint URLs depending on the type of Fabric item you're connecting to. The value you supply as `server_url` follows one of these patterns:

| Fabric item type | `server_url` pattern | Supported authentication |
| --- | --- | --- |
| **Power BI semantic model** | `https://{host}/v1/mcp/fabricaihub/integrations/m365` | BYO Entra app, managed OAuth |
| **Ontology** | `https://{host}/v1/mcp/dataPlane/workspaces/{workspaceId}/items/{itemId}/ontologyEndpoint` | BYO Entra app, managed OAuth |
| **Data agent** | `https://{host}/v1/mcp/workspaces/{workspaceId}/dataagents/{dataAgentId}/agent` | BYO Entra app, managed OAuth |

Replace the placeholders as follows:

-   `{host}` — The Fabric API host, typically `api.fabric.microsoft.com`
-   `{workspaceId}` — The GUID of your Microsoft Fabric workspace
-   `{itemId}` / `{dataAgentId}` — The GUID of the specific Fabric item

You can find the workspace and item GUIDs in the Microsoft Fabric portal: open your workspace, select the item, and copy the IDs from the browser URL.

Note

Among the Fabric IQ item types, only the **data agent** MCP endpoint supports long-running operations through [background mode](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/runtime-components#run-an-agent-in-background-mode). Ontology and Power BI semantic model endpoints run synchronously and are subject to the standard tool-call timeout. Because the data agent endpoint is an MCP server, you run it in background mode the same way as any other MCP tool — set `background` to `true` and poll the response until it completes. For code samples, see [Long-running operations](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/model-context-protocol#long-running-operations-preview).

Tip

For **Power BI semantic models**, we highly recommend using the latest models such as `gpt-5.4` or `opus 4.7`. Semantic model queries involve complex measure and hierarchy reasoning that benefits significantly from the improved reasoning capability of newer models.

Important

For **Power BI semantic models**, we recommend restricting the tool surface with `allowed_tools` so the agent reasons over the schema and runs queries directly instead of pre-generating DAX. Set `allowed_tools` to:

-   `GetInstructions`
-   `DiscoverArtifacts`
-   `GetReportMetadata`
-   `GetSemanticModelSchema`
-   `ExecuteQuery`
-   `ValueSearch`

Omit `GenerateQuery`. This list lets the agent discover artifacts, inspect the semantic model schema, execute queries, and search for values, without an intermediate query-generation step.

For **`server_label`**, use any short lowercase identifier with hyphens, for example `fabriciq-ontology`. This label appears in approval prompts when the model calls the tool.

Use Foundry Toolkit for Visual Studio Code to add an existing Fabric IQ connection to a toolbox, then connect your agent to the published toolbox endpoint.

Note

Adding a Fabric IQ (OneLake Catalog) connection from Foundry Toolkit isn't directly supported yet. Open this toolbox in the Foundry portal to create the connection, then return to Foundry Toolkit. The connection appears in the **Configured** list.

1.  Select **Foundry Toolkit** in the Activity Bar.
2.  Under **My Resources**, expand **Your project name** > **Tools**.
3.  Create a toolbox, or open an existing toolbox.
4.  Select **Add tools**.
5.  On the **Configured** tab, select **Fabric IQ (OneLake Catalog)**.
6.  Select **Add Tools**.
7.  Select **Publish** for a new toolbox, or **Save Changes** for an existing toolbox.

[![Screenshot of Foundry Toolkit in Visual Studio Code showing the Select a tool dialog with Fabric IQ OneLake Catalog in the Configured list.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782560124/aha-mind/docs-crawler/learn.microsoft.com/toolbox-vscode-fabric-iq_t5d0hv.png)](https://learn.microsoft.com/en-us/azure/foundry/agents/media/tools/fabric-iq/toolbox-vscode-fabric-iq.png#lightbox)

For the full toolbox creation workflow, see [Curate intent-based toolbox in Foundry](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/toolbox#step-1-create-a-toolbox-version).

To add the Fabric IQ tool directly to an agent by using code or the REST API, select the Python, .NET, JavaScript, or REST API tab in this section.

Install the package:

```
pip install "azure-ai-projects>=2.2.0" python-dotenv
```

Set the following environment variables:

-   `FOUNDRY_PROJECT_ENDPOINT` — your project endpoint, found in the Overview page of your Foundry project.
-   `FOUNDRY_MODEL_NAME` — the deployment name of the model the agent uses.
-   `FABRIC_IQ_PROJECT_CONNECTION_ID` — the fully qualified resource ID of the Fabric IQ project connection.

```
import os
from dotenv import load_dotenv
from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import PromptAgentDefinition, FabricIQPreviewTool

load_dotenv()

endpoint = os.environ["FOUNDRY_PROJECT_ENDPOINT"]

with (
    DefaultAzureCredential() as credential,
    AIProjectClient(endpoint=endpoint, credential=credential) as project_client,
    project_client.get_openai_client() as openai_client,
):
    tool_payload = FabricIQPreviewTool(
        project_connection_id=os.environ["FABRIC_IQ_PROJECT_CONNECTION_ID"],
        require_approval="never",
    )

    agent = project_client.agents.create_version(
        agent_name="MyAgent",
        definition=PromptAgentDefinition(
            model=os.environ["FOUNDRY_MODEL_NAME"],
            instructions="Use the available Fabric IQ tools to answer questions and perform tasks.",
            tools=[tool_payload],
        ),
    )
    print(f"Agent created (id: {agent.id}, name: {agent.name}, version: {agent.version})")

    user_input = "Which customers placed orders above $10,000 last quarter?"
    response = openai_client.responses.create(
        input=user_input,
        extra_body={"agent_reference": {"name": agent.name, "type": "agent_reference"}},
    )

    print(f"Agent response: {response.output_text}")

    # Clean up the agent version so unused versions don't accumulate in the project.
    project_client.agents.delete_version(agent_name=agent.name, agent_version=agent.version)
    print("Agent deleted")
```

**Expected output**: The agent calls Fabric IQ with the user's query. Fabric IQ queries the ontology-grounded data using your business terms, synthesizes results from bound OneLake sources, and returns the answer.

**Step 1:** Create the agent with the Fabric IQ tool:

```
POST {project_endpoint}/agents/{agent_name}/versions?api-version=v1
Authorization: Bearer {token}
Content-Type: application/json

{
  "definition": {
    "kind": "prompt",
    "model": "gpt-4o-mini",
    "instructions": "You are a helpful assistant with access to your organization's Microsoft Fabric data through Fabric IQ. Use Fabric IQ to answer questions about business entities, relationships, and data in the ontology—such as customers, orders, products, and pipelines.",
    "tools": [
      {
        "type": "fabric_iq_preview",
        "project_connection_id": "{connection-name}",
        "server_label": "{fabric-iq-server-label}",
        "server_url": "{fabric-iq-server-url}"
      }
    ]
  }
}
```

**Step 2:** Create a conversation session:

```
POST {project_endpoint}/openai/v1/conversations
Authorization: Bearer {token}
Content-Type: application/json

{}
```

The response includes an `id` field. Use it in the next step.

**Step 3:** Send a request to the agent:

```
POST {project_endpoint}/openai/v1/responses
Authorization: Bearer {token}
Content-Type: application/json

{
  "conversation": "{conversation_id}",
  "input": "Which customers placed orders above $10,000 last quarter?",
  "agent_reference": {
    "type": "agent_reference",
    "name": "{agent_name}"
  }
}
```

The response includes metadata about the agent execution and a `text` field in `content` with the synthesized answer.

Note

Use token scope `https://ai.azure.com/.default` when getting the bearer token.

```
using Azure.AI.Projects;
using Azure.Identity;

var projectEndpoint = Environment.GetEnvironmentVariable("FOUNDRY_PROJECT_ENDPOINT");
var modelDeploymentName = Environment.GetEnvironmentVariable("FOUNDRY_MODEL_NAME");
var fabricIQConnectionName = Environment.GetEnvironmentVariable("FABRIC_IQ_PROJECT_CONNECTION_NAME");

AIProjectClient projectClient = new(endpoint: new Uri(projectEndpoint), tokenProvider: new DefaultAzureCredential());

string fabricIQConnectionId =
    (await projectClient.Connections.GetConnectionAsync(fabricIQConnectionName)).Value.Id;

FabricIQPreviewTool fabricIQTool = new(projectConnectionId: fabricIQConnectionId)
{
    RequireApproval = BinaryData.FromObjectAsJson("never"),
};
DeclarativeAgentDefinition agentDefinition = new(model: modelDeploymentName)
{
    Instructions = "Use the available Fabric IQ tools to answer questions and perform tasks.",
    Tools = { fabricIQTool },
};

ProjectsAgentVersion agentVersion = await projectClient.AgentAdministrationClient.CreateAgentVersionAsync(
    agentName: "myFabricIQAgent",
    options: new(agentDefinition));
Console.WriteLine($"Agent created (name: {agentVersion.Name}, version: {agentVersion.Version})");

ProjectResponsesClient responseClient =
    projectClient.ProjectOpenAIClient.GetProjectResponsesClientForAgent(agentVersion.Name);
CreateResponseOptions responseOptions = new()
{
    ToolChoice = ResponseToolChoice.CreateRequiredChoice(),
    InputItems = { ResponseItem.CreateUserMessageItem("Which customers placed orders above $10,000 last quarter?") },
};
ResponseResult response = await responseClient.CreateResponseAsync(responseOptions);
Console.WriteLine(response.GetOutputText());

// Clean up
await projectClient.AgentAdministrationClient.DeleteAgentVersionAsync(
    agentName: agentVersion.Name, agentVersion: agentVersion.Version);
```

```
const { DefaultAzureCredential } = require("@azure/identity");
const { AIProjectClient } = require("@azure/ai-projects");
require("dotenv/config");

const projectEndpoint = process.env["FOUNDRY_PROJECT_ENDPOINT"];
const deploymentName = process.env["FOUNDRY_MODEL_NAME"];
const fabricIqProjectConnectionId = process.env["FABRIC_IQ_PROJECT_CONNECTION_ID"];

async function main() {
  const project = new AIProjectClient(projectEndpoint, new DefaultAzureCredential());
  const openAIClient = project.getOpenAIClient();

  const tool = {
    type: "fabric_iq_preview",
    project_connection_id: fabricIqProjectConnectionId,
    require_approval: "never",
  };

  const agent = await project.agents.createVersion("MyAgent", {
    kind: "prompt",
    model: deploymentName,
    instructions: "Use the available Fabric IQ tools to answer questions and perform tasks.",
    tools: [tool],
  });
  console.log(`Agent created (id: ${agent.id}, name: ${agent.name}, version: ${agent.version})`);

  const userInput = process.env["FABRIC_IQ_USER_INPUT"] || "Summarize the available datasets";
  const response = await openAIClient.responses.create(
    { input: userInput },
    { body: { agent_reference: { name: agent.name, type: "agent_reference" } } },
  );
  console.log(`Agent response: ${response.output_text}`);

  // Clean up the agent version so unused versions don't accumulate in the project.
  await project.agents.deleteVersion(agent.name, agent.version);
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});
```

Fabric IQ uses Microsoft Entra ID delegated authentication (On-Behalf-Of, OBO). All requests run in the context of the signed-in user. Application-only (app-only) authentication isn't supported. Microsoft Fabric permissions and data governance policies are enforced automatically — Fabric IQ can never surface data that the signed-in user isn't already permitted to see.

The authentication method available depends on the Fabric item type:

-   **Ontology** - BYO Entra app or managed OAuth. To use BYO Entra app, register a dedicated Entra application with Power BI delegated permissions.
-   **Data agent** — BYO Entra app (with data agent scopes) or managed OAuth.
-   **Power BI semantic model** — BYO Entra app or managed OAuth.

An Entra admin must complete the following steps before you can create a Fabric IQ connection for an ontology item in Foundry.

1.  Go to the [Microsoft Entra admin center](https://entra.microsoft.com/). In the left navigation, select **Entra ID** > **App registrations**.
    
2.  Select **New registration**. Give the app a descriptive name and set **Supported account types** to **Accounts in this organizational directory only**. Select **Register**.
    
3.  Copy the **Application (client) ID**. You need this value when creating the Foundry connection.
    
4.  Select **API permissions** > **Add a permission** > **Microsoft APIs**. Find and select **Power BI Service**, select **Delegated permissions**, and add the following permissions:
    
    -   `Item.Execute.All`
    -   `Item.Read.All`
    
    [![Screenshot of the Request API permissions panel for Power BI Service in the Microsoft Entra admin center, showing Item.Execute.All and Item.Read.All selected as delegated permissions, both with admin consent not required.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782560124/aha-mind/docs-crawler/learn.microsoft.com/entra-api-permissions-search_l1164p.png)](https://learn.microsoft.com/en-us/azure/foundry/agents/media/tools/fabric-iq/entra-api-permissions-search.png#lightbox)
    
    Select **Add permissions**.
    
5.  Select **Grant admin consent for {your-organization}** in the **Configured permissions** panel. A Global Administrator must approve. This step allows users in your organization to authenticate through the Fabric IQ connection.
    
6.  Select **Certificates & secrets** > **New client secret**. Add a description and expiration. Select **Add**, then immediately copy the secret **Value** — it's only shown once.
    
7.  Copy your **Directory (tenant) ID** from the **Microsoft Entra ID** overview page.
    

In [Microsoft Foundry](https://ai.azure.com/nextgen), open your project and go to **Settings** > **Connections** > **New connection** > **Fabric IQ**. Fill in the following fields:

| Field | Value |
| --- | --- |
| **Client ID** | Application (client) ID from step 3 |
| **Client secret** | Client secret value from step 6 |
| **Authorization URL** | `https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/authorize` |
| **Token URL** | `https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/token` |
| **Refresh URL** | `https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/token` |
| **Scopes** | `https://analysis.windows.net/powerbi/api/Item.Execute.All,https://analysis.windows.net/powerbi/api/Item.Read.All,offline_access` |

Replace `{tenant-id}` with your Directory (tenant) ID from step 7. Select **Save** to create the connection.

Note

For data agent connections using BYO Entra, use the `DataAgent.Execute.All` delegated permission instead of the Power BI scopes listed above. Add `https://analysis.windows.net/powerbi/api/DataAgent.Execute.All` as the scope in the Foundry connection, and grant admin consent for that permission in your app registration.

After Foundry creates the connection, it displays an OAuth redirect URL. Add this URL to your app registration:

1.  In the [Microsoft Entra admin center](https://entra.microsoft.com/), go to **Entra ID** > **App registrations** and select your app.
2.  Select **Authentication** > **Add a platform** > **Web**.
3.  Under **Redirect URIs**, paste the OAuth redirect URL from Foundry.
4.  Select **Configure**.

Fabric IQ processes requests within the Microsoft Fabric compliance boundary for your workspace's region. The following commitments apply when you route agent queries through Fabric IQ.

Fabric IQ retrieves and processes data within the region where your Microsoft Fabric workspace resides. Data doesn't cross regional boundaries during query execution. The applicable region and its compliance scope are determined by your workspace location — see [Microsoft Fabric region availability](https://learn.microsoft.com/en-us/fabric/admin/region-availability) for the list of supported regions and the compliance frameworks each region satisfies.

Note

If your Foundry project is in a different Azure region than your Fabric workspace, query results are returned cross-region. Review [Microsoft Fabric region availability](https://learn.microsoft.com/en-us/fabric/admin/region-availability) and your organization's data residency requirements before connecting a Fabric workspace in a different region.

Fabric IQ inherits Microsoft Fabric's compliance certifications for the workspace region. For compliance documentation, audit reports, and the frameworks applicable to each region, see [Microsoft Fabric region availability](https://learn.microsoft.com/en-us/fabric/admin/region-availability).

A Global Administrator must grant tenant-wide admin consent for the Entra app registration before users can authenticate with the Fabric IQ connection:

1.  In the [Microsoft Entra admin center](https://entra.microsoft.com/), go to **Entra ID** > **App registrations** and select your app.
2.  Select **API permissions**.
3.  Select **Grant admin consent for {your-organization}** and approve. Each listed permission shows a green checkmark when consent is granted.

Note

DataAgent.Execute.All also requires admin consent. If you use this permission for data agent connections, follow the same process.

To restrict agent traffic to your private network, configure Foundry Agent Service with a virtual network. See [Private networking for agents](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/virtual-networks) for setup instructions.

A Fabric admin must publish each Fabric item — ontology, data agent, or Power BI semantic model — before it can be consumed through Fabric IQ. Unpublished items aren't reachable at the MCP endpoint, and requests against them fail. Confirm that the item is published in the Microsoft Fabric portal before configuring the Foundry connection.

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| 404 or `Not Found` error when connecting | The `server_url` is incorrect or the Fabric item isn't published. | Verify the workspace and item GUIDs in the Fabric portal URL. Confirm the item is published. |
| 401 Unauthorized | Admin consent hasn't been granted or the Entra app is misconfigured. | Verify admin consent was granted for all required API permissions. Check that the client ID, secret, and scopes match what you configured in Foundry. |
| `CONSENT_REQUIRED` error at runtime | The signed-in user hasn't completed the OAuth flow for the connection. | Open the consent URL returned in the error, complete the OAuth flow in a browser, then retry. |
| Empty or incorrect results from ontology queries | Ontology entities, properties, or data bindings are incomplete. | Verify the ontology item is published and that entity types, properties, and data bindings are fully configured in Fabric IQ. |
| Poor-quality answers from Power BI semantic models | The model doesn't have strong enough reasoning for complex measure queries. | Use a latest-generation model such as `gpt-5.4` or `opus 4.7`. These models handle semantic model complexity significantly better than older models. |
| Agent never calls the Fabric IQ tool | The model doesn't recognize when to delegate to Fabric IQ. | Add guidance in the system prompt, for example: _"Use the Fabric IQ tool for any question about business data, entities, metrics, or organizational knowledge."_ |

-   [What is Fabric IQ (preview)?](https://learn.microsoft.com/en-us/fabric/iq/overview)
-   [What is ontology (preview)?](https://learn.microsoft.com/en-us/fabric/iq/ontology/overview)
-   [Fabric data agent concepts](https://learn.microsoft.com/en-us/fabric/data-science/concept-data-agent)
-   [Overview of the Power BI MCP servers (preview)](https://learn.microsoft.com/en-us/power-bi/developer/mcp/mcp-servers-overview)
-   [Tool best practices](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/tool-best-practice)
