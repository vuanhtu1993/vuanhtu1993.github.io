---
title: "Models - Claude API Reference"
source_url: "https://platform.claude.com/docs/en/api/models"
crawled_at: "2026-11-01T16:32:09.056Z"
---

1.  [API reference](https://platform.claude.com/docs/en/api/http)

##### [Get a Model](https://platform.claude.com/docs/en/api/http/models/retrieve)

GET/v1/models/{model\_id}

Get a specific model.

##### Models

CapabilitySupport object{ supported }

Indicates whether a capability is supported.

supported: boolean

Whether this capability is supported by the model.

ContextManagementCapability object{ clear\_thinking\_20251015, clear\_tool\_uses\_20250919, compact\_20260112, supported }

Context management capability details.

Whether the clear\_thinking\_20251015 strategy is supported.

supported: boolean

Whether this capability is supported by the model.

Whether the clear\_tool\_uses\_20250919 strategy is supported.

supported: boolean

Whether this capability is supported by the model.

Whether the compact\_20260112 strategy is supported.

supported: boolean

Whether this capability is supported by the model.

supported: boolean

Whether this capability is supported by the model.

EffortCapability object{ high, low, max, 3 more }

Effort (reasoning\_effort) capability details.

ModelCapabilities object{ batch, citations, code\_execution, 7 more }

Model capability information.

ModelInfo object{ type: "model", id, capabilities, 8 more }

ModelLine = "haiku" or "sonnet" or "opus" or 2 more

A Claude model line, such as `opus` or `sonnet`. More lines may be added as new values.

One of the following:

"haiku"

"sonnet"

"opus"

"fable"

"mythos"

ServerToolsCapability object{ code\_execution, supported, web\_search }

Web search and code execution tool support, with one entry per tool.

Whether the model supports the code execution tool: true when the model supports at least one version of the tool, not necessarily every version.

supported: boolean

Whether this capability is supported by the model.

supported: boolean

Whether this capability is supported by the model.

Whether the model supports the web search tool: true when the model supports at least one version of the tool, not necessarily every version.

supported: boolean

Whether this capability is supported by the model.

ThinkingCapability object{ supported, types }

Thinking capability details.

supported: boolean

Whether this capability is supported by the model.

types: [ThinkingTypes](https://platform.claude.com/docs/en/api/http/models#thinking_types) { adaptive, between\_tools, disabled, enabled }

Supported thinking type configurations.

ThinkingTypes object{ adaptive, between\_tools, disabled, enabled }

Which `thinking.type` values the model accepts on requests. Read each key on its own: for example, `enabled` can be false while `disabled` is true.
