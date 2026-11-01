---
title: "Reduce prompt leak"
source_url: "https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-prompt-leak"
crawled_at: "2026-11-01T16:31:53.818Z"
---

Reduce the risk of prompt leaks by separating context from user queries, filtering Claude’s outputs, and auditing prompts, without degrading task performance.

Prompt leaks can expose sensitive information that you expect to be “hidden” in your prompt. Although no method is foolproof, the following strategies can significantly reduce the risk.

## Before you try to reduce prompt leak

Consider using leak-resistant prompt engineering strategies only when **absolutely necessary**. Attempts to leak-proof your prompt can make the LLM’s overall task more complex, which might degrade performance in other parts of the task.

If you decide to implement leak-resistant techniques, be sure to test your prompts thoroughly to ensure that the added complexity does not negatively impact the model’s performance or the quality of its outputs.

---

## Strategies to reduce prompt leak

-   **Separate context from queries:** You can try using system prompts to isolate key information and context from user queries. You can emphasize key instructions in the `User` turn, then reemphasize those instructions by prefilling the `Assistant` turn. (Note: prefilling is not supported on Claude 4.6 and later models and [Claude Mythos Preview](https://anthropic.com/glasswing).)

-   **Use post-processing:** Filter Claude’s outputs for keywords that might indicate a leak. Techniques include using regular expressions, keyword filtering, or other text processing methods.
-   **Avoid unnecessary proprietary details:** If Claude doesn’t need it to perform the task, don’t include it. Extra content reduces Claude’s adherence to “no leak” instructions.
-   **Audit regularly:** Periodically review your prompts and Claude’s outputs for potential leaks.

Remember, the goal is not just to prevent leaks but to maintain Claude’s performance. Overly complex leak-prevention can degrade results. Balance is key.
