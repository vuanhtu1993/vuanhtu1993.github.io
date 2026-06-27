---
title: "Quickstart: Add a Foundry IQ knowledge base to a hosted agent with a toolbox - Microsoft Foundry"
source_url: "https://learn.microsoft.com/en-us/azure/foundry/agents/quickstarts/quickstart-foundry-iq-hosted-agent"
crawled_at: "2026-06-27T11:26:06.555Z"
---

Important

Items marked (preview) in this article are currently in public preview. This preview is provided without a service-level agreement, and we don't recommend it for production workloads. Certain features might not be supported or might have constrained capabilities. For more information, see [Supplemental Terms of Use for Microsoft Azure Previews](https://azure.microsoft.com/support/legal/preview-supplemental-terms/).

In this quickstart, you ground a [hosted agent](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/hosted-agents) in a Foundry IQ in Foundry Tools knowledge base, and you reach that knowledge base through a [toolbox](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/toolbox). A knowledge base in Foundry IQ uses Azure AI Search agentic retrieval to plan a query, search your data, rerank results, and synthesize a cited answer. The toolbox exposes the knowledge base's Model Context Protocol (MCP) endpoint as a single tool, and the agent calls that tool with its own managed identity for keyless authentication.

You complete three parts:

-   **Provision a knowledge base** one time with a Python script that creates a search index, seeds it with sample documents, and builds the knowledge source and knowledge base.
-   **Create a toolbox connection** that targets the knowledge base's MCP endpoint and authenticates with the agent's managed identity.
-   **Deploy a hosted agent** that discovers the `knowledge_base_retrieve` tool through the toolbox and grounds its answers in the retrieved sources.

The agent code, the knowledge base provisioning script, the toolbox definition, and an automation hook come from the Foundry IQ sample, so you focus on the workflow rather than the implementation.

