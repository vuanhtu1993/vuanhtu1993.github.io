---
title: "<option> – React"
source_url: "https://react.dev/reference/react-dom/components/option"
crawled_at: "2026-07-28T04:05:24.024Z"
---

The [built-in browser `<option>` component](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option) lets you render an option inside a [`<select>`](https://react.dev/reference/react-dom/components/select) box.

```
<select>
<option value="someOption">Some option</option>
<option value="otherOption">Other option</option>
</select>
```

-   [Reference](#reference)
    -   [`<option>`](#option)
-   [Usage](#usage)
    -   [Displaying a select box with options](#displaying-a-select-box-with-options)

---

## Reference[](#reference "Link for Reference ")

### `<option>`[](#option "Link for this heading")

The [built-in browser `<option>` component](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option) lets you render an option inside a [`<select>`](https://react.dev/reference/react-dom/components/select) box.

```
<select>
<option value="someOption">Some option</option>
<option value="otherOption">Other option</option>
</select>
```

[See more examples below.](#usage)

#### Props[](#props "Link for Props ")

`<option>` supports all [common element props.](https://react.dev/reference/react-dom/components/common#common-props)

Additionally, `<option>` supports these props:

-   [`disabled`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option#disabled): A boolean. If `true`, the option will not be selectable and will appear dimmed.
-   [`label`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option#label): A string. Specifies the meaning of the option. If not specified, the text inside the option is used.
-   [`value`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option#value): The value to be used [when submitting the parent `<select>` in a form](https://react.dev/reference/react-dom/components/select#reading-the-select-box-value-when-submitting-a-form) if this option is selected.

#### Caveats[](#caveats "Link for Caveats ")

-   React does not support the `selected` attribute on `<option>`. Instead, pass this option’s `value` to the parent [`<select defaultValue>`](https://react.dev/reference/react-dom/components/select#providing-an-initially-selected-option) for an uncontrolled select box, or [`<select value>`](https://react.dev/reference/react-dom/components/select#controlling-a-select-box-with-a-state-variable) for a controlled select.

---

## Usage[](#usage "Link for Usage ")

### Displaying a select box with options[](#displaying-a-select-box-with-options "Link for Displaying a select box with options ")

Render a `<select>` with a list of `<option>` components inside to display a select box. Give each `<option>` a `value` representing the data to be submitted with the form.

[Read more about displaying a `<select>` with a list of `<option>` components.](https://react.dev/reference/react-dom/components/select)
