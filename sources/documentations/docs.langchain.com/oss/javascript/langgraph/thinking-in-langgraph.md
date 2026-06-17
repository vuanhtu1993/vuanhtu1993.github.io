---
title: "Thinking in LangGraph - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/langgraph/thinking-in-langgraph"
crawled_at: "2026-06-17T14:41:32.012Z"
---

When you build an agent with LangGraph, you will first break it apart into discrete steps called **nodes**. Then, you will describe the different decisions and transitions from each of your nodes. Finally, you connect nodes together through a shared **state** that each node can read from and write to. In this walkthrough, we’ll guide you through the thought process of building a customer support email agent with LangGraph.

## Start with the process you want to automate

Imagine that you need to build an AI agent that handles customer support emails. Your product team has given you these requirements:

```
The agent should:

- Read incoming customer emails
- Classify them by urgency and topic
- Search relevant documentation to answer questions
- Draft appropriate responses
- Escalate complex issues to human agents
- Schedule follow-ups when needed

Example scenarios to handle:

1. Simple product question: "How do I reset my password?"
2. Bug report: "The export feature crashes when I select PDF format"
3. Urgent billing issue: "I was charged twice for my subscription!"
4. Feature request: "Can you add dark mode to the mobile app?"
5. Complex technical issue: "Our API integration fails intermittently with 504 errors"
```

To implement an agent in LangGraph, you will usually follow the same five steps.

## Step 1: Map out your workflow as discrete steps

Start by identifying the distinct steps in your process. Each step will become a **node** (a function that does one specific thing). Then, sketch how these steps connect to each other.

The arrows in this diagram show possible paths, but the actual decision of which path to take happens inside each node. Now that we’ve identified the components in our workflow, let’s understand what each node needs to do:

-   `Read Email`: Extract and parse the email content
-   `Classify Intent`: Use an LLM to categorize urgency and topic, then route to appropriate action
-   `Doc Search`: Query your knowledge base for relevant information
-   `Bug Track`: Create or update issue in tracking system
-   `Draft Reply`: Generate an appropriate response
-   `Human Review`: Escalate to human agent for approval or handling
-   `Send Reply`: Dispatch the email response

## Step 2: Identify what each step needs to do

For each node in your graph, determine what type of operation it represents and what context it needs to work properly.

### LLM steps

When a step needs to understand, analyze, generate text, or make reasoning decisions:

### Data steps

When a step needs to retrieve information from external sources:

### Action steps

When a step needs to perform an external action:

### User input steps

When a step needs human intervention:

## Step 3: Design your state

