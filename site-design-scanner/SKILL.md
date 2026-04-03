---
name: site-design-scanner
description: "Comprehensive website design analysis using Playwright MCP. Scans any URL to produce a full report covering tech stack, design tokens, layout, scroll animations, text effects, cursor interactions, media, loading sequences, navigation, micro-interactions, color transitions, performance, accessibility, responsive behavior, page transitions, and sound. Use when the user says 'scan this site', 'analyze this website', 'reverse engineer this design', gives a URL to study, or wants to replicate a website's design and animations."
---

# Site Design Scanner

Analyze any website's design, animations, interactions, and technical implementation using Playwright MCP.

**Required**: Playwright MCP must be connected. If not available, stop and tell the user.

## Analysis Pipeline

Execute all 15 phases in order. Never skip a phase.

### Phase 1: Navigate & Detect Tech Stack

1. Navigate to the URL with `browser_navigate`. Wait for full load with `browser_wait_for` (3-5 seconds).
2. Take an initial screenshot.
3. Read and evaluate `scripts/detect-tech-stack.js` via `browser_evaluate`. Record results.

### Phase 2: Extract Design Tokens

1. Evaluate `scripts/extract-design-tokens.js` via `browser_evaluate`.
2. Record all colors (with hex), typography scale, spacing system, border radius, shadows, container widths, z-index layers, breakpoints.

### Phase 3: Analyze Layout

1. Evaluate `scripts/analyze-layout.js` via `browser_evaluate`.
2. Record section structure, grid/flex usage, container pattern, nav structure, footer layout.

### Phase 4: Scroll Animation Map (Most Important Phase)

This phase produces the most valuable output. Execute the 3-pass scroll strategy:

**Pass 1 — Visual Storyboard**
Scroll from top to bottom in ~700px jumps. Take a screenshot at each stop (5-10 total). This gives visual overview of the full page.

**Pass 2 — Style Diffing**
1. Scroll to top.
2. At each 150px scroll increment, evaluate `scripts/scroll-diff-detector.js`.
3. Compare each result with the previous — log elements whose computed styles CHANGED between positions.
4. For each changed element record: selector, which properties changed, from→to values, scroll position.

**Pass 3 — Targeted Capture**
At every scroll position where Pass 2 detected changes, take a screenshot. Check for `<video>` elements in view.

Classify each detected animation using `references/animation-patterns.md`:
- `opacity` 0→1 = fade-in reveal
- `transform translateY` change = slide-up/down reveal
- `transform scale` change = scale animation
- `clip-path` change = mask/reveal animation
- `position: sticky/fixed` persisting across >1vh scroll = pinned section
- `background-color` changing between sections = section color transition
- Horizontal `translateX` in `overflow: hidden` parent = horizontal scroll section

### Phase 5: Text Animations

Evaluate `scripts/detect-text-animations.js`. Record split text, reveals, counters, gradient text, typewriter effects.

### Phase 6: Cursor & Mouse Interactions

1. Evaluate `scripts/detect-cursor-interactions.js`.
2. Use `browser_hover` on 3-5 interactive elements (buttons, links, cards). Screenshot before and after each hover to capture hover effects.

### Phase 7: Media Analysis

1. Evaluate `scripts/analyze-media.js`.
2. For each `<video>` found with a downloadable src, note the URL for FFMPEG keyframe extraction:
   ```
   ffmpeg -i <video_url> -vf "select=eq(pict_type\,I)" -frames:v 5 -vsync vfn frame_%d.png
   ```
3. Record all images (format, lazy loading), SVGs (animated?), canvas (WebGL?), iframes (Spline? YouTube?), Lottie players, background media.

### Phase 8: Loading Sequence

1. Evaluate `scripts/detect-loading-sequence.js`.
2. Record preloader elements, entrance animations, high-z overlays.
3. Note: For best results, screenshots at 0s/1s/3s should be taken during initial navigation (Phase 1). If the page has already loaded, note what the script detects about preloader remnants.

### Phase 9: Navigation Deep-Dive

1. Screenshot the nav at scroll position 0.
2. Scroll to 500px, screenshot again — compare backgrounds, height, blur, shadow.
3. Evaluate `scripts/analyze-nav.js`.
4. If a hamburger is detected, click it with `browser_click` and screenshot the open menu state.

### Phase 10: Micro-Interactions

