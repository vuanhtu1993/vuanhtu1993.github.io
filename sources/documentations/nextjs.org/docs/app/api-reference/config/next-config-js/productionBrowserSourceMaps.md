---
title: "next.config.js: productionBrowserSourceMaps"
source_url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/productionBrowserSourceMaps"
crawled_at: "2026-06-25T07:15:56.798Z"
---

This page is also available as Markdown at [/docs/app/api-reference/config/next-config-js/productionBrowserSourceMaps.md](https://nextjs.org/docs/app/api-reference/config/next-config-js/productionBrowserSourceMaps.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

Last updated

June 16, 2025

Source Maps are enabled by default during development. During production builds, they are disabled to prevent you leaking your source on the client, unless you specifically opt-in with the configuration flag.

Next.js provides a configuration flag you can use to enable browser source map generation during the production build:

When the `productionBrowserSourceMaps` option is enabled, the source maps will be output in the same directory as the JavaScript files. Next.js will automatically serve these files when requested.

-   Adding source maps can increase `next build` time
-   Increases memory usage during `next build`

[Previous

poweredByHeader

](https://nextjs.org/docs/app/api-reference/config/next-config-js/poweredByHeader)[Next

proxyClientMaxBodySize

](https://nextjs.org/docs/app/api-reference/config/next-config-js/proxyClientMaxBodySize)
