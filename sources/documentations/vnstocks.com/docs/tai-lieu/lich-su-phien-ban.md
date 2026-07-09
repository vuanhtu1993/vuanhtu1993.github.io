---
title: "Lịch sử phiên bản"
source_url: "https://vnstocks.com/docs/tai-lieu/lich-su-phien-ban"
crawled_at: "2026-07-09T08:01:24.023Z"
---

## 2026-05-16

> Cập nhật phiên bản Vnstock 4.0.3

**Bổ sung**

-   **Giao dịch Trái phiếu**: Bổ sung cấu trúc dữ liệu trái phiếu vào tầng giao diện Unified UI, đồng nhất kiến trúc với bản `vnstock_data` và bổ sung các hàm ohlcv, trades, quote.
-   **InstrumentType Enum**: Thêm phân loại định danh chứng khoán chuyên sâu để chuẩn hoá việc nhận diện các loại tài sản tài chính.

**Thay đổi & Cải thiện**

-   Bổ sung danh sách các chỉ số index từ HNX, UPCOM và cải thiện khả năng nhận diện symbol qua hàm get\_asset\_type chính xác hơn với hỗ trợ các mã index mới.
-   **Dữ liệu Báo cáo Tài chính**: Hỗ trợ hệ số nhân (`unit_multiplier`), ánh xạ nhất quán cấu trúc cột dữ liệu giữa các nguồn KBS và VCI.
-   **Xử lý Nguồn dữ liệu (MSN & VCI)**: Xây dựng cơ chế resolve mã `SecId` động cho nguồn MSN để sửa lỗi truy xuất dữ liệu lịch sử; làm sạch các header Device-ID của VCI và thêm cơ chế fallback/sanitize URL an toàn khi tải danh sách mã.

## 27-04-2026

> Cập nhật phiên bản Vnstock 4.0

**Thư viện dữ liệu**

-   Sửa lỗi truy cập dữ liệu từ nguồn VCI cho các module thông tin niêm yết (Listing), thông tin công ty (Company), và thông tin BCTC (Finance). Thay thế cơ chế lấy dữ liệu từ GraphQL sang REST API mới của Vietcap.
-   Sửa lỗi tham số `to_df` bị thiếu gây ngừng chương trình.
-   Cập nhật Unified UI (giao diện người dùng hợp nhất): cung cấp cách thức sử dụng hệ thống class/method chuẩn hoá cho toàn thư viện, thương thích với cách đặt tên và tiêu chuẩn của phiên bản tài trợ đã giới thiệu trước đó.

**Tiện ích**

-   Cải thiện khả năng sử dụng Google Colab thuận tiện hơn khi không yêu cầu kết nối Google Drive bắt buộc.
-   Cải thiện logic phát hiện phiên bản phần mềm của hệ sinh thái vnstock đã cập nhật để không hiện lại thông báo phiền phức.
-   Tinh chỉnh lời nhắn hiển thị hướng dẫn chuyển đổi câu lệnh import từ vnstock sang vnstock\_data cho nhà tài trợ mới.

**Tài liệu**

-   Cập nhật Vnstock Agent Guide với các hướng dẫn mới nhất hỗ trợ chuyển đổi code sử dụng class Vnstock sẽ bị loại bỏ từ 1/9/2026 vào skill `vnstock-migration-expert`.

**Thông báo**

-   Hiển thị cảnh báo ngừng hoạt động cho lớp hàm Vnstock thường được sử dụng qua lệnh `from vnstock import Vnstock` sẽ kết thúc hỗ trợ vào 31/8/2026.
-   Thông báo nâng cấp đi kèm hướng dẫn chuyển đổi code sang các lớp hàm tương đương trong thư viện.
-   Agent Skills hỗ trợ việc chuyển đổi được bố sung hướng dẫn trong Vnstock Agent Guide.

## 05-04-2026

**Tính năng bổ sung nổi bật**

-   **Chuẩn hóa API cột dữ liệu (Module KBS)**: Mình đã thiết kế lại định danh tên cột dữ liệu chứng khoán nhằm khớp chính xác 100% với giao diện trên terminal của phần mềm KBS thực tế.
    -   Cột `total_trades` 👉 `volume_accumulated` (tổng khối lượng)
    -   Sinh thêm cột ánh xạ 👉 `volume_last` (khối lượng khớp lệnh lần cuối).  
        **Lưu ý cho bạn**: Anh em đang phân tích DataFrame dựa vào các key trên nhớ cập nhật lại tên hàm nhé để pipeline hệ thống tiếp tục chạy ổn định.
-   **Hệ thống chuyển đổi "Một chạm" (Auto Migration)**: Nâng cấp dự án từ bản cá nhân lên phiên bản tài trợ với đầy đủ chức năng mở rộng (`vnstock_data`) giờ đây không còn là thao tác "Find & Replace" đầy rủi ro nơm nớp lo sợ làm hỏng code. Chỉ với một hàm gọi `migrate_to_sponsor()`, thư viện sẽ trực tiếp sử dụng công nghệ Cây cú pháp trừu tượng (AST) rà quét và tự động chuyển đổi cấu trúc mã nguồn cũ của bạn sang nền tảng chuyên sâu một cách an toàn tuyệt đối!
-   **Hệ thống Nhận diện Môi trường (Auto-Detection Guardrail)**: Vnstock nay trở nên tinh tế hơn bao giờ hết: Nếu nhận thấy bạn đang ở tư cách thành viên Sponsor của mình nhưng lại vô tình nhập các hàm phân tích của gói cơ bản, hệ thống sẽ tự động nhắc nhở và điều hướng để hỗ trợ bạn khai thác trọn vẹn đặc quyền và sức mạnh của gói thư viện sponsor mà bạn đã đăng ký.
-   **Tối ưu hóa Vibe Coding cùng AI**: Vnstock dồn tâm huyết phát triển các chỉ báo hệ thống ngầm (System Prompts) thiết kế đặc biệt dành cho các AI Agent khi phân tích mã nguồn. Giờ đây, các AI sẽ tự nhận diện rõ năng lực của API và đóng vai trò người cố vấn thay vì cố gắng tự gỡ rối hoặc rò rỉ mã lỗi. Chúng sẽ giúp bạn phân tích khi nào việc nâng cấp lên phiên bản tài trợ sẽ mang lại giá trị cao hơn nhiều việc cắm cúi code.

---

## 07-03-2026

**Các thay đổi quan trọng (Breaking Changes)**

-   **Tinh gọn Nguồn Cấp Dữ Liệu**: Để đảm bảo một hệ sinh thái mã nguồn mở tinh gọn và luôn vận hành ổn định tối đa, Vnstock đã đành phải nói lời chia tay với các module dữ liệu lấy từ TCBS cũng như bộ tính năng Lọc cổ phiếu (Screener). Nhưng bạn đừng lo, nếu bạn cần các bộ lọc chuyên sâu nhiều tiêu chí hay tra tìm dữ liệu mở rộng cho nghiên cứu, mọi sức mạnh này hiện được gói trọn trong bản sponsor `vnstock_data`.
-   **Chuẩn hóa Thông số Bảng giá (KBS Quote)**: Cập nhật định dạng dữ liệu giá lịch sử (`history`) và dữ liệu trong ngày (`intraday`) thống nhất sử dụng hệ số thập phân (đơn vị nghìn đồng) thay cho VND. Điều này giúp tính toán nhẹ nhàng hơn nhưng bạn nhớ điều chỉnh lại các công thức nhân chia mệnh giá trong dòng code cũ để tránh tình trạng lệch dữ liệu biểu đồ phân tích.
-   **Loại bỏ hàm `price_depth`**: Hàm này đã chính thức ngừng cung cấp trên module `vci.quote`. Tính năng chỉ có trong gói sponsor `vnstock_data`.

