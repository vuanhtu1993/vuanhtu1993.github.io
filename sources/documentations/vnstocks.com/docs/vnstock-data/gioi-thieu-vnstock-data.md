---
title: "Giới thiệu vnstock_data"
source_url: "https://vnstocks.com/docs/vnstock-data/gioi-thieu-vnstock-data"
crawled_at: "2026-07-09T08:01:51.062Z"
---

[Agent Guide](https://github.com/vnstock-hq/vnstock-agent-guide/) [Cài đặt gói tài trợ](https://vnstocks.com/onboard-member/cai-dat-go-loi)

Khuyên dùng: Nên ưu tiên sử dụng [Agent Guide](https://vnstocks.com/onboard/agent-guide) để nạp môi trường cho AI Agent trên máy tính cục bộ. Tránh viết code thủ công hoặc dùng AI phiên bản web như ChatGPT/Google Colab vì AI không có thông tin mới nhất về thư viện nên dễ viết sai cú pháp.

## Tổng quan so sánh

| Tiêu chí | vnstock | vnstock\_data |
| --- | --- | --- |
| **Loại** | Mã nguồn mở | Mã nguồn đóng (cấm sao chép, tái phân phối) |
| **Chi phí** | Miễn phí | Tham gia đóng góp qua Gói tài trợ |
| **Phân phối** | Công khai qua [PyPI](https://pypi.org/) và [Github](https://github.com/thinh-vu/vnstock) | Tại website qua trình cài đặt riêng |
| **Hạn mức API** | Tối đa 60 yêu cầu/phút | Lên tới 180 - 600 yêu cầu/phút |
| **Tải song song** | Người dùng tự cấu hình | Tự động tải đa luồng kết hợp giới hạn API cao hơn từ 3-10x tuỳ gói tài trợ |
| **Dữ liệu thời gian thực** | Trễ từ 1-3 giây | Thời gian thực khi dùng kết nối WebSocket |
| **Phạm vi dữ liệu** | Hạn chế (Xem chi tiết so sánh từng nhóm bên dưới) | Không giới hạn dữ liệu trả về từ nguồn (Xem chi tiết bên dưới) |
| **Mục đích sử dụng** | Số lượng hàm và API hạn chế, sử dụng cho mục đích học tập, nghiên cứu, tra cứu nhanh, làm quen với lập trình và AI - không phù hợp cho người sử dụng chuyên nghiệp, phân tích thường xuyên số lượng lớn, cần tốc độ cao. | Cung cấp đầy đủ các hàm và API chuyên sâu, tối ưu hiệu suất, phù hợp cho người sử dụng chuyên nghiệp, xây dựng hệ thống giao dịch tự động, phân tích thường xuyên dữ liệu lớn với tốc độ cao và độ ổn định vượt trội. |

---

## So sánh tính năng chi tiết

### 1\. Dữ liệu giá cổ phiếu

| Chức năng | vnstock (Miễn phí) | vnstock\_data (Tài trợ) |
| --- | --- | --- |
| Lịch sử giá OHLCV | Tối đa 8 năm (khung ngày) và 1 năm (khung phút) | Truy cập toàn bộ dữ liệu từ khi cổ phiếu niêm yết |
| Giá khớp lệnh trong ngày | Tối đa 30.000 bản ghi giao dịch | Không giới hạn |
| Tải dữ liệu thời gian thực | Sử dụng REST API - độ trễ thực tế ~1-3s trong phiên | Sử dụng WebSocket truyền dữ liệu trực tiếp giảm độ trễ kết hợp vnstock\_pipeline khi sử dụng gói tài trợ Golden trở lên. Mặc định sẽ dùng REST API như bản miễn phí. |

### 2\. Dữ liệu tài chính & Doanh nghiệp

| Chức năng | vnstock (Miễn phí) | vnstock\_data (Tài trợ) |
| --- | --- | --- |
| Chỉ số tài chính & BCTC | Tối đa 8 kỳ (xác thực API key) hoặc 4 kỳ (chế độ khách) | Truy cập không giới hạn số kỳ lịch sử trả về từ nguồn. |
| Thuyết minh báo cáo tài chính | Không hỗ trợ | Hỗ trợ trích xuất chi tiết thuyết minh |
| Tải báo cáo tài chính PDF | Không hỗ trợ tải file PDF scan | Hỗ trợ tải toàn bộ các loại văn bản báo cáo quan tâm. Tiện lợi khi ứng dụng tải về trích xuất dữ liệu bằng nhận dạng hình ảnh thông qua AI Agent, đặc biệt hữu ích cho phần diễn giải thuyết minh BCTC. |
| Điểm sức khỏe tài chính | Không hỗ trợ | Đầy đủ bộ tiêu chí chuẩn hoá để đánh giá nhanh sức khỏe doanh nghiệp |

### 3\. Dữ liệu vĩ mô & Hàng hóa

| Chức năng | vnstock (Miễn phí) | vnstock\_data (Tài trợ) |
| --- | --- | --- |
| Chỉ số kinh tế vĩ mô | Không hỗ trợ | Đầy đủ thông số GDP, CPI, FDI, xuất nhập khẩu... |
| Tỷ giá & Lãi suất liên ngân hàng | Không hỗ trợ | Dữ liệu được cập nhật liên tục |
| Giá hàng hóa thế giới & VN | Không hỗ trợ | Giá thép, dầu thô, nông sản, kim loại quý... |

---

## Giải đáp thắc mắc thường gặp

### 1\. Khắc phục lỗi "Đã nâng cấp nhưng vẫn bị giới hạn 60 yêu cầu/phút"

Đây là bối rối phổ biến nhất của các thành viên sau khi tham gia gói tài trợ. Mặc dù tài khoản của bạn đã được kích hoạt thành công trên hệ thống, bạn vẫn thấy thông báo sử dụng bản **Community** và bị giới hạn **60 yêu cầu/phút**.

#### Nguyên nhân sâu xa

Bạn đang chạy code dựa trên thư viện `vnstock` công khai (cài bằng lệnh `pip install vnstock` thông thường) và thực hiện xác thực bằng hàm `register_user()`.

Thư viện miễn phí `vnstock` **không thể tự chuyển đổi** hoặc mở rộng tính năng của gói tài trợ. Các gói tài trợ sử dụng một bộ thư viện độc lập hoàn toàn.

#### Cách xử lý chính xác

1.  **Cài đặt thư viện tài trợ:** Bộ thư viện dành cho nhà tài trợ là các gói mã nguồn đóng riêng tư (như `vnstock_data`, `vnstock_ta`, `vnstock_pipeline`), không thể cài đặt qua lệnh `pip install vnstock_data` thông thường. Bạn bắt buộc phải cài đặt thông qua trình cài đặt riêng tại trang [Cài đặt gói tài trợ](https://vnstocks.com/onboard-member/cai-dat-go-loi).
    
2.  **Thay đổi câu lệnh Import trong code:** Sau khi cài đặt thành công, hãy cập nhật lại toàn bộ mã nguồn của bạn để import từ thư viện mới:
    
    -   **Cách cũ (Bản miễn phí):**
    -   **Cách mới (Bản tài trợ):**

Khi bạn import từ `vnstock_data`, hệ thống sẽ tự động nhận diện API Key và áp dụng đúng hạn mức truy cập của gói tài trợ (180 đến 600 yêu cầu/phút tương ứng với hạng Bronze, Silver, Golden, Diamond).

### 2\. Chuyển đổi mã nguồn từ Bản miễn phí sang Bản tài trợ

Hầu hết các chức năng trên bản tài trợ được thiết kế tương thích ngược với bản miễn phí giúp bạn dễ dàng chuyển đổi chỉ bằng cách đổi tên thư viện khi import.

#### Lưu ý về cấu trúc dữ liệu tài chính (nguồn VCI)

Riêng đối với dữ liệu tài chính lấy từ nguồn VCI, cấu trúc bảng dữ liệu trả về giữa bản miễn phí và bản tài trợ sẽ có sự khác biệt nhỏ về tên cột hoặc định dạng. Bạn cần lưu ý điều chỉnh lại các đoạn code xử lý bảng dữ liệu (DataFrame) sau khi chuyển đổi sang bản tài trợ đối với nguồn này. Vnstock cung cấp sẵn Agent Skill hỗ trợ chuyển đổi code tự động tại Agent Guide.
