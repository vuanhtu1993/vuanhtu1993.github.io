---
title: "Upgrading: Version 14"
source_url: "https://nextjs.org/docs/app/guides/upgrading/version-14"
crawled_at: "2026-06-25T07:03:14.884Z"
---

This page is also available as Markdown at [/docs/app/guides/upgrading/version-14.md](https://nextjs.org/docs/app/guides/upgrading/version-14.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

## How to upgrade to version 14

Last updated

April 22, 2025

## Upgrading from 13 to 14[](#upgrading-from-13-to-14)

To update to Next.js version 14, run the following command using your preferred package manager:

> **Good to know:** If you are using TypeScript, ensure you also upgrade `@types/react` and `@types/react-dom` to their latest versions.

### v14 Summary[](#v14-summary)

-   The minimum Node.js version has been bumped from 16.14 to 18.17, since 16.x has reached end-of-life.
-   The `next export` command has been removed in favor of `output: 'export'` config. Please see the [docs](https://nextjs.org/docs/app/guides/static-exports) for more information.
-   The `next/server` import for `ImageResponse` was renamed to `next/og`. A [codemod is available](https://nextjs.org/docs/app/guides/upgrading/codemods#next-og-import) to safely and automatically rename your imports.
-   The `@next/font` package has been fully removed in favor of the built-in `next/font`. A [codemod is available](https://nextjs.org/docs/app/guides/upgrading/codemods#built-in-next-font) to safely and automatically rename your imports.
-   The WASM target for `next-swc` has been removed.

[Previous

Codemods

](https://nextjs.org/docs/app/guides/upgrading/codemods)[Next

Version 15

](https://nextjs.org/docs/app/guides/upgrading/version-15)
