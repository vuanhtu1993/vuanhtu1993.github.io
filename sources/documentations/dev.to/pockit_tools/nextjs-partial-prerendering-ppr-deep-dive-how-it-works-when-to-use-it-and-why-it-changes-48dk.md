---
title: "Next.js Partial Prerendering (PPR) Deep Dive: How It Works, When to Use It, and Why It Changes Everything"
source_url: "https://dev.to/pockit_tools/nextjs-partial-prerendering-ppr-deep-dive-how-it-works-when-to-use-it-and-why-it-changes-48dk"
crawled_at: "2026-08-07T09:29:49.222Z"
---

Every Next.js developer has faced the same impossible choice: static or dynamic? Pre-render the page at build time for blazing speed (SSG), or render it on every request for fresh data (SSR)? Pick one. You can't have both.

Except now you can. Partial Prerendering (PPR) is the most significant architectural change to Next.js since the App Router itself. It lets you serve a static shell instantly — headers, navigation, layout, above-the-fold content — while streaming dynamic parts (user-specific data, real-time prices, personalized recommendations) in the same HTTP response. No client-side fetches. No layout shift. One request, one response, static speed with dynamic freshness.

This isn't incremental. This is the end of the SSG vs. SSR decision tree. Let's break down exactly how it works, how to implement it, and where it falls apart.

## [](#the-problem-ppr-solves)The Problem PPR Solves

Before PPR, you had four rendering strategies in Next.js, and each one came with a painful tradeoff:

| Strategy | Speed | Freshness | Personalization |
| --- | --- | --- | --- |
| **SSG** (Static Site Generation) | ⚡ Instant | ❌ Stale until rebuild | ❌ Same for everyone |
| **ISR** (Incremental Static Regeneration) | ⚡ Fast | ⚠️ Stale within revalidation window | ❌ Same for everyone |
| **SSR** (Server-Side Rendering) | 🐌 Slow TTFB | ✅ Always fresh | ✅ Per-user |
| **CSR** (Client-Side Rendering) | 🐌 Slow FCP | ✅ Always fresh | ✅ Per-user |

Here's the real-world problem. Take an e-commerce product page:

-   The **product title, description, images** rarely change → these should be static
-   The **price, inventory count, user reviews** change frequently → these need to be dynamic
-   The **"recommended for you" section** is per-user → this must be personalized

With SSG, your prices are stale. With SSR, your Time to First Byte (TTFB) is terrible because you're waiting for the database to return price, inventory, AND recommendations before sending a single byte. With CSR, the user stares at a skeleton screen while three separate API calls resolve.

PPR eliminates this entire matrix. One page, one request: the static parts arrive instantly, the dynamic parts stream in as they resolve.

## [](#how-ppr-actually-works-under-the-hood)How PPR Actually Works Under the Hood

PPR isn't magic, but the architecture is clever. Here's what happens when a request hits a PPR-enabled page:

### [](#step-1-build-time-generate-the-static-shell)Step 1: Build Time — Generate the Static Shell

At `next build`, Next.js renders your page like it would for SSG. But when it hits a `<Suspense>` boundary wrapping a dynamic component, it stops. It doesn't try to resolve that component. Instead, it:

1.  Renders everything outside `<Suspense>` boundaries into a static HTML shell
2.  Injects a **fallback placeholder** where each `<Suspense>` boundary exists
3.  Stores this shell on the CDN/edge, ready to serve instantly

```
// app/product/[id]/page.tsx
import { Suspense } from "react";
import { ProductHeader } from "./ProductHeader";
import { PricingSection } from "./PricingSection";
import { Recommendations } from "./Recommendations";

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id); // Static — fetched at build time

  return (
    <main>
      {/* Static: rendered at build time, served from CDN */}
      <ProductHeader product={product} />

      {/* Dynamic: streamed at request time */}
      <Suspense fallback={<PricingSkeleton />}>
        <PricingSection productId={params.id} />
      </Suspense>

      {/* Dynamic: streamed at request time */}
      <Suspense fallback={<RecommendationsSkeleton />}>
        <Recommendations productId={params.id} />
      </Suspense>
    </main>
  );
}
```

 

