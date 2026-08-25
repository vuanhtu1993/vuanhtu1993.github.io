---
title: "htmx in 2026: When You Don't Need React (And When You Absolutely Do)"
source_url: "https://dev.to/pockit_tools/htmx-in-2026-when-you-dont-need-react-and-when-you-absolutely-do-2mf4"
crawled_at: "2026-08-07T09:30:11.628Z"
---

The frontend community has been arguing about htmx vs React for two years now, and most of the arguments are wrong. Not because either technology is bad, but because the debate frames them as competitors solving the same problem. They're not.

htmx crossed 47,000 GitHub stars. React still powers millions of production applications. The 2025 State of JS survey (published February 2026) shows htmx maintaining its "most admired" status among developers who've tried it, while React's satisfaction score dropped to its lowest point despite 83.6% usage. Something is clearly shifting, but what exactly?

This isn't another "htmx good, React bad" article. This is a decision framework. By the end, you'll know exactly when htmx is the right call, when React is still irreplaceable, and when the answer is "use both."

---

## [](#the-core-architectural-divide)The Core Architectural Divide

Before comparing features, you need to understand the fundamental difference. htmx and React don't just use different APIs — they represent different philosophies about where application state should live.

### [](#react-the-clientside-application-model)React: The Client-Side Application Model

React treats the browser as an application runtime. Your server is an API that returns JSON. Your client is a full application that manages state, handles routing, renders UI, and orchestrates side effects.  

```
[Server] → JSON → [React App] → DOM
                      ↑
              State Management
              Routing
              Side Effects
              Error Boundaries
```

 

This model is powerful. It enables offline-first applications, optimistic updates, complex animations, real-time collaboration, and rich interactive experiences. It's also complex. A typical React application in 2026 involves:

-   A meta-framework (Next.js, Remix, or similar)
-   A state management approach (React Context, Zustand, Jotai, or Server Components)
-   A data fetching layer (TanStack Query, SWR, or framework-native loaders)
-   A build pipeline (Vite, Turbopack, or Webpack)
-   TypeScript configuration
-   Testing infrastructure (Vitest, Playwright, Testing Library)

That's six layers of tooling before you write a single line of business logic.

### [](#htmx-the-hypermedia-model)htmx: The Hypermedia Model

htmx treats the browser as a document viewer that can swap parts of the document. Your server returns HTML fragments. The client has no application state, no routing logic, no build step.  

```
[Server] → HTML → [Browser + htmx] → DOM (swap target)
```

 

The server is the application. The browser is the renderer. htmx is the bridge that lets you update parts of the page without full reloads.  

```
<!-- A search form that updates results without a page reload -->
<input type="search" 
       name="q" 
       hx-get="/search" 
       hx-trigger="input changed delay:300ms" 
       hx-target="#results">

<div id="results">
  <!-- Server returns HTML fragments here -->
</div>
```

 

That's it. No JavaScript file. No build step. No state management. The server handles the search query, renders the results as HTML, and htmx swaps the `#results` div. The entire interaction is defined in HTML attributes.

---

## [](#where-htmx-wins-the-80-of-web-applications)Where htmx Wins: The 80% of Web Applications

Here's the uncomfortable truth that React advocates don't want to hear: most web applications are CRUD interfaces with forms, tables, filters, and navigation. They don't need a client-side application runtime. They need a server that renders HTML and a way to update parts of the page without reloading.

### [](#1-admin-dashboards-and-internal-tools)1\. Admin Dashboards and Internal Tools

The single biggest category where htmx dominates. An admin panel for managing users, orders, or content is fundamentally a collection of:

-   Tables with sorting, filtering, and pagination
-   Forms for creating and editing records
-   Modal dialogs for confirmations
-   Toast notifications for feedback

With htmx, each of these is a server round-trip that returns a HTML fragment:  

```
<!-- Sortable table header -->
<th hx-get="/users?sort=name&dir=asc" 
    hx-target="#user-table-body"
    hx-indicator="#loading">
  Name ↕
</th>

<!-- Delete with confirmation -->
<button hx-delete="/users/42" 
        hx-confirm="Delete this user?" 
        hx-target="closest tr" 
        hx-swap="outerHTML swap:500ms">
  Delete
</button>

<!-- Inline editing -->
<td hx-get="/users/42/edit-name" 
    hx-trigger="dblclick"
    hx-swap="innerHTML">
  John Doe
</td>
```

 

With React, the same functionality requires:  

```
// State management for sort
const [sortConfig, setSortConfig] = useState({ key: 'name', dir: 'asc' });

// Data fetching with TanStack Query
const { data, isLoading, refetch } = useQuery({
  queryKey: ['users', sortConfig, filters, page],
  queryFn: () => fetchUsers({ ...sortConfig, ...filters, page }),
});

// Delete mutation with optimistic update
const deleteMutation = useMutation({
  mutationFn: deleteUser,
  onMutate: async (userId) => {
    await queryClient.cancelQueries(['users']);
    const previous = queryClient.getQueryData(['users']);
    queryClient.setQueryData(['users'], (old) => 
      old.filter(u => u.id !== userId)
    );
    return { previous };
  },
  onError: (err, userId, context) => {
    queryClient.setQueryData(['users'], context.previous);
  },
  onSettled: () => queryClient.invalidateQueries(['users']),
});

// Confirmation dialog state
const [deleteTarget, setDeleteTarget] = useState(null);
const [showConfirm, setShowConfirm] = useState(false);
```

 

The htmx version is 8 lines of HTML attributes. The React version is 25+ lines of JavaScript before you even touch the JSX. And the React version has more failure modes: stale cache, optimistic rollback bugs, race conditions between queries, and memory leaks from subscriptions.

### [](#2-multistep-forms-and-wizards)2\. Multi-Step Forms and Wizards

htmx handles partial form validation and multi-step flows naturally because the server controls the state:  

```
<!-- Step 1: Server validates and returns step 2 -->
<form hx-post="/onboarding/step-1" 
      hx-target="#wizard-container"
      hx-swap="innerHTML">
  <input name="email" type="email" required>
  <input name="company" required>
  <button type="submit">Next</button>
</form>
```

 

The server validates step 1, stores progress in the session, and returns the HTML for step 2. No client-side form state management. No Formik, no React Hook Form, no Zod schemas wired to client components.

### [](#3-contentheavy-sites-with-dynamic-sections)3\. Content-Heavy Sites with Dynamic Sections

Blog platforms, documentation sites, e-commerce product pages — anywhere the core content is server-rendered but you need dynamic interactions (add to cart, live search, comment sections).

htmx lets you keep server-side rendering for SEO while adding targeted interactivity:  

```
<!-- Add to cart without page reload -->
<button hx-post="/cart/add" 
        hx-vals='{"productId": "abc123", "qty": 1}'
        hx-target="#cart-count"
        hx-swap="innerHTML">
  Add to Cart
</button>

<!-- Live comment section -->
<div hx-get="/posts/42/comments" 
     hx-trigger="load, every 30s"
     hx-swap="innerHTML">
  <!-- Comments load here -->
</div>
```

 

### [](#the-performance-argument)The Performance Argument

For server-driven applications, htmx wins on every performance metric that matters:

| Metric | htmx | React SPA |
| --- | --- | --- |
| JavaScript bundle | ~14 KB (htmx itself) | 150-400 KB (framework + app) |
| Time to Interactive | Near-instant (no hydration) | Delayed (hydration required) |
| INP score | Excellent (minimal JS execution) | Variable (depends on component tree) |
| Server load | Higher (renders HTML) | Lower (returns JSON) |
| CDN cacheability | Excellent (HTML fragments cache well) | Poor (dynamic JSON responses) |

The one area where React wins is server load. Rendering HTML server-side costs more CPU than serializing JSON. But in 2026, with edge computing and streaming HTML, this tradeoff increasingly favors htmx for most applications.

---

## [](#where-react-is-still-irreplaceable)Where React is Still Irreplaceable

