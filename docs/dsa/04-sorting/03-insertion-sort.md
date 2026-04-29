---
sidebar_position: 3
title: "19. Insertion Sort — Như sắp xếp bài tú lơ khơ"
description: "Thuật toán sắp xếp chèn. Phân tích cơ chế và tại sao nó lại là thuật toán O(n^2) tốt nhất trong một số trường hợp thực tế."
---

# Insertion Sort — Như cách bạn chơi bài

Bubble Sort và Selection Sort có một điểm chung: Chúng đều quét qua mảng từ đầu đến cuối một cách máy móc, bất chấp việc phần nửa mảng có khi đã được sắp xếp gọn gàng rồi.

Hãy trở lại với đời thực. Khi bạn được chia 10 lá bài Tiến Lên. Bạn không trải 10 lá ra bàn rồi tìm là Nhỏ nhất như Selection Sort. Bạn cầm 1 lá lên tay. Bạn cầm tiếp lá thứ 2, so sánh với lá trên tay và **Chèn** nó vào trước hoặc sau. Khi cầm lá thứ 3, bạn lại đối chiếu với 2 lá trên tay và **Chèn** vào giữa. 

Đó chính xác là cách hoạt động của thuật toán hiệu quả nhất trong bộ 3 thuật toán "sơ cấp": **Insertion Sort (Sắp xếp chèn)**.

## 📋 Agenda

**Thời gian đọc ước tính:** ~6 phút

### Sau bài này, bạn sẽ:
- ✅ **Hiểu** được triết lý chia mảng thành phần "Đã sắp xếp" và "Chưa sắp xếp".
- ✅ **Tự tay** implement Insertion Sort bằng TypeScript.
- ✅ **Giải thích** được sức mạnh của Insertion Sort khi làm việc với Dữ liệu Streaming (nhận liên tục).
- ✅ **Nhận diện** được ưu thế tuyệt đối của nó so với Bubble và Selection Sort.

### Yêu cầu đầu vào:
- 🔹 Có kiến thức cơ bản về mảng và vòng lặp.

---

## ❓ Tại sao lại phải "Chèn"?

**Vấn đề (Problem Statement):**
Bạn đang làm chức năng Bảng xếp hạng điểm số (Leaderboard) theo thời gian thực (Realtime). Server nhận liên tục điểm của người dùng mới gửi lên.
Nếu dùng Selection Sort, mỗi khi có 1 điểm mới gửi lên, hệ thống phải quét lại toàn bộ bảng xếp hạng từ đầu đến cuối để sắp xếp lại (O(n²)). Rất tốn kém!

**Giải pháp (Solution):**
**Insertion Sort**. Nó coi mảng hiện tại là *Đã được sắp xếp sẵn*. Khi có 1 con số mới rơi xuống, nó chỉ việc so sánh lùi dần từ dưới lên trên. Khi tìm thấy vị trí phù hợp, nó **chèn** con số đó vào. Nếu số đó rất nhỏ, nó trôi về đầu. Nếu số đó lớn, nó nằm yên ở cuối mà không cần làm gì thêm.

---

## 📖 Trực quan hóa "Sắp xếp Chèn"

**Định nghĩa:** Insertion Sort xây dựng mảng kết quả từng phần tử một. Nó duyệt qua từng phần tử chưa được sắp xếp và **chèn** nó vào đúng vị trí trong mảng con (nằm bên trái) đã được sắp xếp trước đó.

### Minh họa Vòng lặp
Cho mảng `[5, 3, 8, 4, 2]`

- Ban đầu: Coi phần tử đầu tiên `[5]` là Mảng con Đã Sắp Xếp. `[3, 8, 4, 2]` là chưa sắp xếp.
- Cầm `3` lên: So với `5`. Thấy `3 < 5`, chèn `3` ra đằng trước. -> `[3, 5, 8, 4, 2]`
- Cầm `8` lên: So với `5`. Thấy `8 > 5`, nằm im tại chỗ! Cực kì nhanh. -> `[3, 5, 8, 4, 2]`
- Cầm `4` lên: So với `8` (nhỏ hơn, 8 lùi ra sau). So với `5` (nhỏ hơn, 5 lùi ra sau). So với `3` (LỚN HƠN!). Chèn `4` vào sau `3`. -> `[3, 4, 5, 8, 2]`
- ... và tiếp tục với số `2`.

---

## 🔨 Implement Insertion Sort bằng TypeScript

Thay vì dùng lệnh `[a, b] = [b, a]` (Swap) tốn kém, thuật toán này dùng **Shift (dịch chuyển)**. Nó nhấc một phần tử ra (lưu vào biến `currentVal`), dời các phần tử lớn hơn sang phải 1 bước, tạo ra khoảng trống, rồi đặt `currentVal` vào đó.

