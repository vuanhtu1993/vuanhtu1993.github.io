---
title: "Documentation - TypeScript 1.1"
source_url: "https://www.typescriptlang.org/docs/handbook/release-notes/typescript-1-1.html"
crawled_at: "2026-07-02T07:42:47.794Z"
---

## [](#performance-improvements)Performance Improvements

The 1.1 compiler is typically around 4x faster than any previous release. See [this blog post for some impressive charts.](https://web.archive.org/web/20141007020020/http://blogs.msdn.com/b/typescript/archive/2014/10/06/announcing-typescript-1-1-ctp.aspx)

## [](#better-module-visibility-rules)Better Module Visibility Rules

TypeScript now only strictly enforces the visibility of types in modules if the [`declaration`](https://www.typescriptlang.org/tsconfig#declaration) flag is provided. This is very useful for Angular scenarios, for example:

ts

`module MyControllers {`

  `interface ZooScope extends ng.IScope {`

    `animals: Animal[];`

  `}`

  `export class ZooController {`

    `// Used to be an error (cannot expose ZooScope), but now is only`

    `// an error when trying to generate .d.ts files`

    `constructor(public $scope: ZooScope) {}`

    `/* more code */`

  `}`

`}`
