---
title: "next.config.js: typescript"
source_url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/typescript"
crawled_at: "2026-06-25T07:18:10.301Z"
---

This page is also available as Markdown at [/docs/app/api-reference/config/next-config-js/typescript.md](https://nextjs.org/docs/app/api-reference/config/next-config-js/typescript.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

Last updated

March 18, 2026

Configure TypeScript behavior with the `typescript` option in `next.config.js`:

## Options[](#options)

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `ignoreBuildErrors` | `boolean` | `false` | Allow production builds to complete even with TypeScript errors. |
| `tsconfigPath` | `string` | `'tsconfig.json'` | Path to a custom `tsconfig.json` file. |

## `ignoreBuildErrors`[](#ignorebuilderrors)

Next.js fails your **production build** (`next build`) when TypeScript errors are present in your project.

If you'd like Next.js to dangerously produce production code even when your application has errors, you can disable the built-in type checking step.

Note that this completely skips the TypeScript type checking step. It does not run TypeScript and suppress errors, it bypasses the check entirely.

If disabled, be sure you are running type checks as part of your build or deploy process, otherwise this can be very dangerous.

## `tsconfigPath`[](#tsconfigpath)

Use a different TypeScript configuration file for builds or tooling:

See the [TypeScript configuration](https://nextjs.org/docs/app/api-reference/config/typescript#custom-tsconfig-path) page for more details.

[Previous

typedRoutes

](https://nextjs.org/docs/app/api-reference/config/next-config-js/typedRoutes)[Next

urlImports

](https://nextjs.org/docs/app/api-reference/config/next-config-js/urlImports)
