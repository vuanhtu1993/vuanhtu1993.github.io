---
title: "File-system conventions: Metadata Files"
source_url: "https://nextjs.org/docs/app/api-reference/file-conventions/metadata"
crawled_at: "2026-06-25T07:07:04.021Z"
---

This page is also available as Markdown at [/docs/app/api-reference/file-conventions/metadata.md](https://nextjs.org/docs/app/api-reference/file-conventions/metadata.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

## Metadata Files API Reference

Last updated

October 17, 2025

This section of the docs covers **Metadata file conventions**. File-based metadata can be defined by adding special metadata files to route segments.

Each file convention can be defined using a static file (e.g. `opengraph-image.jpg`), or a dynamic variant that uses code to generate the file (e.g. `opengraph-image.js`).

Once a file is defined, Next.js will automatically serve the file (with hashes in production for caching) and update the relevant head elements with the correct metadata, such as the asset's URL, file type, and image size.

> **Good to know**:
> 
> -   Special Route Handlers like [`sitemap.ts`](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap), [`opengraph-image.tsx`](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image), and [`icon.tsx`](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons), and other [metadata files](https://nextjs.org/docs/app/api-reference/file-conventions/metadata) are cached by default.
> -   If using along with [`proxy.ts`](https://nextjs.org/docs/app/api-reference/file-conventions/proxy), [configure the matcher](https://nextjs.org/docs/app/api-reference/file-conventions/proxy#matcher) to exclude the metadata files.

[Previous

unauthorized.js

](https://nextjs.org/docs/app/api-reference/file-conventions/unauthorized)[Next

favicon, icon, and apple-icon

](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons)
