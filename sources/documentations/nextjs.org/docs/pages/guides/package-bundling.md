---
title: "Guides: Package Bundling"
source_url: "https://nextjs.org/docs/pages/guides/package-bundling"
crawled_at: "2026-06-25T07:24:04.388Z"
---

## How to optimize package bundling

Last updated

April 24, 2025

Bundling is the process of combining your application code and its dependencies into optimized output files for the client and server. Smaller bundles load faster, reduce JavaScript execution time, improve [Core Web Vitals](https://web.dev/articles/vitals), and lower server cold start times.

Next.js automatically optimizes bundles by code splitting, tree-shaking, and other techniques. However, there are some cases where you may need to optimize your bundles manually.

There are two tools for analyzing your application's bundles:

-   [Next.js Bundle Analyzer for Turbopack (experimental)](#nextjs-bundle-analyzer-experimental)
-   [`@next/bundle-analyzer` plugin for Webpack](#nextbundle-analyzer-for-webpack)

This guide will walk you through how to use each tool and how to [optimize large bundles](#optimizing-large-bundles).

## Next.js Bundle Analyzer (Experimental)[](#nextjs-bundle-analyzer-experimental)

> Available in v16.1 and later. You can share feedback in the [dedicated GitHub discussion](https://github.com/vercel/next.js/discussions/86731) and view the demo at [turbopack-bundle-analyzer-demo.vercel.sh](https://turbopack-bundle-analyzer-demo.vercel.sh/).

The Next.js Bundle Analyzer is integrated with Turbopack's module graph. You can inspect server and client modules with precise import tracing, making it easier to find large dependencies. Open the interactive Bundle Analyzer demo to explore the module graph.

### Step 1: Run the Turbopack Bundle Analyzer[](#step-1-run-the-turbopack-bundle-analyzer)

To get started, run the following command and open up the interactive view in your browser.

### Step 2: Filter and inspect modules[](#step-2-filter-and-inspect-modules)

Within the UI, you can filter by route, environment (client or server), and type (JavaScript, CSS, JSON), or search by file:

Next.js bundle analyzer UI walkthrough

### Step 3: Trace modules with import chains[](#step-3-trace-modules-with-import-chains)

The treemap shows each module as a rectangle. Where the size of the module is represented by the area of the rectangle.

Click a module to see its size, inspect its full import chain and see exactly where it’s used in your application:

![Next.js Bundle Analyzer import chain view](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782372249/aha-mind/docs-crawler/nextjs.org/image_ptjeqx.png)![Next.js Bundle Analyzer import chain view](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782372249/aha-mind/docs-crawler/nextjs.org/image_cdzorf.png)

Next.js Bundle Analyzer import chain view

### Step 4: Write output to disk for sharing or diffing[](#step-4-write-output-to-disk-for-sharing-or-diffing)

If you want to share the analysis with teammates or compare bundle sizes before/after optimizations, you can skip the interactive view and save the analysis as a static file with the `--output` flag:

This command writes the output to `.next/diagnostics/analyze`. You can copy this directory elsewhere to compare results:

> More options are available for the Bundle Analyzer, see Next.js CLI reference docs for the full list.

## `@next/bundle-analyzer` for Webpack[](#nextbundle-analyzer-for-webpack)

The [`@next/bundle-analyzer`](https://www.npmjs.com/package/@next/bundle-analyzer) is a plugin that helps you manage the size of your application bundles. It generates a visual report of the size of each package and their dependencies. You can use the information to remove large dependencies, split, or [lazy-load](https://nextjs.org/docs/app/guides/lazy-loading) your code.

### Step 1: Installation[](#step-1-installation)

Install the plugin by running the following command:

Then, add the bundle analyzer's settings to your `next.config.js`.

### Step 2: Generating a report[](#step-2-generating-a-report)

Run the following command to analyze your bundles:

The report will open three new tabs in your browser, which you can inspect.

## Optimizing large bundles[](#optimizing-large-bundles)

Once you've identified a large module, the solution will depend on your use case. Below are common causes and how to fix them:

### Packages with many exports[](#packages-with-many-exports)

If you're using a package that exports hundreds of modules (such as icon and utility libraries), you can optimize how those imports are resolved using the [`optimizePackageImports`](https://nextjs.org/docs/app/api-reference/config/next-config-js/optimizePackageImports) option in your `next.config.js` file. This option will only load the modules you _actually_ use, while still giving you the convenience of writing import statements with many named exports.

> **Good to know:** Next.js also optimizes some libraries automatically, thus they do not need to be included in the `optimizePackageImports` list. See the [full list](https://nextjs.org/docs/app/api-reference/config/next-config-js/optimizePackageImports) of supported packages.

### Heavy client workloads[](#heavy-client-workloads)

A common cause of large client bundles is doing expensive rendering work in Client Components. This often happens with libraries that exist only to transform data into UI, such as syntax highlighting, chart rendering, or markdown parsing.

If that work does not require browser APIs or user interaction, it can be run in a Server Component.

In this example, a prism based highlighter runs in a Client Component. Even though the final output is just a `<code>` block, the entire highlighting library is bundled into the client JavaScript bundle:

This increases bundle size because the client must download and execute the highlighting library, even though the result is static HTML.

Instead, move the highlighting logic to a Server Component and render the final HTML on the server. The client will only receive the rendered markup.

### External packages that aren't pre-bundled[](#external-packages-that-arent-pre-bundled)

By default, packages imported into your application are not bundled. This can impact performance if external packages are not pre-bundled, for example, if imported from a monorepo or `node_modules`.

To bundle specific packages, you can use the [`transpilePackages`](https://nextjs.org/docs/app/api-reference/config/next-config-js/transpilePackages) option in your `next.config.js`.

To automatically bundle all packages, you can use the [`bundlePagesRouterDependencies`](https://nextjs.org/docs/pages/api-reference/config/next-config-js/bundlePagesRouterDependencies) option in your `next.config.js`. This option defaults to `false`.

### Opting specific packages out of bundling[](#opting-specific-packages-out-of-bundling-1)

If you identify packages that shouldn't be in the bundle, you can opt specific packages out of automatic bundling using the [`serverExternalPackages`](https://nextjs.org/docs/pages/api-reference/config/next-config-js/serverExternalPackages) option in your `next.config.js`:
