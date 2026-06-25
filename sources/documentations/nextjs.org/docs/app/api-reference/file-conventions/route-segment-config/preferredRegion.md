---
title: "Route Segment Config: preferredRegion"
source_url: "https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/preferredRegion"
crawled_at: "2026-06-25T07:07:54.216Z"
---

This page is also available as Markdown at [/docs/app/api-reference/file-conventions/route-segment-config/preferredRegion.md](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/preferredRegion.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

Last updated

March 13, 2026

The `preferredRegion` option allows you to specify the preferred deployment region for a route segment. This value is passed to your deployment platform.

-   **`string`**: Deploy the route to a specific region. Available region codes are platform-specific. For example, `'iad1'`.
-   **`string[]`**: Deploy the route to multiple specific regions. The route is deployed to **all** listed regions, not a single one chosen from the list. For example, `['iad1', 'sfo1']`.

> **Good to know**:
> 
> -   If a `preferredRegion` is not specified, it will inherit the option of the nearest parent layout. The root layout defaults to `'auto'`.
> -   A child segment's value overrides the parent, values are not merged.
> -   Next.js passes the region values through to the deployment platform. The exact behavior and available region codes are platform-specific. Refer to your deployment platform's documentation for supported values.

## Vercel[](#vercel)

If deploying Next.js on Vercel, regions are only supported if `export const runtime = 'edge'` is set. The following options can be passed:

-   **`'auto'`** (default): Uses the default region.
-   **`'global'`**: Prefer deploying the route to all availableregions.
-   **`'home'`**: Prefer deploying the route to the home region.

If an unsupported value is passed, an error will be thrown.

[Previous

maxDuration

](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/maxDuration)[Next

runtime

](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/runtime)
