# Implementation Reference

Complete code patterns for scroll-cinema sites. All code is production-ready — adapt variables, copy, and section count to each project.

## Table of Contents

1. [HTML Structure](#html-structure)
2. [CSS Patterns](#css-patterns)
3. [JS Patterns](#js-patterns)
4. [Mobile Responsive](#mobile-responsive)

---

## HTML Structure

### Full Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BRAND — Tagline</title>
  <meta name="description" content="Page description.">
  <meta name="theme-color" content="#000000">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DISPLAY_FONT&family=BODY_FONT&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

  <!-- Loader -->
  <div id="loader">
    <div class="loader-brand">BRAND</div>
    <div id="loader-bar"><div id="loader-fill"></div></div>
    <div id="loader-percent">0%</div>
  </div>

  <!-- Header (hidden during hero, fades in on scroll) -->
  <header class="site-header" id="header">
    <nav>
      <a href="#" class="header-logo">BRAND</a>
      <a href="#" class="header-link">Link</a>
    </nav>
  </header>

  <!-- Hero (standalone 100vh, scrolls away) -->
  <section class="hero-standalone" id="hero">
    <span class="section-label hero-label">Subtitle</span>
    <h1 class="hero-heading">
      <span class="hero-word">WORD</span>
      <span class="hero-word">WORD</span>
    </h1>
    <p class="hero-tagline">Tagline.</p>
    <div class="scroll-indicator" id="scroll-indicator">
      <span>Scroll</span>
      <svg width="12" height="18" viewBox="0 0 12 18" fill="none">
        <path d="M6 0V16M6 16L1 11M6 16L11 11" stroke="currentColor" stroke-width="1"/>
      </svg>
    </div>
  </section>

  <!-- Fixed overlays -->
  <div id="dark-overlay"></div>
  <div class="marquee-wrap" id="marquee" data-scroll-speed="-25">
    <div class="marquee-text">REPEAT TEXT — REPEAT TEXT — REPEAT TEXT —</div>
  </div>

  <!-- Content sections (fixed, toggled by JS) -->
  <!-- Each needs: data-enter, data-leave, data-animation -->
  <!-- Optional: data-persist="true" for CTA -->
  <!-- Classes: align-left OR align-right -->

  <section class="scroll-section section-content align-left"
           data-enter="14" data-leave="24" data-animation="slide-left">
    <div class="section-inner">
      <span class="section-label">001 — Category</span>
      <h2 class="section-heading">Heading</h2>
      <p class="section-body">Body text.</p>
    </div>
  </section>

  <!-- Stats section (centered, with dark overlay) -->
  <section class="scroll-section section-stats"
           data-enter="56" data-leave="66" data-animation="stagger-up">
    <div class="stats-grid">
      <div class="stat">
        <div class="stat-value">
          <span class="stat-number" data-value="36" data-decimals="0">0</span>
          <span class="stat-suffix">hrs</span>
        </div>
        <span class="stat-label">Label</span>
      </div>
      <!-- more .stat divs -->
    </div>
  </section>

  <!-- CTA section (persists) -->
  <section class="scroll-section section-content align-right"
           data-enter="86" data-leave="100" data-animation="scale-up" data-persist="true">
    <div class="section-inner">
      <span class="section-label">BRAND</span>
      <h2 class="section-heading cta-heading">Call to Action</h2>
      <a href="#" class="cta-button">Button Text</a>
    </div>
  </section>

  <!-- Scroll runway + sticky canvas -->
  <div id="scroll-container">
    <div class="canvas-wrap" id="canvas-wrap">
      <canvas id="canvas"></canvas>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/lenis@1/dist/lenis.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
```

---

## CSS Patterns

### Core Variables & Reset

```css
:root {
  --bg: #000000;
  --text-primary: #f0ede8;
  --text-secondary: #8a8580;
  --text-tertiary: #5a5550;
  --font-display: 'Cormorant Garamond', 'Georgia', serif;
  --font-body: 'Inter', -apple-system, sans-serif;
}

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html { -webkit-font-smoothing: antialiased; }
body { background: var(--bg); color: var(--text-primary); font-family: var(--font-body); overflow-x: hidden; }
a { color: inherit; text-decoration: none; }
```

### Loader

```css
#loader { position: fixed; inset: 0; z-index: 9999; background: var(--bg); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2rem; }
.loader-brand { font-family: var(--font-display); font-size: 1rem; font-weight: 400; letter-spacing: 0.35em; text-transform: uppercase; color: var(--text-secondary); }
#loader-bar { width: 160px; height: 1px; background: rgba(255,255,255,0.08); overflow: hidden; }
#loader-fill { width: 0%; height: 100%; background: var(--text-secondary); transition: width 0.3s ease; }
#loader-percent { font-family: var(--font-body); font-size: 0.7rem; font-weight: 300; letter-spacing: 0.15em; color: var(--text-tertiary); }
```

### Header

```css
.site-header { position: fixed; top: 0; left: 0; width: 100%; z-index: 100; padding: 1.5rem 4vw; opacity: 0; transition: opacity 0.4s ease; }
.site-header nav { display: flex; justify-content: space-between; align-items: center; }
.header-logo { font-family: var(--font-display); font-size: 0.75rem; font-weight: 500; letter-spacing: 0.3em; text-transform: uppercase; color: var(--text-secondary); }
.header-link { font-family: var(--font-body); font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--text-tertiary); transition: color 0.3s; }
.header-link:hover { color: var(--text-primary); }
```

### Hero

```css
.hero-standalone { position: relative; z-index: 10; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--bg); text-align: center; }
.hero-heading { font-family: var(--font-display); font-size: clamp(4.5rem, 13vw, 14rem); font-weight: 300; letter-spacing: 0.06em; line-height: 0.88; text-transform: uppercase; }
.hero-word { display: block; }
.hero-tagline { font-family: var(--font-display); font-size: clamp(1rem, 2vw, 1.5rem); font-weight: 300; font-style: italic; letter-spacing: 0.08em; color: var(--text-secondary); margin-top: 2rem; }
.scroll-indicator { position: absolute; bottom: 3rem; display: flex; flex-direction: column; align-items: center; gap: 0.6rem; color: var(--text-tertiary); animation: pulse-scroll 2.5s ease-in-out infinite; }
.scroll-indicator span { font-family: var(--font-body); font-size: 0.6rem; letter-spacing: 0.25em; text-transform: uppercase; }
@keyframes pulse-scroll { 0%,100% { opacity: 0.4; transform: translateY(0); } 50% { opacity: 0.8; transform: translateY(4px); } }
```

### Canvas & Scroll Container

```css
#scroll-container { position: relative; z-index: 1; height: 850vh; }
.canvas-wrap { position: sticky; top: 0; width: 100%; height: 100vh; overflow: hidden; clip-path: circle(0% at 50% 50%); }
.canvas-wrap canvas { display: block; width: 100%; height: 100%; }
```

### Content Sections

```css
.section-label { display: block; font-family: var(--font-body); font-size: 0.65rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--text-tertiary); margin-bottom: 1.5rem; }
.scroll-section { position: fixed; top: 0; left: 0; width: 100%; height: 100vh; display: flex; align-items: center; z-index: 5; opacity: 0; pointer-events: none; }
.section-inner { max-width: 480px; }
.section-heading { font-family: var(--font-display); font-size: clamp(2.5rem, 5vw, 4.5rem); font-weight: 300; line-height: 1.05; margin-bottom: 1.2rem; }
.section-body { font-family: var(--font-body); font-size: 0.95rem; font-weight: 300; line-height: 1.75; color: var(--text-secondary); }
.align-left { padding-left: 8vw; }
.align-right { justify-content: flex-end; padding-right: 8vw; }
```

### Stats

```css
.section-stats { justify-content: center; z-index: 6; }
.stats-grid { display: flex; gap: clamp(3rem, 8vw, 8rem); justify-content: center; }
.stat { text-align: center; }
.stat-value { display: flex; align-items: baseline; justify-content: center; gap: 0.15em; }
.stat-number { font-family: var(--font-display); font-size: clamp(3rem, 6vw, 5.5rem); font-weight: 300; }
.stat-suffix { font-family: var(--font-display); font-size: clamp(1.2rem, 2vw, 2rem); font-weight: 300; color: var(--text-secondary); }
.stat-label { display: block; font-family: var(--font-body); font-size: 0.6rem; letter-spacing: 0.25em; text-transform: uppercase; color: var(--text-tertiary); margin-top: 0.75rem; }
```

### Overlays & Marquee

```css
#dark-overlay { position: fixed; inset: 0; z-index: 4; background: var(--bg); opacity: 0; pointer-events: none; }
.marquee-wrap { position: fixed; top: 50%; left: 0; width: 100%; transform: translateY(-50%); z-index: 3; opacity: 0; pointer-events: none; }
.marquee-text { font-family: var(--font-display); font-size: clamp(6rem, 12vw, 14rem); font-weight: 300; white-space: nowrap; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-primary); opacity: 0.06; }
```

### CTA

```css
.cta-heading { margin-bottom: 2.5rem; }
.cta-button { display: inline-block; padding: 1rem 3.5rem; border: 1px solid rgba(255,255,255,0.18); font-family: var(--font-body); font-size: 0.7rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--text-primary); transition: all 0.5s cubic-bezier(0.25,0.46,0.45,0.94); }
.cta-button:hover { background: var(--text-primary); color: var(--bg); border-color: var(--text-primary); }
```

---

## JS Patterns

### Configuration

```js
const TOTAL_FRAMES = /* from extraction script */;
const FRAME_SPEED = 2.0;   // 1.8-2.2
const IMAGE_SCALE = 0.85;  // 0.82-0.90
const BATCH_SIZE = 20;
const FRAME_EXT = "jpg";   // or "webp"
```

### Lenis Smooth Scroll

```js
function initLenis() {
  var lenis = new Lenis({
    duration: 1.2,
    easing: function(t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    smoothWheel: true
  });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(function(time) { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);
}
```

### Frame Preloader

Two-phase: first 10 frames for instant first paint, then remaining in batches. Never remove loader until complete.

```js
var frames = new Array(TOTAL_FRAMES);

function loadFrame(index) {
  return new Promise(function(resolve) {
    var img = new Image();
    img.onload = function() { frames[index] = img; resolve(); };
    img.onerror = function() { resolve(); };
    img.src = "frames/frame_" + String(index + 1).padStart(4, "0") + "." + FRAME_EXT;
  });
}

async function preloadFrames() {
  await Promise.all(Array.from({ length: Math.min(10, TOTAL_FRAMES) }, function(_, i) { return loadFrame(i); }));
  drawFrame(0);
  for (var i = 10; i < TOTAL_FRAMES; i += BATCH_SIZE) {
    var batch = [];
    for (var j = i; j < Math.min(i + BATCH_SIZE, TOTAL_FRAMES); j++) batch.push(loadFrame(j));
    await Promise.all(batch);
    updateProgress(Math.min(i + BATCH_SIZE, TOTAL_FRAMES), TOTAL_FRAMES);
  }
  if (frames[0]) bgColor = sampleBgColor(frames[0]);
  hideLoader();
}
```

### Canvas Renderer (Padded Cover)

```js
var IMAGE_SCALE = 0.85;
var bgColor = "#000000";

function drawFrame(index) {
  var img = frames[index];
  if (!img) return;
  var cw = window.innerWidth, ch = window.innerHeight;
  var scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight) * IMAGE_SCALE;
  var dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  if (index % 20 === 0) bgColor = sampleBgColor(img);
}

function sampleBgColor(img) {
  var c = document.createElement("canvas");
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  var s = c.getContext("2d");
  s.drawImage(img, 0, 0);
  var px = s.getImageData(2, 2, 1, 1).data;
  return "rgb(" + px[0] + "," + px[1] + "," + px[2] + ")";
}

function resizeCanvas() {
  var dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  if (frames[currentFrame]) drawFrame(currentFrame);
}
```

### Frame-to-Scroll Binding (separated from rendering)

```js
var currentFrame = 0, drawnFrame = -1;

// Scroll: ONLY sets which frame to show
ScrollTrigger.create({
  trigger: "#scroll-container", start: "top top", end: "bottom bottom", scrub: true,
  onUpdate: function(self) {
    var accelerated = Math.min(self.progress * FRAME_SPEED, 1);
    currentFrame = Math.min(Math.floor(accelerated * TOTAL_FRAMES), TOTAL_FRAMES - 1);
    header.style.opacity = Math.min(1, self.progress * 8);
  }
});

// rAF: ONLY draws when frame changed
function tick() {
  if (currentFrame !== drawnFrame) { drawFrame(currentFrame); drawnFrame = currentFrame; }
  requestAnimationFrame(tick);
}
tick();
```

### Hero Circle-Wipe Transition

```js
ScrollTrigger.create({
  trigger: "#hero", start: "top top", end: "bottom top", scrub: true,
  onUpdate: function(self) {
    var p = self.progress;
    heroSection.style.opacity = 1 - p;
    scrollIndicator.style.opacity = Math.max(0, 1 - p * 3);
    var radius = p * 120;
    canvasWrap.style.clipPath = radius >= 118 ? "none" : "circle(" + radius + "% at 50% 50%)";
  }
});
```

### Section Animation System

```js
function setupSectionAnimation(section) {
  var type = section.dataset.animation;
  var persist = section.dataset.persist === "true";
  var enter = parseFloat(section.dataset.enter) / 100;
  var leave = parseFloat(section.dataset.leave) / 100;
  var children = section.querySelectorAll(".section-label, .section-heading, .section-body, .cta-button, .stat");
  var tl = gsap.timeline({ paused: true });

  switch (type) {
    case "fade-up":     tl.from(children, { y: 50,  opacity: 0, stagger: 0.12, duration: 0.9, ease: "power3.out" }); break;
    case "slide-left":  tl.from(children, { x: -80, opacity: 0, stagger: 0.14, duration: 0.9, ease: "power3.out" }); break;
    case "slide-right": tl.from(children, { x: 80,  opacity: 0, stagger: 0.14, duration: 0.9, ease: "power3.out" }); break;
    case "scale-up":    tl.from(children, { scale: 0.85, opacity: 0, stagger: 0.12, duration: 1.0, ease: "power2.out" }); break;
    case "stagger-up":  tl.from(children, { y: 60,  opacity: 0, stagger: 0.15, duration: 0.8, ease: "power3.out" }); break;
    case "clip-reveal": tl.from(children, { clipPath: "inset(100% 0 0 0)", opacity: 0, stagger: 0.15, duration: 1.2, ease: "power4.inOut" }); break;
    case "rotate-in":   tl.from(children, { y: 40, rotation: 3, opacity: 0, stagger: 0.1, duration: 0.9, ease: "power3.out" }); break;
  }

  ScrollTrigger.create({
    trigger: "#scroll-container", start: "top top", end: "bottom bottom", scrub: true,
    onUpdate: function(self) {
      var p = self.progress;
      if (p >= enter && p <= leave) {
        tl.play(); section.style.opacity = "1"; section.style.pointerEvents = "auto";
      } else if (!persist) {
        tl.reverse();
        if (p < enter - 0.02 || p > leave + 0.02) { section.style.opacity = "0"; section.style.pointerEvents = "none"; }
      }
    }
  });
}
```

### Dark Overlay

```js
function initDarkOverlay(enter, leave) {
  var fadeRange = 0.04;
  ScrollTrigger.create({
    trigger: "#scroll-container", start: "top top", end: "bottom bottom", scrub: true,
    onUpdate: function(self) {
      var p = self.progress, opacity = 0;
      if (p >= enter - fadeRange && p <= enter) opacity = (p - (enter - fadeRange)) / fadeRange;
      else if (p > enter && p < leave) opacity = 0.9;
      else if (p >= leave && p <= leave + fadeRange) opacity = 0.9 * (1 - (p - leave) / fadeRange);
      darkOverlay.style.opacity = opacity;
    }
  });
}
```

### Marquee

```js
function initMarquee() {
  var marqueeText = marqueeWrap.querySelector(".marquee-text");
  var speed = parseFloat(marqueeWrap.dataset.scrollSpeed) || -25;
  gsap.to(marqueeText, { xPercent: speed, ease: "none",
    scrollTrigger: { trigger: "#scroll-container", start: "top top", end: "bottom bottom", scrub: true }
  });
  ScrollTrigger.create({
    trigger: "#scroll-container", start: "top top", end: "bottom bottom", scrub: true,
    onUpdate: function(self) {
      var p = self.progress, opacity = 0;
      if (p >= 0.26 && p <= 0.30) opacity = (p - 0.26) / 0.04;
      else if (p > 0.30 && p < 0.50) opacity = 1;
      else if (p >= 0.50 && p <= 0.54) opacity = 1 - (p - 0.50) / 0.04;
      marqueeWrap.style.opacity = opacity;
    }
  });
}
```

### Counter Animations

```js
function initCounters() {
  var tweens = [];
  document.querySelectorAll(".stat-number").forEach(function(el) {
    var target = parseFloat(el.dataset.value);
    var decimals = parseInt(el.dataset.decimals || "0");
    tweens.push(gsap.to(el, { textContent: target, duration: 1.8, ease: "power1.out",
      snap: { textContent: decimals === 0 ? 1 : 0.01 }, paused: true }));
  });
  var triggered = false;
  ScrollTrigger.create({
    trigger: "#scroll-container", start: "top top", end: "bottom bottom",
    onUpdate: function(self) {
      var p = self.progress;
      if (p >= 0.56 && !triggered) { triggered = true; tweens.forEach(function(t) { t.play(); }); }
      else if (p < 0.54 && triggered) { triggered = false; tweens.forEach(function(t) { t.reverse(); }); }
    }
  });
}
```

### Boot Sequence

```js
document.body.style.overflow = "hidden"; // prevent scroll during load

function hideLoader() {
  gsap.to(loader, { opacity: 0, duration: 0.8, ease: "power2.inOut",
    onComplete: function() {
      loader.style.display = "none";
      document.body.style.overflow = "";
      window.scrollTo(0, 0);
      animateHero();
      initLenis();
      gsap.registerPlugin(ScrollTrigger);
      // init all scroll animations here
    }
  });
}

preloadFrames();
```

---

## Mobile Responsive

```css
@media (max-width: 768px) {
  .align-left, .align-right {
    padding-left: 6vw; padding-right: 6vw;
    justify-content: center; text-align: center;
  }
  .section-inner {
    max-width: 88vw;
    background: rgba(0,0,0,0.75);
    backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
    padding: 2rem; border-radius: 2px;
  }
  #scroll-container { height: 600vh; }
  .stats-grid { flex-direction: column; gap: 2.5rem; }
  .hero-heading { font-size: clamp(3.5rem, 16vw, 6rem); }
}
```

Key mobile adjustments:
- Collapse side alignment to centered with dark backdrop
- Reduce scroll height to ~600vh (less thumb travel)
- Stack stats vertically
- Scale down typography
- Reduce frame count to <150 and width to 1280px for memory (handled by extraction script)
