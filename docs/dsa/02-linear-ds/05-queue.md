---
sidebar_position: 5
title: "7. Queue — FIFO và bài toán hàng đợi"
description: "Nguyên lý Hàng đợi (FIFO), cách triển khai Queue tối ưu bằng Linked List để tránh bẫy hiệu năng của Array shift()."
---

# Queue — Hàng đợi và Nguyên lý FIFO

Ở bài trước, chúng ta đã tìm hiểu về **Stack** với nguyên tắc LIFO (vào sau ra trước). Cấu trúc đó rất phù hợp cho máy tính (call stack, compiler), nhưng lại hoàn toàn đi ngược với văn hóa của thế giới thực.

Khi bạn thiết kế một hệ thống xử lý ticket hỗ trợ khách hàng, hay một server in tài liệu, bạn không thể ép người đến đầu tiên chờ mãi được. Chúng ta cần sự công bằng. Chào mừng bạn đến với **Queue (Hàng đợi)**.

## 📋 Agenda

**Thời gian đọc ước tính:** ~8 phút

### Sau bài này, bạn sẽ:
- ✅ **Hiểu** được nguyên lý FIFO của Queue.
- ✅ **Giải thích** được cách Event Loop của NodeJS xử lý Callback.
- ✅ **Tự tay** implement một Queue hiệu năng cao (O(1)) bằng cách kết hợp với Linked List.
- ✅ **Nhận diện** được cái bẫy hiệu năng "chết người" khi dùng Array để giả lập Queue trong JavaScript.

### Yêu cầu đầu vào:
- 🔹 Có kiến thức cơ bản về [Array](./01-array.md) và [Linked List](./02-linked-list.md).

---

## ❓ Tại sao phải "Xếp hàng"?

**Vấn đề (Problem Statement):**
Bạn đang xây dựng một Microservice nhận đơn hàng (Orders). Trong ngày Black Friday, có 10,000 requests đổ về cùng một giây. Server không thể xử lý cùng lúc 10,000 đơn hàng. Nếu bạn vứt bỏ bớt request, hệ thống sẽ mất doanh thu. Nếu bạn xử lý đơn của người tới sau trước, khách hàng sẽ phẫn nộ.

**Giải pháp (Solution):**
**Queue**. Nhận mọi đơn hàng ngay lập tức và ném chúng vào một Hàng đợi chờ xử lý. Hệ thống xử lý (Worker) sẽ lần lượt lấy từng đơn hàng ra từ **đầu hàng**, xử lý xong mới lấy tiếp. Sự công bằng được đảm bảo: Ai vào xếp hàng trước sẽ được thanh toán trước.

---

## 📖 Queue hoạt động như thế nào?

**Định nghĩa:** Queue là một cấu trúc dữ liệu tuyến tính hoạt động theo nguyên lý **FIFO (First In, First Out)** — Vào trước, Ra trước.

### Trực quan hóa cấu trúc

Hãy tưởng tượng một đường ống nước chảy một chiều. Bạn nhét quả bóng vào một đầu, nó sẽ chui ra ở đầu bên kia.

```mermaid
flowchart LR
    subgraph Queue [Hàng Đợi (Queue)]
        direction LR
        Item3[("Phần tử 3<br/>Last In")]
        Item2[("Phần tử 2")]
        Item1[("Phần tử 1<br/>First In")]
        
        Item3 --- Item2
        Item2 --- Item1
    end
    
    ActionEnqueue("enqueue()") -.-> |Nhét vào Đuôi (Tail)| Item3
    Item1 -.-> |Rút từ Đầu (Head)| ActionDequeue("dequeue()")
    
    style Item1 fill:#ff6b6b,color:#fff
    style Queue fill:#f8f9fa,stroke:#ccc
```

### Các thuật ngữ cốt lõi
- **Enqueue (Thêm):** Đẩy phần tử vào **cuối** hàng (Tail/Rear).
- **Dequeue (Rút):** Lấy và xóa phần tử ở **đầu** hàng (Head/Front).
- **Peek:** Chỉ xem phần tử ở đầu hàng (đến lượt ai rồi?).

---

## 🔨 Cạm bẫy khi implement Queue bằng Array

Ở bài Stack, chúng ta dùng Array rất "mượt" vì `push` (thêm cuối) và `pop` (xóa cuối) đều là **O(1)**.
Một Junior Dev thường áp dụng tư duy đó sang Queue:

```typescript
// ❌ Cạm bẫy hiệu năng (Array-based Queue)
class BadQueue<T> {
  private items: T[] = [];

  enqueue(item: T) {
    this.items.push(item); // O(1) - Rất tốt!
  }

  dequeue(): T | undefined {
    // ⚠️ CHẾT DỞ Ở ĐÂY: Hàm shift() xóa phần tử đầu tiên của Array
    // Bắt buộc TOÀN BỘ phần tử phía sau phải dịch chuyển lên 1 bước.
    // Time Complexity: O(n) !!!
    return this.items.shift(); 
  }
}
```

Nếu hệ thống của bạn có 1 triệu đơn hàng trong Queue, mỗi lần lấy ra 1 đơn để xử lý, máy chủ phải dịch chuyển 999,999 đơn hàng còn lại lên trước một bước. Hiệu năng sẽ sập đổ hoàn toàn.

---

## 🔨 Implement Queue "Chuẩn mực" bằng Linked List

Để đạt được O(1) cho cả `enqueue` và `dequeue`, chúng ta phải vứt Array đi, và sử dụng **Singly Linked List** với con trỏ `Head` (Đầu hàng) và `Tail` (Cuối hàng).

- **Enqueue:** Nối vào `Tail` (O(1)).
- **Dequeue:** Cắt bỏ `Head` cũ, dời Head lên người tiếp theo (O(1)). Không ai phải dịch chuyển!

### Triển khai TypeScript

```typescript
// filename: queue.ts

class QueueNode<T> {
  constructor(public value: T, public next: QueueNode<T> | null = null) {}
}

class Queue<T> {
  private head: QueueNode<T> | null = null;
  private tail: QueueNode<T> | null = null;
  private _length: number = 0; // Lưu độ dài để không phải duyệt O(n)

  // O(1) - Xếp hàng vào CUỐI (Tail)
  enqueue(item: T): void {
    const newNode = new QueueNode(item);
    
    if (!this.tail) { // Nếu hàng trống
      this.head = newNode;
      this.tail = newNode;
    } else {
      this.tail.next = newNode; // Người cuối cùng hiện tại chỉ vào người mới
      this.tail = newNode;      // Cập nhật người mới thành Tail
    }
    
    this._length++;
  }

  // O(1) - Gọi người ĐẦU TIÊN (Head) ra xử lý
  dequeue(): T | undefined {
    if (!this.head) return undefined; // Hàng rỗng

    const valueToReturn = this.head.value;
    
    // Cắt Head cũ, dời Head sang người phía sau
    this.head = this.head.next; 
    
    // Nếu rút xong mà hàng rỗng, phải cập nhật luôn Tail
    if (!this.head) {
      this.tail = null;
    }

    this._length--;
    return valueToReturn;
  }

  // O(1) - Xem ai đang đứng đầu
  peek(): T | undefined {
    return this.head?.value;
  }

  get size(): number {
    return this._length;
  }
}
```

---

## 🚀 WHAT IF — Ứng dụng thực tế

### 1. Kiến trúc Microservices (Message Broker)
RabbitMQ, Kafka, AWS SQS — tất cả những Message Broker đình đám nhất thế giới đều được xây dựng dựa trên nguyên lý của Queue. Giúp "chống sốc" (Buffer) cho Database khi có lượng truy cập đột biến.

### 2. Event Loop của NodeJS / Browser
Khi bạn dùng `setTimeout`, hàm callback không chạy ngay lập tức. Nó được trình duyệt ném vào một nơi gọi là **Callback Queue (Task Queue)**. Event Loop sẽ liên tục kiểm tra: Khi Call Stack (Ngăn xếp) đã chạy xong hết việc, nó mới quay sang Queue rút từng Callback đầu tiên ra để chạy.

### ⚠️ Pitfall: Nghẽn hàng đợi (Queue Blocking)
Cấu trúc Queue rất công bằng, nhưng đó cũng là điểm yếu của nó. Nếu người đầu tiên trong hàng đợi (Head) xử lý một tác vụ tốn quá nhiều thời gian (ví dụ: mất 5 phút để nén Video), toàn bộ những người phía sau bị khóa chết không thể tiến lên.
**Cách giải quyết:** Áp dụng mô hình nhiều Queue (Multi-Queue) hoặc phân chia thành các Queue ưu tiên dựa trên loại tác vụ.

---

## 💬 Thảo luận

Trong mô hình Queue chuẩn, bạn chỉ có thể thao tác ở **hai đầu**: Thêm ở đuôi, Rút ở đầu.
Nhưng nếu bạn muốn một hàng đợi linh hoạt hơn? Nơi mà "khách VIP" có thể chen ngang vào đầu hàng, hoặc nhân viên cửa hàng có thể ưu tiên lấy hàng từ cả hai phía?

Đó là lúc chúng ta cần đến một cấu trúc kết hợp sức mạnh của cả Stack và Queue. Mời bạn đến với bài cuối cùng của Sprint 2: **Deque (Double-Ended Queue)**.

---
*Made by Anh Tu - Share to be share*
