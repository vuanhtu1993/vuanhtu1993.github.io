---
title: "LLM Observability Deep Dive: How to Monitor, Trace, and Debug AI Agents in Production"
source_url: "https://dev.to/pockit_tools/llm-observability-deep-dive-how-to-monitor-trace-and-debug-ai-agents-in-production-2mob"
crawled_at: "2026-08-07T09:30:21.973Z"
---

Your AI agent just cost a customer $2,400. It entered an infinite tool-calling loop at 3 AM, burning through tokens while generating nonsensical responses. Your traditional APM dashboard shows everything green — latency is normal, no errors, no crashes. But the agent has been confidently wrong for six hours straight, and you had zero visibility into it.

This is the observability gap that kills AI products. Traditional monitoring tools were built for deterministic software: request in, response out, measure the time. AI agents are fundamentally different. They reason, branch, call tools, retrieve documents, and make decisions that vary across identical inputs. When something goes wrong, you can't just check the HTTP status code. You need to trace the _reasoning chain_ — every decision point, every tool invocation, every token consumed.

This guide covers everything you need to build production-grade observability for LLM-powered systems: from distributed tracing and automated evaluations to cost tracking and the tooling landscape. No theory. Battle-tested patterns from teams running agents that handle millions of requests per day.

## [](#why-traditional-monitoring-fails-for-llm-applications)Why Traditional Monitoring Fails for LLM Applications

If you're running AI agents with Datadog, Grafana, or New Relic alone, you're flying blind. Here's why:

### [](#the-determinism-problem)The Determinism Problem

Traditional software is deterministic. Given the same input, you get the same output. Monitoring is straightforward: track latency, error rates, and throughput. If the P99 latency spikes, you investigate.

LLMs are non-deterministic. The same prompt can produce different outputs every time. A "successful" HTTP 200 response might contain a completely hallucinated answer. Your error rate is 0%, but your accuracy is 40%. Traditional APM tools literally cannot detect this failure mode.

### [](#the-multistep-problem)The Multi-Step Problem

A simple API call is a single span: request → response. An AI agent is a complex execution graph:  

```
User Query: "Find the cheapest flight from NYC to Tokyo next month"
│
├─ Step 1: Intent Classification (LLM call, 200ms, 150 tokens)
├─ Step 2: Parameter Extraction (LLM call, 180ms, 120 tokens)
├─ Step 3: Tool Call - Flight API (external API, 2.1s)
├─ Step 4: Result Parsing (LLM call, 250ms, 800 tokens)
├─ Step 5: Price Comparison (LLM call, 300ms, 1200 tokens)
├─ Step 6: Response Generation (LLM call, 400ms, 500 tokens)
│
Total: 5 LLM calls, 3.4s, 2770 tokens, $0.008
```

 

When this agent returns wrong results, which step failed? Was it the intent classification? Did the tool return bad data? Did the LLM hallucinate during price comparison? Without step-level tracing, debugging is impossible.

### [](#the-cost-problem)The Cost Problem

LLM calls are expensive. Unlike traditional compute where CPU cycles are essentially free, every token has a direct dollar cost. A single runaway agent loop can burn through hundreds of dollars in minutes. You need real-time cost tracking at the agent, user, and organization level — something no traditional APM tool provides.

## [](#the-llm-observability-stack)The LLM Observability Stack

Production-grade LLM observability requires four layers:  

```
┌─────────────────────────────────────────────────────┐
│                  Layer 4: DASHBOARDS                 │
│     Cost analytics, quality trends, SLA tracking     │
├─────────────────────────────────────────────────────┤
│                  Layer 3: EVALUATION                 │
│   Automated evals, regression detection, A/B tests   │
├─────────────────────────────────────────────────────┤
│                  Layer 2: TRACING                    │
│  Distributed traces, span hierarchy, token tracking  │
├─────────────────────────────────────────────────────┤
│                  Layer 1: INSTRUMENTATION            │
│   SDK integration, auto-capture, manual annotations  │
└─────────────────────────────────────────────────────┘
```

 

Let's build each layer from the ground up.

## [](#layer-1-instrumentation)Layer 1: Instrumentation

Instrumentation is the foundation. You need to capture data at every decision point without destroying your application's performance.

### [](#opentelemetry-for-llms)OpenTelemetry for LLMs

The industry is converging on OpenTelemetry (OTel) as the standard instrumentation layer. The OpenLLMetry project extends OTel with LLM-specific semantic conventions:  

```
import * as traceloop from '@traceloop/node-server-sdk';

// Initialize before importing any LLM modules
traceloop.initialize({
  baseUrl: 'https://your-collector.example.com',
  appName: 'my-ai-agent',
});

// Or use the modular approach with OpenTelemetry directly:
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OpenAIInstrumentation } from
  '@traceloop/instrumentation-openai';
import { AnthropicInstrumentation } from
  '@traceloop/instrumentation-anthropic';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: 'https://your-collector.example.com/v1/traces',
  }),
  instrumentations: [
    new OpenAIInstrumentation({
      captureInputs: true,   // Log prompts (careful in prod!)
      captureOutputs: true,  // Log completions
    }),
    new AnthropicInstrumentation(),
  ],
});

sdk.start();
```

 

This auto-instruments every OpenAI and Anthropic API call, capturing:

-   Model name and parameters (temperature, max\_tokens)
-   Input prompts and output completions
-   Token usage (prompt tokens, completion tokens)
-   Latency per call
-   Tool/function call details

### [](#manual-span-annotations)Manual Span Annotations

Auto-instrumentation captures the LLM calls, but you need manual spans for business logic:  

```
import { trace, SpanStatusCode } from '@opentelemetry/api';

const tracer = trace.getTracer('ai-agent');

async function processUserQuery(query: string, userId: string) {
  return tracer.startActiveSpan('agent.process_query', async (span) => {
    // Add business context
    span.setAttributes({
      'user.id': userId,
      'agent.query': query,
      'agent.type': 'flight-search',
    });

    try {
      // Step 1: Classify intent
      const intent = await tracer.startActiveSpan(
        'agent.classify_intent',
        async (intentSpan) => {
          const result = await classifyIntent(query);
          intentSpan.setAttributes({
            'agent.intent': result.intent,
            'agent.confidence': result.confidence,
          });
          return result;
        }
      );

      // Step 2: Execute tool calls
      const toolResults = await tracer.startActiveSpan(
        'agent.execute_tools',
        async (toolSpan) => {
          toolSpan.setAttribute('agent.tools_count', intent.tools.length);
          return Promise.all(
            intent.tools.map((tool) => executeTool(tool))
          );
        }
      );

      // Step 3: Generate response
      const response = await tracer.startActiveSpan(
        'agent.generate_response',
        async (respSpan) => {
          const result = await generateResponse(toolResults);
          respSpan.setAttributes({
            'agent.response_length': result.length,
            'agent.tokens_total': result.tokenUsage.total,
          });
          return result;
        }
      );

      span.setStatus({ code: SpanStatusCode.OK });
      return response;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
      span.recordException(error);
      throw error;
    }
  });
}
```

 

### [](#what-to-capture-and-what-not-to)What to Capture (and What Not To)

A critical decision: what data do you log?

| Data | Capture in Dev | Capture in Prod | Why |
| --- | --- | --- | --- |
| Full prompts | ✅ Yes | ⚠️ Sampled | PII risk, storage cost |
| Full completions | ✅ Yes | ⚠️ Sampled | Same as above |
| Token counts | ✅ Yes | ✅ Yes | Cost tracking is critical |
| Model parameters | ✅ Yes | ✅ Yes | Debugging regressions |
| Tool call inputs/outputs | ✅ Yes | ✅ Yes | Essential for debugging |
| User IDs | ✅ Yes | ✅ Yes | Per-user cost tracking |
| Latency per step | ✅ Yes | ✅ Yes | Performance monitoring |
| Embedding vectors | ❌ No | ❌ No | Too large, rarely useful |
| Raw API responses | ✅ Yes | ❌ No | Storage explosion |

In production, use **sampling** for full prompt/completion logging. Capture 100% of metadata (tokens, latency, model) but only 10-20% of full text content. When debugging a specific issue, temporarily increase sampling for targeted users or queries.

