---
title: "Dữ Liệu Giao Dịch"
source_url: "https://vnstocks.com/docs/vnstock-data/market-layer-v3"
crawled_at: "2026-07-09T08:02:12.085Z"
---

[Agent Guide](https://github.com/vnstock-hq/vnstock-agent-guide/) [Notebook minh hoạ](https://colab.research.google.com/github/vnstock-hq/vnstock-agent-guide/blob/main/notebooks/01_unified_ui/02_Market.ipynb)

Khuyên dùng: Nên ưu tiên sử dụng [Agent Guide](https://vnstocks.com/onboard/agent-guide) để nạp môi trường cho AI Agent trên máy tính cục bộ. Tránh viết code thủ công hoặc dùng AI phiên bản web/Google Colab vì AI không có thông tin mới nhất về thư viện nên dễ viết sai cú pháp.

## Tổng quan

**Market Layer** cung cấp dữ liệu **realtime & lịch sử** về giá, khối lượng, vốn hóa, thanh khoản ngay từ các sàn giao dịch và nhà cung cấp dữ liệu. Đây là dữ liệu **thay đổi liên tục** và phục vụ cho trading, phân tích kỹ thuật, và theo dõi danh mục.

## Khởi tạo

## Cấu trúc

## Hướng dẫn chi tiết

### 1\. Thị trường cổ phiếu

Domain cốt lõi của Market Layer, cung cấp đầy đủ dữ liệu giao dịch cho mọi mã cổ phiếu niêm yết.

| Phương thức | Mô tả |
| --- | --- |
| `ohlcv()` | Giá OHLCV lịch sử |
| `trades()` | Lệnh giao dịch chi tiết (Time & Sales) |
| `order_book()` | Cấp độ mua/bán |
| `quote()` | Giá hiện tại / Bảng giá |
| `session_stats()` | Thống kê phiên giao dịch |
| `foreign_flow()` | Dòng tiền nước ngoài |
| `proprietary_flow()` | Dòng tiền tự doanh |
| `block_trades()` | Giao dịch thỏa thuận |
| `odd_lot()` | Giao dịch lô lẻ |
| `volume_profile()` | Phân bố khối lượng theo giá |
| `summary()` | Tổng hợp thông tin cổ phiếu |

---

### 2\. Thị trường chỉ số

Theo dõi diễn biến của các chỉ số thị trường: VNINDEX, HNX, VN30, v.v.

| Phương thức | Mô tả |
| --- | --- |
| `ohlcv()` | Điểm chỉ số lịch sử |
| `quote()` | Điểm chỉ số hiện tại |
| `summary()` | Tổng hợp chỉ số |

---

### 3\. Hợp đồng tương lai

Dữ liệu giao dịch cho thị trường phái sinh — hỗ trợ OHLCV, bảng giá, lệnh khớp và sổ lệnh.

| Phương thức | Mô tả |
| --- | --- |
| `ohlcv()` | Giá hợp đồng lịch sử |
| `quote()` | Giá hiện tại |
| `trades()` | Giao dịch chi tiết |
| `order_book()` | Cấp độ mua/bán |
| `summary()` | Thông tin hợp đồng |

---

### 4\. Chứng quyền

Dữ liệu giao dịch cho thị trường chứng quyền có bảo đảm.

| Phương thức | Mô tả |
| --- | --- |
| `ohlcv()` | Giá chứng quyền lịch sử |
| `quote()` | Giá hiện tại |
| `trades()` | Giao dịch chi tiết |
| `order_book()` | Cấp độ mua/bán |
| `summary()` | Thông tin chứng quyền |

---

### 5\. Quỹ ETF

Dữ liệu giao dịch cho các quỹ ETF — hỗ trợ giống Equity Market (đầy đủ OHLCV, dòng tiền, bảng giá, v.v.).

---

### 6\. Quỹ đầu tư mở

Theo dõi lịch sử NAV và danh mục nắm giữ của các quỹ mở.

| Phương thức | Mô tả |
| --- | --- |
| `history()` | Lịch sử NAV quỹ |
| `top_holding()` | Top cổ phiếu nắm giữ |
| `industry_holding()` | Nắm giữ theo ngành |
| `asset_holding()` | Nắm giữ theo loại tài sản |

---

### 7\. Bảng giá nhiều mã

Lấy bảng giá cho nhiều mã cổ phiếu cùng lúc — hiệu quả hơn rất nhiều so với gọi từng mã.

---

### 8\. Thị trường quốc tế (thử nghiệm)

Các domain sau đang trong giai đoạn thử nghiệm — chỉ hỗ trợ `ohlcv()` cho dữ liệu lịch sử thông qua nguồn MSN.
