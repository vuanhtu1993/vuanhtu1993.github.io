---
title: "next.config.js: headers"
source_url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/headers"
crawled_at: "2026-06-25T07:14:32.351Z"
---

Last updated

March 3, 2026

Headers allow you to set custom HTTP headers on the response to an incoming request on a given path.

To set custom HTTP headers you can use the `headers` key in `next.config.js`:

`headers` is an async function that expects an array to be returned holding objects with `source` and `headers` properties:

-   `source` is the incoming request path pattern.
-   `headers` is an array of response header objects, with `key` and `value` properties.
-   `basePath`: `false` or `undefined` - if false the basePath won't be included when matching, can be used for external rewrites only.
-   `locale`: `false` or `undefined` - whether the locale should not be included when matching.
-   `has` is an array of [has objects](#header-cookie-and-query-matching) with the `type`, `key` and `value` properties.
-   `missing` is an array of [missing objects](#header-cookie-and-query-matching) with the `type`, `key` and `value` properties.

Headers are checked before the filesystem which includes pages and `/public` files.

If two headers match the same path and set the same header key, the last header key will override the first. Using the below headers, the path `/hello` will result in the header `x-hello` being `world` due to the last header value set being `world`.

## Path Matching[](#path-matching)

Path matches are allowed, for example `/blog/:slug` will match `/blog/first-post` (no nested paths):

The pattern `/blog/:slug` matches `/blog/first-post` and `/blog/post-1` but not a nested path like `/blog/a/b`. Patterns are anchored to the start, `/blog/:slug` will not match `/archive/blog/first-post`.

You can use modifiers on parameters: `*` (zero or more), `+` (one or more), `?` (zero or one). For example, `/blog/:slug*` matches `/blog`, `/blog/a`, and `/blog/a/b/c`.

Read more details on [path-to-regexp](https://github.com/pillarjs/path-to-regexp) documentation.

### Wildcard Path Matching[](#wildcard-path-matching)

To match a wildcard path you can use `*` after a parameter, for example `/blog/:slug*` will match `/blog/a/b/c/d/hello-world`:

### Regex Path Matching[](#regex-path-matching)

To match a regex path you can wrap the regex in parenthesis after a parameter, for example `/blog/:slug(\\d{1,})` will match `/blog/123` but not `/blog/abc`:

The following characters `(`, `)`, `{`, `}`, `:`, `*`, `+`, `?` are used for regex path matching, so when used in the `source` as non-special values they must be escaped by adding `\\` before them:

## Header, Cookie, and Query Matching[](#header-cookie-and-query-matching)

To only apply a header when header, cookie, or query values also match the `has` field or don't match the `missing` field can be used. Both the `source` and all `has` items must match and all `missing` items must not match for the header to be applied.

`has` and `missing` items can have the following fields:

-   `type`: `String` - must be either `header`, `cookie`, `host`, or `query`.
-   `key`: `String` - the key from the selected type to match against.
-   `value`: `String` or `undefined` - the value to check for, if undefined any value will match. A regex like string can be used to capture a specific part of the value, e.g. if the value `first-(?<paramName>.*)` is used for `first-second` then `second` will be usable in the destination with `:paramName`.

When leveraging [`basePath` support](https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath) with headers each `source` is automatically prefixed with the `basePath` unless you add `basePath: false` to the header:

When leveraging [`i18n` support](https://nextjs.org/docs/app/guides/internationalization) with headers each `source` is automatically prefixed to handle the configured `locales` unless you add `locale: false` to the header. If `locale: false` is used you must prefix the `source` with a locale for it to be matched correctly.

## Cache-Control[](#cache-control)

Next.js sets the `Cache-Control` header of `public, max-age=31536000, immutable` for truly immutable assets. It cannot be overridden. These immutable files contain a SHA-hash in the file name, so they can be safely cached indefinitely. For example, [Static Image Imports](https://nextjs.org/docs/app/getting-started/images#local-images). You cannot set `Cache-Control` headers in `next.config.js` for these assets.

However, you can set `Cache-Control` headers for other responses or data.

Learn more about [caching](https://nextjs.org/docs/app/getting-started/caching) with the App Router.

## Options[](#options)

### CORS[](#cors)

[Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/docs/Web/HTTP/CORS) is a security feature that allows you to control which sites can access your resources. You can set the `Access-Control-Allow-Origin` header to allow a specific origin to access your Route Handlers.

### X-DNS-Prefetch-Control[](#x-dns-prefetch-control)

[This header](https://developer.mozilla.org/docs/Web/HTTP/Headers/X-DNS-Prefetch-Control) controls DNS prefetching, allowing browsers to proactively perform domain name resolution on external links, images, CSS, JavaScript, and more. This prefetching is performed in the background, so the [DNS](https://developer.mozilla.org/docs/Glossary/DNS) is more likely to be resolved by the time the referenced items are needed. This reduces latency when the user clicks a link.

### Strict-Transport-Security[](#strict-transport-security)

[This header](https://developer.mozilla.org/docs/Web/HTTP/Headers/Strict-Transport-Security) informs browsers it should only be accessed using HTTPS, instead of using HTTP. Using the configuration below, all present and future subdomains will use HTTPS for a `max-age` of 2 years. This blocks access to pages or subdomains that can only be served over HTTP.

### X-Frame-Options[](#x-frame-options)

[This header](https://developer.mozilla.org/docs/Web/HTTP/Headers/X-Frame-Options) indicates whether the site should be allowed to be displayed within an `iframe`. This can prevent against clickjacking attacks.

**This header has been superseded by CSP's `frame-ancestors` option**, which has better support in modern browsers (see [Content Security Policy](https://nextjs.org/docs/app/guides/content-security-policy) for configuration details).

### Permissions-Policy[](#permissions-policy)

[This header](https://developer.mozilla.org/docs/Web/HTTP/Headers/Permissions-Policy) allows you to control which features and APIs can be used in the browser. It was previously named `Feature-Policy`.

### X-Content-Type-Options[](#x-content-type-options)

[This header](https://developer.mozilla.org/docs/Web/HTTP/Headers/X-Content-Type-Options) prevents the browser from attempting to guess the type of content if the `Content-Type` header is not explicitly set. This can prevent XSS exploits for websites that allow users to upload and share files.

For example, a user trying to download an image, but having it treated as a different `Content-Type` like an executable, which could be malicious. This header also applies to downloading browser extensions. The only valid value for this header is `nosniff`.

### Referrer-Policy[](#referrer-policy)

[This header](https://developer.mozilla.org/docs/Web/HTTP/Headers/Referrer-Policy) controls how much information the browser includes when navigating from the current website (origin) to another.

### Content-Security-Policy[](#content-security-policy)

Learn more about adding a [Content Security Policy](https://nextjs.org/docs/app/guides/content-security-policy) to your application.

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v13.3.0` | `missing` added. |
| `v10.2.0` | `has` added. |
| `v9.5.0` | Headers added. |
