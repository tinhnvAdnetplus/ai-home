# @aihome/config-schema

`@aihome/config-schema` is the single source of truth for all admin-managed configurations in the AI HOME PLATFORM. It defines strict Zod schemas, validation logic, cross-validation rules, and capability binding registries for configuration structures.

---

## 1. Architectural Overview & Later Tasks

In line with the project's config-driven architectural rule (see `docs/CODING_CONVENTION.md` §7), all dynamic forms and parameters are defined as schemas in TypeScript rather than being hardcoded into application code.

### Downstream Integration:
- **T1.2 (JSON Schema Export)**: Generates draft-07 JSON Schemas from `@aihome/config-schema` to validate configuration payloads on the Laravel backend in PHP.
- **T1.3 & T1.4 (Draft & Publishing Lifecycle)**: Stores versioned configurations in the `configs` database table with audit logs and single-step rollbacks.
- **T1.5 (React Runtime)**: Consumes published configuration bundles via TanStack Query and dynamically renders wizard steps.
- **T1.6 (Condition Evaluator)**: Evaluates field visibility and disabled states using the restricted JSON Logic AST defined in this package.
- **T1.8 (Admin Editor)**: Builds the visual schema builder and real-time preview component.

---

## 2. Configuration Model

### Hierarchy:
```
WizardConfig (schemaVersion: 1)
 └── Step[] (max 20)
      ├── key (^[a-z][a-z0-9_]{0,47}$)
      ├── title (ja required, en/vi optional)
      ├── subtitle? (localizedText)
      ├── icon? (home, map-pin, layout-grid, users, palette, etc.)
      └── Section[] (max 20 per step)
           ├── key
           ├── title (localizedText)
           ├── description? (localizedText)
           └── Field[] (max 150 across wizard)
```

### Supported Field Types:
1. `text`: Single-line text input with optional `maxLength` (1..500) and `placeholder`.
2. `textarea`: Multi-line text input with optional `maxLength` (1..2000), `showCounter`, and `placeholder`.
3. `number`: Numeric input with optional `min`, `max`, `step` (> 0), `unit`, and `allowedUnits`.
4. `range`: Slider input with required `min`, `max`, and `step` (> 0).
5. `select`: Dropdown selection with `options: Option[]`.
6. `radio`: Radio button group with `options: Option[]`.
7. `checkbox_group`: Multi-select group with `options: Option[]`, `minSelected?`, `maxSelected?`.
8. `image_select`: Visual choice card group with `options: ImageSelectOption[]` (each with `image: MediaRef`), and `multiple: boolean`.
9. `boolean`: Switch / toggle input.
10. `upload`: File upload specification with `accept` MIME types, `maxFiles` (1..10), and `maxSizeMb` (1..20).

### Primitives:
- `localizedTextSchema`: Object containing required `ja` (trimmed, 1..500 chars) and optional `en`, `vi`. Other keys are strictly forbidden.
- `keySchema`: Regex `^[a-z][a-z0-9_]{0,47}$` with denial of prototype-pollution keys (`constructor`, `prototype`, `__proto__`, etc.).
- `bindingKeySchema`: Dot.case regex `^[a-z][a-zA-Z0-9]*(\.[a-z][a-zA-Z0-9]*)*$`, max length 64.
- `mediaRefSchema`: Object `{ mediaId: string (1..64), alt: LocalizedText }`.

---

## 3. Restricted JSON Logic (Condition Schema)

Conditions for `visibleWhen` and `disabledWhen` are stored as pure JSON data:
- **Literals**: String (up to 200 chars), finite number, boolean, null.
- **Variables**: `{ "var": "<fieldKey>" }`.
- **Operators**: Exactly one key among `and`, `or`, `!`, `==`, `!=`, `<`, `<=`, `>`, `>=`, `in`.
- **Limits**:
  - Maximum AST depth: 6 levels.
  - Maximum total nodes in AST: 60 nodes.
  - In-operator right-side array: scalar array of at most 50 elements.

### Condition Semantics

