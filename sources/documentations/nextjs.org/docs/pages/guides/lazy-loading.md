---
title: "Guides: Lazy Loading"
source_url: "https://nextjs.org/docs/pages/guides/lazy-loading"
crawled_at: "2026-06-25T07:23:10.444Z"
---

## How to lazy load Client Components and libraries

Last updated

April 24, 2025

[Lazy loading](https://developer.mozilla.org/docs/Web/Performance/Lazy_loading) in Next.js helps improve the initial loading performance of an application by decreasing the amount of JavaScript needed to render a route.

## `next/dynamic`[](#nextdynamic-1)

`next/dynamic` is a composite of [`React.lazy()`](https://react.dev/reference/react/lazy) and [Suspense](https://react.dev/reference/react/Suspense). It behaves the same way in the `app` and `pages` directories to allow for incremental migration.

In the example below, by using `next/dynamic`, the header component will not be included in the page's initial JavaScript bundle. The page will render the Suspense `fallback` first, followed by the `Header` component when the `Suspense` boundary is resolved.

> **Good to know**: In `import('path/to/component')`, the path must be explicitly written. It can't be a template string nor a variable. Furthermore the `import()` has to be inside the `dynamic()` call for Next.js to be able to match webpack bundles / module ids to the specific `dynamic()` call and preload them before rendering. `dynamic()` can't be used inside of React rendering as it needs to be marked in the top level of the module for preloading to work, similar to `React.lazy`.

## Examples[](#examples-1)

### With named exports[](#with-named-exports)

To dynamically import a named export, you can return it from the [Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) returned by [`import()`](https://github.com/tc39/proposal-dynamic-import#example):

### With no SSR[](#with-no-ssr)

To dynamically load a component on the client side, you can use the `ssr` option to disable server-rendering. This is useful if an external dependency or component relies on browser APIs like `window`.

### With external libraries[](#with-external-libraries)

This example uses the external library `fuse.js` for fuzzy search. The module is only loaded in the browser after the user types in the search input.
