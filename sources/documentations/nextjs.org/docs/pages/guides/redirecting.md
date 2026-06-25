---
title: "Guides: Redirecting"
source_url: "https://nextjs.org/docs/pages/guides/redirecting"
crawled_at: "2026-06-25T07:24:29.089Z"
---

## How to handle redirects in Next.js

Last updated

May 27, 2025

There are a few ways you can handle redirects in Next.js. This page will go through each available option, use cases, and how to manage large numbers of redirects.

| API | Purpose | Where | Status Code |
| --- | --- | --- | --- |
| [`useRouter`](#userouter-hook) | Perform a client-side navigation | Components | N/A |
| [`redirects` in `next.config.js`](#redirects-in-nextconfigjs) | Redirect an incoming request based on a path | `next.config.js` file | 307 (Temporary) or 308 (Permanent) |
| [`NextResponse.redirect`](#nextresponseredirect-in-proxy) | Redirect an incoming request based on a condition | Proxy | Any |

## `useRouter()` hook[](#userouter-hook)

If you need to redirect inside a component, you can use the `push` method from the `useRouter` hook. For example:

> **Good to know**:
> 
> -   If you don't need to programmatically navigate a user, you should use a [`<Link>`](https://nextjs.org/docs/app/api-reference/components/link) component.

See the [`useRouter` API reference](https://nextjs.org/docs/pages/api-reference/functions/use-router) for more information.

## `redirects` in `next.config.js`[](#redirects-in-nextconfigjs)

The `redirects` option in the `next.config.js` file allows you to redirect an incoming request path to a different destination path. This is useful when you change the URL structure of pages or have a list of redirects that are known ahead of time.

`redirects` supports [path](https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects#path-matching), [header, cookie, and query matching](https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects#header-cookie-and-query-matching), giving you the flexibility to redirect users based on an incoming request.

To use `redirects`, add the option to your `next.config.js` file:

See the [`redirects` API reference](https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects) for more information.

> **Good to know**:
> 
> -   `redirects` can return a 307 (Temporary Redirect) or 308 (Permanent Redirect) status code with the `permanent` option.
> -   `redirects` may have a limit on platforms. For example, on Vercel, there's a limit of 1,024 redirects. To manage a large number of redirects (1000+), consider creating a custom solution using [Proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy). See [managing redirects at scale](#managing-redirects-at-scale-advanced) for more.
> -   `redirects` runs **before** Proxy.

## `NextResponse.redirect` in Proxy[](#nextresponseredirect-in-proxy)

Proxy allows you to run code before a request is completed. Then, based on the incoming request, redirect to a different URL using `NextResponse.redirect`. This is useful if you want to redirect users based on a condition (e.g. authentication, session management, etc) or have [a large number of redirects](#managing-redirects-at-scale-advanced).

For example, to redirect the user to a `/login` page if they are not authenticated:

> **Good to know**:
> 
> -   Proxy runs **after** `redirects` in `next.config.js` and **before** rendering.

See the [Proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) documentation for more information.

## Managing redirects at scale (advanced)[](#managing-redirects-at-scale-advanced)

To manage a large number of redirects (1000+), you may consider creating a custom solution using Proxy. This allows you to handle redirects programmatically without having to redeploy your application.

To do this, you'll need to consider:

1.  Creating and storing a redirect map.
2.  Optimizing data lookup performance.

> **Next.js Example**: See our [Proxy with Bloom filter](https://redirects-bloom-filter.vercel.app/) example for an implementation of the recommendations below.

### 1\. Creating and storing a redirect map[](#1-creating-and-storing-a-redirect-map)

A redirect map is a list of redirects that you can store in a database (usually a key-value store) or JSON file.

Consider the following data structure:

In [Proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy), you can read from a database such as Vercel's [Edge Config](https://vercel.com/docs/edge-config/get-started) or [Redis](https://vercel.com/docs/redis), and redirect the user based on the incoming request:

### 2\. Optimizing data lookup performance[](#2-optimizing-data-lookup-performance)

Reading a large dataset for every incoming request can be slow and expensive. There are two ways you can optimize data lookup performance:

-   Use a database that is optimized for fast reads
-   Use a data lookup strategy such as a [Bloom filter](https://en.wikipedia.org/wiki/Bloom_filter) to efficiently check if a redirect exists **before** reading the larger redirects file or database.

Considering the previous example, you can import a generated bloom filter file into Proxy, then, check if the incoming request pathname exists in the bloom filter.

If it does, forward the request to a [API Routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) which will check the actual file and redirect the user to the appropriate URL. This avoids importing a large redirects file into Proxy, which can slow down every incoming request.

Then, in the API Route:

> **Good to know:**
> 
> -   To generate a bloom filter, you can use a library like [`bloom-filters`](https://www.npmjs.com/package/bloom-filters).
> -   You should validate requests made to your Route Handler to prevent malicious requests.
