---
title: "Báo cáo tài chính"
source_url: "https://vnstocks.com/docs/vnstock/bao-cao-tai-chinh"
crawled_at: "2026-07-09T08:07:03.416Z"
---

> \[!WARNING\] **Lưu ý:** Tài liệu này hướng dẫn sử dụng các hàm API cũ (trước vnstock 4.0) và không còn được duy trì cập nhật thường xuyên. Tuy nhiên, các hàm này vẫn hoạt động bình thường nếu bạn cần tuỳ chỉnh sâu về nguồn dữ liệu. Xem thêm chi tiết tại [Vnstock Agent Guide](https://github.com/vnstock-hq/vnstock-agent-guide/blob/main/docs/vnstock/01-overview.md).
> 
> Vnstock hiện tại sử dụng Giao diện Hợp nhất (Unified UI) làm chuẩn chung, vui lòng chuyển sang xem [Tài liệu chính thức](https://vnstocks.com/docs/vnstock) để cập nhật tính năng mới nhất.

[Agent Guide](https://github.com/vnstock-hq/vnstock-agent-guide/) [Notebook minh hoạ](https://colab.research.google.com/github/thinh-vu/vnstock/blob/main/docs/1_quickstart_stock_vietnam.ipynb)

Khuyên dùng: Nên ưu tiên sử dụng [Agent Guide](https://vnstocks.com/onboard/agent-guide) để nạp môi trường cho AI Agent trên máy tính cục bộ. Tránh viết code thủ công hoặc dùng AI phiên bản web/Google Colab vì AI không có thông tin mới nhất về thư viện nên dễ viết sai cú pháp.

## So sánh nguồn dữ liệu

| Phương thức | KBS | VCI | Ghi chú |
| --- | --- | --- | --- |
| **income\_statement()** | ✅ | ✅ | KBS: 90 dòng, VCI: 25+ cột |
| **balance\_sheet()** | ✅ | ✅ | KBS: 162 dòng, VCI: 36 cột |
| **cash\_flow()** | ✅ | ✅ | KBS: 159 dòng, VCI: 39 cột |
| **ratio()** | ✅ | ✅ | KBS: 27 chỉ số, VCI: 37+ chỉ số |

**Khuyến nghị:**

-   **KBS**: Dữ liệu chi tiết theo dòng, phù hợp phân tích chuyên sâu, có cấu trúc phân cấp
-   **VCI**: Dữ liệu theo cột, dễ sử dụng và tích hợp, định dạng đơn giản

## Khởi tạo Finance

### KBS Finance (Khuyến nghị)

### VCI Finance

**Các tham số chung:**

-   `symbol` (str): Mã chứng khoán (VD: 'VCI', 'ACB')
-   `standardize_columns` (bool): Chuẩn hóa tên cột theo schema. Mặc định: True
-   `proxy_mode` (str): Chế độ proxy. Mặc định: None
-   `proxy_list` (list): Danh sách URL proxy. Mặc định: None

## Field Display Mode

Từ phiên bản v3.4.0+, tất cả các phương thức báo cáo tài chính hỗ trợ `display_mode` parameter để kiểm soát cách hiển thị các trường dữ liệu:

### Cách sử dụng

### Bảng so sánh các mode

| Mode | Tên | Mô tả | Cột |
| --- | --- | --- | --- |
| `FieldDisplayMode.STD` | Standardized | Chỉ hiển thị 'item' và 'item\_id' (chuẩn hóa) | item, item\_id, periods |
| `FieldDisplayMode.ALL` | All Fields | Hiển thị tất cả: item (VN), item\_en, item\_id | item, item\_en, item\_id, periods |
| `FieldDisplayMode.AUTO` | Auto Convert | Tự động chuyển đổi dựa trên loại dữ liệu | item, item\_en, item\_id, periods |
| `'vi'` | Vietnamese Only | Chỉ tiếng Việt (backward compatible) | item, item\_id, periods |
| `'en'` | English Only | Chỉ tiếng Anh (backward compatible) | item\_en, item\_id, periods |

## Báo cáo kết quả kinh doanh

### KBS Source - Báo cáo kết quả kinh doanh

**Gọi hàm**

**Tham số**

-   `period` (str): Kỳ báo cáo - 'quarter' hoặc 'year'
-   `display_mode` (str/FieldDisplayMode): Mode hiển thị trường dữ liệu

**Dữ liệu mẫu KBS:**

**Dữ liệu mẫu KBS - All Fields Mode:**

### VCI Source - Báo cáo kết quả kinh doanh

**Gọi hàm**

**Dữ liệu mẫu VCI:**

## Bảng cân đối kế toán

### KBS Source - Bảng cân đối kế toán

**Gọi hàm**

**Dữ liệu mẫu KBS:**

### VCI Source - Bảng cân đối kế toán

**Gọi hàm**

**Dữ liệu mẫu VCI:**

## Báo cáo lưu chuyển tiền tệ

### KBS Source - Báo cáo lưu chuyển tiền tệ

**Gọi hàm**

**Dữ liệu mẫu KBS:**

### VCI Source - Báo cáo lưu chuyển tiền tệ

**Gọi hàm**

**Dữ liệu mẫu VCI:**

## Chỉ số tài chính

### KBS Source - Chỉ số tài chính

**Gọi hàm**

**Dữ liệu mẫu KBS:**

### VCI Source - Chỉ số tài chính

**Gọi hàm**

**Dữ liệu mẫu VCI:**

## Mẹo sử dụng

### 1\. Lọc các chỉ tiêu chính (KBS)

### 2\. Kết hợp dữ liệu từ nhiều báo cáo

### 3\. Proxy Support cho Cloud Environments

## Lưu ý quan trọng

-   **KBS** là nguồn dữ liệu khuyến nghị cho vnstock 3.4.2+, cung cấp dữ liệu chi tiết và có cấu trúc phân cấp
-   **VCI** vẫn được hỗ trợ nhưng có cấu trúc dữ liệu đơn giản hơn
-   Luôn kiểm tra shape và columns của DataFrame trước khi xử lý
-   Sử dụng `display_mode` để kiểm soát cách hiển thị dữ liệu
-   Các period columns có format: `'2025-Q4', '2025-Q3', '2025-Q2', '2025-Q1'` cho quarterly và `'2025', '2024', '2023'` cho yearly
