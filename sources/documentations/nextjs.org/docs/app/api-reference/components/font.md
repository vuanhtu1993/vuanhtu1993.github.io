---
title: "Components: Font"
source_url: "https://nextjs.org/docs/app/api-reference/components/font"
crawled_at: "2026-06-25T07:04:24.827Z"
---

## Font Module

Last updated

August 6, 2025

[`next/font`](https://nextjs.org/docs/app/api-reference/components/font) automatically optimizes your fonts (including custom fonts) and removes external network requests for improved privacy and performance.

It includes **built-in automatic self-hosting** for any font file. This means you can optimally load web fonts with no [layout shift](https://web.dev/articles/cls).

You can also conveniently use all [Google Fonts](https://fonts.google.com/). CSS and font files are downloaded at build time and self-hosted with the rest of your static assets. **No requests are sent to Google by the browser.**

> **🎥 Watch:** Learn more about using `next/font` → [YouTube (6 minutes)](https://www.youtube.com/watch?v=L8_98i_bMMA).

## Reference[](#reference)

| Key | `font/google` | `font/local` | Type | Required |
| --- | --- | --- | --- | --- |
| [`src`](#src) |  |  | String or Array of Objects | Yes |
| [`weight`](#weight) |  |  | String or Array | Required/Optional |
| [`style`](#style) |  |  | String or Array | \- |
| [`subsets`](#subsets) |  |  | Array of Strings | \- |
| [`axes`](#axes) |  |  | Array of Strings | \- |
| [`display`](#display) |  |  | String | \- |
| [`preload`](#preload) |  |  | Boolean | \- |
| [`fallback`](#fallback) |  |  | Array of Strings | \- |
| [`adjustFontFallback`](#adjustfontfallback) |  |  | Boolean or String | \- |
| [`variable`](#variable) |  |  | String | \- |
| [`declarations`](#declarations) |  |  | Array of Objects | \- |

### `src`[](#src)

The path of the font file as a string or an array of objects (with type `Array<{path: string, weight?: string, style?: string}>`) relative to the directory where the font loader function is called.

Used in `next/font/local`

-   Required

Examples:

-   `src:'./fonts/my-font.woff2'` where `my-font.woff2` is placed in a directory named `fonts` inside the `app` directory
-   `src:[{path: './inter/Inter-Thin.ttf', weight: '100',},{path: './inter/Inter-Regular.ttf',weight: '400',},{path: './inter/Inter-Bold-Italic.ttf', weight: '700',style: 'italic',},]`
-   if the font loader function is called in `app/page.tsx` using `src:'../styles/fonts/my-font.ttf'`, then `my-font.ttf` is placed in `styles/fonts` at the root of the project

### `weight`[](#weight)

The font [`weight`](https://fonts.google.com/knowledge/glossary/weight) with the following possibilities:

-   A string with possible values of the weights available for the specific font or a range of values if it's a [variable](https://fonts.google.com/variablefonts) font
-   An array of weight values if the font is not a [variable google font](https://fonts.google.com/variablefonts). It applies to `next/font/google` only.

Used in `next/font/google` and `next/font/local`

-   Required if the font being used is **not** [variable](https://fonts.google.com/variablefonts)

Examples:

-   `weight: '400'`: A string for a single weight value - for the font [`Inter`](https://fonts.google.com/specimen/Inter?query=inter), the possible values are `'100'`, `'200'`, `'300'`, `'400'`, `'500'`, `'600'`, `'700'`, `'800'`, `'900'` or `'variable'` where `'variable'` is the default)
-   `weight: '100 900'`: A string for the range between `100` and `900` for a variable font
-   `weight: ['100','400','900']`: An array of 3 possible values for a non variable font

### `style`[](#style)

The font [`style`](https://developer.mozilla.org/docs/Web/CSS/font-style) with the following possibilities:

-   A string [value](https://developer.mozilla.org/docs/Web/CSS/font-style#values) with default value of `'normal'`
-   An array of style values if the font is not a [variable google font](https://fonts.google.com/variablefonts). It applies to `next/font/google` only.

Used in `next/font/google` and `next/font/local`

-   Optional

Examples:

-   `style: 'italic'`: A string - it can be `normal` or `italic` for `next/font/google`
-   `style: 'oblique'`: A string - it can take any value for `next/font/local` but is expected to come from [standard font styles](https://developer.mozilla.org/docs/Web/CSS/font-style)
-   `style: ['italic','normal']`: An array of 2 values for `next/font/google` - the values are from `normal` and `italic`

### `subsets`[](#subsets)

The font [`subsets`](https://fonts.google.com/knowledge/glossary/subsetting) defined by an array of string values with the names of each subset you would like to be [preloaded](https://nextjs.org/docs/app/api-reference/components/font#specifying-a-subset). Fonts specified via `subsets` will have a link preload tag injected into the head when the [`preload`](#preload) option is true, which is the default.

Used in `next/font/google`

-   Optional

Examples:

-   `subsets: ['latin']`: An array with the subset `latin`

You can find a list of all subsets on the Google Fonts page for your font.

### `axes`[](#axes)

Some variable fonts have extra `axes` that can be included. By default, only the font weight is included to keep the file size down. The possible values of `axes` depend on the specific font.

Used in `next/font/google`

-   Optional

Examples:

-   `axes: ['slnt']`: An array with value `slnt` for the `Inter` variable font which has `slnt` as additional `axes` as shown [here](https://fonts.google.com/variablefonts?vfquery=inter#font-families). You can find the possible `axes` values for your font by using the filter on the [Google variable fonts page](https://fonts.google.com/variablefonts#font-families) and looking for axes other than `wght`

### `display`[](#display)

The font [`display`](https://developer.mozilla.org/docs/Web/CSS/@font-face/font-display) with possible string [values](https://developer.mozilla.org/docs/Web/CSS/@font-face/font-display#values) of `'auto'`, `'block'`, `'swap'`, `'fallback'` or `'optional'` with default value of `'swap'`.

Used in `next/font/google` and `next/font/local`

-   Optional

Examples:

-   `display: 'optional'`: A string assigned to the `optional` value

### `preload`[](#preload)

A boolean value that specifies whether the font should be [preloaded](https://nextjs.org/docs/app/api-reference/components/font#preloading) or not. The default is `true`.

Used in `next/font/google` and `next/font/local`

-   Optional

Examples:

-   `preload: false`

### `fallback`[](#fallback)

The fallback font to use if the font cannot be loaded. An array of strings of fallback fonts with no default.

-   Optional

Used in `next/font/google` and `next/font/local`

Examples:

-   `fallback: ['system-ui', 'arial']`: An array setting the fallback fonts to `system-ui` or `arial`

### `adjustFontFallback`[](#adjustfontfallback)

-   For `next/font/google`: A boolean value that sets whether an automatic fallback font should be used to reduce [Cumulative Layout Shift](https://web.dev/cls/). The default is `true`.
-   For `next/font/local`: A string or boolean `false` value that sets whether an automatic fallback font should be used to reduce [Cumulative Layout Shift](https://web.dev/cls/). The possible values are `'Arial'`, `'Times New Roman'` or `false`. The default is `'Arial'`.

Used in `next/font/google` and `next/font/local`

-   Optional

Examples:

-   `adjustFontFallback: false`: for `next/font/google`
-   `adjustFontFallback: 'Times New Roman'`: for `next/font/local`

### `variable`[](#variable)

A string value to define the CSS variable name to be used if the style is applied with the [CSS variable method](#css-variables).

Used in `next/font/google` and `next/font/local`

-   Optional

Examples:

-   `variable: '--my-font'`: The CSS variable `--my-font` is declared

### `declarations`[](#declarations)

An array of font face [descriptor](https://developer.mozilla.org/docs/Web/CSS/@font-face#descriptors) key-value pairs that define the generated `@font-face` further.

Used in `next/font/local`

-   Optional

Examples:

-   `declarations: [{ prop: 'ascent-override', value: '90%' }]`

## Examples[](#examples)

## Google Fonts[](#google-fonts)

To use a Google font, import it from `next/font/google` as a function. We recommend using [variable fonts](https://fonts.google.com/variablefonts) for the best performance and flexibility.

If you can't use a variable font, you will **need to specify a weight**:

You can specify multiple weights and/or styles by using an array:

> **Good to know**: Use an underscore (\_) for font names with multiple words. E.g. `Roboto Mono` should be imported as `Roboto_Mono`.

### Specifying a subset[](#specifying-a-subset)

Google Fonts are automatically [subset](https://fonts.google.com/knowledge/glossary/subsetting). This reduces the size of the font file and improves performance. You'll need to define which of these subsets you want to preload. Failing to specify any subsets while [`preload`](https://nextjs.org/docs/app/api-reference/components/font#preload) is `true` will result in a warning.

This can be done by adding it to the function call:

View the [Font API Reference](https://nextjs.org/docs/app/api-reference/components/font) for more information.

## Using Multiple Fonts[](#using-multiple-fonts)

You can import and use multiple fonts in your application. There are two approaches you can take.

The first approach is to create a utility function that exports a font, imports it, and applies its `className` where needed. This ensures the font is preloaded only when it's rendered:

In the example above, `Inter` will be applied globally, and `Roboto Mono` can be imported and applied as needed.

Alternatively, you can create a [CSS variable](https://nextjs.org/docs/app/api-reference/components/font#variable) and use it with your preferred CSS solution:

In the example above, `Inter` will be applied globally, and any `<h1>` tags will be styled with `Roboto Mono`.

> **Recommendation**: Use multiple fonts conservatively since each new font is an additional resource the client has to download.

### Local Fonts[](#local-fonts)

Import `next/font/local` and specify the `src` of your local font file. We recommend using [variable fonts](https://fonts.google.com/variablefonts) for the best performance and flexibility.

If you want to use multiple files for a single font family, `src` can be an array:

View the [Font API Reference](https://nextjs.org/docs/app/api-reference/components/font) for more information.

### With Tailwind CSS[](#with-tailwind-css)

`next/font` integrates seamlessly with [Tailwind CSS](https://tailwindcss.com/) using [CSS variables](https://nextjs.org/docs/app/api-reference/components/font#css-variables).

In the example below, we use the `Inter` and `Roboto_Mono` fonts from `next/font/google` (you can use any Google Font or Local Font). Use the `variable` option to define a CSS variable name, such as `inter` and `roboto_mono` for these fonts, respectively. Then, apply `inter.variable` and `roboto_mono.variable` to include the CSS variables in your HTML document.

> **Good to know**: You can add these variables to the `<html>` or `<body>` tag, depending on your preference, styling needs or project requirements.

Finally, add the CSS variable to your [Tailwind CSS config](https://nextjs.org/docs/app/getting-started/css#tailwind-css):

### Tailwind CSS v3[](#tailwind-css-v3)

You can now use the `font-sans` and `font-mono` utility classes to apply the font to your elements.

### Applying Styles[](#applying-styles)

You can apply the font styles in three ways:

-   [`className`](#classname)
-   [`style`](#style-1)
-   [CSS Variables](#css-variables)

#### `className`[](#classname)

Returns a read-only CSS `className` for the loaded font to be passed to an HTML element.

#### `style`[](#style-1)

Returns a read-only CSS `style` object for the loaded font to be passed to an HTML element, including `style.fontFamily` to access the font family name and fallback fonts.

#### CSS Variables[](#css-variables)

If you would like to set your styles in an external style sheet and specify additional options there, use the CSS variable method.

In addition to importing the font, also import the CSS file where the CSS variable is defined and set the variable option of the font loader object as follows:

To use the font, set the `className` of the parent container of the text you would like to style to the font loader's `variable` value and the `className` of the text to the `styles` property from the external CSS file.

Define the `text` selector class in the `component.module.css` CSS file as follows:

In the example above, the text `Hello World` is styled using the `Inter` font and the generated font fallback with `font-weight: 200` and `font-style: italic`.

### Using a font definitions file[](#using-a-font-definitions-file)

Every time you call the `localFont` or Google font function, that font will be hosted as one instance in your application. Therefore, if you need to use the same font in multiple places, you should load it in one place and import the related font object where you need it. This is done using a font definitions file.

For example, create a `fonts.ts` file in a `styles` folder at the root of your app directory.

Then, specify your font definitions as follows:

You can now use these definitions in your code as follows:

To make it easier to access the font definitions in your code, you can define a path alias in your `tsconfig.json` or `jsconfig.json` files as follows:

You can now import any font definition as follows:

### Preloading[](#preloading)

When a font function is called on a page of your site, it is not globally available and preloaded on all routes. Rather, the font is only preloaded on the related routes based on the type of file where it is used:

-   If it's a [unique page](https://nextjs.org/docs/app/api-reference/file-conventions/page), it is preloaded on the unique route for that page.
-   If it's a [layout](https://nextjs.org/docs/app/api-reference/file-conventions/layout), it is preloaded on all the routes wrapped by the layout.
-   If it's the [root layout](https://nextjs.org/docs/app/api-reference/file-conventions/layout#root-layout), it is preloaded on all routes.

## Version Changes[](#version-changes)

| Version | Changes |
| --- | --- |
| `v13.2.0` | `@next/font` renamed to `next/font`. Installation no longer required. |
| `v13.0.0` | `@next/font` was added. |
