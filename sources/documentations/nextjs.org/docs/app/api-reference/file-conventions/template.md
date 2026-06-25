---
title: "File-system conventions: template.js"
source_url: "https://nextjs.org/docs/app/api-reference/file-conventions/template"
crawled_at: "2026-06-25T07:06:53.017Z"
---

Last updated

March 5, 2026

A **template** file is similar to a [layout](https://nextjs.org/docs/app/getting-started/layouts-and-pages#creating-a-layout) in that it wraps a layout or page. Unlike layouts that persist across routes and maintain state, templates are given a unique key, meaning children Client Components reset their state on navigation.

They are useful when you need to:

-   Resynchronize `useEffect` on navigation.
-   Reset the state of a child Client Components on navigation. For example, an input field.
-   To change default framework behavior. For example, Suspense boundaries inside layouts only show a fallback on first load, while templates show it on every navigation.

## Convention[](#convention)

A template can be defined by exporting a default React component from a `template.js` file. The component should accept a `children` prop.

![template.js special file](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782371217/aha-mind/docs-crawler/nextjs.org/image_mjqi9e.png)![template.js special file](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782371217/aha-mind/docs-crawler/nextjs.org/image_wsgg0q.png)

In terms of nesting, `template.js` is rendered between a layout and its children. Here's a simplified output:

In the [component hierarchy](https://nextjs.org/docs/app/getting-started/project-structure#component-hierarchy), `template.js` renders between `layout.js` and `error.js`. It wraps `error.js`, `loading.js`, `not-found.js`, and `page.js`, but does **not** wrap the `layout.js` in the same segment.

## Props[](#props)

### `children` (required)[](#children-required)

Template accepts a `children` prop.

## Behavior[](#behavior)

-   **Server Components**: By default, templates are Server Components.
-   **With navigation**: Templates receive a unique key for their own segment level. They remount when that segment (including its dynamic params) changes. Navigations within deeper segments do not remount higher-level templates. Search params do not trigger remounts.
-   **State reset**: Any Client Component inside the template will reset its state on navigation.
-   **Effect re-run**: Effects like `useEffect` will re-synchronize as the component remounts.
-   **DOM reset**: DOM elements inside the template are fully recreated.

### Templates during navigation and remounting[](#templates-during-navigation-and-remounting)

This section illustrates how templates behave during navigation. It shows, step by step, which templates remount on each route change and why.

Using this project tree:

Starting at `/`, the React tree looks roughly like this.

> Note: The `key` values shown in the examples are illustrative, the values in your application may differ.

Navigating to `/about` (first segment changes), the root template key changes, it remounts:

Navigating to `/blog` (first segment changes), the root template key changes, it remounts and the blog-level template mounts:

Navigating within the same first segment to `/blog/first-post` (child segment changes), the root template key doesn't change, but the blog-level template key changes, it remounts:

Navigating to `/blog/second-post` (same first segment, different child segment), the root template key doesn't change, but the blog-level template key changes, it remounts again:

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v13.0.0` | `template` introduced. |
