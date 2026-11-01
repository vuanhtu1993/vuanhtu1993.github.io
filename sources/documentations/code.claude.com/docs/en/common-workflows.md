---
title: "Common workflows - Claude Code Docs"
source_url: "https://code.claude.com/docs/en/common-workflows"
crawled_at: "2026-11-01T16:35:57.231Z"
---

This page collects short recipes for everyday development. For higher-level guidance on prompting and context management, see [Best practices](https://code.claude.com/docs/en/best-practices). This page covers:

-   [Prompt recipes](#prompt-recipes) for exploring code, fixing bugs, refactoring, testing, PRs, and documentation
-   [Resume previous conversations](#resume-previous-conversations) so a task can span multiple sittings
-   [Run parallel sessions with worktrees](#run-parallel-sessions-with-worktrees) so concurrent edits don’t collide
-   [Plan before editing](#plan-before-editing) to review changes before they touch disk
-   [Delegate research to subagents](#delegate-research-to-subagents) to keep your main context clean
-   [Pipe Claude into scripts](#pipe-claude-into-scripts) for CI and batch processing

## Prompt recipes

These are prompt patterns for everyday tasks like exploring unfamiliar code, debugging, refactoring, writing tests, and creating PRs. Each works in any Claude Code surface; adapt the wording to your project.

### Understand new codebases

For configuring Claude Code in a monorepo or large codebase, see [Monorepos and large repos](https://code.claude.com/docs/en/large-codebases).

#### Get a quick codebase overview

Suppose you’ve just joined a new project and need to understand its structure quickly.

1

2

3

4

#### Find relevant code

Suppose you need to locate code related to a specific feature or functionality.

1

2

3

---

### Fix bugs efficiently

Suppose you’ve encountered an error message and need to find and fix its source.

1

2

3

---

### Refactor code

Suppose you need to update old code to use modern patterns and practices. For porting an entire codebase to a new language, see [how Anthropic runs large-scale code migrations with Claude Code](https://claude.com/blog/ai-code-migration) on the blog.

1

2

3

4

---

### Work with tests

Suppose you need to add tests for uncovered code.

1

2

3

4

Claude can generate tests that follow your project’s existing patterns and conventions. When asking for tests, be specific about what behavior you want to verify. Claude examines your existing test files to match the style, frameworks, and assertion patterns already in use. To improve coverage, ask Claude to identify edge cases you might have missed. Claude can analyze your code paths and suggest tests for error conditions, boundary values, and unexpected inputs that are often overlooked.

---

### Create pull requests

You can create pull requests by asking Claude directly (“create a pr for my changes”), or guide Claude through it step-by-step:

1

2

3

To find the session later, run `claude --from-pr 1234` with your own PR number, which opens the session picker filtered to sessions linked to that PR, or paste the PR URL into the [`/resume` picker](https://code.claude.com/docs/en/sessions#use-the-session-picker) search. Claude Code links the session to the PR when Claude creates it with `gh pr create` or `glab mr create`, and when Claude [works on an existing PR](https://code.claude.com/docs/en/agent-view#pull-request-status).

### Handle documentation

Suppose you need to add or update documentation for your code.

1

2

3

4

---

### Work in notes and non-code folders

Claude Code works in any directory. Run it inside a notes vault, a documentation folder, or any collection of markdown files to search, edit, and reorganize content the same way you would code. The `.claude/` directory and `CLAUDE.md` sit alongside other tools’ config directories without conflict. Claude reads files fresh on each tool call, so it sees edits you make in another application the next time it reads that file.

---

### Work with images

Suppose you need to work with images in your codebase, and you want Claude’s help analyzing image content.

1

2

3

4

---

### Reference files and directories

Use @ to quickly include files or directories without waiting for Claude to read them.

1

2

3

To stop `@` references from including file contents and directory listings, set [`CLAUDE_CODE_DISABLE_FILE_MENTIONS`](https://code.claude.com/docs/en/env-vars#variables) to `1` in your shell or in the [`env` block](https://code.claude.com/docs/en/env-vars#set-variables-in-settings-files) of user settings or [managed settings](https://code.claude.com/docs/en/managed-settings). Claude then receives the paths you referenced with a note to read them using its file tools. The variable requires Claude Code v2.1.299 or later, and Claude Code ignores it in project and local settings. Your [`PreToolUse` hooks](https://code.claude.com/docs/en/hooks#pretooluse) don’t run when Claude Code includes a file you reference with `@`, because it makes no tool call. If you rely on those hooks to control what Claude reads, block specific paths or stop `@` references from including files:

-   **Block specific paths**: add a [`Read` deny rule](https://code.claude.com/docs/en/permissions#read-and-edit) for them. Claude Code doesn’t include a file that the rule matches.
-   **Stop `@` references from including files**: set `CLAUDE_CODE_DISABLE_FILE_MENTIONS=1`, which stops `@` file and directory references in your messages from including content, even for paths your hooks don’t check. Your matching hooks then run before Claude opens a referenced path with a tool such as `Read`.

---

### Run Claude on a schedule

Suppose you want Claude to handle a task automatically on a recurring basis, like reviewing open PRs every morning, auditing dependencies weekly, or checking for CI failures overnight. Pick a scheduling option based on where you want the task to run:

| Option | Where it runs | Best for |
| --- | --- | --- |
| [Cloud scheduled tasks](https://code.claude.com/docs/en/routines) | Cloud, Anthropic-managed by default | Tasks that should run even when your computer is off. Can also trigger on API calls or GitHub events in addition to a schedule. Configure at [claude.ai/code/routines](https://claude.ai/code/routines). |
| [Desktop scheduled tasks](https://code.claude.com/docs/en/desktop-scheduled-tasks) | Your machine, via the desktop app | Tasks that need direct access to local files, tools, or uncommitted changes. |
| [GitHub Actions](https://code.claude.com/docs/en/github-actions) | Your CI pipeline | Tasks tied to repo events like opened PRs, or cron schedules that should live alongside your workflow config. |
| [`/loop`](https://code.claude.com/docs/en/scheduled-tasks) | The current CLI session | Quick polling while a session is open. `--resume` and `--continue` restore unexpired fixed-interval loops. |

---

### Ask Claude about its capabilities

Claude can answer questions about its own features and limitations. It looks up the answers in the current Claude Code documentation, so they aren’t limited to the version you’re running.

#### Example questions

---

## Resume previous conversations

When a task spans multiple sittings, pick up where you left off instead of re-explaining context. Claude Code saves every conversation locally.

This resumes the most recent session in the current directory; if there isn’t one yet, it prints `No conversation found to continue` and exits. Use `claude --resume` to choose from a list, or `/resume` from inside a running session. See [Manage sessions](https://code.claude.com/docs/en/sessions) for naming, branching, and the full picker reference.

## Run parallel sessions with worktrees

Work on a feature in one terminal while Claude fixes a bug in another, without the edits colliding. Each [git worktree](https://git-scm.com/docs/git-worktree) is a separate checkout on its own branch, created from an existing commit, so the repository needs at least one commit first.

Run the same command with a different name in a second terminal to start an isolated parallel session. In a repository with no commits, the command fails with `Failed to resolve base branch "HEAD": git rev-parse failed`. See [Worktrees](https://code.claude.com/docs/en/worktrees) for cleanup, `.worktreeinclude`, and non-git VCS support. To monitor parallel sessions from one screen instead of separate terminals, see [background agents](https://code.claude.com/docs/en/agent-view).

## Plan before editing

For changes you want to review before they touch disk, switch to plan mode. Claude reads files and proposes a plan but makes no edits until you approve. The status bar shows `⏸ plan mode on` while plan mode is active.

You can also press `Shift+Tab` mid-session until the status bar shows `⏸ plan mode on`. See [Plan mode](https://code.claude.com/docs/en/permission-modes#analyze-before-you-edit-with-plan-mode) for the approval flow and editing the plan in your text editor.

## Delegate research to subagents

Exploring a large codebase fills your context with file reads. Delegate the exploration so only the findings come back.

The subagent reads files in its own context window and reports a summary. See [Subagents](https://code.claude.com/docs/en/sub-agents) for defining custom agents with their own tools and prompts.

## Pipe Claude into scripts

Run Claude non-interactively for CI, pre-commit hooks, or batch processing. Stdin and stdout work like any Unix tool.

See [Non-interactive mode](https://code.claude.com/docs/en/headless) for output formats, permission flags, and fan-out patterns.

## Next steps
