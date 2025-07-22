---
title: Database Normalization - Chuẩn hoá cơ sở dữ liệu
date: "2025-07-21"
category: "Power BI"
authors: [anhhtus]
tags: [Power BI, Database Normalization]
description: "Hướng dẫn chi tiết về Database Normalization trong Database, các cấp độ chuẩn hóa từ 1NF đến 3NF, và lợi ích của việc chuẩn hóa dữ liệu."
---
# Database Normalization - Chuẩn hoá cơ sở dữ liệu

---

## **1. Database Normalization**

**Normalization** (Chuẩn hóa dữ liệu) là quá trình tổ chức các **bảng** và **cột** trong cơ sở dữ liệu quan hệ (Relational Database) nhằm **giảm thiểu dữ liệu dư thừa** và giữ vững **tính toàn vẹn của dữ liệu**. Chuẩn hóa thường được sử dụng để:

1. **Loại bỏ dữ liệu dư thừa** (*Eliminate redundant data*):
    - Giảm kích thước bảng, tối ưu dung lượng lưu trữ, và cải thiện tốc độ xử lý.
2. **Giảm thiểu sai sót và bất thường** (*Minimize errors and anomalies*):
    - Hạn chế các lỗi phát sinh khi thực hiện các thao tác dữ liệu như:
        - Thêm dữ liệu (Insert).
        - Sửa dữ liệu (Update).
        - Xóa dữ liệu (Delete).
3. **Đơn giản hóa truy vấn** (*Simplify queries*) và cấu trúc cơ sở dữ liệu (*Structure the database*):
    - Tối ưu hóa cách tổ chức dữ liệu để dễ dàng phân tích và truy vấn ý nghĩa từ dữ liệu.

---

**Ý tưởng chính (💡):**

- Trong một **cơ sở dữ liệu được chuẩn hóa**, mỗi bảng chỉ nên phục vụ một **mục đích cụ thể** duy nhất. Ví dụ:
  - Bảng `Thông tin sản phẩm` lưu các thông tin về sản phẩm.
  - Bảng `Giao dịch bán hàng` lưu các thông tin liên quan đến giao dịch.
  - Bảng `Thông tin khách hàng` chứa thuộc tính khách hàng.
  - Bảng `Chi tiết cửa hàng` lưu thông tin cửa hàng.

---

### **Giải thích về ví dụ (Phân tích bảng dữ liệu):**

Dữ liệu ban đầu (chưa chuẩn hóa) được hiển thị như sau:

| **date** | **product_id** | **quantity** | **product_brand** | **product_name** | **product_sku** | **product_weight** |
| --- | --- | --- | --- | --- | --- | --- |
| 1/1/1997 | 869 | 5 | Nationeel | Nationeel Grape Fruit Roll | 52382131779 | 17 |
| 1/7/1997 | 869 | 2 | Nationeel | Nationeel Grape Fruit Roll | 52382131779 | 17 |
| 1/3/1997 | 1 | 4 | Washington | Washington Berry Juice | 90748583674 | 8.39 |
| 1/5/1997 | 1472 | 3 | Fort West | Fort West Cookies | 37276054024 | 8.28 |

---

### **Phân tích vấn đề trong dữ liệu chưa chuẩn hóa:**

1. **Dữ liệu dư thừa (Redundant Data):**
    - Thông tin sản phẩm như `product_brand`, `product_name`, `product_sku`, và `product_weight` bị **lặp đi lặp lại** cho mỗi giao dịch. Ví dụ:
        - `Nationeel Grape Fruit Roll` xuất hiện hai lần cho hai ngày khác nhau (1/1/1997 và 1/7/1997).
    - Việc lưu trữ thông tin lặp vừa **làm tốn dung lượng lưu trữ** vừa dễ gây lỗi sai trong dữ liệu.
2. **Thiếu sự tách biệt giữa mục đích của bảng:**
    - Bảng hiện tại *gộp chung* nhiều thông tin (giao dịch, sản phẩm) vào một bảng duy nhất. Điều này làm cho bảng trở nên khó cập nhật và truy vấn:
        - Nếu thông tin sản phẩm thay đổi (ví dụ: trọng lượng `product_weight` đổi từ 17 thành 15), ta phải tìm và cập nhật cho tất cả **hàng** liên quan đến sản phẩm này, dẫn đến rủi ro sai sót.
3. **Vấn đề ở quy mô lớn:**
    - Với quy mô nhỏ (chỉ vài dòng dữ liệu), vấn đề lặp dường như không đáng kể. Nhưng khi cơ sở dữ liệu mở rộng đến hàng triệu dòng, các vấn đề dư thừa và lỗi sẽ trở nên **rất khó kiểm soát**.

---

### **Dữ liệu chuẩn hóa:**

Các thông tin được chuẩn hóa thành nhiều bảng như sau:

### **Bảng 1: Thông tin sản phẩm**

- Lưu trữ thông tin **cố định** của sản phẩm, không bị lặp lại.

| **product_id** | **product_brand** | **product_name** | **product_sku** | **product_weight** |
| --- | --- | --- | --- | --- |
| 869 | Nationeel | Nationeel Grape Fruit Roll | 52382131779 | 17 |
| 1 | Washington | Washington Berry Juice | 90748583674 | 8.39 |
| 1472 | Fort West | Fort West Cookies | 37276054024 | 8.28 |

---

### **Bảng 2: Giao dịch bán hàng**

- Lưu trữ các thông tin thay đổi theo từng giao dịch.

| **date** | **product_id** | **quantity** |
| --- | --- | --- |
| 1/1/1997 | 869 | 5 |
| 1/7/1997 | 869 | 2 |
| 1/3/1997 | 1 | 4 |
| 1/5/1997 | 1472 | 3 |

---

### **Lợi ích của dữ liệu chuẩn hóa:**

1. **Loại bỏ dư thừa:**
    - Thông tin sản phẩm chỉ được lưu **một lần duy nhất** trong bảng sản phẩm. Việc chỉnh sửa thông tin sản phẩm trở nên dễ dàng.
2. **Giảm lỗi và bất thường:**
    - Khi có thay đổi về một giá trị (như `product_weight`), ta chỉ cần sửa một dòng trong bảng sản phẩm. Điều này giảm thiểu khả năng sai sót khi phải sửa nhiều dòng.
3. **Tăng hiệu suất và giảm chi phí:**
    - Cấu trúc chuẩn hóa giúp giảm số lượng dữ liệu lặp, từ đó giảm dung lượng lưu trữ và tăng tốc độ truy vấn.
4. **Dễ dàng mở rộng:**
    - Với hệ thống chuẩn hóa, việc thêm thông tin mới (như `store details`) chỉ yêu cầu thêm một bảng mới, không cần thay đổi cấu trúc bảng hiện tại.

---

## **2. Các loại chuẩn hóa và giải thích**

### **2.1. First Normal Form (1NF) - Chuẩn hóa bậc 1:**

### **Định nghĩa:**

Một bảng đạt chuẩn **1NF** khi **mỗi ô dữ liệu** trong bảng chỉ chứa **một giá trị duy nhất**, và các giá trị trong cột đều **có cùng loại dữ liệu**.

### **Ví dụ:**

Bảng chưa đạt chuẩn 1NF:

| **ID** | **Tên khách hàng** | **Số điện thoại** |
| --- | --- | --- |
| 1 | Minh | 0123456789, 0987654321 |
| 2 | Hà | 0123456789 |

- **Vấn đề:**
  - Một ô dữ liệu có nhiều giá trị (ô `Số điện thoại` của khách hàng `Minh` chứa 2 số).
  - Gây khó cho việc truy vấn và sửa đổi thông tin.

### **Chuyển sang dạng 1NF:**

| **ID** | **Tên khách hàng** | **Số điện thoại** |
| --- | --- | --- |
| 1 | Minh | 0123456789 |
| 1 | Minh | 0987654321 |
| 2 | Hà | 0123456789 |

- **Lợi ích:**
  - Mỗi ô chỉ chứa **một dữ liệu duy nhất**.
  - Bảng được tổ chức hợp lý, dễ truy vấn.

---

### **2.2. Second Normal Form (2NF) - Chuẩn hóa bậc 2:**

### **Định nghĩa:**

Một bảng đạt chuẩn **2NF** nếu:

1. Bảng đã đạt chuẩn **1NF**.
2. Mỗi cột không khóa phụ thuộc **hoàn toàn** vào khóa chính (Primary Key), không tồn tại **phụ thuộc từng phần**.

### **Ví dụ:**

Bảng chưa đạt chuẩn 2NF:

| **Mã đơn hàng** | **ID khách hàng** | **Tên khách hàng** | **Địa chỉ** | **Tổng tiền** |
| --- | --- | --- | --- | --- |
| 101 | 1 | Minh | Hà Nội | 500,000 |
| 102 | 2 | Hà | TP.HCM | 700,000 |

- **Vấn đề:**
  - `Tên khách hàng` và `Địa chỉ` phụ thuộc vào `ID khách hàng`, không phải `Mã đơn hàng`. Đây là **phụ thuộc từng phần**, làm dữ liệu dư thừa.
  - Nếu khách hàng `Minh` thay đổi địa chỉ, ta phải chỉnh sửa nhiều dòng có liên quan.

