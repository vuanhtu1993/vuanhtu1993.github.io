---
title: "Kết nối dữ liệu realtime"
source_url: "https://vnstocks.com/docs/vnstock-pipeline/ket-noi-du-lieu-realtime"
crawled_at: "2026-07-09T08:06:35.708Z"
---

## Giới thiệu

Vnstock Pipeline cung cấp khả năng kết nối và thu thập dữ liệu thị trường chứng khoán theo thời gian thực thông qua giao thức [WebSocket](https://vnstocks.com/blog/websocket-la-gi-giao-thuc-truyen-tai-du-lieu-chung-khoan). Tính năng này được thiết kế để đáp ứng nhu cầu theo dõi và phân tích dữ liệu thị trường một cách liên tục và tự động.

### Tính năng chính

-   **Kết nối thời gian thực**: Nhận dữ liệu thị trường ngay lập tức qua WebSocket.
-   **Quản lý phiên tự động**: Tự động kết nối và ngắt kết nối theo lịch giao dịch.
-   **Cấu trúc dữ liệu chuẩn hóa**: Hỗ trợ xuất dữ liệu với cấu trúc được lấy cảm hứng từ chuẩn FIX/Bloomberg (tùy chọn `naming="standard"`).
-   **Xử lý lỗi thông minh**: Tự động phục hồi kết nối và ghi nhật ký chi tiết.

## Yêu cầu hệ thống

-   Python 3.10 trở lên.
-   Gói tài trợ Golden của vnstock.
-   Kết nối internet ổn định.

Tính năng kết nối dữ liệu realtime chỉ dành cho người dùng gói tài trợ Golden. Vui lòng tham khảo [hướng dẫn tài trợ](https://vnstocks.com/insiders-program#tiers) để biết thêm chi tiết.

## WebSocket truyền dữ liệu thời gian thực

Cấu trúc dữ liệu trả về từ WebSocket trước đây có một số hạn chế về tính đồng nhất trong chuẩn đặt tên. Bản nâng cấp mới giải quyết vấn đề này bằng việc đưa vào tham số `naming`:

-   Đồng nhất tất cả các key về dạng `snake_case` chuẩn.
-   Loại bỏ các trường viết tắt khó hiểu, chuẩn hóa hậu tố giá (`_price`), khối lượng (`_volume`) và giá trị (`_value`).
-   Với sổ lệnh cổ phiếu, sử dụng trực tiếp `bid_price_1`, `ask_price_1` thay vì phải tự lọc giá trị theo cột `side` và `price_1`.

### Cách kích hoạt chuẩn đặt tên mới

Chỉ cần truyền tham số `naming="standard"` khi khởi tạo `CSVProcessor`.

**Ví dụ một số thay đổi nếu bạn dùng `standard`:**

-   Thay vì đọc cột `timestamp`, hãy đọc cột `time`.
-   Thay vì đọc `last_price` và `last_volume`, hãy dùng `price` và `volume`.
-   Thay vì đọc `stock_id`, hãy dùng `id`.

## Sử dụng cơ bản

Tương tự như trước đây, bạn khởi chạy hệ thống thông qua script.

**Unix/Linux/Mac:**

**Windows:**

Với cấu hình mặc định, ứng dụng sẽ:

-   Thu thập tất cả các loại dữ liệu có sẵn được đăng ký trong script.
-   Quản lý đóng mở kết nối tự động (`SessionManager`).

### Lọc dữ liệu theo loại

Để tối ưu hóa tài nguyên và tập trung vào các loại dữ liệu cần thiết, sử dụng tham số `--data-types` khi khởi chạy script (nếu bạn có triển khai script nhận Argument):

#### Các loại dữ liệu có sẵn qua WebSocket

| Loại dữ liệu | Mô tả |
| --- | --- |
| `stockps` | Dữ liệu giá cổ phiếu theo thời gian thực (Tick Data) |
| `index` | Dữ liệu các chỉ số thị trường |
| `board` | Bảng giá tổng quan |
| `boardps` | Bảng giá chi tiết theo từng cổ phiếu |
| `aggregatemarket` | Dữ liệu tổng hợp thị trường |
| `aggregateps` | Dữ liệu tổng hợp chi tiết |

## Giám sát và xử lý sự cố

### Tắt ứng dụng an toàn

Sử dụng `Ctrl+C` để dừng ứng dụng. Hệ thống sẽ thực hiện quá trình tắt an toàn:

1.  Đóng tất cả kết nối WebSocket.
2.  Dừng SessionManager.
3.  Ghi toàn bộ vùng đệm dữ liệu bộ nhớ và lưu an toàn vào các tệp CSV/Parquet.

### Khắc phục sự cố

**Không nhận được dữ liệu?**

-   Kiểm tra kết nối mạng (Ping 8.8.8.8).
-   Đảm bảo phiên giao dịch của sàn chứng khoán đang mở cửa.
-   Kiểm tra file `error_log` hoặc Console output để xem token xác thực có hết hạn không.
