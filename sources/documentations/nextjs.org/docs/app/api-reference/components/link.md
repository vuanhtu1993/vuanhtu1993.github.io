---
title: "Components: Link Component"
source_url: "https://nextjs.org/docs/app/api-reference/components/link"
crawled_at: "2026-06-25T07:04:42.635Z"
---

Last updated

May 13, 2026

`<Link>` is a React component that extends the HTML `<a>` element to provide [prefetching](https://nextjs.org/docs/app/getting-started/linking-and-navigating#prefetching) and client-side navigation between routes. It is the primary way to navigate between routes in Next.js.

Basic usage:

## Reference[](#reference)

The following props can be passed to the `<Link>` component:

| Prop | Example | Type | Required |
| --- | --- | --- | --- |
| [`href`](#href-required) | `href="/dashboard"` | String or Object | Yes |
| [`replace`](#replace) | `replace={false}` | Boolean | \- |
| [`scroll`](#scroll) | `scroll={false}` | Boolean | \- |
| [`prefetch`](#prefetch) | `prefetch={false}` | Boolean or null | \- |
| [`onNavigate`](#onnavigate) | `onNavigate={(e) => {}}` | Function | \- |
| [`transitionTypes`](#transitiontypes) | `transitionTypes={['slide-in']}` | `string[]` | \- |

> **Good to know**: `<a>` tag attributes such as `className` or `target="_blank"` can be added to `<Link>` as props and will be passed to the underlying `<a>` element.

### `href` (required)[](#href-required)

The path or URL to navigate to.

### `replace`[](#replace)

**Defaults to `false`.** When `true`, `next/link` will replace the current history state instead of adding a new URL into the [browser's history](https://developer.mozilla.org/docs/Web/API/History_API) stack.

### `scroll`[](#scroll)

**Defaults to `true`.** The default scrolling behavior of `<Link>` in Next.js **is to maintain scroll position**, similar to how browsers handle back and forwards navigation. When you navigate to a new [Page](https://nextjs.org/docs/app/api-reference/file-conventions/page), scroll position will stay the same as long as the Page is visible in the viewport. However, if the Page is not visible in the viewport, Next.js will scroll to the top of the first Page element.

When `scroll = {false}`, Next.js will not attempt to scroll to the first Page element.

> **Good to know**: Next.js checks if `scroll: false` before managing scroll behavior. If scrolling is enabled, it identifies the relevant DOM node for navigation and inspects each top-level element. All non-scrollable elements and those without rendered HTML are bypassed, this includes sticky or fixed positioned elements, and non-visible elements such as those calculated with `getBoundingClientRect`. Next.js then continues through siblings until it identifies a scrollable element that is visible in the viewport.

### `prefetch`[](#prefetch)

Prefetching happens when a `<Link />` component enters the user's viewport (initially or through scroll). Next.js prefetches and loads the linked route (denoted by the `href`) and its data in the background to improve the performance of client-side navigations. If the prefetched data has expired by the time the user hovers over a `<Link />`, Next.js will attempt to prefetch it again. **Prefetching is only enabled in production**.

The following values can be passed to the `prefetch` prop:

-   **`"auto"` or `null` (default)**: Prefetch behavior depends on whether the route is static or dynamic. For static routes, the full route will be prefetched (including all its data). For dynamic routes, the partial route down to the nearest segment with a [`loading.js`](https://nextjs.org/docs/app/api-reference/file-conventions/loading#instant-loading-states) boundary will be prefetched.
-   `true`: The full route will be prefetched for both static and dynamic routes.
-   `false`: Prefetching will never happen both on entering the viewport and on hover.

### `onNavigate`[](#onnavigate)

An event handler called during client-side navigation. The handler receives an event object that includes a `preventDefault()` method, allowing you to cancel the navigation if needed.

> **Good to know**: While `onClick` and `onNavigate` may seem similar, they serve different purposes. `onClick` executes for all click events, while `onNavigate` only runs during client-side navigation. Some key differences:
> 
> -   When using modifier keys (`Ctrl`/`Cmd` + Click), `onClick` executes but `onNavigate` doesn't since Next.js prevents default navigation for new tabs.
> -   External URLs won't trigger `onNavigate` since it's only for client-side and same-origin navigations.
> -   Links with the `download` attribute will work with `onClick` but not `onNavigate` since the browser will treat the linked URL as a download.

### `transitionTypes`[](#transitiontypes)

A list of transition types to apply to the navigation. These types are passed to [`React.addTransitionType`](https://react.dev/reference/react/addTransitionType) inside the navigation transition, enabling [`<ViewTransition>`](https://react.dev/reference/react/ViewTransition) components to apply different animations based on the type of navigation.

## Examples[](#examples)

The following examples demonstrate how to use the `<Link>` component in different scenarios.

### Linking to dynamic route segments[](#linking-to-dynamic-route-segments)

When linking to [dynamic segments](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes), you can use [template literals and interpolation](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Template_literals) to generate a list of links. For example, to generate a list of blog posts:

### Checking active links[](#checking-active-links)

You can use [`usePathname()`](https://nextjs.org/docs/app/api-reference/functions/use-pathname) to determine if a link is active. For example, to add a class to the active link, you can check if the current `pathname` matches the `href` of the link:

### Scrolling to an `id`[](#scrolling-to-an-id)

If you'd like to scroll to a specific `id` on navigation, you can append your URL with a `#` hash link or just pass a hash link to the `href` prop. This is possible since `<Link>` renders to an `<a>` element.

> **Good to know**:
> 
> -   Next.js will scroll to the [Page](https://nextjs.org/docs/app/api-reference/file-conventions/page) if it is not visible in the viewport upon navigation.

### Replace the URL instead of push[](#replace-the-url-instead-of-push)

The default behavior of the `Link` component is to `push` a new URL into the `history` stack. You can use the `replace` prop to prevent adding a new entry, as in the following example:

### Disable scrolling to the top of the page[](#disable-scrolling-to-the-top-of-the-page)

The default scrolling behavior of `<Link>` in Next.js **is to maintain scroll position**, similar to how browsers handle back and forwards navigation. When you navigate to a new [Page](https://nextjs.org/docs/app/api-reference/file-conventions/page), scroll position will stay the same as long as the Page is visible in the viewport.

However, if the Page is not visible in the viewport, Next.js will scroll to the top of the first Page element. If you'd like to disable this behavior, you can pass `scroll={false}` to the `<Link>` component, or `scroll: false` to `router.push()` or `router.replace()`.

Using `router.push()` or `router.replace()`:

Because Next.js skips sticky and fixed positioned elements when finding the scroll target, content may end up behind a sticky header after navigation. For example, if your layout has a sticky header:

You can account for its height using [`scroll-padding-top`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding-top) on the scroll container:

This is a browser CSS property that offsets scroll-based positioning. It applies whenever Next.js uses the native [`scrollIntoView()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView) API, including hash fragment (`#id`) navigation. Alternatively, you can use [`scroll-margin-top`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-margin-top) on individual target elements instead of setting a global offset.

### Prefetching links in Proxy[](#prefetching-links-in-proxy)

It's common to use [Proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) for authentication or other purposes that involve rewriting the user to a different page. In order for the `<Link />` component to properly prefetch links with rewrites via Proxy, you need to tell Next.js both the URL to display and the URL to prefetch. This is required to avoid un-necessary fetches to proxy to know the correct route to prefetch.

For example, if you want to serve a `/dashboard` route that has authenticated and visitor views, you can add the following in your Proxy to redirect the user to the correct page:

In this case, you would want to use the following code in your `<Link />` component:

### Blocking navigation[](#blocking-navigation)

You can use the `onNavigate` prop to block navigation when certain conditions are met, such as when a form has unsaved changes. When you need to block navigation across multiple components in your app (like preventing navigation from any link while a form is being edited), React Context provides a clean way to share this blocking state. First, create a context to track the navigation blocking state:

Create a form component that uses the context:

Create a custom Link component that blocks navigation:

Create a navigation component:

Finally, wrap your app with the `NavigationBlockerProvider` in the root layout and use the components in your page:

Then, use the `Nav` and `Form` components in your page:

When a user tries to navigate away using `CustomLink` while the form has unsaved changes, they'll be prompted to confirm before leaving.

## Version history[](#version-history)

| Version | Changes |
| --- | --- |
| `v16.2.0` | Add `transitionTypes` prop. |
| `v15.4.0` | Add `auto` as an alias to the default `prefetch` behavior. |
| `v15.3.0` | Add `onNavigate` API |
| `v13.0.0` | No longer requires a child `<a>` tag. A [codemod](https://nextjs.org/docs/app/guides/upgrading/codemods#remove-a-tags-from-link-components) is provided to automatically update your codebase. |
| `v10.0.0` | `href` props pointing to a dynamic route are automatically resolved and no longer require an `as` prop. |
| `v8.0.0` | Improved prefetching performance. |
| `v1.0.0` | `next/link` introduced. |
