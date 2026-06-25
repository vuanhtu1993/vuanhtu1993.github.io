---
title: "Functions: ImageResponse"
source_url: "https://nextjs.org/docs/app/api-reference/functions/image-response"
crawled_at: "2026-06-25T07:09:47.031Z"
---

Last updated

June 16, 2025

The `ImageResponse` constructor allows you to generate dynamic images using JSX and CSS. This is useful for generating social media images such as Open Graph images, Twitter cards, and more.

## Reference[](#reference)

### Parameters[](#parameters)

The following parameters are available for `ImageResponse`:

> Examples are available in the [Vercel OG Playground](https://og-playground.vercel.app/).

### Supported HTML and CSS features[](#supported-html-and-css-features)

`ImageResponse` supports common CSS properties including flexbox and absolute positioning, custom fonts, text wrapping, centering, and nested images.

Please refer to [Satori’s documentation](https://github.com/vercel/satori#css) for a list of supported HTML and CSS features.

## Behavior[](#behavior)

-   `ImageResponse` uses [@vercel/og](https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation), [Satori](https://github.com/vercel/satori), and Resvg to convert HTML and CSS into PNG.
-   Only flexbox and a subset of CSS properties are supported. Advanced layouts (e.g. `display: grid`) will not work.
-   Maximum bundle size of `500KB`. The bundle size includes your JSX, CSS, fonts, images, and any other assets. If you exceed the limit, consider reducing the size of any assets or fetching at runtime.
-   Only `ttf`, `otf`, and `woff` font formats are supported. To maximize the font parsing speed, `ttf` or `otf` are preferred over `woff`.

## Examples[](#examples)

### Route Handlers[](#route-handlers)

`ImageResponse` can be used in Route Handlers to generate images dynamically at request time.

### File-based Metadata[](#file-based-metadata)

You can use `ImageResponse` in a [`opengraph-image.tsx`](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image) file to generate Open Graph images at build time or dynamically at request time.

### Custom fonts[](#custom-fonts)

You can use custom fonts in your `ImageResponse` by providing a `fonts` array in the options.

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v14.0.0` | `ImageResponse` moved from `next/server` to `next/og` |
| `v13.3.0` | `ImageResponse` can be imported from `next/server`. |
| `v13.0.0` | `ImageResponse` introduced via `@vercel/og` package. |
