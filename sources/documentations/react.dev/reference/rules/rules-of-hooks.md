---
title: "Rules of Hooks – React"
source_url: "https://react.dev/reference/rules/rules-of-hooks"
crawled_at: "2026-07-28T04:08:08.983Z"
---

Hooks are defined using JavaScript functions, but they represent a special type of reusable UI logic with restrictions on where they can be called.

**Don’t call Hooks inside loops, conditions, nested functions, or `try`/`catch`/`finally` blocks.** Instead, always use Hooks at the top level of your React function, before any early returns. You can only call Hooks while React is rendering a function component:

It’s **not** supported to call Hooks (functions starting with `use`) in any other cases, for example:

If you break these rules, you might see this error.

```
function Bad({ cond }) {
if (cond) {
// 🔴 Bad: inside a condition (to fix, move it outside!)
const theme = useContext(ThemeContext);
}
// ...
}
function Bad() {
for (let i = 0; i < 10; i++) {
// 🔴 Bad: inside a loop (to fix, move it outside!)
const theme = useContext(ThemeContext);
}
// ...
}
function Bad({ cond }) {
if (cond) {
return;
}
// 🔴 Bad: after a conditional return (to fix, move it before the return!)
const theme = useContext(ThemeContext);
// ...
}
function Bad() {
function handleClick() {
// 🔴 Bad: inside an event handler (to fix, move it outside!)
const theme = useContext(ThemeContext);
}
// ...
}
function Bad() {
const style = useMemo(() => {
// 🔴 Bad: inside useMemo (to fix, move it outside!)
const theme = useContext(ThemeContext);
return createStyle(theme);
});
// ...
}
class Bad extends React.Component {
render() {
// 🔴 Bad: inside a class component (to fix, write a function component instead of a class!)
useEffect(() => {})
// ...
}
}
function Bad() {
try {
// 🔴 Bad: inside try/catch/finally block (to fix, move it outside!)
const [x, setX] = useState(0);
} catch {
const [x, setX] = useState(1);
}
}
```

### Note

[Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks) _may_ call other Hooks (that’s their whole purpose). This works because custom Hooks are also supposed to only be called while a function component is rendering.

Don’t call Hooks from regular JavaScript functions. Instead, you can:

By following this rule, you ensure that all stateful logic in a component is clearly visible from its source code.
