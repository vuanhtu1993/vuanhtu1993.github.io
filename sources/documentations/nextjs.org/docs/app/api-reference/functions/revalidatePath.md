---
title: "Functions: revalidatePath"
source_url: "https://nextjs.org/docs/app/api-reference/functions/revalidatePath"
crawled_at: "2026-06-25T07:10:30.004Z"
---

Last updated

March 3, 2026

`revalidatePath` allows you to invalidate [cached data](https://nextjs.org/docs/app/getting-started/caching) on-demand for a specific path.

## Usage[](#usage)

`revalidatePath` can be called in Server Functions and Route Handlers.

`revalidatePath` cannot be called in Client Components or Proxy, as it only works in server environments.

> **Good to know**:
> 
> -   **Server Functions**: Updates the UI immediately (if viewing the affected path). Currently, it also causes all previously visited pages to refresh when navigated to again. This behavior is temporary and will be updated in the future to apply only to the specific path.
> -   **Route Handlers**: Marks the path for revalidation. The revalidation is done on the next visit to the specified path. This means calling `revalidatePath` with a dynamic route segment will not immediately trigger many revalidations at once. The invalidation only happens when the path is next visited.

## Parameters[](#parameters)

-   `path`: Either a string that represents your route file structure. This can be a literal path like `/product/123`, or a route pattern with dynamic segments like `/product/[slug]`. Do not append `/page` or `/layout`, use the `type` parameter instead. Must not exceed 1024 characters. This value is case-sensitive. You do not need to include a trailing slash, regardless of your [`trailingSlash`](https://nextjs.org/docs/app/api-reference/config/next-config-js/trailingSlash) config.
-   `type`: (optional) `'page'` or `'layout'` string to change the type of path to revalidate. If `path` contains a dynamic segment, for example `/product/[slug]`, this parameter is required. If `path` is a literal path like `/product/1`, omit `type`.

Use a literal path when you want to refresh a [single page](#revalidating-a-specific-path). Use a route pattern plus `type` to refresh [all matching pages](#revalidating-a-page-path).

## Returns[](#returns)

`revalidatePath` does not return a value.

## What can be invalidated[](#what-can-be-invalidated)

The path parameter can point to pages, layouts, or route handlers:

-   **Pages**: Invalidates the specific page
-   **Layouts**: Invalidates the layout (the `layout.tsx` at that segment), all nested layouts beneath it, and all pages beneath them
-   **Route Handlers**: Invalidates cached data accessed within route handlers. For example `revalidatePath("/api/data")` invalidates this GET handler:

## Using `revalidatePath` with rewrites[](#using-revalidatepath-with-rewrites)

When using [rewrites](https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites), you must pass the **destination** path (the actual route file location), not the source path that appears in the browser's address bar.

For example, if you have a rewrite from `/blog` to `/news`:

To revalidate this page, use the destination path:

This is because `revalidatePath` operates on the route file structure, not the URL visible to users. Cache entries are tagged based on which route file renders them.

## Relationship with `revalidateTag` and `updateTag`[](#relationship-with-revalidatetag-and-updatetag)

`revalidatePath`, [`revalidateTag`](https://nextjs.org/docs/app/api-reference/functions/revalidateTag) and [`updateTag`](https://nextjs.org/docs/app/api-reference/functions/updateTag) serve different purposes:

-   **`revalidatePath`**: Invalidates a specific page or layout path
-   **`revalidateTag`**: Marks data with specific tags as **stale**. Applies across all pages that use those tags
-   **`updateTag`**: Expires data with specific tags. Applies across all pages that use those tags

When you call `revalidatePath`, only the specified path gets fresh data on the next visit. Other pages that use the same data tags will continue to serve cached data until those specific tags are also revalidated:

After calling `revalidatePath('/blog')`:

-   **Page A (/blog)**: Shows fresh data (page re-rendered)
-   **Page B (/dashboard)**: Still shows stale data (cache tag 'posts' not invalidated)

Learn about the difference between [`revalidateTag` and `updateTag`](https://nextjs.org/docs/app/api-reference/functions/updateTag#differences-from-revalidatetag).

### Building revalidation utilities[](#building-revalidation-utilities)

`revalidatePath` and `updateTag` are complementary primitives that are often used together in utility functions to ensure comprehensive data consistency across your application:

This pattern ensures that both the specific page and any other pages using the same data remain consistent.

## Examples[](#examples)

### Revalidating a specific path[](#revalidating-a-specific-path)

This will invalidate one specific path for revalidation on the next page visit.

### Revalidating a Page path[](#revalidating-a-page-path)

This will invalidate any path that matches the provided `page` file for revalidation on the next page visit. This will _not_ invalidate pages beneath the specific page. For example, `/blog/[slug]` won't invalidate `/blog/[slug]/[author]`.

### Revalidating a Layout path[](#revalidating-a-layout-path)

This will invalidate any path that matches the provided `layout` file for revalidation on the next page visit. This will cause pages beneath with the same layout to be invalidated and revalidated on the next visit. For example, in the above case, `/blog/[slug]/[another]` would also be invalidated and revalidated on the next visit.

### Revalidating all data[](#revalidating-all-data)

This will purge the [Client Cache](https://nextjs.org/docs/app/glossary#client-cache), and invalidate all cached data for revalidation on the next page visit.

### Server Function[](#server-function)

### Route Handler[](#route-handler)