State is the shared [memory](https://docs.langchain.com/oss/javascript/concepts/memory) accessible to all nodes in your agent. Think of it as the notebook your agent uses to keep track of everything it learns and decides as it works through the process.

### What belongs in state?

Ask yourself these questions about each piece of data:

For our email agent, we need to track:

-   The original email and sender info (can’t reconstruct these later)
-   Classification results (needed by multiple later/downstream nodes)
-   Search results and customer data (expensive to re-fetch)
-   The draft response (needs to persist through review)
-   Execution metadata (for debugging and recovery)

### Keep state raw, format prompts on-demand

This separation means:

-   Different nodes can format the same data differently for their needs
-   You can change prompt templates without modifying your state schema
-   Debugging is clearer—you see exactly what data each node received
-   Your agent can evolve without breaking existing state

Let’s define our state:

```
import { StateSchema } from "@langchain/langgraph";
import * as z from "zod";

// Define the structure for email classification
const EmailClassificationSchema = z.object({
  intent: z.enum(["question", "bug", "billing", "feature", "complex"]),
  urgency: z.enum(["low", "medium", "high", "critical"]),
  topic: z.string(),
  summary: z.string(),
});

const EmailAgentState = new StateSchema({
  // Raw email data
  emailContent: z.string(),
  senderEmail: z.string(),
  emailId: z.string(),

  // Classification result
  classification: EmailClassificationSchema.optional(),

  // Raw search/API results
  searchResults: z.array(z.string()).optional(),  // List of raw document chunks
  customerHistory: z.record(z.string(), z.any()).optional(),  // Raw customer data from CRM

  // Generated content
  responseText: z.string().optional(),
});

type EmailClassificationType = z.infer<typeof EmailClassificationSchema>;
```

Notice that the state contains only raw data—no prompt templates, no formatted strings, no instructions. The classification output is stored as a single dictionary, straight from the LLM.

## Step 4: Build your nodes

Now we implement each step as a function. A node in LangGraph is just a JavaScript function that takes the current state and returns updates to it.

### Handle errors appropriately

Different errors need different handling strategies:

| Error Type | Who Fixes It | Strategy | When to Use |
| --- | --- | --- | --- |
| Transient errors (network issues, rate limits) | System (automatic) | Retry policy | Temporary failures that usually resolve on retry |
| LLM-recoverable errors (tool failures, parsing issues) | LLM | Store error in state and loop back | LLM can see the error and adjust its approach |
| User-fixable errors (missing information, unclear instructions) | Human | Pause with `interrupt()` | Need user input to proceed |
| Recoverable failure after retries | Developer (declarative) | `error_handler` | Run a compensation/recovery branch after retry exhaustion |
| Unexpected errors | Developer | Let them bubble up | Unknown issues that need debugging |

-   Transient errors
    
-   LLM-recoverable
    
-   User-fixable
    
-   Unexpected
    
-   Saga / compensation
    

Add a retry policy to automatically retry network issues and rate limits.

```
import type { RetryPolicy } from "@langchain/langgraph";

workflow.addNode(
  "searchDocumentation",
  searchDocumentation,
  {
    retryPolicy: { maxAttempts: 3, initialInterval: 1.0 },
  },
);
```

Store the error in state and loop back so the LLM can see what went wrong and try again:

```
import { Command, GraphNode } from "@langchain/langgraph";

const executeTool: GraphNode<typeof State> = async (state, config) => {
  try {
    const result = await runTool(state.toolCall);
    return new Command({
      update: { toolResult: result },
      goto: "agent",
    });
  } catch (error) {
    // Let the LLM see what went wrong and try again
    return new Command({
      update: { toolResult: `Tool error: ${error}` },
      goto: "agent"
    });
  }
}
```

Pause and collect information from the user when needed (like account IDs, order numbers, or clarifications):

```
import { Command, GraphNode, interrupt } from "@langchain/langgraph";

const lookupCustomerHistory: GraphNode<typeof State> = async (state, config) => {
  if (!state.customerId) {
    const userInput = interrupt({
      message: "Customer ID needed",
      request: "Please provide the customer's account ID to look up their subscription history",
    });
    return new Command({
      update: { customerId: userInput.customerId },
      goto: "lookupCustomerHistory",
    });
  }
  // Now proceed with the lookup
  const customerData = await fetchCustomerHistory(state.customerId);
  return new Command({
    update: { customerHistory: customerData },
    goto: "draftResponse",
  });
}
```

Let them bubble up for debugging. Don’t catch what you can’t handle:

```
import { Command, GraphNode } from "@langchain/langgraph";

const sendReply: GraphNode<typeof EmailAgentState> = async (state, config) => {
  try {
    await emailService.send(state.responseText);
  } catch (error) {
    throw error;  // Surface unexpected errors
  }
}
```

After retries are exhausted, run a recovery function that updates state and routes to a compensation branch.

### Implementing our email agent nodes

We’ll implement each node as a simple function. Remember: nodes take state, do work, and return updates.

## Step 5: Wire it together

Now we connect our nodes into a working graph. Since our nodes handle their own routing decisions, we only need a few essential edges. To enable [human-in-the-loop](https://docs.langchain.com/oss/javascript/langgraph/interrupts) with `interrupt()`, we need to compile with a [checkpointer](https://docs.langchain.com/oss/javascript/langgraph/persistence) to save state between runs:

Graph compilation code

```
import { MemorySaver, RetryPolicy } from "@langchain/langgraph";

// Create the graph
const workflow = new StateGraph(EmailAgentState)
  // Add nodes with appropriate error handling
  .addNode("readEmail", readEmail)
  .addNode("classifyIntent", classifyIntent)
  // Add retry policy for nodes that might have transient failures
  .addNode(
    "searchDocumentation",
    searchDocumentation,
    { retryPolicy: { maxAttempts: 3 } },
  )
  .addNode("bugTracking", bugTracking)
  .addNode("draftResponse", draftResponse)
  .addNode("humanReview", humanReview)
  .addNode("sendReply", sendReply)
  // Add only the essential edges
  .addEdge(START, "readEmail")
  .addEdge("readEmail", "classifyIntent")
  .addEdge("sendReply", END);

// Compile with checkpointer for persistence
const memory = new MemorySaver();
const app = workflow.compile({ checkpointer: memory });
```

The graph structure is minimal because routing happens inside nodes through `Command` objects. Each node declares where it can go, making the flow explicit and traceable.

### Try out your agent

Let’s run our agent with an urgent billing issue that needs human review:

Testing the agent

```
// Test with an urgent billing issue
const initialState: EmailAgentStateType = {
  emailContent: "I was charged twice for my subscription! This is urgent!",
  senderEmail: "customer@example.com",
  emailId: "email_123"
};

// Run with a thread_id for persistence
const config = { configurable: { thread_id: "customer_123" } };
const result = await app.invoke(initialState, config);
// The graph will pause at human_review
console.log(`Draft ready for review: ${result.responseText?.substring(0, 100)}...`);
```

```
import { Command } from "@langchain/langgraph";

// When ready, provide human input to resume
const humanResponse = new Command({
  resume: {
    approved: true,
    editedResponse: "We sincerely apologize for the double charge. I've initiated an immediate refund...",
  }
});

// Resume execution
const finalResult = await app.invoke(humanResponse, config);
console.log("Email sent successfully!");
```

The graph pauses when it hits `interrupt()`, saves everything to the checkpointer, and waits. It can resume days later, picking up exactly where it left off. The `thread_id` ensures all state for this conversation is preserved together.

## Summary and next steps

### Key Insights

Building this email agent has shown us the LangGraph way of thinking:

### Advanced considerations

Node granularity trade-offs

You might wonder: why not combine `Read Email` and `Classify Intent` into one node?Or why separate Doc Search from Draft Reply?The answer involves trade-offs between resilience and observability.**The resilience consideration:** LangGraph’s [persistence layer](https://docs.langchain.com/oss/javascript/langgraph/persistence) creates checkpoints at node boundaries. When a workflow resumes after an interruption or failure, it starts from the beginning of the node where execution stopped. Smaller nodes mean more frequent checkpoints, which means less work to repeat if something goes wrong. If you combine multiple operations into one large node, a failure near the end means re-executing everything from the start of that node.Why we chose this breakdown for the email agent:

-   **Isolation of external services:** Doc Search and Bug Track are separate nodes because they call external APIs. If the search service is slow or fails, we want to isolate that from the LLM calls. We can add retry policies to these specific nodes without affecting others.
-   **Intermediate visibility:** Having `Classify Intent` as its own node lets us inspect what the LLM decided before taking action. This is valuable for debugging and monitoring—you can see exactly when and why the agent routes to human review.
-   **Different failure modes:** LLM calls, database lookups, and email sending have different retry strategies. Separate nodes let you configure these independently.
-   **Reusability and testing:** Smaller nodes are easier to test in isolation and reuse in other workflows.

A different valid approach: You could combine `Read Email` and `Classify Intent` into a single node. You’d lose the ability to inspect the raw email before classification and would repeat both operations on any failure in that node. For most applications, the observability and debugging benefits of separate nodes are worth the trade-off.Application-level concerns: The caching discussion in Step 2 (whether to cache search results) is an application-level decision, not a LangGraph framework feature. You implement caching within your node functions based on your specific requirements—LangGraph doesn’t prescribe this.Performance considerations: More nodes doesn’t mean slower execution. LangGraph writes checkpoints in the background by default ([async durability mode](https://docs.langchain.com/oss/javascript/langgraph/checkpointers#durability-modes)), so your graph continues running without waiting for checkpoints to complete. This means you get frequent checkpoints with minimal performance impact. You can adjust this behavior if needed—use `"exit"` mode to checkpoint only at completion, or `"sync"` mode to block execution until each checkpoint is written.

### Where to go from here

This was an introduction to thinking about building agents with LangGraph. You can extend this foundation with:

---
