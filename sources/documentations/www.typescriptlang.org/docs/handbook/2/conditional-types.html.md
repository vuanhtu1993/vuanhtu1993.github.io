---
title: "Documentation - Conditional Types"
source_url: "https://www.typescriptlang.org/docs/handbook/2/conditional-types.html"
crawled_at: "2026-07-02T07:37:14.065Z"
---

At the heart of most useful programs, we have to make decisions based on input. JavaScript programs are no different, but given the fact that values can be easily introspected, those decisions are also based on the types of the inputs. _Conditional types_ help describe the relation between the types of inputs and outputs.

ts

`interface Animal {`

  `live(): void;`

`}`

`interface Dog extends Animal {`

  `woof(): void;`

`}`

`type Example1 = Dog extends Animal ? number : string;`

        `type Example1 = number`

`type Example2 = RegExp extends Animal ? number : string;`

        `type Example2 = string`

[Try](https://www.typescriptlang.org/play/#code/JYOwLgpgTgZghgYwgAgIImAWzgG2QbwChlkdgA3CACgEoAuZcge2ABMBuQgX0NElkQoAIkwDmyCAA9IIVgGc0GbHiIkA7kyYxaDZm049CYAJ4AHFAFFJcTKZwQAjMgC8yEeKkz5irLmQB+ZBAAV0wAI2hkBjkwKFBRTgB6RJJkAD1-QiMzS2tbewAmF2QAJQhRK1MJaQhZBXRfPECQ8Mjo2PiklJIMoA)

Conditional types take a form that looks a little like conditional expressions (`condition ? trueExpression : falseExpression`) in JavaScript:

ts

  `SomeType extends OtherType ? TrueType : FalseType;`

[Try](https://www.typescriptlang.org/play/#code/C4TwDgpgBAyg9gWwgFXNAvFAhgOxAbgChRIoB5YACwgCdVTNcDi0pkaBXFVxvIk6ADEsAGwDO3Btj4tSMYBwBmiqOkJQoAek1QAtPoDGHYPt3rYiSdAgAPYBBwATMeSq160APxtOVqAC4oYXErfCA)

When the type on the left of the `extends` is assignable to the one on the right, then you’ll get the type in the first branch (the “true” branch); otherwise you’ll get the type in the latter branch (the “false” branch).

From the examples above, conditional types might not immediately seem useful - we can tell ourselves whether or not `Dog extends Animal` and pick `number` or `string`! But the power of conditional types comes from using them with generics.

For example, let’s take the following `createLabel` function:

ts

`interface IdLabel {`

  `id: number /* some fields */;`

`}`

`interface NameLabel {`

  `name: string /* other fields */;`

`}`

`function createLabel(id: number): IdLabel;`

`function createLabel(name: string): NameLabel;`

`function createLabel(nameOrId: string | number): IdLabel | NameLabel;`

`function createLabel(nameOrId: string | number): IdLabel | NameLabel {`

  `throw "unimplemented";`

`}`

[Try](https://www.typescriptlang.org/play/#code/JYOwLgpgTgZghgYwgAgJIBMAycBGEA2yA3gFDLLDoBcyIArgLZ5TID0AVMgM4D2DKMYAXRdk7VgG4SAXxKhIsRCgBycftjyFS5EGog0uYKKADmbTjzAALaMkHDR4qbJIw6IBGGA8QyBFAg4SA0CAApKGnomaABKGgwQ-Ck3Dy8fPwCgiETQ3X4DI1M45FV1XAJk909vX39A4PL8XL0AeSgMAuMQMwAfWkZmYoTG5D7S7MbK1JqM+onNZv42ju5C7tH+6KghrBGxvUTiMmRrKB4Ad2QAIndgBgAHfAh+cAh0K+cgA)

These overloads for createLabel describe a single JavaScript function that makes a choice based on the types of its inputs. Note a few things:

1.  If a library has to make the same sort of choice over and over throughout its API, this becomes cumbersome.
2.  We have to create three overloads: one for each case when we’re _sure_ of the type (one for `string` and one for `number`), and one for the most general case (taking a `string | number`). For every new type `createLabel` can handle, the number of overloads grows exponentially.

Instead, we can encode that logic in a conditional type:

ts

`type NameOrId<T extends number | string> = T extends number`

  `? IdLabel`

  `: NameLabel;`

[Try](https://www.typescriptlang.org/play/#code/JYOwLgpgTgZghgYwgAgJIBMAycBGEA2yA3gFDLLDoBcyIArgLZ5TID0AVMgM4D2DKMYAXRdk7VgG4SAXxKhIsRCgBycftjyFS5EGog0uYKKADmbTjzAALaMkHDR4qbNatkAWk8I6YT+5JgAJ4ADip6APJQGAA8ACrIEAAekCAitIzMyAA+3EamAHzIALzI8UkpafRM0GTIAPxoWLgEtTSq6s34EkA)

We can then use that conditional type to simplify our overloads down to a single function with no overloads.

ts

`function createLabel<T extends number | string>(idOrName: T): NameOrId<T> {`

  `throw "unimplemented";`

`}`

`let a = createLabel("typescript");`

   `let a: NameLabel`

`let b = createLabel(2.8);`

   `let b: IdLabel`

`let c = createLabel(Math.random() ? "hello" : 42);`

`let c: NameLabel | IdLabel`

[Try](https://www.typescriptlang.org/play/#code/JYOwLgpgTgZghgYwgAgJIBMAycBGEA2yA3gFDLLDoBcyIArgLZ5TID0AVMgM4D2DKMYAXRdk7VgG4SAXxKhIsRCgBycftjyFS5EGog0uYKKADmbTjzAALaMkHDR4qbLABPAA4q9AeSgYAPAAqyBAAHpAgIrSMzMgAPtxGpgB8yAC8yMFhEVH0TNBkyAD8aFi4BIU0qurl+FKsrMgAtC0IdGAtTSQwdCAIYMA8IMgIUBBwkBoEQSHhEJGiebEJhsYgJskAFJS+1fqZAJRVPn7oQanayNZQPADuyABEvcAM7vgQ-OAQ6A-OJCTvMDIODpEZjCYQKb4TYPNyeLijYDuMAPA71RrIAB6RX+gOQOFBo3Gk1qmwATAA6AAcaJIDXI2NxECBCEJ4JJmk2AFkJlYKVA4JE+JsDsVHjZ8PgeA9kDQACxk2n0rFFIA)

### [](#conditional-type-constraints)Conditional Type Constraints

Often, the checks in a conditional type will provide us with some new information. Just like narrowing with type guards can give us a more specific type, the true branch of a conditional type will further constrain generics by the type we check against.

For example, let’s take the following:

ts

`type MessageOf<T> = T["message"];`

`Type '"message"' cannot be used to index type 'T'.2536Type '"message"' cannot be used to index type 'T'.`[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwFYDMA2AUAC4CeADpKALKSKICGA5pAPIBmAPACoB8oAvKBwDaAIgC21Oo2EBdANxA)

In this example, TypeScript errors because `T` isn’t known to have a property called `message`. We could constrain `T`, and TypeScript would no longer complain:

ts

`type MessageOf<T extends { message: unknown }> = T["message"];`

`interface Email {`

  `message: string;`

`}`

`type EmailMessageContents = MessageOf<Email>;`

              `type EmailMessageContents = string`

[Try](https://www.typescriptlang.org/play/#code/C4TwDgpgBAshDO8CGBzCB5AZgHgCpQgA9gIA7AE3igG8oBbBZNALigFdSBrUgewHdSUAL4A+KAF4ouANoAiBolQRZAXQDcAKA0BLUiQBOmJAGNoAUTpJtAGxoao9Rktbxg+3Sk1CtoSFAtW1nCKaADCPHpkwFSSwUwYOAE2IpoA9KkOUAB6APxAA)

However, what if we wanted `MessageOf` to take any type, and default to something like `never` if a `message` property isn’t available? We can do this by moving the constraint out and introducing a conditional type:

ts

`type MessageOf<T> = T extends { message: unknown } ? T["message"] : never;`

`interface Email {`

  `message: string;`

`}`

`interface Dog {`

  `bark(): void;`

`}`

`type EmailMessageContents = MessageOf<Email>;`

              `type EmailMessageContents = string`

`type DogMessageContents = MessageOf<Dog>;`

             `type DogMessageContents = never`

[Try](https://www.typescriptlang.org/play/#code/C4TwDgpgBAshDO8CGBzCB5AZgHgCoD4oBeKXKCAD2AgDsATeKAbygFsFk0AuKAVxoDWNAPYB3GlAC+UAPykA2gCJ2iVBEUBdKDxoQAbhABOAbgBQpgJY1qhzEgDG0AKKskFgDbNTUNhzU94YEMrFDNJcysbO0coABFhFC8fACMkQwEACgBKHj1hCzow81BIKBc3dzhVNABhYWtaYEYSKs4MHHKPfDMAeh6fKAA9GWLwaHiUVrU6hutm2D80LGwJ7tM+geGgA)

Within the true branch, TypeScript knows that `T` _will_ have a `message` property.

As another example, we could also write a type called `Flatten` that flattens array types to their element types, but leaves them alone otherwise:

ts

`type Flatten<T> = T extends any[] ? T[number] : T;`

`// Extracts out the element type.`

`type Str = Flatten<string[]>;`

     `type Str = string`

`// Leaves the type alone.`

`type Num = Flatten<number>;`

     `type Num = number`

[Try](https://www.typescriptlang.org/play/#code/C4TwDgpgBAYgNgQ2MCA7APAFQHxQLxSZQQAeKqAJgM5QKogDaAulAPyEOoCuAtgEYQATiwBchANwAoSQHoZUAKJlBCAMbAaAey7AowABbQIcCDzS7QkAHSTL0AMrBB+WImRp0VJwEtUAc2ZsKTkoUIA9VmkQgBkIBAA3CBoDaDtaOE1UCBs0gDleF3gkcnRufiEg2Xlw1iA)

When `Flatten` is given an array type, it uses an indexed access with `number` to fetch out `string[]`’s element type. Otherwise, it just returns the type it was given.

### [](#inferring-within-conditional-types)Inferring Within Conditional Types

We just found ourselves using conditional types to apply constraints and then extract out types. This ends up being such a common operation that conditional types make it easier.

Conditional types provide us with a way to infer from types we compare against in the true branch using the `infer` keyword. For example, we could have inferred the element type in `Flatten` instead of fetching it out “manually” with an indexed access type:

ts

`type Flatten<Type> = Type extends Array<infer Item> ? Item : Type;`

[Try](https://www.typescriptlang.org/play/#code/C4TwDgpgBAYgNgQ2MCA7APAFXBAfFAXim0iggA8VUATAZygEEAnJhEdAS1QDMImoAkigC2+APyCRUAFzEcAbiA)

Here, we used the `infer` keyword to declaratively introduce a new generic type variable named `Item` instead of specifying how to retrieve the element type of `Type` within the true branch. This frees us from having to think about how to dig through and probing apart the structure of the types we’re interested in.

We can write some useful helper type aliases using the `infer` keyword. For example, for simple cases, we can extract the return type out from function types:

ts

`type GetReturnType<Type> = Type extends (...args: never[]) => infer Return`

  `? Return`

  `: never;`

`type Num = GetReturnType<() => number>;`

     `type Num = number`

`type Str = GetReturnType<(x: string) => string>;`

     `type Str = string`

`type Bools = GetReturnType<(a: boolean, b: boolean) => boolean[]>;`

      `type Bools = boolean[]`

[Try](https://www.typescriptlang.org/play/#code/C4TwDgpgBA4hwCV4FcBOA7AKuCAebkAfFALxQHQQAewE6AJgM5QAUAdBwIaoDmjAXFHQQAbhFQBtALoBKUsQCW6AGbioSYGnQAoKFAD86lBl1RBwsagDc27aEhQAcsgC2pWPA1aKuFnJLE6K4ARuKENgD0EXpQAHr6tvbQAMrAqO5wiMZYOL5UgoxpSjz+xIWoxeHaUTHxiThQAEIA9s0ANsxkmV4YPiycgsGtbRCc6AA0UMGDw6PopVOzY9JVNXrxQA)

When inferring from a type with multiple call signatures (such as the type of an overloaded function), inferences are made from the _last_ signature (which, presumably, is the most permissive catch-all case). It is not possible to perform overload resolution based on a list of argument types.

ts

`declare function stringOrNum(x: string): number;`

`declare function stringOrNum(x: number): string;`

`declare function stringOrNum(x: string | number): string | number;`

`type T1 = ReturnType<typeof stringOrNum>;`

     `type T1 = string | number`

[Try](https://www.typescriptlang.org/play/#code/CYUwxgNghgTiAEAzArgOzAFwJYHtXwGcMYtUBzAeRgDlkBbACgA8AuQ40sgSjdXoCMQMANwAoUJFgIU6bHnYlyVWo1bw+dQTB4LOYidDhI0mXPiKLKNeszYXO8AD7qBQnffJOXmoWNEYATwAHBAAVAEZ4AF54ACUQDGQYVFDgkAAeQJCcRF0lazoAPjEAehL4CoA9AH4gA)

## [](#distributive-conditional-types)Distributive Conditional Types

When conditional types act on a generic type, they become _distributive_ when given a union type. For example, take the following:

ts

`type ToArray<Type> = Type extends any ? Type[] : never;`

[Try](https://www.typescriptlang.org/play/#code/C4TwDgpgBAKg9gQQE5IIYgDw3BAfFAXlhyggA9gIA7AEwGcpUqQoB+YyAbQF0oAuKFQgA3CEgDcQA)

If we plug a union type into `ToArray`, then the conditional type will be applied to each member of that union.

ts

`type ToArray<Type> = Type extends any ? Type[] : never;`

`type StrArrOrNumArr = ToArray<string | number>;`

           `type StrArrOrNumArr = string[] | number[]`

[Try](https://www.typescriptlang.org/play/#code/C4TwDgpgBAKg9gQQE5IIYgDw3BAfFAXlhyggA9gIA7AEwGcpUqQoB+YyAbQF0oAuKFQgA3CEgDcAKEmhIUAMrAkyJAHkkAOQCuAWxWFYiFOgx0lASyoBzKAB9BugEZjcUgPRuoXgHqsgA)

What happens here is that `ToArray` distributes on:

ts

  `string | number;`

[Try](https://www.typescriptlang.org/play/#code/C4TwDgpgBAysBOBBe8Dy8ByBXAts+UAvAFBRQD05UAtLQMZbC3WlQDOCAlgHYDmUAHyjdcAIwjwA3EA)

and maps over each member type of the union, to what is effectively:

ts

  `ToArray<string> | ToArray<number>;`

[Try](https://www.typescriptlang.org/play/#code/C4TwDgpgBAKg9gQQE5IIYgDw3BAfFAXlhyggA9gIA7AEwGcpUqQoB+YyAbQF0oAuKFQgA3CEgDcAKFCQoAZWBJkSAPJIAcgFcAtssKSoUAPRGoAWgsBjTcAtmDsRCnQY6igJZUA5vgA+j5RcqHQAjMVxxIA)

which leaves us with:

ts

  `string[] | number[];`

[Try](https://www.typescriptlang.org/play/#code/C4TwDgpgBAysBOBBe8Dy8ByBXAts+UAvAFBRQD05UAtLQMZbC3WlQDOCAlgHYDmA2gF0oAHyjdcAIwjwhAbiA)

Typically, distributivity is the desired behavior. To avoid that behavior, you can surround each side of the `extends` keyword with square brackets.

ts

`type ToArrayNonDist<Type> = [Type] extends [any] ? Type[] : never;`

`// 'ArrOfStrOrNum' is no longer a union.`

`type ArrOfStrOrNum = ToArrayNonDist<string | number>;`

          `type ArrOfStrOrNum = (string | number)[]`

[Try](https://www.typescriptlang.org/play/#code/C4TwDgpgBAKg9gQQE5IIYgHJwHYBECWAzsADwzgQB8UAvFANrmQC6UEAHsBNgCaEOpsIVgH5YFeqwBcUbBABuEJAG4AUKoD0GqAHJkSAPIAzAMrBDSDAFcAtjqhFZcKABscAcyVRUUK9nw4AHSqoJBQ+sZmFtY2tLCIKOhYeESkxEj42O5QAD6ytgBGSpRqWlDlAHoiQA)
