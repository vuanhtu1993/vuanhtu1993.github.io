---
title: "Getting Started: Error Handling"
source_url: "https://nextjs.org/docs/app/getting-started/error-handling"
crawled_at: "2026-06-25T06:56:33.565Z"
---

Last updated

March 25, 2026

Errors can be divided into two categories: [expected errors](#handling-expected-errors) and [uncaught exceptions](#handling-uncaught-exceptions). This page will walk you through how you can handle these errors in your Next.js application.

## Handling expected errors[](#handling-expected-errors)

Expected errors are those that can occur during the normal operation of the application, such as those from [server-side form validation](https://nextjs.org/docs/app/guides/forms) or failed requests. These errors should be handled explicitly and returned to the client.

### Server Functions[](#server-functions)

You can use the [`useActionState`](https://react.dev/reference/react/useActionState) hook to handle expected errors in [Server Functions](https://react.dev/reference/rsc/server-functions).

For these errors, avoid using `try`/`catch` blocks and throw errors. Instead, model expected errors as return values.

You can pass your action to the `useActionState` hook and use the returned `state` to display an error message.

### Server Components[](#server-components)

When fetching data inside of a Server Component, you can use the response to conditionally render an error message or [`redirect`](https://nextjs.org/docs/app/api-reference/functions/redirect).

### Not found[](#not-found)

You can call the [`notFound`](https://nextjs.org/docs/app/api-reference/functions/not-found) function within a route segment and use the [`not-found.js`](https://nextjs.org/docs/app/api-reference/file-conventions/not-found) file to show a 404 UI.

## Handling uncaught exceptions[](#handling-uncaught-exceptions)

Uncaught exceptions are unexpected errors that indicate bugs or issues that should not occur during the normal flow of your application. These should be handled by throwing errors, which will then be caught by error boundaries.

### Nested error boundaries[](#nested-error-boundaries)

Next.js uses error boundaries to handle uncaught exceptions. Error boundaries catch errors in their child components and display a fallback UI instead of the component tree that crashed.

Create an error boundary by adding an [`error.js`](https://nextjs.org/docs/app/api-reference/file-conventions/error) file inside a route segment and exporting a React component:

Errors will bubble up to the nearest parent error boundary. This allows for granular error handling by placing `error.tsx` files at different levels in the [route hierarchy](https://nextjs.org/docs/app/getting-started/project-structure#component-hierarchy).

![Nested Error Component Hierarchy](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782370598/aha-mind/docs-crawler/nextjs.org/image_h48lke.png)![Nested Error Component Hierarchy](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782370598/aha-mind/docs-crawler/nextjs.org/image_t2ogqd.png)

For component-level error recovery, the [`unstable_catchError`](https://nextjs.org/docs/app/api-reference/functions/catchError) function lets you create error boundaries that can wrap any part of your component tree:

Then use the returned component as a wrapper in any layout or page:

Error boundaries don't catch errors inside event handlers. They're designed to catch errors [during rendering](https://react.dev/reference/react/Component#static-getderivedstatefromerror) to show a **fallback UI** instead of crashing the whole app.

In general, errors in event handlers or async code aren’t handled by error boundaries because they run after rendering.

To handle these cases, catch the error manually and store it using `useState` or `useReducer`, then update the UI to inform the user.

Note that unhandled errors inside `startTransition` from `useTransition`, will bubble up to the nearest error boundary.

### Global errors[](#global-errors)

While less common, you can handle errors in the root layout using the [`global-error.js`](https://nextjs.org/docs/app/api-reference/file-conventions/error#global-error) file, located in the root app directory, even when leveraging [internationalization](https://nextjs.org/docs/app/guides/internationalization). Global error UI must define its own `<html>` and `<body>` tags, since it is replacing the root layout or template when active.
