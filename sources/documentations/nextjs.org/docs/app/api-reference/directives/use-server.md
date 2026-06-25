---
title: "Directives: use server"
source_url: "https://nextjs.org/docs/app/api-reference/directives/use-server"
crawled_at: "2026-06-25T07:04:14.170Z"
---

Last updated

June 23, 2026

The `use server` directive designates a function or file to be executed on the **server side**. It can be used at the top of a file to indicate that all functions in the file are server-side, or inline at the top of a function to mark the function as a [Server Function](https://19.react.dev/reference/rsc/server-functions). This is a React feature.

For Next.js-specific Server Action behaviors (response model, security, configuration, deployment), see [Server Actions and Mutations](https://nextjs.org/docs/app/guides/server-actions).

## Using `use server` at the top of a file[](#using-use-server-at-the-top-of-a-file)

The following example shows a file with a `use server` directive at the top. All functions in the file are executed on the server.

### Using Server Functions in a Client Component[](#using-server-functions-in-a-client-component)

To use Server Functions in Client Components you need to create your Server Functions in a dedicated file using the `use server` directive at the top of the file. These Server Functions can then be imported into Client and Server Components and executed.

Assuming you have a `fetchUsers` Server Function in `actions.ts`:

Then you can import the `fetchUsers` Server Function into a Client Component and execute it on the client-side.

## Using `use server` inline[](#using-use-server-inline)

In the following example, `use server` is used inline at the top of a function to mark it as a [Server Function](https://19.react.dev/reference/rsc/server-functions):

## Security considerations[](#security-considerations)

Design your data access functions as secure primitives: validate inputs, check authentication and authorization, and constrain return types to only what the caller needs. When Server Functions delegate to a [Data Access Layer](https://nextjs.org/docs/app/guides/data-security#using-a-data-access-layer-for-mutations), these guarantees live in one place and apply consistently.

### Authentication and authorization[](#authentication-and-authorization)

Always authenticate and authorize users before performing sensitive server-side operations. Read authentication from cookies or headers rather than accepting tokens as function parameters.

### Return values[](#return-values)

Server Function return values are serialized and sent to the client. Only return data the UI needs, not raw database records. See the [Data Security guide](https://nextjs.org/docs/app/guides/data-security#controlling-return-values) for more details.

## Reference[](#reference)

See the [React documentation](https://react.dev/reference/rsc/use-server) for more information on `use server`.
