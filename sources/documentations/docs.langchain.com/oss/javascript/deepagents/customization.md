---
title: "Customize Deep Agents - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/deepagents/customization"
crawled_at: "2026-06-17T14:44:23.556Z"
---

Build the harness around your goal. `create_deep_agent` gives you a production-ready foundation: connect it to your data, shape its behavior, and add the capabilities your use case needs. `createDeepAgent` ships with a pre-assembled harness: filesystem, summarization, subagents, and prompt caching by default. The parameters below let you define the agent’s persona, connect it to your data and tools, and extend the [default middleware stack](#default-stack-main-agent) with additional middleware.

```
import { createDeepAgent } from "deepagents";

const agent = await createDeepAgent({
  model: "anthropic:claude-sonnet-4-6",
  systemPrompt: "You are a helpful assistant.",
  tools: [search, fetchUrl],
  memory: ["./AGENTS.md"],
  skills: ["./skills/"],
});
```

| Parameter | What it does |
| --- | --- |
| `model` | Which model to use |
| `systemPrompt` | Custom instructions for the agent |
| `tools` | Domain tools the agent can call |
| `memory` | AGENTS.md files loaded at startup |
| `skills` | Skills directory for on-demand knowledge |
| `backend` | Filesystem backend (StateBackend by default) |
| `permissions` | Path-level access control for the filesystem |
| `subagents` | Custom subagents for delegated tasks |
| `middleware` | Extra middleware appended to the [default stack](#default-stack-main-agent) |
| `interruptOn` | Pause before tool calls for human approval |
| `responseFormat` | Structured output schema |
| [`contextSchema`](https://docs.langchain.com/oss/javascript/deepagents/context-engineering#runtime-context) | Per-run runtime context schema (user IDs, API keys, feature flags) |

For the full parameter list, see the [`createDeepAgent`](https://reference.langchain.com/javascript/deepagents/types/CreateDeepAgentParams) API reference. To compose a fully custom harness from scratch, see [Configure the harness](https://docs.langchain.com/oss/javascript/langchain/agents#configure-the-harness).

## Model

Pass a `model` string in `provider:model` format, or an initialized model instance. See [supported models](https://docs.langchain.com/oss/javascript/deepagents/models#supported-models) for all providers and [suggested models](https://docs.langchain.com/oss/javascript/deepagents/models#suggested-models) for tested recommendations.

-   OpenAI
    
-   Anthropic
    
-   Azure
    
-   Google Gemini
    
-   Bedrock Converse
    
-   Other
    

Pass any [supported model string](https://docs.langchain.com/oss/javascript/deepagents/models#supported-models), or an initialized model instance:

```
import { initChatModel } from "langchain";
import { createDeepAgent } from "deepagents";

const model = await initChatModel("provider:model-name");
const agent = createDeepAgent({ model });
```

## Tools

In addition to [built-in tools](https://docs.langchain.com/oss/javascript/deepagents/overview#execution-environment) for planning, file management, and subagent spawning, you can provide custom tools:

### MCP tools

Install `@langchain/mcp-adapters` to connect to MCP servers:

```
npm install @langchain/mcp-adapters
```

```
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { createDeepAgent } from "deepagents";

const client = new MultiServerMCPClient({
    my_server: {
        transport: "http",
        url: "http://localhost:8000/mcp",
    },
});

const tools = await client.getTools();

const agent = await createDeepAgent({
    model: "openai:gpt-5.5",
    tools,
});

const result = await agent.invoke({
    messages: [{ role: "user", content: "Use the MCP server to help me." }],
});
```

For detailed configuration options including stdio servers, OAuth authentication, tool filtering, and stateful sessions, see the full [MCP guide](https://docs.langchain.com/oss/javascript/langchain/mcp).

## System prompt

Deep Agents come with a built-in system prompt. A deep agent’s value comes from the orchestration layer the SDK provides on top of the model—planning, virtual-filesystem tools, and subagents—and the model needs to know those exist and when to reach for them. The built-in prompt teaches the agent how to use that scaffolding so you don’t have to re-derive it for every project; tweak it through a [profile](https://docs.langchain.com/oss/javascript/deepagents/profiles#harness-profiles) or your own `system_prompt=` rather than copying it verbatim. When middleware add special tools, like the filesystem tools, it appends them to the system prompt. Each deep agent should also include a custom system prompt specific to its specific use case:

### Prompt assembly

Deep Agents builds the system prompt from up to four named parts so that caller-supplied instructions, the SDK’s built-in agent guidance, and any model-specific [profile](https://docs.langchain.com/oss/javascript/deepagents/profiles) overrides can coexist with predictable precedence. Without this layering, a profile suffix tuned for Claude (for example) could overwrite or be overwritten by your `system_prompt=` argument depending on call order; the named slots make the ordering explicit and stable. In practice, most callers only encounter two slots: `USER` (your `system_prompt=`) and `BASE` (the SDK default). Selecting a model with a built-in profile—Anthropic or OpenAI today—adds a `SUFFIX`. The full four-part assembly is mainly relevant when you author a custom `HarnessProfile` or debug why a profile’s text appears where it does. The four named parts (each may be absent):

| Name | Source | Notes |
| --- | --- | --- |
| `USER` | `system_prompt=` argument to `create_deep_agent` | `str` or `SystemMessage`; omitted when unset. |
| `BASE` | The SDK default (`BASE_AGENT_PROMPT`) | Always present unless replaced by a profile’s `CUSTOM`. |
| `CUSTOM` | [`HarnessProfile.base_system_prompt`](https://docs.langchain.com/oss/javascript/deepagents/profiles#harness-profiles) | Replaces `BASE` outright when a matching profile sets it. |
| `SUFFIX` | [`HarnessProfile.system_prompt_suffix`](https://docs.langchain.com/oss/javascript/deepagents/profiles#harness-profiles) | Appended last when a matching profile sets it. |

The order is always **`USER` -> (`BASE` or `CUSTOM`) -> `SUFFIX`**, joined by blank lines (`\n\n`). Two invariants follow:

1.  **`USER` is always at the front.** The caller’s text precedes any SDK or profile content, so persona/instructions take precedence regardless of which model is selected.
2.  **`SUFFIX` is always at the end.** Profile suffixes sit closest to the conversation history, where model-tuning guidance lands most reliably.

Assembled shapes (✓ = field is set, - = field is unset):

| `system_prompt=` | profile `base_system_prompt` (`CUSTOM`) | profile `system_prompt_suffix` (`SUFFIX`) | Final assembled system prompt |
| --- | --- | --- | --- |
| `None` | \- | \- | `BASE` |
| `None` | \- | ✓ | `BASE` + `SUFFIX` |
| `None` | ✓ | \- | `CUSTOM` |
| `None` | ✓ | ✓ | `CUSTOM` + `SUFFIX` |
| `str` | \- | \- | `USER` + `BASE` |
| `str` | \- | ✓ | `USER` + `BASE` + `SUFFIX` |
| `str` | ✓ | \- | `USER` + `CUSTOM` |
| `str` | ✓ | ✓ | `USER` + `CUSTOM` + `SUFFIX` |

Worked example—built-in profiles (Anthropic, OpenAI) ship only a `system_prompt_suffix`, so a typical call lands in the `str` + `-` + `✓` row:

```
agent = create_deep_agent(
    model="anthropic:claude-sonnet-4-6",
    system_prompt="You are a customer-support agent for ACME Corp.",
)
# Final = USER + BASE + SUFFIX
#       = "You are a customer-support agent for ACME Corp."
#         + "\n\n"
#         + BASE_AGENT_PROMPT
#         + "\n\n"
#         + <Claude-specific guidance>
```

Subagent prompts

The [prompt assembly](#prompt-assembly) overlay rules also apply to declarative [subagents](https://docs.langchain.com/oss/javascript/deepagents/subagents): each subagent re-runs profile resolution against **its own model**, then applies the resolved profile’s `base_system_prompt` / `system_prompt_suffix` to its authored `system_prompt`. The subagent’s `system_prompt` plays the `BASE` role; `CUSTOM` and `SUFFIX` come from the profile that matches the subagent’s model (which may differ from the main agent’s profile).

| `spec["system_prompt"]` | profile `base_system_prompt` (`CUSTOM`) | profile `system_prompt_suffix` (`SUFFIX`) | Final subagent system prompt |
| --- | --- | --- | --- |
| authored | \- | \- | authored |
| authored | \- | ✓ | authored + `SUFFIX` |
| authored | ✓ | \- | `CUSTOM` |
| authored | ✓ | ✓ | `CUSTOM` + `SUFFIX` |

There is no `USER` segment for subagents. The spec’s authored `system_prompt` is the closest analog and stays in the `BASE` slot. A profile that ships only a `system_prompt_suffix` (the common case for built-in Anthropic / OpenAI profiles) just appends to whatever the subagent author wrote. A profile that sets `base_system_prompt` will _replace_ the authored prompt outright.

General-purpose subagent prompt

The auto-added [general-purpose subagent](https://docs.langchain.com/oss/javascript/deepagents/subagents#the-general-purpose-subagent) follows the [prompt assembly](#prompt-assembly) overlay rules with one extra layer: the GP base prompt is resolved as **`general_purpose_subagent.system_prompt` (if set) -> `HarnessProfile.base_system_prompt` (if set) -> SDK general-purpose default**. The profile suffix layers on top either way.The two override fields can both carry a base-prompt replacement, but they are not interchangeable. `general_purpose_subagent.system_prompt` is general-purpose-specific configuration; `base_system_prompt` is a global override that primarily targets the main agent. When both are set, the **general-purpose-specific intent wins for the general-purpose subagent** so a user tuning both fields never sees their GP override silently dropped:

```
register_harness_profile(
    "anthropic",
    HarnessProfile(
        base_system_prompt="You are ACME's support orchestrator.",  # main agent
        general_purpose_subagent=GeneralPurposeSubagentProfile(
            system_prompt="You are a research subagent. Cite sources.",  # GP subagent
        ),
        system_prompt_suffix="Always think step by step.",
    ),
)
```

| Stack | Final system prompt |
| --- | --- |
| Main agent | `"You are ACME's support orchestrator." + SUFFIX` |
| GP subagent | `"You are a research subagent. Cite sources." + SUFFIX` |

If `general_purpose_subagent.system_prompt` is unset, the GP subagent falls back to `base_system_prompt` (when set) and finally to the SDK general-purpose default.

## Middleware

Deep Agents support any [middleware](https://docs.langchain.com/oss/javascript/langchain/middleware/overview), including the built-in middleware listed below, prebuilt middleware from LangChain, provider-specific middleware, and custom middleware you write yourself. Pass middleware to the `middleware` argument of `createDeepAgent`. Custom middleware is appended after [`PatchToolCallsMiddleware`](https://reference.langchain.com/javascript/deepagents/middleware/createPatchToolCallsMiddleware) in the [default stack](#default-stack-main-agent). By default, Deep Agents have access to the following middleware:

### Default stack (main agent)

From first to last:

1.  [`TodoListMiddleware`](https://reference.langchain.com/javascript/langchain/index/todoListMiddleware): Tracks and manages todo lists for organizing agent tasks and work.
2.  [`SkillsMiddleware`](https://reference.langchain.com/javascript/deepagents/middleware/createSkillsMiddleware): Only when you pass `skills`. Injected **immediately after** the todo middleware and **before** filesystem middleware so skill metadata is available before file tools run.
3.  [`FilesystemMiddleware`](https://reference.langchain.com/javascript/deepagents/middleware/createFilesystemMiddleware): Handles file system operations such as reading, writing, and navigating directories. When you pass `permissions`, filesystem permissions enforcement is included here so it can evaluate every tool the agent might call.
4.  [`SubAgentMiddleware`](https://reference.langchain.com/javascript/deepagents/middleware/createSubAgentMiddleware): Spawns and coordinates subagents for delegating tasks to specialized agents.
5.  [`SummarizationMiddleware`](https://reference.langchain.com/javascript/langchain/index/summarizationMiddleware): Condenses message history to stay within context limits when conversations grow long (via [createSummarizationMiddleware](https://reference.langchain.com/javascript/deepagents/middleware/createSummarizationMiddleware)).
6.  [`PatchToolCallsMiddleware`](https://reference.langchain.com/javascript/deepagents/middleware/createPatchToolCallsMiddleware): Repairs dangling tool calls in message history when a run resumes after an interruption or receives malformed tool-call arguments. Runs **before** Anthropic prompt caching and the tail stack below.
7.  [`AsyncSubAgentMiddleware`](https://reference.langchain.com/javascript/deepagents/agent/createDeepAgent): Only when you configure async subagents.
8.  **Your middleware argument**: Optional middleware you pass as the `middleware` argument is appended here (after Patch, before the tail stack).
9.  **Harness profile extras**: Provider-specific middleware from the resolved model profile, if any.
10.  **Excluded-tool filtering**: When the harness profile lists excluded tools, middleware removes those tools from the agent.
11.  [`AnthropicPromptCachingMiddleware`](https://reference.langchain.com/javascript/langchain/index/anthropicPromptCachingMiddleware): Automatically added when you are using an Anthropic model. Runs **after** Patch and after your middleware so the cached prefix matches what is actually sent to the model.
12.  [`MemoryMiddleware`](https://reference.langchain.com/javascript/deepagents/middleware/createMemoryMiddleware): Only when you pass `memory`.
13.  `HumanInTheLoopMiddleware`: Only when you pass `interruptOn`. Pauses for human approval or input at configured tool calls.

### Default stack (synchronous subagents)

The built-in **general-purpose** subagent and each declarative synchronous `SubAgent` graph use a stack that `createDeepAgent` builds in code. It matches the main agent in broad shape (todo list, filesystem, summarization, Patch, profile extras, Anthropic caching, optional permissions) but differs in two ways:

-   **Skills run after** [`PatchToolCallsMiddleware`](https://reference.langchain.com/javascript/deepagents/middleware/createPatchToolCallsMiddleware) on these inner agents (on the main agent, skills run **before** filesystem middleware when `skills` is set).
-   There is **no** [`SubAgentMiddleware`](https://reference.langchain.com/javascript/deepagents/middleware/createSubAgentMiddleware) inside a subagent graph (only the parent agent exposes the `task` tool).

When a declarative subagent sets `interruptOn`, that value is forwarded to `createAgent` for the subagent, which wires up human-in-the-loop handling for the configured tool calls.

### Prebuilt middleware

LangChain exposes additional prebuilt middleware that let you add-on various features, such as retries, fallbacks, or PII detection. See [Prebuilt middleware](https://docs.langchain.com/oss/javascript/langchain/middleware/built-in) for more. The `deepagents` package also exposes [`createSummarizationMiddleware`](https://reference.langchain.com/javascript/deepagents/middleware/createSummarizationMiddleware) for the same workflow. For more detail, see [Summarization](https://docs.langchain.com/oss/javascript/deepagents/context-engineering#summarization).

### Provider-specific middleware

For provider-specific middleware that is optimized for specific LLM providers, see [Official integrations](https://docs.langchain.com/oss/javascript/integrations/middleware#official-integrations) and [Community integrations](https://docs.langchain.com/oss/javascript/integrations/middleware#community-integrations).

### Custom middleware

You can provide additional middleware to extend functionality, add tools, or implement custom hooks:

### Interpreters

Use [interpreters](https://docs.langchain.com/oss/javascript/deepagents/interpreters) to add an `eval` tool that runs JavaScript in a scoped QuickJS runtime. Interpreters are useful when the agent needs to compose tools programmatically, batch work, handle errors in code, or transform structured data without a full shell environment.

For setup, programmatic tool calling, subagent orchestration, and limits, see [Interpreters](https://docs.langchain.com/oss/javascript/deepagents/interpreters).

## Subagents

To isolate detailed work and avoid context bloat, use subagents:

For more information, see [Subagents](https://docs.langchain.com/oss/javascript/deepagents/subagents).

## Backends

Tools for a deep agent can make use of virtual file systems to store, access, and edit files. By default, deep agents use a [`StateBackend`](https://reference.langchain.com/javascript/deepagents/backends/StateBackend). If you are using [skills](#skills) or [memory](#memory), you must add the expected skill or memory files to the backend before creating the agent.

-   StateBackend
    
-   FilesystemBackend
    
-   LocalShellBackend
    
-   StoreBackend
    
-   ContextHubBackend
    
-   CompositeBackend
    

A thread-scoped filesystem backend stored in `langgraph` state.Files persist across turns within a thread (via your checkpointer) and are not shared across threads.

```
import { createDeepAgent, StateBackend } from "deepagents";

// By default we provide a StateBackend
const agent = createDeepAgent();

// Under the hood, it looks like
const agent2 = createDeepAgent({
  backend: new StateBackend(),
});
```

The local machine’s filesystem.

A filesystem with shell execution directly on the host. Provides filesystem tools plus the `execute` tool for running commands.

A filesystem that provides long-term storage that is _persisted across threads_.

Durable filesystem storage in a LangSmith Hub repo.For more details, see [`ContextHubBackend`](https://docs.langchain.com/oss/javascript/deepagents/backends#contexthubbackend).

A flexible backend where you can specify different routes in the filesystem to point towards different backends.

For more information, see [Backends](https://docs.langchain.com/oss/javascript/deepagents/backends).

### Sandboxes

Sandboxes are specialized [backends](https://docs.langchain.com/oss/javascript/deepagents/backends) that run agent code in an isolated environment with their own filesystem and an `execute` tool for shell commands. Use a sandbox backend when you want your deep agent to write files, install dependencies, and run commands without changing anything on your local machine. You configure sandboxes by passing a sandbox backend to `backend` when creating your deep agent:

```
import { createDeepAgent } from "deepagents";
import { ChatAnthropic } from "@langchain/anthropic";
import { DenoSandbox } from "@langchain/deno";

// Create and initialize the sandbox
const sandbox = await DenoSandbox.create({
  memoryMb: 1024,
  lifetime: "10m",
});

try {
  const agent = createDeepAgent({
    model: new ChatAnthropic({ model: "claude-opus-4-8" }),
    systemPrompt: "You are a JavaScript coding assistant with sandbox access.",
    backend: sandbox,
  });

  const result = await agent.invoke({
    messages: [
      {
        role: "user",
        content:
          "Create a simple HTTP server using Deno.serve and test it with curl",
      },
    ],
  });
} finally {
  await sandbox.close();
}
```

For more information, see [Sandboxes](https://docs.langchain.com/oss/javascript/deepagents/sandboxes).

## Human-in-the-loop

Some tool operations may be sensitive and require human approval before execution. You can configure the approval for each tool:

```
import { tool } from "langchain";
import { createDeepAgent } from "deepagents";
import { MemorySaver } from "@langchain/langgraph";
import { z } from "zod";

const removeFile = tool(
  async ({ path }: { path: string }) => {
    return `Deleted ${path}`;
  },
  {
    name: "remove_file",
    description: "Delete a file from the filesystem.",
    schema: z.object({
      path: z.string(),
    }),
  },
);

const fetchFile = tool(
  async ({ path }: { path: string }) => {
    return `Contents of ${path}`;
  },
  {
    name: "fetch_file",
    description: "Read a file from the filesystem.",
    schema: z.object({
      path: z.string(),
    }),
  },
);

const notifyEmail = tool(
  async ({
    to,
    subject,
    body,
  }: {
    to: string;
    subject: string;
    body: string;
  }) => {
    return `Sent email to ${to}`;
  },
  {
    name: "notify_email",
    description: "Send an email.",
    schema: z.object({
      to: z.string(),
      subject: z.string(),
      body: z.string(),
    }),
  },
);

// Checkpointer is REQUIRED for human-in-the-loop
const checkpointer = new MemorySaver();

const agent = createDeepAgent({
  model: "google_genai:gemini-3.5-flash",
  tools: [removeFile, fetchFile, notifyEmail],
  interruptOn: {
    remove_file: true, // Default: approve, edit, reject, respond
    fetch_file: false, // No interrupts needed
    notify_email: { allowedDecisions: ["approve", "reject"] }, // No editing
  },
  checkpointer, // Required!
});
```

You can configure interrupt for agents and subagents on tool call as well as from within tool calls. For more information, see [Human-in-the-loop](https://docs.langchain.com/oss/javascript/deepagents/human-in-the-loop).

## Skills

You can use [skills](https://docs.langchain.com/oss/javascript/deepagents/overview) to provide your deep agent with new capabilities and expertise. While [tools](https://docs.langchain.com/oss/javascript/deepagents/customization#tools) tend to cover lower level functionality like native file system actions or planning, skills can contain detailed instructions on how to complete tasks, reference info, and other assets, such as templates. These files are only loaded by the agent when the agent has determined that the skill is useful for the current prompt. This progressive disclosure reduces the amount of tokens and context the agent has to consider upon startup. For example skills, see [Deep Agents example skills](https://github.com/langchain-ai/deepagentsjs/tree/main/examples/skills). To add skills to your deep agent, pass them as an argument to `create_deep_agent`:

-   StateBackend
    
-   StoreBackend
    
-   FilesystemBackend
    

```
import { createDeepAgent, StateBackend, type FileData } from "deepagents";
import { MemorySaver } from "@langchain/langgraph";

const checkpointer = new MemorySaver();
const backend = new StateBackend();

function createFileData(content: string): FileData {
  const now = new Date().toISOString();
  return {
    content: content.split("\n"),
    created_at: now,
    modified_at: now,
  };
}

const skillsFiles: Record<string, FileData> = {};
const skillUrl =
  "https://raw.githubusercontent.com/langchain-ai/deepagentsjs/refs/heads/main/examples/skills/langgraph-docs/SKILL.md";
const response = await fetch(skillUrl);
const skillContent = await response.text();

skillsFiles["/skills/langgraph-docs/SKILL.md"] = createFileData(skillContent);

const agent = await createDeepAgent({
  model: "google-genai:gemini-3.1-pro-preview",
  backend,
  checkpointer, // Required !
  // IMPORTANT: deepagents skill source paths are virtual (POSIX) paths relative to the backend root.
  skills: ["/skills/"],
});

const config = { configurable: { thread_id: `thread-${Date.now()}` } };
const result = await agent.invoke(
  {
    messages: [{ role: "user", content: "what is langraph?" }],
    files: skillsFiles,
  },
  config,
);
```

```
import { createDeepAgent, StoreBackend, type FileData } from "deepagents";
import { InMemoryStore, MemorySaver } from "@langchain/langgraph";

const checkpointer = new MemorySaver();
const store = new InMemoryStore();
const backend = new StoreBackend({
  namespace: () => ["filesystem"],
});

function createFileData(content: string): FileData {
  const now = new Date().toISOString();
  return {
    content: content.split("\n"),
    created_at: now,
    modified_at: now,
  };
}

const skillUrl =
  "https://raw.githubusercontent.com/langchain-ai/deepagentsjs/refs/heads/main/examples/skills/langgraph-docs/SKILL.md";

const response = await fetch(skillUrl);
const skillContent = await response.text();
const fileData = createFileData(skillContent);

await store.put(["filesystem"], "/skills/langgraph-docs/SKILL.md", fileData);

const agent = await createDeepAgent({
  model: "google-genai:gemini-3.1-pro-preview",
  backend,
  store,
  checkpointer,
  // IMPORTANT: deepagents skill source paths are virtual (POSIX) paths relative to the backend root.
  skills: ["/skills/"],
});

const config = {
  recursionLimit: 50,
  configurable: { thread_id: `thread-${Date.now()}` },
};
const result = await agent.invoke(
  { messages: [{ role: "user", content: "what is langraph?" }] },
  config,
);
```

```
import { createDeepAgent, FilesystemBackend } from "deepagents";
import { MemorySaver } from "@langchain/langgraph";

const checkpointer = new MemorySaver();
const backend = new FilesystemBackend({ rootDir: process.cwd() });

const agent = await createDeepAgent({
  model: "google-genai:gemini-3.1-pro-preview",
  backend,
  skills: ["./examples/skills/"],
  interruptOn: {
    read_file: true,
    write_file: true,
    delete_file: true,
  },
  checkpointer, // Required!
});

const config = { configurable: { thread_id: `thread-${Date.now()}` } };
const result = await agent.invoke(
  { messages: [{ role: "user", content: "what is langraph?" }] },
  config,
);
```

## Memory

Use [`AGENTS.md` files](https://agents.md/) to provide extra context to your deep agent. You can pass one or more file paths to the `memory` parameter when creating your deep agent:

-   StateBackend
    
-   StoreBackend
    
-   Filesystem
    

## Structured output

Deep Agents support [structured output](https://docs.langchain.com/oss/javascript/langchain/structured-output). You can set a desired structured output schema by passing it as the `responseFormat` argument to the call to `createDeepAgent()`. When the model generates the structured data, it’s captured, validated, and returned in the ‘structuredResponse’ key of the agent’s state.

```
import { tool } from "langchain";
import { TavilySearch } from "@langchain/tavily";
import { createDeepAgent } from "deepagents";
import { z } from "zod";

const internetSearch = tool(
  async ({
    query,
    maxResults = 5,
    topic = "general",
    includeRawContent = false,
  }: {
    query: string;
    maxResults?: number;
    topic?: "general" | "news" | "finance";
    includeRawContent?: boolean;
  }) => {
    const tavilySearch = new TavilySearch({
      maxResults,
      tavilyApiKey: process.env.TAVILY_API_KEY,
      includeRawContent,
      topic,
    });
    return await tavilySearch._call({ query });
  },
  {
    name: "internet_search",
    description: "Run a web search",
    schema: z.object({
      query: z.string().describe("The search query"),
      maxResults: z.number().optional().default(5),
      topic: z
        .enum(["general", "news", "finance"])
        .optional()
        .default("general"),
      includeRawContent: z.boolean().optional().default(false),
    }),
  },
);

const weatherReportSchema = z.object({
  location: z.string().describe("The location for this weather report"),
  temperature: z.number().describe("Current temperature in Celsius"),
  condition: z
    .string()
    .describe("Current weather condition (e.g., sunny, cloudy, rainy)"),
  humidity: z.number().describe("Humidity percentage"),
  windSpeed: z.number().describe("Wind speed in km/h"),
  forecast: z.string().describe("Brief forecast for the next 24 hours"),
});

const agent = await createDeepAgent({
  responseFormat: weatherReportSchema,
  tools: [internetSearch],
});

const result = await agent.invoke({
  messages: [
    {
      role: "user",
      content: "What's the weather like in San Francisco?",
    },
  ],
});

console.log(result.structuredResponse);
// {
//   location: 'San Francisco, California',
//   temperature: 18.3,
//   condition: 'Sunny',
//   humidity: 48,
//   windSpeed: 7.6,
//   forecast: 'Clear skies with temperatures remaining mild. High of 18°C (64°F) during the day, dropping to around 11°C (52°F) at night.'
// }
```

For more information and examples, see [response format](https://docs.langchain.com/oss/javascript/langchain/structured-output#response-format).

## Advanced

`createDeepAgent` pre-assembles a middleware stack on top of `createAgent`. To build a fully custom agent—choosing exactly which capabilities to include—see [Configure the harness](https://docs.langchain.com/oss/javascript/langchain/agents#configure-the-harness).

---
