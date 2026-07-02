---
title: "Documentation - Modules"
source_url: "https://www.typescriptlang.org/docs/handbook/2/modules.html"
crawled_at: "2026-07-02T07:37:27.727Z"
---

JavaScript has a long history of different ways to handle modularizing code. Having been around since 2012, TypeScript has implemented support for a lot of these formats, but over time the community and the JavaScript specification has converged on a format called ES Modules (or ES6 modules). You might know it as the `import`/`export` syntax.

ES Modules was added to the JavaScript spec in 2015, and by 2020 had broad support in most web browsers and JavaScript runtimes.

For focus, the handbook will cover both ES Modules and its popular pre-cursor CommonJS `module.exports =` syntax, and you can find information about the other module patterns in the reference section under [Modules](https://www.typescriptlang.org/docs/handbook/modules.html).

## [](#how-javascript-modules-are-defined)How JavaScript Modules are Defined

In TypeScript, just as in ECMAScript 2015, any file containing a top-level `import` or `export` is considered a module.

Conversely, a file without any top-level import or export declarations is treated as a script whose contents are available in the global scope (and therefore to modules as well).

Modules are executed within their own scope, not in the global scope. This means that variables, functions, classes, etc. declared in a module are not visible outside the module unless they are explicitly exported using one of the export forms. Conversely, to consume a variable, function, class, interface, etc. exported from a different module, it has to be imported using one of the import forms.

## [](#non-modules)Non-modules

Before we start, it’s important to understand what TypeScript considers a module. The JavaScript specification declares that any JavaScript files without an `import` declaration, `export`, or top-level `await` should be considered a script and not a module.

Inside a script file variables and types are declared to be in the shared global scope, and it’s assumed that you’ll either use the [`outFile`](https://www.typescriptlang.org/tsconfig#outFile) compiler option to join multiple input files into one output file, or use multiple `<script>` tags in your HTML to load these files (in the correct order!).

If you have a file that doesn’t currently have any `import`s or `export`s, but you want to be treated as a module, add the line:

ts

`export {};`

[Try](https://www.typescriptlang.org/play/#code/KYDwDg9gTgLgBAbwL4G4g)

which will change the file to be a module exporting nothing. This syntax works regardless of your module target.

## [](#modules-in-typescript)Modules in TypeScript

> Additional Reading:  
> [Impatient JS (Modules)](https://exploringjs.com/impatient-js/ch_modules.html#overview-syntax-of-ecmascript-modules)  
> [MDN: JavaScript Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)  

There are three main things to consider when writing module-based code in TypeScript:

-   **Syntax**: What syntax do I want to use to import and export things?
-   **Module Resolution**: What is the relationship between module names (or paths) and files on disk?
-   **Module Output Target**: What should my emitted JavaScript module look like?

### [](#es-module-syntax)ES Module Syntax

A file can declare a main export via `export default`:

ts

`// @filename: hello.ts`

`export default function helloWorld() {`

  `console.log("Hello, world!");`

`}`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEDMEsBsFMB2BDAtvAXKAFvWsB7AOgBcBnAWACh4APABwICcTQATeSZAV1lcm6IAxiWgFEOPIQDqzWGwAUASlABvaqFBDxZAgiKEA5goBEACSkEANKADuctgEITSgNzUAvkA)

This is then imported via:

ts

`import helloWorld from "./hello.js";`

`helloWorld();`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEDMEsBsFMB2BDAtvAXKAFvWsB7AOgBcBnAWACh4APABwICcTQATeSZAV1lcm6IAxiWgFEOPIQDqzWGwAUASlABvaqFBDxZAgiKEA5goBEACSkEANKADuctgEITSgNzUAvtRAQYCFOhY0IgctKSUVD4AtDFC3CQxUdTQqIwskvgEskzyoJBMBKigJkTAuJlEAFZkJu5U5TIOyq5AA)

In addition to the default export, you can have more than one export of variables and functions via the `export` by omitting `default`:

ts

`// @filename: maths.ts`

`export var pi = 3.14;`

`export let squareTwo = 1.41;`

`export const phi = 1.61;`

`export class RandomNumberGenerator {}`

`export function absolute(num: number) {`

  `if (num < 0) return num * -1;`

  `return num;`

`}`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEDMEsBsFMB2BDAtvAXKVyAuALAZwDpdCBYAKHgA8AHAewCddQA3ZJ0O6UAXlABmYgEYALAG4qtRi1AJWhAI4BXTvAAqAdwb9QI4mJFTq9ZqwDGDRIVZ18vAQYBsxqtLNyLsZIUKgAJWREABMGVAA5FVQAI3gmAHEkeLxmUABvAF93U1lWSBVEC1xoa1BkGMIGWBVceAAKRGisJtj4gEoMqlBQaEhQRujQAB5QAAZOpnhcFSZEUFbQACpQAFo3Sh6pmbmF6JNMoA)

These can be used in another file via the `import` syntax:

ts

`import { pi, phi, absolute } from "./maths.js";`

`console.log(pi);`

`const absPhi = absolute(phi);`

        `const absPhi: number`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEDMEsBsFMB2BDAtvAXKVyAuALAZwDpdCBYAKHgA8AHAewCddQA3ZJ0O6UAXlABmYgEYALAG4qtRi1AJWhAI4BXTvAAqAdwb9QI4mJFTq9ZqwDGDRIVZ18vAQYBsx6WbkXYyQoVAAlZEQAEwZUADkVVAAjeCYAcSQ4vGZQAG8AX3dZVkgVRAtcaGtQZGjCBlgVXHgACkQorAaYuIBKdKpQUGhIUHqo0AAeUAAGdqZ4XBUmRFBm0AAqUABaN0ouiamZuaiTLMoQCBgEFHQsZDo6UgoDsGX7i2r75apoVBz07mgAGm4HX7KFSqNVAGVAkCYYVAACJiMAcAQSAArQjQkxUKw2SrwYiwBgAc1qPFaJkxtlK5QACg49IDKtU6vZoCSqIcuqAAHoAfiAA)

