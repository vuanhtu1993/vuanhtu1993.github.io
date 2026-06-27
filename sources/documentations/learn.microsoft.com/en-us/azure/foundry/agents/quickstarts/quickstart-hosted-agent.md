---
title: "Quickstart: Deploy your first hosted agent - Microsoft Foundry"
source_url: "https://learn.microsoft.com/en-us/azure/foundry/agents/quickstarts/quickstart-hosted-agent?source=recommendations&pivots=azd"
crawled_at: "2026-06-27T11:32:27.975Z"
---

Note

Hosted agents are currently in preview.

Before you begin, you need:

-   An Azure subscription--[Create one for free](https://azure.microsoft.com/pricing/purchase-options/azure-account?cid=msft_learn_3e341e14-a49b-2151-29e7-53c0a4c50835).
-   If you have existing Foundry Project, you need `Foundry Project Manager` at project scope. If you need to create a new Foundry Project, you need `Owner` role at resource group scope. For the full role matrix, see [Hosted agent permissions reference](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/hosted-agent-permissions).
-   [Python 3.13 or later](https://www.python.org/downloads/).

-   [Azure Developer CLI (AZD) 1.25.3 or later](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/install-azd).
    
-   The `azd microsoft.foundry` extension. Install and verify the extension after AZD is installed:
    
    ```
    azd ext install microsoft.foundry
    ```
    

-   [Visual Studio Code](https://code.visualstudio.com/).
-   [Microsoft Foundry Toolkit for Visual Studio Code](https://aka.ms/foundrytk).

Initialize a new hosted agent using the basic [Agent Framework sample](https://github.com/microsoft-foundry/foundry-samples/blob/main/samples/python/hosted-agents/agent-framework/responses/01-basic) in an empty directory:

```
azd ai agent init -m "https://github.com/microsoft-foundry/foundry-samples/blob/main/samples/python/hosted-agents/agent-framework/responses/01-basic/agent.manifest.yaml" --deploy-mode code
```

The interactive flow prompts for:

-   **Agent name**: Customize the name or accept the _default_, **agent-framework-agent-basic-responses**
-   **Foundry Project**: Select **Create a new Foundry project** or **Use an existing Foundry project**
-   **Tenant**: Select your Azure tenant
-   **Subscription**: Select your Azure subscription
-   **Location**: Select an Azure region
-   **Model**: Select the _default_, **gpt-4.1-mini**, or another model you can access.
-   **Model Version**: Select the _default_ option.
-   **Model SKU**: Select an option with available quota that isn't Batch, usually **Standard** or **GlobalStandard**
-   **Deployment capacity**: Select the _default_, **10**
-   **Deployment name**: Select the _default_, **gpt-4.1-mini**

When complete, you should see **AI agent definition added to your azd project successfully!**. Change directory into newly created agent folder.

```
cd agent-framework-agent-basic-responses
```

Provision the resources defined in `azure.yaml`:

```
azd provision
```

```
azd ai agent run
```

This command creates a virtual environment, installs dependencies, launches the agent using the `startupCommand` defined in `azure.yaml` and opens the agent inspector in your browser so you can chat with the agent.

Build and deploy the agent container:

```
azd deploy
```

When the command finishes, the output shows links to the agent playground and the agent endpoint:

```
Deploying services (azd deploy)

  Done: Deploying service basic-agent
  - Agent playground (portal): https://ai.azure.com/.../build/agents/basic-agent/build?version=1
  - Agent endpoint: https://ai-account-<name>.services.ai.azure.com/api/projects/<project>/agents/basic-agent/versions/1
```

1.  Send the same prompt to the deployed agent:
    
    ```
    azd ai agent invoke "Write a haiku about deploying cloud applications."
    ```
    
    You should see a haiku response within a few seconds.
    
2.  (Optional) Stream container logs while you interact with the agent:
    
    ```
    azd ai agent monitor --follow
    ```
    

1.  Open the Command Palette (**Ctrl+Shift+P**) and select **Foundry Toolkit: Create Project**.
2.  Select your Azure subscription.
3.  Create a new resource group or select an existing one.
4.  Enter a name for the Foundry project.

1.  Open the Command Palette and select **Foundry Toolkit: Open Model Catalog**.
2.  Search for `gpt-4.1` and select **Deploy**.
3.  On the model deployment page, select **Deploy to Microsoft Foundry**.

1.  Open the Command Palette and select **Foundry Toolkit: Create new Hosted Agent**.
2.  Select the **Python** as the language.
3.  For "Framework", select **Agent Framework**.
4.  Select **Responses API** as the protocol type.
5.  Select **Basic** as the sample code.
6.  Select the "Next" button.
7.  Choose a folder for the project files and enter a name for the agent.
8.  For "Environment Setup", choose **Set up with Microsoft Foundry**, the content should auto-populate with the project and model you created in step 1 and 2.
9.  Select the "Create" button.

A new VS Code window opens with the project as the active workspace.

Create a virtual environment and install the requirements.

For macOS or Linux:

```
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

For Windows (PowerShell):

```
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Press **F5** to start the local HTTP server with debugging enabled. The Foundry Toolkit Agent Inspector opens for interactive testing, and you can set breakpoints in your code.

To run the server without debugging:

```
python main.py
```

The agent listens on `http://localhost:8088/`. Send a test prompt with curl (or any HTTP client):

```
curl -sS -H "Content-Type: application/json" -X POST http://localhost:8088/responses \
    -d '{"input": "Write a haiku about deploying cloud applications.", "stream": false}'
```

1.  Open the Command Palette and select **Foundry Toolkit: Deploy Hosted Agent**. A deployment webview will open.
2.  For "Deployment Method", select **Code**.
3.  Select **Remote** as the package mode.
4.  The "Agent Name" should auto-populate.
5.  Select the "Next" button.
6.  This "Review and Deploy" page should all auto-populate.
7.  Select the "Deploy" button.

When deployment completes, the agent appears under **Hosted Agents (Preview)** in the Foundry Toolkit explorer.

1.  In the Foundry Toolkit explorer, expand **Hosted Agents (Preview)** and select your agent. The detail page shows the status under **Deployment Details**.
2.  Select the **Playground** tab and send a test prompt such as `Write a haiku about deploying cloud applications.`.

Delete the resources when you're finished so you stop incurring charges.

Warning

`azd down` permanently deletes every resource in the resource group, including the Foundry project, model deployments, Container Registry, Application Insights, and the hosted agent. If you provisioned into a resource group that contains other resources, those resources are deleted too.

```
azd down
```

`azd` lists the resources it deletes and prompts for confirmation. Cleanup takes about 2-5 minutes.

1.  Open the [Azure portal](https://portal.azure.com/) and navigate to the resource group that contains your agent.
2.  Select **Delete resource group**, type the resource group name to confirm, and select **Delete**.

Warning

Deleting the resource group permanently removes everything in it, including the Foundry project, Container Registry, Application Insights, and the hosted agent.

| Issue | Solution |
| --- | --- |
| `SubscriptionNotRegistered` | Register the provider: `az provider register --namespace Microsoft.CognitiveServices`. |
| `AuthorizationFailed` during provisioning | Request the **Contributor** role on the subscription or resource group. |
| `AuthenticationError` or `DefaultAzureCredential` failure | To refresh credentials, run `azd auth logout` and then `azd auth login`. |
| `ResourceNotFound` or `DeploymentNotFound` | Verify the endpoint URL and model deployment name in the Foundry portal under **Build** > **Deployments**. |
| `Connection refused` on local run | Ensure no other process is using port 8088. |
| `azd ai agent init` fails | Run `azd version` to verify 1.25.0 or later. Update with `winget upgrade Microsoft.Azd` (Windows) or `brew upgrade azd` (macOS). Run `azd ext list` and upgrade the agent extension with `azd ext upgrade azure.ai.agents` to get 0.1.34-preview or later. |
| Microsoft Foundry Toolkit extension not found | Install the [Microsoft Foundry Toolkit for Visual Studio Code](https://aka.ms/foundrytk) from the Marketplace and switch to the prerelease channel. |
| Local run fails on Windows ARM64 with build errors for `aiohttp`, `grpcio`, `cryptography`, or `httptools` | Prebuilt arm64 wheels aren't published for these packages, and source builds require Microsoft C++ Build Tools. As a workaround, skip Step 3 and validate the agent remotely with `azd deploy` followed by `azd ai agent invoke`. |

For the full permission and role-assignment matrix, see [Hosted agent permissions reference](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/hosted-agent-permissions).

In this quickstart, you:

-   Scaffolded a hosted agent project from the Basic agent sample.
-   Tested the agent locally.
-   Deployed the agent to Foundry Agent Service.
-   Sent test prompts from both the CLI (or VS Code) and the Foundry playground.

-   [What are hosted agents?](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/hosted-agents)
-   [Trace your hosted agent](https://learn.microsoft.com/en-us/azure/foundry/observability/quickstarts/quickstart-tracing-hosted-agent)
-   [Deploy a hosted agent](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/deploy-hosted-agent)
-   [Agent development lifecycle](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/development-lifecycle)
-   [Python hosted agent samples](https://github.com/microsoft-foundry/foundry-samples/tree/main/samples/python/hosted-agents)
