---
description: Quy trình làm việc và lấy dữ liệu chứng khoán với thư viện VnStocks
---

# Quy trình làm việc với VnStocks

Workflow này hướng dẫn các Sub-Agent (bao gồm cả OpenClaw, Claude, AntiGravity) cách setup và lấy dữ liệu từ thư viện phân tích chứng khoán Việt Nam `vnstock`.

## 1. Mục đích
- Tự động hóa quá trình thu thập dữ liệu lịch sử giá, báo cáo tài chính, danh sách cổ phiếu từ thị trường chứng khoán Việt Nam.
- Cung cấp bối cảnh (context) cho AI Agent trước khi tiến hành phân tích kĩ thuật hoặc cơ bản.

## 2. Các Bước Cài Đặt (Setup)

Trừ khi môi trường đã có sẵn, Agent cần chạy lệnh sau để tự cài đặt thư viện mới nhất:

```bash
# Cài đặt hoặc cập nhật vnstock lên bản mới nhất
pip install -U vnstock
```

> **Lưu ý**: `vnstock` yêu cầu Python tương đối mới (khuyên dùng Python >= 3.10) và `pandas` để xử lý dữ liệu dataframe.

## 3. Template Script Python Mẫu

Dưới đây là một script mẫu để Agent có thể tái sử dụng (hoặc tự động tạo ra file `.py` và chạy thông qua lệnh shell) nhằm lấy dữ liệu:

```python
# filename: fetch_stock_data.py
from vnstock import *
import pandas as pd

# 1. Lấy danh sách toàn bộ các mã chứng khoán trên cả 3 sàn (HOSE, HNX, UPCOM)
# Hàm này rất hữu ích để lookup danh sách ticker hợp lệ
tickers = listing_companies()
print(f"Tổng số mã chứng khoán: {len(tickers)}")

# 2. Lấy dữ liệu giá lịch sử của cổ phiếu SSI
# Tham số: symbol, start_date (YYYY-MM-DD), end_date (YYYY-MM-DD), resolution ('1D', '1W', '1M')
ssi_history = stock_historical_data("SSI", "2024-01-01", "2024-12-31", "1D")
print("\nDữ liệu giá SSI:")
print(ssi_history.head())

# 3. Lấy báo cáo tài chính (Ví dụ: Bảng Cân Đối Kế Toán của HPG)
# Tham số: symbol, report_type (BalanceSheet, IncomeStatement, CashFlow), period ('year', 'quarter')
hpg_balance_sheet = financial_report("HPG", "BalanceSheet", "quarter")
print("\nBảng Cân đối kế toán HPG:")
print(hpg_balance_sheet.head())
```

## 4. Troubleshooting (Xử lý lỗi)
- Nếu bị lỗi thiếu thư viện phụ thuộc (dependencies), Agent phải tự dùng pip để cài thêm các gói báo thiếu (như `requests`, `pandas`, `beautifulsoup4`).
- Với các tính năng nâng cao bị giới hạn tần suất (Rate limit), hãy hướng dẫn người dùng đăng ký API Key tại `vnstocks.com/login` và cấu hình biến môi trường trước khi chạy tập lệnh tiếp theo.
