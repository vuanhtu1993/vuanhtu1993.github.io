---
title: "Feature availability - Claude Code Docs"
source_url: "https://code.claude.com/docs/en/feature-availability"
crawled_at: "2026-11-01T16:42:38.554Z"
---

Deployment

Compare which Claude Code features are available across Anthropic subscription plans, the Anthropic Console, Amazon Bedrock, Claude Platform on AWS, Google Cloud’s Agent Platform, and Microsoft Foundry.

The Claude Code CLI and everything that runs locally work on every provider. For setup instructions per provider, see the [Enterprise deployment overview](https://code.claude.com/docs/en/third-party-integrations). To skip straight to what is missing on your provider, see the [summary by provider](#summary-by-provider) tabs. In the tables below, ✓ means available, ✗ means not available, and “See note” links to a footnote for partial support. A qualifier after ✓ narrows availability to that subset, and “Admin-enabled” means the feature is off until an organization admin turns it on.

## Availability by model provider

How you authenticate determines which features Claude Code can reach. For a single list of what is missing on your provider, see the [summary by provider](#summary-by-provider) tabs. To find your column in the tables:

-   **Claude subscription**: you sign in with a claude.ai account on the Pro, Max, Ultra, Team, or Enterprise plan
-   **Anthropic Console**: you authenticate with an Anthropic API key or by [signing in to a Console account without one](https://code.claude.com/docs/en/authentication#sign-in-without-an-api-key)
-   **Amazon Bedrock**: you use Claude models from the Amazon Bedrock model catalog and set `CLAUDE_CODE_USE_BEDROCK`. The [Mantle endpoint](https://code.claude.com/docs/en/amazon-bedrock#use-the-mantle-endpoint) (`CLAUDE_CODE_USE_MANTLE`) is covered by this column
-   **Claude Platform on AWS**: you bought Claude through AWS Marketplace but call the Anthropic API, and set `CLAUDE_CODE_USE_ANTHROPIC_AWS`
-   **Google Cloud’s Agent Platform**: Google-operated; you set `CLAUDE_CODE_USE_VERTEX`
-   **Microsoft Foundry**: Anthropic-operated; you set `CLAUDE_CODE_USE_FOUNDRY`

### Features available on every provider

These work on every provider:

-   [CLI](https://code.claude.com/docs/en/quickstart) and [Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview)
-   [VS Code](https://code.claude.com/docs/en/vs-code) and [JetBrains](https://code.claude.com/docs/en/jetbrains) extensions
-   [Subagents](https://code.claude.com/docs/en/sub-agents), [hooks](https://code.claude.com/docs/en/hooks-guide), [commands](https://code.claude.com/docs/en/commands), and [skills](https://code.claude.com/docs/en/skills)
-   [CLAUDE.md memory](https://code.claude.com/docs/en/memory), [plugins](https://code.claude.com/docs/en/plugins/overview), and [MCP servers](https://code.claude.com/docs/en/mcp)
-   [Checkpoints](https://code.claude.com/docs/en/checkpointing), [sandboxing](https://code.claude.com/docs/en/sandboxing), and [Workflows](https://code.claude.com/docs/en/workflows)
-   [OpenTelemetry metrics](https://code.claude.com/docs/en/monitoring-usage) and the [managed settings file](https://code.claude.com/docs/en/managed-settings#delivery-mechanisms)

These have provider-specific differences:

-   **MCP servers**: [connectors from claude.ai](https://code.claude.com/docs/en/mcp#use-mcp-servers-from-claude-ai) load only when your claude.ai subscription is the active authentication method. [Tool search](https://code.claude.com/docs/en/mcp#configure-tool-search) isn’t supported on Microsoft Foundry [deployments hosted on Azure](https://platform.claude.com/docs/en/build-with-claude/claude-in-microsoft-foundry#hosting-options). On Google Cloud’s Agent Platform, tool search isn’t supported on models earlier than Claude Opus 4.5, Claude Sonnet 4.5, and Claude Haiku 4.5
-   **Subagents**: when the main conversation runs Fable, the built-in [Explore subagent](https://code.claude.com/docs/en/sub-agents#built-in-subagents) runs on Opus with a Claude subscription, an Anthropic Console account, or an [LLM gateway](https://code.claude.com/docs/en/llm-gateway) reached through `ANTHROPIC_BASE_URL`. On other providers, including Claude Platform on AWS, it runs on Fable
-   **[Commands](https://code.claude.com/docs/en/commands#all-commands)**:
    -   `/design-sync` and `/import` with its `claude import` subcommand form are unavailable on Amazon Bedrock, Google Cloud’s Agent Platform, Microsoft Foundry, and Claude Platform on AWS, and through a [Claude apps gateway](https://code.claude.com/docs/en/claude-apps-gateway#availability-and-limitations)
    -   `/voice` requires a claude.ai account
    -   `/list-agents` and its alias `/peers` are available only in sessions where [cross-session messaging is enabled](https://code.claude.com/docs/en/cross-session-messaging#availability)

### Features that require a Claude subscription

These require signing in with a claude.ai account and are not reachable with an Anthropic Console API key or from a third-party provider:

-   [Cloud sessions](https://code.claude.com/docs/en/claude-code-on-the-web) and Claude Code on mobile
-   [Claude Code in Slack](https://code.claude.com/docs/en/slack): Pro, Max, and Ultra plans
-   [Claude Code Desktop](https://code.claude.com/docs/en/desktop)
-   [Cloud scheduled tasks](https://code.claude.com/docs/en/routines) (`/schedule`)
-   [Ultrareview](https://code.claude.com/docs/en/ultrareview)
-   [Code Review](https://code.claude.com/docs/en/code-review): Team and Enterprise plans
-   [Remote Control](https://code.claude.com/docs/en/remote-control)
-   [Chrome extension](https://code.claude.com/docs/en/chrome)
-   [Computer use](https://code.claude.com/docs/en/computer-use): Pro, Max, and Ultra plans
-   [Artifacts](https://code.claude.com/docs/en/artifacts): Pro, Max, Ultra, Team, and Enterprise plans
-   [Voice dictation](https://code.claude.com/docs/en/voice-dictation)

Desktop is the partial exception: [gateway routing can be configured in the app or by an administrator](https://code.claude.com/docs/en/llm-gateway-connect#desktop-app). [Claude Desktop on 3P](https://claude.com/docs/third-party/claude-desktop/overview) also runs the Code tab on Amazon Bedrock, Google Cloud’s Agent Platform, Microsoft Foundry, or a self-hosted LLM gateway. It also runs the Code tab on the [Claude API](https://claude.com/docs/third-party/claude-desktop/claude-api) with an Anthropic Console API key. For per-plan availability of these features, see [Availability by subscription plan](#availability-by-subscription-plan).

### CLI capabilities that vary by provider

These features work in the local CLI but depend on a server-side capability that not every provider exposes.

| Feature | Claude subscription | Anthropic Console | Amazon Bedrock | Claude Platform on AWS | Google Cloud’s Agent Platform | Microsoft Foundry |
| --- | --- | --- | --- | --- | --- | --- |
| [Web search](https://code.claude.com/docs/en/tools-reference#websearch-tool-behavior) | ✓ | ✓ | ✗ | ✓ | See note [1](#fn1) | ✓ |
| [Fast mode](https://code.claude.com/docs/en/fast-mode) | ✓ ([Owner-enabled](https://code.claude.com/docs/en/fast-mode#enable-fast-mode-for-your-organization) on Team and Enterprise) | ✓ (Opus 5 and 4.8 need provisioning) | ✗ | ✗ | ✗ | ✗ |
| [Auto mode](https://code.claude.com/docs/en/auto-mode-config) | ✓ | ✓ | See note [2](#fn2) | ✓ | See note [2](#fn2) | See note [2](#fn2) |
| [Advisor](https://code.claude.com/docs/en/advisor) | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| [Cross-session messaging](https://code.claude.com/docs/en/cross-session-messaging) | ✓ [5](#fn5) | ✓ (same machine) [5](#fn5) | ✓ (same machine) [5](#fn5) | ✓ (same machine) [5](#fn5) | ✓ (same machine) [5](#fn5) | ✓ (same machine) [5](#fn5) |
| [Channels](https://code.claude.com/docs/en/channels) | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| [GitHub Actions](https://code.claude.com/docs/en/github-actions) | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| [GitLab CI/CD](https://code.claude.com/docs/en/gitlab-ci-cd) | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |

### Admin and analytics

Organization-level controls and usage visibility.

| Feature | Claude subscription | Anthropic Console | Amazon Bedrock | Claude Platform on AWS | Google Cloud’s Agent Platform | Microsoft Foundry |
| --- | --- | --- | --- | --- | --- | --- |
| [Analytics dashboard and API](https://code.claude.com/docs/en/analytics) | ✓ (dashboard: Team and Enterprise; API: Enterprise) | ✓ [4](#fn4) | ✗ | ✗ | ✗ | ✗ |
| [Server-managed settings](https://code.claude.com/docs/en/server-managed-settings) | ✓ (Team and Enterprise) | See [Platform availability](https://code.claude.com/docs/en/server-managed-settings#platform-availability) | ✗ | ✗ | ✗ | ✗ |
| [Zero Data Retention](https://code.claude.com/docs/en/zero-data-retention) | ✓ (qualified Enterprise accounts) | ✓ (qualified accounts) | See note [3](#fn3) | ✓ (qualified accounts) | See note [3](#fn3) | See note [3](#fn3) |

1 On Google Cloud’s Agent Platform, web search is available for Opus 4, Sonnet 4, Haiku 4.5, and later models.  
2 On these providers, auto mode supports only Claude Sonnet 5 or later, Opus 4.7 or later, Haiku 5.5, and the Fable models. See [Auto mode configuration](https://code.claude.com/docs/en/auto-mode-config). For the permission mode a session on these providers starts in, see [Which mode a session starts in](https://code.claude.com/docs/en/permission-modes#which-mode-a-session-starts-in).  
3 Subject to your agreement with the cloud provider.  
4 Dashboard and API only. [Contribution metrics](https://code.claude.com/docs/en/analytics#enable-contribution-metrics) requires a claude.ai Team or Enterprise organization.  
5 Requires Claude Code v2.1.224 or later on macOS and Linux, including Linux inside WSL 2. On native Windows, requires Claude Code v2.1.234 or later. With API key authentication, messaging is same-machine only. On Amazon Bedrock, Claude Platform on AWS, Google Cloud’s Agent Platform, and Microsoft Foundry, messaging is same-machine only and requires Claude Code v2.1.248 or later. Claude can find your [cloud sessions](https://code.claude.com/docs/en/claude-code-on-the-web) and your sessions on other machines only from a session that is connected to [Remote Control](https://code.claude.com/docs/en/remote-control). To connect, you need a claude.ai sign-in and the other [Remote Control requirements](https://code.claude.com/docs/en/remote-control#requirements). See [Message sessions on other machines](https://code.claude.com/docs/en/cross-session-messaging#message-sessions-on-other-machines).

### Summary by provider

Each tab lists what is unavailable or partially supported on that provider, with alternatives where one exists. Everything not listed works the same as on a Claude subscription, apart from the [provider-specific differences](#features-available-on-every-provider) noted above. On Amazon Bedrock, Google Cloud’s Agent Platform, Microsoft Foundry, and Claude Platform on AWS, error reporting and telemetry to Anthropic are off by default. See [default behaviors by API provider](https://code.claude.com/docs/en/data-usage#default-behaviors-by-api-provider) for what traffic still reaches Anthropic and how to opt out.

-   Amazon Bedrock
    
-   Claude Platform on AWS
    
-   Google Cloud's Agent Platform
    
-   Microsoft Foundry
    
-   Anthropic Console
    

**Not available:** all [features that require a Claude subscription](#features-that-require-a-claude-subscription), plus [web search](https://code.claude.com/docs/en/tools-reference#websearch-tool-behavior), [fast mode](https://code.claude.com/docs/en/fast-mode), [Advisor](https://code.claude.com/docs/en/advisor), [Channels](https://code.claude.com/docs/en/channels), the [analytics dashboard](https://code.claude.com/docs/en/analytics), [server-managed settings](https://code.claude.com/docs/en/server-managed-settings), and the [`/design-sync` and `/import` commands](https://code.claude.com/docs/en/commands#all-commands).**Partial support:**

-   [Desktop](https://code.claude.com/docs/en/desktop): only via [Claude Desktop on 3P](https://claude.com/docs/third-party/claude-desktop/overview)
-   [Auto mode](https://code.claude.com/docs/en/auto-mode-config): Sonnet 5 or later, Opus 4.7 or later, Haiku 5.5, and Fable models only
-   [Cross-session messaging](https://code.claude.com/docs/en/cross-session-messaging): between your sessions on this machine only [5](#fn5)
-   [Zero Data Retention](https://code.claude.com/docs/en/zero-data-retention): subject to your AWS agreement

**Alternatives:** for scheduling, use [`/loop`](https://code.claude.com/docs/en/scheduled-tasks) instead of `/schedule`. For cloud sessions, use [GitHub Actions](https://code.claude.com/docs/en/github-actions) or [GitLab CI/CD](https://code.claude.com/docs/en/gitlab-ci-cd). For web lookups, use the [WebFetch tool](https://code.claude.com/docs/en/tools-reference#webfetch-tool-behavior) with a specific URL.

**Not available:** all [features that require a Claude subscription](#features-that-require-a-claude-subscription), plus [fast mode](https://code.claude.com/docs/en/fast-mode), [Advisor](https://code.claude.com/docs/en/advisor), [Channels](https://code.claude.com/docs/en/channels), the [analytics dashboard](https://code.claude.com/docs/en/analytics), [server-managed settings](https://code.claude.com/docs/en/server-managed-settings), and the [`/design-sync` and `/import` commands](https://code.claude.com/docs/en/commands#all-commands).**Partial support:**

-   [Desktop](https://code.claude.com/docs/en/desktop): via [managed settings](https://claude.com/docs/third-party/claude-desktop/configuration) or [Claude Desktop on 3P](https://claude.com/docs/third-party/claude-desktop/overview)
-   [Web search](https://code.claude.com/docs/en/tools-reference#websearch-tool-behavior): Opus 4, Sonnet 4, Haiku 4.5, and later models
-   [Auto mode](https://code.claude.com/docs/en/auto-mode-config): Sonnet 5 or later, Opus 4.7 or later, Haiku 5.5, and Fable models only
-   [Cross-session messaging](https://code.claude.com/docs/en/cross-session-messaging): between your sessions on this machine only [5](#fn5)
-   [Zero Data Retention](https://code.claude.com/docs/en/zero-data-retention): subject to your Google Cloud agreement

**Alternatives:** for scheduling, use [`/loop`](https://code.claude.com/docs/en/scheduled-tasks) instead of `/schedule`. For cloud sessions, use [GitHub Actions](https://code.claude.com/docs/en/github-actions) or [GitLab CI/CD](https://code.claude.com/docs/en/gitlab-ci-cd).

**Not available:** all [features that require a Claude subscription](#features-that-require-a-claude-subscription), plus [fast mode](https://code.claude.com/docs/en/fast-mode), [Advisor](https://code.claude.com/docs/en/advisor), [Channels](https://code.claude.com/docs/en/channels), [GitLab CI/CD](https://code.claude.com/docs/en/gitlab-ci-cd), the [analytics dashboard](https://code.claude.com/docs/en/analytics), [server-managed settings](https://code.claude.com/docs/en/server-managed-settings), and the [`/design-sync` and `/import` commands](https://code.claude.com/docs/en/commands#all-commands).**Partial support:**

-   [Desktop](https://code.claude.com/docs/en/desktop): only via [Claude Desktop on 3P](https://claude.com/docs/third-party/claude-desktop/overview)
-   [Auto mode](https://code.claude.com/docs/en/auto-mode-config): Sonnet 5 or later, Opus 4.7 or later, Haiku 5.5, and Fable models only
-   [Cross-session messaging](https://code.claude.com/docs/en/cross-session-messaging): between your sessions on this machine only [5](#fn5)
-   [Zero Data Retention](https://code.claude.com/docs/en/zero-data-retention): subject to your Azure agreement

**Alternatives:** for scheduling, use [`/loop`](https://code.claude.com/docs/en/scheduled-tasks) instead of `/schedule`. For cloud sessions, use [GitHub Actions](https://code.claude.com/docs/en/github-actions).

## Availability by subscription plan

If you authenticate through Amazon Bedrock, Google Cloud’s Agent Platform, Microsoft Foundry, or an Anthropic Console API key, this section does not apply to you. When you sign in with a claude.ai account, your plan determines which of the features below are available. In Enterprise organizations with the [HIPAA configuration](https://code.claude.com/docs/en/hipaa-setup) applied, some features in this table are turned off.

| Feature | Pro | Max | Ultra | Team | Enterprise |
| --- | --- | --- | --- | --- | --- |
| [Cloud sessions](https://code.claude.com/docs/en/claude-code-on-the-web) | ✓ | ✓ | ✓ | ✓ | ✓ [6](#fn6) |
| [Cloud scheduled tasks](https://code.claude.com/docs/en/routines) | ✓ | ✓ | ✓ | ✓ | ✓ |
| [Remote Control](https://code.claude.com/docs/en/remote-control) | ✓ | ✓ | ✓ | Admin-enabled | Admin-enabled |
| [Channels](https://code.claude.com/docs/en/channels) | ✓ | ✓ | ✓ | Admin-enabled | Admin-enabled |
| [Computer use](https://code.claude.com/docs/en/computer-use) | ✓ | ✓ | ✓ | ✗ | ✗ |
| Dispatch ([Desktop](https://code.claude.com/docs/en/desktop#sessions-from-dispatch)) | ✓ | ✓ | ✓ | ✗ | ✗ |
| [Code Review](https://code.claude.com/docs/en/code-review) | ✗ | ✗ | ✗ | ✓ | ✓ |
| [Artifacts](https://code.claude.com/docs/en/artifacts) | ✓ | ✓ | ✓ | ✓ | ✓ |
| [Analytics dashboard and contribution metrics](https://code.claude.com/docs/en/analytics) | ✗ | ✗ | ✗ | ✓ | ✓ |
| [Enterprise Analytics API](https://code.claude.com/docs/en/analytics#access-data-programmatically) | ✗ | ✗ | ✗ | ✗ | ✓ |
| [Server-managed settings](https://code.claude.com/docs/en/server-managed-settings) | ✗ | ✗ | ✗ | ✓ | ✓ |
| [SSO](https://support.claude.com/en/articles/9266767-what-is-the-team-plan) | ✗ | ✗ | ✗ | ✓ | ✓ |
| SCIM | ✗ | ✗ | ✗ | ✗ | ✓ |
| [Compliance API](https://platform.claude.com/docs/en/api/compliance) | ✗ | ✗ | ✗ | ✗ | ✓ |
| [Zero Data Retention](https://code.claude.com/docs/en/zero-data-retention) | ✗ | ✗ | ✗ | ✗ | ✓ [7](#fn7) |

6 On Enterprise, requires a premium seat or a Chat + Claude Code seat. See [Use Claude Code in the cloud](https://code.claude.com/docs/en/claude-code-on-the-web).  
7 Not included in the standard Enterprise plan. Requires separate enablement by Anthropic for qualified accounts. See [Zero Data Retention](https://code.claude.com/docs/en/zero-data-retention). For pricing and the full plan comparison, see [Team plans](https://support.claude.com/en/articles/9266767-what-is-the-team-plan) and [Enterprise plans](https://support.claude.com/en/articles/9797531-what-is-the-enterprise-plan).

### Ultra plan

Ultra is the new name for the Max 20x plan, and Max is the new name for Max 5x. To check which plan you’re on, see your subscription on claude.ai. In Claude Code, Max and Ultra have the same features, listed in the Max and Ultra columns of the [availability table](#availability-by-subscription-plan). For usage limits and pricing, see the [Claude pricing page](https://claude.com/pricing).

## Model availability

For which Claude models and context-window sizes are available per provider and region, see [Model configuration](https://code.claude.com/docs/en/model-config) and the [Models overview](https://platform.claude.com/docs/en/about-claude/models/overview). Vision, PDF input, and extended thinking are model capabilities rather than Claude Code features and work on every provider that offers the model. [Prompt caching](https://code.claude.com/docs/en/prompt-caching) works the same way on most providers; on Amazon Bedrock, support varies by model.

-   [Enterprise deployment overview](https://code.claude.com/docs/en/third-party-integrations): compare authentication, billing, and regions across providers
-   Provider setup guides: [Amazon Bedrock](https://code.claude.com/docs/en/amazon-bedrock), [Claude Platform on AWS](https://code.claude.com/docs/en/claude-platform-on-aws), [Google Cloud’s Agent Platform](https://code.claude.com/docs/en/google-vertex-ai), [Microsoft Foundry](https://code.claude.com/docs/en/microsoft-foundry)
-   [Platforms and integrations](https://code.claude.com/docs/en/platforms): where Claude Code runs, including the CLI, Desktop, IDE extensions, web, mobile, and CI/CD
