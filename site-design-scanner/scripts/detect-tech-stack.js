// Phase 1: Tech Stack Detection — evaluate in browser via Playwright MCP
// Returns JSON object with detected frameworks, libraries, CMS, fonts, CSS framework
(() => {
  try {
    const result = {
      framework: null,
      cssFramework: null,
      animationLibraries: [],
      smoothScroll: null,
      threeD: null,
      cms: null,
      fonts: [],
      hosting: null,
      libraries: [],
      canvas: false,
      meta: {}
    };

    // Framework detection
    if (window.__NEXT_DATA__) result.framework = 'Next.js';
    else if (window.__NUXT__) result.framework = 'Nuxt';
    else if (window.gatsby) result.framework = 'Gatsby';
    else if (window.__SVELTE__) result.framework = 'SvelteKit';
    else if (window.Webflow) result.framework = 'Webflow';
    else if (window.Shopify) result.framework = 'Shopify';
    else if (window.wp) result.framework = 'WordPress';
    else if (document.querySelector('[data-reactroot]') || document.querySelector('#__next')) result.framework = 'React (likely Next.js)';
    else if (document.querySelector('#__nuxt')) result.framework = 'Nuxt';

    // Meta generator
    const gen = document.querySelector('meta[name="generator"]');
    if (gen) result.meta.generator = gen.content;

    // Script src scanning
    const scriptSrcs = [...document.querySelectorAll('script[src]')].map(s => s.src.toLowerCase());
    const allScripts = [...document.querySelectorAll('script')].map(s => (s.src || '') + ' ' + (s.textContent || '').slice(0, 500)).join(' ').toLowerCase();

    const libMap = {
      'gsap': 'GSAP', 'scrolltrigger': 'ScrollTrigger', 'scrollsmoother': 'ScrollSmoother',
      'locomotive-scroll': 'Locomotive Scroll', 'lenis': 'Lenis',
      'barba': 'Barba.js', 'swup': 'Swup',
      'three': 'Three.js', 'spline': 'Spline',
      'framer-motion': 'Framer Motion', 'motion': 'Motion',
      'lottie': 'Lottie', 'bodymovin': 'Lottie (Bodymovin)',
      'anime': 'Anime.js', 'animejs': 'Anime.js',
      'curtains': 'Curtains.js', 'ogl': 'OGL',
      'splitting': 'Splitting.js', 'splittype': 'SplitType',
      'howler': 'Howler.js', 'tone': 'Tone.js',
      'popmotion': 'Popmotion', 'aos': 'AOS',
      'wow.js': 'WOW.js', 'typed.js': 'Typed.js',
      'swiper': 'Swiper', 'flickity': 'Flickity',
      'plyr': 'Plyr', 'lightgallery': 'lightGallery'
    };

    for (const [key, name] of Object.entries(libMap)) {
      if (allScripts.includes(key)) result.animationLibraries.push(name);
    }

    // Smooth scroll detection
    if (allScripts.includes('lenis')) result.smoothScroll = 'Lenis';
    else if (allScripts.includes('locomotive')) result.smoothScroll = 'Locomotive Scroll';
    else if (document.documentElement.style.scrollBehavior === 'smooth' || getComputedStyle(document.documentElement).scrollBehavior === 'smooth') result.smoothScroll = 'CSS smooth-scroll';
    else result.smoothScroll = 'Native';

    // 3D detection
    const canvases = document.querySelectorAll('canvas');
    result.canvas = canvases.length > 0;
    if (allScripts.includes('three') || allScripts.includes('three.module')) result.threeD = 'Three.js';
    else if (allScripts.includes('spline')) result.threeD = 'Spline';
    else if (result.canvas) {
      for (const c of canvases) {
        try { if (c.getContext('webgl') || c.getContext('webgl2')) { result.threeD = 'WebGL (unknown library)'; break; } } catch(e) {}
      }
    }

    // CMS detection
    if (document.querySelector('[data-wf-site]') || document.querySelector('[data-wf-page]')) result.cms = 'Webflow';
    else if (document.querySelector('link[href*="wp-content"]') || allScripts.includes('wp-content')) result.cms = 'WordPress';
    else if (document.querySelector('meta[content*="Squarespace"]')) result.cms = 'Squarespace';
    else if (document.querySelector('[data-wix-]') || allScripts.includes('wix')) result.cms = 'Wix';
    else if (allScripts.includes('framer.com')) result.cms = 'Framer';

    // CSS framework detection via class sampling
    const sampleEls = document.querySelectorAll('[class]');
    const classes = [...sampleEls].slice(0, 200).flatMap(el => [...el.classList]);
    const twClasses = classes.filter(c => /^(flex|grid|pt-|pb-|px-|py-|mt-|mb-|mx-|my-|text-|bg-|w-|h-|gap-|rounded|border|shadow|hover:|md:|lg:|sm:|xl:)/.test(c));
    const bsClasses = classes.filter(c => /^(col-|btn-|container|row|navbar|card|modal|badge)/.test(c));
    const bemClasses = classes.filter(c => /^[a-z]+-?[a-z]*__[a-z]/.test(c));

    if (twClasses.length > 20) result.cssFramework = 'Tailwind CSS';
    else if (bsClasses.length > 10) result.cssFramework = 'Bootstrap';
    else if (bemClasses.length > 10) result.cssFramework = 'Custom (BEM)';
    else result.cssFramework = 'Custom CSS';

    // Font detection
    const fontLinks = [...document.querySelectorAll('link[href]')];
    for (const link of fontLinks) {
      const href = link.href || '';
      if (href.includes('fonts.googleapis.com')) result.fonts.push({ provider: 'Google Fonts', url: href });
      else if (href.includes('use.typekit.net') || href.includes('fonts.adobe.com')) result.fonts.push({ provider: 'Adobe Fonts', url: href });
    }

    // Hosting hints from headers (limited in browser, check meta/link)
    const vercelMeta = document.querySelector('meta[name="x-vercel-id"]');
    if (vercelMeta || allScripts.includes('vercel')) result.hosting = 'Vercel';
    else if (allScripts.includes('netlify')) result.hosting = 'Netlify';
    else if (document.querySelector('meta[name="cf-"]') || allScripts.includes('cloudflare')) result.hosting = 'Cloudflare';

    return result;
  } catch (e) {
    return { error: e.message, stack: e.stack };
  }
})();
