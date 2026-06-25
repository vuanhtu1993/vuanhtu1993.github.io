---
title: "next.config.js: cacheLife"
source_url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheLife"
crawled_at: "2026-06-25T07:13:15.948Z"
---

This page is also available as Markdown at [/docs/app/api-reference/config/next-config-js/cacheLife.md](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheLife.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

Last updated

November 11, 2025

The `cacheLife` option allows you to define **custom cache profiles** when using the [`cacheLife`](https://nextjs.org/docs/app/api-reference/functions/cacheLife) function inside components or functions, and within the scope of the [`use cache` directive](https://nextjs.org/docs/app/api-reference/directives/use-cache).

## Usage[](#usage)

To define a profile, enable the [`cacheComponents` flag](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents) and add the cache profile in the `cacheLife` object in the `next.config.js` file. For example, a `blog` profile:

You can now use this custom `blog` configuration in your component or function as follows:

## Reference[](#reference)

The configuration object has key values with the following format:

| **Property** | **Value** | **Description** | **Requirement** |
| --- | --- | --- | --- |
| `stale` | `number` | Duration the client should cache a value without checking the server. | Optional |
| `revalidate` | `number` | Frequency at which the cache should refresh on the server; stale values may be served while revalidating. | Optional |
| `expire` | `number` | Maximum duration for which a value can remain stale before switching to dynamic. | Optional - Must be longer than `revalidate` |

View related API references.

[Previous

cacheHandlers

](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheHandlers)[Next

compress

](https://nextjs.org/docs/app/api-reference/config/next-config-js/compress)
