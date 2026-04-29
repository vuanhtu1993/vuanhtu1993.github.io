---
sidebar_position: 2
title: "18. Selection Sort — Tìm Min và đặt vào vị trí"
description: "Cơ chế Chọn lọc (Selection). Thuật toán này hạn chế thao tác Swap như thế nào so với Bubble Sort và lúc nào thì nên dùng."
---

# Selection Sort — Tìm Min và đặt vào vị trí

Ở bài trước, [Bubble Sort](./01-bubble-sort.md) có một khuyết điểm rất "trẻ con": Nó hoán đổi (Swap) vị trí liên tục. Cứ thấy 2 phần tử cạnh nhau sai sai là nó Swap ngay, dù cái Swap đó chưa chắc đã đưa phần tử về đúng vị trí cuối cùng.
Trong lập trình, đặc biệt là khi thao tác với bộ nhớ máy tính hoặc ghi file ra ổ cứng, hành động Ghi (Swap) tốn tài nguyên hơn rất nhiều so với hành động Đọc (So sánh).

Làm thế nào để giảm thiểu tối đa số lần Swap? Chào mừng bạn đến với **Selection Sort (Sắp xếp chọn)**.

## 📋 Agenda

**Thời gian đọc ước tính:** ~5 phút

### Sau bài này, bạn sẽ:
- ✅ **Hiểu** được triết lý "Nhìn toàn cục, Hành động cục bộ" của Selection Sort.
- ✅ **Tự tay** implement Selection Sort bằng TypeScript.
- ✅ **So sánh** được sự khác nhau cốt lõi giữa Selection Sort và Bubble Sort.
- ✅ **Nhận diện** được Time Complexity của thuật toán này trong mọi trường hợp.

### Yêu cầu đầu vào:
- 🔹 Đã nắm vững [Bubble Sort](./01-bubble-sort.md).

---

## ❓ Triết lý của sự Chọn lọc

**Vấn đề (Problem Statement):**
Cho mảng `[5, 3, 8, 4, 2]`. Bubble Sort sẽ Swap liên tục `5` và `3`, rồi `8` và `4`, v.v... Mới chạy được một vòng đã tốn đến 3-4 cú Swap. Việc ghi vào bộ nhớ quá nhiều lần khiến thuật toán bị chậm rề rà.

**Giải pháp (Solution):**
**Selection Sort**. Thay vì mù quáng đổi chỗ, nó bình tĩnh làm 2 việc:
1. Đứng ở vị trí Đầu tiên, quét mắt nhìn một lượt TẤT CẢ các phần tử còn lại để **Tìm ra đứa Nhỏ Nhất (Min)**.
2. Tìm được rồi mới cầm đứa Min đó, đổi chỗ (Swap) 1 LẦN DUY NHẤT với phần tử Đầu tiên.

Bằng cách này, mỗi vòng lặp chỉ có TỐI ĐA 1 cú Swap diễn ra!

---

## 📖 Trực quan hóa "Sắp xếp Chọn"

**Định nghĩa:** Selection Sort duyệt mảng nhiều lần. Ở mỗi lần duyệt, nó tìm phần tử nhỏ nhất trong mảng chưa sắp xếp và hoán đổi nó với phần tử đầu tiên của mảng chưa sắp xếp đó.

### Minh họa Vòng 1 (Pass 1)
Cho mảng `[5, 3, 8, 4, 2]`

- Vị trí đang xét: **Index 0 (Giá trị 5)**. Giả sử 5 đang là Min.
- Quét các phần tử phía sau `[3, 8, 4, 2]`.
- Thấy `3 < 5` -> Min tạm thời là 3.
- Thấy `2 < 3` -> Min Tối Hậu là `2` (tại Index 4).
- **Swap!** Đổi chỗ Index 0 và Index 4. -> Mảng thành: `[2, 3, 8, 4, 5]`

🔥 Kết thúc Vòng 1. Số `2` (nhỏ nhất) đã **nằm đúng vị trí đầu tiên**. Giờ chỉ cần xếp phần còn lại từ Index 1.

