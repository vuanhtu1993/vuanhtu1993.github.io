---
title: "Claude Code GitLab CI/CD - Claude Code Docs"
source_url: "https://code.claude.com/docs/en/gitlab-ci-cd"
crawled_at: "2026-11-01T16:38:59.194Z"
---

Run Claude in your own CI

Learn about integrating Claude Code into your development workflow with GitLab CI/CD

## Why use Claude Code with GitLab?

-   **Instant MR creation**: Describe what you need, and Claude proposes a complete MR with changes and explanation
-   **Automated implementation**: Turn issues into working code with a single command or mention
-   **Project-aware**: Claude follows your `CLAUDE.md` guidelines and existing code patterns
-   **Simple setup**: Add one job to `.gitlab-ci.yml` and a masked CI/CD variable
-   **Enterprise-ready**: Choose Claude API, Amazon Bedrock, or Google Cloud’s Agent Platform to meet data residency and procurement needs
-   **Secure by default**: Runs in your GitLab runners with your branch protection and approvals

## How it works

Claude Code uses GitLab CI/CD to run AI tasks in isolated jobs and commit results back via MRs:

1.  **Event-driven orchestration**: GitLab listens for your chosen triggers (for example, a comment that mentions `@claude` in an issue, MR, or review thread). The job collects context from the thread and repository, builds prompts from that input, and runs Claude Code.
2.  **Provider abstraction**: Use the provider that fits your environment:
    -   Claude API (SaaS)
    -   Amazon Bedrock (IAM-based access, cross-region options)
    -   Google Cloud’s Agent Platform (GCP-native, Workload Identity Federation)
3.  **Sandboxed execution**: Each interaction runs in a container with strict network and filesystem rules. Claude Code enforces workspace-scoped permissions to constrain writes. Every change flows through an MR so reviewers see the diff and approvals still apply.

Pick regional endpoints to reduce latency and meet data-sovereignty requirements while using existing cloud agreements.

## What can Claude do?

In a GitLab pipeline, Claude Code can:

-   Create and update MRs from issue descriptions or comments
-   Analyze performance regressions and propose optimizations
-   Implement features directly in a branch, then open an MR
-   Fix bugs and regressions identified by tests or comments
-   Respond to follow-up comments to iterate on requested changes

## Setup

### Quick setup

The fastest way to get started is to add a minimal job to your `.gitlab-ci.yml` and set your API key as a masked variable.

1.  **Add a masked CI/CD variable**
    -   Go to **Settings** → **CI/CD** → **Variables**
    -   Add `ANTHROPIC_API_KEY` (masked, protected as needed)
2.  **Add a Claude job to `.gitlab-ci.yml`**

After adding the job and your `ANTHROPIC_API_KEY` variable, test by running the job manually from **CI/CD** → **Pipelines**, or trigger it from an MR to let Claude propose updates in a branch and open an MR if needed.

### Manual setup (recommended for production)

If you prefer a more controlled setup or need enterprise providers:

1.  **Configure provider access**:
    -   **Claude API**: Create and store `ANTHROPIC_API_KEY` as a masked CI/CD variable
    -   **Amazon Bedrock**: **Configure GitLab** → **AWS OIDC** and create an IAM role for Amazon Bedrock
    -   **Google Cloud’s Agent Platform**: **Configure Workload Identity Federation for GitLab** → **GCP**
2.  **Add project credentials for GitLab API operations**:
    -   Use `CI_JOB_TOKEN` by default, or create a Project Access Token with `api` scope
    -   Store as `GITLAB_ACCESS_TOKEN` (masked) if using a PAT
