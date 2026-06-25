---
title: "next.config.js: deploymentId"
source_url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/deploymentId"
crawled_at: "2026-06-25T07:13:41.755Z"
---

This page is also available as Markdown at [/docs/app/api-reference/config/next-config-js/deploymentId.md](https://nextjs.org/docs/app/api-reference/config/next-config-js/deploymentId.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

Last updated

February 12, 2026

The `deploymentId` option allows you to set an identifier for your deployment. This identifier is used for [version skew](https://nextjs.org/docs/app/guides/self-hosting#version-skew) protection and cache busting during rolling deployments.

You can also set the deployment ID using the `NEXT_DEPLOYMENT_ID` environment variable:

> **Good to know:** If both are set, the `deploymentId` value in `next.config.js` takes precedence over the `NEXT_DEPLOYMENT_ID` environment variable.

## How it works[](#how-it-works)

When a `deploymentId` is configured, Next.js:

1.  Appends `?dpl=<deploymentId>` to static asset URLs (JavaScript, CSS, images)
2.  Adds an `x-deployment-id` header to client-side navigation requests
3.  Adds an `x-nextjs-deployment-id` header to navigation responses
4.  Injects a `data-dpl-id` attribute on the `<html>` element

When the client detects a mismatch between its deployment ID and the server's (via the response header), it triggers a hard navigation (full page reload) instead of a client-side navigation. This ensures users always receive assets and Server Functions from a consistent deployment version.

> **Good to know:** Next.js does not read the `?dpl=` query parameter on incoming requests. The query parameter is for cache busting (ensuring browsers and CDNs fetch fresh assets), not for routing. If you need version-aware routing, consult your hosting provider or CDN's documentation for implementing deployment-based routing.

## Use cases[](#use-cases)

### Rolling deployments[](#rolling-deployments)

During a rolling deployment, some server instances may be running the new version while others are still running the old version. Without a deployment ID, users might receive a mix of old and new assets, causing errors.

Setting a consistent `deploymentId` per deployment ensures:

-   Clients always request assets from a matching deployment version
-   Mismatches trigger a full reload to fetch the correct assets
-   Server Functions work correctly across deployment boundaries

### Multi-server environments[](#multi-server-environments)

When running multiple instances of your Next.js application behind a load balancer, all instances for the same deployment should use the same `deploymentId`.

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v14.1.4` | `deploymentId` stabilized as top-level config option. |
| `v13.4.10` | `experimental.deploymentId` introduced. |

-   [Self-Hosting - Version Skew](https://nextjs.org/docs/app/guides/self-hosting#version-skew)
-   [generateBuildId](https://nextjs.org/docs/app/api-reference/config/next-config-js/generateBuildId)

[Previous

cssChunking

](https://nextjs.org/docs/app/api-reference/config/next-config-js/cssChunking)[Next

devIndicators

](https://nextjs.org/docs/app/api-reference/config/next-config-js/devIndicators)
