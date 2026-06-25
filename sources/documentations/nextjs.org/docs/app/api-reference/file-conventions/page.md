---
title: "File-system conventions: page.js"
source_url: "https://nextjs.org/docs/app/api-reference/file-conventions/page"
crawled_at: "2026-06-25T07:06:06.739Z"
---

Last updated

March 5, 2026

The `page` file allows you to define UI that is **unique** to a route. You can create a page by default exporting a component from the file:

## Good to know[](#good-to-know)

-   The `.js`, `.jsx`, or `.tsx` file extensions can be used for `page`.
-   A `page` is always the **leaf** of the route subtree.
-   A `page` file is required to make a route segment **publicly accessible**.
-   Pages are [Server Components](https://react.dev/reference/rsc/server-components) by default, but can be set to a [Client Component](https://react.dev/reference/rsc/use-client).
-   In the [component hierarchy](https://nextjs.org/docs/app/getting-started/project-structure#component-hierarchy), `page.js` is the innermost file convention. It is wrapped by `loading.js` (Suspense boundary), `error.js` (error boundary), `template.js`, and `layout.js` in the same segment.

## Reference[](#reference)

### Props[](#props)

#### `params` (optional)[](#params-optional)

A promise that resolves to an object containing the [dynamic route parameters](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes) from the root segment down to that page.

| Example Route | URL | `params` |
| --- | --- | --- |
| `app/shop/[slug]/page.js` | `/shop/1` | `Promise<{ slug: '1' }>` |
| `app/shop/[category]/[item]/page.js` | `/shop/1/2` | `Promise<{ category: '1', item: '2' }>` |
| `app/shop/[...slug]/page.js` | `/shop/1/2` | `Promise<{ slug: ['1', '2'] }>` |

-   Since the `params` prop is a promise, you must use `async/await` or React's [`use`](https://react.dev/reference/react/use) function to access the values.
    -   In version 14 and earlier, `params` was a synchronous prop. To help with backwards compatibility, you can still access it synchronously in Next.js 15, but this behavior will be deprecated in the future.

#### `searchParams` (optional)[](#searchparams-optional)

A promise that resolves to an object containing the [search parameters](https://developer.mozilla.org/docs/Learn/Common_questions/What_is_a_URL#parameters) of the current URL. For example:

Client Component **pages** can also access `searchParams` using React’s [`use`](https://react.dev/reference/react/use) hook:

| Example URL | `searchParams` |
| --- | --- |
| `/shop?a=1` | `Promise<{ a: '1' }>` |
| `/shop?a=1&b=2` | `Promise<{ a: '1', b: '2' }>` |
| `/shop?a=1&a=2` | `Promise<{ a: ['1', '2'] }>` |

-   Since the `searchParams` prop is a promise. You must use `async/await` or React's [`use`](https://react.dev/reference/react/use) function to access the values.
    -   In version 14 and earlier, `searchParams` was a synchronous prop. To help with backwards compatibility, you can still access it synchronously in Next.js 15, but this behavior will be deprecated in the future.
-   `searchParams` is a **[Request-time API](https://nextjs.org/docs/app/glossary#request-time-apis)** whose values cannot be known ahead of time. Using it will opt the page into **[dynamic rendering](https://nextjs.org/docs/app/glossary#dynamic-rendering)** at request time.
-   `searchParams` is a plain JavaScript object, not a `URLSearchParams` instance.

### Page Props Helper[](#page-props-helper)

You can type pages with `PageProps` to get strongly typed `params` and `searchParams` from the route literal. `PageProps` is a globally available helper.

> **Good to know**
> 
> -   Using a literal route (e.g. `'/blog/[slug]'`) enables autocomplete and strict keys for `params`.
> -   Static routes resolve `params` to `{}`.
> -   Types are generated during `next dev`, `next build`, or with `next typegen`.
> -   After type generation, the `PageProps` helper is globally available. It doesn't need to be imported.

## Examples[](#examples)

### Displaying content based on `params`[](#displaying-content-based-on-params)

Using [dynamic route segments](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes), you can display or fetch specific content for the page based on the `params` prop.

### Handling filtering with `searchParams`[](#handling-filtering-with-searchparams)

You can use the `searchParams` prop to handle filtering, pagination, or sorting based on the query string of the URL.

### Reading `searchParams` and `params` in Client Components[](#reading-searchparams-and-params-in-client-components)

To use `searchParams` and `params` in a Client Component (which cannot be `async`), you can use React's [`use`](https://react.dev/reference/react/use) function to read the promise:

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v15.0.0-RC` | `params` and `searchParams` are now promises. A [codemod](https://nextjs.org/docs/app/guides/upgrading/codemods#150) is available. |
| `v13.0.0` | `page` introduced. |
