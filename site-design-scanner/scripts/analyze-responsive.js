// Phase 14: Responsive Behavior — evaluate in browser via Playwright MCP
// Run this AFTER resizing viewport. Captures layout state at current viewport width.
// Compare results at 375px, 768px, and 1440px to detect responsive changes.
(() => {
  try {
    const vw = window.innerWidth;
    const result = {
      viewportWidth: vw,
      label: vw <= 480 ? 'mobile' : vw <= 1024 ? 'tablet' : 'desktop',
      nav: {},
      sections: [],
      hiddenElements: [],
      fontSizes: {},
      gridChanges: []
    };

    // Nav state
    const nav = document.querySelector('nav') || document.querySelector('header');
    if (nav) {
      const s = getComputedStyle(nav);
      const hamburger = nav.querySelector('[class*="hamburger"], [class*="burger"], button[aria-label*="menu"], button[aria-expanded]');
      result.nav = {
        height: Math.round(nav.getBoundingClientRect().height),
        position: s.position,
        hamburgerVisible: hamburger ? getComputedStyle(hamburger).display !== 'none' : false,
        linksVisible: [...nav.querySelectorAll('a')].filter(a => getComputedStyle(a).display !== 'none').length
      };
    }

    // Section layouts
    const sections = document.querySelectorAll('section, [class*="section"], main > div');
    for (const sec of [...sections].slice(0, 15)) {
      const s = getComputedStyle(sec);
      const r = sec.getBoundingClientRect();
      if (r.height < 20) continue;

      // Check children for grid/flex changes
      const children = [...sec.children];
      const childDisplays = children.slice(0, 10).map(c => {
        const cs = getComputedStyle(c);
        return { display: cs.display, flexDirection: cs.flexDirection, gridTemplateColumns: cs.gridTemplateColumns };
      });

      result.sections.push({
        classes: (sec.className && typeof sec.className === 'string' ? sec.className : '').slice(0, 80),
        height: Math.round(r.height),
        display: s.display,
        flexDirection: s.flexDirection !== 'row' ? s.flexDirection : undefined,
        gridTemplateColumns: s.gridTemplateColumns !== 'none' ? s.gridTemplateColumns : undefined,
        padding: s.padding,
        childCount: children.length,
        childLayouts: childDisplays
      });
    }

    // Hidden elements (display:none that might be visible at other sizes)
    const interestingEls = document.querySelectorAll('[class*="desktop"], [class*="mobile"], [class*="tablet"], [class*="hide"], [class*="show"], [class*="hidden"], [class*="visible"], [class*="d-none"], [class*="d-block"], [class*="md:"], [class*="lg:"], [class*="sm:]"]');
    for (const el of [...interestingEls].slice(0, 20)) {
      const s = getComputedStyle(el);
      result.hiddenElements.push({
        classes: (el.className && typeof el.className === 'string' ? el.className : '').slice(0, 100),
        display: s.display,
        visibility: s.visibility,
        isHidden: s.display === 'none' || s.visibility === 'hidden'
      });
    }

    // Key font sizes
    const h1 = document.querySelector('h1');
    const h2 = document.querySelector('h2');
    const p = document.querySelector('p');
    if (h1) result.fontSizes.h1 = getComputedStyle(h1).fontSize;
    if (h2) result.fontSizes.h2 = getComputedStyle(h2).fontSize;
    if (p) result.fontSizes.body = getComputedStyle(p).fontSize;

    return result;
  } catch (e) {
    return { error: e.message, stack: e.stack };
  }
})();
