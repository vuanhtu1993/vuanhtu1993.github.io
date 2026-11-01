---
title: "Claude Haiku 5.5"
source_url: "https://platform.claude.com/docs/en/models/haiku-5-5/overview"
crawled_at: "2026-11-01T16:23:33.699Z"
---

## Claude Haiku 5.5Latest

For high-volume, latency-sensitive tasks such as classification, extraction, and routing

## Overview

Claude Haiku 5.5 is built for high-volume, latency-sensitive work such as classification, routing, extraction, and subagent tasks. It supports adaptive thinking with the effort parameter, a 1M token context window, and up to 128k output tokens. It uses the same newer tokenizer as Claude 4.7 and later models, so the same text counts as approximately 30 percent more tokens than on Claude Haiku 4.5. Its thinking blocks work only in the account that produced them, or in an account linked to it.

For code changes, see the [migration guide](https://platform.claude.com/docs/en/models/haiku-5-5/migration-guide). For model IDs, pricing, and limits, see the [Claude Haiku 5.5 overview](https://platform.claude.com/docs/en/models/haiku-5-5/overview). For prompting guidance, see [Prompting Claude Haiku 5.5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-haiku-5-5).

[What’s new in Claude Haiku 5.5](https://platform.claude.com/docs/en/models/haiku-5-5/whats-new-haiku-5-5)

## How it compares

| Model | Context | Max output | Price / MTok | Latency | Thinking | Default effort | Knowledge cutoff |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [Claude Fable 5.1](https://platform.claude.com/docs/en/models/fable-5-1/overview) | 1M | 128K | $10 / $50 | Slower | Adaptive (always on) | `high` | Jun 2026 |
| [Claude Opus 5.5](https://platform.claude.com/docs/en/models/opus-5-5/overview) | 1M | 128K | $4 / $20 | Moderate | Adaptive (always on) | `medium` | Jun 2026 |
| [Claude Sonnet 5.5](https://platform.claude.com/docs/en/models/sonnet-5-5/overview) | 1M | 128K | $2 / $10 | Fast | Adaptive | `high` | Jun 2026 |
| Claude Haiku 5.5This model | 1M | 128K | From $0.10 / $0.50 | Fastest | Adaptive | `medium` | Jun 2026 |

## Specifications

### Pricing

Input

$0.10 / MTok for prompts up to 100,000 tokens$0.50 / MTok for prompts over 100,000 tokens

Output

$0.50 / MTok for prompts up to 100,000 tokens$2.50 / MTok for prompts over 100,000 tokens

[5m cache write](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)

$0.125 / MTok for prompts up to 100,000 tokens$0.625 / MTok for prompts over 100,000 tokens

[1h cache write](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)

$0.20 / MTok for prompts up to 100,000 tokens$1 / MTok for prompts over 100,000 tokens

[Cache read](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)

$0.01 / MTok for prompts up to 100,000 tokens$0.05 / MTok for prompts over 100,000 tokens

[Batch API](https://platform.claude.com/docs/en/build-with-claude/batch-processing)

50% discount on input and output

[Full price list](https://platform.claude.com/docs/en/about-claude/pricing)

## Good to know

-   Adaptive thinking is on by default. Control thinking depth with the [effort parameter](https://platform.claude.com/docs/en/build-with-claude/effort).
-   Omit `temperature`, `top_p`, and `top_k`.
-   On the [Message Batches API](https://platform.claude.com/docs/en/build-with-claude/batch-processing#extended-output-beta), Claude Haiku 5.5 supports up to 300k output tokens with the `output-300k-2026-03-24` beta header.
-   The minimum cacheable prompt length is 512 tokens. See [Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching#cache-limitations).
-   Query limits and capabilities programmatically with the [Models API](https://platform.claude.com/docs/en/api/models/list).

## Resources

Behavioral differences and prompting patterns specific to Claude Haiku 5.5.

Choose a model and effort level, shape prompts, and stream output for faster responses.

Claude Haiku 5.5 determines when and how much to think. Steer depth with `effort`.

How the context window is counted and managed.

## Reference

The system prompt Claude Haiku 5.5 uses on claude.ai and the Claude apps.

Safety evaluations and deployment decisions for Claude Haiku 5.5.

Full price list, including batch discounts and prompt caching rates.

How model IDs, aliases, and pinned snapshots work.

Lifecycle status and retirement commitments for every Claude model.
