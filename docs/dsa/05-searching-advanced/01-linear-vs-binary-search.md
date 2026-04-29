---
sidebar_position: 1
title: "23. Linear vs Binary Search — Bí mật của việc Cắt đôi"
description: "Mở đầu phần Tìm kiếm & Thuật toán nâng cao. Sự trừng phạt của Linear Search trên mảng khổng lồ và sức mạnh phá vỡ logic của Binary Search."
---

# Linear vs Binary Search — Bí mật của việc Cắt đôi

Chào mừng bạn đến với **Phần Cuối Cùng: Tìm Kiếm & Các Thuật Toán Nâng Cao**.

Bạn đã có mảng dữ liệu (Array). Bạn đã sắp xếp nó gọn gàng từ bé đến lớn bằng Quick Sort/Merge Sort. Mọi thứ thật hoàn hảo.
Và bây giờ, User gõ một từ khóa vào ô Tìm kiếm trên UI. Câu hỏi đặt ra là: Bạn sẽ đi lấy kết quả đó ra cho User bằng cách nào?

Đây là lúc chúng ta phải quyết định sự sinh tử của một API: Trả về kết quả trong `1 mili-giây` hay khiến User phải ngắm màn hình Loading tròn xoe trong `1 phút`?

## 📋 Agenda

**Thời gian đọc ước tính:** ~6 phút

### Sau bài này, bạn sẽ:
- ✅ **Hiểu** được giới hạn của Linear Search (Tìm kiếm Tuyến tính) và cách nó phá hủy hiệu năng.
- ✅ **Nhận diện** được "cú lừa" của Binary Search (Tìm kiếm Nhị phân) — thuật toán vi diệu nhất trong giới hạn của Mảng.
- ✅ **Tự tay** implement cả 2 hàm tìm kiếm bằng TypeScript.
- ✅ **Cảnh giác** với rủi ro và "Điểm mù" của Binary Search.

### Yêu cầu đầu vào:
- 🔹 Có kiến thức về độ phức tạp `O(n)` và `O(log n)`.
- 🔹 Hiểu rõ sự khác biệt giữa mảng chưa sắp xếp và [Mảng đã sắp xếp](../04-sorting/06-sorting-comparison.md).

---

## ❓ Vấn đề muôn thuở: Đi tìm cây kim trong đống cỏ khô

**Vấn đề (Problem Statement):**
Bạn có một mảng 1 triệu hồ sơ nhân viên. Bạn cần tìm nhân viên có ID là `999,999`. 

**Cách ngây ngô nhất (Linear Search):** Bạn nhặt từng hồ sơ từ đầu mảng đến cuối mảng lên kiểm tra. "Phải mài không? Không phải. Đứa tiếp theo!". 
Nếu hên, nhân viên đó nằm ở Đầu mảng -> Mất 1 giây.
Nhưng nếu xui (Worst Case), nhân viên đó nằm ở Cuối mảng -> Bạn mất 1 triệu giây. Đó là **O(n)**.

**Giải pháp (Solution):**
Nếu 1 triệu hồ sơ đó ĐÃ ĐƯỢC XẾP THEO THỨ TỰ ID (Ví dụ 1 đến 1 triệu). 
Thay vì tìm từ đầu, tôi rút hồ sơ ở NGAY CHÍNH GIỮA (ID 500,000). 
- Thấy `500,000 < 999,999`. Tôi LẬP TỨC VỨT BỎ toàn bộ 500,000 hồ sơ từ số 1 đến số 500,000! 
- Số lượng công việc của tôi giảm CỨNG một nửa chỉ trong 1 nốt nhạc.

Đó chính là nguyên lý của **Binary Search (Tìm kiếm Nhị phân)**.

---

## 📖 Trực quan hóa "Nhị phân" (Binary Search)

**Định nghĩa:** Thuật toán tìm kiếm sử dụng tư duy "Chia để Trị" bằng cách lấy phần tử ở chính giữa mảng làm mốc so sánh. Tùy thuộc vào kết quả lớn/nhỏ, nó loại bỏ ngay lập tức MỘT NỬA mảng không chứa kết quả. Trò chơi lặp lại cho đến khi tìm thấy.

### Minh họa đi tìm số 7
Cho mảng ĐÃ SẮP XẾP: `[1, 2, 3, 5, 7, 8, 9, 10, 15]` (9 phần tử).

1. **Vòng 1:** Chọn điểm Giữa (Mid). Ở đây là số `7` (Index 4). 
   - Hên quá, đúng số cần tìm luôn! Xong phim. Mất đúng **1 vòng**.

### Minh họa đi tìm số 10 (Nằm ở đuôi)
1. **Vòng 1:** Chọn Mid là `7`. Ta thấy `10 > 7`. 
   - -> Vứt bỏ đoạn `[1, 2, 3, 5, 7]`.
   - Vùng tìm kiếm thu nhỏ lại chỉ còn: `[8, 9, 10, 15]`.
