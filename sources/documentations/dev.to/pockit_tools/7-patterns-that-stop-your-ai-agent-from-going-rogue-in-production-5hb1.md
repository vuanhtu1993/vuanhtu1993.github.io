---
title: "7 Patterns That Stop Your AI Agent From Going Rogue in Production"
source_url: "https://dev.to/pockit_tools/7-patterns-that-stop-your-ai-agent-from-going-rogue-in-production-5hb1"
crawled_at: "2026-08-07T09:31:00.014Z"
---

Your AI agent works flawlessly in development. It passes every test, handles your demo scenarios perfectly, and impresses stakeholders in the sprint review. Then you deploy it. Within 48 hours, it burns $400 in API costs processing a recursive loop, emails a customer their neighbor's personal data, and confidently generates a SQL query that drops an index on your production database.

This isn't hypothetical. It's a pattern playing out across the industry in 2026. The gap between "demo-ready" and "production-ready" AI agents is wider than most teams realize, and the failure modes are fundamentally different from traditional software. Your REST API doesn't decide to answer a different question than the one it was asked. Your database driver doesn't hallucinate a table name. But your AI agent does both, and it does them with absolute confidence.

This guide covers seven battle-tested patterns for keeping AI agents reliable in production. These aren't theoretical frameworks — they're extracted from real incident post-mortems, production outages, and hard-won lessons from teams running agents at scale.

---

## [](#pattern-1-the-circuit-breaker)Pattern 1: The Circuit Breaker

Traditional software uses circuit breakers to prevent cascading failures when downstream services go down. AI agents need them too, but with a twist: you're not just protecting against HTTP 500s. You're protecting against a model that starts returning garbage.

### [](#why-agents-need-circuit-breakers)Why Agents Need Circuit Breakers

An AI agent that calls a failing tool doesn't crash. It retries. And retries. And since it's "intelligent," it might try slightly different approaches each time — all of which fail, all of which cost tokens. Without a circuit breaker, a single broken tool can burn your entire daily API budget in minutes.

### [](#implementation)Implementation

```
class AgentCircuitBreaker {
  private failures: Map<string, { count: number; lastFailure: number }> = new Map();
  private readonly threshold = 5;        // failures before opening
  private readonly resetTimeout = 60000; // 1 minute cooldown

  async callTool(toolName: string, fn: () => Promise<any>): Promise<any> {
    const state = this.failures.get(toolName) || { count: 0, lastFailure: 0 };

    // Check if circuit is open
    if (state.count >= this.threshold) {
      const elapsed = Date.now() - state.lastFailure;
      if (elapsed < this.resetTimeout) {
        throw new CircuitOpenError(
          `Tool "${toolName}" is temporarily disabled. ` +
          `${Math.ceil((this.resetTimeout - elapsed) / 1000)}s until retry.`
        );
      }
      // Half-open: allow one attempt
      state.count = this.threshold - 1;
    }

    try {
      const result = await fn();
      // Success: reset failures
      this.failures.set(toolName, { count: 0, lastFailure: 0 });
      return result;
    } catch (error) {
      state.count++;
      state.lastFailure = Date.now();
      this.failures.set(toolName, state);
      throw error;
    }
  }
}
```

 

### [](#the-key-insight)The Key Insight

When the circuit opens, **feed the error back to the agent as context**. Don't just throw an exception — tell the model that the tool is unavailable and suggest alternatives:  

