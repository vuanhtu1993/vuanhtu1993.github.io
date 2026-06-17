---
title: "LangGraph runtime - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/langgraph/pregel"
crawled_at: "2026-06-17T14:43:42.884Z"
---

[`Pregel`](https://reference.langchain.com/javascript/langchain-langgraph/index/Pregel) implements LangGraph’s runtime, managing the execution of LangGraph applications. Compiling a [StateGraph](https://reference.langchain.com/javascript/langchain-langgraph/index/StateGraph) or creating an [entrypoint](https://reference.langchain.com/javascript/langchain-langgraph/index/entrypoint) produces a [`Pregel`](https://reference.langchain.com/javascript/langchain-langgraph/index/Pregel) instance that can be invoked with input. This guide explains the runtime at a high level and provides instructions for directly implementing applications with Pregel.

> **Note:** The [`Pregel`](https://reference.langchain.com/javascript/langchain-langgraph/index/Pregel) runtime is named after [Google’s Pregel algorithm](https://research.google/pubs/pub37252/), which describes an efficient method for large-scale parallel computation using graphs.

## Overview

In LangGraph, Pregel combines [**actors**](https://en.wikipedia.org/wiki/Actor_model) and **channels** into a single application. **Actors** read data from channels and write data to channels. Pregel organizes the execution of the application into multiple steps, following the **Pregel Algorithm**/**Bulk Synchronous Parallel** model. Each step consists of three phases:

-   **Plan**: Determine which **actors** to execute in this step. For example, in the first step, select the **actors** that subscribe to the special **input** channels; in subsequent steps, select the **actors** that subscribe to channels updated in the previous step.
-   **Execution**: Execute all selected **actors** in parallel, until all complete, or one fails, or a timeout is reached. During this phase, channel updates are invisible to actors until the next step.
-   **Update**: Update the channels with the values written by the **actors** in this step.

Repeat until no **actors** are selected for execution, or a maximum number of steps is reached.

## Actors

An **actor** is a `PregelNode`. It subscribes to channels, reads data from them, and writes data to them. It can be thought of as an **actor** in the Pregel algorithm. `PregelNodes` implement LangChain’s Runnable interface.

## Channels

Channels are used to communicate between actors (PregelNodes). Each channel has a value type, an update type, and an update function—which takes a sequence of updates and modifies the stored value. Channels can be used to send data from one chain to another, or to send data from a chain to itself in a future step.

### LastValue

[`LastValue`](https://reference.langchain.com/javascript/classes/_langchain_langgraph.channels.LastValue.html) is the default channel type. It stores the last value written to it, overwriting any previous value. Use it for input and output values, or for passing data from one step to the next.

```
import { LastValue } from "@langchain/langgraph/channels";

const channel = new LastValue<number>();
```

### Topic

[`Topic`](https://reference.langchain.com/javascript/langchain-langgraph/channels/Topic) is a configurable PubSub channel useful for sending multiple values between actors or accumulating output across steps. It can be configured to deduplicate values or to accumulate all values written during a run.

```
import { Topic } from "@langchain/langgraph/channels";

// Accumulate all values written across steps
const channel = new Topic<string>({ accumulate: true });
```

### BinaryOperatorAggregate

[`BinaryOperatorAggregate`](https://reference.langchain.com/javascript/langchain-langgraph/channels/BinaryOperatorAggregate) stores a persistent value that is updated by applying a binary operator to the current value and each new update. Use it to compute running aggregates across steps.

```
import { BinaryOperatorAggregate } from "@langchain/langgraph/channels";

// Running total: each write adds to the current value
const total = new BinaryOperatorAggregate<number>({ operator: (a, b) => a + b });
```

## Examples

While most users will interact with Pregel through the [StateGraph](https://reference.langchain.com/javascript/langchain-langgraph/index/StateGraph) API or the [entrypoint](https://reference.langchain.com/javascript/langchain-langgraph/index/entrypoint) decorator, it is possible to interact with Pregel directly. Below are a few different examples to give you a sense of the Pregel API.

-   Single node
    
-   Multiple nodes
    
-   Topic
    
-   BinaryOperatorAggregate
    
-   Cycle
    

```
import { EphemeralValue } from "@langchain/langgraph/channels";
import { Pregel, NodeBuilder } from "@langchain/langgraph/pregel";

const node1 = new NodeBuilder()
  .subscribeOnly("a")
  .do((x: string) => x + x)
  .writeTo("b");

const app = new Pregel({
  nodes: { node1 },
  channels: {
    a: new EphemeralValue<string>(),
    b: new EphemeralValue<string>(),
  },
  inputChannels: ["a"],
  outputChannels: ["b"],
});

await app.invoke({ a: "foo" });
```

```
{ b: 'foofoo' }
```

```
import { LastValue, EphemeralValue } from "@langchain/langgraph/channels";
import { Pregel, NodeBuilder } from "@langchain/langgraph/pregel";

const node1 = new NodeBuilder()
  .subscribeOnly("a")
  .do((x: string) => x + x)
  .writeTo("b");

const node2 = new NodeBuilder()
  .subscribeOnly("b")
  .do((x: string) => x + x)
  .writeTo("c");

const app = new Pregel({
  nodes: { node1, node2 },
  channels: {
    a: new EphemeralValue<string>(),
    b: new LastValue<string>(),
    c: new EphemeralValue<string>(),
  },
  inputChannels: ["a"],
  outputChannels: ["b", "c"],
});

await app.invoke({ a: "foo" });
```

```
{ b: 'foofoo', c: 'foofoofoofoo' }
```

```
import { EphemeralValue, Topic } from "@langchain/langgraph/channels";
import { Pregel, NodeBuilder } from "@langchain/langgraph/pregel";

const node1 = new NodeBuilder()
  .subscribeOnly("a")
  .do((x: string) => x + x)
  .writeTo("b", "c");

const node2 = new NodeBuilder()
  .subscribeTo("b")
  .do((x: { b: string }) => x.b + x.b)
  .writeTo("c");

const app = new Pregel({
  nodes: { node1, node2 },
  channels: {
    a: new EphemeralValue<string>(),
    b: new EphemeralValue<string>(),
    c: new Topic<string>({ accumulate: true }),
  },
  inputChannels: ["a"],
  outputChannels: ["c"],
});

await app.invoke({ a: "foo" });
```

```
{ c: ['foofoo', 'foofoofoofoo'] }
```

This example demonstrates how to use the [`BinaryOperatorAggregate`](https://reference.langchain.com/javascript/langchain-langgraph/channels/BinaryOperatorAggregate) channel to implement a reducer.

```
import { EphemeralValue, BinaryOperatorAggregate } from "@langchain/langgraph/channels";
import { Pregel, NodeBuilder } from "@langchain/langgraph/pregel";

const node1 = new NodeBuilder()
  .subscribeOnly("a")
  .do((x: string) => x + x)
  .writeTo("b", "c");

const node2 = new NodeBuilder()
  .subscribeOnly("b")
  .do((x: string) => x + x)
  .writeTo("c");

const reducer = (current: string, update: string) => {
  if (current) {
    return current + " | " + update;
  } else {
    return update;
  }
};

const app = new Pregel({
  nodes: { node1, node2 },
  channels: {
    a: new EphemeralValue<string>(),
    b: new EphemeralValue<string>(),
    c: new BinaryOperatorAggregate<string>({ operator: reducer }),
  },
  inputChannels: ["a"],
  outputChannels: ["c"],
});

await app.invoke({ a: "foo" });
```

This example demonstrates how to introduce a cycle in the graph, by having a chain write to a channel it subscribes to. Execution will continue until a `null` value is written to the channel.

```
import { EphemeralValue } from "@langchain/langgraph/channels";
import { Pregel, NodeBuilder, ChannelWriteEntry } from "@langchain/langgraph/pregel";

const exampleNode = new NodeBuilder()
  .subscribeOnly("value")
  .do((x: string) => x.length < 10 ? x + x : null)
  .writeTo(new ChannelWriteEntry("value", { skipNone: true }));

const app = new Pregel({
  nodes: { exampleNode },
  channels: {
    value: new EphemeralValue<string>(),
  },
  inputChannels: ["value"],
  outputChannels: ["value"],
});

await app.invoke({ value: "a" });
```

```
{ value: 'aaaaaaaaaaaaaaaa' }
```

## High-level API

LangGraph provides two high-level APIs for creating a Pregel application: the [StateGraph (Graph API)](https://docs.langchain.com/oss/javascript/langgraph/graph-api) and the [Functional API](https://docs.langchain.com/oss/javascript/langgraph/functional-api).

-   StateGraph (Graph API)
    
-   Functional API
    

The [StateGraph (Graph API)](https://reference.langchain.com/javascript/langchain-langgraph/index/StateGraph) is a higher-level abstraction that simplifies the creation of Pregel applications. It allows you to define a graph of nodes and edges. When you compile the graph, the StateGraph API automatically creates the Pregel application for you.

```
import { START, StateGraph } from "@langchain/langgraph";

interface Essay {
  topic: string;
  content?: string;
  score?: number;
}

const writeEssay = (essay: Essay) => {
  return {
    content: `Essay about ${essay.topic}`,
  };
};

const scoreEssay = (essay: Essay) => {
  return {
    score: 10
  };
};

const builder = new StateGraph<Essay>({
  channels: {
    topic: null,
    content: null,
    score: null,
  }
})
  .addNode("writeEssay", writeEssay)
  .addNode("scoreEssay", scoreEssay)
  .addEdge(START, "writeEssay")
  .addEdge("writeEssay", "scoreEssay");

// Compile the graph.
// This will return a Pregel instance.
const graph = builder.compile();
```

The compiled Pregel instance will be associated with a list of nodes and channels. You can inspect the nodes and channels by printing them.

```
console.log(graph.nodes);
```

You will see something like this:

```
{
  __start__: PregelNode { ... },
  writeEssay: PregelNode { ... },
  scoreEssay: PregelNode { ... }
}
```

```
console.log(graph.channels);
```

You should see something like this

```
{
  topic: LastValue { ... },
  content: LastValue { ... },
  score: LastValue { ... },
  __start__: EphemeralValue { ... },
  writeEssay: EphemeralValue { ... },
  scoreEssay: EphemeralValue { ... },
  'branch:__start__:__self__:writeEssay': EphemeralValue { ... },
  'branch:__start__:__self__:scoreEssay': EphemeralValue { ... },
  'branch:writeEssay:__self__:writeEssay': EphemeralValue { ... },
  'branch:writeEssay:__self__:scoreEssay': EphemeralValue { ... },
  'branch:scoreEssay:__self__:writeEssay': EphemeralValue { ... },
  'branch:scoreEssay:__self__:scoreEssay': EphemeralValue { ... },
  'start:writeEssay': EphemeralValue { ... }
}
```

In the [Functional API](https://docs.langchain.com/oss/javascript/langgraph/functional-api), you can use an [`entrypoint`](https://reference.langchain.com/javascript/langchain-langgraph/index/entrypoint) to create a Pregel application. The `entrypoint` decorator allows you to define a function that takes input and returns output.

```
import { MemorySaver } from "@langchain/langgraph";
import { entrypoint } from "@langchain/langgraph/func";

interface Essay {
  topic: string;
  content?: string;
  score?: number;
}

const checkpointer = new MemorySaver();

const writeEssay = entrypoint(
  { checkpointer, name: "writeEssay" },
  async (essay: Essay) => {
    return {
      content: `Essay about ${essay.topic}`,
    };
  }
);

console.log("Nodes: ");
console.log(writeEssay.nodes);
console.log("Channels: ");
console.log(writeEssay.channels);
```

```
Nodes:
{ writeEssay: PregelNode { ... } }
Channels:
{
  __start__: EphemeralValue { ... },
  __end__: LastValue { ... },
  __previous__: LastValue { ... }
}
```

---
