---
title: "Metadata Files: opengraph-image and twitter-image"
source_url: "https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image"
crawled_at: "2026-06-25T07:07:20.754Z"
---

Last updated

March 3, 2026

The `opengraph-image` and `twitter-image` file conventions allow you to set Open Graph and Twitter images for a route segment.

They are useful for setting the images that appear on social networks and messaging apps when a user shares a link to your site.

There are two ways to set Open Graph and Twitter images:

-   [Using image files (.jpg, .png, .gif)](#image-files-jpg-png-gif)
-   [Using code to generate images (.js, .ts, .tsx)](#generate-images-using-code-js-ts-tsx)

## Image files (.jpg, .png, .gif)[](#image-files-jpg-png-gif)

Use an image file to set a route segment's shared image by placing an `opengraph-image` or `twitter-image` image file in the segment.

Next.js will evaluate the file and automatically add the appropriate tags to your app's `<head>` element.

| File convention | Supported file types |
| --- | --- |
| [`opengraph-image`](#opengraph-image) | `.jpg`, `.jpeg`, `.png`, `.gif` |
| [`twitter-image`](#twitter-image) | `.jpg`, `.jpeg`, `.png`, `.gif` |
| [`opengraph-image.alt`](#opengraph-imagealttxt) | `.txt` |
| [`twitter-image.alt`](#twitter-imagealttxt) | `.txt` |

> **Good to know**:
> 
> The `twitter-image` file size must not exceed [5MB](https://developer.x.com/en/docs/x-for-websites/cards/overview/summary), and the `opengraph-image` file size must not exceed [8MB](https://developers.facebook.com/docs/sharing/webmasters/images). If the image file size exceeds these limits, the build will fail.

### `opengraph-image`[](#opengraph-image)

Add an `opengraph-image.(jpg|jpeg|png|gif)` image file to any route segment.

### `twitter-image`[](#twitter-image)

Add a `twitter-image.(jpg|jpeg|png|gif)` image file to any route segment.

### `opengraph-image.alt.txt`[](#opengraph-imagealttxt)

Add an accompanying `opengraph-image.alt.txt` file in the same route segment as the `opengraph-image.(jpg|jpeg|png|gif)` image it's alt text.

### `twitter-image.alt.txt`[](#twitter-imagealttxt)

Add an accompanying `twitter-image.alt.txt` file in the same route segment as the `twitter-image.(jpg|jpeg|png|gif)` image it's alt text.

## Generate images using code (.js, .ts, .tsx)[](#generate-images-using-code-js-ts-tsx)

In addition to using [literal image files](#image-files-jpg-png-gif), you can programmatically **generate** images using code.

Generate a route segment's shared image by creating an `opengraph-image` or `twitter-image` route that default exports a function.

| File convention | Supported file types |
| --- | --- |
| `opengraph-image` | `.js`, `.ts`, `.tsx` |
| `twitter-image` | `.js`, `.ts`, `.tsx` |

> **Good to know**:
> 
> -   By default, generated images are [**statically optimized**](https://nextjs.org/docs/app/glossary#prerendering) (generated at build time and cached) unless they use [Request-time APIs](https://nextjs.org/docs/app/glossary#request-time-apis) or uncached data.
> -   You can generate multiple Images in the same file using [`generateImageMetadata`](https://nextjs.org/docs/app/api-reference/functions/generate-image-metadata).
> -   `opengraph-image.js` and `twitter-image.js` are special Route Handlers that is cached by default unless it uses a [Request-time API](https://nextjs.org/docs/app/glossary#request-time-apis) or [dynamic config](https://nextjs.org/docs/app/guides/caching-without-cache-components#dynamic) option.

The easiest way to generate an image is to use the [ImageResponse](https://nextjs.org/docs/app/api-reference/functions/image-response) API from `next/og`.

### Props[](#props)

The default export function receives the following props:

#### `params` (optional)[](#params-optional)

A promise that resolves to an object containing the [dynamic route parameters](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes) object from the root segment down to the segment `opengraph-image` or `twitter-image` is colocated in.

> **Good to know**: If you use [`generateImageMetadata`](https://nextjs.org/docs/app/api-reference/functions/generate-image-metadata), the function will also receive an `id` prop that is a promise resolving to the `id` value from one of the items returned by `generateImageMetadata`.

| Route | URL | `params` |
| --- | --- | --- |
| `app/shop/opengraph-image.js` | `/shop` | `undefined` |
| `app/shop/[slug]/opengraph-image.js` | `/shop/1` | `Promise<{ slug: '1' }>` |
| `app/shop/[tag]/[item]/opengraph-image.js` | `/shop/1/2` | `Promise<{ tag: '1', item: '2' }>` |

### Returns[](#returns)

The default export function should return a `Blob` | `ArrayBuffer` | `TypedArray` | `DataView` | `ReadableStream` | `Response`.

> **Good to know**: `ImageResponse` satisfies this return type.

### Config exports[](#config-exports)

You can optionally configure the image's metadata by exporting `alt`, `size`, and `contentType` variables from `opengraph-image` or `twitter-image` route.

| Option | Type |
| --- | --- |
| [`alt`](#alt) | `string` |
| [`size`](#size) | `{ width: number; height: number }` |
| [`contentType`](#contenttype) | `string` - [image MIME type](https://developer.mozilla.org/docs/Web/HTTP/Basics_of_HTTP/MIME_types#image_types) |

#### `alt`[](#alt)

#### `size`[](#size)

#### `contentType`[](#contenttype)

#### Route Segment Config[](#route-segment-config)

`opengraph-image` and `twitter-image` are specialized [Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route) that can use the same [route segment configuration](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config) options as Pages and Layouts.

### Examples[](#examples)

#### Using external data[](#using-external-data)

This example uses the `params` object and external data to generate the image.

> **Good to know**: By default, this generated image will be statically optimized. You can configure the individual `fetch` [`options`](https://nextjs.org/docs/app/api-reference/functions/fetch) or route segments [options](https://nextjs.org/docs/app/guides/caching-without-cache-components#route-segment-config-revalidate) to change this behavior.

#### Using Node.js runtime with local assets[](#using-nodejs-runtime-with-local-assets)

These examples use the Node.js runtime to fetch a local image from the file system and pass it to the `<img>` `src` attribute, either as a base64 string or an `ArrayBuffer`. Place the local asset relative to the project root, not the example source file.

Passing an `ArrayBuffer` to the `src` attribute of an `<img>` element is not part of the HTML spec. The rendering engine used by `next/og` supports it, but because TypeScript definitions follow the spec, you need a `@ts-expect-error` directive or similar to use this [feature](https://github.com/vercel/satori/issues/606#issuecomment-2144000453).

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v16.0.0` | `params` is now a promise that resolves to an object |
| `v13.3.0` | `opengraph-image` and `twitter-image` introduced. |
