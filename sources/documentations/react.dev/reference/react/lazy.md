---
title: "lazy – React"
source_url: "https://react.dev/reference/react/lazy"
crawled_at: "2026-07-28T04:04:52.152Z"
---

`lazy` lets you defer loading component’s code until it is rendered for the first time.

```
const SomeComponent = lazy(load)
```

-   [Reference](#reference)
    -   [`lazy(load)`](#lazy)
    -   [`load` function](#load)
-   [Usage](#usage)
    -   [Lazy-loading components with Suspense](#suspense-for-code-splitting)
-   [Troubleshooting](#troubleshooting)
    -   [My `lazy` component’s state gets reset unexpectedly](#my-lazy-components-state-gets-reset-unexpectedly)

---

## Reference[](#reference "Link for Reference ")

### `lazy(load)`[](#lazy "Link for this heading")

Call `lazy` outside your components to declare a lazy-loaded React component:

```
import { lazy } from 'react';
const MarkdownPreview = lazy(() => import('./MarkdownPreview.js'));
```

[See more examples below.](#usage)

#### Parameters[](#parameters "Link for Parameters ")

-   `load`: A function that returns a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) or another _thenable_ (a Promise-like object with a `then` method). React will not call `load` until the first time you attempt to render the returned component. After React first calls `load`, it will wait for it to resolve, and then render the resolved value’s `.default` as a React component. Both the returned Promise and the Promise’s resolved value will be cached, so React will not call `load` more than once. If the Promise rejects, React will `throw` the rejection reason for the nearest Error Boundary to handle.

#### Returns[](#returns "Link for Returns ")

`lazy` returns a React component you can render in your tree. While the code for the lazy component is still loading, attempting to render it will _suspend._ Use [`<Suspense>`](https://react.dev/reference/react/Suspense) to display a loading indicator while it’s loading.

---

### `load` function[](#load "Link for this heading")

#### Parameters[](#load-parameters "Link for Parameters ")

`load` receives no parameters.

#### Returns[](#load-returns "Link for Returns ")

You need to return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) or some other _thenable_ (a Promise-like object with a `then` method). It needs to eventually resolve to an object whose `.default` property is a valid React component type, such as a function, [`memo`](https://react.dev/reference/react/memo), or a [`forwardRef`](https://react.dev/reference/react/forwardRef) component.

---

## Usage[](#usage "Link for Usage ")

### Lazy-loading components with Suspense[](#suspense-for-code-splitting "Link for Lazy-loading components with Suspense ")

Usually, you import components with the static [`import`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) declaration:

```
import MarkdownPreview from './MarkdownPreview.js';
```

To defer loading this component’s code until it’s rendered for the first time, replace this import with:

```
import { lazy } from 'react';
const MarkdownPreview = lazy(() => import('./MarkdownPreview.js'));
```

This code relies on [dynamic `import()`,](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) which might require support from your bundler or framework. Using this pattern requires that the lazy component you’re importing was exported as the `default` export.

Now that your component’s code loads on demand, you also need to specify what should be displayed while it is loading. You can do this by wrapping the lazy component or any of its parents into a [`<Suspense>`](https://react.dev/reference/react/Suspense) boundary:

```
<Suspense fallback={<Loading />}>
<h2>Preview</h2>
<MarkdownPreview />
</Suspense>
```

In this example, the code for `MarkdownPreview` won’t be loaded until you attempt to render it. If `MarkdownPreview` hasn’t loaded yet, `Loading` will be shown in its place. Try ticking the checkbox:

This demo loads with an artificial delay. The next time you untick and tick the checkbox, `Preview` will be cached, so there will be no loading state. To see the loading state again, click “Reset” on the sandbox.

[Learn more about managing loading states with Suspense.](https://react.dev/reference/react/Suspense)

---

## Troubleshooting[](#troubleshooting "Link for Troubleshooting ")

### My `lazy` component’s state gets reset unexpectedly[](#my-lazy-components-state-gets-reset-unexpectedly "Link for this heading")

Do not declare `lazy` components _inside_ other components:

```
import { lazy } from 'react';
function Editor() {
// 🔴 Bad: This will cause all state to be reset on re-renders
const MarkdownPreview = lazy(() => import('./MarkdownPreview.js'));
// ...
}
```

Instead, always declare them at the top level of your module:

```
import { lazy } from 'react';
// ✅ Good: Declare lazy components outside of your components
const MarkdownPreview = lazy(() => import('./MarkdownPreview.js'));
function Editor() {
// ...
}
```
