# Hướng Dẫn Triển Khai (Deployment Guide) — AI HOME PLATFORM

Tài liệu này hướng dẫn chi tiết quy trình triển khai AI HOME PLATFORM lên máy chủ production chạy **PHP 8.2** với kiến trúc **1 cổng HTTP duy nhất, không cần cài đặt Node.js trên máy chủ vận hành (Zero-Node at Runtime)**.

---

## 1. Kiến Trúc Vận Hành (Runtime Architecture)

Hệ thống AI HOME PLATFORM được thiết kế theo nguyên tắc tối giản hạ tầng:
- **Một ứng dụng, một cổng**: Laravel 12 phục vụ cả API (`/api/*`) lẫn giao diện React SPA (`/`).
- **Không cần Node.js trên production**: Mã nguồn React (`apps/api/resources/js`) được biên dịch sẵn tại máy phát triển hoặc CI pipeline (GitHub Actions) thành các file tĩnh đặt trong `apps/api/public/build/`. Máy chủ chỉ cần PHP-FPM 8.2 và Nginx/Apache.
- **Điều hướng Hash Routing (`#/`)**: Giao diện người dùng sử dụng client-side hash routing (ví dụ: `/#/wizard/step-1`). Mọi yêu cầu HTTP gửi đến máy chủ đều trỏ về URI gốc `/` hoặc tài nguyên tĩnh, không cần cấu hình rewrite URL phức tạp để giữ route phía client.
- **Single Source of Truth**: Cấu hình wizard, đơn giá, tham số planner được lưu trong cơ sở dữ liệu MySQL và quản lý phiên bản qua hệ thống nháp/xuất bản (Draft / Published lifecycle).

```
[Người dùng / Trình duyệt]
            │
            ▼ (Port 80/443)
┌────────────────────────────────────────────────────────┐
│ Máy chủ Web (Nginx / Apache)                            │
│                                                        │
│  ├─ /build/* (JS, CSS, Media) ──► Phục vụ trực tiếp    │
│  ├─ /api/* ─────────────────────► PHP-FPM (Laravel)    │
│  └─ / (SPA Shell Blade) ────────► PHP-FPM (index.php)  │
└────────────────────────────────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────────────────────┐
│ PHP 8.2 (Laravel 12 / PHP-FPM)                         │
│  ├─ Queue Worker: `php artisan queue:work`             │
│  ├─ Scheduler: Cron `php artisan schedule:run`         │
│  └─ Cache / Session: Database / Redis                  │
└────────────────────────────────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────────────────────┐
│ Cơ sở dữ liệu: MySQL 8.0+ / 8.4 LTS                    │
└────────────────────────────────────────────────────────┘
```

---

## 2. Yêu Cầu Máy Chủ (Prerequisites)

| Thành phần | Phiên bản yêu cầu | Ghi chú |
|---|---|---|
| Hệ điều hành | Ubuntu 22.04 LTS / 24.04 LTS hoặc Debian 12 | Khuyến nghị Linux tiêu chuẩn |
| PHP | **PHP 8.2.x** (khớp chính xác bản sản xuất `8.2.33`) | **Không dùng PHP ≥ 8.3** để tránh xung đột |
| PHP Extensions | `bcmath`, `ctype`, `curl`, `dom`, `fileinfo`, `gd`, `iconv`, `intl`, `mbstring`, `mysql` (`pdo_mysql`), `opcache`, `sqlite3` (`pdo_sqlite`), `xml`, `zip` | Cài qua apt `php8.2-*` |
| Web Server | Nginx 1.22+ (khuyến nghị) hoặc Apache 2.4 | Đóng vai trò Reverse Proxy & FastCGI |
| Cơ sở dữ liệu | MySQL 8.0+ hoặc MySQL 8.4 LTS | Bộ ký tự `utf8mb4_0900_ai_ci` |
| Composer | Composer 2.x | Quản lý thư viện PHP |
| Node.js / pnpm | **Không cài đặt trên production** | Chỉ dùng ở máy dev hoặc CI |

---

## 3. Quy Trình Build Artefacts (Tại Máy Dev hoặc CI)

Trước khi tải mã nguồn lên máy chủ production, toàn bộ mã frontend phải được biên dịch thành công:

```bash
# 1. Cài đặt các gói phụ thuộc với lockfile cố định
pnpm install --frozen-lockfile

# 2. Kiểm tra chất lượng và kiểu dữ liệu (tùy chọn nhưng khuyến nghị)
pnpm --filter aihome-app typecheck
pnpm --filter aihome-app lint

# 3. Biên dịch React sang thư mục apps/api/public/build
pnpm --filter aihome-app build   # forces NODE_ENV=production and scans the bundle (scripts/verify-build.mjs)
```

Kiểm tra thư mục đầu ra:
```bash
ls -la apps/api/public/build
# Kết quả hợp lệ phải có file manifest.json và thư mục assets/ chứa file .js, .css
```

---

## 4. Đồng Bộ Lên Máy Chủ (Rsync Deployment)

Sử dụng `rsync` qua SSH để đồng bộ mã nguồn backend và các assets đã build lên thư mục máy chủ (ví dụ: `/var/www/aihome`):

```bash
# Định nghĩa biến môi trường triển khai
DEPLOY_USER="deploy"
DEPLOY_HOST="your-server-ip"
DEPLOY_PATH="/var/www/aihome"

# Thực hiện đồng bộ (loại trừ node_modules, tests, .git, .env)
rsync -avz --delete \
  --exclude='.git' \
  --exclude='.github' \
  --exclude='node_modules' \
  --exclude='apps/api/node_modules' \
  --exclude='apps/api/.env' \
  --exclude='apps/api/storage/logs/*.log' \
  --exclude='apps/api/storage/framework/cache/data/*' \
  --exclude='apps/api/storage/framework/sessions/*' \
  --exclude='apps/api/storage/framework/views/*.php' \
  --exclude='tests' \
  --exclude='apps/api/tests' \
  apps/api/ ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/
```

---

## 5. Các Lệnh Khởi Động & Tối Ưu Trên Production (Warmup)

Đăng nhập vào máy chủ production qua SSH và chạy chuỗi lệnh chuẩn bị:

```bash
cd /var/www/aihome

# 1. Phân quyền thư mục lưu trữ cho web server (www-data)
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

# 2. Cài đặt thư viện PHP production (không cài dev dependencies)
composer install --no-dev --optimize-autoloader --no-interaction

# 3. Tạo symbolic link cho thư mục lưu trữ media/tệp tải lên
php artisan storage:link

# 4. Chạy migration cơ sở dữ liệu
php artisan migrate --force

# 5. Xóa và kích hoạt cache cấu hình, route, view tối ưu hiệu năng
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

> [!IMPORTANT]
> Khi cần cập nhật cấu hình hoặc biến môi trường trong `.env`, bắt buộc phải chạy lại `php artisan config:cache`.

---

## 6. Danh Sách Biến Môi Trường (.env Reference)

Tạo file `/var/www/aihome/.env` trên máy chủ với các giá trị sản xuất:

```dotenv
# --- Cấu hình Ứng Dụng ---
APP_NAME="AI HOME"
APP_ENV=production
APP_KEY=base64:YOUR_GENERATED_APP_KEY_HERE
APP_DEBUG=false
APP_URL=https://aihome.example.com

APP_LOCALE=ja
APP_FALLBACK_LOCALE=ja
APP_FAKER_LOCALE=en_US

# --- Cơ Sở Dữ Liệu MySQL ---
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=aihome_prod
DB_USERNAME=aihome_user
DB_PASSWORD=YOUR_STRONG_DB_PASSWORD

# --- Session & Cache ---
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=true
SESSION_SECURE_COOKIE=true
CACHE_STORE=database

# --- Hàng Đợi (Queue) ---
QUEUE_CONNECTION=database

# --- Nhật Ký (Logging) ---
LOG_CHANNEL=daily
LOG_LEVEL=warning

# --- Mail (SMTP Production) ---
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_USERNAME=your-smtp-username
MAIL_PASSWORD=your-smtp-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="no-reply@aihome.example.com"
MAIL_FROM_NAME="AI HOME PLATFORM"

# --- Tích Hợp Trí Tuệ Nhân Tạo (AI Providers) ---
# Chọn: local (mock) | gemini (Google) | anthropic (Claude)
AI_PROVIDER=gemini

# Google Gemini API
GEMINI_API_KEY=YOUR_GEMINI_PRODUCTION_API_KEY
GEMINI_MODEL=gemini-1.5-flash

# Anthropic Claude API (Dự phòng)
ANTHROPIC_API_KEY=YOUR_ANTHROPIC_PRODUCTION_API_KEY
ANTHROPIC_MODEL=claude-3-5-haiku-20241022

