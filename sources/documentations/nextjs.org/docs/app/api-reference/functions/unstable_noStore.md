---
title: "Functions: unstable_noStore"
source_url: "https://nextjs.org/docs/app/api-reference/functions/unstable_noStore"
crawled_at: "2026-06-25T07:10:55.815Z"
---

This page is also available as Markdown at [/docs/app/api-reference/functions/unstable\_noStore.md](https://nextjs.org/docs/app/api-reference/functions/unstable_noStore.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

This is a legacy API and no longer recommended. It's still supported for backward compatibility.

Last updated

March 3, 2026

**In version 15, we recommend using [`connection`](https://nextjs.org/docs/app/api-reference/functions/connection) instead of `unstable_noStore`.**

`unstable_noStore` can be used to declaratively opt out of prerendering and indicate a particular component should not be cached.

> **Good to know**:
> 
> -   `unstable_noStore` is equivalent to `cache: 'no-store'` on a `fetch`
> -   `unstable_noStore` is preferred over `export const dynamic = 'force-dynamic'` as it is more granular and can be used on a per-component basis

-   Using `unstable_noStore` inside [`unstable_cache`](https://nextjs.org/docs/app/api-reference/functions/unstable_cache) will not opt out of static generation. Instead, it will defer to the cache configuration to determine whether to cache the result or not.

## Usage[](#usage)

If you prefer not to pass additional options to `fetch`, like `cache: 'no-store'`, `next: { revalidate: 0 }` or in cases where `fetch` is not available, you can use `noStore()` as a replacement for all of these use cases.

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v15.0.0` | `unstable_noStore` deprecated for `connection`. |
| `v14.0.0` | `unstable_noStore` introduced. |

[Previous

unstable\_cache

](https://nextjs.org/docs/app/api-reference/functions/unstable_cache)[Next

unstable\_rethrow

](https://nextjs.org/docs/app/api-reference/functions/unstable_rethrow)
