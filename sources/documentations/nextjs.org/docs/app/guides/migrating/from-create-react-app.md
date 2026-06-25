---
title: "Migrating: Create React App"
source_url: "https://nextjs.org/docs/app/guides/migrating/from-create-react-app"
crawled_at: "2026-06-25T07:00:11.449Z"
---

## How to migrate from Create React App to Next.js

Last updated

February 11, 2026

This guide will help you migrate an existing Create React App (CRA) site to Next.js.

## Why Switch?[](#why-switch)

There are several reasons why you might want to switch from Create React App to Next.js:

### Slow initial page loading time[](#slow-initial-page-loading-time)

Create React App uses purely client-side rendering. Client-side only applications, also known as [single-page applications (SPAs)](https://nextjs.org/docs/app/guides/single-page-applications), often experience slow initial page loading time. This happens due to a couple of reasons:

1.  The browser needs to wait for the React code and your entire application bundle to download and run before your code is able to send requests to load data.
2.  Your application code grows with every new feature and dependency you add.

### No automatic code splitting[](#no-automatic-code-splitting)

The previous issue of slow loading times can be somewhat mitigated with code splitting. However, if you try to do code splitting manually, you can inadvertently introduce network waterfalls. Next.js provides automatic code splitting and tree-shaking built into its router and build pipeline.

### Network waterfalls[](#network-waterfalls)

A common cause of poor performance occurs when applications make sequential client-server requests to fetch data. One pattern for data fetching in a [SPA](https://nextjs.org/docs/app/guides/single-page-applications) is to render a placeholder, and then fetch data after the component has mounted. Unfortunately, a child component can only begin fetching data after its parent has finished loading its own data, resulting in a “waterfall” of requests.

While client-side data fetching is supported in Next.js, Next.js also lets you move data fetching to the server. This often eliminates client-server waterfalls altogether.

### Fast and intentional loading states[](#fast-and-intentional-loading-states)

With built-in support for [streaming through React Suspense](https://nextjs.org/docs/app/getting-started/linking-and-navigating#streaming), you can define which parts of your UI load first and in what order, without creating network waterfalls.

This enables you to build pages that are faster to load and eliminate [layout shifts](https://vercel.com/blog/how-core-web-vitals-affect-seo).

### Choose the data fetching strategy[](#choose-the-data-fetching-strategy)

Depending on your needs, Next.js allows you to choose your data fetching strategy on a page or component-level basis. For example, you could fetch data from your CMS and render blog posts at build time (SSG) for quick load speeds, or fetch data at request time (SSR) when necessary.

### Proxy[](#proxy)

[Next.js Proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) allows you to run code on the server before a request is completed. For instance, you can avoid a flash of unauthenticated content by redirecting a user to a login page in the proxy for authenticated-only pages. You can also use it for features like A/B testing, experimentation, and [internationalization](https://nextjs.org/docs/app/guides/internationalization).

### Built-in Optimizations[](#built-in-optimizations)

[Images](https://nextjs.org/docs/app/api-reference/components/image), [fonts](https://nextjs.org/docs/app/api-reference/components/font), and [third-party scripts](https://nextjs.org/docs/app/guides/scripts) often have a large impact on an application’s performance. Next.js includes specialized components and APIs that automatically optimize them for you.

## Migration Steps[](#migration-steps)

Our goal is to get a working Next.js application as quickly as possible so that you can then adopt Next.js features incrementally. To begin with, we’ll treat your application as a purely client-side application ([SPA](https://nextjs.org/docs/app/guides/single-page-applications)) without immediately replacing your existing router. This reduces complexity and merge conflicts.

> **Note**: If you are using advanced CRA configurations such as a custom `homepage` field in your `package.json`, a custom service worker, or specific Babel/webpack tweaks, please see the **Additional Considerations** section at the end of this guide for tips on replicating or adapting these features in Next.js.

### Step 1: Install the Next.js Dependency[](#step-1-install-the-nextjs-dependency)

Install Next.js in your existing project:

### Step 2: Create the Next.js Configuration File[](#step-2-create-the-nextjs-configuration-file)

Create a `next.config.ts` at the root of your project (same level as your `package.json`). This file holds your [Next.js configuration options](https://nextjs.org/docs/app/api-reference/config/next-config-js).

> **Note**: Using `output: 'export'` means you’re doing a static export. You will **not** have access to server-side features like SSR or APIs. You can remove this line to leverage Next.js server features.

### Step 3: Create the Root Layout[](#step-3-create-the-root-layout)

A Next.js [App Router](https://nextjs.org/docs/app) application must include a [root layout](https://nextjs.org/docs/app/api-reference/file-conventions/layout#root-layout) file, which is a [React Server Component](https://nextjs.org/docs/app/getting-started/server-and-client-components) that will wrap all your pages.

The closest equivalent of the root layout file in a CRA application is `public/index.html`, which includes your `<html>`, `<head>`, and `<body>` tags.

1.  Create a new `app` directory inside your `src` folder (or at your project root if you prefer `app` at the root).
2.  Inside the `app` directory, create a `layout.tsx` (or `layout.js`) file:

Now copy the content of your old `index.html` into this `<RootLayout>` component. Replace `body div#root` (and `body noscript`) with `<div id="root">{children}</div>`.

> **Good to know**: Next.js ignores CRA’s `public/manifest.json`, additional iconography, and [testing configuration](https://nextjs.org/docs/app/guides/testing) by default. If you need these, Next.js has support with its [Metadata API](https://nextjs.org/docs/app/getting-started/metadata-and-og-images) and [Testing](https://nextjs.org/docs/app/guides/testing) setup.

### Step 4: Metadata[](#step-4-metadata)

Next.js automatically includes the `<meta charset="UTF-8" />` and `<meta name="viewport" content="width=device-width, initial-scale=1" />` tags, so you can remove them from `<head>`:

Any [metadata files](https://nextjs.org/docs/app/getting-started/metadata-and-og-images#file-based-metadata) such as `favicon.ico`, `icon.png`, `robots.txt` are automatically added to the application `<head>` tag as long as you have them placed into the top level of the `app` directory. After moving [all supported files](https://nextjs.org/docs/app/getting-started/metadata-and-og-images#file-based-metadata) into the `app` directory you can safely delete their `<link>` tags:

Finally, Next.js can manage your last `<head>` tags with the [Metadata API](https://nextjs.org/docs/app/getting-started/metadata-and-og-images). Move your final metadata info into an exported [`metadata` object](https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadata-object):

With the above changes, you shifted from declaring everything in your `index.html` to using Next.js' convention-based approach built into the framework ([Metadata API](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)). This approach enables you to more easily improve your SEO and web shareability of your pages.

### Step 5: Styles[](#step-5-styles)

Like CRA, Next.js supports [CSS Modules](https://nextjs.org/docs/app/getting-started/css#css-modules) out of the box. It also supports [global CSS imports](https://nextjs.org/docs/app/getting-started/css#global-css).

If you have a global CSS file, import it into your `app/layout.tsx`:

If you're using Tailwind CSS, see our [installation docs](https://nextjs.org/docs/app/getting-started/css#tailwind-css).

### Step 6: Create the Entrypoint Page[](#step-6-create-the-entrypoint-page)

Create React App uses `src/index.tsx` (or `index.js`) as the entry point. In Next.js (App Router), each folder inside the `app` directory corresponds to a route, and each folder should have a `page.tsx`.

Since we want to keep the app as an SPA for now and intercept **all** routes, we’ll use an [optional catch-all route](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes#optional-catch-all-segments).

1.  **Create a `[[...slug]]` directory inside `app`.**

2.  **Add the following to `page.tsx`**:

This tells Next.js to generate a single route for the empty slug (`/`), effectively mapping **all** routes to the same page. This page is a [Server Component](https://nextjs.org/docs/app/getting-started/server-and-client-components), prerendered into static HTML.

### Step 7: Add a Client-Only Entrypoint[](#step-7-add-a-client-only-entrypoint)

Next, we’ll embed your CRA’s root App component inside a [Client Component](https://nextjs.org/docs/app/getting-started/server-and-client-components) so that all logic remains client-side. If this is your first time using Next.js, it's worth knowing that clients components (by default) are still prerendered on the server. You can think about them as having the additional capability of running client-side JavaScript.

Create a `client.tsx` (or `client.js`) in `app/[[...slug]]/`:

-   The `'use client'` directive makes this file a **Client Component**.
-   The `dynamic` import with `ssr: false` disables server-side rendering for the `<App />` component, making it truly client-only (SPA).

Now update your `page.tsx` (or `page.js`) to use your new component:

### Step 8: Update Static Image Imports[](#step-8-update-static-image-imports)

In CRA, importing an image file returns its public URL as a string:

With Next.js, static image imports return an object. The object can then be used directly with the Next.js [`<Image>` component](https://nextjs.org/docs/app/api-reference/components/image), or you can use the object's `src` property with your existing `<img>` tag.

The `<Image>` component has the added benefits of [automatic image optimization](https://nextjs.org/docs/app/api-reference/components/image). The `<Image>` component automatically sets the `width` and `height` attributes of the resulting `<img>` based on the image's dimensions. This prevents layout shifts when the image loads. However, this can cause issues if your app contains images with only one of their dimensions being styled without the other styled to `auto`. When not styled to `auto`, the dimension will default to the `<img>` dimension attribute's value, which can cause the image to appear distorted.

Keeping the `<img>` tag will reduce the amount of changes in your application and prevent the above issues. You can then optionally later migrate to the `<Image>` component to take advantage of optimizing images by [configuring a loader](https://nextjs.org/docs/app/api-reference/components/image#loader), or moving to the default Next.js server which has automatic image optimization.

**Convert absolute import paths for images imported from `/public` into relative imports:**

**Pass the image `src` property instead of the whole image object to your `<img>` tag:**

Alternatively, you can reference the public URL for the image asset based on the filename. For example, `public/logo.png` will serve the image at `/logo.png` for your application, which would be the `src` value.

> **Warning:** If you're using TypeScript, you might encounter type errors when accessing the `src` property. To fix them, you need to add `next-env.d.ts` to the [`include` array](https://www.typescriptlang.org/tsconfig#include) of your `tsconfig.json` file. Next.js will automatically generate this file when you run your application on step 9.

### Step 9: Migrate Environment Variables[](#step-9-migrate-environment-variables)

Next.js supports [environment variables](https://nextjs.org/docs/app/guides/environment-variables) similarly to CRA but **requires** a `NEXT_PUBLIC_` prefix for any variable you want to expose in the browser.

The main difference is the prefix used to expose environment variables on the client-side. Change all environment variables with the `REACT_APP_` prefix to `NEXT_PUBLIC_`.

### Step 10: Update Scripts in `package.json`[](#step-10-update-scripts-in-packagejson)

Update your `package.json` scripts to use Next.js commands. Also, add `.next` and `next-env.d.ts` to your `.gitignore`:

Now you can run:

Open [http://localhost:3000](http://localhost:3000/). You should see your application now running on Next.js (in SPA mode).

### Step 11: Clean Up[](#step-11-clean-up)

You can now remove artifacts that are specific to Create React App:

-   `public/index.html`
-   `src/index.tsx`
-   `src/react-app-env.d.ts`
-   The `reportWebVitals` setup
-   The `react-scripts` dependency (uninstall it from `package.json`)

## Additional Considerations[](#additional-considerations)

### Using a Custom `homepage` in CRA[](#using-a-custom-homepage-in-cra)

If you used the `homepage` field in your CRA `package.json` to serve the app under a specific subpath, you can replicate that in Next.js using the [`basePath` configuration](https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath) in `next.config.ts`:

### Handling a Custom `Service Worker`[](#handling-a-custom-service-worker)

If you used CRA’s service worker (e.g., `serviceWorker.js` from `create-react-app`), you can learn how to create [Progressive Web Applications (PWAs)](https://nextjs.org/docs/app/guides/progressive-web-apps) with Next.js.

### Proxying API Requests[](#proxying-api-requests)

If your CRA app used the `proxy` field in `package.json` to forward requests to a backend server, you can replicate this with [Next.js rewrites](https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites) in `next.config.ts`:

### Custom Webpack[](#custom-webpack)

If you had a custom webpack or Babel configuration in CRA, you can extend Next.js’s config in `next.config.ts`:

> **Note**: This will require using Webpack by adding `--webpack` to your `dev` script.

### TypeScript Setup[](#typescript-setup)

Next.js automatically sets up TypeScript if you have a `tsconfig.json`. Make sure `next-env.d.ts` is listed in your `tsconfig.json` `include` array:

## Bundler Compatibility[](#bundler-compatibility)

Create React App uses webpack for bundling. Next.js now defaults to [Turbopack](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack) for faster local development:

To use Webpack instead (similar to CRA):

You can still provide a [custom webpack configuration](https://nextjs.org/docs/app/api-reference/config/next-config-js/webpack) if you need to migrate advanced webpack settings from CRA.

## Next Steps[](#next-steps)

If everything worked, you now have a functioning Next.js application running as a single-page application. You aren’t yet leveraging Next.js features like server-side rendering or file-based routing, but you can now do so incrementally:

-   **Migrate from React Router** to the [Next.js App Router](https://nextjs.org/docs/app) for:
    -   Automatic code splitting
    -   [Streaming server rendering](https://nextjs.org/docs/app/api-reference/file-conventions/loading)
    -   [React Server Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
-   **Optimize images** with the [`<Image>` component](https://nextjs.org/docs/app/api-reference/components/image)
-   **Optimize fonts** with [`next/font`](https://nextjs.org/docs/app/api-reference/components/font)
-   **Optimize third-party scripts** with the [`<Script>` component](https://nextjs.org/docs/app/guides/scripts)
-   **Enable ESLint** with Next.js [recommended rules](https://nextjs.org/docs/app/api-reference/config/eslint#setup-eslint)

> **Note**: Using a static export (`output: 'export'`) [does not currently support](https://github.com/vercel/next.js/issues/54393) the `useParams` hook or other server features. To use all Next.js features, remove `output: 'export'` from your `next.config.ts`.
