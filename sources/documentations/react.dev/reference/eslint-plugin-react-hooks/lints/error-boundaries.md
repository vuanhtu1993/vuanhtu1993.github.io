---
title: "error-boundaries – React"
source_url: "https://react.dev/reference/eslint-plugin-react-hooks/lints/error-boundaries"
crawled_at: "2026-07-28T04:07:29.166Z"
---

Validates usage of Error Boundaries instead of try/catch for errors in child components.

## Rule Details[](#rule-details "Link for Rule Details ")

Try/catch blocks can’t catch errors that happen during React’s rendering process. Errors thrown in rendering methods or hooks bubble up through the component tree. Only [Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary) can catch these errors.

### Invalid[](#invalid "Link for Invalid ")

Examples of incorrect code for this rule:

```
// ❌ Try/catch won't catch render errors
function Parent() {
try {
return <ChildComponent />; // If this throws, catch won't help
} catch (error) {
return <div>Error occurred</div>;
}
}
```

### Valid[](#valid "Link for Valid ")

Examples of correct code for this rule:

```
// ✅ Using error boundary
function Parent() {
return (
<ErrorBoundary>
<ChildComponent />
</ErrorBoundary>
);
}
```

## Troubleshooting[](#troubleshooting "Link for Troubleshooting ")

### Why is the linter telling me not to wrap `use` in `try`/`catch`?[](#why-is-the-linter-telling-me-not-to-wrap-use-in-trycatch "Link for this heading")

The `use` hook doesn’t throw errors in the traditional sense, it suspends component execution. When `use` encounters a pending promise, it suspends the component and lets React show a fallback. Only Suspense and Error Boundaries can handle these cases. The linter warns against `try`/`catch` around `use` to prevent confusion as the `catch` block would never run.

```
// ❌ Try/catch around `use` hook
function Component({promise}) {
try {
const data = use(promise); // Won't catch - `use` suspends, not throws
return <div>{data}</div>;
} catch (error) {
return <div>Failed to load</div>; // Unreachable
}
}
// ✅ Error boundary catches `use` errors
function App() {
return (
<ErrorBoundary fallback={<div>Failed to load</div>}>
<Suspense fallback={<div>Loading...</div>}>
<DataComponent promise={fetchData()} />
</Suspense>
</ErrorBoundary>
);
}
```