1. Evaluate `scripts/detect-micro-interactions.js`.
2. Hover over 3-5 buttons with `browser_hover`, screenshot before/after.
3. If form inputs exist, click into one with `browser_click`, screenshot the focus state.
4. Hover over 2-3 cards if present.

### Phase 11: Color & Background Transitions

1. Evaluate `scripts/detect-color-transitions.js`.
2. Record section-by-section background changes, blend modes, animated gradients, noise overlays, CSS custom properties.

### Phase 12: Performance & Accessibility & SEO

Evaluate `scripts/analyze-performance.js`. Record all findings.

### Phase 13: Page Transitions (SPA only)

1. Evaluate `scripts/detect-page-transitions.js`.
2. If the site is a SPA with internal links, click one link with `browser_click` and screenshot during transition.
3. If not a SPA, skip the click and note "static site — no SPA transitions."

### Phase 14: Responsive Behavior

For each breakpoint (375px mobile, 768px tablet, 1440px desktop):
1. Resize viewport with `browser_resize`.
2. Evaluate `scripts/analyze-responsive.js`.
3. Take a screenshot.
4. Compare results across breakpoints.

### Phase 15: Sound Detection

Evaluate `scripts/detect-sound.js`. Record any audio elements, libraries, or Web Audio API usage.

## Output

Save all output in a folder named after the domain in the current working directory (e.g., `example.com/`).

### Screenshots

Save in `{domain}/screenshots/` folder. Name them: `01-initial.png`, `02-scroll-700.png`, etc. Target 10-25 screenshots total.

### Report

Save as `{domain}/site-report.md` with this structure:

```markdown
# Site Analysis Report: [URL]
Scanned: [date]

## 1. Tech Stack
[Framework, CSS, animation libs, smooth scroll, 3D, CMS, hosting]

## 2. Design Tokens
### Colors
[All colors with hex, grouped by role (primary, secondary, accent, neutral, bg)]
### Typography
[Font families, size scale, weight usage]
### Spacing
[Base unit, spacing scale]
### Borders & Shadows
[Border radius values, shadow definitions]
### Breakpoints
[Responsive breakpoint values]

## 3. Layout
[Section-by-section breakdown with grid/flex usage, container widths]

## 4. Scroll Animation Map
| Element | Trigger (scroll Y) | Animation Type | From → To | Library |
|---------|-------------------|----------------|-----------|---------|
[EVERY animated element detected in Phase 4]

## 5. Navigation
[Nav type, scroll behavior changes, mobile menu pattern, blur/shadow]

## 6. Text Animations
[Split text, reveals, counters, typewriter effects]

## 7. Cursor & Mouse
[Custom cursor, followers, magnetic elements, parallax, hover effects observed]

## 8. Media
[Images with formats, videos with FFMPEG analysis, SVGs, Canvas/WebGL, Lottie, iframes]

## 9. Loading Sequence
[Preloader, entrance animation order, what appears when]

## 10. Micro-Interactions
[Button hovers, form focuses, card hovers, link underlines, tooltips — with before/after descriptions]

## 11. Color Transitions
[Background changes on scroll, gradients, blend modes, grain overlays, CSS variables]

## 12. Performance & Accessibility
[Lazy loading, GPU hints, font loading, ARIA, reduced motion, heading hierarchy, OG tags]

## 13. Responsive Behavior
[Layout changes at mobile/tablet/desktop, font size changes, hidden elements, animation differences]

## 14. Page Transitions
[SPA transition type if applicable, library used]

## 15. Sound
[Audio libraries, elements, Web Audio API usage]

## 16. Screenshot Index
[Numbered list referencing all screenshots taken]
```

## Rules

1. Execute every phase — do not skip even for simple-looking sites.
2. Only report what was actually detected — never guess.
3. Keep screenshot count to 10-25 total.
4. The scroll animation map (Section 4) is the most valuable output — invest the most effort here.
5. FFMPEG is only for video files found on pages, not viewport recording.
6. All scripts are vanilla JS IIFEs — read them before evaluating to understand output shape.
7. If a script errors in the browser, debug it before continuing to the next phase.
8. For scroll diffing, use 150px increments (not 50px) to keep performance reasonable.
9. When comparing scroll-diff results, focus on elements that changed `transform`, `opacity`, `clip-path`, or `background-color`.
