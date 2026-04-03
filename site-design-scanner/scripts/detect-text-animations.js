// Phase 5: Text Animation Detection — evaluate in browser via Playwright MCP
// Finds split text, text reveals, counters, typewriter effects
(() => {
  try {
    const result = {
      splitText: [],
      textReveals: [],
      counters: [],
      gradientText: [],
      typewriter: []
    };

    // Split text detection — chars/words wrapped in spans
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, [class*="heading"], [class*="title"], [class*="headline"]');
    for (const h of headings) {
      const spans = h.querySelectorAll('span, div');
      const text = h.textContent.trim();
      if (spans.length > 3 && text.length > 5) {
        // Check if spans contain individual chars or words
        const spanTexts = [...spans].map(s => s.textContent.trim()).filter(t => t.length > 0);
        const isCharSplit = spanTexts.some(t => t.length === 1) && spanTexts.length > 5;
        const isWordSplit = spanTexts.every(t => !t.includes(' ')) && spanTexts.length > 1;
        const hasAnimClasses = [...spans].some(s =>
          s.className && typeof s.className === 'string' &&
          /char|word|line|split|letter/i.test(s.className)
        );

        if (isCharSplit || isWordSplit || hasAnimClasses) {
          result.splitText.push({
            text: text.slice(0, 80),
            type: isCharSplit ? 'character-split' : 'word-split',
            spanCount: spans.length,
            selector: h.tagName.toLowerCase() + (h.className ? '.' + (typeof h.className === 'string' ? h.className.split(' ')[0] : '') : '')
          });
        }
      }
    }

    // Text reveals — overflow hidden parent + translateY child
    const allEls = document.querySelectorAll('h1, h2, h3, h4, p, span, div');
    for (const el of [...allEls].slice(0, 300)) {
      const parent = el.parentElement;
      if (!parent) continue;
      const ps = getComputedStyle(parent);
      const es = getComputedStyle(el);
      if (ps.overflow === 'hidden' && es.transform && es.transform.includes('matrix')) {
        const m = es.transform.match(/matrix\(([^)]+)\)/);
        if (m) {
          const vals = m[1].split(',').map(Number);
          const translateY = vals[5];
          if (Math.abs(translateY) > 10) {
            result.textReveals.push({
              text: el.textContent.trim().slice(0, 60),
              translateY: Math.round(translateY),
              selector: el.tagName.toLowerCase(),
              parentOverflow: 'hidden'
            });
          }
        }
      }
    }

    // Counter/number elements
    const numberEls = document.querySelectorAll('[class*="counter"], [class*="number"], [class*="stat"], [class*="count"], [class*="ticker"]');
    for (const el of numberEls) {
      const text = el.textContent.trim();
      if (/\d/.test(text)) {
        result.counters.push({
          text,
          selector: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : ''),
          hasAnimation: getComputedStyle(el).animation !== 'none'
        });
      }
    }

    // Gradient text
    for (const el of [...allEls].slice(0, 300)) {
      const s = getComputedStyle(el);
      if (s.backgroundClip === 'text' || s.webkitBackgroundClip === 'text') {
        result.gradientText.push({
          text: el.textContent.trim().slice(0, 60),
          backgroundImage: s.backgroundImage,
          selector: el.tagName.toLowerCase()
        });
      }
    }

    // Typewriter detection — elements with changing width or char count via CSS
    const typeEls = document.querySelectorAll('[class*="type"], [class*="writer"], [class*="cursor"]');
    for (const el of typeEls) {
      const s = getComputedStyle(el);
      result.typewriter.push({
        text: el.textContent.trim().slice(0, 60),
        hasBlinkingCursor: s.borderRight !== 'none' || s.animation.includes('blink'),
        selector: el.tagName.toLowerCase()
      });
    }

    return result;
  } catch (e) {
    return { error: e.message, stack: e.stack };
  }
})();
