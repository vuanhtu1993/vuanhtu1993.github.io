---
title: "Google Antigravity Documentation"
source_url: "https://antigravity.google/docs/allowlist-denylist"
crawled_at: "2026-06-12T03:44:19.030Z"
---

-   side\_navigation
-   Antigravity IDE
\>-   Browser
\>-   Allowlist / Denylist

## Allowlist / Denylist

The browser uses a two-layer security system to control which URLs can be accessed:

-   **Denylist** - Deny dangerous/malicious URLs
-   **Allowlist** - Explicitly allow trusted URLs

## How It Works

### Denylist

The denylist is maintained and enforced using the Google Superroots’s BadUrlsChecker service (See documentation). When the browser attempts to navigate to a URL, the hostname is checked against the server-side denylist via RPC.

**NOTE:** If the server is unavailable, access is denied by default.

### Allowlist

The allowlist is a local text file that you can edit to explicitly trust specific URLs.

![Allowlist](https://res.cloudinary.com/dv3vzmogk/image/upload/v1781235858/aha-mind/docs-crawler/antigravity.google/browser-allowlist_rqy5ym.png)

The allowlist is initialized with just localhost, and can be edited at anytime.

When the browser attempts to navigate to a non-allowlisted URL, it will prompt you with an “always allow” button, which if clicked will add the URL to the allowlist and enable the browser to open and interact with the web page. An example situation is shown below:

![Always Allow](https://res.cloudinary.com/dv3vzmogk/image/upload/v1781235858/aha-mind/docs-crawler/antigravity.google/always-allow-url_uqjo03.png)

You can also add/remove URLS from the allowlist manually. However, the denylist always takes precedence: you cannot allowlist a URL that appears on the denylist.
