---
title: "Persistence - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/langgraph/persistence"
crawled_at: "2026-06-17T14:41:46.455Z"
---

Persistence lets LangGraph applications keep useful information beyond a single graph run. It matters when an agent needs to continue a conversation, resume after an interruption, recover from a failure, or remember information across interactions. LangGraph provides two complementary persistence systems:

-   **[Checkpointers](https://docs.langchain.com/oss/javascript/langgraph/checkpointers)** persist a thread’s graph state as checkpoints. Use them for short-term, thread-scoped memory, including conversation continuity, human-in-the-loop workflows, time travel, and fault tolerance.
-   **[Stores](https://docs.langchain.com/oss/javascript/langgraph/stores)** persist application-defined data outside the graph state. Use them for long-term, cross-thread memory, including user preferences, facts, and shared knowledge.

Most applications can use both: a [checkpointer](https://docs.langchain.com/oss/javascript/langgraph/checkpointers) tracks the current thread, and a [store](https://docs.langchain.com/oss/javascript/langgraph/stores) tracks durable information across threads.

## Quickstart

Compile your graph with a checkpointer, a store, or both:

```
import { MemorySaver, MemoryStore } from "@langchain/langgraph";

const checkpointer = new MemorySaver();
const store = new MemoryStore();

const graph = builder.compile({ checkpointer, store });

const result = await graph.invoke(
  { messages: [{ role: "user", content: "Hi, my name is Bob." }] },
  { configurable: { thread_id: "thread-1" } }
);
```

## Checkpointer vs. store

|  | Checkpointer | Store |
| --- | --- | --- |
| Persists | Graph state snapshots | Application-defined key-value data |
| Scope | A single thread | Across threads |
| Memory type | Short-term, thread-scoped memory | Long-term, cross-thread memory |
| Use for | Conversation continuity, human-in-the-loop, time travel, and fault tolerance | User preferences, facts, and shared knowledge |
| Access pattern | Pass a `thread_id` in graph config | Read and write items from nodes or application code |
| Full guide | [Checkpointers](https://docs.langchain.com/oss/javascript/langgraph/checkpointers) | [Stores](https://docs.langchain.com/oss/javascript/langgraph/stores) |

## Next steps

-   [Use checkpointers](https://docs.langchain.com/oss/javascript/langgraph/checkpointers) to persist and inspect thread state.
-   [Use stores](https://docs.langchain.com/oss/javascript/langgraph/stores) to persist durable data across threads.

---
