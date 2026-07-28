---
title: "unmountComponentAtNode – React"
source_url: "https://18.react.dev/reference/react-dom/unmountComponentAtNode"
crawled_at: "2026-07-28T04:08:59.677Z"
---

### Deprecated

This API will be removed in a future major version of React.

In React 18, `unmountComponentAtNode` was replaced by [`root.unmount()`](https://18.react.dev/reference/react-dom/client/createRoot#root-unmount).

`unmountComponentAtNode` removes a mounted React component from the DOM.

```
unmountComponentAtNode(domNode)
```

-   [Reference](#reference)
    -   [`unmountComponentAtNode(domNode)`](#unmountcomponentatnode)
-   [Usage](#usage)
    -   [Removing a React app from a DOM element](#removing-a-react-app-from-a-dom-element)

---

## Reference[](#reference "Link for Reference ")

### `unmountComponentAtNode(domNode)`[](#unmountcomponentatnode "Link for this heading")

Call `unmountComponentAtNode` to remove a mounted React component from the DOM and clean up its event handlers and state.

```
import { unmountComponentAtNode } from 'react-dom';
const domNode = document.getElementById('root');
render(<App />, domNode);
unmountComponentAtNode(domNode);
```

[See more examples below.](#usage)

#### Parameters[](#parameters "Link for Parameters ")

-   `domNode`: A [DOM element.](https://developer.mozilla.org/en-US/docs/Web/API/Element) React will remove a mounted React component from this element.

#### Returns[](#returns "Link for Returns ")

`unmountComponentAtNode` returns `true` if a component was unmounted and `false` otherwise.

---

## Usage[](#usage "Link for Usage ")

Call `unmountComponentAtNode` to remove a mounted React component from a browser DOM node and clean up its event handlers and state.

```
import { render, unmountComponentAtNode } from 'react-dom';
import App from './App.js';
const rootNode = document.getElementById('root');
render(<App />, rootNode);
// ...
unmountComponentAtNode(rootNode);
```

### Removing a React app from a DOM element[](#removing-a-react-app-from-a-dom-element "Link for Removing a React app from a DOM element ")

Occasionally, you may want to “sprinkle” React on an existing page, or a page that is not fully written in React. In those cases, you may need to “stop” the React app, by removing all of the UI, state, and listeners from the DOM node it was rendered to.

In this example, clicking “Render React App” will render a React app. Click “Unmount React App” to destroy it:
