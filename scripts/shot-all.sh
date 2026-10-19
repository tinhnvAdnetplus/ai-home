#!/usr/bin/env bash
# Screenshot the running wizard (dev server on :8080) at the design size 1536x1024.
# Usage: scripts/shot-all.sh          -> docs/design/current/step1.png .. step5.png
#        scripts/shot-all.sh 3        -> only step 3
# Needs Google Chrome (headless). Compare each file with docs/design/0N-*.jpg (same size).
set -uo pipefail
cd "$(dirname "$0")/.."
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
steps=("$@")
[ $# -eq 0 ] && steps=(1 2 3 4 5)
mkdir -p docs/design/current
for n in "${steps[@]}"; do
  out="docs/design/current/step${n}${SHOT_LANG:+-$SHOT_LANG}.png"
  rm -f "$out"
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --window-size=${SHOT_W:-1536},${SHOT_H:-1024} --virtual-time-budget=8000 \
    --user-data-dir="/tmp/aihome-shot-profile-$n" \
    --screenshot="$out" "http://localhost:8080/?lang=${SHOT_LANG:-ja}#/wizard?step=${n}" >/dev/null 2>&1 &
  pid=$!
  for _ in $(seq 1 40); do
    [ -s "$out" ] && break
    sleep 1
  done
  sleep 1
  kill "$pid" >/dev/null 2>&1; pkill -f "aihome-shot-profile-$n" >/dev/null 2>&1
  [ -s "$out" ] && echo "$out" || echo "FAILED step $n"
done
