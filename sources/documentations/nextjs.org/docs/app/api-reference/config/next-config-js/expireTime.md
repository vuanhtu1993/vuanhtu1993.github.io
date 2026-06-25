---
title: "next.config.js: expireTime"
source_url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/expireTime"
crawled_at: "2026-06-25T07:14:07.494Z"
---

This page is also available as Markdown at [/docs/app/api-reference/config/next-config-js/expireTime.md](https://nextjs.org/docs/app/api-reference/config/next-config-js/expireTime.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

Last updated

June 16, 2025

You can specify a custom `stale-while-revalidate` expire time for CDNs to consume in the `Cache-Control` header for ISR enabled pages.

Open `next.config.js` and add the `expireTime` config:

Now when sending the `Cache-Control` header the expire time will be calculated depending on the specific revalidate period.

For example, if you have a revalidate of 15 minutes on a path and the expire time is one hour the generated `Cache-Control` header will be `s-maxage=900, stale-while-revalidate=2700` so that it can stay stale for 15 minutes less than the configured expire time.

[Previous

env

](https://nextjs.org/docs/app/api-reference/config/next-config-js/env)[Next

exportPathMap

](https://nextjs.org/docs/app/api-reference/config/next-config-js/exportPathMap)
