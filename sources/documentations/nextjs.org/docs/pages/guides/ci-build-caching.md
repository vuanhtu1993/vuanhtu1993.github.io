---
title: "Guides: CI Build Caching"
source_url: "https://nextjs.org/docs/pages/guides/ci-build-caching"
crawled_at: "2026-06-25T07:22:01.865Z"
---

## How to configure Continuous Integration (CI) build caching

Last updated

April 22, 2025

To improve build performance, Next.js saves a cache to `.next/cache` that is shared between builds.

To take advantage of this cache in Continuous Integration (CI) environments, your CI workflow will need to be configured to correctly persist the cache between builds.

> If your CI is not configured to persist `.next/cache` between builds, you may see a [No Cache Detected](https://nextjs.org/docs/messages/no-cache) error.

Here are some example cache configurations for common CI providers:

## Vercel[](#vercel)

Next.js caching is automatically configured for you. There's no action required on your part. If you are using Turborepo on Vercel, [learn more here](https://vercel.com/docs/monorepos/turborepo).

## CircleCI[](#circleci)

Edit your `save_cache` step in `.circleci/config.yml` to include `.next/cache`:

If you do not have a `save_cache` key, please follow CircleCI's [documentation on setting up build caching](https://circleci.com/docs/2.0/caching/).

## Travis CI[](#travis-ci)

Add or merge the following into your `.travis.yml`:

## GitLab CI[](#gitlab-ci)

Add or merge the following into your `.gitlab-ci.yml`:

## Netlify CI[](#netlify-ci)

Use [Netlify Plugins](https://www.netlify.com/products/build/plugins/) with [`@netlify/plugin-nextjs`](https://www.npmjs.com/package/@netlify/plugin-nextjs).

## AWS CodeBuild[](#aws-codebuild)

Add (or merge in) the following to your `buildspec.yml`:

## GitHub Actions[](#github-actions)

Using GitHub's [actions/cache](https://github.com/actions/cache), add the following step in your workflow file:

## Bitbucket Pipelines[](#bitbucket-pipelines)

Add or merge the following into your `bitbucket-pipelines.yml` at the top level (same level as `pipelines`):

Then reference it in the `caches` section of your pipeline's `step`:

## Heroku[](#heroku)

Using Heroku's [custom cache](https://devcenter.heroku.com/articles/nodejs-support#custom-caching), add a `cacheDirectories` array in your top-level package.json:

## Azure Pipelines[](#azure-pipelines)

Using Azure Pipelines' [Cache task](https://docs.microsoft.com/en-us/azure/devops/pipelines/tasks/utility/cache), add the following task to your pipeline yaml file somewhere prior to the task that executes `next build`:

## Jenkins (Pipeline)[](#jenkins-pipeline)

Using Jenkins' [Job Cacher](https://www.jenkins.io/doc/pipeline/steps/jobcacher/) plugin, add the following build step to your `Jenkinsfile` where you would normally run `next build` or `npm install`:
