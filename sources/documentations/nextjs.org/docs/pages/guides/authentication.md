---
title: "Guides: Authentication"
source_url: "https://nextjs.org/docs/pages/guides/authentication"
crawled_at: "2026-06-25T07:21:49.996Z"
---

## How to implement authentication in Next.js

Last updated

April 22, 2025

Understanding authentication is crucial for protecting your application's data. This page will guide you through what React and Next.js features to use to implement auth.

Before starting, it helps to break down the process into three concepts:

1.  **[Authentication](#authentication)**: Verifies if the user is who they say they are. It requires the user to prove their identity with something they have, such as a username and password.
2.  **[Session Management](#session-management)**: Tracks the user's auth state across requests.
3.  **[Authorization](#authorization)**: Decides what routes and data the user can access.

This diagram shows the authentication flow using React and Next.js features:

![Diagram showing the authentication flow with React and Next.js features](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782372115/aha-mind/docs-crawler/nextjs.org/image_cnrw3e.png)![Diagram showing the authentication flow with React and Next.js features](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782372115/aha-mind/docs-crawler/nextjs.org/image_eneqfm.png)

The examples on this page walk through basic username and password auth for educational purposes. While you can implement a custom auth solution, for increased security and simplicity, we recommend using an authentication library. These offer built-in solutions for authentication, session management, and authorization, as well as additional features such as social logins, multi-factor authentication, and role-based access control. You can find a list in the [Auth Libraries](#auth-libraries) section.

Here are the steps to implement a sign-up and/or login form:

1.  The user submits their credentials through a form.
2.  The form sends a request that is handled by an API route.
3.  Upon successful verification, the process is completed, indicating the user's successful authentication.
4.  If verification is unsuccessful, an error message is shown.

Consider a login form where users can input their credentials:

The form above has two input fields for capturing the user's email and password. On submission, it triggers a function that sends a POST request to an API route (`/api/auth/login`).

You can then call your Authentication Provider's API in the API route to handle authentication:

## Session Management[](#session-management)

Session management ensures that the user's authenticated state is preserved across requests. It involves creating, storing, refreshing, and deleting sessions or tokens.

There are two types of sessions:

1.  [**Stateless**](#stateless-sessions): Session data (or a token) is stored in the browser's cookies. The cookie is sent with each request, allowing the session to be verified on the server. This method is simpler, but can be less secure if not implemented correctly.
2.  [**Database**](#database-sessions): Session data is stored in a database, with the user's browser only receiving the encrypted session ID. This method is more secure, but can be complex and use more server resources.

> **Good to know:** While you can use either method, or both, we recommend using a session management library such as [iron-session](https://github.com/vvo/iron-session) or [Jose](https://github.com/panva/jose).

### Stateless Sessions[](#stateless-sessions)

#### Setting and deleting cookies[](#setting-and-deleting-cookies)

You can use [API Routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) to set the session as a cookie on the server:

### Database Sessions[](#database-sessions)

To create and manage database sessions, you'll need to follow these steps:

1.  Create a table in your database to store session and data (or check if your Auth Library handles this).
2.  Implement functionality to insert, update, and delete sessions
3.  Encrypt the session ID before storing it in the user's browser, and ensure the database and cookie stay in sync (this is optional, but recommended for optimistic auth checks in [Proxy](#optimistic-checks-with-proxy-optional)).

**Creating a Session on the Server**:

## Authorization[](#authorization)

Once a user is authenticated and a session is created, you can implement authorization to control what the user can access and do within your application.

There are two main types of authorization checks:

1.  **Optimistic**: Checks if the user is authorized to access a route or perform an action using the session data stored in the cookie. These checks are useful for quick operations, such as showing/hiding UI elements or redirecting users based on permissions or roles.
2.  **Secure**: Checks if the user is authorized to access a route or perform an action using the session data stored in the database. These checks are more secure and are used for operations that require access to sensitive data or actions.

For both cases, we recommend:

-   Creating a [Data Access Layer](#creating-a-data-access-layer-dal) to centralize your authorization logic
-   Using [Data Transfer Objects (DTO)](#using-data-transfer-objects-dto) to only return the necessary data
-   Optionally use [Proxy](#optimistic-checks-with-proxy-optional) to perform optimistic checks.

### Optimistic checks with Proxy (Optional)[](#optimistic-checks-with-proxy-optional)

There are some cases where you may want to use [Proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) and redirect users based on permissions:

-   To perform optimistic checks. Since Proxy runs on every route, it's a good way to centralize redirect logic and pre-filter unauthorized users.
-   To protect static routes that share data between users (e.g. content behind a paywall).

However, since Proxy runs on every route, including [prefetched](https://nextjs.org/docs/app/getting-started/linking-and-navigating#prefetching) routes, it's important to only read the session from the cookie (optimistic checks), and avoid database checks to prevent performance issues.

For example:

While Proxy can be useful for initial checks, it should not be your only line of defense in protecting your data. The majority of security checks should be performed as close as possible to your data source, see [Data Access Layer](#creating-a-data-access-layer-dal) for more information.

> **Tips**:
> 
> -   In Proxy, you can also read cookies using `req.cookies.get('session')?.value`.
> -   Proxy uses the Node.js runtime, check if your Auth library and session management library are compatible. You may need to use [Middleware](https://github.com/vercel/next.js/blob/v15.5.6/docs/01-app/03-api-reference/03-file-conventions/middleware.mdx) if your Auth library only supports [Edge Runtime](https://nextjs.org/docs/app/api-reference/edge)
> -   You can use the `matcher` property in the Proxy to specify which routes Proxy should run on. Although, for auth, it's recommended Proxy runs on all routes.

### Creating a Data Access Layer (DAL)[](#creating-a-data-access-layer-dal-1)

#### Protecting API Routes[](#protecting-api-routes)

API Routes in Next.js are essential for handling server-side logic and data management. It's crucial to secure these routes to ensure that only authorized users can access specific functionalities. This typically involves verifying the user's authentication status and their role-based permissions.

Here's an example of securing an API Route:

This example demonstrates an API Route with a two-tier security check for authentication and authorization. It first checks for an active session, and then verifies if the logged-in user is an 'admin'. This approach ensures secure access, limited to authenticated and authorized users, maintaining robust security for request processing.

## Resources[](#resources)

Now that you've learned about authentication in Next.js, here are Next.js-compatible libraries and resources to help you implement secure authentication and session management:

### Auth Libraries[](#auth-libraries)

-   [Auth0](https://auth0.com/docs/quickstart/webapp/nextjs)
-   [Better Auth](https://www.better-auth.com/docs/integrations/next)
-   [Clerk](https://clerk.com/docs/quickstarts/nextjs)
-   [Descope](https://docs.descope.com/getting-started/nextjs)
-   [Kinde](https://kinde.com/docs/developer-tools/nextjs-sdk)
-   [Logto](https://docs.logto.io/quick-starts/next-app-router)
-   [NextAuth.js](https://authjs.dev/getting-started/installation?framework=next.js)
-   [Ory](https://www.ory.sh/docs/getting-started/integrate-auth/nextjs)
-   [Stack Auth](https://docs.stack-auth.com/getting-started/setup)
-   [Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
-   [Stytch](https://stytch.com/docs/guides/quickstarts/nextjs)
-   [WorkOS](https://workos.com/docs/user-management/nextjs)

### Session Management Libraries[](#session-management-libraries)

-   [Iron Session](https://github.com/vvo/iron-session)
-   [Jose](https://github.com/panva/jose)

## Further Reading[](#further-reading)

To continue learning about authentication and security, check out the following resources:

-   [How to think about security in Next.js](https://nextjs.org/blog/security-nextjs-server-components-actions)
-   [Understanding XSS Attacks](https://vercel.com/guides/understanding-xss-attacks)
-   [Understanding CSRF Attacks](https://vercel.com/guides/understanding-csrf-attacks)
-   [The Copenhagen Book](https://thecopenhagenbook.com/)
