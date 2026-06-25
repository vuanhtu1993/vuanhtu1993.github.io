---
title: "Adapters: Routing Information"
source_url: "https://nextjs.org/docs/app/api-reference/adapters/routing-information"
crawled_at: "2026-06-25T07:20:22.736Z"
---

This page is also available as Markdown at [/docs/app/api-reference/adapters/routing-information.md](https://nextjs.org/docs/app/api-reference/adapters/routing-information.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

Last updated

March 31, 2026

The `routing` object in `onBuildComplete` provides complete routing information with processed patterns ready for deployment:

## `routing.beforeMiddleware`[](#routingbeforemiddleware)

Routes applied before middleware execution. These include generated header and redirect behavior.

## `routing.beforeFiles`[](#routingbeforefiles)

Rewrite routes checked before filesystem route matching.

## `routing.afterFiles`[](#routingafterfiles)

Rewrite routes checked after filesystem route matching.

## `routing.dynamicRoutes`[](#routingdynamicroutes)

Dynamic matchers generated from route segments such as `[slug]` and catch-all routes.

## `routing.onMatch`[](#routingonmatch)

Routes that apply after a successful match, such as immutable cache headers for hashed static assets.

## `routing.fallback`[](#routingfallback)

Final rewrite routes checked when earlier phases did not produce a match.

## Common Route Fields[](#common-route-fields)

Each route entry can include:

-   `source`: Original route pattern (optional for generated internal rules)
-   `sourceRegex`: Compiled regex for matching requests
-   `destination`: Internal destination or redirect destination
-   `headers`: Headers to apply
-   `has`: Positive matching conditions
-   `missing`: Negative matching conditions
-   `status`: Redirect status code
-   `priority`: Internal route priority flag

[Previous

Output Types

](https://nextjs.org/docs/app/api-reference/adapters/output-types)[Next

Use Cases

](https://nextjs.org/docs/app/api-reference/adapters/use-cases)
