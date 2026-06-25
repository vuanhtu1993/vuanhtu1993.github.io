---
title: "Guides: Backend for Frontend"
source_url: "https://nextjs.org/docs/app/guides/backend-for-frontend"
crawled_at: "2026-06-25T06:57:51.702Z"
---

## How to use Next.js as a backend for your frontend

Last updated

June 23, 2026

Next.js supports the "Backend for Frontend" pattern. This lets you create public endpoints to handle HTTP requests and return any content type—not just HTML. You can also access data sources and perform side effects like updating remote data.

If you are starting a new project, using `create-next-app` with the `--api` flag automatically includes an example `route.ts` in your new project's `app/` folder, demonstrating how to create an API endpoint.

> **Good to know**: Next.js backend capabilities are not a full backend replacement. They serve as an API layer that:
> 
> -   is publicly reachable
> -   handles any HTTP request
> -   can return any content type

To implement this pattern, use:

-   [Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route)
-   [`proxy`](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)
-   In Pages Router, [API Routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes)

## Public Endpoints[](#public-endpoints)

Route Handlers are public HTTP endpoints. Any client can access them.

Create a Route Handler using the `route.ts` or `route.js` file convention:

This handles `GET` requests sent to `/api`.

Use `try/catch` blocks for operations that may throw an exception:

Avoid exposing sensitive information in error messages sent to the client.

