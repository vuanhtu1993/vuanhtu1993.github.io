---
title: "Functions: after"
source_url: "https://nextjs.org/docs/app/api-reference/functions/after"
crawled_at: "2026-06-25T07:08:09.358Z"
---

Last updated

March 13, 2026

`after` allows you to schedule work to be executed after a response (or prerender) is finished. This is useful for tasks and other side effects that should not block the response, such as logging and analytics.

It can be used in [Server Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) (including [`generateMetadata`](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)), [Server Functions](https://nextjs.org/docs/app/getting-started/mutating-data), [Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route), and [Proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy).

The function accepts a callback that will be executed after the response (or prerender) is finished:

> **Good to know:** `after` is not a [Request-time API](https://nextjs.org/docs/app/glossary#request-time-apis) and calling it does not cause a route to become dynamic. If it's used within a static page, the callback will execute at build time, or whenever a page is revalidated.

## Reference[](#reference)

### Parameters[](#parameters)

-   A callback function which will be executed after the response (or prerender) is finished.

### Duration[](#duration)

`after` will run for the platform's default or configured max duration of your route. If your platform supports it, you can configure the timeout limit using the [`maxDuration`](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/maxDuration) route segment config.

## Good to know[](#good-to-know)

-   `after` will be executed even if the response didn't complete successfully. Including when an error is thrown or when `notFound` or `redirect` is called.
-   You can use React `cache` to deduplicate functions called inside `after`.
-   `after` can be nested inside other `after` calls, for example, you can create utility functions that wrap `after` calls to add additional functionality.

## Examples[](#examples)

### With request APIs[](#with-request-apis)

Whether you can use request APIs like [`cookies`](https://nextjs.org/docs/app/api-reference/functions/cookies) and [`headers`](https://nextjs.org/docs/app/api-reference/functions/headers) inside `after` depends on where `after` is called from.

#### In Route Handlers and Server Functions[](#in-route-handlers-and-server-functions)

You can call `cookies` and `headers` directly inside the `after` callback when used in [Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route) and [Server Functions](https://nextjs.org/docs/app/getting-started/mutating-data). This is useful for logging activity after a mutation or API request. For example:

#### In Server Components (pages and layouts)[](#in-server-components-pages-and-layouts)

[Server Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) (including pages, layouts, and `generateMetadata`) **cannot** use `cookies`, `headers`, or other Request-time APIs inside `after`. This is because Next.js needs to know which part of the component tree accesses request data to support [Partial Prerendering](https://nextjs.org/docs/app/glossary#partial-prerendering-ppr) and [Cache Components](https://nextjs.org/docs/app/getting-started/caching), but `after` runs after React's rendering lifecycle.

If you need request data inside an `after` callback in a Server Component, read it beforehand and pass the values in:

Calling `cookies()` or `headers()` inside the `after` callback in a Server Component will throw a runtime error.

#### With Cache Components[](#with-cache-components)

When using [Cache Components](https://nextjs.org/docs/app/getting-started/caching), components that access request data like `cookies` or `headers` must be wrapped in [`<Suspense>`](https://react.dev/reference/react/Suspense) so the rest of the page can be prerendered into a static shell.

You can combine this pattern with `after` by reading request data in a dynamic component and passing it into `after`:

In this example, `<h1>` and the `<Suspense>` fallback are included in the static shell. `DynamicContent` reads the cookie during rendering and passes it into `after` via closure. Since `cookies()` is called _outside_ the `after` callback (during the component's render), this works correctly.

## Platform Support[](#platform-support)

| Deployment Option | Supported |
| --- | --- |
| [Node.js server](https://nextjs.org/docs/app/getting-started/deploying#nodejs-server) | Yes |
| [Docker container](https://nextjs.org/docs/app/getting-started/deploying#docker) | Yes |
| [Static export](https://nextjs.org/docs/app/getting-started/deploying#static-export) | No |
| [Adapters](https://nextjs.org/docs/app/getting-started/deploying#adapters) | Platform-specific |

Learn how to [configure `after`](https://nextjs.org/docs/app/guides/self-hosting#after) when self-hosting Next.js.

Reference: supporting `after` for serverless platforms

Using `after` in a serverless context requires waiting for asynchronous tasks to finish after the response has been sent. In Next.js and Vercel, this is achieved using a primitive called `waitUntil(promise)`, which extends the lifetime of a serverless invocation until all promises passed to [`waitUntil`](https://vercel.com/docs/functions/functions-api-reference#waituntil) have settled.

If you want your users to be able to run `after`, you will have to provide your implementation of `waitUntil` that behaves in an analogous way.

When `after` is called, Next.js will access `waitUntil` like this:

Which means that `globalThis[Symbol.for('@next/request-context')]` is expected to contain an object like this:

Here is an example of the implementation.

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v15.1.0` | `after` became stable. |
| `v15.0.0-rc` | `unstable_after` introduced. |
