---
title: "next.config.js: pageExtensions"
source_url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/pageExtensions"
crawled_at: "2026-06-25T07:15:44.842Z"
---

Last updated

October 17, 2025

By default, Next.js accepts files with the following extensions: `.tsx`, `.ts`, `.jsx`, `.js`. This can be modified to allow other extensions like markdown (`.md`, `.mdx`).

next.config.js

```
const withMDX = require('@next/mdx')()
 
/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
}
 
module.exports = withMDX(nextConfig)
```
