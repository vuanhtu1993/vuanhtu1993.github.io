---
title: "Dữ Liệu Tham Chiếu"
source_url: "https://vnstocks.com/docs/vnstock-data/reference-layer-v3"
crawled_at: "2026-07-09T08:02:04.978Z"
---

[Agent Guide](https://github.com/vnstock-hq/vnstock-agent-guide/) [Notebook minh hoạ](https://colab.research.google.com/github/vnstock-hq/vnstock-agent-guide/blob/main/notebooks/01_unified_ui/01_Reference.ipynb)

Khuyên dùng: Nên ưu tiên sử dụng [Agent Guide](https://vnstocks.com/onboard/agent-guide) để nạp môi trường cho AI Agent trên máy tính cục bộ. Tránh viết code thủ công hoặc dùng AI phiên bản web/Google Colab vì AI không có thông tin mới nhất về thư viện nên dễ viết sai cú pháp.

## Tổng quan

**Reference Layer** cung cấp thông tin nền tảng, tĩnh về các sản phẩm tài chính — công ty, chỉ số, ngành, danh sách symbol, ETF, trái phiếu, sự kiện, v.v. Đây là dữ liệu **không thay đổi thường xuyên** và được sử dụng để **tra cứu (lookup)** hay làm **dữ liệu gốc (master data)**.

## Khởi tạo

## Cấu trúc

### Tra cứu nhanh

**Hiển thị kết quả API Tree**

## Hướng dẫn chi tiết

### 1\. Thông tin công ty

Truy xuất thông tin tổng quan, cổ đông, ban lãnh đạo, công ty con, tin tức, sự kiện và tỷ lệ ký quỹ của một mã cổ phiếu cụ thể.

| Phương thức | Mô tả |
| --- | --- |
| `info()` | Thông tin tổng quan công ty |
| `shareholders()` | Danh sách cổ đông chính |
| `officers()` | Danh sách ban lãnh đạo |
| `subsidiaries()` | Danh sách công ty con |
| `news()` | Tin tức công ty |
| `events()` | Sự kiện công ty |
| `margin_ratio()` | Tỷ lệ ký quỹ qua các công ty chứng khoán |

---

### 2\. Danh sách cổ phiếu

Tra cứu toàn bộ danh sách cổ phiếu niêm yết, lọc theo nhóm chỉ số, theo sàn giao dịch hoặc theo ngành ICB.

| Phương thức | Tham số | Mô tả |
| --- | --- | --- |
| `list()` | — | Toàn bộ danh sách cổ phiếu (1700+ mã) |
| `list_by_group()` | `group` | Cổ phiếu theo nhóm (VN30, HOSE...) |
| `list_by_exchange()` | `exchange` | Cổ phiếu theo sàn (HSX, HNX...) |
| `list_by_industry()` | — | Cổ phiếu theo ngành ICB |

---

### 3\. Danh sách chỉ số

Liệt kê toàn bộ chỉ số thị trường, các nhóm chỉ số, và thành phần cổ phiếu trong từng chỉ số.

| Phương thức | Tham số | Mô tả |
| --- | --- | --- |
| `list()` | — | Toàn bộ chỉ số kèm metadata |
| `groups()` | — | Liệt kê các nhóm chỉ số |
| `members()` | `group` | Thành phần cổ phiếu của chỉ số |
| `list_by_group()` | `group` | Chỉ số theo nhóm |

---

### 4\. Ngành kinh tế

Tra cứu hệ thống phân ngành ICB và danh sách cổ phiếu thuộc từng ngành.

| Phương thức | Mô tả |
| --- | --- |
| `list()` | Toàn bộ danh sách ngành ICB |
| `sectors()` | Phân loại cổ phiếu theo ngành |

---

### 5\. Quỹ đầu tư mở

Tra cứu danh sách tất cả quỹ đầu tư mở (chứng chỉ quỹ) trên thị trường.

---

### 6\. Quỹ ETF

Tra cứu danh sách tất cả quỹ ETF đang niêm yết.

---

### 7\. Trái phiếu

Tra cứu danh sách trái phiếu theo loại: tất cả, doanh nghiệp, hoặc chính phủ.

| Phương thức | Tham số | Mô tả |
| --- | --- | --- |
| `list()` | `bond_type` | `'all'`, `'corporate'`, `'government'` |

---

### 8\. Sự kiện thị trường

Tra cứu lịch sự kiện thị trường: cổ tức, ĐHCĐ, IPO, giao dịch nội bộ và các sự kiện đặc biệt.

| Phương thức | Tham số | Mô tả |
| --- | --- | --- |
| `calendar()` | `start`, `end`, `event_type` | Lịch sự kiện (cổ tức, ĐHCĐ, IPO...) |
| `market()` | `start`, `end`, `event_type` | Sự kiện thị trường (nghỉ lễ, sự cố...) |

**Giá trị `event_type` hỗ trợ cho `calendar()`:**

-   `'dividend'` — Cổ tức, phát hành cổ phiếu
-   `'insider'` — Giao dịch nội bộ
-   `'agm'` — Đại hội cổ đông
-   `'others'` — Biến động khác

---

### 9\. Tìm kiếm chứng khoán quốc tế

Tìm kiếm symbol để tra cứu dữ liệu chứng khoán quốc tế từ MSN — cổ phiếu, crypto, forex, chỉ số.

| Phương thức | Tham số | Mô tả |
| --- | --- | --- |
| `symbol()` | `query`, `locale`, `limit` | Tìm kiếm symbol toàn cục |

---

### 10\. Hợp đồng tương lai

Tra cứu danh sách và thông tin chi tiết hợp đồng tương lai.

---

### 11\. Chứng quyền

Tra cứu danh sách và thông tin chi tiết chứng quyền có bảo đảm.