**Tính năng bổ sung & Cải tiến**

-   **Dữ liệu Sự kiện Thị trường (Market Events)**: Vnstock thấu hiểu nỗi đau của những ai làm backtesting khi chiến lược bị lệch pha do các ngày nghỉ lễ hay những hôm nghẽn hệ thống. Module mới `vnstock.core.utils.market_events` ra đời cung cấp bộ lịch sử sự kiện chứng khoán Việt Nam từ năm 2000. Đây là công cụ đắc lực hỗ trợ các mô hình AI và thuật toán phân tích chuỗi thời gian (time-series) của bạn vượt qua bài toán nhiễu loạn dữ liệu.
    
-   **Hàng loạt Cải thiện Ổn định**: Vá ngoạn mục hàng loạt lỗi hệ thống: Bổ sung phương pháp lấy mã cổ phiếu fallback cực thông minh (hiệu quả khi sàn thiếu column gốc); sửa lỗi bắt dữ liệu cho Hợp đồng tương lai đáo hạn và nâng cấp thuật toán đọc số bar trên khung ngày (`500b`) cho KBS Quote được chính xác. Cùng với đó là hoàn thiện việc tích hợp `pytz` hỗ trợ làm đồng bộ các bộ dữ liệu đa không gian múi giờ.
    

---

## 01-02-2026

**Sửa lỗi quan trọng**

-   **Sửa lỗi tương thích pandas**: Khắc phục vấn đề `include_groups` parameter không được hỗ trợ trong pandas 2.1.4, giúp hàm `intraday()` hoạt động bình thường trên mọi phiên bản pandas
-   **Sửa lỗi kiểm thử Listing**: Cập nhật các bài kiểm thử để xử lý chính xác kiểu dữ liệu `pd.Series` trả về từ `all_future_indices` và các phương thức liên quan
-   **Sửa lỗi kiểm thử Quote**: Cải thiện khả năng xử lý dữ liệu thiếu và các hợp đồng đã hết hạn một cách linh hoạt mà không làm thất bại toàn bộ bộ kiểm thử
-   **Sửa lỗi KBS Quote**: Cải thiện khả năng diễn giải các độ dài lookback dựa trên thanh (ví dụ: '500b') sử dụng logic `interpret_lookback_length`

**Cải tiến**

-   **Bổ sung liên kết đến Agent Guide**: Giúp dễ dàng truy cập và sử dụng bộ hướng dẫn chi tiết cho AI trong Vibe Coding.
-   **Chuẩn hóa dữ liệu giá KBS**: Chuyển đổi dữ liệu giá từ nguồn KBS sang sử dụng giá trị thập phân (đơn vị nghìn) thay vì VND trong các phương thức `history` và `intraday`, giúp dữ liệu nhất quán và dễ xử lý hơn

**Loại bỏ**

-   **Loại bỏ phương thức `price_depth`**: khỏi `vnstock.explorer.vci.quote`, tập trung các hàm cơ bản cho phiên bản open source.

---

## 23-01-2026

**Những điểm nổi bật**

-   **Cài đặt & xác thực dễ dàng**
    -   Cài nhanh bằng `pip install vnstock -U` và nhập API Key từ trang quản lý tài khoản Vnstock để sử dụng, hỗ trợ hàm trực tiếp từ thư viện để sử dụng.
-   **Báo cáo tài chính thân thiện với người dùng từ nguồn KBS**
    -   Dữ liệu báo cáo giờ đây được chuẩn hóa tốt hơn: cột rõ ràng, ít trùng lặp và dễ đọc.
    -   Hỗ trợ **lọc ngôn ngữ** (Tiếng Việt / Tiếng Anh / Cả hai) và các chế độ hiển thị (`standardized_only`, `all_fields`, `auto_convert`) giúp bạn nhanh chóng lấy dữ liệu phù hợp cho báo cáo hoặc phân tích.
-   **Dữ liệu đáng tin cậy & chuẩn hóa tiếng Việt**
    -   Cải tiến chuẩn hóa văn bản tiếng Việt (bảng ký tự nâng cấp, chuyển đổi tên trường ổn định) giúp việc tìm, so sánh và tự động hoá xử lý dữ liệu trở nên dễ dàng hơn.
    -   Tự động **phát hiện xung đột các trường thông tin trong BCTC** và sinh ID khi cần, giảm rủi ro nhầm lẫn khi trộn nhiều nguồn dữ liệu.
    -   Bổ sung khả năng truy xuất thông tin các bộ chỉ số đầu tư và chỉ số ngành từ HOSE vào Listing class, truy cập được từ mọi giá trị source.
-   **Trực quan hoá & báo cáo nhanh**
    -   Tích hợp `vnstock_chart` (và `vnstock_ezchart` làm dự phòng) cùng tiện ích mở rộng cho pandas để vẽ biểu đồ và tạo báo cáo chỉ bằng vài dòng mã.
-   **Ổn định & chất lượng phát hành**
    -   Cải thiện quy trình kiểm thử và CI/CD giúp phát hành phiên bản ổn định hơn, lỗi được phát hiện và sửa nhanh hơn.

**Một vài thay đổi nhỏ**

-   Cập nhật đường dẫn đăng ký API key từ `/account` → `/login` (trải nghiệm đăng ký/đăng nhập thống nhất hơn).
-   Tối ưu hiệu suất mô-đun dữ liệu KBS và một số tinh chỉnh nội bộ để nâng cao tốc độ và độ tin cậy.

---

## 11-11-2025

-   🚀 **Phiên bản v3.3.0**
    
    -   **Tương thích hệ thống thư viện Sponsor** sử dụng phương thức xác thực người dùng và quyền sử dụng thông qua Vnstock API key thay cho Github.
    -   **Tăng tốc sử dụng Vnstock trên Google Colab**: Cho phép lưu trữ thư viện & cấu hình vĩnh viễn trong Google Drive để khởi động nhanh thay vì cài đặt lại sau mỗi phiên làm việc.
    -   **Hỗ trợ proxy tự động**: Thêm khả năng sử dụng proxy miễn phí để tránh bị chặn IP, phù hợp cho nghiên cứu và sử dụng cá nhân
    -   **Hệ thống quản lý nguồn dữ liệu**: Tạo hệ thống thống nhất để quản lý tất cả nguồn dữ liệu (VCI, TCBS, FMP, XNO, DNSE)
    -   **Kết nối FMP & XNO**: Thêm nguồn dữ liệu thị trường quốc tế, cần lấy API key miễn phí từ FMP và XNO
    -   **Tái tổ chức mã nguồn**: Gộp các module trong core.utils, chuẩn hóa cách đặt tên và cấu trúc trong common
    -   **Hệ thống kiểm thử đầy đủ**: Thêm bộ test toàn diện cho các module VCI, TCBS, FMP với kiểm thử tích hợp
    -   **Chuyển sang pyproject.toml**: Thay thế setup.py bằng pyproject.toml, cập nhật các thư viện phụ thuộc
    -   **Cấu hình Context7**: Thiết lập hệ thống lập chỉ mục tài liệu cho AI
    -   **Cập nhật tài liệu**: Làm mới notebook hướng dẫn nhanh, hướng dẫn sử dụng
