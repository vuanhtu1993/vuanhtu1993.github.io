---
title: "next.config.js: serverActions"
source_url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions"
crawled_at: "2026-06-25T07:16:49.353Z"
---

Last updated

June 23, 2026

Options for configuring Server Actions behavior in your Next.js application.

## `allowedOrigins`[](#allowedorigins)

A list of extra safe origin domains from which Server Actions can be invoked. Next.js compares the origin of a Server Action request with the host domain, ensuring they match to prevent CSRF attacks. If not provided, only the same origin is allowed.

## `bodySizeLimit`[](#bodysizelimit)

By default, the maximum size of the request body sent to a Server Action is 1MB, to prevent the consumption of excessive server resources in parsing large amounts of data, as well as potential DDoS attacks.

However, you can configure this limit using the `serverActions.bodySizeLimit` option. It can take the number of bytes or any string format supported by bytes, for example `1000`, `'500kb'` or `'3mb'`.

The limit applies to the raw HTTP request body, including the bytes that `multipart/form-data` adds for boundaries, part headers, and field metadata. If you expect uploads close to the configured value, leave some room for this overhead. For typical multipart uploads, an additional 10–20 KB is a reasonable rule of thumb.

## Enabling Server Actions (v13)[](#enabling-server-actions-v13)

Server Actions became a stable feature in Next.js 14, and are enabled by default. However, if you are using an earlier version of Next.js, you can enable them by setting `experimental.serverActions` to `true`.
