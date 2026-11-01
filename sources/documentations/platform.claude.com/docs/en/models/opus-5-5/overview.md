---
title: "Claude Opus 5.5"
source_url: "https://platform.claude.com/docs/en/models/opus-5-5/overview"
crawled_at: "2026-11-01T16:23:23.481Z"
---

## Claude Opus 5.5Latest

For long-running agentic coding and knowledge work

## Overview

## How it compares

| Model | Context | Max output | Price / MTok | Latency | Thinking | Default effort | Knowledge cutoff |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [Claude Fable 5.1](https://platform.claude.com/docs/en/models/fable-5-1/overview) | 1M | 128K | $10 / $50 | Slower | Adaptive (always on) | `high` | Jun 2026 |
| Claude Opus 5.5This model | 1M | 128K | $4 / $20 | Moderate | Adaptive (always on) | `medium` | Jun 2026 |
| [Claude Sonnet 5.5](https://platform.claude.com/docs/en/models/sonnet-5-5/overview) | 1M | 128K | $2 / $10 | Fast | Adaptive | `high` | Jun 2026 |
| [Claude Haiku 5.5](https://platform.claude.com/docs/en/models/haiku-5-5/overview) | 1M | 128K | From $0.10 / $0.50 | Fastest | Adaptive | `medium` | Jun 2026 |

## Specifications

## Good to know

-   Adaptive thinking is always on and can’t be turned off. Control thinking depth with the [effort parameter](https://platform.claude.com/docs/en/build-with-claude/effort).
-   On the [Message Batches API](https://platform.claude.com/docs/en/build-with-claude/batch-processing#extended-output-beta), Claude Opus 5.5 supports up to 300k output tokens with the `output-300k-2026-03-24` beta header.
-   The minimum cacheable prompt length is 512 tokens. See [Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching#cache-limitations).
-   Query limits and capabilities programmatically with the [Models API](https://platform.claude.com/docs/en/api/models/list).

## Resources

Behavioral differences and prompting patterns specific to Claude Opus 5.5.

The control for thinking depth, latency, and cost. Choose a level for each workload.

How adaptive thinking works and how thinking blocks are preserved.

Lower-latency Claude Opus 5.5 on the Claude API, priced separately.

## Reference

The system prompt Claude Opus 5.5 uses on claude.ai and the Claude apps.

Safety evaluations and deployment decisions for Claude Opus 5.5.

Full price list, including batch discounts and prompt caching rates.

How model IDs, aliases, and pinned snapshots work.

Lifecycle status and retirement commitments for every Claude model.
