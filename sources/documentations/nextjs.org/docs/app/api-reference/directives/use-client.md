---
title: "Directives: use client"
source_url: "https://nextjs.org/docs/app/api-reference/directives/use-client"
crawled_at: "2026-06-25T07:04:08.793Z"
---

This page is also available as Markdown at [/docs/app/api-reference/directives/use-client.md](https://nextjs.org/docs/app/api-reference/directives/use-client.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

Last updated

June 16, 2025

The `'use client'` directive declares an entry point for the components to be rendered on the **client side** and should be used when creating interactive user interfaces (UI) that require client-side JavaScript capabilities, such as state management, event handling, and access to browser APIs. This is a React feature.

> **Good to know:**
> 
> You do not need to add the `'use client'` directive to every file that contains Client Components. You only need to add it to the files whose components you want to render directly within Server Components. The `'use client'` directive defines the client-server [boundary](https://nextjs.org/docs/app/building-your-application/rendering#network-boundary), and the components exported from such a file serve as entry points to the client.

## Usage[](#usage)

To declare an entry point for the Client Components, add the `'use client'` directive **at the top of the file**, before any imports:

When using the `'use client'` directive, the props of the Client Components must be [serializable](https://react.dev/reference/rsc/use-client#serializable-types). This means the props need to be in a format that React can serialize when sending data from the server to the client.

## Nesting Client Components within Server Components[](#nesting-client-components-within-server-components)

Combining Server and Client Components allows you to build applications that are both performant and interactive:

1.  **Server Components**: Use for static content, data fetching, and SEO-friendly elements.
2.  **Client Components**: Use for interactive elements that require state, effects, or browser APIs.
3.  **Component composition**: Nest Client Components within Server Components as needed for a clear separation of server and client logic.

In the following example:

-   `Header` is a Server Component handling static content.
-   `Counter` is a Client Component enabling interactivity within the page.

## Reference[](#reference)

See the [React documentation](https://react.dev/reference/rsc/use-client) for more information on `'use client'`.

[Previous

use cache: remote

](https://nextjs.org/docs/app/api-reference/directives/use-cache-remote)[Next

use server

](https://nextjs.org/docs/app/api-reference/directives/use-server)
