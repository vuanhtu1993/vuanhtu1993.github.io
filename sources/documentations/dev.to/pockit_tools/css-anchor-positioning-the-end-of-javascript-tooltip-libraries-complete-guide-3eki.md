---
title: "CSS Anchor Positioning: The End of JavaScript Tooltip Libraries (Complete Guide)"
source_url: "https://dev.to/pockit_tools/css-anchor-positioning-the-end-of-javascript-tooltip-libraries-complete-guide-3eki"
crawled_at: "2026-08-07T09:31:03.582Z"
---

Every frontend developer has fought the tooltip positioning battle. You need a dropdown menu attached to a button, a tooltip that follows its trigger, or a popover that stays anchored to a specific element. The solution has always been the same: install a JavaScript library, calculate coordinates on every scroll and resize event, handle overflow detection, and pray that the z-index stacking context doesn't break everything.

Floating UI (the successor to Popper.js) has over 23 million weekly npm downloads for its core package alone. That's millions of projects compensating for something CSS couldn't do natively — until now.

The **CSS Anchor Positioning API** has hit Baseline 2026 with full support across Chrome 125+, Firefox 147+, and Safari 26. This isn't an experimental feature behind a flag. It's production-ready, and it fundamentally changes how we build positioned UI elements on the web.

This guide covers everything: the core API, advanced fallback strategies, integration with the Popover API, real-world migration patterns from JavaScript libraries, and the edge cases that will bite you if you're not prepared.

---

## [](#the-problem-css-anchor-positioning-solves)The Problem CSS Anchor Positioning Solves

Before this API existed, positioning an element relative to another element required one of three approaches:

**1\. Absolute Positioning with Manual Offsets** — Fragile, breaks on scroll, doesn't handle overflow.  

```
/* The classic hack */
.tooltip-wrapper {
  position: relative;
}
.tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
}
```

 

This works for static layouts but falls apart when the trigger element is near the viewport edge, the page scrolls, or the container has `overflow: hidden`.

**2\. JavaScript Position Calculation** — The industry standard for a decade.  

```
// What Floating UI does under the hood (simplified)
function updatePosition(anchor, floating) {
  const anchorRect = anchor.getBoundingClientRect();
  const floatingRect = floating.getBoundingClientRect();

  let top = anchorRect.bottom + 8;
  let left = anchorRect.left + (anchorRect.width - floatingRect.width) / 2;

  // Overflow detection
  if (top + floatingRect.height > window.innerHeight) {
    top = anchorRect.top - floatingRect.height - 8; // flip to top
  }
  if (left < 0) left = 8; // shift right
  if (left + floatingRect.width > window.innerWidth) {
    left = window.innerWidth - floatingRect.width - 8; // shift left
  }

  floating.style.top = `${top}px`;
  floating.style.left = `${left}px`;
}

// Must run on scroll, resize, and mutation
window.addEventListener('scroll', () => updatePosition(anchor, floating), { passive: true });
window.addEventListener('resize', () => updatePosition(anchor, floating));
const observer = new ResizeObserver(() => updatePosition(anchor, floating));
observer.observe(anchor);
```

 

This works, but you're running layout calculations in JavaScript on every scroll frame. You're fighting the browser's rendering pipeline instead of working with it.

**3\. CSS Anchor Positioning** — The native solution.  

```
.trigger {
  anchor-name: --my-trigger;
}

.tooltip {
  position: fixed;
  position-anchor: --my-trigger;
  bottom: anchor(top);
  left: anchor(center);
  translate: -50% 0;

  /* Automatic overflow handling */
  position-try-fallbacks: flip-block;
}
```

 

No JavaScript. No scroll listeners. No resize observers. No `getBoundingClientRect()`. The browser handles everything in the rendering pipeline, where it belongs.

---

## [](#core-api-the-three-building-blocks)Core API: The Three Building Blocks

