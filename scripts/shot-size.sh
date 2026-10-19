#!/usr/bin/env bash
# Usage: scripts/shot-size.sh <width> <height> <step...>   (wrapper of shot-all.sh, Japanese)
set -uo pipefail
cd "$(dirname "$0")/.."
w="${1:?width}"; h="${2:?height}"; shift 2
SHOT_W="$w" SHOT_H="$h" exec scripts/shot-all.sh "$@"
