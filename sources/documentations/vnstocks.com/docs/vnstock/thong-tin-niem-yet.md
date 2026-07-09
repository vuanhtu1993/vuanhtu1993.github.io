---
title: "Thông tin niêm yết"
source_url: "https://vnstocks.com/docs/vnstock/thong-tin-niem-yet"
crawled_at: "2026-07-09T08:06:49.605Z"
---

> \[!WARNING\] **Lưu ý:** Tài liệu này hướng dẫn sử dụng các hàm API cũ (trước vnstock 4.0) và không còn được duy trì cập nhật thường xuyên. Tuy nhiên, các hàm này vẫn hoạt động bình thường nếu bạn cần tuỳ chỉnh sâu về nguồn dữ liệu. Xem thêm chi tiết tại [Vnstock Agent Guide](https://github.com/vnstock-hq/vnstock-agent-guide/blob/main/docs/vnstock/01-overview.md).
> 
> Vnstock hiện tại sử dụng Giao diện Hợp nhất (Unified UI) làm chuẩn chung, vui lòng chuyển sang xem [Tài liệu chính thức](https://vnstocks.com/docs/vnstock) để cập nhật tính năng mới nhất.

[Agent Guide](https://github.com/vnstock-hq/vnstock-agent-guide/) [Notebook minh hoạ](https://colab.research.google.com/github/thinh-vu/vnstock/blob/main/docs/1_quickstart_stock_vietnam.ipynb)

Khuyên dùng: Nên ưu tiên sử dụng [Agent Guide](https://vnstocks.com/onboard/agent-guide) để nạp môi trường cho AI Agent trên máy tính cục bộ. Tránh viết code thủ công hoặc dùng AI phiên bản web/Google Colab vì AI không có thông tin mới nhất về thư viện nên dễ viết sai cú pháp.

Để truy xuất danh sách chứng khoán niêm yết, bạn khởi động chương trình và tạo đối tượng `listing`.

## So sánh nguồn dữ liệu

| Phương thức | KBS | VCI | Ghi chú |
| --- | --- | --- | --- |
| **all\_symbols()** | ✅ | ✅ | KBS: 1557 mã, VCI: 1736 mã |
| **symbols\_by\_exchange()** | ✅ | ✅ | KBS: 6 cột, VCI: 7 cột |
| **symbols\_by\_industries()** | ✅ | ✅ | KBS: 3 cột, VCI: 10 cột |
| **symbols\_by\_group()** | ✅ | ✅ | Cả hai đều trả về Series |
| **industries\_icb()** | ❌ | ✅ | **Chỉ VCI có** (4 cột) |
| **all\_future\_indices()** | ✅ | ✅ | KBS: 14 mục, VCI: 8 mục |
| **all\_government\_bonds()** | ❌ | ✅ | **Chỉ VCI có** (6 mục) |
| **all\_covered\_warrant()** | ✅ | ✅ | Cả hai đều là Series (323 mục) |
| **all\_bonds()** | ✅ | ✅ | Cả hai đều là Series (82 mục) |

**Khuyến nghị:**

-   **KBS**: Thích hợp dùng cho Google Colab/Kaggle
-   **VCI**: Dữ liệu đầy đủ hơn, có ICB classification và nhiều chỉ số hơn. Thích hợp cài cục bộ trên máy hoặc dùng dịch vụ Cloud không thuộc Google.

## Cổ phiếu

### Liệt kê tất cả mã chứng khoán

**Gọi hàm**

---

**Kết quả trả về**

DataFrame với 2 cột:

-   `symbol` (object): Mã chứng khoán
-   `organ_name` (object): Tên công ty đầy đủ

**Dữ liệu mẫu**

**Kiểu dữ liệu chi tiết**

### Liệt kê mã chứng khoán theo sàn

**Gọi hàm**

**Tham số**

-   `exchange` (str): Sàn giao dịch
    -   `'HOSE'`: Sàn giao dịch Chứng khoán TP.HCM
    -   `'HNX'`: Sàn giao dịch Chứng khoán Hà Nội
    -   `'UPCOM'`: Sàn giao dịch Chứng khoán chưa niêm yết

**Kết quả trả về**

**KBS Source (6 cột):**

-   `symbol` (object): Mã chứng khoán
-   `organ_name` (object): Tên công ty đầy đủ
-   `en_organ_name` (object): Tên công ty tiếng Anh
-   `exchange` (object): Sàn giao dịch
-   `type` (object): Loại chứng khoán (stock)
-   `id` (int64): ID định danh

**VCI Source (7 cột):**

-   `symbol` (object): Mã chứng khoán
-   `exchange` (object): Sàn giao dịch
-   `type` (object): Loại chứng khoán (STOCK)
-   `organ_short_name` (object): Tên viết tắt
-   `organ_name` (object): Tên công ty đầy đủ
-   `product_grp_id` (object): ID nhóm sản phẩm
-   `icb_code2` (object): Mã ICB level 2

**Dữ liệu mẫu**

### Liệt kê chứng khoán theo phân nhóm

Liệt kê tất cả mã chứng khoán theo nhóm phân loại:

-   **VN30, VN100, HNX30**: Các chỉ số vốn hóa
-   **VNMidCap, VNSmallCap, VNAllShare**: Phân loại vốn hóa
-   **VNIT, VNIND, VNCONS, VNCOND, VNHEAL, VNENE**: Các chỉ số ngành
-   **ETF**: Chứng chỉ quỹ
-   **FU\_INDEX**: Hợp đồng tương lai
-   **CW**: Chứng quyền có bảo đảm

**Gọi hàm**

**Tham số**

-   `group_name` (str): Tên nhóm chỉ số

**Kết quả trả về**

Series chứa danh sách mã chứng khoán thuộc nhóm.

**Dữ liệu mẫu**

**Kiểu dữ liệu chi tiết**

### Chứng khoán theo ngành

**Gọi hàm**

**Kết quả trả về**

**KBS Source (3 cột):**

-   `symbol` (object): Mã chứng khoán
-   `industry_code` (int64): Mã ngành
-   `industry_name` (object): Tên ngành

**VCI Source (10 cột):**

-   `symbol` (object): Mã chứng khoán
-   `organ_name` (object): Tên công ty
-   `icb_name3`, `icb_name2`, `icb_name4` (object): Tên ngành theo các cấp ICB
-   `com_type_code` (object): Mã loại công ty
-   `icb_code1`, `icb_code2`, `icb_code3`, `icb_code4` (object): Mã ICB theo các cấp

**Dữ liệu mẫu**

### Phân loại ngành ICB (Chỉ VCI)

**Gọi hàm**

**Kết quả trả về**

DataFrame với 4 cột:

-   `icb_name` (object): Tên ngành tiếng Việt
-   `en_icb_name` (object): Tên ngành tiếng Anh
-   `icb_code` (object): Mã ICB
-   `level` (int64): Cấp phân loại (1-4)

**Dữ liệu mẫu**

**Kiểu dữ liệu chi tiết**

## Chỉ số thị trường

### Liệt kê tất cả chỉ số

**Gọi hàm**

**Dữ liệu mẫu:**

**Kiểu dữ liệu**

### Liệt kê chỉ số theo nhóm

Các nhóm chỉ số có sẵn bao gồm:

-   **HOSE Indices**: Các chỉ số chính của sàn HOSE (VN30, VN100, v.v.)
-   **Sector Indices**: Các chỉ số ngành (VNIT, VNIND, VNCONS, v.v.)
-   **Investment Indices**: Các chỉ số đầu tư (VNDIAMOND, VNFINLEAD, v.v.)
-   **VNX Indices**: Các chỉ số của sàn HNX (VNX50, VNXALL)

**Gọi hàm**

**Dữ liệu mẫu:**

**Kiểu dữ liệu**

## FX, Crypto, Chỉ số thế giới

### Tìm mã chứng khoán quốc tế

**Gọi hàm**

**Dữ liệu mẫu:**

**Kiểu dữ liệu**
