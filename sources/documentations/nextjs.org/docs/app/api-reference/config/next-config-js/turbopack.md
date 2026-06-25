---
title: "next.config.js: turbopack"
source_url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack"
crawled_at: "2026-06-25T07:17:39.903Z"
---

Last updated

February 13, 2026

The `turbopack` option lets you customize [Turbopack](https://nextjs.org/docs/app/api-reference/turbopack) to transform different files and change how modules are resolved.

> **Good to know**: The `turbopack` option was previously named `experimental.turbo` in Next.js versions 13.0.0 to 15.2.x. The `experimental.turbo` option will be removed in Next.js 16.
> 
> If you are using an older version of Next.js, run `npx @next/codemod@latest next-experimental-turbo-to-turbopack .` to automatically migrate your configuration.

> **Good to know**:
> 
> -   Turbopack for Next.js does not require loaders or loader configuration for built-in functionality. Turbopack has built-in support for CSS and compiling modern JavaScript, so there's no need for `css-loader`, `postcss-loader`, or `babel-loader` if you're using `@babel/preset-env`.

## Reference[](#reference)

### Options[](#options)

The following options are available for the `turbopack` configuration:

| Option | Description |
| --- | --- |
| `root` | Sets the application root directory. Should be an absolute path. |
| `rules` | List of supported webpack loaders to apply when running with Turbopack. |
| `resolveAlias` | Map aliased imports to modules to load in their place. |
| `resolveExtensions` | List of extensions to resolve when importing files. |
| `debugIds` | Enable generation of [debug IDs](https://github.com/tc39/ecma426/blob/main/proposals/debug-id.md) in JavaScript bundles and source maps. |

### Supported loaders[](#supported-loaders)

The following loaders have been tested to work with Turbopack's webpack loader implementation, but many other webpack loaders should work as well even if not listed here:

-   [`babel-loader`](https://www.npmjs.com/package/babel-loader) [_(Configured automatically if a Babel configuration file is found)_](https://nextjs.org/docs/app/api-reference/turbopack#language-features)
-   [`@svgr/webpack`](https://www.npmjs.com/package/@svgr/webpack)
-   [`svg-inline-loader`](https://www.npmjs.com/package/svg-inline-loader)
-   [`yaml-loader`](https://www.npmjs.com/package/yaml-loader)
-   [`string-replace-loader`](https://www.npmjs.com/package/string-replace-loader)
-   [`raw-loader`](https://www.npmjs.com/package/raw-loader)
-   [`sass-loader`](https://www.npmjs.com/package/sass-loader) [_(Configured automatically)_](https://nextjs.org/docs/app/api-reference/turbopack#css-and-styling)
-   [`graphql-tag/loader`](https://www.npmjs.com/package/graphql-tag)

#### Missing Webpack loader features[](#missing-webpack-loader-features)

Turbopack uses the [`loader-runner`](https://github.com/webpack/loader-runner) library to execute webpack loaders, which provides most of the standard loader API. However, some features are not supported:

**Module loading:**

-   [`importModule`](https://webpack.js.org/api/loaders/#thisimportmodule) - No support
-   [`loadModule`](https://webpack.js.org/api/loaders/#thisloadmodule) - No support

**File system and output:**

-   [`fs`](https://webpack.js.org/api/loaders/#thisfs) - Partial support: only `fs.readFile` is currently implemented.
-   [`emitFile`](https://webpack.js.org/api/loaders/#thisemitfile) - No support

**Context properties:**

-   [`version`](https://webpack.js.org/api/loaders/#thisversion) - No support
-   [`mode`](https://webpack.js.org/api/loaders/#thismode) - No support
-   [`target`](https://webpack.js.org/api/loaders/#thistarget) - No support

**Utilities:**

-   [`utils`](https://webpack.js.org/api/loaders/#thisutils) - No support
-   [`resolve`](https://webpack.js.org/api/loaders/#thisresolve) - No support (use [`getResolve`](https://webpack.js.org/api/loaders/#thisgetresolve) instead)

If you have a loader that is critically dependent upon one of these features please file an issue.

## Examples[](#examples)

### Root directory[](#root-directory)

Turbopack uses the root directory to resolve modules. Files outside of the project root are not resolved.

The reason files are not resolved outside of the project root is to improve cache validation, reduce filesystem watching overhead, and reduce the number of resolving steps needed.

Next.js automatically detects the root directory of your project. It does so by looking for one of these files:

-   `pnpm-lock.yaml`
-   `package-lock.json`
-   `yarn.lock`
-   `bun.lock`
-   `bun.lockb`

If you have a different project structure, for example if you don't use workspaces, you can manually set the `root` option:

To resolve files from linked dependencies outside the project root (via `npm link`, `yarn link`, `pnpm link`, etc.), you must configure the `turbopack.root` to the parent directory of both the project and the linked dependencies.

While this expands the scope of filesystem watching, it's typically only necessary during development when actively working on linked packages.

### Configuring webpack loaders[](#configuring-webpack-loaders)

If you need loader support beyond what's built in, many webpack loaders already work with Turbopack. There are currently some limitations:

-   Only a core subset of the webpack loader API is implemented. Currently, there is enough coverage for some popular loaders, and we'll expand our API support in the future.
-   Only loaders that return JavaScript code are supported. Loaders that transform files like stylesheets or images are not currently supported.
-   Options passed to webpack loaders must be plain JavaScript primitives, objects, and arrays. For example, it's not possible to pass `require()` plugin modules as option values.

To configure loaders, add the names of the loaders you've installed and any options in `next.config.js`, mapping file extensions to a list of loaders. Rules are evaluated in order.

Here is an example below using the [`@svgr/webpack`](https://www.npmjs.com/package/@svgr/webpack) loader, which enables importing `.svg` files and rendering them as React components.

> **Good to know**: Globs used in the `rules` object match based on file name, unless the glob contains a `/` character, which will cause it to match based on the full project-relative file path. Windows file paths are normalized to use unix-style `/` path separators.
> 
> Turbopack uses a modified version of the [Rust `globset` library](https://docs.rs/globset/latest/globset/).

For loaders that require configuration options, you can use an object format instead of a string:

> **Good to know**: Prior to Next.js version 13.4.4, `turbopack.rules` was named `turbo.loaders` and only accepted file extensions like `.mdx` instead of `*.mdx`.

### Advanced webpack loader conditions[](#advanced-webpack-loader-conditions)

You can further restrict where a loader runs using the advanced `condition` syntax:

-   Supported boolean operators are `{all: [...]}`, `{any: [...]}` and `{not: ...}`.
-   Supported customizable operators are `{path: string | RegExp}`, `{content: RegExp}`, `{query: string | RegExp}`, and `{contentType: string | RegExp}`. If multiple operators are specified in the same object, it acts as an implicit `and`.
    -   `path` matches against the project-relative file path. A string is treated as a glob pattern, while a RegExp can be used to match the path partially.
    -   `content` matches anywhere in the file content.
    -   `query` matches the import's query string (e.g., `?foo` in `import './file?foo'`). A string must match exactly, while a RegExp can be used to match the query string partially.
    -   `contentType` matches the MIME content type of the resource (e.g., from data URLs like `data:text/plain,...`). A string is treated as a glob pattern (e.g., `text/*`, `image/*`), while a RegExp can be used to match the content type partially.

In addition, a number of built-in conditions are supported:

-   `browser`: Matches code that will execute on the client. Server code can be matched using `{not: 'browser'}`.
-   `foreign`: Matches code in `node_modules`, as well as some Next.js internals. Usually you'll want to restrict loaders to `{not: 'foreign'}`. This can improve performance by reducing the number of files the loader is invoked on.
-   `development`: Matches when using `next dev`.
-   `production`: Matches when using `next build`.
-   `node`: Matches code that will run on the default Node.js runtime.
-   `edge-light`: Matches code that will run on the [Edge runtime](https://nextjs.org/docs/app/api-reference/edge).

Rules can be an object or an array of objects. An array is often useful for modeling disjoint conditions:

> **Good to know**: All matching rules are executed in order.

### Module types[](#module-types)

You can set the module type directly without using a loader. This is useful for changing how files are processed, similar to webpack's [`type`](https://webpack.js.org/configuration/module/#ruletype) option.

When using `type: 'asset'`, importing the file returns its URL:

The `type` option can be combined with `loaders` - loaders run first, then the result is processed according to the specified type.

Available module types:

| Type | Description |
| --- | --- |
| `asset` | Emit file and return URL (like webpack `asset/resource`) |
| `ecmascript` | Process as JavaScript |
| `typescript` | Process as TypeScript |
| `css` | Process as CSS |
| `css-module` | Process as CSS module |
| `wasm` | Process as WebAssembly |
| `raw` | Return raw contents as string |
| `bytes` | Inline contents as bytes |

### Inline loader configuration with import attributes[](#inline-loader-configuration-with-import-attributes)

You can apply a Turbopack loader to an individual import using the `with` clause (import attributes). This is specified per-import rather than globally via `turbopack.rules`.

This is useful when you want to apply a loader to a specific import without affecting all files of that type.

The following import attributes are supported:

| Attribute | Description |
| --- | --- |
| `turbopackLoader` | The loader to apply (e.g. `'raw-loader'`). |
| `turbopackLoaderOptions` | JSON string of loader options (e.g. `'{"search":"X","replace":"Y"}'`). |
| `turbopackAs` | Rename pattern for the output (same as `turbopack.rules[].as`). For example, `'*.js'` treats the loader output as JavaScript. |
| `turbopackModuleType` | Set the module type for the output (same as `turbopack.rules[].type`). |

Loaders with options pass a JSON-encoded string via `turbopackLoaderOptions`:

> **Good to know**: Import attributes with `turbopackLoader` are Turbopack-specific and are not supported by webpack. This feature requires the `with` keyword (not `assert`) in your import statements.

### Resolving aliases[](#resolving-aliases)

Turbopack can be configured to modify module resolution through aliases, similar to webpack's [`resolve.alias`](https://webpack.js.org/configuration/resolve/#resolvealias) configuration.

To configure resolve aliases, map imported patterns to their new destination in `next.config.js`:

This aliases imports of the `underscore` package to the `lodash` package. In other words, `import underscore from 'underscore'` will load the `lodash` module instead of `underscore`.

Turbopack also supports conditional aliasing through this field, similar to Node.js' [conditional exports](https://nodejs.org/docs/latest-v18.x/api/packages.html#conditional-exports). At the moment only the `browser` condition is supported. In the case above, imports of the `mocha` module will be aliased to `mocha/browser-entry.js` when Turbopack targets browser environments.

### Resolving custom extensions[](#resolving-custom-extensions)

Turbopack can be configured to resolve modules with custom extensions, similar to webpack's [`resolve.extensions`](https://webpack.js.org/configuration/resolve/#resolveextensions) configuration.

To configure resolve extensions, use the `resolveExtensions` field in `next.config.js`:

This overwrites the original resolve extensions with the provided list. Make sure to include the default extensions.

For more information and guidance for how to migrate your app to Turbopack from webpack, see [Turbopack's documentation on webpack compatibility](https://turbo.build/pack/docs/migrating-from-webpack).

### Debug IDs[](#debug-ids)

Turbopack can be configured to generate [debug IDs](https://github.com/tc39/ecma426/blob/main/proposals/debug-id.md) in JavaScript bundles and source maps.

To configure debug IDs, use the `debugIds` field in `next.config.js`:

The option automatically adds a polyfill for debug IDs to the JavaScript bundle to ensure compatibility. The debug IDs are available in the `globalThis._debugIds` global variable.

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `16.2.0` | `turbopackLoader` import attributes were added. |
| `16.2.0` | `turbopack.rules.*.type` was added. |
| `16.2.0` | `turbopack.rules.*.condition.contentType` was added. |
| `16.2.0` | `turbopack.rules.*.condition.query` was added. |
| `16.0.0` | `turbopack.debugIds` was added. |
| `16.0.0` | `turbopack.rules.*.condition` was added. |
| `15.3.0` | `experimental.turbo` is changed to `turbopack`. |
| `13.0.0` | `experimental.turbo` introduced. |