```
if (error instanceof CircuitOpenError) {
  return {
    role: 'tool',
    content: `The ${toolName} service is temporarily unavailable (circuit breaker open). ` +
             `Please inform the user that this feature is temporarily down, ` +
             `or try an alternative approach that doesn't require this tool.`
  };
}
```

 

This turns a hard failure into a graceful degradation. The agent can apologize to the user, suggest a workaround, or skip that step entirely — instead of silently looping.

---

## [](#pattern-2-retryclassify-dont-retry-blindly)Pattern 2: Retry-Classify (Don't Retry Blindly)

The naive retry pattern — "if it fails, try the exact same thing again" — is actively harmful with AI agents. If the model generated a malformed API call, retrying the same prompt will likely generate the same malformed call. You're paying double for the same failure.

### [](#the-retryclassify-pattern)The Retry-Classify Pattern

Instead of blind retries, classify the error first and route to the appropriate recovery strategy:  

```
class RetryClassifier:
    def classify(self, error: Exception, tool_name: str) -> RetryStrategy:
        if isinstance(error, RateLimitError):
            return RetryStrategy.BACKOFF      # Wait and retry same request

        if isinstance(error, ValidationError):
            return RetryStrategy.REPAIR       # Feed error to LLM, ask it to fix

        if isinstance(error, AuthenticationError):
            return RetryStrategy.FAIL_FAST    # Don't retry, escalate immediately

        if isinstance(error, TimeoutError):
            return RetryStrategy.BACKOFF      # Likely transient

        if isinstance(error, ToolNotFoundError):
            return RetryStrategy.FALLBACK     # Try alternative tool

        return RetryStrategy.FAIL_FAST        # Unknown errors: don't retry

async def execute_with_retry(agent, action, max_retries=3):
    classifier = RetryClassifier()

    for attempt in range(max_retries):
        try:
            return await agent.execute(action)
        except Exception as e:
            strategy = classifier.classify(e, action.tool_name)

            if strategy == RetryStrategy.FAIL_FAST:
                raise  # Don't waste tokens

            if strategy == RetryStrategy.BACKOFF:
                wait = (2 ** attempt) + random.uniform(0, 1)  # Exponential + jitter
                await asyncio.sleep(wait)
                continue

            if strategy == RetryStrategy.REPAIR:
                # Feed error to LLM and ask it to fix
                action = await agent.repair_action(action, error=str(e))
                continue

            if strategy == RetryStrategy.FALLBACK:
                action = agent.get_fallback_action(action)
                continue

    raise MaxRetriesExceeded(f"Failed after {max_retries} attempts")
```

 

### [](#the-repair-strategy-in-detail)The Repair Strategy in Detail

The `REPAIR` strategy is where things get interesting. Instead of retrying the same prompt, you feed the error message back to the model as additional context:  

```
async def repair_action(self, failed_action, error: str):
    repair_prompt = f"""Your previous tool call failed with this error:

Tool: {failed_action.tool_name}
Input: {json.dumps(failed_action.input)}
Error: {error}

Analyze the error and generate a corrected tool call.
Do NOT repeat the exact same input that caused the failure."""

    corrected = await self.llm.generate(repair_prompt)
    return corrected
```

 

This pattern resolves a significant share of validation errors on the first repair attempt. Wrong date formats, missing required fields, out-of-range values — these are exactly the kind of structured errors that models can self-correct when shown the specific error message. In practice, teams report repair success rates well above 50% for schema-level failures.

---

## [](#pattern-3-budget-governors)Pattern 3: Budget Governors

The scariest AI agent failure isn't a crash — it's a runaway cost spiral. An agent stuck in a reasoning loop can burn through hundreds of dollars in API costs before anyone notices. Budget governors are hard limits that prevent this.

### [](#three-layers-of-budget-control)Three Layers of Budget Control

```
interface BudgetConfig {
  maxTokensPerRequest: number;      // Single LLM call limit
  maxTokensPerSession: number;      // Entire conversation limit
  maxToolCallsPerSession: number;   // Prevent infinite tool loops
  maxCostPerSession: number;        // Dollar amount ceiling
  maxDurationSeconds: number;       // Wall-clock timeout
}

class BudgetGovernor {
  private usage = { tokens: 0, toolCalls: 0, cost: 0, startTime: Date.now() };

  check(config: BudgetConfig): void {
    if (this.usage.tokens > config.maxTokensPerSession) {
      throw new BudgetExceededError('Token budget exceeded');
    }
    if (this.usage.toolCalls > config.maxToolCallsPerSession) {
      throw new BudgetExceededError('Tool call limit exceeded — possible infinite loop');
    }
    if (this.usage.cost > config.maxCostPerSession) {
      throw new BudgetExceededError(`Cost ceiling hit: $${this.usage.cost.toFixed(2)}`);
    }
    const elapsed = (Date.now() - this.usage.startTime) / 1000;
    if (elapsed > config.maxDurationSeconds) {
      throw new BudgetExceededError(`Session timeout: ${elapsed.toFixed(0)}s`);
    }
  }

