---
title: "Hướng dẫn các bước sử dụng"
source_url: "https://vnstocks.com/docs/vnstock-ta/cac-buoc-su-dung"
crawled_at: "2026-07-09T08:02:56.720Z"
---

Thành công

Để sử dụng thư viện Vnstock TA, bạn cần tham gia tối thiểu **[gói tài trợ Silver](https://vnstocks.com/insiders-program#tiers)**. Sau khi đăng ký tài trợ thành công trên website, hệ thống sẽ tự động phân quyền tài khoản của bạn để cài đặt và sử dụng thư viện thông qua mã bản quyền (API Key) được cung cấp.

[Agent Guide](https://github.com/vnstock-hq/vnstock-agent-guide/) [Notebook minh hoạ](https://colab.research.google.com/github/vnstock-hq/vnstock_insider_guide/blob/main/demo/2-vnstock_ta-demo.ipynb)

Khuyên dùng: Nên ưu tiên sử dụng [Agent Guide](https://vnstocks.com/onboard/agent-guide) để nạp môi trường cho AI Agent trên máy tính cục bộ. Tránh viết code thủ công hoặc dùng AI phiên bản web/Google Colab vì AI không có thông tin mới nhất về thư viện nên dễ viết sai cú pháp.

## Cài đặt

Các gói thư viện trong hệ sinh thái Vnstock được cài đặt **chung** thông qua chương trình cài đặt của Vnstock. Để cài đặt và kích hoạt, vui lòng tham khảo hướng dẫn chi tiết tại:

## 1\. Chuẩn bị dữ liệu

Bạn cần lấy dữ liệu giá dưới dạng pandas DataFrame và thiết lập cột thời gian làm index:

Python

```
from vnstock_data import Market

# Khởi tạo đối tượng Market
m = Market()

# Lấy dữ liệu 365 phiên giao dịch gần nhất của VCB
df = m.equity("VCB").ohlcv(length=365, interval="1D")
df = df.set_index('time')
```

## 2\. Khởi tạo đối tượng Indicator và tính toán chỉ báo

Sau khi nạp dữ liệu, bạn truyền DataFrame vào class `Indicator` để tính toán chỉ báo. Có hai cách để gọi các hàm chỉ báo:

Python

```
from vnstock_ta import Indicator

# Khởi tạo class Indicator
ta = Indicator(data=df)

# Cách 1: Gọi thông qua thuộc tính danh mục tương ứng (Khuyến nghị)
sma_20 = ta.trend.sma(length=20)
rsi_14 = ta.momentum.rsi(length=14)
atr_14 = ta.volatility.atr(length=14)
obv = ta.volume.obv()
hlc3 = ta.statistics.hlc3()

# Cách 2: Gọi trực tiếp (Khả năng tương thích ngược)
macd = ta.macd(fast=12, slow=26, signal=9)
```

Kết quả trả về của các chỉ báo thường là một đối tượng `pandas.Series` (ví dụ như `sma`, `rsi`, `atr`) hoặc một đối tượng `pandas.DataFrame` đối với các chỉ báo có nhiều đường giá trị đầu ra (ví dụ như `macd`, `bbands`, `supertrend`).

## 3\. Vẽ đồ thị trực quan hóa

Để vẽ đồ thị phân tích kỹ thuật với dữ liệu chỉ báo đã tính toán, vui lòng xem hướng dẫn chi tiết tại mục tiếp theo **[Hướng dẫn vẽ biểu đồ](https://vnstocks.com/docs/vnstock-ta/ve-bieu-do)** sử dụng thư viện `vnstock_ezchart`.