This quickstart builds on the hosted-agent toolchain. Complete the [Prerequisites](https://learn.microsoft.com/en-us/azure/foundry/agents/quickstarts/quickstart-hosted-agent#prerequisites) in the hosted agent quickstart first, which cover the Azure subscription, project roles, Python, the Azure Developer CLI (`azd`), and the `microsoft.foundry` extension.

You also need:

-   An [Azure AI Search service](https://learn.microsoft.com/en-us/azure/search/search-create-service-portal) that supports agentic retrieval. Enable a system-assigned managed identity on the service, and enable role-based access control. In the Azure portal, on the search service, go to **Settings** > **Keys**, and set **API Access control** to **Both** or **Role-based access control**.
-   A chat model deployment in your Foundry project, such as `gpt-4.1-mini`. The knowledge base uses the same model to synthesize answers.

Assign the following roles before you provision. The knowledge base calls the model with the search service's managed identity, so that identity needs access to your Foundry account.

| Identity | Role | Scope | Why |
| --- | --- | --- | --- |
| Your user account | Search Service Contributor | Search service | Create the index, knowledge source, and knowledge base. |
| Your user account | Search Index Data Contributor | Search service | Upload the sample documents. |
| Search service managed identity | Cognitive Services User | Foundry account | Call the model for keyless answer synthesis. |
| Agent managed identity | Search Index Data Reader | Search service | Let the deployed agent retrieve from the knowledge base at query time. |

The agent's managed identity exists only after you deploy the agent, so you assign **Search Index Data Reader** in [Step 6](#step-6-grant-the-agent-access-to-the-knowledge-base).

Initialize a hosted agent from the Foundry IQ sample. The sample includes the agent code, the `provision_kb.py` script, the `toolbox.yaml` definition, and the automation hooks. Run these commands in an empty directory.

```
mkdir my-foundry-iq-agent
cd my-foundry-iq-agent
azd ai agent init -m "https://github.com/microsoft-foundry/foundry-samples/blob/main/samples/python/hosted-agents/agent-framework/responses/17-foundry-iq-toolbox/agent.manifest.yaml"
```

Follow the prompts to select your subscription, Foundry project, and a chat model deployment such as `gpt-4.1-mini`. If you don't have a project, the flow guides you through creating one. Initialization sets the selected project as the active project and copies the sample files into a new service directory, `src/agent-framework-foundry-iq-knowledge-base-responses/`.

The sample includes a `postprovision` hook that runs the knowledge base script, creates the toolbox connection, creates the toolbox, and sets the `TOOLBOX_ENDPOINT` environment variable every time you provision. Wire the hook into the `azure.yaml` file that `azd ai agent init` generated.

Open `azure.yaml` and add this top-level block. The `postprovision` hook must be at the top level because service-scoped hooks support only the package and deploy lifecycle.

```
hooks:
  postprovision:
    posix:
      shell: sh
      run: ./src/agent-framework-foundry-iq-knowledge-base-responses/hooks/postprovision.sh
    windows:
      shell: pwsh
      run: ./src/agent-framework-foundry-iq-knowledge-base-responses/hooks/postprovision.ps1
```

The hook locates its own directory, so it works no matter which directory `azd` runs it from.

1.  Point the hook at your existing search service:
    
    ```
    azd env set AZURE_SEARCH_ENDPOINT "https://<your-search>.search.windows.net"
    ```
    
    The hook derives the model endpoint for answer synthesis from your project endpoint. To use a different Azure OpenAI resource, set it first with `azd env set AZURE_OPENAI_ENDPOINT "https://<account>.openai.azure.com"`.
    
2.  Provision the resources and the knowledge base:
    
    ```
    azd provision
    ```
    
    `azd provision` creates or reuses your Foundry project and model deployment. The `postprovision` hook then:
    
    1.  Runs `provision_kb.py` to create the `foundry-iq-index` search index, seed the _Earth at night_ documents, and build the `foundry-iq-ks` knowledge source and `foundry-iq-kb` knowledge base. The script stores the knowledge base's MCP endpoint as `KB_MCP_ENDPOINT`.
    2.  Creates the `knowledge-base-mcp` connection. This connection targets the knowledge base's MCP endpoint and uses Agentic Identity, so the agent's managed identity authenticates with no stored secret.
    3.  Creates the `knowledge-base` toolbox from `toolbox.yaml`, which exposes the `knowledge_base_retrieve` tool.
    4.  Sets `TOOLBOX_ENDPOINT` so the agent connects to the toolbox.

Note

The connection uses the `agentic-identity` authentication type, which forwards the agent's managed identity to the search service. A user token is rejected on purpose, so retrieval succeeds only after you deploy the agent and grant its identity access in [Step 6](#step-6-grant-the-agent-access-to-the-knowledge-base).

1.  Start the agent:
    
    ```
    azd ai agent run
    ```
    
    This command creates a virtual environment, installs dependencies, and serves the agent on `http://localhost:8088`. Preview packages can produce pip warnings during setup. These warnings are nonblocking.
    
2.  In a separate terminal, ask the agent a question that the knowledge base can answer:
    
    ```
    azd ai agent invoke --local "What can you tell me about the Earth at night?"
    ```
    
    The local agent connects to the toolbox, but retrieval from the knowledge base requires the deployed agent's identity. Use the local run to confirm the agent starts and reaches the toolbox. You verify grounded answers after you deploy.
    

Build and deploy the agent container:

```
azd deploy
```

When the command finishes, the output shows links to the agent playground and the agent endpoint.

The deployed agent retrieves from the knowledge base with its own managed identity. Grant that identity the **Search Index Data Reader** role on the search service.

1.  Find the agent's identity object ID in the Foundry portal. Go to **Agents**, select your agent, and then select **Identity**.
    
2.  Assign the role on the search service:
    
    ```
    searchId=$(az search service show -n <search-name> -g <resource-group> --query id -o tsv)
    az role assignment create --assignee-object-id <agent-identity-object-id> \
      --assignee-principal-type ServicePrincipal \
      --role "Search Index Data Reader" --scope $searchId
    ```
    
    In PowerShell, use a line continuation backtick (```) instead of `\`.
    

Send a question to the deployed agent and confirm it answers from the knowledge base:

```
azd ai agent invoke "What can you tell me about the Earth at night?"
```

The agent returns a grounded answer with citations to the sample documents. Try a few more questions to see retrieval across the sample corpus:

```
azd ai agent invoke "Why do some lights appear over the open ocean?"
azd ai agent invoke "How is nighttime imagery used to study light pollution?"
```

Delete the resources when you're finished so you stop incurring charges.

1.  Delete the knowledge base, knowledge source, and index from your search service. In the Azure portal, on the search service, delete `foundry-iq-kb`, `foundry-iq-ks`, and the `foundry-iq-index` index. You can keep the search service for other projects.
    
2.  Delete the agent and its Azure resources:
    
    Warning
    
    `azd down` permanently deletes every resource in the resource group, including the Foundry project, model deployments, Container Registry, and the hosted agent. If you provisioned into a resource group that contains other resources, those resources are deleted too.
    
    ```
    azd down
    ```
    

| Issue | Solution |
| --- | --- |
| `azd provision` fails with `AZURE_SEARCH_ENDPOINT is not set` | Run `azd env set AZURE_SEARCH_ENDPOINT "https://<your-search>.search.windows.net"` before you provision. |
| `provision_kb.py` fails with a permissions error | Confirm your account has **Search Service Contributor** and **Search Index Data Contributor** on the search service. |
| The knowledge base fails to synthesize answers | Confirm the search service managed identity has **Cognitive Services User** on the Foundry account, and that the search service has a system-assigned managed identity. |
| The deployed agent returns `I don't know` for in-scope questions | Confirm you granted the agent's managed identity **Search Index Data Reader** on the search service after the first deploy. |
| Data-plane calls to the search service return `403` | In the Azure portal, on the search service, set **API Access control** to **Both** or **Role-based access control**. |

In this quickstart, you:

-   Created a Foundry IQ knowledge base with a search index, knowledge source, and sample documents.
-   Exposed the knowledge base through a toolbox connection that uses the agent's managed identity.
-   Deployed a hosted agent that grounds its answers in the knowledge base with citations.

-   [What is Foundry IQ?](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/what-is-foundry-iq)
-   [Connect a Foundry IQ knowledge base to Foundry Agent Service](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/foundry-iq-connect)
-   [Curate an intent-based toolbox in Foundry](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/toolbox)
-   [Quickstart: Deploy your first hosted agent](https://learn.microsoft.com/en-us/azure/foundry/agents/quickstarts/quickstart-hosted-agent)
