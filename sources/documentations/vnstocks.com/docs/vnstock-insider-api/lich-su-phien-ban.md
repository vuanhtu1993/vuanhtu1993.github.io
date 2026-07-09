---
title: "Lịch sử phiên bản"
source_url: "https://vnstocks.com/docs/vnstock-insider-api/lich-su-phien-ban"
crawled_at: "2026-07-09T08:01:37.625Z"
---

## 28-06-2026

> Phát hành `vnstock_data` phiên bản 3.2.3 hoàn thiện cấu trúc tin tức của công ty niêm yết và chuẩn hoá mô hình dữ liệu.

-   **Chuẩn hoá mô hình dữ liệu (Unified Schema) cho Tin tức doanh nghiệp:** Giao diện `Reference().company('MÃ_CK').news()` được chuẩn hoá hoàn toàn trên 3 nguồn `vci`, `kbs`, và `cafef` với chung 10 cột dữ liệu thống nhất (`id`, `symbol`, `title`, `summary`, `content`, `publish_time`, `source`, `url`, `category`, `image_url`).
-   **Nâng cấp tính năng lấy tin tức chi tiết:** Bổ sung tham số `mode='detail'` cho phép đọc full nội dung bài viết và bóc tách các link đính kèm trực tiếp từ `vci` và `cafef`.
-   **Hỗ trợ tuỳ chỉnh tham số linh hoạt:** Chuẩn hoá các tham số bộ lọc thời gian (`start`, `end`, `length`, `limit`) và nâng cấp khả năng truyền linh hoạt `**kwargs` xuống hàm của từng nguồn.

## 20-06-2026

> Phát hành `vnstock_pipeline` phiên bản 2.3.1 cấu trúc lại toàn bộ kiến trúc lưu trữ dữ liệu, giới thiệu file cấu hình tập trung `pipeline.toml` và cải tiến mạnh mẽ CLI hỗ trợ quản trị cơ sở dữ liệu chứng khoán hiệu quả.

**⚠️ Thay Đổi Mang Tính Phá Vỡ**

-   **Gỡ bỏ `DuckDBProcessor` & `FirebaseProcessor`**: Cấu trúc mới tập trung gom dữ liệu thô lưu trữ định dạng Parquet/CSV hiệu suất cao. Người dùng tự quản lý Data Warehouse (DuckDB/Supabase) theo nhu cầu. Thay đổi này ít tác động tới người dùng vì cách dùng này không được giới thiệu chính thức.
-   **Tự động hoá tham số `base_path`**: Không cần truyền `base_path` khi khởi tạo `Exporter` trong các pipeline tùy biến; đường dẫn sẽ tự động lấy từ cấu hình tập trung.
-   **Công cụ di chuyển dữ liệu cũ**: Bổ sung lệnh CLI `python -m vnstock_pipeline.cli storage migrate-legacy` hỗ trợ người dùng chuyển đổi kho dữ liệu cũ sang cấu trúc phân lớp tập trung mới một cách an toàn.

**✨ Tính Năng Nổi Bật**

-   **Kiến Trúc Lưu Trữ Tập Trung (`pipeline.toml`)**: Quản lý thiết lập đường dẫn (`base_path`), chế độ lưu mặc định (`parquet`/`csv`/`excel`) và cơ chế ghi đè định dạng (`format_overrides`) cho từng nhóm dữ liệu ngay tại `~/.vnstock/config/pipeline.toml`.
-   **Linh Hoạt 2 Chế Độ Phân Cấp Thư Mục**:
    -   **Flat Layout (Mặc định)**: Thân thiện cho người dùng cá nhân (ví dụ: `~/stock_db/ohlcv/ACB.parquet`).
    -   **Nested Layout**: Phân cấp chuẩn mực (`[layer]/[domain]/...`), tối ưu cho người dùng chuyên sâu và AI Agent.
-   **Bảo Vệ An Toàn Cấu Trúc Dữ Liệu**: Tự động so sánh dữ liệu mới tải với cấu trúc chuẩn (`Baseline Schema`). Cách ly an toàn các file lỗi hoặc thay đổi cấu trúc nghiêm trọng vào `.tmp/.quarantine/` nhằm bảo vệ CSDL chính.
-   **Xử Lý Lỗi & Khôi Phục Thông Minh**: Tự động sinh file `error_log.csv` ghi nhận mã lỗi do rớt mạng hoặc thiếu dữ liệu. Cung cấp cờ `--retry-errors` để tải bù nhanh những mã thất bại thay vì chạy lại từ đầu.
-   **Công Cụ Quản Trị Bằng Dòng Lệnh (CLI)**: Cung cấp hàng loạt lệnh mới tiện dụng như kiểm toán CSDL (`storage audit`), đổi định dạng (`set-format`), dọn rác định kỳ (`cleanup`), trích xuất cấu trúc nhanh (`storage preview`).
-   **Khởi Tạo Rổ Thanh Khoản (Universe)**: Lệnh `universe build-liquidity` giúp quét và xếp hạng tính thanh khoản các cổ phiếu qua đa khung thời gian để sinh ra tệp theo dõi lưu mặc định vào cấu hình `liquidity_auto`.
-   **Template Pipeline Tích Hợp Sẵn**: Tự động hoá các tác vụ phức tạp như gom 5 bảng báo cáo tài chính vào Multi-sheet Excel, thu thập tin tức chống trùng lặp qua bộ đệm Streaming, và cập nhật sự kiện doanh nghiệp liền mạch.
-   **Trích Xuất Chuẩn Amibroker**: Tích hợp module quét Local Database với DuckDB, xuất cực nhanh toàn bộ dữ liệu ra định dạng `.csv` chuẩn tương thích Amibroker bằng một dòng lệnh.

## 24-05-2026

