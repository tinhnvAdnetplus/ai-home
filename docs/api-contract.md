# AI HOME PLATFORM — API Contract

This document defines the unified API contract for all endpoints under `/api/*` in the AI HOME PLATFORM. All responses, error payloads, request identifiers, and pagination adhere to this contract.

---

## 1. General Principles

1. **Always JSON under `/api/*`**: Every API response returns JSON, regardless of client `Accept` headers.
2. **Error Format**: All API error responses follow RFC 9457 Problem Details (`Content-Type: application/problem+json`).
3. **Request Correlation**: Every API response includes an `X-Request-Id` header, and all error responses include `request_id` in their body.
4. **Non-API Routes**: Non-API routes (such as the SPA root `/` and web pages) retain standard HTML responses.

---

## 2. Standard Error Format (RFC 9457)

All errors returned by `/api/*` endpoints follow the RFC 9457 `application/problem+json` schema:

```json
{
  "type": "about:blank",
  "title": "Validation Failed",
  "status": 422,
  "detail": "The given data was invalid.",
  "code": "VALIDATION_FAILED",
  "request_id": "8c6b297b-89d3-4fc6-bca5-89daecbfd91e",
  "errors": {
    "user.name": ["ユーザー名は3文字以上で入力してください。"]
  }
}
```

### Fields

| Field | Type | Description |
|---|---|---|
| `type` | `string` | URI reference identifying the problem type (defaults to `"about:blank"`). |
| `title` | `string` | Short, human-readable summary of the problem. |
| `status` | `integer` | HTTP status code matching the response. |
| `detail` | `string` | Human-readable explanation of the specific error occurrence. |
| `code` | `string` | Stable, machine-readable error code (`App\Support\ApiErrorCode`). |
| `request_id` | `string` | Correlation identifier matching the `X-Request-Id` response header. |
| `errors` | `object` | Key-value mapping of field names to arrays of error messages. Present **only** when `code === "VALIDATION_FAILED"`. |
| `debug` | `object` | Debug diagnostics (exception class, message, file, line, trace). Present **only** on 500 errors when `APP_DEBUG=true`. |

---

## 3. Error Codes (`App\Support\ApiErrorCode`)

| Code | HTTP Status | Title | Mapped Exceptions | Special Headers |
|---|---|---|---|---|
| `VALIDATION_FAILED` | `422` | Validation Failed | `ValidationException` | — |
| `UNAUTHENTICATED` | `401` | Unauthenticated | `AuthenticationException` | — |
| `FORBIDDEN` | `403` | Forbidden | `AuthorizationException`, `AccessDeniedHttpException` | — |
| `NOT_FOUND` | `404` | Not Found | `NotFoundHttpException`, `ModelNotFoundException` | — |
| `METHOD_NOT_ALLOWED` | `405` | Method Not Allowed | `MethodNotAllowedHttpException` | `Allow: GET, HEAD` |
| `TOO_MANY_REQUESTS` | `429` | Too Many Requests | `ThrottleRequestsException`, `TooManyRequestsHttpException` | `Retry-After: <seconds>` |
| `PAYLOAD_TOO_LARGE` | `413` | Payload Too Large | `PostTooLargeException` | — |
| `CSRF_MISMATCH` | `419` | CSRF Token Mismatch | `TokenMismatchException`, 419 `HttpException` | — |
| `CONFIG_INVALID` | `422` | Config Invalid | `ConfigProblemException` | Includes `issues` array |
| `NO_DRAFT` | `422` | No Draft | `ConfigProblemException` | — |
| `PRECONDITION_REQUIRED` | `428` | Precondition Required | `ConfigProblemException` | Required for draft updates |
| `PRECONDITION_FAILED` | `412` | Precondition Failed | `ConfigProblemException` | Draft ETag mismatch |
| `CONFLICT` | `409` | Conflict | `ConfigProblemException` | Concurrent draft creation |
| `CLIENT_ERROR` | `4xx` (as thrown) | Client Error | Any other 4xx `HttpException` (400, 409, 415, ...) | — |
| `SERVER_ERROR` | `500` | Internal Server Error | Generic `Throwable`, 5xx `HttpException` | — |

### Sensitive Data Masking on 500
- When `APP_DEBUG=false`: The response body is strictly sanitized. It returns `detail: "An unexpected error occurred."` and contains **no** `exception`, `trace`, `file`, `line`, SQL queries, or thrown exception messages.
- When `APP_DEBUG=true`: A `debug` object is attached containing `exception`, `message`, `file`, `line`, and `trace`.

---

## 4. Request Identifier (`X-Request-Id`)

- **Resolution**:
  - If the client supplies an `X-Request-Id` header matching `^[A-Za-z0-9._-]{8,64}$`, the application reuses it.
  - If the header is missing or invalid (less than 8 characters, greater than 64 characters, contains spaces, symbols, or tags like `<script>`), the application generates a UUIDv4.
- **Propagation**:
  - Returned in the HTTP response header `X-Request-Id` for all `/api/*` responses.
  - Included in every RFC 9457 problem body as `request_id`.
  - Added to the Laravel logger context (`Log::withContext(['request_id' => ...])`) for log traceability.

---

## 5. Pagination Contract

All paginated API endpoints return a standardized structure via `App\Http\Resources\PaginatedCollection`:

```json
{
  "data": [
    { "id": 1, "name": "Item 1" },
    { "id": 2, "name": "Item 2" }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "last_page": 5
  }
}
```

### Query Parameters

| Parameter | Type | Default | Constraints & Fallbacks |
|---|---|---|---|
| `page` | `integer` | `1` | Minimum `1`. Invalid inputs (`0`, `-5`, `abc`) safely fall back to `1`. |
| `per_page` | `integer` | `20` | Minimum `1`, Maximum `100`. Values exceeding `100` (`1000`, `1e9`) are clamped to `100`. Values `< 1` (`0`, `-5`) are clamped to `1`. Non-numeric inputs (`abc`) fall back to default `20`. Never errors. |

### Edge Cases
- When `page` exceeds `last_page`, `data` returns an empty array `[]` while `meta` retains accurate counts.
- When `total` is `0`, `last_page` is `1` and `data` is `[]`.

---

## 6. Rate Limiting

