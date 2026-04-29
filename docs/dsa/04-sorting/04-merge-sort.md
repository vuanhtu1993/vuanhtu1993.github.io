---
sidebar_position: 4
title: "20. Merge Sort — Sức mạnh của Chia để Trị"
description: "Khám phá thuật toán O(n log n) đầu tiên. Sức mạnh của chiến lược Divide & Conquer (Chia để trị) kết hợp với Đệ quy."
---

# Merge Sort — Sức mạnh của Chia để Trị

Với những mảng nhỏ (vài chục phần tử), Insertion Sort làm việc rất tốt. Nhưng khi dữ liệu phình to lên hàng triệu bản ghi (ví dụ: Log hệ thống, Danh sách khách hàng), các thuật toán sơ cấp `O(n^2)` sẽ khiến CPU phải chạy hàng ngàn tỉ phép tính — máy chủ sẽ sập!

Để phá vỡ giới hạn tốc độ `O(n^2)`, chúng ta phải thay đổi hoàn toàn tư duy. Không cày bừa từ đầu đến cuối mảng nữa. Chào mừng bạn đến với chiến lược đỉnh cao trong Khoa học máy tính: **Divide and Conquer (Chia để Trị)**. Và đại diện xuất sắc nhất của nó: **Merge Sort**.

## 📋 Agenda

**Thời gian đọc ước tính:** ~8 phút

### Sau bài này, bạn sẽ:
- ✅ **Hiểu** được triết lý Divide and Conquer là gì.
- ✅ **Nhận diện** được một sự thật hiển nhiên: Mảng 0 hoặc 1 phần tử luôn luôn là mảng Đã được sắp xếp.
- ✅ **Tự tay** viết hàm Gộp mảng (Merge) và hàm Cắt mảng (Merge Sort) bằng Đệ quy.
- ✅ **Giải thích** được sức mạnh của độ phức tạp thời gian **`O(n log n)`**.
- ✅ **Chỉ ra** được điểm yếu chí mạng về bộ nhớ (Space Complexity) của thuật toán này.

### Yêu cầu đầu vào:
- 🔹 Có kiến thức cơ bản về [Đệ quy (Recursion)](../05-searching-advanced/04-recursion.md) trong TypeScript.

---

## ❓ Làm sao để phá vỡ giới hạn O(n²)?

**Vấn đề (Problem Statement):**
Bạn đang đối mặt với một mảng khổng lồ 1.000.000 phần tử. Nếu dùng O(n²), số phép tính là 1.000.000 * 1.000.000 = **1 nghìn tỷ bước**. Quá kinh khủng.

**Giải pháp (Solution):**
Triết lý **Chia để Trị**. 
Thay vì cố gắng sắp xếp 1 triệu phần tử, tôi "Cắt đôi" mảng đó ra thành 2 mảng 500k phần tử. Tôi giao cho 2 đệ tử xử lý. Đệ tử lại cắt đôi tiếp thành mảng 250k... Cứ cắt mãi cho đến khi mảng chỉ còn đúng **1 phần tử**. 
*(Một mảng có 1 phần tử thì hiển nhiên là nó Đã Được Sắp Xếp!)*.
Việc cuối cùng là ghép (Merge) hai mảng 1 phần tử đã xếp đó lại thành mảng 2 phần tử được sắp xếp, rồi ghép dần lên thành 1 triệu phần tử.

---

## 📖 Trực quan hóa "Chia và Gộp"

**Định nghĩa:** Merge Sort là thuật toán sắp xếp dựa trên Đệ quy. Nó liên tục chia mảng làm đôi cho đến khi các mảng con chỉ còn 0 hoặc 1 phần tử. Sau đó, nó gộp (Merge) các mảng con này lại với nhau sao cho kết quả gộp luôn được sắp xếp.

### Biểu đồ Divide (Chia) & Conquer (Gộp)

```mermaid
flowchart TD
    subgraph Divide [Bước Chia (Cắt Đôi)]
        D1("[8, 3, 5, 4, 7, 6, 1, 2]") --> D2("[8, 3, 5, 4]")
        D1 --> D3("[7, 6, 1, 2]")
        
        D2 --> D4("[8, 3]")
        D2 --> D5("[5, 4]")
        
        D4 --> D8("[8]")
        D4 --> D9("[3]")
    end
    
    subgraph Conquer [Bước Trị (Gộp lại)]
        C8("[8]") --> C4("[3, 8]")
        C9("[3]") --> C4
        
        C10("[5]") --> C5("[4, 5]")
        C11("[4]") --> C5
        
        C4 --> C2("[3, 4, 5, 8]")
        C5 --> C2
    end
    
    Divide -.-> Conquer
    
    style D8 fill:#ff6b6b,color:#fff
    style D9 fill:#ff6b6b,color:#fff
    style C4 fill:#4ecdc4,color:#000
    style C2 fill:#f39c12,color:#fff
```

### Tại sao GỘP 2 mảng ĐÃ SẮP XẾP lại Rất Nhanh?
Hãy tưởng tượng bạn có 2 bộ bài Đã Sắp Xếp ngửa mặt lên bàn: `[2, 5]` và `[1, 6]`.
Bạn chỉ cần nhìn vào 2 lá trên cùng.
- Nhìn `2` và `1` -> Rút lá `1` úp xuống bàn mới. (Còn lại `[2, 5]` và `[6]`)
- Nhìn `2` và `6` -> Rút lá `2` úp xuống. (Còn lại `[5]` và `[6]`)
- Rút tiếp `5`, rồi rút nốt `6`.

