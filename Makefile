.DEFAULT_GOAL := help

.PHONY: help laragon-install nginx-reload status up dev build artisan composer tinker seed migrate fresh db-shell \
        queue-up mail lint fix test typecheck check check-php check-js schema schema-check install reset

# ---------------------------------------------------------------------------
# Môi trường local chạy trực tiếp trên Laragon (nginx + php-cgi + mailpit).
# Không còn Docker: xem laragon/nginx/ai-home.test.conf và README.local.md.
# ---------------------------------------------------------------------------

LARAGON   ?= C:/laragon
PHP       ?= $(firstword $(wildcard $(LARAGON)/bin/php/php-8.3*/php.exe) $(wildcard $(LARAGON)/bin/php/php-8.*/php.exe) php)
NGINX_DIR ?= $(firstword $(wildcard $(LARAGON)/bin/nginx/nginx-1.30*) $(wildcard $(LARAGON)/bin/nginx/nginx-*))
SITES_DIR ?= $(LARAGON)/etc/nginx/sites-enabled
HOSTS     ?= /c/Windows/System32/drivers/etc/hosts
API_DIR   := apps/api
APP_URL   ?= http://ai-home.test:8080

# Command arguments for artisan / composer (usage: make artisan c="route:list")
c ?=

help:
	@echo "========================================================================"
	@echo "AI HOME PLATFORM — Local Development Helper (Laragon, không dùng Docker)"
	@echo "========================================================================"
	@echo "  make laragon-install - Cài vhost nginx vào Laragon + kiểm tra hosts"
	@echo "  make nginx-reload    - Test cấu hình và reload nginx của Laragon"
	@echo "  make status          - Kiểm tra nginx / php-cgi / mailpit / mysql"
	@echo "  make install         - composer install + pnpm install"
	@echo "  make up              - Migrate DB + in ra các URL (nginx phục vụ sẵn)"
	@echo "  make dev             - Chạy Vite dev server (HMR) ở cổng 5173"
	@echo "  make build           - Build React vào apps/api/public/build (1 cổng PHP)"
	@echo "  make artisan c=...   - Chạy php artisan (vd: make artisan c=\"route:list\")"
	@echo "  make composer c=..   - Chạy composer trong apps/api"
	@echo "  make tinker          - Mở php artisan tinker"
	@echo "  make migrate         - Chạy migration"
	@echo "  make fresh           - migrate:fresh --seed (làm lại DB từ đầu)"
	@echo "  make seed            - Chạy database seeders (tài khoản dev local)"
	@echo "  make db-shell        - Mở shell DB (php artisan db)"
	@echo "  make queue-up        - Chạy worker queue (php artisan queue:work)"
	@echo "  make mail            - Mở Mailpit UI (http://localhost:8025)"
	@echo "  make lint / fix      - Kiểm tra / tự sửa coding style"
	@echo "  make test            - Chạy toàn bộ test suites (Pest, Vitest)"
	@echo "  make typecheck       - Larastan level 6 + TypeScript tsc"
	@echo "  make check           - lint + typecheck + test (check-php + check-js)"
	@echo "  make reset           - Tạo lại database sqlite sạch (có xác nhận)"
	@echo "========================================================================"
	@echo "PHP đang dùng: $(PHP)"

# --- Hạ tầng Laragon -------------------------------------------------------

laragon-install:
	@test -d "$(SITES_DIR)" || { echo "Không thấy $(SITES_DIR) — Laragon chưa cài nginx?"; exit 1; }
	cp laragon/nginx/ai-home.test.conf "$(SITES_DIR)/ai-home.test.conf"
	@echo "==> Đã cài vhost: $(SITES_DIR)/ai-home.test.conf"
	@if grep -q "ai-home.test" "$(HOSTS)" 2>/dev/null; then \
		echo "==> hosts: đã có ai-home.test"; \
	else \
		echo "==> CẦN THÊM hosts — mở PowerShell as Administrator và chạy:"; \
		echo '    Add-Content C:\Windows\System32\drivers\etc\hosts "127.0.0.1 ai-home.test"'; \
	fi
	@$(MAKE) nginx-reload

nginx-reload:
	@test -n "$(NGINX_DIR)" || { echo "Không thấy nginx trong $(LARAGON)/bin/nginx"; exit 1; }
	cd "$(NGINX_DIR)" && ./nginx.exe -t && ./nginx.exe -s reload
	@echo "==> nginx đã reload ($(NGINX_DIR))"

status:
	@echo "PHP          : $(PHP)"
	@tasklist 2>/dev/null | grep -qi nginx.exe   && echo "nginx        : running" || echo "nginx        : STOPPED (bật trong Laragon)"
	@tasklist 2>/dev/null | grep -qi php-cgi.exe && echo "php-cgi      : running" || echo "php-cgi      : STOPPED (bật nginx trong Laragon)"
	@tasklist 2>/dev/null | grep -qi mailpit.exe && echo "mailpit      : running" || echo "mailpit      : STOPPED (bật trong Laragon)"
	@tasklist 2>/dev/null | grep -qi mysqld.exe  && echo "mysql        : running" || echo "mysql        : stopped (không cần khi DB_CONNECTION=sqlite)"
	@echo "App URL      : $(APP_URL)"
	@echo "Health       : $(APP_URL)/api/v1/health"
	@echo "Mailpit UI   : http://localhost:8025 (SMTP 127.0.0.1:1025)"

install:
	cd $(API_DIR) && composer install
	pnpm install

up:
	@$(MAKE) status
	cd $(API_DIR) && $(PHP) artisan migrate
	@echo "==> Mở $(APP_URL) — nginx của Laragon phục vụ apps/api/public"