> Phát hành vnstock\_data phiên bản 3.2.0 và cập nhật đồng loạt các thư viện trong gói sponsor với những tinh chỉnh nhỏ giúp tăng tính ổn định của hệ thống.

-   **Tích hợp Toàn diện Dữ liệu ASEAN (Unified UI)**:
    
    -   Tích hợp luồng dữ liệu từ trung tâm phân tích của Asean Securities, mở rộng mạnh mẽ năng lực phân tích và giúp người dùng tiếp cận dữ liệu với góc nhìn đa chiều:
        -   **Insights**: Cung cấp bộ công cụ chuyên sâu đo lường tâm lý thị trường (`sentiment`: breadth, heatmap, contribution), theo vết dòng tiền (`flow`: foreign, proprietary, active). Đào sâu phân tích cấp độ Ngành (`sector`) và Cổ phiếu (`equity`) thông qua biểu đồ Relative Rotation Graph (`rrg`), định giá (`valuation`), so sánh ngang hàng (`peer_compare`), và phân tích dòng lệnh (`order_flow`).
        -   **Vĩ mô & Hàng hoá (Macro)**: Thay thế lõi truy xuất dữ liệu Vĩ mô (Kinh tế, Tiền tệ) sang nguồn ASEAN với độ trễ thấp hơn. Tăng cường khả năng tiếp cận tức thời các chỉ số toàn cầu như Lợi suất trái phiếu (`bond_yield`), Lãi suất Fed (`fed_rate`), và các rổ hàng hoá phái sinh chuẩn quốc tế trực tiếp qua `Macro().global` và `Macro().commodity()`.
    -   **Tương thích & Ổn định**:
        -   Khi người dùng truy xuất các hàng hoá đặc thù của Việt Nam (VD: Vàng SJC, Thép D10, Lợn Hơi) qua tham số `market="VN"`, hệ thống tự động fallback mượt mà về nguồn SPL cũ, đảm bảo không bị gián đoạn trải nghiệm phân tích số liệu cục bộ.
    -   **Trải nghiệm Phát triển**: Toàn bộ các endpoints mới được dán nhãn `[Experimental]` khi gọi lệnh `show_api()`, giúp các nhà phân tích phân biệt và nắm bắt nhanh chóng kho công cụ mới này.
    
    **Chi tiết cấu trúc API Tree (Các hàm mới & nâng cấp):**
    

## 19-05-2026

> Cập nhật và sửa lỗi cho vnstock\_pipeline phiên bản 2.2.3

-   **Sửa `ceiling_price`**: Khắc phục lỗi cột giá trần (`ceiling_price`) bị gắn sai giá trị các cờ màu sắc (như `e`, `d`) do nhầm lẫn ánh xạ với trường `ca` (color\_average) từ WebSocket.
-   **Thêm thông tin giá**: Tách và trích xuất chính xác giá trị số cho giá trần (`ceiling_actual`), giá sàn (`floor_price`), và giá tham chiếu (`reference_price`) cho cả cổ phiếu cơ sở và phái sinh.
-   **Sửa `market_id` cho Phái sinh**: Tự động chuẩn hóa và gán cứng sàn giao dịch thành `HNX` cho tất cả dữ liệu hợp đồng tương lai phái sinh (`stockps`).

## 2026-05-18

> Phiên bản vnstock\_pipeline 2.2.2 mang đến nhiều nâng cấp quan trọng giúp bạn xây dựng hệ thống quản lý tải dữ liệu và kết nối dữ liệu thời gian thực hiệu quả và đơn giản hơn bao giờ hết. Các cập nhật mới nhất giúp cải thiện độ tương thích của các thư viện trong hệ sinh thái Vnstock với chuẩn Unified UI mới nhất.

### Cảnh báo giao dịch & Dữ liệu thời gian thực

Hệ thống luồng dữ liệu được tối ưu hoá với `redis`, cung cấp sẵn các kịch bản thường dùng trong giao dịch và theo dõi tín hiệu, giúp bạn:

-   **Nhận cảnh báo tức thì:** Tự động phát hiện các tín hiệu mua/bán (giao cắt MACD, quá mua/bán RSI, đột biến dòng tiền...) và gửi tín hiệu về kênh Discord của bạn qua Webhook.
-   **Hoạt động bền bỉ 24/7:** Thuật toán kết nối mới giúp hệ thống ổn định. Tự động phục hồi ngay lập tức nếu rớt mạng, đảm bảo bạn không bỏ lỡ bất kỳ biến động nào trong giờ giao dịch.
-   **Mở rộng không giới hạn:** Cung cấp sẵn giải pháp giúp bạn chia sẻ luồng dữ liệu real-time từ máy chủ đến nhiều ứng dụng khác (Web, phần mềm riêng) mà không lo quá tải.

### Phân tích dữ liệu siêu tốc không cần mở trình soạn thảo

Công cụ dòng lệnh tích hợp mới (`vnstock_pipeline`) giúp bạn tiết kiệm tối đa thời gian:

-   Xem nhanh tổng quan, dung lượng và cấu trúc của bất kỳ tệp dữ liệu chứng khoán nào chỉ với các lệnh CLI đơn giản mà AI Agent có thể sử dụng như một công cụ.
-   Lọc, tìm kiếm (ví dụ: lọc các mã có giá > 50) và xem thống kê dữ liệu ngay trên cửa sổ lệnh mà không cần phải khởi động các phần mềm phân tích nặng nề.

### Quản lý chất lượng & độ toàn vẹn dữ liệu

-   **Kiểm định chất lượng tự động:** Hệ thống tự động quét, phát hiện và cảnh báo mọi khoảng trống hay lỗi bất thường trước khi lưu trữ.
-   **Trực quan & Dễ tích hợp:** Toàn bộ tên mã chứng khoán và định dạng báo cáo tài chính đều được chuẩn hóa thống nhất, cực kỳ dễ đọc và dễ dàng đưa vào phần mềm riêng của bạn.

## 16-05-2026

### Cập nhật Vnstock Data 3.1.8

-   **Chuẩn hoá Báo cáo Tài chính (Unified UI)**:
    -   Đồng bộ Schema báo cáo tài chính cho các nguồn dữ liệu (MAS, VCI), xử lý triệt để lỗi lệch cột và lẫn lộn ngôn ngữ (mixed labels) bằng hệ thống Mapping chỉ số La Mã (Roman numeral).
    -   Bổ sung thông tin kỳ báo cáo (`report_period`) cho nguồn VCI, đảm bảo dữ liệu hiển thị đầy đủ và tương thích với giao diện Unified UI.
-   **Thị trường Trái phiếu (Bond Market)**:
    -   Tích hợp lớp domain `bond` vào hệ thống Unified UI, mở rộng khả năng tra cứu dữ liệu thị trường trái phiếu.

### Cập nhật Vnstock TA 1.0.3

> Phát hành bản cập nhật Vnstock TA 1.0.3 tập trung mang lại trải nghiệm phân tích mượt mà, trực quan và tối ưu nhất cho người dùng hệ sinh thái Vnstock.

**✨ Bạn có thể làm gì với bản cập nhật này?**

-   **Sử dụng kho chỉ báo đa dạng**: Bổ sung toàn diện nhóm chỉ báo Thống kê (Statistics), chỉ báo sức mạnh xu hướng (Aroon) và mở rộng đáng kể các nhóm chỉ báo Xu hướng (Trend), Biến động (Volatility).
-   **Vẽ biểu đồ chuyên nghiệp với phong cách hiện đại**: Hệ thống Theme mới giúp biểu đồ có giao diện hiện đại và nhất quán. Các chỉ báo phức tạp nhiều đường (như StochRSI, ADX, PVO...) giờ đây đã có chú thích (legend) và nhãn dữ liệu rõ ràng, dễ đọc.

**⚡ Tối ưu trải nghiệm sử dụng**

-   **Cài đặt nhanh, siêu nhẹ**: Thư viện đã được tối ưu và gỡ bỏ các gói phụ thuộc nặng như `pyecharts`, `panel` hướng tới loại bỏ tính năng vẽ đồ thị tương tác sau 31/8/2026. Giờ đây cài đặt vnstock\_ta sẽ nhanh chóng và tốn cực ít tài nguyên.
-   **Dữ liệu ổn định và nhanh chóng**: Chuyển đổi toàn bộ việc lấy dữ liệu sang giao diện Unified UI của Vnstock, giúp tốc độ tính toán nhanh và độ tin cậy cao hơn.

## 12-05-2026

> Cập nhật vnstock installer GUI v3.1.2 & CLI v3.0.2

-   **Nhận diện mẫu Venv**: Đồng bộ cơ chế nhận diện các tên thư mục môi trường ảo phổ biến (`venv`, `.venv`, `env`).
-   **Cảnh báo tương tác**: Bổ sung hộp thoại xác nhận khi người dùng cung cấp đường dẫn không theo quy chuẩn môi trường ảo.
-   **Cơ chế an toàn**: Kiểm tra sự tồn tại của tệp `pyvenv.cfg` và các mẫu định danh venv trước khi thực hiện thao tác sửa đổi thư mục môi trường ảo bị lỗi.
-   **Gợi ý đường dẫn thông minh**: Tự động gợi ý thêm hậu tố `.venv` nếu người dùng chọn thư mục dự án làm nơi cài đặt môi trường ảo.

## 05-05-2026 (v3.1.7)

-   Bổ sung khả năng truy xuất tài liệu và báo cáo tài chính cho từng mã chứng khoán. Người dùng có thể truy xuất hàng loạt liên kết đến file báo cáo tài chính định dạng PDF thông qua lập trình đơn giản.

-   Tinh chỉnh chức năng hàm tiện ích `show_api` để hiển thị thông tin cây API trọn vẹn hơn theo từng cấp.
    -   Ví dụ để xem tất cả cấu trúc bên dưới nhóm hàm `Reference` có thể gọi `show_api('Reference')`
    -   Để xem chi tiết sâu hơn 1 cấp nữa, có thể sử dụng cú pháp chaining dạng `show_api('Reference.equity')`

## 02-05-2026 (v3.1.6)

-   Sửa lỗi xảy ra với `vnstock_data/explorer/vci/listing.py", line 35, in all_symbols` xung đột thư viện sau khi code bị làm rối.

## 01-05-2026 (v3.1.5)

-   Cập nhật khả năng tuỳ chỉnh điều kiện lọc cho hàm lọc dữ liệu cổ phiếu từ VCI trong giao diện hợp nhất tại lớp `Insights`
-   Sửa lỗi `ProxyConfig.update_forward_refs()` trong `vnstock_data/core/utils/client.py` khi gọi lệnh mẫu `Company(symbol='VIC', source='KBS').overview()`

## 29-04-2026 (v3.1.4)

-   Cập nhật CLI Installer phiên bản 3.1.4
    -   Bổ sung danh sách mapping chính xác các chỉ số index từ HNX, UPCOM để truy xuất dữ liệu lịch sử ohlcv từ VCI

## 27-03-2026

-   Cập nhật CLI Installer phiên bản 3.0.2
    -   Tự động nhận diện API Key đã lưu trong môi trường thay vì yêu cầu người dùng nhập lại.
    -   Tinh chỉnh thiết lập để người dùng tiện cài đặt bộ thư viện trên Google Colab, không yêu cầu bắt buộc phải kết nối Google Drive.
    -   Nâng cấp cơ chế bỏ qua thông báo chuyển đổi câu lệnh import từ vnstock sang vnstock\_data gây phiền phức

## 23-04-2026 (v3.1.3)

