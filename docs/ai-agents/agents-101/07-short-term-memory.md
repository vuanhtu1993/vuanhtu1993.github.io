---
sidebar_position: 7
description: "Khám phá cách cấp phát bộ nhớ ngắn hạn (Short-term Memory) cho LangGraph Agent để duy trì ngữ cảnh. Bao gồm cả Database Persistence (Postgres/MongoDB) và các chiến lược quản lý bộ nhớ nâng cao."
---

# 1.7. Short-term Memory: Bộ Nhớ Trong Một Session

## Agenda

**Thời gian đọc ước tính:** ~25 phút

### Learning outcome:
- **Hiểu** được bản chất phi trạng thái (stateless) của LLM và kiến trúc bộ nhớ thông qua Checkpointer.
- **Tự tay** cấu hình được các bộ lưu trữ từ cơ bản (`MemorySaver`) đến Production (`PostgresSaver`, `MongoDBSaver`).
- **Áp dụng** được cơ chế truyền (propagate) checkpointer cho các Subgraphs.
- **Phân biệt** và **triển khai** được 3 chiến lược quản lý Context Window cốt lõi: Trim, Delete, và Summarize.

---

## Glossary & Vocabulary

**1. Technical Terms (Thuật ngữ kỹ thuật):**

| Term | Vietnamese Meaning & Quick Explain |
| :--- | :--- |
| **Short-term Memory** | Bộ nhớ ngắn hạn — lưu trữ và theo dõi ngữ cảnh của một cuộc hội thoại đa lượt (multi-turn) thuộc một luồng cụ thể. |
| **Checkpointer** | Trạm kiểm soát — cơ chế của LangGraph dùng để lưu trạng thái (State) vào RAM hoặc Database sau mỗi bước chạy. |
| **Thread ID** | Mã định danh luồng — ID duy nhất dùng để phân biệt và truy xuất đúng phiên hội thoại của một người dùng. |
| **TrimMessages** | Cắt tỉa tin nhắn — chiến lược giữ lại N tin nhắn mới nhất và vứt bỏ các tin nhắn cũ. |
| **RemoveMessage** | Xóa tin nhắn — đối tượng đặc biệt dùng để chỉ định xóa một tin nhắn cụ thể khỏi Graph State. |
| **Summarize Messages** | Tóm tắt tin nhắn — chiến lược sử dụng LLM để đọc lịch sử cũ, viết thành đoạn tóm tắt, và lưu lại vào State. |

**2. Vocabulary Support (Từ vựng học thuật/B1+):**

| Word | Meaning in Context (Nghĩa trong ngữ cảnh) |
| :--- | :--- |
| **Stateless (adj)** | Phi trạng thái — không lưu giữ ký ức về các yêu cầu trước đó. Mỗi API request là hoàn toàn độc lập. |
| **Persistence (n)** | Sự lưu trữ bền bỉ — khả năng ghi dữ liệu xuống đĩa cứng (Database) để không bị mất khi restart server. |
| **Truncate (v)** | Cắt xén — hành động loại bỏ đi một phần (đầu hoặc cuối) của mảng dữ liệu. |
| **Sophisticated (adj)** | Tinh vi, phức tạp — mô tả các thuật toán xử lý nâng cao mang lại hiệu quả cao hơn cách làm thông thường. |
| **Propagate (v)** | Truyền tải, lan truyền — tự động truyền cấu hình từ Graph cha xuống Graph con. |

---

## Vấn đề & Giải pháp

**Vấn đề (Problem Statement):**
1. **Bản chất Stateless:** Các mô hình ngôn ngữ lớn (LLM) không tự động nhớ những gì bạn vừa nói ở câu trước. Nếu không có cơ chế quản lý, Agent không thể thực hiện các tác vụ phức tạp đòi hỏi ngữ cảnh liền mạch (ví dụ: "Sửa lỗi ở dòng code bạn vừa viết").
2. **Quản lý đa người dùng (Concurrency):** Khi hệ thống có hàng ngàn người dùng truy cập cùng lúc, làm sao để hệ thống không lấy nhầm tin nhắn của User A để trả lời cho User B?
3. **Giới hạn Context Window:** Khi cuộc hội thoại kéo dài hàng trăm lượt, việc nhét tất cả vào một API request sẽ làm đầy bộ nhớ (Context Window) của LLM, dẫn đến lỗi từ chối dịch vụ hoặc chi phí siêu đắt đỏ.

**Giải pháp (Solution):**
LangGraph cung cấp hệ thống **Thread-level Persistence** (*Lưu trữ cấp độ luồng*) thông qua các `Checkpointer`. Nó tự động hóa việc cô lập phiên làm việc bằng `thread_id`. Hơn nữa, nó cung cấp sẵn các công cụ (Trim, Remove, Summarize) để xử lý triệt để bài toán tràn bộ nhớ.

---

## Short-term Memory & Checkpointer Là Gì?

Mặc dù gọi là "Short-term" (Ngắn hạn), dữ liệu này hoàn toàn có thể được Persistence (*Lưu trữ bền bỉ*) xuống Database. Chữ "Short-term" ở đây chỉ phạm vi (Scope): Nó là ký ức thuộc về **một phiên làm việc cụ thể** (Thread), không phải bộ nhớ kiến thức toàn cục của ứng dụng.

### Định nghĩa kỹ thuật

**Checkpointer** là một giao diện (Interface) trong LangGraph làm nhiệm vụ lưu trữ và phục hồi toàn bộ Trạng thái đồ thị (Graph State) dựa trên một định danh luồng (Thread ID) cụ thể.

**Giải phẫu định nghĩa (Definition Anatomy):**
- **Giao diện (Interface)**: Có nghĩa là nó có thể được triển khai bằng nhiều cách khác nhau (RAM, Postgres, MongoDB) mà không làm thay đổi logic code của Agent.
- **Phục hồi (Restore)**: Khả năng lấy lại đúng trạng thái tại bước chạy cuối cùng (hữu ích cho tính năng Human-in-the-loop).
- **Định danh luồng (Thread ID)**: Căn cước công dân của một phiên chat. Mọi dữ liệu đều bị khóa chặn trong Thread ID này.

### Trực quan hóa Kiến trúc Checkpointer

```mermaid
sequenceDiagram
    participant User
    participant Graph as LangGraph Engine
    participant CP as Checkpointer (Memory/DB)
    participant LLM as Chat Model

    User->>Graph: "Tên tôi là Tú" + {thread_id: "user_123"}
    Graph->>CP: Get State ("user_123")
    CP-->>Graph: [] (Trống)
    Graph->>LLM: Invoke: ["Tên tôi là Tú"]
    LLM-->>Graph: "Chào Tú!"
    Graph->>CP: Save State ("user_123", ["Tên tôi...", "Chào Tú!"])
    Graph-->>User: "Chào Tú!"
    
    User->>Graph: "Tôi tên gì?" + {thread_id: "user_123"}
    Graph->>CP: Get State ("user_123")
    CP-->>Graph: ["Tên tôi...", "Chào Tú!"]
    Graph->>LLM: Invoke: [lịch sử + "Tôi tên gì?"]
    LLM-->>Graph: "Bạn tên Tú."
    Graph->>CP: Save State ("user_123", [...cũ, "Bạn tên Tú."])
    Graph-->>User: "Bạn tên Tú."
```

---

## Cấp Phát Bộ Nhớ: Từ Development đến Production

### 1. Môi trường Development (`MemorySaver`)

Khi đang phát triển ở máy cá nhân (Local), sử dụng `MemorySaver` là cách nhanh nhất. Dữ liệu được lưu trong RAM Node.js và sẽ mất khi bạn khởi động lại server.

```typescript
// filename: memory/dev-memory.ts
import { MemorySaver, StateGraph, START } from "@langchain/langgraph";

// 1. Khởi tạo checkpointer trên RAM
const checkpointer = new MemorySaver();

const builder = new StateGraph(State).addNode("call_model", callModel).addEdge(START, "call_model");

// 2. Tiêm checkpointer vào Graph lúc compile
const graph = builder.compile({ checkpointer });

// 3. Thực thi kèm theo thread_id
await graph.invoke(
  { messages: [{ role: "user", content: "Hi! I am Bob" }] },
  { configurable: { thread_id: "thread_user_1" } }
);
```