### [](#step-2-request-time-serve-shell-stream-dynamic-parts)Step 2: Request Time — Serve Shell + Stream Dynamic Parts

When a user requests `/product/123`:

1.  The CDN immediately serves the **pre-built static shell** (the product title, images, description — everything outside `<Suspense>` boundaries)
2.  Simultaneously, the server begins executing the dynamic components inside `<Suspense>` boundaries
3.  As each dynamic component resolves, its HTML is **streamed into the response** using React's streaming protocol, replacing the fallback

This happens in a **single HTTP request**. The browser starts painting the static shell while the dynamic parts are still resolving on the server. No waterfall. No second round-trip.

### [](#step-3-the-browser-receives-a-progressive-response)Step 3: The Browser Receives a Progressive Response

```
Time (ms)    What the user sees
──────────────────────────────────────────
0            Request sent
50           Static shell arrives → Page is visible!
             (Header, nav, product title, images, skeleton loaders)
120          Price data streams in → Skeleton replaced by real price
200          Recommendations stream in → Skeleton replaced by cards
```

 

Compare this to traditional SSR:  

```
Time (ms)    What the user sees
──────────────────────────────────────────
0            Request sent
350          NOTHING — server waiting for ALL data
350          Full page arrives at once
```

 

The TTFB difference is dramatic. With PPR, your Largest Contentful Paint (LCP) can be **sub-100ms** from the edge, because the static shell is already cached.

## [](#enabling-ppr-stepbystep)Enabling PPR: Step-by-Step

PPR was introduced as experimental in Next.js 14, refined in Next.js 15, and shipped as stable in **Next.js 16** (October 2025) via **Cache Components**. In Next.js 16, the `experimental.ppr` flag was removed and replaced with the `cacheComponents` config.

### [](#1-update-nextconfigts)1\. Update next.config.ts

```
// next.config.ts — Next.js 16+
const nextConfig = {
  cacheComponents: true,
};

export default nextConfig;
```

 

> **Note:** If you're still on Next.js 14 or 15, use the older experimental flag:
> 
> ```
> const nextConfig = { experimental: { ppr: true } };
> ```

In Next.js 16, all code is **dynamic by default**. You opt portions of your page into static caching using the `"use cache"` directive or by structuring your components with Suspense boundaries. This is the inverse of previous versions where pages were static by default.

### [](#2-structure-your-page-with-suspense-boundaries)2\. Structure Your Page with Suspense Boundaries

The key insight: **Suspense boundaries are the dividing line between static and dynamic**. Everything outside a `<Suspense>` boundary is pre-rendered at build time. Everything inside is deferred to request time.  

```
// app/dashboard/page.tsx
import { Suspense } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { UserProfile } from "@/components/UserProfile";
import { RecentActivity } from "@/components/RecentActivity";
import { Analytics } from "@/components/Analytics";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      {/* Static shell: navigation, sidebar, layout structure */}
      <h1>Dashboard</h1>

      <div className="grid grid-cols-3 gap-6">
        {/* Dynamic: depends on authenticated user */}
        <Suspense fallback={<ProfileSkeleton />}>
          <UserProfile />
        </Suspense>

        {/* Dynamic: real-time data */}
        <Suspense fallback={<ActivitySkeleton />}>
          <RecentActivity />
        </Suspense>

        {/* Dynamic: aggregated analytics */}
        <Suspense fallback={<AnalyticsSkeleton />}>
          <Analytics />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}
```

 

### [](#3-make-dynamic-components-actually-dynamic)3\. Make Dynamic Components Actually Dynamic

A component becomes dynamic when it accesses request-time data. These are the triggers:  

```
// This component is DYNAMIC because it reads cookies
import { cookies } from "next/headers";

export async function UserProfile() {
  const session = (await cookies()).get("session");
  const user = await getUser(session?.value);

  return (
    <div className="profile-card">
      <img src={user.avatar} alt={user.name} />
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
```

 

**What makes a component dynamic** (triggers request-time rendering):

-   `cookies()` — reading request cookies
-   `headers()` — reading request headers
-   `searchParams` — accessing URL query parameters
-   `connection()` — opting into dynamic rendering
-   Uncached `fetch()` calls — `fetch(url, { cache: "no-store" })`

**What stays static** (rendered at build time):

-   Components with no dynamic data dependencies
-   Components using only cached/static `fetch()` calls
-   Components with `generateStaticParams()`

## [](#the-architecture-deep-dive-why-ppr-is-fundamentally-different)The Architecture Deep Dive: Why PPR is Fundamentally Different

PPR isn't just "SSR with streaming" (that already existed with `loading.tsx`). The critical difference is the **static shell**:

### [](#without-ppr-standard-streaming-ssr)Without PPR (Standard Streaming SSR)

```
Request → Server computes EVERYTHING → Streams progressively
          └── Still waits for the outermost layout to resolve
          └── TTFB depends on the slowest parent component
```

 

Even with streaming SSR, the server has to start rendering from the root of your component tree. If your layout reads from a database, the entire response is blocked until that query completes.

### [](#with-ppr)With PPR

```
Request → CDN serves pre-built static shell INSTANTLY
          └── Server only computes Suspense-wrapped components
          └── TTFB = CDN latency (~20-50ms from edge)
```

 

The static shell is served from the **CDN edge**, not from your origin server. This means your TTFB is determined by the user's proximity to the nearest edge node, not by your database query speed. The dynamic parts are then streamed from the origin server in parallel.

### [](#the-html-structure)The HTML Structure

When Next.js builds a PPR page, the static HTML includes special placeholder comments:  

```
<!-- Static shell (served from CDN) -->
<main>
  <header>
    <h1>Product: Premium Headphones</h1>
    <img src="/images/headphones.jpg" alt="Premium Headphones" />
    <p>High-fidelity wireless headphones with ANC...</p>
  </header>

  <!-- Dynamic placeholder — will be replaced by streamed content -->
  <template id="pricing-fallback">
    <div class="skeleton pricing-skeleton">Loading price...</div>
  </template>

  <!-- Another dynamic placeholder -->
  <template id="recommendations-fallback">
    <div class="skeleton recs-skeleton">Loading recommendations...</div>
  </template>
</main>

<!-- Later in the response, streamed from origin: -->
<script>
  // React replaces the template with actual content
  $RC("pricing-fallback", "<div class='price'>$299.99</div>...")
</script>
```

 

This is brilliant because the static HTML is **independently cacheable**. The CDN doesn't need to know about your dynamic data. It just serves the shell and lets the origin server handle the rest.

## [](#realworld-performance-before-and-after-ppr)Real-World Performance: Before and After PPR

Let's look at concrete metrics from a production e-commerce product page.

### [](#before-ppr-pure-ssr)Before PPR (Pure SSR)

```
TTFB:                    380ms (origin server rendering)
FCP:                     420ms
LCP:                     680ms
CLS:                     0.02
Total Blocking Time:     45ms
```

 

The server waits for product data (50ms), pricing (120ms), inventory (80ms), and recommendations (200ms) before sending any HTML. The TTFB reflects the slowest query.

### [](#after-ppr-static-shell-dynamic-streaming)After PPR (Static Shell + Dynamic Streaming)

```
TTFB:                    32ms  (CDN edge, static shell)
FCP:                     65ms  (static content paints immediately)
LCP:                     65ms  (product image is in the static shell)
CLS:                     0.00  (skeletons reserve space)
Total Blocking Time:     12ms
```

 

The LCP improved by **10x** because the product image and title are in the static shell. The user sees useful content in 65ms instead of 680ms.

### [](#the-metrics-that-matter)The Metrics That Matter

| Metric | SSR Only | PPR | Improvement |
| --- | --- | --- | --- |
| TTFB | 380ms | 32ms | **11.9x faster** |
| FCP | 420ms | 65ms | **6.5x faster** |
| LCP | 680ms | 65ms | **10.5x faster** |
| CLS | 0.02 | 0.00 | **Eliminated** |

These aren't synthetic benchmarks. These are the kinds of improvements you see when the static shell is served from the edge and the browser can start painting immediately.

