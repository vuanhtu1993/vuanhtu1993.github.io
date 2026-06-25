---
title: "Upgrading: Version 15"
source_url: "https://nextjs.org/docs/app/guides/upgrading/version-15"
crawled_at: "2026-06-25T07:03:20.344Z"
---

## How to upgrade to version 15

Last updated

June 23, 2026

## Upgrading from 14 to 15[](#upgrading-from-14-to-15)

To update to Next.js version 15, you can use the `upgrade` codemod:

If you prefer to do it manually, ensure that you're installing the latest Next & React versions:

> **Good to know:**
> 
> -   If you see a peer dependencies warning, you may need to update `react` and `react-dom` to the suggested versions, or use the `--force` or `--legacy-peer-deps` flag to ignore the warning. This won't be necessary once both Next.js 15 and React 19 are stable.

## React 19[](#react-19)

-   The minimum versions of `react` and `react-dom` is now 19.
-   `useFormState` has been replaced by `useActionState`. The `useFormState` hook is still available in React 19, but it is deprecated and will be removed in a future release. `useActionState` is recommended and includes additional properties like reading the `pending` state directly. [Learn more](https://react.dev/reference/react/useActionState).
-   `useFormStatus` now includes additional keys like `data`, `method`, and `action`. If you are not using React 19, only the `pending` key is available. [Learn more](https://react.dev/reference/react-dom/hooks/useFormStatus).
-   Read more in the [React 19 upgrade guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide).

> **Good to know:** If you are using TypeScript, ensure you also upgrade `@types/react` and `@types/react-dom` to their latest versions.

## Async Request APIs (Breaking change)[](#async-request-apis-breaking-change)

Previously synchronous Request-time APIs that rely on request information are now **asynchronous**:

-   [`cookies`](https://nextjs.org/docs/app/api-reference/functions/cookies)
-   [`headers`](https://nextjs.org/docs/app/api-reference/functions/headers)
-   [`draftMode`](https://nextjs.org/docs/app/api-reference/functions/draft-mode)
-   `params` in [`layout.js`](https://nextjs.org/docs/app/api-reference/file-conventions/layout), [`page.js`](https://nextjs.org/docs/app/api-reference/file-conventions/page), [`route.js`](https://nextjs.org/docs/app/api-reference/file-conventions/route), [`default.js`](https://nextjs.org/docs/app/api-reference/file-conventions/default), [`opengraph-image`](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image), [`twitter-image`](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image), [`icon`](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons), and [`apple-icon`](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons).
-   `searchParams` in [`page.js`](https://nextjs.org/docs/app/api-reference/file-conventions/page)

To ease the burden of migration, a [codemod is available](https://nextjs.org/docs/app/guides/upgrading/codemods#150) to automate the process and the APIs can temporarily be accessed synchronously.

### `cookies`[](#cookies)

#### Recommended Async Usage[](#recommended-async-usage)

#### Temporary Synchronous Usage[](#temporary-synchronous-usage)

#### Recommended Async Usage[](#recommended-async-usage-1)

#### Temporary Synchronous Usage[](#temporary-synchronous-usage-1)

### `draftMode`[](#draftmode)

#### Recommended Async Usage[](#recommended-async-usage-2)

#### Temporary Synchronous Usage[](#temporary-synchronous-usage-2)

### `params` & `searchParams`[](#params--searchparams)

#### Asynchronous Layout[](#asynchronous-layout)

#### Synchronous Layout[](#synchronous-layout)

#### Asynchronous Page[](#asynchronous-page)

#### Synchronous Page[](#synchronous-page)

#### Route Handlers[](#route-handlers)

## `runtime` configuration (Breaking change)[](#runtime-configuration-breaking-change)

The `runtime` [segment configuration](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/runtime) previously supported a value of `experimental-edge` in addition to `edge`. Both configurations refer to the same thing, and to simplify the options, we will now error if `experimental-edge` is used. To fix this, update your `runtime` configuration to `edge`. A [codemod](https://nextjs.org/docs/app/guides/upgrading/codemods#app-dir-runtime-config-experimental-edge) is available to automatically do this.

## `fetch` requests[](#fetch-requests)

[`fetch` requests](https://nextjs.org/docs/app/api-reference/functions/fetch) are no longer cached by default.

To opt specific `fetch` requests into caching, you can pass the `cache: 'force-cache'` option.

To opt all `fetch` requests in a layout or page into caching, you can use the `export const fetchCache = 'default-cache'` [segment config option](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config). If individual `fetch` requests specify a `cache` option, that will be used instead.

## Route Handlers[](#route-handlers-1)

`GET` functions in [Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route) are no longer cached by default. To opt `GET` methods into caching, you can use a [route config option](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config) such as `export const dynamic = 'force-static'` in your Route Handler file.

## Client Cache[](#client-cache)

When navigating between pages via `<Link>` or `useRouter`, [page](https://nextjs.org/docs/app/api-reference/file-conventions/page) segments are no longer reused from the [Client Cache](https://nextjs.org/docs/app/glossary#client-cache). However, they are still reused during browser backward and forward navigation and for shared layouts.

To opt page segments into caching, you can use the [`staleTimes`](https://nextjs.org/docs/app/api-reference/config/next-config-js/staleTimes) config option:

[Layouts](https://nextjs.org/docs/app/api-reference/file-conventions/layout) and [loading states](https://nextjs.org/docs/app/api-reference/file-conventions/loading) are still cached and reused on navigation.

## `next/font`[](#nextfont)

The `@next/font` package has been removed in favor of the built-in [`next/font`](https://nextjs.org/docs/app/api-reference/components/font). A [codemod is available](https://nextjs.org/docs/app/guides/upgrading/codemods#built-in-next-font) to safely and automatically rename your imports.

## bundlePagesRouterDependencies[](#bundlepagesrouterdependencies)

`experimental.bundlePagesExternals` is now stable and renamed to `bundlePagesRouterDependencies`.

## serverExternalPackages[](#serverexternalpackages)

`experimental.serverComponentsExternalPackages` is now stable and renamed to `serverExternalPackages`.

## Speed Insights[](#speed-insights)

Auto instrumentation for Speed Insights was removed in Next.js 15.

To continue using Speed Insights, follow the [Vercel Speed Insights Quickstart](https://vercel.com/docs/speed-insights/quickstart) guide.

## `NextRequest` Geolocation[](#nextrequest-geolocation)

The `geo` and `ip` properties on `NextRequest` have been removed as these values are provided by your hosting provider. A [codemod](https://nextjs.org/docs/app/guides/upgrading/codemods#150) is available to automate this migration.

If you are using Vercel, you can alternatively use the `geolocation` and `ipAddress` functions from [`@vercel/functions`](https://vercel.com/docs/functions/vercel-functions-package) instead:
