---
title: "Quickstart - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/deepagents/quickstart"
crawled_at: "2026-06-17T14:44:17.778Z"
---

This guide walks you through creating your first deep agent with planning, file system tools, and subagent capabilities. You’ll build a research agent that can conduct research and write reports.

## Prerequisites

Before you begin, make sure you have an API key from a model provider (e.g., Gemini, Anthropic, OpenAI).

## Step 1: Install dependencies

## Step 2: Set up your API keys

-   Google
    
-   OpenAI
    
-   Anthropic
    
-   OpenRouter
    
-   Fireworks
    
-   Baseten
    
-   Ollama
    
-   Other
    

```
export GOOGLE_API_KEY="your-api-key"
export TAVILY_API_KEY="your-tavily-api-key"
```

```
export OPENAI_API_KEY="your-api-key"
export TAVILY_API_KEY="your-tavily-api-key"
```

```
export ANTHROPIC_API_KEY="your-api-key"
export TAVILY_API_KEY="your-tavily-api-key"
```

```
export OPENROUTER_API_KEY="your-api-key"
export TAVILY_API_KEY="your-tavily-api-key"
```

```
export FIREWORKS_API_KEY="your-api-key"
export TAVILY_API_KEY="your-tavily-api-key"
```

```
export BASETEN_API_KEY="your-api-key"
export TAVILY_API_KEY="your-tavily-api-key"
```

```
# Local: Ollama must be running on your machine
# Cloud: Set your Ollama API key for hosted inference
export OLLAMA_API_KEY="your-api-key"
export TAVILY_API_KEY="your-tavily-api-key"
```

```
# Set the API key for your provider
export <PROVIDER>_API_KEY="your-api-key"
export TAVILY_API_KEY="your-tavily-api-key"
```

Deep Agents work with any [LangChain chat model](https://docs.langchain.com/oss/javascript/deepagents/models#supported-models). Set the API key for your provider.

## Step 3: Create a search tool

```
import { tool } from "langchain";
import { TavilySearch } from "@langchain/tavily";
import { z } from "zod";

const internetSearch = tool(
  async ({
    query,
    maxResults = 5,
    topic = "general",
    includeRawContent = false,
  }: {
    query: string;
    maxResults?: number;
    topic?: "general" | "news" | "finance";
    includeRawContent?: boolean;
  }) => {
    const tavilySearch = new TavilySearch({
      maxResults,
      tavilyApiKey: process.env.TAVILY_API_KEY,
      includeRawContent,
      topic,
    });
    return await tavilySearch._call({ query });
  },
  {
    name: "internet_search",
    description: "Run a web search",
    schema: z.object({
      query: z.string().describe("The search query"),
      maxResults: z
        .number()
        .optional()
        .default(5)
        .describe("Maximum number of results to return"),
      topic: z
        .enum(["general", "news", "finance"])
        .optional()
        .default("general")
        .describe("Search topic category"),
      includeRawContent: z
        .boolean()
        .optional()
        .default(false)
        .describe("Whether to include raw content"),
    }),
  },
);
```

## Step 4: Create a deep agent

Pass a `model` string in `provider:model` format, or an [initialized model instance](https://docs.langchain.com/oss/javascript/deepagents/models#configure-model-parameters). See [supported models](https://docs.langchain.com/oss/javascript/deepagents/models#supported-models) for all providers and [suggested models](https://docs.langchain.com/oss/javascript/deepagents/models#suggested-models) for tested recommendations.

## Step 5: Run the agent

```
const result = await agent.invoke({
  messages: [{ role: "user", content: "What is langgraph?" }],
});

// Print the agent's response
console.log(result.messages[result.messages.length - 1].content);
```

## How does it work?

Your deep agent automatically:

1.  **Plans its approach** using the built-in [`write_todos`](https://docs.langchain.com/oss/javascript/deepagents/harness#task-planning) tool to break down the research task.
2.  **Conducts research** by calling the `internet_search` tool to gather information.
3.  **Manages context** by using file system tools ([`write_file`](https://docs.langchain.com/oss/javascript/deepagents/harness#virtual-filesystem-access), [`read_file`](https://docs.langchain.com/oss/javascript/deepagents/harness#virtual-filesystem-access)) to offload large search results.
4.  **Spawns subagents** as needed to delegate complex subtasks to specialized subagents.
5.  **Synthesizes a report** to compile findings into a coherent response.

## Examples

For agents, patterns, and applications you can build with Deep Agents, see [Examples](https://github.com/langchain-ai/deepagents/tree/main/examples).

## Streaming

Deep Agents have built-in [streaming](https://docs.langchain.com/oss/javascript/langchain/event-streaming) for real-time updates from agent execution using LangGraph. This allows you to observe output progressively and review and debug agent and subagent work, such as tool calls, tool results, and LLM responses.

## Next steps

Now that you’ve built your first deep agent:

-   **Customize your agent**: Learn about [customization options](https://docs.langchain.com/oss/javascript/deepagents/customization), including custom system prompts, tools, and subagents.
-   **Add long-term memory**: Enable [persistent memory](https://docs.langchain.com/oss/javascript/deepagents/memory) across conversations.
-   **Deploy to production**: Use [Managed Deep Agents](https://docs.langchain.com/langsmith/managed-deep-agents-overview) to create, run, and operate deep agents in LangSmith.

---
