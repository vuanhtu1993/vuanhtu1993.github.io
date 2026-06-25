---
title: "Testing: Jest"
source_url: "https://nextjs.org/docs/pages/guides/testing/jest"
crawled_at: "2026-06-25T07:25:16.999Z"
---

## How to set up Jest with Next.js

Last updated

April 24, 2025

Jest and React Testing Library are frequently used together for **Unit Testing** and **Snapshot Testing**. This guide will show you how to set up Jest with Next.js and write your first tests.

> **Good to know:** Since `async` Server Components are new to the React ecosystem, Jest currently does not support them. While you can still run **unit tests** for synchronous Server and Client Components, we recommend using an **E2E tests** for `async` components.

## Quickstart[](#quickstart)

You can use `create-next-app` with the Next.js [with-jest](https://github.com/vercel/next.js/tree/canary/examples/with-jest) example to quickly get started:

## Manual setup[](#manual-setup)

Since the release of [Next.js 12](https://nextjs.org/blog/next-12), Next.js now has built-in configuration for Jest.

To set up Jest, install `jest` and the following packages as dev dependencies:

Generate a basic Jest configuration file by running the following command:

This will take you through a series of prompts to setup Jest for your project, including automatically creating a `jest.config.ts|js` file.

Update your config file to use `next/jest`. This transformer has all the necessary configuration options for Jest to work with Next.js:

Under the hood, `next/jest` is automatically configuring Jest for you, including:

-   Setting up `transform` using the [Next.js Compiler](https://nextjs.org/docs/architecture/nextjs-compiler).
-   Auto mocking stylesheets (`.css`, `.module.css`, and their scss variants), image imports and [`next/font`](https://nextjs.org/docs/app/api-reference/components/font).
-   Loading `.env` (and all variants) into `process.env`.
-   Ignoring `node_modules` from test resolving and transforms.
-   Ignoring `.next` from test resolving.
-   Loading `next.config.js` for flags that enable SWC transforms.

> **Good to know**: To test environment variables directly, load them manually in a separate setup script or in your `jest.config.ts` file. For more information, please see [Test Environment Variables](https://nextjs.org/docs/app/guides/environment-variables#test-environment-variables).

## Setting up Jest (with Babel)[](#setting-up-jest-with-babel)

If you opt out of the [Next.js Compiler](https://nextjs.org/docs/architecture/nextjs-compiler) and use Babel instead, you will need to manually configure Jest and install `babel-jest` and `identity-obj-proxy` in addition to the packages above.

Here are the recommended options to configure Jest for Next.js:

You can learn more about each configuration option in the [Jest docs](https://jestjs.io/docs/configuration). We also recommend reviewing [`next/jest` configuration](https://github.com/vercel/next.js/blob/e02fe314dcd0ae614c65b505c6daafbdeebb920e/packages/next/src/build/jest/jest.ts) to see how Next.js configures Jest.

### Handling stylesheets and image imports[](#handling-stylesheets-and-image-imports)

Stylesheets and images aren't used in the tests but importing them may cause errors, so they will need to be mocked.

Create the mock files referenced in the configuration above - `fileMock.js` and `styleMock.js` - inside a `__mocks__` directory:

For more information on handling static assets, please refer to the [Jest Docs](https://jestjs.io/docs/webpack#handling-static-assets).

## Handling Fonts[](#handling-fonts)

To handle fonts, create the `nextFontMock.js` file inside the `__mocks__` directory, and add the following configuration:

## Optional: Handling Absolute Imports and Module Path Aliases[](#optional-handling-absolute-imports-and-module-path-aliases)

If your project is using [Module Path Aliases](https://nextjs.org/docs/app/getting-started/installation#set-up-absolute-imports-and-module-path-aliases), you will need to configure Jest to resolve the imports by matching the paths option in the `jsconfig.json` file with the `moduleNameMapper` option in the `jest.config.js` file. For example:

## Optional: Extend Jest with custom matchers[](#optional-extend-jest-with-custom-matchers)

`@testing-library/jest-dom` includes a set of convenient [custom matchers](https://github.com/testing-library/jest-dom#custom-matchers) such as `.toBeInTheDocument()` making it easier to write tests. You can import the custom matchers for every test by adding the following option to the Jest configuration file:

Then, inside `jest.setup`, add the following import:

> **Good to know:** [`extend-expect` was removed in `v6.0`](https://github.com/testing-library/jest-dom/releases/tag/v6.0.0), so if you are using `@testing-library/jest-dom` before version 6, you will need to import `@testing-library/jest-dom/extend-expect` instead.

If you need to add more setup options before each test, you can add them to the `jest.setup` file above.

## Add a test script to `package.json`[](#add-a-test-script-to-packagejson)

Finally, add a Jest `test` script to your `package.json` file:

`jest --watch` will re-run tests when a file is changed. For more Jest CLI options, please refer to the [Jest Docs](https://jestjs.io/docs/cli#reference).

### Creating your first test[](#creating-your-first-test)

Your project is now ready to run tests. Create a folder called `__tests__` in your project's root directory.

For example, we can add a test to check if the `<Home />` component successfully renders a heading:

Optionally, add a [snapshot test](https://jestjs.io/docs/snapshot-testing) to keep track of any unexpected changes in your component:

> **Good to know**: Test files should not be included inside the Pages Router because any files inside the Pages Router are considered routes.

## Running your tests[](#running-your-tests)

Then, run the following command to run your tests:

## Additional Resources[](#additional-resources)

For further reading, you may find these resources helpful:

-   [Next.js with Jest example](https://github.com/vercel/next.js/tree/canary/examples/with-jest)
-   [Jest Docs](https://jestjs.io/docs/getting-started)
-   [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
-   [Testing Playground](https://testing-playground.com/) - use good testing practices to match elements.
