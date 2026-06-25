---
title: "next.config.js: webpack"
source_url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/webpack"
crawled_at: "2026-06-25T07:18:34.498Z"
---

This page is also available as Markdown at [/docs/app/api-reference/config/next-config-js/webpack.md](https://nextjs.org/docs/app/api-reference/config/next-config-js/webpack.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

## Custom Webpack Config

Last updated

October 17, 2025

> **Good to know**: changes to webpack config are not covered by semver so proceed at your own risk

Before continuing to add custom webpack configuration to your application make sure Next.js doesn't already support your use-case:

-   [CSS imports](https://nextjs.org/docs/app/getting-started/css)
-   [CSS modules](https://nextjs.org/docs/app/getting-started/css#css-modules)
-   [Sass/SCSS imports](https://nextjs.org/docs/app/guides/sass)
-   [Sass/SCSS modules](https://nextjs.org/docs/app/guides/sass)

Some commonly asked for features are available as plugins:

-   [@next/mdx](https://github.com/vercel/next.js/tree/canary/packages/next-mdx)
-   [@next/bundle-analyzer](https://github.com/vercel/next.js/tree/canary/packages/next-bundle-analyzer)

In order to extend our usage of `webpack`, you can define a function that extends its config inside `next.config.js`, like so:

> The `webpack` function is executed three times, twice for the server (nodejs / edge runtime) and once for the client. This allows you to distinguish between client and server configuration using the `isServer` property.

The second argument to the `webpack` function is an object with the following properties:

-   `buildId`: `String` - The build id, used as a unique identifier between builds.
-   `dev`: `Boolean` - Indicates if the compilation will be done in development.
-   `isServer`: `Boolean` - It's `true` for server-side compilation, and `false` for client-side compilation.
-   `nextRuntime`: `String | undefined` - The target runtime for server-side compilation; either `"edge"` or `"nodejs"`, it's `undefined` for client-side compilation.
-   `defaultLoaders`: `Object` - Default loaders used internally by Next.js:
    -   `babel`: `Object` - Default `babel-loader` configuration.

Example usage of `defaultLoaders.babel`:

#### `nextRuntime`[](#nextruntime)

Notice that `isServer` is `true` when `nextRuntime` is `"edge"` or `"nodejs"`, `nextRuntime` `"edge"` is currently for proxy and Server Components in edge runtime only.

[Previous

viewTransition

](https://nextjs.org/docs/app/api-reference/config/next-config-js/viewTransition)[Next

webVitalsAttribution

](https://nextjs.org/docs/app/api-reference/config/next-config-js/webVitalsAttribution)
