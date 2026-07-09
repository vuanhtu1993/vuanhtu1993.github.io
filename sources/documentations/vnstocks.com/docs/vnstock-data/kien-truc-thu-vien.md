---
title: "Kiến trúc thư viện"
source_url: "https://vnstocks.com/docs/vnstock-data/kien-truc-thu-vien"
crawled_at: "2026-07-09T08:01:57.690Z"
---

## Triết Lý Thiết Kế 3 Lớp

Mọi dòng code trong `vnstock_data` đều hướng tới một mục tiêu duy nhất: **Giúp bạn tập trung vào phân tích tài chính thay vì xử lý mã nguồn.**

| Lớp Kiến Trúc | Bản Chất Kỹ Thuật | Ý nghĩa |
| --- | --- | --- |
| **Giao diện hợp nhất (Unified UI)** | Lớp trên cùng, tổ chức lại toàn bộ dữ liệu thành cấu trúc nghiệp vụ (Market, Reference, Fundamental...). | **Lập trình như một chuyên gia tài chính.** Trải nghiệm xuyên suốt, dễ tìm kiếm chức năng qua `show_api()`, gọi hàm liền mạch qua dấu chấm `.` để phân nhánh hàm mà không cần quan tâm tới cài đặt nguồn dữ liệu. |
| **Giao tiếp chung (Core Adapter)** | Lớp trung gian tạo ra một chuẩn giao tiếp duy nhất giữa code của bạn và mọi nguồn cấp dữ liệu. | **Sự tự do vô hạn (Vendor-Lock Free).** Thay đổi nhà cung cấp (từ VCI sang VND, MAS) chỉ đơn giản là thay đổi giá trị `source=` khi khởi tạo class. Code hiện tại không bao giờ bị gãy, tối đa hóa tính linh hoạt cho mọi dự án. |
| **Module Nguồn cấp (Implementation)** | Lớp dưới cùng giao tiếp trực tiếp với hệ thống API gốc đặc thù của từng nguồn cấp. | **Quyền kiểm soát tuyệt đối trên Production.** Đóng gói chặt chẽ, đảm bảo tính ổn định cao nhất 24/7. Cho phép bạn khai thác tận cùng những trường dữ liệu "hiếm" chỉ riêng của một hệ thống có được. |

## Hướng Dẫn Sử Dụng

### 1\. Giao diện hợp nhất (Unified UI - Khuyên dùng)

> Kiến trúc tiêu chuẩn mới nhất, vận hành mượt mà, cảm hứng thiết kế từ Bloomberg Terminal, FIX.

Đây là cách tương tác với dữ liệu theo các miền nghiệp vụ rõ ràng, giúp lập trình viên thao tác một cách tự nhiên mà không cần bận tâm về cấu trúc kỹ thuật bên dưới.

✅ **Ưu điểm**:

-   Trải nghiệm lập trình trơn tru, liền mạch với khả năng gọi chuỗi (method chaining).
-   Các nhóm dữ liệu được tổ chức logic theo sát kiến thức tài chính thực tiễn.
-   Hỗ trợ hàm `show_api()` để dễ dàng tự khám phá chức năng như có một bản đồ hướng dẫn bên cạnh.

### 2\. Sử dụng Giao tiếp chung (Core Adapter)

> **Tối ưu cho sự linh hoạt, hoán đổi nguồn nhà cung cấp, phù hợp người dùng nâng cấp từ bản cũ.**

Phương thức này dành riêng cho người dùng quen thuộc với phong cách của phiên bản Vnstock trước đây. Chỉ cần điều chỉnh phần import thư viện, gần như toàn bộ tính năng và code hiện tại của bạn sẽ tiếp tục hoạt động nguyên vẹn.

✅ **Ưu điểm**:

-   Chuyển đổi siêu tốc từ phiên bản open-source.
-   Linh hoạt đối chiếu và thay đổi nhà cung cấp (từ VCI sang VND, MAS...).

### 3\. Tương tác trực tiếp Module Nguồn cấp

> **Kiểm soát chặt chẽ nhất, tối ưu cho sự ổn định ở môi trường Production.**

Thay vì dùng giao tiếp chung, bạn gọi thẳng dữ liệu từ module bên trong của từng nhà cung cấp.

✅ **Ưu điểm**:

-   Giảm thiểu hoàn toàn rủi ro chức năng không hỗ trợ chéo.
-   Truy cập vào những trường dữ liệu đặc thù hay tính năng ẩn chỉ có riêng ở một nhà cung cấp cụ thể.

## Tra cứu API

Thay vì phải tra cứu tài liệu rời rạc, **Unified UI** gom toàn bộ thư viện lại thành một cây tính năng. Gõ `show_api()` và bạn sẽ có toàn cảnh bức tranh dữ liệu.

**Hiển thị kết quả API Tree**
