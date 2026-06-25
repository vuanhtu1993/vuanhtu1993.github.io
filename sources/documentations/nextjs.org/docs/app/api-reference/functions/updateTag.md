---
title: "Functions: updateTag"
source_url: "https://nextjs.org/docs/app/api-reference/functions/updateTag"
crawled_at: "2026-06-25T07:11:07.953Z"
---

Last updated

March 3, 2026

`updateTag` allows you to update cached data on-demand for a specific cache tag from within [Server Actions](https://nextjs.org/docs/app/getting-started/mutating-data).

This function is designed for **read-your-own-writes** scenarios, where a user makes a change (like creating a post), and the UI immediately shows the change, rather than stale data.

## Usage[](#usage)

`updateTag` can **only** be called from within [Server Actions](https://nextjs.org/docs/app/getting-started/mutating-data). It cannot be used in Route Handlers, Client Components, or any other context.

If you need to invalidate cache tags in Route Handlers or other contexts, use [`revalidateTag`](https://nextjs.org/docs/app/api-reference/functions/revalidateTag) instead.

> **Good to know**: `updateTag` immediately expires the cached data for the specified tag. The next request will wait to fetch fresh data rather than serving stale content from the cache, ensuring users see their changes immediately.

## Parameters[](#parameters)

-   `tag`: A string representing the cache tag associated with the data you want to update. Must not exceed 256 characters. This value is case-sensitive.

Tags must first be assigned to cached data. You can do this in two ways:

-   Using the [`next.tags`](https://nextjs.org/docs/app/api-reference/functions/fetch) option with `fetch` for caching external API requests:

-   Using [`cacheTag`](https://nextjs.org/docs/app/api-reference/functions/cacheTag) inside cached functions or components with the `'use cache'` directive:

## Returns[](#returns)

`updateTag` does not return a value.

## Differences from revalidateTag[](#differences-from-revalidatetag)

While both `updateTag` and `revalidateTag` invalidate cached data, they serve different purposes:

-   **`updateTag`**:
    
    -   Can only be used in Server Actions
    -   Next request waits for fresh data (no stale content served)
    -   Designed for read-your-own-writes scenarios
-   **`revalidateTag`**:
    
    -   Can be used in Server Actions and Route Handlers
    -   With `profile="max"` (recommended): Serves cached data while fetching fresh data in the background (stale-while-revalidate)
    -   With custom profile: Can be configured to any cache life profile for advanced usage
    -   Without profile: legacy behavior which is equivalent to `updateTag`

## Examples[](#examples)

### Server Action with Read-Your-Own-Writes[](#server-action-with-read-your-own-writes)

### Error when used outside Server Actions[](#error-when-used-outside-server-actions)

## When to use updateTag[](#when-to-use-updatetag)

Use `updateTag` when:

-   You're in a Server Action
-   You need immediate cache invalidation for read-your-own-writes
-   You want to ensure the next request sees updated data

Use `revalidateTag` instead when:

-   You're in a Route Handler or other non-action context
-   You want stale-while-revalidate semantics
-   You're building a webhook or API endpoint for cache invalidation

-   [`revalidateTag`](https://nextjs.org/docs/app/api-reference/functions/revalidateTag) - For invalidating tags in Route Handlers
-   [`revalidatePath`](https://nextjs.org/docs/app/api-reference/functions/revalidatePath) - For invalidating specific paths
