---
title: "prefetchDNS – React"
source_url: "https://react.dev/reference/react-dom/prefetchDNS"
crawled_at: "2026-07-28T04:05:56.184Z"
---

`prefetchDNS` lets you eagerly look up the IP of a server that you expect to load resources from.

```
prefetchDNS("https://example.com");
```

To look up a host, call the `prefetchDNS` function from `react-dom`.

The prefetchDNS function provides the browser with a hint that it should look up the IP address of a given server. If the browser chooses to do so, this can speed up the loading of resources from that server.

`prefetchDNS` returns nothing.

Call `prefetchDNS` when rendering a component if you know that its children will load external resources from that host.

Call `prefetchDNS` in an event handler before transitioning to a page or state where external resources will be needed. This gets the process started earlier than if you call it during the rendering of the new page or state.
