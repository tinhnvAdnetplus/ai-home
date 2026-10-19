# ADR 0003: Building Data Model (BDM) Là Nguồn Sự Thật Duy Nhất (BDM as Single Source of Truth)

- **Trạng thái**: Đã chấp thuận (Accepted)
- **Ngày quyết định**: 2026-10-12
- **Người đề xuất**: Kiến trúc sư hệ thống AI HOME
- **Phạm vi**: Gói `@aihome/bdm`, `@aihome/render2d`, `@aihome/render3d`, `@aihome/cad-export`, Xuất PDF

---

## Bối Cảnh (Context)

Một giải pháp thiết kế kiến trúc nhà ở tự động cần tạo ra nhiều dạng biểu diễn khác nhau cho cùng một ngôi nhà:
1. Bản vẽ 2D mặt bằng tương tác trên web (SVG/Canvas).
2. Phối cảnh 3D trực quan (Three.js / WebGL) cho phép người dùng xoay, xem vật liệu, đi vào bên trong.
3. Bản vẽ kỹ thuật CAD (file DXF chuẩn) để kiến trúc sư mở trong AutoCAD hoặc Jw_cad (phần mềm CAD phổ biến tại Nhật).
4. Hồ sơ phương án in ấn (PDF khổ A3/A4) nộp cho khách hàng hoặc cơ quan thẩm duyệt xây dựng.

Nếu mỗi renderer (2D, 3D, DXF, PDF) tự tính toán hình học từ câu trả lời của người dùng hoặc lưu trữ một định dạng dữ liệu riêng biệt:
- Sẽ dẫn đến tình trạng bất nhất nghiêm trọng (ví dụ: tường trên 2D lệch 10cm so với mô hình 3D, hoặc cửa sổ trên bản vẽ DXF không khớp với PDF).
- Rất khó để kiểm thử tự động và bảo trì khi thêm loại phòng hoặc vật liệu mới.

---

## Quyết Định (Decision)

Chúng tôi quyết định thiết lập **Building Data Model (BDM)** làm **Nguồn Sự Thật Duy Nhất (Single Source of Truth)** cho toàn bộ hệ thống:
1. **Gói dùng chung `@aihome/bdm`**: BDM được định nghĩa dưới dạng Zod schema chặt chẽ trong TypeScript.
2. **Đơn vị chuẩn tuyệt đối**: Tọa độ trong BDM luôn là **số nguyên milimét (`mm`)**, không dùng số thực để tránh lỗi làm tròn dấu phẩy động (floating point errors).
3. **Cấu trúc dữ liệu hình học độc lập**:
   - `site`: Ranh giới thửa đất, chỉ giới đường đỏ, góc xoay hướng Bắc.
   - `floors`: Danh sách tầng (tầng 1, tầng 2,...), cao độ sàn, chiều cao trần.
   - `walls`: Đoạn tường (điểm đầu, điểm cuối, độ dày mm, tường chịu lực hay tường ngăn).
   - `rooms`: Danh mục phòng (loại phòng, tên hiển thị, đa giác bao quanh, diện tích tính toán, vật liệu sàn/tường).
   - `openings`: Cửa đi, cửa sổ (vị trí trên tường, kích thước rộng/cao, loại cánh mở, ngưỡng cửa).
   - `stairs`: Cầu thang kết nối tầng (vị trí, chiều rộng vế thang, số bậc, hướng đi lên).
   - `roof`: Dạng mái (mái dốc, mái bằng, độ dốc mái, hướng dốc).
4. **Mô hình Renderer thụ động (Read-only Renderers)**:
   - Các gói `render2d`, `render3d`, `cad-export` và tác vụ xuất PDF chỉ nhận BDM làm đầu vào chỉ đọc (read-only input).
   - Tuyệt đối không có renderer nào được phép tự ý thay đổi tọa độ hình học hoặc sinh thêm đối tượng không có trong BDM.
5. **Phiên bản hóa và Migration**: Mỗi payload BDM luôn chứa `schemaVersion: number`. Khi BDM schema nâng cấp (ví dụ thêm thuộc tính cách nhiệt), hàm `migrateBDM(data)` tự động nâng cấp dữ liệu cũ lên phiên bản mới nhất một cách an toàn.

---

## Hệ Quả (Consequences)

### Tích Cực (Positive)
- **Đồng bộ 100% giữa các dạng hiển thị**: Nếu một bức tường xuất hiện ở tọa độ `(X: 1820, Y: 3640)` trên bản vẽ 2D, nó chắc chắn nằm chính xác ở vị trí đó trong không gian 3D và trên bản vẽ DXF mở trong Jw_cad.
- **Tách biệt hoàn toàn trách nhiệm (Separation of Concerns)**: Kỹ sư làm đồ họa 3D chỉ cần quan tâm chuyển đổi BDM thành mesh Three.js; kỹ sư làm xuất DXF chỉ cần quan tâm chuyển đổi BDM thành entities DXF (LINE, POLYLINE, TEXT). Không ai phải lo thuật toán sinh phòng.
- **Khả năng lưu trữ & truyền tải tối ưu**: Toàn bộ ngôi nhà phức tạp được nén gọn trong một file JSON BDM vài chục kilobyte, cực kỳ thuận lợi để lưu vào cơ sở dữ liệu MySQL hoặc chia sẻ qua API.

### Tiêu Cực & Hạn Chế (Negative & Mitigations)
- **Mọi mở rộng hình học đều phải đi qua schema BDM**: Không thể "vẽ tắt" một chi tiết trang trí trong 3D mà không khai báo cấu trúc tương ứng trong BDM.
  *Biện pháp*: Thiết kế trường `attributes` mở rộng trong từng thực thể BDM có kiểm soát để gắn metadata tùy biến khi cần thiết.

---

## Tài Liệu Liên Quan
- `docs/CODING_CONVENTION.md` §0 (Nguyên tắc 2: Một nguồn dữ liệu công trình BDM; Nguyên tắc 4: Đơn vị trong lõi luôn là mm).
- `docs/GLOSSARY.md`: Định nghĩa BDM.
- `packages/bdm`: Zod schema và các hàm chuyển đổi của BDM.
