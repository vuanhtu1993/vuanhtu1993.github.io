---

title: "What is Next JS Incremental Static Regeneration (ISR)?"
source_url: "https://www.educative.io/answers/what-is-next-js-incremental-static-regeneration-isr"
crawled_at: "2026-08-07T06:00:23.052Z"
--------------------------------------

**Key takeaways:**

- Incremental Static Regeneration (ISR) in Next.js allows developers to update static pages after they have been built. This means that static pages can be re-generated on demand when a certain condition is met.
- ISR combines the advantages of static and server-rendered content, enabling dynamic pages to be updated with fresh data while still maintaining the performance benefits of static generation.
- Real-world use cases for ISR include news websites and e-commerce platforms, where content is updated frequently, but performance and SEO are critical. For instance, news articles can be regenerated with the latest information without sacrificing user experience.
- ISR improves both performance and SEO by incrementally revalidating static content. By regenerating only specific pages rather than the entire site, ISR ensures that content remains fresh.
- Implementing ISR in Next.js is done through the `getStaticProps` function with the `revalidate` option. This combination allows one to define how often a page should be re-generated, providing control over how frequently content is updated based on the application's needs.

Next.js is a popular open-source React framework created by Vercel for building server-rendered and static websites. It allows for server-side rendering (SSR), static site generation (SSG), and client-side rendering (CSR). One of the powerful features introduced in Next.js is Incremental Static Regeneration (ISR) which allows for incremental updates to static content without the need for a full site rebuild.

### Why use Incremental Static Regeneration in Next.js?

