---
title: "Guides: Self-Hosting"
source_url: "https://nextjs.org/docs/app/guides/self-hosting"
crawled_at: "2026-06-25T07:01:57.071Z"
---

## How to self-host your Next.js application

Last updated

March 25, 2026

When [deploying](https://nextjs.org/docs/app/getting-started/deploying) your Next.js app, you may want to configure how different features are handled based on your infrastructure.

> **🎥 Watch:** Learn more about self-hosting Next.js → [YouTube (45 minutes)](https://www.youtube.com/watch?v=sIVL4JMqRfc).

## Reverse Proxy[](#reverse-proxy)

When self-hosting, it's recommended to use a reverse proxy (like nginx) in front of your Next.js server rather than exposing it directly to the internet. A reverse proxy can handle malformed requests, slow connection attacks, payload size limits, rate limiting, and other security concerns, offloading these tasks from the Next.js server. This allows the server to dedicate its resources to rendering rather than request validation.

## Image Optimization[](#image-optimization)

[Image Optimization](https://nextjs.org/docs/app/api-reference/components/image) through `next/image` works self-hosted with zero configuration when deploying using `next start`. If you would prefer to have a separate service to optimize images, you can [configure an image loader](https://nextjs.org/docs/app/api-reference/components/image#loader).

Image Optimization can be used with a [static export](https://nextjs.org/docs/app/guides/static-exports#image-optimization) by defining a custom image loader in `next.config.js`. Note that images are optimized at runtime, not during the build.

> **Good to know:**
> 
> -   On glibc-based Linux systems, Image Optimization may require [additional configuration](https://sharp.pixelplumbing.com/install#linux-memory-allocator) to prevent excessive memory usage.
> -   Learn more about the [caching behavior of optimized images](https://nextjs.org/docs/app/api-reference/components/image#minimumcachettl) and how to configure the TTL.
> -   You can also [disable Image Optimization](https://nextjs.org/docs/app/api-reference/components/image#unoptimized) and still retain other benefits of using `next/image` if you prefer. For example, if you are optimizing images yourself separately.

## Proxy[](#proxy)

[Proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) works self-hosted with zero configuration when deploying using `next start`. Since it requires access to the incoming request, it is not supported when using a [static export](https://nextjs.org/docs/app/guides/static-exports).

Proxy uses the [Edge runtime](https://nextjs.org/docs/app/api-reference/edge), a subset of all available Node.js APIs to help ensure low latency, since it may run in front of every route or asset in your application. If you do not want this, you can use the [full Node.js runtime](https://nextjs.org/blog/next-15-2#nodejs-middleware-experimental) to run Proxy.

If you are looking to add logic (or use an external package) that requires all Node.js APIs, you might be able to move this logic to a [layout](https://nextjs.org/docs/app/api-reference/file-conventions/layout) as a [Server Component](https://nextjs.org/docs/app/getting-started/server-and-client-components). For example, checking [headers](https://nextjs.org/docs/app/api-reference/functions/headers) and [redirecting](https://nextjs.org/docs/app/api-reference/functions/redirect). You can also use headers, cookies, or query parameters to [redirect](https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects#header-cookie-and-query-matching) or [rewrite](https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites#header-cookie-and-query-matching) through `next.config.js`. If that does not work, you can also use a [custom server](https://nextjs.org/docs/pages/guides/custom-server).

## Environment Variables[](#environment-variables)

Next.js can support both build time and runtime environment variables.

**By default, environment variables are only available on the server**. To expose an environment variable to the browser, it must be prefixed with `NEXT_PUBLIC_`. However, these public environment variables will be inlined into the JavaScript bundle during `next build`.

You safely read environment variables on the server during dynamic rendering.

This allows you to use a singular Docker image that can be promoted through multiple environments with different values.

> **Good to know:**
> 
> -   You can run code on server startup using the [`register` function](https://nextjs.org/docs/app/guides/instrumentation).

## Caching and ISR[](#caching-and-isr)

Next.js can cache responses, generated static pages, build outputs, and other static assets like images, fonts, and scripts.

Caching and revalidating pages (with [Incremental Static Regeneration](https://nextjs.org/docs/app/guides/incremental-static-regeneration)) use the **same Next.js server cache**. By default, this cache is stored on the local filesystem (on disk) of each Next.js server instance.

This works automatically for a single self-hosted `next start` instance with persistent local disk. If you run multiple instances, use ephemeral compute, or place a CDN/reverse proxy in front of Next.js, also review [Configuring Caching](#configuring-caching), [Multi-Instance Cache Coordination](#multi-instance-cache-coordination), and [Usage with CDNs](#usage-with-cdns).

You can configure the Next.js cache location if you want to persist cached pages and data to durable storage, or share the cache across multiple containers or instances of your Next.js application.

### Automatic Caching[](#automatic-caching)

-   Next.js sets the `Cache-Control` header of `public, max-age=31536000, immutable` to truly immutable assets. It cannot be overridden. These immutable files contain a SHA-hash in the file name, so they can be safely cached indefinitely. For example, [Static Image Imports](https://nextjs.org/docs/app/getting-started/images#local-images). You can [configure the TTL](https://nextjs.org/docs/app/api-reference/components/image#minimumcachettl) for images.
-   Incremental Static Regeneration (ISR) sets the `Cache-Control` header of `s-maxage: <revalidate in getStaticProps>, stale-while-revalidate`. This revalidation time is defined in your [`getStaticProps` function](https://nextjs.org/docs/pages/building-your-application/data-fetching/get-static-props) in seconds. If you set `revalidate: false`, it will default to a one-year cache duration. To leverage this at the CDN layer, your CDN/reverse proxy must respect these directives and cache-key variability ([CDN Caching](https://nextjs.org/docs/app/guides/cdn-caching)); otherwise, responses may bypass CDN caching or serve stale/mismatched variants during client-side navigation.
-   Dynamically rendered pages set a `Cache-Control` header of `private, no-cache, no-store, max-age=0, must-revalidate` to prevent user-specific data from being cached. This applies to both the App Router and Pages Router. This also includes [Draft Mode](https://nextjs.org/docs/app/guides/draft-mode).

### Static Assets[](#static-assets)

If you want to host static assets on a different domain or CDN, you can use the `assetPrefix` [configuration](https://nextjs.org/docs/app/api-reference/config/next-config-js/assetPrefix) in `next.config.js`. Next.js will use this asset prefix when retrieving JavaScript or CSS files. Separating your assets to a different domain does come with the downside of extra time spent on DNS and TLS resolution.

[Learn more about `assetPrefix`](https://nextjs.org/docs/app/api-reference/config/next-config-js/assetPrefix).

### Configuring Caching[](#configuring-caching)

By default, generated cache assets will be stored in memory (defaults to 50mb) and on disk. On ephemeral compute platforms (common serverless setups), local disk is often non-persistent or unavailable, so this cache is effectively short-lived and per-instance. If you are hosting Next.js using a container orchestration platform like Kubernetes, each pod will have a copy of the cache. To prevent stale data from being shown since the cache is not shared between pods by default, you can configure the Next.js cache to provide a cache handler and disable in-memory caching.

To configure the cache location when self-hosting, you can configure a custom handler in your `next.config.js` file:

For production deployments, use this as a starting point and extend it with durable storage, eviction policies, error handling, and distributed tag coordination. See [Custom Next.js Cache Handler](https://nextjs.org/docs/app/api-reference/config/next-config-js/incrementalCacheHandlerPath) and the [Redis `cacheHandler` example](https://github.com/vercel/next.js/tree/canary/examples/cache-handler-redis). If you are configuring backends for `'use cache'` directives, use [`cacheHandlers`](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheHandlers).

Then, create `cache-handler.js` in the root of your project, for example:

Using a custom cache handler will allow you to ensure consistency across all pods hosting your Next.js application. For instance, you can save the cached values anywhere, like [Redis](https://github.com/vercel/next.js/tree/canary/examples/cache-handler-redis) or AWS S3.

> **Good to know:**
> 
> -   `revalidatePath` is a convenience layer on top of cache tags. Calling `revalidatePath` will call the `revalidateTag` function with a special default tag for the provided page.

## Build Cache[](#build-cache)

Next.js generates an ID during `next build` to identify which version of your application is being served. The same build should be used and boot up multiple containers.

If you are rebuilding for each stage of your environment, you will need to generate a consistent build ID to use between containers. Use the `generateBuildId` command in `next.config.js`:

## Multi-Server Deployments[](#multi-server-deployments)

When running Next.js across multiple server instances (for example, containers behind a load balancer), there are additional considerations to ensure consistent behavior.

### Server Functions encryption key[](#server-functions-encryption-key)

Next.js encrypts [Server Function](https://nextjs.org/docs/app/getting-started/mutating-data) closure variables before sending them to the client. By default, a unique encryption key is generated for each build.

When running multiple server instances, all instances must use the same encryption key. Otherwise, a Server Function encrypted by one instance cannot be decrypted by another, causing "Failed to find Server Action" errors.

Set a consistent encryption key using the `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` environment variable. The key must be a base64-encoded value with a valid AES key length (16, 24, or 32 bytes). Next.js generates 32-byte keys by default.

The key is embedded in the build output and used automatically at runtime. Learn more in the [Data Security guide](https://nextjs.org/docs/app/guides/data-security#overwriting-encryption-keys-advanced).

### Deployment identifier[](#deployment-identifier)

Configure a [`deploymentId`](https://nextjs.org/docs/app/api-reference/config/next-config-js/deploymentId) to enable version skew protection during rolling deployments. This ensures clients always receive assets from a consistent deployment version.

### Shared cache[](#shared-cache)

By default, Next.js uses an in-memory cache that is not shared across instances. For consistent caching behavior, use [`'use cache: remote'`](https://nextjs.org/docs/app/api-reference/directives/use-cache-remote) with a [custom cache handler](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheHandlers) that stores data in external storage.

## Version Skew[](#version-skew)

When self-hosting across multiple instances or doing rolling deployments, [version skew](https://nextjs.org/docs/app/glossary#version-skew) can cause:

-   **Missing assets**: The client requests JavaScript or CSS files that no longer exist on the server
-   **Server Function mismatches**: The client invokes a Server Function using an ID from a previous build that the server no longer recognizes
-   **Navigation failures**: Prefetched page data from an old deployment is incompatible with the new server

Next.js uses the [`deploymentId`](https://nextjs.org/docs/app/api-reference/config/next-config-js/deploymentId) to detect and handle version skew. When a deployment ID is configured:

-   Static assets include a `?dpl=<deploymentId>` query parameter
-   Client-side navigation requests include an `x-deployment-id` header
-   The server compares the client's deployment ID with its own

If a mismatch is detected, Next.js triggers a hard navigation (full page reload) instead of a client-side navigation. This ensures the client fetches assets from a consistent deployment version.

> **Good to know:** When the application is reloaded, there may be a loss of application state if it's not designed to persist between page navigations. URL state or local storage would persist, but component state like `useState` would be lost.

## Streaming and Suspense[](#streaming-and-suspense)

The Next.js App Router supports [streaming responses](https://nextjs.org/docs/app/api-reference/file-conventions/loading) when self-hosting. If you are using nginx or a similar proxy, you will need to configure it to disable buffering to enable streaming.

For example, you can disable buffering in nginx by setting `X-Accel-Buffering` to `no`:

Beyond nginx, ensure that your entire infrastructure supports streaming end-to-end:

-   **Load balancers** must support chunked transfer encoding or HTTP/2 streaming. Some cloud load balancers (for example, AWS ALB with Lambda integration) may buffer responses by default.
-   **Reverse proxies** between the load balancer and Next.js must also pass through chunked responses without buffering.
-   If using [Partial Prerendering](https://nextjs.org/docs/app/guides/ppr-platform-guide), streaming support is required. Without it, the static shell and dynamic content are delivered together after the full render completes, eliminating PPR's time-to-first-byte advantage.

## Multi-Instance Cache Coordination[](#multi-instance-cache-coordination)

In addition to the [multi-server configuration](https://nextjs.org/docs/app/guides/self-hosting#multi-server-deployments) above (encryption key, deployment ID, shared cache), App Router deployments with multiple instances need cache tag coordination.

By default, calling [`revalidateTag()`](https://nextjs.org/docs/app/api-reference/functions/revalidateTag) on one instance only invalidates the cache on that instance. Other instances continue serving stale content until they independently discover the invalidation.

To coordinate tag invalidation across instances, implement the [`refreshTags()`](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheHandlers#refreshtags) method in your [custom cache handler](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheHandlers). This method is called before each request and should sync tag state from shared storage (like Redis) so all instances learn about invalidations promptly.

For a detailed explanation of the tag architecture, see [How Revalidation Works](https://nextjs.org/docs/app/guides/how-revalidation-works).

## Cache Components[](#cache-components)

[Cache Components](https://nextjs.org/docs/app/getting-started/caching) works by default with Next.js and is not a CDN-only feature. This includes deployment as a Node.js server (through `next start`) and when used with a Docker container.

## Usage with CDNs[](#usage-with-cdns)

When using a CDN in front of your Next.js application, the page will include `Cache-Control: private` response header when dynamic APIs are accessed. This ensures that the resulting HTML page is marked as non-cacheable. If the page is fully prerendered to static, it will include `Cache-Control: public` to allow the page to be cached on the CDN.

If you don't need a mix of both static and dynamic components, you can make your entire route static and cache the output HTML on a CDN. This Automatic Static Optimization is the default behavior when running `next build` if dynamic APIs are not used.

For detailed guidance on CDN caching behavior, graceful degradation, and cache variability, see [CDN Caching](https://nextjs.org/docs/app/guides/cdn-caching). For Partial Prerendering support on different platforms, see the [PPR Platform Guide](https://nextjs.org/docs/app/guides/ppr-platform-guide) and the [Deployment Adapter API](https://nextjs.org/docs/app/api-reference/config/next-config-js/adapterPath).

## `after`[](#after)

[`after`](https://nextjs.org/docs/app/api-reference/functions/after) is fully supported when self-hosting with `next start`.

When stopping the server, ensure a graceful shutdown by sending `SIGINT` or `SIGTERM` signals and waiting. The Next.js server will finish in-flight requests and execute any pending `after()` callbacks before exiting. Platforms should allow a configurable drain period (10-30 seconds is recommended) to ensure all background work completes.
