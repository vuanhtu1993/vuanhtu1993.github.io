---
title: "Embedding model integrations - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/integrations/embeddings"
crawled_at: "2026-06-17T14:49:45.800Z"
---

## Overview

Embedding models transform raw text—such as a sentence, paragraph, or tweet—into a fixed-length vector of numbers that captures its **semantic meaning**. These vectors allow machines to compare and search text based on meaning rather than exact words. In practice, this means that texts with similar ideas are placed close together in the vector space. For example, instead of matching only the phrase _“machine learning”_, embeddings can surface documents that discuss related concepts even when different wording is used.

### How it works

1.  **Vectorization** — The model encodes each input string as a high-dimensional vector.
2.  **Similarity scoring** — Vectors are compared using mathematical metrics to measure how closely related the underlying texts are.

### Similarity metrics

Several metrics are commonly used to compare embeddings:

-   **Cosine similarity** — measures the angle between two vectors.
-   **Euclidean distance** — measures the straight-line distance between points.
-   **Dot product** — measures how much one vector projects onto another.

## Interface

LangChain provides a standard interface for text embedding models (e.g., OpenAI, Cohere, Hugging Face) via the [Embeddings](https://reference.langchain.com/javascript/langchain-core/embeddings/Embeddings) interface. Two main methods are available:

-   `embedDocuments(documents: string[]) → number[][]`: Embeds a list of documents.
-   `embedQuery(text: string) → number[]`: Embeds a single query.

## Install and use

## Caching

Embeddings can be stored or temporarily cached to avoid needing to recompute them. Caching embeddings can be done using a `CacheBackedEmbeddings`. This wrapper stores embeddings in a key-value store, where the text is hashed and the hash is used as the key in the cache. The main supported way to initialize a `CacheBackedEmbeddings` is `fromBytesStore`. It takes the following parameters:

-   **underlyingEmbeddings**: The embedder to use for embedding.
-   **documentEmbeddingStore**: Any [`BaseStore`](https://docs.langchain.com/oss/javascript/integrations/stores) for caching document embeddings.
-   **options.namespace**: (optional, defaults to `""`) The namespace to use for the document cache. Helps avoid collisions (e.g., set it to the embedding model name).

```
import { CacheBackedEmbeddings } from "@langchain/classic/embeddings/cache_backed";
import { InMemoryStore } from "@langchain/core/stores";

const underlyingEmbeddings = new OpenAIEmbeddings();

const inMemoryStore = new InMemoryStore();

const cacheBackedEmbeddings = CacheBackedEmbeddings.fromBytesStore(
  underlyingEmbeddings,
  inMemoryStore,
  {
    namespace: underlyingEmbeddings.model,
  }
);

// Example: caching a query embedding
const tic = Date.now();
const queryEmbedding = cacheBackedEmbeddings.embedQuery("Hello, world!");
console.log(`First call took: ${Date.now() - tic}ms`);

// Example: caching a document embedding
const tic = Date.now();
const documentEmbedding = cacheBackedEmbeddings.embedDocuments(["Hello, world!"]);
console.log(`Cached creation time: ${Date.now() - tic}ms`);
```

In production, you would typically use a more robust persistent store, such as a database or cloud storage. Please see [stores integrations](https://docs.langchain.com/oss/javascript/integrations/stores) for options.

---
