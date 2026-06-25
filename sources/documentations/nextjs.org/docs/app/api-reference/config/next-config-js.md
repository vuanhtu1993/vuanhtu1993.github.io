---
title: "Configuration: next.config.js"
source_url: "https://nextjs.org/docs/app/api-reference/config/next-config-js"
crawled_at: "2026-06-25T07:12:15.986Z"
---

Last updated

November 4, 2025

Next.js can be configured through a `next.config.js` file in the root of your project directory (for example, by `package.json`) with a default export.

## ECMAScript Modules[](#ecmascript-modules)

`next.config.js` is a regular Node.js module, not a JSON file. It gets used by the Next.js server and build phases, and it's not included in the browser build.

If you need [ECMAScript modules](https://nodejs.org/api/esm.html), you can use `next.config.mjs`:

> **Good to know**: `next.config` with the `.cjs` or `.cts` extensions are currently **not** supported.

## Configuration as a Function[](#configuration-as-a-function)

You can also use a function:

### Async Configuration[](#async-configuration)

Since Next.js 12.1.0, you can use an async function:

### Phase[](#phase)

`phase` is the current context in which the configuration is loaded. You can see the [available phases](https://github.com/vercel/next.js/blob/5e6b008b561caf2710ab7be63320a3d549474a5b/packages/next/shared/lib/constants.ts#L19-L23). Phases can be imported from `next/constants`:

## TypeScript[](#typescript)

If you are using TypeScript in your project, you can use `next.config.ts` to use TypeScript in your configuration:

The commented lines are the place where you can put the configs allowed by `next.config.js`, which are [defined in this file](https://github.com/vercel/next.js/blob/canary/packages/next/src/server/config-shared.ts).

However, none of the configs are required, and it's not necessary to understand what each config does. Instead, search for the features you need to enable or modify in this section and they will show you what to do.

> Avoid using new JavaScript features not available in your target Node.js version. `next.config.js` will not be parsed by Webpack or Babel.

This page documents all the available configuration options:

## Unit Testing (experimental)[](#unit-testing-experimental)

Starting in Next.js 15.1, the `next/experimental/testing/server` package contains utilities to help unit test `next.config.js` files.

The `unstable_getResponseFromNextConfig` function runs the [`headers`](https://nextjs.org/docs/app/api-reference/config/next-config-js/headers), [`redirects`](https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects), and [`rewrites`](https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites) functions from `next.config.js` with the provided request information and returns `NextResponse` with the results of the routing.

> The response from `unstable_getResponseFromNextConfig` only considers `next.config.js` fields and does not consider proxy or filesystem routes, so the result in production may be different than the unit test.
