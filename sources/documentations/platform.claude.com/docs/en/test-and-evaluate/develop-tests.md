---
title: "Define success criteria and build evaluations"
source_url: "https://platform.claude.com/docs/en/test-and-evaluate/develop-tests"
crawled_at: "2026-11-01T16:22:41.922Z"
---

Define measurable success criteria for your LLM application and build evaluations to test it, from exact match checks to LLM-based grading.

Building a successful LLM-based application starts with clearly defining your success criteria and then designing evaluations to measure performance against them. This cycle is central to prompt engineering.

## Define your success criteria

Good success criteria are:

-   **Specific:** Clearly define what you want to achieve. Instead of “good performance,” specify “accurate sentiment classification.”
    
-   **Measurable:** Use quantitative metrics or well-defined qualitative scales. Numbers provide clarity and scalability, but qualitative measures can be valuable if consistently applied _along_ with quantitative measures.
    
    -   Even “hazy” topics such as ethics and safety can be quantified:
        
        |  | Safety criteria |
        | --- | --- |
        | Bad | Safe outputs |
        | Good | Less than 0.1% of outputs out of 10,000 trials flagged for toxicity by the content filter. |
        
-   **Achievable:** Base your targets on industry benchmarks, prior experiments, AI research, or expert knowledge. Your success metrics should not be unrealistic to current frontier model capabilities.
    
-   **Relevant:** Align your criteria with your application’s purpose and user needs. Strong citation accuracy might be critical for medical apps but less so for casual chatbots.
    

### Common success criteria

Here are some criteria that might be important for your use case. This list is non-exhaustive.

Most use cases need multidimensional evaluation along several success criteria.

---

## Build evaluations

### Eval design principles

1.  **Be task-specific:** Design evals that mirror your real-world task distribution. Don’t forget to factor in edge cases!
2.  **Automate when possible:** Structure questions to allow for automated grading (for example, multiple-choice, string match, code-graded, LLM-graded).
3.  **Prioritize volume over quality:** More questions with slightly lower signal automated grading is better than fewer questions with high-quality human hand-graded evals.

### Example evals

---

## Grade your evaluations

When deciding which method to use to grade evals, choose the fastest, most reliable, most scalable method:

1.  **Code-based grading:** Fastest and most reliable, extremely scalable, but also lacks nuance for more complex judgments that require less rule-based rigidity.
    
    -   Exact match: `output == golden_answer`
    -   String match: `key_phrase in output`
2.  **Human grading:** Most flexible and high quality, but slow and expensive. Avoid if possible.
    
3.  **LLM-based grading:** Fast and flexible, scalable and suitable for complex judgment. Test to ensure reliability first, then scale.
    

### Tips for LLM-based grading

-   **Have detailed, clear rubrics:** “The answer should always mention ‘Acme Inc.’ in the first sentence. If it does not, the answer is automatically graded as ‘incorrect.’”
-   **Be empirical or specific:** For example, instruct the LLM to output only ‘correct’ or ‘incorrect’, or to judge from a scale of 1–5. Purely qualitative evaluations are hard to assess quickly and at scale.
-   **Encourage reasoning:** Use a grader model with [thinking](https://platform.claude.com/docs/en/build-with-claude/thinking) on, so that it reasons before it produces an evaluation score. This increases evaluation performance, particularly for tasks requiring complex judgment.

## Next steps

Brainstorm success criteria for your use case with Claude on claude.ai.

**Tip:** Drop this page into the chat as guidance for Claude!

More code examples of human-, code-, and LLM-graded evals.
