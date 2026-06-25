---
title: "next.config.js: staleTimes"
source_url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/staleTimes"
crawled_at: "2026-06-25T07:17:10.009Z"
---

This page is also available as Markdown at [/docs/app/api-reference/config/next-config-js/staleTimes.md](https://nextjs.org/docs/app/api-reference/config/next-config-js/staleTimes.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

This feature is currently experimental and subject to change, it's not recommended for production. Try it out and share your feedback on [GitHub](https://github.com/vercel/next.js/issues).

Last updated

March 3, 2026

`staleTimes` is an experimental feature that enables caching of page segments in the [Client Cache](https://nextjs.org/docs/app/glossary#client-cache).

You can enable this experimental feature and provide custom revalidation times by setting the experimental `staleTimes` flag:

The `static` and `dynamic` properties correspond with the time period (in seconds) based on different types of [link prefetching](https://nextjs.org/docs/app/api-reference/components/link#prefetch).

-   The `dynamic` property is used when the page is neither statically generated nor fully prefetched (e.g. with `prefetch={true}`).
    -   Default: 0 seconds (not cached)
-   The `static` property is used for statically generated pages, or when the `prefetch` prop on `Link` is set to `true`, or when calling [`router.prefetch`](https://nextjs.org/docs/app/api-reference/functions/use-router).
    -   Default: 5 minutes

> **Good to know:**
> 
> -   [Loading boundaries](https://nextjs.org/docs/app/api-reference/file-conventions/loading) are considered reusable for the `static` period defined in this configuration.
> -   This doesn't affect [partial rendering](https://nextjs.org/docs/app/getting-started/linking-and-navigating#client-side-transitions), **meaning shared layouts won't automatically be refetched on every navigation, only the page segment that changes.**
> -   This doesn't change [back/forward caching](https://nextjs.org/docs/app/glossary#client-cache) behavior to prevent layout shift and to prevent losing the browser scroll position.

### Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v15.0.0` | The `dynamic` `staleTimes` default changed from 30s to 0s. |
| `v14.2.0` | Experimental `staleTimes` introduced. |

[Previous

serverExternalPackages

](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverExternalPackages)[Next

staticGeneration\*

](https://nextjs.org/docs/app/api-reference/config/next-config-js/staticGeneration)
