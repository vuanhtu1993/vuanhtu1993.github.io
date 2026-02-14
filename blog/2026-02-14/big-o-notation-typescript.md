---
title: "Giải Mã Big O Notation: Độ Phức Tạp Thuật Toán Với TypeScript"
description: "Hướng dẫn chi tiết về Big O, cách tính độ phức tạp thuật toán và ví dụ minh họa bằng TypeScript dễ hiểu cho người mới bắt đầu."
authors: [anhhtus]
tags: [algorithms, typescript, big-o, optimization]
image: https://upload.wikimedia.org/wikipedia/commons/3/39/Big_O_notation.png
---

Bạn đã bao giờ tự hỏi tại sao code chạy "vèo vèo" với 10 phần tử nhưng lại "đứng hình" khi dữ liệu lên tới 10.000 phần tử? Hoặc tại sao nhà tuyển dụng luôn hỏi về Big O trong các buổi phỏng vấn kỹ thuật?

Câu trả lời nằm ở **Big O Notation** - thước đo hiệu năng của thuật toán. Bài viết này sẽ giúp bạn hiểu rõ bản chất của Big O thông qua những ví dụ TypeScript gần gũi nhất.

<!--truncate-->

## 1. Analogy: Tìm Sách Trong Thư Viện 📚

Hãy tưởng tượng bạn đang ở trong một thư viện khổng lồ và cần tìm cuốn sách "Clean Code".

*   **Trường hợp 1:** Bạn có một mã số chính xác của cuốn sách và vị trí kệ sách. Bạn đi thẳng đến đó và lấy sách. Dù thư viện có 100 cuốn hay 1 triệu cuốn, thời gian bạn lấy sách là **như nhau**. Đây là **O(1)**.
*   **Trường hợp 2:** Sách không được sắp xếp. Bạn phải đi tìm từng kệ, từng cuốn một cho đến khi thấy nó. Nếu may mắn, nó ở ngay đầu (Best case). Nếu xui, nó ở cuốn cuối cùng (Worst case). Số lượng sách càng nhiều, bạn tìm càng lâu. Đây là **O(n)**.
*   **Trường hợp 3:** Sách được sắp xếp theo Alpha B. Bạn mở mục lục, tìm vần "C", rồi tìm tiếp đến tên sách. Mỗi lần tìm kiếm, bạn loại bỏ được một lượng lớn các cuốn không liên quan. Đây là **O(log n)**.

**Big O** chính là ngôn ngữ để mô tả sự thay đổi của thời gian (hoặc bộ nhớ) khi dữ liệu đầu vào (số lượng sách) tăng lên.

## 2. Big O Notation Là Gì? 

### Định nghĩa đơn giản
Big O Notation (Ký hiệu Big O) là một công cụ toán học dùng để mô tả **giới hạn trên** (upper bound) của độ phức tạp của một thuật toán. Nói cách khác, nó cho biết thuật toán sẽ chạy chậm đến mức nào trong **trường hợp tồi tệ nhất** (Worst Case) khi dữ liệu đầu vào (`n`) tăng lên vô hạn.

### Tại sao cần quan tâm?
1.  **Scalability (Khả năng mở rộng):** Code chạy tốt ở localhost chưa chắc chạy tốt ở production với triệu users.
2.  **Performance Optimization:** Giúp xác định điểm nghẽn (bottleneck) để tối ưu.
3.  **Trade-off:** Đôi khi phải hy sinh bộ nhớ (Space) để đổi lấy tốc độ (Time) và ngược lại.

### Time Complexity vs Space Complexity
*   **Time Complexity:** Thời gian chạy của thuật toán tăng thế nào theo input `n`.
*   **Space Complexity:** Bộ nhớ RAM cần thêm bao nhiêu khi input `n` tăng.

## 3. Các Độ Phức Tạp Phổ Biến (The Big 7) 📉

Dưới đây là 7 mức độ phức tạp thường gặp, sắp xếp từ **tốt nhất** đến **tệ nhất**.

```mermaid
graph LR
    A[O(1)] --> B[O(log n)]
    B --> C[O(n)]
    C --> D[O(n log n)]
    D --> E[O(n^2)]
    E --> F[O(2^n)]
    F --> G[O(n!)]
    style A fill:#4caf50,stroke:#333
    style B fill:#8bc34a,stroke:#333
    style C fill:#ffeb3b,stroke:#333
    style D fill:#ff9800,stroke:#333
    style E fill:#ff5722,stroke:#333
    style F fill:#f44336,stroke:#333
    style G fill:#b71c1c,stroke:#333
```

### 3.1 O(1) - Constant Time (Hằng số)
Thời gian chạy **không đổi**, bất kể input lớn cỡ nào.

