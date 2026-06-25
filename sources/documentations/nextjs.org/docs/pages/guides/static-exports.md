---
title: "Guides: Static Exports"
source_url: "https://nextjs.org/docs/pages/guides/static-exports"
crawled_at: "2026-06-25T07:24:53.133Z"
---

## How to create a static export of your Next.js application

Last updated

May 12, 2025

Next.js enables starting as a static site or Single-Page Application (SPA), then later optionally upgrading to use features that require a server.

When running `next build`, Next.js generates an HTML file per route. By breaking a strict SPA into individual HTML files, Next.js can avoid loading unnecessary JavaScript code on the client-side, reducing the bundle size and enabling faster page loads.

Since Next.js supports this static export, it can be deployed and hosted on any web server that can serve HTML/CSS/JS static assets.

## Configuration[](#configuration)

To enable a static export, change the output mode inside `next.config.js`:

After running `next build`, Next.js will create an `out` folder with the HTML/CSS/JS assets for your application.

You can utilize [`getStaticProps`](https://nextjs.org/docs/pages/building-your-application/data-fetching/get-static-props) and [`getStaticPaths`](https://nextjs.org/docs/pages/building-your-application/data-fetching/get-static-paths) to generate an HTML file for each page in your `pages` directory (or more for [dynamic routes](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes)).

## Supported Features[](#supported-features-1)

The majority of core Next.js features needed to build a static site are supported, including:

-   [Dynamic Routes when using `getStaticPaths`](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes)
-   Prefetching with `next/link`
-   Preloading JavaScript
-   [Dynamic Imports](https://nextjs.org/docs/pages/guides/lazy-loading)
-   Any styling options (e.g. CSS Modules, styled-jsx)
-   [Client-side data fetching](https://nextjs.org/docs/pages/building-your-application/data-fetching/client-side)
-   [`getStaticProps`](https://nextjs.org/docs/pages/building-your-application/data-fetching/get-static-props)
-   [`getStaticPaths`](https://nextjs.org/docs/pages/building-your-application/data-fetching/get-static-paths)

### Image Optimization[](#image-optimization)

[Image Optimization](https://nextjs.org/docs/app/api-reference/components/image) through `next/image` can be used with a static export by defining a custom image loader in `next.config.js`. For example, you can optimize images with a service like Cloudinary:

This custom loader will define how to fetch images from a remote source. For example, the following loader will construct the URL for Cloudinary:

You can then use `next/image` in your application, defining relative paths to the image in Cloudinary:

## Unsupported Features[](#unsupported-features)

Features that require a Node.js server, or dynamic logic that cannot be computed during the build process, are **not** supported:

-   [Internationalized Routing](https://nextjs.org/docs/pages/guides/internationalization)
-   [API Routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes)
-   [Rewrites](https://nextjs.org/docs/pages/api-reference/config/next-config-js/rewrites)
-   [Redirects](https://nextjs.org/docs/pages/api-reference/config/next-config-js/redirects)
-   [Headers](https://nextjs.org/docs/pages/api-reference/config/next-config-js/headers)
-   [Proxy](https://nextjs.org/docs/pages/api-reference/file-conventions/proxy)
-   [Incremental Static Regeneration](https://nextjs.org/docs/pages/guides/incremental-static-regeneration)
-   [Image Optimization](https://nextjs.org/docs/pages/api-reference/components/image) with the default `loader`
-   [Draft Mode](https://nextjs.org/docs/pages/guides/draft-mode)
-   [`getStaticPaths` with `fallback: true`](https://nextjs.org/docs/pages/api-reference/functions/get-static-paths#fallback-true)
-   [`getStaticPaths` with `fallback: 'blocking'`](https://nextjs.org/docs/pages/api-reference/functions/get-static-paths#fallback-blocking)
-   [`getServerSideProps`](https://nextjs.org/docs/pages/building-your-application/data-fetching/get-server-side-props)

## Deploying[](#deploying)

With a static export, Next.js can be deployed and hosted on any web server that can serve HTML/CSS/JS static assets.

When running `next build`, Next.js generates the static export into the `out` folder. For example, let's say you have the following routes:

-   `/`
-   `/blog/[id]`

After running `next build`, Next.js will generate the following files:

-   `/out/index.html`
-   `/out/404.html`
-   `/out/blog/post-1.html`
-   `/out/blog/post-2.html`

If you are using a static host like Nginx, you can configure rewrites from incoming requests to the correct files:

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v14.0.0` | `next export` has been removed in favor of `"output": "export"` |
| `v13.4.0` | App Router (Stable) adds enhanced static export support, including using React Server Components and Route Handlers. |
| `v13.3.0` | `next export` is deprecated and replaced with `"output": "export"` |
