---
title: "next.config.js: reactStrictMode"
source_url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/reactStrictMode"
crawled_at: "2026-06-25T07:16:21.258Z"
---

This page is also available as Markdown at [/docs/app/api-reference/config/next-config-js/reactStrictMode.md](https://nextjs.org/docs/app/api-reference/config/next-config-js/reactStrictMode.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

Last updated

June 16, 2025

> **Good to know**: Since Next.js 13.5.1, Strict Mode is `true` by default with `app` router, so the above configuration is only necessary for `pages`. You can still disable Strict Mode by setting `reactStrictMode: false`.

> **Suggested**: We strongly suggest you enable Strict Mode in your Next.js application to better prepare your application for the future of React.

React's [Strict Mode](https://react.dev/reference/react/StrictMode) is a development mode only feature for highlighting potential problems in an application. It helps to identify unsafe lifecycles, legacy API usage, and a number of other features.

The Next.js runtime is Strict Mode-compliant. To opt-in to Strict Mode, configure the following option in your `next.config.js`:

If you or your team are not ready to use Strict Mode in your entire application, that's OK! You can incrementally migrate on a page-by-page basis using `<React.StrictMode>`.

[Previous

reactMaxHeadersLength

](https://nextjs.org/docs/app/api-reference/config/next-config-js/reactMaxHeadersLength)[Next

redirects

](https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects)
