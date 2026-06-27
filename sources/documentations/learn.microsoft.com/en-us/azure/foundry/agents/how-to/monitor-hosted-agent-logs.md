---
title: "Monitor hosted agent logs with the Azure Developer CLI - Microsoft Foundry"
source_url: "https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/monitor-hosted-agent-logs"
crawled_at: "2026-06-27T11:29:05.660Z"
---

## In this article

1.  [Prerequisites](#prerequisites)
2.  [View recent console logs](#view-recent-console-logs)
3.  [Stream logs in real time](#stream-logs-in-real-time)
4.  [View system event logs](#view-system-event-logs)
5.  [View session-specific logs](#view-session-specific-logs)
6.  [Control log length](#control-log-length)
7.  [Monitor a specific agent](#monitor-a-specific-agent)
8.  [Recognize common log patterns](#recognize-common-log-patterns)
9.  [Follow a debugging workflow](#follow-a-debugging-workflow)
10.  [Related content](#related-content)

Important

Items marked (preview) in this article are currently in public preview. This preview is provided without a service-level agreement, and we don't recommend it for production workloads. Certain features might not be supported or might have constrained capabilities. For more information, see [Supplemental Terms of Use for Microsoft Azure Previews](https://azure.microsoft.com/support/legal/preview-supplemental-terms/).

Stream and inspect logs from your deployed Microsoft Foundry hosted agent for troubleshooting and observability. You learn how to view console logs, stream in real time, inspect system events, filter by session, and recognize common log patterns.

-   A deployed hosted agent. To deploy one, see [Deploy a hosted agent](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/deploy-hosted-agent).
-   The azd Foundry extensions installed. For installation steps, see [Install the azd Foundry extensions](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/install-cli-foundry-extensions).
-   An authenticated Azure Developer CLI session. Run `azd auth login` if needed.
-   For session-specific logs, a session ID from an `azd ai agent invoke` response. To invoke an agent, see [Invoke a hosted agent with the Azure Developer CLI](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/invoke-hosted-agent).

-   Fetch recent console logs:
    
    ```
    azd ai agent monitor
    ```
    
    This command fetches recent console logs, including stdout and stderr, from the agent's last invoke session. If no session exists, it streams container logs. The command exits after fetching the available logs. Use `--follow` to stream continuously.
    

-   Stream logs continuously:
    
    ```
    azd ai agent monitor --follow
    ```
    
    Press **Ctrl+C** to stop. This is the most useful mode for debugging. Run it in one terminal while sending requests in another.
    

-   Show container lifecycle events instead of console output:
    
    ```
    azd ai agent monitor --type system
    ```
    
    Use system event logs to diagnose container crashes, restart loops, and resource issues.
    

-   Filter logs to a specific agent session:
    
    ```
    azd ai agent monitor --session-id <session-id>
    ```
    
-   Combine with `--follow` for real-time streaming:
    
    ```
    azd ai agent monitor --session-id <session-id> --follow
    ```
    
    To find session IDs, check the output of `azd ai agent invoke`. It prints the session ID for each request.
    

-   Show the last 100 lines:
    
    ```
    azd ai agent monitor --tail 100
    ```
    
    The range is 1-300. The default is 50.
    

-   In multi-service projects, pass the agent name:
    
    ```
    azd ai agent monitor my-agent
    ```
    

| Pattern | Meaning | Action |
| --- | --- | --- |
| `Listening on 0.0.0.0:8088` | Agent started successfully. | None needed. |
| `AuthenticationError` | The agent's Entra Agent Identity can't authenticate. | Check RBAC roles. |
| `ModelNotFound` | Model deployment name mismatch. | Verify deployment name in `agent.yaml` matches Foundry portal. |
| `ResourceNotFound` | Foundry endpoint mismatch. | Check `FOUNDRY_PROJECT_ENDPOINT` value. |
| Container restart events in system logs | Crash loop. | Check code for unhandled exceptions; consider increasing container resource limits in `azure.yaml`. |
| `TimeoutError` | Request took too long. | Check model responsiveness; increase timeout on invoke. |

A typical debugging session looks like this:

1.  Stream logs in one terminal:
    
    ```
    azd ai agent monitor --follow
    ```
    
2.  Send a request in another terminal:
    
    ```
    azd ai agent invoke "Test message"
    ```
    
3.  Watch the logs for error patterns or unexpected behavior.
    
4.  Check system events if the agent seems unresponsive:
    
    ```
    azd ai agent monitor --type system
    ```
    

For a comprehensive debugging workflow, see [Debug a hosted agent](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/debug-hosted-agent).

-   [Debug a hosted agent](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/debug-hosted-agent) for step-by-step diagnostic workflows.
-   [Test a hosted agent](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/test-hosted-agent) for validation strategies before production.
-   [Pass isolation keys to a hosted agent](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/pass-isolation-keys) for logs in isolated sessions.

**Note:** The author created this article with assistance from AI. [Learn more](https://learn.microsoft.com/principles-for-ai-generated-content)

---

-   Last updated on 06/26/2026
