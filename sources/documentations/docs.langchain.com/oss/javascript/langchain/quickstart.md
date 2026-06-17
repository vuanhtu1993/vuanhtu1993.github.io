---
title: "Quickstart - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/langchain/quickstart"
crawled_at: "2026-06-17T14:47:16.333Z"
---

This quickstart shows you how to create a fully functional AI agent in just a few minutes.

## Install dependencies

Install the following packages to follow along:

## Set up API keys

Get an API key from [any supported model provider](https://docs.langchain.com/oss/javascript/integrations/providers/overview) (for example, Google Gemini or OpenAI). Set the API keys, for example:

-   OpenAI
    
-   Google Gemini
    
-   Claude (Anthropic)
    
-   OpenRouter
    
-   Fireworks
    
-   Baseten
    
-   Ollama
    
-   Azure
    
-   AWS Bedrock
    
-   HuggingFace
    
-   Other
    

```
export OPENAI_API_KEY="your-api-key"
```

```
export GOOGLE_API_KEY="your-api-key"
```

```
export ANTHROPIC_API_KEY="your-api-key"
```

```
export OPENROUTER_API_KEY="your-api-key"
```

```
export FIREWORKS_API_KEY="your-api-key"
```

```
export BASETEN_API_KEY="your-api-key"
```

```
# Local: Ollama must be running (https://ollama.com)
# Cloud: Set your Ollama API key for hosted inference
export OLLAMA_API_KEY="your-api-key"
```

```
export AZURE_OPENAI_API_KEY="your-api-key"
export AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com"
export AZURE_OPENAI_DEPLOYMENT_NAME="your-deployment"
```

```
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_REGION="us-east-1"
```

```
export HUGGINGFACEHUB_API_TOKEN="hf_..."
```

## Build a basic agent

Start by creating a simple agent that can answer questions and call tools. The agent in this example uses the chosen language model, a basic weather function as a tool, and a simple prompt to guide its behavior:

When you run the code and prompt the agent to tell you about the weather in San Francisco, the agent uses that input and its available context. The agent understands that you are asking about the weather for the city San Francisco and therefore calls the weather tool with the provided city name.

## Build a real-world agent

In the following example you will build a research agent that can answer questions about text files. Along the way you will explore the following concepts:

1.  **Detailed system prompts** for better agent behavior
2.  **Create tools** that integrate with external data
3.  **Model configuration** for consistent responses
4.  **Conversational memory** for chat-like interactions
5.  **Deep Agents** for built-in features
6.  **Testing** your agent

1

2

3

4

5

6

## Trace agent calls

Most interesting applications you build with LangChain make many calls to LLMs. As these applications get more complex, it becomes important to be able to inspect what exactly is going on inside your agent. The best way to do this is with [LangSmith](https://smith.langchain.com/?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=oss-langchain-quickstart). Sign up for a [LangSmith](https://smith.langchain.com/?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=oss-langchain-quickstart) account and set these to start logging traces:

```
export LANGSMITH_TRACING="true"
export LANGSMITH_API_KEY="..."
```

Once set, run your script again and then inspect what happened during your agent calls on [LangSmith](https://smith.langchain.com/?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=oss-langchain-quickstart) .

## Next steps

You now have agents that can:

-   **Understand context** and remember conversations
-   **Use tools** intelligently
-   **Provide structured responses** in a consistent format
-   **Handle user-specific information** through context
-   **Maintain conversation state** across interactions
-   **Plan, research, and synthesize** (deep agents only)

Continue with:

-   **LangChain agents**: [Add and manage memory](https://docs.langchain.com/oss/javascript/langgraph/add-memory#manage-short-term-memory), [deploy to production](https://docs.langchain.com/oss/javascript/langgraph/deploy)
-   **Deep Agents**: [Customization options](https://docs.langchain.com/oss/javascript/deepagents/customization), [persistent memory](https://docs.langchain.com/oss/javascript/deepagents/memory), [deploy to production](https://docs.langchain.com/oss/javascript/langgraph/deploy)

---
