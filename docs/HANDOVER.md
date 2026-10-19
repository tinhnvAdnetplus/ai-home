# AI HOME PLATFORM — Tài liệu bàn giao (bản demo 2026-10-13)

> Trạng thái được ghi **trung thực**: mục "Đã xác minh" là thứ đã chạy/đo thật; mục "Chưa xác minh" là thứ chưa ai thử.

## 1. Sản phẩm là gì
Khách nhập yêu cầu qua wizard 5 bước (cơ bản, đất, mặt bằng, lối sống, thiết kế) → AI (Gemini) hiểu yêu cầu + ô văn bản tự do → bộ tạo mặt bằng (planner) sinh 3 phương án → xem 2D, 3D, mặt đứng 4 hướng, nhận xét của AI → tải SVG / DXF (CAD) / JSON / PNG / PDF hồ sơ.

## 2. Kiến trúc (một ứng dụng Laravel 12, PHP 8.2, một cổng, không cần Node khi chạy)
| Phần | Công nghệ | Vị trí |
|---|---|---|
| Backend + API | Laravel 12, Sanctum, MySQL | `apps/api` |
| Giao diện | React 18 + TS + Tailwind 4 (build ra tĩnh, Laravel phục vụ) | `apps/api/resources/js` |
| Cấu hình bộ câu hỏi | JSON schema + validator TS/PHP song song | `packages/config-schema`, `app/Config` |
| Mô hình nhà (BDM) | Zod, đơn vị mm | `packages/bdm` |
| Bộ tạo mặt bằng | TS thuần, tất định, chạy trong trình duyệt | `packages/planner` |
| 3D | Three.js (tải lười) | `packages/render3d`, `features/plan3d` |
| Mặt đứng SVG | TS thuần | `packages/elevation` |
| Xuất CAD | DXF R2000 / R12 | `packages/cad-export` |
| AI | Gemini (REST), Claude, bộ phân tích cục bộ dự phòng | `app/Ai` |
| PDF | mPDF + Noto Sans JP, phía server | `app/Reports` |

Quyết định kiến trúc: `docs/adr/0001..0006`. Thuật ngữ: `docs/GLOSSARY.md`. Triển khai: `docs/DEPLOY.md`. API: `docs/api-contract.md`, `docs/ai.md`.

## 3. Cách chạy (dev)
`laragon/dev.ps1 up` (Laragon: nginx + php-cgi + mailpit) → mở `http://ai-home.test:8080/#/wizard`. Tài khoản dev cục bộ: xem `docs/DEV_ACCOUNTS.md` (chỉ để dev, **không** tồn tại trên production).
Kiểm tra nhanh: `laragon/dev.ps1 check` (lint, typecheck, test, build).

## 4. Đường dẫn chính (hash routing)
`#/wizard` luồng chính · `#/login` `#/register` `#/projects` · `#/admin/...` (admin/editor: cấu hình wizard, lịch sử, AI usage, AI settings, dự án) · `#/plan3d-demo` (dev) · `#/ui` (dev).
Tham số chỉ có ở chế độ dev: `?lang=en|vi`, `#/wizard?step=N`, `#/wizard?result=1&ai=local`, `#/admin/...?demo=1`.

## 5. Đã xác minh (có bằng chứng chạy thật)
- Wizard 5 bước, 3 ngôn ngữ (cờ), vừa một màn hình ở cửa sổ thấp, điện thoại 390px (đã chụp STEP 1, 3).
- Luồng thật trên Chrome: wizard → `POST /api/v1/ai/constraints` (Gemini, 200) → planner → `POST /api/v1/ai/commentary` (200) → kết quả, huy hiệu "Gemini", không lỗi console.
- AI thật: hiểu đúng yêu cầu tiếng Nhật (LDK 18 jo, phòng ngủ 8 jo, 2 phòng trẻ em 6 jo, WIC, pantry, thú cưng…); lỗi AI → tự lùi về phân tích cục bộ và báo `degraded`.
- API dự án (smoke test): người khác đọc dự án → 404; đáp án sai → 422; payload quá lớn → 413.
- DXF: `ezdxf` đọc được cả R2000 và R12 ở chế độ nghiêm ngặt, 0 lỗi cấu trúc.
- PDF: smoke test 8/8 (200 + `%PDF`, 404 cho người khác, 422 ảnh giả, 413 quá lớn).
- Test tự động: 165 test backend, 167 test frontend đều qua; typecheck/lint/prettier sạch ở thời điểm kiểm tra gần nhất.

- `make check` (2026-10-13 00:10): EXIT 0 — backend 165 test, frontend 167 test, config-schema 102 test, pint, phpstan, ESLint, typecheck, prettier, build production kèm quét `verify-build`.
- Luồng thật trên Chrome (nhập đất 60 坪): Gemini 200 → kết quả: huy hiệu "Gemini", 3 phương án, mặt bằng 2D lớn có cửa/tên phòng/diện tích, mặt đứng 4 hướng, bảng đối chiếu trung thực ("要確認 (+10%/+22%)"), chọn DXF R2000/R12. Tab 3D chỉ không vẽ khi tab ở nền (cố ý tạm dừng); ảnh headless vẽ bình thường.
- **Đăng nhập thật trên Chrome (tài khoản dev):** đăng nhập → `#/projects` → "新しい間取りを作成" (bắt đầu từ STEP 1) → wizard → AI Gemini → kết quả; dự án lưu đúng (trạng thái `submitted`, 49 đáp án, 3 phương án); nút PDF tạo file `proposal-plan-a.pdf` hợp lệ. Lỗi tìm ra và đã sửa trong lần chạy này: (1) giao diện đọc sai phản hồi dự án (API trả không bọc `data`) làm mọi lần lưu hỏng và tạo trùng dự án rỗng; (2) đổi URL trước khi lưu đáp án làm luồng bị huỷ; (3) nút tạo mới mở lại bản nháp cũ; (4) Gemini thỉnh thoảng sinh đầu ra lặp bị cắt (`MAX_TOKENS`) → đã thêm thử lại một lần; (5) giới hạn AI mặc định 50 lượt/ngày/IP quá thấp → 300.
- Planner: 933 phương án có hash giống hệt sau khi tách file; oracle 117/117; không có phương án lệch quá ±8% mà không cảnh báo.

## 6. CHƯA xác minh / hạn chế đã biết
1. **DXF chưa mở thử trong Jw_cad / AutoCAD / DraftSight.** Danh sách kiểm tra thủ công: `docs/cad-compat.md`.
2. **Số liệu mặt bằng (đã đo 66 phương án, 5 cỡ đất × 4 mức diện tích × A/B/C):** kích thước nhà không còn phụ thuộc mặt tiền đất; phòng trẻ em 6,1 jo, LDK 17,9–18,4 jo, phòng ngủ chính 8,2 jo. **Tổng diện tích có thể lệch quá ±8% so với mong muốn** khi chương trình phòng khách yêu cầu cần nhiều diện tích hơn mức đã chọn (ví dụ yêu cầu 30 坪 với LDK 18 jo + 2 phòng trẻ em 6 jo + phòng ngủ chính 8 jo + WIC thì ra 33–37 坪; yêu cầu 25 坪 ra khoảng 34 坪). Mọi trường hợp lệch đều **kèm cảnh báo** (`TOTAL_AREA_DEVIATION`, `ROOM_SIZE_REDUCED`, `ROOM_DROPPED`) và được hiển thị "要確認" trong bảng đối chiếu; không có ca nào lệch mà không báo.
3. **Nội dung do hệ thống sinh ra chỉ có tiếng Nhật:** tên phương án ("案A｜家事動線重視"), tóm tắt/nhận xét của bộ phân tích cục bộ và prompt AI mặc định (`resources/ai/prompts/*.ja.md`). Giao diện (nhãn, nút, câu hỏi) đã đủ ja/en/vi (script `apps/api/scripts/i18n-audit.mjs` báo 0 vấn đề); muốn lời bình AI bằng tiếng Anh/Việt thì thêm prompt en/vi ở trang quản trị "AI設定".
3b. Nhà 3 tầng chưa hỗ trợ (tự lùi về 2 tầng, mã `FLOORS_THREE_STORY_FALLBACK`).
4. Phần quản trị mới thử ở chế độ demo (dữ liệu giả); chưa thử với phiên admin thật trên trình duyệt. (Đăng nhập người dùng thường, lưu dự án và PDF đã thử thật, xem mục 5.)
5. PDF: đã tạo từ luồng thật (153 KB, `%PDF-`) và xem 8 trang của bản smoke test (chữ Nhật chuẩn); chưa xem từng trang của file tạo từ luồng thật.
6. Giao diện điện thoại: chỉ chụp STEP 1 và STEP 3; STEP 2/4/5 và màn kết quả chưa duyệt kỹ.
7. Chưa có test đơn vị mới cho phần viết trong đợt gấp (nợ test ghi ở cuối từng báo cáo `docs/agy/reports/*.log`, chính sách 3-TEMP).
8. Chưa có CI chạy thật (đã có `.github/workflows/ci.yml` nhưng chưa có remote GitHub).
9. Ảnh trong giao diện là ảnh do AI tạo (không phải ảnh thật của khách); mặt bằng 3D là mô hình khối đơn giản, không phải ảnh phối cảnh AI.
10. Chưa làm: ảnh phối cảnh AI từ 3D, đọc bản vẽ đo đạc bằng ảnh (vision), hàng đợi job, xuất IFC.

**Lưu ý build:** luôn build bằng `pnpm --filter aihome-app build` (ép `NODE_ENV=production` và tự quét bản build). Container Vite dev đặt `NODE_ENV=development`, build trần sẽ mang cờ dev.

## 7. TRƯỚC KHI đưa lên production (bắt buộc)
- **Đổi khoá Gemini** (khoá hiện dùng đã từng xuất hiện trong cuộc trò chuyện) và đặt hạn mức/ngân sách trên Google AI Studio; chỉ để khoá trong `.env` của server.
- Xoá/không seed tài khoản dev; đặt `APP_ENV=production`, `APP_DEBUG=false`, `VITE_DEV_LOGIN_HINT` rỗng; xác nhận bản build không chứa mật khẩu dev.
- Giới hạn tốc độ AI hiện là 10 lần/phút/IP và `AI_DAILY_LIMIT`; endpoint AI cho phép khách chưa đăng nhập → cân nhắc yêu cầu đăng nhập hoặc CAPTCHA.
- Chạy: `php artisan migrate --force`, `config:cache`, `storage:link`, xuất bản bộ câu hỏi: `php artisan config:publish-file wizard <file>`; cron/queue theo `docs/DEPLOY.md`.
- Sao lưu DB; kiểm tra phiên bản PHP 8.2 và các extension (`composer check-platform-reqs`).

**Lưu ý triển khai:** không đưa file `public/hot` (do máy chủ dev sinh ra) lên production; loại trừ khi rsync.

## 8. Nơi tìm báo cáo chi tiết từng hạng mục
`docs/agy/reports/*.log` (mỗi task một báo cáo, gồm lệnh đã chạy và hạn chế), `docs/agy/tasks/*.md` (đặc tả), `docs/design/current/*.png` (ảnh chụp kiểm tra).
