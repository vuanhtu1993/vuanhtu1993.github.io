---
title: "TurbopufferVectorStore integration - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/integrations/vectorstores/turbopuffer"
crawled_at: "2026-06-17T14:52:33.875Z"
---

[turbopuffer](https://turbopuffer.com/) is a fast, cost-efficient vector database for search and retrieval. This guide helps you get started with the turbopuffer [vector store](https://docs.langchain.com/oss/javascript/integrations/vectorstores). For detailed documentation of all `TurbopufferVectorStore` features and configurations, see the [API reference](https://reference.langchain.com/javascript/langchain-turbopuffer/TurbopufferVectorStore).

## Overview

### Integration details

| Class | Package | [PY support](https://python.langchain.com/docs/integrations/vectorstores/turbopuffer/) | Downloads | Version |
| --- | --- | --- | --- | --- |
| [`TurbopufferVectorStore`](https://reference.langchain.com/javascript/langchain-turbopuffer/TurbopufferVectorStore) | [`@langchain/turbopuffer`](https://www.npmjs.com/package/@langchain/turbopuffer) | ✅ | ![NPM - Downloads](https://res.cloudinary.com/dv3vzmogk/image/upload/v1781707954/aha-mind/docs-crawler/docs.langchain.com/turbopuffer_jehu6r.svg) | ![NPM - Version](https://res.cloudinary.com/dv3vzmogk/image/upload/v1781707955/aha-mind/docs-crawler/docs.langchain.com/turbopuffer_uhvhii.svg) |

## Setup

[Sign up for a turbopuffer account](https://turbopuffer.com/join), create an API key, and install `@langchain/turbopuffer`, the official `@turbopuffer/turbopuffer` client, `@langchain/core`, and an embeddings provider (this guide uses [OpenAI embeddings](https://docs.langchain.com/oss/javascript/integrations/embeddings/openai)).

### Credentials

Set your API key as an environment variable:

```
process.env.TURBOPUFFER_API_KEY = "your-api-key";
```

Optionally set a [region](https://turbopuffer.com/docs/regions) (for example `gcp-us-central1`).

## Instantiation

Create a turbopuffer client and namespace, then pass the namespace to `TurbopufferVectorStore`:

```
import { OpenAIEmbeddings } from "@langchain/openai";
import { TurbopufferVectorStore } from "@langchain/turbopuffer";
import { Turbopuffer } from "@turbopuffer/turbopuffer";

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
});

const client = new Turbopuffer({
  apiKey: process.env.TURBOPUFFER_API_KEY,
  region: "gcp-us-central1",
});

const vectorStore = new TurbopufferVectorStore(embeddings, {
  namespace: client.namespace("my-namespace"),
});
```

## Manage vector store

### Add items to vector store

Currently, only string metadata values are supported.

```
import type { Document } from "@langchain/core/documents";

const createdAt = new Date().getTime();

const ids = await vectorStore.addDocuments([
  {
    pageContent: "some content",
    metadata: { created_at: createdAt.toString() },
  },
  { pageContent: "hi", metadata: { created_at: (createdAt + 1).toString() } },
  { pageContent: "bye", metadata: { created_at: (createdAt + 2).toString() } },
  {
    pageContent: "what's this",
    metadata: { created_at: (createdAt + 3).toString() },
  },
]);
```

### Delete items from vector store

```
await vectorStore.delete({ ids: [ids[ids.length - 1]] });
```

## Query vector store

### Query directly

```
const results = await vectorStore.similaritySearch("hello", 1);

for (const doc of results) {
  console.log(doc.pageContent, doc.metadata);
}
```

Filter by metadata using turbopuffer filter expressions. See the [turbopuffer filter documentation](https://turbopuffer.com/docs/reference/query#filter-parameters) for supported operators.

```
const results2 = await vectorStore.similaritySearch("hello", 1, [
  "created_at",
  "Eq",
  (createdAt + 3).toString(),
]);

for (const doc of results2) {
  console.log(doc.pageContent, doc.metadata);
}
```

### Upsert with existing IDs

```
await vectorStore.addDocuments(
  [
    { pageContent: "changed", metadata: { created_at: createdAt.toString() } },
    {
      pageContent: "hi changed",
      metadata: { created_at: (createdAt + 1).toString() },
    },
    {
      pageContent: "bye changed",
      metadata: { created_at: (createdAt + 2).toString() },
    },
    {
      pageContent: "what's this changed",
      metadata: { created_at: (createdAt + 3).toString() },
    },
  ],
  { ids }
);
```

### Delete all vectors in the namespace

```
await vectorStore.delete({ deleteAll: true });
```

### Usage for retrieval-augmented generation

For guides on how to use this vector store for retrieval-augmented generation (RAG), see the following sections:

-   [Build a RAG app with LangChain](https://docs.langchain.com/oss/javascript/langchain/rag).
-   [Agentic RAG](https://docs.langchain.com/oss/javascript/langgraph/agentic-rag)
-   [Retrieval docs](https://docs.langchain.com/oss/javascript/langchain/retrieval)

---

## API reference

For detailed documentation of all `TurbopufferVectorStore` features and configurations head to the [API reference](https://reference.langchain.com/javascript/langchain-turbopuffer/TurbopufferVectorStore).

---
