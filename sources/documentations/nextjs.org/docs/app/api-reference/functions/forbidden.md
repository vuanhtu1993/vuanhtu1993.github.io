---
title: "Functions: forbidden"
source_url: "https://nextjs.org/docs/app/api-reference/functions/forbidden"
crawled_at: "2026-06-25T07:08:57.324Z"
---

This page is also available as Markdown at [/docs/app/api-reference/functions/forbidden.md](https://nextjs.org/docs/app/api-reference/functions/forbidden.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

This feature is currently experimental and subject to change, it's not recommended for production. Try it out and share your feedback on [GitHub](https://github.com/vercel/next.js/issues).

Last updated

March 3, 2026

The `forbidden` function throws an error that renders a Next.js 403 error page. It's useful for handling authorization errors in your application. You can customize the UI using the [`forbidden.js` file](https://nextjs.org/docs/app/api-reference/file-conventions/forbidden).

To start using `forbidden`, enable the experimental [`authInterrupts`](https://nextjs.org/docs/app/api-reference/config/next-config-js/authInterrupts) configuration option in your `next.config.js` file:

`forbidden` can be invoked in [Server Components](https://nextjs.org/docs/app/getting-started/server-and-client-components), [Server Functions](https://nextjs.org/docs/app/getting-started/mutating-data), and [Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route).

## Good to know[](#good-to-know)

-   The `forbidden` function cannot be called in the [root layout](https://nextjs.org/docs/app/api-reference/file-conventions/layout#root-layout).

## Examples[](#examples)

### Role-based route protection[](#role-based-route-protection)

You can use `forbidden` to restrict access to certain routes based on user roles. This ensures that users who are authenticated but lack the required permissions cannot access the route.

### Mutations with Server Actions[](#mutations-with-server-actions)

When implementing mutations in Server Actions, you can use `forbidden` to only allow users with a specific role to update sensitive data.

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v15.1.0` | `forbidden` introduced. |

[Previous

fetch

](https://nextjs.org/docs/app/api-reference/functions/fetch)[Next

generateImageMetadata

](https://nextjs.org/docs/app/api-reference/functions/generate-image-metadata)
