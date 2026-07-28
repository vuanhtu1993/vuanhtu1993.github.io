---
title: "use – React"
source_url: "https://react.dev/reference/react/use"
crawled_at: "2026-07-28T04:05:00.264Z"
---

`use` is a React API that lets you read the value of a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) or [context](https://react.dev/learn/passing-data-deeply-with-context).

```
const value = use(resource);
```

-   [Reference](#reference)
    -   [`use(context)`](#use-context)
    -   [`use(promise)`](#use-promise)
-   [Usage (Context)](#usage-context)
    -   [Reading context with `use`](#reading-context-with-use)
    -   [Reading a Promise from context](#reading-a-promise-from-context)
-   [Usage (Promises)](#usage-promises)
    -   [Reading a Promise with `use`](#reading-a-promise-with-use)
    -   [Caching Promises for Client Components](#caching-promises-for-client-components)
    -   [Re-fetching data in Client Components](#re-fetching-data-in-client-components)
    -   [Preloading data on hover](#preloading-data-on-hover)
    -   [Streaming data from server to client](#streaming-data-from-server-to-client)
    -   [Displaying an error with an Error Boundary](#displaying-an-error-with-an-error-boundary)
-   [Troubleshooting](#troubleshooting)
    -   [I’m getting an error: “Suspense Exception: This is not a real error!”](#suspense-exception-error)
    -   [I’m getting a warning: “A component was suspended by an uncached promise”](#uncached-promise-error)

---

## Reference[](#reference "Link for Reference ")

### `use(context)`[](#use-context "Link for this heading")

Call `use` with a [context](https://react.dev/learn/passing-data-deeply-with-context) to read its value. Unlike [`useContext`](https://react.dev/reference/react/useContext), `use` can be called within loops and conditional statements like `if`.

```
import { use } from 'react';
function Button() {
const theme = use(ThemeContext);
// ...
```

[See more examples below.](#usage-context)

#### Parameters[](#context-parameters "Link for Parameters ")

-   `context`: A [context](https://react.dev/learn/passing-data-deeply-with-context) created with [`createContext`](https://react.dev/reference/react/createContext).

#### Returns[](#context-returns "Link for Returns ")

The context value for the passed context, determined by the closest context provider above the calling component. If there is no provider, the returned value is the `defaultValue` passed to [`createContext`](https://react.dev/reference/react/createContext).

#### Caveats[](#context-caveats "Link for Caveats ")

-   `use` must be called inside a Component or a Hook.
-   Reading context with `use` is not supported in [Server Components](https://react.dev/reference/rsc/server-components).

---

### `use(promise)`[](#use-promise "Link for this heading")

Call `use` with a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) to read its resolved value. The component calling `use` _suspends_ while the Promise is pending. Despite its name, `use` is not a Hook. Unlike Hooks, it can be called inside loops and conditional statements like `if`.

```
import { use } from 'react';
function MessageComponent({ messagePromise }) {
const message = use(messagePromise);
// ...
```

If the component that calls `use` is wrapped in a [Suspense](https://react.dev/reference/react/Suspense) boundary, the fallback will be displayed while the Promise is pending. Once the Promise is resolved, the Suspense fallback is replaced by the rendered components using the data returned by `use`. If the Promise is rejected, the fallback of the nearest [Error Boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary) will be displayed.

[See more examples below.](#usage-promises)

#### Parameters[](#promise-parameters "Link for Parameters ")

-   `promise`: A [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) whose resolved value you want to read. The Promise must be [cached](#caching-promises-for-client-components) so that the same instance is reused across re-renders.

#### Returns[](#promise-returns "Link for Returns ")

The resolved value of the Promise.

#### Caveats[](#promise-caveats "Link for Caveats ")

-   `use` must be called inside a Component or a Hook.
-   `use` cannot be called inside a try-catch block. Instead, wrap your component in an [Error Boundary](#displaying-an-error-with-an-error-boundary) to catch the error and display a fallback.
-   Promises passed to `use` must be cached so the same Promise instance is reused across re-renders. [See caching Promises below.](#caching-promises-for-client-components)
-   When passing a Promise from a Server Component to a Client Component, its resolved value must be [serializable](https://react.dev/reference/rsc/use-client#serializable-types).

---

## Usage (Context)[](#usage-context "Link for Usage (Context) ")

### Reading context with `use`[](#reading-context-with-use "Link for this heading")

When a [context](https://react.dev/learn/passing-data-deeply-with-context) is passed to `use`, it works similarly to [`useContext`](https://react.dev/reference/react/useContext). While `useContext` must be called at the top level of your component, `use` can be called inside conditionals like `if` and loops like `for`.

```
import { use } from 'react';
function Button() {
const theme = use(ThemeContext);
// ...
```

`use` returns the context value for the context you passed. To determine the context value, React searches the component tree and finds **the closest context provider above** for that particular context.

To pass context to a `Button`, wrap it or one of its parent components into the corresponding context provider.

```
function MyPage() {
return (
<ThemeContext value="dark">
<Form />
</ThemeContext>
);
}
function Form() {
// ... renders buttons inside ...
}
```

It doesn’t matter how many layers of components there are between the provider and the `Button`. When a `Button` _anywhere_ inside of `Form` calls `use(ThemeContext)`, it will receive `"dark"` as the value.

Unlike [`useContext`](https://react.dev/reference/react/useContext), `use` can be called in conditionals and loops like `if`.

```
function HorizontalRule({ show }) {
if (show) {
const theme = use(ThemeContext);
return <hr className={theme} />;
}
return false;
}
```

`use` is called from inside a `if` statement, allowing you to conditionally read values from a Context.

### Pitfall

Like `useContext`, `use(context)` always looks for the closest context provider _above_ the component that calls it. It searches upwards and **does not** consider context providers in the component from which you’re calling `use(context)`.

```
import { createContext, use } from 'react';

const ThemeContext = createContext(null);

export default function MyApp() {
  return (
    <ThemeContext value="dark">
      <Form />
    </ThemeContext>
  )
}

function Form() {
  return (
    <Panel title="Welcome">
      <Button show={true}>Sign up</Button>
      <Button show={false}>Log in</Button>
    </Panel>
  );
}

function Panel({ title, children }) {
  const theme = use(ThemeContext);
  const className = 'panel-' + theme;
  return (
    <section className={className}>
      <h1>{title}</h1>
      {children}
    </section>
  )
}

function Button({ show, children }) {
  if (show) {
    const theme = use(ThemeContext);
    const className = 'button-' + theme;
    return (
      <button className={className}>
        {children}
      </button>
    );
  }
  return false
}

```

### Reading a Promise from context[](#reading-a-promise-from-context "Link for Reading a Promise from context ")

To share asynchronous data without prop drilling, set a Promise as a context value, then read it with `use(context)` and resolve it with `use(promise)`:

```
import { use } from 'react';
import { UserContext } from './UserContext';
function Profile() {
const userPromise = use(UserContext);
const user = use(userPromise);
return <h1>{user.name}</h1>;
}
```

Reading the value requires two `use` calls because the context value itself isn’t awaited. See [Before you use context](https://react.dev/learn/passing-data-deeply-with-context#before-you-use-context) for alternatives to consider before reaching for context.

Wrap the components that read the Promise in a [Suspense](https://react.dev/reference/react/Suspense) boundary so only that subtree suspends while the Promise is pending. See [Usage (Promises)](#usage-promises) below for more on reading Promises with `use`.

### Pitfall

When this pattern is used with [Server Components](https://react.dev/reference/rsc/server-components), refetching the Promise requires refetching the Server Component that sets the Promise in context. Avoid setting the Promise in context high in the tree, since that would refetch large parts of the app unnecessarily.

---

## Usage (Promises)[](#usage-promises "Link for Usage (Promises) ")

### Reading a Promise with `use`[](#reading-a-promise-with-use "Link for this heading")

Call `use` with a Promise to read its resolved value. The component will [suspend](https://react.dev/reference/react/Suspense) while the Promise is pending.

```
import { use } from 'react';
function Albums({ albumsPromise }) {
const albums = use(albumsPromise);
return (
<ul>
{albums.map(album => (
<li key={album.id}>
{album.title} ({album.year})
</li>
))}
</ul>
);
}
```

Wrap the component that calls `use` in a [Suspense](https://react.dev/reference/react/Suspense) boundary so React can show a fallback while the Promise is pending. The closest Suspense boundary above the suspending component shows its fallback. Once the Promise resolves, React reads the value with `use` and replaces the fallback with the rendered component.

#### 

Example

1

of

2:

Fetching data with `use`[](#fetching-data-with-use "Link for this heading")

In this example, `Albums` calls `use` with a cached Promise. The component suspends while the Promise is pending, and React displays the nearest Suspense fallback. Rejected Promises propagate to the nearest [Error Boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary).

```
import { use, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { fetchData } from './data.js';

export default function App() {
  return (
    <ErrorBoundary fallback={<p>Could not fetch albums.</p>}>
      <Suspense fallback={<Loading />}>
        <Albums />
      </Suspense>
    </ErrorBoundary>
  );
}

function Albums() {
  const albums = use(fetchData('/albums'));
  return (
    <ul>
      {albums.map(album => (
        <li key={album.id}>
          {album.title} ({album.year})
        </li>
      ))}
    </ul>
  );
}

function Loading() {
  return <h2>Loading...</h2>;
}

```

### Pitfall

##### Promises passed to `use` must be cached[](#promises-must-cached "Link for this heading")

Promises created during render are recreated on every render, which causes React to show the Suspense fallback repeatedly and prevents content from appearing.

```
function Albums() {
// 🔴 `fetch` creates a new Promise on every render.
const albums = use(fetch('/albums'));
// ...
}
```

Instead, pass a Promise from a cache, a [Suspense-enabled framework](https://react.dev/reference/react/Suspense#suspense-enabled-frameworks), or a Server Component:

```
// ✅ fetchData reads the Promise from a cache.
const albums = use(fetchData('/albums'));
```

##### Deep Dive

#### Why are Promises recreated on every render?[](#why-promises-recreated "Link for Why are Promises recreated on every render? ")

[React doesn’t preserve state for renders that suspended before mounting](https://react.dev/reference/react/Suspense#caveats). After each suspension, React retries rendering from scratch, so any Promise created during render is recreated.

Common ways a Promise can be unintentionally recreated during render:

```
function Albums() {
// 🔴 `fetch` creates a new Promise on every render.
const albums = use(fetch('/albums'));
// 🔴 Uncached `async` function calls create a new Promise on every render.
const albums = use((async () => {
const res = await fetch('/albums');
return res.json();
})());
// 🔴 Adding `.then` returns a new Promise on every render,
// even if `fetchData` is cached.
const albums = use(fetchData('/albums').then(res => res.json()));
// ...
}
```

Ideally, Promises are created before rendering, such as in an event handler, a route loader, or a Server Component, and passed to the component that calls `use`. Fetching lazily in render delays network requests and can create waterfalls.

```
// ✅ fetchData reads the Promise from a cache.
const albums = use(fetchData('/albums'));
```

---

### Caching Promises for Client Components[](#caching-promises-for-client-components "Link for Caching Promises for Client Components ")

Promises passed to `use` in Client Components must be cached so the same Promise instance is reused across re-renders. If a new Promise is created directly in render, React will display the Suspense fallback on every re-render.

```
// ✅ Cache the Promise so the same one is reused across renders
let cache = new Map();
export function fetchData(url) {
if (!cache.has(url)) {
cache.set(url, getData(url));
}
return cache.get(url);
}
```

The `fetchData` function returns the same Promise each time it’s called with the same URL. When `use` receives the same Promise on a re-render, it reads the already-resolved value synchronously without suspending.

### Note

The way you cache Promises depends on the framework you use with Suspense. Frameworks typically provide built-in caching mechanisms. If you don’t use a framework, you can use a simple module-level cache like the one above, or a [Suspense-enabled data source](https://react.dev/reference/react/Suspense#what-activates-a-suspense-boundary).

In the example below, clicking “Re-render” updates state in `App` and triggers a re-render. Because `fetchData` returns the same cached Promise, `Albums` reads the value synchronously instead of showing the Suspense fallback again.

```
import { use, Suspense, useState } from 'react';
import { fetchData } from './data.js';

export default function App() {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={() => setCount(count + 1)}>
        Re-render
      </button>
      <p>Render count: {count}</p>
      <Suspense fallback={<p>Loading...</p>}>
        <Albums />
      </Suspense>
    </>
  );
}

function Albums() {
  const albums = use(fetchData('/albums'));
  return (
    <ul>
      {albums.map(album => (
        <li key={album.id}>
          {album.title} ({album.year})
        </li>
      ))}
    </ul>
  );
}

```

##### Deep Dive

#### How to implement a promise cache[](#how-to-implement-a-promise-cache "Link for How to implement a promise cache ")

A basic cache stores the Promise keyed by URL so the same instance is reused across renders. To also avoid unnecessary Suspense fallbacks when data is already available, you can set `status` and `value` (or `reason`) fields on the Promise. React checks these fields when `use` is called: if `status` is `'fulfilled'`, it reads `value` synchronously without suspending. If `status` is `'rejected'`, it throws `reason`. If the field is missing or `'pending'`, it suspends.

```
let cache = new Map();
function fetchData(url) {
if (!cache.has(url)) {
const promise = getData(url);
promise.status = 'pending';
promise.then(
value => {
promise.status = 'fulfilled';
promise.value = value;
},
reason => {
promise.status = 'rejected';
promise.reason = reason;
},
);
cache.set(url, promise);
}
return cache.get(url);
}
```

This is primarily useful for library authors building Suspense-compatible data layers. React will set the `status` field itself on Promises that don’t have it, but setting it yourself avoids an extra render when the data is already available.

This cache pattern is the foundation for [re-fetching data](#re-fetching-data-in-client-components) (where changing the cache key triggers a new fetch) and [preloading data on hover](#preloading-data-on-hover) (where calling `fetchData` early means the Promise may already be resolved by the time `use` reads it).

### Pitfall

Don’t skip calling `use` based on whether a Promise is already settled.

Unlike other hooks, `use` can be called inside conditions and loops — but it must always be called for the Promise itself. Never read `promise.status` or `promise.value` directly to bypass `use`; always pass the Promise to `use` and let React handle it.

```
// 🔴 Don't bypass `use` by reading promise status directly
if (promise.status === 'fulfilled') {
return promise.value;
}
const value = use(promise);
```

```
// ✅ Pass the promise to `use` and let React track the promise
const value = use(promise);
```

Bypassing `use` this way can break React Suspense optimizations and Suspense features for React DevTools. You can `use(promise)` conditionally, but don’t conditionally `use(promise)` based on the promise itself.

---

### Re-fetching data in Client Components[](#re-fetching-data-in-client-components "Link for Re-fetching data in Client Components ")

To refresh data at the same URL (for example, with a “Refresh” button), invalidate the cache entry and start a new fetch inside a [`startTransition`](https://react.dev/reference/react/startTransition). Store the resulting Promise in state to trigger a re-render. While the new Promise is pending, React keeps showing the existing content because the update is inside a Transition.

```
function App() {
const [albumsPromise, setAlbumsPromise] = useState(fetchData('/albums'));
const [isPending, startTransition] = useTransition();
function handleRefresh() {
startTransition(() => {
setAlbumsPromise(refetchData('/albums'));
});
}
// ...
}
```

`refetchData` clears the old cache entry and starts a new fetch at the same URL. Storing the resulting Promise in state triggers a re-render inside the Transition. On re-render, `Albums` receives the new Promise and `use` suspends on it while React keeps showing the old content.

```
import { Suspense, useState, useTransition } from 'react';
import { use } from 'react';
import { fetchData, refetchData } from './data.js';

export default function App() {
  const [albumsPromise, setAlbumsPromise] = useState(
    () => fetchData('/the-beatles/albums')
  );
  const [isPending, startTransition] = useTransition();

  function handleRefresh() {
    startTransition(() => {
      setAlbumsPromise(refetchData('/the-beatles/albums'));
    });
  }

  return (
    <>
      <button
        onClick={handleRefresh}
        disabled={isPending}
      >
        {isPending ? 'Refreshing...' : 'Refresh'}
      </button>
      <div style={{ opacity: isPending ? 0.6 : 1 }}>
        <Suspense fallback={<Loading />}>
          <Albums albumsPromise={albumsPromise} />
        </Suspense>
      </div>
    </>
  );
}

function Albums({ albumsPromise }) {
  const albums = use(albumsPromise);
  return (
    <ul>
      {albums.map(album => (
        <li key={album.id}>
          {album.title} ({album.year})
        </li>
      ))}
    </ul>
  );
}

function Loading() {
  return <h2>Loading...</h2>;
}

```

### Note

Frameworks that support Suspense typically provide their own caching and invalidation mechanisms. The custom cache above is useful for understanding the pattern, but in practice prefer your framework’s data fetching solution.

---

### Preloading data on hover[](#preloading-data-on-hover "Link for Preloading data on hover ")

You can start loading data before it’s needed by calling `fetchData` during a hover event. Since `fetchData` caches the Promise, the data may already be available by the time the user clicks. If the Promise has resolved by the time `use` reads it, React renders the component immediately without showing a Suspense fallback.

```
<button
onMouseEnter={() => fetchData(`/${id}/albums`)}
onClick={() => {
startTransition(() => {
setArtistId(id);
});
}}
>
```

In this example, hovering over an artist button starts fetching their albums in the background. Without hovering first, clicking shows a loading fallback. Try hovering over a button for a moment before clicking to see the difference.

```
import { Suspense, useState, useTransition } from 'react';
import Albums from './Albums.js';
import { fetchData } from './data.js';

export default function App() {
  const [artistId, setArtistId] = useState('the-beatles');
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <div>
        {['the-beatles', 'led-zeppelin', 'pink-floyd'].map(id => (
          <button
            key={id}
            onMouseEnter={() => {
              fetchData(`/${id}/albums`);
            }}
            onClick={() => {
              startTransition(() => {
                setArtistId(id);
              });
            }}
          >
            {id === 'the-beatles' ? 'The Beatles' :
             id === 'led-zeppelin' ? 'Led Zeppelin' :
             'Pink Floyd'}
          </button>
        ))}
      </div>
      <Suspense key={artistId} fallback={<Loading />}>
        <Albums artistId={artistId} />
      </Suspense>
    </>
  );
}

function Loading() {
  return <h2>Loading...</h2>;
}

```

---

### Streaming data from server to client[](#streaming-data-from-server-to-client "Link for Streaming data from server to client ")

Data can be streamed from the server to the client by passing a Promise as a prop from a Server Component to a Client Component.

```
import { fetchMessage } from './lib.js';
import { Message } from './message.js';
export default function App() {
const messagePromise = fetchMessage();
return (
<Suspense fallback={<p>waiting for message...</p>}>
<Message messagePromise={messagePromise} />
</Suspense>
);
}
```

The Client Component then takes the Promise it received as a prop and passes it to the `use` API. This allows the Client Component to read the value from the Promise that was initially created by the Server Component.

```
// message.js
'use client';
import { use } from 'react';
export function Message({ messagePromise }) {
const messageContent = use(messagePromise);
return <p>Here is the message: {messageContent}</p>;
}
```

Because `Message` is wrapped in a [Suspense](https://react.dev/reference/react/Suspense) boundary, the fallback will be displayed until the Promise is resolved. When the Promise is resolved, the value will be read by the `use` API and the `Message` component will replace the Suspense fallback.

```
"use client";

import { use, Suspense } from "react";

function Message({ messagePromise }) {
  const messageContent = use(messagePromise);
  return <p>Here is the message: {messageContent}</p>;
}

export function MessageContainer({ messagePromise }) {
  return (
    <Suspense fallback={<p>⌛Downloading message...</p>}>
      <Message messagePromise={messagePromise} />
    </Suspense>
  );
}

```

##### Deep Dive

#### Should I resolve a Promise in a Server or Client Component?[](#resolve-promise-in-server-or-client-component "Link for Should I resolve a Promise in a Server or Client Component? ")

If you have a Promise, at some point you need to unwrap it to read its value. You unwrap it with `await` in a Server Component, and with `use` in a Client Component.

Usually, the simplest option is to `await` the Promise where you create it. The Server Component suspends until the data is ready, and everything below it waits too:

```
// Server Component
export default async function App() {
const messageContent = await fetchMessage();
return <Message messageContent={messageContent} />;
}
```

However, you don’t have to unwrap it right away. You can pass the Promise down as a prop, and unwrap it deeper in the tree. The component that reads the Promise still suspends, but only that part of the tree waits for the data. Wrap that component in a [`<Suspense>`](https://react.dev/reference/react/Suspense) boundary to show a fallback while the rest of the page renders immediately.

For example, a deeper Server Component can `await` the Promise it receives:

```
import { Suspense } from 'react';
// Server Component
export default function App() {
const messagePromise = fetchMessage();
return (
<Suspense fallback={<p>⌛Downloading message...</p>}>
<Message messagePromise={messagePromise} />
</Suspense>
);
}
// Server Component
async function Message({ messagePromise }) {
const messageContent = await messagePromise;
return <p>{messageContent}</p>;
}
```

Or, in a separate file, a Client Component can unwrap the same Promise with `use`:

```
// Client Component
'use client';
import { use } from 'react';
export function Message({ messagePromise }) {
const messageContent = use(messagePromise);
return <p>{messageContent}</p>;
}
```

Passing the Promise down works the same way in both cases. Both suspend where the Promise is read, and both unblock the UI above. The only difference is that Client Components can’t `await` during render, so they unwrap the Promise with `use` instead. A common case is interactive content like popovers and tooltips, where the data is only needed after a hover or click.

See [Revealing content together at once](https://react.dev/reference/react/Suspense#revealing-content-together-at-once) for guidance on where to place Suspense boundaries.

---

### Displaying an error with an Error Boundary[](#displaying-an-error-with-an-error-boundary "Link for Displaying an error with an Error Boundary ")

If the Promise passed to `use` is rejected, the error propagates to the nearest [Error Boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary). Wrap the component that calls `use` in an Error Boundary to display a fallback when the Promise is rejected.

In the example below, `fetchData` rejects on the first attempt and succeeds on retry. The Error Boundary catches the rejection and shows a fallback with a “Try again” button.

```
import { use, Suspense, useState, startTransition } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { fetchData, refetchData } from "./data.js";

export default function App() {
  const [albumsPromise, setAlbumsPromise] = useState(
    () => fetchData('/the-beatles/albums')
  );

  function handleRetry() {
    startTransition(() => {
      setAlbumsPromise(refetchData('/the-beatles/albums'));
    });
  }

  return (
    <ErrorBoundary
      resetKeys={[albumsPromise]}
      fallbackRender={() => (
        <>
          <p>⚠️ Something went wrong loading the albums.</p>
          <button onClick={handleRetry}>Try again</button>
        </>
      )}
    >
      <Suspense fallback={<p>Loading...</p>}>
        <Albums albumsPromise={albumsPromise} />
      </Suspense>
    </ErrorBoundary>
  );
}

function Albums({ albumsPromise }) {
  const albums = use(albumsPromise);
  return (
    <ul>
      {albums.map(album => (
        <li key={album.id}>
          {album.title} ({album.year})
        </li>
      ))}
    </ul>
  );
}

```

---

## Troubleshooting[](#troubleshooting "Link for Troubleshooting ")

### I’m getting an error: “Suspense Exception: This is not a real error!”[](#suspense-exception-error "Link for I’m getting an error: “Suspense Exception: This is not a real error!” ")

You are calling `use` inside a try-catch block. `use` throws internally to integrate with Suspense, so it cannot be wrapped in try-catch. Instead, wrap the component that calls `use` in an [Error Boundary](#displaying-an-error-with-an-error-boundary) to handle errors.

```
function Albums({ albumsPromise }) {
try {
// ❌ Don't wrap `use` in try-catch
const albums = use(albumsPromise);
} catch (e) {
return <p>Error</p>;
}
// ...
```

Instead, wrap the component in an Error Boundary:

```
function Albums({ albumsPromise }) {
// ✅ Call `use` without try-catch
const albums = use(albumsPromise);
// ...
```

```
// ✅ Use an Error Boundary to handle errors
<ErrorBoundary fallback={<p>Error</p>}>
<Albums albumsPromise={albumsPromise} />
</ErrorBoundary>
```

---

### I’m getting a warning: “A component was suspended by an uncached promise”[](#uncached-promise-error "Link for I’m getting a warning: “A component was suspended by an uncached promise” ")

The Promise passed to `use` is not cached, so React cannot reuse it across re-renders.

This commonly happens when calling `fetch` or an `async` function directly in render:

```
function Albums() {
// 🔴 This creates a new Promise on every render
const albums = use(fetch('/albums'));
// ...
}
```

To fix this, cache the Promise so the same instance is reused:

```
// ✅ fetchData returns the same Promise for the same URL
const albums = use(fetchData('/albums'));
```

See [caching Promises for Client Components](#caching-promises-for-client-components) for more details.
