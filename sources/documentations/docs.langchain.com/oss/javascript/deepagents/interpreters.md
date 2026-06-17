---
title: "Interpreters - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/deepagents/interpreters"
crawled_at: "2026-06-17T14:47:01.547Z"
---

Interpreters give agents a programmable workspace where they can explore data, coordinate tool calls, and keep intermediate work out of the model context. The agent writes code to express its intent, then an **in-memory** runtime executes that code and returns the relevant results. Where [sandboxes](https://docs.langchain.com/oss/javascript/deepagents/sandboxes) are a code-first way for acting on an environment (such as running commands, installing dependencies, and editing files), interpreters are a code-first way for acting inside the agent loop: composing tools, preserving state, and deciding what information should return to the model.

## Why use interpreters?

Most agent work alternates between model reasoning and tool calls. A model can fire several tool calls in one turn, but that batch is fixed the moment it is emitted. Nothing can loop, branch on a result, retry a failure, or feed one call’s output into the next without another model turn, and every result returns to the model’s context. The model also decides how many calls to issue, so asking it to dispatch work across hundreds of items is unreliable, and it tends to cover a sample rather than every one. Interpreters give the agent a runtime for that work. A loop runs every iteration, tools are called from code, intermediate values stay in variables, and only a compact result returns to the model.

## Choose a pattern

Use interpreters for code inside the agent loop: composing tools, preserving state, and controlling what returns to the model. Use [sandboxes](https://docs.langchain.com/oss/javascript/deepagents/sandboxes) for code against an environment: shell commands, package installs, tests, filesystem edits, and OS-level execution.

| Need | Use |
| --- | --- |
| One or two simple external calls | Normal tool calling |
| A small program that loops, branches, retries, or aggregates results | Interpreter |
| Many selected tool calls that should run from code | Interpreter with [programmatic tool calling (PTC)](#programmatic-tool-calling-ptc) |
| Many independent units of work, multiple perspectives, or recursive analysis over large inputs | Interpreter with [programmatic subagents](https://docs.langchain.com/oss/javascript/deepagents/programmatic-subagents) |
| Shell commands, package installs, tests, or full OS filesystem access | [Sandboxes](https://docs.langchain.com/oss/javascript/deepagents/sandboxes) |

## Quickstart

Install the QuickJS middleware package, then pass interpreter middleware using the `middleware` argument on `create_deep_agent`.

```
import { createDeepAgent } from "deepagents";
import { createCodeInterpreterMiddleware } from "@langchain/quickjs";

const agent = createDeepAgent({
  model: "openai:gpt-5.5",
  middleware: [createCodeInterpreterMiddleware()],
});
```

## How interpreters work

The middleware adds an `eval` tool to the agent. When useful, the agent writes JavaScript and calls `eval`; you do not call the interpreter directly. The tool runs code in a persistent context, captures `console.log`, and returns the result of the last expression. The agent can write code like this:

```
const rows = [
  { team: "alpha", score: 8 },
  { team: "beta", score: 13 },
  { team: "alpha", score: 21 },
];

const totals = rows.reduce((acc, row) => {
  acc[row.team] = (acc[row.team] ?? 0) + row.score;
  console.log(`${row.team} score: ${acc[row.team]}`)
  return acc;
}, {});

totals;
```

Code runs against [**QuickJS**](https://github.com/quickjs-ng/quickjs), a lightweight JavaScript runtime. By default, interpreter code has no access to the host filesystem, network, shell, package manager, or clock. It can compute, hold state, and write to `console.log`, and nothing more. Two explicit bridges extend that reach:

-   **Tools**, through [programmatic tool calling (PTC)](#programmatic-tool-calling-ptc). Expose an allowlist of tools as async functions under the `tools` namespace. These can be the agent’s own tools or standalone tools you define and pass in.
-   **Subagents**, through [programmatic subagents](https://docs.langchain.com/oss/javascript/deepagents/programmatic-subagents). Dispatch configured subagents from code and orchestrate them in plain JavaScript.

Programmatic tool calling is off until you [enable it](#enable-ptc). Subagent dispatch is on by default whenever the agent has subagents, and you can turn it off. Nothing else crosses the QuickJS boundary unless you expose it.

## Programmatic tool calling (PTC)

Programmatic tool calling (PTC) exposes selected agent tools inside the interpreter under the global `tools` namespace. Instead of asking the model to issue one tool call, wait for the result, and then decide the next call, the agent can write code that calls tools in loops, branches, retries, or parallel batches. This helps when intermediate results are only inputs to the next step: the interpreter filters or aggregates them before anything returns to the model, keeping multi-step workflows token-efficient. It is model-agnostic, implemented by middleware rather than a provider-specific tool-calling API. The middleware exposes each allowlisted tool as an async function under `tools`. The agent calls it with `await`, processes the result in code, and the model sees only the final interpreter output, not every intermediate value. Tool names are converted to camel case while the input object still follows the tool’s schema, so a tool named `web_search` becomes `tools.webSearch(...)`:

```
const result: string = await tools.webSearch({
  query: "deepagents interpreters",
});
```

### Enable PTC

Enable PTC with an explicit allowlist:

```
import { createDeepAgent } from "deepagents";
import { createCodeInterpreterMiddleware } from "@langchain/quickjs";

const agent = createDeepAgent({
  model: "openai:gpt-5.5",
  middleware: [createCodeInterpreterMiddleware({ ptc: ["web_search"] })],
});
```

After PTC is enabled, the agent can call the allowlisted tool from interpreter code. This example searches several topics in parallel and combines the results before returning to the model:

```
const topics = ["retrieval", "memory", "evaluation"];

const results = await Promise.all(
  topics.map((topic) =>
    tools.webSearch({ query: `${topic} best practices 2025` }),
  ),
);

results.join("\n\n");
```

## Programmatic subagents

Programmatic subagents let the interpreter dispatch configured [subagents](https://docs.langchain.com/oss/javascript/deepagents/subagents) from code using the built-in `task()` global. A task that spans many independent units, such as reviewing every file in a directory or triaging a batch of tickets, becomes a loop that fans work out and synthesizes the results. Use programmatic subagents for:

-   **Fan-out and synthesize**: Run the same kind of work across many items in parallel, then combine the results.
-   **Verification**: Send findings to independent verifier subagents and keep only confirmed results.
-   **Recursive workflows**: Keep a working set in interpreter variables, select slices, call subagents, and refine the result.

For configuration, examples, orchestration patterns, and safety notes, see [Programmatic subagents](https://docs.langchain.com/oss/javascript/deepagents/programmatic-subagents).

## Security

Interpreters use QuickJS to run untrusted JavaScript with strict default isolation. Treat that as a scoped interpreter runtime, not a full production sandbox backend. Every tool you expose through PTC is an outside capability that interpreter code can use. Treat the PTC allowlist as a permission boundary: expose only the tools the agent needs, and avoid bridging broad tools that can access sensitive systems, spend money, mutate data, or call unrestricted networks unless that behavior is intentional.

| Capability | Available by default | How to expose it |
| --- | --- | --- |
| JavaScript execution | Yes | Add interpreter middleware |
| Top-level `await` | Yes | Use promises in interpreter code |
| `console.log` capture | Yes | Disable with `captureConsole: false` |
| Agent tools | No | Add a PTC allowlist |
| Filesystem access | No | Add the [built-in filesystem tools](https://docs.langchain.com/oss/javascript/deepagents/harness#virtual-filesystem-access) via the PTC allowlist |
| Network access | No | Expose a specific network tool through PTC |
| Wall-clock or datetime access | No | Expose an explicit time tool if needed |
| Shell commands, package installs, tests, OS-level execution | No | Use a [sandbox backend](https://docs.langchain.com/oss/javascript/deepagents/sandboxes) |

## Configuration

`createCodeInterpreterMiddleware` accepts the following options:

| Option | Default | Purpose |
| --- | --- | --- |
| `ptc` | omitted | PTC allowlist: array of tool names or `StructuredToolInterface` instances. |
| `memoryLimitBytes` | `64 * 1024 * 1024`  
(64 MB) | QuickJS memory limit in bytes. |
| `maxStackSizeBytes` | `320 * 1024` | QuickJS stack size limit in bytes. |
| `executionTimeoutMs` | `5000` | Per-eval timeout in milliseconds. Negative values disable the timeout. |
| `systemPrompt` | `null` | Override the built-in interpreter system prompt. |
| `maxPtcCalls` | `256` | Maximum `tools.*` calls per eval. Use `null` only in trusted environments. |
| `maxResultChars` | `4000` | Maximum characters retained from console output, result, and error strings. |
| `toolName` | `"eval"` | Name of the interpreter tool exposed to the model. |
| `captureConsole` | `true` | Whether `console.log`, `console.warn`, and `console.error` output is captured. |
| `subagents` | `true` | Expose the built-in `task()` global for [programmatic subagents](https://docs.langchain.com/oss/javascript/deepagents/programmatic-subagents). Set to `false` to require subagent dispatch through the normal `task` tool path. |

---
