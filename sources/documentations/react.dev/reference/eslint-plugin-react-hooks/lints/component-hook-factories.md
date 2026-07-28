---
title: "component-hook-factories – React"
source_url: "https://react.dev/reference/eslint-plugin-react-hooks/lints/component-hook-factories"
crawled_at: "2026-07-28T04:07:24.121Z"
---

Validates against higher order functions defining nested components or hooks. Components and hooks should be defined at the module level.

## Rule Details[](#rule-details "Link for Rule Details ")

Defining components or hooks inside other functions creates new instances on every call. React treats each as a completely different component, destroying and recreating the entire component tree, losing all state, and causing performance problems.

### Invalid[](#invalid "Link for Invalid ")

Examples of incorrect code for this rule:

```
// ❌ Factory function creating components
function createComponent(defaultValue) {
return function Component() {
// ...
};
}
// ❌ Component defined inside component
function Parent() {
function Child() {
// ...
}
return <Child />;
}
// ❌ Hook factory function
function createCustomHook(endpoint) {
return function useData() {
// ...
};
}
```

### Valid[](#valid "Link for Valid ")

Examples of correct code for this rule:

```
// ✅ Component defined at module level
function Component({ defaultValue }) {
// ...
}
// ✅ Custom hook at module level
function useData(endpoint) {
// ...
}
```

## Troubleshooting[](#troubleshooting "Link for Troubleshooting ")

### I need dynamic component behavior[](#dynamic-behavior "Link for I need dynamic component behavior ")

You might think you need a factory to create customized components:

```
// ❌ Wrong: Factory pattern
function makeButton(color) {
return function Button({children}) {
return (
<button style={{backgroundColor: color}}>
{children}
</button>
);
};
}
const RedButton = makeButton('red');
const BlueButton = makeButton('blue');
```

Pass [JSX as children](https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children) instead:

```
// ✅ Better: Pass JSX as children
function Button({color, children}) {
return (
<button style={{backgroundColor: color}}>
{children}
</button>
);
}
function App() {
return (
<>
<Button color="red">Red</Button>
<Button color="blue">Blue</Button>
</>
);
}
```
