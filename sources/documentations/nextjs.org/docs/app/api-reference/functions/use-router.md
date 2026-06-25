---
title: "Functions: useRouter"
source_url: "https://nextjs.org/docs/app/api-reference/functions/use-router"
crawled_at: "2026-06-25T07:11:38.700Z"
---

This page is also available as Markdown at [/docs/app/api-reference/functions/use-router.md](https://nextjs.org/docs/app/api-reference/functions/use-router.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

Last updated

March 3, 2026

The `useRouter` hook allows you to programmatically change routes inside [Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components).

> **Recommendation:** Use the [`<Link>` component](https://nextjs.org/docs/app/api-reference/components/link) for navigation unless you have a specific requirement for using `useRouter`.

## `useRouter()`[](#userouter)

-   `router.push(href: string, { scroll: boolean, transitionTypes: string[] })`: Perform a client-side navigation to the provided route. Adds a new entry into the [browser's history stack](https://developer.mozilla.org/docs/Web/API/History_API). The optional `transitionTypes` are passed to [`React.addTransitionType`](https://react.dev/reference/react/addTransitionType) inside the navigation Transition.
-   `router.replace(href: string, { scroll: boolean, transitionTypes: string[] })`: Perform a client-side navigation to the provided route without adding a new entry into the browser’s history stack. The optional `transitionTypes` are passed to [`React.addTransitionType`](https://react.dev/reference/react/addTransitionType) inside the navigation Transition.
-   `router.refresh()`: Refresh the current route. Making a new request to the server, re-fetching data requests, and re-rendering Server Components. The client will merge the updated React Server Component payload without losing unaffected client-side React (e.g. `useState`) or browser state (e.g. scroll position). This clears the [Client Cache](https://nextjs.org/docs/app/glossary#client-cache) for the current route, but does **not** invalidate the server-side cache. Use [`revalidatePath`](https://nextjs.org/docs/app/api-reference/functions/revalidatePath) or [`revalidateTag`](https://nextjs.org/docs/app/api-reference/functions/revalidateTag) to invalidate server-side cached data.
-   `router.prefetch(href: string, options?: { onInvalidate?: () => void })`: [Prefetch](https://nextjs.org/docs/app/getting-started/linking-and-navigating#prefetching) the provided route for faster client-side transitions. The optional `onInvalidate` callback is called when the [prefetched data becomes stale](https://nextjs.org/docs/app/guides/prefetching#extending-or-ejecting-link).
-   `router.back()`: Navigate back to the previous route in the browser’s history stack.
-   `router.forward()`: Navigate forwards to the next page in the browser’s history stack.

> **Good to know**:
> 
> -   You must not send untrusted or unsanitized URLs to `router.push` or `router.replace`, as this can open your site to cross-site scripting (XSS) vulnerabilities. For example, `javascript:` URLs sent to `router.push` or `router.replace` will be executed in the context of your page.
> -   The `<Link>` component automatically prefetch routes as they become visible in the viewport.
> -   `refresh()` could re-produce the same result if fetch requests are cached. Other Request-time APIs like `cookies` and `headers` could also change the response.
> -   The `onInvalidate` callback is called at most once per prefetch request. It signals when you may want to trigger a new prefetch for updated route data.

### Migrating from `next/router`[](#migrating-from-nextrouter)

-   The `useRouter` hook should be imported from `next/navigation` and not `next/router` when using the App Router
-   The `pathname` string has been removed and is replaced by [`usePathname()`](https://nextjs.org/docs/app/api-reference/functions/use-pathname)
-   The `query` object has been removed and is replaced by [`useSearchParams()`](https://nextjs.org/docs/app/api-reference/functions/use-search-params)
-   `router.events` has been replaced. [See below.](#router-events)

[View the full migration guide](https://nextjs.org/docs/app/guides/migrating/app-router-migration).

## Examples[](#examples)

### Router events[](#router-events)

You can listen for page changes by composing other Client Component hooks like `usePathname` and `useSearchParams`.

Which can be imported into a layout.

> **Good to know**: `<NavigationEvents>` is wrapped in a [`Suspense` boundary](https://nextjs.org/docs/app/api-reference/file-conventions/loading#examples) because[`useSearchParams()`](https://nextjs.org/docs/app/api-reference/functions/use-search-params) causes client-side rendering up to the closest `Suspense` boundary during [prerendering](https://nextjs.org/docs/app/glossary#prerendering). [Learn more](https://nextjs.org/docs/app/api-reference/functions/use-search-params#behavior).

### Disabling scroll to top[](#disabling-scroll-to-top)

By default, Next.js will scroll to the top of the page when navigating to a new route. You can disable this behavior by passing `scroll: false` to `router.push()` or `router.replace()`.

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v15.4.0` | Optional `onInvalidate` callback for `router.prefetch` introduced |
| `v13.0.0` | `useRouter` from `next/navigation` introduced. |

[Previous

useReportWebVitals

](https://nextjs.org/docs/app/api-reference/functions/use-report-web-vitals)[Next

useSearchParams

](https://nextjs.org/docs/app/api-reference/functions/use-search-params)
