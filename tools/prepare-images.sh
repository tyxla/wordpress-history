#!/bin/sh
# Resizes and re-encodes a source image into src/images/.
#   tools/prepare-images.sh <source-file> <id> <width> [<width> ...]
# Writes <id>-<width>.webp for every width and <id>-<largest>.jpg as a fallback.
# Needs sips (macOS) and cwebp.
set -e
src="$1"; id="$2"; shift 2
out="$(dirname "$0")/../src/images"
tmp="$(mktemp -d)"
largest=0
for w in "$@"; do
  sips -s format png --resampleWidth "$w" "$src" --out "$tmp/$id-$w.png" >/dev/null
  cwebp -quiet -q 78 "$tmp/$id-$w.png" -o "$out/$id-$w.webp"
  [ "$w" -gt "$largest" ] && largest="$w"
done
sips -s format jpeg -s formatOptions 78 "$tmp/$id-$largest.png" --out "$out/$id-$largest.jpg" >/dev/null
rm -rf "$tmp"
