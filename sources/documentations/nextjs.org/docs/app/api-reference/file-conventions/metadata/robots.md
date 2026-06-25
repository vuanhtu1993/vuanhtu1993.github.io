---
title: "Metadata Files: robots.txt"
source_url: "https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots"
crawled_at: "2026-06-25T07:07:26.183Z"
---

This page is also available as Markdown at [/docs/app/api-reference/file-conventions/metadata/robots.md](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

Last updated

March 3, 2026

Add or generate a `robots.txt` file that matches the [Robots Exclusion Standard](https://en.wikipedia.org/wiki/Robots.txt#Standard) in the **root** of `app` directory to tell search engine crawlers which URLs they can access on your site.

## Static `robots.txt`[](#static-robotstxt)

## Generate a Robots file[](#generate-a-robots-file)

Add a `robots.js` or `robots.ts` file that returns a [`Robots` object](#robots-object).

> **Good to know**: `robots.js` is a special Route Handler that is cached by default unless it uses a [Request-time API](https://nextjs.org/docs/app/glossary#request-time-apis) or [dynamic config](https://nextjs.org/docs/app/guides/caching-without-cache-components#dynamic) option.

Output:

### Customizing specific user agents[](#customizing-specific-user-agents)

You can customize how individual search engine bots crawl your site by passing an array of user agents to the `rules` property. For example:

Output:

### Robots object[](#robots-object)

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v13.3.0` | `robots` introduced. |

[Previous

opengraph-image and twitter-image

](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image)[Next

sitemap.xml

](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
