---
title: "Sandbox - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/deepagents/frontend/sandbox"
crawled_at: "2026-06-17T14:58:41.719Z"
---

Coding agents need more than a chat window. They need a file browser, a code viewer, and a diff panel, an IDE experience. This pattern connects a deep agent to a [sandbox](https://docs.langchain.com/oss/javascript/deepagents/sandboxes) so it can read, write, and execute code in an isolated environment, then exposes the sandbox filesystem through a custom API server so the frontend can display files in real time as the agent works. This page covers the **three-panel UI** (file tree, code viewer, and chat) and the **custom API routes** that expose the sandbox filesystem to it. For sandbox providers, lifecycle scoping, seeding files, secrets, deployment, and production `useStream` configuration, see [Going to production](https://docs.langchain.com/oss/javascript/deepagents/going-to-production).

## Architecture

This setup has three parts:

1.  **Deep agent with a sandbox backend:** The agent gets filesystem tools (`read_file`, `write_file`, `edit_file`, `execute`) automatically from the sandbox
2.  **Custom API server:** A Hono app exposed via `langgraph.json`’s `http.app` field, providing file browsing endpoints the frontend can call
3.  **Three-panel frontend:** A file tree, code/diff viewer, and chat panel that syncs files in real time as the agent makes changes

## Sandbox lifecycle

Choose how long a sandbox lives and who shares it before wiring the frontend. See [Sandbox lifecycle](https://docs.langchain.com/oss/javascript/deepagents/going-to-production#lifecycle) for thread-scoped vs assistant-scoped sandboxes, async [graph factory](https://docs.langchain.com/langsmith/graph-rebuild) setup, TTL behavior, and SDK invocation examples. This guide uses **thread-scoped sandboxes** by default. The frontend and custom API server both resolve the sandbox from the LangGraph [thread](https://docs.langchain.com/langsmith/use-threads) ID. That keeps conversations isolated and lets page reloads reconnect to the same environment when you [persist the thread ID](#thread-creation).

For [multi-tenant](https://docs.langchain.com/oss/javascript/deepagents/going-to-production#multi-tenancy) apps, scope sandboxes by user or assistant in your backend factory instead. For demos without LangGraph threads, pass a client-generated session ID in the API URL. The session ID does not persist across browser sessions.

## Connect the agent and API server

Configure the deep agent with a [sandbox backend](https://docs.langchain.com/oss/javascript/deepagents/sandboxes) as described in [Execution environment](https://docs.langchain.com/oss/javascript/deepagents/going-to-production#execution-environment). The agent gets filesystem tools and an `execute` tool automatically; no extra tool configuration is needed. Building this UI adds one requirement on top of the production setup: a **custom API server** which runs outside the agent graph, so both the agent backend and your file-browsing routes must resolve the **same sandbox** for each thread. Store the sandbox ID on thread metadata and share a single lookup function between them.

### Resolve the sandbox from thread metadata

Define `getOrCreateSandboxForThread` in a shared module. Both the agent graph factory and the custom API routes import it:

```
// src/api/utils.ts
import { Client } from "@langchain/langgraph-sdk";
import { LangSmithSandbox } from "deepagents";
import { SandboxClient } from "langsmith/sandbox";

export async function getOrCreateSandboxForThread(threadId: string) {
  const client = new Client({ apiUrl: "http://localhost:2024" });
  const thread = await client.threads.get(threadId);
  const sandboxId = thread.metadata?.sandbox_id;

  if (sandboxId) {
    const existing = await new SandboxClient().getSandbox(sandboxId);
    if (existing.status === "ready") {
      return new LangSmithSandbox({ sandbox: existing });
    }
  }

  const sandbox = await LangSmithSandbox.create({ templateName: "my-template" });
  await seedSandbox(sandbox);  // See File transfers below
  await client.threads.update(threadId, { metadata: { sandbox_id: sandbox.id } });
  return sandbox;
}
```

Wire the agent as an async [graph factory](https://docs.langchain.com/langsmith/graph-rebuild) that reads `thread_id` from the run config and passes the resolved backend to `createDeepAgent`:

```
// src/agents/deep-agent-ide.ts
import { createDeepAgent } from "deepagents";
import type { LangGraphRunnableConfig } from "@langchain/langgraph";

import { getOrCreateSandboxForThread } from "../api/utils.js";

export async function agent(config: LangGraphRunnableConfig) {
  const threadId = config.configurable?.thread_id;
  if (!threadId) throw new Error("No thread_id — agent must run on a thread");

  const backend = await getOrCreateSandboxForThread(threadId);

  return createDeepAgent({
    model: "google_genai:gemini-3.5-flash",
    backend,
    systemPrompt: "You are an expert developer working on a project in /app.",
  });
}
```

### Seed project files

Before the agent runs, upload starter files with `uploadFiles` / `upload_files`. See [File transfers](https://docs.langchain.com/oss/javascript/deepagents/going-to-production#file-transfers) for seeding patterns, provider examples, and syncing [memories](https://docs.langchain.com/oss/javascript/deepagents/memory) or [skills](https://docs.langchain.com/oss/javascript/deepagents/skills) into the sandbox. For LangSmith sandboxes, pass `templateName` from a [sandbox snapshot](https://docs.langchain.com/langsmith/sandbox-snapshots) when creating the container.

## Adding the file browsing API

The agent can read and write files, but the frontend also needs direct access to browse the sandbox filesystem. Add a custom [Hono](https://hono.dev/) API server and expose it through the `http.app` field in `langgraph.json`.

### Create the API server

The sandbox API endpoints use the thread ID as a URL path parameter. This ensures the frontend always accesses the correct sandbox for the current conversation, using the same `getOrCreateSandboxForThread` function as the agent’s backend:

```
// src/api/app.ts
import { Hono } from "hono";
import { getOrCreateSandboxForThread } from "./utils.js";

export const app = new Hono();

app.get("/sandbox/:threadId/tree", async (c) => {
  const threadId = c.req.param("threadId");
  const rootPath = c.req.query("filePath") || "/app";

  const sandbox = await getOrCreateSandboxForThread(threadId);
  const result = await sandbox.execute(
    `find '${rootPath}' -printf '%y\\t%s\\t%p\\n' 2>/dev/null | sort -t$'\\t' -k3`,
  );

  const entries = result.output
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [typeChar, sizeStr, fullPath] = line.split("\t");
      return {
        name: fullPath.split("/").pop(),
        type: typeChar === "d" ? "directory" : "file",
        path: fullPath,
        size: parseInt(sizeStr, 10) || 0,
      };
    });

  return c.json({ path: rootPath, entries, sandboxId: sandbox.id });
});

app.get("/sandbox/:threadId/file", async (c) => {
  const threadId = c.req.param("threadId");
  const filePath = c.req.query("filePath");
  if (!filePath) return c.json({ error: "filePath is required" }, 400);

  const sandbox = await getOrCreateSandboxForThread(threadId);
  const results = await sandbox.downloadFiles([filePath]);
  const file = results[0];
  if (file.error) return c.json({ error: file.error }, 404);

  const content = new TextDecoder().decode(file.content!);
  return c.json({ path: filePath, content });
});
```

### Configure `langgraph.json`

Register both the agent graph and the API server. The `http.app` field tells the LangGraph platform to serve your custom routes alongside the default ones. See [application structure](https://docs.langchain.com/oss/javascript/langgraph/application-structure) and [LangSmith Deployments](https://docs.langchain.com/oss/javascript/deepagents/going-to-production#langsmith-deployments) for the full set of `langgraph.json` options.

```
{
  "node_version": "22",
  "graphs": {
    "deep_agent_ide": "./src/agents/deep-agent-ide.ts:agent"
  },
  "env": ".env",
  "http": {
    "app": "./src/api/app.ts:app"
  }
}
```

Your custom routes are available at the same host as the LangGraph API. For local development with `langgraph dev`, that’s `http://localhost:2024`.

## Building the frontend

The frontend has three panels: a file tree sidebar, a code/diff viewer, and a chat panel. It uses [`useStream`](https://reference.langchain.com/javascript/langchain-react/index/useStream) for the agent conversation and the custom API endpoints for file browsing. For production deployment, point `apiUrl` at your [LangSmith Deployment](https://docs.langchain.com/langsmith/deployment), and pass a stable `thread_id` on each run. See [Frontend](https://docs.langchain.com/oss/javascript/deepagents/going-to-production#frontend) in [Going to production](https://docs.langchain.com/oss/javascript/deepagents/going-to-production) for those settings and for [invoking the agent](https://docs.langchain.com/oss/javascript/deepagents/going-to-production#invoking-the-agent) with `thread_id` and runtime `context`.

### Thread creation

Create a LangGraph thread when the page loads and persist its ID in `sessionStorage` so page reloads reconnect to the same sandbox:

```
const THREAD_KEY = "sandbox-thread-id";

function IDEPreview() {
  const [threadId, setThreadId] = useState<string | null>(
    () => sessionStorage.getItem(THREAD_KEY),
  );

  const updateThreadId = useCallback((id: string | null) => {
    setThreadId(id);
    if (id) sessionStorage.setItem(THREAD_KEY, id);
    else sessionStorage.removeItem(THREAD_KEY);
  }, []);

  const stream = useStream<typeof myAgent>({
    apiUrl: AGENT_URL,
    assistantId: "deep_agent_ide",
    threadId,
    onThreadId: updateThreadId,
  });

  // Create thread on first mount
  useEffect(() => {
    if (threadId) return;
    stream.client.threads.create().then((t) => updateThreadId(t.thread_id));
  }, [stream.client, threadId, updateThreadId]);

  // Pass threadId to sandbox file hooks
  const { tree, files } = useSandboxFiles(threadId);
  // ...
}
```

The “new thread” button clears the stored ID so the next mount creates a fresh thread (and sandbox):

```
function handleNewThread() {
  updateThreadId(null);
}
```

### File state management

Track two snapshots of the sandbox filesystem: the original state (before the agent runs) and the current state (updated in real time). The thread ID is included in the API URL so requests always hit the correct sandbox:

```
const AGENT_URL = "http://localhost:2024";

async function fetchTree(threadId: string): Promise<FileEntry[]> {
  const res = await fetch(
    `${AGENT_URL}/sandbox/${encodeURIComponent(threadId)}/tree?filePath=/app`,
  );
  const data = await res.json();
  return data.entries.filter((e: FileEntry) => !e.path.includes("node_modules"));
}

async function fetchFile(threadId: string, path: string): Promise<string | null> {
  const res = await fetch(
    `${AGENT_URL}/sandbox/${encodeURIComponent(threadId)}/file?filePath=${encodeURIComponent(path)}`,
  );
  const data = await res.json();
  return data.content ?? null;
}
```

### Real-time file sync

The key to the IDE experience is updating files **as the agent works**, not after it finishes. Watch the stream’s messages for `ToolMessage` instances from file-mutating tools. When a `write_file` or `edit_file` tool call completes, refresh that specific file. When `execute` completes, refresh everything (since a shell command could modify any file):

### Detecting changed files

Before each agent run, snapshot the current file contents. After files refresh, compare against the snapshot to identify which files changed:

```
function detectChanges(current: FileSnapshot, original: FileSnapshot): Set<string> {
  const changed = new Set<string>();
  for (const [path, content] of Object.entries(current)) {
    if (original[path] !== content) changed.add(path);
  }
  for (const path of Object.keys(original)) {
    if (!(path in current)) changed.add(path);
  }
  return changed;
}
```

When a user selects a changed file, default to the diff view so they immediately see what the agent modified.

### Displaying diffs

Use a framework-appropriate diff library to render unified diffs:

| Framework | Library | Component |
| --- | --- | --- |
| React | [`@pierre/diffs`](https://diffs.com/) | `<FileDiff>` with `parseDiffFromFile` |
| Vue | [`@git-diff-view/vue`](https://github.com/MrWangJustToDo/git-diff-view) | `<DiffView>` with `generateDiffFile` from `@git-diff-view/file` |
| Svelte | [`@git-diff-view/svelte`](https://github.com/MrWangJustToDo/git-diff-view) | `<DiffView>` with `generateDiffFile` from `@git-diff-view/file` |
| Angular | [`ngx-diff`](https://github.com/rars/ngx-diff) | `<ngx-unified-diff>` with `[before]` and `[after]` |

Example with `@pierre/diffs` (React):

```
import { FileDiff } from "@pierre/diffs/react";
import { parseDiffFromFile } from "@pierre/diffs";

function DiffPanel({ original, current, fileName }) {
  const diff = parseDiffFromFile(
    { name: fileName, contents: original },
    { name: fileName, contents: current },
  );

  return (
    <FileDiff
      fileDiff={diff}
      options={{ theme: "github-dark", diffStyle: "unified", diffIndicators: "bars" }}
    />
  );
}
```

### Changed files summary

Show a summary of all modified files with line-level addition/deletion counts. This gives users a quick overview of the agent’s impact — similar to a `git status`:

```
function ChangedFilesSummary({ changedFiles, files, originalFiles, onSelect }) {
  const stats = [...changedFiles].map((path) => {
    const oldLines = (originalFiles[path] ?? "").split("\n");
    const newLines = (files[path] ?? "").split("\n");
    // Compute additions/deletions by comparing lines
    return { path, additions, deletions };
  });

  return (
    <div>
      <h3>{stats.length} Files Changed</h3>
      {stats.map((file) => (
        <button key={file.path} onClick={() => onSelect(file.path)}>
          {file.path}
          <span className="text-green-400">+{file.additions}</span>
          <span className="text-red-400">-{file.deletions}</span>
        </button>
      ))}
    </div>
  );
}
```

## Use cases

A sandbox is the right choice when:

-   **Coding agents** that create, modify, and run code need a visual interface beyond chat
-   **Code review workflows** where the agent suggests changes and the user reviews diffs before accepting
-   **Tutorial or learning apps** where an AI assistant helps users build a project step by step, showing changes in context
-   **Prototyping tools** where users describe features in natural language and watch the agent implement them in real time

## Best practices

Frontend-specific:

-   **Persist `threadId` in `sessionStorage`** so page reloads reconnect to the same thread and sandbox instead of creating new ones.
-   **Sync files on every relevant tool call**, not just when the run finishes. Watch for `write_file`, `edit_file`, and `execute` tool messages and refresh immediately.
-   **Default to diff view for changed files**. When a user clicks a file that was modified by the agent, show the diff first — that’s what they care about.
-   **Show compact tool results for read-only operations**. Instead of dumping the full output of `read_file` in the chat, show a one-liner like `Read router.js L1-42`. Reserve the full output display for mutating tools.
-   **Filter `node_modules` from the file tree**. Nobody wants to browse thousands of dependency files. Filter them out when fetching the tree.

For backends and sandboxes:

-   **Use thread-scoped sandboxes** for production apps. See [Sandbox lifecycle](https://docs.langchain.com/oss/javascript/deepagents/going-to-production#lifecycle).
-   **Share sandbox resolution** between the agent backend and the API server via thread metadata so both resolve the same environment with no in-memory caches.
-   **Seed the sandbox with a real project**. See [File transfers](https://docs.langchain.com/oss/javascript/deepagents/going-to-production#file-transfers).
-   **Keep secrets out of the sandbox**. Use the [sandbox auth proxy](https://docs.langchain.com/oss/javascript/deepagents/going-to-production#managing-secrets) instead of environment variables or file uploads for API keys.
-   **Add guardrails before launch**. Configure [rate limits](https://docs.langchain.com/oss/javascript/deepagents/going-to-production#rate-limiting), [error handling](https://docs.langchain.com/oss/javascript/deepagents/going-to-production#handling-errors), and [data privacy](https://docs.langchain.com/oss/javascript/deepagents/going-to-production#data-privacy) middleware for autonomous coding agents.

---
