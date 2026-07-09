---
title: "Thống kê & Định giá"
source_url: "https://vnstocks.com/docs/vnstock-data/analytics-layer-v3"
crawled_at: "2026-07-09T08:02:43.411Z"
---

Học sử dụng AI để Vibe Coding với Vnstock (19 bài miễn phí)

Dùng Vnstock tự tin chỉ trong 30 phútAI viết code chính xác, thấy ngay kết quả

[Xem ngay](https://course.learn-anything.vn/courses/huong-dan-vibe-coding-vnstock-chung-khoan)

[![Vnstock Logo](https://res.cloudinary.com/dv3vzmogk/image/upload/v1783584162/aha-mind/docs-crawler/vnstocks.com/image_q8cmuj.png)](https://vnstocks.com/)

Cập nhật lần cuối: 20/06/2026

[Thảo luận](#comments-section)

[Agent Guide](https://github.com/vnstock-hq/vnstock-agent-guide/) [Notebook minh hoạ](https://colab.research.google.com/github/vnstock-hq/vnstock-agent-guide/blob/main/notebooks/01_unified_ui/04_Analytics.ipynb)

Khuyên dùng: Nên ưu tiên sử dụng [Agent Guide](https://vnstocks.com/onboard/agent-guide) để nạp môi trường cho AI Agent trên máy tính cục bộ. Tránh viết code thủ công hoặc dùng AI phiên bản web/Google Colab vì AI không có thông tin mới nhất về thư viện nên dễ viết sai cú pháp.

## Tổng quan

**Analytics Layer** cung cấp dữ liệu **định giá thị trường** bao gồm P/E, P/B lịch sử, và đánh giá tổng quan cho các chỉ số thị trường. Layer được tách riêng từ Insights để tập trung vào phân tích định giá toàn thị trường.

## Khởi tạo

## Cấu trúc

## Hướng dẫn chi tiết

### 1\. Định giá thị trường

Lấy chuỗi thời gian lịch sử của P/E, P/B cho các chỉ số thị trường — phục vụ backtest và đánh giá chu kỳ định giá.

| Phương thức | Tham số | Mô tả |
| --- | --- | --- |
| `pe()` | `duration` | P/E ratio lịch sử |
| `pb()` | `duration` | P/B ratio lịch sử |
| `evaluation()` | `duration` | Đánh giá tổng hợp (P/E + P/B) |

**Tham số:**

-   `index` (str) — Chỉ số: `"VNINDEX"`, `"HNX"`, `"UPCOM"`. Mặc định `"VNINDEX"`.
-   `duration` (str) — `"1Y"`, `"2Y"`, `"3Y"`, `"5Y"`. Mặc định `"5Y"`.

**Kết quả mẫu P/E** Output trả về dạng DataFrame với cột `reportDate` và `pe`. Ví dụ: `2025-03-11 13.22`.

---

### 2\. So sánh định giá giữa các sàn

---

### 3\. Đánh giá mức định giá hiện tại

So sánh P/E hiện tại với trung bình 5 năm để xác định thị trường đang rẻ hay đắt.

[

Bài trước

Phân Tích Chuyên Sâu

](https://vnstocks.com/docs/vnstock-data/insights-layer-v3)[

Bài sau

Giới thiệu Vnstock TA

](https://vnstocks.com/docs/vnstock-ta/gioi-thieu)

### Thảo luận

Chưa có bình luận. Hãy là người đầu tiên!

Vui lòng đăng nhập bằng Google để thảo luận.
