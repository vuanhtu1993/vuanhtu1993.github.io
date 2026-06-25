---
title: "Guides: Streaming"
source_url: "https://nextjs.org/docs/app/guides/streaming"
crawled_at: "2026-06-25T07:02:20.992Z"
---

Last updated

June 23, 2026

## What is streaming?[](#what-is-streaming)

In traditional server-side rendering, the server produces the full HTML document before sending anything. A single slow database query or API call can block the entire page. Streaming changes this by using [chunked transfer encoding](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Transfer-Encoding) to send parts of the response as they become ready. The browser starts rendering HTML while the server is still generating the rest.

This is especially impactful for pages that combine fast static content (headers, navigation, layout) with slower dynamic content (personalized data, analytics, recommendations). The static parts can be prerendered and served from a CDN, painting instantly, while the dynamic parts stream in from the server as they become ready.

React's server renderer produces HTML in chunks aligned with `<Suspense>` boundaries. Next.js integrates this into the App Router so streaming works without additional configuration.

## Example[](#example)

The companion [streaming demo](https://streaming-demo.labs.vercel.dev/) ([source](https://github.com/vercel-labs/streaming-demo)) lets you see each concept from this guide in action:

-   Page-level streaming with `loading.tsx` (skeleton appears instantly, content streams in after ~2s)
-   Granular streaming with sibling `<Suspense>` boundaries that resolve independently
-   Hydration comparison: a single blocking pass vs split hydration with Suspense boundaries
-   Raw HTML streaming in a Route Handler, with early CSS discovery
-   A configurable `ReadableStream` API endpoint for experimenting with chunk sizes and browser buffering

## How the App Router delivers a page[](#how-the-app-router-delivers-a-page)

When a browser requests a page, two streams work together during the initial page load:

### The HTML stream[](#the-html-stream)

React's server renderer produces progressive HTML chunks. The static parts of your page (layouts, navigation, Suspense fallbacks) render first and are sent immediately. When an async [Server Component](https://nextjs.org/docs/app/glossary#server-component) resolves, React streams its completed HTML along with inline `<script>` tags: one that swaps the fallback DOM node with the new content, and another carrying the [component payload](#the-component-payload) so React can later hydrate it. The browser executes the swap instantly, without waiting for the page's JavaScript bundle to load or hydration to complete. This is what the user _sees_: the page painting progressively, section by section.

### The component payload[](#the-component-payload)

The component payload is a serialized representation of the component tree that React uses to [hydrate](https://nextjs.org/docs/app/glossary#hydration) the page and handle client-side updates. On initial load, it arrives embedded in the HTML stream (as described above). On **client-side navigation**, only the component payload is fetched (with an `rsc: 1` request header) and no HTML is transferred at all. React uses it to update the component tree in place.

### The static shell[](#the-static-shell)

Everything that renders before any async work resolves is called the **static shell**: your layouts, navigation, and the fallback UI defined by your `<Suspense>` boundaries. It is sent immediately, giving the user something to see and interact with while dynamic content streams in. With [Cache Components](https://nextjs.org/docs/app/getting-started/caching), the static shell is prerendered at build time and served instantly from the edge.

![How Server Rendering with Streaming Works](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782370945/aha-mind/docs-crawler/nextjs.org/image_qmjugq.png)![How Server Rendering with Streaming Works](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782370945/aha-mind/docs-crawler/nextjs.org/image_ljoq70.png)

Each `<Suspense>` boundary is an independent streaming point. Components inside different boundaries resolve and stream in independently. They don't block each other.

## Page-level streaming with `loading.js`[](#page-level-streaming-with-loadingjs)

The simplest way to add streaming is with a `loading.js` file. Place it alongside your `page.js` and Next.js automatically wraps the page content in a `<Suspense>` boundary, using your loading component as the fallback.

![loading.js special file](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782370945/aha-mind/docs-crawler/nextjs.org/image_viu2qi.png)![loading.js special file](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782370945/aha-mind/docs-crawler/nextjs.org/image_ql3pet.png)

Behind the scenes, `loading.js` is nested inside `layout.js` and wraps `page.js` in a `<Suspense>` boundary:

![loading.js overview](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782370945/aha-mind/docs-crawler/nextjs.org/image_pfdub0.png)![loading.js overview](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782370945/aha-mind/docs-crawler/nextjs.org/image_bi6zpa.png)

This means:

-   The layout renders immediately as part of the static shell.
-   The loading skeleton is shown instantly as the Suspense fallback.
-   When the page component finishes loading, its HTML replaces the skeleton.

`loading.js` is useful when there's nothing meaningful to show until the page's data resolves. If the page needs to await data before it can render anything, a full-page skeleton is a reasonable fallback.

See the [`loading.js` API reference](https://nextjs.org/docs/app/api-reference/file-conventions/loading) for more details.

## Granular streaming with `<Suspense>`[](#granular-streaming-with-suspense)

`<Suspense>` lets you control exactly which parts of the page stream independently. Instead of a full-page skeleton, you can push fallbacks down into specific sections so the static shell includes more real content.

### Parallel streaming with sibling boundaries[](#parallel-streaming-with-sibling-boundaries)

When multiple components perform async work (fetching data, reading from a database), wrap each one in its own `<Suspense>` boundary. Each boundary streams independently as its async work completes, in whatever order that happens, without blocking each other:

In this example, if `Revenue` resolves in 200ms, `RecentOrders` in 1s, and `Recommendations` in 3s, the user sees each section appear as soon as its data is ready.

### Nested boundaries for progressive detail[](#nested-boundaries-for-progressive-detail)

You can nest `<Suspense>` boundaries to create a layered loading experience. For example, a product page might stream the header immediately, the product details next, and the reviews last:

The outer boundary shows "Loading product details..." until `ProductDetails` resolves. Once it does, the inner boundary becomes visible, showing "Loading reviews..." until `Reviews` resolves. This creates a progressive reveal.

### Push dynamic access down[](#push-dynamic-access-down)

The key to maximizing what streams instantly is to defer dynamic data access to the component that actually needs it. This applies to `params`, `searchParams`, `cookies()`, `headers()`, and data fetches. If you `await` any of these at the top of a layout or page, everything below that point becomes dynamic and cannot be prerendered as part of the static shell.

Instead, pass the promise down and let the consuming component resolve it inside a `<Suspense>` boundary:

In this example, `<Nav>` and `{children}` render as part of the static shell because nothing in the layout awaits. Only `<UserMenu>` suspends when it resolves the cookie promise. If the layout had called `await cookies()` at the top instead, the entire layout and all its children would be blocked from prerendering.

The same principle applies to `params` and `searchParams`. Rather than destructuring them at the page level, pass the promise to the component that needs the value:

`<Hero />` paints as part of the static shell. `<ProductGrid>` resolves `params` when it needs the category, suspending only within its boundary.

You can also unwrap the promise inline with `.then()`, so the child component receives a plain value instead of a promise:

This keeps `ProductGrid` simple (it takes a `string`, not a `Promise`) while still deferring the `params` access to inside the Suspense boundary.

### When to use `loading.js` vs `<Suspense>`[](#when-to-use-loadingjs-vs-suspense)

|  | `loading.js` | `<Suspense>` |
| --- | --- | --- |
| **Scope** | Entire page | Any component |
| **Setup** | Drop in a file | Wrap components explicitly |
| **Navigation** | Prefetched as instant fallback | Not prefetched by default |
| **Best for** | Pages where nothing renders without data | Most pages, for granular control |

Prefer explicit `<Suspense>` boundaries close to the dynamic access. When the prerenderer encounters dynamic work, it walks up the tree looking for the nearest Suspense boundary. If none is found, the build fails with a [blocking route error](https://nextjs.org/docs/messages/blocking-route). A `loading.js` high in the tree is a valid boundary, so the framework finds it and stops, but now the entire page falls back to a full-page skeleton instead of streaming granularly.

### Error handling mid-stream[](#error-handling-mid-stream)

If a component throws an error after streaming has started, the nearest [`error.js`](https://nextjs.org/docs/app/api-reference/file-conventions/error) boundary catches it and renders the error UI in place of the failed component. The rest of the page remains intact, only the section that errored is replaced.

Because the HTTP status code (`200 OK`) has already been sent with the first chunk, it cannot be changed to a `4xx` or `5xx`. The error is handled entirely within the streamed HTML. See [The HTTP contract](#the-http-contract) for more on this constraint.

## Streaming data to the client[](#streaming-data-to-the-client)

You can start a fetch in a [Server Component](https://nextjs.org/docs/app/glossary#server-component) and pass the unresolved promise as a prop to a [Client Component](https://nextjs.org/docs/app/glossary#client-component). The promise can be passed through as many layers as needed. Only the component that calls React's [`use`](https://react.dev/reference/react/use) API to read the value needs a `<Suspense>` boundary around it:

The fallback is sent immediately with the static shell. When the promise resolves, React streams the completed HTML into the page.

### Sharing a promise across the tree[](#sharing-a-promise-across-the-tree)

When multiple components need the same data, start the fetch once and pass the promise through a context provider so any component in the subtree can resolve it with `use()`:

See [Sharing data with context and React.cache](https://nextjs.org/docs/app/getting-started/fetching-data#sharing-data-with-context-and-reactcache) for the full pattern including the provider and consumer components.

## Streaming in Route Handlers[](#streaming-in-route-handlers)

The patterns above rely on React and Suspense to stream UI. Outside of React rendering, [Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route) can stream raw responses using the Web Streams API. This is useful for Server-Sent Events, large file generation, or any response where you want data to arrive progressively:

Visit this route directly in the browser or with `curl` to see chunks arrive one at a time:

You can also stream files without loading them entirely into memory. Use `FileHandle.readableWebStream()` to get a Web `ReadableStream` directly from a file:

See the [Route Handler API reference](https://nextjs.org/docs/app/api-reference/file-conventions/route) for more details on building streaming endpoints.

## Streaming and Web Vitals[](#streaming-and-web-vitals)

[Web Vitals](https://web.dev/articles/vitals) are the metrics Google uses to measure user experience. Streaming directly affects several of them.

### TTFB and FCP[](#ttfb-and-fcp)

Without streaming, the server waits for all data before sending any HTML, so TTFB equals the slowest query. With streaming, the server sends the static shell as soon as it's ready. TTFB drops to the time it takes to render your layouts and fallbacks. The browser paints the static shell immediately, so FCP is decoupled from your data fetching time.

### LCP (Largest Contentful Paint)[](#lcp-largest-contentful-paint)

If your LCP element (a hero image, a main heading, a product photo) is inside a Suspense boundary, it can't paint until that boundary resolves. To keep LCP fast:

-   Keep LCP elements **outside** or **above** Suspense boundaries so they render as part of the static shell.
-   Use the [`preload`](https://nextjs.org/docs/app/api-reference/components/image#preload) prop on `next/image` for LCP images. This injects a `<link rel="preload">` into the `<head>`, so the browser starts fetching the image from the very first chunk, before the `<img>` tag even appears in the HTML.
-   For non-image LCP elements (text, headings), make sure they are not wrapped in a Suspense boundary that depends on slow data.

### CLS (Cumulative Layout Shift)[](#cls-cumulative-layout-shift)

When a Suspense fallback is replaced by the resolved content, the browser reflows the page. If the fallback and the resolved content are different sizes, the surrounding layout shifts. To minimize CLS:

-   Design skeleton fallbacks that **match the dimensions** of the content they represent. A skeleton with the same height and width as the final card grid prevents shifts.
-   Use fixed or min-height containers around Suspense boundaries so the space is reserved before content arrives.

### INP (Interaction to Next Paint)[](#inp-interaction-to-next-paint)

Streaming enables [selective hydration](https://react.dev/reference/react-dom/client/hydrateRoot): React hydrates components independently as they stream in, and prioritizes hydrating whatever the user is interacting with. Each `<Suspense>` boundary is a hydration unit. Without them, React hydrates the entire page in one blocking pass. With them, hydration is broken into smaller tasks that yield to the browser, keeping the main thread responsive. The [companion demo](https://streaming-demo.labs.vercel.dev/hydration-single) lets you compare a single blocking hydration pass with [split hydration](https://streaming-demo.labs.vercel.dev/hydration-split) using Suspense boundaries.

### Early resource discovery[](#early-resource-discovery)

The static shell includes `<link>` and `<script>` tags in the very first HTML chunk. The browser discovers and starts fetching CSS, JavaScript, and fonts immediately, while the server is still generating content. Resources are fetched during server think time rather than after it.

In the [dashboard example](#parallel-streaming-with-sibling-boundaries) above, the `<h1>` renders in the shell (good for LCP), each data section streams independently behind its own Suspense boundary (good for INP since hydration is split), and the skeleton fallbacks reserve space (good for CLS).

## The HTTP contract[](#the-http-contract)

Once streaming begins, the HTTP response headers (including the status code) have already been sent to the client. **You cannot change the status code or headers after streaming starts.** Everything in this section flows from this fundamental constraint.

### Status codes[](#status-codes)

When a `<Suspense>` fallback renders or a component suspends, the server must commit to `200 OK` in order to start sending the HTML stream. If a [`notFound()`](https://nextjs.org/docs/app/api-reference/functions/not-found) fires mid-stream, Next.js cannot go back and change the status to 404. Instead, it injects `<meta name="robots" content="noindex">` into the streamed HTML so that search engines don't index the page. Similarly, a [`redirect()`](https://nextjs.org/docs/app/api-reference/functions/redirect) mid-stream becomes a client-side redirect rather than an HTTP redirect header.

### When does streaming start?[](#when-does-streaming-start)

The response body begins streaming when a Suspense fallback renders (for example, a `loading.tsx`) or when a component suspends under a `<Suspense>` boundary. To get a real HTTP status code for errors, place `notFound()` **before** any `await` or `<Suspense>` boundary:

> **Good to know:** You can also reject requests early using [`proxy`](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) (for redirects, rewrites, or returning a response) or [`next.config.js` redirects](https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects). Both run before the page renders, so HTTP status codes are still available.

### Metadata and bots[](#metadata-and-bots)

[`generateMetadata`](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) resolves before streaming begins for bots that only scrape static HTML (such as Twitterbot or Slackbot). For full browsers and capable crawlers, metadata can [stream](https://nextjs.org/docs/app/api-reference/functions/generate-metadata#streaming-metadata) alongside the page content.

Next.js automatically detects user agents to choose the right behavior. You can customize which bots receive blocking metadata with the [`htmlLimitedBots`](https://nextjs.org/docs/app/api-reference/config/next-config-js/htmlLimitedBots) configuration option.

See the [`loading.js` SEO section](https://nextjs.org/docs/app/api-reference/file-conventions/loading#seo) for more details.

## What can affect streaming[](#what-can-affect-streaming)

Any layer between your server and the client that buffers the response can diminish the benefits of streaming. The HTML may be fully generated progressively on the server, but if a proxy, CDN, or even the client itself collects all the chunks before rendering them, the user sees a single delayed response instead of progressive rendering.

### Reverse proxies[](#reverse-proxies)

Nginx and similar reverse proxies buffer responses by default. Disable buffering by setting the `X-Accel-Buffering` header to `no`:

### CDNs[](#cdns)

Content Delivery Networks may buffer entire responses before forwarding them to the client. Check your CDN provider's documentation for streaming support. Some require specific configuration or plan tiers to pass through chunked responses.

### Serverless platforms[](#serverless-platforms)

Not all serverless environments support streaming. AWS Lambda, for example, requires [response streaming mode](https://docs.aws.amazon.com/lambda/latest/dg/configuration-response-streaming.html) to be explicitly enabled (it is not the default). Vercel supports streaming natively.

### Compression[](#compression)

Gzip and Brotli compression can buffer chunks internally before flushing, as the compression algorithm needs enough data to compress efficiently. This can add latency to the first visible chunk. If you notice streaming delays, check whether your compression layer is flushing aggressively enough.

### Clients[](#clients)

Buffering also happens at the client. [Safari/WebKit](https://bugs.webkit.org/show_bug.cgi?id=252413) buffers streaming responses until 1024 bytes have been received, so very small responses paint all at once instead of progressively. Real applications easily exceed this threshold (layouts, styles, scripts), so it only affects minimal demos or tiny Route Handler responses.

Command-line tools like `curl` also buffer by default. The `-N` flag disables output buffering, but `curl` still relies on newline characters to flush lines to the terminal. A stream that sends chunks without newlines may appear to stall even with `-N`.

### Verifying that streaming works[](#verifying-that-streaming-works)

This section is about confirming the HTTP response is actually arriving in chunks through your infrastructure. For guidance on designing meaningful loading states and placing Suspense boundaries effectively, see [Granular streaming with `<Suspense>`](#granular-streaming-with-suspense) and the [Cache Components](https://nextjs.org/docs/app/getting-started/caching) guide.

**Check the Network tab.** In Chrome DevTools, select the document request and look at the "Timing" breakdown. A long "Content Download" phase with an early "Time to First Byte" confirms the response is streaming rather than arriving all at once.

**Observe raw chunks.** To see exactly what the server sends and when, use a small script that reads the response as a stream. This is more reliable than `curl` for observing timed chunks, since `curl` has its own buffering behavior:

Run with `node stream-observer.mjs`. For a page with two sibling Suspense boundaries (like the [companion demo's Suspense page](https://streaming-demo.labs.vercel.dev/suspense-demo)), you will see output similar to:

The `<template id="B:0">` markers are the Suspense fallback placeholders. When a boundary resolves, React streams a `<div hidden id="S:0">` containing the completed HTML and a script that swaps it into the page. The timestamps show each boundary resolving independently.

> **Good to know:** The `Accept-Encoding: identity` header disables compression so chunks are not buffered by the compression layer.

### Platform support[](#platform-support)

| Deployment Option | Supported |
| --- | --- |
| [Node.js server](https://nextjs.org/docs/app/getting-started/deploying#nodejs-server) | Yes |
| [Docker container](https://nextjs.org/docs/app/getting-started/deploying#docker) | Yes |
| [Static export](https://nextjs.org/docs/app/getting-started/deploying#static-export) | No |
| [Adapters](https://nextjs.org/docs/app/getting-started/deploying#adapters) | Platform-specific |

See the [Self-Hosting guide](https://nextjs.org/docs/app/guides/self-hosting#streaming-and-suspense) for detailed configuration instructions.

## Summary[](#summary)

The trigger is **your code**: async work, non-deterministic output, or runtime data. When the framework encounters these, it walks up the tree looking for a `<Suspense>` boundary to use as a fallback. Everything above those boundaries forms the [static shell](#the-static-shell), which is sent immediately. As each boundary resolves, React streams the result into the page.

The key decisions are **what to cache** and **where to place Suspense boundaries**. Cache what you can with [`"use cache"`](https://nextjs.org/docs/app/api-reference/directives/use-cache) to grow the static shell. Push dynamic access down to the components that need it, and wrap those in `<Suspense>`. Everything else becomes part of the shell.

## Further reading[](#further-reading)

-   [RSC Explorer](https://rscexplorer.dev/) - interactive tool to explore the component payload format and see how React reconstructs the tree from streamed chunks
-   [Streams API on web.dev](https://web.dev/articles/streams) - introduction to the Web Streams API that underpins streaming in Route Handlers
-   [Chunked transfer encoding (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Transfer-Encoding) - the HTTP/1.1 mechanism that enables streaming responses
-   [browser.engineering](https://browser.engineering/) - deep dive into how browsers handle network responses, rendering, and progressive display
-   [Preventing flash before hydration](https://nextjs.org/docs/app/guides/preventing-flash-before-hydration) - how to update server-rendered HTML with client-specific values (locale, theme, persisted state) before the browser paints
