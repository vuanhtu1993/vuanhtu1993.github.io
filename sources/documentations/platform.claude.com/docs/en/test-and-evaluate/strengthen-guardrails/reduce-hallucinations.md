---
title: "Reduce hallucinations"
source_url: "https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations"
crawled_at: "2026-11-01T16:31:44.187Z"
---

Minimize hallucinations in Claude’s outputs by allowing uncertainty, grounding responses in direct quotes, and verifying claims with citations.

Even the most advanced language models, such as Claude, can sometimes generate text that is factually incorrect or inconsistent with the given context. This phenomenon, known as “hallucination,” can undermine the reliability of your AI-driven solutions. This guide explores techniques to minimize hallucinations and ensure Claude’s outputs are accurate and trustworthy.

## Basic hallucination minimization strategies

-   **Allow Claude to say “I don’t know”:** Explicitly give Claude permission to admit uncertainty. This technique can drastically reduce false information.

-   **Use direct quotes for factual grounding:** For tasks involving long documents (>20k tokens), ask Claude to extract word-for-word quotes first before performing its task. This grounds its responses in the actual text, reducing hallucinations.

-   **Verify with citations:** Make Claude’s response auditable by having it cite quotes and sources for each of its claims. You can also have Claude verify each claim by finding a supporting quote after it generates a response. If it can’t find a quote, it must retract the claim.

---

## Advanced techniques

-   **Chain-of-thought verification:** Use [thinking](https://platform.claude.com/docs/en/build-with-claude/thinking) with `display: "summarized"`, and review the summarized reasoning in the `thinking` blocks when an answer looks wrong. This can reveal faulty logic or assumptions.
    
-   **Best-of-N verification:** Run Claude through the same prompt multiple times and compare the outputs. Inconsistencies across outputs could indicate hallucinations.
    
-   **Iterative refinement:** Use Claude’s outputs as inputs for follow-up prompts, asking it to verify or expand on previous statements. This can catch and correct inconsistencies.
    
-   **External knowledge restriction:** Explicitly instruct Claude to only use information from provided documents and not its general knowledge.
