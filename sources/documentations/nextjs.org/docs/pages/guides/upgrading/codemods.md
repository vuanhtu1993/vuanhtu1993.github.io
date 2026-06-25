---
title: "Upgrading: Codemods"
source_url: "https://nextjs.org/docs/pages/guides/upgrading/codemods"
crawled_at: "2026-06-25T07:25:48.539Z"
---

Last updated

April 15, 2025

Codemods are transformations that run on your codebase programmatically. This allows a large number of changes to be programmatically applied without having to manually go through every file.

Next.js provides Codemod transformations to help upgrade your Next.js codebase when an API is updated or deprecated.

## Usage[](#usage)

In your terminal, navigate (`cd`) into your project's folder, then run:

Replacing `<transform>` and `<path>` with appropriate values.

-   `transform` - name of transform
-   `path` - files or directory to transform
-   `--dry` Do a dry-run, no code will be edited
-   `--print` Prints the changed output for comparison

## Upgrade[](#upgrade)

Upgrades your Next.js application, automatically running codemods and updating Next.js, React, and React DOM.

### Options[](#options)

-   `revision` (optional): Specify the upgrade type (`patch`, `minor`, `major`), an NPM dist tag (e.g. `latest`, `canary`, `rc`), or an exact version (e.g. `15.0.0`). Defaults to `minor` for stable versions.
-   `--verbose`: Show more detailed output during the upgrade process.

For example:

> **Good to know**:
> 
> -   If the target version is the same as or lower than your current version, the command exits without making changes.
> -   During the upgrade, you may be prompted to choose which Next.js codemods to apply and run React 19 codemods if upgrading React.

## Codemods[](#codemods)

### 16.0[](#160)

#### Remove `experimental_ppr` Route Segment Config from App Router pages and layouts[](#remove-experimental_ppr-route-segment-config-from-app-router-pages-and-layouts)

##### `remove-experimental-ppr`[](#remove-experimental-ppr)

This codemod removes the `experimental_ppr` Route Segment Config from App Router pages and layouts.

#### Remove `unstable_` prefix from stabilized API[](#remove-unstable_-prefix-from-stabilized-api)

##### `remove-unstable-prefix`[](#remove-unstable-prefix)

This codemod removes the `unstable_` prefix from stabilized API.

For example:

Transforms into:

#### Migrate from deprecated `middleware` convention to `proxy`[](#migrate-from-deprecated-middleware-convention-to-proxy)

##### `middleware-to-proxy`[](#middleware-to-proxy)

This codemod migrates projects from using the deprecated `middleware` convention to using the `proxy` convention. It:

-   Renames `middleware.<extension>` to `proxy.<extension>` (e.g. `middleware.ts` to `proxy.ts`)
-   Renames named export `middleware` to `proxy`
-   Renames Next.js config property `experimental.middlewarePrefetch` to `experimental.proxyPrefetch`
-   Renames Next.js config property `experimental.middlewareClientMaxBodySize` to `experimental.proxyClientMaxBodySize`
-   Renames Next.js config property `experimental.externalMiddlewareRewritesResolve` to `experimental.externalProxyRewritesResolve`
-   Renames Next.js config property `skipMiddlewareUrlNormalize` to `skipProxyUrlNormalize`

For example:

Transforms into:

#### Migrate from `next lint` to ESLint CLI[](#migrate-from-next-lint-to-eslint-cli)

##### `next-lint-to-eslint-cli`[](#next-lint-to-eslint-cli)

This codemod migrates projects from using `next lint` to using the ESLint CLI with your local ESLint config. It:

-   Creates an `eslint.config.mjs` file with Next.js recommended configurations
-   Updates `package.json` scripts to use `eslint .` instead of `next lint`
-   Adds necessary ESLint dependencies to `package.json`
-   Preserves existing ESLint configurations when found

For example:

Becomes:

And creates:

### 15.0[](#150)

#### Transform App Router Route Segment Config `runtime` value from `experimental-edge` to `edge`[](#transform-app-router-route-segment-config-runtime-value-from-experimental-edge-to-edge)

##### `app-dir-runtime-config-experimental-edge`[](#app-dir-runtime-config-experimental-edge)

> **Note**: This codemod is App Router specific.

This codemod transforms [Route Segment Config `runtime`](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/runtime) value `experimental-edge` to `edge`.

For example:

Transforms into:

#### Migrate to async Dynamic APIs[](#migrate-to-async-dynamic-apis)

APIs that opted into dynamic rendering that previously supported synchronous access are now asynchronous. You can read more about this breaking change in the [upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-15).

##### `next-async-request-api`[](#next-async-request-api)

This codemod will transform dynamic APIs (`cookies()`, `headers()` and `draftMode()` from `next/headers`) that are now asynchronous to be properly awaited or wrapped with `React.use()` if applicable. When an automatic migration isn't possible, the codemod will either add a typecast (if a TypeScript file) or a comment to inform the user that it needs to be manually reviewed & updated.

For example:

Transforms into:

When we detect property access on the `params` or `searchParams` props in the page / route entries (`page.js`, `layout.js`, `route.js`, or `default.js`) or the `generateMetadata` / `generateViewport` APIs, it will attempt to transform the callsite from a sync to an async function, and await the property access. If it can't be made async (such as with a Client Component), it will use `React.use` to unwrap the promise .

For example:

Transforms into:

> **Good to know:** When this codemod identifies a spot that might require manual intervention, but we aren't able to determine the exact fix, it will add a comment or typecast to the code to inform the user that it needs to be manually updated. These comments are prefixed with **@next/codemod**, and typecasts are prefixed with `UnsafeUnwrapped`. Your build will error until these comments are explicitly removed. [Read more](https://nextjs.org/docs/messages/sync-dynamic-apis).

#### Replace `geo` and `ip` properties of `NextRequest` with `@vercel/functions`[](#replace-geo-and-ip-properties-of-nextrequest-with-vercelfunctions)

##### `next-request-geo-ip`[](#next-request-geo-ip)

This codemod installs `@vercel/functions` and transforms `geo` and `ip` properties of `NextRequest` with corresponding `@vercel/functions` features.

For example:

Transforms into:

### 14.0[](#140)

#### Migrate `ImageResponse` imports[](#migrate-imageresponse-imports)

##### `next-og-import`[](#next-og-import)

This codemod moves transforms imports from `next/server` to `next/og` for usage of [Dynamic OG Image Generation](https://nextjs.org/docs/app/getting-started/metadata-and-og-images#generated-open-graph-images).

For example:

Transforms into:

#### Use `viewport` export[](#use-viewport-export)

##### `metadata-to-viewport-export`[](#metadata-to-viewport-export)

This codemod migrates certain viewport metadata to `viewport` export.

For example:

Transforms into:

### 13.2[](#132)

#### Use Built-in Font[](#use-built-in-font)

##### `built-in-next-font`[](#built-in-next-font)

This codemod uninstalls the `@next/font` package and transforms `@next/font` imports into the built-in `next/font`.

For example:

Transforms into:

### 13.0[](#130)

#### Rename Next Image Imports[](#rename-next-image-imports)

##### `next-image-to-legacy-image`[](#next-image-to-legacy-image)

Safely renames `next/image` imports in existing Next.js 10, 11, or 12 applications to `next/legacy/image` in Next.js 13. Also renames `next/future/image` to `next/image`.

For example:

Transforms into:

#### Migrate to the New Image Component[](#migrate-to-the-new-image-component)

##### `next-image-experimental`[](#next-image-experimental)

Dangerously migrates from `next/legacy/image` to the new `next/image` by adding inline styles and removing unused props.

-   Removes `layout` prop and adds `style`.
-   Removes `objectFit` prop and adds `style`.
-   Removes `objectPosition` prop and adds `style`.
-   Removes `lazyBoundary` prop.
-   Removes `lazyRoot` prop.

#### Remove `<a>` Tags From Link Components[](#remove-a-tags-from-link-components)

##### `new-link`[](#new-link)

Remove `<a>` tags inside [Link Components](https://nextjs.org/docs/pages/api-reference/components/link).

For example:

### 11[](#11)

#### Migrate from CRA[](#migrate-from-cra)

##### `cra-to-next`[](#cra-to-next)

Migrates a Create React App project to Next.js; creating a Pages Router and necessary config to match behavior. Client-side only rendering is leveraged initially to prevent breaking compatibility due to `window` usage during SSR and can be enabled seamlessly to allow the gradual adoption of Next.js specific features.

Please share any feedback related to this transform [in this discussion](https://github.com/vercel/next.js/discussions/25858).

### 10[](#10)

#### Add React imports[](#add-react-imports)

##### `add-missing-react-import`[](#add-missing-react-import)

Transforms files that do not import `React` to include the import in order for the new [React JSX transform](https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html) to work.

For example:

Transforms into:

### 9[](#9)

#### Transform Anonymous Components into Named Components[](#transform-anonymous-components-into-named-components)

##### `name-default-component`[](#name-default-component)

**Versions 9 and above.**

Transforms anonymous components into named components to make sure they work with [Fast Refresh](https://nextjs.org/blog/next-9-4#fast-refresh).

For example:

Transforms into:

The component will have a camel-cased name based on the name of the file, and it also works with arrow functions.

### 8[](#8)

> **Note**: Built-in AMP support and this codemod have been removed in Next.js 16.

#### Transform AMP HOC into page config[](#transform-amp-hoc-into-page-config)

##### `withamp-to-config`[](#withamp-to-config)

Transforms the `withAmp` HOC into Next.js 9 page configuration.

For example:

### 6[](#6)

#### Use `withRouter`[](#use-withrouter)

##### `url-to-withrouter`[](#url-to-withrouter)

Transforms the deprecated automatically injected `url` property on top level pages to using `withRouter` and the `router` property it injects. Read more here: [https://nextjs.org/docs/messages/url-deprecated](https://nextjs.org/docs/messages/url-deprecated)

For example:

This is one case. All the cases that are transformed (and tested) can be found in the [`__testfixtures__` directory](https://github.com/vercel/next.js/tree/canary/packages/next-codemod/transforms/__testfixtures__/url-to-withrouter).
