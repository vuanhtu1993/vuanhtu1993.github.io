---
title: "Fast mode"
source_url: "https://platform.claude.com/docs/en/build-with-claude/fast-mode"
crawled_at: "2026-11-01T16:16:10.023Z"
---

Get up to 2.5x higher output tokens per second from supported Claude models.

Fast mode delivers up to 2.5x higher output tokens per second at premium pricing. Set `speed: "fast"` on your request to opt in. Fast mode is available on Claude Opus 5.5 and in research preview on Claude Opus 5 and Claude Opus 4.8.

## How fast mode works

Fast mode runs the same model with a faster inference configuration. There is no change to intelligence or capabilities.

-   Up to 2.5x higher output tokens per second compared to standard speed
-   Speed benefits are focused on output tokens per second (OTPS), not time to first token (TTFT)
-   Compatible with [streaming](https://platform.claude.com/docs/en/build-with-claude/streaming), where the OTPS gain is most visible

## Basic usage

Fast mode works only on supported models. See [Availability](#feature-availability) for details, including which models need a beta header.

## Rate limits

Fast mode has a dedicated rate limit that is separate from standard Opus rate limits. When your fast mode rate limit is exceeded, the API returns a `429` error with a `retry-after` header indicating when capacity will be available.

Claude Opus 5.5 has a default fast mode rate limit in the Start, Build, and Scale [usage tiers](https://platform.claude.com/docs/en/api/rate-limits), so you don’t need to request access to use fast mode with it. Organizations in the Evaluation tier can use fast mode with Claude Opus 5.5 once they move to the Start, Build, or Scale tier.

The response includes headers that indicate your fast mode rate limit status:

| Header | Description |
| --- | --- |
| `anthropic-fast-input-tokens-limit` | Maximum fast mode input tokens per minute |
| `anthropic-fast-input-tokens-remaining` | Remaining fast mode input tokens |
| `anthropic-fast-input-tokens-reset` | Time when the fast mode input token limit resets |
| `anthropic-fast-output-tokens-limit` | Maximum fast mode output tokens per minute |
| `anthropic-fast-output-tokens-remaining` | Remaining fast mode output tokens |
| `anthropic-fast-output-tokens-reset` | Time when the fast mode output token limit resets |

To see your fast mode rate limits, go to the [Rate limits](https://platform.claude.com/usage/limits) page in the Claude Console.

## Checking which speed was used

The response `usage` object includes a `speed` field that indicates which speed was used, either `"fast"` or `"standard"`. Requesting `speed: "fast"` on a [model that doesn’t support fast mode](#availability-feature-support) returns an error, and so does exceeding fast mode’s rate limits or capacity (a `429` or `529`). When a request with `speed: "fast"` succeeds, `usage.speed` is `"fast"`. Claude Opus 4.6 is an exception: instead of returning an error, a request with `speed: "fast"` and the `fast-mode-2026-02-01` beta header succeeds, but runs at standard speed. This behavior is correctly reflected in `usage.speed`, which shows `"standard"` in this situation. On Claude Models on Google Cloud (Anthropic managed), a Claude Opus 4.6 request with `speed: "fast"` returns a `400` error even with the header.

To track fast mode usage and costs across your organization, see the [Usage and Cost Analytics API](https://platform.claude.com/docs/en/manage-claude/usage-cost-analytics-api).

## Retries and fallbacks

### Automatic retries

The SDK automatically retries fast mode `429` errors up to 2 times by default (configurable with `max_retries`), waiting for the delay in the `retry-after` header before each retry. Because fast mode uses continuous token replenishment, the `retry-after` delay is typically short and requests succeed once capacity is available.

### Falling back to standard speed

If you’d prefer to fall back to standard speed rather than wait for fast mode capacity, catch the rate limit error and retry without `speed: "fast"`. Set `max_retries` to `0` on the initial fast request to skip automatic retries and fail immediately on rate limit errors.

Because setting `max_retries` to `0` also disables retries for other transient errors (overloaded, internal server errors), the following examples reissue the original request with default retries for those cases.

## Considerations

-   **Batch API:** Fast mode is not available with the [Batch API](https://platform.claude.com/docs/en/build-with-claude/batch-processing).
-   **Priority Tier:** Fast mode is not available with a [Priority Tier](https://platform.claude.com/docs/en/api/service-tiers) commitment.

## Pricing

Fast mode is priced at a multiplier on standard rates across the full context window, including requests over 200k input tokens.

| Model | Input | Output |
| --- | --- | --- |
| Claude Opus 5.5 | $8 USD / MTok | $40 USD / MTok |
| Claude Opus 5 / Claude Opus 4.8 | $10 USD / MTok | $50 USD / MTok |

Fast mode pricing stacks with other pricing modifiers:

-   [Prompt caching multipliers](https://platform.claude.com/docs/en/about-claude/pricing#prompt-caching) apply on top of fast mode pricing.
-   [Data residency](https://platform.claude.com/docs/en/manage-claude/data-residency) multipliers apply on top of fast mode pricing.

For complete pricing details, see the [Pricing](https://platform.claude.com/docs/en/about-claude/pricing#fast-mode-pricing) page.

## Availability

Fast mode is available or in research preview on select models and eligible for zero data retention and HIPAA readiness.

### API support

Fast mode is available only on the following models. If you were using fast mode on an earlier model, [migrate to a model that supports fast mode](https://platform.claude.com/docs/en/models/opus-5-5/migration-guide).

To access fast mode on Claude Opus 5, contact your account manager or [join the waitlist](https://claude.com/fast-mode).

Beta headers allow you to access experimental features and new model capabilities before they become part of the standard API.

## Next steps

Get validated JSON results from agent workflows.

Learn about Anthropic’s pricing structure for models and features.

Control how many tokens Claude uses when responding with the effort parameter, trading off between response thoroughness and token efficiency.

Stream Messages API responses incrementally with server-sent events, including text, tool use, and extended thinking deltas.
