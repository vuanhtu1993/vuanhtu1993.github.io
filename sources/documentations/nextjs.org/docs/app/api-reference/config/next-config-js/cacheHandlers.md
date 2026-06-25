---
title: "next.config.js: cacheHandlers"
source_url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheHandlers"
crawled_at: "2026-06-25T07:13:09.396Z"
---

Last updated

March 25, 2026

The `cacheHandlers` configuration allows you to define custom cache storage implementations for [`'use cache'`](https://nextjs.org/docs/app/api-reference/directives/use-cache) and [`'use cache: remote'`](https://nextjs.org/docs/app/api-reference/directives/use-cache-remote). This enables you to store cached components and functions in external services or customize the caching behavior. [`'use cache: private'`](https://nextjs.org/docs/app/api-reference/directives/use-cache-private) is not configurable.

## When to use custom cache handlers[](#when-to-use-custom-cache-handlers)

**Most applications don't need custom cache handlers.** The default in-memory cache works well in the typical use case.

Custom cache handlers are for advanced scenarios where you need to either share cache across multiple instances or change where the cache is stored. For example, you can configure a custom `remote` handler for external storage (like a key-value store), then use `'use cache'` in your code for in-memory caching and `'use cache: remote'` for the external storage, allowing different caching strategies within the same application.

**Sharing cache across instances**

The default in-memory cache is isolated to each Next.js process. If you're running multiple servers or containers, each instance will have its own cache that isn't shared with others and is lost on restart.

Custom handlers let you integrate with shared storage systems (like Redis, Memcached, or DynamoDB) that all your Next.js instances can access.

**Changing storage type**

You might want to store cache differently than the default in-memory approach. You can implement a custom handler to store cache on disk, in a database, or in an external caching service. Reasons include: persistence across restarts, reducing memory usage, or integrating with existing infrastructure.

## Usage[](#usage)

To configure custom cache handlers:

1.  Define your cache handler in a separate file, see [examples](#examples) for implementation details.
2.  Reference the file path in your Next config file

### Handler types[](#handler-types)

-   **`default`**: Used by the `'use cache'` directive
-   **`remote`**: Used by the `'use cache: remote'` directive

If you don't configure `cacheHandlers`, Next.js uses an in-memory LRU (Least Recently Used) cache for both `default` and `remote`. You can view the [default implementation](https://github.com/vercel/next.js/blob/canary/packages/next/src/server/lib/cache-handlers/default.ts) as a reference.

You can also define additional named handlers (e.g., `sessions`, `analytics`) and reference them with `'use cache: <name>'`.

Note that `'use cache: private'` does not use cache handlers and cannot be customized.

## API Reference[](#api-reference)

A cache handler must implement the [`CacheHandler`](https://github.com/vercel/next.js/blob/canary/packages/next/src/server/lib/cache-handlers/types.ts) interface with the following methods:

### `get()`[](#get)

Retrieve a cache entry for the given cache key.

| Parameter | Type | Description |
| --- | --- | --- |
| `cacheKey` | `string` | The unique key for the cache entry. |
| `softTags` | `string[]` | Implicit tags derived from the route path. See [Soft Tags](#soft-tags) for how to use them. |

Returns a `CacheEntry` object if found, or `undefined` if not found or expired.

Your `get` method should retrieve the cache entry from storage, check if it has expired based on the `revalidate` time, and return `undefined` for missing or expired entries.

### `set()`[](#set)

Store a cache entry for the given cache key.

| Parameter | Type | Description |
| --- | --- | --- |
| `cacheKey` | `string` | The unique key to store the entry under. |
| `pendingEntry` | `Promise<CacheEntry>` | A promise that resolves to the cache entry. |

The entry may still be pending when this is called (i.e., its value stream may still be written to). Your handler should await the promise before processing the entry.

Returns `Promise<void>`.

Your `set` method must await the `pendingEntry` promise before storing it, since the cache entry may still be generating when this method is called. Once resolved, store the entry in your cache system.

### `refreshTags()`[](#refreshtags)

Called periodically before starting a new request to sync with external tag services.

This is useful if you're coordinating cache invalidation across multiple instances or services. For in-memory caches, this can be a no-op.

Returns `Promise<void>`.

For in-memory caches, this can be a no-op. For distributed caches, use this to sync tag state from an external service or database before processing requests.

### `getExpiration()`[](#getexpiration)

Get the maximum revalidation timestamp for a set of tags.

| Parameter | Type | Description |
| --- | --- | --- |
| `tags` | `string[]` | Array of tags to check expiration for. |

Returns:

-   `0` if none of the tags were ever revalidated
-   A timestamp (in milliseconds) representing the most recent revalidation
-   `Infinity` to indicate soft tags should be checked in the `get` method instead

If you're not tracking tag revalidation timestamps, return `0`. Otherwise, find the most recent revalidation timestamp across all the provided tags. Return `Infinity` if you prefer to handle soft tag checking in the `get` method.

### `updateTags()`[](#updatetags)

Called when tags are revalidated or expired.

| Parameter | Type | Description |
| --- | --- | --- |
| `tags` | `string[]` | Array of tags to update. |
| `durations` | `{ expire?: number }` | Optional expiration duration in seconds. |

Your handler should update its internal state to mark these tags as invalidated.

Returns `Promise<void>`.

When tags are revalidated, your handler should invalidate all cache entries that have any of those tags. Iterate through your cache and remove entries whose tags match the provided list.

## CacheEntry Type[](#cacheentry-type)

The [`CacheEntry`](https://github.com/vercel/next.js/blob/canary/packages/next/src/server/lib/cache-handlers/types.ts) object has the following structure:

| Property | Type | Description |
| --- | --- | --- |
| `value` | `ReadableStream<Uint8Array>` | The cached data as a stream. |
| `tags` | `string[]` | Cache tags (excluding soft tags). |
| `stale` | `number` | Duration in seconds for client-side staleness. |
| `timestamp` | `number` | When the entry was created (timestamp in milliseconds). |
| `expire` | `number` | How long the entry is allowed to be used (in seconds). |
| `revalidate` | `number` | How long until the entry should be revalidated (in seconds). |

> **Good to know**:
> 
> -   The `value` is a [`ReadableStream`](https://developer.mozilla.org/docs/Web/API/ReadableStream). Use [`.tee()`](https://developer.mozilla.org/docs/Web/API/ReadableStream/tee) if you need to read and store the stream data.
> -   If the stream errors with partial data, your handler must decide whether to keep the partial cache or discard it.

## Examples[](#examples)

### Basic in-memory cache handler[](#basic-in-memory-cache-handler)

Here's a minimal implementation using a `Map` for storage. This example demonstrates the core concepts, but for a production-ready implementation with LRU eviction, error handling, and tag management, see the [default cache handler](https://github.com/vercel/next.js/blob/canary/packages/next/src/server/lib/cache-handlers/default.ts).

### External storage pattern[](#external-storage-pattern)

For durable storage like Redis or a database, you'll need to serialize the cache entries. Here's a simple Redis example:

## Distributed Tag Coordination[](#distributed-tag-coordination)

When running multiple Next.js instances, tag invalidation must be coordinated across instances. The default in-memory handler only tracks tags locally, so calling `revalidateTag()` on one instance does not affect others.

To coordinate tags across instances:

1.  **`updateTags()`** is called when `revalidateTag()` is invoked. Your handler should write the invalidation timestamp to shared storage.
2.  **`refreshTags()`** is called before each request. Your handler should read recent invalidation events from shared storage and update its local tag state.
3.  **`getExpiration()`** returns the most recent revalidation timestamp across all provided tags. The default implementation returns `Math.max(...timestamps, 0)`.

Here's an example using Redis for distributed tag coordination:

For a full explanation of the tag architecture (including soft tags and multi-instance considerations), see [How Revalidation Works](https://nextjs.org/docs/app/guides/how-revalidation-works).

Soft tags are implicit tags that Next.js automatically generates based on the route path. For example, the route `/blog/hello` generates soft tags for `/`, `/blog`, `/blog/hello`, and their corresponding layout entries. These tags are prefixed internally with `_N_T_`.

Soft tags enable [`revalidatePath()`](https://nextjs.org/docs/app/api-reference/functions/revalidatePath) to work through the same tag-based cache system. When `revalidatePath('/blog/hello')` is called, it invalidates all cache entries associated with that path's soft tags.

In the cache handler API, soft tags are passed to the [`get()`](#get) method as the `softTags` parameter. Your handler should check whether any soft tag has been invalidated (via `getExpiration()` or direct timestamp comparison) after the cache entry's `timestamp`. If a soft tag was invalidated more recently than the entry was created, the entry should be treated as stale.

## Handling Streams[](#handling-streams)

The `CacheEntry.value` is a [`ReadableStream<Uint8Array>`](https://developer.mozilla.org/docs/Web/API/ReadableStream). When implementing a cache handler that stores entries externally, keep in mind:

-   **Use `.tee()`** if you need to both store and return the stream. One branch goes to storage, the other is returned to the caller.
-   **Memory implications**: large pages produce large cache entries. For S3-like storage backends, consider streaming directly to storage without buffering the entire entry in memory.
-   **Partial writes**: the stream may error partway through rendering. Your handler should decide whether to keep partial entries or discard them. Discarding is safer, as partial entries can produce incomplete pages.

## Error Handling[](#error-handling)

Cache operations should be implemented defensively:

-   **`set()` failure**: the response is still served to the user because `set()` is called asynchronously after the response stream is already flowing. The cache entry is lost, and the next request triggers a fresh render.
-   **`get()` failure**: your handler should catch internal errors and return `undefined` (the "cache miss" signal). The framework does not wrap `get()` in a try/catch, so an unhandled exception from `get()` will propagate as a render error.
-   **Partial writes**: if a cache entry is partially written and then read, the behavior is undefined. Use atomic writes or a write-then-rename pattern to avoid serving partial entries.

## Platform Support[](#platform-support)

| Deployment Option | Supported |
| --- | --- |
| [Node.js server](https://nextjs.org/docs/app/getting-started/deploying#nodejs-server) | Yes |
| [Docker container](https://nextjs.org/docs/app/getting-started/deploying#docker) | Yes |
| [Static export](https://nextjs.org/docs/app/getting-started/deploying#static-export) | No |
| [Adapters](https://nextjs.org/docs/app/getting-started/deploying#adapters) | Platform-specific |

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v16.0.0` | `cacheHandlers` introduced. |
