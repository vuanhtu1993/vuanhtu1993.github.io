---
title: "Guides: Analytics"
source_url: "https://nextjs.org/docs/app/guides/analytics"
crawled_at: "2026-06-25T06:57:37.634Z"
---

## How to add analytics to your Next.js application

Last updated

May 13, 2025

Next.js has built-in support for measuring and reporting performance metrics. You can either use the [`useReportWebVitals`](https://nextjs.org/docs/app/api-reference/functions/use-report-web-vitals) hook to manage reporting yourself, or alternatively, Vercel provides a [managed service](https://vercel.com/analytics?utm_source=next-site&utm_medium=docs&utm_campaign=next-website) to automatically collect and visualize metrics for you.

## Client Instrumentation[](#client-instrumentation)

For more advanced analytics and monitoring needs, Next.js provides a `instrumentation-client.js|ts` file that runs before your application's frontend code starts executing. This is ideal for setting up global analytics, error tracking, or performance monitoring tools.

To use it, create an `instrumentation-client.js` or `instrumentation-client.ts` file in your application's root directory:

## Build Your Own[](#build-your-own)

> Since the `useReportWebVitals` hook requires the `'use client'` directive, the most performant approach is to create a separate component that the root layout imports. This confines the client boundary exclusively to the `WebVitals` component.

View the [API Reference](https://nextjs.org/docs/app/api-reference/functions/use-report-web-vitals) for more information.

## Web Vitals[](#web-vitals)

[Web Vitals](https://web.dev/vitals/) are a set of useful metrics that aim to capture the user experience of a web page. The following web vitals are all included:

-   [Time to First Byte](https://developer.mozilla.org/docs/Glossary/Time_to_first_byte) (TTFB)
-   [First Contentful Paint](https://developer.mozilla.org/docs/Glossary/First_contentful_paint) (FCP)
-   [Largest Contentful Paint](https://web.dev/lcp/) (LCP)
-   [First Input Delay](https://web.dev/fid/) (FID)
-   [Cumulative Layout Shift](https://web.dev/cls/) (CLS)
-   [Interaction to Next Paint](https://web.dev/inp/) (INP)

You can handle all the results of these metrics using the `name` property.

## Sending results to external systems[](#sending-results-to-external-systems)

You can send results to any endpoint to measure and track real user performance on your site. For example:

> **Good to know**: If you use [Google Analytics](https://analytics.google.com/analytics/web/), using the `id` value can allow you to construct metric distributions manually (to calculate percentiles, etc.)

> Read more about [sending results to Google Analytics](https://github.com/GoogleChrome/web-vitals#send-the-results-to-google-analytics).
