---
title: "Route Segment Config: maxDuration"
source_url: "https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/maxDuration"
crawled_at: "2026-06-25T07:07:48.889Z"
---

This page is also available as Markdown at [/docs/app/api-reference/file-conventions/route-segment-config/maxDuration.md](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/maxDuration.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

Last updated

March 13, 2026

The `maxDuration` option allows you to set the maximum execution time (in seconds) for server-side logic in a route segment. Deployment platforms can use `maxDuration` from the Next.js build output to add specific execution limits.

## Server Actions[](#server-actions)

If using [Server Actions](https://nextjs.org/docs/app/getting-started/mutating-data), set the `maxDuration` at the page level to change the default timeout of all Server Actions used on the page.

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v13.4.10` | `maxDuration` introduced. |

[Previous

dynamicParams

](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/dynamicParams)[Next

preferredRegion

](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/preferredRegion)
