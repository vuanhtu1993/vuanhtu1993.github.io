---
title: "Functions: unstable_catchError"
source_url: "https://nextjs.org/docs/app/api-reference/functions/catchError"
crawled_at: "2026-06-25T07:08:26.283Z"
---

Last updated

May 13, 2026

The `unstable_catchError` function creates a component that wraps its children in an error boundary. It provides a programmatic alternative to the [`error.js`](https://nextjs.org/docs/app/api-reference/file-conventions/error) file convention, enabling component-level error recovery anywhere in your component tree.

Compared to a custom React error boundary, `unstable_catchError` is designed to work with Next.js out of the box:

-   **Built-in error recovery** — [`unstable_retry()`](https://nextjs.org/docs/app/api-reference/file-conventions/error#unstable_retry) re-renders the page inside a [Transition](https://react.dev/reference/react/startTransition), preserving Client Components state outside of the error boundary.
-   **Framework-aware integration** — APIs like `redirect()` and `notFound()` work by throwing special errors under the hood. `unstable_catchError` handles these seamlessly, so they're not accidentally caught by your error boundary.
-   **Client navigation handling** — The error state automatically clears when you do a client navigation to a different route.

`unstable_catchError` can be called from [Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components).

## Reference[](#reference)

### Parameters[](#parameters)

`unstable_catchError` accepts a single argument:

#### `fallback`[](#fallback)

A function that renders the error UI when an error is caught. It receives two arguments:

-   `props` — The props passed to the wrapper component (excluding `children`).
-   `errorInfo` — An object containing information about the error:

| Property | Type | Description |
| --- | --- | --- |
| `error` | [`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) | The error instance that was caught. |
| `unstable_retry` | `() => void` | Re-fetches and re-renders the error boundary's children. If successful, the fallback is replaced with the re-rendered result. |
| `reset` | `() => void` | Resets the error state and re-renders without re-fetching. Use [`unstable_retry()`](https://nextjs.org/docs/app/api-reference/file-conventions/error#unstable_retry) in most cases. |

The `fallback` function must be a Client Component (or defined in a `'use client'` module).

### Returns[](#returns)

`unstable_catchError` returns a React component that:

-   Accepts the same props as your fallback's first argument, plus `children`.
-   Wraps `children` in an error boundary.
-   Renders the `fallback` when an error is caught in `children`.

## Examples[](#examples)

### Client Component[](#client-component)

Define a fallback and use the returned component to wrap parts of your UI:

### Recovering from errors[](#recovering-from-errors)

Use `unstable_retry()` to prompt the user to recover from the error. When called, the function re-fetches and re-renders the error boundary's children. If successful, the fallback is replaced with the re-rendered result.

In most cases, use `unstable_retry()` instead of `reset()`. The `reset()` function only clears the error state and re-renders without re-fetching, which means it won't recover from Server Component errors.

### Server-rendered error fallback[](#server-rendered-error-fallback)

You can pass server-rendered content as a prop to display data-driven fallback UI. This works by rendering a Server Component as a `React.ReactNode` prop that the fallback displays when an error is caught.

> **Good to know**: This pattern eagerly renders the fallback on every page render, even when no error occurs. For most use cases, a simpler client-side fallback is sufficient.

> **Good to know**:
> 
> -   Unlike the `error.js` file convention which is scoped to route segments, `unstable_catchError` can be used to wrap any part of your component tree for component-level error recovery.
> -   Props passed to the wrapper component are forwarded to the fallback function, making it easy to create reusable error UIs with different configurations.
> -   You don't need to wrap `error.js` default exports with `unstable_catchError`. The [`error.js`](https://nextjs.org/docs/app/api-reference/file-conventions/error) file convention already renders inside a built-in error boundary provided by Next.js.

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v16.2.0` | `unstable_catchError` introduced. |
