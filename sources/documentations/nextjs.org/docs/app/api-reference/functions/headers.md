---
title: "Functions: headers"
source_url: "https://nextjs.org/docs/app/api-reference/functions/headers"
crawled_at: "2026-06-25T07:09:40.657Z"
---

This page is also available as Markdown at [/docs/app/api-reference/functions/headers.md](https://nextjs.org/docs/app/api-reference/functions/headers.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

Last updated

March 3, 2026

`headers` is an **async** function that allows you to **read** the HTTP incoming request headers from a [Server Component](https://nextjs.org/docs/app/getting-started/server-and-client-components).

## Reference[](#reference)

### Parameters[](#parameters)

`headers` does not take any parameters.

### Returns[](#returns)

`headers` returns a **read-only** [Web Headers](https://developer.mozilla.org/docs/Web/API/Headers) object.

-   [`Headers.entries()`](https://developer.mozilla.org/docs/Web/API/Headers/entries): Returns an [`iterator`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols) allowing to go through all key/value pairs contained in this object.
-   [`Headers.forEach()`](https://developer.mozilla.org/docs/Web/API/Headers/forEach): Executes a provided function once for each key/value pair in this `Headers` object.
-   [`Headers.get()`](https://developer.mozilla.org/docs/Web/API/Headers/get): Returns a [`String`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) sequence of all the values of a header within a `Headers` object with a given name.
-   [`Headers.has()`](https://developer.mozilla.org/docs/Web/API/Headers/has): Returns a boolean stating whether a `Headers` object contains a certain header.
-   [`Headers.keys()`](https://developer.mozilla.org/docs/Web/API/Headers/keys): Returns an [`iterator`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols) allowing you to go through all keys of the key/value pairs contained in this object.
-   [`Headers.values()`](https://developer.mozilla.org/docs/Web/API/Headers/values): Returns an [`iterator`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols) allowing you to go through all values of the key/value pairs contained in this object.

## Good to know[](#good-to-know)

-   `headers` is an **asynchronous** function that returns a promise. You must use `async/await` or React's [`use`](https://react.dev/reference/react/use) function.
    -   In version 14 and earlier, `headers` was a synchronous function. To help with backwards compatibility, you can still access it synchronously in Next.js 15, but this behavior will be deprecated in the future.
-   Since `headers` is read-only, you cannot `set` or `delete` the outgoing request headers.
-   `headers` is a [Request-time API](https://nextjs.org/docs/app/glossary#request-time-apis) whose returned values cannot be known ahead of time. Using it in will opt a route into **[dynamic rendering](https://nextjs.org/docs/app/glossary#dynamic-rendering)**.

## Examples[](#examples)

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v15.0.0-RC` | `headers` is now an async function. A [codemod](https://nextjs.org/docs/app/guides/upgrading/codemods#150) is available. |
| `v13.0.0` | `headers` introduced. |

[Previous

generateViewport

](https://nextjs.org/docs/app/api-reference/functions/generate-viewport)[Next

ImageResponse

](https://nextjs.org/docs/app/api-reference/functions/image-response)
