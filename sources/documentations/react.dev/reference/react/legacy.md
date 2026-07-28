---
title: "Legacy React APIs – React"
source_url: "https://react.dev/reference/react/legacy"
crawled_at: "2026-07-28T04:08:28.031Z"
---

These APIs are exported from the `react` package, but they are not recommended for use in newly written code. See the linked individual API pages for the suggested alternatives.

---

## Legacy APIs[](#legacy-apis "Link for Legacy APIs ")

-   [`Children`](https://react.dev/reference/react/Children) lets you manipulate and transform the JSX received as the `children` prop. [See alternatives.](https://react.dev/reference/react/Children#alternatives)
-   [`cloneElement`](https://react.dev/reference/react/cloneElement) lets you create a React element using another element as a starting point. [See alternatives.](https://react.dev/reference/react/cloneElement#alternatives)
-   [`Component`](https://react.dev/reference/react/Component) lets you define a React component as a JavaScript class. [See alternatives.](https://react.dev/reference/react/Component#alternatives)
-   [`createElement`](https://react.dev/reference/react/createElement) lets you create a React element. Typically, you’ll use JSX instead.
-   [`createRef`](https://react.dev/reference/react/createRef) creates a ref object which can contain arbitrary value. [See alternatives.](https://react.dev/reference/react/createRef#alternatives)
-   [`forwardRef`](https://react.dev/reference/react/forwardRef) lets your component expose a DOM node to parent component with a [ref.](https://react.dev/learn/manipulating-the-dom-with-refs)
-   [`isValidElement`](https://react.dev/reference/react/isValidElement) checks whether a value is a React element. Typically used with [`cloneElement`.](https://react.dev/reference/react/cloneElement)
-   [`PureComponent`](https://react.dev/reference/react/PureComponent) is similar to [`Component`,](https://react.dev/reference/react/Component) but it skip re-renders with same props. [See alternatives.](https://react.dev/reference/react/PureComponent#alternatives)

---

## Removed APIs[](#removed-apis "Link for Removed APIs ")

These APIs were removed in React 19:

-   [`createFactory`](https://18.react.dev/reference/react/createFactory): use JSX instead.
-   Class Components: [`static contextTypes`](https://18.react.dev//reference/react/Component#static-contexttypes): use [`static contextType`](#static-contexttype) instead.
-   Class Components: [`static childContextTypes`](https://18.react.dev//reference/react/Component#static-childcontexttypes): use [`static contextType`](#static-contexttype) instead.
-   Class Components: [`static getChildContext`](https://18.react.dev//reference/react/Component#getchildcontext): use [`Context`](https://react.dev/reference/react/createContext#provider) instead.
-   Class Components: [`static propTypes`](https://18.react.dev//reference/react/Component#static-proptypes): use a type system like [TypeScript](https://www.typescriptlang.org/) instead.
-   Class Components: [`this.refs`](https://18.react.dev//reference/react/Component#refs): use [`createRef`](https://react.dev/reference/react/createRef) instead.