Now for the other side. There are applications where htmx genuinely cannot compete, and pretending otherwise is dishonest.

### [](#1-rich-text-editors-and-complex-interactive-components)1\. Rich Text Editors and Complex Interactive Components

Building something like Notion, Google Docs, or a collaborative whiteboard requires managing complex local state at microsecond granularity. Every keystroke, cursor position, selection range, and formatting operation must be handled client-side. A server round-trip for each character typed would create unbearable latency.

React (or its peers like Svelte/Vue) provides:

-   Virtual DOM for efficient batch updates
-   Controlled component patterns for input management
-   Fine-grained re-rendering for performance
-   Integration with collaboration protocols (CRDTs, OT)

htmx can't do this. A 200ms round-trip to the server for every keystroke isn't viable. This is client-side application territory.

### [](#2-offlinefirst-applications)2\. Offline-First Applications

If your app needs to work without an internet connection — like a field service app, a mobile note-taking app, or a POS system — htmx is architecturally incompatible. htmx requires a server for every interaction. No server, no interaction.

React with a service worker, IndexedDB, and sync logic can handle days of offline operation and reconcile state when connectivity returns.

### [](#3-realtime-collaborative-features)3\. Real-Time Collaborative Features

Google Docs-style simultaneous editing, multiplayer games, collaborative design tools — anything where multiple users modify shared state at high frequency. These require:

-   Bidirectional WebSocket connections
-   Client-side conflict resolution
-   Optimistic local state updates
-   Complex undo/redo stacks

htmx's request-response model doesn't fit this pattern. You need a client application that maintains local state and synchronizes with peers.

### [](#4-highfrequency-ui-interactions)4\. High-Frequency UI Interactions

Drag-and-drop interfaces, interactive data visualizations (D3.js), animation-heavy UIs, canvas-based editors, and game-like interfaces require client-side frame-rate responsiveness. A server round-trip per drag frame isn't feasible.

### [](#the-decision-matrix)The Decision Matrix

| Use Case | htmx | React | Both |
| --- | --- | --- | --- |
| Admin dashboards | ✅ Best | ⚠️ Overkill | — |
| CRUD applications | ✅ Best | ⚠️ Overkill | — |
| Multi-step forms | ✅ Good | ✅ Good | — |
| E-commerce | ✅ Good | ✅ Good | ✅ Best |
| Content sites with interactions | ✅ Best | ⚠️ Overkill | — |
| Rich text editors | ❌ Can't | ✅ Required | — |
| Offline-first apps | ❌ Can't | ✅ Required | — |
| Real-time collaboration | ❌ Poor | ✅ Required | — |
| Data visualization dashboards | ⚠️ Limited | ✅ Best | ✅ Good |
| Drag-and-drop builders | ❌ Can't | ✅ Required | — |

---

## [](#the-use-both-pattern-islands-of-interactivity)The "Use Both" Pattern: Islands of Interactivity

The most pragmatic answer in 2026 is often "use both." The architecture is called **Islands of Interactivity** — htmx handles the page structure, navigation, and standard CRUD, while isolated React (or Preact/Svelte) components handle the complex interactive bits.

### [](#how-it-works)How It Works

```
<!-- htmx-driven page shell -->
<main>
  <!-- htmx handles navigation -->
  <nav hx-boost="true">
    <a href="/dashboard">Dashboard</a>
    <a href="/analytics">Analytics</a>
    <a href="/settings">Settings</a>
  </nav>

  <!-- htmx handles the table/CRUD -->
  <section hx-get="/dashboard/table" hx-trigger="load" hx-target="this">
    Loading...
  </section>

  <!-- React island for the interactive chart -->
  <div id="analytics-chart" 
       data-config='{"range": "30d", "metrics": ["revenue", "users"]}'>
  </div>

  <script type="module">
    import { renderChart } from './chart-island.js';
    renderChart(document.getElementById('analytics-chart'));
  </script>
</main>
```

 

This pattern gives you:

-   **Fast page loads** — no hydration for the page shell
-   **SEO-friendly** — server-rendered HTML throughout
-   **Rich interactions** — React for the chart, editor, or complex widget
-   **Simple state** — htmx manages 90% of the page, React manages 10%

Companies like GitHub have used this pattern for years — the bulk of GitHub is server-rendered HTML with targeted JavaScript for interactive components like the code editor, file tree, and Actions workflow builder.

---

## [](#migration-extracting-react-from-your-spa)Migration: Extracting React from Your SPA

If you're considering moving from a React SPA to htmx, don't do a Big Bang rewrite. Use the Strangler Fig pattern: replace pages one at a time, starting with the simplest ones.

### [](#step-1-identify-lowinteraction-pages)Step 1: Identify Low-Interaction Pages

Audit your React app. Find pages that are essentially:

-   Data tables with filters
-   Settings forms
-   Detail views
-   List/grid views

These are your migration candidates. They probably represent 60-80% of your page count but less than 20% of your interactive complexity.

### [](#step-2-serverside-routes)Step 2: Server-Side Routes

For each migration candidate, create a server-side route that returns full HTML:  

```
# Django example
def user_list(request):
    users = User.objects.filter(active=True)
    sort = request.GET.get('sort', 'name')

    if request.headers.get('HX-Request'):
        # htmx request: return just the table body
        return render(request, 'users/_table_body.html', {'users': users})

    # Full page request: return complete page
    return render(request, 'users/list.html', {'users': users})
```

 

The `HX-Request` header check is the key pattern. Same route, same logic, but htmx gets an HTML fragment while direct navigation gets the full page.

### [](#step-3-keep-react-where-it-matters)Step 3: Keep React Where It Matters

Don't migrate your interactive components. Keep the React rich text editor, the drag-and-drop kanban board, the real-time chat widget. Wrap them as self-contained islands that mount into server-rendered pages.

### [](#the-roi-of-migration)The ROI of Migration

Teams that have migrated CRUD-heavy React SPAs to htmx consistently report:

-   **40-60% reduction in frontend code** (measured in lines of JS/TS removed)
-   **Faster feature delivery** for standard CRUD screens (no client state management to wire up)
-   **Improved Core Web Vitals** (LCP and INP improvements from eliminated hydration)
-   **Simplified debugging** (server logs show the full story; no need to reproduce client state)

The tradeoff is increased server rendering load and slightly higher latency for interactions that were previously client-side. For internal tools and admin panels, this tradeoff is almost always worth it. For consumer-facing SPAs with complex interactions, it rarely is.

---

## [](#the-backend-factor-htmx-shines-with-certain-stacks)The Backend Factor: htmx Shines with Certain Stacks

One underappreciated aspect of htmx is how it unlocks backend teams. If your team is primarily Go, Python (Django/Flask), Ruby (Rails), Rust, PHP (Laravel), or Java (Spring) developers, htmx lets them build interactive web applications without learning React.

This isn't a "backend devs can't learn frontend" argument. It's a productivity argument. A Django developer can ship an interactive admin panel with htmx in a day. The same developer would need a week to set up Next.js, learn React patterns, configure TanStack Query, and wire up API routes.

### [](#htmx-backend-language-ecosystem)htmx + Backend Language Ecosystem

| Backend | htmx Integration | Template Engine | Production Examples |
| --- | --- | --- | --- |
| Go | Excellent (templ, standard library) | templ, html/template | Infrastructure dashboards |
| Python/Django | Excellent (django-htmx) | Django templates | Admin panels, CMS |
| Ruby/Rails | Excellent (Turbo + htmx) | ERB, Haml | SaaS admin interfaces |
| Rust/Axum | Growing (askama, maud) | askama, maud | High-performance dashboards |
| PHP/Laravel | Excellent (native Blade) | Blade | E-commerce admin, CRM |
| Java/Spring | Good (Thymeleaf) | Thymeleaf | Enterprise CRUD apps |

The common pattern: htmx adoption is highest in ecosystems where server-side rendering is already the default and adding client-side interactivity was previously the painful part.

---

