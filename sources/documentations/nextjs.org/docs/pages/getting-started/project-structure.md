---
title: "Getting Started: Project Structure"
source_url: "https://nextjs.org/docs/pages/getting-started/project-structure"
crawled_at: "2026-06-25T07:21:06.320Z"
---

This page is also available as Markdown at [/docs/pages/getting-started/project-structure.md](https://nextjs.org/docs/pages/getting-started/project-structure.md). For an index of Next.js Pages Router documentation, see [/docs/pages/llms.txt](https://nextjs.org/docs/pages/llms.txt).

## Project Structure and Organization

Last updated

November 7, 2024

This page provides an overview of **all** the folder and file conventions in Next.js, and recommendations for organizing your project.

## Folder and file conventions[](#folder-and-file-conventions)

### Top-level folders[](#top-level-folders)

Top-level folders are used to organize your application's code and static assets.

![Route segments to path segments](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782372071/aha-mind/docs-crawler/nextjs.org/image_gaak0i.png)![Route segments to path segments](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782372071/aha-mind/docs-crawler/nextjs.org/image_suzuak.png)

|  |  |
| --- | --- |
| [`app`](https://nextjs.org/docs/app) | App Router |
| [`pages`](https://nextjs.org/docs/pages/building-your-application/routing) | Pages Router |
| [`public`](https://nextjs.org/docs/app/api-reference/file-conventions/public-folder) | Static assets to be served |
| [`src`](https://nextjs.org/docs/app/api-reference/file-conventions/src-folder) | Optional application source folder |

### Top-level files[](#top-level-files)

Top-level files are used to configure your application, manage dependencies, run proxy, integrate monitoring tools, and define environment variables.

|  |  |
| --- | --- |
| **Next.js** |  |
| [`next.config.js`](https://nextjs.org/docs/app/api-reference/config/next-config-js) | Configuration file for Next.js |
| [`package.json`](https://nextjs.org/docs/app/getting-started/installation#manual-installation) | Project dependencies and scripts |
| [`instrumentation.ts`](https://nextjs.org/docs/app/guides/instrumentation) | OpenTelemetry and Instrumentation file |
| [`proxy.ts`](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) | Next.js request proxy |
| [`.env`](https://nextjs.org/docs/app/guides/environment-variables) | Environment variables (should not be tracked by version control) |
| [`.env.local`](https://nextjs.org/docs/app/guides/environment-variables) | Local environment variables (should not be tracked by version control) |
| [`.env.production`](https://nextjs.org/docs/app/guides/environment-variables) | Production environment variables (should not be tracked by version control) |
| [`.env.development`](https://nextjs.org/docs/app/guides/environment-variables) | Development environment variables (should not be tracked by version control) |
| [`eslint.config.mjs`](https://nextjs.org/docs/app/api-reference/config/eslint) | Configuration file for ESLint |
| `.gitignore` | Git files and folders to ignore |
| [`next-env.d.ts`](https://nextjs.org/docs/app/api-reference/config/typescript#next-envdts) | TypeScript declaration file for Next.js (should not be tracked by version control) |
| `tsconfig.json` | Configuration file for TypeScript |
| `jsconfig.json` | Configuration file for JavaScript |

### File conventions[](#file-conventions)

|  |  |  |
| --- | --- | --- |
| [`_app`](https://nextjs.org/docs/pages/building-your-application/routing/custom-app) | `.js` `.jsx` `.tsx` | Custom App |
| [`_document`](https://nextjs.org/docs/pages/building-your-application/routing/custom-document) | `.js` `.jsx` `.tsx` | Custom Document |
| [`_error`](https://nextjs.org/docs/pages/building-your-application/routing/custom-error#more-advanced-error-page-customizing) | `.js` `.jsx` `.tsx` | Custom Error Page |
| [`404`](https://nextjs.org/docs/pages/building-your-application/routing/custom-error#404-page) | `.js` `.jsx` `.tsx` | 404 Error Page |
| [`500`](https://nextjs.org/docs/pages/building-your-application/routing/custom-error#500-page) | `.js` `.jsx` `.tsx` | 500 Error Page |

### Routes[](#routes)

|  |  |  |
| --- | --- | --- |
| **Folder convention** |  |  |
| [`index`](https://nextjs.org/docs/pages/building-your-application/routing/pages-and-layouts#index-routes) | `.js` `.jsx` `.tsx` | Home page |
| [`folder/index`](https://nextjs.org/docs/pages/building-your-application/routing/pages-and-layouts#index-routes) | `.js` `.jsx` `.tsx` | Nested page |
| **File convention** |  |  |
| [`index`](https://nextjs.org/docs/pages/building-your-application/routing/pages-and-layouts#index-routes) | `.js` `.jsx` `.tsx` | Home page |
| [`file`](https://nextjs.org/docs/pages/building-your-application/routing/pages-and-layouts) | `.js` `.jsx` `.tsx` | Nested page |

### Dynamic routes[](#dynamic-routes-1)

|  |  |  |
| --- | --- | --- |
| **Folder convention** |  |  |
| [`[folder]/index`](https://nextjs.org/docs/pages/building-your-application/routing/dynamic-routes) | `.js` `.jsx` `.tsx` | Dynamic route segment |
| [`[...folder]/index`](https://nextjs.org/docs/pages/building-your-application/routing/dynamic-routes#catch-all-segments) | `.js` `.jsx` `.tsx` | Catch-all route segment |
| [`[[...folder]]/index`](https://nextjs.org/docs/pages/building-your-application/routing/dynamic-routes#optional-catch-all-segments) | `.js` `.jsx` `.tsx` | Optional catch-all route segment |
| **File convention** |  |  |
| [`[file]`](https://nextjs.org/docs/pages/building-your-application/routing/dynamic-routes) | `.js` `.jsx` `.tsx` | Dynamic route segment |
| [`[...file]`](https://nextjs.org/docs/pages/building-your-application/routing/dynamic-routes#catch-all-segments) | `.js` `.jsx` `.tsx` | Catch-all route segment |
| [`[[...file]]`](https://nextjs.org/docs/pages/building-your-application/routing/dynamic-routes#optional-catch-all-segments) | `.js` `.jsx` `.tsx` | Optional catch-all route segment |