# Giới hạn an toàn chi phí AI
AI_TIMEOUT=20
AI_DAILY_LIMIT=50

# --- Frontend Asset Binding ---
VITE_CONFIG_SOURCE=auto
SANCTUM_STATEFUL_DOMAINS=aihome.example.com
```

> [!CAUTION]
> Tuyệt đối không lưu khóa API hoặc mật khẩu database trong kho lưu trữ git. Tạo file `.env` trực tiếp trên máy chủ với quyền `chmod 600 .env`.

---

## 7. Xuất Bản Cấu Hình Wizard Mặc Định (Publish Wizard Config)

Hệ thống AI HOME yêu cầu cấu hình wizard phải được xuất bản vào DB để phục vụ qua API `/api/v1/config/bundle`.

### Cách 1: Xuất bản từ file JSON (Khuyến nghị)
Nếu file cấu hình mặc định được đồng bộ lên `storage/app/default-wizard.json`:

```bash
php artisan config:publish-file wizard storage/app/default-wizard.json --label="Production Initial Wizard v1"
```

### Cách 2: Tạo file từ source TypeScript (nếu cần)
Ở máy dev hoặc CI:
```bash
pnpm --filter @aihome/config-schema exec tsx scripts/export-default-wizard.ts
```
Sau đó tải `apps/api/storage/app/default-wizard.json` lên server và chạy lệnh xuất bản ở Cách 1.

### Kiểm tra kết quả xuất bản:
```bash
curl -s http://127.0.0.1/api/v1/config/bundle | grep -o '"version":[0-9]*'
# Kết quả mong đợi: "version":1
```

---

## 8. Cấu Hình Nginx & Apache

### 8.1 Cấu Hình Nginx (Khuyến nghị)

File cấu hình `/etc/nginx/sites-available/aihome.conf`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name aihome.example.com;

    # Chuyển hướng toàn bộ HTTP sang HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name aihome.example.com;

    root /var/www/aihome/public;
    index index.php index.html;
    charset utf-8;

    # SSL Certificates (Let's Encrypt / Certbot)
    ssl_certificate /etc/letsencrypt/live/aihome.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/aihome.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Giới hạn kích thước tải file lên (tối đa 20MB)
    client_max_body_size 20M;

    # Nén Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml
        image/svg+xml;

    # Bảo mật: Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=(self)" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https:;" always;

    # Phục vụ trực tiếp các file tĩnh build bởi Vite (CSS, JS, Fonts)
    location /build/ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        try_files $uri =404;
    }

    # Tài nguyên tĩnh thông thường
    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    # Xử lý toàn bộ request web & API
    # Do ứng dụng dùng Hash Routing (#/), mọi route SPA đều tải index.php -> Blade view
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # Chuyển tiếp PHP cho PHP-FPM 8.2
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
        fastcgi_buffers 16 16k;
        fastcgi_buffer_size 32k;
    }

    # Chặn truy cập các file ẩn (.env, .git,...)
    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

Kích hoạt cấu hình:
```bash
sudo ln -s /etc/nginx/sites-available/aihome.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 8.2 Cấu Hình Apache (Thay thế nếu không dùng Nginx)

Đảm bảo các module cần thiết đã bật: `sudo a2enmod rewrite ssl headers deflate proxy_fcgi`.

Tạo file VirtualHost `/etc/apache2/sites-available/aihome.conf`:

```apache
<VirtualHost *:80>
    ServerName aihome.example.com
    Redirect permanent / https://aihome.example.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName aihome.example.com
    DocumentRoot /var/www/aihome/public

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/aihome.example.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/aihome.example.com/privkey.pem

    <Directory /var/www/aihome/public>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted

        # Fallback về index.php cho SPA và API
        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteRule ^ index.php [L]
    </Directory>

    # Cache tĩnh cho /build/
    <Location "/build/">
        Header set Cache-Control "max-age=31536000, public, immutable"
    </Location>

    # Security Headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"

    # Chuyển tiếp PHP-FPM
    <FilesMatch \.php$>
        SetHandler "proxy:unix:/var/run/php/php8.2-fpm.sock|fcgi://localhost/"
    </FilesMatch>

    ErrorLog ${APACHE_LOG_DIR}/aihome_error.log
    CustomLog ${APACHE_LOG_DIR}/aihome_access.log combined
</VirtualHost>
```

