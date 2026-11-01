---
title: "Prompting Claude Fable 5.1"
source_url: "https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-1"
crawled_at: "2026-11-01T16:30:58.821Z"
---

Behavioral differences and prompting patterns for Claude Fable 5.1 and Claude Mythos 5.1, covering effort, progress updates, tool-call batching, conversation history, writing style, formatting, task completion, compaction summaries, scope and test coverage, search triggering, safeguard false positives, file edits, long outputs, subagents, and vision.

For the model’s capabilities, API changes, pricing, and availability, see [What’s new in Claude Fable 5.1](https://platform.claude.com/docs/en/models/fable-5-1/whats-new-fable-5-1). For techniques that apply across Claude models, see [Prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices).

Your existing Claude Fable 5 prompts should perform well on Claude Fable 5.1 without changes, but a handful of behavioral differences are worth knowing about. Start with the section that matches what you observe:

-   Unsure which effort level to run, or latency and cost are higher than the task warrants: [Consider all effort levels](#consider-all-effort-levels)
-   Little or no text between tool calls: [Ask for user-facing progress updates](#ask-for-user-facing-progress-updates)
-   One tool call for each turn in agent loops: [Batch independent tool calls in agent loops](#batch-independent-tool-calls-in-agent-loops)
-   Requests fail with `bound to a different conversation`, or your harness edits earlier turns between requests: [Keep the conversation history append-only](#keep-the-conversation-history-append-only)
-   Prose runs long and dense: [Writing density](#writing-density)
-   Chat replies carry less structure than the content needs: [Formatting in chat](#formatting-in-chat)
-   Summaries reproduce source wording without marking it as a quotation: [Quoting retrieved sources](#quoting-retrieved-sources)
-   Turn ends before the work is done, or the model asks permission for work you already requested: [Finish the whole task](#finish-the-whole-task)
-   Client-side compaction summaries drop constraints, decisions, or exact details: [Tell the model what to preserve in compaction summaries](#tell-the-model-what-to-preserve-in-compaction-summaries)
-   Unrequested fixes or extensions, or more committed test files than the task called for: [Keep changes and tests to what the task asks for](#keep-changes-and-tests-to-what-the-task-asks-for)
-   Answers from memory instead of searching at low effort: [Search triggering at low effort](#search-triggering-at-low-effort)
-   Benign coding requests return `stop_reason: "refusal"`: [Reduce safeguard false positives](#reduce-safeguard-false-positives)
-   Whole files rewritten for small changes: [Prefer targeted edits over whole-file rewrites](#prefer-targeted-edits-over-whole-file-rewrites)
-   Long deliverables at `xhigh` or `max` effort take a long time or hit `max_tokens`: [Leave room for long outputs at xhigh and max effort](#leave-room-for-long-outputs-at-xhigh-and-max-effort)
-   Lead agent idles while subagents run: [Let the lead agent keep working while subagents run](#let-the-lead-agent-keep-working-while-subagents-run)
-   Answers about charts and dense images miss detail: [Give vision work tools to crop and zoom](#give-vision-work-tools-to-crop-and-zoom)

## Consider all effort levels

Start at the default [effort](https://platform.claude.com/docs/en/build-with-claude/effort) level, `high`, then test the other levels (`low`, `medium`, `xhigh`, and `max`) against your own evals. Effort is the primary control for trading off intelligence, latency, and cost on Claude Fable 5.1. Re-run the sweep even if you already ran one on Claude Fable 5: effort level names don’t correspond to the same amount of thinking across models.

Claude Fable 5.1’s capability gains over Claude Fable 5 show up across effort levels and are largest at the higher settings. At `medium`, results roughly match Claude Fable 5 at lower cost, so step down to `medium` or `low` where your evals show quality holds. At `low`, Claude Fable 5.1 is often competitive with Claude Opus and Claude Sonnet models on cost per task while scoring higher, so include it in the comparison wherever you’d otherwise run a smaller model at a higher effort level.

Two effort-specific behaviors have their own sections: at `low`, Claude Fable 5.1 calls search and retrieval tools less often (see [Search triggering at low effort](#search-triggering-at-low-effort)), and at `xhigh` and `max` it can think for longer before writing a long deliverable (see [Leave room for long outputs at xhigh and max effort](#leave-room-for-long-outputs-at-xhigh-and-max-effort)).

## Ask for user-facing progress updates

Claude Fable 5.1’s default behavior is to write fewer user-facing updates during long tool-calling turns than Claude Fable 5 does. This becomes more pronounced at higher effort and in longer tool chains. Users see the agent go quiet for minutes at a time, or a final message that covers only the last step rather than the whole task.

First, check that your client receives progress updates at all. The model’s short notes between tool calls, what it just found and what it’s doing next, come back as [progress-update `thinking` blocks](https://platform.claude.com/docs/en/build-with-claude/thinking#progress-updates), and those blocks are empty under the default `thinking.display` of `"omitted"`. Set `display: "updates"` (beta, `thinking-display-updates-2026-08-18` header) and render each non-empty `thinking` block as a status line, or set `"summarized"` to receive them along with summarized reasoning. If you aren’t requesting them, the model’s updates might simply not be reaching your users.

Second, audit your prompt for instructions that suppress narration. Some earlier models gave frequent updates while working, which led to system prompt lines such as “hold all findings for the final response.” Remove lines like that before adding anything.

If you still want more updates, for example when pair programming or in other human-in-the-loop work, add a short system prompt line that says when you want user-facing text from the model and what each update should contain:

If your product collapses or hides tool output, tell the model. Otherwise it might run commands to “show” the user output that your UI never displays. Each time you send back tool output that your UI hides, follow it with the note in a [turn-scoped system message](https://platform.claude.com/docs/en/build-with-claude/mid-conversation-system-messages#turn-scoped-system-messages) (`clear_at: "next_user_message"`, beta):

## Batch independent tool calls in agent loops

Claude Fable 5.1 usually issues parallel tool calls as expected: when a request names several things to fetch, it issues those calls in parallel. The exception is coding and computer-use loops where the next independent calls are implied by the task rather than explicitly requested (custom coding agents, bash-and-editor harnesses, computer use): there it might issue them one in each turn instead. This doesn’t affect answer quality, but each extra turn costs tokens, a round trip, and wall-clock time. A one-sentence nudge at the end of the current request addresses it:

Each time you send tool results back, append it after that user message as a [turn-scoped system message](https://platform.claude.com/docs/en/build-with-claude/mid-conversation-system-messages#turn-scoped-system-messages): a `role: "system"` entry in `messages` with `clear_at: "next_user_message"`. Once a later user message exists, the API clears the earlier copies, so the model reads only the newest one. Turn-scoped system messages are in beta and require the [beta header](https://platform.claude.com/docs/en/api/beta-headers) `mid-conversation-system-clear-at-2026-08-21`. Without the beta, place the sentence in a text block after the `tool_result` blocks in the same user message instead.

Append a fresh copy each turn and leave the earlier copies where they are, byte-for-byte. They stay in the array, but once cleared the model doesn’t see them and they cost no input tokens. Deleting or rewriting them is an edit to earlier turns: it invalidates the thinking blocks that came after them (see [Keep the conversation history append-only](#keep-the-conversation-history-append-only)).

The following loop shows this placement. Each assistant turn goes back exactly as returned, each user turn carries only the tool results, and a fresh turn-scoped copy of the nudge follows it.

## Keep the conversation history append-only

Append each assistant turn to the history exactly as the API returned it, thinking blocks included, and don’t edit earlier turns between requests. A thinking block is valid [only while everything before it is unchanged](https://platform.claude.com/docs/en/build-with-claude/thinking#preserved-in-conversation): the system prompt, the tool list, and every earlier message. To choose what happens to a block that fails the prefix check, set `thinking.block_binding.prefix_mismatch_behavior`, which requires the `thinking-binding-controls-2026-08-01` beta header. With `"error"`, the API rejects the request with a 400 error; with `"drop_block"`, it drops the invalid blocks. [When `prefix_mismatch_behavior` is unset](https://platform.claude.com/docs/en/build-with-claude/preserved-thinking#enforcement) covers requests that don’t set it.

Most history edits that trip the prefix check also restart the [prompt cache](https://platform.claude.com/docs/en/build-with-claude/prompt-caching): injecting and removing per-turn reminders, summarizing older turns in place, or changing the system prompt mid-session. Send per-turn reminders as [turn-scoped system messages](https://platform.claude.com/docs/en/build-with-claude/mid-conversation-system-messages#turn-scoped-system-messages), change instructions or tools with a [mid-conversation system message](https://platform.claude.com/docs/en/build-with-claude/mid-conversation-system-messages) instead of rewriting `system` or `tools`, and let server-side [compaction](https://platform.claude.com/docs/en/build-with-claude/compaction) or [context editing](https://platform.claude.com/docs/en/build-with-claude/context-editing) do any trimming. If you compact on the client, the simplest shape is to replace the whole history with one summary message plus the new user turn and replay nothing else. No thinking blocks carry over, so nothing fails, and the model thinks afresh on the compacted conversation (see [Compact on the client](https://platform.claude.com/docs/en/build-with-claude/preserved-thinking#custom-compaction-on-the-client)). Cache reads on Claude Fable 5.1 cost $0.25 USD per million tokens, 2.5 percent of the input price (see [Pricing](https://platform.claude.com/docs/en/models/fable-5-1/whats-new-fable-5-1#pricing)). Compacting early to save cost can be the wrong tradeoff between cost and intelligence, so experiment with later compaction points.

To find edits your harness makes, run a session with `prefix_mismatch_behavior: "drop_block"` and log `input_transformations`, as described in [Check whether your code edits the prefix](https://platform.claude.com/docs/en/build-with-claude/preserved-thinking#how-to-tell-whether-your-integration-is-impacted). You can also capture the exact requests it sends over a few normal turns and confirm that consecutive requests are byte-identical up to the appended turns.

## Writing density

Claude Fable 5.1’s writing has few stock phrases and little unexplained jargon. In some cases, though, its prose is denser than Claude Fable 5’s: sentences run longer and there are fewer paragraph breaks. An instruction that defines the anti-pattern, mannered prose, helps. Add it to a user message (preferred) or the system prompt:

The short version also tends to work:

## Formatting in chat

Earlier models overused bullets and bold in chat, and many prompts carry anti-formatting rules written to reduce that. Claude Fable 5.1 tends toward the opposite: it uses bold less and is less likely to reach for headers, lists, or quotation marks. If your prompt contains anti-formatting language, remove it or replace it with a rule that says when specific formatting is appropriate, such as the following:

## Quoting retrieved sources

When summarizing documents, Claude Fable 5.1 is more likely than Claude Fable 5 to reproduce passages of the source text without marking them as quotations. To address this, add one complete example of a correct response to the system prompt: the user’s request, the response, and a sentence explaining why the response is correct.

Replace the two `[web_search: ...]` lines with your own tool’s name, so the model reads them as templated tool output rather than literal text to emit.

## Finish the whole task

Claude Fable 5.1 can run very long tasks without much guidance on methodology, especially when the goal is clear. On complex asynchronous workloads, though, nudge it not to end its turn before the work is done. Without the nudge, the model sometimes describes what it would do next instead of doing it (“Next, I’ll …”) or stops to ask permission for a step the original request already covered (“Shall I apply this?”). Users have to reply “continue” or “go ahead,” which suits pair programming and other human-in-the-loop work but doesn’t use the model’s full long-horizon capability.

Two system prompt additions together mitigate this. Apply both. If you need to limit prompt length, use only the first, which keeps most of the effect. The first tells the model not to ask about work already requested and to carry out the next steps it has stated:

The opening sentence, which tells the model the user isn’t watching, carries much of the effect. Keep it as written. If your product needs the model to stop for specific confirmations, add a sentence after it listing them. This block can also make the model less likely to ask about ambiguous requests, so check that trade-off on your own tasks.

The second defines the user’s request as the scope of the deliverable:

## Tell the model what to preserve in compaction summaries

Claude Fable 5.1 responds well to being told explicitly what its summary must retain when a long conversation is compacted. Server-side [compaction](https://platform.claude.com/docs/en/build-with-claude/compaction) already does this. If you compact on the client side, use the following summarization instruction:

## Keep changes and tests to what the task asks for

When asked to implement an open-ended feature, Claude Fable 5.1 delivers what’s asked for and sometimes more: it might fix nearby code, extend behavior the task didn’t mention, or commit more test files than the change warrants. It responds well to explicit instructions about what to leave out. With the following instruction, unrequested additions and committed test code drop substantially with no measurable change in task success:

## Search triggering at low effort

At `low` effort, Claude Fable 5.1 is less likely than Claude Fable 5 to call a search or retrieval tool, and more likely to answer from memory. In some cases the simplest fix is to raise effort for the affected turns rather than the whole conversation. See [Change effort mid-conversation](https://platform.claude.com/docs/en/build-with-claude/effort#changing-effort-mid-conversation).

In other cases, a prompt nudge toward verification helps. In the system prompt, say that recognizing a name isn’t the same as knowing its current state, and that such names should be searched as the user wrote them:

## Reduce safeguard false positives

Claude Fable 5.1’s safety classifiers produce fewer false positives than Claude Fable 5’s did at launch, and finding vulnerabilities in source code is permitted. False positives still occur, and a blocked request returns `stop_reason: "refusal"` (see [Refusals, fallback, and billing](https://platform.claude.com/docs/en/models/fable-5-1/whats-new-fable-5-1#refusals-fallback-and-billing)). Three situations make them more likely:

-   **Compile-check phrasing:** Instead of “Does this program compile without errors?”, ask “Are there any bugs in this program?”
-   **Lesser-known programming languages:** Give the model context about what the language is and how it works, for example by giving it access to the language’s documentation.
-   **Base64 in tool output:** Tools that return base64-encoded data into the model’s context can trigger false positives, so removing them is the recommended fix.

## Prefer targeted edits over whole-file rewrites

If Claude Fable 5.1 rewrites whole files for small changes, append the following instruction to the system prompt or the first user message. Claude Fable 5.1 is more likely than Claude Fable 5 to rewrite an entire text file rather than make a targeted edit. The resulting file is usually the same, but unless the file is short or most of it is changing, a rewrite costs more output tokens and time. With the instruction, Claude Fable 5.1 behaves like Claude Fable 5 on small and medium changes.

## Leave room for long outputs at xhigh and max effort

At `xhigh` and especially `max` effort, Claude Fable 5.1 can think for longer before it starts writing its reply. When a single request asks for a long deliverable, such as a full rewrite of a long document, it might draft much of that deliverable in its thinking and then write it again as the reply, which means a longer wait and more output tokens. The simplest approach is to run requests like these at `high`, the recommended starting point, and move to `xhigh` or `max` only where you’ve measured a quality gain (see [Consider all effort levels](#consider-all-effort-levels)). If you do run them at `xhigh` or `max`:

-   Set `max_tokens` to leave room for the thinking and the reply, not just the reply length you expect.
-   Append the following note to the end of the user message. It makes the thinking much shorter on prose and code requests. Replace `[max_tokens]` with the request’s actual `max_tokens` value, for example 64,000.

## Let the lead agent keep working while subagents run

If your coding agent lets Claude Fable 5.1 delegate work to subagents, don’t force the lead agent to stop and wait for each one. On coding tasks, letting the lead continue while subagents run lowers average time to completion at similar quality, token usage, and cost. To set this up:

-   Have the tool that starts a subagent return immediately.
-   Pass each subagent’s result back to the lead in a later `user` message once it’s ready.
-   Give the lead a separate tool it can call to wait for a result.

The model still often waits. The time savings come from the runs where it carries on with other work.

## Give vision work tools to crop and zoom

Claude Fable 5.1 has better vision capabilities out of the box, and on complex visual inputs such as dense charts it does its best work when it can iteratively analyze, crop, and visually verify what it sees. To get the full benefit, run the model as an agent with access to a container that holds the raw images or videos and has basic image-processing libraries (such as PIL and OpenCV) pre-installed. If running a container is too much overhead, an image-cropping tool alone delivers most of the uplift: a tool that returns a chosen region of the image, cropped and enlarged, lets the model examine specific details in more depth and scales test-time compute with image tokens. The [crop tool recipe](https://platform.claude.com/cookbook/multimodal-crop-tool) has a working definition.