-   **Chuẩn hoá & Mở rộng Báo cáo Tài chính (Fundamental & Financial Health)**:
    -   Mở rộng Schema tài chính với các trường dữ liệu chi tiết từ nguồn MAS.
    -   Định chuẩn hóa bộ tiêu chí đánh giá cho 4 nhóm ngành: Ngân hàng, Chứng khoán, Bảo hiểm và Đa ngành theo tiêu chuẩn phân tích chung tương tự giao diện tại TCBS.
-   **Hạ tầng & Tối ưu hóa (Infrastructure & Refactoring)**:
    -   Nâng cấp các module tiện ích lõi (`client.py`, `user_agent.py`) để cải thiện hiệu năng kết nối và quản lý User-Agent.
-   **Sửa lỗi & Ổn định hệ thống (Bug Fixes)**:
    -   Khắc phục triệt để lỗi sai tỷ lệ giá (price scaling) cho các tài sản Chỉ số (Index) và Phái sinh (Derivative) tại module `quote` (nguồn KBS).
    -   Sửa lỗi truy xuất dữ liệu danh sách niêm yết (listing) và báo giá (quote) cho nguồn Dukascopy.
    -   Xử lý các lỗi nhỏ trong UI Registry và logic phân loại ngành giúp hệ thống hoạt động chính xác hơn.
-   **Chuyển đổi giao thức dữ liệu VCI (API Migration)**:
    -   Chuyển đổi toàn bộ quy trình lấy danh sách (Listing) và mã ngành (ICB) từ nguồn VCI từ GraphQL sang REST API để tăng độ ổn định và tốc độ phản hồi.

## 12-04-2026

> Phần mềm `vnstock_data` cập nhật phiên bản 3.1.0: Hoàn thiện bộ dữ liệu hợp nhất (Unified UI) và bổ sung bổ sung dữ liệu thị trường Quốc tế.

-   **Thị trường Quốc tế & Crypto**:
    
    -   Tích hợp dữ liệu tiền mã hoá (Cryptocurrency) thông qua API Binance Spot (hỗ trợ dữ liệu `ohlcv`, `order_book`, `intraday`, `quote`). Khung kiến trúc được trang bị thuật toán chờ và gửi lại để duy trì kết nối khi gặp giới hạn truy vấn API.
    -   Xây dựng kiến trúc Explorer cung cấp biểu đồ đa khung thời gian cho Ngoại hối (Forex), Hàng hoá (Commodity) và các chỉ số toàn cầu thông qua Dukascopy và ForexSB. Cung cấp bộ cấu hình Múi giờ gốc sang múi giờ Hệ thống (`Asia/Ho_Chi_Minh`).
-   **Thị trường Nội địa (Unified UI)**:
    
    -   Nâng cấp API cho thị trường chỉ số (Index Market): Hệ thống hỗ trợ lấy bộ dữ liệu thống kê giao dịch lịch sử của tất cả các loại chỉ số thông qua phương thức `trade_history()`. Hỗ trợ tên chỉ số quy chuẩn để tra lệnh.
    -   Bổ sung hàm tóm tắt bức tranh tài chính tổng hợp `financial_health` (tổ hợp 3 bảng báo cáo tài chính và các chỉ số tài chính). Chuẩn hoá chuyển ngữ thẻ Scorecard chuyên ngành: Ngân hàng, Chứng khoán, Bảo hiểm, hỗ trợ trích lọc linh hoạt. Quy chuẩn này lấy cảm hứng từ cấu trúc báo cáo của nền tảng TCBS, giúp duy trì sự nhất quán trong bộ tiêu chí cố định trong phân tích cơ bản cho doanh nghiệp, tránh phải xử lý bộ tiêu chí không thống nhất trong các báo cáo tài chính vốn có nhiều khác biệt giữa các nguồn khác nhau. Sử dụng bộ tiêu chí này giúp người dùng hạn chế phải thay đổi code khi nguồn dữ liệu gặp sự cố hoặc phiên bản phần mềm thay đổi ảnh hưởng tới bộ tiêu chí này.
    
    \-Nguồn dữ liệu cung cấp dữ liệu tài chính cho các hàm tại Unified UI được chuyển đổi từ KBS sang MAS để tăng số kỳ báo cáo tài chính lên trên 10 năm, thay vì bị giới hạn 4 kỳ mặc định của API từ KBS.
    
-   Tối ưu tra cứu dữ liệu Vĩ mô (Macro) và Hàng hoá: Áp dụng kỹ thuật quét lùi tự động và đắp điền dữ liệu khuyết rỗng (Forward-fill) để xử lý hoàn thiện độ trễ công bố thông tin, giảm thiểu phát sinh lỗi.
    
-   Cải thiện khả năng chuẩn hoá symbol nhập nhập vào hàm của CafeF để nhận diện các chỉ số chính xác VNINDEX/HOSE, HNXINDEX/HNX, UPCOMINDEX/UPCOM và VN30.
    
-   Tái cấu trúc chuẩn thư viện: Áp dụng chuẩn hoá, bổ sung tham số định danh nhà cung cấp `source` theo yêu cầu từ phiên bản.
    
-   **Tài liệu Agent Guide**:
    
    -   Cập nhật mô tả các hàm và nguồn dữ liệu bổ sung
    -   Cung cấp schema dữ liệu chuẩn hoá giúp xác định mô hình dữ liệu và xây dựng sản phẩm tin cậy hơn, giảm thiểu việc phải chạy từng đoạn code để kiểm tra cấu trúc dữ liệu.
-   **Bổ sung bộ Notebook hoàn chỉnh**:
    
    -   Bổ sung bộ Notebook hoàn chỉnh về các hàm tại Unified UI và theo kiểu gọi Adapter Pattern (thay đổi tham số source kiểu cũ) phản ánh đầy đủ trạng thái mới nhất của thư viện.

## 07-04-2026

