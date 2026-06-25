---
title: "next.config.js: htmlLimitedBots"
source_url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/htmlLimitedBots"
crawled_at: "2026-06-25T07:14:38.625Z"
---

This page is also available as Markdown at [/docs/app/api-reference/config/next-config-js/htmlLimitedBots.md](https://nextjs.org/docs/app/api-reference/config/next-config-js/htmlLimitedBots.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

Last updated

October 3, 2025

The `htmlLimitedBots` config allows you to specify a list of user agents that should receive blocking metadata instead of [streaming metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata#streaming-metadata).

## Default list[](#default-list)

Next.js includes a default list of HTML limited bots, including:

-   Google crawlers (e.g. Mediapartners-Google, AdsBot-Google, Google-PageRenderer)
-   Bingbot
-   Twitterbot
-   Slackbot

See the full list [here](https://github.com/vercel/next.js/blob/canary/packages/next/src/shared/lib/router/utils/html-bots.ts).

Specifying a `htmlLimitedBots` config will override the Next.js' default list. However, this is advanced behavior, and the default should be sufficient for most cases.

## Disabling[](#disabling)

To fully disable streaming metadata:

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| 15.2.0 | `htmlLimitedBots` option introduced. |

[Previous

headers

](https://nextjs.org/docs/app/api-reference/config/next-config-js/headers)[Next

httpAgentOptions

](https://nextjs.org/docs/app/api-reference/config/next-config-js/httpAgentOptions)