CSS Anchor Positioning is built on three concepts: **declaring anchors**, **positioning against anchors**, and **handling overflow**.

### [](#1-declaring-an-anchor)1\. Declaring an Anchor

Any element can become an anchor by giving it a name with the `anchor-name` property:  

```
.profile-avatar {
  anchor-name: --avatar;
}

.settings-gear {
  anchor-name: --settings-btn;
}
```

 

Rules:

-   Names must use the CSS dashed-ident syntax (`--` prefix).
-   An element can only have one anchor name at a time.
-   Anchor names exist in the same scope as the positioned element — they follow containing block rules.

You can also declare anchors inline with HTML:  

```
<button style="anchor-name: --menu-trigger">Menu</button>
```

 

### [](#2-positioning-against-an-anchor)2\. Positioning Against an Anchor

To position an element relative to an anchor, you need three things:

1.  The positioned element must have `position: absolute` or `position: fixed`.
2.  Link it to an anchor via `position-anchor`.
3.  Use the `anchor()` function in inset properties (`top`, `right`, `bottom`, `left`).

```
.status-badge {
  position: fixed;
  position-anchor: --avatar;

  /* Position at the bottom-right corner of the avatar */
  top: anchor(bottom);
  left: anchor(right);
}
```

 

The `anchor()` function accepts a side keyword that refers to the **anchor's** geometry:

| `anchor()` value | What it means |
| --- | --- |
| `anchor(top)` | The anchor's top edge |
| `anchor(bottom)` | The anchor's bottom edge |
| `anchor(left)` | The anchor's left edge |
| `anchor(right)` | The anchor's right edge |
| `anchor(center)` | The anchor's center point (on the relevant axis) |
| `anchor(start)` | Logical start (respects writing direction) |
| `anchor(end)` | Logical end |

You can also use `anchor()` with a percentage:  

```
.tooltip {
  position: fixed;
  position-anchor: --trigger;

  /* Position at 25% from the anchor's left edge */
  left: anchor(25%);
  bottom: anchor(top);
}
```

 

### [](#the-raw-positionarea-endraw-shorthand)The `position-area` Shorthand

For common placements, `position-area` provides a simpler mental model. Instead of thinking about individual sides, you think about a 3×3 grid around the anchor:  

```
┌──────────┬──────────┬──────────┐
│ top left │ top      │ top right│
├──────────┼──────────┼──────────┤
│ left     │ center   │ right    │
├──────────┼──────────┼──────────┤
│ bottom   │ bottom   │ bottom   │
│ left     │          │ right    │
└──────────┴──────────┴──────────┘
```

 

```
/* Tooltip below the anchor, centered */
.tooltip {
  position: fixed;
  position-anchor: --trigger;
  position-area: bottom center;
  margin-top: 8px;
}

/* Sidebar to the right of the anchor */
.sidebar {
  position: fixed;
  position-anchor: --panel;
  position-area: right;
}

/* Notification badge at top-right corner */
.badge {
  position: absolute;
  position-anchor: --icon;
  position-area: top right;
}
```

 

`position-area` is usually what you want. Use raw `anchor()` functions only when you need sub-element precision (like "20% from the left edge of the anchor").

### [](#3-overflow-handling-with-raw-positiontryfallbacks-endraw-)3\. Overflow Handling with `position-try-fallbacks`

This is where CSS Anchor Positioning truly beats JavaScript libraries. The `position-try-fallbacks` property defines what happens when the positioned element would overflow its containing block:  

```
.tooltip {
  position: fixed;
  position-anchor: --trigger;
  position-area: bottom center;
  margin-top: 8px;

  /* If it overflows the bottom, flip to the top */
  position-try-fallbacks: flip-block;
}
```

 

Built-in strategies:

| Strategy | Behavior |
| --- | --- |
| `flip-block` | Flips the element to the opposite side on the block axis (top ↔ bottom) |
| `flip-inline` | Flips on the inline axis (left ↔ right) |
| `flip-block flip-inline` | Tries flipping on both axes |

