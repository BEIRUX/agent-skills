# Common Font Paths by Framework

## Table of Contents
- WordPress
- Next.js
- Nuxt/Vue
- Webflow
- Generic/Static Sites
- Google Fonts Fallback

## WordPress

```
/wp-content/themes/{theme-name}/assets/fonts/{file}
/wp-content/themes/{theme-name}/fonts/{file}
/wp-content/uploads/fonts/{file}
/wp-content/plugins/elementor/assets/lib/font-awesome/fonts/{file}
/wp-content/cache/autoptimize/css/{hash}.woff2
```

Font URLs in WordPress are often relative to the theme's stylesheet:
```css
/* In /wp-content/themes/mytheme/style.css */
src: url('fonts/MyFont.woff2')
/* Resolves to: /wp-content/themes/mytheme/fonts/MyFont.woff2 */
```

## Next.js

```
/_next/static/media/{hash}.{ext}
/_next/static/css/{hash}.{ext}
/fonts/{file}
/public/fonts/{file}
```

Next.js optimized fonts often have hashed filenames. The original name may appear in the CSS comment or `font-family` declaration.

## Nuxt/Vue

```
/_nuxt/fonts/{file}
/_nuxt/{hash}.{ext}
/assets/fonts/{file}
/static/fonts/{file}
```

## Webflow

Webflow typically uses inline `@font-face` or loads from:
```
https://uploads-ssl.webflow.com/{site-id}/{file}
https://fonts.googleapis.com/css2?family={name}
```

Webflow custom fonts are hosted on their CDN — download directly from the URL in the CSS.

## Generic / Static Sites

```
/fonts/{file}
/assets/fonts/{file}
/static/fonts/{file}
/css/fonts/{file}
/webfonts/{file}
```

Font Awesome specifically:
```
/webfonts/fa-{type}-{weight}.woff2
/fonts/fontawesome-webfont.woff2
```

## Resolving Relative Font URLs

Font URLs in CSS are relative to the CSS file's location, NOT the HTML file:

```
CSS file: https://example.com/css/style.css
Font ref: url('../fonts/MyFont.woff2')
Resolves: https://example.com/fonts/MyFont.woff2
```

Algorithm:
1. Get the CSS file's URL
2. Strip the filename to get the directory
3. Resolve the relative path from that directory

## Google Fonts Fallback

When a font download fails, find the closest Google Font:

| Original Font Pattern | Google Font Alternative |
|---|---|
| Geometric sans (Gotham, Proxima Nova) | Montserrat, Nunito Sans |
| Humanist sans (Avenir, Gill Sans) | Nunito, Lato |
| Neo-grotesque (Helvetica, Arial) | Inter, Source Sans 3 |
| Slab serif (Rockwell, Memphis) | Roboto Slab, Zilla Slab |
| Modern serif (Didot, Bodoni) | Playfair Display, Cormorant |
| Transitional serif (Times, Georgia) | Merriweather, Lora |
| Monospace | JetBrains Mono, Fira Code |
| Handwritten/Script | Dancing Script, Pacifico |

To find the font name when only a hash filename is available, check the `font-family` declaration in the `@font-face` block.
