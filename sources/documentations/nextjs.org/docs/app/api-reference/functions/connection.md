---
title: "Functions: connection"
source_url: "https://nextjs.org/docs/app/api-reference/functions/connection"
crawled_at: "2026-06-25T07:08:31.575Z"
---

This page is also available as Markdown at [/docs/app/api-reference/functions/connection.md](https://nextjs.org/docs/app/api-reference/functions/connection.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

Last updated

May 13, 2026

The `connection()` function allows you to indicate rendering should wait for an incoming user request before continuing.

It's useful when a component doesn't use [Request-time APIs](https://nextjs.org/docs/app/glossary#request-time-apis) like `cookies` or `headers`, but still needs to produce different output per request, such as `Math.random()` or `new Date()`.

## Examples[](#examples)

### Synchronous database drivers[](#synchronous-database-drivers)

Queries from synchronous database drivers like `better-sqlite3` complete during prerendering. If you are not already using Request-time APIs, call `connection()` before your query to exclude them from prerendering:

Now any component that calls `getVisitorCount()` will be excluded from prerendering, along with the rest of its output.

## Reference[](#reference)

### Type[](#type)

### Parameters[](#parameters)

-   The function does not accept any parameters.

### Returns[](#returns)

-   The function returns a `void` Promise. It is not meant to be consumed.

## Good to know[](#good-to-know)

-   `connection` replaces [`unstable_noStore`](https://nextjs.org/docs/app/api-reference/functions/unstable_noStore) to better align with the future of Next.js.
-   The function is only necessary when dynamic rendering is required and common Request-time APIs are not used.

### Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v15.0.0` | `connection` stabilized. |
| `v15.0.0-RC` | `connection` introduced. |

[Previous

unstable\_catchError

](https://nextjs.org/docs/app/api-reference/functions/catchError)[Next

cookies

](https://nextjs.org/docs/app/api-reference/functions/cookies)
