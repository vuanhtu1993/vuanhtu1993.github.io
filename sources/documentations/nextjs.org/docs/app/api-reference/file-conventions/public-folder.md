---
title: "File-system conventions: public"
source_url: "https://nextjs.org/docs/app/api-reference/file-conventions/public-folder"
crawled_at: "2026-06-25T07:06:27.373Z"
---

This page is also available as Markdown at [/docs/app/api-reference/file-conventions/public-folder.md](https://nextjs.org/docs/app/api-reference/file-conventions/public-folder.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

## public Folder

Last updated

June 16, 2025

Next.js can serve static files, like images, under a folder called `public` in the root directory. Files inside `public` can then be referenced by your code starting from the base URL (`/`).

For example, the file `public/avatars/me.png` can be viewed by visiting the `/avatars/me.png` path. The code to display that image might look like:

## Caching[](#caching)

Next.js cannot safely cache assets in the `public` folder because they may change. The default caching headers applied are:

## Robots, Favicons, and others[](#robots-favicons-and-others)

For static metadata files, such as `robots.txt`, `favicon.ico`, etc, you should use [special metadata files](https://nextjs.org/docs/app/api-reference/file-conventions/metadata) inside the `app` folder.

[Previous

proxy.js

](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)[Next

route.js

](https://nextjs.org/docs/app/api-reference/file-conventions/route)