## [](#layer-2-distributed-tracing)Layer 2: Distributed Tracing

With instrumentation in place, you need a tracing backend that understands LLM-specific data. This is where purpose-built tools shine.

### [](#trace-structure-for-ai-agents)Trace Structure for AI Agents

A well-structured trace for an AI agent looks like this:  

```
Trace: agent_run_abc123
│
├─ Span: agent.process_query (root)
│  ├─ Attributes: user_id, query, session_id
│  │
│  ├─ Span: agent.classify_intent
│  │  ├─ Span: llm.openai.chat (model: gpt-4.1-mini)
│  │  │  └─ Attributes: tokens_in=150, tokens_out=30, cost=$0.0001
│  │  └─ Result: intent=flight_search, confidence=0.95
│  │
│  ├─ Span: agent.retrieve_context (RAG)
│  │  ├─ Span: vectordb.query (provider: pinecone)
│  │  │  └─ Attributes: top_k=5, similarity_threshold=0.8
│  │  └─ Span: agent.rerank
│  │     └─ Span: llm.anthropic.chat (model: claude-haiku-4.5)
│  │        └─ Attributes: tokens_in=2000, tokens_out=500
│  │
│  ├─ Span: agent.execute_tool
│  │  ├─ Span: tool.flight_api.search
│  │  │  └─ Attributes: duration=2100ms, results_count=15
│  │  └─ Span: tool.flight_api.get_prices
│  │     └─ Attributes: duration=800ms, results_count=15
│  │
│  └─ Span: agent.generate_response
│     └─ Span: llm.openai.chat (model: gpt-4.1)
│        └─ Attributes: tokens_in=3000, tokens_out=800, cost=$0.02
│
└─ Total: 4 LLM calls, 6800 tokens, $0.021, 4.2s
```

 

This structure lets you answer questions like:

-   "Why did this agent take 10 seconds?" → The flight API call took 8 seconds.
-   "Why did this cost $2 instead of $0.02?" → The agent looped 100 times on tool calls.
-   "Why did the agent hallucinate?" → The RAG retrieval returned irrelevant documents with low similarity scores.

### [](#implementing-trace-propagation)Implementing Trace Propagation

For multi-service architectures, trace context must propagate across service boundaries:  

```
// Service A: Agent Orchestrator
import { context, propagation } from '@opentelemetry/api';

async function callToolService(toolName: string, params: any) {
  const headers: Record<string, string> = {};

  // Inject trace context into outgoing request headers
  propagation.inject(context.active(), headers);

  const response = await fetch(`https://tools.internal/${toolName}`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  return response.json();
}

// Service B: Tool Execution Service
import { context, propagation } from '@opentelemetry/api';

app.post('/flight-search', (req, res) => {
  // Extract trace context from incoming request
  const ctx = propagation.extract(context.active(), req.headers);

  context.with(ctx, async () => {
    const span = tracer.startSpan('tool.flight_search');
    // ... tool execution with full trace lineage
    span.end();
  });
});
```

 

## [](#layer-3-automated-evaluation)Layer 3: Automated Evaluation

Tracing tells you _what_ happened. Evaluation tells you _how well_ it happened. This is the layer most teams skip, and the layer that makes or breaks production AI.

### [](#the-eval-pipeline)The Eval Pipeline

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Trace   │ →  │  Sample  │ →  │  Score   │ →  │  Alert   │
│  Store   │    │  Select  │    │  Eval    │    │  Report  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                 10-20% of       LLM-as-Judge    Slack/PD
                 traces          + Deterministic   if quality
                                  rules            drops
```

 

### [](#llmasjudge-evaluation)LLM-as-Judge Evaluation

The most powerful eval pattern is using a separate LLM to judge your agent's outputs:  

```
interface EvalResult {
  score: number;        // 0-1
  reasoning: string;    // Why this score
  dimension: string;    // What was evaluated
}

async function evaluateResponse(
  query: string,
  response: string,
  groundTruth?: string
): Promise<EvalResult[]> {
  const evaluations: EvalResult[] = [];

  // Eval 1: Factual Accuracy
  const accuracyEval = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'system',
        content: `You are an expert evaluator. Score the factual accuracy
