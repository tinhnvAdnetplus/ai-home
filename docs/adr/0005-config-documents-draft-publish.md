# ADR 0005: Quản Lý Cấu Hình Động Bằng Tài Liệu Phiên Bản Nháp / Xuất Bản (Config Documents with Draft/Publish Lifecycle)

- **Trạng thái**: Đã chấp thuận (Accepted)
- **Ngày quyết định**: 2026-10-12
- **Người đề xuất**: Kiến trúc sư hệ thống AI HOME
- **Phạm vi**: Cấu hình Wizard, Danh mục vật liệu, Đơn giá dự toán, Tham số Planner, Admin CMS

---

## Bối Cảnh (Context)

Một nền tảng tư vấn thiết kế nhà ở luôn có sự thay đổi liên tục về mặt kinh doanh:
- Thêm hoặc bớt câu hỏi trong wizard khảo sát nhu cầu.
- Điều chỉnh đơn giá xây dựng trên mỗi tsubo (坪単価) theo biến động thị trường vật liệu.
- Thay đổi trọng số điểm ưu tiên trong thuật toán planner hoặc cập nhật văn bản pháp lý disclaimer.

Nếu các thông số này bị hard-code trong mã nguồn:
- Mỗi thay đổi nhỏ đều yêu cầu kỹ sư sửa code, tạo pull request, chạy CI/CD và deploy lại hệ thống.
- Người quản trị kinh doanh không thể chủ động điều chỉnh.

Ngược lại, nếu lưu cấu hình trực tiếp vào database mà không có cơ chế quản lý phiên bản:
- Khi admin đang chỉnh sửa dở dang, người dùng bên ngoài có thể nhìn thấy form bị lỗi hoặc thiếu trường.
- Khi xảy ra lỗi cấu hình, không thể rollback (khôi phục) về trạng thái ổn định trước đó.
- Không có nhật ký kiểm toán (audit log) ghi lại ai đã thay đổi gì, vào thời điểm nào.

---

## Quyết Định (Decision)

Chúng tôi quyết định quản lý toàn bộ cấu hình hệ thống dưới dạng **Tài liệu cấu hình (Config Documents) với vòng đời Nháp / Xuất bản (Draft / Published Lifecycle)**:

1. **Chuẩn hóa Schema qua Zod (`@aihome/config-schema`)**:
   - Mọi loại tài liệu cấu hình (`wizard`, `catalog`, `planner`, `estimate`, `legal`, `ai`, `content`) đều có Zod schema định nghĩa cấu trúc, giới hạn kiểu và giá trị mặc định (`defaults.ts`).
   - JSON Schema sinh tự động từ Zod schema và được PHP backend dùng để kiểm thực tương thích 1:1.
2. **Vòng đời tài liệu**:
   - **Bản nháp (`status = 'draft'`)**: Quản trị viên tự do chỉnh sửa, thêm/bớt trường, xem trước (preview) trong màn hình Admin mà hoàn toàn không ảnh hưởng đến người dùng thực tế.
   - **Xuất bản (`status = 'published'`)**: Khi quản trị viên bấm "Xuất bản" (hoặc chạy lệnh CLI `php artisan config:publish-file`), hệ thống kiểm tra tính hợp lệ toàn diện qua validator. Nếu hợp lệ, hệ thống tạo một bản ghi phiên bản mới bất biến (`v1, v2, v3...`) trong bảng `config_versions` kèm mã băm SHA-256 của payload.
   - **Rollback tức thì**: Khi cần, quản trị viên có thể chọn bất kỳ phiên bản cũ nào trong lịch sử để kích hoạt lại mà không cần nhập lại dữ liệu.
3. **Phân phối qua API Bundle với ETag (`GET /api/v1/config/bundle`)**:
   - Toàn bộ cấu hình đã xuất bản được đóng gói thành một bundle JSON duy nhất kèm header ETag.
   - Trình duyệt và CDN có thể cache bundle này với cơ chế `304 Not Modified`, giảm thiểu tải cho database.
4. **Cơ chế Fallback An toàn ở Phía Client (`useWizardConfig`)**:
   - Trình duyệt tải ngay lập tức bộ cấu hình mặc định biên dịch sẵn trong TypeScript (`defaults.ts`), hiển thị giao diện tức thì (zero blocking).
   - TanStack Query tải bundle từ API chạy nền. Nếu cấu hình API hợp lệ, giao diện hoán đổi mượt mà; nếu API lỗi hoặc mạng ngắt kết nối, client tiếp tục hoạt động bình thường với bản fallback mặc định.

---

## Hệ Quả (Consequences)

### Tích Cực (Positive)
- **Đạt Cổng kiểm chứng G1 (Gate G1)**: Quản trị viên sửa câu hỏi hoặc thay đổi đơn giá ở admin -> Xuất bản -> Người dùng bên ngoài thấy ngay thay đổi mà không cần triển khai lại mã nguồn.
- **An toàn tuyệt đối cho người dùng**: Bản nháp cô lập hoàn toàn với môi trường công khai; cấu hình sai cú pháp bị chặn ngay từ bước lưu nháp và xuất bản.
- **Truy vết và Kiểm toán toàn diện**: Biết chính xác ai đã thay đổi trường nào qua bảng `audit_logs` và diff giữa các `config_versions`.
- **Trải nghiệm người dùng mượt mà**: Nhờ bundle ETag và client fallback, trang wizard không bao giờ bị trắng trang hay đơ vì lỗi cấu hình API.

### Tiêu Cực & Hạn Chế (Negative & Mitigations)
- **Độ phức tạp trong việc quản lý schema migration**: Nếu cấu trúc schema Zod thay đổi căn bản, các bản ghi cấu hình cũ trong cơ sở dữ liệu có thể cần script di trú (migration script).
  *Biện pháp*: Schema luôn giữ thuộc tính `schemaVersion: number` và áp dụng nguyên tắc tương thích ngược (backward compatibility).

---

## Tài Liệu Liên Quan
- `docs/CODING_CONVENTION.md` §7: Nguyên tắc không hard-code nghiệp vụ (Config-driven).
- `docs/config-publishing.md`: Hướng dẫn vận hành CLI xuất bản cấu hình.
- `packages/config-schema`: Zod schemas và JSON schema generator.
