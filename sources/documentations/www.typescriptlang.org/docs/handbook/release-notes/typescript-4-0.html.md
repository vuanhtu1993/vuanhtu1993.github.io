---
title: "Documentation - TypeScript 4.0"
source_url: "https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-0.html"
crawled_at: "2026-07-02T07:40:59.919Z"
---

## [](#variadic-tuple-types)Variadic Tuple Types

Consider a function in JavaScript called `concat` that takes two array or tuple types and concatenates them together to make a new array.

js

`function concat(arr1, arr2) {`

  `return [...arr1, ...arr2];`

`}`

Also consider `tail`, that takes an array or tuple, and returns all elements but the first.

js

`function tail(arg) {`

  `const [_, ...result] = arg;`

  `return result;`

`}`

How would we type either of these in TypeScript?

For `concat`, the only valid thing we could do in older versions of the language was to try and write some overloads.

ts

`function concat(arr1: [], arr2: []): [];`

`function concat<A>(arr1: [A], arr2: []): [A];`

`function concat<A, B>(arr1: [A, B], arr2: []): [A, B];`

`function concat<A, B, C>(arr1: [A, B, C], arr2: []): [A, B, C];`

`function concat<A, B, C, D>(arr1: [A, B, C, D], arr2: []): [A, B, C, D];`

`function concat<A, B, C, D, E>(arr1: [A, B, C, D, E], arr2: []): [A, B, C, D, E];`

`function concat<A, B, C, D, E, F>(arr1: [A, B, C, D, E, F], arr2: []): [A, B, C, D, E, F];`

Uh…okay, that’s…seven overloads for when the second array is always empty. Let’s add some for when `arr2` has one argument.

ts

`function concat<A2>(arr1: [], arr2: [A2]): [A2];`

`function concat<A1, A2>(arr1: [A1], arr2: [A2]): [A1, A2];`

`function concat<A1, B1, A2>(arr1: [A1, B1], arr2: [A2]): [A1, B1, A2];`

`function concat<A1, B1, C1, A2>(arr1: [A1, B1, C1], arr2: [A2]): [A1, B1, C1, A2];`

`function concat<A1, B1, C1, D1, A2>(arr1: [A1, B1, C1, D1], arr2: [A2]): [A1, B1, C1, D1, A2];`

`function concat<A1, B1, C1, D1, E1, A2>(arr1: [A1, B1, C1, D1, E1], arr2: [A2]): [A1, B1, C1, D1, E1, A2];`

`function concat<A1, B1, C1, D1, E1, F1, A2>(arr1: [A1, B1, C1, D1, E1, F1], arr2: [A2]): [A1, B1, C1, D1, E1, F1, A2];`

We hope it’s clear that this is getting unreasonable. Unfortunately, you’d also end up with the same sorts of issues typing a function like `tail`.

This is another case of what we like to call “death by a thousand overloads”, and it doesn’t even solve the problem generally. It only gives correct types for as many overloads as we care to write. If we wanted to make a catch-all case, we’d need an overload like the following:

ts

`function concat<T, U>(arr1: T[], arr2: U[]): Array<T | U>;`

But that signature doesn’t encode anything about the lengths of the input, or the order of the elements, when using tuples.

TypeScript 4.0 brings two fundamental changes, along with inference improvements, to make typing these possible.

The first change is that spreads in tuple type syntax can now be generic. This means that we can represent higher-order operations on tuples and arrays even when we don’t know the actual types we’re operating over. When generic spreads are instantiated (or, replaced with a real type) in these tuple types, they can produce other sets of array and tuple types.

For example, that means we can type function like `tail`, without our “death by a thousand overloads” issue.

ts

`function tail<T extends any[]>(arr: readonly [any, ...T]) {`

  `const [_ignored, ...rest] = arr;`

  `return rest;`

`}`

`const myTuple = [1, 2, 3, 4] as const;`

`const myArray = ["hello", "world"];`

`const r1 = tail(myTuple);`

      `const r1: [2, 3, 4]`

`const r2 = tail([...myTuple, ...myArray] as const);`

      `const r2: [2, 3, 4, ...string[]]`

