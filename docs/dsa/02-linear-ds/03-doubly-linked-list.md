---
sidebar_position: 3
title: "5. Doubly Linked List — Di chuyển hai chiều"
description: "Khắc phục nhược điểm của Singly Linked List bằng con trỏ prev. Cơ chế của tính năng Forward/Backward trên trình duyệt."
---

# Doubly Linked List — Di chuyển hai chiều

Ở bài Singly Linked List, chúng ta đã phát hiện ra một sự thật cay đắng: Node hiện tại không biết ai đang đứng ngay sau lưng nó. Nếu bạn đang đứng ở phần tử cuối cùng (Tail) và muốn quay ngược lại 1 bước, bạn không thể! Bạn phải chạy lại từ vạch xuất phát (Head) và tìm lại từ đầu.

Thật may, Khoa học Máy tính có một bản nâng cấp giải quyết triệt để vấn đề này: **Doubly Linked List (Danh sách liên kết đôi)**.

## 📋 Agenda

**Thời gian đọc ước tính:** ~8 phút

### Sau bài này, bạn sẽ:
- ✅ **Hiểu** được sự khác biệt cốt lõi giữa Singly và Doubly Linked List.
- ✅ **Giải thích** được cách lịch sử duyệt web (Back/Forward browser) hoạt động dưới nền.
- ✅ **Tự tay** implement con trỏ `prev` bằng TypeScript.
- ✅ **Phân tích** được sự đánh đổi về bộ nhớ (Space Complexity) để lấy được tốc độ.

### Yêu cầu đầu vào:
- 🔹 Đã nắm vững [Singly Linked List](./02-linked-list.md).

---

## ❓ Vấn đề của sự "Một chiều"

**Vấn đề (Problem Statement):**
Hãy tưởng tượng bạn đang code tính năng Lịch sử trình duyệt (Browser History). Người dùng đang ở trang Web C.
- Nếu họ bấm vào link mới (sang trang Web D), bạn dễ dàng trỏ `C.next = D`.
- Nhưng nếu họ bấm nút `Back` trên trình duyệt để về trang Web B thì sao? Trang Web C không lưu thông tin về trang B. Bạn kẹt!

**Giải pháp (Solution):**
**Doubly Linked List**. Chúng ta sẽ "độ" thêm cho mỗi Node một sợi dây thứ hai. Sợi dây `next` trỏ tới người phía trước, và sợi dây `prev` trỏ về người phía sau. Giờ đây, từ bất kỳ vị trí nào, bạn đều có thể tiến lên (Forward) hoặc lùi lại (Backward) một cách dễ dàng!

---

## 📖 Trực quan hóa kiến trúc

**Định nghĩa:** Doubly Linked List là danh sách liên kết mà mỗi phần tử (Node) chứa ba thành phần: **Dữ liệu (Value)**, **Con trỏ tiến (Next)**, và **Con trỏ lùi (Prev)**.

### Sơ đồ cấu trúc đôi

```mermaid
flowchart LR
    subgraph DoublyLinkedList
    direction LR
    Null1([null]) <.-.-> Head(("Head Node<br/>(A)"))
    Head <==> Node2(("Node 2<br/>(B)"))
    Node2 <==> Tail(("Tail Node<br/>(C)"))
    Tail <.-.-> Null2([null])
    end
    
    style Head fill:#ff6b6b,color:#fff
    style Tail fill:#4ecdc4,color:#fff
```
*(Mũi tên hai chiều biểu thị `next` trỏ tới và `prev` trỏ lui)*

- **Head.prev** luôn là `null`.
- **Tail.next** luôn là `null`.

### Nâng cấp hiệu năng so với Singly List

| Thao tác | Singly Linked List | Doubly Linked List |
|---|---|---|
| **Duyệt ngược (Reverse)** | `O(n^2)` (Rất tệ) | **`O(n)`** (Nhanh và dễ) |
| **Xóa 1 Node cho trước** | `O(n)` (Phải tìm Node đứng trước) | **`O(1)`** (Vì có sẵn `prev`) |

---

## 🔨 Implement Doubly Linked List

Việc code Doubly Linked List phức tạp hơn Singly một chút, vì mỗi lần nối dây, chúng ta phải nối cả hai đầu.

### 1. Nâng cấp Node

```typescript
// filename: doubly-linked-list.ts

class DoublyNode<T> {
  value: T;
  next: DoublyNode<T> | null;
  prev: DoublyNode<T> | null; // 💡 Vũ khí bí mật: sợi dây thứ 2

  constructor(value: T) {
    this.value = value;
    this.next = null;
    this.prev = null;
  }
}
```

### 2. Logic Thêm (Append)

```typescript
// filename: doubly-linked-list.ts

class DoublyLinkedList<T> {
  private head: DoublyNode<T> | null = null;
  private tail: DoublyNode<T> | null = null;

  append(value: T): void {
    const newNode = new DoublyNode(value);

    // List rỗng
    if (!this.head || !this.tail) {
      this.head = newNode;
      this.tail = newNode;
      return;
    }

    // 💡 Quy trình nối dây 2 chiều:
    // 1. Trỏ next của Tail CŨ tới Node MỚI
    this.tail.next = newNode;
    
    // 2. Trỏ prev của Node MỚI ngược lại Tail CŨ
    newNode.prev = this.tail;
    
    // 3. Đăng quang Node MỚI làm Tail mới
    this.tail = newNode;
  }
}
```

### 3. Sức mạnh thực sự: Xóa nhanh (O(1))

Giả sử ứng dụng truyền thẳng cho bạn cái `Node` cần xóa (chứ không phải `value`). Ở Singly List, bạn vẫn phải chạy từ Head tìm xem ai đang đứng trước nó. Với Doubly List, điều đó là dĩ vãng:

```typescript
// filename: doubly-linked-list.ts

  deleteNode(nodeToDelete: DoublyNode<T>): void {
    // Lấy 2 người hàng xóm của node cần xóa
    const previousNode = nodeToDelete.prev;
    const nextNode = nodeToDelete.next;

    // 💡 Bypass nodeToDelete: 
    // Cho hàng xóm phía trước trỏ thẳng đến hàng xóm phía sau
    if (previousNode) {
      previousNode.next = nextNode;
    } else {
      // Nếu không có previousNode, nghĩa là ta đang xóa Head!
      this.head = nextNode;
    }

    // Cho hàng xóm phía sau trỏ ngược về hàng xóm phía trước
    if (nextNode) {
      nextNode.prev = previousNode;
    } else {
      // Nếu không có nextNode, ta đang xóa Tail!
      this.tail = previousNode;
    }

    // Cắt đứt hoàn toàn Node cũ (để Garbage Collector dọn dẹp)
    nodeToDelete.prev = null;
    nodeToDelete.next = null;
  }
```

---

## 🚀 WHAT IF — Đánh đổi và Bẫy

### Lợi ích tuyệt đối
Doubly Linked List tỏa sáng trong các bài toán yêu cầu **duyệt hai chiều** và **xóa/chèn O(1)** tại những vị trí biết trước.
- Lịch sử Browser (Back/Forward).
- Playlist nhạc (Next song / Previous song).
- Cache LRU (Least Recently Used) — Cấu trúc dữ liệu "trấn phái" trong phỏng vấn hệ thống (System Design).

### Đánh đổi (Trade-off)
Bạn không thể có được tốc độ mà không phải trả giá.
1. **Space Complexity:** Khốn đốn hơn Singly List! Mỗi một biến `prev` cần lưu trữ một địa chỉ bộ nhớ (chiếm 8 bytes trên hệ thống 64-bit). Một danh sách 1 triệu phần tử sẽ ngốn thêm **~8MB RAM** chỉ để nuôi cái con trỏ ngược này.
2. **Implementation Complexity:** Mã nguồn phức tạp, dễ sinh bug. Quên trỏ `prev` trong lúc thêm/xóa là lỗi chí mạng khiến dữ liệu mất đồng bộ.

### ⚠️ Pitfall: Dangling Pointers
Khi xóa một Node khỏi DLL (Doubly Linked List), nếu bạn chỉ cắt `next` mà quên cắt tham chiếu `prev` từ các node khác trỏ tới nó, Node đó sẽ trôi nổi trong bộ nhớ (Dangling Node/Memory Leak) mà Garbage Collector không dám dọn. Luôn đảm bảo "xóa sạch dấu vết" khi loại bỏ 1 phần tử.

---

## 💬 Thảo luận

Bằng cách giới hạn bớt một số tính năng linh hoạt của Linked List và Array, chúng ta có thể tạo ra những cấu trúc dữ liệu có tính quy tắc cao hơn, an toàn hơn và chuyên biệt hơn cho các bài toán kinh doanh.

Bạn đã từng nghe đến **"Chỉ được thêm vào đỉnh, chỉ được rút ra từ đỉnh"** chưa? Chào mừng bạn đến với cấu trúc dữ liệu mô phỏng "chồng đĩa" ở bài tiếp theo: **Stack**.

---
*Made by Anh Tu - Share to be share*
