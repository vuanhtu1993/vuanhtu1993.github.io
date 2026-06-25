---
title: "Functions: cacheTag"
source_url: "https://nextjs.org/docs/app/api-reference/functions/cacheTag"
crawled_at: "2026-06-25T07:08:20.165Z"
---

Last updated

May 13, 2026

The `cacheTag` function allows you to tag cached data for on-demand invalidation. By associating tags with cache entries, you can selectively purge or revalidate specific cache entries without affecting other cached data.

## Usage[](#usage)

To use `cacheTag`, enable the [`cacheComponents` flag](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents) in your `next.config.js` file:

The `cacheTag` function takes one or more string values.

You can then purge the cache on-demand from a [Server Function](https://nextjs.org/docs/app/getting-started/mutating-data) or [Route Handler](https://nextjs.org/docs/app/api-reference/file-conventions/route):

-   Use [`updateTag`](https://nextjs.org/docs/app/api-reference/functions/updateTag) inside a Server Function for read-your-own-writes scenarios, where a user makes a change and the next read should fetch fresh data immediately.
-   Use [`revalidateTag`](https://nextjs.org/docs/app/api-reference/functions/revalidateTag) when it is acceptable to serve stale data while revalidation happens in the background, or when revalidating from a route handler.

The example below uses `revalidateTag`:

## Good to know[](#good-to-know)

-   **Idempotent Tags**: Applying the same tag multiple times has no additional effect.
-   **Multiple Tags**: You can assign multiple tags to a single cache entry by passing multiple string values to `cacheTag`.

-   **Limits**: A single `cacheTag()` call accepts up to 128 tags, each with a maximum length of 256 characters. Tags longer than 256 characters are skipped, and any tags past the 128th in one call are dropped. Both cases log a console warning.

## Examples[](#examples)

### Tagging components or functions[](#tagging-components-or-functions)

Tag your cached data by calling `cacheTag` within a cached function or component:

### Creating tags from external data[](#creating-tags-from-external-data)

You can use the data returned from an async function to tag the cache entry.

### Invalidating tagged cache[](#invalidating-tagged-cache)

Using [`revalidateTag`](https://nextjs.org/docs/app/api-reference/functions/revalidateTag), you can invalidate the cache for a specific tag when needed:
