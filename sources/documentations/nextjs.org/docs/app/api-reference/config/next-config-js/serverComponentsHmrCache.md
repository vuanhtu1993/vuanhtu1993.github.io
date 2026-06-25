---
title: "next.config.js: serverComponentsHmrCache"
source_url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/serverComponentsHmrCache"
crawled_at: "2026-06-25T07:16:56.151Z"
---

This page is also available as Markdown at [/docs/app/api-reference/config/next-config-js/serverComponentsHmrCache.md](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverComponentsHmrCache.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

This feature is currently experimental and subject to change, it's not recommended for production. Try it out and share your feedback on [GitHub](https://github.com/vercel/next.js/issues).

Last updated

June 16, 2025

The experimental `serverComponentsHmrCache` option allows you to cache `fetch` responses in Server Components across Hot Module Replacement (HMR) refreshes in local development. This results in faster responses and reduced costs for billed API calls.

By default, the HMR cache applies to all `fetch` requests, including those with the `cache: 'no-store'` option. This means uncached requests will not show fresh data between HMR refreshes. However, the cache will be cleared on navigation or full-page reloads.

You can disable the HMR cache by setting `serverComponentsHmrCache` to `false` in your `next.config.js` file:

> **Good to know:** For better observability, we recommend using the [`logging.fetches`](https://nextjs.org/docs/app/api-reference/config/next-config-js/logging) option which logs fetch cache hits and misses in the console during development.

[Previous

serverActions

](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions)[Next

serverExternalPackages

](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverExternalPackages)
