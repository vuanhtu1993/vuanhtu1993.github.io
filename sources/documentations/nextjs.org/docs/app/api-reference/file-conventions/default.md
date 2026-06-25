---
title: "File-system conventions: default.js"
source_url: "https://nextjs.org/docs/app/api-reference/file-conventions/default"
crawled_at: "2026-06-25T07:04:59.679Z"
---

Last updated

October 9, 2025

The `default.js` file is used to render a fallback within [Parallel Routes](https://nextjs.org/docs/app/api-reference/file-conventions/parallel-routes) when Next.js cannot recover a [slot's](https://nextjs.org/docs/app/api-reference/file-conventions/parallel-routes#slots) active state after a full-page load.

During [soft navigation](https://nextjs.org/docs/app/getting-started/linking-and-navigating#client-side-transitions), Next.js keeps track of the active _state_ (subpage) for each slot. However, for hard navigations (full-page load), Next.js cannot recover the active state. In this case, a `default.js` file can be rendered for subpages that don't match the current URL.

Consider the following folder structure. The `@team` slot has a `settings` page, but `@analytics` does not.

![Parallel Routes unmatched routes](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782371104/aha-mind/docs-crawler/nextjs.org/image_iuhoys.png)![Parallel Routes unmatched routes](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782371104/aha-mind/docs-crawler/nextjs.org/image_ryj5kb.png)

When navigating to `/settings`, the `@team` slot will render the `settings` page while maintaining the currently active page for the `@analytics` slot.

On refresh, Next.js will render a `default.js` for `@analytics`. If `default.js` doesn't exist, an error is returned for named slots (`@team`, `@analytics`, etc) and requires you to define a `default.js` in order to continue. If you want to preserve the old behavior of returning a 404 in these situations, you can create a `default.js` that contains:

Additionally, since `children` is an implicit slot, you also need to create a `default.js` file to render a fallback for `children` when Next.js cannot recover the active state of the parent page. If you don't create a `default.js` for the `children` slot, it will return a 404 page for the route.

## Reference[](#reference)

### `params` (optional)[](#params-optional)

A promise that resolves to an object containing the [dynamic route parameters](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes) from the root segment down to the slot's subpages. For example:

| Example | URL | `params` |
| --- | --- | --- |
| `app/[artist]/@sidebar/default.js` | `/zack` | `Promise<{ artist: 'zack' }>` |
| `app/[artist]/[album]/@sidebar/default.js` | `/zack/next` | `Promise<{ artist: 'zack', album: 'next' }>` |

-   Since the `params` prop is a promise. You must use `async/await` or React's [`use`](https://react.dev/reference/react/use) function to access the values.
    -   In version 14 and earlier, `params` was a synchronous prop. To help with backwards compatibility, you can still access it synchronously in Next.js 15, but this behavior will be deprecated in the future.
