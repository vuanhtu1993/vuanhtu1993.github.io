---
title: "Guides: Lazy Loading"
source_url: "https://nextjs.org/docs/app/guides/lazy-loading"
crawled_at: "2026-06-25T06:59:30.451Z"
---

## How to lazy load Client Components and libraries

Last updated

March 10, 2026

[Lazy loading](https://developer.mozilla.org/docs/Web/Performance/Lazy_loading) in Next.js helps improve the initial loading performance of an application by decreasing the amount of JavaScript needed to render a route.

It allows you to defer loading of **Client Components** and imported libraries, and only include them in the client bundle when they're needed. For example, you might want to defer loading a modal until a user clicks to open it.

There are two ways you can implement lazy loading in Next.js:

1.  Using [Dynamic Imports](#nextdynamic) with `next/dynamic`
2.  Using [`React.lazy()`](https://react.dev/reference/react/lazy) with [Suspense](https://react.dev/reference/react/Suspense)

By default, Server Components are automatically [code split](https://developer.mozilla.org/docs/Glossary/Code_splitting), and you can use [streaming](https://nextjs.org/docs/app/guides/streaming) to progressively send pieces of UI from the server to the client. Lazy loading applies to Client Components.

## `next/dynamic`[](#nextdynamic)

`next/dynamic` is a composite of [`React.lazy()`](https://react.dev/reference/react/lazy) and [Suspense](https://react.dev/reference/react/Suspense). It behaves the same way in the `app` and `pages` directories to allow for incremental migration.

## Examples[](#examples)

### Importing Client Components[](#importing-client-components)

> **Note:** When a Server Component dynamically imports a Client Component, automatic [code splitting](https://developer.mozilla.org/docs/Glossary/Code_splitting) is currently **not** supported.

### Skipping SSR[](#skipping-ssr)

When using `React.lazy()` and Suspense, Client Components will be [prerendered](https://github.com/reactwg/server-components/discussions/4) (SSR) by default.

> **Note:** `ssr: false` option will only work for Client Components, move it into Client Components ensure the client code-splitting working properly.

If you want to disable prerendering for a Client Component, you can use the `ssr` option set to `false`:

### Importing Server Components[](#importing-server-components)

If you dynamically import a Server Component, only the Client Components that are children of the Server Component will be lazy-loaded - not the Server Component itself. It will also help preload the static assets such as CSS when you're using it in Server Components.

> **Note:** `ssr: false` option is not supported in Server Components. You will see an error if you try to use it in Server Components. `ssr: false` is not allowed with `next/dynamic` in Server Components. Please move it into a Client Component.

### Loading External Libraries[](#loading-external-libraries)

External libraries can be loaded on demand using the [`import()`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/import) function. This example uses the external library `fuse.js` for fuzzy search. The module is only loaded on the client after the user types in the search input.

### Adding a custom loading component[](#adding-a-custom-loading-component)

### Importing Named Exports[](#importing-named-exports)

To dynamically import a named export, you can return it from the Promise returned by [`import()`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/import) function:

Next.js supports magic comments to control how dynamic imports are handled by the bundler. These comments work with dynamic `import()`, `require()`, `require.resolve()`, and `new Worker()` expressions.

> **Good to know:** Magic comments do not work with static `import` statements (`import x from 'y'`). They only work with dynamic expressions.

### `webpackIgnore` / `turbopackIgnore`[](#webpackignore--turbopackignore)

Use these comments to skip bundling a dynamic import. The import expression will be left as-is in the output, useful for runtime-only modules:

### `turbopackOptional` (Turbopack only)[](#turbopackoptional-turbopack-only)

Use this comment to suppress build errors when a module might not exist. The import will still throw at runtime if the module is missing:

This is useful for:

-   Conditional features that may not be installed
-   Plugin systems where modules are optional
-   Gradual migrations where some files may not exist yet

> **Good to know:** `webpackOptional` is not supported. Use `turbopackOptional` instead when using Turbopack.