- **Name**: `api`
- **Limit**: 60 requests per minute.
- **Partitioning**:
  - Authenticated requests are partitioned by User ID (`$request->user()->getAuthIdentifier()`).
  - Unauthenticated requests are partitioned by Client IP (`$request->ip()`).
- **Exceeded Response**:
  - HTTP `429 Too Many Requests`.
  - Includes `Retry-After: <seconds>` header.
  - Body formatted as RFC 9457 problem with `code: "TOO_MANY_REQUESTS"`.

---

## 7. Example Responses

### 7.1 Validation Error (422)

```http
HTTP/1.1 422 Unprocessable Content
Content-Type: application/problem+json
X-Request-Id: 91b1a770-4cb7-4a0b-93bb-e593452ca138

{
  "type": "about:blank",
  "title": "Validation Failed",
  "status": 422,
  "detail": "The given data was invalid.",
  "code": "VALIDATION_FAILED",
  "request_id": "91b1a770-4cb7-4a0b-93bb-e593452ca138",
  "errors": {
    "user.name": ["ユーザー名は3文字以上で入力してください。"],
    "items.0.title": ["アイテムのタイトルは必須です。"]
  }
}
```

### 7.2 Not Found Error (404)

```http
HTTP/1.1 404 Not Found
Content-Type: application/problem+json
X-Request-Id: 236f1c4e-9d22-4917-a02d-05a9ee9ec1ba

{
  "type": "about:blank",
  "title": "Not Found",
  "status": 404,
  "detail": "The requested resource was not found.",
  "code": "NOT_FOUND",
  "request_id": "236f1c4e-9d22-4917-a02d-05a9ee9ec1ba"
}
```

### 7.3 Rate Limit Exceeded (429)

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/problem+json
Retry-After: 42
X-Request-Id: f3c261e4-1ec0-4b2a-89aa-5527f51e06fa

{
  "type": "about:blank",
  "title": "Too Many Requests",
  "status": 429,
  "detail": "Too many requests. Please try again later.",
  "code": "TOO_MANY_REQUESTS",
  "request_id": "f3c261e4-1ec0-4b2a-89aa-5527f51e06fa"
}
```

### 7.4 Server Error (500) — Production Mode (`APP_DEBUG=false`)

```http
HTTP/1.1 500 Internal Server Error
Content-Type: application/problem+json
X-Request-Id: b201d1fa-0839-4bbd-b6a7-05c2a11b691d

{
  "type": "about:blank",
  "title": "Internal Server Error",
  "status": 500,
  "detail": "An unexpected error occurred.",
  "code": "SERVER_ERROR",
  "request_id": "b201d1fa-0839-4bbd-b6a7-05c2a11b691d"
}
```

---

## 8. Authentication & Authorization (Sanctum SPA Cookie Flow)

### 8.1 Architecture & Flow

- **Protocol**: Laravel Sanctum stateful cookie authentication.
- **Same-Origin SPA**: The React frontend and Laravel API share a single origin (`http://localhost:8080` in local development, production domain in production).
- **No Token in JS**: No bearer tokens are stored in `localStorage` or `sessionStorage`. All session tracking uses HTTP-only session cookies.
- **CSRF Protection**: For stateful origins, state-modifying requests (`POST`, `PUT`, `DELETE`) require the `X-XSRF-TOKEN` header derived from the `XSRF-TOKEN` cookie issued by `GET /sanctum/csrf-cookie`. A missing or mismatched CSRF token yields HTTP 419 with `code: "CSRF_MISMATCH"`.
- **Session Lifecycle**:
  - `POST /api/v1/auth/login` regenerates session IDs to prevent session fixation.
  - `POST /api/v1/auth/logout` invalidates the server session and regenerates the CSRF token.

### 8.2 Roles and Abilities Matrix

Roles are defined in `App\Enums\Role`:
- `admin`
- `editor`
- `architect`
- `user`

Abilities are defined as constants in `App\Support\Ability`:

| Ability | Description | `admin` | `editor` | `architect` | `user` |
|---|---|:---:|:---:|:---:|:---:|
| `manage-config` | Update application and wizard configurations | ALLOW | ALLOW | DENY | DENY |
| `manage-users` | Manage administrative users and roles | ALLOW | DENY | DENY | DENY |
| `review-plans` | Inspect and verify architectural plans | ALLOW | DENY | ALLOW | DENY |
| `own-plans` | Create, view, and modify personal plans | ALLOW | ALLOW | ALLOW | ALLOW |

Route access restriction is enforced using middleware alias `role:<role1>,<role2>`.
- Unauthorized authenticated requests receive HTTP 403 `FORBIDDEN`.
- Unauthenticated requests receive HTTP 401 `UNAUTHENTICATED`.

### 8.3 Endpoints

#### `POST /api/v1/auth/register`
- **Request Body**:
  ```json
  {
    "name": "山田 太郎",
    "email": "yamada@example.com",
    "password": "Password1234!",
    "password_confirmation": "Password1234!"
  }
  ```
- **Validation**:
  - `name`: required string, max 255 chars. UTF-8 (e.g. Japanese) supported.
  - `email`: required, valid email, trimmed + lowercased, unique.
  - `password`: required string, min 10 chars, confirmed with `password_confirmation`, must not match email.
  - `role`: payload values are ignored; user is always registered with role `user`.
- **Throttling**: 5 requests/minute per client IP (HTTP 429).
- **Response**: HTTP 201 Created with `UserResource`.

#### `POST /api/v1/auth/login`
- **Request Body**:
  ```json
  {
    "email": "yamada@example.com",
    "password": "Password1234!"
  }
  ```
- **Behavior**:
  - Starts stateful session and regenerates session ID.
  - **No user enumeration**: Wrong password and non-existent email return the exact same 401 `UNAUTHENTICATED` problem response with constant-time hash execution.
- **Throttling**: 5 failed login attempts per lowercased `email + IP` within 1 minute trigger HTTP 429 `TOO_MANY_REQUESTS` with `Retry-After`. Successful login clears the failed attempt count.
- **Response**: HTTP 200 OK with `UserResource`.

#### `POST /api/v1/auth/logout`
- **Middleware**: `auth:sanctum`
- **Behavior**: Logs out `web` guard, invalidates server session, and regenerates CSRF token.
- **Response**: HTTP 200 OK:
  ```json
  {
    "message": "Logged out successfully"
  }
  ```

