---
title: "Overview of web grounding capabilities in Foundry - Microsoft Foundry"
source_url: "https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/web-overview"
crawled_at: "2026-06-27T11:26:48.140Z"
---

Web grounding tools in Microsoft Foundry Agent Service connect your agents to real-time public web data, overcoming the knowledge cutoff of the agent's Foundry model. For example, you can ask questions such as "what is the top AI news today" and receive current, cited answers.

The grounding process involves several key steps:

1.  **Query formulation**: The agent identifies information gaps and constructs search queries based on the user's input.
2.  **Search execution**: The grounding tool submits queries to Bing and retrieves results.
3.  **Information synthesis**: The agent processes search results and integrates findings into responses.
4.  **Source attribution**: The agent provides transparency by citing search sources with URLs.

Before using any web grounding tool, ensure you have:

-   A [basic or standard agent environment](https://learn.microsoft.com/en-us/azure/foundry/agents/environment-setup).
-   The latest SDK package for your language (Python: `azure-ai-projects`, C#: `Azure.AI.Projects` and `Azure.AI.Extensions.OpenAI`, JavaScript: `@azure/ai-projects`). See the [quickstart](https://learn.microsoft.com/en-us/azure/foundry/quickstarts/get-started-code) for installation steps.
-   An Azure OpenAI model deployment in your Foundry project.

Note

Web Search requires no extra roles beyond your Foundry project access. Grounding with Bing Search and Grounding with Bing Custom Search require **Contributor** or **Owner** role to create Bing resources, and **Foundry Project Manager** role to create project connections. For details, see [agent environment setup](https://learn.microsoft.com/en-us/azure/foundry/agents/environment-setup).

Important

The Foundry RBAC roles were recently renamed. **Foundry User**, **Foundry Owner**, **Foundry Account Owner**, and **Foundry Project Manager** were previously named Azure AI User, Azure AI Owner, Azure AI Account Owner, and Azure AI Project Manager. You might still see the previous names in some places while the rename rolls out. The role IDs and core permissions are unchanged by the rename.

If you're just getting started, use [Web Search](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/web-search). It requires no extra Azure resources and is the simplest way to add web grounding to your agent.

If you're migrating from Grounding with Bing Search on the classic agents platform, both [Web Search](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/web-search) and [Grounding with Bing Search](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/bing-tools) are GA options on the new agents API. Web Search requires no separate Bing resource. Grounding with Bing Search offers more parameters and supports non-OpenAI models deployed directly on Azure.

The following use cases help you compare the available tools. Use case 1 covers general web search, where both Web Search and Grounding with Bing Search can retrieve results from the public web. Use case 2 covers domain-restricted search, which only Grounding with Bing Custom Search supports.

|  | [Web Search](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/web-search) (recommended) | [Grounding with Bing Search](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/bing-tools) |
| --- | --- | --- |
| Stage | GA | GA |
| Grounding with Bing resource | Managed by Microsoft | Managed by you — requires creating a Grounding with Bing Search resource first |
| Supported parameters | \- `user_location`: Provides geo‑relevant results  
\- `search_context_size`: low/medium/high (default: medium)  
Learn more about [Web Search parameters](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/web-search#optional-parameters-for-general-web-search) | \- `count`: the maximum of results returned by Bing  
\- `freshness`: specifies the period for the search results  
\- `market`: specifies the region for the search results  
\- `set_lang`: specifies the language for the search results  
Learn more about [Bing Search parameters](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/bing-tools#optional-parameters) |
| Data boundary | Data flows outside Azure compliance boundary | Data flows outside Azure compliance boundary |
| Supported models | Azure OpenAI models | Azure OpenAI models and Foundry Models sold by Azure (non-OpenAI models deployed directly on Azure) |

|  | [Web Search](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/web-search) (recommended) | [Grounding with Bing Custom Search](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/bing-tools) |
| --- | --- | --- |
| Stage | GA (requires a Bing Custom Search instance) | Preview |
| Restrict to custom domains | Supported — use `custom_search_configuration` to pre‑define allowed or blocked domains (requires creating a Bing Custom Search resource + instance) | Supported — use `custom_search_configuration` to pre‑define allowed or blocked domains (requires creating a Bing Custom Search resource + instance) |
| Other parameters | \- `user_location`: Provides geo‑relevant results  
\- `search_context_size`: low/medium/high (default: medium)  
Learn more about [Web Search parameters](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/web-search#domain-restricted-search-with-bing-custom-search) | \- `count`: the maximum number of results returned by Bing  
\- `freshness`: specifies the period for the search results  
\- `market`: specifies the region for the search results  
\- `set_lang`: specifies the language for the search results  
Learn more about [Bing Custom Search parameters](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/bing-tools#optional-parameters) |
| Supported models | Azure OpenAI models | Azure OpenAI models and Models sold by Azure |

Use [Web Search](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/web-search). It requires no additional Azure resources, handles Bing resource management automatically, and provides geo-relevant results with the `user_location` parameter.

Web grounding tools don't respect VPN or private endpoints. They act as public endpoints. Consider this security implication when using network-secured Foundry with these tools.

Use [Web Search](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/web-search). This tool lets you define an allow-list or block-list of domains, so search results come only from sources you approve.

Yes. Web Search, Grounding with Bing Search, and Grounding with Bing Custom Search (preview) incur costs beyond standard Azure OpenAI usage. See [pricing details](https://www.microsoft.com/en-us/bing/apis).

| Issue | Likely cause | Resolution |
| --- | --- | --- |
| Agent doesn't use web grounding | Tool not configured or model doesn't support the tool. | Verify the tool is added to your agent definition. Use `tool_choice="required"` to force tool use. Check that your model deployment supports the tool. |
| No citations in response | The model generated a response without using search results. | Add explicit instructions to always cite sources. Use `tool_choice="required"` to ensure tool invocation. |
| Search results aren't relevant | Query formulation didn't capture user intent. | Improve agent instructions to guide query construction. For Bing tools, adjust `market` and `set_lang` parameters. |
| Tool blocked by administrator | Your organization disabled web grounding tools. | Contact your Azure administrator to enable access. See [administrator control](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/web-search#administrator-control-for-the-web-search-tool). |
| Unexpected costs | Web grounding tools have usage-based pricing. | Review [pricing details](https://www.microsoft.com/en-us/bing/apis) and implement rate limiting if needed. |

-   [Use the Web Search tool](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/web-search)
-   [Use Grounding with Bing Search and Grounding with Bing Custom Search](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/bing-tools)
-   [Best practices for using tools in Foundry Agent Service](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/tool-best-practice)
-   [Agent environment setup](https://learn.microsoft.com/en-us/azure/foundry/agents/environment-setup)
-   [Web grounding pricing](https://www.microsoft.com/en-us/bing/apis)
