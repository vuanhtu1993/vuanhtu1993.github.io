---
title: "CLI: create-next-app"
source_url: "https://nextjs.org/docs/app/api-reference/cli/create-next-app"
crawled_at: "2026-06-25T07:19:08.584Z"
---

Last updated

March 3, 2026

The `create-next-app` CLI allow you to create a new Next.js application using the default template or an [example](https://github.com/vercel/next.js/tree/canary/examples) from a public GitHub repository. It is the easiest way to get started with Next.js.

Basic usage:

## Reference[](#reference)

The following options are available:

| Options | Description |
| --- | --- |
| `-h` or `--help` | Show all available options |
| `-v` or `--version` | Output the version number |
| `--no-*` | Negate default options. E.g. `--no-ts` |
| `--ts` or `--typescript` | Initialize as a TypeScript project (default) |
| `--js` or `--javascript` | Initialize as a JavaScript project |
| `--tailwind` | Initialize with Tailwind CSS config (default) |
| `--react-compiler` | Initialize with React Compiler enabled |
| `--eslint` | Initialize with ESLint config |
| `--biome` | Initialize with Biome config |
| `--no-linter` | Skip linter configuration |
| `--app` | Initialize as an App Router project |
| `--api` | Initialize a project with only route handlers |
| `--src-dir` | Initialize inside a `src/` directory |
| `--turbopack` | Force enable Turbopack in generated package.json (enabled by default) |
| `--webpack` | Force enable Webpack in generated package.json |
| `--import-alias <alias-to-configure>` | Specify import alias to use (default "@/\*") |
| `--empty` | Initialize an empty project |
| `--use-npm` | Explicitly tell the CLI to bootstrap the application using npm |
| `--use-pnpm` | Explicitly tell the CLI to bootstrap the application using pnpm |
| `--use-yarn` | Explicitly tell the CLI to bootstrap the application using Yarn |
| `--use-bun` | Explicitly tell the CLI to bootstrap the application using Bun |
| `-e` or `--example [name] [github-url]` | An example to bootstrap the app with |
| `--example-path <path-to-example>` | Specify the path to the example separately |
| `--reset-preferences` | Explicitly tell the CLI to reset any stored preferences |
| `--skip-install` | Explicitly tell the CLI to skip installing packages |
| `--disable-git` | Explicitly tell the CLI to disable git initialization |
| `--agents-md` | Include `AGENTS.md` and `CLAUDE.md` to guide coding agents (default) |
| `--yes` | Use previous preferences or defaults for all options |

## Examples[](#examples)

### With the default template[](#with-the-default-template)

To create a new app using the default template, run the following command in your terminal:

On installation, you'll see the following prompts:

If you choose to `customize settings`, you'll see the following prompts:

After the prompts, `create-next-app` will create a folder with your project name and install the required dependencies.

### Linter Options[](#linter-options)

**ESLint**: The traditional and most popular JavaScript linter. Includes Next.js-specific rules from `@next/eslint-plugin-next`.

**Biome**: A fast, modern linter and formatter that combines the functionality of ESLint and Prettier. Includes built-in Next.js and React domain support for optimal performance.

**None**: Skip linter configuration entirely. You can always add a linter later.

Once you've answered the prompts, a new project will be created with your chosen configuration.

### With an official Next.js example[](#with-an-official-nextjs-example)

To create a new app using an official Next.js example, use the `--example` flag. For example:

You can view a list of all available examples along with setup instructions in the [Next.js repository](https://github.com/vercel/next.js/tree/canary/examples).

### With any public GitHub example[](#with-any-public-github-example)

To create a new app using any public GitHub example, use the `--example` option with the GitHub repo's URL. For example:
