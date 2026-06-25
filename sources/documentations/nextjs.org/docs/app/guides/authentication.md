---
title: "Guides: Authentication"
source_url: "https://nextjs.org/docs/app/guides/authentication"
crawled_at: "2026-06-25T06:57:46.353Z"
---

## How to implement authentication in Next.js

Last updated

June 23, 2026

Understanding authentication is crucial for protecting your application's data. This page will guide you through what React and Next.js features to use to implement auth.

Before starting, it helps to break down the process into three concepts:

1.  **[Authentication](#authentication)**: Verifies if the user is who they say they are. It requires the user to prove their identity with something they have, such as a username and password.
2.  **[Session Management](#session-management)**: Tracks the user's auth state across requests.
3.  **[Authorization](#authorization)**: Decides what routes and data the user can access.

This diagram shows the authentication flow using React and Next.js features:

![Diagram showing the authentication flow with React and Next.js features](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782370669/aha-mind/docs-crawler/nextjs.org/image_n6gdgv.png)![Diagram showing the authentication flow with React and Next.js features](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782370669/aha-mind/docs-crawler/nextjs.org/image_xkqfnx.png)

The examples on this page walk through basic username and password auth for educational purposes. While you can implement a custom auth solution, for increased security and simplicity, we recommend using an authentication library. These offer built-in solutions for authentication, session management, and authorization, as well as additional features such as social logins, multi-factor authentication, and role-based access control. You can find a list in the [Auth Libraries](#auth-libraries) section.

### Sign-up and login functionality[](#sign-up-and-login-functionality)

You can use the [`<form>`](https://react.dev/reference/react-dom/components/form) element with React's [Server Actions](https://nextjs.org/docs/app/getting-started/mutating-data) and `useActionState` to capture user credentials, validate form fields, and call your Authentication Provider's API or database.

Since Server Actions always execute on the server, they provide a secure environment for handling authentication logic.

Here are the steps to implement signup/login functionality:

#### 1\. Capture user credentials[](#1-capture-user-credentials)

To capture user credentials, create a form that invokes a Server Action on submission. For example, a signup form that accepts the user's name, email, and password:

#### 2\. Validate form fields on the server[](#2-validate-form-fields-on-the-server)

Use the Server Action to validate the form fields on the server. If your authentication provider doesn't provide form validation, you can use a schema validation library like [Zod](https://zod.dev/) or [Yup](https://github.com/jquense/yup).

Using Zod as an example, you can define a form schema with appropriate error messages:

To prevent unnecessary calls to your authentication provider's API or database, you can `return` early in the Server Action if any form fields do not match the defined schema.

Back in your `<SignupForm />`, you can use React's `useActionState` hook to display validation errors while the form is submitting:

> **Good to know:**
> 
> -   In React 19, `useFormStatus` includes additional keys on the returned object, like data, method, and action. If you are not using React 19, only the `pending` key is available.
> -   Before mutating data, you should always ensure a user is also authorized to perform the action. See [Authentication and Authorization](#authorization).

#### 3\. Create a user or check user credentials[](#3-create-a-user-or-check-user-credentials)

After validating form fields, you can create a new user account or check if the user exists by calling your authentication provider's API or database.

Continuing from the previous example:

After successfully creating the user account or verifying the user credentials, you can create a session to manage the user's auth state. Depending on your session management strategy, the session can be stored in a cookie or database, or both. Continue to the [Session Management](#session-management) section to learn more.

> **Tips:**
> 
> -   The example above is verbose since it breaks down the authentication steps for the purpose of education. This highlights that implementing your own secure solution can quickly become complex. Consider using an [Auth Library](#auth-libraries) to simplify the process.
> -   To improve the user experience, you may want to check for duplicate emails or usernames earlier in the registration flow. For example, as the user types in a username or the input field loses focus. This can help prevent unnecessary form submissions and provide immediate feedback to the user. You can debounce requests with libraries such as [use-debounce](https://www.npmjs.com/package/use-debounce) to manage the frequency of these checks.

## Session Management[](#session-management)

Session management ensures that the user's authenticated state is preserved across requests. It involves creating, storing, refreshing, and deleting sessions or tokens.

There are two types of sessions:

1.  [**Stateless**](#stateless-sessions): Session data (or a token) is stored in the browser's cookies. The cookie is sent with each request, allowing the session to be verified on the server. This method is simpler, but can be less secure if not implemented correctly.
2.  [**Database**](#database-sessions): Session data is stored in a database, with the user's browser only receiving the encrypted session ID. This method is more secure, but can be complex and use more server resources.

> **Good to know:** While you can use either method, or both, we recommend using a session management library such as [iron-session](https://github.com/vvo/iron-session) or [Jose](https://github.com/panva/jose).

### Stateless Sessions[](#stateless-sessions)

To create and manage stateless sessions, there are a few steps you need to follow:

1.  Generate a secret key, which will be used to sign your session, and store it as an [environment variable](https://nextjs.org/docs/app/guides/environment-variables).
2.  Write logic to encrypt/decrypt session data using a session management library.
3.  Manage cookies using the Next.js [`cookies`](https://nextjs.org/docs/app/api-reference/functions/cookies) API.

In addition to the above, consider adding functionality to [update (or refresh)](#updating-or-refreshing-sessions) the session when the user returns to the application, and [delete](#deleting-the-session) the session when the user logs out.

> **Good to know:** Check if your [auth library](#auth-libraries) includes session management.

#### 1\. Generating a secret key[](#1-generating-a-secret-key)

There are a few ways you can generate secret key to sign your session. For example, you may choose to use the `openssl` command in your terminal:

This command generates a 32-character random string that you can use as your secret key and store in your [environment variables file](https://nextjs.org/docs/app/guides/environment-variables):

You can then reference this key in your session management logic:

#### 2\. Encrypting and decrypting sessions[](#2-encrypting-and-decrypting-sessions)

Next, you can use your preferred [session management library](#session-management-libraries) to encrypt and decrypt sessions. Continuing from the previous example, we'll use [Jose](https://www.npmjs.com/package/jose) (compatible with the [Edge Runtime](https://nextjs.org/docs/app/api-reference/edge)) and React's [`server-only`](https://www.npmjs.com/package/server-only) package to ensure that your session management logic is only executed on the server.

> **Tips**:
> 
> -   The payload should contain the **minimum**, unique user data that'll be used in subsequent requests, such as the user's ID, role, etc. It should not contain personally identifiable information like phone number, email address, credit card information, etc, or sensitive data like passwords.

#### 3\. Setting cookies (recommended options)[](#3-setting-cookies-recommended-options)

To store the session in a cookie, use the Next.js [`cookies`](https://nextjs.org/docs/app/api-reference/functions/cookies) API. The cookie should be set on the server, and include the recommended options:

-   **HttpOnly**: Prevents client-side JavaScript from accessing the cookie.
-   **Secure**: Use https to send the cookie.
-   **SameSite**: Specify whether the cookie can be sent with cross-site requests.
-   **Max-Age or Expires**: Delete the cookie after a certain period.
-   **Path**: Define the URL path for the cookie.

Please refer to [MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies) for more information on each of these options.

Back in your Server Action, you can invoke the `createSession()` function, and use the [`redirect()`](https://nextjs.org/docs/app/guides/redirecting) API to redirect the user to the appropriate page:

> **Tips**:
> 
> -   **Cookies should be set on the server** to prevent client-side tampering.
> -   🎥 Watch: Learn more about stateless sessions and authentication with Next.js → [YouTube (11 minutes)](https://www.youtube.com/watch?v=DJvM2lSPn6w).

#### Updating (or refreshing) sessions[](#updating-or-refreshing-sessions)

You can also extend the session's expiration time. This is useful for keeping the user logged in after they access the application again. For example:

> **Tip:** Check if your auth library supports refresh tokens, which can be used to extend the user's session.

#### Deleting the session[](#deleting-the-session)

To delete the session, you can delete the cookie:

Then you can reuse the `deleteSession()` function in your application, for example, on logout:

### Database Sessions[](#database-sessions)

To create and manage database sessions, you'll need to follow these steps:

1.  Create a table in your database to store session and data (or check if your Auth Library handles this).
2.  Implement functionality to insert, update, and delete sessions
3.  Encrypt the session ID before storing it in the user's browser, and ensure the database and cookie stay in sync (this is optional, but recommended for optimistic auth checks in [Proxy](#optimistic-checks-with-proxy-optional)).

For example:

> **Tips**:
> 
> -   For faster access, you may consider adding server caching for the lifetime of the session. You can also keep the session data in your primary database, and combine data requests to reduce the number of queries.
> -   You may opt to use database sessions for more advanced use cases, such as keeping track of the last time a user logged in, or number of active devices, or give users the ability to log out of all devices.

After implementing session management, you'll need to add authorization logic to control what users can access and do within your application. Continue to the [Authorization](#authorization) section to learn more.

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

### Creating a Data Access Layer (DAL)[](#creating-a-data-access-layer-dal)

We recommend creating a DAL to centralize your data requests and authorization logic.

The DAL should include a function that verifies the user's session as they interact with your application. At the very least, the function should check if the session is valid, then redirect or return the user information needed to make further requests.

For example, create a separate file for your DAL that includes a `verifySession()` function. Then use React's [cache](https://react.dev/reference/react/cache) API to memoize the return value of the function during a React render pass:

You can then invoke the `verifySession()` function in your data requests, Server Actions, Route Handlers:

> **Tip**:
> 
> -   A DAL can be used to protect data fetched at request time. However, for static routes that share data between users, data will be fetched at build time and not at request time. Use [Proxy](#optimistic-checks-with-proxy-optional) to protect static routes.
> -   For secure checks, you can check if the session is valid by comparing the session ID with your database. Use React's [cache](https://react.dev/reference/react/cache) function to avoid unnecessary duplicate requests to the database during a render pass.
> -   You may wish to consolidate related data requests in a JavaScript class that runs `verifySession()` before any methods.

### Using Data Transfer Objects (DTO)[](#using-data-transfer-objects-dto)

When retrieving data, it's recommended you return only the necessary data that will be used in your application, and not entire objects. For example, if you're fetching user data, you might only return the user's ID and name, rather than the entire user object which could contain passwords, phone numbers, etc.

However, if you have no control over the returned data structure, or are working in a team where you want to avoid whole objects being passed to the client, you can use strategies such as specifying what fields are safe to be exposed to the client.

By centralizing your data requests and authorization logic in a DAL and using DTOs, you can ensure that all data requests are secure and consistent, making it easier to maintain, audit, and debug as your application scales.

> **Good to know**:
> 
> -   There are a couple of different ways you can define a DTO, from using `toJSON()`, to individual functions like the example above, or JS classes. Since these are JavaScript patterns and not a React or Next.js feature, we recommend doing some research to find the best pattern for your application.
> -   Learn more about security best practices in our [Security in Next.js article](https://nextjs.org/blog/security-nextjs-server-components-actions).

### Server Components[](#server-components)

Auth check in [Server Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) are useful for role-based access. For example, to conditionally render components based on the user's role:

In the example, we use the `verifySession()` function from our DAL to check for 'admin', 'user', and unauthorized roles. This pattern ensures that each user interacts only with components appropriate to their role.

### Layouts and auth checks[](#layouts-and-auth-checks)

Due to [Partial Rendering](https://nextjs.org/docs/app/getting-started/linking-and-navigating#client-side-transitions), be cautious when doing checks in [Layouts](https://nextjs.org/docs/app/api-reference/file-conventions/layout) as these don't re-render on navigation, meaning the user session won't be checked on every route change.

Instead, you should do the checks close to your data source or the component that'll be conditionally rendered.

For example, consider a shared layout that fetches the user data and displays the user image in a nav. Instead of doing the auth check in the layout, you should fetch the user data (`getUser()`) in the layout and do the auth check in your DAL.

This guarantees that wherever `getUser()` is called within your application, the auth check is performed, and prevents developers forgetting to check the user is authorized to access the data.

#### Auth checks in page components[](#auth-checks-in-page-components)

For example, in a dashboard page, you can verify the user session and fetch the user data:

#### Auth checks in leaf components[](#auth-checks-in-leaf-components)

You can also perform auth checks in leaf components that conditionally render UI elements based on user permissions. For example, a component that displays admin-only actions:

This pattern allows you to show or hide UI elements based on user permissions while ensuring the auth check happens at render time in each component.

> **Good to know:**
> 
> -   A common pattern in SPAs is to `return null` in a layout or a top-level component if a user is not authorized. This pattern is **not recommended** since Next.js applications have multiple entry points, which will not prevent nested route segments and Server Actions from being accessed.
> -   Ensure that any Server Actions called from these components also perform their own authorization checks, as client-side UI restrictions alone are not sufficient for security.

### Server Actions[](#server-actions)

Treat [Server Actions](https://nextjs.org/docs/app/getting-started/mutating-data) with the same security considerations as public-facing API endpoints, and verify if the user is allowed to perform a mutation.

In the example below, we check the user's role before allowing the action to proceed:

### Route Handlers[](#route-handlers)

Treat [Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route) with the same security considerations as public-facing API endpoints, and verify if the user is allowed to access the Route Handler.

For example:

The example above demonstrates a Route Handler with a two-tier security check. It first checks for an active session, and then verifies if the logged-in user is an 'admin'.

## Context Providers[](#context-providers)

Using context providers for auth works due to [interleaving](https://nextjs.org/docs/app/getting-started/server-and-client-components#interleaving-server-and-client-components). However, React `context` is not supported in Server Components, making them only applicable to Client Components.

This works, but any child Server Components will be rendered on the server first, and will not have access to the context provider’s session data:

If session data is needed in Client Components (e.g. for client-side data fetching), use React’s [`taintUniqueValue`](https://react.dev/reference/react/experimental_taintUniqueValue) API to prevent sensitive session data from being exposed to the client.

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