#### `GET /api/v1/auth/me`
- **Middleware**: `auth:sanctum`
- **Response**: HTTP 200 OK:
  ```json
  {
    "data": {
      "id": 1,
      "name": "山田 太郎",
      "email": "yamada@example.com",
      "role": "user",
      "abilities": [
        "own-plans"
      ]
    }
  }
  ```

### 8.4 Complete Curl Walkthrough (Stateful Cookie Flow)

Execute against the Nginx reverse proxy:

```bash
# 1. Fetch CSRF cookie and extract session & XSRF token
CSRF_RES=$(curl -s -i \
  -H "Origin: http://localhost:8080" \
  -H "Referer: http://localhost:8080/" \
  http://localhost:8080/sanctum/csrf-cookie)

SESSION=$(echo "$CSRF_RES" | grep -i "Set-Cookie: ai-home-session=" | sed 's/.*Set-Cookie: ai-home-session=\([^;]*\).*/\1/')
XSRF=$(echo "$CSRF_RES" | grep -i "Set-Cookie: XSRF-TOKEN=" | sed 's/.*Set-Cookie: XSRF-TOKEN=\([^;]*\).*/\1/')
XSRF_TOKEN=$(php -r "echo urldecode('$XSRF');")

# 2. Register a new user
REG_RES=$(curl -s -i \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Origin: http://localhost:8080" \
  -H "Referer: http://localhost:8080/" \
  -H "Cookie: ai-home-session=$SESSION; XSRF-TOKEN=$XSRF" \
  -H "X-XSRF-TOKEN: ${XSRF_TOKEN}" \
  -d '{
    "name": "新規 ユーザー",
    "email": "test-flow@aihome.local",
    "password": "Password1234!",
    "password_confirmation": "Password1234!"
  }' \
  http://localhost:8080/api/v1/auth/register)

# 3. Log in to start session
LOGIN_RES=$(curl -s -i \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Origin: http://localhost:8080" \
  -H "Referer: http://localhost:8080/" \
  -H "Cookie: ai-home-session=$SESSION; XSRF-TOKEN=$XSRF" \
  -H "X-XSRF-TOKEN: ${XSRF_TOKEN}" \
  -d '{
    "email": "test-flow@aihome.local",
    "password": "Password1234!"
  }' \
  http://localhost:8080/api/v1/auth/login)

# Capture authenticated session & regenerated XSRF token
AUTH_SESSION=$(echo "$LOGIN_RES" | grep -i "Set-Cookie: ai-home-session=" | sed 's/.*Set-Cookie: ai-home-session=\([^;]*\).*/\1/')
AUTH_XSRF=$(echo "$LOGIN_RES" | grep -i "Set-Cookie: XSRF-TOKEN=" | sed 's/.*Set-Cookie: XSRF-TOKEN=\([^;]*\).*/\1/')
AUTH_XSRF_TOKEN=$(php -r "echo urldecode('$AUTH_XSRF');")

# 4. Check authenticated identity
curl -s -i \
  -H "Accept: application/json" \
  -H "Origin: http://localhost:8080" \
  -H "Referer: http://localhost:8080/" \
  -H "Cookie: ai-home-session=$AUTH_SESSION; XSRF-TOKEN=$AUTH_XSRF" \
  http://localhost:8080/api/v1/auth/me

# 5. Log out
LOGOUT_RES=$(curl -s -i \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Origin: http://localhost:8080" \
  -H "Referer: http://localhost:8080/" \
  -H "Cookie: ai-home-session=$AUTH_SESSION; XSRF-TOKEN=$AUTH_XSRF" \
  -H "X-XSRF-TOKEN: ${AUTH_XSRF_TOKEN}" \
  -X POST \
  http://localhost:8080/api/v1/auth/logout)

POST_LOGOUT_SESSION=$(echo "$LOGOUT_RES" | grep -i "Set-Cookie: ai-home-session=" | sed 's/.*Set-Cookie: ai-home-session=\([^;]*\).*/\1/')

# 6. Verify unauthenticated (returns 401 UNAUTHENTICATED)
curl -s -i \
  -H "Accept: application/json" \
  -H "Origin: http://localhost:8080" \
  -H "Referer: http://localhost:8080/" \
  -H "Cookie: ai-home-session=$POST_LOGOUT_SESSION" \
  http://localhost:8080/api/v1/auth/me
```

---

## 12. Wizard Config Validation (`App\Config\Wizard`)

Server-side validation of admin-submitted wizard configurations mirrors the exact rules of the TypeScript schema package (`packages/config-schema`).

### 12.1 Issue Codes (`App\Config\Wizard\ConfigIssueCode`)

| Code | Description | Example Path |
|---|---|---|
| `SCHEMA_INVALID` | Strict structural schema violation (unrecognized property, wrong data type, invalid primitive regex, missing required field). | `schemaVersion`, `steps.0.unknown_prop` |
| `DUPLICATE_KEY` | Duplicate step key, section key, field key, or option value. | `steps.1.sections.0.fields.0.key` |
| `UNKNOWN_FIELD_REF` | Condition references a field key not declared anywhere in the wizard. | `steps.0.sections.0.fields.0.visibleWhen` |
| `SELF_REFERENCE` | Field condition references its own field key. | `steps.0.sections.0.fields.0.visibleWhen` |
| `CONDITION_CYCLE` | Cyclic condition dependency between fields (detected via DFS). | `steps.0.sections.0.fields.1` |
| `UNKNOWN_BINDING` | Field `binding` is not in the planner capability registry (39 entries). | `steps.0.sections.0.fields.0.binding` |
| `BINDING_TYPE_MISMATCH` | Field type is incompatible with planner binding value type. | `steps.0.sections.0.fields.0.binding` |
| `DUPLICATE_BINDING` | The same planner binding key is bound by more than one field. | `steps.0.sections.0.fields.1.binding` |
| `DEFAULT_NOT_IN_OPTIONS` | `defaultValue` is not among valid options in select/radio/checkbox/image_select. | `steps.0.sections.0.fields.0.defaultValue` |
| `DEFAULT_OUT_OF_RANGE` | Number or range `defaultValue` is less than `min` or greater than `max`. | `steps.0.sections.0.fields.0.defaultValue` |
| `RANGE_INVALID` | Range/number configuration is invalid (`min > max` or `step <= 0`). | `steps.0.sections.0.fields.0.min` |
| `SELECTION_LIMITS_INVALID` | Selection limits are invalid (`minSelected > maxSelected` or out of option bounds). | `steps.0.sections.0.fields.0.minSelected` |
| `EMPTY_OPTIONS` | Select, radio, checkbox_group, or image_select field has 0 options. | `steps.0.sections.0.fields.0.options` |
| `LIMIT_EXCEEDED` | Structural limit exceeded (checked fast via `LimitPrecheck` and `CrossValidator`). | `steps`, `steps.0.sections` |

### 12.2 Structural Limits

| Parameter | Limit | Enforcement Point |
|---|---|---|
| Maximum steps | `20` | `LimitPrecheck`, `CrossValidator` |
| Maximum sections per step | `20` | `LimitPrecheck`, `CrossValidator` |
| Maximum total fields | `150` | `LimitPrecheck`, `CrossValidator` |
| Maximum options per field | `60` | `LimitPrecheck`, `CrossValidator` |
| Maximum condition AST depth | `6` | `ConditionAstValidator` (depth guard) |
| Maximum condition AST nodes | `60` | `ConditionAstValidator` |
| Maximum `in` right-side items | `50` | `ConditionAstValidator` |
| Key regex | `^[a-z][a-z0-9_]{0,47}\z` | `StructuralValidator`, `ConditionAstValidator` |
| Binding key regex | `^[a-z][a-zA-Z0-9]*(\.[a-z][a-zA-Z0-9]*)*\z` (max 64) | `StructuralValidator` |
| Media ID regex | `^[A-Za-z0-9_-]{1,64}\z` | `StructuralValidator` |
| Localized text length | `1..500` Unicode characters | `StructuralValidator` |
| Textarea max length | `1..2000` | `StructuralValidator` |
| Upload max files | `1..10` | `StructuralValidator` |
| Upload max size MB | `1..20` | `StructuralValidator` |
| Raw JSON size cap | `1 MB` (`1,048,576` bytes) | `WizardConfigValidator::validateJson` |
| Raw JSON decode depth | `64` | `WizardConfigValidator::validateJson` |

### 12.3 Normalization Rules

- **Localized Text Trimming**: All localized string values (`ja`, `en`, `vi`) are automatically trimmed (`trim()`). Length constraints (`1..500` characters) are evaluated on trimmed Unicode characters via `mb_strlen($trimmed, 'UTF-8')`. Empty or whitespace-only values are rejected.
- **Default Field Attributes**: Omitted optional booleans (`required` on base field, `multiple` on `image_select`) normalize to `false`.

---

## 13. Configuration Management API (`/api/v1/config/*`, `/api/v1/admin/configs/*`)

### 13.1 Overview & Access Control

- **Public Endpoint**: `GET /api/v1/config/bundle` is public, cached via HTTP ETag validation (`304 Not Modified`), and never leaks draft payloads, user identifiers, or audit trails.
- **Admin Endpoints**: Require stateful cookie authentication (`auth:sanctum`) and the `manage-config` ability (`can:manage-config`, restricted to `admin` and `editor` roles). Unauthenticated requests yield `401 UNAUTHENTICATED`, unauthorized roles (e.g. `architect`, `user`) yield `403 FORBIDDEN`.
- **Write Throttling**: Mutation endpoints (`PUT draft`, `DELETE draft`, `POST publish`, `POST rollback`) are protected by the `throttle:config-write` named limiter (30 requests/minute per authenticated user).

---

### 13.2 Public Endpoints

#### `GET /api/v1/config/bundle`

Retrieves the bundle containing only published configurations.

- **Headers**:
  - `ETag`: Strong ETag formatted as `"<sha256>"` computed deterministically across document keys, version IDs, and payload hashes.
  - `Cache-Control`: `no-cache`
- **Conditional Request**: Supports `If-None-Match: "<etag>"`. Returns `304 Not Modified` with an empty body when unchanged.
- **Response `200 OK`**:
```json
{
  "etag": "\"5df29340a44f2b83f1bdd38721e90ffd818733d97fdfa9b6e25f262d145c3bb2\"",
  "configs": {
    "wizard": {
      "version": 2,
      "schemaVersion": 1,
      "publishedAt": "2026-10-12T08:20:53.000000Z",
      "payload": {
        "schemaVersion": 1,
        "steps": [ ... ]
      }
    }
  }
}
```

---

### 13.3 Admin Endpoints (`auth:sanctum` + `can:manage-config`)

#### 1. `GET /api/v1/admin/configs`

Lists all registered document keys and their current published/draft status.

- **Response `200 OK`**:
```json
{
  "data": [
    {
      "id": 1,
      "key": "wizard",
      "scope": "global",
      "currentPublishedVersion": 2,
      "publishedAt": "2026-10-12T08:20:53.000000Z",
      "hasDraft": true,
      "draftUpdatedAt": "2026-10-12T08:23:24.000000Z"
    }
  ]
}
```

#### 2. `GET /api/v1/admin/configs/{key}`

Retrieves document details, the current published version (with payload), the active draft (with payload, if any), and metadata of up to 20 most recent versions.

- **Response Header**: `ETag: "<draft-etag>"` if an active draft exists.
- **Response `200 OK`**:
```json
{
  "key": "wizard",
  "scope": "global",
  "published_version": {
    "id": 1,
    "version": 2,
    "status": "published",
    "schemaVersion": 1,
    "payloadHash": "...",
    "publishedAt": "2026-10-12T08:20:53.000000Z",
    "payload": { ... }
  },
  "draft_version": {
    "id": 2,
    "version": 3,
    "status": "draft",
    "schemaVersion": 1,
    "payloadHash": "...",
    "etag": "\"81977cc4b097c0fc22ca725fd9ff62e6d459288347dfb8776f296ccbef158df0\"",
    "payload": { ... }
  },
  "recent_versions": [
    {
      "id": 1,
      "version": 2,
      "status": "published",
      "schemaVersion": 1,
      "payloadHash": "...",
      "publishedAt": "2026-10-12T08:20:53.000000Z"
    }
  ]
}
```

#### 3. `PUT /api/v1/admin/configs/{key}/draft`

Creates or updates a draft.