of the AI response on a scale of 0 to 1.

Scoring rubric:
- 1.0: All facts are correct and verifiable
- 0.7: Mostly correct with minor inaccuracies
- 0.4: Contains significant factual errors
- 0.0: Completely fabricated or wrong

Respond in JSON: { "score": number, "reasoning": string }`,
      },
      {
        role: 'user',
        content: `Query: ${query}
AI Response: ${response}
${groundTruth ? `Ground Truth: ${groundTruth}` : ''}`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  evaluations.push({
    ...JSON.parse(accuracyEval.choices[0].message.content),
    dimension: 'factual_accuracy',
  });

  // Eval 2: Relevance
  const relevanceEval = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'system',
        content: `Score how relevant the response is to the user's query.
1.0 = Directly answers the question
0.5 = Partially relevant
0.0 = Completely off-topic
Respond in JSON: { "score": number, "reasoning": string }`,
      },
      {
        role: 'user',
        content: `Query: ${query}\nResponse: ${response}`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  evaluations.push({
    ...JSON.parse(relevanceEval.choices[0].message.content),
    dimension: 'relevance',
  });

  return evaluations;
}
```

 

### [](#deterministic-guards)Deterministic Guards

Not everything needs an LLM judge. Use deterministic checks for known failure patterns:  

```
interface GuardResult {
  passed: boolean;
  violation?: string;
}

function runDeterministicGuards(
  trace: AgentTrace
): GuardResult[] {
  const results: GuardResult[] = [];

  // Guard 1: Token budget exceeded
  const totalTokens = trace.spans
    .filter((s) => s.name.startsWith('llm.'))
    .reduce((sum, s) => sum + (s.attributes.tokens_total || 0), 0);

  results.push({
    passed: totalTokens < 50000,
    violation: totalTokens >= 50000
      ? `Token budget exceeded: ${totalTokens} tokens`
      : undefined,
  });

  // Guard 2: Tool call loop detection
  const toolCalls = trace.spans
    .filter((s) => s.name.startsWith('tool.'));
  const uniqueTools = new Set(toolCalls.map((s) => s.name));

  // If the same tool was called >10 times, it's likely a loop
  for (const tool of uniqueTools) {
    const count = toolCalls
      .filter((s) => s.name === tool).length;
    results.push({
      passed: count <= 10,
      violation: count > 10
        ? `Potential loop: ${tool} called ${count} times`
        : undefined,
    });
  }

  // Guard 3: Latency budget
  const totalLatency = trace.duration;
  results.push({
    passed: totalLatency < 30000, // 30 second budget
    violation: totalLatency >= 30000
      ? `Latency budget exceeded: ${totalLatency}ms`
      : undefined,
  });

  // Guard 4: Empty or suspiciously short response
  const finalResponse = trace.output;
  results.push({
    passed: finalResponse && finalResponse.length > 20,
    violation: !finalResponse || finalResponse.length <= 20
      ? 'Response is empty or suspiciously short'
      : undefined,
  });

  return results;
}
```

 

### [](#automated-alerts)Automated Alerts

Wire evaluations to your alerting system:  

```
async function runEvalPipeline(trace: AgentTrace) {
  // Deterministic guards (fast, run on all traces)
  const guardResults = runDeterministicGuards(trace);
  const guardViolations = guardResults
    .filter((r) => !r.passed);

  if (guardViolations.length > 0) {
    await sendAlert({
      severity: 'high',
      title: 'Agent Guard Violation',
      details: guardViolations
        .map((v) => v.violation)
        .join('\n'),
      traceId: trace.traceId,
    });
  }

  // LLM-as-Judge (expensive, run on sampled traces)
  if (shouldSample(trace, 0.1)) { // 10% sampling
    const evalResults = await evaluateResponse(
      trace.input,
      trace.output
    );

    const lowScores = evalResults
      .filter((e) => e.score < 0.5);

    if (lowScores.length > 0) {
      await sendAlert({
        severity: 'medium',
        title: 'Agent Quality Degradation',
        details: lowScores
          .map((e) =>
            `${e.dimension}: ${e.score} - ${e.reasoning}`
          )
          .join('\n'),
        traceId: trace.traceId,
      });
    }

    // Store eval results for trend analysis
    await storeEvalResults(trace.traceId, evalResults);
  }
}
```

 

