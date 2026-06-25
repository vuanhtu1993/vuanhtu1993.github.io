---
title: "next.config.js: allowedDevOrigins"
source_url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins"
crawled_at: "2026-06-25T07:12:28.848Z"
---

This page is also available as Markdown at [/docs/app/api-reference/config/next-config-js/allowedDevOrigins.md](https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

Last updated

March 17, 2026

Next.js blocks cross-origin requests to dev-only assets and endpoints during development by default to prevent unauthorized access.

To configure a Next.js application to allow requests from origins other than the hostname the server was initialized with (`localhost` by default), use the `allowedDevOrigins` config option.

`allowedDevOrigins` lets you set additional origins that can request the dev server in development mode. For example, to use `local-origin.dev` instead of only `localhost`, open `next.config.js` and add the `allowedDevOrigins` config:

[Previous

adapterPath

](https://nextjs.org/docs/app/api-reference/config/next-config-js/adapterPath)[Next

appDir

](https://nextjs.org/docs/app/api-reference/config/next-config-js/appDir)