Evaluation uses strict semantics rather than JavaScript/JSON-Logic loose coercion:
- **Values**: An answer value is strictly typed as `string | number | boolean | null | string[]`. Any other types (objects, `NaN`, `Infinity`, functions, nested arrays, arrays with > 100 items, strings > 2000 characters) are normalized to `null`. Missing answers and `undefined` are treated as `null`.
- **Variable Access (`{ "var": key }`)**: Reads ONLY own properties of the answers object via `Object.hasOwn`. Inherited or prototype properties (e.g. `toString`, `constructor`, `__proto__`) are never read. Hostile or throwing getters safely yield `null`.
- **Strict Equality (`==`, `!=`)**: Strict equality without coercion (`1 == "1"` is false, `true == 1` is false, `0 == false` is false, `"" == null` is false). A missing variable equals `null` (`null == missing` is true). Arrays are compared element-by-element in exact sequence order.
- **Relational Comparisons (`<`, `<=`, `>`, `>=`)**: Evaluates to `true` ONLY when BOTH operands are finite numbers and the arithmetic comparison holds. If either side is a string, boolean, null, array, NaN, or Infinity, the comparison strictly returns `false` (no string or cross-type comparison).
- **In Inclusion (`in`)**: `{ "in": [needle, haystack] }`. Haystack must be an array literal or a variable resolving to `string[]` or an array of scalars. Returns `true` if and only if some element in haystack strictly equals (`===`) needle. If haystack is not an array (e.g. string, number, null), evaluation returns `false` (no substring matching).
- **Logical Operators (`and`, `or`, `!`)**: Operate over boolean truthiness.
  - Falsy values: `false`, `null`, `0`, `NaN`-like, `""` (empty string), `[]` (empty array).
  - Truthy values: everything else (e.g. `true`, non-zero numbers, non-empty strings, non-empty arrays).
- **Top-level Evaluation**: Top-level literal or variable conditions are coerced by truthiness. `evaluateCondition` is a total function that always returns a `boolean` and never throws. Recursion depth (<= 8) and node count (<= 80) are defensively guarded, returning `false` beyond limits.

### Wizard State Resolution & Cascading Cleanup

`resolveWizardState(wizard, answers)` computes visibility, disabled states, disabled options, and missing required fields:
- **Field Visibility**: A field is visible iff its `visibleWhen` is absent or evaluates to `true`. Visibility is resolved per field.
- **Disabled Options & Cascading Drop**: When an option becomes disabled (via option `disabledWhen`), any selected value is removed from `checkbox_group` selections or dropped entirely for single-choice fields (`select`, `radio`, `image_select`).
- **Cascading Fixpoint**: Hiding a field immediately prunes its answer. Because other fields may depend on that answer, state resolution iterates up to `totalFields + 1` passes until reaching a stable fixpoint.
- **Order Independence & Immutability**: The resolved state is completely independent of field declaration order, and the input `answers` object is never mutated.
- **Example (平屋 vs 2階建て)**:
  ```json
  // Initial answers: customer originally selected 2階建て with a 2nd floor toilet:
  { "floor_count": "two_story", "second_floor_toilet": "washlet" }

  // Customer switches floor_count to 平屋 (single_story):
  // "second_floor_toilet" has visibleWhen: { "==": [{ "var": "floor_count" }, "two_story"] }
  // resolveWizardState resolves "second_floor_toilet" as hidden (visible: false)
  // and cascades by dropping its stale answer:
  // Returned answers: { "floor_count": "single_story" }
  ```


---

## 4. Planner Binding Registry

The binding registry (`src/binding-registry.ts`) defines all architectural planner constraints that the engine supports. An admin question does not magically change the architectural plan unless its answer is mapped via `binding` to an understood planner key.

Supported planner types: `number`, `string`, `boolean`, `string[]`.

Examples:
- `site.frontage` (`number`): Road frontage in meters.
- `site.roadSide` (`string`): Road orientation (北, 東, 南, 西).
- `building.targetArea` (`number`): Target floor area in tsubo.
- `building.floors` (`number`): Number of stories (1 or 2).
- `rooms.roomTypes` (`string[]`): Types of rooms requested.

---

