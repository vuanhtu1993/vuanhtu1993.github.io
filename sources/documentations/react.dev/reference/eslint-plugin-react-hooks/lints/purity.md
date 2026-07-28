---
title: "purity – React"
source_url: "https://react.dev/reference/eslint-plugin-react-hooks/lints/purity"
crawled_at: "2026-07-28T04:07:44.513Z"
---

Validates that [components/hooks are pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure) by checking that they do not call known-impure functions.

## Rule Details[](#rule-details "Link for Rule Details ")

React components must be pure functions - given the same props, they should always return the same JSX. When components use functions like `Math.random()` or `Date.now()` during render, they produce different output each time, breaking React’s assumptions and causing bugs like hydration mismatches, incorrect memoization, and unpredictable behavior.

## Common Violations[](#common-violations "Link for Common Violations ")

In general, any API that returns a different value for the same inputs violates this rule. Usual examples include:

-   `Math.random()`
-   `Date.now()` / `new Date()`
-   `crypto.randomUUID()`
-   `performance.now()`

### Invalid[](#invalid "Link for Invalid ")

Examples of incorrect code for this rule:

```
// ❌ Math.random() in render
function Component() {
const id = Math.random(); // Different every render
return <div key={id}>Content</div>;
}
// ❌ Date.now() for values
function Component() {
const timestamp = Date.now(); // Changes every render
return <div>Created at: {timestamp}</div>;
}
```

### Valid[](#valid "Link for Valid ")

Examples of correct code for this rule:

```
// ✅ Stable IDs from initial state
function Component() {
const [id] = useState(() => crypto.randomUUID());
return <div key={id}>Content</div>;
}
```

## Troubleshooting[](#troubleshooting "Link for Troubleshooting ")

### I need to show the current time[](#current-time "Link for I need to show the current time ")

Calling `Date.now()` during render makes your component impure:

```
// ❌ Wrong: Time changes every render
function Clock() {
return <div>Current time: {Date.now()}</div>;
}
```

Instead, [move the impure function outside of render](https://react.dev/reference/rules/components-and-hooks-must-be-pure#components-and-hooks-must-be-idempotent):

```
function Clock() {
const [time, setTime] = useState(() => Date.now());
useEffect(() => {
const interval = setInterval(() => {
setTime(Date.now());
}, 1000);
return () => clearInterval(interval);
}, []);
return <div>Current time: {time}</div>;
}
```
