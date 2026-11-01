---
title: "Prompting Claude Fable 5"
source_url: "https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5"
crawled_at: "2026-11-01T16:31:03.962Z"
---

Behavioral differences and prompting patterns for Claude Fable 5 and Claude Mythos 5, covering effort, instruction following, long runs, memory, and scaffolding changes.

This guide covers the prompting and scaffolding patterns specific to Claude Fable 5 and Claude Mythos 5. For the model’s specifications, pricing, and availability, see [Claude Fable 5](https://platform.claude.com/docs/en/models/fable-5/overview). For techniques that apply across all current Claude models, see [Prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices).

Claude Fable 5 takes on problems that were previously too complex, long-running, or ambiguous for prior models, and is particularly effective at end-to-end work that takes a person hours, days, or weeks to complete. The teams seeing the best outcomes apply Claude Fable 5 to their hardest unsolved problems; testing it only on simpler workloads tends to undersell its capability range. It also performs reliably on more straightforward tasks.

Claude Fable 5 has several behavioral differences from Claude Opus 4.8 that might require prompt or scaffolding updates. Capability improvements at this level are also a good prompt to re-evaluate which instructions, tools, and guardrails are still needed. The following patterns cover the behaviors that most often require tuning.

## Capability improvements

Compared with Claude Opus 4.8, Claude Fable 5 shows improvement in:

-   **Long-horizon autonomy.** Claude Fable 5 sustains productive output over extended periods, completing multiday, goal-directed runs with strong instruction retention across long, complex tasks.
-   **First-shot correctness on complex, well-specified problems.** Early testers reported single-pass implementations of systems that previously took days of iteration.
-   **Vision.** Claude Fable 5 interprets dense technical images, web applications, and detailed screenshots with substantially higher accuracy, often while using fewer output tokens, and is trained to use bash and crop tools to handle flipped, blurry, or noisy images.
-   **Enterprise workflows.** Claude Fable 5 follows instructions, stays in scope, and produces professional-grade output on financial analysis, spreadsheets, slides, and documents.
-   **Code review and debugging.** Bug-finding recall (outside the cybersecurity domains the safety classifiers cover) is noticeably higher than Claude Opus 4.8, including search across code bases and repository history.
-   **Navigating ambiguity.** Claude Fable 5 performs well when given complex, multithreaded requests and asked to determine next steps.
-   **Delegation and collaboration.** Claude Fable 5 is significantly more dependable at dispatching and sustaining parallel subagents, and reliably manages ongoing communication with long-running subagents and peer agents.

Beyond these specific improvements, Claude Fable 5 is generally more capable than prior models on almost all tasks. Claude Fable 5 is not intended for offensive cybersecurity or biology and life sciences work; requests in those domains can return [`stop_reason: "refusal"`](https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback).

## Longer turns by default

Individual requests on hard tasks can run for many minutes at higher [effort](https://platform.claude.com/docs/en/build-with-claude/effort) settings, especially when the task requires gathering context, building, and self-verifying, and autonomous runs can extend for hours. This is one of the largest shifts teams encounter when adjusting to Claude Fable 5. Adjust client timeouts, streaming, and user-facing progress indicators before migrating, and consider restructuring harnesses to check on runs asynchronously, for example through scheduled jobs, rather than blocking. To keep Claude Fable 5 from overplanning when a task is ambiguous:

## Consider all effort levels

[Effort](https://platform.claude.com/docs/en/build-with-claude/effort) is the primary control for the trade-off between intelligence, latency, and cost on Claude Fable 5. Use `high` as the default for most tasks, with `xhigh` for the most capability-sensitive workloads and `medium` or `low` for routine work. Lower effort settings on Claude Fable 5 still perform well and often exceed `xhigh` performance on prior models. Reduce effort if a task completes but takes longer than necessary, or if you want a quicker, more interactive working style.

On routine work at higher effort, Claude Fable 5 can gather context and deliberate beyond what the task needs. At the same time, higher effort often produces excellent verification behavior, sophisticated reasoning, and the most rigorous output. To prevent unrequested tidying or refactoring at higher effort:

## Strong instruction following

Instruction-following is improved enough that you can steer most behaviors with a brief instruction rather than enumerating each behavior by name. For example, when un-steered, Claude Fable 5 can elaborate beyond what the task needs, especially at higher effort settings: surveying options it won’t pursue, explaining root causes at length, producing heavily structured PR descriptions, or writing comments that narrate what the next line does. A short brevity instruction is as effective as listing each pattern:

The same applies to checkpoint behavior in long-running workflows. To have Claude Fable 5 stop only where it genuinely needs you, there is no need to enumerate every case:

## Ground progress claims during long runs

On long autonomous runs, instruct Claude Fable 5 to audit progress against actual tool results. In Anthropic’s testing, this nearly eliminated fabricated status reports even on tasks designed to elicit them:

## State the boundaries

Claude Fable 5 can occasionally take unrequested actions (drafting an email when none was asked for, creating defensive git-branch backups). Define explicit constraints on what Claude Fable 5 should and should not do:

## Parallel subagents

Claude Fable 5 dispatches parallel subagents more readily than prior models. Use subagents frequently, provide explicit guidance about when delegation is appropriate, and prefer asynchronous communication between orchestrator and subagents over blocking until each subagent returns. Long-lived subagents that keep their context across subtasks save time and cost through cache reads and avoid bottlenecking on the slowest subagent.

## Construct a memory system

Claude Fable 5 performs particularly well when it can record lessons from previous runs and reference them. Provide a place to write notes, as simple as a Markdown file:

To bootstrap the memory system from existing history, have Claude Fable 5 review past sessions:

## Rare cases of early stopping

Deep into a long session, Claude Fable 5 can occasionally end a turn with a text-only statement of intent (“I’ll now run X”) without issuing the corresponding tool call, or pause to ask permission when it already has enough to proceed. A “continue” or “go ahead and do it end to end” suffices. To define when pausing is appropriate, pair this with the checkpoint instruction in [Strong instruction following](#strong-instruction-following). For autonomous pipelines, add a system reminder:

## Rare cases of context-budget concern

In very long sessions, Claude Fable 5 can occasionally suggest a new session, offer to summarize and hand off, or trim its own work. This is most often triggered when the harness shows a remaining-token countdown to the model. Avoid surfacing explicit context-budget counts where possible. If the harness must show them, a reassurance helps:

## Give the reason, not only the request

Claude Fable 5 tends to perform better when the prompt states the intent behind a request: context lets it connect the task to relevant information rather than inferring intent on its own. Provide context about why you’re asking, especially for long-running agents drawing on multiple workstreams:

## Readability when communicating with the user

In extended or agentic conversations (many tool calls, large working context), Claude Fable 5 can produce text that’s hard to follow: dense arrow-chain shorthand, deep implementation detail, references to thinking the user never saw, or overly technical phrasing. A communication-style addendum mitigates this:

## Create a send-to-user tool

When running long, asynchronous agents, give the agent a way to surface a message the user must see exactly as written, without ending its turn: a deliverable (a generated code snippet or a drafted message), a progress update with specific numbers, or a direct reply to a question the user asked mid-loop. The tool’s input is the message to display; when Claude calls it, render the input directly in your UI and return a simple acknowledgement as the tool result. Tool inputs are never summarized, so the content arrives intact.

Add this tool whenever your UX depends on delivering content or direct user interactions verbatim mid-task. For agents that only narrate routine progress, the model’s own summaries are typically adequate. Defining the tool is not sufficient on its own; without an instruction in the system prompt, Claude Fable 5 rarely calls it. Pair the tool with elicitation language such as:

Do not route narration or internal reasoning through `send_to_user`; over-calling it for non-user-facing content defeats the purpose.

## Recommended scaffolding changes

-   **Start at the top of your difficulty range.** Pick a task harder than what you’d assign to prior models, and have Claude Fable 5 scope it, ask clarifying questions, and carry it out.
-   **Make self-verification explicit in long-run prompts.** Separate, fresh-context verifier subagents tend to outperform self-critique. For long-running tasks, instruct: `Establish a method for checking your own work at an interval of [X] as you build. Run this every [X interval], verifying your work with subagents against the specification.`
-   **Refactor existing prompts and skills.** Skills developed for prior models are often too prescriptive for Claude Fable 5 and can degrade output quality. Review and consider removing older instructions if default performance is better. Claude Fable 5 also does a good job of updating skills as it works, based on what it learns from the current task.
-   **Don’t instruct Claude to reproduce its reasoning in the response.** Prompts, skills, or harness instructions that tell the model to echo, transcribe, or explain its internal reasoning as response text might trigger the [`reasoning_extraction` refusal category](https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback#refusal-response) on Claude Fable 5. Server-side fallback with `fallbacks: "default"` doesn’t retry requests declined with `reasoning_extraction`; that refusal is returned to you. Audit existing skills and system prompts for reflection or show-your-thinking instructions when migrating. If your application needs reasoning visibility, read the structured `thinking` blocks from [adaptive thinking](https://platform.claude.com/docs/en/build-with-claude/thinking) instead, and use a [send-to-user tool](#create-a-send-to-user-tool) to surface progress during long runs. You can still ask for a short explanation of the answer or a summary of the actions taken; see [Keep reasoning in thinking blocks](https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback#keep-reasoning-in-thinking-blocks).
-   **Create a send-to-user tool.** For long, asynchronous agents, a client-side tool delivers messages to the user verbatim without ending the turn. See [Create a send-to-user tool](#create-a-send-to-user-tool).
