---
title: "next.config.js: serverExternalPackages"
source_url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/serverExternalPackages"
crawled_at: "2026-06-25T07:17:03.515Z"
---

This page is also available as Markdown at [/docs/app/api-reference/config/next-config-js/serverExternalPackages.md](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverExternalPackages.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

Last updated

December 5, 2025

Dependencies used inside [Server Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) and [Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route) will automatically be bundled by Next.js.

If a dependency is using Node.js specific features, you can choose to opt-out specific dependencies from the Server Components bundling and use native Node.js `require`.

Next.js includes a [short list of popular packages](https://github.com/vercel/next.js/blob/canary/packages/next/src/lib/server-external-packages.jsonc) that currently are working on compatibility and automatically opt-ed out:

-   `@alinea/generated`
-   `@appsignal/nodejs`
-   `@aws-sdk/client-s3`
-   `@aws-sdk/s3-presigned-post`
-   `@blockfrost/blockfrost-js`
-   `@highlight-run/node`
-   `@huggingface/transformers`
-   `@jpg-store/lucid-cardano`
-   `@libsql/client`
-   `@mikro-orm/core`
-   `@mikro-orm/knex`
-   `@node-rs/argon2`
-   `@node-rs/bcrypt`
-   `@prisma/client`
-   `@react-pdf/renderer`
-   `@sentry/profiling-node`
-   `@sparticuz/chromium`
-   `@sparticuz/chromium-min`
-   `@statsig/statsig-node-core`
-   `@swc/core`
-   `@xenova/transformers`
-   `@zenstackhq/runtime`
-   `argon2`
-   `autoprefixer`
-   `aws-crt`
-   `bcrypt`
-   `better-sqlite3`
-   `canvas`
-   `chromadb-default-embed`
-   `config`
-   `cpu-features`
-   `cypress`
-   `dd-trace`
-   `eslint`
-   `express`
-   `firebase-admin`
-   `htmlrewriter`
-   `import-in-the-middle`
-   `isolated-vm`
-   `jest`
-   `jsdom`
-   `keyv`
-   `libsql`
-   `mdx-bundler`
-   `mongodb`
-   `mongoose`
-   `newrelic`
-   `next-mdx-remote`
-   `next-seo`
-   `node-cron`
-   `node-pty`
-   `node-web-audio-api`
-   `onnxruntime-node`
-   `oslo`
-   `pg`
-   `pino`
-   `pino-pretty`
-   `pino-roll`
-   `playwright`
-   `playwright-core`
-   `postcss`
-   `prettier`
-   `prisma`
-   `puppeteer-core`
-   `puppeteer`
-   `ravendb`
-   `require-in-the-middle`
-   `rimraf`
-   `sharp`
-   `shiki`
-   `sqlite3`
-   `thread-stream`
-   `ts-morph`
-   `ts-node`
-   `typescript`
-   `vscode-oniguruma`
-   `webpack`
-   `websocket`
-   `zeromq`

| Version | Changes |
| --- | --- |
| `v15.0.0` | Moved from experimental to stable. Renamed from `serverComponentsExternalPackages` to `serverExternalPackages` |

[Previous

serverComponentsHmrCache

](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverComponentsHmrCache)[Next

staleTimes

](https://nextjs.org/docs/app/api-reference/config/next-config-js/staleTimes)
