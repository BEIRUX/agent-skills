#!/usr/bin/env bash
# Phase 7: Verify the build — check for broken asset references.
#
# Usage: bash scripts/verify-build.sh
# Run from the project root directory.

set -euo pipefail

echo "=== Site Replicator Build Verification ==="
echo ""

ERRORS=0
WARNINGS=0

# Check index.html exists
if [ ! -f "index.html" ]; then
  echo "❌ ERROR: index.html not found"
  ((ERRORS++))
fi

# Check style.css exists
if [ ! -f "src/style.css" ]; then
  echo "❌ ERROR: src/style.css not found"
  ((ERRORS++))
fi

# Check main.js exists
if [ ! -f "src/main.js" ]; then
  echo "❌ ERROR: src/main.js not found"
  ((ERRORS++))
fi

# Check for broken image references in HTML
echo "--- Checking image references in HTML ---"
if [ -f "index.html" ]; then
  grep -oP 'src="([^"]*\.(png|jpg|jpeg|gif|svg|webp|avif))"' index.html 2>/dev/null | sed 's/src="//;s/"//' | while read -r file; do
    if [[ "$file" != http* ]] && [[ "$file" != data:* ]]; then
      # Resolve relative to project root
      resolved="$file"
      if [[ "$file" == ./* ]]; then
        resolved="${file:2}"
      fi
      if [ ! -f "$resolved" ] && [ ! -f "src/$resolved" ]; then
        echo "⚠️  MISSING IMAGE: $file"
        ((WARNINGS++)) 2>/dev/null || true
      fi
    fi
  done
fi

# Check for broken CSS asset references
echo "--- Checking CSS asset references ---"
if [ -f "src/style.css" ]; then
  grep -oP "url\(['\"]?([^'\")\s]+)['\"]?\)" src/style.css 2>/dev/null | sed "s/url(//;s/)//;s/['\"]//g" | while read -r file; do
    if [[ "$file" != http* ]] && [[ "$file" != data:* ]] && [[ "$file" != \#* ]]; then
      if [ ! -f "src/$file" ] && [ ! -f "$file" ]; then
        echo "⚠️  MISSING CSS ASSET: $file"
        ((WARNINGS++)) 2>/dev/null || true
      fi
    fi
  done
fi

# Check for downloaded assets
echo ""
echo "--- Asset counts ---"
IMG_COUNT=$(find src/assets/images -type f 2>/dev/null | wc -l | tr -d ' ')
VID_COUNT=$(find src/assets/videos -type f 2>/dev/null | wc -l | tr -d ' ')
FONT_COUNT=$(find src/assets/fonts -type f 2>/dev/null | wc -l | tr -d ' ')
SVG_COUNT=$(find src/assets/svg -type f 2>/dev/null | wc -l | tr -d ' ')

echo "  Images: $IMG_COUNT"
echo "  Videos: $VID_COUNT"
echo "  Fonts:  $FONT_COUNT"
echo "  SVGs:   $SVG_COUNT"

# Check for empty asset files (failed downloads)
echo ""
echo "--- Checking for empty/failed downloads ---"
find src/assets -type f -empty 2>/dev/null | while read -r file; do
  echo "⚠️  EMPTY FILE (likely failed download): $file"
  ((WARNINGS++)) 2>/dev/null || true
done

# Check failed-downloads log
if [ -f "extraction/failed-downloads.txt" ]; then
  FAIL_COUNT=$(wc -l < extraction/failed-downloads.txt | tr -d ' ')
  if [ "$FAIL_COUNT" -gt 0 ]; then
    echo "⚠️  $FAIL_COUNT failed downloads logged in extraction/failed-downloads.txt"
  fi
fi

# Check package.json and vite
echo ""
echo "--- Project setup ---"
if [ -f "package.json" ]; then
  echo "✅ package.json exists"
else
  echo "❌ package.json missing"
  ((ERRORS++))
fi

if [ -d "node_modules" ]; then
  echo "✅ node_modules installed"
else
  echo "⚠️  node_modules not found — run npm install"
fi

echo ""
echo "=== Verification complete ==="
echo "Errors: $ERRORS | Warnings: check output above"
echo ""
echo "Next: run 'npm run dev' and visually verify in browser."
