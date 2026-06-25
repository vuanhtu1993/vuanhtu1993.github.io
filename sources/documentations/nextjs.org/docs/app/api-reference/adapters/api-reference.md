---
title: "Adapters: API Reference"
source_url: "https://nextjs.org/docs/app/api-reference/adapters/api-reference"
crawled_at: "2026-06-25T07:19:40.579Z"
---

This page is also available as Markdown at [/docs/app/api-reference/adapters/api-reference.md](https://nextjs.org/docs/app/api-reference/adapters/api-reference.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

Last updated

March 31, 2026

## `async modifyConfig(config, context)`[](#async-modifyconfigconfig-context)

Called for any CLI command that loads the `next.config.js` file to allow modification of the configuration.

**Parameters:**

-   `config`: The complete Next.js configuration object
-   `context.phase`: The current build phase (see [phases](https://nextjs.org/docs/app/api-reference/config/next-config-js#phase))
-   `context.nextVersion`: Version of Next.js being used

**Returns:** The modified configuration object (can be async)

## `async onBuildComplete(context)`[](#async-onbuildcompletecontext)

Called after the build process completes with detailed information about routes and outputs.

**Parameters:**

-   `context.routing`: Object containing Next.js routing phases and metadata
    -   `routing.beforeMiddleware`: Routes executed before middleware (includes header and redirect handling)
    -   `routing.beforeFiles`: Rewrite routes checked before filesystem route matching
    -   `routing.afterFiles`: Rewrite routes checked after filesystem route matching
    -   `routing.dynamicRoutes`: Dynamic route matching table
    -   `routing.onMatch`: Routes applied after a successful match (for example immutable static asset cache headers)
    -   `routing.fallback`: Final rewrite fallback routes
    -   `routing.shouldNormalizeNextData`: Whether `/_next/data/<buildId>/...` URLs should be normalized during matching
    -   `routing.rsc`: Route metadata used for React Server Components routing behavior
-   `context.outputs`: Detailed information about all build outputs organized by type
-   `context.projectDir`: Absolute path to the Next.js project directory
-   `context.repoRoot`: Absolute path to the detected repository root
-   `context.distDir`: Absolute path to the build output directory
-   `context.config`: The final Next.js configuration (with `modifyConfig` applied)
-   `context.nextVersion`: Version of Next.js being used
-   `context.buildId`: Unique identifier for the current build

[Previous

Creating an Adapter

](https://nextjs.org/docs/app/api-reference/adapters/creating-an-adapter)[Next

Testing Adapters

](https://nextjs.org/docs/app/api-reference/adapters/testing-adapters)
