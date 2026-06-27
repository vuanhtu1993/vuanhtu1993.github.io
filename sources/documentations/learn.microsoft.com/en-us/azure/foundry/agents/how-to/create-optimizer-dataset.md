---
title: "Create an evaluation dataset and evaluators for the agent optimizer (preview) - Microsoft Foundry"
source_url: "https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/create-optimizer-dataset?source=recommendations"
crawled_at: "2026-06-27T11:35:57.427Z"
---

Important

Agent Optimizer is currently in preview. This preview is provided without a service-level agreement, and we don't recommend it for production workloads. Certain features might not be supported or might have constrained capabilities. For more information, see [Supplemental Terms of Use for Microsoft Azure Previews](https://azure.microsoft.com/support/legal/preview-supplemental-terms/).

The agent optimizer evaluates your agent against a _dataset_ — a collection of tasks with evaluation criteria — scored by _evaluators_. You can generate both automatically from the CLI or create a dataset manually for full control.

-   A [Foundry project](https://learn.microsoft.com/en-us/azure/foundry/how-to/create-projects) with a deployed hosted agent
-   The `azure.ai.agents` CLI extension installed (see [Quickstart: Optimize a hosted agent](https://learn.microsoft.com/en-us/azure/foundry/agents/quickstarts/quickstart-optimize-hosted-agent))

The fastest way to create evaluation assets is with `azd ai agent eval generate`. The command auto-detects your agent, then generates both a dataset and adaptive evaluators tuned to your agent's domain, and writes a runnable `eval.yaml`:

```
azd ai agent eval generate
```

For the interactive wizard, non-interactive flags, generated artifacts, and the full evaluation workflow, see [Initialize evaluation assets](https://learn.microsoft.com/en-us/azure/foundry/observability/how-to/azure-developer-cli-evaluation#initialize-evaluation-assets).

After `eval generate` completes, `azd ai agent optimize` auto-detects the generated `eval.yaml`:

```
azd ai agent optimize
```

Or pass it explicitly:

```
azd ai agent optimize --config eval.yaml
```

For full control over evaluation tasks and criteria, create a JSONL dataset by hand. This is useful when you need precise control over test scenarios or have production data to use directly.

By default, `azd ai agent optimize` uses a built-in dataset with 3 general coding tasks and 25 criteria. For meaningful optimization of your specific agent, create a custom _dataset_ that reflects your agent's real-world use cases.

Datasets use **JSONL** (JSON Lines) format. Each line is one JSON object that represents a single evaluation _task_. A task is an individual scenario in the dataset. It contains a prompt and evaluation criteria.

```
{"name": "task_1", "query": "Your prompt here", "criteria": [{"name": "criterion_name", "instruction": "What the evaluator checks for"}]}
{"name": "task_2", "query": "Another prompt", "criteria": [{"name": "check_1", "instruction": "..."}, {"name": "check_2", "instruction": "..."}]}
```

| Field | Required | Description |
| --- | --- | --- |
| `name` | Yes | Unique task identifier (for example, `"greeting"`, `"math_test"`) |
| `query` | Yes | The message sent to the agent |
| `criteria` | Yes | Array of evaluation _criteria_ — rules that define what "good" looks like for the task |
| `criteria[].name` | Yes | Short name for the criterion (for example, `"is_polite"`) |
| `criteria[].instruction` | Yes | What the _evaluator_ checks. Be specific and testable. The built-in evaluator (`builtin.task_adherence`) scores each criterion independently as a binary value (0 or 1). |
| `ground_truth` | No | Expected answer (used by some evaluators for reference) |

```
{"name": "refund_policy", "query": "What is your refund policy?", "criteria": [{"name": "mentions_30_days", "instruction": "Response must mention the 30-day refund window"}, {"name": "polite_tone", "instruction": "Response must be professional and empathetic"}]}
{"name": "order_status", "query": "Where is my order #12345?", "criteria": [{"name": "asks_for_details", "instruction": "Agent should ask for email or order details to look up the order"}, {"name": "no_hallucination", "instruction": "Agent must NOT make up a fake order status"}]}
{"name": "out_of_scope", "query": "Can you help me fix my car?", "criteria": [{"name": "polite_decline", "instruction": "Agent should politely explain this is outside its scope"}, {"name": "redirect", "instruction": "Agent should suggest contacting an appropriate service"}]}
```

```
{"name": "python_function", "query": "Write a Python function to reverse a linked list", "criteria": [{"name": "correct_algorithm", "instruction": "The function must correctly reverse a singly linked list"}, {"name": "handles_empty", "instruction": "The function must handle an empty list without errors"}, {"name": "includes_docstring", "instruction": "The function should include a descriptive docstring"}]}
{"name": "explain_concept", "query": "Explain what a closure is in JavaScript", "criteria": [{"name": "accurate_definition", "instruction": "Must correctly define a closure as a function that captures variables from its enclosing scope"}, {"name": "includes_example", "instruction": "Must include at least one working code example"}]}
```

Reference your dataset in a YAML config file:

```
# eval.yaml
agent:
  name: my-agent

dataset_file: ./my_eval_dataset.jsonl

evaluators:
  - builtin.task_adherence

options:
  eval_model: gpt-4.1-mini
  optimization_model: gpt-5.1
  max_iterations: 5
```

Then run:

```
azd ai agent optimize --config eval.yaml
```

Before you run the command, validate the JSONL syntax:

```
python -c "import json; [json.loads(l) for l in open('my_eval_dataset.jsonl')]"
```

Bad:

```
{"name": "good_answer", "instruction": "The response should be good"}
```

Good:

```
{"name": "mentions_30_days", "instruction": "Response must explicitly mention the 30-day refund window"}
```

Specific criteria give the evaluator a clear, binary signal. Vague criteria lead to inconsistent scoring.

Test beyond the happy path. Include:

-   **Out-of-scope requests** — Inputs your agent should decline or redirect
-   **Ambiguous queries** — Tasks where the agent should ask for clarification
-   **Adversarial inputs** — Attempts to trick the agent into bad behavior
-   **Multi-step tasks** — Complex requests that require structured reasoning

| Dataset size | Trade-off |
| --- | --- |
| 3–5 tasks | Quick iteration, limited signal |
| 5–10 tasks | Good balance of speed and coverage |
| 10–20 tasks | Comprehensive evaluation, longer runs |
| 20+ tasks | Thorough but slow — consider for final validation |

Each task can have multiple criteria. A dataset with 5 tasks × 4 criteria each = 20 evaluation signals.

Use actual messages from your users if possible. Real prompts capture the vocabulary and context that your agent faces in production.

Each criterion gets a binary score (0 or 1). The task score is the average of its criteria scores. The overall score is the average across all tasks. This means:

-   A task with 4 criteria where 3 pass scores 0.75
-   An agent that passes all criteria on 2 of 3 tasks scores 0.67

The `ground_truth` field provides a reference answer for evaluators that support it. This field isn't required. The `builtin.task_adherence` evaluator works entirely from criteria instructions.

```
{"name": "geography_fact", "query": "What is the largest city in France by population?", "ground_truth": "Paris", "criteria": [{"name": "correct_answer", "instruction": "Response must state that Paris is the largest city in France by population"}]}
```

| Problem | Cause | Fix |
| --- | --- | --- |
| `dataset_file not found` | Wrong path in `eval.yaml` | Use a path relative to the config file location |
| `invalid JSON on line N` | Malformed JSONL | Validate that each line is valid JSON. Check for trailing commas. |
| Scores are inconsistent between runs | Vague criteria | Make criteria specific and binary-testable |

-   [Run agent evaluations with the azd CLI](https://learn.microsoft.com/en-us/azure/foundry/observability/how-to/azure-developer-cli-evaluation)
-   [Agent optimizer overview](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/agent-optimizer-overview)
-   [Optimize agent instructions, skills, tools, and models](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/optimize-agent-targets)
-   [Quickstart: Optimize a hosted agent](https://learn.microsoft.com/en-us/azure/foundry/agents/quickstarts/quickstart-optimize-hosted-agent)
