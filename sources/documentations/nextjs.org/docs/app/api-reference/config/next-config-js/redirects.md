---
title: "next.config.js: redirects"
source_url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects"
crawled_at: "2026-06-25T07:16:29.060Z"
---

Last updated

November 12, 2025

Redirects allow you to redirect an incoming request path to a different destination path.

To use redirects you can use the `redirects` key in `next.config.js`:

`redirects` is an async function that expects an array to be returned holding objects with `source`, `destination`, and `permanent` properties:

-   `source` is the incoming request path pattern.
-   `destination` is the path you want to route to.
-   `permanent` `true` or `false` - if `true` will use the 308 status code which instructs clients/search engines to cache the redirect forever, if `false` will use the 307 status code which is temporary and is not cached.

> **Why does Next.js use 307 and 308?** Traditionally a 302 was used for a temporary redirect, and a 301 for a permanent redirect, but many browsers changed the request method of the redirect to `GET`, regardless of the original method. For example, if the browser made a request to `POST /v1/users` which returned status code `302` with location `/v2/users`, the subsequent request might be `GET /v2/users` instead of the expected `POST /v2/users`. Next.js uses the 307 temporary redirect, and 308 permanent redirect status codes to explicitly preserve the request method used.

-   `basePath`: `false` or `undefined` - if false the `basePath` won't be included when matching, can be used for external redirects only.
-   `locale`: `false` or `undefined` - whether the locale should not be included when matching.
-   `has` is an array of [has objects](#header-cookie-and-query-matching) with the `type`, `key` and `value` properties.
-   `missing` is an array of [missing objects](#header-cookie-and-query-matching) with the `type`, `key` and `value` properties.

Redirects are checked before the filesystem which includes pages and `/public` files.

When using the Pages Router, redirects are not applied to client-side routing (`Link`, `router.push`) unless [Proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) is present and matches the path.

When a redirect is applied, any query values provided in the request will be passed through to the redirect destination. For example, see the following redirect configuration:

> **Good to know**: Remember to include the forward slash `/` before the colon `:` in path parameters of the `source` and `destination` paths, otherwise the path will be treated as a literal string and you run the risk of causing infinite redirects.

When `/old-blog/post-1?hello=world` is requested, the client will be redirected to `/blog/post-1?hello=world`.

## Path Matching[](#path-matching)

Path matches are allowed, for example `/old-blog/:slug` will match `/old-blog/first-post` (no nested paths):

The pattern `/old-blog/:slug` matches `/old-blog/first-post` and `/old-blog/post-1` but not `/old-blog/a/b` (no nested paths). Patterns are anchored to the start: `/old-blog/:slug` will not match `/archive/old-blog/first-post`.

You can use modifiers on parameters: `*` (zero or more), `+` (one or more), `?` (zero or one). For example, `/blog/:slug*` matches `/blog`, `/blog/a`, and `/blog/a/b/c`.

Read more details on [path-to-regexp](https://github.com/pillarjs/path-to-regexp) documentation.

### Wildcard Path Matching[](#wildcard-path-matching)

To match a wildcard path you can use `*` after a parameter, for example `/blog/:slug*` will match `/blog/a/b/c/d/hello-world`:

### Regex Path Matching[](#regex-path-matching)

To match a regex path you can wrap the regex in parentheses after a parameter, for example `/post/:slug(\\d{1,})` will match `/post/123` but not `/post/abc`:

The following characters `(`, `)`, `{`, `}`, `:`, `*`, `+`, `?` are used for regex path matching, so when used in the `source` as non-special values they must be escaped by adding `\\` before them:

## Header, Cookie, and Query Matching[](#header-cookie-and-query-matching)

To only match a redirect when header, cookie, or query values also match the `has` field or don't match the `missing` field can be used. Both the `source` and all `has` items must match and all `missing` items must not match for the redirect to be applied.

`has` and `missing` items can have the following fields:

-   `type`: `String` - must be either `header`, `cookie`, `host`, or `query`.
-   `key`: `String` - the key from the selected type to match against.
-   `value`: `String` or `undefined` - the value to check for, if undefined any value will match. A regex like string can be used to capture a specific part of the value, e.g. if the value `first-(?<paramName>.*)` is used for `first-second` then `second` will be usable in the destination with `:paramName`.

### Redirects with basePath support[](#redirects-with-basepath-support)

When leveraging [`basePath` support](https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath) with redirects each `source` and `destination` is automatically prefixed with the `basePath` unless you add `basePath: false` to the redirect:

### Redirects with i18n support[](#redirects-with-i18n-support)

When implementing redirects with internationalization in the App Router, you can include locales in `next.config.js` redirects, but only as hardcoded paths.

For dynamic or per-request locale handling, use [dynamic route segments and proxy](https://nextjs.org/docs/app/guides/internationalization), which can redirect based on the user's preferred language.

In some rare cases, you might need to assign a custom status code for older HTTP Clients to properly redirect. In these cases, you can use the `statusCode` property instead of the `permanent` property, but not both. To ensure IE11 compatibility, a `Refresh` header is automatically added for the 308 status code.

## Other Redirects[](#other-redirects)

-   Inside [API Routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) and [Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route), you can redirect based on the incoming request.
-   Inside [`getStaticProps`](https://nextjs.org/docs/pages/building-your-application/data-fetching/get-static-props) and [`getServerSideProps`](https://nextjs.org/docs/pages/building-your-application/data-fetching/get-server-side-props), you can redirect specific pages at request-time.

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v13.3.0` | `missing` added. |
| `v10.2.0` | `has` added. |
| `v9.5.0` | `redirects` added. |
