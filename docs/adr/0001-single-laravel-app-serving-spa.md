# ADR 0001: Ứng Dụng Laravel Đơn Lẻ Phục Vụ React SPA (Single Laravel App Serving SPA)

- **Trạng thái**: Đã chấp thuận (Accepted)
- **Ngày quyết định**: 2026-10-12
- **Người đề xuất**: Kiến trúc sư hệ thống AI HOME
- **Phạm vi**: Cấu trúc Monorepo, Mô hình triển khai, Giao tiếp Client-Server

---

## Bối Cảnh (Context)

Trong các hệ thống web hiện đại, kiến trúc thường bị phân tách thành hai ứng dụng độc lập: một server Node.js chạy Next.js/Nuxt.js để phục vụ frontend (kèm Server-Side Rendering - SSR) và một server backend riêng biệt (Laravel, Go, Python) phục vụ API.

Tuy nhiên, đối với AI HOME PLATFORM:
1. **Yêu cầu hạ tầng tinh gọn**: Khách hàng và đối tác yêu cầu hệ thống có thể triển khai trên môi trường máy chủ PHP 8.2 tiêu chuẩn (single port, không phụ thuộc vào tiến trình daemon Node.js chạy ngầm).
2. **Bản chất ứng dụng**: Phần lớn trải nghiệm người dùng là wizard tương tác động, bộ sinh mặt bằng 2D tương tác và đồ họa 3D Three.js. Các chức năng này hoàn toàn chạy trên trình duyệt của người dùng (Client-Side Rendering) và không được hưởng lợi đáng kể từ SSR.
3. **Độ phức tạp vận hành**: Việc duy trì hai runtime (PHP + Node) trên môi trường sản xuất làm tăng chi phí giám sát tiến trình (PM2 / Docker daemon), tăng nguy cơ rò rỉ bộ nhớ, và gây khó khăn khi quản lý phiên đăng nhập/CSRF cross-origin.

---

## Quyết Định (Decision)

Chúng tôi quyết định hợp nhất toàn bộ hệ thống vào **MỘT ứng dụng Laravel 12 duy nhất** (`apps/api`):
1. **Vị trí mã nguồn**: Mã nguồn React + TypeScript được đặt trực tiếp trong `apps/api/resources/js/` và quản lý trong cùng pnpm workspace.
2. **Quy trình đóng gói**: Vite biên dịch mã React thành các tệp tĩnh (HTML/JS/CSS/Assets) đặt trong `apps/api/public/build/`.
3. **Phục vụ ứng dụng**:
   - Mọi request không bắt đầu bằng `/api/*` đều được Laravel route catch-all (`Route::view('/{any?}', 'app')`) trả về view Blade gốc (`app.blade.php`), từ đó tải React SPA.
   - Các request `/api/*` đi thẳng vào bộ xử lý API controller chuẩn mực của Laravel (`routes/api.php`).
4. **Không chạy Node trên máy chủ sản xuất**: Node.js 22 LTS chỉ được dùng ở máy phát triển và môi trường CI/CD (GitHub Actions) để build mã nguồn. Máy chủ production chỉ cần PHP 8.2-FPM và Nginx/Apache.
5. **Điều hướng Hash Routing**: Ứng dụng client dùng hash routing (`#/`), giúp người dùng có thể tải lại trang hoặc chia sẻ link bất kỳ mà không cần cấu hình rewrite URL phức tạp ở web server.

---

## Hệ Quả (Consequences)

### Tích Cực (Positive)
- **Hạ tầng cực kỳ đơn giản**: Chỉ cần 1 cổng HTTP/HTTPS (Port 80/443). Triển khai chỉ là `rsync` thư mục code đã build và chạy `composer install --no-dev`.
- **Bảo mật phiên đăng nhập liền mạch**: Do client và API nằm trên cùng một domain/origin, cơ chế xác thực cookie stateful của Laravel Sanctum hoạt động hoàn hảo mà không gặp rắc rối với CORS hay cross-site cookies.
- **Tiết kiệm tài nguyên máy chủ**: Không tốn RAM và CPU cho các tiến trình SSR Node.js.
- **Tập trung hóa công cụ kiểm thử**: Một lệnh `make check` có thể kiểm tra cả PHP backend lẫn TypeScript frontend.

### Tiêu Cực & Hạn Chế (Negative & Mitigations)
- **Không có SSR/RSC**: Khả năng SEO tự nhiên cho các trang con bị giới hạn.
  *Biện pháp*: Trang đích (Landing Page) và trang giới thiệu công khai có thể phục vụ trực tiếp bằng Blade view với thẻ meta tĩnh nếu cần SEO sâu. Bản thân ứng dụng wizard là ứng dụng nội bộ/tương tác sau đăng nhập hoặc theo phiên.
- **Bước build bắt buộc trước khi deploy**: Không thể sửa file JS trực tiếp trên server (điều này thực chất lại là điểm cộng cho tính kỷ luật và toàn vẹn của mã nguồn).

---

## Tài Liệu Liên Quan
- `docs/CODING_CONVENTION.md` §1 & §2: Quy tắc kiến trúc một app một cổng.
- `docs/DEPLOY.md`: Quy trình triển khai chi tiết lên máy chủ PHP 8.2 không có Node.js.
- `apps/api/routes/web.php` & `apps/api/resources/views/app.blade.php`.
