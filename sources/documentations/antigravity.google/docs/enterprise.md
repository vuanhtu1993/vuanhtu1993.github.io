---
title: "Google Antigravity Documentation"
source_url: "https://antigravity.google/docs/enterprise"
crawled_at: "2026-06-12T03:40:58.621Z"
---

-   side\_navigation
-   Enterprise

## Getting Started with Antigravity and Gemini Enterprise Agent Platform

This guide is for administrators setting up the Google Cloud environment to enable Antigravity integration with Gemini Enterprise Agent Platform. This integration allows enterprise developers to use Antigravity with models hosted in your own Google Cloud project, under Google Cloud Terms of Service, satisfying private networking and data residency requirements, and utilizing consumption-based billing.

## Basic Setup

### Prerequisites

Before you begin, ensure you have:

-   A Google Cloud account.
-   Access to the Google Cloud console.

### Step 1: Select or Create a Google Cloud Project

In the Google Cloud console, on the project selector page, select or create a Google Cloud project.

### Roles Required to Select or Create a Project

-   **Select a project**: Selecting a project doesn't require a specific IAM role—you can select any project that you've been granted a role on.

info

**Note**: To switch to a different Google Cloud project or location, you must first log out of the Antigravity CLI or Hub, then log back in and select your new project/location. Directly changing the project or location while logged in is currently not supported.

-   **Create a project**: To create a project, you need the **Project Creator** role (`roles/resourcemanager.projectCreator`), which contains the `resourcemanager.projects.create` permission. [Learn how to grant roles](https://cloud.google.com/iam/docs/granting-changing-revoking-access).

info

**Note**: If you don't plan to keep the resources that you create in this procedure, create a new project instead of selecting an existing project. After you finish these steps, you can delete the project to remove all associated resources.

[Go to project selector](https://console.cloud.google.com/projectselector2)

### Step 2: Verify Billing

Verify that billing is enabled for your Google Cloud project. You can check the billing status in the [Google Cloud Billing Console](https://console.cloud.google.com/billing). For detailed instructions, see [Verify the billing status of your projects](https://cloud.google.com/billing/docs/how-to/verify-billing-enabled).

### Step 3: Enable the Agent Platform API

To use Antigravity with Gemini Enterprise Agent Platform, you must enable the Agent Platform API (`aiplatform.googleapis.com`).

### Roles Required to Enable APIs

To enable APIs, you need the **Service Usage Admin** IAM role (`roles/serviceusage.serviceUsageAdmin`), which contains the `serviceusage.services.enable` permission. [Learn how to grant roles](https://cloud.google.com/iam/docs/granting-changing-revoking-access).

### Enable the API

[Enable the Agent Platform API in the API Library](https://console.cloud.google.com/apis/library/aiplatform.googleapis.com)

### User Permissions

To get the permissions that you need to use Gemini Enterprise Agent Platform, ask your administrator to grant you the **Agent Platform User** (`roles/aiplatform.user`) IAM role on your project. For more information about granting roles, see [Manage access to projects, folders, and organizations](https://cloud.google.com/iam/docs/granting-changing-revoking-access).

You might also be able to get the required permissions through [custom roles](https://cloud.google.com/iam/docs/creating-custom-roles) or other [predefined roles](https://cloud.google.com/iam/docs/roles-overview#predefined).

## Advanced Configuration

### Request and Response Logging

For detailed instructions on how to enable and configure request and response logging for the Gemini Enterprise Agent Platform, please refer to the official documentation:

[Request and Response Logging Documentation](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/capabilities/request-response-logging)

### VPC Service Controls (VPC-SC)

If your organization has a service perimeter, then you must add the following resources to your perimeter:

-   Agent Platform API

For detailed instructions on how to configure VPC Service Controls, please refer to the official documentation:

[VPC Service Controls Documentation](https://docs.cloud.google.com/gemini-enterprise-agent-platform/machine-learning/general/vpc-service-controls)

## Complementary Resources

### Consumption Options

Gemini Enterprise Agent Platform offers different consumption options to suit your needs.

For detailed information on consumption options, please refer to the official documentation:

[Consumption Options Documentation](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/deploy/consumption-options)

### Deployments and Endpoints Locations

For now, Antigravity CLI and 2.0 offer 3 endpoints: global, multi-region eu, and multi-region us.

info

**Note**: Image generation is currently not available in `eu` and `us` locations.

For a full list of available locations and deployment endpoints, please refer to the official documentation:

[Deployment Endpoints Documentation](https://docs.cloud.google.com/gemini-enterprise-agent-platform/resources/locations#global)