## [](#layer-4-cost-tracking-and-analytics)Layer 4: Cost Tracking and Analytics

Token costs are the cloud bill of AI applications. Without granular cost tracking, you're guessing.

### [](#realtime-cost-calculation)Real-Time Cost Calculation

```
const MODEL_PRICING: Record<string, {
  input: number;   // per 1M tokens
  output: number;  // per 1M tokens
}> = {
  'gpt-4.1':             { input: 2.00, output: 8.00 },
  'gpt-4.1-mini':        { input: 0.40, output: 1.60 },
  'gpt-4.1-nano':        { input: 0.10, output: 0.40 },
  'claude-sonnet-4.6':   { input: 3.00, output: 15.00 },
  'claude-haiku-4.5':    { input: 1.00, output: 5.00 },
  'gemini-2.5-pro':      { input: 1.25, output: 10.00 },
  'gemini-2.5-flash':    { input: 0.30, output: 2.50 },
};

function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = MODEL_PRICING[model];
  if (!pricing) return 0;

  return (
    (inputTokens / 1_000_000) * pricing.input +
    (outputTokens / 1_000_000) * pricing.output
  );
}

// Track cost per trace
function aggregateTraceCost(trace: AgentTrace): CostBreakdown {
  const llmSpans = trace.spans
    .filter((s) => s.name.startsWith('llm.'));

  let totalCost = 0;
  const breakdown: Record<string, number> = {};

  for (const span of llmSpans) {
    const model = span.attributes.model;
    const cost = calculateCost(
      model,
      span.attributes.tokens_in,
      span.attributes.tokens_out
    );

    totalCost += cost;
    breakdown[model] = (breakdown[model] || 0) + cost;
  }

  return {
    totalCost,
    breakdown,
    tokenCount: llmSpans.reduce(
      (sum, s) =>
        sum + s.attributes.tokens_in + s.attributes.tokens_out,
      0
    ),
  };
}
```

 

### [](#cost-alerting-thresholds)Cost Alerting Thresholds

```
// Per-request cost guard
const MAX_COST_PER_REQUEST = 0.50; // $0.50

// Per-user hourly budget
const MAX_COST_PER_USER_HOUR = 5.00; // $5.00

// Per-organization daily budget
const MAX_COST_PER_ORG_DAY = 500.00; // $500.00

async function checkCostBudgets(
  cost: number,
  userId: string,
  orgId: string
) {
  // Check per-request
  if (cost > MAX_COST_PER_REQUEST) {
    await sendAlert({
      severity: 'high',
      title: `Request cost exceeded: $${cost.toFixed(4)}`,
    });
  }

  // Check per-user hourly
  const userHourlyCost = await redis.incrbyfloat(
    `cost:user:${userId}:${getCurrentHour()}`,
    cost
  );
  await redis.expire(
    `cost:user:${userId}:${getCurrentHour()}`,
    7200
  );

  if (userHourlyCost > MAX_COST_PER_USER_HOUR) {
    await sendAlert({
      severity: 'critical',
      title: `User ${userId} hourly budget exceeded`,
    });
    // Optionally: rate-limit or block the user
  }
}
```

 

## [](#the-tooling-landscape-langsmith-vs-langfuse-vs-arize)The Tooling Landscape: LangSmith vs Langfuse vs Arize

Choosing the right observability platform is a critical decision. Here's the honest comparison:

### [](#langsmith)LangSmith

**Best for:** Teams already using LangChain/LangGraph  

```
// LangSmith integration
import { Client } from 'langsmith';
import { traceable } from 'langsmith/traceable';

const client = new Client({
  apiKey: process.env.LANGSMITH_API_KEY,
});

// Decorator-based tracing
const processQuery = traceable(
  async (query: string) => {
    const intent = await classifyIntent(query);
    const results = await searchFlights(intent);
    return generateResponse(results);
  },
  { name: 'process_query', tags: ['production'] }
);
```

 

