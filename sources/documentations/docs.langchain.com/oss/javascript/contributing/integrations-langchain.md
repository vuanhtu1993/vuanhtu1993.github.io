---
title: "Contributing integrations - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/contributing/integrations-langchain"
crawled_at: "2026-06-17T14:55:06.601Z"
---

**Integrations are a core component of LangChain.** LangChain provides standard interfaces for several different components (language models, vector stores, etc) that are crucial when building LLM applications. Implementing a new integration helps expand LangChain’s ecosystem and makes your service discoverable to millions of developers.

## Why implement a LangChain integration?

## Components to integrate

While any component can be integrated into LangChain, there are specific types of integrations we encourage more: **Integrate these ✅**:

-   [**Chat Models**](https://docs.langchain.com/oss/javascript/integrations/chat): Most actively used component type
-   [**Tools/Toolkits**](https://docs.langchain.com/oss/javascript/integrations/tools): Enable agent capabilities
-   [**Retrievers**](https://docs.langchain.com/oss/javascript/integrations/retrievers): Core to RAG applications
-   [**Embedding Models**](https://docs.langchain.com/oss/javascript/integrations/embeddings): Foundation for vector operations
-   [**Vector Stores**](https://docs.langchain.com/oss/javascript/integrations/vectorstores): Essential for semantic search
-   [**Middleware**](https://docs.langchain.com/oss/javascript/integrations/middleware): Extend agent behavior with hooks
-   [**Sandboxes**](https://docs.langchain.com/oss/javascript/deepagents/sandboxes): Run code safely with Deep Agents

Additional third-party sandbox integration criteria

Be aware that we feature third-party sandbox integrations only when:

-   The integration is authored and maintained by the company that provides the sandbox.
-   **Or** the integration is widely used, meaning the integration must have a minimum of 10,000 daily downloads on PyPI or npm to be considered for featuring.

**Not these ❌**:

-   **LLMs (Text-Completion Models)**: Deprecated in favor of [Chat Models](https://docs.langchain.com/oss/javascript/integrations/chat)
-   [**Document Loaders**](https://docs.langchain.com/oss/javascript/integrations/document_loaders): High maintenance burden
-   [**Key-Value Stores**](https://docs.langchain.com/oss/javascript/integrations/stores): Limited usage
-   **Document Transformers**: Niche use cases
-   **Model Caches**: Infrastructure concerns
-   **Graphs**: Complex abstractions
-   **Message Histories**: Storage abstractions
-   **Callbacks**: System-level components
-   **Chat Loaders**: Limited demand
-   **Adapters**: Edge case utilities

## How to contribute an integration

1

2

3

4

---
