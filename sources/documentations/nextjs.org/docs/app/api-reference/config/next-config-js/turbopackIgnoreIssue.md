---
title: "next.config.js: turbopack.ignoreIssue"
source_url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopackIgnoreIssue"
crawled_at: "2026-06-25T07:17:51.956Z"
---

Last updated

February 13, 2026

The `turbopack.ignoreIssue` option allows you to filter out specific [Turbopack](https://nextjs.org/docs/app/api-reference/turbopack) errors and warnings so they do not appear in the CLI output or the error overlay. This is useful for suppressing known warnings that do not affect your application, such as intentionally unresolved optional dependencies.

This option is only available when using Turbopack (`next dev --turbopack`).

## Usage[](#usage)

## Options[](#options)

Each rule in the `ignoreIssue` array is an object with the following fields:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| [`path`](#path) | `string | RegExp` | Yes | Matches against the file path of the issue |
| [`title`](#title) | `string | RegExp` | No | Matches against the issue title |
| [`description`](#description) | `string | RegExp` | No | Matches against the issue description |

An issue is suppressed when it matches the `path` **and** all other specified fields in a rule. If only `path` is provided, any issue from a matching file is suppressed.

> **Good to know:** Issue titles and descriptions may change between Turbopack versions. The `path` field is generally stable, but is not guaranteed to remain consistent for all issue types. When possible, prefer using more specific `path` patterns over `title` or `description` matching.

### `path`[](#path)

A **glob pattern** (when a string) or **regular expression** that matches against the file path where the issue originated.

### `title`[](#title)

An **exact string match** (when a string) or **regular expression** that matches against the issue title.

### `description`[](#description)

An **exact string match** (when a string) or **regular expression** that matches against the issue description.

## Examples[](#examples)

### Suppressing warnings for optional dependencies[](#suppressing-warnings-for-optional-dependencies)

If your code uses `try/catch` around an optional `require()` call, Turbopack may report a "Module not found" warning. You can suppress it:

### Combining multiple rules[](#combining-multiple-rules)

You can specify multiple rules to suppress different issues:

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v16.2.0` | `turbopack.ignoreIssue` introduced. |
