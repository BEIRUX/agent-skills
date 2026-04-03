#!/usr/bin/env node
/**
 * Phase 2: Parse all downloaded CSS + inline styles to extract design tokens.
 *
 * Usage: node scripts/parse-css.js
 * Expects: extraction/css/ directory with downloaded .css files, extraction/tech-stack.json
 * Outputs: extraction/design-tokens.json, extraction/combined.css, extraction/animation-classes.css
 */

const fs = require('fs');
const path = require('path');

const cssDir = path.resolve('extraction/css');
let allCSS = '';

// Combine all downloaded CSS files
if (fs.existsSync(cssDir)) {
  fs.readdirSync(cssDir).forEach(file => {
    if (file.endsWith('.css')) {
      allCSS += fs.readFileSync(path.join(cssDir, file), 'utf8') + '\n';
    }
  });
}

// Include inline styles from tech-stack.json
const techStackPath = path.resolve('extraction/tech-stack.json');
if (fs.existsSync(techStackPath)) {
  const techStack = JSON.parse(fs.readFileSync(techStackPath, 'utf8'));
  if (techStack.inlineStyles && techStack.inlineStyles.length > 0) {
    allCSS += techStack.inlineStyles.join('\n');
  }
}

if (!allCSS.trim()) {
  console.error('WARNING: No CSS content found. Check extraction/css/ and inline styles.');
}

const result = {
  fontFaces: [],
  fontUrls: [],
  fontFamilies: [],
  keyframes: [],
  colors: [],
  breakpoints: [],
  cssVariables: []
};

let match;

// Extract @font-face blocks
const fontFaceRegex = /@font-face\s*\{[^}]+\}/gi;
while ((match = fontFaceRegex.exec(allCSS)) !== null) {
  result.fontFaces.push(match[0]);
  // Extract font URLs within each @font-face
  const urlRegex = /url\(["']?([^"')]+)["']?\)/gi;
  let urlMatch;
  while ((urlMatch = urlRegex.exec(match[0])) !== null) {
    if (!urlMatch[1].startsWith('data:')) {
      result.fontUrls.push(urlMatch[1]);
    }
  }
  // Extract font-family name
  const familyMatch = match[0].match(/font-family\s*:\s*["']?([^"';]+)["']?/i);
  if (familyMatch && !result.fontFamilies.includes(familyMatch[1].trim())) {
    result.fontFamilies.push(familyMatch[1].trim());
  }
}

// Extract @keyframes blocks (handles nested braces)
const kfRegex = /@keyframes\s+([\w-]+)\s*\{/g;
while ((match = kfRegex.exec(allCSS)) !== null) {
  const name = match[1];
  const startIdx = match.index;
  let braceCount = 0;
  let endIdx = match.index + match[0].length;
  for (let i = endIdx - 1; i < allCSS.length; i++) {
    if (allCSS[i] === '{') braceCount++;
    else if (allCSS[i] === '}') {
      braceCount--;
      if (braceCount === 0) {
        endIdx = i + 1;
        break;
      }
    }
  }
  result.keyframes.push(allCSS.substring(startIdx, endIdx));
}

// Extract CSS custom properties (variables)
const varRegex = /--([\w-]+)\s*:\s*([^;]+);/g;
const varsSet = new Set();
while ((match = varRegex.exec(allCSS)) !== null) {
  const key = `--${match[1]}`;
  if (!varsSet.has(key)) {
    varsSet.add(key);
    result.cssVariables.push({ name: key, value: match[2].trim() });
  }
}

// Extract breakpoints from @media queries
const mediaRegex = /@media[^{]*?\b(\d+)px/gi;
const bpSet = new Set();
while ((match = mediaRegex.exec(allCSS)) !== null) {
  bpSet.add(parseInt(match[1]));
}
result.breakpoints = [...bpSet].sort((a, b) => a - b);

// Extract hex colors
const colorSet = new Set();
const hexRegex = /#[0-9a-fA-F]{3,8}\b/g;
while ((match = hexRegex.exec(allCSS)) !== null) {
  colorSet.add(match[0].toLowerCase());
}
// Extract rgb/rgba/hsl/hsla colors
const funcColorRegex = /(rgba?|hsla?)\([^)]+\)/g;
while ((match = funcColorRegex.exec(allCSS)) !== null) {
  colorSet.add(match[0]);
}
result.colors = [...colorSet];

// Write results
fs.writeFileSync('extraction/design-tokens.json', JSON.stringify(result, null, 2));
fs.writeFileSync('extraction/combined.css', allCSS);

// Extract animation-related CSS classes
const animCSS = [];
const animClassRegex = /\.(wow|animated|fadeIn\w*|fadeOut\w*|slideIn\w*|slideOut\w*|zoomIn\w*|zoomOut\w*|bounceIn\w*|bounceOut\w*|rotateIn\w*|flipIn\w*|rollIn|lightSpeedIn\w*|ia-[\w-]+|aos-[\w-]+)[^{]*\{[^}]+\}/gi;
while ((match = animClassRegex.exec(allCSS)) !== null) {
  animCSS.push(match[0]);
}
fs.writeFileSync('extraction/animation-classes.css', animCSS.join('\n\n'));

console.log(`Found: ${result.fontFaces.length} font-faces, ${result.fontUrls.length} font URLs, ${result.keyframes.length} keyframes, ${result.colors.length} colors, ${result.breakpoints.length} breakpoints, ${result.cssVariables.length} CSS variables`);