## 5. Issue Codes Reference

When `parseWizardConfig` validates a configuration, all discrepancies are collected and returned with precise paths and codes:

### `SCHEMA_INVALID`
Input does not match the basic Zod structural schema.
```json
{ "schemaVersion": 2, "steps": [] }
```

### `DUPLICATE_KEY`
Step, section, field, or option value keys are duplicated. Field keys must be globally unique across the entire wizard.
```json
// Two fields in different sections with key "frontage"
{ "type": "text", "key": "frontage" }
```

### `UNKNOWN_FIELD_REF`
A condition refers to a field key that does not exist in the wizard.
```json
{ "visibleWhen": { "var": "non_existent_field" } }
```

### `SELF_REFERENCE`
A field's condition depends on its own value.
```json
{ "key": "has_solar", "visibleWhen": { "var": "has_solar" } }
```

### `CONDITION_CYCLE`
Cyclic dependency between two or more fields (e.g., A depends on B and B depends on A).
```json
// Field A: { "visibleWhen": { "var": "field_b" } }
// Field B: { "visibleWhen": { "var": "field_a" } }
```

### `UNKNOWN_BINDING`
Field specifies a `binding` key not present in `BINDING_REGISTRY`.
```json
{ "type": "number", "binding": "unsupported.customKey" }
```

### `BINDING_TYPE_MISMATCH`
Field type is incompatible with the binding's expected data type (e.g. text field bound to number key).
```json
{ "type": "text", "binding": "site.frontage" } // expects number
```

### `DUPLICATE_BINDING`
The same planner binding key is bound to multiple wizard fields.
```json
// Field 1: { "binding": "site.frontage" }
// Field 2: { "binding": "site.frontage" }
```

### `DEFAULT_NOT_IN_OPTIONS`
A select, radio, or checkbox field default value does not exist among its defined options.
```json
{ "type": "select", "options": [{ "value": "a" }], "defaultValue": "b" }
```

### `DEFAULT_OUT_OF_RANGE`
A numeric or range field's `defaultValue` is less than `min` or greater than `max`.
```json
{ "type": "number", "min": 10, "max": 50, "defaultValue": 60 }
```

### `RANGE_INVALID`
A numeric field specifies `min > max` or `step <= 0`.
```json
{ "type": "range", "min": 100, "max": 50, "step": 1 }
```

### `SELECTION_LIMITS_INVALID`
`minSelected > maxSelected`, or selection limits exceed the number of available options.
```json
{ "type": "checkbox_group", "options": [{ "value": "opt1" }], "minSelected": 2 }
```

### `EMPTY_OPTIONS`
A choice field (`select`, `radio`, `checkbox_group`, `image_select`) defines 0 options.
```json
{ "type": "select", "options": [] }
```

### `LIMIT_EXCEEDED`
System limits are exceeded: > 20 steps, > 20 sections per step, > 150 fields total, or > 60 options per field.

---

## 6. Public API Functions

- `parseWizardConfig(input: unknown): ParseWizardResult`
  Never throws. Validates against Zod schema and runs comprehensive cross-validation.
- `serializeWizardConfig(config: WizardConfig): string`
  Produces deterministic JSON string with alphabetically sorted object keys.
- `parseCondition(input: unknown): Condition`
  Validates a restricted JSON Logic condition.
- `collectConditionVars(condition: Condition): string[]`
  Recursively extracts all unique field variable names in sorted order.
- `sampleWizard: WizardConfig`
  A reference valid 2-step configuration exercising all 10 field types.
- `normalizeAnswer(value: unknown): AnswerValue`
  Normalizes raw customer inputs into valid answer values (strings, finite numbers, booleans, string arrays <= 100 items), coercing invalid/oversized/nested data to null.
- `evaluateCondition(condition: Condition, answers: Readonly<Record<string, unknown>>): boolean`
  Total, non-throwing condition evaluator with strict comparison semantics and recursion/node guards.
- `evaluateConditionSafe(input: unknown, answers: unknown): EvaluateSafeResult`
  Safely parses condition with Zod schema and answers object before evaluating.
