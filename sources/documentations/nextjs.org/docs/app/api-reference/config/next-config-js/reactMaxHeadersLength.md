---
title: "next.config.js: reactMaxHeadersLength"
source_url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/reactMaxHeadersLength"
crawled_at: "2026-06-25T07:16:14.317Z"
---

This page is also available as Markdown at [/docs/app/api-reference/config/next-config-js/reactMaxHeadersLength.md](https://nextjs.org/docs/app/api-reference/config/next-config-js/reactMaxHeadersLength.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

Last updated

March 3, 2026

During prerendering, React can emit headers that can be added to the response. These can be used to improve performance by allowing the browser to preload resources like fonts, scripts, and stylesheets. The default value is `6000`, but you can override this value by configuring the `reactMaxHeadersLength` option in `next.config.js`:

> **Good to know**: This option is only available in App Router.

Depending on the type of proxy between the browser and the server, the headers can be truncated. For example, if you are using a reverse proxy that doesn't support long headers, you should set a lower value to ensure that the headers are not truncated.

[Previous

reactCompiler

](https://nextjs.org/docs/app/api-reference/config/next-config-js/reactCompiler)[Next

reactStrictMode

](https://nextjs.org/docs/app/api-reference/config/next-config-js/reactStrictMode)
