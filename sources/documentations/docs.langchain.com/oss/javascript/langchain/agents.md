---
title: "Agents - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/langchain/agents"
crawled_at: "2026-06-17T14:44:02.636Z"
---

An agent is a model calling tools in a loop until a given task is complete. ![Core agent loop diagram](https://res.cloudinary.com/dv3vzmogk/image/upload/v1781707443/aha-mind/docs-crawler/docs.langchain.com/core_agent_loop_qom9uv.svg)

A harness is everything around that loop: the model, its prompt, its tools, and any middleware that shapes its behavior. [`create_agent`](https://reference.langchain.com/javascript/langchain/index/createAgent) is a highly configurable harness. At its simplest, you can create one with:

Building on that, you can configure the basics directly with the `model=`, `tools=`, and `system_prompt=` parameters. For more advanced capabilities, extend the harness with [middleware](#configure-the-harness).

## Core components

![Agent model and harness components diagram](https://res.cloudinary.com/dv3vzmogk/image/upload/v1781707442/aha-mind/docs-crawler/docs.langchain.com/agent_model_harness_jkvhuh.svg)

### Model

Pass a model identifier string (`"provider:model"`) or an initialized model instance to select the model for your agent. See [Models](https://docs.langchain.com/oss/javascript/langchain/models) for parameters, provider setup, and dynamic model selection.

### Tools

To provide the agent with tools, pass any Python callable, LangChain tool, or tool dict. See [Tools](https://docs.langchain.com/oss/javascript/langchain/tools) for tool definition, context access, and dynamic tool selection.

### System prompt

Shape how the agent approaches tasks. The system prompt parameter accepts a string or `SystemMessage`. For dynamic prompts at runtime, use [middleware](https://docs.langchain.com/oss/javascript/langchain/middleware).

### Structured output

Return a validated schema from the agent using `response_format=`. See [Structured output](https://docs.langchain.com/oss/javascript/langchain/structured-output) for strategies and examples.

## Invocation

You can invoke an agent with a message. Behind the scenes that passes an update to the agent’s [`State`](https://docs.langchain.com/oss/javascript/langgraph/graph-api#state). All agents include a [sequence of messages](https://docs.langchain.com/oss/javascript/langgraph/use-graph-api#messagesvalue) in their state; to invoke the agent, pass a new message along with a `thread_id` so the agent can persist and resume conversation history:

If you also need to pass per-run configuration (such as a user ID, API keys, or feature flags) to tools and middleware, pass it as `context` alongside the config. Define the shape of that data with `contextSchema` and access it through `runtime.context`:

`thread_id` scopes the _conversation_ (message history, checkpoints), while `context` carries _per-run_ data your tools and middleware read at invocation time. Both are commonly passed together. See [tool context](https://docs.langchain.com/oss/javascript/langchain/tools#context) and [Runtime](https://docs.langchain.com/oss/javascript/langchain/runtime) for more.

## Streaming

`invoke` returns the final response at the end of a run. If an agent executes multiple tool calls, users often need progress updates before completion. Use streaming to surface intermediate messages and tool activity as they happen.

```
const stream = await agent.streamEvents(
  {
    messages: [
      {
        role: "user",
        content: "Search for AI news and summarize the findings",
      },
    ],
  },
  { version: "v3" },
);

for await (const snapshot of stream.values) {
  // Each snapshot contains the full state at that point
  const latestMessage = snapshot.messages.at(-1);
  if (latestMessage?.content) {
    if (latestMessage.type === "human") {
      console.log(`User: ${latestMessage.content}`);
    } else if (latestMessage.type === "ai") {
      console.log(`Agent: ${latestMessage.content}`);
    }
  } else if (latestMessage?.tool_calls?.length) {
    const toolCallNames = latestMessage.tool_calls.map((tc) => tc.name);
    console.log(`Calling tools: ${toolCallNames.join(", ")}`);
  }
}
```

## Configure the harness

`create_agent` is highly extensible. Middleware is the primitive for customization: each piece handles one concern, hooks into the agent loop at the right moment, and composes freely with any other. Take exactly what your use case needs and skip the rest. Common patterns are prebuilt as first-class middleware. You can build anything else as [custom middleware](https://docs.langchain.com/oss/javascript/langchain/middleware/custom). ![Agent harness capabilities by category](https://res.cloudinary.com/dv3vzmogk/image/upload/v1781707442/aha-mind/docs-crawler/docs.langchain.com/agent_harness_capabilities_aji9tc.svg) As agents take on complex work, they need support across a few key areas. The middleware ecosystem provides:

### Execution environment

Agents are especially useful when they can take action rather than just generate text. The execution environment gives the agent a workspace: tools it can call, a filesystem for reading and writing files across turns, and code execution for running scripts or shell commands.

See [`FilesystemMiddleware`](https://reference.langchain.com/javascript/deepagents/middleware/createFilesystemMiddleware), [Sandboxes](https://docs.langchain.com/oss/javascript/deepagents/sandboxes), [Interpreters](https://docs.langchain.com/oss/javascript/deepagents/interpreters).

### Context management

Every model call has a fixed context window. As an agent runs, that window fills with accumulating history, tool results, and intermediate steps. Summarization compresses history before overflow hits; memory loads persistent instructions at startup so knowledge carries across sessions; skills surface domain knowledge on demand rather than loading everything upfront.

```
import { createAgent } from "langchain";
import {
  StateBackend,
  createFilesystemMiddleware,
  createSkillsMiddleware,
  createSummarizationMiddleware,
} from "deepagents";

var backend = new StateBackend();
const model = "anthropic:claude-sonnet-4-6";

var agent = createAgent({
  model,
  tools: [search],
  middleware: [
    createFilesystemMiddleware({ backend }),
    createSummarizationMiddleware({ model, backend }),
    createSkillsMiddleware({ backend, sources: ["./skills/"] }),
  ],
});
```

See [`SummarizationMiddleware`](https://reference.langchain.com/javascript/langchain/index/summarizationMiddleware), [`MemoryMiddleware`](https://reference.langchain.com/javascript/deepagents/middleware/createMemoryMiddleware), [Skills](https://docs.langchain.com/oss/javascript/langchain/multi-agent/skills), [Context engineering](https://docs.langchain.com/oss/javascript/deepagents/context-engineering).

### Planning and delegation

Complex tasks often exceed what one context window can handle. Delegation lets the main agent break work into pieces, hand them to subagents that each run in their own isolated context, and stay focused on coordination rather than execution. Work can run in parallel; the main agent’s context stays clean.

See [Subagents](https://docs.langchain.com/oss/javascript/langchain/multi-agent/subagents).

### Name your agent

Optionally use an identifier for the agent. This is especially useful when embedding the agent as a subgraph in [multi-agent](https://docs.langchain.com/oss/javascript/langchain/multi-agent) systems.

### Fault tolerance

Agents in production encounter failures that rarely appear in development: rate limits, model timeouts, transient API errors. Fault tolerance middleware handles these at the infrastructure level so your tools and business logic don’t need try/catch around every call.

See [`modelRetryMiddleware`](https://reference.langchain.com/javascript/langchain/index/modelRetryMiddleware), [`toolRetryMiddleware`](https://reference.langchain.com/javascript/langchain/index/toolRetryMiddleware), [Prebuilt middleware](https://docs.langchain.com/oss/javascript/langchain/middleware/built-in).

### Guardrails

Some policies can’t live in a prompt—they need to be enforced deterministically regardless of what the model does. Guardrails intercept data as it flows through the agent loop, applying compliance rules or content policies before tool results reach the model’s context.

See [`piiMiddleware`](https://reference.langchain.com/javascript/langchain/index/piiMiddleware), [Prebuilt middleware](https://docs.langchain.com/oss/javascript/langchain/middleware/built-in).

### Steering

Full autonomy isn’t always appropriate. Steering lets you place humans at specific decision points—before destructive writes, expensive API calls, or anything requiring judgment—without restructuring your agent. The agent pauses and waits; a human approves, edits, or rejects; execution continues.

See [`humanInTheLoopMiddleware`](https://reference.langchain.com/javascript/langchain/middleware/humanInTheLoopMiddleware), [Human-in-the-loop](https://docs.langchain.com/oss/javascript/langchain/human-in-the-loop).

### Middleware resources

---
