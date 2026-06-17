---
title: "Contributing to documentation - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/contributing/documentation"
crawled_at: "2026-06-17T14:54:55.137Z"
---

We welcome contributions to LangChain documentation, including new features, [integrations](https://docs.langchain.com/oss/javascript/contributing/publish-langchain), and improvements to existing docs.

## Quick start - local development

To run a local preview of the documentation:

```
git clone https://github.com/langchain-ai/docs.git
```

```
cd docs
```

```
make install
```

```
make dev
```

This starts a development server with hot reload at `http://localhost:3000`. Edit files in `src/` and see changes immediately.

Prerequisites

Quick edits on GitHub

For typos or small changes, edit directly on GitHub without local setup:

1.  Click **Edit this page on GitHub** at the bottom of any page.
2.  Fork to your personal account.
3.  Make changes in GitHub’s web editor.
4.  Create a pull request.

1.  Edit files in `src/` following our [writing standards](#writing-standards).
2.  Run [quality checks](#run-quality-checks) before submitting.
3.  Create a pull request for review.

Create a sharable preview build (LangChain team only)

When you create or update a PR, a [preview branch/ID](https://github.com/langchain-ai/docs/actions/workflows/create-preview-branch.yml) is automatically generated. A comment will be left on the PR with the ID.

1.  Copy the preview branch’s ID from the comment
2.  In the [Mintlify dashboard](https://dashboard.mintlify.com/langchain-5e9cc07a/langchain-5e9cc07a?section=previews), click **Create preview deployment**
3.  Enter the preview branch’s ID and click **Create deployment**
4.  Select the preview and click **Visit** to view

To redeploy with latest changes, click **Redeploy** on the dashboard.

### Run quality checks

Before submitting changes, ensure your code passes formatting and linting checks:

```
# Check broken links
make broken-links

# Format code automatically
make format

# Check for linting issues
make lint

# Fix markdown issues
make lint_md_fix

# Run tests to ensure your changes don't break existing functionality
make test
```

For more details, see the [available commands](https://github.com/langchain-ai/docs?tab=readme-ov-file#available-commands) section in the `README`.

## Documentation types

All documentation falls under one of four categories:

### How-to guides

How-to guides are task-oriented instructions for users who know what they want to accomplish. Examples of how-to guides are on the [LangChain](https://docs.langchain.com/oss/javascript/langchain/overview) and [LangGraph](https://docs.langchain.com/oss/javascript/langgraph/overview) tabs.

### Conceptual guides

Conceptual guide cover core concepts abstractly, providing deep understanding.

### Reference

Reference documentation contains detailed, low-level information describing exactly what functionality exists and how to use it.

A good reference should:

-   Describe what exists (all parameters, options, return values)
-   Be comprehensive and structured for easy lookup
-   Serve as the authoritative source for technical details

### Tutorials

Tutorials are longer form step-by-step guides that builds upon itself and takes users through a specific practical activity to build understanding. Tutorials are typically found on the [Learn](https://docs.langchain.com/oss/javascript/learn) tab.

## Writing standards

### Mintlify components

Use [Mintlify components](https://mintlify.com/docs/text) to enhance readability:

-   Callouts
    
-   Structure
    
-   Code
    

-   `<Note>` for helpful supplementary information
-   `<Warning>` for important cautions and breaking changes
-   `<Tip>` for best practices and advice
-   `<Info>` for neutral contextual information
-   `<Check>` for success confirmations

-   `<Steps>` for an overview of sequential procedures. **Not** for long lists of steps or tutorials.
-   `<Tabs>` for platform-specific content.
-   `<AccordionGroup>` and `<Accordion>` for nice-to-have information that can be collapsed by default (e.g., full code examples).
-   `<CardGroup>` and `<Card>` for highlighting content.

-   `<CodeGroup>` for multiple language examples.
-   Always specify language tags on code blocks (e.g., ````python`, ````javascript`).
-   Titles for code blocks (e.g. `Success`, `Error Response`)

### Mermaid diagrams

When adding mermaid diagrams, use the LangChain brand color palette for node styling. Copy `classDef` lines from any existing diagram, or use the reference table in [`CLAUDE.md`](https://github.com/langchain-ai/docs/blob/main/CLAUDE.md#mermaid-diagram-styling).

| Role | Fill | Stroke | Text |
| --- | --- | --- | --- |
| process | `#E5F4FF` | `#006DDD` | `#030710` |
| trigger | `#F6FFDB` | `#6E8900` | `#2E3900` |
| decision | `#FDF3FF` | `#7E65AE` | `#504B5F` |
| output | `#EBD0F0` | `#885270` | `#441E33` |
| alert | `#F8E8E6` | `#B27D75` | `#634643` |
| neutral | `#F2FAFF` | `#40668D` | `#2F4B68` |

Do not use Tailwind defaults, Material Design colors, or other off-brand palettes.

### Page structure

Every documentation page must begin with YAML frontmatter:

```
---
title: "Clear, specific title"
sidebarTitle: "Short title for the sidebar (optional)"
---
```

### Co-locate Python and JavaScript/TypeScript content

All documentation must be written in both Python and JavaScript/TypeScript when possible. To do so, we use a custom in-line syntax to differentiate between sections that should appear in one or both languages:

```
:::python
Python-specific content. In real docs, the preceding backslash (before `python`) is omitted.
:::

:::js
JavaScript/TypeScript-specific content. In real docs, the preceding backslash (before `js`) is omitted.
:::

Content for both languages (not wrapped)
```

This will generate two outputs (one for each language) at `/oss/python/concepts/foo.mdx` and `/oss/javascript/concepts/foo.mdx`. Each outputted page will need to be added to the `/src/docs.json` file to be included in the navigation.

## Quality standards

### General guidelines

### Accessibility requirements

Ensure documentation is accessible to all users:

-   Structure content for easy scanning with headers and lists
-   Use specific, actionable link text instead of “click here”
-   Include descriptive alt text for all images and diagrams

### Cross-referencing

Use consistent cross-references to connect docs with API reference documentation. **From docs to API reference:** Use the `@[]` syntax to link to API reference pages:

```
See @[`ChatAnthropic`] for all configuration options.

The @[`bind_tools`][ChatAnthropic.bind_tools] method accepts...
```

The build pipeline transforms these into proper markdown links based on the current language scope (Python or JavaScript). For example, `@[ChatAnthropic]` becomes a link to the Python or JS API reference page depending on which version of the docs is being built, **but only if an entry exists in the `link_map.py` file!** See below for details.

How autolinks work

The `@[]` syntax is processed by [`handle_auto_links.py`](https://github.com/langchain-ai/docs/blob/main/pipeline/preprocessors/handle_auto_links.py). It looks up link keys in [`link_map.py`](https://github.com/langchain-ai/docs/blob/main/pipeline/preprocessors/link_map.py), which contains dictionary mappings for both Python and JavaScript scopes.**Supported formats:**

| Syntax | Result |
| --- | --- |
| `@[ChatAnthropic]` | Link with “ChatAnthropic” as the displayed text |
| `@[`ChatAnthropic`]` | Link with ``ChatAnthropic`` (code formatted) as text |
| `@[text][ChatAnthropic]` | Link with “text” as text and `ChatAnthropic` as the key in the link map |
| `\@[ChatAnthropic]` | Escaped: renders as literal `@[ChatAnthropic]` (no link – what’s being used on this page!) |

**Adding new links:**If a link isn’t found in the map, it will be left unchanged in the output. To add a new autolink:

1.  Open `pipeline/preprocessors/link_map.py`
2.  Add an entry to the appropriate scope (`python` or `js`) in `LINK_MAPS`
3.  The key is the link name used in `@[key]` or `@[text][key]`, the value is the path relative to the reference host

### Localization

Where a feature exists in both SDKs, document it for [Python and JavaScript/TypeScript together](#co-locate-python-and-javascript%2Ftypescript-content). If only one language is supported yet, ensure the feature and references to it are only visible for that language.

### In-code documentation

Examples must be correct, copy-pasteable where possible, and **tested** before you open a pull request. Mark non-runnable snippets clearly (for example, pseudocode or illustrative fragments).

## Get help

Our goal is to have the simplest developer setup possible. Should you experience any difficulty getting setup, please ask in the [community slack](https://www.langchain.com/join-community) or open a [forum post](https://forum.langchain.com/). Internal team members can reach out in the [#documentation](https://langchain.slack.com/archives/C04GWPE38LV) Slack channel.

---
