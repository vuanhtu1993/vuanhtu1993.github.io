---
title: "Dữ Liệu Cơ Bản"
source_url: "https://vnstocks.com/docs/vnstock-data/fundamental-layer-v3"
crawled_at: "2026-07-09T08:02:19.473Z"
---

[Agent Guide](https://github.com/vnstock-hq/vnstock-agent-guide/) [Notebook minh hoạ](https://colab.research.google.com/github/vnstock-hq/vnstock-agent-guide/blob/main/notebooks/01_unified_ui/03_Fundamental.ipynb)

Khuyên dùng: Nên ưu tiên sử dụng [Agent Guide](https://vnstocks.com/onboard/agent-guide) để nạp môi trường cho AI Agent trên máy tính cục bộ. Tránh viết code thủ công hoặc dùng AI phiên bản web/Google Colab vì AI không có thông tin mới nhất về thư viện nên dễ viết sai cú pháp.

## Tổng quan

`Fundamental` cung cấp dữ liệu báo cáo tài chính và chỉ số tài chính được tổng hợp, chuẩn hoá từ các nguồn công khai — phục vụ cho phân tích cơ bản doanh nghiệp. Thư viện `vnstock_data` đóng vai trò kết nối API, chuẩn hoá dữ liệu và cung cấp trải nghiệm người dùng thân thiện, dễ dàng tích hợp với AI nhờ tài liệu chuẩn mực.

## Khởi tạo

## Cấu trúc

### Tra cứu nhanh

**Hiển thị kết quả API Tree**

## Hướng dẫn chi tiết

### 1\. Báo cáo kết quả kinh doanh

Doanh thu, chi phí, lợi nhuận gộp, lợi nhuận ròng, EPS — theo **quý (Q)** hoặc **năm (Y)**.

---

### 2\. Bảng cân đối kế toán

Tài sản, nợ phải trả, vốn chủ sở hữu — theo **quý (Q)** hoặc **năm (Y)**.

**Các cột dữ liệu trả về** `date`, `total_assets`, `current_assets`, `fixed_assets`, `total_liabilities`, `current_liabilities`, `long_term_liabilities`, `equity`

---

### 3\. Báo cáo lưu chuyển tiền tệ

Dòng tiền từ hoạt động kinh doanh, đầu tư, và tài chính — theo **quý (Q)** hoặc **năm (Y)**.

**Các cột dữ liệu trả về** `date`, `operating_cash_flow`, `investing_cash_flow`, `financing_cash_flow`, `free_cash_flow`

---

### 4\. Chỉ số tài chính

Các chỉ số tài chính quan trọng: P/E, P/B, ROE, ROA, Debt/Equity, Current Ratio, v.v.

**Các cột dữ liệu trả về** `date`, `pe_ratio`, `pb_ratio`, `eps`, `roa`, `roe`, `debt_to_equity`, `current_ratio`, `quick_ratio`, `profit_margin`, `return_on_assets`, `return_on_equity`

---

### 5\. Thuyết minh BCTC

Dữ liệu thuyết minh chi tiết đi kèm báo cáo tài chính.

---

### 6\. Phân tích tài chính kết hợp

Kết hợp nhiều nguồn dữ liệu để đánh giá toàn diện một cổ phiếu.
