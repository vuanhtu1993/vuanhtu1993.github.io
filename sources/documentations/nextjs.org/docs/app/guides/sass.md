---
title: "Guides: Sass"
source_url: "https://nextjs.org/docs/app/guides/sass"
crawled_at: "2026-06-25T07:01:45.500Z"
---

This page is also available as Markdown at [/docs/app/guides/sass.md](https://nextjs.org/docs/app/guides/sass.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

## How to use Sass

Last updated

February 11, 2026

Next.js has built-in support for integrating with Sass after the package is installed using both the `.scss` and `.sass` extensions. You can use component-level Sass via CSS Modules and the `.module.scss`or `.module.sass` extension.

First, install [`sass`](https://github.com/sass/sass):

> **Good to know**:
> 
> Sass supports [two different syntaxes](https://sass-lang.com/documentation/syntax), each with their own extension. The `.scss` extension requires you use the [SCSS syntax](https://sass-lang.com/documentation/syntax#scss), while the `.sass` extension requires you use the [Indented Syntax ("Sass")](https://sass-lang.com/documentation/syntax#the-indented-syntax).
> 
> If you're not sure which to choose, start with the `.scss` extension which is a superset of CSS, and doesn't require you learn the Indented Syntax ("Sass").

### Customizing Sass Options[](#customizing-sass-options)

If you want to configure your Sass options, use `sassOptions` in `next.config`.

#### Implementation[](#implementation)

You can use the `implementation` property to specify the Sass implementation to use. By default, Next.js uses the [`sass`](https://www.npmjs.com/package/sass) package.

### Sass Variables[](#sass-variables)

Next.js supports Sass variables exported from CSS Module files.

For example, using the exported `primaryColor` Sass variable:

[Previous

Rendering Philosophy

](https://nextjs.org/docs/app/guides/rendering-philosophy)[Next

Scripts

](https://nextjs.org/docs/app/guides/scripts)
