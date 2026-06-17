---
title: "Build a content builder agent - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/deepagents/content-builder"
crawled_at: "2026-06-17T14:53:08.539Z"
---

## Overview

This guide demonstrates how to build a content writing agent from scratch using [Deep Agents](https://docs.langchain.com/oss/javascript/deepagents). The agent you build will:

1.  Load voice and workflow rules from `AGENTS.md` and skill folders
2.  Delegate web research to a specialized subagent with `web_search`
3.  Draft blog or social content following the loaded skill
4.  Generate cover or social images with Gemini and save files under the project directory

The code in this tutorial wires in image generation tools and a filesystem backend so the agent can read and write posts, research notes, and images under the project directory. For the full runnable project, see the [content-builder-agent](https://github.com/langchain-ai/deepagents/tree/main/examples/content-builder-agent) example.

### Key concepts

This tutorial covers:

-   [Long-term memory](https://docs.langchain.com/oss/javascript/deepagents/memory) for TODO
-   [Skills](https://docs.langchain.com/oss/javascript/deepagents/skills) for TODO
-   [Subagents](https://docs.langchain.com/oss/javascript/deepagents/subagents) for TODO
-   [Filesystem backends](https://docs.langchain.com/oss/javascript/deepagents/backends) for file read and write
-   Custom [tools](https://docs.langchain.com/oss/javascript/langchain/tools) for search and image generation

## Prerequisites

API keys:

-   Anthropic (Claude) or other provider API key
-   Google (Gemini) for image generation with `gemini-2.5-flash-image`
-   [Tavily](https://www.tavily.com/) for web search (free tier)
-   [LangSmith](https://smith.langchain.com/?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=oss-deepagents-content-builder) for tracing (optional)

Node.js 18 or later.

## Setup

1

2

3

## Add configuration files

The example keeps behavior in three kinds of files: memory, skills, and subagent definitions.

1

2

## Build the script

Create `content_writer.ts` in the project root. The following sections belong in one file, in order.

1

2

3

## Run the agent

From the project directory:

```
npx tsx content_writer.ts
```

Pass a prompt as extra arguments:

```
npx tsx content_writer.ts Write a blog post about prompt engineering
```

With `LANGSMITH_API_KEY` set, you can inspect runs in [LangSmith](https://docs.langchain.com/langsmith/observability).

## Output

On success, the agent writes artifacts under the project root (the example directory), for example:

```
blogs/
└── prompt-engineering/
    ├── post.md
    └── hero.png
research/
└── prompt-engineering.md
```

Paths follow the skill instructions in `SKILL.md`.

## Full code

Browse the complete [content-builder-agent example](https://github.com/langchain-ai/deepagents/tree/main/examples/content-builder-agent) on GitHub, including the Rich-based streaming UI.

## Next steps

-   Edit `AGENTS.md` to change brand voice and research requirements
-   Add skills under `skills/<name>/SKILL.md` for new content types
-   Add subagents in `subagents.yaml` and register tools in `load_subagents`
-   Read [Subagents](https://docs.langchain.com/oss/javascript/deepagents/subagents), [Skills](https://docs.langchain.com/oss/javascript/deepagents/skills), and [Customization](https://docs.langchain.com/oss/javascript/deepagents/customization) for deeper configuration

---
