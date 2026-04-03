---
name: site-replicator
description: Reverse-engineer any website from a URL and rebuild it as a working local Vite project. Fetches page source, parses HTML/CSS/JS, downloads all assets (images, fonts, videos, SVGs), extracts design tokens and animation patterns, and outputs a fully functional project runnable with npm run dev. Uses web_fetch, curl, and Node.js parsing — no Playwright or browser automation. Use when the user provides a URL and wants to clone/replicate/rebuild a website locally, says "replicate this site", "clone this website", "rebuild this page", or wants a local working copy of a live website.
---

# Site Replicator

Reverse-engineer any website into a working local Vite project using only web_fetch, curl, and Node.js parsing.

## Tools Required

- **web_fetch** — fetch HTML source and CSS files
- **curl** — download assets (images, fonts, videos)
- **bash** — file operations, parallel downloads
- **Node.js** — parser scripts (cheerio)

## Pipeline Overview

Execute these phases IN ORDER. Run the bundled scripts from the skill directory.

| Phase | Action | Script |
|-------|--------|--------|
| 0 | Fetch HTML & detect tech stack | `scripts/parse-html.js` |
| 1 | Extract page structure & content | `scripts/extract-content.js` |
| 2 | Extract CSS system (fonts, keyframes, colors, breakpoints) | `scripts/parse-css.js` |
| 3 | Download all assets (images, videos, fonts) | `scripts/extract-image-urls.js`, `scripts/extract-video-urls.js` |
| 4 | Build the HTML | Manual — copy sections, update asset paths |
| 5 | Build the CSS | Manual — assemble from extracted tokens |
| 6 | Build the JavaScript | Manual — animations, scroll triggers, interactions |
| 7 | Test & fix | `scripts/verify-build.sh` |

## Phase 0: Fetch & Detect Tech Stack

1. Use `web_fetch` on the target URL to get the full HTML source
2. Save the raw HTML to `extraction/raw.html`
3. **SPA check**: If the HTML body contains only `<div id="root">`, `<div id="app">`, or `<div id="__next">` with no visible content, STOP and tell the user: *"This site renders content with JavaScript. The HTML is an empty shell — I need a Playwright-based skill to extract it properly."* See `references/spa-detection.md` for details.
4. Run `scripts/parse-html.js` to extract stylesheet URLs, script URLs, inline styles, framework detection, and animation library detection
5. Initialize a Vite project:

```bash
npm create vite@latest project-name -- --template vanilla && cd project-name && npm install
mkdir -p extraction/{css,js} src/assets/{images,videos,fonts,svg} scripts
```

## Phase 1: Extract Page Structure & Content

1. Install cheerio: `npm install cheerio --save-dev`
2. Copy `scripts/extract-content.js` into the project's `scripts/` directory
3. Run: `node scripts/extract-content.js`
4. Outputs: `extraction/sections.json`, `extraction/svgs.json`, `extraction/nav.json`, `extraction/animations.json`

## Phase 2: Extract CSS System

### 2.1 — Fetch all stylesheets

Read `extraction/tech-stack.json` for stylesheet URLs. Fetch each one with curl:

```bash
mkdir -p extraction/css
while IFS= read -r url; do
  filename=$(echo "$url" | sed 's/[^a-zA-Z0-9]/_/g' | tail -c 100)
  curl -sL "$url" -o "extraction/css/${filename}.css"
done < extraction/stylesheet-urls.txt
```

If URLs 404, see `references/css-extraction-fallbacks.md` for framework-specific fallback paths.

### 2.2 — Parse the CSS

Run `scripts/parse-css.js` to extract:
- `@font-face` declarations and font URLs
- `@keyframes` animations
- Color palette (hex + rgba)
- Breakpoints from `@media` queries
- Animation class definitions

Outputs: `extraction/design-tokens.json`, `extraction/combined.css`, `extraction/animation-classes.css`

## Phase 3: Download Assets

### 3.1 — Images

Run: `node scripts/extract-image-urls.js <base-url>`

Then download in parallel:
```bash
cat extraction/image-urls.txt | xargs -P 8 -I {} bash -c 'curl -sL "{}" -o "src/assets/images/$(basename "{}" | sed "s/?.*//")"'
```

### 3.2 — Videos

Run: `node scripts/extract-video-urls.js <base-url>`

Then download: `cat extraction/video-urls.txt | xargs -P 4 -I {} bash -c 'curl -sL "{}" -o "src/assets/videos/$(basename "{}" | sed "s/?.*//")"'`

### 3.3 — Fonts

Extract font URLs from `extraction/design-tokens.json` and download. If relative URLs, resolve against the stylesheet's base URL. See `references/common-font-paths.md` for framework-specific font path patterns.

```bash
cat extraction/design-tokens.json | node -e "
  const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
  (d.fontUrls||[]).forEach(u=>console.log(u));
" | xargs -P 4 -I {} bash -c 'curl -sL "{}" -o "src/assets/fonts/$(basename "{}" | sed "s/?.*//")"'
```

If fonts 404, log to `extraction/failed-downloads.txt` and find the closest Google Font match.

