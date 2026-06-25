---
title: "Guides: MDX"
source_url: "https://nextjs.org/docs/app/guides/mdx"
crawled_at: "2026-06-25T06:59:48.990Z"
---

## How to use markdown and MDX in Next.js

Last updated

June 23, 2026

[Markdown](https://daringfireball.net/projects/markdown/syntax) is a lightweight markup language used to format text. It allows you to write using plain text syntax and convert it to structurally valid HTML. It's commonly used for writing content on websites and blogs.

You write...

Output:

[MDX](https://mdxjs.com/) is a superset of markdown that lets you write [JSX](https://react.dev/learn/writing-markup-with-jsx) directly in your markdown files. It is a powerful way to add dynamic interactivity and embed React components within your content.

Next.js can support both local MDX content inside your application, as well as remote MDX files fetched dynamically on the server. The Next.js plugin handles transforming markdown and React components into HTML, including support for usage in Server Components (the default in App Router).

> **Good to know**: View the [Portfolio Starter Kit](https://vercel.com/templates/next.js/portfolio-starter-kit) template for a complete working example.

## Install dependencies[](#install-dependencies)

The `@next/mdx` package, and related packages, are used to configure Next.js so it can process markdown and MDX. **It sources data from local files**, allowing you to create pages with a `.md` or `.mdx` extension, directly in your `/pages` or `/app` directory.

Install these packages to render MDX with Next.js:

## Configure `next.config.mjs`[](#configure-nextconfigmjs)

Update the `next.config.mjs` file at your project's root to configure it to use MDX:

This allows `.mdx` files to act as pages, routes, or imports in your application.

### Handling `.md` files[](#handling-md-files)

By default, `next/mdx` only compiles files with the `.mdx` extension. To handle `.md` files with webpack, update the `extension` option:

## Add an `mdx-components.tsx` file[](#add-an-mdx-componentstsx-file)

Create an `mdx-components.tsx` (or `.js`) file in the root of your project to define global MDX Components. For example, at the same level as `pages` or `app`, or inside `src` if applicable.

> **Good to know**:
> 
> -   `mdx-components.tsx` is **required** to use `@next/mdx` with App Router and will not work without it.
> -   Learn more about the [`mdx-components.tsx` file convention](https://nextjs.org/docs/app/api-reference/file-conventions/mdx-components).
> -   Learn how to [use custom styles and components](#using-custom-styles-and-components).

## Rendering MDX[](#rendering-mdx)

You can render MDX using Next.js's file based routing or by importing MDX files into other pages.

### Using file based routing[](#using-file-based-routing)

When using file based routing, you can use MDX pages like any other page.

In App Router apps, that includes being able to use [metadata](https://nextjs.org/docs/app/getting-started/metadata-and-og-images).

Create a new MDX page within the `/app` directory:

You can use MDX in these files, and even import React components, directly inside your MDX page:

Navigating to the `/mdx-page` route should display your rendered MDX page.

### Using imports[](#using-imports)

Create a new page within the `/app` directory and an MDX file wherever you'd like:

You can use MDX in these files, and even import React components, directly inside your MDX page:

Import the MDX file inside the page to display the content:

Navigating to the `/mdx-page` route should display your rendered MDX page.

### Using dynamic imports[](#using-dynamic-imports)

You can import dynamic MDX components instead of using filesystem routing for MDX files.

For example, you can have a dynamic route segment which loads MDX components from a separate directory:

![Route segments for dynamic MDX components](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782370794/aha-mind/docs-crawler/nextjs.org/image_mdxjts.png)![Route segments for dynamic MDX components](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782370794/aha-mind/docs-crawler/nextjs.org/image_jgnhqy.png)

[`generateStaticParams`](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) can be used to prerender the provided routes. By marking `dynamicParams` as `false`, accessing a route not defined in `generateStaticParams` will 404.

> **Good to know**: Ensure you specify the `.mdx` file extension in your import. While it is not required to use [module path aliases](https://nextjs.org/docs/app/getting-started/installation#set-up-absolute-imports-and-module-path-aliases) (e.g., `@/content`), it does simplify your import path.

## Using custom styles and components[](#using-custom-styles-and-components)

Markdown, when rendered, maps to native HTML elements. For example, writing the following markdown:

Generates the following HTML:

To style your markdown, you can provide custom components that map to the generated HTML elements. Styles and components can be implemented globally, locally, and with shared layouts.

### Global styles and components[](#global-styles-and-components)

Adding styles and components in `mdx-components.tsx` will affect _all_ MDX files in your application.

### Local styles and components[](#local-styles-and-components)

You can apply local styles and components to specific pages by passing them into imported MDX components. These will merge with and override [global styles and components](#global-styles-and-components).

### Shared layouts[](#shared-layouts)

To share a layout across MDX pages, you can use the [built-in layouts support](https://nextjs.org/docs/app/api-reference/file-conventions/layout) with the App Router.

### Using Tailwind typography plugin[](#using-tailwind-typography-plugin)

If you are using [Tailwind](https://tailwindcss.com/) to style your application, using the [`@tailwindcss/typography` plugin](https://tailwindcss.com/docs/plugins#typography) will allow you to reuse your Tailwind configuration and styles in your markdown files.

The plugin adds a set of `prose` classes that can be used to add typographic styles to content blocks that come from sources, like markdown.

[Install Tailwind typography](https://github.com/tailwindlabs/tailwindcss-typography?tab=readme-ov-file#installation) and use with [shared layouts](#shared-layouts) to add the `prose` you want.

## Frontmatter[](#frontmatter)

Frontmatter is a YAML like key/value pairing that can be used to store data about a page. `@next/mdx` does **not** support frontmatter by default, though there are many solutions for adding frontmatter to your MDX content, such as:

-   [remark-frontmatter](https://github.com/remarkjs/remark-frontmatter)
-   [remark-mdx-frontmatter](https://github.com/remcohaszing/remark-mdx-frontmatter)
-   [gray-matter](https://github.com/jonschlinkert/gray-matter)

`@next/mdx` **does** allow you to use exports like any other JavaScript component:

Metadata can now be referenced outside of the MDX file:

A common use case for this is when you want to iterate over a collection of MDX and extract data. For example, creating a blog index page from all blog posts. You can use packages like [Node's `fs` module](https://nodejs.org/api/fs.html) or [globby](https://www.npmjs.com/package/globby) to read a directory of posts and extract the metadata.

> **Good to know**:
> 
> -   Using `fs`, `globby`, etc. can only be used server-side.
> -   View the [Portfolio Starter Kit](https://vercel.com/templates/next.js/portfolio-starter-kit) template for a complete working example.

## remark and rehype Plugins[](#remark-and-rehype-plugins)

You can optionally provide remark and rehype plugins to transform the MDX content.

For example, you can use [`remark-gfm`](https://github.com/remarkjs/remark-gfm) to support GitHub Flavored Markdown.

Since the remark and rehype ecosystem is ESM only, you'll need to use `next.config.mjs` or `next.config.ts` as the configuration file.

### Using Plugins with Turbopack[](#using-plugins-with-turbopack)

To use plugins with [Turbopack](https://nextjs.org/docs/app/api-reference/turbopack), upgrade to the latest `@next/mdx` and specify plugin names using a string:

> **Good to know**:
> 
> remark and rehype plugins without serializable options cannot be used yet with [Turbopack](https://nextjs.org/docs/app/api-reference/turbopack), because JavaScript functions can't be passed to Rust.

## Deep Dive: How do you transform markdown into HTML?[](#deep-dive-how-do-you-transform-markdown-into-html)

React does not natively understand markdown. The markdown plaintext needs to first be transformed into HTML. This can be accomplished with `remark` and `rehype`.

`remark` is an ecosystem of tools around markdown. `rehype` is the same, but for HTML. For example, the following code snippet transforms markdown into HTML:

The `remark` and `rehype` ecosystem contains plugins for [syntax highlighting](https://github.com/atomiks/rehype-pretty-code), [linking headings](https://github.com/rehypejs/rehype-autolink-headings), [generating a table of contents](https://github.com/remarkjs/remark-toc), and more.

When using `@next/mdx` as shown above, you **do not** need to use `remark` or `rehype` directly, as it is handled for you. We're describing it here for a deeper understanding of what the `@next/mdx` package is doing underneath.

## Using the Rust-based MDX compiler (experimental)[](#using-the-rust-based-mdx-compiler-experimental)

Next.js supports a new MDX compiler written in Rust. This compiler is still experimental and is not recommended for production use. To use the new compiler, you need to configure `next.config.js` when you pass it to `withMDX`:

`mdxRs` also accepts an object to configure how to transform mdx files.

## Helpful Links[](#helpful-links)

-   [MDX](https://mdxjs.com/)
-   [`@next/mdx`](https://www.npmjs.com/package/@next/mdx)
-   [remark](https://github.com/remarkjs/remark)
-   [rehype](https://github.com/rehypejs/rehype)
-   [Markdoc](https://markdoc.dev/docs/nextjs)