---

## 🔨 Implement Selection Sort bằng TypeScript

Khác với Bubble Sort cắm đầu đổi chỗ, ở Selection Sort chúng ta lưu lại `lowestIndex` và chỉ Swap ở CUỐI vòng lặp.

```typescript
// filename: selection-sort.ts

function selectionSort(arr: number[]): number[] {
  const sortedArr = [...arr];

  for (let i = 0; i < sortedArr.length; i++) {
    // 💡 1. Mặc định phần tử đầu vòng lặp là Nhỏ nhất
    let lowestIndex = i;

    // 💡 2. Quét các phần tử phía sau để tìm Min thực sự
    for (let j = i + 1; j < sortedArr.length; j++) {
      if (sortedArr[j] < sortedArr[lowestIndex]) {
        // Cập nhật lại Index của thằng nhỏ hơn (Chỉ lưu Index, KHÔNG Swap)
        lowestIndex = j; 
      }
    }

    // 💡 3. Cuối vòng lặp, nếu Min thực sự KHÔNG PHẢI là thằng mặc định ban đầu -> Swap!
    if (i !== lowestIndex) {
      console.log(`Đổi chỗ ${sortedArr[i]} và ${sortedArr[lowestIndex]}`);
      [sortedArr[i], sortedArr[lowestIndex]] = [sortedArr[lowestIndex], sortedArr[i]];
    }
  }

  return sortedArr;
}
```

---

## 🚀 WHAT IF — Đánh giá sức mạnh

### So sánh Bubble Sort vs Selection Sort

| Tiêu chí | Bubble Sort | Selection Sort |
|---|---|---|
| **Cơ chế** | Đẩy số LỚN NHẤT về cuối mảng | Đưa số NHỎ NHẤT lên đầu mảng |
| **Số lần Swap (Ghi bộ nhớ)** | Rất nhiều (Có thể Swap mỗi bước) | **Cực ít** (Tối đa 1 lần Swap mỗi vòng) |
| **Best Case (Mảng đã sort sẵn)** | `O(n)` (Nhờ tối ưu `noSwaps`) | **`O(n^2)`** (Vẫn ngu ngốc quét lại toàn mảng vì sợ bỏ sót Min) |

### ⚠️ Pitfalls hay gặp

**Sự chậm chạp vô phương cứu chữa:**
Selection Sort có một điểm yếu chí mạng: Dù mảng đưa vào có lộn xộn, hay ĐÃ SẮP XẾP SẴN, nó vẫn không nhận ra được. Nó vẫn phải cắm đầu chạy vòng lặp thứ 2 để đi tìm cái thằng Min (mặc dù thằng Min đang lù lù đứng ngay đầu).
Do đó, Time Complexity của Selection Sort là **`O(n^2)` trong MỌI TRƯỜNG HỢP** (Best, Average, Worst).

Chính vì thế, Selection Sort rất hiếm khi được sử dụng trong thực tế, trừ khi hệ thống của bạn có "Giá trị của việc Ghi (Swap) vào bộ nhớ là quá đắt đỏ so với việc Đọc".

---

## 💬 Thảo luận

Bubble Sort và Selection Sort là cặp anh em "cùng tiến, cùng lùi" với độ phức tạp `O(n^2)`. Chúng ta vừa thấy Selection giảm được số lần Swap, nhưng lại phế đi khả năng nhận diện mảng đã sắp xếp.

Có cách nào mô phỏng lại cách mà con người chúng ta hay làm ngoài đời thực không? Ví dụ, khi bạn chơi bài Tiến Lên, bạn được chia 10 lá bài. Bạn cầm từng lá lên, so sánh với những lá đang có trên tay, và CHÈN nó vào đúng vị trí hợp lý.

Chào mừng bạn đến thuật toán O(n²) cuối cùng, mạnh mẽ nhất và gần gũi với con người nhất: **Insertion Sort (Sắp xếp chèn)**.

---
*Made by Anh Tu - Share to be share*
