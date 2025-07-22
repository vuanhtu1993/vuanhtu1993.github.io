---
title: Pivot và Unpivot trong Power BI
date: "2025-07-22"
category: "Power BI"
authors: [anhhtus]
tags: [Power BI, Data Transformation]
description: "Hướng dẫn chi tiết về Pivot và Unpivot trong Power BI, cách sử dụng Power Query để biến đổi dữ liệu."
---
# Pivot và Unpivot trong Power BI

### **Phân tích chi tiết về Pivot và Unpivot trong Power BI**

Trong Power BI, **Pivot** và **Unpivot** là hai kỹ thuật cơ bản và hữu ích để xử lý, biến đổi dữ liệu nhằm chuẩn bị cho mô hình hóa và phân tích. Dữ liệu dạng Pivot thường trực quan nhưng gây khó khăn cho việc xây dựng một mô hình dữ liệu hiệu quả. Dạng Unpivot (chuẩn hóa) lại dễ dàng hơn để thực hiện các phân tích phức tạp và tương thích tốt với các yêu cầu về Data Modeling.

Dưới đây là phân tích và hướng dẫn chi tiết, áp dụng các ví dụ đã nêu.

---

### **1. Power BI và Dữ liệu dạng Pivot**

### **Pivot là gì trong Power BI?**

Pivot trong Power BI là quá trình tổ chức dữ liệu bằng cách **biến các giá trị từ một cột thành các cột riêng biệt**. Dữ liệu dạng Pivot giúp trực quan hóa dữ liệu tốt và thường được sử dụng trong các báo cáo, bảng tổng hợp hoặc Excel như đã trình bày trong ví dụ.

### **Ví dụ:**

Dữ liệu ban đầu dạng Pivot khi tải lên Power BI:

| **Ngày** | **Bikes** | **Components** | **Clothing** |
| --- | --- | --- | --- |
| 07/01/2022 | 10 | 14 | 35 |
| 07/02/2022 | 12 | 15 | 40 |

- **Trực quan:** Các sản phẩm (`Bikes`, `Components`, `Clothing`) được tổ chức thành **cột riêng biệt**. Doanh số của từng sản phẩm nằm trong các cột, rất dễ nhìn khi đọc trực tiếp trong bảng này.
- **Khó khăn trong Data Modeling:**
  - Các sản phẩm là **các cột**, thay vì các dòng. Điều này gây khó khăn khi cần phân tích doanh thu theo sản phẩm hoặc xử lý dữ liệu tổng quát.
  - Nếu có sản phẩm mới (ví dụ: `Accessories`), bạn cần **thêm một cột mới**, làm phức tạp bảng dữ liệu và khó mở rộng mô hình.

---

### **2. Power BI và Dữ liệu dạng Unpivot**

### **Unpivot là gì trong Power BI?**

Unpivot là kỹ thuật ngược lại Pivot. **Unpivot chuyển các cột thành dòng**, giảm số lượng cột xuống chỉ còn các thành phần chính như `Ngày`, `Tên sản phẩm`, và `Doanh số`. Đây là cách tổ chức dữ liệu chuẩn hóa, rất hữu ích trong Power BI để xây dựng mô hình dữ liệu linh hoạt.

### **Ví dụ chuyển Pivot sang Unpivot:**

Dữ liệu sau khi **Unpivot**:

| **Ngày** | **Sản phẩm** | **Doanh số** |
| --- | --- | --- |
| 07/01/2022 | Bikes | 10 |
| 07/01/2022 | Components | 14 |
| 07/01/2022 | Clothing | 35 |
| 07/02/2022 | Bikes | 12 |
| 07/02/2022 | Components | 15 |
| 07/02/2022 | Clothing | 40 |

### **Lợi ích trong Power BI:**

1. **Phù hợp với Data Modeling:**
    - Dạng Unpivot tổ chức danh mục sản phẩm (`Bikes`, `Components`, `Clothing`) thành **một cột duy nhất** (cột `Sản phẩm`), giúp dễ dàng thực hiện mô hình hóa dữ liệu trong Power BI.
    - Mô hình hóa các mối quan hệ trở nên dễ dàng hơn khi chỉ cần một số ít bảng và cột.
