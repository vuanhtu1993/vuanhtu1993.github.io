---
title: "exhaustive-deps – React"
source_url: "https://react.dev/reference/eslint-plugin-react-hooks/lints/exhaustive-deps"
crawled_at: "2026-07-28T04:07:19.065Z"
---

Validates that dependency arrays for React hooks contain all necessary dependencies.

## Rule Details[](#rule-details "Link for Rule Details ")

React hooks like `useEffect`, `useMemo`, and `useCallback` accept dependency arrays. When a value referenced inside these hooks isn’t included in the dependency array, React won’t re-run the effect or recalculate the value when that dependency changes. This causes stale closures where the hook uses outdated values.

## Common Violations[](#common-violations "Link for Common Violations ")

This error often happens when you try to “trick” React about dependencies to control when an effect runs. Effects should synchronize your component with external systems. The dependency array tells React which values the effect uses, so React knows when to re-synchronize.

If you find yourself fighting with the linter, you likely need to restructure your code. See [Removing Effect Dependencies](https://react.dev/learn/removing-effect-dependencies) to learn how.

### Invalid[](#invalid "Link for Invalid ")

Examples of incorrect code for this rule:

```
// ❌ Missing dependency
useEffect(() => {
console.log(count);
}, []); // Missing 'count'
// ❌ Missing prop
useEffect(() => {
fetchUser(userId);
}, []); // Missing 'userId'
// ❌ Incomplete dependencies
useMemo(() => {
return items.sort(sortOrder);
}, [items]); // Missing 'sortOrder'
```

### Valid[](#valid "Link for Valid ")

Examples of correct code for this rule:

```
// ✅ All dependencies included
useEffect(() => {
console.log(count);
}, [count]);
// ✅ All dependencies included
useEffect(() => {
fetchUser(userId);
}, [userId]);
```

## Troubleshooting[](#troubleshooting "Link for Troubleshooting ")

### Adding a function dependency causes infinite loops[](#function-dependency-loops "Link for Adding a function dependency causes infinite loops ")

You have an effect, but you’re creating a new function on every render:

```
// ❌ Causes infinite loop
const logItems = () => {
console.log(items);
};
useEffect(() => {
logItems();
}, [logItems]); // Infinite loop!
```

In most cases, you don’t need the effect. Call the function where the action happens instead:

```
// ✅ Call it from the event handler
const logItems = () => {
console.log(items);
};
return <button onClick={logItems}>Log</button>;
// ✅ Or derive during render if there's no side effect
items.forEach(item => {
console.log(item);
});
```

If you genuinely need the effect (for example, to subscribe to something external), make the dependency stable:

```
// ✅ useCallback keeps the function reference stable
const logItems = useCallback(() => {
console.log(items);
}, [items]);
useEffect(() => {
logItems();
}, [logItems]);
// ✅ Or move the logic straight into the effect
useEffect(() => {
console.log(items);
}, [items]);
```

### Running an effect only once[](#effect-on-mount "Link for Running an effect only once ")

You want to run an effect once on mount, but the linter complains about missing dependencies:

```
// ❌ Missing dependency
useEffect(() => {
sendAnalytics(userId);
}, []); // Missing 'userId'
```

Either include the dependency (recommended) or use a ref if you truly need to run once:

```
// ✅ Include dependency
useEffect(() => {
sendAnalytics(userId);
}, [userId]);
// ✅ Or use a ref guard inside an effect
const sent = useRef(false);
useEffect(() => {
if (sent.current) {
return;
}
sent.current = true;
sendAnalytics(userId);
}, [userId]);
```

## Options[](#options "Link for Options ")

You can configure custom effect hooks using shared ESLint settings (available in `eslint-plugin-react-hooks` 6.1.1 and later):

```
{
"settings": {
"react-hooks": {
"additionalEffectHooks": "(useMyEffect|useCustomEffect)"
}
}
}
```

-   `additionalEffectHooks`: Regex pattern matching custom hooks that should be checked for exhaustive dependencies. This configuration is shared across all `react-hooks` rules.

For backward compatibility, this rule also accepts a rule-level option:

```
{
"rules": {
"react-hooks/exhaustive-deps": ["warn", {
"additionalHooks": "(useMyCustomHook|useAnotherHook)"
}]
}
}
```

-   `additionalHooks`: Regex for hooks that should be checked for exhaustive dependencies. **Note:** If this rule-level option is specified, it takes precedence over the shared `settings` configuration.
