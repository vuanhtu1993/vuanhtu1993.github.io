---
title: "Directives: use cache"
source_url: "https://nextjs.org/docs/app/api-reference/directives/use-cache"
crawled_at: "2026-06-25T07:03:52.129Z"
---

Last updated

May 13, 2026

The `use cache` directive allows you to mark a route, React component, or a function as cacheable. It can be used at the top of a file to indicate that all exports in the file should be cached, or inline at the top of function or component to cache the return value.

> **Good to know:**
> 
> -   To use cookies or headers, read them outside cached scopes and pass values as arguments. This is the preferred pattern.
> -   If the in-memory cache isn't sufficient for runtime data, [`'use cache: remote'`](https://nextjs.org/docs/app/api-reference/directives/use-cache-remote) allows platforms to provide a dedicated cache handler, though it requires a network roundtrip to check the cache and typically incurs platform fees.
> -   For compliance requirements or when you can't refactor to pass runtime data as arguments to a `use cache` scope, see [`'use cache: private'`](https://nextjs.org/docs/app/api-reference/directives/use-cache-private).

## Usage[](#usage)

`use cache` is a Cache Components feature. To enable it, add the [`cacheComponents`](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents) option to your `next.config.ts` file:

Then, add `use cache` at the file, component, or function level:

> **Good to know**: When used at file level, all function exports must be async functions.

## How `use cache` works[](#how-use-cache-works)

### Cache keys[](#cache-keys)

A cache entry's key is generated using a serialized version of its inputs, which includes:

1.  **Build ID** - Unique per build, changing this invalidates all cache entries
2.  **Function ID** - A secure hash of the function's location and signature in the codebase
3.  **Serializable arguments** - Props (for components) or function arguments
4.  **HMR refresh hash** (development only) - Invalidates cache on hot module replacement

When a cached function references variables from outer scopes, those variables are automatically captured and bound as arguments, making them part of the cache key.

In the snippet above, `userId` is captured from the outer scope and `filter` is passed as an argument, so both become part of the `getData` function's cache key. This means different user and filter combinations will have separate cache entries.

## Serialization[](#serialization)

Arguments to cached functions and their return values must be serializable.

For a complete reference, see:

-   [Serializable arguments](https://react.dev/reference/rsc/use-server#serializable-parameters-and-return-values) - Uses **React Server Components** serialization
-   [Serializable return types](https://react.dev/reference/rsc/use-client#serializable-types) - Uses **React Client Components** serialization

> **Good to know:** Arguments and return values use different serialization systems. Server Component serialization (for arguments) is more restrictive than Client Component serialization (for return values). This means you can return JSX elements but cannot accept them as arguments unless using pass-through patterns.

### Supported types[](#supported-types)

**Arguments:**

-   Primitives: `string`, `number`, `boolean`, `null`, `undefined`
-   Plain objects: `{ key: value }`
-   Arrays: `[1, 2, 3]`
-   Dates, Maps, Sets, TypedArrays, ArrayBuffers
-   React elements (as pass-through only)

**Return values:**

-   Same as arguments, plus JSX elements

### Unsupported types[](#unsupported-types)

-   Class instances
-   Functions (except as pass-through)
-   Symbols, WeakMaps, WeakSets
-   URL instances

### Pass-through (non-serializable arguments)[](#pass-through-non-serializable-arguments)

You can accept non-serializable values **as long as you don't introspect them**. This enables composition patterns with `children` and Server Actions:

You can also pass Server Actions through cached components:

## Constraints[](#constraints)

Cached functions execute in an isolated environment. The following constraints ensure cache behavior remains predictable and secure.

### Request-time APIs[](#request-time-apis)

Cached functions and components **cannot** directly access runtime APIs like `cookies()`, `headers()`, or `searchParams`. Instead, read these values outside the cached scope and pass them as arguments.

### Runtime caching considerations[](#runtime-caching-considerations)

While `use cache` is designed primarily to include uncached data in the static shell, it can also cache data at runtime using in-memory LRU (Least Recently Used) storage.

Runtime cache behavior depends on your hosting environment:

| Environment | Runtime Caching Behavior |
| --- | --- |
| **Serverless** | Cache entries typically don't persist across requests (each request can be a different instance), or during revalidation. Build-time caching works normally. |
| **Self-hosted** | Cache entries persist across requests. Control cache size with [`cacheMaxMemorySize`](https://nextjs.org/docs/app/api-reference/config/next-config-js/incrementalCacheHandlerPath). |

For example, in a serverless environment, a cached function shared by two pages executes on each static shell revalidation, whereas in self-hosted or environments with persistent memory, the cached output is reused if it's still fresh.

If the default in-memory cache isn't enough, consider **[`use cache: remote`](https://nextjs.org/docs/app/api-reference/directives/use-cache-remote)** which allows platforms to provide a dedicated cache handler (like Redis or KV database). This helps reduce hits against data sources not scaled to your total traffic, though it comes with costs (storage, network latency, platform fees).

Very rarely, for compliance requirements or when you can't refactor your code to pass runtime data as arguments to a `use cache` scope, you might need [`use cache: private`](https://nextjs.org/docs/app/api-reference/directives/use-cache-private).

### Draft Mode[](#draft-mode)

When [Draft Mode](https://nextjs.org/docs/app/guides/draft-mode) is enabled, all cached functions and components re-execute on every request, and results are not saved to the cache. This ensures draft content is always fresh without requiring any changes to your caching code.

You can read `isEnabled` from [`draftMode()`](https://nextjs.org/docs/app/api-reference/functions/draft-mode) inside a `use cache` scope, however, other runtime APIs like `cookies()` and `headers()` are not allowed, even when Draft Mode is active. See [Passing runtime values to cached functions](https://nextjs.org/docs/app/getting-started/caching#passing-runtime-values-to-cached-functions) for the recommended pattern.

Calling `enable()` or `disable()` inside a caching directive scope will also throw an error. Draft Mode can only be toggled in [Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route) or [Server Actions](https://nextjs.org/docs/app/getting-started/mutating-data).

### React.cache isolation[](#reactcache-isolation)

[`React.cache`](https://react.dev/reference/react/cache) operates in an isolated scope inside `use cache` boundaries. Values stored via `React.cache` outside a `use cache` function are not visible inside it.

This means you cannot use `React.cache` to pass data into a `use cache` scope:

This isolation ensures cached functions have predictable, self-contained behavior. To pass data into a `use cache` scope, use function arguments instead.

## `use cache` at runtime[](#use-cache-at-runtime)

On the **server**, cache entries are stored in-memory and respect the `revalidate` and `expire` times from your `cacheLife` configuration. You can customize the cache storage by configuring [`cacheHandlers`](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheHandlers) in your `next.config.js` file.

On the **client**, content from the server cache is stored in the browser's memory for the duration defined by the `stale` time. The client router enforces a **minimum 30-second stale time**, regardless of configuration.

The `x-nextjs-stale-time` response header communicates cache lifetime from server to client, ensuring coordinated behavior.

## Revalidation[](#revalidation)

By default, `use cache` uses the `default` profile with these settings:

-   **stale**: 5 minutes (client-side)
-   **revalidate**: 15 minutes (server-side)
-   **expire**: Never expires by time

### Customizing cache lifetime[](#customizing-cache-lifetime)

Use the [`cacheLife`](https://nextjs.org/docs/app/api-reference/functions/cacheLife) function to customize cache duration:

### On-demand revalidation[](#on-demand-revalidation)

Use [`cacheTag`](https://nextjs.org/docs/app/api-reference/functions/cacheTag), [`updateTag`](https://nextjs.org/docs/app/api-reference/functions/updateTag), or [`revalidateTag`](https://nextjs.org/docs/app/api-reference/functions/revalidateTag) for on-demand cache invalidation:

Both `cacheLife` and `cacheTag` integrate across client and server caching layers, meaning you configure your caching semantics in one place and they apply everywhere.

## Examples[](#examples)

### Caching an entire route with `use cache`[](#caching-an-entire-route-with-use-cache)

To prerender an entire route, add `use cache` to the top of **both** the `layout` and `page` files. Each of these segments are treated as separate entry points in your application, and will be cached independently.

Any components imported and nested in `page` file are part of the cache output associated with the `page`.

> **Good to know**:
> 
> -   If `use cache` is added only to the `layout` or the `page`, only that route segment and any components imported into it will be cached.

### Caching a component's output with `use cache`[](#caching-a-components-output-with-use-cache)

You can use `use cache` at the component level to cache any fetches or computations performed within that component. The cache entry will be reused as long as the serialized props produce the same value in each instance.

### Caching function output with `use cache`[](#caching-function-output-with-use-cache)

Since you can add `use cache` to any asynchronous function, you aren't limited to caching components or routes only. You might want to cache a network request, a database query, or a slow computation.

### Interleaving[](#interleaving)

In React, composition with `children` or slots is a well-known pattern for building flexible components. When using `use cache`, you can continue to compose your UI in this way. Anything included as `children`, or other compositional slots, in the returned JSX will be passed through the cached component without affecting its cache entry.

As long as you don't directly reference any of the JSX slots inside the body of the cacheable function itself, their presence in the returned output won't affect the cache entry.

You can also pass Server Actions through cached components to Client Components without invoking them inside the cacheable function.

## Troubleshooting[](#troubleshooting)

### Debugging cache behavior[](#debugging-cache-behavior)

#### Verbose logging[](#verbose-logging)

Set `NEXT_PRIVATE_DEBUG_CACHE=1` for verbose cache logging:

> **Good to know:** This environment variable also logs ISR and other caching mechanisms. See [Verifying correct production behavior](https://nextjs.org/docs/app/guides/incremental-static-regeneration#verifying-correct-production-behavior) for more details.

#### Console log replays[](#console-log-replays)

In development, console logs from cached functions appear with a `Cache` prefix.

### Build Hangs (Cache Timeout)[](#build-hangs-cache-timeout)

If your build hangs, you're accessing Promises that resolve to uncached or runtime data, created outside a `use cache` boundary. The cached function waits for data that can't resolve during the build, causing a timeout after 50 seconds.

When the build timeouts you'll see this error message:

> Error: Filling a cache during prerender timed out, likely because request-specific arguments such as params, searchParams, cookies() or uncached data were used inside "use cache".

Common ways this happens: passing such Promises as props, accessing them via closure, or retrieving them from shared storage (Maps).

> **Good to know:** Directly calling `cookies()` or `headers()` inside `use cache` fails immediately with a [different error](https://nextjs.org/docs/messages/next-request-in-use-cache), not a timeout.

**Passing runtime data Promises as props:**

Await the `cookies` store in the `Dynamic` component, and pass a cookie value to the `Cached` component.

**Shared deduplication storage:**

Use Next.js's built-in `fetch()` deduplication or use separate Maps for cached and uncached contexts.

## Platform Support[](#platform-support)

| Deployment Option | Supported |
| --- | --- |
| [Node.js server](https://nextjs.org/docs/app/getting-started/deploying#nodejs-server) | Yes |
| [Docker container](https://nextjs.org/docs/app/getting-started/deploying#docker) | Yes |
| [Static export](https://nextjs.org/docs/app/getting-started/deploying#static-export) | No |
| [Adapters](https://nextjs.org/docs/app/getting-started/deploying#adapters) | Platform-specific |

Learn how to [configure caching](https://nextjs.org/docs/app/guides/self-hosting#caching-and-isr) when self-hosting Next.js.

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v16.0.0` | `"use cache"` is enabled with the Cache Components feature. |
| `v15.0.0` | `"use cache"` is introduced as an experimental feature. |
