---
title: "Communications kit - Claude Code Docs"
source_url: "https://code.claude.com/docs/en/communications-kit"
crawled_at: "2026-11-01T16:45:01.923Z"
---

Adoption

Launch announcements, drip-campaign messages, and FAQ responses for rolling Claude Code out to your engineering organization.

This page is for administrators and engineering leads rolling Claude Code out to a team. It provides copy-ready launch announcements, a tips-and-tricks drip campaign, and one-line FAQ responses for the questions you will be asked most.

## Launch communications

One announcement in two formats, plus two optional variants. Pick whichever fits your rollout and rewrite it from there.

### Before you send

Work through this checklist before the announcement goes out. Each item closes a gap that otherwise turns into a launch-day support thread.

| Item | Why it matters |
| --- | --- |
| `#claude-code` channel created and linked in the message | Gives questions one place to land |
| Install command tested on at least one machine in your environment | Catches proxy or firewall issues before everyone hits them at once |
| Security and data-handling link ready ([Data usage](https://code.claude.com/docs/en/data-usage) or your internal equivalent) | “Where does my code go?” will be the first reply |
| One concrete first task chosen, a real bug or file in your codebase | Generic examples don’t convert; “fix the flaky test in `auth_test.go`” does |
| A named owner for the channel for the first 48 hours | Unanswered launch-day questions kill momentum |
| A C-suite sponsor lined up to send or co-sign the announcement | Exec-sent launches consistently see higher first-week adoption than admin-sent ones |

### The announcement

Use this as your standard org-wide rollout message. It covers what Claude Code is, gives a two-minute install path, hands readers one concrete task to try, and answers “where does my code go?” before anyone has to ask.

-   Email
    
-   Slack or Teams
    

### Executive sponsor variant

Send this from your sponsoring executive, such as the CTO, CIO, or SVP Engineering, under their name and from their account. Launches that go out under an exec’s name consistently see higher open rates and faster first-week activation than the same message from an admin or tooling team. It signals a company priority rather than an optional experiment. This version is deliberately stripped to one ask: install it and run it on one real task. The exec’s job is to make the ask land; the standard announcement and `#claude-code` handle the how.

-   Email
    
-   Slack or Teams
    

### Pilot group variant

Use for a phased rollout. Send to the pilot cohort only.

### Champion recruitment DM

After launch, DM the two or three people who are most active in `#claude-code`.

## Tips and tricks campaign

Ready-to-paste Slack or Teams messages designed to drive feature activation after launch. Each follows the same pattern: a hook, the payoff, a “try it now” prompt, and a docs link. Drip them one or two a week in `#claude-code`, or pick the handful that match your team’s gaps. They stand alone with no required order.

### Get started

**Choosing the right model**

| Model | Best for |
| --- | --- |
| Fable | The hardest, longest-running tasks. Opt-in only: select it with `/model fable`. Cybersecurity or biology content triggers [automatic model fallback to Opus](https://code.claude.com/docs/en/model-config#automatic-model-fallback) |
| Opus | Large-scale refactors, complex debugging, architecture decisions, high-stakes changes. On Opus 5.5 and Opus 5, cybersecurity or biology content triggers [automatic model fallback or a refusal](https://code.claude.com/docs/en/model-config#automatic-model-fallback) |
| Sonnet | Everyday feature work, bug fixes, tests, documentation, code review. Recommended default. On Sonnet 5.5, cybersecurity or biology content triggers [automatic model fallback or a refusal](https://code.claude.com/docs/en/model-config#automatic-model-fallback) |
| Haiku | Quick questions, formatting, mechanical edits, rapid iteration |

**Quick wins to try first**

### Project memory

**`/init` and CLAUDE.md**

**@-references**

### Control and safety

**Permission modes**

**Checkpointing and `/rewind`**

### Connect your tools

**MCP connectors**

### Automate your workflows

**Skills**

**Hooks**

### Day-to-day development

**Screenshots and images**

**Git workflows**

**Plugins**

### Security and admin

**Security architecture**

**Best practices**

## Quick reference

### FAQ responses

One-line replies for the questions you will be asked most.

| Question | Response |
| --- | --- |
| ”Does it work in VS Code?” | Yes. There is a VS Code extension and a JetBrains plugin with the same features, embedded in your editor. [VS Code →](https://code.claude.com/docs/en/vs-code) |
| “Do I have to configure anything first?” | No. Install, then run `claude` in any repo. Run `/init` once and you’re set. [Quickstart →](https://code.claude.com/docs/en/quickstart) |
| “Where does my code go?” | The CLI runs in your terminal and sends context to Anthropic’s API for inference. On a Team or Enterprise plan, your code and prompts are not used to train models. [Data usage →](https://code.claude.com/docs/en/data-usage) |
| “Can it see my whole repo?” | It reads what you give it access to. File reads inside your working directory don’t prompt. [Permissions →](https://code.claude.com/docs/en/permissions) |
| “How is this different from Copilot?” | Copilot autocompletes lines. Claude Code is an agent that reads files, runs commands, and makes multi-file edits. [Overview →](https://code.claude.com/docs/en/overview) |
| “What should I try first?” | A bug you’ve been putting off because it’s tedious. “The test in \[file\] is flaky, figure out why.” [Quickstart →](https://code.claude.com/docs/en/quickstart) |

### Prompt templates

Share these starter prompts with engineers who have installed but aren’t sure what to ask. Each one is phrased the way it would be typed into a real session; replace the bracketed pieces with files from your own repo.

| Task | Prompt |
| --- | --- |
| Fix a bug | ”the tests in \[file\] are failing, figure out why and fix it” |
| Understand code | ”walk me through how \[module\] works, then tell me where the entry point is” |
| Safe refactor | ”refactor \[module\] to \[goal\], use plan mode so I can review first” |
| Write tests | ”write tests for \[file\] that cover the edge cases around \[scenario\]“ |
| Review before commit | ”look at my working diff and tell me what looks risky” |
| Open a PR | ”fix \[issue\], write a conventional commit, and open a PR with a summary” |
| Make a skill | ”make me a /ship skill that runs tests and lint before commit” |
| Debug a stack trace | ”here’s the stack trace, find the root cause, don’t just paper over it” |
