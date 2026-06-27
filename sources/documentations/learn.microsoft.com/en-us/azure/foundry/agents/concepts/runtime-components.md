---
title: "Build with agents, conversations, and responses in Foundry Agent Service - Microsoft Foundry"
source_url: "https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/runtime-components?source=recommendations&tabs=python"
crawled_at: "2026-06-27T11:34:56.351Z"
---

Microsoft Foundry Agent Service uses three core runtime components—**agents**, **conversations**, and **responses**—to power stateful, multi-turn interactions. An agent uses a model from the Foundry model catalog, along with instructions and tools. A conversation persists history across turns. A response is the output the agent produces when it processes input.

This article walks through each component and shows how to use them together in code. You'll learn how to create an agent, start a conversation, generate responses (with or without an agent), add follow-up messages, and stream results—with examples in Python, C#, JavaScript, Java, and REST API.

When you work with an agent, you follow a consistent pattern:

-   **Create an agent**: Define an agent to start sending messages and receiving responses.
-   **Create a conversation (optional)**: Use a conversation to maintain history across turns. If you don't use a conversation, carry forward context by using the output from a previous response.
-   **Generate a response**: The agent's Foundry model processes input items in the conversation and any instructions provided in the request. The agent might append items to the conversation.
-   **Check response status**: Monitor the response until it finishes (especially in streaming or background mode).
-   **Retrieve the response**: Display the generated response to the user.

The following diagram illustrates how these components interact in a typical agent loop.

![Diagram that shows the agent runtime loop: an agent definition and optional conversation history feed response generation, which can call tools, append items back into the conversation, and produce output items you display to the user.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782560095/aha-mind/docs-crawler/learn.microsoft.com/runtime-components_i1grzo.png)

You provide user input (and optionally conversation history), the service generates a response (including tool calls when configured), and the resulting items can be reused as context for the next turn.

To run the samples in this article, you need:

-   An Azure subscription. [Create one for free](https://azure.microsoft.com/pricing/purchase-options/azure-account?cid=msft_learn_a1b120e2-4278-114f-93cc-0f53f2009d6c).
-   A [Microsoft Foundry project](https://learn.microsoft.com/en-us/azure/foundry/how-to/create-projects).
-   The Foundry Agent Service SDK for your language:

-   [Python](#tabpanel_1_python)
-   [C#](#tabpanel_1_csharp)
-   [JavaScript](#tabpanel_1_javascript)
-   [Java](#tabpanel_1_java)
-   [REST API](#tabpanel_1_rest)

```
pip install "azure-ai-projects>=2.0.0"
pip install azure-identity
```

An agent is a persisted orchestration definition that combines AI models, instructions, code, tools, parameters, and optional safety or governance controls.

Store agents as named, versioned assets in Microsoft Foundry. During response generation, the agent definition works with interaction history (conversation or previous response) to process and respond to user input.

The following example creates a prompt agent with a name, model, and instructions. Use the project client for agent creation and versioning.

-   [Python](#tabpanel_2_python)
-   [C#](#tabpanel_2_csharp)
-   [JavaScript](#tabpanel_2_javascript)
-   [Java](#tabpanel_2_java)
-   [REST API](#tabpanel_2_rest)

```
from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import PromptAgentDefinition

# Format: "https://resource_name.services.ai.azure.com/api/projects/project_name"
PROJECT_ENDPOINT = "your_project_endpoint"

# Create project client to call Foundry API
project = AIProjectClient(
    endpoint=PROJECT_ENDPOINT,
    credential=DefaultAzureCredential(),
)

# Create a prompt agent
agent = project.agents.create_version(
    agent_name="my-agent",
    definition=PromptAgentDefinition(
        model="gpt-5-mini",
        instructions="You are a helpful assistant.",
    ),
)
print(f"Agent: {agent.name}, Version: {agent.version}")
```

Note

Agents are now identified using the agent name and agent version. They don't have a GUID called `AgentID` anymore.

For additional agent types (workflow, hosted), see [Agent development lifecycle](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/development-lifecycle).

Tools extend what an agent can do beyond generating text. When you attach tools to an agent, the agent can call external services, run code, search files, and access data sources during response generation—using tools such as web search or function calling.

You can attach one or more tools when you create an agent. During response generation, the agent decides whether to call a tool based on the user input and its instructions. The following example creates an agent with a web search tool attached.

-   [Python](#tabpanel_3_python)
-   [C#](#tabpanel_3_csharp)
-   [JavaScript](#tabpanel_3_javascript)
-   [Java](#tabpanel_3_java)
-   [REST API](#tabpanel_3_rest)

```
from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import PromptAgentDefinition, WebSearchTool

PROJECT_ENDPOINT = "your_project_endpoint"

project = AIProjectClient(
    endpoint=PROJECT_ENDPOINT,
    credential=DefaultAzureCredential(),
)

# Create an agent with a web search tool
agent = project.agents.create_version(
    agent_name="my-tool-agent",
    definition=PromptAgentDefinition(
        model="gpt-5-mini",
        instructions="You are a helpful assistant that can search the web.",
        tools=[WebSearchTool()],
    ),
)
print(f"Agent: {agent.name}, Version: {agent.version}")
```

For the full list of available tools, see the [tools overview](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/tool-catalog). For best practices, see [Best practices for using tools](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/tool-best-practice).

Response generation invokes the agent. The agent uses its configuration and any provided history (conversation or previous response) to perform tasks by calling models and tools. As part of response generation, the agent appends items to the conversation.

You can also generate a response without defining an agent. In this case, you provide all configurations directly in the request and use them only for that response. This approach is useful for simple scenarios with minimal tools.

Additionally, you can fork the conversation at the first response ID or second response ID

The following example generates a response using an agent reference, then sends a follow-up question using the previous response as context.

-   [Python](#tabpanel_4_python)
-   [C#](#tabpanel_4_csharp)
-   [JavaScript](#tabpanel_4_javascript)
-   [Java](#tabpanel_4_java)
-   [REST API](#tabpanel_4_rest)

```
from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient

# Format: "https://resource_name.services.ai.azure.com/api/projects/project_name"
PROJECT_ENDPOINT = "your_project_endpoint"
AGENT_NAME = "your_agent_name"

# Create clients to call Foundry API
project = AIProjectClient(
    endpoint=PROJECT_ENDPOINT,
    credential=DefaultAzureCredential(),
)
openai = project.get_openai_client()

# Generate a response using the agent
response = openai.responses.create(
    extra_body={
        "agent_reference": {
            "name": AGENT_NAME,
            "type": "agent_reference",
        }
    },
    input="What is the largest city in France?",
)
print(response.output_text)

# Ask a follow-up question using the previous response
follow_up = openai.responses.create(
    extra_body={
        "agent_reference": {
            "name": AGENT_NAME,
            "type": "agent_reference",
        }
    },
    previous_response_id=response.id,
    input="What is the population of that city?",
)
print(follow_up.output_text)
```

When an agent uses tools during response generation, the response output contains tool call items alongside the final message. You can iterate over `response.output` to inspect each item and display tool calls—such as web searches, function calls, or file searches—before printing the text response.

-   [Python](#tabpanel_5_python)
-   [C#](#tabpanel_5_csharp)
-   [JavaScript](#tabpanel_5_javascript)
-   [Java](#tabpanel_5_java)
-   [REST API](#tabpanel_5_rest)

```
from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient

PROJECT_ENDPOINT = "your_project_endpoint"
AGENT_NAME = "your_agent_name"

project = AIProjectClient(
    endpoint=PROJECT_ENDPOINT,
    credential=DefaultAzureCredential(),
)
openai = project.get_openai_client()

response = openai.responses.create(
    extra_body={
        "agent_reference": {
            "name": AGENT_NAME,
            "type": "agent_reference",
        }
    },
    input="What happened in the news today?",
)

# Print each output item, including tool calls
for item in response.output:
    if item.type == "web_search_call":
        print(f"[Tool] Web search: status={item.status}")
    elif item.type == "function_call":
        print(f"[Tool] Function call: {item.name}({item.arguments})")
    elif item.type == "file_search_call":
        print(f"[Tool] File search: status={item.status}")
    elif item.type == "message":
        print(f"[Assistant] {item.content[0].text}")
```

By default, the service stores response history server-side, so you can reference `previous_response_id` for multi-turn context. If you set `store` to `false`, the service doesn't persist the response. You must carry forward the conversation context yourself by passing previous output items as input to the next request.

This approach is useful when you need full control over conversation state, want to minimize stored data, or work in a zero-data-retention environment.

-   [Python](#tabpanel_6_python)
-   [C#](#tabpanel_6_csharp)
-   [JavaScript](#tabpanel_6_javascript)
-   [Java](#tabpanel_6_java)
-   [REST API](#tabpanel_6_rest)

```
from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient

PROJECT_ENDPOINT = "your_project_endpoint"
AGENT_NAME = "your_agent_name"

project = AIProjectClient(
    endpoint=PROJECT_ENDPOINT,
    credential=DefaultAzureCredential(),
)
openai = project.get_openai_client()

# Generate a response without storing
response = openai.responses.create(
    extra_body={
        "agent_reference": {
            "name": AGENT_NAME,
            "type": "agent_reference",
        }
    },
    input="What is the largest city in France?",
    store=False,
)
print(response.output_text)

# Carry forward context client-side by passing previous output as input
follow_up = openai.responses.create(
    extra_body={
        "agent_reference": {
            "name": AGENT_NAME,
            "type": "agent_reference",
        }
    },
    input=[
        {"role": "user", "content": "What is the largest city in France?"},
        {"role": "assistant", "content": response.output_text},
        {"role": "user", "content": "What is the population of that city?"},
    ],
    store=False,
)
print(follow_up.output_text)
```

Conversations are durable objects with unique identifiers. After creation, you can reuse them across sessions.

Conversations store items, which can include messages, tool calls, tool outputs, and other data.

The following example creates a conversation with an initial user message. Use the OpenAI client (obtained from the project client) for conversations and responses.

-   [Python](#tabpanel_7_python)
-   [C#](#tabpanel_7_csharp)
-   [JavaScript](#tabpanel_7_javascript)
-   [Java](#tabpanel_7_java)
-   [REST API](#tabpanel_7_rest)

```
from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient

# Format: "https://resource_name.services.ai.azure.com/api/projects/project_name"
PROJECT_ENDPOINT = "your_project_endpoint"

# Create clients to call Foundry API
project = AIProjectClient(
    endpoint=PROJECT_ENDPOINT,
    credential=DefaultAzureCredential(),
)
openai = project.get_openai_client()

# Create a conversation with an initial user message
conversation = openai.conversations.create(
    items=[
        {
            "type": "message",
            "role": "user",
            "content": "What is the largest city in France?",
        }
    ],
)
print(f"Conversation ID: {conversation.id}")
```

Use a conversation when you want:

-   **Multi-turn continuity**: Keep a stable history across turns without rebuilding context yourself.
-   **Cross-session continuity**: Reuse the same conversation for a user who returns later.
-   **Easier debugging**: Inspect what happened over time (for example, tool calls and outputs).

When a conversation is used to generate a response (with or without an agent), the full conversation is provided as input to the model. The generated response is then appended to the same conversation.

Note

If the conversation exceeds the model's supported context size, the model will automatically truncate the input context. The conversation itself is not truncated, but only a subset of it is used to generate the response.

If you don't create a conversation, you can still build multi-turn flows by using the output from a previous response as the starting point for the next request. This approach gives you more flexibility than the older thread-based pattern, where state was tightly coupled to thread objects. For migration guidance, see [Migrate to the Agents SDK](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/migrate).

Conversations store **items** rather than only chat messages. Items capture what happened during response generation so the next turn can reuse that context.

Common item types include:

-   **Message items**: User or assistant messages.
-   **Tool call items**: Records of tool invocations the agent attempted.
-   **Tool output items**: Outputs returned by tools (for example, retrieval results).
-   **Output items**: The response content you display back to the user.

After you create a conversation, use `conversations.items.create()` to add subsequent user messages or other items.

-   [Python](#tabpanel_8_python)
-   [C#](#tabpanel_8_csharp)
-   [JavaScript](#tabpanel_8_javascript)
-   [Java](#tabpanel_8_java)
-   [REST API](#tabpanel_8_rest)

```
# Add a follow-up message to an existing conversation
openai.conversations.items.create(
    conversation_id=conversation.id,
    items=[
        {
            "type": "message",
            "role": "user",
            "content": "What about Germany?",
        }
    ],
)
```

Combine a conversation with an agent reference to maintain history across multiple turns. The agent processes all items in the conversation and appends its output automatically.

-   [Python](#tabpanel_9_python)
-   [C#](#tabpanel_9_csharp)
-   [JavaScript](#tabpanel_9_javascript)
-   [Java](#tabpanel_9_java)
-   [REST API](#tabpanel_9_rest)

```
from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient

PROJECT_ENDPOINT = "your_project_endpoint"
AGENT_NAME = "your_agent_name"

# Create clients to call Foundry API
project = AIProjectClient(
    endpoint=PROJECT_ENDPOINT,
    credential=DefaultAzureCredential(),
)
openai = project.get_openai_client()

# Create a conversation for multi-turn chat
conversation = openai.conversations.create()

# First turn
response = openai.responses.create(
    conversation=conversation.id,
    extra_body={
        "agent_reference": {
            "name": AGENT_NAME,
            "type": "agent_reference",
        }
    },
    input="What is the largest city in France?",
)
print(response.output_text)

# Follow-up turn in the same conversation
follow_up = openai.responses.create(
    conversation=conversation.id,
    extra_body={
        "agent_reference": {
            "name": AGENT_NAME,
            "type": "agent_reference",
        }
    },
    input="What is the population of that city?",
)
print(follow_up.output_text)
```

For examples that show how conversations and responses work together in code, see [Create and use memory in Foundry Agent Service](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/memory-usage).

For long running operations, you can return results incrementally using `streaming` or run completely asynchronously using `background` mode. In these cases, you typically monitor the response until it finishes and then consume the final output items.

Streaming returns partial results as they're generated. This approach is useful for showing output to users in real time.

-   [Python](#tabpanel_10_python)
-   [C#](#tabpanel_10_csharp)
-   [JavaScript](#tabpanel_10_javascript)
-   [Java](#tabpanel_10_java)
-   [REST API](#tabpanel_10_rest)

```
from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient

# Format: "https://resource_name.services.ai.azure.com/api/projects/project_name"
PROJECT_ENDPOINT = "your_project_endpoint"
AGENT_NAME = "your_agent_name"

# Create clients to call Foundry API
project = AIProjectClient(
    endpoint=PROJECT_ENDPOINT,
    credential=DefaultAzureCredential(),
)
openai = project.get_openai_client()

# Stream a response using the agent
stream = openai.responses.create(
    extra_body={
        "agent_reference": {
            "name": AGENT_NAME,
            "type": "agent_reference",
        }
    },
    input="Explain how agents work in one paragraph.",
    stream=True,
)
for event in stream:
    if hasattr(event, "delta") and event.delta:
        print(event.delta, end="", flush=True)
```

For details about response modes and how to consume outputs, see [Responses API](https://learn.microsoft.com/en-us/azure/foundry/openai/how-to/responses).

Background mode runs the agent asynchronously, which is useful for long-running tasks such as complex reasoning or image generation. Set `background` to `true` and then poll for the response status until it completes.

-   [Python](#tabpanel_11_python)
-   [C#](#tabpanel_11_csharp)
-   [JavaScript](#tabpanel_11_javascript)
-   [Java](#tabpanel_11_java)
-   [REST API](#tabpanel_11_rest)

```
from time import sleep
from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient

PROJECT_ENDPOINT = "your_project_endpoint"
AGENT_NAME = "your_agent_name"

# Create clients to call Foundry API
project = AIProjectClient(
    endpoint=PROJECT_ENDPOINT,
    credential=DefaultAzureCredential(),
)
openai = project.get_openai_client()

# Start a background response using the agent
response = openai.responses.create(
    extra_body={
        "agent_reference": {
            "name": AGENT_NAME,
            "type": "agent_reference",
        }
    },
    input="Write a detailed analysis of renewable energy trends.",
    background=True,
)

# Poll until the response completes
while response.status in ("queued", "in_progress"):
    sleep(2)
    response = openai.responses.retrieve(response.id)

print(response.output_text)
```

Memory gives agents the ability to retain information across sessions, so they can personalize responses and recall user preferences over time. Without memory, each conversation starts from scratch.

Foundry Agent Service provides a managed memory solution (preview) that you configure through **memory stores**. A memory store defines which types of information the agent should retain. Attach a memory store to your agent, and the agent uses stored memories as additional context during response generation.

The following example creates a memory store and attaches it to an agent.

-   [Python](#tabpanel_12_python)
-   [C#](#tabpanel_12_csharp)
-   [JavaScript](#tabpanel_12_javascript)
-   [Java](#tabpanel_12_java)
-   [REST API](#tabpanel_12_rest)

```
from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import (
    MemoryStoreDefaultDefinition,
    MemoryStoreDefaultOptions,
)

PROJECT_ENDPOINT = "your_project_endpoint"

project = AIProjectClient(
    endpoint=PROJECT_ENDPOINT,
    credential=DefaultAzureCredential(),
)

# Create a memory store
options = MemoryStoreDefaultOptions(
    chat_summary_enabled=True,
    user_profile_enabled=True,
)
definition = MemoryStoreDefaultDefinition(
    chat_model="gpt-5.2",
    embedding_model="text-embedding-3-small",
    options=options,
)
memory_store = project.beta.memory_stores.create(
    name="my_memory_store",
    definition=definition,
    description="Memory store for my agent",
)
print(f"Memory store: {memory_store.name}")
```

For conceptual details, see [Memory in Foundry Agent Service](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/what-is-memory). For full implementation guidance, see [Create and use memory](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/memory-usage).

Because conversations and responses can persist user-provided content and tool outputs, treat runtime data like application data:

-   **Avoid storing secrets in prompts or conversation history**. Use connections and managed secret stores instead (for example, [Set up a Key Vault connection](https://learn.microsoft.com/en-us/azure/foundry/how-to/set-up-key-vault-connection)).
-   **Use least privilege for tool access**. When a tool accesses external systems, the agent can potentially read or send data through that tool.
-   **Be careful with non-Microsoft services**. If your agent calls tools backed by non-Microsoft services, some data might flow to those services. For related considerations, see [Discover tools in the Foundry Tools](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/tool-catalog).

Limits can depend on the model, region, and the tools you attach (for example, streaming availability and tool support). For current availability and constraints for responses, see [Responses API](https://learn.microsoft.com/en-us/azure/foundry/openai/how-to/responses).

-   [Agent development lifecycle](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/development-lifecycle)
-   [Discover tools in the Foundry Tools](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/tool-catalog)
-   [Best practices for using tools in Microsoft Foundry Agent Service](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/tool-best-practice)
-   [Agent applications in Microsoft Foundry](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/agent-applications)
-   [Agent tracing overview](https://learn.microsoft.com/en-us/azure/foundry/observability/concepts/trace-agent-concept)
-   [Migrate to the new agents developer experience](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/migrate)
-   [Create and use memory in Foundry Agent Service](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/memory-usage)
