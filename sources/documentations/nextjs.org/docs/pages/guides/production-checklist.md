---
title: "Guides: Production"
source_url: "https://nextjs.org/docs/pages/guides/production-checklist"
crawled_at: "2026-06-25T07:24:22.918Z"
---

This page is also available as Markdown at [/docs/pages/guides/production-checklist.md](https://nextjs.org/docs/pages/guides/production-checklist.md). For an index of Next.js Pages Router documentation, see [/docs/pages/llms.txt](https://nextjs.org/docs/pages/llms.txt).

## How to optimize your Next.js application for production

Last updated

April 17, 2025

Before taking your Next.js application to production, there are some optimizations and patterns you should consider implementing for the best user experience, performance, and security.

This page provides best practices that you can use as a reference when [building your application](#during-development) and [before going to production](#before-going-to-production), as well as the [automatic Next.js optimizations](#automatic-optimizations) you should be aware of.

## Automatic optimizations[](#automatic-optimizations)

These Next.js optimizations are enabled by default and require no configuration:

-   **[Code-splitting](https://nextjs.org/docs/pages/building-your-application/routing/pages-and-layouts):** Next.js automatically code-splits your application code by pages. This means only the code needed for the current page is loaded on navigation. You may also consider [lazy loading](https://nextjs.org/docs/pages/guides/lazy-loading) third-party libraries, where appropriate.
-   **[Prefetching](https://nextjs.org/docs/pages/api-reference/components/link#prefetch):** When a link to a new route enters the user's viewport, Next.js prefetches the route in background. This makes navigation to new routes almost instant. You can opt out of prefetching, where appropriate.
-   **[Automatic Static Optimization](https://nextjs.org/docs/pages/building-your-application/rendering/automatic-static-optimization):** Next.js automatically determines that a page is static (can be prerendered) if it has no blocking data requirements. Optimized pages can be cached, and served to the end-user from multiple CDN locations. You may opt into [Server-side Rendering](https://nextjs.org/docs/pages/building-your-application/data-fetching/get-server-side-props), where appropriate.

These defaults aim to improve your application's performance, and reduce the cost and amount of data transferred on each network request.

## During development[](#during-development)

While building your application, we recommend using the following features to ensure the best performance and user experience:

### Routing and rendering[](#routing-and-rendering)

-   **[`<Link>` component](https://nextjs.org/docs/pages/building-your-application/routing/linking-and-navigating):** Use the `<Link>` component for client-side navigation and prefetching.
-   **[Custom Errors](https://nextjs.org/docs/pages/building-your-application/routing/custom-error):** Gracefully handle [500](https://nextjs.org/docs/pages/building-your-application/routing/custom-error#500-page) and [404 errors](https://nextjs.org/docs/pages/building-your-application/routing/custom-error#404-page)

### Data fetching and caching[](#data-fetching-and-caching)

-   **[API Routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes):** Use Route Handlers to access your backend resources, and prevent sensitive secrets from being exposed to the client.
-   **[Data Caching](https://nextjs.org/docs/pages/building-your-application/data-fetching/get-static-props):** Verify whether your data requests are being cached or not, and opt into caching, where appropriate. Ensure requests that don't use `getStaticProps` are cached where appropriate.
-   **[Incremental Static Regeneration](https://nextjs.org/docs/pages/guides/incremental-static-regeneration):** Use Incremental Static Regeneration to update static pages after they've been built, without rebuilding your entire site.
-   **[Static Images](https://nextjs.org/docs/pages/api-reference/file-conventions/public-folder):** Use the `public` directory to automatically cache your application's static assets, e.g. images.

### UI and accessibility[](#ui-and-accessibility)

-   **[Font Module](https://nextjs.org/docs/app/api-reference/components/font):** Optimize fonts by using the Font Module, which automatically hosts your font files with other static assets, removes external network requests, and reduces [layout shift](https://web.dev/articles/cls).
-   **[`<Image>` Component](https://nextjs.org/docs/app/api-reference/components/image):** Optimize images by using the Image Component, which automatically optimizes images, prevents layout shift, and serves them in modern formats like WebP.
-   **[`<Script>` Component](https://nextjs.org/docs/app/guides/scripts):** Optimize third-party scripts by using the Script Component, which automatically defers scripts and prevents them from blocking the main thread.
-   **[ESLint](https://nextjs.org/docs/architecture/accessibility#linting):** Use the built-in `eslint-plugin-jsx-a11y` plugin to catch accessibility issues early.

### Security[](#security)

-   **[Environment Variables](https://nextjs.org/docs/app/guides/environment-variables):** Ensure your `.env.*` files are added to `.gitignore` and only public variables are prefixed with `NEXT_PUBLIC_`.
-   **[Content Security Policy](https://nextjs.org/docs/app/guides/content-security-policy):** Consider adding a Content Security Policy to protect your application against various security threats such as cross-site scripting, clickjacking, and other code injection attacks.

### Metadata and SEO[](#metadata-and-seo)

-   **[`<Head>` Component](https://nextjs.org/docs/pages/api-reference/components/head):** Use the `next/head` component to add page titles, descriptions, and more.

### Type safety[](#type-safety)

-   **TypeScript and [TS Plugin](https://nextjs.org/docs/app/api-reference/config/typescript):** Use TypeScript and the TypeScript plugin for better type-safety, and to help you catch errors early.

## Before going to production[](#before-going-to-production)

Before going to production, you can run `next build` to build your application locally and catch any build errors, then run `next start` to measure the performance of your application in a production-like environment.

### Core Web Vitals[](#core-web-vitals)

-   **[Lighthouse](https://developers.google.com/web/tools/lighthouse):** Run lighthouse in incognito to gain a better understanding of how your users will experience your site, and to identify areas for improvement. This is a simulated test and should be paired with looking at field data (such as Core Web Vitals).

### Analyzing bundles[](#analyzing-bundles)

Use the [`@next/bundle-analyzer` plugin](https://nextjs.org/docs/app/guides/package-bundling#nextbundle-analyzer-for-webpack) to analyze the size of your JavaScript bundles and identify large modules and dependencies that might be impacting your application's performance.

Additionally, the following tools can help you understand the impact of adding new dependencies to your application:

-   [Import Cost](https://marketplace.visualstudio.com/items?itemName=wix.vscode-import-cost)
-   [Package Phobia](https://packagephobia.com/)
-   [Bundle Phobia](https://bundlephobia.com/)
-   [bundlejs](https://bundlejs.com/)
