// Phase 9: Navigation Deep-Dive — evaluate in browser via Playwright MCP
// Analyzes nav scroll behavior, blur, hamburger, menu state
(() => {
  try {
    const result = {
      navElement: null,
      scrollBehavior: {},
      backdropBlur: false,
      hamburger: null,
      links: [],
      isTransparent: false
    };

    const nav = document.querySelector('nav') || document.querySelector('header') || document.querySelector('[class*="nav"]');
    if (!nav) return { error: 'No navigation element found' };

    const s = getComputedStyle(nav);
    const r = nav.getBoundingClientRect();

    result.navElement = {
      tag: nav.tagName.toLowerCase(),
      classes: (nav.className && typeof nav.className === 'string' ? nav.className : '').slice(0, 150),
      position: s.position,
      top: s.top,
      width: Math.round(r.width),
      height: Math.round(r.height)
    };

    // Background
    const bg = s.backgroundColor;
    result.isTransparent = bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent' || s.opacity < 0.5;
    result.scrollBehavior.background = bg;

    // Backdrop blur
    const bf = s.backdropFilter || s.webkitBackdropFilter;
    if (bf && bf !== 'none') {
      result.backdropBlur = true;
      result.scrollBehavior.backdropFilter = bf;
    }

    // Box shadow
    if (s.boxShadow !== 'none') {
      result.scrollBehavior.boxShadow = s.boxShadow;
    }

    // Hamburger detection
    const hamburgerSelectors = [
      '[class*="hamburger"]', '[class*="burger"]', '[class*="menu-toggle"]',
      '[class*="menu-btn"]', '[class*="mobile-menu"]', '[class*="nav-toggle"]',
      'button[aria-label*="menu"]', 'button[aria-label*="Menu"]',
      'button[aria-expanded]'
    ];
    for (const sel of hamburgerSelectors) {
      const btn = nav.querySelector(sel) || document.querySelector(sel);
      if (btn) {
        const bs = getComputedStyle(btn);
        result.hamburger = {
          selector: sel,
          display: bs.display,
          visibleOnDesktop: bs.display !== 'none' && window.innerWidth > 768,
          ariaExpanded: btn.getAttribute('aria-expanded'),
          hasSpans: btn.querySelectorAll('span').length,
          hasSvg: !!btn.querySelector('svg')
        };
        break;
      }
    }

    // Nav links
    const navLinks = nav.querySelectorAll('a');
    for (const link of [...navLinks].slice(0, 20)) {
      const ls = getComputedStyle(link);
      result.links.push({
        text: link.textContent.trim().slice(0, 30),
        href: link.getAttribute('href') || '',
        fontSize: ls.fontSize,
        fontWeight: ls.fontWeight,
        textTransform: ls.textTransform !== 'none' ? ls.textTransform : undefined,
        letterSpacing: ls.letterSpacing !== 'normal' ? ls.letterSpacing : undefined,
        hasUnderline: ls.textDecoration.includes('underline'),
        transition: ls.transition !== 'all 0s ease 0s' ? ls.transition.slice(0, 80) : undefined
      });
    }

    return result;
  } catch (e) {
    return { error: e.message, stack: e.stack };
  }
})();
