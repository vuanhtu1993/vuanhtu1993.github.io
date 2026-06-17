---
title: "Overview - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/langchain/middleware"
crawled_at: "2026-06-17T14:57:14.803Z"
---

Middleware provides a way to more tightly control what happens inside the agent. Middleware is useful for the following:

-   Tracking agent behavior with logging, analytics, and debugging.
-   Transforming prompts, [tool selection](https://docs.langchain.com/oss/javascript/langchain/middleware/built-in#llm-tool-selector), and output formatting.
-   Adding [retries](https://docs.langchain.com/oss/javascript/langchain/middleware/built-in#tool-retry), [fallbacks](https://docs.langchain.com/oss/javascript/langchain/middleware/built-in#model-fallback), and early termination logic.
-   Applying [rate limits](https://docs.langchain.com/oss/javascript/langchain/middleware/built-in#model-call-limit), guardrails, and [PII detection](https://docs.langchain.com/oss/javascript/langchain/middleware/built-in#pii-detection).

Add middleware by passing them to `createAgent`:

```
import {
  createAgent,
  summarizationMiddleware,
  humanInTheLoopMiddleware,
} from "langchain";

const agent = createAgent({
  model: "gpt-5.5",
  tools: [...],
  middleware: [summarizationMiddleware, humanInTheLoopMiddleware],
});
```

## The agent loop

The core agent loop involves calling a model, letting it choose tools to execute, and then finishing when it calls no more tools: ![Core agent loop diagram](https://res.cloudinary.com/dv3vzmogk/image/upload/v1781708237/aha-mind/docs-crawler/docs.langchain.com/core_agent_loop_yiopos.png) Middleware exposes hooks before and after each of those steps: ![Middleware flow diagram](https://res.cloudinary.com/dv3vzmogk/image/upload/v1781708237/aha-mind/docs-crawler/docs.langchain.com/middleware_final_p0rk4x.png)

## Use middleware inside a LangGraph workflow

Middleware is not a separate runtime: hooks run inside the compiled [LangGraph](https://docs.langchain.com/oss/javascript/langgraph/overview) that [`create_agent`](https://reference.langchain.com/javascript/langchain/index/createAgent) returns. You can drop the whole agent (middleware and all) into a larger [StateGraph](https://reference.langchain.com/javascript/langchain-langgraph/index/StateGraph) as a node or subgraph, and every middleware hook continues to run. Reach for this pattern when the surrounding topology is more than a standard “loop until done”: classifying input before routing to one of several agents, fanning out work in parallel, or stitching agent calls together with deterministic steps. `HumanInTheLoopMiddleware` matches against each tool’s `.name`. In Python, `@tool`\-decorated functions take their name from the function (so the key below is `"send_email"`); in TypeScript, the key matches the `name` you pass to `tool({...}, { name })`.

```
import { AgentState, createAgent, humanInTheLoopMiddleware } from "langchain";
import { StateGraph, START } from "@langchain/langgraph";

// Assumes readEmail, sendEmail, classifyNode, and route are defined elsewhere.
// readEmail / sendEmail are registered with name: "read_email" / "send_email".
const emailAgent = createAgent({
  model: "claude-sonnet-4-6",
  tools: [readEmail, sendEmail],
  middleware: [humanInTheLoopMiddleware({ interruptOn: { send_email: true } })],
});

const graph = new StateGraph(AgentState)
  .addNode("classify", classifyNode)
  .addNode("emailAgent", emailAgent)
  .addEdge(START, "classify")
  .addConditionalEdges("classify", route)
  .compile();
```

The HITL interrupt, summarization, PII redaction, retries, and any custom hooks all travel with the agent node. See [Use subgraphs](https://docs.langchain.com/oss/javascript/langgraph/use-subgraphs) for the full set of composition patterns, including subgraph checkpointer scoping (per-invocation versus per-thread).

## Additional resources

---
