---
title: "next.config.js: cacheHandler"
source_url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/incrementalCacheHandlerPath"
crawled_at: "2026-06-25T07:14:59.091Z"
---

## Custom Next.js Cache Handler

Last updated

January 8, 2026

You can configure the Next.js cache location if you want to persist cached pages and data to durable storage, or share the cache across multiple containers or instances of your Next.js application.

> **Good to know**: The `cacheHandler` (singular) configuration is specifically used by Next.js for server cache operations such as storing and revalidating ISR, route handler responses, and optimized images. It is **not** used by `'use cache'` directives. For `'use cache'` directives, use [`cacheHandlers`](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheHandlers) (plural) instead.

View an example of a [custom cache handler](https://nextjs.org/docs/app/guides/self-hosting#configuring-caching) and learn more about the implementation.

## API Reference[](#api-reference)

The cache handler can implement the following methods: `get`, `set`, `revalidateTag`, and `resetRequestCache`.

### `get()`[](#get)

| Parameter | Type | Description |
| --- | --- | --- |
| `key` | `string` | The key to the cached value. |
| `ctx` | `object` | Context including the cache entry kind. |

The `ctx` parameter contains a `kind` property that indicates the type of cache entry being retrieved. Possible values include `'APP_PAGE'`, `'APP_ROUTE'`, `'PAGES'`, `'FETCH'`, and `'IMAGE'`.

Returns the cached value or `null` if not found.

### `set()`[](#set)

| Parameter | Type | Description |
| --- | --- | --- |
| `key` | `string` | The key to store the data under. |
| `data` | Data or `null` | The data to be cached. |
| `ctx` | `{ tags: [] }` | The cache tags provided. |

The `data` object contains a `kind` property that indicates the type of cache entry. For image optimization, `kind` will be `'IMAGE'` and the data will include properties like `buffer`, `etag`, `extension`, and `revalidate`.

Returns `Promise<void>`.

### `revalidateTag()`[](#revalidatetag)

| Parameter | Type | Description |
| --- | --- | --- |
| `tag` | `string` or `string[]` | The cache tags to revalidate. |

Returns `Promise<void>`. Learn more about [revalidating data](https://nextjs.org/docs/app/guides/incremental-static-regeneration) or the [`revalidateTag()`](https://nextjs.org/docs/app/api-reference/functions/revalidateTag) function.

### `resetRequestCache()`[](#resetrequestcache)

This method resets the temporary in-memory cache for a single request before the next request.

Returns `void`.

**Good to know:**

-   `revalidatePath` is a convenience layer on top of cache tags. Calling `revalidatePath` will call your `revalidateTag` function, which you can then choose if you want to tag cache keys based on the path.

## Image Optimization Caching[](#image-optimization-caching)

The `cacheHandler` can also be used for caching optimized images from `next/image`. To enable this, set `images.customCacheHandler` to `true` in your `next.config.js`:

> **Good to know**: This opt-in flag will become the default behavior in the next major version. Setting it now allows you to prepare your cache handler for image optimization entries.

You can use the `kind` property to differentiate between cache entry types and handle images separately if needed, for example to implement an eviction policy or store images in a different location.

When handling image cache entries, the `kind` will be `'IMAGE'` and the data will include `buffer`, `etag`, `extension`, and `revalidate` properties.

## Platform Support[](#platform-support)

| Deployment Option | Supported |
| --- | --- |
| [Node.js server](https://nextjs.org/docs/app/getting-started/deploying#nodejs-server) | Yes |
| [Docker container](https://nextjs.org/docs/app/getting-started/deploying#docker) | Yes |
| [Static export](https://nextjs.org/docs/app/getting-started/deploying#static-export) | No |
| [Adapters](https://nextjs.org/docs/app/getting-started/deploying#adapters) | Platform-specific |

Learn how to [configure ISR](https://nextjs.org/docs/app/guides/self-hosting#caching-and-isr) when self-hosting Next.js.

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v16.2.0` | `cacheHandler` support for image optimization caching. |
| `v14.1.0` | Renamed to `cacheHandler` and became stable. |
| `v13.4.0` | `incrementalCacheHandlerPath` support for `revalidateTag`. |
| `v13.4.0` | `incrementalCacheHandlerPath` support for standalone output. |
| `v12.2.0` | Experimental `incrementalCacheHandlerPath` added. |
