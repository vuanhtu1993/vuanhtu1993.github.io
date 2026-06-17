---
title: "Component architecture - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/langchain/component-architecture"
crawled_at: "2026-06-17T14:54:14.914Z"
---

-   [Core component ecosystem](#core-component-ecosystem)
    -   [How components connect](#how-components-connect)
-   [Component categories](#component-categories)
-   [Common patterns](#common-patterns)
    -   [RAG (Retrieval-Augmented generation)](#rag-retrieval-augmented-generation)
    -   [Agent with tools](#agent-with-tools)
    -   [Multi-agent system](#multi-agent-system)
-   [Learn more](#learn-more)

LangChain’s power comes from how its components work together to create sophisticated AI applications. This page provides diagrams showcasing the relationships between different components.

## Core component ecosystem

The diagram below shows how LangChain’s major components connect to form complete AI applications:

### How components connect

Each component layer builds on the previous ones:

1.  **Input processing** – Transform raw data into structured documents
2.  **Embedding & storage** – Convert text into searchable vector representations
3.  **Retrieval** – Find relevant information based on user queries
4.  **Generation** – Use AI models to create responses, optionally with tools
5.  **Orchestration** – Coordinate everything through agents and memory systems

## Component categories

LangChain organizes components into these main categories:

| Category | Purpose | Key Components | Use Cases |
| --- | --- | --- | --- |
| **[Models](https://docs.langchain.com/oss/javascript/langchain/models)** | AI reasoning and generation | Chat models, LLMs, Embedding models | Text generation, reasoning, semantic understanding |
| **[Tools](https://docs.langchain.com/oss/javascript/langchain/tools)** | External capabilities | APIs, databases, etc. | Web search, data access, computations |
| **[Agents](https://docs.langchain.com/oss/javascript/langchain/agents)** | Orchestration and reasoning | ReAct agents, tool calling agents | Nondeterministic workflows, decision making |
| **[Memory](https://docs.langchain.com/oss/javascript/langchain/short-term-memory)** | Context preservation | Message history, custom state | Conversations, stateful interactions |
| **[Retrievers](https://docs.langchain.com/oss/javascript/integrations/retrievers)** | Information access | Vector retrievers, web retrievers | RAG, knowledge base search |
| **[Document processing](https://docs.langchain.com/oss/javascript/integrations/document_loaders)** | Data ingestion | Loaders, splitters, transformers | PDF processing, web scraping |
| **[Vector Stores](https://docs.langchain.com/oss/javascript/integrations/vectorstores)** | Semantic search | Chroma, Pinecone, FAISS | Similarity search, embeddings storage |

## Common patterns

### RAG (Retrieval-Augmented generation)

### Agent with tools

### Multi-agent system

## Learn more

-   [Creating agents](https://docs.langchain.com/oss/javascript/langchain/agents)
-   [Working with tools](https://docs.langchain.com/oss/javascript/langchain/tools)
-   [Browse integrations](https://docs.langchain.com/oss/javascript/integrations/providers/overview)

---

Was this page helpful?
