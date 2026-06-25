---
title: "Getting Started: Server and Client Components"
source_url: "https://nextjs.org/docs/app/getting-started/server-and-client-components"
crawled_at: "2026-06-25T06:56:00.273Z"
---

Last updated

June 23, 2026

By default, layouts and pages are [Server Components](https://react.dev/reference/rsc/server-components), which lets you fetch data and render parts of your UI on the server, optionally cache the result, and stream it to the client. When you need interactivity or browser APIs, you can use [Client Components](https://react.dev/reference/rsc/use-client) to layer in functionality.

This page explains how Server and Client Components work in Next.js and when to use them, with examples of how to compose them together in your application.

## When to use Server and Client Components?[](#when-to-use-server-and-client-components)

The client and server environments have different capabilities. Server and Client Components allow you to run logic in each environment depending on your use case.

Use **Client Components** when you need:

-   [State](https://react.dev/learn/managing-state) and [event handlers](https://react.dev/learn/responding-to-events). E.g. `onClick`, `onChange`.
-   [Lifecycle logic](https://react.dev/learn/lifecycle-of-reactive-effects). E.g. `useEffect`.
-   Browser-only APIs. E.g. `localStorage`, `window`, `Navigator.geolocation`, etc.
-   [Custom hooks](https://react.dev/learn/reusing-logic-with-custom-hooks).

Use **Server Components** when you need:

-   Fetch data from databases or APIs close to the source.
-   Use API keys, tokens, and other secrets without exposing them to the client.
-   Reduce the amount of JavaScript sent to the browser.
-   Improve the [First Contentful Paint (FCP)](https://web.dev/fcp/), and stream content progressively to the client.

For example, the `<Page>` component is a Server Component that fetches data about a post, and passes it as props to the `<LikeButton>` which handles client-side interactivity.

## How do Server and Client Components work in Next.js?[](#how-do-server-and-client-components-work-in-nextjs)

### On the server[](#on-the-server)

On the server, Next.js uses React's APIs to orchestrate rendering. The rendering work is split into chunks, by individual route segments ([layouts and pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages)):

-   **Server Components** are rendered into a special data format called the React Server Component Payload (RSC Payload).
-   **Client Components** and the RSC Payload are used to [prerender](https://nextjs.org/docs/app/glossary#prerendering) HTML.

> **What is the React Server Component Payload (RSC)?**
> 
> The RSC Payload is a compact binary representation of the rendered React Server Components tree. It's used by React on the client to update the browser's DOM. The RSC Payload contains:
> 
> -   The rendered result of Server Components
> -   Placeholders for where Client Components should be rendered and references to their JavaScript files
> -   Any props passed from a Server Component to a Client Component

### On the client (first load)[](#on-the-client-first-load)

Then, on the client:

1.  **HTML** is used to immediately show a fast non-interactive preview of the route to the user.
2.  **RSC Payload** is used to reconcile the Client and Server Component trees.
3.  **JavaScript** is used to hydrate Client Components and make the application interactive.

> **What is hydration?**
> 
> Hydration is React's process for attaching [event handlers](https://react.dev/learn/responding-to-events) to the DOM, to make the static HTML interactive.

### Subsequent Navigations[](#subsequent-navigations)

On subsequent navigations:

-   The **RSC Payload** is prefetched and cached for instant navigation.
-   **Client Components** are rendered entirely on the client, without the server-rendered HTML.

## Examples[](#examples)

### Using Client Components[](#using-client-components)

You can create a Client Component by adding the [`"use client"`](https://react.dev/reference/react/use-client) directive at the top of the file, above your imports.

`"use client"` is used to declare a **boundary** between the Server and Client module graphs (trees).

Once a file is marked with `"use client"`, **all of its imports and the components it directly renders are included in the client bundle**. This means you don’t need to add the directive to every component that is intended for the client.

This behavior applies to components that are part of the Client Component’s [module graph](https://nextjs.org/docs/app/glossary#module-graph), which includes the modules it imports and the components it renders directly. It does not apply to Server Components passed as children or other props. Those components are not imported into the Client Component’s module graph. They are rendered on the server and passed to the Client Component as rendered output.

See [Interleaving Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components#interleaving-server-and-client-components) for how Server and Client Components can be combined.

### Reducing JS bundle size[](#reducing-js-bundle-size)

To reduce the size of your client JavaScript bundles, add `'use client'` to specific interactive components instead of marking large parts of your UI as Client Components.

For example, the `<Layout>` component contains mostly static elements like a logo and navigation links, but includes an interactive search bar. `<Search />` is interactive and needs to be a Client Component, however, the rest of the layout can remain a Server Component.

### Passing data from Server to Client Components[](#passing-data-from-server-to-client-components)

You can pass data from Server Components to Client Components using props.

Alternatively, you can stream data from a Server Component to a Client Component with the [`use` API](https://react.dev/reference/react/use). See an [example](https://nextjs.org/docs/app/getting-started/fetching-data#streaming-data-with-the-use-api).

> **Good to know**: Props passed to Client Components need to be [serializable](https://react.dev/reference/react/use-server#serializable-parameters-and-return-values) by React.

### Interleaving Server and Client Components[](#interleaving-server-and-client-components)

You can pass Server Components as a prop to a Client Component. This allows you to visually nest server-rendered UI within Client components.

A common pattern is to use `children` to create a _slot_ in a `<ClientComponent>`. For example, a `<Cart>` component that fetches data on the server, inside a `<Modal>` component that uses client state to toggle visibility.

Then, in a parent Server Component (e.g.`<Page>`), you can pass a `<Cart>` as the child of the `<Modal>`:

In this pattern, Server Components are rendered on the server ahead of time, even when passed as props to Client Components. The React Server Component Payload contains the rendered result of those Server Components, plus placeholders for where Client Components should be rendered and references to their JavaScript files.

### Context providers[](#context-providers)

[React context](https://react.dev/learn/passing-data-deeply-with-context) is commonly used to share global state like the current theme. However, React context is not supported in Server Components.

To use context, create a Client Component that accepts `children`:

Then, import it into a Server Component (e.g. `layout`):

Your Server Component will now be able to directly render your provider, and all other Client Components throughout your app will be able to consume this context.

> **Good to know**: You should render providers as deep as possible in the tree – notice how `ThemeProvider` only wraps `{children}` instead of the entire `<html>` document. This makes it easier for Next.js to optimize the static parts of your Server Components.

### Third-party components[](#third-party-components)

When using a third-party component that relies on client-only features, you can wrap it in a Client Component to ensure it works as expected.

For example, the `<Carousel />` can be imported from the `acme-carousel` package. This component uses `useState`, but it doesn't yet have the `"use client"` directive.

If you use `<Carousel />` within a Client Component, it will work as expected:

However, if you try to use it directly within a Server Component, you'll see an error. This is because Next.js doesn't know `<Carousel />` is using client-only features.

To fix this, you can wrap third-party components that rely on client-only features in your own Client Components:

Now, you can use `<Carousel />` directly within a Server Component:

> **Advice for Library Authors**
> 
> If you’re building a component library, add the `"use client"` directive to entry points that rely on client-only features. This lets your users import components into Server Components without needing to create wrappers.
> 
> It's worth noting some bundlers might strip out `"use client"` directives. You can find an example of how to configure esbuild to include the `"use client"` directive in the [React Wrap Balancer](https://github.com/shuding/react-wrap-balancer/blob/main/tsup.config.ts#L10-L13) and [Vercel Analytics](https://github.com/vercel/analytics/blob/main/packages/web/tsup.config.js#L26-L30) repositories.

### Preventing environment poisoning[](#preventing-environment-poisoning)

JavaScript modules can be shared between both Server and Client Components modules. This means it's possible to accidentally import server-only code into the client. For example, consider the following function:

This function contains an `API_KEY` that should never be exposed to the client.

In Next.js, only environment variables prefixed with `NEXT_PUBLIC_` are included in the client bundle. If variables are not prefixed, Next.js replaces them with an empty string.

As a result, even though `getData()` can be imported and executed on the client, it won't work as expected.

To prevent accidental usage in Client Components, you can use the [`server-only` package](https://www.npmjs.com/package/server-only).

Then, import the package into a file that contains server-only code:

Now, if you try to import the module into a Client Component, there will be a build-time error.

The corresponding [`client-only` package](https://www.npmjs.com/package/client-only) can be used to mark modules that contain client-only logic like code that accesses the `window` object.

In Next.js, installing `server-only` or `client-only` is **optional**. However, if your linting rules flag extraneous dependencies, you may install them to avoid issues.

Next.js handles `server-only` and `client-only` imports internally to provide clearer error messages when a module is used in the wrong environment. The contents of these packages from NPM are not used by Next.js.

Next.js also provides its own type declarations for `server-only` and `client-only`, for TypeScript configurations where [`noUncheckedSideEffectImports`](https://www.typescriptlang.org/tsconfig/#noUncheckedSideEffectImports) is active.