2. **Xử lý dữ liệu:**
    - Tính tổng doanh số (`SUM(Doanh số)`) hoặc nhóm doanh thu theo sản phẩm (`GROUP BY Sản phẩm`) cực kỳ đơn giản bằng DAX.

---

### **3. Pivot và Unpivot trong Power Query (Power BI)**

Power BI tích hợp Power Query, công cụ mạnh mẽ để xử lý hình dạng dữ liệu. Trong Power Query, bạn có thể áp dụng chức năng Pivot hoặc Unpivot chỉ với vài bước.

### **Unpivot Data:**

### **Thực hiện trong Power Query:**

1. **Tải dữ liệu lên Power BI** và vào **Power Query Editor**.
2. Chọn **các cột dạng giá trị (`Bikes`, `Components`, `Clothing`)** trong bảng Pivot.
3. Nhấp chuột phải và chọn **Unpivot Columns**. Lúc này, các cột được chuyển thành dòng.
4. Power Query sẽ **tạo thêm hai cột mới:**
    - Một cột `Attribute`: Hiển thị tên sản phẩm (`Bikes`, `Components`, `Clothing`).
    - Một cột `Value`: Hiển thị doanh số tương ứng (10, 14, 35,...).

### **Kết quả:**

| **Ngày** | **Attribute** | **Value** |
| --- | --- | --- |
| 07/01/2022 | Bikes | 10 |
| 07/01/2022 | Components | 14 |
| 07/01/2022 | Clothing | 35 |

- Bạn có thể đổi tên cột `Attribute` thành `Sản phẩm` và `Value` thành `Doanh số`, phù hợp với mục tiêu phân tích.

---

### **Ứng dụng Pivot:**

Ngược lại, nếu bạn cần chuyển dữ liệu **Unpivot** trở lại dạng **Pivot**, bạn có thể thực hiện các bước sau:

### **Thực hiện trong Power Query:**

1. **Chọn cột** cần giữ nguyên như `Ngày`.
2. Nhấp vào **Pivot Columns** và chọn cột `Sản phẩm` làm nhãn cho các cột mới.
3. Tập hợp giá trị cho các cột Pivot từ `Doanh số`.

### **Kết quả:**

| **Ngày** | **Bikes** | **Components** | **Clothing** |
| --- | --- | --- | --- |
| 07/01/2022 | 10 | 14 | 35 |
| 07/02/2022 | 12 | 15 | 40 |

---

### **4. Tác động đến Data Modeling trong Power BI**

### **Dữ liệu Pivot:**

- **Không thích hợp** để làm mô hình hóa dữ liệu:
  - Không thể thực hiện các mối quan hệ dễ dàng.
  - Cần xử lý phức tạp khi viết công thức DAX.
  - Không tương thích tốt với các nguyên tắc chuẩn hóa.

### **Dữ liệu Unpivot:**

- **Phù hợp hơn cho Data Modeling**:
  - Linh hoạt, dễ mở rộng.
  - Tích hợp tốt với các bảng khác trong mô hình quan hệ.
  - Phân tích dễ dàng và trực tiếp với DAX như `SUM`, `COUNT`, `CALCULATE`.

---

### **5. Kết luận**

- **Pivot**: Dữ liệu dạng Pivot phù hợp để **trình bày báo cáo**, nhưng nó không phù hợp để xây dựng **mô hình dữ liệu trong Power BI**.
- **Unpivot**: Dữ liệu dạng Unpivot được tối ưu hóa cho việc thiết kế bảng mô hình hóa dữ liệu, truy vấn linh hoạt và thích hợp với nguyên tắc chuẩn hóa.

Khi làm việc với Power BI, nếu đặt mục tiêu **phân tích dữ liệu** hoặc **xây dựng mô hình**, hãy luôn chuyển dữ liệu về dạng **Unpivot** để đảm bảo xử lý thuận tiện và hiệu quả hơn.
