#!/usr/bin/env node
/**
 * Phase 1: Extract page structure, sections, SVGs, navigation, and animation elements.
 *
 * Usage: node scripts/extract-content.js
 * Expects: extraction/raw.html, cheerio installed (npm install cheerio --save-dev)
 * Outputs: extraction/sections.json, extraction/svgs.json, extraction/nav.json, extraction/animations.json
 */

const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const htmlPath = path.resolve('extraction/raw.html');
if (!fs.existsSync(htmlPath)) {
  console.error('ERROR: extraction/raw.html not found.');
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, 'utf8');
const $ = cheerio.load(html);

// --- Sections ---
const sections = [];
$('header, nav, section, main, footer, [class*="hero"], [class*="cta"], [class*="testimonial"], [class*="footer"], article, aside').each((i, el) => {
  const $el = $(el);
  const innerHtml = $el.html();
  sections.push({
    tag: el.tagName.toLowerCase(),
    id: $el.attr('id') || null,
    classes: ($el.attr('class') || '').split(/\s+/).filter(Boolean),
    headings: $el.find('h1,h2,h3,h4,h5,h6').map((_, h) => ({
      tag: h.tagName.toLowerCase(),
      text: $(h).text().trim(),
      classes: ($(h).attr('class') || '').split(/\s+/).filter(Boolean)
    })).get(),
    paragraphs: $el.find('p').map((_, p) => ({
      text: $(p).text().trim(),
      classes: ($(p).attr('class') || '').split(/\s+/).filter(Boolean)
    })).get(),
    links: $el.find('a').map((_, a) => ({
      text: $(a).text().trim(),
      href: $(a).attr('href'),
      classes: ($(a).attr('class') || '').split(/\s+/).filter(Boolean)
    })).get(),
    images: $el.find('img').map((_, img) => ({
      src: $(img).attr('src'),
      alt: $(img).attr('alt') || '',
      classes: ($(img).attr('class') || '').split(/\s+/).filter(Boolean)
    })).get(),
    innerHTML: innerHtml && innerHtml.length < 50000 ? innerHtml : '[too large — split into sub-sections]'
  });
});
fs.writeFileSync('extraction/sections.json', JSON.stringify(sections, null, 2));

// --- SVGs ---
const svgs = [];
$('header svg, nav svg, .logo svg, [class*="logo"] svg, footer svg').each((_, svg) => {
  svgs.push({
    location: $(svg).closest('[class]').attr('class') || 'unknown',
    markup: $.html(svg),
    viewBox: $(svg).attr('viewBox') || null
  });
});
fs.writeFileSync('extraction/svgs.json', JSON.stringify(svgs, null, 2));

// --- Navigation ---
const nav = {
  links: [],
  cta: null,
  hasHamburger: !!$('[class*="hamburger"], [class*="burger"], [class*="menu-toggle"], .menu-btn, .nav-toggle, [class*="mobile-menu"]').length,
  hasOverlay: !!$('[class*="nav-overlay"], [class*="menu-overlay"], [class*="fullscreen-menu"]').length
};
$('header a, nav a').each((_, a) => {
  nav.links.push({
    text: $(a).text().trim(),
    href: $(a).attr('href'),
    classes: ($(a).attr('class') || '').split(/\s+/).filter(Boolean)
  });
});
const cta = $('header [class*="cta"], header [class*="btn"], nav [class*="cta"], nav [class*="btn"]').first();
if (cta.length) {
  nav.cta = {
    text: cta.text().trim(),
    classes: (cta.attr('class') || '').split(/\s+/).filter(Boolean),
    href: cta.attr('href') || null
  };
}
fs.writeFileSync('extraction/nav.json', JSON.stringify(nav, null, 2));

// --- Animations ---
const animations = {
  wow: [],
  aos: [],
  textReveal: [],
  counters: []
};

$('.wow').each((_, el) => {
  const $el = $(el);
  const classes = ($el.attr('class') || '').split(/\s+/).filter(Boolean);
  animations.wow.push({
    classes,
    delay: $el.attr('data-wow-delay') || null,
    duration: $el.attr('data-wow-duration') || null,
    offset: $el.attr('data-wow-offset') || null,
    animationName: classes.find(c => /fade|slide|zoom|bounce|roll|rotate|flip/i.test(c)) || null,
    tag: el.tagName.toLowerCase()
  });
});

$('[data-aos]').each((_, el) => {
  const $el = $(el);
  animations.aos.push({
    animation: $el.attr('data-aos'),
    delay: $el.attr('data-aos-delay') || null,
    duration: $el.attr('data-aos-duration') || null,
    offset: $el.attr('data-aos-offset') || null,
    easing: $el.attr('data-aos-easing') || null
  });
});

$('[class*="word"], [class*="char"], [class*="split"], [class*="text-reveal"]').each((_, el) => {
  const $el = $(el);
  if ($el.children().length > 0) {
    animations.textReveal.push({
      parentClasses: ($el.attr('class') || '').split(/\s+/).filter(Boolean),
      childCount: $el.children().length,
      pattern: $el.html().substring(0, 500)
    });
  }
});

$('[data-target], [data-count], [data-value], [class*="counter"], [class*="stat"] .number').each((_, el) => {
  const $el = $(el);
  animations.counters.push({
    classes: ($el.attr('class') || '').split(/\s+/).filter(Boolean),
    text: $el.text().trim(),
    dataTarget: $el.attr('data-target') || null,
    dataCount: $el.attr('data-count') || null,
    dataValue: $el.attr('data-value') || null,
    dataPrefix: $el.attr('data-prefix') || null,
    dataSuffix: $el.attr('data-suffix') || null
  });
});

fs.writeFileSync('extraction/animations.json', JSON.stringify(animations, null, 2));

console.log(`Extracted ${sections.length} sections, ${svgs.length} SVGs, ${animations.wow.length} WOW, ${animations.aos.length} AOS, ${animations.counters.length} counters`);
