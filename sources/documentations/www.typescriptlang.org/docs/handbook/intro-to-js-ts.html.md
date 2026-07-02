---
title: "Documentation - JS Projects Utilizing TypeScript"
source_url: "https://www.typescriptlang.org/docs/handbook/intro-to-js-ts.html"
crawled_at: "2026-07-02T07:43:35.454Z"
---

The type system in TypeScript has different levels of strictness when working with a codebase:

-   A type-system based only on inference with JavaScript code
-   Incremental typing in JavaScript [via JSDoc](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
-   Using `// @ts-check` in a JavaScript file
-   TypeScript code
-   TypeScript with [`strict`](https://www.typescriptlang.org/tsconfig#strict) enabled

Each step represents a move towards a safer type-system, but not every project needs that level of verification.

## [](#typescript-with-javascript)TypeScript with JavaScript

This is when you use an editor which uses TypeScript to provide tooling like auto-complete, jump to symbol and refactoring tools like rename. The [homepage](https://www.typescriptlang.org/) has a list of editors which have TypeScript plugins.

## [](#providing-type-hints-in-js-via-jsdoc)Providing Type Hints in JS via JSDoc

In a `.js` file, types can often be inferred. When types can’t be inferred, they can be specified using JSDoc syntax.

JSDoc annotations that come before a declaration will be used to set the type of that declaration. For example:

js

`/** @type {number} */`

`var x;`

`x = 0; // OK`

`x = false; // OK?!`

[Try](https://www.typescriptlang.org/play/#code/PQKhAIAEBcE8AcCm4DeA7ArgWwEaIE4C+4IwAUAG4CG+4AHgNxll3gC84ADA+MMOAHkA0i3bgAZlQA2AZ0Q8+goQH4AhEA)

You can find the full list of supported JSDoc patterns [in JSDoc Supported Types](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html).

## [](#ts-check)`@ts-check`

The last line of the previous code sample would raise an error in TypeScript, but it doesn’t by default in a JS project. To enable errors in your JavaScript files add: `// @ts-check` to the first line in your `.js` files to have TypeScript raise it as an error.

js

`// @ts-check`

`/** @type {number} */`

`var x;`

`x = 0; // OK`

`x = false; // Not OK`

`Type 'boolean' is not assignable to type 'number'.2322Type 'boolean' is not assignable to type 'number'.`[Try](https://www.typescriptlang.org/play/#code/PTAEAEBcGcFoGMAWBTeBrAUCCyBOuB7XaALlACYBmc8rAKjokgE8AHZUAbwDsBXAWwBGeAL6g6wDADcAhrlAAPANwYMC0AF5QABiWhsAeQDSazaABmMgDbRke7ADkCkUMaA)

If you have a lot of JavaScript files you want to add errors to then you can switch to using a [`jsconfig.json`](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html). You can skip checking some files by adding a `// @ts-nocheck` comment to files.

TypeScript may offer you errors which you disagree with, in those cases you can ignore errors on specific lines by adding `// @ts-ignore` or `// @ts-expect-error` on the preceding line.

js

`// @ts-check`

`/** @type {number} */`

`var x;`

`x = 0; // OK`

`// @ts-expect-error`

`x = false; // Not OK`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEBcGcFoGMAWBTeBrAUMAVNikBPAB2VAG8A7AVwFsAjZAJwF9RtgMA3AQ0dAA8A3Bgz9QAXlAAGQaBCgA8gGksYKHGT8S8SLCaMA9o1ETQAM24AbaMlnyAcgciKlQA)

To learn more about how JavaScript is interpreted by TypeScript read [How TS Type Checks JS](https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html)
