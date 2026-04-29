---
sidebar_position: 4
title: "26. Recursion & Backtracking — Nghệ thuật gọi tên chính mình"
description: "Bản chất của Đệ quy (Recursion) và cách máy tính sử dụng Call Stack. Kỹ thuật Quay lui (Backtracking) để giải mê cung và tổ hợp."
---

# Recursion & Backtracking — Nghệ thuật gọi tên chính mình

Vòng lặp `for` và `while` rất mạnh mẽ để duyệt mảng phẳng. Nhưng nếu bạn cần quét toàn bộ ổ cứng máy tính để tìm một file `.txt`? 
Thư mục gốc chứa thư mục con, thư mục con lại chứa thư mục cháu... Bạn không thể biết trước cần lồng bao nhiêu vòng `for` cho đủ.

Khi cấu trúc dữ liệu bị phân nhánh vô tận (như [Tree](../03-non-linear-ds/02-binary-tree.md) hay [Graph](../03-non-linear-ds/06-graph.md)), vòng lặp thông thường chính thức đầu hàng. Chào mừng bạn đến với **Recursion (Đệ quy)** và kỹ thuật đi kèm không thể tách rời: **Backtracking (Quay lui)**.

## 📋 Agenda

**Thời gian đọc ước tính:** ~8 phút

### Sau bài này, bạn sẽ:
- ✅ **Hiểu** được tại sao Đệ quy không phải là ma thuật, mà nó được điều khiển bằng Call Stack.
- ✅ **Nhận diện** được 2 thành phần BẮT BUỘC để một hàm đệ quy không làm sập Server.
- ✅ **Trực quan hóa** khái niệm Backtracking (Quay lui) qua ví dụ tìm đường trong mê cung.
- ✅ **Tự tay** implement bài toán Tổ hợp bằng Backtracking trong TypeScript.

### Yêu cầu đầu vào:
- 🔹 Có kiến thức về [Stack (Ngăn xếp)](../02-linear-ds/04-stack.md).

---

## ❓ Tại sao hàm lại tự gọi chính nó?

**Định nghĩa:** Đệ quy (Recursion) là quá trình một hàm tự gọi lại **chính nó** bên trong phần thân của nó.

**Vấn đề (Problem Statement):**
Hãy tính Giai thừa của 5 (`5! = 5 * 4 * 3 * 2 * 1`).
Dùng vòng `for` chạy lùi rất dễ. Nhưng nhìn dưới góc độ toán học: `5! = 5 * 4!`.
Và `4! = 4 * 3!`.
... Thay vì lặp, chúng ta đang biến một bài toán lớn (Giai thừa 5) thành bài toán giống y hệt nhưng NHỎ HƠN (Giai thừa 4). Cứ bóc dần lớp vỏ như bóc củ hành cho đến khi đụng cái lõi. Đụng lõi xong mới quay ngược ra nhân kết quả lại.

---

## 📖 Trực quan hóa Call Stack của Đệ quy

JavaScript / TypeScript quản lý việc gọi hàm bằng **Call Stack** (Ngăn xếp). Ai gọi trước sẽ xếp dưới đáy, ai gọi sau xếp chồng lên trên. Đứa trên cùng chạy xong rút ra (Pop) thì đứa bên dưới mới được chạy tiếp.

```typescript
function factorial(num: number): number {
  if (num === 1) return 1; // 💡 ĐIỂM DỪNG (Base Case)
  return num * factorial(num - 1); // 💡 GỌI LẠI CHÍNH NÓ VỚI INPUT NHỎ HƠN
}

factorial(4);
```

**Mô phỏng Call Stack chạy hàm `factorial(4)`:**
1. Call `factorial(4)`. Chờ kết quả của `4 * factorial(3)`. -> Tạm dừng hàm, nhét vào Stack.
2. Call `factorial(3)`. Chờ kết quả của `3 * factorial(2)`. -> Tạm dừng, nhét vào Stack.
3. Call `factorial(2)`. Chờ kết quả của `2 * factorial(1)`. -> Tạm dừng, nhét vào Stack.
4. Call `factorial(1)`. Nhận thấy `num === 1` -> **Trả về 1**. Hàm này CHẠY XONG! Rút nó khỏi Stack.

*Bây giờ, hiệu ứng Domino quay ngược lại (Pop Stack):*
5. Hàm `factorial(2)` nhận được số 1. Tính `2 * 1 = 2`. Trả về 2. Xong, rút!
6. Hàm `factorial(3)` nhận được số 2. Tính `3 * 2 = 6`. Trả về 6. Xong, rút!
7. Hàm `factorial(4)` nhận được số 6. Tính `4 * 6 = 24`. Trả về 24. Ngăn xếp trống rỗng. Xong nhiệm vụ!

### ⚠️ Định luật sinh tử của Đệ quy
Bất kì hàm đệ quy nào cũng bắt buộc phải có 2 thứ:
1. **Base Case (Điểm dừng):** Nếu không có lệnh `if (num === 1) return 1`, hàm sẽ gọi mãi xuống -1, -2, -3... cho đến khi Call Stack chứa không nổi nữa. Server sập với lỗi kinh điển: **Stack Overflow**.
2. **Different Input (Thay đổi Input):** Mỗi lần gọi lại chính nó, bạn phải thay đổi input (`num - 1`). Nếu gọi lại với input cũ, nó sẽ lặp vô hạn.

---

## 🔨 Cảnh giới cao nhất: Backtracking (Quay lui)

Đệ quy tính giai thừa thì dễ, vì nó là một đường thẳng (như Array). Nhưng Đệ quy giải bài toán Tổ hợp hoặc Tìm đường thì nó là nhiều ngã rẽ. 
Khi bạn đi vào ngã rẽ 1, phát hiện nó là Ngõ cụt (hoặc đụng Base Case). Bạn lùi lại ngã 3 lúc nãy, và bắt đầu đi vào ngã rẽ 2. Quá trình "Lùi lại 1 bước, làm sạch vết chân, thử đường khác" đó gọi là **Backtracking**.

### Bài toán Backtracking: Liệt kê Tổ hợp
Viết hàm in ra mọi dãy số Nhị phân có độ dài `n=3`. Kết quả phải là: `[000, 001, 010, 011, 100, 101, 110, 111]`.
Cứ mỗi vị trí, ta có 2 sự lựa chọn (0 hoặc 1). Ta không thể dùng 3 vòng lặp vì nếu đề bắt độ dài `n=10`, ta không thể viết 10 vòng lặp `for` lồng nhau.

```typescript
// filename: backtracking.ts

function generateBinaryString(n: number): string[] {
  const result: string[] = [];
  const currentPath: number[] = []; // Lưu trữ đường đi hiện tại

  // Khai báo hàm Đệ quy bên trong
  function backtrack(position: number) {
    // 💡 BASE CASE: Nếu mảng tạm đã đủ n số (VD: 3 số), lưu vào mảng Tổng và DỪNG LẠI (Quay lui)
    if (position === n) {
      result.push(currentPath.join(""));
      return;
    }

    // Tại 1 vị trí, ta có 2 sự lựa chọn: 0 hoặc 1
    for (let choice of [0, 1]) {
      // 1. CHỌN: Đi theo con đường này
      currentPath.push(choice); 
      
      // 2. KHÁM PHÁ (Đệ quy): Đi sâu vào vị trí tiếp theo
      backtrack(position + 1); 
      
      // 3. QUAY LUI (Backtrack): Xóa bỏ lựa chọn vừa rồi khỏi mảng tạm
      // Để khi vòng lặp for chạy sang choice=1, mảng currentPath sẽ SẠCH SẼ đón lựa chọn mới
      currentPath.pop(); 
    }
  }

  backtrack(0); // Bắt đầu ở vị trí 0
  return result;
}
```

Hãy tập đọc bằng não quy trình Quay lui của code trên. 
- Nó thêm `0` -> `0` -> `0`. Đủ 3 số! Lưu `000` vào kết quả. 
- Quay lui: Bỏ `0` cuối ra. Lúc này mảng đang là `0 0`. 
- Vòng lặp `choice` nhích lên 1. Nó thêm `1`. Đủ 3 số! Lưu `001` vào.
- Quay lui: Bỏ `1` ra. Vòng `choice` hết. Hàm ở vị trí 2 kết thúc.
- Nó lại Quay lui lên vị trí 1...

---

## 🚀 WHAT IF — Bóng tối của Đệ quy

**Ưu điểm:** Đệ quy và Backtracking là thứ DUY NHẤT để bạn giải quyết các bài toán trên Đồ thị, Duyệt Cây, hay In Tổ hợp. Code cực kỳ ngắn gọn và đẹp. Bản thân [Merge Sort](../04-sorting/04-merge-sort.md) và [Quick Sort](../04-sorting/05-quick-sort.md) là Đệ Quy. 

**Nhược điểm:**
1. **Chậm hơn Vòng lặp:** Khởi tạo ngữ cảnh (Context) và đẩy vào Call Stack tốn CPU hơn chạy vòng lặp thuần.
2. **Nguy hiểm:** Nếu cây Đồ thị quá sâu (Deep), độ sâu đệ quy vượt quá 10,000 tầng, Call Stack sẽ bị Overfow và Server ngỏm củ tỏi. Nếu không chắc về độ sâu, hãy dùng [Vòng lặp + Cấu trúc Stack thay cho Đệ quy](../03-non-linear-ds/07-graph-traversal.md).
3. **Tính toán lặp lại (Overlapping Subproblems):** Đệ quy rất ngây ngô. Nếu tính Dãy Fibonacci bằng Đệ quy `fib(5) = fib(4) + fib(3)`. Khi tính xong `fib(4)`, nó sẽ gọi lại `fib(3)`. Lát sau nó tính vế phải, nó lại mất công chạy lại cái `fib(3)` khổng lồ một lần nữa! Rất lãng phí.

---

## 💬 Thảo luận

Làm sao để Đệ quy không bị tính đi tính lại các bài toán Nhỏ mà nó ĐÃ TỪNG GIẢI QUYẾT? Làm sao để máy tính "Có Trí Nhớ" — lưu lại kết quả của `fib(3)` vào một cuốn sổ nháp, để lần sau gọi tới chỉ việc tra sổ lấy ra dùng?

Đó chính là Cảnh Giới Cuối Cùng của Lập Trình Toán Học. Kỹ thuật đưa Đệ quy từ O(2^n) xuống O(n).
Chào mừng bạn đến với Mẫu thuật toán thần thánh nhất của Google: **Dynamic Programming (Quy hoạch động)** ở bài tiếp theo!

---
*Made by Anh Tu - Share to be share*
