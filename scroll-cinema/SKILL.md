---
name: scroll-cinema
description: "Transforms a video into a premium scroll-driven animated website with canvas frame rendering, GSAP + Lenis choreography, and layered animation variety. Use when the user provides a product video and wants a cinematic scroll-based landing page — luxury, editorial, or brand showcase style. Triggers on 'scroll website', 'video landing page', 'product page from video', 'cinematic landing', 'scroll experience', or any request to build an animated website from a video file."
---

# Scroll Cinema

Turn a video file into a scroll-driven animated website — canvas frame rendering, choreographed section animations, and premium visual pacing.

## Pipeline

```
Video → FFmpeg Analysis → Smart Extraction → Image Sequence → Canvas + GSAP Scroll Logic
```

**Why canvas over `<video>`?** Videos cannot be scrubbed frame-accurately — `video.currentTime` is unreliable and browsers decode asynchronously. Canvas with pre-loaded Image objects gives instant, pixel-perfect frame switching.

### Frame Extraction

Run the bundled script:

```bash
bash "BASE_DIR/scripts/extract-frames.sh" "<video-path>" "<output-dir>" [target-frames]
```

The script handles: video analysis, motion interpolation when source has too few frames (<120), WebP/JPEG format selection, and reports the `TOTAL_FRAMES` constant for JS. Default target: 150 frames (120-200 is the sweet spot for smoothness vs. file size).

If the script isn't available, extract manually with ffprobe analysis → `minterpolate` for short videos → `ffmpeg -vf "fps=N,scale=W:-1" -q:v 2` for JPEG output.

## Architecture

### Scaffold

```
project/
  index.html          ← structure, sections, CDN scripts
  css/style.css       ← theming, layout, typography, responsive
  js/app.js           ← Lenis, canvas, scroll bindings, animations
  frames/frame_0001.jpg ...
```

No bundler. Vanilla HTML/CSS/JS + CDN libraries.

### DOM Order & Z-Index Map

```
z-index │ position │ element
────────┼──────────┼─────────────────────────────────
9999    │ fixed    │ #loader (removed after load)
100     │ fixed    │ .site-header (fades in after hero)
10      │ relative │ .hero-standalone (scrolls away)
6       │ fixed    │ .section-stats (above other sections)
5       │ fixed    │ .scroll-section (content overlays)
4       │ fixed    │ #dark-overlay
3       │ fixed    │ .marquee-wrap
1       │ relative │ #scroll-container
 sticky │          │   .canvas-wrap > canvas
```

**Critical:** Content sections MUST be outside `#scroll-container` in the DOM. Fixed elements inside a positioned parent with z-index get trapped in its stacking context and can't layer above sibling elements.

### Layout Pattern

- **Hero** (100vh, relative, z:10): Scrolls naturally. Fades via its own ScrollTrigger. Circle-wipe on `.canvas-wrap` expands behind it as it leaves.
- **Canvas** (sticky inside scroll-container): Pins at viewport top. Frames update via a separate `requestAnimationFrame` loop — **never draw inside a scroll handler.**
- **Sections** (fixed, z:5): Always in viewport. Visibility toggled by main scroll progress via `data-enter`/`data-leave` percentages.
- **Scroll container** (800vh+, relative, z:1): Just height. Creates the scroll runway. Its height controls pacing.

### Two ScrollTriggers

| Trigger | Target | Purpose |
|---------|--------|---------|
| Hero | `#hero`, top→bottom | Fades hero, expands circle-wipe clip-path on canvas |
| Main | `#scroll-container`, top→bottom | Drives frame playback, section visibility, marquee, overlay, counters |

## Quality Checklist