```typescript
// ✅ Ví dụ: Truy cập phần tử mảng theo index
function getItem(arr: number[], index: number): number {
  return arr[index]; // Luôn tốn 1 bước thực hiện
}
```

### 3.2 O(log n) - Logarithmic Time
Thời gian chạy tăng rất chậm khi input tăng. Thường thấy trong các thuật toán tìm kiếm trên dữ liệu đã sắp xếp (Binary Search).

_Ví dụ: Tìm số trong danh bạ điện thoại._

```typescript
// ✅ Ví dụ: Binary Search
function binarySearch(arr: number[], target: number): number {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}
// Mỗi bước lặp, số phần tử cần tìm giảm đi một nửa.
```

### 3.3 O(n) - Linear Time (Tuyến tính)
Thời gian chạy tăng **tỷ lệ thuận** với input. Input tăng gấp đôi, thời gian chạy tăng gấp đôi.

```typescript
// ✅ Ví dụ: Vòng lặp đơn
function printAll(arr: number[]): void {
  for (let i = 0; i < arr.length; i++) {
    console.log(arr[i]);
  }
}
```

### 3.4 O(n log n) - Linearithmic Time
Thường thấy trong các thuật toán sắp xếp hiệu quả (Merge Sort, Quick Sort). Tệ hơn O(n) một chút nhưng vẫn rất tốt.

```typescript
// ✅ Ví dụ: Merge Sort (Simplified)
// TypeScript's .sort() thường là O(n log n) tùy engine
const numbers = [5, 3, 8, 1];
numbers.sort((a, b) => a - b); 
```

### 3.5 O(n^2) - Quadratic Time (Bình phương)
Thời gian chạy tăng theo bình phương của input. Thường gặp khi có **2 vòng lặp lồng nhau**.

> ⚠️ **Cảnh báo:** Tránh xa O(n^2) nếu dữ liệu lớn (> 10,000 phần tử).

```typescript
// ❌ Ví dụ: Bubble Sort hoặc 2 vòng for lồng nhau
function printPairs(arr: number[]): void {
  for (let i = 0; i < arr.length; i++) { // n
    for (let j = 0; j < arr.length; j++) { // n
      console.log(`${arr[i]}, ${arr[j]}`);
    }
  }
}
// Tổng độ phức tạp: n * n = n^2
```

### 3.6 O(2^n) - Exponential Time (Hàm mũ)
Thời gian chạy tăng gấp đôi với mỗi phần tử thêm vào. Thường thấy trong các bài toán đệ quy không tối ưu.

```typescript
// ❌ Ví dụ: Fibonacci đệ quy (Chưa tối ưu)
function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
// 10 -> 89 bước
// 50 -> ...Máy sẽ treo!
```

### 3.7 O(n!) - Factorial Time (Giai thừa)
Cực kỳ chậm. Thường gặp trong bài toán liệt kê tất cả hoán vị (Permutations).

_Ví dụ: Bài toán người du lịch (Traveling Salesman Problem) vét cạn._

## 4. Best Case, Average Case, Worst Case

Khi nói về Big O, chúng ta thường tập trung vào **Worst Case (Trường hợp tồi nhất)**. Tại sao?

*   **Best Case (Omega - Ω):** Viễn cảnh trong mơ. Ví dụ tìm kiếm tuyến tính thấy ngay ở phần tử đầu tiên (O(1)). Ít có giá trị thực tế để đánh giá hiệu năng.
*   **Average Case (Theta - Θ):** Trường hợp trung bình. Khó tính toán chính xác vì phụ thuộc vào phân phối dữ liệu.
*   **Worst Case (Big O - O):** Đảm bảo thuật toán **không bao giờ chậm hơn** mức này. Đây là "lưới an toàn" cho kỹ sư.

## 5. Tổng Kết (Mindmap) 🧠

```mermaid
mindmap
  root((Big O Notation))
    Definition
      Measure Algorithm Efficiency
      Focus on Worst Case
      Time vs Space Complexity
    Common Notations
      (O_1) Constant Time
      (O_log_n) Binary Search
      (O_n) Simple Loop
      (O_n_log_n) Merge Sort
      (O_n_2) Nested Loops
      (O_2_n) Recursive Fibonacci
      (O_n_factorial) Permutations
    Key Takeaways
      Ignore Constants
      Consider Input Size
      Trade_off Time_Space
```

## Actionable Tips 💡

1.  Thấy **vòng lặp lồng nhau**? Coi chừng **O(n^2)**. Hãy tìm cách đưa về **O(n)** dùng Hash Map.
2.  Thấy dữ liệu đã **sắp xếp**? Nghĩ ngay đến **Binary Search O(log n)**.
3.  Cần xử lý chuỗi/mảng con? Cửa sổ trượt (Sliding Window) thường giúp giải quyết trong **O(n)**.

---
_Made by Anh Tu - Share to be share_
