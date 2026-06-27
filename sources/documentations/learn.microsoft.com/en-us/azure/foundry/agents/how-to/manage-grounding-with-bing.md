---
title: "Manage Grounding With Bing Access - Microsoft Foundry"
source_url: "https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/manage-grounding-with-bing?source=recommendations"
crawled_at: "2026-06-27T11:33:04.353Z"
---

## In this article

1.  [Disable Grounding with Bing Search tools](#disable-grounding-with-bing-search-tools)
2.  [Disable web search tool](#disable-web-search-tool)
3.  [Disable web knowledge](#disable-web-knowledge)
4.  [Related content](#related-content)

Grounding with Bing enables agents to retrieve and incorporate real-time public web data into model-generated responses. It supports summarization, question answering, conversational assistance, and other scenarios by using Grounding with Bing Search or Grounding with Bing Custom Search to fill knowledge gaps.

Grounding is available across features in Foundry Agent Service and Azure AI Search. To meet compliance, privacy, or data governance requirements, you might need to disable access to these features.

As an admin, you can manage access to Grounding with Bing in the following ways:

-   [Disable Grounding with Bing Search tools](#disable-grounding-with-bing-search-tools) in Foundry Agent Service.
-   [Disable web search tool](#disable-web-search-tool) in Foundry Agent Service.
-   [Disable web knowledge](#disable-web-knowledge) in Azure AI Search.

You can disable Grounding with Bing Search, Grounding with Bing Custom Search, or both at the subscription or resource group level. For more information, see [Disable use of Grounding with Bing Search and Grounding with Bing Custom Search](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/bing-tools#disable-use-of-grounding-with-bing-search-and-grounding-with-bing-custom-search).

You can disable the web search tool for all accounts in a subscription. For more information, see [Disable Web Search](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/web-search#disable-web-search).

You can disable Web Knowledge Source access for all search services in a subscription. For more information, see [Disable use of Web Knowledge Source](https://learn.microsoft.com/en-us/azure/search/agentic-knowledge-source-how-to-web-manage#disable-use-of-web-knowledge-source).

Tip

To reenable access after disabling it, follow the steps in the linked articles to reverse the policy, setting, or feature registration.

-   [Grounding with Bing Search tools for agents](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/bing-tools)
-   [Web search tool](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/web-search)
-   [Create a Web Knowledge Source resource](https://learn.microsoft.com/en-us/azure/search/agentic-knowledge-source-how-to-web)

**Note:** The author created this article with assistance from AI. [Learn more](https://learn.microsoft.com/principles-for-ai-generated-content)

---

## Feedback

Was this page helpful?

---

## Additional resources

Documentation

-   [Overview of web grounding capabilities in Foundry - Microsoft Foundry](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/web-overview?source=recommendations)
    
    Learn how to choose the right web grounding tool for your Microsoft Foundry agents. Compare Web Search, Grounding with Bing Search, and Bing Custom Search.
    
-   [Use Grounding with Bing Search tools with the agents API - Microsoft Foundry](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/bing-tools?source=recommendations)
    
    Learn how to use Grounding with Bing Search and Grounding with Bing Custom Search (preview) tools to ground agent responses with web data.
    
-   [Use web search tool in Foundry Agent Service - Microsoft Foundry](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/web-search?source=recommendations)
    
    Use the web search tool in Foundry Agent Service to retrieve real-time information and ground AI responses. Includes code examples.
    
-   [How to use Custom Bing Search with Foundry Agent Service (classic) - Microsoft Foundry (classic) portal](https://learn.microsoft.com/en-us/azure/foundry-classic/agents/how-to/tools-classic/bing-custom-search?source=recommendations)
    
    Learn how to ground Azure AI Agents using Custom Bing Search results. (classic)
    
-   [How to use the Custom Bing Search with Foundry Agent Service tool (classic) - Microsoft Foundry (classic) portal](https://learn.microsoft.com/en-us/azure/foundry-classic/agents/how-to/tools-classic/bing-custom-search-samples?source=recommendations)
    
    Find samples to ground Microsoft Foundry Agents using Custom Bing Search results. (classic)
    
-   [Grounding with Bing Search code samples (classic) - Microsoft Foundry (classic) portal](https://learn.microsoft.com/en-us/azure/foundry-classic/agents/how-to/tools-classic/bing-code-samples?source=recommendations)
    
    Find code samples to ground Azure AI Agents using Bing Search results. (classic)
    
-   [Add a new connection to your project - Microsoft Foundry](https://learn.microsoft.com/en-us/azure/foundry/how-to/connections-add?source=recommendations)
    
    Learn how to add a new connection to your Foundry project.
    

---

-   Last updated on 05/14/2026
