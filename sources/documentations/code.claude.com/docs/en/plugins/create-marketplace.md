---
title: "Create a marketplace - Claude Code Docs"
source_url: "https://code.claude.com/docs/en/plugins/create-marketplace"
crawled_at: "2026-11-01T16:41:23.583Z"
---

A plugin marketplace is a directory or repository with a `.claude-plugin/marketplace.json` file that lists your plugins and where to fetch each one. You push the directory to a git host, and anyone with access registers it in Claude Code with one command and installs your plugins from it. Create your own marketplace when you want a group you choose, such as your team or your organization, to install your plugins and keep receiving your updates from a catalog you control. The repository can be private, it can list as many plugins as you like, and an administrator can [require it on every machine](https://code.claude.com/docs/en/plugins/org).

Start with [Create a marketplace](#create-a-marketplace) to build one on your own machine and install a plugin from it, then [add more plugin entries](#add-plugin-entries).

## Create a marketplace

The following steps create a marketplace on your machine, add a plugin to it, register it in Claude Code, and install the plugin from it. That is the whole loop, and it’s the same loop your users go through once you host the marketplace somewhere they can reach. Run every command in your shell, from the directory where you want `my-marketplace/` created. You need a plugin to list. The example uses `my-first-plugin` from [Create your first plugin](https://code.claude.com/docs/en/plugins/create#create-your-first-plugin), a plugin with one skill that you run as `/my-first-plugin:hello`; build it first if you don’t have a plugin yet. To use a plugin of your own instead, substitute its directory and its `name` wherever the steps say `my-first-plugin`. For what a plugin directory can contain, see the [plugin directory explorer](https://code.claude.com/docs/en/plugins/components#explore-the-plugin-directory).

1

2

3

4

5

## Add plugin entries

Every plugin you distribute is one object in the `plugins` array of `marketplace.json`. To add a second plugin, add a second object. These fields cover most entries:

-   `name`: the identifier people type before `@` when they install. [Plugin entries](https://code.claude.com/docs/en/plugins/marketplace-reference#plugin-entries) gives the characters a name can use.
-   `source`: where Claude Code fetches the plugin from. Write a relative path string for a plugin inside the marketplace directory, as in [the walkthrough](#create-a-marketplace), or a source object for a plugin outside it. See [Choose a plugin source](#choose-a-plugin-source).
-   `description`: the line people see next to the plugin when they browse your marketplace in `/plugin`.

For the full field list, see [Plugin entries](https://code.claude.com/docs/en/plugins/marketplace-reference#plugin-entries), which also covers the [`plugin.json`](https://code.claude.com/docs/en/plugins/manifest-reference) fields an entry can set and when they apply.

## Rules for plugin entries

Most failed installs from a new marketplace come from a relative path written from the wrong directory, or from an entry name that differs from the `name` in the plugin’s `plugin.json`.

### Write relative paths from the marketplace root

The marketplace root is the directory that contains `.claude-plugin/`. In [the walkthrough](#create-a-marketplace), that’s `my-marketplace/`, so the entry’s `source` is `"./plugins/my-first-plugin"`. The path doesn’t start inside `.claude-plugin/`, so don’t use `..` to leave it. A path with `..` and a path to a missing directory fail at different commands:

-   **A path with `..`**: `claude plugin validate` reports the entry as invalid. The message begins `Path contains "..": ./../plugins/my-first-plugin`.
-   **A path to a directory that doesn’t exist**: `claude plugin validate` passes. `claude plugin install` fails with `Source path does not exist: <path>`, and `<path>` is the absolute location Claude Code checked.

### Keep the entry name and the manifest name the same

A marketplace plugin has an entry `name` in `marketplace.json` and a `name` in its own `plugin.json`, called the manifest name. Each name appears in different places:

-   **Entry name**: the install id, `<entry-name>@<marketplace>`. It’s what people type to install, what `claude plugin list` shows, and the key Claude Code writes under [`enabledPlugins`](https://code.claude.com/docs/en/settings-reference#enabledplugins) in their settings file.
-   **Manifest name**: the prefix on the plugin’s skills, and the name `claude plugin details` takes.

When the two names differ and someone installs by the manifest name, Claude Code reports `Plugin "<manifest-name>" not found in marketplace "<marketplace>"`. Keep the two names the same. For more on how Claude Code uses the two names, see [Plugin loading reference](https://code.claude.com/docs/en/plugins/loading#find-where-a-plugin-came-from).

### Keep unused submodules out of the clone

When someone adds your marketplace, Claude Code clones the repository and fetches only the git submodules that hold plugin files. Requires Claude Code v2.1.295 or later. You decide which submodules Claude Code fetches by where you put each plugin:

-   **A plugin in a subdirectory**: Claude Code fetches the submodules inside the plugin’s directory and a submodule that contains it. Put a submodule your plugin needs inside the plugin’s directory, and keep one it doesn’t need outside
-   **A plugin at the marketplace root**: Claude Code fetches every submodule in the repository as soon as one of the plugin’s files refers to a path inside any of them. If your repository has a large submodule that only your build uses, move the plugin into a subdirectory

If a plugin at the root runs a file from a submodule, write the file’s path out in the plugin’s hook or server configuration, such as `${CLAUDE_PLUGIN_ROOT}/vendor/tool/run.sh`. Claude Code reads those paths to find out whether the plugin needs the submodules. It can’t see a path that a script builds while it runs. For the full rule, see [Git submodules in the marketplace repository](https://code.claude.com/docs/en/plugins/marketplace-reference#git-submodules-in-the-marketplace-repository).

## Choose a plugin source

Each plugin entry in `marketplace.json` has a `source` that tells Claude Code where to fetch that one plugin. Pick the source by where the plugin’s files are stored. The table lists the sources most marketplace owners use.

| Source | Use it when | Minimal `source` value |
| --- | --- | --- |
| Relative path | The plugin’s files are inside the marketplace directory itself | `"./plugins/my-first-plugin"` |
| `github` | The plugin is a GitHub repository of its own | `{ "source": "github", "repo": "your-org/my-first-plugin" }` |
| `git-subdir` | The plugin is a subdirectory of some other repository, such as a monorepo | `{ "source": "git-subdir", "url": "your-org/monorepo", "path": "tools/my-first-plugin" }` |

In a `git-subdir` source, `url` takes a git URL or an `owner/repo` GitHub shorthand. A plugin can also come from one of these source types:

-   `url`: a git repository by URL, on any host
-   `archive`: a zip file downloaded over HTTPS
-   `npm`: an npm package
-   `command`: a directory produced by running a command on the machine where the plugin is installed

For the fields of every source type, and for pinning a git-based source to a `ref` or `sha`, see [Plugin sources](https://code.claude.com/docs/en/plugins/marketplace-reference#plugin-sources).

## Validate and test

As you add plugins, run `claude plugin validate ./my-marketplace` in your shell after every edit, and install from the marketplace on your own machine before you share it. Validation and installation catch different problems.

### Problems that validation reports

`claude plugin validate` reads only files inside the marketplace directory. It reports:

-   JSON syntax errors, as `json: Invalid JSON syntax: <reason>`
-   Missing required fields, such as `owner: Invalid input`
-   A marketplace or plugin name that breaks the naming rules in the [marketplace reference](https://code.claude.com/docs/en/plugins/marketplace-reference#top-level-fields)
-   A relative `source` that contains `..`
-   Unknown fields at the top level or in a plugin entry, as warnings
-   Problems in the `plugin.json` of each relative-path plugin, as `plugins[N] plugin.json → <field>: <message>`

For every message `validate` can print, see [Validation messages](https://code.claude.com/docs/en/plugins/marketplace-reference#validation-messages). For its flags and exit codes, see [`plugin validate`](https://code.claude.com/docs/en/plugins/cli-reference#plugin-validate).

### Problems that surface when you add or install

Problems that `claude plugin validate` doesn’t report appear when you add the marketplace or install from it:

-   **When you add the marketplace**: the exact [official marketplace names](https://code.claude.com/docs/en/plugins/marketplace-reference#reserved-names), such as `claude-plugins-official`, pass validation. When you add a marketplace with one of those names, Claude Code refuses it with a message that starts `The name '<name>' is reserved for official Anthropic marketplaces`.
-   **When you install a plugin**:
    -   Claude Code first fetches a `github`, `git-subdir`, or other remote source when you install the plugin, so a wrong `repo` or `path` appears then.
    -   A relative `source` whose directory doesn’t exist also fails at install, with `Source path does not exist: <path>`.

### Test an edit to a plugin

In [the walkthrough](#create-a-marketplace), you added `my-marketplace` from a local directory with a relative-path `source`. With that setup, Claude Code reads the plugin’s files directly from `my-marketplace/plugins/`. Your edits take effect at the next session start or when you run `/reload-plugins` in a session, with no change to the plugin’s `version`. People who install from your hosted marketplace get a copy in the plugin cache instead. For how they receive a new version, see [Keep users up to date](https://code.claude.com/docs/en/plugins/host-marketplace#keep-users-up-to-date).

### Remove the marketplace to start over

To remove everything and start over, run `claude plugin marketplace remove my-marketplace` in your shell. The command removes the marketplace and uninstalls its plugins.

## Host your marketplace

Once you can install a plugin from the marketplace on your own machine, as in [Create a marketplace](#create-a-marketplace), push the marketplace directory to a git host. Before you push, give the marketplace a top-level `name` that other authors are unlikely to pick, because a user [can’t have two marketplaces with the same name](https://code.claude.com/docs/en/plugins/marketplace-reference#marketplace-file). Your teammates then run `claude plugin marketplace add <owner>/<repo>` in their shell for a GitHub repository, or the same command with the repository URL. They then install a plugin by name as in [the walkthrough](#create-a-marketplace). For private-repository access, updates, versioning, and renaming or removing entries, see [Host and maintain a marketplace](https://code.claude.com/docs/en/plugins/host-marketplace).

## Next steps

-   [Host and maintain a marketplace](https://code.claude.com/docs/en/plugins/host-marketplace): pick a host, keep users up to date, and rename or remove plugins safely
-   [Marketplace reference](https://code.claude.com/docs/en/plugins/marketplace-reference): `marketplace.json` fields and source types
-   [Manage plugins for your organization](https://code.claude.com/docs/en/plugins/org): require your marketplace and its plugins on every machine
-   [Suggest plugins by relevance](https://code.claude.com/docs/en/plugins/relevance): have Claude Code suggest a plugin from your marketplace when a session matches
