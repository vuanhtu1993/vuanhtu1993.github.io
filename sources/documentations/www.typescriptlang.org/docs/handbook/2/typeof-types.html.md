---
title: "Documentation - Typeof Type Operator"
source_url: "https://www.typescriptlang.org/docs/handbook/2/typeof-types.html"
crawled_at: "2026-07-02T07:37:07.807Z"
---

## [](#the-typeof-type-operator)The `typeof` type operator

JavaScript already has a `typeof` operator you can use in an _expression_ context:

ts

`// Prints "string"`

`console.log(typeof "Hello world");`

[Try](https://www.typescriptlang.org/play/#code/PTAEAUCcEsDsBcDOoBEj41gcxQKAMYD2sihANgKYB0ZhWAFPAJ4AOFhAZqgBIVm2gA7oUhkAJigCUAbiA)

TypeScript adds a `typeof` operator you can use in a _type_ context to refer to the _type_ of a variable or property:

ts

`let s = "hello";`

`let n: typeof s;`

   `let n: string`

[Try](https://www.typescriptlang.org/play/#code/DYUwLgBAzhC8ECIAWJjAPYINwChSQDsAuCMATwAcR0AzaXAegYggD0B+IA)

This isn’t very useful for basic types, but combined with other type operators, you can use `typeof` to conveniently express many patterns. For an example, let’s start by looking at the predefined type `ReturnType<T>`. It takes a _function type_ and produces its return type:

ts

`type Predicate = (x: unknown) => boolean;`

`type K = ReturnType<Predicate>;`

    `type K = boolean`

[Try](https://www.typescriptlang.org/play/#code/C4TwDgpgBACgThAJgSwMYENjQLxQBQAeAXFAK4B2A1uQPYDu5AlFNgHxQBGNNANhOuQDcAKFCQoAaRZQAShGCk45ACrgIAHnhI0mCKxEB6A1BMA9APxA)

If we try to use `ReturnType` on a function name, we see an instructive error:

ts

`function f() {`

  `return { x: 10, y: 3 };`

`}`

`type P = ReturnType<f>;`

`'f' refers to a value, but is being used as a type here. Did you mean 'typeof f'?2749'f' refers to a value, but is being used as a type here. Did you mean 'typeof f'?`[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwHYAsBOAUAGYCuAdgMYAuAlnCaAQBQCUoA3nqKNJBUdHa1AAPVAEYADABpQAT1QBmUAF8A3HiV4KMgA6RQABVABeUACUefEgBUdkADwEAfCqA)

Remember that _values_ and _types_ aren’t the same thing. To refer to the _type_ that the _value `f`_ has, we use `typeof`:

ts

`function f() {`

  `return { x: 10, y: 3 };`

`}`

`type P = ReturnType<typeof f>;`

    `type P = {
    x: number;
    y: number;
}`

[Try](https://www.typescriptlang.org/play/#code/GYVwdgxgLglg9mABMAFASkQbwFCMQJwFMoR8lNEAPALkQEYAGAGkQE9aBmRAXwG5tu2KKwAOhRAAVEAXkQAlYqTAAVUYQA8wsXGDIAfPwD0hvIgB6AfiA)

### [](#limitations)Limitations

TypeScript intentionally limits the sorts of expressions you can use `typeof` on.

Specifically, it’s only legal to use `typeof` on identifiers (i.e. variable names) or their properties. This helps avoid the confusing trap of writing code you think is executing, but isn’t:

ts

`// Meant to use = ReturnType<typeof msgbox>`

`let shouldContinue: typeof msgbox("Are you sure you want to continue?");`

`',' expected.1005',' expected.`[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygIwAYMFYBQATSAYwBsBDaSUIuAO0QBdQBbRAcwCM4APVACgAO8ZgIapG0AJa02ASlABeAHygucEpDK0A3LhCgGATwFVWnHotBbDu-QFoHRAK4MHdvWACym2kwZxQJ0QqBVAAJUgGJ2haABVjSAAeIxM4ADMWdi5uJVwNJkQACzgnEnwAYToGaSdIVBTIdMzzbj4AIgBBSlBDEtBEaKpep1AAdy0-AJpfGsgAfjbZbSA)
