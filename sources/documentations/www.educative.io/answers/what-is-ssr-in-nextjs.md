---
title: "What is SSR in Next.js?"
source_url: "https://www.educative.io/answers/what-is-ssr-in-nextjs"
crawled_at: "2026-08-07T06:00:41.645Z"
---

**Key takeaways:**

-   Server-side rendering (SSR) in Next.js pre-renders pages on the server, enhancing SEO and performance.
    
-   SSR results in faster initial page loads because the HTML is generated on the server and sent to the client fully formed, hence improving user experience
    
-   SSR optimizes content delivery and reduces client-side processing, making it ideal for complex applications.
    
-   Implementing SSR in Next.js is straightforward with the `getServerSideProps` function, which allows developers to fetch data and pre-render the page on each request.
    

### Understanding server-side rendering (SSR) in Next.js

**Server-side rendering** **(SSR)** is a core feature of Next.js, a powerful React framework for building high-performance web applications. SSR refers to rendering web pages on the server before sending them to the client’s browser. This process ensures faster page loads and better SEO.

### Why choose server-side rendering?

In traditional client-side rendering (CSR), the server sends a basic HTML file when a user visits a website. The browser then fetches additional JavaScript files and builds the webpage on the user’s device. This process can be slow, especially on slower internet connections or if the website has complex elements.

> Learn more about rendering strategies like server side rendering in Next.js with this blog: [Understanding rendering in Next.js](https://www.educative.io/blog/rendering-in-nextjs).

**SSR with Next.js** addresses these issues by performing most of the rendering on the server. When a webpage is requested, the server executes JavaScript code, retrieves data from [APIs](https://how.dev/answers/definition-api), and renders the page as complete HTML content. This means that when the server sends the HTML to the client, the webpage is visible immediately without additional processing.

### How does server-side rendering work in Next.js?

[Next.js](https://how.dev/answers/introduction-to-nextjs) simplifies the SSR process with its built-in support. When a page request is made, Next.js invokes the `getServerSideProps` function to fetch data, perform computations, and render the HTML on the server before delivering it to the client.
