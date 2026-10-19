# AI HOME PLATFORM (new-version)

Nền tảng tư vấn thiết kế và tạo mặt bằng nhà ở thông minh theo quy chuẩn kiến trúc và pháp lý Nhật Bản (建築基準法).

---

## 1. Điểm Nhấn Kiến Trúc (Architecture Highlights)

- **Một ứng dụng, một cổng (Single Port, Zero-Node at Runtime)**: Laravel 12 phục vụ cả REST API lẫn giao diện React SPA. Không cần runtime Node.js trên máy chủ sản xuất; frontend được biên dịch tĩnh thành các file đặt trong `apps/api/public/build/`.
- **PHP 8.2 tiêu chuẩn**: Tương thích hoàn hảo với môi trường sản xuất chạy PHP 8.2 (8.2.33). Tuyệt đối không dùng Laravel 13 hay các gói yêu cầu PHP ≥ 8.3.
- **Config-driven**: Toàn bộ câu hỏi wizard, đơn giá dự toán, tham số planner và nội dung được lưu trong cơ sở dữ liệu và quản lý qua hệ thống nháp / xuất bản (Draft / Published lifecycle), thay đổi không cần deploy mã nguồn.
- **Mô hình BDM (Building Data Model)**: Nguồn sự thật duy nhất (Single Source of Truth) bằng số nguyên milimét (`mm`) cho toàn bộ các công cụ biểu diễn 2D (SVG), 3D (Three.js), xuất CAD (DXF) và in ấn hồ sơ (PDF).
- **Bộ sinh mặt bằng trên trình duyệt (Browser Planner)**: Thuật toán tất định (deterministic) viết bằng TypeScript thuần chạy trong Web Worker trên máy người dùng, giảm thiểu 100% gánh nặng CPU cho máy chủ backend.
- **An toàn AI**: Mô hình ngôn ngữ lớn (LLM) chỉ trích xuất mong muốn người dùng thành danh sách ràng buộc đã kiểm thực Zod, tuyệt đối không sinh tọa độ hình học.

---

## 2. Yêu Cầu Cài Đặt (Prerequisites)

Môi trường local chạy trực tiếp trên **Laragon** (không dùng Docker):

- **Laragon** với nginx 1.30.4, PHP 8.3.x (php-cgi), mailpit 1.22.3 — bật `Start All`.
- **Composer** (global) và **Node + pnpm** (chỉ cần cho dev HMR / build React).
- MySQL 8.4 của Laragon là **tùy chọn** — mặc định dự án dùng SQLite.

Chi tiết (vhost, cổng, troubleshooting): [README.local.md](README.local.md).

---

## 3. Khởi Động Nhanh (Quick Start)

Thực hiện các bước sau từ thư mục gốc của dự án (PowerShell):

```powershell
# 1. Khởi tạo file cấu hình môi trường backend (nếu chưa có)
Copy-Item apps\api\.env.example apps\api\.env

# 2. Cài vhost nginx vào Laragon (+ hướng dẫn thêm hosts) rồi reload nginx
.\laragon\dev.ps1 install-site

# 3. Cài dependency PHP + JS
.\laragon\dev.ps1 install

# 4. Migrate DB và nạp tài khoản dev mẫu
.\laragon\dev.ps1 up
.\laragon\dev.ps1 seed

# 5. Build giao diện React (hoặc `dev` nếu muốn HMR)
.\laragon\dev.ps1 build
```

---

## 4. Các Đường Dẫn Dịch Vụ Cục Bộ (Local Service URLs)

| Dịch vụ | Đường dẫn URL | Mô tả |
|---|---|---|
| **Web Application (SPA)** | [http://ai-home.test:8080](http://ai-home.test:8080) | Giao diện React SPA phục vụ qua nginx của Laragon / Laravel |
| **API Health Check** | [http://ai-home.test:8080/api/v1/health](http://ai-home.test:8080/api/v1/health) | Kiểm tra trạng thái backend API và cơ sở dữ liệu |
| **Mailpit (Email Sandbox)** | [http://localhost:8025](http://localhost:8025) | Giao diện xem email gửi thử nghiệm (SMTP 127.0.0.1:1025) |
| **Vite Dev Server (HMR)** | [http://localhost:5173](http://localhost:5173) | Máy chủ Vite chỉ dùng khi dev để có tính năng Hot Module Replacement |

---

## 5. Tài Khoản Đăng Nhập Môi Trường Dev (Development Logins)

Hệ thống đã chuẩn bị sẵn các tài khoản cho các vai trò trong quá trình phát triển (`admin`, `editor`, `architect`, `user`).

> [!IMPORTANT]
> Để xem chi tiết danh sách tài khoản, vai trò và mật khẩu phát triển cục bộ, **vui lòng xem file [docs/DEV_ACCOUNTS.md](docs/DEV_ACCOUNTS.md)**.
> Các tài khoản này chỉ được tạo trong môi trường phát triển cục bộ (`APP_ENV=local`) và **TUYỆT ĐỐI KHÔNG ĐƯỢC TỒN TẠI TRÊN MÔI TRƯỜNG PRODUCTION**.

---

## 6. Các Lệnh Thao Tác Thường Dùng (Developer Commands)

Task runner của dự án là `laragon\dev.ps1` (PowerShell). `Makefile` có cùng bộ target cho máy nào cài `make`.

```powershell
# Kiểm tra toàn bộ chất lượng mã nguồn (Lint + Typecheck + Test cho cả PHP và JS)
.\laragon\dev.ps1 check

# Kiểm tra định dạng và coding style (Pint, ESLint, Prettier)
.\laragon\dev.ps1 lint

# Tự động sửa format mã nguồn
.\laragon\dev.ps1 fix

# Kiểm tra kiểu tĩnh (PHPStan/Larastan mức 6+, TypeScript tsc)
.\laragon\dev.ps1 typecheck

# Chạy toàn bộ các bộ test tự động (Pest cho backend, Vitest cho frontend)
.\laragon\dev.ps1 test

# Biên dịch React app cho môi trường sản xuất (ra apps/api/public/build)
.\laragon\dev.ps1 build

# Xem trạng thái hạ tầng Laragon (nginx / php-cgi / mailpit / vhost / hosts)
.\laragon\dev.ps1 status

# Chạy các lane kiểm tra song song (Git Bash, nhanh hơn ~3x)
bash scripts/check-fast.sh
```

---

## 7. Mục Lục Tài Liệu Kỹ Thuật (Documentation Index)

- **Quy chuẩn mã nguồn**: [docs/CODING_CONVENTION.md](docs/CODING_CONVENTION.md)
- **Kế hoạch & Phân rã công việc**: [docs/TASKS.md](docs/TASKS.md)
- **Hướng dẫn triển khai production**: [docs/DEPLOY.md](docs/DEPLOY.md)
- **Bảng thuật ngữ Nhật - Anh - Việt**: [docs/GLOSSARY.md](docs/GLOSSARY.md)
- **Tài khoản môi trường dev**: [docs/DEV_ACCOUNTS.md](docs/DEV_ACCOUNTS.md)
- **Hợp đồng API (API Contract)**: [docs/api-contract.md](docs/api-contract.md)
- **Cấu hình Schema (Zod & JSON Schema)**: [docs/config-schema.md](docs/config-schema.md)
- **Hướng dẫn xuất bản cấu hình (CLI)**: [docs/config-publishing.md](docs/config-publishing.md)
- **Đặc tả bộ sinh mặt bằng (Planner)**: [docs/planner.md](docs/planner.md)
- **Đặc tả tích hợp AI**: [docs/ai.md](docs/ai.md)

### Bản Ghi Quyết Định Kiến Trúc (Architecture Decision Records - ADR)
- [Mục lục ADR](docs/adr/README.md)
- [ADR 0001: Ứng dụng Laravel đơn lẻ phục vụ React SPA](docs/adr/0001-single-laravel-app-serving-spa.md)
- [ADR 0002: Thực thi bộ sinh mặt bằng (Planner) trên trình duyệt bằng TypeScript](docs/adr/0002-planner-in-browser-ts-vs-server.md)
- [ADR 0003: Building Data Model (BDM) là nguồn sự thật duy nhất](docs/adr/0003-bdm-single-source-of-truth.md)
- [ADR 0004: LLM chỉ sinh ràng buộc đã kiểm thực, tuyệt đối không sinh hình học](docs/adr/0004-llm-validated-constraints-only.md)
- [ADR 0005: Quản lý cấu hình động bằng tài liệu phiên bản nháp / xuất bản](docs/adr/0005-config-documents-draft-publish.md)
- [ADR 0006: Hỗ trợ đa ngôn ngữ (i18n) với Tiếng Nhật là mặc định](docs/adr/0006-i18n-ja-en-vi.md)
