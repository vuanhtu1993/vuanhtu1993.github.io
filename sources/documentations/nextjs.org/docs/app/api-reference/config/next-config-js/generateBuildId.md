---
title: "next.config.js: generateBuildId"
source_url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/generateBuildId"
crawled_at: "2026-06-25T07:14:19.931Z"
---

This page is also available as Markdown at [/docs/app/api-reference/config/next-config-js/generateBuildId.md](https://nextjs.org/docs/app/api-reference/config/next-config-js/generateBuildId.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

Last updated

June 16, 2025

Next.js generates an ID during `next build` to identify which version of your application is being served. The same build should be used and boot up multiple containers.

If you are rebuilding for each stage of your environment, you will need to generate a consistent build ID to use between containers. Use the `generateBuildId` command in `next.config.js`:

[Previous

exportPathMap

](https://nextjs.org/docs/app/api-reference/config/next-config-js/exportPathMap)[Next

generateEtags

](https://nextjs.org/docs/app/api-reference/config/next-config-js/generateEtags)
