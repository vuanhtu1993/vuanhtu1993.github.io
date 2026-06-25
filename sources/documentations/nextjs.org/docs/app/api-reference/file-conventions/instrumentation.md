---
title: "File-system conventions: instrumentation.js"
source_url: "https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation"
crawled_at: "2026-06-25T07:05:24.692Z"
---

Last updated

June 23, 2026

The `instrumentation.js|ts` file is used to integrate observability tools into your application, allowing you to track the performance and behavior, and to debug issues in production.

To use it, place the file in the **root** of your application or inside a [`src` folder](https://nextjs.org/docs/app/api-reference/file-conventions/src-folder) if using one.

## Exports[](#exports)

### `register` (optional)[](#register-optional)

The file exports a `register` function that is called **once** when a new Next.js server instance is initiated, and must complete before the server is ready to handle requests. `register` can be an async function.

### `onRequestError` (optional)[](#onrequesterror-optional)

You can optionally export an `onRequestError` function to track **server** errors to any custom observability provider.

-   If you're running any async tasks in `onRequestError`, make sure they're awaited. `onRequestError` will be triggered when the Next.js server captures the error.
-   The `error` instance might not be the original error instance thrown, as it may be processed by React if encountered during Server Components rendering. If this happens, you can use `digest` property on an error to identify the actual error type.

#### Parameters[](#parameters)

The function accepts three parameters: `error`, `request`, and `context`.

-   `error`: The caught value is typed as `unknown`. Narrow it before reading properties like `message` or `digest`.
-   `request`: Read-only request information associated with the error.
-   `context`: The context in which the error occurred. This can be the type of router (App or Pages Router), and/or (Server Components (`'render'`), Route Handlers (`'route'`), Server Actions (`'action'`), or Proxy (`'proxy'`)).

### Specifying the runtime[](#specifying-the-runtime)

The `instrumentation.js` file works in both the Node.js and Edge runtime, however, you can use `process.env.NEXT_RUNTIME` to target a specific runtime.

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v15.0.0` | `onRequestError` introduced, `instrumentation` stable |
| `v14.0.4` | Turbopack support for `instrumentation` |
| `v13.2.0` | `instrumentation` introduced as an experimental feature |
