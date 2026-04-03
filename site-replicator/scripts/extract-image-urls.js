#!/usr/bin/env node
/**
 * Phase 3.1: Extract all image URLs from HTML (including lazy-loaded).
 *
 * Usage: node scripts/extract-image-urls.js <base-url>
 * Example: node scripts/extract-image-urls.js https://example.com
 * Expects: extraction/raw.html, cheerio installed
 * Outputs: extraction/image-urls.txt
 */

const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const baseUrl = process.argv[2];
if (!baseUrl) {
  console.error('Usage: node scripts/extract-image-urls.js <base-url>');
  console.error('Example: node scripts/extract-image-urls.js https://example.com');
  process.exit(1);
}

const htmlPath = path.resolve('extraction/raw.html');
if (!fs.existsSync(htmlPath)) {
  console.error('ERROR: extraction/raw.html not found.');
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, 'utf8');
const $ = cheerio.load(html);

const images = new Set();

// <img> src and data-src variants
$('img').each((_, img) => {
  const $img = $(img);
  const src = $img.attr('src');
  const dataSrc = $img.attr('data-src') || $img.attr('data-lazy-src') || $img.attr('data-original');
  if (src && !src.startsWith('data:')) images.add(src);
  if (dataSrc && !dataSrc.startsWith('data:')) images.add(dataSrc);

  // srcset and data-srcset
  const srcset = $img.attr('srcset') || $img.attr('data-srcset');
  if (srcset) {
    srcset.split(',').forEach(s => {
      const url = s.trim().split(/\s+/)[0];
      if (url && !url.startsWith('data:')) images.add(url);
    });
  }
});

// <picture> <source> elements
$('picture source').each((_, src) => {
  const srcset = $(src).attr('srcset');
  if (srcset) {
    srcset.split(',').forEach(s => {
      const url = s.trim().split(/\s+/)[0];
      if (url && !url.startsWith('data:')) images.add(url);
    });
  }
});

// Lazy-load data attributes on any element
$('[data-bg]').each((_, el) => {
  const val = $(el).attr('data-bg');
  if (val && !val.startsWith('data:')) images.add(val);
});
$('[data-background]').each((_, el) => {
  const val = $(el).attr('data-background');
  if (val && !val.startsWith('data:')) images.add(val);
});
$('[data-background-image]').each((_, el) => {
  const val = $(el).attr('data-background-image');
  if (val && !val.startsWith('data:')) images.add(val);
});

// Inline background-image styles
$('[style*="background"]').each((_, el) => {
  const style = $(el).attr('style') || '';
  const urlMatch = style.match(/url\(["']?([^"')]+)["']?\)/);
  if (urlMatch && !urlMatch[1].startsWith('data:')) {
    images.add(urlMatch[1]);
  }
});

// Also scan CSS for background-image URLs
const cssPath = path.resolve('extraction/combined.css');
if (fs.existsSync(cssPath)) {
  const css = fs.readFileSync(cssPath, 'utf8');
  const bgRegex = /background(?:-image)?\s*:[^;]*url\(["']?([^"')]+)["']?\)/gi;
  let match;
  while ((match = bgRegex.exec(css)) !== null) {
    if (!match[1].startsWith('data:') && /\.(png|jpg|jpeg|gif|svg|webp|avif)(\?|$)/i.test(match[1])) {
      images.add(match[1]);
    }
  }
}

// Resolve relative URLs to absolute
function resolveUrl(url) {
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('//')) return 'https:' + url;
  const base = baseUrl.replace(/\/$/, '');
  if (url.startsWith('/')) return base + url;
  return base + '/' + url;
}

const resolved = [...images].map(resolveUrl).filter(Boolean);

fs.writeFileSync('extraction/image-urls.txt', resolved.join('\n'));
console.log(`Found ${resolved.length} image URLs`);
