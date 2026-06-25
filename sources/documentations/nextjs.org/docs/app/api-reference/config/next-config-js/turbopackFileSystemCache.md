---
title: "next.config.js: turbopackFileSystemCache"
source_url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopackFileSystemCache"
crawled_at: "2026-06-25T07:17:45.967Z"
---

This page is also available as Markdown at [/docs/app/api-reference/config/next-config-js/turbopackFileSystemCache.md](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopackFileSystemCache.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

## Turbopack FileSystem Caching

Last updated

December 1, 2025

## Usage[](#usage)

Turbopack FileSystem Cache enables Turbopack to reduce work across `next dev` or `next build` commands. When enabled, Turbopack will save and restore data to the `.next` folder between builds, which can greatly speed up subsequent builds and dev sessions.

> **Good to know:** The FileSystem Cache feature is considered stable for development and experimental for production builds

## Version Changes[](#version-changes)

| Version | Changes |
| --- | --- |
| `v16.1.0` | FileSystem caching is enabled by default for development |
| `v16.0.0` | Beta release with separate flags for build and dev |
| `v15.5.0` | Persistent caching released as experimental on canary releases |

[Previous

turbopack

](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack)[Next

turbopack.ignoreIssue

](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopackIgnoreIssue)
