---
title: "Documentation - Keyof Type Operator"
source_url: "https://www.typescriptlang.org/docs/handbook/2/keyof-types.html"
crawled_at: "2026-07-02T07:37:04.669Z"
---

## [](#the-keyof-type-operator)The `keyof` type operator

The `keyof` operator takes an object type and produces a string or numeric literal union of its keys. The following type `P` is the same type as `type P = "x" | "y"`:

ts

`type Point = { x: number; y: number };`

`type P = keyof Point;`

    `type P = keyof Point`

[Try](https://www.typescriptlang.org/play/#code/C4TwDgpgBACg9gSwHbCgXigbygDwFxRICuAtgEYQBOA3FCAceVVAL7UBQoks6UA1hBBwAZrEQoOAeklRZAPQD8QA)

If the type has a `string` or `number` index signature, `keyof` will return those types instead:

ts

`type Arrayish = { [n: number]: unknown };`

`type A = keyof Arrayish;`

    `type A = number`

`type Mapish = { [k: string]: boolean };`

`type M = keyof Mapish;`

    `type M = string | number`

[Try](https://www.typescriptlang.org/play/#code/C4TwDgpgBAggTnAhiAlgZwBZQLxQN5QDaAdgFxTECuAtgEYRwC65lxA1sQPYDuxUAvgG4AUKEiwcUNhBCcAZrATJ0GEQHo1ULQD0A-MNHhoAWURgVkgoTbk0wOCmIBzZlFqdOAGwiI+Qw+LGktKyCqbmmOqaOrpAA)

Note that in this example, `M` is `string | number` — this is because JavaScript object keys are always coerced to a string, so `obj[0]` is always the same as `obj["0"]`.

`keyof` types become especially useful when combined with mapped types, which we’ll learn more about later.

The TypeScript docs are an open source project. Help us improve these pages [by sending a Pull Request](https://github.com/microsoft/TypeScript-Website/blob/v2/packages/documentation/copy/en/handbook-v2/Type%20Manipulation/Keyof%20Type%20Operator.md) ❤

Contributors to this page:

OT![Orta Therox  (3)](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782977825/aha-mind/docs-crawler/www.typescriptlang.org/49038_n5tm8c.jpg)

RM![Roman Mahotskyi  (1)](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782977825/aha-mind/docs-crawler/www.typescriptlang.org/9fc6be1e7979f236d91d5cab8bc8b9e1f368d3e1883ce814b9c26c6c0f467230_difbir.png)

MM![Masashi Miyazaki  (1)](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782977825/aha-mind/docs-crawler/www.typescriptlang.org/a8e503d907b24698d2730471024b9d63d1c0fcd9761020957a45ccc8dee60d60_mhptmz.png)

S![suica  (1)](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782977825/aha-mind/docs-crawler/www.typescriptlang.org/9586efba9706e1ac318402527b273c2e9206a8ac8ffbb789c8f70b451c33c974_kxzhp3.png)

Last updated: Jul 02, 2026

This page loaded in 0.428 seconds.
