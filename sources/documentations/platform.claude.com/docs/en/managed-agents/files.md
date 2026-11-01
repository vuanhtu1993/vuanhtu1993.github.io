---
title: "Adding files"
source_url: "https://platform.claude.com/docs/en/managed-agents/files"
crawled_at: "2026-11-01T16:25:37.833Z"
---

Upload files and mount them in your sandbox for reading and processing.

You can provide files to your agent by uploading them through the Files API and mounting them in the session’s sandbox.

## Uploading files

First, upload a file using the [Files API](https://platform.claude.com/docs/en/build-with-claude/files):

## Mounting files in a session

Mount uploaded files into the sandbox by adding them to the `resources` array when creating a session:

With the preceding `mount_path`, the agent reads the file at `/mnt/session/uploads/data.csv` (see [File paths](#file-paths)).

A new `file_id` is created that references the instance of the file in the session. These copies do not count against your [storage limits](https://platform.claude.com/docs/en/build-with-claude/files).

## Multiple files

Mount multiple files by adding entries to the `resources` array:

A maximum of 500 files is supported for each session.

## Managing files on a running session

You can add or remove files from a session after creation using the session resources API. Each resource has an `id` returned when it is added (or listed), which you use for deletes.

List all resources on a session with `client.beta.sessions.resources.list()`. To remove a file, call `client.beta.sessions.resources.delete()` with the resource ID:

## Listing and downloading session files

Use the [Files API](https://platform.claude.com/docs/en/build-with-claude/files) to list files scoped to a session and download them. Files the agent writes to `/mnt/session/outputs/` appear in the list shortly after the agent finishes writing them, sometimes a few seconds after the session goes idle. If an output file you expect is missing, list again after a short delay; once it appears in the list, its upload is complete.

Filtering by `scope_id` requires the `managed-agents-2026-04-01` beta header, so the list examples call `client.beta.files.list()` and pass that header explicitly.

## Supported file types

The agent can work with any file type, including:

-   Source code (`.py`, `.js`, `.ts`, `.go`, `.rs`, and others)
-   Data files (`.csv`, `.json`, `.xml`, `.yaml`)
-   Documents (`.txt`, `.md`)
-   Archives (`.zip`, `.tar.gz`) - the agent can extract these using bash
-   Binary files - the agent can process these with appropriate tools

## File paths

-   The path you specify is rooted under the session’s uploads directory: a `mount_path` of `/data.csv` places the file at `/mnt/session/uploads/data.csv` in the sandbox.
-   If you omit `mount_path`, the file is placed at `/mnt/session/uploads/<file_id>`.
-   Parent directories are created automatically.
-   Paths should be absolute (starting with `/`).
-   Files the agent writes to `/mnt/session/outputs/` become available through the Files API, scoped to the session; see [Listing and downloading session files](#listing-and-downloading-session-files).
