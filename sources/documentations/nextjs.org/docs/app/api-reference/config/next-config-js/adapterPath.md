---
title: "next.config.js: adapterPath"
source_url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/adapterPath"
crawled_at: "2026-06-25T07:12:23.254Z"
---

Last updated

March 31, 2026

Next.js provides a built-in adapters API. It allows deployment platforms or build systems to integrate with the Next.js build process.

For a full reference implementation, see the [`nextjs/adapter-vercel`](https://github.com/nextjs/adapter-vercel) adapter.

## Configuration[](#configuration)

To use an adapter, specify the path to your adapter module in `adapterPath`:

next.config.js

```
/** @type {import('next').NextConfig} */
const nextConfig = {
  adapterPath: require.resolve('./my-adapter.js'),
}
 
module.exports = nextConfig
```

Alternatively `NEXT_ADAPTER_PATH` can be set to enable zero-config usage in deployment platforms.

## Adapters[](#adapters)

For full adapter implementation details, use the dedicated Adapters section:

-   [Configuration](https://nextjs.org/docs/app/api-reference/adapters/configuration)
-   [Creating an Adapter](https://nextjs.org/docs/app/api-reference/adapters/creating-an-adapter)
-   [API Reference](https://nextjs.org/docs/app/api-reference/adapters/api-reference)
-   [Testing Adapters](https://nextjs.org/docs/app/api-reference/adapters/testing-adapters)
-   [Routing with `@next/routing`](https://nextjs.org/docs/app/api-reference/adapters/routing-with-next-routing)
-   [Implementing PPR in an Adapter](https://nextjs.org/docs/app/api-reference/adapters/implementing-ppr-in-an-adapter)
-   [Runtime Integration](https://nextjs.org/docs/app/api-reference/adapters/runtime-integration)
-   [Invoking Entrypoints](https://nextjs.org/docs/app/api-reference/adapters/invoking-entrypoints)
-   [Output Types](https://nextjs.org/docs/app/api-reference/adapters/output-types)
-   [Routing Information](https://nextjs.org/docs/app/api-reference/adapters/routing-information)
-   [Use Cases](https://nextjs.org/docs/app/api-reference/adapters/use-cases)

## Creating an Adapter[](#creating-an-adapter)

See [Creating an Adapter](https://nextjs.org/docs/app/api-reference/adapters/creating-an-adapter).

## API Reference[](#api-reference)

See [API Reference](https://nextjs.org/docs/app/api-reference/adapters/api-reference).

## Testing Adapters[](#testing-adapters)

See [Testing Adapters](https://nextjs.org/docs/app/api-reference/adapters/testing-adapters).

## Routing with `@next/routing`[](#routing-with-nextrouting)

See [Routing with `@next/routing`](https://nextjs.org/docs/app/api-reference/adapters/routing-with-next-routing).

## Implementing PPR in an Adapter[](#implementing-ppr-in-an-adapter)

See [Implementing PPR in an Adapter](https://nextjs.org/docs/app/api-reference/adapters/implementing-ppr-in-an-adapter).

## Runtime Integration[](#runtime-integration)

See [Runtime Integration](https://nextjs.org/docs/app/api-reference/adapters/runtime-integration).

## Invoking Entrypoints[](#invoking-entrypoints)

See [Invoking Entrypoints](https://nextjs.org/docs/app/api-reference/adapters/invoking-entrypoints).

## Output Types[](#output-types)

See [Output Types](https://nextjs.org/docs/app/api-reference/adapters/output-types).

## Routing Information[](#routing-information)

See [Routing Information](https://nextjs.org/docs/app/api-reference/adapters/routing-information).

## Use Cases[](#use-cases)

See [Use Cases](https://nextjs.org/docs/app/api-reference/adapters/use-cases).
