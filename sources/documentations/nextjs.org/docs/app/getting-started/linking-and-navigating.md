---
title: "Getting Started: Linking and Navigating"
source_url: "https://nextjs.org/docs/app/getting-started/linking-and-navigating"
crawled_at: "2026-06-25T06:55:55.185Z"
---

Last updated

June 23, 2026

In Next.js, routes are rendered on the server by default. This often means the client has to wait for a server response before a new route can be shown. Next.js comes with built-in [prefetching](#prefetching), [streaming](#streaming), and [client-side transitions](#client-side-transitions) ensuring navigation stays fast and responsive.

This guide explains how navigation works in Next.js and how you can optimize it for [dynamic routes](#dynamic-routes-without-loadingtsx) and [slow networks](#slow-networks).

## How navigation works[](#how-navigation-works)

To understand how navigation works in Next.js, it helps to be familiar with the following concepts:

-   [Server Rendering](#server-rendering)
-   [Prefetching](#prefetching)
-   [Streaming](#streaming)
-   [Client-side transitions](#client-side-transitions)

### Server Rendering[](#server-rendering)

In Next.js, [Layouts and Pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages) are [React Server Components](https://react.dev/reference/rsc/server-components) by default. On initial and subsequent navigations, the [Server Component Payload](https://nextjs.org/docs/app/getting-started/server-and-client-components#how-do-server-and-client-components-work-in-nextjs) is generated on the server before being sent to the client.

There are two types of server rendering, based on _when_ it happens:

-   **Prerendering** happens at build time or during [revalidation](https://nextjs.org/docs/app/getting-started/revalidating) and the result is cached.
-   **Dynamic Rendering** happens at request time in response to a client request.

The trade-off of server rendering is that the client must wait for the server to respond before the new route can be shown. Next.js addresses this delay by [prefetching](#prefetching) routes the user is likely to visit and performing [client-side transitions](#client-side-transitions).

> **Good to know**: HTML is also generated for the initial visit.

### Prefetching[](#prefetching)

Prefetching is the process of loading a route in the background before the user navigates to it. This makes navigation between routes in your application feel instant, because by the time a user clicks on a link, the data to render the next route is already available client side.

Next.js automatically prefetches routes linked with the [`<Link>` component](https://nextjs.org/docs/app/api-reference/components/link) when they enter the user's viewport.

How much of the route is prefetched depends on whether it's static or dynamic:

-   **Static Route**: the full route is prefetched.
-   **Dynamic Route**: prefetching is skipped, or the route is partially prefetched if [`loading.tsx`](https://nextjs.org/docs/app/api-reference/file-conventions/loading) is present.

By skipping or partially prefetching dynamic routes, Next.js avoids unnecessary work on the server for routes the users may never visit. However, waiting for a server response before navigation can give the users the impression that the app is not responding.

![Server Rendering without Streaming](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782370560/aha-mind/docs-crawler/nextjs.org/image_nssidt.png)![Server Rendering without Streaming](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782370559/aha-mind/docs-crawler/nextjs.org/image_rou4c6.png)

To improve the navigation experience to dynamic routes, you can use [streaming](#streaming).

### Streaming[](#streaming)

Streaming allows the server to send parts of a dynamic route to the client as soon as they're ready, rather than waiting for the entire route to be rendered. This means users see something sooner, even if parts of the page are still loading. See the [Streaming guide](https://nextjs.org/docs/app/guides/streaming) for a deep dive into how streaming works in Next.js.

For dynamic routes, it means they can be **partially prefetched**. That is, shared layouts and loading skeletons can be requested ahead of time.

![How Server Rendering with Streaming Works](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782370559/aha-mind/docs-crawler/nextjs.org/image_xxqbig.png)![How Server Rendering with Streaming Works](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782370560/aha-mind/docs-crawler/nextjs.org/image_kzohq0.png)

To use streaming, create a `loading.tsx` in your route folder:

![loading.js special file](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782370560/aha-mind/docs-crawler/nextjs.org/image_n1ibnp.png)![loading.js special file](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782370560/aha-mind/docs-crawler/nextjs.org/image_loe0l3.png)

Behind the scenes, Next.js will automatically wrap the `page.tsx` contents in a `<Suspense>` boundary. The prefetched fallback UI will be shown while the route is loading, and swapped for the actual content once ready.

> **Good to know**: You can also use [`<Suspense>`](https://react.dev/reference/react/Suspense) to create loading UI for nested components.

Benefits of `loading.tsx`:

-   Immediate navigation and visual feedback for the user.
-   Shared layouts remain interactive and navigation is interruptible.
-   Improved Core Web Vitals: [TTFB](https://web.dev/articles/ttfb), [FCP](https://web.dev/articles/fcp), and [TTI](https://web.dev/articles/tti).

To further improve the navigation experience, Next.js performs a [client-side transition](#client-side-transitions) with the `<Link>` component.

### Client-side transitions[](#client-side-transitions)

Traditionally, navigation to a server-rendered page triggers a full page load. This clears state, resets scroll position, and blocks interactivity.

Next.js avoids this with client-side transitions using the `<Link>` component. Instead of reloading the page, it updates the content dynamically by:

-   Keeping any shared layouts and UI.
-   Replacing the current page with the prefetched loading state or a new page if available.

Client-side transitions are what makes a server-rendered apps _feel_ like client-rendered apps. And when paired with [prefetching](#prefetching) and [streaming](#streaming), it enables fast transitions, even for dynamic routes.

Next.js also handles [scrolling to the top of the page](https://nextjs.org/docs/app/api-reference/components/link#scroll) during client-side transitions. If content scrolls behind a sticky or fixed header after navigation, you can fix this with CSS [`scroll-padding-top`](https://nextjs.org/docs/app/api-reference/components/link#scroll-offset-with-sticky-headers).

## What can make transitions slow?[](#what-can-make-transitions-slow)

These Next.js optimizations make navigation fast and responsive. However, under certain conditions, transitions can still _feel_ slow. Here are some common causes and how to improve the user experience:

### Dynamic routes without `loading.tsx`[](#dynamic-routes-without-loadingtsx)

When navigating to a dynamic route, the client must wait for the server response before showing the result. This can give the users the impression that the app is not responding.

We recommend adding `loading.tsx` to dynamic routes to enable partial prefetching, trigger immediate navigation, and display a loading UI while the route renders.

> **Good to know**: In development mode, you can use the Next.js Devtools to identify if the route is static or dynamic. See [`devIndicators`](https://nextjs.org/docs/app/api-reference/config/next-config-js/devIndicators) for more information.

### Dynamic segments without `generateStaticParams`[](#dynamic-segments-without-generatestaticparams)

If a [dynamic segment](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes) could be prerendered but isn't because it's missing [`generateStaticParams`](https://nextjs.org/docs/app/api-reference/functions/generate-static-params), the route will fallback to dynamic rendering at request time.

Ensure the route is statically generated at build time by adding `generateStaticParams`:

### Slow networks[](#slow-networks)

On slow or unstable networks, prefetching may not finish before the user clicks a link. This can affect both static and dynamic routes. In these cases, the `loading.js` fallback may not appear immediately because it hasn't been prefetched yet.

To improve perceived performance, you can use the [`useLinkStatus` hook](https://nextjs.org/docs/app/api-reference/functions/use-link-status) to show immediate feedback while the transition is in progress.

You can "debounce" the hint by adding an initial animation delay (e.g. 100ms) and starting as invisible (e.g. `opacity: 0`). This means the loading indicator will only be shown if the navigation takes longer than the specified delay. See the [`useLinkStatus` reference](https://nextjs.org/docs/app/api-reference/functions/use-link-status#gracefully-handling-fast-navigation) for a CSS example.

> **Good to know**: You can use other visual feedback patterns like a progress bar. View an example [here](https://github.com/vercel/react-transition-progress).

### Disabling prefetching[](#disabling-prefetching)

You can opt out of prefetching by setting the `prefetch` prop to `false` on the `<Link>` component. This is useful to avoid unnecessary usage of resources when rendering large lists of links (e.g. an infinite scroll table).

However, disabling prefetching comes with trade-offs:

-   **Static routes** will only be fetched when the user clicks the link.
-   **Dynamic routes** will need to be rendered on the server first before the client can navigate to it.

To reduce resource usage without fully disabling prefetch, you can prefetch only on hover. This limits prefetching to routes the user is more _likely_ to visit, rather than all links in the viewport.

### Hydration not completed[](#hydration-not-completed)

`<Link>` is a Client Component and must be hydrated before it can prefetch routes. On the initial visit, large JavaScript bundles can delay hydration, preventing prefetching from starting right away.

React mitigates this with Selective Hydration and you can further improve this by:

-   Using the [`@next/bundle-analyzer`](https://nextjs.org/docs/app/guides/package-bundling#nextbundle-analyzer-for-webpack) plugin to identify and reduce bundle size by removing large dependencies.
-   Moving logic from the client to the server where possible. See the [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) docs for guidance.

## Examples[](#examples)

### Native History API[](#native-history-api)

Next.js allows you to use the native [`window.history.pushState`](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState) and [`window.history.replaceState`](https://developer.mozilla.org/en-US/docs/Web/API/History/replaceState) methods to update the browser's history stack without reloading the page.

`pushState` and `replaceState` calls integrate into the Next.js Router, allowing you to sync with [`usePathname`](https://nextjs.org/docs/app/api-reference/functions/use-pathname) and [`useSearchParams`](https://nextjs.org/docs/app/api-reference/functions/use-search-params).

#### `window.history.pushState`[](#windowhistorypushstate)

Use it to add a new entry to the browser's history stack. The user can navigate back to the previous state. For example, to sort a list of products:

#### `window.history.replaceState`[](#windowhistoryreplacestate)

Use it to replace the current entry on the browser's history stack. The user is not able to navigate back to the previous state. For example, to switch the application's locale:
