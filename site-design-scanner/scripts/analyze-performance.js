// Phase 12: Performance & Accessibility & SEO — evaluate in browser via Playwright MCP
// Checks GPU hints, lazy loading, font loading, ARIA, heading hierarchy, OG tags
(() => {
  try {
    const result = {
      performance: {
        gpuHints: [],
        lazyImages: 0,
        eagerImages: 0,
        fontDisplay: [],
        imageFormats: {},
        willChange: []
      },
      accessibility: {
        ariaAttributes: 0,
        roleAttributes: 0,
        reducedMotion: false,
        skipLink: false,
        focusVisible: false,
        headingHierarchy: [],
        altTextCoverage: { withAlt: 0, withoutAlt: 0 }
      },
      seo: {
        title: '',
        metaDescription: '',
        ogTags: [],
        structuredData: [],
        headings: [],
        canonical: null
      }
    };

    // Performance
    const allEls = [...document.querySelectorAll('body *')].slice(0, 300);
    for (const el of allEls) {
      const s = getComputedStyle(el);
      if (s.willChange && s.willChange !== 'auto') {
        result.performance.willChange.push({
          tag: el.tagName.toLowerCase(),
          willChange: s.willChange
        });
      }
      if (s.transform.includes('translateZ') || s.transform.includes('translate3d')) {
        result.performance.gpuHints.push(el.tagName.toLowerCase());
      }
    }

    // Images
    const imgs = document.querySelectorAll('img');
    for (const img of imgs) {
      if (img.loading === 'lazy') result.performance.lazyImages++;
      else result.performance.eagerImages++;
      const src = (img.src || '').split('?')[0];
      const ext = src.split('.').pop().toLowerCase();
      if (['webp', 'avif', 'jpg', 'jpeg', 'png', 'svg', 'gif'].includes(ext)) {
        result.performance.imageFormats[ext] = (result.performance.imageFormats[ext] || 0) + 1;
      }
    }

    // Font display
    try {
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules || []) {
            if (rule.type === CSSRule.FONT_FACE_RULE) {
              const fd = rule.style.fontDisplay;
              const family = rule.style.fontFamily;
              if (fd) result.performance.fontDisplay.push({ family, display: fd });
            }
          }
        } catch(e) {}
      }
    } catch(e) {}

    // Accessibility
    for (const el of allEls) {
      const attrs = el.attributes;
      for (const attr of attrs) {
        if (attr.name.startsWith('aria-')) { result.accessibility.ariaAttributes++; break; }
      }
      if (el.getAttribute('role')) result.accessibility.roleAttributes++;
    }

    // Skip link
    result.accessibility.skipLink = !!document.querySelector('a[href="#main"], a[href="#content"], [class*="skip"]');

    // Reduced motion check
    try {
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules || []) {
            if (rule.type === CSSRule.MEDIA_RULE && rule.conditionText.includes('prefers-reduced-motion')) {
              result.accessibility.reducedMotion = true;
              break;
            }
          }
        } catch(e) {}
      }
    } catch(e) {}

    // Alt text coverage
    for (const img of imgs) {
      if (img.alt) result.accessibility.altTextCoverage.withAlt++;
      else result.accessibility.altTextCoverage.withoutAlt++;
    }

    // Heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    result.accessibility.headingHierarchy = [...headings].slice(0, 20).map(h => ({
      level: h.tagName,
      text: h.textContent.trim().slice(0, 50)
    }));

    // SEO
    result.seo.title = document.title;
    const desc = document.querySelector('meta[name="description"]');
    result.seo.metaDescription = desc ? desc.content : '';
    const canonical = document.querySelector('link[rel="canonical"]');
    result.seo.canonical = canonical ? canonical.href : null;

    // OG tags
    const ogTags = document.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"]');
    for (const tag of ogTags) {
      result.seo.ogTags.push({
        property: tag.getAttribute('property') || tag.getAttribute('name'),
        content: (tag.content || '').slice(0, 100)
      });
    }

    // Structured data
    const jsonLd = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of jsonLd) {
      try {
        const data = JSON.parse(script.textContent);
        result.seo.structuredData.push({ type: data['@type'] || 'unknown' });
      } catch(e) {}
    }

    return result;
  } catch (e) {
    return { error: e.message, stack: e.stack };
  }
})();
