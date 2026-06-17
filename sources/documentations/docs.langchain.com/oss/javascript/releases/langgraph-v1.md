---
title: "What's new in LangGraph v1 - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/releases/langgraph-v1"
crawled_at: "2026-06-17T14:56:00.733Z"
---

**LangGraph v1 is a stability-focused release for the agent runtime.** It keeps the core graph APIs and execution model unchanged, while refining type safety, docs, and developer ergonomics. It’s designed to work hand-in-hand with [LangChain v1](https://docs.langchain.com/oss/javascript/releases/langchain-v1) (whose `createAgent` is built on LangGraph) so you can start high-level and drop down to granular control when needed.

To upgrade,

For a complete list of changes, see the [migration guide](https://docs.langchain.com/oss/javascript/migrate/langgraph-v1).

## Deprecation of `createReactAgent`

The LangGraph `createReactAgent` prebuilt has been deprecated in favor of LangChain’s `createAgent`. It provides a simpler interface, and offers greater customization potential through the introduction of middleware.

-   For information on the new `createAgent` API, see the [LangChain v1 release notes](https://docs.langchain.com/oss/javascript/releases/langchain-v1#createagent).
-   For information on migrating from `createReactAgent` to `createAgent`, see the [LangChain v1 migration guide](https://docs.langchain.com/oss/javascript/migrate/langchain-v1#createagent).

## Typed interrupts

[`StateGraph`](https://reference.langchain.com/javascript/langchain-langgraph/index/StateGraph) now accepts a map of interrupt types in the constructor to more closely constrain the types of interrupts that can be used within a graph.

```
import { StateGraph, MemorySaver, interrupt } from "@langchain/langgraph";
import * as z from "zod";

const stateSchema = z.object({
  foo: z.string(),
})

const graphConfig = {
  interrupts: {
    // Define a simple interrupt that accepts a reason and returns messages
    simple: interrupt<{ reason: string }, { messages: string[] }>,
    // Define a complex interrupt with the same signature
    complex: interrupt<{ reason: string }, { messages: string[] }>,
  }
}

const checkpointer = new MemorySaver();

const graph = new StateGraph(stateSchema, graphConfig)
  .addNode("node", async (state, runtime) => {
    // Trigger the simple interrupt with a reason
    const response = runtime.interrupt.simple({ reason: "test" });
    // Return the interrupt response as the new state
    return { foo: response };
  })
  // Compile the graph with the checkpointer
  .compile({ checkpointer });

// Invoke the graph with initial state
const result = await graph.invoke({ foo: "test" });

// Access the interrupt data
if (graph.isInterrupted(result)) {
  console.log(result.__interrupt__.messages);
}
```

For more information on interrupts, see the [Interrupts](https://docs.langchain.com/oss/javascript/langgraph/interrupts) documentation.

## Frontend SDK enhancements

LangGraph v1 comes with a few enhancements when interacting with a LangGraph application from the frontend.

### Event stream encoding

The low-level `toLangGraphEventStream` helper has been removed. Streaming responses are now handled natively by the SDK, and you can select the wire format via passing in the `encoding` format to `graph.stream`. This makes switching between SSE and normal JSON responses straightforward without changing UI logic. See the [migration guide](https://docs.langchain.com/oss/javascript/migrate/langgraph-v1#event-stream-encoding) for more information.

### Custom transports in `useStream`

The React `useStream` hook now supports pluggable transports so you can have more control over the network layer without changing UI code.

```
const stream = useStream({
  transport: new FetchStreamTransport({
    apiUrl: "http://localhost:2024",
  }),
});
```

Learn how to integrate and customize the hook: [Integrate LangGraph into your React application](https://docs.langchain.com/oss/javascript/langgraph/ui).

## Reporting issues

Please report any issues discovered with 1.0 on [GitHub](https://github.com/langchain-ai/langgraphjs/issues) using the [`'v1'` label](https://github.com/langchain-ai/langgraphjs/issues?q=state%3Aopen%20label%3Av1).

## Additional resources

## See also

-   [Versioning](https://docs.langchain.com/oss/javascript/versioning) – Understanding version numbers
-   [Release policy](https://docs.langchain.com/oss/javascript/release-policy) – Detailed release policies

---
