---
title: "Next.js 16 Migration Guide: Turbopack, Proxy, Cache Components, and Every Breaking Change Explained"
source_url: "https://dev.to/pockit_tools/nextjs-16-migration-guide-turbopack-proxy-cache-components-and-every-breaking-change-explained-35ci"
crawled_at: "2026-08-07T09:30:08.863Z"
---

Your CI pipeline just failed after bumping `next` to `^16.0.0`. The error log is 400 lines long, half your middleware is broken, and there's a new `proxy.ts` file convention you've never seen before. Welcome to the Next.js 16 upgrade.

Next.js 16 is the most architecturally significant release since the App Router landed in v13. Webpack is no longer the default — Turbopack is now the only bundler out of the box. The `middleware.ts` convention has been replaced by `proxy.ts`. The entire caching model has been rebuilt around Cache Components and the `use cache` directive. And if you're running in containers, there are memory behavior changes that will bite you in production if you don't know about them.

This guide walks through every breaking change, explains why it was made, provides the exact codemod commands, and gives you the manual migration path when codemods aren't enough. Whether you're upgrading a small marketing site or a 200-route enterprise app, this is the only document you need.

## [](#what-changed-and-why)What Changed and Why

Before diving into the migration steps, here's the high-level picture of what Next.js 16 changed and the reasoning behind each shift:  

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 16 Architecture                   │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │  Turbopack    │  │  proxy.ts    │  │  Cache           │   │
│  │  (Only        │  │  (Replaces   │  │  Components      │   │
│  │   Bundler)    │  │   middleware) │  │  ('use cache')   │   │
│  └──────┬───────┘  └──────┬───────┘  └────────┬────────┘   │
│         │                  │                    │             │
│  ┌──────┴───────┐  ┌──────┴───────┐  ┌────────┴────────┐   │
│  │  10x Faster  │  │  Clear       │  │  Declarative     │   │
│  │  HMR \u0026 Build │  │  Network     │  │  Caching with    │   │
│  │              │  │  Boundaries  │  │  Granular TTL    │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │  Async        │  │  PPR         │                         │
│  │  Request APIs │  │  (Default)   │                         │
│  │  (params,     │  │              │                         │
│  │   cookies,    │  │              │                         │
│  │   headers)    │  │              │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

 

| Change | Why |
| --- | --- |
| Turbopack replaces Webpack as default | Webpack's architecture couldn't scale to sub-second HMR beyond ~500 modules. Turbopack's incremental computation engine handles 10K+ module graphs with consistent <200ms updates. Webpack remains available via `--webpack` flag during migration. |
| `proxy.ts` replaces `middleware.ts` | Middleware conflated request-level logic (auth, redirects) with network proxy behavior (rewriting, header injection). `proxy.ts` clarifies which code runs at the network layer (now in Node.js runtime by default, not Edge). |
| Async request APIs | `params`, `searchParams`, `cookies()`, and `headers()` are now always async. This enables better streaming and eliminates implicit blocking in RSC rendering. |
| Cache Components (`use cache`) | The old `revalidate`, `unstable_cache`, and nested `cache()` patterns created an unpredictable caching hierarchy. `use cache` provides a single, declarative, composable primitive. |
| PPR by default | Partial Prerendering is now the default rendering strategy, combining static shells with streamed dynamic content. No more choosing between SSR and SSG. |

## [](#step-0-before-you-start)Step 0: Before You Start

### [](#1-baseline-your-metrics)1\. Baseline Your Metrics

Before touching any code, capture your current performance:  

```
# Performance baseline
npx next build 2>&1 | tee build-before.log
npx @next/bundle-analyzer

# Runtime metrics
lighthouse https://your-app.com --output json --output-path baseline.json
```

 

### [](#2-check-nodejs-compatibility)2\. Check Node.js Compatibility

Next.js 16 requires Node.js 20.x or later. Node 18 is no longer supported.  

```
node -v
# Must be >= v20.0.0
```

 

### [](#3-run-the-upgrade-command)3\. Run the Upgrade Command

```
npx @next/codemod@latest upgrade
```

 

This handles the bulk of the automated migration. But it won't catch everything — the rest of this guide covers what the codemod misses.

## [](#step-1-turbopack-webpack-is-no-longer-the-default)Step 1: Turbopack — Webpack Is No Longer the Default

The most visible change: Turbopack is now the default bundler for both development and production. The `webpack` key in `next.config.ts` is deprecated — though if you have incompatible loaders, you can temporarily fall back with `next dev --webpack` or `next build --webpack`. This escape hatch exists for migration, but the goal is to eliminate it.

### [](#what-breaks)What Breaks

If you have any of these in your `next.config.ts`, they will fail:  

```
// ❌ These no longer work in Next.js 16
module.exports = {
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
};
```

 

### [](#migration-path)Migration Path

**For aliases:** Use the built-in `paths` in `tsconfig.json` — Turbopack respects them natively:  

```
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

 

**For SVG imports:** Use `@svgr/turbopack` instead of `@svgr/webpack`:  

```
npm install @svgr/turbopack
```

 

```
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/turbopack'],
        as: '*.js',
      },
    },
  },
};

export default nextConfig;
```

 

**For other custom loaders:** Check if a Turbopack-compatible version exists. Most popular loaders (CSS modules, SASS, image optimization) are built into Turbopack. For the rest, the `turbopack.rules` config provides the escape hatch.

### [](#verify)Verify

```
# Development
npx next dev
# If it starts without errors, Turbopack is working

# Production build
npx next build
```

 

If you see `Module not found` errors during the build that didn't exist before, it's almost certainly a loader compatibility issue. Check the [Turbopack compatibility table](https://nextjs.org/docs/app/api-reference/turbopack) for your specific loaders.

## [](#step-2-middlewarets-%E2%86%92-proxyts)Step 2: middleware.ts → proxy.ts

This is the change that causes the most confusion. The old `middleware.ts` has been split into two conceptual layers:

1.  **`proxy.ts`** — Network-level operations (rewriting URLs, injecting headers, geolocation routing). Runs in the **Node.js runtime** by default (unlike the old middleware which defaulted to Edge).
2.  **Server-side logic in route handlers** — Authentication checks, session validation, and business logic now belong in your actual route handlers, layouts, or server actions.

### [](#what-a-typical-middlewarets-looked-like)What a Typical middleware.ts Looked Like

```
// ❌ OLD: middleware.ts (Next.js 15)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Auth check
  const token = request.cookies.get('session-token');
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Locale detection
  const locale = request.headers.get('Accept-Language')?.split(',')[0] || 'en';
  const response = NextResponse.next();
  response.headers.set('x-locale', locale);

  // A/B test routing
  const bucket = Math.random() > 0.5 ? 'a' : 'b';
  response.headers.set('x-ab-bucket', bucket);

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|favicon.ico).*)'],
};
```

 

### [](#the-new-proxyts)The New proxy.ts

```
// ✅ NEW: proxy.ts (Next.js 16)
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();

  // Locale detection (network-level concern)
  const locale = request.headers.get('Accept-Language')?.split(',')[0] || 'en';

  // A/B test routing (network-level concern)
  const bucket = Math.random() > 0.5 ? 'a' : 'b';

  return {
    headers: {
      'x-locale': locale,
      'x-ab-bucket': bucket,
    },
  };
}

export const config = {
  matcher: ['/((?!api|_next/static|favicon.ico).*)'],
};
```

 

### [](#where-does-auth-go)Where Does Auth Go?

Auth checks move to layouts or route handlers where they belong:  

```
// app/dashboard/layout.tsx
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return <>{children}</>;
}
```

 

This is actually a better architecture. Auth logic now lives next to the routes it protects, making the security model explicit and auditable rather than hidden in a global middleware file.

### [](#codemod)Codemod

```
npx @next/codemod@latest middleware-to-proxy
```

 

The codemod handles simple header/rewrite patterns but won't automatically move auth logic. Review the output carefully.

## [](#step-3-async-request-apis)Step 3: Async Request APIs

Every dynamic request API is now strictly async. This is the change with the highest file count impact — expect to modify every page, layout, and route handler that accesses params, search params, cookies, or headers.

### [](#before-nextjs-15)Before (Next.js 15)

```
// ❌ Synchronous access no longer works
export default function Page({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { q?: string };
}) {
  const title = params.slug;
  const query = searchParams.q;
  return <div>{title} - {query}</div>;
}
```

 

### [](#after-nextjs-16)After (Next.js 16)

```
// ✅ All request APIs are async
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { slug } = await params;
  const { q } = await searchParams;
  return <div>{slug} - {q}</div>;
}
```

 

### [](#cookies-and-headers)cookies() and headers()

```
// ❌ Before
import { cookies, headers } from 'next/headers';

