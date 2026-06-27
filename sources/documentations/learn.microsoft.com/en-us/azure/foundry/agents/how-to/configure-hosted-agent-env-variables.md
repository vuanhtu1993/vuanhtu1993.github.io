---
title: "Configure environment variables for a hosted agent - Microsoft Foundry"
source_url: "https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/configure-hosted-agent-env-variables"
crawled_at: "2026-06-27T11:35:32.444Z"
---

Important

Items marked (preview) in this article are currently in public preview. This preview is provided without a service-level agreement, and we don't recommend it for production workloads. Certain features might not be supported or might have constrained capabilities. For more information, see [Supplemental Terms of Use for Microsoft Azure Previews](https://azure.microsoft.com/support/legal/preview-supplemental-terms/).

Configure environment variables for your hosted agent by defining where values belong, what the Microsoft Foundry platform provides automatically, and how azd environment integration works. You also learn how to add custom variables and handle local development secrets.

-   An initialized hosted agent project with an `agent.yaml` file. To create a project, see [Initialize an agent project](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/init-agent-project).
-   The azd Foundry extensions installed. For installation steps, see [Install the azd Foundry extensions](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/install-cli-foundry-extensions).
-   An authenticated Azure Developer CLI session. Run `azd auth login` if needed.
-   An active azd environment. Select or create one with `azd env select` or `azd env new`.

Define environment variables in the `environment_variables` section of your `agent.yaml`, not in your Dockerfile. This keeps your container image portable and lets you change configuration without rebuilding.

```
kind: hosted
name: my-agent
environment_variables:
  - name: AZURE_AI_MODEL_DEPLOYMENT_NAME
    value: ${AZURE_AI_MODEL_DEPLOYMENT_NAME}
  - name: MY_CUSTOM_VAR
    value: ${MY_CUSTOM_VAR}
```

The `${VAR_NAME}` syntax references azd environment variables, which are resolved at deploy time from `.azure/<env>/.env`.

Note

**Why not the Dockerfile?** Values baked into a Dockerfile are fixed at image build time and visible to anyone with access to the image. Using `agent.yaml` lets you change values per environment and keeps secrets out of the image layer.

Important

**Do not declare `FOUNDRY_PROJECT_ENDPOINT` in `agent.yaml`.** The platform injects it automatically into hosted containers, and `azd ai agent run` sets it for local development from the active azd env. Declaring it explicitly is redundant and risks shadowing the platform-managed value.

1.  Add or change a variable in your current azd environment:
    
    ```
    azd env set MY_CUSTOM_VAR=my-value
    ```
    
2.  View all current values:
    
    ```
    azd env get-values
    ```
    
    These values are stored in `.azure/<env-name>/.env` and resolved into your `agent.yaml` at deploy time.
    

The Foundry platform automatically injects the following environment variables into every hosted agent container at startup. These variables are read-only. Your agent code should consume them but never override them.

| Variable | Description |
| --- | --- |
| `FOUNDRY_AGENT_NAME` | The agent's name, such as `my-weather-agent`. |
| `FOUNDRY_AGENT_VERSION` | The agent's version. |
| `FOUNDRY_PROJECT_ENDPOINT` | Foundry project endpoint, such as `https://{account}.services.ai.azure.com/api/projects/{project}`. |
| `FOUNDRY_AGENT_SESSION_ID` | The agent's session ID. |
| `FOUNDRY_PROJECT_ARM_ID` | The project's full ARM resource ID. |

Note

**Reserved prefix:** All `AGENT_*` and `FOUNDRY_*` environment variables are reserved for platform use and are automatically injected into the container.

During local development with `azd ai agent run`, azd sets `FOUNDRY_PROJECT_ENDPOINT` automatically from your azd environment so your agent code works the same locally and when deployed.

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `8088` | HTTP listen port. Only set when the platform requires a non-default port. |
| `SSE_KEEPALIVE_INTERVAL` | Disabled | SSE keep-alive comment interval in seconds. |

| Variable | Description |
| --- | --- |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Azure Monitor connection string for telemetry export. |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | OTLP collector endpoint for OpenTelemetry. |

| Variable | Default | Description |
| --- | --- | --- |
| `HOME` | `/home/session` | Filesystem path to persisted session data. |

1.  Define it in `agent.yaml`:
    
    ```
    environment_variables:
      - name: MY_API_URL
        value: ${MY_API_URL}
    ```
    
2.  Set the value in your azd environment:
    
    ```
    azd env set MY_API_URL=https://api.example.com
    ```
    
3.  Redeploy:
    
    ```
    azd deploy
    ```
    

For local development, `azd ai agent run` also resolves `${VAR}` from the azd environment, so the same setup works locally.

For secrets such as API keys and tokens, don't use environment variables. Instead, use `secret: true` parameters and connection resources in `agent.yaml`.

```
parameters:
  api_key:
    secret: true
    description: API key for external service

resources:
  - kind: connection
    name: MyServiceConnection
    target: https://api.example.com
    category: remoteTool
    credentials:
        type: CustomKeys
        keys:
            Authorization: "Bearer {{ api_key }}"
```

For local runs with `azd ai agent run`, set values as `azd` environment variables and reference them in `agent.yaml`. `azd` stores environment values in `.azure/<env>/.env`, which is gitignored by default, so they stay out of source control.

```
azd env set OPENAI_KEY <value>
```

```
environment_variables:
  - name: OPENAI_KEY
    value: ${OPENAI_KEY}
```

For secrets that shouldn't live in a local `.env` file, store them in a Foundry project connection and reference them with a `${{connections.<name>.credentials.<field>}}` placeholder. The platform resolves the placeholder at runtime. See [Run a hosted agent locally with the Azure Developer CLI](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/run-hosted-agent-locally) for the local run workflow.

-   [Agent YAML reference](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/agent-yaml-reference) for variable substitution syntax.
-   [Azure YAML reference](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/azure-yaml-reference) for azd environments and `azd env set`.
-   [Deploy a hosted agent](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/deploy-hosted-agent) to redeploy after configuration changes.
