# ADR 0002: Thực Thi Bộ Sinh Mặt Bằng (Planner) Trên Trình Duyệt Bằng TypeScript (Planner in Browser TS vs Server)

- **Trạng thái**: Đã chấp thuận (Accepted)
- **Ngày quyết định**: 2026-10-12
- **Người đề xuất**: Kiến trúc sư hệ thống AI HOME
- **Phạm vi**: Gói `@aihome/planner`, Thuật toán bố trí mặt bằng, Hiệu năng hệ thống

---

## Bối Cảnh (Context)

Bộ sinh mặt bằng (Planner) là trái tim tính toán của AI HOME PLATFORM. Nhiệm vụ của nó là nhận các thông số từ wizard (kích thước khu đất, hướng tiếp cận đường, số thành viên gia đình, danh mục phòng mong muốn, các ràng buộc pháp lý và phong cách sống) và tự động tìm kiếm, sắp xếp các phòng lên hệ lưới mô-đun 910mm để tạo ra từ 3 đến 5 phương án mặt bằng tối ưu.

Có hai phương án kiến trúc được đưa ra thảo luận:
1. **Thực thi trên Server** (PHP / Python Service): Trình duyệt gửi thông số lên máy chủ qua API, máy chủ tính toán rồi trả về kết quả JSON.
2. **Thực thi trên Trình duyệt** (Browser TypeScript via Web Worker): Toàn bộ thuật toán sinh mặt bằng được đóng gói thành thư viện TypeScript thuần (`@aihome/planner`), chạy trực tiếp trong Web Worker trên máy người dùng.

---

## Quyết Định (Decision)

Chúng tôi quyết định thực thi **Bộ sinh mặt bằng hoàn toàn trên trình duyệt của người dùng** bằng TypeScript thuần (`@aihome/planner`):
1. **Hàm thuần và Tất định (Pure & Deterministic)**: Thuật toán không phụ thuộc vào trạng thái toàn cục, thời gian hệ thống (`Date.now()`) hay hàm ngẫu nhiên không hạt giống (`Math.random()`). Với cùng một cấu hình đầu vào và một số nguyên `seed`, thuật toán luôn trả về kết quả mặt bằng giống hệt nhau 100%.
2. **Chạy trong Web Worker**: Để tránh làm đơ giao diện người dùng (UI freeze) khi thuật toán thực hiện tìm kiếm tổ hợp, việc sinh phương án được cô lập hoàn toàn trong Web Worker (sử dụng thư viện giao tiếp Comlink). Trình duyệt có thể hiển thị thanh tiến độ (% tính toán) và người dùng có thể bấm nút Hủy (`Cancel`) bất kỳ lúc nào.
3. **Vai trò của Server**: Server Laravel chỉ đóng vai trò lưu trữ kết quả cuối cùng (khi người dùng quyết định Lưu phương án) dưới dạng snapshot BDM kèm mã phiên bản cấu hình (`configVersion`).

---

## Hệ Quả (Consequences)

### Tích Cực (Positive)
- **Không nghẽn tài nguyên Server**: Việc tính toán tổ hợp tốn rất nhiều CPU. Khi có hàng trăm người dùng cùng sinh phương án đồng thời, máy chủ backend hoàn toàn không phải gánh tải tính toán này, giúp giữ chi phí hạ tầng máy chủ ở mức cực thấp.
- **Phản hồi tức thì & Khám phá tương tác**: Người dùng có thể kéo thanh trượt điều chỉnh kích thước phòng, đổi hạt giống `seed`, hoặc thay đổi hướng cửa và thấy kết quả cập nhật trong vài trăm mili-giây mà không phụ thuộc vào độ trễ mạng (network latency).
- **Hỗ trợ Offline / Mạng yếu**: Khi wizard đã tải cấu hình xong, toàn bộ quá trình sinh phương án diễn ra cục bộ mà không cần kết nối Internet liên tục.
- **Dễ dàng kiểm thử tự động**: Viết test bằng Vitest cực kỳ nhanh và chuẩn xác. Không cần mock database, không cần mock HTTP request.

### Tiêu Cực & Hạn Chế (Negative & Mitigations)
- **Mã nguồn thuật toán nằm ở phía Client**: Mã nguồn JavaScript/TypeScript được tải về máy người dùng.
  *Biện pháp*: Mã được minify và bundle trong quá trình build của Vite. Hơn nữa, giá trị cạnh tranh cốt lõi của nền tảng nằm ở bộ dữ liệu cấu hình độc quyền (`config`), danh mục phòng và luật thiết kế được tinh chỉnh từ các kiến trúc sư Nhật Bản, chứ không đơn thuần chỉ là khung thuật toán.
- **Phụ thuộc vào năng lực phần cứng thiết bị người dùng**: Thiết bị di động đời cũ có thể tính toán chậm hơn máy tính để bàn.
  *Biện pháp*: Giới hạn không gian tìm kiếm (bounding search space), tối ưu hóa cấu trúc dữ liệu mảng phẳng (flat typed arrays), và giới hạn thời gian tính toán (timeout guard) trong Web Worker.

---

## Tài Liệu Liên Quan
- `docs/CODING_CONVENTION.md` §0 (Nguyên tắc 3: Lõi tính toán là hàm thuần).
- `docs/GLOSSARY.md`: Định nghĩa BDM, Planner, Grid Module.
- `packages/planner`: Mã nguồn bộ sinh mặt bằng.
