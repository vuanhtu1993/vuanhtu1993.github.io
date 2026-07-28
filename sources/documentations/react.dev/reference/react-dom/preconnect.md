---
title: "preconnect – React"
source_url: "https://react.dev/reference/react-dom/preconnect"
crawled_at: "2026-07-28T04:05:53.895Z"
---

`preconnect` lets you eagerly connect to a server that you expect to load resources from.

```
preconnect("https://example.com");
```

To preconnect to a host, call the `preconnect` function from `react-dom`.

The `preconnect` function provides the browser with a hint that it should open a connection to the given server. If the browser chooses to do so, this can speed up the loading of resources from that server.

`preconnect` returns nothing.

Call `preconnect` when rendering a component if you know that its children will load external resources from that host.

Call `preconnect` in an event handler before transitioning to a page or state where external resources will be needed. This gets the process started earlier than if you call it during the rendering of the new page or state.
