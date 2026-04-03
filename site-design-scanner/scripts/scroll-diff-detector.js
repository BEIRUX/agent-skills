// Phase 4 Pass 2: Scroll Style Diffing — evaluate in browser via Playwright MCP
// Records computed styles at current scroll position for comparison
// Call this at each scroll increment and diff the results externally
(() => {
  try {
    const scrollY = window.scrollY;
    const vh = window.innerHeight;
    const elements = [];

    // Get all elements currently in or near viewport
    const allEls = document.querySelectorAll('body *');
    for (const el of allEls) {
      const r = el.getBoundingClientRect();
      // In viewport or within 100px of it
      if (r.bottom < -100 || r.top > vh + 100 || r.width === 0 || r.height === 0) continue;

      const s = getComputedStyle(el);
      // Only track elements with interesting properties
      const transform = s.transform;
      const opacity = s.opacity;
      const clipPath = s.clipPath;
      const bgColor = s.backgroundColor;
      const position = s.position;

      // Skip boring elements
      if (transform === 'none' && opacity === '1' && clipPath === 'none' &&
          position === 'static' && s.willChange === 'auto') continue;

      // Build a selector for this element
      let selector = el.tagName.toLowerCase();
      if (el.id) selector += '#' + el.id;
      else if (el.className && typeof el.className === 'string') {
        const cls = el.className.trim().split(/\s+/).slice(0, 3).join('.');
        if (cls) selector += '.' + cls;
      }

      elements.push({
        selector,
        rect: { top: Math.round(r.top), left: Math.round(r.left), width: Math.round(r.width), height: Math.round(r.height) },
        styles: {
          transform: transform !== 'none' ? transform : undefined,
          opacity: opacity !== '1' ? opacity : undefined,
          clipPath: clipPath !== 'none' ? clipPath : undefined,
          backgroundColor: bgColor !== 'rgba(0, 0, 0, 0)' ? bgColor : undefined,
          position: position !== 'static' ? position : undefined,
          top: s.top !== 'auto' ? s.top : undefined,
          left: s.left !== 'auto' ? s.left : undefined,
          width: s.width,
          height: s.height,
          willChange: s.willChange !== 'auto' ? s.willChange : undefined,
          filter: s.filter !== 'none' ? s.filter : undefined,
          backdropFilter: s.backdropFilter !== 'none' ? s.backdropFilter : undefined,
          scale: s.scale !== 'none' ? s.scale : undefined
        }
      });
    }

    // Clean undefined values
    for (const el of elements) {
      el.styles = Object.fromEntries(Object.entries(el.styles).filter(([_, v]) => v !== undefined));
    }

    return {
      scrollY,
      viewportHeight: vh,
      pageHeight: document.documentElement.scrollHeight,
      elementCount: elements.length,
      elements: elements.slice(0, 100) // Cap to prevent huge payloads
    };
  } catch (e) {
    return { error: e.message, stack: e.stack };
  }
})();