## [](#common-htmx-mistakes-and-how-to-avoid-them)Common htmx Mistakes (And How to Avoid Them)

### [](#1-treating-htmx-like-a-clientside-framework)1\. Treating htmx Like a Client-Side Framework

The biggest mistake is managing state on the client. If you find yourself writing JavaScript to track which tab is active, which filters are applied, or which items are selected, you're fighting htmx's architecture.

**Wrong:**  

```
// Don't do this
let activeFilters = [];
document.querySelectorAll('.filter-checkbox').forEach(cb => {
  cb.addEventListener('change', () => {
    if (cb.checked) activeFilters.push(cb.value);
    else activeFilters = activeFilters.filter(f => f !== cb.value);
    htmx.ajax('GET', `/items?filters=${activeFilters.join(',')}`, '#results');
  });
});
```

 

**Right:**  

```
<!-- Let the server manage filter state -->
<form hx-get="/items" hx-target="#results" hx-trigger="change">
  <label><input type="checkbox" name="filter" value="active"> Active</label>
  <label><input type="checkbox" name="filter" value="premium"> Premium</label>
  <label><input type="checkbox" name="filter" value="new"> New</label>
</form>
```

 

The form serializes automatically. The server reads the filter parameters, queries the database, and returns HTML. No client-side state management needed.

### [](#2-making-too-many-requests)2\. Making Too Many Requests

htmx makes server requests easy, which can lead to chatty applications. Use `hx-trigger` modifiers to debounce and throttle:  

```
<!-- Debounce search input -->
<input hx-get="/search" 
       hx-trigger="input changed delay:300ms" 
       hx-target="#results"
       name="q">

<!-- Throttle scroll-based loading -->
<div hx-get="/feed/next" 
     hx-trigger="revealed throttle:500ms"
     hx-swap="afterend">
</div>
```

 

### [](#3-forgetting-about-loading-states)3\. Forgetting About Loading States

htmx provides the `hx-indicator` pattern for loading states. Use it consistently:  

```
<button hx-post="/process" hx-indicator="#spinner">
  Submit
  <img id="spinner" class="htmx-indicator" src="/spinner.svg">
</button>
```

 

```
.htmx-indicator { display: none; }
.htmx-request .htmx-indicator { display: inline; }
.htmx-request.htmx-indicator { display: inline; }
```

 

---

## [](#the-2026-reality-check)The 2026 Reality Check

The industry is converging on a pragmatic middle ground:

1.  **SPAs are not dead.** Complex, interactive applications still need client-side frameworks. React, Vue, and Svelte aren't going anywhere.
    
2.  **SPAs are overused.** Too many applications that are fundamentally server-driven CRUD were built as client-side SPAs because "that's how we do things now." htmx exposes this overengineering.
    
3.  **The best architecture is the one that matches your problem.** A Notion clone needs React. An admin dashboard needs htmx. A SaaS product might need both.
    
4.  **htmx is not "going back."** It's not PHP-era development. It's a modern approach that leverages HTTP semantics, modern browsers, and the fact that most interactions are request-response patterns. The server-rendering infrastructure of 2026 (edge functions, streaming HTML, CDN-cached fragments) makes this approach faster and more scalable than ever.
    
5.  **The JavaScript ecosystem fatigue is real.** htmx's growth isn't just about technical merit. It's about developers who are tired of maintaining 200MB `node_modules` directories, debugging webpack configurations, and learning a new state management library every six months.
    

Make the architectural choice based on what your application actually needs, not what Twitter says is cool. For most web applications, that means less JavaScript, not more.

---

> 💡 **Note:** This article was originally published on the [Pockit Blog](https://pockit.tools/blog/htmx-vs-react-2026-when-you-dont-need-spa/).
> 
> Check out [Pockit.tools](https://pockit.tools/json-formatter/) for 60+ free developer utilities. For faster access, **[add it to Chrome](https://chromewebstore.google.com/detail/pockit-developer-tools-pd/lojcamfhllebjmcjmipecgecbeopookg)** and use JSON Formatter & Diff Checker directly from your toolbar.
