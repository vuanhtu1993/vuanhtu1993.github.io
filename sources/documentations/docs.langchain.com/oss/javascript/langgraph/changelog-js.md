---
title: "Changelog - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/langgraph/changelog-js"
crawled_at: "2026-06-17T14:55:11.882Z"
---

## v1.1.0

### `@langchain/langgraph`

Introducing **StateSchema** - a cleaner, library-agnostic way to define graph state that works with any [Standard Schema](https://github.com/standard-schema/standard-schema)\-compliant validation library.

### Standard JSON Schema support

LangGraph now supports [Standard JSON Schema](https://standardschema.dev/json-schema), an open specification implemented by Zod 4, Valibot, ArkType, and other schema libraries. This means you can use your preferred validation library without lock-in:

```
import { z } from "zod"; // or valibot, arktype, etc.
import { StateSchema, ReducedValue, MessagesValue } from "@langchain/langgraph";

const AgentState = new StateSchema({
  messages: MessagesValue,
  currentStep: z.string(),
  count: z.number().default(0),
  history: new ReducedValue(
    z.array(z.string()).default(() => []),
    {
      inputSchema: z.string(),
      reducer: (current, next) => [...current, next],
    }
  ),
});

// Type-safe state and update types
type State = typeof AgentState.State;
type Update = typeof AgentState.Update;

const graph = new StateGraph(AgentState)
  .addNode("agent", (state) => ({ count: state.count + 1 }))
  .addEdge(START, "agent")
  .addEdge("agent", END)
  .compile();
```

### New state value primitives

-   **ReducedValue**: Define fields with custom reducers for accumulating values. Supports separate input and output schemas for type-safe reducer inputs.
-   **UntrackedValue**: Define transient state that exists during execution but is never checkpointed - useful for database connections, caches, or runtime-only configuration.
-   **MessagesValue**: A prebuilt `ReducedValue` for chat messages with the standard messages reducer.

### Type helper exports

New exported type utilities for typing functions outside the graph builder:

-   `GraphNode<Schema, Nodes?, Config?>` - Type node functions with full inference
-   `ConditionalEdgeRouter<Schema, Nodes?>` - Type conditional edge routers

```
// Type standalone node functions
const myNode: GraphNode<typeof AgentState> = (state, config) => {
  return { count: state.count + 1 };
};

// Use schema type helpers directly
const processState = (state: typeof AgentState.State) => {
  console.log(state.count);
};
```

The existing `Annotation` and zod-based API continues to work unchanged - `StateSchema` is an additional option for those who prefer schema-first definitions.
