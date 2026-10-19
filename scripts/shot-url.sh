#!/usr/bin/env bash
# Screenshot a specific URL at the given or default size (SHOT_W / SHOT_H)
# Usage: scripts/shot-url.sh [url] [out.png] [width] [height]
set -uo pipefail
cd "$(dirname "$0")/.."
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
url="${1:-http://localhost:8080/#/wizard?result=1}"
out="${2:-docs/design/current/result.png}"
w="${3:-${SHOT_W:-1680}}"
h="${4:-${SHOT_H:-815}}"
mkdir -p "$(dirname "$out")"
rm -f "$out"
profile_id="aihome-shot-url-$w-$h-$$"
rm -rf "/tmp/$profile_id"

headless_flag="--headless=new"
if [ "$w" -lt 768 ]; then
  headless_flag="--headless"
fi

"$CHROME" $headless_flag --use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --hide-scrollbars --force-device-scale-factor=1 \
  --window-size="${w},${h}" --virtual-time-budget=8000 \
  --user-data-dir="/tmp/$profile_id" \
  --screenshot="$out" "$url" >/dev/null 2>&1 &

pid=$!
for _ in $(seq 1 40); do
  [ -s "$out" ] && break
  sleep 1
done
sleep 1
kill "$pid" >/dev/null 2>&1; pkill -f "$profile_id" >/dev/null 2>&1
rm -rf "/tmp/$profile_id" >/dev/null 2>&1 || true
[ -s "$out" ] && echo "$out" || echo "FAILED $url"
