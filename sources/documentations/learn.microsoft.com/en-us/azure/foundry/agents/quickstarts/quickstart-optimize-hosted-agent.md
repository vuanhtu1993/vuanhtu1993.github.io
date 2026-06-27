---
title: "Quickstart: Optimize a hosted agent (preview) - Microsoft Foundry"
source_url: "https://learn.microsoft.com/en-us/azure/foundry/agents/quickstarts/quickstart-optimize-hosted-agent?source=recommendations"
crawled_at: "2026-06-27T11:35:47.159Z"
---

Important

Agent Optimizer is currently in preview. This preview is provided without a service-level agreement, and we don't recommend it for production workloads. Certain features might not be supported or might have constrained capabilities. For more information, see [Supplemental Terms of Use for Microsoft Azure Previews](https://azure.microsoft.com/support/legal/preview-supplemental-terms/).

In this quickstart, you deploy the optimization sample agent, run the agent optimizer to improve its instructions, and deploy the winning candidate.

Before you begin, you need:

-   An Azure subscription--[Create one for free](https://azure.microsoft.com/pricing/purchase-options/azure-account?cid=msft_learn_c997525c-f713-939d-fe74-b3c4d0ec7a94).
    
-   [azd CLI](https://aka.ms/azd) (Azure Developer CLI).
    
-   [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) for authentication.
    
-   The `microsoft.foundry` extension for azd (0.1.40-preview or later of the `azure.ai.agents` dependency):
    
    ```
    azd ext install microsoft.foundry
    ```
    
    If already installed, upgrade:
    
    ```
    azd ext upgrade microsoft.foundry
    ```
    
-   Your Azure subscription must be on the allow list for the agent optimizer. Contact your Microsoft representative to request access.
    

Note

Hosted agents and the agent optimizer are currently in preview.

Initialize a new project from the optimization sample template:

```
mkdir my-agent && cd my-agent
azd ai agent init -m https://github.com/microsoft-foundry/foundry-samples/blob/main/samples/python/hosted-agents/bring-your-own/responses/optimization-customer-support/agent.manifest.yaml .
```

The interactive flow prompts for your Azure subscription, region, and model deployment settings. It generates `agent.yaml`, `.agent_configs/baseline/`, the evaluation dataset, and infrastructure files.

Tip

If you already have an existing agent project, see [Make your agent optimizer-ready](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/make-agent-optimizer-ready) to add optimization support.

If you already have a Foundry project, add `-p <project-resource-id>` to target existing resources.

Authenticate and provision the Azure resources:

```
az login
azd auth login
azd provision
```

Provisioning takes approximately two minutes and creates a Foundry account, project, Azure Container Registry, and model deployments.

Deploy the agent:

```
azd deploy
```

Test the deployment:

```
azd ai agent invoke "What is 2+2?"
```

Generate an evaluation dataset and evaluators for your agent:

```
azd ai agent eval generate
```

This step creates `eval.yaml`, a test dataset, and scoring evaluators based on your agent's instructions. The optimizer uses these files to measure improvement.

Run the optimizer:

```
azd ai agent optimize --max-candidates 2
```

The CLI prompts you to select an optimization model. To skip the prompt, pass it directly:

```
azd ai agent optimize --max-candidates 2 --optimize-model gpt-5
```

The CLI detects your agent from `agent.yaml` and uses the generated `eval.yaml` automatically. With two candidates, optimization typically completes in about 8 minutes. Real-time progress is shown:

```
Optimizing agent "customer-support-py"...
  Config: eval.yaml
  Baseline saved to .agent_configs/baseline/metadata.yaml
  Job ID: opt_162bd0f09....
  Status: pending
  Portal: <OPTIMIZATION-JOB-URL>
```

Use the portal URL to monitor your job in the Foundry portal.

The _eval model_ scores each response (any chat-completion model works). The _optimization model_ (`--optimize-model`) generates improved candidates and must be from the [supported list](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/agent-optimizer-overview#models) (gpt-5 family or DeepSeek). You can also set `optimization_model` under `options:` in `eval.yaml` to avoid passing the flag each time.

The ★ in the output indicates the best candidate. Apply the optimized config locally, then deploy:

```
azd ai agent optimize apply --candidate <candidate-id>
azd deploy
```

The `apply` command downloads the optimized configuration into `.agent_configs/<candidate_id>/` and updates your `agent.yaml` to use the new instructions. The `deploy` command pushes the optimized agent live using code deploy.

Invoke your agent to verify the improvement:

```
azd ai agent invoke "What is your return policy?"
```

You can also run evaluation to confirm the score improvement:

```
azd ai agent eval run
```

When you finish experimenting, delete the provisioned resources:

```
azd down --force --purge
```

Tip

**Why `--purge`?** Foundry accounts use soft-delete by default. Without `--purge`, the resource name stays reserved for 48 hours, and reprovisioning with the same name fails.

| Problem | Cause | Fix |
| --- | --- | --- |
| `azd ai agent optimize` command not found | Extension too old | Run `azd ext upgrade microsoft.foundry` to get 0.1.40-preview or later. |
| `optimization_model is required` | Running in non-interactive mode without a model configured | Add `--optimize-model gpt-5` to the command, or set `optimization_model: gpt-5` under `options:` in `eval.yaml`. In interactive mode, the CLI prompts for model selection. |
| Optimization score is 0 or very low | Evaluation has many errored rows | Open the **Eval** link in the results. Fix response generation or evaluator errors, then rerun. |
| `azd provision` fails with quota error | Subscription lacks capacity | Try a different region or request a quota increase. |

In this quickstart, you:

-   Deployed the optimization sample agent by using the customer-support template.
-   Ran the agent optimizer to automatically improve agent instructions.
-   Deployed the winning candidate and verified the improvement.

-   [Agent optimizer overview](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/agent-optimizer-overview)
-   [Create a custom evaluation dataset](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/create-optimizer-dataset)
-   [Optimize agent instructions, skills, tools, and models](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/optimize-agent-targets)
-   [Make your agent optimizer-ready](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/make-agent-optimizer-ready)
-   [Run agent evaluations with the azd CLI](https://learn.microsoft.com/en-us/azure/foundry/observability/how-to/azure-developer-cli-evaluation)
