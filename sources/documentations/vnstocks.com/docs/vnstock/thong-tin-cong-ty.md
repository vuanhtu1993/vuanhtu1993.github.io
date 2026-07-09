---
title: "Thông tin công ty"
source_url: "https://vnstocks.com/docs/vnstock/thong-tin-cong-ty"
crawled_at: "2026-07-09T08:06:56.485Z"
---

> \[!WARNING\] **Lưu ý:** Tài liệu này hướng dẫn sử dụng các hàm API cũ (trước vnstock 4.0) và không còn được duy trì cập nhật thường xuyên. Tuy nhiên, các hàm này vẫn hoạt động bình thường nếu bạn cần tuỳ chỉnh sâu về nguồn dữ liệu. Xem thêm chi tiết tại [Vnstock Agent Guide](https://github.com/vnstock-hq/vnstock-agent-guide/blob/main/docs/vnstock/01-overview.md).
> 
> Vnstock hiện tại sử dụng Giao diện Hợp nhất (Unified UI) làm chuẩn chung, vui lòng chuyển sang xem [Tài liệu chính thức](https://vnstocks.com/docs/vnstock) để cập nhật tính năng mới nhất.

[Agent Guide](https://github.com/vnstock-hq/vnstock-agent-guide/) [Notebook minh hoạ](https://colab.research.google.com/github/thinh-vu/vnstock/blob/main/docs/1_quickstart_stock_vietnam.ipynb)

Khuyên dùng: Nên ưu tiên sử dụng [Agent Guide](https://vnstocks.com/onboard/agent-guide) để nạp môi trường cho AI Agent trên máy tính cục bộ. Tránh viết code thủ công hoặc dùng AI phiên bản web/Google Colab vì AI không có thông tin mới nhất về thư viện nên dễ viết sai cú pháp.

## Khởi tạo đối tượng

Bạn có thể sử dụng hai nguồn dữ liệu: **KBS** (khuyến nghị), **VCI** (không thể truy cập từ các dịch vụ của Google Cloud do bị chặn dải IP). Thông tin nguồn dữ liệu được cài đặt khi khởi tạo đối tượng python trước khi gọi các hàm truy xuất từng loại thông tin cụ thể.

## So Sánh Nguồn Dữ Liệu

| Phương Thức | KBS | VCI | Ghi Chú |
| --- | --- | --- | --- |
| **overview()** | ✅ | ✅ | KBS: 30 columns, VCI: 10 columns |
| **shareholders()** | ✅ | ✅ | KBS: 4 cols, VCI: 5 cols |
| **officers()** | ✅ | ✅ | KBS: 5 cols, VCI: 7 cols |
| **subsidiaries()** | ✅ | ❌ | Chỉ KBS có (6 cols) |
| **affiliate()** | ✅ | ✅ | Cả hai đều rỗng |
| **news()** | ✅ | ✅ | KBS: 5 cols, VCI: 18 cols |
| **events()** | ✅ | ✅ | KBS: rỗng, VCI: 13 cols |
| **ownership()** | ✅ | ❌ | Chỉ KBS có (4 cols) |
| **capital\_history()** | ✅ | ❌ | Chỉ KBS có (3 cols) |
| **insider\_trading()** | ✅ | ❌ | Chỉ KBS có (có thể rỗng) |
| **reports()** | ❌ | ✅ | Chỉ VCI có (có thể rỗng) |
| **trading\_stats()** | ❌ | ✅ | Chỉ VCI có (24 cols) |
| **ratio\_summary()** | ❌ | ✅ | Chỉ VCI có (46 cols) |

## Thông tin công ty

**Gọi hàm**

**Tham số**

Không có

### KBS Source - 30 columns

**Dữ liệu trả về**

-   `business_model` (object): Mô hình kinh doanh
-   `symbol` (object): Mã chứng khoán
-   `founded_date` (object): Ngày thành lập
-   `charter_capital` (int64): Vốn điều lệ
-   `number_of_employees` (int64): Số lượng nhân viên
-   `listing_date` (object): Ngày niêm yết
-   `par_value` (int64): Mệnh giá
-   `exchange` (object): Sàn giao dịch
-   `listing_price` (int64): Giá niêm yết
-   `listed_volume` (int64): Khối lượng niêm yết
-   `ceo_name` (object): Tên CEO
-   `ceo_position` (object): Vị trí CEO
-   `inspector_name` (object): Tên kiểm soát viên
-   `inspector_position` (object): Vị trí kiểm soát viên
-   `establishment_license` (object): Giấy phép thành lập
-   `business_code` (object): Mã ngành kinh doanh
-   `tax_id` (object): Mã số thuế
-   `auditor` (object): Kiểm toán viên
-   `company_type` (object): Loại hình công ty
-   `address` (object): Địa chỉ
-   `phone` (object): Điện thoại
-   `fax` (object): Fax
-   `email` (object): Email
-   `website` (object): Website
-   `branches` (object): Chi nhánh
-   `history` (object): Lịch sử
-   `free_float_percentage` (int64): Tỷ lệ free float
-   `free_float` (int64): Số lượng free float
-   `outstanding_shares` (int64): Số cổ phiếu đang lưu hành
-   `as_of_date` (object): Ngày cập nhật dữ liệu

**Dữ liệu mẫu**

### VCI Source - 10 columns

**Dữ liệu trả về**

-   `symbol` (object): Mã chứng khoán
-   `id` (object): ID công ty
-   `issue_share` (int64): Số cổ phiếu phát hành
-   `history` (object): Lịch sử công ty
-   `company_profile` (object): Hồ sơ công ty
-   `icb_name3` (object): Phân loại ngành ICB cấp 3
-   `icb_name2` (object): Phân loại ngành ICB cấp 2
-   `icb_name4` (object): Phân loại ngành ICB cấp 4
-   `financial_ratio_issue_share` (int64): Tỷ lệ tài chính trên số cổ phiếu
-   `charter_capital` (int64): Vốn điều lệ

**Dữ liệu mẫu**

## Cổ đông lớn

**Gọi hàm**

**Tham số**

Không có

### KBS Source - 4 columns

**Dữ liệu trả về**

-   `name` (object): Tên cổ đông
-   `update_date` (object): Ngày cập nhật
-   `shares_owned` (int64): Số cổ phiếu sở hữu
-   `ownership_percentage` (float64): Tỷ lệ sở hữu (%)

**Dữ liệu mẫu**

### VCI Source - 5 columns

**Dữ liệu trả về**

-   `id` (object): ID cổ đông
-   `share_holder` (object): Tên cổ đông
-   `quantity` (int64): Số lượng cổ phiếu
-   `share_own_percent` (float64): Tỷ lệ sở hữu (%)
-   `update_date` (object): Ngày cập nhật

**Dữ liệu mẫu**

## Ban lãnh đạo

**Gọi hàm**

**Tham số**

Không có

### KBS Source - 5 columns

**Dữ liệu trả về**

-   `from_date` (int64): Năm bắt đầu
-   `position` (object): Vị trí công việc (tiếng Việt)
-   `name` (object): Tên nhân viên
-   `position_en` (object): Vị trí công việc (tiếng Anh)
-   `owner_code` (object): Mã sở hữu

**Dữ liệu mẫu**

### VCI Source - 7 columns

**Dữ liệu trả về**

-   `id` (int64): ID nhân viên
-   `officer_name` (object): Tên nhân viên
-   `officer_position` (object): Vị trí công việc
-   `officer_own_percent` (float64): Tỷ lệ sở hữu (%)
-   `quantity` (int64): Số lượng cổ phiếu
-   `update_date` (object): Ngày cập nhật
-   `position` (object): Vị trí (có thể rỗng)

**Dữ liệu mẫu**

## Công ty con (Chỉ KBS)

**Gọi hàm**

**Tham số**

Không có

**Dữ liệu trả về**

-   `update_date` (object): Ngày cập nhật
-   `name` (object): Tên công ty con
-   `charter_capital` (int64): Vốn điều lệ
-   `ownership_percent` (int64): Tỷ lệ sở hữu (%)
-   `currency` (object): Loại tiền tệ
-   `type` (object): Loại quan hệ

**Dữ liệu mẫu**

**Lưu ý**: VCI source trả về lỗi `RetryError` cho phương thức này.

## Công ty liên kết

**Gọi hàm**

**Tham số**

Không có

### KBS Source - 6 columns

**Dữ liệu trả về**

-   `update_date` (object): Ngày cập nhật
-   `name` (object): Tên công ty liên kết
-   `charter_capital` (int64): Vốn điều lệ
-   `ownership_percent` (float64): Tỷ lệ sở hữu (%)
-   `currency` (object): Loại tiền tệ
-   `type` (object): Loại quan hệ

**Dữ liệu mẫu**

### VCI Source - 4 columns

**Dữ liệu trả về**

-   `id` (object): ID công ty liên kết
-   `sub_organ_code` (object): Mã công ty con
-   `organ_name` (object): Tên công ty
-   `ownership_percent` (object): Tỷ lệ sở hữu (có thể rỗng)

**Dữ liệu mẫu**

## Tin tức

**Gọi hàm**

**Tham số**

Không có

### KBS Source - 5 columns

**Dữ liệu trả về**

-   `head` (object): Tiêu đề tin tức
-   `article_id` (int64): ID bài viết
-   `title` (object): Tiêu đề phụ
-   `publish_time` (object): Thời gian xuất bản
-   `url` (object): Link bài viết

**Dữ liệu mẫu**

### VCI Source - 18 columns

**Dữ liệu trả về**

-   `id` (int64): ID tin tức
-   `news_title` (object): Tiêu đề tin tức
-   `public_date` (object): Ngày công bố
-   `meta_title` (object): Meta title
-   `meta_description` (object): Meta description
-   `meta_keywords` (object): Meta keywords
-   `tags` (object): Tags
-   `content` (object): Nội dung
-   `author` (object): Tác giả
-   `source` (object): Nguồn
-   `status` (int64): Trạng thái
-   `created_at` (object): Thời gian tạo
-   `updated_at` (object): Thời gian cập nhật
-   `published_at` (object): Thời gian xuất bản
-   `url` (object): Link
-   `image_url` (object): Link ảnh
-   `price_change_pct` (float64): Tỷ lệ thay đổi giá
-   `symbol` (object): Mã chứng khoán

**Dữ liệu mẫu**

## Sự kiện

**Gọi hàm**

**Tham số**

Không có

### KBS Source

**Dữ liệu trả về**

DataFrame có thể rỗng

⚠️ **Lưu ý**: KBS thường trả về dữ liệu sự kiện rỗng.

### VCI Source - 13 columns

**Dữ liệu trả về**

-   `id` (object): ID sự kiện
-   `event_title` (object): Tiêu đề sự kiện (tiếng Việt)
-   `en__event_title` (object): Tiêu đề sự kiện (tiếng Anh)
-   `public_date` (object): Ngày công bố
-   `issue_date` (object): Ngày phát hành
-   `source_url` (object): Link tài liệu
-   `event_list_code` (object): Mã loại sự kiện
-   `event_list_name` (object): Tên loại sự kiện (tiếng Việt)
-   `en__event_list_name` (object): Tên loại sự kiện (tiếng Anh)
-   `ratio` (float64): Tỷ lệ
-   `value` (float64): Giá trị
-   `record_date` (object): Ngày ghi danh
-   `exright_date` (object): Ngày hết quyền

**Dữ liệu mẫu**

## Cơ cấu cổ đông (Chỉ KBS)

**Gọi hàm**

**Tham số**

Không có

**Dữ liệu trả về**

-   `owner_type` (object): Loại cổ đông
-   `ownership_percentage` (float64): Tỷ lệ sở hữu (%)
-   `shares_owned` (int64): Số cổ phiếu sở hữu
-   `update_date` (object): Ngày cập nhật

**Dữ liệu mẫu**

## Lịch sử vốn điều lệ (Chỉ KBS)

**Gọi hàm**

**Tham số**

Không có

**Dữ liệu trả về**

-   `date` (object): Ngày thay đổi
-   `charter_capital` (int64): Vốn điều lệ
-   `currency` (object): Loại tiền tệ

**Dữ liệu mẫu**

## Giao dịch nội bộ (Chỉ KBS)

**Gọi hàm**

**Tham số**

-   `page` (int, tùy chọn): Số trang (mặc định: 1)
-   `page_size` (int, tùy chọn): Kích thước trang (mặc định: 10)

**Dữ liệu trả về**

DataFrame rỗng

⚠️ **Lưu ý**: Có thể trả về DataFrame rỗng nếu không có giao dịch nội bộ.

## Báo cáo phân tích (Chỉ VCI)

**Gọi hàm**

**Tham số**

Không có

**Dữ liệu trả về**

DataFrame rỗng

⚠️ **Lưu ý**: Có thể trả về DataFrame rỗng nếu không có báo cáo phân tích.

## Thống kê giao dịch (Chỉ VCI)

**Gọi hàm**

**Tham số**

Không có

**Dữ liệu trả về**

DataFrame với 24 columns thống kê giao dịch bao gồm:

-   `symbol` (object): Mã chứng khoán
-   `exchange` (object): Sàn giao dịch
-   `ev` (int64): Enterprise value
-   `ceiling` (int64): Giá trần
-   `floor` (int64): Giá sàn
-   `reference` (int64): Giá tham chiếu
-   `avg_match_price_*` (float64): Giá trung bình khớp lệnh (1d, 3d, 1w, 1m, 3m, 6m, 1y)
-   `avg_match_volume_2w` (float64): Khối lượng trung bình 2 tuần
-   `foreign_holding_room` (int64): Room ngoại
-   `current_holding_ratio` (float64): Tỷ lệ nắm giữ hiện tại
-   `max_holding_ratio` (float64): Tỷ lệ nắm giữ tối đa
-   `buy_foreign_volume` (int64): Khối lượng mua ngoại
-   `sell_foreign_volume` (int64): Khối lượng bán ngoại
-   `buy_foreign_value` (int64): Giá trị mua ngoại
-   `sell_foreign_value` (int64): Giá trị bán ngoại
-   `total_buy_volume` (int64): Tổng khối lượng mua
-   `total_sell_volume` (int64): Tổng khối lượng bán
-   `total_deal_volume` (int64): Tổng khối lượng thỏa thuận

**Dữ liệu mẫu**

## Tóm tắt tỷ lệ tài chính (Chỉ VCI)

**Gọi hàm**

**Tham số**

Không có

**Dữ liệu trả về**

DataFrame với 46 columns các chỉ số tài chính bao gồm:

**Chỉ số cơ bản:**

-   `symbol` (object): Mã chứng khoán
-   `year_report` (int64): Năm báo cáo

**Chỉ số doanh thu và lợi nhuận:**

-   `revenue` (int64): Doanh thu
-   `ebit` (int64): Lợi nhuận trước thuế và lãi vay
-   `ebitda` (int64): EBITDA
-   `net_profit_before_tax` (int64): Lợi nhuận trước thuế
-   `net_profit_after_tax` (int64): Lợi nhuận sau thuế

**Chỉ số cân kế:**

-   `total_assets` (int64): Tổng tài sản
-   `total_equity` (int64): Vốn chủ sở hữu
-   `total_liabilities` (int64): Tổng nợ
-   `current_assets` (int64): Tài sản ngắn hạn
-   `current_liabilities` (int64): Nợ ngắn hạn
-   `inventory` (int64): Hàng tồn kho
-   `receivables` (int64): Các khoản phải thu
-   `cash_and_equivalents` (int64): Tiền và tương đương tiền
-   `short_term_debt` (int64): Nợ ngắn hạn
-   `long_term_debt` (int64): Nợ dài hạn

**Chỉ số trên mỗi cổ phiếu:**

-   `book_value_per_share` (float64): Giá trị sổ sách trên mỗi cổ phiếu
-   `eps` (float64): Lợi nhuận trên mỗi cổ phiếu

**Chỉ số sinh lời:**

-   `roe` (float64): ROE
-   `roa` (float64): ROA
-   `roic` (float64): ROIC
-   `gross_margin` (float64): Biên lợi nhuận gộp
-   `ebitda_margin` (float64): Biên lợi nhuận EBITDA
-   `ebit_margin` (float64): Biên lợi nhuận EBIT
-   `net_margin` (float64): Biên lợi nhuận ròng

**Chỉ số hiệu quả hoạt động:**

-   `asset_turnover` (float64): Vòng quay tài sản
-   `equity_turnover` (float64): Vòng quay vốn chủ sở hữu

**Chỉ số thanh khoản:**

-   `current_ratio` (float64): Tỷ lệ thanh khoản hiện hành
-   `quick_ratio` (float64): Tỷ lệ thanh khoản nhanh

**Chỉ số đòn bẩy:**

-   `debt_to_equity` (float64): D/E
-   `debt_to_assets` (float64): Nợ trên tài sản
-   `long_term_debt_to_equity` (float64): Nợ dài hạn trên vốn chủ sở hữu
-   `interest_coverage` (float64): Tỷ lệ bao lãi

**Chỉ số định giá:**

-   `pe` (float64): P/E
-   `pb` (float64): P/B
-   `ps` (float64): P/S
-   `ev_to_ebitda` (float64): EV/EBITDA
-   `ev_to_sales` (float64): EV/Sales
-   `price_to_book` (float64): Giá trên giá trị sổ sách

**Chỉ số cổ tức:**

-   `dividend_yield` (float64): Tỷ suất cổ tức
-   `payout_ratio` (float64): Tỷ lệ trả cổ tức

**Chỉ số dòng tiền:**

-   `fcf_yield` (float64): Tỷ suất dòng tiền tự do
-   `fcf_margin` (float64): Biên lợi nhuận dòng tiền tự do
-   `operating_cash_flow` (int64): Dòng tiền từ hoạt động kinh doanh
-   `free_cash_flow` (int64): Dòng tiền tự do

**Dữ liệu mẫu**

## Lưu ý quan trọng

1.  **KBS là nguồn khuyến nghị**: Ổn định hơn VCI cho Google Colab/Kaggle
2.  **Dữ liệu không đầy đủ**: Không phải công ty nào cũng có đầy đủ thông tin cho tất cả phương thức
3.  **Giá trị rỗng**: Nếu không có dữ liệu, sẽ trả về DataFrame rỗng
4.  **Phụ thuộc vào nguồn**: Thông tin khác nhau giữa KBS và VCI
5.  **Methods riêng biệt**: KBS có ownership/capital\_history/insider\_trading, VCI có reports/trading\_stats/ratio\_summary
