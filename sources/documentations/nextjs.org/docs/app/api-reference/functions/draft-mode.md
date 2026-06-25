---
title: "Functions: draftMode"
source_url: "https://nextjs.org/docs/app/api-reference/functions/draft-mode"
crawled_at: "2026-06-25T07:08:42.939Z"
---

This page is also available as Markdown at [/docs/app/api-reference/functions/draft-mode.md](https://nextjs.org/docs/app/api-reference/functions/draft-mode.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

Last updated

May 13, 2026

`draftMode` is an **async** function allows you to enable and disable [Draft Mode](https://nextjs.org/docs/app/guides/draft-mode), as well as check if Draft Mode is enabled in a [Server Component](https://nextjs.org/docs/app/getting-started/server-and-client-components).

## Reference[](#reference)

The following methods and properties are available:

| Method | Description |
| --- | --- |
| `isEnabled` | A boolean value that indicates if Draft Mode is enabled. |
| `enable()` | Enables Draft Mode in a Route Handler by setting a cookie (`__prerender_bypass`). |
| `disable()` | Disables Draft Mode in a Route Handler by deleting a cookie. |

## Good to know[](#good-to-know)

-   `draftMode` is an **asynchronous** function that returns a promise. You must use `async/await` or React’s [`use`](https://react.dev/reference/react/use) function.
    -   In version 14 and earlier, `draftMode` was a synchronous function. To help with backwards compatibility, you can still access it synchronously in Next.js 15, but this behavior will be deprecated in the future.
-   A new bypass cookie value will be generated each time you run `next build`. This ensures that the bypass cookie can’t be guessed.
-   To test Draft Mode locally over HTTP, your browser will need to allow third-party cookies and local storage access.
-   [`isEnabled`](#checking-if-draft-mode-is-enabled) is readable inside a [caching directive](https://nextjs.org/docs/app/api-reference/directives/use-cache) scope. Other runtime APIs like `cookies()` and `headers()` are not allowed inside caching directive scopes, even when Draft Mode is active.
-   Calling `enable()` or `disable()` inside a caching directive scope will throw an error.
-   When Draft Mode is enabled, all functions and components under a caching directive scope re-execute on every request and results are not saved to the cache. This ensures draft content is always fresh.

## Examples[](#examples)

### Enabling Draft Mode[](#enabling-draft-mode)

To enable Draft Mode, create a new [Route Handler](https://nextjs.org/docs/app/api-reference/file-conventions/route) and call the `enable()` method:

### Disabling Draft Mode[](#disabling-draft-mode)

By default, the Draft Mode session ends when the browser is closed.

To disable Draft Mode manually, call the `disable()` method in your [Route Handler](https://nextjs.org/docs/app/api-reference/file-conventions/route):

Then, send a request to invoke the Route Handler. If calling the route using the [`<Link>` component](https://nextjs.org/docs/app/api-reference/components/link), you must pass `prefetch={false}` to prevent accidentally deleting the cookie on prefetch.

### Checking if Draft Mode is enabled[](#checking-if-draft-mode-is-enabled)

You can check if Draft Mode is enabled in a Server Component with the `isEnabled` property:

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v15.0.0-RC` | `draftMode` is now an async function. A [codemod](https://nextjs.org/docs/app/guides/upgrading/codemods#150) is available. |
| `v13.4.0` | `draftMode` introduced. |

## Next Steps

Learn how to use Draft Mode with this step-by-step guide.

[Previous

cookies

](https://nextjs.org/docs/app/api-reference/functions/cookies)[Next

fetch

](https://nextjs.org/docs/app/api-reference/functions/fetch)
