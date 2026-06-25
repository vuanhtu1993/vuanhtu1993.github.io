---
title: "Guides: CSS-in-JS"
source_url: "https://nextjs.org/docs/pages/guides/css-in-js"
crawled_at: "2026-06-25T07:22:14.296Z"
---

This page is also available as Markdown at [/docs/pages/guides/css-in-js.md](https://nextjs.org/docs/pages/guides/css-in-js.md). For an index of Next.js Pages Router documentation, see [/docs/pages/llms.txt](https://nextjs.org/docs/pages/llms.txt).

You are currently viewing the documentation for Pages Router.

## How to use CSS-in-JS libraries

Last updated

April 25, 2025

Examples

-   [Styled JSX](https://github.com/vercel/next.js/tree/canary/examples/with-styled-jsx)
-   [Styled Components](https://github.com/vercel/next.js/tree/canary/examples/with-styled-components)
-   [Emotion](https://github.com/vercel/next.js/tree/canary/examples/with-emotion)
-   [Linaria](https://github.com/vercel/next.js/tree/canary/examples/with-linaria)
-   [Styletron](https://github.com/vercel/next.js/tree/canary/examples/with-styletron)
-   [Cxs](https://github.com/vercel/next.js/tree/canary/examples/with-cxs)
-   [Fela](https://github.com/vercel/next.js/tree/canary/examples/with-fela)
-   [Stitches](https://github.com/vercel/next.js/tree/canary/examples/with-stitches)

It's possible to use any existing CSS-in-JS solution. The simplest one is inline styles:

We bundle [styled-jsx](https://github.com/vercel/styled-jsx) to provide support for isolated scoped CSS. The aim is to support "shadow CSS" similar to Web Components, which unfortunately [do not support server-rendering and are JS-only](https://github.com/w3c/webcomponents/issues/71).

See the above examples for other popular CSS-in-JS solutions (like Styled Components).

A component using `styled-jsx` looks like this:

Please see the [styled-jsx documentation](https://github.com/vercel/styled-jsx) for more examples.

### Disabling JavaScript[](#disabling-javascript)

Yes, if you disable JavaScript the CSS will still be loaded in the production build (`next start`). During development, we require JavaScript to be enabled to provide the best developer experience with [Fast Refresh](https://nextjs.org/blog/next-9-4#fast-refresh).