export default function Page() {
  const cookieStore = cookies();
  const headerList = headers();
  // ...
}

// ✅ After
import { cookies, headers } from 'next/headers';

export default async function Page() {
  const cookieStore = await cookies();
  const headerList = await headers();
  // ...
}
```

 

### [](#codemod)Codemod

```
npx @next/codemod@latest async-request-apis
```

 

This codemod has a high success rate (~90%). It adds `async` to functions, wraps with `await`, and updates type signatures. Spot-check the results — it occasionally misses edge cases in custom utility functions that pass `params` through.

## [](#step-4-cache-components-and-the-raw-use-cache-endraw-directive)Step 4: Cache Components and the `use cache` Directive

This is the biggest conceptual shift. The old caching model (a mix of `revalidate`, `unstable_cache`, `fetch` cache options, and `cache()`) has been replaced by a single, composable primitive: the `use cache` directive.

### [](#the-old-world-confusing)The Old World (Confusing)

```
// ❌ Next.js 15: Multiple, overlapping caching mechanisms
export const revalidate = 3600; // page-level revalidation

async function getData() {
  const res = await fetch('https://api.example.com/data', {
    next: { revalidate: 60, tags: ['data'] },
  });
  return res.json();
}

// Plus: unstable_cache, cache(), generateStaticParams...
```

 

### [](#the-new-world-declarative)The New World (Declarative)

First, enable Cache Components in your config:  

```
// next.config.ts
const nextConfig: NextConfig = {
  cacheComponents: true, // Required to use 'use cache'
};
```

 

Then use the directive:  

```
// ✅ Next.js 16: Single 'use cache' directive
import { cacheLife, cacheTag } from 'next/cache';

// Cache at the function level
async function getData() {
  'use cache';
  cacheLife('hours');
  cacheTag('data');

  const res = await fetch('https://api.example.com/data');
  return res.json();
}

// Cache at the component level
async function ExpensiveWidget() {
  'use cache';
  cacheLife('days');
  cacheTag('widget');

  const data = await getData();
  return <div>{data.title}</div>;
}

// Cache at the page level
export default async function Page() {
  'use cache';
  cacheLife('minutes');

  return (
    <main>
      <ExpensiveWidget />
      <DynamicContent />
    </main>
  );
}
```

 

### [](#cache-life-presets)Cache Life Presets

Next.js 16 ships with built-in cache lifetime presets:

| Preset | Stale | Revalidate | Expire |
| --- | --- | --- | --- |
| `'seconds'` | 0s | 1s | 60s |
| `'minutes'` | 5min | 1min | 1hr |
| `'hours'` | 5min | 1hr | 24hr |
| `'days'` | 5min | 1day | 14d |
| `'weeks'` | 5min | 1week | 30d |
| `'max'` | 5min | 30d | 365d |

You can also define custom profiles:  

```
// next.config.ts
const nextConfig: NextConfig = {
  cacheLife: {
    product: {
      stale: 300,       // 5 minutes
      revalidate: 3600, // 1 hour
      expire: 86400,    // 1 day
    },
  },
};
```

 

```
// Then use it:
async function getProduct(id: string) {
  'use cache';
  cacheLife('product');
  cacheTag(`product-${id}`);

  return db.products.findById(id);
}
```

 

### [](#revalidation)Revalidation

Tag-based revalidation works the same way, but now it's more powerful because you can tag at any granularity:  

```
// app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache';

