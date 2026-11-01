---
title: "Set up OpenTelemetry with the Claude API"
source_url: "https://platform.claude.com/docs/en/manage-claude/opentelemetry/api"
crawled_at: "2026-11-01T16:21:41.306Z"
---

Add a destination in the Claude Console to send OpenTelemetry traces of your Messages API requests and Managed Agents sessions to your observability platform.

With OpenTelemetry, the Claude API can emit a span for each model request and each tool use that it runs. You can view these spans in your observability platform without changing your code.

The API emits spans for your Messages API requests and Managed Agents sessions. To receive them, add a _destination_ in the Claude Console. A destination tells the API your observability platform’s OTLP endpoint and how to authenticate with it.

## What you need

-   **The admin role** in a Claude Console organization, to add and change destinations. With the developer role, you can view them. If your organization is on Claude Platform on AWS, sign in to the Console through the AWS Console, as [Signing in](https://platform.claude.com/docs/en/build-with-claude/claude-platform-on-aws#signing-in) describes.
-   **An OTLP/HTTP endpoint** that accepts protobuf encoding at an HTTPS URL on port 443. If you run your own [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/), its OTLP/HTTP receiver listens on port 4318 by default. Configure the receiver to accept HTTPS on port 443, or put a load balancer or reverse proxy in front of the Collector.
-   **Credentials for the endpoint**, such as an API key.

## 1\. Add a destination

1.  In the Console, open your organization’s [OpenTelemetry settings page](https://platform.claude.com/settings/telemetry-destinations) and click **Add destination**.
    
2.  Configure the destination:
    
    | Field | What to enter |
    | --- | --- |
    | **Provider** | Your observability platform, or **Custom** if it isn’t listed. If you select a listed platform, the Console asks for its details, such as an API key, instead of the **OTLP endpoint URL**, **Request headers**, and **OTLP traces endpoint URL**. |
    | **Name** | Optional. For example, “Acme’s observability platform.” |
    | **OTLP endpoint URL** | The base HTTPS URL of your observability platform’s OTLP/HTTP endpoint, with a hostname, not an IP address. It can have a path prefix, for example `https://gateway.example.com/otlp`. Don’t add `/v1/traces`, because the API adds it. If you set an **OTLP traces endpoint URL**, the API uses that URL instead. |
    | **Request headers** | The headers that the API sends with each request, for example your observability platform’s API key header. Put credentials only in header values. After you save, the Console doesn’t show the values again. |
    | **Content mode** | **Metadata only** or **Full content**. See [how the content modes differ](https://platform.claude.com/docs/en/manage-claude/opentelemetry#choose-a-content-mode). |
    | **Workspaces** | The workspaces whose spans the destination receives: **All**, **Selected**, or **All except**. See [Choose workspaces for a destination](#choose-workspaces-for-a-destination). |
    | **OTLP traces endpoint URL** | Optional, under **Advanced settings**. The full URL of your observability platform’s traces endpoint, for example `https://gateway.example.com/custom/traces`. Set it when the platform receives traces at a URL other than the OTLP endpoint URL plus `/v1/traces`. It must have the same host as the OTLP endpoint URL. |
    | **Maximum content size in MB** | Optional, under **Advanced settings** when the content mode is **Full content**. The most content that the API sends in each span. The Console fills it in based on the **Provider** you select. Change it to fit what your observability platform accepts. Leave it empty to send as much as the API allows. See [Content limits](https://platform.claude.com/docs/en/manage-claude/opentelemetry#content-limits). |
    
3.  Click **Add destination** to save.
    
4.  Click **Test** in the destination’s **More actions** menu. You will see a message that the test span was delivered to your collector, or how the delivery failed (see [Delivery errors](#delivery-errors)).
    
5.  Check that the `anthropic.test` span arrived in your observability platform.
    

### Admin API and CLI

You can also add a destination with the [Admin API](https://platform.claude.com/docs/en/manage-claude/admin-api) instead of the Console. Sign in to the CLI as an admin, or use another [Admin API credential](https://platform.claude.com/docs/en/manage-claude/admin-api#authentication), such as an [Admin API key](https://platform.claude.com/docs/en/manage-claude/admin-api-keys) or a service account key in `ANTHROPIC_API_KEY`. On Claude Platform on AWS, send the requests to `https://aws-external-anthropic.{region}.api.aws` instead, signed with your AWS credentials as in [Making requests](https://platform.claude.com/docs/en/build-with-claude/claude-platform-on-aws#making-requests). There, your [IAM policy](https://platform.claude.com/docs/en/api/claude-platform-on-aws-iam-actions) determines who can manage destinations. A request can include only the workspaces of your AWS account in that Region.

A create request takes the Console’s settings except **Provider**, so enter your observability platform’s endpoint URL and headers yourself. Set `traces.max_content_bytes`, in bytes, to fit what your observability platform accepts (see [Content limits](https://platform.claude.com/docs/en/manage-claude/opentelemetry#content-limits)). To list, change, or delete destinations, or to add or remove one workspace, use the other methods of the [telemetry destinations API](https://platform.claude.com/docs/en/api/beta/organization/telemetry_destinations).

## 2\. Choose workspaces for a destination

A destination receives the spans of the workspaces that it covers. Choose them when you add the destination. For **Workspaces**, select one of the following:

-   **All:** Every workspace in the organization, including the [Default Workspace](https://platform.claude.com/docs/en/manage-claude/workspaces#how-workspaces-work) and workspaces created later.
-   **Selected:** Only the workspaces that you select.
-   **All except:** Like **All**, but without the workspaces that you select.

For **Selected** or **All except**, select the workspaces in the search box that appears under the options. To change a destination’s workspaces later, open its **More actions** menu on the [OpenTelemetry settings page](https://platform.claude.com/settings/telemetry-destinations) in the Console while the **Workspace** filter shows **All**. Click **Edit**, then select another **Workspaces** option or change the workspaces in the search box.

If you have the developer role in the organization and the Workspace Admin role in a workspace, you can add that workspace to a **Selected** destination or remove it. Set the **Workspace** filter to that workspace, then open the destination’s **More actions** menu. On Claude Platform on AWS, the Console has no Workspace Admin role. There, your [IAM policy](https://platform.claude.com/docs/en/api/claude-platform-on-aws-iam-actions) determines who can add a workspace to a destination or remove it.

The API sends spans to every enabled destination that covers the [workspace where the request or session runs](https://platform.claude.com/docs/en/manage-claude/workspaces#api-keys-and-resource-scoping).

## 3\. Check that spans arrive

1.  In the Console, select a workspace that the destination covers and send a Messages API request in [playground](https://platform.claude.com/playground). You can also send a Messages API request from your application or start a Managed Agents session in that workspace. To start a session, you can follow the steps in [Get started with Claude Managed Agents](https://platform.claude.com/docs/en/managed-agents/quickstart).
2.  In the Console, on the [OpenTelemetry settings page](https://platform.claude.com/settings/telemetry-destinations), check that the **Delivery** column shows **Healthy** for the destination. This can take about a minute.
3.  In your observability platform, filter on `service.name` = `claude-platform` to find the request’s spans.

If the column shows **Failing**, hover over it to see the last error. To find the likely cause, see [Delivery errors](#delivery-errors).

## 4\. Connect API spans to your own traces

By default, the API spans for a Messages API request or a Managed Agents session are in their own traces. Connect them to your application’s traces, so that they nest under your own spans.

The API reads each request’s trace context from the W3C [`traceparent` header](https://www.w3.org/TR/trace-context/). If the sampled flag in the header is off, the API doesn’t emit the request’s span or the spans under it.

When you connect your MCP server with the [Messages API’s MCP connector](https://platform.claude.com/docs/en/agents-and-tools/mcp-connector) or the [Managed Agents MCP connector](https://platform.claude.com/docs/en/managed-agents/mcp-connector), the API also passes the trace on to your server. The server can then put its own spans under the API spans. In `params._meta` of a `tools/call` request, the API sends a W3C `traceparent` that references the [`anthropic.mcp_tool_use`](https://platform.claude.com/docs/en/api/opentelemetry/spans#anthropic-tool-use-anthropic-mcp-tool-use-and-anthropic-custom-tool-use) span for that tool use. With the Messages API’s MCP connector, the other requests and notifications to your MCP server have a `traceparent` too, which references the [`anthropic.messages.create`](https://platform.claude.com/docs/en/api/opentelemetry/spans#anthropic-messages-create) span. If the API doesn’t trace your Messages API request, such as when its `traceparent` header has the sampled flag off, your MCP server gets no `traceparent`.

## Next steps

Get observability into your client.

Follow a request from your client into the Claude API.

## Delivery and health

The following rules apply to the spans that the API sends to your destinations.

-   **At least once:** A destination can receive the same span more than once. To remove duplicates, use the trace ID and span ID.
-   **Best effort:** A span can be lost before delivery. The API can’t send a lost span again.
-   **Compression:** The API compresses requests with gzip and sets the header `Content-Encoding: gzip`. If your endpoint answers a compressed request with a `400`, `406`, `415`, or `422` response, the API sends the same spans again right away without compression. It then usually sends that destination’s later requests without compression for about a day.
-   **Retries:** The API retries a delivery later, a limited number of times, after a timeout, a connection, TLS, or DNS failure, an invalid address, or a `408`, `429`, or `5xx` response. It doesn’t retry other failures.
-   **Timeouts:** For each request, your endpoint must complete the TLS handshake within 5 seconds and send the response headers within 5 seconds. Each delivery times out after 10 seconds in total, including any resend.
-   **User agent:** Each request has the header `User-Agent: Claude-Platform`.

The **Delivery** column shows each destination’s state. The state can be up to a minute late.

| Delivery state | Meaning |
| --- | --- |
| **Healthy** | The last delivery succeeded. |
| **Failing** | The last delivery failed. To see the error, hover over **Failing**. |
| **No data** | The API hasn’t tried a delivery yet. |
| **Disabled** | The destination doesn’t receive spans. To see why, hover over **Disabled**. |

The API disables a destination when:

-   The endpoint sends a `3xx` redirect.
-   All deliveries fail for 24 hours.

While a destination is disabled, the API drops the spans for it, and they aren’t sent after you enable it again. To resume export, fix the cause and check the fix with **Test** in the destination’s **More actions** menu. Then, on the [OpenTelemetry settings page](https://platform.claude.com/settings/telemetry-destinations) in the Console, click **Enable** in the same menu while the **Workspace** filter shows **All**. Export starts again within about a minute. Until the next delivery, the **Delivery** column can still show **Failing** with the old error.

To change a destination, open its **More actions** menu while the **Workspace** filter shows **All**. Then click **Edit**, **Disable**, **Enable**, or **Delete**. If you change the host of the **OTLP endpoint URL**, enter the header values again. If the destination has an **OTLP traces endpoint URL**, give it the same new host, or clear it.

## Limits

| Limit | Value |
| --- | --- |
| Destinations for each organization, including disabled ones | 10 |
| Workspaces that you select for a destination | 1,000 |
| Request headers for each destination | 20 |
| Length of a header name | 128 bytes |
| Length of a header value | 4,096 bytes |
| Length of all header names and values together | 16,384 bytes |
| Length of an endpoint URL | 2,048 characters |

## Zero data retention

Spans have the same ZDR eligibility as the feature that produces them. Claude Managed Agents isn’t ZDR eligible. See [Feature eligibility](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention#feature-eligibility).

## Troubleshooting

| Problem | What to check |
| --- | --- |
| No API spans | The workspace needs an enabled destination that covers it. See [Choose workspaces for a destination](#choose-workspaces-for-a-destination). After a destination starts covering a workspace, spans from that workspace can take up to a minute to arrive. The API emits no span for a request whose `traceparent` header has the sampled flag off, or for a request to the [OpenAI-compatible endpoint](https://platform.claude.com/docs/en/cli-sdks-libraries/libraries/openai-sdk). |
| The **Delivery** column shows **Failing** | Hover over it to see the last error. To find the likely cause, see [Delivery errors](#delivery-errors). |
| The **Delivery** column shows **Disabled** | Hover over it to see why. For the reasons, see [when the API disables a destination](#delivery-and-health). |
| Spans have no prompts or responses, but the destination is set to **Full content** | Your organization might have a HIPAA, FERPA, or K-12 data-handling restriction with Anthropic. See [Content modes](https://platform.claude.com/docs/en/manage-claude/opentelemetry#choose-a-content-mode). |

### Delivery errors

When a delivery fails, the **Delivery** column shows **Failing**. Hover over it to see the error, then find the likely cause:

| Error | Likely cause |
| --- | --- |
| HTTP error (status 401) or HTTP error (status 403) | A wrong authentication header |
| HTTP error (status 404) | A wrong path in the **OTLP endpoint URL** or the **OTLP traces endpoint URL** |
| Invalid address | The endpoint’s hostname doesn’t exist or doesn’t resolve to a public IP address |
| Temporary DNS failure | The DNS lookup of the endpoint’s hostname failed, for example because its DNS server returned an error |
| TLS failure | A TLS problem, for example with the endpoint’s certificate |
| Timeout | The endpoint didn’t respond in time. See [the delivery timeouts](#delivery-and-health) |
| Connection failure | The API couldn’t connect to the endpoint |
| Redirect (status 3xx) | The endpoint redirected the request. The API doesn’t follow redirects, so use the URL it redirects to |
| HTTP error (status 408, 429, or 5xx) | The endpoint was overloaded, limited the rate of requests, or had an error |
| HTTP error (another 4xx status) | The endpoint refused the request, for example because of its size or format |

## Availability

API tracing is in beta on every model and eligible for zero data retention.

### API support
