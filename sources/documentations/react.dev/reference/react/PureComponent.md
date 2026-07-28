---
title: "PureComponent – React"
source_url: "https://react.dev/reference/react/PureComponent"
crawled_at: "2026-07-28T04:08:56.753Z"
---

### Pitfall

We recommend defining components as functions instead of classes. [See how to migrate.](#alternatives)

`PureComponent` is similar to [`Component`](https://react.dev/reference/react/Component) but it skips re-renders for same props and state. Class components are still supported by React, but we don’t recommend using them in new code.

```
class Greeting extends PureComponent {
render() {
return <h1>Hello, {this.props.name}!</h1>;
}
}
```

-   [Reference](#reference)
    -   [`PureComponent`](#purecomponent)
-   [Usage](#usage)
    -   [Skipping unnecessary re-renders for class components](#skipping-unnecessary-re-renders-for-class-components)
-   [Alternatives](#alternatives)
    -   [Migrating from a `PureComponent` class component to a function](#migrating-from-a-purecomponent-class-component-to-a-function)

---

## Reference[](#reference "Link for Reference ")

### `PureComponent`[](#purecomponent "Link for this heading")

To skip re-rendering a class component for same props and state, extend `PureComponent` instead of [`Component`:](https://react.dev/reference/react/Component)

```
import { PureComponent } from 'react';
class Greeting extends PureComponent {
render() {
return <h1>Hello, {this.props.name}!</h1>;
}
}
```

`PureComponent` is a subclass of `Component` and supports [all the `Component` APIs.](https://react.dev/reference/react/Component#reference) Extending `PureComponent` is equivalent to defining a custom [`shouldComponentUpdate`](https://react.dev/reference/react/Component#shouldcomponentupdate) method that shallowly compares props and state.

[See more examples below.](#usage)

---

## Usage[](#usage "Link for Usage ")

### Skipping unnecessary re-renders for class components[](#skipping-unnecessary-re-renders-for-class-components "Link for Skipping unnecessary re-renders for class components ")

React normally re-renders a component whenever its parent re-renders. As an optimization, you can create a component that React will not re-render when its parent re-renders so long as its new props and state are the same as the old props and state. [Class components](https://react.dev/reference/react/Component) can opt into this behavior by extending `PureComponent`:

```
class Greeting extends PureComponent {
render() {
return <h1>Hello, {this.props.name}!</h1>;
}
}
```

A React component should always have [pure rendering logic.](https://react.dev/learn/keeping-components-pure) This means that it must return the same output if its props, state, and context haven’t changed. By using `PureComponent`, you are telling React that your component complies with this requirement, so React doesn’t need to re-render as long as its props and state haven’t changed. However, your component will still re-render if a context that it’s using changes.

In this example, notice that the `Greeting` component re-renders whenever `name` is changed (because that’s one of its props), but not when `address` is changed (because it’s not passed to `Greeting` as a prop):

### Pitfall

We recommend defining components as functions instead of classes. [See how to migrate.](#alternatives)

---

## Alternatives[](#alternatives "Link for Alternatives ")

### Migrating from a `PureComponent` class component to a function[](#migrating-from-a-purecomponent-class-component-to-a-function "Link for this heading")

We recommend using function components instead of [class components](https://react.dev/reference/react/Component) in new code. If you have some existing class components using `PureComponent`, here is how you can convert them. This is the original code:
