---
title: "Set up OpenTelemetry with the Claude SDK"
source_url: "https://platform.claude.com/docs/en/manage-claude/opentelemetry/sdk"
crawled_at: "2026-11-01T16:21:36.081Z"
---

Trace the Claude SDK’s requests and tool uses in Python, TypeScript, C#, Go, Java, PHP, or Ruby, and send the spans to your observability platform.

With OpenTelemetry, the Claude SDK can emit a span for each request that it sends and each tool use that the [tool runner](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-runner) runs. You can view these spans in your observability platform, nested in your own traces.

The SDK emits spans in your application. Your application’s OpenTelemetry exporter sends them to your observability platform.

## 1\. Install the SDK

Install or upgrade to the latest version of the Claude SDK:

## 2\. Register a tracer provider

A _tracer provider_ is the OpenTelemetry object that creates spans and passes them to your exporter. The SDK uses the tracer provider that your application registers, so your SDK calls stay the same. Register it before the first call that you want to trace.

The following example registers a tracer provider that prints each span to the console and then makes one call. Use it to see spans before you connect an observability platform:

The console shows one [`anthropic.messages.create`](https://platform.claude.com/docs/en/api/opentelemetry/spans#anthropic-messages-create) span.

## 3\. Send spans to your observability platform

Replace the console exporter with an OTLP exporter that points to your observability platform. For the setup in your language, see the OpenTelemetry docs on [Python exporters](https://opentelemetry.io/docs/languages/python/exporters/), [TypeScript exporters](https://opentelemetry.io/docs/languages/js/exporters/), [.NET exporters](https://opentelemetry.io/docs/languages/dotnet/exporters/), [Go exporters](https://opentelemetry.io/docs/languages/go/exporters/), [Java SDK configuration](https://opentelemetry.io/docs/languages/java/configuration/), [PHP exporters](https://opentelemetry.io/docs/languages/php/exporters/), or [Ruby exporters](https://opentelemetry.io/docs/languages/ruby/exporters/).

## 4\. Configure the SDK

Use the following options to decide what goes into your spans and where they are sent. You can set an option in your code or, if it has one, with the environment variable under its name.

| Option | Use it to | Default |
| --- | --- | --- |
| `traces.content_mode`  
`ANTHROPIC_OPEN_TELEMETRY_TRACES_CONTENT_MODE=content` | Include prompts and responses in spans. See [Content modes](https://platform.claude.com/docs/en/manage-claude/opentelemetry#choose-a-content-mode). | `metadata_only` |
| `traces.max_content_bytes`  
`ANTHROPIC_OPEN_TELEMETRY_TRACES_MAX_CONTENT_BYTES` | Change the content limit of each span. See [Content limits](https://platform.claude.com/docs/en/manage-claude/opentelemetry#content-limits). | 0.75 MB |
| `conversation_id` | Link several calls into one conversation. The SDK writes the ID to `gen_ai.conversation.id`. The ID is exported in both content modes, so don’t put personal data or secrets in it. | None |
| `tracer_provider` | Choose the tracer provider that gets the SDK’s spans. | The tracer provider you set up in [Register a tracer provider](#register-a-tracer-provider) |
| `propagation`  
`ANTHROPIC_OPEN_TELEMETRY_PROPAGATION=false` | Stop sending trace context and baggage headers with requests, for example when your HTTP client instrumentation already sends them. The SDK still emits spans. Available in the Python, TypeScript, Go, Java, Ruby, and PHP SDKs. | On |
| `open_telemetry`  
`ANTHROPIC_OPEN_TELEMETRY=false` | Turn spans off for one client, for example when another library already traces the SDK. | On |

The following example shows how to use each option:

## Next steps

Get observability into the Claude API.

Follow a request from your client into the Claude API.

## Tracing a stream

A stream’s `anthropic.messages.create` span ends when your code has read the whole stream or closed it, so close a stream that you stop reading early. In content mode, the span has the model response only when you read the stream with `messages.stream()`.

Spans that you start while you read a stream are siblings of the SDK span, not its children. To group them with the request, start your own span around both the call and the read loop.

## Tracing a Managed Agents self-hosted sandbox

In a Managed Agents [self-hosted sandbox](https://platform.claude.com/docs/en/managed-agents/self-hosted-sandboxes), your sandbox runs the tools, so the tool spans come from the SDK instead of the API. The environment worker in the Python, TypeScript, and Go SDKs emits a span for each tool that it runs and each request that it sends. It groups them under one [`anthropic.environment.work`](https://platform.claude.com/docs/en/api/opentelemetry/spans#anthropic-environment-work) span for each work item.

To get these spans:

1.  In the process that runs the worker, [set up SDK tracing](#install-the-sdk) as in steps 1 to 4.
2.  Allow network traffic from the sandbox to your observability platform or OpenTelemetry Collector.

When the worker sends a tool result, that request’s API span is nested under its SDK span.

## Trace context and baggage

With each request, the SDK uses your application’s propagator to send the trace context to the API in headers such as `traceparent`. If that propagator also writes baggage, the SDK sends your baggage too. To send the trace context without baggage, register only the W3C trace context propagator.

To stop the SDK from sending these headers, for example when your HTTP client instrumentation already sends them, turn off the SDK’s propagation:

While the SDK calls an [MCP tool](https://platform.claude.com/docs/en/agents-and-tools/mcp-connector#client-side-mcp-helpers), the SDK’s tool span is the current span. Some MCP client libraries send the trace context to the MCP server in `_meta`, so a server that reads it can add its spans to your trace under that tool span. The Python `mcp` package from version 2.0 and the C# `ModelContextProtocol` package do this. The TypeScript, Go, Java, Ruby, and PHP MCP SDKs don’t do it on their own.

## Troubleshooting

| Problem | What to check |
| --- | --- |
| No spans from the SDK | Register the tracer provider before the first call. Make sure that you installed the SDK as in [Install the SDK](#install-the-sdk) and that `ANTHROPIC_OPEN_TELEMETRY` isn’t `false`. |
| The Java SDK doesn’t send spans to the registered tracer provider, or doesn’t send trace context to the API | Another dependency sets `opentelemetry-api` below 1.57.0. Upgrade `opentelemetry-api` to 1.57.0 or later. |
| The SDK spans don’t nest under your spans, or the spans that your tool creates don’t nest under the tool span | Call the SDK from inside one of your own spans, as the example in [Connect API spans to your own traces](https://platform.claude.com/docs/en/manage-claude/opentelemetry/api#connect-api-spans-to-your-own-traces) does. In Go, start the spans that your tool creates from the `ctx` that the tool runner passes to it. |
| Requests from the SDK don’t have a `traceparent` header | Register the W3C trace context propagator with OpenTelemetry. The SDK writes the headers with your application’s propagator. |
| A stream’s SDK span doesn’t end or doesn’t have the response | See [Tracing a stream](#trace-a-stream). |
| Each request appears twice | A request’s SDK span and API span have the same name. Use the span kind or `service.name` to tell them apart. If another library also traces the SDK, turn off one of the two. |

## Availability

SDK tracing is in beta on every model.

### API support
