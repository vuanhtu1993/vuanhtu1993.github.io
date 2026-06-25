---
title: "Functions: NextRequest"
source_url: "https://nextjs.org/docs/app/api-reference/functions/next-request"
crawled_at: "2026-06-25T07:09:52.990Z"
---

Last updated

December 4, 2025

NextRequest extends the [Web Request API](https://developer.mozilla.org/docs/Web/API/Request) with additional convenience methods.

## `cookies`[](#cookies)

Read or mutate the [`Set-Cookie`](https://developer.mozilla.org/docs/Web/HTTP/Headers/Set-Cookie) header of the request.

### `set(name, value)`[](#setname-value)

Given a name, set a cookie with the given value on the request.

### `get(name)`[](#getname)

Given a cookie name, return the value of the cookie. If the cookie is not found, `undefined` is returned. If multiple cookies are found, the first one is returned.

### `getAll()`[](#getall)

Given a cookie name, return the values of the cookie. If no name is given, return all cookies on the request.

### `delete(name)`[](#deletename)

Given a cookie name, delete the cookie from the request.

### `has(name)`[](#hasname)

Given a cookie name, return `true` if the cookie exists on the request.

### `clear()`[](#clear)

Remove all cookies from the request.

## `nextUrl`[](#nexturl)

Extends the native [`URL`](https://developer.mozilla.org/docs/Web/API/URL) API with additional convenience methods, including Next.js specific properties.

The following options are available:

| Property | Type | Description |
| --- | --- | --- |
| `basePath` | `string` | The [base path](https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath) of the URL. |
| `buildId` | `string` | `undefined` | The build identifier of the Next.js application. Can be [customized](https://nextjs.org/docs/app/api-reference/config/next-config-js/generateBuildId). |
| `pathname` | `string` | The pathname of the URL. |
| `searchParams` | `Object` | The search parameters of the URL. |

> **Note:** The internationalization properties from the Pages Router are not available for usage in the App Router. Learn more about [internationalization with the App Router](https://nextjs.org/docs/app/guides/internationalization).

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v15.0.0` | `ip` and `geo` removed. |
