---
title: "Adapters: Output Types"
source_url: "https://nextjs.org/docs/app/api-reference/adapters/output-types"
crawled_at: "2026-06-25T07:20:16.251Z"
---

Last updated

April 2, 2026

The `outputs` object contains arrays of build output types:

-   `outputs.pages`: React pages from the `pages/` directory
-   `outputs.pagesApi`: API routes from `pages/api/`
-   `outputs.appPages`: React pages from the `app/` directory
-   `outputs.appRoutes`: API and metadata routes from `app/`
-   `outputs.prerenders`: ISR-enabled routes and static prerenders
-   `outputs.staticFiles`: Static assets and auto-statically optimized pages
-   `outputs.middleware`: Middleware function (if present)

> **Note:** When `config.output` is set to `'export'`, only `outputs.staticFiles` is populated. All other arrays (`pages`, `appPages`, `pagesApi`, `appRoutes`, `prerenders`) will be empty since the entire application is exported as static files.

For any route output with `runtime: 'edge'`, `edgeRuntime` is included and contains the canonical entry metadata for invoking that output in your edge runtime.

## Pages (`outputs.pages`)[](#pages-outputspages)

React pages from the `pages/` directory:

## API Routes (`outputs.pagesApi`)[](#api-routes-outputspagesapi)

API routes from `pages/api/`:

## App Pages (`outputs.appPages`)[](#app-pages-outputsapppages)

React pages from the `app/` directory:

## App Routes (`outputs.appRoutes`)[](#app-routes-outputsapproutes)

API and metadata routes from the `app/` directory:

## Prerenders (`outputs.prerenders`)[](#prerenders-outputsprerenders)

ISR-enabled routes and static prerenders:

## Static Files (`outputs.staticFiles`)[](#static-files-outputsstaticfiles)

Static assets and auto-statically optimized pages:

## Middleware (`outputs.middleware`)[](#middleware-outputsmiddleware)

`middleware.ts` (`.js`/`.ts`) or `proxy.ts` (`.js`/`.ts`) function (if present):
