---
title: "File-system conventions: Dynamic Segments"
source_url: "https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes"
crawled_at: "2026-06-25T07:05:05.843Z"
---

Last updated

June 23, 2026

A URL path is a sequence of path segments. In the App Router, a segment may be **static** (a literal value matched exactly) or **dynamic** (a placeholder that captures a value from the URL). When you don't know a segment's value ahead of time, define a Dynamic Segment to create routes from dynamic data. Next.js passes the captured values to your page via the path `params` prop, either filled in at request time or prerendered at build time.

> **Good to know**: Dynamic Segments are often referred to as path params, route params, or URL params.

## Convention[](#convention)

A Dynamic Segment can be created by wrapping a folder's name in square brackets: `[folderName]`. For example, a blog could include the following route `app/blog/[slug]/page.js` where `[slug]` is the Dynamic Segment for blog posts.

Dynamic Segments are passed as the `params` prop to [`layout`](https://nextjs.org/docs/app/api-reference/file-conventions/layout), [`page`](https://nextjs.org/docs/app/api-reference/file-conventions/page), [`route`](https://nextjs.org/docs/app/api-reference/file-conventions/route), and [`generateMetadata`](https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function) functions.

| Route | Example URL | `params` |
| --- | --- | --- |
| `app/blog/[slug]/page.js` | `/blog/a` | `{ slug: 'a' }` |
| `app/blog/[slug]/page.js` | `/blog/b` | `{ slug: 'b' }` |
| `app/blog/[slug]/page.js` | `/blog/c` | `{ slug: 'c' }` |

### In Client Components[](#in-client-components)

In a Client Component **page**, dynamic segments from props can be accessed using the [`use`](https://react.dev/reference/react/use) API.

Alternatively Client Components can use the [`useParams`](https://nextjs.org/docs/app/api-reference/functions/use-params) hook to access the `params` anywhere in the Client Component tree.

### Catch-all Segments[](#catch-all-segments)

Dynamic Segments can be extended to **catch-all** subsequent segments by adding an ellipsis inside the brackets `[...folderName]`.

For example, `app/shop/[...slug]/page.js` will match `/shop/clothes`, but also `/shop/clothes/tops`, `/shop/clothes/tops/t-shirts`, and so on.

| Route | Example URL | `params` |
| --- | --- | --- |
| `app/shop/[...slug]/page.js` | `/shop/a` | `{ slug: ['a'] }` |
| `app/shop/[...slug]/page.js` | `/shop/a/b` | `{ slug: ['a', 'b'] }` |
| `app/shop/[...slug]/page.js` | `/shop/a/b/c` | `{ slug: ['a', 'b', 'c'] }` |

### Optional Catch-all Segments[](#optional-catch-all-segments)

Catch-all Segments can be made **optional** by including the parameter in double square brackets: `[[...folderName]]`.

For example, `app/shop/[[...slug]]/page.js` will **also** match `/shop`, in addition to `/shop/clothes`, `/shop/clothes/tops`, `/shop/clothes/tops/t-shirts`.

The difference between **catch-all** and **optional catch-all** segments is that with optional, the route without the parameter is also matched (`/shop` in the example above).

| Route | Example URL | `params` |
| --- | --- | --- |
| `app/shop/[[...slug]]/page.js` | `/shop` | `{ slug: undefined }` |
| `app/shop/[[...slug]]/page.js` | `/shop/a` | `{ slug: ['a'] }` |
| `app/shop/[[...slug]]/page.js` | `/shop/a/b` | `{ slug: ['a', 'b'] }` |
| `app/shop/[[...slug]]/page.js` | `/shop/a/b/c` | `{ slug: ['a', 'b', 'c'] }` |

### TypeScript[](#typescript)

When using TypeScript, you can add types for `params` depending on your configured route segment — use [`PageProps<'/route'>`](https://nextjs.org/docs/app/api-reference/file-conventions/page#page-props-helper), [`LayoutProps<'/route'>`](https://nextjs.org/docs/app/api-reference/file-conventions/layout#layout-props-helper), or [`RouteContext<'/route'>`](https://nextjs.org/docs/app/api-reference/file-conventions/route#route-context-helper) to type `params` in `page`, `layout`, and `route` respectively.

Route `params` values are typed as `string`, `string[]`, or `undefined` (for optional catch-all segments), because their values aren't known until runtime. Users can enter any URL into the address bar, and these broad types help ensure that your application code handles all these possible cases.

| Route | `params` Type Definition |
| --- | --- |
| `app/blog/[slug]/page.js` | `{ slug: string }` |
| `app/shop/[...slug]/page.js` | `{ slug: string[] }` |
| `app/shop/[[...slug]]/page.js` | `{ slug?: string[] }` |
| `app/[categoryId]/[itemId]/page.js` | `{ categoryId: string, itemId: string }` |

If you're working on a route where `params` can only have a fixed number of valid values, such as a `[locale]` param with a known set of language codes, you can use runtime validation to handle any invalid params a user may enter, and let the rest of your application work with the narrower type from your known set.

## Behavior[](#behavior)

-   Since the `params` prop is a promise. You must use `async`/`await` or React's use function to access the values.
    -   In version 14 and earlier, `params` was a synchronous prop. To help with backwards compatibility, you can still access it synchronously in Next.js 15, but this behavior will be deprecated in the future.

### With Cache Components[](#with-cache-components)

When using [Cache Components](https://nextjs.org/docs/app/getting-started/caching) with dynamic route segments, how you handle params depends on whether you use [`generateStaticParams`](https://nextjs.org/docs/app/api-reference/functions/generate-static-params).

Without `generateStaticParams`, param values are unknown during prerendering, making params runtime data. You must wrap param access in `<Suspense>` boundaries to provide fallback UI.

With `generateStaticParams`, you provide sample param values that can be used at build time. The build process validates that dynamic content and other runtime APIs are correctly handled, then generates static HTML files for the samples. Pages rendered with runtime params are saved to disk after a successful first request.

The sections below demonstrate both patterns.

#### Without `generateStaticParams`[](#without-generatestaticparams)

All params are runtime data. Param access must be wrapped by Suspense fallback UI. Next.js generates a static shell at build time, and content loads on each request.

> **Good to know**: You can also use [`loading.tsx`](https://nextjs.org/docs/app/api-reference/file-conventions/loading) for page-level fallback UI.

#### With `generateStaticParams`[](#with-generatestaticparams)

Provide params ahead of time to prerender pages at build time. You can prerender all routes or a subset depending on your needs.

During the build process, the route is executed with each sample param to collect the HTML result. If dynamic content or runtime data are accessed incorrectly, the build will fail.

Build-time validation only covers code paths that execute with the sample params. If your route has conditional logic that accesses runtime APIs for certain param values not in your samples, those branches won't be validated at build time:

For runtime params not returned by `generateStaticParams`, validation occurs during the first request. In the example above, requests for slugs starting with `private-` will fail because `PrivatePost` accesses `cookies()` without a Suspense boundary. Other runtime params that don't hit the conditional branch will render successfully and be saved to disk for subsequent requests.

To fix this, wrap `PrivatePost` with Suspense:

## Examples[](#examples)

### With `generateStaticParams`[](#with-generatestaticparams-1)

The [`generateStaticParams`](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) function can be used to [statically generate](https://nextjs.org/docs/app/glossary#prerendering) routes at build time instead of on-demand at request time.

When using `fetch` inside the `generateStaticParams` function, the requests are [automatically deduplicated](https://nextjs.org/docs/app/glossary#memoization). This avoids multiple network calls for the same data Layouts, Pages, and other `generateStaticParams` functions, speeding up build time.

### Dynamic GET Route Handlers with `generateStaticParams`[](#dynamic-get-route-handlers-with-generatestaticparams)

`generateStaticParams` also works with dynamic [Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route) to statically generate API responses at build time:

In this example, route handlers for all blog post IDs returned by `generateStaticParams` will be statically generated at build time. Requests to other IDs will be handled dynamically at request time.
