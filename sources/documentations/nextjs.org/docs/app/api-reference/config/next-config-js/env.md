---
title: "next.config.js: env"
source_url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/env"
crawled_at: "2026-06-25T07:14:01.094Z"
---

This page is also available as Markdown at [/docs/app/api-reference/config/next-config-js/env.md](https://nextjs.org/docs/app/api-reference/config/next-config-js/env.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

This is a legacy API and no longer recommended. It's still supported for backward compatibility.

Last updated

June 16, 2025

> Since the release of [Next.js 9.4](https://nextjs.org/blog/next-9-4) we now have a more intuitive and ergonomic experience for [adding environment variables](https://nextjs.org/docs/app/guides/environment-variables). Give it a try!

> **Good to know**: environment variables specified in this way will **always** be included in the JavaScript bundle, prefixing the environment variable name with `NEXT_PUBLIC_` only has an effect when specifying them [through the environment or .env files](https://nextjs.org/docs/app/guides/environment-variables).

To add environment variables to the JavaScript bundle, open `next.config.js` and add the `env` config:

Now you can access `process.env.customKey` in your code. For example:

Next.js will replace `process.env.customKey` with `'my-value'` at build time. Trying to destructure `process.env` variables won't work due to the nature of webpack [DefinePlugin](https://webpack.js.org/plugins/define-plugin/).

For example, the following line:

Will end up being:

[Previous

distDir

](https://nextjs.org/docs/app/api-reference/config/next-config-js/distDir)[Next

expireTime

](https://nextjs.org/docs/app/api-reference/config/next-config-js/expireTime)
