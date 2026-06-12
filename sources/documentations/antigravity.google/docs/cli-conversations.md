---
title: "Google Antigravity Documentation"
source_url: "https://antigravity.google/docs/cli-conversations"
crawled_at: "2026-06-12T03:41:59.028Z"
---

-   side\_navigation
-   Antigravity CLI
\>-   Conversations

## Managing conversations

Resume prior development threads, scope active histories to local workspaces, and fork conversations to experiment with alternate architectures.

## Workspace scoping

To maintain context hygiene, Antigravity CLI scopes conversation histories directly to your current working directory. When you launch `agy` from a specific directory, the agent only displays and resume sessions associated with that specific local repository or subdirectory.

This prevents context pollution, ensuring that the agent's semantic memory and token limits remain focused solely on the relevant codebase.

## Resuming sessions

You can return to a prior conversation to continue an implementation or refine an existing solution.

### Resuming via the TUI session picker

To search and load previous conversations within your active terminal screen:

1.  Type `/resume` in the prompt box and press `Enter`.
2.  The interactive Conversation Picker overlay opens.
3.  Start typing keyword terms to filter conversations by description or ID.
4.  Use `↑`/`↓` to navigate the list, and `←`/`→` to page through older records.
5.  Press `Enter` to resume the selected conversation. Press `Esc` to cancel and return to the prompt.

               `   CLI    Antigravity   (tab to cycle)    Conversations   Type to search... > implement-auth-pipeline                                      4 steps   3h ago   refactor-db-connection-pool                                  7 steps   5h ago   add-unit-tests-for-parser                                    2 steps   1d ago   fix-socket-connection-timeout-error                         14 steps   2d ago   update-project-dependencies                                  5 steps   3d ago   optimize-image-compression-algorithm                         9 steps   4d ago   draft-release-notes-v2.1.0                                   3 steps   May 23   clean-up-obsolete-cache-files                                6 steps   May 22   integrate-payment-gateway-sdk                               19 steps   May 20   fix-layout-alignment-in-navbar                              8 steps   May 19   [1-10 of 75 items]  Keyboard: ↑/↓ Navigate  ←/→ Page  enter Select  f2 Rename  tab Switch  esc Done`
        

### Importing conversations from Antigravity 2.0

If you are utilizing the public version of Antigravity CLI, you can import and resume active threads initiated within the Antigravity 2.0 desktop visual editor:

1.  Type `/resume` in the prompt panel and press `Enter` to open the picker.
2.  Press `Tab` to cycle between the **CLI** tab (local TUI conversations) and the **Antigravity** tab (Antigravity 2.0 desktop conversations).
3.  Highlight your target desktop conversation using `↑`/`↓` and press `Enter`.
4.  The TUI displays a confirmation prompt. Press `Enter` (or `y`) to confirm the import.
5.  The CLI duplicates the desktop conversation history, context, and trajectories into your terminal session, allowing you to continue the workflow seamlessly.

               `   CLI    Antigravity   (tab to cycle)    Conversations   Type to search...   a1b2c3d4-e5f6-7890-abcd-ef1234567890                       loading…   May 23   f9e8d7c6-b5a4-3210-fedc-ba9876543210                       loading…   May 16 > Design New Analytics Dashboard Layout [Import this? (y/n)] 12 steps   Apr 30   Implement Realtime Graph Plotter                           15 steps   Apr 30   fix-visual-flashes-on-load                                  2 steps   Apr 30   add-collapsible-menu-sidebar                                4 steps   Apr 29   refactor-utility-helper-methods                             6 steps   Apr 28   Verify Webpack Configuration Output                         5 steps   Apr 28   [1-10 of 13 items]  Keyboard: ↑/↓ Navigate  enter Select  tab Switch Tab  esc Go back / Clear search`
        

### Quick resume via the command line

To instantly resume the single most recent session in your active workspace without entering the picker, launch the executable with the `--continue` flag:

            `agy --continue`
        

To load a specific session directly from your shell, pass the target UUID:

            `agy --conversation 9a8b7c6d-5e4f-3a2b-1c0d-ef1234567890`
        

## Branching with \\\`/fork\\\`

When engineering a complex feature, you may want to explore multiple design alternatives without losing your progress. The `/fork` command enables safe, parallel experimentation.

            `/fork`
        

_(Alias: `/branch`)_

The `/fork` command clones your entire conversation history up to the current turn into a new, independent session.

### Forking workflow

1.  Type `/fork` inside the prompt panel and press `Enter`.
2.  The CLI allocates a new unique session ID and duplicates your existing workspace state and agent thread.
3.  Your active terminal switches immediately to the new branch.
4.  If the experiment fails, run `/resume` to restore your original, stable conversation branch.

lightbulb

**Branching Filesystems**: Forking clones the _conversation thread_, not your local git checkout. To fully isolate files during parallel forks, use git branches or stash local changes before testing contrasting approaches.

## Next steps

Explore how the agent handles complex, asynchronous operations and parallel tasks:

-   **[Background Tasks & Subagents](https://antigravity.google/docs/cli-subagents)**: Monitor subagents and handle fast-path approvals.
-   **[Settings, Rendering & Keybindings](https://antigravity.google/docs/cli-settings)**: Configure rendering buffers and override JSON preferences.
-   **[Permissions & Sandbox](https://antigravity.google/docs/cli-sandbox)**: Manage security profiles and system command lists.
