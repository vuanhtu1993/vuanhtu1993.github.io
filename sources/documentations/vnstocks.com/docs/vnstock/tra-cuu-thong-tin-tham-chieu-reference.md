---
title: "Tra cứu thông tin tham chiếu"
source_url: "https://vnstocks.com/docs/vnstock/tra-cuu-thong-tin-tham-chieu-reference"
crawled_at: "2026-07-09T07:59:16.795Z"
---

Học sử dụng AI để Vibe Coding với Vnstock (19 bài miễn phí)

Dùng Vnstock tự tin chỉ trong 30 phútAI viết code chính xác, thấy ngay kết quả

[Xem ngay](https://course.learn-anything.vn/courses/huong-dan-vibe-coding-vnstock-chung-khoan)

[![Vnstock Logo](https://res.cloudinary.com/dv3vzmogk/image/upload/v1783583956/aha-mind/docs-crawler/vnstocks.com/image_he1lkh.png)](https://vnstocks.com/)

Cập nhật lần cuối: 20/06/2026

[Thảo luận](#comments-section)

Nhóm `Reference` cung cấp các công cụ để khám phá thị trường, từ việc liệt kê danh sách cổ phiếu, thành phần chỉ số đến việc tra cứu thông tin chi tiết của một doanh nghiệp.

[Agent Guide](https://github.com/vnstock-hq/vnstock-agent-guide/blob/main/docs/vnstock/00-unified-ui.md) [Notebook minh hoạ](https://colab.research.google.com/github/thinh-vu/vnstock/blob/main/docs/unified-ui/01_Reference.ipynb)

Khuyên dùng: Nên ưu tiên sử dụng [Agent Guide](https://vnstocks.com/onboard/agent-guide) để nạp môi trường cho AI Agent trên máy tính cục bộ. Tránh viết code thủ công hoặc dùng AI phiên bản web như ChatGPT như ChatGPT/Google Colab vì AI không có thông tin mới nhất về thư viện nên dễ viết sai cú pháp.

---

## 1\. Khởi tạo

---

## 2\. Tiện ích trợ giúp (Helpers)

Kiến trúc Unified UI cung cấp các hàm tiện ích vô cùng mạnh mẽ giúp bạn dễ dàng khám phá cấu trúc API và đọc tài liệu ngay trong môi trường code (đặc biệt hữu ích trên Jupyter/Colab).

---

## 3\. Các lớp và phương thức chi tiết

### A. Lớp `equity` (Cổ phiếu)

Cung cấp danh sách các mã cổ phiếu đang niêm yết và phân loại theo nhóm/ngành.

| Phương thức | Tham số | Mô tả |
| --- | --- | --- |
| **`list()`** | \- | Liệt kê toàn bộ mã cổ phiếu niêm yết. |
| **`list_by_industry()`** | \- | Liệt kê cổ phiếu theo ngành (ICB). |
| **`list_by_exchange()`** | \- | Liệt kê cổ phiếu theo sàn (HOSE, HNX, UPCOM). |
| **`list_by_group()`** | `group='VN30'` | Liệt kê cổ phiếu theo nhóm chỉ số/sàn. |

> \[!WARNING\] **Lưu ý về nguồn VCI**: Nguồn dữ liệu VCI (`list_by_industry`) rất đa dạng và chuyên sâu nhưng **không ổn định trên môi trường Google Colab** do các biện pháp bảo mật hạn chế bot của VCI. Nếu bạn sử dụng Colab, hệ thống sẽ tự động chuyển sang nguồn KBS.

**Dữ liệu mẫu (`list()`):**

| symbol | organ\_name |
| --- | --- |
| VCB | Ngân hàng TMCP Ngoại thương Việt Nam |
| HPG | Tập đoàn Hòa Phát |

---

### B. Lớp `index` (Chỉ số)

Quản lý danh sách các bộ chỉ số thị trường.

| Phương thức | Tham số | Mô tả |
| --- | --- | --- |
| **`list()`** | \- | Danh sách tất cả các chỉ số (VNINDEX, VN30...). |
| **`groups()`** | \- | Danh sách các nhóm chỉ số hỗ trợ. |
| **`members()`** | `symbol` | Danh sách các mã thành phần trong rổ chỉ số. |

**Dữ liệu mẫu (`list()`):**

| symbol | name | group | index\_id |
| --- | --- | --- | --- |
| VN30 | VN30 | VN30 | 5 |
| VNINDEX | VNINDEX | HOSE | 1 |

---

### C. Lớp `company` (Thông tin Doanh nghiệp)

Tra cứu hồ sơ chi tiết của một mã chứng khoán cụ thể.

| Phương thức | Tham số | Mô tả |
| --- | --- | --- |
| **`info()`** | \- | Tổng quan về doanh nghiệp (ngành, vốn hóa...). |
| **`shareholders()`** | \- | Danh sách cổ đông lớn. |
| **`officers()`** | \- | Ban lãnh đạo công ty. |
| **`subsidiaries()`** | \- | Các công ty con, công ty liên kết. |
| **`ownership()`** | \- | Cơ cấu sở hữu. |
| **`insider_trading()`** | \- | Lịch sử giao dịch nội bộ. |
| **`capital_history()`** | \- | Lịch sử thay đổi vốn. |
| **`news()`** | \- | Tin tức liên quan. |
| **`events()`** | \- | Các sự kiện doanh nghiệp (Cổ tức, đại hội...). |

---

### D. Các nhóm tài sản khác

-   **`etf.list()`**: Danh sách các chứng chỉ quỹ ETF.
-   **`futures.list()`**: Danh sách hợp đồng tương lai.
-   **`warrant.list()`**: Danh sách chứng quyền.
-   **`bond.list()`**: Danh sách trái phiếu doanh nghiệp & chính phủ.
-   **`fund.list()`**: Danh sách các quỹ mở (Nguồn FMarket).

---

## 4\. Tìm kiếm

Hỗ trợ tìm kiếm mã chứng khoán và thông tin tài sản toàn cầu.

| Phương thức | Tham số | Mô tả |
| --- | --- | --- |
| **`symbol()`** | `query` | Tìm kiếm mã chứng khoán theo từ khóa. |
| **`info()`** | `query` | Tìm kiếm thông tin chi tiết tài sản. |

[

Bài trước

Lịch sử phiên bản

](https://vnstocks.com/docs/vnstock-insider-api/lich-su-phien-ban)[

Bài sau

Dữ liệu Thị trường

](https://vnstocks.com/docs/vnstock/du-lieu-thi-truong-market-data)

### Thảo luận

Chưa có bình luận. Hãy là người đầu tiên!

Vui lòng đăng nhập bằng Google để thảo luận.
