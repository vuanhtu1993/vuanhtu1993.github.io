---
title: "Nomic integration - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/integrations/embeddings/nomic"
crawled_at: "2026-06-17T14:51:04.347Z"
---

-   [Setup](#setup)
-   [Usage](#usage)
-   [Related](#related)

The `NomicEmbeddings` class uses the Nomic AI API to generate embeddings for a given text.

## Setup

In order to use the Nomic API you’ll need to [sign up for a Nomic account and create an API key](https://atlas.nomic.ai/). You’ll first need to install the [`@langchain/nomic`](https://www.npmjs.com/package/@langchain/nomic) package:

npm

```
npm install @langchain/nomic @langchain/core
```

## Usage

```
import { NomicEmbeddings } from "@langchain/nomic";

/* Embed queries */
const nomicEmbeddings = new NomicEmbeddings();
const res = await nomicEmbeddings.embedQuery("Hello world");
console.log(res);
/* Embed documents */
const documentRes = await nomicEmbeddings.embedDocuments([
  "Hello world",
  "Bye bye",
]);
console.log(documentRes);
```

-   Embedding model [conceptual guide](https://docs.langchain.com/oss/javascript/integrations/embeddings)
-   Embedding model [how-to guides](https://docs.langchain.com/oss/javascript/integrations/embeddings)

---

Was this page helpful?