---

## 9. Quản Lý Background Worker & Cron Jobs

### 9.1 Queue Worker (Systemd Service)
Hệ thống sử dụng database queue để xử lý các tác vụ AI, sinh CAD và xuất PDF chạy nền.

Tạo file service `/etc/systemd/system/aihome-queue.service`:

```ini
[Unit]
Description=AI HOME Queue Worker
After=network.target mysql.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/aihome
ExecStart=/usr/bin/php /var/www/aihome/artisan queue:work --sleep=3 --tries=3 --max-time=3600
Restart=always
RestartSec=5
StandardOutput=append:/var/www/aihome/storage/logs/queue.log
StandardError=append:/var/www/aihome/storage/logs/queue-error.log

[Install]
WantedBy=multi-user.target
```

Kích hoạt và khởi động:
```bash
sudo systemctl daemon-reload
sudo systemctl enable aihome-queue
sudo systemctl start aihome-queue
```

### 9.2 Scheduled Tasks (Cron)
Đăng ký Laravel scheduler vào crontab của người dùng `www-data`:

```bash
sudo crontab -u www-data -e
```

Thêm dòng sau:
```cron
* * * * * cd /var/www/aihome && /usr/bin/php artisan schedule:run >> /dev/null 2>&1
```

---

## 10. Sao Lưu & Phục Hồi Dữ Liệu (Backup & Disaster Recovery)

### 10.1 Kịch Bản Tự Động Sao Lưu Hàng Ngày
Tạo script `/usr/local/bin/aihome-backup.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="/var/backups/aihome"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_NAME="aihome_prod"
DB_USER="aihome_user"
# Mật khẩu được cấu hình trong ~/.my.cnf để bảo mật

mkdir -p "${BACKUP_DIR}"

# 1. Sao lưu MySQL Database với nén gzip
mysqldump --single-transaction --quick "${DB_NAME}" | gzip > "${BACKUP_DIR}/db_${TIMESTAMP}.sql.gz"

# 2. Xóa các bản sao lưu cũ hơn 14 ngày
find "${BACKUP_DIR}" -type f -name "db_*.sql.gz" -mtime +14 -delete

echo "[${TIMESTAMP}] Backup completed successfully."
```

Phân quyền và đặt lịch chạy 2:00 sáng mỗi ngày:
```bash
sudo chmod +x /usr/local/bin/aihome-backup.sh
# Thêm vào sudo crontab:
# 0 2 * * * /usr/local/bin/aihome-backup.sh >> /var/log/aihome-backup.log 2>&1
```

### 10.2 Phục Hồi Dữ Liệu Khi Cần Thiết
```bash
# Giải nén và phục hồi database
gunzip < /var/backups/aihome/db_YYYYMMDD_HHMMSS.sql.gz | mysql -u aihome_user -p aihome_prod

# Xóa cache cấu hình sau khi phục hồi
cd /var/www/aihome
php artisan config:clear
php artisan cache:clear
```

---

## 11. Checklist Kiểm Tra Sau Triển Khai (Sanity Checks)

Sau khi hoàn tất triển khai, chạy các bước sau để xác nhận hệ thống vận hành đúng:

1. **Kiểm tra API Health**:
   ```bash
   curl -i https://aihome.example.com/api/v1/health
   # HTTP/2 200 OK, Content-Type: application/json
   ```
2. **Kiểm tra Security Headers**:
   ```bash
   curl -I https://aihome.example.com/
   # Kiểm tra sự xuất hiện của X-Frame-Options, X-Content-Type-Options, CSP
   ```
3. **Kiểm tra Bundle Config API**:
   ```bash
   curl -s https://aihome.example.com/api/v1/config/bundle | grep -o '"wizard"'
   ```
4. **Kiểm tra Giao Diện SPA**:
   - Mở trình duyệt truy cập `https://aihome.example.com/#/`
   - Xác nhận font Noto Sans JP và ngôn ngữ mặc định hiển thị đúng.
   - Thử nghiệm các bước wizard không báo lỗi tải dữ liệu.


> **Important (found 2026-10-12):** the Vite dev container exports `NODE_ENV=development`. A plain `vite build` there produces a dev-flavoured bundle (dev routes, dev login hint). Always build with `pnpm --filter aihome-app build`, which forces `NODE_ENV=production` and fails if the bundle contains dev-only strings.
