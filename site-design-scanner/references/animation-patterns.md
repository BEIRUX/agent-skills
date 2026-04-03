# Animation Pattern Reference

Known animation patterns and how to identify them from computed styles.

## Scroll-Triggered Reveals

| Pattern | Detection | Typical Library |
|---------|-----------|-----------------|
| Fade in | `opacity: 0` → `1` on scroll | GSAP ScrollTrigger, AOS, CSS IntersectionObserver |
| Slide up | `transform: translateY(50-100px)` → `translateY(0)` | GSAP, Framer Motion |
| Slide in from left/right | `translateX(±100px)` → `translateX(0)` | GSAP, CSS |
| Scale up | `scale(0.8-0.95)` → `scale(1)` | GSAP, Framer Motion |
| Clip reveal | `clip-path: inset(100% 0 0 0)` → `inset(0)` | GSAP, CSS |
| Mask wipe | `clip-path: polygon()` changing | GSAP |
| Blur in | `filter: blur(10px)` → `blur(0)` | CSS, GSAP |

## Scroll-Pinned Sections

| Pattern | Detection |
|---------|-----------|
| Pinned scrub | Element stays `position: fixed` while scroll changes by >1vh. Content inside transforms. |
| Horizontal scroll | Parent `overflow: hidden`, child wider than parent, child `translateX` changes on scroll |
| Scroll-within-scroll | Parent `overflow: hidden` + child taller than parent |
| Parallax layers | Multiple elements at same scroll position with different `translateY` rates |

## Text Animations

| Pattern | Detection |
|---------|-----------|
| Character split | Heading/paragraph with individual `<span>` per character, classes like `.char` |
| Word split | Words wrapped in `<span>`, classes like `.word`, `.line` |
| Text reveal | Parent `overflow: hidden` + child `translateY(100%)` animating to `0` |
| Gradient text | `background-clip: text` + gradient `background-image` |
| Typewriter | Text length or `width` changing, blinking cursor pseudo-element |
| Counter/ticker | Number elements incrementing, classes like `.counter`, `.stat` |

## Navigation Patterns

| Pattern | Detection |
|---------|-----------|
| Transparent → solid | Nav `backgroundColor` changes between scroll 0 and scroll 200+ |
| Shrink on scroll | Nav `height` decreases after scroll |
| Blur backdrop | `backdrop-filter: blur()` on nav |
| Hide on scroll down | Nav `translateY(-100%)` when scrolling down, `0` when scrolling up |
| Full-screen menu | Menu overlay with `position: fixed`, `inset: 0`, high `z-index` |

## Cursor Effects

| Pattern | Detection |
|---------|-----------|
| Custom cursor | `body { cursor: none }` + small fixed-position element |
| Cursor follower | Fixed element <60px with `pointer-events: none`, follows mouse |
| Magnetic buttons | Buttons with `transition` on `transform`, react to mouse proximity |
| Cursor scale on hover | Cursor element changes `width`/`height` when hovering interactive elements |
| Blend mode cursor | Cursor element with `mix-blend-mode: difference` or `exclusion` |

## Background Transitions

| Pattern | Detection |
|---------|-----------|
| Section color shift | Adjacent sections have different `backgroundColor` |
| Scroll-linked gradient | Body/wrapper `backgroundColor` changes at different scroll positions |
| Animated gradient | `background-size` > element size + `animation` on `background-position` |
| Noise/grain | Fixed element with repeating small `background-image`, low `opacity`, `pointer-events: none` |
| Blend overlay | Element with `mix-blend-mode` other than `normal` |

## Micro-Interactions

| Pattern | Detection |
|---------|-----------|
| Button lift | Hover adds `translateY(-2 to -4px)` + increased `box-shadow` |
| Button fill | Background color/gradient change on hover via `transition` |
| Ripple effect | Pseudo-element or child that scales from click point |
| Icon slide | Icon inside button with `translateX` on hover |
| Underline draw | Link with `background-image` gradient that changes `background-size` on hover |
| Card tilt | Card with `transform: perspective()` + `rotateX/Y` on mouse position |
| Image zoom | Image inside `overflow: hidden` container, `scale(1.05-1.1)` on hover |

## Performance Markers

| Signal | Meaning |
|--------|---------|
| `will-change: transform` | GPU-accelerated transforms expected |
| `transform: translateZ(0)` | Force GPU compositing layer |
| `loading="lazy"` on images | Deferred image loading |
| `font-display: swap` | Font loads without blocking render |
| WebP/AVIF images | Modern optimized formats |
| `prefers-reduced-motion` in CSS | Accessibility-aware animations |
