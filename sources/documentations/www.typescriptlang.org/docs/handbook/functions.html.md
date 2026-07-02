---
title: "Handbook - Functions"
source_url: "https://www.typescriptlang.org/docs/handbook/functions.html"
crawled_at: "2026-07-02T07:44:18.977Z"
---

Functions are the fundamental building block of any application in JavaScript. They’re how you build up layers of abstraction, mimicking classes, information hiding, and modules. In TypeScript, while there are classes, namespaces, and modules, functions still play the key role in describing how to _do_ things. TypeScript also adds some new capabilities to the standard JavaScript functions to make them easier to work with.

## [](#functions)Functions

To begin, just as in JavaScript, TypeScript functions can be created both as a named function or as an anonymous function. This allows you to choose the most appropriate approach for your application, whether you’re building a list of functions in an API or a one-off function to hand off to another function.

To quickly recap what these two approaches look like in JavaScript:

ts

`// Named function`

`function add(x, y) {`

  `return x + y;`

`}`

`// Anonymous function`

`let myAdd = function (x, y) {`

  `return x + y;`

`};`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEGcBcCcEsDG0BcoBmBDANpApgFAigBymAtngCYYCuAdsvAPb0HoNOuiZVUAUADwA0oAJ4BKUAG8CoULDzRaseqEGgA1OIDcBAL4EiYAIL1WY8s1qQ6jaCzbYlocmJN9QAXjtc1Q0UkZOQUlFTUNbTE9fR0gA)

Just as in JavaScript, functions can refer to variables outside of the function body. When they do so, they’re said to _capture_ these variables. While understanding how this works (and the trade-offs when using this technique) is outside of the scope of this article, having a firm understanding how this mechanic works is an important piece of working with JavaScript and TypeScript.

ts

`let z = 100;`

`function addToZ(x, y) {`

  `return x + y + z;`

`}`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEGcBcCcEsDG0BcoBmBDANpApgFDZ7SgBeoAvKAIwAMdA3AQegK4B2y8A9h6JgAmggCo8AWgAoAHgBpQATwCUoAN4FQoWCTax+00AGpFR8swC+QA)

## [](#function-types)Function Types

### [](#typing-the-function)Typing the function

Let’s add types to our simple examples from earlier:

ts

`function add(x: number, y: number): number {`

  `return x + y;`

`}`

`let myAdd = function (x: number, y: number): number {`

  `return x + y;`

`};`

