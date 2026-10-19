#!/usr/bin/env bash
# Hand ONE task to agy (Antigravity CLI): brief + task spec -> agy -> log in docs/agy/reports/<id>.log
#
# Usage:   scripts/agy-task.sh T0.2                # accept-edits mode, commands limited by agy's allow-list
#          scripts/agy-task.sh T0.2 --sandbox      # additionally sandbox the terminal (may block Docker)
# Env:     AGY_MODEL (default gemini-3.8-flash-high), AGY_TIMEOUT (default 2400s),
#          AGY_NOTE (extra instructions appended to the prompt, e.g. what a previous attempt already did)
#
# agy runs headless in accept-edits mode: file edits are auto-approved, shell commands only if they match
# permissions.allow in ~/.gemini/antigravity-cli/settings.json (a denied command is reported, never bypassed).
set -euo pipefail
cd "$(dirname "$0")/.."

id="${1:?usage: scripts/agy-task.sh <task id, e.g. T0.2> [--sandbox]}"
spec=""
for f in docs/agy/tasks/"${id}"-*.md; do [ -f "$f" ] && spec="$f" && break; done
[ -n "$spec" ] || { echo "No spec found: docs/agy/tasks/${id}-*.md" >&2; exit 1; }

sandbox=()
[ "${2:-}" = "--sandbox" ] && sandbox=(--sandbox)

mkdir -p docs/agy/reports
log="docs/agy/reports/${id}.log"

# nginx/php-cgi của Laragon phải chạy để agy gọi được API trong lúc test
if ! tasklist 2>/dev/null | grep -qi 'php-cgi.exe'; then
  echo "==> php-cgi chưa chạy: bật nginx trong Laragon (Start All) rồi chạy lại." >&2
  exit 1
fi

prompt="$(cat docs/agy/BRIEF.md; printf '\n\n---\n\n'; cat "$spec")"
if [ -n "${AGY_NOTE:-}" ]; then
  prompt="${prompt}"$'\n\n---\n## Note from the reviewer for this attempt\n'"${AGY_NOTE}"
fi
echo "==> agy model=${AGY_MODEL:-gemini-3.8-flash-high} task=${id} spec=${spec} sandbox=${sandbox[*]:-off}"

agy --model "${AGY_MODEL:-gemini-3.8-flash-high}" \
    ${sandbox[@]+"${sandbox[@]}"} \
    --mode accept-edits \
    --print-timeout "${AGY_TIMEOUT:-2400s}" \
    -p "$prompt" 2>&1 | tee "$log"

echo "==> done. Log: $log  — now ask Claude to review ${id}."
