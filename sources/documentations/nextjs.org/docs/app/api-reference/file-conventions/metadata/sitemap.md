---
title: "Metadata Files: sitemap.xml"
source_url: "https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap"
crawled_at: "2026-06-25T07:07:31.539Z"
---

Last updated

March 3, 2026

`sitemap.(xml|js|ts)` is a special file that matches the [Sitemaps XML format](https://www.sitemaps.org/protocol.html) to help search engine crawlers index your site more efficiently.

### Sitemap files (.xml)[](#sitemap-files-xml)

For smaller applications, you can create a `sitemap.xml` file and place it in the root of your `app` directory.

### Generating a sitemap using code (.js, .ts)[](#generating-a-sitemap-using-code-js-ts)

You can use the `sitemap.(js|ts)` file convention to programmatically **generate** a sitemap by exporting a default function that returns an array of URLs. If using TypeScript, a [`Sitemap`](#returns) type is available.

> **Good to know**: `sitemap.js` is a special Route Handler that is cached by default unless it uses a [Request-time API](https://nextjs.org/docs/app/glossary#request-time-apis) or [dynamic config](https://nextjs.org/docs/app/guides/caching-without-cache-components#dynamic) option.

Output:

### Image Sitemaps[](#image-sitemaps)

You can use `images` property to create image sitemaps. Learn more details in the [Google Developer Docs](https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps).

Output:

### Video Sitemaps[](#video-sitemaps)

You can use `videos` property to create video sitemaps. Learn more details in the [Google Developer Docs](https://developers.google.com/search/docs/crawling-indexing/sitemaps/video-sitemaps).

Output:

### Generate a localized Sitemap[](#generate-a-localized-sitemap)

Output:

### Generating multiple sitemaps[](#generating-multiple-sitemaps)

While a single sitemap will work for most applications. For large web applications, you may need to split a sitemap into multiple files.

There are two ways you can create multiple sitemaps:

-   By nesting `sitemap.(xml|js|ts)` inside multiple route segments e.g. `app/sitemap.xml` and `app/products/sitemap.xml`.
-   By using the [`generateSitemaps`](https://nextjs.org/docs/app/api-reference/functions/generate-sitemaps) function.

For example, to split a sitemap using `generateSitemaps`, return an array of objects with the sitemap `id`. Then, use the `id` to generate the unique sitemaps.

Your generated sitemaps will be available at `/.../sitemap/[id]`. For example, `/product/sitemap/1.xml`.

See the [`generateSitemaps` API reference](https://nextjs.org/docs/app/api-reference/functions/generate-sitemaps) for more information.

## Returns[](#returns)

The default function exported from `sitemap.(xml|ts|js)` should return an array of objects with the following properties:

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v16.0.0` | `id` is now a promise that resolves to a `string`. |
| `v14.2.0` | Add localizations support. |
| `v13.4.14` | Add `changeFrequency` and `priority` attributes to sitemaps. |
| `v13.3.0` | `sitemap` introduced. |
