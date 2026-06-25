---
title: "File-system conventions: forbidden.js"
source_url: "https://nextjs.org/docs/app/api-reference/file-conventions/forbidden"
crawled_at: "2026-06-25T07:05:19.279Z"
---

This page is also available as Markdown at [/docs/app/api-reference/file-conventions/forbidden.md](https://nextjs.org/docs/app/api-reference/file-conventions/forbidden.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

This feature is currently experimental and subject to change, it's not recommended for production. Try it out and share your feedback on [GitHub](https://github.com/vercel/next.js/issues).

Last updated

June 16, 2025

The **forbidden** file is used to render UI when the [`forbidden`](https://nextjs.org/docs/app/api-reference/functions/forbidden) function is invoked during authentication. Along with allowing you to customize the UI, Next.js will return a `403` status code.

## Reference[](#reference)

### Props[](#props)

`forbidden.js` components do not accept any props.

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v15.1.0` | `forbidden.js` introduced. |

[Previous

error.js

](https://nextjs.org/docs/app/api-reference/file-conventions/error)[Next

instrumentation.js

](https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation)
