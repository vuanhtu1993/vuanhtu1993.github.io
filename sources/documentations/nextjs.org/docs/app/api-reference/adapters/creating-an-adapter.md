---
title: "Adapters: Creating an Adapter"
source_url: "https://nextjs.org/docs/app/api-reference/adapters/creating-an-adapter"
crawled_at: "2026-06-25T07:19:33.682Z"
---

An adapter is a module that exports an object implementing the `NextAdapter` interface.

```
type Route = {
  source?: string
  sourceRegex: string
  destination?: string
  headers?: Record<string, string>
  has?: RouteHas[]
  missing?: RouteHas[]
  status?: number
  priority?: boolean
}
 
export interface AdapterOutputs {
  pages: Array<AdapterOutput['PAGES']>
  middleware?: AdapterOutput['MIDDLEWARE']
  appPages: Array<AdapterOutput['APP_PAGE']>
  pagesApi: Array<AdapterOutput['PAGES_API']>
  appRoutes: Array<AdapterOutput['APP_ROUTE']>
  prerenders: Array<AdapterOutput['PRERENDER']>
  staticFiles: Array<AdapterOutput['STATIC_FILE']>
}
 
export interface NextAdapter {
  name: string
  modifyConfig?: (
    config: NextConfigComplete,
    ctx: {
      phase: PHASE_TYPE
      nextVersion: string
    }
  ) => Promise<NextConfigComplete> | NextConfigComplete
  onBuildComplete?: (ctx: {
    routing: {
      beforeMiddleware: Array<Route>
      beforeFiles: Array<Route>
      afterFiles: Array<Route>
      dynamicRoutes: Array<Route>
      onMatch: Array<Route>
      fallback: Array<Route>
      shouldNormalizeNextData: boolean
      rsc: RoutesManifest['rsc']
    }
    outputs: AdapterOutputs
    projectDir: string
    repoRoot: string
    distDir: string
    config: NextConfigComplete
    nextVersion: string
    buildId: string
  }) => Promise<void> | void
}
```

my-adapter.js

```
/** @type {import('next').NextAdapter} */
const adapter = {
  name: 'my-custom-adapter',
 
  async modifyConfig(config, { phase }) {
    // Modify the Next.js config based on the build phase
    if (phase === 'phase-production-build') {
      return {
        ...config,
        // Add your modifications
      }
    }
    return config
  },
 
  async onBuildComplete({
    routing,
    outputs,
    projectDir,
    repoRoot,
    distDir,
    config,
    nextVersion,
    buildId,
  }) {
    // Process the build output
    console.log('Build completed with', outputs.pages.length, 'pages')
    console.log('Build ID:', buildId)
    console.log('Dynamic routes:', routing.dynamicRoutes.length)
 
    // Access emitted output entries
    for (const page of outputs.pages) {
      console.log('Page:', page.pathname, 'at', page.filePath)
    }
 
    for (const apiRoute of outputs.pagesApi) {
      console.log('API Route:', apiRoute.pathname, 'at', apiRoute.filePath)
    }
 
    for (const appPage of outputs.appPages) {
      console.log('App Page:', appPage.pathname, 'at', appPage.filePath)
    }
 
    for (const prerender of outputs.prerenders) {
      console.log('Prerendered:', prerender.pathname)
    }
  },
}
 
module.exports = adapter
```
