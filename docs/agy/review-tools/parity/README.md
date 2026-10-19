# PHP <-> TypeScript wizard-config parity check (reviewer tool)
84 mutated wizard configs (`cases/`) validated by BOTH implementations; results must be identical (ok + sorted unique issue codes).
Run (the api and vite containers must be up):
1. `mkdir -p apps/api/storage/tmp-mut && cp docs/agy/review-tools/parity/cases/*.json apps/api/storage/tmp-mut/`
2. `cp docs/agy/review-tools/parity/run-php.php apps/api/storage/tmp-mut/run.php && docker compose exec -T api php storage/tmp-mut/run.php`
3. `cp docs/agy/review-tools/parity/run-ts.test.ts apps/api/storage/tmp-mut/parity.test.ts && cp docs/agy/review-tools/parity/vitest.config.ts apps/api/storage/tmp-mut/ && docker compose exec -T vite pnpm --filter @aihome/config-schema exec vitest run --root /app/apps/api/storage/tmp-mut`
4. Compare `apps/api/storage/tmp-mut/php-result.txt` with `ts-result.txt` (same keys, same ok/codes). Remove `apps/api/storage/tmp-mut` afterwards.
History: first run found 1 difference (`schemaVersion: 1.0`, JS has no int/float split) -> fixed with `App\Config\Wizard\WizardNumbers`.
