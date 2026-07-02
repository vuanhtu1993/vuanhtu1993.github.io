---
title: "Documentation - Creating Types from Types"
source_url: "https://www.typescriptlang.org/docs/handbook/2/types-from-types.html"
crawled_at: "2026-07-02T07:36:55.576Z"
---

TypeScript’s type system is very powerful because it allows expressing types _in terms of other types_.

The simplest form of this idea is generics. Additionally, we have a wide variety of _type operators_ available to use. It’s also possible to express types in terms of _values_ that we already have.

By combining various type operators, we can express complex operations and values in a succinct, maintainable way. In this section we’ll cover ways to express a new type in terms of an existing type or value.

-   [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html) - Types which take parameters
-   [Keyof Type Operator](https://www.typescriptlang.org/docs/handbook/2/keyof-types.html) - Using the `keyof` operator to create new types
-   [Typeof Type Operator](https://www.typescriptlang.org/docs/handbook/2/typeof-types.html) - Using the `typeof` operator to create new types
-   [Indexed Access Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html) - Using `Type['a']` syntax to access a subset of a type
-   [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html) - Types which act like if statements in the type system
-   [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html) - Creating types by mapping each property in an existing type
-   [Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html) - Mapped types which change properties via template literal strings

The TypeScript docs are an open source project. Help us improve these pages [by sending a Pull Request](https://github.com/microsoft/TypeScript-Website/blob/v2/packages/documentation/copy/en/handbook-v2/Type%20Manipulation/_Creating%20Types%20from%20Types.md) ❤

Contributors to this page:

OT![Orta Therox  (6)](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782977816/aha-mind/docs-crawler/www.typescriptlang.org/49038_ohizvs.jpg)

GF![Graham Fisher  (1)](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782977816/aha-mind/docs-crawler/www.typescriptlang.org/17f72e3d32dca8852e79c078e2f3459819bc0e07e1c5f755d06fc6dc0aa0ce35_hdrzgy.png)

AP![Alexander Pepper  (1)](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782977816/aha-mind/docs-crawler/www.typescriptlang.org/850df7f9663dde77d709c17712433aa445507f474424d2f8991b54be74263d8d_padgtq.png)

PC![Pradeep Chauhan  (1)](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782977816/aha-mind/docs-crawler/www.typescriptlang.org/f696ff36977e958e37feabb1d420ef73f97f886c12fbefa2a6e1eb1c0f4f4d0f_h4keda.png)

Last updated: Jul 02, 2026

This page loaded in 0.68 seconds.
