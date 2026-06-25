---
title: "next.config.js: compress"
source_url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/compress"
crawled_at: "2026-06-25T07:13:22.555Z"
---

This page is also available as Markdown at [/docs/app/api-reference/config/next-config-js/compress.md](https://nextjs.org/docs/app/api-reference/config/next-config-js/compress.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

Last updated

June 16, 2025

By default, Next.js uses `gzip` to compress rendered content and static files when using `next start` or a custom server. This is an optimization for applications that do not have compression configured. If compression is _already_ configured in your application via a custom server, Next.js will not add compression.

You can check if compression is enabled and which algorithm is used by looking at the [`Accept-Encoding`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Encoding) (browser accepted options) and [`Content-Encoding`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Encoding) (currently used) headers in the response.

## Disabling compression[](#disabling-compression)

To disable **compression**, set the `compress` config option to `false`:

We **do not recommend disabling compression** unless you have compression configured on your server, as compression reduces bandwidth usage and improves the performance of your application. For example, you're using [nginx](https://nginx.org/) and want to switch to `brotli`, set the `compress` option to `false` to allow nginx to handle compression.

[Previous

cacheLife

](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheLife)[Next

crossOrigin

](https://nextjs.org/docs/app/api-reference/config/next-config-js/crossOrigin)
