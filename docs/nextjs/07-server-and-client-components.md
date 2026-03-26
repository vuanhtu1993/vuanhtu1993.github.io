---
sidebar_position: 7
title: "7. Server và Client Components"
description: "Hiểu rõ sự khác biệt giữa Server Component và Client Component trong Next.js App Router — khi nào dùng, cơ chế hoạt động, và cách kết hợp chúng hiệu quả."
tags: [nextjs, react, server-components, client-components, RSC]
---

# Server và Client Components

## 📋 Agenda

**Thời gian đọc ước tính:** ~20 phút

### Sau bài này, bạn sẽ:

- ✅ **Giải thích** được tại sao Next.js App Router lại có hai loại component khác nhau
- ✅ **Phân biệt** được khi nào dùng Server Component và khi nào dùng Client Component
- ✅ **Hiểu** khái niệm Network Boundary, cơ chế RSC Payload, Hydration và quá trình render hai phía
- ✅ **Tự tay** kết hợp (interleave) Server và Client Components trong một ứng dụng thực tế
- ✅ **Tránh** được các lỗi phổ biến: environment poisoning, context không hoạt động trong Server Component

### Yêu cầu đầu vào (Prerequisites):

- 🔹 Biết cơ bản về React (component, props, useState)
- 🔹 Đã đọc bài [Routing trong Next.js](./04-routing.md)
- 🔹 Hiểu cơ bản về khái niệm SSR (Server-Side Rendering)

---

## ❓ WHY — Tại sao phải có hai loại component?

Bạn đã bao giờ gặp tình huống này chưa?

> *"Tôi cần lấy data từ database để hiển thị danh sách sản phẩm. Đồng thời, nút 'Thêm vào giỏ hàng' cần phản hồi ngay khi người dùng click."*

Nếu **mọi component đều chạy trên client (trình duyệt)**, bạn sẽ gặp vấn đề:

- 🔴 **Toàn bộ JavaScript** (kể cả logic lấy data) phải tải về trình duyệt → bundle to, trang chậm
- 🔴 **API keys, secrets** dễ bị lộ vì code chạy trên client
- 🔴 User phải đợi JavaScript tải xong mới thấy nội dung (blank screen)

Nếu **mọi component đều chạy trên server**, bạn cũng gặp giới hạn:

- 🔴 Không thể dùng `useState`, `useEffect`, sự kiện click
- 🔴 Không thể truy cập `localStorage`, `window`
- 🔴 UI trở nên tĩnh, không có tương tác

**Giải pháp của Next.js App Router (React Server Components):** Cho phép mỗi component "chọn nơi chạy" — server hoặc client — tùy theo nhiệm vụ của nó.

:::info Cập nhật từ React 19.2
React 19.2 (Oct 2025) giới thiệu thêm `<Activity />` giúp kiểm soát việc pre-render các phần ẩn của UI, và `cacheSignal` cho Server Components. Đây là bước tiến thêm trên nền tảng RSC mà bài này giới thiệu.
:::

---

## 📖 WHAT — Chúng là gì?

### Ẩn dụ: Bếp nhà hàng và bàn phục vụ

Hãy tưởng tượng một nhà hàng:

- **Bếp (Kitchen) = Server** 🍳: Chế biến món ăn, xử lý nguyên liệu thô (database, API), cần giữ bí mật công thức (API keys). Khách **không vào bếp** được.
- **Bàn phục vụ (Table) = Client** 🍽️: Khách hàng ngồi đây, tương tác trực tiếp (gọi thêm nước, chọn toppings), cần phản hồi ngay lập tức.

Một bữa ăn ngon (ứng dụng tốt) cần cả hai: **bếp chuẩn bị sẵn** rồi **bàn phục vụ tương tác**.

### Khái niệm "Network Boundary" (Biên mạng)

**Network Boundary** là ranh giới logic chia tách vùng code chạy độc quyền trên Server và vùng code chạy trên Client. Trong Next.js, đường biên này được thiết lập thông qua chỉ thị `'use client'`.