> Phát hành `vnstock_data` phiên bản 3.0.1 sửa các lỗi quan trọng và tinh chỉnh trải nghiệm người dùng.

-   **Unified UI**: Bổ sung hàm `cash_flow` vào giao diện hợp nhất; cập nhật mô tả cho hàm `trade_history` (thống kê giao dịch, giá chứng khoán trước khi pha loãng).
-   **Nguồn KBS**: Sửa lỗi chia điểm index cho 1000 và lỗi 502 Bad Gateway do web phân định lại cấu trúc URL; tinh chỉnh chuẩn hoá tên chỉ tiêu tài chính và thông tin định danh User Agent.
-   **Nguồn MBK (Vĩ mô)**: Cải thiện thuật toán truy xuất dữ liệu theo tham số `length` và tự động _forward fill_ để khắc phục lỗi trả về dữ liệu rỗng.
-   **Nguồn SPL (Hàng hoá)**: Sửa lỗi truy xuất dữ liệu null sinh ra do không khớp cấu hình múi giờ.
-   **Nguồn VCI**: Bổ sung cơ chế tương thích pandas cho hàm map và applymap để hoạt động tốt cho tất cả phiên bản từ 2.1.0 và trước đó.

## 03-04-2026

> **Phát hành vnstock\_news 2.2.0: Công cụ truy xuất dữ liệu tin tức hiệu suất cao**
> 
> Bản phát hành mới giải phóng bạn khỏi những lỗi xảy ra trong quá trình xử lý dữ liệu, mang tới sự ổn định khi trích xuất dữ liệu tin tức từ 21 trang tin nổi bật tại Việt Nam.

### ✨ Nâng cấp nổi bật

-   **Kiến trúc Crawler Hợp Nhất (Unified Crawler):** Khai thác song song và tự động dự phòng chéo (fallback) giữa luồng RSS và Sitemap, đảm bảo hệ thống bạn luôn có tin mới khi một trong hai luồng gặp sự cố.
-   **Trích xuất metadata linh hoạt:** Tăng cường khả năng bắt chính xác Selector qua các thuộc tính linh hoạt (`id`, `data-slot`, `rel`) thay vì phụ thuộc mỗi thẻ `class` theo CSS Selector truyền thống. Chủ động trích xuất thêm thẻ Tags, Lượt xem và Chuyên mục của bài.
-   **Làm sạch tự động & Xử lý thời gian:**
    -   **Date Parser:** Tự động "thấu hiểu" và ép kiểu mọi định dạng thời gian lạ lẻ (như _15 phút trước_, _Thứ năm..._) về chuẩn ISO thống nhất cho Database.
    -   **Spam/Media Link Filter:** Rà soát và loại bỏ link nhiễu phân trang, hình ảnh, URL rác đính kèm trong RSS.
    -   Tự động bỏ qua lỗi chứng chỉ SSL để duy trì kết nối cho những tòa soạn chưa nâng cấp máy chủ hiện đại.

### 🐛 Vận hành trơn tru hơn

-   Sửa dứt điểm tình trạng trả về Data nhưng cột Nội dung trống rỗng (Missing Content 100%) gây ra bởi lỗi đọc JSON.
-   **Bổ sung đầu báo mới được hỗ trợ:** Bổ sung và tinh chỉnh cấu trúc CSS cho hàng loạt trang báo mới (Tiền Phong, Người Lao Động, Thanh Niên, Znews, Dân Trí, Đầu Tư, VnEconomy).
-   Bổ sung bộ kịch bản dùng thử "All-in-one" và tái cấu trúc tài liệu ví dụ, tự động dọn dẹp kết quả xuất file vào phân vùng tĩnh `/output/`.

**Nhấp để xem danh sách 21 trang báo được hỗ trợ sẵn**

| STT | Tên Báo | Tên Config | Loại Hình | RSS | Sitemap |
| --- | --- | --- | --- | --- | --- |
| 1 | **Nhân Dân** | nhandan | Cơ quan TW | ✅ | ✅ |
| 2 | **Tiền Phong** | tienphong | Cơ quan TW | ✅ | ✅ |
| 3 | **VietNamNet** | vietnamnet | Bộ Ngành | ✅ | ✅ |
| 4 | **Dân Trí** | dantri | Bộ Ngành | ✅ | ✅ |
| 5 | **VnExpress** | vnexpress | Bộ Ngành | ✅ | ✅ |
| 6 | **Báo Đầu Tư** | baodautu | Bộ Ngành | ✅ | ✅ |
| 7 | **Thời Báo Tài Chính** | thoibaotaichinhvietnam | Bộ Ngành | ✅ | ✅ |
| 8 | **Thanh Niên** | thanhnien | Tổ chức TW | ✅ | ✅ |
| 9 | **Tuổi Trẻ** | tuoitre | Địa phương | ✅ | ✅ |
| 10 | **Người Lao Động** | nld | Địa phương | ✅ | ✅ |
| 11 | **Pháp Luật TP.HCM** | plo | Địa phương | ✅ | ✅ |
| 12 | **Kinh Tế Sài Gòn** | ktsg | Địa phương | ✅ | ✅ |
| 13 | **VnEconomy** | vneconomy | Chuyên ngành | ✅ | ✅ |
| 14 | **Diễn Đàn Doanh Nghiệp** | dddn | Chuyên ngành | ✅ | ✅ |
| 15 | **PetroTimes** | petrotimes | Chuyên ngành | ✅ | ✅ |
| 16 | **Znews (Tri thức)** | znews | Chuyên ngành | ✅ | ✅ |
| 17 | **CafeF** | cafef | Trang tin | ✅ | ✅ |
| 18 | **CafeBiz** | cafebiz | Trang tin | ✅ | ✅ |
| 19 | **VietStock** | vietstock | Trang tin | ✅ | ✅ |
| 20 | **24h** | 24h | Tổng hợp | ✅ | ✅ |
| 21 | **Người Quan Sát** | nguoiquansat | Tổng hợp | ✅ | ✅ |

