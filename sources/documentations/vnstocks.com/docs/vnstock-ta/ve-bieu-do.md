---
title: "Hướng dẫn vẽ biểu đồ"
source_url: "https://vnstocks.com/docs/vnstock-ta/ve-bieu-do"
crawled_at: "2026-07-09T08:03:10.344Z"
---

[Agent Guide](https://github.com/vnstock-hq/vnstock-agent-guide/) [Notebook minh hoạ](https://colab.research.google.com/github/vnstock-hq/vnstock_insider_guide/blob/main/demo/2-vnstock_ta-demo.ipynb)

Khuyên dùng: Nên ưu tiên sử dụng [Agent Guide](https://vnstocks.com/onboard/agent-guide) để nạp môi trường cho AI Agent trên máy tính cục bộ. Tránh viết code thủ công hoặc dùng AI phiên bản web/Google Colab vì AI không có thông tin mới nhất về thư viện nên dễ viết sai cú pháp.

Cảnh báo gỡ bỏ (Deprecation)

Tính năng vẽ đồ thị thông qua lớp `Plotter` của `vnstock_ta` (dựa trên `pyecharts` và `panel`) **sẽ bị gỡ bỏ** chính thức từ 31/08/2026. Để biểu diễn các minh hoạ phân tích kỹ thuật hiện đại, đẹp mắt và hỗ trợ AI Agent tối ưu, vui lòng chuyển sang sử dụng thư viện chuyên dụng **`vnstock_ezchart`**.

## Hướng dẫn chuyển đổi

### Cách cũ - Không khuyến nghị

Trong phiên bản cũ, bạn khởi tạo đối tượng `Plotter` trực tiếp từ `vnstock_ta` và gọi các hàm vẽ tích hợp:

Python

```
from vnstock_ta import Plotter

# Cách vẽ cũ - Sẽ không hoạt động sau 31/8/2026
plotter = Plotter(data=df, theme='light')
plotter.sma(length=20, title='SMA 20')
```

### Cách mới - Nên dùng

Trong phiên bản mới, `vnstock_ta` chỉ tập trung vào nhiệm vụ tính toán chỉ báo kỹ thuật hiệu năng cao, còn việc trực quan hóa dữ liệu được chuyển giao hoàn toàn cho thư viện chuyên dụng `vnstock_ezchart`.

Quy trình 3 bước vẽ biểu đồ chuẩn mới:

Python

```
from vnstock_ta import Indicator
from vnstock_ezchart import Chart

# Bước 1: Tính toán chỉ báo kỹ thuật bằng vnstock_ta
ta = Indicator(data=df)
df['SMA_20'] = ta.trend.sma(length=20)
df['RSI_14'] = ta.momentum.rsi(length=14)

# Bước 2: Định nghĩa cấu hình hiển thị (Overlay và Subplots)
overlays = [
    {"data": df['SMA_20'], "color": "#2563eb", "width": 2}
]

subplots = [
    [{"data": df['RSI_14'], "color": "#8b5cf6", "ylabel": "RSI"}]
]

# Bước 3: Vẽ biểu đồ nến thông qua Chart.candle()
fig, ax = Chart.candle(
    df, 
    title="Biểu đồ với SMA và RSI", 
    figsize=(12, 8), 
    overlays=overlays, 
    subplots=subplots
)
```

Thư viện `vnstock_ezchart` cung cấp tính năng vẽ biểu đồ tĩnh, hỗ trợ giao diện sáng/tối tự động, chèn logo thương hiệu, và xuất hình ảnh độ phân giải cao tối ưu cho luồng làm việc với AI Agent, sử dụng cho báo cáo nghiên cứu hoặc kiểm thử.
