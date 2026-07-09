---
title: "Toàn bộ chỉ báo kỹ thuật"
source_url: "https://vnstocks.com/docs/vnstock-ta/chi-bao-ky-thuat"
crawled_at: "2026-07-09T08:03:03.562Z"
---

[Agent Guide](https://github.com/vnstock-hq/vnstock-agent-guide/) [Notebook minh hoạ](https://colab.research.google.com/github/vnstock-hq/vnstock_insider_guide/blob/main/demo/2-vnstock_ta-demo.ipynb)

Khuyên dùng: Nên ưu tiên sử dụng [Agent Guide](https://vnstocks.com/onboard/agent-guide) để nạp môi trường cho AI Agent trên máy tính cục bộ. Tránh viết code thủ công hoặc dùng AI phiên bản web/Google Colab vì AI không có thông tin mới nhất về thư viện nên dễ viết sai cú pháp.

Tài liệu này cung cấp danh sách đầy đủ 60 chỉ báo kỹ thuật được tích hợp trong thư viện `vnstock_ta`, chia thành 5 danh mục chính: Trend, Momentum, Volatility, Volume, và Statistics. Động cơ tính toán được cung cấp bởi `pta_reload` cho độ chính xác và hiệu suất cao.

## Cách gọi chỉ báo

Tất cả các chỉ báo đều được truy cập thông qua lớp `Indicator`:

Bạn có thể gọi chỉ báo qua thuộc tính danh mục tương ứng:

-   `ta.trend.[method]()`
-   `ta.momentum.[method]()`
-   `ta.volatility.[method]()`
-   `ta.volume.[method]()`
-   `ta.statistics.[method]()`

---

## Chỉ báo xu hướng - Trend Indicators

### sma - Simple Moving Average

**Mô tả**: Tính toán chỉ báo Simple Moving Average (Đường trung bình động đơn giản).

**Cách gọi**:

---

### ema - Exponential Moving Average

**Mô tả**: Tính toán chỉ báo Exponential Moving Average (Đường trung bình động lũy thừa).

**Cách gọi**:

---

### wma - Weighted Moving Average

**Mô tả**: Tính toán chỉ báo Weighted Moving Average (Đường trung bình động có trọng số).

**Cách gọi**:

---

### hma - Hull Moving Average

**Mô tả**: Tính toán chỉ báo Hull Moving Average (Đường trung bình động Hull).

**Cách gọi**:

---

### smma - Smoothed Moving Average

**Mô tả**: Tính toán chỉ báo Smoothed Moving Average (Đường trung bình động làm mượt).

**Cách gọi**:

---

### alma - Arnaud Legoux Moving Average

**Mô tả**: Tính toán chỉ báo Arnaud Legoux Moving Average (Đường trung bình động Arnaud Legoux).

**Cách gọi**:

---

### vwma - Volume-Weighted Moving Average

**Mô tả**: Tính toán chỉ báo Volume-Weighted Moving Average (Đường trung bình động theo khối lượng).

**Cách gọi**:

---

### adx - Average Directional Index

**Mô tả**: Tính toán chỉ báo Average Directional Index (Chỉ số định hướng trung bình).

**Cách gọi**:

---

### ichimoku - Ichimoku Cloud

**Mô tả**: Tính toán hệ thống chỉ báo Ichimoku Cloud.

**Cách gọi**:

---

### psar - Parabolic SAR

**Mô tả**: Tính toán chỉ báo Parabolic SAR (Stop and Reverse).

**Cách gọi**:

---

### supertrend - Supertrend

**Mô tả**: Tính toán chỉ báo Supertrend để xác định xu hướng và các mức trailing stop loss.

**Cách gọi**:

---

### dm - Directional Movement

**Mô tả**: Tính toán chỉ báo chuyển động định hướng Directional Movement.

**Cách gọi**:

---

### linreg - Linear Regression

**Mô tả**: Tính toán chỉ báo Hồi quy tuyến tính Linear Regression.

**Cách gọi**:

---

### aroon - Aroon Indicator

**Mô tả**: Tính toán chỉ báo xu hướng Aroon.

**Cách gọi**:

---

## Chỉ báo động lượng - Momentum Indicators

### rsi - Relative Strength Index

**Mô tả**: Tính toán chỉ số sức mạnh tương đối Relative Strength Index.

**Cách gọi**:

---

### stoch - Stochastic Oscillator

**Mô tả**: Tính toán chỉ báo dao động ngẫu nhiên Stochastic Oscillator.

**Cách gọi**:

---

### stochrsi - Stochastic RSI

**Mô tả**: Tính toán chỉ báo Stochastic RSI.

**Cách gọi**:

---

### roc - Rate of Change

**Mô tả**: Tính toán tỷ lệ thay đổi giá Rate of Change.

**Cách gọi**:

---

### ao - Awesome Oscillator

**Mô tả**: Tính toán chỉ báo dao động tuyệt vời Awesome Oscillator.

**Cách gọi**:

---

### cci - Commodity Channel Index

**Mô tả**: Tính toán chỉ số kênh hàng hóa Commodity Channel Index.

**Cách gọi**:

---

### willr - Williams %R

**Mô tả**: Tính toán chỉ báo kỹ thuật Williams %R.

**Cách gọi**:

---

### tsi - True Strength Index

**Mô tả**: Tính toán chỉ số sức mạnh thực sự True Strength Index.

**Cách gọi**:

---

### cmo - Chande Momentum Oscillator

**Mô tả**: Tính toán chỉ báo dao động động lượng Chande Momentum Oscillator.

**Cách gọi**:

---

### uo - Ultimate Oscillator

**Mô tả**: Tính toán chỉ báo dao động tối thượng Ultimate Oscillator.

**Cách gọi**:

---

### fisher - Fisher Transform

**Mô tả**: Tính toán chỉ báo Phép biến đổi Fisher.

**Cách gọi**:

---

### cg - Center of Gravity

**Mô tả**: Tính toán chỉ báo trọng tâm Center of Gravity.

**Cách gọi**:

---

### kst - Know Sure Thing

**Mô tả**: Tính toán chỉ báo động lượng Know Sure Thing.

**Cách gọi**:

---

### macd - Moving Average Convergence Divergence

**Mô tả**: Tính toán đường trung bình động hội tụ phân kỳ Moving Average Convergence Divergence.

**Cách gọi**:

---

## Chỉ báo biến động - Volatility Indicators

### bbands - Bollinger Bands

**Mô tả**: Tính toán chỉ báo dải Bollinger Bands.

**Cách gọi**:

---

### kc - Keltner Channels

**Mô tả**: Tính toán chỉ báo kênh Keltner Channels.

**Cách gọi**:

---

### atr - Average True Range

**Mô tả**: Tính toán khoảng dao động thực tế trung bình Average True Range.

**Cách gọi**:

---

### stdev - Standard Deviation

**Mô tả**: Tính toán độ lệch chuẩn Standard Deviation.

**Cách gọi**:

---

### donchian - Donchian Channels

**Mô tả**: Tính toán chỉ báo kênh Donchian Channels.

**Cách gọi**:

---

### massi - Mass Index

**Mô tả**: Tính toán chỉ số Mass Index để dự đoán đảo chiều.

**Cách gọi**:

---

### ui - Ulcer Index

**Mô tả**: Tính toán chỉ số giảm thiểu rủi ro Ulcer Index.

**Cách gọi**:

---

### squeeze - Squeeze Momentum

**Mô tả**: Tính toán chỉ báo bóp nghẹt động lượng Squeeze Momentum (kết hợp Bollinger Bands và Keltner Channels).

**Cách gọi**:

---

### squeeze\_pro - Squeeze Momentum Pro

**Mô tả**: Tính toán chỉ báo bóp nghẹt động lượng nâng cao Squeeze Momentum Pro.

**Cách gọi**:

---

### true\_range - True Range

**Mô tả**: Tính toán khoảng dao động thực tế True Range.

**Cách gọi**:

---

## Chỉ báo khối lượng - Volume Indicators

### obv - On-Balance Volume

**Mô tả**: Tính toán chỉ báo khối lượng cân bằng On-Balance Volume.

**Cách gọi**:

---

### cmf - Chaikin Money Flow

**Mô tả**: Tính toán chỉ báo dòng tiền Chaikin Money Flow.

**Cách gọi**:

---

### ad - Accumulation/Distribution

**Mô tả**: Tính toán đường tích lũy/phân phối Accumulation/Distribution.

**Cách gọi**:

---

### vp - Volume Profile

**Mô tả**: Tính toán chỉ báo hồ sơ khối lượng Volume Profile.

**Cách gọi**:

---

### vwap - Volume Weighted Average Price

**Mô tả**: Tính toán giá trung bình gia quyền theo khối lượng Volume Weighted Average Price.

**Cách gọi**:

---

### pvo - Percentage Volume Oscillator

**Mô tả**: Tính toán chỉ báo dao động phần trăm khối lượng Percentage Volume Oscillator.

**Cách gọi**:

---

### efi - Force Index

**Mô tả**: Tính toán chỉ báo lực Force Index.

**Cách gọi**:

---

### eom - Ease of Movement

**Mô tả**: Tính toán chỉ báo di chuyển dễ dàng Ease of Movement.

**Cách gọi**:

---

### nvi - Negative Volume Index

**Mô tả**: Tính toán chỉ số khối lượng tiêu cực Negative Volume Index.

**Cách gọi**:

---

### mfi - Money Flow Index

**Mô tả**: Tính toán chỉ số dòng tiền Money Flow Index.

**Cách gọi**:

---

## Chỉ báo thống kê và cấu trúc - Statistics Indicators

### pivots - Pivot Points

**Mô tả**: Tính toán các điểm xoay trục Pivot Points.

**Cách gọi**:

---

### mad - Mean Absolute Deviation

**Mô tả**: Tính toán độ lệch tuyệt đối trung bình Mean Absolute Deviation.

**Cách gọi**:

---

### variance - Variance

**Mô tả**: Tính toán phương sai Variance của chuỗi dữ liệu.

**Cách gọi**:

---

### hl2 - High-Low Average

**Mô tả**: Tính toán giá trung bình Cao - Thấp.

**Cách gọi**:

---

### hlc3 - High-Low-Close Average

**Mô tả**: Tính toán giá trung bình Cao - Thấp - Đóng cửa.

**Cách gọi**:

---

### ohlc4 - Open-High-Low-Close Average

**Mô tả**: Tính toán giá trung bình Mở - Cao - Thấp - Đóng cửa.

**Cách gọi**:

---

### midprice - Midprice

**Mô tả**: Tính toán chỉ báo giá trung bình Midprice.

**Cách gọi**:

---

### decreasing - Decreasing Series

**Mô tả**: Xác định chuỗi giá trị giảm dần.

**Cách gọi**:

---

### increasing - Increasing Series

**Mô tả**: Xác định chuỗi giá trị tăng dần.

**Cách gọi**:
