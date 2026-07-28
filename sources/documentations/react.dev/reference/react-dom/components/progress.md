---
title: "<progress> – React"
source_url: "https://react.dev/reference/react-dom/components/progress"
crawled_at: "2026-07-28T04:05:26.444Z"
---

The [built-in browser `<progress>` component](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/progress) lets you render a progress indicator.

```
<progress value={0.5} />
```

-   [Reference](#reference)
    -   [`<progress>`](#progress)
-   [Usage](#usage)
    -   [Controlling a progress indicator](#controlling-a-progress-indicator)

---

## Reference[](#reference "Link for Reference ")

### `<progress>`[](#progress "Link for this heading")

To display a progress indicator, render the [built-in browser `<progress>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/progress) component.

```
<progress value={0.5} />
```

[See more examples below.](#usage)

#### Props[](#props "Link for Props ")

`<progress>` supports all [common element props.](https://react.dev/reference/react-dom/components/common#common-props)

Additionally, `<progress>` supports these props:

-   [`max`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/progress#max): A number. Specifies the maximum `value`. Defaults to `1`.
-   [`value`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/progress#value): A number between `0` and `max`, or `null` for indeterminate progress. Specifies how much was done.

---

## Usage[](#usage "Link for Usage ")

### Controlling a progress indicator[](#controlling-a-progress-indicator "Link for Controlling a progress indicator ")

To display a progress indicator, render a `<progress>` component. You can pass a number `value` between `0` and the `max` value you specify. If you don’t pass a `max` value, it will assumed to be `1` by default.

If the operation is not ongoing, pass `value={null}` to put the progress indicator into an indeterminate state.
