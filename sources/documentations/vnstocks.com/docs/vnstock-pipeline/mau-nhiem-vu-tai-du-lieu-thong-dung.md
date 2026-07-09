---
title: "Câu Lệnh Mẫu"
source_url: "https://vnstocks.com/docs/vnstock-pipeline/mau-nhiem-vu-tai-du-lieu-thong-dung"
crawled_at: "2026-07-09T08:06:09.109Z"
---

## Giới thiệu

Trang này cung cấp các lệnh và đoạn mã mẫu sẵn sàng sử dụng cho các tác vụ thường gặp. Kể từ phiên bản v2.3.1, `vnstock_pipeline` cung cấp giao diện dòng lệnh (CLI) mạnh mẽ, thay thế cho việc viết script Python khởi tạo các lớp dữ liệu thủ công như trước đây.

---

## 1\. Dữ liệu Giá Lịch Sử (OHLCV)

Tải dữ liệu giá cổ phiếu theo chu kỳ ngày kết thúc phiên. Dữ liệu bao gồm giá mở, cao, thấp, đóng, và khối lượng giao dịch.

### Bằng Lệnh CLI

Lấy dữ liệu OHLCV hàng ngày (EOD) cho toàn bộ rổ cổ phiếu (ví dụ: HOSE).

---

## 2\. Dữ liệu Khớp Lệnh (Trades)

Dữ liệu giao dịch thực tế xảy ra trong phiên giao dịch: từng lệnh khớp, thời gian, giá, khối lượng (dữ liệu Tick).

### Bằng Lệnh CLI

Lưu dữ liệu khớp lệnh bằng định dạng Parquet để tối ưu dung lượng.

---

## 3\. Bảng Giá (Quote)

Trạng thái giá của tất cả mã tại thời điểm hiện tại.

### Bằng Lệnh CLI

---

## 4\. Dữ liệu Báo Cáo Tài Chính & Thống Kê

Lấy BCTC hoặc dòng tiền tổ chức (khối ngoại, tự doanh).

### Bằng Lệnh CLI

---

## 5\. Mẫu script điều phối tự động

Khi bạn muốn kết hợp chạy tất cả các luồng dữ liệu (OHLCV, Trades, Financial, News) theo thứ tự hằng ngày một cách tự động, an toàn và không bị dừng tiến trình khi một phần tử gặp lỗi. Hãy lưu đoạn mã sau thành `sync_market_data.py`.
