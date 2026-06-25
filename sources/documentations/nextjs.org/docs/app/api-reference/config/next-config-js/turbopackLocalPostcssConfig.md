---
title: "next.config.js: turbopackLocalPostcssConfig"
source_url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopackLocalPostcssConfig"
crawled_at: "2026-06-25T07:17:58.079Z"
---

This page is also available as Markdown at [/docs/app/api-reference/config/next-config-js/turbopackLocalPostcssConfig.md](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopackLocalPostcssConfig.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

Last updated

May 31, 2026

The `turbopackLocalPostcssConfig` option changes how Turbopack resolves `postcss.config.js` files. When enabled, Turbopack searches for the config starting from the CSS file's own directory first, then falls back to the project root. By default, Turbopack checks the project root first, meaning a root-level `postcss.config.js` always takes precedence over configs in subdirectories.

This option is only relevant when using Turbopack (`next dev` or `next build`).

## Usage[](#usage)

## Behavior[](#behavior)

| Setting | Config resolution order |
| --- | --- |
| `false` (default) | Project root → CSS file's directory |
| `true` | CSS file's directory → project root |

With the default behavior, a `postcss.config.js` at the project root is used for all CSS files, and per-directory configs are only applied if no root config exists. Enabling `turbopackLocalPostcssConfig` reverses this: per-directory configs take precedence, and the root config serves as the fallback.

## Example[](#example)

This is useful for projects that need different PostCSS transforms in different directories, such as a monorepo with multiple apps or design system packages:

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v16.3.0` | `turbopackLocalPostcssConfig` introduced. |

[Previous

turbopack.ignoreIssue

](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopackIgnoreIssue)[Next

typedRoutes

](https://nextjs.org/docs/app/api-reference/config/next-config-js/typedRoutes)
