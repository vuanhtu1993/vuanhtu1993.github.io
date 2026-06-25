---
title: "Adapters: Routing with @next/routing"
source_url: "https://nextjs.org/docs/app/api-reference/adapters/routing-with-next-routing"
crawled_at: "2026-06-25T07:19:52.545Z"
---

This page is also available as Markdown at [/docs/app/api-reference/adapters/routing-with-next-routing.md](https://nextjs.org/docs/app/api-reference/adapters/routing-with-next-routing.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

Last updated

April 2, 2026

You can use [`@next/routing`](https://www.npmjs.com/package/@next/routing) to reproduce Next.js route matching behavior with data from `onBuildComplete`.

`@next/routing` is experimental and will stabilize with the adapters API.

`resolveRoutes()` returns:

-   `middlewareResponded`: `true` when middleware already sent a response (the adapter should not invoke an entrypoint).
-   `externalRewrite`: A `URL` when routing resolved to an external rewrite destination.
-   `redirect`: An object with `url` (`URL`) and `status` when the request should be redirected.
-   `resolvedPathname`: The route pathname selected by Next.js routing. For dynamic routes, this is the matched route template such as `/blog/[slug]`.
-   `resolvedQuery`: The final query after rewrites or middleware have added or replaced search params.
-   `invocationTarget`: The concrete pathname and query to invoke for the matched route.
-   `resolvedHeaders`: A `Headers` object containing any headers added or modified during routing.
-   `status`: An HTTP status code set by routing (for example from a redirect or rewrite rule).
-   `routeMatches`: A record of named matches extracted from dynamic route segments.

For example, if `/blog/post-1?draft=1` matches `/blog/[slug]?slug=post-1`, `resolvedPathname` is `/blog/[slug]` while `invocationTarget.pathname` is `/blog/post-1`.

[Previous

Testing Adapters

](https://nextjs.org/docs/app/api-reference/adapters/testing-adapters)[Next

Implementing PPR in an Adapter

](https://nextjs.org/docs/app/api-reference/adapters/implementing-ppr-in-an-adapter)
