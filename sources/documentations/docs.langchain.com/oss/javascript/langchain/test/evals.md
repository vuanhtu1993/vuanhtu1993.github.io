---
title: "Agent Evals - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/langchain/test/evals"
crawled_at: "2026-06-17T14:56:26.175Z"
---

Evaluations (“evals”) measure how well your agent performs by assessing its execution trajectory, the sequence of messages and tool calls it produces. Unlike [integration tests](https://docs.langchain.com/oss/javascript/langchain/test/integration-testing) that verify basic correctness, evals score agent behavior against a reference or rubric, making them useful for catching regressions when you change prompts, tools, or models. An evaluator is a function that takes agent outputs (and optionally reference outputs) and returns a score:

```
function evaluator({ outputs, referenceOutputs }: {
  outputs: Record<string, any>;
  referenceOutputs: Record<string, any>;
}) {
  const outputMessages = outputs.messages;
  const referenceMessages = referenceOutputs.messages;
  const score = compareMessages(outputMessages, referenceMessages);
  return { key: "evaluator_score", score: score };
}
```

The [`agentevals`](https://github.com/langchain-ai/agentevals) package provides prebuilt evaluators for agent trajectories. You can evaluate by performing a **trajectory match** (deterministic comparison) or by using an **LLM judge** (qualitative assessment):

| Approach | When to use |
| --- | --- |
| [Trajectory match](#trajectory-match-evaluator) | You know the expected tool calls and want fast, deterministic, cost-free checks |
| [LLM-as-judge](#llm-as-judge-evaluator) | You want to assess overall quality and reasoning without strict expectations |

## Install AgentEvals

```
npm install agentevals @langchain/core
```

Or, clone the [AgentEvals repository](https://github.com/langchain-ai/agentevals) directly.

## Trajectory match evaluator

AgentEvals offers the `createTrajectoryMatchEvaluator` function to match your agent’s trajectory against a reference. There are four modes:

| Mode | Description | Use case |
| --- | --- | --- |
| `strict` | Exact match of message structure and tool calls in the same order (message content can differ) | Testing specific sequences (e.g., policy lookup before authorization) |
| `unordered` | Same message structure and tool calls as reference, but tool calls can happen in any order | Verifying information retrieval when order doesn’t matter |
| `subset` | Agent calls only tools from reference (no extras) | Ensuring agent doesn’t exceed expected scope |
| `superset` | Agent calls at least the reference tools (extras allowed) | Verifying minimum required actions are taken |

The examples below share a common setup, an agent with a `get_weather` tool:

```
import { createAgent } from "langchain";
import { tool } from "@langchain/core/tools";
import { HumanMessage, AIMessage, ToolMessage } from "@langchain/core/messages";
import { createTrajectoryMatchEvaluator } from "agentevals";
import * as z from "zod";

const getWeather = tool(
  async ({ city }) => {
    return `It's 75 degrees and sunny in ${city}.`;
  },
  {
    name: "get_weather",
    description: "Get weather information for a city.",
    schema: z.object({ city: z.string() }),
  }
);

const agent = createAgent({
  model: "claude-sonnet-4-6",
  tools: [getWeather],
});
```

Strict match

The `strict` mode ensures trajectories contain identical messages in the same order with the same tool calls, though it allows for differences in message content. This is useful when you need to enforce a specific sequence of operations, such as requiring a policy lookup before authorizing an action.

```
const evaluator = createTrajectoryMatchEvaluator({
  trajectoryMatchMode: "strict",
});

async function testWeatherToolCalledStrict() {
  const result = await agent.invoke({
    messages: [new HumanMessage("What's the weather in San Francisco?")]
  });

  const referenceTrajectory = [
    new HumanMessage("What's the weather in San Francisco?"),
    new AIMessage({
      content: "",
      tool_calls: [
        { id: "call_1", name: "get_weather", args: { city: "San Francisco" } }
      ]
    }),
    new ToolMessage({
      content: "It's 75 degrees and sunny in San Francisco.",
      tool_call_id: "call_1"
    }),
    new AIMessage("The weather in San Francisco is 75 degrees and sunny."),
  ];

  const evaluation = await evaluator({
    outputs: result.messages,
    referenceOutputs: referenceTrajectory
  });
  expect(evaluation.score).toBe(true);
}
```
Unordered match

The `unordered` mode allows the same tool calls in any order. This is helpful when you want to verify that specific information was retrieved but don’t care about the sequence. For example, an agent that checks both weather and events for a city with different tool calls.

```
const getEvents = tool(
  async ({ city }: { city: string }) => {
    return `Concert at the park in ${city} tonight.`;
  },
  {
    name: "get_events",
    description: "Get events happening in a city.",
    schema: z.object({ city: z.string() }),
  }
);

const agent = createAgent({
  model: "claude-sonnet-4-6",
  tools: [getWeather, getEvents],
});

const evaluator = createTrajectoryMatchEvaluator({
  trajectoryMatchMode: "unordered",
});

async function testMultipleToolsAnyOrder() {
  const result = await agent.invoke({
    messages: [new HumanMessage("What's happening in SF today?")]
  });

  const referenceTrajectory = [
    new HumanMessage("What's happening in SF today?"),
    new AIMessage({
      content: "",
      tool_calls: [
        { id: "call_1", name: "get_events", args: { city: "SF" } },
        { id: "call_2", name: "get_weather", args: { city: "SF" } },
      ]
    }),
    new ToolMessage({
      content: "Concert at the park in SF tonight.",
      tool_call_id: "call_1"
    }),
    new ToolMessage({
      content: "It's 75 degrees and sunny in SF.",
      tool_call_id: "call_2"
    }),
    new AIMessage("Today in SF: 75 degrees and sunny with a concert at the park tonight."),
  ];

  const evaluation = await evaluator({
    outputs: result.messages,
    referenceOutputs: referenceTrajectory,
  });
  expect(evaluation.score).toBe(true);
}
```
Subset and superset match

The `superset` and `subset` modes match partial trajectories. The `superset` mode verifies that the agent called at least the tools in the reference trajectory, allowing additional tool calls. The `subset` mode ensures the agent did not call any tools beyond those in the reference.

```
const getDetailedForecast = tool(
  async ({ city }: { city: string }) => {
    return `Detailed forecast for ${city}: sunny all week.`;
  },
  {
    name: "get_detailed_forecast",
    description: "Get detailed weather forecast for a city.",
    schema: z.object({ city: z.string() }),
  }
);

const agent = createAgent({
  model: "claude-sonnet-4-6",
  tools: [getWeather, getDetailedForecast],
});

const evaluator = createTrajectoryMatchEvaluator({
  trajectoryMatchMode: "superset",
});

async function testAgentCallsRequiredToolsPlusExtra() {
  const result = await agent.invoke({
    messages: [new HumanMessage("What's the weather in Boston?")]
  });

  const referenceTrajectory = [
    new HumanMessage("What's the weather in Boston?"),
    new AIMessage({
      content: "",
      tool_calls: [
        { id: "call_1", name: "get_weather", args: { city: "Boston" } },
      ]
    }),
    new ToolMessage({
      content: "It's 75 degrees and sunny in Boston.",
      tool_call_id: "call_1"
    }),
    new AIMessage("The weather in Boston is 75 degrees and sunny."),
  ];

  const evaluation = await evaluator({
    outputs: result.messages,
    referenceOutputs: referenceTrajectory,
  });
  expect(evaluation.score).toBe(true);
}
```

## LLM-as-judge evaluator

You can use an LLM to evaluate the agent’s execution path with the `createTrajectoryLLMAsJudge` function. Unlike trajectory match evaluators, it doesn’t require a reference trajectory, but one can be provided if available.

Without reference trajectory

```
import { createTrajectoryLLMAsJudge, TRAJECTORY_ACCURACY_PROMPT } from "agentevals";

const evaluator = createTrajectoryLLMAsJudge({
  model: "openai:o3-mini",
  prompt: TRAJECTORY_ACCURACY_PROMPT,
});

async function testTrajectoryQuality() {
  const result = await agent.invoke({
    messages: [new HumanMessage("What's the weather in Seattle?")]
  });

  const evaluation = await evaluator({
    outputs: result.messages,
  });
  expect(evaluation.score).toBe(true);
}
```
With reference trajectory

If you have a reference trajectory, use the prebuilt `TRAJECTORY_ACCURACY_PROMPT_WITH_REFERENCE` prompt:

```
import { createTrajectoryLLMAsJudge, TRAJECTORY_ACCURACY_PROMPT_WITH_REFERENCE } from "agentevals";

const evaluator = createTrajectoryLLMAsJudge({
  model: "openai:o3-mini",
  prompt: TRAJECTORY_ACCURACY_PROMPT_WITH_REFERENCE,
});

const evaluation = await evaluator({
  outputs: result.messages,
  referenceOutputs: referenceTrajectory,
});
```

## Run evals in LangSmith

For tracking experiments over time, log evaluator results to [LangSmith](https://smith.langchain.com/?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=oss-langchain-test-evals). First, set the required environment variables:

```
export LANGSMITH_API_KEY="your_langsmith_api_key"
export LANGSMITH_TRACING="true"
```

LangSmith offers two main approaches for running evaluations: [Vitest/Jest](https://docs.langchain.com/langsmith/vitest-jest) integration and the `evaluate` function.

Use vitest/jest integration

```
import * as ls from "langsmith/vitest";
// import * as ls from "langsmith/jest";

import { createTrajectoryLLMAsJudge, TRAJECTORY_ACCURACY_PROMPT } from "agentevals";

const trajectoryEvaluator = createTrajectoryLLMAsJudge({
  model: "openai:o3-mini",
  prompt: TRAJECTORY_ACCURACY_PROMPT,
});

ls.describe("trajectory accuracy", () => {
  ls.test("accurate trajectory", {
    inputs: {
      messages: [
        { role: "user", content: "What is the weather in SF?" }
      ]
    },
    referenceOutputs: {
      messages: [
        new HumanMessage("What is the weather in SF?"),
        new AIMessage({
          content: "",
          tool_calls: [
            { id: "call_1", name: "get_weather", args: { city: "SF" } }
          ]
        }),
        new ToolMessage({
          content: "It's 75 degrees and sunny in SF.",
          tool_call_id: "call_1"
        }),
        new AIMessage("The weather in SF is 75 degrees and sunny."),
      ],
    },
  }, async ({ inputs, referenceOutputs }) => {
    const result = await agent.invoke({
      messages: [new HumanMessage("What is the weather in SF?")]
    });

    ls.logOutputs({ messages: result.messages });

    await trajectoryEvaluator({
      inputs,
      outputs: result.messages,
      referenceOutputs,
    });
  });
});
```

Run the evaluation with your test runner:

```
vitest run test_trajectory.eval.ts
# or
jest test_trajectory.eval.ts
```
Use the evaluate function

Create a [LangSmith dataset](https://docs.langchain.com/langsmith/manage-datasets) and use the `evaluate` function. The dataset must have the following schema:

-   **input**: `{"messages": [...]}` input messages to call the agent with.
-   **output**: `{"messages": [...]}` expected message history in the agent output. For trajectory evaluation, you can choose to keep only assistant messages.

```
import { evaluate } from "langsmith/evaluation";
import { createTrajectoryLLMAsJudge, TRAJECTORY_ACCURACY_PROMPT } from "agentevals";

const trajectoryEvaluator = createTrajectoryLLMAsJudge({
  model: "openai:o3-mini",
  prompt: TRAJECTORY_ACCURACY_PROMPT,
});

async function runAgent(inputs: any) {
  const result = await agent.invoke(inputs);
  return result.messages;
}

await evaluate(
  runAgent,
  {
    data: "your_dataset_name",
    evaluators: [trajectoryEvaluator],
  }
);
```

---