To understand the need for ISR, let’s briefly revisit the rendering strategies supported by [Next.js](https://how.dev/answers/introduction-to-nextjs)—[SSR](https://how.dev/answers/what-is-ssr-in-nextjs), [SSG](https://how.dev/answers/what-is-ssg-in-nextjs), and [CSR](https://how.dev/answers/what-is-client-side-rendering-in-next-js).

- **Server-side rendering (SSR):** With SSR, every request leads to a server-side render of the page, meaning the page is built on demand. This provides the most up-to-date content but can put a lot of strain on your server and slow down response times as traffic increases.
- **Static site generation (SSG):** With SSG, pages are built at build time and reused for each request, allowing for excellent performance and low server loads. However, content updates require a full site rebuild, making it less suitable for frequently updated content.
- **Client-side rendering (CSR):** CSR is when the rendering occurs in the client’s browser. While it offers interactive websites and robust client-side functionality, it can lead to slow initial load times.

Each of these methods has its advantages and drawbacks, but what if you could combine the benefits of SSR and SSG? That’s where ISR comes into play.

> To get a hands on experince on Next.js rendering techniques, refer to the [Build a Music Sharing App with Next.js and the MERN Stack](https://www.educative.io/projects/build-a-music-sharing-app-with-nextjs-and-the-mern-stack) project.

### How Incremental Static Regeneration (ISR) works in Next.js

**ISR** is a feature introduced in Next.js that allows you to create static pages that are updated incrementally after they’ve been generated, combining the benefits of SSG and SSR. It allows static content to be updated over time, rather than needing a full rebuild of the site like in traditional SSG. Here’s how it works:

1. **On initial request:** The page is generated on-demand, just like SSR. However, the rendered page is then cached and served to subsequent users, like SSG. This allows every future visitor to see the page instantly.
2. **On subsequent requests:** The server sends the cached (static) page to the user. In the background, Next.js checks if the page is due for regeneration. If it is, Next.js regenerates the page server-side, and the newly generated page replaces the old page in the [cache](https://how.dev/answers/what-is-cache).

The primary advantage of this approach is that your users never have to wait for the page to build. They either get the cached page instantly or an updated page if it has already been regenerated. If it's the first time, the page will be generated on-demand.
![Increamental static rendering](https://res.cloudinary.com/dv3vzmogk/image/upload/v1786083039/aha-mind-blog-crawler/5770561725005824_uxkjqp.svg)

This strategy is perfect for pages that need to display somewhat dynamic data but don’t need to be updated with every single request. With ISR, your users get the speed of a static site with the flexibility of server-rendered content.

### Key benefits of Incremental Static Regeneration (ISR)

Let's look at some of the key benefits of ISR:

1. By regenerating pages on demand, you avoid the overhead of rebuilding the entire app, leading to faster build times.
2. Since ISR serves static pages, it’s ideal for improving SEO, as search engines can crawl static content.
3. Users get the benefits of static pages (quick load times), while the content is always kept up-to-date.
4. ISR scales well for applications with large datasets or frequently changing content, like blogs, e-commerce sites, or news websites.

> Learn more about ISR and other rendering strategies in Next.js with this blog, [Understanding data fetching in Next.js](https://www.educative.io/blog/data-fetching-nextjs).

### Common use cases of ISR

- **News websites**: Imagine a news website that publishes the latest news stories throughout the day. Using Incremental Static Regeneration, the website can generate static pages for each news article at build time. When a new story is added, or an existing one is updated, ISR regenerates the specific page without rebuilding the entire site. This approach ensures that visitors always receive the latest content while keeping server load and build times to a minimum.
- **E-commerce websites**: Another example is an e-commerce website where product information, such as pricing and availability, changes frequently, but other data does not change as often. Using ISR, the site can update specific product pages without a full rebuild, providing an optimal balance between performance and data freshness.

### Limitations

Here are the limitations of Incremental Static Regeneration (ISR):

- Not suitable for real-time data updates.
- Build time delay can lead to slower initial responses.
- Inconsistent data freshness during the revalidation window.
- Complex cache management.
- Resource-intensive for high-traffic websites.
- Limited support for non-event-based database updates.
- Not ideal for pages with varying user-specific content.
- Not suitable for complex client-side interactions.

> Want to build something interactive? Try this project: [Build an Interactive E-Library Using Next.js and Tailwind](https://www.educative.io/projects/build-an-interactive-e-library-using-nextjs-and-tailwind).

### Implementation

Implementing ISR in Next.js is straightforward because of the `getStaticProps` function and the `revalidate` property. The `getStaticProps` function is used to fetch the data needed for pre-rendering and the `revalidate` property specifies how often (in seconds) a page revalidation should occur.

Let's look at a simple example of this:

```
// pages/index.js
import React from 'react';

// Used to simulate dynamic data
function getRandomUser() {
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Doe', email: 'jane@example.com' },
    { id: 3, name: 'Alice Smith', email: 'alice@example.com' },
    { id: 4, name: 'Bob Johnson', email: 'bob@example.com' },
  ];
  
  return users[Math.floor(Math.random() * users.length)];
}

export async function getStaticProps() {
  // Simulate dynamic data generation
  const randomUser = getRandomUser();

  return {
    props: {
      randomUser,
    },
    revalidate: 2, // Page will attempt regeneration every 2 seconds
  };
}

function Page({ randomUser }) {
  // Render data...
  return (
    <div>
      <h1>Sample Data:</h1>
      <pre>{JSON.stringify(randomUser, null, 2)}</pre>
    </div>
  );
}

export default Page;
```

Implementation of ISR in Next.js

In this example, `getStaticProps` simulates dynamic data generation by returning a randomly selected user from a predefined list using the `getRandomUser` function. The selected user is passed as props to the component. The `revalidate` property is set to `2`, meaning the page will attempt to regenerate every `2` seconds if there are requests during that period. On each regeneration, a new random user may be displayed.

> **Note:** Open the application in the browser and refresh after `2` seconds to see the data of a new random user on the page.

### Continue learning Next.js

Explore these projects for hands-on practice of rendering in Next.js:

- [Product Review and Feedback System Using Next.js](https://www.educative.io/projects/product-review-and-feedback-system-using-nextjs)
- [Next.js Internationalization: Building a Multilingual Blog App](https://www.educative.io/projects/nextjs-internationalization-building-a-multilingual-blog-app)

## Frequently asked questions

Haven’t found what you were looking for? [Contact Us](mailto:support@educative.io)

Relevant Answers

Explore Courses

Free Resources

Copyright ©2026 Educative, Inc. All rights reserved