**Strengths:**

-   Deep LangChain/LangGraph integration (first-party)
-   Built-in prompt playground and versioning
-   Hub for sharing and discovering prompts
-   Strong eval framework with human-in-the-loop
-   Excellent visualization of agent execution graphs

**Weaknesses:**

-   Vendor lock-in to LangChain ecosystem
-   Closed-source, hosted only (no self-hosting)
-   Pricing scales with trace volume (can get expensive)
-   Limited support for non-LangChain frameworks

### [](#langfuse)Langfuse

**Best for:** Teams who want open-source, framework-agnostic tracing  

```
// Langfuse v5+ integration (recommended: @langfuse/tracing)
import { observe } from '@langfuse/tracing';

// Decorator-based tracing (simplest approach)
const processQuery = observe(
  { name: 'flight-search-agent' },
  async (query: string) => {
    const intent = await classifyIntent(query);
    const results = await searchFlights(intent);
    return generateResponse(results);
  }
);

// Or use the classic Langfuse client for granular control:
import Langfuse from 'langfuse';

const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
});

const trace = langfuse.trace({
  name: 'flight-search-agent',
  userId: 'user-123',
  metadata: { environment: 'production' },
});

const generation = trace.generation({
  name: 'classify-intent',
  model: 'gpt-4.1-mini',
  input: [{ role: 'user', content: query }],
  output: response,
  usage: {
    promptTokens: 150,
    completionTokens: 30,
  },
});
```

 

**Strengths:**

-   Open-source (MIT license), self-hostable
-   Framework-agnostic (works with any LLM provider)
-   Built-in cost tracking and token analytics
-   Prompt management and versioning
-   Growing ecosystem of integrations
-   Generous free tier

**Weaknesses:**

-   Smaller community than LangSmith
-   Self-hosting requires infrastructure management
-   Evaluation features less mature than LangSmith
-   UI less polished (improving rapidly)

### [](#arize-phoenix)Arize Phoenix

**Best for:** Teams with ML/data science backgrounds who need deep analysis  

```
// Arize Phoenix integration
import { trace as otelTrace } from '@opentelemetry/api';
import { registerInstrumentations } from
  '@opentelemetry/instrumentation';
import { OpenAIInstrumentation } from
  '@arizeai/openinference-instrumentation-openai';

// Phoenix uses OpenTelemetry natively
registerInstrumentations({
  instrumentations: [new OpenAIInstrumentation()],
});
```

 

**Strengths:**

-   Built on OpenTelemetry (no proprietary lock-in)
-   Excellent embedding visualization and drift detection
-   Strong retrieval (RAG) analysis tools
-   Local-first development experience (Phoenix runs locally)
-   Best-in-class for debugging retrieval quality

**Weaknesses:**

-   Steeper learning curve
-   Less focus on agent orchestration tracing
-   Smaller ecosystem of direct integrations
-   Enterprise features require Arize cloud

### [](#comparison-matrix)Comparison Matrix

| Feature | LangSmith | Langfuse | Arize Phoenix |
| --- | --- | --- | --- |
| Open Source | ❌ | ✅ MIT | ✅ (Phoenix) |
| Self-Hosting | ❌ | ✅ | ✅ (Phoenix) |
| LangChain Integration | ⭐⭐⭐ | ⭐⭐ | ⭐ |
| Framework-Agnostic | ⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Cost Tracking | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Eval Framework | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ |
| RAG Analysis | ⭐⭐ | ⭐ | ⭐⭐⭐ |
| Prompt Management | ⭐⭐⭐ | ⭐⭐ | ⭐ |
| Embedding Analysis | ⭐ | ⭐ | ⭐⭐⭐ |
| Pricing (startup) | $$$ | Free/$ | Free/$ |

## [](#production-patterns-and-antipatterns)Production Patterns and Anti-Patterns

### [](#pattern-1-the-circuit-breaker)Pattern 1: The Circuit Breaker

Prevent runaway agents from burning through your budget:  

