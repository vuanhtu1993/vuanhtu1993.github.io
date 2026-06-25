---
title: "Functions: unstable_cache"
source_url: "https://nextjs.org/docs/app/api-reference/functions/unstable_cache"
crawled_at: "2026-06-25T07:10:49.177Z"
---

This page is also available as Markdown at [/docs/app/api-reference/functions/unstable\_cache.md](https://nextjs.org/docs/app/api-reference/functions/unstable_cache.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

Last updated

March 3, 2026

> **Note:** This API has been replaced by [`use cache`](https://nextjs.org/docs/app/api-reference/directives/use-cache) in Next.js 16. We recommend opting into [Cache Components](https://nextjs.org/docs/app/getting-started/caching) and replacing `unstable_cache` with the `use cache` directive.

`unstable_cache` allows you to cache the results of expensive operations, like database queries, and reuse them across multiple requests.

> **Good to know**:
> 
> -   Accessing uncached data sources such as `headers` or `cookies` inside a cache scope is not supported. If you need this data inside a cached function use `headers` outside of the cached function and pass the required uncached data in as an argument.
> -   This API uses Next.js' built-in cache to persist the result across requests and deployments. See [Caching and Revalidating](https://nextjs.org/docs/app/getting-started/caching).

## Parameters[](#parameters)

-   `fetchData`: This is an asynchronous function that fetches the data you want to cache. It must be a function that returns a `Promise`.
-   `keyParts`: This is an extra array of keys that further adds identification to the cache. By default, `unstable_cache` already uses the arguments and the stringified version of your function as the cache key. It is optional in most cases; the only time you need to use it is when you use external variables without passing them as parameters. However, it is important to add closures used within the function if you do not pass them as parameters.
-   `options`: This is an object that controls how the cache behaves. It can contain the following properties:
    -   `tags`: An array of tags that can be used to control cache invalidation. Next.js will not use this to uniquely identify the function.
    -   `revalidate`: The number of seconds after which the cache should be revalidated. Omit or pass `false` to cache indefinitely or until matching `revalidateTag()` or `revalidatePath()` methods are called.

## Returns[](#returns)

`unstable_cache` returns a function that when invoked, returns a Promise that resolves to the cached data. If the data is not in the cache, the provided function will be invoked, and its result will be cached and returned.

## Example[](#example)

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v14.0.0` | `unstable_cache` introduced. |

[Previous

unauthorized

](https://nextjs.org/docs/app/api-reference/functions/unauthorized)[Next

unstable\_noStore

](https://nextjs.org/docs/app/api-reference/functions/unstable_noStore)
