---
title: "Documentation - Type Checking JavaScript Files"
source_url: "https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html"
crawled_at: "2026-07-02T07:43:38.825Z"
---

Here are some notable differences on how checking works in `.js` files compared to `.ts` files.

## [](#properties-are-inferred-from-assignments-in-class-bodies)Properties are inferred from assignments in class bodies

ES2015 does not have a means for declaring properties on classes. Properties are dynamically assigned, just like object literals.

In a `.js` file, the compiler infers properties from property assignments inside the class body. The type of a property is the type given in the constructor, unless it’s not defined there, or the type in the constructor is undefined or null. In that case, the type is the union of the types of all the right-hand values in these assignments. Properties defined in the constructor are always assumed to exist, whereas ones defined just in methods, getters, or setters are considered optional.

js

`class C {`

  `constructor() {`

    `this.constructorOnly = 0;`

    `this.constructorUnknown = undefined;`

  `}`

  `method() {`

    `this.constructorOnly = false;`

`Type 'boolean' is not assignable to type 'number'.2322Type 'boolean' is not assignable to type 'number'.      this.constructorUnknown = "plunkbat"; // ok, constructorUnknown is string | undefined      this.methodOnly = "ok"; // ok, but methodOnly could also be undefined    }    method2() {      this.methodOnly = true; // also, ok, methodOnly's type is string | boolean | undefined    }  }  `[Try](https://www.typescriptlang.org/play/#code/PTAEAEGMAsFNINYCkDOAoEFYCdsHtsUAuUAJgGZTS1IAbAQxRVAGFQBvNUUSPAOxQAXbAFdIgggAoAlBy7dQg6AEsUAOl4DhYidgDyfWgE9QAXlAAGANzzuS1Rv5DR4ggFU+CPngDufM6AifAAmsABmynywwTbcAL7yALawSnjBMnIKiirqms46BAbGAWH0tCiwsQr2uU7artgeXr7+5gBEAA60QQgARvSCbVagmHgIADQ8dS66Td5+oKqgzpEA5qAAPoEh4ZHRttkOyanBRSbtY0MjYGOTvSKCoMfQaWdTIrTBoGUoeKC9sG2oQiUWC8gS3GeaVIGU4WRqaihp0M50Uokq12+5Twk1uTxSL2RxgA5MxBEYOoClis+Ostr08HhaLB6P4tkFgXswfE0HEgA)

If properties are never set in the class body, they are considered unknown. If your class has properties that are only read from, add and then annotate a declaration in the constructor with JSDoc to specify the type. You don’t even have to give a value if it will be initialized later:

js

`class C {`

  `constructor() {`

    `/** @type {number | undefined} */`

    `this.prop = undefined;`

    `/** @type {number | undefined} */`

    `this.count;`

  `}`

`}`

`let c = new C();`

`c.prop = 0; // OK`

`c.count = "string";`

`Type 'string' is not assignable to type 'number'.2322Type 'string' is not assignable to type 'number'.`[Try](https://www.typescriptlang.org/play/#code/PTAEAEGMAsFNINYCkDOAoEFYCdsHtsUAuUAJgGZTS1IAbAQxRVAGFQBvNUUSPAOxQAXbAFdIgggAoAlBy7dQwAFRKIggJ4AHWBz4iAtgCMcoAD6gRfACawAZgEs+sKwF9QS4PO6Do9lADpNfE1QAF4LaztHZwBuL0UVNS0ddj0jE3NLGwcnV3dPBVAfP39eS0E47hc0arRaWEEeMNAnAHdWGTjIQODmgAYYxTAAeQBpGlK8cuaAIiFsRwBzGZigA)

## [](#constructor-functions-are-equivalent-to-classes)Constructor functions are equivalent to classes

Before ES2015, JavaScript used constructor functions instead of classes. The compiler supports this pattern and understands constructor functions as equivalent to ES2015 classes. The property inference rules described above work exactly the same way.

js

`function C() {`

  `this.constructorOnly = 0;`

  `this.constructorUnknown = undefined;`

`}`

`C.prototype.method = function () {`

  `this.constructorOnly = false;`

`Type 'boolean' is not assignable to type 'number'.2322Type 'boolean' is not assignable to type 'number'.    this.constructorUnknown = "plunkbat"; // OK, the type is string | undefined  };  `[Try](https://www.typescriptlang.org/play/#code/PTAEAEGMAsFNINYCkDOAoEFYCdsHtsUAuUAJgDYAOAZjOtNLQDMBXAO0gBcBLPN0AMIAKAJSgA3mlChO0bigB0kPik7YWXAgHk2AGwCeoALygADAG4pMuYuVtV6zdgCqbBGzwB3fifYATWCZuNlg-SwBfNAEFAAd8TjxOfRjYBQBbWFk8P2NQVg4ePlBRCStZeSUVNQ0E7B0DXKYAQ10UWEtpctsqx1rXdy8fUAAiGN12BAAjJs5h81BMLQBpABprWBlkjflQB2CAc1AAH1B-QODQtHDzIA)

## [](#commonjs-modules-are-supported)CommonJS modules are supported

In a `.js` file, TypeScript understands the CommonJS module format. Assignments to `exports` and `module.exports` are recognized as export declarations. Similarly, `require` function calls are recognized as module imports. For example:

js

`// same as `import module "fs"``

`const fs = require("fs");`

`// same as `export function readFile``

`module.exports.readFile = function (f) {`

  `return fs.readFileSync(f);`

`};`

The module support in JavaScript is much more syntactically forgiving than TypeScript’s module support. Most combinations of assignments and declarations are supported.

## [](#classes-functions-and-object-literals-are-namespaces)Classes, functions, and object literals are namespaces

Classes are namespaces in `.js` files. This can be used to nest classes, for example:

js

`class C {}`

`C.D = class {};`

[Try](https://www.typescriptlang.org/play/#code/MYGwhgzhAEDC0G8C+AoWA6AItAvNUkMyA3EA)

And, for pre-ES2015 code, it can be used to simulate static methods:

js

`function Outer() {`

  `this.y = 2;`

`}`

`Outer.Inner = function () {`

  `this.yy = 2;`

`};`

`Outer.Inner();`

[Try](https://www.typescriptlang.org/play/#code/GYVwdgxgLglg9mABAeRFApgJwBQEpEDeAUIolABYwDOAdAJ6IC8iATANxEC+RRqGmNAJJgwWJolCRYCRHkIkylWnQbN2XDrzRYhIrHjZA)

It can also be used to create simple namespaces:

js

`var ns = {};`

`ns.C = class {};`

`ns.func = function () {};`

`ns;`

[Try](https://www.typescriptlang.org/play/#code/G4QwTgBAdgzhC8EDeBfA3AKFgOgMIIgGMAbEGOVTHAMwFcpCC6GAXASwHsoIAKASmToMWGGiA)

Other variants are allowed as well:

js

`// IIFE`

`var ns = (function (n) {`

  `return n || {};`

`})();`

`ns.CONST = 1;`

`// defaulting to global`

`var assign =`

  `assign ||`

  `function () {`

    `// code goes here`

  `};`

`assign.extra = 1;`

[Try](https://www.typescriptlang.org/play/#code/PTAEElwMQUQKAG4EMBOoB2BnUBeUAKAMwFd0BjAFwEsB7dA9ASlAG85RQUBTC4le+gB9BrAL4BuOKMb5GkrADoAwgHkAcgGUAKrlABGSXBCgAJl0JJiAG2roA5qAo1QdqzQBGSK4lSgkmTCo7ehx2PwCgoUEwknJqOgJmNg4OYzIaMxcaLmwACy5uMIk4f0DghS4ADwoUJF0DIA)

## [](#object-literals-are-open-ended)Object literals are open-ended

In a `.ts` file, an object literal that initializes a variable declaration gives its type to the declaration. No new members can be added that were not specified in the original literal. This rule is relaxed in a `.js` file; object literals have an open-ended type (an index signature) that allows adding and looking up properties that were not defined originally. For instance:

js

`var obj = { a: 1 };`

`obj.b = 2; // Allowed`

[Try](https://www.typescriptlang.org/play/#code/G4QwTgBA9gRgVhAvBA3hEAuCBGCBfAbgChY4A6GJCAJgIgHp6IBBAG1agHcBTAEyA)

Object literals behave as if they have an index signature `[x:string]: any` that allows them to be treated as open maps instead of closed objects.

Like other special JS checking behaviors, this behavior can be changed by specifying a JSDoc type for the variable. For example:

js

`/** @type {{a: number}} */`

`var obj = { a: 1 };`

`obj.b = 2;`

`Property 'b' does not exist on type '{ a: number; }'.2339Property 'b' does not exist on type '{ a: number; }'.`[Try](https://www.typescriptlang.org/play/#code/PTAEAEGMAsFNINYCkDOAoEFYCdsHtsUAuUAJgGZyBODAKlogBcBPAB1lAG9OBDEgOwCuAWwBGOAL4TQtYGgBuPbKDyiAVqAC8XUH1ABGUBIDcaVWoB0orWWNA)

## [](#null-undefined-and-empty-array-initializers-are-of-type-any-or-any)null, undefined, and empty array initializers are of type any or any\[\]

Any variable, parameter or property that is initialized with null or undefined will have type any, even if strict null checks is turned on. Any variable, parameter or property that is initialized with \[\] will have type any\[\], even if strict null checks is turned on. The only exception is for properties that have multiple initializers as described above.

js

`function Foo(i = null) {`

  `if (!i) i = 1;`

  `var j = undefined;`

  `j = 2;`

  `this.l = [];`

`}`

`var foo = new Foo();`

`foo.l.push(foo.i);`

`foo.l.push("end");`

[Try](https://www.typescriptlang.org/play/#code/GYVwdgxgLglg9mABAMTnAFDRBeRYQA2BAlIgN4BQiiMwi6AhDKVrgIwDcViAbgIYAnRACscicABMApsBhgpErtVG4ATEsRQAFjADOAOgJiA2gF0uAXwoV+Q4GjHyA7ijTpiXe3EP6ADiF0tdC99Zk80H39A9AAiKTAJGI8gA)

## [](#function-parameters-are-optional-by-default)Function parameters are optional by default

Since there is no way to specify optionality on parameters in pre-ES2015 JavaScript, all function parameters in `.js` file are considered optional. Calls with fewer arguments than the declared number of parameters are allowed.

It is important to note that it is an error to call a function with too many arguments.

For instance:

js

`function bar(a, b) {`

  `console.log(a + " " + b);`

`}`

`bar(1); // OK, second argument considered optional`

`bar(1, 2);`

`bar(1, 2, 3); // Error, too many arguments`

`Expected 0-2 arguments, but got 3.2554Expected 0-2 arguments, but got 3.`[Try](https://www.typescriptlang.org/play/#code/PTAEAEGMAsFNINYCkDOAoEEUBcBOBLSbALlADMBDAGxVgzHFl1wHtcVSB2ABm4DZQPfqABMAVjEAWNGQCuAOyL4W80ACMKuABQUANOoCUoAN5pQoSCpQsqsAHRUWAcx2gA1KABEX94YDcaAC+aGga2gCMBn6gmADyANL6tJbyACagmk6yALaw8tgWVvipTLDpLAAO2Mry1KGaWuH6IlH1Ec36AMxRMWAAosxs+tgsLKDZFPIAnhm4Wbn5KEA)

JSDoc annotated functions are excluded from this rule. Use JSDoc optional parameter syntax (`[` `]`) to express optionality. e.g.:

js

`/**`

 `* @param {string} [somebody] - Somebody's name.`

 `*/`

`function sayHello(somebody) {`

  `if (!somebody) {`

    `somebody = "John Doe";`

  `}`

  `console.log("Hello " + somebody);`

`}`

`sayHello();`

[Try](https://www.typescriptlang.org/play/#code/PQKhCgAIUgBAHAhgJ0QW0gbwM4BdkCWAdgOYC+kA2tgPZoCmARjQCYCeAupALSQDKdJqzYBybJCLp6AOighg4AGYBXIgGNcBGkUjZEbABL0ANsZoAKWg2bsAlFiiQCiyOYCEVoXYeRfuwTZskAC8kABEAFI0ABY6ACI09GEA3I5kjmratMYyZiTmYUamNOGQANT+1sK2qengeoYmZuY1QA)

## [](#var-args-parameter-declaration-inferred-from-use-of-arguments)Var-args parameter declaration inferred from use of `arguments`

A function whose body has a reference to the `arguments` reference is implicitly considered to have a var-arg parameter (i.e. `(...arg: any[]) => any`). Use JSDoc var-arg syntax to specify the type of the arguments.

js

`/** @param {...number} args */`

`function sum(/* numbers */) {`

  `var total = 0;`

  `for (var i = 0; i < arguments.length; i++) {`

    `total += arguments[i];`

  `}`

  `return total;`

`}`

[Try](https://www.typescriptlang.org/play/#code/PQKhAIAEAcEMCdYFtwG8B0mB2BXJAjAU3gF9wEBzAZ3BGACgAzHLAYwBcBLAey3CrwAKUOFwFiNOgEo09cOABuCcO27tYAG3ABecAAYA3HPCNu8cIKXnOO-QfA2APOXgU8hLOyroNHiuwALe04AahCZVGN5VXUtEN1Kd08qAG1OAF0jeRJjeEJ2HHg+GM0jEiA)

## [](#unspecified-type-parameters-default-to-any)Unspecified type parameters default to `any`

Since there is no natural syntax for specifying generic type parameters in JavaScript, an unspecified type parameter defaults to `any`.

### [](#in-extends-clause)In extends clause

For instance, `React.Component` is defined to have two type parameters, `Props` and `State`. In a `.js` file, there is no legal way to specify these in the extends clause. By default the type arguments will be `any`:

js

`import { Component } from "react";`

`class MyComponent extends Component {`

  `render() {`

    `this.props.b; // Allowed, since this.props is of type any`

  `}`

`}`

Use JSDoc `@augments` to specify the types explicitly. for instance:

js

`import { Component } from "react";`

`/**`

 `* @augments {Component<{a: number}, State>}`

 `*/`

`class MyComponent extends Component {`

  `render() {`

    `this.props.b; // Error: b does not exist on {a:number}`

  `}`

`}`

### [](#in-jsdoc-references)In JSDoc references

An unspecified type argument in JSDoc defaults to any:

js

`/** @type{Array} */`

`var x = [];`

`x.push(1); // OK`

`x.push("string"); // OK, x is of type Array<any>`

`/** @type{Array.<number>} */`

`var y = [];`

`y.push(1); // OK`

`y.push("string"); // Error, string is not assignable to number`

[Try](https://www.typescriptlang.org/play/#code/PQKhAIAEBcE8AcCmBvAggJ3QQ1gX3CMAFABuW64AHuALzgDaAugNxFGUB08ArgM4AWACgCMASmbhgwcAHkA0uy58hAIl7R0ASwB2AcxXjJ0+QBoq4Tb3AB7AGbg4ScBmywAPFm2wAfG1AQYBBQXHA43bW4AWwAjRHRvfEJScnBYWgYWNlglARFDKVkFbJ5ctQ0dfXzpAFFMa3QzdS09Cytta2hwLF5eTV1tLGiAG0QHa3AImLigA)

### [](#in-function-calls)In function calls

A call to a generic function uses the arguments to infer the type parameters. Sometimes this process fails to infer any types, mainly because of lack of inference sources; in these cases, the type parameters will default to `any`. For example:

js

`var p = new Promise((resolve, reject) => {`

  `reject();`

`});`

`p; // Promise<any>;`

To learn all of the features available in JSDoc, see [the reference](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html).
