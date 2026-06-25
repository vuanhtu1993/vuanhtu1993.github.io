---
title: "next.config.js: assetPrefix"
source_url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/assetPrefix"
crawled_at: "2026-06-25T07:12:43.794Z"
---

This page is also available as Markdown at [/docs/app/api-reference/config/next-config-js/assetPrefix.md](https://nextjs.org/docs/app/api-reference/config/next-config-js/assetPrefix.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

Last updated

June 16, 2025

> **Attention**: [Deploying to Vercel](https://nextjs.org/docs/app/getting-started/deploying) automatically configures a global CDN for your Next.js project. You do not need to manually setup an Asset Prefix.

> **Good to know**: Next.js 9.5+ added support for a customizable [Base Path](https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath), which is better suited for hosting your application on a sub-path like `/docs`. We do not suggest you use a custom Asset Prefix for this use case.

## Set up a CDN[](#set-up-a-cdn)

To set up a [CDN](https://en.wikipedia.org/wiki/Content_delivery_network), you can set up an asset prefix and configure your CDN's origin to resolve to the domain that Next.js is hosted on.

Open `next.config.mjs` and add the `assetPrefix` config based on the [phase](https://nextjs.org/docs/app/api-reference/config/next-config-js#async-configuration):

Next.js will automatically use your asset prefix for the JavaScript and CSS files it loads from the `/_next/` path (`.next/static/` folder). For example, with the above configuration, the following request for a JS chunk:

Would instead become:

The exact configuration for uploading your files to a given CDN will depend on your CDN of choice. The only folder you need to host on your CDN is the contents of `.next/static/`, which should be uploaded as `_next/static/` as the above URL request indicates. **Do not upload the rest of your `.next/` folder**, as you should not expose your server code and other configuration to the public.

While `assetPrefix` covers requests to `_next/static`, it does not influence the following paths:

-   Files in the [public](https://nextjs.org/docs/app/api-reference/file-conventions/public-folder) folder; if you want to serve those assets over a CDN, you'll have to introduce the prefix yourself

[Previous

appDir

](https://nextjs.org/docs/app/api-reference/config/next-config-js/appDir)[Next

authInterrupts

](https://nextjs.org/docs/app/api-reference/config/next-config-js/authInterrupts)
