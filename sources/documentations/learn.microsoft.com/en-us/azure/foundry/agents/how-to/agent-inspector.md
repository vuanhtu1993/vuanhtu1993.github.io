---
title: "Inspect a local agent with the Agent Inspector - Microsoft Foundry"
source_url: "https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/agent-inspector"
crawled_at: "2026-06-27T11:28:53.567Z"
---

Important

Items marked (preview) in this article are currently in public preview. This preview is provided without a service-level agreement, and we don't recommend it for production workloads. Certain features might not be supported or might have constrained capabilities. For more information, see [Supplemental Terms of Use for Microsoft Azure Previews](https://azure.microsoft.com/support/legal/preview-supplemental-terms/).

The Agent Inspector is a browser-based UI for poking at a Microsoft Foundry agent running on your local machine. It connects to the local agent's HTTP / SSE endpoint, shows requests and responses, and lets you replay messages while you iterate on prompts, tools, and code.

-   An initialized hosted agent project. To create one, see [Initialize an agent project](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/init-agent-project).
-   The azd Foundry extensions installed. For installation steps, see [Install the azd Foundry extensions](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/install-cli-foundry-extensions).
-   An authenticated Azure Developer CLI session. Run `azd auth login` if needed.
-   A local agent to inspect. To start one, see [Run a hosted agent locally with the Azure Developer CLI](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/run-hosted-agent-locally).

The inspector ships in its own extension (`azure.ai.inspector`) and is installed automatically by the `microsoft.foundry` meta-package. It's also pulled in as a dependency of `azure.ai.agents`, so installing just the agent extension is enough.

Note

The inspector only targets a local agent on `http://localhost:8088` by default. It doesn't authenticate to or proxy a deployed Foundry agent. For the deployed agent, use [`azd ai agent invoke`](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/invoke-hosted-agent) and [`azd ai agent monitor`](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/monitor-hosted-agent-logs).

1.  Start the agent in one terminal:
    
    ```
    azd ai agent run
    ```
    
    By default, `azd ai agent run` opens the inspector for you when the local server starts listening.
    
2.  To skip the auto-launch, pass `--no-inspector`:
    
    ```
    azd ai agent run --no-inspector
    ```
    

If you started the agent yourself, for example with `python app.py` or `dotnet run`, or if you closed the inspector tab and want to reopen it, launch the inspector manually.

1.  Run the launch command:
    
    ```
    azd ai inspector launch
    ```
    
    The UI is served on `http://localhost:8087` by default and connects to an agent on `http://localhost:8088`.
    
2.  Configure both ports if needed:
    
    ```
    # Agent on port 9000, UI on port 9001.
    azd ai inspector launch --port 9000 --inspector-port 9001
    ```
    
3.  To seed the inspector with an existing conversation or session ID for replaying a specific run, pass the IDs explicitly:
    
    ```
    azd ai inspector launch \
      --conversation-id conv_abc123 \
      --session-id sess_xyz789
    ```
    

When the inspector is open, the single-page app streams the agent's responses over SSE and mirrors them in your terminal as well. You can:

-   Inspect the full request and response payloads for each turn.
-   Continue an existing conversation by reusing the conversation ID across turns.
-   Reset to a fresh session at any time.

The inspector doesn't modify your agent code or `agent.yaml`. It's purely a runtime view.

-   [Run a hosted agent locally with the Azure Developer CLI](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/run-hosted-agent-locally) to start the local agent.
-   [Invoke a hosted agent with the Azure Developer CLI](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/invoke-hosted-agent) for terminal-based local and deployed invocation.
-   [Pass isolation keys to a hosted agent](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/pass-isolation-keys) to test isolation against a deployed agent.