  recordUsage(tokens: number, cost: number, isToolCall: boolean): void {
    this.usage.tokens += tokens;
    this.usage.cost += cost;
    if (isToolCall) this.usage.toolCalls++;
  }
}
```

 

### [](#setting-the-right-limits)Setting the Right Limits

Limits that are too tight will break legitimate workflows. Limits that are too loose won't prevent real damage. Here's how to calibrate:

| Budget Type | Development | Staging | Production |
| --- | --- | --- | --- |
| Tokens per session | 50,000 | 30,000 | 20,000 |
| Tool calls per session | 50 | 25 | 15 |
| Cost per session | $5.00 | $2.00 | $0.50 |
| Timeout | 5 min | 3 min | 2 min |

Start restrictive in production and loosen based on actual usage data. It's far easier to increase limits than to explain a $2,000 surprise bill.

### [](#the-stuck-detection-pattern)The "Stuck Detection" Pattern

Budget limits catch runaway agents, but you can detect the problem earlier by looking for repetitive behavior:  

```
def detect_stuck_agent(tool_call_history: list[str], window: int = 5) -> bool:
    """Detect if agent is repeatedly calling the same tool without progress."""
    if len(tool_call_history) < window:
        return False

    recent = tool_call_history[-window:]
    # If >80% of recent calls are the same tool, agent is likely stuck
    most_common = max(set(recent), key=recent.count)
    return recent.count(most_common) / len(recent) >= 0.8
```

 

When stuck behavior is detected, inject a meta-prompt:  

```
You appear to be repeating the same action without making progress. 
Stop and reconsider your approach. 
Either try a completely different strategy or inform the user 
that you cannot complete this specific task.
```

 

---

## [](#pattern-4-output-guardrails)Pattern 4: Output Guardrails

The model will eventually generate something it shouldn't. PII in a customer-facing response. An SQL statement in a webhook payload. A hallucinated URL that leads to a phishing site. Output guardrails are your last line of defense before the agent's output reaches the user or an external system.

### [](#the-guardrail-pipeline)The Guardrail Pipeline

Run every agent output through a validation pipeline before it leaves your system:  

```
interface Guardrail {
  name: string;
  check(output: string, context: AgentContext): GuardrailResult;
}

class GuardrailPipeline {
  private guardrails: Guardrail[] = [];

