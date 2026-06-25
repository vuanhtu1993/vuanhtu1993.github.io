---
title: "Testing: Vitest"
source_url: "https://nextjs.org/docs/pages/guides/testing/vitest"
crawled_at: "2026-06-25T07:25:28.982Z"
---

## How to set up Vitest with Next.js

Last updated

April 24, 2025

Vitest and React Testing Library are frequently used together for **Unit Testing**. This guide will show you how to setup Vitest with Next.js and write your first tests.

> **Good to know:** Since `async` Server Components are new to the React ecosystem, Vitest currently does not support them. While you can still run **unit tests** for synchronous Server and Client Components, we recommend using **E2E tests** for `async` components.

## Quickstart[](#quickstart)

You can use `create-next-app` with the Next.js [with-vitest](https://github.com/vercel/next.js/tree/canary/examples/with-vitest) example to quickly get started:

## Manual Setup[](#manual-setup)

To manually set up Vitest, install `vitest` and the following packages as dev dependencies:

Create a `vitest.config.mts|js` file in the root of your project, and add the following options:

For more information on configuring Vitest, please refer to the [Vitest Configuration](https://vitest.dev/config/#configuration) docs.

Then, add a `test` script to your `package.json`:

When you run `npm run test`, Vitest will **watch** for changes in your project by default.

## Creating your first Vitest Unit Test[](#creating-your-first-vitest-unit-test)

Check that everything is working by creating a test to check if the `<Page />` component successfully renders a heading:

## Running your tests[](#running-your-tests)

Then, run the following command to run your tests:

## Additional Resources[](#additional-resources)

You may find these resources helpful:

-   [Next.js with Vitest example](https://github.com/vercel/next.js/tree/canary/examples/with-vitest)
-   [Vitest Docs](https://vitest.dev/guide/)
-   [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
