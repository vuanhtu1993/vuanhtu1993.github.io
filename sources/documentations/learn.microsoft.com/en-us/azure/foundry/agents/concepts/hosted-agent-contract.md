---
title: "Hosted agent runtime contract - Microsoft Foundry"
source_url: "https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/hosted-agent-contract?tabs=python"
crawled_at: "2026-06-27T11:32:12.191Z"
---

Important

Items marked (preview) in this article are currently in public preview. This preview is provided without a service-level agreement, and we don't recommend it for production workloads. Certain features might not be supported or might have constrained capabilities. For more information, see [Supplemental Terms of Use for Microsoft Azure Previews](https://azure.microsoft.com/support/legal/preview-supplemental-terms/).

A hosted agent is a container that fulfills a specific runtime contract with the Microsoft Foundry platform. This reference describes what the platform expects from your container and how the SDK adapter packages help you meet those requirements.

The SDK adapter packages implement the entire contract for you. If you use `azure-ai-agentserver-responses` or `azure-ai-agentserver-invocations`, you implement only your handler logic.

Your container must:

| Requirement | Detail |
| --- | --- |
| Listen on port 8088 | HTTP/1.1, plain HTTP. The platform terminates TLS. |
| Serve a health probe | Return `200 OK` from `GET /readiness`. |
| Implement a protocol endpoint | Serve at least one of `POST /responses` or `POST /invocations`. |
| Consume platform environment variables | Read the variables the platform injects at startup. |
| Shut down gracefully | Flush writes and close connections on `SIGTERM`. |

A protocol defines the HTTP contract between Foundry and your agent container. Your container implements at least one protocol endpoint.

The responses protocol implements the OpenAI Responses API. The platform sends requests to `POST /responses` and expects either a JSON response or a Server-Sent Events (SSE) stream.

| Aspect | Detail |
| --- | --- |
| Endpoint | `POST /responses` |
| Input | OpenAI Responses API request (`input`, `model`, `stream`, and so on) |
| Output | JSON response object or SSE stream of response events |
| Conversation history | Hydrated automatically by the SDK adapter when `conversation.id` is present |
| Streaming | SSE with the `text/event-stream` content type |

Use the responses protocol as the standard choice. It's compatible with the OpenAI API ecosystem.

The invocations protocol is a minimal pass-through protocol. You define the payload structure, and the platform passes it through without interpretation.

| Aspect | Detail |
| --- | --- |
| Endpoint | `POST /invocations` |
| Input | Any JSON payload your handler expects |
| Output | Any JSON response or SSE stream |
| Conversation history | Not managed. Your code handles state if needed. |
| Streaming | Optional, through SSE |

Use the invocations protocol when you need full control over the request and response payloads.

The adapter packages are protocol-specific and framework-agnostic. They work with any agent framework, including Microsoft Agent Framework, LangGraph, and custom code.

| Protocol | Python package | .NET package |
| --- | --- | --- |
| Responses | `azure-ai-agentserver-responses` | `Azure.AI.AgentServer.Responses` |
| Invocations | `azure-ai-agentserver-invocations` | `Azure.AI.AgentServer.Invocations` |

The adapter handles the following parts of the contract for you:

-   HTTP server setup on port 8088.
-   The health probe endpoint (`GET /readiness`).
-   Protocol-specific request parsing and response formatting.
-   Conversation history hydration (responses protocol).
-   SSE streaming infrastructure.
-   OpenTelemetry instrumentation.
-   Graceful shutdown on `SIGTERM`.
-   Platform environment variable consumption.

You implement a handler function that receives parsed requests and returns responses.

