---
title: "Documentation"
source_url: "https://platform.claude.com/docs/en/home"
crawled_at: "2026-11-01T16:14:26.236Z"
---

Claude Platform

## Start building with Claude

Everything you need to integrate Claude into your applications. From first API call to production.

Python

```
import anthropic

client = anthropic.Anthropic()

message = client.messages.create(
    model="claude-opus-5-5",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": "Hello, Claude",
        }
    ],
)
for block in message.content:
    if block.type == "text":
        print(block.text)
```

Platform

## Choose how you build

Pick the developer surface that matches your approach, and the infrastructure that fits your stack.

### Messages

Direct model access. You construct every turn, manage conversation state, and write your own tool loop.

### Managed Agents

Fully managed agent infrastructure. Deploy and manage autonomous agents in stateful sessions with persistent event history.

Claude is also available on these cloud platforms:

Developer journey

## From idea to production

Follow the lifecycle or jump to what you need.

Models

## The Claude model family

Choose the right model for your use case.

![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793549663/aha-mind/docs-crawler/platform.claude.com/head_n67hk7.svg)

Most capableResearchMulti-day tasks

For demanding reasoning and long-horizon agentic work

![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793549663/aha-mind/docs-crawler/platform.claude.com/cursor_a0cay5.svg)

Complex projectsAgentsCoding

For long-running agentic coding and knowledge work

![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793549663/aha-mind/docs-crawler/platform.claude.com/bubble_eux5q6.svg)

Everyday tasksWritingCost-efficient

The best combination of speed and intelligence

![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793549663/aha-mind/docs-crawler/platform.claude.com/bird_mn1afe.svg)

FastestLowest costHigh volume

For high-volume, latency-sensitive tasks such as classification, extraction, and routing

Resources

## Keep learning

Interactive courses to master Claude.

Code samples and patterns.

Deployable starter apps.

Latest features and updates.

An agentic coding assistant in your terminal.
