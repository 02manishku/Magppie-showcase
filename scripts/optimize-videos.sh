#!/usr/bin/env bash

# Video Optimization Pipeline for Magppie Showcase
#
# Scans /public/media/raw/videos/ for video files and generates:
#   1. Desktop 1080p H264 (CRF 28) → /public/media/optimized/videos/
#   2. Mobile 720p H264 (CRF 32)   → /public/media/optimized/videos/mobile/
#   3. Poster WebP thumbnail        → /public/media/optimized/videos/posters/
#
# Requires: ffmpeg

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$SCRIPT_DIR")"

RAW_DIR="$ROOT/public/media/raw/videos"
DESK_DIR="$ROOT/public/media/optimized/videos"
MOBILE_DIR="$ROOT/public/media/optimized/videos/mobile"
POSTER_DIR="$ROOT/public/media/optimized/videos/posters"

mkdir -p "$RAW_DIR" "$DESK_DIR" "$MOBILE_DIR" "$POSTER_DIR"

# Check ffmpeg
if ! command -v ffmpeg &> /dev/null; then
  echo "ERROR: ffmpeg not found. Install it first:"
  echo "  Windows: choco install ffmpeg"
  echo "  Mac:     brew install ffmpeg"
  echo "  Linux:   sudo apt install ffmpeg"
  exit 1
fi

echo ""
echo "=== Magppie Video Optimization Pipeline ==="
echo ""

# Find all video files
shopt -s nullglob nocaseglob
VIDEO_FILES=("$RAW_DIR"/*.{mp4,mov,avi,mkv})
shopt -u nullglob nocaseglob

if [ ${#VIDEO_FILES[@]} -eq 0 ]; then
  echo "No videos found in $RAW_DIR"
  echo "Drop your raw videos there and re-run."
  echo ""
  exit 0
fi

echo "Found ${#VIDEO_FILES[@]} videos to process."
echo ""

TOTAL_SRC=0
TOTAL_OPT=0
COUNT=0

format_bytes() {
  local bytes=$1
  if [ "$bytes" -lt 1048576 ]; then
    echo "$(echo "scale=1; $bytes / 1024" | bc)KB"
  else
    echo "$(echo "scale=1; $bytes / 1048576" | bc)MB"
  fi
}

for src in "${VIDEO_FILES[@]}"; do
  filename=$(basename "$src")
  name="${filename%.*}"
  # Sanitize filename
  safe_name=$(echo "$name" | sed 's/[^a-zA-Z0-9._-]/_/g; s/__*/_/g; s/^_//; s/_$//' | tr '[:upper:]' '[:lower:]')

  desk_out="$DESK_DIR/${safe_name}.mp4"
  mobile_out="$MOBILE_DIR/${safe_name}.mp4"
  poster_out="$POSTER_DIR/${safe_name}.webp"

  src_size=$(stat -c%s "$src" 2>/dev/null || stat -f%z "$src" 2>/dev/null)
  COUNT=$((COUNT + 1))

  echo "  [$COUNT/${#VIDEO_FILES[@]}] $filename"

  # Desktop version (1080p, CRF 28)
  if [ ! -f "$desk_out" ] || [ "$src" -nt "$desk_out" ]; then
    ffmpeg -y -i "$src" \
      -c:v libx264 -crf 28 -preset slow \
      -vf "scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease" \
      -pix_fmt yuv420p \
      -c:a aac -b:a 128k -ac 1 \
      -movflags +faststart \
      "$desk_out" 2>/dev/null
    echo "    Desktop: done"
  else
    echo "    Desktop: skipped (up to date)"
  fi

  # Mobile version (720p, CRF 32)
  if [ ! -f "$mobile_out" ] || [ "$src" -nt "$mobile_out" ]; then
    ffmpeg -y -i "$src" \
      -c:v libx264 -crf 32 -preset slow \
      -vf "scale='min(1280,iw)':'min(720,ih)':force_original_aspect_ratio=decrease" \
      -pix_fmt yuv420p \
      -c:a aac -b:a 96k -ac 1 \
      -movflags +faststart \
      "$mobile_out" 2>/dev/null
    echo "    Mobile:  done"
  else
    echo "    Mobile:  skipped (up to date)"
  fi

  # Poster thumbnail (frame at 1s)
  if [ ! -f "$poster_out" ] || [ "$src" -nt "$poster_out" ]; then
    ffmpeg -y -i "$src" -ss 00:00:01 -vframes 1 \
      -vf "scale=800:-1" \
      "$poster_out" 2>/dev/null
    echo "    Poster:  done"
  else
    echo "    Poster:  skipped (up to date)"
  fi

  desk_size=$(stat -c%s "$desk_out" 2>/dev/null || stat -f%z "$desk_out" 2>/dev/null || echo 0)
  mobile_size=$(stat -c%s "$mobile_out" 2>/dev/null || stat -f%z "$mobile_out" 2>/dev/null || echo 0)

  if [ "$src_size" -gt 0 ] && [ "$desk_size" -gt 0 ]; then
    reduction=$(echo "scale=0; (1 - $desk_size / $src_size) * 100" | bc)
    echo "    $(format_bytes $src_size) -> $(format_bytes $desk_size) (desktop) | $(format_bytes $mobile_size) (mobile) | ${reduction}% reduction"
  fi

  TOTAL_SRC=$((TOTAL_SRC + src_size))
  TOTAL_OPT=$((TOTAL_OPT + desk_size))
  echo ""
done

echo "=== Summary ==="
echo "  Processed: $COUNT videos"
if [ "$TOTAL_SRC" -gt 0 ]; then
  echo "  Total raw:       $(format_bytes $TOTAL_SRC)"
  echo "  Total optimized: $(format_bytes $TOTAL_OPT) (desktop)"
  reduction=$(echo "scale=0; (1 - $TOTAL_OPT / $TOTAL_SRC) * 100" | bc)
  echo "  Overall reduction: ${reduction}%"
fi
echo ""
echo "Done!"
echo ""