export async function POST(request: Request) {
  const { tag } = await request.json();
  revalidateTag(tag);
  return Response.json({ revalidated: true });
}
```

 

### [](#migration-strategy)Migration Strategy

1.  Remove all `export const revalidate = ...` from pages
2.  Replace `fetch(..., { next: { revalidate } })` with `use cache` + `cacheLife`
3.  Replace `unstable_cache()` calls with `use cache` functions
4.  Add `cacheTag()` where you need targeted revalidation

## [](#step-5-partial-prerendering-ppr-by-default)Step 5: Partial Prerendering (PPR) by Default

PPR is now the default rendering strategy. This means every page automatically gets a static shell that is served instantly, with dynamic content streamed in via Suspense boundaries.

### [](#what-this-means-in-practice)What This Means in Practice

```
// This page automatically uses PPR in Next.js 16
export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main>
      {/* Static shell — served from CDN */}
      <Header />
      <ProductInfo id={id} />

      {/* Dynamic content — streamed */}
      <Suspense fallback={<PriceSkeleton />}>
        <DynamicPrice id={id} />
      </Suspense>

      <Suspense fallback={<ReviewsSkeleton />}>
        <UserReviews id={id} />
      </Suspense>
    </main>
  );
}
```

 

The key insight: **components that use `use cache` become the static shell.** Components that access cookies, headers, or uncached data become the dynamic holes that are streamed in.

### [](#if-you-need-to-opt-out)If You Need to Opt Out

```
// next.config.ts
const nextConfig: NextConfig = {
  experimental: {
    ppr: false, // Disable PPR globally
  },
};
```

 

Or per-route:  

```
// app/legacy-page/page.tsx
export const dynamic = 'force-dynamic'; // This page won't use PPR
```

 

## [](#step-6-memory-optimization-for-containers)Step 6: Memory Optimization for Containers

This is the silent killer. Next.js 16's more aggressive RSC rendering pipeline can consume significantly more memory than v15, especially in containerized environments with strict memory limits.

### [](#the-problem)The Problem

In Kubernetes or Docker deployments with memory limits (e.g., 512MB per pod), you might see OOM kills that didn't happen with Next.js 15. The root cause is Turbopack's in-memory module graph and the RSC rendering engine holding more intermediate state.

### [](#the-fix)The Fix

```
// next.config.ts
const nextConfig: NextConfig = {
  // Limit Turbopack's memory usage
  turbopack: {
    memoryLimit: 256 * 1024 * 1024, // 256MB
  },

  // Enable incremental cache handler for production
  experimental: {
    incrementalCacheHandlerPath: './cache-handler.mjs',
  },
};
```

 

```
// cache-handler.mjs
import { CacheHandler } from '@next/cache-handler-redis';

export default class CustomCacheHandler extends CacheHandler {
  constructor(options) {
    super({
      ...options,
      redis: {
        url: process.env.REDIS_URL,
      },
      // Don't hold cache entries in process memory
      inMemoryCacheEnabled: false,
    });
  }
}
```

 

### [](#container-resource-recommendations)Container Resource Recommendations

| App Size | Recommended Memory | Recommended CPU |
| --- | --- | --- |
| Small (<50 routes) | 512MB | 0.5 vCPU |
| Medium (50-200 routes) | 1GB | 1 vCPU |
| Large (200+ routes) | 2GB | 2 vCPU |

Monitor with:  

```
# Watch memory usage during build
docker stats --format "table {{.Name}}\t{{.MemUsage}}\t{{.MemPerc}}"

# Profile Node.js memory during runtime
NODE_OPTIONS="--max-old-space-size=1024 --heapsnapshot-near-heap-limit=3" npm start
```

 

## [](#step-7-nextconfigts-changes)Step 7: next.config.ts Changes

Several configuration options have been renamed or restructured:  

```
// next.config.ts — Full Next.js 16 configuration
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ✅ Turbopack config (replaces webpack config)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/turbopack'],
        as: '*.js',
      },
    },
    resolveAlias: {
      // Custom aliases if tsconfig paths aren't enough
      'legacy-lib': './src/lib/legacy-adapter',
    },
  },

  // ✅ Cache life profiles
  cacheLife: {
    product: { stale: 300, revalidate: 3600, expire: 86400 },
    blog: { stale: 60, revalidate: 900, expire: 86400 },
  },

  // ✅ Image optimization (mostly unchanged)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.example.com' },
    ],
  },

  // ✅ Redirects and rewrites (same API)
  async redirects() {
    return [
      { source: '/old-path', destination: '/new-path', permanent: true },
    ];
  },
};

export default nextConfig;
```

 

### [](#removed-options)Removed Options

These `next.config.ts` options no longer exist:  

```
// ❌ All of these are removed in Next.js 16
{
  webpack: () => {},           // Use turbopack.rules
  swcMinify: true,             // Always on (via Turbopack)
  experimental: {
    appDir: true,              // Always on since v14
    serverActions: true,       // Always on since v15
    typedRoutes: true,         // Always on
  },
}
```

 

## [](#the-complete-migration-checklist)The Complete Migration Checklist

Run through this checklist after running the codemods:

### [](#infrastructure)Infrastructure

-   \[ \] Node.js >= 20.x installed
-   \[ \] `next` upgraded to `^16.0.0`
-   \[ \] `react` and `react-dom` upgraded to `^19.2.0`
-   \[ \] All `@next/*` packages updated to matching versions
-   \[ \] Container memory limits reviewed (increase if < 512MB)

### [](#bundler)Bundler

-   \[ \] Removed all `webpack` config from `next.config.ts`
-   \[ \] Migrated custom loaders to `turbopack.rules`
-   \[ \] Verified `tsconfig.json` paths work with Turbopack
-   \[ \] Ran `npx next build` without errors

### [](#routing)Routing

-   \[ \] Migrated `middleware.ts` → `proxy.ts` (network concerns only)
-   \[ \] Moved auth logic from middleware to layouts/route handlers
-   \[ \] Reviewed `proxy.ts` matcher patterns

### [](#data-fetching)Data Fetching

-   \[ \] All `params` and `searchParams` are now `Promise<T>` with `await`
-   \[ \] All `cookies()` and `headers()` calls are `await`ed
-   \[ \] Converted `export const revalidate` → `use cache` + `cacheLife`
-   \[ \] Enabled `cacheComponents: true` in `next.config.ts`
-   \[ \] Replaced `unstable_cache` → `use cache` functions
-   \[ \] Added `cacheTag()` for targeted revalidation

### [](#rendering)Rendering

-   \[ \] Verified PPR behavior with Suspense boundaries
-   \[ \] Added skeleton components for dynamic content
-   \[ \] Tested with `dynamic = 'force-dynamic'` where PPR is unwanted

### [](#production)Production

-   \[ \] Benchmarked build time (aim for improvement with Turbopack)
-   \[ \] Load-tested with production traffic patterns
-   \[ \] Monitored memory usage in containers for 24 hours
-   \[ \] Verified cache hit rates in production

## [](#realworld-migration-timeline)Real-World Migration Timeline

Based on production migrations across teams of different sizes:

| App Size | Codemod Coverage | Manual Work | Total Time |
| --- | --- | --- | --- |
| Small (<50 routes) | ~85% | 1-2 days | 3-4 days |
| Medium (50-200 routes) | ~75% | 3-5 days | 1-2 weeks |
| Large (200+ routes) | ~60% | 1-2 weeks | 3-4 weeks |

The biggest time sinks are:

1.  **Custom Webpack loaders** → finding Turbopack equivalents
2.  **Complex middleware logic** → decomposing into proxy + layout auth
3.  **Caching strategy redesign** → mapping old `revalidate` patterns to `use cache`

## [](#what-to-expect-after-migration)What to Expect After Migration

After a clean migration, teams typically report:

-   **Dev server startup**: 60-80% faster (Turbopack vs Webpack)
-   **HMR updates**: 5-10x faster (consistent <200ms)
-   **Production build**: 20-40% faster
-   **TTFB**: 30-50% improvement with PPR (static shell served instantly)
-   **Memory usage**: Similar or slightly higher (requires tuning)

The performance gains from Turbopack and PPR alone justify the migration effort. The architectural clarity of `proxy.ts` and `use cache` is a long-term maintenance win that pays dividends as your app grows.

Next.js 16 is opinionated. It forces you toward patterns that are objectively better but require upfront migration work. The codemods handle the mechanical changes. The architectural shifts — separating proxy from auth, adopting declarative caching, embracing PPR — those require understanding. This guide gave you both. Time to upgrade.

---

> 💡 **Note:** This article was originally published on the [Pockit Blog](https://pockit.tools/blog/nextjs-16-migration-guide-turbopack-proxy-cache-components/).
> 
> Check out [Pockit.tools](https://pockit.tools/json-formatter/) for 60+ free developer utilities. For faster access, **[add it to Chrome](https://chromewebstore.google.com/detail/pockit-developer-tools-pd/lojcamfhllebjmcjmipecgecbeopookg)** and use JSON Formatter & Diff Checker directly from your toolbar.
