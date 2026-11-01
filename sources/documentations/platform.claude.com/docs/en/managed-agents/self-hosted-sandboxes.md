---
title: "Self-hosted sandboxes"
source_url: "https://platform.claude.com/docs/en/managed-agents/self-hosted-sandboxes"
crawled_at: "2026-11-01T16:24:38.199Z"
---

Run Claude Managed Agents sessions in self-hosted sandboxes, keeping tool execution, files, and network egress in your own infrastructure.

Self-hosted sandboxes move the agent’s tool execution from Anthropic-managed cloud sandboxes into infrastructure you control, while Anthropic keeps running the agent. To learn what that means and decide whether it fits your agent, see [Choosing an agent environment](https://platform.claude.com/docs/en/managed-agents/choosing-an-environment).

## How it works

A `self_hosted` environment acts as a work queue. You run an **environment worker**, a process on your own infrastructure that serves that queue:

1.  You create a [session](https://platform.claude.com/docs/en/managed-agents/sessions) that targets the environment. Anthropic enqueues the session as a work item.
2.  Your worker claims the work item and downloads the agent’s [skills](https://platform.claude.com/docs/en/managed-agents/skills) and the session’s [memory stores](https://platform.claude.com/docs/en/managed-agents/memory).
3.  Claude runs on Anthropic’s side and requests tool calls. Your worker runs each call locally and posts the result back.

Tool inputs and outputs still flow to Anthropic’s control plane, so the model can receive results and determine what to do next. Anthropic stores skills and memory stores. Your sandbox holds a copy for the session. See [Security model](https://platform.claude.com/docs/en/managed-agents/self-hosted-sandboxes-security) for the full data-flow boundary.

Self-hosted sandboxes support every Claude model available in Managed Agents. The model is configured on the agent, not the environment.

The `ant` CLI and the Python, TypeScript, and Go SDKs ship pre-built workers. Sandbox providers such as Cloudflare, Daytona, and Modal also publish their own [platform guides](#platform-guides).

## Quickstart

This quickstart runs one always-on worker with the `ant` CLI, sends it a session, and confirms that the agent’s tool calls ran on your host.

### Prerequisites

-   **An agent:** If you don’t have one, complete [Get started with Claude Managed Agents](https://platform.claude.com/docs/en/managed-agents/quickstart) first and note the agent ID.
-   **A Linux or macOS host:** The host needs `/bin/bash` at that exact path. The worker needs only outbound HTTPS.
-   **A Claude API key:** You use it from your own machine to create sessions and read queue stats. Keep it off the worker host, where agent tool calls could read it.
-   **The `ant` CLI or the SDK on your own machine:** The stats and session steps in this quickstart run there, not on the worker host. Install the CLI the same way the [install step](#run-your-first-session) does for the worker, or install the [SDK](https://platform.claude.com/docs/en/cli-sdks-libraries/overview).

### Run your first session

1.  ### Create a self-hosted environment
    
    In the Claude Console, go to the [Environments](https://platform.claude.com/environments) page (`platform.claude.com/environments`), click **Create environment**, and under **Hosting** select **Self-hosted**.
    
    Or through the API:
    
2.  ### Generate an environment key
    
    In the Console, open the environment and click **Generate environment key**. The environment key authenticates the worker to its queue. You can generate one only in the Console, even for an environment you created through the API.
    
    Export the environment ID and key on the worker host:
    
3.  ### Install the ant CLI
    
    Run this on the worker host.
    
    Check the installation:
    
4.  ### Start the worker
    
    Create the working directory, then start the worker with `--workdir` set to it. Without the flag, the worker uses the current directory.
    
    The worker reads the two variables you exported and polls until you stop it.
    
5.  ### Verify the worker is connected
    
    On your own machine, set `ANTHROPIC_API_KEY` to your Claude API key (not the environment key) and `environment_id` to the environment ID. Confirm that `workers_polling` is at least 1:
    
    If `workers_polling` stays at 0, see [Troubleshooting](https://platform.claude.com/docs/en/managed-agents/self-hosted-sandboxes-operations#troubleshooting).
    
6.  ### Start a session
    
    Set `agent_id` to your agent’s ID. Create a session that targets the environment, then send it a task:
    
    The session waits in the environment’s queue until a worker claims it. If no worker is connected, the session stays queued rather than failing.
    
7.  ### Confirm the tools ran on your host
    
    On the worker host, read the file the agent wrote:
    
    The file describes your own host’s kernel, so the agent’s tool calls ran there. To follow the agent’s work in real time, see [Session event stream](https://platform.claude.com/docs/en/managed-agents/events-and-streaming).
    

## Session resources

Self-hosted sandboxes support `memory_store` resources only. A session on a self-hosted environment that includes a `file` or `github_repository` resource is rejected with a 400 error:

[Deployments](https://platform.claude.com/docs/en/managed-agents/scheduled-deployments) that target a self-hosted environment follow the same rule. To give a session its own input files, see [Stage files for a session](https://platform.claude.com/docs/en/managed-agents/self-hosted-sandboxes-workers#stage-files-for-a-session).

## Self-hosted sandboxes and MCP tunnels

Self-hosting controls _where the agent’s code runs_. [MCP tunnels](https://platform.claude.com/docs/en/agents-and-tools/mcp-tunnels/overview) control _how Anthropic reaches MCP servers in your network_. The two are independent:

-   A session in Anthropic’s cloud sandboxes can reach private MCP servers through a tunnel. For example, a private MCP server might sit in front of a database or an internal API behind your firewall.
-   A self-hosted session can use either tunneled or public MCP servers.

Use both when you want execution and tool access to stay inside your boundary. To skip the tunnel, [wrap the MCP server as custom tools](https://platform.claude.com/docs/en/managed-agents/self-hosted-sandboxes-custom-tools#wrap-an-mcp-server-as-custom-tools) that your worker serves.

## Platform guides

These pages describe how to build a worker on any sandboxing platform. Platform-specific guides are also available:

-   [AWS Lambda MicroVMs](https://docs.aws.amazon.com/lambda/latest/dg/microvms-integrations-claude-managed-agents.html)
-   [Blaxel](https://docs.blaxel.ai/Tutorials/Claude-Managed-Agents)
-   [Cloudflare](https://developers.cloudflare.com/sandbox/claude-managed-agents/)
-   [Daytona](https://www.daytona.io/docs/en/guides/claude/claude-managed-agents)
-   [E2B](https://e2b.dev/docs/agents/claude-managed-agents)
-   [Fly.io](https://docs.sprites.dev/integrations/claude-managed-agents/)
-   [GKE Agent Sandbox](https://github.com/GoogleCloudPlatform/kubernetes-engine-samples/tree/main/ai-ml/anthropic-agent-sandbox)
-   [Modal](https://github.com/modal-labs/claude-managed-agents-modal-sandbox)
-   [Namespace](https://namespace.so/docs/integrations/claude)
-   [Superserve](https://docs.superserve.ai/integrations/managed-agents/claude-managed-agents)
-   [Vercel](https://vercel.com/kb/guide/run-claude-managed-agent-tools-with-vercel-sandbox)

## Next steps

Run the SDK worker, trigger workers from webhooks, or give each session its own sandbox.

Prepare the host, configure sync, and handle read-only stores and conflicts.

Serve your own tools from the worker, including tools from an MCP server inside your network.

Read queue depth, stop sessions and workers cleanly, and fix common failures.

CLI flags, environment variables, filesystem paths, and SDK helper options.

Shared responsibility model for self-hosted sandbox environments.

## Availability

Self-hosted sandboxes are available on every model.

### API support

Beta headers allow you to access experimental features and new model capabilities before they become part of the standard API.
