---
title: "Long-term memory - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/langchain/long-term-memory"
crawled_at: "2026-06-17T14:48:31.502Z"
---

Long-term memory lets your agent store and recall information across different conversations and sessions. Unlike [short-term memory](https://docs.langchain.com/oss/javascript/langchain/short-term-memory), which is scoped to a single thread, long-term memory persists across threads and can be recalled at any time. Long-term memory is built on [LangGraph stores](https://docs.langchain.com/oss/javascript/langgraph/stores), which save data as JSON documents organized by namespace and key.

## Usage

To add long-term memory to an agent, create a store and pass it to [`create_agent`](https://reference.langchain.com/javascript/langchain/index/createAgent):

-   InMemoryStore
    
-   PostgreSQL
    

```
npm install @langchain/langgraph-checkpoint-postgres
```

Tools can then read from and write to the store using the `runtime.store` parameter. See [Read long-term memory in tools](#read-long-term-memory-in-tools) and [Write long-term memory from tools](#write-long-term-memory-from-tools) for examples.

## Memory storage

LangGraph stores long-term memories as JSON documents in a [store](https://docs.langchain.com/oss/javascript/langgraph/stores). Each memory is organized under a custom `namespace` (similar to a folder) and a distinct `key` (like a file name). Namespaces often include user or org IDs or other labels that makes it easier to organize information. This structure enables hierarchical organization of memories. Cross-namespace searching is then supported through content filters.

-   InMemoryStore
    
-   PostgreSQL
    

```
import { InMemoryStore } from "@langchain/langgraph";

const embed = (texts: string[]): number[][] => {
  // Replace with an actual embedding function or LangChain embeddings object
  return texts.map(() => [1.0, 2.0]);
};

// InMemoryStore saves data to an in-memory dictionary. Use a DB-backed store in production use.
const store = new InMemoryStore({ index: { embed, dims: 2 } });
const userId = "my-user";
const applicationContext = "chitchat";
const namespace = [userId, applicationContext];

await store.put(namespace, "a-memory", {
  rules: [
    "User likes short, direct language",
    "User only speaks English & TypeScript",
  ],
  "my-key": "my-value",
});

// get the "memory" by ID
const item = await store.get(namespace, "a-memory");

// search for "memories" within this namespace, filtering on content equivalence, sorted by vector similarity
const items = await store.search(namespace, {
  filter: { "my-key": "my-value" },
  query: "language preferences",
});
```

```
import { PostgresStore } from "@langchain/langgraph-checkpoint-postgres/store";

const embed = (texts: string[]): number[][] => {
  return texts.map(() => [1.0, 2.0]);
};

const DB_URI =
  process.env.POSTGRES_URI ??
  "postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable";
const store = PostgresStore.fromConnString(DB_URI, {
  index: { embed, dims: 2 },
});
await store.setup();

const userId = "my-user";
const applicationContext = "chitchat";
const namespace = [userId, applicationContext];

await store.put(namespace, "a-memory", {
  rules: [
    "User likes short, direct language",
    "User only speaks English & TypeScript",
  ],
  "my-key": "my-value",
});

const item = await store.get(namespace, "a-memory");
const items = await store.search(namespace, {
  filter: { "my-key": "my-value" },
  query: "language preferences",
});
```

For more information about the memory store, see the [Persistence](https://docs.langchain.com/oss/javascript/langgraph/stores) guide.

## Read long-term memory in tools

-   InMemoryStore
    
-   PostgreSQL
    

## Write long-term memory from tools

-   InMemoryStore
    
-   PostgreSQL
    

---
