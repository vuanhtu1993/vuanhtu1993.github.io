---
title: "Tùy chỉnh Pipeline"
source_url: "https://vnstocks.com/docs/vnstock-pipeline/tuy-chinh-pipeline"
crawled_at: "2026-07-09T08:06:15.656Z"
---

## Tùy chỉnh pipeline

Kiến trúc mới của `vnstock_pipeline` (từ v2.3.1) cho phép bạn linh hoạt tùy biến bằng 3 cách:

1.  Tùy chỉnh qua giao diện dòng lệnh (CLI)
2.  Tùy chỉnh qua file cấu hình `pipeline.toml`
3.  Mở rộng các lớp cơ sở bằng mã Python

### 1\. Tùy chỉnh qua giao diện dòng lệnh (CLI)

Giao diện CLI cung cấp các cờ (flag) để bạn can thiệp trực tiếp vào luồng xử lý mà không cần viết code:

### 2\. Tùy chỉnh qua file cấu hình pipeline.toml

Hệ thống cho phép bạn cấu hình ghi đè định dạng lưu trữ theo từng thư mục. Ví dụ: Bạn muốn lưu tất cả mọi thứ dạng Parquet để tiết kiệm dung lượng, nhưng riêng thư mục Báo cáo tài chính (`financial`) bạn muốn xuất thẳng ra Excel để nhân viên kế toán đọc được.

Chỉ cần sửa file pipeline.toml:

### 3\. Đọc dữ liệu đã xuất

Trong phiên bản mới, khi bạn viết mã lấy dữ liệu để huấn luyện mô hình, tuyệt đối không viết cứng đường dẫn (`./data`). Hãy dùng lớp `StorageConfig`:

### 4\. Tự tạo Exporter tùy chỉnh

Nếu bạn muốn tạo một điểm kết nối đẩy dữ liệu trực tiếp lên các dịch vụ đám mây (như AWS S3) thay vì lưu tại máy tính, bạn có thể kế thừa lớp `Exporter`.
