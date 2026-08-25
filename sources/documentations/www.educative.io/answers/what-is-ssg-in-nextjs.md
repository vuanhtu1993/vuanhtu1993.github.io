---
title: "What is SSG in Next.js?"
source_url: "https://www.educative.io/answers/what-is-ssg-in-nextjs"
crawled_at: "2026-08-07T06:00:35.105Z"
---

Server-side generation (SSG) is a technique used in [Next.js](https://how.dev/answers/introduction-to-nextjs) to generate HTML pages at build time. It allows developers to pre-render pages on the server and deliver them as static HTML files to the client. This strategy has many advantages, including improved performance, search engine optimization (SEO), and better user experience.

### Advantages of using SSG in Next.js:

-   **Improved performance:** SSG generates static HTML pages, which CDN serves and caches, enhances performance, and loads pages faster.
    
-   **Better user experience:** Instantly available HTML content reduces the time to the first byte, enabling users to see meaningful content quickly and enhancing their overall experience.
    
-   **Reduced server load:** It results in better scalability and cost efficiency as the server is not required to render pages for each request with SSG.
    

### Working

When we use SSG in our Next.js application, export the function `getStaticProps` from the desired page. Next.js recognizes this function during the build process and generates the page using SSG. By returning a props object from the `getStaticProps` function, we can also pass props directly to the client-side page.

For standard pages with a single route, solely implementing `getStaticProps` is sufficient.
