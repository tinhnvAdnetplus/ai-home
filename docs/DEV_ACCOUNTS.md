# Tài Khoản Môi Trường Phát Triển Cục Bộ (Local Development Accounts)

> [!CAUTION]
> **CẢNH BÁO BẢO MẬT QUAN TRỌNG**:
> Các tài khoản được liệt kê dưới đây chỉ được khởi tạo trong môi trường phát triển cục bộ (`APP_ENV=local`) thông qua seeder `Database\Seeders\DevUserSeeder`.
> **TUYỆT ĐỐI KHÔNG ĐƯỢC PHÉP TỒN TẠI HOẶC SỬ DỤNG TRÊN MÔI TRƯỜNG PRODUCTION HOẶC STAGING**.
> Trình seeder được bảo vệ bằng điều kiện `if (! app()->environment('local')) return;` để ngăn chặn việc tạo tài khoản ngoài ý muốn.

---

## 1. Danh Sách Tài Khoản Mặc Định

Mật khẩu chung cho tất cả các tài khoản phát triển cục bộ:
```text
Password1234!
```

| Email | Vai trò (Role) | Mô tả & Thẩm quyền trong hệ thống |
|---|---|---|
| `admin@aihome.local` | `admin` | Quản trị viên toàn quyền: quản lý người dùng, phân quyền, cấu hình hệ thống, duyệt xuất bản (publish/rollback) cấu hình wizard và đơn giá. |
| `editor@aihome.local` | `editor` | Biên tập viên nội dung: quản lý câu hỏi wizard, chỉnh sửa bản nháp cấu hình, quản lý thư viện hình ảnh và bài viết/văn bản pháp lý. |
| `architect@aihome.local` | `architect` | Kiến trúc sư: tinh chỉnh tham số planner, cấu hình bảng ánh xạ ràng buộc (constraints mapping), xem xét hồ sơ mặt bằng và xuất file CAD/DXF. |
| `user@aihome.local` | `user` | Người dùng tiêu chuẩn: trải nghiệm wizard, tạo và lưu phương án thiết kế mặt bằng cá nhân. |

---

## 2. Cách Khởi Tạo & Nạp Dữ Liệu Seeder

Chạy lệnh nạp dữ liệu từ thư mục gốc của dự án:

```powershell
# Task runner (Laragon):
.\laragon\dev.ps1 seed

# Hoặc chạy trực tiếp trong apps\api:
cd apps\api; php artisan db:seed
```

Nếu muốn khởi tạo lại toàn bộ cơ sở dữ liệu từ đầu kèm seeder:
```powershell
.\laragon\dev.ps1 fresh
```

---

## 3. Quy Tắc Đối Với Môi Trường Sản Xuất (Production Guidelines)

1. Khi triển khai lên môi trường sản xuất (`APP_ENV=production`), chỉ chạy lệnh `php artisan migrate --force`. **Không chạy `db:seed`**.
2. Tài khoản quản trị viên đầu tiên trên production phải được tạo thủ công qua lệnh tương tác artisan chuyên biệt hoặc kịch bản quản trị an toàn với mật khẩu ngẫu nhiên có độ dài tối thiểu 16 ký tự và kích hoạt xác thực hai yếu tố (2FA).
3. Mọi tài khoản có đuôi `@aihome.local` đều bị chặn đăng nhập hoặc không tồn tại trên cơ sở dữ liệu production.
