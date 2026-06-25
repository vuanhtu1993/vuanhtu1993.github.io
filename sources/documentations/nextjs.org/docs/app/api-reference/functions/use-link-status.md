---
title: "Functions: useLinkStatus"
source_url: "https://nextjs.org/docs/app/api-reference/functions/use-link-status"
crawled_at: "2026-06-25T07:11:14.444Z"
---

Last updated

September 2, 2025

The `useLinkStatus` hook lets you track the **pending** state of a `<Link>`. Use it for subtle, inline feedback, for example a shimmer effect over the clicked link, while navigation completes. Prefer route-level fallbacks with `loading.js`, and prefetching for instant transitions.

`useLinkStatus` is useful when:

-   [Prefetching](https://nextjs.org/docs/app/getting-started/linking-and-navigating#prefetching) is disabled or in progress meaning navigation is blocked.
-   The destination route is dynamic **and** doesn't include a [`loading.js`](https://nextjs.org/docs/app/api-reference/file-conventions/loading) file that would allow an instant navigation.

> **Good to know**:
> 
> -   `useLinkStatus` must be used within a descendant component of a `Link` component
> -   The hook is most useful when `prefetch={false}` is set on the `Link` component
> -   If the linked route has been prefetched, the pending state will be skipped
> -   When clicking multiple links in quick succession, only the last link's pending state is shown
> -   This hook is not supported in the Pages Router and always returns `{ pending: false }`
> -   Inline indicators can easily introduce layout shifts. Prefer a fixed-size, always-rendered hint element and toggle its opacity, or use an animation.

## You might not need `useLinkStatus`[](#you-might-not-need-uselinkstatus)

Before adding inline feedback, consider if:

-   The destination is static and prefetched in production, so the pending phase may be skipped.
-   The route has a `loading.js` file, enabling instant transitions with a route-level fallback.

Navigation is typically fast. Use `useLinkStatus` as a quick patch when you identify a slow transition, then iterate to fix the root cause with prefetching or a `loading.js` fallback.

## Parameters[](#parameters)

`useLinkStatus` does not take any parameters.

## Returns[](#returns)

`useLinkStatus` returns an object with a single property:

| Property | Type | Description |
| --- | --- | --- |
| pending | boolean | `true` before history updates, `false` after |

## Example[](#example)

### Inline link hint[](#inline-link-hint)

Add a subtle, fixed-size hint that doesn’t affect layout to confirm a click when prefetching hasn’t completed.

## Gracefully handling fast navigation[](#gracefully-handling-fast-navigation)

If the navigation to a new route is fast, users may see an unnecessary flash of the hint. One way to improve the user experience and only show the hint when the navigation takes time to complete is to add an initial animation delay (e.g. 100ms) and start the animation as invisible (e.g. `opacity: 0`).

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v15.3.0` | `useLinkStatus` introduced. |
