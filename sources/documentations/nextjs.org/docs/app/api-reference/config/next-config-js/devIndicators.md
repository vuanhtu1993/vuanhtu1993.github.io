---
title: "next.config.js: devIndicators"
source_url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/devIndicators"
crawled_at: "2026-06-25T07:13:47.817Z"
---

Last updated

May 13, 2026

`devIndicators` allows you to configure the on-screen indicator that gives context about the current route you're viewing during development.

Open `next.config.ts` and set `position` to choose where the indicator renders. The default is `bottom-left`.

To hide the indicator entirely, set `devIndicators` to `false`. Next.js will still surface any compile or runtime errors that were encountered.

## Troubleshooting[](#troubleshooting)

### Indicator not marking a route as static[](#indicator-not-marking-a-route-as-static)

If you expect a route to be static and the indicator has marked it as dynamic, it's likely the route has opted out of prerendering.

You can confirm if a route is [prerendered](https://nextjs.org/docs/app/glossary#prerendering) or [dynamically rendered](https://nextjs.org/docs/app/glossary#dynamic-rendering) by building your application using `next build --debug`, and checking the output in your terminal. Static (or prerendered) routes will display a `○` symbol, whereas dynamic routes will display a `ƒ` symbol. For example:

There are two reasons a route might opt out of prerendering:

-   The presence of [Request-time APIs](https://nextjs.org/docs/app/glossary#request-time-apis) which rely on request information.
-   An [uncached data request](https://nextjs.org/docs/app/getting-started/fetching-data), like a call to an ORM or database driver.

Check your route for any of these conditions, and if you are not able to statically render the route, then consider using [`loading.js`](https://nextjs.org/docs/app/api-reference/file-conventions/loading) or [`<Suspense />`](https://react.dev/reference/react/Suspense) to leverage [streaming](https://nextjs.org/docs/app/getting-started/linking-and-navigating#streaming).

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v16.0.0` | `appIsrStatus`, `buildActivity`, and `buildActivityPosition` options have been removed. |
| `v15.2.0` | Improved on-screen indicator with new `position` option. `appIsrStatus`, `buildActivity`, and `buildActivityPosition` options have been deprecated. |
| `v15.0.0` | Static on-screen indicator added with `appIsrStatus` option. |
