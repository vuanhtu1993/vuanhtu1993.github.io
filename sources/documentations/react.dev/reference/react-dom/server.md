---
title: "Server React DOM APIs – React"
source_url: "https://react.dev/reference/react-dom/server"
crawled_at: "2026-07-28T04:06:16.234Z"
---

The `react-dom/server` APIs let you server-side render React components to HTML. These APIs are only used on the server at the top level of your app to generate the initial HTML. A [framework](https://react.dev/learn/creating-a-react-app#full-stack-frameworks) may call them for you. Most of your components don’t need to import or use them.

These methods are only available in the environments with [Web Streams](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API), which includes browsers, Deno, and some modern edge runtimes:

### Note

Node.js also includes these methods for compatibility, but they are not recommended due to worse performance. Use the [dedicated Node.js APIs](#server-apis-for-nodejs-streams) instead.

They have limited functionality compared to the streaming APIs.
