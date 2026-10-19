# Mục Lục Bản Ghi Quyết Định Kiến Trúc (Architecture Decision Records - ADR)

Thư mục này lưu trữ các bản ghi quyết định kiến trúc quan trọng định hình toàn bộ AI HOME PLATFORM. Mỗi bản ghi (ADR) tuân thủ cấu trúc chuẩn gồm: **Bối cảnh (Context)**, **Quyết định (Decision)**, và **Hệ quả (Consequences)**.

---

## Danh Sách ADR

| Mã số | Tiêu đề | Trạng thái | Ngày duyệt | Tóm tắt quyết định |
|---|---|---|---|---|
| [ADR 0001](0001-single-laravel-app-serving-spa.md) | **Ứng dụng Laravel đơn lẻ phục vụ React SPA** | Accepted | 2026-10-12 | Một app Laravel 12 duy nhất (`apps/api`), 1 cổng HTTP/HTTPS, không cần Node.js runtime trên production. Vite build static assets vào `public/build/`. |
| [ADR 0002](0002-planner-in-browser-ts-vs-server.md) | **Thực thi bộ sinh mặt bằng (Planner) trên trình duyệt bằng TypeScript** | Accepted | 2026-10-12 | Planner (`@aihome/planner`) là hàm thuần, tất định (deterministic theo `seed`), chạy trong Web Worker trên máy người dùng, giảm tải 100% CPU cho backend. |
| [ADR 0003](0003-bdm-single-source-of-truth.md) | **Building Data Model (BDM) là nguồn sự thật duy nhất** | Accepted | 2026-10-12 | Cấu trúc dữ liệu JSON BDM (`@aihome/bdm`) bằng số nguyên mm là nguồn sự thật duy nhất cho mọi renderer (2D SVG, 3D Three.js, DXF CAD, PDF). |
| [ADR 0004](0004-llm-validated-constraints-only.md) | **LLM chỉ sinh ràng buộc đã kiểm thực, tuyệt đối không sinh hình học** | Accepted | 2026-10-12 | LLM chỉ trích xuất mong muốn người dùng thành danh sách ràng buộc Zod (`aiConstraintSchema`). Bộ sinh mặt bằng hình học xử lý việc đặt phòng trên lưới 910mm. |
| [ADR 0005](0005-config-documents-draft-publish.md) | **Quản lý cấu hình động bằng tài liệu phiên bản nháp / xuất bản** | Accepted | 2026-10-12 | Vòng đời Nháp (draft) sửa đổi tự do -> Xuất bản (published) sinh phiên bản bất biến (`v1, v2`) kèm ETag. Cung cấp rollback tức thì và fallback an toàn ở client. |
| [ADR 0006](0006-i18n-ja-en-vi.md) | **Hỗ trợ đa ngôn ngữ (i18n) với Tiếng Nhật là mặc định** | Accepted | 2026-10-12 | Tiếng Nhật (`ja`) là ngôn ngữ mặc định và fallback gốc cho toàn bộ UI và API. Hỗ trợ song song Tiếng Anh (`en`) và Tiếng Việt (`vi`). Cấm hard-code chuỗi ký tự. |

---

## Quy Trình Tạo ADR Mới

1. Tạo file mới theo định dạng: `000X-<ten-ngan-gon>.md`.
2. Tuân thủ cấu trúc tối thiểu:
   - Header: Trạng thái, Ngày quyết định, Người đề xuất, Phạm vi.
   - Bối cảnh (Context): Lý do cần đưa ra quyết định, các phương án cân nhắc.
   - Quyết định (Decision): Phương án được chọn và quy tắc kỹ thuật chi tiết.
   - Hệ quả (Consequences): Điểm tích cực, điểm tiêu cực / hạn chế và biện pháp giảm thiểu rủi ro.
   - Tài liệu liên quan: Liên kết đến CODING_CONVENTION, GLOSSARY, hoặc các gói liên quan.
3. Cập nhật bảng mục lục tại file `README.md` này và `README.md` ở thư mục gốc của dự án.
