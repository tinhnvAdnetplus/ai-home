# AI HOME PLATFORM — Phân rã công việc (Task Breakdown)

Cỡ việc: **S** ≤ 1 ngày · **M** 2–4 ngày · **L** 1–2 tuần · **XL** cần tách nhỏ thêm khi bắt đầu.
Cỡ chỉ để so sánh tương đối, không phải cam kết thời gian.
`⛓` = phụ thuộc. `🔧` = phải cấu hình được ở admin (xem CODING_CONVENTION §7).

Mọi task đều tuân theo Definition of Done ở convention §11.

---

## Lộ trình tổng

```
P0 Nền tảng  →  P1 Config engine + Admin lõi  →  P2 Wizard động  →  P3 Planner + 2D
                                                                        ↓
                          P6 Hoàn thiện  ←  P5 AI  ←  P4 3D + Xuất CAD
```

P1 đứng **trước** wizard, vì wizard là sản phẩm của config engine. Làm ngược lại sẽ phải viết lại.

**Cổng kiểm chứng sớm (làm trước khi đầu tư nặng):**
- **G1 (cuối P1):** sửa một câu hỏi ở admin → xuất bản → người dùng thấy ngay, không deploy.
- **G2 (đầu P4):** file DXF sinh ra mở đúng kích thước trong **Jw_cad** và AutoCAD LT. Nếu sai, dừng và sửa trước khi làm tiếp.

---

## P0 — Nền tảng dự án

| ID | Việc | Cỡ | ⛓ | Tiêu chí hoàn thành |
|---|---|---|---|---|
| 0.1 | Khởi tạo monorepo pnpm + Turborepo; **một app** `apps/api` (Laravel + React trong `resources/js`), `packages/*` rỗng | M | | Docker Compose chạy được; production chỉ cần 1 cổng PHP |
| 0.2 | TS strict, ESLint flat + `boundaries`, Prettier, lint-staged, commitlint | S | 0.1 | Vi phạm import giữa feature bị báo lỗi |
| 0.3 | CI (typecheck, lint, test, build, kiểm bundle, Pint, Larastan, Pest) | M | 0.1 | PR đỏ nếu một bước fail |
| 0.4 | Tailwind + shadcn/ui + design tokens (CSS variables, chốt **một** bảng màu) | M | 0.1 | Storybook/trang kiểm tra component, có dark/light token |
| 0.5 | i18next + `ja` mặc định, helper `t()`; font Noto Sans JP | S | 0.1 | Không còn chuỗi cứng trong component mẫu |
| 0.6 | Laravel: auth (Sanctum), vai trò `admin/editor/architect/user`, Policy khung | M | 0.1 | Đăng nhập/ đăng xuất, kiểm quyền có test |
| 0.7 | MySQL migration nền + seeder idempotent; `.env.example`; hướng dẫn deploy PHP | M | 0.6 | Chạy từ DB rỗng lên môi trường dùng được |
| 0.8 | Chuẩn API: problem+json, versioning, pagination, rate limit | S | 0.6 | Bộ test hợp đồng cho lỗi chuẩn |
| 0.9 | `docs/GLOSSARY.md` (thuật ngữ Nhật–Việt–Anh) và ADR đầu tiên | S | | Được duyệt |

---

## P1 — Config engine và Admin lõi 🔧 (trọng tâm)

