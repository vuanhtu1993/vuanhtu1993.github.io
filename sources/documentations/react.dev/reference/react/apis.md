---
title: "Built-in React APIs – React"
source_url: "https://react.dev/reference/react/apis"
crawled_at: "2026-07-28T04:04:34.238Z"
---

In addition to [Hooks](https://react.dev/reference/react/hooks) and [Components](https://react.dev/reference/react/components), the `react` package exports a few other APIs that are useful for defining components. This page lists all the remaining modern React APIs.

---

-   [`createContext`](https://react.dev/reference/react/createContext) lets you define and provide context to the child components. Used with [`useContext`.](https://react.dev/reference/react/useContext)
-   [`lazy`](https://react.dev/reference/react/lazy) lets you defer loading a component’s code until it’s rendered for the first time.
-   [`memo`](https://react.dev/reference/react/memo) lets your component skip re-renders with same props. Used with [`useMemo`](https://react.dev/reference/react/useMemo) and [`useCallback`.](https://react.dev/reference/react/useCallback)
-   [`startTransition`](https://react.dev/reference/react/startTransition) lets you mark a state update as non-urgent. Similar to [`useTransition`.](https://react.dev/reference/react/useTransition)
-   [`act`](https://react.dev/reference/react/act) lets you wrap renders and interactions in tests to ensure updates have processed before making assertions.

---

## Resource APIs[](#resource-apis "Link for Resource APIs ")

_Resources_ can be accessed by a component without having them as part of their state. For example, a component can read a message from a Promise or read styling information from a context.

To read a value from a resource, use this API:

-   [`use`](https://react.dev/reference/react/use) lets you read the value of a resource like a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) or [context](https://react.dev/learn/passing-data-deeply-with-context).

```
function MessageComponent({ messagePromise }) {
const message = use(messagePromise);
const theme = use(ThemeContext);
// ...
}
```
