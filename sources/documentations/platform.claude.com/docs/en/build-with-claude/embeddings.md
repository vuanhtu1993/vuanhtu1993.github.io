---
title: "Embeddings"
source_url: "https://platform.claude.com/docs/en/build-with-claude/embeddings"
crawled_at: "2026-11-01T16:16:54.450Z"
---

Text embeddings are numerical representations of text that let you measure semantic similarity. This guide introduces embeddings, their applications, and how to use embedding models for tasks such as search, recommendations, and anomaly detection.

## Before implementing embeddings

When selecting an embeddings provider, there are several factors you can consider depending on your needs and preferences:

-   Dataset size and domain specificity: size of the model training dataset and its relevance to the domain you want to embed. Larger or more domain-specific data generally produces better in-domain embeddings.
-   Inference performance: embedding lookup speed and end-to-end latency. This is a particularly important consideration for large-scale production deployments.
-   Customization: options for continued training on private data, or specialization of models for very specific domains. This can improve performance on unique vocabularies.

## How to get embeddings with Anthropic

Anthropic does not offer its own embedding model. One embeddings provider with a wide variety of models and capabilities is Voyage AI by MongoDB.

Voyage AI makes embedding models and rerankers. Its embedding models include general-purpose, multimodal, contextualized, and domain-specific models.

The rest of this guide is for Voyage AI, but you should assess a variety of embeddings vendors to find the best fit for your specific use case.

## Available models

Voyage AI offers the following text embedding models:

**Latest generation**