## 11-03-2026

> **Phát hành vnstock\_data 3.0.0: Thế hệ mới với Unified UI và Thị trường Quốc tế.**
> 
> Phiên bản 3.0.0 không chỉ là một bản cập nhật thông thường, mà là bước chuyển mình quan trọng của hệ sinh thái Vnstock. Chúng tôi mang đến kiến trúc 7 lớp tiêu chuẩn nghiệp vụvà trải nghiệm lập trình (DX) được nâng cấp vượt trội.

-   **Kiến trúc 7 Lớp & Unified UI (U2)**:
    -   Hoàn thiện mô hình **Unified UI** với 7 phân vùng chức năng rõ rệt: `Reference`, `Market`, `Fundamental`, `Analytics`, `Alternative`, `Macro`, và `Insights`.
    -   Cách tiếp cận "Vấn đề là trên hết": Bạn không còn phải lo lắng về việc dữ liệu đến từ đâu, chỉ cần tập trung vào việc bạn muốn làm gì (định giá, xem bảng giá hay tra cứu thông tin cơ bản). Chất lượng và nguồn dữ liệu tốt nhất sẽ được Vnstock khuyến nghị. Bạn có thể cá nhân hoá nguồn dữ liệu như cách lập trình cũ nếu muốn để khai thác các chức năng có sẵn nhưng ẩn sâu trong mã nguồn.
    -   Bổ sung thông tin hồ sơ (profile) chi tiết cho **Chứng quyền** và **Hợp đồng tương lai**, giúp bạn nắm bắt đầy đủ thông tin sản phẩm trước khi giao dịch.
    -   Tích hợp **Lịch sự kiện thị trường** toàn diện: từ dữ liệu lịch sử (nghỉ lễ, sự cố thị trường... từ năm 2000) đến các sự kiện hiện tại và tương lai giúp bạn bao quát toàn cảnh thị trường một cách chuyên sâu.
-   **Trợ lý lập trình thông minh (Next-Gen DX)**:
    -   Tái kích hoạt tính năng **Autocomplete** và **Docstring** vượt trội trên các IDE (VSCode, PyCharm), giúp việc viết code nhanh và ít lỗi hơn.
    -   Bổ sung bộ công cụ khám phá API: `show_api()` để vẽ sơ đồ thư viện ngay trong terminal và `show_doc()` để đọc nhanh hướng dẫn sử dụng cho từng hàm.
    -   Tài liệu (Docstrings) đã được chuyển đổi sang tiếng Anh chuẩn để dễ dàng tiếp cận và phù hợp với tiêu chuẩn lập trình hiện đại và tương tác với AI Agent.
-   **Chuẩn hóa & Tối ưu hóa hệ thống**:
    -   **Chuẩn hoá dữ liệu bảng giá từ nguồn KBS**: Giải quyết triệt để các vấn đề về hiển thị lô chẵn, lô lẻ; đồng bộ hóa dữ liệu cho đa dạng loại tài sản từ cổ phiếu, phái sinh, chứng quyền đến trái phiếu.
    -   Dữ liệu được **tự động chuẩn hóa (Normalization)** từ nhiều nguồn khác nhau về một định dạng duy nhất, giúp việc tính toán và phân tích nhất quán hơn.
    -   Cơ chế **Lọc tham số (Kwargs Filtering)**: Giúp giảm thiểu lỗi runtime khi bạn vô tình truyền thừa tham số, tăng tính ổn định cho chương trình.
    -   Tối ưu hóa tốc độ tải dữ liệu và cấu trúc nội bộ để sẵn sàng cho các bài toán phân tích dữ liệu lớn.
