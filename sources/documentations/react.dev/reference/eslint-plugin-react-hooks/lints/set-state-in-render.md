---
title: "set-state-in-render – React"
source_url: "https://react.dev/reference/eslint-plugin-react-hooks/lints/set-state-in-render"
crawled_at: "2026-07-28T04:07:51.975Z"
---

Validates against unconditionally setting state during render, which can trigger additional renders and potential infinite render loops.

Calling `setState` during render unconditionally triggers another render before the current one finishes. This creates an infinite loop that crashes your app.

```
// ✅ Derive during render
function Component({items}) {
const sorted = [...items].sort(); // Just calculate it in render
return <ul>{sorted.map(/*...*/)}</ul>;
}
// ✅ Set state in event handler
function Component() {
const [count, setCount] = useState(0);
return (
<button onClick={() => setCount(count + 1)}>
{count}
</button>
);
}
// ✅ Derive from props instead of setting state
function Component({user}) {
const name = user?.name || '';
const email = user?.email || '';
return <div>{name}</div>;
}
// ✅ Conditionally derive state from props and state from previous renders
function Component({ items }) {
const [isReverse, setIsReverse] = useState(false);
const [selection, setSelection] = useState(null);
const [prevItems, setPrevItems] = useState(items);
if (items !== prevItems) { // This condition makes it valid
setPrevItems(items);
setSelection(null);
}
// ...
}
```

A common problem is trying to “fix” state after it renders. Suppose you want to keep a counter from exceeding a `max` prop:

As soon as `count` exceeds `max`, an infinite loop is triggered.

Instead, it’s often better to move this logic to the event (the place where the state is first set). For example, you can enforce the maximum at the moment you update state:

Now the setter only runs in response to the click, React finishes the render normally, and `count` never crosses `max`.

In rare cases, you may need to adjust state based on information from previous renders. For those, follow [this pattern](https://react.dev/reference/react/useState#storing-information-from-previous-renders) of setting state conditionally.
