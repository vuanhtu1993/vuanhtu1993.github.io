---
title: "OpenTelemetry tracing for the Claude API"
source_url: "https://platform.claude.com/docs/en/manage-claude/opentelemetry"
crawled_at: "2026-11-01T16:21:30.104Z"
---

Trace your Messages API requests, tool uses, and Managed Agents sessions with OpenTelemetry spans from the Claude SDK and the Claude API.

The Claude API and the SDK can trace your Messages API requests, tool uses, and Managed Agents sessions with [OpenTelemetry](https://opentelemetry.io/) (OTel). You can view these traces in the observability platform you already have. Use them to debug failed or slow requests, track token spend and latency, and build evals from real traffic. You can also see each request inside your application’s own traces, linked to the user or feature that sent it.

OpenTelemetry is a vendor-neutral standard that most observability platforms support. A _trace_ is the full record of one request through your system. A _span_ is one step in a trace, such as a model request or a tool use. The API and the SDK use attributes from the [GenAI semantic conventions](https://github.com/open-telemetry/semantic-conventions-genai), so platforms that support the conventions can recognize the spans without extra setup.

## Get started

You can set up SDK tracing, API tracing, or both. Set up both to see a request’s SDK and API spans in one trace, as in the [example traces](#example-traces-and-how-to-read-them).

Claude Code

Let Claude Code set up this feature for you

`Set up OpenTelemetry tracing with the Claude API and Claude SDK`

Install the SDK and register a tracer provider.

Add a destination in the Claude Console.

Look up spans and their attributes.

| What you get | SDK tracing | API tracing | Both together |
| --- | --- | --- | --- |
| [Messages API](https://platform.claude.com/docs/en/api/messages/create) requests |  |  |  |
| [Sessions API](https://platform.claude.com/docs/en/managed-agents/sessions) requests |  |  |  |
| Token usage (see [Counting tokens](#count-tokens)) |  |  |  |
| Each model run within a request |  |  |  |
| [Managed Agents](https://platform.claude.com/docs/en/managed-agents/overview) turns |  |  |  |
| [Server tools](https://platform.claude.com/docs/en/agents-and-tools/tool-use/server-tools), run by the API |  |  |  |
| Client tools, run by the [tool runner](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-runner) |  |  |  |
| Tools in a [self-hosted sandbox](https://platform.claude.com/docs/en/manage-claude/opentelemetry/sdk#trace-a-self-hosted-sandbox) |  |  |  |
| Other API requests, such as uploading files |  |  |  |
| Setup | [Code](https://platform.claude.com/docs/en/manage-claude/opentelemetry/sdk) | [Console](https://platform.claude.com/docs/en/manage-claude/opentelemetry/api) | Both |
| Required permission | None | [Admin](https://platform.claude.com/docs/en/manage-claude/opentelemetry/api#what-you-need) | [Admin](https://platform.claude.com/docs/en/manage-claude/opentelemetry/api#what-you-need) |
| Coverage | Clients using the SDK | Any client | Any client |
| Cloud platform support | Any | Claude Platform  
Claude Platform on AWS | Claude Platform  
Claude Platform on AWS |

For Claude Code, the Agent SDK, or Cowork, see [Claude Code monitoring](https://code.claude.com/docs/en/monitoring-usage), [Agent SDK observability](https://code.claude.com/docs/en/agent-sdk/observability), or [Cowork activity monitoring](https://support.claude.com/en/articles/14477985-monitor-claude-cowork-activity-with-opentelemetry).

## Send traces to a partner platform

Send traces to any observability platform that accepts OTLP, including these partners:

![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793550087/aha-mind/docs-crawler/platform.claude.com/arize_ex6rae.svg)![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793550087/aha-mind/docs-crawler/platform.claude.com/arize-dark_ydxw1n.svg)

Unified observability and evaluation platform for AI.

![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793550087/aha-mind/docs-crawler/platform.claude.com/braintrust_fmkqff.svg)![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793550087/aha-mind/docs-crawler/platform.claude.com/braintrust-dark_dup4he.svg)

Active observability platform for agents.

![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793550087/aha-mind/docs-crawler/platform.claude.com/databricks_hg3zap.svg)![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793550088/aha-mind/docs-crawler/platform.claude.com/databricks-dark_i7m998.svg)

Unified AI control plane for observability and evaluation.

![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793550087/aha-mind/docs-crawler/platform.claude.com/datadog_iqv2rv.svg)![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793550088/aha-mind/docs-crawler/platform.claude.com/datadog-dark_c1jnik.svg)

AI-powered observability and security.

![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793550087/aha-mind/docs-crawler/platform.claude.com/dynatrace_erju98.svg)![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793550088/aha-mind/docs-crawler/platform.claude.com/dynatrace-dark_g5krgf.svg)

Observability built for the age of AI.

![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793550087/aha-mind/docs-crawler/platform.claude.com/elastic_psb2tu.svg)![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793550087/aha-mind/docs-crawler/platform.claude.com/elastic-dark_gxxi2m.svg)

Observability built on open source.

![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793550087/aha-mind/docs-crawler/platform.claude.com/grafana_cdgyty.svg)![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793550088/aha-mind/docs-crawler/platform.claude.com/grafana-dark_ehbla4.svg)

Fully managed open observability platform.

![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793550088/aha-mind/docs-crawler/platform.claude.com/honeycomb_dn6cpu.svg)![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793550087/aha-mind/docs-crawler/platform.claude.com/honeycomb-dark_pofp5n.svg)

Observability platform for the new shape of software.

![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793550087/aha-mind/docs-crawler/platform.claude.com/langfuse_qic97h.svg)![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793550087/aha-mind/docs-crawler/platform.claude.com/langfuse-dark_qhmstf.svg)

Open-source agent observability and evaluation platform.

![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793550088/aha-mind/docs-crawler/platform.claude.com/langchain_f1fby8.svg)![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793550087/aha-mind/docs-crawler/platform.claude.com/langchain-dark_bfvupq.svg)

LangSmith agent engineering platform.

![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793550087/aha-mind/docs-crawler/platform.claude.com/new-relic_jxendu.svg)

Intelligent observability platform.

![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793550087/aha-mind/docs-crawler/platform.claude.com/posthog_t9a6vj.svg)![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793550087/aha-mind/docs-crawler/platform.claude.com/posthog-dark_jshl6t.svg)

All-in-one platform for building successful products.

![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793550087/aha-mind/docs-crawler/platform.claude.com/pydantic_mg20gj.svg)![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793550087/aha-mind/docs-crawler/platform.claude.com/pydantic-dark_e0f7uk.svg)

Production-grade AI & general observability.

![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793550087/aha-mind/docs-crawler/platform.claude.com/sentry_b9viab.svg)![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793550087/aha-mind/docs-crawler/platform.claude.com/sentry-dark_bxidfs.svg)

Debug your broken code and misbehaving agents.

![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793550088/aha-mind/docs-crawler/platform.claude.com/snowflake_vw2sku.svg)

Agentic control plane with built-in observability and governance.

![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793550087/aha-mind/docs-crawler/platform.claude.com/splunk_kms6cq.svg)![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793550087/aha-mind/docs-crawler/platform.claude.com/splunk-dark_odphwt.svg)

Observe, evaluate, and secure agents.

## Content modes

Each destination and each SDK client has a content mode, which sets whether spans include model prompts and responses. Set it when you [add a destination](https://platform.claude.com/docs/en/manage-claude/opentelemetry/api#add-a-destination) or [configure the SDK](https://platform.claude.com/docs/en/manage-claude/opentelemetry/sdk#configure-the-sdk).

-   **Metadata only** (`metadata_only` in the SDK): The default. Spans include identifiers, timing, status, token counts, and text that you choose, such as the names and descriptions of your agents and tools and the names of your MCP servers.
-   **Full content** (`content` in the SDK): Most visibility. Spans include model prompts and responses, and everything in Metadata only.

With Full content, you can also see why a run failed or was slow, read full conversations, and build evals from real traces. In the [OpenTelemetry span reference](https://platform.claude.com/docs/en/api/opentelemetry/spans), attributes that hold prompts and responses are tagged Content.

If your organization has a HIPAA, FERPA, or K-12 data-handling restriction with Anthropic, destinations export only metadata regardless of their content mode. SDK spans aren’t affected.

With [zero data retention](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention), you can still use Full content. For Messages API requests, the API holds the exported content only in memory until it delivers it to the destination. [Claude Managed Agents](https://platform.claude.com/docs/en/managed-agents/overview) isn’t eligible for zero data retention, and its data retention stays the same when you use OpenTelemetry.

### Content limits

With Full content, each span holds up to 0.75 MB of content by default. That fits a 200k-token context window of English text and stays below the 1 MB request limit of many observability platforms and proxies. If you select a partner platform as the **Provider**, the Console sets a limit that the platform accepts.

When content is over the limit, the SDK or the API shortens it and sets `anthropic.content.truncated` to `true`. Request spans drop the system prompt and the earliest messages first, and tool spans drop blocks from the end of the result. Images and documents appear only as their type.

Change the limit in these cases:

-   **Your observability platform accepts larger payloads:** Raise or remove the limit to keep long prompts and responses whole. A full 1M-token context window needs about 4 MB.
-   **Your observability platform or a proxy in front of it rejects large requests:** Lower the limit.

In the SDK, set `traces.max_content_bytes`. In the Console, set **Content mode** to **Full content** when you [add a destination](https://platform.claude.com/docs/en/manage-claude/opentelemetry/api#add-a-destination), then set **Maximum content size in MB** under **Advanced settings**.

## Example traces and how to read them

### A Messages API request

Under the API span for a request that [creates a message](https://platform.claude.com/docs/en/api/messages/create), the API adds a span for each model request and a tool span for each use of a server tool or an MCP connector tool that the API runs.

In this example, your application calls the [tool runner](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-runner), the SDK helper that runs your tools and sends their results back to Claude. Each request that the tool runner sends has a client span from the SDK and a server span from the API. The spans appear in the following order:

1.  Your application starts the `answer_question` span and calls the Messages tool runner inside it (shown as the [`anthropic.messages.tool_runner`](https://platform.claude.com/docs/en/api/opentelemetry/spans#anthropic-messages-tool-runner) span).
2.  The tool runner sends the first request (shown as the first [`anthropic.messages.create`](https://platform.claude.com/docs/en/api/opentelemetry/spans#anthropic-messages-create) client span and the spans under it). In this request, the API runs the web search tool between two model requests.
3.  In the second model request, the model asks to use the custom `get_weather` tool, so the first request ends.
4.  The tool runner runs `get_weather` (shown as the `anthropic.custom_tool_use get_weather` span).
5.  The tool runner sends the second request with the tool result (shown as the second `anthropic.messages.create` client span and the spans under it).
6.  In the second request, the model gives the final answer.

The SDK in your application emits the [`anthropic.messages.tool_runner`](https://platform.claude.com/docs/en/api/opentelemetry/spans#anthropic-messages-tool-runner) span, the [`anthropic.custom_tool_use`](https://platform.claude.com/docs/en/api/opentelemetry/spans#anthropic-tool-use-anthropic-mcp-tool-use-and-anthropic-custom-tool-use) span, and each request’s client span. To get these spans, [set up SDK tracing](https://platform.claude.com/docs/en/manage-claude/opentelemetry/sdk).

Each request has its token usage on several of its spans. To count each token once, see [Counting tokens](#count-tokens).

With [Full content](#choose-a-content-mode), the `anthropic.messages.create` server span has the prompt and the response. The system prompt is in `gen_ai.system_instructions`, the request’s messages in `gen_ai.input.messages`, and the response in `gen_ai.output.messages`.

For each span and its attributes, see the [OpenTelemetry span reference](https://platform.claude.com/docs/en/api/opentelemetry/spans).

### A Managed Agents session

A session has a span for each Sessions API request and a turn span for each agent turn. A turn that a request starts is a child of that request’s span. A turn contains a span for each model request and each tool that the API runs, except in the [cases listed in the tool span reference](https://platform.claude.com/docs/en/api/opentelemetry/spans#anthropic-tool-use-anthropic-mcp-tool-use-and-anthropic-custom-tool-use). It also contains a span for each outcome evaluation.

This example follows one chat request, in which your application sends a message to a session and runs a custom tool. The trace has spans from both your application and the API, in the following order:

1.  Your application receives a `POST /chat` request from a user.
2.  Your application starts the SDK’s session tool runner, which lists and streams the session’s events (shown as the `anthropic.sessions.events.stream` and `anthropic.sessions.events.list` spans).
3.  Your application sends the user’s message to the session by calling `sessions.events.send`.
4.  A turn starts and includes model requests, a `bash` tool use, and a turn on another thread (shown as the first `anthropic.session.turn` span and the spans under it).
5.  The model asks to use the [custom tool](https://platform.claude.com/docs/en/managed-agents/tools) `list_issues`, so the turn ends with the stop reason `requires_action`.
6.  The session tool runner runs `list_issues` (shown as the `anthropic.custom_tool_use list_issues` span) and sends its result by calling `sessions.events.send`.
7.  A second turn starts with the tool result (shown as the last `anthropic.session.turn` span).

The SDK in your application emits the [`anthropic.custom_tool_use`](https://platform.claude.com/docs/en/api/opentelemetry/spans#anthropic-tool-use-anthropic-mcp-tool-use-and-anthropic-custom-tool-use) span and each request’s client span. To get these spans, [set up SDK tracing](https://platform.claude.com/docs/en/manage-claude/opentelemetry/sdk).

A session’s spans can be in several traces, for example when you send a later request from a new root trace. With [multiagent](https://platform.claude.com/docs/en/managed-agents/multiagent-orchestration) on, a session can also have several threads. To find the spans you need, group them by an ID.

-   **One thread:** Group spans by `gen_ai.conversation.id`, which holds the session thread ID. Sort them by start time to read the thread as a transcript.
-   **A whole session, with all its threads:** Group spans by `anthropic.session.id`, across traces.

With [Full content](#choose-a-content-mode), you can read a session’s content from its spans.

-   To read a turn’s content, use its [turn span](https://platform.claude.com/docs/en/api/opentelemetry/spans#anthropic-session-turn). The system prompt is in `gen_ai.system_instructions` on a thread’s first turn span, the input in `gen_ai.input.messages` (your messages and tool results, `system.message` events, and messages from other threads), and the output in `gen_ai.output.messages` (the agent’s messages, tool uses, and tool results).
-   To see the arguments and result of a tool use, read its [tool span](https://platform.claude.com/docs/en/api/opentelemetry/spans#anthropic-tool-use-anthropic-mcp-tool-use-and-anthropic-custom-tool-use). The arguments are in `gen_ai.tool.call.arguments`, and the result is in `anthropic.tool_result.content`.

For each span and its attributes, see the [OpenTelemetry span reference](https://platform.claude.com/docs/en/api/opentelemetry/spans).

## Counting tokens

To count each token once, sum the spans of only one source for each request. When a Messages API request has both an SDK span and an API span, sum its API spans. Both are named `anthropic.messages.create`, so tell them apart by kind: the SDK span is `CLIENT` and its child, the API span, is `SERVER`.

For each source, sum only the following spans, because some usage attributes repeat on more than one level of the API spans:

-   **SDK spans:** Sum the [`anthropic.messages.create`](https://platform.claude.com/docs/en/api/opentelemetry/spans#anthropic-messages-create) spans. If a request has [compactions](https://platform.claude.com/docs/en/build-with-claude/compaction), also add the span’s `anthropic.usage.compaction.input_tokens` and `anthropic.usage.compaction.output_tokens`, because the `gen_ai.usage.*` attributes don’t include compaction tokens. If a [fallback model](https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback) served a request, its span has the usage of only the model that served the response.
-   **API spans for a Messages API request:** Sum either the [`anthropic.messages.create`](https://platform.claude.com/docs/en/api/opentelemetry/spans#anthropic-messages-create) spans or their [`anthropic.model_request`](https://platform.claude.com/docs/en/api/opentelemetry/spans#anthropic-model-request) spans, not both. If a request has compactions, also add its [`anthropic.compaction`](https://platform.claude.com/docs/en/api/opentelemetry/spans#anthropic-compaction) spans. Don’t add the `anthropic.usage.compaction.*` attributes of the `anthropic.messages.create` span as well, because they hold the same tokens.
-   **API spans for a Managed Agents session:** Sum the `anthropic.model_request` and [`anthropic.session.outcome_evaluation`](https://platform.claude.com/docs/en/api/opentelemetry/spans#anthropic-session-outcome-evaluation) spans.

Spans can arrive more than once, for example when a delivery is retried. If your observability platform doesn’t remove duplicates, count each span once by its trace ID and span ID.

`gen_ai.usage.input_tokens` already includes the tokens read from and written to the prompt cache, so don’t add the cache attributes to it. For all usage attributes, see [Token usage](https://platform.claude.com/docs/en/api/opentelemetry/spans#token-usage).

## Availability

OpenTelemetry is in beta on every model.

### API support
