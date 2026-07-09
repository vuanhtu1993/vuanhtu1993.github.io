---
title: "Thống kê giá lịch sử"
source_url: "https://vnstocks.com/docs/vnstock/thong-ke-gia-lich-su"
crawled_at: "2026-07-09T08:01:44.407Z"
---

> \[!WARNING\] **Lưu ý:** Tài liệu này hướng dẫn sử dụng các hàm API cũ (trước vnstock 4.0) và không còn được duy trì cập nhật thường xuyên. Tuy nhiên, các hàm này vẫn hoạt động bình thường nếu bạn cần tuỳ chỉnh sâu về nguồn dữ liệu. Xem thêm chi tiết tại [Vnstock Agent Guide](https://github.com/vnstock-hq/vnstock-agent-guide/blob/main/docs/vnstock/01-overview.md).
> 
> Vnstock hiện tại sử dụng Giao diện Hợp nhất (Unified UI) làm chuẩn chung, vui lòng chuyển sang xem [Tài liệu chính thức](https://vnstocks.com/docs/vnstock) để cập nhật tính năng mới nhất.

[Agent Guide](https://github.com/vnstock-hq/vnstock-agent-guide/) [Notebook minh hoạ](https://colab.research.google.com/github/thinh-vu/vnstock/blob/main/docs/1_quickstart_stock_vietnam.ipynb)

Khuyên dùng: Nên ưu tiên sử dụng [Agent Guide](https://vnstocks.com/onboard/agent-guide) để nạp môi trường cho AI Agent trên máy tính cục bộ. Tránh viết code thủ công hoặc dùng AI phiên bản web/Google Colab vì AI không có thông tin mới nhất về thư viện nên dễ viết sai cú pháp.

## So sánh nguồn dữ liệu

| Phương thức | KBS | VCI | Ghi chú |
| --- | --- | --- | --- |
| **history()** | ✅ | ✅ | Cả hai đều hỗ trợ OHLCV |
| **intraday()** | ✅ | ✅ | Cả hai đều hoạt động (5 cột) |
| **price\_depth()** | ❌ | ❌ | Đã bị loại bỏ trong v3.4.2 |

**Khuyến nghị:**

-   **KBS**: Thích hợp cho Google Colab/Kaggle.
-   **VCI**: Dữ liệu đầy đủ hơn, linh hoạt hơn. Thích hợp cài cục bộ trên máy hoặc dùng dịch vụ Cloud không thuộc Google.

## Chứng khoán Việt Nam

Hiện tại bạn có thể lựa chọn nguồn dữ liệu `VCI` hoặc `KBS` để truy xuất thông tin giá lịch sử và dữ liệu khớp lệnh mã chứng khoán (cổ phiếu, hợp đồng tương lai, chứng quyền, trái phiếu) bất kỳ.

### Giá lịch sử (OHLCV)

**Gọi hàm**

**Tham số**

**Cả KBS và VCI:**

-   `start` (str): Ngày bắt đầu (YYYY-MM-DD). Bắt buộc nếu không có length
-   `end` (str): Ngày kết thúc (YYYY-MM-DD). Mặc định None (hiện tại)
-   `interval` (str): Khung thời gian. Mặc định "1D"
-   `length` (str/int): Khoảng thời gian lùi lại từ hiện tại hoặc số nến

**KBS thêm:**

-   `get_all` (bool): Lấy tất cả các cột. Mặc định False

**Khung thời gian hỗ trợ:**

-   `"1m"`: 1 phút
-   `"5m"`: 5 phút
-   `"15m"`: 15 phút
-   `"30m"`: 30 phút
-   `"1H"`: 1 giờ
-   `"1D"`: 1 ngày
-   `"1W"`: 1 tuần
-   `"1M"`: 1 tháng

**Định dạng length linh hoạt:**

-   Chu kỳ: `"1M"`, `"3M"`, `"1Y"` (tháng, quý, năm)
-   Số ngày: `150`, `"150"`
-   Số nến: `"100b"`, `"50b"`

**Dữ liệu mẫu**

**KBS Source:**

**VCI Source:**

**Thuộc tính dữ liệu** Bạn có thể truy xuất thông tin thuộc tính của dữ liệu trả về với 2 thông tin sau:

-   `name`: Tên mã chứng khoán
-   `category`: Tên loại tài sản mã chứng khoán đó thuộc về.

**Kiểu dữ liệu**

**KBS Source:**

**VCI Source:**

### Dữ liệu khớp lệnh (Intraday)

**Gọi hàm**

**Tham số**

**KBS:**

-   `page_size` (int): Số bản ghi muốn lấy về. Mặc định 100, có thể tăng lên 150\_000 nếu mã có thanh khoản lớn hoặc hợp đồng tương lai VN30.
-   `get_all` (bool): Lấy tất cả các cột. Mặc định False

**VCI:**

-   `page_size` (int): Số bản ghi muốn lấy về. Mặc định 100. có thể tăng lên 150\_000 nếu mã có thanh khoản lớn hoặc hợp đồng tương lai VN30.
-   `last_time` (str/int/float): Thời gian cắt dữ liệu
-   `last_time_format` (str): Định dạng của last\_time

**Dữ liệu mẫu**

**KBS Source:**

**VCI Source:**

**Ý nghĩa các cột dữ liệu**

-   `time` (datetime64\[ns\]): Thời gian diễn ra giao dịch khớp lệnh
-   `price` (float64): Giá thực hiện của giao dịch khớp lệnh
-   `volume` (int64): Khối lượng của giao dịch khớp lệnh
-   `match_type` (object): Loại giao dịch khớp lệnh (Buy/Sell)
-   `id` (object): Mã định danh duy nhất của giao dịch khớp lệnh

**Kiểu dữ liệu**

## Chứng khoán quốc tế

Trước khi gọi hàm và truy xuất dữ liệu theo các cú pháp thuộc từng mục bên dưới, bạn chắc chắn rằng đã gọi Vnstock class từ thư viện vnstock. Dữ liệu chỉ có khung thời gian cuối ngày, tức mặc định là `interval='1D'`.

### Forex (FX)

**Gọi hàm**

**Tham số**

-   `symbol`: Mã cặp tiền tệ cần tra cứu. Hiện tại hàm hỗ trợ truy xuất dữ liệu trực tiếp cho các cặp tiền tệ sau:`USDVND`, `JPYVND`, `AUDVND`, `CNYVND`, `KRWVND`, `USDJPY`, `USDEUR`, `USDCAD`, `USDCHF`, `USDCNY`, `USDKRW`, `USDSGD`, `USDHKD`, `USDTRY`, `USDINR`, `USDDKK`, `USDSEK`, `USDILS`, `USDRUB`, `USDMXN`, `USDZAR`, `EURUSD`, `EURVND`, `EURJPY`, `EURGBP`, `EURCHF`, `EURCAD`, `EURAUD`, `EURNZD`, `GBPJPY`, `GBPVND`, `GBPUSD`, `GBPAUD`, `GBPCHF`, `GBPNZD`, `GBPCAD`, `AUDUSD`, `NZDUSD`.
-   `start`: Ngày kết thúc của truy vấn dữ liệu lịch sử. Định dạng `YYYY-mm-dd`
-   `end`: Ngày kết thúc của truy vấn dữ liệu lịch sử. Định dạng `YYYY-mm-dd`
-   `interval` (tuỳ chọn): Khung thời gian lấy mẫu dữ liệu. Chỉ hỗ trợ giá trị "1D" để lấy dữ liệu cuối ngày.

**Dữ liệu mẫu:**

**Kiểu dữ liệu**

### Crypto

**Gọi hàm**

**Tham số**

-   `symbol`: Mã crypto bạn cần tra cứu. Hiện tại hỗ trợ các mã sau: `BTC`, `ETH`, `USDT`, `USDC`, `BNB`, `BUSD`, `XRP`, `ADA`, `SOL`, `DOGE`
-   `start`: Ngày kết thúc của truy vấn dữ liệu lịch sử. Định dạng `YYYY-mm-dd`
-   `end`: Ngày kết thúc của truy vấn dữ liệu lịch sử. Định dạng `YYYY-mm-dd`
-   `interval` (tuỳ chọn): Khung thời gian lấy mẫu dữ liệu. Chỉ hỗ trợ giá trị "1D" để lấy dữ liệu cuối ngày.

**Dữ liệu mẫu:**

**Kiểu dữ liệu**

### Chỉ số quốc tế

**Gọi hàm**

-   `symbol`: mã chỉ số bạn cần tra cứu. Sử dụng một trong các mã sau:
    
    -   `INX`: S&P 500 Index
    -   `DJI`: Dow Jones Industrial Average
    -   `COMP`: Nasdaq Composite Index
    -   `RUT`: Russell 2000 Index
    -   `NYA`: NYSE Composite Index
    -   `RUI`: Russell 1000 Index
    -   `RUA`: Russell 3000 Index
    -   `UKX`: FTSE 100 Index
    -   `DAX`: DAX Index
    -   `PX1`: CAC 40 Index
    -   `N225`: Nikkei 225 Index
    -   `000001`: Shanghai SE Composite Index
    -   `HSI`: Hang Seng Index
    -   `SENSEX`: S&P BSE Sensex Index
    -   `ME00000000`: S&P/BMV IPC
-   `start`: Ngày kết thúc của truy vấn dữ liệu lịch sử. Định dạng `YYYY-mm-dd`
    
-   `end`: Ngày kết thúc của truy vấn dữ liệu lịch sử. Định dạng `YYYY-mm-dd`
    
-   `interval` (tuỳ chọn): Khung thời gian lấy mẫu dữ liệu. Chỉ hỗ trợ giá trị "1D" để lấy dữ liệu cuối ngày.
    

**Dữ liệu mẫu:**

**Kiểu dữ liệu**
