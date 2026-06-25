---
title: "next.config.js: staticGeneration*"
source_url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/staticGeneration"
crawled_at: "2026-06-25T07:17:16.033Z"
---

This page is also available as Markdown at [/docs/app/api-reference/config/next-config-js/staticGeneration.md](https://nextjs.org/docs/app/api-reference/config/next-config-js/staticGeneration.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

This feature is currently experimental and subject to change, it's not recommended for production. Try it out and share your feedback on [GitHub](https://github.com/vercel/next.js/issues).

Last updated

June 16, 2025

The `staticGeneration*` options allow you to configure the Static Generation process for advanced use cases.

## Config Options[](#config-options)

The following options are available:

-   `staticGenerationRetryCount`: The number of times to retry a failed page generation before failing the build.
-   `staticGenerationMaxConcurrency`: The maximum number of pages to be processed per worker.
-   `staticGenerationMinPagesPerWorker`: The minimum number of pages to be processed before starting a new worker.

[Previous

staleTimes

](https://nextjs.org/docs/app/api-reference/config/next-config-js/staleTimes)[Next

taint

](https://nextjs.org/docs/app/api-reference/config/next-config-js/taint)
