// Phase 6: Cursor & Mouse Interaction Detection — evaluate in browser via Playwright MCP
// Detects custom cursors, followers, magnetic elements, parallax
(() => {
  try {
    const result = {
      customCursor: false,
      cursorStyle: null,
      cursorFollower: null,
      magneticElements: [],
      parallaxElements: [],
      mouseMoveListeners: false
    };

    // Custom cursor on body/html
    const bodyStyle = getComputedStyle(document.body);
    const htmlStyle = getComputedStyle(document.documentElement);
    if (bodyStyle.cursor === 'none' || htmlStyle.cursor === 'none') {
      result.customCursor = true;
      result.cursorStyle = 'none (custom cursor element)';
    } else if (bodyStyle.cursor !== 'auto' && bodyStyle.cursor !== 'default') {
      result.customCursor = true;
      result.cursorStyle = bodyStyle.cursor;
    }

    // Cursor follower — small fixed element
    const fixedEls = document.querySelectorAll('*');
    for (const el of fixedEls) {
      const s = getComputedStyle(el);
      if (s.position === 'fixed' && s.pointerEvents === 'none') {
        const r = el.getBoundingClientRect();
        if (r.width < 80 && r.height < 80 && r.width > 0) {
          result.cursorFollower = {
            selector: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : ''),
            size: `${Math.round(r.width)}x${Math.round(r.height)}`,
            borderRadius: s.borderRadius,
            background: s.backgroundColor,
            mixBlendMode: s.mixBlendMode !== 'normal' ? s.mixBlendMode : undefined
          };
          break;
        }
      }
    }

    // Look for cursor-related class names
    const cursorEls = document.querySelectorAll('[class*="cursor"], [class*="pointer"], [class*="follower"], [class*="mouse"]');
    if (cursorEls.length > 0 && !result.cursorFollower) {
      const el = cursorEls[0];
      const s = getComputedStyle(el);
      result.cursorFollower = {
        selector: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : ''),
        size: `${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`,
        position: s.position,
        background: s.backgroundColor
      };
    }

    // Magnetic buttons — elements with transition on transform
    const buttons = document.querySelectorAll('button, a, [class*="btn"], [class*="button"], [class*="magnetic"]');
    for (const el of [...buttons].slice(0, 30)) {
      const s = getComputedStyle(el);
      if (s.transition && (s.transition.includes('transform') || s.transition.includes('all'))) {
        const duration = parseFloat(s.transitionDuration);
        if (duration > 0.1) {
          result.magneticElements.push({
            text: el.textContent.trim().slice(0, 30),
            selector: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : ''),
            transition: s.transition.slice(0, 100)
          });
        }
      }
    }

    // Parallax elements — elements with transform: translate3d or data-speed attributes
    const parallaxEls = document.querySelectorAll('[data-speed], [data-parallax], [data-scroll-speed], [class*="parallax"]');
    for (const el of parallaxEls) {
      result.parallaxElements.push({
        selector: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : ''),
        dataSpeed: el.dataset.speed || el.dataset.parallax || el.dataset.scrollSpeed,
        tag: el.tagName.toLowerCase()
      });
    }

    // Detect mousemove listeners (approximate)
    try {
      const evts = typeof getEventListeners === 'function' ? getEventListeners(document) : {};
      if (evts.mousemove && evts.mousemove.length > 0) {
        result.mouseMoveListeners = true;
      }
    } catch(e) {
      // getEventListeners only available in DevTools, not in evaluate
      // Fallback: check for data attributes common with mouse tracking
      const tracked = document.querySelectorAll('[data-mouse], [data-cursor], [data-hover-effect]');
      result.mouseMoveListeners = tracked.length > 0 || result.cursorFollower !== null;
    }

    return result;
  } catch (e) {
    return { error: e.message, stack: e.stack };
  }
})();
