---
title: "next.config.js: sassOptions"
source_url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/sassOptions"
crawled_at: "2026-06-25T07:16:42.343Z"
---

This page is also available as Markdown at [/docs/app/api-reference/config/next-config-js/sassOptions.md](https://nextjs.org/docs/app/api-reference/config/next-config-js/sassOptions.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

Last updated

October 19, 2025

`sassOptions` allow you to configure the Sass compiler.

> **Good to know:**
> 
> -   `sassOptions` are not typed outside of `implementation` because Next.js does not maintain the other possible properties.
> -   The `functions` property for defining custom Sass functions is only supported with webpack. When using Turbopack, custom Sass functions are not available because Turbopack's Rust-based architecture cannot directly execute JavaScript functions passed through this option.

[Previous

rewrites

](https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites)[Next

serverActions

](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions)
