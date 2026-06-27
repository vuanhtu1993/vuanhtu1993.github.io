---
title: "Deploy a hosted agent from source code (preview) - Microsoft Foundry"
source_url: "https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/deploy-hosted-agent-code?tabs=python"
crawled_at: "2026-06-27T11:32:18.876Z"
---

This article shows you how to deploy a [Hosted agent](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/hosted-agents) in Foundry Agent Service from Python or .NET source code, without building or pushing a container image. You upload a `.zip` of your code (and optionally your dependencies), and Agent Service either runs it as-is or builds your dependencies for you in the cloud.

Tip

For most scenarios, deploy with the **Azure Developer CLI (azd)** or the **Foundry Toolkit for VS Code**. These tools do the heavy lifting for you: they package your source, upload it, poll for `active`, and configure role-based access control automatically. To get started, follow the [Quickstart: Deploy your first hosted agent](https://learn.microsoft.com/en-us/azure/foundry/agents/quickstarts/quickstart-hosted-agent) and choose **Code** (or **Source Code (ZIP upload)**) when prompted for a deployment method.

Use the SDK and REST procedures in this article when you need to deploy source-code agents programmatically—from the Python SDK or .NET SDK in your own applications, or directly over the REST API for custom tooling, language-agnostic automation, or integration with existing continuous-delivery systems. In this article, you complete the following tasks:

-   Pick a [dependency-resolution mode](#choose-how-dependencies-are-resolved) and package your source.
-   Create the agent, wait for it to reach `active`, and invoke it.
-   Update, version, download, and stream logs for the deployed agent.

If you need full control of the runtime image or you already have a working Dockerfile, use the container-based path: [Deploy a hosted agent](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/deploy-hosted-agent).

Important

Source-code deployment for Hosted agents is in **preview**. Functionality, region availability, and APIs might change before general availability.

-   A [Microsoft Foundry project](https://learn.microsoft.com/en-us/azure/foundry/how-to/create-projects) in a supported region.
-   [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) version 2.80 or later, signed in to the tenant that owns the project.

-   [Python](#tabpanel_1_python)
-   [C#](#tabpanel_1_csharp)
-   [REST API](#tabpanel_1_rest)

-   `pip` from Python 3.13 or later, to package your source locally.
    
-   The `azure-ai-projects` version 2.2.0 or later and `azure-identity` packages.
    
    ```
    pip install "azure-ai-projects>=2.2.0" azure-identity
    ```
    

The `code_configuration.runtime` field in the agent definition accepts the following values. Pick the runtime that matches the binaries in your zip—Linux x86\_64 wheels for Python, or the `TargetFramework` of your `dotnet publish` output for .NET.

| Language | Runtime values |
| --- | --- |
| Python | `python_3_13`, `python_3_14` |
| .NET | `dotnet_10` |

The Agent Service runtime includes the platform-built container image for each value of `code_configuration.runtime`. To keep your deployed agents fully supported, Foundry aligns hosted agent language support with end-of-life support for each language. Support ends on the community end-of-support date for the language version. Microsoft might retire a `code_configuration.runtime` value earlier when platform constraints (such as the underlying base image) require it.

For upstream end-of-support schedules, see:

-   Python: [Status of Python versions](https://devguide.python.org/versions/) (python.org).
-   .NET: [.NET and .NET Core support policy](https://dotnet.microsoft.com/platform/support/policy/dotnet-core).

After a language end-of-life date, you can still create, update, and run hosted agents that use the retired runtime value. However, those agents aren't eligible for support, new features, or security patches until you upgrade them to a supported runtime by setting a current `code_configuration.runtime` value and redeploying.

You need **Foundry Project Manager** at project scope to deploy a Hosted agent. This role grants the data-plane permissions to create and update agents, plus the ability to assign **Foundry User** to the platform-created agent identity that your running code uses to call models and tools.

Your agent runs as a platform-assigned managed identity that's separate from your user identity. That identity needs **Foundry User** to call models from inside the container. If you deploy with `azd` or the Foundry Toolkit for Visual Code, the tooling assigns this role automatically. If you deploy with REST, grant it yourself—see [Hosted agent permissions reference](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/hosted-agent-permissions).

For REST calls, include the preview feature header on mutating requests (Create, Update, Delete) while the feature is in preview:

```
Foundry-Features: CodeAgents=V1Preview,HostedAgents=V1Preview
```

GET requests work without it today, but include it on every call to be safe—the header gates preview behavior and might be enforced more strictly before GA.

Every source-code deployment follows the same sequence: **package → create or update → poll until `active` → invoke**. The source-code path uses `code_configuration` in the agent definition; the image-based path uses `container_configuration` instead—the two are mutually exclusive on a single version.

Choose the path that fits your workflow. If you're not sure, start with the Azure Developer CLI or VS Code—it's the recommended path for most customers.

| Path | Best for | Packaging |
| --- | --- | --- |
| [Azure Developer CLI or VS Code](#deploy-using-the-azure-developer-cli-or-vs-code) | **Most deployments**, including first deployments and the fastest inner loop. | Tooling builds and uploads the zip for you. |
| [Python SDK](#deploy-from-source-code) | Programmatic deployment from Python apps or automation. | You build the zip; the SDK uploads it. |
| [.NET SDK](#deploy-from-source-code) | Programmatic deployment from .NET apps or automation. | The SDK zips a folder for you. |
| [REST API](#deploy-from-source-code) | Custom tooling, language-agnostic automation, and CD systems. | You build the zip and send the multipart request. |

Before you start, pick a value for `code_configuration.dependency_resolution`. This choice affects what you put in the zip.

| Value | Behavior | Use when |
| --- | --- | --- |
| `remote_build` | Agent Service installs dependencies from `requirements.txt` (Python) or restores the project file (.NET) during provisioning. | You want a small upload and the simplest inner loop. **Recommended for first-time users.** |
| `bundled` | The zip is run as-is. You ship prebuilt Linux dependencies in `packages/` (Python) or `dotnet publish` output (.NET). | You need reproducible builds, your dependencies are private or wheels-only, or your project doesn't restore cleanly server-side. |

For bundled mode, see [Package the zip manually](#package-the-zip-manually) for the local build commands.

Important

**Private virtual network prerequisite for `bundled` deployments:** If your project is secured with a private virtual network, allow an outbound network connection in your network policy to the Debian package endpoint `deb.debian.org` before you deploy with `bundled` dependency resolution. Without this outbound path, provisioning can't download the packages it needs and the deployment fails. For network configuration, see [Deploy a hosted agent in a virtual network](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/virtual-networks).

The Azure Developer CLI (`azd`) and the Foundry Toolkit for VS Code automate the full source-code deployment lifecycle—they package your source into a zip, compute the SHA-256, upload it, poll for `active`, and configure role-based access control for you. These tools are the recommended path for most customers, and the fastest inner loop.

For a step-by-step walkthrough, see the [Quickstart: Deploy your first hosted agent](https://learn.microsoft.com/en-us/azure/foundry/agents/quickstarts/quickstart-hosted-agent). Choose **Code** (or **Source Code (ZIP upload)**) when the quickstart asks for a deployment method.

When you run `azd ai agent init` interactively, the tool prompts you to choose a deployment mode. Choose **code** to deploy from source as a ZIP upload instead of building a container image. The Foundry Toolkit for VS Code prompts you for the deployment method in the same way.

To select source-code deployment non-interactively—for example, in a CI/CD pipeline—pass `--deploy-mode code`. This mode requires `--runtime` and `--entry-point`, and accepts an optional `--dep-resolution` value of `remote_build` (default) or `bundled`:

```
azd ai agent init --no-prompt --project-id "<project-resource-id>" \
  --deploy-mode code --runtime python_3_13 --entry-point main.py
```

With `--no-prompt`, the deployment mode defaults to `container`, so pass `--deploy-mode code` explicitly for source-code deployments. After initialization, run `azd up` to provision and deploy.

Use the SDK or REST paths in the following sections when you need to deploy programmatically from your own application or integrate with existing tooling.

Select your language or interface. Each tab walks through the same lifecycle: create the agent, poll until it reaches `active`, invoke it, and download the deployed code.

-   [Python](#tabpanel_2_python)
-   [C#](#tabpanel_2_csharp)
-   [REST API](#tabpanel_2_rest)

Use the Python SDK to deploy source-code agents from your own applications or automation. You build the zip yourself and pass its bytes and SHA-256 to the SDK, which uploads it and exposes the same create, poll, invoke, and download operations as the REST API. Code-deployment requires `azure-ai-projects` version 2.2.0 or later.

Source-code deployment uses the preview `beta` client surface, so create the client with `allow_preview=True`.

The Python SDK uploads a zip that you build. Use the same layout and dependency-resolution rules described in [Package the zip manually](#package-the-zip-manually). The minimal `remote_build` payload is a flat zip with `main.py` and `requirements.txt` at the root.

```
import hashlib
from pathlib import Path

from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import (
    CodeConfiguration,
    CreateAgentVersionFromCodeContent,
    CreateAgentVersionFromCodeMetadata,
    HostedAgentDefinition,
    ProtocolVersionRecord,
)
from azure.identity import DefaultAzureCredential

# Format: "https://<account>.services.ai.azure.com/api/projects/<project>"
PROJECT_ENDPOINT = "your_project_endpoint"
AGENT_NAME = "my-code-agent"
ZIP_PATH = Path("agent-code.zip")

code_zip_bytes = ZIP_PATH.read_bytes()
code_zip_sha256 = hashlib.sha256(code_zip_bytes).hexdigest()

credential = DefaultAzureCredential()
project = AIProjectClient(
    endpoint=PROJECT_ENDPOINT,
    credential=credential,
    allow_preview=True,
)

content = CreateAgentVersionFromCodeContent(
    metadata=CreateAgentVersionFromCodeMetadata(
        description="Hello-world code agent",
        definition=HostedAgentDefinition(
            cpu="1",
            memory="2Gi",
            code_configuration=CodeConfiguration(
                runtime="python_3_13",
                entry_point=["python", "main.py"],
                dependency_resolution="remote_build",
            ),
            protocol_versions=[
                ProtocolVersionRecord(protocol="responses", version="1.0.0")
            ],
            environment_variables={"AZURE_AI_MODEL_DEPLOYMENT_NAME": "gpt-4.1-mini"},
        ),
    ),
    code=(ZIP_PATH.name, code_zip_bytes, "application/zip"),
)

created = project.beta.agents.create_version_from_code(
    agent_name=AGENT_NAME,
    content=content,
    code_zip_sha256=code_zip_sha256,
)
print(f"Created version: {created.version}")
```

For the Invocations protocol, set the `protocol_versions` entry to `ProtocolVersionRecord(protocol="invocations", version="1.0.0")`. For `bundled` mode, set `dependency_resolution="bundled"` and ship prebuilt dependencies in the zip—see [Build Linux dependencies locally](#build-linux-dependencies-locally-bundled-python).

The code-deploy methods (`create_version_from_code` and `download_code`) live on the preview `project.beta.agents` surface, but read and delete operations such as `get_version` are on `project.agents`.

```
import time

while True:
    version = project.agents.get_version(
        agent_name=AGENT_NAME, agent_version=created.version
    )
    status = version["status"]
    print(f"Status: {status}")
    if status == "active":
        break
    if status == "failed":
        raise RuntimeError(f"Provisioning failed: {version.get('error')}")
    time.sleep(5)
```

See [Poll for active](#poll-for-active) for the full list of status values and how to read the `error` object on failure.

After the version reaches `active`, bind an OpenAI client to the agent endpoint and call it. This example uses the Responses protocol:

```
openai_client = project.get_openai_client(agent_name=AGENT_NAME)

response = openai_client.responses.create(input="Hello! What can you do?")
print(response.output_text)
```

For the Invocations protocol, call the invoke endpoint directly with a bearer token, as shown in [Invoke the agent](#invoke-the-agent).

Verify exactly what's deployed by downloading the zip and comparing its SHA-256 against the value you uploaded:

```
import hashlib
from pathlib import Path

out_path = Path(f"{AGENT_NAME}-{created.version}.zip")
sha = hashlib.sha256()
with open(out_path, "wb") as f:
    for chunk in project.beta.agents.download_code(
        agent_name=AGENT_NAME, agent_version=created.version
    ):
        f.write(chunk)
        sha.update(chunk)

print(f"Downloaded {out_path} (matches upload: {sha.hexdigest() == code_zip_sha256})")
```

For a complete runnable example, see the [Python hosted-agent samples](https://github.com/microsoft-foundry/foundry-samples/tree/main/samples/python/hosted-agents).

If you use `azd`, skip this section—`azd` builds the zip for you. Read it if you use the REST API, if you switch to **bundled** dependency resolution, or if you need full control over the upload contents.

The zip must be **flat at the root**—no top-level wrapper folder.

Select the tab for your agent's language.

-   [Python](#tabpanel_3_python)
-   [C#](#tabpanel_3_csharp)
-   [REST API](#tabpanel_3_rest)

The service installs dependencies in the cloud from `requirements.txt`.

```
agent-code.zip
├── main.py
└── requirements.txt
```

You ship prebuilt Linux dependencies in `packages/`.

```
agent-code.zip
├── main.py                    # entry point
├── requirements.txt
└── packages/                  # extracted modules (not raw .whl files)
    ├── azure/identity/__init__.py
    └── requests/__init__.py
```

Use the `manylinux2014_x86_64` platform tag so `pip` downloads Linux wheels even from Windows or macOS.

**Bash**

```
pip install -r requirements.txt \
    --target packages/ \
    --platform manylinux2014_x86_64 \
    --python-version 3.13 \
    --implementation cp \
    --only-binary=:all:

zip -r agent-code.zip main.py requirements.txt packages/
```

**PowerShell / Windows cmd**

```
pip install -r requirements.txt --target packages --platform manylinux2014_x86_64 --python-version 3.13 --implementation cp --only-binary=:all:

tar -a -c -f agent-code.zip main.py requirements.txt packages
```

`--only-binary=:all:` forces wheels (no source builds). The `--python-version` must match the `runtime` value in the agent definition.

Warning

Common packaging mistakes that cause `session_creation_failed` or `ModuleNotFoundError`:

-   Wrapping the source in a folder (`my-agent/main.py` instead of `main.py` at the root).
-   Including raw `.whl` files in `packages/` instead of extracted modules.
-   Bundling Windows binaries (`.pyd`, `.dll`) for a Linux runtime.

| Limit | Value |
| --- | --- |
| Maximum zip size (multipart upload) | 250 MB |

For the supported `cpu` and `memory` combinations, see [Sandbox sizes](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/hosted-agents#sandbox-sizes).

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `401 Unauthorized` | Missing or wrong-scope token | Acquire a token with `--resource https://ai.azure.com`. |
| `403 Forbidden` | Caller lacks Role Based Access Control on the project | Grant **Foundry User** (or higher) at project scope. |
| `409 conflict` on Create (`Agent '<name>' already exists`) | Agent name already exists | Use Update (POST `/agents/{name}`), or pick a new name. |
| `400 bad_request` (`CPU and Memory must be specified as a valid resource tier`) on Create or Update | `cpu`/`memory` aren't one of the supported tiers | Set `cpu` and `memory` to a valid pair from [Sandbox sizes](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/hosted-agents#sandbox-sizes). |
| `400 bad_request` (`Agent version is still being provisioned`) on invoke | A new version is mid-deploy and the active version is being swapped in | Poll the version `status` until `active`, then retry. |
| `424 session_not_ready` on invoke | Container started but `/readiness` didn't return HTTP 200 within the timeout | Stream logs with [`:logstream`](#stream-container-logs), fix the readiness probe or startup error, redeploy. |
| `409 conflict` on DELETE agent (`Agent has active sessions`) | Open sessions block deletion | Wait for sessions to go idle, or append `&force=true` to cascade-delete sessions. |
| Version stuck in `creating` (>10 min, remote build) | Server build failed or couldn't resolve `requirements.txt` | Switch to `dependency_resolution: bundled` and prebuild locally. |
| `bundled` deployment fails in a private virtual network | Outbound network is blocked, so required packages can't be downloaded | Allow an outbound connection in your network policy to `deb.debian.org`, then redeploy. |
| Version transitions to `failed` | Bad zip layout, syntax error, or (`remote_build`) a restore/compile failure | Read the version's `error` object first—`error.code` classifies the failure and `error.message` contains the underlying restore or compile error line (pip for Python, NuGet for .NET) plus a troubleshooting link. Verify the [folder structure](#package-the-zip-manually). Use [`:logstream`](#stream-container-logs) only after the container starts. |
| `ModuleNotFoundError` at runtime | `packages/` missing, contains raw `.whl` files, or has Windows binaries | Rebuild with `pip install --target packages/ --platform manylinux2014_x86_64 --only-binary=:all:`. |
| `409 AgentNotCodeBased` on download | Agent is image-based | Use the [container-based deploy doc](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/deploy-hosted-agent). |

If you scaffolded the project from the [Quickstart](https://learn.microsoft.com/en-us/azure/foundry/agents/quickstarts/quickstart-hosted-agent) with `azd`, run `azd down` from the project root to remove the entire provisioned environment.

To delete an agent you deployed with the SDK or REST API, use the matching path below.

-   [Python](#tabpanel_4_python)
-   [C#](#tabpanel_4_csharp)
-   [REST API](#tabpanel_4_rest)

```
# Delete one version
project.agents.delete_version(agent_name=AGENT_NAME, agent_version=created.version)

# Delete the agent and all its versions
project.agents.delete(agent_name=AGENT_NAME)
```

Warning

Deleting an agent removes all of its versions and terminates active sessions. This action can't be undone.

-   [Hosted agent permissions reference](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/hosted-agent-permissions)
-   [Deploy a hosted agent in a virtual network](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/virtual-networks)

-   [Deploy a hosted agent (container)](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/deploy-hosted-agent)
-   [What are Hosted agents?](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/hosted-agents)
-   [Hosted agent samples (Python)](https://github.com/microsoft-foundry/foundry-samples/tree/main/samples/python/hosted-agents)
-   [Hosted agent samples (.NET)](https://github.com/microsoft-foundry/foundry-samples/tree/main/samples/csharp/hosted-agents)
