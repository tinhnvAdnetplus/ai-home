# Bảng Thuật Ngữ (Glossary) — AI HOME PLATFORM

Tài liệu này chuẩn hóa thuật ngữ ba ngôn ngữ (**Tiếng Nhật - Tiếng Anh - Tiếng Việt**) áp dụng cho toàn bộ dự án AI HOME PLATFORM.
Theo quy ước tại `docs/CODING_CONVENTION.md` §3:
- Tên biến, trường trong schema hoặc mã nguồn phải bám sát thuật ngữ chuẩn tiếng Nhật (ví dụ: `buildingCoverageRatio` cho 建ぺい率, `floorAreaRatio` cho 容積率, `tsubo`, `jo`).
- Đơn vị tính toán trong lõi hệ thống luôn là **milimét nguyên (`mm`)**. Đơn vị diện tích truyền thống (坪, 帖, m²) chỉ xuất hiện ở tầng giao diện và hiển thị.

---

## 1. Không Gian & Bố Cục Kiến Trúc Nhật Bản (Architectural Space & Layouts)

| Tiếng Nhật (Kanji / Kana / Romaji) | Tiếng Anh (English) | Tiếng Việt (Vietnamese) | Định nghĩa & Quy ước hệ thống |
|---|---|---|---|
| **間取り**<br>*(Madori)* | Floor plan / Room layout | Bố cục phòng / Sơ đồ mặt bằng nhà | Cách bố trí, sắp xếp và phân chia các phòng, không gian chức năng trên mặt bằng một ngôi nhà. |
| **LDK**<br>*(Living-Dining-Kitchen)* | Living-Dining-Kitchen | Phòng khách - ăn - bếp kết hợp | Không gian sinh hoạt chung tích hợp ba chức năng: phòng khách (L), phòng ăn (D) và bếp (K). Phổ biến nhất trong nhà ở hiện đại Nhật. |
| **DK**<br>*(Dining-Kitchen)* | Dining-Kitchen | Phòng ăn kết hợp bếp | Không gian gồm bàn ăn và bếp, tách biệt với phòng khách riêng. |
| **坪**<br>*(Tsubo)* | Tsubo | Tsubo (Đơn vị diện tích truyền thống) | 1 坪 ≈ 3.30578 m² (khoảng 2 chiếu tatami). Quy ước đổi hệ thống: `tsubo = area_m2 / 3.30578` (chỉ hiển thị, không lưu trữ trong lõi). |
| **畳 / 帖**<br>*(Jō / Tatami)* | Tatami mat unit (Jo) | Chiếu Tatami (đơn vị đo diện tích phòng) | 1 畳 ≈ 1.65 m² (nửa tsubo). Diện tích phòng ngủ, phòng khách Nhật thường được tính bằng số chiếu (ví dụ: 6 畳, 8 畳). |
| **平屋**<br>*(Hiraya)* | Single-story house / Bungalow | Nhà một tầng / Nhà trệt / Cấp 4 | Nhà chỉ có một tầng trệt, không có cầu thang. Khi chọn 平屋, hệ thống tự động ẩn các tùy chọn tầng 2/tầng 3. |
| **2階建て / 3階建て**<br>*(Nikaidate / Sankaidate)* | Two-story / Three-story house | Nhà 2 tầng / Nhà 3 tầng | Nhà nhiều tầng. Yêu cầu tính toán vị trí cầu thang và mối quan hệ xếp tầng (vertical stacking) giữa các phòng ướt. |
| **玄関**<br>*(Genkan)* | Entryway / Foyer / Porch | Tiền sảnh đón / Cửa vào nhà | Không gian bước vào nhà, nơi tháo và cất giày dép, thường hạ thấp bậc so với sàn chính (土間). |
| **土間**<br>*(Doma)* | Dirt floor / Earthen / Tiled floor utility area | Sàn đất nện / Sàn gạch ngang mặt đất | Không gian đệm có bề mặt ngang mặt đất hoặc thấp hơn sàn gỗ, dùng để giày dép, xe đạp, dụng cụ làm vườn. |
| **和室**<br>*(Washitsu)* | Japanese-style room | Phòng kiểu Nhật | Phòng truyền thống lát chiếu tatami, cửa trượt shoji/fusuma, có thể có hốc tường tokonoma. |
| **洋室**<br>*(Youshitsu)* | Western-style room | Phòng kiểu Tây / Phòng sàn gỗ | Phòng lát sàn gỗ hiện đại, cửa mở cánh bản lề. |
| **主寝室**<br>*(Shushinshitsu)* | Master bedroom | Phòng ngủ chính (Master) | Phòng ngủ lớn nhất dành cho chủ nhà, thường có diện tích ≥ 6–8 畳. |
| **子ども部屋**<br>*(Kodomo-beya)* | Children's bedroom | Phòng ngủ trẻ em | Phòng ngủ phụ cho con cái, thường từ 4.5 đến 6 畳. |
| **水回り**<br>*(Mizumawari)* | Wet areas / Plumbing zones | Khu vực cấp thoát nước | Tập hợp các phòng có đường ống nước: Nhà vệ sinh (トイレ), phòng tắm (浴室), phòng rửa mặt (洗面所), bếp (キッチン). Cần bố trí gần nhau hoặc thẳng trục đứng. |
| **洗面所**<br>*(Senmenjo)* | Washroom / Vanity area | Phòng rửa mặt / Bồn rửa tay | Không gian đặt bàn gương rửa mặt, thường tách riêng với nhà vệ sinh và phòng tắm trong chuẩn nhà Nhật. |
| **脱衣所**<br>*(Datsuijo)* | Changing room / Dressing area | Phòng thay đồ cạnh phòng tắm | Nơi cởi đồ trước khi vào bồn tắm, thường đặt máy giặt (洗濯機置場). |
| **浴室 / ユニットバス**<br>*(Yokushitsu / Unit Bath)* | Bathroom / System bath | Phòng tắm / Buồng tắm đúc sẵn | Phòng tắm chống thấm khép kín gồm vòi sen và bồn ngâm sâu (Ofuro) đặc trưng của Nhật. |
| **トイレ**<br>*(Toire)* | Toilet / Restroom | Nhà vệ sinh riêng | Buồng vệ sinh độc lập, trang bị bồn cầu thông minh (washlet), tách biệt hoàn toàn với phòng tắm. |
| **パントリー**<br>*(Pantorī)* | Pantry | Kho chứa đồ khô / Kho bếp | Phòng hoặc tủ kho nhỏ nằm cạnh bếp để dự trữ thực phẩm, gia vị, đồ gia dụng. |
| **ファミリークローゼット**<br>*(Famiri-kurōzetto)* | Family Walk-in Closet (FCL) | Tủ quần áo chung gia đình | Kho chứa quần áo tập trung cho cả gia đình, thường kết nối với khu giặt phơi. |
| **ウォークインクローゼット**<br>*(WIC)* | Walk-in Closet | Phòng/tủ thay đồ dạng bước vào | Tủ chứa đồ có lối đi vào bên trong, thường kết nối với phòng ngủ chính. |
| **シューズインクローゼット**<br>*(SIC)* | Shoes-in Closet / Mudroom | Tủ giày bước vào / Kho sảnh | Kho chứa giày dép, áo khoác, xe đẩy nằm ngay cạnh tiền sảnh (玄関). |
| **吹抜**<br>*(Fukinuke)* | Void / Open ceiling space | Khoảng thông tầng | Khoảng không gian mở thông giữa tầng 1 và tầng trên, giúp lấy sáng và tạo cảm giác rộng rãi. |
| **バルコニー / ベランダ**<br>*(Barukonī / Beranda)* | Balcony / Veranda | Ban công / Hiên ngoài trời | Không gian ngoài trời tầng 2 trở lên, thường dùng để phơi đồ hoặc ngắm cảnh. |
| **外構**<br>*(Gaikou)* | Exterior works / Landscaping | Công trình ngoại thất / Sân vườn cảnh quan | Toàn bộ các hạng mục bên ngoài nhà: cổng, hàng rào, lối đi, bãi đỗ xe, sân vườn. |
| **動線**<br>*(Dousen)* | Circulation line / Traffic flow | Luồng di chuyển / Dây chuyền giao thông | Tuyến đường di chuyển của con người trong nhà (ví dụ: 家事動線 - luồng làm việc nhà, 帰宅動線 - luồng về nhà). |

