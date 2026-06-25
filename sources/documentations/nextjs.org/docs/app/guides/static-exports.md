---
title: "Guides: Static Exports"
source_url: "https://nextjs.org/docs/app/guides/static-exports"
crawled_at: "2026-06-25T07:02:13.915Z"
---

## How to create a static export of your Next.js application

Last updated

March 3, 2026

Next.js enables starting as a static site or Single-Page Application (SPA), then later optionally upgrading to use features that require a server.

When running `next build`, Next.js generates an HTML file per route. By breaking a strict SPA into individual HTML files, Next.js can avoid loading unnecessary JavaScript code on the client-side, reducing the bundle size and enabling faster page loads.

Since Next.js supports this static export, it can be deployed and hosted on any web server that can serve HTML/CSS/JS static assets.

## Configuration[](#configuration)

To enable a static export, change the output mode inside `next.config.js`:

After running `next build`, Next.js will create an `out` folder with the HTML/CSS/JS assets for your application.

## Supported Features[](#supported-features)

The core of Next.js has been designed to support static exports.

### Server Components[](#server-components)

When you run `next build` to generate a static export, Server Components consumed inside the `app` directory will run during the build, similar to traditional static-site generation.

The resulting component will be rendered into static HTML for the initial page load and a static payload for client navigation between routes. No changes are required for your Server Components when using the static export, unless they consume [dynamic server functions](#unsupported-features).

### Client Components[](#client-components)

If you want to perform data fetching on the client, you can use a Client Component with [SWR](https://github.com/vercel/swr) to memoize requests.

Since route transitions happen client-side, this behaves like a traditional SPA. For example, the following index route allows you to navigate to different posts on the client:

### Image Optimization[](#image-optimization)

[Image Optimization](https://nextjs.org/docs/app/api-reference/components/image) through `next/image` can be used with a static export by defining a custom image loader in `next.config.js`. For example, you can optimize images with a service like Cloudinary:

This custom loader will define how to fetch images from a remote source. For example, the following loader will construct the URL for Cloudinary:

You can then use `next/image` in your application, defining relative paths to the image in Cloudinary:

### Route Handlers[](#route-handlers)

Route Handlers will render a static response when running `next build`. Only the `GET` HTTP verb is supported. This can be used to generate static HTML, JSON, TXT, or other files from cached or uncached data. For example:

The above file `app/data.json/route.ts` will render to a static file during `next build`, producing `data.json` containing `{ name: 'Lee' }`.

If you need to read dynamic values from the incoming request, you cannot use a static export.

### Browser APIs[](#browser-apis)

Client Components are prerendered to HTML during `next build`. Because [Web APIs](https://developer.mozilla.org/docs/Web/API) like `window`, `localStorage`, and `navigator` are not available on the server, you need to safely access these APIs only when running in the browser. For example:

## Unsupported Features[](#unsupported-features)

Features that require a Node.js server, or dynamic logic that cannot be computed during the build process, are **not** supported:

-   [Dynamic Routes](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes) with `dynamicParams: true`
-   [Dynamic Routes](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes) without `generateStaticParams()`
-   [Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route) that rely on Request
-   [Cookies](https://nextjs.org/docs/app/api-reference/functions/cookies)
-   [Rewrites](https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites)
-   [Redirects](https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects)
-   [Headers](https://nextjs.org/docs/app/api-reference/config/next-config-js/headers)
-   [Proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)
-   [Incremental Static Regeneration](https://nextjs.org/docs/app/guides/incremental-static-regeneration)
-   [Image Optimization](https://nextjs.org/docs/app/api-reference/components/image) with the default `loader`
-   [Draft Mode](https://nextjs.org/docs/app/guides/draft-mode)
-   [Server Actions](https://nextjs.org/docs/app/getting-started/mutating-data)
-   [Intercepting Routes](https://nextjs.org/docs/app/api-reference/file-conventions/intercepting-routes)

Attempting to use any of these features with `next dev` will result in an error, similar to setting the [`dynamic`](https://nextjs.org/docs/app/guides/caching-without-cache-components#dynamic) option to `error` in the root layout.

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