For more control, define custom fallback positions with `@position-try`:  

```
@position-try --above {
  position-area: top center;
  margin-bottom: 8px;
}

@position-try --left-side {
  position-area: left;
  margin-right: 8px;
}

@position-try --right-side {
  position-area: right;
  margin-left: 8px;
}

.tooltip {
  position: fixed;
  position-anchor: --trigger;
  position-area: bottom center;
  margin-top: 8px;

  /* Try each fallback in order until one fits */
  position-try-fallbacks: --above, --left-side, --right-side;
}
```

 

The browser evaluates each fallback in order and picks the first one that doesn't cause overflow. This happens automatically during layout — no JavaScript, no `requestAnimationFrame`, no resize observers.

---

## [](#integration-with-the-popover-api)Integration with the Popover API

CSS Anchor Positioning becomes even more powerful when combined with the HTML Popover API (`popover` attribute). Together, they provide the complete tooltip/dropdown solution:  

```
<button popovertarget="user-menu" style="anchor-name: --menu-btn">
  Settings ⚙️
</button>

<div id="user-menu" popover anchor="menu-btn">
  <nav>
    <a href="/profile">Profile</a>
    <a href="/settings">Settings</a>
    <a href="/logout">Log out</a>
  </nav>
</div>
```

 

```
[popover] {
  position: fixed;
  position-anchor: --menu-btn;
  position-area: bottom left;
  margin-top: 4px;

  position-try-fallbacks: flip-block;
}
```

 

What you get for free:

-   **Top layer rendering** — No z-index wars. Popovers render in the browser's top layer.
-   **Light dismiss** — Clicking outside automatically closes the popover.
-   **Accessible by default** — Keyboard navigation and focus management handled by the browser.
-   **Anchor positioning** — The menu stays attached to its trigger, handles overflow, and adjusts on scroll.

Zero JavaScript. All of it.

### [](#tooltip-pattern-with-popover)Tooltip pattern with Popover

```
<button popovertarget="tip" popovertargetaction="toggle"
        style="anchor-name: --help-btn">
  Help?
</button>

<div id="tip" popover="hint">
  This action cannot be undone.
</div>
```

 

```
#tip {
  position: fixed;
  position-anchor: --help-btn;
  position-area: top center;
  margin-bottom: 8px;

  position-try-fallbacks: flip-block, flip-inline;

  /* Style it like a tooltip */
  background: var(--surface-inverse);
  color: var(--text-inverse);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  max-width: 240px;
}
```

 

The `popover="hint"` variant is non-modal and doesn't steal focus — perfect for tooltips.

> **Note:** `popover="hint"` is part of the Interop 2026 focus area and browser support is still growing. If cross-browser compatibility is critical, use `popover="manual"` with JavaScript show/hide logic as a fallback.

---

## [](#realworld-patterns)Real-World Patterns

### [](#pattern-1-dropdown-menu-with-submenus)Pattern 1: Dropdown Menu with Submenus

```
/* Primary menu trigger */
.nav-item {
  anchor-name: --nav-item;
}

/* Dropdown */
.dropdown {
  position: fixed;
  position-anchor: --nav-item;
  position-area: bottom span-right;
  margin-top: 4px;

  position-try-fallbacks: flip-block;
}

/* Submenu items act as anchors for their submenus */
.dropdown-item {
  anchor-name: --sub-trigger;
}

.submenu {
  position: fixed;
  position-anchor: --sub-trigger;
  position-area: right;
  margin-left: 2px;

  position-try-fallbacks: flip-inline;
}
```

 

Note the `span-right` keyword in `position-area` — it stretches the positioned element to span from the anchor's position toward the right, which is exactly how dropdown menus should behave. Submenus use `flip-inline` to flip from right to left when they'd overflow the viewport.