---

## 2. Tiêu Chuẩn Pháp Lý & Xây Dựng Nhật Bản (Building Standards Act / 建築基準法)

| Tiếng Nhật (Kanji / Kana / Romaji) | Tiếng Anh (English) | Tiếng Việt (Vietnamese) | Định nghĩa & Quy ước hệ thống |
|---|---|---|---|
| **敷地面積**<br>*(Shikichi Menseki)* | Site area / Lot area | Diện tích khu đất | Toàn bộ diện tích của thửa đất sau khi đã trừ phần diện tích lùi đường (nếu có). |
| **建築面積**<br>*(Kenchiku Menseki)* | Building area / Footprint area | Diện tích xây dựng (chiếm đất) | Diện tích hình chiếu bằng của công trình xuống mặt đất (không bao gồm phần mái đua ≤ 1m). |
| **延床面積**<br>*(Nobeyuka Menseki)* | Total floor area / Gross floor area | Tổng diện tích sàn xây dựng | Tổng diện tích sàn của tất cả các tầng trong ngôi nhà. |
| **建ぺい率**<br>*(Kenpeiritsu)* | Building Coverage Ratio (BCR) | Mật độ xây dựng (%) | Tỷ lệ phần trăm giữa diện tích xây dựng và diện tích đất: `BCR = (建築面積 / 敷地面積) * 100%`. Không được vượt quá giới hạn pháp lý. |
| **容積率**<br>*(Yousekiritsu)* | Floor Area Ratio (FAR) | Hệ số sử dụng đất (%) | Tỷ lệ phần trăm giữa tổng diện tích sàn và diện tích đất: `FAR = (延床面積 / 敷地面積) * 100%`. |
| **斜線制限**<br>*(Shasen Seigen)* | Slant line restrictions / Setback planes | Giới hạn đường vát khống chế chiều cao | Các đường vát hình học quy định trong Luật Xây dựng Nhật Bản nhằm đảm bảo thông gió và ánh sáng cho khu vực xung quanh. |
| **道路斜線制限**<br>*(Douro Shasen)* | Road slant line restriction | Giới hạn đường vát mặt đường | Khống chế chiều cao công trình từ phía ranh giới lòng đường đối diện. |
| **隣地斜線制限**<br>*(Rinchi Shasen)* | Neighboring land slant line restriction | Giới hạn đường vát ranh đất láng giềng | Khống chế chiều cao công trình tính từ ranh giới đất tiếp giáp nhà hàng xóm. |
| **北側斜線制限**<br>*(Kitagawa Shasen)* | North slant line restriction | Giới hạn đường vát phía Bắc | Đường vát nghiêm ngặt từ ranh giới phía Bắc của thửa đất để tránh che khuất ánh nắng mặt trời của nhà phía sau. |
| **用途地域**<br>*(Youto Chiiki)* | Zoning district | Phân vùng quy hoạch chức năng đất | Quy định loại hình công trình được phép xây dựng (ví dụ: Khu dân cư thấp tầng loại 1 - 第一種低層住居専用地域). |
| **防火地域 / 準防火地域**<br>*(Bouka / Jun-bouka)* | Fire protection / Semi-fire protection district | Khu vực bảo vệ chống cháy / Bán chống cháy | Khu vực đô thị yêu cầu nghiêm ngặt về vật liệu chống cháy cho tường ngoài, mái và cửa sổ. |
| **セットバック**<br>*(Set-back)* | Road setback (Article 42 Para 2) | Lùi chỉ giới đường đỏ (Điều 42 Khoản 2) | Quy định lùi ranh giới xây dựng nếu đường trước nhà hẹp dưới 4m để đảm bảo xe cứu hỏa lưu thông. |
| **採光**<br>*(Saikou)* | Daylighting requirement | Tiêu chuẩn thông gió và lấy sáng tự nhiên | Yêu cầu diện tích cửa sổ lấy sáng tối thiểu cho các phòng sinh hoạt (居室) theo quy định Luật Xây dựng. |

