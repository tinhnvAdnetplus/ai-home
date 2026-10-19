# Configuration Publishing & CLI Operations

This guide describes how configuration documents (such as the dynamic wizard schema) are authored, exported, published, and consumed across the AI HOME PLATFORM.

---

## 1. Overview & Architecture

Per `docs/CODING_CONVENTION.md` §7, all user-facing forms, options, rules, and parameters are config-driven and stored in the database.
Configurations follow a versioned lifecycle:
- **Draft (`status = 'draft'`)**: Work-in-progress edits by administrators or CLI tooling.
- **Published (`status = 'published'`)**: Immutable published snapshot with an incrementing integer version number (`v1`, `v2`, ...).
- **Public Bundle (`GET /api/v1/config/bundle`)**: Aggregates all published configuration documents with an HTTP ETag for caching.
- **Client Fallback (`useWizardConfig`)**: React runtime renders bundled TypeScript defaults immediately on first paint, silently falling back if the database/API is unavailable or invalid.

---

## 2. Exporting Default Configuration from Code

The canonical bundled configuration is maintained in TypeScript (`apps/api/resources/js/features/wizard/data/default-wizard.ts`) and validated by `@aihome/config-schema`.

To export this bundled default to a JSON file:

```bash
# Inside the vite container or monorepo root:
pnpm --filter @aihome/config-schema exec tsx scripts/export-default-wizard.ts
```

This script writes `apps/api/storage/app/default-wizard.json` using `serializeWizardConfig`, guaranteeing canonical key sorting and deterministic formatting.

---

## 3. Publishing Configuration via Artisan

The backend provides the artisan command `config:publish-file` to validate and publish configuration JSON files through the domain action pipeline (`SaveConfigDraft` and `PublishConfigDraft`).

### Command Signature

```bash
php artisan config:publish-file {key} {file} {--label=}
```

### Arguments & Options
- `key`: The configuration document key registered in `App\Config\ConfigDocumentRegistry` (e.g. `wizard`).
- `file`: Path to the JSON file (relative to the Laravel app root `apps/api`, or an absolute path).
- `--label`: (Optional) Human-readable label for this published version.

### Example: Publishing the Default Wizard

```powershell
# Run from the repository root (Laragon task runner):
.\laragon\dev.ps1 artisan config:publish-file wizard storage/app/default-wizard.json --label="Default Wizard v1"
```

Expected output:
```text
Published configuration 'wizard' as version 1.
```

---

## 4. Validation Rules & Safety Guards

Before a configuration is saved and published, `config:publish-file` enforces strict safety constraints via `WizardConfigValidator`:
1. **Registered Document Key**: The key must exist in `ConfigDocumentRegistry`.
2. **Payload Size**: File size must not exceed 1 MB (`WizardConstants::MAX_JSON_SIZE_BYTES`).
3. **JSON Structure**: Root element must be a valid JSON object matching the `@aihome/config-schema` specification.
4. **Structural Limits**: Max 20 steps, max 20 sections per step, max 150 fields total, max 20 options per field.
5. **Cross-Validation**: Unique step/section/field keys, valid condition expressions (restricted JSON Logic), and registered planner binding keys (`bindingKeySchema`).
6. **Draft Cleanup**: Any existing uncommitted draft for the key is safely discarded before publishing.
7. **Audit Logging**: A new version record is persisted in `config_versions` with SHA-256 payload hash and an audit trail entry.

---

## 5. Verification via API Bundle

Once published, verify that the configuration is included in the public bundle:

```bash
curl -s http://localhost:8080/api/v1/config/bundle | head -c 300
```

Sample response:
```json
{"etag":"\"...\"","configs":{"wizard":{"version":1,"schemaVersion":1,"publishedAt":"2026-10-12T...","payload":{"schemaVersion":1,"steps":[...]}}}}
```

If no configuration has been published yet, `/api/v1/config/bundle` returns `{"etag":"...","configs":{}}`.

---

## 6. Client Runtime & Dev Switches

The frontend consumes the configuration via `useWizardConfig`:
- **First Paint**: Renders the bundled default (`validatedDefaultWizard`) immediately without blocking.
- **Background Fetch**: Queries `/api/v1/config/bundle` via TanStack Query.
- **Safe Swap**: Swaps to the API configuration only if the API config differs AND the user has not started answering yet. If the user has started answering, the active configuration is preserved for the visit to prevent draft loss.
- **Silent Fallback**: Falls back to the bundled default on network errors, 404s, or schema validation failures.

### Environment Switch (`VITE_CONFIG_SOURCE`)
Set `VITE_CONFIG_SOURCE` in `.env`:
- `auto` (default): Attempts to fetch published configuration from the API bundle; falls back to bundled default if unavailable or invalid.
- `bundled`: Strictly uses the bundled default; disables API bundle queries.
- `api`: Explicitly requests the API bundle.
