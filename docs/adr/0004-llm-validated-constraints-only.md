# ADR 0004: LLM Chỉ Sinh Ràng Buộc Đã Kiểm Thực, Tuyệt Đối Không Sinh Hình Học (LLM Produces Validated Constraints Only, Never Geometry)

- **Trạng thái**: Đã chấp thuận (Accepted)
- **Ngày quyết định**: 2026-10-12
- **Người đề xuất**: Kiến trúc sư hệ thống AI HOME
- **Phạm vi**: Tích hợp AI/LLM, Bộ giải ràng buộc, An toàn kiến trúc & Pháp lý

---

## Bối Cảnh (Context)

Với sự bùng nổ của các mô hình ngôn ngữ lớn (LLM như OpenAI GPT, Google Gemini, Anthropic Claude), nhiều hệ thống thử nghiệm cho LLM sinh trực tiếp mã SVG, tọa độ phòng `(x, y, w, h)`, hoặc sinh trực tiếp bản vẽ CAD từ câu lệnh của người dùng (prompts).

Tuy nhiên, trong lĩnh vực thiết kế nhà ở Nhật Bản:
1. **Ảo giác tọa độ (Coordinate Hallucination)**: LLM rất yếu về tính toán không gian và hình học chính xác. LLM thường sinh ra các phòng chồng lấn nhau, tường hở không khép kín, hoặc kích thước không khớp lưới mô-đun 910mm chuẩn xây dựng Nhật.
2. **Vi phạm pháp lý nghiêm trọng**: Nhà ở tại Nhật Bản bị ràng buộc chặt chẽ bởi Luật Tiêu chuẩn Xây dựng (建築基準法) về mật độ xây dựng (建ぺい率), hệ số sử dụng đất (容積率), đường vát khống chế chiều cao (斜線制限), thông gió và ánh sáng (採光). LLM không thể đảm bảo tuân thủ 100% các quy định này.
3. **Chi phí token & Độ trễ**: Việc yêu cầu LLM sinh hàng nghìn dòng tọa độ hình học gây tốn kém token và độ trễ phản hồi quá lớn (hàng chục giây).

---

## Quyết Định (Decision)

Chúng tôi quyết định **giới hạn nghiêm ngặt vai trò của LLM**:
1. **Chỉ xử lý ngôn ngữ tự nhiên (NLP Intent Extraction)**:
   - LLM chỉ được dùng để hiểu ý muốn tự do của khách hàng (ví dụ: *"Vợ tôi thích bếp đảo nhìn thấy con chơi ở phòng khách"*, *"Cần phòng làm việc yên tĩnh ở tầng 2"*, *"Muốn có kho chứa đồ khô rộng cạnh bếp"*).
2. **Đầu ra duy nhất của LLM là Ràng buộc cấu trúc (Structured Constraints)**:
   - LLM phản hồi định dạng JSON chứa các luật ràng buộc thuộc tập từ vựng đã được hệ thống định nghĩa trước (ví dụ: `adjacent("kitchen", "living")`, `orientation("living", "south")`, `floor("study", 2)`).
3. **Bắt buộc kiểm thực qua Zod Schema (Strict Validation Guard)**:
   - Mọi kết quả do LLM trả về đều phải đi qua Zod parser (`aiConstraintSchema`).
   - Nếu LLM sinh ra loại phòng không có trong danh mục (`room_types`), hoặc cú pháp ràng buộc không hợp lệ, hệ thống sẽ loại bỏ ràng buộc lỗi hoặc yêu cầu LLM sửa lại.
4. **Bộ sinh hình học (Planner) đảm nhiệm vị trí**:
   - Thuật toán Planner tất định (`@aihome/planner`) nhận các ràng buộc đã được kiểm thực và thực hiện việc đặt phòng, xếp tường, tạo cửa trên lưới mô-đun 910mm, đảm bảo 100% hình học hợp lệ và tuân thủ các chỉ số pháp lý (BCR, FAR).
5. **Cơ chế dự phòng (Deterministic Fallback)**:
   - Nếu API của nhà cung cấp AI gặp sự cố hoặc timeout, hệ thống vẫn hoạt động bình thường bằng cách sử dụng bảng ánh xạ câu trả lời wizard sang ràng buộc (`answers-mapping`) mà không cần AI.

---

## Hệ Quả (Consequences)

### Tích Cực (Positive)
- **100% An toàn và Đúng quy chuẩn**: Loại bỏ hoàn toàn nguy cơ sinh ra bản vẽ hỏng, tường đè lên nhau hoặc vi phạm luật xây dựng Nhật Bản.
- **Tiết kiệm chi phí token**: Payload phản hồi của LLM chỉ là danh sách vài chục ràng buộc JSON ngắn gọn (vài trăm token thay vì hàng chục nghìn token hình học).
- **Tính giải trình cao (Explainability)**: Khi một phòng được bố trí ở một vị trí cụ thể, hệ thống có thể chỉ rõ: *"Phòng này được đặt ở đây vì thỏa mãn ràng buộc X do yêu cầu của bạn và giới hạn pháp lý Y"*.
- **Độc lập nhà cung cấp AI**: Dễ dàng chuyển đổi giữa Google Gemini, Anthropic Claude, hoặc mô hình cục bộ (Local Mock) thông qua cấu hình `AI_PROVIDER` mà không ảnh hưởng đến thuật toán dựng nhà.

### Tiêu Cực & Hạn Chế (Negative & Mitigations)
- **Không sinh được các hình khối kiến trúc tự do, phi quy chuẩn**: Hệ thống chỉ sinh được các mặt bằng bám theo hệ thống ràng buộc và danh mục phòng mà Planner hỗ trợ.
  *Biện pháp*: Bổ sung liên tục từ vựng ràng buộc trong `@aihome/config-schema` để mở rộng khả năng diễn đạt của hệ thống.

---

## Tài Liệu Liên Quan
- `docs/CODING_CONVENTION.md` §0 (Nguyên tắc 1: Config-driven; Nguyên tắc 3: Lõi tính toán là hàm thuần).
- `docs/ai.md`: Đặc tả chi tiết về prompt, định dạng JSON ràng buộc và cơ chế an toàn AI.
- `docs/answers-mapping.md`: Bảng ánh xạ câu hỏi wizard sang ràng buộc planner.