### 2. Môi trường Production (`PostgresSaver` & `MongoDBSaver`)

Khi đưa hệ thống lên Production, bạn KHÔNG THỂ dùng `MemorySaver` vì Node.js sẽ hết RAM và dữ liệu sẽ bị mất trắng. LangGraph hỗ trợ sẵn các Database quen thuộc. Bản chất code hoàn toàn không thay đổi, bạn chỉ cần thay đổi đối tượng Checkpointer.

**Sử dụng PostgreSQL:**

```bash
npm install @langchain/langgraph-checkpoint-postgres
```

```typescript
// filename: memory/prod-postgres.ts
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";

// Sử dụng Connection String của PostgreSQL
const DB_URI = "postgresql://postgres:password@localhost:5432/postgres?sslmode=disable";

// Khởi tạo Postgres Checkpointer thay vì MemorySaver
const checkpointer = PostgresSaver.fromConnString(DB_URI);

// Tương tự, compile Graph với checkpointer mới
const graph = builder.compile({ checkpointer });
```

**Sử dụng MongoDB:**

```bash
npm install mongodb @langchain/langgraph-checkpoint-mongodb
```

```typescript
// filename: memory/prod-mongo.ts
import { MongoClient } from "mongodb";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";

const client = new MongoClient("mongodb://user:password@localhost:27017");

// Khởi tạo MongoDB Checkpointer, chỉ định rõ tên DB
const checkpointer = new MongoDBSaver({ client, dbName: "langgraph_persistence" });

const graph = builder.compile({ checkpointer });
```

### 3. Tự động lan truyền cho Subgraphs (Propagate)

Nếu hệ thống của bạn phức tạp và sử dụng Graph lồng Graph (Subgraphs), bạn **không cần** phải gán checkpointer cho từng Graph con. LangGraph có cơ chế Propagate (*Lan truyền*) tự động.

```typescript
// filename: memory/subgraph.ts
const subgraphBuilder = new StateGraph(State).addNode("sub_node", subNodeLogic);
const subgraph = subgraphBuilder.compile(); // Không cần truyền checkpointer ở đây

const parentBuilder = new StateGraph(State).addNode("child_graph", subgraph);

// Chỉ cần truyền checkpointer ở Parent Graph
const graph = parentBuilder.compile({ checkpointer: new PostgresSaver(...) });
```
*(Nếu bạn muốn Graph con tự quản lý checkpoint độc lập hoàn toàn, bạn có thể thiết lập `compile({ checkpointer: true })` cho Graph con).*

---

## Quản lý Context Window: 3 Chiến lược cốt lõi

Việc để Checkpointer liên tục lưu (append) dữ liệu sẽ sớm làm đầy Context Window của LLM, gây ra lỗi API. LangGraph cung cấp 3 chiến lược giải quyết tinh vi.

### Chiến lược 1: Cắt tỉa (Trim Messages)

Đây là cách đơn giản nhất: Đếm số lượng Token, nếu vượt ngưỡng thì loại bỏ các tin nhắn cũ nhất.

```typescript
// filename: memory/strategy-trim.ts
import { trimMessages } from "@langchain/core/messages";

const callModel = async (state) => {
  // Cắt tỉa mảng tin nhắn TRƯỚC khi đưa vào LLM
  const trimmedMessages = trimMessages(state.messages, {
    strategy: "last",      // Chiến lược giữ lại N tin nhắn cuối cùng (mới nhất)
    maxTokens: 2000,       // Giới hạn an toàn (Ví dụ: 2000 tokens)
    startOn: "human",      // LLM thường yêu cầu tin nhắn bắt đầu phải là từ Human
    endOn: ["human", "tool"],
    tokenCounter: model,   // Dùng chính LLM để đếm token cho chính xác
  });
  
  const response = await model.invoke(trimmedMessages);
  return { messages: [response] };
};
```
**Ưu điểm:** Nhanh, dễ implement, không tốn thêm chi phí API.
**Nhược điểm:** LLM sẽ quên sạch các chi tiết quan trọng ở đầu cuộc hội thoại (ví dụ: Tên người dùng, yêu cầu gốc).