### [](#pattern-2-form-field-validation-tooltip)Pattern 2: Form Field Validation Tooltip

```
<div class="field">
  <label for="email">Email</label>
  <input id="email" type="email" style="anchor-name: --email-input"
         required placeholder="you@example.com">
  <div class="validation-msg" popover="hint" id="email-error">
    Please enter a valid email address
  </div>
</div>
```

 

```
#email-error {
  position: fixed;
  position-anchor: --email-input;
  position-area: right;
  margin-left: 12px;

  position-try-fallbacks: --below-field;

  /* Danger styling */
  background: var(--color-danger-surface);
  color: var(--color-danger-text);
  border: 1px solid var(--color-danger-border);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  max-width: 200px;
}

@position-try --below-field {
  position-area: bottom span-right;
  margin-top: 4px;
  margin-left: 0;
}
```

 

On desktop, the validation message appears to the right of the input. On mobile or narrow viewports where there's no room, it automatically falls back to below the field. No media queries needed.

### [](#pattern-3-contextual-annotations-google-docs-style)Pattern 3: Contextual Annotations (Google Docs Style)

```
/* Each comment marker is an anchor */
.comment-marker {
  anchor-name: --comment;
  background: var(--highlight-yellow);
}

.comment-thread {
  position: fixed;
  position-anchor: --comment;
  position-area: right;
  margin-left: 24px;
  width: 280px;

  position-try-fallbacks: --left-side;
}

@position-try --left-side {
  position-area: left;
  margin-right: 24px;
}
```

 

---

## [](#migrating-from-javascript-libraries)Migrating from JavaScript Libraries

If you're using Floating UI, Tippy.js, or a similar library, here's how the concepts map:

### [](#floating-ui-%E2%86%92-css-anchor-positioning)Floating UI → CSS Anchor Positioning

| Floating UI concept | CSS equivalent |
| --- | --- |
| `computePosition()` | `position-anchor` + `anchor()` |
| `placement: 'bottom'` | `position-area: bottom center` |
| `flip()` middleware | `position-try-fallbacks: flip-block` |
| `shift()` middleware | `position-try-fallbacks` with custom `@position-try` |
| `offset(8)` | `margin-top: 8px` (or relevant margin) |
| `autoUpdate()` | Built-in (automatic) |
| `arrow` middleware | CSS `::before` pseudo-element with `anchor()` |

### [](#migration-example)Migration Example

**Before (Floating UI):**  

```
import { computePosition, flip, shift, offset } from '@floating-ui/dom';

const button = document.querySelector('#trigger');
const tooltip = document.querySelector('#tooltip');

function update() {
  computePosition(button, tooltip, {
    placement: 'bottom',
    middleware: [offset(8), flip(), shift({ padding: 5 })],
  }).then(({ x, y }) => {
    Object.assign(tooltip.style, {
      left: `${x}px`,
      top: `${y}px`,
    });
  });
}

// Must be called on every scroll, resize, and DOM mutation
const cleanup = autoUpdate(button, tooltip, update);
```

 

**After (CSS Anchor Positioning):**  

```
<button style="anchor-name: --trigger">Hover me</button>
<div class="tooltip">Tooltip content</div>
```

 

```
.tooltip {
  position: fixed;
  position-anchor: --trigger;
  position-area: bottom center;
  margin-top: 8px;

  position-try-fallbacks: flip-block, flip-inline;
}
```

 

The JavaScript version requires importing a library (~3KB min+gzip for Floating UI core), setting up auto-update listeners, and cleaning them up on unmount. The CSS version is three properties and zero JavaScript.

### [](#what-about-the-arrow)What About the Arrow?

JavaScript tooltip libraries typically provide arrow middleware. With CSS Anchor Positioning, you use a pseudo-element:  