1. **Lenis smooth scroll** — native scroll feels "web page," Lenis feels "experience"
2. **4+ animation types** — never repeat the same entrance type consecutively
3. **Staggered reveals** — label → heading → body → CTA, never all at once
4. **Side-aligned text only** — outer 40% zones. Exception: stats with dark overlay
5. **Circle-wipe hero reveal** — hero standalone, canvas reveals via `clip-path: circle()`
6. **Counter animations** — all numbers count up from 0, never static
7. **Horizontal marquee** — at least one oversized sliding text element (12vw+)
8. **Dark overlay for stats** — 0.88-0.92 opacity, center-aligned text OK here only
9. **CTA persists** — `data-persist="true"`, stays visible once animated in
10. **800vh+ scroll height** — below this, 6 sections feel rushed
11. **Frame speed 1.8-2.2** — product animation completes by ~55% scroll
12. **IMAGE_SCALE 0.82-0.90** — padded cover mode, prevents header clipping
13. **Render separation** — scroll handler sets frame index only, rAF loop draws
14. **Full preload** — never remove loader until every frame is ready

## Section Timing

### Formula

For N sections across 800vh+, each section gets ~10-14% of scroll progress (75-105vh). Leave 2-4% gaps between `data-leave` and next `data-enter`.

Example for 6 sections:
```
Section 1:  enter 14  leave 24   slide-left    align-left
Section 2:  enter 28  leave 38   fade-up       align-right
Section 3:  enter 42  leave 52   slide-right   align-left
Stats:      enter 56  leave 66   stagger-up    centered
Section 5:  enter 70  leave 80   clip-reveal   align-right
CTA:        enter 86  leave 100  scale-up      align-left (persist)
```

Marquee: visible ~28-52%. Dark overlay: ~54-68% (matches stats ± 2%).

### Animation Types

| Type | From State | Ease |
|------|-----------|------|
| `slide-left` | x:-80, opacity:0 | power3.out |
| `slide-right` | x:80, opacity:0 | power3.out |
| `fade-up` | y:50, opacity:0 | power3.out |
| `scale-up` | scale:0.85, opacity:0 | power2.out |
| `stagger-up` | y:60, opacity:0 | power3.out |
| `clip-reveal` | clipPath:inset(100% 0 0 0) | power4.inOut |
| `rotate-in` | y:40, rotation:3, opacity:0 | power3.out |

All stagger children at 0.10-0.15s.

## Theming

All visual identity through CSS custom properties:

```css
:root {
  --bg: #000000;
  --text-primary: #f0ede8;
  --text-secondary: #8a8580;
  --text-tertiary: #5a5550;
  --font-display: 'Cormorant Garamond', serif;
  --font-body: 'Inter', sans-serif;
}
```

**Dark luxury**: Black bg, warm cream text, serif display. Default for product/fashion.
**Light editorial**: `--bg: #f5f3f0`, `--text-primary: #1a1a1a`, sans display font. Add `background: rgba(bg, 0.75)` to mobile `.section-inner`.
**Brand-color**: Swap variables to match client palette.

## Anti-Patterns

- Drawing inside scroll handler → jank. Always separate to rAF.
- Lazy-loading frames on scroll → blank flashes. Preload all upfront.
- IMAGE_SCALE 1.0 → clips into header. Use 0.82-0.90.
- Same animation on consecutive sections → monotonous.
- Centered text over canvas without dark overlay → unreadable.
- Scroll height < 800vh for 6 sections → rushed.
- FRAME_SPEED < 1.8 → sluggish product animation.
- Removing loader before all frames ready → white flashes.

## Implementation Details

Full HTML structure, CSS patterns, and JS code blocks: see [references/implementation.md](references/implementation.md)

Required CDN scripts (end of body, this order):
```html
<script src="https://cdn.jsdelivr.net/npm/lenis@1/dist/lenis.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
<script src="js/app.js"></script>
```

## Testing

Serve via HTTP (`npx serve .` or `python -m http.server`). Frames require HTTP, not `file://`.

Verify: smooth scroll works, frames sync to scroll position, each section has a different animation type, staggered child reveals, marquee slides horizontally, counters animate up, dark overlay fades for stats, CTA persists at end of scroll, mobile layout collapses to centered text with backdrop blur.