dev:
	pnpm --filter aihome-app dev

build:
	rm -f $(API_DIR)/public/hot
	pnpm --filter aihome-app build

# --- Laravel ---------------------------------------------------------------

artisan:
	@if [ -z "$(c)" ]; then \
		cd $(API_DIR) && $(PHP) artisan list; \
	else \
		cd $(API_DIR) && $(PHP) artisan $(c); \
	fi

composer:
	@if [ -z "$(c)" ]; then \
		cd $(API_DIR) && composer list; \
	else \
		cd $(API_DIR) && composer $(c); \
	fi

tinker:
	cd $(API_DIR) && $(PHP) artisan tinker

migrate:
	cd $(API_DIR) && $(PHP) artisan migrate

fresh:
	cd $(API_DIR) && $(PHP) artisan migrate:fresh --seed

seed:
	cd $(API_DIR) && $(PHP) artisan db:seed

db-shell:
	cd $(API_DIR) && $(PHP) artisan db

queue-up:
	cd $(API_DIR) && $(PHP) artisan queue:work --sleep=3 --tries=3

mail:
	@start "" http://localhost:8025 2>/dev/null || echo "Mở http://localhost:8025"

reset:
	@echo -n "CẢNH BÁO: Thao tác này sẽ xóa database sqlite và cache. Tiếp tục? [y/N]: "; \
	read ans; \
	case "$$ans" in \
		[yY]|[yY][eE][sS]) \
			cd $(API_DIR) && $(PHP) artisan optimize:clear || true; \
			rm -f $(API_DIR)/database/database.sqlite $(API_DIR)/database/database.sqlite-shm $(API_DIR)/database/database.sqlite-wal; \
			touch $(API_DIR)/database/database.sqlite; \
			cd $(API_DIR) && $(PHP) artisan migrate --seed; \
			echo "Đã tạo lại database sạch."; \
			;; \
		*) \
			echo "Đã hủy thao tác reset."; \
			;; \
	esac

# --- Chất lượng mã ---------------------------------------------------------

lint:
	cd $(API_DIR) && $(PHP) vendor/bin/pint --test
	pnpm --filter aihome-app lint
	pnpm --filter aihome-app format:check
	pnpm --filter @aihome/config-schema lint
	pnpm --filter @aihome/config-schema format:check
	pnpm --filter @aihome/bdm lint
	pnpm --filter @aihome/bdm format:check
	pnpm --filter @aihome/planner lint
	pnpm --filter @aihome/planner format:check
	pnpm --filter @aihome/cad-export lint
	pnpm --filter @aihome/cad-export format:check
	pnpm --filter @aihome/render3d lint
	pnpm --filter @aihome/render3d format:check

fix:
	cd $(API_DIR) && $(PHP) vendor/bin/pint
	pnpm --filter aihome-app lint:fix
	pnpm --filter aihome-app format
	pnpm --filter @aihome/config-schema lint:fix
	pnpm --filter @aihome/config-schema format
	pnpm --filter @aihome/bdm lint:fix
	pnpm --filter @aihome/bdm format
	pnpm --filter @aihome/planner lint:fix
	pnpm --filter @aihome/planner format
	pnpm --filter @aihome/cad-export lint:fix
	pnpm --filter @aihome/cad-export format
	pnpm --filter @aihome/render3d lint:fix
	pnpm --filter @aihome/render3d format

test:
	cd $(API_DIR) && $(PHP) vendor/bin/pest
	pnpm --filter aihome-app test
	pnpm --filter @aihome/config-schema test

typecheck:
	cd $(API_DIR) && $(PHP) vendor/bin/phpstan analyse
	pnpm --filter aihome-app typecheck
	pnpm --filter @aihome/config-schema typecheck
	pnpm --filter @aihome/bdm typecheck
	pnpm --filter @aihome/planner typecheck
	pnpm --filter @aihome/cad-export typecheck
	pnpm --filter @aihome/render3d typecheck

check: check-php check-js

# Lane checks (used while two agents work in parallel): each lane only runs its own tools.
check-php:
	cd $(API_DIR) && $(PHP) vendor/bin/pint --test
	cd $(API_DIR) && $(PHP) vendor/bin/phpstan analyse
	cd $(API_DIR) && $(PHP) vendor/bin/pest

check-js:
	pnpm --filter aihome-app lint
	pnpm --filter aihome-app format:check
	pnpm --filter aihome-app typecheck
	pnpm --filter aihome-app test
	pnpm --filter @aihome/config-schema lint
	pnpm --filter @aihome/config-schema format:check
	pnpm --filter @aihome/config-schema typecheck
	pnpm --filter @aihome/config-schema test
	pnpm --filter @aihome/bdm lint
	pnpm --filter @aihome/bdm format:check
	pnpm --filter @aihome/bdm typecheck
	pnpm --filter @aihome/planner lint
	pnpm --filter @aihome/planner format:check
	pnpm --filter @aihome/planner typecheck
	pnpm --filter @aihome/cad-export lint
	pnpm --filter @aihome/cad-export format:check
	pnpm --filter @aihome/cad-export typecheck
	pnpm --filter @aihome/render3d lint
	pnpm --filter @aihome/render3d format:check
	pnpm --filter @aihome/render3d typecheck
	$(MAKE) schema-check

# Shared wizard JSON Schema + conformance fixtures (generated from the Zod schemas, consumed by PHP)
schema:
	pnpm --filter @aihome/config-schema schema:generate
	pnpm --filter @aihome/config-schema fixtures:generate

schema-check:
	pnpm --filter @aihome/config-schema schema:check
	pnpm --filter @aihome/config-schema fixtures:check
	pnpm --filter @aihome/config-schema schema:verify
