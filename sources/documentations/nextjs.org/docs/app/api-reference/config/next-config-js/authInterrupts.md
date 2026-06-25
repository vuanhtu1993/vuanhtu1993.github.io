---
title: "next.config.js: authInterrupts"
source_url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/authInterrupts"
crawled_at: "2026-06-25T07:12:50.660Z"
---

This feature is currently available in the canary channel and subject to change. Try it out by [upgrading Next.js](https://nextjs.org/docs/app/getting-started/upgrading#canary-version), and share your feedback on [GitHub](https://github.com/vercel/next.js/issues).

Last updated

June 16, 2025

The `authInterrupts` configuration option allows you to use [`forbidden`](https://nextjs.org/docs/app/api-reference/functions/forbidden) and [`unauthorized`](https://nextjs.org/docs/app/api-reference/functions/unauthorized) APIs in your application. While these functions are experimental, you must enable the `authInterrupts` option in your `next.config.js` file to use them:

next.config.ts

```
import type { NextConfig } from 'next'
 
const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true,
  },
}
 
export default nextConfig
```