## [](#common-patterns-and-antipatterns)Common Patterns and Anti-Patterns

### [](#pattern-granular-suspense-boundaries)✅ Pattern: Granular Suspense Boundaries

Wrap each independent data dependency in its own Suspense boundary. This lets each dynamic section stream independently:  

```
// ✅ Good: Independent streaming
<Suspense fallback={<PriceSkeleton />}>
  <Price productId={id} />   {/* Streams as soon as price resolves */}
</Suspense>

<Suspense fallback={<ReviewsSkeleton />}>
  <Reviews productId={id} />  {/* Streams independently */}
</Suspense>
```

 

### [](#antipattern-one-giant-suspense-boundary)❌ Anti-Pattern: One Giant Suspense Boundary

Don't wrap everything in a single Suspense boundary. This defeats the purpose of PPR by making the entire page dynamic:  

```
// ❌ Bad: Everything waits for the slowest component
<Suspense fallback={<PageSkeleton />}>
  <Price productId={id} />
  <Reviews productId={id} />
  <Recommendations userId={userId} />
</Suspense>
```

 

If `Recommendations` takes 500ms and `Price` takes 50ms, the user waits 500ms to see the price. With separate boundaries, the price appears in 50ms.

### [](#pattern-skeleton-components-that-match-final-layout)✅ Pattern: Skeleton Components That Match Final Layout

Prevent layout shift (CLS) by making skeleton components that match the exact dimensions of the final content:  

```
export function PriceSkeleton() {
  return (
    <div className="price-section" style={{ minHeight: "120px" }}>
      <div className="skeleton-line" style={{ width: "60%", height: "32px" }} />
      <div className="skeleton-line" style={{ width: "40%", height: "20px" }} />
    </div>
  );
}
```

 

### [](#antipattern-using-dynamic-apis-in-layout)❌ Anti-Pattern: Using Dynamic APIs in Layout

If your root layout reads cookies or headers, the entire page becomes dynamic — PPR won't help:  

```
// ❌ This makes the ENTIRE page dynamic
// app/layout.tsx
import { cookies } from "next/headers";

export default async function RootLayout({ children }) {
  const theme = (await cookies()).get("theme"); // Makes everything dynamic
  return <html data-theme={theme?.value}>{children}</html>;
}
```

 

Move dynamic data access into Suspense-wrapped components instead:  

```
// ✅ Keep layout static, defer dynamic parts
// app/layout.tsx
import { Suspense } from "react";
import { ThemeProvider } from "./ThemeProvider";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Suspense fallback={<NavSkeleton />}>
          <ThemeProvider />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
```

 

### [](#pattern-parallel-data-fetching-in-dynamic-components)✅ Pattern: Parallel Data Fetching in Dynamic Components

Inside dynamic components, fetch data in parallel rather than sequentially:  

```
// ✅ Parallel fetches — total time = max(price, inventory)
export async function PricingSection({ productId }: { productId: string }) {
  const [price, inventory] = await Promise.all([
    getPrice(productId),
    getInventory(productId),
  ]);

  return (
    <div className="pricing">
      <span className="price">${price.amount}</span>
      {inventory.count < 10 && (
        <span className="low-stock">Only {inventory.count} left!</span>
      )}
    </div>
  );
}
```

 

## [](#ppr-vs-other-rendering-strategies-decision-framework)PPR vs. Other Rendering Strategies: Decision Framework

When should you use PPR vs. other approaches?

### [](#use-ppr-when)Use PPR When:

-   **Pages have both static and dynamic content** — Product pages, dashboards, news articles with comments
-   **TTFB matters** — E-commerce, content sites, SEO-critical pages
-   **You want personalization without sacrificing speed** — User-specific recommendations, pricing tiers, A/B tests
-   **Layout shift is a problem** — PPR's skeleton approach naturally prevents CLS

### [](#stick-with-pure-ssg-when)Stick with Pure SSG When:

-   **The entire page is static** — Blog posts, documentation, marketing pages
-   **No personalization needed** — Same content for every visitor
-   **Build times are acceptable** — Small to medium sites

