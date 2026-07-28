---
title: "resume – React"
source_url: "https://react.dev/reference/react-dom/server/resume"
crawled_at: "2026-07-28T04:06:29.150Z"
---

`resume` streams a pre-rendered React tree to a [Readable Web Stream.](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream)

```
const stream = await resume(reactNode, postponedState, options?)
```

-   [Reference](#reference)
    -   [`resume(node, postponedState, options?)`](#resume)
-   [Usage](#usage)
    -   [Resuming a prerender](#resuming-a-prerender)
    -   [Further reading](#further-reading)

---

## Reference[](#reference "Link for Reference ")

### `resume(node, postponedState, options?)`[](#resume "Link for this heading")

Call `resume` to resume rendering a pre-rendered React tree as HTML into a [Readable Web Stream.](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream)

```
import { resume } from 'react-dom/server';
import {getPostponedState} from './storage';
async function handler(request, writable) {
const postponed = await getPostponedState(request);
const resumeStream = await resume(<App />, postponed);
return resumeStream.pipeTo(writable)
}
```

[See more examples below.](#usage)

#### Parameters[](#parameters "Link for Parameters ")

-   `reactNode`: The React node you called `prerender` with. For example, a JSX element like `<App />`. It is expected to represent the entire document, so the `App` component should render the `<html>` tag.
-   `postponedState`: The opaque `postpone` object returned from a [prerender API](https://react.dev/reference/react-dom/static/index), loaded from wherever you stored it (e.g. redis, a file, or S3).
-   **optional** `options`: An object with streaming options.
    -   **optional** `nonce`: A [`nonce`](http://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#nonce) string to allow scripts for [`script-src` Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src).
    -   **optional** `signal`: An [abort signal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) that lets you [abort server rendering](#aborting-server-rendering) and render the rest on the client.
    -   **optional** `onError`: A callback that fires whenever there is a server error, whether [recoverable](https://react.dev/reference/react-dom/server/renderToReadableStream#recovering-from-errors-outside-the-shell) or [not.](https://react.dev/reference/react-dom/server/renderToReadableStream#recovering-from-errors-inside-the-shell) By default, this only calls `console.error`. If you override it to [log crash reports,](https://react.dev/reference/react-dom/server/renderToReadableStream#logging-crashes-on-the-server) make sure that you still call `console.error`.

#### Returns[](#returns "Link for Returns ")

`resume` returns a Promise:

-   If `resume` successfully produced a [shell](https://react.dev/reference/react-dom/server/renderToReadableStream#specifying-what-goes-into-the-shell), that Promise will resolve to a [Readable Web Stream.](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream) that can be piped to a [Writable Web Stream.](https://developer.mozilla.org/en-US/docs/Web/API/WritableStream).
-   If an error happens in the shell, the Promise will reject with that error.

The returned stream has an additional property:

-   `allReady`: A Promise that resolves when all rendering is complete. You can `await stream.allReady` before returning a response [for crawlers and static generation.](https://react.dev/reference/react-dom/server/renderToReadableStream#waiting-for-all-content-to-load-for-crawlers-and-static-generation) If you do that, you won’t get any progressive loading. The stream will contain the final HTML.

#### Caveats[](#caveats "Link for Caveats ")

-   `resume` does not accept options for `bootstrapScripts`, `bootstrapScriptContent`, or `bootstrapModules`. Instead, you need to pass these options to the `prerender` call that generates the `postponedState`. You can also inject bootstrap content into the writable stream manually.
-   `resume` does not accept `identifierPrefix` since the prefix needs to be the same in both `prerender` and `resume`.
-   Since `nonce` cannot be provided to prerender, you should only provide `nonce` to `resume` if you’re not providing scripts to prerender.
-   `resume` re-renders from the root until it finds a component that was not fully pre-rendered. Only fully prerendered Components (the Component and its children finished prerendering) are skipped entirely.

## Usage[](#usage "Link for Usage ")

### Resuming a prerender[](#resuming-a-prerender "Link for Resuming a prerender ")

```
import {
  flushReadableStreamToFrame,
  getUser,
  Postponed,
  sleep,
} from "./demo-helpers";
import { StrictMode, Suspense, use, useEffect } from "react";
import { prerender } from "react-dom/static";
import { resume } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";

function Header() {
  return <header>Me and my descendants can be prerendered</header>;
}

const { promise: cookies, resolve: resolveCookies } = Promise.withResolvers();

function Main() {
  const { sessionID } = use(cookies);
  const user = getUser(sessionID);

  useEffect(() => {
    console.log("reached interactivity!");
  }, []);

  return (
    <main>
      Hello, {user.name}!
      <button onClick={() => console.log("hydrated!")}>
        Clicking me requires hydration.
      </button>
    </main>
  );
}

function Shell({ children }) {
  
  
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}

function App() {
  return (
    <Shell>
      <Suspense fallback="loading header">
        <Header />
      </Suspense>
      <Suspense fallback="loading main">
        <Main />
      </Suspense>
    </Shell>
  );
}

async function main(frame) {
  
  const controller = new AbortController();
  const prerenderedApp = prerender(<App />, {
    signal: controller.signal,
    onError(error) {
      if (error instanceof Postponed) {
      } else {
        console.error(error);
      }
    },
  });
  
  
  setTimeout(() => {
    controller.abort(new Postponed());
  });

  const { prelude, postponed } = await prerenderedApp;
  await flushReadableStreamToFrame(prelude, frame);

  
  
  
  
  
  await sleep(2000);

  
  resolveCookies({ sessionID: "abc" });

  const stream = await resume(<App />, postponed);

  await flushReadableStreamToFrame(stream, frame);

  
  
  await sleep(2000);

  hydrateRoot(frame.contentWindow.document, <App />);
}

main(document.getElementById("container"));

```