| ID | Việc | Cỡ | ⛓ | Tiêu chí hoàn thành |
|---|---|---|---|---|
| 1.1 | `packages/config-schema`: Zod schema cho các loại config (wizard, catalog, planner, estimate, legal, ai, export, content) | L | 0.1 | Mỗi loại có `defaults.ts` + test parse |
| 1.2 | Sinh JSON Schema từ Zod; PHP validate bằng đúng schema đó | M | 1.1 | Config sai bị chặn cả ở client lẫn server, cùng thông điệp lỗi |
| 1.3 | DB: `configs`, `config_versions`, `audit_logs`; bảng quan hệ cho `materials`, `media`, `room_types` | M | 0.7 | Migration + seeder đưa `defaults.ts` vào DB |
| 1.4 | API config: đọc bundle (ETag), CRUD bản nháp, publish, rollback | L | 1.2, 1.3 | Publish tạo version mới; rollback hoạt động; có audit |
| 1.5 | Client: `useConfig`/`getConfig`, parse Zod, fallback khi lỗi | M | 1.1, 1.4 | Config hỏng không làm trắng trang |
| 1.6 | Engine điều kiện hiển thị bằng JSON Logic + test | M | 1.1 | Có test cho ≥ 15 ca (kể cả "平屋 → ẩn toilet tầng 2") |
| 1.7 | Admin shell: layout, điều hướng, đăng nhập, phân quyền theo vai trò | M | 0.6, 0.4 | Role không đủ quyền thì bị 403 ở server |
| 1.8 | Admin: **trình dựng wizard** — bước, nhóm, field, option, kéo-thả sắp xếp, bắt buộc/mặc định, điều kiện, binding | XL | 1.4–1.7 | Tạo được STEP 1–5 chỉ bằng admin (không code) |
| 1.9 | Admin: quản lý media/ảnh option (upload, alt text, bản quyền) | M | 1.3 | Ảnh dùng được trong option; có trường nguồn/bản quyền |
| 1.10 | Admin: preview trực tiếp (dùng đúng `FieldRenderer`) + chế độ "xem bản nháp" bằng link | M | 1.8, 2.1 | Thấy thay đổi trước khi publish |
| 1.11 | Admin: lịch sử version, diff, rollback, audit log | M | 1.4 | Xem được ai đổi gì |
| 1.12 | Admin: **văn bản & nội dung** (LP, disclaimer, email, SEO, thông báo) có bản dịch ja/en | M | 1.4 | Đổi text không cần deploy |
| 1.13 | Admin: người dùng, vai trò, feature flag | M | 1.7 | |
| 1.14 | **G1: kiểm chứng end-to-end** sửa → publish → người dùng thấy | S | 1.8, 2.x | Playwright E2E xanh |

---

## P2 — Wizard động (người dùng)

> **Giao diện khách hàng (toàn bộ P2, 3.10 màn hình kết quả, 6.3 landing…) bắt buộc bám `docs/design/` (mockup từ `design.pdf`).** Màu chủ đạo: xanh dương (~#0b6bdc) + hồng nhấn STEP 4–5; bảng xanh lá của bản cũ không còn dùng cho giao diện khách. Mobile do ta thiết kế cùng ngôn ngữ hình ảnh.

| ID | Việc | Cỡ | ⛓ | Tiêu chí hoàn thành |
|---|---|---|---|---|
| 2.1 | `FieldRenderer` + registry loại field: text, number(+đổi tsubo↔m²), select, radio, checkbox-group, **image-select**, range, upload, textarea (đếm ký tự) | L | 1.1 | Mỗi loại có test + story |
| 2.2 | `WizardShell`: stepper, điều hướng, URL theo bước, thanh tiến độ, responsive 360px | M | 2.1 | Dùng được bằng bàn phím và điện thoại |
| 2.3 | Sinh Zod schema động từ config để validate từng bước | M | 1.1, 2.1 | Lỗi tiếng Nhật từ config |
| 2.4 | Điều kiện hiện/ẩn/vô hiệu; dọn giá trị của field vừa bị ẩn | M | 1.6, 2.1 | Đổi 2階→平屋 thì toilet tầng 2 bị bỏ khỏi dữ liệu |
| 2.5 | Lưu nháp: local khi chưa đăng nhập, server khi đã đăng nhập; `configVersion`; xử lý nháp lệch phiên bản | M | 1.5, 0.6 | Reload không mất dữ liệu; nháp cũ được di trú hoặc cảnh báo |
| 2.6 | Cấu hình dữ liệu **mặc định** của STEP 1–5 vào seed theo PDF (đã **loại trùng**: số tầng, diện tích, đỗ xe, phong cách chỉ hỏi một lần) | M | 1.8 | Bản đặc tả form được duyệt trước |
| 2.7 | Bước xác nhận cuối (tóm tắt, sửa nhanh từng bước) + disclaimer 検討用 | S | 2.2 | |
| 2.8 | Bản đồ vị trí đất (Leaflet + 国土地理院) + geocoding | M | 2.1 | Chọn được điểm; tọa độ vào dữ liệu |
| 2.9 | Upload 測量図/ảnh đất (kiểm MIME, kích thước, lưu riêng tư) | M | 0.7 | File lạ bị từ chối |
| 2.10 | Phân tích analytics bỏ dở theo field/bước (ẩn danh) | S | 2.2 | Admin thấy bước nào bỏ nhiều nhất |

---

## P3 — Planner và mặt bằng 2D

| ID | Việc | Cỡ | ⛓ | Tiêu chí hoàn thành |
|---|---|---|---|---|
| 3.1 | `packages/bdm`: schema Zod của Building Data Model (site, floors, rooms, walls, openings, stairs, roof, attributes) + `schemaVersion` + `migrate()` | L | 1.1 | Có tài liệu; test migrate |
| 3.2 | Tài liệu hóa `old-version/planner.js` (thuật toán, điều kiện, các hằng số) để chuyển đổi đúng | M | | `docs/planner-notes.md` |
| 3.3 | Tách hằng số của planner thành **config** 🔧 (danh mục phòng, mô-đun lưới, trọng số điểm, số phương án) | M | 1.1, 3.2 | Không còn hằng số nghiệp vụ trong code |
| 3.4 | Bảng ánh xạ **câu trả lời → ràng buộc** 🔧 + registry ràng buộc planner hỗ trợ | L | 1.1, 3.1 | Admin ánh xạ được "洗濯動線→adjacent(laundry,bath)" |
| 3.5 | Chuyển `planner.js` sang TS thuần (hàm thuần, tất định theo seed) | XL | 3.1–3.4 | Cùng input+seed → cùng output |
| 3.6 | Bộ test golden ≥ 10 ca đất/gia đình khác nhau; so khớp với kết quả bản cũ | L | 3.5 | Snapshot được duyệt |
| 3.7 | Kiểm tra pháp lý: 建ぺい率/容積率 từ dữ liệu config 🔧 + `warnings[]` có mã | M | 3.5 | `FAR_EXCEEDED` v.v. |
| 3.8 | Chạy planner trong Web Worker (Comlink), có tiến trình/hủy | M | 3.5 | UI không đơ khi sinh phương án |
| 3.9 | `packages/render2d`: BDM → SVG (tường, cửa, thiết bị, đường kích thước, hướng bắc, khung tên) | L | 3.1 | Khớp bản cũ; xuất SVG |
| 3.10 | Màn hình kết quả: so sánh 3 phương án, chấm điểm, chọn/ghim, yêu cầu sinh lại | L | 3.8, 3.9 | Dùng được trên điện thoại |
| 3.11 | Chỉnh sửa tương tác nhẹ trên mặt bằng (đổi cỡ/di chuyển phòng, kiểm tra lại ràng buộc) | XL | 3.10 | Tách nhỏ khi bắt đầu |
| 3.12 | Chi phí ước tính + vay trả góp 🔧 (đơn giá, hệ số, lãi suất ở config) | M | 1.1 | Đổi đơn giá ở admin là kết quả đổi |
| 3.13 | Lưu phương án (BDM + `configVersion`) vào DB, danh sách "phương án của tôi" | M | 1.3, 3.1 | Mở lại đúng như cũ |
| 3.14 | Admin: chỉnh tham số planner, danh mục phòng, bảng ánh xạ, đơn giá, bảng pháp lý, kèm chạy thử | L | 3.3, 3.4, 3.12 | Chạy thử ra phương án ngay trong admin |

---

## P4 — 3D, mặt đứng và xuất CAD

| ID | Việc | Cỡ | ⛓ | Tiêu chí hoàn thành |
|---|---|---|---|---|
| 4.1 | **G2 sớm:** prototype BDM → DXF (tường, cửa, kích thước, layer) + mở thử trong Jw_cad / AutoCAD LT | L | 3.1 | Kích thước đo lại đúng; ghi `docs/cad-compat.md` |
| 4.2 | `packages/cad-export`: DXF hoàn chỉnh; layer/màu/khổ giấy/khung tên từ config 🔧 | L | 4.1 | |
| 4.3 | `packages/render3d`: BDM → scene Three.js (tường, sàn, mái, cửa, vật liệu) | XL | 3.1 | Khớp mặt bằng khi BDM đổi |
| 4.4 | Viewer 3D (R3F): quỹ đạo, ánh sáng, chuyển tầng, ảnh chụp; **lazy-load**; fallback cho thiết bị yếu | L | 4.3 | Bundle ban đầu không chứa Three.js |
| 4.5 | Nội thất: bố trí đồ nội thất từ danh mục 🔧 | L | 4.3 | |
| 4.6 | Vật liệu/màu từ thư viện 🔧 áp vào 3D | M | 4.3, 1.3 | Đổi vật liệu ở admin → 3D đổi |
| 4.7 | Mặt đứng 4 hướng (SVG hoặc camera chiếu vuông góc) | L | 4.3 | |
| 4.8 | PDF bộ hồ sơ đề xuất (mPDF/TCPDF + Noto Sans JP) | L | 3.9, 4.7 | Tiếng Nhật không lỗi font |
| 4.9 | Admin: thư viện vật liệu, danh mục đồ nội thất, mẫu phong cách | L | 1.9 | |
| 4.10 | (Giai đoạn sau) xuất IFC; ghi rõ "RVT/DWG qua IFC/DXF" | XL | 4.2 | Không hứa trực tiếp |

---

## P5 — AI

| ID | Việc | Cỡ | ⛓ | Tiêu chí hoàn thành |
|---|---|---|---|---|
| 5.1 | `LlmProvider` (interface) + Gemini + Claude, timeout/retry/giới hạn, log token | M | 0.8 | Đổi nhà cung cấp bằng config |
| 5.2 | JSON Schema đầu ra "ràng buộc thiết kế"; validate server trước khi dùng | M | 1.2, 3.4 | Đầu ra lỗi bị từ chối, không đến planner |
| 5.3 | Hội thoại: hỏi bổ sung phần còn thiếu, đổi văn bản tự do → ràng buộc; có phần xác nhận của người dùng | L | 5.1, 5.2 | |
| 5.4 | Đọc 測量図 (vision) → tọa độ ranh đất → **màn hình xác nhận/chỉnh tay** | L | 2.9, 5.1 | Không dùng kết quả chưa được xác nhận |
| 5.5 | Hàng đợi job (queue + poll) cho tác vụ lâu | M | 0.8 | Hoạt động cả khi chỉ có cron |
| 5.6 | Ảnh phối cảnh AI từ ảnh render 3D làm đầu vào (khớp mặt bằng) | L | 4.4, 5.5 | |
| 5.7 | Bộ đánh giá: ≥ 20 câu yêu cầu tiếng Nhật thật, so sánh model, chốt model mặc định | M | 5.3 | Báo cáo kết quả |
| 5.8 | Admin: nhà cung cấp, model, prompt, nhiệt độ, hạn mức, **xem log & chi phí**, chạy thử prompt | L | 5.1 | Sửa prompt không cần deploy |
| 5.9 | Rate limit, lọc nội dung, xóa dữ liệu theo yêu cầu | S | 5.1 | |

---

## P6 — Cộng tác kiến trúc sư và hoàn thiện

| ID | Việc | Cỡ | ⛓ | Tiêu chí hoàn thành |
|---|---|---|---|---|
| 6.1 | Vai trò kiến trúc sư: hàng đợi phương án, xem BDM/ghi chú, **duyệt/yêu cầu sửa** | L | 3.13, 0.6 | Có trạng thái và lịch sử |
| 6.2 | Luồng "yêu cầu sửa / tư vấn" người dùng ↔ kiến trúc sư (bình luận + thông báo email) | L | 6.1, 1.12 | Mẫu email chỉnh ở admin |
| 6.3 | Trang giới thiệu (LP) dựng từ nội dung admin | M | 1.12 | SEO cơ bản, tốc độ tốt |
| 6.4 | Hiệu năng: bundle, ảnh (WebP/AVIF, lazy), Core Web Vitals | M | | Ngân sách đạt |
| 6.5 | Accessibility audit + sửa; test thiết bị thật (iOS Safari, Android Chrome) | M | | |
| 6.6 | Bảo mật: rà soát OWASP, CSP, pentest nhẹ | M | | |
| 6.7 | Pháp lý: chính sách riêng tư (APPI), điều khoản, disclaimer 建築士法 | S | | Bản luật sư duyệt |
| 6.8 | Giám sát lỗi (Sentry), log, backup DB, tài liệu vận hành | M | | Có runbook |
| 6.9 | Tài liệu: hướng dẫn admin, README, ADR | M | | |

---

## Thứ tự bắt đầu đề xuất

1. **0.9, 2.6** — chốt thuật ngữ và bản đặc tả form **đã loại trùng** (không tốn code, tránh làm lại nhiều nhất).
2. **P0** (0.1–0.8).
3. **1.1 → 1.6 → 2.1 → 1.8 → 1.14 (G1)** — dựng "mạch xương sống" config sớm nhất.
4. **3.1, 3.2 song song 4.1 (G2)** — kiểm chứng rủi ro DXF trong lúc làm planner.

## Câu hỏi cần chốt trước khi bắt đầu P0

1. Server là **shared hosting hay VPS**? (ảnh hưởng queue, SSE, cách deploy)
2. Admin có cần **đa ngôn ngữ** hay chỉ tiếng Nhật?
3. Ai là người dùng admin: chỉ đội nội bộ Adnet, hay cả công ty xây dựng đối tác (đa tenant)? Nếu đa tenant, phải thêm `tenant_id` vào mọi bảng ngay từ đầu, rất khó thêm về sau.
4. Có bắt buộc **đăng nhập** mới được xem kết quả, hay cho dùng thử ẩn danh?
5. Bản màu chốt: xanh dương (PDF) hay xanh lá (bản cũ)?
