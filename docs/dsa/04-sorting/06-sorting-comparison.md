---
sidebar_position: 6
title: "22. So sánh các Thuật toán Sắp xếp"
description: "Bức tranh toàn cảnh về toàn bộ các thuật toán Sorting. Bảng so sánh Big O Notation và lời khuyên khi nào dùng cái gì."
---

# So sánh các Thuật toán Sắp xếp

Chúc mừng bạn đã sống sót vượt qua Phần 4! Chúng ta đã đi từ những thuật toán ngây ngô nhất (O(n²)) cho đến những "cỗ máy xay thịt" hàng triệu bản ghi (O(n log n)).

Hầu như trong công việc thực tế, bạn sẽ hiếm khi phải tự tay implement lại Quick Sort hay Merge Sort từ đầu. Hàm `Array.prototype.sort()` của JavaScript hay `Collections.sort()` của Java đã làm giùm bạn bằng những thuật toán kết hợp tối ưu nhất.
Tuy nhiên, khi đối diện với các bài toán có tính chất đặc thù, hoặc trả lời phỏng vấn các Big Tech, bạn PHẢI biết được Ưu/Nhược điểm của từng thuật toán để lựa chọn giải pháp tối ưu.

## 📋 Bảng So Sánh Tổng Thể Big O

| Thuật toán | Best Case Time | Average Case Time | Worst Case Time | Space Complexity | Ứng dụng thực tế |
|---|---|---|---|---|---|
| **Bubble Sort** | `O(n)` | `O(n²)` | `O(n²)` | `O(1)` | Gần như không dùng. Rất chậm. |
| **Selection Sort** | `O(n²)` | `O(n²)` | `O(n²)` | `O(1)` | Khi chi phí Ghi bộ nhớ đắt hơn chi phí Đọc. |
| **Insertion Sort** | `O(n)` | `O(n²)` | `O(n²)` | `O(1)` | Khi mảng đã **gần được sắp xếp**, hoặc nhận dữ liệu trực tuyến liên tục. Được các Engine dùng trộn chung với thuật toán lớn. |
| **Merge Sort** | `O(n log n)`| `O(n log n)`| **`O(n log n)`** | **`O(n)`** ⚠️ | Sắp xếp dữ liệu siêu khổng lồ cần sự **ổn định** tuyệt đối. |
| **Quick Sort** | `O(n log n)`| `O(n log n)`| **`O(n²)`** ⚠️ | `O(log n)` | Sắp xếp chung cho mọi tình huống. Bộ nhớ cực nhẹ. |

---

## ❓ Những câu hỏi phỏng vấn kinh điển

### 1. Tại sao hàm `sort()` của JavaScript lại không dùng riêng lẻ 1 thuật toán nào?

Các ngôn ngữ hiện đại (như V8 Engine của Chrome cho JS, hay Python) không ngu ngốc dùng một thuật toán duy nhất. Chúng dùng thuật toán lai tạo, điển hình là **TimSort** (Lai giữa Merge Sort và Insertion Sort) hoặc **Introsort** (Lai giữa Quick Sort, Heap Sort và Insertion Sort).
- **Nguyên lý:** Nếu mảng khổng lồ -> Dùng Quick/Merge Sort để chặt nhỏ.
- Khi mảng con bị chặt xuống kích thước đủ nhỏ (ví dụ `<= 10` phần tử) -> Hệ thống tự động kích hoạt **Insertion Sort** để tối ưu hóa bộ nhớ CPU. Sự kết hợp này mang lại tốc độ không thể tưởng tượng nổi ở Best Case.

### 2. Thuật toán "Ổn định" (Stable) là gì? Tại sao Quick Sort bị gọi là "Không ổn định" (Unstable)?

**Định nghĩa Tính Ổn Định (Stability):** 
Giả sử bạn có mảng danh sách người dùng, đang được sắp xếp theo *Độ Tuổi*. Bây giờ bạn muốn sắp xếp lại theo *Tên*.
- Nếu là thuật toán Ổn định: Hai người cùng tên (vd: Anh), người nào lúc nãy Tuổi nhỏ hơn vẫn sẽ đứng trước. Nó **giữ nguyên thứ tự tương đối** của dữ liệu gốc. (VD: Merge Sort, Insertion Sort).
- Nếu là Không ổn định: Hai người cùng tên "Anh", thuật toán vô tình vứt họ lung tung, xóa sổ luôn sự sắp xếp theo Tuổi trước đó. (VD: Quick Sort).

Vì Quick Sort nhảy cóc lung tung xung quanh cái `Pivot`, nó phá vỡ trật tự ban đầu của những giá trị trùng nhau. 
Do đó, nếu bài toán yêu cầu **sắp xếp nhiều tiêu chí lồng nhau**, tuyệt đối phải dùng **Merge Sort**.

---

## 🚀 WHAT IF — Còn thuật toán nào xịn hơn O(n log n) không?

Giới hạn lý thuyết của toán học máy tính đã chứng minh: Đối với mọi thuật toán sắp xếp dựa trên sự **So Sánh** (tức là lấy A so với B), **không thể nào vượt qua mốc O(n log n)**. Đó là tốc độ cực hạn vũ trụ.

Nhưng... What if chúng ta xếp mảng MÀ KHÔNG CẦN SO SÁNH 2 PHẦN TỬ VỚI NHAU?

Thật điên rồ! Khoa học máy tính tồn tại một nhóm thuật toán đặc biệt gọi là **Non-Comparison Sorting** (VD: Radix Sort, Counting Sort). Chúng không thèm so sánh A và B. Chúng đếm và ném các con số vào các "Thùng chứa" dựa trên toán học tuyệt đối.
Với cấu trúc dữ liệu bị giới hạn (ví dụ: chỉ toàn là Số nguyên từ 1 đến 100), Radix Sort có thể xếp hàng triệu con số với độ phức tạp thời gian **Chỉ là `O(n)` (Tuyệt đối theo đường thẳng)**.

Nhưng đó là những bài toán quá ngách dành cho Senior. Với hành trang O(n log n), bạn đã đủ sức tung hoành mọi dự án thực tế.

---

## 🏁 Tổng kết Sprint 4

Chúc mừng bạn đã bỏ túi trọn bộ kiến thức về Sorting!
Giờ đây, bạn có trong tay:
- Bảng tra cứu tốc độ (Big O).
- Cấu trúc dữ liệu tuyến tính (Array, List, Stack, Queue).
- Cấu trúc phi tuyến tính (Tree, Graph).
- Giải thuật tìm đường, sắp xếp mảng.

Tuy nhiên, vẫn còn những bài toán phỏng vấn cực kì hóc búa mang tên "Bí kíp Tối ưu vòng lặp" mà các cấu trúc dữ liệu trên không trực tiếp giải quyết.
Chúng ta sẽ giải quyết triệt để chúng ở **Phần Cuối Cùng - Các Mẫu Thuật Toán Nâng Cao (Advanced Patterns)**. Chuẩn bị tinh thần đón nhận Sliding Window, Two Pointers và Multiple Pointers nhé!

---
*Made by Anh Tu - Share to be share*