### [](#stick-with-ssr-when)Stick with SSR When:

-   **Every byte depends on the request** — Authentication flows, admin panels
-   **Data consistency is critical** — Financial dashboards where stale static shells could mislead
-   **You can't identify static/dynamic boundaries** — Tightly coupled data dependencies

### [](#use-isr-when)Use ISR When:

-   **You need near-real-time updates without PPR's complexity** — Content that changes hourly/daily
-   **Your hosting doesn't support streaming** — Some platforms don't support PPR yet

## [](#migration-guide-from-ssr-to-ppr)Migration Guide: From SSR to PPR

If you're currently using pure SSR and want to adopt PPR, here's your migration path:

### [](#step-1-identify-static-vs-dynamic-boundaries)Step 1: Identify Static vs. Dynamic Boundaries

Audit your page components. Ask: "Does this component need request-time data?"  

```
# Find all dynamic API usage in your app directory
grep -rn "cookies()\|headers()\|searchParams\|connection()\|no-store\|noStore" \
  --include="*.tsx" --include="*.ts" ./app
```

 

### [](#step-2-wrap-dynamic-components-in-suspense)Step 2: Wrap Dynamic Components in Suspense

For each component that uses dynamic APIs, wrap it in a Suspense boundary with a skeleton fallback:  

```
// Before: Everything is dynamic
export default async function Page() {
  const user = await getUser();        // Dynamic
  const posts = await getPosts();      // Could be static
  const notifications = await getNotifications(user.id); // Dynamic

  return (
    <div>
      <ProfileCard user={user} />
      <PostList posts={posts} />
      <NotificationBell count={notifications.length} />
    </div>
  );
}

// After: Static shell + dynamic streaming
export default function Page() {
  return (
    <div>
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileCard />  {/* Reads cookies internally */}
      </Suspense>

      <PostList />  {/* Static — no dynamic dependencies */}

      <Suspense fallback={<NotificationSkeleton />}>
        <NotificationBell />  {/* Reads cookies internally */}
      </Suspense>
    </div>
  );
}
```

 

### [](#step-3-move-data-fetching-into-components)Step 3: Move Data Fetching Into Components

PPR works best when each component owns its data fetching. Move `fetch()` calls from the page level into the component level:  

```
// Before: Page fetches everything
export default async function Page() {
  const [user, posts] = await Promise.all([getUser(), getPosts()]);
  return <Dashboard user={user} posts={posts} />;
}

// After: Each component fetches its own data
export default function Page() {
  return (
    <Dashboard>
      <Suspense fallback={<UserSkeleton />}>
        <UserSection />  {/* Fetches user data internally */}
      </Suspense>
      <PostSection />    {/* Fetches posts internally (static) */}
    </Dashboard>
  );
}
```

 

### [](#step-4-enable-ppr-and-test)Step 4: Enable PPR and Test

```
// next.config.ts — Next.js 16+
const nextConfig = {
  cacheComponents: true,
};

// Next.js 14/15 (legacy):
// const nextConfig = { experimental: { ppr: true } };
```

 

Build and analyze the output:  

```
next build
```

 

In the build output, PPR pages are marked with a special indicator (◐) showing they have both static and dynamic parts:  

```
Route (app)                    Size     First Load
─────────────────────────────────────────────────
◐ /product/[id]               4.2 kB    89 kB
○ /about                      1.1 kB    82 kB
● /blog/[slug]                2.3 kB    84 kB

○  Static
●  SSG
◐  Partial Prerendering
```

 

## [](#debugging-ppr-common-issues)Debugging PPR: Common Issues

### [](#issue-1-entire-page-becomes-dynamic)Issue 1: Entire Page Becomes Dynamic

**Symptom**: Build output shows your page as fully dynamic (λ) instead of partial (◐).

**Cause**: A dynamic API is being called outside a Suspense boundary, usually in a layout or at the page level.

**Fix**: Search for `cookies()`, `headers()`, or `connection()` calls in your page or layout and move them inside Suspense-wrapped components.

