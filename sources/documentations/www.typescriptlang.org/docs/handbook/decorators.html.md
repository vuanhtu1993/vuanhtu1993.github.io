---
title: "Documentation - Decorators"
source_url: "https://www.typescriptlang.org/docs/handbook/decorators.html"
crawled_at: "2026-07-02T07:37:34.149Z"
---

> NOTE  This document refers to an experimental stage 2 decorators implementation. Stage 3 decorator support is available since Typescript 5.0. See: [Decorators in Typescript 5.0](https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/#decorators)

## [](#introduction)Introduction

With the introduction of Classes in TypeScript and ES6, there now exist certain scenarios that require additional features to support annotating or modifying classes and class members. Decorators provide a way to add both annotations and a meta-programming syntax for class declarations and members.

> Further Reading (stage 2): [A Complete Guide to TypeScript Decorators](https://saul-mirone.github.io/a-complete-guide-to-typescript-decorator/)

To enable experimental support for decorators, you must enable the [`experimentalDecorators`](https://www.typescriptlang.org/tsconfig#experimentalDecorators) compiler option either on the command line or in your `tsconfig.json`:

**Command Line**:

shell

`tsc --target ES5 --experimentalDecorators`

**tsconfig.json**:

`{`

  `"": {`

    `"": "ES5",`

    `"": true`

  `}`

`}`

## [](#decorators)Decorators

A _Decorator_ is a special kind of declaration that can be attached to a [class declaration](#class-decorators), [method](#method-decorators), [accessor](#accessor-decorators), [property](#property-decorators), or [parameter](#parameter-decorators). Decorators use the form `@expression`, where `expression` must evaluate to a function that will be called at runtime with information about the decorated declaration.

For example, given the decorator `@sealed` we might write the `sealed` function as follows:

ts

`function sealed(target) {`

  `// do something with 'target' ...`

`}`

## [](#decorator-factories)Decorator Factories

If we want to customize how a decorator is applied to a declaration, we can write a decorator factory. A _Decorator Factory_ is simply a function that returns the expression that will be called by the decorator at runtime.

We can write a decorator factory in the following fashion:

ts

`function color(value: string) {`

  `// this is the decorator factory, it sets up`

  `// the returned decorator function`

  `return function (target) {`

    `// this is the decorator`

    `// do something with 'target' and 'value'...`

  `};`

`}`

## [](#decorator-composition)Decorator Composition

Multiple decorators can be applied to a declaration, for example on a single line:

```
ts
```

On multiple lines:

```
ts
```

When multiple decorators apply to a single declaration, their evaluation is similar to [function composition in mathematics](https://wikipedia.org/wiki/Function_composition). In this model, when composing functions _f_ and _g_, the resulting composite (_f_ ∘ _g_)(_x_) is equivalent to _f_(_g_(_x_)).

As such, the following steps are performed when evaluating multiple decorators on a single declaration in TypeScript:

1.  The expressions for each decorator are evaluated top-to-bottom.
2.  The results are then called as functions from bottom-to-top.

If we were to use [decorator factories](#decorator-factories), we can observe this evaluation order with the following example:

ts

`function first() {`

  `console.log("first(): factory evaluated");`

  `return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {`

    `console.log("first(): called");`

  `};`

`}`

`function second() {`

  `console.log("second(): factory evaluated");`

  `return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {`

    `console.log("second(): called");`

  `};`

`}`

`class ExampleClass {`

  `@first()`

  `@second()`

  `method() {}`

`}`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMA8AdIE4EsC2kB2AXAhgGwCKQDGA9gtpmQM4BQAZgK7pGZInqh1IJWYAUASlABvGqFCl0VErkgA6XCQDmfAERce-AQC5O2FmQCeoSADc8DCpAAmqgQG4xoBJEwMEHRs1btQfHAhKrrrY6IYANKCwCCTwCJiGANKQhrq8yOhKkdaQVETIsJQIugAKMXEJhHkFRUKi4uKS0rIKymoavIK6RHiytg5OAL6OgzT0TCxsHFTE7NaCIk5NMvKKKqozkvM6egYIxmYWVv2O4i5uHpwTPhz+2IHBoKERUeWICcmpoOlImdm5+SQhTIpTe8UMVUBwIQdScjXYzVWbQ2s3Q226vRsdlOoGGNFGNCIuGwVCooAAotBsChYLIAMLE0mLcTgDpaJzgTZzQRONCYAAWJG2IlGgyAA)

Which would print this output to the console:

shell

`first(): factory evaluated`

`second(): factory evaluated`

`second(): called`

`first(): called`

## [](#decorator-evaluation)Decorator Evaluation

There is a well defined order to how decorators applied to various declarations inside of a class are applied:

1.  _Parameter Decorators_, followed by _Method_, _Accessor_, or _Property Decorators_ are applied for each instance member.
2.  _Parameter Decorators_, followed by _Method_, _Accessor_, or _Property Decorators_ are applied for each static member.
3.  _Parameter Decorators_ are applied for the constructor.
4.  _Class Decorators_ are applied for the class.

## [](#class-decorators)Class Decorators

A _Class Decorator_ is declared just before a class declaration. The class decorator is applied to the constructor of the class and can be used to observe, modify, or replace a class definition. A class decorator cannot be used in a declaration file, or in any other ambient context (such as on a `declare` class).

The expression for the class decorator will be called as a function at runtime, with the constructor of the decorated class as its only argument.

If the class decorator returns a value, it will replace the class declaration with the provided constructor function.

> NOTE  Should you choose to return a new constructor function, you must take care to maintain the original prototype. The logic that applies decorators at runtime will **not** do this for you.

The following is an example of a class decorator (`@sealed`) applied to a `BugReport` class:

ts

`@sealed`

`class BugReport {`

  `type = "report";`

  `title: string;`

  `constructor(t: string) {`

    `this.title = t;`

  `}`

`}`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMA8AdIE4EsC2kB2AXAhgGwCKQDGA9gtpmQM4BQAZgK7pGZInqhWR6QAmAFKXRVMCBizIAuUADEmLNugCUoAN41QoAPIAjAFbFMAOi55B7EWIkIlAbg3b9hk91znho8ZQRHYCEpSYAJ7wdjQAvjQgoAC0cUQMmHExNOCmuHw0RLjYVFSgAEIMAOYASpCwZJhqDsHwoAC8oABECBVVzfaarJgZ0pZI6MX2DkKWXmT8mP2ig8Uq6prdABZIVEY9GY2gmF2gkeFAA)

We can define the `@sealed` decorator using the following function declaration:

ts

`function sealed(constructor: Function) {`

  `Object.seal(constructor);`

  `Object.seal(constructor.prototype);`

`}`

When `@sealed` is executed, it will seal both the constructor and its prototype, and will therefore prevent any further functionality from being added to or removed from this class during runtime by accessing `BugReport.prototype` or by defining properties on `BugReport` itself (note that ES2015 classes are really just syntactic sugar to prototype-based constructor functions). This decorator does **not** prevent classes from sub-classing `BugReport`.

Next we have an example of how to override the constructor to set new defaults.

ts

`function reportableClassDecorator<T extends { new (...args: any[]): {} }>(constructor: T) {`

  `return class extends constructor {`

    `reportingURL = "http://www...";`

  `};`

`}`

`@reportableClassDecorator`

`class BugReport {`

  `type = "report";`

  `title: string;`

  `constructor(t: string) {`

    `this.title = t;`

  `}`

`}`

`const bug = new BugReport("Needs dark mode");`

`console.log(bug.title); // Prints "Needs dark mode"`

`console.log(bug.type); // Prints "report"`

`// Note that the decorator _does not_ change the TypeScript type`

`// and so the new property `reportingURL` is not known`

`// to the type system:`

`bug.reportingURL;`

`Property 'reportingURL' does not exist on type 'BugReport'.2339Property 'reportingURL' does not exist on type 'BugReport'.`[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwGYME4BQIJIAPABxgEsBbSAOwBcBDAGwBFIBjBBuhRXAMwCuNdnXJwaoaJBIJGAIyaQAwkwaJEbTtG4IAPABVQxOrQAmiUAG9QNSAHdQACgB0bhtADmKUAxoBPAG0AXQBKVCsAX1BIgD4nThpEOmhBUQRUA1DrXFApSDpBaEl2NQ1jIlMaC1BE5NT06By8vOlZaDEaTwBVACUAGVAAXlAAIgALOjoSZBB7ebcXUYBuXJjVyNxccDa5BkUVMs0OLh5oXFL1SwAhQU9emTlm0Dp-MmGx3Y6VtbE6JVQ9XIXVWazqKTSZycdEBKWBnmyVjWeTo43IiBcfyUHzoqzym02FwkyVA8juHzsjlu90eHScowAcpBIDUzB4ANagShwMyQUahVZ1OBKFxMOCeJxkzyY8j-SAC0AEAAK0GBdEsjOZrI5XJ5fKJSWFkFF4sld0xb3ly0VYBVao1Xzooy2BAZcFML3G3E9kFAvO0uiaAH0zHBIJYaO6g7UvV1fajfQZLQBldiqkh0F6W-BgPxmUCIOA+2wOUAkeBkDr+UAAA0d8L6-RroHRtndoHZkfsNBzLyLCaz70Q-mSkEoyFwUpc9a6jeWQA)

## [](#method-decorators)Method Decorators

A _Method Decorator_ is declared just before a method declaration. The decorator is applied to the _Property Descriptor_ for the method, and can be used to observe, modify, or replace a method definition. A method decorator cannot be used in a declaration file, on an overload, or in any other ambient context (such as in a `declare` class).

The expression for the method decorator will be called as a function at runtime, with the following three arguments:

1.  Either the constructor function of the class for a static member, or the prototype of the class for an instance member.
2.  The name of the member.
3.  The _Property Descriptor_ for the member.

> NOTE  The _Property Descriptor_ will be `undefined` if your script target is less than `ES5`.

If the method decorator returns a value, it will be used as the _Property Descriptor_ for the method.

> NOTE  The return value is ignored if your script target is less than `ES5`.

The following is an example of a method decorator (`@enumerable`) applied to a method on the `Greeter` class:

ts

`class Greeter {`

  `greeting: string;`

  `constructor(message: string) {`

    `this.greeting = message;`

  `}`

  `@enumerable(false)`

  `greet() {`

    `return "Hello, " + this.greeting;`

  `}`

`}`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMA8AdIE4EsC2kB2AXAhgGwCKQDGA9gtpmQM4BQAZgK7pGZInqgYNrkBGukABQA3PA0gAuULxIkB2dAEpQAbxqhQCSJgYIOjZq3ahBOBAHNtUhQE8ANLAQl4CTDYDSkG1KqZk6czsAE0gqImRYSgQpAAUnFzdCMIio5TUNDRDkpEiyADouHmx+SFAAXlBRXHEAbnVQAF86hpoQUABaTqIGTE72miJcbCoqUABxLW1EVXrzSdYAnz8kALqNUnRfBAYWMkE0EexLJf9zNPqNTAALJCo8uchtFfNy0AOqI8g1xpp6qHRuIhigJBHQ8FRIIpZvNBOcMpptLoOAAiAASkFwuBIdlAyNAAGpQNdbvd5s9vi0GkA)

We can define the `@enumerable` decorator using the following function declaration:

ts

`function enumerable(value: boolean) {`

  `return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {`

    `descriptor.enumerable = value;`

  `};`

`}`

[Try](https://www.typescriptlang.org/play/#code/GYVwdgxgLglg9mABAUzCAtsgTgQwEYA2yAFAG44EjIBcieccROYAlIgN4BQiiWyUILElCRYCRMSg4sAc361mATwA0iAA5Y4a7FEUBpZItoBnKFhhgZqgCbJjEc2qhwstAAqbtWXQBE7DmCcXNi4eHlt7R2csADpUDGx8IkQAXkRySmQAbm5EAF8cvKA)

The `@enumerable(false)` decorator here is a [decorator factory](#decorator-factories). When the `@enumerable(false)` decorator is called, it modifies the `enumerable` property of the property descriptor.

## [](#accessor-decorators)Accessor Decorators

An _Accessor Decorator_ is declared just before an accessor declaration. The accessor decorator is applied to the _Property Descriptor_ for the accessor and can be used to observe, modify, or replace an accessor’s definitions. An accessor decorator cannot be used in a declaration file, or in any other ambient context (such as in a `declare` class).

> NOTE  TypeScript disallows decorating both the `get` and `set` accessor for a single member. Instead, all decorators for the member must be applied to the first accessor specified in document order. This is because decorators apply to a _Property Descriptor_, which combines both the `get` and `set` accessor, not each declaration separately.

The expression for the accessor decorator will be called as a function at runtime, with the following three arguments:

1.  Either the constructor function of the class for a static member, or the prototype of the class for an instance member.
2.  The name of the member.
3.  The _Property Descriptor_ for the member.

> NOTE  The _Property Descriptor_ will be `undefined` if your script target is less than `ES5`.

If the accessor decorator returns a value, it will be used as the _Property Descriptor_ for the member.

> NOTE  The return value is ignored if your script target is less than `ES5`.

The following is an example of an accessor decorator (`@configurable`) applied to a member of the `Point` class:

ts

`class Point {`

  `private _x: number;`

  `private _y: number;`

  `constructor(x: number, y: number) {`

    `this._x = x;`

    `this._y = y;`

  `}`

  `@configurable(false)`

  `get x() {`

    `return this._x;`

  `}`

  `@configurable(false)`

  `get y() {`

    `return this._y;`

  `}`

`}`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMA8AdIE4EsC2kB2AXAhgGwCKQDGA9gtpmQM4BQAZgK7pGZInqinp1IDmD5AEa5IACgBueBpABcoQSRIjs6AJSgA3jVCgEkTAI6NmrdqFHadoHAl765KgJ4AaSztgIS8BJkcBpSEc5KkxkdF5XK1AAE0gqImRYSgQ5AAVPb19CeMTky3UtKNicpCSyADouHn4hEVAAXlBJXGkAbksAX3aOmhBQAFpBogZMQf6aIlxsKipQVJIkLE1LDyRJTEhQAH1oOXQGFEFEdvdkdc2toNB9w+PLLhCEBhYyUV3rg6OEZ1Arm6+Cm5rAALJBUco7BqgaAnKyYUHgy5QxywnqWcBVPgCbDCMR0PBUSCqSx2TDQ0SAqJ6AwIDjwsEQmGdGjozE1HEiUT43CE4k6Um-CnLKn6QwghmXVE0DpAA)

We can define the `@configurable` decorator using the following function declaration:

ts

`function configurable(value: boolean) {`

  `return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {`

    `descriptor.configurable = value;`

  `};`

`}`

## [](#property-decorators)Property Decorators

A _Property Decorator_ is declared just before a property declaration. A property decorator cannot be used in a declaration file, or in any other ambient context (such as in a `declare` class).

The expression for the property decorator will be called as a function at runtime, with the following two arguments:

1.  Either the constructor function of the class for a static member, or the prototype of the class for an instance member.
2.  The name of the member.

> NOTE  A _Property Descriptor_ is not provided as an argument to a property decorator due to how property decorators are initialized in TypeScript. This is because there is currently no mechanism to describe an instance property when defining members of a prototype, and no way to observe or modify the initializer for a property. The return value is ignored too. As such, a property decorator can only be used to observe that a property of a specific name has been declared for a class.

We can use this information to record metadata about the property, as in the following example:

ts

`class Greeter {`

  `@format("Hello, %s")`

  `greeting: string;`

  `constructor(message: string) {`

    `this.greeting = message;`

  `}`

  `greet() {`

    `let formatString = getFormat(this, "greeting");`

    `return formatString.replace("%s", this.greeting);`

  `}`

`}`

We can then define the `@format` decorator and `getFormat` functions using the following function declarations:

ts

`import "reflect-metadata";`

`const formatMetadataKey = Symbol("format");`

`function format(formatString: string) {`

  `return Reflect.metadata(formatMetadataKey, formatString);`

`}`

`function getFormat(target: any, propertyKey: string) {`

  `return Reflect.getMetadata(formatMetadataKey, target, propertyKey);`

`}`

The `@format("Hello, %s")` decorator here is a [decorator factory](#decorator-factories). When `@format("Hello, %s")` is called, it adds a metadata entry for the property using the `Reflect.metadata` function from the `reflect-metadata` library. When `getFormat` is called, it reads the metadata value for the format.

> NOTE  This example requires the `reflect-metadata` library. See [Metadata](#metadata) for more information about the `reflect-metadata` library.

## [](#parameter-decorators)Parameter Decorators

A _Parameter Decorator_ is declared just before a parameter declaration. The parameter decorator is applied to the function for a class constructor or method declaration. A parameter decorator cannot be used in a declaration file, an overload, or in any other ambient context (such as in a `declare` class).

The expression for the parameter decorator will be called as a function at runtime, with the following three arguments:

1.  Either the constructor function of the class for a static member, or the prototype of the class for an instance member.
2.  The name of the member.
3.  The ordinal index of the parameter in the function’s parameter list.

> NOTE  A parameter decorator can only be used to observe that a parameter has been declared on a method.

The return value of the parameter decorator is ignored.

The following is an example of a parameter decorator (`@required`) applied to parameter of a member of the `BugReport` class:

ts

`class BugReport {`

  `type = "report";`

  `title: string;`

  `constructor(t: string) {`

    `this.title = t;`

  `}`

  `@validate`

  `print(@required verbose: boolean) {`

    `if (verbose) {`

      `return `type: ${this.type}\ntitle: ${this.title}`;`

    `} else {`

     `return this.title;` 

    `}`

  `}`

`}`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMA8AdIE4EsC2kB2AXAhgGwCKQDGA9gtpmQM4BQAZgK7pGZInqgBueSAJhZAAUOBAHNImAFyhs6AJ4AaULAQl4CTHIBy2NNKqZk6UUt6QqRZLEoJpAFTnxeABVXrNhC1ZsAeWXIA+AEpQAG8AX3omFjYOBEgARwYkeN5hbDEJaQB5ACMAK2JMJRU1RE0AaUg5fUMkY1AAH1AqORRcklwSjN0JRABJdDNoaXQGdsQQiJoQUABaBaIGTAW5miJcbCoqUAAhBlEAJUhYMkwwmlBQTXhQAF5QACJ4041HgG5L66RMXEhaoyiT5fUjoAwIBgsMjCAH1URTL5XTAACyQVAAdKxfpB7tdPldIl9wNxcHwBF8VPVMIJwPEkilILwuIgOlR-qAOp1ILIEVcrkg6KBBJwWSQ2by+Vd4pgGAgOAADG7sgAkoRRaMxjkg4QAOlgfn9pKr1RisX9wvL8XzwqBILg2RdJaBpbKOCbMQbIO9QIjQJECTRwkA)

We can then define the `@required` and `@validate` decorators using the following function declarations:

ts

`import "reflect-metadata";`

`const requiredMetadataKey = Symbol("required");`

`function required(target: Object, propertyKey: string | symbol, parameterIndex: number) {`

  `let existingRequiredParameters: number[] = Reflect.getOwnMetadata(requiredMetadataKey, target, propertyKey) || [];`

  `existingRequiredParameters.push(parameterIndex);`

  `Reflect.defineMetadata( requiredMetadataKey, existingRequiredParameters, target, propertyKey);`

`}`

`function validate(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {`

  `let method = descriptor.value!;`

  `descriptor.value = function () {`

    `let requiredParameters: number[] = Reflect.getOwnMetadata(requiredMetadataKey, target, propertyName);`

    `if (requiredParameters) {`

      `for (let parameterIndex of requiredParameters) {`

        `if (parameterIndex >= arguments.length || arguments[parameterIndex] === undefined) {`

          `throw new Error("Missing required argument.");`

        `}`

      `}`

    `}`

    `return method.apply(this, arguments);`

  `};`

`}`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMA8AdIE4EsC2kB2AXAhgGwCKQDGA9gtpmQM4BQIEkKSmhp5lCAspDgCYXYaqWGUygARAkgAzXMUwBaNHwHiA3DVLoqYqQEcArkim9uKnAGlIAT1ABeUAGVrKAEYlcACkmRDxyLziAJQaNNIG6ESYSCTooPpGJp44CADmPABcoADyrgBW8gA0oLAIJPAImNZW1lk6yOipoAA+oFQu7rjFsNjkyogAkui8MFnoBm6IQaAA3jSgoHJiMEg6SI0ASr6JAQAKvdj9CFRjE66IANoAuvagW7LyAHTpmNkA7uhm2Pw4ngn+ph43wENWKKRe3TKFSqNWmzVa1w0CxWa022wB+z6PEQVEesAMVAAFp4eljMINhjAQvM7jI5FFHiNpOtIF8fthPPF0SY2SCbMUUdE0X4TJjDtjjmDehCSlDEDCbNSAL40MIRKIxOIANzwSB+kGS0syoGw6GskPK8usADlxXVMA1UsURlQiMhYBwsgAVazwXi7OWVayEV3ujgAHgAYurorEAHzTOYLJagZSEki8W4ut1ID1kR463AGSAAQlCC2zYfzheLt3CkVjcU8iZpyZ4XJFewORxOoHGkwQ11u93pmGePHenyB7L+3ICvMs-NA4J4FuhNvF1IWCyQ0lAs87-u7EqoLe32+kZH3KdJ4vJCCGI2goBIe-+ouP99Ps1b59Au-3W8jkfGBQDjBxpQmDBMFxORGkwQkWlaSC0CwKgLiAiUQOgG47Dw0AIiZFleDPP9zwQso3j7SAqIAUQQMoEG8ThViodYmnfAITTSKCsEeYIkTI0AVTIkTtzEhYpEwAwEDiNMM0ebBYFgXBrGSQlVmKFDoNPQSlQ0JUgA)

The `@required` decorator adds a metadata entry that marks the parameter as required. The `@validate` decorator then wraps the existing `print` method in a function that validates the arguments before invoking the original method.

> NOTE  This example requires the `reflect-metadata` library. See [Metadata](#metadata) for more information about the `reflect-metadata` library.

Some examples use the `reflect-metadata` library which adds a polyfill for an [experimental metadata API](https://github.com/rbuckton/ReflectDecorators). This library is not yet part of the ECMAScript (JavaScript) standard. However, once decorators are officially adopted as part of the ECMAScript standard these extensions will be proposed for adoption.

You can install this library via npm:

shell

`npm i reflect-metadata --save`

TypeScript includes experimental support for emitting certain types of metadata for declarations that have decorators. To enable this experimental support, you must set the [`emitDecoratorMetadata`](https://www.typescriptlang.org/tsconfig#emitDecoratorMetadata) compiler option either on the command line or in your `tsconfig.json`:

**Command Line**:

shell

`tsc --target ES5 --experimentalDecorators --emitDecoratorMetadata`

**tsconfig.json**:

`{`

  `"": {`

    `"": "ES5",`

    `"": true,`

    `"": true`

  `}`

`}`

When enabled, as long as the `reflect-metadata` library has been imported, additional design-time type information will be exposed at runtime.

We can see this in action in the following example:

ts

`import "reflect-metadata";`

`class Point {`

  `constructor(public x: number, public y: number) {}`

`}`

`class Line {`

  `private _start: Point;`

  `private _end: Point;`

  `@validate`

  `set start(value: Point) {`

    `this._start = value;`

  `}`

  `get start() {`

    `return this._start;`

  `}`

  `@validate`

  `set end(value: Point) {`

    `this._end = value;`

  `}`

  `get end() {`

    `return this._end;`

  `}`

`}`

`function validate<T>(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<T>) {`

  `let set = descriptor.set!;`

  `descriptor.set = function (value: T) {`

    `let type = Reflect.getMetadata("design:type", target, propertyKey);`

    `if (!(value instanceof type)) {`

      `throw new TypeError(`Invalid type, got ${typeof value} not ${type.name}.`);`

    `}`

    `set.call(this, value);`

  `};`

`}`

`const line = new Line()`

`line.start = new Point(0, 0)`

`// @ts-ignore`

`// line.end = {}`

`// Fails at runtime with:`

`// > Invalid type, got object not Point`

[Try](https://www.typescriptlang.org/play/#code/PTAEAEFMFsEsBcAikDGB7ATgQ3pgspPFgCY5YBQIEkAHgA6QazSQB2RANsutrhgM6Uw4fvCYp4ABQxoGGeAE8AkqwSwsHWAC8csNKwBcoAGYb+kcszqZ4oAEQZIxjqngBaFkVJE7AbnLkKBxY-Pygkmiw7KAA3uSgoOisohgArhKYABR0qQBGmiigNEasqdC5jAA0oDn5sIUKJWUVGACUsQC+5F2BwaGgADJRkLHxNUwAbjgjAPqiWPJGEVHw-gl0k9OgM2zES5Hs-mPgU5reFgnmtvPymaepkPsr7XEJCfAAFrD8AHRzRPJQABeUD3SBrUA9BIAc0IoBu8EyLzGCUc8FSGFYoE+3z+CIhUIgp1g5zGV1AuzuGgeT3YyLe2K+vx2rGIwNB1PBY0JsNslPpbzRGKxOOZuwJ3QCxlSrAkeixxPOAB4ACoAPkyAN5RiwrAU1Q2skYigA0pBGvCxFFodViJB+CgmHQ+EYVQoGMRpEb5ApkA6nXxVWqBS5rnCQXb-bBnZgflcAIQQsaRx3Rvhx8MmGVy-SgKkcGmgFUChKh7HukYggBKThcEh+vIIXjImTskdg0MMigYdmqWsIBpkclN5taRwZsGMefj+YeoCi81lkDQU+7kFaJbenxkAHdQKxIHu3QwAKIYGQYTIAAxUivLDGq0LQtgAJDE1yuOQXIB198-QG+a4-KwWAsB0PxXmOKKQgEDJXD8KAaBwmpMtUYJQQkHT+D0SSiKAmgHuyB57kMB5IuQBGQHGAK2CCxHhAciIAAzVExrQBFQ4DwPwbgdqwmAWFQlE-Ls7IxD0VAAGJYLAHBhDgoBpOwzAjDuCAfAYQigGqoC3hoJL3pAj7-mguQAFauH+tjLOw5BAA)

The TypeScript compiler will inject design-time type information using the `@Reflect.metadata` decorator. You could consider it the equivalent of the following TypeScript:

ts

`class Line {`

  `private _start: Point;`

  `private _end: Point;`

  `@validate`

  `@Reflect.metadata("design:type", Point)`

  `set start(value: Point) {`

    `this._start = value;`

  `}`

  `get start() {`

    `return this._start;`

  `}`

  `@validate`

  `@Reflect.metadata("design:type", Point)`

  `set end(value: Point) {`

    `this._end = value;`

  `}`

  `get end() {`

    `return this._end;`

  `}`

`}`

> NOTE  Decorator metadata is an experimental feature and may introduce breaking changes in future releases.
