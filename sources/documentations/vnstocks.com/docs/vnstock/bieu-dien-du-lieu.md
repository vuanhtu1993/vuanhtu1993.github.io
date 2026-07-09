---
title: "Biểu diễn dữ liệu trực quan"
source_url: "https://vnstocks.com/docs/vnstock/bieu-dien-du-lieu"
crawled_at: "2026-07-09T07:59:56.649Z"
---

## Sử dụng đơn giản

### Notebook minh hoạ

Bạn có thể truy cập ngay Notebook minh hoạ tính năng tại đây.

### Truy cập tính năng

Từ DataFrame, Series trả về bởi Vnstock3, bạn có thể truy cập lớp (class) hàm biểu diễn dữ liệu dưới dạng thuộc tính `.viz.gọi_tên_hàm()`. Ví dụ, cú pháp vẽ đồ thị `timeseries` cho cột `close` trong DataFrame có tên `df` như sau:

Kết quả trả về như hình bên dưới. Bạn có thể tinh chỉnh biểu đồ với các tham số được cung cấp để nhanh chóng tạo ra biểu đồ vừa đơn giản nhưng cũng đầy chuyên nghiệp để có thể chia sẻ dễ dàng.:

![Blog image](https://res.cloudinary.com/dv3vzmogk/image/upload/v1783583992/aha-mind/docs-crawler/vnstocks.com/timeseries_vnstock_ezchart_dc7ski.png)

### Xem trợ giúp nhanh chóng

**Hướng dẫn hàm timeseries**

```
Biểu diễn dữ liệu theo thời gian (timeseries). Dữ liệu cần có cột index là kiểu dữ liệu datetime.

Tham số:
  - data (pd.DataFrame hoặc pd.Series): Dữ liệu đầu vào dạng DataFrame hoặc Series.
  - title (str): Tiêu đề của biểu đồ.
  - title_fontsize (int): Cỡ chữ cho tiêu đề.
  - xlabel (str): Nhãn cho trục X.
  - ylabel (str): Nhãn cho trục Y.
  - color_palette (str): Tên của bảng màu đã được định trước hoặc danh sách các màu tùy chỉnh. Mặc định là 'vnstock'. Các bảng màu có sẵn: 'percentage', 'amount', 'category', 'trend', 'flatui', 'vnstock', 'learn_anything'. Có thể liệt kê tất cả bảng màu với Utils.brand_palettes.keys().
  - palette_shuffle (bool): Xáo trộn thứ tự màu sắc trong bảng màu, cho phép chọn màu ngẫu nhiên trong bảng màu để biểu diễn cho đến khi bạn ưng ý. Mặc định là False.
  - grid (bool): Hiển thị lưới. Nhận True để hiện thị hoặc False để ẩn lưới.
  - data_labels (bool): Hiển thị nhãn dữ liệu trên biểu đồ.
  - data_label_format (str): Định dạng cho nhãn dữ liệu. Nhận các giá trị rút gọn như 1K, 1M, 1B, 1T tương ứng với 1 ngàn, 1 triệu, 1 tỷ, 1 nghìn tỷ.
  - label_fontsize (int): Cỡ chữ cho nhãn trục X và Y.
  - legend_title (str): Tiêu đề cho chú giải.
  - show_legend (bool): Hiển thị chú giải. Nhận True để hiển thị hoặc False để ẩn chú giải.
  - series_names (list): Danh sách tên cho các dải (series) dữ liệu trong biểu đồ. Nhận giá trị là 1 danh sách (list).
  - font_name (str): Tên của font chữ muốn áp dụng.
  - figsize (tuple): Kích thước của biểu đồ, ví dụ (10, 6).
  - show_xaxis (bool): Hiển thị trục X. Nhận True để hiển thị hoặc False để ẩn trục X.
  - show_yaxis (bool): Hiển thị trục Y. Nhận True để hiển thị hoặc False để ẩn trục Y.
  - tick_labelsize (int): Cỡ chữ cho các nhãn trục.
  - xtick_format (str): Định dạng cho nhãn trục X. Ví dụ định dạng số thập phân '{:.0f}'.
  - ytick_format (str): Định dạng cho nhãn trục Y. Ví dụ định dạng phần trăm '{:.0%}'.
  - tick_rotation (int): Góc quay cho các nhãn trục.
  - xlim (tuple): Giới hạn cho trục X, ví dụ (0, 100).
  - ylim (tuple): Giới hạn cho trục Y, ví dụ (0, 100).
  - background_color (str): Màu nền cho biểu đồ.
  - bar_edge_color (str): Màu viền cho các cột (bar) trong biểu đồ.
```

## Biểu diễn xu hướng

### Timeseries

Trong đó là `df` là DataFrame dữ liệu mẫu giá cổ phiếu được gọi từ mục [Thống kê giá lịch sử](https://vnstocks.com/docs/vnstock/thong-ke-gia-lich-su).

![Blog image](https://res.cloudinary.com/dv3vzmogk/image/upload/v1783583992/aha-mind/docs-crawler/vnstocks.com/gia-dong-cua-hop-dong-tuong-lai-vn30-timeseries_vnstock_ezchart_mp3rfr.png)

### Combo chart

![Blog image](https://res.cloudinary.com/dv3vzmogk/image/upload/v1783583994/aha-mind/docs-crawler/vnstocks.com/combo_chart_gia_khoi_luong_vnstock_ezchart_agolt7.png)

## Biểu diễn số lượng

### Barplot

![Blog image](https://res.cloudinary.com/dv3vzmogk/image/upload/v1783583992/aha-mind/docs-crawler/vnstocks.com/barplot_visualize_amount_vnstock_ezchart_odrtdu.png)

### Heatmap

![Blog image](https://res.cloudinary.com/dv3vzmogk/image/upload/v1783583993/aha-mind/docs-crawler/vnstocks.com/returns_heatmap_vnstock_ezchart_rgabi6.png)

### Table

Trong nhiều trường hợp, bạn cần trình bày dữ liệu chi tiết dứoi dạng bảng bằng để có thể tiện copy và chia sẻ hoặc chèn hình ảnh thương hiệu cá nhân, loại biểu diễn dữ liệu này dành cho bạn.

![Blog image](https://res.cloudinary.com/dv3vzmogk/image/upload/v1783583994/aha-mind/docs-crawler/vnstocks.com/table_bang_du_lieu_vnstock_ezchart_mkc9jd.png)

## Biểu diễn phân phối

### Histogram

![Blog image](https://res.cloudinary.com/dv3vzmogk/image/upload/v1783583993/aha-mind/docs-crawler/vnstocks.com/Pasted_20image_2020240603004429_t8t9ji.png)

### Boxplot

![Blog image](https://res.cloudinary.com/dv3vzmogk/image/upload/v1783583992/aha-mind/docs-crawler/vnstocks.com/boxplot_vnstock_chart_hnfwni.png)

### Word Cloud

![Blog image](https://res.cloudinary.com/dv3vzmogk/image/upload/v1783583993/aha-mind/docs-crawler/vnstocks.com/wordcloud_vnstock_ezchart_lrboyy.png)

## Biểu diễn tỉ lệ

### Pie

![Blog image](https://res.cloudinary.com/dv3vzmogk/image/upload/v1783583992/aha-mind/docs-crawler/vnstocks.com/Pasted_20image_2020240603004946_gv27qq.png)

### Treemap

![Blog image](https://res.cloudinary.com/dv3vzmogk/image/upload/v1783583992/aha-mind/docs-crawler/vnstocks.com/Pasted_20image_2020240603005015_am1y3k.png)

## Biểu diễn tương quan

### Scatter plot

![Blog image](https://res.cloudinary.com/dv3vzmogk/image/upload/v1783583994/aha-mind/docs-crawler/vnstocks.com/Pasted_20image_2020240603005228_vy2v9c.png)

### Pairplot

![Blog image](https://res.cloudinary.com/dv3vzmogk/image/upload/v1783583993/aha-mind/docs-crawler/vnstocks.com/Pasted_20image_2020240603005309_fwwlgf.png)