- **Body**: `{ "payload": { ... }, "label": "optional label <= 120 chars" }`
- **Preconditions & Concurrency**:
  - If a draft does not exist: Creates a new draft (`version = max(version)+1`, `based_on_version_id = current_published`). Returns `201 Created` with `ETag`.
  - If a draft already exists: Client **must** provide `If-Match: "<draft-etag>"`. Missing header returns `428 PRECONDITION_REQUIRED`. Stale or mismatching ETag returns `412 PRECONDITION_FAILED`.
  - Concurrent creation is caught by database unique index `(config_document_id, is_draft)` and returned as `409 CONFLICT`.
  - Validation failure returns `422 CONFIG_INVALID` with an `issues` array.
  - Payload > 1 MB returns `413 PAYLOAD_TOO_LARGE`.

#### 4. `DELETE /api/v1/admin/configs/{key}/draft`

Discards the active draft and audits the removal.

- **Response**: `204 No Content`

#### 5. `POST /api/v1/admin/configs/{key}/publish`

Publishes the current draft inside a row-locked transaction.

- **Body**: `{ "label": "optional" }`
- **Behavior**:
  - Re-validates the draft against the registered domain validator.
  - Archives the previously published version (`status = archived`).
  - Converts draft to published (`status = published`, `is_draft = NULL`, `published_at = NOW()`, `published_by = user_id`).
  - Sets `current_version_id` on the document.
  - Writes an append-only audit record (`action = publish`).
  - Publishing without a draft returns `422 NO_DRAFT`.
- **Response `200 OK`**: Published version object.

#### 6. `POST /api/v1/admin/configs/{key}/rollback`

Rolls back to an older version by creating a **new** published version (preserving linear history).

- **Body**: `{ "version": 1 }`
- **Behavior**:
  - Re-validates the historical payload against current validator rules.
  - Creates a new version copying the payload (`version = max+1`, `based_on_version_id = target_id`).
  - Archives the previous published version and points `current_version_id` to the new version.
  - Rolling back to the already-current published version returns `422 VALIDATION_FAILED`.
- **Response `200 OK`**: New published version object.

#### 7. `GET /api/v1/admin/configs/{key}/versions`

Paginated list of versions (newest first, metadata only, payload omitted).

- **Query Parameters**: `?page=1&per_page=20`
- **Response `200 OK`**: `PaginatedCollection` containing version metadata.

#### 8. `GET /api/v1/admin/configs/{key}/versions/{n}`

Retrieves a specific version by number `{n}` (with full payload). `{n}` must be a positive integer matching `[1-9][0-9]*`.

- **Response `200 OK`**: Version object with `payload`.

#### 9. `GET /api/v1/admin/configs/{key}/audit`

Paginated audit trail showing actions, timestamps, request IDs, and actor information (`id` and `name` only; passwords and hashes never returned).

- **Query Parameters**: `?page=1&per_page=20`
- **Response `200 OK`**: `PaginatedCollection` containing audit entries.

---

### 13.4 RFC 9457 Error Examples for Configuration Endpoints

#### `CONFIG_INVALID` (422 Unprocessable Content)

Returned when payload fails domain validation rules.

```json
{
  "type": "about:blank",
  "title": "Config Invalid",
  "status": 422,
  "detail": "The configuration payload is invalid.",
  "code": "CONFIG_INVALID",
  "request_id": "01925b42-d66a-72ef-95b6-79ba5186dfc2",
  "issues": [
    {
      "code": "SCHEMA_INVALID",
      "path": "schemaVersion",
      "message": "Required"
    },
    {
      "code": "DUPLICATE_KEY",
      "path": "steps.1.sections.0.fields.0.key",
      "message": "Duplicate field key: applicant_name"
    }
  ]
}
```

#### `PRECONDITION_REQUIRED` (428 Precondition Required)

Returned when attempting to update an existing draft without sending `If-Match`.

```json
{
  "type": "about:blank",
  "title": "Precondition Required",
  "status": 428,
  "detail": "If-Match header is required to update an existing draft.",
  "code": "PRECONDITION_REQUIRED",
  "request_id": "01925b42-d66a-72ef-95b6-79ba5186dfc3"
}
```

#### `PRECONDITION_FAILED` (412 Precondition Failed)

Returned when the provided `If-Match` header does not match the current draft's ETag.

```json
{
  "type": "about:blank",
  "title": "Precondition Failed",
  "status": 412,
  "detail": "Draft has been modified concurrently. Precondition failed.",
  "code": "PRECONDITION_FAILED",
  "request_id": "01925b42-d66a-72ef-95b6-79ba5186dfc4"
}
```

#### `CONFLICT` (409 Conflict)

Returned when concurrent requests race to create a draft for the same document.

```json
{
  "type": "about:blank",
  "title": "Conflict",
  "status": 409,
  "detail": "A draft was created concurrently.",
  "code": "CONFLICT",
  "request_id": "01925b42-d66a-72ef-95b6-79ba5186dfc5"
}
```

#### `NO_DRAFT` (422 Unprocessable Content)

Returned when attempting to publish a document with no active draft.

```json
{
  "type": "about:blank",
  "title": "No Draft",
  "status": 422,
  "detail": "No active draft exists for configuration 'wizard'.",
  "code": "NO_DRAFT",
  "request_id": "01925b42-d66a-72ef-95b6-79ba5186dfc6"
}
```

---

### 13.5 Complete Admin Curl Flow with Session & CSRF

```bash
# 1. Initialize session and obtain CSRF cookie
CSRF_RES=$(curl -s -i \
  -H "Host: localhost:8080" \
  -H "Origin: http://localhost:8080" \
  -H "Referer: http://localhost:8080/" \
  http://localhost:8080/sanctum/csrf-cookie)

SESSION=$(echo "$CSRF_RES" | grep -i "Set-Cookie: ai-home-session=" | sed 's/.*Set-Cookie: ai-home-session=\([^;]*\).*/\1/')
XSRF=$(echo "$CSRF_RES" | grep -i "Set-Cookie: XSRF-TOKEN=" | sed 's/.*Set-Cookie: XSRF-TOKEN=\([^;]*\).*/\1/')
XSRF_TOKEN=$(php -r "echo urldecode('$XSRF');")

# 2. Authenticate as Admin
LOGIN_RES=$(curl -s -i \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Host: localhost:8080" \
  -H "Origin: http://localhost:8080" \
  -H "Referer: http://localhost:8080/" \
  -H "Cookie: ai-home-session=$SESSION; XSRF-TOKEN=$XSRF" \
  -H "X-XSRF-TOKEN: ${XSRF_TOKEN}" \
  -d '{"email":"admin@aihome.local","password":"Password1234!"}' \
  http://localhost:8080/api/v1/auth/login)

AUTH_SESSION=$(echo "$LOGIN_RES" | grep -i "Set-Cookie: ai-home-session=" | sed 's/.*Set-Cookie: ai-home-session=\([^;]*\).*/\1/')
AUTH_XSRF=$(echo "$LOGIN_RES" | grep -i "Set-Cookie: XSRF-TOKEN=" | sed 's/.*Set-Cookie: XSRF-TOKEN=\([^;]*\).*/\1/')
AUTH_XSRF_TOKEN=$(php -r "echo urldecode('$AUTH_XSRF');")

# 3. Create Draft (returns 201 Created with ETag header)
DRAFT_RES=$(curl -s -i \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Host: localhost:8080" \
  -H "Origin: http://localhost:8080" \
  -H "Referer: http://localhost:8080/" \
  -H "Cookie: ai-home-session=$AUTH_SESSION; XSRF-TOKEN=$AUTH_XSRF" \
  -H "X-XSRF-TOKEN: ${AUTH_XSRF_TOKEN}" \
  -X PUT \
  -d '{"payload":{...},"label":"Draft v1"}' \
  http://localhost:8080/api/v1/admin/configs/wizard/draft)

DRAFT_ETAG=$(echo "$DRAFT_RES" | grep -i "^etag:" | tr -d '\r' | cut -d' ' -f2-)

# 4. Update Draft with If-Match (returns 200 OK with new ETag)
UPDATE_RES=$(curl -s -i \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Host: localhost:8080" \
  -H "Origin: http://localhost:8080" \
  -H "Referer: http://localhost:8080/" \
  -H "If-Match: $DRAFT_ETAG" \
  -H "Cookie: ai-home-session=$AUTH_SESSION; XSRF-TOKEN=$AUTH_XSRF" \
  -H "X-XSRF-TOKEN: ${AUTH_XSRF_TOKEN}" \
  -X PUT \
  -d '{"payload":{...},"label":"Draft v1 updated"}' \
  http://localhost:8080/api/v1/admin/configs/wizard/draft)

# 5. Publish Draft
curl -s -i \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Host: localhost:8080" \
  -H "Origin: http://localhost:8080" \
  -H "Referer: http://localhost:8080/" \
  -H "Cookie: ai-home-session=$AUTH_SESSION; XSRF-TOKEN=$AUTH_XSRF" \
  -H "X-XSRF-TOKEN: ${AUTH_XSRF_TOKEN}" \
  -X POST \
  -d '{"label":"Release v1"}' \
  http://localhost:8080/api/v1/admin/configs/wizard/publish
```

---

## 11. AI Endpoints (`/api/v1/ai/*`)

### 11.1 General Principles
1. **Rate Limiting (`throttle:ai`)**: 10 requests per minute per IP or authenticated user, plus daily quota defined by `AI_DAILY_LIMIT` (default 50). Exceeding limits returns HTTP `429 Too Many Requests` formatted as RFC 9457 with code `TOO_MANY_REQUESTS`.
2. **Payload Size Limit**: Request bodies are capped at 32 KB (`EnsureMaxPayloadSize`). Payloads exceeding 32 KB return HTTP `413 Payload Too Large` with code `PAYLOAD_TOO_LARGE`.
3. **No PII Retention**: Prompts and raw answers are never stored in the database. Operational call records in `ai_calls` contain only token metrics, model, latency, status code, and degradation flags.

### 11.2 Endpoints

#### `POST /api/v1/ai/constraints`
Converts wizard answers and free-text customer requests into strictly bounded procedural design constraints.

- **Request Body**:
  ```json
  {
    "answers": {
      "plan_floors": "one_story",
      "notes_step1": "平屋が希望だが、収納を多くしたい。書斎が欲しい"
    },
    "locale": "ja"
  }
  ```
- **Validation**:
  - `answers`: required object.
  - `locale`: optional string enum (`ja`, `en`, `vi`), defaults to `ja`.
- **Response `200 OK`**:
  ```json
  {
    "constraints": {
      "schemaVersion": 1,
      "summary": "平屋・収納重視の設計要件です。",
      "priorities": { "housework": 3, "storage": 5, "daylight": 3, "budget": 3, "privacy": 3, "family": 4 },
      "mustHaveRooms": ["ldk", "bedroom", "entrance", "bath", "wash", "toilet", "walkInCloset", "pantry", "study"],
      "avoidRooms": [],
      "roomHints": [{ "room": "study", "count": 1, "sizeJo": 3 }],
      "adjacency": [],
      "orientation": { "livingFacing": "any", "entranceSide": "any" },
      "accessibility": { "oneLevelLiving": true, "wideCorridors": false },
      "pets": false,
      "workFromHome": true,
      "notes": ["大型パントリーの確保を希望"],
      "unmappedRequests": []
    },
    "source": "gemini",
    "degraded": false,
    "model": "gemini-1.5-flash",
    "usage": { "inputTokens": 120, "outputTokens": 85 },
    "requestId": "91b1a770-4cb7-4a0b-93bb-e593452ca138"
  }
  ```

#### `POST /api/v1/ai/commentary`
Generates natural Japanese architectural explanations and pros/cautions for up to 3 synthesized floor plan proposals.

- **Request Body**:
  ```json
  {
    "answers": { "plan_floors": "two_story" },
    "constraints": { "summary": "収納重視" },
    "plans": [
      {
        "label": "A",
        "score": { "housework": 85, "storage": 90, "daylight": 80, "budget": 75, "total": 83 },
        "summary": { "floorAreaM2": 105.5, "tsubo": 31.9, "roomsList": ["LDK", "主寝室", "洋室1"] },
        "warnings": []
      }
    ]
  }
  ```
- **Validation**:
  - `plans`: required array of 1 to 3 plan objects.
