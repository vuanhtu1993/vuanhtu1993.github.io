---
title: "Functions: useParams"
source_url: "https://nextjs.org/docs/app/api-reference/functions/use-params"
crawled_at: "2026-06-25T07:11:21.205Z"
---

This page is also available as Markdown at [/docs/app/api-reference/functions/use-params.md](https://nextjs.org/docs/app/api-reference/functions/use-params.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

Last updated

June 16, 2025

`useParams` is a **Client Component** hook that lets you read a route's [dynamic params](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes) filled in by the current URL.

## Parameters[](#parameters)

`useParams` does not take any parameters.

## Returns[](#returns)

`useParams` returns an object containing the current route's filled in [dynamic parameters](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes).

-   Each property in the object is an active dynamic segment.
-   The properties name is the segment's name, and the properties value is what the segment is filled in with.
-   The properties value will either be a `string` or array of `string`'s depending on the [type of dynamic segment](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes).
-   If the route contains no dynamic parameters, `useParams` returns an empty object.
-   If used in Pages Router, `useParams` will return `null` on the initial render and updates with properties following the rules above once the router is ready.

For example:

| Route | URL | `useParams()` |
| --- | --- | --- |
| `app/shop/page.js` | `/shop` | `{}` |
| `app/shop/[slug]/page.js` | `/shop/1` | `{ slug: '1' }` |
| `app/shop/[tag]/[item]/page.js` | `/shop/1/2` | `{ tag: '1', item: '2' }` |
| `app/shop/[...slug]/page.js` | `/shop/1/2` | `{ slug: ['1', '2'] }` |

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v13.3.0` | `useParams` introduced. |

[Previous

useLinkStatus

](https://nextjs.org/docs/app/api-reference/functions/use-link-status)[Next

usePathname

](https://nextjs.org/docs/app/api-reference/functions/use-pathname)
