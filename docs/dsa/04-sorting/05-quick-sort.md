---
sidebar_position: 5
title: "21. Quick Sort — Kẻ hủy diệt Mảng"
description: "Thuật toán sắp xếp phổ biến nhất thế giới thực. Khám phá khái niệm Pivot (Điểm chốt) và tại sao nó lại được gọi là 'Nhanh'."
---

# Quick Sort — Kẻ hủy diệt Mảng

Ở bài trước, [Merge Sort](./04-merge-sort.md) đã cho chúng ta thấy sức mạnh của việc chia nhỏ mảng. Tuy nhiên, nó bị một điểm trừ quá lớn: Mỗi lần chia mảng, nó lại tạo ra một bản Copy mới, dẫn đến ngốn RAM nghiêm trọng (Space Complexity là `O(n)`).

Để khắc phục nhược điểm này, chúng ta cần một thuật toán vừa có tư duy **Divide and Conquer**, vừa phải biết tự sắp xếp ngay trên chính Mảng Gốc (In-place sorting) để tiết kiệm 100% bộ nhớ.

Chào mừng bạn đến với **Quick Sort**. Đây chính là thuật toán lõi được sử dụng bên trong các thư viện chuẩn của C++, Java, và là trái tim của hàng triệu hệ thống đang chạy.

## 📋 Agenda

**Thời gian đọc ước tính:** ~8 phút

### Sau bài này, bạn sẽ:
- ✅ **Hiểu** được khái niệm cốt lõi của Quick Sort: Điểm chốt (Pivot).
- ✅ **Trực quan hóa** được cách Quick Sort sắp xếp mảng In-place (Không tốn thêm RAM).
- ✅ **Tự tay** implement hàm chia mảng (Partition) bằng TypeScript.
- ✅ **Cảnh giác** được với điểm yếu chết người khiến Quick Sort từ Rồng hóa Giun.

### Yêu cầu đầu vào:
- 🔹 Nắm vững [Merge Sort](./04-merge-sort.md) (Hiểu cách dùng Đệ quy để cắt mảng).

---

## ❓ Triết lý của Pivot (Điểm chốt)

**Vấn đề (Problem Statement):**
Merge Sort tạo mảng phụ vì nó cắt đôi mảng một cách ngây ngô ngay chính giữa. Cắt xong, 2 nửa trái phải lộn xộn, nên lúc gộp lại phải nhặt từng lá bài bỏ vào mảng mới. Rất tốn chỗ.

**Giải pháp (Solution):**
**Quick Sort**. Thay vì cắt ngay giữa, Quick Sort làm điều ngược lại:
1. Nó chọn đại một phần tử trong mảng làm **Điểm Chốt (Pivot)**. (Thường lấy phần tử đầu tiên cho dễ).
2. Nó quét mảng 1 lượt, ném TẤT CẢ các đứa nhỏ hơn Pivot sang bên Trái. Ném TẤT CẢ các đứa lớn hơn sang bên Phải.
3. Khi quét xong, Pivot sẽ được đặt vào đúng ranh giới ở giữa. Lúc này, Pivot đã chễm chệ nằm ĐÚNG VỊ TRÍ TỐI HẬU của nó, không bao giờ phải di chuyển nữa!
4. Giờ chỉ việc gọi Đệ quy lặp lại trò ném đồ này cho mảng Trái và mảng Phải. 

Vì chúng ta chỉ Swap phần tử qua lại quanh Pivot, ta không cần tạo mảng mới!

---

## 📖 Trực quan hóa "Chia mảng qua Pivot"

Cho mảng `[5, 2, 8, 3, 1, 6, 4]`.
- Chọn **Pivot = 5**.

Bắt đầu duyệt từ số `2`:
- So `2` với `5`. Thấy nhỏ hơn -> Giữ bên Trái.
- So `8` với `5`. Thấy lớn hơn -> Bỏ qua (Đội lớn hơn nằm bên Phải).
- So `3` với `5`. Thấy nhỏ hơn -> **Swap** để ném nó về đội Trái. (Đổi chỗ `3` với `8`) -> `[5, 2, 3, 8, 1, 6, 4]`
- So `1` với `5`. Nhỏ hơn -> **Swap** ném nó về đội Trái. -> `[5, 2, 3, 1, 8, 6, 4]`
- So `6`. Bỏ qua. So `4`. Nhỏ hơn -> **Swap**. -> `[5, 2, 3, 1, 4, 6, 8]`

🔥 Duyệt xong toàn mảng. Có 4 số nhỏ hơn Pivot (là 2, 3, 1, 4). Vậy Pivot (số 5) phải đứng ở vị trí thứ 5 (Index = 4).
**Swap lần cuối:** Đổi `5` (Index 0) với `4` (Index 4).
-> Kết quả: `[4, 2, 3, 1,` **`5`** `, 6, 8]`.

Tuyệt vời! Số `5` đã **Xong nhiệm vụ**. Giờ mảng bị chia làm 2 nửa: Trái `[4, 2, 3, 1]` và Phải `[6, 8]`. Gọi Đệ quy tiếp tục!

---

## 🔨 Implement Quick Sort bằng TypeScript

Đây là thuật toán "hại não" nhất trong mớ sorting cơ bản vì phải thao tác với con trỏ (Index) cực nhiều.

### 1. Hàm Partition (Chia mảng và ném đồ)
Hàm này chọn Pivot ở `start`, đẩy mọi phần tử nhỏ hơn về bên trái, và trả về cái **Index cuối cùng** của Pivot.

```typescript
// filename: quick-sort.ts

function partition(arr: number[], start: number = 0, end: number = arr.length - 1): number {
  // Chọn phần tử đầu tiên làm Pivot
  const pivot = arr[start];
  
  // swapIdx lưu vết vị trí Ranh Giới (để lát nữa đặt Pivot vào)
  let swapIdx = start;

  // Cú pháp hàm Helper để Swap đổi chỗ nhanh trong TS
  const swap = (arr: number[], idx1: number, idx2: number) => {
    [arr[idx1], arr[idx2]] = [arr[idx2], arr[idx1]];
  };

  for (let i = start + 1; i <= end; i++) {
    // Nếu thấy thằng nào nhỏ hơn Pivot
    if (arr[i] < pivot) {
      swapIdx++; // Đẩy ranh giới lên 1 nấc
      swap(arr, swapIdx, i); // Ném thằng nhỏ hơn đó về bên Trái ranh giới
    }
  }

  // Kết thúc vòng lặp, nhấc Pivot ở vị trí start ném vào đúng vị trí ranh giới
  swap(arr, start, swapIdx);
  
  return swapIdx; // Trả về Index của Pivot để biết đường cắt mảng làm đôi
}
```

### 2. Hàm Đệ quy Quick Sort chính
Thay vì cắt mảng đứt ra làm 2 mảng mới bằng `slice()` như Merge Sort, Quick Sort chỉ truyền `Index` vào để giới hạn khu vực làm việc (In-place).

```typescript
// filename: quick-sort.ts

function quickSort(arr: number[], left: number = 0, right: number = arr.length - 1): number[] {
  // Base case: Chừng nào mảng con (tính từ left đến right) còn lớn hơn 1 phần tử
  if (left < right) {
    // Gọi partition để chốt 1 phần tử (Pivot Index)
    let pivotIndex = partition(arr, left, right);
    
    // Đệ quy sắp xếp nửa BÊN TRÁI của Pivot
    quickSort(arr, left, pivotIndex - 1);
    
    // Đệ quy sắp xếp nửa BÊN PHẢI của Pivot
    quickSort(arr, pivotIndex + 1, right);
  }
  
  return arr;
}
```

---

## 🚀 WHAT IF — Kẻ thù lớn nhất của Quick Sort

Quick Sort được xưng tụng vì Space Complexity siêu đẳng **`O(1)`** (Hoặc `O(log n)` nếu tính cả Call Stack của Đệ quy). Nhưng nó ôm một quả bom hẹn giờ về Tốc độ.

### Quả bom Worst Case: `O(n^2)`
Điều gì xảy ra nếu mảng đưa vào **ĐÃ SẮP XẾP SẴN**? (VD: `[1, 2, 3, 4, 5, 6, 7]`).
Khi đó, Pivot (Số 1) không tìm thấy ai nhỏ hơn nó. Ranh giới không di chuyển.
- Lần 1 chốt xong số 1. Nửa trái trống không, nửa phải dài ngoằng `[2, 3, 4, 5, 6, 7]`.
- Lần 2 chốt số 2. Nửa phải lại dài `[3, 4, 5, 6, 7]`.

Nó không hề chia đôi mảng! Nó chia thành 1 mảng nhỏ tí và 1 mảng khổng lồ. 
Sự kiện này phá vỡ cấu trúc Tree (O(log n)) và biến Quick Sort quay về cái máng lợn của vòng lặp lồng nhau **`O(n^2)`**. Tương tự như Bubble Sort.

> **Cách khắc phục thực tế:** Dân Pro không bao giờ lấy phần tử Đầu Tiên làm Pivot. Họ lấy một phần tử ngẫu nhiên (Random Pivot) hoặc lấy trung vị (Median of Three) để đảm bảo không bị dính bẫy mảng đã sắp xếp.

---

## 💬 Tổng kết

Bạn đã đi qua 2 thuật toán hạng nặng.
- Nếu bạn có **RAM dồi dào** và muốn đảm bảo TỐC ĐỘ ỔN ĐỊNH ở mọi trường hợp (Không bao giờ bị sập hầm Worst Case) -> Dùng **Merge Sort**.
- Nếu bạn làm việc trên hệ thống **Kẹt xỉn RAM** (như hệ nhúng, mobile) và tin tưởng dữ liệu được trộn đủ ngẫu nhiên -> Dùng **Quick Sort**.

Vậy giữa Bubble, Selection, Insertion, Merge, và Quick Sort, đâu mới là chân ái của chúng ta trong lập trình hằng ngày?
Hãy đến với bài tổng kết ở Phần tiếp theo để chốt lại toàn bộ bức tranh của thuật toán Sorting!

---
*Made by Anh Tu - Share to be share*
