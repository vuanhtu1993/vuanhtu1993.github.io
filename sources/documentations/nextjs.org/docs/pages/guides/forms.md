---
title: "Guides: Forms"
source_url: "https://nextjs.org/docs/pages/guides/forms"
crawled_at: "2026-06-25T07:22:46.419Z"
---

## How to create forms with API Routes

Last updated

February 24, 2026

Forms enable you to create and update data in web applications. Next.js provides a powerful way to handle data mutations using **API Routes**. This guide will walk you through how to handle form submission on the server.

## Server Forms[](#server-forms)

To handle form submissions on the server, create an API endpoint that securely mutates data.

Then, call the API Route from the client with an event handler:

> **Good to know:**
> 
> -   API Routes [do not specify CORS headers](https://developer.mozilla.org/docs/Web/HTTP/CORS), meaning they are same-origin only by default.
> -   Since API Routes run on the server, we're able to use sensitive values (like API keys) through [Environment Variables](https://nextjs.org/docs/pages/guides/environment-variables) without exposing them to the client. This is critical for the security of your application.

## Form validation[](#form-validation)

We recommend using HTML validation like `required` and `type="email"` for basic client-side form validation.

For more advanced server-side validation, you can use a schema validation library like [zod](https://zod.dev/) to validate the form fields before mutating the data:

### Error handling[](#error-handling)

You can use React state to show an error message when a form submission fails:

## Displaying loading state[](#displaying-loading-state)

You can use React state to show a loading state when a form is submitting on the server:

### Redirecting[](#redirecting)

If you would like to redirect the user to a different route after a mutation, you can [`redirect`](https://nextjs.org/docs/pages/building-your-application/routing/api-routes#response-helpers) to any absolute or relative URL:
