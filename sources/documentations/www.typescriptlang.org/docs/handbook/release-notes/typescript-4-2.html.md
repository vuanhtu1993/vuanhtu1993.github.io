---
title: "Documentation - TypeScript 4.2"
source_url: "https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-2.html"
crawled_at: "2026-07-02T07:40:46.469Z"
---

## [](#smarter-type-alias-preservation)Smarter Type Alias Preservation

TypeScript has a way to declare new names for types called type aliases. If you’re writing a set of functions that all work on `string | number | boolean`, you can write a type alias to avoid repeating yourself over and over again.

ts

`type BasicPrimitive = number | string | boolean;`

TypeScript has always used a set of rules and guesses for when to reuse type aliases when printing out types. For example, take the following code snippet.

ts

`export type BasicPrimitive = number | string | boolean;`

`export function doStuff(value: BasicPrimitive) {`

  `let x = value;`

  `return x;`

`}`

If we hover our mouse over `x` in an editor like Visual Studio, Visual Studio Code, or [the TypeScript Playground](https://www.typescriptlang.org/play?ts=4.1.3#code/KYDwDg9gTgLgBDAnmYcBCBDAzgSwMYAKUOAtjjDgG6oC8cAdgK4kBGwUcAPnFjMfQHMucFhAgAbYBnoBuAFBzQkWHABmjengoR6cACYQAyjEarVACkoZxjYAC502fEVLkqwAJRwA3nLj+4SXgQODorG2B5ALgoYBMoXRB5AF8gA), we’ll get a quick info panel that shows the type `BasicPrimitive`. Likewise, if we get the declaration file output (`.d.ts` output) for this file, TypeScript will say that `doStuff` returns `BasicPrimitive`.

However, what happens if we return a `BasicPrimitive` or `undefined`?

ts

`export type BasicPrimitive = number | string | boolean;`

`export function doStuff(value: BasicPrimitive) {`

  `if (Math.random() < 0.5) {`

    `return undefined;`

  `}`

  `return value;`

`}`

We can see what happens [in the TypeScript 4.1 playground](https://www.typescriptlang.org/play?ts=4.1.3#code/KYDwDg9gTgLgBDAnmYcBCBDAzgSwMYAKUOAtjjDgG6oC8cAdgK4kBGwUcAPnFjMfQHMucFhAgAbYBnoBuALAAoRQHplcABIRqHCPTgByACYQAyjEYAzC-pHBxEAO4IIPYKgcALDPAAqyYCZ4xGDwhjhYYOIYiFhwFtAIHqhQwOZQekgoAHQqagDqqGQCHvBe1HCgKHgwwIZw5M5wYPzw2Lm5cJ2YuITEZBTl3Iz0hsAWOPS1HR0sjPBs9k5+KIHB8AAsWQBMADT18BO8UnVhEVExcG0Kqh2dTKzswrz8QtyiElJ6QyNjE1PXykUlWg8Asw2qOF0cGMZksFgAFJQMOJGMAAFzobD4IikchUYAASjgAG9FJ1yTgLHB4QBZbweLJQaTGEjwokAHjgAAYsgBWImkhTk4WdFJpPTDUbjSaGeRC4UAX0UZOFYsY6TgSJRwDlcAVQA). While we might want TypeScript to display the return type of `doStuff` as `BasicPrimitive | undefined`, it instead displays `string | number | boolean | undefined`! What gives?

Well this has to do with how TypeScript represents types internally. When creating a union type out of one or more union types, it will always _normalize_ those types into a new flattened union type - but doing that loses information. The type-checker would have to find every combination of types from `string | number | boolean | undefined` to see what type aliases could have been used, and even then, there might be multiple type aliases to `string | number | boolean`.

In TypeScript 4.2, our internals are a little smarter. We keep track of how types were constructed by keeping around parts of how they were originally written and constructed over time. We also keep track of, and differentiate, type aliases to instances of other aliases!

Being able to print back the types based on how you used them in your code means that as a TypeScript user, you can avoid some unfortunately humongous types getting displayed, and that often translates to getting better `.d.ts` file output, error messages, and in-editor type displays in quick info and signature help. This can help TypeScript feel a little bit more approachable for newcomers.

For more information, check out [the first pull request that improves various cases around preserving union type aliases](https://github.com/microsoft/TypeScript/pull/42149), along with [a second pull request that preserves indirect aliases](https://github.com/microsoft/TypeScript/pull/42284).

## [](#leadingmiddle-rest-elements-in-tuple-types)Leading/Middle Rest Elements in Tuple Types

In TypeScript, tuple types are meant to model arrays with specific lengths and element types.

ts

`// A tuple that stores a pair of numbers`

`let a: [number, number] = [1, 2];`

`// A tuple that stores a string, a number, and a boolean`

`let b: [string, number, boolean] = ["hello", 42, true];`

Over time, TypeScript’s tuple types have become more and more sophisticated, since they’re also used to model things like parameter lists in JavaScript. As a result, they can have optional elements and rest elements, and can even have labels for tooling and readability.

ts

`// A tuple that has either one or two strings.`

`let c: [string, string?] = ["hello"];`

`c = ["hello", "world"];`

`// A labeled tuple that has either one or two strings.`

`let d: [first: string, second?: string] = ["hello"];`

`d = ["hello", "world"];`

`// A tuple with a *rest element* - holds at least 2 strings at the front,`

`// and any number of booleans at the back.`

`let e: [string, string, ...boolean[]];`

`e = ["hello", "world"];`

`e = ["hello", "world", false];`

`e = ["hello", "world", true, false, true];`

[Try](https://www.typescriptlang.org/play/#code/PTAEEFQFwVwBwDYFNoAsCGVQYM6iQJZSpIBOoA9gHYoXlQDuFoOUpBVA5jgHQBQyLAGMAXKADardlwA0LNh04B+ALqgAvBIBEJBAgpaVAbj5CN23fq1ytTUggAmhk3xARQCdACMkyB9HhkNExsdDxCYjJKGkp6Jnlpbn5BUAcxcQAzAlJWMSlFORwkIWoHJTyFLjVNcR1fK2M+fxq6vQMbO0dnPlcwSFhEFAYiVFB0UAAqUiRWfGQAWyQqKAnQAFpsCkc8EOQwrAAmBMUdrEjQDNJqKBlesap-dCoAT1AqGHmfcgoM0C8KLZIJ6nNAoLzoIQAa2SSCwSHS+VkxyRPFR-0BT3EKkafBQLUs7VAtjoXUaeIs9UJxPsTjkGXQCCKZPMtQJ1iJnVp0FIMCQdIZRTkbF5xiAA)

In TypeScript 4.2, rest elements specifically been expanded in how they can be used. In prior versions, TypeScript only allowed `...rest` elements at the very last position of a tuple type.

However, now rest elements can occur _anywhere_ within a tuple - with only a few restrictions.

ts

`let foo: [...string[], number];`

`foo = [123];`

`foo = ["hello", 123];`

`foo = ["hello!", "hello!", "hello!", 123];`

`let bar: [boolean, ...string[], boolean];`

`bar = [true, false];`

`bar = [true, "some text", false];`

`bar = [true, "some", "separated", "text", false];`

[Try](https://www.typescriptlang.org/play/#code/DYUwLgBAZg9jBcEDaA6NBnMAnAlgOwHMkBdAGgjwFcBbAIxC2IG4AoF2GCAXmQEYAmAMzN2cbsgBEACxDBgMCeQHDWHcUmmz5AQkURNcmLvIGde5SJahItAIZZESWnFC285NCky5CJcs5hXPEs7LHVsShByKFtgdBARUPCsSJN0GGoQCDAQAA8wPRi4hNYkniQIqP10zL0JeIAHe1scgBM6nPzC2PjmIA)

The only restriction is that a rest element can be placed anywhere in a tuple, so long as it’s not followed by another optional element or rest element. In other words, only one rest element per tuple, and no optional elements after rest elements.

ts

`interface Clown {`

  `/*...*/`

`}`

`interface Joker {`

  `/*...*/`

`}`

`let StealersWheel: [...Clown[], "me", ...Joker[]];`

`A rest element cannot follow another rest element.1265A rest element cannot follow another rest element.  let StringsAndMaybeBoolean: [...string[], boolean?];  An optional element cannot follow a rest element.1266An optional element cannot follow a rest element.`[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygIwCYBsBWd2sAoASwDsAXGAMwEMBjSUAYQBs4B3U0Ab0NFGAAqAHSjBwQgF8SFavUYApOAGsYPPgJFiJ0wi0jlQAZUo19SAOoALSJBaoA2qOGsOpBwF0ANKABEAW0hfH2clVWhPDwBuQj0DY3JoMgBzRABBUgATAFkaAE8AI0gAITg4fRpSR2dERJTPHwKyitIAfmigA)

These non-trailing rest elements can be used to model functions that take any number of leading arguments, followed by a few fixed ones.

ts

`declare function doStuff(...args: [...names: string[], shouldCapitalize: boolean]): void;`

`doStuff(/*shouldCapitalize:*/ false)`

`doStuff("fee", "fi", "fo", "fum", /*shouldCapitalize:*/ true);`

[Try](https://www.typescriptlang.org/play/#code/CYUwxgNghgTiAEAzArgOzAFwJYHtX2BwGUNlFEAKAOhtgHMBnALngG0arUoBbEZ+BhhhZUdVgF0ANAIAWOZBGABhKAAcsGKBCwAvECwBGOHBBBRU4gJQsAbjizAA3AChnhEmUoB6AFQM5CspqGlq6+j5eSFoMIJZuxKTkFABEiCAgydKpWJnwqTi5qcjcub7+8ooq6praekwR8ELIsY5AA)

Even though JavaScript doesn’t have any syntax to model leading rest parameters, we were still able to declare `doStuff` as a function that takes leading arguments by declaring the `...args` rest parameter with _a tuple type that uses a leading rest element_. This can help model lots of existing JavaScript out there!

For more details, [see the original pull request](https://github.com/microsoft/TypeScript/pull/41544).

## [](#stricter-checks-for-the-in-operator)Stricter Checks For The `in` Operator

In JavaScript, it is a runtime error to use a non-object type on the right side of the `in` operator. TypeScript 4.2 ensures this can be caught at design-time.

ts

`"foo" in 42;`

`Type 'number' is not assignable to type 'object'.2322Type 'number' is not assignable to type 'object'.`[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwGYBsBGdG00AoAIgDM44TQBLAO1ABY0BuIA)

This check is fairly conservative for the most part, so if you have received an error about this, it is likely an issue in the code.

A big thanks to our external contributor [Jonas Hübotter](https://github.com/jonhue) for [their pull request](https://github.com/microsoft/TypeScript/pull/41928)!

## [](#--nopropertyaccessfromindexsignature)`--noPropertyAccessFromIndexSignature`

Back when TypeScript first introduced index signatures, you could only get properties declared by them with “bracketed” element access syntax like `person["name"]`.

ts

`interface SomeType {`

  `/** This is an index signature. */`

  `[propName: string]: any;`

`}`

`function doStuff(value: SomeType) {`

  `let x = value["someProperty"];`

`}`

[Try](https://www.typescriptlang.org/play/#code/JYOwLgpgTgZghgYwgAgMoHsC2EAqBPABxQG8AoZZAegCprkcALYAZ2ReThDZABMIAPZM2ABzEHDABXKBAB0yapXLIA2gSjoCAOTjYAXELBRQIgLoHOeANykAvqVIxJIBGGDouPdKikwYACgA3OAAbSQgDDGx8IgBKZDIKEIgwZEEAXmRgsIgVACJmLAgABQ0iKDA8PNMbWyA)

This ended up being cumbersome in situations where we need to work with objects that have arbitrary properties. For example, imagine an API where it’s common to misspell a property name by adding an extra `s` character at the end.

ts

`interface Options {`

  `/** File patterns to be excluded. */`

  `exclude?: string[];`

  `/**`

   `* It handles any extra properties that we haven't declared as type 'any'.`

   `*/`

  `[x: string]: any;`

`}`

`function processOptions(opts: Options) {`

  `// Notice we're *intentionally* accessing `excludes`, not `exclude``

  `if (opts.excludes) {`

    `console.error(`

      `"The option `excludes` is not valid. Did you mean `exclude`?"`

    `);`

  `}`

`}`

[Try](https://www.typescriptlang.org/play/#code/JYOwLgpgTgZghgYwgAgPIAczAPYgM7IDeAUMsgPQBUlyAYsADYrpxiRT7JjbIBGKEAB4IGAVwAmEcQDpklcqWRCREiAH4AXMjxgooAOYBtALoBuYoqqVFc5AEkwyABZwQ4pgVcBPJYN1xkdChsdGgsCAIwF0cAdxQXADcIEAByR0kROCgpZDhIr1DkFO8U6Rt5RUNBLR09EH1jLW9zAF8LGFEQBCxcQOCkPDwMHvwAChCwPC1hnHwASiJLcmQAOWwsJGQ4lOy5UEhwWbgGBi8aRAG8A2QAA2UxSTwbgBpkEHXb+9UbxWAYZHGmDw0i+jwWJDIZAQuDw2CYIKgwSgoxskIARAAVJwoCazT7CB4RG7IYAEd6OBLHYAyZAAEWpyC82FEyAAthBXPiVJIbmo0ai5uYyG0WkA)

To make these types of situations easier, a while back, TypeScript made it possible to use “dotted” property access syntax like `person.name` when a type had a string index signature. This also made it easier to transition existing JavaScript code over to TypeScript.

However, loosening the restriction also meant that misspelling an explicitly declared property became much easier.

ts

`function processOptions(opts: Options) {`

  `// ...`

  `// Notice we're *accidentally* accessing `excludes` this time.`

  `// Oops! Totally valid.`

  `for (const excludePattern of opts.excludes) {`

    `// ...`

  `}`

`}`

[Try](https://www.typescriptlang.org/play/#code/JYOwLgpgTgZghgYwgAgPIAczAPYgM7IDeAUMsgPQBUlyAYsADYrpxiRT7JjbIBGKEAB4IGAVwAmEcQDpklcqWRCREiAH4AXMjxgooAOYBtALoBuYoqqVFc5AEkwyABZwQ4pgVcBPJYN1xkdChsdGgsCAIwF0cAdxQXADcIEAByR0kROCgpZDhIr1DkFO8U6Rt5RUNBLR09EH1jLW9zAF9icnJkAFoehFEwHq7iGFEQBCxcQOCkPDwMCfwAChCwPC15nHwASiJLTukDizIO5AA5bCwkZDiU7LlEBGBJcDgGBi8aB4i8A2QAA2UYkkeD+XCcwEiwAAthAysdOqgQngAITIAAqF1e72QCVeTzhyBg2CgyEWCFwOl8KkkAAVWOwQMhsDAmZg8NJAao8DsSGR4cgDgS2i0gA)

In some cases, users would prefer to explicitly opt into the index signature - they would prefer to get an error message when a dotted property access doesn’t correspond to a specific property declaration.

That’s why TypeScript introduces a new flag called [`noPropertyAccessFromIndexSignature`](https://www.typescriptlang.org/tsconfig#noPropertyAccessFromIndexSignature). Under this mode, you’ll be opted in to TypeScript’s older behavior that issues an error. This new setting is not under the [`strict`](https://www.typescriptlang.org/tsconfig#strict) family of flags, since we believe users will find it more useful on certain codebases than others.

You can understand this feature in more detail by reading up on the corresponding [pull request](https://github.com/microsoft/TypeScript/pull/40171/). We’d also like to extend a big thanks to [Wenlu Wang](https://github.com/Kingwl) who sent us this pull request!

## [](#abstract-construct-signatures)`abstract` Construct Signatures

TypeScript allows us to mark a class as _abstract_. This tells TypeScript that the class is only meant to be extended from, and that certain members need to be filled in by any subclass to actually create an instance.

ts

`abstract class Shape {`

  `abstract getArea(): number;`

`}`

`new Shape();`

`Cannot create an instance of an abstract class.2511Cannot create an instance of an abstract class.  class Square extends Shape {    #sideLength: number;    constructor(sideLength: number) {      super();      this.#sideLength = sideLength;    }    getArea() {      return this.#sideLength ** 2;    }  }  // Works fine.  new Square(42);  `[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwFYCMWBQBDAI0QBdp8BjE0CgG30UVAGUALfAB0lAG9dRQRUuSqgA5pBIBBaJHwAKAJSoAdgFcAtoRgBuXAF9cuFZADuLdlyV7cdBk2YBHNflmhIADxKQVAEweW3HwCAMSIAJa+kAAyPmIkrKqa2tA2AhRwKsJqVAjyEVGxKvGJoOpaMIq8-AKgiGpc0NY1AgnhiAB0YZExcQmgALx1PUUlegKGNRLSsgpVwbWyJGrQKqBtnd2FfaygAFR76OOghpMgoADqCADWTABm4SYdxmYszq6Q8gAsaIo6QA)

To make sure this restriction in `new`\-ing up `abstract` classes is consistently applied, you can’t assign an `abstract` class to anything that expects a construct signature.

ts

`interface HasArea {`

  `getArea(): number;`

`}`

`let Ctor: new () => HasArea = Shape;`

`Type 'typeof Shape' is not assignable to type 'new () => HasArea'.   Cannot assign an abstract constructor type to a non-abstract constructor type.2322Type 'typeof Shape' is not assignable to type 'new () => HasArea'.   Cannot assign an abstract constructor type to a non-abstract constructor type.`[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwGY1oFAEMAjRAF2jwGNjRyAbPRRUAZQAs8AHSUAbx1FEIkylUAHNIxAILRIeABQBKVADsArgFsCMANw4AvjhCgAtKfKrip4zgCWy4jABmFLgAl602Tz5iJn+Uqgapo6+jg4NBKgAMLECCqQAO6giqAAvAB8oO6I-unMbJzaQA)

This does the right thing in case we intend to run code like `new Ctor`, but it’s overly-restrictive in case we want to write a subclass of `Ctor`.

ts

`abstract class Shape {`

  `abstract getArea(): number;`

`}`

`interface HasArea {`

  `getArea(): number;`

`}`

`function makeSubclassWithArea(Ctor: new () => HasArea) {`

  `return class extends Ctor {`

    `getArea() {`

      `return 42`

    `}`

  `};`

`}`

`let MyShape = makeSubclassWithArea(Shape);`

`Argument of type 'typeof Shape' is not assignable to parameter of type 'new () => HasArea'.   Cannot assign an abstract constructor type to a non-abstract constructor type.2345Argument of type 'typeof Shape' is not assignable to parameter of type 'new () => HasArea'.   Cannot assign an abstract constructor type to a non-abstract constructor type.`[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwGYAsBWAUAIYBGiALtAQMamiUA2BiioAygBYEAOkoA3nqFDEyFaqADmkUgEFokAgAoAlKgB2AVwC2RGAG48AXzx4AlqtIwAZlR4AJRrPl8BEqY8UrQG7XsPHL6qrUJnCqoJoEANaQLOpE9IyIAOompGzuCgDCpAhqkADuoMqgALwAfKD2iO5KzoJypOrQYQlMoJAAHhaqACbM2Qh1gq4ych5Dw6ANTWFYaC6CRov6Rnh0UqAAsgCe7Fw8JeFRMXGtyanpYwp73Eq6QA)

It also doesn’t work well with built-in helper types like `InstanceType`.

ts

`type MyInstance = InstanceType<typeof Shape>;`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwGYAsWBQBDAI0QBdp8BjE0CgG30UVAGUALfAB0lAG9dRQRUuSqgA5pBIBBaJHwAKAJSoAdgFcAtoRgBuXAF9cIUAFozFNSTMncJAJ5dQAWTsBJFaXwqK3ALyh3T29IABUHSAAeey44ADMWdi4APh0gA)

That’s why TypeScript 4.2 allows you to specify an `abstract` modifier on constructor signatures.

ts

`interface HasArea {`

    `getArea(): number;`

`}`

`// Works!`

`let Ctor: abstract new () => HasArea = Shape;`

[Try](https://www.typescriptlang.org/play/#code/IYIwzgLgTsDGEAJYBthjAgygC2ABwFMEBvAKAQVEhngQHMCIBBKA4ACgEoAuBAOwCuAWxAEoAblIBfUgHpZCALTLYAiMsWkAlnwhiAZnCIAJNCzYlyFeo3Mce-YaInTSchQHUA9lADWYAEJSZEYEAGEIH14qaDhEPgIAdwQuBABeAD4EUzA7dKxcQnEgA)

Adding the `abstract` modifier to a construct signature signals that you can pass in `abstract` constructors. It doesn’t stop you from passing in other classes/constructor functions that are “concrete” - it really just signals that there’s no intent to run the constructor directly, so it’s safe to pass in either class type.

This feature allows us to write _mixin factories_ in a way that supports abstract classes. For example, in the following code snippet, we’re able to use the mixin function `withStyles` with the `abstract` class `SuperClass`.

ts

`abstract class SuperClass {`

    `abstract someMethod(): void;`

    `badda() {}`

`}`

`type AbstractConstructor<T> = abstract new (...args: any[]) => T`

`function withStyles<T extends AbstractConstructor<object>>(Ctor: T) {`

    `abstract class StyledClass extends Ctor {`

        `getStyles() {`

            `// ...`

        `}`

    `}`

    `return StyledClass;`

`}`

`class SubClass extends withStyles(SuperClass) {`

    `someMethod() {`

        `this.someMethod()`

    `}`

`}`

[Try](https://www.typescriptlang.org/play/#code/IYIwzgLgTsDGEAJYBthjAgygVwA4FMoBhVdBAbwCgEaFRIZ4EwB7AW3wFl8IALFgCYAKAJQAuBADcWASwEBuarRDABA4KIoBfSjsoQAngQQBBcNDgQiLAHYNs8FlAA8AFQB8CALx1zjRDb4AO4IQgB0EcBQAOZgEsA2BgDaALoi3p6ulJQAZtg28DK2CEEyfJiGyPhgbgj4AB4Q+DYCGGYMltZ20A4QTs4sIABW+PDu7kJEfVASrulUtL4dTChoGBUGVQIka3WNza0IU04USos00TwbVWCaC+cPAPSPCBFhZ+c6i1+0UDzYUBsWEq+G2pDAij0qzIOBAOzIDSaLQwpXKINuOAIxHB8w+rA43D4gjuH0WfBkYDC+K4PH4whEHx0WiAA)

Note that `withStyles` is demonstrating a specific rule, where a class (like `StyledClass`) that extends a value that’s generic and bounded by an abstract constructor (like `Ctor`) has to also be declared `abstract`. This is because there’s no way to know if a class with _more_ abstract members was passed in, and so it’s impossible to know whether the subclass implements all the abstract members.

You can read up more on abstract construct signatures [on its pull request](https://github.com/microsoft/TypeScript/pull/36392).

## [](#understanding-your-project-structure-with---explainfiles)Understanding Your Project Structure With `--explainFiles`

A surprisingly common scenario for TypeScript users is to ask “why is TypeScript including this file?“. Inferring the files of your program turns out to be a complicated process, and so there are lots of reasons why a specific combination of `lib.d.ts` got used, why certain files in `node_modules` are getting included, and why certain files are being included even though we thought specifying [`exclude`](https://www.typescriptlang.org/tsconfig#exclude) would keep them out.

That’s why TypeScript now provides an [`explainFiles`](https://www.typescriptlang.org/tsconfig#explainFiles) flag.

sh

`tsc --explainFiles`

When using this option, the TypeScript compiler will give some very verbose output about why a file ended up in your program. To read it more easily, you can forward the output to a file, or pipe it to a program that can easily view it.

sh

`# Forward output to a text file`

`tsc --explainFiles > explanation.txt`

`# Pipe output to a utility program like `less`, or an editor like VS Code`

`tsc --explainFiles | less`

`tsc --explainFiles | code -`

Typically, the output will start out by listing out reasons for including `lib.d.ts` files, then for local files, and then `node_modules` files.

`TS_Compiler_Directory/4.2.2/lib/lib.es5.d.ts`

  `Library referenced via 'es5' from file 'TS_Compiler_Directory/4.2.2/lib/lib.es2015.d.ts'`

`TS_Compiler_Directory/4.2.2/lib/lib.es2015.d.ts`

  `Library referenced via 'es2015' from file 'TS_Compiler_Directory/4.2.2/lib/lib.es2016.d.ts'`

`TS_Compiler_Directory/4.2.2/lib/lib.es2016.d.ts`

  `Library referenced via 'es2016' from file 'TS_Compiler_Directory/4.2.2/lib/lib.es2017.d.ts'`

`TS_Compiler_Directory/4.2.2/lib/lib.es2017.d.ts`

  `Library referenced via 'es2017' from file 'TS_Compiler_Directory/4.2.2/lib/lib.es2018.d.ts'`

`TS_Compiler_Directory/4.2.2/lib/lib.es2018.d.ts`

  `Library referenced via 'es2018' from file 'TS_Compiler_Directory/4.2.2/lib/lib.es2019.d.ts'`

`TS_Compiler_Directory/4.2.2/lib/lib.es2019.d.ts`

  `Library referenced via 'es2019' from file 'TS_Compiler_Directory/4.2.2/lib/lib.es2020.d.ts'`

`TS_Compiler_Directory/4.2.2/lib/lib.es2020.d.ts`

  `Library referenced via 'es2020' from file 'TS_Compiler_Directory/4.2.2/lib/lib.esnext.d.ts'`

`TS_Compiler_Directory/4.2.2/lib/lib.esnext.d.ts`

  `Library 'lib.esnext.d.ts' specified in compilerOptions`

`... More Library References...`

`foo.ts`

  `Matched by include pattern '**/*' in 'tsconfig.json'`

Right now, we make no guarantees about the output format - it might change over time. On that note, we’re interested in improving this format if you have any suggestions!

For more information, [check out the original pull request](https://github.com/microsoft/TypeScript/pull/40011)!

## [](#improved-uncalled-function-checks-in-logical-expressions)Improved Uncalled Function Checks in Logical Expressions

Thanks to further improvements from [Alex Tarasyuk](https://github.com/a-tarasyuk), TypeScript’s uncalled function checks now apply within `&&` and `||` expressions.

Under [`strictNullChecks`](https://www.typescriptlang.org/tsconfig#strictNullChecks), the following code will now error.

ts

`function shouldDisplayElement(element: Element) {`

  `// ...`

  `return true;`

`}`

`function getVisibleItems(elements: Element[]) {`

  `return elements.filter((e) => shouldDisplayElement && e.children.length);`

  `//                          ~~~~~~~~~~~~~~~~~~~~`

  `// This condition will always return true since the function is always defined.`

  `// Did you mean to call it instead.`

`}`

For more details, [check out the pull request here](https://github.com/microsoft/TypeScript/issues/40197).

## [](#destructured-variables-can-be-explicitly-marked-as-unused)Destructured Variables Can Be Explicitly Marked as Unused

Thanks to another pull request from [Alex Tarasyuk](https://github.com/a-tarasyuk), you can now mark destructured variables as unused by prefixing them with an underscore (the `_` character).

ts

`let [_first, second] = getValues();`

Previously, if `_first` was never used later on, TypeScript would issue an error under [`noUnusedLocals`](https://www.typescriptlang.org/tsconfig#noUnusedLocals). Now, TypeScript will recognize that `_first` was intentionally named with an underscore because there was no intent to use it.

For more details, take a look at [the full change](https://github.com/microsoft/TypeScript/pull/41378).

## [](#relaxed-rules-between-optional-properties-and-string-index-signatures)Relaxed Rules Between Optional Properties and String Index Signatures

String index signatures are a way of typing dictionary-like objects, where you want to allow access with arbitrary keys:

ts

`const movieWatchCount: { [key: string]: number } = {};`

`function watchMovie(title: string) {`

  `movieWatchCount[title] = (movieWatchCount[title] ?? 0) + 1;`

`}`

[Try](https://www.typescriptlang.org/play/#code/MYewdgzgLgBAtiAbgSwKYHUCGVgAsDCIArmFAFwwDeMA2gNaoCeF0ATsmAOYC6FYRcAEapWMAL4wAvFTEBuAFDyAZiWBRk4GAHdseALJI0ACnVQANqhZR2XAJRV5MeIYy6CxUjVMXuUmEYQUVxx3EigvZHNUXwB+GJgABnsAahgARgUxIA)

Of course, for any movie title not yet in the dictionary, `movieWatchCount[title]` will be `undefined` (TypeScript 4.1 added the option [`noUncheckedIndexedAccess`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#checked-indexed-accesses---nouncheckedindexedaccess) to include `undefined` when reading from an index signature like this). Even though it’s clear that there must be some strings not present in `movieWatchCount`, previous versions of TypeScript treated optional object properties as unassignable to otherwise compatible index signatures, due to the presence of `undefined`.

ts

`type WesAndersonWatchCount = {`

  `"Fantastic Mr. Fox"?: number;`

  `"The Royal Tenenbaums"?: number;`

  `"Moonrise Kingdom"?: number;`

  `"The Grand Budapest Hotel"?: number;`

`};`

`declare const wesAndersonWatchCount: WesAndersonWatchCount;`

`const movieWatchCount: { [key: string]: number } = wesAndersonWatchCount;`

`//    ~~~~~~~~~~~~~~~ error!`

`// Type 'WesAndersonWatchCount' is not assignable to type '{ [key: string]: number; }'.`

`//    Property '"Fantastic Mr. Fox"' is incompatible with index signature.`

`//      Type 'number | undefined' is not assignable to type 'number'.`

`//        Type 'undefined' is not assignable to type 'number'. (2322)`

[Try](https://www.typescriptlang.org/play/#code/C4TwDgpgBA6hDOBBAdgEwgJ3ge2TAhsAMYAWAwtgK7LBQC8UA3gFBRQBEAYvjfvMAEsiUALIYAdFE7YAHuwD8ALijJKAWwBGmANysOAFRLQASthD4ANlH0RktjfnXwFy1Zp172I7LgwD40ADSAsgA5qjYai4q6loYumzshtAA4hg8qFAAQpSo+JD8UAAS2MAQFtFucboAvrrM6EQW+BjQRLiFAO4IKOhYuATE5FQ0ynBIaJg4eISkFNTAuu3IhWrYAG4CEINzI8DKjFAA2gDWECDK-H5hALqusZhQNfRQ3RN90zvDC7oA9L9sNgAPxBoLB4KgmAw2AwAEJmP9rOBoAByca9KYDWbfGgoqD+FSlKB8eACULIfAaCzQYDYKCgSBQFGHU7nS7Aa6hO4xdzxJ4o8QIgGAgAK0MgGFATK4PGAfEEwjEkmkcjxBJC7TUYEIAip0E6AmAJHxkxkUFJ5MIlFagsRgLY+mRTKqjwAPlBqOgAGYhCCoNXwQm0Elkil6+l0hmol0YAVC+32x2MlGeiA+uz+-GB5BEkOW8O0+lOlExgVQAAUACYAMyVysASiAA)

TypeScript 4.2 allows this assignment. However, it does _not_ allow the assignment of non-optional properties with `undefined` in their types, nor does it allow writing `undefined` to a specific key:

ts

`type BatmanWatchCount = {`

  `"Batman Begins": number | undefined;`

  `"The Dark Knight": number | undefined;`

  `"The Dark Knight Rises": number | undefined;`

`};`

`declare const batmanWatchCount: BatmanWatchCount;`

`// Still an error in TypeScript 4.2.`

`const movieWatchCount: { [key: string]: number } = batmanWatchCount;`

``Type 'BatmanWatchCount' is not assignable to type '{ [key: string]: number; }'.   Property '"Batman Begins"' is incompatible with index signature.     Type 'number | undefined' is not assignable to type 'number'.       Type 'undefined' is not assignable to type 'number'.2322Type 'BatmanWatchCount' is not assignable to type '{ [key: string]: number; }'.   Property '"Batman Begins"' is incompatible with index signature.     Type 'number | undefined' is not assignable to type 'number'.       Type 'undefined' is not assignable to type 'number'.  // Still an error in TypeScript 4.2.  // Index signatures don't implicitly allow explicit `undefined`.  movieWatchCount["It's the Great Pumpkin, Charlie Brown"] = undefined;  Type 'undefined' is not assignable to type 'number'.2322Type 'undefined' is not assignable to type 'number'.``[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwGY1oFABcBPAB0lACEBDPAWwoDsB1KgYwAsBhOAVzr1AF5QAbxyhQAIko165SAHMAlnUTjUdLtQBGMUAB9QPACaQAZksiGA3KIkAVVqQAiFaAGtQAaToK5rPKtB1LR19I1NzKxtxeycXdy8fP1AAJQVESBU1DW1oPQM6YzM6C2sAX2scY2YAGxdSZjhlPk0qWkYWDm5eVCk2pjw2Th48CpBQAGU8BWrq0BkYeFylUFtiSHHmaAUiPgAWADo0fZwGptBqOAA3BUh+wa68VCFQAG1XSAJURDwtujkAXSywVypQEoBa0naA06w1GYEm01m81gCFAy1WJA2Wx2oAORxwYwAkgVIAAPUCIHx0KhcaAZUCGRoAcj4CmoRGqCmYCjw1QIcxmcAA7qAyRyuTzQAADMJFCxS44Xa63DpDXgvcSEvBMxCgPAOUAAcTpVFAAAUNERXEoADSgdisFyc0hkeBCujif5g2URSxAA)

The new rule also does not apply to number index signatures, since they are assumed to be array-like and dense:

ts

`declare let sortOfArrayish: { [key: number]: string };`

`declare let numberKeys: { 42?: string };`

`sortOfArrayish = numberKeys;`

`Type '{ 42?: string | undefined; }' is not assignable to type '{ [key: number]: string; }'.   Property '42' is incompatible with index signature.     Type 'string | undefined' is not assignable to type 'string'.       Type 'undefined' is not assignable to type 'string'.2322Type '{ 42?: string | undefined; }' is not assignable to type '{ [key: number]: string; }'.   Property '42' is incompatible with index signature.     Type 'string | undefined' is not assignable to type 'string'.       Type 'undefined' is not assignable to type 'string'.`[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwGY1oFABNIBjAGwENpJRjIAXURBGgeQDMBBWUgTwEtEALVAG9QAbQDWkLqgB2AVwC2AIxgBdVIhrQeMgOagAvgG58RMhSq1Q85TADSUlKBEAWNAH4NWnfuM4cDNDM7Jy8AqAAvNaKKtAOXIhGQA)

You can get a better sense of this change [by reading up on the original PR](https://github.com/microsoft/TypeScript/pull/41921).

## [](#declare-missing-helper-function)Declare Missing Helper Function

Thanks to [a community pull request](https://github.com/microsoft/TypeScript/pull/41215) from [Alexander Tarasyuk](https://github.com/a-tarasyuk), we now have a quick fix for declaring new functions and methods based on the call-site!

![An un-declared function foo being called, with a quick fix scaffolding out the new contents of the file](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782978047/aha-mind/docs-crawler/www.typescriptlang.org/addMissingFunction-4.2_lcn3gb.gif)

## [](#breaking-changes)Breaking Changes

We always strive to minimize breaking changes in a release. TypeScript 4.2 contains some breaking changes, but we believe they should be manageable in an upgrade.

### [](#libdts-updates)`lib.d.ts` Updates

As with every TypeScript version, declarations for `lib.d.ts` (especially the declarations generated for web contexts), have changed. There are various changes, though `Intl` and `ResizeObserver`’s may end up being the most disruptive.

### [](#noimplicitany-errors-apply-to-loose-yield-expressions)`noImplicitAny` Errors Apply to Loose `yield` Expressions

When the value of a `yield` expression is captured, but TypeScript can’t immediately figure out what type you intend for it to receive (i.e. the `yield` expression isn’t contextually typed), TypeScript will now issue an implicit `any` error.

ts

`function* g1() {`

  `const value = yield 1;`

``'yield' expression implicitly results in an 'any' type because its containing generator lacks a return-type annotation.7057'yield' expression implicitly results in an 'any' type because its containing generator lacks a return-type annotation.  }  function* g2() {    // No error.    // The result of `yield 1` is unused.    yield 1;  }  function* g3() {    // No error.    // `yield 1` is contextually typed by 'string'.    const value: string = yield 1;  }  function* g4(): Generator<number, void, string> {    // No error.    // TypeScript can figure out the type of `yield 1`    // from the explicit return type of `g4`.    const value = yield 1;  }  ``[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygOwAYCsaBQAzAVwDsBjAFwEs5iAqUAcwEYAKASlAG9dRRSbE5UADcAhgBtCkUAF5QAT0qRxAE1BMA3LgC+uAiQrU6jAEzsuPUCFAA5OKBjxoAOkvWAKgAtp0SIkLiQnD4oAAGispqTKGglIigJISIkCquvBGq6lq6+mRUNPQMAMzm3LzWdg6wCGlWYOFKmdGx8fzE5JAAHuSEEuLyoOTyAA4poABGAwDkgtCUxAxTtW2CIhJSqLPzDLIKjVHZekR5RoUALOyoAOKQxDCi5AgAPMSEALbjMAA0InCUKj8tgsAHwWcpgSqOGpuMDuEaQADKpDmwyEpFExFA+EoDEIvlAcEIQnI3kG8IJIQakXUoRhWPgb0GpK6w3ElFIlCEvh60ExQ1GFLCDDOoWWAiEYkk0jkGQOOiAA)

See more details in [the corresponding changes](https://github.com/microsoft/TypeScript/pull/41348).

### [](#expanded-uncalled-function-checks)Expanded Uncalled Function Checks

As described above, uncalled function checks will now operate consistently within `&&` and `||` expressions when using [`strictNullChecks`](https://www.typescriptlang.org/tsconfig#strictNullChecks). This can be a source of new breaks, but is typically an indication of a logic error in existing code.

### [](#type-arguments-in-javascript-are-not-parsed-as-type-arguments)Type Arguments in JavaScript Are Not Parsed as Type Arguments

Type arguments were already not allowed in JavaScript, but in TypeScript 4.2, the parser will parse them in a more spec-compliant way. So when writing the following code in a JavaScript file:

ts

`f<T>(100);`

TypeScript will parse it as the following JavaScript:

js

`f < T > 100;`

This may impact you if you were leveraging TypeScript’s API to parse type constructs in JavaScript files, which may have occurred when trying to parse Flow files.

See [the pull request](https://github.com/microsoft/TypeScript/pull/41928) for more details on what’s checked.

### [](#tuple-size-limits-for-spreads)Tuple size limits for spreads

Tuple types can be made by using any sort of spread syntax (`...`) in TypeScript.

ts

`// Tuple types with spread elements`

`type NumStr = [number, string];`

`type NumStrNumStr = [...NumStr, ...NumStr];`

`// Array spread expressions`

`const numStr = [123, "hello"] as const;`

`const numStrNumStr = [...numStr, ...numStr] as const;`

Sometimes these tuple types can accidentally grow to be huge, and that can make type-checking take a long time. Instead of letting the type-checking process hang (which is especially bad in editor scenarios), TypeScript has a limiter in place to avoid doing all that work.

You can [see this pull request](https://github.com/microsoft/TypeScript/pull/42448) for more details.

### [](#dts-extensions-cannot-be-used-in-import-paths)`.d.ts` Extensions Cannot Be Used In Import Paths

In TypeScript 4.2, it is now an error for your import paths to contain `.d.ts` in the extension.

ts

`// must be changed to something like`

`//   - "./foo"`

`//   - "./foo.js"`

`import { Foo } from "./foo.d.ts";`

Instead, your import paths should reflect whatever your loader will do at runtime. Any of the following imports might be usable instead.

ts

`import { Foo } from "./foo";`

`import { Foo } from "./foo.js";`

`import { Foo } from "./foo/index.js";`

### [](#reverting-template-literal-inference)Reverting Template Literal Inference

This change removed a feature from TypeScript 4.2 beta. If you haven’t yet upgraded past our last stable release, you won’t be affected, but you may still be interested in the change.

The beta version of TypeScript 4.2 included a change in inference to template strings. In this change, template string literals would either be given template string types or simplify to multiple string literal types. These types would then _widen_ to `string` when assigning to mutable variables.

ts

`declare const yourName: string;`

`// 'bar' is constant.`

`// It has type '`hello ${string}`'.`

`const bar = `hello ${yourName}`;`

`// 'baz' is mutable.`

`// It has type 'string'.`

`let baz = `hello ${yourName}`;`

This is similar to how string literal inference works.

ts

`// 'bar' has type '"hello"'.`

`const bar = "hello";`

`// 'baz' has type 'string'.`

`let baz = "hello";`

For that reason, we believed that making template string expressions have template string types would be “consistent”; however, from what we’ve seen and heard, that isn’t always desirable.

In response, we’ve reverted this feature (and potential breaking change). If you _do_ want a template string expression to be given a literal-like type, you can always add `as const` to the end of it.

ts

`declare const yourName: string;`

`// 'bar' has type '`hello ${string}`'.`

`const bar = `hello ${yourName}` as const;`

`//                              ^^^^^^^^`

`// 'baz' has type 'string'.`

`const baz = `hello ${yourName}`;`

### [](#typescripts-lift-callback-in-visitnode-uses-a-different-type)TypeScript’s `lift` Callback in `visitNode` Uses a Different Type

TypeScript has a `visitNode` function that takes a `lift` function. `lift` now expects a `readonly Node[]` instead of a `NodeArray<Node>`. This is technically an API breaking change which you can read more on [here](https://github.com/microsoft/TypeScript/pull/42000).
