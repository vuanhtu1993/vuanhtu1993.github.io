---
title: "File-system conventions: mdx-components.js"
source_url: "https://nextjs.org/docs/app/api-reference/file-conventions/mdx-components"
crawled_at: "2026-06-25T07:05:56.466Z"
---

This page is also available as Markdown at [/docs/app/api-reference/file-conventions/mdx-components.md](https://nextjs.org/docs/app/api-reference/file-conventions/mdx-components.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

Last updated

July 29, 2025

The `mdx-components.js|tsx` file is **required** to use [`@next/mdx` with App Router](https://nextjs.org/docs/app/guides/mdx) and will not work without it. Additionally, you can use it to [customize styles](https://nextjs.org/docs/app/guides/mdx#using-custom-styles-and-components).

Use the file `mdx-components.tsx` (or `.js`) in the root of your project to define MDX Components. For example, at the same level as `pages` or `app`, or inside `src` if applicable.

## Exports[](#exports)

### `useMDXComponents` function[](#usemdxcomponents-function)

The file must export a single function named `useMDXComponents`. This function does not accept any arguments.

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v13.1.2` | MDX Components added |

[Previous

loading.js

](https://nextjs.org/docs/app/api-reference/file-conventions/loading)[Next

not-found.js

](https://nextjs.org/docs/app/api-reference/file-conventions/not-found)