| Model | Context length | Embedding dimension | Description |
| --- | --- | --- | --- |
| `voyage-4-large` | 32,000 | 1024 (default), 256, 512, 2048 | The best general-purpose and multilingual retrieval quality. See the [Voyage 4 blog post](https://blog.voyageai.com/2026/01/15/voyage-4/) for details. |
| `voyage-4` | 32,000 | 1024 (default), 256, 512, 2048 | Optimized for general-purpose and multilingual retrieval quality. Balances quality and efficiency. See the [Voyage 4 blog post](https://blog.voyageai.com/2026/01/15/voyage-4/) for details. |
| `voyage-4-lite` | 32,000 | 1024 (default), 256, 512, 2048 | Optimized for latency and cost. See the [Voyage 4 blog post](https://blog.voyageai.com/2026/01/15/voyage-4/) for details. |
| `voyage-code-4` | 32,000 | 1024 (default), 256, 512, 2048 | Optimized for **code** retrieval and agentic coding applications. See the [voyage-code-4 blog post](https://blog.voyageai.com/2026/08/13/voyage-code-4/) for details. |
| `voyage-4-nano` | 32,000 | 2048 (default), 256, 512, 1024 | Open-weight model (Apache 2.0 license) that you download from [Hugging Face](https://huggingface.co/voyageai/voyage-4-nano) and run yourself. Not available through the Atlas Embedding and Reranking API. See the [Voyage 4 blog post](https://blog.voyageai.com/2026/01/15/voyage-4/) for details. |

**Previous generation**

For each model’s lifecycle status and recommended replacement, see [Model deprecations, lifecycle states, and support](https://www.mongodb.com/docs/voyageai/models/lifecycle/) in the MongoDB documentation.

| Model | Context length | Embedding dimension | Description |
| --- | --- | --- | --- |
| `voyage-3-large` | 32,000 | 1024 (default), 256, 512, 2048 | Previous generation of `voyage-4-large`. See the [voyage-3-large blog post](https://blog.voyageai.com/2025/01/07/voyage-3-large/) for details. |
| `voyage-3.5` | 32,000 | 1024 (default), 256, 512, 2048 | Previous generation of `voyage-4`. See the [voyage-3.5 blog post](https://blog.voyageai.com/2025/05/20/voyage-3-5/) for details. |
| `voyage-3.5-lite` | 32,000 | 1024 (default), 256, 512, 2048 | Previous generation of `voyage-4-lite`. See the [voyage-3.5 blog post](https://blog.voyageai.com/2025/05/20/voyage-3-5/) for details. |
| `voyage-code-3` | 32,000 | 1024 (default), 256, 512, 2048 | Previous generation of `voyage-code-4`. See the [voyage-code-3 blog post](https://blog.voyageai.com/2024/12/04/voyage-code-3/) for details. |
| `voyage-finance-2` | 32,000 | 1024 | Optimized for **finance** retrieval and RAG. See the [voyage-finance-2 blog post](https://blog.voyageai.com/2024/06/03/domain-specific-embeddings-finance-edition-voyage-finance-2/) for details. |
| `voyage-law-2` | 16,000 | 1024 | Optimized for **legal** retrieval and RAG. See the [voyage-law-2 blog post](https://blog.voyageai.com/2024/04/15/domain-specific-embeddings-and-retrieval-legal-edition-voyage-law-2/) for details. |

Additionally, Voyage AI offers the following multimodal embedding models. Call these models with `multimodal_embed()` instead of `embed()`:

| Model | Context length | Embedding dimension | Description |
| --- | --- | --- | --- |
| `voyage-multimodal-3.5` | 32,000 | 1024 (default), 256, 512, 2048 | Rich multimodal embedding model that can vectorize interleaved text, images, and videos. Includes video support as the first production-grade video embedding model. See the [voyage-multimodal-3.5 blog post](https://blog.voyageai.com/2026/01/15/voyage-multimodal-3-5/) for details. |
| `voyage-multimodal-3` | 32,000 | 1024 | Previous generation of `voyage-multimodal-3.5`. Vectorizes interleaved text and content-rich images, such as screenshots of PDFs, slides, tables, figures, and more. See the [voyage-multimodal-3 blog post](https://blog.voyageai.com/2024/11/12/voyage-multimodal-3/) for details. |

The following contextualized chunk embedding models produce chunk-level vectors that capture full document context without manual metadata augmentation. Call these models with `contextualized_embed()` instead of `embed()`:

| Model | Context length | Embedding dimension | Description |
| --- | --- | --- | --- |
| `voyage-context-4` | 120,000 | 1024 (default), 256, 512, 2048 | Contextualized chunk embeddings optimized for general-purpose and multilingual retrieval quality. See the [voyage-context-4 blog post](https://blog.voyageai.com/2026/06/29/voyage-context-4/) for details. |
| `voyage-context-3` | 120,000 | 1024 (default), 256, 512, 2048 | Previous generation of `voyage-context-4`. See the [voyage-context-3 blog post](https://blog.voyageai.com/2025/07/23/voyage-context-3/) for details. |

The 120,000-token limit applies when you set `enable_auto_chunking` to `true`. Otherwise, the total number of tokens across all inputs can’t exceed 32,000.

Voyage AI also offers rerankers, which take a query and a list of documents and return them ranked by relevance to the query. Call these models with `rerank()`:

| Model | Context length | Description |
| --- | --- | --- |
| `rerank-3` | 32,000 | Highest accuracy. Recommended for most applications. See the [rerank-3 blog post](https://blog.voyageai.com/2026/09/30/rerank-3/) for details. |
| `rerank-3-lite` | 32,000 | Optimized for latency and cost. See the [rerank-3 blog post](https://blog.voyageai.com/2026/09/30/rerank-3/) for details. |
| `rerank-2.5` | 32,000 | Previous generation of `rerank-3`. See the [rerank-2.5 blog post](https://blog.voyageai.com/2025/08/11/rerank-2-5/) for details. |
| `rerank-2.5-lite` | 32,000 | Previous generation of `rerank-3-lite`. See the [rerank-2.5 blog post](https://blog.voyageai.com/2025/08/11/rerank-2-5/) for details. |

Need help deciding which model to use? See [Voyage AI embedding and reranking models overview](https://www.mongodb.com/docs/voyageai/models/) in the MongoDB documentation.

## Getting started with Voyage AI

To access Voyage AI models, create a model API key in MongoDB Atlas:

1.  Sign up for a MongoDB Atlas account, or log in.
2.  In your Atlas project, select **AI Model APIs** in the navigation bar, click **Create model API key**, name the key, and click **Create**.
3.  Set the API key as an environment variable for convenience:

For more detail, see [Voyage AI quick start](https://www.mongodb.com/docs/voyageai/quickstart/) in the MongoDB documentation.

You can obtain the embeddings by using either the official [`voyageai` Python package](https://github.com/voyage-ai/voyageai-python) or HTTP requests, as described in the following sections. Voyage AI also has an official TypeScript client. To use it with a model API key from Atlas, set its `environment` option to `https://ai.mongodb.com/v1`, as described in [TypeScript client](https://www.mongodb.com/docs/voyageai/api-and-clients/#typescript-client) in the MongoDB documentation.

### Voyage AI Python library

Install the `voyageai` package using the following command. To use a model API key from Atlas, you need version 0.3.7 or later.

Then, you can create a client object and start using it to embed your texts:

`result.embeddings` is a list of two embedding vectors, each containing 1024 floating-point numbers. After running the preceding code, the two embeddings are printed on the screen:

When creating the embeddings, you can specify a few other arguments to the `embed()` function.

For more information on the Python package, see [Accessing Voyage AI models](https://www.mongodb.com/docs/voyageai/api-and-clients/) in the MongoDB documentation.

### Voyage AI HTTP API

You can also get embeddings by sending HTTP requests to the Atlas Embedding and Reranking API. For example, you can send an HTTP request through the `curl` command in a terminal:

The response is a JSON object containing the embeddings and the token usage:

Model API keys from Atlas work with `ai.mongodb.com`, except keys scoped to a geography, which use that geography’s endpoint. If you have an API key from the Voyage AI platform instead, see [Migrate your applications to use the Atlas Embedding and Reranking API](https://www.mongodb.com/docs/voyageai/tutorials/migrate-to-atlas/) in the MongoDB documentation.

For the full request and response reference, see [Create text embeddings](https://www.mongodb.com/docs/api/doc/atlas-embedding-and-reranking-api/operation/operation-createembedding) in the Atlas Embedding and Reranking API documentation.

### AWS Marketplace

Voyage AI models are also available on AWS Marketplace through [MongoDB’s seller profile](https://aws.amazon.com/marketplace/seller-profile?id=c9032c7b-70dd-459f-834f-c1e23cf3d092). For instructions, see [Deploy Voyage AI models using AWS Marketplace](https://www.mongodb.com/docs/voyageai/management/aws-marketplace/) in the MongoDB documentation.

## Quickstart example

The following brief example shows how to use embeddings.

Suppose you have a small corpus of six documents to retrieve from:

First, use Voyage AI to convert each document into an embedding vector.

The embeddings allow you to do semantic search / retrieval in the vector space. Consider the following example query:

Next, convert it into an embedding and conduct a nearest neighbor search to find the most relevant document based on the distance in the embedding space.

Note that `input_type="document"` and `input_type="query"` are used for embedding the document and query, respectively. For more about `input_type`, see [When and how should I use the input\_type parameter?](#faq) in the FAQ.

The output is the fifth document, which is indeed the most relevant to the query:

If you are looking for a detailed set of recipes on how to do RAG with embeddings, including vector databases, see the [RAG recipe](https://platform.claude.com/cookbook/third-party-pinecone-rag-using-pinecone).

## FAQ

## Pricing

For the most up-to-date pricing details, see [Model pricing](https://www.mongodb.com/docs/voyageai/management/billing/#model-pricing) in the MongoDB documentation.