Trở lại ẩn dụ nhà hàng: **Network Boundary chính là quầy giao món (Counter)**. 
Khách hàng (Client) có thể tự do tương tác tại bàn ăn, nhưng tuyệt đối không thể bước qua quầy để vào khu vực bếp (Server). Tương tự, đầu bếp chỉ ở trong bếp để xử lý nguyên liệu thô (Database) và đưa ra "thành phẩm" (RSC Payload) qua quầy giao món.

Khi bạn đặt `'use client'` ở đầu một file, bạn đang thiết lập một Network Boundary. Từ điểm đánh dấu đó trở xuống trên cây component, mọi thứ (bao gồm các component con được import) đều bước qua ranh giới và trở thành Client Components.

```mermaid
graph TD
    subgraph Server_Zone ["🍳 Khu vực Bếp (Server Zone) - Không lộ code"]
        DB[(Database)]
        SC_Layout["Layout<br>(Server Component)"]
        SC_Page["Page hiển thị danh sách<br>(Server Component)"]
        SC_Layout --> SC_Page
        DB -. "Lấy dữ liệu" .-> SC_Page
    end

    Boundary{{"🚧 NETWORK BOUNDARY 🚧<br>('use client')"}}

    subgraph Client_Zone ["🍽️ Bàn phục vụ (Client Zone) - JS Bundle"]
        CC_Interactive["Interactive Wrapper<br>(Client Component)"]
        CC_Button["Nút Like/Share<br>(Client Component)"]
        CC_Interactive --> CC_Button
    end

    SC_Page -. "Truyền Dữ liệu (Props)" .-> Boundary
    Boundary -.-> CC_Interactive

    style Server_Zone fill:#e8f4fd,stroke:#1a73e8,stroke-width:2px;
    style Client_Zone fill:#fef9e7,stroke:#f39c12,stroke-width:2px;
    style Boundary fill:#f8d7da,stroke:#dc3545,stroke-width:2px,stroke-dasharray: 5 5,color:#721c24;
```

📌 **Quy tắc khi đi qua Boundary:**
Vì Network Boundary là ranh giới giữa hai môi trường hoàn toàn khác nhau (Node.js/Edge và Browser), dữ liệu khi truyền qua đây (từ Server Component xuống Client Component) bắt buộc phải là **Serializable** (có thể chuyển hóa thành định dạng chuỗi JSON). 
👉 Đó là lý do bạn **không thể** truyền biến `function`, thực thể class như `Date`, hay các đối tượng phức tạp không thể JSON-hóa qua ranh giới này.

### Định nghĩa kỹ thuật

| | Server Component | Client Component |
|---|---|---|
| **Chạy ở đâu** | Trên server (khi build hoặc khi request) | Trên trình duyệt (client) |
| **Khai báo** | Mặc định (không cần thêm gì) | Thêm `'use client'` ở đầu file |
| **Có thể dùng** | `async/await`, database, secrets | `useState`, `useEffect`, Browser APIs |
| **Không thể dùng** | `useState`, event handlers, `window` | API keys bí mật (code lộ ra browser) |
| **Output** | RSC Payload (binary) | JavaScript bundle |

### Kiến trúc tổng thể