-   **Cập nhật Vnstock Agent Guide**: Tài liệu hướng dẫn chi tiết và các quy tắc cho AI Agent trong lập trình tự động được cập nhật qua Agent Guide [tại đây](https://github.com/vnstock-hq/vnstock-agent-guide/blob/main/docs/vnstock-data/14-unified-ui.md)

---

## 05-03-2026

-   **Cập nhật module Unified UI (U2)**: Cập nhật các lớp UI cung cấp cấu trúc lệnh hợp nhất với phân nhóm chặt chẽ lấy cảm hứng từ chuẩn FIX và Bloomberg Terminal giúp điều hướng dễ dàng theo mặc định do Vnstock thiết kế và người dùng không cần cài đặt nguồn dữ liệu. Tài liệu hướng dẫn chi tiết được cập nhật qua Agent Guide [tại đây](https://github.com/vnstock-hq/vnstock-agent-guide/blob/main/docs/vnstock-data/14-unified-ui.md)
-   **Bổ sung hàm lấy thông tin Chứng quyền và hợp đồng tương lai**:
    -   Cung cấp hàm trong giao diện U2 để lấy thông tin chứng quyền và hợp đồng tương lai thông qua Reference().derivatives().warrant() và Reference().derivatives().futures()
-   **Bổ sung hàm lấy thông tin bộ lọc cổ phiếu từ VCI** thông qua U2 tại `Insights().screener()`
-   **Cải thiện & bổ sung API nguồn Vĩ mô**:
    -   Bổ sung method `interest_rate` để lấy dữ liệu Lãi suất bình quân & Doanh số trên thị trường liên ngân hàng. Hỗ trợ tham số `format='pivot'` (mặc định) để trả về bảng dạng nhóm cột (MultiIndex giống biểu diễn trên website) hoặc `format='long'` để trả về định dạng phẳng (raw format).
    -   Tích hợp thêm tham số khoảng thời gian tương đối `length` (ví dụ: `90`, `1Y`, `30D`, `100b`) tương tự như cách sử dụng trong `quote.history`. Tính năng này áp dụng đồng bộ cho tất cả các hàm vĩ mô (`gdp`, `cpi`, `interest_rate`, `exchange_rate` v.v...) để bỏ qua việc nhập ngày bắt đầu `start` và kết thúc `end`.
    -   Thay đổi thời gian lấy dữ liệu mặc định (_khi không cung cấp `start`, `end`, hoặc `length`_) là 1 năm (`1Y`) để trả về thông tin ở khoảng thời gian phù hợp và nhẹ.
    -   Tài liệu hướng dẫn chi tiết được cập nhật qua Agent Guide [tại đây](https://github.com/vnstock-hq/vnstock-agent-guide/blob/main/docs/vnstock-data/09-macro.md)
-   **Cải thiện trải nghiệm sử dụng module lấy dữ liệu hàng hoá**:
    -   Tích hợp khả năng lấy thời gian tương đối thông qua tham số `length` tương tự như module `macro` và `quote.history`.
    -   Thay đổi thời gian lấy dữ liệu mặc định (_khi không cung cấp `start`, `end`, hoặc `length`_) về 1 năm (`1Y`) thay vì lấy toàn bộ lịch sử như trước đây.
    -   Tài liệu hướng dẫn chi tiết được cập nhật qua Agent Guide [tại đây](https://github.com/vnstock-hq/vnstock-agent-guide/blob/main/docs/vnstock-data/10-commodity.md)

## 31-01-2026

> Phát hành phiên bản 2.3.4, sửa lỗi và cải thiện trải nghiệm người dùng

-   Chuẩn hoá định dạng dữ liệu giá thành dạng thập phân xx.xx (ngàn) thay vì xxxx (đồng) cho các hàm `history` và `intraday` trong lớp Quote của nguồn dữ liệu KBS.
-   Sửa lỗi không cho phép gọi tham số length trong hàm `history` của lớp Quote của nguồn dữ liệu VCI, VND, MAS khi không truyền tham số `start` và `end`.
-   Sửa lỗi không nhận diện nguồn VND cho lớp hàm Market
-   Cập nhật chương trình cài đặt vnstock installer chế độ GUI và CLI sử dụng `uv` là công cụ quản lý gói thư viện thay cho `pip`, tăng tốc độ cài đặt và giảm 30% thời gian hoàn thành.

## 28-01-2026

> Phát hành phiên bản 2.3.2, sửa lỗi và cải thiện trải nghiệm người dùng

-   Chuẩn hoá tham số `period` để lấy dữ liệu báo cáo tài chính cho các phương thức trong lớp Finance của nguồn dữ liệu KBS - cho phép gọi tham số này khi khởi tạo lớp Finance thay vì gọi ở mỗi phương thức.
-   Bổ sung tham số `length` cho phép lấy dữ liệu hàng hoá theo cách tính thời gian tương đối so với hiện tại thay vì bắt buộc nhập ngày bắt đầu và kết thúc.
-   Tinh chỉnh nhỏ cho lớp Commodity giúp nạp thư viện chính xác, loại bỏ lỗi liên quan nested f-string sinh ra trong quá trình bảo mật mã nguồn.

## 27-01-2026

> Phát hành phiên bản 2.3.1, bổ sung tài liệu hướng dẫn chi tiết Vnstock Agent Guide.

-   Bổ sung hàm tiện ích `convert_derivative_symbol` giúp chuyển đổi mã hợp đồng tương lai kiểu cũ (VN30F1M) sang kiểu mới sau áp dụng KRX (tương đương 41I1G2000 tại thời điểm tháng 1/2026)
-   Cải thiện nguồn KBS
    -   Sửa lỗi không nhận diện nguồn dữ liệu KBS từ Finance wrapper
    -   Bổ sung khả năng lấy dữ liệu báo cáo tài chính nhiều năm thay vì cố định 4 năm như phiên bản trước
    -   Tự động nhận diện và chuyển đổi mã hợp đồng tương lai sang kiểu mới để gọi các hàm `history` và `intraday` trong lớp hàm Quote.
    -   Bổ sung khả năng lấy dữ liệu các mã index phổ biến HNXINDEX, HNXINDEX, UPCOMINDEX, VN30, VN100, HNX30 trong hàm `history` của lớp Quote.
-   Cải thiện chung
    -   Hiện cảnh báo mã index không có dữ liệu `intraday`.

## 23-01-2026

-   Phát hành phiên bản 2.2.0, bổ sung nguồn dữ liệu KBS cho phép truy cập từ các dịch vụ cloud của Google như Google Colab, Kaggle thay vì nguồn VCI bị chặn IP.
-   Bổ sung khả năng truy xuất thông tin các bộ chỉ số đầu tư và chỉ số ngành từ HOSE vào Listing class, truy cập được từ mọi giá trị source.
-   Cập nhật yêu cầu phiên bản gói phụ thuộc tương thích.

## 31-08-2025

> Phát hành phiên bản Vnstock News 2.1.0 nâng cấp toàn diện cơ chế tải dữ liệu và cung cấp khả năng tuỳ biến linh hoạt, bổ sung tài liệu hướng dẫn chi tiết.

Để cài đặt bản cập nhật, vui lòng chạy lại chương trình cài đặt của Vnstock [tại đây](https://vnstocks.com/onboard-member/cai-dat-go-loi/cai-dat-phan-mem).

-   Thay đổi hoàn toàn cấu trúc chương trình theo hướng chặt chẽ và module hoá
-   Cung cấp cơ chế tự xử lý link sitemap và rss linh hoạt đối với các website sử dụng cơ chế động ví dụ sitemap theo năm-tháng, sitemap với số đếm tăng dần.
-   Hỗ trợ đầy đủ 10 trang web có sẵn trong danh sách định nghĩa sẵn, người dùng có thể tự bổ sung thêm cấu hình để dùng vnstock\_news như một chương trình crawler đọc tin tức hàng loạt.

## 29-08-2025

> Phát hành phiên bản Vnstock Pipeline 2.0.1 nâng cấp cơ chế tải dữ liệu Intraday và Streaming dữ liệu thời gian thực.

Để cài đặt bản cập nhật, vui lòng chạy lại chương trình cài đặt của Vnstock [tại đây](https://vnstocks.com/onboard-member/cai-dat-go-loi/cai-dat-phan-mem).

-   Bổ sung tài liệu hướng dẫn tuỳ biến chương trình
-   Cải thiện trải nghiệm sử dụng: tuỳ chọn địa điểm lưu file khi streaming, lọc dữ liệu mong muốn thay vì tự lưu toàn bộ.
-   Cải thiện khả năng truy cập dữ liệu intraday liên tục trong phiên giao dịch và ghép nối thông minh hơn.
-   Bổ sung tính năng Data Manager cho phép quản lý cấu trúc dữ liệu lưu trữ khoa học và chặt chẽ
-   Bổ sung khả năng lưu trữ dữ liệu định dạng parquet, nén dữ liệu ~75% so với CSV và tăng hiệu năng xử lý.

## 21-07-2025

> Phát hành phiên bản Vnstock Data 2.1.3 và nâng cấp cơ chế quản lý license chính xác hơn.

Để thực hiện nâng cấp phiên bản, các bạn vui lòng chạy lại chương trình cài đặt, lưu ý nên chạy thử và trải nghiệm qua môi trường như Github Codespace để hình dung các thay đổi để không làm ảnh hưởng đến chương trình hiện có. Hệ thống **không thể quay lại phiên bản cú sau nâng cấp**.

### Ads Free

Ẩn banner quảng cáo đối với người dùng đang duy trì gói sponsor trừ những thông báo đặc biệt liên quan đến trải nghiệm người dùng hoặc yêu cầu nâng cấp bắt buộc.

### Vnstock Data Explorer

-   Bổ sung nguồn Fmarket vào mã nguồn
-   Bổ sung và nâng cấp các API của nguồn VCI
    -   Thay thế API các nhóm hàm Quote, Listing class gặp lỗi từ chối truy cập và đổi url
    -   Bổ sung bộ API mới cho nhóm hàm thuộc Financial class
        -   Cập nhật API mới
        -   Cho phép sử dụng tiếp API cũ từ máy tính local nếu muốn.
    -   Sửa đổi nhóm hàm Trading cho phép lấy dữ liệu phân tích lịch sử giao dịch & bảng giá
        -   Thêm các hàm `foreign_trade` để lấy riêng thông tin giao dịch nước ngoài
        -   Loại bỏ các hàm `trading_stats` và `side_stats` trong nhóm hàm thuộc Trading class để không trùng thông tin với hàm `price_board`

## 02-06-2025

### Vnstock Data Explorer

Chi tiết hàm bổ sung tại [Nguồn VCI - Thống kê giao dịch](https://vnstocks.com/vnstock-insider-api/vnstock-data/du-lieu-giao-dich#ngu%E1%BB%93n-vci)

## 06-05-2024

### Vnstock Data Explorer

-   [Issue 164](https://github.com/thinh-vu/vnstock/issues/164): Cập nhật tính năng thay đổi user\_agent ngẫu nhiên không sử dụng gói fake\_user\_agent
-   [Issue 172](https://github.com/thinh-vu/vnstock/issues/172): Bổ sung hàm `price_board` cho Trading class thuộc nguồn dữ liệu VCI
-   [Issue 178](https://github.com/thinh-vu/vnstock/issues/178) và sửa lỗi dữ liệu Intraday sau cập nhật hệ thống KRX cho nguồn VCI và MAS.
-   Đóng [Issue 169](https://github.com/thinh-vu/vnstock/issues/169) vì dữ liệu khung thời gian `1W` đã được hỗ trợ sẵn trong thư viện.
-   [Issue 166](https://github.com/thinh-vu/vnstock/issues/166) Cập nhật thiết lập rate limit cho các nguồn dữ liệu trong gói tài trợ, tránh hiển thị nhầm thông báo nâng cấp.

## 22-04-2025

### Vnstock Data Explorer

> Phiên bản `vnstock_data` **2.1.0** đánh dấu bước tiến lớn trong khả năng quản lý và mở rộng dữ liệu, với việc áp dụng **cấu trúc Adapter** chuẩn hóa toàn bộ giao tiếp với nguồn cấp dữ liệu.

#### ✨ Những Thay Đổi Quan Trọng

| Hạng mục | Thay đổi |
| --- | --- |
| **Cấu trúc thư viện** | Triển khai mô hình **Adapter Pattern** cho tất cả các lớp dữ liệu (Quote, Trading, Finance, Listing, Company, Macro, Commodity, v.v.). |
| **Cách gọi hàm** | Các hàm khi sử dụng Adapter cần truyền **tham số `source`** để xác định rõ nhà cung cấp dữ liệu mong muốn. |
| **Mặc định `source`** | Tham số `source` **không còn mặc định ngầm định** như phiên bản trước. Nếu không truyền `source` đúng, hàm có thể gây lỗi `NotSupportedError`. |
| **Hướng dẫn chi tiết hơn** | Bổ sung [bảng tra cứu](https://vnstocks.com/vnstock-insider-api/vnstock-data/kien-truc-thu-vien) phương thức hỗ trợ theo nguồn cấp dữ liệu, và sơ đồ hệ thống trực quan. |

#### 🚨 Lưu Ý Ảnh Hưởng Đến Đoạn Mã Cũ

Nếu bạn đang sử dụng `vnstock_data` theo cách cũ

➡️ Từ phiên bản 2.1.0, đoạn code trên **sẽ lỗi** nếu thông tin `source` không trùng khớp với nguồn cấp dữ liệu hỗ trợ. Cụ thể, bạn cần sửa lại thành:
