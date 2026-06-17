---
title: "Use subagents in Deep Agents Code - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/deepagents/code/subagents"
crawled_at: "2026-06-17T14:46:25.014Z"
---

Define custom synchronous [subagents](https://docs.langchain.com/oss/javascript/deepagents/subagents) as markdown files so Deep Agents Code can delegate specialized tasks to them.

Each subagent lives in its own folder with an `AGENTS.md` file:

```
.deepagents/agents/{subagent-name}/AGENTS.md   # Project-level
~/.deepagents/{agent}/agents/{subagent-name}/AGENTS.md  # User-level
```

Project subagents override user subagents with the same name (see [precedence rules](https://docs.langchain.com/oss/javascript/deepagents/code/data-locations#subagents)). The frontmatter requires `name` and `description` (same as the [`SubAgent` dictionary spec](https://docs.langchain.com/oss/javascript/deepagents/subagents#subagent-dictionary-based)). The markdown body becomes the subagent’s `system_prompt`. In addition to the base spec, `AGENTS.md` files support an optional `model` frontmatter field that overrides the main agent’s model for this subagent. Uses the `provider:model-name` format (e.g., `anthropic:claude-opus-4-8`, `openai:gpt-5.5`). Omit to inherit the main agent’s model.

## File format

Subagent `AGENTS.md` files use YAML frontmatter followed by a markdown body:

```
---
name: researcher
description: Research topics on the web before writing content
model: anthropic:claude-haiku-4-5-20251001
---

You are a research assistant with access to web search.

## Your Process
1. Search for relevant information
2. Summarize findings clearly
```

## Example: cost-efficient subagents

Use a cheaper, faster model for simple delegation tasks while keeping the main agent on a more capable model:

```
---
name: general-purpose
description: General-purpose agent for research and multi-step tasks
model: anthropic:claude-haiku-4-5-20251001
---

You are a general-purpose assistant. Complete the task efficiently and return a concise summary.
```

This overrides the built-in general-purpose subagent, routing all delegated tasks to a cheaper model. See [Override the general-purpose subagent](https://docs.langchain.com/oss/javascript/deepagents/subagents#override-the-general-purpose-subagent) for more.

---
