---
title: "next.config.js: rewrites"
source_url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites"
crawled_at: "2026-06-25T07:16:35.629Z"
---

Last updated

June 23, 2026

Rewrites allow you to map an incoming request path to a different destination path.

Rewrites act as a URL proxy and mask the destination path, making it appear the user hasn't changed their location on the site. In contrast, [redirects](https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects) will reroute to a new page and show the URL changes.

To use rewrites you can use the `rewrites` key in `next.config.js`:

Rewrites are applied to client-side routing. In the example above, navigating to `<Link href="/about">` will serve content from `/` while keeping the URL as `/about`.

`rewrites` is an async function that expects to return either an array or an object of arrays (see below) holding objects with `source` and `destination` properties:

-   `source`: `String` - is the incoming request path pattern.
-   `destination`: `String` is the path you want to route to.
-   `basePath`: `false` or `undefined` - if false the basePath won't be included when matching, can be used for external rewrites only.
-   `locale`: `false` or `undefined` - whether the locale should not be included when matching.
-   `has` is an array of [has objects](#header-cookie-and-query-matching) with the `type`, `key` and `value` properties.
-   `missing` is an array of [missing objects](#header-cookie-and-query-matching) with the `type`, `key` and `value` properties.

When the `rewrites` function returns an array, rewrites are applied after checking the filesystem (pages and `/public` files) and before dynamic routes. When the `rewrites` function returns an object of arrays with a specific shape, this behavior can be changed and more finely controlled, as of `v10.1` of Next.js:

> **Good to know**: rewrites in `beforeFiles` do not check the filesystem/dynamic routes immediately after matching a source, they continue until all `beforeFiles` have been checked.

The order Next.js routes are checked is:

1.  [headers](https://nextjs.org/docs/app/api-reference/config/next-config-js/headers) are checked/applied
2.  [redirects](https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects) are checked/applied
3.  [proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)
4.  `beforeFiles` rewrites: for each entry, if `source`, `has`, and `missing` matches the request, it's rewritten to `destination`.
5.  static files from the [public directory](https://nextjs.org/docs/app/api-reference/file-conventions/public-folder), `_next/static` files, and non-dynamic pages are checked/served
6.  `afterFiles` rewrites are tried in order. If a `source`, `has`, and `missing` matches the request, it's rewritten to `destination`; the first rewrite that resolves to a static file, page, or dynamic route is served.
7.  dynamic routes (e.g., `app/blog/[slug]/page.tsx`) are matched against the current path
8.  `fallback` rewrites are checked/applied, these are applied before rendering the 404 page and after dynamic routes/all static assets have been checked. If you use [fallback: true/'blocking'](https://nextjs.org/docs/pages/api-reference/functions/get-static-paths#fallback-true) in `getStaticPaths`, those dynamic routes take priority over the fallback `rewrites` defined in your `next.config.js`.

## Rewrite parameters[](#rewrite-parameters)

When using parameters in a rewrite the parameters will be passed in the query by default when none of the parameters are used in the `destination`.

If a parameter is used in the destination none of the parameters will be automatically passed in the query.

You can still pass the parameters manually in the query if one is already used in the destination by specifying the query in the `destination`.

> **Good to know**: Static pages from [Automatic Static Optimization](https://nextjs.org/docs/pages/building-your-application/rendering/automatic-static-optimization) or [prerendering](https://nextjs.org/docs/pages/building-your-application/data-fetching/get-static-props) params from rewrites will be parsed on the client after hydration and provided in the query.

## Path Matching[](#path-matching)

Path matches are allowed, for example `/blog/:slug` will match `/blog/first-post` (no nested paths):

The pattern `/blog/:slug` matches `/blog/first-post` and `/blog/post-1` but not `/blog/a/b` (no nested paths). Patterns are anchored to the start: `/blog/:slug` will not match `/archive/blog/first-post`.

You can use modifiers on parameters: `*` (zero or more), `+` (one or more), `?` (zero or one). For example, `/blog/:slug*` matches `/blog`, `/blog/a`, and `/blog/a/b/c`.

Read more details on [path-to-regexp](https://github.com/pillarjs/path-to-regexp) documentation.

### Wildcard Path Matching[](#wildcard-path-matching)

To match a wildcard path you can use `*` after a parameter, for example `/blog/:slug*` will match `/blog/a/b/c/d/hello-world`:

### Regex Path Matching[](#regex-path-matching)

To match a regex path you can wrap the regex in parenthesis after a parameter, for example `/blog/:slug(\\d{1,})` will match `/blog/123` but not `/blog/abc`:

The following characters `(`, `)`, `{`, `}`, `[`, `]`, `|`, `\`, `^`, `.`, `:`, `*`, `+`, `-`, `?`, `$` are used for regex path matching, so when used in the `source` as non-special values they must be escaped by adding `\\` before them:

## Header, Cookie, and Query Matching[](#header-cookie-and-query-matching)

To only match a rewrite when header, cookie, or query values also match the `has` field or don't match the `missing` field can be used. Both the `source` and all `has` items must match and all `missing` items must not match for the rewrite to be applied.

`has` and `missing` items can have the following fields:

-   `type`: `String` - must be either `header`, `cookie`, `host`, or `query`.
-   `key`: `String` - the key from the selected type to match against.
-   `value`: `String` or `undefined` - the value to check for, if undefined any value will match. A regex like string can be used to capture a specific part of the value, e.g. if the value `first-(?<paramName>.*)` is used for `first-second` then `second` will be usable in the destination with `:paramName`.

## Rewriting to an external URL[](#rewriting-to-an-external-url)

Examples

-   [Using Multiple Zones](https://github.com/vercel/next.js/tree/canary/examples/with-zones)

Rewrites allow you to rewrite to an external URL. This is especially useful for incrementally adopting Next.js. The following is an example rewrite for redirecting the `/blog` route of your main app to an external site.

If you're using `trailingSlash: true`, you also need to insert a trailing slash in the `source` parameter. If the destination server is also expecting a trailing slash it should be included in the `destination` parameter as well.

### Incremental adoption of Next.js[](#incremental-adoption-of-nextjs)

You can also have Next.js fall back to proxying to an existing website after checking all Next.js routes.

This way you don't have to change the rewrites configuration when migrating more pages to Next.js

### Rewrites with basePath support[](#rewrites-with-basepath-support)

When leveraging [`basePath` support](https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath) with rewrites each `source` and `destination` is automatically prefixed with the `basePath` unless you add `basePath: false` to the rewrite:

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v13.3.0` | `missing` added. |
| `v10.2.0` | `has` added. |
| `v9.5.0` | Headers added. |
