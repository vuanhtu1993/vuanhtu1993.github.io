---
title: "Hiệu năng và tối ưu hóa"
source_url: "https://vnstocks.com/docs/vnstock-pipeline/hieu-nang-toi-uu"
crawled_at: "2026-07-09T08:06:22.342Z"
---

## Hiệu năng và tối ưu hóa

### Kiến trúc xử lý song song

`vnstock_pipeline` tự động sử dụng kiến trúc xử lý song song ở cấp độ tác vụ khi số lượng mã chứng khoán yêu cầu lớn. Khác với cách dùng vòng lặp `for` thông thường khiến quá trình tải bị nghẽn tại một mã cụ thể, hệ thống phân chia các tiến trình nhập xuất (I/O) vào các luồng độc lập, giúp tải dữ liệu của rổ VN100 chỉ mất chưa đến vài giây.

Khi bạn chạy lệnh CLI:

Shell

```
python -m vnstock_pipeline.cli run ohlcv --group VN100 --mode daily
```

Scheduler sẽ tự động chia 100 tác vụ này thành nhiều luồng chạy ngầm.

### Cơ chế tự động chạy lại khi lỗi và lưu nhật ký

Trước đây, khi tải một tập hợp 1000 mã cổ phiếu, nếu mã thứ 999 bị đứt kết nối mạng, người dùng thường phải chạy lại từ đầu. Hiện nay:

1.  **Quản lý rủi ro trên từng tiến trình**: Lỗi ở mã nào sẽ chỉ cô lập mã đó, không làm gián đoạn toàn bộ chương trình.
2.  **Xuất danh sách lỗi**: Các mã không tải được sẽ bị ghi vào file `error_log.csv` nằm trong thư mục cơ sở dữ liệu mà bạn chỉ định trong cấu hình `pipeline.toml`.
3.  **Tiếp tục tiến trình thông minh**: Bạn chỉ cần kích hoạt cờ `--retry-errors`, hệ thống sẽ đọc từ file log và chỉ tải lại đúng những mã bị thiếu, giúp tiết kiệm thời gian và băng thông.

Shell

```
# Phục hồi sau đứt cáp hoặc khi bị giới hạn tần suất gọi API
python -m vnstock_pipeline.cli run ohlcv --retry-errors
```

### Tối ưu hóa bằng định dạng Parquet

Để xử lý hàng chục ngàn dòng dữ liệu khớp lệnh (Trades) hằng ngày, CSV tỏ ra quá nặng và chậm chạp. `vnstock_pipeline` tích hợp lưu trữ định dạng Parquet theo mặc định.

1.  **Tốc độ tải dữ liệu**: Sử dụng thư viện `pyarrow`, tốc độ chuyển đổi Parquet sang Pandas DataFrame nhanh hơn CSV từ 10 đến 50 lần.
2.  **Tiết kiệm dung lượng**: Parquet là định dạng lưu trữ dạng cột. Dung lượng của một bảng lưu bằng Parquet thông thường chỉ bằng khoảng 25% so với CSV gốc.

### Tự động xử lý đường dẫn

Trong các phiên bản trước, việc dùng các lệnh `os.path.join` hoặc truyền đường dẫn tương đối thủ công thường gây lỗi không tìm thấy file nếu bạn kích hoạt script qua Cronjob. Phiên bản hiện tại sử dụng thư viện `pathlib` và tính năng `resolve_base_path()` của hệ thống cấu hình giúp tự động tìm ra vị trí gốc dù bạn thực thi môi trường từ bất kỳ đâu, đảm bảo tỷ lệ chạy thành công cao trên máy chủ VPS.
