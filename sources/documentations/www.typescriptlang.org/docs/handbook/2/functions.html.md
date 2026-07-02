---
title: "Documentation - More on Functions"
source_url: "https://www.typescriptlang.org/docs/handbook/2/functions.html"
crawled_at: "2026-07-02T07:36:44.860Z"
---

Functions are the basic building block of any application, whether they’re local functions, imported from another module, or methods on a class. They’re also values, and just like other values, TypeScript has many ways to describe how functions can be called. Let’s learn about how to write types that describe functions.

## [](#function-type-expressions)Function Type Expressions

The simplest way to describe a function is with a _function type expression_. These types are syntactically similar to arrow functions:

ts

`function greeter(fn: (a: string) => void) {`

  `fn("Hello, World");`

`}`

`function printToConsole(s: string) {`

  `console.log(s);`

`}`

`greeter(printToConsole);`

[Try](https://www.typescriptlang.org/play/#code/GYVwdgxgLglg9mABAcwE4FN1XagFMMALkVwENiBnKVGMZASkQF4A+RANzhgBNGBvALAAoRIgK4ARAAl0AG1lwANIgDqcVLO4T6AbmEBfYcNCRYCRAAcaYKABU4AYQQU4s9LgqVqtBokEjECGdXdAA6BWQPXQMjITRMbDwrWjtHYLddIA)

The syntax `(a: string) => void` means “a function with one parameter, named `a`, of type `string`, that doesn’t have a return value”. Just like with function declarations, if a parameter type isn’t specified, it’s implicitly `any`.

> Note that the parameter name is **required**. The function type `(string) => void` means “a function with a parameter named `string` of type `any`“!

Of course, we can use a type alias to name a function type:

ts

`type GreetFunction = (a: string) => void;`

`function greeter(fn: GreetFunction) {`

  `// ...`

`}`

[Try](https://www.typescriptlang.org/play/#code/C4TwDgpgBA4gThCwBiBXAdgY2ASwPbpQC8UAFAIYBcUAzsHDugOYCUxAfFAG544AmAbgCwAKABmGbPkJMESCHFJj01eIhSTcBNgG9RUKAHpDUAHTnRAXyA)

## [](#call-signatures)Call Signatures

In JavaScript, functions can have properties in addition to being callable. However, the function type expression syntax doesn’t allow for declaring properties. If we want to describe something callable with properties, we can write a _call signature_ in an object type:

ts

`type DescribableFunction = {`

  `description: string;`

  `(someArg: number): boolean;`

`};`

`function doSomething(fn: DescribableFunction) {`

  `console.log(fn.description + " returned " + fn(6));`

`}`

`function myFunc(someArg: number) {`

  `return someArg > 3;`

`}`

`myFunc.description = "default description";`

`doSomething(myFunc);`

[Try](https://www.typescriptlang.org/play/#code/C4TwDgpgBAIhDOBjATgSwEYEN0BsIDEBXAO0WFQHtioBeKAbwFgAoKKAEwRVTHKoC4o8YGmIBzANws2ACngUAthACCyMYOKEF6CMgCUg9BQp5MxKcwC+FgGYkylauwoBlRRGAALVOJk3ignBIaFi4BPZ8xHoM0lCIVPJ4AHQ4FGJ+xEmcwTyRUADUUABEUMgehMjEEOzFBVD+MgBsenoWliwsdqR5CiBEpHLuqupQmtq60UyspeWVQkNqUAB8UADMbSy9-YhZXGi8jrTFnDaYhDjAHHu5jkUWLM5uSl4+6Vv2rUA)

Note that the syntax is slightly different compared to a function type expression - use `:` between the parameter list and the return type rather than `=>`.

## [](#construct-signatures)Construct Signatures

JavaScript functions can also be invoked with the `new` operator. TypeScript refers to these as _constructors_ because they usually create a new object. You can write a _construct signature_ by adding the `new` keyword in front of a call signature:

ts

`type SomeConstructor = {`

  `new (s: string): SomeObject;`

`};`

`function fn(ctor: SomeConstructor) {`

  `return new ctor("hello");`

`}`

[Try](https://www.typescriptlang.org/play/#code/C4TwDgpgBAyg9gWwgeQEYCsIGNhQLxQCGAdiANwCwAUAPQ1QC0TWArsEw9aJLIhAMJxiAZ2AAnFjjhj8UAN7UoUYhADuUABTCAXFFFiAlsQDmASl3wkaTDkpUAvnYBmLYjgNCoT4hqliLfIIi4pLA0qbyilBiEMAsYsTKalB+GgBEABYQADbZcGmmdvZAA)

Some objects, like JavaScript’s `Date` object, can be called with or without `new`. You can combine call and construct signatures in the same type arbitrarily:

ts

`interface CallOrConstruct {`

  `(n?: number): string;`

  `new (s: string): Date;`

`}`

`function fn(ctor: CallOrConstruct) {`

  `// Passing an argument of type `number` to `ctor` matches it against`

  `// the first definition in the `CallOrConstruct` interface.`

  `console.log(ctor(10));`

               `(parameter) ctor: CallOrConstruct
(n?: number) => string`

  `// Similarly, passing an argument of type `string` to `ctor` matches it`

  `// against the second definition in the `CallOrConstruct` interface.`

  `console.log(new ctor("10"));`

                   `(parameter) ctor: CallOrConstruct
new (s: string) => Date`

`}`

`fn(Date);`

[Try](https://www.typescriptlang.org/play/#code/JYOwLgpgTgZghgYwgAgMJwDYYPJVQexAGcwoBXBMZAbwFgAoZZAChAH4AuZEMgWwCNoASi4kooAOYBuBkxAQA7iyKjSkkcgAicSDPoBfBgxhkQlYIWQwQzSvihd0WXAWKkKYITVnIA9L+QABTgiIklkOBAIqAk+CHBkfBhkMABPAAcUAAMeAWgslPxkLLsoAt4dBAALCCJkYCo4CThQEh9-FJqrYCgSZAATCBhQBoso0E7spxw8QjEPAtBIWEQIADofBDn8DHWMfAlbMHtmAEYABiEhPSZbu-uOgD02I0Y-AIBlYF5gDDgoDCpAA0yHSITCIAkESi-1ivHiVCSKQy2TEkgKx2KpXKlRqdQa7QCTRabkmyCIEC2IH6AyGIzAY3qUTAXSy0xcc3clEW4Gg8CQGzeVKIOz2B1YimQpWYACILjKrjd7srlU8XgZXtZmNpINcgA)

## [](#generic-functions)Generic Functions

It’s common to write a function where the types of the input relate to the type of the output, or where the types of two inputs are related in some way. Let’s consider for a moment a function that returns the first element of an array:

ts

`function firstElement(arr: any[]) {`

  `return arr[0];`

`}`

[Try](https://www.typescriptlang.org/play/#code/GYVwdgxgLglg9mABMGAnAzlAogGwKYC2eYUAFAIaqoBci5YAngNoC6AlIgN4CwAUIolR4oIVEkqomABhYBuPgF8gA)

This function does its job, but unfortunately has the return type `any`. It’d be better if the function returned the type of the array element.

In TypeScript, _generics_ are used when we want to describe a correspondence between two values. We do this by declaring a _type parameter_ in the function signature:

ts

`function firstElement<Type>(arr: Type[]): Type | undefined {`

  `return arr[0];`

`}`

[Try](https://www.typescriptlang.org/play/#code/GYVwdgxgLglg9mABMGAnAzlAogGwKYC2eYUAPACoCeADngHwAUAhqqgFyJW0DaAugJQcueRAB9E4ACZ4UYPJMQBvALAAoRIlR4oIVEhapuABl4BuNQF8gA)

By adding a type parameter `Type` to this function and using it in two places, we’ve created a link between the input of the function (the array) and the output (the return value). Now when we call it, a more specific type comes out:

ts

`// s is of type 'string'`

`const s = firstElement(["a", "b", "c"]);`

`// n is of type 'number'`

`const n = firstElement([1, 2, 3]);`

`// u is of type undefined`

`const u = firstElement([]);`

[Try](https://www.typescriptlang.org/play/#code/CYUwxgNghgTiAEAzArgOzAFwJYHtVKxgGcMBRCEAWxFQwB4AVATwAcQA+AClhgC55mbANoBdAJT9BCAD7w0oRFlQhgAbgCwAKAD02+AFpDYZBkP6tu+EXhZrORPAysEAchIwlAcxdaweElbwALwExGQU1LScQgBEUDEANPAxAEaJyWAx4ho6evi28PaOzvAuqMiUKSAwPpp+qAH4IYph5FQ0GNEAjEkATEkAzNkWesg2dg5ObHKoCkoqvv4YcsGhJG2RnaJiqkA)

### [](#inference)Inference

Note that we didn’t have to specify `Type` in this sample. The type was _inferred_ - chosen automatically - by TypeScript.

We can use multiple type parameters as well. For example, a standalone version of `map` would look like this:

ts

`function map<Input, Output>(arr: Input[], func: (arg: Input) => Output): Output[] {`

  `return arr.map(func);`

`}`

`// Parameter 'n' is of type 'string'`

`// 'parsed' is of type 'number[]'`

`const parsed = map(["1", "2", "3"], (n) => parseInt(n));`

[Try](https://www.typescriptlang.org/play/#code/PTAEAcCcFMBdYJbUgWgQcwHYHsYFgAoAMwFdMBjRbTUAWwENwAeASU3BNgBpQB5TjrAB8ACnqRIALlBtBAbQC6PUhWljI6abM4BKUAF4hfAbun9Y8haADehUKBiwSkGuMgA6BuBEryOgNyEAL6EhCCgAAri9LRwyKAA5JgJoAgAzqDYRKCwAJ7g0IlpsJAImOgJYWAJ4OJp0AAmKemZ2XkFiZgktABGyIqVBOTUxRB1jQZ0jCJyAEQAjLM8swBMS6CzAMyzSqAimHqGY5D1bLD7OgFAA)

Note that in this example, TypeScript could infer both the type of the `Input` type parameter (from the given `string` array), as well as the `Output` type parameter based on the return value of the function expression (`number`).

### [](#constraints)Constraints

We’ve written some generic functions that can work on _any_ kind of value. Sometimes we want to relate two values, but can only operate on a certain subset of values. In this case, we can use a _constraint_ to limit the kinds of types that a type parameter can accept.

Let’s write a function that returns the longer of two values. To do this, we need a `length` property that’s a number. We _constrain_ the type parameter to that type by writing an `extends` clause:

ts

`function longest<Type extends { length: number }>(a: Type, b: Type) {`

  `if (a.length >= b.length) {`

    `return a;`

  `} else {`

    `return b;`

  `}`

`}`

`// longerArray is of type 'number[]'`

`const longerArray = longest([1, 2], [1, 2, 3]);`

`// longerString is of type 'alice' | 'bob'`

`const longerString = longest("alice", "bob");`

`// Error! Numbers don't have a 'length' property`

`const notOK = longest(10, 100);`

`Argument of type 'number' is not assignable to parameter of type '{ length: number; }'.2345Argument of type 'number' is not assignable to parameter of type '{ length: number; }'.`[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwGYAsBWdG00BYAKADMBXAOwGMAXASzitABtmBzSROgHgBUAngAdIoSAA86kKgBNEoAN5sZHOgAtUVCgFsARjFABfAHwAKAIaohogDSg91kZACUS0qFAMyoSwDpWVQ1QEwBeBwCg9TdFD09QaEg6CmgWCwBuOKNxVkQxWJJ4hKSUlj1MwuNSI1JSEDZOGABBWAtBLwU4HzpnUABybX0YAG0AXT7SGmYeBqouaBboNtBw9jnuOjNhgEZ7NFH7Hb37DFGXCvq1+YBlOmgGOY7QLtAe0X6LVgYaSD7QAB9+no4HoJiQplQZlcYLd7o9Vo0eGYAESfb6QZH2ZHAvTI851MAAUVgCAAhKAAHK6AxIUCyZh9OigdQWABuYgs-UCcw0f2E8FE0B6k2mTKocDoAHkANIrWZcJHbAAM9mVSvOQA)

There are a few interesting things to note in this example. We allowed TypeScript to _infer_ the return type of `longest`. Return type inference also works on generic functions.

Because we constrained `Type` to `{ length: number }`, we were allowed to access the `.length` property of the `a` and `b` parameters. Without the type constraint, we wouldn’t be able to access those properties because the values might have been some other type without a length property.

The types of `longerArray` and `longerString` were inferred based on the arguments. Remember, generics are all about relating two or more values with the same type!

Finally, just as we’d like, the call to `longest(10, 100)` is rejected because the `number` type doesn’t have a `.length` property.

### [](#working-with-constrained-values)Working with Constrained Values

Here’s a common error when working with generic constraints:

ts

`function minimumLength<Type extends { length: number }>(`

  `obj: Type,`

  `minimum: number`

`): Type {`

  `if (obj.length >= minimum) {`

    `return obj;`

  `} else {`

    `return { length: minimum };`

`Type '{ length: number; }' is not assignable to type 'Type'.   '{ length: number; }' is assignable to the constraint of type 'Type', but 'Type' could be instantiated with a different subtype of constraint '{ length: number; }'.2322Type '{ length: number; }' is not assignable to type 'Type'.   '{ length: number; }' is assignable to the constraint of type 'Type', but 'Type' could be instantiated with a different subtype of constraint '{ length: number; }'.    }  }  `[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwGY1oLACgAzAVwDsBjAFwEs4TQBbKkq+o+gGUhIHMKALADwAVAJ4AHSKEgAPClwAmiUAG9QAGy68+qEmwBGMUAF8AfAAp8oUHD0ArVKIkAaSwyYs2O-THwBKB+KSyq5UBKBmNrYAdBo8-KAmALxuzKz0viquVtCQFETQdJEA3K5GUmqIQVmgOXkFKuqa-KiMqWzGJXhWRvhGQA)

It might look like this function is OK - `Type` is constrained to `{ length: number }`, and the function either returns `Type` or a value matching that constraint. The problem is that the function promises to return the _same_ kind of object as was passed in, not just _some_ object matching the constraint. If this code were legal, you could write code that definitely wouldn’t work:

ts

`// 'arr' gets value { length: 6 }`

`const arr = minimumLength([1, 2, 3], 6);`

`// and crashes here because arrays have`

`// a 'slice' method, but not the returned object!`

`console.log(arr.slice(0));`

[Try](https://www.typescriptlang.org/play/#code/CYUwxgNghgTiAEAzArgOzAFwJYHtXwFstUsDkCAZEVAcwwAsAeAFQE8AHBEADw2uADO8AN7wI1OvQBc8VOQBGIGPAC+APgAUAWABQ8eDnkArGW04AaXfqIkyBGXIKKYugJSmOIANy6A9L-gAWmCwZAxgwL8AgHJYGGj4GhAMIQA3KAhkBFFxWgYZADZVXTA8AQx4OPgAXkJiUnIqPPoNAG0ARnN4ACYugGYAXS6C1x8df0rUYHgwGCgBehAhRbh4RTAoZAEEOKhWZahUkCjK+GiBCCwwEASCZPocYC75MNkcCoYEOAxkGFQQaaGIzgDAAQhKZRw4gAdBAcDQNHFoRcriANAAGVyjIA)

### [](#specifying-type-arguments)Specifying Type Arguments

TypeScript can usually infer the intended type arguments in a generic call, but not always. For example, let’s say you wrote a function to combine two arrays:

ts

`function combine<Type>(arr1: Type[], arr2: Type[]): Type[] {`

  `return arr1.concat(arr2);`

`}`

[Try](https://www.typescriptlang.org/play/#code/GYVwdgxgLglg9mABBOBbARjMBTAPAFQE8AHbAPgAoBDAJxoEYAuRI0gbQF0AaRWmgJmatsnAJRCSIjogDeAWABQiRDWxQQNJH3oA6FJCpRqdfqIDcigL5A)

Normally it would be an error to call this function with mismatched arrays:

ts

`const arr = combine([1, 2, 3], ["hello"]);`

`Type 'string' is not assignable to type 'number'.2322Type 'string' is not assignable to type 'number'.`[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwGY1oLACgATSAYwBsBDaSUAMwFcA7YgFwEs4HRi4BbAI1YNIAHgAqATwAOkAHwAKStACMqCdIDaAXQA0oRWlVTIWgJSGNmgNz4QoALQPidZg7v5uDRMz2xQAXi5eASE5dSVdNF0MHVB1ACIAC0hSUjg4zRNLIA)

If you intended to do this, however, you could manually specify `Type`:

ts

`const arr = combine<string | number>([1, 2, 3], ["hello"]);`

[Try](https://www.typescriptlang.org/play/#code/CYUwxgNghgTiAEAzArgOzAFwJYHtXzBwFsAjLVEAHgBUBPABxAD4AKWGARgC547GBtALoAaeOwBMPPiCEBKKQxmCA3AFgAUAHpN8ALT6wyDPt0bCqAM4YxMGPAC8BYmQqUrMcgHN4AH3ipkUhAYVn4OUXFRAGYReH4AIgALEAgIHHjBWWUgA)

### [](#guidelines-for-writing-good-generic-functions)Guidelines for Writing Good Generic Functions

Writing generic functions is fun, and it can be easy to get carried away with type parameters. Having too many type parameters or using constraints where they aren’t needed can make inference less successful, frustrating callers of your function.

#### [](#push-type-parameters-down)Push Type Parameters Down

Here are two ways of writing a function that appear similar:

ts

`function firstElement1<Type>(arr: Type[]) {`

  `return arr[0];`

`}`

`function firstElement2<Type extends any[]>(arr: Type) {`

  `return arr[0];`

`}`

`// a: number (good)`

`const a = firstElement1([1, 2, 3]);`

`// b: any (bad)`

`const b = firstElement2([1, 2, 3]);`

[Try](https://www.typescriptlang.org/play/#code/GYVwdgxgLglg9mABMGAnAzlAogGwKYC2eYUAjADwAqAngA54B8AFAIaqoBciN9A2gLoBKRAG8AsAChEiVHighUSNql4AGfgG5JAX0mTQkWAmRpMuQsSgAmKnTyI8ADyjEAJukQsw1Ac2VcePGFxKRk5BSV2NU0dPQkAenjPLjAQAgAjPFREJgBzODhXQUkIBExPRABeEwxsfCISUiZeUgAaRCt2gGYhLQSk9K4vahz0liKSsqhEdKqas3rLK2a2ju7eoA)

These might seem identical at first glance, but `firstElement1` is a much better way to write this function. Its inferred return type is `Type`, but `firstElement2`’s inferred return type is `any` because TypeScript has to resolve the `arr[0]` expression using the constraint type, rather than “waiting” to resolve the element during a call.

> **Rule**: When possible, use the type parameter itself rather than constraining it

#### [](#use-fewer-type-parameters)Use Fewer Type Parameters

Here’s another pair of similar functions:

ts

`function filter1<Type>(arr: Type[], func: (arg: Type) => boolean): Type[] {`

  `return arr.filter(func);`

`}`

`function filter2<Type, Func extends (arg: Type) => boolean>(`

  `arr: Type[],`

  `func: Func`

`): Type[] {`

  `return arr.filter(func);`

`}`

[Try](https://www.typescriptlang.org/play/#code/GYVwdgxgLglg9mABMGAbKBTATgRgDwAqAngA4YB8AFAIZZYBcixZA2gLoA0y4EjNWAc0bMMASkQBecogBGcOKgzUwo4aQztEAbwCwAKESIsGKCCxJaWAHQp02SqEiiA3PoC++-Y+jwktzFgATITqXABiPIgYAB6YYAAmAM6I-EJM6uJSsvKKylT6hpZqrJwF3JCMEZD6qukl2mXGpuaIljZoAQ48Lu5AA)

We’ve created a type parameter `Func` that _doesn’t relate two values_. That’s always a red flag, because it means callers wanting to specify type arguments have to manually specify an extra type argument for no reason. `Func` doesn’t do anything but make the function harder to read and reason about!

> **Rule**: Always use as few type parameters as possible

#### [](#type-parameters-should-appear-twice)Type Parameters Should Appear Twice

Sometimes we forget that a function might not need to be generic:

ts

`function greet<Str extends string>(s: Str) {`

  `console.log("Hello, " + s);`

`}`

`greet("world");`

[Try](https://www.typescriptlang.org/play/#code/GYVwdgxgLglg9mABAcwE4FN1QDwGUqqLoAeU6YAJgM6JUExjIB8AFFQFyL6oCUiA3gFgAUIkQQEVOABt0AOmlxkLAEQAJdNMUAaRCsQBqWjwDcIgL4iRaTFFUB3OKmkUVpoA)

We could just as easily have written a simpler version:

ts

`function greet(s: string) {`

  `console.log("Hello, " + s);`

`}`

[Try](https://www.typescriptlang.org/play/#code/GYVwdgxgLglg9mABAcwE4FN1QBQGcBciuUqMYyAlIgN4CwAUIohArnADboB07cy2AIgAS6drwA0iAYgDURCgG4GAXyA)

Remember, type parameters are for _relating the types of multiple values_. If a type parameter is only used once in the function signature, it’s not relating anything. This includes the inferred return type; for example, if `Str` was part of the inferred return type of `greet`, it would be relating the argument and return types, so would be used _twice_ despite appearing only once in the written code.

> **Rule**: If a type parameter only appears in one location, strongly reconsider if you actually need it

## [](#optional-parameters)Optional Parameters

Functions in JavaScript often take a variable number of arguments. For example, the `toFixed` method of `number` takes an optional digit count:

ts

`function f(n: number) {`

  `console.log(n.toFixed()); // 0 arguments`

  `console.log(n.toFixed(3)); // 1 argument`

`}`

[Try](https://www.typescriptlang.org/play/#code/GYVwdgxgLglg9mABMAFGAXIsIC2AjAUwCcBKRAbwFgAoRRCBAZzgBsCA6FuAczXajgAxGAA8CAExQkSAbkQB6eYgAMiAIZFuuAmCiMadBmGZtOPPgOFjJAZmlzFiAIzrN23TQC+QA)

We can model this in TypeScript by marking the parameter as _optional_ with `?`:

ts

`function f(x?: number) {`

  `// ...`

`}`

`f(); // OK`

`f(10); // OK`

[Try](https://www.typescriptlang.org/play/#code/GYVwdgxgLglg9mABMAFADwPwC5FhAWwCMBTAJwEpEBvAWAChFEB6JxAOg-oF97VyBuZqwDyAaV4oAjAAYBQxGKA)

Although the parameter is specified as type `number`, the `x` parameter will actually have the type `number | undefined` because unspecified parameters in JavaScript get the value `undefined`.

You can also provide a parameter _default_:

ts

`function f(x = 10) {`

  `// ...`

`}`

[Try](https://www.typescriptlang.org/play/#code/GYVwdgxgLglg9mABMAFAD0QXkQRgAwCUiA3gLABQiiA9NYgHSMUC+QA)

Now in the body of `f`, `x` will have type `number` because any `undefined` argument will be replaced with `10`. Note that when a parameter is optional, callers can always pass `undefined`, as this simply simulates a “missing” argument:

ts

`// All OK`

`f();`

`f(10);`

`f(undefined);`

[Try](https://www.typescriptlang.org/play/#code/CYUwxgNghgTiAEAzArgOzAFwJYHtVIAoAPAfgC55VkBbAIxBgEoKA3HLYAbgFgAoAen7wAtKLDIMo4X0HwAghAjwA8gGk+iAox69NARgAM2jQTShEWVCGDagA)

### [](#optional-parameters-in-callbacks)Optional Parameters in Callbacks

Once you’ve learned about optional parameters and function type expressions, it’s very easy to make the following mistakes when writing functions that invoke callbacks:

ts

`function myForEach(arr: any[], callback: (arg: any, index?: number) => void) {`

  `for (let i = 0; i < arr.length; i++) {`

    `callback(arr[i], i);`

  `}`

`}`

[Try](https://www.typescriptlang.org/play/#code/GYVwdgxgLglg9mABAWwJ4DE4CcCiBDCACwAo8ssAuRPMVAbQF0AaRCPAG3YCMCBrK0lgDmVGqhYwwAEwCmADwD8VMCGRcZWAJSIAvAD5EANzgwp2gN4BYAFCJEwbImLsZURDF2IADAG53iAB5qcgA6FzAhKEI-GABqWIsbOzs2Th4IXkEsOhhmd00fJMQAXxtioA)

What people usually intend when writing `index?` as an optional parameter is that they want both of these calls to be legal:

ts

`myForEach([1, 2, 3], (a) => console.log(a));`

`myForEach([1, 2, 3], (a, i) => console.log(a, i));`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwFYDMbQEYAOABgBYCBYAKABNIBjAGwENpJQAzAVwDs6AXAJZxuoALYBPAGIIAokzoALABRVQoFtFRNu4gNoBdADSrQdJgwYAjeQGtUSlgHMtOw6AHdaADwD8qbpyiljAAlKAAvAB8oABucALUVCGocQkA3FQgoAC0uXScfLnZVBLS0HKKSrp4bmhuWEagDmFRpsKIcAyQAHQMcI7NIRmUpbLyytW19Y0ObgIt0XTtnT19A0xzIUNAA)

What this _actually_ means is that _`callback` might get invoked with one argument_. In other words, the function definition says that the implementation might look like this:

ts

`function myForEach(arr: any[], callback: (arg: any, index?: number) => void) {`

  `for (let i = 0; i < arr.length; i++) {`

    `// I don't feel like providing the index today`

    `callback(arr[i]);`

  `}`

`}`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwFYDMbQEYAOABgBYCBYAKADMBXAOwGMAXASzntAFsBPAMQQBRAIaMAFgAphsVMPo8A2gF0ANKEbCANpoBGogNaop0AOaz5a1vQAmkAB4B+VPVpcdMAJSgAvAD5QAG5wrNZeAN5UoKDUCKASmpDMoKw+oEQA3MmgADyg0tAAdAn0JsximawA1JXhkVGgIKAAkqDWHADkSdSQkJqgmqz6kKAADvABIVYmoGXDVrZ2M3DWwjx1URraeoz6xtAKrEoe6XUAvlSnQA)

In turn, TypeScript will enforce this meaning and issue errors that aren’t really possible:

ts

`myForEach([1, 2, 3], (a, i) => {`

  `console.log(i.toFixed());`

`'i' is possibly 'undefined'.18048'i' is possibly 'undefined'.  });  `[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwFYDMbQEYAOABgBYCBYAKABNIBjAGwENpJQAzAVwDs6AXAJZxuoALYBPAGIIAokzoALABRVQoFtFRNu4gNoBdADSrQdJgwYAjeQGtUSlgHMtOw6AHdaADwD8qbpyiljAAlKAAvAB8oABucALUVCGocQkA3FQgoAC0uXScfLnZVBLS0HKKSrp4bmhuWEagDm4CYVGgAN4mdMKIcAyQAHQMcI5KAoN8cJICXpDUSiEhGZQAvstAA)

In JavaScript, if you call a function with more arguments than there are parameters, the extra arguments are simply ignored. TypeScript behaves the same way. Functions with fewer parameters (of the same types) can always take the place of functions with more parameters.

> **Rule**: When writing a function type for a callback, _never_ write an optional parameter unless you intend to _call_ the function without passing that argument

## [](#function-overloads)Function Overloads

Some JavaScript functions can be called in a variety of argument counts and types. For example, you might write a function to produce a `Date` that takes either a timestamp (one argument) or a month/day/year specification (three arguments).

In TypeScript, we can specify a function that can be called in different ways by writing _overload signatures_. To do this, write some number of function signatures (usually two or more), followed by the body of the function:

ts

`function makeDate(timestamp: number): Date;`

`function makeDate(m: number, d: number, y: number): Date;`

`function makeDate(mOrTimestamp: number, d?: number, y?: number): Date {`

  `if (d !== undefined && y !== undefined) {`

    `return new Date(y, mOrTimestamp, d);`

  `} else {`

    `return new Date(mOrTimestamp);`

  `}`

`}`

`const d1 = makeDate(12345678);`

`const d2 = makeDate(5, 5, 5);`

`const d3 = makeDate(1, 3);`

`No overload expects 2 arguments, but overloads do exist that expect either 1 or 3 arguments.2575No overload expects 2 arguments, but overloads do exist that expect either 1 or 3 arguments.`[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwFYDsGCwAoAMwFcA7AYwBcBLOU0AWwEMBrSAEScsgAoaHIiSkwYAHVKWIMARjACUqTtwDcBEhRp1GrDl14MJU2dAA0oACaGZMMwE8rxhaCWRVRMlVr1mbFzwYA8tAAKtQCQiLioJLWphYA-A42oLaJ0UbyinqgAN4EoKDUhKA85qAAhAC8laBk5pCE1KSQZQBkrSkV1bWk9Y3N5nK5+QWg0JCUxND0zQDuzno8tmaBIWGCwmJmg24FAL6gkAA2iJDD+KNjE1MzkPN+q6Hhm6Jyu6B7BJ-45HRCFgBGUA1Hy6bg8AFoADMABYMAA2LAADjeBF+pH+5jQwO0vkWGDMBNAGFRPz+lAsUJxoL8ALMULeQA)

In this example, we wrote two overloads: one accepting one argument, and another accepting three arguments. These first two signatures are called the _overload signatures_.

Then, we wrote a function implementation with a compatible signature. Functions have an _implementation_ signature, but this signature can’t be called directly. Even though we wrote a function with two optional parameters after the required one, it can’t be called with two parameters!

### [](#overload-signatures-and-the-implementation-signature)Overload Signatures and the Implementation Signature

This is a common source of confusion. Often people will write code like this and not understand why there is an error:

ts

`function fn(x: string): void;`

`function fn() {`

  `// ...`

`}`

`// Expected to be able to call with zero arguments`

`fn();`

`Expected 1 arguments, but got 0.2554Expected 1 arguments, but got 0.`[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwFYMBYCwAoAMwFcA7AYwBcBLOU0Q0gCgA9VFLprSBzASlQA3ONQAmAbgIkKNOg2Z9QAbwKhQIUADptBAL4ENAURYAHSFUijQlOKABGkUAEM7AG0c3Q5J69egA7tSUABagAF4wtk7QPMQAtpCklIhSCuJAA)

Again, the signature used to write the function body can’t be “seen” from the outside.

> The signature of the _implementation_ is not visible from the outside. When writing an overloaded function, you should always have _two_ or more signatures above the implementation of the function.

The implementation signature must also be _compatible_ with the overload signatures. For example, these functions have errors because the implementation signature doesn’t match the overloads in a correct way:

ts

`function fn(x: boolean): void;`

`// Argument type isn't right`

`function fn(x: string): void;`

`This overload signature is not compatible with its implementation signature.2394This overload signature is not compatible with its implementation signature.  function fn(x: boolean) {}  `[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwGYCcAWAsAFABmArgHYDGALgJZxmhFkAUAHqgEZxwA2kAhmQCUqAG5waAEwDchEKACC0AOYkAtpDJVQVAJ4AHSKBqIyAcm3QaygBZVCpSrXqMW7UIipWyykaHFSssTk1HQMTGyc3HyCQqAA3gC+QA)

ts

`function fn(x: string): string;`

`// Return type isn't right`

`function fn(x: number): boolean;`

`This overload signature is not compatible with its implementation signature.2394This overload signature is not compatible with its implementation signature.  function fn(x: string | number) {    return "oops";  }  `[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwGYCcAWAsAFABmArgHYDGALgJZxmhFkAUAHqoldDWQOYCUHLj14BuQiFAAlSFRLQGVAJ4AHSKBqIyAciqhuvABZVCpSrXqMW7UGRIBbAEYxBoR3DgAbSAEMy44nJqOgYmNiFuPlAAH1sHZ2h+UABvQlB9WXkGACIPFURsgIBfIA)

### [](#writing-good-overloads)Writing Good Overloads

Like generics, there are a few guidelines you should follow when using function overloads. Following these principles will make your function easier to call, easier to understand, and easier to implement.

Let’s consider a function that returns the length of a string or an array:

ts

`function len(s: string): number;`

`function len(arr: any[]): number;`

`function len(x: any) {`

  `return x.length;`

`}`

[Try](https://www.typescriptlang.org/play/#code/GYVwdgxgLglg9mABAGwKZgBQGcBcitQBOMYA5gJR5ggC2ARqoQNwCwAUKJLAiuhgIaFCefmACeAbQC6lRNXqNWHcNHhI0mAB4jx5RAG92iRIVRQQhJJoB0G0lAAWSgL5A)

This function is fine; we can invoke it with strings or arrays. However, we can’t invoke it with a value that might be a string _or_ an array, because TypeScript can only resolve a function call to a single overload:

ts

`len(""); // OK`

`len([0]); // OK`

`len(Math.random() > 0.5 ? "hello" : [0]);`

`No overload matches this call.   Overload 1 of 2, '(s: string): number', gave the following error.     Argument of type 'number[] | "hello"' is not assignable to parameter of type 'string'.       Type 'number[]' is not assignable to type 'string'.   Overload 2 of 2, '(arr: any[]): number', gave the following error.     Argument of type 'number[] | "hello"' is not assignable to parameter of type 'any[]'.       Type 'string' is not assignable to type 'any[]'.2769No overload matches this call.   Overload 1 of 2, '(s: string): number', gave the following error.     Argument of type 'number[] | "hello"' is not assignable to parameter of type 'string'.       Type 'number[]' is not assignable to type 'string'.   Overload 2 of 2, '(arr: any[]): number', gave the following error.     Argument of type 'number[] | "hello"' is not assignable to parameter of type 'any[]'.       Type 'string' is not assignable to type 'any[]'.`[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwHYBsBOAsAFAAmkAxgDYCG0koAZgK4B2pALgJZxOjmRMAUKUIlbR2TAOYBKVEwYBbAEYwA3IRIVqtRiw5cefftWipKTAJ4BtALozQcpasIhQAWnekGrd68K8BAEQBUiqgLgDyANJ+hpYADLahEdEE-vwAspSsABYAdNBmRHDy-FKgAHygcbkArKAA-KAB2ZDk5HABoKjxiUA)

Because both overloads have the same argument count and same return type, we can instead write a non-overloaded version of the function:

ts

`function len(x: any[] | string) {`

  `return x.length;`

`}`

[Try](https://www.typescriptlang.org/play/#code/GYVwdgxgLglg9mABAGwKZgBQA8BciCGYAngNoC6iAPogM5QBOMYA5gJSIDeAsAFCKL1UUEPSRYAdGhZQAFgG5eAXyA)

This is much better! Callers can invoke this with either sort of value, and as an added bonus, we don’t have to figure out a correct implementation signature.

> Always prefer parameters with union types instead of overloads when possible

## [](#declaring-this-in-a-function)Declaring `this` in a Function

TypeScript will infer what the `this` should be in a function via code flow analysis, for example in the following:

ts

`const user = {`

  `id: 123,`

  `admin: false,`

  `becomeAdmin: function () {`

    `this.admin = true;`

  `},`

`};`

[Try](https://www.typescriptlang.org/play/#code/MYewdgzgLgBArhApgJxgXhgbwLACgYwCWAJgFwwCMATAMwA0eeBAhsQLaFjkBmzANkgb4YAI0Sg2iAILtOPOGGBRC4GAAoAlFiYEYUABaEIAOlYcw6PcjiIA3DoC+Qh7aA)

TypeScript understands that the function `user.becomeAdmin` has a corresponding `this` which is the outer object `user`. `this`, _heh_, can be enough for a lot of cases, but there are a lot of cases where you need more control over what object `this` represents. The JavaScript specification states that you cannot have a parameter called `this`, and so TypeScript uses that syntax space to let you declare the type for `this` in the function body.

ts

`interface DB {`

  `filterUsers(filter: (this: User) => boolean): User[];`

`}`

`const db = getDB();`

`const admins = db.filterUsers(function (this: User) {`

  `return this.admin;`

`});`

[Try](https://www.typescriptlang.org/play/#code/JYOwLgpgTgZghgYwgAgKoGdrIN4FgBQyywAJgFzIgCuAtgEbQDcBRcJNoFdA9twDYQ4IZvgC+BEhAR84UFAm4h0YZAHMIYACIAhCgAoAlMgC8APmQ6RAeivIAtA4RUwDuwVCRYiFDpwtkMMB8nhjQ6HqBwdD6YAAWwOgUoVBGZsg8-IIgBkmYUADaALoi4vgECkoqJHQmaho6hiIVyshsHEq11QB0kSF54TBUIAhgwIrIenEJudBGeITIcmBUUCDIU+hdbaAlBoxAA)

This pattern is common with callback-style APIs, where another object typically controls when your function is called. Note that you need to use `function` and not arrow functions to get this behavior:

ts

`interface DB {`

  `filterUsers(filter: (this: User) => boolean): User[];`

`}`

`const db = getDB();`

`const admins = db.filterUsers(() => this.admin);`

`The containing arrow function captures the global value of 'this'. Element implicitly has an 'any' type because type 'typeof globalThis' has no index signature.7041 7017The containing arrow function captures the global value of 'this'. Element implicitly has an 'any' type because type 'typeof globalThis' has no index signature.`[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygOwAYAsBGdGc0BYAKAEsA7AFxgDMBDAY0lAFVEZQBvU0UMgCaoKAVwC2AIxgBuXqHoCxlVBLhwANpHoVZJAL6kBkRuvrQWjOBURVQAc0hUAIgCFUACgCUoALwA+UFddEFAAWnDGESpw0NJKGmgGZkCXbjlaMnUE9hhEdwysmA8qAAsyFDYOaG9-UFUNLQpPVBzoAG0AXV0DElJLa1sBCV97R1cvXX6beUVKRBGhgDoC7Kq8r18A0vLFhSUm6SA)

## [](#other-types-to-know-about)Other Types to Know About

There are some additional types you’ll want to recognize that appear often when working with function types. Like all types, you can use them everywhere, but these are especially relevant in the context of functions.

### [](#void)`void`

`void` represents the return value of functions which don’t return a value. It’s the inferred type any time a function doesn’t have any `return` statements, or doesn’t return any explicit value from those return statements:

ts

`// The inferred return type is void`

`function noop() {`

  `return;`

`}`

[Try](https://www.typescriptlang.org/play/#code/PTAEBUAsFNQSwHYDNoCdXQCagwFwK6oKi4CeADrHAM6gBuA9nJgLABQS+CAxrnA8QQMG5ABQBKUAG92oHNAJEA3OwC+QA)

In JavaScript, a function that doesn’t return any value will implicitly return the value `undefined`. However, `void` and `undefined` are not the same thing in TypeScript. There are further details at the end of this chapter.

> `void` is not the same as `undefined`.

### [](#object)`object`

The special type `object` refers to any value that isn’t a primitive (`string`, `number`, `bigint`, `boolean`, `symbol`, `null`, or `undefined`). This is different from the _empty object type_ `{ }`, and also different from the global type `Object`. It’s very likely you will never use `Object`.

> `object` is not `Object`. **Always** use `object`!

Note that in JavaScript, function values are objects: They have properties, have `Object.prototype` in their prototype chain, are `instanceof Object`, you can call `Object.keys` on them, and so on. For this reason, function types are considered to be `object`s in TypeScript.

### [](#unknown)`unknown`

The `unknown` type represents _any_ value. This is similar to the `any` type, but is safer because it’s not legal to do anything with an `unknown` value:

ts

`function f1(a: any) {`

  `a.b(); // OK`

`}`

`function f2(a: unknown) {`

  `a.b();`

`'a' is of type 'unknown'.18046'a' is of type 'unknown'.  }  `[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwFYDsBGUOAOABgBYA2AWACgAzAVwDsBjAFwEs4HQacAKAQ1T8GATwCUoAN7VQofgDoARrzEBuUCFAB5ANLUAvtXrN2nbmgGpGAawZwA7gwnSqshcrUGgA)

This is useful when describing function types because you can describe functions that accept any value without having `any` values in your function body.

Conversely, you can describe a function that returns a value of unknown type:

ts

`function safeParse(s: string): unknown {`

  `return JSON.parse(s);`

`}`

`// Need to be careful with 'obj'!`

`const obj = safeParse(someRandomString);`

[Try](https://www.typescriptlang.org/play/#code/CYUwxgNghgTiAEYD2A7AzgF3mpBbEASlCsHgMoYwCWKA5gFzaU20DcAsAFAD038AtILABXDIP5cAZsJRgMVVNiiSQABVhoQACjSNM1OgEpGMgNYokAdxTwA3l3jw4GYTBsApMgHkAcgDoABw1tNEMOTgBfLi5eeB8QEGB4DCR4ACMEMFgQaQh4SyoMAAt4AHIkNIArUoBCLmR0LArK+ABeJRV1GE0dPEJiUlwKA1owoA)

### [](#never)`never`

Some functions _never_ return a value:

ts

`function fail(msg: string): never {`

  `throw new Error(msg);`

`}`

[Try](https://www.typescriptlang.org/play/#code/GYVwdgxgLglg9mABMAhjANgCgLYGcDmAXIrlAE4xj4CUxYApgG71mIDeAsAFCKJQAWZOAHdEDUQFEyQsjgLUA3NwC+QA)

The `never` type represents values which are _never_ observed. In a return type, this means that the function throws an exception or terminates execution of the program.

`never` also appears when TypeScript determines there’s nothing left in a union.

ts

`function fn(x: string | number) {`

  `if (typeof x === "string") {`

    `// do something`

  `} else if (typeof x === "number") {`

    `// do something else`

  `} else {`

    `x; // has type 'never'!`

  `}`

`}`

[Try](https://www.typescriptlang.org/play/#code/GYVwdgxgLglg9mABMMAKAHgLkQZygJxjAHNEAfRMEAWwCMBTfASkQG8BYAKEURmEVRQAngAd6cfukQBeWYgBEeQiXksO3HogD0WxABM4uONXpQAFkWJceAX0T0ANjnq9+g0eMky58qnUaqbNaaOvqGOMamFiT2TvTBdo7OQRo86ADc2rpmAIY4iMJiiADkYPQAbozFAIQJXDZAA)

### [](#function)`Function`

The global type `Function` describes properties like `bind`, `call`, `apply`, and others present on all function values in JavaScript. It also has the special property that values of type `Function` can always be called; these calls return `any`:

ts

`function doSomething(f: Function) {`

  `return f(1, 2, 3);`

`}`

[Try](https://www.typescriptlang.org/play/#code/GYVwdgxgLglg9mABAEzgZTgWwKZQBYxgDmAFMAFyIBi408YAlIgN4CwAUIogE64jdJgJAIwAaRACZxAZgYBuDgF8gA)

This is an _untyped function call_ and is generally best avoided because of the unsafe `any` return type.

If you need to accept an arbitrary function but don’t intend to call it, the type `() => void` is generally safer.

## [](#rest-parameters-and-arguments)Rest Parameters and Arguments

> Background Reading:  
> [Rest Parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters)  
> [Spread Syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)  

### [](#rest-parameters)Rest Parameters

In addition to using optional parameters or overloads to make functions that can accept a variety of fixed argument counts, we can also define functions that take an _unbounded_ number of arguments using _rest parameters_.

A rest parameter appears after all other parameters, and uses the `...` syntax:

ts

`function multiply(n: number, ...m: number[]) {`

  `return m.map((x) => n * x);`

`}`

`// 'a' gets value [10, 20, 30, 40]`

`const a = multiply(10, 1, 2, 3, 4);`

[Try](https://www.typescriptlang.org/play/#code/GYVwdgxgLglg9mABAWxAG1gBzQTwBRgBciYIyARgKYBOANIgHRPLGkU0DaAugJSIDeAWABQiRNUpQQ1JMgbIAhpjx4AHnwC8APhKIAVInUBuEQF8RAeguIA5ApuIA5pIDOiAG4K0ISog4BGAAZ6ACZgxABmcIAWQK4RCAQXKEQFRA0UdCxcPCD6f1D6CPponiMgA)

In TypeScript, the type annotation on these parameters is implicitly `any[]` instead of `any`, and any type annotation given must be of the form `Array<T>` or `T[]`, or a tuple type (which we’ll learn about later).

### [](#rest-arguments)Rest Arguments

Conversely, we can _provide_ a variable number of arguments from an iterable object (for example, an array) using the spread syntax. For example, the `push` method of arrays takes any number of arguments:

ts

`const arr1 = [1, 2, 3];`

`const arr2 = [4, 5, 6];`

`arr1.push(...arr2);`

[Try](https://www.typescriptlang.org/play/#code/MYewdgzgLgBAhgJwQRhgXhgbWQGhgJjwGYBdAbgFgAoUSWRBfdLAFjwFY8A2c6h5AHQAHAK4QAFgAoBMhvgCUZIA)

Note that in general, TypeScript does not assume that arrays are immutable. This can lead to some surprising behavior:

ts

`// Inferred type is number[] -- "an array with zero or more numbers",`

`// not specifically two numbers`

`const args = [8, 5];`

`const angle = Math.atan2(...args);`

`A spread argument must either have a tuple type or be passed to a rest parameter.2556A spread argument must either have a tuple type or be passed to a rest parameter.`[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwFYMDYCwAoEUASQDsAzGaSAE1ABcBPAB0lAEtFRSBXAWwBGMANoBdUAFoJoAEQBDUqDmw5jUAHd29ABagAXjDigEoPgja9BMRDIA0BIqTj1QiVgGN25du7kAbPzV6dSNLISQCdzhSRBdlAHMuAF5QYQAOW1AMUQBuSOjYpVJ4vzYUgFk5HQA6KoU0AApq5oTEAEocoA)

The best fix for this situation depends a bit on your code, but in general a `const` context is the most straightforward solution:

ts

`// Inferred as 2-length tuple`

`const args = [8, 5] as const;`

`// OK`

`const angle = Math.atan2(...args);`

[Try](https://www.typescriptlang.org/play/#code/PTAEEkDsDMFMCd6wCagIYGdQCYC0AbWSAcwBcALUUgVwAdCBYAKAGMB7SDU9eYrAXlABtABwAaUAFYAuuiztOpANzMQoAPIBpZgq7oShUIICyaCgDozaSNgAU5h2l4YAlEqA)

Using rest arguments may require turning on [`downlevelIteration`](https://www.typescriptlang.org/tsconfig#downlevelIteration) when targeting older runtimes.

## [](#parameter-destructuring)Parameter Destructuring

> Background Reading:  
> [Destructuring Assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)  

You can use parameter destructuring to conveniently unpack objects provided as an argument into one or more local variables in the function body. In JavaScript, it looks like this:

js

`function sum({ a, b, c }) {`

  `console.log(a + b + c);`

`}`

`sum({ a: 10, b: 3, c: 9 });`

The type annotation for the object goes after the destructuring syntax:

ts

`function sum({ a, b, c }: { a: number; b: number; c: number }) {`

  `console.log(a + b + c);`

`}`

[Try](https://www.typescriptlang.org/play/#code/GYVwdgxgLglg9mABAZxAWwBQG9EEMA0iARoRIgL4BciOu1Y6RApgE4Dcx9jrHEXazFhQCUNALAAoRIggJkcADZMAdArgBzDLkQBqYrpnC2k8kA)

This can look a bit verbose, but you can use a named type here as well:

ts

`// Same as prior example`

`type ABC = { a: number; b: number; c: number };`

`function sum({ a, b, c }: ABC) {`

  `console.log(a + b + c);`

`}`

[Try](https://www.typescriptlang.org/play/#code/PTAEGUEMFsFNUgZ1ABwE4EsD2bSwB4woA2sAsAFAAuAnivAIIBCAwqALygDeCAXKADsArtABGsNAG5Qo-sLETpAYzkjxuAL6TKAMyEClVbANCIRACh6QANDNtLQG-sxYBKbpVCglWAYiykAHTEWADm5pCgANQy0d6u2hQaQA)

## [](#assignability-of-functions)Assignability of Functions

### [](#return-type-void)Return type `void`

The `void` return type for functions can produce some unusual, but expected behavior.

Contextual typing with a return type of `void` does **not** force functions to **not** return something. Another way to say this is a contextual function type with a `void` return type (`type voidFunc = () => void`), when implemented, can return _any_ other value, but it will be ignored.

Thus, the following implementations of the type `() => void` are valid:

ts

`type voidFunc = () => void;`

`const f1: voidFunc = () => {`

  `return true;`

`};`

`const f2: voidFunc = () => true;`

`const f3: voidFunc = function () {`

  `return true;`

`};`

[Try](https://www.typescriptlang.org/play/#code/C4TwDgpgBAbg9gSwCYDECuA7AxlAvFACgEo8A+WRJAbgFgAoerODAZ2CgDMBGALguXTY8hErnIBvelCgAnCMDQyMUYDLQRadAL6bGzNpwBMfeAMw58xMirUb6e1uw4BmE5UEXO54AmYioknTScgpKNuqaOkA)

And when the return value of one of these functions is assigned to another variable, it will retain the type of `void`:

ts

`const v1 = f1();`

`const v2 = f2();`

`const v3 = f3();`

[Try](https://www.typescriptlang.org/play/#code/C4TwDgpgBAbg9gSwCYDECuA7AxlAvFACgEo8A+WRJAbgFgAoerODAZ2CgDMBGALguXTY8hErnIBvelCgAnCMDQyMUYDLQRadAL6bGzNpwBMfeAMw58xMirUb6e1uw4BmE5UEXO54AmYioknTScgpKNuqaOvQA9NFQALSJWGjAifEOBjBcwtzEunRMjrCGOYZ59gX67DDOOc55QA)

This behavior exists so that the following code is valid even though `Array.prototype.push` returns a number and the `Array.prototype.forEach` method expects a function with a return type of `void`.

ts

`const src = [1, 2, 3];`

`const dst = [0];`

`src.forEach((el) => dst.push(el));`

[Try](https://www.typescriptlang.org/play/#code/MYewdgzgLgBBBOwYF4YG0CMAaGAmHAzALoDcAsAFCiSwAm0K6ADKZZQsAHQBmI8AogENgACwAUYgKYAbAJQoAfDHpROABwCuEcTNmySQA)

There is one other special case to be aware of, when a literal function definition has a `void` return type, that function must **not** return anything.

ts

`function f2(): void {`

  `// @ts-expect-error`

  `return true;`

`}`

`const f3 = function (): void {`

  `// @ts-expect-error`

  `return true;`

`};`

[Try](https://www.typescriptlang.org/play/#code/GYVwdgxgLglg9mABMATACgJQC5EDc4wAmiA3gLABQiiA9DYgAJQDOAtAKYAeADu9BwCcBcAZWoD2UEAKRQBIdgG5KAX0qUICZlGQBmRAF5k4aPCSYc+IqTG16TNl1792QkbYlSZiOQuUUVRSA)

For more on `void` please refer to these other documentation entries:

-   [FAQ - “Why are functions returning non-void assignable to function returning void?”](https://github.com/Microsoft/TypeScript/wiki/FAQ#why-are-functions-returning-non-void-assignable-to-function-returning-void)