```typescript
// filename: insertion-sort.ts

function insertionSort(arr: number[]): number[] {
  const sortedArr = [...arr];

  // 💡 Bắt đầu từ Index 1 (Bỏ qua Index 0 vì coi như nó đã được sắp xếp)
  for (let i = 1; i < sortedArr.length; i++) {
    // Nhấc lá bài tại vị trí i lên (cầm trên tay)
    let currentVal = sortedArr[i];
    
    // So sánh ngược về các lá bài bên TRÁI
    let j = i - 1;
    
    // Chừng nào lá bài trên tay nhỏ hơn lá bài đang so sánh...
    // ... thì bắt lá bài đó dời sang Phải 1 bước để nhường chỗ
    while (j >= 0 && sortedArr[j] > currentVal) {
      sortedArr[j + 1] = sortedArr[j]; // Dịch qua phải
      j--; // Tiếp tục so sánh lùi về trước
    }

    // Khi vòng lặp while kết thúc (tìm được người nhỏ hơn, hoặc đụng tường j=-1)
    // -> Đặt lá bài trên tay vào khoảng trống
    sortedArr[j + 1] = currentVal;
  }

  return sortedArr;
}
```

---

## 🚀 WHAT IF — Sức mạnh đáng gờm của Insertion Sort

Mặc dù mang tiếng là thuật toán **`O(n^2)`** (Worst Case khi mảng bị ngược hoàn toàn `[5, 4, 3, 2, 1]`), Insertion Sort lại sở hữu những khả năng độc tôn mà cả những thuật toán siêu khủng O(n log n) phía sau cũng phải ghen tị.

### 1. Vua của dữ liệu "Gần như đã sắp xếp" (Nearly Sorted Data)
Nếu mảng đầu vào của bạn đã có trật tự, hoặc chỉ sai lệch vài vị trí (Ví dụ: Server nhận logs theo thời gian thực nhưng có 1 log bị delay chèn vào giữa). 
Insertion Sort khi chạy qua mảng này sẽ TỪ CHỐI vòng lặp `while`. Nó chỉ liếc qua và đi tiếp. Thời gian lúc này tiệm cận **`O(n)`** (Siêu tốc độ!).

### 2. Sắp xếp trực tuyến (Online Algorithm / Streaming Data)
Insertion Sort không cần có MỘT LÚC toàn bộ mảng để sắp xếp. Nó có thể **chờ nhận từng dữ liệu một từ Internet** và chèn ngay lập tức vào mảng hiện tại. 
*(Bubble hay Selection Sort bắt buộc phải có toàn bộ mảng mới chạy được).*

### 3. Sát thủ ở mảng nhỏ (Small Arrays)
Các thuật toán xịn sò như Quick Sort / Merge Sort có Time Complexity O(n log n). Nhưng chúng tiêu tốn rất nhiều tài nguyên để khởi tạo Call Stack (do dùng đệ quy). 
V8 Engine của Chrome siêu việt đến mức: Khi chạy hàm `array.sort()`, nếu V8 nhận thấy mảng chỉ có dưới **10 phần tử**, nó lập tức từ bỏ thuật toán xịn và tự động kích hoạt **Insertion Sort** để tối ưu hóa bộ nhớ CPU!

---

## 💬 Tổng kết các thuật toán Sơ cấp (O(n²))

Chúng ta đã đi qua 3 thuật toán nền tảng. Là một Junior Dev, bạn chỉ cần nhớ bảng tổng hợp này:

| Thuật toán | Worst Case | Best Case | Đặc điểm nhận dạng |
|---|---|---|---|
| **Bubble Sort** | O(n²) | O(n) | Swap liên tục để đứa To Nhất nổi lên đuôi. Rất rùa bò. |
| **Selection Sort** | O(n²) | O(n²) | Tìm Min xong mới Swap. Dù mảng đã sắp xếp vẫn chạy full O(n²). |
| **Insertion Sort** | O(n²) | O(n) | Cực giỏi với dữ liệu Nhận liên tục (Realtime) hoặc mảng gần sắp xếp xong. |

Bạn sẽ không muốn dùng 3 thuật toán này cho mảng 100,000 phần tử (O(n²) sẽ cắn sạch CPU). 
Làm thế nào để các hệ thống Big Data có thể sắp xếp hàng triệu bản ghi trong tích tắc? Đã đến lúc chúng ta mở khóa các **Thuật toán chia để trị (Divide and Conquer)** với độ phức tạp thần thánh **`O(n log n)`**.

Chào mừng bạn đến với **Merge Sort** ở bài tiếp theo!

---
*Made by Anh Tu - Share to be share*
