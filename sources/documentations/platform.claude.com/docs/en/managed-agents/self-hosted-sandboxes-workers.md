---
title: "Deploy self-hosted workers"
source_url: "https://platform.claude.com/docs/en/managed-agents/self-hosted-sandboxes-workers"
crawled_at: "2026-11-01T16:11:19.243Z"
---

Choose how self-hosted sandbox workers claim work and where sessions run: always-on or webhook-triggered, in one process or one sandbox per session.

The [quickstart](https://platform.claude.com/docs/en/managed-agents/self-hosted-sandboxes#quickstart) runs one `ant` CLI worker that polls continuously and runs every session in one process. This page covers the other ways to run a worker and how to choose among them.

## Choose a deployment pattern

When deploying workers, you need to make two choices: how the worker claims work, and where each session runs.

**How the worker claims work:**

-   **Always-on:** A long-running process polls the queue continuously and needs only outbound HTTPS. This is the simplest setup.
-   **Webhook-triggered:** A handler wakes on `session.status_run_started` and starts polling. This avoids an idle poller, but requires a [webhook](https://platform.claude.com/docs/en/managed-agents/webhooks) endpoint that Anthropic can reach.

**Where each session runs:**

-   **In process:** The worker that claims a session also runs its tool calls, in one shared working directory.
-   **Sandbox per session:** A poller launches a fresh sandbox for each claimed session. Choose this for stronger isolation: a fresh filesystem, resource limits, or per-session network controls.

The CLI and SDK workers support different combinations:

| Capability | `ant` CLI | SDK (Python, TypeScript, Go) |
| --- | --- | --- |
| Always-on polling | Yes | Yes |
| Webhook-triggered | No | Yes |
| Sandbox per session | Yes | Yes |
| [Memory stores](https://platform.claude.com/docs/en/managed-agents/self-hosted-sandboxes-memory) | Yes, with default sync settings | Yes, with configurable sync |
| [Custom tools](https://platform.claude.com/docs/en/managed-agents/self-hosted-sandboxes-custom-tools) | No | Yes |

See [Self-hosted worker reference](https://platform.claude.com/docs/en/managed-agents/self-hosted-sandboxes-reference) for every CLI flag and SDK option. For more control, call the [Environments Work endpoints](https://platform.claude.com/docs/en/api/beta/environments/work) directly and implement your own worker.

## Run an always-on worker

Start a worker that polls the queue continuously. It authenticates with the [environment key](https://platform.claude.com/docs/en/managed-agents/self-hosted-sandboxes#run-your-first-session) from the quickstart:

## Trigger workers from webhooks

1.  ### Subscribe to session webhooks
    
    In the [Claude Console](https://platform.claude.com/settings/workspaces/default/webhooks), define a webhook endpoint that listens for `session.status_run_started` events. See [Webhooks](https://platform.claude.com/docs/en/managed-agents/webhooks) for details.
    
2.  ### Export the webhook signing key
    
    Along with the environment ID and key from [Run your first session](https://platform.claude.com/docs/en/managed-agents/self-hosted-sandboxes#run-your-first-session), export the webhook signing key on your handler host. The handler uses it to verify incoming payloads.
    
3.  ### Implement the webhook handler
    
    Start the worker when `session.status_run_started` fires. The handler drains the queue and hands each claimed work item to `handle_item()`, which downloads skills, runs tool calls, posts results back, and returns.
    
    Because the handler claims work itself, it must [forward the work item’s secret](#forward-the-work-items-secret), as the `work_secret` argument does here.
    

This handler runs every claimed item in one process on one host. If your sessions attach the same memory store, see [Isolate sessions that share a store](https://platform.claude.com/docs/en/managed-agents/self-hosted-sandboxes-memory#isolate-sessions-that-share-a-store).

## Run one sandbox per session

A poller on the host claims work and calls your script once for each work item. The script launches a sandbox for that one session.

1.  ### Build the sandbox image
    
    Install `ant` and set `ant beta:worker run` as the entrypoint. When a sandbox starts, it reads session details from environment variables, handles that session, and exits. The base image must provide `/bin/bash`; `curl` is only used at build time.
    
2.  ### Write the spawn script
    
    The script forwards the session details into a fresh sandbox. It requires `jq` on the poller host.
    
    The poller sets the `ANTHROPIC_*` variables that the script forwards, except the secret. See [Environment variables](https://platform.claude.com/docs/en/managed-agents/self-hosted-sandboxes-reference#environment-variables).
    
    `/host/outputs` is a host directory you choose. Mounting it at `/workspace` lets you retrieve the session’s deliverables after the sandbox exits. The mount also picks up the downloaded `skills/` tree and any intermediate files.
    

### Forward the work item’s secret

Each claimed work item can carry a per-session `secret`, which Anthropic issues. The worker that runs the session needs it to mount [memory stores](https://platform.claude.com/docs/en/managed-agents/self-hosted-sandboxes-memory).

A worker that claims and runs sessions in one process (`ant beta:worker poll` without `--on-work`, or `EnvironmentWorker` with `run()`) passes the secret along itself. When your own code sits between the claim and the worker, you forward it:

| You claim work with | The secret arrives as | Pass it to the worker as |
| --- | --- | --- |
| `ant beta:worker poll --on-work` | The `secret` field of the work item JSON on your script’s standard input | `ANTHROPIC_WORK_SECRET` in the sandbox’s environment |
| The SDK’s `work.poller()` | The `secret` field of each claimed work item | `ANTHROPIC_WORK_SECRET` in the sandbox’s environment, or the `work_secret` argument to `handle_item()` |

Pass the secret only into the sandbox that serves that session, and never log it. See [Security model](https://platform.claude.com/docs/en/managed-agents/self-hosted-sandboxes-security) for how it relates to the environment key.

### Launch sandboxes from the SDK poller

To claim work from your own code instead of `ant beta:worker poll --on-work`, use `work.poller()`. It polls the queue and gives you each claimed session, and you launch the sandbox:

### Run the SDK worker inside the sandbox

Replace the `ant beta:worker run` entrypoint with an SDK entrypoint when the sandbox must [serve custom tools](https://platform.claude.com/docs/en/managed-agents/self-hosted-sandboxes-custom-tools) or use [non-default memory sync settings](https://platform.claude.com/docs/en/managed-agents/self-hosted-sandboxes-memory#configure-sync). The entrypoint constructs `EnvironmentWorker` and calls `handle_item()`, which reads the same `ANTHROPIC_*` variables that the spawn script forwards.

## Stage files for a session

Anthropic doesn’t mount files or GitHub repositories into self-hosted sandboxes. To make session-specific files available:

1.  Pass file references, such as an S3 path or commit SHA, in the session’s `metadata` field.
2.  In your spawn script or `--on-work` handler, retrieve the session (`GET /v1/sessions/{session_id}`) and read `metadata`. The claimed work item carries the session ID but not the metadata.
3.  Stage the files into the working directory before any tool runs.

## Next steps

Read queue depth, stop sessions and workers cleanly, and fix common failures.

Shared responsibility model for self-hosted sandbox environments.

## Availability

Self-hosted workers are in beta on every model.

### API support

Beta headers allow you to access experimental features and new model capabilities before they become part of the standard API.
