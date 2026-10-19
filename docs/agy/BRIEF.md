# Working agreement for the coding agent (read fully before touching anything)

You are implementing ONE task of the AI HOME PLATFORM (new-version). A reviewer will independently re-run
your tests and inspect your work, so claims you cannot back with command output will be treated as false.

## 0. Context you must read first
1. `docs/CODING_CONVENTION.md` — binding rules (config-driven, no `any`, strict TS, i18n for all UI strings, API format, tests).
2. The task's row in `docs/TASKS.md` and the task spec appended below this brief.
3. Facts about the repo: ONE Laravel 12 app in `apps/api` (PHP **8.2**, production runs 8.2.33; never use
   Laravel 13 or packages that need PHP >= 8.3). React + TypeScript lives in `apps/api/resources/js`, built by Vite into
   `apps/api/public/build`. There is NO separate web app. pnpm workspace root is `new-version/`.

## 0b. Headless-run rule (a previous run failed because of this)
You run non-interactively: **the run ENDS the moment you reply without a tool call.** Therefore:
- NEVER end a turn with "I will wait" / "I have launched X". Run every command in the FOREGROUND and wait for its result
  (installs and test suites can take minutes - that is fine). Do not start background jobs.
- Keep working until every deliverable is done and verified, then print the final report as your LAST message.
- Check the current state of the repo before acting: part of the task may already be done by an earlier attempt. Reuse it
  after verifying it is correct; do not redo or duplicate it.

## 0c. Waiting for commands (measured: polling wasted 25-46% of earlier runs)
Every tool call costs a full model round trip (~3-5 s). Earlier runs launched `make check` in the background and then called `manage_task` with `Action: status`
every ~4.5 s: up to 269 polls (20 minutes) in one task. Do this instead:
- For ANY command that can take more than 10 seconds (tests, lint, typecheck, static analysis, build, installs, make targets) set the run_command argument
  `WaitMsBeforeAsync` to **300000** so the call returns only when the command has finished. Then read the result; no polling.
- If a command still went to the background, do NOT poll in a loop: call `sleep 60` (allowed) and then ONE status check; repeat at most a few times.
- Do not re-run the whole suite after every small edit: iterate with a single test file / single tool, run the full lane check once when a part is done.
- Batch your work: write all files of a part first (several write calls in a row), then verify once. Do not re-read files you just wrote.

## 1. Scope and safety (hard rules)
- Work only inside `/Users/apple/DEV/webservice/aihome/new-version`. Never touch `../old-version`.
- Do NOT edit `docs/CODING_CONVENTION.md` or `docs/TASKS.md`. Only edit docs/files the task names.
- Forbidden: `git init`, `docker compose down -v`, `make reset`, dropping/wiping the DB volume, `rm -rf` on anything you did
  not create, global installs, `sudo`, `curl | sh`, changing ports/volumes/service names in `docker-compose.yml` unless the
  task says so, disabling or deleting existing tests to make things pass, weakening lint/TS rules to make things pass.
- Network use only for package registries (npm, Packagist). No telemetry, no external APIs.
- If the spec is ambiguous, pick the simplest option consistent with the convention and write it under "Assumptions".
  Never silently expand scope; list extra ideas under "Follow-ups" instead.

## 2. How to run things (everything runs in Docker; the stack should already be up)
- Start if needed: `docker compose up -d` (wait until `docker compose ps` shows api/nginx/vite healthy).
- PHP:      `docker compose exec -T api <cmd>`        (e.g. `php artisan test`, `composer ...`, `vendor/bin/pest`)
- Frontend: `docker compose exec -T vite pnpm --filter aihome-app <script>`; add deps with
  `docker compose exec -T vite pnpm --filter aihome-app add -E <pkg>@<version>` (`-E` = exact version, no `^`).
- Pin exact versions for every new dependency (npm and composer). For composer use exact constraints and verify
  PHP 8.2 compatibility: `docker compose exec -T api composer check-platform-reqs` must pass; `composer.json` must keep
  `"config": {"platform": {"php": "8.2.0"}}` (add it if missing) so nothing resolves to a PHP 8.3-only version.
- Files created by containers on the bind mount are fine; do not chmod/chown the host tree.
- HTTP checks: run curl INSIDE the api container against nginx, e.g. `docker compose exec -T api curl -s -i http://nginx/api/v1/health`
  (host `curl` is not available to you). Use `docker compose exec -T api php artisan ...` for artisan.
- You run headless with an allow-list of shell commands. **A single denied command ABORTS THE WHOLE RUN with no report** (this
  already happened: `python3 -c ...` was used to generate a throwaway file). So: only run commands from the allowed list below.
  Create/edit ALL files with your write/edit tools, never with python/sh/heredocs/redirects. If you are not sure a command is allowed,
  do not run it: mark the item **NOT VERIFIED** in the report and continue with what you can do. Never try another command/script/tool
  to get around a denial.
- **Forbidden characters in any shell command: backticks, `$(`, `$VAR` expansions inside double quotes, heredocs, `node -e`/`python -c`
  with long inline scripts** (agy's permission check treats them as command substitution and DENIES the command, aborting the run;
  this happened in T0.5). Put test code in files you create with your write tool and run those files, e.g.
  `docker compose exec -T vite pnpm --filter aihome-app exec eslint <file>` or `... vitest run <file>`.
- Prefer your built-in file search/read tools over shell for exploring code. Read-only shell helpers allowed: `grep rg find ls cat head tail wc
  sort uniq cut tr stat du tree diff git diff|status|log|grep`. Anything else (sed, awk, python, node, curl, rm, git add/commit...) is NOT allowed.
- Print the final report even if some items are NOT VERIFIED; a run that ends without a report counts as failed.
- Allowed host commands (roughly): `docker compose ...`, `make ...`, `ls cat mkdir cp touch wc diff pwd grep find head tail echo mv`.
  Use your edit/write tools for file changes (not `sed -i`/heredocs). Do not use `rm`; if something must be deleted, list it under Follow-ups.

## 3-TEMP. TESTING POLICY FOR THE DELIVERY CRUNCH (overrides section 3 until the owner says otherwise)
The owner decided to DEFER new unit tests to a later pass so that features land faster. Therefore, for every task from now on:
- Do NOT write new test files and do NOT do sabotage checks. Do NOT delete or weaken existing tests; the existing suites must still pass (run them ONCE at the end of your task, not after every edit).
- Still REQUIRED (they are the safety net now): `declare(strict_types=1)`, no `any`, ESLint/Prettier/tsc (or Pint/Larastan) clean for the files you touch, the enforced arch tests, honest reports.
- Verify behaviour with quick, cheap manual checks instead: an artisan command, `curl` inside the api container, a small runnable script, the production build (`vite build`), reading the generated output. Say exactly what you ran and what you saw.
- End your report with a section `## Nợ test (Testing debt)`: the tests that SHOULD be written later (file name + the cases, including the hostile/boundary ones), so the later pass can implement them quickly.
- Be extra careful with hostile inputs even without tests: bounded cost, never throw on arbitrary input, no prototype pollution, no secrets in logs.

## 3. Testing standard (this is the most important part) - SUSPENDED, see 3-TEMP above
"Done" means the tests prove the behaviour, not that the code compiles.
1. Write tests together with the code. Cover: the happy path, every error path in the spec, boundary values and
   at least one hostile/odd input per feature (empty, huge, wrong type, unicode/Japanese text, injection-looking strings).
2. **Sabotage check (required):** for the 2–3 most important behaviours, temporarily break the implementation
   (e.g. remove the guard / change the status code), run the test, confirm it FAILS, then restore the code and confirm it
   passes again. Record which tests you sabotaged and the failing output line in the report. A test that cannot fail is worthless.
3. Never loosen an assertion to get green. Never use `skip`, `todo`, `markTestSkipped`, `.only`, `@ts-ignore`,
   `@ts-expect-error` (unless with a one-line justification), `eslint-disable` (same rule), or snapshot tests for UI.
4. Run the FULL suites at the end, not only your new tests: backend `vendor/bin/pest` (or `php artisan test`) and frontend
   `pnpm --filter aihome-app test` (once Vitest exists), plus lint/typecheck/static analysis for everything the task touched.
   All must exit 0. Run them twice (second run catches order-dependence / leftover state).
5. Tests must be deterministic: no sleeping on real time, no dependence on the dev DB contents, no network. Use the
   in-memory / test DB configuration; do not use or modify the developer's MySQL data.
6. The PHP suite runs ONLY on sqlite `:memory:`. `tests/TestCase.php` aborts every test if the app resolves any other database, and
   `phpunit.xml` forces `<env>` AND `<server>` values (Docker puts real DB/mail/queue settings into `$_SERVER`). Never weaken or bypass this.
   Laravel skips CSRF verification when the environment is `testing`; a test that must prove CSRF is enforced has to switch the
   environment (see tests/Feature/Auth/CsrfStatefulTest.php).
7. If you cannot execute something (sandbox blocks Docker, no network…), say **NOT VERIFIED** for exactly that item.
   Do not write "should pass". Do not guess outputs.

## 3a. Parallel lanes (up to 4 agents work at the same time in the SAME working tree)
Each task note names your lane. Stay inside your lane's files; never edit another lane's files, `Makefile`, `docker-compose.yml`, `phpunit.xml`, `docs/agy/**`, `docs/CODING_CONVENTION.md`, `docs/TASKS.md`.
- **PHP lane**: `apps/api/{app,bootstrap,config,database,routes,tests}`, `composer.*`, `docs/api-contract.md`. Tools: `docker compose exec -T api vendor/bin/pint --test|phpstan analyse`; run `vendor/bin/pest` once at the end.
- **CFG lane** (config-schema): `packages/config-schema/**`, `apps/api/resources/config-schema/**`, `docs/config-schema.md`. Tools: `pnpm --filter @aihome/config-schema lint|typecheck`.
- **UI lane** (React app): `apps/api/resources/{js,css,views}/**`, `apps/api/{package.json,vite.config.ts,vitest.config.ts,eslint.config.js,tsconfig.json}`. Tools: `pnpm --filter aihome-app lint|format:check|typecheck`, `vite build` via `make build`.
- **PKG lane** (new packages such as `packages/bdm`, `packages/planner`): only those directories and their docs. Copy the tooling files of `packages/config-schema` (tsconfig, eslint config, prettier config, package.json scripts). Tools: `pnpm --filter @aihome/<name> lint|typecheck`.
Shared files: `pnpm-lock.yaml` is touched by every `pnpm install`; run `pnpm install` only when you added a dependency, and if you see a lockfile conflict just run it again. Run ONLY your own lane's tools while working (other lanes may be mid-edit and failing; that is not yours: wait 2 minutes and retry, never touch their files).
The machine is overloaded by an unrelated render job: be patient and avoid running whole suites repeatedly.

## 3b. Customer-facing UI must follow the design (hard rule)
Any screen/component that END USERS see (wizard steps, results, landing, buttons/cards used there) must match the mockups in
`docs/design/` (read `docs/design/README.md` and LOOK at the relevant `.jpg` files with your image/file-view tool before writing UI).
Reproduce layout, section order, card/chip/stepper styles, palette and tone; fix the listed mockup flaws; design the mobile layout yourself in the
same visual language. In your report list what you reproduced, what you changed deliberately, and any NOT VERIFIED visual aspects.
Admin-only screens are exempt (they use the shared design system but need no mockup).

## 4. Code standards recap (details in the convention)
- TS: strict, no `any`, no non-null `!`, no `as` casts except `as const`; parse unknown data with Zod (add `zod` if the task needs it).
- React: function components, no `useEffect` for derived state/fetching, every user-visible string via i18n (after task T0.5),
  mobile-first, accessible (labels, keyboard).
- PHP: `declare(strict_types=1);`, typed returns, controllers thin (FormRequest -> Action/Service -> Resource), Pint-clean.
- Nothing business-related hard-coded that an admin might want to change later (see convention §7). When in doubt,
  put it in a clearly named constants/defaults file and mention it under "Follow-ups".
- No `console.log` / `dd()` / debug leftovers; no TODO without an issue-like note in Follow-ups.
- Commit nothing (no git repo). Do not create files outside what the task needs.

## 5. Final report (print it as your last output; keep it under ~50 lines, in Vietnamese)
```
# Báo cáo <TASK-ID>
## Đã làm        (bullet: file/thư mục chính đã tạo/sửa)
## Lệnh đã chạy  (mỗi lệnh kèm kết quả cuối, ví dụ "pest: 23 passed, 0 failed")
## Test đã thêm  (tên test hoặc nhóm test, nêu rõ các ca lỗi/biên)
## Sabotage      (test nào, phá gì, thấy lỗi gì, đã khôi phục)
## Giả định
## Chưa xác minh (NOT VERIFIED) / Hạn chế / Follow-ups
## Phụ thuộc mới (tên@phiên bản, lý do, PHP 8.2 OK?)
```
Be honest: an accurate report with gaps is better than a polished one that hides them.
