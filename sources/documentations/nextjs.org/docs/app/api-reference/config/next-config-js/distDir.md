---
title: "next.config.js: distDir"
source_url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/distDir"
crawled_at: "2026-06-25T07:13:54.629Z"
---

This page is also available as Markdown at [/docs/app/api-reference/config/next-config-js/distDir.md](https://nextjs.org/docs/app/api-reference/config/next-config-js/distDir.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

Last updated

June 16, 2025

You can specify a name to use for a custom build directory to use instead of `.next`.

Open `next.config.js` and add the `distDir` config:

Now if you run `next build` Next.js will use `build` instead of the default `.next` folder.

> `distDir` **should not** leave your project directory. For example, `../build` is an **invalid** directory.

[Previous

devIndicators

](https://nextjs.org/docs/app/api-reference/config/next-config-js/devIndicators)[Next

env

](https://nextjs.org/docs/app/api-reference/config/next-config-js/env)
