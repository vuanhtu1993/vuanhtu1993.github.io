---
sidebar_position: 1
title: "17. Bubble Sort — Thuật toán Sắp xếp đơn giản nhất"
description: "Mở đầu phần Thuật toán sắp xếp. Cơ chế Bọt nổi (Bubble up), code TypeScript thực hành và lý do nó thường xuyên bị hắt hủi trong thực tế."
---

# Bubble Sort — Thuật toán đơn giản nhất

Chào mừng bạn đến với **Phần 4: Thuật toán Sắp xếp (Sorting Algorithms)**. 

Bất kỳ hệ thống nào cũng cần sắp xếp dữ liệu (Ví dụ: Lọc danh sách sản phẩm theo giá tăng dần, xếp hạng bài viết theo thời gian mới nhất). Chúng ta thường chỉ cần gõ `array.sort()` là xong. Nhưng dưới lăng kính của một kỹ sư, hiểu rõ máy tính đang "xào bài" như thế nào là cốt lõi để biết khi nào code của mình sẽ chạy siêu tốc, khi nào sẽ khiến server "bốc khói".

Chúng ta sẽ bắt đầu chuỗi Sorting bằng một thuật toán kinh điển nhất, ngây ngô nhất, dễ hiểu nhất: **Bubble Sort (Sắp xếp nổi bọt)**.

## 📋 Agenda

**Thời gian đọc ước tính:** ~5 phút

### Sau bài này, bạn sẽ:
- ✅ **Hiểu** được cơ chế "Nổi bọt" (Bubble up) của phần tử lớn nhất.
- ✅ **Giải thích** được tại sao Time Complexity của Bubble Sort lại là `O(n^2)`.
- ✅ **Tự tay** implement Bubble Sort bằng TypeScript, kèm theo 1 kĩ năng tối ưu cực đỉnh.
- ✅ **Phân biệt** được Best Case (Trường hợp tốt nhất) và Worst Case (Trường hợp xấu nhất).

### Yêu cầu đầu vào:
- 🔹 Có kiến thức cơ bản về vòng lặp lồng nhau (Nested loops) và hoán đổi vị trí trong mảng (`Array`).

---

## ❓ Máy tính sắp xếp mảng kiểu gì?

**Vấn đề (Problem Statement):**
Cho một mảng `[5, 3, 8, 4, 2]`. Máy tính không có con mắt để nhìn bao quát toàn bộ mảng như con người. Nó bị "mù", tại một thời điểm nó chỉ có thể nhìn thấy đúng **hai phần tử cạnh nhau**. 
Làm thế nào để với cái "kính lúp" hạn hẹp đó, máy tính có thể sắp xếp toàn bộ mảng từ nhỏ đến lớn?

**Giải pháp (Solution):**
**Bubble Sort**. Nó duyệt qua mảng nhiều lần. Ở mỗi lần duyệt, nó mang cái kính lúp soi 2 người đứng cạnh nhau: Đứa bên trái LỚN HƠN đứa bên phải? Đổi chỗ (Swap)! Bằng cách lặp lại hành động tráo đổi mù quáng này, đứa to nhất sẽ dần dần "nổi bọt" trôi dạt về cuối mảng.

---

## 📖 Trực quan hóa "Nổi bọt"

**Định nghĩa:** Bubble Sort so sánh từng cặp phần tử liền kề và hoán đổi chúng nếu chúng sai thứ tự. Sau mỗi Vòng lặp (Pass), phần tử lớn nhất còn lại sẽ trôi về đúng vị trí ở cuối mảng.

### Minh họa Vòng 1 (Pass 1)
Cho mảng `[5, 3, 8, 4, 2]`

- So sánh `5` và `3`: `5 > 3` -> **Swap!** -> Mảng thành: `[3, 5, 8, 4, 2]`
- So sánh `5` và `8`: `5 < 8` -> Kệ nó. -> Mảng giữ nguyên.
- So sánh `8` và `4`: `8 > 4` -> **Swap!** -> Mảng thành: `[3, 5, 4, 8, 2]`
- So sánh `8` và `2`: `8 > 2` -> **Swap!** -> Mảng thành: `[3, 5, 4, 2, 8]`

🔥 Kết thúc Vòng 1. Số `8` (lớn nhất) đã **nổi lên đúng vị trí cuối cùng**. Máy tính giờ chỉ cần xếp 4 số còn lại.

---

## 🔨 Implement Bubble Sort bằng TypeScript

### Phiên bản 1: Chưa tối ưu (Cày bừa)
Mỗi vòng (vòng ngoài `i`), ta chốt được 1 số lớn nhất ở cuối. Vậy với mảng độ dài `n`, ta cần chạy tối đa `n` vòng.
Vòng trong (`j`) thì lặp qua các số chưa được chốt.

