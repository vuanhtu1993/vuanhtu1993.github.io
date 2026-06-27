---
title: "Install the Azure Developer CLI Foundry extensions - Microsoft Foundry"
source_url: "https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/install-cli-foundry-extensions"
crawled_at: "2026-06-27T11:30:34.744Z"
---

Important

Items marked (preview) in this article are currently in public preview. This preview is provided without a service-level agreement, and we don't recommend it for production workloads. Certain features might not be supported or might have constrained capabilities. For more information, see [Supplemental Terms of Use for Microsoft Azure Previews](https://azure.microsoft.com/support/legal/preview-supplemental-terms/).

The Azure Developer CLI (`azd`) `ai` extensions let you build, deploy, evaluate, and operate AI agents on Microsoft Foundry from your terminal. In this article, you install the extensions, verify the installation, and authenticate to Azure.

-   An Azure subscription. [Create one for free](https://azure.microsoft.com/pricing/purchase-options/azure-account?cid=msft_learn_55c1c5af-7f2f-4c46-ebf0-2337c3edf04e).
-   Azure Developer CLI (`azd`) version 1.25.2 or later. [Install azd](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/install-azd).
-   Python 3.10 or later, or .NET 8 or later, depending on the agent framework you plan to use.

You need the following roles on your Azure subscription.

| Role | Purpose |
| --- | --- |
| Contributor | Provision and manage Azure resources. |
| Foundry Owner | Required only if you create new Foundry projects. |

Important

The Foundry RBAC roles were recently renamed. **Foundry User**, **Foundry Owner**, **Foundry Account Owner**, and **Foundry Project Manager** were previously named Azure AI User, Azure AI Owner, Azure AI Account Owner, and Azure AI Project Manager. You might still see the previous names in some places while the rename rolls out. The role IDs and core permissions are unchanged by the rename.

The `azd ai` namespace is composed of multiple independent `azd` extensions. Each one contributes a top-level command group under `azd ai`.

| Extension ID | Command group | What it does |
| --- | --- | --- |
| `microsoft.foundry` | meta-package | Bundles all of the Foundry extensions for a single install. |
| `azure.ai.agents` | `azd ai agent` | Ship agents with Foundry from your terminal. |
| `azure.ai.connections` | `azd ai connection` | Manage Foundry project connections. |
| `azure.ai.inspector` | `azd ai inspector` | Browser-based inspector UI for locally running agents. |
| `azure.ai.projects` | `azd ai project` | Manage Foundry project context (`set`, `unset`, `show`). |
| `azure.ai.routines` | `azd ai routine` | Manage Foundry routines (timers, schedules, event triggers). |
| `azure.ai.skills` | `azd ai skill` | Manage Foundry skills (reusable agent behavioral guidelines). |
| `azure.ai.toolboxes` | `azd ai toolbox` | Manage Foundry toolboxes (versioned tool collections). |

The `microsoft.foundry` package is a thin meta-package that doesn't contribute its own commands. Installing it pulls in every individual extension, which is the recommended starting point. Installing `azure.ai.agents` on its own also pulls in `azure.ai.inspector` automatically, because the agent extension depends on it.

Install every Foundry extension in one step through the meta-package:

```
azd ext install microsoft.foundry
```

To update later:

```
azd ext upgrade microsoft.foundry
```

You can also manage each extension on its own:

```
# Just the agent surface
azd ext install azure.ai.agents

# Just the routine surface
azd ext install azure.ai.routines

# Upgrade one extension without touching the others
azd ext upgrade azure.ai.connections
```

The individual extensions are independently versioned, so you can pin or upgrade one at a time.

List installed extensions:

```
azd ext list
```

You should see `microsoft.foundry` plus each individual extension. Each extension also exposes a `version` subcommand:

```
azd ai agent version
azd ai connection version
azd ai inspector version
azd ai project version
azd ai routine version
azd ai skill version
azd ai toolbox version
```

Sign in to Azure so the CLI can provision and manage resources on your behalf:

```
azd auth login
```

This command opens a browser window for interactive authentication. After you sign in, the CLI caches your credentials locally for subsequent commands.

-   [Quickstart: Deploy your first hosted agent](https://learn.microsoft.com/en-us/azure/foundry/agents/quickstarts/quickstart-hosted-agent)
-   [Initialize a hosted agent project with the Azure Developer CLI](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/init-agent-project)
-   [Set the Foundry project context for azd commands](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/cli-project-context)