- `resolveWizardState(wizard: WizardConfig, answers: Record<string, unknown>): WizardState`
  Computes field visibility, disabled states, disabled options, prunes hidden/disabled answers via cascading fixpoint, and identifies missing required fields.

---

## 7. Cross-Language Validation Contract

Production deployments execute on Laravel (PHP 8.2) without Node.js on the server. To ensure admin-submitted wizard configurations are validated with identical precision across both TypeScript (client/builder) and PHP (API ingestion in Task T1.4), validation is split into two complementary layers:

### 1. Layer 1: Structural Rules (JSON Schema Draft-07)
Exported artifact: `apps/api/resources/config-schema/wizard.schema.json`.
- Generated deterministically from the Zod schemas using `zod-to-json-schema` and post-processed for strict objects (`additionalProperties: false`).
- Expresses structural shape, required properties, property types, and expressible cardinality limits:
  - Maximum steps: 20 (`MAX_STEPS`).
  - Maximum sections per step: 20 (`MAX_SECTIONS_PER_STEP`).
  - Maximum fields per section: 150 (`MAX_FIELDS_TOTAL`).
  - Maximum options per choice field: 60 (`MAX_OPTIONS_PER_FIELD`).
  - Maximum items in `in` operator haystack: 50 (`MAX_IN_ITEMS`).
  - Key regex pattern: `^(?!(?:constructor|prototype|__proto__|proto|hasownproperty|tostring|valueof|isprototypeof|propertyisenumerable|tolocalestring)$)[a-z][a-z0-9_]{0,47}(?![\\r\\n])$`. Enforces lowercase alphanumeric/underscore format (1-48 chars), forbids prototype pollution keywords, and denies trailing newlines in both ECMAScript and PCRE.
  - Planner binding key pattern: `^[a-z][a-zA-Z0-9]*(\\.[a-z][a-zA-Z0-9]*)*(?![\\r\\n])$`, max 64 chars.
  - Media ID pattern: `^[A-Za-z0-9_-]{1,64}(?![\\r\\n])$`.

### 2. Pre-Validation Normalization Step
Zod automatically strips whitespace using `.trim()` on localized text properties before evaluating length constraints (`min(1).max(500)`). Standard JSON Schema draft-07 validators evaluate raw untrimmed string lengths.
- **Contract Requirement**: Before feeding an admin-submitted configuration JSON payload into the JSON Schema validator, the PHP backend MUST perform a normalization pass that trims leading and trailing whitespace on all localized text strings (`ja`, `en`, `vi`).
- Localized text in the JSON Schema requires `\S` (at least one non-whitespace character) and `minLength: 1`, `maxLength: 500`.

### 3. Layer 2: Cross-Validation Rules Re-Implemented in PHP
Rules that cannot be expressed in standard JSON Schema must be evaluated by the PHP backend in Task T1.4:
1. `DUPLICATE_KEY`:
   - Step keys must be unique within `steps`.
   - Section keys must be unique within each step's `sections`.
   - Field keys must be globally unique across all steps in the wizard.
   - Option values must be unique within each field's `options`.
2. `UNKNOWN_FIELD_REF`:
   - All `{ "var": "<fieldKey>" }` references in `visibleWhen` and `disabledWhen` (fields and options) must resolve to an existing field key in the wizard.
3. `SELF_REFERENCE`:
   - A field cannot reference its own key in its `visibleWhen` or `disabledWhen` conditions.
4. `CONDITION_CYCLE`:
   - Direct 2-cycles (A -> B -> A) and indirect multi-node cycles (A -> B -> C -> A) must be detected using depth-first search (DFS) with recursion stack tracking.
5. `UNKNOWN_BINDING`:
   - Any specified field `binding` must exist in `BINDING_REGISTRY`.
6. `BINDING_TYPE_MISMATCH`:
   - The field type must match the capability's expected value type:
     - `number`: `number`, `range`.
     - `string`: `text`, `textarea`, `select`, `radio`, or `image_select` with `multiple: false`.
     - `boolean`: `boolean`.
     - `string[]`: `checkbox_group`, or `image_select` with `multiple: true`.
