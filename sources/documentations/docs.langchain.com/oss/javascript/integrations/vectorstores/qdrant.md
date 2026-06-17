---
title: "QdrantVectorStore integration - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/integrations/vectorstores/qdrant"
crawled_at: "2026-06-17T14:51:58.400Z"
---

[Qdrant](https://qdrant.tech/) is a vector similarity search engine. It provides a production-ready service with a convenient API to store, search, and manage points (vectors with an additional payload). This guide provides a quick overview for getting started with Qdrant [vector stores](https://docs.langchain.com/oss/javascript/integrations/vectorstores). For detailed documentation of all `QdrantVectorStore` features and configurations head to the [API reference](https://reference.langchain.com/javascript/langchain-qdrant/QdrantVectorStore).

## Overview

### Integration details

| Class | Package | [PY support](https://python.langchain.com/docs/integrations/vectorstores/qdrant/) | Downloads | Version |
| --- | --- | --- | --- | --- |
| [`QdrantVectorStore`](https://reference.langchain.com/javascript/langchain-qdrant/QdrantVectorStore) | [`@langchain/qdrant`](https://www.npmjs.com/package/@langchain/qdrant) | ✅ | ![NPM - Downloads](https://res.cloudinary.com/dv3vzmogk/image/upload/v1781707919/aha-mind/docs-crawler/docs.langchain.com/qdrant_al4rkt.svg) | ![NPM - Version](https://res.cloudinary.com/dv3vzmogk/image/upload/v1781707919/aha-mind/docs-crawler/docs.langchain.com/qdrant_ag9dur.svg) |

## Setup

To use Qdrant vector stores, set up a Qdrant instance and install `@langchain/qdrant` and `@langchain/core`. The `@langchain/qdrant` package bundles the Qdrant REST client (`@qdrant/js-client-rest`). This guide uses [OpenAI embeddings](https://docs.langchain.com/oss/javascript/integrations/embeddings/openai) as an example. You can use [other supported embeddings models](https://docs.langchain.com/oss/javascript/integrations/embeddings) instead.

After installing the required dependencies, run a Qdrant instance with Docker on your computer by following the [Qdrant setup instructions](https://qdrant.tech/documentation/quickstart/). Note the URL your container runs on.

### Credentials

Set a `QDRANT_URL` environment variable:

```
// e.g. http://localhost:6333
process.env.QDRANT_URL = "your-qdrant-url"
```

If you are using OpenAI embeddings for this guide, set your OpenAI key as well:

```
process.env.OPENAI_API_KEY = "YOUR_API_KEY";
```

If you want to get automated tracing of your model calls you can also set your [LangSmith](https://docs.langchain.com/langsmith/observability) API key by uncommenting below:

```
// process.env.LANGSMITH_TRACING="true"
// process.env.LANGSMITH_API_KEY="your-api-key"
```

## Instantiation

```
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
});

const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
  url: process.env.QDRANT_URL,
  collectionName: "langchainjs-testing",
});
```

## Manage vector store

### Add items to vector store

```
import type { Document } from "@langchain/core/documents";

const document1: Document = {
  pageContent: "The powerhouse of the cell is the mitochondria",
  metadata: { source: "https://example.com" }
};

const document2: Document = {
  pageContent: "Buildings are made out of brick",
  metadata: { source: "https://example.com" }
};

const document3: Document = {
  pageContent: "Mitochondria are made out of lipids",
  metadata: { source: "https://example.com" }
};

const document4: Document = {
  pageContent: "The 2024 Olympics are in Paris",
  metadata: { source: "https://example.com" }
}

const documents = [document1, document2, document3, document4];

await vectorStore.addDocuments(documents);
```

Top-level document ids and deletion are currently not supported.

## Query vector store

Once your vector store has been created and the relevant documents have been added you will most likely wish to query it during the running of your chain or agent.

### Query directly

Performing a simple similarity search can be done as follows:

```
const filter = {
  "must": [
      { "key": "metadata.source", "match": { "value": "https://example.com" } },
  ]
};

const similaritySearchResults = await vectorStore.similaritySearch("biology", 2, filter);

for (const doc of similaritySearchResults) {
  console.log(`* ${doc.pageContent} [${JSON.stringify(doc.metadata, null)}]`);
}
```

```
* The powerhouse of the cell is the mitochondria [{"source":"https://example.com"}]
* Mitochondria are made out of lipids [{"source":"https://example.com"}]
```

See [this page](https://qdrant.tech/documentation/concepts/filtering/) for more on Qdrant filter syntax. Note that all values must be prefixed with `metadata.` If you want to execute a similarity search and receive the corresponding scores you can run:

```
const similaritySearchWithScoreResults = await vectorStore.similaritySearchWithScore("biology", 2, filter)

for (const [doc, score] of similaritySearchWithScoreResults) {
  console.log(`* [SIM=${score.toFixed(3)}] ${doc.pageContent} [${JSON.stringify(doc.metadata)}]`);
}
```

```
* [SIM=0.165] The powerhouse of the cell is the mitochondria [{"source":"https://example.com"}]
* [SIM=0.148] Mitochondria are made out of lipids [{"source":"https://example.com"}]
```

### Query by turning into retriever

You can also transform the vector store into a [retriever](https://docs.langchain.com/oss/javascript/langchain/retrieval) for easier usage in your chains.

```
const retriever = vectorStore.asRetriever({
  // Optional filter
  filter: filter,
  k: 2,
});
await retriever.invoke("biology");
```

```
[
  Document {
    pageContent: 'The powerhouse of the cell is the mitochondria',
    metadata: { source: 'https://example.com' },
    id: undefined
  },
  Document {
    pageContent: 'Mitochondria are made out of lipids',
    metadata: { source: 'https://example.com' },
    id: undefined
  }
]
```

### Usage for retrieval-augmented generation

For guides on how to use this vector store for retrieval-augmented generation (RAG), see the following sections:

-   [Build a RAG app with LangChain](https://docs.langchain.com/oss/javascript/langchain/rag).
-   [Agentic RAG](https://docs.langchain.com/oss/javascript/langgraph/agentic-rag)
-   [Retrieval docs](https://docs.langchain.com/oss/javascript/langchain/retrieval)

---

## API reference

For detailed documentation of all `QdrantVectorStore` features and configurations head to the [API reference](https://reference.langchain.com/javascript/langchain-qdrant/QdrantVectorStore).

---
