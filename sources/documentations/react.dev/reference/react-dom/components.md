---
title: "React DOM Components – React"
source_url: "https://react.dev/reference/react-dom/components"
crawled_at: "2026-07-28T04:05:13.052Z"
---

React supports all of the browser built-in [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML/Element) and [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG/Element) components.

---

## Common components[](#common-components "Link for Common components ")

All of the built-in browser components support some props and events.

-   [Common components (e.g. `<div>`)](https://react.dev/reference/react-dom/components/common)

This includes React-specific props like `ref` and `dangerouslySetInnerHTML`.

---

## Form components[](#form-components "Link for Form components ")

These built-in browser components accept user input:

-   [`<input>`](https://react.dev/reference/react-dom/components/input)
-   [`<select>`](https://react.dev/reference/react-dom/components/select)
-   [`<textarea>`](https://react.dev/reference/react-dom/components/textarea)

They are special in React because passing the `value` prop to them makes them _[controlled.](https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable)_

---

## Resource and Metadata Components[](#resource-and-metadata-components "Link for Resource and Metadata Components ")

These built-in browser components let you load external resources or annotate the document with metadata:

-   [`<link>`](https://react.dev/reference/react-dom/components/link)
-   [`<meta>`](https://react.dev/reference/react-dom/components/meta)
-   [`<script>`](https://react.dev/reference/react-dom/components/script)
-   [`<style>`](https://react.dev/reference/react-dom/components/style)
-   [`<title>`](https://react.dev/reference/react-dom/components/title)

They are special in React because React can render them into the document head, suspend while resources are loading, and enact other behaviors that are described on the reference page for each specific component.

---

## All HTML components[](#all-html-components "Link for All HTML components ")

React supports all built-in browser HTML components. This includes:

-   [`<aside>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/aside)
-   [`<audio>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio)
-   [`<b>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/b)
-   [`<base>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base)
-   [`<bdi>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/bdi)
-   [`<bdo>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/bdo)
-   [`<blockquote>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/blockquote)
-   [`<body>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/body)
-   [`<br>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/br)
-   [`<button>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button)
-   [`<canvas>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas)
-   [`<caption>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/caption)
-   [`<cite>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/cite)
-   [`<code>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/code)
-   [`<col>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/col)
-   [`<colgroup>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/colgroup)
-   [`<data>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/data)
-   [`<datalist>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/datalist)
-   [`<dd>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dd)
-   [`<del>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/del)
-   [`<details>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details)
-   [`<dfn>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dfn)
-   [`<dialog>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog)
-   [`<div>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/div)
-   [`<dl>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dl)
-   [`<dt>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dt)
-   [`<em>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/em)
-   [`<embed>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/embed)
-   [`<fieldset>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/fieldset)
-   [`<figcaption>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/figcaption)
-   [`<figure>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/figure)
-   [`<footer>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/footer)
-   [`<form>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form)
-   [`<h1>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/h1)
-   [`<head>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/head)
-   [`<header>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/header)
-   [`<hgroup>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/hgroup)
-   [`<hr>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/hr)
-   [`<html>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/html)
-   [`<i>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/i)
-   [`<iframe>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe)
-   [`<img>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img)
-   [`<input>`](https://react.dev/reference/react-dom/components/input)
-   [`<ins>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ins)
-   [`<kbd>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/kbd)
-   [`<label>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label)
-   [`<legend>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/legend)
-   [`<li>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/li)
-   [`<link>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link)
-   [`<main>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/main)
-   [`<map>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/map)
-   [`<mark>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/mark)
-   [`<menu>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/menu)
-   [`<meta>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta)
-   [`<meter>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meter)
-   [`<nav>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/nav)
-   [`<noscript>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/noscript)
-   [`<object>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/object)
-   [`<ol>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ol)
-   [`<optgroup>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/optgroup)
-   [`<option>`](https://react.dev/reference/react-dom/components/option)
-   [`<output>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/output)
-   [`<p>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/p)
-   [`<picture>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture)
-   [`<pre>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/pre)
-   [`<progress>`](https://react.dev/reference/react-dom/components/progress)
-   [`<q>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/q)
-   [`<rp>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/rp)
-   [`<rt>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/rt)
-   [`<ruby>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ruby)
-   [`<s>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/s)
-   [`<samp>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/samp)
-   [`<script>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script)
-   [`<section>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/section)
-   [`<select>`](https://react.dev/reference/react-dom/components/select)
-   [`<slot>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot)
-   [`<small>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/small)
-   [`<source>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source)
-   [`<span>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/span)
-   [`<strong>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/strong)
-   [`<style>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/style)
-   [`<sub>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/sub)
-   [`<summary>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/summary)
-   [`<sup>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/sup)
-   [`<table>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/table)
-   [`<tbody>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tbody)
-   [`<td>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/td)
-   [`<template>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template)
-   [`<textarea>`](https://react.dev/reference/react-dom/components/textarea)
-   [`<tfoot>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tfoot)
-   [`<th>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/th)
-   [`<thead>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/thead)
-   [`<time>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/time)
-   [`<title>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/title)
-   [`<tr>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tr)
-   [`<track>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/track)
-   [`<u>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/u)
-   [`<ul>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ul)
-   [`<var>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/var)
-   [`<video>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video)
-   [`<wbr>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/wbr)

### Note

Similar to the [DOM standard,](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model) React uses a `camelCase` convention for prop names. For example, you’ll write `tabIndex` instead of `tabindex`. You can convert existing HTML to JSX with an [online converter.](https://transform.tools/html-to-jsx)

---

### Custom HTML elements[](#custom-html-elements "Link for Custom HTML elements ")

If you render a tag with a dash, like `<my-element>`, React will assume you want to render a [custom HTML element.](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements)

If you render a built-in browser HTML element with an [`is`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/is) attribute, it will also be treated as a custom element.

#### Setting values on custom elements[](#attributes-vs-properties "Link for Setting values on custom elements ")

Custom elements have two methods of passing data into them:

1.  Attributes: Which are displayed in markup and can only be set to string values
2.  Properties: Which are not displayed in markup and can be set to arbitrary JavaScript values

By default, React will pass values bound in JSX as attributes:

```
<my-element value="Hello, world!"></my-element>
```

Non-string JavaScript values passed to custom elements will be serialized by default:

```
// Will be passed as `"1,2,3"` as the output of `[1,2,3].toString()`
<my-element value={[1,2,3]}></my-element>
```

React will, however, recognize an custom element’s property as one that it may pass arbitrary values to if the property name shows up on the class during construction:

#### Listening for events on custom elements[](#custom-element-events "Link for Listening for events on custom elements ")

A common pattern when using custom elements is that they may dispatch [`CustomEvent`s](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent) rather than accept a function to call when an event occur. You can listen for these events using an `on` prefix when binding to the event via JSX.