```
.tooltip {
  position: fixed;
  position-anchor: --trigger;
  position-area: bottom center;
  margin-top: 12px;

  position-try-fallbacks: flip-block;
}

.tooltip::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: anchor(--trigger center);
  translate: -50% 0;

  border: 6px solid transparent;
  border-bottom-color: var(--tooltip-bg);
}
```

 

The key insight: the arrow pseudo-element uses `anchor()` to stay aligned with the trigger's center, even if the tooltip shifts position due to overflow handling. This is something that JavaScript libraries handle with dedicated middleware — here it's one CSS property.

---

## [](#edge-cases-and-gotchas)Edge Cases and Gotchas

### [](#1-anchor-scope-and-visibility)1\. Anchor Scope and Visibility

Anchors must be in the same containing block scope as the positioned element. If your anchor is inside a `position: relative` container with `overflow: hidden`, the positioned element won't be able to "see" outside that container.

**Solution:** Use `position: fixed` for the positioned element and ensure the anchor is accessible from the fixed positioning context.

### [](#2-multiple-elements-with-the-same-anchor-name)2\. Multiple Elements with the Same Anchor Name

If multiple elements have the same `anchor-name`, only the **last one in DOM order** becomes the active anchor. This is by design but can cause confusion.  

```
/* DON'T: Both buttons have the same anchor name */
.btn { anchor-name: --btn; }

/* The tooltip will anchor to the LAST .btn in the DOM */
.tooltip { position-anchor: --btn; }
```

 

**Solution:** Use unique anchor names, or use the `anchor-name` property dynamically with CSS custom properties.

### [](#3-implicit-anchoring-with-the-raw-anchor-endraw-attribute)3\. Implicit Anchoring with the `anchor` Attribute

The HTML `anchor` attribute provides implicit anchoring without needing `position-anchor` in CSS:  

```
<button id="my-btn">Click</button>
<div anchor="my-btn" class="popup">Content</div>
```

 

```
.popup {
  position: fixed;
  /* No position-anchor needed — the HTML anchor attribute does it */
  position-area: bottom center;
}
```

 

Note: The `anchor` HTML attribute uses the **element's ID** (without `--` prefix), while the CSS `anchor-name` property uses the **CSS dashed-ident** (with `--` prefix). Don't mix them up.

### [](#4-animation-considerations)4\. Animation Considerations

When animating anchor-positioned elements, use CSS transitions on the positioned element itself, not on the anchor position properties:  

```
.tooltip {
  position: fixed;
  position-anchor: --trigger;
  position-area: bottom center;

  /* Animate the tooltip, not the position */
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity 0.2s, transform 0.2s;
}

.tooltip:popover-open {
  opacity: 1;
  transform: translateY(0);
}

/* Entry animation from display: none */
@starting-style {
  .tooltip:popover-open {
    opacity: 0;
    transform: translateY(-4px);
  }
}
```

 

The `@starting-style` rule is critical here — it defines the starting state for CSS transitions when an element goes from `display: none` to being visible (which is what happens when a popover opens).

### [](#5-dynamic-anchor-switching)5\. Dynamic Anchor Switching

You can change which anchor an element is positioned against dynamically:  

```
.contextual-toolbar {
  position: fixed;
  position-anchor: --active-selection;
  position-area: top center;
  margin-bottom: 8px;
}
```

 

```
// When user selects text, update the anchor
document.addEventListener('selectionchange', () => {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const marker = document.getElementById('selection-marker');
    const rect = range.getBoundingClientRect();
    marker.style.cssText = `
      anchor-name: --active-selection;
      position: fixed;
      top: ${rect.top}px;
      left: ${rect.left}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      pointer-events: none;
    `;
  }
});
```

 

