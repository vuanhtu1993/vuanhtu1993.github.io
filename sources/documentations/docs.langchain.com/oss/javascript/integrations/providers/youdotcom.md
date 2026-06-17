---
title: "You.com - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/integrations/providers/youdotcom"
crawled_at: "2026-06-17T14:52:54.455Z"
---

Integrate with You.com using LangChain JavaScript.

[You.com](https://you.com/) is an AI productivity platform providing real-time web search and content extraction APIs designed for LLM applications.

## Installation and setup

Set your You.com API key. Get your API key at [you.com/platform](https://you.com/platform).

```
process.env.YDC_API_KEY = "your-api-key";
```

## Tools

The package provides three `DynamicStructuredTool` instances: `youSearch`, `youResearch`, and `youContents`. See a [usage example](https://docs.langchain.com/oss/javascript/integrations/tools/youdotcom).

```
import { youSearch, youResearch, youContents } from "@youdotcom-oss/langchain";
```

---

Was this page helpful?
