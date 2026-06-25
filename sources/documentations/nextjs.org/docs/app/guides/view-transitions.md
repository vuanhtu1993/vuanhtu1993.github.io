---
title: "Guides: View transitions"
source_url: "https://nextjs.org/docs/app/guides/view-transitions"
crawled_at: "2026-06-25T07:03:36.448Z"
---

## Designing view transitions

Last updated

May 13, 2026

In web apps, route changes replace the entire page at once. One set of elements disappears, another appears, with no visual connection between them. A user selects a photo thumbnail to view it in detail on another page. They are the same image, but nothing on screen communicates that.

Apps that need these transitions typically rely on complex animation libraries that manage mount/unmount lifecycles, track element positions across routes, and coordinate timing manually, to animate how elements enter, exit, and move between states.

React's `<ViewTransition>` component integrates with the browser's [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) to handle this declaratively. You name the elements that should persist, and the browser animates between their old and new positions.

This guide walks through four patterns that cover the most common cases: morphing shared elements, animating loading states, adding directional navigation, and crossfading content within the same route.

## Example[](#example)

As an example, we'll build a photography gallery called _Frames_.

We'll start by morphing a thumbnail into a hero image (shared elements), then animate the loading skeleton into real content (Suspense reveals), add directional slides for forward and back navigation (route transitions), and finish with crossfades for switching between photographer tabs (same-route transitions).

You can find the resources used in this example here:

-   [Demo](https://react-view-transitions-demo.labs.vercel.dev/)
-   [Code](https://github.com/vercel-labs/react-view-transitions-demo)

Before starting, enable view transitions in your Next.js config:

App Router uses [React canary releases](https://react.dev/blog/2023/05/03/react-canaries), which contain all stable React 19 changes as well as newer features like `ViewTransition`. You do not need to install `react@canary` yourself.

The View Transitions API is supported in all major browsers, though some animations may behave differently in Safari. Without browser support, your application works normally, the transitions simply do not animate.

Then import the `ViewTransition` component from React:

`<ViewTransition>` animations are activated by [Transitions](https://react.dev/reference/react/useTransition), [`<Suspense>`](https://react.dev/reference/react/Suspense), and [`useDeferredValue`](https://react.dev/reference/react/useDeferredValue). Regular `setState` calls do not trigger them. In Next.js, route navigations are transitions, so `<ViewTransition>` animations activate automatically during navigation.

### Step 1: Morph a thumbnail into a hero image[](#step-1-morph-a-thumbnail-into-a-hero-image)

The gallery displays photos in a grid. Clicking a photo opens a detail page with a larger version of the same image. Without transitions, the thumbnail disappears and the hero appears. Nothing connects them visually. The user has to scan the detail page to confirm they clicked the right photo.

In motion design, when an object persists across a cut, it communicates continuity. The viewer understands they are looking at the same thing, not a replacement. This is the most important transition pattern: **shared element morphing**.

Wrap both the grid thumbnail and the detail hero in `<ViewTransition>` with the same `name`:

The `name` prop creates identity. React finds elements with the same name on the old and new pages, then animates between their size and position automatically. No additional props are needed for the morph to work.

If we click a thumbnail now, the image scales and repositions from its grid cell to the hero slot. Navigating back reverses the morph. The user sees one object moving, not two objects swapping.

#### Customizing the morph animation[](#customizing-the-morph-animation)

The morph works without any CSS. To customize it, add `share="morph"`. This assigns the `morph` class to the view transition, which you can target with CSS pseudo-elements. For example, to soften the morph mid-flight with a [`blur`](https://developer.mozilla.org/en-US/docs/Web/CSS/filter-function/blur) keyframe:

The blur hides pixel-level interpolation artifacts during the transition. At 400ms, the morph is slow enough to register but fast enough to feel direct.

### Step 2: Animate loading states with Suspense reveals[](#step-2-animate-loading-states-with-suspense-reveals)

The photo detail page loads its content asynchronously. While data is in flight, a Suspense boundary shows a skeleton. When the data resolves, the skeleton is replaced by the real content.

Without a transition, the swap is instant. The skeleton vanishes and the content pops in.

In motion design, vertical direction encodes hierarchy. Content sliding up communicates arrival. Content sliding down communicates departure. The pair together creates a handoff: the placeholder yields to the real thing.

Wrap the Suspense fallback in a `ViewTransition` with an exit animation, and the content in a `ViewTransition` with an enter animation:

The `default="none"` prop prevents this `ViewTransition` from animating during unrelated transitions, like the shared element morph from Step 1. Without it, every transition on the page would trigger every `ViewTransition`'s animation.

The CSS animations use asymmetric timing. The exit is fast (150ms). The enter is slower (210ms) and delayed until the exit completes:

The asymmetry is deliberate. Old content should leave quickly so it does not compete for attention. New content should arrive more gently so the user has time to register it. The `var(--duration-exit)` delay on the enter animation means the new content waits for the old content to finish leaving before it appears.

If we refresh the page, the skeleton slides down and fades out, and a moment later the real content slides up and fades in.

### Step 3: Add directional motion for navigation[](#step-3-add-directional-motion-for-navigation)

The gallery now has morphing images and animated loading states. But navigating between pages still has no directional signal. Forward and back navigations look identical. The user cannot tell from the animation whether they moved deeper into the app or returned to a previous page.

In film and animation, horizontal direction encodes spatial position. Moving left means progressing forward (like turning a page in a left-to-right language). Moving right means going back. This convention is so ingrained that violating it feels disorienting.

Use the `transitionTypes` prop on `<Link>` to tag forward navigations:

The same pattern works for any navigation within the app. For example, previous/next arrows on a photo detail page can use `nav-back` and `nav-forward` to animate in the corresponding direction.

For links that return the user to a previous page, use `nav-back`:

The transition type is not automatic. You decide which links are "forward" and which are "back" based on your app's navigation hierarchy.

Then wrap page content in a `ViewTransition` that maps transition types to directional animations:

The `enter` and `exit` props accept an object keyed by transition type. When a navigation carries the `nav-forward` type, the exit animation slides old content left and the enter animation slides new content in from the right. The `default: "none"` ensures that transitions without a type (like initial page loads) produce no animation.

The CSS for directional slides:

The 60px offset is enough to communicate direction without making the user track a fast-moving element across the screen.

During directional slides, the header should not move. A sliding header breaks the user's spatial anchor. They need one fixed reference point to understand that the _content_ moved, not the entire viewport.

Assign the header a `viewTransitionName` and suppress its animation in CSS:

The `display: none` on the old snapshot prevents a flash where both old and new headers are briefly visible. The `z-index: 100` ensures the header renders above the sliding content.

If we navigate forward to a photo, content slides left. If we click the "← Gallery" link (tagged with `nav-back`), content slides right. The header stays fixed throughout both transitions.

Browser-initiated back navigations (the back button or swipe gestures) do not carry a transition type, so the directional slide does not play. The shared element morph from Step 1 still applies if both pages have matching `name` props.

#### Respecting reduced motion[](#respecting-reduced-motion)

Directional slides simulate physical movement across the viewport. This is the most common trigger for motion sensitivity. Morphs, reveals, and crossfades carry less risk since they affect smaller areas or rely on opacity rather than position.

The simplest approach is to disable all animation durations:

Without animation, content swaps instantly, which is the browser's default behavior. A more refined approach would preserve crossfades and opacity transitions while removing positional movement. See ["No Motion Isn't Always prefers-reduced-motion"](https://css-tricks.com/nuking-motion-with-prefers-reduced-motion/) for more on this.

### Step 4: Crossfade content within the same route[](#step-4-crossfade-content-within-the-same-route)

The gallery has a photographer section with tabs. Each tab shows a different photographer's photos, but the route structure is the same: `/collection/[slug]`. Clicking between tabs does not feel like navigating to a new page. It feels like switching content within the same container.

A directional slide would be wrong here. Slides communicate "going to a new place." A crossfade communicates "same place, different content." The container persists (continuity), only the grid inside changes (swap).

Use a `ViewTransition` with `key` set to the current slug. When the key changes, React triggers a transition between the old and new content:

The `share="auto"` and `enter="auto"` props tell React to use its default crossfade animation. The `name` prop gives the container an identity so React knows what to animate. The `key={slug}` change is what triggers the transition.

If we click between photographer tabs, the grid crossfades. The tab bar and surrounding layout do not move. Only the photo grid transitions between states.

## Next steps[](#next-steps)

You now know how to use view transitions to communicate meaning during navigation. Shared elements communicate continuity across routes. Suspense reveals animate loading handoffs. Directional slides encode navigation history. Crossfades signal content changes within the same location.

Each pattern answers a different question for the user:

| Pattern | What it communicates |
| --- | --- |
| Shared element (morph) | "Same thing, going deeper" |
| Suspense reveal | "Data loaded" |
| Directional slide | "Going forward / coming back" |
| Same-route crossfade | "Same place, different content" |

For API details and more patterns:

-   [View transition configuration](https://nextjs.org/docs/app/api-reference/config/next-config-js/viewTransition)
-   [Link `transitionTypes` prop](https://nextjs.org/docs/app/api-reference/components/link#transitiontypes)
-   [`useRouter`](https://nextjs.org/docs/app/api-reference/functions/use-router), which also supports `transitionTypes` in `push()` and `replace()`
-   [React `ViewTransition` component](https://react.dev/reference/react/ViewTransition)
-   [Complete CSS from this guide](https://github.com/vercel-labs/react-view-transitions-demo/blob/main/src/app/globals.css) — all keyframes and view transition rules in one file
