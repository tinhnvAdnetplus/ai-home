#!/usr/bin/env bash
# Same checks as `make check`, but the independent lanes run in parallel (about 3x faster).
# Usage: scripts/check-fast.sh        (exit 0 only if every lane passes; failing lanes print their last lines)
set -uo pipefail
cd "$(dirname "$0")/.."

dir="$(mktemp -d)"
PHP_BIN="${PHP_BIN:-$(ls -d /c/laragon/bin/php/php-8.3*/php.exe 2>/dev/null | head -1)}"
php_e="\"$PHP_BIN\""   # PHP của Laragon (ghi đè bằng biến môi trường PHP_BIN nếu cần)
js_e='pnpm --filter'

lane() { # name, command...
  local name="$1"; shift
  ( local s=$SECONDS; "$@" >"$dir/$name.log" 2>&1; echo "$?" >"$dir/$name.rc"; echo "$((SECONDS - s))" >"$dir/$name.sec" ) &
}

lane php        bash -c "cd apps/api && $php_e vendor/bin/pint --test && $php_e vendor/bin/phpstan analyse && $php_e vendor/bin/pest --parallel"
lane app-lint   bash -c "$js_e aihome-app lint && $js_e aihome-app format:check"
lane app-types  bash -c "$js_e aihome-app typecheck"
lane app-test   bash -c "$js_e aihome-app test"
lane pkg        bash -c "$js_e @aihome/config-schema lint && $js_e @aihome/config-schema format:check && $js_e @aihome/config-schema typecheck && $js_e @aihome/config-schema test"
wait

status=0
for name in php app-lint app-types app-test pkg; do
  rc="$(cat "$dir/$name.rc" 2>/dev/null || echo 99)"
  printf '%-10s %s (%ss)\n' "$name" "$([ "$rc" = 0 ] && echo PASS || echo "FAIL rc=$rc")" "$(cat "$dir/$name.sec" 2>/dev/null || echo ?)"
  if [ "$rc" != 0 ]; then status=1; sed 's/\x1b\[[0-9;]*m//g' "$dir/$name.log" | tail -25; fi
done
# one-line test totals
grep -hE "Tests:|^ +Tests +[0-9]+ passed" "$dir"/php.log "$dir"/app-test.log "$dir"/pkg.log 2>/dev/null | sed 's/\x1b\[[0-9;]*m//g' | sed 's/^ *//'
rm -rf "$dir"
exit "$status"
