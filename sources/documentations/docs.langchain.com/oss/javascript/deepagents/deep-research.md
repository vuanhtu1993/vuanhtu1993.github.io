---
title: "Build a deep research agent - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/deepagents/deep-research"
crawled_at: "2026-06-17T14:53:03.971Z"
---

## Overview

This guide demonstrates how to build a multi-step web research agent from scratch using [Deep Agents](https://docs.langchain.com/oss/javascript/deepagents). The agent decomposes research questions into focused tasks, delegates them to specialized sub-agents, and synthesizes findings into a comprehensive report. The agent you build will:

1.  Plan research using a todo list
2.  Delegate focused research tasks to sub-agents with isolated context
3.  Assess search results and plan next steps as you gather information
4.  Synthesize findings with proper citations into a final report

The spawned sub-agents will conduct web searches with Tavily, fetching full webpage content for analysis.

### Key concepts

This tutorial covers:

-   [Subagents](https://docs.langchain.com/oss/javascript/deepagents/subagents) for parallel, context-isolated research
-   Custom [tools](https://docs.langchain.com/oss/javascript/langchain/tools) for web search
-   Multi-step planning with the [built-in planning tool](https://docs.langchain.com/oss/javascript/deepagents/harness#task-planning)

## Prerequisites

API keys for:

-   Anthropic (Claude) or Google (Gemini)
-   [Tavily](https://www.tavily.com/) for web search (optional - free tier sufficient)
-   [LangSmith](https://smith.langchain.com/?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=oss-deepagents-deep-research) for tracing (optional)

## Setup

1

2

3

Create `agent.ts` in your project directory:

1

2

3

## Run the agent

You can run the agent synchronously, meaning it will wait for the full result and then print it, or you can stream updates as they come in. Add the code from the respective tab at the bottom of `agent.ts`:

-   Run synchronously
    
-   Stream updates
    

```
{
  async function main() {
    const result = await agent.invoke({
      messages: [
        {
          role: "user",
          content:
            "What are the main differences between RAG and fine-tuning for LLM applications?",
        },
      ],
    });

    for (const msg of result.messages ?? []) {
      if (msg.content) {
        console.log(msg.content);
      }
    }
  }

  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
```

```
{
  async function main() {
    for await (const chunk of await agent.stream(
      {
        messages: [
          {
            role: "user",
            content: "Compare Python vs JavaScript for web development",
          },
        ],
      },
      { streamMode: "updates" },
    )) {
      for (const [, update] of Object.entries(chunk)) {
        const messages = (update as any)?.messages;
        if (!messages) continue;
        const msgList = Array.isArray(messages) ? messages : [messages];
        for (const msg of msgList) {
          if (msg.content) {
            console.log(msg.content);
          }
        }
      }
    }
  }

  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
```

Run the agent from the project root:

```
npx tsx agent.ts
```

If you set the `LANGSMITH_API_KEY` environment variable before running, you can view the agent’s traces in [LangSmith](https://docs.langchain.com/langsmith/observability) to debug and monitor multi-step behavior.

## Full code

View the complete [Deep Research example](https://github.com/langchain-ai/deepagents/tree/main/examples/deep_research) on GitHub.

## Next steps

Now that you’ve built the agent, customize it by changing the prompt constants in your agent file to adjust the workflow, delegation strategy, or researcher behavior. You can also tune the delegation limits to allow for more parallel sub-agents or delegation rounds. For more information on the concepts in this tutorial, check out the following resources:

-   [Subagents](https://docs.langchain.com/oss/javascript/deepagents/subagents): Learn how to configure subagents with different tools and prompts
-   [Customization](https://docs.langchain.com/oss/javascript/deepagents/customization): Customize models, tools, system prompts, and planning behavior
-   [LangSmith](https://docs.langchain.com/langsmith/observability): Trace research runs and debug multi-step behavior
-   [Deep Research Course](https://academy.langchain.com/courses/deep-research-with-langgraph): Full course on deep research with LangGraph

---
