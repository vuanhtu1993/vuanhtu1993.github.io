---
title: "Vector stores for file search in Microsoft Foundry Agent Service - Microsoft Foundry"
source_url: "https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/vector-stores"
crawled_at: "2026-06-27T11:25:51.558Z"
---

Vector store objects give the [file search](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/file-search) tool the ability to search your files. Adding a file to a vector store provides the agent's Foundry model with knowledge beyond its training data. The service parses, chunks, embeds, and indexes the file so the tool can run both keyword and semantic search.

Vector stores can be attached to both agents and conversations. Currently, you can attach at most one vector store to an agent and at most one vector store to a conversation. For a conceptual overview of conversations, see [Agent runtime components](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/runtime-components).

In the current agents developer experience, response generation uses **responses** and **conversations**. Some SDKs and older samples use the term _run_. If you see both terms, treat _run_ as response generation. For migration guidance, see [How to migrate to the new agent service](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/migrate).

For a list of limits for vector search (such as maximum allowable file sizes), see the [quotas and limits](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/limits-quotas-regions) article.

-   A [Microsoft Foundry project](https://learn.microsoft.com/en-us/azure/foundry/how-to/create-projects).
-   An agent or conversation that uses the [file search](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/file-search) tool.
-   If you use standard agent setup, connect Azure Blob Storage and Azure AI Search during setup so your files remain in your storage. See [Agent environment setup](https://learn.microsoft.com/en-us/azure/foundry/agents/environment-setup).
-   Roles and permissions vary by task (for example, creating projects, assigning roles for standard setup, or creating and editing agents). See the required permissions table in [Agent environment setup](https://learn.microsoft.com/en-us/azure/foundry/agents/environment-setup).
-   Feature availability can vary by region. For current coverage, see [Microsoft Foundry feature availability across cloud regions](https://learn.microsoft.com/en-us/azure/foundry/reference/region-support).

Vector stores are often the first place retrieval workflows fail in production, so it helps to know the defaults and hard limits.

-   **Files per vector store**: Each vector store can hold up to 10,000 files.
-   **Attachments**: You can attach at most one vector store to an agent and at most one vector store to a conversation.
-   **Default retrieval settings** (file search):
    -   Chunk size: 800 tokens
    -   Chunk overlap: 400 tokens
    -   Embedding model: text-embedding-3-large at 256 dimensions
    -   Maximum number of chunks added to context: 20

For file size and token limits, see [quotas and limits](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/limits-quotas-regions).

| Term | Meaning |
| --- | --- |
| Vector store | A container for searchable file content (chunks and embeddings) used by the file search tool. |
| Ingestion | The asynchronous process that parses, chunks, embeds, and indexes a file for search. |
| Readiness | Whether ingestion has completed and the vector store is searchable. |
| Expiration policy | A lifecycle policy that expires a vector store after a period of inactivity. |

File search applies retrieval best practices to help your agent find the right content from your files. Depending on the query and your data, the tool can:

-   Rewrite user queries to improve retrieval.
-   Break down complex queries into multiple searches.
-   Run both keyword and semantic searches across agent and conversation vector stores.
-   Rerank results before adding them to the model context.

For current default retrieval settings (chunk size and overlap, embedding model, and the maximum number of chunks added to context), see [How it works](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/file-search#how-file-search-works).

Where files and search resources live depends on your agent setup:

-   **Basic agent setup**: File search uses Microsoft-managed storage and search resources.
-   **Standard agent setup**: File search uses the Azure Blob Storage and Azure AI Search resources you connect during setup, so your files remain in your storage.

To set up your environment, see [Agent environment setup](https://learn.microsoft.com/en-us/azure/foundry/agents/environment-setup). For more detail, see [Dependency on agent setup](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/file-search#file-search-behavior-by-agent-setup-type).

Ensure all files in a vector store are fully processed before you create a response. This step ensures that all the data in your vector store is searchable.

To check readiness, use the SDK polling helpers (for example, _create-and-poll_ and _upload-and-poll_) or poll the vector store object until its status is **completed**. For code examples, see [File search tool for agents](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/file-search).

During ingestion, a vector store can be in **in\_progress** status. When ingestion completes, the status changes to **completed**.

As a fallback, response generation includes a 60-second maximum wait when the conversation's vector store contains files that are still being processed. This fallback wait doesn't apply to the agent's vector store.

Use this checklist to validate a working vector-store workflow from ingestion to lifecycle management.

1.  Decide whether you use basic agent setup or standard agent setup, based on where you want your files and search resources to live. See [Where your data lives (basic vs standard agent setup)](#where-your-data-lives-basic-vs-standard-agent-setup).
2.  Upload your files and create a vector store. For a step-by-step example, see [Upload files and add them to a vector store](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/file-search#upload-files-and-add-them-to-a-vector-store).
3.  Wait for ingestion to finish before you generate responses. Use SDK polling helpers or poll the vector store until its status is **completed** and no files remain in **in\_progress**. See [Ensuring vector store readiness before creating responses](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/file-search#ensuring-vector-store-readiness-before-creating-runs).
4.  Attach the vector store to the agent or conversation that you use for file search. Keep the attachment limits in mind. See [Vector stores](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/file-search#vector-stores).
5.  Create a response that uses file search and verify that the tool is retrieving from the expected sources. See [Create response with file search](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/file-search#create-response-with-file-search) and [Verify results](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/file-search#verify-file-search-results).
6.  Manage lifecycle: remove files you no longer need, and plan for expiration policies (especially for vector stores created by conversation helpers). See [Vector stores](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/file-search#vector-stores) and [Conversation vector stores have default expiration policies](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/file-search#conversation-vector-stores-have-default-expiration-policies).

Adding files to vector stores is an asynchronous operation. To ensure ingestion completes, use the create-and-poll helpers in the official SDKs. If you aren't using an SDK, poll the vector store until its status is **completed** and no files remain in **in\_progress**.

Files can also be added to a vector store after it's created by creating vector store files. Alternatively, you can add several files to a vector store by creating batches of up to 500 files.

When you upload a file to create a vector store, the system automatically:

1.  **Chunks your content** into manageable pieces.
2.  **Converts each chunk** into high-dimensional vectors using embedding models.
3.  **Stores these vectors** in an optimized search index.
4.  **Creates associations** between the vectors and your original content.

You can remove files from a vector store in two different ways:

-   Delete the vector store file object.
-   Delete the underlying file object. This removes the file from all vector store configurations across all agents and conversations in your organization.

Expiration policies help you manage vector store lifecycle. You can set these policies when creating or updating the vector store object.

Vector stores created using conversation helpers have a default expiration policy of seven days after they were last active (defined as the last time the vector store was used during response generation).

When a vector store expires, response generation for that conversation fails. To fix the issue, recreate a new vector store with the same files and reattach it to the conversation. For more detail, see [Conversation vector stores have default expiration policies](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/file-search#conversation-vector-stores-have-default-expiration-policies).

For the supported file types list and encoding requirements, see [Supported file types](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/file-search#supported-file-types).

Key limits to keep in mind:

-   You can attach at most one vector store to an agent and at most one vector store to a conversation.
-   File size and token limits vary by feature. See [Quotas and limits](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/limits-quotas-regions).

-   **Your vector store isn't searchable yet**: Wait for ingestion to finish. Use SDK polling helpers or poll the vector store until its status is **completed**.
-   **Response generation fails after a few days**: Your conversation vector store might have expired. Recreate a new vector store with the same files and reattach it.
-   **A file disappeared from multiple agents or conversations**: You might have deleted the underlying file object, which removes the file from all vector store configurations across your organization.
-   **Uploads or ingestion fail**: Check file size and token limits in [Quotas and limits](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/limits-quotas-regions).

-   Learn more about the [file search tool](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/file-search)
-   Review [tool best practices](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/tool-best-practice) for guidance on reliability and security
-   Learn about [agent runtime components](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/runtime-components)
