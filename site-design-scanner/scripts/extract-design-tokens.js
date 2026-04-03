// Phase 2: Design Token Extraction — evaluate in browser via Playwright MCP
// Extracts colors, typography, spacing, borders, shadows, containers, z-index
(() => {
  try {
    const result = {
      colors: { all: [], byFrequency: {} },
      typography: { families: [], scale: [], combinations: [] },
      spacing: { values: [], baseUnit: null },
      borderRadius: [],
      shadows: [],
      containerWidths: [],
      zIndexLayers: [],
      breakpoints: []
    };

    // Sample visible elements
    const allEls = document.querySelectorAll('body *');
    const visibleEls = [...allEls].filter(el => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && getComputedStyle(el).display !== 'none';
    }).slice(0, 500);

    // Colors
    const colorMap = {};
    for (const el of visibleEls) {
      const s = getComputedStyle(el);
      const colors = [s.color, s.backgroundColor, s.borderColor].filter(c => c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent');
      for (const c of colors) {
        colorMap[c] = (colorMap[c] || 0) + 1;
      }
    }
    result.colors.byFrequency = Object.entries(colorMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([color, count]) => ({ color, count }));

    // Helper: rgb to hex
    const toHex = (c) => {
      const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!m) return c;
      return '#' + [m[1], m[2], m[3]].map(n => parseInt(n).toString(16).padStart(2, '0')).join('');
    };
    result.colors.all = result.colors.byFrequency.map(c => ({ ...c, hex: toHex(c.color) }));

    // Typography
    const fontFamilies = new Set();
    const fontCombos = new Map();
    const fontSizes = new Set();
    for (const el of visibleEls) {
      const s = getComputedStyle(el);
      const family = s.fontFamily.split(',')[0].trim().replace(/['"]/g, '');
      fontFamilies.add(family);
      fontSizes.add(s.fontSize);
      const key = `${family}|${s.fontSize}|${s.fontWeight}|${s.lineHeight}|${s.letterSpacing}`;
      if (!fontCombos.has(key)) {
        fontCombos.set(key, {
          family, fontSize: s.fontSize, fontWeight: s.fontWeight,
          lineHeight: s.lineHeight, letterSpacing: s.letterSpacing,
          tag: el.tagName.toLowerCase(), count: 0
        });
      }
      fontCombos.get(key).count++;
    }
    result.typography.families = [...fontFamilies];
    result.typography.scale = [...fontSizes].sort((a, b) => parseFloat(a) - parseFloat(b));
    result.typography.combinations = [...fontCombos.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    // Spacing
    const spacingVals = new Map();
    const layoutEls = [...document.querySelectorAll('section, main, header, footer, article, div[class]')].slice(0, 200);
    for (const el of layoutEls) {
      const s = getComputedStyle(el);
      const vals = [s.paddingTop, s.paddingBottom, s.paddingLeft, s.paddingRight,
                    s.marginTop, s.marginBottom, s.gap].filter(v => v && v !== '0px');
      for (const v of vals) {
        spacingVals.set(v, (spacingVals.get(v) || 0) + 1);
      }
    }
    result.spacing.values = [...spacingVals.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([val, count]) => ({ value: val, count }));

    // Detect base unit
    const pxVals = result.spacing.values.map(v => parseFloat(v.value)).filter(n => n > 0);
    if (pxVals.length > 2) {
      const diffs = [];
      const sorted = [...new Set(pxVals)].sort((a, b) => a - b);
      for (let i = 1; i < sorted.length; i++) diffs.push(sorted[i] - sorted[i-1]);
      const gcd = diffs.reduce((a, b) => { while(b) { [a,b] = [b, a%b]; } return a; });
      result.spacing.baseUnit = gcd >= 2 ? gcd + 'px' : '4px (likely)';
    }

    // Border radius
    const radiusSet = new Set();
    for (const el of visibleEls) {
      const r = getComputedStyle(el).borderRadius;
      if (r && r !== '0px') radiusSet.add(r);
    }
    result.borderRadius = [...radiusSet].sort((a, b) => parseFloat(a) - parseFloat(b));

    // Shadows
    const shadowSet = new Set();
    for (const el of visibleEls) {
      const s = getComputedStyle(el).boxShadow;
      if (s && s !== 'none') shadowSet.add(s);
    }
    result.shadows = [...shadowSet].slice(0, 10);

    // Container widths
    const containers = document.querySelectorAll('[class*="container"], [class*="wrapper"], [class*="max-w"], main > *, section > *');
    const widths = new Set();
    for (const el of [...containers].slice(0, 50)) {
      const mw = getComputedStyle(el).maxWidth;
      if (mw && mw !== 'none' && mw !== '100%') widths.add(mw);
    }
    result.containerWidths = [...widths];

    // Z-index
    const zSet = new Set();
    for (const el of visibleEls) {
      const z = getComputedStyle(el).zIndex;
      if (z && z !== 'auto') zSet.add(parseInt(z));
    }
    result.zIndexLayers = [...zSet].sort((a, b) => a - b);

    // Breakpoints from stylesheets
    try {
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules || []) {
            if (rule.type === CSSRule.MEDIA_RULE) {
              const m = rule.conditionText.match(/(\d+)px/g);
              if (m) m.forEach(bp => result.breakpoints.push(bp));
            }
          }
        } catch(e) {} // CORS blocked sheets
      }
      result.breakpoints = [...new Set(result.breakpoints)].sort((a, b) => parseInt(a) - parseInt(b));
    } catch(e) {}

    return result;
  } catch (e) {
    return { error: e.message, stack: e.stack };
  }
})();
