---
title: "Models - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/deepagents/models"
crawled_at: "2026-06-17T14:44:38.312Z"
---

Deep Agents work with any [LangChain chat model](https://docs.langchain.com/oss/javascript/langchain/models) that supports [tool calling](https://docs.langchain.com/oss/javascript/langchain/models#tool-calling).

## Supported models

Specify models in `provider:model` format (for example, `google_genai:gemini-3.5-flash`, `openai:gpt-5.4`, or `anthropic:claude-sonnet-4-6`). The provider prefix selects the LangChain integration, and everything after the colon is passed through to that provider as the model identifier. For valid provider strings, see the `model_provider` parameter of [`init_chat_model`](https://reference.langchain.com/javascript/langchain/chat_models/universal/initChatModel). For provider-specific configuration, see [chat model integrations](https://docs.langchain.com/oss/javascript/integrations/chat). The model identifier must match the format expected by the provider. Some providers use simple names like `gpt-5.4`; others use namespaced IDs or deployment paths like `zai-org/GLM-5.1`, so the full Deep Agents string would be `baseten:zai-org/GLM-5.1`. Check the provider’s model catalog or integration docs for the current identifiers.

### Suggested models

These models perform well on the [Deep Agents eval suite](https://github.com/langchain-ai/deepagents/tree/main/libs/evals#readme), which tests basic agent operations. Passing these evals is necessary but not sufficient for strong performance on longer, more complex tasks.

| Provider | Models |
| --- | --- |
| [Google](https://docs.langchain.com/oss/javascript/integrations/providers/google) | `gemini-3.1-pro-preview`, `gemini-3-flash-preview` |
| [OpenAI](https://docs.langchain.com/oss/javascript/integrations/providers/openai) | `gpt-5.4`, `gpt-4o`, `gpt-5.4`, `o4-mini`, `gpt-5.2-codex`, `gpt-4o-mini`, `o3` |
| [Anthropic](https://docs.langchain.com/oss/javascript/integrations/providers/anthropic) | `claude-opus-4-6`, `claude-opus-4-5`, `claude-sonnet-4-6`, `claude-sonnet-4`, `claude-sonnet-4-5`, `claude-haiku-4-5`, `claude-opus-4-1` |
| Open-weight | `GLM-5`, `Kimi-K2.5`, `MiniMax-M2.5`, `qwen3.5-397B-A17B`, `devstral-2-123B` |

Open-weight models are available through providers like [OpenRouter](https://docs.langchain.com/oss/javascript/integrations/chat/openrouter) and [Ollama](https://docs.langchain.com/oss/javascript/integrations/chat/ollama).

### Model evaluations

The [Deep Agents eval suite](https://github.com/langchain-ai/deepagents/tree/main/libs/evals#readme) tests popular models:

| Model | Overall | File Ops | Retrieval | Tool Use | Memory | Conversation | Summarization |
| --- | --- | --- | --- | --- | --- | --- | --- |
| google\_genai:gemini-3.5-flash | [82%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535) | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535)** | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535)** | **[90%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535)** | [54%](https://github.com/langchain-ai/deepagents/actions/runs/25290479270) | [38%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535) | [80%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535) |
| openai:gpt-5.4 | [18%](https://github.com/langchain-ai/deepagents/actions/runs/24906955930) | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/24172638583)** | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/24172638583)** | [18%](https://github.com/langchain-ai/deepagents/actions/runs/24906955930) | [51%](https://github.com/langchain-ai/deepagents/actions/runs/24172638583) | [38%](https://github.com/langchain-ai/deepagents/actions/runs/24425363630) | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/24172638583)** |
| openai:gpt-5.5 | [80%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535) | [92%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535) | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535)** | [84%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535) | [64%](https://github.com/langchain-ai/deepagents/actions/runs/25345307822) | **[52%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535)** | [80%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535) |
| anthropic:claude-opus-4-6 | [26%](https://github.com/langchain-ai/deepagents/actions/runs/24906955930) | [92%](https://github.com/langchain-ai/deepagents/actions/runs/24172638583) | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/24172638583)** | [26%](https://github.com/langchain-ai/deepagents/actions/runs/24906955930) | **[69%](https://github.com/langchain-ai/deepagents/actions/runs/24172638583)** | [22%](https://github.com/langchain-ai/deepagents/actions/runs/24363491527) | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/24172638583)** |
| anthropic:claude-opus-4-7 | [80%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535) | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535)** | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535)** | [82%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535) | — | [48%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535) | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535)** |
| baseten:moonshotai/Kimi-K2.6 | [79%](https://github.com/langchain-ai/deepagents/actions/runs/25475600906) | [92%](https://github.com/langchain-ai/deepagents/actions/runs/25475600906) | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/25475600906)** | [84%](https://github.com/langchain-ai/deepagents/actions/runs/25475600906) | — | [43%](https://github.com/langchain-ai/deepagents/actions/runs/25475600906) | [60%](https://github.com/langchain-ai/deepagents/actions/runs/25475600906) |
| baseten:zai-org/GLM-5 | [77%](https://github.com/langchain-ai/deepagents/actions/runs/25403850424) | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/25403850424)** | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/25403850424)** | [89%](https://github.com/langchain-ai/deepagents/actions/runs/25403850424) | [44%](https://github.com/langchain-ai/deepagents/actions/runs/23872647281) | [24%](https://github.com/langchain-ai/deepagents/actions/runs/25403850424) | [60%](https://github.com/langchain-ai/deepagents/actions/runs/25403850424) |
| fireworks:accounts/fireworks/models/glm-5p1 | [81%](https://github.com/langchain-ai/deepagents/actions/runs/25461031650) | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/25461031650)** | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/25461031650)** | [87%](https://github.com/langchain-ai/deepagents/actions/runs/25461031650) | — | [33%](https://github.com/langchain-ai/deepagents/actions/runs/25461031650) | [80%](https://github.com/langchain-ai/deepagents/actions/runs/25461031650) |
| fireworks:accounts/fireworks/models/minimax-m2p7 | [79%](https://github.com/langchain-ai/deepagents/actions/runs/25403894412) | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/25403894412)** | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/25403894412)** | [85%](https://github.com/langchain-ai/deepagents/actions/runs/25403894412) | — | [43%](https://github.com/langchain-ai/deepagents/actions/runs/25403894412) | [60%](https://github.com/langchain-ai/deepagents/actions/runs/25403894412) |
| ollama:minimax-m2.7:cloud | [73%](https://github.com/langchain-ai/deepagents/actions/runs/24106499785) | [92%](https://github.com/langchain-ai/deepagents/actions/runs/24106499785) | [90%](https://github.com/langchain-ai/deepagents/actions/runs/24106499785) | [82%](https://github.com/langchain-ai/deepagents/actions/runs/24106499785) | [38%](https://github.com/langchain-ai/deepagents/actions/runs/23872647281) | [29%](https://github.com/langchain-ai/deepagents/actions/runs/24106499785) | [60%](https://github.com/langchain-ai/deepagents/actions/runs/24106499785) |
| openrouter:deepseek/deepseek-v4-flash | [81%](https://github.com/langchain-ai/deepagents/actions/runs/25677815395) | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/25677815395)** | [80%](https://github.com/langchain-ai/deepagents/actions/runs/25677815395) | **[90%](https://github.com/langchain-ai/deepagents/actions/runs/25677815395)** | — | [33%](https://github.com/langchain-ai/deepagents/actions/runs/25677815395) | [80%](https://github.com/langchain-ai/deepagents/actions/runs/25677815395) |
| openrouter:minimax/minimax-m2.7 | [80%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535) | [92%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535) | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535)** | [89%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535) | — | [43%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535) | [60%](https://github.com/langchain-ai/deepagents/actions/runs/25455998535) |
| openrouter:z-ai/glm-5.1 | **[89%](https://github.com/langchain-ai/deepagents/actions/runs/25387853856)** | [92%](https://github.com/langchain-ai/deepagents/actions/runs/25234719085) | **[100%](https://github.com/langchain-ai/deepagents/actions/runs/25234686782)** | [89%](https://github.com/langchain-ai/deepagents/actions/runs/25387853856) | — | [33%](https://github.com/langchain-ai/deepagents/actions/runs/25225620506) | [80%](https://github.com/langchain-ai/deepagents/actions/runs/25235579950) |

For more information, see the [Eval runs](https://github.com/langchain-ai/deepagents/actions/workflows/evals.yml).

## Configure model parameters

Pass a model string to [`createDeepAgent`](https://reference.langchain.com/javascript/deepagents/agent/createDeepAgent) in `provider:model` format, or pass a configured model instance for full control. Under the hood, model strings are resolved via [`init_chat_model`](https://reference.langchain.com/javascript/langchain/chat_models/universal/initChatModel). To configure model-specific parameters, use [`init_chat_model`](https://reference.langchain.com/javascript/langchain/chat_models/universal/initChatModel) or instantiate a provider model class directly:

### Provider profiles

A [`ProviderProfile`](https://docs.langchain.com/oss/javascript/deepagents/profiles#provider-profiles) packages initialization parameters that apply when you provide a `provider:model` string when creating the deep agent. It does not apply when you pass a preconfigured model with [`init_chat_model`](https://reference.langchain.com/javascript/langchain/chat_models/universal/initChatModel). You can register at two levels, and both can coexist:

-   **Provider level** — a bare provider key like `"openai"` applies to every model from the `openai` provider.
-   **Model level** — a `provider:model` key like `"openai:gpt-5.4"` applies only to that specific model, and merges on top of any matching provider-level profile.

```
from deepagents import ProviderProfile, register_provider_profile

# Provider-wide default: every openai model gets temperature=0.
register_provider_profile(
    "openai",
    ProviderProfile(init_kwargs={"temperature": 0}),
)

# Model-level override: gpt-5.4 additionally gets a specific reasoning effort.
# Inherits temperature=0 from the provider-level profile above.
register_provider_profile(
    "openai:gpt-5.4",
    ProviderProfile(init_kwargs={"reasoning_effort": "medium"}),
)
```

See [Profiles](https://docs.langchain.com/oss/javascript/deepagents/profiles) for the full field list, merge semantics, and plugin packaging.

## Select a model at runtime

If your application lets users choose a model (for example using a dropdown in the UI), use [middleware](https://docs.langchain.com/oss/javascript/langchain/middleware) to swap the model at runtime without rebuilding the agent.

```
import { initChatModel, createMiddleware } from "langchain";
import { createDeepAgent } from "deepagents";
import * as z from "zod";

const contextSchema = z.object({
  model: z.string(),
});

const configurableModel = createMiddleware({
  name: "ConfigurableModel",
  wrapModelCall: async (request, handler) => {
    const modelName = request.runtime.context.model;
    const model = await initChatModel(modelName);
    return handler({ ...request, model });
  },
});

const agent = await createDeepAgent({
  model: "google_genai:gemini-3.5-flash",
  middleware: [configurableModel],
  contextSchema,
});

// Invoke with the user's model selection
const result = await agent.invoke(
  { messages: [{ role: "user", content: "Hello!" }] },
  { context: { model: "openai:gpt-5.4" } },
);
```

## Learn more

-   [Models in LangChain](https://docs.langchain.com/oss/javascript/langchain/models): chat model features including tool calling, structured output, and multimodality

---
