---
title: "Diagnose a project with agent doctor - Microsoft Foundry"
source_url: "https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/agent-doctor"
crawled_at: "2026-06-27T11:29:01.797Z"
---

## In this article

1.  [Prerequisites](#prerequisites)
2.  [Choose when to run doctor](#choose-when-to-run-doctor)
3.  [Review checked areas](#review-checked-areas)
4.  [Interpret exit codes](#interpret-exit-codes)
5.  [Choose useful flags](#choose-useful-flags)
6.  [Run doctor](#run-doctor)
7.  [Fix failures](#fix-failures)
8.  [Related content](#related-content)

Important

Items marked (preview) in this article are currently in public preview. This preview is provided without a service-level agreement, and we don't recommend it for production workloads. Certain features might not be supported or might have constrained capabilities. For more information, see [Supplemental Terms of Use for Microsoft Azure Previews](https://azure.microsoft.com/support/legal/preview-supplemental-terms/).

`azd ai agent doctor` runs a sequence of local and remote checks against your current Microsoft Foundry azd project and reports the results. Use it to recover after losing terminal context, hitting a confusing error, or picking a project back up after a break.

-   An initialized hosted agent project. To create one, see [Initialize an agent project](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/init-agent-project).
-   The azd Foundry extensions installed. For installation steps, see [Install the azd Foundry extensions](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/install-cli-foundry-extensions).
-   An authenticated Azure Developer CLI session. Run `azd auth login` if needed.
-   For remote checks, an azd environment that resolves to a Foundry project endpoint. For context resolution, see [Understand azd project context](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/cli-project-context).

Run `doctor` when:

-   You came back to a project after a few days and forgot where you left off.
-   A command failed with a confusing error and you want a structured view of what is set up versus missing.
-   You want to confirm that azd, your Foundry project endpoint, your role assignments, and your deployed agent are all in a healthy state before kicking off a long-running operation such as eval, optimize, or deploy.

`doctor` doesn't change any state. It only reads.

Each invocation runs a set of checks, including but not limited to:

-   **Local**: azd version; `agent.yaml` is present and parseable; `azure.yaml` declares an `azure.ai.agent` service; `.env` for the active azd env has the expected keys; container build prerequisites are present for container deploy; entry point and runtime are valid for code deploy.
-   **Remote**: the Foundry project endpoint resolves and is reachable; required role assignments exist on the project; the deployed agent, if any, exists and can be invoked; the model deployment referenced by `agent.yaml` exists.

Each check reports `pass`, `fail`, or `skip`. When every executed check passes, the report also suggests the next command to run, such as `azd ai agent eval generate`.

| Exit code | Meaning |
| --- | --- |
| `0` | At least one check passed and no checks failed. |
| `1` | At least one check failed. |
| `2` | All checks were skipped, for example when preconditions aren't met. |

These exit codes are stable enough to use in CI. A `doctor` step before `azd up` can fail fast if the runner is missing role assignments or environment variables.

| Flag | Description |
| --- | --- |
| `--local-only` | Skip remote, network-dependent checks. Use when offline, behind a proxy, or for a fast local triage. |
| `--unredacted` | Show raw principal IDs, scope ARNs, and UPNs in the report. By default, sensitive identifiers are redacted in console output. |

1.  Run the full diagnostic, local plus remote:
    
    Bash
    
    ```
    azd ai agent doctor
    ```
    
2.  Run a fast triage while offline by skipping remote checks:
    
    Bash
    
    ```
    azd ai agent doctor --local-only
    ```
    
3.  Show raw identifiers in the report when sharing with support:
    
    Bash
    
    ```
    azd ai agent doctor --unredacted
    ```
    

Use this common loop when something is wrong:

1.  Run `azd ai agent doctor` and read the failed checks.
2.  Fix the first failed check, such as adding a missing role assignment, setting a missing environment variable, or rerunning `azd auth login`.
3.  Rerun `azd ai agent doctor` until everything passes.
4.  Follow the "next step" suggestion at the bottom of the report.

-   [Debug a hosted agent](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/debug-hosted-agent) for broader troubleshooting tactics.
-   [Run a hosted agent locally with the Azure Developer CLI](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/run-hosted-agent-locally) to validate local startup.
-   [Understand azd project context](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/cli-project-context) for endpoint resolution used by remote checks.

**Note:** The author created this article with assistance from AI. [Learn more](https://learn.microsoft.com/principles-for-ai-generated-content)

---

## Feedback

Was this page helpful?

---

-   Last updated on 06/26/2026