```typescript
// filename: bubble-sort.ts

function bubbleSort(arr: number[]): number[] {
  // Lấy ra bản copy để không làm mutate mảng gốc (Optional nhưng nên dùng)
  const sortedArr = [...arr]; 
  const n = sortedArr.length;

  for (let i = n; i > 0; i--) {
    // Vòng j lặp ít đi dần, vì những đứa ở cuối đã chốt vị trí rồi
    for (let j = 0; j < i - 1; j++) {
      console.log(`So sánh ${sortedArr[j]} và ${sortedArr[j+1]}`);
      
      // Nếu số trước > số sau -> Hoán đổi (Swap)
      if (sortedArr[j] > sortedArr[j + 1]) {
        // Cú pháp destructuring swap rất gọn trong ES6/TS
        [sortedArr[j], sortedArr[j + 1]] = [sortedArr[j + 1], sortedArr[j]];
      }
    }
  }
  return sortedArr;
}
```
**Time Complexity:** 2 vòng lặp lồng nhau -> **`O(n^2)`**. Quá chậm!

### Phiên bản 2: Tối ưu (Early Exit) — Vũ khí của dân Pro
Có một tình huống đau lòng: Mảng đưa vào ĐÃ ĐƯỢC XẾP SẴN (`[1, 2, 3, 4, 5]`). 
Thuật toán ở trên quá ngu ngốc, nó vẫn cắm đầu chạy đủ `n * n` lần vòng lặp dù không có bất kỳ thao tác Swap nào diễn ra.

Để tối ưu, ta tạo một biến cờ (Flag) `noSwaps`. Nếu sau nguyên 1 vòng `j` mà ta không thấy cái Swap nào xảy ra -> Tức là mảng đã ngăn nắp rồi! Ta break (thoát) vòng lặp ngoài ngay lập tức.

```typescript
// filename: bubble-sort.ts

function optimizedBubbleSort(arr: number[]): number[] {
  const sortedArr = [...arr];
  let noSwaps: boolean;

  for (let i = sortedArr.length; i > 0; i--) {
    noSwaps = true; // Đầu mỗi vòng, giả định là mảng đã sort
    
    for (let j = 0; j < i - 1; j++) {
      if (sortedArr[j] > sortedArr[j + 1]) {
        [sortedArr[j], sortedArr[j + 1]] = [sortedArr[j + 1], sortedArr[j]];
        noSwaps = false; // Có hoán đổi, nghĩa là mảng chưa sort xong
      }
    }
    // Chạy xong 1 vòng j, nếu noSwaps vẫn là true -> Xong phim! Nghỉ thôi!
    if (noSwaps) break; 
  }
  return sortedArr;
}
```

---

## 🚀 WHAT IF — Có ai dùng Bubble Sort trong thực tế không?

**Sự thật phũ phàng:** Bubble Sort gần như **VÔ DỤNG** trong môi trường thực tế (Production).
Nó chỉ là thuật toán "vỡ lòng" để giảng dạy tư duy lập trình ở các trường đại học. Hàm `sort()` của JavaScript/V8 Engine dùng một thuật toán tinh vi hơn rất rất nhiều (TimSort / QuickSort).

### Đánh giá độ phức tạp
- **Space Complexity:** `O(1)` (Tuyệt vời! Không tạo mảng phụ, chỉ hoán đổi tại chỗ).
- **Time Complexity (Worst Case):** `O(n^2)`. (Khi mảng bị sắp xếp ngược hoàn toàn `[5, 4, 3, 2, 1]`).
- **Time Complexity (Best Case):** **`O(n)`**. Nhờ bản tối ưu `noSwaps`, nếu mảng truyền vào Gần-như-đã-sắp-xếp-xong, Bubble Sort chỉ chạy đúng 1 vòng duy nhất và thoát ngay lập tức!

---

## 💬 Thảo luận

Bubble Sort luôn mang phần tử Lớn Nhất đẩy dần về đuôi mảng.
Nhưng nếu chúng ta lật ngược lại tư duy: Thay vì đẩy mù quáng từng bước, chúng ta "Soi" một lượt hết mảng, tìm ra phần tử Nhỏ Nhất, sau đó bốc nó lên và ném thẳng vào Đầu mảng thì sao?

Đó chính là tư tưởng của người anh em "ít hoán đổi hơn" của Bubble: **Selection Sort (Sắp xếp chọn)**. Hãy cùng tìm hiểu ở bài tiếp theo!

---
*Made by Anh Tu - Share to be share*
