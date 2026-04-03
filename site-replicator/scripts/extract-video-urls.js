#!/usr/bin/env node
/**
 * Phase 3.2: Extract all video URLs from HTML.
 *
 * Usage: node scripts/extract-video-urls.js <base-url>
 * Expects: extraction/raw.html, cheerio installed
 * Outputs: extraction/videos.json, extraction/video-urls.txt
 */

const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const baseUrl = process.argv[2];
if (!baseUrl) {
  console.error('Usage: node scripts/extract-video-urls.js <base-url>');
  process.exit(1);
}

const htmlPath = path.resolve('extraction/raw.html');
if (!fs.existsSync(htmlPath)) {
  console.error('ERROR: extraction/raw.html not found.');
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, 'utf8');
const $ = cheerio.load(html);

const videos = [];

$('video').each((_, v) => {
  const $v = $(v);
  const sources = $v.find('source').map((_, s) => ({
    src: $(s).attr('src') || null,
    type: $(s).attr('type') || null
  })).get();

  videos.push({
    src: $v.attr('src') || null,
    sources,
    autoplay: $v.attr('autoplay') !== undefined,
    muted: $v.attr('muted') !== undefined,
    loop: $v.attr('loop') !== undefined,
    playsinline: $v.attr('playsinline') !== undefined,
    poster: $v.attr('poster') || null,
    classes: ($v.attr('class') || '').split(/\s+/).filter(Boolean),
    id: $v.attr('id') || null
  });
});

// Also check for data-video-src or data-src on video containers
$('[data-video-src], [data-video]').each((_, el) => {
  const src = $(el).attr('data-video-src') || $(el).attr('data-video');
  if (src) {
    videos.push({
      src,
      sources: [],
      autoplay: false,
      muted: false,
      loop: false,
      playsinline: false,
      poster: null,
      classes: ($(el).attr('class') || '').split(/\s+/).filter(Boolean),
      id: $(el).attr('id') || null,
      note: 'Found via data attribute — may be JS-loaded'
    });
  }
});

fs.writeFileSync('extraction/videos.json', JSON.stringify(videos, null, 2));

// Resolve and collect all video URLs
function resolveUrl(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('//')) return 'https:' + url;
  const base = baseUrl.replace(/\/$/, '');
  if (url.startsWith('/')) return base + url;
  return base + '/' + url;
}

const urls = videos.flatMap(v => {
  const srcs = [];
  if (v.src) srcs.push(v.src);
  if (v.poster) srcs.push(v.poster);
  v.sources.forEach(s => { if (s.src) srcs.push(s.src); });
  return srcs;
}).map(resolveUrl).filter(Boolean);

const unique = [...new Set(urls)];
fs.writeFileSync('extraction/video-urls.txt', unique.join('\n'));
console.log(`Found ${videos.length} video elements, ${unique.length} unique URLs`);
