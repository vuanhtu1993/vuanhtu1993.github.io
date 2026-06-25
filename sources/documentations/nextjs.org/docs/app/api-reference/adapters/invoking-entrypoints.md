---
title: "Adapters: Invoking Entrypoints"
source_url: "https://nextjs.org/docs/app/api-reference/adapters/invoking-entrypoints"
crawled_at: "2026-06-25T07:20:10.225Z"
---

Last updated

March 31, 2026

Build output entrypoints use a `handler(..., ctx)` interface, with runtime-specific request/response types.

## Node.js runtime (`runtime: 'nodejs'`)[](#nodejs-runtime-runtime-nodejs)

Node.js entrypoints use the following interface:

When invoking Node.js entrypoints directly, adapters can pass helpers directly on `requestMeta` instead of relying on internals. Some of the supported fields are `hostname`, `revalidate`, and `render404`:

Relevant files in the Next.js core:

-   [`packages/next/src/build/templates/app-page.ts`](https://github.com/vercel/next.js/blob/canary/packages/next/src/build/templates/app-page.ts)
-   [`packages/next/src/build/templates/app-route.ts`](https://github.com/vercel/next.js/blob/canary/packages/next/src/build/templates/app-route.ts)
-   and [`packages/next/src/build/templates/pages-api.ts`](https://github.com/vercel/next.js/blob/canary/packages/next/src/build/templates/pages-api.ts)

## Edge runtime (`runtime: 'edge'`)[](#edge-runtime-runtime-edge)

Edge entrypoints use the following interface:

The shape is aligned around `handler(..., ctx)`, but Node.js and Edge runtimes use different request/response primitives.

For outputs with `runtime: 'edge'`, Next.js also provides `output.edgeRuntime` with the canonical metadata needed to invoke the entrypoint:

After your edge runtime loads and evaluates the chunks for `modulePath`, use `entryKey` to read the registered entry from the global edge entry registry (`globalThis._ENTRIES`), then invoke `handlerExport` from that entry:

Use `edgeRuntime` instead of deriving registry keys or handler names from filenames.

Relevant files in the Next.js core:

-   [`packages/next/src/build/templates/edge-ssr.ts`](https://github.com/vercel/next.js/blob/canary/packages/next/src/build/templates/edge-ssr.ts)
-   [`packages/next/src/build/templates/edge-app-route.ts`](https://github.com/vercel/next.js/blob/canary/packages/next/src/build/templates/edge-app-route.ts)
-   [`packages/next/src/build/templates/pages-edge-api.ts`](https://github.com/vercel/next.js/blob/canary/packages/next/src/build/templates/pages-edge-api.ts)
-   and [`packages/next/src/build/templates/middleware.ts`](https://github.com/vercel/next.js/blob/canary/packages/next/src/build/templates/middleware.ts)