  async validate(output: string, context: AgentContext): Promise<string> {
    for (const guardrail of this.guardrails) {
      const result = guardrail.check(output, context);

      if (result.action === 'BLOCK') {
        throw new GuardrailViolation(guardrail.name, result.reason);
      }
      if (result.action === 'REDACT') {
        output = result.redactedOutput;  // Replace sensitive content
      }
      if (result.action === 'FLAG') {
        await this.alertOncall(guardrail.name, output, result.reason);
        // Continue but notify the team
      }
    }
    return output;
  }
}
```

 

### [](#essential-guardrails-for-production)Essential Guardrails for Production

**1\. PII Detection**  

```
const piiGuardrail: Guardrail = {
  name: 'pii-detector',
  check(output: string): GuardrailResult {
    const patterns = {
      ssn: /\b\d{3}-\d{2}-\d{4}\b/,
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
      phone: /\b(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}\b/,
      creditCard: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/,
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(output)) {
        return {
          action: 'REDACT',
          reason: `Detected ${type} in output`,
          redactedOutput: output.replace(pattern, `[REDACTED_${type.toUpperCase()}]`)
        };
      }
    }
    return { action: 'PASS' };
  }
};
```

 

**2\. Code Injection Prevention**  

```
const codeInjectionGuardrail: Guardrail = {
  name: 'code-injection',
  check(output: string, context: AgentContext): GuardrailResult {
    // Block if agent tries to return executable code in a text response
    const dangerousPatterns = [
      /DROP\s+TABLE/i, /DELETE\s+FROM/i, /UPDATE\s+.*SET/i,
      /<script\b[^>]*>/i,
      /eval\s*\(/i, /exec\s*\(/i,
      /rm\s+-rf/i
    ];

    if (context.responseType === 'user-facing') {
      for (const pattern of dangerousPatterns) {
        if (pattern.test(output)) {
          return { action: 'BLOCK', reason: `Dangerous pattern detected: ${pattern}` };
        }
      }
    }
    return { action: 'PASS' };
  }
};
```

 

**3\. Hallucination Anchor**  

```
const groundednessGuardrail: Guardrail = {
  name: 'groundedness',
  check(output: string, context: AgentContext): GuardrailResult {
    // If the agent references URLs, verify they exist in the source context
    const urls = output.match(/https?:\/\/[^\s)]+/g) || [];
    const sourceUrls = context.retrievedDocuments.flatMap(d => 
      d.content.match(/https?:\/\/[^\s)]+/g) || []
    );

    const fabricatedUrls = urls.filter(url => !sourceUrls.includes(url));
    if (fabricatedUrls.length > 0) {
      return {
        action: 'FLAG',
        reason: `Potentially fabricated URLs: ${fabricatedUrls.join(', ')}`
      };
    }
    return { action: 'PASS' };
  }
};
```

 

---

## [](#pattern-5-the-kill-switch)Pattern 5: The Kill Switch

Every production AI agent needs an emergency stop mechanism. Not "gracefully wind down over the next few minutes" — an immediate, hard stop that halts all agent activity across all instances.

### [](#why-you-need-it)Why You Need It

Kill switches aren't for normal error handling. They're for scenarios like:

-   The agent starts sending inappropriate content to customers
-   A prompt injection attack is actively being exploited
-   The agent is making unauthorized changes to production data
-   Cost is spiraling and budget governors aren't catching it (misconfigured limits)

### [](#implementation-feature-flag-remote-config)Implementation: Feature Flag + Remote Config

The simplest and most reliable kill switch is a feature flag:  

```
class AgentKillSwitch {
  // Check before EVERY agent action
  async checkBeforeAction(agentId: string): Promise<void> {
    // Remote config check (cached with 5s TTL)
    const config = await this.getRemoteConfig();

    if (config.globalKillSwitch) {
      throw new AgentHaltedError('All agents halted by global kill switch');
    }

    if (config.disabledAgents.includes(agentId)) {
      throw new AgentHaltedError(`Agent ${agentId} halted by targeted kill switch`);
    }

    // Check against real-time abuse signals
    if (await this.abuseDetector.isCompromised(agentId)) {
      await this.activateKillSwitch(agentId, 'Automated: abuse detected');
      throw new AgentHaltedError('Agent halted: abuse pattern detected');
    }
  }

  async activateKillSwitch(agentId: string, reason: string): Promise<void> {
    await this.remoteConfig.set(`agents.${agentId}.killed`, true);
    await this.alerting.sendPagerDutyAlert({
      severity: 'critical',
      summary: `Agent ${agentId} kill switch activated: ${reason}`,
    });
    await this.auditLog.record('KILL_SWITCH_ACTIVATED', { agentId, reason });
  }
}
```

 

### [](#the-critical-rule)The Critical Rule

The kill switch check must happen **before every LLM call and every tool execution** — not just at the start of a session. An agent session that started before the kill switch was activated must still be stopped mid-execution.  

```
// In the main agent loop
while (hasMoreSteps) {
  await killSwitch.checkBeforeAction(this.agentId);  // <-- EVERY iteration

  const response = await llm.chat(messages);

  await killSwitch.checkBeforeAction(this.agentId);  // <-- After LLM, before tool

  if (response.toolCalls) {
    for (const call of response.toolCalls) {
      await killSwitch.checkBeforeAction(this.agentId);  // <-- Before each tool
      await executeTool(call);
    }
  }
}
```

 

---

## [](#pattern-6-observability-and-tracing)Pattern 6: Observability and Tracing

You can't fix what you can't see. And AI agents are notoriously opaque — the same input can produce different reasoning chains, different tool call sequences, and different outputs. Traditional application monitoring (response times, error rates) tells you almost nothing about why an agent failed.

### [](#what-to-trace)What to Trace

Every agent execution should produce a structured trace:  

```
interface AgentTrace {
  traceId: string;
  sessionId: string;
  timestamp: string;

