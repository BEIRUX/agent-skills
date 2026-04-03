# SPA Detection Guide

## Table of Contents
- Quick Detection
- Framework Signatures
- Partial Hydration (Extractable)
- Full SPA (Not Extractable)
- Edge Cases

## Quick Detection

After fetching HTML with web_fetch, check the body content (excluding scripts):

```javascript
const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
const stripped = bodyMatch[1]
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<\/?[^>]+>/g, '')
  .trim();

if (stripped.length < 50) {
  // SPA shell — stop and notify user
}
```

## Framework Signatures

| Signature in HTML | Framework | Extractable? |
|---|---|---|
| `__NEXT_DATA__` with actual page content | Next.js SSR/SSG | YES — content is in the HTML |
| `<div id="__next"></div>` (empty) | Next.js CSR-only | NO |
| `__NUXT__` with content | Nuxt SSR/SSG | YES |
| `<div id="app"></div>` (empty) | Vue SPA | NO |
| `data-reactroot` with content | React SSR | YES |
| `<div id="root"></div>` (empty) | React SPA (CRA) | NO |
| `data-svelte` with content | SvelteKit SSR | YES |
| `data-wf-` attributes | Webflow | YES — always server-rendered |
| `wp-content` in paths | WordPress | YES — always server-rendered |

## Partial Hydration (Extractable)

These frameworks SSR their content — the HTML contains real markup:

- **Next.js with SSR/SSG** — Look for `__NEXT_DATA__` script tag containing page props. The HTML body has real content.
- **Nuxt with SSR/SSG** — Look for `__NUXT__` script. HTML has content.
- **Gatsby** — Static HTML with `data-reactroot`. Fully extractable.
- **Astro** — Static HTML, minimal JS. Fully extractable.
- **WordPress** — Always server-rendered. Fully extractable.
- **Webflow** — Always server-rendered. Fully extractable.

For these: proceed with normal extraction. The content is in the HTML.

## Full SPA (Not Extractable)

These serve an empty shell that JavaScript fills in:

- **Create React App** — `<div id="root"></div>` only
- **Vue CLI SPA** — `<div id="app"></div>` only
- **Angular** — `<app-root></app-root>` only
- **Ember** — Empty body with ember scripts

For these: STOP and tell the user:
> "This site renders all content with JavaScript — the HTML source is an empty shell. I need a Playwright-based approach to extract the rendered DOM."

## Edge Cases

### Lazy-loaded sections below the fold
Some SSR sites lazy-load below-the-fold sections via JavaScript. The HTML will have the header/hero but sections further down may be missing or contain placeholder elements. Check for:
- `data-lazy-section`, `data-load-on-scroll`
- Empty `<section>` or `<div>` tags with only a loading spinner
- JavaScript that fetches HTML fragments and injects them

Mitigation: Note which sections appear empty and inform the user.

### Client-side routing (multi-page sites)
If the URL is a subpage and the site uses client-side routing, web_fetch may return the same shell regardless of path. Check if the HTML content matches the expected page.

### Protected/gated content
Login walls, paywalls, and age gates will block content extraction. The HTML may contain the gate UI but not the actual page content. If you see login forms or "subscribe to view" messaging where content should be, inform the user.
