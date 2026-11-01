---
title: "Extend agents with skills - Claude Code Docs"
source_url: "https://code.claude.com/docs/en/agent-sdk/skills"
crawled_at: "2026-11-01T16:44:49.030Z"
---

Agent Skills extend Claude with specialized capabilities that Claude invokes when relevant. Skills are packaged as `SKILL.md` files containing instructions, descriptions, and optional supporting resources. This page also covers [commands in Agent SDK sessions](#commands-in-agent-sdk-sessions). For more information about skills, including benefits, architecture, and authoring guidelines, see the [Agent Skills overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview).

## How skills work with the Agent SDK

When using the Claude Agent SDK, skills are:

-   **Defined as filesystem artifacts**: you create each skill as a `SKILL.md` file in its own directory, such as `.claude/skills/<name>/SKILL.md`
-   **Loaded from filesystem**: the SDK loads skills from the filesystem locations governed by `settingSources` (TypeScript) or `setting_sources` (Python)
-   **Automatically discovered**: once filesystem settings load, the SDK discovers skill metadata at startup from user and project directories, and loads the full content when Claude invokes the skill
-   **Model-invoked**: Claude autonomously chooses when to use them based on context
-   **User-invoked**: you dispatch a skill directly by sending `/<name>` in a prompt. See [Commands in Agent SDK sessions](#commands-in-agent-sdk-sessions)
-   **Scoped via the `skills` option**: discovered skills are enabled by default. Pass a list of skill names, `"all"`, or `[]` to control which skills Claude can invoke

Unlike subagents, which you can define in the [`agents` option](https://code.claude.com/docs/en/agent-sdk/subagents#programmatic-definition-recommended), you create skills as files on disk. The SDK doesn’t provide a programmatic API for registering them.

## Use skills with the Agent SDK

Set the `skills` option on `query()` to control which skills Claude can invoke in the session. When omitted, discovered skills are enabled and the Skill tool is available, matching CLI behavior. Pass `"all"` to let Claude invoke every discovered skill, a list of skill names to allow only those, or `[]` to let Claude invoke none. For example, to let Claude invoke only two named skills:

### Set up skills in a session

When you set `skills`, the SDK adds the Skill tool to `allowedTools` automatically. If you also pass an explicit `tools` list, include `"Skill"` in that list so Claude can invoke skills. Once configured, Claude automatically discovers skills from the filesystem and invokes them when relevant to the user’s request. The following example enables every discovered skill in a session and pre-approves the tools that skills commonly need. The example sets `cwd` to the process’s current working directory, so run it from inside a project that has a `.claude/skills/` directory in the current directory or any parent up to the repository root:

### Confirm skills loaded

Near the start of the stream, the SDK yields a system message with subtype `init`. Check its `skills` array to confirm your skills loaded before Claude starts working. The array includes the user-invocable skills that you have defined with a `description` or `when_to_use` frontmatter field, along with [bundled skills included with Claude Code](https://code.claude.com/docs/en/skills#bundled-skills). The array lists user-invocable skills only. A skill with [`user-invocable: false`](https://code.claude.com/docs/en/skills#control-who-invokes-a-skill) in its frontmatter loads and remains available to Claude, but doesn’t appear in the array. The array lists the same skills whether or not they’re in your `skills` list.

### Allow only specific skills

To let Claude invoke only specific skills, pass their names in the `skills` list:

-   **Your own skills**: the skill’s directory name
-   **Plugin skills**: `plugin:skill`
-   **Name clashes in `additionalDirectories` or `add_dirs`**: a skill in one of those directories gets a [prefixed name](https://code.claude.com/docs/en/skills#how-a-skill-gets-its-command-name) when its name clashes with an enterprise, personal, or project skill, or one in a directory added earlier. List it by that name. With a `verify` skill in `../api` and `../web`, added in that order, and no other `verify` skill, list them as `verify` and `web:verify`. Requires Claude Code v2.1.309 or later

The list takes exact skill names only. If an entry can’t work as an exact name, `query()` rejects the list before the session starts. See [Invalid skill name error](#invalid-skill-name-error) for the name rules and the error each SDK raises. The model doesn’t see unlisted skills and the Skill tool rejects them, while their files remain on disk and stay reachable through Read and Bash. Restricting the list doesn’t restrict [dispatch by name](#dispatch-commands-by-name). To let Claude invoke every discovered skill, pass `skills: "all"` rather than a wildcard.

## Commands in Agent SDK sessions

This section is the SDK’s command documentation. A command is anything you run by sending `/<name>` in a prompt. Entries on the command surface differ in what backs them:

-   **Built-in commands**: execute logic coded into the Claude Code process the SDK runs, for example `/compact`
-   **Bundled skills**: prompt artifacts included with Claude Code, for example `/code-review`
-   **Your skills**: prompt artifacts that you author, each a directory holding a `SKILL.md` file. A user-invocable skill’s name joins the surface automatically, so dispatching your own `/security-check` and running a built-in work the same way
-   **Custom command files**: an older artifact form with the same behavior, flat Markdown files in `.claude/commands/` whose filenames become command names. Skills are their recommended successor

By default, both you and Claude can invoke any skill. You can restrict either path through the skill’s [frontmatter](https://code.claude.com/docs/en/skills#control-who-invokes-a-skill). For definitions of command and skill, see the glossary’s [Command](https://code.claude.com/docs/en/glossary#command) and [Skill](https://code.claude.com/docs/en/glossary#skill) entries. See [Commands in Claude Code](https://code.claude.com/docs/en/commands) for every built-in and [Extend Claude with skills](https://code.claude.com/docs/en/skills) for the complete guide to both artifact forms.

### Discover available commands

You can dispatch commands that work without an interactive terminal through the SDK. The `system/init` message lists the ones available in your session in its `slash_commands` field. Commands that need an interactive terminal, such as `/theme` and `/terminal-setup`, don’t appear in the list. Access the field when your session starts:

The printed list mixes built-in commands, bundled skills, your user-invocable skills, and `.claude/commands/` files:

A skill with [`user-invocable: false`](https://code.claude.com/docs/en/skills#control-who-invokes-a-skill) in its frontmatter doesn’t appear in this list or in the `skills` array from [Confirm skills loaded](#confirm-skills-loaded). Sessions that configure [MCP servers](https://code.claude.com/docs/en/agent-sdk/mcp) can also expose [MCP prompts as commands](https://code.claude.com/docs/en/mcp#use-mcp-prompts-as-commands).

### Dispatch commands by name

Send a command by including it in your prompt string, the same way you send regular text. Dispatch doesn’t depend on the `skills` option. Sending `/<name>` runs a user-invocable skill even when your `skills` list omits it. Commands that act on conversation history, such as `/compact`, need prior messages to work with. A `/<name>` that matches neither a command in the session nor a built-in Claude Code command doesn’t fail the query. Claude Code sends the prompt to Claude as an ordinary message, with a note that the command didn’t run, so the query spends a model turn and returns Claude’s reply. Before v2.1.274, a `/<name>` that matched nothing returned `Unknown command: /<name>` as the result without a model turn. A `/<name>` that matches a built-in Claude Code command that isn’t available in the session, such as `/theme`, returns `/theme isn't available in this environment.` as the result without a model turn.

### Compact history with `/compact`

The `/compact` command reduces the size of your conversation history by summarizing older messages while preserving important context. Compaction needs an existing conversation with enough prior messages to summarize. This example has a conversation first, then compacts it and reads the `compact_boundary` system message that reports the result:

### Reset context with `/clear`

The `/clear` command resets the conversation to an empty context, so subsequent prompts start with no prior conversation history. The previous conversation remains on disk. You can return to that conversation by passing its session ID to the [`resume` option](https://code.claude.com/docs/en/agent-sdk/sessions#resume-by-id). `/clear` is useful in [streaming input mode](https://code.claude.com/docs/en/agent-sdk/streaming-vs-single-mode), where you send multiple prompts over a single connection. For one-shot `query()` calls, each call already starts with empty context, so sending `/clear` has no practical effect. Start a new `query()` instead.

## Create skills

Create each skill as a directory containing a `SKILL.md` file with YAML frontmatter and Markdown content. The `description` field determines when Claude invokes your skill. **Example directory structure**:

### Choose a discovery level

Save skills at either of the two most common [discovery levels](https://code.claude.com/docs/en/skills#where-skills-live):

-   **Project skills**: `.claude/skills/`, available only in the current project
-   **Personal skills**: `~/.claude/skills/`, available across all your projects

If you have existing custom command files in `.claude/commands/`, they keep working. A command file at `.claude/commands/deploy.md` creates `/deploy` and works the same way as a skill at `.claude/skills/deploy/SKILL.md` would. If a command file and a skill share a name, see [Resolve skills that share a name](https://code.claude.com/docs/en/skills#resolve-skills-that-share-a-name) for which one runs. The SDK loads `.claude/commands/` and `~/.claude/commands/` files from the same two scopes as skills. See [Extend Claude with skills](https://code.claude.com/docs/en/skills) for the complete guide to both artifact forms.

### Create and dispatch your first skill

To see the full flow, create `.claude/skills/security-check/SKILL.md`:

Once the file exists, the skill is available through the SDK. Claude invokes it when a request matches its description, and you can dispatch it directly:

A successful run ends with a `success` result whose text carries the scan findings. Against a small Express app with seeded issues, the result text begins:

The skill’s name also appears in the init message’s `slash_commands` array.

## Pre-approve tools for skills

Skills run with the session’s tools. The example below pre-approves `Read`, `Grep`, and `Glob` with `allowedTools` (`allowed_tools` in Python), so Claude can inspect files while running the [security-check skill](#create-and-dispatch-your-first-skill) without stopping for approval:

In the stream, the skill invocation appears as a Skill tool use, followed by Read calls on the project files. The run ends with a `success` result whose text carries the findings. The list pre-approves the named tools rather than restricting the others. For the full permission flow, including permission modes and the `canUseTool` callback, see [Permissions](https://code.claude.com/docs/en/agent-sdk/permissions).

## Troubleshooting

### Skills not found

**Check settingSources configuration**: the SDK discovers skills through the `user` and `project` setting sources. If you set `settingSources`/`setting_sources` explicitly and omit those sources, the SDK doesn’t load skills:

For which skill directories each source loads, see the [filesystem sources table](https://code.claude.com/docs/en/agent-sdk/claude-code-features#control-filesystem-settings-with-settingsources). For more details on `settingSources`/`setting_sources`, see the [TypeScript SDK reference](https://code.claude.com/docs/en/agent-sdk/typescript#settingsource) or [Python SDK reference](https://code.claude.com/docs/en/agent-sdk/python#settingsource). **Check working directory**: the SDK loads skills from `.claude/skills/` in the `cwd` option and in every parent directory up to the repository root. Ensure `cwd` points at or below the directory containing `.claude/skills/`, within the same repository:

See [Use skills with the Agent SDK](#use-skills-with-the-agent-sdk) for the complete pattern. **Verify filesystem location**:

### Skill not being used

**Check the `skills` option**: if you passed a `skills` list, confirm the skill’s name is included. When Claude tries to invoke an unlisted skill, the Skill tool returns `Skill <name> is not in this session's skills allowlist`. Add the name to your list, or dispatch the skill directly by sending `/<name>` in a prompt, which works without listing. **Check the description**: ensure it’s specific and includes relevant keywords. See [Agent Skills best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices#writing-effective-descriptions) for guidance on writing effective descriptions.

### Invalid skill name error

When a name in your `skills` list can’t work as an exact skill name, `query()` rejects the list before starting the Claude Code process. Names that trigger the rejection include:

-   An empty name
-   A name containing parentheses, commas, or control characters
-   A name padded with whitespace
-   A wildcard form such as a bare `*` or a `:*` suffix

Each SDK surfaces the rejection differently:

-   TypeScript
    
-   Python
    

The TypeScript SDK throws an `Error` stating the rule the entry broke. For example, `skills: ["docs:*"]` throws:

An empty name reports `Skill names must be non-empty strings.`Before TypeScript Agent SDK 0.3.221, the SDK didn’t run this check.

The Python SDK raises `ValueError` stating the rule the entry broke. For example, `skills=["docs:*"]` raises:

An empty name reports `Skill names must be non-empty strings`.Before Python Agent SDK 0.2.129, the SDK didn’t run this check.

### Additional troubleshooting

For general skills troubleshooting, such as YAML syntax errors and debugging, see the [Claude Code skills troubleshooting section](https://code.claude.com/docs/en/skills#troubleshooting).

## Next steps

The [Claude Code skills guide](https://code.claude.com/docs/en/skills) covers authoring in depth. Its guidance applies to SDK sessions. Start with these sections:

-   [Frontmatter reference](https://code.claude.com/docs/en/skills#frontmatter-reference): every supported field
-   [Pass arguments to skills](https://code.claude.com/docs/en/skills#pass-arguments-to-skills): `$ARGUMENTS`, `$0`, and `$1`. The [full substitution table](https://code.claude.com/docs/en/skills#available-string-substitutions) adds named arguments and the `${CLAUDE_*}` variables
-   [Inject dynamic context](https://code.claude.com/docs/en/skills#inject-dynamic-context): `!`command`` lines that run before Claude sees the skill content
-   [Choose where skills load](https://code.claude.com/docs/en/skills#where-skills-live): every skill location, plugin namespacing, and which skill runs when two share a name

-   [Commands in Claude Code](https://code.claude.com/docs/en/commands): the full command surface, including every built-in
-   [Agent Skills overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview): conceptual overview, benefits, and architecture
-   [Agent Skills best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices): authoring guidelines for effective skills
-   [Agent Skills cookbook](https://platform.claude.com/cookbook/skills-notebooks-01-skills-introduction): example skills and templates
-   [Subagents in the SDK](https://code.claude.com/docs/en/agent-sdk/subagents): similar filesystem-based agents with programmatic options
-   [SDK overview](https://code.claude.com/docs/en/agent-sdk/overview): general SDK concepts
-   [TypeScript SDK reference](https://code.claude.com/docs/en/agent-sdk/typescript): complete API documentation
-   [Python SDK reference](https://code.claude.com/docs/en/agent-sdk/python): complete API documentation
