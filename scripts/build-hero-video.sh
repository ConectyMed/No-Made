#!/usr/bin/env sh
# Régénère public/hero/ depuis assets/source/hero-source.mp4.
# Boucle fondue intégrée : sortie = source[1 s → fin] puis fondu de 1 s vers source[0 → 1 s].
# Prérequis : ffmpeg avec libx264 et libwebp (brew install ffmpeg / apt install ffmpeg).
set -eu
FF="${FFMPEG:-ffmpeg}"
SRC="assets/source/hero-source.mp4"
OUT="public/hero"
FADE=1
# Durée de la source moins FADE, moins FADE : offset du fondu dans la première partie.
DUR=$("$FF" -i "$SRC" 2>&1 | sed -n 's/.*Duration: \([0-9:.]*\).*/\1/p' | awk -F: '{print $1*3600+$2*60+$3}')
OFFSET=$(awk -v d="$DUR" -v f="$FADE" 'BEGIN{printf "%.2f", d - 2*f}')
FILTER="[0:v]trim=start=$FADE,setpts=PTS-STARTPTS,fps=24[a];[0:v]trim=start=0:end=$FADE,setpts=PTS-STARTPTS,fps=24[b];[a][b]xfade=transition=fade:duration=$FADE:offset=$OFFSET,format=yuv420p"
mkdir -p "$OUT"
"$FF" -y -hide_banner -loglevel error -i "$SRC" -filter_complex "$FILTER,scale=1280:720[v]" -map "[v]" -an -r 24 -c:v libx264 -preset slow -crf 24 -profile:v high -level 4.0 -pix_fmt yuv420p -movflags +faststart "$OUT/hero-720.mp4"
"$FF" -y -hide_banner -loglevel error -i "$SRC" -filter_complex "$FILTER,scale=960:540[v]" -map "[v]" -an -r 24 -c:v libx264 -preset slow -crf 27 -profile:v main -level 3.1 -pix_fmt yuv420p -movflags +faststart "$OUT/hero-540.mp4"
"$FF" -y -hide_banner -loglevel error -i "$OUT/hero-720.mp4" -c:v libvpx-vp9 -crf 34 -b:v 0 -row-mt 1 -an "$OUT/hero-720.webm"
"$FF" -y -hide_banner -loglevel error -i "$OUT/hero-540.mp4" -c:v libvpx-vp9 -crf 37 -b:v 0 -row-mt 1 -an "$OUT/hero-540.webm"
"$FF" -y -hide_banner -loglevel error -i "$OUT/hero-720.mp4" -frames:v 1 -c:v libwebp -quality 74 "$OUT/hero-poster.webp"
"$FF" -y -hide_banner -loglevel error -i "$OUT/hero-720.mp4" -frames:v 1 -vf scale=640:-1 -c:v libwebp -quality 78 "$OUT/hero-poster-640.webp"
"$FF" -y -hide_banner -loglevel error -i "$OUT/hero-720.mp4" -frames:v 1 -vf scale=32:-1 -c:v libwebp -quality 60 "$OUT/hero-poster-blur.webp"
ls -la "$OUT"
