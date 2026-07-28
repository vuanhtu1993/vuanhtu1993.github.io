---
id: event-loop-deep-dive
title: "2B. Deep Dive: Event Loop ⚙️"
sidebar_label: "2B. Deep Dive: Event Loop ⚙️"
sidebar_position: 3
description: "Phân tích chuyên sâu cơ chế hoạt động bên trong của Event Loop Node.js: 4 phases của libuv, 2 Microtask queues, I/O Polling edge case, và Challenge Code."
tags: [nodejs, event-loop, libuv, microtask, nexttick, setImmediate, further-reading]
---

:::note Bài Đọc Thêm
Đây là bài **chuyên sâu** về Event Loop. Nếu anh/chị chưa đọc **[Bài 2: Event-driven Programming](/docs/nodejs/nodejs-architecture/event-driven-programming)**, hãy đọc bài đó trước để có nền tảng.
:::

## Agenda

**Thời gian đọc ước tính:** ~30 phút

### Learning Outcomes

- **Giải thích** chính xác 4 phase chính và 2 Microtask Queue theo thứ tự ưu tiên.
- **Dự đoán** được thứ tự thực thi của bất kỳ đoạn code async nào (nextTick, setTimeout, setImmediate, Promise, fs.readFile).
- **Hiểu** edge case I/O Polling: tại sao `fs.readFile` callback đôi khi in *sau* `setImmediate`.
- **Giải thích** lỗi đặt tên lịch sử của `nextTick` vs `setImmediate`.

---

## Glossary

| Term | Vietnamese Meaning & Quick Explain |
| :--- | :--- |
| **Phase** | Giai đoạn — mỗi vòng lặp Event Loop được chia thành các phases theo thứ tự cố định. |
| **Queue** | Hàng đợi — mỗi phase có một FIFO queue chứa các callbacks chờ thực thi. |
| **Tick** | Một vòng chạy hoàn chỉnh qua tất cả các phases của Event Loop. |
| **Microtask** | Tác vụ cực nhỏ (nextTick, Promise.then) được ưu tiên tuyệt đối, cắt ngang giữa các phases. |
| **Macrotask** | Tác vụ lớn hơn (setTimeout, setInterval, I/O callback) — chạy trong các phases chính của libuv. |
| **Threshold** | Ngưỡng thời gian tối thiểu của setTimeout — callback chỉ chạy *sau khi* ngưỡng này qua, không phải *chính xác* lúc đó. |
| **Starvation** | "Đói tài nguyên" — Event Loop bị kẹt mãi ở Microtask Queue, không thoát được sang phases khác. |

---

## 1. WHY — Tại Sao Cần Hiểu Event Loop?

> User written synchronous JavaScript code takes priority over async code that the runtime would like to execute. Only after the call stack is empty, the event loop comes into the picture.

Giải thích đơn giản: **Code synchronous luôn chạy trước**. Callbacks của các tác vụ async sẽ không được gọi cho đến khi toàn bộ code synchronous hiện tại đã chạy xong (Call Stack rỗng).

![Thứ tự ưu tiên Call Stack vs Event Loop](https://res.cloudinary.com/dv3vzmogk/image/upload/v1784628441/aha-mind/docs-crawler/viblo.asia/edf53fca-ed05-4f25-9ed5-eb995647edfd_tjxwct.png)

Nếu không hiểu Event Loop, bạn sẽ:
- Không thể dự đoán thứ tự thực thi của code async.
- Vô tình gây ra **Starvation** làm treo cả server.
- Debug không ra lý do tại sao callback của `fs.readFile` lại chạy *sau* `setImmediate`.

---

## 2. WHAT — Kiến Trúc Event Loop

### 2.1. Tổng Quan: 4 Phases + 2 Microtask Queues

Event Loop trong Node.js được chia thành **4 phases chính** (do libuv quản lý) và **2 Microtask Queues** riêng biệt (không thuộc libuv):

![Sơ đồ 4 phases và 2 Microtask queues](https://res.cloudinary.com/dv3vzmogk/image/upload/v1784628441/aha-mind/docs-crawler/viblo.asia/3b8e0e55-ea0e-4f87-b6f0-c1d4cbe1cb90_cppy7x.png)

**Thứ tự thực thi đầy đủ trong 1 vòng lặp:**

1. **Microtask Queue** — Thực thi hết tất cả callbacks trong `nextTick queue`, sau đó `Promise queue`.
2. **Timer Queue** — Thực thi callbacks của `setTimeout`, `setInterval` (nếu đã hết threshold).
3. **Microtask Queue** — Kiểm tra và thực thi lại nếu có callbacks mới được thêm vào.
4. **I/O Queue** — Thực thi callbacks của các async I/O operations đã hoàn thành.
5. **Microtask Queue** — Kiểm tra lại.
6. **Check Queue** — Thực thi callbacks của `setImmediate`.
7. **Microtask Queue** — Kiểm tra lại.
8. **Close Queue** — Thực thi close callbacks (ví dụ: `socket.on('close', ...)`).
9. **Microtask Queue** — Kiểm tra lại. Nếu còn callbacks → lặp lại từ đầu. Nếu không → thoát.

> **Nhận xét quan trọng:** `Timer`, `I/O`, `Check`, `Close` là thành phần của **libuv**. **Microtask Queue** là thành phần của **V8/Node.js runtime**, không phải libuv.

### 2.2. Microtask Queue — Hai Hàng Đợi VIP

Microtask Queue thực chất gồm **2 hàng đợi riêng biệt**, luôn được thực thi theo thứ tự:

1. **nextTick Queue** — Ưu tiên tuyệt đối số 1
2. **Promise Queue** — Ưu tiên số 2 (sau nextTick)

**Quy tắc vàng:** Các callbacks trong nextTick queue và Promise queue sẽ chạy **đến khi rỗng hoàn toàn** trước khi Event Loop được phép sang phase tiếp theo. Quan trọng hơn: chúng được kiểm tra **ngay sau khi thực thi xong MỖI callback** trong cùng một phase.

**Ví dụ minh họa:**

```javascript
process.nextTick(() => {
  console.log('nextTick: 1');
  process.nextTick(() => console.log('nextTick: 1.1')); // Thêm vào ngay trong lúc đang chạy
});

setTimeout(() => console.log('setTimeout: 1'));
```

**Kết quả:**
```
nextTick: 1
nextTick: 1.1   // Chạy ngay trong nextTick queue, TRƯỚC setTimeout
setTimeout: 1
```

![Kết quả log: nextTick lồng nhau](https://res.cloudinary.com/dv3vzmogk/image/upload/v1784628441/aha-mind/docs-crawler/viblo.asia/c556126b-d6b1-4632-bb0c-3ff45c11f270_iwajv0.png)

**Ví dụ đầy đủ — Microtask lồng nhau phức tạp:**

```javascript
process.nextTick(() => console.log('nextTick: 1'));
process.nextTick(() => {
  console.log('nextTick: 2');
  Promise.resolve().then(() => console.log('nextTick-Promise: 2.1')); // Promise thêm vào
  process.nextTick(() => console.log('nextTick-nextTick: 2.2'));      // nextTick thêm vào
});
process.nextTick(() => console.log('nextTick: 3'));

Promise.resolve().then(() => console.log('Promise: 1'));
Promise.resolve().then(() => {
  console.log('Promise: 2');
  Promise.resolve().then(() => console.log('Promise-promise: 2.1'));
  process.nextTick(() =>  console.log('Promise-nextTick: 2.2'));
});
Promise.resolve().then(() => console.log('Promise: 3'));

setTimeout(() => console.log('Timeout: 1'), 0);
console.log('Console 1'); // Synchronous — chạy ngay lập tức
```

**Kết quả:**

![Kết quả log phức tạp](https://res.cloudinary.com/dv3vzmogk/image/upload/v1784628441/aha-mind/docs-crawler/viblo.asia/0f58310c-5c1c-42e2-b01c-26aea0c67027_dzitwp.png)

**Giải thích luồng thực thi:**
- `Console 1` in ngay vì là synchronous.
- nextTick queue chạy hết: `1`, `2`, `3`, rồi `2.2` (mới được thêm vào trong lúc chạy `2`).
- Promise queue chạy: `1`, `2`, `3`, `2.1` (mới thêm), rồi nhảy lại nextTick vì `2.2` được thêm từ Promise.
- Microtask Queue rỗng → mới đến Timer Queue: `Timeout: 1`.

**GIF minh họa toàn bộ quá trình:**

![GIF: Quá trình thực thi Microtask Queue](https://github.com/nntwelve/nodejs-event-loop/raw/main/example-1.gif)

---

## 3. HOW — Từng Queue Giải Phẫu

### 3.1. Timer Queue (setTimeout / setInterval)

Callbacks của `setTimeout` và `setInterval` được đưa vào Timer Queue **khi và chỉ khi hết threshold** thời gian được khai báo.

> **Quan trọng:** Timer chỉ là *ngưỡng thời gian tối thiểu* (threshold), không phải *thời điểm chính xác* (exact time). OS scheduling và CPU busy có thể làm delay thêm.

```javascript
setTimeout(() => console.log('Timeout: 1'), 1000);
setTimeout(() => console.log('Timeout: 2'), 0);
setTimeout(() => console.log('Timeout: 3'), 0);

process.nextTick(() => console.log('nextTick: 1'));
Promise.resolve().then(() => console.log('Promise: 1'));
```

**Kết quả:**

![Kết quả: Timer Queue vs Microtask](https://res.cloudinary.com/dv3vzmogk/image/upload/v1784628441/aha-mind/docs-crawler/viblo.asia/972c4fc2-d28b-4bfb-97a5-f256f91e0e0e_rfhnad.png)

**Điều thú vị: Microtask chen ngang giữa các Timer callbacks!**

```javascript
setTimeout(() => console.log('Timeout: 1'), 1000);
setTimeout(() => {
  console.log('Timeout: 2');
  Promise.resolve().then(() => console.log('Timeout-promise: 2.1')); // Microtask mới
  process.nextTick(() => console.log('Timeout-nextTick: 2.2'));        // Microtask mới
}, 0);
setTimeout(() => console.log('Timeout: 3'), 0);

process.nextTick(() => console.log('nextTick: 1'));
Promise.resolve().then(() => console.log('Promise: 1'));
```

**Kết quả:** Giữa `Timeout: 2` và `Timeout: 3`, Microtask Queue được kiểm tra ngay!

![Kết quả: Microtask chen ngang Timer](https://res.cloudinary.com/dv3vzmogk/image/upload/v1784628442/aha-mind/docs-crawler/viblo.asia/583bfd1f-c1e3-418f-b0bc-f42c8d10ff9a_obfxah.png)

**GIF minh họa Timer Queue:**

![GIF: Quá trình thực thi Timer Queue](https://github.com/nntwelve/nodejs-event-loop/raw/main/example-2.gif)

### 3.2. I/O Queue (Poll Phase)

Hầu hết các async methods trong built-in modules (`fs.readFile`, `net`, `http`...) đưa callbacks vào I/O Queue khi hoàn thành.

**I/O Queue có priority thấp hơn Timer Queue** — nhưng có một edge case quan trọng:

```javascript
const fs = require('fs');

fs.readFile(__filename, () => console.log('Readfile 1'));

setTimeout(() => console.log('Timeout: 1'), 1000);
setTimeout(() => console.log('Timeout: 2'), 0);
setTimeout(() => console.log('Timeout: 3'), 0);
```

Chạy nhiều lần và quan sát:

![Kết quả: I/O vs Timer không deterministic](https://res.cloudinary.com/dv3vzmogk/image/upload/v1784628443/aha-mind/docs-crawler/viblo.asia/f1d4fcaf-4ea6-4118-9c26-2bae2cb57d11_mifeb2.png)

Thứ tự giữa `Timeout: 2,3` và `Readfile 1` **không được bảo đảm**. Lý do: `setTimeout(0)` thực chất là `max(1ms, 0) = 1ms`. Nếu khi Event Loop đến Timer Queue mà 1ms chưa qua, callback setTimeout chưa được đẩy vào → Event Loop đến I/O trước.

**Giải pháp: Thêm CPU busy để đảm bảo deterministic:**

```javascript
fs.readFile(__filename, (err, data) => { console.log('Readfile 1') });
setTimeout(() => console.log('Timeout: 2'), 0);
setTimeout(() => console.log('Timeout: 3'), 0);

for (let index = 0; index < 20000000; index++) {} // CPU busy → đảm bảo 1ms đã qua
```

![Kết quả: CPU busy force deterministic](https://res.cloudinary.com/dv3vzmogk/image/upload/v1784628443/aha-mind/docs-crawler/viblo.asia/a895cc60-8fcf-4fe0-8b18-1d6a7655a3b8_qvstk4.png)

### 3.3. I/O Polling — Edge Case Quan Trọng Nhất

Đây là edge case làm nhiều developer bối rối nhất. Xét ví dụ:

```javascript
const fs = require('fs');

setTimeout(() => console.log('Timeout: 1'), 0);
fs.readFile(__filename, () => console.log('Readfile: 1'));
setImmediate(() => console.log('Immediate: 1'));

for (let index = 0; index < 20000000; index++) {} // CPU busy
```

Bạn có thể đoán kết quả là: `Timeout: 1` → `Readfile: 1` → `Immediate: 1`. Nhưng thực tế:

![Kết quả bất ngờ: Readfile: 1 in CUỐI!](https://res.cloudinary.com/dv3vzmogk/image/upload/v1784628441/aha-mind/docs-crawler/viblo.asia/2853c965-6142-4367-9795-ad00faa2b642_y7ldw3.png)

**Tại sao `Readfile: 1` in cuối?** — Đây chính là I/O Polling:

1. Event Loop đến **I/O Queue** — lúc này queue đang **rỗng** (fs.readFile chưa hoàn thành? Không! Nó đã xong, nhưng...).
2. Event Loop thực hiện **I/O Polling** — hỏi OS "có async task nào xong chưa?". `fs.readFile` báo đã xong, callback được đưa vào I/O Queue.
3. Nhưng lúc này Event Loop **đã đi qua I/O Queue rồi** — nó không quay lại, mà tiến đến **Check Queue** để chạy `setImmediate`.
4. Sau Check Queue, Event Loop vòng lại từ đầu (Loop 2), lúc này I/O Queue có callback → `Readfile: 1` in ra.

### 3.4. Check Queue (setImmediate)

`setImmediate` callbacks được đẩy vào Check Queue, chạy ngay sau I/O Poll phase. Đặc điểm quan trọng: **Microtask Queue được kiểm tra sau mỗi callback trong Check Queue**.

```javascript
const fs = require('fs');

fs.readFile(__filename, (err, data) => {
  console.log('Readfile 1');
  setImmediate(() => {
    console.log('Immediate 1');
    process.nextTick(() => console.log('nextTick 1')); // Microtask trong Check Queue!
  });
  setImmediate(() => console.log('Immediate 2'));
});

setTimeout(() => console.log('Timeout: 1'), 0);
for (let index = 0; index < 10e7; index++) {}
```

![Kết quả: nextTick 1 chạy trước Immediate 2](https://res.cloudinary.com/dv3vzmogk/image/upload/v1784628441/aha-mind/docs-crawler/viblo.asia/826dadf7-0d91-45a7-8802-0e1ff965af31_rvczyt.png)

`nextTick 1` (được thêm bởi Immediate 1) chạy trước `Immediate 2` — vì Microtask Queue được kiểm tra sau mỗi callback của Check Queue.

### 3.5. Close Queue

Queue cuối cùng trong mỗi vòng lặp, xử lý các close events:

```javascript
const fs = require('fs');

const readableStream = fs.createReadStream(__filename);
readableStream.close();

readableStream.on('close', () => {
  console.log('readableStream close event callback');
});

setImmediate(() => console.log('Immediate: 1'));
setTimeout(() => console.log('Timeout: 1'), 0);
for (let index = 0; index < 10e7; index++) {}
```

![Kết quả: Close Queue chạy cuối cùng](https://res.cloudinary.com/dv3vzmogk/image/upload/v1784628442/aha-mind/docs-crawler/viblo.asia/06a58000-31e9-4e9d-a22f-7613c085cf75_kbdsyq.png)

Thứ tự như kỳ vọng: Timeout → Immediate → Close callback.

---

## 4. Lỗi Đặt Tên Lịch Sử: nextTick vs setImmediate

Node.js Core Team đã thừa nhận một sự thật khá buồn cười:

- `process.nextTick()` *nên được đặt tên là* `setImmediate()` — vì nó chạy **ngay lập tức**.
- `setImmediate()` *nên được đặt tên là* `nextTick()` — vì nó chờ đến **vòng lặp (tick) kế tiếp** mới chạy.

Nhưng vì **backward compatibility** (phá vỡ hàng triệu packages npm), tên không thể đổi.

**2 lý do thực tế nên dùng `process.nextTick()`:**

![2 lý do thực tế dùng process.nextTick](https://res.cloudinary.com/dv3vzmogk/image/upload/v1784628443/aha-mind/docs-crawler/viblo.asia/270dd27f-8bdd-4dee-a1ff-cf3e3596d78d_sxf1fo.png)

**Lý do 1: Xử lý lỗi và cleanup trước khi Event Loop tiếp tục**
```javascript
function apiCall(arg, callback) {
  if (typeof arg !== 'string') {
    // Dùng nextTick để đảm bảo callback luôn bất đồng bộ
    return process.nextTick(callback, new TypeError('argument must be string'));
  }
  // ... xử lý bình thường
}
```

**Lý do 2: Emit event sau khi constructor hoàn thành**
```javascript
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {
  constructor() {
    super();
    // KHÔNG dùng this.emit('event') trực tiếp — listener chưa được gắn!
    process.nextTick(() => {
      this.emit('event'); // Đảm bảo listener đã được đăng ký trước khi emit
    });
  }
}

const myEmitter = new MyEmitter();
myEmitter.on('event', () => console.log('an event occurred!')); // Đã sẵn sàng
```

> **Lời khuyên:** Dùng `setImmediate()` trong hầu hết trường hợp. Chỉ dùng `process.nextTick()` cho 2 use case trên.

---

## 5. Pitfalls — Starvation (Đói Tài Nguyên)

Nếu bạn liên tục thêm callbacks vào nextTick Queue hoặc Promise Queue theo kiểu đệ quy, Event Loop sẽ **mắc kẹt vĩnh viễn** trong Microtask Queue:

```javascript
// Đừng bao giờ làm thế này trong production!
function recursiveTick() {
  process.nextTick(recursiveTick);
}
recursiveTick();

// Kết quả: Starvation!
// HTTP Server sẽ không xử lý được bất kỳ request nào
// vì Event Loop không bao giờ thoát khỏi Microtask Queue.
```

Tương tự với Promise:

```javascript
function recursivePromise() {
  Promise.resolve().then(recursivePromise);
}
recursivePromise(); // Server treo!
```

---

## 6. Challenge Code — Dự Đoán Output

Trước khi đọc đáp án, hãy tự dự đoán thứ tự output của đoạn code sau:

```javascript
const fs = require('fs');

setTimeout(() => console.log('A: setTimeout'), 0);

Promise.resolve().then(() => console.log('B: Promise'));

process.nextTick(() => console.log('C: nextTick'));

fs.readFile(__filename, () => {
  console.log('D: fs.readFile');
  
  setTimeout(() => console.log('E: setTimeout inside readFile'), 0);
  setImmediate(() => console.log('F: setImmediate inside readFile'));
  process.nextTick(() => console.log('G: nextTick inside readFile'));
});

setImmediate(() => console.log('H: setImmediate'));

console.log('I: synchronous');
```

<details>
<summary>📌 Đáp Án & Giải Thích</summary>

**Thứ tự output:**
```
I: synchronous        ← Code sync chạy đầu tiên
C: nextTick           ← nextTick Queue (VIP 1)
B: Promise            ← Promise Queue (VIP 2)
A: setTimeout         ← Timer Phase (sau Microtask)
H: setImmediate       ← Check Phase (ngoài I/O cycle: không deterministic với setTimeout)
D: fs.readFile        ← I/O Queue (có thể ở loop tiếp theo nếu I/O Polling)
G: nextTick inside    ← Microtask: chen ngang ngay sau readFile callback
F: setImmediate       ← Check Phase (trong I/O cycle: LUÔN trước setTimeout)
E: setTimeout         ← Timer Phase (vòng loop tiếp)
```

**Lưu ý:** Thứ tự `A` (setTimeout) và `H` (setImmediate) khi gọi ngoài I/O cycle có thể **không deterministic** tùy vào CPU. Nhưng `F` (setImmediate) luôn trước `E` (setTimeout) vì chúng được gọi trong I/O cycle.

</details>

---

## 7. References & Attribution

| Tài liệu | Link |
| :--- | :--- |
| **Node.js Official Docs: Event Loop** | [nodejs.org/learn/asynchronous-work/event-loop-timers-and-nexttick](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick) |
| **Viblo: Tìm Hiểu Event Loop (Phần 1)** | [viblo.asia/p/...Yym40neBL91](https://viblo.asia/p/tim-hieu-ve-event-loop-cua-nodejs-phan-1-ly-thuyet-tong-quan-Yym40neBL91) |
| **VISHWAS GOPINATH — Visualizing Node.js Event Loop** | [builder.io/blog/NodeJS-visualizing-nextTick-and-promise-queues](https://www.builder.io/blog/NodeJS-visualizing-nextTick-and-promise-queues) |
| **GitHub: nodejs-event-loop (GIF Examples)** | [github.com/nntwelve/nodejs-event-loop](https://github.com/nntwelve/nodejs-event-loop) |
| **Mastering Node.js (PACKT)** | Chapter 2 — Understanding Asynchronous Event-Driven Programming |

> Các hình ảnh diagram và GIF trong bài viết này được tham khảo từ bài viết của tác giả **VISHWAS GOPINATH** trên [builder.io](https://www.builder.io/), được tổng hợp lại bởi **nntwelve** trên Viblo.

---

*Made by Anh Tu - Share to be share*