---

## 3. Hệ Thống Mô-đun & Kỹ Thuật Lưới (Modular Grid & Measurement)

| Thuật ngữ | Tiếng Anh | Tiếng Việt | Ý nghĩa trong AI HOME PLATFORM |
|---|---|---|---|
| **尺貫法** *(Shakkan-hō)* | Shakkan-ho traditional system | Hệ đo lường truyền thống Nhật | 1 尺 (shaku) ≈ 303 mm; 1 間 (ken) = 6 尺 ≈ 1,820 mm. |
| **910モジュール** *(910 Module)* | 910mm Grid Module (Kyoma / Kanto-ma) | Mô-đun lưới 910mm | Chuẩn lưới phổ biến nhất trong xây dựng nhà gỗ Nhật Bản. Nửa間 (910mm) là bước nhảy cơ bản của tường, phòng và cột. Lõi planner sử dụng số nguyên milimét chia hết cho 910 (hoặc 455mm cho nửa mô-đun). |
| **メーターモジュール** *(Meter Module)* | 1000mm Grid Module | Mô-đun lưới 1m (1000mm) | Chuẩn lưới hiện đại sử dụng bước nhảy 1,000 mm, giúp hành lang và cầu thang rộng rãi hơn. |
| **スパン** *(Span)* | Span | Nhịp dầm / Khoảng cách cột | Khoảng cách không cột giữa hai kết cấu chịu lực, thường tối đa 3,640 mm - 4,550 mm trong nhà khung gỗ (在来工法). |
| **通し柱** *(Tōshibashira)* | Through pillar / Continuous column | Cột suốt xuyên tầng | Cột gỗ chịu lực chạy liên tục từ móng tầng 1 lên đến mái tầng 2, thường đặt tại 4 góc nhà. |

