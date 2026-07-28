---
title: "cacheSignal – React"
source_url: "https://react.dev/reference/react/cacheSignal"
crawled_at: "2026-07-28T04:04:44.457Z"
---

`cacheSignal` allows you to know when the `cache()` lifetime is over.

```
const signal = cacheSignal();
```

Call `cacheSignal` to get an `AbortSignal`.

When React has finished rendering, the `AbortSignal` will be aborted. This allows you to cancel any in-flight work that is no longer needed. Rendering is considered finished when:

This function does not accept any parameters.

`cacheSignal` returns an `AbortSignal` if called during rendering. Otherwise `cacheSignal()` returns `null`.

Call `cacheSignal` to abort in-flight requests.

If a function throws, it may be due to cancellation (e.g. the Database connection has been closed). You can use the `aborted` property to check if the error was due to cancellation or a real error. You may want to ignore errors that were due to cancellation.
