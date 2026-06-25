---
title: "Functions: generateViewport"
source_url: "https://nextjs.org/docs/app/api-reference/functions/generate-viewport"
crawled_at: "2026-06-25T07:09:33.845Z"
---

Last updated

March 5, 2026

You can customize the initial viewport of the page with the static `viewport` object or the dynamic `generateViewport` function.

> **Good to know**:
> 
> -   The `viewport` object and `generateViewport` function exports are **only supported in Server Components**.
> -   You cannot export both the `viewport` object and `generateViewport` function from the same route segment.
> -   If you're coming from migrating `metadata` exports, you can use [metadata-to-viewport-export codemod](https://nextjs.org/docs/app/guides/upgrading/codemods#metadata-to-viewport-export) to update your changes.

## The `viewport` object[](#the-viewport-object)

To define the viewport options, export a `viewport` object from a `layout.jsx` or `page.jsx` file.

## `generateViewport` function[](#generateviewport-function)

`generateViewport` should return a [`Viewport` object](#viewport-fields) containing one or more viewport fields.

In TypeScript, the `params` argument can be typed via [`PageProps<'/route'>`](https://nextjs.org/docs/app/api-reference/file-conventions/page#page-props-helper) or [`LayoutProps<'/route'>`](https://nextjs.org/docs/app/api-reference/file-conventions/layout#layout-props-helper) depending on where `generateViewport` is defined.

> **Good to know**:
> 
> -   If the viewport doesn't depend on request information, it should be defined using the static [`viewport` object](#the-viewport-object) rather than `generateViewport`.

## Viewport Fields[](#viewport-fields)

### `themeColor`[](#themecolor)

Learn more about [`theme-color`](https://developer.mozilla.org/docs/Web/HTML/Element/meta/name/theme-color).

**Simple theme color**

**With media attribute**

### `width`, `initialScale`, `maximumScale` and `userScalable`[](#width-initialscale-maximumscale-and-userscalable)

> **Good to know**: The `viewport` meta tag is automatically set, and manual configuration is usually unnecessary as the default is sufficient. However, the information is provided for completeness.

### `colorScheme`[](#colorscheme)

Learn more about [`color-scheme`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta/name#:~:text=color%2Dscheme%3A%20specifies,of%20the%20following%3A).

## With Cache Components[](#with-cache-components)

When [Cache Components](https://nextjs.org/docs/app/getting-started/caching) is enabled, `generateViewport` follows the same rules as other components. If viewport accesses runtime data (`cookies()`, `headers()`, `params`, `searchParams`) or performs uncached data fetching, it defers to request time.

Unlike metadata, viewport cannot be streamed because it affects initial page load UI. If `generateViewport` defers to request time, the page would need to block until resolved.

If viewport depends on external data but not runtime data, use `use cache`:

If viewport genuinely requires runtime data, wrap the document `<body>` in a Suspense boundary to signal that the entire route should be dynamic:

Caching is preferred because it allows static shell generation. Wrapping the document `body` in Suspense means there is no static shell or content to immediately send when a request arrives, making the entire route block until ready on every request.

> **Good to know**: Use [multiple root layouts](https://nextjs.org/docs/app/api-reference/file-conventions/layout#root-layout) to isolate fully dynamic viewport to specific routes, while still letting other routes in your application generate a static shell.

## Types[](#types)

You can add type safety to your viewport object by using the `Viewport` type. If you are using the [built-in TypeScript plugin](https://nextjs.org/docs/app/api-reference/config/typescript) in your IDE, you do not need to manually add the type, but you can still explicitly add it if you want.

### `viewport` object[](#viewport-object)

### `generateViewport` function[](#generateviewport-function-1)

#### Regular function[](#regular-function)

#### With segment props[](#with-segment-props)

#### JavaScript Projects[](#javascript-projects)

For JavaScript projects, you can use JSDoc to add type safety.

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v14.0.0` | `viewport` and `generateViewport` introduced. |
