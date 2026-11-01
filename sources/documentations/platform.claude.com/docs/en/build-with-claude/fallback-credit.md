---
title: "Fallback credit"
source_url: "https://platform.claude.com/docs/en/build-with-claude/fallback-credit"
crawled_at: "2026-11-01T16:15:54.387Z"
---

Avoid paying the prompt-cache cost twice when you retry a refused request on another model.

Prompt caches are per-model. When a model declines a request and you retry on another model, the conversation prefix already cached for the first model must be written into the new model’s cache in full. Cache writes cost more than cache reads. Fallback credit removes that extra cost. The refusal carries a credit token, you echo the token on the retry, and the retry is billed as though the conversation had been on the new model from the start.

You need this page only when you build the retry yourself: over raw HTTP or with custom retry logic. [Server-side fallback](https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback#server-side-fallback) and [client-side fallback with the SDK middleware](https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback#client-side-fallback) apply fallback credit automatically. If you use either, skip this page.

[Refusals and fallback](https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback) covers detecting refusals and choosing a fallback approach. [Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) explains cache reads and cache writes if those terms are new.

## The basic flow

1.  ### Opt in with the beta header
    
    Send the request that may be refused with the `anthropic-beta: fallback-credit-2026-07-01` header. The `server-side-fallback-2026-07-01` header also grants the same fields, except on Amazon Bedrock and Claude Models on Google Cloud (Google managed), which return a 400 error for that header. The earlier `fallback-credit-2026-06-01` header remains accepted and grants the same fields.
    
2.  ### Read two fields from the refusal
    
    On a refusal, `stop_details` includes two fields:
    
    -   **`fallback_credit_token`:** an opaque string that represents the credit
    -   **`fallback_has_prefill_claim`:** a boolean that tells you which retry body shape to use
    
    Both are `null` when no credit is available for the refusal.
    
3.  ### Build the retry
    
    Start from the refused request body. Set `model` to the fallback model and add the token as the top-level `fallback_credit_token` parameter. Pick the body shape from the following table.
    
4.  ### Send the retry with the same header
    
    Send the retry with the same `fallback-credit-2026-07-01` beta header. The retry needs the header to redeem the token.
    

The `fallback_has_prefill_claim` field tells you whether the retry can continue the refused model’s partial output instead of starting over:

| `fallback_has_prefill_claim` | Retry body |
| --- | --- |
| `true` | The refused request body, unchanged, plus one appended assistant message whose `content` echoes the refused response’s `content`. The retry model continues the response from where the refused model stopped, and completed server tool calls are not run again. |
| `false` | The refused request body, unchanged. |

## Example

The following example makes a request that might be refused and redeems the credit token on a retry against Claude Opus 4.8. When a retry attempt is rejected, the example degrades through the rejection ladder: the sequence of progressively simpler retry shapes covered in [When a retry is rejected](#when-a-retry-is-rejected).

## Where it works

Fallback credit is in beta on the Claude API, Amazon Bedrock, Claude Platform on AWS, Claude Models on Google Cloud (Google managed), and Microsoft Foundry. Refusals in [Message Batches](https://platform.claude.com/docs/en/build-with-claude/batch-processing) don’t mint credit tokens, and redemption applies only to direct Messages API requests: a token passed on a batch request is accepted but ignored. A Claude Haiku 5.5 refusal carries no fallback credit, so a retry after one pays the full cost of writing the fallback model’s prompt cache.

The retry model must be one of the refused model’s permitted fallback targets. For Claude Fable 5.1, Claude Fable 5, and Claude Opus 5.5, those are Claude Opus 4.8 (`claude-opus-4-8`) and Claude Opus 5 (`claude-opus-5`). For Claude Opus 5, it is Claude Opus 4.8. For Claude Sonnet 5.5, it is Claude Sonnet 5 (`claude-sonnet-5`).

## Checking that the credit applied

The refund is visible in the retry’s `usage`. Compared with what the same request would report without the token, `cache_creation_input_tokens` is lower, and `cache_read_input_tokens` is higher by the same amount. A shift of zero means the token was honored but there was nothing to reprice, for example because the retry model’s cache was already warm.

## When a retry is rejected

Most retries redeem on the first attempt. When one does not, the API returns a 400 error that tells you what to try next.

1.  ### Continuation rejected: resend the unchanged body
    
    If the retry that appends the assistant message is rejected with a 400 error, resend the refused request body unchanged, still with the token.
    
2.  ### Token rejected: drop the token
    
    If the unchanged body is also rejected with a 400 error whose message names `fallback_credit_token`, retry without the token. The credit is forfeited, but the retry itself goes through.
    

## Reference

The following sections cover edge cases and the complete redemption rules. Most integrations do not need them.

## Next steps

Detect refusals and choose between server-side fallback, the SDK middleware, and a manual retry.

How cache reads and cache writes are billed.

Every `stop_reason` value and how to handle it.

The SDK helper that applies fallback credit automatically.

## Availability

Fallback credit is in beta on select models.

### API support

Beta headers allow you to access experimental features and new model capabilities before they become part of the standard API.
