# AI HOME PLATFORM — Coding Convention

Áp dụng cho toàn bộ `new-version/`. Khi quy tắc xung đột với thói quen cá nhân, quy tắc ở đây thắng.
Quy tắc nào tự động kiểm tra được thì để ESLint / Pint / CI kiểm tra, không dựa vào review bằng mắt.

---

## 0. Bốn nguyên tắc nền (đọc trước, vi phạm là reject PR)

1. **Config-driven.** Mọi thứ "động" (câu hỏi, lựa chọn, văn bản, đơn giá, tham số planner, prompt AI, danh mục vật liệu…) nằm trong **database và sửa được ở trang quản trị**, không nằm trong code. Xem §7.
2. **Một nguồn dữ liệu công trình (BDM).** Mặt bằng 2D, 3D, DXF, IFC, ảnh phối cảnh đều sinh ra từ BDM. Không ai được "vẽ riêng" từ dữ liệu khác.
3. **Lõi tính toán là hàm thuần.** Planner, tạo DXF, chiếu mặt đứng không đụng DOM, React, mạng, `Date.now()`, `Math.random()` (dùng seed).
4. **Đơn vị trong lõi luôn là mm (số nguyên).** Tsubo, 帖, m² chỉ xuất hiện ở lớp hiển thị và nhập liệu.

---

## 1. Công nghệ và công cụ

| Hạng mục | Chuẩn |
|---|---|
| Package manager | pnpm (workspace) + Turborepo. Khóa phiên bản trong `packageManager` |
| Frontend | React + Vite + TypeScript **strict** |
| Routing | React Router (data router) |
| Server state | TanStack Query |
| Form | React Hook Form + Zod (`@hookform/resolvers`) |
| UI state | `useState` cục bộ trước; chia sẻ giữa nhiều component mới dùng Zustand |
| Style | Tailwind CSS + shadcn/ui (Radix). Token màu ở CSS variables |
| 3D | Three.js + `@react-three/fiber` + `drei` |
| i18n | i18next (`ja` mặc định, sẵn chỗ cho `en`, `vi`) |
| Test | Vitest + Testing Library; Playwright cho E2E |
| Lint / format | ESLint (flat config) + Prettier; `eslint-plugin-boundaries` cho quy tắc import |
| Backend | **PHP 8.2** (khớp server production 8.2.33) / **Laravel 12** (Laravel 13 cần PHP ≥ 8.3 nên không dùng), MySQL, Pint (PSR-12), Larastan mức 6+, Pest |
| Phiên bản | Ghim chính xác (không `^`) cho dependency lõi; Renovate/Dependabot cập nhật theo PR |

---

## 2. Cấu trúc thư mục và quy tắc import

Dùng **feature-based**, không chia theo loại file (`components/`, `hooks/` toàn cục).

**Một ứng dụng, một cổng.** React là giao diện của Laravel, không phải một app tách rời: mã React nằm trong `apps/api/resources/js`, build ra `apps/api/public/build` và do Laravel phục vụ (route catch-all trả về `app.blade.php`; `/api/*` đi vào `routes/api.php`). Server production chỉ cần PHP, **không cần Node**. Build ở máy/CI rồi upload `public/build`. Vite dev server (cổng 5173) chỉ dùng khi dev để có HMR.

```
apps/api/resources/js/
  app/            # provider, router, layout gốc, khởi tạo (chỉ "lắp ráp")
  features/       # mỗi tính năng một thư mục tự chứa
    <feature>/
      api/        # hàm gọi API + query/mutation hooks
      components/ # component riêng của feature
      hooks/
      schemas/    # zod riêng feature (nếu không dùng chung)
      store/      # zustand riêng (nếu cần)
      index.ts    # CHỈ export những gì feature khác được phép dùng
  shared/         # không biết gì về nghiệp vụ: ui/, lib/, hooks/, config/
packages/         # bdm, planner, render2d, render3d, cad-export, config-schema
```

**Chiều phụ thuộc một chiều:** `app → features → shared → packages`.
- Feature **không import** feature khác trực tiếp (chỉ qua `index.ts` công khai, hoặc đẩy phần chung xuống `shared/`).
- `packages/*` không import từ `apps/*`; không import React (trừ `render3d`).
- Cấm import xuyên sâu (`features/a/components/X`) từ bên ngoài feature. ESLint enforce.
- Cấm barrel `index.ts` ở mọi thư mục con (làm hỏng tree-shaking); chỉ ở gốc feature/package.

