---
title: "next.config.js: viewTransition"
source_url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/viewTransition"
crawled_at: "2026-06-25T07:18:28.420Z"
---

This page is also available as Markdown at [/docs/app/api-reference/config/next-config-js/viewTransition.md](https://nextjs.org/docs/app/api-reference/config/next-config-js/viewTransition.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

This feature is currently experimental and subject to change, it's not recommended for production. Try it out and share your feedback on [GitHub](https://github.com/vercel/next.js/issues).

Last updated

April 2, 2026

`viewTransition` enables React's [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) integration in Next.js. This lets you animate navigations, loading states, and content changes using the native browser View Transitions API.

To enable this feature, you need to set the `viewTransition` property to `true` in your `next.config.js` file.

The [`<ViewTransition>`](https://react.dev/reference/react/ViewTransition) component is provided by React. The `experimental.viewTransition` flag enables Next.js integration, such as triggering transitions during route navigations.

## Usage[](#usage)

You can import the [`<ViewTransition>` Component](https://react.dev/reference/react/ViewTransition) from React in your application:

### Live Demo[](#live-demo)

Check out the [View Transitions Demo](https://react-view-transitions-demo.labs.vercel.dev/) to see this feature in action, or read the [designing view transitions guide](https://nextjs.org/docs/app/guides/view-transitions) for a step-by-step walkthrough.

The View Transitions API is a baseline web standard, and browser support continues to expand. As React's [`<ViewTransition>`](https://react.dev/reference/react/ViewTransition) component evolves, more transition patterns and use cases will become available.

[Previous

useLightningcss

](https://nextjs.org/docs/app/api-reference/config/next-config-js/useLightningcss)[Next

webpack

](https://nextjs.org/docs/app/api-reference/config/next-config-js/webpack)