### [](#issue-2-static-shell-doesnt-include-expected-content)Issue 2: Static Shell Doesn't Include Expected Content

**Symptom**: Content you expect to be static shows up as a skeleton.

**Cause**: The component has an indirect dynamic dependency — perhaps it imports a module that calls `cookies()`.

**Fix**: Trace the component's import tree. Use the Next.js build analyzer to identify which modules trigger dynamic rendering.

### [](#issue-3-layout-shift-despite-skeletons)Issue 3: Layout Shift Despite Skeletons

**Symptom**: CLS is non-zero even with skeleton components.

**Fix**: Ensure skeleton components have explicit `min-height` or `aspect-ratio` that matches the final rendered content. Use CSS `contain: layout` on Suspense boundary containers.  

```
<div style={{ contain: "layout", minHeight: "200px" }}>
  <Suspense fallback={<Skeleton />}>
    <DynamicComponent />
  </Suspense>
</div>
```

 

## [](#the-bigger-picture-why-ppr-matters-beyond-performance)The Bigger Picture: Why PPR Matters Beyond Performance

PPR isn't just a performance optimization. It represents a fundamental shift in how we think about web architecture:

1.  **The End of Full-Page Rendering Decisions**: You no longer choose SSG _or_ SSR. You choose SSG _and_ SSR, per component, within the same page.
    
2.  **Edge-First by Default**: The static shell lives on the CDN edge. Your origin server only handles the dynamic parts. This naturally distributes your infrastructure.
    
3.  **Progressive Enhancement Built-in**: Users with slow connections see the static shell immediately. Dynamic content arrives as bandwidth allows. This is progressive enhancement at the HTTP level.
    
4.  **Simplified Caching**: Static parts are trivially cacheable forever (content-hash based). Dynamic parts are never cached. No more cache invalidation headaches for hybrid pages.
    
5.  **Aligns with React's Direction**: PPR is the natural convergence of React Server Components, Suspense, and streaming. It's not a Next.js hack — it's the culmination of React's architectural vision.
    

## [](#should-you-adopt-ppr-now)Should You Adopt PPR Now?

**Yes, if:**

-   You're starting a new Next.js project (PPR should be your default)
-   Your existing pages have clear static/dynamic boundaries
-   TTFB and Core Web Vitals are important to your business
-   You're already using the App Router with Server Components

**Wait if:**

-   You're still on the Pages Router (migrate to App Router first)
-   Your hosting platform doesn't support streaming responses
-   Your entire page is truly static or truly dynamic with no mixed content
-   Your team isn't familiar with Suspense and Server Components yet

## [](#conclusion)Conclusion

Partial Prerendering eliminates the oldest and most painful tradeoff in web development: static vs. dynamic. By leveraging React Suspense as the boundary between pre-rendered content and request-time computation, PPR delivers CDN-speed TTFB while still serving personalized, real-time data.

The mental model is simple: everything outside `<Suspense>` is static. Everything inside is dynamic. The framework handles the rest — caching the shell on the edge, streaming dynamic content from the origin, and progressively enhancing the response as data resolves.

With Next.js 16's Cache Components, PPR has graduated from experimental to stable. For most Next.js applications, PPR should be the default rendering strategy going forward. The performance gains are too significant to ignore, and the migration path from existing SSR pages is straightforward: identify your dynamic boundaries, wrap them in Suspense, and let Next.js handle the orchestration.

Set `cacheComponents: true` in your `next.config.ts`. Build your app. Look at the build output. If you see the ◐ indicator, you've just made your pages faster than they've ever been — and you didn't have to sacrifice a single byte of dynamic functionality to do it.

---

> ⚡ **Speed Tip:** Read the original post on the [Pockit Blog](https://pockit.tools/blog/nextjs-partial-prerendering-ppr-deep-dive/).
> 
> Tired of slow cloud tools? [Pockit.tools](https://pockit.tools/json-formatter/) runs entirely in your browser. **[Get the Extension](https://chromewebstore.google.com/detail/pockit-developer-tools-pd/lojcamfhllebjmcjmipecgecbeopookg)** now for instant, zero-latency access to essential dev tools.
