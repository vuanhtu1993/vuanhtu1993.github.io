---
title: "File-system conventions: Route Segment Config"
source_url: "https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config"
crawled_at: "2026-06-25T07:07:37.818Z"
---

This page is also available as Markdown at [/docs/app/api-reference/file-conventions/route-segment-config.md](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

Last updated

March 13, 2026

The Route Segment Config options allow you to configure the behavior of a [Page](https://nextjs.org/docs/app/api-reference/file-conventions/page), [Layout](https://nextjs.org/docs/app/api-reference/file-conventions/layout), or [Route Handler](https://nextjs.org/docs/app/api-reference/file-conventions/route) by directly exporting the following variables:

| Option | Type | Default |
| --- | --- | --- |
| [`dynamicParams`](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/dynamicParams) | `boolean` | `true` |
| [`runtime`](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/runtime) | `'nodejs' | 'edge'` | `'nodejs'` |
| [`preferredRegion`](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/preferredRegion) | `'auto' | 'global' | 'home' | string | string[]` | `'auto'` |
| [`maxDuration`](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/maxDuration) | `number` | Set by deployment platform |

## Version History[](#version-history)

| Version |  |
| --- | --- |
| `v16.0.0` | `dynamic`, `dynamicParams`, `revalidate`, and `fetchCache` removed when [Cache Components](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents) is enabled. See [Caching and Revalidating (Previous Model)](https://nextjs.org/docs/app/guides/caching-without-cache-components#route-segment-config). |
| `v16.0.0` | `export const experimental_ppr = true` removed. A [codemod](https://nextjs.org/docs/app/guides/upgrading/codemods#remove-experimental_ppr-route-segment-config-from-app-router-pages-and-layouts) is available. |
| `v15.0.0-RC` | `export const runtime = "experimental-edge"` deprecated. A [codemod](https://nextjs.org/docs/app/guides/upgrading/codemods#transform-app-router-route-segment-config-runtime-value-from-experimental-edge-to-edge) is available. |

[Previous

sitemap.xml

](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)[Next

dynamicParams

](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/dynamicParams)