- **Response `200 OK`**:
  ```json
  {
    "items": [
      {
        "label": "A",
        "headline": "収納力抜群！家事ラクで明るい二階建てプラン",
        "body": "延床面積31.9坪（105.5m²）の構成で、家事動線スコア85点、収納スコア90点を実現...",
        "pros": ["水回りを集約した効率的な家事動線", "各室にゆとりある収納スペースを配置"],
        "cautions": ["外構計画および駐車スペースとの連動検討"]
      }
    ],
    "recommendedLabel": "A",
    "source": "gemini",
    "degraded": false,
    "model": "gemini-1.5-flash",
    "usage": { "inputTokens": 240, "outputTokens": 150 },
    "requestId": "91b1a770-4cb7-4a0b-93bb-e593452ca138"
  }
  ```

#### `GET /api/v1/admin/ai/usage`
Inspect operational metrics, latency, token consumption, and degraded fallback counts.

- **Authorization**: Required session cookie, roles `admin` or `editor`.
- **Response `200 OK`**:
  ```json
  {
    "recent_calls": [
      {
        "id": 1,
        "user_id": null,
        "user_name": null,
        "endpoint": "/api/v1/ai/constraints",
        "provider": "gemini",
        "model": "gemini-1.5-flash",
        "source": "gemini",
        "degraded": false,
        "input_tokens": 120,
        "output_tokens": 85,
        "latency_ms": 1150,
        "status": 200,
        "created_at": "2026-10-12T13:20:01.000000Z"
      }
    ],
    "daily_totals": [
      {
        "date": "2026-10-12",
        "provider": "gemini",
        "total_calls": 24,
        "total_input_tokens": 4200,
        "total_output_tokens": 2800,
        "avg_latency_ms": 1240.5,
        "degraded_calls": 0
      }
    ]
  }
  ```

---

## 14. Projects & Plans API

Provides server-side persistence, wizard answer validation, and planner plan proposals management for end users and administrative staff.

### Authorization & Security Policies
- **User Ownership**: Regular users (`user` role) can only access and modify their own projects. Accessing another user's project by ID returns `404 NOT_FOUND` (preventing existence leaks).
- **Staff Access**: Users with roles `admin`, `editor`, or `architect` can inspect all projects via `GET /api/v1/admin/projects` or access individual projects by ID.
- **CSRF & Session**: All mutating endpoints require stateful session cookie authentication with `X-XSRF-TOKEN`.

### Endpoints

#### `GET /api/v1/projects`
List projects belonging to the authenticated user.

- **Query Parameters**:
  - `status`: Optional filter (`draft`, `submitted`, `archived`).
  - `page`: Page number (default: 1).
  - `per_page`: Items per page (default: 15, max: 100).
- **Response `200 OK`**:
  ```json
  {
    "data": [
      {
        "id": 1,
        "user_id": 4,
        "title": "My Dream House",
        "status": "draft",
        "config_version": null,
        "answers": {
          "construction_purpose": "new_build"
        },
        "submitted_at": null,
        "created_at": "2026-10-12T13:00:00.000000Z",
        "updated_at": "2026-10-12T13:05:00.000000Z",
        "plans": []
      }
    ],
    "meta": {
      "page": 1,
      "per_page": 15,
      "total": 1,
      "last_page": 1
    }
  }
  ```

#### `POST /api/v1/projects`
Create a new draft project for the authenticated user.

- **Request Body**:
  ```json
  {
    "title": "My Dream House"
  }
  ```
  *(Note: `title` is optional, max 255 characters).*
- **Response `201 Created`**:
  ```json
  {
    "data": {
      "id": 1,
      "user_id": 4,
      "title": "My Dream House",
      "status": "draft",
      "config_version": null,
      "answers": null,
      "submitted_at": null,
      "created_at": "2026-10-12T13:00:00.000000Z",
      "updated_at": "2026-10-12T13:00:00.000000Z",
      "plans": []
    }
  }
  ```

#### `GET /api/v1/projects/{id}`
Retrieve a project and its uploaded proposals.

- **Route Constraints**: `{id}` matches `[1-9][0-9]{0,8}`.
- **Response `200 OK`**: Returns project resource with `plans` array.
- **Response `404 NOT_FOUND`**: If project does not exist or belongs to another user.

#### `PATCH /api/v1/projects/{id}`
Update project title or status.

- **Request Body**:
  ```json
  {
    "title": "Updated House Title",
    "status": "archived"
  }
  ```
- **Response `200 OK`**: Returns updated project.

#### `DELETE /api/v1/projects/{id}`
Soft delete a project.

- **Response `200 OK`**:
  ```json
  {
    "message": "Project deleted."
  }
  ```

#### `PUT /api/v1/projects/{id}/answers`
Save draft wizard answers.

- **Validation Rules**:
  - Keys must be defined in the active published wizard configuration (returns `422 UNKNOWN_KEY` if unrecognized).
  - Values must match field type (`number`, `string`, `boolean`, `array`, `object`).
  - Options must exist in the field's allowed options whitelist (`OPTION_NOT_ALLOWED`).
  - Numeric values must be within min/max bounds (`OUT_OF_RANGE`).
  - Because it is a draft save (`partial = true`), missing fields are permitted.
- **Request Body**:
  ```json
  {
    "answers": {
      "construction_purpose": "new_build",
      "floors": 2,
      "plan_target_area": 110.5
    }
  }
  ```
- **Response `200 OK`**: Returns project resource with updated `answers`.

#### `POST /api/v1/projects/{id}/submit`
Submit wizard answers and finalize the project specification.

- **Validation Rules**:
  - Strict validation (`requireCompleted = true`).
  - Runs condition evaluator (`AnswerResolver`) to determine field visibility and disabled status.
  - Every visible, non-disabled required question must be answered (`REQUIRED_MISSING`).
  - Sets project status to `submitted`, updates `submitted_at` timestamp, and records `config_version`.
- **Response `200 OK`**:
  ```json
  {
    "data": {
      "id": 1,
      "user_id": 4,
      "title": "My Dream House",
      "status": "submitted",
      "config_version": 10,
      "answers": { ... },
      "submitted_at": "2026-10-12T13:10:00.000000Z",
      "created_at": "2026-10-12T13:00:00.000000Z",
      "updated_at": "2026-10-12T13:10:00.000000Z",
      "plans": []
    }
  }
  ```