[Try](https://www.typescriptlang.org/play/#code/GYVwdgxgLglg9mABFAhjANgHgCqIKYAeUeYAJgM6IpgCeA2gLoB8AFCgE7sBci7eKpBOhqI61GgBpEAOlnYGASkQBvAFCJEEBOSiiA+jADmYOH1JTZ0vjoaIAvFU4BudbzxQQ7JNaguAvqqqWmA6iAC2NNggAA7oePaiAIxSAExSAMxSACy2KJTBOi4FuhEAgpwoIg50AEQAFnjo6HA1UjUA7qbopDUMLkHauuyJCagYLBFRsXgKLgD0cxoaAHoA-IHFvCmjaOgsdJaTMXEWsmUVNLn5g7OqC0uIa0A)

The second change is that rest elements can occur anywhere in a tuple - not just at the end!

ts

`type Strings = [string, string];`

`type Numbers = [number, number];`

`type StrStrNumNumBool = [...Strings, ...Numbers, boolean];`

Previously, TypeScript would issue an error like the following:

`A rest element must be last in a tuple type.`

But with TypeScript 4.0, this restriction is relaxed.

Note that in cases when we spread in a type without a known length, the resulting type becomes unbounded as well, and all the following elements factor into the resulting rest element type.

ts

`type Strings = [string, string];`

`type Numbers = number[];`

`type Unbounded = [...Strings, ...Numbers, boolean];`

By combining both of these behaviors together, we can write a single well-typed signature for `concat`:

ts

`type Arr = readonly any[];`

`function concat<T extends Arr, U extends Arr>(arr1: T, arr2: U): [...T, ...U] {`

  `return [...arr1, ...arr2];`

`}`

[Try](https://www.typescriptlang.org/play/#code/C4TwDgpgBAggTnKBeKcIEMAmB7AdgGxCnVxAG0BdAbgCgaAzAV1wGNgBLPKFvF9YADwAVKBAAewCLkwBnWAgA0UAKqiJU2fLgA+ABToEARgBcUIUoNwATKeUBKU2QB0L81BdPlFKAG8aUVAhgRjhcKGcXS0MlD0srahoAXyA)

While that one signature is still a bit lengthy, it’s just one signature that doesn’t have to be repeated, and it gives predictable behavior on all arrays and tuples.

This functionality on its own is great, but it shines in more sophisticated scenarios too. For example, consider a function to [partially apply arguments](https://en.wikipedia.org/wiki/Partial_application) called `partialCall`. `partialCall` takes a function - let’s call it `f` - along with the initial few arguments that `f` expects. It then returns a new function that takes any other arguments that `f` still needs, and calls `f` when it receives them.

js

`function partialCall(f, ...headArgs) {`

  `return (...tailArgs) => f(...headArgs, ...tailArgs);`

`}`

TypeScript 4.0 improves the inference process for rest parameters and rest tuple elements so that we can type this and have it “just work”.

ts

`type Arr = readonly unknown[];`

`function partialCall<T extends Arr, U extends Arr, R>(`

  `f: (...args: [...T, ...U]) => R,`

  `...headArgs: T`

`) {`

  `return (...tailArgs: U) => f(...headArgs, ...tailArgs);`

`}`

[Try](https://www.typescriptlang.org/play/#code/C4TwDgpgBAggTnKBeKcIEMAmB7AdgGxCgFdcBrXbAd1wG0BdAbgChmAzUgY2AEs8ow6OL3T4AwqPwAeACpQIAD2ARcmAM6wEAGigBVeUpXrNcHQCUAfAApmUKGwBcUKwDo3QgOZqntNy5k6frr0AJTIFlBmWrZQfgAWGJjwXk4yzGEA3jFowMRwuM5+wOg8+MneemFIEWyubglY5YFuxaXlISwAvkA)

In this case, `partialCall` understands which parameters it can and can’t initially take, and returns functions that appropriately accept and reject anything left over.

ts

`const foo = (x: string, y: number, z: boolean) => {};`

`const f1 = partialCall(foo, 100);`

`Argument of type 'number' is not assignable to parameter of type 'string'.2345Argument of type 'number' is not assignable to parameter of type 'string'.  const f2 = partialCall(foo, "hello", 100, true, "oops");  Expected 4 arguments, but got 5.2554Expected 4 arguments, but got 5.  // This works!  const f3 = partialCall(foo, "hello");        const f3: (y: number, z: boolean) => void  // What can we do with f3 now?  // Works!  f3(123, true);  f3();  Expected 2 arguments, but got 0.2554Expected 2 arguments, but got 0.  f3(123, "hello");  Argument of type 'string' is not assignable to parameter of type 'boolean'.2345Argument of type 'string' is not assignable to parameter of type 'boolean'.`[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwGYAsBWdOct9D1scAoAFwE8AHSUAQVlAF5RpIBDAEzgDsANtVABXfgGt+cAO78A2gF0A3OXIAzcQGNKASwGhaXaHq6CAwmcEAeACqhIAD0qR+PRE1gAaUAFUHzq7untA+AEoAfAAU5KCg6qhRAHQpxgDmKKDyKUm2Pjm+igCUbBGgYV6xoDkAFtw8zBmotuQlAN5VnJSi0PygySmUXLqCjZm+Jaxl6gNJdbxj+YPDo9AZRaoAvuQgoAC0B1qilAd75FoCiJTxcHBs-Y6oV9C6-Gk+1Kj8ogC2AEYwHwAL1Qf1ugm4-EmZTam1U50u13UAEZ7kYTLozJZBIIoupbj5kQAGIkbNQXfhXeJoNHGUwWKx4gmgABEdRxcBZhJJPko0FEkB8LNutEQLLJOzAthqug8MgQEkQAEIEZSkRhaRisYz8XAhezBJyybs4qAAHoAfjUuwA6jUuNctFw+jIGHxQDJdJQavENdIZFbJaAbQrlRoMFFkZhefzIBL1BH4xGoxh9ZAOeLlEA)

Variadic tuple types enable a lot of new exciting patterns, especially around function composition. We expect we may be able to leverage it to do a better job type-checking JavaScript’s built-in `bind` method. A handful of other inference improvements and patterns also went into this, and if you’re interested in learning more, you can take a look at [the pull request](https://github.com/microsoft/TypeScript/pull/39094) for variadic tuples.

## [](#labeled-tuple-elements)Labeled Tuple Elements

Improving the experience around tuple types and parameter lists is important because it allows us to get strongly typed validation around common JavaScript idioms - really just slicing and dicing argument lists and passing them to other functions. The idea that we can use tuple types for rest parameters is one place where this is crucial.

For example, the following function that uses a tuple type as a rest parameter…

ts

`function foo(...args: [string, number]): void {`

  `// ...`

`}`

…should appear no different from the following function…

ts

`function foo(arg0: string, arg1: number): void {`

  `// ...`

`}`

…for any caller of `foo`.

ts

`foo("hello", 42);`

`foo("hello", 42, true);`

`Expected 2 arguments, but got 3.2554Expected 2 arguments, but got 3.  foo("hello");  Expected 2 arguments, but got 1.2554Expected 2 arguments, but got 1.`[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwFYMBYBQAzAVwDsBjAFwEs5jR844AKAQ2gHMAGVRc6S4tgBpQrNgEZUxQgFsARjACUqAG5xKAE1ABvXKFAhQAOmO4AvrgMBaa6ULlrlgg0YAiABaQANp7gvh2NAUAblwnJncvHz9QAOFeQkhgsNcPb19goA)

There is one place where the differences begin to become observable though: readability. In the first example, we have no parameter names for the first and second elements. While these have no impact on type-checking, the lack of labels on tuple positions can make them harder to use - harder to communicate our intent.

That’s why in TypeScript 4.0, tuples types can now provide labels.

ts

`type Range = [start: number, end: number];`

To deepen the connection between parameter lists and tuple types, the syntax for rest elements and optional elements mirrors the syntax for parameter lists.

ts

`type Foo = [first: number, second?: string, ...rest: any[]];`

There are a few rules when using labeled tuples. For one, when labeling a tuple element, all other elements in the tuple must also be labeled.

ts

`type Bar = [first: string, number];`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygKwAYAcAWAUAC4CeADpKAEICG0oAvKANoBmAlkgaogdKwHYBzADSg+AVwC2AIxgBdANxA)

It’s worth noting - labels don’t require us to name our variables differently when destructuring. They’re purely there for documentation and tooling.

ts

`function foo(x: [first: string, second: number]) {`

    `// ...`

    `// note: we didn't need to name these 'first' and 'second'`

    `const [a, b] = x;`

    `a`

   `const a: string`

    `b`

   `const b: number`

`}`

[Try](https://www.typescriptlang.org/play/#code/GYVwdgxgLglg9mABMOcAUAPAXIg2sGAJwGcodTCYwBzAGkWIFMIEATHMEAWwCNHCAugEpEAbwBQiKYgD0MxADol4ydLmIwcKIxwB3RolYxWYAORQNjRq0RQ4GgIZcDUABaMmiUwRJRTiBzAbUyYWINNVKTDSPAd6HgFEAF5EDABuSIDxdUQAPQB+TJ5s+TzCgF8gA)

Overall, labeled tuples are handy when taking advantage of patterns around tuples and argument lists, along with implementing overloads in a type-safe way. In fact, TypeScript’s editor support will try to display them as overloads when possible.

![Signature help displaying a union of labeled tuples as in a parameter list as two signatures](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782978058/aha-mind/docs-crawler/www.typescriptlang.org/signatureHelpLabeledTuples_joyyxn.gif)

To learn more, check out [the pull request](https://github.com/microsoft/TypeScript/pull/38234) for labeled tuple elements.

## [](#class-property-inference-from-constructors)Class Property Inference from Constructors

TypeScript 4.0 can now use control flow analysis to determine the types of properties in classes when [`noImplicitAny`](https://www.typescriptlang.org/tsconfig#noImplicitAny) is enabled.

ts

`class Square {`

  `// Previously both of these were any`

  `area;`

   `(property) Square.area: number`

  `sideLength;`

      `(property) Square.sideLength: number`

  `constructor(sideLength: number) {`

    `this.sideLength = sideLength;`

    `this.area = sideLength ** 2;`

  `}`

`}`

[Try](https://www.typescriptlang.org/play/#code/MYGwhgzhAEDKCOBXMAnAptA3gKGtA9PtAAroBuAlgPaIQgCe0ARlQC4AW0VAZtB2hAwB3NOmhgAdvVzj0YANzZC0AHoB+GRAoATNABk0EgOYdFy9TOBUJEVikTBWVFAAotug8Y4AuaBMQAtkyiAJRYMngcFBAAdO76hiacALzQ8Z5JiniR7NExqGhg0KnpiRzQAFQV0ABMWdAAvtgNQA)

In cases where not all paths of a constructor assign to an instance member, the property is considered to potentially be `undefined`.

ts

`class Square {`

  `sideLength;`

      `(property) Square.sideLength: number | undefined`

  `constructor(sideLength: number) {`

    `if (Math.random()) {`

      `this.sideLength = sideLength;`

    `}`

  `}`

  `get area() {`

    `return this.sideLength ** 2;`

`Object is possibly 'undefined'.2532Object is possibly 'undefined'.    }  }  `[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwFYDMbQEYAOABgBYCAoAYwBsBDRRUAZQEcBXW6SUAb3NFCIAlgBNIAGUgA7AOYAXABYBuciFAA9APzl+oSnCmI50NpTkIAFMLGTZi1FLYBbAEYwAlL10ChAM1AWALK0igB00LRSInBOFu6efAJJoIpCiKHWEtLyCqAAvIKiWXbK3qAAvrqVujKQcqCckLRxXslccmzQUikKaRlFtjmgAFTD6CoCleVAA)

In cases where you know better (e.g. you have an `initialize` method of some sort), you’ll still need an explicit type annotation along with a definite assignment assertion (`!`) if you’re in [`strictPropertyInitialization`](https://www.typescriptlang.org/tsconfig#strictPropertyInitialization).

ts

`class Square {`

  `// definite assignment assertion`

  `//        v`

  `sideLength!: number;`

  `// type annotation`

  `constructor(sideLength: number) {`

    `this.initialize(sideLength);`

  `}`

  `initialize(sideLength: number) {`

    `this.sideLength = sideLength;`

  `}`

  `get area() {`

    `return this.sideLength ** 2;`

  `}`

`}`

[Try](https://www.typescriptlang.org/play/#code/MYGwhgzhAEDKCOBXMAnAptA3gKGtA9PtACZoBmAlgHYUAuGkEFA5lQLZpW3SNoq0UA9lVwEieCXgBuopqQAynZrQAWAQgBc0KojYAjPgG5RhSWYB6lq5ZNFaATwAODKlUG0wA4dlHBhEWhREYFpBFAAKOTRFKmUVLR19PgBKLFE8VQoIADpqOgowEAoALzRIigUlVWTjPABfHzw8gUKSsqiYuITdAxRUnElMnI6qlWgAXmgR2NVa6AbRZjRuVDQwcP706HRaRBQqaCHs6bjoACoz6AAmOYa6oA)

For more details, [see the implementing pull request](https://github.com/microsoft/TypeScript/pull/37920).

## [](#short-circuiting-assignment-operators)Short-Circuiting Assignment Operators

JavaScript, and a lot of other languages, support a set of operators called _compound assignment_ operators. Compound assignment operators apply an operator to two arguments, and then assign the result to the left side. You may have seen these before:

ts

`// Addition`

`// a = a + b`

`a += b;`

`// Subtraction`

`// a = a - b`

`a -= b;`

`// Multiplication`

`// a = a * b`

`a *= b;`

`// Division`

`// a = a / b`

`a /= b;`

`// Exponentiation`

`// a = a ** b`

`a **= b;`

`// Left Bit Shift`

`// a = a << b`

`a <<= b;`

So many operators in JavaScript have a corresponding assignment operator! Up until recently, however, there were three notable exceptions: logical _and_ (`&&`), logical _or_ (`||`), and nullish coalescing (`??`).

That’s why TypeScript 4.0 supports a new ECMAScript feature to add three new assignment operators: `&&=`, `||=`, and `??=`.

These operators are great for substituting any example where a user might write code like the following:

ts

`a = a && b;`

`a = a || b;`

`a = a ?? b;`

Or a similar `if` block like

ts

`// could be 'a ||= b'`

`if (!a) {`

  `a = b;`

`}`

There are even some patterns we’ve seen (or, uh, written ourselves) to lazily initialize values, only if they’ll be needed.

ts

`let values: string[];`

`(values ?? (values = [])).push("hello");`

`// After`

`(values ??= []).push("hello");`

(look, we’re not proud of _all_ the code we write…)

On the rare case that you use getters or setters with side-effects, it’s worth noting that these operators only perform assignments if necessary. In that sense, not only is the right side of the operator “short-circuited” - the assignment itself is too.

ts

`obj.prop ||= foo();`

`// roughly equivalent to either of the following`

`obj.prop || (obj.prop = foo());`

`if (!obj.prop) {`

    `obj.prop = foo();`

`}`

[Try running the following example](https://www.typescriptlang.org/play?ts=next#code/MYewdgzgLgBCBGArGBeGBvAsAKBnmA5gKawAOATiKQBQCUGO+TMokIANkQHTsgHUAiYlChFyMABYBDCDHIBXMANoBuHI2Z4A9FpgAlIqXZTgRGAFsiAQg2byJeeTAwAslKgSu5KWAAmIczoYAB4YAAYuAFY1XHwAXwAaWxgIEhgKKmoAfQA3KXYALhh4EA4iH3osWM1WCDKePkFUkTFJGTlFZRimOJw4mJwAM0VgKABLcBhB0qCqplr63n4BcjGCCVgIMd8zIjz2eXciXy7k+yhHZygFIhje7BwFzgblgBUJMdlwM3yAdykAJ6yBSQGAeMzNUTkU7YBCILgZUioOBIBGUJEAHwxUxmqnU2Ce3CWgnenzgYDMACo6pZxpYIJSOqDwSkSFCYXC0VQYFi0NMQHQVEA) to see how that differs from _always_ performing the assignment.

ts

`const obj = {`

    `get prop() {`

        `console.log("getter has run");`

        `// Replace me!`

        `return Math.random() < 0.5;`

    `},`

    `set prop(_val: boolean) {`

        `console.log("setter has run");`

    `}`

`};`

`function foo() {`

    `console.log("right side evaluated");`

    `return true;`

`}`

`console.log("This one always runs the setter");`

`obj.prop = obj.prop || foo();`

`console.log("This one *sometimes* runs the setter");`

`obj.prop ||= foo();`

[Try](https://www.typescriptlang.org/play/#code/MYewdgzgLgBCBGArGBeGBvAUDHMDmAprAA4BOIxAFAJQba4OiQgA2BAdCyHpQESFQoBUjAAWAQwgxSAVzC9qAbkz0GOAPTqYAJQLEW44ARgBbAgEJVa0kRmkwMALLioo9qXFgAJiBM0YADwwAAzsAKzKDAC+ADRWEEQwZBSUAPoAbuIsAFww8CCsBJ60WGq4TBCFnNx8CYLCYpLScgqRuFGYUcqYAGZywFAAluAwPQX+peXglWzVPLykg3iisBCDXsYEmSwyLgRerVY2UHYOULIEyh2YFVVc8wAqooNS4MZZAO7iAJ5SspAwVzGOpCUiHBCIdjJYioOBIKHkGEAHyRo3GShUt1m9z4TxecDAxgAVJUzEMzBAic0AUCYCDhOD4dCYCi0GMQDRFEA)

We’d like to extend a big thanks to community member [Wenlu Wang](https://github.com/Kingwl) for this contribution!

For more details, you can [take a look at the pull request here](https://github.com/microsoft/TypeScript/pull/37727). You can also [check out TC39’s proposal repository for this feature](https://github.com/tc39/proposal-logical-assignment/).

## [](#unknown-on-catch-clause-bindings)`unknown` on `catch` Clause Bindings

Since the beginning days of TypeScript, `catch` clause variables have always been typed as `any`. This meant that TypeScript allowed you to do anything you wanted with them.

ts

`try {`

  `// Do some work`

`} catch (x) {`

  `// x has type 'any' - have fun!`

  `console.log(x.message);`

  `console.log(x.toUpperCase());`

  `x++;`

  `x.yadda.yadda.yadda();`

`}`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEFcGcFMFUB2BrRB7A7ogkogwgIYAuAxgBYBqBATgJYEBGANrNAFygBmBTcAUEWoBPUAG8+oUCFAARNKGhoAtrFAY01ZHwC+oEsXKgAFAA8AlGIlSwJ0GQLRQRIQAdVAcgKIh70AFo7AgA3VU5IRABCKxI0REUWADomNABzUwSVaGgCFNgzAG5o2PjYJNT0ojR4FzdqQjgjMwKrEwBqVsLJEwShAgATPoIe-sHhgYJGwu0gA)

The above has some undesirable behavior if we’re trying to prevent _more_ errors from happening in our error-handling code! Because these variables have the type `any` by default, they lack any type-safety which could have errored on invalid operations.

That’s why TypeScript 4.0 now lets you specify the type of `catch` clause variables as `unknown` instead. `unknown` is safer than `any` because it reminds us that we need to perform some sorts of type-checks before operating on our values.

ts

`try {`

  `// ...`

`} catch (e: unknown) {`

  `// Can't access values on unknowns`

  `console.log(e.toUpperCase());`

`'e' is of type 'unknown'.18046'e' is of type 'unknown'.    if (typeof e === "string") {      // We've narrowed 'e' down to the type 'string'.      console.log(e.toUpperCase());    }  }  `[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwFYDsBGUOAOABgBYA2AKABdoBPUAbwtFBFADpOKBfUAYwCGVPgAtQACkioArgDsA1rLgB3WQEpGzVmADCA2QHIqoAXz6REiUADcBAG2kXQcWaDmKVsxFr4vEcO0h2OzgAc0l2KjgAVQAHWJg9REhxNTUAbgotAEsAMwkqWgS4fMhQAF5K0AAiRBps2VDqjSYWFjYAdUgDazLZAVgVSAATUANu0GHPUCiZkTLChLG66AbQg3YtFl8vAKCQ8KCouIToJJS0zJZuHiA)

While the types of `catch` variables won’t change by default, we might consider a new [`strict`](https://www.typescriptlang.org/tsconfig#strict) mode flag in the future so that users can opt in to this behavior. In the meantime, it should be possible to write a lint rule to force `catch` variables to have an explicit annotation of either `: any` or `: unknown`.

For more details you can [peek at the changes for this feature](https://github.com/microsoft/TypeScript/pull/39015).

## [](#custom-jsx-factories)Custom JSX Factories

When using JSX, a [_fragment_](https://reactjs.org/docs/fragments.html) is a type of JSX element that allows us to return multiple child elements. When we first implemented fragments in TypeScript, we didn’t have a great idea about how other libraries would utilize them. Nowadays most other libraries that encourage using JSX and support fragments have a similar API shape.

In TypeScript 4.0, users can customize the fragment factory through the new [`jsxFragmentFactory`](https://www.typescriptlang.org/tsconfig#jsxFragmentFactory) option.

As an example, the following `tsconfig.json` file tells TypeScript to transform JSX in a way compatible with React, but switches each factory invocation to `h` instead of `React.createElement`, and uses `Fragment` instead of `React.Fragment`.

`{`

  `"": {`

    `"": "esnext",`

    `"": "commonjs",`

    `"": "react",`

    `"": "h",`

    `"": "Fragment"`

  `}`

`}`

In cases where you need to have a different JSX factory on a per-file basis, you can take advantage of the new `/** @jsxFrag */` pragma comment. For example, the following…

tsx

`// Note: these pragma comments need to be written`

`// with a JSDoc-style multiline syntax to take effect.`

`/** @jsx h */`

`/** @jsxFrag Fragment */`

`import { h, Fragment } from "preact";`

`export const Header = (`

  `<>`

    `<h1>Welcome</h1>`

  `</>`

`);`

[Try](https://www.typescriptlang.org/play/#code/JYWwDg9gTgLgBAJQKYEMDG8BmUIjgcilQ3wCgB6cuAWlrQFcZbqKqABAOwgFEocoAzqzgA5CDCQAuODAAWSAUjhgoKAOYgUcNLhBIOMAXA5IkAExkQ4AIyUB3KMBgSOwu09lwtAKQDKAEQg0agEYAE8AGyUQegiYYAjgEzgBMIMUAA9LGRQAayUkTEwkDAA6UgoAKkq4NgArASzPSvIqmvrGgDFVNThu9T0DOBaK0EhYOABvOFkAGj6ewfgAXzhsXDgAIhViGE2AbgqkDPH4HQ5QuAAJVDMkKDgAXjgAClI4OAAeAD53j6-ZABGb4AdSQER0ek+5CBvw+0N+AEp9kA)

…will get transformed to this output JavaScript…

tsx

`import React from 'react';`

`export const Header = (React.createElement(React.Fragment, null,`

    `React.createElement("h1", null, "Welcome")));`

[Try](https://www.typescriptlang.org/play/#code/JYWwDg9gTgLgBAJQKYEMDG8BmUIjgcilQ3wCgB6cuAWlrQFcZbqKqABAOwgFEocoAzqzhsBACwgB3biGAxhAOQgwkALjgwxSAUjhgoKAOYgUcNLhBIOMAXA5IkAEw0Q4AI12SoclR2GS5MThTACkAZQARCDRqARgATwAbXRB6RJhgROB7OAF46xQADxcNFABrXSRMTCQMADpSCgAqJpEAKwFioKbyZta2DsKAMQNDOBGjS2s4HsbQSFg4AG84MQAacdGp+ABfOGxcOAAifWIYI4BuRqRChfhzDji4AAlURyQoOABeOAAKUjgcAAPAA+AGA4FiACMIIA6khEuZLEDyNCwYCUWCAJQXIA)

We’d like to extend a big thanks to community member [Noj Vek](https://github.com/nojvek) for sending this pull request and patiently working with our team on it.

You can see that [the pull request](https://github.com/microsoft/TypeScript/pull/38720) for more details!

## [](#speed-improvements-in-build-mode-with---noemitonerror)Speed Improvements in `build` mode with `--noEmitOnError`

Previously, compiling a program after a previous compile with errors under [`incremental`](https://www.typescriptlang.org/tsconfig#incremental) would be extremely slow when using the [`noEmitOnError`](https://www.typescriptlang.org/tsconfig#noEmitOnError) flag. This is because none of the information from the last compilation would be cached in a `.tsbuildinfo` file based on the [`noEmitOnError`](https://www.typescriptlang.org/tsconfig#noEmitOnError) flag.

TypeScript 4.0 changes this which gives a great speed boost in these scenarios, and in turn improves `--build` mode scenarios (which imply both [`incremental`](https://www.typescriptlang.org/tsconfig#incremental) and [`noEmitOnError`](https://www.typescriptlang.org/tsconfig#noEmitOnError)).

For details, [read up more on the pull request](https://github.com/microsoft/TypeScript/pull/38853).

## [](#--incremental-with---noemit)`--incremental` with `--noEmit`

TypeScript 4.0 allows us to use the [`noEmit`](https://www.typescriptlang.org/tsconfig#noEmit) flag while still leveraging [`incremental`](https://www.typescriptlang.org/tsconfig#incremental) compiles. This was previously not allowed, as [`incremental`](https://www.typescriptlang.org/tsconfig#incremental) needs to emit a `.tsbuildinfo` files; however, the use-case to enable faster incremental builds is important enough to enable for all users.

For more details, you can [see the implementing pull request](https://github.com/microsoft/TypeScript/pull/39122).

## [](#editor-improvements)Editor Improvements

The TypeScript compiler doesn’t only power the editing experience for TypeScript itself in most major editors - it also powers the JavaScript experience in the Visual Studio family of editors and more. For that reason, much of our work focuses on improving editor scenarios - the place you spend most of your time as a developer.

Using new TypeScript/JavaScript functionality in your editor will differ depending on your editor, but

-   Visual Studio Code supports [selecting different versions of TypeScript](https://code.visualstudio.com/docs/typescript/typescript-compiling#_using-the-workspace-version-of-typescript). Alternatively, there’s the [JavaScript/TypeScript Nightly Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-next) to stay on the bleeding edge (which is typically very stable).
-   Visual Studio 2017/2019 have \[the SDK installers above\] and [MSBuild installs](https://www.nuget.org/packages/Microsoft.TypeScript.MSBuild).
-   Sublime Text 3 supports [selecting different versions of TypeScript](https://github.com/microsoft/TypeScript-Sublime-Plugin#note-using-different-versions-of-typescript)

You can check out a partial [list of editors that have support for TypeScript](https://github.com/Microsoft/TypeScript/wiki/TypeScript-Editor-Support) to learn more about whether your favorite editor has support to use new versions.

### [](#convert-to-optional-chaining)Convert to Optional Chaining

Optional chaining is a recent feature that’s received a lot of love. That’s why TypeScript 4.0 brings a new refactoring to convert common patterns to take advantage of [optional chaining](https://devblogs.microsoft.com/typescript/announcing-typescript-3-7/#optional-chaining) and [nullish coalescing](https://devblogs.microsoft.com/typescript/announcing-typescript-3-7/#nullish-coalescing)!

![Converting a && a.b.c && a.b.c.d.e.f() to a?.b.c?.d.e.f.()](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782978058/aha-mind/docs-crawler/www.typescriptlang.org/convertToOptionalChain-4-0_qkqkal.gif)

Keep in mind that while this refactoring doesn’t _perfectly_ capture the same behavior due to subtleties with truthiness/falsiness in JavaScript, we believe it should capture the intent for most use-cases, especially when TypeScript has more precise knowledge of your types.

For more details, [check out the pull request for this feature](https://github.com/microsoft/TypeScript/pull/39135).

### [](#-deprecated--support)`/** @deprecated */` Support

TypeScript’s editing support now recognizes when a declaration has been marked with a `/** @deprecated */` JSDoc comment. That information is surfaced in completion lists and as a suggestion diagnostic that editors can handle specially. In an editor like VS Code, deprecated values are typically displayed in a strike-though style ~like this~.

![Some examples of deprecated declarations with strikethrough text in the editor](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782978059/aha-mind/docs-crawler/www.typescriptlang.org/deprecated_4-0_tkmgje.png)

This new functionality is available thanks to [Wenlu Wang](https://github.com/Kingwl). See [the pull request](https://github.com/microsoft/TypeScript/pull/38523) for more details.

### [](#partial-semantic-mode-at-startup)Partial Semantic Mode at Startup

We’ve heard a lot from users suffering from long startup times, especially on bigger projects. The culprit is usually a process called _program construction_. This is the process of starting with an initial set of root files, parsing them, finding their dependencies, parsing those dependencies, finding those dependencies’ dependencies, and so on. The bigger your project is, the longer you’ll have to wait before you can get basic editor operations like go-to-definition or quick info.

That’s why we’ve been working on a new mode for editors to provide a _partial_ experience until the full language service experience has loaded up. The core idea is that editors can run a lightweight partial server that only looks at the current files that the editor has open.

It’s hard to say precisely what sorts of improvements you’ll see, but anecdotally, it used to take anywhere between _20 seconds to a minute_ before TypeScript would become fully responsive on the Visual Studio Code codebase. In contrast, **our new partial semantic mode seems to bring that delay down to just a few seconds**. As an example, in the following video, you can see two side-by-side editors with TypeScript 3.9 running on the left and TypeScript 4.0 running on the right.

When restarting both editors on a particularly large codebase, the one with TypeScript 3.9 can’t provide completions or quick info at all. On the other hand, the editor with TypeScript 4.0 can _immediately_ give us a rich experience in the current file we’re editing, despite loading the full project in the background.

Currently the only editor that supports this mode is [Visual Studio Code](http://code.visualstudio.com/) which has some UX improvements coming up in [Visual Studio Code Insiders](http://code.visualstudio.com/insiders). We recognize that this experience may still have room for polish in UX and functionality, and we have [a list of improvements](https://github.com/microsoft/TypeScript/issues/39035) in mind. We’re looking for more feedback on what you think might be useful.

For more information, you can [see the original proposal](https://github.com/microsoft/TypeScript/issues/37713), [the implementing pull request](https://github.com/microsoft/TypeScript/pull/38561), along with [the follow-up meta issue](https://github.com/microsoft/TypeScript/issues/39035).

### [](#smarter-auto-imports)Smarter Auto-Imports

Auto-import is a fantastic feature that makes coding a lot easier; however, every time auto-import doesn’t seem to work, it can throw users off a lot. One specific issue that we heard from users was that auto-imports didn’t work on dependencies that were written in TypeScript - that is, until they wrote at least one explicit import somewhere else in their project.

Why would auto-imports work for `@types` packages, but not for packages that ship their own types? It turns out that auto-imports only work on packages your project _already_ includes. Because TypeScript has some quirky defaults that automatically add packages in `node_modules/@types` to your project, _those_ packages would be auto-imported. On the other hand, other packages were excluded because crawling through all your `node_modules` packages can be _really_ expensive.

All of this leads to a pretty lousy getting started experience for when you’re trying to auto-import something that you’ve just installed but haven’t used yet.

TypeScript 4.0 now does a little extra work in editor scenarios to include the packages you’ve listed in your `package.json`’s `dependencies` (and `peerDependencies`) fields. The information from these packages is only used to improve auto-imports, and doesn’t change anything else like type-checking. This allows us to provide auto-imports for all of your dependencies that have types, without incurring the cost of a complete `node_modules` search.

In the rare cases when your `package.json` lists more than ten typed dependencies that haven’t been imported yet, this feature automatically disables itself to prevent slow project loading. To force the feature to work, or to disable it entirely, you should be able to configure your editor. For Visual Studio Code, this is the “Include Package JSON Auto Imports” (or `typescript.preferences.includePackageJsonAutoImports`) setting.

![Configuring 'include package JSON auto imports'](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782978060/aha-mind/docs-crawler/www.typescriptlang.org/configurePackageJsonAutoImports4-0_x8dps2.png) For more details, you can see the [proposal issue](https://github.com/microsoft/TypeScript/issues/37812) along with [the implementing pull request](https://github.com/microsoft/TypeScript/pull/38923).

## [](#our-new-website)Our New Website!

[The TypeScript website](https://www.typescriptlang.org/) has recently been rewritten from the ground up and rolled out!

![A screenshot of the new TypeScript website](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782978058/aha-mind/docs-crawler/www.typescriptlang.org/ts-web_prz8pt.png)

[We already wrote a bit about our new site](https://devblogs.microsoft.com/typescript/announcing-the-new-typescript-website/), so you can read up more there; but it’s worth mentioning that we’re still looking to hear what you think! If you have questions, comments, or suggestions, you can [file them over on the website’s issue tracker](https://github.com/microsoft/TypeScript-Website).

## [](#breaking-changes)Breaking Changes

### [](#libdts-changes)`lib.d.ts` Changes

Our `lib.d.ts` declarations have changed - most specifically, types for the DOM have changed. The most notable change may be the removal of [`document.origin`](https://developer.mozilla.org/en-US/docs/Web/API/Document/origin) which only worked in old versions of IE and Safari MDN recommends moving to [`self.origin`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/origin).

### [](#properties-overriding-accessors-and-vice-versa-is-an-error)Properties Overriding Accessors (and vice versa) is an Error

Previously, it was only an error for properties to override accessors, or accessors to override properties, when using [`useDefineForClassFields`](https://www.typescriptlang.org/tsconfig#useDefineForClassFields); however, TypeScript now always issues an error when declaring a property in a derived class that would override a getter or setter in the base class.

ts

`class Base {`

  `get foo() {`

    `return 100;`

  `}`

  `set foo(value) {`

    `// ...`

  `}`

`}`

`class Derived extends Base {`

  `foo = 10;`

`'foo' is defined as an accessor in class 'Base', but is overridden here in 'Derived' as an instance property.2610'foo' is defined as an accessor in class 'Base', but is overridden here in 'Derived' as an instance property.  }  `[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygIwAYAsBOUAmANkwCgBjAGwENFFQAhGyUAbxNFAHNIAXUAMzhwAFAEpW7DqGi8ArtAB26DBgDckgL6TEvAUOEA3KhVmRxbKaBCgAdHc0kt5arVAARGAEsDkACahIAA8eSAVfOkYdCQ5BOFAAXmV1DSA)

ts

`class Base {`

  `prop = 10;`

`}`

`class Derived extends Base {`

  `get prop() {`

`'prop' is defined as a property in class 'Base', but is overridden here in 'Derived' as an accessor.2611'prop' is defined as a property in class 'Base', but is overridden here in 'Derived' as an accessor.      return 100;    }  }  `[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwDYCMWBQBjAGwENFFQAhUyUAb11FAAd4nQBeULABgG5cAvrgIkyoACIwAlgDdIAE1CQAHgBdIAO3nkqiGvUYBzSKuasAFAEo6DRqGgmArtA1dufW0IFA)

See more details on [the implementing pull request](https://github.com/microsoft/TypeScript/pull/37894).

### [](#operands-for-delete-must-be-optional)Operands for `delete` must be optional.

When using the `delete` operator in [`strictNullChecks`](https://www.typescriptlang.org/tsconfig#strictNullChecks), the operand must now be `any`, `unknown`, `never`, or be optional (in that it contains `undefined` in the type). Otherwise, use of the `delete` operator is an error.

ts

`interface Thing {`

  `prop: string;`

`}`

`function f(x: Thing) {`

  `delete x.prop;`

`The operand of a 'delete' operator must be optional.2790The operand of a 'delete' operator must be optional.  }  `[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwHYCcAGAUAJYB2ALjAGYCGAxpKACoAWxA5qAN56igAO8PqRCWisA3HgC+ePOQCuRaiQJwiocgAoAHqiasAlBy6gAJpAA2kMqE0A6PnB7iJQA)

See more details on [the implementing pull request](https://github.com/microsoft/TypeScript/pull/37921).

### [](#usage-of-typescripts-node-factory-is-deprecated)Usage of TypeScript’s Node Factory is Deprecated

Today TypeScript provides a set of “factory” functions for producing AST Nodes; however, TypeScript 4.0 provides a new node factory API. As a result, for TypeScript 4.0 we’ve made the decision to deprecate these older functions in favor of the new ones.

For more details, [read up on the relevant pull request for this change](https://github.com/microsoft/TypeScript/pull/35282).
