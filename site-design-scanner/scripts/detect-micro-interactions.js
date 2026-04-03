// Phase 10: Micro-Interactions Detection — evaluate in browser via Playwright MCP
// Catalogs button, form, card, link hover/focus styles and transitions
(() => {
  try {
    const result = {
      buttons: [],
      formInputs: [],
      cards: [],
      links: [],
      tooltips: []
    };

    // Buttons — detect transition properties that indicate hover effects
    const buttons = document.querySelectorAll('button, [class*="btn"], [class*="button"], a[class*="cta"]');
    for (const btn of [...buttons].slice(0, 20)) {
      const s = getComputedStyle(btn);
      const r = btn.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      result.buttons.push({
        text: btn.textContent.trim().slice(0, 30),
        selector: btn.tagName.toLowerCase() + (btn.className && typeof btn.className === 'string' ? '.' + btn.className.split(' ')[0] : ''),
        background: s.backgroundColor,
        color: s.color,
        borderRadius: s.borderRadius,
        padding: `${s.paddingTop} ${s.paddingRight}`,
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        textTransform: s.textTransform !== 'none' ? s.textTransform : undefined,
        letterSpacing: s.letterSpacing !== 'normal' ? s.letterSpacing : undefined,
        border: s.border !== 'none' && s.borderWidth !== '0px' ? s.border : undefined,
        boxShadow: s.boxShadow !== 'none' ? s.boxShadow.slice(0, 80) : undefined,
        transition: s.transition !== 'all 0s ease 0s' ? s.transition.slice(0, 120) : undefined,
        cursor: s.cursor,
        hasIcon: !!btn.querySelector('svg, i, [class*="icon"]'),
        size: `${Math.round(r.width)}x${Math.round(r.height)}`
      });
    }

    // Form inputs
    const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], input:not([type]), textarea, select');
    for (const input of [...inputs].slice(0, 10)) {
      const s = getComputedStyle(input);
      const label = input.closest('label') || document.querySelector(`label[for="${input.id}"]`);
      result.formInputs.push({
        type: input.type || input.tagName.toLowerCase(),
        placeholder: input.placeholder || '',
        hasLabel: !!label,
        labelText: label ? label.textContent.trim().slice(0, 30) : null,
        background: s.backgroundColor,
        border: s.border,
        borderRadius: s.borderRadius,
        padding: s.padding,
        fontSize: s.fontSize,
        transition: s.transition !== 'all 0s ease 0s' ? s.transition.slice(0, 100) : undefined,
        outline: s.outline
      });
    }

    // Cards — elements that look like cards
    const cardSelectors = '[class*="card"], [class*="Card"], article, [class*="item"], [class*="project"], [class*="portfolio"]';
    const cards = document.querySelectorAll(cardSelectors);
    for (const card of [...cards].slice(0, 15)) {
      const s = getComputedStyle(card);
      const r = card.getBoundingClientRect();
      if (r.width < 100 || r.height < 100) continue;
      const img = card.querySelector('img');
      result.cards.push({
        selector: card.tagName.toLowerCase() + (card.className && typeof card.className === 'string' ? '.' + card.className.split(' ')[0] : ''),
        size: `${Math.round(r.width)}x${Math.round(r.height)}`,
        background: s.backgroundColor,
        borderRadius: s.borderRadius,
        boxShadow: s.boxShadow !== 'none' ? s.boxShadow.slice(0, 80) : undefined,
        border: s.borderWidth !== '0px' ? s.border : undefined,
        overflow: s.overflow,
        transition: s.transition !== 'all 0s ease 0s' ? s.transition.slice(0, 100) : undefined,
        hasImage: !!img,
        imageOverflow: img ? getComputedStyle(img.parentElement || img).overflow : undefined
      });
    }

    // Links with custom underlines
    const linkEls = document.querySelectorAll('a:not(button):not([class*="btn"])');
    for (const link of [...linkEls].slice(0, 15)) {
      const s = getComputedStyle(link);
      const r = link.getBoundingClientRect();
      if (r.width === 0 || !link.textContent.trim()) continue;
      const hasPseudoUnderline = s.backgroundImage !== 'none' || s.textDecorationStyle !== 'solid';
      if (s.transition !== 'all 0s ease 0s' || hasPseudoUnderline) {
        result.links.push({
          text: link.textContent.trim().slice(0, 30),
          textDecoration: s.textDecoration,
          backgroundImage: s.backgroundImage !== 'none' ? s.backgroundImage.slice(0, 80) : undefined,
          transition: s.transition.slice(0, 100),
          color: s.color
        });
      }
    }

    // Tooltips
    const tooltipTriggers = document.querySelectorAll('[title], [data-tooltip], [data-tip], [aria-describedby]');
    for (const el of [...tooltipTriggers].slice(0, 10)) {
      result.tooltips.push({
        trigger: el.tagName.toLowerCase(),
        text: el.getAttribute('title') || el.dataset.tooltip || el.dataset.tip || 'aria-referenced',
        hasCustomTooltip: !!el.dataset.tooltip || !!el.dataset.tip || !!el.getAttribute('aria-describedby')
      });
    }

    return result;
  } catch (e) {
    return { error: e.message, stack: e.stack };
  }
})();
