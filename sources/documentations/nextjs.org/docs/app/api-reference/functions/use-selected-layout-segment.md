---
title: "Functions: useSelectedLayoutSegment"
source_url: "https://nextjs.org/docs/app/api-reference/functions/use-selected-layout-segment"
crawled_at: "2026-06-25T07:11:51.149Z"
---

This page is also available as Markdown at [/docs/app/api-reference/functions/use-selected-layout-segment.md](https://nextjs.org/docs/app/api-reference/functions/use-selected-layout-segment.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

Last updated

February 12, 2026

`useSelectedLayoutSegment` is a **Client Component** hook that lets you read the active route segment **one level below** the Layout it is called from.

It is useful for navigation UI, such as tabs inside a parent layout that change style depending on the active child segment.

> **Good to know**:
> 
> -   Since `useSelectedLayoutSegment` is a [Client Component](https://nextjs.org/docs/app/getting-started/server-and-client-components) hook, and Layouts are [Server Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) by default, `useSelectedLayoutSegment` is usually called via a Client Component that is imported into a Layout.
> -   `useSelectedLayoutSegment` only returns the segment one level down. To return all active segments, see [`useSelectedLayoutSegments`](https://nextjs.org/docs/app/api-reference/functions/use-selected-layout-segments)
> -   For [catch-all](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes#catch-all-segments) routes, the matched segments are returned as a single joined string. For example, given `app/blog/[...slug]/page.js`, calling from `app/blog/layout.js` when visiting `/blog/a/b/c` returns `'a/b/c'`.

## Parameters[](#parameters)

`useSelectedLayoutSegment` _optionally_ accepts a [`parallelRoutesKey`](https://nextjs.org/docs/app/api-reference/file-conventions/parallel-routes#with-useselectedlayoutsegments), which allows you to read the active route segment within that slot.

## Returns[](#returns)

`useSelectedLayoutSegment` returns a string of the active segment or `null` if one doesn't exist.

For example, given the Layouts and URLs below, the returned segment would be:

| Layout | Visited URL | Returned Segment |
| --- | --- | --- |
| `app/layout.js` | `/` | `null` |
| `app/layout.js` | `/dashboard` | `'dashboard'` |
| `app/dashboard/layout.js` | `/dashboard` | `null` |
| `app/dashboard/layout.js` | `/dashboard/settings` | `'settings'` |
| `app/dashboard/layout.js` | `/dashboard/analytics` | `'analytics'` |
| `app/dashboard/layout.js` | `/dashboard/analytics/monthly` | `'analytics'` |

For catch-all routes (`[...slug]`), the returned segment contains all matched path segments joined as a single string:

| Layout | Visited URL | Returned Segment |
| --- | --- | --- |
| `app/blog/layout.js` | `/blog/a/b/c` | `'a/b/c'` |

## Examples[](#examples)

### Creating an active link component[](#creating-an-active-link-component)

You can use `useSelectedLayoutSegment` to create an active link component that changes style depending on the active segment. For example, a featured posts list in the sidebar of a blog:

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v13.0.0` | `useSelectedLayoutSegment` introduced. |

[Previous

useSearchParams

](https://nextjs.org/docs/app/api-reference/functions/use-search-params)[Next

useSelectedLayoutSegments

](https://nextjs.org/docs/app/api-reference/functions/use-selected-layout-segments)
