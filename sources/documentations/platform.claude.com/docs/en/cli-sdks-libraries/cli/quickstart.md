---
title: "CLI quickstart"
source_url: "https://platform.claude.com/docs/en/cli-sdks-libraries/cli/quickstart"
crawled_at: "2026-11-01T16:29:41.039Z"
---

Install the ant command-line tool, authenticate, and send your first request to the Claude API.

The `ant` CLI provides access to the Claude API from your terminal. Every API resource is exposed as a subcommand, with output formatting, response filtering, and YAML or JSON file input.

The ant CLI in action.

Compared to `curl`, `ant` builds request bodies from typed flags or piped YAML instead of hand-written JSON, and inlines file contents into string fields with an `@path` reference. It extracts response fields with a built-in `--transform` query, so you don’t need a separate tool such as `jq`, and it paginates list endpoints automatically.

## Installation

Check the installation:

## Authentication

`ant auth login` opens a browser-based OAuth flow against the Claude Console and stores the resulting credentials locally, so you can call the API without creating or managing an API key.

## Send your first request

With the binary installed and authenticated, call the [Messages API](https://platform.claude.com/docs/en/api/cli/messages/create):

The response is the full API object, pretty-printed because stdout is a terminal.

## Shell completion

The CLI ships completion scripts for bash, zsh, fish, and PowerShell. Generate and install one for your shell:

## Next steps

API keys, headless hosts, multiple workspaces, and named profiles

Command structure, output formats, GJSON transforms, and request bodies

Version control for API resources, scripting patterns, and use from Claude Code