### [](#additional-import-syntax)Additional Import Syntax

An import can be renamed using a format like `import {old as new}`:

ts

`import { pi as π } from "./maths.js";`

`console.log(π);`

           `(alias) var π: number
import π`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEDMEsBsFMB2BDAtvAXKVyAuALAZwDpdCBYAKHgA8AHAewCddQA3ZJ0O6UAXlABmYgEYALAG4qICDAQp0WZHTqkKlGQFptAYwCuubZqrRUjFqADe3XskKhAA8CgAvqEhMGqUACJiwHAQkAFaE3lKUVDoMiIQMCMSwDADmABQOAJThMqA5ubkAegD8QA)

You can mix and match the above syntax into a single `import`:

ts

`// @filename: maths.ts`

`export const pi = 3.14;`

`export default class RandomNumberGenerator {}`

`// @filename: app.ts`

`import RandomNumberGenerator, { pi as π } from "./maths.js";`

`RandomNumberGenerator;`

         `(alias) class RandomNumberGenerator
import RandomNumberGenerator`

`console.log(π);`

           `(alias) const π: 3.14
import π`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEDMEsBsFMB2BDAtvAXKVyAuALAZwDpdCBYAKHgA8AHAewCddQBjBxQ1u6UAXlABmYgEYALAG4qtRi1AATeJGQBXWKzaxkhQqABKyRAoaoAcqtQAjeEwDiSW3magA3gF8qVEBBgIU6FjIdHSkFJTQqHKshsamFta2DohOuMwANG6gvKA6oIADwKDuoJBMpqAARMTAOAQkAFaEFdKUVLEm5pY29o5MzkwtPgB6APxelBxcDAjEsAwA5gAU+QCUg2Cgm1tbo0A)

You can take all of the exported objects and put them into a single namespace using `* as name`:

ts

`// @filename: app.ts`

`import * as math from "./maths.js";`

`console.log(math.pi);`

`const positivePhi = math.absolute(math.phi);`

          `const positivePhi: number`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEDMEsBsFMB2BDAtvAXKVyAuALAZwDpdCBYAKHgA8AHAewCddQA3ZJ0O6UAXlABmYgEYALAG4qtRi1AJWhAI4BXTvAAqAdwb9QI4mJFTq9ZqwDGDRIVZ18vAQYBsxqtLNzIKxBdzRrUGQAI0IGWBVceAAKRBVULDjUYPgmAEpQAG8qUFBoSFBY+NAAHlAABgymeFwVJkRQJNAAKlAAWjdKXOra+sb4kwBfKhB2traLSPG2kbAoOCQ0TCC6OlIKSmhUWVZW5EJsPHxQSCYGVFAAImJgHAISACtCS5MqKxtw+GJYBgBzaLu+GIPDSJnetm4DEI0H8bHgAAUHHpAcQQmEIlEAUdgQ5QbNcrkAHoAfiAA)

You can import a file and _not_ include any variables into your current module via `import "./file"`:

ts

`// @filename: app.ts`

`import "./maths.js";`

`console.log("3.14");`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEDMEsBsFMB2BDAtvAXKVyAuALAZwDpdCBYAKHgA8AHAewCddQA3ZJ0O6UAXlABmYgEYALAG4qIUAFp5AYwCuuebOlgocJGkyhkdOqQqVoqRi1AAiYsBwESAK0JWplKgoaJCDBMVgMAOYAFFbC4lYAlBJAA)

In this case, the `import` does nothing. However, all of the code in `maths.ts` was evaluated, which could trigger side-effects which affect other objects.

#### [](#typescript-specific-es-module-syntax)TypeScript Specific ES Module Syntax

Types can be exported and imported using the same syntax as JavaScript values:

ts

`// @filename: animal.ts`

`export type Cat = { breed: string; yearOfBirth: number };`

`export interface Dog {`

  `breeds: string[];`

  `yearOfBirth: number;`

`}`

`// @filename: app.ts`

`import { Cat, Dog } from "./animal.js";`

`type Animals = Cat | Dog;`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEDMEsBsFMB2BDAtvAXKZjqubAHQAuAzgLABQ8AHgA4D2ATsaMQJ53ygDCyrAXlABvUACMm8eABMspYk2iIA5gG5Q7eMiYB5SACFoLABZZEAV1Rj4TUAF9VVKrUYtQS4jcjIAxtwAiDMoiVKDikjKkcgpKygDaALqOlGGa2nqGJmaW1kzJdk6UIBAwCCjoWMh0dCQUlHiurKJ8xAA0oIHBdqCQTAyooABEhMA4eASEAFakg8kcXKAAgrj4sKSgQi2gAD4dQapAA)

TypeScript has extended the `import` syntax with two concepts for declaring an import of a type:

###### [](#import-type)`import type`

Which is an import statement which can _only_ import types:

ts

`// @filename: animal.ts`

`export type Cat = { breed: string; yearOfBirth: number };`

`export type Dog = { breeds: string[]; yearOfBirth: number };`

`export const createCatName = () => "fluffy";`

`// @filename: valid.ts`

`import type { Cat, Dog } from "./animal.js";`

`export type Animals = Cat | Dog;`

`// @filename: app.ts`

`import type { createCatName } from "./animal.js";`

`const name = createCatName();`

`'createCatName' cannot be used as a value because it was imported using 'import type'.1361'createCatName' cannot be used as a value because it was imported using 'import type'.`[Try](https://www.typescriptlang.org/play/#code/PTAEAEDMEsBsFMB2BDAtvAXKZjqubAHQAuAzgLABQ8AHgA4D2ATsaMQJ53ygDCyrAXlABvUACMm8eABMspYk2iIA5gG5Q7eMiYB5SACFoLABZZEAV1Rj4TUAF9VVWoxZtO3ACINloIaIlS0qRyCkrKANoAuuqa2nqGJmaW1rYOTvTMrADGDIjyoFmS-PB8xAByaNxCABQAlL4AfKAARJCw5pCQ7M2OlFQgEDAIKOhYAG4E0NIkFJR4LqwcXCK8-AA0oF4+dqCQTAyoLYTAOHgEhABWpD3pC27LAIK4+LCkvqusAD6b3r39YFA4EhKlhkHQ6DN-hAbPsmMFQABGADMADYEVR5pl7txRIUtMQSvwKuh7Lt9odmsdTi9Ltdejk8qwRlUCkUCaVifA6qogA)

###### [](#inline-type-imports)Inline `type` imports

TypeScript 4.5 also allows for individual imports to be prefixed with `type` to indicate that the imported reference is a type:

ts

`// @filename: app.ts`

`import { createCatName, type Cat, type Dog } from "./animal.js";`

`export type Animals = Cat | Dog;`

`const name = createCatName();`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEDMEsBsFMB2BDAtvAXKZjqubAHQAuAzgLABQ8AHgA4D2ATsaMQJ53ygDCyrAXlABvUACMm8eABMspYk2iIA5gG5Q7eMiYB5SACFoLABZZEAV1Rj4TUAF9VVWoxZtO3ACINloIaIlS0qRyCkrKANoAuuqa2nqGJmaW1rYOTvTMrADGDIjyoFmS-PB8xAByaNxCABQAlL4AfKAARJCw5pCQ7M2OlCCgALRDWebEQwNU-VBwSJVYyHR0JBSUeC6sooVaxCX8FegANG5cvPxHHCdePnagkEwMqC2EwDh4BIQAVqQ9VOnrx9wAIK4fCwUi+U6sAA+oCuvRyeVYKHQEK2xVK+3gdVUQA)

Together these allow a non-TypeScript transpiler like Babel, swc or esbuild to know what imports can be safely removed.

#### [](#es-module-syntax-with-commonjs-behavior)ES Module Syntax with CommonJS Behavior

TypeScript has ES Module syntax which _directly_ correlates to a CommonJS and AMD `require`. Imports using ES Module are _for most cases_ the same as the `require` from those environments, but this syntax ensures you have a 1 to 1 match in your TypeScript file with the CommonJS output:

ts

`import fs = require("fs");`

`const code = fs.readFileSync("hello.ts", "utf8");`

[Try](https://www.typescriptlang.org/play/#code/PQgEB4CcFMDNpgOwMbVAFwJ4AdoGcBeAIkQHsATaI0YAPgFgAoMAAQFsKBXAG2gC5QyUmw6IAVniZgAtLOSd0s6UwCWbbKUjpQsPKAKgYAR04qYACiK6iASgDcTIYjzahlfTrwA6GAENyAGIqvADKmCiWABbQ3NykXuh4RAA0oEQKsAActnZAA)

You can learn more about this syntax in the [modules reference page](https://www.typescriptlang.org/docs/handbook/modules.html#export--and-import--require).

## [](#commonjs-syntax)CommonJS Syntax

CommonJS is the format which most modules on npm are delivered in. Even if you are writing using the ES Modules syntax above, having a brief understanding of how CommonJS syntax works will help you debug easier.

#### [](#exporting)Exporting

Identifiers are exported via setting the `exports` property on a global called `module`.

ts

`function absolute(num: number) {`

  `if (num < 0) return num * -1;`

  `return num;`

`}`

`module.exports = {`

  `pi: 3.14,`

  `squareTwo: 1.41,`

  `phi: 1.61,`

  `absolute,`

`};`

[Try](https://www.typescriptlang.org/play/#code/PQgEB4CcFMDNpgOwMbVAFwJ4AdoGcBeAIkQHsATaI0YAPgFgAoMAWjeQFd02WnYOU6AJalEoAIYAjPKQA2XaAApEHALYAuUCtWSEASlABvJqFBDYoZWoigADAZjoOkMdtAAqUCwCMAbhOgjs6uav6MAL5MTKoUHLLQAHTQAB7YpJDoeKAERgHYQpoAzAneACwANAF4AI4c4jAAKgDupJreCaXelYym2AAWBaDtAGxdAVIy8ujQ3eG+QA)

Then these files can be imported via a `require` statement:

ts

`const maths = require("./maths");`

`maths.pi;`

      `any`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEFsHsBMFcA2BTAXKAxtSMB2ArAZwFgAoECAMwEsVcBDSNUSegFwAtCA6Nk8igB4ATskrJRuDMlBsAngAdkhALwAiXHGRrQwAHxlK8KW2rRcoegCNC0RPDbIAFLniR0ryFYkBKUAG8yUFBqSlAXN1BBUAAGP1E2eGELT1AAKlAAWgBGAG4g0ASklLd80gBfMjIYBBRuZAAPBWhhPlAVAIKFanQAZm5sgBYAGgLCAEd4elEAFQB3aHRs7kHs0dJghQ4e0GWANjWC61t7R3XysopwGjpGZmpcWEbefgpM94wHd8yyLFxCNgsdhcdqFZCTaiiJxqbjAVicQhqHxleFcbjdS5gYKgAB6AH4gA)

Or you can simplify a bit using the destructuring feature in JavaScript:

ts

`const { squareTwo } = require("./maths");`

`squareTwo;`

   `const squareTwo: any`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEFsHsBMFcA2BTAXKAxtSMB2ArAZwFgAoECAMwEsVcBDSNUSegFwAtCA6Nk8igB4ATskrJRuDMlBsAngAdkhALwAiXHGRrQwAHxlK8KW2rRcoegCNC0RPDbIAFLniR0ryFYkBKUAG8yUFBqSlAXN1BBUAAGP1E2eGELT1AAKlAAWgBGAG4g0ASklLd80gBfMjIYBBRuZAAPBWhhPlAVAIKFanQAZm5sgBYAGgLCAEd4elEAFQB3aHRs7kHs0dJghQ4e0GWANjWC61t7R3XysopwGjpGZmpcWEbefgpM94wHd8yyLFxCNgBUATKazBagcrtQrISbUURONTcYCsTiENQ+Mog6bIebQS5gAB6AH4gA)

### [](#commonjs-and-es-modules-interop)CommonJS and ES Modules interop

There is a mis-match in features between CommonJS and ES Modules regarding the distinction between a default import and a module namespace object import. TypeScript has a compiler flag to reduce the friction between the two different sets of constraints with [`esModuleInterop`](https://www.typescriptlang.org/tsconfig#esModuleInterop).

## [](#typescripts-module-resolution-options)TypeScript’s Module Resolution Options

Module resolution is the process of taking a string from the `import` or `require` statement, and determining what file that string refers to.

TypeScript includes two resolution strategies: Classic and Node. Classic, the default when the compiler option [`module`](https://www.typescriptlang.org/tsconfig#module) is not `commonjs`, is included for backwards compatibility. The Node strategy replicates how Node.js works in CommonJS mode, with additional checks for `.ts` and `.d.ts`.

There are many TSConfig flags which influence the module strategy within TypeScript: [`moduleResolution`](https://www.typescriptlang.org/tsconfig#moduleResolution), [`baseUrl`](https://www.typescriptlang.org/tsconfig#baseUrl), [`paths`](https://www.typescriptlang.org/tsconfig#paths), [`rootDirs`](https://www.typescriptlang.org/tsconfig#rootDirs).

For the full details on how these strategies work, you can consult the [Module Resolution](https://www.typescriptlang.org/docs/handbook/modules/reference.html#the-moduleresolution-compiler-option) reference page.

## [](#typescripts-module-output-options)TypeScript’s Module Output Options

There are two options which affect the emitted JavaScript output:

-   [`target`](https://www.typescriptlang.org/tsconfig#target) which determines which JS features are downleveled (converted to run in older JavaScript runtimes) and which are left intact
-   [`module`](https://www.typescriptlang.org/tsconfig#module) which determines what code is used for modules to interact with each other

Which [`target`](https://www.typescriptlang.org/tsconfig#target) you use is determined by the features available in the JavaScript runtime you expect to run the TypeScript code in. That could be: the oldest web browser you support, the lowest version of Node.js you expect to run on or could come from unique constraints from your runtime - like Electron for example.

All communication between modules happens via a module loader, the compiler option [`module`](https://www.typescriptlang.org/tsconfig#module) determines which one is used. At runtime the module loader is responsible for locating and executing all dependencies of a module before executing it.

For example, here is a TypeScript file using ES Modules syntax, showcasing a few different options for [`module`](https://www.typescriptlang.org/tsconfig#module):

ts

`import { valueOfPi } from "./constants.js";`

`export const twoPi = valueOfPi * 2;`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEDMEsBsFMB2BDAtvAXKAxge0QM4AuyiRBAdOQLABQ8AHgA64BORO+xoAbsrAFd4AeUgAFaKAC8oAMwUAjABYATAG46ICDAQp0WaIgAmjKgU1gAtNewCi1y3WioW7UAG9e-IaImgAvqCQrLiooABEFMB4hCRklABWBOEatHSMrhwx3EQA7rh+MnyCIuKSAFSg6kA)

#### [](#es2020)`ES2020`

ts

`import { valueOfPi } from "./constants.js";`

`export const twoPi = valueOfPi * 2;`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEGcAsHsHcCiBbAlgFwLACgQWbACYCuANgKYBco5kATAAyM57gB2siATl7F5DlTIADn3SgA3qABuAQ1LFyAeQBmABVSgAvqBW9koAEQA6YAGNYbSOllt0kYwCtIhgNw4c5AB6iu4i1bi6PCwGqAAvDLyiqphAFSgdK5AA)

#### [](#commonjs)`CommonJS`

ts

`"use strict";`

`Object.defineProperty(exports, "__esModule", { value: true });`

`exports.twoPi = void 0;`

`const constants_js_1 = require("./constants.js");`

`exports.twoPi = constants_js_1.valueOfPi * 2;`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEGcAsHsHcCiBbAlgFwLACgQWbACYCuANgKYBcoAxrMgQHYBWkOe4jsiATj7DzbZUyAA4D0oAN6gAbgENSxcgHkAZgAVUoAL6g1-ZKABEAOmB1GkdPMbpIp1sYDcOHOQAe4npMvXQ6PCwWqAAvHKKyuohAFSgAEzOQA)

#### [](#umd)`UMD`

ts

`(function (factory) {`

    `if (typeof module === "object" && typeof module.exports === "object") {`

        `var v = factory(require, exports);`

        `if (v !== undefined) module.exports = v;`

    `}`

    `else if (typeof define === "function" && define.amd) {`

        `define(["require", "exports", "./constants.js"], factory);`

    `}`

`})(function (require, exports) {`

    `"use strict";`

    `Object.defineProperty(exports, "__esModule", { value: true });`

    `exports.twoPi = void 0;`

    `const constants_js_1 = require("./constants.js");`

    `exports.twoPi = constants_js_1.valueOfPi * 2;`

`});`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEGcAsHsHcCiBbAlgFwLACgQWbACYCuANgKYBcoxyhOe4AdrIgE5uxuQ6rIAOXdKADeoAG4BDUsXIB5AGYAFVKAC+oBZ2SgARADpgAY1hNI6SU3SR9AK0i6A3DhzkAHoLbCTZ4eniwKqAAvBLSsopBAFSgAEyOQA)

> Note that ES2020 is effectively the same as the original `index.ts`.

You can see all of the available options and what their emitted JavaScript code looks like in the [TSConfig Reference for `module`](https://www.typescriptlang.org/tsconfig#module).

## [](#typescript-namespaces)TypeScript namespaces

TypeScript has its own module format called `namespaces` which pre-dates the ES Modules standard. This syntax has a lot of useful features for creating complex definition files, and still sees active use [in DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped). While not deprecated, the majority of the features in namespaces exist in ES Modules and we recommend you use that to align with JavaScript’s direction. You can learn more about namespaces in [the namespaces reference page](https://www.typescriptlang.org/docs/handbook/namespaces.html).