### Chiến lược 2: Xóa vĩnh viễn (Delete Messages)

Trong LangGraph, bạn không thể dùng hàm `messages.splice()` của Javascript để xóa State. Bạn bắt buộc phải trả về đối tượng `RemoveMessage` để hệ thống Reducer của LangGraph hiểu và thực hiện lệnh xóa.

```typescript
// filename: memory/strategy-delete.ts
import { RemoveMessage } from "@langchain/core/messages";

const deleteOldMessagesNode = (state) => {
  const messages = state.messages;
  
  // Nếu cuộc hội thoại quá dài (> 10 tin nhắn)
  if (messages.length > 10) {
    // Trả về mảng chứa lệnh Xóa 2 tin nhắn cũ nhất
    return {
      messages: [
        new RemoveMessage({ id: messages[0].id }),
        new RemoveMessage({ id: messages[1].id })
      ]
    };
  }
  return {};
};
```
Chiến lược này thường được đặt thành một Node riêng biệt trong đồ thị và được gọi sau khi LLM phản hồi.

### Chiến lược 3: Tóm tắt thông minh (Summarize Messages)

Đây là chiến lược Sophisticated (*Tinh vi*) và chuyên nghiệp nhất. Thay vì vứt bỏ lịch sử, chúng ta sử dụng một cuộc gọi LLM phụ để tóm tắt các đoạn hội thoại cũ và lưu nó lại vào State.

![Summary](https://res.cloudinary.com/dv3vzmogk/image/upload/v1781707366/aha-mind/docs-crawler/docs.langchain.com/summary_tvw1po.png)
*(Sơ đồ: Các tin nhắn cũ được đóng gói thành một bản tóm tắt, trong khi các tin nhắn mới vẫn được giữ nguyên để duy trì nhịp điệu giao tiếp).*

**Cách thức hoạt động:**
1. Mở rộng `StateSchema` để chứa thêm biến `summary`.
2. Khi mảng tin nhắn quá dài, gọi LLM đọc các tin nhắn cũ và tạo ra một đoạn văn tóm tắt.
3. Ghi đè biến `summary` và xóa các tin nhắn cũ bằng `RemoveMessage`.
4. Ở các lượt sau, LLM chính sẽ nhận được đầu vào gồm: `[Biến Summary] + [Vài tin nhắn gần nhất]`.

Chiến lược này giải quyết triệt để vấn đề quên thông tin gốc của chiến lược Trim, trong khi vẫn kiểm soát chặt chẽ được số lượng token gửi lên API.

---

## Discussion Questions

1. **Trade-off Kiến trúc:** Việc chọn MongoDB thay vì PostgreSQL làm Checkpointer mang lại những lợi điểm (ưu điểm) và rủi ro gì khi hệ thống của bạn lưu trữ hàng triệu phiên hội thoại mỗi ngày?
2. **Chiến lược Tóm tắt:** Phương pháp Summarize Messages nghe có vẻ hoàn hảo, nhưng nó mang lại Overhead (*Chi phí phát sinh*) rất lớn về thời gian chờ (Latency) và tiền bạc. Làm thế nào để bạn tối ưu hóa kiến trúc này? (Gợi ý: Dùng mô hình rẻ tiền như `GPT-4o-mini` cho tác vụ summarize, và chạy bất đồng bộ).
3. **Quản lý Vòng đời (Lifecycle):** Dữ liệu trong Database Persistence sẽ phình to rất nhanh. Nếu triển khai thực tế, bạn sẽ thiết kế cơ chế dọn dẹp (Cron Job / TTL) cho các Thread ID "chết" như thế nào?

---

## Tài liệu tham khảo

- [LangGraph: Add memory](https://docs.langchain.com/oss/javascript/langgraph/add-memory) - Toàn bộ tài liệu chi tiết từ nhà phát hành.
- [How to trim messages](https://js.langchain.com/docs/how_to/trim_messages/) - Hướng dẫn đi sâu vào các cấu hình đếm và cắt token.

---

*Made by Anh Tu - Share to be share*
