---
title: "Kết nối hệ thống đặt lệnh tự động - DNSE Light Speed API"
source_url: "https://vnstocks.com/docs/vnstock/api-dat-lenh-giao-dich-dnse"
crawled_at: "2026-07-09T08:00:03.385Z"
---

Vnstock cung cấp phương thức kết nối API hoàn chỉnh với DNSE để cộng đồng có thể từng bước làm quen với hình thức tự động hoá luồng dữ liệu 2 chiều tự động.

Để bắt đầu sử dụng, các bạn cần cài đặt gói thư viện vnstock của có hỗ trợ đầy đủ các chức năng cho DNSE Lightspeed API. Từ các hàm python này, các bạn có thể xây dựng hệ thống phân tích tự động/web app dễ dàng từ môi trường cloud hoặc máy tính cá nhân.

## Đăng nhập và xác thực

### Khởi tạo DNSE Client

Để có thể sử dụng các chức năng của DNSE API, trước hết bạn cần khởi tạo một đối tượng DNSE Client, theo đó các hàm chức năng sẽ là các phương thức của đối tượng Client này. Chúng ta gán Client này với biến `client` cho ngắn gọn để gọi trong các bước tiếp theo.

### Đăng nhập hệ thống

Bạn sử dụng đoạn mã sau để đăng nhập hệ thống API.

Sau bước này, mã JWT token được tạo ra để sử dụng trong các bước tiếp theo.

### Xác thực cấp độ cao

Khi nào sử dụng SmartOTP, emailOTP?

-   SmartOTP là phương thức xác thực mặc định khi bạn mở tài khoản DNSE, có thể sử dụng để thực hiện toàn bộ nhu cầu quản lý của bạn.
-   emailOTP được các nhà đầu tư lựa chọn khi muốn xây dựng hệ thống quản lý dữ liệu hoàn toàn tự động. Khi đó, bạn sử dụng một email chuyên biệt (khuyên dùng Gmail) đăng ký với DNSE để nhận OTP, trích xuất OTP với API từ Google và xác thực hệ thống DNSE hoàn toàn tự động. Lưu ý nhỏ là mã OTP gửi qua email chỉ tồn tại trong 2 phút.

#### Yêu cầu hệ thống gửi OTP qua email

Bỏ qua bước này nếu bạn chọn sử dụng SmartOTP thay vì email OTP. Dòng lệnh sau giúp bạn yêu cầu hệ thống gửi OTP qua email, mã OTP này dùng để tạo `trading token` cho phép thực hiện giao dịch.

