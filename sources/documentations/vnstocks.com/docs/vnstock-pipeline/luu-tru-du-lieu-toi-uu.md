---
title: "Lưu trữ dữ liệu tối ưu"
source_url: "https://vnstocks.com/docs/vnstock-pipeline/luu-tru-du-lieu-toi-uu"
crawled_at: "2026-07-09T08:06:28.948Z"
---

## Giới thiệu

Kể từ phiên bản v2.3.1, hệ thống lưu trữ của `vnstock_pipeline` đã được tái thiết kế hoàn toàn với cơ chế lưu trữ tập trung. Bạn không còn phải truyền thủ công biến `BASE_DATA_DIR` hay lo lắng về việc dữ liệu bị phân mảnh ở nhiều nơi. Hệ thống tự động quản lý vị trí, cấu trúc thư mục, định dạng file và cách ly dữ liệu lỗi.

## Kiến trúc lưu trữ tập trung (pipeline.toml)

Tất cả thông số CSDL được quản lý tự động thông qua một file duy nhất:

-   **Mac/Linux:** `~/.vnstock/config/pipeline.toml`
-   **Windows:** `%USERPROFILE%\.vnstock\config\pipeline.toml`

### Cấu trúc thư mục linh hoạt

Hệ thống hiện tại hỗ trợ hai chế độ tổ chức thư mục linh hoạt:

-   **Chế độ Flat (mặc định)**: Dành cho người dùng cá nhân, lược bỏ các cấp thư mục thừa để dễ dàng truy cập trực tiếp các file `.parquet` hay `.csv`.
    
-   **Chế độ Nested**: Dành cho các hệ thống kho dữ liệu lớn, tổ chức chặt chẽ theo từng lớp siêu dữ liệu.
    

---

## Quản trị lưu trữ bằng giao diện dòng lệnh (CLI)

Giao diện dòng lệnh giúp bạn dễ dàng tùy biến dữ liệu mà không cần viết các kịch bản Python phức tạp.

### 1\. Thay đổi cấu hình cơ bản

### 2\. Dọn dẹp và kiểm soát chất lượng dữ liệu

Để tiết kiệm dung lượng ổ cứng cho máy chủ VPS và đảm bảo dữ liệu chạy mô hình là chính xác:

---

## Tính năng bảo vệ cấu trúc dữ liệu

Khi API nguồn có những sự cố thay đổi cấu trúc bảng, thêm cột rác hoặc thiếu cột quan trọng, hệ thống tự động:

1.  **Phát hiện sai lệch cấu trúc**: Tự động so sánh cấu trúc với cấu trúc chuẩn ban đầu.
2.  **Cách ly dữ liệu lỗi**: Đẩy các file gây phá vỡ cấu trúc vào thư mục `.tmp/.quarantine/` thay vì ghi đè làm hỏng cơ sở dữ liệu gốc của bạn. Cung cấp file `.diff.json` giải thích nguyên nhân lỗi.
3.  Các file cách ly tự động bị dọn dẹp sau 14 ngày.

**Kiểm tra dữ liệu cách ly:**

---

## Di chuyển dữ liệu cũ

Nếu bạn có một thư mục dữ liệu tự thu thập từ bản `vnstock_pipeline` cũ, bạn không cần phải xóa đi chạy lại từ đầu. Hệ thống cung cấp công cụ tự động dọn dẹp và đưa nó vào kho lưu trữ mới.

> **Lợi ích của việc sử dụng Parquet so với CSV:**
> 
> 1.  **Tiết kiệm dung lượng**: Dữ liệu được nén hiệu quả, giảm tới 75% dung lượng.
> 2.  **Tốc độ xử lý**: Tối ưu tốc độ đọc/ghi siêu tốc qua thư viện `pyarrow`.
> 3.  **Ghi thêm dữ liệu thông minh**: Ghi đè hoặc chèn dòng dữ liệu liên tục không làm phá vỡ file, hỗ trợ truy vấn lọc cột nhanh chóng.
