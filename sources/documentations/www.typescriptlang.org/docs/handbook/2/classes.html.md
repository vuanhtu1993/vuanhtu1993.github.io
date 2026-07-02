---
title: "Documentation - Classes"
source_url: "https://www.typescriptlang.org/docs/handbook/2/classes.html"
crawled_at: "2026-07-02T07:37:24.659Z"
---

> Background Reading:  
> [Classes (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)

TypeScript offers full support for the `class` keyword introduced in ES2015.

As with other JavaScript language features, TypeScript adds type annotations and other syntax to allow you to express relationships between classes and other types.

## [](#class-members)Class Members

Here’s the most basic class - an empty one:

ts

`class Point {}`

[Try](https://www.typescriptlang.org/play/#code/MYGwhgzhAEAKD2BLAdgF2gbwL5A)

This class isn’t very useful yet, so let’s start adding some members.

### [](#fields)Fields

A field declaration creates a public writeable property on a class:

ts

`class Point {`

  `x: number;`

  `y: number;`

`}`

`const pt = new Point();`

`pt.x = 0;`

`pt.y = 0;`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEGcBcCcEsDG0AKsD2AHApraBPASQDt5p4BDAG3gC8Lz1iAuUAM2smwFgAoRKhUiRQKdPGLRQAbz6hQAD1bEArgFsARrgDcc0PmXqtsXbwC+fPoiYxQmKQF5QxbAHdR4yQAoAlKfsAdAqgTgAM-tAB+CGg4UA)

As with other locations, the type annotation is optional, but will be an implicit `any` if not specified.

Fields can also have _initializers_; these will run automatically when the class is instantiated:

ts

`class Point {`

  `x = 0;`

  `y = 0;`

`}`

`const pt = new Point();`

`// Prints 0, 0`

`console.log(`${pt.x}, ${pt.y}`);`

[Try](https://www.typescriptlang.org/play/#code/MYGwhgzhAEAKD2BLAdgF2gbwLAChrQA9oBeaABgG5d8BPE8qnAX112HmQnQAd1TkApgHc4SNAAoAlIwD0MuACcUqGGQA05NhwjwQAgHQh4Ac3EADACQZe+gkw1WbNJmelA)

Just like with `const`, `let`, and `var`, the initializer of a class property will be used to infer its type:

ts

`const pt = new Point();`

`pt.x = "0";`

`Type 'string' is not assignable to type 'number'.2322Type 'string' is not assignable to type 'number'.`[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwGY1oLACgBjAGwENFFQAFOASwDsAXUAb31FAA9QBeUABgDcbUAE8e-IXgC++EKAC0iggFcGi+fgJw6iJgAcmvOpADuVWowAUASkkGAdF14AiPs4FA)

#### [](#--strictpropertyinitialization)`--strictPropertyInitialization`

The [`strictPropertyInitialization`](https://www.typescriptlang.org/tsconfig#strictPropertyInitialization) setting controls whether class fields need to be initialized in the constructor.

ts

`class BadGreeter {`

  `name: string;`

`Property 'name' has no initializer and is not definitely assigned in the constructor.2564Property 'name' has no initializer and is not definitely assigned in the constructor.  }  `[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwFYBsAWAsAFADGANgIaKKgBCZAJgOLSSQAuMoA3oaKAHZkAtpFSJW0AJZ8A5gG5CAXyA)

ts

`class GoodGreeter {`

  `name: string;`

  `constructor() {`

    `this.name = "hello";`

  `}`

`}`

[Try](https://www.typescriptlang.org/play/#code/MYGwhgzhAEDiD28AmsBOBTdAXdroG8BYAKGmgDswBbdALmgi1QEtyBzAbhJLOHnMaoArsCzxUACgCUBHmWhYAFswgA6SjWgBeaACJF6ECHi6upaAF8SFoA)

Note that the field needs to be initialized _in the constructor itself_. TypeScript does not analyze methods you invoke from the constructor to detect initializations, because a derived class might override those methods and fail to initialize the members.

If you intend to definitely initialize a field through means other than the constructor (for example, maybe an external library is filling in part of your class for you), you can use the _definite assignment assertion operator_, `!`:

ts

`class OKGreeter {`

  `// Not initialized, but no error`

  `name!: string;`

`}`

[Try](https://www.typescriptlang.org/play/#code/MYGwhgzhAEDyDSBxATgU1QF1c6BvAsAFDTQD0p0AcgPYbQCWAdvRvWCPQF6oAmANNABGAVzqNq0bMmrIiJRmAC2qAIQAuaBAzImAcwDcRAL5A)

### [](#readonly)`readonly`

Fields may be prefixed with the `readonly` modifier. This prevents assignments to the field outside of the constructor.

ts

`class Greeter {`

  `readonly name: string = "world";`

  `constructor(otherName?: string) {`

    `if (otherName !== undefined) {`

      `this.name = otherName;`

    `}`

  `}`

  `err() {`

    `this.name = "not ok";`

`Cannot assign to 'name' because it is a read-only property.2540Cannot assign to 'name' because it is a read-only property.    }  }  const g = new Greeter();  g.name = "also not ok";  Cannot assign to 'name' because it is a read-only property.2540Cannot assign to 'name' because it is a read-only property.`[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwFYAsAGd2cBYAKAGMAbAQ0UVAHFpJIAXGUAbxNFEcoBM4AO3IBPUIMoBbSKkTNoAS0EBzUAF5QAIgDuCcn00BuEl1Ckhc6AFdSzBAAo4zABYwAclMgB+WfKXKASg5TbgUAM1BHF3dPUABCNQ0rQT5IMKVIPiDOYm480BcFRAA6CWl1UCdXaA9pY1y8gF9TZuJTGGh7bJCC5yLS2I1NQSdKgGsjFpJW80E5UFUNQUhtekYWGC765QHyocpyRDhxUbgJwyA)

### [](#constructors)Constructors

> Background Reading:  
> [Constructor (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/constructor)  

Class constructors are very similar to functions. You can add parameters with type annotations, default values, and overloads:

ts

`class Point {`

  `x: number;`

  `y: number;`

  `// Normal signature with defaults`

  `constructor(x = 0, y = 0) {`

    `this.x = x;`

    `this.y = y;`

  `}`

`}`

[Try](https://www.typescriptlang.org/play/#code/MYGwhgzhAEAKD2BLAdgF2gbwLAChrQA8AuaZAVwFsAjAUwCcBuXfATxPOvqZ2egHo+0AHLw6FMCGgREAc2RhUZOjWgB3RKgAW0ACY0AZmDIhUEXsHjIIqOmWCpRACgLQAvNAAMAGmgs3ngEpMXnwtRAgAOhd3Am58UM1wiL93FjjoAF9cDKA)

ts

`class Point {`

  `x: number = 0;`

  `y: number = 0;`

  `// Constructor overloads`

  `constructor(x: number, y: number);`

  `constructor(xy: string);`

  `constructor(x: string | number, y: number = 0) {`

    `// Code logic here`

  `}`

`}`

[Try](https://www.typescriptlang.org/play/#code/MYGwhgzhAEAKD2BLAdgF2gbwLAChrQA8AuaZAVwFsAjAUwCdoBeaABgG5d8BPE86+pqw45O0APRjoAYXjIIqOmWCp4DeADd6IeGAAmEUcFnzFy1QApipSrToAaaD2v86ASmH4jchUpV1LTiYoAObuhsY+Zv5WQcjB0AA+zrYOTny2giyumKL4EtLwujTQ2sGIwNAAFvQ0ogC+uHVAA)

There are just a few differences between class constructor signatures and function signatures:

-   Constructors can’t have type parameters - these belong on the outer class declaration, which we’ll learn about later
-   Constructors can’t have return type annotations - the class instance type is always what’s returned

#### [](#super-calls)Super Calls

Just as in JavaScript, if you have a base class, you’ll need to call `super();` in your constructor body before using any `this.` members:

ts

`class Base {`

  `k = 4;`

`}`

`class Derived extends Base {`

  `constructor() {`

    `// Prints a wrong value in ES5; throws exception in ES6`

    `console.log(this.k);`

`'super' must be called before accessing 'this' in the constructor of a derived class.17009'super' must be called before accessing 'this' in the constructor of a derived class.      super();    }  }  `[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygIwHYAMWCcBYAKAGMAbAQ0UVACFLJQBvI0UAa1AF5QAWAbiIBfIkTKVqAERgBLAG6QAJqEgAPAC6QAdgup1EDZoVbE4mxGugBXYmoQAKAJRMWrUCFAAFaNM1rq5UAB3eE0Ac1BZclJLBh9QAFEAZQBWPlA1AAt4QOpVYkgABzVpU1A4pIA2F2NTRDhSSAA6UjhQu0zpREa2BwEjV0RLAphHPtZhQkEgA)

Forgetting to call `super` is an easy mistake to make in JavaScript, but TypeScript will tell you when it’s necessary.

### [](#methods)Methods

> Background Reading:  
> [Method definitions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions)  

A function property on a class is called a _method_. Methods can use all the same type annotations as functions and constructors:

ts

`class Point {`

  `x = 10;`

  `y = 10;`

  `scale(n: number): void {`

    `this.x *= n;`

    `this.y *= n;`

  `}`

`}`

[Try](https://www.typescriptlang.org/play/#code/MYGwhgzhAEAKD2BLAdgF2gbwLAChrQA9oBeaARgAYBuXfATxPOt1ugmDBAFMAKZALmjIArgFsARlwBOASkEA3JABNMrfKgAWiCADoiAKlLIaefNE3adDQ0JP4AvrntA)

Other than the standard type annotations, TypeScript doesn’t add anything else new to methods.

Note that inside a method body, it is still mandatory to access fields and other methods via `this.`. An unqualified name in a method body will always refer to something in the enclosing scope:

ts

`let x: number = 0;`

`class C {`

  `x: string = "hello";`

  `m() {`

    `// This is trying to modify 'x' from line 1, not the class property`

    `x = "world";`

`Type 'string' is not assignable to type 'number'.2322Type 'string' is not assignable to type 'number'.    }  }  `[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwGY1oLACgAbSAF1AA9UA7AVwFsAjGUAXlAAYBuffAYwIENEiUAGFQAb3yhyqRMWgBLSgHMWoAEQALSAQJx1XPFNC0AFAEoJx6SFAAVTQuFPQ8gJ5LVxOCbgATBQAzN1AAcjJQ0ED4WlACJUhQAEYAGlBKOFJibVA+QWEAB3gCmGI3a3I1dQB3BAI-A2MAX3wmoA)

### [](#getters--setters)Getters / Setters

Classes can also have _accessors_:

ts

`class C {`

  `_length = 0;`

  `get length() {`

    `return this._length;`

  `}`

  `set length(value) {`

    `this._length = value;`

  `}`

`}`

[Try](https://www.typescriptlang.org/play/#code/MYGwhgzhAEDC0G8CwAoa0D6ICmA7A5gC4AW0AvNAAwDcq6+2h0OBJAFAJSJ3rQBOjAK59c0EgEsIAOix4ixWmmgBfHhEbM57AG5gQg7F2RL0E6bNakKu-dkXpVKZUA)

> Note that a field-backed get/set pair with no extra logic is very rarely useful in JavaScript. It’s fine to expose public fields if you don’t need to add additional logic during the get/set operations.

TypeScript has some special inference rules for accessors:

-   If `get` exists but no `set`, the property is automatically `readonly`
-   If the type of the setter parameter is not specified, it is inferred from the return type of the getter

Since [TypeScript 4.3](https://devblogs.microsoft.com/typescript/announcing-typescript-4-3/), it is possible to have accessors with different types for getting and setting.

ts

`class Thing {`

  `_size = 0;`

  `get size(): number {`

    `return this._size;`

  `}`

  `set size(value: string | number | boolean) {`

    `let num = Number(value);`

    `// Don't allow NaN, Infinity, etc`

    `if (!Number.isFinite(num)) {`

      `this._size = 0;`

      `return;`

    `}`

    `this._size = num;`

  `}`

`}`

[Try](https://www.typescriptlang.org/play/#code/MYGwhgzhAEAqAWBLAdgc2gbwLAChrQH0JEAvAU2gF5oAGAbl131TIBdpjyAKASgC5oyAK4BbAEZkATpib5oktkMnJorJBAB0RUmQZ5oAX0b6IbDjq4A3MCCFkBEVpJToAPoNETp7sQHtfIGRgyDwy+viB7MIiVNAAcp5SVjZ2PHqy+AD0mdAAIr7IAOTsNiC+AO7xYHEANNAAksgAZiiIrACedWzAxnLQiE3QXACECeJSGogQAGKtrGRc0Tyh2OFyalNanBTU9BlyCqxKyHp9Rjj7G5ra5LHRp4a4BkA)

### [](#index-signatures)Index Signatures

Classes can declare index signatures; these work the same as [Index Signatures for other object types](https://www.typescriptlang.org/docs/handbook/2/objects.html#index-signatures):

ts

`class MyClass {`

  `[s: string]: boolean | ((s: string) => boolean);`

  `check(s: string) {`

    `return this[s] as boolean;`

  `}`

`}`

[Try](https://www.typescriptlang.org/play/#code/MYGwhgzhAECyCeBhcVoG8CwAoa0DaEAXNBAC4BOAlgHYDmAusQEYD2LIApmNdAD7QAKAURIUatAJTQAvAD5ordl2oSA3Nmy5gACw7AA1sOJkqdKZhy5o5DqQCu5HqW2UIBetEgK2nbussAvtgBQA)

Because the index signature type needs to also capture the types of methods, it’s not easy to usefully use these types. Generally it’s better to store indexed data in another place instead of on the class instance itself.

## [](#class-heritage)Class Heritage

Like other languages with object-oriented features, classes in JavaScript can inherit from base classes.

### [](#implements-clauses)`implements` Clauses

You can use an `implements` clause to check that a class satisfies a particular `interface`. An error will be issued if a class fails to correctly implement it:

ts

`interface Pingable {`

  `ping(): void;`

`}`

`class Sonar implements Pingable {`

  `ping() {`

    `console.log("ping!");`

  `}`

`}`

`class Ball implements Pingable {`

`Class 'Ball' incorrectly implements interface 'Pingable'.   Property 'ping' is missing in type 'Ball' but required in type 'Pingable'.2420Class 'Ball' incorrectly implements interface 'Pingable'.   Property 'ping' is missing in type 'Ball' but required in type 'Pingable'.    pong() {      console.log("pong!");    }  }  `[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwBY0AYCwAoASwDsAXGAMwEMBjSUABRIHMqAjAG3oG8DRQADiwAUASlQA3OIQAmAbgIBfAgRocqiRKADKcYlWihCAWwFdjkMlqbFWnHn0EjRoXvn78aexHC4A6DjhmYQAiIVsAQhDRBXdQZXwE1XVNUAAhKg4OI1NzS1JrFnYuV0cBPWCXNw9QL2Iff0DgsIqomMcExSA)

Classes may also implement multiple interfaces, e.g. `class C implements A, B {`.

#### [](#cautions)Cautions

It’s important to understand that an `implements` clause is only a check that the class can be treated as the interface type. It doesn’t change the type of the class or its methods _at all_. A common source of error is to assume that an `implements` clause will change the class type - it doesn’t!

ts

`interface Checkable {`

  `check(name: string): boolean;`

`}`

`class NameChecker implements Checkable {`

  `check(s) {`

`Parameter 's' implicitly has an 'any' type.7006Parameter 's' implicitly has an 'any' type.      // Notice no error here      return s.toLowerCase() === "ok";                   any    }  }  `[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygOwAYMDYCwAoASwDsAXGAMwEMBjSUAYQAtIaBrKgIwBt6BvAqFA0W7ABTEqAW0ipEpaCQDmASlSc4cXlWIBuAgF8CBGtyqJEoAHLTIzVmxihCUgA68ZZS-fZdeoAXwhEQcxRBUAwSFQEGs4UkI6UGI4UBh4aFAWaEgooRzSAFdoYlBEADpSOAAZOAB3GAZzSDEIgF4O0AAiODYu-SDo2OiR0AA9AH4oo3wDIA)

In this example, we perhaps expected that `s`’s type would be influenced by the `name: string` parameter of `check`. It is not - `implements` clauses don’t change how the class body is checked or its type inferred.

Similarly, implementing an interface with an optional property doesn’t create that property:

ts

`interface A {`

  `x: number;`

  `y?: number;`

`}`

`class C implements A {`

  `x = 0;`

`}`

`const c = new C();`

`c.y = 10;`

`Property 'y' does not exist on type 'C'.2339Property 'y' does not exist on type 'C'.`[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwGYME4CwAoASwDsAXGAMwEMBjSUAQVAG8DRQAPVYgVwFsARjADcbUAE8A-N35Doo-AF8CNADZVEiUAGFQhPgAdVkPpDJamrfOw6gAvKAAMC5fhpxiiUqBr3QxSAB3HQAKAEoFGgA6cT8ARmcgA)

### [](#extends-clauses)`extends` Clauses

> Background Reading:  
> [extends keyword (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/extends)  

Classes may `extend` from a base class. A derived class has all the properties and methods of its base class, and can also define additional members.

ts

`class Animal {`

  `move() {`

    `console.log("Moving along!");`

  `}`

`}`

`class Dog extends Animal {`

  `woof(times: number) {`

    `for (let i = 0; i < times; i++) {`

      `console.log("woof!");`

    `}`

  `}`

`}`

`const d = new Dog();`

`// Base class method`

`d.move();`

`// Derived class method`

`d.woof(3);`

[Try](https://www.typescriptlang.org/play/#code/MYGwhgzhAECCB2BLAtmE0DeBYAUNayA9gG4CmAFAJSa777CHwSEikB0IhA5uQEQCyJRPC7Q0jLgEJelANy1oAX1zKcuUJBgARbtFIAPAC6l4AExgIUaGnmgB3QoQBm5QylIQAXNHgBXZABGpABO1Ni2+E6EwdDkrIbQiNAAvNAADLKJ0AA80G7IHpmIANTFYQp00AxMLOycPLwOztJyFUoKqqrqjBAJpik+pHbQOjytOAD0E9AAQpCkVeBQBKSGABaEprimbERkVPKT01ohiGT9GssF65vbbE0uAMxyQA)

#### [](#overriding-methods)Overriding Methods

> Background Reading:  
> [super keyword (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/super)  

A derived class can also override a base class field or property. You can use the `super.` syntax to access base class methods. Note that because JavaScript classes are a simple lookup object, there is no notion of a “super field”.

TypeScript enforces that a derived class is always a subtype of its base class.

For example, here’s a legal way to override a method:

ts

`class Base {`

  `greet() {`

    `console.log("Hello, world!");`

  `}`

`}`

`class Derived extends Base {`

  `greet(name?: string) {`

    `if (name === undefined) {`

      `super.greet();`

    `} else {`

      `console.log(`Hello, ${name.toUpperCase()}`);`

    `}`

  `}`

`}`

`const d = new Derived();`

`d.greet();`

`d.greet("reader");`

[Try](https://www.typescriptlang.org/play/#code/MYGwhgzhAEBCkFNoG8CwAoa0DmAnBCALgBQCUKGWWwA9gHYQ0gIB0IN2xARABIIjsANNADuNXCAAmAQi6kA3JWgBfDKvQZQkGABEEuAJYA3BJOgIAHoQR1JMeBCRpMOfEWJ0wAWwQB+AFzQEISGdNjkzlTQBgBm0B7eSAC8KdAArrYIMQZ0phFKURBpAA76LHgEJAoFKuYgjhQuUbQMTKzsnAAGfAI0wgAkyJ4+LIQ0AKrFpbgAwohkyp3VTSpK6uqa9MHQZknQuSLQeoYmkmSK6JLlblUXVxXuXPhgkvpy8kA)

It’s important that a derived class follow its base class contract. Remember that it’s very common (and always legal!) to refer to a derived class instance through a base class reference:

ts

`// Alias the derived instance through a base class reference`

`const b: Base = d;`

`// No problem`

`b.greet();`

[Try](https://www.typescriptlang.org/play/#code/MYGwhgzhAEBCkFNoG8CwAoa0DmAnBCALgBQCUKGWWwA9gHYQ0gIB0IN2xARABIIjsANNADuNXCAAmAQi6kA3JWgBfDKvShIMACIJcASwBuCSdAQAPQgjqSY8CEmTraDQtFMBeaHQQjoug2NJMkV0AHow6ABaGOAAV0IYqIwI6ABBEH1IaEIACyRJPSMTaH1XMDpgJDzcGjjsXOgwaAAjRGhNKGh8ADM9ayqMFwg3FoAuOHavSVDUgDkaaAAHWpbmAFsMFpY8AhIFIA)

What if `Derived` didn’t follow `Base`’s contract?

ts

`class Base {`

  `greet() {`

    `console.log("Hello, world!");`

  `}`

`}`

`class Derived extends Base {`

  `// Make this parameter required`

  `greet(name: string) {`

``Property 'greet' in type 'Derived' is not assignable to the same property in base type 'Base'.   Type '(name: string) => void' is not assignable to type '() => void'.     Target signature provides too few arguments. Expected 1 or more, but got 0.2416Property 'greet' in type 'Derived' is not assignable to the same property in base type 'Base'.   Type '(name: string) => void' is not assignable to type '() => void'.     Target signature provides too few arguments. Expected 1 or more, but got 0.      console.log(`Hello, ${name.toUpperCase()}`);    }  }  ``[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwBYCMA2AsAFADGANgIaKKgBCFkoA3oaKAObSSQAuAFAJSNmLUETgA7RHBKQAdCTiseAIgASkEvIA0oAO4ISAEwCESvgG4hAX0LWChUhSoARGAEsAbpAOhIADy6QYgZUtIj0TAQsIKAAsmQA1vRcABauVAAOZNBkALbcMKAcAI4Arq4cBkLsnLxiuZCoiFzQrmKsAhHCIuKS0nIKPAAGahpw2gAkDHV5MlxwAKrp6TAAwnT8loPmVjZAA)

If we compiled this code despite the error, this sample would then crash:

ts

`const b: Base = new Derived();`

`// Crashes because "name" will be undefined`

`b.greet();`

[Try](https://www.typescriptlang.org/play/#code/CYUwxgNghgTiAEkoGdnwEIoQbwLACh54BzOEAFwAoBKALngDcB7AS2AG4CBfA0JORNFTwAIiBgsGIYPBAAPciAB2wNJmQ4e+APTb4AWkNgAruUP6CYJkuTl4AI3rqEAXnhKQAd1HjJ0mpw6egDCMCgAFiBo9uBQxhrwAERKUAC2IInwniwQEA4IxiogAGYsHsAE9gB0pCAUAUA)

#### [](#type-only-field-declarations)Type-only Field Declarations

When `target >= ES2022` or [`useDefineForClassFields`](https://www.typescriptlang.org/tsconfig#useDefineForClassFields) is `true`, class fields are initialized after the parent class constructor completes, overwriting any value set by the parent class. This can be a problem when you only want to re-declare a more accurate type for an inherited field. To handle these cases, you can write `declare` to indicate to TypeScript that there should be no runtime effect for this field declaration.

ts

`interface Animal {`

  `dateOfBirth: any;`

`}`

`interface Dog extends Animal {`

  `breed: any;`

`}`

`class AnimalHouse {`

  `resident: Animal;`

  `constructor(animal: Animal) {`

    `this.resident = animal;`

  `}`

`}`

`class DogHouse extends AnimalHouse {`

  `// Does not emit JavaScript code,`

  `// only ensures the types are correct`

  `declare resident: Dog;`

  `constructor(dog: Dog) {`

    `super(dog);`

  `}`

`}`

[Try](https://www.typescriptlang.org/play/#code/JYOwLgpgTgZghgYwgAgIImAWzgG2QbwFgAoZZAEzkgHkYAhYKMACwC5k4QBPAbhIF8SJUJFiIUAEQD2Ac2QQAHpBDkAzmgzY8RUsgBGUCBHLtOvAUOIIccVevRZcACSkBXVSh1lDq4OQjg7A5afLoIUiCqYFCuCGBSUAAUnI44QZq4AJQEJGRkLMCqAHQ+fgFgyAC8HBk4oWSCxI0k1rbq0jIu7iiKymoaqV0eOboA9KPI0hDqIFIVEJjAFQBScABucADKCFDAAA4V4f4ANLnI48gROFzyka4+yCwoYFx70xyGyOFQhnFn-q1PqV-IFJrJ6l8IlEYnEEolyLJ2B1sl48qpXG8kgiZJkIY1+EA)

#### [](#initialization-order)Initialization Order

The order that JavaScript classes initialize can be surprising in some cases. Let’s consider this code:

ts

`class Base {`

  `name = "base";`

  `constructor() {`

    `console.log("My name is " + this.name);`

  `}`

`}`

`class Derived extends Base {`

  `name = "derived";`

`}`

`// Prints "base", not "derived"`

`const d = new Derived();`

[Try](https://www.typescriptlang.org/play/#code/MYGwhgzhAEBCkFNoG8CwAoa0B2YC2SAvNAEQBGiJA3BlsAPbYQAuATgK7DP2sAUAlClpZoDJvRAIAdCHoBzXiQCyATxz4kASxgloAamjMAFtqm4C-GpmgBfDHfQZQkGABEErTQDcEAE2gIAB7MCNi+MPAQSGjW5kSkvh7eftT2GBgA9BnQAAqe2Mw6FFEkADQ49MwJST6+JE6MLND+xNgIAO7Q7p61AlRAA)

What happened here?

The order of class initialization, as defined by JavaScript, is:

-   The base class fields are initialized
-   The base class constructor runs
-   The derived class fields are initialized
-   The derived class constructor runs

This means that the base class constructor saw its own value for `name` during its own constructor, because the derived class field initializations hadn’t run yet.

#### [](#inheriting-built-in-types)Inheriting Built-in Types

> Note: If you don’t plan to inherit from built-in types like `Array`, `Error`, `Map`, etc. or your compilation target is explicitly set to `ES6`/`ES2015` or above, you may skip this section

In ES2015, constructors which return an object implicitly substitute the value of `this` for any callers of `super(...)`. It is necessary for generated constructor code to capture any potential return value of `super(...)` and replace it with `this`.

As a result, subclassing `Error`, `Array`, and others may no longer work as expected. This is due to the fact that constructor functions for `Error`, `Array`, and the like use ECMAScript 6’s `new.target` to adjust the prototype chain; however, there is no way to ensure a value for `new.target` when invoking a constructor in ECMAScript 5. Other downlevel compilers generally have the same limitation by default.

For a subclass like the following:

ts

`class MsgError extends Error {`

  `constructor(m: string) {`

    `super(m);`

  `}`

  `sayHello() {`

    `return "hello " + this.message;`

  `}`

`}`

[Try](https://www.typescriptlang.org/play/#code/MYGwhgzhAECyEHMCiAnFB7F0CmAPALtgHYAmMqGWA3gLABQ00w6RE+KArsPpgBQC2ALmhsUASyIIAlNFoNGIjgAdsKAVIDc9RgF9tIsAE8AEthAh0vGXIXQU2fBxRFoAIgAWZi2+gBqaPjuYhAAdPzYUGAI2FryenQ6QA)

you may find that:

-   methods may be `undefined` on objects returned by constructing these subclasses, so calling `sayHello` will result in an error.
-   `instanceof` will be broken between instances of the subclass and their instances, so `(new MsgError()) instanceof MsgError` will return `false`.

As a recommendation, you can manually adjust the prototype immediately after any `super(...)` calls.

ts

`class MsgError extends Error {`

  `constructor(m: string) {`

    `super(m);`

    `// Set the prototype explicitly.`

    `Object.setPrototypeOf(this, MsgError.prototype);`

  `}`

  `sayHello() {`

    `return "hello " + this.message;`

  `}`

`}`

[Try](https://www.typescriptlang.org/play/#code/MYGwhgzhAECyEHMCiAnFB7F0CmAPALtgHYAmMqGWA3gLABQ00w6RE+KArsPpgBQC2ALmhsUASyIIAlNFoNGIjgAdsKAVIDc9egugB6PdADK2fNHwALbNCUYe+AJ4qcuJSDHAx+EA4B0OhQB5ACMAK2xuXwhTAAU7dEcVQIAzXksxCAAaOEQKTF9bBISnbE0AgF9teQgwBwAJbBAQdF4ZOV0UUw4UImgAIism9H7oAGpzCwzffmwoMARsLXlKunKgA)

However, any subclass of `MsgError` will have to manually set the prototype as well. For runtimes that don’t support [`Object.setPrototypeOf`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf), you may instead be able to use [`__proto__`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/proto).

Unfortunately, [these workarounds will not work on Internet Explorer 10 and prior](https://msdn.microsoft.com/en-us/library/s4esdbwz\(v=vs.94\).aspx). One can manually copy methods from the prototype onto the instance itself (i.e. `MsgError.prototype` onto `this`), but the prototype chain itself cannot be fixed.

## [](#member-visibility)Member Visibility

You can use TypeScript to control whether certain methods or properties are visible to code outside the class.

### [](#public)`public`

The default visibility of class members is `public`. A `public` member can be accessed anywhere:

ts

`class Greeter {`

  `public greet() {`

    `console.log("hi!");`

  `}`

`}`

`const g = new Greeter();`

`g.greet();`

[Try](https://www.typescriptlang.org/play/#code/MYGwhgzhAEDiBOBTRAXR9oG8CwAoa0ADgK4BGIAlsNAOZKoAUAlFngQcAPYB2EnIiAHQhONBgCIAFhQCE4pgG420AL541uLrxS1oAXmjdEAdzj008Zktw1BdZCitA)

Because `public` is already the default visibility modifier, you don’t ever _need_ to write it on a class member, but might choose to do so for style/readability reasons.

### [](#protected)`protected`

`protected` members are only visible to subclasses of the class they’re declared in.

ts

`class Greeter {`

  `public greet() {`

    `console.log("Hello, " + this.getName());`

  `}`

  `protected getName() {`

    `return "hi";`

  `}`

`}`

`class SpecialGreeter extends Greeter {`

  `public howdy() {`

    `// OK to access protected member here`

    `console.log("Howdy, " + this.getName());`

  `}`

`}`

`const g = new SpecialGreeter();`

`g.greet(); // OK`

`g.getName();`

`Property 'getName' is protected and only accessible within class 'Greeter' and its subclasses.2445Property 'getName' is protected and only accessible within class 'Greeter' and its subclasses.`[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwBYMFYCwAoAYwBsBDRRUAcWkkgBcZQBvA0UABwFcAjYgS0KgA5rQYAKAJQs27UITgA7RHGKQAdMTjDxAIgASkYloA0oXaADUoegAt+idcIYA5UgFtIUyQG5ZAX1kOeEZCRgATEVcPL2lWfDlQWnouaEVze10-BNBA-DyCEnJKAGUOSEJ+UmIaOkZoUEgAD0ZFcMpahiZ49m4+QVBbOAB3cIBPKRkc9hBQAHkAaRs4UFJCQkgKThCKiNBPdx4mWxhIWXYFZVUNLR0DEfGzC2s7Bydoz29sxNnEv-+AXIAHog0FgsEBAh5S6IegiUAAXlAikgw1AZQqVRqYnqUmywicOLxoFmiwIBOc9Dcn18QA)

#### [](#exposure-of-protected-members)Exposure of `protected` members

Derived classes need to follow their base class contracts, but may choose to expose a subtype of base class with more capabilities. This includes making `protected` members `public`:

ts

`class Base {`

  `protected m = 10;`

`}`

`class Derived extends Base {`

  `// No modifier, so default is 'public'`

  `m = 15;`

`}`

`const d = new Derived();`

`console.log(d.m); // OK`

[Try](https://www.typescriptlang.org/play/#code/MYGwhgzhAEBCkFNoG8CwAoa0AOAnA9gC4LDEAm0AttALzQCMADANwYC+GokMAIgrgEsAbggoIAHsQB2ZGPAhI0maAHoV0AHL4q+MgIBmA-gBpoEbWQT6wAVxCFoAmAHJsNgEYgBwZxizU6egBWVnQOdGB8KQgHCjopBAB3aD5BETIACgBKUMjo-BAEADoQfABzDLIiyhzVdQB5AGkgA)

Note that `Derived` was already able to freely read and write `m`, so this doesn’t meaningfully alter the “security” of this situation. The main thing to note here is that in the derived class, we need to be careful to repeat the `protected` modifier if this exposure isn’t intentional.

#### [](#cross-hierarchy-protected-access)Cross-hierarchy `protected` access

TypeScript doesn’t allow accessing `protected` members of a sibling class in a class hierarchy:

ts

`class Base {`

  `protected x: number = 1;`

`}`

`class Derived1 extends Base {`

  `protected x: number = 5;`

`}`

`class Derived2 extends Base {`

  `f1(other: Derived2) {`

    `other.x = 10;`

  `}`

  `f2(other: Derived1) {`

    `other.x = 10;`

`Property 'x' is protected and only accessible within class 'Derived1' and its subclasses.2445Property 'x' is protected and only accessible within class 'Derived1' and its subclasses.    }  }  `[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwBYMDYCwAoAYwBsBDRRUAIXMlAG8DRQAHeAF0kM4BNQAPVADsArgFsARjFABeUAEYA3AQC+BEuUoARGAEsAbpB7zQkfpyE9KNRHUb5mbOJ25GBw8VOizQAVmX4akRkFKA60AZGaKbmkJbWtAxMoABm8gAUzgAWMKjhkTxoAJRJDsyg2TAAdPw+8gAMAcxBzClomew50Hl6hsYl9uUVndW1cg1NoEEqQA)

This is because accessing `x` in `Derived2` should only be legal from `Derived2`’s subclasses, and `Derived1` isn’t one of them. Moreover, if accessing `x` through a `Derived1` reference is illegal (which it certainly should be!), then accessing it through a base class reference should never improve the situation.

See also [Why Can’t I Access A Protected Member From A Derived Class?](https://blogs.msdn.microsoft.com/ericlippert/2005/11/09/why-cant-i-access-a-protected-member-from-a-derived-class/) which explains more of C#‘s reasoning on the same topic.

### [](#private)`private`

`private` is like `protected`, but doesn’t allow access to the member even from subclasses:

ts

`class Base {`

  `private x = 0;`

`}`

`const b = new Base();`

`// Can't access from outside the class`

`console.log(b.x);`

`Property 'x' is private and only accessible within class 'Base'.2341Property 'x' is private and only accessible within class 'Base'.`[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwGYAsBGAsAFADGANgIaKKgBCFkoA3oaKAA7QCWAbmQC70APUAF5QABgDchAL6EicAHaJeoAEYjQCyAHcadABQBKKQRCgAwmQUByFWSJFIlUADN4AW1BwArr0QcAE3peAAt6UgpEOUVEOBJIADoSOABzfVUEgWMgA)

ts

`class Derived extends Base {`

  `showX() {`

    `// Can't access in subclasses`

    `console.log(this.x);`

`Property 'x' is private and only accessible within class 'Base'.2341Property 'x' is private and only accessible within class 'Base'.    }  }  `[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwGYAsBGAsAFADGANgIaKKgBCFkoA3oaKAA7QCWAbmQC70APUAF5QABgDchAL6EQoALRKiAV15KFhUhSoARGN0gATUJAH8Adkaq1E9JgRaIAFnADuADQAUASkbMWUHkAYTILAHJeUDIiIkhKUA4LUEQVACNtSniAliI4C0Q4EkgAOhI4AHMvXmcORBKBHylHUFkCaSA)

Because `private` members aren’t visible to derived classes, a derived class can’t increase their visibility:

ts

`class Base {`

  `private x = 0;`

`}`

`class Derived extends Base {`

`Class 'Derived' incorrectly extends base class 'Base'.   Property 'x' is private in type 'Base' but not in type 'Derived'.2415Class 'Derived' incorrectly extends base class 'Base'.   Property 'x' is private in type 'Base' but not in type 'Derived'.    x = 1;  }  `[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwBYCMBWAsAFADGANgIaKKgBCFkoA3oaKAA7QCWAbmQC70APUAF5QABgDchAL6FSFKgBEY3SABNQkAfwB2aqrUT0mBFkNFYpBaUA)

#### [](#cross-instance-private-access)Cross-instance `private` access

Different OOP languages disagree about whether different instances of the same class may access each others’ `private` members. While languages like Java, C#, C++, Swift, and PHP allow this, Ruby does not.

TypeScript does allow cross-instance `private` access:

ts

`class A {`

  `private x = 10;`

  `public sameAs(other: A) {`

    `// No error`

    `return other.x === this.x;`

  `}`

`}`

[Try](https://www.typescriptlang.org/play/#code/MYGwhgzhAECC0G8CwAoa0AOAnAlgNzABcBTaAD2gF5oBGABgG5VV0MBXAIxB2GgjAC2xWBAAUAe0IALYlgBccAJSIW6aAHp10AHLjosrOKyr0WYoTZYAdtEkysAOgqUX0aTghOmaaAF9UvkA)

#### [](#caveats)Caveats

Like other aspects of TypeScript’s type system, `private` and `protected` [are only enforced during type checking](https://www.typescriptlang.org/play?removeComments=true&target=99&ts=4.3.4#code/PTAEGMBsEMGddAEQPYHNQBMCmVoCcsEAHPASwDdoAXLUAM1K0gwQFdZSA7dAKWkoDK4MkSoByBAGJQJLAwAeAWABQIUH0HDSoiTLKUaoUggAW+DHorUsAOlABJcQlhUy4KpACeoLJzrI8cCwMGxU1ABVPIiwhESpMZEJQTmR4lxFQaQxWMm4IZABbIlIYKlJkTlDlXHgkNFAAbxVQTIAjfABrAEEC5FZOeIBeUAAGAG5mmSw8WAroSFIqb2GAIjMiIk8VieVJ8Ar01ncAgAoASkaAXxVr3dUwGoQAYWpMHBgCYn1rekZmNg4eUi0Vi2icoBWJCsNBWoA6WE8AHcAiEwmBgTEtDovtDaMZQLM6PEoQZbA5wSk0q5SO4vD4-AEghZoJwLGYEIRwNBoqAzFRwCZCFUIlFMXECdSiAhId8YZgclx0PsiiVqOVOAAaUAFLAsxWgKiC35MFigfC0FKgSAVVDTSyk+W5dB4fplHVVR6gF7xJrKFotEk-HXIRE9PoDUDDcaTAPTWaceaLZYQlmoPBbHYx-KcQ7HPDnK43FQqfY5+IMDDISPJLCIuqoc47UsuUCofAME3Vzi1r3URvF5QV5A2STtPDdXqunZDgDaYlHnTDrrEAF0dm28B3mDZg6HJwN1+2-hg57ulwNV2NQGoZbjYfNrYiENBwEFaojFiZQK08C-4fFKTVCozWfTgfFgLkeT5AUqiAA).

This means that JavaScript runtime constructs like `in` or simple property lookup can still access a `private` or `protected` member:

ts

`class MySafe {`

  `private secretKey = 12345;`

`}`

[Try](https://www.typescriptlang.org/play/#code/MYGwhgzhAECyCeBlMAzAptA3gWAFDWgAcAnASwDcwAXDCNYYtKgaTXmgF5oBGAJgGYALAFYA3HgC+QA)

js

`// In a JavaScript file...`

`const s = new MySafe();`

`// Will print 12345`

`console.log(s.secretKey);`

`private` also allows access using bracket notation during type checking. This makes `private`\-declared fields potentially easier to access for things like unit tests, with the drawback that these fields are _soft private_ and don’t strictly enforce privacy.

ts

`class MySafe {`

  `private secretKey = 12345;`

`}`

`const s = new MySafe();`

`// Not allowed during type checking`

`console.log(s.secretKey);`

`Property 'secretKey' is private and only accessible within class 'MySafe'.2341Property 'secretKey' is private and only accessible within class 'MySafe'.  // OK  console.log(s["secretKey"]);  `[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwGYAsBGAsAFADGANgIaKKgCyAngMpkBmkoA3oaKAA7QCWANzIAXVokhFokYQGlItUAF5QOTFgCsAbkIBfQoSJwAdomGgqyo5ADuNBs0gAKAJTaChEKABycM2RIkcNaQACagIQCu-EYA5qDCtNysRAAWEgDWfLEGxohwJJAAdIExjoiF4pLScrSu+gSeAPIyOSb5RSVlANoARJVSsvI9ALquQA)

Unlike TypeScripts’s `private`, JavaScript’s [private fields](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields) (`#`) remain private after compilation and do not provide the previously mentioned escape hatches like bracket notation access, making them _hard private_.

ts

`class Dog {`

  `#barkAmount = 0;`

  `personality = "happy";`

  `constructor() {}`

`}`

[Try](https://www.typescriptlang.org/play/#code/MYGwhgzhAEAiD2BzaBvAsAKGtAxAIzACcBrAQQFt4BXAOwBdoBeaABgG5NsAHAU0Ing0wIAJZ0Ank2gAiABZguXcdI4ZO0YIIh1CVYHXiEAFAEpUAX0zmgA)

ts

`"use strict";`

`class Dog {`

    `#barkAmount = 0;`

    `personality = "happy";`

    `constructor() { }`

`}`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEBcEMCcHMCmkBcpEGcB2iAekBYAKBAgwAsB7AdwFEBbAS0KIGMAbaDDUAEUvigA3sVCgAxACM4AawCC9SgFcskUAF5QABgDco0AAdEsDJSzR2zAJ4bQAInLQDBq3b1F9rMxkiwlrSEpYAAoASmEAX2IIoA)

When compiling to ES2021 or less, TypeScript will use WeakMaps in place of `#`.

ts

`"use strict";`

`var _Dog_barkAmount;`

`class Dog {`

    `constructor() {`

        `_Dog_barkAmount.set(this, 0);`

        `this.personality = "happy";`

    `}`

`}`

`_Dog_barkAmount = new WeakMap();`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEBcEMCcHMCmkBcpEGcBMAGAjAKwCwAUCBBgBYD2A7gKIC2AlpKQMYA20GGoAItXigA3qVCgAxACM4AawCCjagFcAdpFABeUDgDc40AAdEsDNTXROrAJ7bQAIkrQjRmw4MlD7CxkiwVdkhqWAAKAEpRAF9SKKA)

If you need to protect values in your class from malicious actors, you should use mechanisms that offer hard runtime privacy, such as closures, WeakMaps, or private fields. Note that these added privacy checks during runtime could affect performance.

## [](#static-members)Static Members

> Background Reading:  
> [Static Members (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/static)  

Classes may have `static` members. These members aren’t associated with a particular instance of the class. They can be accessed through the class constructor object itself:

ts

`class MyClass {`

  `static x = 0;`

  `static printX() {`

    `console.log(MyClass.x);`

  `}`

`}`

`console.log(MyClass.x);`

`MyClass.printX();`

[Try](https://www.typescriptlang.org/play/#code/MYGwhgzhAECyCeBhcVoG8CwAoa0IBcx8BLYaAD2gF5oAGAbm1wKNOgAcAnYgO3wA0AFAEp0TXNGAB7HhCkgApgDoQUgOaCEySBCXlhjHNAC+2U1mmz5y1Rq0pd+w-Z1KuvASPpA)

Static members can also use the same `public`, `protected`, and `private` visibility modifiers:

ts

`class MyClass {`

  `private static x = 0;`

`}`

`console.log(MyClass.x);`

`Property 'x' is private and only accessible within class 'MyClass'.2341Property 'x' is private and only accessible within class 'MyClass'.`[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwGYAsBGAsAFADGANgIaKKgCyAngMLmWgDehooADtAJYBuZAC6RQiQUJ5FQAD1ABeUAAYA3IQC+hInAB2iOCUgA6EnADmACjqMKiQ9ICUyoA)

Static members are also inherited:

ts

`class Base {`

  `static getGreeting() {`

    `return "Hello world";`

  `}`

`}`

`class Derived extends Base {`

  `myGreeting = Derived.getGreeting();`

`}`

[Try](https://www.typescriptlang.org/play/#code/MYGwhgzhAEBCkFNoG8CwAoa0IBcw4EthoBzBHAcQCcFyCA7EgCgEoUMssacBXK+6ACIAEghAgA9tADuEqiAAmggNwdoAXwyb0oSDAAiCKgQBuCBdAQAPHAnoKY8CEjSZoAWwCe1WoUbQAXmhDYzMFADoySho6RlZVdHUgA)

### [](#special-static-names)Special Static Names

It’s generally not safe/possible to overwrite properties from the `Function` prototype. Because classes are themselves functions that can be invoked with `new`, certain `static` names can’t be used. Function properties like `name`, `length`, and `call` aren’t valid to define as `static` members:

ts

`class S {`

  `static name = "S!";`

`Static property 'name' conflicts with built-in property 'Function.name' of constructor function 'S'.2699Static property 'name' conflicts with built-in property 'Function.name' of constructor function 'S'.  }  `[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwDYCcWCwAoAYwBsBDRRUAZVAG8DRREAXU5gS0NADtSBbSKAC8oAERUAhKIDcBAL5A)

### [](#why-no-static-classes)Why No Static Classes?

TypeScript (and JavaScript) don’t have a construct called `static class` the same way as, for example, C# does.

Those constructs _only_ exist because those languages force all data and functions to be inside a class; because that restriction doesn’t exist in TypeScript, there’s no need for them. A class with only a single instance is typically just represented as a normal _object_ in JavaScript/TypeScript.

For example, we don’t need a “static class” syntax in TypeScript because a regular object (or even top-level function) will do the job just as well:

ts

`// Unnecessary "static" class`

`class MyStaticClass {`

  `static doSomething() {}`

`}`

`// Preferred (alternative 1)`

`function doSomething() {}`

`// Preferred (alternative 2)`

`const MyHelperObject = {`

  `dosomething() {},`

`};`

[Try](https://www.typescriptlang.org/play/#code/PTAEFUDtIUwYxgZ0QQwE4E9QCJEBcU8BLObUOAGxWQFgAoS6xUAWQwGUDi4BhK5UAG96oUPkIlQAEwD27GQFsYeABZFIAcwAUASiEBfeobr0QoAApoYAMxhorU0FpQU8dyBIBuMUAEYd9NYArpBwxDKQ0nKKymqaugb0pmCWNnYOTi5uaB7E3qAATAEMEfisGAASMBQADnYA8gBGAFbweKAAvEIiUYgxquraeoL6ADRGANxAA)

## [](#static-blocks-in-classes)`static` Blocks in Classes

Static blocks allow you to write a sequence of statements with their own scope that can access private fields within the containing class. This means that we can write initialization code with all the capabilities of writing statements, no leakage of variables, and full access to our class’s internals.

ts

`class Foo {`

    `static #count = 0;`

    `get count() {`

        `return Foo.#count;`

    `}`

    `static {`

        `try {`

            `const lastInstances = loadLastInstances();`

            `Foo.#count += lastInstances.length;`

        `}`

        `catch {}`

    `}`

`}`

[Try](https://www.typescriptlang.org/play/#code/CYUwxgNghgTiAEAzArgOzAFwJYHtXwhymABkoBnDASVUqnRHIAoBKALnnoE8BtAXQCwAKAD0I+AFopYZBikThkCuXgAxHDngBvYfD3w62MPADEYHGgzwAvPAAMAbmG79AcxBXzl1tpf79cBjIMPjqOAB0ZhaoGE5C-gC+zvH6hljGOin+ehgwXL5Z2f7mtFbQlDR0DCq2hMRkFaX0YIyscUVFYZFeMfAA1LUU1E3V4RAgqK4YABbtHUmFxVAYYNPaC4nCCUA)

## [](#generic-classes)Generic Classes

Classes, much like interfaces, can be generic. When a generic class is instantiated with `new`, its type parameters are inferred the same way as in a function call:

ts

`class Box<Type> {`

  `contents: Type;`

  `constructor(value: Type) {`

    `this.contents = value;`

  `}`

`}`

`const b = new Box("hello!");`

     `const b: Box<string>`

[Try](https://www.typescriptlang.org/play/#code/MYGwhgzhAEBCD2APAPAFQJ4AcCmA+aA3gLABQ00w8AdgC7a0QBc0GOA3KeZVRDQE4BXYDXh8AFADcwIAdmatsASkKdy0GgAsAlhAB03Og2gBeaFJnYOZaAF9SdkqW69oAIxPQq2AO5wkYgCINbBAQeABCAMUrAHoYtWgAPQB+IA)

Classes can use generic constraints and defaults the same way as interfaces.

### [](#type-parameters-in-static-members)Type Parameters in Static Members

This code isn’t legal, and it may not be obvious why:

ts

`class Box<Type> {`

  `static defaultValue: Type;`

`Static members cannot reference class type parameters.2302Static members cannot reference class type parameters.  }  `[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwGYAMaCwAoAYwBsBDRRUAITgA8AeAFQE8AHSAPlAG8DRREAF1KCAloVAATSADNSAV2KCAaqWLzIqFuwDcBAL5A)

Remember that types are always fully erased! At runtime, there’s only _one_ `Box.defaultValue` property slot. This means that setting `Box<string>.defaultValue` (if that were possible) would _also_ change `Box<number>.defaultValue` - not good. The `static` members of a generic class can never refer to the class’s type parameters.

## [](#this-at-runtime-in-classes)`this` at Runtime in Classes

> Background Reading:  
> [this keyword (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this)  

It’s important to remember that TypeScript doesn’t change the runtime behavior of JavaScript, and that JavaScript is somewhat famous for having some peculiar runtime behaviors.

JavaScript’s handling of `this` is indeed unusual:

ts

`class MyClass {`

  `name = "MyClass";`

  `getName() {`

    `return this.name;`

  `}`

`}`

`const c = new MyClass();`

`const obj = {`

  `name: "obj",`

  `getName: c.getName,`

`};`

`// Prints "obj", not "MyClass"`

`console.log(obj.getName());`

[Try](https://www.typescriptlang.org/play/#code/MYGwhgzhAECyCeBhcVoG8CwAoa0B2YAtgKbQC80ARAspBJQNza4DmxALgHJHEAUAlOma5oAJw4BXUXmjsAFgEsIAOgIkmOaAF9sOrMAD2eCO2jBy+YgHc4SFBAEbDx0wYBGAKwuZNa4gC4qdw9KABphNi4eQOBlSO4ScKwtDWwAejToAAVRBTx2GEpgsPwDU2o7OkpsZwgDEGJlEAMWXmC4jgS+fn4GIA)

Long story short, by default, the value of `this` inside a function depends on _how the function was called_. In this example, because the function was called through the `obj` reference, its value of `this` was `obj` rather than the class instance.

This is rarely what you want to happen! TypeScript provides some ways to mitigate or prevent this kind of error.

### [](#arrow-functions)Arrow Functions

> Background Reading:  
> [Arrow functions (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)  

If you have a function that will often be called in a way that loses its `this` context, it can make sense to use an arrow function property instead of a method definition:

ts

`class MyClass {`

  `name = "MyClass";`

  `getName = () => {`

    `return this.name;`

  `};`

`}`

`const c = new MyClass();`

`const g = c.getName;`

`// Prints "MyClass" instead of crashing`

`console.log(g());`

[Try](https://www.typescriptlang.org/play/#code/MYGwhgzhAECyCeBhcVoG8CwAoa0B2YAtgKbQC80ARAspBJQNza4DmxALgHJGkUAUASnIA+dM1zQAThwCukvNHYALAJYQAdARJMc0AL4692YAHs8EdtGDl8xAO5wkKCIJ2nzlljeDq2XHjoA9IHQAAqSKnjsMNROdJTQkRbEYAAm0CYAZlaSkKp4LMZmECYgxOogJix81QICDEA)

This has some trade-offs:

-   The `this` value is guaranteed to be correct at runtime, even for code not checked with TypeScript
-   This will use more memory, because each class instance will have its own copy of each function defined this way
-   You can’t use `super.getName` in a derived class, because there’s no entry in the prototype chain to fetch the base class method from

### [](#this-parameters)`this` parameters

In a method or function definition, an initial parameter named `this` has special meaning in TypeScript. These parameters are erased during compilation:

ts

`// TypeScript input with 'this' parameter`

`function fn(this: SomeType, x: number) {`

  `/* ... */`

`}`

[Try](https://www.typescriptlang.org/play/#code/C4TwDgpgBAyg9gWwgFXNAvFAhgOxAbgFgAoAelKgFpqBjAV2GspPKlUhhoCcBLMYKDxxgGUAO49gACygByaTwDOsqGCxcsSYBC4kAZnRw1gPODih6cACgWKAXLEQo0AGigAPBzjoIARjoBKKABvEigoUgAqKAA6OKhI0hIAXyA)

js

`// JavaScript output`

`function fn(x) {`

  `/* ... */`

`}`

TypeScript checks that calling a function with a `this` parameter is done so with a correct context. Instead of using an arrow function, we can add a `this` parameter to method definitions to statically enforce that the method is called correctly:

ts

`class MyClass {`

  `name = "MyClass";`

  `getName(this: MyClass) {`

    `return this.name;`

  `}`

`}`

`const c = new MyClass();`

`// OK`

`c.getName();`

`// Error, would crash`

`const g = c.getName;`

`console.log(g());`

`The 'this' context of type 'void' is not assignable to method's 'this' of type 'MyClass'.2684The 'this' context of type 'void' is not assignable to method's 'this' of type 'MyClass'.`[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwDYAcAWAsAFADGANgIaKKgCyAngMLmWgDehooAdmQLaSgBeUACI6jComEBudqADmkAC4A5XpAAUigBYBLFDQZNEASlayO0JQFdonUNr0A6bnxkEOAX0JficTokVQIkEuSAB3A3FKdWM3EFAAeQBpQiJHBRU1GLdCeIBRWAQAGlAwuCsSABMg6AotVL8A+RC0jNVXBv84EkhHEjg5dUHjWKA)

This method makes the opposite trade-offs of the arrow function approach:

-   JavaScript callers might still use the class method incorrectly without realizing it
-   Only one function per class definition gets allocated, rather than one per class instance
-   Base method definitions can still be called via `super`.

## [](#this-types)`this` Types

In classes, a special type called `this` refers _dynamically_ to the type of the current class. Let’s see how this is useful:

ts

`class Box {`

  `contents: string = "";`

  `set(value: string) {`

  `(method) Box.set(value: string): this`

    `this.contents = value;`

    `return this;`

  `}`

`}`

[Try](https://www.typescriptlang.org/play/#code/MYGwhgzhAEBCD2APaBvAsAKGtY8B2ALgKaEQBc0EBATgJZ4Dm0AvNAERsDcm2ERBACgBuYEAFciFKnUYBKVJgD0i7AD0A-D2zQCAC1oQAdLkIkCMViPFFuWbdX5jqeHfoi3sAX0yegA)

Here, TypeScript inferred the return type of `set` to be `this`, rather than `Box`. Now let’s make a subclass of `Box`:

ts

`class ClearableBox extends Box {`

  `clear() {`

    `this.contents = "";`

  `}`

`}`

`const a = new ClearableBox();`

`const b = a.set("hello");`

     `const b: ClearableBox`

[Try](https://www.typescriptlang.org/play/#code/MYGwhgzhAEBCD2APaBvAsAKGtY8B2ALgKaEQBc0EBATgJZ4Dm0AvNAERsDcm2ERBACgBuYEAFciFKnUYBKVD2zQCAC1oQAdLkIkCMViPFFuWJdX5jqeZWognsAX0xOMAelfQAtN+BiC3z0xQSBgAYRAiMGowACMIhGQiRGI8ABMYBIVTUEjqAXl0U2xVdS18FL0Wdi5FFxcg-CpoMCq8IgB3aHDc2PikfJNtJpiqsA0+QTYVIhAQeDZZE3claAA9AH4gA)

You can also use `this` in a parameter type annotation:

ts

`class Box {`

  `content: string = "";`

  `sameAs(other: this) {`

    `return other.content === this.content;`

  `}`

`}`

[Try](https://www.typescriptlang.org/play/#code/MYGwhgzhAEBCD2APaBvAsAKGtY8B2ALgKaEBc0EBATgJZ4Dm0AvNAESsDcm2EYAtkQCCEABTwCACyJVykmhACUqbtmhUiBAK5U80cVKoA6XIRIFmTFnIjH8xQlyzQAvpmdA)

This is different from writing `other: Box` — if you have a derived class, its `sameAs` method will now only accept other instances of that same derived class:

ts

`class Box {`

  `content: string = "";`

  `sameAs(other: this) {`

    `return other.content === this.content;`

  `}`

`}`

`class DerivedBox extends Box {`

  `otherContent: string = "?";`

`}`

`const base = new Box();`

`const derived = new DerivedBox();`

`derived.sameAs(base);`

`Argument of type 'Box' is not assignable to parameter of type 'DerivedBox'.   Property 'otherContent' is missing in type 'Box' but required in type 'DerivedBox'.2345Argument of type 'Box' is not assignable to parameter of type 'DerivedBox'.   Property 'otherContent' is missing in type 'Box' but required in type 'DerivedBox'.`[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwGYAsBWAsAFADGANgIaKKgBCcAHqAN6GihFwB2ALpN6ol2gBLDgHNQAXlAAiaQG4WoRGQC2kAIKIAFHC4ALGKn1DEASiaLW0SFwCu0DqF0HoAOnbdeXSRKnHE7pw83AoErAC+hJEEhKQUVAAiMEIAbpAAJrQMkHTB6VRZFmFO+jAAwkFe-IIi4lLSAPzyUYSxnAKgAEYUkJKgHJAA7jT0WqahHh3pyWnpfQPDScKzWWOh08sZrspqmlrdiJDjQA)

### [](#this-based-type-guards)`this`\-based type guards

You can use `this is Type` in the return position for methods in classes and interfaces. When mixed with a type narrowing (e.g. `if` statements) the type of the target object would be narrowed to the specified `Type`.

ts

`class FileSystemObject {`

  `isFile(): this is FileRep {`

    `return this instanceof FileRep;`

  `}`

  `isDirectory(): this is Directory {`

    `return this instanceof Directory;`

  `}`

  `isNetworked(): this is Networked & this {`

    `return this.networked;`

  `}`

  `constructor(public path: string, private networked: boolean) {}`

`}`

`class FileRep extends FileSystemObject {`

  `constructor(path: string, public content: string) {`

    `super(path, false);`

  `}`

`}`

`class Directory extends FileSystemObject {`

  `children: FileSystemObject[];`

`}`

`interface Networked {`

  `host: string;`

`}`

`const fso: FileSystemObject = new FileRep("foo/bar.txt", "foo");`

`if (fso.isFile()) {`

  `fso.content;`

  `const fso: FileRep`

`} else if (fso.isDirectory()) {`

  `fso.children;`

  `const fso: Directory`

`} else if (fso.isNetworked()) {`

  `fso.host;`

  `const fso: Networked & FileSystemObject`

`}`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEGcBcCcEsDG0AKsD2AHApraBPASQDt5p4BDAG3gC8Lz1iAuUAM2smwFgAoRKhUiRQAMXhVsAZXwxsAWwDyAIwBW2ZKADefUKHiRxkgBQBKVtAAWB-SKPYAStkzbde0LGzQArrGKgrG3hiGApiRGx0NjEJR2cAbjcAXzcDABF4T2R0WHwzC2sRGwys6Bz8V153Dy9ff0CikOgwiKjQEo0y3MSq0BTegwA5LwB3HIBrbAATfIDC21Bh6DHYSanQADI5mx1evU8fP23IADpiUYnpnr1+vUQmGFhvbNhjTG9lGkRQTAZLVkewQA5gAaH4IABuDGwoHOy0uU1YynQ6EkYVM2n6-T4AiEdliThc2AAHtBsMQpvjJDI5Eo1J1KncHnBnl03n8AXBgWD3p8kKB7sQyULOQhiECMbtqpBvDhXr8rGCOFQuKZrn0+Nj+IJhO1Mp1yqAScLKTFqbIyXT1JopQLrFQpp4WGbpBaFCprdAANoAXR6WuCZNgHAiiwuq2mjNAlnQMFFwP9fBxzPYkHQrHsNMtHoZAF5YdgRi7CcYAERsFHAZQUWAnaCk0tg8so0tqpO8eDRYxsNMnAz2MyStw99AnQXC6A9ECgAB6AH5NUaVTDO6Bu730vqXnlTEPeiOx-bHeSp2B54vsMv9F2D0Nw2tB1GDzGYKfZwveEkgA)

A common use-case for a this-based type guard is to allow for lazy validation of a particular field. For example, this case removes an `undefined` from the value held inside box when `hasValue` has been verified to be true:

ts

`class Box<T> {`

  `value?: T;`

  `hasValue(): this is { value: T } {`

    `return this.value !== undefined;`

  `}`

`}`

`const box = new Box<string>();`

`box.value = "Gameboy";`

`box.value;`

     `(property) Box<string>.value?: string`

`if (box.hasValue()) {`

  `box.value;`

       `(property) value: string`

`}`

[Try](https://www.typescriptlang.org/play/#code/MYGwhgzhAEBCD2APAPAFQHzQN4FgBQ00AbmCAK4CmA-AFzSoDc++hAFpAGqmUAUAlHQAurAJYwx2Ytwp1U0AL7YWhaACcKgsqoB20YWIB0JchWgBCALwXoZbQBMKAMxHaKdpgQX55zPMHjaEILQAEZI0NauAO5wSMhBqi4A5uj8HmGIRtIR0ABEAOJgALYUYQCeuR74GVkmHgD09YQAelS+Io7QPDXsEFwm-HxKnjXGlB6EjS1tePJAA)

## [](#parameter-properties)Parameter Properties

TypeScript offers special syntax for turning a constructor parameter into a class property with the same name and value. These are called _parameter properties_ and are created by prefixing a constructor argument with one of the visibility modifiers `public`, `private`, `protected`, or `readonly`. The resulting field gets those modifier(s):

ts

`class Params {`

  `constructor(`

    `public readonly x: number,`

    `protected y: number,`

    `private z: number`

  `) {`

    `// No body necessary`

  `}`

`}`

`const a = new Params(1, 2, 3);`

`console.log(a.x);`

             `(property) Params.x: number`

`console.log(a.z);`

`Property 'z' is private and only accessible within class 'Params'.2341Property 'z' is private and only accessible within class 'Params'.`[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwGYAsBGAsAFADGANgIaKKgAKZ0ZAtlQN6GihFwB2iALtAFcivBAAo27UAAcBAIxIBLIqGiQyAE24kAnqAAeqLgIayYAGgnsp8XpGGR1obYeOnoFgpOnQFANzK2oABeLiYwEgCUoKyekiCgAHJwoLJw6rpcdpCUdNoSAL6EhcTcfKBkoAC8oJkA7jR0jIiiOGbobRgRANyEnDxwJJAAdCRwAOaiZEN63YTxXgvsAHoA-L2lA8OjE1NB3UA)

## [](#class-expressions)Class Expressions

> Background Reading:  
> [Class expressions (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/class)  

Class expressions are very similar to class declarations. The only real difference is that class expressions don’t need a name, though we can refer to them via whatever identifier they ended up bound to:

ts

`const someClass = class<Type> {`

  `content: Type;`

  `constructor(value: Type) {`

    `this.content = value;`

  `}`

`};`

`const m = new someClass("Hello, world");`

     `const m: someClass<string>`

[Try](https://www.typescriptlang.org/play/#code/MYewdgzgLgBBIFsCmBhANgQwhGBeGwm2APACoCeADkgHwwDeAsAFAwHhRJhQBcMF1ANws2oSFABOAV2BQQEgBQA3DGilI+ApAEoGItjCgALAJYQAdGM7c8MFWqTDWMAL4sXTlmOgwEtsEgA7nCIqEQQCgBEABJIaGggADQwgfJoACaR2k4A9DkGMAB6APxAA)

## [](#constructor-signatures)Constructor Signatures

JavaScript classes are instantiated with the `new` operator. Given the type of a class itself, the [InstanceType](https://www.typescriptlang.org/docs/handbook/utility-types.html#instancetypetype) utility type models this operation.

ts

`class Point {`

  `createdAt: number;`

  `x: number;`

  `y: number`

  `constructor(x: number, y: number) {`

    `this.createdAt = Date.now()`

    `this.x = x;`

    `this.y = y;`

  `}`

`}`

`type PointInstance = InstanceType<typeof Point>`

`function moveRight(point: PointInstance) {`

  `point.x += 5;`

`}`

`const point = new Point(3, 4);`

`moveRight(point);`

`point.x; // => 8`

[Try](https://www.typescriptlang.org/play/#code/MYGwhgzhAEAKD2BLAdgF2gbwLAChrWACcBTMVYgEwEFUAuaZAVwFsAjYwgbl3wA96mbDtzzQAngJbtCPAvGQRUhRsFTxCACn4MpHADTjJQwgEpMs-KgAWiCADoipctXQBeaABEyxO8ngB3DRMLaGtbO15od14RfEsbezEo8VjoAF9cDJxUMQAHYjgkNABJBVQwZGAC91LFCqqAFTziAB4c-PgAM0KUVAA+XFxOxkrURHloZngAN2IAJUQAcytUDVyiuh6SsvriM2xRdd6I6ABqdwBWESzcYHlFaCO0ZORify3VgGYDABYTESmswWy1WT1Q-1wYIinGgAHpYVE+tAABxAA)

## [](#abstract-classes-and-members)`abstract` Classes and Members

Classes, methods, and fields in TypeScript may be _abstract_.

An _abstract method_ or _abstract field_ is one that hasn’t had an implementation provided. These members must exist inside an _abstract class_, which cannot be directly instantiated.

The role of abstract classes is to serve as a base class for subclasses which do implement all the abstract members. When a class doesn’t have any abstract members, it is said to be _concrete_.

Let’s look at an example:

ts

`abstract class Base {`

  `abstract getName(): string;`

  `printName() {`

    `console.log("Hello, " + this.getName());`

  `}`

`}`

`const b = new Base();`

`Cannot create an instance of an abstract class.2511Cannot create an instance of an abstract class.`[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwFYCMWCwAoAQwCNEAXaQgYzNCoBtDFFQAhJyUAbwNFBPKUaoAOaQyAOUIBbSAAoAlKkEBLAHYiA3AV6gADtHWSZ8hd118qcNYjj1IAOnpwRcgEQAJSPWcAaUG6gANSgZAAWKogOYsayigra+HwAvgSp+ARWNrTEoAC8oGqQAO5sHIqaQA)

We can’t instantiate `Base` with `new` because it’s abstract. Instead, we need to make a derived class and implement the abstract members:

ts

`class Derived extends Base {`

  `getName() {`

    `return "world";`

  `}`

`}`

`const d = new Derived();`

`d.printName();`

[Try](https://www.typescriptlang.org/play/#code/IYIwzgLgTsDGEAJYBthjAgQmgpgg3gLABQCCokM8CA5jhAHLAC2OAFAJQBcClAlgDsaAbhJkADlEGMW7DgQC+JJcQD0qhAFptsAK4RtmkijQYAIjikA3HABMEOAB4QcA2xmxg8RUrXpNWTgIxMgQoel0oAQQAIgB3AHsoZFsY0V8VFWMEgUgEewBeBAEcOIQLaztOdNsAOklpALlhIA)

Notice that if we forget to implement the base class’s abstract members, we’ll get an error:

ts

`class Derived extends Base {`

`Non-abstract class 'Derived' does not implement inherited abstract member getName from class 'Base'.2515Non-abstract class 'Derived' does not implement inherited abstract member getName from class 'Base'.    // forgot to do anything  }  `[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwFYCMGCwAoAQwCNEAXaQgYzNCoBtDFFQAhJyUAbwNFBPKUaoAOaQyAOUIBbSAAoAlKkEBLAHYiA3L1AAHaOskz5C7gF8CF-CFABae1QCuZe7YIMmLACIwVAN0gAE1BIAA8ySDVAlnZETh58PhsAMwQROFoyOFBA7MI1AE8yAAt1EUsgA)

### [](#abstract-construct-signatures)Abstract Construct Signatures

Sometimes you want to accept some class constructor function that produces an instance of a class which derives from some abstract class.

For example, you might want to write this code:

ts

`function greet(ctor: typeof Base) {`

  `const instance = new ctor();`

`Cannot create an instance of an abstract class.2511Cannot create an instance of an abstract class.    instance.printName();  }  `[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwFYCMWCwAoAQwCNEAXaQgYzNCoBtDFFQAhJyUAbwNFBPKUaoAOaQyAOUIBbSAAoAlKkEBLAHYiA3L1AAHaOskz5C7gF8CF-AyYsAIjBUA3SABNQkAB5lIa1y3ZETh58PjEjWUVuHT5ocQBXaDVQACIU7VDQKysQUABaAqp4sgK8ggAzeLUaFThkkTjxORoEVDIAT11IOHK2DlMQvio68lB1ckJqzgBeUDVIAHc6MgRFDL5xskmqSAA6fUMpSIUMsyA)

TypeScript is correctly telling you that you’re trying to instantiate an abstract class. After all, given the definition of `greet`, it’s perfectly legal to write this code, which would end up constructing an abstract class:

ts

`// Bad!`

`greet(Base);`

[Try](https://www.typescriptlang.org/play/#code/CYUwxgNghgTiAEYD2A7AzgF3gcziDAXPFCgJ4A08AQlGiESaQNwCwAUAPQfwC0fYAVwx8e7LtSjAAhO1wh8AChp0AlEyA)

Instead, you want to write a function that accepts something with a construct signature:

ts

`function greet(ctor: new () => Base) {`

  `const instance = new ctor();`

  `instance.printName();`

`}`

`greet(Derived);`

`greet(Base);`

`Argument of type 'typeof Base' is not assignable to parameter of type 'new () => Base'.   Cannot assign an abstract constructor type to a non-abstract constructor type.2345Argument of type 'typeof Base' is not assignable to parameter of type 'new () => Base'.   Cannot assign an abstract constructor type to a non-abstract constructor type.`[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwGYAsBWAsAFACGARogC7REDG5o1ANkYoqAELOSgDehoopClVqgA5pHIA5IgFtIACgCUqIQEsAdqIDcfUAAdoGqbIWKeAX0KWCjZqwAiMVQDdIAE1CQAHuUjq3rByIXLwE-OLGcko8uvzQEgCu0OqgAESpOmGg1tYgoAC0hdQJ5IX5hABmCeq0qnApovES8rQIqOqQAO6g0QC8AHzsnGah-NT1FKAaFEQ1XL2gHd2t0EqZ-NPks9SQAHQGRtJRipnWjZDNjoaubieE581BkCdAA)

Now TypeScript correctly tells you about which class constructor functions can be invoked - `Derived` can because it’s concrete, but `Base` cannot.

## [](#relationships-between-classes)Relationships Between Classes

In most cases, classes in TypeScript are compared structurally, the same as other types.

For example, these two classes can be used in place of each other because they’re identical:

ts

`class Point1 {`

  `x = 0;`

  `y = 0;`

`}`

`class Point2 {`

  `x = 0;`

  `y = 0;`

`}`

`// OK`

`const p: Point1 = new Point2();`

[Try](https://www.typescriptlang.org/play/#code/MYGwhgzhAEAKD2BLAdgFwIzQN4FgBQ00AHtALzQAMA3PoQJ5mU14C+++okMCKqATNlrFG1IQ3KjW7PAHoZ0APIBpDvGQRU0AA4AuOEjSZyyAKYB3fbz4AKAJRUgA)

Similarly, subtype relationships between classes exist even if there’s no explicit inheritance:

ts

`class Person {`

  `name: string;`

  `age: number;`

`}`

`class Employee {`

  `name: string;`

  `age: number;`

  `salary: number;`

`}`

`// OK`

`const p: Person = new Employee();`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEGcBcCcEsDG0BcoBmBDANpApgLABQi2mkkoACnrJAPYB2oA3saKI5gLZ5owJGAcwDc7UJiF9OAV24AjWmKIBfYsVLlKAUW4AHbPQCeePK3Fde-OPGHKOk6YzmLY90JByZYRtM4VKxGpExCCgAPIA0hpMMKB6aDR0TKAAvJx4AO6gugbGpgAUAJQiQA)

This sounds straightforward, but there are a few cases that seem stranger than others.

Empty classes have no members. In a structural type system, a type with no members is generally a supertype of anything else. So if you write an empty class (don’t!), anything can be used in place of it:

ts

`class Empty {}`

`function fn(x: Empty) {`

  `// can't do anything with 'x', so I won't`

`}`

`// All OK!`

`fn(window);`

`fn({});`

`fn(fn);`

[Try](https://www.typescriptlang.org/play/#code/MYGwhgzhAECiC2AHALgT2gbwL4FgBQ+AZgK4B2wyAlgPanSGkAUAHgFxxJoCUm+00AegHRgYUgHJk0ACbVoY1MgAWlUgHNoAd0rLo45uIA00CHICSW2pPy4CeIdACCIENADyAaQCERJttKymlwA3L6M2CFhDCFAA)
