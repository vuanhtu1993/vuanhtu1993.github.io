---
title: "Guides: Migrating to Cache Components"
source_url: "https://nextjs.org/docs/app/guides/migrating-to-cache-components"
crawled_at: "2026-06-25T07:00:23.295Z"
---

Last updated

June 23, 2026

When [Cache Components](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents) is enabled, route segment configs like `dynamic`, `revalidate`, and `fetchCache` are replaced by [`use cache`](https://nextjs.org/docs/app/api-reference/directives/use-cache) and [`cacheLife`](https://nextjs.org/docs/app/api-reference/functions/cacheLife).

Start by removing the route segment configs (`dynamic`, `revalidate`, `fetchCache`). With Cache Components enabled, Next.js surfaces uncached dynamic data as errors in development, naming the code to fix, most often uncached data to cache with [`use cache`](https://nextjs.org/docs/app/api-reference/directives/use-cache) or runtime data to wrap in [`<Suspense>`](https://react.dev/reference/react/Suspense).

Your existing `fetch` and `unstable_cache` caching keeps working as a separate layer, so let the errors guide what to change.

Some surfaces have their own steps:

-   For routes with dynamic params, follow the [`generateStaticParams`](#generatestaticparams-and-dynamicparams) guidance.
-   For metadata, follow the [`generateMetadata` and `generateViewport`](#generatemetadata-and-generateviewport) guidance.

The sections below cover each config and API and what to do with it under Cache Components.

## Enable Cache Components[](#enable-cache-components)

Cache Components requires Next.js 16. If you're on Next.js 15 or earlier, upgrade first by following the [version 16 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16). Coming from an older version, work through the [upgrade guides](https://nextjs.org/docs/app/guides/upgrading) to reach 16 before continuing.

Then enable the [`cacheComponents`](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents) flag in `next.config.ts`:

> **Good to know:** If you were using `experimental.dynamicIO` or `experimental.useCache`, `cacheComponents` replaces them. See the [version 16 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16#experimentaldynamicio-and-experimentalusecache).

## `dynamic = "force-dynamic"`[](#dynamic--force-dynamic)

**Not needed.** All pages are dynamic by default.

## `dynamic = "force-static"`[](#dynamic--force-static)

Start by removing it. When unhandled uncached or runtime data access is detected during development and build time, Next.js raises an error. Otherwise, the prerendering step automatically extracts the static HTML shell.

For uncached data access, add [`use cache`](https://nextjs.org/docs/app/api-reference/directives/use-cache) as close to the data access as possible with a long [`cacheLife`](https://nextjs.org/docs/app/api-reference/functions/cacheLife) like `'max'` to maintain cached behavior. If needed, add it at the top of the page or layout.

For runtime data access (`cookies()`, `headers()`, etc.), errors will direct you to wrap it with `<Suspense>`. Since you started by using `force-static`, you must remove the runtime data access to prevent any request time work.

## `revalidate`[](#revalidate)

**Replace with `cacheLife`.** Use the `cacheLife` function to define cache duration instead of the route segment config.

## `fetchCache`[](#fetchcache)

**Not needed.** With `use cache`, all data fetching within a cached scope is automatically cached, making `fetchCache` unnecessary.

## `fetch` cache options[](#fetch-cache-options)

**Move `cache` and `next` options to `use cache`.**

Without Cache Components, you cache a request with `cache: 'force-cache'` and tune it with `next: { revalidate, tags }`.

With Cache Components, wrap the fetch in a [`use cache`](https://nextjs.org/docs/app/api-reference/directives/use-cache) function. Fetches inside that scope are cached automatically, and `revalidate` and `tags` become [`cacheLife`](https://nextjs.org/docs/app/api-reference/functions/cacheLife) and [`cacheTag`](https://nextjs.org/docs/app/api-reference/functions/cacheTag).

Note the persistence difference. The `fetch` Data Cache persists cached responses across deployments and across serverless instances.

`use cache` defaults to in-memory storage, so its entries are discarded when the serverless instance is destroyed and are scoped to a single deployment. Use [`use cache: remote`](https://nextjs.org/docs/app/api-reference/directives/use-cache-remote) or a [cache handler](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheHandlers) for storage that survives instance teardown. Even with durable storage, expect cached values to recompute after a new deployment.

## `unstable_cache`[](#unstable_cache)

**Replace with `use cache`.**

`unstable_cache` is replaced by the [`use cache`](https://nextjs.org/docs/app/api-reference/directives/use-cache) directive.

Turn the wrapped function into a function with the `'use cache'` directive. The cache key is derived automatically from the arguments, so the key-parts array is no longer needed, and the `options` object maps to [`cacheLife`](https://nextjs.org/docs/app/api-reference/functions/cacheLife) and [`cacheTag`](https://nextjs.org/docs/app/api-reference/functions/cacheTag).

Like the `fetch` Data Cache, `unstable_cache` persists cached values across deployments and serverless instances, while `use cache` does not. See [`fetch` cache options](#fetch-cache-options) above for the storage details.

## On-demand revalidation (`revalidateTag`, `revalidatePath`, `updateTag`)[](#on-demand-revalidation-revalidatetag-revalidatepath-updatetag)

On-demand invalidation still works by tagging cached data and expiring it after an event. Tag data with [`cacheTag`](https://nextjs.org/docs/app/api-reference/functions/cacheTag) inside a `use cache` function instead of the `fetch` `next.tags` option, then choose the invalidation API by the behavior you want:

-   [`updateTag`](https://nextjs.org/docs/app/api-reference/functions/updateTag): for mutations whose result the user must see immediately (read-your-own-writes). Called from a Server Action, it expires the tag so the next request waits for fresh data instead of serving stale content.
-   [`revalidateTag`](https://nextjs.org/docs/app/api-reference/functions/revalidateTag): for stale-while-revalidate. Pass a cache profile like `'max'` to serve cached data while it refreshes in the background. Works in Server Actions and Route Handlers.
-   [`revalidatePath`](https://nextjs.org/docs/app/api-reference/functions/revalidatePath): unchanged from the previous caching model.

`updateTag` isn't exclusive to Cache Components (it also works with the previous caching model), but migrating is a good time to adopt it. After a mutation in a Server Action, reach for it when the user should see their own change right away.

> **Good to know:** `updateTag` can only be called from a Server Action; calling it elsewhere throws. In Route Handlers or webhooks, use `revalidateTag` instead.

## `unstable_noStore`[](#unstable_nostore)

**Not needed.** `unstable_noStore` (`noStore()`) opts a component out of caching. With Cache Components, nothing is cached unless you add `use cache`, so you can remove it. If a component must run at request time, call [`connection()`](https://nextjs.org/docs/app/api-reference/functions/connection) before the work and wrap it in `<Suspense>`.

## `generateStaticParams` and `dynamicParams`[](#generatestaticparams-and-dynamicparams)

One behavior changes for [dynamic routes](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes) when Cache Components is enabled.

### `generateStaticParams` must return at least one param[](#generatestaticparams-must-return-at-least-one-param)

**Returning an empty array now errors.** Without Cache Components, returning `[]` defers every path to the first runtime visit. With Cache Components, [`generateStaticParams`](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) must return at least one param so Next.js can prerender the route. An empty array raises [`empty-generate-static-params`](https://nextjs.org/docs/messages/empty-generate-static-params).

## `cookies`, `headers`, and `searchParams`[](#cookies-headers-and-searchparams)

**Wrap runtime data access in `<Suspense>`.** Without Cache Components, reading [`cookies()`](https://nextjs.org/docs/app/api-reference/functions/cookies), [`headers()`](https://nextjs.org/docs/app/api-reference/functions/headers), or [`searchParams`](https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional) opts the whole route into dynamic rendering. With Cache Components, accessing them outside a [`<Suspense>`](https://react.dev/reference/react/Suspense) boundary surfaces the [**blocking-route** insight](https://nextjs.org/docs/messages/blocking-route). Move the access into a component wrapped in `<Suspense>` so the rest of the page prerenders as a static shell and the dynamic part streams in at request time.

Your page receives `params` and `searchParams` as props, and both are promises. Apply the same pattern: pass the promise straight through to the `<Suspense>`\-wrapped component as a prop and `await` it there, rather than at the top of the page. You can also unwrap the promise inline with `.then()` and pass a plain value down; see [Streaming](https://nextjs.org/docs/app/guides/streaming#push-dynamic-access-down) for a similar pattern.

## Route Handlers (`GET`)[](#route-handlers-get)

**Replace `dynamic = 'force-static'` with `use cache`.**

Without Cache Components, a `GET` [Route Handler](https://nextjs.org/docs/app/api-reference/file-conventions/route) is dynamic unless you opt into caching with `export const dynamic = 'force-static'`. With Cache Components, `GET` handlers follow the same model as pages: they prerender when they don't access uncached or runtime data, and you cache uncached data with `use cache`. Remove the `dynamic` config and move the data access into a separate function marked with `use cache`. The directive can't be applied to the `GET` export itself, so the handler calls a cached helper.

> **Good to know:** Reading uncached or runtime data in a `GET` handler bails out of prerendering by **throwing**. A `try/catch` you already have around other operations will catch that bail-out. If the `catch` block logs the error, it adds noise to the build output. Set `experimental.hideLogsAfterAbort: true` to hide logs emitted after a bail-out.

**Cache external data with `use cache`, or mark intentionally dynamic pages.** Under Cache Components, [`generateMetadata`](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) and [`generateViewport`](https://nextjs.org/docs/app/api-reference/functions/generate-viewport) follow the same rules as components. If they read runtime data (`cookies()`, `headers()`, `params`, `searchParams`) or fetch uncached data while the rest of the page is otherwise prerenderable, Next.js raises an error so the choice is explicit. If the metadata depends on external but not runtime data, add `use cache`.

If the metadata genuinely needs runtime data, you can't wrap `generateMetadata` in `<Suspense>`. Instead, add a dynamic marker component to the page so the static content still prerenders while the metadata streams in.

See [`generateMetadata` with Cache Components](https://nextjs.org/docs/app/api-reference/functions/generate-metadata#with-cache-components) and [`generateViewport` with Cache Components](https://nextjs.org/docs/app/api-reference/functions/generate-viewport#with-cache-components) for the full set of fix options and trade-offs.

## `runtime = 'edge'`[](#runtime--edge)

**Not supported.** Cache Components requires the Node.js runtime. Switch to the Node.js runtime (the default) by removing the `runtime = 'edge'` export. If you need edge behavior for specific routes, use [Proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) instead.

## `experimental_ppr`[](#experimental_ppr)

**Removed. Enable `cacheComponents` instead.** Next.js 16 removes the experimental Partial Prerendering flag (`experimental.ppr`) and the `experimental_ppr` route segment config. Partial Prerendering is now part of [Cache Components](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents), so remove `experimental.ppr` from `next.config` and `experimental_ppr` from your segments. A [codemod](https://nextjs.org/docs/app/guides/upgrading/codemods#remove-experimental_ppr-route-segment-config-from-app-router-pages-and-layouts) removes the segment config for you.

## UI state preservation[](#ui-state-preservation)

**Component state now persists across navigations.** With Cache Components, Next.js preserves routes using React's [`<Activity>`](https://react.dev/reference/react/Activity) component in [`"hidden"`](https://react.dev/reference/react/Activity#activity) mode instead of unmounting them. Effects clean up and re-run normally, but `useState` values, form inputs, and scroll position are no longer reset when navigating away and back.

If your code relied on unmounting to clear state, you may need to add explicit reset logic:

-   **Dropdowns and popovers**: stay open when navigating back. Close them in a `useLayoutEffect` cleanup function.
-   **Dialogs with initialization logic**: Effects that depend on dialog state (like focusing an input) won't re-fire if the state was preserved. Derive dialog state from the URL instead.
-   **Forms after submission**: input values and `useActionState` results (success/error messages) persist when returning. Reset in the submit handler or user action when possible, otherwise use a cleanup effect.

See [Preserving UI state across navigations](https://nextjs.org/docs/app/guides/preserving-ui-state) for detailed examples of each pattern.
