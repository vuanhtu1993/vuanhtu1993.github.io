---
title: "Quickstart: Create a prompt agent - Microsoft Foundry"
source_url: "https://learn.microsoft.com/en-us/azure/foundry/agents/quickstarts/prompt-agent?tabs=python"
crawled_at: "2026-06-27T11:31:40.273Z"
---

In this quickstart, you create a prompt agent in Foundry Agent Service and have a conversation with it. A prompt agent is a declaratively defined agent that combines a model from the Foundry model catalog, instructions, tools, and natural language prompts to drive behavior.

If you don't have an Azure subscription, create a [free account](https://azure.microsoft.com/pricing/purchase-options/azure-account?cid=msft_learn_9f9a48bb-279a-2128-9321-8d47fc0210c9).

-   A model deployed in Microsoft Foundry. If you don't have a model, first complete [Quickstart: Set up Microsoft Foundry resources](https://learn.microsoft.com/en-us/azure/foundry/tutorials/quickstart-create-foundry-resources).
-   The required language runtimes, global tools, and Visual Studio Code extensions as described in [Prepare your development environment](https://learn.microsoft.com/en-us/azure/foundry/how-to/develop/install-cli-sdk).

Store [your project endpoint](https://learn.microsoft.com/en-us/azure/foundry/tutorials/quickstart-create-foundry-resources#get-your-project-connection-details) as an environment variable. Also set these values for use in your scripts.

**Python and JavaScript**

```
PROJECT_ENDPOINT=<endpoint copied from welcome screen>
AGENT_NAME="MyAgent"
```

**C# and Java**

```
ProjectEndpoint = <endpoint copied from welcome screen>
AgentName = "MyAgent"
```

Make sure you install the correct version of the packages as shown here.

-   [Python](#tabpanel_1_python)
-   [C#](#tabpanel_1_csharp)
-   [TypeScript](#tabpanel_1_typescript)
-   [Java](#tabpanel_1_java)
-   [REST API](#tabpanel_1_rest)
-   [Foundry portal](#tabpanel_1_portal)

1.  Install the current version of `azure-ai-projects`. This version uses the **Foundry projects (new) API** .
    
    ```
    pip install azure-ai-projects>=2.0.0
    ```
    
2.  Sign in using the CLI `az login` command to authenticate before running your Python scripts.
    

Create a prompt agent using your deployed model. The agent uses a `PromptAgentDefinition` with instructions that define the agent's behavior. You can update or delete agents anytime.

-   [Python](#tabpanel_1_python)
-   [C#](#tabpanel_1_csharp)
-   [TypeScript](#tabpanel_1_typescript)
-   [Java](#tabpanel_1_java)
-   [REST API](#tabpanel_1_rest)

```
from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import PromptAgentDefinition

# Format: "https://resource_name.ai.azure.com/api/projects/project_name"
PROJECT_ENDPOINT = "your_project_endpoint"
AGENT_NAME = "your_agent_name"

# Create project client to call Foundry API
project = AIProjectClient(
    endpoint=PROJECT_ENDPOINT,
    credential=DefaultAzureCredential(),
)

# Create an agent with a model and instructions
agent = project.agents.create_version(
    agent_name=AGENT_NAME,
    definition=PromptAgentDefinition(
        model="gpt-5-mini",  # supports all Foundry direct models"
        instructions="You are a helpful assistant that answers general questions",
    ),
)
print(f"Agent created (id: {agent.id}, name: {agent.name}, version: {agent.version})")
```

The output confirms the agent was created. You see the agent name and ID printed to the console.

Use the agent you created to interact by asking a question and a related follow-up. The conversation maintains history across these interactions.

-   [Python](#tabpanel_2_python)
-   [C#](#tabpanel_2_csharp)
-   [TypeScript](#tabpanel_2_typescript)
-   [Java](#tabpanel_2_java)
-   [REST API](#tabpanel_2_rest)

```
from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient

# Format: "https://resource_name.ai.azure.com/api/projects/project_name"
PROJECT_ENDPOINT = "your_project_endpoint"
AGENT_NAME = "your_agent_name"

# Create project and openai clients to call Foundry API
project = AIProjectClient(
    endpoint=PROJECT_ENDPOINT,
    credential=DefaultAzureCredential(),
)
openai = project.get_openai_client()

# Create a conversation for multi-turn chat
conversation = openai.conversations.create()

# Chat with the agent to answer questions
response = openai.responses.create(
    conversation=conversation.id,
    extra_body={"agent_reference": {"name": AGENT_NAME, "type": "agent_reference"}},
    input="What is the size of France in square miles?",
)
print(response.output_text)

# Ask a follow-up question in the same conversation
response = openai.responses.create(
    conversation=conversation.id,
    extra_body={"agent_reference": {"name": AGENT_NAME, "type": "agent_reference"}},
    input="And what is the capital city?",
)
print(response.output_text)
```

You see the agent's responses to both prompts. The follow-up response demonstrates that the agent maintains conversation history across turns.

If you no longer need any of the resources you created, delete the resource group associated with your project.

-   In the [Azure portal](https://portal.azure.com/), select the resource group, and then select **Delete**. Confirm that you want to delete the resource group.

-   [Agent development lifecycle](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/development-lifecycle)
-   [What is Foundry Agent Service?](https://learn.microsoft.com/en-us/azure/foundry/agents/overview)
-   [Use tools with agents](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/model-context-protocol)
-   [Quickstart: Deploy your first hosted agent](https://learn.microsoft.com/en-us/azure/foundry/agents/quickstarts/quickstart-hosted-agent)
