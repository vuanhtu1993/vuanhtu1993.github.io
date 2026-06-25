---
title: "Getting Started: Mutating Data"
source_url: "https://nextjs.org/docs/app/getting-started/mutating-data"
crawled_at: "2026-06-25T06:56:13.491Z"
---

Last updated

June 23, 2026

You can mutate data in Next.js using [React Server Functions](https://react.dev/reference/rsc/server-functions). This page will go through how you can [create](#creating-server-functions) and [invoke](#invoking-server-functions) Server Functions. For Next.js-specific behaviors (single-roundtrip response, sequential dispatch, security, deployment), see [Server Actions and Mutations](https://nextjs.org/docs/app/guides/server-actions).

## What are Server Functions?[](#what-are-server-functions)

A **Server Function** is an asynchronous function that runs on the server. You can call them from the client through a network request, which is why they must be asynchronous.

In an `action` or mutation context, they are also called **Server Actions**.

By convention, a Server Action is an async function used with [`startTransition`](https://react.dev/reference/react/startTransition). This happens automatically when the function is:

-   Passed to a `<form>` using the `action` prop.
-   Passed to a `<button>` using the `formAction` prop.

When an action is invoked, Next.js can return both the updated UI and new data in a single server roundtrip.

Behind the scenes, actions use the `POST` method, and only this HTTP method can invoke them.

Server Functions are reachable via direct POST requests, not just through your application's UI. Always verify authentication and authorization inside every Server Function. See the [Data Security guide](https://nextjs.org/docs/app/guides/data-security#authentication-and-authorization) for recommended patterns.

> **Good to know:** A Server Action is a Server Function used in a specific way (for handling form submissions and mutations). Server Function is the broader term.

## Creating Server Functions[](#creating-server-functions)

A Server Function can be defined by using the [`use server`](https://react.dev/reference/rsc/use-server) directive. You can place the directive at the top of an **asynchronous** function to mark the function as a Server Function, or at the top of a separate file to mark all exports of that file.

### Server Components[](#server-components)

Server Functions can be inlined in Server Components by adding the `"use server"` directive to the top of the function body:

> **Good to know:** Server Components support progressive enhancement by default, meaning forms that call Server Actions will be submitted even if JavaScript hasn't loaded yet or is disabled.

### Client Components[](#client-components)

It's not possible to define Server Functions in Client Components. However, you can invoke them in Client Components by importing them from a file that has the `"use server"` directive at the top of it:

> **Good to know:** In Client Components, forms invoking Server Actions will queue submissions if JavaScript isn't loaded yet, and will be prioritized for hydration. After hydration, the browser does not refresh on form submission.

### Passing actions as props[](#passing-actions-as-props)

You can also pass an action to a Client Component as a prop:

## Invoking Server Functions[](#invoking-server-functions)

There are two main ways you can invoke a Server Function:

1.  [Forms](#forms) in Server and Client Components
2.  [Event Handlers](#event-handlers) and [useEffect](#useeffect) in Client Components

> **Good to know:** Server Functions are designed for server-side mutations. The client currently dispatches and awaits them one at a time. This is an implementation detail and may change. If you need parallel data fetching, use [data fetching](https://nextjs.org/docs/app/getting-started/fetching-data#server-components) in Server Components, or perform parallel work inside a single Server Function or [Route Handler](https://nextjs.org/docs/app/guides/backend-for-frontend#manipulating-data).

### Forms[](#forms)

React extends the HTML [`<form>`](https://react.dev/reference/react-dom/components/form) element to allow a Server Function to be invoked with the HTML `action` prop.

When invoked in a form, the function automatically receives the [`FormData`](https://developer.mozilla.org/docs/Web/API/FormData/FormData) object. You can extract the data using the native [`FormData` methods](https://developer.mozilla.org/en-US/docs/Web/API/FormData#instance_methods):

### Event Handlers[](#event-handlers)

You can invoke a Server Function in a Client Component by using event handlers such as `onClick`.

## Examples[](#examples)

### Showing a pending state[](#showing-a-pending-state)

While executing a Server Function, you can show a loading indicator with React's [`useActionState`](https://react.dev/reference/react/useActionState) hook. This hook returns a `pending` boolean:

### Refresh data[](#refresh-data)

After a mutation, you may want to refresh the current page to show the latest data. You can do this by calling [`refresh`](https://nextjs.org/docs/app/api-reference/functions/refresh) from `next/cache` in a Server Action:

This refreshes the client router, ensuring the UI reflects the latest state. The `refresh()` function does not revalidate tagged data. To revalidate tagged data, use [`updateTag`](https://nextjs.org/docs/app/api-reference/functions/updateTag) or [`revalidateTag`](https://nextjs.org/docs/app/api-reference/functions/revalidateTag) instead.

### Revalidate data[](#revalidate-data)

After performing a mutation, you can revalidate the Next.js cache and show the updated data by calling [`revalidatePath`](https://nextjs.org/docs/app/api-reference/functions/revalidatePath) or [`revalidateTag`](https://nextjs.org/docs/app/api-reference/functions/revalidateTag) within the Server Function:

### Redirect after a mutation[](#redirect-after-a-mutation)

You may want to redirect the user to a different page after a mutation. You can do this by calling [`redirect`](https://nextjs.org/docs/app/api-reference/functions/redirect) within the Server Function.

Calling `redirect` [throws](https://nextjs.org/docs/app/api-reference/functions/redirect#behavior) a framework handled control-flow exception. Any code after it won't execute. If you need fresh data, call [`revalidatePath`](https://nextjs.org/docs/app/api-reference/functions/revalidatePath) or [`revalidateTag`](https://nextjs.org/docs/app/api-reference/functions/revalidateTag) beforehand.

### Cookies[](#cookies)

You can `get`, `set`, and `delete` cookies inside a Server Action using the [`cookies`](https://nextjs.org/docs/app/api-reference/functions/cookies) API.

When you [set or delete](https://nextjs.org/docs/app/api-reference/functions/cookies#understanding-cookie-behavior-in-server-functions) a cookie in a Server Action, Next.js re-renders the current page and its layouts on the server so the **UI reflects the new cookie value**.

> **Good to know**: The server update applies to the current React tree, re-rendering, mounting, or unmounting components, as needed. Client state is preserved for re-rendered components, and effects re-run if their dependencies changed.

### useEffect[](#useeffect)

You can use the React [`useEffect`](https://react.dev/reference/react/useEffect) hook to invoke a Server Action when the component mounts or a dependency changes. This is useful for mutations that depend on global events or need to be triggered automatically. For example, `onKeyDown` for app shortcuts, an intersection observer hook for infinite scrolling, or when the component mounts to update a view count:
