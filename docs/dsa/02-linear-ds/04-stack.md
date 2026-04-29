---
sidebar_position: 4
title: "6. Stack — LIFO và bài toán Undo/Redo"
description: "Khái niệm Stack (Ngăn xếp), nguyên lý LIFO (Last In First Out) và cách triển khai tính năng Undo trong các Editor quen thuộc."
---

# Stack — Ngăn xếp và Nguyên lý LIFO

Khi học về Array hay Linked List, bạn có toàn quyền tự do: muốn chèn dữ liệu vào đầu, vào cuối, hay móc dữ liệu từ giữa ra đều được. Sự tự do đó tuy mạnh mẽ nhưng lại đi kèm với những rủi ro về tính nhất quán dữ liệu.

Đôi khi, để giải quyết một lớp bài toán cụ thể, chúng ta cần **hạn chế sự tự do** lại bằng các nguyên tắc nghiêm ngặt. Chào mừng bạn đến với cấu trúc dữ liệu bị ràng buộc nhiều nhất nhưng cũng hữu dụng nhất: **Stack (Ngăn xếp)**.

## 📋 Agenda

**Thời gian đọc ước tính:** ~6 phút

### Sau bài này, bạn sẽ:
- ✅ **Hiểu** được nguyên lý LIFO của Stack.
- ✅ **Giải thích** được cách tính năng `Undo` (Ctrl+Z) hay Call Stack của JavaScript hoạt động.
- ✅ **Tự tay** implement một Stack bằng Array trong TypeScript.
- ✅ **Phân biệt** được khi nào dùng Stack là thừa thãi, khi nào là bắt buộc.

### Yêu cầu đầu vào:
- 🔹 Có kiến thức cơ bản về [Array](./01-array.md).

---

## ❓ Tại sao lại phải tự trói buộc mình?

**Vấn đề (Problem Statement):**
Bạn đang làm chức năng "Undo" (Ctrl + Z) cho một ứng dụng soạn thảo văn bản (như Microsoft Word).
Nếu dùng Array thông thường và cho phép Dev tùy ý chèn/xóa ở mọi vị trí, sẽ rất dễ xảy ra lỗi ai đó lỡ tay xóa mất lịch sử Undo ở giữa, làm hỏng toàn bộ luồng khôi phục dữ liệu theo thời gian.

**Giải pháp (Solution):**
Bạn cần một cấu trúc ép buộc quy tắc: **"Cái gì bỏ vào sau cùng thì phải được lấy ra đầu tiên"**. Không ai được phép lấy/xóa dữ liệu ở giữa hay ở đáy. Cấu trúc đó gọi là **Stack**. Bằng cách giới hạn API chỉ còn `push` (đẩy vào đỉnh) và `pop` (lấy ra từ đỉnh), chúng ta đảm bảo dữ liệu luôn được xử lý theo đúng trật tự thời gian mong muốn một cách an toàn nhất.

---

## 📖 Stack hoạt động như thế nào?

**Định nghĩa:** Stack là một cấu trúc dữ liệu tuyến tính hoạt động theo nguyên lý **LIFO (Last In, First Out)** — Vào sau, Ra trước.

### Trực quan hóa cấu trúc

Hãy tưởng tượng một chồng đĩa trong nhà hàng. Bạn chỉ có thể đặt đĩa mới lên trên cùng, và khi lấy đĩa ra, bạn cũng phải lấy cái ở trên cùng. Nếu cố rút cái đĩa ở giữa, cả chồng sẽ đổ!

```mermaid
flowchart TD
    subgraph Stack [Ngăn xếp (Stack)]
        direction BT
        Item3[("Đĩa 3 (Top)<br/>Last In")]
        Item2[("Đĩa 2")]
        Item1[("Đĩa 1 (Bottom)<br/>First In")]
        
        Item1 --- Item2
        Item2 --- Item3
    end
    
    ActionPush("push(Item 4)") -.-> |Thêm vào đỉnh| Item3
    Item3 -.-> |Lấy từ đỉnh| ActionPop("pop()")
    
    style Item3 fill:#ff6b6b,color:#fff
    style Stack fill:#f8f9fa,stroke:#ccc
```

### Các thao tác cốt lõi (Time Complexity đều là O(1))
- **push(item):** Đặt một phần tử lên Đỉnh.
- **pop():** Lấy (và xóa) phần tử ở Đỉnh ra ngoài.
- **peek() / top():** Chỉ *xem* phần tử ở Đỉnh mà không xóa.

---

## 🔨 Implement Stack bằng TypeScript

Chúng ta có thể implement Stack bằng *Linked List* hoặc *Array*. Vì trong JavaScript/TypeScript, thao tác thêm/xóa ở cuối mảng (`push/pop`) đã được V8 Engine tối ưu hóa cực tốt (O(1)), nên việc bọc một Array lại thành Stack là cách làm phổ biến và hiệu quả nhất.

### 1. Định nghĩa Interface (Hợp đồng)

```typescript
// filename: stack.ts

interface IStack<T> {
  push(item: T): void;
  pop(): T | undefined;
  peek(): T | undefined;
  isEmpty(): boolean;
  readonly size: number;
}
```

### 2. Triển khai Class

```typescript
// filename: stack.ts

class Stack<T> implements IStack<T> {
  // 💡 Sử dụng Array làm kho lưu trữ ngầm (Underlying Data Structure)
  // Đặt là private để KHÔNG AI có thể dùng ngoặc vuông truy cập `items[1]`!
  private items: T[] = [];

  // O(1) - Thêm vào đỉnh (cuối mảng)
  push(item: T): void {
    this.items.push(item);
  }

  // O(1) - Rút từ đỉnh (cuối mảng)
  pop(): T | undefined {
    return this.items.pop();
  }

  // O(1) - Nhìn phần tử trên cùng
  peek(): T | undefined {
    if (this.isEmpty()) return undefined;
    return this.items[this.items.length - 1];
  }

  // O(1)
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  // Getter cho kích thước
  get size(): number {
    return this.items.length;
  }
}
```

### Ví dụ: Xây dựng tính năng Undo/Redo

```typescript
const undoStack = new Stack<string>();
const redoStack = new Stack<string>();

// Người dùng gõ văn bản
undoStack.push("Type 'Hello'");
undoStack.push("Type ' World'");
undoStack.push("Format 'Bold'");

// Người dùng bấm Ctrl + Z (Undo)
const lastAction = undoStack.pop(); 
console.log(`Hoàn tác hành động: ${lastAction}`); // Format 'Bold'
redoStack.push(lastAction); // Lưu vào Redo để lỡ đổi ý
```

---

## 🚀 WHAT IF — Ứng dụng thực tế và Đánh đổi

### Tại sao không dùng thẳng Array mà phải bọc trong class Stack?
Bạn hoàn toàn *có thể* dùng thẳng `const stack = []`. Nhưng trong môi trường làm việc nhóm, nếu bạn thả một Array trần trụi ra ngoài, sớm muộn gì cũng có Dev "táy máy" gọi `stack.splice(1, 1)` (xóa phần tử ở giữa). Việc đóng gói vào `class Stack` và che dấu mảng bằng `private` giúp bảo vệ tính toàn vẹn của logic LIFO.

### Ứng dụng kinh điển của Stack:
1. **Trình thông dịch (Compiler/Interpreter):** Kiểm tra dấu ngoặc hợp lệ `{ [ ( ) ] }`.
2. **Call Stack của JavaScript:** Khi một hàm A gọi hàm B, JS đưa hàm A vào Call Stack, nhảy sang thực thi B. Xong B (pop), JS lấy A ra làm tiếp. (Nếu hàm A gọi A liên tục không dừng, bạn sẽ bị lỗi kinh điển: `Maximum call stack size exceeded` - Tràn ngăn xếp).
3. **Duyệt cây/Đồ thị (DFS):** Thuật toán Depth First Search (Tìm kiếm theo chiều sâu) phụ thuộc hoàn toàn vào Stack.

### ⚠️ Pitfalls hay gặp

**1. Tràn ngăn xếp (Stack Overflow)**
Không giống như không gian Array động lớn bằng RAM, bộ nhớ cấp cho **Call Stack** (Stack thực thi lệnh của hệ điều hành) rất nhỏ. Hàm đệ quy sâu quá mức mà không có điều kiện dừng sẽ ngay lập tức gây sập chương trình.

**2. Đẩy ngược LIFO thành FIFO**
Một số Junior Dev hay bị nhầm lẫn. Họ khai báo Stack bằng Array, nhưng lại dùng `unshift()` để thêm vào đỉnh và `shift()` để rút ra (Thêm vào đầu, xóa ở đầu). Mặc dù nó vẫn hoạt động theo nguyên tắc LIFO, nhưng **hiệu năng sẽ là O(n)** thay vì O(1) như dùng `push/pop` ở cuối mảng. Hãy cẩn thận!

---

## 💬 Thảo luận

Stack (LIFO - Vào sau ra trước) sinh ra để giải quyết bài toán Lịch sử và Đảo ngược. Nhưng trong thế giới thực, "văn hóa xếp hàng" đâu có ngược đời như thế. Khách hàng tới mua trà sữa, ai đến trước phải được phục vụ trước. 

Để giải bài toán "Xếp hàng Công bằng" này, chúng ta cần lật ngược nguyên lý LIFO. Mời bạn đến với cấu trúc tiếp theo: **Queue (Hàng đợi)**.

---
*Made by Anh Tu - Share to be share*
