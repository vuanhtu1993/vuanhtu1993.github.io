---
title: "Claude Fable 5.1"
source_url: "https://platform.claude.com/docs/en/models/fable-5-1/overview"
crawled_at: "2026-11-01T16:23:18.170Z"
---

## Claude Fable 5.1Latest

For demanding reasoning and long-horizon agentic work

## Overview

Claude Fable 5.1 extends Claude Fable 5 at the same input and output prices, with cache reads at a quarter of the cost, and brings stronger long-running agentic coding, multistep research, and document, spreadsheet, and slide work. For most workloads, start with Claude Opus 5.5 (see [Choosing a model](https://platform.claude.com/docs/en/about-claude/models/choosing-a-model)). Use Claude Fable 5.1 for demanding reasoning and long-horizon agentic work, or when your evals on Claude Opus 5.5 at higher effort still don’t meet your requirements. Claude Mythos 5.1 offers the same capabilities only to organizations verified through Anthropic’s verification programs, such as the [Cyber Verification Program](https://support.claude.com/en/articles/14604842).

If you already call Claude Fable 5, four changes are breaking:

-   [Forced tool use returns an error](https://platform.claude.com/docs/en/models/fable-5-1/whats-new-fable-5-1#forced-tool-use-is-not-supported).
-   Only Claude Fable 5.1 and Claude Mythos 5.1 can [read Claude Fable 5.1’s thinking blocks](https://platform.claude.com/docs/en/models/fable-5-1/whats-new-fable-5-1#thinking-blocks-are-tied-to-the-model-that-produced-them).
-   [Editing earlier turns invalidates thinking blocks](https://platform.claude.com/docs/en/models/fable-5-1/whats-new-fable-5-1#editing-earlier-turns-invalidates-thinking-blocks).
-   [Some advisor tool pairings are not supported](https://platform.claude.com/docs/en/models/fable-5-1/whats-new-fable-5-1#advisor-tool-pairings).

Five changes are additive:

-   [Mid-conversation effort changes](https://platform.claude.com/docs/en/models/fable-5-1/whats-new-fable-5-1#change-effort-mid-conversation-beta) (beta)
-   [Turn-scoped system messages](https://platform.claude.com/docs/en/models/fable-5-1/whats-new-fable-5-1#turn-scoped-system-messages-beta) (beta)
-   [Readable progress updates between tool calls](https://platform.claude.com/docs/en/models/fable-5-1/whats-new-fable-5-1#progress-updates-between-tool-calls-beta) (`display: "updates"`, beta)
-   A [lower cache read price](https://platform.claude.com/docs/en/models/fable-5-1/whats-new-fable-5-1#pricing)
-   [Content provenance](https://platform.claude.com/docs/en/models/fable-5-1/whats-new-fable-5-1#content-provenance)

[What’s new in Claude Fable 5.1](https://platform.claude.com/docs/en/models/fable-5-1/whats-new-fable-5-1)

## Claude Fable 5.1 and Claude Mythos 5.1

[Claude Mythos 5.1](https://platform.claude.com/docs/en/models/mythos-5-1/overview) offers the same capabilities only to organizations verified through Anthropic’s verification programs, such as the [Cyber Verification Program](https://support.claude.com/en/articles/14604842). It shares Claude Fable 5.1’s specifications and pricing. To request access, apply to the program that covers your use case, or contact your Anthropic, AWS, or Google Cloud account team.

## How it compares

| Model | Context | Max output | Price / MTok | Latency | Thinking | Default effort | Knowledge cutoff |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Claude Fable 5.1This model | 1M | 128K | $10 / $50 | Slower | Adaptive (always on) | `high` | Jun 2026 |
| [Claude Opus 5.5](https://platform.claude.com/docs/en/models/opus-5-5/overview) | 1M | 128K | $4 / $20 | Moderate | Adaptive (always on) | `medium` | Jun 2026 |
| [Claude Sonnet 5.5](https://platform.claude.com/docs/en/models/sonnet-5-5/overview) | 1M | 128K | $2 / $10 | Fast | Adaptive | `high` | Jun 2026 |
| [Claude Haiku 5.5](https://platform.claude.com/docs/en/models/haiku-5-5/overview) | 1M | 128K | From $0.10 / $0.50 | Fastest | Adaptive | `medium` | Jun 2026 |

## Specifications

### Capabilities

[Context window](https://platform.claude.com/docs/en/build-with-claude/context-windows)

1M tokens

Max output

128K tokens

[Thinking](https://platform.claude.com/docs/en/build-with-claude/thinking)

Adaptive (always on)

[Default effort](https://platform.claude.com/docs/en/build-with-claude/effort)

`high`

Comparative latency

Slower

Input → output

Text and images → text

Reliable knowledge cutoff

Jun 2026

Training data cutoff

Jun 2026

## Resources

Model-specific prompting guidance for long-horizon and agentic work.

What changes when you move from Claude Fable 5, Claude Opus 5, or Claude Opus 4.8.

When this model’s thinking blocks stay usable: across model switches and across changes to the conversation.

Change the effort level partway through a conversation without invalidating the prompt cache.

Handle classifier refusals and retry on another Claude model.

The only thinking mode on Claude Fable 5.1. Steer depth with `effort`.

## Reference

The system prompt Claude Fable 5.1 uses on claude.ai and the Claude apps.

Safety evaluations and deployment decisions for Claude Fable 5.1 and Claude Mythos 5.1.

Full price list, including batch discounts and prompt caching rates.

How model IDs, aliases, and pinned snapshots work.

Lifecycle status and retirement commitments for every Claude model.
