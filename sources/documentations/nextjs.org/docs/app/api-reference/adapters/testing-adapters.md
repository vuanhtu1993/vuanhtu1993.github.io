---
title: "Adapters: Testing Adapters"
source_url: "https://nextjs.org/docs/app/api-reference/adapters/testing-adapters"
crawled_at: "2026-06-25T07:19:46.293Z"
---

Last updated

April 2, 2026

Next.js provides a test harness for validating adapters. Running the end-to-end tests for deployment.

Example GitHub Actions workflow:

The test harness looks for these environment variables:

-   `NEXT_TEST_DEPLOY_SCRIPT_PATH`: Path to the executable that builds and deploys the isolated test app
-   `NEXT_TEST_DEPLOY_LOGS_SCRIPT_PATH`: Path to the executable that returns build and runtime logs for that deployment
-   `NEXT_TEST_CLEANUP_SCRIPT_PATH`: Path to the optional executable that tears the deployment down after the test run

## Custom deploy script contract[](#custom-deploy-script-contract)

The deploy script `NEXT_TEST_DEPLOY_SCRIPT_PATH` is executed with `cwd` set to the isolated temporary app created by the Next.js test harness.

The deploy script must follow this contract:

-   Exit with a non-zero code on failure.
-   Print the deployment URL to `stdout`. This will be used to verify the deployment. Avoid writing anything else to `stdout`.
-   Write diagnostic output to `stderr` or to files inside the working directory.

Because the deploy script and logs script run as separate processes, any data you want to use later, such as build IDs or server logs, should be persisted to files inside the working directory.

Example deploy script:

## Custom logs script contract[](#custom-logs-script-contract)

The logs script `NEXT_TEST_DEPLOY_LOGS_SCRIPT_PATH` is executed with `cwd` set to the isolated temporary app created by the Next.js test harness.

Additionally it receives `NEXT_TEST_DIR` and `NEXT_TEST_DEPLOY_URL` as environment variables.

Its output must include lines starting with:

-   `BUILD_ID:`
-   `DEPLOYMENT_ID:`
-   `IMMUTABLE_ASSET_TOKEN:` (use the value `undefined` if your adapter does not produce one)

After those markers, the logs script can print any additional build or server logs that would help debug failures.

One pattern is to have the deploy script write `.adapter-build.log` and `.adapter-server.log`, then have the logs script replay those files so the harness can extract the required markers. This is one option, each platform has different ways to get the logs.

## Custom cleanup script contract[](#custom-cleanup-script-contract)

The cleanup script `NEXT_TEST_CLEANUP_SCRIPT_PATH` is executed with `cwd` set to the isolated temporary app created by the Next.js test harness.

Additionally it receives `NEXT_TEST_DIR` and `NEXT_TEST_DEPLOY_URL` as environment variables.

The cleanup script can be used to clean up any resources created by the deploy script. It runs after the tests have completed.
