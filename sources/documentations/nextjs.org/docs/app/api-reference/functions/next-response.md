---
title: "Functions: NextResponse"
source_url: "https://nextjs.org/docs/app/api-reference/functions/next-response"
crawled_at: "2026-06-25T07:09:59.352Z"
---

Last updated

December 4, 2025

NextResponse extends the [Web Response API](https://developer.mozilla.org/docs/Web/API/Response) with additional convenience methods.

## `cookies`[](#cookies)

Read or mutate the [`Set-Cookie`](https://developer.mozilla.org/docs/Web/HTTP/Headers/Set-Cookie) header of the response.

### `set(name, value)`[](#setname-value)

Given a name, set a cookie with the given value on the response.

### `get(name)`[](#getname)

Given a cookie name, return the value of the cookie. If the cookie is not found, `undefined` is returned. If multiple cookies are found, the first one is returned.

### `getAll()`[](#getall)

Given a cookie name, return the values of the cookie. If no name is given, return all cookies on the response.

### `has(name)`[](#hasname)

Given a cookie name, return `true` if the cookie exists on the response.

### `delete(name)`[](#deletename)

Given a cookie name, delete the cookie from the response.

## `json()`[](#json)

Produce a response with the given JSON body.

## `redirect()`[](#redirect)

Produce a response that redirects to a [URL](https://developer.mozilla.org/docs/Web/API/URL).

The [URL](https://developer.mozilla.org/docs/Web/API/URL) can be created and modified before being used in the `NextResponse.redirect()` method. For example, you can use the `request.nextUrl` property to get the current URL, and then modify it to redirect to a different URL.

## `rewrite()`[](#rewrite)

Produce a response that rewrites (proxies) the given [URL](https://developer.mozilla.org/docs/Web/API/URL) while preserving the original URL.

## `next()`[](#next)

The `next()` method is useful for Proxy, as it allows you to return early and continue routing.

You can also forward `headers` upstream when producing the response, using `NextResponse.next({ request: { headers } })`:

This forwards `newHeaders` upstream to the target page, route, or server action, and does not expose them to the client. While this pattern is useful for passing data upstream, it should be used with caution because the headers containing this data may be forwarded to external services.

In contrast, `NextResponse.next({ headers })` is a shorthand for sending headers from proxy to the client. This is **NOT** good practice and should be avoided. Among other reasons because setting response headers like `Content-Type`, can override framework expectations (for example, the `Content-Type` used by Server Actions), leading to failed submissions or broken streaming responses.

In general, avoid copying all incoming request headers because doing so can leak sensitive data to clients or upstream services.

Prefer a defensive approach by creating a subset of incoming request headers using an allow-list. For example, you might discard custom `x-*` headers and only forward known-safe headers:
