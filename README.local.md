# Hướng dẫn Môi trường Local — AI HOME PLATFORM (Laragon)

Môi trường phát triển cục bộ chạy **trực tiếp trên Laragon** (nginx + php-cgi + mailpit), không dùng Docker.
Cấu hình Docker cũ được giữ lại để tham khảo tại `docker-compose.yml` (đã ngừng dùng — thiếu thư mục `docker/`
chứa Dockerfile nên không còn chạy được) và `Makefile.docker.bak`.

---

## 1. Yêu cầu hệ thống

| Thành phần | Phiên bản đang dùng trên máy | Ghi chú |
|---|---|---|
| **Laragon** | nginx **1.30.4**, php-cgi **PHP 8.3.33**, mailpit **1.22.3** | Bật `Start All` trong Laragon |
| **PHP** | 8.3.33 (`C:\laragon\bin\php\php-8.3.33-Win32-vs16-x64`) | `composer.json` yêu cầu `^8.2`; extension cần thiết (`pdo_sqlite`, `pdo_mysql`, `gd`, `intl`, `mbstring`, `fileinfo`) đã bật |
| **Composer** | global (`composer` trong PATH) | |
| **Node + pnpm** | Node 22/24, pnpm 9.15.4 | chỉ cần cho dev HMR và build React |
| **MySQL** | 8.4.6 có sẵn trong Laragon | **không bắt buộc** — mặc định dự án dùng SQLite |

> PHP trong PATH của Windows có thể là bản khác (XAMPP 8.2). Mọi task trong `laragon/dev.ps1` và
> `scripts/*.sh` đều tự dò PHP của Laragon; ghi đè bằng biến môi trường `PHP_BIN` nếu cần.

---

## 2. Khởi động nhanh

```powershell
# 1. Cài vhost nginx vào Laragon + kiểm tra file hosts, rồi reload nginx
.\laragon\dev.ps1 install-site

# 2. Cài dependency (lần đầu, hoặc khi composer.lock / pnpm-lock.yaml thay đổi)
.\laragon\dev.ps1 install

# 3. Migrate DB + xem trạng thái hạ tầng
.\laragon\dev.ps1 up

# 4. Build giao diện React (bản chạy 1 cổng PHP)
.\laragon\dev.ps1 build
```

Mở <http://ai-home.test:8080>.

`install-site` copy `laragon/nginx/ai-home.test.conf` sang `C:\laragon\etc\nginx\sites-enabled\`.
Nếu file hosts chưa có `ai-home.test`, script sẽ in ra lệnh cần chạy trong **PowerShell as Administrator**:

```powershell
Add-Content 'C:\Windows\System32\drivers\etc\hosts' '127.0.0.1 ai-home.test'
```

### Chế độ dev có HMR

```powershell
.\laragon\dev.ps1 dev     # Vite dev server ở cổng 5173, Laravel tự nạp asset từ đó
```

Vite tạo file `apps/api/public/hot`; khi tắt dev server, chạy `.\laragon\dev.ps1 build` (tự xóa `hot`)
để Laravel quay về dùng asset đã build trong `apps/api/public/build`. Nếu còn `hot` mà không có dev server,
trang sẽ không tải được JS/CSS.

---

## 3. Danh sách dịch vụ & URL truy cập

| Dịch vụ | Địa chỉ | Mô tả |
|---|---|---|
| **Ứng dụng (React + Laravel, 1 cổng)** | <http://ai-home.test:8080> | nginx của Laragon phục vụ `apps/api/public`; `/api/*` là API. **Đây là địa chỉ để dùng.** |
| API health | <http://ai-home.test:8080/api/v1/health> | JSON trạng thái hệ thống + DB |
| Vite dev server | <http://localhost:5173> | **Chỉ để dev (HMR)**. Production không cần cổng này |
| **Mailpit UI** | <http://localhost:8025> | Xem email gửi nội bộ |
| **Mailpit SMTP** | `127.0.0.1:1025` | `MAIL_HOST=127.0.0.1`, `MAIL_PORT=1025` trong `apps/api/.env` |
| Database | `apps/api/database/database.sqlite` | SQLite (WAL); xem mục 5 để chuyển sang MySQL |
| php-cgi (FastCGI) | `127.0.0.1:10987` | Upstream `php_upstream` của Laragon, không gọi trực tiếp |

Nginx của Laragon đang listen cổng **8080**; `00-default.conf` đã chiếm `server_name localhost` nên vhost
của dự án dùng tên riêng `ai-home.test`.

---

## 4. Các lệnh tiện ích

Task runner chính là `laragon\dev.ps1` (PowerShell). `Makefile` cũng đã được chuyển sang chạy native
với cùng bộ target, dùng được nếu máy có cài `make` (máy hiện tại chưa có).

```powershell
.\laragon\dev.ps1 status          # nginx / php-cgi / mailpit / mysql / vhost / hosts + URL
.\laragon\dev.ps1 install-site    # cài lại vhost nginx và reload
.\laragon\dev.ps1 nginx-reload    # nginx -t && nginx -s reload
.\laragon\dev.ps1 install         # composer install + pnpm install
.\laragon\dev.ps1 up              # migrate + in URL
.\laragon\dev.ps1 dev             # Vite dev server (HMR)
.\laragon\dev.ps1 build           # build React vào apps/api/public/build
.\laragon\dev.ps1 artisan route:list
.\laragon\dev.ps1 composer require vendor/pkg
.\laragon\dev.ps1 tinker
.\laragon\dev.ps1 migrate | fresh | seed | db-shell
.\laragon\dev.ps1 queue           # php artisan queue:work
.\laragon\dev.ps1 mail            # mở Mailpit UI
.\laragon\dev.ps1 lint | fix | test | typecheck | check | check-php | check-js
.\laragon\dev.ps1 schema | schema-check
.\laragon\dev.ps1 reset           # tạo lại DB sqlite sạch (hỏi xác nhận)
```

Các script bash trong `scripts/` (Git Bash) cũng đã chạy native:
`scripts/check-fast.sh` (các lane chạy song song), `scripts/smoke-ai.sh`, `scripts/smoke-projects.sh`,
`scripts/smoke-report.sh`. Mặc định chúng gọi `http://ai-home.test:8080`; ghi đè bằng `BASE_URL` /
`AI_BASE_URL`.

---

## 4b. Tài khoản thử nghiệm cục bộ (Dev Accounts)

Khi chạy ở môi trường `local`, seeder `DevUserSeeder` cung cấp sẵn 4 tài khoản (chạy `.\laragon\dev.ps1 seed`):

| Vai trò | Email | Mật khẩu mặc định | Quyền hạn (Abilities) |
|---|---|---|---|
| **Admin** | `admin@aihome.local` | `Password1234!` | `manage-config`, `manage-users`, `review-plans`, `own-plans` |
| **Editor** | `editor@aihome.local` | `Password1234!` | `manage-config`, `own-plans` |
| **Architect** | `architect@aihome.local` | `Password1234!` | `review-plans`, `own-plans` |
| **User** | `user@aihome.local` | `Password1234!` | `own-plans` |

*Lưu ý an toàn:* Seeder chỉ hoạt động khi `APP_ENV=local`; tự bỏ qua ở `production`/`staging` và idempotent.

---

## 5. Database

### SQLite (mặc định)

`apps/api/.env`:

```dotenv
DB_CONNECTION=sqlite
DB_DATABASE=D:/project/php/8.4/ai-home/apps/api/database/database.sqlite
```

Laravel cần **đường dẫn tuyệt đối** cho SQLite trên Windows — dùng dấu `/` để tránh escape backslash.

- Chạy lại migration: `.\laragon\dev.ps1 fresh`
- Xóa sạch và tạo lại DB: `.\laragon\dev.ps1 reset`

### Chuyển sang MySQL 8.4 của Laragon

1. Bật MySQL trong Laragon (Menu > MySQL, hoặc `Start All`).
2. Tạo DB và user:
   ```sql
   CREATE DATABASE aihome CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
   CREATE USER 'aihome'@'localhost' IDENTIFIED BY 'aihome_dev';
   GRANT ALL PRIVILEGES ON aihome.* TO 'aihome'@'localhost';
   ```
3. Sửa `apps/api/.env`:
   ```dotenv
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=aihome
   DB_USERNAME=aihome
   DB_PASSWORD=aihome_dev
   ```
   (Trong file `.env`, khóa `DB_DATABASE` xuất hiện ở hai chỗ — giá trị **cuối file** là giá trị có hiệu lực.)
4. `.\laragon\dev.ps1 artisan config:clear` rồi `.\laragon\dev.ps1 fresh`.

---

## 6. Xử lý lỗi thường gặp

### 6.1. Mở `http://ai-home.test:8080` không ra gì
- Kiểm tra `.\laragon\dev.ps1 status`: nginx/php-cgi phải `running`, `vhost` và `hosts` phải OK.
- Nginx của Laragon có thể được reload nhưng chưa nạp vhost mới → `.\laragon\dev.ps1 nginx-reload`.
- Nếu file hosts chưa có `ai-home.test`, thêm bằng PowerShell as Administrator (mục 2).

### 6.2. Lỗi `Failed opening required '.../vendor/autoload.php'`
Chưa cài dependency PHP: `.\laragon\dev.ps1 install` (hoặc `cd apps\api; composer install`).

### 6.3. Trang hiện ra nhưng không có CSS/JS
Còn file `apps/api/public/hot` trong khi Vite dev server không chạy. Chạy `.\laragon\dev.ps1 build`
hoặc `.\laragon\dev.ps1 dev`.

### 6.4. Cổng bận
- `8080` do nginx của Laragon dùng chung cho mọi vhost — muốn đổi thì sửa `listen` trong
  `laragon/nginx/ai-home.test.conf` rồi `install-site` lại, và cập nhật `APP_URL` +
  `SANCTUM_STATEFUL_DOMAINS` trong `apps/api/.env`.
- `5173` (Vite) được cấu hình `strictPort` trong `apps/api/vite.config.ts`.

### 6.5. Email không vào Mailpit
Mailpit chỉ bind `127.0.0.1:1025`, nên `MAIL_HOST` phải là `127.0.0.1` (không phải `mailpit` như thời Docker).
Kiểm tra mailpit đang chạy bằng `.\laragon\dev.ps1 status`.

### 6.6. Sai phiên bản PHP
`php -v` trong PATH có thể trả về bản khác (XAMPP). Các task đều dùng PHP của Laragon; nếu muốn chỉ định
bản khác: `$env:PHP_BIN = 'C:\laragon\bin\php\php-8.3.33-Win32-vs16-x64\php.exe'`.

---

## Triển khai lên server chỉ có PHP (một cổng, không cần Node)

React là giao diện của Laravel, nên chỉ có **một ứng dụng PHP**. Server thật không cần Node.

1. Ở máy dev/CI: `.\laragon\dev.ps1 build` → sinh `apps/api/public/build/` (JS/CSS đã build + `manifest.json`).
2. Upload thư mục `apps/api/` (kèm `public/build/`, **không** cần `node_modules`) lên server;
   `composer install --no-dev --optimize-autoloader` (hoặc upload sẵn `vendor/`).
3. Trỏ document root vào `apps/api/public`; `.env` production, `php artisan key:generate`,
   `php artisan migrate --force`.
4. Mọi URL không phải `/api/*` trả về trang React (route catch-all trong `routes/web.php`).

Lưu ý: local đang chạy **PHP 8.3** (Laragon). `composer.json` yêu cầu `php ^8.2` + Laravel 12, nên vẫn
tương thích server PHP 8.2.x. Laravel 13 cần PHP ≥ 8.3 — kiểm tra phiên bản PHP của server trước khi nâng.