This pattern is useful for contextual toolbars (like Medium's floating formatting toolbar) where the anchor position changes based on user interaction.

---

## [](#performance-why-native-beats-javascript)Performance: Why Native Beats JavaScript

The performance difference between CSS Anchor Positioning and JavaScript-based positioning isn't marginal — it's architectural.

### [](#javascript-positioning-pipeline)JavaScript Positioning Pipeline

```
User scrolls
  → scroll event fires
    → JavaScript runs getBoundingClientRect() (forces layout)
      → JavaScript calculates new position
        → JavaScript updates element.style (triggers layout)
          → Browser re-renders

Every scroll frame: Layout → JS → Layout → Paint → Composite
```

 

This creates a layout thrashing loop. `getBoundingClientRect()` forces the browser to calculate layout, then setting `style.top` triggers another layout pass. In the worst case, this happens 60+ times per second.

### [](#css-anchor-positioning-pipeline)CSS Anchor Positioning Pipeline

```
User scrolls
  → Browser updates positions during normal layout pass
    → Paint → Composite

Every scroll frame: Layout (includes positioning) → Paint → Composite
```

 

The browser handles anchor positioning during its normal layout phase. There's no JavaScript interruption, no forced layout calculations, no double layout passes. Anchor positions are resolved in the same pass as regular CSS layout.

### [](#what-this-means-in-practice)What This Means in Practice

For a page with 20 tooltips/popovers:

-   **JavaScript approach:** 20 scroll listeners, each forcing layout recalculation. Total cost: measurable frame drops during fast scrolling.
-   **CSS approach:** Zero scroll listeners. All 20 positions resolved in a single layout pass. Zero JavaScript execution during scroll.

On mobile devices where CPU is constrained and every millisecond of main thread time matters, this difference is the gap between smooth 60fps scrolling and noticeable jank.

---

## [](#browser-support-and-progressive-enhancement)Browser Support and Progressive Enhancement

As of March 2026, CSS Anchor Positioning is fully supported in:

-   Chrome/Edge 125+ (since June 2024)
-   Firefox 147+ (since early 2026)
-   Safari 26+ (since early 2026)

For older browsers, use `@supports` to provide a fallback:  

```
/* Fallback: simple absolute positioning */
.tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
}

/* Progressive enhancement: use anchor positioning if supported */
@supports (anchor-name: --a) {
  .tooltip {
    position: fixed;
    position-anchor: --trigger;
    position-area: top center;
    margin-bottom: 8px;
    translate: none;
    inset: auto;

    position-try-fallbacks: flip-block;
  }
}
```

 

If your users are on modern browsers (which is increasingly likely in 2026), you can use anchor positioning without fallbacks.

---

## [](#conclusion)Conclusion

CSS Anchor Positioning is the most significant layout primitive added to CSS since Flexbox and Grid. It solves a problem that has required JavaScript for over a decade — positioning elements relative to other elements with overflow awareness.

The API is deceptively simple. Three properties (`anchor-name`, `position-anchor`, `position-area`) handle 80% of use cases. `@position-try` fallbacks handle the remaining 20%. Combined with the Popover API, you get complete tooltip, dropdown, and popover behavior with zero JavaScript.

For new projects in 2026, there is no reason to install Floating UI, Popper.js, or Tippy.js for basic anchored positioning. The browser does it natively, more performantly, and with less code.

For existing projects, the migration path is straightforward: replace `computePosition()` calls with CSS properties, remove scroll/resize listeners, and delete the positioning library from your dependencies. Your users get smoother scrolling, your bundle gets smaller, and your code gets simpler.

The tooltip positioning war is over. CSS won.

---

> 🔒 **Privacy First:** This article was originally published on the [Pockit Blog](https://pockit.tools/blog/css-anchor-positioning-api-complete-guide/).
> 
> Stop sending your data to random servers. Use [Pockit.tools](https://pockit.tools/json-formatter/) for secure utilities, or **[install the Chrome Extension](https://chromewebstore.google.com/detail/pockit-developer-tools-pd/lojcamfhllebjmcjmipecgecbeopookg)** to keep your files 100% private and offline.
