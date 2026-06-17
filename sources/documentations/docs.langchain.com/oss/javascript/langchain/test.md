---
title: "Test - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/langchain/test"
crawled_at: "2026-06-17T14:56:22.265Z"
---

Agentic applications let an LLM decide its own next steps to solve a problem. That flexibility is powerful, but the model’s black-box nature makes it hard to predict how a tweak in one part of your agent will affect the whole. To build production-ready agents, thorough testing is essential. There are a few approaches to testing your agents:

-   **Unit tests** exercise small, deterministic pieces of your agent in isolation using in-memory fakes so you can assert exact behavior quickly and deterministically.
-   **Integration tests** test the agent using real network calls to confirm that components work together, credentials and schemas line up, and latency is acceptable.
-   **Evals** use evaluators to assess your agent’s execution trajectory, either via deterministic matching or an LLM judge.

Agentic applications tend to lean more on integration because they chain multiple components together and must deal with flakiness due to the nondeterministic nature of LLMs.

---
