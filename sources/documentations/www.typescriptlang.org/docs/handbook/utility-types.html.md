---
title: "Documentation - Utility Types"
source_url: "https://www.typescriptlang.org/docs/handbook/utility-types.html"
crawled_at: "2026-07-02T07:37:30.796Z"
---

TypeScript provides several utility types to facilitate common type transformations. These utilities are available globally.

## [](#awaitedtype)`Awaited<Type>`

> Released: [4.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#the-awaited-type-and-promise-improvements)

This type is meant to model operations like `await` in `async` functions, or the `.then()` method on `Promise`s - specifically, the way that they recursively unwrap `Promise`s.

##### [](#example)Example

ts

`type A = Awaited<Promise<string>>;`

    `type A = string`

`type B = Awaited<Promise<Promise<number>>>;`

    `type B = number`

`type C = Awaited<boolean | Promise<number>>;`

    `type C = number | boolean`

[Try](https://www.typescriptlang.org/play/#code/C4TwDgpgBAglC8sDuBDAlsCATAPABQCcB7AWzQGcIdzgC0A7AcwD5mBuAKAHouo+A9APwcOoSFABCCZOky5CpClQVlKOegFcSAIwgFW7brwHDR4aAGFpMVBmw5tRIgBsIKelAA+UFUvVbdfUMePighIA)

## [](#partialtype)`Partial<Type>`

> Released:  
> [2.1](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-1.html#partial-readonly-record-and-pick)

Constructs a type with all properties of `Type` set to optional. This utility will return a type that represents all subsets of a given type.

##### [](#example-1)Example

ts

`interface Todo {`

  `title: string;`

  `description: string;`

`}`

`function updateTodo(todo: Todo, fieldsToUpdate: Partial<Todo>) {`

  `return { ...todo, ...fieldsToUpdate };`

`}`

`const todo1 = {`

  `title: "organize desk",`

  `description: "clear clutter",`

`};`

`const todo2 = updateTodo(todo1, {`

  `description: "throw out trash",`

`});`

[Try](https://www.typescriptlang.org/play/#code/JYOwLgpgTgZghgYwgAgCoHsAm7kG8BQyyYwYANhAFzIDOYUoA5gNyHKYQ0IMAOJ6IanQYgW+AL758MAK4gE-EMhk9McSBmwAKMFnTVN6ADTIYwCGUw0MAVVXqqyAApwoJOGQA8hgHwBKPDYoCDAZKCVcZAA6GN1sExioswsrW3tIZHFWSXwEATpiPQBGZABeQKISckcAInQoRjgQYAAvFA4aAGsaozYO7mA+YAFqGoQKV2RxmTBIKB6JVlz8sELsACYy5XSIQx1ikwIift5FUbAACyh0AHdkdBniKDgaC4XxP2YgA)

## [](#requiredtype)`Required<Type>`

> Released:  
> [2.8](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#improved-control-over-mapped-type-modifiers)

Constructs a type consisting of all properties of `Type` set to required. The opposite of [`Partial`](#partialtype).

##### [](#example-2)Example

ts

`interface Props {`

  `a?: number;`

  `b?: string;`

`}`

`const obj: Props = { a: 5 };`

`const obj2: Required<Props> = { a: 5 };`

`Property 'b' is missing in type '{ a: number; }' but required in type 'Required<Props>'.2741Property 'b' is missing in type '{ a: number; }' but required in type 'Required<Props>'.`[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwHYAsBGAUAJYB2ALjAGYCGAxpKAArwAOioA3nqKJQPypEBXALYAjGAG5OoEX1CIS0YgHNJAXzx5qcIvNBwRAK1SM4LUAF523VAFZQqyZu279BtKgBKkAI4CC0SAATAB4TFgA+CytKW3txIA)

## [](#readonlytype)`Readonly<Type>`

> Released:  
> [2.1](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-1.html#partial-readonly-record-and-pick)

Constructs a type with all properties of `Type` set to `readonly`, meaning the properties of the constructed type cannot be reassigned.

##### [](#example-3)Example

ts

`interface Todo {`

  `title: string;`

`}`

`const todo: Readonly<Todo> = {`

  `title: "Delete inactive users",`

`};`

`todo.title = "Hello";`

`Cannot assign to 'title' because it is a read-only property.2540Cannot assign to 'title' because it is a read-only property.`[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwFYAsAGAUAJYB2ALjAGYCGAxpKACpwAmcoA3nqKCQSQDaRUiEtGIBzANx4AvnjzU4RYd2ZxUAJUiUWRPgE8APIxYA+UAF52nbrwGoARABFIAsqGI0eANzoBXRDCI9gA0MlJ4JKoAdDz8dJb2ABIufHD2EkA)

This utility is useful for representing assignment expressions that will fail at runtime (i.e. when attempting to reassign properties of a [frozen object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze)).

##### [](#objectfreeze)`Object.freeze`

ts

`function freeze<Type>(obj: Type): Readonly<Type>;`

## [](#recordkeys-type)`Record<Keys, Type>`

> Released:  
> [2.1](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-1.html#partial-readonly-record-and-pick)

Constructs an object type whose property keys are `Keys` and whose property values are `Type`. This utility can be used to map the properties of a type to another type.

##### [](#example-4)Example

ts

`type CatName = "miffy" | "boris" | "mordred";`

`interface CatInfo {`

  `age: number;`

  `breed: string;`

`}`

`const cats: Record<CatName, CatInfo> = {`

  `miffy: { age: 10, breed: "Persian" },`

  `boris: { age: 5, breed: "Maine Coon" },`

  `mordred: { age: 16, breed: "British Shorthair" },`

`};`

`cats.boris;`

 `const cats: Record<CatName, CatInfo>`

[Try](https://www.typescriptlang.org/play/#code/C4TwDgpgBAwghsAcnAttAvFARCglgM3xCygB9sAjAewCdcBnE8nWgExolawG4AoX3ADtgEGvjgBjaPGABJQfipQA3ryhQ4AcwgAuKIICuKCqL7qKHTnvrA6gzXwC+-CVUE2oEhPT0AlCK40rAA8MshoADSwCPKKAHxQmKrqeIQgesoa2noAjAAMURYQVtgACqL0uHCCJI4RalDUdD4qWbpQAKyFlqx6WACycELSVG619SlsHL2tWu05AGzdxTNYAEJ0wAwAFlAAytu0wNtDNOO8jny8XsD0AHRNDHwA9M9QAHoA-EA)

## [](#picktype-keys)`Pick<Type, Keys>`

> Released:  
> [2.1](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-1.html#partial-readonly-record-and-pick)

Constructs a type by picking the set of properties `Keys` (string literal or union of string literals) from `Type`.

##### [](#example-5)Example

ts

`interface Todo {`

  `title: string;`

  `description: string;`

  `completed: boolean;`

`}`

`type TodoPreview = Pick<Todo, "title" | "completed">;`

`const todo: TodoPreview = {`

  `title: "Clean room",`

  `completed: false,`

`};`

`todo;`

 `const todo: TodoPreview`

[Try](https://www.typescriptlang.org/play/#code/JYOwLgpgTgZghgYwgAgCoHsAm7kG8BQyyYwYANhAFzIDOYUoA5gNyHKYQ0IMAOJ6IanQYgWbBOgC2PCpEzUARunQU4IVgF98+MAE8eKDNgAKUCADdgEAO7IAvMmPAEAawA8R9ABpkAIhLkEL7IAD5+EtKyEJi+AHys+BIgdMRY6NSephZWtg4ERAEU1L4AwqogyFDKkr5e4lIyEHLU8GQ0EHUaCWBprAD0fcgAegD8QA)

## [](#omittype-keys)`Omit<Type, Keys>`

> Released:  
> [3.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-5.html#the-omit-helper-type)

Constructs a type by picking all properties from `Type` and then removing `Keys` (string literal or union of string literals). The opposite of [`Pick`](#picktype-keys).

##### [](#example-6)Example

ts

`interface Todo {`

  `title: string;`

  `description: string;`

  `completed: boolean;`

  `createdAt: number;`

`}`

`type TodoPreview = Omit<Todo, "description">;`

`const todo: TodoPreview = {`

  `title: "Clean room",`

  `completed: false,`

  `createdAt: 1615544252770,`

`};`

`todo;`

 `const todo: TodoPreview`

`type TodoInfo = Omit<Todo, "completed" | "createdAt">;`

`const todoInfo: TodoInfo = {`

  `title: "Pick up kids",`

  `description: "Kindergarten closes at 5pm",`

`};`

`todoInfo;`

   `const todoInfo: TodoInfo`

[Try](https://www.typescriptlang.org/play/#code/JYOwLgpgTgZghgYwgAgCoHsAm7kG8BQyyYwYANhAFzIDOYUoA5gNyHKYQ0IMAOJ6IanQYgWbBOgC2PCpEzUARunQU4IVkW4Q4cgIJhqIAK6SF0VgF98+MAE8eKDNgAKUCADdgEAO7IAvMgA8pKkADxO6AA0yABEHFy8-CAxAHys+BIgdMRY6NQRrh5evgEERCTkVLEAwqogyFDKkjGR4lIyEHLU8GQ0EK2abjoQmPrUAIwAbOMArDMALPMATDNLAOxrAAytFulguawA9IfIAHoA-NZ2Dmi5AJIgMDgBwWER0TES0rIjMcgAPrEtMNRmBUulMtl9tgHk98vdHs88GwKhRqDFnMAEABrZBGHjIbHATA0FpseLcYB8YACdEAaVAHCgjDgUEg9QQZHQfRoyB0yBmPGaOz2CKeRxOFyAA)

## [](#excludeuniontype-excludedmembers)`Exclude<UnionType, ExcludedMembers>`

> Released:  
> [2.8](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#predefined-conditional-types)

Constructs a type by excluding from `UnionType` all union members that are assignable to `ExcludedMembers`.

##### [](#example-7)Example

ts

`type T0 = Exclude<"a" | "b" | "c", "a">;`

     `type T0 = "b" | "c"`

`type T1 = Exclude<"a" | "b" | "c", "a" | "b">;`

     `type T1 = "c"`

`type T2 = Exclude<string | number | (() => void), Function>;`

     `type T2 = string | number`

`type Shape =`

  `| { kind: "circle"; radius: number }`

  `| { kind: "square"; x: number }`

  `| { kind: "triangle"; x: number; y: number };`

`type T3 = Exclude<Shape, { kind: "circle" }>`

     `type T3 = {
    kind: "square";
    x: number;
} | {
    kind: "triangle";
    x: number;
    y: number;
}`

[Try](https://www.typescriptlang.org/play/#code/C4TwDgpgBAKgDFAvFAogDwMYBsCuATCAHgCIBDYqAHymICMLriNiAaG8gPgG4AoAej5QhUAHoB+HqEiwAjElSZcBEuSo16apq3YN1xbv0HDxk8NBgAmeemz4iAZ2AAnAJYA7AOZq3OALa0IJzUACmCASiQOKAA3AHsXPDC2ADEcNwxgF1i3AwFhUQlTaQBlAAtSaUQeIWoAbygAa3c8AC4aDBcnbAhiLignUjwXHHs2n39AqABfarV6prdWmnsARxxSJx6+tDG-AKCZmqh55rbiZxdSTywtqB2ocf2+kF2Jg94i8wBma0U7QjKFQgbBOizOHS6NwoUw4hny4iAA)

> Released:  
> [2.8](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#predefined-conditional-types)

Constructs a type by extracting from `Type` all union members that are assignable to `Union`.

##### [](#example-8)Example

ts

`type T0 = Extract<"a" | "b" | "c", "a" | "f">;`

     `type T0 = "a"`

`type T1 = Extract<string | number | (() => void), Function>;`

     `type T1 = () => void`

`type Shape =`

  `| { kind: "circle"; radius: number }`

  `| { kind: "square"; x: number }`

  `| { kind: "triangle"; x: number; y: number };`

`type T2 = Extract<Shape, { kind: "circle" }>`

     `type T2 = {
    kind: "circle";
    radius: number;
}`

[Try](https://www.typescriptlang.org/play/#code/C4TwDgpgBAKgDFAvFAogD2AJwIYGNgA8ARNkVAD5REBGZlRuRANFaRVQGZEB8A3AFAB6QVFFQAegH5+oSLACMSVBhz4CAZywBLAHYBzdjoCuAW2oRM7ABRWAlEm5QAbgHstAE1ssAYkZ34tFx0+IRExKX4ZcGgAZQALbDlEflFKAG8oAGtddwAuKlwtTFwAGwgiXigcdy0jdXzjMwsoAF8U9gzsnTyqdQBHI2xMcsq0BtNzSzbUqE6c-KJtbH0yiqgxqEbJypBxpqmBKLkYACYldCw8QnjEiBY57oXC4tXW7lCxCUkgA)

## [](#nonnullabletype)`NonNullable<Type>`

> Released:  
> [2.8](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#predefined-conditional-types)

Constructs a type by excluding `null` and `undefined` from `Type`.

##### [](#example-9)Example

ts

`type T0 = NonNullable<string | number | undefined>;`

     `type T0 = string | number`

`type T1 = NonNullable<string[] | null | undefined>;`

     `type T1 = string[]`

[Try](https://www.typescriptlang.org/play/#code/C4TwDgpgBAKgDFAvFAcgewHYoK4BtcCGARrhADwDOwATgJYYDmUAPlBtgLZETUtTYYAJhABm9CIIB8AbgBQAenlRlUAHoB+WaEiwAjElSYc+YqUo16DANoBdPu3x8BwsRgkyFSlRqA)

## [](#parameterstype)`Parameters<Type>`

> Released:  
> [3.1](https://github.com/microsoft/TypeScript/pull/26243)

Constructs a tuple type from the types used in the parameters of a function type `Type`.

For overloaded functions, this will be the parameters of the _last_ signature; see [Inferring Within Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types).

##### [](#example-10)Example

ts

`declare function f1(arg: { a: number; b: string }): void;`

`type T0 = Parameters<() => string>;`

     `type T0 = []`

`type T1 = Parameters<(s: string) => void>;`

     `type T1 = [s: string]`

`type T2 = Parameters<<T>(arg: T) => T>;`

     `type T2 = [arg: unknown]`

`type T3 = Parameters<typeof f1>;`

     `type T3 = [arg: {
    a: number;
    b: string;
}]`

`type T4 = Parameters<any>;`

     `type T4 = unknown[]`

`type T5 = Parameters<never>;`

     `type T5 = never`

`type T6 = Parameters<string>;`

`Type 'string' does not satisfy the constraint '(...args: any) => any'.2344Type 'string' does not satisfy the constraint '(...args: any) => any'.       type T6 = never  type T7 = Parameters<Function>;  Type 'Function' does not satisfy the constraint '(...args: any) => any'.   Type 'Function' provides no match for the signature '(...args: any): any'.2344Type 'Function' does not satisfy the constraint '(...args: any) => any'.   Type 'Function' provides no match for the signature '(...args: any): any'.       type T7 = never  `[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwGYAsWBQATSAYwBsBDaSUAMwFcA7IgFwEs56aBGACgoHNUAb1BlU9WgFsARjADcoKakRNoLen1ABfAJSoAbnBb5ZuXEwCeAByoAVAAygAvKAAKFMhMhMYiADzdtJwA+UGVVdSCTEFAY0AA9AH4zK1tOJ1d3T28kfxRQlTU+QMcQgyNI3GjYxOTrUBs0dLdoDy8fX18bIN5oAXrikK6osGqkizqbDCbMtpzxyDhqLgqqmJr5+qxplqz2snpzFZG1sZT6gFZt1uy-ekg9GCPY+NOJgDYr3ZywwqfR2tsAHZPrM-AAxBjMNj0P4nIA)

## [](#constructorparameterstype)`ConstructorParameters<Type>`

> Released:  
> [3.1](https://github.com/microsoft/TypeScript/pull/26243)

Constructs a tuple or array type from the types of a constructor function type. It produces a tuple type with all the parameter types (or the type `never` if `Type` is not a function).

##### [](#example-11)Example

ts

`type T0 = ConstructorParameters<ErrorConstructor>;`

     `type T0 = [message?: string]`

`type T1 = ConstructorParameters<FunctionConstructor>;`

     `type T1 = string[]`

`type T2 = ConstructorParameters<RegExpConstructor>;`

     `type T2 = [pattern: string | RegExp, flags?: string]`

`class C {`

  `constructor(a: number, b: string) {}`

`}`

`type T3 = ConstructorParameters<typeof C>;`

     `type T3 = [a: number, b: string]`

`type T4 = ConstructorParameters<any>;`

     `type T4 = unknown[]`

`type T5 = ConstructorParameters<Function>;`

`Type 'Function' does not satisfy the constraint 'abstract new (...args: any) => any'.   Type 'Function' provides no match for the signature 'new (...args: any): any'.2344Type 'Function' does not satisfy the constraint 'abstract new (...args: any) => any'.   Type 'Function' provides no match for the signature 'new (...args: any): any'.       type T5 = never  `[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwGYAsWBQIJEAXaASwGMjUAzAQwBtFJciBPAB0lABUAGUALygAwnAB2xaAFdKCAAq1otALaQiMRAB4AorASiJJGUQQA+ANz4woGwD0A-Cw5duARkEjxk4-MUq1GpoAYlJilKTiBt6y0BZWNnaObJw8aB5RRjEKSqrqSJoASpAA5toAHuwZ0jFxBAkOuOT0tIiIIqAA3rg25F6ZJtAAFLSoYlLKAEYwADSgE6iSpGLFAJSdAL64m8kuGOl91QPZ-nlaO3DUIrXWiU4p3Fj7hoe+OQH5tGKs1wmgDXcuACsT2iRz8uUCITCRAiYh+9XsQA)

## [](#returntypetype)`ReturnType<Type>`

> Released:  
> [2.8](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#predefined-conditional-types)

Constructs a type consisting of the return type of function `Type`.

For overloaded functions, this will be the return type of the _last_ signature; see [Inferring Within Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types).

##### [](#example-12)Example

ts

`declare function f1(): { a: number; b: string };`

`type T0 = ReturnType<() => string>;`

     `type T0 = string`

`type T1 = ReturnType<(s: string) => void>;`

     `type T1 = void`

`type T2 = ReturnType<<T>() => T>;`

     `type T2 = unknown`

`type T3 = ReturnType<<T extends U, U extends number[]>() => T>;`

     `type T3 = number[]`

`type T4 = ReturnType<typeof f1>;`

     `type T4 = {
    a: number;
    b: string;
}`

`type T5 = ReturnType<any>;`

     `type T5 = any`

`type T6 = ReturnType<never>;`

     `type T6 = never`

`type T7 = ReturnType<string>;`

`Type 'string' does not satisfy the constraint '(...args: any) => any'.2344Type 'string' does not satisfy the constraint '(...args: any) => any'.       type T7 = any  type T8 = ReturnType<Function>;  Type 'Function' does not satisfy the constraint '(...args: any) => any'.   Type 'Function' provides no match for the signature '(...args: any): any'.2344Type 'Function' does not satisfy the constraint '(...args: any) => any'.   Type 'Function' provides no match for the signature '(...args: any): any'.       type T8 = any  `[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwGYAsX3awFAAmkAxgDYCG0koAZgK4B2pALgJZxP0CMAFAEpUAb1CVUTBgFsARjADcoGakSto7JgHNQAX3kECrAJ4AHWgBUADKAC8oAEqRWDaE3OnIAHkG2AfKFV1LV99EFBw0AA9AH5DD1BzHlsHJxc3D28UALUNTQE-UAA3OHYiEIIwiJi4swS0ZMdnV3czT09zXx8bfw7QsCrY41rzDAbU5oz20EgAD1ZIJiJEUABVABpV6bmFpdBJWRgAbQBdTvzuhPLK8Oqhi1w7RrSWrzu4Ol4r-pvB+PMAVjGTXSrUoTCMXwiUV+wwAbEDnhkmJBCjBIQMahYAOwIiatQK5dE-TEJAAcuJBXgAYsw2JwmEToUA)

## [](#instancetypetype)`InstanceType<Type>`

> Released:  
> [2.8](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#predefined-conditional-types)

Constructs a type consisting of the instance type of a constructor function in `Type`.

##### [](#example-13)Example

ts

`class C {`

  `x = 0;`

  `y = 0;`

`}`

`type T0 = InstanceType<typeof C>;`

     `type T0 = C`

`type T1 = InstanceType<any>;`

     `type T1 = any`

`type T2 = InstanceType<never>;`

     `type T2 = never`

`type T3 = InstanceType<string>;`

`Type 'string' does not satisfy the constraint 'abstract new (...args: any) => any'.2344Type 'string' does not satisfy the constraint 'abstract new (...args: any) => any'.       type T3 = any  type T4 = InstanceType<Function>;  Type 'Function' does not satisfy the constraint 'abstract new (...args: any) => any'.   Type 'Function' provides no match for the signature 'new (...args: any): any'.2344Type 'Function' does not satisfy the constraint 'abstract new (...args: any) => any'.   Type 'Function' provides no match for the signature 'new (...args: any): any'.       type T4 = any  `[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwGYAsX3awFAgSIAu0AlgMamoBmAhgDaKQFVMOKKgDCoAbwKhQAD1ABeUAAYA3MNABPSTPkBfAgVKKADpFAAVaSoCSAOzIMzVSAd2QAPNr1w6fAHzziI0AD0A-Fr2hgCMphakVjZ2eg5Wip5EYD4BQXqGaOGW1rb2DmaQAG4wid4iqc76BhhZkTkxjmSUZgDmpcnlgZWGuFLm2dF5AGIArtakFHBm7T5+-kA)

## [](#noinfertype)`NoInfer<Type>`

> Released:  
> [5.4](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html#the-noinfer-utility-type)

Blocks inferences to the contained type. Other than blocking inferences, `NoInfer<Type>` is identical to `Type`.

##### [](#example-14)Example

ts

`function createStreetLight<C extends string>(`

  `colors: C[],`

  `defaultColor?: NoInfer<C>,`

`) {`

  `// ...`

`}`

`createStreetLight(["red", "yellow", "green"], "red");  // OK`

`createStreetLight(["red", "yellow", "green"], "blue");  // Error`

## [](#thisparametertypetype)`ThisParameterType<Type>`

> Released:  
> [3.3](https://github.com/microsoft/TypeScript/pull/28920)

Extracts the type of the [this](https://www.typescriptlang.org/docs/handbook/functions.html#this-parameters) parameter for a function type, or [unknown](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-0.html#new-unknown-top-type) if the function type has no `this` parameter.

##### [](#example-15)Example

ts

`function toHex(this: Number) {`

  `return this.toString(16);`

`}`

`function numberToString(n: ThisParameterType<typeof toHex>) {`

  `return toHex.apply(n);`

`}`

[Try](https://www.typescriptlang.org/play/#code/GYVwdgxgLglg9mABFOAJApgDwBRQBYwDOAXIgHIgC2ARugE4CUiA3gFCKJ3pQh1L5EAdCgDKUOjDABzbAEYAbAwDcrAL6tWoSLASIwVWnQAqcMROnYwpIwUIAFAIZ0HlbvSMBPAA7oAPFG90OGBkNCwAPiY2Di4ePlCMTEEHLy8AGw9LZTUgA)

## [](#omitthisparametertype)`OmitThisParameter<Type>`

> Released:  
> [3.3](https://github.com/microsoft/TypeScript/pull/28920)

Removes the [`this`](https://www.typescriptlang.org/docs/handbook/functions.html#this-parameters) parameter from `Type`. If `Type` has no explicitly declared `this` parameter, the result is simply `Type`. Otherwise, a new function type with no `this` parameter is created from `Type`. Generics are erased and only the last overload signature is propagated into the new function type.

##### [](#example-16)Example

ts

`function toHex(this: Number) {`

  `return this.toString(16);`

`}`

`const fiveToHex: OmitThisParameter<typeof toHex> = toHex.bind(5);`

`console.log(fiveToHex());`

[Try](https://www.typescriptlang.org/play/#code/GYVwdgxgLglg9mABFOAJApgDwBRQBYwDOAXIgHIgC2ARugE4CUiA3gFCKJ3pQh1L5EAdCgDKUOjDABzbAEYAbAwDcrAL6tWEBISiJgMAG7oAKmiykA8pRhRjBQgAUAhnSeVu9ADxQAngAd0OGBkM0wAPkQAXhCMTEFqSQATbABWZQ0tMEI4ABt0QRy4GX0jU1jsBmUgA)

## [](#thistypetype)`ThisType<Type>`

> Released:  
> [2.3](https://github.com/microsoft/TypeScript/pull/14141)

This utility does not return a transformed type. Instead, it serves as a marker for a contextual [`this`](https://www.typescriptlang.org/docs/handbook/functions.html#this) type. Note that the [`noImplicitThis`](https://www.typescriptlang.org/tsconfig#noImplicitThis) flag must be enabled to use this utility.

##### [](#example-17)Example

ts

`type ObjectDescriptor<D, M> = {`

  `data?: D;`

  `methods?: M & ThisType<D & M>; // Type of 'this' in methods is D & M`

`};`

`function makeObject<D, M>(desc: ObjectDescriptor<D, M>): D & M {`

  `let data: object = desc.data || {};`

  `let methods: object = desc.methods || {};`

  `return { ...data, ...methods } as D & M;`

`}`

`let obj = makeObject({`

  `data: { x: 0, y: 0 },`

  `methods: {`

    `moveBy(dx: number, dy: number) {`

      `this.x += dx; // Strongly typed this`

      `this.y += dy; // Strongly typed this`

    `},`

  `},`

`});`

`obj.x = 10;`

`obj.y = 20;`

`obj.moveBy(5, 5);`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEDsHsEkFsAOAbAlgY1QFwCoAtUBnALlCwCcBXAUwCgsBPRa0AeQCMAra9LAEWqF05VIizRyAHj4AaUAFkAfKAC8oAN61QoACYBDLHoD8pPgG4toeNSx5oOwiYWgAZKHxEcTatNcLFZqAg7t6g0ABmoADktkRRoKiQVjZ2DgmEoHx+8rQAvha04ZSQvKjQSfB6ANbUHNy80nJKABQ6guikdTz87SJiEo3+AJSm2RqWyDa6Bnqk0FzdqrrtAHT6hqAAPpsa+RNT1rb2JGELvEttQiuHqRnbuxba5DaU5EnqoCtf63pyX9cpY6gXKgPQZLJueQWXK0WiTLCnThLSo1Lq8ZqabQ-UgfAAepAADHIGITgTJLDdjjjLNp4NAAG7UABCDFa+NAkEo8HY1HIch0JI5XJ55CG420ErIBEIK1xoAA1GodLjAsEAMoUcoAc2QDDI3h0UqINIlsRlesVugYqrAGvI2t1+uYhrNJty5O07ryQwK804sqWAEYCRY-Ss9WoAEwh2hhumMlnNACsciTPqAA)

In the example above, the `methods` object in the argument to `makeObject` has a contextual type that includes `ThisType<D & M>` and therefore the type of [this](https://www.typescriptlang.org/docs/handbook/functions.html#this) in methods within the `methods` object is `{ x: number, y: number } & { moveBy(dx: number, dy: number): void }`. Notice how the type of the `methods` property simultaneously is an inference target and a source for the `this` type in methods.

The `ThisType<T>` marker interface is simply an empty interface declared in `lib.d.ts`. Beyond being recognized in the contextual type of an object literal, the interface acts like any empty interface.

## [](#intrinsic-string-manipulation-types)Intrinsic String Manipulation Types

### [](#uppercasestringtype)`Uppercase<StringType>`

### [](#lowercasestringtype)`Lowercase<StringType>`

### [](#capitalizestringtype)`Capitalize<StringType>`

### [](#uncapitalizestringtype)`Uncapitalize<StringType>`

To help with string manipulation around template string literals, TypeScript includes a set of types which can be used in string manipulation within the type system. You can find those in the [Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html#uppercasestringtype) documentation.
