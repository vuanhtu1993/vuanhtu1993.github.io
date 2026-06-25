---
title: "Getting Started: Fetching Data"
source_url: "https://nextjs.org/docs/app/getting-started/fetching-data"
crawled_at: "2026-06-25T06:56:07.814Z"
---

Last updated

March 13, 2026

This page will walk you through how you can fetch data in [Server](#server-components) and [Client](#client-components) Components, and how to [stream](#streaming) components that depend on uncached data.

## Fetching data[](#fetching-data)

### Server Components[](#server-components)

You can fetch data in Server Components using any asynchronous I/O, such as:

1.  The [`fetch` API](#with-the-fetch-api)
2.  An [ORM or database](#with-an-orm-or-database)

#### With the `fetch` API[](#with-the-fetch-api)

To fetch data with the `fetch` API, turn your component into an asynchronous function, and await the `fetch` call. For example:

> **Good to know:**
> 
> -   Identical `fetch` requests in a React component tree are [memoized](https://nextjs.org/docs/app/glossary#memoization) by default, so you can fetch data in the component that needs it instead of drilling props.
> -   `fetch` requests are not cached by default and will block the page from rendering until the request is complete. Use the [`use cache`](https://nextjs.org/docs/app/api-reference/directives/use-cache) directive to cache results, or wrap the fetching component in [`<Suspense>`](https://nextjs.org/docs/app/getting-started/caching#streaming-uncached-data) to stream fresh data at request time. See [caching](https://nextjs.org/docs/app/getting-started/caching) for details.
> -   During development, you can log `fetch` calls for better visibility and debugging. See the [`logging` API reference](https://nextjs.org/docs/app/api-reference/config/next-config-js/logging).

#### With an ORM or database[](#with-an-orm-or-database)

Since Server Components are rendered on the server, credentials and query logic will not be included in the client bundle so you can safely make database queries using an ORM or database client.

You should still ensure requests are properly authenticated and authorized. For best practices on securing server-side data access, see the [data security guide](https://nextjs.org/docs/app/guides/data-security).

### Streaming[](#streaming)

When you fetch data in Server Components, the data is fetched and rendered on the server for each request. If you have any slow data requests, the whole route will be blocked from rendering until all the data is fetched.

To improve the initial load time and user experience, you can break the page into smaller _chunks_ and progressively send those chunks from the server to the client. This is called streaming. See the [Streaming guide](https://nextjs.org/docs/app/guides/streaming) for a deeper look at how streaming works, including the HTTP contract, infrastructure considerations, and performance trade-offs.

![How Server Rendering with Streaming Works](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782370572/aha-mind/docs-crawler/nextjs.org/image_nugejv.png)![How Server Rendering with Streaming Works](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782370572/aha-mind/docs-crawler/nextjs.org/image_uavp1b.png)

There are two ways you can use streaming in your application:

1.  Wrapping a page with a [`loading.js` file](#with-loadingjs)
2.  Wrapping a component with [`<Suspense>`](#with-suspense)

#### With `loading.js`[](#with-loadingjs)

You can create a `loading.js` file in the same folder as your page to stream the **entire page** while the data is being fetched. For example, to stream `app/blog/page.js`, add the file inside the `app/blog` folder.

![Blog folder structure with loading.js file](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782370572/aha-mind/docs-crawler/nextjs.org/image_neowjd.png)![Blog folder structure with loading.js file](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782370572/aha-mind/docs-crawler/nextjs.org/image_d5anut.png)

On navigation, the user will immediately see the layout and a [loading state](#creating-meaningful-loading-states) while the page is being rendered. The new content will then be automatically swapped in once rendering is complete.

![Loading UI](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782370572/aha-mind/docs-crawler/nextjs.org/image_mulvli.png)![Loading UI](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782370572/aha-mind/docs-crawler/nextjs.org/image_xegp1u.png)

Behind the scenes, `loading.js` will be [nested inside `layout.js`](https://nextjs.org/docs/app/getting-started/project-structure#component-hierarchy), and will automatically wrap the `page.js` file and any children below in a `<Suspense>` boundary.

![loading.js overview](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782370572/aha-mind/docs-crawler/nextjs.org/image_n9mbvv.png)![loading.js overview](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782370572/aha-mind/docs-crawler/nextjs.org/image_w3e32c.png)

Because of this, a layout that accesses uncached or runtime data (e.g. `cookies()`, `headers()`, or uncached fetches) does not fall back to a same route segment `loading.js`. Instead, it blocks navigation until the layout finishes rendering. [Cache Components](https://nextjs.org/docs/app/getting-started/caching) prevents this by guiding you with a build-time error.

To fix this, wrap the uncached access in its own [`<Suspense>`](#with-suspense) boundary with a fallback, or move the data fetching into `page.js` where `loading.js` can cover it. See [`loading.js`](https://nextjs.org/docs/app/api-reference/file-conventions/loading) for more details.

This is why, while `loading.js` works well for streaming route segments, using `<Suspense>` closer to the runtime or uncached data access is recommended.

#### With `<Suspense>`[](#with-suspense)

`<Suspense>` allows you to be more granular about what parts of the page to stream. For example, you can immediately show any page content that falls outside of the `<Suspense>` boundary, and stream in the list of blog posts inside the boundary.

#### Creating meaningful loading states[](#creating-meaningful-loading-states)

An instant loading state is fallback UI that is shown immediately to the user after navigation. For the best user experience, we recommend designing loading states that are meaningful and help users understand the app is responding. For example, you can use skeletons and spinners, or a small but meaningful part of future screens such as a cover photo, title, etc.

In development, you can preview and inspect the loading state of your components using the [React Devtools](https://react.dev/learn/react-developer-tools).

### Client Components[](#client-components)

There are two ways to fetch data in Client Components, using:

1.  React's [`use` API](https://react.dev/reference/react/use)
2.  A community library like [SWR](https://swr.vercel.app/) or [React Query](https://tanstack.com/query/latest)

#### Streaming data with the `use` API[](#streaming-data-with-the-use-api)

You can use React's [`use` API](https://react.dev/reference/react/use) to [stream](#streaming) data from the server to client. Start by fetching data in your Server component, and pass the promise to your Client Component as prop:

Then, in your Client Component, use the `use` API to read the promise:

In the example above, the `<Posts>` component is wrapped in a [`<Suspense>` boundary](https://react.dev/reference/react/Suspense). This means the fallback will be shown while the promise is being resolved. Learn more about [streaming](#streaming).

You can use a community library like [SWR](https://swr.vercel.app/) or [React Query](https://tanstack.com/query/latest) to fetch data in Client Components. These libraries have their own semantics for caching, streaming, and other features. For example, with SWR:

## Examples[](#examples)

### Sequential data fetching[](#sequential-data-fetching)

Sequential data fetching happens when one request depends on data from another.

For example, `<Playlists>` can only fetch data after `<Artist>` completes because it needs the `artistID`:

In this example, `<Suspense>` allows the playlists to stream in after the artist data loads. However, the page still waits for the artist data before displaying anything. To prevent this, you can wrap the entire page component in a `<Suspense>` boundary (for example, using a [`loading.js` file](#with-loadingjs)) to show a loading state immediately.

Ensure your data source can resolve the first request quickly, as it blocks everything else. If you can't optimize the request further, consider [caching](https://nextjs.org/docs/app/getting-started/caching) the result if the data changes infrequently.

### Parallel data fetching[](#parallel-data-fetching)

Parallel data fetching happens when data requests in a route are eagerly initiated and start at the same time.

By default, [layouts and pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages) are rendered in parallel. So each segment starts fetching data as soon as possible.

However, within _any_ component, multiple `async`/`await` requests can still be sequential if placed after the other. For example, `getAlbums` will be blocked until `getArtist` is resolved:

Start multiple requests by calling `fetch`, then await them with [`Promise.all`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all). Requests begin as soon as `fetch` is called.

> **Good to know:** If one request fails when using `Promise.all`, the entire operation will fail. To handle this, you can use the [`Promise.allSettled`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled) method instead.

### Sharing data with context and `React.cache`[](#sharing-data-with-context-and-reactcache)

You can share fetched data across both Server and Client Components by combining [`React.cache`](https://react.dev/reference/react/cache) with context providers.

Create a cached function that fetches data:

Create a context provider that stores the promise:

In a layout, pass the promise to the provider without awaiting:

Client Components use [`use()`](https://react.dev/reference/react/use) to resolve the promise from context, wrapped in `<Suspense>` for fallback UI:

Server Components can also call `getUser()` directly:

Since `getUser` is wrapped with `React.cache`, multiple calls within the same request return the same memoized result, whether called directly in Server Components or resolved via context in Client Components.

> **Good to know**: `React.cache` is scoped to the current request only. Each request gets its own memoization scope with no sharing between requests.
