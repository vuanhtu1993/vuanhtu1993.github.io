---
title: "Documentation - Mapped Types"
source_url: "https://www.typescriptlang.org/docs/handbook/2/mapped-types.html"
crawled_at: "2026-07-02T07:37:17.521Z"
---

When you don’t want to repeat yourself, sometimes a type needs to be based on another type.

Mapped types build on the syntax for index signatures, which are used to declare the types of properties which have not been declared ahead of time:

ts

`type OnlyBoolsAndHorses = {`

  `[key: string]: boolean | Horse;`

`};`

`const conforms: OnlyBoolsAndHorses = {`

  `del: true,`

  `rodney: false,`

`};`

[Try](https://www.typescriptlang.org/play/#code/C4TwDgpgBAEg9gJwM7QLxQN4F8DcAoAegKgFoyBjAV2DJL1EigHkA7AGxACE442kBBFgBN4yCEijoMeKFADaAawggAXFCTAEASxYBzALpqARjzYQAhiygAfWIhT5cePOTgsNUVywBmiALZIaqwc3LwCwqIoElIyUEIQbGqalBAANLEIcEIsymre5nxpeLhAA)

A mapped type is a generic type which uses a union of `PropertyKey`s (frequently created [via a `keyof`](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html)) to iterate through keys to create a type:

ts

`type OptionsFlags<Type> = {`

  `[Property in keyof Type]: boolean;`

`};`

[Try](https://www.typescriptlang.org/play/#code/C4TwDgpgBA8mwEsD2A7AzgMQDYEMDmaAPACrgQB8UAvFAN4BQUUA2gAoBOSk7oUCKUANYQQSAGZRSkALoAuKACMkSLBBwoA3PQC+GoA)

In this example, `OptionsFlags` will take all the properties from the type `Type` and change their values to be a boolean.

ts

`type Features = {`

  `darkMode: () => void;`

  `newUserProfile: () => void;`

`};`

`type FeatureOptions = OptionsFlags<Features>;`

           `type FeatureOptions = {
    darkMode: boolean;
    newUserProfile: boolean;
}`

[Try](https://www.typescriptlang.org/play/#code/C4TwDgpgBA8mwEsD2A7AzgMQDYEMDmaAPACrgQB8UAvFAN4BQUUA2gAoBOSk7oUCKUANYQQSAGZRSkALoAuKACMkSLBBwoA3PQC+WgPR6oAWhMBjAK7ATR+qEhQMa4OfYQ01OoygATHO0EAskjeEPIAFACU1JQAbkgI3lpMKBAA7gCqaBDsHOIIquFRVLHxiTpatmQOTi4QcIio7jT1yOjY+ESOOM6uaOT6hkwAegD8QA)

### [](#mapping-modifiers)Mapping Modifiers

There are two additional modifiers which can be applied during mapping: `readonly` and `?` which affect mutability and optionality respectively.

You can remove or add these modifiers by prefixing with `-` or `+`. If you don’t add a prefix, then `+` is assumed.

ts

`// Removes 'readonly' attributes from a type's properties`

`type CreateMutable<Type> = {`

  `-readonly [Property in keyof Type]: Type[Property];`

`};`

`type LockedAccount = {`

  `readonly id: string;`

  `readonly name: string;`

`};`

`type UnlockedAccount = CreateMutable<LockedAccount>;`

           `type UnlockedAccount = {
    id: string;
    name: string;
}`

[Try](https://www.typescriptlang.org/play/#code/PTAECUFMFsHsDdIGdQHIBOkCGATWA7AGwE9VQsAXC9ASwCMBXC5UAM3VmnNAuIAdIqFHw4D0FGsgBQvAaADCmSpACyTLHUKQAPABV+kAHygAvKADeU0KAC0SvEWKgA2gAVRkcU5r5QAa0hiWFZQfQEAXQAuUIM3Dy9wgG4pAF9kmQNQABlYAGMAnABBXNzYBnwKUwsrUHsCElAaHGikah8Ac2TrOsdQfCxoSBa2-E7U9NlIUABVIjyC4tLyyrNFbGY1Cg0tbRz8yCKSsorDZJBrUAA9AH4gA)

ts

`// Removes 'optional' attributes from a type's properties`

`type Concrete<Type> = {`

  `[Property in keyof Type]-?: Type[Property];`

`};`

`type MaybeUser = {`

  `id: string;`

  `name?: string;`

  `age?: number;`

`};`

`type User = Concrete<MaybeUser>;`

      `type User = {
    id: string;
    name: string;
    age: number;
}`

[Try](https://www.typescriptlang.org/play/#code/PTAECUFMFsHsDdIGdQHJYAcAuBLWA7AQwBtVRCssAnHAIwFctlQAzK2ac0LATw0lQoM7flVzIAUL36gAwgQDGVSEwA8AFT6QAfKAC8oAN4TQoANoAFEZDE9QOfKADWkHrBahN-ALoBaAPwAXJ5alta23gDcEgC+0VJaoACyhDy0kACqSDb6Rib2ACbBSNQOAObRpkTQkEGgJTT4FfmEZbXB+PTQ6VTRcRIJMlk5BvL4SiqQqilpmdlU2tEgpqAAev5AA)

## [](#key-remapping-via-as)Key Remapping via `as`

In TypeScript 4.1 and onwards, you can re-map keys in mapped types with an `as` clause in a mapped type:

ts

`type MappedTypeWithNewProperties<Type> = {`

    `[Properties in keyof Type as NewKeyType]: Type[Properties]`

`}`

You can leverage features like [template literal types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html) to create new property names from prior ones:

ts

`type Getters<Type> = {`

    `[Property in keyof Type as `get${Capitalize<string & Property>}`]: () => Type[Property]`

`};`

`interface Person {`

    `name: string;`

    `age: number;`

    `location: string;`

`}`

`type LazyPerson = Getters<Person>;`

         `type LazyPerson = {
    getName: () => string;
    getAge: () => number;
    getLocation: () => string;
}`

[Try](https://www.typescriptlang.org/play/#code/C4TwDgpgBA4hzAgJwM4B4Aq4ID4oF4oBvAKCnKgG0AFJAe0iVCgEsA7KAawhDoDMoWSFACGKKAAMA5vAAkRAMIiwLYCIA2LAF4Q0KYEnZSoAMii0GyUDgC+EgLoAuKAAoAlATxCINeo1D2JDYA3CQk7IhIfCIAxtDUyCh0HKQUUGwiALYQzvqGbFKhaSIyzmwArpkARshFFOp0MSLALMm5BkahNmGgwgAyIlogCajJBLDwkegjSWw4oQD0CxQAegD8QA)

You can filter out keys by producing `never` via a conditional type:

ts

`// Remove the 'kind' property`

`type RemoveKindField<Type> = {`

    `[Property in keyof Type as Exclude<Property, "kind">]: Type[Property]`

`};`

`interface Circle {`

    `kind: "circle";`

    `radius: number;`

`}`

`type KindlessCircle = RemoveKindField<Circle>;`

           `type KindlessCircle = {
    radius: number;
}`

[Try](https://www.typescriptlang.org/play/#code/PTAECUFMFsHsDdKgC4AskHIDWBLAdgCYagAOATrCZGcgJ4BQdVEMCkA0vgQGI6QA2BADwAVWlQB8oALygA3vVBLQAbQAKFKjVqh8oLJFqwAZqDHMAhgGdQAUQAeAY34BXApCEbK1OgBpQAES4hAESALoAXGbikOqaPrRh9AC+ANz09PjI1MYWjkgAwjhkzkgKyvpcUQGOxaUB6RVkFgQ4LlZReC7QAEbU6ckZTEichPyQVlZFJeMyLHCIozx8gkLTpRLpIMoAegD8QA)

You can map over arbitrary unions, not just unions of `string | number | symbol`, but unions of any type:

ts

`type EventConfig<Events extends { kind: string }> = {`

    `[E in Events as E["kind"]]: (event: E) => void;`

`}`

`type SquareEvent = { kind: "square", x: number, y: number };`

`type CircleEvent = { kind: "circle", radius: number };`

`type Config = EventConfig<SquareEvent | CircleEvent>`

       `type Config = {
    square: (event: SquareEvent) => void;
    circle: (event: CircleEvent) => void;
}`

[Try](https://www.typescriptlang.org/play/#code/C4TwDgpgBAogbhAdsAwge0QMwJYHMA88SwAzlBAB7BIAmZA3lANbaI0BcUJwATq7lAC+APigBeKPQBQUWVADaMKK1gJkZAIZkY8gEQs2ugLpHOACghrgnGAEpxouGmw0A3FMFSpoSFADKAI4Arho8EETI4pLMrBxQuiTBoRC6ADRQFJyIQQC2AEYQPOkgWbkFPELuPtAo2DwAxgA24VZRjAZxuvV1TSnpPBo02EEkpfmFlV7VUOhYeFERqBg4BIEhYYtQAD4zPc2LwlIA9EdyAHoA-EA)

### [](#further-exploration)Further Exploration

Mapped types work well with other features in this type manipulation section, for example here is [a mapped type using a conditional type](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html) which returns either a `true` or `false` depending on whether an object has the property `pii` set to the literal `true`:

ts

`type ExtractPII<Type> = {`

  `[Property in keyof Type]: Type[Property] extends { pii: true } ? true : false;`

`};`

`type DBFields = {`

  `id: { format: "incrementing" };`

  `name: { type: string; pii: true };`

`};`

`type ObjectsNeedingGDPRDeletion = ExtractPII<DBFields>;`

                 `type ObjectsNeedingGDPRDeletion = {
    id: false;
    name: true;
}`

[Try](https://www.typescriptlang.org/play/#code/C4TwDgpgBAogHsATgQwMbAAoEksB4Aq4EAfFALxQDeAUFFANoaID2kioUAlgHZQDWEEMwBmUQpAC6ALjFFGLNqAlQICCNwAmAZypQwnTjKQBXaAF8oAfignoM4cgA2WiAG5qZ99VCQoAEQAhADFOCEdtcipaLg0ZSihhZkQAW2RgGQAiHlRECGT1YB4AcwyoT2juZHy4myIZLSRi1z0DI0RTMvdy7yIoAHkAIwArCHQtADkICA1igHE-DAAlPzCIQuZeCngkNEwcXECQsO1idwB6M7ooAD1LIA)
