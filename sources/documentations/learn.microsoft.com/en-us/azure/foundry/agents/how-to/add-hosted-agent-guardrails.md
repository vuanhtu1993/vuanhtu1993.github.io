---
title: "Add a content safety guardrail to a hosted agent - Microsoft Foundry"
source_url: "https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/add-hosted-agent-guardrails"
crawled_at: "2026-06-27T11:32:06.893Z"
---

This article shows you how to attach a content safety guardrail to a hosted agent in Microsoft Foundry. A guardrail screens the prompts your agent receives and the responses it returns against a Responsible AI (RAI) policy, so harmful content is filtered according to your organization's safety configuration.

You reference the guardrail by the RAI policy resource ID on the agent definition. The platform then applies that policy to the agent at runtime. You can set a guardrail when you deploy with the Azure Developer CLI (`azd`), the Python SDK, or the REST API. To learn what guardrails are, the risks they detect, and how to create one, see [Guardrails and controls overview](https://learn.microsoft.com/en-us/azure/foundry/guardrails/guardrails-overview).

-   A [Microsoft Foundry project](https://learn.microsoft.com/en-us/azure/foundry/how-to/create-projects).
    
-   A hosted agent, or a container image ready to deploy as one. See [Deploy a hosted agent](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/deploy-hosted-agent).
    
-   A guardrail (RAI policy) already created on the Foundry resource, and its full Azure Resource Manager (ARM) resource ID. To create one, see [Configure guardrails and controls](https://learn.microsoft.com/en-us/azure/foundry/guardrails/how-to-create-guardrails). The ARM resource ID has this form:
    
    ```
    /subscriptions/<subscription-id>/resourceGroups/<resource-group>/providers/Microsoft.CognitiveServices/accounts/<account>/raiPolicies/<policy-name>
    ```
    
-   For the Azure Developer CLI method: the `azd ai agent` extension, version 0.1.38-preview or later.
    
-   For the Python SDK method: the [Azure AI Projects client library](https://learn.microsoft.com/en-us/python/api/overview/azure/ai-projects-readme) for Python, version 2.2.0 or later:
    
    ```
    pip install "azure-ai-projects>=2.2.0"
    ```
    

A hosted agent definition has an optional `rai_config` setting with a `rai_policy_name` field. Set `rai_policy_name` to the full ARM resource ID of your guardrail's RAI policy. The platform applies that policy to the agent's prompts and responses.

When you omit `rai_config`, the agent runs without a content safety guardrail. When you include `rai_config` but omit `rai_policy_name`, the platform applies the default policy, `Microsoft.DefaultV2`. Provide a custom policy when you need stricter or organization-specific filtering.

Always use the full ARM resource ID for `rai_policy_name`, not the bare policy name.

When you use `azd`, you declare the guardrail in the `policies` list of your `agent.manifest.yaml`. Each entry has a `type` that identifies the policy kind. For a content safety guardrail, use `rai_policy` and set `rai_policy_name`.

1.  In your `agent.manifest.yaml`, add a `policies` list under `template`:
    
    ```
    template:
      kind: hosted
      name: my-hosted-agent
      description: A hosted agent with a content safety guardrail
      policies:
        - type: rai_policy
          # Full ARM resource ID of the RAI policy on the Foundry resource.
          rai_policy_name: /subscriptions/<subscription-id>/resourceGroups/<resource-group>/providers/Microsoft.CognitiveServices/accounts/<account>/raiPolicies/<policy-name>
      protocols:
        - protocol: responses
          version: "1.0.0"
    ```
    
2.  Deploy the agent:
    
    ```
    azd deploy
    ```
    

The platform attaches the guardrail when it creates the agent version.

When you create an agent version with the SDK, pass a `RaiConfig` to the `rai_config` parameter of `HostedAgentDefinition`.

```
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import (
    AgentProtocol,
    ContainerConfiguration,
    HostedAgentDefinition,
    ProtocolVersionRecord,
    RaiConfig,
)
from azure.identity import DefaultAzureCredential

# Format: "https://<resource-name>.services.ai.azure.com/api/projects/<project-name>"
PROJECT_ENDPOINT = "your_project_endpoint"

# Full ARM resource ID of the RAI policy.
RAI_POLICY_ID = (
    "/subscriptions/<subscription-id>/resourceGroups/<resource-group>"
    "/providers/Microsoft.CognitiveServices/accounts/<account>"
    "/raiPolicies/<policy-name>"
)

credential = DefaultAzureCredential()
project = AIProjectClient(
    endpoint=PROJECT_ENDPOINT,
    credential=credential,
    allow_preview=True,
)

agent = project.agents.create_version(
    agent_name="my-agent",
    definition=HostedAgentDefinition(
        cpu="1",
        memory="2Gi",
        container_configuration=ContainerConfiguration(
            image="your-registry.azurecr.io/your-image:tag",
        ),
        protocol_versions=[
            ProtocolVersionRecord(
                protocol=AgentProtocol.RESPONSES, version="1.0.0"
            )
        ],
        rai_config=RaiConfig(rai_policy_name=RAI_POLICY_ID),
    ),
)

print(f"Agent created: {agent.name}, version: {agent.version}")
```

Reference: [HostedAgentDefinition](https://learn.microsoft.com/en-us/python/api/azure-ai-projects/azure.ai.projects.models.hostedagentdefinition), [ContainerConfiguration](https://learn.microsoft.com/en-us/python/api/azure-ai-projects/azure.ai.projects.models.containerconfiguration), and [RaiConfig](https://learn.microsoft.com/en-us/python/api/azure-ai-projects/azure.ai.projects.models.raiconfig).

When you create the agent over REST, include a `rai_config` object in the `definition`.

```
BASE_URL="https://{account}.services.ai.azure.com/api/projects/{project}"
API_VERSION="v1"
TOKEN=$(az account get-access-token --resource https://ai.azure.com --query accessToken -o tsv)

curl -X POST "$BASE_URL/agents?api-version=$API_VERSION" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-agent",
    "definition": {
      "kind": "hosted",
      "image": "myacr.azurecr.io/my-agent:v1",
      "cpu": "1",
      "memory": "2Gi",
      "container_protocol_versions": [
        {"protocol": "responses", "version": "1.0.0"}
      ],
      "rai_config": {
        "rai_policy_name": "/subscriptions/<subscription-id>/resourceGroups/<resource-group>/providers/Microsoft.CognitiveServices/accounts/<account>/raiPolicies/<policy-name>"
      }
    }
  }'
```

Get the agent version and confirm that `rai_config.rai_policy_name` holds your policy ID.

```
curl -s -X GET "$BASE_URL/agents/my-agent/versions/1?api-version=$API_VERSION" \
  -H "Authorization: Bearer $TOKEN" | jq '.definition.rai_config'
```

The response includes the policy you set:

```
{
  "rai_policy_name": "/subscriptions/<subscription-id>/resourceGroups/<resource-group>/providers/Microsoft.CognitiveServices/accounts/<account>/raiPolicies/<policy-name>"
}
```

To confirm that the guardrail filters content, send a prompt that violates your safety policy to the agent's Responses endpoint. The platform screens the prompt at the input stage and rejects it before the agent runs.

```
curl -i -X POST "$BASE_URL/agents/my-agent/endpoint/protocols/openai/responses?api-version=$API_VERSION" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"input":"<a prompt that your policy is configured to block>","store":true}'
```

A blocked prompt returns `HTTP 400` with a `content_filter` error:

```
{
  "error": {
    "code": "content_filter",
    "message": "The request was blocked due to content safety policy violation at input stage.",
    "type": "content_safety_error"
  }
}
```

A prompt that passes the policy returns `HTTP 200` with the agent's response. If a harmful prompt isn't blocked, confirm that the policy referenced by `rai_policy_name` is configured to filter the relevant content category and severity.

-   [Guardrails and controls overview](https://learn.microsoft.com/en-us/azure/foundry/guardrails/guardrails-overview) — what guardrails are, the risks they detect, and where they intervene.
-   [Configure guardrails and controls](https://learn.microsoft.com/en-us/azure/foundry/guardrails/how-to-create-guardrails) — create the RAI policy you reference here.
-   [Deploy a hosted agent](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/deploy-hosted-agent) — the full deployment workflow for hosted agents.
