// Phase 15: Sound Detection — evaluate in browser via Playwright MCP
// Checks for audio libraries, audio elements, Web Audio API usage
(() => {
  try {
    const result = {
      audioElements: [],
      libraries: [],
      webAudioAPI: false,
      soundOnInteraction: false
    };

    // Audio elements
    const audios = document.querySelectorAll('audio');
    for (const a of audios) {
      result.audioElements.push({
        src: a.src || [...a.querySelectorAll('source')].map(s => s.src)[0] || '',
        autoplay: a.autoplay,
        loop: a.loop,
        muted: a.muted
      });
    }

    // Library detection from scripts
    const scripts = [...document.querySelectorAll('script')].map(s => (s.src || '') + ' ' + (s.textContent || '').slice(0, 500)).join(' ').toLowerCase();
    if (scripts.includes('howler')) result.libraries.push('Howler.js');
    if (scripts.includes('tone')) result.libraries.push('Tone.js');
    if (scripts.includes('pizzicato')) result.libraries.push('Pizzicato');
    if (scripts.includes('audiocontext') || scripts.includes('webaudio')) result.webAudioAPI = true;
    if (scripts.includes('createoscillator') || scripts.includes('createbuffersource')) result.webAudioAPI = true;

    // Check for AudioContext instances
    try {
      if (window.AudioContext || window.webkitAudioContext) {
        // Can't detect instances, but can check for common patterns
        if (scripts.includes('new audiocontext') || scripts.includes('new webaudiocontext')) {
          result.webAudioAPI = true;
        }
      }
    } catch(e) {}

    // Elements with sound-related classes
    const soundEls = document.querySelectorAll('[class*="sound"], [class*="audio"], [class*="mute"], [class*="volume"], [data-sound]');
    if (soundEls.length > 0) {
      result.soundOnInteraction = true;
    }

    return result;
  } catch (e) {
    return { error: e.message, stack: e.stack };
  }
})();
