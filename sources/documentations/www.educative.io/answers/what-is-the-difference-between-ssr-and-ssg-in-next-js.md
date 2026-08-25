---
title: "What is the difference between SSR and SSG in Next JS?"
source_url: "https://www.educative.io/answers/what-is-the-difference-between-ssr-and-ssg-in-next-js"
crawled_at: "2026-08-07T06:00:49.207Z"
---

**Key takeaways:**

-   Server-side rendering (SSR) renders pages on the server at each request, while static site generation (SSG) pre-renders pages at build time, providing static HTML.
    
-   SSR is ideal for applications requiring frequently updated data or personalized experiences ensuring that users always see up-to-date content, making SSR a good fit for applications like dashboards, social media feeds, or news updates that rely on dynamic data.
    
-   SSG offers pre-rendered static pages, resulting in faster load times and reduced server load.
    

## What is server-side rendering (SSR) in Next.js?

In Next.js, server-side rendering (SSR) is a process where the server generates HTML content on each request. This means every time a user or crawler requests a page, the server dynamically creates the HTML and sends it to the client. This strategy ensures that the user always sees the most up-to-date content.

Here is how SSR works:

1.  **User requests a site:** The user sends a request to the server for a specific page.
    
2.  **Server creates ready HTML file:** The server fetches necessary data, renders the HTML with that data, and sends the fully rendered HTML page back to the browser.
    
3.  **Browser renders HTML:** The browser displays the HTML content immediately. At this stage, the page is fully rendered, but it is not yet interactive.
    
4.  **Browser downloads JS:** The browser then downloads the JavaScript files necessary for the page.
    
5.  **Browser executes JS:** Once the JavaScript is downloaded, the browser executes it. This process is often referred to as hydration, where the static HTML becomes interactive.
    
6.  **Website is fully interactive:** After the JavaScript is executed, the website is now fully interactive, and the user can interact with the page as expected.
    

### Advantages

1.  **Excellent for SEO:** Since the entire page is rendered server-side, web crawlers can easily index the site, boosting your SEO performance.
    
2.  **Frequently updated data:** [SSR](https://how.dev/answers/what-is-ssr-in-nextjs) is ideal for applications that require fresh data on every request, such as e-commerce sites or news platforms.
    

> Get hands-on experence with SSR with our [Build a Multi-Tenant E-Commerce App with Next.js and Firebase](https://www.educative.io/projects/build-multi-tenant-e-commerce-app-with-nextjs-and-firebase) project.

### Disadvantages

1.  **Increased time to first nyte (TTFB):** Generating the HTML for each request can lead to delays before the page is visible to the user, especially under high traffic.
    
2.  **Higher server load:** Every request generates a new HTML page, increasing the server load and potentially requiring more resources.
    

### Example

The `getServerSideProps` function in Next.js is an SSR method that enables data fetching on each request. This means the data is retrieved, and the page is rendered on the server before being sent to the client. Let's look at an example of this:

```
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

export async function getServerSideProps() {
  // Simulate dynamic data generation
  const randomUser = getRandomUser();

  return {
    props: {
      randomUser,
    }
  };
}

function SSRPage({ randomUser }) {
  // Render data...
  return (
    <div>
      <h1>Sample Data:</h1>
      <pre>{JSON.stringify(randomUser, null, 2)}</pre>
    </div>
  );
}

export default SSRPage;
```

SSR example

#### Explanation

-   **Lines 4–12:** We define a function `getRandomUser`, which simulates dynamic data generation by selecting a random user from a predefined list of users. Each user has an `id`, `name`, and `email`.
    
-   **Lines 14–23:** We define the `getServerSideProps` function, which runs on the server for every request. This function calls `getRandomUser` to retrieve a random user object.
    
-   **Lines 25–33:** The `SSRPage` component receives the `randomUser` prop and renders the user data in a JSON format within a `<pre>` tag for easy readability.
    

### Use cases for SSR

-   SSR is suitable for applications requiring frequently updated data, personalization, or SEO optimization.
    
-   It is ideal for pages with frequently changing content or user-specific data.
    

## What is static site generation (SSG) in Next.js?

[Static site generation (SSG)](https://how.dev/answers/what-is-ssg-in-nextjs) involves generating the HTML pages at build time, meaning the server generates the HTML once and uses the same HTML for every request. This technique is beneficial when dealing with sites where content changes infrequently.

Here is how SSG works:

-   **User requests a site:** The user’s browser sends a request to the server for a specific page.
    
-   **Server sends pre-built static HTML file with JS resources:** The server responds with a pre-rendered static HTML file, which is generated at build time, along with any required JavaScript and CSS files.
    
-   **Browser renders HTML and downloads JS:** The browser immediately renders the static HTML content. Simultaneously, it starts downloading the linked JavaScript files.
    
-   **User sees the fully rendered static page:** The user immediately sees a fully rendered static page because the HTML is pre-generated. However, at this point, the page might not be interactive (e.g., buttons might not work, or dynamic content might not update).
    
-   **Browser executes JS and hydrates the page:** After the JavaScript files are downloaded, the browser executes them. Via hydration, the JavaScript takes over the static HTML and attaches interactivity to the elements.
    
-   **Website is fully interactive:** After hydration, the static page becomes fully interactive. Now, the user can interact with dynamic elements like forms, buttons, and other interactive features.
    

### Advantages

1.  **Fast loading times:** Pre-generated HTML files are served instantly, resulting in quicker page loads.
    
2.  **Lower server load:** Since the server doesn’t need to generate a page for each request, it can handle more traffic efficiently.
    

> Try out this project, [Build a Digital Library Using Gatsby and GraphQL](https://www.educative.io/projects/build-a-digital-library-using-gatsby-and-graphql) for hands-on SSG experience.

### Disadvantages

1.  **Build time:** For sites with thousands of pages, the build process can be time-consuming.
    
2.  **Data freshness:** Content changes require rebuilding the site, which can be cumbersome for frequently updated sites. However, using Incremental Static Regeneration (ISR) can mitigate this issue.
    

### Example

The `getStaticProps` function is used to generate static pages at build time. It runs only on the server during the build process. Let's look at an example of this:

```
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
    }
  };
}

function SSGPage({ randomUser }) {
  // Render data...
  return (
    <div>
      <h1>Sample Data:</h1>
      <pre>{JSON.stringify(randomUser, null, 2)}</pre>
    </div>
  );
}

export default SSGPage;
```

SSG example

#### Explanation:

-   **Lines 4–12:** We define a function `getRandomUser`, which simulates dynamic data generation by selecting a random user from a predefined list of users. Each user has an `id`, `name`, and `email`.
    
-   **Lines 14–23:** We define the `getStaticProps` function, which runs at build time to generate static content. This function calls `getRandomUser` to retrieve a random user object.
    
-   **Lines 25–33:** The `SSGPage` component receives the `randomUser` prop and renders the user data in a JSON format within a `<pre>` tag for easy readability.
    

### Use cases

-   SSG is suitable for content-heavy websites, blogs, and marketing pages with relatively static content.
    
-   It is ideal for sites that don't require frequently updated data updates for every user visit.
    

> Learn more about rendering strategies in Next.js with this blog: [Understanding Rendering in Next.js](https://www.educative.io/blog/rendering-in-nextjs).

Let's now look at a comparison table for SSR vs. SSG in Next.js:

## Frequently asked questions

Haven’t found what you were looking for? [Contact Us](mailto:support@educative.io)

Relevant Answers

Explore Courses

Free Resources

Copyright ©2026 Educative, Inc. All rights reserved