[Try](https://www.typescriptlang.org/play/#code/GYVwdgxgLglg9mABAQwCaoBQA8BciwgC2ARgKYBOANIgJ54EkUCU9RZ5iA3gFCKLmkoIckiyIA1LQDc3AL7duAG0GJCNAILpEAXkShIsBImytGVWqfYt8bCl179Bw0ROlypQA)

We can add types to each of the parameters and then to the function itself to add a return type. TypeScript can figure the return type out by looking at the return statements, so we can also optionally leave this off in many cases.

### [](#writing-the-function-type)Writing the function type

Now that we’ve typed the function, let’s write the full type of the function out by looking at each piece of the function type.

ts

`let myAdd: (x: number, y: number) => number = function (`

  `x: number,`

  `y: number`

`): number {`

  `return x + y;`

`};`

[Try](https://www.typescriptlang.org/play/#code/DYUwLgBAtgngggEwQLggCgB6oHYFcoBGIATgDQQw75HECUEAvAHwR6EmMQBmu2AxmACWAe2zoAUBAhZW1EqUkUq7YuNrKaEAN6Li4XMTEYIAagoBucQF9zQA)

A function’s type has the same two parts: the type of the arguments and the return type. When writing out the whole function type, both parts are required. We write out the parameter types just like a parameter list, giving each parameter a name and a type. This name is just to help with readability. We could have instead written:

ts

`let myAdd: (baseValue: number, increment: number) => number = function (`

  `x: number,`

  `y: number`

`): number {`

  `return x + y;`

`};`

[Try](https://www.typescriptlang.org/play/#code/DYUwLgBAtgngggEwQLggCgEYEMDOIBqWwAriKgHbFQYgBOANBAJbkDGtIUI5YFVNtAJQQAvAD4IlanVEQAZsTZgmAe3LoAUBAgAPPtIZaIMfQI2DTMgN5GOYYrXU6IAamMBuDQF93QA)

As long as the parameter types line up, it’s considered a valid type for the function, regardless of the names you give the parameters in the function type.

The second part is the return type. We make it clear which is the return type by using an arrow (`=>`) between the parameters and the return type. As mentioned before, this is a required part of the function type, so if the function doesn’t return a value, you would use `void` instead of leaving it off.

Of note, only the parameters and the return type make up the function type. Captured variables are not reflected in the type. In effect, captured variables are part of the “hidden state” of any function and do not make up its API.

### [](#inferring-the-types)Inferring the types

In playing with the example, you may notice that the TypeScript compiler can figure out the type even if you only have types on one side of the equation:

ts

`// The parameters 'x' and 'y' have the type number`

`let myAdd = function (x: number, y: number): number {`

  `return x + y;`

`};`

`// myAdd has the full function type`

`let myAdd2: (baseValue: number, increment: number) => number = function (x, y) {`

  `return x + y;`

`};`

[Try](https://www.typescriptlang.org/play/#code/PTAEBUAsFNQBwIYCcEFtoBdpIM6gOQAe+oCAdgCYECeJkCAbrBjKBtXLGQK6oBG2AFAAbTKFTUAghSoBeUADNuZAMYYAlgHsyoABSEAXKB79sAGlDUjJgUgCU13rdABvQaFBJM3JDsKgAaksAbkEAX1DBEHEpGVB6PBZYJWFhRWU1LR12ThExCWkKACYjXT4EHGgANQRhbmhHUyQLdVUvdDIMRts7UFkAPmMnbD701Q1tPUILal63Dy8MHz9AkPDgoA)

This is called “contextual typing”, a form of type inference. This helps cut down on the amount of effort to keep your program typed.

## [](#optional-and-default-parameters)Optional and Default Parameters

In TypeScript, every parameter is assumed to be required by the function. This doesn’t mean that it can’t be given `null` or `undefined`, but rather, when the function is called, the compiler will check that the user has provided a value for each parameter. The compiler also assumes that these parameters are the only parameters that will be passed to the function. In short, the number of arguments given to a function has to match the number of parameters the function expects.

ts

`function buildName(firstName: string, lastName: string) {`

  `return firstName + " " + lastName;`

`}`

`let result1 = buildName("Bob"); // error, too few parameters`

`Expected 2 arguments, but got 1.2554Expected 2 arguments, but got 1.  let result2 = buildName("Bob", "Adams", "Sr."); // error, too many parameters  Expected 2 arguments, but got 3.2554Expected 2 arguments, but got 3.  let result3 = buildName("Bob", "Adams"); // ah, just right  `[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwFYMBYBQAzAVwDsBjAFwEs5jQAjQygGwBMA5AQwFtIAKfSknKceqROWiViAcwA0oJh3EjIYiVOkBKUAG9coUNEjlC0WgKErQAalAAiezYVLh3SAG5cAX1y4mxw0hEQiZyAEZQAF56RlYVXjsAITg6O013UBBQGHhoeXI4OFB8SAB3UAAHDmg3chhEPwCjYNC0KJjmdjcE5NT5OwBBFm5EO36AZWgAOjSMrJyEfMLQLg5iAE9K6tr6xvJAlvIAZnaGTviklLH7IZHZzLAOAAt5ACtCcUNKaSfyIA)

In JavaScript, every parameter is optional, and users may leave them off as they see fit. When they do, their value is `undefined`. We can get this functionality in TypeScript by adding a `?` to the end of parameters we want to be optional. For example, let’s say we want the last name parameter from above to be optional:

ts

`function buildName(firstName: string, lastName?: string) {`

  `if (lastName) return firstName + " " + lastName;`

  `else return firstName;`

`}`

`let result1 = buildName("Bob"); // works correctly now`

`let result2 = buildName("Bob", "Adams", "Sr."); // error, too many parameters`

`Expected 1-2 arguments, but got 3.2554Expected 1-2 arguments, but got 3.  let result3 = buildName("Bob", "Adams"); // ah, just right  `[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwFYMBYBQAzAVwDsBjAFwEs5jQAjQygGwBMA5AQwFtIAKfSknKceqROWiViAcwA0oJh3EjIAfjESp0gJSgA3rlChK+UL0XLukXdEjlC0WgKErQAalAAiL+4VLhVgDchqCQTIiQoLb2jqDOljzBAL64uEx2UZCIhEzkAIygALz0jKwqvJ4AQnB0ntqBoCCgAO4IANaIoKQIthRMAJ6gxHDNaRm22bloRSXM7FYV1bXyngCCLNyInisAytAAdHUNTTDw0PLkcHCgXBzEgwAOHNBW5DCIY+SZk+QAzDMMOblKo1bZedabI6NMAcAAW8gAVoRxFFKNJYeQgA)

Any optional parameters must follow required parameters. Had we wanted to make the first name optional, rather than the last name, we would need to change the order of parameters in the function, putting the first name last in the list.

In TypeScript, we can also set a value that a parameter will be assigned if the user does not provide one, or if the user passes `undefined` in its place. These are called default-initialized parameters. Let’s take the previous example and default the last name to `"Smith"`.

ts

`function buildName(firstName: string, lastName = "Smith") {`

  `return firstName + " " + lastName;`

`}`

`let result1 = buildName("Bob"); // works correctly now, returns "Bob Smith"`

`let result2 = buildName("Bob", undefined); // still works, also returns "Bob Smith"`

`let result3 = buildName("Bob", "Adams", "Sr."); // error, too many parameters`

`Expected 1-2 arguments, but got 3.2554Expected 1-2 arguments, but got 3.  let result4 = buildName("Bob", "Adams"); // ah, just right  `[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwFYMBYBQAzAVwDsBjAFwEs5jQAjQygGwBMA5AQwFtIAKfSknKceqROWiViAcwA0oJh3EjIoALygARAGUulcgAtNASlABvXKFDRI5QtFoChK0AGotH94uXdIAblwAX1xcJltrSERCJnIARnV6RlYVXk0AITg6Ez9QEFAAdwQAa0RQUgQbCiYAT1BiOHz5GzsHUvTM0F19I1DwmyiYtASGZnZfVIys+RIWSAFiSBZjHLzxZiYC4sR5DiZEOAiW4jbJzr1DTV7yCIHyAGZhpLGeCczNeU0AQRZuRHetbTQAB02VyYBg8Gg8nIcAOXA4xFqAAcONBfOQYIgrjdouRsI9Ril2lMtN9fqC8hwDPIAFaEcTWSjSAzkIA)

Default-initialized parameters that come after all required parameters are treated as optional, and just like optional parameters, can be omitted when calling their respective function. This means optional parameters and trailing default parameters will share commonality in their types, so both

ts

`function buildName(firstName: string, lastName?: string) {`

  `// ...`

`}`

and

ts

`function buildName(firstName: string, lastName = "Smith") {`

  `// ...`

`}`

share the same type `(firstName: string, lastName?: string) => string`. The default value of `lastName` disappears in the type, only leaving behind the fact that the parameter is optional.

Unlike plain optional parameters, default-initialized parameters don’t _need_ to occur after required parameters. If a default-initialized parameter comes before a required parameter, users need to explicitly pass `undefined` to get the default initialized value. For example, we could write our last example with only a default initializer on `firstName`:

ts

`function buildName(firstName = "Will", lastName: string) {`

  `return firstName + " " + lastName;`

`}`

`let result1 = buildName("Bob"); // error, too few parameters`

`Expected 2 arguments, but got 1.2554Expected 2 arguments, but got 1.  let result2 = buildName("Bob", "Adams", "Sr."); // error, too many parameters  Expected 2 arguments, but got 3.2554Expected 2 arguments, but got 3.  let result3 = buildName("Bob", "Adams"); // okay and returns "Bob Adams"  let result4 = buildName(undefined, "Adams"); // okay and returns "Will Adams"  `[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwFYMBYBQAzAVwDsBjAFwEs5jQAjQygGwBMA5AQwFtIAKfSknKceoALygARAHVmTSQBpQTDomHdIqNdErEA5gEpQAb1yhQ0SOULRaAoSMigA1FLeuVaxwG5cAX1xcJisLSERCJnIARnF6RlZHXkkAITg6SQNvUBBQGHhoJXI4OFB8SAB3UAAHDmgNchhEIJDLcMi0WIZmdg0k1PSlSQBBFm5ERSkAZWgAOgysnLyEQuLQLg5iAE9q2vrG5vJQtvIAZk74np4+tInh0a5xzOywOABrDm2NllDrW0QpfqgEZjSQHI4RcjYc7dRIkFiQATESAsQbAh7zZ6gN4fUBfH42Yj-GRyIH3cZAA)

### [](#rest-parameters)Rest Parameters

Required, optional, and default parameters all have one thing in common: they talk about one parameter at a time. Sometimes, you want to work with multiple parameters as a group, or you may not know how many parameters a function will ultimately take. In JavaScript, you can work with the arguments directly using the `arguments` variable that is visible inside every function body.

In TypeScript, you can gather these arguments together into a variable:

ts

`function buildName(firstName: string, ...restOfName: string[]) {`

  `return firstName + " " + restOfName.join(" ");`

`}`

`// employeeName will be "Joseph Samuel Lucas MacKinzie"`

`let employeeName = buildName("Joseph", "Samuel", "Lucas", "MacKinzie");`

[Try](https://www.typescriptlang.org/play/#code/GYVwdgxgLglg9mABAIxDANgEwHIEMC2ApgBTAwBOAzlHkQFyLXkxgDmANIgHQ-mHUB5YLUIMmLVgG0AugEpEAbwBQiRHyghySMlRoFCiANSIARKaNr+UISK4ArOC2JmTsgNxKAvkqUB6X4iE+AAO6HAAnoSEIogA7hjoKAYmAFJwlITBABaIAMoEIISJADIgELiUiACyuBAA0iwAXjCEJkrohFCBIWGR0fqIALwoaFgizmkZ2SacJvn4hegzpqXllMsmNfVNLa5uQA)

_Rest parameters_ are treated as a boundless number of optional parameters. When passing arguments for a rest parameter, you can use as many as you want; you can even pass none. The compiler will build an array of the arguments passed in with the name given after the ellipsis (`...`), allowing you to use it in your function.

The ellipsis is also used in the type of the function with rest parameters:

ts

`function buildName(firstName: string, ...restOfName: string[]) {`

  `return firstName + " " + restOfName.join(" ");`

`}`

`let buildNameFun: (fname: string, ...rest: string[]) => string = buildName;`

[Try](https://www.typescriptlang.org/play/#code/GYVwdgxgLglg9mABAIxDANgEwHIEMC2ApgBTAwBOAzlHkQFyLXkxgDmANIgHQ-mHUB5YLUIMmLVgG0AugEpEAbwBQiRHyghySMlRoFCiANSIARKaNr+UISK4ArOC2JmTsgNxKAvkqXpCUFDQsEQAxcAZSMH0xKGY2Th4uPmoYuKk5RABeAD5GWIkswIwcfTcgA)

## [](#this)`this`

Learning how to use `this` in JavaScript is something of a rite of passage. Since TypeScript is a superset of JavaScript, TypeScript developers also need to learn how to use `this` and how to spot when it’s not being used correctly. Fortunately, TypeScript lets you catch incorrect uses of `this` with a couple of techniques. If you need to learn how `this` works in JavaScript, though, first read Yehuda Katz’s [Understanding JavaScript Function Invocation and “this”](http://yehudakatz.com/2011/08/11/understanding-javascript-function-invocation-and-this/). Yehuda’s article explains the inner workings of `this` very well, so we’ll just cover the basics here.

### [](#this-and-arrow-functions)`this` and arrow functions

In JavaScript, `this` is a variable that’s set when a function is called. This makes it a very powerful and flexible feature, but it comes at the cost of always having to know about the context that a function is executing in. This is notoriously confusing, especially when returning a function or passing a function as an argument.

Let’s look at an example:

ts

`let deck = {`

  `suits: ["hearts", "spades", "clubs", "diamonds"],`

  `cards: Array(52),`

  `createCardPicker: function () {`

    `return function () {`

      `let pickedCard = Math.floor(Math.random() * 52);`

      `let pickedSuit = Math.floor(pickedCard / 13);`

      `return { suit: this.suits[pickedSuit], card: pickedCard % 13 };`

    `};`

  `},`

`};`

`let cardPicker = deck.createCardPicker();`

`let pickedCard = cardPicker();`

`alert("card: " + pickedCard.card + " of " + pickedCard.suit);`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEGcBcCcEsDG0BcoBmBDANpApgFDZ7SgAmeiA1qALygDeBookArvNJGgNoBEACzyZYXPgBpQfSAAdMFSBKmJsbAEaLJfMvEwBbAPYA7MooC645qEQjTaAIKxYmAJ4AKAKwAmAJSWWiLDC0HgAwrYACkhUeLBo6GxGyPDGoG4+jFYsQdBssEYYicmp6Zks5aDEpDLReGThsGR0oACymNACAHTo2AYGsG5tHZ3OJgZ6pQBUoN4+ANxZ5VWgNdR1AMocpPRDXT19A6sx9bagYACMAMzzBIvZJHkFDKxbaB3wkJ3snJA8RxtbCzWWxof4nRqgACkoCuoAAvgsKgirHDLMiiCRgY0omtYM0KNROoFgmFIrUBjdlmCGk16DZseT0gsCDhYtA3Hx6WQ0HxQABqFa1cFkImnAW8gzoKT8wVrYVfLbzIA)

Notice that `createCardPicker` is a function that itself returns a function. If we tried to run the example, we would get an error instead of the expected alert box. This is because the `this` being used in the function created by `createCardPicker` will be set to `window` instead of our `deck` object. That’s because we call `cardPicker()` on its own. A top-level non-method syntax call like this will use `window` for `this`. (Note: under strict mode, `this` will be `undefined` rather than `window`).

We can fix this by making sure the function is bound to the correct `this` before we return the function to be used later. This way, regardless of how it’s later used, it will still be able to see the original `deck` object. To do this, we change the function expression to use the ECMAScript 6 arrow syntax. Arrow functions capture the `this` where the function is created rather than where it is invoked:

ts

`let deck = {`

  `suits: ["hearts", "spades", "clubs", "diamonds"],`

  `cards: Array(52),`

  `createCardPicker: function () {`

    `// NOTE: the line below is now an arrow function, allowing us to capture 'this' right here`

    `return () => {`

      `let pickedCard = Math.floor(Math.random() * 52);`

      `let pickedSuit = Math.floor(pickedCard / 13);`

      `return { suit: this.suits[pickedSuit], card: pickedCard % 13 };`

    `};`

  `},`

`};`

`let cardPicker = deck.createCardPicker();`

`let pickedCard = cardPicker();`

`alert("card: " + pickedCard.card + " of " + pickedCard.suit);`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEGcBcCcEsDG0BcoBmBDANpApgFDZ7SgAmeiA1qALygDeBookArvNJGgNoBEACzyZYXPgBpQfSAAdMFSBKmJsbAEaLJfMvEwBbAPYA7MooC645qEQjTaAIKxYmAJ4AKAKwAmAJSWWiLDC0HgAwrYACkhUeLBo6GxGyPDGoG4+jFYsIKAAcgDyACoAomjQQqDY8EZ4oGp42AYA7qDwkKBGzaCYRt1OXQlJ0ClGkjiNTdUA5qBs7dAG1pgy0GxBoADk5W0boAhTAqRCQVl7JGu96XQAfJks95UkoDLReGThsGR0oACymOUAOnQjQMsDcf0BzhMBj0VwAVKBvD4ANynFjEUgvahvADKHFI9AhAiBILBWJi71soDAAEYAMwoghos6rWC9BisfFlARtAHsTiQHjk3H4ixLT5oYWUz6gACkoHpoAAvqiHiqrErLOqiE8bJ8otjYN8KNQAYFgmFIq8wYyMc9XtKvvQ9WQDTEbaiCDhYtA3HwXWg+KAANT27GOs1U0NBgzoKQhsMUj5kPn4lFAA)

Even better, TypeScript will warn you when you make this mistake if you pass the [`noImplicitThis`](https://www.typescriptlang.org/tsconfig#noImplicitThis) flag to the compiler. It will point out that `this` in `this.suits[pickedSuit]` is of type `any`.

### [](#this-parameters)`this` parameters

Unfortunately, the type of `this.suits[pickedSuit]` is still `any`. That’s because `this` comes from the function expression inside the object literal. To fix this, you can provide an explicit `this` parameter. `this` parameters are fake parameters that come first in the parameter list of a function:

ts

`function f(this: void) {`

  `// make sure `this` is unusable in this standalone function`

`}`

Let’s add a couple of interfaces to our example above, `Card` and `Deck`, to make the types clearer and easier to reuse:

ts

`interface Card {`

  `suit: string;`

  `card: number;`

`}`

`interface Deck {`

  `suits: string[];`

  `cards: number[];`

  `createCardPicker(this: Deck): () => Card;`

`}`

`let deck: Deck = {`

  `suits: ["hearts", "spades", "clubs", "diamonds"],`

  `cards: Array(52),`

  `// NOTE: The function now explicitly specifies that its callee must be of type Deck`

  `createCardPicker: function (this: Deck) {`

    `return () => {`

      `let pickedCard = Math.floor(Math.random() * 52);`

      `let pickedSuit = Math.floor(pickedCard / 13);`

      `return { suit: this.suits[pickedSuit], card: pickedCard % 13 };`

    `};`

  `},`

`};`

`let cardPicker = deck.createCardPicker();`

`let pickedCard = cardPicker();`

`alert("card: " + pickedCard.card + " of " + pickedCard.suit);`

[Try](https://www.typescriptlang.org/play/#code/JYOwLgpgTgZghgYwgAgMJygE2QbwFDLIDOArsGAFzFhSgDmA3AcghplSCQLYBG0TAXzx5QkWIhQARCAgDWuZqXJEqRGvQDaAXSaFWWFck69o23SygQ4kdFgAKwOdAAUYABbBD0uQEoqzn2QAXgA+NDZBYQAbCDBkTBlZKm95IIVCJTBDDQAiNysoLJyAGmQcogAHOASiErKEKJIeWtKczGA4LgB7EExarWLmfT6qAEEoKDgAT2cAVgAmH0HCAHoV5AA5AHkAFQBRKh385BgSEAQwYB6jLoB3ZAgADwqox3IoqeIKmWAYYAgiMh3NZkMoWHAojEUFwSGpkHxkF0YECpt9kCkhpZrBBbJgHE4oFRTudLtdXB4vIlAvhCIRLGASFAQMgAsEwjTaYQYnEKo5ZBBMLjgsgALLWNwAOhgUS6XSgzjF7glk16XS4rIAVMgFj5zJzucheU5MABlMhxNKKyXS2Xyo38wVsZDrACMAGZdcJOXTYozmThiOaqO5PBLMkQNPaBWbyANwVgqFHHVhkABSZDu5ACPVZ8wCQbZ6KxeN4vnQYUJOQShBYmxsfH8+Weg1JoVpYYNlyevAQ6BgZw5YZUHLIADUhrLycw1ad45HSLKY4nxtxYfNuqAA)

Now TypeScript knows that `createCardPicker` expects to be called on a `Deck` object. That means that `this` is of type `Deck` now, not `any`, so [`noImplicitThis`](https://www.typescriptlang.org/tsconfig#noImplicitThis) will not cause any errors.

#### [](#this-parameters-in-callbacks)`this` parameters in callbacks

You can also run into errors with `this` in callbacks, when you pass functions to a library that will later call them. Because the library that calls your callback will call it like a normal function, `this` will be `undefined`. With some work you can use `this` parameters to prevent errors with callbacks too. First, the library author needs to annotate the callback type with `this`:

ts

`interface UIElement {`

  `addClickListener(onclick: (this: void, e: Event) => void): void;`

`}`

[Try](https://www.typescriptlang.org/play/#code/JYOwLgpgTgZghgYwgAgKoEkCiAbCBbCcZAbwChlk4ATKgYW2AQGsAZYAZ0hGgAoB7EAgbMAXMh5gAFhzEA3PsCoAaZBDGZZhMAEpkAXgB8yeYu1yFVANykAvkA)

`this: void` means that `addClickListener` expects `onclick` to be a function that does not require a `this` type. Second, annotate your calling code with `this`:

ts

`class Handler {`

  `info: string;`

  `onClickBad(this: Handler, e: Event) {`

    `// oops, used `this` here. using this callback would crash at runtime`

    `this.info = e.message;`

  `}`

`}`

`let h = new Handler();`

`uiElement.addClickListener(h.onClickBad); // error!`

`Argument of type '(this: Handler, e: Event) => void' is not assignable to parameter of type '(this: void, e: Event) => void'.   The 'this' types of each signature are incompatible.     Type 'void' is not assignable to type 'Handler'.2345Argument of type '(this: Handler, e: Event) => void' is not assignable to parameter of type '(this: void, e: Event) => void'.   The 'this' types of each signature are incompatible.     Type 'void' is not assignable to type 'Handler'.`[Try](https://www.typescriptlang.org/play/#code/PTAEAEGcBcCcEsDG0BcoBmBDANpApgFAgR6ywD2skaATAMwAsArAfAHbSlaJ6gCqASQCi2PAFs8HUAG8CoUJgAmigMLYkAawAy8GJNIAKcm0TrEGtAegALXWgBu5eIoA0oPGiH3J0AJSgAXgA+UEdnXwcnRQBuAgBfVg4uTB5QLx8ZOVAJSEhMAHMPUBgENnzYhMU8U0xYXkRjGFAAV3gRcR80QXaJDljiAFohxGboIYGCGtzQAAlMNkVRWEz5dnRyNBL2cqzjNU0AISUrW2pZ+cXSNyL0jn9ZeXlicnIAB0g3ZvxFUAADG10v1A1lIeAAdC1INtQADIKBEDhsAAjFIaUAAd3IzWwP0QsEwkGsCmgoFgzQ48AkWXksLBa3IgXcYJyeUKsXkCQSBFEJKJAVAbDw6POCyWBl8sVaPR8YKUqjM2l0nEFsAM1jBewVR0UEtAxFIFFgAEIgA)

With `this` annotated, you make it explicit that `onClickBad` must be called on an instance of `Handler`. Then TypeScript will detect that `addClickListener` requires a function that has `this: void`. To fix the error, change the type of `this`:

ts

`class Handler {`

  `info: string;`

  `onClickGood(this: void, e: Event) {`

    `// can't use `this` here because it's of type void!`

    `console.log("clicked!");`

  `}`

`}`

`let h = new Handler();`

`uiElement.addClickListener(h.onClickGood);`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEGcBcCcEsDG0BcoBmBDANpApgFDwB20esWieoAqgJICi2eAtnqaAN4GiiYAm-AMLYkAawAy8GO3IAKAPbFEoxGLRzoAC2loAbgvj8ANKDxoGe9tACUoALwA+UAaM39h-gG4CAXyKk5JTUltZcPKBskJCYAObmoDAIxLE+-vx4Kpiw1IhKMKAArvBMrNZo9KVspD4goAC0jYiF0I31BFnRoAASmMT8zLDhvCToCmhJJKkRSiLiAOIKCvyaOpAeRqYJoaR23Ly8dYh9AOTQRfigAAba0legWuTUAEaZmIWX8NAnkKAK6KBoABPAAO1Fc-AAhBFeHliJAFMwAHTYBSxOQAIhU4jwUIxNh8vH8-gIzHOWgcoGIeAA7j0+gN5ASCMUqtYkQJhKpJNIyNTYHItEjZtzFssCUA)

Because `onClickGood` specifies its `this` type as `void`, it is legal to pass to `addClickListener`. Of course, this also means that it can’t use `this.info`. If you want both then you’ll have to use an arrow function:

ts

`class Handler {`

  `info: string;`

  `onClickGood = (e: Event) => {`

    `this.info = e.message;`

  `};`

`}`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEGcBcCcEsDG0BcoBmBDANpApgFDwB20esWieoAqgJICi2eAtnqaAN4GiiYAm-AMLYkAawAy8GO3IAKAPbFEoxGLRzoAC2loAbgvj8ANKDxoGe9tACUoALwA+UAaM39h-gG4CAXyKk5JTUltZcPKBskJCYAObmoDAIxLE+-vx4Kpiw1IhKMKAArvBMrNZo9KVspD4goAC0jYiF0I31BFnRoAASmMT8zLDhvCToCmhJJKkRSiLiAOIKCvwOoHIJoaR2TsO8oNrSAHSjCqt4h1Ex8T68vmlAA)

This works because arrow functions use the outer `this`, so you can always pass them to something that expects `this: void`. The downside is that one arrow function is created per object of type Handler. Methods, on the other hand, are only created once and attached to Handler’s prototype. They are shared between all objects of type Handler.

## [](#overloads)Overloads

JavaScript is inherently a very dynamic language. It’s not uncommon for a single JavaScript function to return different types of objects based on the shape of the arguments passed in.

ts

`let suits = ["hearts", "spades", "clubs", "diamonds"];`

`function pickCard(x: any): any {`

  `// Check to see if we're working with an object/array`

  `// if so, they gave us the deck and we'll pick the card`

  `if (typeof x == "object") {`

    `let pickedCard = Math.floor(Math.random() * x.length);`

    `return pickedCard;`

  `}`

  `// Otherwise just let them pick the card`

  `else if (typeof x == "number") {`

    `let pickedSuit = Math.floor(x / 13);`

    `return { suit: suits[pickedSuit], card: x % 13 };`

  `}`

`}`

`let myDeck = [`

  `{ suit: "diamonds", card: 2 },`

  `{ suit: "spades", card: 10 },`

  `{ suit: "hearts", card: 4 },`

`];`

`let pickedCard1 = myDeck[pickCard(myDeck)];`

`alert("card: " + pickedCard1.card + " of " + pickedCard1.suit);`

`let pickedCard2 = pickCard(15);`

`alert("card: " + pickedCard2.card + " of " + pickedCard2.suit);`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEGcBcCcEsDG0BcoBmBDANpApgFDZ7SiQCu80koAvKANoBEAFnprNUwDShOQAHTABM8kHn0TZyAI3G8mw+JgC2AewB2w8QF0A3AQLpyG5PE2gBSANYBhDsIAUADzSYNATwCUbz6ADeBKCgIKC2bIjWoNBqZHh4oPDooADueADksAkparDW8BoA5qlULKDuoGoyAFZ4yMAcsJgeQSFgSWRqvNBsHqCFmABuCeQ0PQmikeVaqRnY2JY20WygiA6tHY7QHgJ4asnOdPRMVbXITF4BrcHEpFaReML2sMJ0oACymD0AdOjYarlHJ8fk0tGoVI5LgAqUDOb7EIo9LwGYLBLLQciwDSLB5PBwo0AAX1aoQA8uNYCl4PhQNVRqRbss8CocVFxqt1sE8LgEpttrt9rCjnwNOQVDI8LALldUaBGfdrI8AMqUUj0YEsX7-QGHMAARgAzMjrqB0Zjsf4yKq0BQqJAGArlaqdLw1i80IcAKSgQ1EgnE4lEEigFQeAAidSi9AYrUtttQfCUqk02gkbuEaAATETuLGrVQ0PwhKJ5Bz3T6AAw5vPxwtsDhcV0ONAAFmr+kM8psj2ewj1b1DEciDpsvccg8jXg7OEl0EcTHThdAAGpWT2HHrvumV3xKskmDvHXiXpv48ag3du8fhNn6Aqx3qAKzGmeceeL3ero+9zNbhw7g9BQPL8rx-b4zz0IA)

Here, the `pickCard` function will return two different things based on what the user has passed in. If the users passes in an object that represents the deck, the function will pick the card. If the user picks the card, we tell them which card they’ve picked. But how do we describe this to the type system?

The answer is to supply multiple function types for the same function as a list of overloads. This list is what the compiler will use to resolve function calls. Let’s create a list of overloads that describe what our `pickCard` accepts and what it returns.

ts

`let suits = ["hearts", "spades", "clubs", "diamonds"];`

`function pickCard(x: { suit: string; card: number }[]): number;`

`function pickCard(x: number): { suit: string; card: number };`

`function pickCard(x: any): any {`

  `// Check to see if we're working with an object/array`

  `// if so, they gave us the deck and we'll pick the card`

  `if (typeof x == "object") {`

    `let pickedCard = Math.floor(Math.random() * x.length);`

    `return pickedCard;`

  `}`

  `// Otherwise just let them pick the card`

  `else if (typeof x == "number") {`

    `let pickedSuit = Math.floor(x / 13);`

    `return { suit: suits[pickedSuit], card: x % 13 };`

  `}`

`}`

`let myDeck = [`

  `{ suit: "diamonds", card: 2 },`

  `{ suit: "spades", card: 10 },`

  `{ suit: "hearts", card: 4 },`

`];`

`let pickedCard1 = myDeck[pickCard(myDeck)];`

`alert("card: " + pickedCard1.card + " of " + pickedCard1.suit);`

`let pickedCard2 = pickCard(15);`

`alert("card: " + pickedCard2.card + " of " + pickedCard2.suit);`

[Try](https://www.typescriptlang.org/play/#code/DYUwLgBAzgrglmKEC8EDaAiAFiAhgJ0QwBoIMoAHXAExChLIGNgYAje0jauXAWwHsAdtXoBdANwAoSQDMYgxmDhCIFOIwDWAYQLUAFAA8AXBADe0eGBNQw+OIIDm4iI10nBMXqxD4IAXzRRAEp3T298KTkFJRU1TR18fWMIDy8fELMLBGtbeycXNxSwn39I+UVlQVV1bV1DE1xBAE8MxqazSQgIAHpuiC0cTQgwfmgQEAg4GQgAdxAAcnwJmf58DTzZhCwIRoh+VgArEEVugnxcJs6evqnoflIwHHaHXAA3CZgkR4naIcbqWYLYDAapDb4FRJXW56MBNCggfjTAwoVAYfZHRQYIIdLpdUCQOIaEDUBIA1AAWVwjwAdDJgPxVnpKTTzsJ+Lw9NiAFQQAzU0COR5BKS4iBLMAwfBVQnE0ki-xXXoQADy33wMzgUAmB0+kHxwxwvFBGgNE1ckK6IGAWsm0xhcIRSJRZFS4SxONx+pl1AAypYUBBmVhafTGci+gBGADMwquXXFkqq5lg2SyiDQ3r9CFEpHN1BMyIApBBo6Urn5JBXJPreE0ACLHE2oNBXZOWExcHgCYQcCH5iAAJn8xFbaY7lBodAYeZMEYADMPRymrGQcAQiLnCgAWRcSaRemqy3QRgO1huaDM1Ul6M+NoJ73CgQh6DAzsgQADUxqPiQj1Lzn7voi75ft6pJ-susbVuA34kroQ6oIS14RgArLGj4+GAL5vhggFgfB-66IBuHAbhoGHnBiQDtSkHiEAA)

With this change, the overloads now give us type checked calls to the `pickCard` function.

In order for the compiler to pick the correct type check, it follows a similar process to the underlying JavaScript. It looks at the overload list and, proceeding with the first overload, attempts to call the function with the provided parameters. If it finds a match, it picks this overload as the correct overload. For this reason, it’s customary to order overloads from most specific to least specific.

Note that the `function pickCard(x): any` piece is not part of the overload list, so it only has two overloads: one that takes an object and one that takes a number. Calling `pickCard` with any other parameter types would cause an error.
