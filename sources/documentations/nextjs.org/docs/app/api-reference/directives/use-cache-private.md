---
title: "Directives: use cache: private"
source_url: "https://nextjs.org/docs/app/api-reference/directives/use-cache-private"
crawled_at: "2026-06-25T07:03:57.351Z"
---

This feature is currently experimental and subject to change, it's not recommended for production. Try it out and share your feedback on [GitHub](https://github.com/vercel/next.js/issues).

Last updated

March 3, 2026

The `'use cache: private'` directive allows functions to access runtime request APIs like `cookies()`, `headers()`, and `searchParams` within a cached scope. However, results are **never stored on the server**, they're cached only in the browser's memory and do not persist across page reloads.

Reach for `'use cache: private'` when:

-   You want to cache a function that already accesses runtime data, and refactoring to [move the runtime access outside and pass values as arguments](https://nextjs.org/docs/app/getting-started/caching#working-with-runtime-apis) is not practical.
-   Compliance requirements prevent storing certain data on the server, even temporarily

Because this directive accesses runtime data, the function executes on every server render and is excluded from running during [static shell](https://nextjs.org/docs/app/getting-started/caching#how-rendering-works) generation.

It is **not** possible to configure custom cache handlers for `'use cache: private'`.

For a comparison of the different cache directives, see [How `use cache: remote` differs from `use cache` and `use cache: private`](https://nextjs.org/docs/app/api-reference/directives/use-cache-remote#how-use-cache-remote-differs-from-use-cache-and-use-cache-private).

> **Good to know**: This directive is marked as `experimental` because it depends on runtime prefetching, which is not yet stable. Runtime prefetching is an upcoming feature that will let the router prefetch past the [static shell](https://nextjs.org/docs/app/getting-started/caching#how-rendering-works) into **any** cached scope, not just private caches.

## Usage[](#usage)

To use `'use cache: private'`, enable the [`cacheComponents`](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents) flag in your `next.config.ts` file:

Then add `'use cache: private'` to your function along with a `cacheLife` configuration.

> **Good to know**: This directive is not available in Route Handlers.

### Basic example[](#basic-example)

In this example, we demonstrate that you can access cookies within a `'use cache: private'` scope:

> **Good to know**: The `stale` time must be at least 30 seconds for runtime prefetching to work. See [`cacheLife` client cache behavior](https://nextjs.org/docs/app/api-reference/functions/cacheLife#client-cache-behavior) for details.

## Request APIs allowed in private caches[](#request-apis-allowed-in-private-caches)

The following request-specific APIs can be used inside `'use cache: private'` functions:

| API | Allowed in `use cache` | Allowed in `'use cache: private'` |
| --- | --- | --- |
| `cookies()` | No | Yes |
| `headers()` | No | Yes |
| `searchParams` | No | Yes |
| `connection()` | No | No |

> **Note:** The [`connection()`](https://nextjs.org/docs/app/api-reference/functions/connection) API is prohibited in both `use cache` and `'use cache: private'` as it provides connection-specific information that cannot be safely cached.

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v16.0.0` | `"use cache: private"` is enabled with the Cache Components feature. |
