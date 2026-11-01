---
title: "Handle streaming refusals"
source_url: "https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/handle-streaming-refusals"
crawled_at: "2026-11-01T16:16:44.297Z"
---

Detect and handle refusal stop reasons in streaming responses, and retry refused requests on a fallback model.

Starting with Claude 4 models, streaming responses from Claude’s API return **`stop_reason`: `"refusal"`** when streaming classifiers intervene to handle potential policy violations. This safety feature helps maintain content compliance during real-time streaming.

## API response format

When streaming classifiers detect content that violates Anthropic’s policies, the API returns this response:

In the event stream, `stop_details` arrives on the `message_delta` event alongside `stop_reason`.

## Reset context after refusal

When you receive **`stop_reason`: `refusal`**, you must reset the conversation context before continuing. You can remove or rephrase the turn that triggered the refusal, or clear the conversation history entirely. Attempting to continue without resetting will result in continued refusals.

## Implementation guide

Here’s how to detect and handle streaming refusals in your application:

## Current refusal types

The API currently handles refusals in three different ways:

| Refusal type | Response format | When it occurs |
| --- | --- | --- |
| Streaming classifier refusals | **`stop_reason`: `refusal`** | During streaming when content violates policies |
| API input and copyright validation | 400 error codes | When input fails validation checks |
| Model-generated refusals | Standard text responses | When the model itself refuses |

## Best practices

-   **Monitor for refusals:** Include **`stop_reason`: `refusal`** checks in your error handling.
-   **Reset automatically:** Implement automatic context reset when refusals are detected.
-   **Fall back to another model:** Configure [server-side fallback or the SDK middleware](https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback) so refused requests are retried on another Claude model instead of surfacing a refusal to the user. Claude Haiku 5.5 has no server-side fallback, so set up its retry in your client.
-   **Redeem fallback credit on manual retries:** If you build the retry yourself, pass the refusal’s [fallback credit](https://platform.claude.com/docs/en/build-with-claude/fallback-credit) token so the retry doesn’t pay the prompt-cache cost twice. Claude Haiku 5.5 refusals carry no fallback credit.
-   **Provide custom messaging:** Create user-friendly messages for better UX when refusals occur.
-   **Track refusal patterns:** Monitor refusal frequency to identify potential issues with your prompts.

## Migration notes

If you built refusal handling when this feature first shipped, or you’re adding it to an existing integration, check the following:

-   **Refusals are responses, not errors.** A refusal arrives as a successful HTTP 200 response with `stop_reason`: `"refusal"`, so monitoring built only on error rates won’t surface it. Track refusals as their own signal.
-   **Refusals include structured detail.** On every model, a refusal also includes a `stop_details` object that identifies the policy category behind the decline. See [What a refusal looks like](https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback#refusal-response) for the full response shape.
-   **Retry on a different model.** Re-sending a refused request to the same model usually results in another refusal. Instead of only resetting context, retry on a fallback model with [server-side fallback, the SDK middleware, or a manual retry](https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback), and redeem [fallback credit](https://platform.claude.com/docs/en/build-with-claude/fallback-credit) when you build the retry yourself. Claude Haiku 5.5 has no server-side fallback, and its refusals carry no fallback credit, so set up its retry in your client.
-   **Check batch results for refusals.** A refused request in a [Message Batch](https://platform.claude.com/docs/en/build-with-claude/batch-processing) is returned as a succeeded result with `stop_reason`: `"refusal"`, not as an errored result.
-   **Centralize handling on `stop_reason`.** The API continues to consolidate refusal handling around `stop_reason`: `"refusal"`, so branch on the stop reason rather than on model-specific behavior.

## Next steps

Retry refused requests on another Claude model, server-side or in your client.

Every `stop_reason` value and how to handle it.

Stream responses and read `stop_reason` from `message_delta` events as they arrive.

Serve users across languages with Claude’s cross-lingual capabilities.

## Availability

Streaming refusals are available or in beta, depending on the API.

### API support
