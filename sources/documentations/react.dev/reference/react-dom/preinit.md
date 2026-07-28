---
title: "preinit – React"
source_url: "https://react.dev/reference/react-dom/preinit"
crawled_at: "2026-07-28T04:05:58.481Z"
---

### Note

[React-based frameworks](https://react.dev/learn/creating-a-react-app) frequently handle resource loading for you, so you might not have to call this API yourself. Consult your framework’s documentation for details.

`preinit` lets you eagerly fetch and evaluate a stylesheet or external script.

```
preinit("https://example.com/script.js", {as: "script"});
```

To preinit a script or stylesheet, call the `preinit` function from `react-dom`.

The `preinit` function provides the browser with a hint that it should start downloading and executing the given resource, which can save time. Scripts that you `preinit` are executed when they finish downloading. Stylesheets that you preinit are inserted into the document, which causes them to go into effect right away.

`preinit` returns nothing.

Call `preinit` when rendering a component if you know that it or its children will use a specific resource, and you’re OK with the resource being evaluated and thereby taking effect immediately upon being downloaded.
