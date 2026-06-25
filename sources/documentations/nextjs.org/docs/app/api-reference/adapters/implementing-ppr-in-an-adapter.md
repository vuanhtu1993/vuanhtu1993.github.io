---
title: "Adapters: Implementing PPR in an Adapter"
source_url: "https://nextjs.org/docs/app/api-reference/adapters/implementing-ppr-in-an-adapter"
crawled_at: "2026-06-25T07:19:58.329Z"
---

Last updated

March 31, 2026

For partially prerendered app routes, `onBuildComplete` gives you the data needed to seed and resume PPR:

-   `outputs.prerenders[].fallback.filePath`: path to the generated fallback shell (for example HTML)
-   `outputs.prerenders[].fallback.postponedState`: serialized postponed state used to resume rendering

## 1\. Seed shell + postponed state at build time[](#1-seed-shell--postponed-state-at-build-time)

## 2\. Runtime flow: serve cached shell and resume in background[](#2-runtime-flow-serve-cached-shell-and-resume-in-background)

At request time, you can stream a single response that is the concatenation of:

1.  cached HTML shell stream
2.  resumed render stream (generated after invoking `handler` with postponed state)

## 3\. Update cache with `requestMeta.onCacheEntryV2`[](#3-update-cache-with-requestmetaoncacheentryv2)

`requestMeta.onCacheEntryV2` is called when a response cache entry is looked up or generated. Use it to persist updated shell/postponed data.

-   `requestMeta.onCacheEntry` still works, but is deprecated.
-   Prefer `requestMeta.onCacheEntryV2`.
-   If your adapter uses an internal `onCacheCallback` abstraction, wire it to `requestMeta.onCacheEntryV2`.
