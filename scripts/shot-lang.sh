#!/usr/bin/env bash
# Usage: scripts/shot-lang.sh <ja|en|vi> <width> <height> <step...>   (wrapper of shot-all.sh)
set -uo pipefail
cd "$(dirname "$0")/.."
lang="${1:?lang}"; w="${2:?width}"; h="${3:?height}"; shift 3
SHOT_LANG="$lang" SHOT_W="$w" SHOT_H="$h" exec scripts/shot-all.sh "$@"
