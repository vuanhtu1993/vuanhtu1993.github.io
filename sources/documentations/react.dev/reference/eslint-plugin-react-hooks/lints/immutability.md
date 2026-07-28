---
title: "immutability – React"
source_url: "https://react.dev/reference/eslint-plugin-react-hooks/lints/immutability"
crawled_at: "2026-07-28T04:07:37.411Z"
---

A component’s props and state are immutable snapshots. Never mutate them directly. Instead, pass new props down, and use the setter function from `useState`.

```
// ❌ Array push mutation
function Component() {
const [items, setItems] = useState([1, 2, 3]);
const addItem = () => {
items.push(4); // Mutating!
setItems(items); // Same reference, no re-render
};
}
// ❌ Object property assignment
function Component() {
const [user, setUser] = useState({name: 'Alice'});
const updateName = () => {
user.name = 'Bob'; // Mutating!
setUser(user); // Same reference
};
}
// ❌ Sort without spreading
function Component() {
const [items, setItems] = useState([3, 1, 2]);
const sortItems = () => {
setItems(items.sort()); // sort mutates!
};
}
```
