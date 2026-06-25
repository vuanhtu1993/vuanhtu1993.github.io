---
title: "File-system conventions: not-found.js"
source_url: "https://nextjs.org/docs/app/api-reference/file-conventions/not-found"
crawled_at: "2026-06-25T07:06:01.651Z"
---

Last updated

March 5, 2026

Next.js provides two conventions to handle not found cases:

-   **`not-found.js`**: Used when you call the [`notFound`](https://nextjs.org/docs/app/api-reference/functions/not-found) function in a route segment.
-   **`global-not-found.js`**: Used to define a global 404 page for unmatched routes across your entire app. This is handled at the routing level and doesn't depend on rendering a layout or page.

## `not-found.js`[](#not-foundjs)

The **not-found** file is used to render UI when the [`notFound`](https://nextjs.org/docs/app/api-reference/functions/not-found) function is thrown within a route segment. Along with serving a custom UI, Next.js will return a `200` HTTP status code for streamed responses, and `404` for non-streamed responses (see [Status Codes](https://nextjs.org/docs/app/api-reference/file-conventions/loading#status-codes) for details about SEO).

In the [component hierarchy](https://nextjs.org/docs/app/getting-started/project-structure#component-hierarchy), `not-found.js` renders between `loading.js` and `page.js`. It is wrapped by the `<Suspense>` boundary from `loading.js` and the error boundary from `error.js` in the same segment.

## `global-not-found.js` (experimental)[](#global-not-foundjs-experimental)

The `global-not-found.js` file lets you define a 404 page for your entire application. Unlike `not-found.js`, which works at the route level, this is used when a requested URL doesn't match any route at all. Next.js **skips rendering** and directly returns this global page.

The `global-not-found.js` file bypasses your app's normal rendering, which means you'll need to import any global styles, fonts, or other dependencies that your 404 page requires.

> **Good to know**: A smaller version of your global styles, and a simpler font family could improve performance of this page.

`global-not-found.js` is useful when you can't build a 404 page using a combination of `layout.js` and `not-found.js`. This can happen in two cases:

-   Your app has multiple root layouts (e.g. `app/(admin)/layout.tsx` and `app/(shop)/layout.tsx`), so there's no single layout to compose a global 404 from.
-   Your root layout is defined using top-level dynamic segments (e.g. `app/[country]/layout.tsx`), which makes composing a consistent 404 page harder.

To enable it, add the `globalNotFound` flag in `next.config.ts`:

Then, create a file in the root of the `app` directory: `app/global-not-found.js`:

Unlike `not-found.js`, this file must return a full HTML document, including `<html>` and `<body>` tags.

## Reference[](#reference)

### Props[](#props)

`not-found.js` or `global-not-found.js` components do not accept any props.

> **Good to know**: In addition to catching expected `notFound()` errors, the root `app/not-found.js` and `app/global-not-found.js` files handle any unmatched URLs for your whole application. This means users that visit a URL that is not handled by your app will be shown the exported UI.

## Examples[](#examples)

### Data Fetching[](#data-fetching)

By default, `not-found` is a Server Component. You can mark it as `async` to fetch and display data:

If you need to use Client Component hooks like `usePathname` to display content based on the path, you must fetch data on the client-side instead.

### Metadata[](#metadata)

For `global-not-found.js`, you can export a `metadata` object or a [`generateMetadata`](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) function to customize the `<title>`, `<meta>`, and other head tags for your 404 page:

> **Good to know**: Next.js automatically injects `<meta name="robots" content="noindex" />` for pages that return a 404 status code, including `global-not-found.js` pages.

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v15.4.0` | `global-not-found.js` introduced (experimental). |
| `v13.3.0` | Root `app/not-found` handles global unmatched URLs. |
| `v13.0.0` | `not-found` introduced. |
