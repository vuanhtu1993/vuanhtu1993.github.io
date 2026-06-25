---
title: "Functions: generateStaticParams"
source_url: "https://nextjs.org/docs/app/api-reference/functions/generate-static-params"
crawled_at: "2026-06-25T07:09:27.241Z"
---

Last updated

March 13, 2026

The `generateStaticParams` function can be used in combination with [dynamic route segments](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes) to [**statically generate**](https://nextjs.org/docs/app/glossary#prerendering) routes at build time instead of on-demand at request time.

`generateStaticParams` can be used with:

-   [Pages](https://nextjs.org/docs/app/api-reference/file-conventions/page) (`page.tsx`/`page.js`)
-   [Layouts](https://nextjs.org/docs/app/api-reference/file-conventions/layout) (`layout.tsx`/`layout.js`)
-   [Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route) (`route.ts`/`route.js`)

> **Good to know**:
> 
> -   You can use the [`dynamicParams`](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/dynamicParams) segment config option to control what happens when a dynamic segment is visited that was not generated with `generateStaticParams`.
> -   You must return [an empty array from `generateStaticParams`](#all-paths-at-build-time) or utilize [`export const dynamic = 'force-static'`](https://nextjs.org/docs/app/guides/caching-without-cache-components#dynamic) in order to revalidate (ISR) [paths at runtime](#all-paths-at-runtime).
> -   During `next dev`, `generateStaticParams` will be called when you navigate to a route.
> -   During `next build`, `generateStaticParams` runs before the corresponding Layouts or Pages are generated.
> -   During revalidation (ISR), `generateStaticParams` will not be called again.
> -   `generateStaticParams` replaces the [`getStaticPaths`](https://nextjs.org/docs/pages/api-reference/functions/get-static-paths) function in the Pages Router.

## Parameters[](#parameters)

`options.params` (optional)

If multiple dynamic segments in a route use `generateStaticParams`, the child `generateStaticParams` function is executed once for each set of `params` the parent generates.

The `params` object contains the populated `params` from the parent `generateStaticParams`, which can be used to [generate the `params` in a child segment](#multiple-dynamic-segments-in-a-route).

## Returns[](#returns)

`generateStaticParams` should return an array of objects where each object represents the populated dynamic segments of a single route.

-   Each property in the object is a dynamic segment to be filled in for the route.
-   The properties name is the segment's name, and the properties value is what that segment should be filled in with.

| Example Route | `generateStaticParams` Return Type |
| --- | --- |
| `/product/[id]` | `{ id: string }[]` |
| `/products/[category]/[product]` | `{ category: string, product: string }[]` |
| `/products/[...slug]` | `{ slug: string[] }[]` |

## Single Dynamic Segment[](#single-dynamic-segment)

## Multiple Dynamic Segments[](#multiple-dynamic-segments)

## Catch-all Dynamic Segment[](#catch-all-dynamic-segment)

## Examples[](#examples)

### Prerendering[](#prerendering)

#### All paths at build time[](#all-paths-at-build-time)

To statically render all paths at build time, supply the full list of paths to `generateStaticParams`:

#### Subset of paths at build time[](#subset-of-paths-at-build-time)

To statically render a subset of paths at build time, and the rest the first time they're visited at runtime, return a partial list of paths:

Then, by using the [`dynamicParams`](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/dynamicParams) segment config option, you can control what happens when a dynamic segment is visited that was not generated with `generateStaticParams`.

#### All paths at runtime[](#all-paths-at-runtime)

To statically render all paths the first time they're visited, return an empty array (no paths will be rendered at build time) or utilize [`export const dynamic = 'force-static'`](https://nextjs.org/docs/app/guides/caching-without-cache-components#dynamic):

> **Good to know:**
> 
> -   You must always return an array from `generateStaticParams`, even if it's empty. Otherwise, the route will be dynamically rendered.

#### With Cache Components[](#with-cache-components)

When using [Cache Components](https://nextjs.org/docs/app/getting-started/caching) with dynamic routes, `generateStaticParams` must return **at least one param**. Empty arrays cause a [build error](https://nextjs.org/docs/messages/empty-generate-static-params). This allows Cache Components to validate your route doesn't incorrectly access `cookies()`, `headers()`, or `searchParams` at runtime.

> **Good to know**: If you don't know the actual param values at build time, you can return a placeholder param (e.g., `[{ slug: '__placeholder__' }]`) for validation, then handle it in your page with `notFound()`. However, this prevents build time validation from working effectively and may cause runtime errors.

See the [dynamic routes section](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes#with-cache-components) for detailed walkthroughs.

### With Route Handlers[](#with-route-handlers)

You can use `generateStaticParams` with [Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route) to statically generate API responses at build time:

### Route Handlers with Cache Components[](#route-handlers-with-cache-components)

When using [Cache Components](https://nextjs.org/docs/app/getting-started/caching), combine with `use cache` for optimal caching:

See the [Route Handlers documentation](https://nextjs.org/docs/app/api-reference/file-conventions/route#static-generation-with-generatestaticparams) for more details.

### Disable rendering for unspecified paths[](#disable-rendering-for-unspecified-paths)

To prevent unspecified paths from being prerendered at runtime, add the `export const dynamicParams = false` option in a route segment. When this config option is used, only paths provided by `generateStaticParams` will be served, and unspecified routes will 404 or match (in the case of [catch-all routes](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes#catch-all-segments)).

### Multiple Dynamic Segments in a Route[](#multiple-dynamic-segments-in-a-route)

You can generate params for dynamic segments above the current layout or page, but **not below**. For example, given the `app/products/[category]/[product]` route:

-   `app/products/[category]/[product]/page.js` can generate params for **both** `[category]` and `[product]`.
-   `app/products/[category]/layout.js` can **only** generate params for `[category]`.

There are two approaches to generating params for a route with multiple dynamic segments:

#### Generate params from the bottom up[](#generate-params-from-the-bottom-up)

Generate multiple dynamic segments from the child route segment.

#### Generate params from the top down[](#generate-params-from-the-top-down)

Generate the parent segments first and use the result to generate the child segments.

A child route segment's `generateStaticParams` function is executed once for each segment a parent `generateStaticParams` generates.

The child `generateStaticParams` function can use the `params` returned from the parent `generateStaticParams` function to dynamically generate its own segments.

Notice that the params argument can be accessed synchronously and includes only parent segment params.

For type completion, you can make use of the TypeScript `Awaited` helper in combination with either [`Page Props helper`](https://nextjs.org/docs/app/api-reference/file-conventions/page#page-props-helper) or [`Layout Props helper`](https://nextjs.org/docs/app/api-reference/file-conventions/layout#layout-props-helper):

> **Good to know**: `fetch` requests are automatically [memoized](https://nextjs.org/docs/app/glossary#memoization) for the same data across all `generate`\-prefixed functions, Layouts, Pages, and Server Components. React [`cache` can be used](https://react.dev/reference/react/cache) if `fetch` is unavailable.

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v13.0.0` | `generateStaticParams` introduced. |