3.  **Add the Claude job to `.gitlab-ci.yml`**: use the [Quick setup](#quick-setup) job for the Claude API, or a provider job from [Configuration examples](#configuration-examples)
4.  **(Optional) Enable mention-driven triggers**:
    -   Add a project webhook for “Comments (notes)” to your event listener (if you use one)
    -   Have the listener call the pipeline trigger API with variables like `AI_FLOW_INPUT` and `AI_FLOW_CONTEXT` when a comment contains `@claude`

## Example use cases

### Turn issues into MRs

In an issue comment:

Claude analyzes the issue and codebase, writes changes in a branch, and opens an MR for review.

### Get implementation help

In an MR discussion:

Claude proposes changes, adds code with appropriate caching, and updates the MR.

### Fix bugs quickly

In an issue or MR comment:

Claude locates the bug, implements a fix, and updates the branch or opens a new MR.

## Using with Amazon Bedrock and Google Cloud

For enterprise environments, you can run Claude Code entirely on your cloud infrastructure with the same developer experience.

-   Amazon Bedrock
    
-   Google Cloud's Agent Platform
    

### Prerequisites

Before setting up Claude Code with Amazon Bedrock, you need:

1.  An AWS account with Amazon Bedrock access to the desired Claude models
2.  GitLab configured as an OIDC identity provider in AWS IAM
3.  An IAM role with Amazon Bedrock permissions and a trust policy restricted to your GitLab project/refs
4.  GitLab CI/CD variables for role assumption:
    -   `AWS_ROLE_TO_ASSUME` (role ARN)
    -   `AWS_REGION` (Amazon Bedrock region)

### Setup instructions

Configure AWS to allow GitLab CI jobs to assume an IAM role via OIDC (no static keys).**Required setup:**

1.  Enable Amazon Bedrock and request access to your target Claude models
2.  Create an IAM OIDC provider for GitLab if not already present
3.  Create an IAM role trusted by the GitLab OIDC provider, restricted to your project and protected refs
4.  Attach least-privilege permissions for Amazon Bedrock invoke APIs

Use the [Amazon Bedrock job example](#configuration-examples) to exchange the job’s OIDC token for temporary AWS credentials at runtime.

### Prerequisites

Before setting up Claude Code with Google Cloud’s Agent Platform, you need:

1.  A Google Cloud project with:
    -   Google Cloud’s Agent Platform API enabled
    -   Workload Identity Federation configured to trust GitLab OIDC
2.  A dedicated service account with only the required Google Cloud’s Agent Platform roles
3.  GitLab CI/CD variables:
    -   `GCP_WORKLOAD_IDENTITY_PROVIDER` (provider resource name without the `//iam.googleapis.com/` prefix, such as `projects/123456789/locations/global/workloadIdentityPools/my-pool/providers/my-provider`)
    -   `GCP_SERVICE_ACCOUNT` (service account email)
    -   `GCP_PROJECT_ID` (Google Cloud project ID)

### Setup instructions

Configure Google Cloud to allow GitLab CI jobs to impersonate a service account via Workload Identity Federation.**Required setup:**

1.  Enable IAM Credentials API, STS API, and Google Cloud’s Agent Platform API
2.  Create a Workload Identity Pool and provider for GitLab OIDC
3.  Create a dedicated service account with Google Cloud’s Agent Platform roles
4.  Grant the WIF principal permission to impersonate the service account

Use the [Agent Platform job example](#configuration-examples) to authenticate without storing keys.

## Configuration examples

Below are ready-to-use snippets you can adapt to your pipeline.

### Amazon Bedrock job example (OIDC)

**Prerequisites:**

-   Amazon Bedrock enabled with access to your chosen Claude model(s)
-   GitLab OIDC configured in AWS with a role that trusts your GitLab project and refs
-   IAM role with Amazon Bedrock permissions (least privilege recommended)

**Required CI/CD variables:**

-   `AWS_ROLE_TO_ASSUME`: ARN of the IAM role for Amazon Bedrock access
-   `AWS_REGION`: Amazon Bedrock region (for example, `us-west-2`)

GitLab mints the job’s OIDC token from the `id_tokens:` block and exposes it as `GITLAB_OIDC_TOKEN`. Set `aud` to the audience value you configured on the IAM OIDC identity provider in AWS, for example your GitLab instance URL.

### Agent Platform job example (Workload Identity Federation)

**Prerequisites:**

-   Google Cloud’s Agent Platform API enabled in your GCP project
-   Workload Identity Federation configured to trust GitLab OIDC
-   A service account with Google Cloud’s Agent Platform permissions

**Required CI/CD variables:**

-   `GCP_WORKLOAD_IDENTITY_PROVIDER`: provider resource name without the `//iam.googleapis.com/` prefix, such as `projects/123456789/locations/global/workloadIdentityPools/my-pool/providers/my-provider`
-   `GCP_SERVICE_ACCOUNT`: service account email
-   `GCP_PROJECT_ID`: Google Cloud project ID
-   `CLOUD_ML_REGION`: Google Cloud’s Agent Platform region (for example, `us-east5`)

GitLab mints the job’s OIDC token from the `id_tokens:` block and exposes it as `GITLAB_OIDC_TOKEN`. Set `aud` to the audience value you configured on the Workload Identity Pool provider, for example your GitLab instance URL. The job writes the token to a file, and the credential configuration’s `credential_source` entry tells Google’s auth libraries to read it from there. Setting `GOOGLE_APPLICATION_CREDENTIALS` to the credential configuration file makes it available to Claude Code through [Application Default Credentials](https://code.claude.com/docs/en/google-vertex-ai#3-configure-gcp-credentials).

## Best practices

### CLAUDE.md configuration

Create a `CLAUDE.md` file at the repository root to define coding standards, review criteria, and project-specific rules. Claude reads this file during runs and follows your conventions when proposing changes.

### Security considerations

**Never commit API keys or cloud credentials to your repository**. Always use GitLab CI/CD variables:

-   Add `ANTHROPIC_API_KEY` as a masked variable (and protect it if needed)
-   Use provider-specific OIDC where possible (no long-lived keys)
-   Limit job permissions and network egress
-   Review Claude’s MRs like any other contributor

### Optimizing performance

-   Keep `CLAUDE.md` focused and concise
-   Provide clear issue/MR descriptions to reduce iterations
-   Cache npm and package installs in runners where possible

### CI costs

When using Claude Code with GitLab CI/CD, be aware of associated costs:

-   **GitLab Runner time**:
    -   Claude runs on your GitLab runners and consumes compute minutes
    -   See your GitLab plan’s runner billing for details
-   **API costs**:
    -   Each Claude interaction consumes tokens based on prompt and response size
    -   Token usage varies by task complexity and codebase size
    -   See [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing) for details
-   **Cost optimization tips**:
    -   Use specific `@claude` commands to reduce unnecessary turns
    -   Set appropriate `--max-turns` and job `timeout` values
    -   Limit concurrency to control parallel runs

## Troubleshooting

### Claude not responding to @claude commands

-   Verify your pipeline is being triggered (manually, MR event, or via a note event listener/webhook)
-   Ensure your `ANTHROPIC_API_KEY` or cloud provider variables are present
-   Check that the comment contains `@claude` (not `/claude`) and that your mention trigger is configured

### Job can’t write comments or open MRs

-   Ensure `CI_JOB_TOKEN` has sufficient permissions for the project, or use a Project Access Token with `api` scope
-   Check the `mcp__gitlab` tool is enabled in `--allowedTools`
-   Confirm the job runs in the context of the MR or has enough context via `AI_FLOW_*` variables

### Authentication errors

-   **For Claude API**: Confirm `ANTHROPIC_API_KEY` is valid and unexpired
-   **For Amazon Bedrock or Google Cloud’s Agent Platform**: Verify OIDC/WIF configuration, role impersonation, and secret names; confirm region and model availability

## Advanced configuration

### Common parameters and variables

Control Claude Code runs in your jobs with these CLI flags, GitLab keywords, and variables:

-   `-p`: provide instructions inline, for example `claude -p "Review this MR"`
-   `--max-turns`: limit the number of back-and-forth iterations
-   `timeout`: limit total job execution time with GitLab’s job-level `timeout` keyword, for example `timeout: 30m`
-   `ANTHROPIC_API_KEY`: required for the Claude API (not used for Amazon Bedrock or Google Cloud’s Agent Platform)
-   Provider-specific environment: `AWS_REGION`, project/region vars for Google Cloud’s Agent Platform

### Customizing Claude’s behavior

You can guide Claude in two primary ways:

1.  **CLAUDE.md**: Define coding standards, security requirements, and project conventions. Claude reads this during runs and follows your rules.
2.  **Custom prompts**: Pass task-specific instructions via `-p` in the job. Use different prompts for different jobs (for example, review, implement, refactor).