## Phase 4: Build the HTML

Since you have the raw HTML, copy section markup nearly verbatim from `extraction/raw.html`, updating asset paths:

```bash
node -e "
const fs=require('fs');
let html=fs.readFileSync('extraction/raw.html','utf8');
html=html.replace(/https?:\/\/[^\"']+\/([\w.-]+\.(png|jpg|jpeg|gif|svg|webp))/gi,'./assets/images/\$1');
html=html.replace(/https?:\/\/[^\"']+\/([\w.-]+\.(mp4|webm|ogg))/gi,'./assets/videos/\$1');
fs.writeFileSync('index.html',html);
"
```

Then clean up:
- Remove CMS junk: admin bars, plugin divs, comment forms, nonce fields, wp-emoji scripts
- Remove tracking scripts (gtm, analytics, recaptcha, fbevents)
- Remove CDN prefetch/preconnect links
- Keep ALL original class names exactly
- Insert extracted SVG markup directly for logos (from `extraction/svgs.json`)
- Duplicate ticker/carousel items for seamless infinite scroll
- Include ALL text content — no placeholders

## Phase 5: Build the CSS

Source from `extraction/combined.css` and `extraction/design-tokens.json`:

1. Write `@font-face` declarations pointing to `./assets/fonts/`
2. Copy keyframe animations from `extraction/animation-classes.css`
3. Extract component styles matching class names found in the HTML
4. Include all responsive breakpoints
5. Include transition/hover styles
6. Strip irrelevant styles (WP admin, plugin CSS, print styles)

Since you have the full CSS, extract and include large chunks directly rather than rewriting.

## Phase 6: Build the JavaScript

Implement these behaviors:

1. **Scroll-triggered animations** — IntersectionObserver for `.wow` / `[data-aos]` elements
2. **Text reveal** — staggered letter/word animations
3. **Counter animations** — requestAnimationFrame counting up to `data-target` values
4. **Carousel/ticker** — pause-on-hover, content duplication for seamless loops
5. **Header scroll** — background solidification, blur on scroll
6. **Hamburger menu** — toggle mobile nav overlay

To extract animation configs from original JS:

```bash
# Download non-tracking JS files
cat extraction/tech-stack.json | node -e "
  const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
  d.scripts.filter(s=>!/gtm|analytics|recaptcha/.test(s)).forEach(u=>console.log(u));
" | xargs -P 4 -I {} bash -c 'curl -sL "{}" -o "extraction/js/$(basename "{}" | sed "s/?.*//")"'

# Scan for configs
grep -r 'new WOW\|ScrollTrigger\|AOS.init\|slick\|swiper\|Splide' extraction/js/
```

Use these configs to replicate exact animation parameters.

## Phase 7: Test & Fix

Run `scripts/verify-build.sh` to check for broken asset references, then:

```bash
npm run dev
```

Tell the user to open localhost in their browser and visually verify. List any known issues (failed asset downloads, missing fonts, etc.).

## Limitations

Be transparent about these — they stem from not having a browser:

| Limitation | Mitigation |
|------------|------------|
| SPA shell (JS-rendered DOM) | Detect early in Phase 0 — STOP if empty shell |
| Lazy-loaded images (JS injection) | Check `data-src`, `data-bg`, `data-lazy`, `data-background`, `data-srcset` |
| Computed/runtime styles | Download and scan JS files for inline style applications |
| Animation timing | Parse `@keyframes`, transitions from CSS; grep GSAP/WOW/AOS configs from JS |
| Scroll-triggered behavior | Parse ScrollTrigger configs, WOW offsets, AOS settings from JS source |

## Output File Structure

```
project-name/
├── index.html
├── package.json
├── vite.config.js
├── scripts/              # Parser scripts (deletable after extraction)
├── src/
│   ├── style.css
│   ├── main.js
│   └── assets/
│       ├── images/
│       ├── videos/
│       ├── fonts/
│       └── svg/
└── extraction/           # Raw extraction data (keep for reference)
    ├── raw.html
    ├── tech-stack.json
    ├── sections.json
    ├── design-tokens.json
    ├── combined.css
    ├── animation-classes.css
    ├── animations.json
    ├── svgs.json
    ├── nav.json
    ├── image-urls.txt
    ├── video-urls.txt
    ├── css/
    ├── js/
    └── failed-downloads.txt
```

## Rules

1. **Never guess.** Parse and extract. Every piece comes from actual source.
2. **Download real assets.** No placeholders unless originals are inaccessible (log failures to `failed-downloads.txt`).
3. **Match class names exactly.** Copy from parsed HTML.
4. **Write extraction data to disk immediately.** Don't hold large files in context.
5. **Detect SPA shells early.** Stop if web_fetch returns an empty shell.
6. **Parallel downloads.** Use `xargs -P` for concurrent asset downloads.
7. **Strip CMS junk.** Admin bars, plugin divs, comment forms, wp-emoji, nonce fields.
8. **Graceful fallbacks.** Failed font → closest Google Font. Failed image → log it. 404'd CSS → try alternate paths.
