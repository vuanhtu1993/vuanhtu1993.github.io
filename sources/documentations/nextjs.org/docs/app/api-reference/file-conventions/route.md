---
title: "File-system conventions: route.js"
source_url: "https://nextjs.org/docs/app/api-reference/file-conventions/route"
crawled_at: "2026-06-25T07:06:32.644Z"
---

Last updated

March 3, 2026

Route Handlers allow you to create custom request handlers for a given route using the Web [Request](https://developer.mozilla.org/docs/Web/API/Request) and [Response](https://developer.mozilla.org/docs/Web/API/Response) APIs.

## Reference[](#reference)

### HTTP Methods[](#http-methods)

A **route** file allows you to create custom request handlers for a given route. The following [HTTP methods](https://developer.mozilla.org/docs/Web/HTTP/Methods) are supported: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, and `OPTIONS`.

### Parameters[](#parameters)

#### `request` (optional)[](#request-optional)

The `request` object is a [NextRequest](https://nextjs.org/docs/app/api-reference/functions/next-request) object, which is an extension of the Web [Request](https://developer.mozilla.org/docs/Web/API/Request) API. `NextRequest` gives you further control over the incoming request, including easily accessing `cookies` and an extended, parsed, URL object `nextUrl`.

#### `context` (optional)[](#context-optional)

-   **`params`**: a promise that resolves to an object containing the [dynamic route parameters](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes) for the current route.

| Example | URL | `params` |
| --- | --- | --- |
| `app/dashboard/[team]/route.js` | `/dashboard/1` | `Promise<{ team: '1' }>` |
| `app/shop/[tag]/[item]/route.js` | `/shop/1/2` | `Promise<{ tag: '1', item: '2' }>` |
| `app/blog/[...slug]/route.js` | `/blog/1/2` | `Promise<{ slug: ['1', '2'] }>` |

### Route Context Helper[](#route-context-helper)

You can type the Route Handler context using `RouteContext` to get strongly typed `params` from a route literal. `RouteContext` is a globally available helper.

> **Good to know**
> 
> -   Types are generated during `next dev`, `next build` or `next typegen`.
> -   After type generation, the `RouteContext` helper is globally available. It doesn't need to be imported.

## Examples[](#examples)

### Cookies[](#cookies)

You can read or set cookies with [`cookies`](https://nextjs.org/docs/app/api-reference/functions/cookies) from `next/headers`.

Alternatively, you can return a new `Response` using the [`Set-Cookie`](https://developer.mozilla.org/docs/Web/HTTP/Headers/Set-Cookie) header.

You can also use the underlying Web APIs to read cookies from the request ([`NextRequest`](https://nextjs.org/docs/app/api-reference/functions/next-request)):

You can read headers with [`headers`](https://nextjs.org/docs/app/api-reference/functions/headers) from `next/headers`.

This `headers` instance is read-only. To set headers, you need to return a new `Response` with new `headers`.

You can also use the underlying Web APIs to read headers from the request ([`NextRequest`](https://nextjs.org/docs/app/api-reference/functions/next-request)):

### Revalidating Cached Data[](#revalidating-cached-data)

You can [revalidate cached data](https://nextjs.org/docs/app/guides/incremental-static-regeneration) using the `revalidate` route segment config option.

### Redirects[](#redirects)

### Dynamic Route Segments[](#dynamic-route-segments)

Route Handlers can use [Dynamic Segments](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes) to create request handlers from dynamic data.

| Route | Example URL | `params` |
| --- | --- | --- |
| `app/items/[slug]/route.js` | `/items/a` | `Promise<{ slug: 'a' }>` |
| `app/items/[slug]/route.js` | `/items/b` | `Promise<{ slug: 'b' }>` |
| `app/items/[slug]/route.js` | `/items/c` | `Promise<{ slug: 'c' }>` |

#### Static Generation with `generateStaticParams`[](#static-generation-with-generatestaticparams)

You can use [`generateStaticParams`](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) with dynamic Route Handlers to statically generate responses at build time for specified params, while handling other params dynamically at request time.

When using [Cache Components](https://nextjs.org/docs/app/getting-started/caching), you can combine `generateStaticParams` with `use cache` to enable data caching for both prerendered and runtime params.

See the [generateStaticParams with Route Handlers](https://nextjs.org/docs/app/api-reference/functions/generate-static-params#with-route-handlers) documentation for examples and details.

### URL Query Parameters[](#url-query-parameters)

The request object passed to the Route Handler is a `NextRequest` instance, which includes [some additional convenience methods](https://nextjs.org/docs/app/api-reference/functions/next-request#nexturl), such as those for more easily handling query parameters.

### Streaming[](#streaming)

Streaming is commonly used in combination with Large Language Models (LLMs), such as OpenAI, for AI-generated content. Learn more about the [AI SDK](https://sdk.vercel.ai/docs/introduction).

These abstractions use the Web APIs to create a stream. You can also use the underlying Web APIs directly.

### Request Body[](#request-body)

You can read the `Request` body using the standard Web API methods:

### Request Body FormData[](#request-body-formdata)

You can read the `FormData` using the `request.formData()` function:

Since `formData` data are all strings, you may want to use [`zod-form-data`](https://www.npmjs.com/zod-form-data) to validate the request and retrieve data in the format you prefer (e.g. `number`).

### CORS[](#cors)

You can set CORS headers for a specific Route Handler using the standard Web API methods:

> **Good to know**:
> 
> -   To add CORS headers to multiple Route Handlers, you can use [Proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy#cors) or the [`next.config.js` file](https://nextjs.org/docs/app/api-reference/config/next-config-js/headers#cors).

### Webhooks[](#webhooks)

You can use a Route Handler to receive webhooks from third-party services:

Notably, unlike API Routes with the Pages Router, you do not need to use `bodyParser` to use any additional configuration.

### Non-UI Responses[](#non-ui-responses)

You can use Route Handlers to return non-UI content. Note that [`sitemap.xml`](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap#generating-a-sitemap-using-code-js-ts), [`robots.txt`](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots#generate-a-robots-file), [`app icons`](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons#generate-icons-using-code-js-ts-tsx), and [open graph images](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image) all have built-in support.

### Segment Config Options[](#segment-config-options)

Route Handlers use the same [route segment configuration](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config) as pages and layouts.

See the [API reference](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config) for more details.

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v15.0.0-RC` | `context.params` is now a promise. A [codemod](https://nextjs.org/docs/app/guides/upgrading/codemods#150) is available |
| `v15.0.0-RC` | The default caching for `GET` handlers was changed from static to dynamic |
| `v13.2.0` | Route Handlers are introduced. |