2. **Vòng 2:** Vùng mới có 4 phần tử, điểm Giữa là `9`. Thấy `10 > 9`.
   - -> Vứt bỏ đoạn `[8, 9]`.
   - Vùng tìm kiếm thu nhỏ còn: `[10, 15]`.
3. **Vòng 3:** Điểm Giữa là `10`. **Boom! Bắt được mài!** Mất **3 vòng** thay vì 8 vòng (nếu quét từ đầu).

---

## 🔨 Implement bằng TypeScript

### 1. Hàm Linear Search (Chỉ để xem cho biết)
```typescript
// filename: search.ts

function linearSearch(arr: number[], target: number): number {
  for (let i = 0; i < arr.length; i++) {
    // Duyệt cày bừa từ đầu đến cuối
    if (arr[i] === target) return i;
  }
  return -1; // Không tìm thấy
}
```

### 2. Hàm Binary Search (Vũ khí O(log n))
Chúng ta dùng kỹ thuật **Two Pointers (Hai con trỏ)**. Một con trỏ chặn ở Đầu mảng, một con trỏ chặn ở Đuôi mảng. Ép nó kẹp chặt lấy con mồi ở giữa.

```typescript
// filename: search.ts

function binarySearch(arr: number[], target: number): number {
  let left = 0;
  let right = arr.length - 1;

  // Chừng nào con trỏ Trái và Phải chưa vượt mặt nhau
  while (left <= right) {
    // 💡 Lấy chỉ số chính giữa (Mid)
    let mid = Math.floor((left + right) / 2);

    // 1. Trúng mánh ngay điểm giữa
    if (arr[mid] === target) {
      return mid; // Trả về index
    }
    // 2. Nếu target Nhỏ hơn điểm giữa -> Vứt bỏ nửa Phải
    else if (target < arr[mid]) {
      right = mid - 1; // Ép con trỏ Phải lùi về trước Mid
    }
    // 3. Nếu target Lớn hơn điểm giữa -> Vứt bỏ nửa Trái
    else {
      left = mid + 1; // Ép con trỏ Trái tiến lên sau Mid
    }
  }

  return -1; // Không tìm thấy con mồi
}
```

---

## 🚀 WHAT IF — Quyền năng của O(log n)

Hãy làm một phép toán để thấy sự hủy diệt của Binary Search so với Linear Search:

Giả sử hệ thống của bạn (VD: Mã số CCCD của toàn bộ người dân Việt Nam) đang có **100 triệu bản ghi**. Máy tính tốn 1 mili-giây để xử lý 1 phép so sánh.
- **Linear Search:** Nếu xui xẻo, nó phải dò đến phần tử cuối cùng. Tốn 100,000,000 mili-giây (~27.7 giờ). Server của bạn đã bị crash từ đời nào.
- **Binary Search:** Mảng chia đôi 100 triệu, còn 50 triệu, còn 25 triệu... Nó chỉ mất tối đa **`27 lần cắt mảng`** để tìm ra kết quả cuối cùng. Tốn `27 mili-giây`. Nhanh hơn cả cái chớp mắt!

### ⚠️ Pitfall: "Điểm mù" của Binary Search
Thuật toán này nhanh khủng khiếp, nhưng có một điều kiện TIÊN QUYẾT chết người: **Mảng BẮT BUỘC phải ĐÃ ĐƯỢC SẮP XẾP TỪ TRƯỚC.**
Nếu mảng lộn xộn, bạn chọn thằng Giữa là số `5`, rồi bỏ đi nửa bên Phải vì tưởng bên phải chứa số lớn hơn. Ai dè bên phải lại chứa số `1` mà bạn đang tìm. Mất trắng con mồi!

Do đó, chi phí thực sự của Binary Search không phải là lúc Tìm, mà là **Chi phí Sắp xếp Mảng (Merge/Quick Sort `O(n log n)`) ban đầu.**

---

## 💬 Thảo luận

Kỹ thuật kẹp 2 con trỏ (Left / Right) ép vào giữa của Binary Search là một kỹ thuật tuyệt đỉnh. 

Nhưng, nếu bài toán không bắt tìm kiếm 1 con số, mà bắt: *"Hãy tìm MỘT CẶP SỐ trong mảng sao cho tổng của chúng bằng 0"* thì sao? Rõ ràng một con trỏ chạy `i` và `j` lồng nhau (O(n^2)) sẽ quét sạch tài nguyên hệ thống.

Chúng ta sẽ dùng kỹ năng kẹp 2 con trỏ này, nâng cấp nó lên thành một Design Pattern siêu mạnh mẽ trong mọi bài phỏng vấn. 

Chào mừng bạn đến với **Two Pointers Pattern (Hai con trỏ)** ở bài tiếp theo!

---
*Made by Anh Tu - Share to be share*
