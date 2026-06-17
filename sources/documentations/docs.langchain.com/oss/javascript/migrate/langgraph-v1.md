---
title: "LangGraph v1 migration guide - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/migrate/langgraph-v1"
crawled_at: "2026-06-17T14:56:07.469Z"
---

This guide outlines changes in LangGraph v1 and how to migrate from previous versions. For a high-level overview of what’s new, see the [release notes](https://docs.langchain.com/oss/javascript/releases/langgraph-v1). To upgrade,

## Summary of changes

| Area | What changed |
| --- | --- |
| React prebuilt | `createReactAgent` deprecated; use LangChain `createAgent` |
| Interrupts | Typed interrupts supported via `interrupts` config |
| `toLangGraphEventStream` removed | Use `graph.stream` with the desired `encoding` format |
| `useStream` | Supports custom transports |

---

## Deprecation: `createReactAgent` → `createAgent`

LangGraph v1 deprecates the `createReactAgent` prebuilt. Use LangChain’s `createAgent`, which runs on LangGraph and adds a flexible middleware system. See the LangChain v1 docs for details:

-   [Release notes](https://docs.langchain.com/oss/javascript/releases/langchain-v1#createagent)
-   [Migration guide](https://docs.langchain.com/oss/javascript/migrate/langchain-v1#createagent)

---

## Typed interrupts

You can now define interrupt types at graph construction to strictly type the values passed to and received from interrupts.

See [Interrupts](https://docs.langchain.com/oss/javascript/langgraph/interrupts) to learn more.

---

## Event stream encoding

The low-level `toLangGraphEventStream` helper is removed. Streaming responses are handled by the SDK; when using low-level clients, select the wire format via an `encoding` option passed to `graph.stream`.

---

## Breaking changes

### Dropped Node 18 support

All LangGraph packages now require **Node.js 20 or higher**. Node.js 18 reached [end of life](https://nodejs.org/en/about/releases/) in March 2025.

### New build outputs

Builds for all langgraph packages now use a bundler based approach instead of using raw typescript outputs. If you were importing files from the `dist/` directory (which is not recommended), you will need to update your imports to use the new module system.

---