### **Chuyển sang dạng 2NF:**

Tách bảng thành 2 bảng:

### **Bảng 1: Khách hàng**

| **ID khách hàng** | **Tên khách hàng** | **Địa chỉ** |
| --- | --- | --- |
| 1 | Minh | Hà Nội |
| 2 | Hà | TP.HCM |

### **Bảng 2: Đơn hàng**

| **Mã đơn hàng** | **ID khách hàng** | **Tổng tiền** |
| --- | --- | --- |
| 101 | 1 | 500,000 |
| 102 | 2 | 700,000 |

- **Lợi ích:**
  - Không còn dư thừa thông tin `Tên khách hàng` và `Địa chỉ`.
  - Dễ dàng cập nhật dữ liệu khách hàng mà không ảnh hưởng đến dữ liệu đơn hàng.

---

### **2.3. Third Normal Form (3NF) - Chuẩn hóa bậc 3:**

### **Định nghĩa:**

Một bảng đạt chuẩn **3NF** nếu:

1. Bảng đã đạt chuẩn **2NF**.
2. Không có cột **phụ thuộc gián tiếp** vào khóa chính.

### **Ví dụ:**

Bảng chưa đạt chuẩn 3NF:

| **ID Nhân viên** | **Tên nhân viên** | **Mã phòng ban** | **Tên phòng ban** |
| --- | --- | --- | --- |
| 1 | Hoàng | A01 | Kế toán |
| 2 | Lan | A02 | Nhân sự |

- **Vấn đề:**
  - `Tên phòng ban` phụ thuộc vào `Mã phòng ban`, không phải `ID Nhân viên` (khóa chính). Đây là phụ thuộc **gián tiếp**, dẫn đến dư thừa dữ liệu.
  - Nếu phòng ban `Kế toán` đổi tên, phải sửa nhiều dòng tương ứng.

### **Chuyển sang dạng 3NF:**

Tách bảng thành 2 bảng:

### **Bảng 1: Nhân viên**

| **ID Nhân viên** | **Tên nhân viên** | **Mã phòng ban** |
| --- | --- | --- |
| 1 | Hoàng | A01 |
| 2 | Lan | A02 |

### **Bảng 2: Phòng ban**

| **Mã phòng ban** | **Tên phòng ban** |
| --- | --- |
| A01 | Kế toán |
| A02 | Nhân sự |

- **Lợi ích:**
  - Xóa bỏ phụ thuộc gián tiếp.
  - Thay đổi thông tin phòng ban chỉ cần cập nhật tại bảng `Phòng ban`.

---

### **3. Hệ quả chuẩn hóa - Ưu điểm và nhược điểm**

### **Ưu điểm của chuẩn hóa:**

1. **Loại bỏ dư thừa dữ liệu:**
    - Dữ liệu được tránh việc lặp đi lặp lại trong nhiều dòng, giảm kích thước cơ sở dữ liệu.
2. **Cập nhật dễ dàng:**
    - Khi chỉnh sửa thông tin, chỉ cần thay đổi tại **một nơi** duy nhất.
3. **Bảo đảm toàn vẹn dữ liệu:**
    - Dữ liệu không bị sai lệch do dư thừa.
4. **Dễ truy vấn và mở rộng:**
    - Các bảng có mục đích rõ ràng giúp dễ dàng lọc, tìm kiếm, và thêm dữ liệu.

---

### **Nhược điểm của chuẩn hóa:**

1. **Yêu cầu nhiều bảng hơn:**
    - Khi chuẩn hóa, dữ liệu bị chia thành nhiều bảng nhỏ hơn, làm các truy vấn phức tạp hơn.
2. **Hiệu suất giảm trong một số trường hợp:**
    - Truy vấn yêu cầu **kết nối bảng** (Joins) thường phức tạp và tốn nhiều tài nguyên nếu cơ sở dữ liệu lớn.

---

### **4. Kết luận**

- Chuẩn hóa (Normalization) là **bắt buộc** trong thiết kế cơ sở dữ liệu, đặc biệt với các hệ thống lớn để giảm dư thừa, bảo toàn tính chính xác, và đảm bảo dữ liệu dễ quản lý.
- Tuy nhiên, tùy vào mục tiêu sử dụng, đôi khi các hệ thống **phi chuẩn hóa (Denormalization)** lại được áp dụng (ví dụ: khi tối ưu hóa hiệu suất trong báo cáo).

Các cấp độ từ **1NF** đến **3NF** thường là mức chuẩn hóa được sử dụng phổ biến nhất trong thực tế. Hy vọng giải thích trên cung cấp cái nhìn rõ ràng và dễ hiểu về chuẩn hóa cơ sở dữ liệu! 😊
