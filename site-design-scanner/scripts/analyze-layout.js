// Phase 3: Layout & Structure Analysis — evaluate in browser via Playwright MCP
// Identifies page sections, grid systems, container patterns, nav and footer structure
(() => {
  try {
    const result = {
      sections: [],
      gridUsage: { cssGrid: 0, flexbox: 0 },
      containerPattern: null,
      navigation: {},
      footer: {}
    };

    // Page sections
    const sectionEls = document.querySelectorAll('section, [class*="section"], [class*="hero"], [class*="feature"], [class*="testimonial"], [class*="cta"], [class*="pricing"], [class*="faq"], header, footer, main > div');
    const seen = new Set();
    for (const el of [...sectionEls].slice(0, 40)) {
      const r = el.getBoundingClientRect();
      if (r.height < 50 || seen.has(el)) continue;
      seen.add(el);
      const s = getComputedStyle(el);
      const classes = el.className && typeof el.className === 'string' ? el.className : '';
      result.sections.push({
        tag: el.tagName.toLowerCase(),
        classes: classes.slice(0, 150),
        scrollY: Math.round(r.top + window.scrollY),
        height: Math.round(r.height),
        display: s.display,
        position: s.position,
        background: s.backgroundColor !== 'rgba(0, 0, 0, 0)' ? s.backgroundColor : s.backgroundImage !== 'none' ? 'has-bg-image' : 'transparent'
      });
    }
    result.sections.sort((a, b) => a.scrollY - b.scrollY);

    // Grid vs Flexbox usage
    const allEls = document.querySelectorAll('body *');
    for (const el of [...allEls].slice(0, 500)) {
      const d = getComputedStyle(el).display;
      if (d === 'grid' || d === 'inline-grid') result.gridUsage.cssGrid++;
      if (d === 'flex' || d === 'inline-flex') result.gridUsage.flexbox++;
    }

    // Container pattern
    const main = document.querySelector('main') || document.querySelector('[class*="main"]') || document.body;
    const firstSection = main.querySelector('section') || main.children[0];
    if (firstSection) {
      const s = getComputedStyle(firstSection);
      const w = s.maxWidth;
      const ml = s.marginLeft;
      const mr = s.marginRight;
      if (w !== 'none' && (ml === 'auto' || mr === 'auto')) {
        result.containerPattern = `Centered max-width (${w})`;
      } else if (firstSection.scrollWidth > window.innerWidth) {
        result.containerPattern = 'Full-bleed';
      } else {
        result.containerPattern = 'Mixed / custom';
      }
    }

    // Navigation
    const nav = document.querySelector('nav') || document.querySelector('header');
    if (nav) {
      const ns = getComputedStyle(nav);
      result.navigation = {
        tag: nav.tagName.toLowerCase(),
        position: ns.position,
        isFixed: ns.position === 'fixed' || ns.position === 'sticky',
        hasBlur: ns.backdropFilter && ns.backdropFilter !== 'none',
        background: ns.backgroundColor,
        height: Math.round(nav.getBoundingClientRect().height),
        hasHamburger: !!nav.querySelector('[class*="hamburger"], [class*="menu-toggle"], [class*="burger"], button[aria-label*="menu"], button[aria-label*="Menu"]'),
        linkCount: nav.querySelectorAll('a').length
      };
    }

    // Footer
    const footer = document.querySelector('footer');
    if (footer) {
      const fs = getComputedStyle(footer);
      const columns = [];
      const kids = [...footer.children];
      for (const child of kids.slice(0, 10)) {
        const cs = getComputedStyle(child);
        if (cs.display === 'flex' || cs.display === 'grid') {
          columns.push({ childCount: child.children.length, display: cs.display });
        }
      }
      result.footer = {
        background: fs.backgroundColor,
        height: Math.round(footer.getBoundingClientRect().height),
        columns,
        linkCount: footer.querySelectorAll('a').length,
        hasSocialIcons: !!footer.querySelector('[class*="social"], [class*="icon"], svg')
      };
    }

    return result;
  } catch (e) {
    return { error: e.message, stack: e.stack };
  }
})();
