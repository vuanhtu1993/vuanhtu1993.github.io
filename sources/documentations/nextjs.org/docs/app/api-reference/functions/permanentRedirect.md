---
title: "Functions: permanentRedirect"
source_url: "https://nextjs.org/docs/app/api-reference/functions/permanentRedirect"
crawled_at: "2026-06-25T07:10:11.668Z"
---

Last updated

March 3, 2026

The `permanentRedirect` function allows you to redirect the user to another URL. `permanentRedirect` can be used in Server Components, Client Components, [Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route), and [Server Functions](https://nextjs.org/docs/app/getting-started/mutating-data).

When used in a streaming context, this will insert a meta tag to emit the redirect on the client side. When used in a server action, it will serve a 303 HTTP redirect response to the caller. Otherwise, it will serve a 308 (Permanent) HTTP redirect response to the caller.

If a resource doesn't exist, you can use the [`notFound` function](https://nextjs.org/docs/app/api-reference/functions/not-found) instead.

> **Good to know**: If you prefer to return a 307 (Temporary) HTTP redirect instead of 308 (Permanent), you can use the [`redirect` function](https://nextjs.org/docs/app/api-reference/functions/redirect) instead.

## Parameters[](#parameters)

The `permanentRedirect` function accepts two arguments:

| Parameter | Type | Description |
| --- | --- | --- |
| `path` | `string` | The URL to redirect to. Can be a relative or absolute path. |
| `type` | `'replace'` (default) or `'push'` (default in Server Actions) | The type of redirect to perform. |

By default, `permanentRedirect` will use `push` (adding a new entry to the browser history stack) in [Server Actions](https://nextjs.org/docs/app/getting-started/mutating-data) and `replace` (replacing the current URL in the browser history stack) everywhere else. You can override this behavior by specifying the `type` parameter.

The `RedirectType` object contains the available options for the `type` parameter.

The `type` parameter has no effect when used in Server Components.

## Returns[](#returns)

`permanentRedirect` does not return a value.

## Example[](#example)

Invoking the `permanentRedirect()` function throws a `NEXT_REDIRECT` error and terminates rendering of the route segment in which it was thrown.

> **Good to know**: `permanentRedirect` does not require you to use `return permanentRedirect()` as it uses the TypeScript [`never`](https://www.typescriptlang.org/docs/handbook/2/functions.html#never) type.
