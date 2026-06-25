---
title: "next.config.js: urlImports"
source_url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/urlImports"
crawled_at: "2026-06-25T07:18:16.521Z"
---

This feature is currently experimental and subject to change, it's not recommended for production. Try it out and share your feedback on [GitHub](https://github.com/vercel/next.js/issues).

Last updated

June 16, 2025

URL imports are an experimental feature that allows you to import modules directly from external servers (instead of from the local disk).

> **Warning**: Only use domains that you trust to download and execute on your machine. Please exercise discretion, and caution until the feature is flagged as stable.

To opt-in, add the allowed URL prefixes inside `next.config.js`:

Then, you can import modules directly from URLs:

URL Imports can be used everywhere normal package imports can be used.

## Security Model[](#security-model)

This feature is being designed with **security as the top priority**. To start, we added an experimental flag forcing you to explicitly allow the domains you accept URL imports from. We're working to take this further by limiting URL imports to execute in the browser sandbox using the [Edge Runtime](https://nextjs.org/docs/app/api-reference/edge).

## Lockfile[](#lockfile)

When using URL imports, Next.js will create a `next.lock` directory containing a lockfile and fetched assets. This directory **must be committed to Git**, not ignored by `.gitignore`.

-   When running `next dev`, Next.js will download and add all newly discovered URL Imports to your lockfile.
-   When running `next build`, Next.js will use only the lockfile to build the application for production.

Typically, no network requests are needed and any outdated lockfile will cause the build to fail. One exception is resources that respond with `Cache-Control: no-cache`. These resources will have a `no-cache` entry in the lockfile and will always be fetched from the network on each build.

## Examples[](#examples)

### Skypack[](#skypack)

### Static Image Imports[](#static-image-imports)

### URLs in CSS[](#urls-in-css)

### Asset Imports[](#asset-imports)
