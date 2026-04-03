// Phase 8: Loading & Page Entrance Sequence — evaluate in browser via Playwright MCP
// Detects preloaders, high-z-index overlay elements, entrance animation patterns
(() => {
  try {
    const result = {
      preloaders: [],
      highZOverlays: [],
      entranceAnimations: [],
      loadEventListeners: false
    };

    // Preloader elements — high z-index, loading-related classes
    const allEls = document.querySelectorAll('*');
    for (const el of allEls) {
      const cls = el.className && typeof el.className === 'string' ? el.className.toLowerCase() : '';
      const id = (el.id || '').toLowerCase();
      const isLoader = /loader|preload|splash|intro|loading|overlay|curtain/.test(cls + ' ' + id);

      if (isLoader) {
        const s = getComputedStyle(el);
        result.preloaders.push({
          selector: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : ''),
          display: s.display,
          visibility: s.visibility,
          opacity: s.opacity,
          zIndex: s.zIndex,
          position: s.position,
          isHidden: s.display === 'none' || s.visibility === 'hidden' || s.opacity === '0',
          width: Math.round(el.getBoundingClientRect().width),
          height: Math.round(el.getBoundingClientRect().height)
        });
      }
    }

    // High z-index overlay elements
    for (const el of [...allEls].slice(0, 500)) {
      const s = getComputedStyle(el);
      const z = parseInt(s.zIndex);
      if (z > 100 && (s.position === 'fixed' || s.position === 'absolute')) {
        const r = el.getBoundingClientRect();
        if (r.width > window.innerWidth * 0.5 && r.height > window.innerHeight * 0.5) {
          result.highZOverlays.push({
            selector: el.tagName.toLowerCase() + (el.id ? '#' + el.id : ''),
            zIndex: z,
            opacity: s.opacity,
            display: s.display,
            background: s.backgroundColor,
            isCurrentlyVisible: s.display !== 'none' && s.opacity !== '0'
          });
        }
      }
    }

    // Elements with CSS animations (entrance candidates)
    for (const el of [...allEls].slice(0, 300)) {
      const s = getComputedStyle(el);
      if (s.animation && s.animation !== 'none') {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 2) {
          result.entranceAnimations.push({
            selector: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : ''),
            animation: s.animation.slice(0, 150),
            animationDelay: s.animationDelay,
            animationDuration: s.animationDuration,
            scrollPosition: Math.round(r.top + window.scrollY)
          });
        }
      }
    }

    // Check for elements with opacity 0 or translateY that haven't animated yet (above the fold)
    for (const el of [...allEls].slice(0, 200)) {
      const r = el.getBoundingClientRect();
      if (r.top > window.innerHeight || r.width === 0) continue;
      const s = getComputedStyle(el);
      if (s.opacity === '0' && el.textContent.trim().length > 0) {
        result.entranceAnimations.push({
          selector: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : ''),
          type: 'hidden-element-above-fold',
          opacity: '0',
          transform: s.transform !== 'none' ? s.transform : undefined
        });
      }
    }

    return result;
  } catch (e) {
    return { error: e.message, stack: e.stack };
  }
})();