---

## 4. Thuật Ngữ Kiến Trúc Hệ Thống Phần Mềm (Software Architecture Terms)

| Thuật ngữ | Khái niệm & Trách nhiệm | Vai trò trong AI HOME PLATFORM |
|---|---|---|
| **BDM** | **Building Data Model** (Mô hình dữ liệu công trình) | Cấu trúc dữ liệu JSON duy nhất (`@aihome/bdm`) biểu diễn tọa độ hình học 2D/3D (mm), tường, cửa, phòng, mái, thuộc tính công trình. Là **Single Source of Truth** cho mọi renderer (2D SVG, 3D Three.js, DXF CAD, PDF). |
| **Planner** | **Layout Generator Engine** (Bộ sinh mặt bằng) | Thư viện TypeScript thuần chạy trên trình duyệt (`@aihome/planner`) sử dụng Web Worker. Thuật toán tất định (deterministic) dựa trên hạt giống `seed`, sắp xếp các khối phòng trên lưới 910mm thỏa mãn các ràng buộc. |
| **Constraints** | **Architectural & User Constraints** (Hệ thống ràng buộc) | Tập hợp các điều kiện logic và hình học mà phương án mặt bằng phải thỏa mãn: tiếp giáp (`adjacent`), hướng nắng (`orientation`), diện tích tối thiểu/tối đa, cấm tầng trên (`forbidUpperFloor`), v.v. |
| **LLM Constraint Extraction** | **LLM-assisted Intent Parsing** | Trí tuệ nhân tạo chỉ đọc ngôn ngữ tự nhiên của người dùng để trích xuất thành danh sách **ràng buộc có kiểm thực Zod**, tuyệt đối **không sinh tọa độ hình học**. |
| **Draft / Published Lifecycle** | **Versioned Configuration Documents** | Mô hình quản lý cấu hình: Nháp (`draft`) sửa đổi tự do -> Xuất bản (`published`) sinh phiên bản bất biến (`v1, v2`) kèm ETag. Khách hàng nhận cấu hình qua API bundle và fallback về code mặc định nếu mất mạng. |
| **RFC 7807 (Problem Details)** | **Problem Details for HTTP APIs** | Chuẩn format lỗi API thống nhất: `{ type, title, status, detail, instance, errors }`. |
| **Hash Routing (`#/`)** | **Client-side Hash Routing** | Cơ chế điều hướng SPA không làm thay đổi pathname HTTP, giúp máy chủ web không cần cấu hình rewrite URL phức tạp. |