-   🔧 **Cải thiện kỹ thuật**
    
    -   Chuẩn hóa hằng số thị trường, chỉ số và định nghĩa kiểu dữ liệu
    -   Cải thiện xử lý lỗi và thông báo xác thực
    -   Tối ưu cấu hình proxy với chế độ dự phòng và xử lý lỗi
    -   Tái cấu trúc mã nguồn tiêu chuẩn với tài liệu mô tả bằng tiếng Anh
-   📚 **Tài liệu**
    
    -   Cập nhật notebook hướng dẫn nhanh cho FMP và XNO
    -   Thêm script demo và ví dụ [sử dụng proxy](https://github.com/thinh-vu/vnstock/blob/main/docs/PROXY_GUIDE.md) tại Github

## 23-05-2025

-   Hỗ trợ mã hợp đồng tương lai mới theo chuẩn KRX:
    
    1.  **Loại CK phái sinh** (ký tự 1)
        
    2.  **Nhóm CK** (ký tự 2: 1=Future, 2=Spread)
        
    3.  **Tài sản cơ sở** (ký tự 3–4: I1=VN30, B5=GB05, BA=GB10, I2=VN100)
        
    4.  **Năm đáo hạn** (ký tự 5: 0→W, loại trừ I,O,U)
        
    5.  **Tháng đáo hạn** (ký tự 6: 1→C)
        
    6.  **Mã sản phẩm** (ký tự 7–9, ví dụ 000 = HĐTL)
        
-   **Ví dụ chuyển đổi**: VN30F2504 → 41I1F4000
    

Cập nhật này giúp Vnstock nhận diện đúng loại hợp đồng tương lai khi bạn nhập mã hợp đồng theo cấu trúc mới.

## 07-05-2025

Cài đặt phiên bản thử nghiệm:

Xem thêm hướng dẫn tại [Tải về & Cài đặt](https://vnstocks.com/onboard/trai-nghiem-vnstock)

**Cập nhật nổi bật**

-   [Issue 164](https://github.com/thinh-vu/vnstock/issues/164): Gỡ & thay thế code cho package fake\_user\_agent trong toàn bộ hệ sinh thái
-   Sửa lỗi hàm `intraday` sau cập nhật hệ thống KRX
    -   Dữ liệu từ nguồn VCI thay đổi kiểu dữ liệu (`object`/`float`) thay vì `int` như trước đó.
    -   Dữ liệu từ nguồn TCBS bị sai lệnh múi giờ (dữ liệu mới đã chuẩn múi giờ GMT+7)
-   Bổ sung thông tin bạn đồng hành đóng góp mã nguồn và tài trợ dự án nổi bật vào mô tả dự án.

## 22-04-2025

**Cải tiến kiến trúc**

-   Bổ sung cấu trúc Adapter mới tại `vnstock/api`
-   Thuật toán mới tăng độ chính xác và linh hoạt khi chuyển đổi nguồn dữ liệu
-   Loại bỏ lớp trung gian cấp cao Vnstock, trực tiếp sử dụng các lớp: `Quote`, `Finance`, `Trading`, `Listing`, `Company`
-   Tương thích ngược: mọi hàm và class cũ vẫn hoạt động bình thường

**Hướng dẫn minh họa**

-   Bổ sung file notebook minh họa mới sử dụng các cấu trúc lớp trung gian chuyển đổi nguồn nhanh chóng [tại đây](https://colab.research.google.com/github/thinh-vu/vnstock/blob/main/docs/wrapper/1_1_quickstart_stock_vietnam.ipynb)

**Hoàn thiện quy trình phát triển**

-   Báo lỗi qua [GitHub Issues](https://github.com/thinh-vu/vnstock/issues) tại trang Github Vnstock
-   Theo dõi lộ trình qua [GitHub Projects](https://github.com/users/thinh-vu/projects/4) tại trang Github Vnstock

## 27-03-2025

> Cập nhật phiên bản 3.2.3 cải thiện trải nghiệm người dùng

-   Xử lý chính xác các cột có tên trùng lặp trong hàm `balance_sheet` trả về bảng cân đối kế toán. Theo đó cột xuất hiện sau với tên trùng lặp sẽ được đặt tên với tiền tố `_`. Ví dụ `Chứng khoán kinh doanh` và `_Chứng khoán kinh doanh` cho cột xuất hiện sau. Hai cột này tồn tại có ý nghĩa theo hình thức cha/con trên bảng cân đối kế toán tiêu chuẩn.
-   Merge [pull request 159](https://github.com/thinh-vu/vnstock/pull/159): Bổ sung cột sẽ được lựa chọn hiển thị tiếng Việt khi trích xuất dữ liệu từ Dict
-   Bổ sung `tenacity` là gói phụ thuộc khi cài đặt dự án
-   Sửa lỗi không cho truy cập dữ liệu intraday từ nguồn TCBS ngoài giờ giao dịch.
-   Sửa lỗi hàm Pandas `map` và thay thế với `applymap` để tương thích với bản Pandas cũ hơn 2.x trong module company của nguồn VCI (dòng 135)
-   Cập nhật file README đổi tên Vnstock3 thành Vnstock

## 24-03-2025

> Cập nhật phiên bản 3.2.2 sửa lỗi 502 Bad Request xuất hiện với nguồn dữ liệu VCI.

Lỗi 502 Bad Request xuất hiện trùng thời điểm với việc nâng cấp lên phiên bản 3.2.1 đã khiến nhiều người thắc mắc. Sau khi phân tích, chúng tôi đã xác định được nguyên nhân: VCI đã thay đổi địa chỉ cấp dữ liệu API, khiến các yêu cầu gửi đến API cũ không còn hiệu lực và dẫn đến phản hồi không ổn định.

## 23-03-2025

> Cập nhật phiên bản 3.2.1 với nhiều thay đổi quan trọng

-   Bổ sung tính năng bộ lọc cổ phiếu từ TCBS
-   Thêm dữ liệu thông tin công ty từ nguồn VCI
-   Kết nối Google Drive từ Colab - Không bao giờ quên lưu dữ liệu nữa
-   Cải tiến trải nghiệm người dùng
    -   Nhận diện phiên giao dịch: tự động gửi cảnh báo lỗi chi tiết giúp bạn điều hướng dễ dàng khi truy cập dữ liệu `intraday` và `price_depth` trước phiên giao dịch.
    -   Cảnh báo chủ động rate limit
    -   Chuẩn hóa tên cột: Thay đổi `ticker` → `symbol`, `HOSE` → `HSX`, giúp dữ liệu đồng nhất, dễ xử lý hơn.
    -   Cập nhật API key MSN: Đảm bảo việc lấy dữ liệu luôn ổn định và nhanh chóng.
-   Tái cấu trúc mã nguồn
    -   Tăng mức độ module hóa mã nguồn
    -   Cấu trúc tinh gọn và dễ bảo trì
    -   Chuẩn hóa xử lý lỗi

Chi tiết, vui lòng xem trong bài blog.

## 02-01-2025

-   Cập nhật gói thư viện lên trang phân phối pypi.org. Câu lệnh cài đặt mặc định: `pip install -U vnstock` sẽ luôn cài đặt phiên bản vnstock mới nhất vào máy của bạn. Câu lệnh `pip install vnstock3` sẽ vẫn có hiệu lực, chỉ cập nhật đến phiên bản 3.1.0.
-   Cập nhật tài liệu hướng dẫn trên website và file Demo. Tất cả lệnh sẽ sử dụng `vnstock` để chỉ định phiên bản hiện tại của Vnstock3.1.0.1.

Tham khảo blog để biết thêm chi tiết [tại đây](https://vnstocks.com/blog/chuyen-doi-sang-vnstock3-truoc-2025).

## 02-11-2024

> Phát hành chính thức phiên bản v3.0.9 qua PyPI.

Cài đặt với câu lệnh: `pip install -U vnstock` trên máy của bạn.

-   Nâng cấp hàm truy xuất dữ liệu từ nguồn VCI cho báo cáo tài chính. Lọc các cột dữ liệu không liên quan, trùng lặp xuất hiện trong các phiên bản trước đó. Chỉ tập trung các giá trị dữ liệu cho đúng loại hình công ty của mã bạn tra cứu. Có 4 nhóm công ty bao gồm Công ty phổ thông, Ngân hàng, Chứng khoán, Bảo hiểm.
-   Sửa lỗi chuyển đổi nhanh mã cổ phiếu. Cho phép cài đặt tham số `symbol` khi gọi hàm với cú pháp `stock.finance(symbol='TCB')`. Việc này giúp bạn không cần phải cập nhật mã symbol khi khởi tạo class mà có thể thayd đổi trong method gọi dữ liệu cụ thể. Thay đổi này sau đó sẽ áp dụng cho class trong các hàm tiếp theo.
-   Bổ sung thêm tuỳ chọn tham số `show_log` trong các class của Vnstock, bạn có thể tắt log message (các hiển thị cảnh báo) bằng cách đặt `show_log=False`.
-   Khắc phục lỗi định dạng `NoneType Object` khi không nhập mã chứng khoán trong Listing class với câu lệnh:

```
from vnstock3 import Vnstock 
stock = Vnstock().stock(source='VCI')
```

-   Khắc phục lỗi 404 khi truy cập dữ liệu giá từ module Quote của VCI do API url thay đổi.
-   Khắc phục lỗi không nhận diện các mã chỉ số khi tra cứu lịch sử giá từ module Quote.history. Các mã chỉ số chuẩn sử dụng cho tra cứu thị trường chứng khoán Việt Nam gồm: VNINDEX, HNXINDEX, UPCOMINDEX
-   Bổ sung khả năng lấy dữ liệu giá lịch sử cho Trái phiếu niêm yết & nâng cấp cơ chế nhận diện loại tài sản với khả năng nhận diện mã nhập vào là Trái phiếu.

## 15-10-2024

Cập nhật phiên bản mới, gỡ lỗi một số vấn đề phát sinh được báo lỗi: -Lỗi khi gọi lịch sử giá: [issue 147](https://github.com/thinh-vu/vnstock/issues/147)

-   Bổ sung cơ chế báo lỗi khi dữ liệu trả về không như mong muốn với BCTC: [issue 133](https://github.com/thinh-vu/vnstock/issues/133#issuecomment-2395270403)

## 12-08-2024

Cập nhật mã nguồn phiên bản 0.3.0.7

-   Sửa lỗi mốc thời gian giá lịch sử không ổn định. Hiện tại có thể lấy thông tin giá lịch sử thuộc tất cả các khung thời gian với tham số `end` là ngày hiện tại. Mã báo lỗi 135: [tại đây](https://github.com/thinh-vu/vnstock/issues/135)
-   Bổ sung cơ chế xử lý lỗi khi thông tin `event_desc` trả về trong DataFrame không chứa thành phần HTML cần chuyển đổi thành văn bản. Mã báo lỗi 141 [tại đây](https://github.com/thinh-vu/vnstock/issues/141#issuecomment-2271610641)
-   Sửa lỗi & cải thiện phương thức lấy dữ liệu báo cáo tài chính từ VCI:
    -   Sửa lỗi tên biến `UNIT_MAPPING` không khớp
    -   Tự động loại bỏ dữ liệu N/A trong báo cáo tài chính. Việc này giúp loại bỏ các dữ liệu không có ý nghĩa và trùng lặp tên cột. Bạn có thể tuỳ chỉnh sử dụng tham số dropna=False để chỉ định giữ lại dữ liệu nguyên bản (có thể trùng lặp tên cột - khác ý nghĩa dữ liệu) và N/A.
-   Hỗ trợ API đặt lệnh từ Vnstock Python sử dụng bộ API từ DNSE. Mã nguồn được kế thừa từ phiên bản Vnstock Legacy. Chi tiết [tại đây](https://vnstocks.com/docs/vnstock/api-dat-lenh-giao-dich-dnse)
-   Bổ sung thông tin gói phụ thuộc
    -   Bổ sung phiên bản cố định cho các gói phụ thuộc vào file [requirements.txt](https://github.com/thinh-vu/vnstock/blob/main/requirements.txt)
    -   Bổ sung `seaborn` vào danh sách gói phụ thuộc để loại bỏ lỗi khi cài đặt trên máy tính mới không có sẵn `seaborn`.

## 10-07-2024

Cập nhật mã nguồn phiên bản 0.3.0.6

-   Chuyển đổi mã nguồn Vnstock Legacy sang Vnstock3 cho bộ công cụ gửi tin nhắn qua Telegram, Lark, Slack [tại đây](https://vnstocks.com/docs/vnstock/gui-tin-nhan-telegram-slack-larksuite).
-   Chuyển đổi mã nguồn module `fund.py` từ Vnstock Legacy sang Vnstock3 [tại đây](https://vnstocks.com/docs/vnstock/du-lieu-quy-mo).
-   Loại bỏ cơ chế bắt buộc người dùng chấp nhận điều khoản, điều kiện rõ ràng. Mặc định, bạn chấp nhận điều khoản & điều kiện khi tiếp tục sử dụng Vnstock3.
-   Sửa lỗi và cải thiện trải nghiệm:
    -   Xác thực thông tin mã quỹ nhập vào [tại đây](https://github.com/thinh-vu/vnstock/issues/118)
    -   Lỗi khi lấy giá lịch sử theo tháng [tại đây](https://github.com/thinh-vu/vnstock/issues/127)

## 21-06-2024

Cập nhật phiên bản 0.3.0.5

-   Sửa lỗi không hiển thị đúng múi giờ trong thời gian của bảng giá lịch sử với khung thời gian giờ và phút, chi tiết issue [tại đây](https://github.com/thinh-vu/vnstock/issues/131)
-   Sửa lỗi không cho phép truy xuất thông tin giá từ TCBS nếu `symbol` không phải là mã cổ phiếu. Chi tiết issue [tại đây](https://github.com/thinh-vu/vnstock/issues/128)
-   Bổ sung xác thực thông tin nhập liệu cho hàm `history`
    -   Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc.

## 03-06-2024

Cập nhật phiên bản 0.3.0.3

-   Tích hợp khả năng biểu diễn dữ liệu của vnstock\_ezchart trực tiếp vào thư viện. Chi tiết [tại đây](https://vnstocks.com/docs/vnstock/bieu-dien-du-lieu)
-   Tách riêng notebook min hoạ theo chủ đề. Chi tiết [tại đây](https://github.com/thinh-vu/vnstock/tree/main/docs)
-   Cập nhật hàm truy xuất api\_key từ nguồn dữ liệu MSN, khắc phục lỗi truy xuất dữ liệu các loại chứng khoán quốc tế.
-   Cập nhật nội dung phản ánh các thay đổi của dự án trên Website.

## 25-05-2024

-   Sửa lỗi tự động ghi đè thông tin mã cổ phiếu theo mã báo lỗi [9547585](https://github.com/thinh-vu/vnstock/discussions/16#discussioncomment-9547585)
    
-   Hoàn thiện nhóm hàm chức năng truy xuất dữ liệu tài chính. Hiện tại có thể gọi thuộc tính `finance` từ lớp Vnstock() thay vì gọi hàm từ trực tiếp nguồn dữ liệu kiểu `vnstock3.explorer.vci.finance`.
    
-   Cập nhật hàm minh hoạ trong [Demo Notebook](https://colab.research.google.com/github/thinh-vu/vnstock/blob/main/docs/vnstock3_demo.ipynb).
    
-   Bổ sung tài liệu hướng dẫn chi tiết
    
    -   [Thông tin niêm yết](https://vnstocks.com/docs/vnstock/thong-tin-niem-yet)
    -   [Thông tin công ty](https://vnstocks.com/docs/vnstock/thong-tin-cong-ty)
    -   [Báo cáo tài chính](https://vnstocks.com/docs/vnstock/bao-cao-tai-chinh)
-   Dành cho nhóm phát triển:
    
    -   Bổ sung cấu trúc thư mục `tests` dùng cho việc kiểm thử gói phần mềm.

## 10-05-2024

![Blog image](https://vnstocks.com/images/Hello_Vnstock3_10-05-2024-97749fc40c003ac445c205b3215bed4c.png)

## 23-01-2024

-   Cập nhật mã nguồn hàm `financial_report` sửa lỗi triệt để lỗi sử dụng 'Excel file format cannot be determined, you must specify an engine manually' do dữ liệu trả về không phải định dạng Excel.
    -   Nguồn dữ liệu từ Fiintrade của SSI sử dụng mã `OrganCode` để tra cứu thông tin công ty trong đó có báo cáo tài chính. Có khoảng > 600 mã cổ phiếu có mã symbol khác OrganCode do đó có nhiều mã khi tra cứu BCTC với mã symbol sẽ gây ra rỗi trong khi với các mã khác thì không. Ví dụ `YTC` có OrganCode là `YTECO` dùng để tra cứu BCTC.
    -   Bổ sung `openpyxl` là gói phụ thuộc để đọc dữ liệu trả về từ API dưới dạng file Excel. Lỗi này xảy ra khi cài bản Python thuần. Không gặp lỗi với Google Colab hoặc Anaconda.
-   Sửa lỗi vnstock web app

## 21-01-2024

-   Bổ sung tích hợp cho phép sử dụng các hàm gửi tin nhắn từ vnstock qua Telegram/Slack với các channel/group chat được cài đặt.
-   Cập nhật nội dung trang tài liệu
-   Khởi động dự án vnstock-next cho thế hệ phần mềm vnstock tiếp theo.

## 03-01-2024

-   Cập nhật khung chương trình khóa học Python 5 khai giảng 21/1/2024
    
-   Bổ sung tính năng hiện banner thông báo quan trọng trên trang tài liệu.
    

## 02-01-2024

-   Bổ sung tính năng OCR sử dụng Pytesseract cho vnstock và vnstock-data-pro. Chi tiết [tại đây](https://docs.vnstock.site/integrate/pytesseract-ocr-chuyen-doi-tai-lieu-tai-chinh-scan-sang-van-ban/)

## 24-12-2023

-   Cập nhật tài liệu dự án
    -   Tài liệu truy xuất [giá lịch sử](https://docs.vnstock.site/functions/technical/)
    -   Hướng dẫn [truy xuất dữ liệu giao dịch nước ngoài/tự doanh](https://docs.vnstock.site/functions/market/#giao-dich-ntnn) sử dụng gói phần mềm `vnstock-data-pro`
    -   Hướng dẫn nhanh

## 16-12-2023

-   Cập nhật tài liệu dự án
    
    -   Bổ sung hướng dẫn sử dụng tích hợp SSI Fast Connect API trong gói `vnstock-pro-data` [tại đây](https://docs.vnstock.site/integrate/ssi_fast_connect_api/)
    -   Bổ sung thông tin chi tiết chương trình Vnstock Insider Program [tại đây](https://docs.vnstock.site/insiders-program/gioi-thieu-chuong-trinh-vnstock-insiders-program)
-   Bổ sung `requirements.txt` cho trình tạo trang tĩnh MKDocs giúp cài đặt gói phụ thuộc để thiết lập trang tài liệu và xem trước dễ dàng.
    

## 14-12-2023

Chính thức phát hành các thay đổi từ nhánh Beta trong phiên bản 2.8.7. Chi tiết cập nhật qua blog: [tại đây](https://vnstocks.com/2023/12/15/ra-mat-vnstock-insider-program-cap-nhat-nhieu-tinh-nang-thu-vi/)

-   Ra mắt Vnstock Insiders Program cung cấp quyền truy cập tới các kho chứa mã nguồn riêng tư (private repo)
    
-   Ra mắt `vnstock-pro-data` trong chương trình Insiders, cung cấp khả năng truy cập dữ liệu chất lượng cao với độ trễ thấp.
    
    -   Tải dữ liệu giá OHLCV nhanh chóng, chính xác không cần xác thực qua Public API của SSI.
    -   Tải và streaming dữ liệu qua SSI Fast Connect API chính thức (cần đăng ký và xác thực người dùng)
-   Chính thức phát hành tính năng truy cập dữ liệu quỹ mở. Hướng dẫn [tại đây](https://docs.vnstock.site/functions/funds/)
    
-   Hỗ trợ xuất dữ liệu time series cho OpenBB Terminal. Hướng dẫn [tại đây](https://docs.vnstock.site/integrate/OpenBBTerminal/)
    
-   Cập nhật tài liệu dự án
    

## 10-12-2023

-   Bổ sung tính năng truy xuất dữ liệu quỹ mở từ fmarket.vn, phát triển từ mã nguồn do `andrey_jef` đóng góp. Tài liệu mô tả và demo notebook đã được cập nhật tương ứng.
-   Đưa `plotly` thành thư viện tùy chọn, chỉ phải import vào dự án nếu người dùng có nhu cầu sử dụng tính năng vẽ đồ thị. Việc này giúp vnstock chạy trên môi trường khác Google Colab không cần cài đặt thêm `plotly` theo mặc định. Mã nguồn được cập nhật lên bản beta trên Github, thay đổi sẽ được đẩy lên PyPI trong tuần tới.
-   Cập nhật tài liệu hướng dẫn cho nội dung lấy dữ liệu giá lịch sử.
-   Cập nhật tài liệu hướng dẫn cách cài đặt thư viện TA-Lib cho phân tích kỹ thuật trên máy tính Windows.

## 02-04-2024

## 23-01-2024

-   Cập nhật mã nguồn hàm `financial_report` sửa lỗi triệt để lỗi sử dụng 'Excel file format cannot be determined, you must specify an engine manually' do dữ liệu trả về không phải định dạng Excel.
    -   Nguồn dữ liệu từ Fiintrade của SSI sử dụng mã `OrganCode` để tra cứu thông tin công ty trong đó có báo cáo tài chính. Có khoảng > 600 mã cổ phiếu có mã symbol khác OrganCode do đó có nhiều mã khi tra cứu BCTC với mã symbol sẽ gây ra rỗi trong khi với các mã khác thì không. Ví dụ `YTC` có OrganCode là `YTECO` dùng để tra cứu BCTC.
    -   Bổ sung `openpyxl` là gói phụ thuộc để đọc dữ liệu trả về từ API dưới dạng file Excel. Lỗi này xảy ra khi cài bản Python thuần. Không gặp lỗi với Google Colab hoặc Anaconda.
-   Sửa lỗi vnstock web app

## 21-1-2024

-   Bổ sung tích hợp cho phép sử dụng các hàm gửi tin nhắn từ vnstock qua Telegram/Slack với các channel/group chat được cài đặt.
-   Cập nhật nội dung trang tài liệu
-   Khởi động dự án vnstock-next cho thế hệ phần mềm vnstock tiếp theo.

## 03-01-2024

-   Cập nhật khung chương trình khóa học Python 5 khai giảng 21/1/2024
    
-   Bổ sung tính năng hiện banner thông báo quan trọng trên trang tài liệu.
    

## 02-01-2024

-   Bổ sung tính năng OCR sử dụng Pytesseract cho vnstock và vnstock-data-pro. Chi tiết [tại đây](https://docs.vnstock.site/integrate/pytesseract-ocr-chuyen-doi-tai-lieu-tai-chinh-scan-sang-van-ban/)

## 24-12-2023

-   Cập nhật tài liệu dự án
    -   Tài liệu truy xuất [giá lịch sử](https://docs.vnstock.site/functions/technical/)
    -   Hướng dẫn [truy xuất dữ liệu giao dịch nước ngoài/tự doanh](https://docs.vnstock.site/functions/market/#giao-dich-ntnn) sử dụng gói phần mềm `vnstock-data-pro`
    -   Hướng dẫn nhanh

## 16-12-2023

-   Cập nhật tài liệu dự án
    
    -   Bổ sung hướng dẫn sử dụng tích hợp SSI Fast Connect API trong gói `vnstock-pro-data` [tại đây](https://docs.vnstock.site/integrate/ssi_fast_connect_api/)
    -   Bổ sung thông tin chi tiết chương trình Vnstock Insider Program [tại đây](https://docs.vnstock.site/insiders-program/gioi-thieu-chuong-trinh-vnstock-insiders-program)
-   Bổ sung `requirements.txt` cho trình tạo trang tĩnh MKDocs giúp cài đặt gói phụ thuộc để thiết lập trang tài liệu và xem trước dễ dàng.
    

## 14-12-2023

Chính thức phát hành các thay đổi từ nhánh Beta trong phiên bản 2.8.7. Chi tiết cập nhật qua blog: [tại đây](https://vnstocks.com/2023/12/15/ra-mat-vnstock-insider-program-cap-nhat-nhieu-tinh-nang-thu-vi/)

-   Ra mắt Vnstock Insiders Program cung cấp quyền truy cập tới các kho chứa mã nguồn riêng tư (private repo)
    
-   Ra mắt `vnstock-pro-data` trong chương trình Insiders, cung cấp khả năng truy cập dữ liệu chất lượng cao với độ trễ thấp.
    
    -   Tải dữ liệu giá OHLCV nhanh chóng, chính xác không cần xác thực qua Public API của SSI.
    -   Tải và streaming dữ liệu qua SSI Fast Connect API chính thức (cần đăng ký và xác thực người dùng)
-   Chính thức phát hành tính năng truy cập dữ liệu quỹ mở. Hướng dẫn [tại đây](https://docs.vnstock.site/functions/funds/)
    
-   Hỗ trợ xuất dữ liệu time series cho OpenBB Terminal. Hướng dẫn [tại đây](https://docs.vnstock.site/integrate/OpenBBTerminal/)
    
-   Cập nhật tài liệu dự án
    

## 10-12-2023

-   Bổ sung tính năng truy xuất dữ liệu quỹ mở từ fmarket.vn, phát triển từ mã nguồn do `andrey_jef` đóng góp. Tài liệu mô tả và demo notebook đã được cập nhật tương ứng.
-   Đưa `plotly` thành thư viện tùy chọn, chỉ phải import vào dự án nếu người dùng có nhu cầu sử dụng tính năng vẽ đồ thị. Việc này giúp vnstock chạy trên môi trường khác Google Colab không cần cài đặt thêm `plotly` theo mặc định. Mã nguồn được cập nhật lên bản beta trên Github, thay đổi sẽ được đẩy lên PyPI trong tuần tới.
-   Cập nhật tài liệu hướng dẫn cho nội dung lấy dữ liệu giá lịch sử.
-   Cập nhật tài liệu hướng dẫn cách cài đặt thư viện TA-Lib cho phân tích kỹ thuật trên máy tính Windows.

## 10-12-2023

-   Bổ sung tính năng truy xuất dữ liệu quỹ mở từ fmarket.vn, phát triển từ mã nguồn do `andrey_jef` đóng góp. Tài liệu mô tả và demo notebook đã được cập nhật tương ứng.
-   Đưa `plotly` thành thư viện tùy chọn, chỉ phải import vào dự án nếu người dùng có nhu cầu sử dụng tính năng vẽ đồ thị. Việc này giúp vnstock chạy trên môi trường khác Google Colab không cần cài đặt thêm `plotly` theo mặc định. Mã nguồn được cập nhật lên bản beta trên Github, thay đổi sẽ được đẩy lên PyPI trong tuần tới.
-   Cập nhật tài liệu hướng dẫn cho nội dung lấy dữ liệu giá lịch sử.
-   Cập nhật tài liệu hướng dẫn cách cài đặt thư viện TA-Lib cho phân tích kỹ thuật trên máy tính Windows.

## 09-11-2023

> Phát hành phiên bản 0.2.8.5

-   Cập nhật hàm `stock_intraday_data`
    -   Bổ sung tham số `investor_segment`, mặc định nhận giá trị `True` cho phép trả về dữ liệu khớp lệnh theo phân nhóm nhà đầu tư (như các phiên bản trước), khi đặt là `False` cho phép trả về dữ liệu thô, không gộp thông tin lệnh theo phân nhóm.
-   Bổ sung hàm `amibroker_ohlc_export` cho phép xuất dữ liệu sang định dạng CSV để nạp dữ liệu cho Amibroker. Chi tiết [tại đây](http://docs.vnstock.site/integrate/amibroker/)
-   Bổ sung hướng dẫn tích hợp vnstock với dự án sử dụng thư viện phân tích kỹ thuật TA-lib python. Chi tiết [tại đây](http://docs.vnstock.site/integrate/ta_lib/)
-   Giới thiệu một số thư viện Backtesting trong python giúp kiểm thử chiến lược giao dịch. Chi tiết [tại đây](http://docs.vnstock.site/integrate/backtesting/)

## 08-11-2023

> Phát hành phiên bản 0.2.8.4

-   Tùy biến hàm `stock_historical_data` giúp dễ dàng sử dụng với các thư viện phân tích kỹ thuật khác trong Python.
    
    -   Thêm tham số `decor`, nhận giá trị mặc định là `False` (không thay đổi dữ liệu trả về với cách sử dụng hiện tại của người dùng). Khi đặt `decor=True`, áp dụng thay tên các cột trong DataFrame trả về dưới dạng Title Case tức `Open, High, Low, Close, Time, Ticker` thay vì `open, high, low, close, time, ticker` như hiện tại đồng thời đặt cột Time là index. Việc này giảm bớt cho người dùng phải viết thêm câu lệnh khi sử dụng dữ liệu vnstock kết hợp các thư viện phân tích kỹ thuật phổ biến vốn dùng thư viện Yahoo Finance làm nguồn cấp dữ liệu.
        
    -   Bổ sung tham số `source` cho phép chọn nguồn tải dữ liệu là `TCBS` hay `DNSE`. Nguồn dữ liệu `TCBS` cho lấy dữ liệu lịch sử theo ngày (resolution = `1D`) trong thời gian dài, không hỗ trợ khung thời gian nhỏ hơn. Trong khi đó nguồn dữ liệu `DNSE` cho phép lấy dữ liệu với nhiều khung thời gian khác nhau, giới hạn 90 ngày gần nhất đối với dữ liệu phút, 10 năm gần nhất đối với dữ liệu ngày.
        
-   Cập nhật tcbs\_headers sử dụng cho các request đến API của TCBS
    

## 05-11-2023

-   Hoàn thiện tích hợp đầy đủ DNSE Lightspeed API vào mã nguồn vnstock. Phát hành phiên bản 0.2.8.2. Sử dụng lệnh `pip install -U vnstock` để cập nhật phiên bản.

## 29-10-2023

-   Tích hợp API endpoints cơ bản của DNSE vào vnstock
    -   Demo cho các nhà đầu tư cách tạo 1 request và kết nối hệ thống DNSE để lấy JWT token
    -   Demo xuất thông tin tài khoản
-   Cập nhật tài liệu sử dụng

## 27-10-2023

-   Bổ sung và hoàn thiện một số hàm cho vnstock
    -   Hàm `listing_companies` nay được cung cấp thêm khả năng lấy danh sách công ty niêm yết từ SSI/FiinTrade. Việc này giúp người dùng có thể tham chiếu mã công ty từ mã cổ phiếu để lấy thông tin trong một số trường hợp đặc biệt FiinTrade sử dụng mã này thay cho mã cổ phiếu. Ví dụ, thay vì dùng mã cổ phiếu `BCM` gây ra lỗi cho hàm, bạn cần sử dụng mã công ty tương ứng là `BIDC`
    -   Hàm `indices_listing` cho phép liệt kê tất cả mã chỉ số hiện có trên sàn.
    -   Hàm `financial_ratio_compare` cho phép so sánh chỉ số tài chính của một danh sách các mã cổ phiếu.

## 26-10-2023

-   Khôi phục các hàm lấy dữ liệu từ nguồn SSI gồm `financial_report`, `fr_trade_heatmap`, `market_top_mover` do SSI hiện tại đã gỡ bỏ mọi hạn chế về kỹ thuật áp dụng cho bot thực hiện web scraping.
-   Cập nhật tài liệu sử dụng kèm theo
-   Cập nhật Demo Notebook

## 25-10-2023

-   Bổ sung hướng dẫn xuất dữ liệu sang các định dạng phổ biến bao gồm CSV, Excel, và dữ liệu cho Amibroker.
-   Thử nghiệm tính năng Blog của Mkdocs Matterial cho chuyên mục Kiến thức.

## 21-10-2023

-   Giới thiệu cách sử dụng vnstock trong Google Sheets với Neptyne for Google Sheets.
-   Di chuyển mục nội dung vnstock cho Google Sheets sang tab `Ứng dụng & Tích hợp`

## 20-10-2023

-   Chuyển đổi nền tảng tài liệu từ Pretty-Docs sang [MkDocs Matterial](https://squidfunk.github.io/mkdocs-material/) thân thiện và nhiều tính năng hữu ích hơn.
    
-   Cập nhật mô tả các hàm để tiện theo dõi bao gồm:
    
    -   Xoay DataFrame kết quả trả về để có thể hiển thị đầy đủ tên các cột dữ liệu
    -   Bổ sung mô tả tham số đầu vào của hàm

## 14-10-2023

> Phiên bản: 0.2.2: Đưa tính năng vẽ đồ thị chính thức vào phiên bản ổn định, cập nhật hàm truy xuất giá lịch sử

-   Cập nhật hàm `stock_historical_data` để trả về thông tin chính xác
    
    -   Loại bỏ bước tính toán nhân chỉ số và mã phái sinh với 1000 khi trả về dữ liệu. Cách tính này làm sai lệch giá trị của chỉ số và mã phái sinh vì bản chất giá trị OHLC này khác với giá cổ phiếu.
    -   Bổ sung thêm tham số **beautify**, đặt giá trị mặc định là True để giữ nguyên cách nhân 1000 cho giá cổ phiếu. Người dùng có thể chuyển về False để giữ nguyên giá trị OHLC dạng thập phân rút gọn.
-   Chính thức đưa các hàm vẽ đồ thị vào phiên bản chính thức của vnstock sau quá trình thử nghiệm
    
    -   Hàm **candlestick\_chart** cho phép vẽ đồ thị nến cùng các đường trung bình động, hỗ trợ, kháng cự cơ bản.
        
        ![candlestick](https://res.cloudinary.com/dv3vzmogk/image/upload/v1783584082/aha-mind/docs-crawler/vnstocks.com/VIC_candlestick_qunhdn.png)candlestick
    -   Hàm **bollinger\_bands\_chart** cho phép vẽ đồ thị nến (hoặc đường) kèm các dải Bollinger Bands. Hàm này cần sử dụng kèm hàm **bollinger\_bands** để chuyển đổi dữ liệu OHLC tiêu chuẩn sang dữ liệu Bollinger Bands.
        
        ![bollinger bands](https://res.cloudinary.com/dv3vzmogk/image/upload/v1783584082/aha-mind/docs-crawler/vnstocks.com/bollinger_bands_chart_ywvvqp.png)bollinger bands

## 10-10-2023

-   Hàm **listing\_company** được điều chỉnh để hỗ trợ truy xuất danh sách mã cổ phiếu cập nhật realtime qua API.
    -   Bổ sung tham số **live** nhận giá trị True hoặc False, mặc định là False cho phép truy xuất danh sách cổ phiếu từ tệp csv lưu trữ trên Github. Cấu trúc của file dữ liệu cục bộ chứa thông tin đầy đủ hơn so với chế độ realtime.
    -   Loại bỏ tham số **path**

## 06-10-2023

> Thay đổi cấu trúc thư mục và tài liệu vnstock repo trên Github

-   Tái cấu trúc cây thư mục của vnstock repo trên Github
    -   Chuyển toàn bộ file markdown vào thư mục **docs** trừ file README (Tiếng Việt).
        -   Chuyển thư mục **src** vào bên trong thư mục **docs** và đổi tên thành **resources**. Các file ảnh đính kèm dự án được đưa vào sâu hơn 1 cấp bên trong thư mục **images**.
    -   Đơn giản hóa nội dung file README của repo. Đưa tất cả tài liệu hướng dẫn vào vnstock docs.
    -   Bổ sung cơ chế kiểm tra mã phản hồi (status\_code) của API trước khi trả về dữ liệu cho hàm **stock\_intraday\_data**

## 05-10-2023

> vnstock docs Phiên bản 1.1 sử dụng Pretty-Docs theme

Thử nghiệm thành công và ra mắt phiên bản thử nghiệm 1.0 cho trang tài liệu vnstock docs sử dụng pretty-docs theme.

## 22-08-2023

-   Cập nhật tệp dữ liệu **listing\_companies** lên phiên bản mới nhất.
-   Cập nhật hàm **financial flow**
    -   Thêm tham số **get\_all** để lấy tất cả dữ liệu có sẵn hoặc chỉ dữ liệu mới nhất (5 năm hoặc 10 quý).
-   Cập nhật Demo Notebook để minh họa các thay đổi mới nhất.

## 24-07-2023

-   Bắt đầu triển khai hàm truy xuất dữ liệu chứng khoán phái sinh.
-   Kết hợp một hàm sàng lọc cổ phiếu từ TCBS vào thư viện.
-   Cải thiện hàm stock\_historical\_data với các cập nhật sau:
    -   Khi độ khung thời gian (resolution) được đặt thành **1D**, cột thời gian sẽ hiển thị theo định dạng ngày **YYYY-mm-dd**.
    -   Thêm một giá trị mới **derivative** cho tham số **type**, cho phép truy xuất dữ liệu phái sinh.
-   Các tham chiếu hàm trong tệp README đã được cấu trúc theo các tình huống sử dụng thực tế, như Phân tích Kỹ thuật, Phân tích Cơ bản, Sàng lọc Cổ phiếu, vv. Điều này giúp cho tài liệu thân thiện và có tổ chức hơn với người dùng. Phiên bản tiếng Anh của tệp README cũng đã được cập nhật để phù hợp với phiên bản tiếng Việt.

## 22-07-2023

-   Bổ sung hướng dẫn vào [Demo Notebook](https://github.com/thinh-vu/vnstock/blob/legacy/demo/gen2_vnstock_demo_index_all_functions_testing_2023.ipynb) giúp người dùng xuất dữ liệu từ Google Colab ra Google Sheets.

## 14-07-2023

-   Phát hành phiên bản 0.17 trên PyPI.
-   Những thay đổi trên nhánh **beta** sẽ được cập nhật vào nhánh **main** và phát hành qua PyPI hàng tháng từ bây giờ.
-   File README.md đã được cập nhật để đồng bộ hóa phiên bản tiếng Anh và tiếng Việt.
-   Dữ liệu file listing\_companies\_enhanced-2023.csv trong thư mục data của repo này được sử dụng để cung cấp dữ liệu công ty niêm yết cho hàm listing\_companies.
-   Hàm mới, price\_depth, đã được giới thiệu để lấy giá và khối lượng giao dịch cho danh sách các cổ phiếu. Hàm này có thể được sử dụng song song với hàm price\_board.

## 13-07-2023

-   Phân loại các tính năng của vnstock trong file Demo Jupyter Notebook theo 5 nhóm chính:
    
    1.  Thị trường (Market Watch)
    2.  Phân tích cơ bản (Fundamental Analysis)
    3.  Phân tích kỹ thuật (Technical Analysis)
    4.  Lựa chọn cổ phiếu (Stock Screening)
    5.  Trung tâm giao dịch (Trading Center)
-   Đã sửa lại file demo notebook để cập nhật các hàm mới.
    
-   Khôi phục giá đơn vị của stock\_historical\_data từ 1000 VND thành VND bằng cách nhân với 1000.
    
-   Hàm **price\_board** đã được cập nhật.
    
-   Bổ sung hàm mới trong mô đun **utils.py** để trích xuất giá trị ngày tháng theo định dạng YYYY-mm-dd.
    

## 05-07-2023

-   Cập nhật file README.md (áp dụng cho tiếng Việt trước).
-   Các hàm liên quan đến nguồn dữ liệu SSI không hoạt động đã bị loại bỏ.
-   Hàm **financial\_ratio** đã được cải tiến với các cập nhật sau đây:
    -   DataFrame kết quả bây giờ có cấu trúc được chuyển vị (transpose), với năm/quý đóng vai trò là chỉ mục, giúp sử dụng thuận tiện hơn.
    -   Tham số **is\_all** đã trở thành tham số phụ tùy chọn.
-   Hàm **industry\_analysis** và stock\_ls\_analysis đã được cải thiện:
    -   DataFrame kết quả bây giờ có cấu trúc được chuyển vị, với tên mã cổ phiếu làm tiêu đề cột, giúp dễ sử dụng.
    -   Thêm tham số **lang**, cho phép hiển thị cột DataFrame bằng nhãn tiếng Việt hoặc tiếng Anh.

## 29-06-2023

-   Đã cập nhật hàm stock\_intraday\_data để cung cấp thêm dữ liệu chi tiết trả về bởi hàm và dễ sử dụng hơn
-   Cập nhật hàm stock\_historical\_data để hỗ trợ lấy dữ liệu lịch sử về các chỉ số.

## 22-06-2023

-   Phát hành phiên bản 0.15 rên Pypi.
-   Giới thiệu một tính năng mới cho hàm stock\_historical\_data, cho phép lấy dữ liệu với nhiều độ phân giải thời gian khác nhau. Đã nâng cấp API tương ứng hỗ trợ hàm này.
    -   Bao gồm tham số độ phân giải để cho phép người dùng lấy dữ liệu giá tại các khoảng thời gian 1 phút, 3 phút, 5 phút, 15 phút, 30 phút, 1 giờ hoặc 1 ngày.
    -   Sửa tên cột trong bảng dữ liệu trả về từ tradingDate thành time.
-   Đã đánh dấu rõ các hàm không khả dụng cho các API liên quan tới SSI.
-   Tùy chọn **mode='live'** trong hàm listing\_companies() đã được loại bỏ. Hàm này bây giờ chỉ đọc danh sách công ty từ tệp csv trên repo github này.
-   Cập nhật cây thư mục cho github repo, thêm thư mục dữ liệu và thêm tệp dữ liệu, thư mục demo để lưu trữ các tệp demo.

## 07-06-2023

Chính thức hỗ trợ hướng dẫn sử dụng bằng tiếng Việt cho tệp thư viện thông qua file README.md, giúp thúc đẩy khả năng tiếp cận với vnstock cho người dùng Việt Nam.

## 20-05-2023

-   Nhánh **main** dành riêng cho các cập nhật quan trọng, trong khi nhánh **beta** được sử dụng cho các cập nhật nhỏ. Từ bây giờ, gói PyPI sẽ phản ánh nội dung của nhánh **main**.
-   Hàm listing\_companies() bây giờ có thể đọc danh sách công ty từ tệp csv trên repo github này hoặc từ một yêu cầu API trực tiếp.
-   Hàm stock\_intraday\_data() bây giờ có một giới hạn mới là 100 cho tham số page\_size do TCBS thiết lập.