```
class AgentCircuitBreaker {
  private tokenCount = 0;
  private llmCalls = 0;
  private toolCalls = 0;
  private startTime: number;

  constructor(
    private limits: {
      maxTokens: number;
      maxLLMCalls: number;
      maxToolCalls: number;
      maxDurationMs: number;
    }
  ) {
    this.startTime = Date.now();
  }

  check(event: {
    type: 'llm' | 'tool';
    tokens?: number
  }) {
    if (event.type === 'llm') {
      this.llmCalls++;
      this.tokenCount += event.tokens || 0;
    } else {
      this.toolCalls++;
    }

    const elapsed = Date.now() - this.startTime;

    if (this.tokenCount > this.limits.maxTokens) {
      throw new CircuitBreakerError(
        `Token limit exceeded: ${this.tokenCount}`
      );
    }
    if (this.llmCalls > this.limits.maxLLMCalls) {
      throw new CircuitBreakerError(
        `LLM call limit exceeded: ${this.llmCalls}`
      );
    }
    if (this.toolCalls > this.limits.maxToolCalls) {
      throw new CircuitBreakerError(
        `Tool call limit exceeded: ${this.toolCalls}`
      );
    }
    if (elapsed > this.limits.maxDurationMs) {
      throw new CircuitBreakerError(
        `Duration limit exceeded: ${elapsed}ms`
      );
    }
  }
}

// Usage
const breaker = new AgentCircuitBreaker({
  maxTokens: 50000,
  maxLLMCalls: 20,
  maxToolCalls: 30,
  maxDurationMs: 60000, // 1 minute
});

// In your agent loop
for (const step of agentSteps) {
  breaker.check({
    type: step.type,
    tokens: step.tokenUsage,
  });
  await executeStep(step);
}
```

 

### [](#pattern-2-tracebased-debugging-workflow)Pattern 2: Trace-Based Debugging Workflow

When something breaks, follow this systematic approach:  

```
1. DETECT: Automated eval flags quality drop
   ↓
2. IDENTIFY: Filter traces by low eval scores
   ↓
3. COMPARE: Side-by-side with successful traces
   ↓
4. ISOLATE: Find the divergence point
   ↓
5. ROOT CAUSE: Examine inputs/outputs at that span
   ↓
6. FIX: Update prompt, context, or tool config
   ↓
7. VALIDATE: Run evals on the fix against test dataset
```

 

### [](#antipattern-1-logging-everything)Anti-Pattern 1: Logging Everything

Don't log every token of every request.  

```
// ❌ Don't do this
logger.info('LLM Response', {
  fullPrompt: systemPrompt + userMessage + context, // 50KB
  fullResponse: completion,                          // 10KB
  metadata: entireTraceObject,                       // 5KB
});
// Result: 65KB per request × 1M requests/day = 65GB/day

// ✅ Do this instead
logger.info('LLM Response', {
  traceId: trace.id,           // Link to detailed trace
  model: 'gpt-4.1-mini',
  tokensIn: 150,
  tokensOut: 30,
  cost: 0.0001,
  latencyMs: 200,
  evalScore: 0.95,
});
// Result: 200 bytes per request × 1M requests/day = 200MB/day
```

 

### [](#antipattern-2-treating-llm-errors-like-http-errors)Anti-Pattern 2: Treating LLM Errors Like HTTP Errors

```
// ❌ Misleading: HTTP 200 but agent response is terrible
if (response.status === 200) {
  metrics.increment('agent.success');
}

// ✅ Correct: Measure actual quality
const evalScore = await quickEval(response.body);
if (evalScore > 0.7) {
  metrics.increment('agent.quality.good');
} else {
  metrics.increment('agent.quality.poor');
  // This is the real "error" — trigger investigation
}
```

 

### [](#antipattern-3-no-baseline)Anti-Pattern 3: No Baseline

