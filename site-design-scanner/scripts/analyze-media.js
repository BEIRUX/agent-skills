// Phase 7: Image & Media Analysis — evaluate in browser via Playwright MCP
// Catalogs images, videos, SVGs, canvas, iframes, Lottie, background media
(() => {
  try {
    const result = {
      images: [],
      videos: [],
      svgs: { count: 0, animated: [], withFilters: [] },
      canvas: [],
      iframes: [],
      lottie: [],
      backgroundMedia: []
    };

    // Images
    const imgs = document.querySelectorAll('img');
    for (const img of [...imgs].slice(0, 50)) {
      const src = img.src || img.dataset.src || '';
      const ext = src.split('?')[0].split('.').pop().toLowerCase();
      result.images.push({
        src: src.slice(0, 200),
        format: ['webp', 'avif', 'jpg', 'jpeg', 'png', 'svg', 'gif'].includes(ext) ? ext : 'unknown',
        loading: img.loading || 'eager',
        hasSrcset: !!img.srcset,
        hasSizes: !!img.sizes,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        alt: img.alt ? 'has-alt' : 'no-alt'
      });
    }

    // Videos
    const videos = document.querySelectorAll('video');
    for (const v of videos) {
      const sources = [...v.querySelectorAll('source')].map(s => s.src);
      result.videos.push({
        src: v.src || sources[0] || '',
        autoplay: v.autoplay,
        muted: v.muted,
        loop: v.loop,
        playsInline: v.playsInline,
        poster: v.poster || null,
        width: v.videoWidth || v.clientWidth,
        height: v.videoHeight || v.clientHeight,
        currentTime: v.currentTime,
        duration: v.duration || null
      });
    }

    // SVGs
    const svgEls = document.querySelectorAll('svg');
    result.svgs.count = svgEls.length;
    for (const svg of [...svgEls].slice(0, 30)) {
      // Check for animations
      const animates = svg.querySelectorAll('animate, animateTransform, animateMotion, set');
      const hasCssAnim = getComputedStyle(svg).animation !== 'none';
      if (animates.length > 0 || hasCssAnim) {
        result.svgs.animated.push({
          width: svg.getAttribute('width') || svg.clientWidth,
          height: svg.getAttribute('height') || svg.clientHeight,
          animationType: animates.length > 0 ? 'SMIL' : 'CSS',
          classes: svg.className && typeof svg.className === 'object' ? svg.className.baseVal : (svg.className || '')
        });
      }
      // Check for filters
      const filters = svg.querySelectorAll('filter, feTurbulence, feDisplacementMap, feGaussianBlur');
      if (filters.length > 0) {
        result.svgs.withFilters.push({
          filterTypes: [...filters].map(f => f.tagName)
        });
      }
    }

    // Canvas
    const canvases = document.querySelectorAll('canvas');
    for (const c of canvases) {
      let contextType = 'unknown';
      try { if (c.getContext('webgl2')) contextType = 'webgl2'; } catch(e) {}
      try { if (contextType === 'unknown' && c.getContext('webgl')) contextType = 'webgl'; } catch(e) {}
      try { if (contextType === 'unknown' && c.getContext('2d')) contextType = '2d'; } catch(e) {}
      result.canvas.push({
        width: c.width,
        height: c.height,
        contextType,
        classes: c.className || ''
      });
    }

    // Iframes
    const iframes = document.querySelectorAll('iframe');
    for (const iframe of iframes) {
      const src = iframe.src || '';
      let type = 'unknown';
      if (src.includes('spline')) type = 'Spline';
      else if (src.includes('sketchfab')) type = 'Sketchfab';
      else if (src.includes('youtube')) type = 'YouTube';
      else if (src.includes('vimeo')) type = 'Vimeo';
      else if (src.includes('maps.google')) type = 'Google Maps';
      result.iframes.push({ src: src.slice(0, 200), type });
    }

    // Lottie
    const lottiePlayers = document.querySelectorAll('lottie-player, dotlottie-player, [class*="lottie"]');
    for (const el of lottiePlayers) {
      result.lottie.push({
        src: el.getAttribute('src') || el.dataset.src || '',
        autoplay: el.hasAttribute('autoplay'),
        loop: el.hasAttribute('loop'),
        width: el.clientWidth,
        height: el.clientHeight
      });
    }

    // Background media
    const bgEls = document.querySelectorAll('*');
    for (const el of [...bgEls].slice(0, 300)) {
      const s = getComputedStyle(el);
      if (s.backgroundImage && s.backgroundImage !== 'none' && !s.backgroundImage.startsWith('linear-gradient') && !s.backgroundImage.startsWith('radial-gradient')) {
        const urlMatch = s.backgroundImage.match(/url\("?([^"]+)"?\)/);
        if (urlMatch) {
          const r = el.getBoundingClientRect();
          if (r.width > 100 && r.height > 100) {
            result.backgroundMedia.push({
              url: urlMatch[1].slice(0, 200),
              elementSize: `${Math.round(r.width)}x${Math.round(r.height)}`,
              selector: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : '')
            });
          }
        }
      }
    }

    return result;
  } catch (e) {
    return { error: e.message, stack: e.stack };
  }
})();