  // The full chain of reasoning
  steps: AgentStep[];

  // Aggregated metrics
  metrics: {
    totalTokens: number;
    totalCost: number;
    totalDuration: number;
    toolCallCount: number;
    retryCount: number;
    guardrailTriggered: boolean;
  };

  // Final outcome
  outcome: 'success' | 'failure' | 'timeout' | 'killed' | 'budget_exceeded';
  error?: string;
}

interface AgentStep {
  stepIndex: number;
  type: 'llm_call' | 'tool_call' | 'guardrail_check';

  // For LLM calls
  inputTokens?: number;
  outputTokens?: number;
  model?: string;

  // For tool calls
  toolName?: string;
  toolInput?: Record<string, any>;
  toolOutput?: string;
  toolDuration?: number;

  // For guardrails
  guardrailName?: string;
  guardrailAction?: 'PASS' | 'BLOCK' | 'REDACT' | 'FLAG';

  duration: number;
  error?: string;
}
```

 

### [](#the-three-dashboards-you-need)The Three Dashboards You Need

**1\. Real-time Operations Dashboard**

| Metric | What It Tells You |
| --- | --- |
| Active sessions | How many agents are running right now |
| Error rate (5 min window) | Whether something just broke |
| P95 latency | User experience degradation |
| Cost per minute | Budget burn rate |
| Circuit breaker status | Which tools are failing |

**2\. Quality Dashboard (Daily)**

| Metric | What It Tells You |
| --- | --- |
| Task completion rate | Are agents actually solving problems |
| Guardrail trigger rate | How often the model misbehaves |
| Retry rate per tool | Which integrations are flaky |
| Average steps per task | Whether prompts need optimization |
| User satisfaction (if available) | The only metric that ultimately matters |

**3\. Incident Investigation View**

When something goes wrong, you need to replay the exact sequence: Every message, every LLM response, every tool call input/output, every guardrail check. Store traces for at least 30 days. When an incident happens, this trace is your forensic evidence.

### [](#practical-tip-log-the-prompt-not-just-the-response)Practical Tip: Log the Prompt, Not Just the Response

Most teams log LLM responses but not the full prompt that was sent. This makes debugging impossible. Log the complete prompt (system message + conversation history + tool definitions) for every LLM call. Yes, it's verbose. Yes, it costs storage. It will save you hours of debugging when things go wrong.

---

## [](#pattern-7-humanintheloop-approval-gates)Pattern 7: Human-in-the-Loop Approval Gates

Full autonomy is a goal, not a starting point. The most reliable production agents use tiered authorization — the agent can do low-risk things autonomously, but high-risk actions require human approval.

### [](#defining-risk-tiers)Defining Risk Tiers

```
enum RiskTier {
  LOW = 'low',       // Autonomous: read data, search, generate text
  MEDIUM = 'medium', // Notify: send emails, update records, modify configs
  HIGH = 'high',     // Approve: delete data, financial transactions, external API writes
  CRITICAL = 'critical', // Multi-approve: schema changes, access control, bulk operations
}