```
// ❌ Alert: "Eval score is 0.72" — Is that good? Bad?

// ✅ Establish baseline first
// Week 1-2: Collect eval scores without alerting
// Week 3: Calculate P50, P90, P99 baselines
// Week 4+: Alert on deviations from baseline
const baseline = {
  accuracy: { p50: 0.85, p90: 0.92, p99: 0.97 },
  relevance: { p50: 0.90, p90: 0.95, p99: 0.99 },
  latency:   { p50: 2000, p90: 5000, p99: 10000 },
};

function shouldAlert(
  dimension: string,
  value: number
): boolean {
  const b = baseline[dimension];
  return value < b.p50 * 0.8; // Alert if 20% below median
}
```

 

## [](#the-minimum-viable-observability-stack)The Minimum Viable Observability Stack

If you're starting from scratch, here's the fastest path to production-grade observability:

### [](#day-1-basic-instrumentation)Day 1: Basic Instrumentation

```
// 1. Install Langfuse (fastest to get started)
// npm install langfuse

import Langfuse from 'langfuse';

const langfuse = new Langfuse();

// 2. Wrap your agent's main function
async function runAgent(query: string, userId: string) {
  const trace = langfuse.trace({
    name: 'agent-run',
    userId,
    input: query,
  });

  // Your existing agent code here...

  trace.update({ output: response });
  await langfuse.flushAsync();
}
```

 

### [](#week-1-add-cost-tracking)Week 1: Add Cost Tracking

```
// Track costs on every LLM call
const generation = trace.generation({
  name: 'main-llm-call',
  model: 'gpt-4.1-mini',
  input: messages,
  output: completion,
  usage: {
    promptTokens: usage.prompt_tokens,
    completionTokens: usage.completion_tokens,
  },
  // Langfuse auto-calculates cost from token counts
});
```

 

### [](#week-2-add-deterministic-guards)Week 2: Add Deterministic Guards

```
// Add the circuit breaker from Pattern 1
// Add empty-response detection
// Add loop detection
// Set up Slack/PagerDuty alerts for guard violations
```

 

### [](#week-4-add-llmasjudge-evals)Week 4: Add LLM-as-Judge Evals

```
// Run on 10% of production traces
// Start with two dimensions: accuracy + relevance
// Establish baselines before activating alerts
```

 

### [](#month-2-graduate-to-full-stack)Month 2: Graduate to Full Stack

```
Langfuse (Tracing + Cost)
  + Custom Eval Pipeline (Quality)
  + Grafana/Datadog (Infrastructure)
  + PagerDuty (Alerting)
```

 

## [](#the-llm-observability-checklist)The LLM Observability Checklist

Before every production deployment of an AI feature:

-   \[ \] Every LLM call is instrumented with trace context
-   \[ \] Token counts and model names are captured on every call
-   \[ \] Tool calls have input/output logging
-   \[ \] Cost tracking is active at per-request and per-user levels
-   \[ \] Circuit breaker limits are set (tokens, calls, duration)
-   \[ \] Deterministic guards are running on 100% of traces
-   \[ \] LLM-as-Judge evals are running on sampled traces
-   \[ \] Baselines are established for quality metrics
-   \[ \] Alerts are configured for guard violations and quality drops
-   \[ \] Full prompt/completion logging uses sampling, not 100% capture
-   \[ \] PII scrubbing is applied before logging prompts
-   \[ \] Dashboard shows real-time cost, quality, and latency trends
-   \[ \] Trace retention policy is defined (30-90 days typical)

AI agents are not deterministic software. Monitoring them like traditional APIs will give you a false sense of security until the day they quietly go haywire and you have no way to figure out why. The observability patterns in this guide have been battle-tested across production systems handling millions of agent interactions daily. The core insight is simple: if you can't trace the reasoning, you can't debug the failure. Instrument everything, evaluate continuously, and never trust a green dashboard when your agent's output quality hasn't been measured.

---

> 🔒 **Privacy First:** This article was originally published on the [Pockit Blog](https://pockit.tools/blog/llm-observability-tracing-monitor-ai-agents-production-guide/).
> 
> Stop sending your data to random servers. Use [Pockit.tools](https://pockit.tools/json-formatter/) for secure utilities, or **[install the Chrome Extension](https://chromewebstore.google.com/detail/pockit-developer-tools-pd/lojcamfhllebjmcjmipecgecbeopookg)** to keep your files 100% private and offline.
