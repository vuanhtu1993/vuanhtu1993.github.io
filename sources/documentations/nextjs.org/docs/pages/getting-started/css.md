---
title: "Getting Started: CSS"
source_url: "https://nextjs.org/docs/pages/getting-started/css"
crawled_at: "2026-06-25T07:21:24.995Z"
---

## How to use CSS in your application

Last updated

August 6, 2025

Next.js provides several ways to style your application using CSS, including:

-   [Tailwind CSS](#tailwind-css)
-   [CSS Modules](#css-modules)
-   [Global CSS](#global-css)
-   [External Stylesheets](#external-stylesheets)
-   [Sass](https://nextjs.org/docs/app/guides/sass)
-   [CSS-in-JS](https://nextjs.org/docs/app/guides/css-in-js)

## Tailwind CSS[](#tailwind-css)

[Tailwind CSS](https://tailwindcss.com/) is a utility-first CSS framework that provides low-level utility classes to build custom designs.

Install Tailwind CSS:

Add the PostCSS plugin to your `postcss.config.mjs` file:

Import Tailwind in your global CSS file:

Import the CSS file in your `pages/_app.js` file:

Now you can start using Tailwind's utility classes in your application:

> **Good to know:** If you need broader browser support for very old browsers, see the [Tailwind CSS v3 setup instructions](https://nextjs.org/docs/app/guides/tailwind-v3-css).

## CSS Modules[](#css-modules)

CSS Modules locally scope CSS by generating unique class names. This allows you to use the same class in different files without worrying about naming collisions.

To start using CSS Modules, create a new file with the extension `.module.css` and import it into any component inside the `pages` directory:

## Global CSS[](#global-css)

You can use global CSS to apply styles across your application.

Import the stylesheet in the `pages/_app.js` file to apply the styles to **every route** in your application:

Due to the global nature of stylesheets, and to avoid conflicts, you should import them inside [`pages/_app.js`](https://nextjs.org/docs/pages/building-your-application/routing/custom-app).

## External stylesheets[](#external-stylesheets)

Next.js allows you to import CSS files from a JavaScript file. This is possible because Next.js extends the concept of [`import`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/import) beyond JavaScript.

### Import styles from `node_modules`[](#import-styles-from-node_modules)

Since Next.js **9.5.4**, importing a CSS file from `node_modules` is permitted anywhere in your application.

For global stylesheets, like `bootstrap` or `nprogress`, you should import the file inside `pages/_app.js`. For example:

To import CSS required by a third-party component, you can do so in your component. For example:

## Ordering and Merging[](#ordering-and-merging)

Next.js optimizes CSS during production builds by automatically chunking (merging) stylesheets. The **order of your CSS** depends on the **order you import styles in your code**.

For example, `base-button.module.css` will be ordered before `page.module.css` since `<BaseButton>` is imported before `page.module.css`:

### Recommendations[](#recommendations)

To keep CSS ordering predictable:

-   Try to contain CSS imports to a single JavaScript or TypeScript entry file
-   Import global styles and Tailwind stylesheets in the root of your application.
-   **Use Tailwind CSS** for most styling needs as it covers common design patterns with utility classes.
-   Use CSS Modules for component-specific styles when Tailwind utilities aren't sufficient.
-   Use a consistent naming convention for your CSS modules. For example, using `<name>.module.css` over `<name>.tsx`.
-   Extract shared styles into shared components to avoid duplicate imports.
-   Turn off linters or formatters that auto-sort imports like ESLint’s [`sort-imports`](https://eslint.org/docs/latest/rules/sort-imports).
-   You can use the [`cssChunking`](https://nextjs.org/docs/app/api-reference/config/next-config-js/cssChunking) option in `next.config.js` to control how CSS is chunked.

## Development vs Production[](#development-vs-production)

-   In development (`next dev`), CSS updates apply instantly with [Fast Refresh](https://nextjs.org/docs/architecture/fast-refresh).
-   In production (`next build`), all CSS files are automatically concatenated into **many minified and code-split** `.css` files, ensuring the minimal amount of CSS is loaded for a route.
-   CSS still loads with JavaScript disabled in production, but JavaScript is required in development for Fast Refresh.
-   CSS ordering can behave differently in development, always ensure to check the build (`next build`) to verify the final CSS order.