```mermaid
graph TD
    subgraph ServerZone["🖥️ Server (Build / Request time)"]
        SC["Server Components<br>(mặc định)"]
        DB[("Database / API")]
        SC -->|"1. fetch data"| DB
        SC -->|"2. render ra"| RSC["RSC Payload<br>(compact binary)"]
        CC_ref["Client Components<br>(JS reference only)"]
        RSC -->|"3. kết hợp"| Prerender["Prerender Engine"]
        CC_ref -->|"3. kết hợp"| Prerender
        Prerender -->|"4. xuất ra"| HTML["HTML tĩnh<br>(non-interactive)"]
    end

    Cache[("🗄️ Router Cache<br>(RSC Payload)<br>prefetch + store")]

    subgraph FirstLoad["🌐 First Load — Lần mở trang đầu tiên"]
        direction TB
        FL1["① Hiển thị HTML ngay<br>(non-interactive)"]
        FL2["② RSC Payload reconcile<br>cây Server + Client"]
        FL3["③ JS hydrate Client Components<br>(gắn event handlers)"]
        FL4["✅ UI có tương tác"]
        FL1 --> FL2 --> FL3 --> FL4
    end

    subgraph SubNav["🔁 Subsequent Navigations — Điều hướng tiếp theo"]
        direction TB
        SN1["Cache HIT<br>RSC Payload sẵn có"]
        SN2["Client Components render<br>hoàn toàn trên client<br>(không cần HTML từ server)"]
        SN1 --> SN2
    end

    HTML -->|"gửi về browser"| FL1
    RSC -->|"gửi về browser"| FL2
    RSC -->|"lưu vào cache"| Cache
    Cache -->|"cache HIT<br>(instant navigation)"| SN1

    style ServerZone fill:#e8f4fd,stroke:#1a73e8,stroke-width:2px
    style FirstLoad fill:#fef9e7,stroke:#f39c12,stroke-width:2px
    style SubNav fill:#f0f0f0,stroke:#666,stroke-width:2px
    style Cache fill:#fde8ff,stroke:#9b59b6,stroke-width:2px
    style RSC fill:#d5f5e3,stroke:#27ae60
    style HTML fill:#d5f5e3,stroke:#27ae60
    style Prerender fill:#fff3cd,stroke:#f0ad4e
    style SN1 fill:#d5f5e3,stroke:#27ae60
```

### RSC Payload là gì?

**RSC Payload** (React Server Component Payload) là định dạng dữ liệu nhị phân đặc biệt, chứa:

1. **Kết quả render** của các Server Components
2. **Placeholder** — nơi mà Client Components sẽ được render, kèm reference đến file JavaScript
3. **Props** được truyền từ Server Component sang Client Component

:::tip Tại sao không gửi HTML thô?
RSC Payload hiệu quả hơn HTML vì React biết chính xác cần update phần nào của DOM — không cần re-render toàn bộ trang khi navigate.
:::

### Hydration là gì?

**Hydration** là quá trình React "gắn" event handlers vào HTML tĩnh đã có sẵn, biến trang web từ tĩnh sang tương tác được.

```
HTML tĩnh (hiển thị ngay)
    +
JavaScript (tải sau)
    ↓
Hydration (React "thổi hồn")
    ↓
UI có tương tác (onClick, onChange hoạt động)
```
---

## 🔨 HOW — Làm thế nào để dùng?

### Quy trình render trong Next.js

```mermaid
sequenceDiagram
    autonumber
    actor User as "Người dùng"
    participant Browser as "Trình duyệt"
    participant NextJS as "Next.js Server"
    participant DB as "Database/API"

    User->>Browser: Truy cập URL lần đầu
    Browser->>NextJS: Request trang
    NextJS->>DB: Fetch data (trong Server Component)
    DB-->>NextJS: Trả về data
    NextJS-->>Browser: HTML + RSC Payload
    Note over Browser: 1. Hiển thị HTML ngay (non-interactive)
    Browser->>Browser: Tải JavaScript của Client Components
    Browser->>Browser: Hydration (gắn event handlers)
    Note over Browser: 2. UI trở nên tương tác

    User->>Browser: Click link (điều hướng tiếp theo)
    Browser->>NextJS: Prefetch RSC Payload
    NextJS-->>Browser: RSC Payload (cached)
    Browser->>Browser: Render Client-side (không reload)
    Note over Browser: 3. Điều hướng tức thì
```

### Bước 1: Server Component (mặc định)

> **💡 Đánh giá Ưu điểm của Server Component:**
> - **Fetch data:** Xảy ra trực tiếp trên Server trong quá trình build, tiết kiệm độ trễ so với fetch ở Client. Điều này giảm thiểu thời gian rendering, tăng UX đáng kể.
> - **Bảo mật tuyệt đối:** Hoạt động như một "két sắt". Server Component cho phép truy xuất trực tiếp các data nhạy cảm (như Database tokens, API Keys bí mật) hoặc thực thi logic nghiệp vụ lõi mà không bị "lộ" mã nguồn xuống máy Client.
> - **Tối ưu Caching:** Kết quả render (RSC Payload/HTML tĩnh) có khả năng được cache lại trên Server và dùng chéo cho nhiều người dùng khác nhau → Giảm tải Server vì không cần render lại ở mỗi request.
> - **Bundle Size tí hon:** Trình duyệt từ chối tải mọi thư viện JS khổng lồ chỉ dùng để sinh HTML. Bundle size JS gửi xuống máy Client được vứt bỏ tối đa.
> - **SEO và FCP hoàn hảo:** Tốc độ load trang lần đầu cực nhanh, chỉ số FCP (First Contentful Paint) thấp kỷ lục do người dùng thấy ngay content được server đưa xuống tức khắc. Hỗ trợ mạnh mẽ cho Search Engine Optimization và Social Network Shareability.
> - **Hỗ trợ Streaming:** Thay vì phải chờ server render xong toàn bộ trang mới đổ xuống trình duyệt, Server Components cho phép đổ (stream) dần từng phần UI nhỏ xuống khi nó sẵn sàng.
> 
> 👉 **TÔN CHỈ (Rule of Thumb):** Luôn luôn **ưu tiên dùng Server Component** làm chế độ mặc định khi có thể! Chỉ khi nào component đó cần sự sống/tương tác đặc thù (hooks, rải sự kiện DOM,...) thì mới dùng Client Component.


Layouts và Pages trong App Router **mặc định là Server Components**. Bạn không cần làm gì thêm:

```typescript
// filename: app/posts/[id]/page.tsx

// ✅ Đây là Server Component — không cần 'use client'
// Lấy data trực tiếp từ DB, không cần fetch qua API route
import LikeButton from '@/app/ui/like-button'
import { getPost } from '@/lib/data'

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // Gọi async trực tiếp — chỉ Server Components mới làm được điều này
  const post = await getPost(id)

  return (
    <div>
      <main>
        <h1>{post.title}</h1>
        {/* LikeButton cần tương tác → Client Component */}
        <LikeButton likes={post.likes} />
      </main>
    </div>
  )
}
```

### Bước 2: Tạo Client Component
**Next.js Client Component (Được Prerender)**
Tên là "Client" nhưng trong Next.js, **mặc định tất cả component đều được render sẵn thành HTML tĩnh** (kể cả Server lẫn Client Component) tại thời điểm build hoặc request (Static/Dynamic Rendering trên server).
- **Quá trình:** Server trả về nguyên một bảng HTML đã có đầy đủ nội dung (Prerendered). Trình duyệt hiển thị nội dung đó ngay lập tức. Cùng lúc, đoạn JS chứa logic của Client Component mới được tải về để chạy lại vòng đời React (Hydration) nhằm đồng bộ state, effect, và gắn sự kiện.

> **💡 Nhận định:**
> - **Render tối thiểu 2 lần:** Bất kỳ Client Component nào trong Next.js đều trải qua **ít nhất 2 lần render**: 1 lần mộc (trên Server/Build) để lấy giao diện HTML tĩnh, và 1+ lần (trên Client) để bơm tương tác.
> - **Tăng UX ban đầu:** Người dùng thấy nội dung ngay lập tức nhờ HTML có sẵn.
> - **Độ trễ tương tác (Interaction Delay):** Dù nhìn thấy nút bấm ngay, nhưng người dùng **không thể tương tác ngay** cho đến khi trình duyệt tải xong JS và hoàn tất quá trình Hydration.

#### Đánh giá Ưu / Nhược điểm của Client Component

**✅ Ưu điểm:**
- **Sức mạnh tương tác:** Giữ nguyên toàn bộ sức mạnh của React (`useState`, `useEffect`, event listeners) và các API của trình duyệt (Window, LocalStorage).
- **Giảm gánh nặng cho Server:** Mặc dù được prerender bề mặt, nhưng nếu một component có logic tính toán cực kỳ phức tạp thì việc xử lý event/state phía Client sẽ giúp tận dụng CPU thiết bị của người dùng, làm Server "nhẹ gánh" hơn.

**❌ Nhược điểm:**
- **Ảnh hưởng SEO:** Các nội dung **chỉ xuất hiện sau khi gọi API ở phía client** (ví dụ fetch data trong `useEffect`) sẽ không có mặt trong file HTML ban đầu, làm Bot Google khó đọc.
- **Tăng Bundle Size:** Càng nhiều Client Component, lượng Javascript dính kèm gửi xuống trình duyệt càng lớn, làm chậm thời gian tải trang.
- **Phụ thuộc thiết bị người dùng:** Nếu thiết bị của người dùng (điện thoại cũ) yếu, quá trình tải và chạy đống JS khổng lồ để Hydrate sẽ bị treo máy, lag cục bộ.

Thêm `'use client'` ở **đầu file**, trước tất cả import:

```typescript
// filename: app/ui/like-button.tsx

// ✅ Dòng này khai báo đây là Client Component
// Từ dòng này xuống, tất cả imports và child components đều là "client"
'use client'

import { useState } from 'react'

export default function LikeButton({ likes }: { likes: number }) {
  // useState chỉ dùng được trong Client Component
  const [count, setCount] = useState(likes)

  return (
    <div>
      <p>{count} likes</p>
      {/* onClick — event handler, chỉ hoạt động trên client */}
      <button onClick={() => setCount(count + 1)}>
        ❤️ Thích
      </button>
    </div>
  )
}
```

:::tip Một lần khai báo, áp dụng cho toàn bộ cây
Khi file được đánh dấu `'use client'`, **tất cả imports và child components** trong file đó đều tự động trở thành client. Bạn không cần thêm `'use client'` vào từng file con.
:::

### Bước 3: Thu nhỏ JS Bundle — chỉ dùng 'use client' khi cần

❌ **Sai — đánh dấu cả Layout là Client:**

```typescript
// filename: app/layout.tsx
'use client' // ← Không cần! Layout chủ yếu là static

import Search from './search'
import Logo from './logo'

// Bây giờ toàn bộ layout (kể cả Logo tĩnh) bị kéo vào client bundle!
export default function Layout({ children }) {
  return (
    <>
      <nav>
        <Logo />
        <Search />
      </nav>
      <main>{children}</main>
    </>
  )
}
```

✅ **Đúng — chỉ đánh dấu phần cần tương tác:**

```typescript
// filename: app/layout.tsx
// Layout là Server Component — không có 'use client'
import Search from './search' // Client Component
import Logo from './logo'     // Server Component

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav>
        <Logo />   {/* Render on server, chỉ gửi HTML */}
        <Search /> {/* Chỉ phần này thêm vào JS bundle */}
      </nav>
      <main>{children}</main>
    </>
  )
}
```

```typescript
// filename: app/search.tsx
'use client' // ← Chỉ Search cần tương tác (ví dụ: debounce input)
export default function Search() {
  // ...
}
```

### Bước 4: Truyền data từ Server xuống Client

```typescript
// filename: app/ui/like-button.tsx
'use client'
export default function LikeButton({ likes }: { likes: number }) {
  // Nhận data qua props từ Server Component
  // ⚠️ Props phải "serializable" — không thể truyền Function, Date object, v.v.
}
```

