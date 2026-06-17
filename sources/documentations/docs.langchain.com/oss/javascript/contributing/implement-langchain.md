---
title: "Implement a LangChain integration - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/contributing/implement-langchain"
crawled_at: "2026-06-17T14:59:06.099Z"
---

Integration packages are Python packages that users can install for use in their projects. They implement one or more components that adhere to the LangChain interface standards. LangChain components are subclasses of base classes in [`langchain-core`](https://github.com/langchain-ai/langchain/tree/master/libs/core). Examples include [chat models](https://docs.langchain.com/oss/javascript/integrations/chat), [tools](https://docs.langchain.com/oss/javascript/integrations/tools), [retrievers](https://docs.langchain.com/oss/javascript/integrations/retrievers), and more. Your integration package will typically implement a subclass of at least one of these components. Expand the tabs below to see details on each.

-   Chat Models
    
-   Embeddings
    
-   Tools
    
-   Middleware
    
-   Checkpointers
    
-   Sandboxes
    

Chat models are subclasses of the [`BaseChatModel`](https://reference.langchain.com/javascript/langchain-core/language_models/chat_models/BaseChatModel) class. They implement methods for generating chat completions, handling message formatting, and managing model parameters.

Embedding models are subclasses of the [`Embeddings`](https://reference.langchain.com/javascript/langchain-core/embeddings/Embeddings) class.

Tools are used in 2 main ways:

1.  To define an “input schema” or “args schema” to pass to a chat model’s tool calling feature along with a text request, such that the chat model can generate a “tool call”, or parameters to call the tool with.
2.  To take a “tool call” as generated above, and take some action and return a response that can be passed back to the chat model as a ToolMessage.

The Tools class must inherit from the [`BaseTool`](https://reference.langchain.com/javascript/classes/_langchain_core.tools.StructuredTool.html) base class. This interface has 3 properties and 2 methods that should be implemented in a subclass.

[Middleware](https://docs.langchain.com/oss/javascript/langchain/middleware/overview) lets you customize agent behavior by hooking into model calls, tool calls, and agent lifecycle events. Middleware classes subclass the [`AgentMiddleware`](https://reference.langchain.com/javascript/langchain/index/AgentMiddleware) base class.Read the [custom middleware guide](https://docs.langchain.com/oss/javascript/langchain/middleware/custom) to understand hooks, state updates, and middleware patterns before building an integration.Middleware integrations typically fall into two categories:

| Type | Description | Examples |
| --- | --- | --- |
| **Provider-specific** | Leverages a provider’s unique capabilities | Prompt caching, native tool execution, content moderation |
| **Cross-provider** | Works with any model or tool | Rate limiting, PII detection, logging, guardrails |

Provider-specific middleware lives in the provider’s integration package (for example `langchain-anthropic`). Cross-provider middleware can be published as a standalone package.You can also use these existing middleware integrations as reference:

Checkpointers enable [persistence](https://docs.langchain.com/oss/javascript/langgraph/persistence) in LangGraph, allowing agents to save and resume state across interactions.See existing checkpointer integrations in the [LangGraph repo](https://github.com/langchain-ai/langgraph/tree/main/libs) for implementation examples.

Sandbox integrations enable [Deep Agents](https://docs.langchain.com/oss/javascript/deepagents/overview) to run code in isolated environments.

---

Was this page helpful?