const toolRiskMap: Record<string, RiskTier> = {
  'search_documents': RiskTier.LOW,
  'generate_summary': RiskTier.LOW,
  'send_email': RiskTier.MEDIUM,
  'update_customer_record': RiskTier.MEDIUM,
  'delete_records': RiskTier.HIGH,
  'execute_sql': RiskTier.HIGH,
  'modify_billing': RiskTier.CRITICAL,
  'update_permissions': RiskTier.CRITICAL,
};
```

 

### [](#the-approval-flow)The Approval Flow

```
async function executeWithApproval(
  agent: Agent, 
  toolCall: ToolCall, 
  context: AgentContext
): Promise<ToolResult> {
  const risk = toolRiskMap[toolCall.name] || RiskTier.HIGH; // Default to HIGH

  switch (risk) {
    case RiskTier.LOW:
      return await executeTool(toolCall);

    case RiskTier.MEDIUM:
      // Execute but notify
      const result = await executeTool(toolCall);
      await notifyTeam(toolCall, result, context);
      return result;

    case RiskTier.HIGH:
      // Pause and wait for approval
      const approval = await requestApproval({
        toolCall,
        context,
        timeout: 300_000, // 5 minute timeout
      });

      if (approval.approved) {
        return await executeTool(toolCall);
      } else {
        return {
          role: 'tool',
          content: `Action was denied by reviewer: ${approval.reason}. ` +
                   `Please inform the user and suggest an alternative.`
        };
      }

    case RiskTier.CRITICAL:
      // Requires two independent approvals
      const approvals = await requestMultiApproval({
        toolCall,
        context,
        requiredApprovals: 2,
        timeout: 600_000, // 10 minute timeout
      });

      if (approvals.every(a => a.approved)) {
        return await executeTool(toolCall);
      } else {
        return { role: 'tool', content: 'Action requires additional approval.' };
      }
  }
}
```

 

### [](#the-practical-reality)The Practical Reality

Human-in-the-loop creates latency. A senior engineer reviewing an approval request takes 2-5 minutes. During that time, the agent is paused, the user is waiting, and resources are held open.

Mitigate this by:

1.  **Pre-approving common patterns.** If the same tool call with similar parameters gets approved 20 times, auto-approve it going forward
2.  **Batching approvals.** Group related high-risk actions into a single review ("The agent wants to update 3 customer records and send 2 emails — approve all?")
3.  **Async workflows.** For non-urgent tasks, let the agent queue the action and notify the user when it's approved and completed
4.  **Progressive trust.** Start with HITL for everything, then systematically lower the risk tier for specific tools as you gain confidence in the agent's reliability

---

## [](#putting-it-all-together-the-reliability-stack)Putting It All Together: The Reliability Stack

These seven patterns form layers of defense. No single pattern is sufficient; reliability comes from the combination:  

```
┌─────────────────────────────────────────┐
│          Human-in-the-Loop              │  ← High-risk actions gated
├─────────────────────────────────────────┤
│          Output Guardrails              │  ← PII, injection, hallucination
├─────────────────────────────────────────┤
│          Budget Governors               │  ← Cost, tokens, time, tool calls
├─────────────────────────────────────────┤
│          Kill Switch                    │  ← Emergency stop
├─────────────────────────────────────────┤
│          Circuit Breakers               │  ← Tool failure isolation
├─────────────────────────────────────────┤
│          Retry-Classify                 │  ← Intelligent error recovery
├─────────────────────────────────────────┤
│          Observability                  │  ← Full trace of every decision
└─────────────────────────────────────────┘
```

 

### [](#the-implementation-order)The Implementation Order

Don't try to ship all seven at once. Implement in this order based on risk-to-effort ratio:

1.  **Budget Governors** (Day 1) — Prevents financial damage immediately
2.  **Kill Switch** (Day 1) — Your emergency brake, even if you never use it
3.  **Observability** (Week 1) — You can't improve what you can't measure
4.  **Output Guardrails** (Week 1-2) — Stop bad content from reaching users
5.  **Circuit Breakers** (Week 2) — Isolate tool failures
6.  **Retry-Classify** (Week 2-3) — Improve success rates
7.  **Human-in-the-Loop** (Week 3-4) — Adds trust for high-stakes actions

### [](#the-2026-reality)The 2026 Reality

The AI agent ecosystem is maturing fast. Frameworks like LangGraph, CrewAI, and the Agents SDKs from OpenAI and Google are adding more built-in reliability primitives. But they're not enough on their own. Framework defaults are permissive — they're designed to make demos easy, not to keep production systems safe.

Your agent will eventually do something unexpected. The question isn't "if" but "when," and whether your reliability stack catches it before it reaches a user, a database, or a billing system.

The best AI agents aren't the smartest ones. They're the ones that fail gracefully.

---

> ⚡ **Speed Tip:** Read the original post on the [Pockit Blog](https://pockit.tools/blog/ai-agent-reliability-production-guardrails-error-recovery-guide/).
> 
> Tired of slow cloud tools? [Pockit.tools](https://pockit.tools/json-formatter/) runs entirely in your browser. **[Get the Extension](https://chromewebstore.google.com/detail/pockit-developer-tools-pd/lojcamfhllebjmcjmipecgecbeopookg)** now for instant, zero-latency access to essential dev tools.