---

## 3. Đặt tên

| Đối tượng | Quy ước | Ví dụ |
|---|---|---|
| Component, type, interface | `PascalCase` | `WizardStep`, `BuildingModel` |
| File component | `PascalCase.tsx` | `FieldRenderer.tsx` |
| Hook | `useXxx`, file `useXxx.ts` | `useWizardConfig.ts` |
| Hàm, biến | `camelCase` | `placeRooms` |
| Hằng số thật (không đổi) | `UPPER_SNAKE_CASE` | `GRID_MM` |
| File khác, thư mục | `kebab-case` | `form-schema.ts`, `floor-plan/` |
| Zod schema | `xxxSchema`; type suy ra `Xxx` | `wizardStepSchema` / `WizardStep` |
| Biến boolean | tiền tố `is/has/can/should` | `isDirty` |
| Handler | prop `onXxx`, hàm `handleXxx` | `onSubmit` / `handleSubmit` |
| Test | `xxx.test.ts(x)` cạnh file được test | |
| Bảng DB | `snake_case` số nhiều | `wizard_steps` |
| Khóa config | `dot.case` ổn định, **không đổi tên sau khi phát hành** | `estimate.cost_per_tsubo.wood` |
| Biến môi trường | `VITE_` (public) / không tiền tố (server) | |

Tên phải theo nghiệp vụ Nhật khi có thuật ngữ chuẩn: dùng `buildingCoverageRatio` (建ぺい率), `floorAreaRatio` (容積率), `tsubo`, `jo` (帖). Có bảng thuật ngữ ở `docs/GLOSSARY.md`; không tự đặt từ đồng nghĩa.

---

## 4. TypeScript

- `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`.
- **Cấm `any`.** Dữ liệu không rõ kiểu dùng `unknown` rồi parse bằng Zod. Ngoại lệ phải có `// eslint-disable-next-line` kèm lý do.
- **Cấm `as` ép kiểu** trừ `as const` và chỗ đã có type guard. Cấm non-null `!`.
- Type suy ra từ Zod (`z.infer`) là nguồn duy nhất; không viết tay song song một interface giống hệt.
- Ranh giới hệ thống (API response, localStorage, kết quả LLM, file upload, URL params) **luôn parse bằng Zod** trước khi dùng.
- Ưu tiên `type` + union có discriminant thay cho enum. Trạng thái dùng discriminated union (`{status:'loading'} | {status:'ok', data}`), không dùng nhiều boolean rời.
- Export có tên (named export). `default export` chỉ cho page lazy-load.
- Hàm công khai của `packages/*` có kiểu trả về khai báo rõ.

---

## 5. React

**Component**
- Chỉ function component. Một component chính mỗi file; tối đa ~150 dòng, vượt thì tách.
- Props là `type`, đặt ngay trên component; không dùng `React.FC`.
- Component thuần hiển thị (nhận props) tách khỏi component "container" (lấy dữ liệu).
- Không định nghĩa component lồng trong component khác.
- `key` ổn định theo id, không dùng index khi danh sách đổi thứ tự/thêm/xóa.
- Cấm `dangerouslySetInnerHTML` với dữ liệu từ config/người dùng, trừ khi qua DOMPurify.

**State, đặt đúng chỗ**
| Loại | Công cụ |
|---|---|
| Dữ liệu từ server (config, phương án, user) | TanStack Query, **không** copy vào Zustand/useState |
| Dữ liệu form | React Hook Form |
| Trạng thái UI cục bộ | `useState` / `useReducer` |
| Chia sẻ UI giữa nhiều nơi (vd. phương án đang chọn trong viewer) | Zustand, chia slice nhỏ, dùng selector |
| Trạng thái nên bookmark được (bước hiện tại, tab) | URL (search params) |

