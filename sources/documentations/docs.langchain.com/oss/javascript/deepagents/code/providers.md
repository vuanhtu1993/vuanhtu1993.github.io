---
title: "Model providers - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/deepagents/code/providers"
crawled_at: "2026-06-17T14:46:29.094Z"
---

Deep Agents Code supports any [chat model provider compatible with LangChain](https://docs.langchain.com/oss/javascript/integrations/chat), unlocking use for virtually any LLM that supports tool calling. Any service that exposes an OpenAI-compatible or Anthropic-compatible API also works out of the box—see [Compatible APIs](https://docs.langchain.com/oss/javascript/deepagents/code/configuration#compatible-apis).

## Quickstart

Deep Agents Code integrates automatically with the [following model providers](#provider-reference): no extra configuration needed beyond installing the relevant provider package.

1.  **Install provider packages** Each model provider requires its corresponding LangChain integration package. These ship as optional extras to keep the application lightweight. OpenAI, Anthropic, and Gemini are included by default. Install any other extra from within a session with `/install`, or from the shell with `dcode --install`: Run `/install` with no argument to list the valid extras. To preinstall extras during the initial CLI install, set `DEEPAGENTS_CODE_EXTRAS`:
    
    ```
    DEEPAGENTS_CODE_EXTRAS="baseten,groq" curl -LsSf https://langch.in/dcode | bash
    ```
    
2.  **Set credentials** Add an API key for your provider with the [`/auth`](https://docs.langchain.com/oss/javascript/deepagents/code/configuration#use-%2Fauth-recommended) credential manager:
    
    ```
    /auth
    ```
    
    For non-interactive runs, CI/CD, or anywhere a TUI isn’t available, store the same key from the shell with [`dcode auth set`](https://docs.langchain.com/oss/javascript/deepagents/code/configuration#manage-credentials-from-the-shell-dcode-auth) or set the provider’s environment variable instead. See [Provider credentials](https://docs.langchain.com/oss/javascript/deepagents/code/configuration#provider-credentials) for the full key resolution order, the [`DEEPAGENTS_CODE_` prefix](https://docs.langchain.com/oss/javascript/deepagents/code/configuration#deepagents_code_-prefix) for scoping a key to Deep Agents Code, and the [Provider reference](#provider-reference) for each provider’s environment variable. To configure model parameters, see [Model parameters](#model-parameters).

## Provider reference

Deep Agents Code is built in Python, please use the [Python provider reference docs](https://docs.langchain.com/oss/python/deepagents/code/providers#provider-reference).

### Model routers and proxies

Model routers like [OpenRouter](https://openrouter.ai/) and [LiteLLM](https://docs.litellm.ai/) provide access to models from multiple providers through a single endpoint. Use the dedicated integration packages for these services:

| Router | Package |
| --- | --- |
| OpenRouter | [`langchain-openrouter`](https://docs.langchain.com/oss/javascript/integrations/chat/openrouter) |

**OpenRouter** is a built-in provider—install the extra and use it directly:

**LiteLLM** is also a built-in provider:

## Switch models

To switch models in Deep Agents Code, either:

1.  **Use the interactive model switcher** with the `/model` command.
2.  **Specify a model name directly** as an argument, e.g. `/model gpt-5.5`. You can use any model supported by the chosen provider, regardless of whether it appears in the list from option 1. The model name will be passed to the API request.
3.  **Specify the model at launch** via `--model`, e.g.
    
    ```
    dcode --model openai:gpt-5.5
    ```
    

Model resolution order

When Deep Agents Code launches, it resolves which model to use in the following order:

1.  **`--model` flag** always wins when provided.
2.  **`[models].default`** in `~/.deepagents/config.toml`—the user’s intentional long-term preference.
3.  **`[models].recent`** in `~/.deepagents/config.toml`—the last model switched to via `/model`. Written automatically; never overwrites `[models].default`.
4.  **Environment auto-detection**: falls back to the first available startup credential, checked in order: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`, `GOOGLE_CLOUD_PROJECT` (Vertex AI).

This startup fallback intentionally checks only those four credentials. Other supported providers (for example, Groq) are still available via `--model`, `/model`, and saved defaults (`[models].default` / `[models].recent`).

### Which models appear in the switcher

The `/model` selector dynamically builds its list from installed provider packages. Expand below for the full criteria and troubleshooting.

How the switcher builds its model list

The interactive `/model` selector builds its list from installed provider packages and models configured in `config.toml`.A model appears when:

1.  The provider package is installed.
2.  The model is available from the provider package, a local provider, or your `config.toml`.
3.  The model profile does not mark text input or output as unsupported.

If a model is missing, use `/model <provider>:<model>` directly or add it to [`[models.providers.<name>].models`](https://docs.langchain.com/oss/javascript/deepagents/code/configuration#adding-models-to-the-interactive-switcher).

### Open weights models

If you want to use an open weights model, there are two common paths depending on whether you prefer local or cloud-hosted inference. **Local inference with Ollama** is the easiest way to get started for free, with no API key required:

1.  [Install Ollama](https://ollama.com/) and pull a model, for example:
    
    ```
    ollama pull qwen3:4b
    ```
    
2.  Install the Ollama extra:
3.  Select the model: Use the interactive switcher, or pass the model directly with `/model ollama:qwen3:4b`.

**Cloud-hosted open weights via Groq** gives you fast inference without running anything locally:

1.  Get a free API key at [console.groq.com](https://console.groq.com/).
2.  Install the Groq extra:
3.  Select a model: Use the interactive switcher, or pass the model directly with `/model groq:openai/gpt-oss-120b`.

**Fireworks** is another popular cloud provider for open weights models:

Use the interactive switcher, or pass the model directly with `/model fireworks:accounts/fireworks/models/deepseek-v4-pro`. **Baseten** is another cloud provider for open weights models:

Use the interactive switcher, or pass the model directly with `/model baseten:moonshotai/Kimi-K2.6`.

**Together**, **OpenRouter**, and **Hugging Face** (`langchain-huggingface`) are other options for cloud-hosted open weights. See the [Provider reference](#provider-reference) for credentials and package names.

### Set a default model

You can set a persistent default model that applies to all future CLI launches:

-   **Via model selector:** Open `/model`, navigate to the desired model, and press `Ctrl+S` to pin it as the default. Pressing `Ctrl+S` again on the current default clears it.
-   **Via command:** `/model --default provider:model` (e.g., `/model --default anthropic:claude-opus-4-8`)
-   **Via config file:** Set `[models].default` in `~/.deepagents/config.toml` (see [Configuration](https://docs.langchain.com/oss/javascript/deepagents/code/configuration)).
-   **From the shell:**
    
    ```
    dcode --default-model anthropic:claude-opus-4-8
    ```
    

To view the current default:

```
dcode --default-model
```

To clear the default:

-   **From the shell:**
    
    ```
    dcode --clear-default-model
    ```
    
-   **Via command:** `/model --default --clear`
-   **Via model selector:** Press `Ctrl+S` on the currently pinned default model.

Without a default, Deep Agents Code uses the most recently used model.

### Model parameters

Pass extra constructor kwargs to the model—sampling controls, reasoning/thinking budgets, context window sizes, request timeouts, and anything else the underlying chat-model class accepts. Three places to set them, in priority order (highest first):

1.  **One-off at launch with `--model-params`.** JSON string, session-only:
    
    ```
    # OpenAI reasoning effort
    dcode --model openai:gpt-5.5 --model-params '{"reasoning": {"effort": "high"}}'
    
    # Anthropic extended thinking
    dcode --model anthropic:claude-opus-4-8 --model-params '{"thinking": {"type": "enabled", "budget_tokens": 10000}, "max_tokens": 16000}'
    ```
    
2.  **Mid-session via `/model --model-params`.** Same JSON syntax—swaps params (and optionally the model) without restarting:
    
    ```
    /model --model-params '{"temperature": 0.7}' anthropic:claude-opus-4-8
    /model --model-params '{"num_ctx": 16384}'           # opens selector, applies params to choice
    ```
    
3.  **Persistent in `config.toml`.** Provider-level defaults (with optional per-model sub-tables) that apply on every launch:
    
    ```
    [models.providers.anthropic.params]
    thinking = { type = "enabled", budget_tokens = 10000 }
    max_tokens = 16000
    
    [models.providers.openai.params]
    reasoning = { effort = "high", summary = "auto" }
    output_version = "responses/v1"
    
    [models.providers.ollama.params]
    num_ctx = 16384
    temperature = 0
    
    # Per-model override—wins over provider-level keys
    [models.providers.ollama.params."qwen3:4b"]
    temperature = 0.5
    ```
    

CLI flags override config-file `params` and are session-only (mid-session changes are not persisted). Per-model sub-tables in `config.toml` override provider-level keys (shallow merge—see [Model constructor params](https://docs.langchain.com/oss/javascript/deepagents/code/configuration#model-constructor-params) for full semantics). `--model-params` cannot be combined with `--default`. For retry counts, prefer `--max-retries` or the top-level [`[retries]` config](https://docs.langchain.com/oss/javascript/deepagents/code/configuration#retries).

To override fields on the model’s runtime _profile_ (`max_input_tokens`, `tool_calling`, capability flags)—distinct from constructor params—see [Profile overrides](https://docs.langchain.com/oss/javascript/deepagents/code/configuration#profile-overrides-advanced).

## Advanced configuration

For detailed configuration of provider params, profile overrides, custom base URLs, compatible APIs, arbitrary providers, and lifecycle hooks, see [Configuration](https://docs.langchain.com/oss/javascript/deepagents/code/configuration).

---
