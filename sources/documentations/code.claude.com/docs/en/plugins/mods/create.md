---
title: "Create a mod - Claude Code Docs"
source_url: "https://code.claude.com/docs/en/plugins/mods/create"
crawled_at: "2026-11-01T16:38:05.472Z"
---

A mod is a Claude Code [plugin](https://code.claude.com/docs/en/plugins/overview) with an entry file, called the hooks module: a JavaScript or TypeScript file whose functions Claude Code calls when events happen. To make one:

-   **Ask Claude to write it**: [describe what you want](#ask-claude-for-a-mod) in a Claude Code session
-   **Write it yourself**: [follow the tutorial](#write-a-mod-yourself) to learn how a mod’s code works. You don’t need Node.js, a bundler, or a build step, because Claude Code loads `.js` and `.ts` files directly.

If you haven’t decided whether a mod is the right tool, read the [comparison on the overview](https://code.claude.com/docs/en/plugins/mods/overview#compare-mods-settings-hooks-skills-and-mcp-servers) first.

## Ask Claude for a mod

Describe the mod you want in an interactive Claude Code session, and Claude writes it. Claude works from a built-in [skill](https://code.claude.com/docs/en/skills) named `plugin-authoring`, which tells it where to write the mod, which events and methods your version has, and how the mod gets loaded. Claude can load the skill when you ask for a mod, or you can load it yourself by running `/plugin-authoring` at the Claude Code prompt. The mod runs once you approve it, except in [sessions where a mod Claude writes can’t load](#sessions-that-skip-the-approval).

1

2

3

4

### Use the mod in other sessions

A mod Claude wrote loads only in the session that made it, and Claude Code deletes that session’s mods folder once it’s older than [`cleanupPeriodDays`](https://code.claude.com/docs/en/settings-reference#cleanupperioddays). To keep the mod, copy its directory out of the mods folder to a place of your own, such as `~/mods/git-branch`. Then choose how to load it:

-   **In a session you start**: in your shell, run `claude --plugin-dir ~/mods/git-branch`
-   **For other people**: [add it to a marketplace](#share-your-mod) so they can install it

### Sessions where a mod Claude writes can’t load

A mod Claude writes loads only after you approve it, in a trusted workspace where mods are allowed to run. In these sessions it doesn’t load:

-   **Nobody is there to approve**: the session can’t show you a prompt, as in a `claude -p` run or [`dontAsk` mode](https://code.claude.com/docs/en/permission-modes)
-   **The workspace isn’t trusted**: you haven’t accepted the trust prompt for the directory
-   **Mods are disabled**: you started with `--safe-mode` or `--bare`, you set `disableAllHooks`, or your organization’s [managed settings block it](https://code.claude.com/docs/en/plugins/mods/admin#choose-how-much-to-allow)

## Write a mod yourself

In this tutorial you build a mod named `first-mod` that counts the tool calls Claude makes, shows the count beside the spinner while Claude works, and adds a `/tally` command that prints it. You then read the type declarations Claude Code writes beside your mod and run `claude plugin validate`. Together they show you the events and methods your version offers and what Claude Code reads from your code. This recording shows the finished mod. The spinner counts tool calls, `/tally` prints the count, and an edit to the code takes effect while the session runs:

You write three files:

-   **`plugin.json`**: the plugin’s [manifest](https://code.claude.com/docs/en/plugins/manifest-reference)
-   **`hooks.json`**: [points to your code file](https://code.claude.com/docs/en/plugins/mods/reference#files)
-   **`register.js`**: your code, called the hooks module

1

2

3

4

5

6

7

### How the example mod works

Each function you pass to `on` is a hook, which is an event handler. Claude Code passes every hook the same three arguments:

-   **The mods API**, named `$`: every method a mod can call to reach outside itself, in [namespaces](https://code.claude.com/docs/en/plugins/mods/reference#mods-api-methods) such as `$.ui` and `$.command`
-   **The event**, named `e`: the [event’s input](https://code.claude.com/docs/en/plugins/mods/reference#events) as plain data, such as a tool call’s name and arguments
-   **The next handler**, named [`next`](https://code.claude.com/docs/en/plugins/mods/events#how-a-hook-handles-an-event): a function that passes the event on to the other mods and then to Claude Code’s own behavior, and returns the result

The hooks in `first-mod` handle their events in these ways:

-   **Observe**: the `session.start` hook registers the command, and the `tool.call` hook counts the call and asks for a redraw. Both return `next(e)`, so the session starts and the tool runs as usual.
-   **Answer**: the `command.run` hook returns its own result and never calls `next`. The second argument to `on`, `{ command: 'tally' }`, is a filter, called a [matcher](https://code.claude.com/docs/en/plugins/mods/events#filter-which-events-a-hook-handles), so the hook runs only for `/tally`.
-   **Rewrite**: the `ui.render` hook calls `next` with a copy of `e` whose `suffix` holds the count, so Claude Code draws its usual spinner with your text after the word

Claude Code watches a directory loaded with `--plugin-dir` and hot-reloads the hooks module when a file in it changes. Each reload runs `register` again, so `calls` resets to `0` and `/tally` starts counting again. To keep a value across reloads, see [Keep state](https://code.claude.com/docs/en/plugins/mods/interface#keep-state).

## Keep working on a mod

Once a mod loads, you can have Claude change it, check your code against the type definitions for your version, list the events and calls Claude Code finds in it, and test it.

### Change a mod with Claude

To change a mod you already have, start the session with `--plugin-dir` pointed at the mod’s directory, so that what Claude writes loads in the same session:

Then ask for the change, for example `add a /tally-reset command to this mod that sets the tally back to zero`. Claude edits the hooks module, runs `claude plugin validate`, and fixes what it reports. A directory you load with `--plugin-dir` is a [protected path](https://code.claude.com/docs/en/permission-modes#protected-paths), so in `default` and `acceptEdits` modes you’re asked to approve each of Claude’s edits to the mod. The protected paths table gives the result for the other permission modes. Files Claude saves during its turn reload when the turn ends, so you can try `/tally-reset` as soon as Claude finishes.

### Get type definitions for your version

When Claude Code loads a mod from `--plugin-dir` in an interactive session, or a mod [Claude wrote for you](#ask-claude-for-a-mod), it writes TypeScript declaration files into the mod’s `.claude-plugin/types/` directory. They describe the exact events, mods API methods, and elements in the Claude Code version you’re running, so your editor can autocomplete and type-check your hooks. The directory holds these files:

| Path | What it declares |
| --- | --- |
| `claude-code/index.d.ts` | Every event and its input and result, every mods API namespace and method, and the elements each surface can draw |
| `claude-code-tools/index.d.ts` | The built-in tools’ inputs and results, so that checking `e.tool === 'Bash'` narrows `e` |
| `claude-code-mcp/index.d.ts` | The inputs of the MCP tools that were connected the last time you saved a file in the mod |
| `index.d.ts` in a directory named for a plugin | What that plugin adds to the mods API. There’s one directory for each plugin your `plugin.json` lists under `dependencies`. |
| `tsconfig.json` | Compiler options that fit a hooks module |

If your mod has no `tsconfig.json` of its own, Claude Code adds one at the mod’s root that extends the generated one, so your editor and `tsc -p ./first-mod` type-check the mod without more setup. The events and methods can change between releases, so trust these files over any page, this one included, when they disagree. `claude-code/index.d.ts` is the fullest reference for your build, with a comment and an example for every mods API method. To look something up, search the file for its name, such as `'tool.call'`.

### Check what Claude Code reads from your mod

To see your mod the way Claude Code sees it, without running your code or starting a session, use `claude plugin validate`. It checks the manifest and runs the same static analysis on the hooks module’s source that Claude Code runs when it loads a mod. In your shell, run it on the mod’s directory:

For `first-mod`, the output includes these lines.

Check the `hooks:` line for the events your module hooks, each with its filter in braces, and `calls:` for every mods API method it calls. If your module reads or sets environment variables, look for `env reads:` and `env writes:` lines too, and `state reads:` and `state writes:` if it uses [`$.state`](https://code.claude.com/docs/en/plugins/mods/interface#keep-state). You also see one line for each hook that can refuse an action, such as `gating hook without .catch: tool.call`, which says whether that hook has a [`.catch` handler](https://code.claude.com/docs/en/plugins/mods/events#handle-a-hook-that-fails). If an event you meant to handle is missing from the first line, Claude Code won’t call that hook either. The usual cause is a misspelled event name, which the command reports as an error such as `"tool.calls" is not an event`. Follow these rules so that static analysis can find every hook and call:

-   Write each mods API call in full: `$`, the namespace, then the method, as in `$.store.get('notes')`. You can pass `$` to a function declared at the top level of the same file, and for a function of yours named `loadNotes`, the `calls:` line then reads `$.store.get (via loadNotes)`. Passing `$` to a method, a function defined inside the hook, or a function you import from another of your files fails validation. The `read` and `update` functions that [`$.state`](https://code.claude.com/docs/en/plugins/mods/interface#keep-state) uses are the imports that can take it. Don’t assign `$` or one of its namespaces to a variable, destructure it, or index it with a computed name. `const ui = $.ui` fails with `$.ui is used as a value`.
-   Write the event name in each `on` call as a string literal, such as `'tool.call'`. A variable, or a loop over a list of names, fails with `the event name passed to on() is not a string literal`.
-   Inside `register`, don’t declare a second variable or parameter named `on`. Validation fails with `"on" is declared again (shadowed)`.
-   Import only from files inside the plugin directory, by relative path. The one bare import allowed is `claude-code`, for types and a few helpers.
-   Use `import` declarations at the top of the file, as in `import { name } from './file.js'`. A dynamic `import()` fails with `a dynamic import(); a hooks module imports its own files with an import declaration`.
-   Write every file as an ES module, with `import` and not `require`. The [reference](https://code.claude.com/docs/en/plugins/mods/reference#files) lists the file extensions Claude Code loads.

### Test the mod

You can write automated tests for a mod and run them from your shell with `claude plugin test`, with no session, sign-in, or network. A test fires the events your hooks handle and checks what the hooks did. This test fires two tool calls, runs `/tally`, and checks that the reply counts both. Save it as `first-mod/tests/first-mod.test.ts`:

first-mod/tests/first-mod.test.ts

In your shell, run the tests from the `first-mod` directory:

The output names each test and whether it passed, with timings that vary from run to run:

[Test a mod](https://code.claude.com/docs/en/plugins/mods/test) covers stubbing a model call or the store, and testing timers and drawings.

A mod is a plugin, so you version it in the manifest and people install and update it with the `/plugin` commands. How you share it depends on who it’s for:

-   **A few people**: send them the plugin’s directory or a `.zip` of it. See [Share a plugin without a marketplace](https://code.claude.com/docs/en/plugins/publish#share-a-plugin-without-a-marketplace)
-   **Your team**: list it in [your own marketplace](https://code.claude.com/docs/en/plugins/publish#publish-through-your-own-marketplace), such as a private repository with one directory for each plugin. To add that marketplace for everyone who works in a repository, [register it in the repository’s settings](https://code.claude.com/docs/en/plugins/host-marketplace#register-the-marketplace-for-everyone-in-a-repository)
-   **Your whole organization**: an administrator can [install your organization’s mods](https://code.claude.com/docs/en/plugins/mods/admin#install-your-organizations-mods) through managed settings
-   **Anyone**: make your marketplace’s repository public, or [submit the plugin to Anthropic’s directory](https://code.claude.com/docs/en/plugins/publish#submit-to-anthropics-directory)

Before you do, check the plugin’s `name`: `claude plugin validate` fails a name that [looks like one of Anthropic’s own](https://code.claude.com/docs/en/plugins/manifest-reference#name), such as one that starts with `claude-`. The events and methods can change between releases, so your README is the place to say which Claude Code version you tested with. Keep developing against the directory with `--plugin-dir`, not against an installed copy. Claude Code caches an installed plugin by version, so your edits don’t reach the installed copy until you increment the version and install again.

## Next steps

-   [Draw in the interface](https://code.claude.com/docs/en/plugins/mods/interface): open a pane, draw above the prompt, and add buttons and text fields
-   [React to events](https://code.claude.com/docs/en/plugins/mods/events): hook tool calls, prompts, and turns
-   [Use the mods API](https://code.claude.com/docs/en/plugins/mods/api): add commands and tools, call a model, and run work on a timer
-   [Test a mod](https://code.claude.com/docs/en/plugins/mods/test): stub what Claude Code would answer, and test timers and drawings
-   [Troubleshoot a mod](https://code.claude.com/docs/en/plugins/mods/troubleshoot): the reasons a mod does nothing, and the debug log
-   [Read the source of built-in mods](https://code.claude.com/docs/en/plugins/mods/overview#read-the-source-of-built-in-mods): complete plugins, each with its hooks module and tests
