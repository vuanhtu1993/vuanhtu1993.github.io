---
title: "Children – React"
source_url: "https://react.dev/reference/react/Children"
crawled_at: "2026-07-28T04:08:30.888Z"
---

### Pitfall

Using `Children` is uncommon and can lead to fragile code. [See common alternatives.](#alternatives)

`Children` lets you manipulate and transform the JSX you received as the [`children` prop.](https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children)

```
const mappedChildren = Children.map(children, child =>
<div className="Row">
{child}
</div>
);
```

-   [Reference](#reference)
    -   [`Children.count(children)`](#children-count)
    -   [`Children.forEach(children, fn, thisArg?)`](#children-foreach)
    -   [`Children.map(children, fn, thisArg?)`](#children-map)
    -   [`Children.only(children)`](#children-only)
    -   [`Children.toArray(children)`](#children-toarray)
-   [Usage](#usage)
    -   [Transforming children](#transforming-children)
    -   [Running some code for each child](#running-some-code-for-each-child)
    -   [Counting children](#counting-children)
    -   [Converting children to an array](#converting-children-to-an-array)
-   [Alternatives](#alternatives)
    -   [Exposing multiple components](#exposing-multiple-components)
    -   [Accepting an array of objects as a prop](#accepting-an-array-of-objects-as-a-prop)
    -   [Calling a render prop to customize rendering](#calling-a-render-prop-to-customize-rendering)
-   [Troubleshooting](#troubleshooting)
    -   [I pass a custom component, but the `Children` methods don’t show its render result](#i-pass-a-custom-component-but-the-children-methods-dont-show-its-render-result)

---

## Reference[](#reference "Link for Reference ")

### `Children.count(children)`[](#children-count "Link for this heading")

Call `Children.count(children)` to count the number of children in the `children` data structure.

```
import { Children } from 'react';
function RowList({ children }) {
return (
<>
<h1>Total rows: {Children.count(children)}</h1>
      ...
</>
);
}
```

[See more examples below.](#counting-children)

#### Parameters[](#children-count-parameters "Link for Parameters ")

-   `children`: The value of the [`children` prop](https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children) received by your component.

#### Returns[](#children-count-returns "Link for Returns ")

The number of nodes inside these `children`.

#### Caveats[](#children-count-caveats "Link for Caveats ")

-   Empty nodes (`null`, `undefined`, and Booleans), strings, numbers, and [React elements](https://react.dev/reference/react/createElement) count as individual nodes. Arrays don’t count as individual nodes, but their children do. **The traversal does not go deeper than React elements:** they don’t get rendered, and their children aren’t traversed. [Fragments](https://react.dev/reference/react/Fragment) don’t get traversed.

---

### `Children.forEach(children, fn, thisArg?)`[](#children-foreach "Link for this heading")

Call `Children.forEach(children, fn, thisArg?)` to run some code for each child in the `children` data structure.

```
import { Children } from 'react';
function SeparatorList({ children }) {
const result = [];
Children.forEach(children, (child, index) => {
result.push(child);
result.push(<hr key={index} />);
});
// ...
```

[See more examples below.](#running-some-code-for-each-child)

#### Parameters[](#children-foreach-parameters "Link for Parameters ")

-   `children`: The value of the [`children` prop](https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children) received by your component.
-   `fn`: The function you want to run for each child, similar to the [array `forEach` method](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach) callback. It will be called with the child as the first argument and its index as the second argument. The index starts at `0` and increments on each call.
-   **optional** `thisArg`: The [`this` value](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this) with which the `fn` function should be called. If omitted, it’s `undefined`.

#### Returns[](#children-foreach-returns "Link for Returns ")

`Children.forEach` returns `undefined`.

#### Caveats[](#children-foreach-caveats "Link for Caveats ")

-   Empty nodes (`null`, `undefined`, and Booleans), strings, numbers, and [React elements](https://react.dev/reference/react/createElement) count as individual nodes. Arrays don’t count as individual nodes, but their children do. **The traversal does not go deeper than React elements:** they don’t get rendered, and their children aren’t traversed. [Fragments](https://react.dev/reference/react/Fragment) don’t get traversed.

---

### `Children.map(children, fn, thisArg?)`[](#children-map "Link for this heading")

Call `Children.map(children, fn, thisArg?)` to map or transform each child in the `children` data structure.

```
import { Children } from 'react';
function RowList({ children }) {
return (
<div className="RowList">
{Children.map(children, child =>
<div className="Row">
{child}
</div>
)}
</div>
);
}
```

[See more examples below.](#transforming-children)

#### Parameters[](#children-map-parameters "Link for Parameters ")

-   `children`: The value of the [`children` prop](https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children) received by your component.
-   `fn`: The mapping function, similar to the [array `map` method](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) callback. It will be called with the child as the first argument and its index as the second argument. The index starts at `0` and increments on each call. You need to return a React node from this function. This may be an empty node (`null`, `undefined`, or a Boolean), a string, a number, a React element, or an array of other React nodes.
-   **optional** `thisArg`: The [`this` value](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this) with which the `fn` function should be called. If omitted, it’s `undefined`.

#### Returns[](#children-map-returns "Link for Returns ")

If `children` is `null` or `undefined`, returns the same value.

Otherwise, returns a flat array consisting of the nodes you’ve returned from the `fn` function. The returned array will contain all nodes you returned except for `null` and `undefined`.

#### Caveats[](#children-map-caveats "Link for Caveats ")

-   Empty nodes (`null`, `undefined`, and Booleans), strings, numbers, and [React elements](https://react.dev/reference/react/createElement) count as individual nodes. Arrays don’t count as individual nodes, but their children do. **The traversal does not go deeper than React elements:** they don’t get rendered, and their children aren’t traversed. [Fragments](https://react.dev/reference/react/Fragment) don’t get traversed.
    
-   If you return an element or an array of elements with keys from `fn`, **the returned elements’ keys will be automatically combined with the key of the corresponding original item from `children`.** When you return multiple elements from `fn` in an array, their keys only need to be unique locally amongst each other.
    

---

### `Children.only(children)`[](#children-only "Link for this heading")

Call `Children.only(children)` to assert that `children` represent a single React element.

```
function Box({ children }) {
const element = Children.only(children);
// ...
```

#### Parameters[](#children-only-parameters "Link for Parameters ")

-   `children`: The value of the [`children` prop](https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children) received by your component.

#### Returns[](#children-only-returns "Link for Returns ")

If `children` [is a valid element,](https://react.dev/reference/react/isValidElement) returns that element.

Otherwise, throws an error.

#### Caveats[](#children-only-caveats "Link for Caveats ")

-   This method always **throws if you pass an array (such as the return value of `Children.map`) as `children`.** In other words, it enforces that `children` is a single React element, not that it’s an array with a single element.

---

### `Children.toArray(children)`[](#children-toarray "Link for this heading")

Call `Children.toArray(children)` to create an array out of the `children` data structure.

```
import { Children } from 'react';
export default function ReversedList({ children }) {
const result = Children.toArray(children);
result.reverse();
// ...
```

#### Parameters[](#children-toarray-parameters "Link for Parameters ")

-   `children`: The value of the [`children` prop](https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children) received by your component.

#### Returns[](#children-toarray-returns "Link for Returns ")

Returns a flat array of elements in `children`.

#### Caveats[](#children-toarray-caveats "Link for Caveats ")

-   Empty nodes (`null`, `undefined`, and Booleans) will be omitted in the returned array. **The returned elements’ keys will be calculated from the original elements’ keys and their level of nesting and position.** This ensures that flattening the array does not introduce changes in behavior.

---

## Usage[](#usage "Link for Usage ")

### Transforming children[](#transforming-children "Link for Transforming children ")

To transform the children JSX that your component [receives as the `children` prop,](https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children) call `Children.map`:

```
import { Children } from 'react';
function RowList({ children }) {
return (
<div className="RowList">
{Children.map(children, child =>
<div className="Row">
{child}
</div>
)}
</div>
);
}
```

In the example above, the `RowList` wraps every child it receives into a `<div className="Row">` container. For example, let’s say the parent component passes three `<p>` tags as the `children` prop to `RowList`:

```
<RowList>
<p>This is the first item.</p>
<p>This is the second item.</p>
<p>This is the third item.</p>
</RowList>
```

Then, with the `RowList` implementation above, the final rendered result will look like this:

```
<div className="RowList">
<div className="Row">
<p>This is the first item.</p>
</div>
<div className="Row">
<p>This is the second item.</p>
</div>
<div className="Row">
<p>This is the third item.</p>
</div>
</div>
```

`Children.map` is similar to [to transforming arrays with `map()`.](https://react.dev/learn/rendering-lists) The difference is that the `children` data structure is considered _opaque._ This means that even if it’s sometimes an array, you should not assume it’s an array or any other particular data type. This is why you should use `Children.map` if you need to transform it.

##### Deep Dive

#### Why is the children prop not always an array?[](#why-is-the-children-prop-not-always-an-array "Link for Why is the children prop not always an array? ")

In React, the `children` prop is considered an _opaque_ data structure. This means that you shouldn’t rely on how it is structured. To transform, filter, or count children, you should use the `Children` methods.

In practice, the `children` data structure is often represented as an array internally. However, if there is only a single child, then React won’t create an extra array since this would lead to unnecessary memory overhead. As long as you use the `Children` methods instead of directly introspecting the `children` prop, your code will not break even if React changes how the data structure is actually implemented.

Even when `children` is an array, `Children.map` has useful special behavior. For example, `Children.map` combines the [keys](https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key) on the returned elements with the keys on the `children` you’ve passed to it. This ensures the original JSX children don’t “lose” keys even if they get wrapped like in the example above.

### Pitfall

The `children` data structure **does not include rendered output** of the components you pass as JSX. In the example below, the `children` received by the `RowList` only contains two items rather than three:

1.  `<p>This is the first item.</p>`
2.  `<MoreRows />`

This is why only two row wrappers are generated in this example:

```
import RowList from './RowList.js';

export default function App() {
  return (
    <RowList>
      <p>This is the first item.</p>
      <MoreRows />
    </RowList>
  );
}

function MoreRows() {
  return (
    <>
      <p>This is the second item.</p>
      <p>This is the third item.</p>
    </>
  );
}

```

**There is no way to get the rendered output of an inner component** like `<MoreRows />` when manipulating `children`. This is why [it’s usually better to use one of the alternative solutions.](#alternatives)

---

### Running some code for each child[](#running-some-code-for-each-child "Link for Running some code for each child ")

Call `Children.forEach` to iterate over each child in the `children` data structure. It does not return any value and is similar to the [array `forEach` method.](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach) You can use it to run custom logic like constructing your own array.

### Pitfall

As mentioned earlier, there is no way to get the rendered output of an inner component when manipulating `children`. This is why [it’s usually better to use one of the alternative solutions.](#alternatives)

---

### Counting children[](#counting-children "Link for Counting children ")

Call `Children.count(children)` to calculate the number of children.

```
import { Children } from 'react';

export default function RowList({ children }) {
  return (
    <div className="RowList">
      <h1 className="RowListHeader">
        Total rows: {Children.count(children)}
      </h1>
      {Children.map(children, child =>
        <div className="Row">
          {child}
        </div>
      )}
    </div>
  );
}

```

### Pitfall

As mentioned earlier, there is no way to get the rendered output of an inner component when manipulating `children`. This is why [it’s usually better to use one of the alternative solutions.](#alternatives)

---

### Converting children to an array[](#converting-children-to-an-array "Link for Converting children to an array ")

Call `Children.toArray(children)` to turn the `children` data structure into a regular JavaScript array. This lets you manipulate the array with built-in array methods like [`filter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter), [`sort`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort), or [`reverse`.](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reverse)

### Pitfall

As mentioned earlier, there is no way to get the rendered output of an inner component when manipulating `children`. This is why [it’s usually better to use one of the alternative solutions.](#alternatives)

---

## Alternatives[](#alternatives "Link for Alternatives ")

### Note

This section describes alternatives to the `Children` API (with capital `C`) that’s imported like this:

```
import { Children } from 'react';
```

Don’t confuse it with [using the `children` prop](https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children) (lowercase `c`), which is good and encouraged.

### Exposing multiple components[](#exposing-multiple-components "Link for Exposing multiple components ")

Manipulating children with the `Children` methods often leads to fragile code. When you pass children to a component in JSX, you don’t usually expect the component to manipulate or transform the individual children.

When you can, try to avoid using the `Children` methods. For example, if you want every child of `RowList` to be wrapped in `<div className="Row">`, export a `Row` component, and manually wrap every row into it like this:

```
import { RowList, Row } from './RowList.js';

export default function App() {
  return (
    <RowList>
      <Row>
        <p>This is the first item.</p>
      </Row>
      <Row>
        <p>This is the second item.</p>
      </Row>
      <Row>
        <p>This is the third item.</p>
      </Row>
    </RowList>
  );
}

```

Unlike using `Children.map`, this approach does not wrap every child automatically. **However, this approach has a significant benefit compared to the [earlier example with `Children.map`](#transforming-children) because it works even if you keep extracting more components.** For example, it still works if you extract your own `MoreRows` component:

```
import { RowList, Row } from './RowList.js';

export default function App() {
  return (
    <RowList>
      <Row>
        <p>This is the first item.</p>
      </Row>
      <MoreRows />
    </RowList>
  );
}

function MoreRows() {
  return (
    <>
      <Row>
        <p>This is the second item.</p>
      </Row>
      <Row>
        <p>This is the third item.</p>
      </Row>
    </>
  );
}

```

This wouldn’t work with `Children.map` because it would “see” `<MoreRows />` as a single child (and a single row).

---

### Accepting an array of objects as a prop[](#accepting-an-array-of-objects-as-a-prop "Link for Accepting an array of objects as a prop ")

You can also explicitly pass an array as a prop. For example, this `RowList` accepts a `rows` array as a prop:

Since `rows` is a regular JavaScript array, the `RowList` component can use built-in array methods like [`map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) on it.

This pattern is especially useful when you want to be able to pass more information as structured data together with children. In the below example, the `TabSwitcher` component receives an array of objects as the `tabs` prop:

```
import TabSwitcher from './TabSwitcher.js';

export default function App() {
  return (
    <TabSwitcher tabs={[
      {
        id: 'first',
        header: 'First',
        content: <p>This is the first item.</p>
      },
      {
        id: 'second',
        header: 'Second',
        content: <p>This is the second item.</p>
      },
      {
        id: 'third',
        header: 'Third',
        content: <p>This is the third item.</p>
      }
    ]} />
  );
}

```

Unlike passing the children as JSX, this approach lets you associate some extra data like `header` with each item. Because you are working with the `tabs` directly, and it is an array, you do not need the `Children` methods.

---

### Calling a render prop to customize rendering[](#calling-a-render-prop-to-customize-rendering "Link for Calling a render prop to customize rendering ")

Instead of producing JSX for every single item, you can also pass a function that returns JSX, and call that function when necessary. In this example, the `App` component passes a `renderContent` function to the `TabSwitcher` component. The `TabSwitcher` component calls `renderContent` only for the selected tab:

A prop like `renderContent` is called a _render prop_ because it is a prop that specifies how to render a piece of the user interface. However, there is nothing special about it: it is a regular prop which happens to be a function.

Render props are functions, so you can pass information to them. For example, this `RowList` component passes the `id` and the `index` of each row to the `renderRow` render prop, which uses `index` to highlight even rows:

```
import { RowList, Row } from './RowList.js';

export default function App() {
  return (
    <RowList
      rowIds={['first', 'second', 'third']}
      renderRow={(id, index) => {
        return (
          <Row isHighlighted={index % 2 === 0}>
            <p>This is the {id} item.</p>
          </Row>
        );
      }}
    />
  );
}

```

This is another example of how parent and child components can cooperate without manipulating the children.

---

## Troubleshooting[](#troubleshooting "Link for Troubleshooting ")

### I pass a custom component, but the `Children` methods don’t show its render result[](#i-pass-a-custom-component-but-the-children-methods-dont-show-its-render-result "Link for this heading")

Suppose you pass two children to `RowList` like this:

```
<RowList>
<p>First item</p>
<MoreRows />
</RowList>
```

If you do `Children.count(children)` inside `RowList`, you will get `2`. Even if `MoreRows` renders 10 different items, or if it returns `null`, `Children.count(children)` will still be `2`. From the `RowList`’s perspective, it only “sees” the JSX it has received. It does not “see” the internals of the `MoreRows` component.

The limitation makes it hard to extract a component. This is why [alternatives](#alternatives) are preferred to using `Children`.
