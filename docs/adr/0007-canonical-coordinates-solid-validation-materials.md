# ADR 0007: Hệ Tọa Độ Chuẩn, Kiểm Tra Va Chạm Khối Đặc và Bảng Màu Vật Liệu Theo Ngữ Nghĩa

- **Trạng thái**: Đã chấp thuận (Accepted)
- **Ngày quyết định**: 2026-10-22
- **Người đề xuất**: Nhóm phát triển AI HOME
- **Phạm vi**: `@aihome/bdm` (`coordinates.ts`, `wall-joints.ts`, `solids.ts`), `@aihome/planner` (`solid-validator.ts`, chuyển đổi nội thất/cây từ AI, bộ sinh nội thất), `@aihome/render3d` (`coords.ts`, tường/mái/vật liệu), prompt AI chạy thực tế (`resources/ai/prompts/*.ja.md`)

---

## Bối Cảnh (Context)

BDM đã dùng mm nguyên với `y = 0` là phía đường, nhưng các quy ước 3D chỉ nằm rải rác trong từng builder. Khi kiểm tra mã nguồn, chúng tôi tìm thấy các lỗi hình học thực sự (không phải lỗi màu):

1. Trần nhà ở chế độ đi bộ bị **lật gương** sang phía trước nhà (`rotateX(+π/2)` cho `z = +y`).
2. Tường là hộp đặt trên đường tim: góc ngoài **thiếu một ô 75×75 mm**, đầu tường ngăn **cắm sâu 75 mm** vào tường ngoài (mặt trên đồng phẳng → z-fighting).
3. Tam giác hồi mái lùi 75 mm so với mặt tường; phía mái hiên có **khe hở** giữa đỉnh tường và mái; mái bằng bị hộp parapet đặc **nuốt mất** bề mặt mái; khối fascia của mái chóp che trần tầng trên.
4. Nội thất do AI đặt nằm sát đường lưới (= tim tường) → **xuyên vào tường** nửa bề dày; bộ sinh theo luật đặt máy giặt chồng lên lavabo (150 mm), bàn học chồng lên giường (70 mm), bàn ăn/bếp xuyên qua tường ngăn của phòng kho.
5. Cao độ tầng 2 được gán cứng (`2900`) thay vì cộng dồn chiều cao tầng.
6. Màu mặc định của tường ngoài là xám nâu tối (`#5f5a57`), cửa chính gần như đen, cây/cỏ/xe màu bão hòa; mọi tường ngoài đều dùng vân siding bất kể phong cách.

## Quyết Định (Decision)

1. **Hệ tọa độ chuẩn** (`bdm/src/coordinates.ts`): gốc tại góc trước-trái của mặt bằng tầng 1 ở cao độ GL; `+X` chiều rộng (trái → phải nhìn từ đường), `+Y` chiều sâu (đường → phía sau), `+Z` hướng lên; mm nguyên, hệ tay phải. Z không lưu theo điểm mà suy ra từ `elevationMm/heightMm/sillMm` và mái. Cao độ tầng = tổng chiều cao các tầng bên dưới (`stackStoreyElevations`).
2. **Một ranh giới chuyển đổi duy nhất** sang Three.js (`render3d/src/coords.ts`, `canonicalToThree`): `x = X/1000, y = Z/1000, z = −Y/1000` (phép quay thuần, giữ nguyên tay phải). Camera không bao giờ tác động ngược lên tọa độ mô hình.
3. **Mối nối tường xác định** (`resolveWallSpans`): góc L, chữ T, chữ thập được giải thành tiếp xúc mặt-với-mặt; renderer và bộ kiểm tra dùng chung một kết quả.
4. **Phân biệt tiếp xúc và va chạm** (`classifyBoxes`: disjoint / contact / penetration / insufficient) với dung sai duy nhất `GEOMETRY_TOLERANCE_MM = 1`. `validateSolids` kiểm tra tường, lỗ mở, nội thất, vùng cửa, sàn, tầng, cầu thang, mái và vật thể ngoại cảnh; các tiếp xúc kiến trúc hợp lệ được liệt kê rõ ràng và đếm, không báo lỗi. Kết quả chỉ ở mức `warn`/`info`, không bao giờ `error`.
5. **Không bịa dữ liệu**: chiều cao nội thất, chiều cao cây, loại nội thất lạ → ghi vào `incomplete`, không kết luận "không va chạm". Báo cáo luôn `isApproximate: true`.
6. **Sửa tự động chỉ khi rủi ro thấp và có quy tắc**: nội thất AI được đẩy sát mặt tường trong chính ô lưới đã được kiểm tra; cây bị đẩy ra khỏi tường hoặc bị bỏ; bộ sinh theo luật chỉ nhận vị trí không xuyên tường/không chồng nhau. Tường, lỗ mở, cầu thang, phòng không bao giờ bị dịch chuyển.
7. **Bảng màu theo ngữ nghĩa** (`render3d/src/palette.ts`): preset theo phong cách (modern / japanese-modern / natural / south-european) → lựa chọn màu tường/mái/nhấn/sàn của người dùng ghi đè nguyên văn → một số vai trò phụ được suy ra (viền mái theo màu mái, khung cửa tương phản với tường). Hoàn toàn tất định, tách khỏi hình học và kiểm tra.
8. **Prompt AI**: prompt bố trí mô tả hệ tọa độ, thứ tự dựng, tiếp xúc vs chồng lấn, cấm trường ngoài schema; prompt bình luận không được khẳng định "không va chạm" khi không có kiểm tra xác nhận. Đầu ra AI vẫn là 2D theo lưới.

## Hệ Quả (Consequences)

- **Tích cực**: Mọi thành phần (2D, 3D, kiểm tra, prompt) dùng cùng một quy ước; các lỗi hình học trên đã được sửa và có test hồi quy; kế hoạch theo luật mặc định không còn xuyên tường/chồng nội thất; màu mặc định sáng, hài hòa theo phong cách.
- **Hạn chế**: Kiểm tra dựa trên footprint + khoảng Z, không phải giao lưới (mesh); chưa có chiều cao nội thất nên không kiểm tra va chạm theo phương đứng với trần/bệ cửa sổ; chiều mở cửa được suy theo quy ước (mức `info`). Tinh chỉnh ánh sáng/vật liệu chưa được kiểm chứng bằng ảnh render thật trong CI (không có WebGL).
- **Tương thích**: Không thay đổi schema BDM, API hay JSON đầu ra của AI. `MaterialOptions.style` là trường tùy chọn mới.

## Tài Liệu Liên Quan

- [docs/planner.md §2.1, §2.4, §4](../planner.md)
- [ADR 0003: BDM là nguồn sự thật duy nhất](0003-bdm-single-source-of-truth.md)
- [ADR 0004: LLM không sinh hình học](0004-llm-validated-constraints-only.md)
