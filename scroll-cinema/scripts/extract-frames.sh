#!/usr/bin/env bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# scroll-cinema: Smart Video Frame Extraction
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Usage: extract-frames.sh <video-path> <output-dir> [target-frames]
#
# Analyzes video, applies motion interpolation when source
# has too few frames, extracts as WebP (JPEG fallback),
# and reports the TOTAL_FRAMES constant for app.js.
#
# Defaults: target=150 frames, interpolation threshold=120

set -euo pipefail

VIDEO="${1:?Usage: extract-frames.sh <video-path> <output-dir> [target-frames]}"
OUTPUT_DIR="${2:?Usage: extract-frames.sh <video-path> <output-dir> [target-frames]}"
TARGET_FRAMES="${3:-150}"
INTERP_THRESHOLD=120
MAX_WIDTH=1920

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${GREEN}[scroll-cinema]${NC} $1"; }
warn()  { echo -e "${YELLOW}[scroll-cinema]${NC} $1"; }
error() { echo -e "${RED}[scroll-cinema]${NC} $1" >&2; }

# ── Dependencies ──
command -v ffprobe >/dev/null 2>&1 || { error "ffprobe not found. Install ffmpeg."; exit 1; }
command -v ffmpeg  >/dev/null 2>&1 || { error "ffmpeg not found."; exit 1; }
[[ -f "$VIDEO" ]] || { error "Video not found: $VIDEO"; exit 1; }

# ── Analyze ──
info "Analyzing video..."
WIDTH=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of default=noprint_wrappers=1:nokey=1 "$VIDEO")
HEIGHT=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of default=noprint_wrappers=1:nokey=1 "$VIDEO")
FPS_RAW=$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of default=noprint_wrappers=1:nokey=1 "$VIDEO")
NB_FRAMES=$(ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames -of default=noprint_wrappers=1:nokey=1 "$VIDEO")

# Duration: try stream first, fall back to format
DURATION=$(ffprobe -v error -select_streams v:0 -show_entries stream=duration -of default=noprint_wrappers=1:nokey=1 "$VIDEO")
if [[ -z "$DURATION" || "$DURATION" == "N/A" ]]; then
  DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$VIDEO")
fi

# Parse fractional fps (e.g., 24/1 → 24)
FPS=$(echo "$FPS_RAW" | awk -F'/' '{if(NF==2 && $2!=0) print $1/$2; else print $1}')

# Calculate frame count if nb_frames unavailable
if [[ -z "$NB_FRAMES" || "$NB_FRAMES" == "N/A" ]]; then
  NB_FRAMES=$(echo "$DURATION $FPS" | awk '{printf "%d", $1 * $2}')
fi

info "Source: ${WIDTH}x${HEIGHT}, ${FPS}fps, ${DURATION}s, ${NB_FRAMES} frames"

# ── Strategy ──
NEEDS_INTERP=false
EXTRACT_FPS="$FPS"

if (( NB_FRAMES < INTERP_THRESHOLD )) && (( NB_FRAMES < TARGET_FRAMES )); then
  NEEDS_INTERP=true
  EXTRACT_FPS=$(echo "$TARGET_FRAMES $DURATION" | awk '{printf "%.0f", $1 / $2}')
  info "Below threshold (${NB_FRAMES} < ${INTERP_THRESHOLD}). Interpolating to ~${TARGET_FRAMES} frames at ${EXTRACT_FPS}fps..."
elif (( NB_FRAMES > 300 )); then
  EXTRACT_FPS=$(echo "$TARGET_FRAMES $DURATION" | awk '{printf "%.0f", $1 / $2}')
  info "Too many frames (${NB_FRAMES} > 300). Subsampling to ~${TARGET_FRAMES} at ${EXTRACT_FPS}fps..."
else
  info "Source has ${NB_FRAMES} frames. Extracting at native ${FPS}fps..."
fi

# Cap width
SCALE_W=$WIDTH
if (( WIDTH > MAX_WIDTH )); then
  SCALE_W=$MAX_WIDTH
  info "Capping width: ${WIDTH}px → ${SCALE_W}px"
fi

# ── Build filter chain ──
if [[ "$NEEDS_INTERP" == true ]]; then
  FILTERS="minterpolate=fps=${EXTRACT_FPS}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,scale=${SCALE_W}:-1"
else
  FILTERS="fps=${EXTRACT_FPS},scale=${SCALE_W}:-1"
fi

mkdir -p "$OUTPUT_DIR"

# ── Extract (WebP → JPEG fallback) ──
FORMAT=""
HAS_WEBP=false
ffmpeg -hide_banner -encoders 2>/dev/null | grep -q libwebp && HAS_WEBP=true

if [[ "$HAS_WEBP" == true ]]; then
  info "Extracting as WebP..."
  if ffmpeg -y -i "$VIDEO" -vf "$FILTERS" -c:v libwebp -quality 80 \
    "${OUTPUT_DIR}/frame_%04d.webp" 2>/dev/null; then
    FORMAT="webp"
  else
    warn "WebP failed. Falling back to JPEG..."
  fi
fi

if [[ -z "$FORMAT" ]]; then
  info "Extracting as JPEG..."
  ffmpeg -y -i "$VIDEO" -vf "$FILTERS" -q:v 2 \
    "${OUTPUT_DIR}/frame_%04d.jpg" 2>/dev/null
  FORMAT="jpg"
fi

# ── Report ──
EXTRACTED=$(ls "${OUTPUT_DIR}"/frame_*.${FORMAT} 2>/dev/null | wc -l | tr -d ' ')
TOTAL_SIZE=$(du -sh "$OUTPUT_DIR" | awk '{print $1}')

echo ""
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
info "Extraction complete"
info "  Frames:  ${EXTRACTED}"
info "  Format:  ${FORMAT}"
info "  Size:    ${TOTAL_SIZE}"
info "  Output:  ${OUTPUT_DIR}/"
info ""
info "Set in app.js:"
info "  const TOTAL_FRAMES = ${EXTRACTED};"
info "  img.src = \"frames/frame_\" + ... + \".${FORMAT}\";"
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
