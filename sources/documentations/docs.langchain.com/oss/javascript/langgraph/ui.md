---
title: "Agent Chat UI - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/langgraph/ui"
crawled_at: "2026-06-17T14:43:12.629Z"
---

[Agent Chat UI](https://github.com/langchain-ai/agent-chat-ui) is a Next.js application that provides a conversational interface for interacting with any LangChain agent. It supports real-time chat, tool visualization, and advanced features like time-travel debugging and state forking. Agent Chat UI works seamlessly with agents created using [`create_agent`](https://reference.langchain.com/python/langchain/agents/factory/create_agent) and provides interactive experiences for your agents with minimal setup, whether you’re running locally or in a deployed context (such as [LangSmith](https://docs.langchain.com/langsmith/observability)). Agent Chat UI is open source and can be adapted to your application needs.

### Quick start

The fastest way to get started is using the hosted version:

1.  **Visit [Agent Chat UI](https://agentchat.vercel.app/)**
2.  **Connect your agent** by entering your deployment URL or local server address
3.  **Start chatting** - the UI will automatically detect and render tool calls and interrupts

### Local development

For customization or local development, you can run Agent Chat UI locally:

### Connect to your agent

Agent Chat UI can connect to both [local](https://docs.langchain.com/oss/javascript/langgraph/studio#set-up-local-agent-server) and [deployed agents](https://docs.langchain.com/oss/javascript/langgraph/deploy). After starting Agent Chat UI, you’ll need to configure it to connect to your agent:

1.  **Graph ID**: Enter your graph name (find this under `graphs` in your `langgraph.json` file)
2.  **Deployment URL**: Your Agent server’s endpoint (e.g., `http://localhost:2024` for local development, or your deployed agent’s URL)
3.  **LangSmith API key (optional)**: Add your LangSmith API key (not required if you’re using a local Agent server)

Once configured, Agent Chat UI will automatically fetch and display any interrupted threads from your agent.

---
