# ADR 0006: Hỗ Trợ Đa Ngôn Ngữ (i18n) Với Tiếng Nhật Là Mặc Định (i18n: ja default, en, vi)

- **Trạng thái**: Đã chấp thuận (Accepted)
- **Ngày quyết định**: 2026-10-12
- **Người đề xuất**: Kiến trúc sư hệ thống AI HOME
- **Phạm vi**: Giao diện React, Thông báo API Laravel, Bộ từ điển bản địa hóa

---

## Bối Cảnh (Context)

AI HOME PLATFORM phục vụ thị trường nhà ở Nhật Bản:
1. **Đối tượng người dùng cuối**: Khách hàng cá nhân, chủ nhà và các công ty xây dựng, kiến trúc sư tại Nhật Bản. Ngôn ngữ giao tiếp tự nhiên và trải nghiệm thị giác phải mang đậm chuẩn mực Nhật (từ ngữ kiến trúc chính xác, phong cách xưng hô lịch sự teineigo, font chữ Noto Sans JP chuẩn xác).
2. **Đội ngũ phát triển & Vận hành**: Đội ngũ kỹ sư phần mềm, kiểm thử và thiết kế đa quốc gia (Việt Nam, Nhật Bản, quốc tế).
3. **Mở rộng quốc tế**: Nền tảng có định hướng mở rộng dịch vụ cho khách hàng quốc tế muốn mua hoặc đầu tư xây dựng nhà tại Nhật Bản (hỗ trợ Tiếng Anh và Tiếng Việt).

Nếu không có chiến lược đa ngôn ngữ ngay từ ngày đầu:
- Chuỗi ký tự (hardcoded strings) sẽ nằm rải rác trong các file JSX/TSX và Controller PHP.
- Chi phí tái cấu trúc (refactoring) để hỗ trợ đa ngôn ngữ sau này sẽ cực kỳ tốn kém và dễ sót chuỗi dịch.

---

## Quyết Định (Decision)

Chúng tôi quyết định áp dụng kiến trúc **Đa ngôn ngữ toàn diện (Full Internationalization - i18n)** với các nguyên tắc:

1. **Tiếng Nhật (`ja`) là ngôn ngữ mặc định và ngôn ngữ gốc (Primary & Fallback Locale)**:
   - Toàn bộ giao diện khởi động mặc định bằng Tiếng Nhật.
   - Khi một khóa dịch bị thiếu ở Tiếng Anh hoặc Tiếng Việt, hệ thống tự động rơi về chuỗi Tiếng Nhật gốc (`fallbackLng: 'ja'`).
   - Cấu hình Laravel `.env`: `APP_LOCALE=ja`, `APP_FALLBACK_LOCALE=ja`.
2. **Công nghệ & Thư viện**:
   - **Frontend**: Sử dụng `i18next` và `react-i18next`. Sử dụng hook `useTranslation()` và helper `t('namespace.key')`.
   - **Backend**: Sử dụng hệ thống Localization chuẩn của Laravel (`lang/ja/*.php`, `lang/en/*.php`, `lang/vi/*.php`) cho các thông báo xác thực (Validation errors) và lỗi API chuẩn RFC 7807 Problem Details.
3. **Cấm tuyệt đối Hard-code chuỗi ký tự trên UI**:
   - Tất cả nhãn nút, tiêu đề, thông báo lỗi, văn bản hướng dẫn đều phải định nghĩa trong từ điển bản địa hóa (`apps/api/resources/js/shared/locales/{ja,en,vi}/*.json`).
   - Được kiểm tra tự động qua plugin ESLint `eslint-plugin-i18next`.
4. **Xử lý thuật ngữ chuyên ngành kiến trúc**:
   - Các thuật ngữ đặc thù của nhà ở Nhật (như 間取り, 坪, 畳, LDK, 建ぺい率, 容積率) được lưu giữ chính xác theo quy chuẩn tại `docs/GLOSSARY.md`. Khi hiển thị ở bản dịch Tiếng Anh hoặc Tiếng Việt, giữ thuật ngữ gốc kèm chú giải hoặc đơn vị quy đổi chuẩn (m²).
5. **Kiểu chữ (Typography)**:
   - Font chữ mặc định cho toàn bộ ứng dụng là **Noto Sans JP** (nhúng sẵn qua Google Fonts), đảm bảo hiển thị Kanji, Hiragana và Katakana sắc nét, không bị lỗi răng cưa hay nhảy font trên các hệ điều hành khác nhau.

---

## Hệ Quả (Consequences)

### Tích Cực (Positive)
- **Chuẩn hóa trải nghiệm người dùng Nhật**: Người dùng Nhật Bản có trải nghiệm tự nhiên, chuẩn mực về cả câu chữ lẫn văn hóa giao tiếp.
- **Tiện lợi tối đa cho đội ngũ phát triển**: Kỹ sư Việt Nam và quốc tế có thể dễ dàng chuyển đổi sang giao diện Tiếng Anh hoặc Tiếng Việt thông qua component `LanguageSwitcher` để kiểm thử và hiểu luồng nghiệp vụ.
- **Dễ dàng bổ sung ngôn ngữ mới**: Thêm một ngôn ngữ mới chỉ đơn giản là bổ sung một file JSON bản dịch tương ứng mà không cần chạm vào logic component.

### Tiêu Cực & Hạn Chế (Negative & Mitigations)
- **Tăng chi phí biên dịch**: Mỗi khi thêm tính năng mới, nhà phát triển phải cập nhật đồng thời cả 3 file từ điển (`ja`, `en`, `vi`).
  *Biện pháp*: Tiếng Nhật là bắt buộc; nếu chưa kịp dịch tiếng Anh/Việt thì cơ chế fallback `ja` sẽ tạm thời thế chỗ mà không làm gãy UI.

---

## Tài Liệu Liên Quan
- `docs/CODING_CONVENTION.md` §1 (Công nghệ: i18next `ja` mặc định) & §3 (Bảng thuật ngữ chuẩn Nhật).
- `docs/GLOSSARY.md`: Bảng thuật ngữ ba ngôn ngữ Nhật - Anh - Việt.
- `apps/api/resources/js/shared/locales/`: Thư mục chứa các tệp từ điển ngôn ngữ.