The complete bring-your-own samples for both protocols and both languages are in the [foundry-samples](https://github.com/microsoft-foundry/foundry-samples/tree/main/samples) repository.

This minimal handler forwards user input to a model from the Foundry model catalog through the Responses API. The SDK adapter hydrates conversation history automatically through `context.get_history()` (Python) or `context.GetHistoryAsync()` (C#), so the agent maintains context across turns.

-   [Python](#tabpanel_1_python)
-   [C#](#tabpanel_1_csharp)

From [`bring-your-own/responses/hello-world/main.py`](https://github.com/microsoft-foundry/foundry-samples/blob/main/samples/python/hosted-agents/bring-your-own/responses/hello-world/main.py):

```
import asyncio
import os

from azure.ai.agentserver.responses import (
    CreateResponse,
    ResponseContext,
    ResponsesAgentServerHost,
    ResponsesServerOptions,
    TextResponse,
)
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential

# FOUNDRY_PROJECT_ENDPOINT is auto-injected in hosted Foundry containers and
# set by 'azd ai agent run' for local development.
_endpoint = os.environ["FOUNDRY_PROJECT_ENDPOINT"]
_model = os.environ["AZURE_AI_MODEL_DEPLOYMENT_NAME"]

_project_client = AIProjectClient(
    endpoint=_endpoint, credential=DefaultAzureCredential()
)
_responses_client = _project_client.get_openai_client().responses

app = ResponsesAgentServerHost(
    options=ResponsesServerOptions(default_fetch_history_count=20),
)

@app.response_handler
async def handler(
    request: CreateResponse,
    context: ResponseContext,
    _cancellation_signal: asyncio.Event,
):
    user_input = await context.get_input_text() or "Hello!"
    history = await context.get_history()

    # Build the model input from prior conversation turns + the current message.
    input_items = []
    for item in history:
        # Map history items to {"role": ..., "content": ...} dicts; see the
        # full sample for the unpacking helper.
        ...
    input_items.append({"role": "user", "content": user_input})

    response = await asyncio.get_running_loop().run_in_executor(
        None,
        lambda: _responses_client.create(
            model=_model,
            instructions="You are a helpful AI assistant.",
            input=input_items,
            store=False,  # platform manages history; don't store at model level
        ),
    )

    return TextResponse(context, request, text=response.output_text)

app.run()
```

Reference: [ResponsesAgentServerHost](https://github.com/microsoft-foundry/foundry-samples/tree/main/samples/python/hosted-agents), [AIProjectClient](https://learn.microsoft.com/en-us/python/api/azure-ai-projects/azure.ai.projects.aiprojectclient), [DefaultAzureCredential](https://learn.microsoft.com/en-us/python/api/azure-identity/azure.identity.defaultazurecredential)

With the invocations protocol, your handler receives whatever JSON the caller posts and returns whatever JSON your code chooses. There's no built-in conversation history.

-   [Python](#tabpanel_2_python)
-   [C#](#tabpanel_2_csharp)

Pattern from [`bring-your-own/invocations/hello-world`](https://github.com/microsoft-foundry/foundry-samples/tree/main/samples/python/hosted-agents/bring-your-own/invocations/hello-world):

```
from starlette.requests import Request
from starlette.responses import JSONResponse, Response
from azure.ai.agentserver.invocations import InvocationAgentServerHost

app = InvocationAgentServerHost()

@app.invoke_handler
async def handle_invoke(request: Request) -> Response:
    data = await request.json()
    message = data.get("message", "Hello!")
    return JSONResponse({"echo": message})

if __name__ == "__main__":
    app.run()
```

The full samples also include conversation-history hydration, error handling, telemetry, toolbox integration, and Dockerfile and `agent.yaml` setup.

The platform sends `GET /readiness` to determine whether your container is ready to serve traffic. Return `200 OK` when the container is ready, or a non-200 status to signal that the platform should restart the instance. The SDK adapters register this endpoint automatically.

| Property | Value |
| --- | --- |
| Protocol | HTTP/1.1 |
| Default port | 8088 (override with the `PORT` environment variable) |
| Bind address | `0.0.0.0` (all interfaces) |
| TLS | Terminated by the platform. Your container serves plain HTTP. |

When the platform sends `SIGTERM`, your container stops accepting new requests, finishes in-flight requests, flushes pending writes to `$HOME` (the session filesystem), and exits cleanly. The SDK adapters handle this sequence automatically.

The platform injects environment variables into your container at startup. Your code can read the following key variables:

| Variable | Purpose |
| --- | --- |
| `FOUNDRY_PROJECT_ENDPOINT` | Foundry project endpoint for API calls |
| `FOUNDRY_AGENT_NAME` | The agent's name |
| `FOUNDRY_AGENT_VERSION` | The agent's version |
| `FOUNDRY_AGENT_SESSION_ID` | The current session ID |

-   [What are hosted agents?](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/hosted-agents)
-   [Agent development lifecycle](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/development-lifecycle)
-   [Python hosted agent samples](https://github.com/microsoft-foundry/foundry-samples/tree/main/samples/python/hosted-agents)
