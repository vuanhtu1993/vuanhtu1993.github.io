---
title: "Functions: unauthorized"
source_url: "https://nextjs.org/docs/app/api-reference/functions/unauthorized"
crawled_at: "2026-06-25T07:10:43.174Z"
---

This feature is currently experimental and subject to change, it's not recommended for production. Try it out and share your feedback on [GitHub](https://github.com/vercel/next.js/issues).

Last updated

March 3, 2026

The `unauthorized` function throws an error that renders a Next.js 401 error page. It's useful for handling authorization errors in your application. You can customize the UI using the [`unauthorized.js` file](https://nextjs.org/docs/app/api-reference/file-conventions/unauthorized).

To start using `unauthorized`, enable the experimental [`authInterrupts`](https://nextjs.org/docs/app/api-reference/config/next-config-js/authInterrupts) configuration option in your `next.config.js` file:

`unauthorized` can be invoked in [Server Components](https://nextjs.org/docs/app/getting-started/server-and-client-components), [Server Functions](https://nextjs.org/docs/app/getting-started/mutating-data), and [Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route).

## Good to know[](#good-to-know)

-   The `unauthorized` function cannot be called in the [root layout](https://nextjs.org/docs/app/api-reference/file-conventions/layout#root-layout).

## Examples[](#examples)

### Displaying login UI to unauthenticated users[](#displaying-login-ui-to-unauthenticated-users)

You can use `unauthorized` function to display the `unauthorized.js` file with a login UI.

### Mutations with Server Actions[](#mutations-with-server-actions)

You can invoke `unauthorized` in Server Actions to ensure only authenticated users can perform specific mutations.

### Fetching data with Route Handlers[](#fetching-data-with-route-handlers)

You can use `unauthorized` in Route Handlers to ensure only authenticated users can access the endpoint.

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v15.1.0` | `unauthorized` introduced. |
