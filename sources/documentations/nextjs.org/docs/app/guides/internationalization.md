---
title: "Guides: Internationalization"
source_url: "https://nextjs.org/docs/app/guides/internationalization"
crawled_at: "2026-06-25T06:59:18.999Z"
---

Last updated

December 9, 2025

Next.js enables you to configure the routing and rendering of content to support multiple languages. Making your site adaptive to different locales includes translated content (localization) and internationalized routes.

## Terminology[](#terminology)

-   **Locale:** An identifier for a set of language and formatting preferences. This usually includes the preferred language of the user and possibly their geographic region.
    -   `en-US`: English as spoken in the United States
    -   `nl-NL`: Dutch as spoken in the Netherlands
    -   `nl`: Dutch, no specific region

## Routing Overview[](#routing-overview)

It’s recommended to use the user’s language preferences in the browser to select which locale to use. Changing your preferred language will modify the incoming `Accept-Language` header to your application.

For example, using the following libraries, you can look at an incoming `Request` to determine which locale to select, based on the `Headers`, locales you plan to support, and the default locale.

Routing can be internationalized by either the sub-path (`/fr/products`) or domain (`my-site.fr/products`). With this information, you can now redirect the user based on the locale inside [Proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy).

Finally, ensure all special files inside `app/` are nested under `app/[lang]`. This enables the Next.js router to dynamically handle different locales in the route, and forward the `lang` parameter to every layout and page. For example:

> **Good to know:** `PageProps` and `LayoutProps` are globally available TypeScript helpers that provide strong typing for route parameters. See [PageProps](https://nextjs.org/docs/app/api-reference/file-conventions/page#page-props-helper) and [LayoutProps](https://nextjs.org/docs/app/api-reference/file-conventions/layout#layout-props-helper) for more details.

The root layout can also be nested in the new folder (e.g. `app/[lang]/layout.js`).

## Localization[](#localization)

Changing displayed content based on the user’s preferred locale, or localization, is not something specific to Next.js. The patterns described below would work the same with any web application.

Let’s assume we want to support both English and Dutch content inside our application. We might maintain two different “dictionaries”, which are objects that give us a mapping from some key to a localized string. For example:

We can then create a `getDictionary` function to load the translations for the requested locale:

Given the currently selected language, we can fetch the dictionary inside of a layout or page.

Since `lang` is typed as `string`, using `hasLocale` narrows the type to your supported locales. It also ensures a 404 is returned if a translation is missing, rather than a runtime error.

Because all layouts and pages in the `app/` directory default to [Server Components](https://nextjs.org/docs/app/getting-started/server-and-client-components), we do not need to worry about the size of the translation files affecting our client-side JavaScript bundle size. This code will **only run on the server**, and only the resulting HTML will be sent to the browser.

## Static Rendering[](#static-rendering)

To generate static routes for a given set of locales, we can use `generateStaticParams` with any page or layout. This can be global, for example, in the root layout:

## Resources[](#resources)

-   [Minimal i18n routing and translations](https://github.com/vercel/next.js/tree/canary/examples/i18n-routing)
-   [`next-intl`](https://next-intl.dev/)
-   [`next-international`](https://github.com/QuiiBz/next-international)
-   [`next-i18n-router`](https://github.com/i18nexus/next-i18n-router)
-   [`paraglide-next`](https://inlang.com/m/osslbuzt/paraglide-next-i18n)
-   [`lingui`](https://lingui.dev/)
-   [`tolgee`](https://tolgee.io/apps-integrations/next)
-   [`next-intlayer`](https://intlayer.org/doc/environment/nextjs)
-   [`gt-next`](https://generaltranslation.com/en/docs/next)
