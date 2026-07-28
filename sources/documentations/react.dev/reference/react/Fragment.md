---
title: "<Fragment> (<>...</>) – React"
source_url: "https://react.dev/reference/react/Fragment"
crawled_at: "2026-07-28T04:04:16.695Z"
---

`<Fragment>`, often used via `<>...</>` syntax, lets you group elements without a wrapper node.

### Canary

Fragments can also accept refs, which enable interacting with underlying DOM nodes without adding wrapper elements.

```
<>
<OneChild />
<AnotherChild />
</>
```

-   [Reference](#reference)
    -   [`<Fragment>`](#fragment)
    -   [`FragmentInstance`](#fragmentinstance)
-   [Usage](#usage)
    -   [Returning multiple elements](#returning-multiple-elements)
    -   [Assigning multiple elements to a variable](#assigning-multiple-elements-to-a-variable)
    -   [Grouping elements with text](#grouping-elements-with-text)
    -   [Rendering a list of Fragments](#rendering-a-list-of-fragments)
    -   [Adding event listeners without a wrapper element](#adding-event-listeners-without-wrapper)
    -   [Managing focus across a group of elements](#managing-focus-across-elements)
    -   [Scrolling a group of elements into view](#scrolling-group-into-view)
    -   [Observing visibility without a wrapper element](#observing-visibility-without-wrapper)
    -   [Caching a global IntersectionObserver](#caching-global-intersection-observer)

---

## Reference[](#reference "Link for Reference ")

### `<Fragment>`[](#fragment "Link for this heading")

Wrap elements in `<Fragment>` to group them together in situations where you need a single element. Grouping elements in `Fragment` has no effect on the resulting DOM; it is the same as if the elements were not grouped. The empty JSX tag `<></>` is shorthand for `<Fragment></Fragment>` in most cases.

#### Props[](#props "Link for Props ")

-   **optional** `key`: Fragments declared with the explicit `<Fragment>` syntax may have [keys.](https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key)
-   Canary only **optional** `ref`: A ref object (e.g. from [`useRef`](https://react.dev/reference/react/useRef)) or [callback function](https://react.dev/reference/react-dom/components/common#ref-callback). React provides a `FragmentInstance` as the ref value that implements methods for interacting with the DOM nodes wrapped by the Fragment.

#### Caveats[](#caveats "Link for Caveats ")

-   If you want to pass `key` to a Fragment, you can’t use the `<>...</>` syntax. You have to explicitly import `Fragment` from `'react'` and render `<Fragment key={yourKey}>...</Fragment>`.
    
-   React does not [reset state](https://react.dev/learn/preserving-and-resetting-state) when you go from rendering `<><Child /></>` to `[<Child />]` or back, or when you go from rendering `<><Child /></>` to `<Child />` and back. This only works a single level deep: for example, going from `<><><Child /></></>` to `<Child />` resets the state. See the precise semantics [here.](https://gist.github.com/clemmy/b3ef00f9507909429d8aa0d3ee4f986b)
    
-   Canary only If you want to pass `ref` to a Fragment, you can’t use the `<>...</>` syntax. You have to explicitly import `Fragment` from `'react'` and render `<Fragment ref={yourRef}>...</Fragment>`.
    

---

### Canary only `FragmentInstance`[](#fragmentinstance "Link for this heading")

When you pass a `ref` to a Fragment, React provides a `FragmentInstance` object. It implements methods for interacting with the first-level DOM children wrapped by the Fragment.

-   [`addEventListener`](#addeventlistener) and [`removeEventListener`](#removeeventlistener) manage event listeners across all first-level DOM children.
-   [`dispatchEvent`](#dispatchevent) dispatches an event on the Fragment, which can bubble to the DOM parent.
-   [`focus`](#focus), [`focusLast`](#focuslast), and [`blur`](#blur) manage focus across all nested children depth-first.
-   [`observeUsing`](#observeusing) and [`unobserveUsing`](#unobserveusing) attach and detach `IntersectionObserver` or `ResizeObserver` instances.
-   [`getClientRects`](#getclientrects) returns bounding rectangles of all first-level DOM children.
-   [`getRootNode`](#getrootnode) returns the root node of the Fragment’s parent.
-   [`compareDocumentPosition`](#comparedocumentposition) compares the Fragment’s position with another node.
-   [`scrollIntoView`](#scrollintoview) scrolls the Fragment’s children into view.

---

#### `addEventListener(type, listener, options?)`[](#addeventlistener "Link for this heading")

Adds an event listener to all first-level DOM children of the Fragment.

```
fragmentRef.current.addEventListener('click', handleClick);
```

##### Parameters[](#addeventlistener-parameters "Link for Parameters ")

-   `type`: A string representing the event type to listen for (e.g. `'click'`, `'focus'`).
-   `listener`: The event handler function.
-   **optional** `options`: An options object or boolean for capture, matching the [DOM `addEventListener` API.](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)

##### Returns[](#addeventlistener-returns "Link for Returns ")

`addEventListener` does not return anything (`undefined`).

---

#### `removeEventListener(type, listener, options?)`[](#removeeventlistener "Link for this heading")

Removes an event listener from all first-level DOM children of the Fragment.

```
fragmentRef.current.removeEventListener('click', handleClick);
```

##### Parameters[](#removeeventlistener-parameters "Link for Parameters ")

-   `type`: The event type string.
-   `listener`: The event handler function to remove.
-   **optional** `options`: An options object or boolean, matching the [DOM `removeEventListener` API.](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)

##### Returns[](#removeeventlistener-returns "Link for Returns ")

`removeEventListener` does not return anything (`undefined`).

---

#### `dispatchEvent(event)`[](#dispatchevent "Link for this heading")

Dispatches an event on the Fragment. Added event listeners are called, and the event can bubble to the Fragment’s DOM parent.

```
fragmentRef.current.dispatchEvent(new Event('custom', { bubbles: true }));
```

##### Parameters[](#dispatchevent-parameters "Link for Parameters ")

-   `event`: An [`Event`](https://developer.mozilla.org/en-US/docs/Web/API/Event) object to dispatch. If `bubbles` is `true`, the event bubbles to the Fragment’s parent DOM node.

##### Returns[](#dispatchevent-returns "Link for Returns ")

`true` if the event was not cancelled, `false` if `preventDefault()` was called.

---

#### `focus(options?)`[](#focus "Link for this heading")

Focuses the first focusable DOM node in the Fragment. Unlike calling `element.focus()` on a DOM element, this method searches _all_ nested children depth-first until it finds a focusable element—not just the element itself or its direct children.

```
fragmentRef.current.focus();
```

##### Parameters[](#focus-parameters "Link for Parameters ")

-   **optional** `options`: A [`FocusOptions`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options) object (e.g. `{ preventScroll: true }`).

##### Returns[](#focus-returns "Link for Returns ")

`focus` does not return anything (`undefined`).

---

#### `focusLast(options?)`[](#focuslast "Link for this heading")

Focuses the last focusable DOM node in the Fragment. Searches nested children depth-first, then iterates in reverse.

```
fragmentRef.current.focusLast();
```

##### Parameters[](#focuslast-parameters "Link for Parameters ")

-   **optional** `options`: A [`FocusOptions`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options) object.

##### Returns[](#focuslast-returns "Link for Returns ")

`focusLast` does not return anything (`undefined`).

---

#### `blur()`[](#blur "Link for this heading")

Removes focus from the active element if it is within the Fragment. If `document.activeElement` is not within the Fragment, `blur` does nothing.

```
fragmentRef.current.blur();
```

##### Returns[](#blur-returns "Link for Returns ")

`blur` does not return anything (`undefined`).

---

#### `observeUsing(observer)`[](#observeusing "Link for this heading")

Starts observing all first-level DOM children of the Fragment with the provided observer.

```
const observer = new IntersectionObserver(callback, options);
fragmentRef.current.observeUsing(observer);
```

##### Parameters[](#observeusing-parameters "Link for Parameters ")

-   `observer`: An [`IntersectionObserver`](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver) or [`ResizeObserver`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) instance.

##### Returns[](#observeusing-returns "Link for Returns ")

`observeUsing` does not return anything (`undefined`).

---

#### `unobserveUsing(observer)`[](#unobserveusing "Link for this heading")

Stops observing the Fragment’s DOM children with the specified observer.

```
fragmentRef.current.unobserveUsing(observer);
```

##### Parameters[](#unobserveusing-parameters "Link for Parameters ")

-   `observer`: The same `IntersectionObserver` or `ResizeObserver` instance previously passed to [`observeUsing`](#observeusing).

##### Returns[](#unobserveusing-returns "Link for Returns ")

`unobserveUsing` does not return anything (`undefined`).

---

#### `getClientRects()`[](#getclientrects "Link for this heading")

Returns a flat array of [`DOMRect`](https://developer.mozilla.org/en-US/docs/Web/API/DOMRect) objects representing the bounding rectangles of all first-level DOM children.

```
const rects = fragmentRef.current.getClientRects();
```

##### Returns[](#getclientrects-returns "Link for Returns ")

An `Array<DOMRect>` containing the bounding rectangles of all children.

---

#### `getRootNode(options?)`[](#getrootnode "Link for this heading")

Returns the root node containing the Fragment’s parent DOM node, matching the behavior of [`Node.getRootNode()`](https://developer.mozilla.org/en-US/docs/Web/API/Node/getRootNode).

```
const root = fragmentRef.current.getRootNode();
```

##### Parameters[](#getrootnode-parameters "Link for Parameters ")

-   **optional** `options`: An object with a `composed` boolean property, matching the [DOM `getRootNode` API.](https://developer.mozilla.org/en-US/docs/Web/API/Node/getRootNode#options)

##### Returns[](#getrootnode-returns "Link for Returns ")

A `Document`, `ShadowRoot`, or the `FragmentInstance` itself if there is no parent DOM node.

---

#### `compareDocumentPosition(otherNode)`[](#comparedocumentposition "Link for this heading")

Compares the document position of the Fragment with another node, returning a bitmask matching the behavior of [`Node.compareDocumentPosition()`](https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition).

```
const position = fragmentRef.current.compareDocumentPosition(otherElement);
```

##### Parameters[](#comparedocumentposition-parameters "Link for Parameters ")

-   `otherNode`: The DOM node to compare against.

##### Returns[](#comparedocumentposition-returns "Link for Returns ")

A bitmask of [position flags](https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition#return_value). Empty Fragments and Fragments with children rendered through a [portal](https://react.dev/reference/react-dom/createPortal) include `Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC` in the result.

---

#### `scrollIntoView(alignToTop?)`[](#scrollintoview "Link for this heading")

Scrolls the Fragment’s children into view. When `alignToTop` is `true` or omitted, scrolls to align the first child with the top of the scrollable ancestor. When `alignToTop` is `false`, scrolls to align the last child with the bottom.

```
fragmentRef.current.scrollIntoView();
```

##### Parameters[](#scrollintoview-parameters "Link for Parameters ")

-   **optional** `alignToTop`: A boolean. If `true` (the default), scrolls the first child to the top of the scrollable area. If `false`, scrolls the last child to the bottom. Unlike [`Element.scrollIntoView()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView), this method does not accept a `ScrollIntoViewOptions` object.

##### Returns[](#scrollintoview-returns "Link for Returns ")

`scrollIntoView` does not return anything (`undefined`).

##### Caveats[](#scrollintoview-caveats "Link for Caveats ")

-   `scrollIntoView` does not accept an options object. Passing one throws an error. Use the `alignToTop` boolean instead.
-   When the Fragment has no children, `scrollIntoView` scrolls the nearest sibling or parent into view as a fallback.

---

#### `FragmentInstance` Caveats[](#fragmentinstance-caveats "Link for this heading")

-   Methods that target children (such as `addEventListener`, `observeUsing`, and `getClientRects`) operate on _first-level host (DOM) children_ of the Fragment. They do not directly target children nested inside another DOM element.
-   `focus` and `focusLast` search nested children depth-first for focusable elements, unlike event and observer methods which only target first-level host children.
-   `observeUsing` does not work on text nodes. React logs a warning in development if the Fragment contains only text children.
-   React does not apply event listeners added via `addEventListener` to hidden [`<Activity>`](https://react.dev/reference/react/Activity) trees. When an `Activity` boundary switches from hidden to visible, listeners are applied automatically.
-   Each first-level DOM child of a Fragment with a `ref` gets a `reactFragments` property—a `Set<FragmentInstance>` containing all Fragment instances that own the element. This enables [caching a shared observer](#caching-global-intersection-observer) across multiple Fragments.

---

## Usage[](#usage "Link for Usage ")

### Returning multiple elements[](#returning-multiple-elements "Link for Returning multiple elements ")

Use `Fragment`, or the equivalent `<>...</>` syntax, to group multiple elements together. You can use it to put multiple elements in any place where a single element can go. For example, a component can only return one element, but by using a Fragment you can group multiple elements together and then return them as a group:

```
function Post() {
return (
<>
<PostTitle />
<PostBody />
</>
);
}
```

Fragments are useful because grouping elements with a Fragment has no effect on layout or styles, unlike if you wrapped the elements in another container like a DOM element. If you inspect this example with the browser tools, you’ll see that all `<h1>` and `<article>` DOM nodes appear as siblings without wrappers around them:

##### Deep Dive

#### How to write a Fragment without the special syntax?[](#how-to-write-a-fragment-without-the-special-syntax "Link for How to write a Fragment without the special syntax? ")

The example above is equivalent to importing `Fragment` from React:

```
import { Fragment } from 'react';
function Post() {
return (
<Fragment>
<PostTitle />
<PostBody />
</Fragment>
);
}
```

Usually you won’t need this unless you need to [pass a `key` to your `Fragment`.](#rendering-a-list-of-fragments)

---

### Assigning multiple elements to a variable[](#assigning-multiple-elements-to-a-variable "Link for Assigning multiple elements to a variable ")

Like any other element, you can assign Fragment elements to variables, pass them as props, and so on:

```
function CloseDialog() {
const buttons = (
<>
<OKButton />
<CancelButton />
</>
);
return (
<AlertDialog buttons={buttons}>
      Are you sure you want to leave this page?
</AlertDialog>
);
}
```

---

### Grouping elements with text[](#grouping-elements-with-text "Link for Grouping elements with text ")

You can use `Fragment` to group text together with components:

```
function DateRangePicker({ start, end }) {
return (
<>
      From
<DatePicker date={start} />
      to
<DatePicker date={end} />
</>
);
}
```

---

### Rendering a list of Fragments[](#rendering-a-list-of-fragments "Link for Rendering a list of Fragments ")

Here’s a situation where you need to write `Fragment` explicitly instead of using the `<></>` syntax. When you [render multiple elements in a loop](https://react.dev/learn/rendering-lists), you need to assign a `key` to each element. If the elements within the loop are Fragments, you need to use the normal JSX element syntax in order to provide the `key` attribute:

```
function Blog() {
return posts.map(post =>
<Fragment key={post.id}>
<PostTitle title={post.title} />
<PostBody body={post.body} />
</Fragment>
);
}
```

You can inspect the DOM to verify that there are no wrapper elements around the Fragment children:

---

### Canary only Adding event listeners without a wrapper element[](#adding-event-listeners-without-wrapper "Link for this heading")

Fragment `ref`s let you add event listeners to a group of elements without adding a wrapper DOM node. Use a [ref callback](https://react.dev/reference/react-dom/components/common#ref-callback) to attach and clean up listeners:

The `addEventListener` call applies the listener to every first-level DOM child of the Fragment. When children are dynamically added or removed, the `FragmentInstance` automatically adds or removes the listener.

##### Deep Dive

#### Which children does a Fragment ref target?[](#which-children-does-a-fragment-ref-target "Link for Which children does a Fragment ref target? ")

A `FragmentInstance` targets the **first-level host (DOM) children** of the Fragment. Consider this tree:

```
<Fragment ref={ref}>
<div id="A" />
<Wrapper>
<div id="B">
<div id="C" />
</div>
</Wrapper>
<div id="D" />
</Fragment>
```

`Wrapper` is a React component, so the `FragmentInstance` looks through it to find DOM nodes. The targeted children are `A`, `B`, and `D`. `C` is not targeted because it is nested inside the DOM element `B`.

Methods like `addEventListener`, `observeUsing`, and `getClientRects` operate on these first-level DOM children. `focus` and `focusLast` are different—they search _all_ nested children depth-first to find focusable elements.

---

### Canary only Managing focus across a group of elements[](#managing-focus-across-elements "Link for this heading")

Fragment `ref`s provide `focus`, `focusLast`, and `blur` methods that operate across all DOM nodes within the Fragment:

Calling `focus()` focuses the `street` input—even though it is nested inside a `<fieldset>` and `<label>`. `focus()` searches depth-first through all nested children, not just direct children of the Fragment. `focusLast()` does the same in reverse, and `blur()` removes focus if the currently focused element is within the Fragment.

---

### Canary only Scrolling a group of elements into view[](#scrolling-group-into-view "Link for this heading")

Use `scrollIntoView` to scroll a Fragment’s children into view without a wrapper element. Pass `true` (or omit the argument) to scroll the first child to the top. Pass `false` to scroll the last child to the bottom:

---

### Canary only Observing visibility without a wrapper element[](#observing-visibility-without-wrapper "Link for this heading")

Use `observeUsing` to attach an `IntersectionObserver` to all first-level DOM children of a Fragment. This lets you track visibility without requiring child components to expose `ref`s or adding a wrapper element:

---

### Canary only Caching a global IntersectionObserver[](#caching-global-intersection-observer "Link for this heading")

A common performance optimization for sites with many observers is to share a single IntersectionObserver per config and route its entries to the correct callbacks based on which element intersected. Fragment `ref`s support this same pattern through the `reactFragments` property.

Each first-level DOM child of a Fragment with a `ref` has a `reactFragments` property: a `Set` of `FragmentInstance` objects that contain that element. When the shared observer fires, you can use this property to look up which `FragmentInstance` owns the intersecting element and run the right callbacks.

Multiple `ObservedGroup` components with the same options reuse a single `IntersectionObserver`. When either section scrolls into view, the shared observer fires and uses `reactFragments` to route the entry to the correct callback.