- **Response `422 Unprocessable Content` (Validation Failure)**:
  ```json
  {
    "type": "about:blank",
    "title": "Config Invalid",
    "status": 422,
    "detail": "Wizard answers failed validation with 1 issues.",
    "code": "CONFIG_INVALID",
    "request_id": "...",
    "issues": [
      {
        "path": "answers.land_area",
        "message": "Field 'land_area' is required.",
        "code": "REQUIRED_MISSING"
      }
    ]
  }
  ```

#### `POST /api/v1/projects/{id}/plans`
Upload 1 to 3 floor plan proposals generated by the AI planner.

- **Validation Rules**:
  - Max 3 plans per upload (`max:3`).
  - Total payload cap: 2 MB (exceeding requests return `413 Payload Too Large` or `422`).
  - Each item must specify:
    - `label`: string, max 100 characters.
    - `score`: optional object.
    - `model`: required JSON object (represents floor plan geometry, rooms, walls, fixtures).
  - Server automatically computes and stores `model_hash` as `sha256(json_encode(model))`.
- **Request Body**:
  ```json
  {
    "plans": [
      {
        "label": "Plan A - Spacious Living",
        "score": { "comfort": 92, "cost": 85 },
        "model": {
          "buildingCoverageRatio": 50,
          "floorAreaRatio": 100,
          "rooms": ["LDK", "MasterBedroom"]
        }
      }
    ]
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "data": [
      {
        "id": 1,
        "project_id": 1,
        "label": "Plan A - Spacious Living",
        "score": { "comfort": 92, "cost": 85 },
        "model": { ... },
        "model_hash": "7b25af40d29d1db2b625a23e99fa40eee2ea0e8ab8f26573b39da797232dddbc",
        "created_at": "2026-10-12T13:12:00.000000Z",
        "updated_at": "2026-10-12T13:12:00.000000Z"
      }
    ]
  }
  ```

#### `DELETE /api/v1/projects/{id}/plans/{planId}`
Delete a plan proposal from a project.

- **Route Constraints**: `{id}` and `{planId}` match `[1-9][0-9]{0,8}`.
- **Response `200 OK`**:
  ```json
  {
    "message": "Plan deleted."
  }
  ```

#### `POST /api/v1/projects/{id}/report`
Generate an architectural proposal booklet PDF on the server for the specified project.

- **Route Constraints**: `{id}` matches `[1-9][0-9]{0,8}`.
- **Authorization**: Owner-only. Non-owners or non-existent projects return `404 NOT_FOUND` (no existence leak).
- **Throttling & Size Limits**:
  - Rate limit: 6 requests per minute (`throttle:6,1`). Exceeding returns `429 TOO_MANY_REQUESTS`.
  - Request body limit: 6 MB (6,291,456 bytes via `max.payload:6291456`). Exceeding returns `413 PAYLOAD_TOO_LARGE`.
- **Query Parameters**:
  - `download`: Optional boolean / integer (`1` or `true`). If set, response header is `Content-Disposition: attachment; filename="proposal-{id}.pdf"`; otherwise `inline`.
- **Request Body JSON**:
  ```json
  {
    "locale": "ja",
    "planLabel": "Plan A - Spacious Modern Living",
    "images": {
      "plan1f": "data:image/png;base64,...",
      "plan2f": "data:image/png;base64,...",
      "elevS": "data:image/png;base64,...",
      "elevN": "data:image/png;base64,...",
      "elevE": "data:image/png;base64,...",
      "elevW": "data:image/png;base64,...",
      "view3d": "data:image/png;base64,..."
    },
    "commentary": {
      "headline": "光と風が通り抜ける開放的な2階建てプラン",
      "body": "南面に設けた大きな窓から心地よい日差しが差し込み、家事動線をコンパクトに集約した機能的な邸宅です。",
      "pros": [
        "LDKを広く確保し、家族のコミュニケーションを促進",
        "玄関から洗面・パントリーへの直通動線"
      ],
      "cautions": [
        "敷地境界線の測量確定図との最終照合が必要です",
        "建築士による構造計算および斜線制限の確認を実施します"
      ]
    }
  }
  ```
- **Validation Rules**:
  - `locale`: Optional string, allowed values: `ja`, `en`, `vi`. Defaults to `ja`.
  - `planLabel`: Optional string (max 255 chars). Selects specific stored proposal plan.
  - `images`: Optional map with max 7 allowed keys (`plan1f`, `plan2f`, `elevS`, `elevN`, `elevE`, `elevW`, `view3d`).
    - Values must be PNG or JPEG data URLs (`data:image/png;base64,...` or `data:image/jpeg;base64,...`).
    - Binary content is decoded and checked against PNG / JPEG magic bytes.
    - Max size per image: 1.2 MB (1,258,291 bytes).
    - Unrecognized keys, corrupt base64, invalid magic bytes, or oversized images return RFC 9457 `422 VALIDATION_FAILED`.
  - `commentary`: Optional object containing `headline`, `body`, `pros` (max 20 items), and `cautions` (max 20 items).
- **Responses**:
  - **`200 OK`**:
    - `Content-Type: application/pdf`
    - `Content-Disposition: inline; filename="proposal-{id}.pdf"` (or `attachment` if `download=1`)
    - Binary A4 landscape PDF proposal booklet (6–8 pages with cover, requirements, plan specs, floorplans, elevations, 3D view, AI commentary, and trilingual legal disclaimers).
  - **`404 NOT_FOUND`**: Project does not exist or belongs to another user.
  - **`413 PAYLOAD_TOO_LARGE`**: Request payload exceeds 6 MB.
  - **`422 VALIDATION_FAILED`**: Invalid image payload, magic bytes mismatch, or schema violation.
  - **`429 TOO_MANY_REQUESTS`**: Request throttled (> 6 requests/minute).

#### `GET /api/v1/admin/projects`
List all projects across all users.

- **Authorization**: Required session cookie, roles `admin`, `editor`, or `architect`.
- **Query Parameters**:
  - `status`: Optional filter (`draft`, `submitted`, `archived`).
  - `user_id`: Optional filter by user ID.
  - `search`: Optional search query across title or user name/email.
  - `page`: Page number (default: 1).
  - `per_page`: Items per page (default: 15, max: 100).
- **Response `200 OK`**: Paginated project resources with attached `user` object (`id`, `name`, `email`).




