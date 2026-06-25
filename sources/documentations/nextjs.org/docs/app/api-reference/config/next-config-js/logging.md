---
title: "next.config.js: logging"
source_url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/logging"
crawled_at: "2026-06-25T07:15:11.863Z"
---

Last updated

February 12, 2026

## Options[](#options)

### Fetching[](#fetching)

You can configure the logging level and whether the full URL is logged to the console when running Next.js in development mode.

Any `fetch` requests that are restored from the [Server Components HMR cache](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverComponentsHmrCache) are not logged by default. However, this can be enabled by setting `logging.fetches.hmrRefreshes` to `true`.

### Server Functions[](#server-functions)

[Server Function](https://react.dev/reference/rsc/server-functions) invocations are logged by default during development. You can disable this by setting `logging.serverFunctions` to `false`.

When enabled, the terminal displays each Server Function call with its function name, arguments, and duration:

### Incoming Requests[](#incoming-requests)

By default all the incoming requests will be logged in the console during development. You can use the `incomingRequests` option to decide which requests to ignore. Since this is only logged in development, this option doesn't affect production builds.

Or you can disable incoming request logging by setting `incomingRequests` to `false`.

### Browser Console Logs[](#browser-console-logs)

You can forward browser console logs (such as `console.log`, `console.warn`, `console.error`) to the terminal during development. This is useful for debugging client-side code without needing to check the browser's developer tools.

#### Options[](#options-1)

The `browserToTerminal` option accepts the following values:

| Value | Description |
| --- | --- |
| `'warn'` | Forward only warnings and errors, by default |
| `'error'` | Forward only errors |
| `true` | Forward all console output (log, info, warn, error) |
| `false` | Disable browser log forwarding |

#### Source Location[](#source-location)

When enabled, browser logs include source location information (file path and line number) by default. For example:

Clicking the button prints this message to the terminal:

### Disabling Logging[](#disabling-logging)

In addition, you can disable the development logging by setting `logging` to `false`.

## Version History[](#version-history)

| Version | Changes |
| --- | --- |
| `v16.2.0` | `browserToTerminal` added (moved from `experimental.browserDebugInfoInTerminal`) |
| `v15.4.0` | `experimental.browserDebugInfoInTerminal` introduced |
| `v15.2.0` | `incomingRequests` added |
| `v15.0.0` | `logging: false` option added, `fetches.hmrRefreshes` added for App Router |
| `v14.0.0` | `logging.fetches` moved to stable for App Router |
