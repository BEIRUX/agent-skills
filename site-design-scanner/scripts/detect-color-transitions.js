// Phase 11: Color & Background Transitions — evaluate in browser via Playwright MCP
// Detects scroll-linked background changes, blend modes, gradients, grain overlays
(() => {
  try {
    const result = {
      bodyBackgrounds: [],
      sectionBackgrounds: [],
      blendModes: [],
      animatedGradients: [],
      noiseOverlays: [],
      cssVariables: []
    };

    // Body/wrapper background at different scroll positions
    const body = document.body;
    const wrapper = document.querySelector('main') || document.querySelector('[class*="wrapper"]') || body;
    const bs = getComputedStyle(body);
    const ws = getComputedStyle(wrapper);
    result.bodyBackgrounds.push({
      element: 'body',
      backgroundColor: bs.backgroundColor,
      backgroundImage: bs.backgroundImage !== 'none' ? bs.backgroundImage.slice(0, 150) : undefined
    });
    if (wrapper !== body) {
      result.bodyBackgrounds.push({
        element: 'main/wrapper',
        backgroundColor: ws.backgroundColor,
        backgroundImage: ws.backgroundImage !== 'none' ? ws.backgroundImage.slice(0, 150) : undefined
      });
    }

    // Section backgrounds (ordered by scroll position)
    const sections = document.querySelectorAll('section, [class*="section"], header, footer');
    for (const sec of [...sections].slice(0, 20)) {
      const s = getComputedStyle(sec);
      const r = sec.getBoundingClientRect();
      result.sectionBackgrounds.push({
        scrollY: Math.round(r.top + window.scrollY),
        height: Math.round(r.height),
        backgroundColor: s.backgroundColor,
        backgroundImage: s.backgroundImage !== 'none' ? s.backgroundImage.slice(0, 150) : undefined,
        classes: (sec.className && typeof sec.className === 'string' ? sec.className : '').slice(0, 80)
      });
    }
    result.sectionBackgrounds.sort((a, b) => a.scrollY - b.scrollY);

    // Blend modes
    const allEls = document.querySelectorAll('body *');
    for (const el of [...allEls].slice(0, 300)) {
      const s = getComputedStyle(el);
      if (s.mixBlendMode && s.mixBlendMode !== 'normal') {
        result.blendModes.push({
          selector: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : ''),
          blendMode: s.mixBlendMode
        });
      }
    }

    // Animated gradients — background-size larger than element
    for (const el of [...allEls].slice(0, 200)) {
      const s = getComputedStyle(el);
      if (s.backgroundImage.includes('gradient') && s.animation !== 'none') {
        const bgSize = s.backgroundSize.split(' ').map(v => parseFloat(v));
        result.animatedGradients.push({
          selector: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : ''),
          gradient: s.backgroundImage.slice(0, 150),
          backgroundSize: s.backgroundSize,
          animation: s.animation.slice(0, 100)
        });
      }
    }

    // Noise/grain overlays — small repeating bg image with low opacity
    for (const el of [...allEls].slice(0, 200)) {
      const s = getComputedStyle(el);
      if (s.backgroundImage && s.backgroundImage !== 'none' && !s.backgroundImage.includes('gradient')) {
        const opacity = parseFloat(s.opacity);
        if (opacity < 0.5 && opacity > 0) {
          const r = el.getBoundingClientRect();
          if (r.width > window.innerWidth * 0.5) {
            result.noiseOverlays.push({
              selector: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : ''),
              backgroundImage: s.backgroundImage.slice(0, 100),
              opacity: s.opacity,
              backgroundRepeat: s.backgroundRepeat,
              pointerEvents: s.pointerEvents
            });
          }
        }
      }
    }

    // CSS custom properties on root (design tokens)
    try {
      const rootStyles = getComputedStyle(document.documentElement);
      const sheet = [...document.styleSheets].find(s => {
        try { return s.cssRules && [...s.cssRules].some(r => r.selectorText === ':root'); } catch(e) { return false; }
      });
      if (sheet) {
        const rootRule = [...sheet.cssRules].find(r => r.selectorText === ':root');
        if (rootRule) {
          const vars = rootRule.cssText.match(/--[\w-]+:\s*[^;]+/g) || [];
          result.cssVariables = vars.slice(0, 30).map(v => {
            const [name, value] = v.split(':').map(s => s.trim());
            return { name, value: value.slice(0, 60) };
          });
        }
      }
    } catch(e) {}

    return result;
  } catch (e) {
    return { error: e.message, stack: e.stack };
  }
})();
