// Phase 13: Page Transition Detection — evaluate in browser via Playwright MCP
// Detects SPA frameworks, Barba.js, Swup, View Transitions API
(() => {
  try {
    const result = {
      isSPA: false,
      transitionLibrary: null,
      viewTransitionsAPI: false,
      barba: false,
      swup: false,
      turbo: false,
      transitionElements: [],
      internalLinks: []
    };

    // SPA detection
    if (window.__NEXT_DATA__ || document.querySelector('#__next')) result.isSPA = true;
    else if (window.__NUXT__ || document.querySelector('#__nuxt')) result.isSPA = true;
    else if (window.__SVELTE__) result.isSPA = true;
    else if (document.querySelector('#app[data-v-app]')) result.isSPA = true;

    // Barba.js
    const barbaEls = document.querySelectorAll('[data-barba], [data-barba-namespace], [data-barba-prevent]');
    if (barbaEls.length > 0) {
      result.barba = true;
      result.transitionLibrary = 'Barba.js';
      result.isSPA = true;
    }

    // Swup
    const swupEls = document.querySelectorAll('[data-swup], #swup');
    if (swupEls.length > 0 || window.swup) {
      result.swup = true;
      result.transitionLibrary = 'Swup';
      result.isSPA = true;
    }

    // Turbo
    if (document.querySelector('meta[name="turbo-root"]') || window.Turbo) {
      result.turbo = true;
      result.transitionLibrary = 'Turbo';
      result.isSPA = true;
    }

    // View Transitions API
    if ('startViewTransition' in document) {
      result.viewTransitionsAPI = true;
      // Check for view-transition-name in styles
      const allEls = document.querySelectorAll('*');
      for (const el of [...allEls].slice(0, 200)) {
        const vtn = getComputedStyle(el).viewTransitionName;
        if (vtn && vtn !== 'none') {
          result.transitionElements.push({
            selector: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : ''),
            viewTransitionName: vtn
          });
        }
      }
    }

    // Check scripts for transition libraries
    const scripts = [...document.querySelectorAll('script')].map(s => (s.src || '') + ' ' + (s.textContent || '').slice(0, 300)).join(' ').toLowerCase();
    if (scripts.includes('barba') && !result.transitionLibrary) result.transitionLibrary = 'Barba.js (in scripts)';
    if (scripts.includes('swup') && !result.transitionLibrary) result.transitionLibrary = 'Swup (in scripts)';
    if (scripts.includes('highway') && !result.transitionLibrary) result.transitionLibrary = 'Highway.js';

    // Collect internal links for transition testing
    const links = document.querySelectorAll('a[href^="/"], a[href^="' + location.origin + '"]');
    for (const link of [...links].slice(0, 5)) {
      if (link.getAttribute('href') === '#' || link.getAttribute('href') === '/') continue;
      result.internalLinks.push({
        text: link.textContent.trim().slice(0, 30),
        href: link.getAttribute('href')
      });
    }

    return result;
  } catch (e) {
    return { error: e.message, stack: e.stack };
  }
})();
