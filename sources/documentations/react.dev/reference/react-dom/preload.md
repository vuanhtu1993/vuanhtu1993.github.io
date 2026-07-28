---
title: "preload – React"
source_url: "https://react.dev/reference/react-dom/preload"
crawled_at: "2026-07-28T04:06:03.553Z"
---

### Note

[React-based frameworks](https://react.dev/learn/creating-a-react-app) frequently handle resource loading for you, so you might not have to call this API yourself. Consult your framework’s documentation for details.

`preload` lets you eagerly fetch a resource such as a stylesheet, font, or external script that you expect to use.

```
preload("https://example.com/font.woff2", {as: "font"});
```

To preload a resource, call the `preload` function from `react-dom`.

The `preload` function provides the browser with a hint that it should start downloading the given resource, which can save time.

`preload` returns nothing.

Call `preload` when rendering a component if you know that it or its children will use a specific resource.
