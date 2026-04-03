# CSS Extraction Fallbacks

## Table of Contents
- Stylesheet 404 Fallback Paths
- Minified/Concatenated CSS
- Critical CSS vs Full CSS
- Background Image Extraction from CSS
- Common CSS Framework Detection

## Stylesheet 404 Fallback Paths

When a linked stylesheet returns 404, try these framework-specific alternates:

### WordPress
```
# Original failed — try these:
/wp-content/cache/autoptimize/css/*.css
/wp-content/themes/{theme-name}/style.css
/wp-content/themes/{theme-name}/assets/css/main.css
/wp-content/themes/{theme-name}/dist/css/app.css
```
To find the active theme name, look for it in any wp-content path in the HTML.

### Next.js
```
# CSS is embedded in _next/static/css/
/_next/static/css/*.css
# Or check the __NEXT_DATA__ for buildId, then:
/_next/static/{buildId}/_buildManifest.js
```

### Webflow
Webflow typically inlines all CSS in `<style>` tags. If no external stylesheet is found, all styling should be in the inline styles already captured by `parse-html.js`.

### Generic sites
```
/css/style.css
/css/main.css
/assets/css/style.css
/assets/css/main.css
/dist/css/app.css
/build/css/style.css
```

## Minified/Concatenated CSS

When CSS is heavily minified into a single file:

1. The combined file may be very large (500KB+) — save to disk immediately, don't hold in context
2. Use `parse-css.js` which handles this automatically
3. Key tokens to extract: `@font-face`, `@keyframes`, CSS variables, breakpoints, colors

## Critical CSS vs Full CSS

Some sites inline critical CSS in `<style>` tags and lazy-load the rest:

```html
<link rel="preload" href="full.css" as="style" onload="this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="full.css"></noscript>
```

Check for:
- `<link rel="preload" ... as="style">` — the href is the full CSS file
- `<noscript>` blocks containing stylesheet links
- `loadCSS` or `cssrelpreload` patterns in inline scripts

Always fetch BOTH the inline critical CSS AND any preloaded/deferred stylesheets.

## Background Image Extraction from CSS

Images referenced only in CSS (not in HTML) need separate extraction:

```javascript
// Run after parse-css.js to get additional image URLs from CSS
const css = fs.readFileSync('extraction/combined.css', 'utf8');
const bgImages = new Set();
const bgRegex = /background(?:-image)?\s*:[^;]*url\(["']?([^"')]+)["']?\)/gi;
let match;
while ((match = bgRegex.exec(css)) !== null) {
  if (!match[1].startsWith('data:')) bgImages.add(match[1]);
}
```

CSS image URLs are relative to the CSS file's location. Resolve accordingly.

## Common CSS Framework Detection

Detect CSS frameworks to understand the grid/layout system:

| Pattern in CSS | Framework |
|---|---|
| `.container`, `.row`, `.col-` | Bootstrap |
| `.flex`, `.grid`, `.w-1/2` | Tailwind CSS |
| `.ui.grid`, `.ui.container` | Semantic UI |
| `.columns`, `.column`, `.is-` | Bulma |
| `.mdc-` | Material Design Components |
| `.v-application` | Vuetify |
| `.MuiGrid`, `.MuiBox` | Material UI (React) |
| `.chakra-` | Chakra UI |
| `.ant-` | Ant Design |

When a CSS framework is detected:
- Don't try to replicate the framework's utility classes from scratch
- Instead, include the framework's CDN link in the rebuilt project
- Only extract custom/override styles on top of the framework
