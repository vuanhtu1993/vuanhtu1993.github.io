---
title: "Phân tích tài chính"
source_url: "https://vnstocks.com/docs/vnstock/phan-tich-co-ban-fundamental"
crawled_at: "2026-07-09T07:59:36.140Z"
---

Học sử dụng AI để Vibe Coding với Vnstock (19 bài miễn phí)

Dùng Vnstock tự tin chỉ trong 30 phútAI viết code chính xác, thấy ngay kết quả

[Xem ngay](https://course.learn-anything.vn/courses/huong-dan-vibe-coding-vnstock-chung-khoan)

[![Vnstock Logo](https://res.cloudinary.com/dv3vzmogk/image/upload/v1783583975/aha-mind/docs-crawler/vnstocks.com/image_ehpdq6.png)](https://vnstocks.com/)

Cập nhật lần cuối: 20/06/2026

[Thảo luận](#comments-section)

Nhóm `Fundamental` cung cấp bộ công cụ để truy xuất dữ liệu tài chính doanh nghiệp đã được chuẩn hóa, giúp bạn thực hiện phân tích cơ bản một cách nhanh chóng.

[Agent Guide](https://github.com/vnstock-hq/vnstock-agent-guide/blob/main/docs/vnstock/00-unified-ui.md) [Notebook minh hoạ](https://colab.research.google.com/github/thinh-vu/vnstock/blob/main/docs/unified-ui/03_Fundamental.ipynb)

Khuyên dùng: Nên ưu tiên sử dụng [Agent Guide](https://vnstocks.com/onboard/agent-guide) để nạp môi trường cho AI Agent trên máy tính cục bộ. Tránh viết code thủ công hoặc dùng AI phiên bản web/Google Colab vì AI không có thông tin mới nhất về thư viện nên dễ viết sai cú pháp.

---

## 1\. Khởi tạo

---

## 2\. Các lớp và phương thức chi tiết

### A. Lớp `equity` (Cổ phiếu)

Truy xuất báo cáo tài chính và chỉ số định giá của các doanh nghiệp niêm yết.

| Phương thức | Tham số | Mô tả |
| --- | --- | --- |
| **`income_statement()`** | `period='year', orient='report', **kwargs` | Kết quả kinh doanh. |
| **`balance_sheet()`** | `period='year', orient='report', **kwargs` | Bảng cân đối kế toán. |
| **`cash_flow()`** | `period='year', orient='report', **kwargs` | Lưu chuyển tiền tệ. |
| **`ratio()`** | `orient='report', **kwargs` | Các chỉ số tài chính (P/E, P/B, ROE...). |

---

## 3\. Tham số nâng cao

### Tham số `period` (Kỳ báo cáo)

-   `'year'`: Báo cáo theo năm (Mặc định).
-   `'quarter'`: Báo cáo theo quý.

### Tham số `orient` (Định dạng kết quả)

Đây là tính năng độc đáo giúp bạn thay đổi cấu trúc DataFrame trả về để phù hợp với mục đích sử dụng:

-   **`'report'`** (Mặc định):
    -   Hàng (Rows): Các chỉ tiêu tài chính (Doanh thu, Lợi nhuận...).
    -   Cột (Columns): Các kỳ báo cáo (2023, 2022...).
    -   _Phù hợp để đọc và so sánh trực quan._
-   **`'time_series'`**:
    -   Hàng (Rows): Các kỳ báo cáo.
    -   Cột (Columns): Các chỉ tiêu tài chính.
    -   _Phù hợp để vẽ biểu đồ hoặc chạy mô hình machine learning._

---

## 4\. Cấu trúc dữ liệu

### Kết quả trả về của các báo cáo (`orient='report'`)

-   `item`: Tên chỉ tiêu tiếng Việt.
-   `item_en`: Tên chỉ tiêu tiếng Anh (nếu có).
-   `unit`: Đơn vị tính.
-   Các cột năm/quý (ví dụ: `2023`, `2022`...): Giá trị tương ứng.

### Các chỉ số tài chính (`ratio`)

Bao gồm hơn 50 chỉ số quan trọng, ví dụ:

-   `ticker`: Mã cổ phiếu.
-   `quarter` / `year`: Kỳ báo cáo.
-   `priceToEarning`: P/E.
-   `priceToBook`: P/B.
-   `roe`: Tỷ suất lợi nhuận trên vốn chủ sở hữu.
-   `roa`: Tỷ suất lợi nhuận trên tổng tài sản.

---

[

Bài trước

Dữ liệu Thị trường

](https://vnstocks.com/docs/vnstock/du-lieu-thi-truong-market-data)[

Bài sau

Thị trường & Hàng hoá

](https://vnstocks.com/docs/vnstock/du-lieu-thi-truong-hang-hoa-retail)

### Thảo luận

Chưa có bình luận. Hãy là người đầu tiên!

Vui lòng đăng nhập bằng Google để thảo luận.
