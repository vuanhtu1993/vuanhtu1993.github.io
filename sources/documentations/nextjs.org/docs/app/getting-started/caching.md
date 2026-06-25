---
title: "Getting Started: Caching"
source_url: "https://nextjs.org/docs/app/getting-started/caching"
crawled_at: "2026-06-25T06:56:20.950Z"
---

Last updated

May 13, 2026

> This page covers caching with [Cache Components](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents), enabled by setting [`cacheComponents: true`](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents) in your `next.config.ts` file. If you're not using Cache Components, see the [Caching and Revalidating (Previous Model)](https://nextjs.org/docs/app/guides/caching-without-cache-components) guide.

Caching is a technique for storing the result of data fetching and other computations so that future requests for the same data can be served faster, without doing the work again.

## Enabling Cache Components[](#enabling-cache-components)

You can enable Cache Components by adding the [`cacheComponents`](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents) option to your Next config file:

> **Good to know:** When Cache Components is enabled, `GET` Route Handlers follow the same prerendering model as pages. See [Route Handlers with Cache Components](https://nextjs.org/docs/app/getting-started/route-handlers#with-cache-components) for details.

## Usage[](#usage)

The [`use cache`](https://nextjs.org/docs/app/api-reference/directives/use-cache) directive caches the return value of async functions and components. You can apply it at two levels:

-   **Data-level**: Cache a function that fetches or computes data (e.g., `getProducts()`, `getUser(id)`)
-   **UI-level**: Cache an entire component or page (e.g., `async function BlogPosts()`)

> Arguments and any closed-over values from parent scopes automatically become part of the [cache key](https://nextjs.org/docs/app/api-reference/directives/use-cache#cache-keys), which means different inputs will produce separate cache entries. This enables personalized or parameterized cached content. See [serialization requirements and constraints](https://nextjs.org/docs/app/api-reference/directives/use-cache#constraints) for details on what can be cached and how arguments work.

### Data-level caching[](#data-level-caching)

To cache an asynchronous function that fetches data, add the `use cache` directive at the top of the function body:

Data-level caching is useful when the same data is used across multiple components, or when you want to cache the data independently from the UI.

### UI-level caching[](#ui-level-caching)

To cache an entire component, page, or layout, add the `use cache` directive at the top of the component or page body:

> If you add "`use cache`" at the top of a file, all exported functions in the file will be cached.

### Streaming uncached data[](#streaming-uncached-data)

For components that fetch data from an asynchronous source such as an API, a database, or any other async operation, and require fresh data on every request, do not use `"use cache"`.

Instead, wrap the component in [`<Suspense>`](https://react.dev/reference/react/Suspense) and provide a fallback UI. At request time, React renders the fallback first, then streams in the resolved content once the async work completes.

The fallback (`<p>Loading posts...</p>`) is included in the static shell, while the component's content streams in at request time.

`<Suspense>` provides a fallback UI while async work completes, but it does not itself opt a component into dynamic rendering. If a component only performs synchronous work, it will complete during prerendering regardless of whether it is wrapped in `<Suspense>`.

## Working with runtime APIs[](#working-with-runtime-apis)

Runtime APIs require information that is only available when a user makes a request. These include:

-   [`cookies`](https://nextjs.org/docs/app/api-reference/functions/cookies) - User's cookie data
-   [`headers`](https://nextjs.org/docs/app/api-reference/functions/headers) - Request headers
-   [`searchParams`](https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional) - URL query parameters
-   [`params`](https://nextjs.org/docs/app/api-reference/file-conventions/page#params-optional) - Dynamic route parameters (unless at least one sample is provided via [`generateStaticParams`](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)).

Components that access runtime APIs should be wrapped in `<Suspense>`:

### Passing runtime values to cached functions[](#passing-runtime-values-to-cached-functions)

You can extract values from runtime APIs and pass them as arguments to cached functions:

At request time, `CachedContent` executes if no matching cache entry is found, and stores the result for future requests with the same `sessionId`.

By default, `use cache` stores entries [in-memory](https://nextjs.org/docs/app/api-reference/directives/use-cache#runtime-caching-considerations). In serverless environments where memory doesn't persist across requests, `CachedContent` may re-evaluate on every request. Consider [`'use cache: remote'`](https://nextjs.org/docs/app/api-reference/directives/use-cache-remote) for durable, shared caching.

## Working with non-deterministic operations[](#working-with-non-deterministic-operations)

Operations like `Math.random()`, `Date.now()`, or `crypto.randomUUID()` produce different values each time they execute. Cache Components requires you to explicitly handle these.

**To generate unique values per request**, defer to request time by calling [`connection()`](https://nextjs.org/docs/app/api-reference/functions/connection) before these operations, and wrap the component in `<Suspense>`:

Alternatively, you can **cache the result** so all users see the same value until revalidation:

## Working with deterministic operations[](#working-with-deterministic-operations)

Operations like synchronous I/O, module imports, and pure computations can complete during prerendering. Components using only these operations have their rendered output automatically included in the static HTML shell.

> **Good to know:** This includes queries to embedded databases with synchronous APIs, such as `better-sqlite3` or Node.js's built-in [`node:sqlite`](https://nodejs.org/api/sqlite.html). If you need per-request data from a synchronous source, call [`connection()`](https://nextjs.org/docs/app/api-reference/functions/connection) before the query.

## How rendering works[](#how-rendering-works)

At build time, Next.js renders your route's component tree. How each component is handled depends on the APIs it uses:

-   [`use cache`](#usage): the result is cached and included in the static shell
-   [`<Suspense>`](#streaming-uncached-data): fallback UI is included in the static shell while the content streams at request time
-   [Deterministic operations](#working-with-deterministic-operations): like pure computations and module imports are automatically included in the static shell

This generates a static shell consisting of HTML for initial page loads and a serialized [RSC Payload](https://nextjs.org/docs/app/getting-started/server-and-client-components#on-the-server) for client-side navigation, ensuring the browser receives fully rendered content instantly whether users navigate directly to the URL or transition from another page.

![Partially re-rendered Product Page showing static nav and product information, and dynamic cart and recommended products](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782370585/aha-mind/docs-crawler/nextjs.org/image_ewdt2a.png)![Partially re-rendered Product Page showing static nav and product information, and dynamic cart and recommended products](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782370585/aha-mind/docs-crawler/nextjs.org/image_ypagrx.png)

This rendering approach is called **Partial Prerendering (PPR)**, and it's the default behavior with Cache Components.

> You can verify that a route was fully prerendered by checking the [build output summary](https://nextjs.org/docs/app/api-reference/cli/next#next-build-options). Alternatively, see what content was added to the static shell of any page by viewing the page source in your browser.

![Diagram showing partially rendered page on the client, with loading UI for chunks that are being streamed.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782370585/aha-mind/docs-crawler/nextjs.org/image_uf95nw.png)![Diagram showing partially rendered page on the client, with loading UI for chunks that are being streamed.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782370585/aha-mind/docs-crawler/nextjs.org/image_q8ip7d.png)

Next.js requires you to explicitly handle components that can't complete during prerendering. If they aren't wrapped in `<Suspense>` or marked with `use cache`, you'll see an [`Uncached data was accessed outside of <Suspense>`](https://nextjs.org/docs/messages/blocking-route) error during development and build time.

> **🎥 Watch:** Why Partial Prerendering and how it works → [YouTube (10 minutes)](https://www.youtube.com/watch?v=MTcPrTIBkpA).

### Opting out of the static shell[](#opting-out-of-the-static-shell)

Placing a `<Suspense>` boundary with an empty fallback above the document body in your Root Layout causes the entire app to defer to request time. Because the fallback is empty, there is no static shell to send immediately, so every request blocks until the page is fully rendered. To limit this to specific routes, use [multiple root layouts](https://nextjs.org/docs/app/api-reference/file-conventions/layout#root-layout).

> **Good to know**: This same pattern applies when `generateViewport` accesses uncached dynamic data. See [Viewport with Cache Components](https://nextjs.org/docs/app/api-reference/functions/generate-viewport#with-cache-components) for a detailed example.

### Putting it all together[](#putting-it-all-together)

Here's a complete example showing static content, cached dynamic content, and streaming dynamic content working together on a single page:

During prerendering, the header (static) and blog posts (cached with `use cache`) become part of the static shell along with the fallback UI for user preferences. Only the personalized preferences stream in at request time. When an admin publishes a new post, the [`updateTag`](https://nextjs.org/docs/app/getting-started/revalidating#updatetag) call immediately expires the blog posts cache so the next visitor sees it.

> **Good to know:** `generateMetadata` and `generateViewport` track runtime data access separately from the page. See [Metadata with Cache Components](https://nextjs.org/docs/app/api-reference/functions/generate-metadata#with-cache-components) and [Viewport with Cache Components](https://nextjs.org/docs/app/api-reference/functions/generate-viewport#with-cache-components) for how to handle this.