7. `DUPLICATE_BINDING`:
   - A capability binding key can be bound to at most one field across the entire wizard.
8. `DEFAULT_NOT_IN_OPTIONS`:
   - For `select`, `radio`, `checkbox_group`, and `image_select`, `defaultValue` must be a subset of the defined option values.
9. `DEFAULT_OUT_OF_RANGE`:
   - For `number` and `range` fields, `defaultValue` must be between `min` and `max`.
10. `RANGE_INVALID`:
    - For `number` and `range` fields, `min <= max` and `step > 0`.
11. `SELECTION_LIMITS_INVALID`:
    - For `checkbox_group` and `image_select`: `0 <= minSelected <= maxSelected <= options.length`, and `maxSelected >= 1`.
12. `EMPTY_OPTIONS`:
    - Choice fields (`select`, `radio`, `checkbox_group`, `image_select`) must define at least one option.
13. `LIMIT_EXCEEDED`:
    - Steps <= 20, sections per step <= 20, options per field <= 60, total fields across wizard <= 150.
14. Condition AST Metrics:
    - Maximum AST depth <= 6 (`MAX_CONDITION_DEPTH`).
    - Maximum AST node count <= 60 (`MAX_CONDITION_NODES`).

### 4. Golden Fixture Corpus
Artifacts directory: `apps/api/resources/config-schema/fixtures/wizard/<nn>-<slug>.json`.
Each fixture file adheres to the schema:
```json
{
  "name": "Human-readable fixture title",
  "description": "Explanation of what is tested",
  "input": {}, // Raw JSON payload
  "expected": {
    "ok": false,
    "codes": ["ISSUE_CODE"], // Alphabetically sorted unique issue codes
    "firstPath": ["steps", 0, "key"] // Optional first issue path
  },
  "structural": "valid", // "valid" | "invalid" under Draft-07 JSON Schema
  "knownDivergence": "Explanation if JSON Schema behavior diverges from Zod" // Optional
}
```

### 5. Schema & Fixtures Toolchain
- `pnpm --filter @aihome/config-schema run schema:generate`: Compiles Zod schema to `apps/api/resources/config-schema/wizard.schema.json`.
- `pnpm --filter @aihome/config-schema run schema:check`: Fails if committed `wizard.schema.json` differs from fresh generation.
- `pnpm --filter @aihome/config-schema run fixtures:generate`: Evaluates all source fixture builders in `src/fixtures/` and writes JSON fixtures.
- `pnpm --filter @aihome/config-schema run fixtures:check`: Verifies that fixtures on disk are identical to fresh generation, verifies all 14 issue codes are tested, and ensures total corpus size < 2 MB.
- `pnpm --filter @aihome/config-schema run schema:verify`: Runs Ajv draft-07 strict validation against all fixtures to verify differential parity.

### 6. Known Divergences Table

| Fixture Slug | Description | Zod / TypeScript Behavior | JSON Schema Draft-07 Behavior | Resolution / Contract |
|---|---|---|---|---|
| `divergence-untrimmed-text-length` | Localized text with surrounding whitespace (raw length 504, trimmed length 500) | Valid (`ok: true`): Zod trims before validating length | Invalid (`structural: "invalid"`): JSON Schema checks raw length 504 > 500 | Server must normalize and trim text strings before running JSON Schema validation |
| `boundary-condition-depth-7-invalid` | Condition AST with recursion depth 7 (exceeding MAX_CONDITION_DEPTH 6) | Invalid (`SCHEMA_INVALID`): Zod `superRefine` checks AST depth | Valid (`structural: "valid"`): Draft-07 JSON Schema cannot bound recursive `$ref` depth | Checked in PHP cross-validation pass |
| `boundary-condition-nodes-61-invalid` | Condition AST with 61 total nodes (exceeding MAX_CONDITION_NODES 60) | Invalid (`SCHEMA_INVALID`): Zod `superRefine` counts AST nodes | Valid (`structural: "valid"`): Draft-07 JSON Schema cannot count total nodes across union AST | Checked in PHP cross-validation pass |

