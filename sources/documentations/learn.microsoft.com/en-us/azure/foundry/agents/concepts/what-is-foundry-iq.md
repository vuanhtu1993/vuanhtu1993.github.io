---
title: "What is Foundry IQ? - Microsoft Foundry"
source_url: "https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/what-is-foundry-iq?tabs=portal"
crawled_at: "2026-06-27T11:31:46.638Z"
---

Note

Some Foundry IQ features are now generally available, while others remain in preview. Availability depends on the Search Service REST API version you use. The Microsoft Foundry portal and Azure portal continue to provide preview-only access to all agentic retrieval features.

For migration guidance, including a breakdown of what's generally available and what remains in preview, see [Migrate agentic retrieval code to the latest version](https://learn.microsoft.com/en-us/azure/search/agentic-retrieval-how-to-migrate).

Agents need context from scattered enterprise content to accurately answer questions. The Foundry model powering an agent has a knowledge cutoff and can't access your proprietary data on its own. With Foundry IQ, you can create a configurable, multi-source _knowledge base_ that provides agents with permission-aware responses based on your organization's data.

A knowledge base consists of _knowledge sources_ (connections to internal and external data stores) and parameters that control retrieval behavior. Multiple agents can share the same knowledge base. When an agent queries the knowledge base, Foundry IQ uses _agentic retrieval_ to process the query, retrieve relevant information, enforce user permissions, and return grounded answers with citations.

-   Connect one knowledge base to multiple agents. Supported knowledge sources include internal data stores (such as Azure Blob Storage, SharePoint, and OneLake) and public web data.
    
-   Automate document chunking, vector embedding generation, and metadata extraction for indexed knowledge sources. Schedule recurring indexer runs for incremental data refresh.
    
-   Issue keyword, vector, or hybrid queries across indexed and remote knowledge sources.
    
-   Use the agentic retrieval engine with a large language model (LLM) to plan queries, select sources, run parallel searches, and aggregate results.
    
-   Return extractive data with citations so agents can reason over raw content and trace answers to source documents.
    
-   Synchronize access control lists (ACLs) for supported sources and honor Microsoft Purview sensitivity labels. Enforce permissions at query time so agents return only authorized content.
    
-   Run queries under the caller's Microsoft Entra identity for end-to-end permission enforcement.
    

A Foundry IQ knowledge base contains knowledge sources and uses agentic retrieval to process queries. Azure AI Search provides the underlying indexing and retrieval infrastructure.

| Component | Description |
| --- | --- |
| [Knowledge base](https://learn.microsoft.com/en-us/azure/search/agentic-retrieval-how-to-create-knowledge-base) | Top-level resource that orchestrates agentic retrieval. Defines which knowledge sources to query and parameters that control retrieval behavior, including the retrieval reasoning effort (minimal, low, or medium) for LLM processing. |
| [Knowledge sources](https://learn.microsoft.com/en-us/azure/search/agentic-knowledge-source-overview) | Connections to indexed or remote content. A knowledge base references one or more knowledge sources. |
| [Agentic retrieval](https://learn.microsoft.com/en-us/azure/search/agentic-retrieval-overview) | Multi-query pipeline that decomposes complex questions into subqueries, executes them in parallel, semantically reranks results, and returns unified responses. Uses an optional LLM from Azure OpenAI in Foundry Models for query planning. |

You can use Foundry IQ knowledge bases in Foundry Agent Service, Microsoft Agent Framework, or any custom application by calling the knowledge base APIs from Azure AI Search.

You can set up Foundry IQ through a portal or programmatically. The following steps outline the typical workflow for both approaches.

-   [Portal](#tabpanel_1_portal)
-   [Programmatic](#tabpanel_1_programmatic)

1.  Sign in to [Microsoft Foundry](https://ai.azure.com/?cid=learnDocs). Make sure the **New Foundry** toggle is on. These steps refer to **Foundry (new)**.
    
    ![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782559906/aha-mind/docs-crawler/learn.microsoft.com/new-foundry_t9zgli.png)
    
2.  Create a project or select an existing project.
    
3.  From the top menu, select **Build**.
    
4.  On the **Knowledge** tab:
    
    1.  Create or connect to an existing search service that supports agentic retrieval.
    2.  Create a knowledge base by adding one knowledge source at a time.
    3.  Configure knowledge base properties for retrieval behavior.
5.  On the **Agents** tab:
    
    1.  Create or select an existing agent.
    2.  Connect to your knowledge base.
    3.  Use the playground to send messages and refine your agent.

Note

-   The playground provides a simplified workflow for proof-of-concept testing. When you move to code, configure managed identities and permissions to meet your organization's security requirements.
    
-   You can use the [Azure portal](https://learn.microsoft.com/en-us/azure/search/get-started-portal-agentic-retrieval) to create knowledge bases and knowledge sources, but agent configuration and integration must be done in the Microsoft Foundry portal or programmatically.
    

Microsoft provides three IQ workloads that give agents access to different aspects of your organization:

-   [Fabric IQ](https://learn.microsoft.com/en-us/fabric/iq/overview) is a semantic intelligence layer for Microsoft Fabric. It models business data (ontologies, semantic models, graphs, and data agents) so agents can reason over analytics in OneLake and Power BI.
    
-   [Work IQ](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/workiq-overview) is a contextual intelligence layer for Microsoft 365. It captures collaboration signals from documents, meetings, chats, and workflows, providing agents with insight into how your organization operates.
    
-   [Foundry IQ](#capabilities) is a managed knowledge layer for enterprise data. It connects structured and unstructured data across Azure, SharePoint, OneLake, and the web so agents can access permission-aware knowledge.
    

Each IQ workload is standalone, but you can use them together to provide comprehensive organizational context for agents.

-   [Watch this session](https://www.youtube.com/watch?v=slDdNIQCJBQ) for an introduction to Foundry IQ, and then [watch this video](https://www.youtube.com/watch?v=uDVkcZwB0EU) for a deep dive.
    
-   For minimum costs and proof-of-concept testing, start with the Microsoft Foundry portal. You can use the free tier for Azure AI Search and a free allocation of tokens for agentic retrieval. [Watch this video](https://www.youtube.com/watch?v=bHL1jbWjJUc) for a quick demonstration of the portal.
    
-   For step-by-step integration guidance, learn how to [connect a Foundry IQ knowledge base to Foundry Agent Service](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/foundry-iq-connect).
    
-   Review application code in the [Azure OpenAI demo](https://learn.microsoft.com/en-us/samples/azure-samples/azure-search-openai-demo/azure-search-openai-demo/), which uses agentic retrieval.
