---
title: "Documentation - Indexed Access Types"
source_url: "https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html"
crawled_at: "2026-07-02T07:37:10.845Z"
---

We can use an _indexed access type_ to look up a specific property on another type:

ts

`type Person = { age: number; name: string; alive: boolean };`

`type Age = Person["age"];`

     `type Age = number`

[Try](https://www.typescriptlang.org/play/#code/C4TwDgpgBAChBOBnA9gOygXigbygQwHMIAuKVAVwFsAjBAbjL0pKkWHgEtUCG8AbDgDcW1ZMj4Q86AL50AUKEhQAgkUywEKVAG0ARIQi6AuvID0pqJYB6AfiA)

The indexing type is itself a type, so we can use unions, `keyof`, or other types entirely:

ts

`type I1 = Person["age" | "name"];`

     `type I1 = string | number`

`type I2 = Person[keyof Person];`

     `type I2 = string | number | boolean`

`type AliveOrName = "alive" | "name";`

`type I3 = Person[AliveOrName];`

     `type I3 = string | boolean`

[Try](https://www.typescriptlang.org/play/#code/C4TwDgpgBAChBOBnA9gOygXigbygQwHMIAuKVAVwFsAjBAbjL0pKkWHgEtUCG8AbDgDcW1ZMj4Q86AL50AUAHoFUALRqAxuWBqVc0JCgBJAIyZYCFKgDaAIkIQbUAD5QbqJg4C68pVD8A9AH45PXBoQwAmMzgkNCsAawgQZAAzc1jUb0VlAODQgwBBAWEAeXgAOQ8zO2KHZ1d3Zht5fXCAZmiLOKKhCDLK5izfXKA)

You’ll even see an error if you try to index a property that doesn’t exist:

ts

`type I1 = Person["alve"];`

`Property 'alve' does not exist on type 'Person'.2339Property 'alve' does not exist on type 'Person'.`[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwGYME4BQAXATwAdJQAFGROAO1AF5QBvUAQwHNJUaBXAWwBGMANygarPl1CJ80AJY12o1gBs5ANykC4cFZFZ0AvsNwhQAWksBjHvkvmCJMgEkAjAwpVaAbQBEqzV8AXWEgA)

Another example of indexing with an arbitrary type is using `number` to get the type of an array’s elements. We can combine this with `typeof` to conveniently capture the element type of an array literal:

ts

`const MyArray = [`

  `{ name: "Alice", age: 15 },`

  `{ name: "Bob", age: 23 },`

  `{ name: "Eve", age: 38 },`

`];`

`type Person = typeof MyArray[number];`

       `type Person = {
    name: string;
    age: number;
}`

`type Age = typeof MyArray[number]["age"];`

     `type Age = number`

`// Or`

`type Age2 = Person["age"];`

      `type Age2 = number`

[Try](https://www.typescriptlang.org/play/#code/MYewdgzgLgBAsgTwIICcUEMEwLwwNoBQMMA3jGOgLYCmAXDAERIA2AlsNQwDQzoDmdGAEYArDAC+XIqXJVBDAEIgARt14D6AJgDMEqcTIUa9BgFEAbpx79B2gBx6CAXQDcBAlAQAHajAAK1CgQ4Dgwnj4gAGbwyGiYeGAArpTKga4EAPQZxDAAegD8Ht6+SAKh4dRRMagYCAnJqShOeAw2DOlZOQWZ2QDyKEU+MKXUmqEBQeAtbR3ZxAVAA)

You can only use types when indexing, meaning you can’t use a `const` to make a variable reference:

ts

`const key = "age";`

`type Age = Person[key];`

`Type 'key' cannot be used as an index type. 'key' refers to a value, but is being used as a type here. Did you mean 'typeof key'?2538 2749Type 'key' cannot be used as an index type. 'key' refers to a value, but is being used as a type here. Did you mean 'typeof key'?`[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwFYDMAOdB2AFgE4AoAFwE8AHSUABRkTgDtQBeUAb1AEMBzSKhYBXALYAjGAG5QLXmKGhE5aAEsW-WbwA2agG5KJcODsi82AX2mkQoALSOAxiPKP7pJ6xWgA1pEoOUAAiAUhgmypaUABBQSDGJFYAbX9KAF1pIA)

However, you can use a type alias for a similar style of refactor:

ts

`type key = "age";`

`type Age = Person[key];`

[Try](https://www.typescriptlang.org/play/#code/C4TwDgpgBAChBOBnA9gOygXigbygQwHMIAuKVAVwFsAjBAbjL0pKkWHgEtUCG8AbDgDcW1ZMj4Q86AL50AUAHoFUALRqAxuWBqVc0JCgBrCCExQARIQjn5+6AEEiZuEjQBtYyAC6dIA)
