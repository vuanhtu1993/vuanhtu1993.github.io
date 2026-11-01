---
title: "Interface gallery for mods - Claude Code Docs"
source_url: "https://code.claude.com/docs/en/plugins/mods/gallery"
crawled_at: "2026-11-01T16:44:20.026Z"
---

A mod draws its interface from elements: text, boxes, buttons, fields, and a few that format content for you. The samples here show the code that draws an element, and most come with a screenshot of the result in a terminal pane, so you can pick an element by how it looks. To learn how drawing works, start with [Draw in the interface](https://code.claude.com/docs/en/plugins/mods/interface). For the main props and which apps draw each element, see the [elements reference](https://code.claude.com/docs/en/plugins/mods/reference#elements). The [type declarations](https://code.claude.com/docs/en/plugins/mods/create#get-the-types-for-your-build) list every prop.

## Try a sample

The samples on this page are snippets, not whole mods. Each one is the code for one element and anything nested inside it. To see a sample in your own terminal, create the small mod in these steps and paste the sample into it. The mod adds a `/gallery` command that opens a pane and draws the sample there. A [pane](https://code.claude.com/docs/en/plugins/mods/interface#pick-where-to-draw) is a sidebar beside the transcript in a wide fullscreen terminal, or a framed region above the prompt otherwise.

1

2

3

## Pick an element

The samples are grouped by what you want to put on screen:

-   **[Show text](#show-text)**: `Text`, `Markdown`, and `Link`
-   **[Show code and changes](#show-code-and-changes)**: `Code`
-   **[Arrange elements](#arrange-elements)**: `Box`
-   **[Take input](#take-input)**: `Button`, `Input`, and `Select`
-   **[Draw pictures](#draw-pictures)**: `Raster`, `Svg`, `Image`, and `Client`

## Show text

Three elements put words on screen: `Text` for your own styling, `Markdown` for content that’s already formatted, and `Link` for a URL.

### `Text`

`Text` draws a string with the styles you give it. This sample shows plain text and eight styles, one on each line:

![A pane with nine lines of text, each named for its style: plain, bold, italic, underline, strikethrough, dimColor in gray, inverse, color red, and backgroundColor blue.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793551458/aha-mind/docs-crawler/code.claude.com/mods-el-text-light_ai4o6s.png) ![A pane with nine lines of text, each named for its style: plain, bold, italic, underline, strikethrough, dimColor in gray, inverse, color red, and backgroundColor blue.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793551458/aha-mind/docs-crawler/code.claude.com/mods-el-text-dark_txckzm.png) `dimColor` draws the text in gray. `backgroundColor` fills only as wide as the text.

### `Markdown`

`Markdown` formats text the way Claude’s replies are formatted. Pass the content in `text`, not in `children`:

![A pane with a bold heading, Release notes, then a sentence with one bold word and one colored code word, a two-item list, and a quote drawn in italics with a bar on its left.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793551458/aha-mind/docs-crawler/code.claude.com/mods-el-markdown-light_phvgqk.png) ![A pane with a bold heading, Release notes, then a sentence with one bold word and one colored code word, a two-item list, and a quote drawn in italics with a bar on its left.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793551458/aha-mind/docs-crawler/code.claude.com/mods-el-markdown-dark_odxfdv.png) A heading draws in bold without its `#` marks. Inline code draws in color without its backticks. A quote draws in italics with a bar on its left.

### `Link`

`Link` draws a label followed by its URL:

![A pane with one line: the label Claude Code docs, then the URL in gray.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793551458/aha-mind/docs-crawler/code.claude.com/mods-el-link-light_jtqupu.png) ![A pane with one line: the label Claude Code docs, then the URL in gray.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793551458/aha-mind/docs-crawler/code.claude.com/mods-el-link-dark_uluzbs.png) The terminal draws the URL as text after the label. Whether a click opens it depends on the user’s terminal.

## Show code and changes

`Code` draws source text with Claude Code’s own syntax colors, or a diff. In the VS Code extension, `Code` shows its `source` as plain text, with none of the colors, line numbers, or diff shading in these screenshots.

### `Code`

Name the `language`, or pass a `path` for Claude Code to infer it from. With `startLine`, the lines are numbered from that number:

![A pane with two numbered lines of JavaScript in syntax colors.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793551459/aha-mind/docs-crawler/code.claude.com/mods-el-code-light_jwsn0c.png) ![A pane with two numbered lines of JavaScript in syntax colors.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793551459/aha-mind/docs-crawler/code.claude.com/mods-el-code-dark_szo1wv.png) The colors come from the user’s theme.

### `Code` as a diff

With `format: 'diff'`, `source` is one or more unified diff hunks:

![A pane with a four-line diff. The removed line is shaded red and the added line green, each with its line number. In the added line, the words that runs code have a stronger shade.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793551458/aha-mind/docs-crawler/code.claude.com/mods-el-diff-light_hssx5a.png) ![A pane with a four-line diff. The removed line is shaded red and the added line green, each with its line number. In the added line, the words that runs code have a stronger shade.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793551459/aha-mind/docs-crawler/code.claude.com/mods-el-diff-dark_xxetm5.png) Claude Code draws line numbers in place of the `@@` line. Where a removed line and an added line are alike, the words that changed get a stronger shade.

## Arrange elements

### `Box`

`Box` lays out what’s inside it in a row or a column, and can draw a border. This sample puts a row of words above a bordered box:

![A pane with three words in a row, four columns apart, then a blank row, then a rounded border around one line of text. The border runs the full width of the pane.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793551458/aha-mind/docs-crawler/code.claude.com/mods-el-box-light_cmyfgs.png) ![A pane with three words in a row, four columns apart, then a blank row, then a rounded border around one line of text. The border runs the full width of the pane.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793551458/aha-mind/docs-crawler/code.claude.com/mods-el-box-dark_m5ovsu.png) The border stretches to the width of the pane.

## Take input

`Button`, `Input`, and `Select` are controls: the user moves between them with Tab and uses the one that has the focus. [Keyboard focus and hotkeys](https://code.claude.com/docs/en/plugins/mods/interface#know-which-keys-your-mod-can-receive) covers which keys reach them. Open a pane with `focus: true` to request keyboard focus for it. Typed letters reach an `Input` once it has the focus. To choose which field has the focus when the pane opens, see [Set a hotkey and the first focus](https://code.claude.com/docs/en/plugins/mods/interface#set-a-hotkey-and-the-first-focus).

### `Button`

A button runs `onPress`. This sample shows the default form, a `plain` button with a hotkey, and a dim one:

![A pane with three buttons, one per line: Save in brackets, n: Next without brackets and with the n in color, and Skip in brackets in gray.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793551458/aha-mind/docs-crawler/code.claude.com/mods-el-button-light_u2ujdd.png) ![A pane with three buttons, one per line: Save in brackets, n: Next without brackets and with the n in color, and Skip in brackets in gray.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793551459/aha-mind/docs-crawler/code.claude.com/mods-el-button-dark_m8d8qq.png) A button that has the focus draws in inverse video. Here the user has pressed Tab twice: ![The same three buttons, with the second one, n: Next, drawn in inverse video.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793551459/aha-mind/docs-crawler/code.claude.com/mods-el-button-plain-focused-light_l1beef.png) ![The same three buttons, with the second one, n: Next, drawn in inverse video.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793551459/aha-mind/docs-crawler/code.claude.com/mods-el-button-plain-focused-dark_xb4a4v.png)

### `Input`

An `Input` is a text field that holds one line by default and runs `onSubmit` when the user presses Enter:

Without the focus, the field shows its label and its placeholder: ![A pane with one line: the label Title, then the placeholder Type a title and press Enter in gray.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793551459/aha-mind/docs-crawler/code.claude.com/mods-el-input-light_p04ppt.png) ![A pane with one line: the label Title, then the placeholder Type a title and press Enter in gray.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793551458/aha-mind/docs-crawler/code.claude.com/mods-el-input-dark_tepnrt.png) With the focus, the label turns bold, a cursor appears, and the `submitLabel` shows after `⏎`: ![The same field with its label in bold, a block cursor on the first letter of the placeholder, and a return sign followed by the word save.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793551459/aha-mind/docs-crawler/code.claude.com/mods-el-input-focused-light_vjtdl6.png) ![The same field with its label in bold, a block cursor on the first letter of the placeholder, and a return sign followed by the word save.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793551459/aha-mind/docs-crawler/code.claude.com/mods-el-input-focused-dark_a1xkhb.png) Typing replaces the placeholder: ![The same field holding the typed letters Rel, followed by the return sign and the word save.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793551458/aha-mind/docs-crawler/code.claude.com/mods-el-input-typed-light_bvgyzd.png) ![The same field holding the typed letters Rel, followed by the return sign and the word save.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793551459/aha-mind/docs-crawler/code.claude.com/mods-el-input-typed-dark_hwwwk7.png) Set `rows` to 2 or more for a field that holds several lines, such as a note or a commit message:

The terminal and the Desktop app draw the rows. In the VS Code extension, the field holds one line. `rows` requires Claude Code v2.1.301 or later. On earlier versions the field holds one line. The field takes up the number of rows you set, even when it’s empty, up to the height of the pane or band it’s drawn in. While the field has focus, longer text scrolls inside it.

-   In the terminal, Enter still submits. There, the user starts a new line by typing a backslash and then pressing Enter, or by pressing Shift+Enter where [the terminal emulator supports it](https://code.claude.com/docs/en/terminal-config#enter-multiline-prompts). Those are the same keys as in the prompt.
-   In the terminal, Up and Down move between the field’s rows. From its first and last row they move to the control before or after.
-   `onSubmit` and `onInput` receive the whole text with its lines joined by `\n`.

### `Select`

A `Select` lets the user pick one of several options, and runs `onSelect` with the option’s `value`:

Closed, it shows its label and the current option: ![A pane with one line: the label Format, the current option Markdown, and a small down arrow.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793551458/aha-mind/docs-crawler/code.claude.com/mods-el-select-light_sagg0u.png) ![A pane with one line: the label Format, the current option Markdown, and a small down arrow.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793551459/aha-mind/docs-crawler/code.claude.com/mods-el-select-dark_zhdelb.png) Open, it lists its options and marks one: ![The picker open, with its three options listed under the label. The second option, HTML, is drawn in inverse video.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793551458/aha-mind/docs-crawler/code.claude.com/mods-el-select-moved-light_ffd3ak.png) ![The picker open, with its three options listed under the label. The second option, HTML, is drawn in inverse video.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793551459/aha-mind/docs-crawler/code.claude.com/mods-el-select-moved-dark_scttwn.png) After the user picks an option, the list closes: ![The picker closed again, now showing HTML as the current option.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793551459/aha-mind/docs-crawler/code.claude.com/mods-el-select-picked-light_xnrw9x.png) ![The picker closed again, now showing HTML as the current option.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793551459/aha-mind/docs-crawler/code.claude.com/mods-el-select-picked-dark_q4lwwi.png)

## Draw pictures

### `Raster`

A `Raster` is a grid of colored character cells, for a heat map, a sparkline, or a game board. The terminal draws it. This sample uses the `cellsOf` function in the starter module, which packs the cells into the string a `Raster` takes. [Draw a grid of colored cells](https://code.claude.com/docs/en/plugins/mods/interface#draw-a-grid-of-colored-cells) explains it:

![A pane with a small grid of colored blocks, two rows of three: green, amber, and red, then green, green, and amber.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793551459/aha-mind/docs-crawler/code.claude.com/mods-el-raster-light_kv8cgb.png) ![A pane with a small grid of colored blocks, two rows of three: green, amber, and red, then green, green, and amber.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1793551459/aha-mind/docs-crawler/code.claude.com/mods-el-raster-dark_tird85.png) A `Raster` rounds each color to a smaller palette, so `0x2e7d32` draws as `#337733`.

### `Svg`

An `Svg` draws an SVG document in the Desktop app and the VS Code extension:

In the terminal, a pane that returns only an `Svg` opens empty. To draw something else there, check [`e.surface`](https://code.claude.com/docs/en/plugins/mods/interface#pick-where-to-draw) and return a different tree.

### `Image` and `Client`

Two more elements have no sample here. `Image` draws a PNG or raw pixels in the terminal. `Client` is a region that a second file of yours draws, for animation and pointer input. The [elements reference](https://code.claude.com/docs/en/plugins/mods/reference#elements) lists their props. An `Image` draws as a picture in these terminals:

-   kitty 0.28 or later
-   Ghostty
-   iTerm2 3.5 or later. Drawing in iTerm2 requires Claude Code v2.1.305 or later.

In any other terminal, the user sees the `Image`’s `alt` text, dimmed, in place of the picture. Write `alt` text that stands on its own, because it also shows in these cases, among others:

-   **GNU screen**: a session running inside screen, in any terminal.
-   **tmux**: a session running inside tmux that misses a [requirement for drawing inside tmux](#draw-an-image-inside-tmux).
-   **Background sessions**: every [background session](https://code.claude.com/docs/en/agent-view), whatever terminal it’s attached from.
-   **iTerm2 outside fullscreen rendering**: in iTerm2 the picture draws only under [fullscreen rendering](https://code.claude.com/docs/en/fullscreen), and not while [`CLAUDE_CODE_ALT_SCREEN_FULL_REPAINT`](https://code.claude.com/docs/en/env-vars) is set to `1`. To see the picture, run `/tui fullscreen` at the Claude Code prompt and leave that variable unset.
-   **A file path source in iTerm2 or tmux**: in iTerm2 and inside tmux, an `Image` whose `source` names a `file` shows the `alt` text instead of the picture. If your mod has iTerm2 or tmux users, pass the picture as base64 in `source.png` or `source.rgba` rather than as a path in `source.file`.

If your mod’s users see the dimmed text in a terminal that draws kitty graphics protocol images with Unicode placeholders, they can set [`CLAUDE_CODE_FORCE_TERMINAL_IMAGES`](https://code.claude.com/docs/en/env-vars) to `1`. They shouldn’t set it inside GNU screen, inside tmux older than 3.3, in a tmux popup, or with tmux’s `allow-passthrough` off. There they see no picture and a box in place of the `alt` text.

#### Draw an `Image` inside tmux

If an `Image` shows its `alt` text inside tmux, check these requirements along with the [other `alt` text cases](#image-and-client) such as a background session:

-   Claude Code v2.1.310 or later
-   tmux 3.3 or later
-   Claude Code runs in a tmux pane, not a tmux popup
-   tmux runs inside kitty 0.28 or later, Ghostty, or iTerm2 3.5 or later
-   The tmux options `focus-events` and `allow-passthrough` are `on`. Inside kitty or Ghostty, `allow-passthrough` can also be `all`.
-   Inside iTerm2, tmux runs [without `-CC`](https://code.claude.com/docs/en/fullscreen#use-with-tmux), [fullscreen rendering](https://code.claude.com/docs/en/fullscreen) is on, and `CLAUDE_CODE_ALT_SCREEN_FULL_REPAINT` is unset.
-   Inside iTerm2, the tmux window is no bigger than the iTerm2 window. To check, run `tmux display-message -p '#{window_bigger}'` in that tmux window. If it prints `1`, make the tmux window fit, then restart Claude Code.
-   The mod’s author passes the picture as `png` or `rgba` bytes, not as a `file` path. If you use a mod you didn’t write and the other requirements hold, ask its author to check this one.

For each tmux option that isn’t already set as required, run its command in your shell:

Then detach from tmux, attach again, and restart Claude Code. Restart it again whenever you attach tmux from a different terminal. To keep both options across tmux server restarts, [add both lines to `~/.tmux.conf`](https://code.claude.com/docs/en/terminal-config#configure-tmux) too.

## See where a mod can draw

The samples all draw in a pane. A mod can also draw in other places, and call Claude Code to show something for it:

-   **Pane and band**: [Pick where to draw](https://code.claude.com/docs/en/plugins/mods/interface#pick-where-to-draw)
-   **Claude Code’s own rows, such as the spinner**: [Change what Claude Code already draws](https://code.claude.com/docs/en/plugins/mods/interface#change-what-claude-code-already-draws)
-   **Toast, status line, and log line**: [Show something without starting a turn](https://code.claude.com/docs/en/plugins/mods/api#show-something-without-starting-a-turn)
-   **Question dialog**: [Hold a tool call until the user decides](https://code.claude.com/docs/en/plugins/mods/events#hold-a-tool-call-until-the-user-decides)

## Next steps

-   [Draw in the interface](https://code.claude.com/docs/en/plugins/mods/interface): build a pane with tabs, step by step
-   [Test a drawing](https://code.claude.com/docs/en/plugins/mods/test#test-a-drawing): press your buttons from a test
-   [Elements reference](https://code.claude.com/docs/en/plugins/mods/reference#elements): each element’s main props and the apps that draw it
