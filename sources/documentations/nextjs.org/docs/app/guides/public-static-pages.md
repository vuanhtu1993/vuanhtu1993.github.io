---
title: "Guides: Public pages"
source_url: "https://nextjs.org/docs/app/guides/public-static-pages"
crawled_at: "2026-06-25T07:01:28.675Z"
---

## Building public pages

Last updated

June 23, 2026

Public pages show the same content to every user. Common examples include landing pages, marketing pages, and product pages.

Since data is shared, these kind of pages can be [prerendered](https://nextjs.org/docs/app/glossary#prerendering) ahead of time and reused. This leads to faster page loads and lower server costs.

This guide will show you how to build public pages that share data across users.

## Example[](#example)

As an example, we'll build a product list page.

We'll start with a static header, add a product list with async external data, and learn how to render it without blocking the response. Finally, we'll add a user-specific promotion banner without switching the entire page to [dynamic rendering](https://nextjs.org/docs/app/glossary#dynamic-rendering).

You can find the resources used in this example here:

-   [Video](https://youtu.be/F6romq71KtI)
-   [Demo](https://cache-components-public-pages.labs.vercel.dev/)
-   [Code](https://github.com/vercel-labs/cache-components-public-pages)

Let's start with a simple header.

#### Static components[](#static-components)

The `<Header />` component doesn't depend on any inputs that change between requests, such as: external data, request headers, route params, the current time, or random values.

> **Good to know**: If you need to display locale-aware dates or times without a visible flash, see [Preventing flash before hydration](https://nextjs.org/docs/app/guides/preventing-flash-before-hydration).

Since its output never changes and can be determined ahead of time, this kind of component is called a **static** component. With no reason to wait for a request, Next.js can safely **prerender** the page at [build time](https://nextjs.org/docs/app/glossary#build-time).

We can confirm this by running [`next build`](https://nextjs.org/docs/app/api-reference/cli/next#next-build-options).

Notice that the product route is marked as static, even though we didn't add any explicit configuration.

### Step 2: Add the product list[](#step-2-add-the-product-list)

Now, let's fetch and render our product list.

Unlike the header, the product list depends on external data.

#### Dynamic components[](#dynamic-components)

Since this data **can** change over time, the rendered output is no longer guaranteed to be stable. This makes the product list a **dynamic** component.

Without guidance, the framework assumes you want to fetch **fresh** data on every user request. This design choice reflects standard web behavior where a new server request renders the page.

However, if this component is rendered at request time, fetching its data will delay the **entire** route from responding. If we refresh the page, we can see this happen.

Even though the header is rendered instantly, it can't be sent to the browser until the product list has finished fetching.

To protect us from this performance cliff, the first time we **await** this uncached data Next.js shows a [warning](https://nextjs.org/docs/messages/blocking-route): accessing uncached data outside of `<Suspense>` prevents the route from being prerendered.

At this point, we have to decide how to **unblock** the response. Either:

-   [**Cache**](https://nextjs.org/docs/app/glossary#cache-components) the component, so it becomes **stable** and can be prerendered with the rest of the page.
-   [**Stream**](https://nextjs.org/docs/app/glossary#streaming) the component, so it becomes **non-blocking** and the rest of the page doesn't have to wait for it.

In our case, the product catalog is shared across all users, so caching is the right choice.

### Cache components[](#cache-components)

We can mark a function as cacheable using the [`'use cache'`](https://nextjs.org/docs/app/api-reference/directives/use-cache) directive.

This turns it into a [cache component](https://nextjs.org/docs/app/glossary#cache-components). The first time it runs, whatever we return will be cached and reused.

If a cache component's inputs are available **before** the request arrives, it can be prerendered just like a static component.

If we refresh again, we can see the page loads instantly because the cache component doesn't block the response. And, if we run `next build` again, we can confirm the page is still static:

But, pages rarely stay static forever.

Sooner or later, even simple pages need some dynamic content. To demonstrate this, let's add a promotional banner:

Once again, this starts off as dynamic. And as before, introducing blocking behavior triggers a Next.js warning.

Last time, the data was shared, so it could be cached. This time, the promotion depends on request specific inputs like the user's location and A/B tests, so we can't cache our way out of the blocking behavior.

### Partial prerendering[](#partial-prerendering)

Adding dynamic content doesn't mean we have to go back to a fully blocking render. We can unblock the response with streaming.

Next.js supports streaming by default. We can use a [Suspense boundary](https://nextjs.org/docs/app/glossary#suspense-boundary) to tell the framework where to slice the streamed response into _chunks_, and what fallback UI to show while content loads.

The fallback is prerendered alongside the rest of our static and cached content. The inner component streams in later, once its async work completes.

With this change, Next.js can separate prerenderable work from request-time work and the route becomes [partially prerendered](https://nextjs.org/docs/app/glossary#partial-prerendering-ppr).

Again, we can confirm this by running `next build`:

At [**build time**](https://nextjs.org/docs/app/glossary#build-time), most of the page, including the header, product list and promotion fallback, is rendered, cached and pushed to a content delivery network.

At [**request time**](https://nextjs.org/docs/app/glossary#dynamic-rendering), the prerendered part is served instantly from a CDN node close to the user.

In parallel, the user specific promotion is rendered on the server, streamed to the client, and swapped into the fallback slot.

If we refresh the page one last time, we can see most of the page loads instantly, while the dynamic parts stream in as they become available.

### Next steps[](#next-steps)

We've learned how to build mostly static pages that include pockets of dynamic content.

We started with a static page, added async work, and resolved the blocking behavior by caching what could be prerendered, and streaming what couldn't.

In future guides, we'll learn how to:

-   Revalidate prerendered pages or cached data.
-   Create variants of the same page with route params.
-   Create private pages with personalized user data.
