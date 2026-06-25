---
title: "Functions: usePathname"
source_url: "https://nextjs.org/docs/app/api-reference/functions/use-pathname"
crawled_at: "2026-06-25T07:11:26.845Z"
---

Last updated

May 13, 2026

`usePathname` is a **Client Component** hook that lets you read the current URL's **pathname**.

> **Good to know**: When [`cacheComponents`](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents) is enabled `usePathname` may require a `Suspense` boundary around it if your route has a dynamic param. If you use `generateStaticParams` the `Suspense` boundary is optional

`usePathname` intentionally requires using a [Client Component](https://nextjs.org/docs/app/getting-started/server-and-client-components). It's important to note Client Components are not a de-optimization. They are an integral part of the [Server Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) architecture.

For example, a Client Component with `usePathname` will be rendered into HTML on the initial page load. When navigating to a new route, this component does not need to be re-fetched. Instead, the component is downloaded once (in the client JavaScript bundle), and re-renders based on the current state.

> **Good to know**:
> 
> -   Reading the current URL from a [Server Component](https://nextjs.org/docs/app/getting-started/server-and-client-components) is not supported. This design is intentional to support layout state being preserved across page navigations.
> -   If your page is being statically prerendered and your app has [rewrites](https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites) in `next.config` or a [Proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) file, reading the pathname with `usePathname()` can result in hydration mismatch errors—because the initial value comes from the server and may not match the actual browser pathname after routing. See our [example](#avoid-hydration-mismatch-with-rewrites) for a way to mitigate this issue.

Compatibility with Pages Router

If you have components that use `usePathname` and they are imported into routes within the Pages Router, be aware that `usePathname` may return `null` if the router is not yet initialized. This can occur in cases such as [fallback routes](https://nextjs.org/docs/pages/api-reference/functions/get-static-paths#fallback-true) or during [Automatic Static Optimization](https://nextjs.org/docs/pages/building-your-application/rendering/automatic-static-optimization) in the Pages Router.

To enhance compatibility between routing systems, if your project contains both an `app` and a `pages` directory, Next.js will automatically adjust the return type of `usePathname`.

## Parameters[](#parameters)

`usePathname` does not take any parameters.

## Returns[](#returns)

`usePathname` returns a string of the current URL's pathname. For example:

| URL | Returned value |
| --- | --- |
| `/` | `'/'` |
| `/dashboard` | `'/dashboard'` |
| `/dashboard?v=2` | `'/dashboard'` |
| `/blog/hello-world` | `'/blog/hello-world'` |

## Examples[](#examples)

### Do something in response to a route change[](#do-something-in-response-to-a-route-change)

### Avoid hydration mismatch with rewrites[](#avoid-hydration-mismatch-with-rewrites)

When a page is prerendered, the HTML is generated for the source pathname. If the page is then reached through a rewrite using `next.config` or `Proxy`, the browser URL may differ, and `usePathname()` will read the rewritten pathname on the client.

To avoid hydration mismatches, design the UI so that only a small, isolated part depends on the client pathname. Render a stable fallback on the server and update that part after mount.

| Version | Changes |
| --- | --- |
| `v13.0.0` | `usePathname` introduced. |
