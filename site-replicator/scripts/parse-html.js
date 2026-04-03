#!/usr/bin/env node
/**
 * Phase 0: Parse raw HTML to detect tech stack, extract stylesheet/script URLs,
 * inline styles, framework signatures, and animation library usage.
 *
 * Usage: node scripts/parse-html.js
 * Expects: extraction/raw.html
 * Outputs: extraction/tech-stack.json, extraction/stylesheet-urls.txt
 */

const fs = require('fs');
const path = require('path');

const htmlPath = path.resolve('extraction/raw.html');
if (!fs.existsSync(htmlPath)) {
  console.error('ERROR: extraction/raw.html not found. Fetch the page first.');
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, 'utf8');

const result = {
  stylesheets: [],
  scripts: [],
  metaGenerator: null,
  framework: 'Vanilla HTML/CSS/JS',
  inlineStyles: [],
  animations: {},
  jquery: false,
  isSPAShell: false
};

// Detect SPA shell — minimal body content
const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
if (bodyMatch) {
  const bodyContent = bodyMatch[1].replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<\/?[^>]+>/g, '').trim();
  if (bodyContent.length < 50) {
    result.isSPAShell = true;
  }
}

// Extract meta generator
const metaGen = html.match(/<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)["']/i);
if (metaGen) result.metaGenerator = metaGen[1];

// Extract stylesheet URLs
const cssRegex = /<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi;
let match;
while ((match = cssRegex.exec(html)) !== null) {
  result.stylesheets.push(match[1]);
}
// Also catch href before rel
const cssRegex2 = /<link[^>]+href=["']([^"']+\.css[^"']*)["'][^>]*rel=["']stylesheet["']/gi;
while ((match = cssRegex2.exec(html)) !== null) {
  if (!result.stylesheets.includes(match[1])) {
    result.stylesheets.push(match[1]);
  }
}

// Extract script URLs
const jsRegex = /<script[^>]+src=["']([^"']+)["']/gi;
while ((match = jsRegex.exec(html)) !== null) {
  result.scripts.push(match[1]);
}

// Extract inline styles
const inlineRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
while ((match = inlineRegex.exec(html)) !== null) {
  result.inlineStyles.push(match[1]);
}

// Detect framework
if (html.includes('__NEXT_DATA__')) result.framework = 'Next.js';
else if (html.includes('__NUXT__')) result.framework = 'Nuxt';
else if (html.includes('data-wf-')) result.framework = 'Webflow';
else if (html.includes('wp-content')) result.framework = 'WordPress';
else if (html.includes('data-reactroot')) result.framework = 'React';
else if (html.includes('data-svelte')) result.framework = 'Svelte';
else if (html.includes('ng-app') || html.includes('ng-version')) result.framework = 'Angular';

// Detect animation libraries
result.animations = {
  gsap: result.scripts.some(s => /gsap|greensock/i.test(s)),
  wow: html.includes('class="wow') || html.includes("class='wow"),
  aos: html.includes('data-aos'),
  lottie: result.scripts.some(s => /lottie|bodymovin/i.test(s)),
  animateCSS: result.stylesheets.some(s => /animate\.css|animate\.min\.css/i.test(s))
};

// Detect jQuery
result.jquery = result.scripts.some(s => /jquery/i.test(s));

// Write results
fs.mkdirSync('extraction', { recursive: true });
fs.writeFileSync('extraction/tech-stack.json', JSON.stringify(result, null, 2));
fs.writeFileSync('extraction/stylesheet-urls.txt', result.stylesheets.join('\n'));

console.log(JSON.stringify(result, null, 2));

if (result.isSPAShell) {
  console.warn('\n⚠️  WARNING: This appears to be a SPA shell with no server-rendered content.');
  console.warn('   The HTML body is nearly empty. This site likely renders via JavaScript.');
  console.warn('   Consider using a Playwright-based approach instead.');
}
