---
title: "Guides: Internationalization"
source_url: "https://nextjs.org/docs/pages/guides/internationalization"
crawled_at: "2026-06-25T07:23:05.092Z"
---

## How to implement internationalization in Next.js

Last updated

March 3, 2026

Examples

-   [i18n routing](https://github.com/vercel/next.js/tree/canary/examples/i18n-routing-pages)

Next.js has built-in support for internationalized ([i18n](https://en.wikipedia.org/wiki/Internationalization_and_localization#Naming)) routing since `v10.0.0`. You can provide a list of locales, the default locale, and domain-specific locales and Next.js will automatically handle the routing.

The i18n routing support is currently meant to complement existing i18n library solutions like [`react-intl`](https://formatjs.io/docs/getting-started/installation), [`react-i18next`](https://react.i18next.com/), [`lingui`](https://lingui.dev/), [`rosetta`](https://github.com/lukeed/rosetta), [`next-intl`](https://github.com/amannn/next-intl), [`next-translate`](https://github.com/aralroca/next-translate), [`next-multilingual`](https://github.com/Avansai/next-multilingual), [`tolgee`](https://tolgee.io/integrations/next), [`paraglide-next`](https://inlang.com/m/osslbuzt/paraglide-next-i18n), [`next-intlayer`](https://intlayer.org/doc/environment/nextjs/next-with-page-router), [`gt-react`](https://generaltranslation.com/en/docs/react) and others by streamlining the routes and locale parsing.

## Getting started[](#getting-started)

To get started, add the `i18n` config to your `next.config.js` file.

Locales are [UTS Locale Identifiers](https://www.unicode.org/reports/tr35/tr35-59/tr35.html#Identifiers), a standardized format for defining locales.

Generally a Locale Identifier is made up of a language, region, and script separated by a dash: `language-region-script`. The region and script are optional. An example:

-   `en-US` - English as spoken in the United States
-   `nl-NL` - Dutch as spoken in the Netherlands
-   `nl` - Dutch, no specific region

If user locale is `nl-BE` and it is not listed in your configuration, they will be redirected to `nl` if available, or to the default locale otherwise. If you don't plan to support all regions of a country, it is therefore a good practice to include country locales that will act as fallbacks.

## Locale Strategies[](#locale-strategies)

There are two locale handling strategies: Sub-path Routing and Domain Routing.

### Sub-path Routing[](#sub-path-routing)

Sub-path Routing puts the locale in the url path.

With the above configuration `en-US`, `fr`, and `nl-NL` will be available to be routed to, and `en-US` is the default locale. If you have a `pages/blog.js` the following urls would be available:

-   `/blog`
-   `/fr/blog`
-   `/nl-nl/blog`

The default locale does not have a prefix.

### Domain Routing[](#domain-routing)

By using domain routing you can configure locales to be served from different domains:

For example if you have `pages/blog.js` the following urls will be available:

-   `example.com/blog`
-   `www.example.com/blog`
-   `example.fr/blog`
-   `example.nl/blog`
-   `example.nl/nl-BE/blog`

## Automatic Locale Detection[](#automatic-locale-detection)

When a user visits the application root (generally `/`), Next.js will try to automatically detect which locale the user prefers based on the [`Accept-Language`](https://developer.mozilla.org/docs/Web/HTTP/Headers/Accept-Language) header and the current domain.

If a locale other than the default locale is detected, the user will be redirected to either:

-   **When using Sub-path Routing:** The locale prefixed path
-   **When using Domain Routing:** The domain with that locale specified as the default

When using Domain Routing, if a user with the `Accept-Language` header `fr;q=0.9` visits `example.com`, they will be redirected to `example.fr` since that domain handles the `fr` locale by default.

When using Sub-path Routing, the user would be redirected to `/fr`.

### Prefixing the Default Locale[](#prefixing-the-default-locale)

With Next.js 12 and [Proxy](https://nextjs.org/docs/pages/api-reference/file-conventions/proxy), we can add a prefix to the default locale with a [workaround](https://github.com/vercel/next.js/discussions/18419).

For example, here's a `next.config.js` file with support for a few languages. Note the `"default"` locale has been added intentionally.

Next, we can use [Proxy](https://nextjs.org/docs/pages/api-reference/file-conventions/proxy) to add custom routing rules:

This [Proxy](https://nextjs.org/docs/pages/api-reference/file-conventions/proxy) skips adding the default prefix to [API Routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) and [public](https://nextjs.org/docs/pages/api-reference/file-conventions/public-folder) files like fonts or images. If a request is made to the default locale, we redirect to our prefix `/en`.

### Disabling Automatic Locale Detection[](#disabling-automatic-locale-detection)

The automatic locale detection can be disabled with:

When `localeDetection` is set to `false` Next.js will no longer automatically redirect based on the user's preferred locale and will only provide locale information detected from either the locale based domain or locale path as described above.

## Accessing the locale information[](#accessing-the-locale-information)

You can access the locale information via the Next.js router. For example, using the [`useRouter()`](https://nextjs.org/docs/pages/api-reference/functions/use-router) hook the following properties are available:

-   `locale` contains the currently active locale.
-   `locales` contains all configured locales.
-   `defaultLocale` contains the configured default locale.

When [prerendering](https://nextjs.org/docs/pages/building-your-application/rendering/static-site-generation) pages with `getStaticProps` or `getServerSideProps`, the locale information is provided in [the context](https://nextjs.org/docs/pages/building-your-application/data-fetching/get-static-props) provided to the function.

When leveraging `getStaticPaths`, the configured locales are provided in the context parameter of the function under `locales` and the configured defaultLocale under `defaultLocale`.

## Transition between locales[](#transition-between-locales)

You can use `next/link` or `next/router` to transition between locales.

For `next/link`, a `locale` prop can be provided to transition to a different locale from the currently active one. If no `locale` prop is provided, the currently active `locale` is used during client-transitions. For example:

When using the `next/router` methods directly, you can specify the `locale` that should be used via the transition options. For example:

Note that to handle switching only the `locale` while preserving all routing information such as [dynamic route](https://nextjs.org/docs/pages/building-your-application/routing/dynamic-routes) query values or hidden href query values, you can provide the `href` parameter as an object:

See [here](https://nextjs.org/docs/pages/api-reference/functions/use-router#with-url-object) for more information on the object structure for `router.push`.

If you have a `href` that already includes the locale you can opt-out of automatically handling the locale prefixing:

## Leveraging the `NEXT_LOCALE` cookie[](#leveraging-the-next_locale-cookie)

Next.js allows setting a `NEXT_LOCALE=the-locale` cookie, which takes priority over the accept-language header. This cookie can be set using a language switcher and then when a user comes back to the site it will leverage the locale specified in the cookie when redirecting from `/` to the correct locale location.

For example, if a user prefers the locale `fr` in their accept-language header but a `NEXT_LOCALE=en` cookie is set the `en` locale when visiting `/` the user will be redirected to the `en` locale location until the cookie is removed or expired.

## Search Engine Optimization[](#search-engine-optimization)

Since Next.js knows what language the user is visiting it will automatically add the `lang` attribute to the `<html>` tag.

Next.js doesn't know about variants of a page so it's up to you to add the `hreflang` meta tags using [`next/head`](https://nextjs.org/docs/pages/api-reference/components/head). You can learn more about `hreflang` in the [Google Webmasters documentation](https://support.google.com/webmasters/answer/189077).

## How does this work with Static Generation?[](#how-does-this-work-with-static-generation)

> Note that Internationalized Routing does not integrate with [`output: 'export'`](https://nextjs.org/docs/pages/guides/static-exports) as it does not leverage the Next.js routing layer. Hybrid Next.js applications that do not use `output: 'export'` are fully supported.

### Dynamic Routes and `getStaticProps` Pages[](#dynamic-routes-and-getstaticprops-pages)

For pages using `getStaticProps` with [Dynamic Routes](https://nextjs.org/docs/pages/building-your-application/routing/dynamic-routes), all locale variants of the page desired to be prerendered need to be returned from [`getStaticPaths`](https://nextjs.org/docs/pages/building-your-application/data-fetching/get-static-paths). Along with the `params` object returned for `paths`, you can also return a `locale` field specifying which locale you want to render. For example:

For [Automatically Statically Optimized](https://nextjs.org/docs/pages/building-your-application/rendering/automatic-static-optimization) and non-dynamic `getStaticProps` pages, **a version of the page will be generated for each locale**. This is important to consider because it can increase build times depending on how many locales are configured inside `getStaticProps`.

For example, if you have 50 locales configured with 10 non-dynamic pages using `getStaticProps`, this means `getStaticProps` will be called 500 times. 50 versions of the 10 pages will be generated during each build.

To decrease the build time of dynamic pages with `getStaticProps`, use a [`fallback` mode](https://nextjs.org/docs/pages/api-reference/functions/get-static-paths#fallback-true). This allows you to return only the most popular paths and locales from `getStaticPaths` for prerendering during the build. Then, Next.js will build the remaining pages at runtime as they are requested.

### Automatically Statically Optimized Pages[](#automatically-statically-optimized-pages)

For pages that are [automatically statically optimized](https://nextjs.org/docs/pages/building-your-application/rendering/automatic-static-optimization), a version of the page will be generated for each locale.

### Non-dynamic getStaticProps Pages[](#non-dynamic-getstaticprops-pages)

For non-dynamic `getStaticProps` pages, a version is generated for each locale like above. `getStaticProps` is called with each `locale` that is being rendered. If you would like to opt-out of a certain locale from being prerendered, you can return `notFound: true` from `getStaticProps` and this variant of the page will not be generated.

## Limits for the i18n config[](#limits-for-the-i18n-config)

-   `locales`: 100 total locales
-   `domains`: 100 total locale domain items

> **Good to know**: These limits have been added initially to prevent potential [performance issues at build time](#dynamic-routes-and-getstaticprops-pages). You can workaround these limits with custom routing using [Proxy](https://nextjs.org/docs/pages/api-reference/file-conventions/proxy) in Next.js 12.
