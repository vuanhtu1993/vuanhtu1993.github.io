---
title: "Functions: generateMetadata"
source_url: "https://nextjs.org/docs/app/api-reference/functions/generate-metadata"
crawled_at: "2026-06-25T07:09:13.294Z"
---

Last updated

March 3, 2026

You can use the `metadata` object or the `generateMetadata` function to define metadata.

To define static metadata, export a [`Metadata` object](#metadata-fields) from a `layout.js` or `page.js` file.

> See the [Metadata Fields](#metadata-fields) for a complete list of supported options.

Dynamic metadata depends on **dynamic information**, such as the current route parameters, external data, or `metadata` in parent segments, can be set by exporting a `generateMetadata` function that returns a [`Metadata` object](#metadata-fields).

Resolving `generateMetadata` is part of rendering the page. If the page can be prerendered and `generateMetadata` doesn't introduce dynamic behavior, the resulting metadata is included in the page's initial HTML.

Otherwise the metadata resolved from `generateMetadata` [can be streamed](https://nextjs.org/docs/app/api-reference/functions/generate-metadata#streaming-metadata) after sending the initial UI.

For type completion of `params` and `searchParams`, you can type the first argument with [`PageProps<'/route'>`](https://nextjs.org/docs/app/api-reference/file-conventions/page#page-props-helper) or [`LayoutProps<'/route'>`](https://nextjs.org/docs/app/api-reference/file-conventions/layout#layout-props-helper) for pages and layouts respectively.

> **Good to know**:
> 
> -   Metadata can be added to `layout.js` and `page.js` files.
> -   Next.js will automatically resolve the metadata, and create the relevant `<head>` tags for the page.
> -   The `metadata` object and `generateMetadata` function exports are **only supported in Server Components**.
> -   You cannot export both the `metadata` object and `generateMetadata` function from the same route segment.
> -   `fetch` requests inside `generateMetadata` are automatically [memoized](https://nextjs.org/docs/app/glossary#memoization) for the same data across `generateMetadata`, `generateStaticParams`, Layouts, Pages, and Server Components.
> -   React [`cache` can be used](https://react.dev/reference/react/cache) if `fetch` is unavailable.
> -   [File-based metadata](https://nextjs.org/docs/app/api-reference/file-conventions/metadata) has the higher priority and will override the `metadata` object and `generateMetadata` function.

`generateMetadata` and the `metadata` export are only supported in Server Components because metadata must be resolved on the server before the page component is rendered. This allows Next.js to include the metadata in the initial HTML response.

If you need to use Client Component features, keep your `page.tsx` as a Server Component and move the Client Component logic to a separate file:

## Reference[](#reference)

### Parameters[](#parameters)

`generateMetadata` function accepts the following parameters:

-   `props` - An object containing the parameters of the current route:
    
    -   `params` - An object containing the [dynamic route parameters](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes) object from the root segment down to the segment `generateMetadata` is called from. Examples:
        
        | Route | URL | `params` |
        | --- | --- | --- |
        | `app/shop/[slug]/page.js` | `/shop/1` | `{ slug: '1' }` |
        | `app/shop/[tag]/[item]/page.js` | `/shop/1/2` | `{ tag: '1', item: '2' }` |
        | `app/shop/[...slug]/page.js` | `/shop/1/2` | `{ slug: ['1', '2'] }` |
        
    -   `searchParams` - An object containing the current URL's [search params](https://developer.mozilla.org/docs/Learn/Common_questions/What_is_a_URL#parameters). Examples:
        
        | URL | `searchParams` |
        | --- | --- |
        | `/shop?a=1` | `{ a: '1' }` |
        | `/shop?a=1&b=2` | `{ a: '1', b: '2' }` |
        | `/shop?a=1&a=2` | `{ a: ['1', '2'] }` |
        
-   `parent` - A promise of the resolved metadata from parent route segments.
    

### Returns[](#returns)

`generateMetadata` should return a [`Metadata` object](#metadata-fields) containing one or more metadata fields.

> **Good to know**:
> 
> -   If metadata doesn't depend on request information, it should be defined using the static [`metadata` object](#the-metadata-object) rather than `generateMetadata`.
> -   `fetch` requests are automatically memoized for the same data across `generateMetadata`, `generateStaticParams`, Layouts, Pages, and Server Components. React [`cache` can be used](https://react.dev/reference/react/cache) if `fetch` is unavailable.
> -   `searchParams` are only available in `page.js` segments.
> -   The [`redirect()`](https://nextjs.org/docs/app/api-reference/functions/redirect) and [`notFound()`](https://nextjs.org/docs/app/api-reference/functions/not-found) Next.js methods can also be used inside `generateMetadata`.

### Metadata Fields[](#metadata-fields)

The following fields are supported:

#### `title`[](#title)

The `title` attribute is used to set the title of the document. It can be defined as a simple [string](#string) or an optional [template object](#template).

##### String[](#string)

##### `default`[](#default)

`title.default` can be used to provide a **fallback title** to child route segments that don't define a `title`.

##### `template`[](#template)

`title.template` can be used to add a prefix or a suffix to `titles` defined in **child** route segments.

> **Good to know**:
> 
> -   `title.template` applies to **child** route segments and **not** the segment it's defined in. This means:
>     -   `title.default` is **required** when you add a `title.template`.
>     -   `title.template` defined in `layout.js` will not apply to a `title` defined in a `page.js` of the same route segment.
>     -   `title.template` defined in `page.js` has no effect because a page is always the terminating segment (it doesn't have any children route segments).
> -   `title.template` has **no effect** if a route has not defined a `title` or `title.default`.

##### `absolute`[](#absolute)

`title.absolute` can be used to provide a title that **ignores** `title.template` set in parent segments.

> **Good to know**:
> 
> -   `layout.js`
>     -   `title` (string) and `title.default` define the default title for child segments (that do not define their own `title`). It will augment `title.template` from the closest parent segment if it exists.
>     -   `title.absolute` defines the default title for child segments. It ignores `title.template` from parent segments.
>     -   `title.template` defines a new title template for child segments.
> -   `page.js`
>     -   If a page does not define its own title the closest parents resolved title will be used.
>     -   `title` (string) defines the routes title. It will augment `title.template` from the closest parent segment if it exists.
>     -   `title.absolute` defines the route title. It ignores `title.template` from parent segments.
>     -   `title.template` has no effect in `page.js` because a page is always the terminating segment of a route.

### `description`[](#description)

### Other fields[](#other-fields)

#### `metadataBase`[](#metadatabase)

`metadataBase` is a convenience option to set a base URL prefix for `metadata` fields that require a fully qualified URL.

-   `metadataBase` allows URL-based `metadata` fields defined in the **current route segment and below** to use a **relative path** instead of an otherwise required absolute URL.
-   The field's relative path will be composed with `metadataBase` to form a fully qualified URL.

> **Good to know**:
> 
> -   `metadataBase` is typically set in root `app/layout.js` to apply to URL-based `metadata` fields across all routes.
> -   All URL-based `metadata` fields that require absolute URLs can be configured with a `metadataBase` option.
> -   `metadataBase` can contain a subdomain e.g. `https://app.acme.com` or base path e.g. `https://acme.com/start/from/here`
> -   If a `metadata` field provides an absolute URL, `metadataBase` will be ignored.
> -   Using a relative path in a URL-based `metadata` field without configuring a `metadataBase` will cause a build error.
> -   Next.js will normalize duplicate slashes between `metadataBase` (e.g. `https://acme.com/`) and a relative field (e.g. `/path`) to a single slash (e.g. `https://acme.com/path`)

#### URL Composition[](#url-composition)

URL composition favors developer intent over default directory traversal semantics.

-   Trailing slashes between `metadataBase` and `metadata` fields are normalized.
-   An "absolute" path in a `metadata` field (that typically would replace the whole URL path) is treated as a "relative" path (starting from the end of `metadataBase`).

For example, given the following `metadataBase`:

Any `metadata` fields that inherit the above `metadataBase` and set their own value will be resolved as follows:

| `metadata` field | Resolved URL |
| --- | --- |
| `/` | `https://acme.com` |
| `./` | `https://acme.com` |
| `payments` | `https://acme.com/payments` |
| `/payments` | `https://acme.com/payments` |
| `./payments` | `https://acme.com/payments` |
| `../payments` | `https://acme.com/payments` |
| `https://beta.acme.com/payments` | `https://beta.acme.com/payments` |

### `openGraph`[](#opengraph)

> **Good to know**:
> 
> -   It may be more convenient to use the [file-based Metadata API](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image#image-files-jpg-png-gif) for Open Graph images. Rather than having to sync the config export with actual files, the file-based API will automatically generate the correct metadata for you.

### `robots`[](#robots)

### `icons`[](#icons)

> **Good to know**: We recommend using the [file-based Metadata API](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons#image-files-ico-jpg-png) for icons where possible. Rather than having to sync the config export with actual files, the file-based API will automatically generate the correct metadata for you.

> **Good to know**: The `msapplication-*` meta tags are no longer supported in Chromium builds of Microsoft Edge, and thus no longer needed.

### `themeColor`[](#themecolor)

> **Deprecated**: The `themeColor` option in `metadata` is deprecated as of Next.js 14. Please use the [`viewport` configuration](https://nextjs.org/docs/app/api-reference/functions/generate-viewport) instead.

### `colorScheme`[](#colorscheme)

> **Deprecated**: The `colorScheme` option in `metadata` is deprecated as of Next.js 14. Please use the [`viewport` configuration](https://nextjs.org/docs/app/api-reference/functions/generate-viewport) instead.

### `manifest`[](#manifest)

A web application manifest, as defined in the [Web Application Manifest specification](https://developer.mozilla.org/docs/Web/Manifest).

### `twitter`[](#twitter)

The Twitter specification is (surprisingly) used for more than just X (formerly known as Twitter).

Learn more about the [Twitter Card markup reference](https://developer.x.com/en/docs/twitter-for-websites/cards/overview/markup).

### `viewport`[](#viewport)

> **Deprecated**: The `viewport` option in `metadata` is deprecated as of Next.js 14. Please use the [`viewport` configuration](https://nextjs.org/docs/app/api-reference/functions/generate-viewport) instead.

### `verification`[](#verification)

### `appleWebApp`[](#applewebapp)

### `alternates`[](#alternates)

### `appLinks`[](#applinks)

### `archives`[](#archives)

Describes a collection of records, documents, or other materials of historical interest ([source](https://www.w3.org/TR/2011/WD-html5-20110113/links.html#rel-archives)).

### `assets`[](#assets)

### `bookmarks`[](#bookmarks)

### `category`[](#category)

### `facebook`[](#facebook)

You can connect a Facebook app or Facebook account to your webpage for certain Facebook Social Plugins [Facebook Documentation](https://developers.facebook.com/docs/plugins/comments/#moderation-setup-instructions)

> **Good to know**: You can specify either appId or admins, but not both.

If you want to generate multiple fb:admins meta tags you can use array value.

### `pinterest`[](#pinterest)

You can enable or disable [Pinterest Rich Pins](https://developers.pinterest.com/docs/web-features/rich-pins-overview/) on your webpage.

### `other`[](#other)

All metadata options should be covered using the built-in support. However, there may be custom metadata tags specific to your site, or brand new metadata tags just released. You can use the `other` option to render any custom metadata tag.

If you want to generate multiple same key meta tags you can use array value.

### Types[](#types)

You can add type safety to your metadata by using the `Metadata` type. If you are using the [built-in TypeScript plugin](https://nextjs.org/docs/app/api-reference/config/typescript) in your IDE, you do not need to manually add the type, but you can still explicitly add it if you want.

#### `metadata` object[](#metadata-object)

#### `generateMetadata` function[](#generatemetadata-function-1)

##### Regular function[](#regular-function)

##### Async function[](#async-function)

##### With segment props[](#with-segment-props)

##### With parent metadata[](#with-parent-metadata)

##### JavaScript Projects[](#javascript-projects)

For JavaScript projects, you can use JSDoc to add type safety.

### Unsupported Metadata[](#unsupported-metadata)

The following metadata types do not currently have built-in support. However, they can still be rendered in the layout or page itself.

| Metadata | Recommendation |
| --- | --- |
| `<meta http-equiv="...">` | Use appropriate HTTP Headers via [`redirect()`](https://nextjs.org/docs/app/api-reference/functions/redirect), [Proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy#nextresponse), [Security Headers](https://nextjs.org/docs/app/api-reference/config/next-config-js/headers) |
| `<base>` | Render the tag in the layout or page itself. |
| `<noscript>` | Render the tag in the layout or page itself. |
| `<style>` | Learn more about [styling in Next.js](https://nextjs.org/docs/app/getting-started/css). |
| `<script>` | Learn more about [using scripts](https://nextjs.org/docs/app/guides/scripts). |
| `<link rel="stylesheet" />` | `import` stylesheets directly in the layout or page itself. |
| `<link rel="preload />` | Use [ReactDOM preload method](#link-relpreload) |
| `<link rel="preconnect" />` | Use [ReactDOM preconnect method](#link-relpreconnect) |
| `<link rel="dns-prefetch" />` | Use [ReactDOM prefetchDNS method](#link-reldns-prefetch) |

### Resource hints[](#resource-hints)

The `<link>` element has a number of `rel` keywords that can be used to hint to the browser that an external resource is likely to be needed. The browser uses this information to apply preloading optimizations depending on the keyword.

While the Metadata API doesn't directly support these hints, you can use new [`ReactDOM` methods](https://github.com/facebook/react/pull/26237) to safely insert them into the `<head>` of the document.

#### `<link rel="preload">`[](#link-relpreload)

Start loading a resource early in the page rendering (browser) lifecycle. [MDN Docs](https://developer.mozilla.org/docs/Web/HTML/Attributes/rel/preload).

##### `<link rel="preconnect">`[](#link-relpreconnect)

Preemptively initiate a connection to an origin. [MDN Docs](https://developer.mozilla.org/docs/Web/HTML/Attributes/rel/preconnect).

#### `<link rel="dns-prefetch">`[](#link-reldns-prefetch)

Attempt to resolve a domain name before resources get requested. [MDN Docs](https://developer.mozilla.org/docs/Web/HTML/Attributes/rel/dns-prefetch).

> **Good to know**:
> 
> -   These methods are currently only supported in Client Components, which are still Server Side Rendered on initial page load.
> -   Next.js in-built features such as `next/font`, `next/image` and `next/script` automatically handle relevant resource hints.

## Behavior[](#behavior)

### Default Fields[](#default-fields)

There are two default `meta` tags that are always added even if a route doesn't define metadata:

-   The [meta charset tag](https://developer.mozilla.org/docs/Web/HTML/Element/meta#attr-charset) sets the character encoding for the website.
-   The [meta viewport tag](https://developer.mozilla.org/docs/Web/HTML/Viewport_meta_tag) sets the viewport width and scale for the website to adjust for different devices.

> **Good to know**: You can overwrite the default [`viewport`](https://nextjs.org/docs/app/api-reference/functions/generate-metadata#viewport) meta tag.

### Streaming metadata[](#streaming-metadata)

Streaming metadata allows Next.js to render and send the initial UI to the browser, without waiting for `generateMetadata` to complete.

When `generateMetadata` resolves, the resulting metadata tags are appended to the `<body>` tag. We have verified that metadata is interpreted correctly by bots that execute JavaScript and inspect the full DOM (e.g. `Googlebot`).

For **HTML-limited bots** that can’t execute JavaScript (e.g. `facebookexternalhit`), metadata continues to block page rendering. The resulting metadata will be available in the `<head>` tag.

Next.js automatically detects **HTML-limited bots** by looking at the User Agent header. You can use the [`htmlLimitedBots`](https://nextjs.org/docs/app/api-reference/config/next-config-js/htmlLimitedBots) option in your Next.js config file to override the default [User Agent list](https://github.com/vercel/next.js/blob/canary/packages/next/src/shared/lib/router/utils/html-bots.ts).

To fully disable streaming metadata:

Streaming metadata improves perceived performance by reducing [TTFB](https://developer.mozilla.org/docs/Glossary/Time_to_first_byte) and can help lowering [LCP](https://developer.mozilla.org/docs/Glossary/Largest_contentful_paint) time.

Overriding `htmlLimitedBots` could lead to longer response times. Streaming metadata is an advanced feature, and the default should be sufficient for most cases.

### With Cache Components[](#with-cache-components)

When [Cache Components](https://nextjs.org/docs/app/getting-started/caching) is enabled, `generateMetadata` follows the same rules as other components. If metadata accesses runtime data (`cookies()`, `headers()`, `params`, `searchParams`) or performs uncached data fetching, it defers to request time.

How Next.js handles this depends on the rest of your page:

-   **If other parts also defer to request time**: Prerendering generates a static shell, and metadata streams in with other deferred content.
-   **If the page or layout is otherwise fully prerenderable**: Next.js requires an explicit choice: cache the data if possible, or signal that deferred rendering is intentional.

Streaming metadata at runtime while the rest of the page is fully prerenderable is not common. To ensure this behavior is intentional, an error is raised indicating which page or layout needs to be handled.

To resolve this, you have two options. If metadata depends on external data but not runtime data, use `use cache`:

If metadata genuinely requires runtime data, add a dynamic marker component to your page:

The `DynamicMarker` component renders nothing but tells Next.js the page has intentional dynamic content. By wrapping it in Suspense, the static content still prerenders normally.

### Ordering[](#ordering)

Metadata is evaluated in order, starting from the root segment down to the segment closest to the final `page.js` segment. For example:

1.  `app/layout.tsx` (Root Layout)
2.  `app/blog/layout.tsx` (Nested Blog Layout)
3.  `app/blog/[slug]/page.tsx` (Blog Page)

### Merging[](#merging)

Following the [evaluation order](#ordering), Metadata objects exported from multiple segments in the same route are **shallowly** merged together to form the final metadata output of a route. Duplicate keys are **replaced** based on their ordering.

This means metadata with nested fields such as [`openGraph`](https://nextjs.org/docs/app/api-reference/functions/generate-metadata#opengraph) and [`robots`](https://nextjs.org/docs/app/api-reference/functions/generate-metadata#robots) that are defined in an earlier segment are **overwritten** by the last segment to define them.

#### Overwriting fields[](#overwriting-fields)

In the example above:

-   `title` from `app/layout.js` is **replaced** by `title` in `app/blog/page.js`.
-   All `openGraph` fields from `app/layout.js` are **replaced** in `app/blog/page.js` because `app/blog/page.js` sets `openGraph` metadata. Note the absence of `openGraph.description`.

If you'd like to share some nested fields between segments while overwriting others, you can pull them out into a separate variable:

In the example above, the OG image is shared between `app/layout.js` and `app/about/page.js` while the titles are different.

#### Inheriting fields[](#inheriting-fields)

**Notes**

-   `title` from `app/layout.js` is **replaced** by `title` in `app/about/page.js`.
-   All `openGraph` fields from `app/layout.js` are **inherited** in `app/about/page.js` because `app/about/page.js` doesn't set `openGraph` metadata.

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v15.2.0` | Introduced streaming support to `generateMetadata`. |
| `v13.2.0` | `viewport`, `themeColor`, and `colorScheme` deprecated in favor of the [`viewport` configuration](https://nextjs.org/docs/app/api-reference/functions/generate-viewport). |
| `v13.2.0` | `metadata` and `generateMetadata` introduced. |