**Hook và hiệu năng**
- **Không dùng `useEffect` để**: tính giá trị suy ra (tính ngay khi render), gọi API (dùng Query), đồng bộ state này sang state kia. Chỉ dùng cho đồng bộ với hệ thống ngoài (WebGL, Worker, listener).
- `useMemo`/`useCallback`/`memo` **chỉ khi đã đo** thấy chậm hoặc cần ổn định tham chiếu cho dependency. Có comment lý do.
- Tính toán nặng (planner, dựng scene) chạy trong **Web Worker** (Comlink); không chặn main thread.
- Code splitting: mỗi route `lazy()`; **Three.js và viewer 3D chỉ tải khi vào màn hình kết quả**. Ngân sách bundle ban đầu ≤ 250 kB gzip, CI báo nếu vượt.
- Danh sách dài (vd. thư viện vật liệu trong admin) dùng virtualization.

**Lỗi và trạng thái**
- Mỗi route có `ErrorBoundary`; mỗi query có đủ 3 trạng thái: loading (skeleton), error (có nút thử lại), empty.
- Không `console.log` trong code commit; dùng `logger` ở `shared/lib`.

**Form**
- Mọi form dùng RHF + Zod. Lỗi hiển thị bằng tiếng Nhật lấy từ i18n/config, không hard-code.
- Bản nháp wizard tự lưu (server khi đã đăng nhập, `localStorage` khi chưa), có version để bỏ bản nháp lỗi thời khi config đổi.

**Accessibility và responsive**
- Thiết kế **mobile-first**, kiểm thử ở 360px. Vùng chạm ≥ 44px.
- Dùng phần tử ngữ nghĩa; mọi control có label; thao tác được bằng bàn phím; tương phản đạt WCAG AA.
- Mặt bằng SVG và viewer 3D có `aria-label` và mô tả văn bản thay thế (danh sách phòng + diện tích).

---

## 6. Lõi tính toán (`packages/*`)

- Hàm thuần, đầu vào/đầu ra là JSON đã định kiểu. Không side-effect.
- **Tất định:** cùng input + `seed` → cùng output. Seed là tham số tường minh.
- Mọi hằng số nghiệp vụ (kích thước phòng tối thiểu, trọng số chấm điểm, mô-đun lưới…) **nhận từ tham số `config`**, không import cứng. Giá trị mặc định nằm trong `defaults.ts`, đồng thời là dữ liệu seed cho DB.
- Mỗi package có test dạng **golden**: bộ input mẫu → so sánh snapshot output (đất 60 tsubo, mặt tiền 10 m, đường phía Nam…). Đổi thuật toán mà snapshot đổi phải được duyệt có chủ đích.
- Kết quả planner luôn kèm `warnings[]` có mã lỗi + tham số (vd. `FAR_EXCEEDED`), không trả chuỗi văn bản; chuỗi hiển thị lấy từ i18n/config.
- BDM có `schemaVersion`; mỗi lần đổi cấu trúc phải có hàm `migrate(vN → vN+1)` và test.

---

## 7. Quy tắc config-driven (trọng tâm của dự án)

### 7.1 Cái gì là config, cái gì là code

| Cấu hình được ở admin | Vẫn là code |
|---|---|
| Bước wizard, nhóm câu hỏi, trường, thứ tự, bắt buộc/tùy chọn, mặc định, text trợ giúp | **Loại field** (text, number, select, image-select, range, upload…): thêm loại mới cần dev |
| Danh sách lựa chọn (nhãn, icon, ảnh, giá trị) | Thuật toán planner, bộ render, bộ xuất CAD |
| Điều kiện hiện/ẩn/vô hiệu field | Cú pháp biểu thức điều kiện |
| **Ánh xạ câu trả lời → ràng buộc thiết kế** (vd. "muốn giặt giũ tiện" → `adjacent(laundry, bath)`) | Danh sách **ràng buộc mà planner hiểu được** (capability registry) |
| Danh mục phòng (kích thước min/max/mặc định, vùng, ưu tiên kề nhau) | Kiểm tra hợp lệ hình học |
| Trọng số chấm điểm phương án, số phương án sinh ra | |
| Đơn giá chi phí, hệ số vùng/kết cấu, lãi suất mặc định | Công thức tổng quát (chỉ nhận hệ số từ config) |
| Giới hạn pháp lý mặc định theo 用途地域 | |
| Danh mục phong cách, vật liệu, màu, ảnh tham khảo | |
| AI: nhà cung cấp, model, system prompt, nhiệt độ, hạn mức/người dùng | Lớp adapter và schema JSON đầu ra |
| Xuất CAD: tên layer, màu, khổ giấy, khung tên bản vẽ | Cấu trúc file DXF/IFC |
| Văn bản site, SEO, disclaimer, email, thông báo | |
| Vai trò, quyền, feature flag | |

> **Lưu ý quan trọng:** admin thêm một câu hỏi mới **không tự làm planner thay đổi kết quả**. Field phải có `binding` trỏ vào một khóa ràng buộc mà planner đã hỗ trợ. Field không có binding vẫn được lưu và gửi cho kiến trúc sư như ghi chú. Giao diện admin phải nói rõ điều này khi tạo field.

### 7.2 Kiến trúc config

- Mỗi loại config có **Zod schema duy nhất** ở `packages/config-schema`. Từ đó sinh **JSON Schema** (`zod-to-json-schema`) để PHP kiểm tra ở server. **Không viết hai bộ validate bằng tay.**
- Lưu trữ: bảng `configs(key, scope, value JSON, version, status, updated_by, updated_at)` + bảng lịch sử. Bảng quan hệ riêng cho dữ liệu lớn có cấu trúc (vật liệu, ảnh, phòng).
- **Vòng đời: `draft → published`.** Admin sửa bản nháp, xem trước, rồi mới xuất bản. Mỗi lần xuất bản tạo version mới; **rollback một bước**. Phương án của người dùng ghi lại `configVersion` đã dùng, để mở lại phương án cũ vẫn đúng.
- Có audit log (ai sửa gì, lúc nào, diff).
- **Seed bằng mặc định:** mọi config có giá trị mặc định trong code (`defaults.ts`) và được seed vào DB. Hệ thống phải chạy được khi DB rỗng.
- Client lấy config qua `GET /api/v1/config/bundle` (ETag, cache); TanStack Query với `staleTime` dài. Mọi config **parse bằng Zod ở client**; config lỗi → dùng bản đã published trước đó + báo lỗi, không làm trắng trang.
- **Điều kiện hiển thị dùng JSON Logic** (hoặc DSL tương đương) chạy trên dữ liệu thuần. **Cấm `eval`, `new Function`, template engine chạy mã.**
- Văn bản hiển thị: khóa i18n + bản dịch lưu trong config (`{ ja: "...", en: "..." }`); thiếu bản dịch thì rơi về `ja`.
- Không lặp lại giá trị config ở nhiều nơi. Lấy qua `useConfig(key)` / `getConfig(key)`; hàm này là điểm duy nhất đọc config.

### 7.3 Admin UI

- Mọi form admin sinh từ cùng config-schema, có **xem trước trực tiếp** (preview wizard bằng đúng component người dùng thấy).
- Phân quyền theo vai trò (`admin`, `editor`, `architect`, `user`); kiểm ở server bằng Policy, UI chỉ ẩn nút.
- Thao tác nguy hiểm (xuất bản, xóa lựa chọn đang được dùng) cần xác nhận và hiển thị tác động ("N phương án đang dùng lựa chọn này").
- Xóa mềm. Lựa chọn đã từng dùng chỉ được **ẩn**, không xóa cứng.

---

## 8. API (Laravel)

- REST JSON, tiền tố `/api/v1`, danh từ số nhiều, `kebab-case`: `/api/v1/plans/{id}/exports`.
- Controller **mỏng**: `FormRequest` (validate) → `Service`/`Action` (nghiệp vụ) → `Resource` (định dạng trả về). Không viết nghiệp vụ trong controller hay model.
- Phân quyền bằng Policy; mọi query theo người dùng phải scope để chống IDOR.
- Lỗi theo RFC 9457 (`application/problem+json`): `type`, `title`, `status`, `detail`, `errors{}`; mã lỗi ổn định (`PLAN_GENERATION_FAILED`) để client dịch.
- Phân trang bằng cursor/`page`+`per_page` (tối đa 100). Ngày giờ ISO 8601 UTC.
- Việc chạy lâu (ảnh phối cảnh, đọc 測量図) **không chạy trong request**: tạo job, trả `202 + jobId`, client poll `GET /jobs/{id}`; xử lý bằng queue (cron `queue:work --stop-when-empty` nếu hosting không có daemon).
- Proxy AI: key chỉ ở server; mỗi lời gọi qua `LlmProvider` (interface) → `GeminiProvider` / `ClaudeProvider`; **kết quả luôn validate bằng JSON Schema trước khi dùng**; có timeout, retry giới hạn, rate limit theo người dùng, log token/chi phí.
- Migration có `down()`; không sửa migration đã chạy ở production; seeder idempotent.
- PHP: PSR-12 qua Pint, `declare(strict_types=1)`, kiểu trả về đầy đủ, Larastan ≥ mức 6.

---

## 9. Bảo mật và dữ liệu cá nhân (APPI)

- Địa chỉ đất, thành viên gia đình, ngân sách là dữ liệu cá nhân: HTTPS bắt buộc, chỉ thu thập trường cần thiết, có trang chính sách và chức năng xóa dữ liệu theo yêu cầu.
- Upload: kiểm MIME thật + kích thước + đuôi file; lưu ngoài thư mục public, tên ngẫu nhiên; quét/giới hạn PDF; không bao giờ phục vụ trực tiếp từ đường dẫn người dùng đặt.
- Không đưa dữ liệu cá nhân vào log. Chỉ dùng gói AI trả phí/vùng cho phép (không dùng gói miễn phí có thể huấn luyện trên dữ liệu).
- Secret chỉ trong `.env` (không commit); `.env.example` đầy đủ khóa, không giá trị thật.
- CSRF/CORS/CSP cấu hình chặt; nội dung do admin nhập (HTML/Markdown) luôn sanitize khi hiển thị.
- Mọi kết quả sinh ra gắn dòng **「検討用プランです。建築士による確認が必要です」** (lấy từ config, không cho phép tắt ở UI người dùng).

---

## 10. Kiểm thử

| Mức | Công cụ | Bắt buộc cho |
|---|---|---|
| Unit | Vitest / Pest | `packages/*` (≥ 85% dòng), hàm tiện ích, service PHP |
| Golden/snapshot | Vitest | planner, DXF, BDM migration |
| Component | Testing Library | Field renderer, wizard, các màn hình admin quan trọng |
| E2E | Playwright | Luồng chính: nhập wizard → sinh phương án → xem 3D → tải DXF; luồng admin: sửa config → xuất bản → người dùng thấy thay đổi |
| Tương thích CAD | Thủ công, có checklist | DXF mở được trong Jw_cad, AutoCAD LT; ghi kết quả vào `docs/cad-compat.md` |

Test mô tả hành vi (`it('ẩn trường toilet tầng 2 khi chọn 平屋')`), không test chi tiết cài đặt. Không dùng snapshot cho UI React.

---

## 11. Git và quy trình

- Nhánh: `main` (luôn deploy được) ← `feat/…`, `fix/…`, `chore/…`. Rebase trước khi merge, squash merge.
- Commit theo **Conventional Commits**: `feat(wizard): thêm field loại image-select`. Phạm vi = tên feature/package.
- PR ≤ ~400 dòng đổi (không tính file sinh tự động/snapshot); 1 PR = 1 mục đích.
- CI bắt buộc xanh: typecheck, lint, test, build, kiểm bundle, Pint + Larastan + Pest.
- Pre-commit (lint-staged): format + lint file đã đổi.

**Definition of Done**
- [ ] Đúng yêu cầu, có test phù hợp mức §10
- [ ] Không hard-code dữ liệu nghiệp vụ (đã tự hỏi: *"admin có cần sửa cái này không?"*)
- [ ] Đủ trạng thái loading / error / empty; dùng được ở 360px và bằng bàn phím
- [ ] Chuỗi hiển thị qua i18n/config
- [ ] Không `any`, không `console.log`, không TODO không có issue
- [ ] Cập nhật tài liệu / `defaults.ts` / seeder nếu thêm config mới
- [ ] Không có dữ liệu cá nhân trong log

---

## 12. Comment và tài liệu

- Code tự giải thích bằng tên; comment chỉ để giải thích **lý do** (đặc biệt quy ước kiến trúc Nhật, công thức pháp lý), không lặp lại cái code đã nói.
- Hàm công khai của `packages/*` có TSDoc: đơn vị, miền giá trị, ví dụ.
- Quyết định kiến trúc quan trọng ghi ADR ngắn ở `docs/adr/NNNN-tên.md`.
- Ngôn ngữ: code, tên biến, commit, comment bằng **tiếng Anh**; tài liệu nội bộ tiếng Việt; UI tiếng Nhật.
