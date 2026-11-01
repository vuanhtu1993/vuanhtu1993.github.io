---
title: "Rewind file changes with checkpointing - Claude Code Docs"
source_url: "https://code.claude.com/docs/en/agent-sdk/file-checkpointing"
crawled_at: "2026-11-01T16:45:49.988Z"
---

File checkpointing tracks file modifications made through the [Write](https://code.claude.com/docs/en/tools-reference#write-tool-behavior), [Edit](https://code.claude.com/docs/en/tools-reference#edit-tool-behavior), and [NotebookEdit](https://code.claude.com/docs/en/tools-reference#notebookedit-tool-behavior) tools during an agent session, allowing you to rewind files to any previous state. To watch a rewind restore a file, jump to the [interactive example](#try-it-out).

## How checkpointing works

When you enable file checkpointing, the SDK creates backups of files before modifying them through the Write, Edit, or NotebookEdit tools. User messages in the response stream include a checkpoint UUID that you can use as a restore point.

When you rewind to a checkpoint, Claude Code deletes the files it created and restores the files it modified to their content at that point. Claude Code skips a tracked path that is a symlink, hard link, or other non-regular file. It also skips a tracked file whose parent directory no longer resolves to its checkpoint-time location, or whose backup it can’t read safely. [`RewindFilesResult`](https://code.claude.com/docs/en/agent-sdk/typescript#rewindfilesresult) counts every skipped path in its `skippedLinks` field. Skipping requires Claude Code v2.1.216 or later; before v2.1.216, a rewind wrote and deleted through links at tracked paths.

## Implement checkpointing

To use file checkpointing, enable it in your options, capture checkpoint UUIDs from the response stream, then call `rewindFiles()` (TypeScript) or `rewind_files()` (Python) when you need to restore. The examples in this section use the prompt “Refactor the authentication module”. Run them in a project that contains an authentication module, or change the prompt to name files that exist in your project, so you can watch files change and see the rewind restore them. This example enables checkpointing, captures the checkpoint UUID and session ID from the response stream, then resumes the session later to rewind files. The example’s numbered comments match the steps that follow.

1

Enable checkpointing

Configure your SDK options to enable checkpointing and receive checkpoint UUIDs:

| Option | Python | TypeScript | Description |
| --- | --- | --- | --- |
| Enable checkpointing | `enable_file_checkpointing=True` | `enableFileCheckpointing: true` | Tracks file changes for rewinding |
| Receive checkpoint UUIDs | `extra_args={"replay-user-messages": None}` | `extraArgs: { 'replay-user-messages': null }` | Required to get user message UUIDs in the stream |

The lead example under [Implement checkpointing](#implement-checkpointing) also sets the permission mode to `acceptEdits`, which approves the agent’s file edits without a prompt. For more information, see [Permission modes](https://code.claude.com/docs/en/agent-sdk/permissions#permission-modes).

2

3

## Common patterns

These patterns show different ways to capture and use checkpoint UUIDs depending on your use case.

### Checkpoint before risky operations

This pattern keeps only the most recent checkpoint UUID, updating it before each agent turn. If something goes wrong during processing, you can immediately rewind to the last safe state and break out of the loop. Before running this example, replace `your_revert_condition` (Python) or `yourRevertCondition` (TypeScript) with your own check, such as error detection or a validation failure; the placeholder is not defined in the example.

### Multiple restore points

If Claude makes changes across multiple turns, you might want to rewind to a specific point rather than all the way back. For example, if Claude refactors a file in turn one and adds tests in turn two, you might want to keep the refactor but undo the tests. This pattern stores all checkpoint UUIDs in an array with metadata. After the session completes, you can rewind to any previous checkpoint:

## Try it out

This complete example creates a small utility file, has the agent add documentation comments, shows you the changes, then asks if you want to rewind. Before you begin, make sure you have the [Claude Agent SDK installed](https://code.claude.com/docs/en/agent-sdk/quickstart).

1

2

3

## Limitations

File checkpointing has the following limitations:

| Limitation | Description |
| --- | --- |
| Bash command changes | Rewinding doesn’t undo changes a Bash command made, except in files the main conversation had already edited with a tool such as Write or Edit |
| Subagent edits | Edits a [subagent](https://code.claude.com/docs/en/agent-sdk/subagents) applies aren’t tracked, except a skill with `context: fork` running in the foreground. A rewind reverts them only in files the main conversation had already edited; use git to revert the rest |
| Same session | Checkpoints are tied to the session that created them |
| File content only | Creating, moving, or deleting directories is not undone by rewinding |
| Local files | Remote or network files are not tracked |

## Troubleshooting

### Checkpointing options not recognized

If `enableFileCheckpointing` or `rewindFiles()` isn’t available, you may be on an older SDK version. **Solution**: Update to the latest SDK version:

-   **Python**: `pip install --upgrade claude-agent-sdk`
-   **TypeScript**: `npm install @anthropic-ai/claude-agent-sdk@latest`

### User messages don’t have UUIDs

If `message.uuid` is `undefined` or missing, you’re not receiving checkpoint UUIDs. **Cause**: The `replay-user-messages` option isn’t set. **Solution**: Add `extra_args={"replay-user-messages": None}` (Python) or `extraArgs: { 'replay-user-messages': null }` (TypeScript) to your options.

### ”No file checkpoint found for this message” error

This error occurs when the checkpoint data doesn’t exist for the specified user message UUID. **Common causes**:

-   File checkpointing was not enabled on the original session (`enable_file_checkpointing` or `enableFileCheckpointing` was not set to `true`)
-   The session wasn’t properly completed before attempting to resume and rewind

**Solution**: Ensure `enable_file_checkpointing=True` (Python) or `enableFileCheckpointing: true` (TypeScript) was set on the original session, then use the pattern shown in the examples: capture the first user message UUID, complete the session fully, then resume with an empty prompt and call `rewindFiles()` once.

### ”File rewinding is not enabled” error

This error occurs when you attempt a non-interactive rewind without checkpointing enabled: running bare `claude -p` with `--rewind-files`, or running an SDK session, including a resumed one, whose options don’t enable checkpointing. The SDK sets the `CLAUDE_CODE_ENABLE_SDK_FILE_CHECKPOINTING` environment variable internally only when `enable_file_checkpointing` (Python) or `enableFileCheckpointing` (TypeScript) is enabled on the session performing the rewind; the bare CLI never sets it. **Solution**: For the bare CLI, set the environment variable when running the command:

For the SDK, set `enable_file_checkpointing=True` (Python) or `enableFileCheckpointing: true` (TypeScript) on the resumed session, as the examples on this page do.

### ”ProcessTransport is not ready for writing” error

This error occurs when you call `rewindFiles()` or `rewind_files()` after you’ve finished iterating through the response. The connection to the CLI process closes when the loop completes. **Solution**: Resume the session with an empty prompt, then call rewind on the new query. The lead example under [Implement checkpointing](#implement-checkpointing) shows the resume-and-rewind call in both languages, at the comment marked Step 3.

## Next steps

-   **[Sessions](https://code.claude.com/docs/en/agent-sdk/sessions)**: learn how to resume sessions, which is required for rewinding after the stream completes. Covers session IDs, resuming conversations, and session forking.
-   **[Permissions](https://code.claude.com/docs/en/agent-sdk/permissions)**: configure which tools Claude can use and how file modifications are approved. Useful if you want more control over when edits happen.
-   **[TypeScript SDK reference](https://code.claude.com/docs/en/agent-sdk/typescript)**: complete API reference including all options for `query()` and the `rewindFiles()` method.
-   **[Python SDK reference](https://code.claude.com/docs/en/agent-sdk/python)**: complete API reference including all options for `ClaudeAgentOptions` and the `rewind_files()` method.
