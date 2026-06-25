---
title: "Getting Started: Revalidating"
source_url: "https://nextjs.org/docs/app/getting-started/revalidating"
crawled_at: "2026-06-25T06:56:26.366Z"
---

Last updated

June 23, 2026

> This page covers revalidation with [Cache Components](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents), enabled by setting [`cacheComponents: true`](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents) in your `next.config.ts` file. If you're not using Cache Components, see the [Caching and Revalidating (Previous Model)](https://nextjs.org/docs/app/guides/caching-without-cache-components) guide.

Revalidation is the process of updating cached data. It lets you keep serving fast, cached responses while ensuring content stays fresh. There are two strategies:

-   **Time-based revalidation**: Automatically refresh cached data after a set duration using [`cacheLife`](#cachelife).
-   **On-demand revalidation**: Manually invalidate cached data after a mutation using [`revalidateTag`](#revalidatetag), [`updateTag`](#updatetag), or [`revalidatePath`](#revalidatepath).

## `cacheLife`[](#cachelife)

[`cacheLife`](https://nextjs.org/docs/app/api-reference/functions/cacheLife) controls how long cached data remains valid. Use it inside a [`use cache`](https://nextjs.org/docs/app/api-reference/directives/use-cache) scope to set the cache lifetime.

`cacheLife` accepts a profile name or a custom configuration object:

| Profile | `stale` | `revalidate` | `expire` |
| --- | --- | --- | --- |
| `default` | 5m | 15m | never |
| `seconds` | 30s | 1s | 60s |
| `minutes` | 5m | 1m | 1h |
| `hours` | 5m | 1h | 1d |
| `days` | 5m | 1d | 1w |
| `weeks` | 5m | 1w | 30d |
| `max` | 5m | 30d | 1y |

For fine-grained control, pass an object:

> **Good to know:** A cache is considered "short-lived" when it uses the `seconds` profile, `revalidate: 0`, or `expire` under 5 minutes. Short-lived caches are automatically excluded from prerenders and become dynamic holes instead. See [Prerendering behavior](https://nextjs.org/docs/app/api-reference/functions/cacheLife#prerendering-behavior) for details.

See the [`cacheLife` API reference](https://nextjs.org/docs/app/api-reference/functions/cacheLife) for all profiles and custom configuration options.

## `cacheTag`[](#cachetag)

[`cacheTag`](https://nextjs.org/docs/app/api-reference/functions/cacheTag) lets you tag cached data so it can be invalidated on-demand. Use it inside a [`use cache`](https://nextjs.org/docs/app/api-reference/directives/use-cache) scope:

Once tagged, invalidate the cache using [`revalidateTag`](#revalidatetag) or [`updateTag`](#updatetag).

See the [`cacheTag` API reference](https://nextjs.org/docs/app/api-reference/functions/cacheTag) to learn more.

## `revalidateTag`[](#revalidatetag)

`revalidateTag` invalidates cache entries by tag using stale-while-revalidate semantics — stale content is served immediately while fresh content loads in the background. This is ideal for content where a slight delay in updates is acceptable, like blog posts or product catalogs.

You can reuse the same tag in multiple functions to revalidate them all at once. Call `revalidateTag` in a [Server Action](https://nextjs.org/docs/app/getting-started/mutating-data) or [Route Handler](https://nextjs.org/docs/app/api-reference/file-conventions/route).

> **Good to know:** The second argument sets how long stale content can be served while fresh content generates in the background. Once it expires, subsequent requests block until fresh content is ready. Using `'max'` gives the longest stale window.

See the [`revalidateTag` API reference](https://nextjs.org/docs/app/api-reference/functions/revalidateTag) to learn more.

## `updateTag`[](#updatetag)

`updateTag` immediately expires cached data for read-your-own-writes scenarios — the user sees their change right away instead of stale content. Unlike `revalidateTag`, it can only be used in [Server Actions](https://nextjs.org/docs/app/getting-started/mutating-data).

|  | `updateTag` | `revalidateTag` |
| --- | --- | --- |
| **Where** | Server Actions only | Server Actions and Route Handlers |
| **Behavior** | Immediately expires cache | Stale-while-revalidate |
| **Use case** | Read-your-own-writes (user sees their change) | Background refresh (slight delay OK) |

See the [`updateTag` API reference](https://nextjs.org/docs/app/api-reference/functions/updateTag) to learn more.

## `revalidatePath`[](#revalidatepath)

`revalidatePath` invalidates all cached data for a specific route path. Use it when you want to revalidate a route without knowing which tags are associated with it.

> **Good to know**: Prefer tag-based revalidation (`revalidateTag`/`updateTag`) over path-based when possible — it's more precise and avoids over-invalidating.

See the [`revalidatePath` API reference](https://nextjs.org/docs/app/api-reference/functions/revalidatePath) to learn more.

## What should I cache?[](#what-should-i-cache)

Cache data that doesn't depend on [runtime data](https://nextjs.org/docs/app/getting-started/caching#working-with-runtime-apis) and that you're OK serving from cache for a period of time. Use `use cache` with `cacheLife` to describe that behavior.

For content management systems with update mechanisms, use tags with longer cache durations and rely on `revalidateTag` to refresh content when it actually changes, rather than expiring the cache preemptively.

> **Good to know:** In serverless environments, in-memory cache entries may not persist across revalidations. See [runtime caching considerations](https://nextjs.org/docs/app/api-reference/directives/use-cache#runtime-caching-considerations) for details.
