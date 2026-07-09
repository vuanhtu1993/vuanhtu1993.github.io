---
title: "Dữ Liệu Vĩ Mô & Hàng Hóa"
source_url: "https://vnstocks.com/docs/vnstock-data/macro-layer-v3"
crawled_at: "2026-07-09T08:02:26.116Z"
---

[Agent Guide](https://github.com/vnstock-hq/vnstock-agent-guide/) [Notebook minh hoạ](https://colab.research.google.com/github/vnstock-hq/vnstock-agent-guide/blob/main/notebooks/01_unified_ui/05_Macro.ipynb)

Khuyên dùng: Nên ưu tiên sử dụng [Agent Guide](https://vnstocks.com/onboard/agent-guide) để nạp môi trường cho AI Agent trên máy tính cục bộ. Tránh viết code thủ công hoặc dùng AI phiên bản web/Google Colab vì AI không có thông tin mới nhất về thư viện nên dễ viết sai cú pháp.

## Tổng quan

**Macro Layer** cung cấp dữ liệu kinh tế vĩ mô, tiền tệ và giá cả hàng hóa — phục vụ cho phân tích tác động của yếu tố kinh tế đến thị trường, trading danh mục hàng hóa, quản lý rủi ro tiền tệ và dự báo xu hướng kinh tế.

## Khởi tạo

## Cấu trúc

## Hướng dẫn chi tiết

### 1\. Kinh tế Việt Nam

Dữ liệu kinh tế Việt Nam theo quý/năm: GDP, CPI, FDI, xuất nhập khẩu, sản xuất công nghiệp, bán lẻ, cung tiền, dân số & lao động.

| Phương thức | Mô tả |
| --- | --- |
| `gdp()` | Tăng trưởng GDP |
| `cpi()` | Chỉ số giá tiêu dùng |
| `industry_prod()` | Sản xuất công nghiệp |
| `import_export()` | Xuất nhập khẩu |
| `retail()` | Bán lẻ |
| `fdi()` | Đầu tư trực tiếp nước ngoài |
| `money_supply()` | Cung tiền |
| `population_labor()` | Dân số & lao động |

**Tham số chung:**

-   `start` — Mốc bắt đầu (VD: `"2020-01"`)
-   `end` — Mốc kết thúc (VD: `"2026-03"`)
-   `period` — `"quarter"` (mặc định), `"month"` hoặc `"year"`
-   `length` — Số kỳ gần nhất (VD: `length=12` lấy 12 tháng gần nhất)

---

### 2\. Tiền tệ & lãi suất

Tỷ giá hối đoái liên ngân hàng và lãi suất huy động/cho vay.

| Phương thức | Tham số riêng | Mô tả |
| --- | --- | --- |
| `exchange_rate()` | `period`, `length` | Tỷ giá hối đoái |
| `interest_rate()` | `period`, `format`, `length` | Lãi suất |

**Lưu ý:**

-   `period` — `"day"` (mặc định), `"month"`, `"quarter"`
-   `format` — `"pivot"` (mặc định) hoặc `"long"`

---

### 3\. Giá cả hàng hóa

Giá hàng hóa trong nước và quốc tế: vàng, dầu, thép, nông sản, thực phẩm.

| Phương thức | Tham số `market` | Mô tả |
| --- | --- | --- |
| `gold()` | `"VN"` / `"GLOBAL"` | Giá vàng |
| `gas()` | `"VN"` / `"GLOBAL"` | Giá xăng dầu / khí |
| `oil_crude()` | — | Giá dầu thô WTI & Brent |
| `coke()` | — | Giá than cốc |
| `steel()` | `"VN"` / `"GLOBAL"` | Giá thép |
| `iron_ore()` | — | Giá quặng sắt |
| `fertilizer_ure()` | — | Giá phân URE |
| `soybean()` | — | Giá đậu tương |
| `corn()` | — | Giá ngô |
| `sugar()` | — | Giá đường |
| `pork()` | `"VN"` / `"CHINA"` | Giá thịt lợn hơi |
