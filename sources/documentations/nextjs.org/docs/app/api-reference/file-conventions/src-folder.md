---
title: "File-system conventions: src"
source_url: "https://nextjs.org/docs/app/api-reference/file-conventions/src-folder"
crawled_at: "2026-06-25T07:06:46.401Z"
---

This page is also available as Markdown at [/docs/app/api-reference/file-conventions/src-folder.md](https://nextjs.org/docs/app/api-reference/file-conventions/src-folder.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

## src Folder

Last updated

October 17, 2025

As an alternative to having the special Next.js `app` or `pages` directories in the root of your project, Next.js also supports the common pattern of placing application code under the `src` folder.

This separates application code from project configuration files which mostly live in the root of a project, which is preferred by some individuals and teams.

To use the `src` folder, move the `app` Router folder or `pages` Router folder to `src/app` or `src/pages` respectively.

![An example folder structure with the \`src\` folder](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782371210/aha-mind/docs-crawler/nextjs.org/image_zexyzb.png)![An example folder structure with the \`src\` folder](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782371210/aha-mind/docs-crawler/nextjs.org/image_q3ts6p.png)

> **Good to know**:
> 
> -   The `/public` directory should remain in the root of your project.
> -   Config files like `package.json`, `next.config.js` and `tsconfig.json` should remain in the root of your project.
> -   `.env.*` files should remain in the root of your project.
> -   `src/app` or `src/pages` will be ignored if `app` or `pages` are present in the root directory.
> -   If you're using `src`, you'll probably also move other application folders such as `/components` or `/lib`.
> -   If you're using Proxy, ensure it is placed inside the `src` folder.
> -   If you're using Tailwind CSS, you'll need to add the `/src` prefix to the `tailwind.config.js` file in the [content section](https://tailwindcss.com/docs/content-configuration).
> -   If you are using TypeScript paths for imports such as `@/*`, you should update the `paths` object in `tsconfig.json` to include `src/`.

[Previous

Route Groups

](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups)[Next

template.js

](https://nextjs.org/docs/app/api-reference/file-conventions/template)
