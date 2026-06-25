---
title: "File-system conventions: Parallel Routes"
source_url: "https://nextjs.org/docs/app/api-reference/file-conventions/parallel-routes"
crawled_at: "2026-06-25T07:06:15.803Z"
---

Last updated

March 3, 2026

Parallel Routes allows you to simultaneously or conditionally render one or more pages within the same layout. They are useful for highly dynamic sections of an app, such as dashboards and feeds on social sites.

For example, considering a dashboard, you can use parallel routes to simultaneously render the `team` and `analytics` pages:

![Parallel Routes Diagram](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782371178/aha-mind/docs-crawler/nextjs.org/image_lcsbr9.png)![Parallel Routes Diagram](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782371178/aha-mind/docs-crawler/nextjs.org/image_ufc9gt.png)

## Convention[](#convention)

### Slots[](#slots)

Parallel routes are created using named **slots**. Slots are defined with the `@folder` convention. For example, the following file structure defines two slots: `@analytics` and `@team`:

![Parallel Routes File-system Structure](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782371178/aha-mind/docs-crawler/nextjs.org/image_crpd6p.png)![Parallel Routes File-system Structure](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782371178/aha-mind/docs-crawler/nextjs.org/image_qxagks.png)

Slots are passed as props to the shared parent layout. For the example above, the component in `app/layout.js` now accepts the `@analytics` and `@team` slots props, and can render them in parallel alongside the `children` prop:

However, slots are **not** route segments and do not affect the URL structure. For example, for `/@analytics/views`, the URL will be `/views` since `@analytics` is a slot. Slots are combined with the regular [Page](https://nextjs.org/docs/app/api-reference/file-conventions/page) component to form the final page associated with the route segment. Because of this, you cannot have separate [prerendered](https://nextjs.org/docs/app/glossary#prerendering) and [dynamically rendered](https://nextjs.org/docs/app/glossary#dynamic-rendering) slots at the same route segment level. If one slot is dynamic, all slots at that level must be dynamic.

> **Good to know**:
> 
> -   The `children` prop is an implicit slot that does not need to be mapped to a folder. This means `app/page.js` is equivalent to `app/@children/page.js`.

### `default.js`[](#defaultjs)

You can define a `default.js` file to render as a fallback for unmatched slots during the initial load or full-page reload.

Consider the following folder structure. The `@team` slot has a `/settings` page, but `@analytics` does not.

![Parallel Routes unmatched routes](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782371180/aha-mind/docs-crawler/nextjs.org/image_gg8oqn.png)![Parallel Routes unmatched routes](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782371178/aha-mind/docs-crawler/nextjs.org/image_wrpm8d.png)

When navigating to `/settings`, the `@team` slot will render the `/settings` page while maintaining the currently active page for the `@analytics` slot.

On refresh, Next.js will render a `default.js` for `@analytics`. If `default.js` doesn't exist, a `404` is rendered instead.

Additionally, since `children` is an implicit slot, you also need to create a `default.js` file to render a fallback for `children` when Next.js cannot recover the active state of the parent page.

## Behavior[](#behavior)

By default, Next.js keeps track of the active _state_ (or subpage) for each slot. However, the content rendered within a slot will depend on the type of navigation:

-   [**Soft Navigation**](https://nextjs.org/docs/app/getting-started/linking-and-navigating#client-side-transitions): During client-side navigation, Next.js will perform a [partial render](https://nextjs.org/docs/app/getting-started/linking-and-navigating#client-side-transitions), changing the subpage within the slot, while maintaining the other slot's active subpages, even if they don't match the current URL.
-   **Hard Navigation**: After a full-page load (browser refresh), Next.js cannot determine the active state for the slots that don't match the current URL. Instead, it will render a [`default.js`](#defaultjs) file for the unmatched slots, or `404` if `default.js` doesn't exist.

> **Good to know**:
> 
> -   The `404` for unmatched routes helps ensure that you don't accidentally render a parallel route on a page that it was not intended for.

## Examples[](#examples)

### With `useSelectedLayoutSegment(s)`[](#with-useselectedlayoutsegments)

Both [`useSelectedLayoutSegment`](https://nextjs.org/docs/app/api-reference/functions/use-selected-layout-segment) and [`useSelectedLayoutSegments`](https://nextjs.org/docs/app/api-reference/functions/use-selected-layout-segments) accept a `parallelRoutesKey` parameter, which allows you to read the active route segment within a slot.

When a user navigates to `app/@auth/login` (or `/login` in the URL bar), `loginSegment` will be equal to the string `"login"`.

### Conditional Routes[](#conditional-routes)

You can use Parallel Routes to conditionally render routes based on certain conditions, such as user role. For example, to render a different dashboard page for the `/admin` or `/user` roles:

![Conditional routes diagram](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782371179/aha-mind/docs-crawler/nextjs.org/image_d3ryuo.png)![Conditional routes diagram](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782371178/aha-mind/docs-crawler/nextjs.org/image_kuzf9n.png)

### Tab Groups[](#tab-groups)

You can add a `layout` inside a slot to allow users to navigate the slot independently. This is useful for creating tabs.

For example, the `@analytics` slot has two subpages: `/page-views` and `/visitors`.

![Analytics slot with two subpages and a layout](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782371178/aha-mind/docs-crawler/nextjs.org/image_ipgy1d.png)![Analytics slot with two subpages and a layout](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782371178/aha-mind/docs-crawler/nextjs.org/image_cykxkf.png)

Within `@analytics`, create a [`layout`](https://nextjs.org/docs/app/api-reference/file-conventions/layout) file to share the tabs between the two pages:

### Modals[](#modals)

Parallel Routes can be used together with [Intercepting Routes](https://nextjs.org/docs/app/api-reference/file-conventions/intercepting-routes) to create modals that support deep linking. This allows you to solve common challenges when building modals, such as:

-   Making the modal content **shareable through a URL**.
-   **Preserving context** when the page is refreshed, instead of closing the modal.
-   **Closing the modal on backwards navigation** rather than going to the previous route.
-   **Reopening the modal on forwards navigation**.

Consider the following UI pattern, where a user can open a login modal from a layout using client-side navigation, or access a separate `/login` page:

![Parallel Routes Diagram](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782371178/aha-mind/docs-crawler/nextjs.org/image_bjbddd.png)![Parallel Routes Diagram](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782371178/aha-mind/docs-crawler/nextjs.org/image_mqcxup.png)

To implement this pattern, start by creating a `/login` route that renders your **main** login page.

![Parallel Routes Diagram](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782371178/aha-mind/docs-crawler/nextjs.org/image_id6dod.png)![Parallel Routes Diagram](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782371180/aha-mind/docs-crawler/nextjs.org/image_m175k0.png)

Then, inside the `@auth` slot, add [`default.js`](https://nextjs.org/docs/app/api-reference/file-conventions/default) file that returns `null`. This ensures that the modal is not rendered when it's not active.

Inside your `@auth` slot, intercept the `/login` route by importing the `<Modal>` component and its children into the `@auth/(.)login/page.tsx` file, and updating the folder name to `/@auth/(.)login/page.tsx`.

> **Good to know:**
> 
> -   The convention `(.)` is used for intercepting routes. See [Intercepting Routes](https://nextjs.org/docs/app/api-reference/file-conventions/intercepting-routes#convention) docs for more information.
> -   By separating the `<Modal>` functionality from the modal content (`<Login>`), you can ensure any content inside the modal, e.g. [forms](https://nextjs.org/docs/app/guides/forms), are Server Components. See [Interleaving Client and Server Components](https://nextjs.org/docs/app/getting-started/server-and-client-components#interleaving-server-and-client-components) for more information.

#### Opening the modal[](#opening-the-modal)

Now, you can leverage the Next.js router to open and close the modal. This ensures the URL is correctly updated when the modal is open, and when navigating backwards and forwards.

To open the modal, pass the `@auth` slot as a prop to the parent layout and render it alongside the `children` prop.

When the user clicks the `<Link>`, the modal will open instead of navigating to the `/login` page. However, on refresh or initial load, navigating to `/login` will take the user to the main login page.

#### Closing the modal[](#closing-the-modal)

You can close the modal by calling `router.back()` or by using the `Link` component.

When using the `Link` component to navigate away from a page that shouldn't render the `@auth` slot anymore, we need to make sure the parallel route matches to a component that returns `null`. For example, when navigating back to the root page, we create a `@auth/page.tsx` component:

Or if navigating to any other page (such as `/foo`, `/foo/bar`, etc), you can use a catch-all slot:

> **Good to know:**
> 
> -   We use a catch-all route in our `@auth` slot to close the modal because of how parallel routes behave. Since client-side navigations to a route that no longer match the slot will remain visible, we need to match the slot to a route that returns `null` to close the modal.
> -   Other examples could include opening a photo modal in a gallery while also having a dedicated `/photo/[id]` page, or opening a shopping cart in a side modal.
> -   [View an example](https://github.com/vercel-labs/nextgram) of modals with Intercepted and Parallel Routes.

### Loading and Error UI[](#loading-and-error-ui)

Parallel Routes can be streamed independently, allowing you to define independent error and loading states for each route:

![Parallel routes enable custom error and loading states](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782371178/aha-mind/docs-crawler/nextjs.org/image_vxv8cr.png)![Parallel routes enable custom error and loading states](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782371178/aha-mind/docs-crawler/nextjs.org/image_oemgjz.png)

See the [Loading UI](https://nextjs.org/docs/app/api-reference/file-conventions/loading) and [Error Handling](https://nextjs.org/docs/app/getting-started/error-handling) documentation for more information.