**Kết quả:** Bạn chỉ đi qua các lá bài ĐÚNG MỘT LẦN! Thời gian Gộp là **O(n)**. Nhanh khủng khiếp!

---

## 🔨 Implement Merge Sort bằng TypeScript

Đây là lúc bạn áp dụng kỹ năng viết Code dạng Module (Tách hàm). Thuật toán này gồm 2 hàm tách biệt.

### Hàm 1: Hàm Gộp (Merge) hai mảng đã sắp xếp
Đây là trái tim của thuật toán. Nhiệm vụ của nó là nhận 2 mảng đã sắp xếp, và trả về 1 mảng tổng đã sắp xếp với O(n).
*Chúng ta sẽ dùng kỹ thuật Two Pointers (2 con trỏ).*

```typescript
// filename: merge-sort.ts

function merge(arr1: number[], arr2: number[]): number[] {
  let results: number[] = [];
  let i = 0; // Con trỏ của arr1
  let j = 0; // Con trỏ của arr2

  // Chừng nào cả 2 mảng chưa hết phần tử
  while (i < arr1.length && j < arr2.length) {
    if (arr2[j] > arr1[i]) {
      results.push(arr1[i]);
      i++; // Đẩy con trỏ lên
    } else {
      results.push(arr2[j]);
      j++; // Đẩy con trỏ lên
    }
  }

  // Nếu arr1 bị quét hết trước, arr2 vẫn còn thừa phần tử ở đuôi
  // -> Mảng arr2 vốn dĩ đã sort sẵn, nên ta hốt thẳng toàn bộ phần thừa đẩy vào kết quả
  while (i < arr1.length) {
    results.push(arr1[i]);
    i++;
  }
  while (j < arr2.length) {
    results.push(arr2[j]);
    j++;
  }

  return results;
}
```

### Hàm 2: Hàm đệ quy Merge Sort (Bước Cắt Đôi)
Hàm này sẽ dùng Đệ quy để liên tục cắt mảng cho đến khi chạm "Đáy" (mảng chỉ còn 0 hoặc 1 phần tử).

```typescript
// filename: merge-sort.ts

function mergeSort(arr: number[]): number[] {
  // 💡 Base Case (Điểm dừng của đệ quy): Mảng có độ dài <= 1
  if (arr.length <= 1) return arr;

  // 1. Cắt đôi mảng
  let mid = Math.floor(arr.length / 2);
  
  // 2. Gọi đệ quy để cắt tiếp mảng Trái và mảng Phải (cho đến khi chạm đáy)
  let left = mergeSort(arr.slice(0, mid));
  let right = mergeSort(arr.slice(mid));

  // 3. Gọi hàm `merge` bên trên để GỘP mảng Trái và Phải lại với nhau
  return merge(left, right);
}
```

---

## 🚀 WHAT IF — Quyền năng của O(n log n)

### Phân tích Time Complexity: O(n log n)
Nhìn vào sơ đồ Cây ở trên, bạn sẽ thấy:
- **Bước Cắt (O(log n)):** Một mảng 8 phần tử, phải cắt 3 lần mới xuống đáy (1 phần tử). 3 chính là `log2 của 8`. Mảng 1 tỷ phần tử cũng chỉ cần cắt đúng 30 lần. Rất nhanh!
- **Bước Gộp (O(n)):** Ở mỗi "Tầng" cắt, ta phải dùng hàm `merge` quét qua tổng cộng `n` phần tử để gộp lại.
- **Tổng cộng:** Chúng ta có `log n` tầng, mỗi tầng làm việc tốn `n` phép toán. -> **O(n * log n)**.

Với mảng 1 triệu phần tử, thuật toán sơ cấp tốn 1000 tỷ phép tính. **Merge Sort chỉ tốn 20 triệu phép tính!** Bạn đã hiểu vì sao nó là thuật toán của hệ thống lớn chưa?

### ⚠️ Pitfall: Kẻ thù mang tên Space Complexity (Bộ nhớ RAM)

Sự hoàn hảo không tồn tại. Merge Sort nhanh hơn Insertion Sort hàng vạn lần, nhưng nó ăn bộ nhớ RAM một cách khủng khiếp.

Nhìn lại hàm `mergeSort`:
```typescript
let left = mergeSort(arr.slice(0, mid));
let right = mergeSort(arr.slice(mid));
```
Hàm `Array.slice()` của JavaScript tạo ra một **MẢNG MỚI COPY TỪ MẢNG CŨ**. Nó không tham chiếu!
Nếu bạn có mảng 10 triệu bản ghi, Merge Sort sẽ tạo ra hàng chục triệu cái mảng con mới trong RAM để làm nháp. Bộ nhớ tăng theo O(n). Hậu quả? Sập Node.js Server vì `Heap out of memory`.

---

## 💬 Thảo luận

Merge Sort giải quyết hoàn hảo bài toán Tốc độ, nhưng lại vướng vào điểm yếu chí mạng về Bộ nhớ. 

Làm thế nào để vẫn giữ được tốc độ bàn thờ O(n log n), vừa dùng tư duy "Chia để trị", nhưng lại **KHÔNG tạo thêm bất kỳ mảng phụ nào**? Làm sao để tráo đổi các phần tử ngay trên chính mảng gốc đó (In-place sorting)?

Chào mừng bạn đến với thuật toán sắp xếp nổi tiếng nhất, được sử dụng trong thư viện chuẩn của C++, Java và hệ điều hành: **Quick Sort (Sắp xếp nhanh)**.

---
*Made by Anh Tu - Share to be share*
