---
title: "Guides: Custom Server"
source_url: "https://nextjs.org/docs/app/guides/custom-server"
crawled_at: "2026-06-25T06:58:23.641Z"
---

This page is also available as Markdown at [/docs/app/guides/custom-server.md](https://nextjs.org/docs/app/guides/custom-server.md). For an index of Next.js documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt).

## How to set up a custom server in Next.js

Last updated

June 23, 2026

Next.js includes its own server with `next start` by default. If you have an existing backend, you can still use it with Next.js (this is not a custom server). A custom Next.js server allows you to programmatically start a server for custom patterns. The majority of the time, you will not need this approach. However, it's available if you need to eject.

> **Good to know**:
> 
> -   Before deciding to use a custom server, keep in mind that it should only be used when the integrated router of Next.js can't meet your app requirements.
> -   When using standalone output mode, it does not trace custom server files. This mode outputs a separate minimal `server.js` file, instead. These cannot be used together.

Take a look at the [following example](https://github.com/vercel/next.js/tree/canary/examples/custom-server) of a custom server:

> `server.js` does not run through the Next.js Compiler or bundling process. Make sure the syntax and source code this file requires are compatible with the current Node.js version you are using. [View an example](https://github.com/vercel/next.js/tree/canary/examples/custom-server).

To run the custom server, you'll need to update the `scripts` in `package.json` like so:

Alternatively, you can set up `nodemon` ([example](https://github.com/vercel/next.js/tree/canary/examples/custom-server)). The custom server uses the following import to connect the server with the Next.js application:

The above `next` import is a function that receives an object with the following options:

| Option | Type | Description |
| --- | --- | --- |
| `conf` | `Object` | The same object you would use in `next.config.js`. Defaults to `{}` |
| `dev` | `Boolean` | (_Optional_) Whether or not to launch Next.js in dev mode. Defaults to `false` |
| `dir` | `String` | (_Optional_) Location of the Next.js project. Defaults to `'.'` |
| `quiet` | `Boolean` | (_Optional_) Hide error messages containing server information. Defaults to `false` |
| `hostname` | `String` | (_Optional_) The hostname the server is running behind |
| `port` | `Number` | (_Optional_) The port the server is running behind |
| `httpServer` | `node:http#Server` | (_Optional_) The HTTP Server that Next.js is running behind |
| `turbopack` | `Boolean` | (_Optional_) Enable Turbopack (enabled by default) |
| `webpack` | `Boolean` | (_Optional_) Enable webpack |

The returned `app` can then be used to let Next.js handle requests as required.

[Previous

CSS-in-JS

](https://nextjs.org/docs/app/guides/css-in-js)[Next

Data Security

](https://nextjs.org/docs/app/guides/data-security)