To restrict access, implement authentication and authorization. See [Authentication](https://nextjs.org/docs/app/guides/authentication).

## Content types[](#content-types)

Route Handlers let you serve non-UI responses, including JSON, XML, images, files, and plain text.

Next.js uses file conventions for common endpoints:

-   [`sitemap.xml`](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
-   [`opengraph-image.jpg`, `twitter-image`](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image)
-   [favicon, app icon, and apple-icon](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons)
-   [`manifest.json`](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest)
-   [`robots.txt`](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots)

You can also define custom ones, such as:

-   `llms.txt`
-   `rss.xml`
-   `.well-known`

For example, `app/rss.xml/route.ts` creates a Route Handler for `rss.xml`.

Sanitize any input used to generate markup.

### Content negotiation[](#content-negotiation)

You can use [rewrites](https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites) with header matching to serve different content types from the same URL based on the request's `Accept` header. This is known as [content negotiation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation).

For example, a documentation site might serve HTML pages to browsers and raw Markdown to AI agents from the same `/docs/…` URLs.

**1\. Configure a rewrite that matches the `Accept` header:**

When a request to `/docs/getting-started` includes `Accept: text/markdown`, the rewrite routes it to `/docs/md/getting-started`. A Route Handler at that path returns the Markdown response. Clients that do not send `text/markdown` in their `Accept` header continue to receive the normal HTML page.

**2\. Create a Route Handler for the Markdown response:**

The [`Vary: Accept`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Vary) response header tells caches that the response body depends on the `Accept` request header. Without it, a shared cache could serve a cached Markdown response to a browser (or vice versa). Most hosting providers already include the `Accept` header in their cache key, but setting `Vary` explicitly ensures correct behavior across all CDNs and proxy caches.

`generateStaticParams` lets you pre-render the Markdown variants at build time so they can be served from the edge without hitting the origin server on every request.

**3\. Test it with `curl`:**

> **Good to know:**
> 
> -   The `/docs/md/...` route is still directly accessible without the rewrite. If you want to restrict it to only serve via the rewrite, use [`proxy`](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) to block direct requests that don't include the expected `Accept` header.
> -   For more advanced negotiation logic, you can use [`proxy`](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) instead of rewrites for more flexibility.

### Consuming request payloads[](#consuming-request-payloads)

Use Request [instance methods](https://developer.mozilla.org/en-US/docs/Web/API/Request#instance_methods) like `.json()`, `.formData()`, or `.text()` to access the request body.

`GET` and `HEAD` requests don’t carry a body.

> **Good to know**: Validate data before passing it to other systems

You can only read the request body once. Clone the request if you need to read it again:

## Manipulating data[](#manipulating-data)

Route Handlers can transform, filter, and aggregate data from one or more sources. This keeps logic out of the frontend and avoids exposing internal systems.

You can also offload heavy computations to the server and reduce client battery and data usage.

> **Good to know**: This example uses `POST` to avoid putting geo-location data in the URL. `GET` requests may be cached or logged, which could expose sensitive info.

## Proxying to a backend[](#proxying-to-a-backend)

You can use a Route Handler as a `proxy` to another backend. Add validation logic before forwarding the request.

Or use:

-   `proxy` [rewrites](#proxy)
-   [`rewrites`](https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites) in `next.config.js`.

## NextRequest and NextResponse[](#nextrequest-and-nextresponse)

Next.js extends the [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) and [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) Web APIs with methods that simplify common operations. These extensions are available in both Route Handlers and Proxy.

Both provide methods for reading and manipulating cookies.

`NextRequest` includes the [`nextUrl`](https://nextjs.org/docs/app/api-reference/functions/next-request#nexturl) property, which exposes parsed values from the incoming request, for example, it makes it easier to access request pathname and search params.

`NextResponse` provides helpers like `next()`, `json()`, `redirect()`, and `rewrite()`.

You can pass `NextRequest` to any function expecting `Request`. Likewise, you can return `NextResponse` where a `Response` is expected.

Learn more about [`NextRequest`](https://nextjs.org/docs/app/api-reference/functions/next-request) and [`NextResponse`](https://nextjs.org/docs/app/api-reference/functions/next-response).

## Webhooks and callback URLs[](#webhooks-and-callback-urls)

Use Route Handlers to receive event notifications from third-party applications.

For example, revalidate a route when content changes in a CMS. Configure the CMS to call a specific endpoint on changes.

Callback URLs are another use case. When a user completes a third-party flow, the third party sends them to a callback URL. Use a Route Handler to verify the response and decide where to redirect the user.

## Redirects[](#redirects)

Learn more about redirects in [`redirect`](https://nextjs.org/docs/app/api-reference/functions/redirect) and [`permanentRedirect`](https://nextjs.org/docs/app/api-reference/functions/permanentRedirect)

## Proxy[](#proxy)

Only one `proxy` file is allowed per project. Use `config.matcher` to target specific paths. Learn more about [`proxy`](https://nextjs.org/docs/app/api-reference/file-conventions/proxy).

Use `proxy` to generate a response before the request reaches a route path.

You can also proxy requests using `proxy`:

Another type of response `proxy` can produce are redirects:

## Security[](#security)

Be deliberate about where headers go, and avoid directly passing incoming request headers to the outgoing response.

-   **Upstream request headers**: In Proxy, `NextResponse.next({ request: { headers } })` modifies the headers your server receives and does not expose them to the client.
-   **Response headers**: `new Response(..., { headers })`, `NextResponse.json(..., { headers })`, `NextResponse.next({ headers })`, or `response.headers.set(...)` send headers back to the client. If sensitive values were appended to these headers, they will be visible to clients.

Learn more in [NextResponse headers in Proxy](https://nextjs.org/docs/app/api-reference/functions/next-response#next).

### Rate limiting[](#rate-limiting)

You can implement rate limiting in your Next.js backend. In addition to code-based checks, enable any rate limiting features provided by your host.

### Verify payloads[](#verify-payloads)

Never trust incoming request data. Validate content type and size, and sanitize against XSS before use.

Use timeouts to prevent abuse and protect server resources.

Store user-generated static assets in dedicated services. When possible, upload them from the browser and store the returned URI in your database to reduce request size.

### Access to protected resources[](#access-to-protected-resources)

Always verify credentials before granting access. Do not rely on proxy alone for authentication and authorization.

Remove sensitive or unnecessary data from responses and backend logs.

Rotate credentials and API keys regularly.

## Preflight Requests[](#preflight-requests)

Preflight requests use the `OPTIONS` method to ask the server if a request is allowed based on origin, method, and headers.

If `OPTIONS` is not defined, Next.js adds it automatically and sets the `Allow` header based on the other defined methods.

-   [CORS](https://nextjs.org/docs/app/api-reference/file-conventions/route#cors)

## Library patterns[](#library-patterns)

Community libraries often use the factory pattern for Route Handlers.

This creates a shared handler for `GET` and `POST` requests. The library customizes behavior based on the `method` and `pathname` in the request.

Libraries can also provide a `proxy` factory.

> **Good to know**: Third-party libraries may still refer to `proxy` as `middleware`.

## More examples[](#more-examples)

See more examples on using [Router Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route#examples) and the [`proxy`](https://nextjs.org/docs/app/api-reference/file-conventions/proxy#examples) API references.

These examples include, working with [Cookies](https://nextjs.org/docs/app/api-reference/file-conventions/route#cookies), [Headers](https://nextjs.org/docs/app/api-reference/file-conventions/route#headers), [Streaming](https://nextjs.org/docs/app/api-reference/file-conventions/route#streaming), Proxy [negative matching](https://nextjs.org/docs/app/api-reference/file-conventions/proxy#negative-matching), and other useful code snippets.

## Caveats[](#caveats)

### Server Components[](#server-components)

Fetch data in Server Components directly from its source, not via Route Handlers.

For Server Components prerendered at build time, using Route Handlers will fail the build step. This is because, while building there is no server listening for these requests.

For Server Components rendered on demand, fetching from Route Handlers is slower due to the extra HTTP round trip between the handler and the render process.

> A server side `fetch` request uses absolute URLs. This implies an HTTP round trip, to an external server. During development, your own development server acts as the external server. At build time there is no server, and at runtime, the server is available through your public facing domain.

Server Components cover most data-fetching needs. However, fetching data client side might be necessary for:

-   Data that depends on client-only Web APIs:
    -   Geo-location API
    -   Storage API
    -   Audio API
    -   File API
-   Frequently polled data

For these, use community libraries like [`swr`](https://swr.vercel.app/) or [`react-query`](https://tanstack.com/query/latest/docs/framework/react/overview).

### Server Actions[](#server-actions)

Server Actions let you run server-side code from the client. Their primary purpose is to mutate data from your frontend client.

Server Actions are queued. Using them for data fetching introduces sequential execution.

### `export` mode[](#export-mode)

`export` mode outputs a static site without a runtime server. Features that require the Next.js runtime are [not supported](https://nextjs.org/docs/app/guides/static-exports#unsupported-features), because this mode produces a static site, and no runtime server.

In `export mode`, only `GET` Route Handlers are supported, in combination with the [`dynamic`](https://nextjs.org/docs/app/guides/caching-without-cache-components#dynamic) route segment config, set to `'force-static'`.

This can be used to generate static HTML, JSON, TXT, or other files.

### Deployment environment[](#deployment-environment)

Some hosts deploy Route Handlers as lambda functions. This means:

-   Route Handlers cannot share data between requests.
-   The environment may not support writing to File System.
-   Long-running handlers may be terminated due to timeouts.
-   WebSockets won’t work because the connection closes on timeout, or after the response is generated.