Sau khi nhận mã OTP qua email, bạn sử dụng cho bước tiếp theo. Bạn cũng có thể tự động hóa quá trình trích xuất OTP này và nạp cho bước tiếp theo bằng cách sử dụng Gmail API. Tham khảo thêm thông tin [tại đây](https://developers.google.com/gmail/api/guides?hl=vi)

#### Tạo mã trading token để giao dịch

Tại bước này, bạn có thể nhập mã OTP để `tạo trading token` bằng mã SmartOTP hoặc email OTP.

Trong đó:

-   `otp` là mã xác thực cấp 2 lấy từ app EntradeX dưới dạng SmartOTP hoặc mã được gửi qua email. Mã này phải được nhập dưới dạng string `'12345'`.
-   `smart_otp`: nhận giá trị `True` nếu bạn lấy mã từ app, `False` nếu lấy mã từ email

## Tra cứu thông tin

### Thông tin tài khoản

Để truy cập thông tin tài khoản của bạn tại DNSE, bạn sử dụng câu lệnh sau:

Kết quả trả về có dạng:

### Thông tin tiểu khoản

Để tra cứu thông tin các tiểu khoản trong tài khoản của bạn, sử dụng hàm sau:

### Thông tin số dư tài khoản

Cho phép tra cứu thông tin tiền số dư tiền theo mã tiểu khoản của bạn.

### Danh sách gói vay

Trong đó:

-   `sub_account`: là mã tiểu khoản trên tài khoản DNSE của bạn.
-   `asset_type`: nhập `stock` cho giao dịch cơ sở, `derivative` cho giao dịch phái sinh.

### Sức mua, sức bán

Lấy thông tin sức mua sức bán tối đa theo tiểu khoản, mã, giá và gói vay

Trong đó:

-   `symbol`: là tên mã cổ phiếu hoặc mã hợp đồng phái sinh, ví dụ `VN30F2311`
-   `price`: giá, đơn vị là đồng.
-   `sub_account`: là mã tiểu khoản của bạn sử dụng để giao dịch, lấy từ hàm `sub_accounts`
-   `asset_type`: nhận một trong hai giá trị là `stock` cho cổ phiếu hoặc `derivative` cho phái sinh.
-   `loan_package_id`: mã gói vay, lấy từ danh sách gói vay áp dụng với tài khoản của bạn.

## Đặt lệnh, sửa lệnh, hủy lệnh

### Đặt lệnh

hoặc sử dụng dạng rút gọn

Trong đó:

-   `sub_account`: là mã tiểu khoản của bạn sử dụng để giao dịch, lấy từ hàm `sub_accounts`
-   `symbol`: là tên mã cổ phiếu hoặc mã hợp đồng phái sinh, ví dụ `VN30F2311`
-   `side`: loại lệnh mua `buy` hay bán `sell`
-   `quantity`: số lượng hợp đồng, cổ phiếu giao dịch
-   `price`: giá, đơn vị là đồng.
-   `order_type`: Loại lệnh, sử dụng 1 trong các giá trị `LO`, `MP`, `MTL`, `ATO`, `ATC`, `MOK`, `MAK`
-   `loan_package_id`: mã gói vay, lấy từ danh sách gói vay áp dụng với tài khoản của bạn.
-   `asset_type`: nhận một trong hai giá trị là `stock` cho cổ phiếu hoặc `derivative` cho phái sinh.

### Sổ lệnh

Cho phép liệt kê các lệnh đã đặt trong sổ lệnh. Áp dụng cho cả giao dịch cơ sở và phái sinh.

Để liệt kê danh sách lệnh trong sổ lệnh, bạn sử dụng dòng lệnh sau đối với giao dịch cơ sở

hoặc sử dụng lệnh sau cho phái sinh

Trong đó:

-   `sub_account`: là mã tiểu khoản tương ứng cho giao dịch cơ sở/phái sinh cần tra cứu
-   `asset_type`: nhận giá trị là `stock` cho giao dịch cơ sở, và `derivative` cho giao dịch phái sinh.

### Chi tiết lệnh

Tra cứu thông tin chi tiết của một lệnh bất kỳ thuộc mã tiểu khoản của bạn. Áp dụng cho cả giao dịch cơ sở và phái sinh.

Trong đó:

-   `order_id`: mã lệnh đặt, thông tin lấy từ `Sổ lệnh`
-   `sub_account`: là mã tiểu khoản của bạn sử dụng để giao dịch, lấy từ hàm `sub_accounts`
-   `asset_type`: nhận một trong hai giá trị là `stock` cho cổ phiếu hoặc `derivative` cho phái sinh.

### Hủy lệnh

Cho phép hủy lệnh bất kỳ theo id từ một tiểu khoản của bạn. Áp dụng cho cả giao dịch cơ sở và phái sinh.

Trong đó:

-   `order_id`: mã lệnh đặt, thông tin lấy từ `Sổ lệnh`
-   `sub_account`: là mã tiểu khoản của bạn sử dụng để giao dịch, lấy từ hàm `sub_accounts`
-   `asset_type`: nhận một trong hai giá trị là `stock` cho cổ phiếu hoặc `derivative` cho phái sinh.

### Deal nắm giữ

Trả về danh sách các deal bạn đang nắm giữ. Áp dụng cho cả giao dịch cơ sở và phái sinh.

Trong đó:

-   `sub_account`: là mã tiểu khoản của bạn sử dụng để giao dịch, lấy từ hàm `sub_accounts`
-   `asset_type`: nhận một trong hai giá trị là `stock` cho cổ phiếu hoặc `derivative` cho phái sinh.
