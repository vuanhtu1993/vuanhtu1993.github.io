---
title: "Phân Tích Chuyên Sâu"
source_url: "https://vnstocks.com/docs/vnstock-data/insights-layer-v3"
crawled_at: "2026-07-09T08:02:34.953Z"
---

Học sử dụng AI để Vibe Coding với Vnstock (19 bài miễn phí)

Dùng Vnstock tự tin chỉ trong 30 phútAI viết code chính xác, thấy ngay kết quả

[Xem ngay](https://course.learn-anything.vn/courses/huong-dan-vibe-coding-vnstock-chung-khoan)

[![Vnstock Logo](https://res.cloudinary.com/dv3vzmogk/image/upload/v1783584154/aha-mind/docs-crawler/vnstocks.com/image_nv18m3.png)](https://vnstocks.com/)

Cập nhật lần cuối: 20/06/2026

[Thảo luận](#comments-section)

[Agent Guide](https://github.com/vnstock-hq/vnstock-agent-guide/) [Notebook minh hoạ](https://colab.research.google.com/github/vnstock-hq/vnstock-agent-guide/blob/main/notebooks/01_unified_ui/06_Insights.ipynb)

Khuyên dùng: Nên ưu tiên sử dụng [Agent Guide](https://vnstocks.com/onboard/agent-guide) để nạp môi trường cho AI Agent trên máy tính cục bộ. Tránh viết code thủ công hoặc dùng AI phiên bản web/Google Colab vì AI không có thông tin mới nhất về thư viện nên dễ viết sai cú pháp.

## Tổng quan

**Insights Layer** cung cấp hệ thống **xếp hạng top cổ phiếu** và **bộ lọc chứng khoán** để nhà đầu tư nhận diện cơ hội và xu hướng thị trường.

## Khởi tạo

## Cấu trúc

## Hướng dẫn chi tiết

### 1\. Bảng xếp hạng

Xếp hạng top cổ phiếu theo nhiều tiêu chí: tăng/giảm giá, khối lượng, giá trị, nước ngoài mua/bán, giao dịch thỏa thuận.

| Phương thức | Tham số | Mô tả |
| --- | --- | --- |
| `gainer()` | `index`, `limit` | Top cổ phiếu tăng giá |
| `loser()` | `index`, `limit` | Top cổ phiếu giảm giá |
| `value()` | `index`, `limit` | Top theo giá trị giao dịch |
| `volume()` | `index`, `limit` | Top theo khối lượng |
| `foreign_buy()` | `date`, `limit` | Top nước ngoài mua ròng |
| `foreign_sell()` | `date`, `limit` | Top nước ngoài bán ròng |
| `deal()` | `index`, `limit` | Top giao dịch thỏa thuận |

**Tham số:**

-   `index` (str) — Chỉ số lọc: `'VNINDEX'`, `'HNX'`. Mặc định lấy toàn thị trường.
-   `limit` (int) — Số lượng kết quả. Mặc định 10.
-   `date` (str) — Ngày giao dịch (YYYY-MM-DD).

---

### 2\. Bộ lọc chứng khoán

Dữ liệu screener toàn thị trường với **hàng trăm chỉ tiêu tài chính**. Người dùng tự áp dụng logic lọc bằng Pandas.

| Phương thức | Tham số | Mô tả |
| --- | --- | --- |
| `criteria()` | `lang` | Danh sách giải nghĩa tên cột (`'vi'` / `'en'`) |
| `filter()` | `limit` | Dữ liệu screener toàn thị trường |

---

### 3\. Tìm cơ hội giá trị

Kết hợp ranking và screener để tìm cổ phiếu giảm giá mạnh nhưng vẫn có chất lượng tốt.

[

Bài trước

Dữ Liệu Vĩ Mô & Hàng Hóa

](https://vnstocks.com/docs/vnstock-data/macro-layer-v3)[

Bài sau

Thống kê & Định giá

](https://vnstocks.com/docs/vnstock-data/analytics-layer-v3)

### Thảo luận

Chưa có bình luận. Hãy là người đầu tiên!

Vui lòng đăng nhập bằng Google để thảo luận.
