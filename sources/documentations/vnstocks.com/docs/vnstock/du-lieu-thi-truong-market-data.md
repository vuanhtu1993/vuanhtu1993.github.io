---
title: "Dữ liệu Thị trường"
source_url: "https://vnstocks.com/docs/vnstock/du-lieu-thi-truong-market-data"
crawled_at: "2026-07-09T07:59:26.762Z"
---

Học sử dụng AI để Vibe Coding với Vnstock (19 bài miễn phí)

Dùng Vnstock tự tin chỉ trong 30 phútAI viết code chính xác, thấy ngay kết quả

[Xem ngay](https://course.learn-anything.vn/courses/huong-dan-vibe-coding-vnstock-chung-khoan)

[![Vnstock Logo](https://res.cloudinary.com/dv3vzmogk/image/upload/v1783583966/aha-mind/docs-crawler/vnstocks.com/image_js3wwc.png)](https://vnstocks.com/)

Cập nhật lần cuối: 20/06/2026

[Thảo luận](#comments-section)

Nhóm `Market` tập trung vào các dữ liệu biến động của thị trường theo thời gian thực và dữ liệu lịch sử cho nhiều loại tài sản khác nhau.

[Agent Guide](https://github.com/vnstock-hq/vnstock-agent-guide/blob/main/docs/vnstock/00-unified-ui.md) [Notebook minh hoạ](https://colab.research.google.com/github/thinh-vu/vnstock/blob/main/docs/unified-ui/02_Market.ipynb)

Khuyên dùng: Nên ưu tiên sử dụng [Agent Guide](https://vnstocks.com/onboard/agent-guide) để nạp môi trường cho AI Agent trên máy tính cục bộ. Tránh viết code thủ công hoặc dùng AI phiên bản web/Google Colab vì AI không có thông tin mới nhất về thư viện nên dễ viết sai cú pháp.

---

## 1\. Khởi tạo

---

## 2\. Các lớp và phương thức chi tiết

### A. Lớp `equity` (Cổ phiếu)

| Phương thức | Tham số | Mô tả |
| --- | --- | --- |
| **`ohlcv()`** | `start, end, interval='1D', count=100` | Lấy dữ liệu nến (Mở, Cao, Thấp, Đóng, Khối lượng). |
| **`trades()`** | \- | Dữ liệu khớp lệnh chi tiết trong ngày (Tick-by-tick). |
| **`quote()`** | \- | Lấy thông tin giá hiện tại (Bảng giá). |

**Tham số chính của `ohlcv`:**

-   `start / end`: Định dạng 'YYYY-MM-DD'.
-   `interval`: Khung thời gian. Nhận giá trị 1m, 5m, 15m, 30m, 1h, 1D, 1W
-   `count`: Số lượng nến cần lấy nếu không chỉ định `start`.

**Dữ liệu mẫu (`ohlcv`):**

| time | open | high | low | close | volume |
| --- | --- | --- | --- | --- | --- |
| 2024-01-02 07:00:00 | 55.05 | 55.52 | 54.59 | 55.45 | 1785800 |
| 2024-01-03 07:00:00 | 55.45 | 56.12 | 54.99 | 56.12 | 1373000 |

**Ví dụ:**

---

### B. Lớp `index` (Chỉ số)

Truy xuất biến động của các bộ chỉ số thị trường (VNINDEX, VN30...).

| Phương thức | Tham số | Mô tả |
| --- | --- | --- |
| **`ohlcv()`** | \`start, end, interval='1D', length=90 | Biểu đồ giá của chỉ số. |

---

### C. Dữ liệu Tài sản Quốc tế & Khác

Sử dụng nguồn dữ liệu MSN và FMarket để theo dõi các thị trường khác.

| Lớp | Phương thức | Mô tả |
| --- | --- | --- |
| **`forex`** | `ohlcv()` | Tỷ giá ngoại hối (ví dụ: "USDVND"). |
| **`crypto`** | `ohlcv()` | Giá tiền điện tử (ví dụ: "BTC"). |
| **`commodity`** | `ohlcv()` | Giá hàng hóa (ví dụ: "Gold"). |
| **`fund`** | `history() / nav()` | Lịch sử giá NAV của quỹ mở. |
| **`etf`** | `ohlcv() / quote() / trades()` | Dữ liệu giao dịch chứng chỉ quỹ ETF. |
| **`futures`** | `ohlcv() / quote() / trades()` | Dữ liệu hợp đồng tương lai. |
| **`warrant`** | `ohlcv() / quote() / trades()` | Dữ liệu chứng quyền có bảo đảm. |

---

## 3\. Lấy Bảng giá Nhanh

Bạn có thể lấy giá hiện tại cho một hoặc nhiều mã cùng lúc mà không cần thông qua các lớp tài sản.

[

Bài trước

Tra cứu thông tin tham chiếu

](https://vnstocks.com/docs/vnstock/tra-cuu-thong-tin-tham-chieu-reference)[

Bài sau

Phân tích tài chính

](https://vnstocks.com/docs/vnstock/phan-tich-co-ban-fundamental)

### Thảo luận

Chưa có bình luận. Hãy là người đầu tiên!

Vui lòng đăng nhập bằng Google để thảo luận.
