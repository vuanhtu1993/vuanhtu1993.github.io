---
title: "Giới thiệu Vnstock Pipeline"
source_url: "https://vnstocks.com/docs/vnstock-pipeline/gioi-thieu"
crawled_at: "2026-07-09T08:06:02.214Z"
---

Giới thiệu

Vnstock Pipeline là thư viện Python cung cấp luồng xử lý dữ liệu tự động cho thị trường chứng khoán Việt Nam. Thư viện bao quát toàn bộ quy trình từ bước thu thập, xác thực, chuyển đổi cho đến xuất dữ liệu thành phẩm. Với kiến trúc lưu trữ tập trung, người dùng có thể dễ dàng quản lý khối lượng dữ liệu khổng lồ mà không cần cấu hình phức tạp hay tự viết mã Python để quản lý file.

Bạn có thể dễ dàng khởi chạy các tác vụ quản lý và thu thập dữ liệu thông qua giao diện dòng lệnh (CLI) hoặc sao chép các đoạn mã vào chương trình Python của mình. Để sử dụng thư viện, bạn cần đăng ký tối thiểu [gói tài trợ Golden](https://vnstocks.com/insiders-program) để cài đặt thư viện.

[Agent Guide](https://github.com/vnstock-hq/vnstock-agent-guide/) [Notebook minh hoạ](https://colab.research.google.com/github/vnstock-hq/vnstock_insider_guide/blob/main/demo/4-vnstock_pipeline_demo.ipynb)

Khuyên dùng: Nên ưu tiên sử dụng [Agent Guide](https://vnstocks.com/onboard/agent-guide) để nạp môi trường cho AI Agent trên máy tính cục bộ. Tránh viết code thủ công hoặc dùng AI phiên bản web như ChatGPT/Google Colab vì AI không có thông tin mới nhất về thư viện nên dễ viết sai cú pháp.

## Giới thiệu

Với cách tiếp cận “pipeline”, thư viện giúp bạn:

-   **Kiến trúc lưu trữ tập trung**: Quản lý vị trí lưu trữ, định dạng (Parquet, CSV, Excel) và cấu trúc (phẳng hoặc phân cấp) từ một file cấu hình duy nhất `pipeline.toml`.
-   **Bảo vệ cấu trúc**: Các lớp tự động kiểm tra chạy ngầm giúp phát hiện lỗi dữ liệu rỗng, gián đoạn thời gian, tự động cách ly các file làm sai lệch cấu trúc cơ sở dữ liệu vào khu vực kiểm dịch (`.tmp/.quarantine/`).
-   **Công cụ dòng lệnh CLI**: Hỗ trợ kiểm tra, di chuyển dữ liệu, chuyển đổi định dạng và dọn dẹp dữ liệu cũ hoàn toàn bằng dòng lệnh.
-   **Tác vụ dựng sẵn đa dạng**: Bao phủ đầy đủ từ dữ liệu giá (OHLCV, khớp lệnh, sổ lệnh) đến tài chính, thống kê giao dịch, dữ liệu cơ sở, tin tức và sự kiện.
-   **Tự động lập lịch và xử lý lỗi**: Điều phối tự động tải hàng loạt mã chứng khoán, có cơ chế ghi nhận mã lỗi và tải lại thông minh qua báo cáo `error_log.csv`.

Bạn có thể bắt đầu nhanh chóng bằng cách sử dụng công cụ CLI hoặc xem các [mẫu lệnh tải dữ liệu](https://vnstocks.com/vnstock-insider-api/vnstock-pipeline/mau-nhiem-vu-tai-du-lieu-thong-dung) thường dùng.

![Giao diện trang Github của thành viên gói tài trợ Silver](https://res.cloudinary.com/dv3vzmogk/image/upload/v1783584361/aha-mind/docs-crawler/vnstocks.com/silver_sponsor_github_private_repo_icn4q3.jpg)Giao diện trang Github của thành viên gói tài trợ Silver

## Hướng dẫn cài đặt

### Yêu cầu hệ thống

-   Python 3.10 trở lên
-   Các thư viện phụ thuộc: pandas, numpy, requests, duckdb

### Cài đặt

Sử dụng [chương trình cài đặt](https://vnstocks.com/onboard-member/cai-dat-go-loi) cung cấp bởi Vnstock cho từng hệ điều hành cụ thể.

## Kiến trúc tổng quan

`vnstock_pipeline` được xây dựng dựa trên kiến trúc modular phân tầng để dễ dàng bảo trì và mở rộng:

### Luồng xử lý dữ liệu

Text

```
Dữ liệu thô (API/WebSocket)
    │
    ▼
[Fetcher] → Thu thập dữ liệu (theo nhóm hoặc từng mã)
    │
    ▼
[Validator] → Kiểm tra tính toàn vẹn, bắt lỗi cấu trúc, ghi nhận cấu trúc dữ liệu
    │
    ▼
[Transformer] → Chuyển đổi, làm sạch, chống trùng lặp
    │
    ▼
[Exporter] → Kết nối tự động với `StorageConfig` -> Ghi ra Parquet/CSV/Excel
    │
    ▼
[Storage] → Thư mục lưu trữ (~/vnstock_db) & [Metadata Manager] cập nhật Catalog
```

Scheduler điều phối toàn bộ quá trình này:

-   Tự động chia luồng xử lý song song giúp tăng tốc độ thực thi cho nhiệm vụ cập nhật dữ liệu gấp nhiều lần.
-   Tự động nhận diện dữ liệu bị rỗng để bỏ qua, không làm tốn thời gian thử lại.
-   Ghi nhật ký chi tiết và xuất `error_log.csv` đối với các mã bị lỗi kết nối mạng để tự động chạy lại.

### Kiến trúc lưu trữ

Ở phiên bản mới, mọi Exporter trong thư viện đều tự động đọc cấu hình từ file `pipeline.toml` (nằm ở `~/.vnstock/config/pipeline.toml`). Bạn không cần phải tự truyền `base_path` theo cách thủ công. Hệ thống cung cấp hai chế độ tổ chức thư mục linh hoạt:

-   **Chế độ Flat (mặc định)**: Dành cho người dùng cá nhân (VD: `stock_db/ohlcv/ACB.parquet`).
-   **Chế độ Nested**: Dành cho kho dữ liệu phân cấp chuyên nghiệp (VD: `stock_db/raw/market/ohlcv/1D/equity/ACB.parquet`).

## Bản quyền dữ liệu

Công cụ **Vnstock Pipeline** tối ưu kết nối thông qua các chức năng gốc của [Vnstock Data](https://vnstocks.com/docs/vnstock-data). Tất cả dữ liệu bạn truy cập thông qua Pipeline thuộc sở hữu và chịu sự quản lý của các nguồn dữ liệu gốc. Vnstock không lưu trữ, sao chép, hay tái phân phối bất kỳ dữ liệu nào từ các nguồn gốc đó.

## Miễn trừ trách nhiệm

Chú ý

Dự án Vnstock được xây dựng và cung cấp chỉ nhằm mục đích nghiên cứu, giáo dục và sử dụng cá nhân. Dữ liệu thu được thông qua công cụ này có thể tồn tại các giới hạn nhất định như không đầy đủ, không liên tục hoặc có sai lệch so với nguồn dữ liệu chính thức.

Vnstock và tác giả không chịu trách nhiệm đối với bất kỳ thiệt hại hay tổn thất nào, bao gồm nhưng không giới hạn bởi mất mát tài chính, tổn thất cơ hội, hoặc các hậu quả phát sinh từ việc sử dụng dữ liệu.
