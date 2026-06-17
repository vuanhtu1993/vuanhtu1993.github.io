---
title: "Vector store integrations - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/integrations/vectorstores"
crawled_at: "2026-06-17T14:49:50.800Z"
---

## Overview

A [vector store](https://docs.langchain.com/oss/javascript/integrations/vectorstores) stores [embedded](https://docs.langchain.com/oss/javascript/integrations/embeddings) data and performs similarity search.

### Interface

LangChain provides a unified interface for vector stores, allowing you to:

-   `addDocuments` - Add documents to the store.
-   `delete` - Remove stored documents by ID.
-   `similaritySearch` - Query for semantically similar documents.

This abstraction lets you switch between different implementations without altering your application logic.

### Initialization

Most vectorstores in LangChain accept an embedding model as an argument when initializing the vector store.

```
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
});
const vectorStore = new MemoryVectorStore(embeddings);
```

### Adding documents

You can add documents to the vector store by using the `addDocuments` function.

```
import { Document } from "@langchain/core/documents";
const document = new Document({
  pageContent: "Hello world",
});
await vectorStore.addDocuments([document]);
```

### Deleting documents

You can delete documents from the vector store by using the `delete` function.

```
await vectorStore.delete({
  filter: {
    pageContent: "Hello world",
  },
});
```

### Similarity search

Issue a semantic query using `similaritySearch`, which returns the closest embedded documents:

```
const results = await vectorStore.similaritySearch("Hello world", 10);
```

Many vector stores support parameters like:

-   `k` — number of results to return
-   `filter` — conditional filtering based on metadata

### Similarity metrics & indexing

Embedding similarity may be computed using:

-   **Cosine similarity**
-   **Euclidean distance**
-   **Dot product**

Efficient search often employs indexing methods such as HNSW (Hierarchical Navigable Small World), though specifics depend on the vector store.

### Metadata filtering

Filtering by metadata (e.g., source, date) can refine search results:

```
vectorStore.similaritySearch("query", 2, { source: "tweets" });
```

**Select embedding model:**

**Select vector store:**

LangChain.js integrates with a variety of vector stores. You can check out a full list below:

## All vector stores

---
