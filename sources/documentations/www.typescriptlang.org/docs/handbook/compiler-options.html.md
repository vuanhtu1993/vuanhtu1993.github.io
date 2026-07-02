---
title: "Documentation - tsc CLI Options"
source_url: "https://www.typescriptlang.org/docs/handbook/compiler-options.html"
crawled_at: "2026-07-02T07:43:55.846Z"
---

## [](#using-the-cli)Using the CLI

Running `tsc` locally will compile the closest project defined by a `tsconfig.json`, or you can compile a set of TypeScript files by passing in a glob of files you want. When input files are specified on the command line, `tsconfig.json` files are ignored.

sh

`# Run a compile based on a backwards look through the fs for a tsconfig.json`

`tsc`

`# Emit JS for just the index.ts with the compiler defaults`

`tsc index.ts`

`# Emit JS for any .ts files in the folder src, with the default settings`

`tsc src/*.ts`

`# Emit files referenced in with the compiler settings from tsconfig.production.json`

`tsc --project tsconfig.production.json`

`# Emit d.ts files for a js file with showing compiler options which are booleans`

`tsc index.js --declaration --emitDeclarationOnly`

`# Emit a single .js file from two files via compiler options which take string arguments`

`tsc app.ts util.ts --target esnext --outfile index.js`

## [](#compiler-options)Compiler Options

**If you’re looking for more information about the compiler options in a tsconfig, check out the [TSConfig Reference](https://www.typescriptlang.org/tsconfig)**

### CLI Commands

| Flag | Type |
| --- | --- |
| `--all` | 
`boolean`

 |
| 

Show all compiler options.

 |
| `--help` | 

`boolean`

 |
| 

Gives local information for help on the CLI.

 |
| `--ignoreConfig` | 

`boolean`

 |
| 

Ignore the tsconfig found and build with commandline options and files.

 |
| `--init` | 

`boolean`

 |
| 

Initializes a TypeScript project and creates a tsconfig.json file.

 |
| `--listFilesOnly` | 

`boolean`

 |
| 

Print names of files that are part of the compilation and then stop processing.

 |
| `--locale` | 

`string`

 |
| 

Set the language of the messaging from TypeScript. This does not affect emit.

 |
| `--project` | 

`string`

 |
| 

Compile the project given the path to its configuration file, or to a folder with a 'tsconfig.json'.

 |
| `--showConfig` | 

`boolean`

 |
| 

Print the final configuration instead of building.

 |
| `--version` | 

`boolean`

 |
| 

Print the compiler's version.

 |

### Build Options

| Flag | Type |
| --- | --- |
| `--build` | 
`boolean`

 |
| 

Build one or more projects and their dependencies, if out of date

 |
| `--clean` | 

`boolean`

 |
| 

Delete the outputs of all projects.

 |
| `--dry` | 

`boolean`

 |
| 

Show what would be built (or deleted, if specified with '--clean')

 |
| `[--force](https://www.typescriptlang.org/tsconfig/#force)` | 

`boolean`

 |
| 

Build all projects, including those that appear to be up to date.

 |
| `[--verbose](https://www.typescriptlang.org/tsconfig/#verbose)` | 

`boolean`

 |
| 

Enable verbose logging.

 |

### Watch Options

| Flag | Type |
| --- | --- |
| `[--excludeDirectories](https://www.typescriptlang.org/tsconfig/#excludeDirectories)` | 
`list`

 |
| 

Remove a list of directories from the watch process.

 |
| `[--excludeFiles](https://www.typescriptlang.org/tsconfig/#excludeFiles)` | 

`list`

 |
| 

Remove a list of files from the watch mode's processing.

 |
| `[--fallbackPolling](https://www.typescriptlang.org/tsconfig/#fallbackPolling)` | 

`fixedinterval`, `priorityinterval`, `dynamicpriority`, or `fixedchunksize`

 |
| 

Specify what approach the watcher should use if the system runs out of native file watchers.

 |
| `[--synchronousWatchDirectory](https://www.typescriptlang.org/tsconfig/#synchronousWatchDirectory)` | 

`boolean`

 |
| 

Synchronously call callbacks and update the state of directory watchers on platforms that don\`t support recursive watching natively.

 |
| `--watch` | 

`boolean`

 |
| 

Watch input files.

 |
| `[--watchDirectory](https://www.typescriptlang.org/tsconfig/#watchDirectory)` | 

`usefsevents`, `fixedpollinginterval`, `dynamicprioritypolling`, or `fixedchunksizepolling`

 |
| 

Specify how directories are watched on systems that lack recursive file-watching functionality.

 |
| `[--watchFile](https://www.typescriptlang.org/tsconfig/#watchFile)` | 

`fixedpollinginterval`, `prioritypollinginterval`, `dynamicprioritypolling`, `fixedchunksizepolling`, `usefsevents`, or `usefseventsonparentdirectory`

 |
| 

Specify how the TypeScript watch mode works.

 |

### Compiler Flags

| Flag | Type | Default |
| --- | --- | --- |
| `[--allowArbitraryExtensions](https://www.typescriptlang.org/tsconfig/#allowArbitraryExtensions)` | 
`boolean`

 | 

`false`

 |
| 

Enable importing files with any extension, provided a declaration file is present.

 |
| `[--allowImportingTsExtensions](https://www.typescriptlang.org/tsconfig/#allowImportingTsExtensions)` | 

`boolean`

 | 

`true` if [`rewriteRelativeImportExtensions`](#rewriteRelativeImportExtensions); `false` otherwise.

 |
| 

Allow imports to include TypeScript file extensions.

 |
| `[--allowJs](https://www.typescriptlang.org/tsconfig/#allowJs)` | 

`boolean`

 | 

`false`, unless `checkJs` is set

 |
| 

Allow JavaScript files to be a part of your program. Use the `checkJS` option to get errors from these files.

 |
| `[--allowSyntheticDefaultImports](https://www.typescriptlang.org/tsconfig/#allowSyntheticDefaultImports)` | 

`boolean`

 | 

`true` if [`esModuleInterop`](#esModuleInterop) is enabled, [`module`](#module) is `system`, or [`moduleResolution`](#module-resolution) is `bundler`; `false` otherwise.

 |
| 

Allow 'import x from y' when a module doesn't have a default export.

 |
| `[--allowUmdGlobalAccess](https://www.typescriptlang.org/tsconfig/#allowUmdGlobalAccess)` | 

`boolean`

 | 

`false`

 |
| 

Allow accessing UMD globals from modules.

 |
| `[--allowUnreachableCode](https://www.typescriptlang.org/tsconfig/#allowUnreachableCode)` | 

`boolean`

 |  |
| 

Disable error reporting for unreachable code.

 |
| `[--allowUnusedLabels](https://www.typescriptlang.org/tsconfig/#allowUnusedLabels)` | 

`boolean`

 |  |
| 

Disable error reporting for unused labels.

 |
| `[--alwaysStrict](https://www.typescriptlang.org/tsconfig/#alwaysStrict)` | 

`boolean`

 | 

`true` if [`strict`](#strict); `false` otherwise.

 |
| 

Ensure 'use strict' is always emitted.

 |
| `[--assumeChangesOnlyAffectDirectDependencies](https://www.typescriptlang.org/tsconfig/#assumeChangesOnlyAffectDirectDependencies)` | 

`boolean`

 | 

`false`

 |
| 

Have recompiles in projects that use [`incremental`](#incremental) and `watch` mode assume that changes within a file will only affect files directly depending on it.

 |
| `[--baseUrl](https://www.typescriptlang.org/tsconfig/#baseUrl)` | 

`string`

 |  |
| 

Specify the base directory to resolve bare specifier module names.

 |
| `[--charset](https://www.typescriptlang.org/tsconfig/#charset)` | 

`string`

 | 

`utf8`

 |
| 

No longer supported. In early versions, manually set the text encoding for reading files.

 |
| `[--checkJs](https://www.typescriptlang.org/tsconfig/#checkJs)` | 

`boolean`

 | 

`false`

 |
| 

Enable error reporting in type-checked JavaScript files.

 |
| `[--composite](https://www.typescriptlang.org/tsconfig/#composite)` | 

`boolean`

 | 

`false`

 |
| 

Enable constraints that allow a TypeScript project to be used with project references.

 |
| `[--customConditions](https://www.typescriptlang.org/tsconfig/#customConditions)` | 

`list`

 |  |
| 

Conditions to set in addition to the resolver-specific defaults when resolving imports.

 |
| `[--declaration](https://www.typescriptlang.org/tsconfig/#declaration)` | 

`boolean`

 | 

`true` if [`composite`](#composite); `false` otherwise.

 |
| 

Generate .d.ts files from TypeScript and JavaScript files in your project.

 |
| `[--declarationDir](https://www.typescriptlang.org/tsconfig/#declarationDir)` | 

`string`

 |  |
| 

Specify the output directory for generated declaration files.

 |
| `[--declarationMap](https://www.typescriptlang.org/tsconfig/#declarationMap)` | 

`boolean`

 | 

`false`

 |
| 

Create sourcemaps for d.ts files.

 |
| `[--diagnostics](https://www.typescriptlang.org/tsconfig/#diagnostics)` | 

`boolean`

 | 

`false`

 |
| 

Output compiler performance information after building.

 |
| `[--disableReferencedProjectLoad](https://www.typescriptlang.org/tsconfig/#disableReferencedProjectLoad)` | 

`boolean`

 | 

`false`

 |
| 

Reduce the number of projects loaded automatically by TypeScript.

 |
| `[--disableSizeLimit](https://www.typescriptlang.org/tsconfig/#disableSizeLimit)` | 

`boolean`

 | 

`false`

 |
| 

Remove the 20mb cap on total source code size for JavaScript files in the TypeScript language server.

 |
| `[--disableSolutionSearching](https://www.typescriptlang.org/tsconfig/#disableSolutionSearching)` | 

`boolean`

 | 

`false`

 |
| 

Opt a project out of multi-project reference checking when editing.

 |
| `[--disableSourceOfProjectReferenceRedirect](https://www.typescriptlang.org/tsconfig/#disableSourceOfProjectReferenceRedirect)` | 

`boolean`

 | 

`false`

 |
| 

Disable preferring source files instead of declaration files when referencing composite projects.

 |
| `[--downlevelIteration](https://www.typescriptlang.org/tsconfig/#downlevelIteration)` | 

`boolean`

 | 

`false`

 |
| 

Emit more compliant, but verbose and less performant JavaScript for iteration.

 |
| `[--emitBOM](https://www.typescriptlang.org/tsconfig/#emitBOM)` | 

`boolean`

 | 

`false`

 |
| 

Emit a UTF-8 Byte Order Mark (BOM) in the beginning of output files.

 |
| `[--emitDeclarationOnly](https://www.typescriptlang.org/tsconfig/#emitDeclarationOnly)` | 

`boolean`

 | 

`false`

 |
| 

Only output d.ts files and not JavaScript files.

 |
| `[--emitDecoratorMetadata](https://www.typescriptlang.org/tsconfig/#emitDecoratorMetadata)` | 

`boolean`

 | 

`false`

 |
| 

Emit design-type metadata for decorated declarations in source files.

 |
| `[--erasableSyntaxOnly](https://www.typescriptlang.org/tsconfig/#erasableSyntaxOnly)` | 

`boolean`

 | 

`false`

 |
| 

Do not allow runtime constructs that are not part of ECMAScript.

 |
| `[--esModuleInterop](https://www.typescriptlang.org/tsconfig/#esModuleInterop)` | 

`boolean`

 | 

`true` if [`module`](#module) is `node16`, `nodenext`, or `preserve`; `false` otherwise.

 |
| 

Emit additional JavaScript to ease support for importing CommonJS modules. This enables [`allowSyntheticDefaultImports`](#allowSyntheticDefaultImports) for type compatibility.

 |
| `[--exactOptionalPropertyTypes](https://www.typescriptlang.org/tsconfig/#exactOptionalPropertyTypes)` | 

`boolean`

 | 

`false`

 |
| 

Interpret optional property types as written, rather than adding `undefined`.

 |
| `[--experimentalDecorators](https://www.typescriptlang.org/tsconfig/#experimentalDecorators)` | 

`boolean`

 | 

`false`

 |
| 

Enable experimental support for TC39 stage 2 draft decorators.

 |
| `[--explainFiles](https://www.typescriptlang.org/tsconfig/#explainFiles)` | 

`boolean`

 | 

`false`

 |
| 

Print files read during the compilation including why it was included.

 |
| `[--extendedDiagnostics](https://www.typescriptlang.org/tsconfig/#extendedDiagnostics)` | 

`boolean`

 | 

`false`

 |
| 

Output more detailed compiler performance information after building.

 |
| `[--forceConsistentCasingInFileNames](https://www.typescriptlang.org/tsconfig/#forceConsistentCasingInFileNames)` | 

`boolean`

 | 

`true`

 |
| 

Ensure that casing is correct in imports.

 |
| `[--generateCpuProfile](https://www.typescriptlang.org/tsconfig/#generateCpuProfile)` | 

`string`

 | 

`profile.cpuprofile`

 |
| 

Emit a v8 CPU profile of the compiler run for debugging.

 |
| `[--generateTrace](https://www.typescriptlang.org/tsconfig/#generateTrace)` | 

`string`

 |  |
| 

Generates an event trace and a list of types.

 |
| `[--importHelpers](https://www.typescriptlang.org/tsconfig/#importHelpers)` | 

`boolean`

 | 

`false`

 |
| 

Allow importing helper functions from tslib once per project, instead of including them per-file.

 |
| `[--importsNotUsedAsValues](https://www.typescriptlang.org/tsconfig/#importsNotUsedAsValues)` | 

`remove`, `preserve`, or `error`

 | 

`remove`

 |
| 

Specify emit/checking behavior for imports that are only used for types.

 |
| `[--incremental](https://www.typescriptlang.org/tsconfig/#incremental)` | 

`boolean`

 | 

`true` if [`composite`](#composite); `false` otherwise.

 |
| 

Save .tsbuildinfo files to allow for incremental compilation of projects.

 |
| `[--inlineSourceMap](https://www.typescriptlang.org/tsconfig/#inlineSourceMap)` | 

`boolean`

 | 

`false`

 |
| 

Include sourcemap files inside the emitted JavaScript.

 |
| `[--inlineSources](https://www.typescriptlang.org/tsconfig/#inlineSources)` | 

`boolean`

 | 

`false`

 |
| 

Include source code in the sourcemaps inside the emitted JavaScript.

 |
| `[--isolatedDeclarations](https://www.typescriptlang.org/tsconfig/#isolatedDeclarations)` | 

`boolean`

 | 

`false`

 |
| 

Require sufficient annotation on exports so other tools can trivially generate declaration files.

 |
| `[--isolatedModules](https://www.typescriptlang.org/tsconfig/#isolatedModules)` | 

`boolean`

 | 

`true` if [`verbatimModuleSyntax`](#verbatimModuleSyntax); `false` otherwise.

 |
| 

Ensure that each file can be safely transpiled without relying on other imports.

 |
| `[--jsx](https://www.typescriptlang.org/tsconfig/#jsx)` | 

`preserve`, `react`, `react-native`, `react-jsx`, or `react-jsxdev`

 |  |
| 

Specify what JSX code is generated.

 |
| `[--jsxFactory](https://www.typescriptlang.org/tsconfig/#jsxFactory)` | 

`string`

 | 

`React.createElement`

 |
| 

Specify the JSX factory function used when targeting React JSX emit, e.g. 'React.createElement' or 'h'.

 |
| `[--jsxFragmentFactory](https://www.typescriptlang.org/tsconfig/#jsxFragmentFactory)` | 

`string`

 | 

`React.Fragment`

 |
| 

Specify the JSX Fragment reference used for fragments when targeting React JSX emit e.g. 'React.Fragment' or 'Fragment'.

 |
| `[--jsxImportSource](https://www.typescriptlang.org/tsconfig/#jsxImportSource)` | 

`string`

 | 

`react`

 |
| 

Specify module specifier used to import the JSX factory functions when using `jsx: react-jsx*`.

 |
| `[--keyofStringsOnly](https://www.typescriptlang.org/tsconfig/#keyofStringsOnly)` | 

`boolean`

 | 

`false`

 |
| 

Make keyof only return strings instead of string, numbers or symbols. Legacy option.

 |
| `[--lib](https://www.typescriptlang.org/tsconfig/#lib)` | 

`list`

 |  |
| 

Specify a set of bundled library declaration files that describe the target runtime environment.

 |
| `[--libReplacement](https://www.typescriptlang.org/tsconfig/#libReplacement)` | 

`boolean`

 | 

`false`

 |
| 

Enable substitution of default `lib` files with custom ones.

 |
| `[--listEmittedFiles](https://www.typescriptlang.org/tsconfig/#listEmittedFiles)` | 

`boolean`

 | 

`false`

 |
| 

Print the names of emitted files after a compilation.

 |
| `[--listFiles](https://www.typescriptlang.org/tsconfig/#listFiles)` | 

`boolean`

 | 

`false`

 |
| 

Print all of the files read during the compilation.

 |
| `[--mapRoot](https://www.typescriptlang.org/tsconfig/#mapRoot)` | 

`string`

 |  |
| 

Specify the location where debugger should locate map files instead of generated locations.

 |
| `[--maxNodeModuleJsDepth](https://www.typescriptlang.org/tsconfig/#maxNodeModuleJsDepth)` | 

`number`

 | 

`0`

 |
| 

Specify the maximum folder depth used for checking JavaScript files from `node_modules`. Only applicable with [`allowJs`](#allowJs).

 |
| `[--module](https://www.typescriptlang.org/tsconfig/#module)` | 

`none`, `commonjs`, `amd`, `umd`, `system`, `es6`/`es2015`, `es2020`, `es2022`, `esnext`, `node16`, `node18`, `node20`, `nodenext`, or `preserve`

 | 

`CommonJS` if [`target`](#target) is `ES5`; `ES6`/`ES2015` otherwise.

 |
| 

Specify what module code is generated.

 |
| `[--moduleDetection](https://www.typescriptlang.org/tsconfig/#moduleDetection)` | 

`legacy`, `auto`, or `force`

 | 

"auto": Treat files with imports, exports, import.meta, jsx (with jsx: react-jsx), or esm format (with module: node16+) as modules.

 |
| 

Specify what method is used to detect whether a file is a script or a module.

 |
| `[--moduleResolution](https://www.typescriptlang.org/tsconfig/#moduleResolution)` | 

`classic`, `node10`/`node`, `node16`, `nodenext`, or `bundler`

 | 

`Node10` if [`module`](#module) is `CommonJS`; `Node16` if [`module`](#module) is `Node16`, `Node18`, or `Node20`; `NodeNext` if [`module`](#module) is `NodeNext`; `Bundler` if [`module`](#module) is `Preserve`; `Classic` otherwise.

 |
| 

Specify how TypeScript looks up a file from a given module specifier.

 |
| `[--moduleSuffixes](https://www.typescriptlang.org/tsconfig/#moduleSuffixes)` | 

`list`

 |  |
| 

List of file name suffixes to search when resolving a module.

 |
| `[--newLine](https://www.typescriptlang.org/tsconfig/#newLine)` | 

`crlf` or `lf`

 | 

`lf`

 |
| 

Set the newline character for emitting files.

 |
| `[--noCheck](https://www.typescriptlang.org/tsconfig/#noCheck)` | 

`boolean`

 | 

`false`

 |
| 

Disable full type checking (only critical parse and emit errors will be reported).

 |
| `[--noEmit](https://www.typescriptlang.org/tsconfig/#noEmit)` | 

`boolean`

 | 

`false`

 |
| 

Disable emitting files from a compilation.

 |
| `[--noEmitHelpers](https://www.typescriptlang.org/tsconfig/#noEmitHelpers)` | 

`boolean`

 | 

`false`

 |
| 

Disable generating custom helper functions like `__extends` in compiled output.

 |
| `[--noEmitOnError](https://www.typescriptlang.org/tsconfig/#noEmitOnError)` | 

`boolean`

 | 

`false`

 |
| 

Disable emitting files if any type checking errors are reported.

 |
| `[--noErrorTruncation](https://www.typescriptlang.org/tsconfig/#noErrorTruncation)` | 

`boolean`

 | 

`false`

 |
| 

Disable truncating types in error messages.

 |
| `[--noFallthroughCasesInSwitch](https://www.typescriptlang.org/tsconfig/#noFallthroughCasesInSwitch)` | 

`boolean`

 | 

`false`

 |
| 

Enable error reporting for fallthrough cases in switch statements.

 |
| `[--noImplicitAny](https://www.typescriptlang.org/tsconfig/#noImplicitAny)` | 

`boolean`

 | 

`true` if [`strict`](#strict); `false` otherwise.

 |
| 

Enable error reporting for expressions and declarations with an implied `any` type.

 |
| `[--noImplicitOverride](https://www.typescriptlang.org/tsconfig/#noImplicitOverride)` | 

`boolean`

 | 

`false`

 |
| 

Ensure overriding members in derived classes are marked with an override modifier.

 |
| `[--noImplicitReturns](https://www.typescriptlang.org/tsconfig/#noImplicitReturns)` | 

`boolean`

 | 

`false`

 |
| 

Enable error reporting for codepaths that do not explicitly return in a function.

 |
| `[--noImplicitThis](https://www.typescriptlang.org/tsconfig/#noImplicitThis)` | 

`boolean`

 | 

`true` if [`strict`](#strict); `false` otherwise.

 |
| 

Enable error reporting when `this` is given the type `any`.

 |
| `[--noImplicitUseStrict](https://www.typescriptlang.org/tsconfig/#noImplicitUseStrict)` | 

`boolean`

 | 

`false`

 |
| 

Disable adding 'use strict' directives in emitted JavaScript files.

 |
| `[--noLib](https://www.typescriptlang.org/tsconfig/#noLib)` | 

`boolean`

 | 

`false`

 |
| 

Disable including any library files, including the default lib.d.ts.

 |
| `[--noPropertyAccessFromIndexSignature](https://www.typescriptlang.org/tsconfig/#noPropertyAccessFromIndexSignature)` | 

`boolean`

 | 

`false`

 |
| 

Enforces using indexed accessors for keys declared using an indexed type.

 |
| `[--noResolve](https://www.typescriptlang.org/tsconfig/#noResolve)` | 

`boolean`

 | 

`false`

 |
| 

Disallow `import`s, `require`s or `<reference>`s from expanding the number of files TypeScript should add to a project.

 |
| `[--noStrictGenericChecks](https://www.typescriptlang.org/tsconfig/#noStrictGenericChecks)` | 

`boolean`

 | 

`false`

 |
| 

Disable strict checking of generic signatures in function types.

 |
| `[--noUncheckedIndexedAccess](https://www.typescriptlang.org/tsconfig/#noUncheckedIndexedAccess)` | 

`boolean`

 | 

`false`

 |
| 

Add `undefined` to a type when accessed using an index.

 |
| `[--noUncheckedSideEffectImports](https://www.typescriptlang.org/tsconfig/#noUncheckedSideEffectImports)` | 

`boolean`

 | 

`true`

 |
| 

Check side effect imports.

 |
| `[--noUnusedLocals](https://www.typescriptlang.org/tsconfig/#noUnusedLocals)` | 

`boolean`

 | 

`false`

 |
| 

Enable error reporting when local variables aren't read.

 |
| `[--noUnusedParameters](https://www.typescriptlang.org/tsconfig/#noUnusedParameters)` | 

`boolean`

 | 

`false`

 |
| 

Raise an error when a function parameter isn't read.

 |
| `[--out](https://www.typescriptlang.org/tsconfig/#out)` | 

`string`

 |  |
| 

Deprecated setting. Use [`outFile`](#outFile) instead.

 |
| `[--outDir](https://www.typescriptlang.org/tsconfig/#outDir)` | 

`string`

 |  |
| 

Specify an output folder for all emitted files.

 |
| `[--outFile](https://www.typescriptlang.org/tsconfig/#outFile)` | 

`string`

 |  |
| 

Specify a file that bundles all outputs into one JavaScript file. If [`declaration`](#declaration) is true, also designates a file that bundles all .d.ts output.

 |
| `[--paths](https://www.typescriptlang.org/tsconfig/#paths)` | 

`object`

 |  |
| 

Specify a set of entries that re-map imports to additional lookup locations.

 |
| `[--plugins](https://www.typescriptlang.org/tsconfig/#plugins)` | 

`list`

 |  |
| 

Specify a list of language service plugins to include.

 |
| `[--preserveConstEnums](https://www.typescriptlang.org/tsconfig/#preserveConstEnums)` | 

`boolean`

 | 

`true` if [`isolatedModules`](#isolatedModules); `false` otherwise.

 |
| 

Disable erasing `const enum` declarations in generated code.

 |
| `[--preserveSymlinks](https://www.typescriptlang.org/tsconfig/#preserveSymlinks)` | 

`boolean`

 | 

`false`

 |
| 

Disable resolving symlinks to their realpath. This correlates to the same flag in node.

 |
| `[--preserveValueImports](https://www.typescriptlang.org/tsconfig/#preserveValueImports)` | 

`boolean`

 | 

`false`

 |
| 

Preserve unused imported values in the JavaScript output that would otherwise be removed.

 |
| `[--preserveWatchOutput](https://www.typescriptlang.org/tsconfig/#preserveWatchOutput)` | 

`boolean`

 | 

`false`

 |
| 

Disable wiping the console in watch mode.

 |
| `[--pretty](https://www.typescriptlang.org/tsconfig/#pretty)` | 

`boolean`

 | 

`true`

 |
| 

Enable color and formatting in TypeScript's output to make compiler errors easier to read.

 |
| `[--reactNamespace](https://www.typescriptlang.org/tsconfig/#reactNamespace)` | 

`string`

 | 

`React`

 |
| 

Specify the object invoked for `createElement`. This only applies when targeting `react` JSX emit.

 |
| `[--removeComments](https://www.typescriptlang.org/tsconfig/#removeComments)` | 

`boolean`

 | 

`false`

 |
| 

Disable emitting comments.

 |
| `[--resolveJsonModule](https://www.typescriptlang.org/tsconfig/#resolveJsonModule)` | 

`boolean`

 | 

`false`

 |
| 

Enable importing .json files.

 |
| `[--resolvePackageJsonExports](https://www.typescriptlang.org/tsconfig/#resolvePackageJsonExports)` | 

`boolean`

 | 

`true` when [`moduleResolution`](#moduleResolution) is `node16`, `nodenext`, or `bundler`; otherwise `false`

 |
| 

Use the package.json 'exports' field when resolving package imports.

 |
| `[--resolvePackageJsonImports](https://www.typescriptlang.org/tsconfig/#resolvePackageJsonImports)` | 

`boolean`

 | 

`true` when [`moduleResolution`](#moduleResolution) is `node16`, `nodenext`, or `bundler`; otherwise `false`

 |
| 

Use the package.json 'imports' field when resolving imports.

 |
| `[--rewriteRelativeImportExtensions](https://www.typescriptlang.org/tsconfig/#rewriteRelativeImportExtensions)` | 

`boolean`

 | 

`false`

 |
| 

Rewrite `.ts`, `.tsx`, `.mts`, and `.cts` file extensions in relative import paths to their JavaScript equivalent in output files.

 |
| `[--rootDir](https://www.typescriptlang.org/tsconfig/#rootDir)` | 

`string`

 | 

Computed from the list of input files.

 |
| 

Specify the root folder within your source files.

 |
| `[--rootDirs](https://www.typescriptlang.org/tsconfig/#rootDirs)` | 

`list`

 | 

Computed from the list of input files.

 |
| 

Allow multiple folders to be treated as one when resolving modules.

 |
| `[--skipDefaultLibCheck](https://www.typescriptlang.org/tsconfig/#skipDefaultLibCheck)` | 

`boolean`

 | 

`false`

 |
| 

Skip type checking .d.ts files that are included with TypeScript.

 |
| `[--skipLibCheck](https://www.typescriptlang.org/tsconfig/#skipLibCheck)` | 

`boolean`

 | 

`false`

 |
| 

Skip type checking all .d.ts files.

 |
| `[--sourceMap](https://www.typescriptlang.org/tsconfig/#sourceMap)` | 

`boolean`

 | 

`false`

 |
| 

Create source map files for emitted JavaScript files.

 |
| `[--sourceRoot](https://www.typescriptlang.org/tsconfig/#sourceRoot)` | 

`string`

 |  |
| 

Specify the root path for debuggers to find the reference source code.

 |
| `[--stableTypeOrdering](https://www.typescriptlang.org/tsconfig/#stableTypeOrdering)` | 

`boolean`

 | 

`false`

 |
| 

Ensure types are ordered stably and deterministically across compilations.

 |
| `[--stopBuildOnErrors](https://www.typescriptlang.org/tsconfig/#stopBuildOnErrors)` | 

`boolean`

 |  |
| 

Skip building downstream projects on error in upstream project.

 |
| `[--strict](https://www.typescriptlang.org/tsconfig/#strict)` | 

`boolean`

 | 

`true`

 |
| 

Enable all strict type-checking options.

 |
| `[--strictBindCallApply](https://www.typescriptlang.org/tsconfig/#strictBindCallApply)` | 

`boolean`

 | 

`true` if [`strict`](#strict); `false` otherwise.

 |
| 

Check that the arguments for `bind`, `call`, and `apply` methods match the original function.

 |
| `[--strictBuiltinIteratorReturn](https://www.typescriptlang.org/tsconfig/#strictBuiltinIteratorReturn)` | 

`boolean`

 | 

`true` if [`strict`](#strict); `false` otherwise.

 |
| 

Built-in iterators are instantiated with a TReturn type of undefined instead of any.

 |
| `[--strictFunctionTypes](https://www.typescriptlang.org/tsconfig/#strictFunctionTypes)` | 

`boolean`

 | 

`true` if [`strict`](#strict); `false` otherwise.

 |
| 

When assigning functions, check to ensure parameters and the return values are subtype-compatible.

 |
| `[--strictNullChecks](https://www.typescriptlang.org/tsconfig/#strictNullChecks)` | 

`boolean`

 | 

`true` if [`strict`](#strict); `false` otherwise.

 |
| 

When type checking, take into account `null` and `undefined`.

 |
| `[--strictPropertyInitialization](https://www.typescriptlang.org/tsconfig/#strictPropertyInitialization)` | 

`boolean`

 | 

`true` if [`strict`](#strict); `false` otherwise.

 |
| 

Check for class properties that are declared but not set in the constructor.

 |
| `[--stripInternal](https://www.typescriptlang.org/tsconfig/#stripInternal)` | 

`boolean`

 | 

`false`

 |
| 

Disable emitting declarations that have `@internal` in their JSDoc comments.

 |
| `[--suppressExcessPropertyErrors](https://www.typescriptlang.org/tsconfig/#suppressExcessPropertyErrors)` | 

`boolean`

 | 

`false`

 |
| 

Disable reporting of excess property errors during the creation of object literals.

 |
| `[--suppressImplicitAnyIndexErrors](https://www.typescriptlang.org/tsconfig/#suppressImplicitAnyIndexErrors)` | 

`boolean`

 | 

`false`

 |
| 

Suppress [`noImplicitAny`](#noImplicitAny) errors when indexing objects that lack index signatures.

 |
| `[--target](https://www.typescriptlang.org/tsconfig/#target)` | 

`es3`, `es5`, `es6`/`es2015`, `es2016`, `es2017`, `es2018`, `es2019`, `es2020`, `es2021`, `es2022`, `es2023`, `es2024`, `es2025`, or `esnext`

 | 

`es2023` if [`module`](#module) is `node20`; `esnext` if [`module`](#module) is `nodenext`; `ES5` otherwise.

 |
| 

Set the JavaScript language version for emitted JavaScript and include compatible library declarations.

 |
| `[--traceResolution](https://www.typescriptlang.org/tsconfig/#traceResolution)` | 

`boolean`

 | 

`false`

 |
| 

Log paths used during the [`moduleResolution`](#moduleResolution) process.

 |
| `[--tsBuildInfoFile](https://www.typescriptlang.org/tsconfig/#tsBuildInfoFile)` | 

`string`

 | 

`.tsbuildinfo`

 |
| 

The file to store `.tsbuildinfo` incremental build information in.

 |
| `[--typeRoots](https://www.typescriptlang.org/tsconfig/#typeRoots)` | 

`list`

 |  |
| 

Specify multiple folders that act like `./node_modules/@types`.

 |
| `[--types](https://www.typescriptlang.org/tsconfig/#types)` | 

`list`

 |  |
| 

Specify type package names to be included without being referenced in a source file.

 |
| `[--useDefineForClassFields](https://www.typescriptlang.org/tsconfig/#useDefineForClassFields)` | 

`boolean`

 | 

`true` if [`target`](#target) is `ES2022` or higher, including `ESNext`; `false` otherwise.

 |
| 

Emit ECMAScript-standard-compliant class fields.

 |
| `[--useUnknownInCatchVariables](https://www.typescriptlang.org/tsconfig/#useUnknownInCatchVariables)` | 

`boolean`

 | 

`true` if [`strict`](#strict); `false` otherwise.

 |
| 

Default catch clause variables as `unknown` instead of `any`.

 |
| `[--verbatimModuleSyntax](https://www.typescriptlang.org/tsconfig/#verbatimModuleSyntax)` | 

`boolean`

 | 

`false`

 |
| 

Do not transform or elide any imports or exports not marked as type-only, ensuring they are written in the output file's format based on the 'module' setting.

 |

-   Every option is fully explained in the [TSConfig Reference](https://www.typescriptlang.org/tsconfig).
-   Learn how to use a [`tsconfig.json`](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) file.
-   Learn how to work in an [MSBuild project](https://www.typescriptlang.org/docs/handbook/compiler-options-in-msbuild.html).
