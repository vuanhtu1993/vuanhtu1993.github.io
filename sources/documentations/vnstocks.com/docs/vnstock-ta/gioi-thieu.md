---
title: "Giới thiệu Vnstock TA"
source_url: "https://vnstocks.com/docs/vnstock-ta/gioi-thieu"
crawled_at: "2026-07-09T08:02:50.084Z"
---

[Agent Guide](https://github.com/vnstock-hq/vnstock-agent-guide/) [Notebook minh hoạ](https://colab.research.google.com/github/vnstock-hq/vnstock_insider_guide/blob/main/demo/2-vnstock_ta-demo.ipynb)

Khuyên dùng: Nên ưu tiên sử dụng [Agent Guide](https://vnstocks.com/onboard/agent-guide) để nạp môi trường cho AI Agent trên máy tính cục bộ. Tránh viết code thủ công hoặc dùng AI phiên bản web/Google Colab vì AI không có thông tin mới nhất về thư viện nên dễ viết sai cú pháp.

## Tổng quan

`vnstock_ta` là thư viện Python chuyên dụng cung cấp các chỉ báo kỹ thuật cho phân tích dữ liệu thị trường chứng khoán. Thư viện được thiết kế để tích hợp liền mạch với `vnstock_data`, cung cấp quy trình hoàn chỉnh từ lấy dữ liệu đến phân tích kỹ thuật.

### Đặc điểm chính

-   **Chỉ báo phong phú**: 60 chỉ báo kỹ thuật được phân loại theo 5 danh mục (Trend, Momentum, Volatility, Volume, Statistics).
-   **API thống nhất**: Giao diện đơn giản, hướng đối tượng dễ sử dụng thông qua lớp `Indicator`.
-   **Tích hợp pandas**: Hoạt động trực tiếp với DataFrame, dữ liệu trả về là Series hoặc DataFrame.
-   **Vẽ biểu đồ**: Việc vẽ biểu đồ được chuyển giao cho `vnstock_ezchart` thay vì cấu hình sẵn trong thư viện để tối ưu và đảm bảo tính nhất quán.

---

## Yêu cầu dữ liệu đầu vào

DataFrame đầu vào phải đáp ứng các yêu cầu (tương thích sẵn với `vnstock_data`):

1.  **Index**: Tốt nhất là `DatetimeIndex` (tên `'time'`).
2.  **Cột bắt buộc**: `'open'`, `'high'`, `'low'`, `'close'` (tất cả là float), `'volume'` (int).

Các chỉ báo có giá trị kỳ tính toán (period) lớn (ví dụ: SMA 50 hoặc SMA 200) sẽ có giá trị `NaN` ở đầu dữ liệu do không đủ số lượng phiên để tính toán. Đây là hiện tượng bình thường.

---

## Các nhóm chỉ báo hỗ trợ

Thư viện hỗ trợ 60 chỉ báo kỹ thuật được chia thành 5 danh mục chính:

### 1\. Trend Indicators (Chỉ báo xu hướng)

Dùng để xác định xu hướng chính của thị trường (tăng, giảm, hay đi ngang).

| Chỉ báo | Ký hiệu | Mô tả |
| --- | --- | --- |
| SMA | `sma` | Simple Moving Average (Đường trung bình động đơn giản) |
| EMA | `ema` | Exponential Moving Average (Đường trung bình động lũy thừa) |
| WMA | `wma` | Weighted Moving Average (Đường trung bình động có trọng số) |
| HMA | `hma` | Hull Moving Average (Đường trung bình động Hull) |
| SMMA | `smma` | Smoothed Moving Average (Đường trung bình động làm mượt) |
| ALMA | `alma` | Arnaud Legoux Moving Average (Đường trung bình động Arnaud Legoux) |
| VWMA | `vwma` | Volume-Weighted Moving Average (Đường trung bình động theo khối lượng) |
| ADX | `adx` | Average Directional Index (Chỉ số định hướng trung bình) |
| ICHIMOKU | `ichimoku` | Ichimoku Cloud (Hệ thống Ichimoku) |
| PSAR | `psar` | Parabolic SAR (Chỉ báo Parabolic Stop and Reverse) |
| SUPERTREND | `supertrend` | Supertrend (Chỉ báo Supertrend) |
| DM | `dm` | Directional Movement (Chỉ số chuyển động định hướng) |
| LINREG | `linreg` | Linear Regression (Hồi quy tuyến tính) |
| AROON | `aroon` | Aroon Indicator (Chỉ báo Aroon) |

### 2\. Momentum Indicators (Chỉ báo động lượng)

Dùng để đo lường tốc độ biến động giá và xác định trạng thái quá mua (overbought) hoặc quá bán (oversold).

| Chỉ báo | Ký hiệu | Mô tả |
| --- | --- | --- |
| RSI | `rsi` | Relative Strength Index (Chỉ số sức mạnh tương đối) |
| STOCH | `stoch` | Stochastic Oscillator (Chỉ báo dao động ngẫu nhiên) |
| STOCHRSI | `stochrsi` | Stochastic RSI (Chỉ báo Stochastic RSI) |
| ROC | `roc` | Rate of Change (Tốc độ thay đổi giá) |
| AO | `ao` | Awesome Oscillator (Chỉ báo dao động tuyệt vời) |
| CCI | `cci` | Commodity Channel Index (Chỉ số kênh hàng hóa) |
| WILLR | `willr` | Williams %R (Chỉ báo Williams %R) |
| TSI | `tsi` | True Strength Index (Chỉ số sức mạnh thực sự) |
| CMO | `cmo` | Chande Momentum Oscillator (Chỉ báo dao động động lượng Chande) |
| UO | `uo` | Ultimate Oscillator (Chỉ báo dao động tối thượng) |
| FISHER | `fisher` | Fisher Transform (Phép biến đổi Fisher) |
| CG | `cg` | Center of Gravity (Chỉ báo trọng tâm) |
| KST | `kst` | Know Sure Thing (Chỉ báo KST) |
| MACD | `macd` | Moving Average Convergence Divergence (Đường trung bình động hội tụ phân kỳ) |

### 3\. Volatility Indicators (Chỉ báo biến động)

Dùng để xác định mức độ dao động hoặc biên độ giá của thị trường.

| Chỉ báo | Ký hiệu | Mô tả |
| --- | --- | --- |
| BBANDS | `bbands` | Bollinger Bands (Dải Bollinger) |
| KC | `kc` | Keltner Channels (Kênh Keltner) |
| ATR | `atr` | Average True Range (Khoảng dao động thực tế trung bình) |
| STDEV | `stdev` | Standard Deviation (Độ lệch chuẩn) |
| DONCHIAN | `donchian` | Donchian Channels (Kênh Donchian) |
| MASSI | `massi` | Mass Index (Chỉ số khối lượng) |
| UI | `ui` | Ulcer Index (Chỉ số Ulcer) |
| SQUEEZE | `squeeze` | Squeeze Momentum (Chỉ báo bóp nghẹt động lượng) |
| SQUEEZE\_PRO | `squeeze_pro` | Squeeze Momentum Pro (Chỉ báo bóp nghẹt động lượng nâng cao) |
| TRUE\_RANGE | `true_range` | True Range (Khoảng dao động thực tế) |

### 4\. Volume Indicators (Chỉ báo khối lượng)

Dùng để phân tích mối tương quan giữa khối lượng giao dịch và sự thay đổi giá.

| Chỉ báo | Ký hiệu | Mô tả |
| --- | --- | --- |
| OBV | `obv` | On-Balance Volume (Khối lượng cân bằng) |
| CMF | `cmf` | Chaikin Money Flow (Dòng tiền Chaikin) |
| AD | `ad` | Accumulation/Distribution (Đường tích lũy/phân phối) |
| VP | `vp` | Volume Profile (Hồ sơ khối lượng) |
| VWAP | `vwap` | Volume Weighted Average Price (Giá trung bình gia quyền theo khối lượng) |
| PVO | `pvo` | Percentage Volume Oscillator (Chỉ báo dao động phần trăm khối lượng) |
| EFI | `efi` | Force Index (Chỉ số lực) |
| EOM | `eom` | Ease of Movement (Chỉ số di chuyển dễ dàng) |
| NVI | `nvi` | Negative Volume Index (Chỉ số khối lượng tiêu cực) |
| MFI | `mfi` | Money Flow Index (Chỉ số dòng tiền) |

### 5\. Statistics Indicators (Chỉ báo thống kê và cấu trúc)

Các công cụ tính toán thống kê và cấu trúc giá trị trung bình trên thị trường.

| Chỉ báo | Ký hiệu | Mô tả |
| --- | --- | --- |
| PIVOTS | `pivots` | Pivot Points (Điểm xoay trục) |
| MAD | `mad` | Mean Absolute Deviation (Độ lệch tuyệt đối trung bình) |
| VARIANCE | `variance` | Variance (Phương sai) |
| HL2 | `hl2` | High-Low Average (Trung bình giá Cao - Thấp) |
| HLC3 | `hlc3` | High-Low-Close Average (Trung bình giá Cao - Thấp - Đóng cửa) |
| OHLC4 | `ohlc4` | Open-High-Low-Close Average (Trung bình giá Mở - Cao - Thấp - Đóng cửa) |
| MIDPRICE | `midprice` | Midprice (Giá trung bình) |
| DECREASING | `decreasing` | Decreasing Series (Chuỗi giảm dần) |
| INCREASING | `increasing` | Increasing Series (Chuỗi tăng dần) |
