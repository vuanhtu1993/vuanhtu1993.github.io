---
title: "Build a semantic search engine with LangChain - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/langchain/knowledge-base"
crawled_at: "2026-06-17T14:53:13.291Z"
---

## Overview

This tutorial will familiarize you with LangChain’s [embedding](https://docs.langchain.com/oss/javascript/integrations/embeddings) and [vector store](https://docs.langchain.com/oss/javascript/integrations/vectorstores) abstractions. These abstractions are designed to support retrieval of data— from (vector) databases and other sources — for integration with LLM workflows. They are important for applications that fetch data to be reasoned over as part of model inference, as in the case of retrieval-augmented generation, or [RAG](https://docs.langchain.com/oss/javascript/langchain/retrieval). Here we will build a search engine over a PDF document. This will allow us to retrieve passages in the PDF that are similar to an input query. The guide also includes a minimal RAG implementation on top of the search engine.

### Concepts

This guide focuses on retrieval of text data. We will cover the following concepts:

-   [Documents](https://reference.langchain.com/python/langchain-core/documents);
-   [Text splitters](https://docs.langchain.com/oss/javascript/integrations/splitters);
-   [Embeddings](https://docs.langchain.com/oss/javascript/integrations/embeddings);
-   [Vector stores](https://docs.langchain.com/oss/javascript/integrations/vectorstores) and [retrievers](https://docs.langchain.com/oss/javascript/integrations/retrievers).

## Setup

### Installation

This guide reads a PDF using the `pdf-parse` package:

For more details, see our [Installation guide](https://docs.langchain.com/oss/javascript/langchain/install).

### LangSmith

Many of the applications you build with LangChain will contain multiple steps with multiple invocations of LLM calls. As these applications get more and more complex, it becomes crucial to be able to inspect what exactly is going on inside your chain or agent. The best way to do this is with [LangSmith](https://smith.langchain.com/?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=oss-langchain-knowledge-base). After you sign up at the link above, make sure to set your environment variables to start logging traces:

```
export LANGSMITH_TRACING="true"
export LANGSMITH_API_KEY="..."
```

## 1\. Documents

LangChain implements a [Document](https://reference.langchain.com/javascript/langchain-core/documents/Document) abstraction, which is intended to represent a unit of text and associated metadata. It has three attributes:

-   `pageContent`: a string representing the content;
-   `metadata`: a dict containing arbitrary metadata;
-   `id`: (optional) a string identifier for the document.

The `metadata` attribute can capture information about the source of the document, its relationship to other documents, and other information. Note that an individual [`Document`](https://reference.langchain.com/javascript/langchain-core/documents/Document) object often represents a chunk of a larger document. We can generate sample documents when desired:

```
import { Document } from "@langchain/core/documents";

const documents = [
  new Document({
    pageContent:
      "Dogs are great companions, known for their loyalty and friendliness.",
    metadata: { source: "mammal-pets-doc" },
  }),
  new Document({
    pageContent: "Cats are independent pets that often enjoy their own space.",
    metadata: { source: "mammal-pets-doc" },
  }),
];
```

## 2\. Embeddings

Vector search is a common way to store and search over unstructured data (such as unstructured text). The idea is to store numeric vectors that are associated with the text. Given a query, we can [embed](https://docs.langchain.com/oss/javascript/integrations/embeddings) it as a vector of the same dimension and use vector similarity metrics (such as cosine similarity) to identify related text. LangChain supports embeddings from [dozens of providers](https://docs.langchain.com/oss/javascript/integrations/embeddings). These models specify how text should be converted into a numeric vector. Let’s select a model:

-   OpenAI
    
-   Azure
    
-   AWS
    
-   VertexAI
    
-   MistralAI
    
-   Cohere
    

```
import { OpenAIEmbeddings } from "@langchain/openai";

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-large"
});
```

```
AZURE_OPENAI_API_INSTANCE_NAME=<YOUR_INSTANCE_NAME>
AZURE_OPENAI_API_KEY=<YOUR_KEY>
AZURE_OPENAI_API_VERSION="2024-02-01"
```

```
import { AzureOpenAIEmbeddings } from "@langchain/openai";

const embeddings = new AzureOpenAIEmbeddings({
  azureOpenAIApiEmbeddingsDeploymentName: "text-embedding-ada-002"
});
```

```
BEDROCK_AWS_REGION=your-region
```

```
import { BedrockEmbeddings } from "@langchain/aws";

const embeddings = new BedrockEmbeddings({
  model: "amazon.titan-embed-text-v1"
});
```

```
GOOGLE_APPLICATION_CREDENTIALS=credentials.json
```

```
import { VertexAIEmbeddings } from "@langchain/google-vertexai";

const embeddings = new VertexAIEmbeddings({
  model: "gemini-embedding-001"
});
```

```
MISTRAL_API_KEY=your-api-key
```

```
import { MistralAIEmbeddings } from "@langchain/mistralai";

const embeddings = new MistralAIEmbeddings({
  model: "mistral-embed"
});
```

```
COHERE_API_KEY=your-api-key
```

```
import { CohereEmbeddings } from "@langchain/cohere";

const embeddings = new CohereEmbeddings({
  model: "embed-english-v3.0"
});
```

```
const vector1 = await embeddings.embedQuery(documents[0].pageContent);
const vector2 = await embeddings.embedQuery(documents[1].pageContent);

assert vector1.length === vector2.length;
console.log(`Generated vectors of length ${vector1.length}\n`);
console.log(vector1.slice(0, 10));
```

```
Generated vectors of length 1536

[-0.008586574345827103, -0.03341241180896759, -0.008936782367527485, -0.0036674530711025, 0.010564599186182022, 0.009598285891115665, -0.028587326407432556, -0.015824200585484505, 0.0030416189692914486, -0.012899317778646946]
```

Armed with a model for generating text embeddings, we can next store them in a special data structure that supports efficient similarity search.

## 3\. Vector stores

LangChain [VectorStore](https://reference.langchain.com/javascript/langchain-core/vectorstores/VectorStore) objects contain methods for adding text and [`Document`](https://reference.langchain.com/javascript/langchain-core/documents/Document) objects to the store, and querying them using various similarity metrics. They are often initialized with [embedding](https://docs.langchain.com/oss/javascript/integrations/embeddings) models, which determine how text data is translated to numeric vectors. LangChain includes a suite of [integrations](https://docs.langchain.com/oss/javascript/integrations/vectorstores) with different vector store technologies. Some vector stores are hosted by a provider and require specific credentials to use; some run in separate infrastructure that can be run locally or via a third-party; others can run in-memory for lightweight workloads. Let’s select a vector store:

-   Memory
    
-   MongoDB
    
-   Pinecone
    
-   Qdrant
    
-   Redis
    

```
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";

const vectorStore = new MemoryVectorStore(embeddings);
```

```
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb"
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_ATLAS_URI || "");
const collection = client
  .db(process.env.MONGODB_ATLAS_DB_NAME)
  .collection(process.env.MONGODB_ATLAS_COLLECTION_NAME);

const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
  collection: collection,
  indexName: "vector_index",
  textKey: "text",
  embeddingKey: "embedding",
});
```

```
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";

const pinecone = new PineconeClient({
  apiKey: process.env.PINECONE_API_KEY,
});
const pineconeIndex = pinecone.Index("your-index-name");

const vectorStore = new PineconeStore(embeddings, {
  pineconeIndex,
  maxConcurrency: 5,
});
```

```
import { QdrantVectorStore } from "@langchain/qdrant";

const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
  url: process.env.QDRANT_URL,
  collectionName: "langchainjs-testing",
});
```

```
import { RedisVectorStore } from "@langchain/redis";

const vectorStore = new RedisVectorStore(embeddings, {
  redisClient: client,
  indexName: "langchainjs-testing",
});
```

### Seeding the vector store

Let’s seed the store with content from a PDF. [Here is a sample PDF](https://github.com/langchain-ai/langchain/blob/v0.3/docs/docs/example_data/nke-10k-2023.pdf) — a 10-k filing for Nike from 2023. We’ll read the PDF directly with a small helper and split it into smaller chunks before indexing.

```
import { readFileSync } from "node:fs";
import { Document } from "@langchain/core/documents";
import { PDFParse } from "pdf-parse";

// Below is a minimal helper for demonstration purposes.
async function loadPdfPages(filePath: string): Promise<Document[]> {
  const parser = new PDFParse({
    data: new Uint8Array(readFileSync(filePath)),
  });
  try {
    const { pages } = await parser.getText();
    return pages.map(
      (page) =>
        new Document({
          pageContent: page.text,
          metadata: { source: filePath, page: page.num - 1 },
        })
    );
  } finally {
    await parser.destroy();
  }
}

const filePath = "../../data/nke-10k-2023.pdf";
const docs = await loadPdfPages(filePath);
console.log(docs.length);
```

```
107
```

A page may be too coarse a representation for retrieval and downstream question-answering. Further splitting helps ensure that the meanings of relevant portions of the document are not “washed out” by surrounding text. We use [`RecursiveCharacterTextSplitter`](https://docs.langchain.com/oss/javascript/integrations/splitters), which recursively splits a document using common separators like new lines until each chunk is the appropriate size. This is the recommended text splitter for generic text use cases.

```
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

const allSplits = await textSplitter.splitDocuments(docs);

console.log(allSplits.length);
```

```
516
```

We can now index the chunks into the vector store.

```
await vectorStore.addDocuments(allSplits);
```

Note that most vector store implementations will allow you to connect to an existing vector store— e.g., by providing a client, index name, or other information. See the documentation for a specific [integration](https://docs.langchain.com/oss/javascript/integrations/vectorstores) for more detail. Once we’ve instantiated a [`VectorStore`](https://reference.langchain.com/javascript/langchain-core/vectorstores/VectorStore) that contains documents, we can query it. [VectorStore](https://reference.langchain.com/javascript/langchain-core/vectorstores/VectorStore) includes methods for querying:

-   Synchronously and asynchronously;
-   By string query and by vector;
-   With and without returning similarity scores;
-   By similarity and [maximum marginal relevance](https://reference.langchain.com/javascript/classes/_langchain_core.vectorstores.VectorStore.html#maxMarginalRelevanceSearch) (to balance similarity with query to diversity in retrieved results).

The methods will generally include a list of [Document](https://reference.langchain.com/javascript/langchain-core/documents/Document) objects in their outputs. **Usage** Embeddings typically represent text as a “dense” vector such that texts with similar meanings are geometrically close. This lets us retrieve relevant information just by passing in a question, without knowledge of any specific key-terms used in the document. Return documents based on similarity to a string query:

```
const results1 = await vectorStore.similaritySearch(
  "When was Nike incorporated?"
);

console.log(results1[0]);
```

```
Document {
    pageContent: 'direct to consumer operations sell products...',
    metadata: {'page': 4, 'source': '../example_data/nke-10k-2023.pdf', 'start_index': 3125}
}
```

Return scores:

```
const results2 = await vectorStore.similaritySearchWithScore(
  "What was Nike's revenue in 2023?"
);

console.log(results2[0]);
```

```
Score: 0.23699893057346344

Document {
    pageContent: 'Table of Contents...',
    metadata: {'page': 35, 'source': '../example_data/nke-10k-2023.pdf', 'start_index': 0}
}
```

Return documents based on similarity to an embedded query:

```
const embedding = await embeddings.embedQuery(
  "How were Nike's margins impacted in 2023?"
);

const results3 = await vectorStore.similaritySearchVectorWithScore(
  embedding,
  1
);

console.log(results3[0]);
```

```
Document {
    pageContent: 'FISCAL 2023 COMPARED TO FISCAL 2022...',
    metadata: {
        'page': 36,
        'source': '../example_data/nke-10k-2023.pdf',
        'start_index': 0
    }
}
```

Learn more:

-   [API Reference](https://reference.langchain.com/javascript/langchain-core/vectorstores/VectorStore)
-   [Integration-specific docs](https://docs.langchain.com/oss/javascript/integrations/vectorstores)

## 4\. Retrievers

LangChain [`VectorStore`](https://reference.langchain.com/javascript/langchain-core/vectorstores/VectorStore) objects do not subclass [Runnable](https://reference.langchain.com/javascript/langchain-core/runnables/Runnable). LangChain [Retrievers](https://reference.langchain.com/javascript/interfaces/_langchain_core.retrievers.BaseRetriever.html) are Runnables, so they implement a standard set of methods (e.g., synchronous and asynchronous `invoke` and `batch` operations). Although we can construct retrievers from vector stores, retrievers can interface with non-vector store sources of data, as well (such as external APIs). Vectorstores implement an `as_retriever` method that will generate a Retriever, specifically a [`VectorStoreRetriever`](https://reference.langchain.com/python/langchain-core/vectorstores/base/VectorStoreRetriever). These retrievers include specific `search_type` and `search_kwargs` attributes that identify what methods of the underlying vector store to call, and how to parameterize them. For instance, we can replicate the above with the following:

```
const retriever = vectorStore.asRetriever({
  searchType: "mmr",
  searchKwargs: {
    fetchK: 1,
  },
});

await retriever.batch([
  "When was Nike incorporated?",
  "What was Nike's revenue in 2023?",
]);
```

```
[
    [Document {
        metadata: {'page': 4, 'source': '../example_data/nke-10k-2023.pdf', 'start_index': 3125},
        pageContent: 'direct to consumer operations sell products...',
    }],
    [Document {
        metadata: {'page': 3, 'source': '../example_data/nke-10k-2023.pdf', 'start_index': 0},
        pageContent: 'Table of Contents...',
    }],
]
```

Retrievers can easily be incorporated into more complex applications, such as [retrieval-augmented generation (RAG)](https://docs.langchain.com/oss/javascript/langchain/retrieval) applications that combine a given question with retrieved context into a prompt for a LLM. To learn more about building such an application, check out the [RAG tutorial](https://docs.langchain.com/oss/javascript/langchain/rag) tutorial.

## Next steps

You’ve now seen how to build a semantic search engine over a PDF document. For more on embeddings:

-   [Overview](https://docs.langchain.com/oss/javascript/langchain/retrieval)
-   [Available integrations](https://docs.langchain.com/oss/javascript/integrations/embeddings)

For more on vector stores:

-   [Overview](https://docs.langchain.com/oss/javascript/langchain/retrieval)
-   [Available integrations](https://docs.langchain.com/oss/javascript/integrations/vectorstores)

For more on RAG, see:

-   [Build a Retrieval Augmented Generation (RAG) App](https://docs.langchain.com/oss/javascript/langchain/rag)

---