Ngoài props, bạn cũng có thể **stream data** bằng [`use` API](https://react.dev/reference/react/use) — xem thêm trong bài Fetching Data.

### Bước 5: Interleaving — Kết hợp Server trong Client

**Vấn đề:** Client Component không thể import Server Component bên trong (vì Client bundle không biết về server):

```typescript
// ❌ KHÔNG LÀM VẬY — sẽ gây lỗi hoặc component bị chạy sai
'use client'
import ServerComponent from './server-component' // ← Bị kéo vào client bundle!
```

**Giải pháp:** Truyền Server Component qua `children` prop:

```typescript
// filename: app/ui/modal.tsx
'use client'
import { useState } from 'react'

export default function Modal({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      {/* children có thể là Server Component — React xử lý đúng */}
      {isOpen && <div>{children}</div>}
    </div>
  )
}
```

```typescript
// filename: app/page.tsx (Server Component)
import Modal from './ui/modal'
import Cart from './ui/cart' // Server Component lấy data từ DB

export default function Page() {
  return (
    // Modal (Client) bọc ngoài Cart (Server) — hoàn toàn hợp lệ!
    <Modal>
      <Cart />
    </Modal>
  )
}
```

```mermaid
graph TD
    Page["Page<br>(Server Component)"] --> Modal["Modal<br>(Client Component)"]
    Page --> Cart["Cart<br>(Server Component)"]
    Modal --> children["children slot"]
    Cart --> children

    style Page fill:#e8f4fd,stroke:#1a73e8
    style Modal fill:#fef9e7,stroke:#f39c12
    style Cart fill:#e8f4fd,stroke:#1a73e8
    style children fill:#d5f5e3,stroke:#27ae60
```

### Bước 6: Context Provider trong Server Component

React Context **không hoạt động trong Server Components**. Đây là cách đúng để setup theme/auth provider:

```typescript
// filename: app/theme-provider.tsx
'use client' // ← Provider phải là Client Component

import { createContext, useContext } from 'react'

export const ThemeContext = createContext({})

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  // Wrap children, cho phép mọi Client Component con đều dùng được context
  return (
    <ThemeContext.Provider value="dark">
      {children}
    </ThemeContext.Provider>
  )
}
```

```typescript
// filename: app/layout.tsx (Server Component)
import ThemeProvider from './theme-provider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        {/* Đặt Provider càng sâu càng tốt — tránh bọc toàn bộ <html> */}
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### Bước 7: Third-party Components không có 'use client'

Nhiều thư viện npm chưa thêm `'use client'` vào components của họ. Cách xử lý:

```typescript
// filename: app/ui/carousel.tsx

// ✅ Tạo wrapper Client Component để bọc third-party component
'use client'

// acme-carousel dùng useState bên trong nhưng không có 'use client'
// → Phải wrap trong Client Component của mình
import { Carousel } from 'acme-carousel'

// Re-export với 'use client' được đặt đúng chỗ
export default Carousel
```

```typescript
// filename: app/page.tsx (Server Component)
// Giờ có thể dùng bình thường vì đã wrap
import Carousel from './ui/carousel'

export default function Page() {
  return (
    <div>
      <p>Xem ảnh sản phẩm</p>
      <Carousel /> {/* ✅ Hoạt động vì đã được wrap */}
    </div>
  )
}
```

---

## 🚀 WHAT IF — Khi nào dùng, khi nào không?

### Bảng quyết định nhanh

| Bạn cần... | Dùng loại nào? | Lý do |
|---|---|---|
| Lấy data từ database | ✅ Server Component | Không lộ DB credentials |
| `useState`, `useReducer` | ✅ Client Component | Chỉ hoạt động trên browser |
| `useEffect`, lifecycle | ✅ Client Component | Side effects cần browser |
| `onClick`, `onChange` | ✅ Client Component | Event handlers cần DOM |
| `localStorage`, `window` | ✅ Client Component | Browser-only API |
| Dùng API keys bí mật | ✅ Server Component | Không bao giờ lộ ra client |
| SEO-critical content | ✅ Server Component | HTML được render sẵn |
| Real-time updates (WebSocket) | ✅ Client Component | Cần kết nối duy trì |
| Phần UI hoàn toàn tĩnh | ✅ Server Component | Giảm JS bundle |

### ⚠️ Pitfalls hay gặp

#### Pitfall 1: Environment Poisoning — Leak secrets lên client

```typescript
// filename: lib/data.ts
// ❌ Nguy hiểm: getData() có thể bị import vào Client Component
export async function getData() {
  const res = await fetch('https://api.example.com/data', {
    headers: {
      // API_KEY sẽ bị thay thành chuỗi rỗng "" khi chạy trên client
      // nhưng logic fetch vẫn bị lộ ra!
      authorization: process.env.API_KEY,
    },
  })
  return res.json()
}
```

✅ **Giải pháp: Dùng package `server-only`**

```bash
npm install server-only
```

```typescript
// filename: lib/data.ts
// Dòng này tạo lỗi BUILD-TIME nếu ai đó import file này vào Client Component
import 'server-only'

export async function getData() {
  const res = await fetch('https://api.example.com/data', {
    headers: {
      authorization: process.env.API_KEY, // ✅ Chỉ chạy trên server
    },
  })
  return res.json()
}
```

Tương tự, dùng `client-only` để đánh dấu code chỉ dành cho browser:

```typescript
// filename: lib/browser-utils.ts
import 'client-only' // ← Lỗi build nếu import vào Server Component

export function getScrollPosition() {
  return window.scrollY // Chỉ có trên browser
}
```

#### Pitfall 2: Truyền non-serializable props qua Network Boundary

```typescript
// ❌ Sai — Function không thể serialize
<ClientComponent onClick={() => console.log('click')} />

// ❌ Sai — Date object không thể serialize
<ClientComponent date={new Date()} />

// ✅ Đúng — Truyền string/number/plain object
<ClientComponent dateString={new Date().toISOString()} />
```

#### Pitfall 3: Đặt 'use client' sai chỗ

```typescript
// ❌ Sai — 'use client' phải ở TRÊN CÙNG, trước tất cả import
import { useState } from 'react'
'use client' // ← Không có tác dụng khi đặt đây!

// ✅ Đúng — Dòng đầu tiên của file
'use client'
import { useState } from 'react'
```

#### Pitfall 4: Nhầm lẫn 'use client' và 'use server'

| Directive | Dùng khi nào |
|---|---|
| `'use client'` | Đánh dấu file/component chạy trên browser |
| `'use server'` | Đánh dấu **Server Action** (function chạy trên server, được gọi từ client) |

---

## 🧠 Tổng kết — MECE Mindmap

```mermaid
mindmap
  root((Server vs Client<br>Components))
    WHY["❓ WHY"]
      perf["Hiệu năng - giảm JS bundle"]
      security["Bảo mật - giữ secrets trên server"]
      ux["UX - hiển thị nhanh với HTML sẵn"]
    WHAT["📖 WHAT"]
      networkBoundary["Network Boundary (Biên mạng)"]
      sc["Server Component"]
        async["Async - fetch data trực tiếp"]
        rsc["Output: RSC Payload"]
      cc["Client Component"]
        directive["'use client' directive"]
        hydration["Hydration - gắn event handlers"]
    HOW["🔨 HOW"]
      default["Mặc định là Server"]
      useClient["Thêm 'use client' khi cần"]
      interleave["Interleave qua children prop"]
      serverOnly["server-only package"]
    WHATIF["🚀 WHAT IF"]
      useServer["Khi nào dùng Server"]
      useClient2["Khi nào dùng Client"]
      pitfalls["Pitfalls"]
        poison["Environment poisoning"]
        serialize["Non-serializable props"]
        order["Sai vị trí directive"]
```

---

## 📚 Tài nguyên

- [Next.js Docs: Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [React Docs: Server Components](https://react.dev/reference/rsc/server-components)
- [React 19.2 Release Notes](https://react.dev/blog/2025/10/01/react-19-2) — `<Activity />`, `cacheSignal`
- [npm: server-only](https://www.npmjs.com/package/server-only)
- [npm: client-only](https://www.npmjs.com/package/client-only)

---

*Made by Anh Tu - Share to be share*
