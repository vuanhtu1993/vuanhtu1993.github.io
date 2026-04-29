---
sidebar_position: 6
title: "14. Graph — Mô hình hóa thế giới thực"
description: "Khái niệm Đồ thị (Graph). Sự khác biệt giữa Đồ thị có hướng/vô hướng và cách biểu diễn Graph bằng Adjacency List trong TypeScript."
---

# Graph — Mô hình hóa thế giới thực

Mọi cấu trúc dữ liệu bạn học từ đầu chương trình (Array, Linked List, Tree) đều có một nguyên tắc chung: Mối quan hệ giữa các phần tử đều có trật tự nhất định (Tuyến tính một đường, hoặc Phân cấp Cha-Con). 

Nhưng thực tế cuộc sống thì hỗn loạn hơn rất nhiều. Bạn và một người bạn khác kết bạn trên Facebook — đó là quan hệ ngang hàng (không ai làm cha, không ai làm con). Bạn theo dõi Taylor Swift trên Twitter, nhưng cô ấy không theo dõi lại bạn — đó là quan hệ một chiều.

Làm thế nào để mô phỏng một mạng lưới phức tạp như Mạng xã hội hay Bản đồ Google Maps? Chào mừng bạn đến với cấu trúc dữ liệu linh hoạt nhất và quyền năng nhất: **Graph (Đồ thị)**.

## 📋 Agenda

**Thời gian đọc ước tính:** ~7 phút

### Sau bài này, bạn sẽ:
- ✅ **Hiểu** được Graph là gì và thuật ngữ cốt lõi của Đồ thị (Vertex, Edge).
- ✅ **Phân biệt** được Đồ thị có hướng (Directed) và vô hướng (Undirected), có trọng số và không trọng số.
- ✅ **Nắm bắt** được 2 cách biểu diễn Graph trong máy tính: Ma trận kề (Adjacency Matrix) và Danh sách kề (Adjacency List).
- ✅ **Tự tay** implement một Graph cơ bản bằng TypeScript.

### Yêu cầu đầu vào:
- 🔹 Có kiến thức về [Hash Table / Map](./01-hash-table.md) và [Array](../02-linear-ds/01-array.md).

---

## ❓ Tại sao Tree không đủ để mô hình hóa Mạng lưới?

**Vấn đề (Problem Statement):**
Giả sử bạn dùng Tree để mô phỏng bạn bè. Bạn (Root) -> rẽ nhánh ra 2 người bạn (A, B). Nhưng chuyện gì xảy ra nếu A và B cũng là bạn của nhau? 
Trong quy tắc của Tree, 2 Nút con không được phép nối ngang sang nhau. Tree hoàn toàn bất lực trước các mối liên kết chéo (vòng lặp).

**Giải pháp (Solution):**
**Graph**. Chúng ta dỡ bỏ mọi giới hạn của Tree. Trong Graph, các điểm có thể kết nối với nhau một cách tùy ý. Không có Root, không có Cha, không có Con. Chỉ có các Điểm (Đỉnh) và Đường nối (Cạnh). Thực tế, **Tree là một phiên bản giới hạn (bị thiến) của Graph!**

---

## 📖 Các khái niệm cốt lõi của Graph

**Định nghĩa:** Graph (Đồ thị) là một tập hợp các **Đỉnh (Vertex / Node)** và các **Cạnh (Edge)** kết nối các đỉnh đó với nhau.

### 1. Phân loại theo Hướng (Direction)

```mermaid
flowchart LR
    subgraph Undirected [Đồ thị Vô Hướng (Facebook)]
        direction LR
        A((You)) <--- Cạnh_2_chiều ---> B((Friend))
    end
    
    subgraph Directed [Đồ thị Có Hướng (Twitter / Instagram)]
        direction LR
        C((You)) -- Follow --> D((Taylor Swift))
    end
    
    style A fill:#ff6b6b,color:#fff
    style B fill:#4ecdc4,color:#fff
    style C fill:#ff6b6b,color:#fff
    style D fill:#f39c12,color:#fff
```

- **Vô hướng (Undirected):** Nếu A nối với B, thì B tự động nối với A. Đường đi là hai chiều.
- **Có hướng (Directed):** Đường đi có mũi tên. Có thể đi từ C sang D, nhưng D không thể đi ngược về C nếu không có mũi tên ngược lại.

### 2. Phân loại theo Trọng số (Weight)
- **Unweighted (Không trọng số):** Tất cả các cạnh đều bằng nhau (vd: kết bạn MXH).
- **Weighted (Có trọng số):** Mỗi cạnh có một giá trị cụ thể (vd: Google Maps, cạnh là đoạn đường dài 5km hoặc tốn 10 phút đi xe).

---

## 🔨 Làm sao để lưu trữ Graph vào Máy tính?

Khác với Array hay Linked List có thể dễ dàng khai báo, một cấu trúc mạng nhện lộn xộn thì lưu thế nào? Có 2 cách kinh điển:

### Cách 1: Ma trận kề (Adjacency Matrix)
Dùng mảng 2 chiều (bảng tính Excel). Nếu điểm A nối điểm B, đánh số `1`. Không nối đánh số `0`.
- **Ưu điểm:** Kiểm tra xem A có nối với B không tốn `O(1)`.
- **Nhược điểm (Pitfall):** Tốn RAM kinh khủng `O(V^2)` (V là số đỉnh). Nếu Facebook có 1 tỷ người dùng, bảng ma trận sẽ có kích thước 1 tỷ x 1 tỷ = 1 tỷ tỷ ô, dù bạn chỉ có 100 người bạn. Đa số các ô sẽ là số 0 lãng phí (Sparse Matrix).

### Cách 2: Danh sách kề (Adjacency List)
Thay vì làm bảng, ta dùng một **Hash Map** (Object / Map). Key là tên 1 Đỉnh, Value là một Array chứa các Đỉnh mà nó kết nối tới.

```json
{
  "A": ["B", "C"],
  "B": ["A", "D"],
  "C": ["A", "D"],
  "D": ["B", "C"]
}
```
- **Ưu điểm:** Cực kỳ tiết kiệm bộ nhớ, chỉ tốn `O(V + E)` (Tổng số đỉnh và cạnh). Đây là cách lưu trữ phổ biến nhất trong thực tế và các bài toán phỏng vấn.

---

## 🔨 Implement Graph bằng TypeScript

Chúng ta sẽ implement một Đồ thị **Vô hướng, Không trọng số (Undirected Unweighted Graph)** bằng Adjacency List.

```typescript
// filename: graph.ts

class Graph {
  // Dùng Map để lưu Danh sách kề. Key là tên đỉnh, Value là mảng các đỉnh kề nó
  private adjacencyList: Map<string, string[]> = new Map();

  // 1. Thêm một Đỉnh (Vertex/Node)
  addVertex(vertex: string): void {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, []);
    }
  }

  // 2. Thêm một Cạnh (Edge) nối giữa 2 Đỉnh
  addEdge(vertex1: string, vertex2: string): void {
    const list1 = this.adjacencyList.get(vertex1);
    const list2 = this.adjacencyList.get(vertex2);

    // Vì là Đồ thị VÔ HƯỚNG, phải thêm cạnh cho cả 2 bên (A có B thì B cũng có A)
    if (list1 && list2) {
      list1.push(vertex2);
      list2.push(vertex1);
    }
  }

  // 3. Xóa một Cạnh
  removeEdge(vertex1: string, vertex2: string): void {
    const list1 = this.adjacencyList.get(vertex1);
    const list2 = this.adjacencyList.get(vertex2);

    if (list1) {
      // Lọc bỏ vertex2 khỏi list1
      this.adjacencyList.set(vertex1, list1.filter(v => v !== vertex2));
    }

    if (list2) {
      // Lọc bỏ vertex1 khỏi list2
      this.adjacencyList.set(vertex2, list2.filter(v => v !== vertex1));
    }
  }

  // 4. Xóa hoàn toàn một Đỉnh
  removeVertex(vertex: string): void {
    const neighbors = this.adjacencyList.get(vertex);
    
    // Trước khi xóa Đỉnh, phải chặt đứt mọi Cạnh nối tới nó từ các Đỉnh khác
    if (neighbors) {
      for (const neighbor of neighbors) {
        this.removeEdge(vertex, neighbor);
      }
    }
    
    // Cuối cùng, xóa Đỉnh khỏi Map
    this.adjacencyList.delete(vertex);
  }
}
```

---

## 🚀 WHAT IF — Điểm yếu của Graph

Mô hình hóa được mạng lưới phức tạp, Graph là lõi của AI recommendation system, Google search, Định tuyến mạng Internet.
Tuy nhiên, cấu trúc này phức tạp dẫn đến các rủi ro chết người trong logic lập trình:

### ⚠️ Pitfall: Vòng lặp Vô Tận (Infinite Cycle)
Nếu bạn được giao bài toán: *"Hãy in ra tất cả các bạn của bạn, và bạn của bạn của bạn"* (Duyệt đồ thị).
Vì Graph có tính tuần hoàn, A nối B, B nối C, C lại nối ngược lại A. Nếu bạn không có cơ chế **"Ghi nhớ những ai đã được in ra (Visited Set)"**, chương trình sẽ chạy vòng quanh A-B-C vĩnh viễn cho đến khi sập Server (Maximum Call Stack Exceeded).

---

## 💬 Thảo luận

Giờ thì chúng ta đã có cấu trúc mạng lưới (Graph), nhưng một vấn đề nan giải xuất hiện: Làm sao để di chuyển (Duyệt) trong một mớ bòng bong không có phương hướng, không có Rễ, không có Lá như thế này?

Nếu muốn tìm kiếm một người trong mạng xã hội, bạn sẽ:
- Lan tỏa hỏi thăm rộng ra tất cả những người bạn trực tiếp của mình trước? 
- Hay nhắm mắt đi sâu theo một đường thẳng dây chuyền cho đến khi tắc đường rồi mới quay lại?

Đó chính là câu chuyện của 2 thuật toán nổi tiếng nhất lịch sử Khoa học máy tính: **Breadth-First Search (BFS)** và **Depth-First Search (DFS)**. Hãy cùng khám phá ở bài tiếp theo!

---
*Made by Anh Tu - Share to be share*
